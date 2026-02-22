import { useState } from 'react';

const STORAGE_PREFIX = 'rebalancekit_welcome_dismissed';

function isNewSignup(user) {
  if (!user?.created_at) return false;
  const created = new Date(user.created_at).getTime();
  const now = Date.now();
  // Account created within the last 10 minutes
  return now - created < 10 * 60 * 1000;
}

export default function WelcomeBanner({ user, onLoadExample }) {
  const storageKey = user ? `${STORAGE_PREFIX}_${user.id}` : null;

  const [dismissed, setDismissed] = useState(() => {
    if (!storageKey) return true; // no user = don't show
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, 'true');
      } catch {
        // ignore
      }
    }
  };

  // Only show for logged-in new signups who haven't dismissed
  if (!user || dismissed || !isNewSignup(user)) return null;

  return (
    <div
      className="relative rounded-xl border p-4 md:p-5"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col md:flex-row md:items-center gap-4 pr-8">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome to RebalanceKit
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter your holdings below to calculate rebalancing trades, or try a sample portfolio to see how it works.
          </p>
        </div>

        {/* Quick tips */}
        <div className="flex flex-wrap gap-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Add-only mode
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Health score
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            PDF export
          </span>
        </div>

        {/* Try sample button */}
        {onLoadExample && (
          <button
            onClick={() => {
              onLoadExample();
              handleDismiss();
            }}
            className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
            style={{
              backgroundColor: '#6366f1',
              color: 'white'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
          >
            Try Sample
          </button>
        )}
      </div>
    </div>
  );
}
