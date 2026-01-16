import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return { borderColor: 'var(--success-border)' };
      case 'error':
        return { borderColor: 'var(--error-border)' };
      default:
        return { borderColor: 'var(--info-border)' };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-md w-full rounded-lg shadow-2xl border overflow-hidden
            transform transition-all duration-300 ease-out
            ${toast.isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
          `}
          style={{ backgroundColor: 'var(--bg-card)', ...getToastStyle(toast.type) }}
        >
          <div className="flex items-start p-4 gap-3">
            {/* Icon */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: toast.type === 'success' ? 'var(--success-bg)'
                  : toast.type === 'error' ? 'var(--error-bg)'
                  : 'var(--info-bg)'
              }}
            >
              {toast.type === 'success' ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--success)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : toast.type === 'error' ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--error)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--info)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            {/* Message */}
            <p
              className="flex-1 text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {toast.message}
            </p>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
