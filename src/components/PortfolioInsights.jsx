import { useState } from 'react';
import { formatCurrency, formatPercent } from '../utils/calculations';

function PortfolioInsights({ results, groupedPositions }) {
  const { totalValue, positions } = results;
  const [expandedSections, setExpandedSections] = useState({
    situation: true,
    risk: true,
    tax: true,
    recommendations: true,
    schedule: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate portfolio metrics
  const totalDrift = positions.reduce((sum, p) =>
    sum + Math.abs(p.currentPercent - p.targetPercent), 0
  );
  const maxDrift = Math.max(...positions.map(p =>
    Math.abs(p.currentPercent - p.targetPercent)
  ));

  const stocksPercent = groupedPositions?.find(g =>
    g.assetClass === 'US Stocks' || g.assetClass === 'Stocks'
  )?.currentPercent || 0;

  const bondsPercent = groupedPositions?.find(g =>
    g.assetClass === 'Bonds' || g.assetClass === 'Fixed Income'
  )?.currentPercent || 0;

  const cashPercent = groupedPositions?.find(g =>
    g.assetClass === 'Cash'
  )?.currentPercent || 0;

  const needsRebalancing = maxDrift > 5;
  const nextReviewDate = new Date();
  nextReviewDate.setMonth(nextReviewDate.getMonth() + 3);
  const reviewDateStr = nextReviewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sections = [
    { key: 'situation', icon: '📊', title: 'Current Situation' },
    { key: 'risk', icon: '⚖️', title: 'Risk Assessment' },
    { key: 'tax', icon: '💰', title: 'Tax Considerations' },
    { key: 'recommendations', icon: '💡', title: 'Recommendations' },
    { key: 'schedule', icon: '📅', title: 'Review Schedule' },
  ];

  const ChevronIcon = ({ expanded }) => (
    <svg
      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-4 my-8">
      {/* Current Situation */}
      <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ animation: 'fadeInUp 400ms ease both', animationDelay: '0ms' }}>
        <button
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('situation')}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">📊</span>
            <h3 className="text-base font-semibold text-foreground">Current Situation</h3>
          </div>
          <ChevronIcon expanded={expandedSections.situation} />
        </button>
        {expandedSections.situation && (
          <div className="px-6 pb-6" style={{ animation: 'fadeIn 200ms ease' }}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your {formatCurrency(totalValue)} portfolio demonstrates{' '}
              {totalDrift < 2 ? 'excellent' : totalDrift < 5 ? 'good' : 'moderate'} alignment
              with your target allocation. The portfolio shows{' '}
              {maxDrift < 1 ? 'minimal' : maxDrift < 5 ? 'acceptable' : 'significant'} drift
              ({formatPercent(maxDrift)}), indicating{' '}
              {needsRebalancing
                ? 'that rebalancing would be beneficial to restore your target allocations.'
                : 'either recent rebalancing activity or fortuitous market movements that have kept your allocations on target.'}
            </p>
          </div>
        )}
      </div>

      {/* Risk Assessment */}
      <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ animation: 'fadeInUp 400ms ease both', animationDelay: '100ms' }}>
        <button
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('risk')}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">⚖️</span>
            <h3 className="text-base font-semibold text-foreground">Risk Assessment</h3>
          </div>
          <ChevronIcon expanded={expandedSections.risk} />
        </button>
        {expandedSections.risk && (
          <div className="px-6 pb-6" style={{ animation: 'fadeIn 200ms ease' }}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stocksPercent > 0 && (
                <>
                  With {formatPercent(stocksPercent)} in stocks, your portfolio carries{' '}
                  {stocksPercent >= 80 ? 'high' : stocksPercent >= 60 ? 'moderate' : 'low'} equity risk
                  {stocksPercent >= 60 ? ' appropriate for long-term growth' : ''}.{' '}
                </>
              )}
              {bondsPercent > 0 && (
                <>The {formatPercent(bondsPercent)} bond allocation provides stability and income generation.{' '}</>
              )}
              {cashPercent > 0 && (
                <>Your {formatPercent(cashPercent)} cash position offers liquidity for opportunities or emergencies.</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Tax Considerations */}
      <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ animation: 'fadeInUp 400ms ease both', animationDelay: '200ms' }}>
        <button
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('tax')}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">💰</span>
            <h3 className="text-base font-semibold text-foreground">Tax Considerations</h3>
          </div>
          <ChevronIcon expanded={expandedSections.tax} />
        </button>
        {expandedSections.tax && (
          <div className="px-6 pb-6" style={{ animation: 'fadeIn 200ms ease' }}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {!needsRebalancing ? (
                <>
                  Since no rebalancing transactions are currently required, you face zero immediate tax consequences.
                  This perfect alignment saves you potential capital gains taxes and transaction costs. Should the market
                  create drift above 5%, revisit this analysis to identify tax-loss harvesting opportunities.
                </>
              ) : (
                <>
                  Rebalancing your portfolio will trigger capital gains on positions you sell. Consider tax-loss harvesting
                  opportunities to offset gains, or use add-only rebalancing to avoid selling appreciated positions.
                  For tax-advantaged accounts (IRA, 401k), rebalancing has no immediate tax impact.
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ animation: 'fadeInUp 400ms ease both', animationDelay: '300ms' }}>
        <button
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('recommendations')}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">💡</span>
            <h3 className="text-base font-semibold text-foreground">Recommendations</h3>
          </div>
          <ChevronIcon expanded={expandedSections.recommendations} />
        </button>
        {expandedSections.recommendations && (
          <div className="px-6 pb-6" style={{ animation: 'fadeIn 200ms ease' }}>
            <div className="flex flex-col gap-3">
              {[
                'Monitor quarterly for drift above 5% threshold',
                positions.some(p => p.ticker && (p.ticker.includes('VTI') || p.ticker.includes('SPY')))
                  ? 'Consider tax-loss harvesting if stock positions drop below your cost basis'
                  : null,
                cashPercent > 0 ? `Maintain ${formatPercent(cashPercent)} cash for rebalancing opportunities` : null,
                'Review allocation annually as your risk tolerance or time horizon changes',
                needsRebalancing ? 'Consider add-only rebalancing to avoid triggering capital gains' : null,
              ].filter(Boolean).map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-gain font-bold text-base mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Schedule */}
      <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ animation: 'fadeInUp 400ms ease both', animationDelay: '400ms' }}>
        <button
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('schedule')}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">📅</span>
            <h3 className="text-base font-semibold text-foreground">Review Schedule</h3>
          </div>
          <ChevronIcon expanded={expandedSections.schedule} />
        </button>
        {expandedSections.schedule && (
          <div className="px-6 pb-6" style={{ animation: 'fadeIn 200ms ease' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Review Frequency', value: 'Quarterly (Every 3 months)' },
                { label: 'Rebalance Threshold', value: '5% drift from target' },
                { label: 'Next Review Date', value: reviewDateStr },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 px-3 py-3 bg-muted border border-border rounded-md">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-muted/50 border border-border rounded-md">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground font-semibold">Why This Schedule?</strong>{' '}
                Your portfolio has{' '}
                {stocksPercent >= 60 ? 'moderate' : 'low'} volatility
                ({formatPercent(stocksPercent)} stocks). Quarterly reviews balance monitoring costs with tax
                efficiency. The 5% threshold minimizes unnecessary trades while preventing significant drift.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioInsights;
