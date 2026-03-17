/**
 * Sample Portfolio Definitions
 * Pre-configured example portfolios for users to try
 */

export const SAMPLE_PORTFOLIOS = {
  'beginner-3-fund': {
    name: 'Beginner 3-Fund',
    description: 'Simple diversified portfolio ideal for beginners',
    totalValue: 50000,
    positions: [
      { ticker: 'VTI', amount: '34000', targetPercent: '60' },
      { ticker: 'VXUS', amount: '9000', targetPercent: '20' },
      { ticker: 'BND', amount: '7000', targetPercent: '20' }
    ],
    riskLevel: 'Moderate',
    tags: ['beginner', 'diversified', 'three-fund']
  },
  'growth-focused': {
    name: 'Growth Focused',
    description: 'Higher growth potential with tech exposure',
    totalValue: 50000,
    positions: [
      { ticker: 'VTI', amount: '24000', targetPercent: '50' },
      { ticker: 'QQQ', amount: '19000', targetPercent: '30' },
      { ticker: 'VXUS', amount: '7000', targetPercent: '20' }
    ],
    riskLevel: 'Aggressive',
    tags: ['growth', 'tech', 'aggressive']
  },
  'retirement-balanced': {
    name: 'Retirement Balanced',
    description: 'Conservative balance for retirement planning',
    totalValue: 150000,
    positions: [
      { ticker: 'VTI', amount: '72000', targetPercent: '40' },
      { ticker: 'VXUS', amount: '27000', targetPercent: '20' },
      { ticker: 'BND', amount: '42000', targetPercent: '30' },
      { ticker: 'VTIP', amount: '9000', targetPercent: '10' }
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
