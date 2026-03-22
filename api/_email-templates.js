/**
 * Centralized email templates for RebalanceKit transactional emails.
 *
 * Agent 1: Replace inline templates in api/gumroad-webhook.js and
 * api/send-email.js with imports from this file after security work is done.
 *
 * Usage:
 *   import { getWelcomeEmailHtml, getProUpgradeEmailHtml, getSubscriptionCancelledEmailHtml, getPendingPurchaseEmailHtml } from './_email-templates.js';
 */

export function getWelcomeEmailHtml(userName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to RebalanceKit</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                RebalanceKit
              </h1>
              <p style="margin: 10px 0 0 0; color: #cbd5e1; font-size: 16px;">
                Tax-Smart Portfolio Rebalancing
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #0f172a; font-size: 24px;">
                Welcome to RebalanceKit! 🎉
              </h2>

              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Hi${userName ? ` ${userName}` : ''},
              </p>

              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Thanks for signing up! We're excited to help you rebalance your portfolio with confidence.
              </p>

              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                RebalanceKit makes it easy to:
              </p>

              <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #475569; font-size: 16px; line-height: 1.8;">
                <li>Calculate exact buy/sell amounts to reach your target allocation</li>
                <li>See AI-powered portfolio analysis and risk assessment</li>
                <li>Visualize your allocation with interactive charts</li>
                <li>Use tax-efficient "Add Only" mode to avoid capital gains</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rebalancekit.com" style="display: inline-block; padding: 14px 32px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Try the Calculator
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Questions? Just reply to this email - we're here to help!
              </p>

              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Happy rebalancing,<br>
                <strong>The RebalanceKit Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                RebalanceKit - Tax-Smart Portfolio Rebalancing
              </p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
                You're receiving this because you created an account at rebalancekit.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getProUpgradeEmailHtml(userName) {
  return `
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

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255,255,255,0.2); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 16px;">
                <span style="font-size: 40px;">⭐</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                Welcome to Pro!
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 18px;">
                Your upgrade is active
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Hi${userName ? ` ${userName}` : ''},
              </p>

              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Thank you for upgrading to RebalanceKit Pro! Your subscription is now active and you have full access to all premium features.
              </p>

              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">
                ✨ What You Now Have Access To:
              </h3>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">Tax Impact Estimates</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">
                      See estimated capital gains before you rebalance
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">PDF Report Generation</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">
                      Export professional reports with charts and analysis
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">Portfolio Health Scoring</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">
                      Track your portfolio's overall health and risk level
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">Model Portfolio Comparison</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">
                      Compare your allocation to popular strategies
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <strong style="color: #0f172a;">Unlimited Portfolios</strong>
                    <p style="margin: 4px 0 0 26px; color: #64748b; font-size: 14px;">
                      Save and manage multiple portfolios
                    </p>
                  </td>
                </tr>
              </table>

              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">
                🚀 Next Steps:
              </h3>

              <ol style="margin: 0 0 24px 0; padding-left: 24px; color: #475569; font-size: 16px; line-height: 1.8;">
                <li>Sign in to your account</li>
                <li>Try the portfolio calculator</li>
                <li>Explore the tax impact estimates</li>
                <li>Export your first PDF report</li>
              </ol>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rebalancekit.com" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Start Using Pro Features
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Need help? Just reply to this email and we'll assist you.
              </p>

              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Cheers,<br>
                <strong>The RebalanceKit Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                RebalanceKit Pro - $9.99/month
              </p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
                Manage your subscription at <a href="https://gumroad.com/library" style="color: #10b981; text-decoration: none;">Gumroad</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getSubscriptionCancelledEmailHtml(userName, accessEnds) {
  return `
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

          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Subscription Cancelled
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Hi${userName ? ` ${userName}` : ''},
              </p>

              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                We've received confirmation that your RebalanceKit Pro subscription has been cancelled.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
                      <strong>Your Pro access will end:</strong><br>
                      ${accessEnds || 'At the end of your current billing period'}
                    </p>
                  </td>
                </tr>
              </table>

              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">
                What This Means:
              </h3>

              <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #475569; font-size: 16px; line-height: 1.8;">
                <li>Your Pro features remain active until ${accessEnds || 'the end of your billing period'}</li>
                <li>After that, you'll switch to the free plan</li>
                <li>All your saved portfolios will be preserved</li>
                <li>You can resubscribe anytime to regain Pro access</li>
              </ul>

              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">
                Free Plan Includes:
              </h3>

              <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #475569; font-size: 16px; line-height: 1.8;">
                <li>Portfolio rebalancing calculator</li>
                <li>AI-powered analysis</li>
                <li>Interactive charts</li>
                <li>Tax-efficient "Add Only" mode</li>
                <li>Save up to 3 portfolios</li>
              </ul>

              <h3 style="margin: 30px 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">
                Want to Resubscribe?
              </h3>

              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                You can resubscribe anytime to regain access to all Pro features:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rebalancekit.gumroad.com/l/fvdfk" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Resubscribe to Pro
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                We're sorry to see you go! If there's anything we could improve, please let us know by replying to this email.
              </p>

              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>The RebalanceKit Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                RebalanceKit - Tax-Smart Portfolio Rebalancing
              </p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
                Questions? Reply to this email or visit <a href="https://rebalancekit.com" style="color: #10b981; text-decoration: none;">rebalancekit.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email for users who purchased Pro before creating an account.
 * Instructs them to sign up with the same email to activate Pro.
 */
export function getPendingPurchaseEmailHtml(email) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Pro Signup</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255,255,255,0.2); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 16px;">
                <span style="font-size: 40px;">⏳</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">One More Step!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your Pro purchase is waiting</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hi there,</p>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Thank you for purchasing RebalanceKit Pro! We received your payment, but we noticed you don't have an account yet.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
                      <strong>Action Required:</strong> Create an account with this email address (${email}) to activate your Pro subscription.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Your Pro features will be automatically activated as soon as you sign up. No need to purchase again!
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rebalancekit.com" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Create Your Account</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                <strong>Important:</strong> Use this exact email when signing up:
              </p>
              <p style="margin: 0 0 24px 0; color: #0f172a; font-size: 16px; font-weight: 600; font-family: monospace; background-color: #f1f5f9; padding: 12px; border-radius: 6px; text-align: center;">
                ${email}
              </p>
              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Your purchase will be held for 30 days. If you have any questions, just reply to this email.
              </p>
              <p style="margin: 24px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Cheers,<br><strong>The RebalanceKit Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">RebalanceKit Pro - $9.99/month</p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">Questions? Reply to this email</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
