import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function PortfolioVisualizerAlternative() {
  return (
    <>
      <SEO
        title="Best Portfolio Visualizer Alternative for Rebalancing (2026)"
        description="Looking for a Portfolio Visualizer alternative? RebalanceKit offers simpler portfolio rebalancing with AI suggestions, tax optimization, and drift alerts. Free tier available."
        path="/compare/portfolio-visualizer-alternative"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/compare/best-rebalancing-tools" className="hover:text-foreground">Compare</Link>
            <span>›</span>
            <span className="text-foreground">Portfolio Visualizer Alternative</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Portfolio Visualizer alternative: simpler rebalancing for DIY investors
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Portfolio Visualizer is excellent for backtesting and analysis. RebalanceKit is built for the next step: executing a rebalance with exact buy/sell amounts, add-only mode, and AI-powered insights.
          </p>

          <div className="space-y-8 text-muted-foreground">
            <p className="leading-relaxed">{/* TODO: expand content — 1,500–2,000 words covering: PV strengths (backtesting, asset allocation analysis), PV limitations (no action-oriented rebalancing calculator), how RK complements PV, feature comparison table, when to use each */}</p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link to="/app" className="inline-flex items-center justify-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Try RebalanceKit Free
            </Link>
            <Link to="/calculator" className="inline-flex items-center justify-center h-9 px-5 text-sm font-medium border border-border text-foreground rounded-md hover:bg-accent transition-colors">
              See the Calculator
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/compare/best-rebalancing-tools', label: 'Best rebalancing tools compared' },
              { href: '/calculator', label: 'Free rebalancing calculator' },
              { href: '/pricing', label: 'RebalanceKit pricing' },
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
