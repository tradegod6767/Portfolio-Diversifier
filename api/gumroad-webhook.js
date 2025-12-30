import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

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

// Email templates
const emailTemplates = {
  proUpgrade: (email, userName) => ({
    from: 'RebalanceKit <hello@rebalancekit.com>',
    to: email,
    subject: 'Welcome to RebalanceKit Pro! 🎉',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to RebalanceKit Pro</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255,255,255,0.2); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 16px;">
                <span style="font-size: 40px;">⭐</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Welcome to Pro!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 18px;">Your upgrade is active</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hi${userName ? ` ${userName}` : ''},</p>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">Thank you for upgrading to RebalanceKit Pro! Your subscription is now active and you have full access to all premium features.</p>
              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">✨ What You Now Have Access To:</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">Tax Impact Estimates</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">See estimated capital gains before you rebalance</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">PDF Report Generation</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">Export professional reports with charts and analysis</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">Portfolio Health Scoring</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">Track your portfolio's overall health and risk level</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">Model Portfolio Comparison</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">Compare your allocation to popular strategies</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">Unlimited Portfolios</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">Save and manage multiple portfolios</p>
                  </td>
                </tr>
              </table>
              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">🚀 Next Steps:</h3>
              <ol style="margin: 0 0 24px 0; padding-left: 24px; color: #475569; font-size: 16px; line-height: 1.8;">
                <li>Sign in to your account</li>
                <li>Try the portfolio calculator</li>
                <li>Explore the tax impact estimates</li>
                <li>Export your first PDF report</li>
              </ol>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rebalancekit.com" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Start Using Pro Features</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">Need help? Just reply to this email and we'll assist you.</p>
              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">Cheers,<br><strong>The RebalanceKit Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">RebalanceKit Pro - $9.99/month</p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">Manage your subscription at <a href="https://gumroad.com/library" style="color: #10b981; text-decoration: none;">Gumroad</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  subscriptionCancelled: (email, userName, accessEnds) => ({
    from: 'RebalanceKit <hello@rebalancekit.com>',
    to: email,
    subject: 'Your RebalanceKit Pro subscription has been cancelled',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #0f172a; padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Subscription Cancelled</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hi${userName ? ` ${userName}` : ''},</p>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">We've received confirmation that your RebalanceKit Pro subscription has been cancelled.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
                      <strong>Your Pro access has ended</strong><br>
                      ${accessEnds || 'Your subscription is now inactive'}
                    </p>
                  </td>
                </tr>
              </table>
              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">What This Means:</h3>
              <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #475569; font-size: 16px; line-height: 1.8;">
                <li>You've switched to the free plan</li>
                <li>All your saved portfolios are preserved</li>
                <li>You can resubscribe anytime to regain Pro access</li>
              </ul>
              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">Free Plan Includes:</h3>
              <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #475569; font-size: 16px; line-height: 1.8;">
                <li>Portfolio rebalancing calculator</li>
                <li>AI-powered analysis</li>
                <li>Interactive charts</li>
                <li>Tax-efficient "Add Only" mode</li>
                <li>Save up to 3 portfolios</li>
              </ul>
              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">Want to Resubscribe?</h3>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">You can resubscribe anytime to regain access to all Pro features:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rebalancekit.gumroad.com/l/fvdfk?email=${encodeURIComponent(email)}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Resubscribe to Pro</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">We're sorry to see you go! If there's anything we could improve, please let us know by replying to this email.</p>
              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The RebalanceKit Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">RebalanceKit - Tax-Smart Portfolio Rebalancing</p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">Questions? Reply to this email or visit <a href="https://rebalancekit.com" style="color: #10b981; text-decoration: none;">rebalancekit.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
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
      default:
        console.warn(`[Gumroad Webhook] Unknown email type: ${type}`)
        return { success: false, error: 'Unknown email type' }
    }

    const { data, error } = await resend.emails.send(emailData)

    if (error) {
      console.error('[Gumroad Webhook] Email send error:', error)
      return { success: false, error: error.message }
    }

    console.log(`[Gumroad Webhook] ✅ Email sent (${type}) to ${email}:`, data.id)
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error('[Gumroad Webhook] Email send exception:', error)
    return { success: false, error: error.message }
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

        // Send Pro upgrade email
        await sendEmail('proUpgrade', email, user.email?.split('@')[0])

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

        // Send cancellation email
        await sendEmail('subscriptionCancelled', email, user.email?.split('@')[0])

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
