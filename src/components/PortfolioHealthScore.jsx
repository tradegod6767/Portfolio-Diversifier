import { useState, useEffect } from 'react';
import { calculatePortfolioHealth } from '../utils/portfolioHealth';

/**
 * Portfolio Health Score - Comprehensive health dashboard
 * Shows animated gauge, detailed factor breakdown, and actionable recommendations
 */
function PortfolioHealthScore({ positions }) {
  const [health, setHealth] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [expandedFactor, setExpandedFactor] = useState(null);

  useEffect(() => {
    const result = calculatePortfolioHealth(positions);
    setHealth(result);

    // Animate score from 0 to actual value
    const duration = 1000;
    const steps = 60;
    const increment = result.score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.score) {
        setAnimatedScore(result.score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [positions]);

  if (!health) return null;

  const scoreColor = getScoreColor(health.score);
  const ratingBadgeClass = getRatingBadgeClass(health.color);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Main Score Section */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 p-6 border-b border-border">
        {/* Gauge */}
        <div className="flex items-center justify-center md:justify-start">
          <div className="relative w-40">
            <svg viewBox="0 0 120 70" className="w-full h-auto">
              {/* Background arc */}
              <path
                d="M 10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke="var(--border)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Colored arc */}
              <path
                d="M 10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke={scoreColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="157"
                strokeDashoffset={157 - (animatedScore / 100) * 157}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
              {/* Score text */}
              <text
                x="60"
                y="52"
                textAnchor="middle"
                fontSize="32"
                fontWeight="800"
                fill="var(--foreground)"
              >
                {animatedScore}
              </text>
            </svg>
            {/* Rating badge */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${ratingBadgeClass}`}>
              {health.rating}
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="flex flex-col justify-center text-center md:text-left">
          <h3 className="text-xl font-bold text-foreground mb-2">Portfolio Health</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{health.summary}</p>

          {/* Quick Stats */}
          <div className="flex gap-4 justify-center md:justify-start">
            <div className="flex flex-col items-center px-4 py-2 bg-muted rounded-lg min-w-[70px]">
              <span className="text-2xl font-bold text-foreground leading-none">
                {health.factors.filter(f => f.status === 'good').length}
              </span>
              <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Healthy</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-muted rounded-lg min-w-[70px]">
              <span className="text-2xl font-bold text-loss leading-none">
                {health.factors.filter(f => f.status !== 'good').length}
              </span>
              <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Attention</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-muted rounded-lg min-w-[70px]">
              <span className="text-2xl font-bold text-foreground leading-none">{health.actions.length}</span>
              <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Actions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="p-5 md:p-6">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Score Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {health.factors.map((factor) => (
            <FactorCard
              key={factor.id}
              factor={factor}
              isExpanded={expandedFactor === factor.id}
              onToggle={() => setExpandedFactor(expandedFactor === factor.id ? null : factor.id)}
            />
          ))}
        </div>
      </div>

      {/* Action Items */}
      {health.actions.length > 0 && (
        <div className="p-5 md:p-6 bg-muted border-t border-border">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Recommended Actions
          </h4>
          <div className="flex flex-col gap-2.5">
            {health.actions.map((action, index) => {
              const priorityClass = action.priority === 'critical'
                ? 'border-loss/40 bg-loss-bg'
                : action.priority === 'high'
                ? 'border-border bg-background'
                : 'border-border bg-background';
              const badgeClass = action.priority === 'critical'
                ? 'bg-loss-bg text-loss'
                : action.priority === 'high'
                ? 'bg-muted text-muted-foreground'
                : 'bg-muted text-muted-foreground';
              const badgeLabel = action.priority === 'critical' ? 'Critical' : action.priority === 'high' ? 'Important' : 'Suggested';
              return (
                <div key={index} className={`flex items-start gap-3 p-3 border rounded-lg ${priorityClass}`}>
                  <div className="flex-shrink-0">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground leading-snug">{action.action}</p>
                    <span className="text-xs text-gain font-semibold">{action.impact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Perfect Score Message */}
      {health.score >= 90 && (
        <div className="flex items-center gap-4 p-5 md:p-6 bg-gain-bg border-t border-gain/30">
          <div className="w-12 h-12 bg-gain rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-gain mb-1">Excellent Portfolio Health!</h4>
            <p className="text-sm text-gain/80 leading-snug">Your portfolio is well-diversified and closely aligned with your targets. Keep up the good work!</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Factor Card Component
 */
function FactorCard({ factor, isExpanded, onToggle }) {
  const iconSvg = getFactorIcon(factor.icon);
  const percentage = (factor.earned / factor.maxPoints) * 100;

  const cardBorderClass = factor.status === 'critical'
    ? 'border-loss/40'
    : factor.status === 'warning'
    ? 'border-loss/20'
    : factor.status === 'caution'
    ? 'border-border'
    : 'border-border';

  const iconBgClass = factor.status === 'good'
    ? 'bg-gain-bg text-gain'
    : factor.status === 'caution'
    ? 'bg-muted text-muted-foreground'
    : factor.status === 'warning'
    ? 'bg-loss-bg text-loss'
    : 'bg-loss-bg text-loss';

  const progressClass = factor.status === 'good'
    ? 'bg-gain'
    : factor.status === 'caution'
    ? 'bg-muted-foreground'
    : factor.status === 'warning'
    ? 'bg-loss'
    : 'bg-loss';

  return (
    <div className={`bg-background border rounded-xl overflow-hidden transition-colors ${cardBorderClass}`}>
      <button
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClass}`}>
          {iconSvg}
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-foreground mb-0.5">{factor.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{factor.earned}/{factor.maxPoints}</span>
            {factor.lost > 0 && (
              <span className="text-xs text-loss font-semibold">-{factor.lost} pts</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-muted-foreground">
          {factor.status === 'good' ? (
            <svg className="w-5 h-5 text-gain" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {/* Progress Bar */}
      <div className="h-1 bg-muted mx-3.5 mb-3.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${progressClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Expanded Details */}
      {isExpanded && factor.status !== 'good' && (
        <div className="px-3.5 pb-3.5 space-y-2">
          {factor.issue && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground font-medium flex-shrink-0">Issue:</span>
              <span className="text-foreground">{factor.issue}</span>
            </div>
          )}
          {factor.target && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground font-medium flex-shrink-0">Target:</span>
              <span className="text-foreground">{factor.target}</span>
            </div>
          )}
          {factor.recommendation && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {factor.recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Get factor icon component
 */
const FACTOR_ICONS = {
  concentration: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  drift: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  diversification: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  assetClass: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  )
};

function getFactorIcon(iconType) {
  return FACTOR_ICONS[iconType] || FACTOR_ICONS.diversification;
}

/**
 * Get score color based on value
 */
function getScoreColor(score) {
  if (score >= 90) return 'var(--gain)';
  if (score >= 70) return 'var(--foreground)';
  if (score >= 50) return '#F59E0B';
  return 'var(--loss)';
}

/**
 * Get rating badge Tailwind classes
 */
function getRatingBadgeClass(color) {
  if (color === 'green') return 'bg-gain-bg text-gain';
  if (color === 'blue') return 'bg-muted text-foreground';
  if (color === 'yellow') return 'bg-muted text-muted-foreground';
  return 'bg-loss-bg text-loss';
}

export default PortfolioHealthScore;
