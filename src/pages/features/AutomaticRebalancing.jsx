import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function AutomaticRebalancing() {
  return (
    <>
      <SEO
        title="Automatic Portfolio Rebalancing — Set It and Forget It"
        description="Set up automatic rebalancing rules with RebalanceKit. Get notified when your portfolio drifts and receive instant buy/sell recommendations. Free health score included."
        path="/features/automatic-rebalancing"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/features" className="hover:text-foreground">Features</Link>
            <span>›</span>
            <span className="text-foreground">Automatic Rebalancing</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Automatic portfolio rebalancing
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Enter your target allocation once. RebalanceKit tracks drift and tells you exactly what to trade when it's time to rebalance.
          </p>

          <div className="space-y-8 text-muted-foreground">
            <p>{/* TODO: expand content */}</p>
          </div>

          <div className="mt-10">
            <Link to="/app" className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Try Free →
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/features/drift-tracking', label: 'Portfolio drift tracking' },
              { href: '/calculator', label: 'Free rebalancing calculator' },
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
