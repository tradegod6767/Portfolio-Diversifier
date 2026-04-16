import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function RebalancingStrategies() {
  return (
    <>
      <SEO
        title="Portfolio Rebalancing Strategies Compared: Calendar, Threshold & More"
        description="Compare calendar, threshold, and hybrid rebalancing strategies. Data-backed analysis of which approach maximizes returns while minimizing taxes and transaction costs."
        path="/guides/rebalancing-strategies"
      />

      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/guides/how-to-rebalance-portfolio" className="hover:text-foreground">Guides</Link>
            <span>›</span>
            <span className="text-foreground">Strategies</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Portfolio rebalancing strategies: which one actually works best?
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Calendar, threshold, and hybrid strategies each have tradeoffs. Here's what the research says — and how to choose the right one for your situation.
          </p>

          <div className="space-y-10 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">The three main approaches to rebalancing</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Every rebalancing strategy answers one question: <em>when do I rebalance?</em> The three main answers are: on a fixed schedule (calendar), when drift exceeds a threshold (threshold), or a combination of both (hybrid).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Calendar rebalancing: simple but imprecise</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Calendar rebalancing means rebalancing on a fixed schedule — monthly, quarterly, or annually. It's easy to implement and creates discipline, but it may trigger unnecessary trades when markets have barely moved, or miss large drifts between scheduled dates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Threshold rebalancing: the 5/25 rule and band-based approaches</h2>
              <p className="leading-relaxed mb-4">{/* TODO: expand content */}
                Threshold rebalancing triggers trades only when drift exceeds a defined limit. The 5/25 rule (Bernstein): rebalance when an asset class drifts 5 percentage points or 25% relative to its target weight — whichever comes first. This approach trades only when it matters.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Hybrid strategies</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Hybrid approaches combine calendar and threshold triggers: check allocation quarterly, but only rebalance if drift exceeds a threshold. This balances discipline with efficiency — you're not rebalancing unnecessarily, but you're not missing major drift either.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Rebalancing with new contributions only</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                If you're adding money regularly (contributing to 401k, IRA, or taxable account), you can direct new contributions to underweight positions instead of selling overweight ones. This approach avoids capital gains in taxable accounts entirely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">What the academic research says</h2>
              <p className="leading-relaxed">{/* TODO: expand content */}
                Multiple studies (Vanguard, Morningstar, Bernstein) conclude that the difference between calendar and threshold approaches is small — maybe 0.1–0.4% annually. The bigger factor is whether you rebalance at all versus letting a portfolio drift indefinitely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Which strategy is right for you?</h2>
              <p className="leading-relaxed mb-4">{/* TODO: expand content */}
                For most investors: quarterly check + 5% threshold = hybrid approach. In tax-advantaged accounts, rebalance freely. In taxable accounts, lean on new contributions and add-only mode.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Try each strategy with our calculator</h2>
              <Link
                to="/calculator"
                className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Open Free Calculator →
              </Link>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/calculator', label: 'Free rebalancing calculator' },
              { href: '/guides/how-often-to-rebalance', label: 'How often to rebalance' },
              { href: '/guides/how-to-rebalance-portfolio', label: 'Complete rebalancing guide' },
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
