# RebalanceKit — React 19 + Vite 7 + TailwindCSS 4

## Critical Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Tech Stack
- Framework: React 19 + Vite 7 (NOT Next.js)
- Styling: TailwindCSS 4 + CSS custom properties in index.css
- Charts: Recharts 3.5 (pie charts, bar charts for allocation)
- Auth: Supabase Auth (email/password)
- Payments: Gumroad ($9.99/mo Pro)
- AI: Anthropic Claude via /api/explain
- PDF: jsPDF + jspdf-autotable + html2canvas
- HTTP: axios
- Routing: react-router-dom 7.11
- Deploy: Vercel with serverless API functions

## Design System: "Minimal Fintech" (Robinhood-inspired)

### Design Philosophy
- Less is more. Every element must earn its place on screen.
- Color communicates data, not decoration. Green = positive, red = negative, accent = CTAs only.
- Typography creates hierarchy. Size and weight differences replace borders and boxes.
- One focal point per view. The most important element dominates.
- Whitespace is a feature. Generous padding creates a premium, breathable feel.
- No gradients, no decorative shadows, no visual noise.

### Typography
- Primary font: 'Inter', system-ui, -apple-system, sans-serif
- Monospace (financial numbers): 'IBM Plex Mono', ui-monospace, monospace
- ALL financial numbers MUST use `font-variant-numeric: tabular-nums lining-nums`
- Always format currency with $ prefix, commas, 2 decimal places
- Always show +/- sign prefix on gain/loss percentage values

Type scale:
- Hero number (portfolio total): text-5xl (48px), font-light (300), tracking-tight
- Page title: text-2xl (24px), font-semibold (600)
- Section header: text-lg (18px), font-semibold (600)
- Card title: text-base (16px), font-medium (500)
- Body text: text-sm (14px), font-normal (400)
- Caption/label: text-xs (12px), font-medium (500), text-muted-foreground
- KPI number: text-3xl (32px), font-bold (700), tabular-nums

### Color Tokens (CSS custom properties in index.css)
Light mode:
- --background: #FAFAFA (page bg, NOT pure white)
- --foreground: #0A0A0A (primary text)
- --card: #FFFFFF (card/surface bg)
- --card-foreground: #0A0A0A
- --muted: #F5F5F5 (sunken areas, table headers)
- --muted-foreground: #737373 (secondary text, labels)
- --border: #E5E5E5 (borders, dividers)
- --input: #E5E5E5
- --primary: #171717 (primary buttons — dark, NOT colored)
- --primary-foreground: #FAFAFA
- --accent: #F5F5F5 (hover states, selected items)
- --accent-foreground: #171717
- --ring: #171717 (focus rings)
- --gain: #22C55E (positive values ONLY)
- --loss: #EF4444 (negative values ONLY)
- --gain-bg: #F0FDF4 (subtle green badge bg)
- --loss-bg: #FEF2F2 (subtle red badge bg)

Dark mode:
- --background: #0A0A0A
- --foreground: #FAFAFA
- --card: #171717
- --card-foreground: #FAFAFA
- --muted: #262626
- --muted-foreground: #A3A3A3
- --border: #262626
- --primary: #FAFAFA
- --primary-foreground: #0A0A0A
- --gain: #4ADE80 (lighter green for dark bg)
- --loss: #F87171 (lighter red for dark bg)

FORBIDDEN: No purple, indigo, violet, teal gradients. No bg-indigo-*, bg-purple-*, bg-violet-*. No gradient backgrounds on sections. No colored shadows.

### Spacing (8px grid)
- Card internal padding: p-6 (24px)
- Page padding: p-6 md:p-8 (24px mobile, 32px desktop)
- Section spacing: space-y-8 (32px) between major sections
- Component spacing: space-y-4 (16px) between related elements
- Use Tailwind spacing scale only: gap-1(4px), gap-2(8px), gap-3(12px), gap-4(16px), gap-6(24px), gap-8(32px)

### Component Rules
Cards:
- bg-card border border-border rounded-lg p-6
- NO box-shadow by default. Borders are the only elevation method.
- Shadows ONLY on modals/dropdowns/tooltips.

Buttons:
- Primary: bg-primary text-primary-foreground rounded-md h-9 px-4 text-sm font-medium
- Secondary: bg-muted text-foreground border border-border rounded-md
- Ghost: bg-transparent hover:bg-accent rounded-md
- Destructive: text-loss hover:bg-loss-bg
- NO pill shapes on desktop (rounded-md, not rounded-full)

Inputs:
- h-9 border border-input bg-background rounded-md px-3 text-sm
- Focus: ring-2 ring-ring ring-offset-2 ring-offset-background
- Placeholder: text-muted-foreground

Tables (results tables, holdings):
- Right-align ALL numeric columns
- Left-align text columns (ticker, asset name)
- Header: bg-muted text-muted-foreground text-xs font-medium uppercase tracking-wider
- Row dividers: border-b border-border (hairline)
- Row hover: hover:bg-muted/50 transition-colors
- NO zebra striping

Charts (Recharts):
- Pie chart: clean segments, no border/outline, subtle label
- Bar charts: rounded corners, clean axis labels
- Colors: use a consistent neutral palette, NOT rainbow colors
- Tooltip: bg-card border border-border rounded-md shadow-md p-3 text-sm

Modals:
- Centered overlay with bg-black/50 backdrop
- bg-card border border-border rounded-xl shadow-lg (modals ARE allowed shadows)
- p-6 internal padding, max-w-md

Badges:
- BUY: bg-gain-bg text-gain text-xs font-medium px-2 py-0.5 rounded-md
- SELL: bg-loss-bg text-loss text-xs font-medium px-2 py-0.5 rounded-md
- HOLD: bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-md
- PRO: bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-md

### Landing Page Rules
- Left-aligned headline (NOT centered), clean CTA, product screenshot or mockup on right
- NO generic gradients. Background is --background.
- NO three-boxes-with-icons cliché. Show actual product screenshots or a demo preview.
- Section padding: py-16 md:py-24
- Max content width: max-w-6xl mx-auto
- Headings: text-4xl md:text-5xl font-bold tracking-tight
- Subheadings: text-lg text-muted-foreground max-w-2xl

## Actual File Structure
src/
  App.jsx                    → Root app + routing + internal nav (home/calculator/load/import/about)
  main.jsx                   → Entry + Vercel Analytics
  index.css                  → CSS custom properties + base styles
  App.css                    → App-level styles
  config.js                  → API base URL

  pages/
    AuthCallbackPage.jsx, ResetPasswordPage.jsx, SuccessPage.jsx,
    NotFoundPage.jsx, TermsOfServicePage.jsx, PrivacyPolicyPage.jsx

  components/
    PortfolioForm.jsx, RebalancingResults.jsx, AllocationCharts.jsx,
    PortfolioHealthScore.jsx, PortfolioInsights.jsx, PortfolioComparison.jsx,
    AIAnalysisDisplay.jsx, AuthModal.jsx, ForgotPasswordModal.jsx,
    PaywallWrapper.jsx, ProfessionalTopbar.jsx, ProfessionalSidebar.jsx,
    ProfessionalHero.jsx, MobileHeader.jsx, MobileBottomNav.jsx,
    WelcomeBanner.jsx, ImportPortfolioModal.jsx, ImportPortfolioPage.jsx,
    LoadPortfolioPage.jsx, SavePortfolioModal.jsx, ExportButtons.jsx,
    SamplePortfolioSelector.jsx, SamplePortfolioBanner.jsx,
    RebalancingCostEstimate.jsx, KeyboardShortcutsModal.jsx,
    WhatsNewModal.jsx, FinancialDisclaimer.jsx, ErrorBoundary.jsx,
    Toast.jsx, Tooltip.jsx, SwipeableItem.jsx, AppLoadingSkeleton.jsx
    ui/ → Badge.jsx, Button.jsx, Card.jsx, EmptyState.jsx,
         Input.jsx, Select.jsx, LoadingSpinner.jsx, Skeleton.jsx

  Separate CSS files to consolidate into Tailwind:
    AuthModal.css, PortfolioFormStyles.css, PortfolioHealthScore.css,
    PortfolioInsights.css, SavePortfolioModal.css, ForgotPasswordModal.css,
    AIAnalysisDisplay.css, AuthCallbackPage.css, App.css

  hooks/ → useAuth.js, useKeyboardShortcuts.js, useUndoRedo.js
  context/ → ToastContext.jsx
  lib/ → supabase.js, auth.js
  utils/ → calculations.js, portfolioHealth.js, portfolioStorage.js,
           csvExport.js, assetClasses.js, modelPortfolios.js,
           samplePortfolios.js, pdfGenerator/

## CONSTRAINTS (NEVER VIOLATE)
- Do NOT change any API calls, data fetching, or business logic
- Do NOT change calculations.js, portfolioHealth.js, or any utils logic
- Do NOT change auth flows, Supabase calls, or payment logic
- Do NOT change component prop interfaces or data flow
- Do NOT change routing or navigation state logic
- Do NOT add new npm dependencies without explicit approval
- Do NOT remove any existing features or interactive elements
- Do NOT break dark mode — all changes must work in both light and dark
- Do NOT use any purple, indigo, or violet colors
- Do NOT add gradient backgrounds
- Do NOT use decorative box-shadows on cards (borders only)
- Run `npm run build` after every file to verify
