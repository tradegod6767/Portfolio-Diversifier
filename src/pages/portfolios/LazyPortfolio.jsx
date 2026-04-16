import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function LazyPortfolio() {
  return (
    <>
      <SEO
        title="Lazy Portfolio Rebalancing Calculator & Guide"
        description="Rebalance your lazy portfolio with our free calculator. Covers Golden Butterfly, All-Weather, and other popular lazy portfolio strategies."
        path="/portfolios/lazy-portfolio"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <span className="text-foreground">Lazy Portfolio</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Lazy portfolio rebalancing calculator
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Golden Butterfly, All-Weather, Coffeehouse, and other lazy portfolios. Free rebalancing calculator for all of them.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 mb-10">
            <h2 className="text-base font-semibold text-foreground mb-2">Rebalance any lazy portfolio</h2>
            <p className="text-sm text-muted-foreground mb-4">Enter your holdings and targets. Works for any multi-asset allocation strategy.</p>
            <Link to="/app" className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Open Calculator →
            </Link>
          </div>

          <div className="space-y-8 text-muted-foreground">
            <p>{/* TODO: expand content */}</p>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/portfolios/three-fund-portfolio', label: 'Three-fund portfolio' },
              { href: '/portfolios/60-40-portfolio', label: '60/40 portfolio' },
              { href: '/calculator', label: 'Free calculator' },
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
