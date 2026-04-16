import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const features = [
  {
    href: '/features/tax-smart-rebalancing',
    title: 'Tax-smart rebalancing',
    desc: 'Add-only mode lets you rebalance without selling a single share, avoiding capital gains taxes entirely. Works in taxable brokerage accounts.',
    badge: 'Free',
  },
  {
    href: '/features/drift-tracking',
    title: 'Portfolio drift tracking',
    desc: 'See exactly how far each position has drifted from its target. Health score quantifies drift on a 0–100 scale. Know at a glance when to act.',
    badge: 'Free',
  },
  {
    href: '/calculator',
    title: 'Rebalancing calculator',
    desc: 'Enter current holdings and target allocation. Get exact buy/sell amounts in seconds. Supports standard, add-only, contribution, and withdrawal modes.',
    badge: 'Free',
  },
  {
    href: '/features/multi-account',
    title: 'Model portfolio comparison',
    desc: 'Compare your allocation to popular strategies: 3-fund (VTI/VXUS/BND), 60/40, All-Weather, and more. See how your portfolio stacks up.',
    badge: 'Free',
  },
  {
    href: '/features/automatic-rebalancing',
    title: 'AI portfolio analysis',
    desc: 'Claude AI analyzes your portfolio and provides personalized insights: concentration risks, rebalancing rationale, and actionable suggestions.',
    badge: 'Pro',
  },
  {
    href: '/features/tax-smart-rebalancing',
    title: 'PDF report export',
    desc: 'Export a professional PDF report with charts, rebalancing recommendations, health score, and AI analysis for your records.',
    badge: 'Pro',
  },
];

export default function Features() {
  return (
    <>
      <SEO
        title="Features — Portfolio Rebalancing Tools | RebalanceKit"
        description="Explore RebalanceKit's features: free rebalancing calculator, add-only mode for tax efficiency, portfolio health score, AI analysis, PDF export, and model portfolio comparison."
        path="/features"
      />

      {/* Header */}
      <section className="px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Every tool you need to stay rebalanced
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Built for DIY investors managing their own Vanguard, Fidelity, or Schwab accounts. No brokerage connection required.
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.href} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-base font-semibold text-foreground">{feature.title}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                    feature.badge === 'Pro'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gain-bg text-gain'
                  }`}>
                    {feature.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feature.desc}</p>
                <Link to={feature.href} className="text-sm font-medium text-foreground hover:underline">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key differentiators */}
      <section className="px-4 sm:px-6 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Why RebalanceKit?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'No brokerage connection',
                desc: 'Enter values manually or import CSV. We never ask for account credentials, OAuth tokens, or read-only access to your brokerage.',
              },
              {
                title: 'Tax-aware by default',
                desc: 'Add-only mode is built in from day one, not an afterthought. Prioritize contributions to underweight positions before considering sells.',
              },
              {
                title: 'No subscription required to start',
                desc: 'The core calculator is free forever. All the math that matters is available without creating an account.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-foreground mb-3">See it in action</h2>
          <p className="text-muted-foreground text-sm mb-6">Try the calculator free — no signup, no credit card.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/app"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Try Free Calculator
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium border border-border text-foreground rounded-md hover:bg-accent transition-colors"
            >
              View Pro Plan
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
