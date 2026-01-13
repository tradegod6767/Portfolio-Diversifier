import { useState } from 'react';
import { formatCurrency, formatPercent } from '../utils/calculations';
import './PortfolioInsights.css';

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

  // Get stock allocation (simplified - you may want to enhance this)
  const stocksPercent = groupedPositions?.find(g =>
    g.assetClass === 'US Stocks' || g.assetClass === 'Stocks'
  )?.currentPercent || 0;

  const bondsPercent = groupedPositions?.find(g =>
    g.assetClass === 'Bonds' || g.assetClass === 'Fixed Income'
  )?.currentPercent || 0;

  const cashPercent = groupedPositions?.find(g =>
    g.assetClass === 'Cash'
  )?.currentPercent || 0;

  // Determine if rebalancing is needed
  const needsRebalancing = maxDrift > 5;
  const hasCapitalGains = positions.some(p => p.difference !== 0);

  // Calculate next review date (3 months from now)
  const nextReviewDate = new Date();
  nextReviewDate.setMonth(nextReviewDate.getMonth() + 3);
  const reviewDateStr = nextReviewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="portfolio-insights">
      {/* Current Situation */}
      <div className="insight-card" style={{ animationDelay: '0ms' }}>
        <div
          className="insight-card-header"
          onClick={() => toggleSection('situation')}
        >
          <div className="insight-card-title-group">
            <span className="insight-icon">📊</span>
            <h3 className="insight-card-title">Current Situation</h3>
          </div>
          <button className="insight-toggle-btn" aria-label="Toggle section">
            <svg
              className={`insight-chevron ${expandedSections.situation ? 'expanded' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {expandedSections.situation && (
          <div className="insight-card-content">
            <p className="insight-paragraph">
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
      <div className="insight-card" style={{ animationDelay: '100ms' }}>
        <div
          className="insight-card-header"
          onClick={() => toggleSection('risk')}
        >
          <div className="insight-card-title-group">
            <span className="insight-icon">⚖️</span>
            <h3 className="insight-card-title">Risk Assessment</h3>
          </div>
          <button className="insight-toggle-btn" aria-label="Toggle section">
            <svg
              className={`insight-chevron ${expandedSections.risk ? 'expanded' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {expandedSections.risk && (
          <div className="insight-card-content">
            <p className="insight-paragraph">
              {stocksPercent > 0 && (
                <>
                  With {formatPercent(stocksPercent)} in stocks, your portfolio carries{' '}
                  {stocksPercent >= 80 ? 'high' : stocksPercent >= 60 ? 'moderate' : 'low'} equity risk
                  {stocksPercent >= 60 ? ' appropriate for long-term growth' : ''}.{' '}
                </>
              )}
              {bondsPercent > 0 && (
                <>
                  The {formatPercent(bondsPercent)} bond allocation provides stability and income generation.{' '}
                </>
              )}
              {cashPercent > 0 && (
                <>
                  Your {formatPercent(cashPercent)} cash position offers liquidity for opportunities or emergencies.
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Tax Considerations */}
      <div className="insight-card" style={{ animationDelay: '200ms' }}>
        <div
          className="insight-card-header"
          onClick={() => toggleSection('tax')}
        >
          <div className="insight-card-title-group">
            <span className="insight-icon">💰</span>
            <h3 className="insight-card-title">Tax Considerations</h3>
          </div>
          <button className="insight-toggle-btn" aria-label="Toggle section">
            <svg
              className={`insight-chevron ${expandedSections.tax ? 'expanded' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {expandedSections.tax && (
          <div className="insight-card-content">
            <p className="insight-paragraph">
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
      <div className="insight-card" style={{ animationDelay: '300ms' }}>
        <div
          className="insight-card-header"
          onClick={() => toggleSection('recommendations')}
        >
          <div className="insight-card-title-group">
            <span className="insight-icon">💡</span>
            <h3 className="insight-card-title">Recommendations</h3>
          </div>
          <button className="insight-toggle-btn" aria-label="Toggle section">
            <svg
              className={`insight-chevron ${expandedSections.recommendations ? 'expanded' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {expandedSections.recommendations && (
          <div className="insight-card-content">
            <div className="insight-recommendation-list">
              <div className="insight-recommendation-item">
                <span className="insight-check">✓</span>
                <span>Monitor quarterly for drift above 5% threshold</span>
              </div>
              {positions.some(p => p.ticker && (p.ticker.includes('VTI') || p.ticker.includes('SPY'))) && (
                <div className="insight-recommendation-item">
                  <span className="insight-check">✓</span>
                  <span>Consider tax-loss harvesting if stock positions drop below your cost basis</span>
                </div>
              )}
              {cashPercent > 0 && (
                <div className="insight-recommendation-item">
                  <span className="insight-check">✓</span>
                  <span>Maintain {formatPercent(cashPercent)} cash for rebalancing opportunities</span>
                </div>
              )}
              <div className="insight-recommendation-item">
                <span className="insight-check">✓</span>
                <span>Review allocation annually as your risk tolerance or time horizon changes</span>
              </div>
              {needsRebalancing && (
                <div className="insight-recommendation-item">
                  <span className="insight-check">✓</span>
                  <span>Consider add-only rebalancing to avoid triggering capital gains</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Review Schedule */}
      <div className="insight-card" style={{ animationDelay: '400ms' }}>
        <div
          className="insight-card-header"
          onClick={() => toggleSection('schedule')}
        >
          <div className="insight-card-title-group">
            <span className="insight-icon">📅</span>
            <h3 className="insight-card-title">Review Schedule</h3>
          </div>
          <button className="insight-toggle-btn" aria-label="Toggle section">
            <svg
              className={`insight-chevron ${expandedSections.schedule ? 'expanded' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {expandedSections.schedule && (
          <div className="insight-card-content">
            <div className="insight-schedule-grid">
              <div className="insight-schedule-item">
                <span className="insight-schedule-label">Review Frequency</span>
                <span className="insight-schedule-value">Quarterly (Every 3 months)</span>
              </div>
              <div className="insight-schedule-item">
                <span className="insight-schedule-label">Rebalance Threshold</span>
                <span className="insight-schedule-value">5% drift from target</span>
              </div>
              <div className="insight-schedule-item">
                <span className="insight-schedule-label">Next Review Date</span>
                <span className="insight-schedule-value">{reviewDateStr}</span>
              </div>
            </div>
            <div className="insight-schedule-explanation">
              <p>
                <strong>Why This Schedule?</strong> Your portfolio has{' '}
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
