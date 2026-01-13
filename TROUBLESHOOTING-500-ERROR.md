# Troubleshooting 500 Error on /api/explain

## 🔧 Fixes Applied

I've updated the code to be more resilient and provide better error logging.

### Changes Made:

1. **`api/_auth.js`**: Added environment variable checks before creating Supabase client
2. **`api/explain.js`**: Added try/catch around authentication to allow free tier to work even if auth fails
3. **Better Error Logging**: Added detailed console.error statements to help debug

---

## ✅ Quick Diagnostic Steps

### Step 1: Check Vercel Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

**Required Variables:**

| Variable | Required? | Where to Find |
|----------|-----------|---------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase Dashboard → Settings → API → service_role (secret!) |
| `ANTHROPIC_API_KEY` | ✅ Yes | Anthropic Console |
| `RESEND_API_KEY` | ⚠️ Optional | Only needed for emails |
| `GUMROAD_WEBHOOK_SECRET` | ⚠️ Optional | Only needed for webhooks |

**IMPORTANT**: Make sure these are set for **Production** environment!

### Step 2: Check Vercel Logs

1. Go to **Vercel Dashboard** → **Deployments**
2. Click on your latest deployment
3. Click **Functions** → Find `api/explain.js`
4. Click **View Logs**

**Look for these log messages:**

✅ **Working (Free tier):**
```
[Explain API] Unauthenticated request, using free tier
[Explain API] Auth error details: Missing or invalid authorization header
```

✅ **Working (Pro user):**
```
[Explain API] Authenticated user, isPro: true
```

❌ **Error - Missing Environment Variable:**
```
[Auth] Missing Supabase environment variables
```

❌ **Error - Claude API:**
```
ANTHROPIC_API_KEY is not set in environment variables
```

### Step 3: Test Locally First

Before deploying, test locally:

```bash
# 1. Make sure .env has all variables
cat .env

# 2. Start dev server
npm run dev

# 3. Test the endpoint (in another terminal)
curl -X POST http://localhost:5173/api/explain \
  -H "Content-Type: application/json" \
  -d '{
    "rebalancingData": {
      "totalValue": 50000,
      "positions": [
        {
          "ticker": "VTI",
          "currentPercent": 60,
          "targetPercent": 60,
          "action": "HOLD",
          "difference": 0
        }
      ]
    }
  }'
```

**Expected**: Should return JSON with `explanation` field

### Step 4: Deploy to Vercel

After local testing works:

```bash
# Deploy
vercel --prod

# Watch logs in real-time
vercel logs --follow
```

---

## 🔍 Common Error Scenarios

### Error 1: "Missing Supabase environment variables"

**Cause**: `SUPABASE_SERVICE_ROLE_KEY` not set in Vercel

**Fix**:
1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (under "Project API keys")
3. Add to Vercel: Settings → Environment Variables
4. Key: `SUPABASE_SERVICE_ROLE_KEY`
5. Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (your actual key)
6. Environment: **Production** (check this box!)
7. **Redeploy** after adding

### Error 2: "ANTHROPIC_API_KEY is not set"

**Cause**: Anthropic API key missing from Vercel

**Fix**:
1. Go to Anthropic Console → API Keys
2. Copy your API key
3. Add to Vercel environment variables
4. Redeploy

### Error 3: "Cannot find module './_auth.js'"

**Cause**: Import path issue in serverless environment

**Status**: Should be fixed with current code, but if this persists:

**Fix**: Rename `api/_auth.js` to `api/auth-utils.js` and update imports:

```javascript
// In api/explain.js
import { authenticateRequest } from './auth-utils.js';
```

### Error 4: Free tier users getting 500 error

**Cause**: Authentication was throwing exceptions for unauthenticated users

**Status**: ✅ **FIXED** - Now wrapped in try/catch, falls back to free tier

---

## 🧪 Testing the Fix

### Test 1: Free Tier (No Authentication)

```bash
curl -X POST https://your-domain.com/api/explain \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-domain.com" \
  -d '{
    "rebalancingData": {
      "totalValue": 50000,
      "positions": [
        {"ticker": "VTI", "currentPercent": 60, "targetPercent": 60, "action": "HOLD", "difference": 0}
      ]
    }
  }'
```

**Expected Response:**
- Status: `200 OK`
- Contains: `{"explanation": "..."}` (800 tokens max, upgrade prompt)

### Test 2: Pro User (With Authentication)

First, get a user's auth token:
1. Login to your app
2. Open browser DevTools → Console
3. Run: `(await supabase.auth.getSession()).data.session.access_token`
4. Copy the token

```bash
curl -X POST https://your-domain.com/api/explain \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Origin: https://your-domain.com" \
  -d '{
    "rebalancingData": {
      "totalValue": 50000,
      "positions": [
        {"ticker": "VTI", "currentPercent": 60, "targetPercent": 60, "action": "HOLD", "difference": 0}
      ]
    }
  }'
```

**Expected Response:**
- Status: `200 OK`
- Contains: `{"explanation": "..."}` (1500 tokens max, detailed tax info)

---

## 📊 Vercel Environment Variable Checklist

Before deploying, ensure:

- [ ] `VITE_SUPABASE_URL` is set to your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (NOT the anon key!)
- [ ] `ANTHROPIC_API_KEY` is set (starts with `sk-ant-`)
- [ ] All variables are enabled for **Production** environment
- [ ] You've redeployed after adding/changing environment variables

**⚠️ CRITICAL**: Always redeploy after changing environment variables!

```bash
vercel --prod
```

---

## 🐛 Still Getting 500 Error?

If the error persists after following all steps above:

### 1. Check Vercel Function Logs

Look for the **exact error message** in:
- Vercel Dashboard → Deployments → Functions → api/explain → View Logs

### 2. Common Log Messages

| Log Message | Meaning | Fix |
|-------------|---------|-----|
| `[Auth] Missing Supabase environment variables` | Env vars not set | Add to Vercel settings |
| `ANTHROPIC_API_KEY is not set` | Claude API key missing | Add to Vercel settings |
| `Cannot find module` | Import path issue | Check file exists in api/ folder |
| `Invalid token` | User's auth token expired | User needs to re-login |
| `Supabase not configured` | Service role key invalid | Check key is correct |

### 3. Enable Development Error Details

Temporarily add this to your Vercel environment variables:

```
NODE_ENV=development
```

This will return error details in the API response (remove after debugging!)

### 4. Check Vercel Deployment Status

Ensure the latest deployment succeeded:
- Vercel Dashboard → Deployments
- Latest deployment should show "Ready" with green checkmark
- If "Failed", click to see build logs

---

## 📞 Need More Help?

If you're still stuck, provide:

1. **Exact error message** from Vercel function logs
2. **Environment variables** you have set (names only, not values!)
3. **Test curl command** you're running
4. **Which user scenario** (free tier or authenticated Pro user)

---

**Last Updated**: 2026-01-11
**Status**: Fixes applied, awaiting deployment
