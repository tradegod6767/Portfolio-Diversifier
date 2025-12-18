/**
 * Model Portfolio Definitions and Comparison Utilities
 */

// Define standard model portfolios
export const MODEL_PORTFOLIOS = {
  '60-40-classic': {
    name: '60/40 Classic',
    description: 'Traditional balanced portfolio',
    allocations: {
      'US Stocks': 60,
      'Bonds': 40
    },
    riskLevel: 'Moderate'
  },
  'three-fund': {
    name: 'Three-Fund Portfolio',
    description: 'Diversified global portfolio',
    allocations: {
      'US Stocks': 60,
      'International Stocks': 30,
      'Bonds': 10
    },
    riskLevel: 'Moderate'
  },
  'aggressive-growth': {
    name: 'Aggressive Growth',
    description: 'High equity allocation',
    allocations: {
      'US Stocks': 60,
      'International Stocks': 20,
      'Bonds': 20
    },
    riskLevel: 'Aggressive'
  },
  'conservative': {
    name: 'Conservative',
    description: 'Low risk, income focused',
    allocations: {
      'US Stocks': 25,
      'International Stocks': 15,
      'Bonds': 60
    },
    riskLevel: 'Conservative'
  },
  'moderate': {
    name: 'Moderate',
    description: 'Balanced growth and income',
    allocations: {
      'US Stocks': 42,
      'International Stocks': 18,
      'Bonds': 40
    },
    riskLevel: 'Moderate'
  }
};

/**
 * Calculate portfolio's asset class allocation percentages
 * @param {Array} groupedPositions - Positions grouped by asset class
 * @returns {Object} Asset class allocations as percentages
 */
export function calculateAssetClassAllocations(groupedPositions) {
  const allocations = {};
  groupedPositions.forEach(pos => {
    allocations[pos.assetClass] = pos.currentPercent;
  });
  return allocations;
}

/**
 * Calculate total stocks percentage (US + International)
 * @param {Object} allocations - Asset class allocations
 * @returns {number} Total stock percentage
 */
export function calculateTotalStocks(allocations) {
  const usStocks = allocations['US Stocks'] || 0;
  const intlStocks = allocations['International Stocks'] || 0;
  return usStocks + intlStocks;
}

/**
 * Calculate total bonds percentage
 * @param {Object} allocations - Asset class allocations
 * @returns {number} Total bond percentage
 */
export function calculateTotalBonds(allocations) {
  return allocations['Bonds'] || 0;
}

/**
 * Compare user portfolio to a model portfolio
 * @param {Array} groupedPositions - User's positions grouped by asset class
 * @param {string} modelKey - Key of model portfolio to compare against
 * @returns {Object} Comparison data
 */
export function compareToModel(groupedPositions, modelKey) {
  const model = MODEL_PORTFOLIOS[modelKey];
  if (!model) return null;

  const userAllocations = calculateAssetClassAllocations(groupedPositions);
  const modelAllocations = model.allocations;

  // Calculate differences
  const differences = {};
  const allAssetClasses = new Set([
    ...Object.keys(userAllocations),
    ...Object.keys(modelAllocations)
  ]);

  allAssetClasses.forEach(assetClass => {
    const userAlloc = userAllocations[assetClass] || 0;
    const modelAlloc = modelAllocations[assetClass] || 0;
    differences[assetClass] = userAlloc - modelAlloc;
  });

  // Calculate stock/bond comparison
  const userStocks = calculateTotalStocks(userAllocations);
  const modelStocks = calculateTotalStocks(modelAllocations);
  const stocksDiff = userStocks - modelStocks;

  const userBonds = calculateTotalBonds(userAllocations);
  const modelBonds = calculateTotalBonds(modelAllocations);
  const bondsDiff = userBonds - modelBonds;

  return {
    model,
    userAllocations,
    modelAllocations,
    differences,
    stocksDiff,
    bondsDiff,
    allAssetClasses: Array.from(allAssetClasses)
  };
}

/**
 * Generate suggestions based on comparison
 * @param {Object} comparison - Comparison data from compareToModel
 * @returns {Array} Array of suggestion strings
 */
export function generateSuggestions(comparison) {
  if (!comparison) return [];

  const suggestions = [];
  const { stocksDiff, bondsDiff, differences, model } = comparison;

  // Overall aggressiveness comparison
  if (Math.abs(stocksDiff) > 5) {
    if (stocksDiff > 0) {
      suggestions.push(
        `Your portfolio is ${Math.abs(stocksDiff).toFixed(1)}% more aggressive than ${model.name} (higher stock allocation)`
      );
    } else {
      suggestions.push(
        `Your portfolio is ${Math.abs(stocksDiff).toFixed(1)}% more conservative than ${model.name} (lower stock allocation)`
      );
    }
  }

  // Specific asset class differences
  Object.entries(differences).forEach(([assetClass, diff]) => {
    if (Math.abs(diff) > 10) {
      if (diff > 0) {
        suggestions.push(
          `You're overweight ${assetClass} by ${Math.abs(diff).toFixed(1)}% compared to ${model.name}`
        );
      } else {
        suggestions.push(
          `You're underweight ${assetClass} by ${Math.abs(diff).toFixed(1)}% compared to ${model.name}`
        );
      }
    }
  });

  // Bond allocation comparison
  if (Math.abs(bondsDiff) > 10) {
    if (bondsDiff > 0) {
      suggestions.push(
        `You have ${Math.abs(bondsDiff).toFixed(1)}% more bonds than ${model.name}, providing more stability but potentially lower returns`
      );
    } else {
      suggestions.push(
        `You have ${Math.abs(bondsDiff).toFixed(1)}% fewer bonds than ${model.name}, increasing growth potential but also volatility`
      );
    }
  }

  // If very similar
  if (suggestions.length === 0) {
    suggestions.push(`Your portfolio closely matches the ${model.name} allocation`);
  }

  return suggestions;
}

/**
 * Find the closest matching model portfolio
 * @param {Array} groupedPositions - User's positions grouped by asset class
 * @returns {Object} Closest model info
 */
export function findClosestModel(groupedPositions) {
  const userAllocations = calculateAssetClassAllocations(groupedPositions);
  let closestModel = null;
  let smallestDifference = Infinity;

  Object.keys(MODEL_PORTFOLIOS).forEach(modelKey => {
    const comparison = compareToModel(groupedPositions, modelKey);
    if (!comparison) return;

    // Calculate total absolute difference
    const totalDiff = Object.values(comparison.differences).reduce(
      (sum, diff) => sum + Math.abs(diff),
      0
    );

    if (totalDiff < smallestDifference) {
      smallestDifference = totalDiff;
      closestModel = {
        key: modelKey,
        model: MODEL_PORTFOLIOS[modelKey],
        difference: totalDiff
      };
    }
  });

  return closestModel;
}
