import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function SixtyFortyPortfolio() {
  return (
    <>
      <SEO
        title="60/40 Portfolio Rebalancing Calculator — Is 60/40 Still Right for You?"
        description="Rebalance your 60/40 portfolio with our free calculator. Plus: historical performance data, optimal rebalancing frequency, and whether 60/40 still makes sense in 2026."
        path="/portfolios/60-40-portfolio"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <span className="text-foreground">60/40 Portfolio</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            60/40 portfolio rebalancing calculator
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            The classic 60% stocks / 40% bonds portfolio. Free calculator to rebalance it and stay on target.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 mb-10">
            <h2 className="text-base font-semibold text-foreground mb-2">Rebalance your 60/40 portfolio</h2>
            <p className="text-sm text-muted-foreground mb-4">Enter your stock and bond allocations for instant buy/sell recommendations.</p>
            <Link to="/app" className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Open Calculator →
            </Link>
          </div>

          <div className="space-y-8 text-muted-foreground">
            <p>{/* TODO: expand content — 1,500–2,000 words */}</p>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/portfolios/three-fund-portfolio', label: 'Three-fund portfolio calculator' },
              { href: '/calculator', label: 'Free rebalancing calculator' },
              { href: '/guides/how-often-to-rebalance', label: 'How often to rebalance' },
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
