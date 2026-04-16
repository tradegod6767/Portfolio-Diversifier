import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const homepageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://rebalancekit.com/#organization',
    name: 'RebalanceKit',
    url: 'https://rebalancekit.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://rebalancekit.com/favicon-32x32.png',
      width: 32,
      height: 32,
    },
    description:
      'RebalanceKit is a portfolio rebalancing tool that helps investors calculate exact buy/sell amounts to restore target allocations, with tax-smart suggestions and AI analysis.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@rebalancekit.com',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://rebalancekit.com/#website',
    name: 'RebalanceKit',
    url: 'https://rebalancekit.com',
    publisher: { '@id': 'https://rebalancekit.com/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://rebalancekit.com/#application',
    name: 'RebalanceKit',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Portfolio Management',
    operatingSystem: 'Web-based',
    url: 'https://rebalancekit.com',
    description:
      'Calculate exact portfolio rebalancing trades in seconds. Tax-efficient add-only mode, health scoring, AI analysis, and PDF reports.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description: 'Basic rebalancing, add-only mode, health score. No signup required.',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '9.99',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '9.99',
          priceCurrency: 'USD',
          billingDuration: 'P1M',
          unitText: 'per month',
        },
        description: 'AI analysis, PDF reports, cloud portfolio sync, priority support',
        availability: 'https://schema.org/InStock',
      },
    ],
    featureList: [
      'Target-Weight Rebalancing',
      'Add-Only Mode (tax-efficient)',
      'Portfolio Health Score',
      'Drift Monitoring',
      'AI-Powered Analysis',
      'PDF Report Export',
      'Model Portfolio Comparison',
    ],
    creator: { '@id': 'https://rebalancekit.com/#organization' },
  },
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-gain flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export default function Home() {
  return (
    <>
      <SEO
        title="RebalanceKit — Free Portfolio Rebalancing Tool for DIY Investors"
        description="Rebalance your investment portfolio in minutes. Free calculator for 3-fund, 60/40, and custom allocations. Tax-smart add-only mode, AI analysis, and PDF reports."
        path="/"
        jsonLd={homepageJsonLd}
      />

      {/* Hero */}
      <section className="px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Headline + CTA */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gain-bg border border-gain/30 rounded-md">
                <CheckIcon />
                <span className="text-xs font-semibold text-gain uppercase tracking-wider">
                  Free Portfolio Rebalancing Calculator
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Portfolio rebalancing made simple
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Enter your holdings and target allocation. Get exact buy and sell amounts instantly — no spreadsheet required. Free to use, no signup needed.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center h-10 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Try Calculator Free
                </Link>
                <Link
                  to="/calculator"
                  className="inline-flex items-center justify-center h-10 px-5 text-sm font-medium border border-border text-foreground rounded-md hover:bg-accent transition-colors"
                >
                  See How It Works
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                {['No signup required', 'Your data stays private', 'Free forever plan'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckIcon />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Feature summary card */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Example portfolio</div>
              {[
                { ticker: 'VTI', name: 'US Stocks', current: '63%', target: '60%', action: 'SELL', color: 'text-loss' },
                { ticker: 'VXUS', name: 'Intl Stocks', current: '17%', target: '20%', action: 'BUY', color: 'text-gain' },
                { ticker: 'BND', name: 'Bonds', current: '20%', target: '20%', action: 'HOLD', color: 'text-muted-foreground' },
              ].map((row) => (
                <div key={row.ticker} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm font-medium text-foreground">{row.ticker}</span>
                    <span className="text-xs text-muted-foreground ml-2">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{row.current} → {row.target}</span>
                    <span className={`font-medium text-xs px-2 py-0.5 rounded-md ${
                      row.action === 'BUY' ? 'bg-gain-bg text-gain' :
                      row.action === 'SELL' ? 'bg-loss-bg text-loss' :
                      'bg-muted text-muted-foreground'
                    }`}>{row.action}</span>
                  </div>
                </div>
              ))}
              <Link to="/app" className="block text-center text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors">
                Try with your portfolio →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-6 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-2">How RebalanceKit works</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">Three steps to a rebalanced portfolio. No brokerage connection required.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Enter your holdings',
                desc: 'Add your current positions with dollar amounts and target allocation percentages. Import from CSV or use a sample portfolio.',
              },
              {
                step: '2',
                title: 'Review recommendations',
                desc: 'See exact buy and sell amounts for each position. Choose add-only mode to avoid triggering capital gains taxes.',
              },
              {
                step: '3',
                title: 'Execute in your brokerage',
                desc: 'Place the trades in Fidelity, Schwab, Vanguard, or wherever you invest. Export a PDF report for your records.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-card border border-border rounded-xl p-6">
                <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for DIY investors */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Built for DIY investors, not financial advisors</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Most rebalancing software targets wealth managers charging $12,000–$28,000/year. RebalanceKit is built for individual investors who manage their own Vanguard, Fidelity, or Schwab accounts.
              </p>
              <ul className="space-y-3">
                {[
                  'Works with any portfolio — ETFs, mutual funds, stocks, bonds',
                  'Add-only mode prevents selling and avoids capital gains',
                  'Portfolio health score shows how far you\'ve drifted',
                  'Compare your allocation to popular models like 3-fund or 60/40',
                  'AI-powered analysis explains what to do and why',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-1">Free portfolio rebalancing calculator</h3>
                <p className="text-sm text-muted-foreground mb-3">Enter holdings, get instant buy/sell recommendations. No account required.</p>
                <Link to="/calculator" className="text-sm font-medium text-foreground hover:underline">
                  Use the calculator →
                </Link>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-1">Tax-smart suggestions</h3>
                <p className="text-sm text-muted-foreground mb-3">Prioritize tax-advantaged accounts. Add-only mode lets you rebalance without selling a single share.</p>
                <Link to="/features/tax-smart-rebalancing" className="text-sm font-medium text-foreground hover:underline">
                  How it works →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Start rebalancing for free</h2>
          <p className="text-muted-foreground mb-6">
            No signup required. Enter your portfolio and get recommendations in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/app"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Try Calculator Free
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium border border-border text-foreground rounded-md hover:bg-accent transition-colors"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Free forever plan available. No credit card required.
          </p>
        </div>
      </section>

      {/* Internal linking */}
      <section className="px-4 sm:px-6 py-12 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Popular guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/guides/how-to-rebalance-portfolio', title: 'How to rebalance your portfolio', desc: 'Step-by-step guide for any investor' },
              { href: '/guides/how-often-to-rebalance', title: 'How often should you rebalance?', desc: 'Data-backed answer based on 30 years' },
              { href: '/guides/rebalancing-strategies', title: 'Rebalancing strategies compared', desc: 'Calendar vs. threshold vs. hybrid' },
              { href: '/portfolios/three-fund-portfolio', title: 'Three-fund portfolio calculator', desc: 'VTI + VXUS + BND rebalancing tool' },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="bg-card border border-border rounded-lg p-4 hover:border-foreground/30 transition-colors"
              >
                <div className="text-sm font-medium text-foreground mb-1">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
