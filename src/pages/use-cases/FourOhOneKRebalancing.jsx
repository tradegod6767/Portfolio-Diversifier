import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function FourOhOneKRebalancing() {
  return (
    <>
      <SEO
        title="How to Rebalance Your 401(k): Free Calculator & Step-by-Step Guide"
        description="Rebalance your 401(k) with our free calculator. Step-by-step instructions for Fidelity, Vanguard, and Schwab 401(k) plans. No capital gains in tax-deferred accounts."
        path="/use-cases/401k-rebalancing"
      />
      <article className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <span className="text-foreground">401(k) Rebalancing</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            How to rebalance your 401(k)
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Rebalancing a 401(k) is completely free of capital gains taxes — making it the ideal first place to rebalance. Here's how to do it step by step.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 mb-10">
            <h2 className="text-base font-semibold text-foreground mb-2">Free 401(k) rebalancing calculator</h2>
            <p className="text-sm text-muted-foreground mb-4">Enter your 401(k) holdings. Get exact buy/sell amounts. No capital gains to worry about.</p>
            <Link to="/app" className="inline-flex items-center h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Open Calculator →
            </Link>
          </div>

          <div className="space-y-8 text-muted-foreground">
            <p>{/* TODO: expand content — step-by-step for Fidelity, Vanguard, Schwab */}</p>
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-2">
            {[
              { href: '/use-cases/ira-rebalancing', label: 'IRA rebalancing guide' },
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
