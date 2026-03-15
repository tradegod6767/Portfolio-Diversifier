import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CHANGELOG, CURRENT_VERSION, markVersionAsSeen } from '../data/changelog';

// Icons for different change types
const ChangeTypeIcon = ({ type }) => {
  switch (type) {
    case 'feature':
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gain-bg">
          <svg className="w-3.5 h-3.5 text-gain" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </span>
      );
    case 'improvement':
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
          <svg className="w-3.5 h-3.5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </span>
      );
    case 'fix':
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
          <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
      );
    default:
      return null;
  }
};

// Badge for change type
const ChangeTypeBadge = ({ type }) => {
  const cls = type === 'feature'
    ? 'bg-gain-bg text-gain border border-gain/30'
    : type === 'improvement'
    ? 'bg-muted text-foreground border border-border'
    : 'bg-muted text-muted-foreground border border-border';
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${cls}`}>
      {label}
    </span>
  );
};

function WhatsNewModal({ isOpen, onClose }) {
  // Mark as seen when modal opens
  useEffect(() => {
    if (isOpen) {
      markVersionAsSeen();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format date nicely
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-lg max-w-lg w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">What's New</h2>
              <p className="text-xs text-muted-foreground">Version {CURRENT_VERSION}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-140px)]">
          {CHANGELOG.map((release, index) => (
            <div key={release.version} className={index !== 0 ? 'mt-6 pt-6 border-t border-border' : ''}>
              {/* Version Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    v{release.version}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-gain-bg text-gain">
                      Latest
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(release.date)}
                </span>
              </div>

              {/* Changes List */}
              <div className="space-y-2">
                {release.changes.map((change, changeIndex) => (
                  <div
                    key={changeIndex}
                    className="flex items-start gap-3 p-2 rounded-lg bg-muted"
                  >
                    <ChangeTypeIcon type={change.type} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground">
                        {change.text}
                      </span>
                    </div>
                    <ChangeTypeBadge type={change.type} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-border bg-muted">
          <p className="text-xs text-muted-foreground">
            Thanks for using RebalanceKit!
          </p>
          <button
            onClick={onClose}
            className="h-9 px-4 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default WhatsNewModal;
