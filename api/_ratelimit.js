/**
 * Rate limiting middleware for API endpoints
 *
 * SECURITY: Prevents abuse and cost overruns by limiting request frequency
 * Uses Upstash Redis for distributed rate limiting across serverless functions
 *
 * SETUP REQUIRED:
 * 1. Create a free Upstash Redis database at https://upstash.com
 * 2. Add to your .env file:
 *    UPSTASH_REDIS_REST_URL=your_redis_url
 *    UPSTASH_REDIS_REST_TOKEN=your_redis_token
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client (lazy-loaded)
let redis = null
function getRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

/**
 * Rate limit configurations for different endpoint types
 */
export const RateLimitTiers = {
  // AI endpoints - very expensive, strict limits
  AI_ANONYMOUS: {
    requests: 5,       // 5 requests
    window: '1 h',     // per hour
    description: 'AI endpoint (anonymous user)'
  },
  AI_AUTHENTICATED: {
    requests: 20,      // 20 requests
    window: '1 h',     // per hour
    description: 'AI endpoint (authenticated user)'
  },
  AI_PRO: {
    requests: 100,     // 100 requests
    window: '1 h',     // per hour
    description: 'AI endpoint (Pro subscriber)'
  },

  // Payment endpoints - moderate limits
  PAYMENT: {
    requests: 10,      // 10 requests
    window: '1 h',     // per hour
    description: 'Payment endpoint'
  },

  // Email endpoints - prevent spam
  EMAIL: {
    requests: 5,       // 5 emails
    window: '1 h',     // per hour
    description: 'Email endpoint'
  },

  // Webhook endpoints - high limits for legitimate services
  WEBHOOK: {
    requests: 100,     // 100 requests
    window: '1 h',     // per hour
    description: 'Webhook endpoint'
  },

  // General API endpoints
  GENERAL_ANONYMOUS: {
    requests: 50,      // 50 requests
    window: '1 h',     // per hour
    description: 'General endpoint (anonymous user)'
  },
  GENERAL_AUTHENTICATED: {
    requests: 200,     // 200 requests
    window: '1 h',     // per hour
    description: 'General endpoint (authenticated user)'
  },
}

/**
 * Create a rate limiter instance for a specific tier
 */
function createRateLimiter(tier) {
  const redis = getRedis()

  if (!redis) {
    console.warn('[Rate Limit] Redis not configured - rate limiting disabled')
    return null
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tier.requests, tier.window),
    analytics: true,
    prefix: '@ratelimit',
  })
}

// Cache rate limiter instances
const rateLimiters = {}
function getRateLimiter(tier) {
  const key = JSON.stringify(tier)
  if (!rateLimiters[key]) {
    rateLimiters[key] = createRateLimiter(tier)
  }
  return rateLimiters[key]
}

/**
 * Get identifier for rate limiting (IP or user ID)
 */
function getIdentifier(req, user = null) {
  // Use user ID for authenticated users
  if (user?.id) {
    return `user:${user.id}`
  }

  // Use IP address for anonymous users
  // Check common headers for IP (Vercel, CloudFlare, etc.)
  const ip =
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  return `ip:${ip}`
}

/**
 * Select appropriate rate limit tier based on user authentication and Pro status
 */
export function selectRateLimitTier(endpointType, user = null, isPro = false) {
  switch (endpointType) {
    case 'AI':
      if (isPro) return RateLimitTiers.AI_PRO
      if (user) return RateLimitTiers.AI_AUTHENTICATED
      return RateLimitTiers.AI_ANONYMOUS

    case 'PAYMENT':
      return RateLimitTiers.PAYMENT

    case 'EMAIL':
      return RateLimitTiers.EMAIL

    case 'WEBHOOK':
      return RateLimitTiers.WEBHOOK

    case 'GENERAL':
    default:
      if (user) return RateLimitTiers.GENERAL_AUTHENTICATED
      return RateLimitTiers.GENERAL_ANONYMOUS
  }
}

/**
 * Apply rate limiting to a request
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} options - Rate limiting options
 * @param {string} options.tier - Rate limit tier (from RateLimitTiers)
 * @param {Object} options.user - User object (optional, from auth middleware)
 * @param {boolean} options.isPro - Whether user is Pro subscriber (optional)
 * @param {string} options.endpointType - Endpoint type: 'AI', 'PAYMENT', 'EMAIL', 'WEBHOOK', 'GENERAL'
 * @returns {Promise<{success: boolean, limit: number, remaining: number, reset: Date}>}
 *
 * @example
 * // In your API handler:
 * const rateLimitResult = await checkRateLimit(req, res, {
 *   endpointType: 'AI',
 *   user: user,
 *   isPro: isPro
 * })
 *
 * if (!rateLimitResult.success) {
 *   return // Response already sent
 * }
 */
export async function checkRateLimit(req, res, options = {}) {
  const {
    user = null,
    isPro = false,
    endpointType = 'GENERAL',
    tier = null,
  } = options

  try {
    // Select appropriate tier
    const selectedTier = tier || selectRateLimitTier(endpointType, user, isPro)

    // Get rate limiter
    const rateLimiter = getRateLimiter(selectedTier)

    // If Redis is not configured, allow all requests through with a warning.
    // Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel to enable rate limiting.
    if (!rateLimiter) {
      console.warn('[Rate Limit] Redis not configured - rate limiting disabled for', endpointType)
      return {
        success: true,
        limit: selectedTier.requests,
        remaining: selectedTier.requests,
        reset: new Date(Date.now() + 3600000),
        bypassed: true
      }
    }

    // Get identifier (user ID or IP)
    const identifier = getIdentifier(req, user)

    // Check rate limit
    const { success, limit, remaining, reset } = await rateLimiter.limit(identifier)

    // Set rate limit headers (following standard conventions)
    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', reset)

    if (!success) {
      // Rate limit exceeded
      console.warn('[Rate Limit] Limit exceeded:', {
        identifier,
        tier: selectedTier.description,
        limit,
        reset: new Date(reset)
      })

      const resetDate = new Date(reset)
      const resetMinutes = Math.ceil((resetDate - new Date()) / 60000)

      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${resetMinutes} minute${resetMinutes !== 1 ? 's' : ''}.`,
        limit: limit,
        remaining: 0,
        resetAt: resetDate.toISOString(),
        retryAfter: resetMinutes * 60, // seconds
      })

      return { success: false }
    }

    // Rate limit check passed
    if (process.env.DEBUG_RATE_LIMIT) {
      console.log('[Rate Limit] Check passed:', {
        identifier,
        tier: selectedTier.description,
        remaining: `${remaining}/${limit}`,
        reset: new Date(reset)
      })
    }

    return {
      success: true,
      limit,
      remaining,
      reset: new Date(reset)
    }

  } catch (error) {
    // SECURITY: Rate limiting is the cost-control guardrail on a paid endpoint.
    // If the limiter backend (Upstash Redis) is unreachable we FAIL CLOSED and
    // deny the request, rather than letting unlimited unmetered calls through.
    // error.cause carries the underlying transport reason (DNS/connection/TLS
    // failure) that error.message ("fetch failed") alone hides — log both so a
    // future outage is diagnosable immediately.
    console.error(
      '[Rate Limit] Backend error - failing closed, denying request:',
      error.message,
      error.cause ?? ''
    )

    if (!res.headersSent) {
      res.setHeader('Retry-After', '30')
      res.status(503).json({
        error: 'Rate limiter unavailable',
        message: 'Service temporarily unavailable. Please try again in a moment.',
        retryAfter: 30,
      })
    }

    return {
      success: false,
      error: error.message,
      failedClosed: true
    }
  }
}

/**
 * Middleware wrapper for easy integration
 * Use this at the start of your API handlers
 *
 * @example
 * export default async function handler(req, res) {
 *   const { user, isPro } = await authenticateRequest(req)
 *
 *   if (!await applyRateLimit(req, res, { endpointType: 'AI', user, isPro })) {
 *     return // Rate limit exceeded, response already sent
 *   }
 *
 *   // ... your API logic
 * }
 */
export async function applyRateLimit(req, res, options = {}) {
  const result = await checkRateLimit(req, res, options)
  return result.success
}
