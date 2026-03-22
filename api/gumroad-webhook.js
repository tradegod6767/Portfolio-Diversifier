import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'
import { getProUpgradeEmailHtml, getSubscriptionCancelledEmailHtml, getPendingPurchaseEmailHtml } from './_email-templates.js'
import { Sentry } from './_sentry.js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY?.trim())

// Log webhook event to Supabase for debugging
async function logWebhookEvent(email, eventType, data) {
  try {
    await supabaseAdmin.from('webhook_logs').insert({
      email,
      event_type: eventType,
      payload: data,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log webhook event:', error)
  }
}

// Store orphaned purchase in pending_purchases table
async function storePendingPurchase(email, payload) {
  try {
    const { sale_id, subscription_id, product_name, price, currency } = payload

    const { data, error } = await supabaseAdmin
      .from('pending_purchases')
      .insert({
        email: email.toLowerCase(),
        sale_id: sale_id,
        gumroad_subscription_id: subscription_id,
        gumroad_product_id: payload.product_id,
        purchase_data: payload,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('[Gumroad Webhook] Error storing pending purchase:', error)
      return null
    }

    console.log(`[Gumroad Webhook] Stored pending purchase for ${email}:`, data.id)
    return data
  } catch (error) {
    console.error('[Gumroad Webhook] Exception storing pending purchase:', error)
    return null
  }
}

// Email template wrappers — HTML sourced from _email-templates.js
const emailTemplates = {
  pendingPurchase: (email) => ({
    from: 'RebalanceKit <hello@rebalancekit.com>',
    to: email,
    subject: 'Complete your RebalanceKit Pro signup',
    html: getPendingPurchaseEmailHtml(email),
  }),

  proUpgrade: (email, userName) => ({
    from: 'RebalanceKit <hello@rebalancekit.com>',
    to: email,
    subject: 'Welcome to RebalanceKit Pro!',
    html: getProUpgradeEmailHtml(userName),
  }),

  subscriptionCancelled: (email, userName, accessEnds) => ({
    from: 'RebalanceKit <hello@rebalancekit.com>',
    to: email,
    subject: 'Your RebalanceKit Pro subscription has been cancelled',
    html: getSubscriptionCancelledEmailHtml(userName, accessEnds),
  }),
}

// Send email helper function
async function sendEmail(type, email, userName = null, accessEnds = null) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Gumroad Webhook] RESEND_API_KEY not configured - skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    let emailData
    switch (type) {
      case 'proUpgrade':
        emailData = emailTemplates.proUpgrade(email, userName)
        break
      case 'subscriptionCancelled':
        emailData = emailTemplates.subscriptionCancelled(email, userName, accessEnds)
        break
      case 'pendingPurchase':
        emailData = emailTemplates.pendingPurchase(email)
        break
      default:
        console.warn(`[Gumroad Webhook] Unknown email type: ${type}`)
        return { success: false, error: 'Unknown email type' }
    }

    const { data, error } = await resend.emails.send(emailData)

    if (error) {
      console.error('[Gumroad Webhook] Email send error:', error)
      return { success: false, error: error.message }
    }

    console.log(`[Gumroad Webhook] Email sent (${type}) to ${email}:`, data.id)
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error('[Gumroad Webhook] Email send exception:', error)
    return { success: false, error: error.message }
  }
}

export default async function handler(req, res) {
  // SECURITY: Never log req.query or req.url — they contain the webhook secret
  console.log('[Gumroad Webhook] Received request')
  console.log('[Webhook Test Debug]', {
    hasTestBody: req.body?.test,
    testKeyHeader: req.headers['x-test-key']?.slice(0, 8) + '...',
    envKeyExists: !!process.env.WEBHOOK_TEST_KEY,
    envKeyPrefix: process.env.WEBHOOK_TEST_KEY?.slice(0, 8) + '...',
  })

  // Webhooks are server-to-server — no CORS headers needed
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate shared secret with timing-safe comparison
  const expectedSecret = process.env.GUMROAD_WEBHOOK_SECRET
  const testKey = process.env.WEBHOOK_TEST_KEY
  const providedTestKey = req.headers['x-test-key'] || ''
  const isAuthorizedTest =
    req.body?.test === true &&
    testKey &&
    providedTestKey.length === testKey.length &&
    crypto.timingSafeEqual(Buffer.from(providedTestKey), Buffer.from(testKey))

  if (!isAuthorizedTest) {
    if (!expectedSecret) {
      console.error('[Webhook] GUMROAD_WEBHOOK_SECRET not configured')
      return res.status(500).json({ error: 'Server misconfiguration' })
    }

    const providedSecret = req.query.secret || ''
    const expectedBuf = Buffer.from(expectedSecret)
    const providedBuf = Buffer.from(providedSecret)

    if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
      console.error('[Webhook] Invalid secret')
      return res.status(401).json({ error: 'Unauthorized' })
    }
  } else {
    console.warn('[Gumroad Webhook] Authorized test mode — secret check bypassed')
  }

  try {
    const payload = req.body

    // Idempotency check — skip duplicate sale_id events
    const saleId = req.body.sale_id
    if (saleId) {
      const { data: existingLog } = await supabaseAdmin
        .from('webhook_logs')
        .select('id')
        .eq('sale_id', saleId)
        .single()

      if (existingLog) {
        console.log(`[Webhook] Duplicate sale_id: ${saleId}, skipping`)
        return res.status(200).json({ action: 'already_processed', sale_id: saleId })
      }
    }

    // Extract data from Gumroad webhook
    const {
      email,
      sale_id,
      subscription_id,
      product_name,
      product_id,
    } = payload

    if (!email) {
      console.error('[Gumroad Webhook] No email provided')
      return res.status(400).json({ error: 'No email provided' })
    }

    // Determine event type — prefer alert_name (Gumroad's canonical field) over legacy booleans
    let eventType

    const alertName = payload.alert_name

    if (alertName) {
      // Gumroad alert_name values
      switch (alertName) {
        case 'sale':
        case 'subscription_sale':
          eventType = 'sale'
          break
        case 'subscription_cancelled':
          eventType = 'subscription_cancelled'
          break
        case 'subscription_ended':
          eventType = 'subscription_ended'
          break
        case 'subscription_failed':
          eventType = 'subscription_failed'
          break
        case 'subscription_restarted':
          eventType = 'subscription_restarted'
          break
        default:
          eventType = alertName
      }
    } else {
      // Legacy fallback: derive from boolean fields for older webhook formats
      if (payload.cancelled === true || payload.cancelled === 'true') {
        eventType = 'subscription_cancelled'
      } else if (payload.ended === true || payload.ended === 'true') {
        eventType = 'subscription_ended'
      } else if (payload.refunded === true || payload.refunded === 'true') {
        eventType = 'sale_refunded'
      } else if (payload.subscription_id || subscription_id) {
        eventType = 'subscription_created'
      } else {
        eventType = 'sale'
      }
    }

    console.log(`[Gumroad Webhook] Event type: ${eventType}`)

    // Log the event
    await logWebhookEvent(email, eventType, payload)

    // Get user from Supabase Auth by email
    // Use paginated search to handle >50 users
    let user = null
    let page = 1
    const perPage = 50
    let listError = null

    while (!user) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })

      if (error) {
        listError = error
        break
      }

      user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

      // No more pages to search
      if (data.users.length < perPage) break
      page++
    }

    if (listError) {
      console.error('[Gumroad Webhook] Error listing users:', listError)
      return res.status(500).json({ error: 'Failed to find user' })
    }

    if (!user) {
      console.log(`[Gumroad Webhook] User not found: ${email}`)

      // For new purchases/subscriptions, store as pending purchase
      if (eventType === 'subscription_created' || eventType === 'sale') {
        console.log(`[Gumroad Webhook] Storing as pending purchase for: ${email}`)

        const pendingPurchase = await storePendingPurchase(email, payload)

        if (pendingPurchase) {
          // Send email prompting user to create account
          await sendEmail('pendingPurchase', email)

          return res.status(200).json({
            success: true,
            action: 'pending_purchase_stored',
            message: 'Purchase stored. User will get Pro when they sign up.',
            pendingPurchaseId: pendingPurchase.id
          })
        }
      }

      // For cancellations/refunds of non-existent users, just log
      return res.status(200).json({ message: 'User not found, event logged' })
    }

    console.log(`[Gumroad Webhook] Found user: ${user.id}`)

    // Handle different event types
    switch (eventType) {
      case 'subscription_created':
      case 'sale': {
        // Primary: update user_subscriptions table
        const { error: subError } = await supabaseAdmin
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            is_pro: true,
            subscription_status: 'active',
            gumroad_subscription_id: subscription_id || sale_id,
            gumroad_product_id: product_id,
            gumroad_email: email,
          }, { onConflict: 'user_id' })

        if (subError) {
          console.error('[Gumroad Webhook] Error upserting user_subscriptions:', subError)
          return res.status(500).json({ error: 'Failed to activate subscription' })
        }

        // Secondary: backward compat
        await supabaseAdmin.auth.admin.updateUserById(
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

        console.log(`[Gumroad Webhook] Subscription activated for ${email}`)

        // Send Pro upgrade email
        await sendEmail('proUpgrade', email, user.email?.split('@')[0])

        return res.status(200).json({
          success: true,
          userId: user.id,
          action: 'subscription_activated'
        })
      }

      case 'subscription_cancelled':
      case 'subscription_ended':
      case 'subscription_failed':
      case 'sale_refunded': {
        // Primary: update user_subscriptions table
        const { error: subError } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            is_pro: false,
            subscription_status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)

        if (subError) {
          console.error('[Gumroad Webhook] Error updating user_subscriptions:', subError)
          return res.status(500).json({ error: 'Failed to revoke subscription' })
        }

        // Secondary: backward compat
        await supabaseAdmin.auth.admin.updateUserById(
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

        console.log(`[Gumroad Webhook] Subscription revoked for ${email} (reason: ${eventType})`)

        // Send cancellation email
        await sendEmail('subscriptionCancelled', email, user.email?.split('@')[0])

        return res.status(200).json({
          success: true,
          userId: user.id,
          action: 'subscription_revoked',
          reason: eventType
        })
      }

      case 'subscription_restarted': {
        // User reactivated after cancelling — restore Pro access
        const { error: subError } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            is_pro: true,
            subscription_status: 'active',
            cancelled_at: null,
          })
          .eq('user_id', user.id)

        if (subError) {
          console.error('[Gumroad Webhook] Error updating user_subscriptions:', subError)
          return res.status(500).json({ error: 'Failed to reactivate subscription' })
        }

        await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              is_pro: true,
              subscription_status: 'active',
              cancelled_at: null,
            }
          }
        )

        console.log(`[Gumroad Webhook] Subscription reactivated for ${email}`)

        await sendEmail('proUpgrade', email, user.email?.split('@')[0])

        return res.status(200).json({
          success: true,
          userId: user.id,
          action: 'subscription_reactivated'
        })
      }

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
    Sentry.captureException(error)
    // Still return 200 to prevent Gumroad from retrying
    // But log the error
    return res.status(200).json({
      error: error.message,
      logged: true
    })
  }
}
