import { calculatePortfolioHealth, calculateDrift } from '../utils/portfolioHealth';
import Tooltip from './Tooltip';

function PortfolioHealthScore({ positions }) {
  const health = calculatePortfolioHealth(positions);
  const drift = calculateDrift(positions);

  const healthColorClasses = {
    green: 'bg-slate-100 text-slate-800 border-slate-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    yellow: 'bg-slate-100 text-slate-800 border-slate-300',
    red: 'bg-slate-100 text-slate-800 border-slate-300'
  };

  const driftColorClasses = {
    green: 'text-slate-700',
    yellow: 'text-slate-700',
    red: 'text-slate-700'
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Drift Indicator */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Portfolio Drift:</span>
          <span className={`text-lg font-bold ${driftColorClasses[drift.color]}`}>
            {drift.percentage.toFixed(1)}% ({drift.status})
          </span>
        </div>
      </div>

      {/* Health Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            Portfolio Health Score
            <Tooltip text="Measures portfolio concentration and drift risk (0-100). Higher scores indicate better diversification and alignment with target allocations." />
          </h3>
          <div className={`px-4 py-2 rounded-lg border-2 ${healthColorClasses[health.color]}`}>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{health.score}</span>
              <div className="text-left">
                <div className="text-xs">out of 100</div>
                <div className="text-sm font-semibold">{health.rating}</div>
              </div>
            </div>
          </div>
        </div>

        {health.issues.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Factors affecting your score:</p>
            <ul className="space-y-1">
              {health.issues.map((issue, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {health.score === 100 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-slate-700 font-medium">
              Perfect! Your portfolio is well-diversified and closely aligned with your targets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioHealthScore;
