import { useState } from 'react';
import './SavePortfolioModal.css';

function SavePortfolioModal({ isOpen, onClose, onSave, existingNames }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a portfolio name');
      return;
    }

    if (name.trim().length > 50) {
      setError('Name must be 50 characters or less');
      return;
    }

    try {
      onSave(name.trim());
      setName('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const isExisting = existingNames.includes(name.trim());

  return (
    <div className="save-modal-overlay">
      <div className="save-modal-content">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="save-modal-close"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="save-modal-body">
          {/* Header */}
          <div className="save-modal-header">
            <h3 className="save-modal-title">Save Portfolio</h3>
            <p className="save-modal-subtitle">
              Give your portfolio a name to save it for later
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="save-form-field">
              <label className="save-form-label">
                PORTFOLIO NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My 401k, Roth IRA, Taxable Account"
                className="save-form-input"
                autoFocus
              />
              {isExisting && (
                <div className="save-warning-message">
                  <svg className="save-warning-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>A portfolio with this name already exists and will be overwritten</span>
                </div>
              )}
            </div>

            {error && (
              <div className="save-error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="save-button-group">
              <button
                type="button"
                onClick={handleClose}
                className="save-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-submit-btn"
              >
                Save Portfolio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SavePortfolioModal;
