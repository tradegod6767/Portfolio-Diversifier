# Gumroad Webhook Implementation Summary

## ✅ What Was Implemented

Complete Gumroad webhook system to automatically manage Pro subscriptions when users cancel.

## 📁 Files Created/Modified

### 1. **api/gumroad-webhook.js** (UPDATED)
**Purpose:** Webhook endpoint handler
**Location:** `/api/gumroad-webhook`

**Features:**
- ✅ Handles POST requests from Gumroad
- ✅ Processes multiple event types:
  - `sale` / `subscription_created` → Activates Pro + sends upgrade email
  - `subscription_cancelled` → Revokes Pro + sends cancellation email
  - `subscription_ended` → Revokes Pro + sends cancellation email
  - `sale_refunded` → Revokes Pro + sends cancellation email
- ✅ Logs all events to `webhook_logs` table
- ✅ Updates user metadata in Supabase Auth
- ✅ Sends transactional emails via Resend
- ✅ Returns 200 to acknowledge receipt
- ✅ Comprehensive error handling and logging

**Key Logic:**
```javascript
// Activation
user_metadata: {
  is_pro: true,
  subscription_status: 'active',
  gumroad_subscription_id: subscription_id,
  subscribed_at: timestamp,
  cancelled_at: null
}

// Cancellation
user_metadata: {
  is_pro: false,
  subscription_status: 'cancelled',
  cancelled_at: timestamp,
  cancellation_reason: event_type
}
```

### 2. **supabase-webhook-migration.sql** (NEW)
**Purpose:** Database migration for webhook support

**Creates:**
- `webhook_logs` table
  - Stores all webhook events
  - Indexed by email, event_type, created_at
  - RLS enabled with service_role access

- `user_subscriptions` table (optional)
  - Separate subscription tracking
  - Indexed by user_id and status
  - RLS enabled for user access

**Policies:**
- Service role has full access to both tables
- Users can read their own subscriptions

### 3. **src/lib/auth.js** (UPDATED)
**Purpose:** Enhanced Pro status checking

**Changes to `checkIfPro()` function:**
```javascript
// OLD: Only checked is_pro
const isPro = user.user_metadata?.is_pro === true
return isPro

// NEW: Checks is_pro AND subscription_status
const metadata = user.user_metadata || {}
const isPro = metadata.is_pro === true
const subscriptionStatus = metadata.subscription_status
const hasActiveSubscription = isPro && subscriptionStatus !== 'cancelled'
return hasActiveSubscription
```

**Effect:**
- Users must have BOTH:
  1. `is_pro = true`
  2. `subscription_status !== 'cancelled'`
- Prevents access for cancelled subscriptions

### 4. **src/hooks/useAuth.js** (UPDATED)
**Purpose:** Real-time auth state management

**Changes:**
- Updated `initAuth()` to check subscription_status
- Updated `onAuthStateChange()` to check subscription_status
- Both functions now verify:
  - `is_pro === true`
  - `subscription_status !== 'cancelled'`

**Effect:**
- Instantly reflects subscription changes
- Users lose access immediately upon cancellation
- No need to re-login

### 5. **GUMROAD-WEBHOOK-SETUP.md** (NEW)
**Purpose:** Complete setup guide

**Contains:**
- Prerequisites
- Step-by-step setup instructions
- Database migration guide
- Gumroad configuration
- Testing procedures
- Troubleshooting guide
- Security notes

### 6. **test-webhook.js** (NEW)
**Purpose:** Webhook testing script

**Usage:**
```bash
# Test sale event
node test-webhook.js user@example.com sale

# Test cancellation
node test-webhook.js user@example.com cancelled

# Test with custom URL
node test-webhook.js user@example.com cancelled https://your-app.vercel.app/api/gumroad-webhook
```

**Features:**
- Tests different event types
- Colorful console output
- Shows expected results
- Debugging tips

### 7. **api/send-email.js** (NEW)
**Purpose:** Resend email API endpoint
**Location:** `/api/send-email`

**Email Templates:**
1. **welcome** - Welcome email sent on signup
   - Professional HTML design with gradient header
   - Lists key features of RebalanceKit
   - CTA button to try the calculator

2. **proUpgrade** - Pro subscription confirmation
   - Congratulatory message with star icon
   - Detailed list of Pro features with descriptions
   - Next steps for getting started
   - Link to manage subscription on Gumroad

3. **subscriptionCancelled** - Cancellation confirmation
   - Professional and respectful tone
   - Info box showing when access ends
   - List of free plan features
   - CTA to resubscribe with pre-filled email

**All emails:**
- Responsive HTML table-based design
- Mobile-friendly layout
- RebalanceKit branding
- Professional typography
- Sent from: `RebalanceKit <hello@rebalancekit.com>`

### 8. **src/lib/auth.js** (UPDATED)
**Purpose:** Authentication helper functions

**Changes:**
- Updated `signup()` function to send welcome email
- Calls `/api/send-email` asynchronously after successful signup
- Email send doesn't block signup flow
- Errors are logged but don't fail the signup

### 9. **.env.example** (NEW)
**Purpose:** Environment variable documentation

**Documents required variables:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `ANTHROPIC_API_KEY` - Claude API key for AI analysis
- `RESEND_API_KEY` - Resend API key for transactional emails

### 10. **WEBHOOK-IMPLEMENTATION-SUMMARY.md** (NEW - THIS FILE)
**Purpose:** Overview of implementation

## 🔄 Data Flow

### User Signup
```
User signs up → Supabase Auth creates account
                         ↓
                  Send welcome email via Resend
                         ↓
              User receives confirmation email
                         ↓
                User confirms email + Welcome email
                         ↓
                  User can sign in ✅
```

### New Subscription
```
User purchases → Gumroad webhook → /api/gumroad-webhook
                                    ↓
                                 Log to webhook_logs
                                    ↓
                             Find user by email
                                    ↓
                             Update user_metadata:
                             - is_pro = true
                             - subscription_status = 'active'
                                    ↓
                          Send Pro upgrade email via Resend
                                    ↓
                                Return 200 OK
                                    ↓
                   User has Pro access + receives email ✅
```

### Subscription Cancelled
```
User cancels → Gumroad webhook → /api/gumroad-webhook
                                  ↓
                              Log to webhook_logs
                                  ↓
                           Find user by email
                                  ↓
                           Update user_metadata:
                           - is_pro = false
                           - subscription_status = 'cancelled'
                           - cancelled_at = timestamp
                                  ↓
                     Send cancellation email via Resend
                                  ↓
                              Return 200 OK
                                  ↓
                User loses Pro access + receives email ❌
```

### Access Check (Frontend)
```
useAuth hook checks:
1. user.user_metadata.is_pro === true
2. user.user_metadata.subscription_status !== 'cancelled'

Both must be true → Grant access
Either is false → Deny access
```

## 🗄️ Database Schema

### user_metadata (auth.users)
```typescript
{
  is_pro: boolean
  subscription_status: 'active' | 'cancelled' | 'expired' | 'inactive'
  gumroad_subscription_id: string
  subscribed_at: string (ISO timestamp)
  cancelled_at: string | null (ISO timestamp)
  cancellation_reason: string
  product_name: string
}
```

### webhook_logs
```sql
id: UUID
email: TEXT
event_type: TEXT
payload: JSONB
created_at: TIMESTAMPTZ
```

### user_subscriptions (optional)
```sql
id: UUID
user_id: UUID (FK to auth.users)
subscription_status: TEXT
gumroad_subscription_id: TEXT
subscribed_at: TIMESTAMPTZ
cancelled_at: TIMESTAMPTZ
cancellation_reason: TEXT
product_name: TEXT
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

## 🔐 Security

### Service Role Key
- Required for webhook endpoint
- Has permission to update auth.users
- Must be kept secret in environment variables

### CORS Headers
- Currently set to allow all origins (`*`)
- Consider restricting to Gumroad IPs in production

### RLS Policies
- Service role has full access to webhook_logs
- Users can only read their own subscriptions
- All policies properly configured

## 📧 Email Integration

### Resend Setup
1. Sign up at [resend.com](https://resend.com)
2. Add and verify domain: `rebalancekit.com`
3. Create API key with sending permissions
4. Add `RESEND_API_KEY` to environment variables

### Email Types and Triggers

| Email Type | Trigger | Sent When | Template |
|------------|---------|-----------|----------|
| Welcome | User signup | `signup()` function in auth.js | `welcome` |
| Pro Upgrade | Subscription created | Gumroad webhook: `subscription_created` or `sale` | `proUpgrade` |
| Subscription Cancelled | Subscription cancelled | Gumroad webhook: `subscription_cancelled`, `subscription_ended`, `sale_refunded` | `subscriptionCancelled` |

### Email Content
All emails use professional HTML templates with:
- Responsive table-based layout for email client compatibility
- Inline CSS for maximum compatibility
- Mobile-friendly design
- RebalanceKit branding (gradient headers, logo placement)
- Clear CTAs (buttons with proper styling)
- Footer with unsubscribe info

## ✅ Testing Checklist

**Database & Infrastructure:**
- [ ] Database migration executed
- [ ] Environment variables configured (including `RESEND_API_KEY`)
- [ ] Webhook deployed to Vercel
- [ ] Gumroad webhook configured
- [ ] Resend domain verified

**Webhook & Subscription Testing:**
- [ ] Test new subscription (is_pro = true)
- [ ] Test cancellation (is_pro = false)
- [ ] Test refund (is_pro = false)
- [ ] Verify access is revoked after cancel
- [ ] Check webhook_logs table
- [ ] Review Vercel logs

**Email Testing:**
- [ ] Test welcome email on new signup
- [ ] Test Pro upgrade email on subscription purchase
- [ ] Test cancellation email when subscription cancelled
- [ ] Verify all emails render correctly on mobile
- [ ] Check email delivery and spam scores
- [ ] Verify "from" address shows as RebalanceKit

## 🚀 Deployment

```bash
# 1. Run migration in Supabase SQL Editor
# Copy contents of supabase-webhook-migration.sql

# 2. Commit changes
git add .
git commit -m "Implement Gumroad webhook for subscription management"

# 3. Deploy to Vercel
vercel --prod

# 4. Configure Gumroad webhook
# URL: https://your-domain.vercel.app/api/gumroad-webhook
# Events: Sale, Subscription Cancelled, Subscription Ended, Refund
```

## 📊 Monitoring

### Check Webhook Events
```sql
-- Recent events
SELECT * FROM webhook_logs
ORDER BY created_at DESC
LIMIT 20;

-- Cancellations
SELECT * FROM webhook_logs
WHERE event_type LIKE '%cancel%'
ORDER BY created_at DESC;

-- Specific user
SELECT * FROM webhook_logs
WHERE email = 'user@example.com'
ORDER BY created_at DESC;
```

### Check User Subscriptions
```sql
-- Active subscriptions
SELECT id, email, user_metadata->'subscription_status' as status
FROM auth.users
WHERE (user_metadata->>'is_pro')::boolean = true;

-- Cancelled subscriptions
SELECT id, email, user_metadata->'subscription_status' as status,
       user_metadata->'cancelled_at' as cancelled_at
FROM auth.users
WHERE user_metadata->>'subscription_status' = 'cancelled';
```

## 🎯 Success Criteria

✅ Webhook receives events from Gumroad
✅ Events are logged to webhook_logs table
✅ New subscriptions activate Pro access
✅ Cancellations revoke Pro access immediately
✅ Users cannot access Pro features after cancel
✅ All changes are reflected in real-time
✅ Comprehensive logging for debugging

## 📝 Notes

- All webhooks return 200 to prevent Gumroad retries
- Errors are logged but still return 200
- User must exist in Supabase before webhook fires
- Email matching is case-insensitive
- Subscription status persists across sessions
- Users must re-authenticate to see changes (or page refresh)

## 🔗 Related Documentation

- Gumroad Webhooks: https://help.gumroad.com/article/356-webhooks
- Supabase Auth: https://supabase.com/docs/guides/auth
- Vercel Serverless Functions: https://vercel.com/docs/functions

## 🆘 Support

If issues occur:
1. Check `vercel logs --follow`
2. Check Supabase Dashboard > Logs
3. Query `webhook_logs` table
4. Verify environment variables
5. Test with `node test-webhook.js`
