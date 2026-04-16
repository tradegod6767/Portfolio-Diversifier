import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function BestRebalancingTools() {
  return (
    <>
      <SEO
        title="7 Best Portfolio Rebalancing Tools for Individual Investors (2026)"
        description="Honest comparison of the best portfolio rebalancing tools for DIY investors. We tested RebalanceKit, Portseido, Passiv, Portfolio Visualizer, and more. Free and paid options reviewed."
        path="/compare/best-rebalancing-tools"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <span className="text-foreground">Best Rebalancing Tools</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            The best portfolio rebalancing tools for DIY investors
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Most "best software" lists compare enterprise tools costing $12,000–$28,000/year. This guide reviews tools built for individual investors managing their own portfolios.
          </p>

          <div className="space-y-10 text-muted-foreground">
            {[
              'Why most "best software" lists are comparing the wrong tools',
              'Our evaluation criteria',
              'RebalanceKit',
              'Portseido',
              'Passiv',
              'Portfolio Visualizer',
              'Spreadsheet templates',
              'M1 Finance',
              'How to choose (decision matrix)',
            ].map((heading) => (
              <section key={heading}>
                <h2 className="text-2xl font-semibold text-foreground mb-3">{heading}</h2>
                <p className="leading-relaxed">{/* TODO: expand content */}Coming soon.</p>
              </section>
            ))}
          </div>

          <div className="mt-10">
            <Link to="/calculator" className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Try RebalanceKit Free →
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/calculator', label: 'Free rebalancing calculator' },
              { href: '/compare/portfolio-visualizer-alternative', label: 'Portfolio Visualizer alternative' },
              { href: '/compare/passiv-alternative', label: 'Passiv alternative' },
              { href: '/pricing', label: 'RebalanceKit pricing' },
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
