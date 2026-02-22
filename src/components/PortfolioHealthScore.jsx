import { useState, useEffect } from 'react';
import { calculatePortfolioHealth } from '../utils/portfolioHealth';
import './PortfolioHealthScore.css';

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

  return (
    <div className="health-dashboard">
      {/* Main Score Section */}
      <div className="health-header">
        <div className="health-gauge-section">
          {/* Circular Gauge */}
          <div className="health-gauge">
            <svg viewBox="0 0 120 70" className="gauge-svg">
              {/* Background arc */}
              <path
                d="M 10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke="#334155"
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
                className="gauge-fill"
              />
              {/* Score text */}
              <text x="60" y="52" textAnchor="middle" className="gauge-score">
                {animatedScore}
              </text>
            </svg>
            {/* Rating badge */}
            <div className={`health-rating-badge ${health.color}`}>
              {health.rating}
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="health-summary">
          <h3 className="health-title">Portfolio Health</h3>
          <p className="health-summary-text">{health.summary}</p>

          {/* Quick Stats */}
          <div className="health-quick-stats">
            <div className="quick-stat">
              <span className="quick-stat-value">{health.factors.filter(f => f.status === 'good').length}</span>
              <span className="quick-stat-label">Healthy</span>
            </div>
            <div className="quick-stat warning">
              <span className="quick-stat-value">{health.factors.filter(f => f.status !== 'good').length}</span>
              <span className="quick-stat-label">Need Attention</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-value">{health.actions.length}</span>
              <span className="quick-stat-label">Actions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="health-factors">
        <h4 className="factors-title">Score Breakdown</h4>
        <div className="factors-grid">
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
        <div className="health-actions">
          <h4 className="actions-title">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Recommended Actions
          </h4>
          <div className="actions-list">
            {health.actions.map((action, index) => (
              <div key={index} className={`action-item ${action.priority}`}>
                <div className="action-priority">
                  {action.priority === 'critical' ? (
                    <span className="priority-badge critical">Critical</span>
                  ) : action.priority === 'high' ? (
                    <span className="priority-badge high">Important</span>
                  ) : (
                    <span className="priority-badge normal">Suggested</span>
                  )}
                </div>
                <div className="action-content">
                  <p className="action-text">{action.action}</p>
                  <span className="action-impact">{action.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perfect Score Message */}
      {health.score >= 90 && (
        <div className="health-perfect">
          <div className="perfect-icon">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="perfect-content">
            <h4>Excellent Portfolio Health!</h4>
            <p>Your portfolio is well-diversified and closely aligned with your targets. Keep up the good work!</p>
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

  return (
    <div className={`factor-card ${factor.status}`}>
      <button className="factor-header" onClick={onToggle}>
        <div className={`factor-icon ${factor.status}`}>
          {iconSvg}
        </div>
        <div className="factor-info">
          <span className="factor-name">{factor.name}</span>
          <div className="factor-score-row">
            <span className="factor-score">{factor.earned}/{factor.maxPoints}</span>
            {factor.lost > 0 && (
              <span className="factor-lost">-{factor.lost} pts</span>
            )}
          </div>
        </div>
        <div className="factor-status-icon">
          {factor.status === 'good' ? (
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {/* Progress Bar */}
      <div className="factor-progress">
        <div
          className={`factor-progress-fill ${factor.status}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Expanded Details */}
      {isExpanded && factor.status !== 'good' && (
        <div className="factor-details">
          {factor.issue && (
            <div className="factor-detail-row">
              <span className="detail-label">Issue:</span>
              <span className="detail-value">{factor.issue}</span>
            </div>
          )}
          {factor.target && (
            <div className="factor-detail-row">
              <span className="detail-label">Target:</span>
              <span className="detail-value">{factor.target}</span>
            </div>
          )}
          {factor.recommendation && (
            <div className="factor-recommendation">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  if (score >= 90) return '#10b981'; // emerald
  if (score >= 70) return '#3b82f6'; // blue
  if (score >= 50) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export default PortfolioHealthScore;
