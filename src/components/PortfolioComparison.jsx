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
        <div className="bg-white p-3 border-2 border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-700">
              <span style={{ color: entry.color }} className="font-semibold">
                {entry.name}:
              </span>{' '}
              {entry.value.toFixed(1)}%
            </p>
          ))}
          {diff !== 0 && (
            <p className={`text-sm font-semibold mt-1 ${diff > 0 ? 'text-slate-600' : 'text-slate-600'}`}>
              Difference: {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            Compare to Model Portfolios
            <Tooltip text="Compare your portfolio to popular investment strategies like 3-fund portfolio, 60/40 classic, or all-weather allocation." />
          </h3>
          <p className="text-sm text-gray-600">
            See how your allocation compares to standard portfolio strategies
          </p>
        </div>

        {/* Model Portfolio Selector */}
        <div className="w-full md:w-auto">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 font-medium bg-white shadow-sm"
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
        <div className="bg-slate-100 border-2 border-slate-300 rounded-lg p-3 mb-4 flex items-start gap-2">
          <svg className="w-5 h-5 text-slate-900 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-slate-800 font-medium">
            This is your closest matching model portfolio (difference: {closestModelInfo.difference.toFixed(1)}%)
          </p>
        </div>
      )}

      {/* Bar Chart Comparison */}
      <div className="bg-white rounded-xl p-4 mb-4 border-2 border-gray-200 shadow-sm">
        <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">
          Asset Class Allocation Comparison
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="assetClass"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{ value: 'Allocation (%)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar
              dataKey="Your Portfolio"
              fill="#0f172a"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey={comparison.model.name}
              fill="#475569"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Model Portfolio Info */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-slate-300 rounded-lg p-4 mb-4">
        <h4 className="font-bold text-slate-900 mb-2">
          {comparison.model.name} - {comparison.model.description}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {Object.entries(comparison.model.allocations).map(([assetClass, percentage]) => (
            <div key={assetClass} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: getAssetClassColor(assetClass) }}
              />
              <span className="text-gray-700 font-medium">
                {assetClass}: {percentage}%
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-300">
          <span className="text-xs font-semibold text-slate-700 bg-slate-200 px-2 py-1 rounded">
            Risk Level: {comparison.model.riskLevel}
          </span>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Insights
          </h4>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-slate-600 font-bold mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Difference Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 font-semibold mb-1">Stock Allocation</div>
          <div className={`text-lg font-bold ${comparison.stocksDiff > 0 ? 'text-slate-600' : comparison.stocksDiff < 0 ? 'text-slate-600' : 'text-gray-600'}`}>
            {comparison.stocksDiff > 0 ? '+' : ''}{comparison.stocksDiff.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">vs {comparison.model.name}</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 font-semibold mb-1">Bond Allocation</div>
          <div className={`text-lg font-bold ${comparison.bondsDiff > 0 ? 'text-slate-600' : comparison.bondsDiff < 0 ? 'text-slate-600' : 'text-gray-600'}`}>
            {comparison.bondsDiff > 0 ? '+' : ''}{comparison.bondsDiff.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">vs {comparison.model.name}</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 font-semibold mb-1">Risk Level</div>
          <div className="text-lg font-bold text-slate-600">
            {comparison.model.riskLevel}
          </div>
          <div className="text-xs text-gray-500 mt-1">Target risk profile</div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioComparison;
