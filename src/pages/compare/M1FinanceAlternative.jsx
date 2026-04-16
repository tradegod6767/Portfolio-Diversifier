import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function M1FinanceAlternative() {
  return (
    <>
      <SEO
        title="M1 Finance Rebalancing Alternative — Full Control Over Your Portfolio"
        description="M1 Finance only rebalances through new deposits. RebalanceKit gives you full rebalancing control with sell-side recommendations, tax optimization, and multi-account support."
        path="/compare/m1-finance-alternative"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/compare/best-rebalancing-tools" className="hover:text-foreground">Compare</Link>
            <span>›</span>
            <span className="text-foreground">M1 Finance Alternative</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            M1 Finance rebalancing alternative for investors who want more control
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            M1 Finance offers automated "pie" rebalancing, but only directs new deposits — it doesn't give you explicit buy/sell recommendations or work with your existing brokerage accounts.
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
