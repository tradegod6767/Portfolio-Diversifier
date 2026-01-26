import { useState } from 'react';
import { formatCurrency, formatPercent } from '../utils/calculations';
import AllocationCharts from './AllocationCharts';
import ExportButtons from './ExportButtons';
import PortfolioHealthScore from './PortfolioHealthScore';
import RebalancingCostEstimate from './RebalancingCostEstimate';
import PortfolioComparison from './PortfolioComparison';
import PaywallWrapper from './PaywallWrapper';
import AIAnalysisDisplay from './AIAnalysisDisplay';
import { groupByAssetClass } from '../utils/assetClasses';
import Tooltip from './Tooltip';
import './AIAnalysisDisplay.css';

function RebalancingResults({ results, user, isPro, loading }) {
  const { totalValue, positions, aiExplanation, mode, modeData, isSimulation, scenarioDescription, onApplyScenario } = results;
  const [viewMode, setViewMode] = useState('tickers'); // 'tickers' or 'asset-classes'

  // Get grouped positions
  const groupedPositions = groupByAssetClass(positions);
  const displayPositions = viewMode === 'asset-classes' ? groupedPositions : positions;

  // Calculate Impact Summary values from existing positions data
  const impactSummary = (() => {
    // Total deviation = sum of absolute differences (but divide by 2 since each dollar moved is counted twice)
    const totalDeviation = positions.reduce((sum, p) => sum + Math.abs(p.difference), 0) / 2;

    // Find largest overweight (most negative difference = needs to sell most)
    const overweightPositions = positions.filter(p => p.difference < 0);
    const largestOverweight = overweightPositions.length > 0
      ? overweightPositions.reduce((max, p) => Math.abs(p.difference) > Math.abs(max.difference) ? p : max)
      : null;

    // Find largest underweight (most positive difference = needs to buy most)
    const underweightPositions = positions.filter(p => p.difference > 0);
    const largestUnderweight = underweightPositions.length > 0
      ? underweightPositions.reduce((max, p) => p.difference > max.difference ? p : max)
      : null;

    // Count trades needed (positions with non-zero difference)
    const tradesNeeded = positions.filter(p => Math.abs(p.difference) >= 0.01).length;

    return {
      totalDeviation,
      largestOverweight,
      largestUnderweight,
      tradesNeeded
    };
  })();

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Simulation Banner */}
      {isSimulation && (
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl p-5 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-lg p-2 animate-pulse">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Simulation Mode
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium animate-pulse">
                    Not your actual portfolio
                  </span>
                </h3>
                <p className="text-teal-100 text-sm mt-1">
                  Scenario: <span className="font-semibold text-white">{scenarioDescription}</span>
                </p>
              </div>
            </div>
            {onApplyScenario && (
              <button
                onClick={onApplyScenario}
                className="flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 font-bold px-5 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply This Scenario
              </button>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isSimulation ? 'Simulated Results' : 'Rebalancing Results'}
          </h2>

          {/* View By Toggle */}
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex shadow-sm w-full md:w-auto">
            <button
              onClick={() => setViewMode('tickers')}
              className={`flex-1 md:flex-none px-3 md:px-4 py-3 md:py-2 rounded-md font-medium text-sm transition-all duration-200 min-h-[48px] md:min-h-0 ${
                viewMode === 'tickers'
                  ? 'bg-[#0A2540] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              }`}
            >
              Individual Tickers
            </button>
            <button
              onClick={() => setViewMode('asset-classes')}
              className={`flex-1 md:flex-none px-3 md:px-4 py-3 md:py-2 rounded-md font-medium text-sm transition-all duration-200 min-h-[48px] md:min-h-0 ${
                viewMode === 'asset-classes'
                  ? 'bg-[#0A2540] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              }`}
            >
              Asset Classes
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r emerald-50 border border-emerald-200 rounded-xl p-4 md:p-6 mb-6 shadow-sm">
          <p className="text-lg md:text-xl font-bold text-gray-900">
            Total Portfolio Value: {formatCurrency(totalValue)}
          </p>
        </div>

        {/* Impact Summary */}
        {impactSummary.tradesNeeded > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-blue-200 rounded-xl p-5 md:p-6 mb-6 shadow-md">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Impact Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Deviation */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total drift being corrected</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(impactSummary.totalDeviation)}
                </p>
              </div>

              {/* Number of Trades */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Trades to rebalance</p>
                <p className="text-xl font-bold text-slate-900">
                  {impactSummary.tradesNeeded} {impactSummary.tradesNeeded === 1 ? 'trade' : 'trades'}
                </p>
              </div>

              {/* Largest Overweight */}
              {impactSummary.largestOverweight && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-700 mb-1">Largest overweight position</p>
                  <p className="text-lg font-bold text-red-900">
                    {formatCurrency(Math.abs(impactSummary.largestOverweight.difference))} in {impactSummary.largestOverweight.ticker}
                  </p>
                  <p className="text-sm text-red-600">
                    {formatPercent(impactSummary.largestOverweight.currentPercent - impactSummary.largestOverweight.targetPercent)} over target
                  </p>
                </div>
              )}

              {/* Largest Underweight */}
              {impactSummary.largestUnderweight && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <p className="text-sm text-emerald-700 mb-1">Largest underweight position</p>
                  <p className="text-lg font-bold text-emerald-900">
                    {formatCurrency(impactSummary.largestUnderweight.difference)} in {impactSummary.largestUnderweight.ticker}
                  </p>
                  <p className="text-sm text-emerald-600">
                    {formatPercent(impactSummary.largestUnderweight.targetPercent - impactSummary.largestUnderweight.currentPercent)} under target
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rebalancing Mode Info */}
        {mode === 'add-only' && modeData?.totalToAdd > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-slate-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Add-Only Rebalancing
                </h3>
                <p className="text-2xl font-bold text-slate-700 mb-3">
                  Total to add: {formatCurrency(modeData.totalToAdd)}
                </p>
                <div className="space-y-1 mb-3">
                  {positions.filter(p => p.difference > 0).map((position, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      <span className="font-bold">{position.ticker}:</span> +{formatCurrency(position.difference)}
                    </div>
                  ))}
                </div>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 mt-3">
                  <p className="text-sm text-slate-800 font-medium">
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    This avoids capital gains taxes by only adding new money to under-allocated positions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'sell-only' && modeData?.totalToSell > 0 && (
          <div className="bg-gradient-to-r amber-50 border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-slate-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Sell-Only Rebalancing
                </h3>
                <p className="text-2xl font-bold text-slate-700 mb-3">
                  Total to sell: {formatCurrency(modeData.totalToSell)}
                </p>
                <div className="space-y-1 mb-3">
                  {positions.filter(p => p.difference < 0).map((position, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      <span className="font-bold">{position.ticker}:</span> {formatCurrency(Math.abs(position.difference))}
                    </div>
                  ))}
                </div>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 mt-3">
                  <p className="text-sm text-slate-800 font-medium">
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    This will increase drift in other positions. Useful for taking distributions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'standard' && (
          <div className="bg-gradient-to-r slate-50 border border-[#0A2540] rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <p className="text-sm font-bold text-blue-900">
                Standard Rebalancing: Buy and sell positions to match target allocations
              </p>
            </div>
          </div>
        )}

        {mode === 'contribution' && modeData?.contributionAmount > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-slate-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Contribution Plan
                </h3>
                <p className="text-2xl font-bold text-slate-700 mb-3">
                  Invest {formatCurrency(modeData.contributionAmount)}
                </p>
                <div className="space-y-1 mb-3">
                  {positions.filter(p => p.difference > 0).map((position, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      <span className="font-bold">{position.ticker}:</span> {formatCurrency(position.difference)}
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-slate-800 font-medium mb-1">
                    This allocation moves you toward your target percentages while avoiding taxes
                  </p>
                  <p className="text-xs text-slate-700">
                    New portfolio value: {formatCurrency(modeData.newTotalValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'withdrawal' && modeData?.withdrawalAmount > 0 && (
          <div className="bg-gradient-to-r amber-50 border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-slate-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Withdrawal Plan
                </h3>
                <p className="text-2xl font-bold text-slate-700 mb-3">
                  Withdraw {formatCurrency(modeData.withdrawalAmount)}
                </p>
                <div className="space-y-1 mb-3">
                  {positions.filter(p => p.difference < 0).map((position, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      <span className="font-bold">{position.ticker}:</span> Sell {formatCurrency(Math.abs(position.difference))}
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-slate-800 font-medium mb-1">
                    This withdrawal strategy minimizes drift from your target allocations
                  </p>
                  <p className="text-xs text-slate-700 mb-1">
                    New portfolio value: {formatCurrency(modeData.newTotalValue)}
                  </p>
                  <p className="text-xs text-slate-700">
                    Consider tax implications on sales
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Health Score and Drift */}
      <PaywallWrapper
        user={user}
        isPro={isPro}
        loading={loading}
        featureName="Portfolio Health Score"
        description="Risk score based on diversification, asset concentration, and sector exposure. See if you're properly balanced across asset classes."
      >
        <PortfolioHealthScore positions={positions} />
      </PaywallWrapper>

      {/* Pie Charts */}
      <div data-charts>
        <AllocationCharts
          positions={positions}
          viewMode={viewMode}
          groupedPositions={groupedPositions}
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-200 -mx-4 md:mx-0">
        <div className="min-w-[640px]">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {viewMode === 'asset-classes' ? 'Asset Class' : 'Ticker'}
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Current %
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Target %
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {displayPositions.map((position, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'} style={{ transition: 'background-color 0.2s' }}>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm font-bold text-gray-900">
                    <div>
                      {viewMode === 'asset-classes' ? position.assetClass : position.ticker}
                    </div>
                    {viewMode === 'asset-classes' && position.tickers && (
                      <div className="text-xs text-gray-500 font-normal mt-1">
                        {position.tickers.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatCurrency(position.currentAmount)}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatPercent(position.currentPercent)}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatPercent(position.targetPercent)}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span
                      className={`px-2 md:px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                        position.action === 'BUY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : position.action === 'SELL'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}
                    >
                      {position.action}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-bold">
                    <span
                      className={
                        position.difference > 0
                          ? 'text-emerald-600 font-mono'
                          : position.difference < 0
                          ? 'text-emerald-600 font-mono'
                          : 'text-gray-600'
                      }
                    >
                      {position.difference > 0 ? '+' : ''}
                      {formatCurrency(Math.abs(position.difference))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {aiExplanation && (
        <AIAnalysisDisplay
          content={aiExplanation}
          isPro={isPro}
          user={user}
        />
      )}

      {/* Rebalancing Cost Estimate */}
      <PaywallWrapper
        user={user}
        isPro={isPro}
        loading={loading}
        featureName="Tax Impact Estimates"
        description="Estimated capital gains if you rebalance today. See your tax bill before you trade so you can plan accordingly."
      >
        <RebalancingCostEstimate results={results} />
      </PaywallWrapper>

      {/* Portfolio Comparison to Models */}
      <PaywallWrapper
        user={user}
        isPro={isPro}
        loading={loading}
        featureName="Model Portfolio Comparison"
        description="Compare your allocation to proven strategies like the classic 60/40, 3-Fund Portfolio, and All Weather. See how you stack up."
      >
        <PortfolioComparison groupedPositions={groupedPositions} />
      </PaywallWrapper>

      <PaywallWrapper
        user={user}
        isPro={isPro}
        loading={loading}
        featureName="PDF Export"
        description="Professional report with all your charts, trade instructions, and analysis in one shareable PDF. Perfect for advisors or record-keeping."
      >
        <ExportButtons results={results} isPro={isPro} userEmail={user?.email} />
      </PaywallWrapper>
    </div>
  );
}

export default RebalancingResults;
