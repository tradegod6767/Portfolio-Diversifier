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
    <div className="relative bg-card border border-border rounded-xl p-4 md:p-5">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md transition-colors text-muted-foreground hover:bg-muted"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col md:flex-row md:items-center gap-4 pr-8">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold mb-1 text-foreground">
            Welcome to RebalanceKit
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter your holdings below to calculate rebalancing trades, or try a sample portfolio to see how it works.
          </p>
        </div>

        {/* Quick tips */}
        <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          {['Add-only mode', 'Health score', 'PDF export'].map((label) => (
            <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
              <svg className="w-3.5 h-3.5 text-gain" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {label}
            </span>
          ))}
        </div>

        {/* Try sample button */}
        {onLoadExample && (
          <button
            onClick={() => {
              onLoadExample();
              handleDismiss();
            }}
            className="flex-shrink-0 h-9 px-4 text-sm font-semibold rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try Sample
          </button>
        )}
      </div>
    </div>
  );
}
