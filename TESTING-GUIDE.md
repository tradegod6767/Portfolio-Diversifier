# Testing Guide - Portfolio Rebalancer

**Production URL**: https://rebalancekit.com

This guide shows you how to test your deployed application to verify everything is working correctly.

---

## 🚀 Quick Test (Easiest)

### Option 1: Test in Your Browser

1. **Open your app**: https://rebalancekit.com

2. **Click "Try Calculator" or "Load Example Portfolio"**

3. **The calculator should load with example data:**
   - VTI: $30,000 (60%)
   - BND: $15,000 (30%)
   - CASH: $5,000 (10%)

4. **Click "Calculate Rebalancing"**

5. **You should see:**
   - ✅ Portfolio summary
   - ✅ Pie charts
   - ✅ AI-generated analysis (with upgrade prompt at the end)
   - ✅ Results table

**Expected**: Everything works, no errors, you get an AI explanation

**If you see an error**: Check the browser console (F12) for error messages

---

## 🧪 Option 2: Test Using Command Line

### Test Free Tier (No Authentication)

```bash
# In your portfolio-rebalancer directory
node test-explain-api.js https://rebalancekit.com
```

**Expected Output:**
```
🧪 Testing /api/explain endpoint...
📍 URL: https://rebalancekit.com/api/explain

📤 Sending request...
📥 Response status: 200 OK

✅ SUCCESS!

📄 Response:
{
  "explanation": "Your portfolio analysis..."
}
```

**What this tests:**
- ✅ API endpoint is accessible
- ✅ Free tier works without authentication
- ✅ AI analysis is generated
- ✅ No 500 errors

---

## 🔐 Option 3: Test With Authentication

If you have a user account, test the authenticated flow:

### Step 1: Get Your Auth Token

1. **Login to your app**: https://rebalancekit.com
2. **Open Browser DevTools**: Press `F12`
3. **Go to Console tab**
4. **Run this command:**
   ```javascript
   (await supabase.auth.getSession()).data.session.access_token
   ```
5. **Copy the token** (long string starting with `eyJ...`)

### Step 2: Test With Your Token

```bash
# Replace YOUR_TOKEN with the actual token
curl -X POST https://rebalancekit.com/api/explain \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

**Expected for Free User:**
- Response includes: "Upgrade to Pro for detailed tax optimization..."
- Response length: ~800-1500 characters

**Expected for Pro User:**
- Response includes: Detailed tax analysis
- Response length: ~1500-2000 characters
- No upgrade prompt

---

## ✅ Testing Checklist

### Free Tier Tests

- [ ] **Homepage loads**
  - Visit: https://rebalancekit.com
  - Should see: Landing page with "Try Calculator" button

- [ ] **Calculator works without login**
  - Click "Try Calculator"
  - Click "Calculate Rebalancing"
  - Should see: Results with AI analysis

- [ ] **AI Analysis is generated**
  - Look for: Professional portfolio analysis text
  - Should see: 2-3 paragraphs about your portfolio

- [ ] **Upgrade prompt appears**
  - Look for: "Upgrade to Pro for detailed tax optimization..."
  - Should appear: At the end of the AI analysis

- [ ] **No 500 errors**
  - Check: Browser console (F12)
  - Should see: No red errors

### Authenticated User Tests

- [ ] **Can create account**
  - Click "Sign Up"
  - Enter email and password
  - Should see: Confirmation or login

- [ ] **Can login**
  - Click "Login"
  - Enter credentials
  - Should see: Logged in state

- [ ] **Can save portfolios**
  - Enter portfolio data
  - Click "Save Portfolio"
  - Enter name
  - Should see: Portfolio saved

- [ ] **Can load saved portfolios**
  - Click "Load Portfolio"
  - Select a saved portfolio
  - Should see: Portfolio data loaded

### Pro User Tests (If you have a Pro subscription)

- [ ] **Pro features unlocked**
  - Login as Pro user
  - Calculate rebalancing
  - Should see: All features unlocked (no blur/paywall)

- [ ] **Health Score visible**
  - Should see: Portfolio health score (0-100)
  - Should see: Color-coded rating

- [ ] **Tax Impact visible**
  - Should see: Estimated capital gains
  - Should see: Tax impact breakdown

- [ ] **Model Comparison visible**
  - Should see: Comparison to 60/40, 3-fund, etc.

- [ ] **PDF Export works**
  - Click "Export PDF"
  - Should see: PDF download with charts

- [ ] **Detailed AI analysis**
  - Check length: ~1500-2000 characters
  - Should include: Specific tax strategies
  - Should NOT include: Upgrade prompt

### Security Tests

- [ ] **CORS restriction works**
  - Try accessing API from random website
  - Should see: CORS error (blocked)

- [ ] **Webhook requires secret**
  - Test: `curl -X POST https://rebalancekit.com/api/gumroad-webhook -d '{}'`
  - Expected: 401 Unauthorized

- [ ] **Email endpoint requires auth**
  - Test: `curl -X POST https://rebalancekit.com/api/send-email -d '{"type":"welcome","email":"test@test.com"}'`
  - Expected: 401 Unauthorized

---

## 🔍 How to Check if Security Fixes Are Working

### Test 1: Free Users Can't Bypass Pro

**Try to fake Pro status:**
```bash
curl -X POST https://rebalancekit.com/api/explain \
  -H "Content-Type: application/json" \
  -d '{
    "rebalancingData": {"totalValue": 50000, "positions": [{"ticker":"VTI","currentPercent":60,"targetPercent":60,"action":"HOLD","difference":0}]},
    "isPro": true
  }'
```

**Expected**: Still get free tier response (with upgrade prompt)

**Why**: Server ignores client-sent `isPro` flag and verifies from database

### Test 2: Webhook Requires Secret

**Try to call webhook without secret:**
```bash
curl -X POST https://rebalancekit.com/api/gumroad-webhook \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","subscription_id":"fake123"}'
```

**Expected**:
```json
{
  "error": "Unauthorized - invalid webhook secret"
}
```

**Status Code**: 401 Unauthorized

### Test 3: Email Endpoint Requires Auth

**Try to send email without auth:**
```bash
curl -X POST https://rebalancekit.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","email":"victim@example.com"}'
```

**Expected**: 401 Unauthorized or 403 Forbidden

---

## 🎯 What to Look For

### ✅ Good Signs

- Homepage loads quickly
- Calculator works without login
- AI analysis is generated
- No 500 errors in browser console
- API returns 200 OK
- Charts render properly
- Forms are responsive

### ❌ Bad Signs

- 500 Internal Server Error
- "Failed to generate explanation" message
- Blank AI analysis
- Console errors about missing modules
- CORS errors (unless expected)
- Slow response times (>10 seconds)

---

## 🐛 Troubleshooting

### Issue: "Failed to generate explanation"

**Possible Causes:**
1. `ANTHROPIC_API_KEY` not set in Vercel
2. Anthropic API quota exceeded
3. Invalid API key

**How to Fix:**
1. Check Vercel environment variables
2. Check Anthropic dashboard for API usage
3. Regenerate API key if needed

### Issue: Pro Features Not Working

**Possible Causes:**
1. Not logged in
2. Subscription not active in Supabase
3. User metadata not updated

**How to Fix:**
1. Login to your account
2. Check Supabase → Auth → Users → View user metadata
3. Verify: `is_pro: true` and `subscription_status: 'active'`

### Issue: Webhook Not Updating Subscription

**Possible Causes:**
1. Webhook URL doesn't include secret
2. Secret mismatch between Gumroad and Vercel env var
3. User email doesn't match Supabase account

**How to Fix:**
1. Update Gumroad webhook URL: `https://rebalancekit.com/api/gumroad-webhook?secret=YOUR_SECRET`
2. Verify `GUMROAD_WEBHOOK_SECRET` in Vercel matches URL
3. Check Vercel logs for webhook errors

---

## 📊 Using Browser DevTools

### Check for Errors

1. **Open DevTools**: Press `F12`
2. **Go to Console tab**
3. **Look for red errors**
4. **Common errors:**
   - ❌ CORS errors → Check API endpoint CORS settings
   - ❌ 401 Unauthorized → Authentication issue
   - ❌ 500 Internal Server Error → Check Vercel logs

### Check Network Requests

1. **Open DevTools**: Press `F12`
2. **Go to Network tab**
3. **Reload page**
4. **Look for failed requests (red)**
5. **Click on request to see details**

### Check if Pro Status is Set

```javascript
// In browser console after logging in
supabase.auth.getUser().then(({data}) => {
  console.log('User metadata:', data.user.user_metadata);
  console.log('Is Pro?:', data.user.user_metadata.is_pro);
  console.log('Subscription status:', data.user.user_metadata.subscription_status);
});
```

---

## 🧪 Advanced Testing

### Test All Rebalancing Modes

1. **Standard Mode**: Default rebalancing
2. **Add Money**: Enter contribution amount
3. **Withdraw**: Enter withdrawal amount
4. **Add-Only Mode**: Tax-efficient (buy only)

**For each mode:**
- Enter different portfolio data
- Click "Calculate Rebalancing"
- Verify results make sense

### Test Portfolio Import

1. **Click "Import Portfolio"**
2. **Try CSV format:**
   ```csv
   VTI,30000,60
   BND,15000,30
   CASH,5000,10
   ```
3. **Try text format:**
   ```
   VTI 30000 60
   BND 15000 30
   CASH 5000 10
   ```

**Expected**: Portfolio data loads into calculator

### Test Edge Cases

1. **Empty portfolio**: Try with no positions
2. **Single position**: Try with only one ticker
3. **Large numbers**: Try with millions in portfolio value
4. **Small numbers**: Try with under $1000
5. **Extreme allocations**: Try 100% in one position

---

## 📝 Test Results Template

Copy this and fill it out as you test:

```
## Test Results - [Date]

### Free Tier
- [ ] Homepage loads: ___
- [ ] Calculator works: ___
- [ ] AI analysis generated: ___
- [ ] No errors: ___

### Authentication
- [ ] Can create account: ___
- [ ] Can login: ___
- [ ] Can save portfolios: ___
- [ ] Can load portfolios: ___

### Pro Features (if applicable)
- [ ] Health score visible: ___
- [ ] Tax impact visible: ___
- [ ] Model comparison visible: ___
- [ ] PDF export works: ___

### Security
- [ ] Can't bypass Pro with isPro flag: ___
- [ ] Webhook requires secret: ___
- [ ] Email requires auth: ___

### Issues Found
- None / [List any issues]

### Overall Status
✅ PASS / ❌ FAIL

### Notes
[Any additional observations]
```

---

## 🚀 Quick Start Testing

**The fastest way to test right now:**

1. **Open in browser**: https://rebalancekit.com
2. **Click "Try Calculator"**
3. **Click "Calculate Rebalancing"**
4. **Did you see results?** ✅ It works!

**Or use the command line:**
```bash
cd portfolio-rebalancer
node test-explain-api.js https://rebalancekit.com
```

**Expected**: `✅ SUCCESS!` with AI-generated explanation

---

## 📞 Need Help?

If tests are failing:

1. **Check Vercel logs**:
   ```bash
   vercel logs https://rebalancekit.com --follow
   ```

2. **Check browser console** (F12) for error messages

3. **Run local test** to compare:
   ```bash
   node test-explain-api.js http://localhost:3000
   ```

4. **Check environment variables** in Vercel dashboard

---

**Ready to test? Start with the Quick Test in your browser!** 🎯
