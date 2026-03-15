import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../lib/auth';

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);

      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-md bg-primary items-center justify-center text-primary-foreground font-bold text-2xl mb-4">
            RK
          </div>
          <h1 className="text-2xl font-bold text-foreground">RebalanceKit</h1>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Set New Password
                </h2>
                <p className="text-muted-foreground">
                  Enter your new password below
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-loss-bg border border-loss/30 rounded-lg">
                  <p className="text-sm text-loss">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full h-9 px-3 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none text-sm transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Must be at least 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full h-9 px-3 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none text-sm transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-opacity disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Password...
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success message */}
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gain-bg border border-gain/30 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-gain" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Password Updated!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your password has been successfully updated. Redirecting you to the homepage...
                </p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Redirecting...</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Back to home link */}
        {!success && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
