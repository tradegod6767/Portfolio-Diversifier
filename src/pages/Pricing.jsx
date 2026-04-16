import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const pricingFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is RebalanceKit free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. RebalanceKit offers a free plan with full rebalancing calculations, add-only mode, health scoring, and model portfolio comparisons. No signup required. Pro ($9.99/month) adds AI analysis, PDF reports, and cloud portfolio sync.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel my Pro subscription anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Cancel at any time from your account settings. Pro features remain active until the end of your billing period.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is portfolio rebalancing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Portfolio rebalancing realigns asset weights to match your target allocation. Over time, market movements cause drift — stocks outperform and become overweight. Rebalancing sells overweight positions and buys underweight ones to restore your intended risk profile.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the AI analysis feature do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The AI analysis (Pro feature) uses Claude by Anthropic to analyze your portfolio and provide personalized insights: concentration risks, diversification suggestions, rebalancing rationale, and educational context tailored to your specific holdings.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my portfolio data secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your portfolio data is stored locally in your browser on the free plan. With a Pro account, portfolios sync to the cloud using Supabase with encryption at rest. We never store brokerage credentials or connect to your accounts.',
      },
    },
  ],
};

const CheckIcon = () => (
  <svg className="w-4 h-4 text-gain flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Pricing() {
  return (
    <>
      <SEO
        title="Pricing — RebalanceKit | Free Plan & Pro for $9.99/mo"
        description="Start free with our portfolio rebalancing calculator. Upgrade to Pro for $9.99/month: AI analysis, PDF reports, cloud sync, and drift alerts. Cancel anytime."
        path="/pricing"
        jsonLd={pricingFaqJsonLd}
      />

      {/* Header */}
      <section className="px-4 sm:px-6 py-16 md:py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Simple pricing for smarter rebalancing
          </h1>
          <p className="text-lg text-muted-foreground">
            Start free. Upgrade when you need more power.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Free</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground text-sm">forever</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">No signup required</p>
              </div>
              <Link
                to="/app"
                className="block w-full text-center h-9 leading-9 text-sm font-medium border border-border text-foreground rounded-md hover:bg-accent transition-colors mb-6"
              >
                Try Free Now
              </Link>
              <ul className="space-y-3">
                {[
                  'Portfolio rebalancing calculator',
                  'Add-only mode (no capital gains)',
                  'Portfolio health score',
                  'Model portfolio comparisons',
                  'CSV import',
                  'Market scenario testing',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
                {[
                  'AI-powered analysis',
                  'PDF export',
                  'Cloud portfolio sync',
                  'Rebalancing cost estimates',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground opacity-50">
                    <XIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-card border-2 border-foreground rounded-xl p-8 relative">
              <div className="absolute -top-3 left-6">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-md">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Pro</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">$9.99</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Cancel anytime</p>
              </div>
              <a
                href="https://rebalancekit.gumroad.com/l/pro"
                className="block w-full text-center h-9 leading-9 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity mb-6"
              >
                Upgrade to Pro
              </a>
              <ul className="space-y-3">
                {[
                  'Everything in Free',
                  'AI-powered portfolio analysis',
                  'PDF report export',
                  'Cloud portfolio sync',
                  'Rebalancing cost estimates',
                  'Priority email support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="px-4 sm:px-6 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Compare plans</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground p-4">Feature</th>
                  <th className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground p-4">Free</th>
                  <th className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground p-4">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { feature: 'Portfolio rebalancing calculator', free: true, pro: true },
                  { feature: 'Add-only mode (no selling)', free: true, pro: true },
                  { feature: 'Portfolio health score', free: true, pro: true },
                  { feature: 'Model portfolio comparisons', free: true, pro: true },
                  { feature: 'CSV import', free: true, pro: true },
                  { feature: 'Market scenario testing', free: true, pro: true },
                  { feature: 'AI-powered analysis', free: false, pro: true },
                  { feature: 'PDF export', free: false, pro: true },
                  { feature: 'Cloud portfolio sync', free: false, pro: true },
                  { feature: 'Rebalancing cost estimates', free: false, pro: true },
                  { feature: 'Priority support', free: false, pro: true },
                ].map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 text-sm text-foreground">{row.feature}</td>
                    <td className="p-4 text-center">
                      {row.free ? <CheckIcon /> : <XIcon />}
                    </td>
                    <td className="p-4 text-center">
                      <CheckIcon />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {pricingFaqJsonLd.mainEntity.map((item) => (
              <div key={item.name} className="border-b border-border pb-6 last:border-0">
                <h3 className="text-base font-medium text-foreground mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="px-4 sm:px-6 py-8 border-t border-border">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 text-sm">
          <Link to="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">Free calculator →</Link>
          <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">All features →</Link>
          <Link to="/features/tax-smart-rebalancing" className="text-muted-foreground hover:text-foreground transition-colors">Tax-smart rebalancing →</Link>
          <Link to="/features/multi-account" className="text-muted-foreground hover:text-foreground transition-colors">Multi-account →</Link>
        </div>
      </section>
    </>
  );
}
