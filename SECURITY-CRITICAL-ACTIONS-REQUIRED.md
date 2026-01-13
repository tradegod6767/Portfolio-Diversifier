# 🚨 CRITICAL SECURITY ACTIONS REQUIRED IMMEDIATELY 🚨

**Date Created:** January 11, 2026
**Severity:** CRITICAL - ACTION REQUIRED TODAY
**Status:** ⚠️ EXPOSED SECRETS IN VERSION CONTROL

---

## ⚠️ EMERGENCY: SECRETS EXPOSED IN GIT REPOSITORY

**Your `.env` and `.env.production` files contain production secrets that may be committed to version control.**

### Files Containing Exposed Secrets:
- `portfolio-rebalancer/.env` ← Contains ALL production keys
- `portfolio-rebalancer/.env.production` ← Contains Vercel OIDC token

### Exposed Secrets (ALL MUST BE ROTATED):

1. **Supabase Service Role Key** (CRITICAL)
   - Current: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Impact: Complete database access, bypass all security
   - **Action: ROTATE IMMEDIATELY**

2. **Stripe Secret Key** (CRITICAL)
   - Current: `sk_test_51RrOXQDdHPHUg1D9...`
   - Impact: Access to payment data, refund fraud
   - **Action: ROTATE IMMEDIATELY**

3. **Anthropic API Key** (CRITICAL)
   - Current: `sk-ant-api03-4NDIPC5HoyHC...`
   - Impact: Unauthorized AI API usage, cost overruns
   - **Action: ROTATE IMMEDIATELY**

4. **Vercel OIDC Token** (CRITICAL)
   - Current: `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIs...`
   - Impact: Deployment access, infrastructure compromise
   - **Action: REVOKE IMMEDIATELY**

---

## 🔥 IMMEDIATE ACTIONS (DO NOW - BEFORE ANY OTHER WORK)

### Step 1: Check If Secrets Are Public

```bash
# Check if this repo is public or has been pushed
cd portfolio-rebalancer
git log --all -- .env .env.production

# If you see commits, check GitHub/GitLab
# If public repo: ❌ Secrets are compromised - proceed urgently
# If private repo: ⚠️ Still rotate (team members, backups)
```

### Step 2: Rotate All Secrets (Takes 30 minutes)

#### A. Supabase Keys
1. Go to https://app.supabase.com/project/gfuarcyulekmrkivcjzk/settings/api
2. Click "Reset service role key"
3. Copy new key to your local `.env` (NOT committed)
4. Add to Vercel environment variables
5. Redeploy all functions

#### B. Stripe Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Click "Roll key" next to secret key
3. Copy new key to local `.env`
4. Add to Vercel environment variables
5. Update any saved webhooks

#### C. Anthropic API Key
1. Go to https://console.anthropic.com/settings/keys
2. Delete old key `sk-ant-api03-4NDIPC5HoyHC...`
3. Create new key
4. Copy to local `.env`
5. Add to Vercel environment variables

#### D. Vercel OIDC Token
1. Go to Vercel project settings
2. Under "OIDC Token", click "Regenerate"
3. Copy to local `.env.production` if needed
4. **DO NOT commit this file**

### Step 3: Clean Git History (Required)

```bash
cd portfolio-rebalancer

# Option 1: BFG Repo-Cleaner (Recommended - Fast)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
java -jar bfg.jar --delete-files .env.production
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Option 2: git filter-repo (Alternative)
git filter-repo --path .env --invert-paths
git filter-repo --path .env.production --invert-paths

# Option 3: Force push (Nuclear - loses all history)
# WARNING: This deletes ALL git history
# Only use if repo is private and you have backups
git checkout --orphan temp_branch
git add -A
git commit -m "Initial commit (cleaned secrets)"
git branch -D master
git branch -m master
git push -f origin master
```

### Step 4: Add .gitignore Protections

```bash
# Already done by this security audit
# Verify .gitignore includes:
cat .gitignore | grep "\.env"

# Should see:
# .env
# .env.local
# .env.production
# .env*.local
```

### Step 5: Add Pre-commit Hooks (Prevent Future Leaks)

```bash
cd portfolio-rebalancer
npm install --save-dev @commitlint/cli husky

# Create .husky/pre-commit
npx husky add .husky/pre-commit "npm run check-secrets"
```

Add to `package.json`:
```json
{
  "scripts": {
    "check-secrets": "git diff --cached --name-only | grep -E '\\.env$|\\.env\\.' && echo '❌ ERROR: .env files detected in commit!' && exit 1 || exit 0"
  }
}
```

---

## 🛡️ CODE FIXES APPLIED (By Security Audit)

The following vulnerabilities have been **automatically fixed**:

### ✅ Fixed: Authentication on Checkout Endpoint
- **File:** `api/create-checkout-session.js`
- **Change:** Now requires authentication before creating sessions
- **Impact:** Prevents privilege escalation attacks

### ✅ Fixed: Pro Status Verification
- **Files:** `src/lib/auth.js`, `src/hooks/useAuth.js`
- **Change:** Client now checks `subscription_status === 'active'` (consistent with server)
- **Impact:** Prevents expired subscriptions from seeing Pro features

### ✅ Fixed: Gumroad Webhook Security
- **File:** `api/gumroad-webhook.js`
- **Change:** Secret now required in header instead of query parameter
- **Impact:** Prevents secret leakage in logs

### ✅ Fixed: Input Validation
- **Files:** `api/gumroad-webhook.js`, `api/stripe-webhook.js`
- **Change:** Comprehensive validation of all webhook fields
- **Impact:** Prevents malformed data attacks

### ✅ Fixed: Rate Limiting Fail-Safe
- **File:** `api/_ratelimit.js`
- **Change:** Returns 503 when Redis unavailable instead of bypassing
- **Impact:** Prevents cost overruns during outages

### ✅ Fixed: Error Message Sanitization
- **Files:** `api/stripe-webhook.js`, `api/create-checkout-session.js`
- **Change:** Generic error messages, no stack traces in production
- **Impact:** Prevents information leakage

---

## 📋 VERIFICATION CHECKLIST

After completing all actions, verify:

- [ ] All API keys have been rotated (Supabase, Stripe, Anthropic, Vercel)
- [ ] `.env` files removed from git history
- [ ] `.gitignore` includes `.env*`
- [ ] Pre-commit hooks installed
- [ ] Vercel environment variables updated with new keys
- [ ] Application redeployed and tested
- [ ] Old keys confirmed non-functional
- [ ] No secrets in `git log --all --full-history`

---

## ⏱️ TIMELINE

| Action | Priority | Time Required |
|--------|----------|---------------|
| Rotate Supabase keys | 🔴 Critical | 5 min |
| Rotate Stripe keys | 🔴 Critical | 5 min |
| Rotate Anthropic key | 🔴 Critical | 3 min |
| Revoke Vercel token | 🔴 Critical | 3 min |
| Clean git history | 🟠 High | 10 min |
| Update Vercel env vars | 🟠 High | 5 min |
| Test application | 🟠 High | 10 min |
| **TOTAL** | | **41 min** |

---

## 🚨 IF REPO IS PUBLIC

If your repository is on GitHub/GitLab as **public**:

1. **Assume all secrets are compromised**
2. **Check for unauthorized usage**:
   - Supabase: Check auth logs for suspicious logins
   - Stripe: Review transactions for fraud
   - Anthropic: Check API usage for spikes
   - Vercel: Check deployment logs for unauthorized deploys

3. **Consider these additional steps**:
   - Audit all user accounts for unauthorized Pro status
   - Review database for data tampering
   - Check Stripe for refund fraud
   - Monitor Anthropic bill for unusual charges
   - Force-expire all user sessions (reset tokens)

4. **Contact Support**:
   - Stripe: Report potential key compromise
   - Supabase: Request security audit of your project
   - Anthropic: Monitor for unusual activity

---

## 📞 SUPPORT CONTACTS

If you need help:
- Supabase Support: https://supabase.com/dashboard/support
- Stripe Security: security@stripe.com
- Anthropic Support: support@anthropic.com
- Vercel Support: https://vercel.com/help

---

## 🔐 LONG-TERM IMPROVEMENTS

After addressing immediate issues:

1. **Secrets Management**
   - Use Vercel's built-in secret management
   - Never commit `.env` files
   - Use encrypted secrets in CI/CD

2. **Access Control**
   - Implement principle of least privilege
   - Rotate keys quarterly
   - Use separate keys for dev/staging/prod

3. **Monitoring**
   - Set up Stripe fraud detection
   - Monitor Anthropic API usage
   - Alert on unusual Supabase queries
   - Log all Pro status changes

4. **Security Testing**
   - Schedule quarterly penetration tests
   - Implement automated secret scanning
   - Use Dependabot for dependency vulnerabilities

---

## ✅ MARK AS COMPLETE

Once all critical actions are complete:

1. Delete or archive this file
2. Document remediation in your security log
3. Schedule next security review (quarterly recommended)
4. Update team on new secret management procedures

---

**DO NOT PROCEED WITH DEVELOPMENT UNTIL ALL CRITICAL ACTIONS ARE COMPLETE**

**Questions?** Review the detailed security audit report for technical details.
