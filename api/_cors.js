/**
 * CORS middleware for API endpoints
 *
 * SECURITY: Implements origin whitelist to prevent unauthorized domains
 * from accessing our APIs. Never use wildcard '*' in production.
 */

/**
 * Allowed origins for CORS requests
 * Only these domains can make API calls
 */
const ALLOWED_ORIGINS = [
  'https://rebalancekit.com',
  'https://www.rebalancekit.com',
  'http://localhost:5173',  // Vite dev server
  'http://localhost:5176',  // Alternative dev port
];

/**
 * Apply CORS headers to response
 * Only sets Access-Control-Allow-Origin if the request origin is whitelisted
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} options - CORS options
 * @param {string[]} options.methods - Allowed HTTP methods (default: ['GET', 'POST', 'OPTIONS'])
 * @param {string[]} options.headers - Allowed headers (default: standard set)
 * @param {boolean} options.credentials - Allow credentials (default: true)
 */
export function applyCorsHeaders(req, res, options = {}) {
  const {
    methods = ['GET', 'POST', 'OPTIONS'],
    headers = [
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'X-CSRF-Token',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Date',
      'X-Api-Version',
      'X-Internal-Key'
    ],
    credentials = true
  } = options;

  // Get origin from request
  const origin = req.headers.origin;

  // SECURITY: Only set CORS headers if origin is in whitelist
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);

    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', headers.join(', '));
  } else if (origin) {
    // Log rejected origins for monitoring
    console.warn(`[CORS] Rejected request from unauthorized origin: ${origin}`);
  }
}

/**
 * Handle CORS preflight OPTIONS request
 * Returns true if request was handled (and you should exit), false otherwise
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} True if preflight was handled
 *
 * @example
 * if (handleCorsPreFlight(req, res)) return;
 */
export function handleCorsPreflight(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Complete CORS middleware - applies headers and handles preflight
 * Use this as a one-liner at the start of your API handlers
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} options - CORS options (see applyCorsHeaders)
 * @returns {boolean} True if request was handled (preflight), false if should continue
 *
 * @example
 * export default async function handler(req, res) {
 *   if (handleCors(req, res)) return;
 *   // ... your API logic
 * }
 */
export function handleCors(req, res, options = {}) {
  applyCorsHeaders(req, res, options);
  return handleCorsPreflight(req, res);
}
