/**
 * LoadingSpinner - Consistent loading indicator for RebalanceKit
 *
 * Use for button loading states, inline loading, and small loading indicators
 */

export default function LoadingSpinner({
  size = 'md',
  color = 'current',
  className = ''
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const colorClasses = {
    current: 'text-current',
    white: 'text-white',
    primary: 'text-[#0A2540]',
    muted: 'text-slate-400'
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * SuccessCheckmark - Animated checkmark for success states
 */
export function SuccessCheckmark({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <svg
      className={`${sizeClasses[size]} text-emerald-500 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      style={{ animation: 'checkmark-pop 0.3s ease-out' }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M5 13l4 4L19 7"
        style={{
          strokeDasharray: 24,
          strokeDashoffset: 0,
          animation: 'checkmark-draw 0.3s ease-out'
        }}
      />
    </svg>
  );
}

/**
 * TypingIndicator - Animated dots for AI/chat loading states
 */
export function TypingIndicator({ className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span
        className="w-2 h-2 rounded-full bg-slate-400"
        style={{ animation: 'typing-bounce 1.4s ease-in-out infinite' }}
      />
      <span
        className="w-2 h-2 rounded-full bg-slate-400"
        style={{ animation: 'typing-bounce 1.4s ease-in-out 0.2s infinite' }}
      />
      <span
        className="w-2 h-2 rounded-full bg-slate-400"
        style={{ animation: 'typing-bounce 1.4s ease-in-out 0.4s infinite' }}
      />
    </div>
  );
}

/**
 * ProgressBar - Determinate or indeterminate progress indicator
 */
export function ProgressBar({ progress = null, className = '' }) {
  const isIndeterminate = progress === null;

  return (
    <div className={`h-1.5 bg-slate-200 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full bg-[#0A2540] rounded-full ${isIndeterminate ? 'animate-progress-indeterminate' : ''}`}
        style={!isIndeterminate ? { width: `${Math.min(100, Math.max(0, progress))}%`, transition: 'width 0.3s ease' } : {}}
      />
    </div>
  );
}

/**
 * CSS styles for loading animations - add to index.css
 */
export const LoadingAnimationStyles = `
  @keyframes checkmark-draw {
    from {
      stroke-dashoffset: 24;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes checkmark-pop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes typing-bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-4px);
    }
  }

  @keyframes progress-indeterminate {
    0% {
      width: 0%;
      margin-left: 0;
    }
    50% {
      width: 70%;
      margin-left: 15%;
    }
    100% {
      width: 0%;
      margin-left: 100%;
    }
  }

  .animate-progress-indeterminate {
    animation: progress-indeterminate 1.5s ease-in-out infinite;
  }
`;
