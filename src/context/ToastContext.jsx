import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();

    setToasts(prev => [...prev, { id, message, type, isExiting: false }]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        // Start exit animation
        setToasts(prev =>
          prev.map(toast =>
            toast.id === id ? { ...toast, isExiting: true } : toast
          )
        );

        // Remove after animation completes
        setTimeout(() => {
          setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 300); // Match animation duration
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    // Start exit animation
    setToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    );

    // Remove after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
