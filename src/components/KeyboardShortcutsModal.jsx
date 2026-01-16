import { useEffect } from 'react';
import { SHORTCUTS, getShortcutHint } from '../hooks/useKeyboardShortcuts';

function KeyboardShortcutsModal({ isOpen, onClose }) {
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

  // Group shortcuts by category
  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {});

  const categoryOrder = ['Navigation', 'Actions', 'Edit', 'Display', 'Help'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--bg-card)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Power user commands</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-140px)]">
          {categoryOrder.map((category) => {
            const shortcuts = groupedShortcuts[category];
            if (!shortcuts) return null;

            return (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-2 px-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-mono font-semibold rounded shadow-sm flex-shrink-0 ml-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        {getShortcutHint(shortcut.key)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono rounded" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;
