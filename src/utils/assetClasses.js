/**
 * Asset Class Detection and Grouping Utilities
 */

// Mapping of tickers to asset classes
const ASSET_CLASS_MAP = {
  // US Stocks
  'VTI': 'US Stocks',
  'VOO': 'US Stocks',
  'SPY': 'US Stocks',
  'VTSAX': 'US Stocks',
  'VT': 'US Stocks',
  'VTSMX': 'US Stocks',
  'SCHB': 'US Stocks',
  'ITOT': 'US Stocks',
  'IVV': 'US Stocks',
  'VUG': 'US Stocks',
  'VTV': 'US Stocks',

  // International Stocks
  'VXUS': 'International Stocks',
  'VTIAX': 'International Stocks',
  'VEU': 'International Stocks',
  'VGTSX': 'International Stocks',
  'IXUS': 'International Stocks',
  'SCHF': 'International Stocks',
  'VWO': 'International Stocks',
  'VWILX': 'International Stocks',
  'IEMG': 'International Stocks',

  // Bonds
  'BND': 'Bonds',
  'AGG': 'Bonds',
  'VBTLX': 'Bonds',
  'VBMFX': 'Bonds',
  'BIV': 'Bonds',
  'VCIT': 'Bonds',
  'VCLT': 'Bonds',
  'TLT': 'Bonds',
  'IEF': 'Bonds',
  'SHY': 'Bonds',
  'VGIT': 'Bonds',
  'VGLT': 'Bonds',

  // Gold/Commodities
  'GLD': 'Gold/Commodities',
  'IAU': 'Gold/Commodities',
  'GLDM': 'Gold/Commodities',
  'SLV': 'Gold/Commodities',
  'DBC': 'Gold/Commodities',
  'GSG': 'Gold/Commodities',

  // Cash
  'CASH': 'Cash',
  'VMFXX': 'Cash',
  'VMMXX': 'Cash',
  'SPAXX': 'Cash',
  'FDRXX': 'Cash',

  // Real Estate
  'VNQ': 'Real Estate',
  'VGSLX': 'Real Estate',
  'REIT': 'Real Estate',
  'SCHH': 'Real Estate',
  'IYR': 'Real Estate',
};

/**
 * Get asset class for a ticker
 * @param {string} ticker - Ticker symbol
 * @returns {string} Asset class name
 */
export function getAssetClass(ticker) {
  const upperTicker = ticker.toUpperCase();
  return ASSET_CLASS_MAP[upperTicker] || 'Other';
}

/**
 * Group positions by asset class
 * @param {Array} positions - Array of position objects
 * @returns {Array} Array of grouped positions by asset class
 */
export function groupByAssetClass(positions) {
  const groups = {};

  positions.forEach(position => {
    const assetClass = getAssetClass(position.ticker);

    if (!groups[assetClass]) {
      groups[assetClass] = {
        assetClass,
        tickers: [],
        currentAmount: 0,
        currentPercent: 0,
        targetPercent: 0,
        targetAmount: 0,
        difference: 0,
        positions: []
      };
    }

    groups[assetClass].tickers.push(position.ticker);
    groups[assetClass].currentAmount += position.currentAmount;
    groups[assetClass].currentPercent += position.currentPercent;
    groups[assetClass].targetPercent += position.targetPercent;
    groups[assetClass].targetAmount += position.targetAmount;
    groups[assetClass].difference += position.difference;
    groups[assetClass].positions.push(position);
  });

  // Convert to array and calculate actions
  return Object.values(groups).map(group => ({
    ...group,
    action: group.difference > 0 ? 'BUY' : group.difference < 0 ? 'SELL' : 'HOLD',
    ticker: group.assetClass // For compatibility with existing components
  })).sort((a, b) => b.currentAmount - a.currentAmount);
}

/**
 * Get color for asset class (for charts)
 * @param {string} assetClass - Asset class name
 * @returns {string} Hex color code
 */
export function getAssetClassColor(assetClass) {
  const colors = {
    'US Stocks': '#3B82F6',        // Blue
    'International Stocks': '#8B5CF6', // Purple
    'Bonds': '#10B981',            // Green
    'Gold/Commodities': '#F59E0B', // Amber
    'Cash': '#6B7280',             // Gray
    'Real Estate': '#EF4444',      // Red
    'Other': '#EC4899'             // Pink
  };

  return colors[assetClass] || '#9CA3AF';
}

/**
 * Get all unique asset classes from positions
 * @param {Array} positions - Array of position objects
 * @returns {Array} Array of unique asset class names
 */
export function getUniqueAssetClasses(positions) {
  const classes = new Set(positions.map(p => getAssetClass(p.ticker)));
  return Array.from(classes).sort();
}
