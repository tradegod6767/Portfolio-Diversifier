import { useState } from 'react';
import { createPortal } from 'react-dom';
import { resetPasswordForEmail } from '../lib/auth';

function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPasswordForEmail(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', animation: 'fadeIn 200ms ease' }}
    >
      <div
        className="relative w-full max-w-[440px] bg-card border border-border rounded-xl shadow-lg"
        style={{ animation: 'slideUp 250ms ease' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Reset Password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a link to reset your password
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 px-4 py-3 bg-loss-bg border border-loss/30 rounded-md">
                  <p className="text-sm text-loss font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 border border-input bg-background rounded-md px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary text-primary-foreground rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center" style={{ animation: 'fadeIn 300ms ease' }}>
              <div
                className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--gain-bg)', animation: 'successPop 400ms ease' }}
              >
                <svg className="w-8 h-8 text-gain" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">Check Your Email</h2>
              <p className="text-sm text-muted-foreground mb-3">
                We've sent a password reset link to <strong className="text-foreground font-semibold">{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              <button
                onClick={handleClose}
                className="w-full h-11 bg-primary text-primary-foreground rounded-md text-sm font-semibold transition-opacity hover:opacity-90"
              >
                Got it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ForgotPasswordModal;
