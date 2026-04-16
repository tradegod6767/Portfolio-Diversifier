import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const calculatorFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does a portfolio rebalancing calculator work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A portfolio rebalancing calculator compares your current asset allocation to your target allocation and calculates the exact buy and sell amounts needed to restore your intended weights. Enter your holdings with current dollar values and target percentages, and the calculator shows you exactly what to buy and sell.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this portfolio rebalancing calculator free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The RebalanceKit calculator is completely free with no signup required. Enter your holdings and target allocation to get instant rebalancing recommendations. A Pro plan ($9.99/mo) adds AI analysis, PDF reports, and cloud portfolio sync.',
      },
    },
    {
      '@type': 'Question',
      name: 'How often should I use a rebalancing calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most investors should check their portfolio allocation quarterly or when any asset class drifts more than 5% from its target. The 5/25 rule suggests rebalancing when a 5% absolute or 25% relative drift is detected in any position.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is add-only rebalancing mode?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Add-only mode calculates rebalancing using only purchases — no selling. You direct new contributions toward underweight positions. This approach avoids triggering capital gains taxes in taxable accounts and is especially useful when adding money to your portfolio regularly.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use this calculator for a 3-fund portfolio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Enter your three holdings (e.g., VTI, VXUS, BND) with their current values and your target percentages. The calculator will show you exactly how much to buy or sell of each fund to restore your target allocation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the calculator work for 401(k) accounts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The calculator works for any account type — 401(k), IRA, Roth IRA, or taxable brokerage. For tax-advantaged accounts like 401(k) and IRAs, you can freely sell and rebalance without capital gains concerns.',
      },
    },
  ],
};

export default function Calculator() {
  return (
    <>
      <SEO
        title="Free Portfolio Rebalancing Calculator — Instant Buy/Sell Recommendations"
        description="Enter your current holdings and target allocation. Get exact buy and sell amounts to rebalance your portfolio. Free, no signup required. Supports ETFs, stocks, and bonds."
        path="/calculator"
        jsonLd={calculatorFaqJsonLd}
      />

      {/* Hero */}
      <section className="px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Free portfolio rebalancing calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Enter your holdings and target allocation. Get exact buy and sell amounts instantly — no spreadsheet, no signup, no cost.
          </p>

          {/* CTA to the actual app */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-1">Enter your portfolio</h2>
                <p className="text-sm text-muted-foreground">
                  Add your holdings with current values and target percentages. Works with ETFs, mutual funds, stocks, bonds, and cash.
                </p>
              </div>
            </div>
            <Link
              to="/app"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Open Free Calculator
            </Link>
            <p className="text-xs text-muted-foreground mt-3">No signup required. Your data stays in your browser.</p>
          </div>
        </div>
      </section>

      {/* How this calculator works */}
      <section className="px-4 sm:px-6 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">How this calculator works</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            RebalanceKit uses a straightforward algorithm to calculate the minimum number of trades to restore your target allocation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: '1. Compare current vs. target',
                desc: 'The calculator determines each position\'s current percentage of your total portfolio and compares it to your target allocation.',
              },
              {
                title: '2. Identify drift',
                desc: 'Positions that exceed their target are overweight. Positions below target are underweight. The drift amount determines how much to trade.',
              },
              {
                title: '3. Calculate trade amounts',
                desc: 'For each position, the calculator determines the exact dollar amount to buy or sell to reach the target. Rounding errors are distributed to minimize deviation.',
              },
              {
                title: '4. Apply your rebalancing mode',
                desc: 'Standard mode suggests both buys and sells. Add-only mode restricts to purchases only — useful for avoiding capital gains in taxable accounts.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-card border border-border rounded-lg p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When to rebalance */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            When should you rebalance?
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Most financial research suggests threshold-based rebalancing outperforms calendar-based approaches. The popular{' '}
            <strong className="text-foreground">5/25 rule</strong> (popularized by William Bernstein) recommends rebalancing when:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              'Any asset class drifts more than 5 percentage points from its target (absolute threshold), OR',
              'Any asset class drifts more than 25% from its target relative to its target weight',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-gain flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            <Link to="/guides/how-often-to-rebalance" className="text-foreground hover:underline font-medium">
              Read the full guide: How often should you rebalance?
            </Link>
          </p>
        </div>
      </section>

      {/* Why use a calculator */}
      <section className="px-4 sm:px-6 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Why use a rebalancing calculator instead of a spreadsheet?
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Spreadsheets work for simple portfolios but become cumbersome as you add accounts and positions. A dedicated calculator handles:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              'Multi-position portfolios with 10+ holdings',
              'Add-only mode calculations without manual adjustments',
              'Portfolio health scoring to quantify drift',
              'Model portfolio comparisons (3-fund, 60/40)',
              'AI-powered analysis of your specific situation',
              'PDF export for record-keeping',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-gain flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {calculatorFaqJsonLd.mainEntity.map((item) => (
              <div key={item.name} className="border-b border-border pb-6 last:border-0">
                <h3 className="text-base font-medium text-foreground mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="px-4 sm:px-6 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Related guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: '/guides/how-to-rebalance-portfolio', label: 'How to rebalance your portfolio' },
              { href: '/guides/how-often-to-rebalance', label: 'How often to rebalance' },
              { href: '/portfolios/three-fund-portfolio', label: 'Three-fund portfolio calculator' },
              { href: '/features/tax-smart-rebalancing', label: 'Tax-smart rebalancing' },
              { href: '/pricing', label: 'Pro features & pricing' },
              { href: '/compare/best-rebalancing-tools', label: 'Best rebalancing tools' },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
              >
                {item.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-foreground mb-3">Ready to rebalance?</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Free to use. No account required. Works in your browser.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Open Free Calculator
          </Link>
        </div>
      </section>
    </>
  );
}
