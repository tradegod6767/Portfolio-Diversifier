/**
 * Sample Portfolio Definitions
 * Pre-configured example portfolios for users to try
 */

export const SAMPLE_PORTFOLIOS = {
  'beginner-3-fund': {
    name: 'Beginner 3-Fund',
    description: 'Simple diversified portfolio ideal for beginners',
    totalValue: 10000,
    positions: [
      { ticker: 'VTI', amount: '6000', targetPercent: '60' },
      { ticker: 'VXUS', amount: '2000', targetPercent: '20' },
      { ticker: 'BND', amount: '2000', targetPercent: '20' }
    ],
    riskLevel: 'Moderate',
    tags: ['beginner', 'diversified', 'three-fund']
  },
  'growth-focused': {
    name: 'Growth Focused',
    description: 'Higher growth potential with tech exposure',
    totalValue: 25000,
    positions: [
      { ticker: 'VTI', amount: '12500', targetPercent: '50' },
      { ticker: 'QQQ', amount: '7500', targetPercent: '30' },
      { ticker: 'VXUS', amount: '5000', targetPercent: '20' }
    ],
    riskLevel: 'Aggressive',
    tags: ['growth', 'tech', 'aggressive']
  },
  'retirement-balanced': {
    name: 'Retirement Balanced',
    description: 'Conservative balance for retirement planning',
    totalValue: 100000,
    positions: [
      { ticker: 'VTI', amount: '40000', targetPercent: '40' },
      { ticker: 'VXUS', amount: '20000', targetPercent: '20' },
      { ticker: 'BND', amount: '30000', targetPercent: '30' },
      { ticker: 'VTIP', amount: '10000', targetPercent: '10' }
    ],
    riskLevel: 'Conservative',
    tags: ['retirement', 'balanced', 'conservative']
  }
};

/**
 * Get a specific sample portfolio by key
 * @param {string} key - The portfolio key
 * @returns {Object|undefined} The sample portfolio object
 */
export const getSamplePortfolio = (key) => {
  return SAMPLE_PORTFOLIOS[key];
};

/**
 * Get all sample portfolios as an array
 * @returns {Array} Array of portfolio objects with keys
 */
export const getAllSamplePortfolios = () => {
  return Object.entries(SAMPLE_PORTFOLIOS).map(([key, portfolio]) => ({
    key,
    ...portfolio
  }));
};
