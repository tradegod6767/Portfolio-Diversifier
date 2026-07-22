import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';
import {
  getProUpgradeEmailHtml,
  getSubscriptionCancelledEmailHtml,
  getPendingPurchaseEmailHtml,
} from './_email-templates.js';
import { Sentry } from './_sentry.js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY?.trim());

// Log webhook event to Supabase for debugging
async function logWebhookEvent(email, eventType, data) {
  try {
    const { error: insertError } = await supabaseAdmin.from('webhook_logs').insert({
      sale_id: data?.sale_id || null,
      event_type: eventType,
      payload: data,
      processed_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error('[Gumroad Webhook] Failed to log webhook event:', insertError);
    }
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

// Log a processing failure to webhook_logs so it's visible from the database,
// not just Vercel runtime logs. sale_id stays null so these rows never trip
// the duplicate-sale_id idempotency check.
async function logWebhookError(context, eventType, email, error) {
  try {
    const { error: insertError } = await supabaseAdmin.from('webhook_logs').insert({
      sale_id: null,
      event_type: 'processing_error',
      payload: {
        context,
        original_event_type: eventType,
        email,
        error_message: error?.message || String(error),
        error_code: error?.code || null,
        error_details: error?.details || null,
      },
      processed_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error('[Gumroad Webhook] Failed to log webhook error:', insertError);
    }
  } catch (err) {
    console.error('[Gumroad Webhook] Exception logging webhook error:', err);
  }
}

// Store orphaned purchase in pending_purchases table
async function storePendingPurchase(email, payload, eventType) {
  try {
    const { sale_id, subscription_id } = payload;

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
      .single();

    if (error) {
      // A failed insert here means a real paid purchase could be dropped, so
      // surface it in webhook_logs + Sentry rather than console-only. The
      // caller still returns 200 (a retry wouldn't fix a bad insert).
      console.error('[Gumroad Webhook] Error storing pending purchase:', error);
      await logWebhookError('store_pending_purchase', eventType, email, error);
      try {
        Sentry.captureException(new Error(`store pending purchase failed: ${error.message}`));
      } catch {}
      return null;
    }

    console.log(`[Gumroad Webhook] Stored pending purchase for ${email}:`, data.id);
    return data;
  } catch (error) {
    console.error('[Gumroad Webhook] Exception storing pending purchase:', error);
    await logWebhookError('store_pending_purchase', eventType, email, error);
    try {
      Sentry.captureException(error);
    } catch {}
    return null;
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
};

// Send email helper function
async function sendEmail(type, email, userName = null, accessEnds = null) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Gumroad Webhook] RESEND_API_KEY not configured - skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    let emailData;
    switch (type) {
      case 'proUpgrade':
        emailData = emailTemplates.proUpgrade(email, userName);
        break;
      case 'subscriptionCancelled':
        emailData = emailTemplates.subscriptionCancelled(email, userName, accessEnds);
        break;
      case 'pendingPurchase':
        emailData = emailTemplates.pendingPurchase(email);
        break;
      default:
        console.warn(`[Gumroad Webhook] Unknown email type: ${type}`);
        return { success: false, error: 'Unknown email type' };
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('[Gumroad Webhook] Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Gumroad Webhook] Email sent (${type}) to ${email}:`, data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('[Gumroad Webhook] Email send exception:', error);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  // SECURITY: Never log req.query or req.url — they contain the webhook secret
  console.log('[Gumroad Webhook] Received request');
  console.log('[Webhook Test Debug]', {
    hasTestBody: req.body?.test,
    testKeyHeader: req.headers['x-test-key']?.slice(0, 8) + '...',
    envKeyExists: !!process.env.WEBHOOK_TEST_KEY,
    envKeyPrefix: process.env.WEBHOOK_TEST_KEY?.slice(0, 8) + '...',
  });

  // Webhooks are server-to-server — no CORS headers needed
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate shared secret with timing-safe comparison
  const expectedSecret = process.env.GUMROAD_WEBHOOK_SECRET;
  const testKey = process.env.WEBHOOK_TEST_KEY?.trim();
  const providedTestKey = req.headers['x-test-key'] || '';
  const isAuthorizedTest =
    req.body?.test === true &&
    testKey &&
    providedTestKey.length === testKey.length &&
    crypto.timingSafeEqual(Buffer.from(providedTestKey), Buffer.from(testKey));

  if (!isAuthorizedTest) {
    if (!expectedSecret) {
      console.error('[Webhook] GUMROAD_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const providedSecret = req.query.secret || '';
    const expectedBuf = Buffer.from(expectedSecret);
    const providedBuf = Buffer.from(providedSecret);

    if (
      expectedBuf.length !== providedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, providedBuf)
    ) {
      console.error('[Webhook] Invalid secret');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    console.warn('[Gumroad Webhook] Authorized test mode — secret check bypassed');
  }

  try {
    const payload = req.body;

    // Idempotency check — skip duplicate sale_id events
    const saleId = req.body.sale_id;
    if (saleId) {
      const { data: existingLog } = await supabaseAdmin
        .from('webhook_logs')
        .select('id')
        .eq('sale_id', saleId)
        .single();

      if (existingLog) {
        console.log(`[Webhook] Duplicate sale_id: ${saleId}, skipping`);
        return res.status(200).json({ action: 'already_processed', sale_id: saleId });
      }
    }

    // Extract data from Gumroad webhook. Sale Pings send the buyer's email as
    // `email`; resource-subscription events (cancellation, subscription_ended,
    // subscription_restarted) send it as `user_email` instead.
    const { sale_id, subscription_id, product_name, product_id } = payload;
    const email = payload.email || payload.user_email;

    if (!email) {
      console.error('[Gumroad Webhook] No email provided');
      return res.status(400).json({ error: 'No email provided' });
    }

    // Determine event type — prefer alert_name (Gumroad's canonical field) over legacy booleans
    let eventType;

    const alertName = payload.alert_name;

    if (alertName) {
      // Gumroad alert_name values
      switch (alertName) {
        case 'sale':
        case 'subscription_sale':
          eventType = 'sale';
          break;
        case 'subscription_cancelled':
          eventType = 'subscription_cancelled';
          break;
        case 'subscription_ended':
          eventType = 'subscription_ended';
          break;
        case 'subscription_failed':
          eventType = 'subscription_failed';
          break;
        case 'subscription_restarted':
          eventType = 'subscription_restarted';
          break;
        default:
          eventType = alertName;
      }
    } else {
      // Legacy fallback: derive from boolean fields for older webhook formats
      if (payload.cancelled === true || payload.cancelled === 'true') {
        eventType = 'subscription_cancelled';
      } else if (payload.ended === true || payload.ended === 'true') {
        eventType = 'subscription_ended';
      } else if (payload.refunded === true || payload.refunded === 'true') {
        eventType = 'sale_refunded';
      } else if (payload.subscription_id || subscription_id) {
        eventType = 'subscription_created';
      } else {
        eventType = 'sale';
      }
    }

    console.log(`[Gumroad Webhook] Event type: ${eventType}`);

    // Log the event
    await logWebhookEvent(email, eventType, payload);

    // Get user from Supabase Auth by email
    // Use paginated search to handle >50 users
    let user = null;
    let page = 1;
    const perPage = 50;
    let listError = null;

    while (!user) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

      if (error) {
        listError = error;
        break;
      }

      user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

      // No more pages to search
      if (data.users.length < perPage) break;
      page++;
    }

    if (listError) {
      console.error('[Gumroad Webhook] Error listing users:', listError);
      await logWebhookError('list_users', eventType, email, listError);
      try {
        Sentry.captureException(listError);
      } catch {}
      return res.status(200).json({ error: 'Failed to find user', logged: true });
    }

    if (!user) {
      console.log(`[Gumroad Webhook] User not found: ${email}`);

      // For new purchases/subscriptions, store as pending purchase
      if (eventType === 'subscription_created' || eventType === 'sale') {
        console.log(`[Gumroad Webhook] Storing as pending purchase for: ${email}`);

        const pendingPurchase = await storePendingPurchase(email, payload, eventType);

        if (pendingPurchase) {
          // Send email prompting user to create account. Non-blocking: the
          // purchase is already stored, so an email failure shouldn't fail the
          // webhook — but log it instead of ignoring the result silently.
          const emailResult = await sendEmail('pendingPurchase', email);
          if (!emailResult?.success) {
            await logWebhookError(
              'pending_purchase_email',
              eventType,
              email,
              emailResult?.error || new Error('pending purchase email failed')
            );
          }

          return res.status(200).json({
            success: true,
            action: 'pending_purchase_stored',
            message: 'Purchase stored. User will get Pro when they sign up.',
            pendingPurchaseId: pendingPurchase.id,
          });
        }
      }

      // For revocation events, the Gumroad email may differ from the account
      // email — fall back to matching user_subscriptions by the
      // gumroad_subscription_id stored at activation time
      if (
        [
          'subscription_cancelled',
          'subscription_ended',
          'subscription_failed',
          'sale_refunded',
        ].includes(eventType) &&
        subscription_id
      ) {
        const { data: subRow, error: subLookupError } = await supabaseAdmin
          .from('user_subscriptions')
          .select('user_id')
          .eq('gumroad_subscription_id', subscription_id)
          .maybeSingle();

        if (subLookupError) {
          console.error('[Gumroad Webhook] Error looking up subscription:', subLookupError);
          await logWebhookError('cancellation_sub_lookup', eventType, email, subLookupError);
        } else if (subRow?.user_id) {
          const { data: userData, error: getUserError } =
            await supabaseAdmin.auth.admin.getUserById(subRow.user_id);
          if (getUserError) {
            console.error('[Gumroad Webhook] Error fetching user by id:', getUserError);
            await logWebhookError('cancellation_get_user', eventType, email, getUserError);
          } else {
            user = userData?.user || null;
            if (user) {
              console.log(
                `[Gumroad Webhook] Matched user ${user.id} via gumroad_subscription_id ${subscription_id}`
              );
            }
          }
        }
      }

      // For cancellations/refunds of non-existent users, just log
      if (!user) {
        // A sale/subscription reaching here means storePendingPurchase failed
        // (a successful store returns above), so don't claim it was logged as a
        // normal event — the revocation path below is the real "event logged".
        const storeFailed = eventType === 'subscription_created' || eventType === 'sale';
        return res.status(200).json({
          message: storeFailed
            ? 'User not found, purchase storage failed, logged for follow-up'
            : 'User not found, event logged',
        });
      }
    }

    console.log(`[Gumroad Webhook] Found user: ${user.id}`);

    // Handle different event types
    switch (eventType) {
      case 'subscription_created':
      case 'sale': {
        // Primary: update user_subscriptions table
        const { error: subError } = await supabaseAdmin.from('user_subscriptions').upsert(
          {
            id: user.id,
            user_id: user.id,
            // email is NOT NULL — Postgres validates the candidate insert row before
            // ON CONFLICT resolution, so omitting it fails even when the row exists
            email: user.email,
            is_pro: true,
            subscription_status: 'active',
            gumroad_subscription_id: subscription_id || sale_id,
            gumroad_product_id: product_id,
            gumroad_email: email,
          },
          { onConflict: 'user_id' }
        );

        if (subError) {
          console.error('[Gumroad Webhook] Error upserting user_subscriptions:', subError);
          await logWebhookError('activate_upsert', eventType, email, subError);
          try {
            Sentry.captureException(new Error(`upsert failed: ${subError.message}`));
          } catch {}
          return res.status(200).json({ error: 'Failed to activate subscription', logged: true });
        }

        // Secondary: backward compat
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            is_pro: true,
            subscription_status: 'active',
            gumroad_subscription_id: subscription_id || sale_id,
            subscribed_at: new Date().toISOString(),
            cancelled_at: null,
            product_name: product_name || 'Pro Subscription',
          },
        });

        console.log(`[Gumroad Webhook] Subscription activated for ${email}`);

        // Send Pro upgrade email
        await sendEmail('proUpgrade', email, user.email?.split('@')[0]);

        return res.status(200).json({
          success: true,
          userId: user.id,
          action: 'subscription_activated',
        });
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
          .eq('user_id', user.id);

        if (subError) {
          console.error('[Gumroad Webhook] Error updating user_subscriptions:', subError);
          await logWebhookError('revoke_update', eventType, email, subError);
          try {
            Sentry.captureException(new Error(`update failed: ${subError.message}`));
          } catch {}
          return res.status(200).json({ error: 'Failed to revoke subscription', logged: true });
        }

        // Secondary: backward compat
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            is_pro: false,
            subscription_status: 'cancelled',
            gumroad_subscription_id: subscription_id || sale_id,
            cancelled_at: new Date().toISOString(),
            cancellation_reason: eventType,
          },
        });

        console.log(`[Gumroad Webhook] Subscription revoked for ${email} (reason: ${eventType})`);

        // Send cancellation email
        await sendEmail('subscriptionCancelled', email, user.email?.split('@')[0]);

        return res.status(200).json({
          success: true,
          userId: user.id,
          action: 'subscription_revoked',
          reason: eventType,
        });
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
          .eq('user_id', user.id);

        if (subError) {
          console.error('[Gumroad Webhook] Error updating user_subscriptions:', subError);
          await logWebhookError('reactivate_update', eventType, email, subError);
          try {
            Sentry.captureException(new Error(`reactivate failed: ${subError.message}`));
          } catch {}
          return res.status(200).json({ error: 'Failed to reactivate subscription', logged: true });
        }

        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            is_pro: true,
            subscription_status: 'active',
            cancelled_at: null,
          },
        });

        console.log(`[Gumroad Webhook] Subscription reactivated for ${email}`);

        await sendEmail('proUpgrade', email, user.email?.split('@')[0]);

        return res.status(200).json({
          success: true,
          userId: user.id,
          action: 'subscription_reactivated',
        });
      }

      default:
        console.log(`[Gumroad Webhook] Unknown event type: ${eventType}, logging only`);
        return res.status(200).json({
          success: true,
          action: 'logged_only',
          eventType,
        });
    }
  } catch (error) {
    console.error('[Gumroad Webhook] Error:', error);
    await logWebhookError(
      'unhandled',
      req.body?.alert_name || null,
      req.body?.email || null,
      error
    );
    try {
      Sentry.captureException(error);
    } catch {}
    // Return 200 to prevent Gumroad from retrying on transient errors
    return res.status(200).json({
      error: error.message,
      logged: true,
    });
  }
}
