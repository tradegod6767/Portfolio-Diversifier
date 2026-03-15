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
  const costAsPercentage = totalValue > 0 ? (totalCost / totalValue) * 100 : 0;

  const buyActions = positions.filter(p => p.action === 'BUY');

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Rebalancing Cost Estimate</h3>

      {/* Trading Costs */}
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground">Trading Costs</h4>
          <button
            onClick={() => setShowCustomFee(!showCustomFee)}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            {showCustomFee ? 'Hide' : 'Set custom fee'}
          </button>
        </div>

        {showCustomFee && (
          <div className="mb-3 p-3 bg-muted rounded-lg">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Fee per trade ($):
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={feePerTrade}
              onChange={(e) => setFeePerTrade(parseFloat(e.target.value) || 0)}
              className="w-full h-9 px-3 border border-input bg-background rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="0.00"
            />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Trades required:</span>
            <span className="font-semibold text-foreground">
              {tradesNeeded} {tradesNeeded === 1 ? 'trade' : 'trades'}
              <span className="text-muted-foreground ml-1">
                ({buyActions.length} buy{buyActions.length !== 1 ? 's' : ''}, {sellActions.length} sell{sellActions.length !== 1 ? 's' : ''})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Trading fees:</span>
            <span className="font-semibold text-foreground font-mono" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>
              {tradingCosts > 0 ? formatCurrency(tradingCosts) : '$0 (commission-free)'}
            </span>
          </div>
        </div>
      </div>

      {/* Tax Impact */}
      <div className="mb-4 pb-4 border-b border-border">
        <h4 className="text-sm font-semibold text-foreground mb-2">Tax Impact Estimate</h4>

        {sellActions.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">
              Based on selling {sellActions.length} position{sellActions.length !== 1 ? 's' : ''}:
            </div>
            {sellActions.map((position, index) => {
              const sellAmount = Math.abs(position.difference);
              const costBasis = sellAmount * 0.8;
              const gain = sellAmount - costBasis;
              return (
                <div key={index} className="text-xs bg-muted p-2 rounded-md text-foreground">
                  <span className="font-medium">{position.ticker}:</span> Sell <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatCurrency(sellAmount)}</span> → Est. gain <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatCurrency(gain)}</span>
                </div>
              );
            })}

            <div className="flex justify-between text-sm mt-3">
              <span className="text-muted-foreground">Estimated capital gains:</span>
              <span className="font-semibold text-foreground font-mono" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatCurrency(totalCapitalGains)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. taxes (15% rate):</span>
              <span className="font-semibold text-foreground font-mono" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatCurrency(estimatedTaxes)}</span>
            </div>

            <div className="mt-2 p-2 bg-muted border border-border rounded-md text-xs text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Actual taxes depend on your tax bracket, holding period (long-term vs short-term), and whether positions have gains or losses. This assumes 80% cost basis and 15% long-term capital gains rate.
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No sells required — no tax impact from rebalancing
          </div>
        )}
      </div>

      {/* Total Cost Summary */}
      <div className="bg-muted border border-border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Total Cost Summary</h4>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Trading fees:</span>
            <span className="font-semibold text-foreground font-mono" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatCurrency(tradingCosts)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated taxes:</span>
            <span className="font-semibold text-foreground font-mono" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatCurrency(estimatedTaxes)}</span>
          </div>
          <div className="flex justify-between text-base border-t border-border pt-2">
            <span className="font-bold text-foreground">Total rebalancing cost:</span>
            <span className="font-bold text-foreground font-mono" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cost as % of portfolio:</span>
            <span className={`font-bold font-mono ${costAsPercentage > 1 ? 'text-loss' : 'text-foreground'}`} style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>
              {costAsPercentage.toFixed(3)}%
            </span>
          </div>
        </div>

        {costAsPercentage > 1 && (
          <div className="mt-3 p-3 bg-loss-bg border border-loss/30 rounded-md text-sm">
            <p className="font-semibold text-loss mb-1">High rebalancing cost detected</p>
            <p className="text-loss/80">
              Consider waiting to rebalance. Costs exceeding 1% of portfolio value may outweigh the benefits of rebalancing.
            </p>
          </div>
        )}

        {costAsPercentage <= 0.5 && (
          <div className="mt-3 p-3 bg-gain-bg border border-gain/30 rounded-md text-sm">
            <p className="font-semibold text-gain mb-1">Low rebalancing cost</p>
            <p className="text-gain/80">
              Rebalancing costs are minimal relative to your portfolio size.
            </p>
          </div>
        )}

        {costAsPercentage > 0.5 && costAsPercentage <= 1 && (
          <div className="mt-3 p-3 bg-muted border border-border rounded-md text-sm">
            <p className="font-semibold text-foreground mb-1">Moderate rebalancing cost</p>
            <p className="text-muted-foreground">
              Costs are moderate. Consider if the portfolio drift justifies rebalancing now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RebalancingCostEstimate;
