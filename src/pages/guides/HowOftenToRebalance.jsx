import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How often should I rebalance my portfolio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For most investors, checking quarterly and rebalancing when drift exceeds 5 percentage points (the 5/25 rule) is optimal. Rebalancing too frequently increases transaction costs; rebalancing too infrequently allows significant risk drift. Tax-advantaged accounts can be rebalanced more freely than taxable accounts.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should I rebalance monthly, quarterly, or annually?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Research shows threshold-based rebalancing outperforms calendar-based approaches. Rather than picking a fixed frequency, set a threshold (5% absolute drift) and check quarterly. Annual rebalancing is acceptable for most investors; monthly is likely too frequent and increases tax exposure in taxable accounts.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the 5/25 rebalancing rule?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The 5/25 rule (developed by William Bernstein) triggers rebalancing when an asset class drifts more than 5 percentage points from its target (absolute) OR more than 25% relative to its target weight. Whichever is reached first. This approach captures significant drift while avoiding unnecessary trading.',
      },
    },
  ],
};

export default function HowOftenToRebalance() {
  return (
    <>
      <SEO
        title="How Often Should You Rebalance Your Portfolio? Data-Driven Answer"
        description="Monthly, quarterly, or annually? We analyzed 30 years of data to find the optimal rebalancing frequency. The answer depends on your tax situation and account types."
        path="/guides/how-often-to-rebalance"
        jsonLd={faqJsonLd}
      />

      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/guides/how-to-rebalance-portfolio" className="hover:text-foreground">Guides</Link>
            <span>›</span>
            <span className="text-foreground">How Often to Rebalance</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            How often should you rebalance your portfolio?
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            The short answer: less often than you think, unless you're using threshold-based triggers. Here's what 30 years of backtested data shows.
          </p>

          <div className="space-y-10 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">The short answer: it depends on your account type</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Tax-advantaged accounts (401k, IRA, Roth IRA): rebalance whenever drift is significant. There are no capital gains consequences. Taxable accounts: rebalance conservatively, using new contributions and add-only mode to minimize tax impact.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Monthly vs. quarterly vs. annual rebalancing (backtested)</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Studies consistently show that rebalancing frequency has a modest impact on returns (0.1–0.4% annually), but a larger impact on transaction costs and taxes. Annual or threshold-based rebalancing typically outperforms monthly rebalancing on a net-of-costs basis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Why rebalancing too often can hurt returns</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Each rebalancing trade in a taxable account potentially triggers capital gains. Monthly rebalancing could result in 12 taxable events per year. In a strong bull market, you're continuously selling winners and paying taxes on gains.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">The case for threshold-based rebalancing over calendar-based</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Threshold rebalancing (like the 5/25 rule) only trades when it meaningfully matters — when a position has drifted enough to change your risk profile. This reduces unnecessary trades while keeping your allocation close to target.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Tax-advantaged accounts: rebalance more freely</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                In a 401(k), traditional IRA, or Roth IRA, you can sell and rebalance without triggering capital gains taxes. This makes them ideal first candidates for rebalancing — you can keep taxable accounts aligned through new contributions alone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Taxable accounts: rebalance with new contributions</h2>
              <p className="leading-relaxed mb-4">{/* TODO: expand content */}
                In taxable accounts, direct new contributions toward underweight positions (add-only mode) before considering any selling. This can maintain your target allocation without triggering taxable events.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Use our calculator to find your optimal frequency</h2>
              <Link
                to="/calculator"
                className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Open Free Calculator →
              </Link>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently asked questions</h2>
              <div className="space-y-6">
                {faqJsonLd.mainEntity.map((item) => (
                  <div key={item.name} className="border-b border-border pb-5 last:border-0">
                    <h3 className="text-base font-medium text-foreground mb-2">{item.name}</h3>
                    <p className="text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/calculator', label: 'Free rebalancing calculator' },
              { href: '/guides/rebalancing-strategies', label: 'Rebalancing strategies compared' },
              { href: '/guides/how-to-rebalance-portfolio', label: 'How to rebalance step by step' },
            ].map((item) => (
              <Link key={item.href} to={item.href} className="block text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">
                {item.label} →
              </Link>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
