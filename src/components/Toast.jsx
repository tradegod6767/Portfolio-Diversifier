import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div role="alert" aria-live="polite" className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const borderClass = toast.type === 'success'
          ? 'border-gain/30'
          : toast.type === 'error'
          ? 'border-loss/30'
          : 'border-border';

        const iconBgClass = toast.type === 'success'
          ? 'bg-gain-bg'
          : toast.type === 'error'
          ? 'bg-loss-bg'
          : 'bg-muted';

        const iconColorClass = toast.type === 'success'
          ? 'text-gain'
          : toast.type === 'error'
          ? 'text-loss'
          : 'text-muted-foreground';

        return (
          <div
            key={toast.id}
            className={`
              max-w-md w-full bg-card rounded-lg shadow-lg border overflow-hidden
              transform transition-all duration-300 ease-out
              ${toast.isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
              ${borderClass}
            `}
          >
            <div className="flex items-start p-4 gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconBgClass}`}>
                {toast.type === 'success' ? (
                  <svg className={`w-5 h-5 ${iconColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : toast.type === 'error' ? (
                  <svg className={`w-5 h-5 ${iconColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className={`w-5 h-5 ${iconColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Message */}
              <p className="flex-1 text-sm font-medium text-foreground">
                {toast.message}
              </p>

              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
