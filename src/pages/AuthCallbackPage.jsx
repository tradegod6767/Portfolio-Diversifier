import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

function AuthCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    let timeoutId;

    // Check if user is already confirmed
    if (user) {
      // Check for pending Pro purchases (user might have bought before confirming email)
      fetch('/api/claim-pending-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, userId: user.id })
      }).then(res => res.json()).then(result => {
        if (result.found && result.claimed) {
          addToast('Email confirmed and Pro subscription activated!', 'success');
        } else {
          addToast('Email confirmed! You can now sign in.', 'success');
        }
      }).catch(() => {
        addToast('Email confirmed! You can now sign in.', 'success');
      });

      timeoutId = setTimeout(() => {
        navigate('/');
      }, 2000);
      setLoading(false);
      return;
    }

    // Set a timeout to show error if confirmation takes too long
    timeoutId = setTimeout(() => {
      if (!user) {
        setError('This confirmation link has expired or is invalid. Please sign up again.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, navigate, addToast]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-2xl mb-4">
            RK
          </div>
          <h1 className="text-2xl font-bold text-slate-900">RebalanceKit</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {loading && !error ? (
            <>
              {/* Loading state */}
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="animate-spin h-8 w-8 text-slate-900"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Confirming Your Email
                </h2>
                <p className="text-slate-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            </>
          ) : error ? (
            <>
              {/* Error state */}
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Confirmation Failed
                </h2>
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
                >
                  Back to Home
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Email Confirmed!
                </h2>
                <p className="text-slate-600 mb-6">
                  Your email has been successfully verified. Redirecting you to the homepage...
                </p>
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm">Redirecting...</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Back to home link (only show in error state) */}
        {!loading && !error && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthCallbackPage;
