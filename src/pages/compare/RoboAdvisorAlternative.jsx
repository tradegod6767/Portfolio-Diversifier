import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function RoboAdvisorAlternative() {
  return (
    <>
      <SEO
        title="DIY Portfolio Rebalancing vs. Robo-Advisors | RebalanceKit"
        description="Get robo-advisor-quality rebalancing without the fees. RebalanceKit gives DIY investors automated rebalancing, tax optimization, and full control over their portfolio."
        path="/compare/robo-advisor-alternative"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/compare/best-rebalancing-tools" className="hover:text-foreground">Compare</Link>
            <span>›</span>
            <span className="text-foreground">Robo-Advisor Alternative</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Robo-advisor rebalancing without robo-advisor fees
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Robo-advisors like Wealthfront and Betterment charge 0.25%/year to manage what you can do yourself in 10 minutes per quarter.
          </p>

          <div className="space-y-8 text-muted-foreground">
            <p>{/* TODO: expand content */}</p>
          </div>

          <div className="mt-10 flex gap-3">
            <Link to="/app" className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Try RebalanceKit Free
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/compare/best-rebalancing-tools', label: 'All rebalancing tools compared' },
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
