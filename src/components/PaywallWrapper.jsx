import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

/**
 * PaywallWrapper - Wraps premium features with paywall protection
 *
 * @param {Object} props
 * @param {Object} props.user - User object from useAuth
 * @param {boolean} props.isPro - Pro status from useAuth
 * @param {boolean} props.loading - Loading state from useAuth
 * @param {string} props.featureName - Name of the feature (e.g., "PDF Export")
 * @param {string} props.description - Description of the feature
 * @param {ReactNode} props.children - The premium content to protect
 * @param {boolean} props.blur - Whether to blur the content (default: true)
 */
function PaywallWrapper({ user, isPro, loading, featureName, description, children, blur = true }) {
  // Use auth state passed as props instead of calling useAuth again
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);

  // Add timeout and logging
  useEffect(() => {
    console.log('[PaywallWrapper] isPro:', isPro, 'loading:', loading);

    if (loading) {
      const timer = setTimeout(() => {
        console.warn('[PaywallWrapper] Timeout - assuming free user');
        setShowTimeout(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isPro]);

  // If timed out, treat as free user
  if (loading && !showTimeout) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is Pro, show full content
  if (isPro && !showTimeout) {
    return <>{children}</>;
  }

  // Handle upgrade button click
  const handleUpgradeClick = async () => {
    // If not logged in, show auth modal
    if (!user) {
      console.log('[PaywallWrapper] User not logged in, showing auth modal');
      setShowAuthModal(true);
      return;
    }

    // User is logged in - redirect to Stripe checkout
    setIsUpgrading(true);

    const requestBody = {
      userId: user.id,
      email: user.email,
    };

    console.log('[PaywallWrapper] Creating checkout session with:', requestBody);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[PaywallWrapper] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[PaywallWrapper] API error response:', errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[PaywallWrapper] Response data:', data);

      if (data.url) {
        // Redirect to Stripe checkout
        console.log('[PaywallWrapper] Redirecting to:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('[PaywallWrapper] Error creating checkout session:', error);
      alert(`Failed to start checkout: ${error.message}`);
      setIsUpgrading(false);
    }
  };

  // Show locked content with upgrade overlay
  return (
    <>
      <div className="relative isolate mb-8 rounded-xl overflow-hidden min-h-[600px]">
        {/* Blurred content preview */}
        <div className={blur ? 'filter blur-sm pointer-events-none select-none' : 'pointer-events-none select-none opacity-50'}>
          {children}
        </div>

        {/* Upgrade overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm z-10 py-8">
          <div className="max-w-md text-center p-8">
            {/* Lock icon */}
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Feature info */}
            <h3 className="text-2xl font-bold text-white mb-2">
              {featureName}
            </h3>
            <p className="text-slate-200 mb-6">
              {description || 'Upgrade to Pro to unlock this feature'}
            </p>

            {/* Pricing */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6 border border-white/20">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-slate-300">/month</span>
              </div>
              <p className="text-sm text-slate-300 mt-2">
                All premium features included
              </p>
            </div>

            {/* Upgrade button */}
            <button
              onClick={handleUpgradeClick}
              disabled={isUpgrading}
              className="w-full bg-white hover:bg-slate-100 disabled:bg-slate-300 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg disabled:cursor-not-allowed"
            >
              {isUpgrading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading checkout...
                </span>
              ) : (
                <>
                  {user ? 'Upgrade to Pro - $79/year' : 'Sign In to Upgrade'}
                </>
              )}
            </button>

            {/* Feature list */}
            <div className="mt-6 text-left">
              <p className="text-xs text-slate-300 font-semibold mb-2">PRO INCLUDES:</p>
              <ul className="space-y-1 text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tax impact estimates
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  PDF report generation
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Portfolio health scoring
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Model portfolio comparison
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited portfolios
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleUpgradeClick}
        />
      )}
    </>
  );
}

export default PaywallWrapper;
