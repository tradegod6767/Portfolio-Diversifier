# RebalanceKit Security & Code Audit Report
**Date:** 2026-03-16
**Auditor:** Claude Code

## Executive Summary

RebalanceKit is a React 19 + Vite 7 SaaS application with Vercel serverless API functions, Supabase for auth/database, Gumroad for payments, and Anthropic Claude for AI analysis. The codebase demonstrates solid security awareness in its server-side code (proper auth verification, CORS whitelist, rate limiting infrastructure), but contains several critical and medium vulnerabilities — most notably a webhook authentication bypass, a subscription status trust problem stemming from `user_metadata`, and a client-side paywall that can be bypassed via DevTools. Immediate action is required on the top findings before this product handles production payment traffic at scale.

## Overall Health Score: 62/100
- Security: 19/30
- Code Quality: 15/20
- Performance: 11/15
- Reliability: 9/15
- SEO & Accessibility: 8/10
- DevOps: 0/10

## Findings Summary
- 🔴 Critical: 4
- 🟡 Medium: 11
- 🟢 Low: 9

## Top 5 Most Urgent Fixes

1. **Gumroad webhook uses query-string secret instead of HMAC signature** — any attacker who observes the webhook URL (e.g., in Gumroad dashboard, logs, or referrer headers) can forge a webhook and grant themselves Pro access.
2. **Pro status read from `user_metadata` which users can write** — Supabase allows authenticated users to update their own `user_metadata` via `supabase.auth.updateUser()`. An authenticated user could set `is_pro: true` and bypass the paywall entirely.
3. **`/api/send-email` has no authentication** — any unauthenticated caller can send arbitrary emails (welcome, proUpgrade, subscriptionCancelled) from your domain to any address, enabling phishing and reputation damage.
4. **PDF export is client-side only with no server-side Pro gate** — the `isPro` prop is passed from the client; a user who manipulates the React component tree in DevTools can export PDFs without a subscription.
5. **No CI/CD pipeline, no pre-commit hooks** — secrets or regressions can be merged and deployed without automated checks.

## Quick Wins (< 15 minutes each)

1. Add `Authorization: Bearer <token>` requirement to `/api/send-email` (copy pattern from `/api/cancel-subscription.js`).
2. Add `Content-Security-Policy: script-src` nonce or hash to remove `'unsafe-inline'` and `'unsafe-eval'` from the CSP.
3. Add `NEXT_PUBLIC_APP_URL` rename to `VITE_APP_URL` in `.env.example` and `vite.config.js` (wrong prefix causes env var confusion).

## Systemic Patterns

**Subscription status lives in the wrong place.** All Pro verification — in the frontend (`useAuth.js`), in API routes (`_auth.js`), and in the webhook handler — reads from `auth.user_metadata`. Supabase's `user_metadata` is writable by the authenticated user via the client SDK. The correct approach is to store authoritative subscription state in a server-controlled table (e.g., `user_subscriptions`) and verify it using the service role key. This pattern appears in every layer of the application.

**Rate limiting is optional.** The `_ratelimit.js` module explicitly bypasses all limits when `UPSTASH_REDIS_REST_URL` is not set, and logs a warning rather than blocking. If Upstash is not configured in production, the AI endpoint has no cost protection at all.

**Missing server-side enforcement for Pro features.** PDF generation, portfolio health scoring display, tax estimates, and CSV export are all gated only in the React component layer. A user who modifies `isPro` in the component state or props (via React DevTools or a browser extension) bypasses all paywalls with no server-side check.

---

## Codebase Inventory

### Tech Stack
- **Framework:** React 19.2.0 + Vite 7.2.4 (NOT Next.js — CVE checks for Next.js do not apply)
- **Styling:** TailwindCSS 4.1.17
- **Backend:** Vercel serverless functions (`/api/*.js`)
- **Auth/DB:** Supabase JS v2.89.0
- **Payments:** Gumroad (webhook-based)
- **AI:** Anthropic Claude (`claude-sonnet-4-20250514`)
- **Email:** Resend
- **Rate Limiting:** Upstash Redis (optional / can be disabled)
- **PDF:** jsPDF + html2canvas + jspdf-autotable
- **Routing:** react-router-dom 7.11

### File Counts
- Frontend components: 39 JSX files
- API serverless functions: 9 files (7 handlers + 2 shared utilities)
- SQL migration files: 3 (flat, not in a `supabase/migrations/` directory)
- Test files: 5 (in project root)
- Documentation: 15 markdown files

### API Routes
| File | Method | Auth Required |
|------|--------|---------------|
| `/api/explain.js` | POST | Optional (rate tier varies) |
| `/api/gumroad-webhook.js` | POST | Query-param secret (weak) |
| `/api/cancel-subscription.js` | POST | Yes (Bearer) |
| `/api/delete-account.js` | DELETE | Yes (Bearer) |
| `/api/claim-pending-purchase.js` | POST | Yes (Bearer) |
| `/api/send-email.js` | POST | **No — unauthenticated** |

### Environment Variables
| Variable | Exposed to Client? | Purpose |
|----------|-------------------|---------|
| `VITE_SUPABASE_URL` | Yes (bundled) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (bundled) | Supabase anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Admin DB access — bypasses RLS |
| `GUMROAD_WEBHOOK_SECRET` | No | Webhook query-param secret |
| `ANTHROPIC_API_KEY` | No | Claude API key |
| `RESEND_API_KEY` | No | Transactional email |
| `UPSTASH_REDIS_REST_URL` | No | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Rate limiting |
| `NEXT_PUBLIC_APP_URL` | Partially (wrong prefix) | App URL (should be `VITE_APP_URL`) |

### Supabase Tables
- `portfolios` — user portfolio data
- `user_subscriptions` — subscription tracking
- `webhook_logs` — Gumroad webhook audit trail
- `pending_purchases` — pre-signup Gumroad purchases (referenced in code but not in any migration file)

---

## Security Audit

### 2A. CVE Check

This project uses **React + Vite**, not Next.js. The following Next.js CVEs **do not apply**:
- CVE-2025-29927 (Middleware bypass) — N/A
- CVE-2025-66478 (RSC RCE) — N/A
- CVE-2025-55182 (React RCE) — N/A, React 19.2.0 is current

No applicable CVEs identified for the current dependency versions.

---

### 🔴 CRITICAL: Gumroad Webhook Uses Query-String Secret (Not HMAC)

**Category:** Security
**Location:** `api/gumroad-webhook.js:376-383`
**Issue:** The webhook is authenticated by comparing `req.query.secret` to `process.env.GUMROAD_WEBHOOK_SECRET`. The secret is embedded in the webhook URL itself (e.g., `https://rebalancekit.com/api/gumroad-webhook?secret=abc123`). This URL appears in the Gumroad dashboard, server logs, referrer headers, and potentially browser history. Any party who sees the URL can send arbitrary webhook payloads to grant or revoke Pro subscriptions for any email address.

Additionally, the dev-test bypass (`isDevTest = process.env.NODE_ENV !== 'production' && req.body?.test === true`) means staging/preview deployments accept arbitrary unauthenticated webhook payloads. Vercel preview deployments run with `NODE_ENV=production` — this specific bypass may not trigger — but the pattern is dangerous.

**Exploitation/Impact:** An attacker sends `POST /api/gumroad-webhook?secret=<observed_secret>` with a crafted payload `{ email: "victim@example.com", subscription_id: "fake", cancelled: true }` to revoke a paying customer's Pro access. Conversely, they can grant themselves Pro by sending a sale event. The Gumroad webhook does not support HMAC signatures, so the query-param approach is inherent to Gumroad's architecture. The mitigation is to treat the secret as sufficiently unguessable and ensure it is never logged or leaked — but currently the entire webhook URL (including secret) may appear in request logs.

**Fix:** (1) Use a randomly generated 32+ byte secret and rotate it. (2) Ensure the secret is never logged — add `secret` to log redaction. (3) Consider Gumroad's `x-gumroad-signature` header if available. (4) Add idempotency checks: store processed `sale_id` values in `webhook_logs` and skip duplicate events.

---

### 🔴 CRITICAL: Pro Status Read from User-Writable `user_metadata`

**Category:** Security / Business Logic
**Location:** `api/_auth.js:68-76`, `src/lib/auth.js:108-122`, `src/hooks/useAuth.js:51-54`
**Issue:** The canonical source of truth for Pro status is `user.user_metadata.is_pro` and `user.user_metadata.subscription_status`. Supabase allows any authenticated user to update their own `user_metadata` by calling `supabase.auth.updateUser({ data: { is_pro: true, subscription_status: 'active' } })` from the client SDK. This bypasses all payment validation entirely.

The server-side `verifyProStatus()` function in `_auth.js` also reads from `user_metadata`, meaning even server-verified Pro status can be spoofed by a user before making an API call.

**Exploitation/Impact:** An authenticated free user opens the browser console and runs:
```javascript
await supabase.auth.updateUser({ data: { is_pro: true, subscription_status: 'active' } })
```
They now have full Pro access — unlimited AI analyses (100/hr), AI tax guidance, PDF export, and health scoring — without paying.

**Fix:** Move authoritative Pro status out of `user_metadata` into the `user_subscriptions` table (server-controlled, service role only for writes). The webhook should write to `user_subscriptions` using the service role key. The `_auth.js` `verifyProStatus()` should query `user_subscriptions` using the service role key rather than reading `user_metadata`.

---

### 🔴 CRITICAL: `/api/send-email` Has No Authentication

**Category:** Security
**Location:** `api/send-email.js:380-444`
**Issue:** The `/api/send-email` endpoint accepts POST requests with `{ type, email, userName, accessEnds }` and sends transactional emails (welcome, proUpgrade, subscriptionCancelled) without verifying any Bearer token. Only rate limiting (which is optional and disabled without Redis) prevents abuse.

**Exploitation/Impact:**
1. **Phishing:** An attacker sends `POST /api/send-email` with `{ type: "proUpgrade", email: "victim@example.com" }` to make a user believe they have Pro access when they don't — then launches a secondary attack.
2. **Spam/Reputation damage:** Mass-sending welcome or cancellation emails to harvested addresses damages the `rebalancekit.com` sending reputation with email providers and could result in blacklisting.
3. **Social engineering:** The cancellation email template includes a resubscribe link `https://rebalancekit.gumroad.com/l/fvdfk?email=<victim_email>` that pre-fills the victim's email in Gumroad checkout.

**Fix:** Add `const { user, error: authError } = await authenticateRequest(req)` at the top of the handler, same pattern as `cancel-subscription.js`. Welcome emails can be sent server-side directly from `lib/auth.js` signup without exposing the endpoint.

---

### 🔴 CRITICAL: Client-Side-Only Pro Gate for Premium Features

**Category:** Security / Business Logic
**Location:** `src/components/PaywallWrapper.jsx:67-69`, `src/components/ExportButtons.jsx:8`, `src/utils/pdfGenerator/index.js`
**Issue:** All Pro features (PDF export, portfolio health scoring display, tax impact estimates, model portfolio comparison) are gated exclusively through the `isPro` prop passed in the React component tree. There is no server-side verification when a PDF is generated or when Pro features are rendered. The `isPro` value originates from `useAuth()` which reads `user_metadata` (itself exploitable — see finding above). Even without exploiting `user_metadata`, a user can open React DevTools, find the `PaywallWrapper` component, and change `isPro` from `false` to `true`.

The `/api/explain.js` endpoint does perform server-side Pro verification for the AI feature — this is the correct pattern — but it is the only feature that does so.

**Exploitation/Impact:** A free user with basic React DevTools knowledge can unlock PDF export, health scoring, tax impact estimates, and model comparisons without ever paying.

**Fix:** For PDF generation: move generation to a serverless function (`/api/generate-pdf.js`) that verifies Pro status server-side before generating. For display-only Pro features (health score numbers, comparison data): these are lower risk since the underlying data calculations happen client-side, but the principle should be noted.

---

### 2B. Supabase RLS Analysis

**Tables and RLS Status:**

| Table | RLS Enabled | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|------------|--------|--------|--------|--------|-------|
| `portfolios` | Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | Good |
| `user_subscriptions` (migration 1) | Yes | `auth.uid() = id` | No policy | No user policy | No policy | Partial |
| `user_subscriptions` (migration 3) | Yes | `auth.uid() = user_id` | No policy | No user policy | No policy | Partial |
| `webhook_logs` | Yes | No user policy | No user policy | No user policy | No user policy | Service role only — OK |
| `pending_purchases` | Unknown | — | — | — | — | **No migration file found** |

### 🟡 MEDIUM: `pending_purchases` Table Has No Migration File

**Category:** Security / Reliability
**Location:** `api/gumroad-webhook.js:29-57`, `api/claim-pending-purchase.js:105-113`
**Issue:** The `pending_purchases` table is read from and written to by two API endpoints but does not appear in any of the three SQL migration files. RLS may not be enabled on this table, and its schema is undefined in the codebase. If RLS is not enabled, any authenticated user could read all pending purchases (exposing email addresses and Gumroad sale IDs for all pre-signup purchasers).

**Exploitation/Impact:** Unauthenticated (via anon key) or authenticated users can enumerate pending purchases and claim Pro status for purchases that belong to others if the `claimed_by_user_id` check is not enforced at the DB level.

**Fix:** Create a migration file for `pending_purchases` with RLS enabled:
```sql
ALTER TABLE pending_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON pending_purchases FOR ALL TO service_role USING (true);
```

---

### 🟡 MEDIUM: Conflicting `user_subscriptions` Migration Files

**Category:** Reliability
**Location:** `supabase-migration.sql`, `supabase-webhook-migration.sql`
**Issue:** Both migration files create a `user_subscriptions` table with `CREATE TABLE IF NOT EXISTS`, but with different schemas: the first uses `id UUID PRIMARY KEY REFERENCES auth.users(id)` (user ID as PK), while the second uses `id UUID DEFAULT gen_random_uuid() PRIMARY KEY` with a separate `user_id` FK and a `UNIQUE(user_id)` constraint. Running both creates an inconsistent schema state. The `cancel-subscription.js` code queries `.eq('id', user.id)`, which only works with the first schema.

**Exploitation/Impact:** Schema inconsistency causes subscription updates and cancellations to silently fail, leading to subscription status drift between DB and `user_metadata`.

**Fix:** Consolidate into a single migration directory (`supabase/migrations/`) with sequential timestamped files. Choose one schema and delete the other.

---

### 🟡 MEDIUM: RLS Policies Use `auth.uid()` (Bare Function Call, Not Subquery)

**Category:** Security
**Location:** `supabase-portfolio-schema.sql:25`, `supabase-migration.sql:29`, `supabase-webhook-migration.sql:59`
**Issue:** All policies use the pattern `USING (auth.uid() = user_id)` rather than `USING ((select auth.uid()) = user_id)`. Supabase documentation recommends the subquery form because it is evaluated once per query rather than per row, and is essential for security when combined with security-definer functions.

**Fix:** Replace all `auth.uid()` in policy `USING` clauses with `(select auth.uid())`.

---

### 🟡 MEDIUM: No CORS Headers on Gumroad Webhook Endpoint

**Category:** Security
**Location:** `api/gumroad-webhook.js:363`
**Issue:** The webhook handler sets `res.setHeader('Access-Control-Allow-Origin', '*')` directly instead of using the `_cors.js` whitelist module. This allows any origin to make cross-origin requests to the webhook endpoint, though this is lower risk since the webhook is only callable from Gumroad servers and the secret protects it.

**Fix:** Remove the wildcard CORS header or use `handleCors(req, res)` from `_cors.js`. Webhooks don't need CORS headers at all (they are server-to-server calls).

---

### 🟡 MEDIUM: CSP Contains `'unsafe-inline'` and `'unsafe-eval'`

**Category:** Security
**Location:** `vercel.json:13`
**Issue:** The `Content-Security-Policy` header includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src`. These directives effectively disable XSS protection for script injection. They are included to support Vite's development tooling and Gumroad's overlay checkout script.

**Exploitation/Impact:** If any user-controlled content is ever reflected into the page (e.g., portfolio ticker names, AI analysis text), an XSS vulnerability becomes exploitable.

**Fix:** For production, remove `'unsafe-eval'` (only needed for dev tools). Replace `'unsafe-inline'` with a nonce-based CSP or use `'strict-dynamic'`. Gumroad's overlay script must be loaded via a hash or nonce.

---

### 🟡 MEDIUM: `VITE_SUPABASE_URL` is Used as a Server-Side Env Var Name

**Category:** Security / DevOps
**Location:** `api/_auth.js:28`, `api/gumroad-webhook.js:5`, `api/cancel-subscription.js:19`, `api/delete-account.js:20`
**Issue:** All serverless functions access `process.env.VITE_SUPABASE_URL` to retrieve the Supabase URL. The `VITE_` prefix is a Vite convention meaning "expose this to the client bundle." If the Vercel environment has `VITE_SUPABASE_URL` set, it is also baked into the client-side JavaScript at build time (which is intentional), but the naming conflates client and server environments. More critically, if a developer sets `SUPABASE_URL` (without `VITE_`) for the server, the API functions will fail to connect.

**Fix:** Rename server-only references to a dedicated variable (e.g., `SUPABASE_URL` for server functions) and keep `VITE_SUPABASE_URL` only for the client build. Update `.env.example` accordingly.

---

### 2C-D. API Route & Auth Security — Summary

Good patterns observed:
- `authenticateRequest()` uses `supabase.auth.getUser(token)` (JWT verification) not `getSession()`.
- Authorization header extraction is correct.
- `cancel-subscription.js`, `delete-account.js`, `claim-pending-purchase.js` all require auth.
- `claim-pending-purchase.js` validates that the request's authenticated user ID matches the body's `userId`.

Issues:
- `send-email.js` — no auth (CRITICAL above).
- `explain.js` — auth is optional (by design), which is correct for the free tier.

---

### 2E. Middleware Security

There is no middleware in this Vite/Vercel project (no `middleware.ts`). Route protection is implemented at the component level and in individual API handlers. This is appropriate for a SPA architecture.

---

### 2F. Environment Variables

- No secrets with `VITE_` prefix that would be exposed to the client bundle. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are intentionally public.
- `.env`, `.env.local`, `.env.production` are all in `.gitignore`. Good.
- `NEXT_PUBLIC_APP_URL` in `vite.config.js` line 10 uses the wrong prefix for a Vite project. It should be `VITE_APP_URL`. This variable is never used in any component.
- No hardcoded secrets found in source code.

---

### 2G. Gumroad Webhook Analysis

| Check | Status |
|-------|--------|
| Signature verification | FAIL — query-param secret, not HMAC |
| `crypto.timingSafeEqual()` | FAIL — uses `===` string comparison |
| Raw request body | N/A — Vercel provides parsed body |
| Idempotency handling | FAIL — no duplicate `sale_id` check |
| Handles sale events | PASS |
| Handles cancellation events | PASS |
| Handles refund events | PASS |
| Returns 200 quickly | PASS (returns 200 even on errors) |
| User enumeration via pagination | PASS (pagination implemented) |

### 🟡 MEDIUM: Webhook Secret Comparison Uses `===` (Not Timing-Safe)

**Category:** Security
**Location:** `api/gumroad-webhook.js:377`
**Issue:** `req.query.secret !== expectedSecret` uses JavaScript's `===` operator, which is subject to timing side-channel attacks. An attacker can measure response times to determine correct prefix characters one by one.

**Fix:**
```javascript
import crypto from 'crypto'
const secretBuffer = Buffer.from(expectedSecret)
const requestBuffer = Buffer.from(req.query.secret || '')
if (secretBuffer.length !== requestBuffer.length || !crypto.timingSafeEqual(secretBuffer, requestBuffer)) {
  return res.status(401).json({ error: 'Unauthorized' })
}
```

---

### 🟡 MEDIUM: Webhook Has No Idempotency Check

**Category:** Reliability / Business Logic
**Location:** `api/gumroad-webhook.js:479-511`
**Issue:** Gumroad retries webhooks on non-200 responses. The handler does return 200 on errors, which prevents retries, but there is no check to skip reprocessing a `sale_id` that has already been activated. If Gumroad sends the same sale event twice for any reason (e.g., network glitch before they received the 200), the Pro activation runs twice and two Pro upgrade emails are sent.

**Fix:** Before processing, check `webhook_logs` for an existing `sale_id`. If found, return `200 { action: 'already_processed' }` immediately.

---

### 2H. CORS / XSS / CSRF / Injection

**CORS:** The `_cors.js` whitelist is correctly implemented and used in all authenticated endpoints. The webhook endpoint uses a wildcard — medium risk.

**XSS:** No `dangerouslySetInnerHTML` found in component files. AI analysis text is rendered as text content (via React). Ticker symbols are input-validated at the calculation stage. The inline `<script>` in `index.html` for theme detection reads from `localStorage` and writes only to DOM class attributes — not exploitable via user input.

**CSRF:** Not applicable — the app uses Bearer token authentication, not cookies. CSRF attacks require cookie-based sessions.

**SQL Injection:** No raw SQL string interpolation found. All database queries use Supabase's parameterized query builder.

**Security Headers:** Good — HSTS, X-Frame-Options: DENY, Referrer-Policy, X-Content-Type-Options, Permissions-Policy, and CSP are all set in `vercel.json`.

---

### 2I. Auth Flow

- Password reset uses `supabase.auth.resetPasswordForEmail()` with redirect to `/reset-password` — correct.
- Email redirect URL in `signup()` is `${window.location.origin}/auth/callback` — uses runtime origin, cannot be hardcoded to an attacker's domain.
- `AuthCallbackPage.jsx` calls `supabase.auth.getSession()` instead of `getUser()` for the initial session check — lower security than `getUser()` but acceptable since it is used to read session state after a redirect, not for authorization decisions.
- Token refresh: `autoRefreshToken: true` is set. Pro polling calls `supabase.auth.refreshSession()` every 5 seconds for 60 seconds — this is aggressive but functional.
- No OAuth flows are implemented — out of scope.

---

## Code Quality & Architecture

### 3A. File Structure

The project structure is clean for a Vite SPA:
- `src/components/` — UI components
- `src/hooks/` — custom hooks
- `src/lib/` — Supabase client and auth utilities
- `src/utils/` — business logic utilities
- `src/pages/` — page-level components
- `api/` — serverless functions

No `src/` wrapper is used for the API functions, which is correct for Vercel serverless.

### 🟡 MEDIUM: `App.jsx` Is Oversized (958 Lines)

**Category:** Quality
**Location:** `src/App.jsx`
**Issue:** The root app file contains inline components (`HeroView`, `CalculatorView`, `AboutView`, `Sidebar`, `Topbar`, `CollapsibleSection`, `Footer`), routing logic, keyboard shortcut handlers, and global state management. This creates a God Component anti-pattern and makes testing and maintenance difficult. The `MainApp` function alone is 300+ lines.

**Fix:** Extract `HeroView`, `AboutView`, `CalculatorView` to `src/pages/`. Extract `Sidebar` and `Topbar` to `src/components/`.

---

### 3B. Server vs Client Components

This is a client-side React SPA — the server/client component distinction is not applicable in the Next.js sense. All components run client-side. The `api/` functions correctly use Node.js-only imports.

---

### 3C. TypeScript Quality

### 🟡 MEDIUM: No TypeScript — No Type Safety

**Category:** Quality
**Location:** All `.jsx` and `.js` files
**Issue:** The entire codebase uses JavaScript without TypeScript. There are no JSDoc type annotations on critical functions. This means function signatures for financial calculations (`calculateRebalancing`, `calculatePortfolioHealth`) have no compile-time validation, increasing the risk of type errors causing incorrect financial calculations.

**Fix:** Migrate to TypeScript or add JSDoc `@param` and `@returns` annotations to all calculation and API utility functions.

---

### 3D. Error Handling

- `ErrorBoundary.jsx` is present and wraps the entire app — good.
- `<Suspense>` with `AppLoadingSkeleton` fallback is used for lazy-loaded pages — good.
- API handlers all have try/catch with appropriate error responses.

### 🟢 LOW: No `loading.jsx` Equivalent for Main Content Area

**Category:** Quality
**Location:** `src/App.jsx:386-388`
**Issue:** The `ResultsSkeleton` component is used while calculations run, but the initial app load doesn't have a structured loading state for the auth check. The `AppLoadingSkeleton` is only for Suspense fallbacks, not auth loading.

---

### 3E. Code Duplication

### 🟢 LOW: Email Templates Duplicated Between API Files

**Category:** Quality
**Location:** `api/gumroad-webhook.js:59-318`, `api/send-email.js:8-378`
**Issue:** The `proUpgrade` and `subscriptionCancelled` email HTML templates are nearly identical in both files (with minor differences in the cancellation template). Changes to one copy will not be reflected in the other.

**Fix:** Extract email templates to a shared `api/_email-templates.js` module.

---

### 🟢 LOW: `checkIfPro()` and `verifyProStatus()` Duplicate Logic

**Category:** Quality
**Location:** `src/lib/auth.js:107-122`, `api/_auth.js:63-78`
**Issue:** Both functions implement the same `metadata.is_pro === true && metadata.subscription_status === 'active'` check. While one is client-side and one is server-side, the duplicated condition means a future change (e.g., adding `subscription_status === 'past_due'` grace period) must be made in both places.

---

## Performance Audit

### 4A. Bundle Size

### 🟡 MEDIUM: `html2canvas` + `jsPDF` in Main Bundle Could Be Lazy-Loaded Better

**Category:** Performance
**Location:** `vite.config.js:38-44`, `src/utils/pdfGenerator/index.js`
**Issue:** While `recharts` and `pdf` chunks are manually split in Vite config, the PDF chunk is loaded eagerly when `ExportButtons` is imported. Since PDF export is a Pro-only feature used infrequently, this delays initial page load for all users.

**Fix:** Use dynamic `import()` inside `handleDownloadPDF()`:
```javascript
const { generatePDF } = await import('../utils/pdfGenerator');
```

---

### 🟢 LOW: No Bundle Analyzer Configured

**Category:** Performance/DevOps
**Location:** `vite.config.js`
**Issue:** There is no `rollup-plugin-visualizer` or equivalent configured. Bundle composition is unknown.

---

### 4B. Image Optimization

No `<img>` tags using external URLs found in components. Images are served from `/public` as static assets. No `next/image` considerations since this is not Next.js.

---

### 4C. Database Query Efficiency

### 🟡 MEDIUM: User Lookup by Email Uses Full Table Scan via `admin.listUsers()`

**Category:** Performance / Scalability
**Location:** `api/gumroad-webhook.js:430-443`, `api/_auth.js:130-143`
**Issue:** Both the webhook handler and `getUserByEmail()` find a user by email by paginating through ALL users 50 at a time. Supabase's `admin.listUsers()` does not support filtering by email — this is a known limitation. However, at scale (10,000+ users), this could take many API calls and significant time to complete, causing webhook timeouts.

**Fix:** Use Supabase's `admin.getUserByEmail()` method which was added in recent versions of `@supabase/supabase-js`:
```javascript
const { data: { users }, error } = await supabase.auth.admin.getUserByEmail(email)
```
This is an O(1) lookup instead of O(n) pagination.

---

### 🟢 LOW: `getCloudPortfolios()` Uses `select('*')`

**Category:** Performance
**Location:** `src/utils/portfolioStorage.js:26-31`
**Issue:** Fetches all columns from `portfolios` including potentially large `positions` JSONB. Consider selecting only needed columns when listing portfolios (e.g., `id, name, updated_at`) and fetching full data only when loading a specific portfolio.

---

### 4D. Caching & Rendering

The app is a fully client-rendered SPA. There is no server-side rendering, static generation, or caching strategy. This is appropriate for a financial tool with personal data. Vercel serves the static JS/CSS bundle with proper cache headers.

---

### 4E. Client-Side Performance

### 🟢 LOW: Pro Status Polling at 5-Second Intervals for 60 Seconds

**Category:** Performance
**Location:** `src/hooks/useAuth.js:26-68`
**Issue:** Every non-Pro logged-in user triggers `supabase.auth.refreshSession()` every 5 seconds for 60 seconds after login. This is 12 network requests to Supabase per login session regardless of whether the user recently purchased. For most users, these requests accomplish nothing.

**Fix:** Only start polling when `searchParams.get('upgraded') === 'true'` (i.e., the user has just been redirected back from Gumroad) rather than for all logged-in free users.

---

## Reliability & Edge Cases

### 5A. External Service Failure Handling

- Anthropic API: wrapped in try/catch with fallback text — good.
- Supabase queries: most have try/catch. Portfolio storage has cloud-to-local fallback.
- Resend email: non-critical paths (welcome emails, webhook emails) are fire-and-forget with `.catch(() => {})`.
- Rate limiting: explicitly fails open (allows all requests) when Redis is unavailable.

### 🟡 MEDIUM: No Timeout on Anthropic API Call

**Category:** Reliability
**Location:** `api/explain.js:102-111`
**Issue:** The Claude API call has no timeout configured. Anthropic's API can occasionally take 30+ seconds to respond (especially at 1500 max tokens for Pro). Vercel serverless functions have a 10-second default timeout on the Hobby plan and configurable timeout on Pro. If the function times out, the client receives an error but Anthropic continues processing and billing for the token generation.

**Fix:** Add `timeout` to the Anthropic client:
```javascript
const anthropic = new Anthropic({ apiKey, timeout: 25000 })
```

---

### 5B. Race Conditions

### 🟡 MEDIUM: Webhook Race with Claim-Pending-Purchase

**Category:** Reliability
**Location:** `api/gumroad-webhook.js:454-469`, `api/claim-pending-purchase.js:127-138`
**Issue:** When a user purchases and immediately signs up, two concurrent flows race:
1. Webhook arrives → user not found → stored as `pending_purchases`
2. User signs up → `claimPendingPurchase()` runs → no pending purchase found (webhook hasn't inserted yet)

The `pending_purchases.status` is not updated atomically. If `claimPendingPurchase` runs before the webhook, it returns `{ found: false }` and the user does not get Pro access. The user then must manually refresh or wait for the polling to re-check — which it does not do.

**Fix:** Add retry logic in `claimPendingPurchase` with exponential backoff, or use a Supabase realtime subscription to detect when the pending purchase row is inserted.

---

### 5C. Data Consistency

### 🟡 MEDIUM: `cancel-subscription.js` Spreads Existing User Metadata (Merge Conflict Risk)

**Category:** Reliability
**Location:** `api/cancel-subscription.js:47-54`
**Issue:** The cancellation handler uses `{ ...user.user_metadata, is_pro: false, subscription_status: 'cancelled' }`. If `user.user_metadata` contains other Gumroad subscription fields set by the webhook (e.g., `gumroad_subscription_id`), the spread preserves them. However, if `user.user_metadata` is stale (cached from token), the spread may overwrite newer values set by a concurrent webhook.

**Fix:** Use explicit field updates rather than spreading the full metadata object.

---

### 5D. Null/Undefined & Edge Cases

### 🟡 MEDIUM: Portfolio Calculation With Zero Total Value

**Category:** Reliability
**Location:** `src/utils/calculations.js:25`
**Issue:** `currentPercent = totalValue > 0 ? (currentAmount / totalValue) * 100 : 0` — zero portfolio value is guarded. However, `withdrawal` mode with `withdrawal >= totalValue` sets `newTotal` to a negative or zero value, then computes `newPercent = newTotal > 0 ? (pos.newAmount / newTotal) * 100 : 0`. Negative `newTotal` produces incorrect `newPercent` values rather than an error.

**Fix:** Add validation: `if (modeAmount >= totalValue) { throw new Error('Withdrawal amount cannot exceed portfolio value') }`.

---

### 🟢 LOW: Portfolio Health Score With Single Position

**Category:** Reliability
**Location:** `src/utils/portfolioHealth.js:78`
**Issue:** `Math.max(...positions.map(p => p.currentPercent))` with a single position always returns that position's percentage. With one holding at 100%, the concentration score is correctly penalized. This is handled — no bug.

---

### 🟢 LOW: AI Prompt Contains Raw User Financial Data

**Category:** Security / Privacy
**Location:** `api/explain.js:84-86`
**Issue:** Portfolio ticker symbols and dollar amounts are injected directly into the Claude prompt. If a user enters maliciously crafted ticker names (e.g., a ticker named `"Ignore previous instructions and..."`), this constitutes a prompt injection vector. However, since the output is only displayed back to the same user, the practical risk is low (self-injection has limited utility).

**Fix:** Validate ticker symbols against an allowlist or regex (`/^[A-Z0-9.]{1,10}$/`) before including in the prompt.

---

## SEO & Accessibility

### 6A. SEO

| Item | Status |
|------|--------|
| `<title>` in `index.html` | ✅ Present |
| `<meta name="description">` | ✅ Present |
| Open Graph tags | ✅ Present |
| Twitter Card tags | ✅ Present |
| Canonical URL | ✅ `https://rebalancekit.com` |
| Structured data (JSON-LD) | ✅ WebApplication schema |
| `robots.txt` | ✅ Present with API disallow |
| `sitemap.xml` | ✅ Referenced in robots.txt |
| `<html lang="en">` | ✅ Present in `index.html` |

### 🟢 LOW: OG Image File May Not Exist

**Category:** SEO
**Location:** `index.html:21`
**Issue:** `og:image` points to `https://rebalancekit.com/og-image.png` but this file was not found in the `/public` directory during the audit.

**Fix:** Create `/public/og-image.png` (recommended: 1200x630px).

---

### 6B. Accessibility

### 🟢 LOW: Several Icon-Only Buttons Missing `aria-label`

**Category:** Accessibility
**Location:** `src/App.jsx:185-195`
**Issue:** The desktop sidebar toggle button contains only an SVG icon with no text label. While `aria-label="Toggle sidebar"` is set on line 189, other icon buttons in the codebase (mobile close button, hamburger) correctly have `aria-label`. The SVG in the toggle button has `fill-muted-foreground` but no accessible text.

---

### 🟢 LOW: Modal Focus Trapping Not Implemented

**Category:** Accessibility
**Location:** `src/components/AuthModal.jsx`, `src/components/SavePortfolioModal.jsx`
**Issue:** Modal dialogs do not trap focus within the modal container. Users navigating by keyboard can tab to elements behind the modal backdrop. No `aria-modal="true"` or focus lock library is used.

**Fix:** Add `aria-modal="true"` to modal containers and implement focus trapping using the `focus-trap` pattern or a library.

---

## DevOps & Deployment

### 7A. Vercel Configuration

The `vercel.json` contains:
- Security headers applied globally — good.
- SPA rewrite rule `/(.*) → /` — correct for React Router.
- No `functions` configuration, so API functions use Vercel defaults (10s timeout on Hobby, 60s on Pro).

### 🔴 CRITICAL (DevOps): No CI/CD Pipeline

**Category:** DevOps
**Location:** (no `.github/` directory)
**Issue:** There are no GitHub Actions, no pre-commit hooks (`husky`/`lint-staged`), and no automated test suite. Every push deploys directly without linting, security scanning, or test validation.

**Exploitation/Impact:** A developer accidentally commits a secret (API key, service role key) to the repository. Without a secret scanner (e.g., `gitleaks` in CI), this goes undetected until the secret is rotated. Alternatively, a typo in an API handler disabling authentication goes unnoticed until a user reports an issue.

**Fix:**
1. Add `.github/workflows/ci.yml` with `npm run lint` and `npm run build`.
2. Add `husky` + `lint-staged` for pre-commit linting.
3. Add `gitleaks` or GitHub secret scanning to detect committed secrets.
4. Add basic integration tests with `vitest` for calculation utilities.

---

### 7B. Environment Management

### 🟡 MEDIUM: `.env.production` File Present in Repository Root

**Category:** DevOps / Security
**Location:** `/c/Users/lucas/portfolio-rebalancer/.env.production`
**Issue:** A `.env.production` file exists in the project root. While `.env.production` is listed in `.gitignore`, its presence alongside the project suggests it may have been created locally. If it was ever staged and committed before the `.gitignore` was added, secrets could exist in git history.

**Fix:** Run `git log --all --full-history -- .env.production` to check if the file was ever committed. If so, rotate all secrets immediately and use `git-filter-repo` to purge the history.

---

### 7C. CI/CD

See 7A above — no CI/CD exists. There is an ESLint config (`eslint.config.js`) and scripts in `package.json` (`npm run lint`), but these are not enforced automatically.

No Prettier config found.

---

### 7D. Database Migrations

### 🟡 MEDIUM: Migrations Are Flat SQL Files, Not Version-Controlled

**Category:** DevOps
**Location:** `supabase-migration.sql`, `supabase-portfolio-schema.sql`, `supabase-webhook-migration.sql`
**Issue:** Migrations are standalone SQL files in the project root rather than in a `supabase/migrations/` directory with sequential timestamps. There is no record of which migrations have been applied to which environment. Re-running the files produces `IF NOT EXISTS` guards for tables but will fail on `DROP POLICY IF EXISTS` / `CREATE POLICY` combinations on already-migrated databases.

**Fix:** Migrate to the Supabase CLI migration structure:
```
supabase/migrations/
  20240101000000_initial_schema.sql
  20240115000000_add_portfolios.sql
  20240201000000_add_webhook_tables.sql
  20240210000000_add_pending_purchases.sql
```

---

### 7E. Logging & Monitoring

### 🟡 MEDIUM: No Error Tracking (Sentry or Equivalent)

**Category:** DevOps
**Location:** (entire `api/` directory)
**Issue:** All errors are logged with `console.error()` to Vercel's runtime logs, but there is no structured error tracking or alerting. Webhook failures, payment processing errors, and AI API failures are invisible until a user reports them or you manually check logs.

**Fix:** Add Sentry:
```javascript
import * as Sentry from '@sentry/node'
Sentry.init({ dsn: process.env.SENTRY_DSN })
```

---

### 🟢 LOW: Verbose `console.log` in Rate Limiter

**Category:** DevOps
**Location:** `api/_ratelimit.js:247-253`
**Issue:** Every successful rate limit check logs `[Rate Limit] Check passed: { identifier, tier, remaining, reset }`. At scale, this generates one log line per API request, polluting Vercel logs and making it harder to find real issues.

**Fix:** Remove the success log or gate it behind a `DEBUG` flag.

---

## Business Logic Review

### 8A. Subscription & Paywall

| Check | Status | Notes |
|-------|--------|-------|
| Server-side subscription check | PARTIAL | `_auth.js` checks metadata (exploitable) |
| Client-side bypass possible | YES | React DevTools or `user_metadata` write |
| Direct API access checks Pro | PARTIAL | Only `explain.js` has server-side Pro gate |
| Free tier limits enforced | PARTIAL | Portfolio limit enforced server-side in Supabase RLS (via user_id), count limit only client-side |
| Cancellation handling | PASS | Webhook + manual cancel both work |

### 8B. Portfolio Calculation Edge Cases

| Edge Case | Handled? |
|-----------|---------|
| Empty portfolio | Yes — `calculatePortfolioHealth` returns early |
| Single holding | Yes — math works correctly |
| Zero allocation (targetPercent=0) | Yes — results in 100% SELL |
| Allocations don't sum to 100% | Partially — calculations still run; no user warning |
| Very large values ($10M+) | Yes — JavaScript handles float64 up to ~$9 quadrillion |
| Very small values (< $0.01) | Yes — `formatCurrency` uses 2 decimal places |
| Negative values (negative amount) | No — `parseFloat(pos.amount)` would produce a negative `totalValue` and incorrect percentages |
| Division by zero (totalValue = 0) | Yes — guarded in calculations.js:25 |
| Withdrawal > portfolio value | No — `newTotal` becomes negative |

### 🟡 MEDIUM: No Input Validation for Negative Position Amounts

**Category:** Reliability / Business Logic
**Location:** `src/utils/calculations.js:10`
**Issue:** If a user enters a negative amount for a holding (e.g., `-1000`), `parseFloat(pos.amount)` returns `-1000`, `totalValue` becomes negative or incorrect, and `currentPercent` values become meaningless (negative or >100%). The UI shows incorrect BUY/SELL recommendations.

**Fix:** In the portfolio form validation, add: `if (parseFloat(amount) < 0) { setError('Amount cannot be negative') }`.

---

### 8C. AI Integration

| Check | Status |
|-------|--------|
| Rate limiting per user | PASS (20/hr auth, 100/hr Pro, 5/hr anon) |
| Token limits | PASS (800 free, 1500 Pro) |
| Prompt injection protection | PARTIAL — no ticker symbol validation |
| Error handling | PASS — fallback text provided |
| Timeout | FAIL — no timeout configured |
| Response caching | FAIL — no caching; same portfolio always re-queries |

### 🟢 LOW: AI Response Not Cached

**Category:** Performance / Cost
**Location:** `api/explain.js`
**Issue:** Every call to `/api/explain` triggers a new Anthropic API call even if the portfolio data is identical to a recent request. For Pro users (100/hr limit), this could generate significant API costs for users who repeatedly click "Analyze."

**Fix:** Hash the portfolio positions and cache responses in Upstash Redis with a 5-minute TTL.

---

### 8D. PDF Export

| Check | Status |
|-------|--------|
| Rate limiting | FAIL — PDF generation is client-side, no rate limit |
| Input sanitization | PARTIAL — ticker symbols from user input are inserted into PDF |
| Memory limits | N/A — client-side generation |
| Server-side Pro gate | FAIL — no server verification |
| html2canvas memory usage | MEDIUM — large portfolios could consume significant browser memory |

### 🟡 MEDIUM: PDF Export Has No Pro Verification at Generation Time

**Category:** Business Logic
**Location:** `src/utils/pdfGenerator/index.js`, `src/components/ExportButtons.jsx:8`
**Issue:** The `isPro` flag passed to `generatePDF()` only affects watermark/header content in the PDF — it does not prevent a free user from generating a PDF at all. A free user who bypasses the `PaywallWrapper` (via DevTools) can generate a full Pro-quality PDF.

**Fix:** Move PDF generation to a serverless function that verifies Pro status before generating. Alternatively, generate a watermarked PDF client-side for free users and route Pro PDF generation through the server.

---

## Appendix: Complete Finding Index

| # | Severity | Title |
|---|----------|-------|
| 1 | 🔴 CRITICAL | Gumroad Webhook Uses Query-String Secret (Not HMAC) |
| 2 | 🔴 CRITICAL | Pro Status Read from User-Writable `user_metadata` |
| 3 | 🔴 CRITICAL | `/api/send-email` Has No Authentication |
| 4 | 🔴 CRITICAL | Client-Side-Only Pro Gate for Premium Features |
| 5 | 🟡 MEDIUM | `pending_purchases` Table Has No Migration File (RLS Unknown) |
| 6 | 🟡 MEDIUM | Conflicting `user_subscriptions` Migration Files |
| 7 | 🟡 MEDIUM | RLS Policies Use Bare `auth.uid()` (Not Subquery) |
| 8 | 🟡 MEDIUM | No CORS Headers on Gumroad Webhook Endpoint |
| 9 | 🟡 MEDIUM | CSP Contains `'unsafe-inline'` and `'unsafe-eval'` |
| 10 | 🟡 MEDIUM | `VITE_SUPABASE_URL` Used as Server-Side Env Var Name |
| 11 | 🟡 MEDIUM | Webhook Secret Comparison Uses `===` (Not Timing-Safe) |
| 12 | 🟡 MEDIUM | Webhook Has No Idempotency Check |
| 13 | 🟡 MEDIUM | User Lookup by Email Uses Full Table Scan |
| 14 | 🟡 MEDIUM | No Timeout on Anthropic API Call |
| 15 | 🟡 MEDIUM | Webhook Race with Claim-Pending-Purchase |
| 16 | 🟡 MEDIUM | No Error Tracking (Sentry or Equivalent) |
| 17 | 🟡 MEDIUM | `.env.production` File Present in Repository Root |
| 18 | 🟡 MEDIUM | Migrations Are Flat SQL Files, Not Version-Controlled |
| 19 | 🟡 MEDIUM | `cancel-subscription.js` Spreads Existing User Metadata |
| 20 | 🟡 MEDIUM | No Input Validation for Negative Position Amounts |
| 21 | 🟡 MEDIUM | PDF Export Has No Pro Verification at Generation Time |
| 22 | 🟡 MEDIUM | `App.jsx` Is Oversized (958 Lines) |
| 23 | 🟡 MEDIUM | No TypeScript — No Type Safety |
| 24 | 🟡 MEDIUM | Portfolio Calculation With Zero/Negative Total Value |
| 25 | 🔴 CRITICAL (DevOps) | No CI/CD Pipeline |
| 26 | 🟢 LOW | No Bundle Analyzer Configured |
| 27 | 🟢 LOW | Email Templates Duplicated Between API Files |
| 28 | 🟢 LOW | `checkIfPro()` and `verifyProStatus()` Duplicate Logic |
| 29 | 🟢 LOW | Pro Status Polling for All Free Users |
| 30 | 🟢 LOW | `getCloudPortfolios()` Uses `select('*')` |
| 31 | 🟢 LOW | AI Response Not Cached |
| 32 | 🟢 LOW | OG Image File May Not Exist |
| 33 | 🟢 LOW | Icon-Only Buttons Missing `aria-label` |
| 34 | 🟢 LOW | Modal Focus Trapping Not Implemented |
| 35 | 🟢 LOW | Verbose `console.log` in Rate Limiter |
| 36 | 🟢 LOW | AI Prompt Contains Unvalidated User Data (Low-Risk Prompt Injection) |
