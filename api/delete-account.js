import { createClient } from '@supabase/supabase-js'
import { handleCors } from './_cors.js'
import { authenticateRequest } from './_auth.js'
import { Sentry } from './_sentry.js'

export default async function handler(req, res) {
  if (handleCors(req, res, { methods: ['DELETE', 'OPTIONS'] })) return

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Authenticate — requires a valid Bearer token
  const { user, error: authError } = await authenticateRequest(req)

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Delete Account] Missing Supabase environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. Delete all saved portfolios for this user
    const { error: portfoliosError } = await supabase
      .from('portfolios')
      .delete()
      .eq('user_id', user.id)

    if (portfoliosError) {
      console.error('[Delete Account] Failed to delete portfolios:', portfoliosError.message)
      return res.status(500).json({ error: 'Failed to delete portfolio data' })
    }

    // 2. Delete subscription record for this user
    const { error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', user.id)

    if (subscriptionsError) {
      console.error('[Delete Account] Failed to delete subscription:', subscriptionsError.message)
      return res.status(500).json({ error: 'Failed to delete subscription data' })
    }

    // 3. Delete the user from Supabase Auth (must be last — invalidates the token)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('[Delete Account] Failed to delete auth user:', deleteUserError.message)
      return res.status(500).json({ error: 'Failed to delete account' })
    }

    console.log('[Delete Account] Successfully deleted account for user:', user.id)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('[Delete Account] Unexpected error:', error.message)
    Sentry.captureException(error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
}
