import { useState } from 'react';
import { formatCurrency, estimateTaxImpact } from '../utils/calculations';

function RebalancingCostEstimate({ results }) {
  const [feePerTrade, setFeePerTrade] = useState(0);
  const [showCustomFee, setShowCustomFee] = useState(false);

  const { positions, totalValue } = results;

  // Calculate trading costs
  const tradesNeeded = positions.filter((p) => Math.abs(p.difference) > 0.01).length;
  const tradingCosts = tradesNeeded * feePerTrade;

  // Tax impact (only on SELL actions) — real gains where the user entered a
  // cost basis, assumed 80% basis otherwise
  const sellActions = positions.filter((p) => p.action === 'SELL');
  const {
    sellEstimates,
    totalCapitalGains,
    estimatedTaxes,
    undeterminedGains,
    hasAssumedPositions,
    hasUndeterminedHolding,
  } = estimateTaxImpact(positions);

  // Total cost
  const totalCost = tradingCosts + estimatedTaxes;
  const costAsPercentage = totalValue > 0 ? (totalCost / totalValue) * 100 : 0;

  const buyActions = positions.filter((p) => p.action === 'BUY');

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
                ({buyActions.length} buy{buyActions.length !== 1 ? 's' : ''}, {sellActions.length}{' '}
                sell{sellActions.length !== 1 ? 's' : ''})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Trading fees:</span>
            <span
              className="font-semibold text-foreground font-mono"
              style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
            >
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
            {sellEstimates.map((estimate, index) => (
              <div
                key={index}
                className="text-xs bg-muted p-2 rounded-md text-foreground flex items-center justify-between gap-2"
              >
                <span>
                  <span className="font-medium">{estimate.ticker}:</span> Sell{' '}
                  <span
                    className="font-mono"
                    style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
                  >
                    {formatCurrency(estimate.sellAmount)}
                  </span>{' '}
                  → {estimate.gain < 0 ? 'Loss' : 'Gain'}{' '}
                  <span
                    className={`font-mono ${estimate.gain < 0 ? 'text-loss' : ''}`}
                    style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
                  >
                    {formatCurrency(estimate.gain)}
                  </span>
                </span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  {estimate.holdingPeriod === 'long' && (
                    <span
                      className="px-1.5 py-0.5 rounded-md bg-card border border-border text-muted-foreground font-medium"
                      title="Held over 1 year. Estimated at an assumed 15% long-term rate (actual long-term rate is 0/15/20% depending on income)."
                    >
                      long-term · 15% (assumed)
                    </span>
                  )}
                  {estimate.holdingPeriod === 'short' && (
                    <span
                      className="px-1.5 py-0.5 rounded-md bg-card border border-border text-muted-foreground font-medium"
                      title="Held 1 year or less — likely taxed as ordinary income (rate varies by bracket, typically higher than long-term rates). Shown using a conservative 24% estimate."
                    >
                      short-term · ~24% (est.)
                    </span>
                  )}
                  {!estimate.holdingPeriod && (
                    <span
                      className="px-1.5 py-0.5 rounded-md bg-card border border-border text-muted-foreground font-medium"
                      title="No purchase date on file — holding period is unknown, so the tax treatment (and therefore the rate) can't be determined. Add a purchase date in the portfolio form."
                    >
                      holding period unknown
                    </span>
                  )}
                  {estimate.hasRealBasis ? (
                    <span
                      className="px-1.5 py-0.5 rounded-md bg-card border border-border text-muted-foreground font-medium"
                      title="Calculated from the cost basis you entered for this position."
                    >
                      exact
                    </span>
                  ) : (
                    <span
                      className="px-1.5 py-0.5 rounded-md bg-card border border-border text-muted-foreground font-medium"
                      title="No cost basis on file — assumes cost basis is 80% of the sale amount. Add what you paid in the portfolio form for an exact figure."
                    >
                      estimated
                    </span>
                  )}
                </span>
              </div>
            ))}

            <div className="flex justify-between text-sm mt-3">
              <span className="text-muted-foreground">
                {hasAssumedPositions
                  ? 'Estimated capital gains:'
                  : 'Capital gains (from your cost basis):'}
              </span>
              <span
                className={`font-semibold font-mono ${totalCapitalGains < 0 ? 'text-loss' : 'text-foreground'}`}
                style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
              >
                {formatCurrency(totalCapitalGains)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Est. taxes{hasUndeterminedHolding ? ' (determinable positions)' : ''}:
              </span>
              <span
                className="font-semibold text-foreground font-mono"
                style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
              >
                {formatCurrency(estimatedTaxes)}
              </span>
            </div>
            {hasUndeterminedHolding && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gains with unknown holding period:</span>
                <span
                  className="font-semibold text-foreground font-mono"
                  style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
                >
                  {formatCurrency(undeterminedGains)} · rate TBD
                </span>
              </div>
            )}

            <div className="mt-2 p-2 bg-muted border border-border rounded-md text-xs text-muted-foreground space-y-1.5">
              <p>
                <strong className="text-foreground">How the rate is applied:</strong> Long-term
                positions (held over 1 year) use an <em>assumed</em> 15% rate — an assumption, not a
                calculated figure. Short-term positions (held 1 year or less) are likely taxed as
                ordinary income (rate varies by bracket, typically higher than long-term rates);
                they use a conservative 24% estimate.{' '}
                {hasUndeterminedHolding
                  ? 'Positions with no purchase date have an unknown holding period, so their tax treatment and rate can’t be determined — those gains are shown separately and excluded from the tax total above.'
                  : 'Add a purchase date per position to classify its holding period.'}
              </p>
              <p>
                <strong className="text-foreground">This estimate is federal-only.</strong> It does
                not include state capital gains tax and does not account for the Net Investment
                Income Tax (NIIT, an extra 3.8% for higher earners). It is for planning purposes
                only and is not a substitute for advice from a tax professional.
              </p>
              <p>
                {hasAssumedPositions
                  ? 'Positions marked "estimated" have no cost basis on file, so their gain assumes an 80% cost basis. Add what you paid (and when) in the portfolio form to make those figures exact.'
                  : 'Gains are calculated from the cost basis you entered, prorated for partial sales.'}
              </p>
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
            <span
              className="font-semibold text-foreground font-mono"
              style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
            >
              {formatCurrency(tradingCosts)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated taxes:</span>
            <span
              className="font-semibold text-foreground font-mono"
              style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
            >
              {formatCurrency(estimatedTaxes)}
            </span>
          </div>
          <div className="flex justify-between text-base border-t border-border pt-2">
            <span className="font-bold text-foreground">Total rebalancing cost:</span>
            <span
              className="font-bold text-foreground font-mono"
              style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
            >
              {formatCurrency(totalCost)}
            </span>
          </div>
          {hasUndeterminedHolding && (
            <p className="text-xs text-muted-foreground">
              Excludes {formatCurrency(undeterminedGains)} of gains whose holding period is unknown
              — actual taxes will be higher once those are classified.
            </p>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cost as % of portfolio:</span>
            <span
              className={`font-bold font-mono ${costAsPercentage > 1 ? 'text-loss' : 'text-foreground'}`}
              style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
            >
              {costAsPercentage.toFixed(3)}%
            </span>
          </div>
        </div>

        {costAsPercentage > 1 && (
          <div className="mt-3 p-3 bg-loss-bg border border-loss/30 rounded-md text-sm">
            <p className="font-semibold text-loss mb-1">High rebalancing cost detected</p>
            <p className="text-loss/80">
              Consider waiting to rebalance. Costs exceeding 1% of portfolio value may outweigh the
              benefits of rebalancing.
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
