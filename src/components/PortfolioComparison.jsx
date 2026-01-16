import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MODEL_PORTFOLIOS, compareToModel, generateSuggestions, findClosestModel } from '../utils/modelPortfolios';
import { getAssetClassColor } from '../utils/assetClasses';
import Tooltip from './Tooltip';

function PortfolioComparison({ groupedPositions }) {
  // Find closest model automatically
  const closestModelInfo = findClosestModel(groupedPositions);
  const [selectedModel, setSelectedModel] = useState(closestModelInfo?.key || '60-40-classic');

  const comparison = compareToModel(groupedPositions, selectedModel);
  const suggestions = generateSuggestions(comparison);

  if (!comparison) return null;

  // Prepare data for bar chart
  const chartData = comparison.allAssetClasses.map(assetClass => ({
    assetClass,
    'Your Portfolio': comparison.userAllocations[assetClass] || 0,
    [comparison.model.name]: comparison.modelAllocations[assetClass] || 0,
    difference: comparison.differences[assetClass] || 0
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const diff = payload[0].payload.difference;
      return (
        <div className="p-3 border-2 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)' }}>
          <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: entry.color }} className="font-semibold">
                {entry.name}:
              </span>{' '}
              {entry.value.toFixed(1)}%
            </p>
          ))}
          {diff !== 0 && (
            <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>
              Difference: {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border-2 rounded-xl p-6 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-2 flex items-center" style={{ color: 'var(--text-primary)' }}>
            Compare to Model Portfolios
            <Tooltip text="Compare your portfolio to popular investment strategies like 3-fund portfolio, 60/40 classic, or all-weather allocation." />
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            See how your allocation compares to standard portfolio strategies
          </p>
        </div>

        {/* Model Portfolio Selector */}
        <div className="w-full md:w-auto">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            Select Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-slate-500 font-medium shadow-sm"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            {Object.entries(MODEL_PORTFOLIOS).map(([key, model]) => (
              <option key={key} value={key}>
                {model.name} ({model.riskLevel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Show if this is the closest match */}
      {closestModelInfo && closestModelInfo.key === selectedModel && (
        <div className="border-2 rounded-lg p-3 mb-4 flex items-start gap-2" style={{ backgroundColor: 'var(--info-bg)', borderColor: 'var(--info-border)' }}>
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--info)' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            This is your closest matching model portfolio (difference: {closestModelInfo.difference.toFixed(1)}%)
          </p>
        </div>
      )}

      {/* Bar Chart Comparison */}
      <div className="rounded-xl p-4 mb-4 border-2 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h4 className="text-base md:text-lg font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
          Asset Class Allocation Comparison
        </h4>
        {/* Chart container with explicit height for mobile */}
        <div className="w-full overflow-x-auto" style={{ minHeight: '400px' }}>
          <div style={{ minWidth: '300px', height: '400px' }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="assetClass"
                  tick={{ fontSize: 11, fill: 'var(--chart-text)' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{ value: 'Allocation (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--chart-text)' } }}
                  tick={{ fontSize: 11, fill: 'var(--chart-text)' }}
                  width={60}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  iconType="rect"
                />
                <Bar
                  dataKey="Your Portfolio"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey={comparison.model.name}
                  fill="#64748B"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Portfolio Info */}
      <div className="border-2 rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-color)' }}>
        <h4 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {comparison.model.name} - {comparison.model.description}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {Object.entries(comparison.model.allocations).map(([assetClass, percentage]) => (
            <div key={assetClass} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: getAssetClassColor(assetClass) }}
              />
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                {assetClass}: {percentage}%
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            Risk Level: {comparison.model.riskLevel}
          </span>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-2 rounded-lg p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Insights
          </h4>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-bold mt-0.5" style={{ color: 'var(--text-muted)' }}>•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Difference Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="border-2 rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Stock Allocation</div>
          <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {comparison.stocksDiff > 0 ? '+' : ''}{comparison.stocksDiff.toFixed(1)}%
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>vs {comparison.model.name}</div>
        </div>

        <div className="border-2 rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Bond Allocation</div>
          <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {comparison.bondsDiff > 0 ? '+' : ''}{comparison.bondsDiff.toFixed(1)}%
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>vs {comparison.model.name}</div>
        </div>

        <div className="border-2 rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Risk Level</div>
          <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {comparison.model.riskLevel}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Target risk profile</div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioComparison;
