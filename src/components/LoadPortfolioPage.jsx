import { useState, useEffect } from 'react';
import { getSavedPortfolios, deletePortfolio } from '../utils/portfolioStorage';
import { EmptyState } from './ui';
import { useToast } from '../context/ToastContext';

function LoadPortfolioPage({ onBack, user, isPro }) {
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadSavedPortfolios();
  }, [user, isPro]);

  const loadSavedPortfolios = async () => {
    setLoading(true);
    try {
      const portfolios = await getSavedPortfolios(user, isPro);
      setSavedPortfolios(portfolios);
    } catch {
      // Failed to load portfolios
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPortfolio = (portfolio) => {
    if (portfolio) {
      const positions = portfolio.positions.map((p, index) => ({
        ...p,
        id: Date.now() + index
      }));
      onBack(positions);
    }
  };

  const handleDeletePortfolio = async (portfolio, e) => {
    e.stopPropagation();
    try {
      await deletePortfolio(portfolio.name, user, isPro);
      setConfirmingDelete(null);
      await loadSavedPortfolios();
    } catch {
      addToast('Failed to delete portfolio. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onBack()}
        className="flex items-center gap-2 px-4 py-2 bg-background border border-border hover:bg-muted text-foreground font-semibold rounded-lg transition duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Portfolio Form
      </button>

      <h2 className="text-2xl font-bold text-foreground">Load Saved Portfolio</h2>

      {/* Pro Feature Callout for Free Users */}
      {(!user || !isPro) && (
        <div className="bg-muted border border-border rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Unlimited Cloud Storage with Pro
              </h3>
              <p className="text-muted-foreground mb-3">
                Free users can save up to 5 portfolios locally. Upgrade to Pro for unlimited portfolios with cloud sync across all your devices!
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gain" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlimited portfolios
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gain" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cloud sync
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gain" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Access anywhere
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading portfolios...</p>
        </div>
      ) : savedPortfolios.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          title="No portfolios yet"
          description="Create your first portfolio or try a sample to see how RebalanceKit works."
          primaryAction={{
            label: "Create Portfolio",
            onClick: () => onBack()
          }}
          secondaryAction={{
            label: "Load Sample",
            onClick: () => {
              const samplePositions = [
                { id: Date.now(), ticker: 'VTI', amount: '30000', targetPercent: '60' },
                { id: Date.now() + 1, ticker: 'VXUS', amount: '12000', targetPercent: '25' },
                { id: Date.now() + 2, ticker: 'BND', amount: '6000', targetPercent: '12' },
                { id: Date.now() + 3, ticker: 'CASH', amount: '2000', targetPercent: '3' }
              ];
              onBack(samplePositions);
            }
          }}
        />
      ) : (
        <div className="space-y-3">
          {savedPortfolios.map((portfolio) => (
            <div
              key={portfolio.id || portfolio.name}
              className="flex items-center justify-between p-5 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleLoadPortfolio(portfolio)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {portfolio.name}
                  </h3>
                  {!portfolio.isLocal && (
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-md flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                      </svg>
                      PRO
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                  {!portfolio.isLocal && (
                    <span className="flex items-center gap-1 text-gain font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                      Cloud synced
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {portfolio.positions.slice(0, 5).map((pos, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-muted border border-border rounded-md text-xs font-semibold text-foreground"
                    >
                      {pos.ticker}
                    </span>
                  ))}
                  {portfolio.positions.length > 5 && (
                    <span className="px-2 py-1 bg-muted border border-border rounded-md text-xs font-semibold text-muted-foreground">
                      +{portfolio.positions.length - 5} more
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {confirmingDelete === portfolio.name ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm text-loss font-medium">Delete?</span>
                    <button
                      onClick={(e) => handleDeletePortfolio(portfolio, e)}
                      className="px-3 py-1.5 bg-loss hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-opacity"
                    >
                      Yes
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmingDelete(null); }}
                      className="px-3 py-1.5 bg-muted hover:bg-accent text-foreground text-sm font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmingDelete(portfolio.name); }}
                    className="p-3 text-loss hover:bg-loss-bg rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
