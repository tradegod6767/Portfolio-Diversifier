import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { handleCors } from './_cors.js'
import { authenticateRequest } from './_auth.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY?.trim())

// Send Pro upgrade email
async function sendProUpgradeEmail(email, userName) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Claim Purchase] RESEND_API_KEY not configured')
    return
  }

  try {
    await resend.emails.send({
      from: 'RebalanceKit <hello@rebalancekit.com>',
      to: email,
      subject: 'Your RebalanceKit Pro is now active!',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Pro Activated!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Hi${userName ? ` ${userName}` : ''},
              </p>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Great news! Your earlier purchase has been linked to your account. You now have full access to all RebalanceKit Pro features!
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rebalancekit.com" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Start Using Pro Features</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px;">
                Cheers,<br><strong>The RebalanceKit Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })
    console.log(`[Claim Purchase] Pro activation email sent to ${email}`)
  } catch (error) {
    console.error('[Claim Purchase] Email error:', error)
  }
}

export default async function handler(req, res) {
  if (handleCors(req, res, { methods: ['POST', 'OPTIONS'] })) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, userId } = req.body

    if (!email || !userId) {
      return res.status(400).json({ error: 'Missing email or userId' })
    }

    // SECURITY: Verify the request comes from an authenticated user
    // and that the userId matches the authenticated user's ID
    const { user: authUser, error: authError } = await authenticateRequest(req)
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    if (authUser.id !== userId) {
      console.warn(`[Claim Purchase] User ID mismatch: token=${authUser.id}, body=${userId}`)
      return res.status(403).json({ error: 'User ID does not match authenticated user' })
    }

    console.log(`[Claim Purchase] Checking for pending purchase: ${email}`)

    // Find pending purchase for this email
    const { data: pendingPurchase, error: findError } = await supabase
      .from('pending_purchases')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine
      console.error('[Claim Purchase] Error finding pending purchase:', findError)
    }

    if (!pendingPurchase) {
      console.log(`[Claim Purchase] No pending purchase found for: ${email}`)
      return res.status(200).json({ found: false })
    }

    console.log(`[Claim Purchase] Found pending purchase: ${pendingPurchase.id}`)

    // Mark pending purchase as claimed
    const { error: updatePendingError } = await supabase
      .from('pending_purchases')
      .update({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        claimed_by_user_id: userId
      })
      .eq('id', pendingPurchase.id)

    if (updatePendingError) {
      console.error('[Claim Purchase] Error updating pending purchase:', updatePendingError)
    }

    // Activate Pro for the user
    const { error: activateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          is_pro: true,
          subscription_status: 'active',
          gumroad_subscription_id: pendingPurchase.gumroad_subscription_id || pendingPurchase.gumroad_sale_id,
          subscribed_at: pendingPurchase.created_at,
          cancelled_at: null,
          product_name: pendingPurchase.product_name || 'Pro Subscription',
          claimed_from_pending: true
        }
      }
    )

    if (activateError) {
      console.error('[Claim Purchase] Error activating Pro:', activateError)
      return res.status(500).json({ error: 'Failed to activate Pro subscription' })
    }

    console.log(`[Claim Purchase] ✅ Pro activated for ${email} (claimed from pending)`)

    // Send confirmation email
    const userName = email.split('@')[0]
    await sendProUpgradeEmail(email, userName)

    return res.status(200).json({
      found: true,
      claimed: true,
      purchaseId: pendingPurchase.id,
      message: 'Pro subscription activated from pending purchase'
    })

  } catch (error) {
    console.error('[Claim Purchase] Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
