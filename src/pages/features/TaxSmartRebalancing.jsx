import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function TaxSmartRebalancing() {
  return (
    <>
      <SEO
        title="Tax-Smart Portfolio Rebalancing — Minimize Taxes While Rebalancing"
        description="RebalanceKit's tax-smart rebalancing suggests which accounts to rebalance first, uses add-only mode to avoid capital gains, and helps you rebalance without selling."
        path="/features/tax-smart-rebalancing"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/features" className="hover:text-foreground">Features</Link>
            <span>›</span>
            <span className="text-foreground">Tax-Smart Rebalancing</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Tax-smart rebalancing: keep more of your returns
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Most free tools ignore taxes. RebalanceKit's add-only mode lets you rebalance without selling a single share — eliminating capital gains exposure in taxable accounts.
          </p>

          <div className="space-y-10 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">How tax-smart rebalancing works</h2>
              <p className="leading-relaxed mb-4">
                Traditional rebalancing sells overweight positions and buys underweight ones. In a taxable brokerage account, every sale is a potential capital gains tax event. Tax-smart rebalancing avoids or minimizes these taxable events.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Rebalance tax-advantaged accounts first</h2>
              <p className="leading-relaxed">
                In 401(k), IRA, and Roth IRA accounts, you can sell and rebalance freely with no capital gains tax. Always rebalance these accounts first before touching taxable accounts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Add-only mode: rebalance without selling</h2>
              <p className="leading-relaxed mb-4">
                Add-only mode calculates how to use new contributions to restore your target allocation — without selling any positions. If you're adding money to your portfolio regularly (401k contributions, IRA contributions, direct deposits), add-only mode can keep you balanced without triggering a single taxable event.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">See tax-smart rebalancing in action</h2>
              <Link
                to="/app"
                className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Try Free Calculator →
              </Link>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/calculator', label: 'Free rebalancing calculator' },
              { href: '/use-cases/401k-rebalancing', label: '401(k) rebalancing (no taxes)' },
              { href: '/features/drift-tracking', label: 'Portfolio drift tracking' },
              { href: '/pricing', label: 'Pro features' },
            ].map((item) => (
              <Link key={item.href} to={item.href} className="block text-sm text-muted-foreground hover:text-foreground hover:underline">
                {item.label} →
              </Link>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
