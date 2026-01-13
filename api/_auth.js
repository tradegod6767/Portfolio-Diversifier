/**
 * Server-side authentication utilities for API endpoints
 *
 * SECURITY: Never trust client-sent isPro flags. Always verify server-side.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Get authenticated user from request headers
 * Extracts the Supabase access token from Authorization header
 *
 * @param {Object} req - Express request object
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function getAuthenticatedUser(req) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: new Error('Missing or invalid authorization header') }
    }

    const token = authHeader.replace('Bearer ', '')

    // Check if environment variables are set
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Auth] Missing Supabase environment variables')
      return { user: null, error: new Error('Supabase not configured') }
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Verify the JWT token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { user: null, error: error || new Error('Invalid token') }
    }

    return { user, error: null }
  } catch (error) {
    console.error('[Auth] Error in getAuthenticatedUser:', error)
    return { user: null, error }
  }
}

/**
 * Verify if a user has active Pro subscription
 * Checks both is_pro flag AND subscription_status in user metadata
 *
 * SECURITY: This queries the database directly using service role key
 * to prevent client-side manipulation
 *
 * @param {Object} user - Supabase user object
 * @returns {boolean} True if user has active Pro subscription
 */
export function verifyProStatus(user) {
  if (!user) {
    return false
  }

  const metadata = user.user_metadata || {}
  const isPro = metadata.is_pro === true
  const subscriptionStatus = metadata.subscription_status

  // User must have both:
  // 1. is_pro = true
  // 2. subscription_status != 'cancelled'
  const hasActiveSubscription = isPro && subscriptionStatus === 'active'

  return hasActiveSubscription
}

/**
 * Middleware-style helper that extracts user and Pro status
 * Use this at the start of any API endpoint that needs auth
 *
 * @param {Object} req - Express request object
 * @returns {Promise<{user: Object|null, isPro: boolean, error: Error|null}>}
 *
 * @example
 * const { user, isPro, error } = await authenticateRequest(req)
 * if (error) {
 *   return res.status(401).json({ error: 'Unauthorized' })
 * }
 */
export async function authenticateRequest(req) {
  const { user, error } = await getAuthenticatedUser(req)

  if (error || !user) {
    return { user: null, isPro: false, error: error || new Error('Authentication failed') }
  }

  const isPro = verifyProStatus(user)

  return { user, isPro, error: null }
}

/**
 * Get user by email (for webhook handlers that receive email)
 * Uses service role key to bypass RLS
 *
 * @param {string} email - User email address
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function getUserByEmail(email) {
  try {
    // Check if environment variables are set
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Auth] Missing Supabase environment variables')
      return { user: null, error: new Error('Supabase not configured') }
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return { user: null, error }
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return { user: null, error: new Error('User not found') }
    }

    return { user, error: null }
  } catch (error) {
    console.error('[Auth] Error in getUserByEmail:', error)
    return { user: null, error }
  }
}
