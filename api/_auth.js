/**
 * Server-side authentication utilities for API endpoints
 *
 * SECURITY: Never trust client-sent isPro flags. Always verify server-side.
 */

import { createClient } from '@supabase/supabase-js'

// Service-role admin client — used for all server-side DB operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

    // Verify the JWT token and get user
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

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
 * Queries the user_subscriptions table via service role client.
 *
 * SECURITY: This queries the database directly using service role key
 * to prevent client-side manipulation
 *
 * @param {string} userId - Supabase user ID
 * @returns {Promise<{isPro: boolean, subscriptionStatus: string}>}
 */
export async function verifyProStatus(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('is_pro, subscription_status')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { isPro: false, subscriptionStatus: 'free' };
  }

  return {
    isPro: data.is_pro === true && data.subscription_status === 'active',
    subscriptionStatus: data.subscription_status || 'free',
  };
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

  const { isPro } = await verifyProStatus(user.id)

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
    // Direct O(1) lookup via service role query on auth.users
    // This avoids paginating through all users (was O(n) with perPage=50)
    try {
      const { data, error } = await supabaseAdmin
        .from('auth.users')
        .select('id, email, user_metadata, raw_app_meta_data')
        .eq('email', email.toLowerCase())
        .single()

      if (!error && data) {
        return { user: data, error: null }
      }
    } catch (e) {
      // Fall through to paginated fallback
    }

    // Fallback: paginate with large page size and early exit once found
    let page = 1
    const perPage = 1000

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })

      if (error) {
        return { user: null, error }
      }

      const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
      if (user) return { user, error: null }

      // No more pages to search
      if (data.users.length < perPage) break
      page++
    }

    return { user: null, error: new Error('User not found') }
  } catch (error) {
    console.error('[Auth] Error in getUserByEmail:', error)
    return { user: null, error }
  }
}
