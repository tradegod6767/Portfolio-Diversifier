// Local storage utilities for portfolio management

const STORAGE_KEY = 'saved_portfolios';
const MAX_PORTFOLIOS = 5;

export const savePortfolio = (name, positions) => {
  const portfolios = getSavedPortfolios();

  // Check if portfolio with this name already exists
  const existingIndex = portfolios.findIndex(p => p.name === name);

  const portfolio = {
    name,
    positions: positions.map(p => ({
      ticker: p.ticker,
      amount: p.amount,
      targetPercent: p.targetPercent
    })),
    savedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    portfolios[existingIndex] = portfolio;
  } else {
    if (portfolios.length >= MAX_PORTFOLIOS) {
      throw new Error(`Maximum of ${MAX_PORTFOLIOS} portfolios can be saved`);
    }
    portfolios.push(portfolio);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
  return portfolio;
};

export const getSavedPortfolios = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading portfolios:', error);
    return [];
  }
};

export const deletePortfolio = (name) => {
  const portfolios = getSavedPortfolios();
  const filtered = portfolios.filter(p => p.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getPortfolio = (name) => {
  const portfolios = getSavedPortfolios();
  return portfolios.find(p => p.name === name);
};
