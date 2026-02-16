// Local storage utilities for portfolio management

const STORAGE_KEY = 'saved_portfolios';
const MAX_FREE_PORTFOLIOS = 5;
const MAX_PRO_PORTFOLIOS = 50;

export const savePortfolio = (name, positions, user = null, isPro = false) => {
  const portfolios = getSavedPortfolios(user, isPro);

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
    const maxPortfolios = isPro ? MAX_PRO_PORTFOLIOS : MAX_FREE_PORTFOLIOS;
    if (portfolios.length >= maxPortfolios) {
      throw new Error(`Maximum of ${maxPortfolios} portfolios can be saved${!isPro ? '. Upgrade to Pro for more.' : '.'}`);
    }
    portfolios.push(portfolio);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
  return portfolio;
};

export const getSavedPortfolios = (user = null, isPro = false) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
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
