import { Resend } from 'resend'
import { handleCors } from './_cors.js'
import { applyRateLimit } from './_ratelimit.js'
import { authenticateRequest } from './_auth.js'
import { getWelcomeEmailHtml, getProUpgradeEmailHtml, getSubscriptionCancelledEmailHtml } from './_email-templates.js'
import { Sentry } from './_sentry.js'

const resend = new Resend(process.env.RESEND_API_KEY?.trim())

// Email template wrappers — HTML sourced from _email-templates.js
const templates = {
  welcome: (email, userName) => ({
    from: 'RebalanceKit <hello@rebalancekit.com>',
    to: email,
    subject: 'Welcome to RebalanceKit!',
    html: getWelcomeEmailHtml(userName),
  }),

  proUpgrade: (email, userName) => ({
    from: 'RebalanceKit <hello@rebalancekit.com>',
    to: email,
    subject: 'Welcome to RebalanceKit Pro! 🎉',
    html: getProUpgradeEmailHtml(userName),
  }),

  subscriptionCancelled: (email, userName, accessEnds) => ({
    from: 'RebalanceKit <hello@rebalancekit.com>',
    to: email,
    subject: 'Your RebalanceKit Pro subscription has been cancelled',
    html: getSubscriptionCancelledEmailHtml(userName, accessEnds),
  }),
}

export default async function handler(req, res) {
  if (handleCors(req, res, { methods: ['POST', 'OPTIONS'] })) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user, error: authError } = await authenticateRequest(req)
    if (authError || !user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { type, email, userName, accessEnds } = req.body

    console.log('[Send Email] Request:', { type, email, userName })

    if (!type || !email) {
      return res.status(400).json({ error: 'Missing required fields: type and email' })
    }

    // SECURITY: Apply rate limiting to prevent email spam abuse
    if (!await applyRateLimit(req, res, { endpointType: 'EMAIL' })) {
      return // Rate limit exceeded, response already sent
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('[Send Email] RESEND_API_KEY not configured')
      return res.status(500).json({ error: 'Email service not configured' })
    }

    // Get the appropriate template
    let emailData
    switch (type) {
      case 'welcome':
        emailData = templates.welcome(email, userName)
        break
      case 'proUpgrade':
        emailData = templates.proUpgrade(email, userName)
        break
      case 'subscriptionCancelled':
        emailData = templates.subscriptionCancelled(email, userName, accessEnds)
        break
      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` })
    }

    console.log('[Send Email] Sending email:', { type, to: email })

    // Send email via Resend
    const { data, error } = await resend.emails.send(emailData)

    if (error) {
      console.error('[Send Email] Resend error:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('[Send Email] ✅ Email sent successfully:', data)

    return res.status(200).json({
      success: true,
      messageId: data.id,
      type,
      email,
    })
  } catch (error) {
    console.error('[Send Email] Error:', error)
    Sentry.captureException(error)
    return res.status(500).json({ error: error.message })
  }
}
