import { Button } from './ui';
import FinancialDisclaimer from './FinancialDisclaimer';

/**
 * ProfessionalHero — Minimal Fintech design system
 * Left-aligned headline, no gradients, no indigo/purple
 */
export default function ProfessionalHero({ onNavigate, onLoadExample }) {
  const CheckIcon = () => (
    <svg className="w-4 h-4 text-gain flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="min-h-[85vh] flex flex-col">
      {/* Hero */}
      <div className="flex-1 px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">

          {/* Two-column hero layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
            {/* Left: Headline + CTA */}
            <div className="space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gain-bg border border-gain/30 rounded-md">
                <CheckIcon />
                <span className="text-xs font-semibold text-gain uppercase tracking-wider">
                  Tax-Smart Portfolio Rebalancing
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Rebalance your portfolio.<br />
                <span className="text-muted-foreground">Minimize the tax bill.</span>
              </h1>

              {/* Sub */}
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Calculate exact buy and sell orders in seconds. Add-only mode keeps you balanced without triggering capital gains.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={onLoadExample} variant="primary" size="lg" className="w-full sm:w-auto">
                  Try Calculator Free
                </Button>
                <Button onClick={() => onNavigate('about')} variant="secondary" size="lg" className="w-full sm:w-auto">
                  How It Works
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                {['No signup required', 'Your data stays private', 'Free forever plan'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckIcon />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product preview card */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Portfolio Summary</span>
                <span className="text-xs text-muted-foreground">Sample</span>
              </div>

              {/* Mock portfolio rows */}
              <div className="space-y-3">
                {[
                  { ticker: 'VTI', name: 'US Stocks', current: '68%', target: '60%', action: 'SELL', amount: '$4,000' },
                  { ticker: 'VXUS', name: 'Intl Stocks', current: '18%', target: '20%', action: 'BUY', amount: '$1,000' },
                  { ticker: 'BND', name: 'Bonds', current: '14%', target: '20%', action: 'BUY', amount: '$3,000' },
                ].map((row) => (
                  <div key={row.ticker} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground">{row.ticker[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{row.ticker}</p>
                        <p className="text-xs text-muted-foreground">{row.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-md mb-1 ${
                        row.action === 'BUY' ? 'bg-gain-bg text-gain' : 'bg-loss-bg text-loss'
                      }`}>
                        {row.action} {row.amount}
                      </span>
                      <p className="text-xs text-muted-foreground">{row.current} → {row.target}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">3 trades needed</span>
                <span className="text-xs font-semibold text-foreground">Portfolio: $50,000</span>
              </div>
            </div>
          </div>

          {/* Feature cards — real product features, no icons for decoration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              {
                title: 'Add-Only Mode',
                desc: 'Rebalance by only buying positions. Avoid capital gains taxes completely.',
                stat: 'Save 15–20% in taxes',
                statClass: 'text-gain',
              },
              {
                title: 'Health Score',
                desc: 'Instant analysis of concentration risk, drift, and allocation quality on a 0–100 scale.',
                stat: 'Instant analysis',
                statClass: 'text-foreground',
              },
              {
                title: 'Cloud Sync',
                desc: 'Save unlimited portfolios with cloud sync. Access from any device, anytime.',
                stat: 'Pro — $9/month',
                statClass: 'text-muted-foreground',
              },
              {
                title: 'PDF Reports',
                desc: 'Export professional reports with charts, trades, and AI analysis for your records.',
                stat: 'Pro — $9/month',
                statClass: 'text-muted-foreground',
              },
            ].map(({ title, desc, stat, statClass }) => (
              <div key={title} className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                <p className={`text-sm font-semibold ${statClass}`}>{stat}</p>
              </div>
            ))}
          </div>

          {/* Financial Disclaimer */}
          <div className="mb-16">
            <FinancialDisclaimer variant="banner" />
          </div>

          {/* Social proof */}
          <div className="text-center pt-10 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Trusted by investors</p>
            <blockquote className="text-lg md:text-xl font-medium text-foreground max-w-2xl mx-auto leading-relaxed">
              "Perfect for Boglehead investors who want to stay balanced without constant monitoring"
            </blockquote>
            <p className="mt-3 text-sm text-muted-foreground">— Portfolio management made simple</p>
          </div>
        </div>
      </div>
    </div>
  );
}
