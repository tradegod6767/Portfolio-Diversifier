import { useState } from 'react';
import { formatCurrency } from '../utils/calculations';

function RebalancingCostEstimate({ results }) {
  const [feePerTrade, setFeePerTrade] = useState(0);
  const [showCustomFee, setShowCustomFee] = useState(false);

  const { positions, totalValue } = results;

  // Calculate trading costs
  const tradesNeeded = positions.filter(p => Math.abs(p.difference) > 0.01).length;
  const tradingCosts = tradesNeeded * feePerTrade;

  // Calculate tax impact (only on SELL actions)
  const sellActions = positions.filter(p => p.action === 'SELL');
  let totalCapitalGains = 0;

  sellActions.forEach(position => {
    const sellAmount = Math.abs(position.difference);
    const costBasis = sellAmount * 0.8; // Conservative estimate: cost basis is 80% of sale
    const capitalGain = sellAmount - costBasis;
    totalCapitalGains += capitalGain;
  });

  // Estimate taxes (assume 15% capital gains rate for long-term)
  const estimatedTaxes = totalCapitalGains * 0.15;

  // Total cost
  const totalCost = tradingCosts + estimatedTaxes;
  const costAsPercentage = (totalCost / totalValue) * 100;

  const buyActions = positions.filter(p => p.action === 'BUY');

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Rebalancing Cost Estimate</h3>

      {/* Trading Costs */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-semibold text-gray-800">Trading Costs</h4>
          <button
            onClick={() => setShowCustomFee(!showCustomFee)}
            className="text-xs text-slate-900 hover:text-slate-800 underline"
          >
            {showCustomFee ? 'Hide' : 'Set custom fee'}
          </button>
        </div>

        {showCustomFee && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee per trade ($):
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={feePerTrade}
              onChange={(e) => setFeePerTrade(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="0.00"
            />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Trades required:</span>
            <span className="font-semibold text-gray-900">
              {tradesNeeded} {tradesNeeded === 1 ? 'trade' : 'trades'}
              <span className="text-gray-500 ml-1">
                ({buyActions.length} buy{buyActions.length !== 1 ? 's' : ''}, {sellActions.length} sell{sellActions.length !== 1 ? 's' : ''})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Trading fees:</span>
            <span className="font-semibold text-gray-900">
              {tradingCosts > 0 ? formatCurrency(tradingCosts) : '$0 (commission-free)'}
            </span>
          </div>
        </div>
      </div>

      {/* Tax Impact */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h4 className="text-base font-semibold text-gray-800 mb-2">Tax Impact Estimate</h4>

        {sellActions.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 mb-2">
              Based on selling {sellActions.length} position{sellActions.length !== 1 ? 's' : ''}:
            </div>
            {sellActions.map((position, index) => {
              const sellAmount = Math.abs(position.difference);
              const costBasis = sellAmount * 0.8;
              const gain = sellAmount - costBasis;
              return (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  <span className="font-medium">{position.ticker}:</span> Sell {formatCurrency(sellAmount)} → Est. gain {formatCurrency(gain)}
                </div>
              );
            })}

            <div className="flex justify-between text-sm mt-3">
              <span className="text-gray-600">Estimated capital gains:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalCapitalGains)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Est. taxes (15% rate):</span>
              <span className="font-semibold text-slate-600">{formatCurrency(estimatedTaxes)}</span>
            </div>

            <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800">
              <strong>Note:</strong> Actual taxes depend on your tax bracket, holding period (long-term vs short-term), and whether positions have gains or losses. This assumes 80% cost basis and 15% long-term capital gains rate.
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            No sells required - no tax impact from rebalancing
          </div>
        )}
      </div>

      {/* Total Cost Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
        <h4 className="text-base font-bold text-gray-900 mb-3">Total Cost Summary</h4>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Trading fees:</span>
            <span className="font-semibold">{formatCurrency(tradingCosts)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Estimated taxes:</span>
            <span className="font-semibold">{formatCurrency(estimatedTaxes)}</span>
          </div>
          <div className="flex justify-between text-base border-t-2 border-gray-300 pt-2">
            <span className="font-bold text-gray-900">Total rebalancing cost:</span>
            <span className="font-bold text-gray-900">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cost as % of portfolio:</span>
            <span className={`font-bold ${costAsPercentage > 1 ? 'text-slate-600' : 'text-slate-600'}`}>
              {costAsPercentage.toFixed(3)}%
            </span>
          </div>
        </div>

        {costAsPercentage > 1 && (
          <div className="mt-3 p-3 bg-slate-50 border-l-4 border-slate-500 text-sm">
            <p className="font-semibold text-slate-800 mb-1">⚠️ High rebalancing cost detected</p>
            <p className="text-slate-700">
              Consider waiting to rebalance. Costs exceeding 1% of portfolio value may outweigh the benefits of rebalancing.
            </p>
          </div>
        )}

        {costAsPercentage <= 0.5 && (
          <div className="mt-3 p-3 bg-slate-50 border-l-4 border-slate-500 text-sm">
            <p className="font-semibold text-slate-800 mb-1">✓ Low rebalancing cost</p>
            <p className="text-slate-700">
              Rebalancing costs are minimal relative to your portfolio size.
            </p>
          </div>
        )}

        {costAsPercentage > 0.5 && costAsPercentage <= 1 && (
          <div className="mt-3 p-3 bg-slate-50 border-l-4 border-slate-500 text-sm">
            <p className="font-semibold text-slate-800 mb-1">⚡ Moderate rebalancing cost</p>
            <p className="text-slate-700">
              Costs are moderate. Consider if the portfolio drift justifies rebalancing now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RebalancingCostEstimate;
