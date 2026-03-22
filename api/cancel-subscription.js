import { createClient } from '@supabase/supabase-js'
import { handleCors } from './_cors.js'
import { authenticateRequest } from './_auth.js'
import { Sentry } from './_sentry.js'

export default async function handler(req, res) {
  if (handleCors(req, res, { methods: ['POST', 'OPTIONS'] })) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, error: authError } = await authenticateRequest(req)

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Cancel Subscription] Missing Supabase environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const now = new Date().toISOString()

    // Primary: update user_subscriptions table
    const { error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        is_pro: false,
        subscription_status: 'cancelled',
        cancelled_at: now,
      })
      .eq('user_id', user.id)

    if (subError) console.error('Failed to update user_subscriptions:', subError)

    // Secondary: backward compat
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { is_pro: false, subscription_status: 'cancelled' }
    })

    console.log('[Cancel Subscription] Successfully downgraded user:', user.id)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('[Cancel Subscription] Unexpected error:', error.message)
    Sentry.captureException(error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
}
