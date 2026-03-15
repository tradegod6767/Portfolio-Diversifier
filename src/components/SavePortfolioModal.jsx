import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LoadingSpinner, SuccessCheckmark } from './ui';

function SavePortfolioModal({ isOpen, onClose, onSave, existingNames }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e) => {
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

    setSaving(true);
    try {
      await onSave(name.trim());
      setSaveSuccess(true);
      setTimeout(() => {
        setName('');
        setSaveSuccess(false);
        setSaving(false);
        onClose();
      }, 800);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setName('');
    setError('');
    setSaving(false);
    setSaveSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const isExisting = existingNames.includes(name.trim());

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', animation: 'fadeIn 200ms ease' }}
    >
      <div
        className="relative w-full max-w-[440px] bg-card border border-border rounded-xl shadow-lg overflow-y-auto max-h-[90vh]"
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
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">Save Portfolio</h3>
            <p className="text-sm text-muted-foreground">Give your portfolio a name to save it for later</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                PORTFOLIO NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My 401k, Roth IRA, Taxable Account"
                className="w-full h-9 border border-input bg-background rounded-md px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                autoFocus
              />
              {isExisting && (
                <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-loss-bg border border-loss/30 rounded-md text-xs text-loss">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>A portfolio with this name already exists and will be overwritten</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-loss-bg border border-loss/30 rounded-md">
                <p className="text-sm text-loss font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="flex-1 h-11 bg-muted text-foreground border border-border rounded-md text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || saveSuccess}
                className={`flex-1 h-11 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                  saveSuccess
                    ? 'bg-gain text-white'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <SuccessCheckmark size="sm" />
                    Saved!
                  </>
                ) : saving ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Saving...
                  </>
                ) : (
                  'Save Portfolio'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SavePortfolioModal;
