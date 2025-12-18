import { useState, useEffect } from 'react';
import { getSavedPortfolios, deletePortfolio, getPortfolio } from '../utils/portfolioStorage';

function LoadPortfolioPage({ onBack }) {
  const [savedPortfolios, setSavedPortfolios] = useState([]);

  useEffect(() => {
    loadSavedPortfolios();
  }, []);

  const loadSavedPortfolios = () => {
    setSavedPortfolios(getSavedPortfolios());
  };

  const handleLoadPortfolio = (name) => {
    const portfolio = getPortfolio(name);
    if (portfolio) {
      const positions = portfolio.positions.map((p, index) => ({
        ...p,
        id: Date.now() + index
      }));
      onBack(positions);
    }
  };

  const handleDeletePortfolio = (name, e) => {
    e.stopPropagation();
    if (confirm(`Delete portfolio "${name}"?`)) {
      deletePortfolio(name);
      loadSavedPortfolios();
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onBack()}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200 shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Portfolio Form
      </button>

      <h2 className="text-2xl font-bold text-gray-900">Load Saved Portfolio</h2>

      {savedPortfolios.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-600 text-lg font-medium mb-2">No saved portfolios</p>
          <p className="text-gray-500 text-sm">
            Save your portfolio configurations to quickly load them later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedPortfolios.map((portfolio) => (
            <div
              key={portfolio.name}
              className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleLoadPortfolio(portfolio.name)}
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {portfolio.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(portfolio.savedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {portfolio.positions.length} position{portfolio.positions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {portfolio.positions.slice(0, 5).map((pos, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700"
                    >
                      {pos.ticker}
                    </span>
                  ))}
                  {portfolio.positions.length > 5 && (
                    <span className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs font-semibold text-gray-600">
                      +{portfolio.positions.length - 5} more
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleDeletePortfolio(portfolio.name, e)}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LoadPortfolioPage;
