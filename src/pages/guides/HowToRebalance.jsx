import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Rebalance Your Portfolio: Complete Guide for 2026',
  description:
    'Learn how to rebalance your investment portfolio step by step. Covers when to rebalance, which accounts to rebalance first, tax implications, and tools to automate the process.',
  author: {
    '@type': 'Organization',
    name: 'RebalanceKit',
    url: 'https://rebalancekit.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'RebalanceKit',
    logo: { '@type': 'ImageObject', url: 'https://rebalancekit.com/favicon-32x32.png' },
  },
  mainEntityOfPage: 'https://rebalancekit.com/guides/how-to-rebalance-portfolio',
  articleSection: 'Investment Guides',
};

export default function HowToRebalance() {
  return (
    <>
      <SEO
        title="How to Rebalance Your Portfolio: Complete Guide for 2026"
        description="Learn how to rebalance your investment portfolio step by step. Covers when to rebalance, which accounts to rebalance first, tax implications, and tools to automate the process."
        path="/guides/how-to-rebalance-portfolio"
        jsonLd={jsonLd}
      />

      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <span className="text-foreground">How to Rebalance</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            How to rebalance your portfolio: the complete guide
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Portfolio rebalancing restores your target asset allocation after market drift. This step-by-step guide covers everything from understanding drift to executing trades across multiple accounts.
          </p>

          <div className="space-y-10 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">What is portfolio rebalancing and why does it matter?</h2>
              <p className="leading-relaxed mb-4">
                Portfolio rebalancing is the process of realigning the weights of a portfolio's assets to match your original target allocation. Over time, market movements cause drift — assets that perform well become overweight relative to your targets, increasing your portfolio's risk profile.
              </p>
              <p className="leading-relaxed">
                For example: a 60/40 stock/bond portfolio that started the year at target allocation might drift to 70/30 after a strong equity run. Without rebalancing, you're taking on more stock market risk than you intended. {/* TODO: expand content */}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">When your portfolio drifts, your risk changes</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                The risk consequence of drift is the most underappreciated reason to rebalance. A portfolio that drifts from 60/40 to 70/30 stocks/bonds is meaningfully more volatile — the difference between a 20% drawdown and a 25%+ drawdown in a major bear market.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Step 1: Define your target asset allocation</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Your target allocation is the percentage of your portfolio in each asset class. Common starting points: 60% stocks / 40% bonds (classic balanced), 80/20 (growth-oriented), or the <Link to="/portfolios/three-fund-portfolio" className="text-foreground hover:underline">three-fund portfolio</Link> (US stocks / international stocks / bonds).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Step 2: Check your current allocation across all accounts</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Add up the dollar value of each asset class across your 401(k), IRA, Roth IRA, and taxable accounts. Your allocation should be viewed as a single unified portfolio, not account by account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Step 3: Calculate the difference (or use a calculator)</h2>
              <p className="leading-relaxed mb-4">{/* TODO: expand content */}
                Compare your current allocation percentages to your targets. The difference tells you which positions are overweight (need selling or underweighting) and which are underweight (need buying).
              </p>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-foreground font-medium mb-2">Use the free calculator</p>
                <p className="text-sm mb-3">Enter your holdings and get exact buy/sell amounts instantly.</p>
                <Link
                  to="/calculator"
                  className="inline-flex items-center h-8 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Open Rebalancing Calculator →
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Step 4: Decide which accounts to rebalance first</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Always rebalance tax-advantaged accounts (401(k), IRA, Roth IRA) before taxable accounts. In tax-advantaged accounts, selling and rebalancing has no immediate tax consequence. In taxable accounts, selling triggers capital gains.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Step 5: Execute trades and rebalance with new contributions</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Once you know what to buy and sell, place trades in your brokerage account. If you're adding new money (contributions), direct new contributions toward underweight positions first — this is the add-only approach that avoids triggering capital gains.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">How often should you rebalance?</h2>
              <p className="leading-relaxed mb-3">{/* TODO: expand content */}
                Research suggests threshold-based rebalancing outperforms calendar-based approaches. The 5/25 rule is widely recommended: rebalance when any asset class drifts more than 5 percentage points from target, or 25% relative to its target weight.
              </p>
              <Link to="/guides/how-often-to-rebalance" className="text-foreground hover:underline text-sm font-medium">
                Read the full guide: How often should you rebalance? →
              </Link>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Tax implications of rebalancing</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Rebalancing in taxable accounts triggers capital gains taxes on sold positions. Strategies to minimize taxes: rebalance with new contributions (add-only mode), prioritize tax-advantaged accounts, and use tax-loss harvesting when selling losing positions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Common rebalancing mistakes to avoid</h2>
              <ul className="space-y-2 list-disc list-inside">{/* TODO: expand content */}
                <li>Rebalancing too frequently (increases transaction costs and potential tax impact)</li>
                <li>Ignoring tax implications in taxable accounts</li>
                <li>Viewing each account in isolation instead of the full portfolio</li>
                <li>Changing target allocation after every market move (market timing)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Tools that make rebalancing easier</h2>
              <p className="leading-relaxed mb-4">
                A dedicated rebalancing calculator handles multi-position math, add-only mode, and multi-account coordination in seconds.
              </p>
              <Link
                to="/app"
                className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Try RebalanceKit Free
              </Link>
            </section>
          </div>

          {/* Internal links */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Related guides</h2>
            <div className="space-y-2">
              {[
                { href: '/calculator', label: 'Free portfolio rebalancing calculator' },
                { href: '/guides/how-often-to-rebalance', label: 'How often should you rebalance?' },
                { href: '/guides/rebalancing-strategies', label: 'Portfolio rebalancing strategies compared' },
                { href: '/features/tax-smart-rebalancing', label: 'Tax-smart rebalancing' },
              ].map((item) => (
                <Link key={item.href} to={item.href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline">
                  {item.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
