import { useState } from 'react';
import { resetPasswordForEmail } from '../lib/auth';
import './ForgotPasswordModal.css';

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

  return (
    <div className="forgot-modal-overlay">
      <div className="forgot-modal-content">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="forgot-modal-close"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="forgot-modal-body">
          {!success ? (
            <>
              {/* Header */}
              <div className="forgot-modal-header">
                <h2 className="forgot-modal-title">
                  Reset Password
                </h2>
                <p className="forgot-modal-subtitle">
                  Enter your email and we'll send you a link to reset your password
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="forgot-error-message">
                  <p>{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="forgot-form">
                <div className="forgot-form-field">
                  <label className="forgot-form-label">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="forgot-form-input"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`forgot-submit-btn ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    <span className="forgot-submit-btn-content">
                      <svg className="forgot-spinner" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success message */}
              <div className="forgot-success-container">
                <div className="forgot-success-icon">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="forgot-success-title">
                  Check Your Email
                </h2>
                <p className="forgot-success-message">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="forgot-success-hint">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
                <button
                  onClick={handleClose}
                  className="forgot-success-btn"
                >
                  Got it
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
