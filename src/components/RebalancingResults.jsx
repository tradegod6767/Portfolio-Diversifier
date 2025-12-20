import { useState } from 'react';
import { formatCurrency, formatPercent } from '../utils/calculations';
import AllocationCharts from './AllocationCharts';
import ExportButtons from './ExportButtons';
import PortfolioHealthScore from './PortfolioHealthScore';
import RebalancingCostEstimate from './RebalancingCostEstimate';
import PortfolioComparison from './PortfolioComparison';
import PaywallWrapper from './PaywallWrapper';
import { groupByAssetClass } from '../utils/assetClasses';

function RebalancingResults({ results }) {
  const { totalValue, positions, aiExplanation, mode, modeData } = results;
  const [viewMode, setViewMode] = useState('tickers'); // 'tickers' or 'asset-classes'

  // Get grouped positions
  const groupedPositions = groupByAssetClass(positions);
  const displayPositions = viewMode === 'asset-classes' ? groupedPositions : positions;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Rebalancing Results
          </h2>

          {/* View By Toggle */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-1 flex shadow-sm">
            <button
              onClick={() => setViewMode('tickers')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                viewMode === 'tickers'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Individual Tickers
            </button>
            <button
              onClick={() => setViewMode('asset-classes')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                viewMode === 'asset-classes'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Asset Classes
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-slate-50 border-2 border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
          <p className="text-xl font-bold text-gray-900">
            Total Portfolio Value: {formatCurrency(totalValue)}
          </p>
        </div>

        {/* Rebalancing Mode Info */}
        {mode === 'add-only' && modeData?.totalToAdd > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border-2 border-slate-300 rounded-xl p-6 mb-6 shadow-sm">
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
          <div className="bg-gradient-to-r from-orange-50 to-slate-50 border-2 border-slate-300 rounded-xl p-6 mb-6 shadow-sm">
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
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 border-2 border-blue-300 rounded-xl p-5 mb-6 shadow-sm">
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
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border-2 border-slate-300 rounded-xl p-6 mb-6 shadow-sm">
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
                <div className="bg-white border-2 border-slate-300 rounded-lg p-3 mt-3">
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
          <div className="bg-gradient-to-r from-orange-50 to-slate-50 border-2 border-slate-300 rounded-xl p-6 mb-6 shadow-sm">
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
                <div className="bg-white border-2 border-slate-300 rounded-lg p-3 mt-3">
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
        featureName="Portfolio Health Score"
        description="Advanced portfolio risk and diversification analysis with concentration metrics"
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

      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                {viewMode === 'asset-classes' ? 'Asset Class' : 'Ticker'}
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Current Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Current %
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Target %
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayPositions.map((position, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'} style={{ transition: 'background-color 0.2s' }}>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  <div>
                    {viewMode === 'asset-classes' ? position.assetClass : position.ticker}
                  </div>
                  {viewMode === 'asset-classes' && position.tickers && (
                    <div className="text-xs text-gray-500 font-normal mt-1">
                      {position.tickers.join(', ')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatCurrency(position.currentAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatPercent(position.currentPercent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatPercent(position.targetPercent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                      position.action === 'BUY'
                        ? 'bg-slate-100 text-slate-800 border border-slate-300'
                        : position.action === 'SELL'
                        ? 'bg-slate-100 text-slate-800 border border-slate-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    {position.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                  <span
                    className={
                      position.difference > 0
                        ? 'text-slate-600'
                        : position.difference < 0
                        ? 'text-slate-600'
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

      {aiExplanation && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-50 border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Professional Analysis
          </h3>
          <div className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
            {aiExplanation}
          </div>
        </div>
      )}

      {/* Rebalancing Cost Estimate */}
      <PaywallWrapper
        featureName="Tax Impact Estimates"
        description="Detailed tax calculations and capital gains estimates for your rebalancing trades"
      >
        <RebalancingCostEstimate results={results} />
      </PaywallWrapper>

      {/* Portfolio Comparison to Models */}
      <PaywallWrapper
        featureName="Model Portfolio Comparison"
        description="Compare your portfolio to proven investment strategies like 3-Fund, 60/40, and All Weather"
      >
        <PortfolioComparison groupedPositions={groupedPositions} />
      </PaywallWrapper>

      <PaywallWrapper
        featureName="PDF Export"
        description="Export professional PDF reports with charts, analysis, and detailed rebalancing instructions"
      >
        <ExportButtons results={results} />
      </PaywallWrapper>
    </div>
  );
}

export default RebalancingResults;
