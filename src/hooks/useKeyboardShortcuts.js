import { useEffect, useCallback } from 'react';

/**
 * Check if the user is currently typing in an input field
 */
function isTyping() {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  const isEditable = activeElement.isContentEditable;

  return isInput || isEditable;
}

/**
 * Keyboard shortcuts configuration
 */
export const SHORTCUTS = [
  { key: 'n', description: 'Add new holding', category: 'Navigation' },
  { key: 'r', description: 'Run rebalance calculation', category: 'Actions' },
  { key: 's', description: 'Save portfolio', category: 'Actions' },
  { key: 'd', description: 'Toggle dark mode', category: 'Display' },
  { key: '?', description: 'Show keyboard shortcuts', category: 'Help' },
  { key: 'Escape', description: 'Close modal/dropdown', category: 'Navigation' },
  { key: 'Ctrl/Cmd + Z', description: 'Undo last action', category: 'Edit' },
  { key: 'Ctrl/Cmd + Shift + Z', description: 'Redo last action', category: 'Edit' },
];

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} handlers - Object with shortcut handlers
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export function useKeyboardShortcuts(handlers, enabled = true) {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    // Exception: Escape should always work to close modals
    if (isTyping() && event.key !== 'Escape') {
      return;
    }

    // Handle Ctrl/Cmd shortcuts (already handled by PortfolioForm for undo/redo)
    // We skip these here to avoid conflicts
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Map of keys to handler names
    const keyHandlers = {
      'n': 'onAddHolding',
      'r': 'onRunRebalance',
      's': 'onSavePortfolio',
      'd': 'onToggleDarkMode',
      '?': 'onShowShortcuts',
      'Escape': 'onEscape',
    };

    const handlerName = keyHandlers[event.key];

    if (handlerName && handlers[handlerName]) {
      event.preventDefault();
      handlers[handlerName]();
    }
  }, [handlers, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Get shortcut hint for display
 * @param {string} key - The shortcut key
 * @returns {string} - Formatted shortcut hint
 */
export function getShortcutHint(key) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (key.includes('Ctrl')) {
    return key.replace('Ctrl', isMac ? 'Cmd' : 'Ctrl');
  }

  return key.toUpperCase();
}
