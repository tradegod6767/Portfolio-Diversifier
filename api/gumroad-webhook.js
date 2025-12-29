import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Log webhook event to Supabase for debugging
async function logWebhookEvent(email, eventType, data) {
  try {
    await supabase.from('webhook_logs').insert({
      email,
      event_type: eventType,
      payload: data,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log webhook event:', error)
  }
}

export default async function handler(req, res) {
  console.log('[Gumroad Webhook] Received request')

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = req.body
    console.log('[Gumroad Webhook] Payload received:', JSON.stringify(payload, null, 2))

    // Extract data from Gumroad webhook
    const {
      email,
      sale_id,
      subscription_id,
      product_name,
      // Gumroad sends different event types in different formats
      // Check for the event field or infer from the data
    } = payload

    if (!email) {
      console.error('[Gumroad Webhook] No email provided')
      return res.status(400).json({ error: 'No email provided' })
    }

    // Determine event type from payload
    let eventType = 'sale' // default

    // Gumroad sends different fields for different events
    if (payload.cancelled === true || payload.cancelled === 'true') {
      eventType = 'subscription_cancelled'
    } else if (payload.ended === true || payload.ended === 'true') {
      eventType = 'subscription_ended'
    } else if (payload.refunded === true || payload.refunded === 'true') {
      eventType = 'sale_refunded'
    } else if (payload.subscription_id || subscription_id) {
      eventType = 'subscription_created'
    }

    console.log(`[Gumroad Webhook] Event type: ${eventType}`)

    // Log the event
    await logWebhookEvent(email, eventType, payload)

    // Get user from Supabase Auth by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('[Gumroad Webhook] Error listing users:', listError)
      return res.status(500).json({ error: 'Failed to find user' })
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      console.log(`[Gumroad Webhook] User not found: ${email}`)
      // Still return 200 to acknowledge receipt
      return res.status(200).json({ message: 'User not found, event logged' })
    }

    console.log(`[Gumroad Webhook] Found user: ${user.id}`)

    // Handle different event types
    switch (eventType) {
      case 'subscription_created':
      case 'sale':
        // Activate Pro subscription
        const { error: activateError } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              is_pro: true,
              subscription_status: 'active',
              gumroad_subscription_id: subscription_id || sale_id,
              subscribed_at: new Date().toISOString(),
              cancelled_at: null,
              product_name: product_name || 'Pro Subscription'
            }
          }
        )

        if (activateError) {
          console.error('[Gumroad Webhook] Error activating subscription:', activateError)
          return res.status(500).json({ error: 'Failed to activate subscription' })
        }

        console.log(`[Gumroad Webhook] ✅ Subscription activated for ${email}`)
        return res.status(200).json({
          success: true,
          userId: user.id,
          action: 'subscription_activated'
        })

      case 'subscription_cancelled':
      case 'subscription_ended':
      case 'sale_refunded':
        // Revoke Pro access
        const { error: revokeError } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              is_pro: false,
              subscription_status: 'cancelled',
              gumroad_subscription_id: subscription_id || sale_id,
              cancelled_at: new Date().toISOString(),
              cancellation_reason: eventType
            }
          }
        )

        if (revokeError) {
          console.error('[Gumroad Webhook] Error revoking subscription:', revokeError)
          return res.status(500).json({ error: 'Failed to revoke subscription' })
        }

        console.log(`[Gumroad Webhook] ✅ Subscription revoked for ${email} (reason: ${eventType})`)
        return res.status(200).json({
          success: true,
          userId: user.id,
          action: 'subscription_revoked',
          reason: eventType
        })

      default:
        console.log(`[Gumroad Webhook] Unknown event type: ${eventType}, logging only`)
        return res.status(200).json({
          success: true,
          action: 'logged_only',
          eventType
        })
    }

  } catch (error) {
    console.error('[Gumroad Webhook] Error:', error)
    // Still return 200 to prevent Gumroad from retrying
    // But log the error
    return res.status(200).json({
      error: error.message,
      logged: true
    })
  }
}
