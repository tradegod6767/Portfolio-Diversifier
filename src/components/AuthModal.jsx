import { useState } from 'react';
import { login, signup } from '../lib/auth';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, onSuccess, onForgotPassword }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup(email, password);
        alert('Check your email to confirm your account!');
        onClose();
      } else {
        await login(email, password);
        onClose();
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="auth-modal-close"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="auth-modal-body">
          {/* Header */}
          <div className="auth-modal-header">
            <h2 className="auth-modal-title">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="auth-modal-subtitle">
              {mode === 'signin'
                ? 'Sign in to access your portfolio'
                : 'Start managing your portfolio today'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="auth-error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-field">
              <label className="auth-form-label">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-form-input"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div className="auth-form-field">
              <label className="auth-form-label">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-form-input"
                placeholder="••••••••"
                disabled={loading}
              />
              {mode === 'signup' && (
                <p className="auth-form-hint">
                  Must be at least 6 characters
                </p>
              )}
              {mode === 'signin' && (
                <div className="auth-forgot-password-container">
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onForgotPassword?.();
                    }}
                    className="auth-forgot-password-link"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`auth-submit-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <span className="auth-submit-btn-content">
                  <svg className="auth-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="auth-toggle-mode">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="auth-toggle-link"
            >
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <span className="auth-toggle-link-emphasis">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="auth-toggle-link-emphasis">Sign in</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
