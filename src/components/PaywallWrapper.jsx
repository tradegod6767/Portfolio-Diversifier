import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import ForgotPasswordModal from './ForgotPasswordModal';

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
  const [showTimeout, setShowTimeout] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Add timeout for slow auth checks
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // After successful auth, continue to checkout if pending
  useEffect(() => {
    if (pendingCheckout && user) {
      setPendingCheckout(false);
      // Small delay to ensure auth state is settled
      setTimeout(() => {
        const gumroadUrl = `https://rebalancekit.gumroad.com/l/fvdfk?wanted=true&email=${encodeURIComponent(user.email)}`;
        window.open(gumroadUrl, '_blank');
      }, 500);
    }
  }, [user, pendingCheckout]);

  // Handle upgrade button click - require auth first
  const handleUpgradeClick = (e) => {
    if (!user) {
      e.preventDefault();
      setPendingCheckout(true);
      setShowAuthModal(true);
      return;
    }
    // User is logged in, proceed to Gumroad (link will handle it)
  };

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

            {/* Email notice - shows which email to use */}
            {user?.email && (
              <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-emerald-100 font-semibold mb-1">
                  ✓ Use this email when checking out:
                </p>
                <p className="text-sm text-white font-mono">
                  {user.email}
                </p>
              </div>
            )}

            {/* Upgrade button - requires auth, then uses Gumroad overlay checkout */}
            <a
              href={user ? `https://rebalancekit.gumroad.com/l/fvdfk?wanted=true&email=${encodeURIComponent(user.email)}` : '#'}
              onClick={handleUpgradeClick}
              className={`${user ? 'gumroad-button' : ''} w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg text-center block`}
            >
              {user ? 'Upgrade to Pro - $9.99/month' : 'Sign Up to Unlock Pro'}
            </a>

            {/* Feature list */}
            <div className="mt-6 text-left">
              <p className="text-xs text-slate-300 font-semibold mb-2">PRO INCLUDES:</p>
              <ul className="space-y-1 text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  100 AI analyses per hour (vs 5 free)
                </li>
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

      {/* Auth Modal - shown when unauthenticated user clicks upgrade */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingCheckout(false);
        }}
        onSuccess={() => {
          setShowAuthModal(false);
          // pendingCheckout effect will handle continuation
        }}
        onForgotPassword={() => {
          setShowAuthModal(false);
          setShowForgotPassword(true);
        }}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          setShowAuthModal(true);
        }}
      />
    </>
  );
}

export default PaywallWrapper;
