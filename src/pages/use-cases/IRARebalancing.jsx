import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function IRARebalancing() {
  return (
    <>
      <SEO
        title="IRA Rebalancing Calculator & Guide — Traditional & Roth"
        description="Rebalance your IRA with our free calculator. Covers Traditional IRA, Roth IRA, and coordinating rebalancing across multiple retirement accounts."
        path="/use-cases/ira-rebalancing"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <span className="text-foreground">IRA Rebalancing</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            IRA rebalancing calculator
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Rebalance your Traditional IRA, Roth IRA, or SEP-IRA with exact buy/sell amounts. No capital gains in tax-advantaged accounts.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 mb-10">
            <h2 className="text-base font-semibold text-foreground mb-2">Free IRA rebalancing calculator</h2>
            <p className="text-sm text-muted-foreground mb-4">Enter your IRA holdings and targets. Works for any IRA account type.</p>
            <Link to="/app" className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Open Calculator →
            </Link>
          </div>

          <div className="space-y-8 text-muted-foreground">
            <p>{/* TODO: expand content */}</p>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/use-cases/401k-rebalancing', label: '401(k) rebalancing guide' },
              { href: '/calculator', label: 'Free rebalancing calculator' },
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
