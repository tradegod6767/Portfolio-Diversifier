# Gumroad Webhook Setup Guide

This guide explains how to set up Gumroad webhooks to automatically manage Pro subscriptions.

## 🎯 What This Does

When users cancel their Gumroad subscription, the webhook automatically:
- Revokes their Pro access by setting `is_pro = false`
- Updates their `subscription_status` to `'cancelled'`
- Logs the cancellation event with timestamp
- All changes are logged in Supabase for debugging

## 📋 Prerequisites

- Supabase project with Auth enabled
- Gumroad product set up
- Vercel deployment (or other hosting)
- Environment variables configured

## 🔧 Setup Steps

### 1. Run Database Migration

Execute the SQL migration in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard > SQL Editor
# Copy and paste the contents of: supabase-webhook-migration.sql
# Click "Run"
```

This creates:
- `webhook_logs` table - stores all webhook events
- `user_subscriptions` table (optional) - separate subscription tracking
- Proper indexes and RLS policies

### 2. Configure Environment Variables

Add to your Vercel environment variables (or `.env` for local):

```bash
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:** Use the SERVICE ROLE KEY (not anon key) for the webhook endpoint.

### 3. Deploy to Vercel

```bash
vercel --prod
```

The webhook will be available at:
```
https://your-domain.vercel.app/api/gumroad-webhook
```

### 4. Configure Gumroad Webhook

1. Go to Gumroad Dashboard
2. Navigate to Settings > Advanced > Webhooks
3. Click "Add Webhook"
4. Enter your webhook URL: `https://your-domain.vercel.app/api/gumroad-webhook`
5. Enable these events:
   - ✅ Sale
   - ✅ Subscription Cancelled
   - ✅ Subscription Ended
   - ✅ Refund
6. Save

## 🧪 Testing

### Test Webhook Locally

Create a test file `test-webhook.js`:

```javascript
// Test the webhook endpoint locally
const testPayload = {
  email: 'test@example.com',
  sale_id: 'test-sale-123',
  subscription_id: 'sub-123',
  cancelled: true, // Simulates cancellation
};

fetch('http://localhost:3000/api/gumroad-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testPayload),
})
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

Run:
```bash
node test-webhook.js
```

### Test Webhook on Vercel

Use the Gumroad "Ping" feature:
1. In Gumroad webhook settings
2. Click "Ping" next to your webhook URL
3. Check Vercel logs for the event

### Check Logs

**Vercel Logs:**
```bash
vercel logs --follow
```

**Supabase Logs:**
```sql
-- View recent webhook events
SELECT * FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;

-- Check specific user's events
SELECT * FROM webhook_logs
WHERE email = 'user@example.com'
ORDER BY created_at DESC;
```

## 📊 Event Types Handled

| Event | Action | Effect |
|-------|--------|--------|
| `sale` | Activate subscription | `is_pro = true`, `subscription_status = 'active'` |
| `subscription_created` | Activate subscription | Same as sale |
| `subscription_cancelled` | Revoke access | `is_pro = false`, `subscription_status = 'cancelled'` |
| `subscription_ended` | Revoke access | `is_pro = false`, `subscription_status = 'cancelled'` |
| `sale_refunded` | Revoke access | `is_pro = false`, `subscription_status = 'cancelled'` |

## 🔍 How It Works

### Webhook Flow

```
1. User cancels subscription in Gumroad
      ↓
2. Gumroad sends POST to /api/gumroad-webhook
      ↓
3. Webhook logs event to webhook_logs table
      ↓
4. Webhook finds user by email in Supabase Auth
      ↓
5. Webhook updates user_metadata:
   - is_pro = false
   - subscription_status = 'cancelled'
   - cancelled_at = timestamp
      ↓
6. Returns 200 OK to Gumroad
```

### Auth Check Flow

When checking if user has Pro access:

```javascript
// Both conditions must be true:
1. is_pro === true
2. subscription_status !== 'cancelled'
```

This is handled in:
- `src/lib/auth.js` - `checkIfPro()` function
- `src/hooks/useAuth.js` - `useAuth()` hook

## 🛠 Troubleshooting

### Webhook Not Firing

1. **Check Gumroad Settings:**
   - Webhook URL is correct
   - Events are enabled
   - Try "Ping" button

2. **Check Vercel Logs:**
   ```bash
   vercel logs --follow
   ```
   Look for `[Gumroad Webhook]` messages

3. **Verify Environment Variables:**
   ```bash
   vercel env ls
   ```

### User Not Being Updated

1. **Check webhook_logs table:**
   ```sql
   SELECT * FROM webhook_logs WHERE email = 'user@example.com';
   ```

2. **Verify user exists in Supabase Auth:**
   - User must be signed up BEFORE webhook fires
   - Email must match exactly (case-insensitive)

3. **Check service role key:**
   - Must be SERVICE ROLE KEY, not anon key
   - Has permission to update auth.users

### Access Still Working After Cancel

1. **Clear browser cache/localStorage**
2. **Force user to re-login**
3. **Check user metadata in Supabase:**
   ```sql
   -- In Supabase Dashboard > Authentication > Users
   -- Click user > View metadata
   ```

## 🔒 Security Notes

- Webhook endpoint uses CORS headers - tighten for production
- Service role key has full access - keep it secret
- Always return 200 to prevent Gumroad retries
- All events are logged for audit trail

## 📝 Database Schema

### webhook_logs
```sql
id UUID PRIMARY KEY
email TEXT
event_type TEXT
payload JSONB
created_at TIMESTAMPTZ
```

### user_metadata (in auth.users)
```javascript
{
  is_pro: boolean,
  subscription_status: 'active' | 'cancelled' | 'expired' | 'inactive',
  gumroad_subscription_id: string,
  subscribed_at: timestamp,
  cancelled_at: timestamp,
  cancellation_reason: string,
  product_name: string
}
```

## 🎉 Success Checklist

- [ ] Database migration ran successfully
- [ ] Environment variables configured in Vercel
- [ ] Webhook endpoint deployed and accessible
- [ ] Gumroad webhook configured with correct URL
- [ ] Test event shows in webhook_logs table
- [ ] Test cancellation revokes Pro access
- [ ] User can no longer access Pro features after cancel

## 📞 Support

If you encounter issues:
1. Check Vercel logs: `vercel logs`
2. Check Supabase logs: Dashboard > Logs
3. Review webhook_logs table for events
4. Verify environment variables are set correctly
