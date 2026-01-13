# Security Fixes - Client-Side Pro Bypass Vulnerability

## 🔴 Critical Vulnerability Fixed

**Issue**: Pro subscription status was controlled by client-side code, allowing free users to access Pro features by manipulating request payloads.

**Impact**:
- Free users could get Pro AI analysis by sending `isPro: true` in API requests
- Potential revenue loss
- Unfair access to premium features

**Status**: ✅ **FIXED**

---

## 📋 Changes Made

### 1. Created Server-Side Authentication Utility
**File**: `api/_auth.js`

New utility functions for secure authentication:

- `authenticateRequest(req)` - Extracts and verifies Supabase JWT token from Authorization header
- `verifyProStatus(user)` - Server-side verification of Pro subscription status from database
- `getUserByEmail(email)` - Helper for webhook handlers to find users

**Key Features**:
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and query real subscription status
- Never trusts client-sent data
- Verifies both `is_pro` flag AND `subscription_status === 'active'`

### 2. Fixed `/api/explain` Endpoint
**File**: `api/explain.js`

**Before** (Vulnerable):
```javascript
const { rebalancingData, isPro } = req.body;
const isProUser = isPro === true; // ❌ Trusts client data
```

**After** (Secure):
```javascript
const { user, isPro, error } = await authenticateRequest(req);
const isProUser = isPro === true; // ✅ Server-verified from database
```

**Additional Security Improvements**:
- ✅ Restricted CORS to known domains only (localhost + rebalancekit.com)
- ✅ Removed wildcard CORS (`Access-Control-Allow-Origin: *`)
- ✅ Added proper Authorization header handling

### 3. Updated Frontend to Send Auth Tokens
**File**: `src/components/PortfolioForm.jsx`

**Before** (Vulnerable):
```javascript
const response = await axios.post('/api/explain', {
  rebalancingData: data,
  isPro: isPro || false // ❌ Client controls this
});
```

**After** (Secure):
```javascript
const { data: { session } } = await supabase.auth.getSession();
const headers = {};
if (session?.access_token) {
  headers.Authorization = `Bearer ${session.access_token}`;
}

const response = await axios.post('/api/explain',
  { rebalancingData: data }, // ✅ No isPro flag sent
  { headers } // ✅ Server verifies from token
);
```

### 4. Secured `/api/send-email` Endpoint
**File**: `api/send-email.js`

**Previous Issue**: Endpoint was completely open - anyone could spam emails

**Fixes Applied**:
- ✅ Requires authentication OR internal API key
- ✅ Users can only send emails to their own address
- ✅ Webhook handlers use `X-Internal-Key` header with service role key
- ✅ Restricted CORS to known domains

**Updated**: `src/lib/auth.js` to send auth token with welcome emails

---

## 🔍 API Endpoint Security Audit

| Endpoint | Pro Features? | Auth Required? | Status | Notes |
|----------|---------------|----------------|--------|-------|
| `/api/explain` | ✅ Yes | Optional | ✅ **FIXED** | Server verifies Pro status from DB |
| `/api/send-email` | No | ✅ Now Required | ✅ **SECURED** | Requires auth OR internal key |
| `/api/gumroad-webhook` | No | ✅ Secret Token | ✅ **FIXED** | Secret token in query param + payload validation |
| `/api/create-checkout-session` | No | No | ⚠️ **LOW PRIORITY** | Stripe endpoint, unused? |
| `/api/stripe-webhook` | No | No (Webhook) | ⚠️ **MEDIUM PRIORITY** | Should verify Stripe webhook signature |

---

## ✅ Additional Fixes Applied

### 5. Gumroad Webhook Security (FIXED)
**File**: `api/gumroad-webhook.js`

**Previous Issue**: No authentication - anyone could call webhook endpoint to grant Pro status or revoke subscriptions

**Solution Implemented**: Multi-layered security approach

**Security Measures Added**:

1. **Secret Token Verification** (Primary)
   - Webhook URL now requires secret token: `/api/gumroad-webhook?secret=YOUR_SECRET`
   - Secret must match `GUMROAD_WEBHOOK_SECRET` environment variable
   - Invalid secrets receive 401 Unauthorized

2. **Payload Validation**
   - Validates payload structure is valid JSON object
   - Validates required `email` field exists
   - Validates email format with regex
   - Rejects malformed requests with 400 Bad Request

3. **CORS Removed**
   - Webhooks are server-to-server - no CORS headers needed
   - Reduces attack surface

4. **Optional IP Whitelisting** (Documented)
   - Code comments show how to add IP whitelisting
   - Can restrict to Gumroad's server IPs if needed

**Why Not HMAC Signatures?**

Gumroad does not provide HMAC signature verification like Stripe/GitHub. The secret token approach is the industry-standard method for securing Gumroad webhooks. This is documented in integration guides and is how most Gumroad integrations work.

**Configuration Required**:
```bash
# 1. Generate a strong secret
openssl rand -hex 32

# 2. Add to .env
GUMROAD_WEBHOOK_SECRET=your_generated_secret_here

# 3. Configure Gumroad webhook URL as:
https://your-domain.com/api/gumroad-webhook?secret=your_generated_secret_here
```

---

## ⚠️ Remaining Security Issues

### 1. Rate Limiting (MEDIUM PRIORITY)

**Files**: All API endpoints

**Issue**: No rate limiting on API requests

**Risk**: API abuse, excessive Anthropic API costs

**Fix Needed**: Implement rate limiting using Vercel's built-in features or middleware

### 2. Stripe Webhook Signature (MEDIUM PRIORITY)

**File**: `api/stripe-webhook.js`

**Issue**: If Stripe is being used, webhook needs signature verification

**Fix**: Use `stripe.webhooks.constructEvent()` to verify signatures

### 3. CORS Configuration (LOW PRIORITY)

**Current**: Hardcoded allowed origins in each endpoint

**Better**: Centralize CORS configuration

**Recommendation**:
```javascript
// api/_cors.js
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5176',
  'https://rebalancekit.com',
  'https://www.rebalancekit.com'
];

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
```

---

## 🧪 Testing the Fix

### Test 1: Free User Cannot Get Pro Analysis
```bash
# Without auth token
curl -X POST https://your-domain.com/api/explain \
  -H "Content-Type: application/json" \
  -d '{"rebalancingData": {...}, "isPro": true}'

# Expected: Returns free-tier analysis (800 tokens, upgrade prompt)
# isPro flag in body is now IGNORED
```

### Test 2: Pro User Gets Enhanced Analysis
```bash
# With valid Pro user token
curl -X POST https://your-domain.com/api/explain \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PRO_USER_TOKEN>" \
  -d '{"rebalancingData": {...}}'

# Expected: Returns Pro analysis (1500 tokens, detailed tax info)
```

### Test 3: Email Endpoint Requires Auth
```bash
# Without auth
curl -X POST https://your-domain.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"type": "welcome", "email": "victim@example.com"}'

# Expected: 401 Unauthorized
```

### Test 4: Webhook Requires Secret Token
```bash
# Without secret
curl -X POST https://your-domain.com/api/gumroad-webhook \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "subscription_id": "fake123"}'

# Expected: 401 Unauthorized - invalid webhook secret

# With invalid secret
curl -X POST https://your-domain.com/api/gumroad-webhook?secret=wrong \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "subscription_id": "fake123"}'

# Expected: 401 Unauthorized - invalid webhook secret

# With valid secret (only Gumroad should know this)
curl -X POST https://your-domain.com/api/gumroad-webhook?secret=YOUR_REAL_SECRET \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "subscription_id": "sub123"}'

# Expected: 200 OK - webhook processed
```

---

## 📊 Security Improvement Summary

| Category | Before | After |
|----------|--------|-------|
| Pro Verification | Client-side (unsafe) | ✅ Server-side (DB query) |
| CORS Policy | Wildcard (`*`) | ✅ Whitelisted domains |
| Email Endpoint | Wide open | ✅ Auth required |
| Token Transmission | isPro boolean | ✅ JWT Bearer token |
| Webhook Security | No authentication | ✅ Secret token + validation |
| Attack Surface | High | ✅ Significantly reduced |

---

## 🚀 Deployment Checklist

Before deploying these changes:

### Environment Variables

- [ ] Add `.env` variables to Vercel:
  - `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)
  - `ANTHROPIC_API_KEY`
  - `RESEND_API_KEY`
  - `GUMROAD_WEBHOOK_SECRET` (⚠️ New - see below)

### Generate Webhook Secret

```bash
# Generate a strong 64-character hex secret
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] Generate webhook secret using command above
- [ ] Add `GUMROAD_WEBHOOK_SECRET` to Vercel environment variables
- [ ] Update Gumroad webhook URL to include secret:
  - Format: `https://rebalancekit.com/api/gumroad-webhook?secret=YOUR_SECRET`
  - Go to Gumroad Settings → Advanced → Webhooks/Ping
  - Update the webhook URL with your secret token

### Testing

- [ ] Test authentication flow:
  - [ ] Free user gets free-tier analysis
  - [ ] Pro user gets Pro analysis
  - [ ] Invalid token returns 401

- [ ] Test webhook security:
  - [ ] Webhook without secret returns 401
  - [ ] Webhook with wrong secret returns 401
  - [ ] Webhook with correct secret processes successfully

- [ ] Verify CORS works for:
  - [ ] localhost:5173 (dev)
  - [ ] localhost:5176 (preview)
  - [ ] rebalancekit.com (production)

### Monitoring

- [ ] Monitor Anthropic API usage for any suspicious spikes
- [ ] Check Vercel logs for webhook authentication failures
- [ ] Verify Pro subscriptions activate/deactivate correctly via webhooks

---

## 🎯 Next Priority: Rate Limiting

**Immediate next step**: Implement rate limiting to prevent API abuse

**Recommended approach**: Use Vercel's built-in rate limiting or a middleware solution

**Files to update**: All API endpoints (`api/explain.js`, `api/send-email.js`, etc.)

**Why it's important**:
- Prevents excessive Anthropic API costs from spam
- Protects against DoS attacks
- Standard security best practice

**Suggested implementation**:
- Use `@vercel/edge-rate-limit` or similar
- Apply per-IP rate limits (e.g., 100 requests/hour for free tier, 1000 for Pro)

---

## 📝 Notes

- The fix maintains backward compatibility - unauthenticated users can still use the free calculator
- Pro status is checked on every request (no caching) to ensure instant updates when subscriptions change
- Logging has been kept minimal to avoid exposing sensitive data in production logs
- All changes follow the principle of "never trust the client"

---

**Date Fixed**: 2026-01-11
**Fixed By**: Claude Code
**Severity**: Critical
**CVE**: Internal (not publicly disclosed)
