import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { MODEL_PORTFOLIOS, compareToModel, generateSuggestions, findClosestModel } from '../utils/modelPortfolios';
import { getAssetClassColor } from '../utils/assetClasses';
import Tooltip from './Tooltip';

// Abbreviate long asset class names for chart
const abbreviateAssetClass = (name) => {
  const abbreviations = {
    'US Stocks': 'US Stocks',
    'International Stocks': 'Intl Stocks',
    'Emerging Markets': 'Emerging',
    'Bonds': 'Bonds',
    'Gold/Commodities': 'Gold/Comm',
    'Cash': 'Cash',
    'Real Estate': 'Real Estate',
    'Other': 'Other'
  };
  return abbreviations[name] || name;
};

// Risk level badge colors
const getRiskBadgeColor = (riskLevel) => {
  switch (riskLevel) {
    case 'Conservative': return 'green';
    case 'Moderate': return 'yellow';
    case 'Aggressive': return 'red';
    default: return 'slate';
  }
};

// Custom label renderer for bars (declared outside component to avoid re-creation)
const renderBarLabel = (props) => {
  const { x, y, width, value } = props;
  if (value < 3) return null; // Don't show labels for very small values
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#94A3B8"
      textAnchor="middle"
      fontSize={10}
      fontWeight={500}
    >
      {value.toFixed(0)}%
    </text>
  );
};

// Custom tooltip for chart (declared outside component to avoid re-creation)
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const fullName = payload[0]?.payload?.fullName || label;
    const diff = payload[0]?.payload?.difference;
    return (
      <div className="bg-slate-800 p-3 border border-slate-700 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-100 mb-2">{fullName}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-slate-300">
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.name}:
            </span>{' '}
            {entry.value.toFixed(1)}%
          </p>
        ))}
        {diff !== 0 && (
          <p className={`text-sm font-semibold mt-2 pt-2 border-t border-slate-700 ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            Difference: {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
}

function PortfolioComparison({ groupedPositions }) {
  // Find closest model automatically
  const closestModelInfo = findClosestModel(groupedPositions);
  const [selectedModel, setSelectedModel] = useState(closestModelInfo?.key || '60-40-classic');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const comparison = compareToModel(groupedPositions, selectedModel);
  const suggestions = generateSuggestions(comparison);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!comparison) return null;

  // Prepare data for bar chart with abbreviated names
  const chartData = comparison.allAssetClasses.map(assetClass => ({
    assetClass: abbreviateAssetClass(assetClass),
    fullName: assetClass,
    'Your Portfolio': comparison.userAllocations[assetClass] || 0,
    [comparison.model.name]: comparison.modelAllocations[assetClass] || 0,
    difference: comparison.differences[assetClass] || 0
  }));

  const selectedModelData = MODEL_PORTFOLIOS[selectedModel];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                Compare to Model Portfolios
                <Tooltip text="Compare your portfolio to popular investment strategies like 3-fund portfolio, 60/40 classic, or all-weather allocation." />
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                See how your allocation compares to proven investment strategies
              </p>
            </div>
          </div>

          {/* Custom Dropdown */}
          <div className="relative w-full lg:w-72" ref={dropdownRef}>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
              Model Portfolio
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                relative w-full px-4 py-3
                bg-slate-900 border-2 rounded-lg
                text-left
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-800
                ${isDropdownOpen
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-700 hover:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20'
                }
              `}
            >
              <span className="block font-medium text-slate-100 truncate">
                {selectedModelData.name}
              </span>
              <span className={`
                inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full
                ${getRiskBadgeColor(selectedModelData.riskLevel) === 'green' ? 'bg-emerald-900/50 text-emerald-400' :
                  getRiskBadgeColor(selectedModelData.riskLevel) === 'yellow' ? 'bg-amber-900/50 text-amber-400' :
                  getRiskBadgeColor(selectedModelData.riskLevel) === 'red' ? 'bg-red-900/50 text-red-400' :
                  'bg-slate-700 text-slate-400'}
              `}>
                {selectedModelData.riskLevel}
              </span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full max-h-72 overflow-auto rounded-lg bg-slate-800 border border-slate-700 shadow-xl animate-fade-in">
                {Object.entries(MODEL_PORTFOLIOS).map(([key, model]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedModel(key);
                      setIsDropdownOpen(false);
                    }}
                    className={`
                      relative w-full px-4 py-3 text-left
                      transition-colors duration-150
                      hover:bg-slate-700
                      focus:outline-none focus:bg-slate-700
                      ${key === selectedModel ? 'bg-indigo-900/30 border-l-2 border-l-indigo-500' : ''}
                      ${key !== Object.keys(MODEL_PORTFOLIOS)[Object.keys(MODEL_PORTFOLIOS).length - 1] ? 'border-b border-slate-700' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`block font-medium ${key === selectedModel ? 'text-indigo-400' : 'text-slate-100'}`}>
                          {model.name}
                        </span>
                        <span className="block text-xs text-slate-400 mt-0.5">
                          {model.description}
                        </span>
                        <span className={`
                          inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full
                          ${getRiskBadgeColor(model.riskLevel) === 'green' ? 'bg-emerald-900/50 text-emerald-400' :
                            getRiskBadgeColor(model.riskLevel) === 'yellow' ? 'bg-amber-900/50 text-amber-400' :
                            getRiskBadgeColor(model.riskLevel) === 'red' ? 'bg-red-900/50 text-red-400' :
                            'bg-slate-700 text-slate-400'}
                        `}>
                          {model.riskLevel}
                        </span>
                      </div>

                      {key === selectedModel && (
                        <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Closest Match Banner */}
      {closestModelInfo && closestModelInfo.key === selectedModel && (
        <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-800 rounded-lg">
          <div className="p-1.5 bg-emerald-800 rounded-full">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-300">
              Best Match for Your Portfolio
            </p>
            <p className="text-xs text-emerald-500">
              Only {closestModelInfo.difference.toFixed(1)}% difference from this model
            </p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="p-6">
        <div className="bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-400 mb-4 text-center uppercase tracking-wide">
            Asset Class Allocation Comparison
          </h4>

          <div className="w-full" style={{ minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                margin={{ top: 25, right: 20, left: 0, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="assetClass"
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                  width={45}
                />
                <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-sm text-slate-400 ml-1">{value}</span>}
                />
                <Bar
                  dataKey="Your Portfolio"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  <LabelList dataKey="Your Portfolio" content={renderBarLabel} />
                </Bar>
                <Bar
                  dataKey={comparison.model.name}
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  <LabelList dataKey={comparison.model.name} content={renderBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Info & Suggestions Grid */}
      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model Portfolio Details */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              Model Breakdown
            </h4>
          </div>

          <p className="text-sm text-slate-400 mb-3">
            {comparison.model.description}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(comparison.model.allocations).map(([assetClass, percentage]) => (
              <div key={assetClass} className="flex items-center gap-2 text-sm">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getAssetClassColor(assetClass) }}
                />
                <span className="text-slate-400 truncate">{assetClass}</span>
                <span className="font-semibold text-slate-100 ml-auto">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        {suggestions.length > 0 && (
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl p-4 border border-amber-800/50">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                Key Insights
              </h4>
            </div>

            <ul className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-amber-200">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Difference Summary Cards */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 text-center hover:bg-slate-800/80 transition-colors">
            <div className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Stocks</div>
            <div className={`text-xl font-bold ${comparison.stocksDiff > 0 ? 'text-emerald-400' : comparison.stocksDiff < 0 ? 'text-red-400' : 'text-slate-100'}`}>
              {comparison.stocksDiff > 0 ? '+' : ''}{comparison.stocksDiff.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">vs model</div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 text-center hover:bg-slate-800/80 transition-colors">
            <div className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Bonds</div>
            <div className={`text-xl font-bold ${comparison.bondsDiff > 0 ? 'text-emerald-400' : comparison.bondsDiff < 0 ? 'text-red-400' : 'text-slate-100'}`}>
              {comparison.bondsDiff > 0 ? '+' : ''}{comparison.bondsDiff.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">vs model</div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 text-center hover:bg-slate-800/80 transition-colors">
            <div className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Risk</div>
            <div className={`text-lg font-bold ${
              comparison.model.riskLevel === 'Conservative' ? 'text-emerald-400' :
              comparison.model.riskLevel === 'Aggressive' ? 'text-red-400' :
              'text-amber-400'
            }`}>
              {comparison.model.riskLevel}
            </div>
            <div className="text-xs text-slate-500 mt-1">target level</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioComparison;
