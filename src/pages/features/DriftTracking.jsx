import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function DriftTracking() {
  return (
    <>
      <SEO
        title="Portfolio Drift Calculator & Alerts — Know When to Rebalance"
        description="Track how far your portfolio has drifted from your target allocation. Free portfolio health score and drift calculator. Know exactly when it's time to rebalance."
        path="/features/drift-tracking"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/features" className="hover:text-foreground">Features</Link>
            <span>›</span>
            <span className="text-foreground">Drift Tracking</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Portfolio drift calculator: know exactly when to rebalance
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            RebalanceKit's portfolio health score quantifies drift on a 0–100 scale. See at a glance which positions need attention and by how much.
          </p>

          <div className="space-y-8 text-muted-foreground">
            <p>{/* TODO: expand content — health score methodology, drift thresholds, when to act */}</p>
          </div>

          <div className="mt-10">
            <Link to="/app" className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Check Your Portfolio Drift →
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/calculator', label: 'Free rebalancing calculator' },
              { href: '/guides/how-often-to-rebalance', label: 'How often to rebalance' },
              { href: '/features/tax-smart-rebalancing', label: 'Tax-smart rebalancing' },
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
