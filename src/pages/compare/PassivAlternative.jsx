import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function PassivAlternative() {
  return (
    <>
      <SEO
        title="Passiv Alternative — Portfolio Rebalancing Beyond Canada | RebalanceKit"
        description="Looking for a Passiv alternative with broader broker support? RebalanceKit offers AI-powered rebalancing for any portfolio, with tax-smart suggestions and drift alerts."
        path="/compare/passiv-alternative"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/compare/best-rebalancing-tools" className="hover:text-foreground">Compare</Link>
            <span>›</span>
            <span className="text-foreground">Passiv Alternative</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Looking for a Passiv alternative?
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Passiv is a solid tool but focuses heavily on Canadian brokerages. RebalanceKit works for any portfolio at any US (or global) brokerage, with no API connection required.
          </p>

          <div className="space-y-8 text-muted-foreground">
            <p>{/* TODO: expand content — 1,200–1,500 words */}</p>
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
