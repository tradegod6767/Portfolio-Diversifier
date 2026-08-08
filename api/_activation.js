/**
 * Build the user_subscriptions upsert row used to activate Pro.
 *
 * Live production schema facts (verified against the DB, not the stale repo
 * migrations): public.user_subscriptions has
 *   - id    uuid NOT NULL, no default, PRIMARY KEY, FK -> auth.users(id)
 *   - email text NOT NULL, no default
 *   - user_id uuid, UNIQUE (the onConflict target)
 * and there is NO handle_new_user trigger, so a user claiming a pre-signup
 * purchase has no pre-existing row. Postgres validates the candidate INSERT row
 * against the NOT-NULL constraints *before* ON CONFLICT resolution, so every
 * activation path must supply `id` and `email` even when a row already exists —
 * otherwise the upsert fails (23502) for any user without a subscriptions row.
 *
 * This mirrors the webhook's activation upsert (api/gumroad-webhook.js).
 *
 * SECURITY: `email` must be the authenticated user's account email (from the
 * verified JWT), never an email taken from the request body.
 *
 * @param {Object} params
 * @param {string} params.userId          Authenticated user's id (PK + user_id).
 * @param {string} params.authEmail       Authenticated user's account email.
 * @param {Object} [params.pendingPurchase] Row from pending_purchases.
 * @returns {Object} Row for supabaseAdmin.from('user_subscriptions').upsert(...)
 */
export function buildActivationRow({ userId, authEmail, pendingPurchase = {} }) {
  if (!userId) throw new Error('buildActivationRow: userId is required')
  if (!authEmail) throw new Error('buildActivationRow: authEmail is required')

  return {
    id: userId, // PK, NOT NULL, FK -> auth.users(id)
    user_id: userId, // UNIQUE, used as the onConflict target
    email: authEmail, // NOT NULL account email — from the verified JWT, never req.body
    is_pro: true,
    subscription_status: 'active',
    gumroad_subscription_id:
      pendingPurchase.gumroad_subscription_id || pendingPurchase.sale_id || null,
    gumroad_product_id: pendingPurchase.gumroad_product_id || null,
    gumroad_email: pendingPurchase.email || authEmail,
  }
}
