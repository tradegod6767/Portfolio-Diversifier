import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function MultiAccount() {
  return (
    <>
      <SEO
        title="Multi-Account Portfolio Rebalancing — See Your Whole Portfolio as One"
        description="Rebalance across your 401(k), IRA, Roth IRA, and taxable accounts as a single portfolio. RebalanceKit shows the complete picture across all your investment accounts."
        path="/features/multi-account"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/features" className="hover:text-foreground">Features</Link>
            <span>›</span>
            <span className="text-foreground">Multi-Account</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Rebalance across all your accounts at once
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Most investors hold assets across multiple accounts. View and rebalance them as a single unified portfolio.
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
              { href: '/calculator', label: 'Free rebalancing calculator' },
              { href: '/use-cases/401k-rebalancing', label: '401(k) rebalancing' },
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
