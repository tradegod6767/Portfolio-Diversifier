# 500 Error Fix - Summary

## 🔍 Root Cause Analysis

The 500 Internal Server Error on `/api/explain` was caused by:

### **Primary Issue: Missing Error Handling in Authentication**

When `api/_auth.js` tried to create a Supabase client:
- If `SUPABASE_SERVICE_ROLE_KEY` was undefined in Vercel, `createClient()` would throw an exception
- This exception wasn't caught, causing the entire endpoint to crash with 500 error
- Even **unauthenticated free tier users** were affected because the auth function was called before checking if a token existed

### **Secondary Issues:**
1. No environment variable validation before using them
2. No try/catch around authentication logic in `explain.js`
3. Insufficient error logging to diagnose the issue

---

## ✅ Fixes Applied

### **1. Enhanced `api/_auth.js`**

**Added environment variable checks:**
```javascript
// Before creating Supabase client, check if vars exist
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[Auth] Missing Supabase environment variables')
  return { user: null, error: new Error('Supabase not configured') }
}
```

**Added error logging:**
```javascript
} catch (error) {
  console.error('[Auth] Error in getAuthenticatedUser:', error)
  return { user: null, error }
}
```

**Applied to:**
- `getAuthenticatedUser()` function
- `getUserByEmail()` function

### **2. Improved `api/explain.js`**

**Wrapped auth in try/catch:**
```javascript
try {
  const { user, isPro, error: authError } = await authenticateRequest(req);
  // ... handle auth
} catch (authException) {
  // If auth completely fails, continue as free tier
  console.error('[Explain API] Auth exception (continuing as free tier):', authException);
  isProUser = false;
}
```

**Enhanced error logging:**
```javascript
} catch (error) {
  console.error('[Explain API] Error in handler:', error);
  console.error('[Explain API] Error stack:', error.stack);
  console.error('[Explain API] Error details:', {
    message: error.message,
    name: error.name,
    code: error.code
  });
  // ... return graceful error response
}
```

### **3. Created Diagnostic Tools**

- `TROUBLESHOOTING-500-ERROR.md` - Complete troubleshooting guide
- `test-explain-api.js` - Test script to verify the endpoint works

---

## 🚀 What You Need to Do Now

### **Step 1: Verify Environment Variables in Vercel**

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

**Ensure these are set for Production:**

| Variable | Example Value | Where to Get It |
|----------|---------------|-----------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase → Settings → API (service_role) |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Anthropic Console |

⚠️ **IMPORTANT**:
- Use the **service_role** key (NOT the anon key!)
- Check the **Production** checkbox when adding variables
- Must redeploy after adding variables

### **Step 2: Redeploy to Vercel**

After verifying environment variables:

```bash
vercel --prod
```

Or use Vercel Dashboard → Deployments → Redeploy

### **Step 3: Test the Fix**

**Option A: Use the test script**
```bash
node test-explain-api.js https://your-domain.com
```

**Option B: Use curl**
```bash
curl -X POST https://your-domain.com/api/explain \
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

**Expected Response (Success):**
```json
{
  "explanation": "Your portfolio analysis..."
}
```

### **Step 4: Check Vercel Logs**

After deployment, monitor logs:

**Vercel Dashboard** → **Deployments** → Latest → **Functions** → `api/explain.js` → **View Logs**

**Look for:**

✅ **Success Logs:**
```
[Explain API] Unauthenticated request, using free tier
[Explain API] Auth error details: Missing or invalid authorization header
```

❌ **Still Failing:**
```
[Auth] Missing Supabase environment variables
```
→ Environment variable not set properly in Vercel

---

## 🧪 Test Locally First (Recommended)

Before deploying to Vercel, test locally:

```bash
# 1. Start your dev server
npm run dev

# 2. In another terminal, run the test
node test-explain-api.js http://localhost:5173
```

**Expected Output:**
```
🧪 Testing /api/explain endpoint...
📍 URL: http://localhost:5173/api/explain

📤 Sending request...
📥 Response status: 200 OK

✅ SUCCESS!

📄 Response:
{
  "explanation": "..."
}
```

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Local environment variables in `.env` are set correctly
- [ ] Test script runs successfully locally: `node test-explain-api.js`
- [ ] Vercel environment variables are set for **Production**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key (not anon)
- [ ] Code changes have been committed to git
- [ ] Ready to deploy: `vercel --prod`

---

## 🎯 Expected Behavior After Fix

### **Scenario 1: Free User (No Auth Token)**
- Request: No `Authorization` header
- Auth Result: Returns error, continues as free tier
- Response: 200 OK with 800-token explanation + upgrade prompt
- Logs: `[Explain API] Unauthenticated request, using free tier`

### **Scenario 2: Pro User (Valid Auth Token)**
- Request: `Authorization: Bearer <valid-token>`
- Auth Result: User verified, Pro status checked from DB
- Response: 200 OK with 1500-token detailed tax analysis
- Logs: `[Explain API] Authenticated user, isPro: true`

### **Scenario 3: Invalid/Expired Token**
- Request: `Authorization: Bearer <expired-token>`
- Auth Result: Token invalid, continues as free tier
- Response: 200 OK with free tier response
- Logs: `[Explain API] Auth error details: Invalid token`

### **Scenario 4: Missing Environment Variables (Vercel)**
- **Before Fix**: 500 Internal Server Error (crash)
- **After Fix**: Falls back to free tier, returns 200 OK
- Logs: `[Auth] Missing Supabase environment variables`

---

## 🔍 If Still Getting 500 Error

### **Most Likely Causes:**

1. **Missing `ANTHROPIC_API_KEY`**
   - Check: Vercel environment variables
   - Fix: Add the Claude API key

2. **Wrong Supabase Keys**
   - Using `anon` key instead of `service_role` key
   - Fix: Get the correct key from Supabase dashboard

3. **Environment Variable Not Enabled for Production**
   - Variable exists but not checked for "Production" environment
   - Fix: Edit variable, check "Production", redeploy

4. **Didn't Redeploy After Adding Variables**
   - Variables added but deployment not triggered
   - Fix: Run `vercel --prod` or redeploy in dashboard

### **Debugging Steps:**

1. Check Vercel function logs for exact error message
2. Compare local `.env` with Vercel environment variables
3. Run test script locally first to isolate the issue
4. Temporarily add `NODE_ENV=development` to see error details in response

---

## 📊 Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `api/_auth.js` | Added env var checks, error logging | Prevent crashes from missing config |
| `api/explain.js` | Wrapped auth in try/catch, enhanced logging | Gracefully handle auth failures |
| `TROUBLESHOOTING-500-ERROR.md` | Created | Complete diagnostic guide |
| `test-explain-api.js` | Created | Easy testing tool |
| `500-ERROR-FIX-SUMMARY.md` | Created | This summary |

---

## ✅ Success Criteria

The fix is successful when:

1. ✅ Free users can call `/api/explain` without auth and get a response
2. ✅ Pro users get enhanced analysis when authenticated
3. ✅ No 500 errors even if Supabase keys are missing
4. ✅ Clear error logs in Vercel for debugging
5. ✅ Graceful fallback to free tier if auth fails

---

## 📞 Next Steps

1. **Verify Vercel environment variables** (most important!)
2. **Test locally** with `node test-explain-api.js`
3. **Deploy to Vercel** with `vercel --prod`
4. **Check Vercel logs** to confirm success
5. **Test in browser** with your actual app

---

**Status**: ✅ Code fixes applied, awaiting deployment
**Last Updated**: 2026-01-11
**Author**: Claude Code Security Team
