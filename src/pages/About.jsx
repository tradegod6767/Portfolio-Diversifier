import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function About() {
  return (
    <>
      <SEO
        title="About RebalanceKit — Portfolio Rebalancing for DIY Investors"
        description="RebalanceKit helps DIY investors calculate exact rebalancing trades to maintain target allocations. Built on a simple premise: rebalancing shouldn't require a financial advisor."
        path="/about"
      />

      <section className="px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            About RebalanceKit
          </h1>

          <div className="prose-sm space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              RebalanceKit helps investors calculate exact rebalancing trades to maintain their target portfolio allocations — without a spreadsheet, financial advisor, or expensive software subscription.
            </p>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Key Features</h2>
              <ul className="space-y-2">
                {[
                  { name: 'Add-Only Mode', desc: 'Only buy positions, never sell — avoids capital gains taxes.' },
                  { name: 'Health Score', desc: 'Measures portfolio concentration and drift risk (0–100).' },
                  { name: 'Model Portfolios', desc: 'Compare to popular strategies like 3-fund or 60/40.' },
                  { name: 'PDF Reports', desc: 'Export professional summaries with charts and analysis.' },
                  { name: 'AI Analysis', desc: 'Personalized insights powered by Claude (Anthropic).' },
                  { name: 'Multiple Modes', desc: 'Standard, add-only, contribution, withdrawal, or sell-only.' },
                ].map((item) => (
                  <li key={item.name} className="flex gap-2 text-sm">
                    <svg className="w-4 h-4 text-gain flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong className="text-foreground">{item.name}:</strong> {item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">How We Calculate Rebalancing</h2>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li><strong className="text-foreground">Compare allocations:</strong> We calculate your current percentage in each holding and compare it to your targets.</li>
                <li><strong className="text-foreground">Identify drift:</strong> Holdings above target are overweight; below target are underweight.</li>
                <li><strong className="text-foreground">Calculate trades:</strong> We determine the minimum dollar amounts to buy or sell for each position to reach your targets.</li>
                <li><strong className="text-foreground">Apply your mode:</strong> Standard, add-only, contribution, or withdrawal modes adjust recommendations accordingly.</li>
              </ol>
              <p className="text-xs mt-4 text-muted-foreground">
                Add-only mode only suggests purchases, helping you rebalance without selling and triggering capital gains taxes.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Privacy & Security</h2>
              <p className="text-sm">
                Your portfolio data is stored locally in your browser on the free plan. With a Pro account, portfolios sync to the cloud using encrypted storage. We never connect to your brokerage accounts or store credentials.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">Portfolio Health Score</h2>
              <p className="text-sm mb-4">Your health score (0–100) measures how well-balanced and diversified your portfolio is:</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { range: '80–100: Excellent', desc: 'Well-diversified, close to targets', color: 'bg-gain-bg border-gain/30 text-gain' },
                  { range: '60–79: Good', desc: 'Minor drift, consider rebalancing', color: 'bg-muted border-border text-foreground' },
                  { range: '40–59: Fair', desc: 'Noticeable drift, rebalancing recommended', color: 'bg-muted border-border text-muted-foreground' },
                  { range: '0–39: Needs Attention', desc: 'Significant drift or concentration risk', color: 'bg-loss-bg border-loss/30 text-loss' },
                ].map((item) => (
                  <div key={item.range} className={`p-3 rounded-lg border text-xs ${item.color}`}>
                    <div className="font-semibold">{item.range}</div>
                    <div className="opacity-80 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              to="/app"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Try the Calculator
            </Link>
            <Link
              to="/guides/how-to-rebalance-portfolio"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium border border-border text-foreground rounded-md hover:bg-accent transition-colors"
            >
              Read the Guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
