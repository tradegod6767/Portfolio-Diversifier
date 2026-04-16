# RebalanceKit Remediation Log
**Started:** 2026-03-16T00:00:00Z

## Agent 1: Security & Auth (Phases 1-4)
- [x] Phase 1: Move Pro status to user_subscriptions table — `api/_auth.js` verifyProStatus queries user_subscriptions; `src/lib/auth.js` checkIfPro queries user_subscriptions; migrations 001_consolidate_subscriptions.sql and 002_pending_purchases.sql created
- [x] Phase 2: Add auth to /api/send-email — authenticateRequest guard added; rate limiting applied
- [x] Phase 3: Harden Gumroad webhook — user_subscriptions writes, timingSafeEqual, idempotency check, wildcard CORS removed; email templates extracted to _email-templates.js; Sentry integrated
- [x] Phase 4: Server-side Pro gate for PDF export — api/generate-pdf.js created; ExportButtons.jsx calls /api/generate-pdf before generating PDF
- [x] retryQuery wired into claim-pending-purchase.js — pending purchase lookup wrapped with retryQuery from _retry-utils.js
- [x] useProPolling wired into useAuth.js — import added; hook called before return to activate on ?upgraded=true URL param
- [x] Email templates deduplicated — gumroad-webhook.js and send-email.js now import from _email-templates.js; inline templates removed
- [x] Sentry added to: gumroad-webhook.js, send-email.js, cancel-subscription.js, claim-pending-purchase.js, generate-pdf.js
**Status:** Complete

### Agent 1 Notes

**Task E — Grep Results (user_metadata references, unfiltered for compat):**
Command: `grep -rn "user_metadata.*is_pro\|user_metadata.*subscription_status" --include='*.js' --include='*.jsx' /c/Users/lucas/portfolio-rebalancer | grep -v node_modules | grep -v "Secondary\|backward\|compat\|// "`

Results:
```
api/cancel-subscription.js:46:      user_metadata: { is_pro: false, subscription_status: 'cancelled' }
test-with-auth.js:87:      const isPro = session.user.user_metadata?.is_pro === true &&
test-with-auth.js:88:                    session.user.user_metadata?.subscription_status === 'active';
```

Assessment:
- `cancel-subscription.js:46` — secondary backward-compat write; user_subscriptions updated on lines 32-39 as primary source of truth. Intentional.
- `test-with-auth.js:87-88` — test file only; not production code; reads user_metadata for test assertion.

No unguarded production reads of user_metadata for Pro status gating detected.

**Task F — Build Result:**
`npm run build` — SUCCESS in 10.46s. Pre-existing warnings only:
- Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars (expected without .env in build environment)
- Chunk size warnings for pdf and index bundles (pre-existing; not caused by Agent 1 changes)

## Agent 2: DevOps & Infrastructure
- [x] CI/CD pipeline (GitHub Actions) — `.github/workflows/ci.yml` created
- [x] Pre-commit hooks (Husky + lint-staged) — `.husky/pre-commit` created; husky, lint-staged, prettier installed; `prepare` script added to package.json
- [x] Prettier config — `.prettierrc` created with semi/singleQuote/trailingComma/printWidth settings
- [x] Sentry error tracking — `api/_sentry.js` created; `@sentry/node` installed; `SENTRY_DSN=` added to `.env.example`
- [x] Migration file restructuring — `supabase/migrations/20250101000000_portfolio_schema.sql`, `20250102000000_user_subscriptions_legacy.sql`, `20250103000000_webhook_tables.sql` created; originals marked DEPRECATED; RLS policies updated to use `(select auth.uid())`; `user_subscriptions` CREATE TABLE block commented out in webhook migration (defers to Agent 1's 001_consolidate_subscriptions.sql)
- [x] Anthropic API timeout — `timeout: 25000` added to Anthropic client init in `api/explain.js`
- [x] User lookup performance fix — `getUserByEmail` in `api/_auth.js` now tries direct O(1) query on `auth.users` first, falls back to paginated listUsers with perPage=1000 and early exit
- [x] `sale_id` column migration — `supabase/migrations/003_webhook_logs_sale_id.sql` created
**Status:** Complete

### Agent 2 Coordination Notes
- **Sentry wiring needed:** `api/_sentry.js` is ready but NOT imported in any API handler. Team Lead must add `import { Sentry } from './_sentry.js'` and `Sentry.captureException(error)` calls in catch blocks of each handler (explain.js, gumroad-webhook.js, send-email.js, cancel-subscription.js, claim-pending-purchase.js, delete-account.js) after Agent 1 finishes.
- **`_auth.js` coordination:** Agent 1 updated `_auth.js` (added module-level `supabaseAdmin`, rewrote `verifyProStatus` to query `user_subscriptions` table). Agent 2 only edited the `getUserByEmail` function as required. No conflicts detected.
- **`npm run build` result:** ✓ Build succeeded in 8.47s. Pre-existing warnings: missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY env vars (expected in CI without .env), and chunk size warnings for pdf/index bundles (pre-existing, not caused by Agent 2 changes).

## Agent 3: Code Quality & UX
- [x] Input validation (negative amounts, withdrawal overflow) — guards already present in `calculations.js` (lines 9-17, 32-34); `validateAmount` helper + inline error already in `PortfolioForm.jsx` (lines 162-168, 939-945). No changes needed.
- [x] CSP hardening (remove unsafe-eval) — `unsafe-eval` removed from `vercel.json` CSP (done before rate limit).
- [x] Pro status polling fix — `src/hooks/useProPolling.js` created (done before rate limit).
- [x] Email template deduplication — `api/_email-templates.js` created (done before rate limit).
- [x] Webhook race condition retry logic — `api/_retry-utils.js` created (done before rate limit).
- [x] Bundle analyzer setup — `rollup-plugin-visualizer` added to `vite.config.js` (done before rate limit); package installed via `npm install -D rollup-plugin-visualizer`.
- [ ] Lazy-load PDF dependencies — not completed; pre-existing chunk size warnings remain (see build output).
- [x] OG image check — `/public/og-image.png` is **MISSING**. Needs to be created (recommended: 1200×630px).
- [x] Modal accessibility (aria-modal, focus trap) — `AuthModal.jsx`: added `role="dialog"`, `aria-modal="true"`, `aria-labelledby="auth-modal-title"`, `id` on h2, Escape key handler via `useEffect`. `SavePortfolioModal.jsx`: same additions with `save-modal-title` and Escape guard respecting `saving` state.
- [x] Rate limit log verbosity — `console.log('[Rate Limit] Check passed:')` at line ~247 of `api/_ratelimit.js` wrapped in `if (process.env.DEBUG_RATE_LIMIT)` guard.
- [x] VITE_ env var naming fix — removed `import.meta.env.NEXT_PUBLIC_APP_URL` define from `vite.config.js`; `VITE_APP_URL` is the only define. Added `VITE_APP_URL` to `.env.example`.
**Status:** Complete (except lazy-load PDF — deferred; OG image asset must be created separately)

---
## Team Lead Integration — Complete
**Completed:** 2026-03-16

- [x] Sentry wired into `api/explain.js` — import + `Sentry.captureException(error)` in catch block
- [x] Sentry wired into `api/delete-account.js` — import + `Sentry.captureException(error)` in catch block
- [x] Final build verified — ✅ `npm run build` passes in 8.24s, no new warnings
- [x] Final grep verified — zero unguarded `user_metadata.is_pro` auth reads in production code

### Manual TODOs (require human action)
1. **OG image:** Create `public/og-image.png` at 1200×630px for social sharing previews
2. **Supabase migration:** Apply `supabase/migrations/001–003_*.sql` to your Supabase project (via Supabase Dashboard → SQL Editor, or `supabase db push`)
3. **Sentry DSN:** Set `SENTRY_DSN=` in Vercel environment variables
4. **Lazy-load PDF chunk:** 618 kB pdf bundle — future task to `await import()` jsPDF/html2canvas from ExportButtons
5. **Remove `unsafe-inline` CSP:** Once Gumroad overlay is audited, tighten further

---
## Coordination Notes

### Agent 3 Coordination Notes
- **OG image missing:** `/public/og-image.png` does not exist. Team Lead must create a 1200×630px PNG at that path before deploying for proper social sharing previews.
- **rollup-plugin-visualizer installed:** Added as devDependency. Run `npm run analyze` (set `ANALYZE=true`) to generate bundle visualization report.
- **Lazy-load PDF:** The `pdf` chunk is 618 kB gzipped to 183 kB. Dynamic `import()` of jsPDF/html2canvas/jspdf-autotable from `ExportButtons.jsx` would eliminate this from the initial bundle. Not implemented to avoid prop interface changes (CLAUDE.md constraint). Team Lead may address in a follow-up.
- **DEBUG_RATE_LIMIT env var:** Add `DEBUG_RATE_LIMIT=true` to local `.env` only when debugging rate limit flow; do not set in production.
- **`npm run build` result:** Build succeeded in 20.10s. Pre-existing warnings: missing Supabase env vars (expected without .env), chunk size warnings for pdf/index bundles (pre-existing).
