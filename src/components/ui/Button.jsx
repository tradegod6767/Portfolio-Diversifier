/**
 * Professional Button Component
 * Follows RebalanceKit design system
 */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-0.5 focus:ring-indigo-500 focus:ring-offset-slate-900 shadow-sm hover:shadow-lg active:translate-y-0',
    secondary: 'bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 hover:-translate-y-0.5 hover:shadow-md focus:ring-slate-500 focus:ring-offset-slate-900 active:translate-y-0',
    success: 'bg-[#00D4AA] text-white hover:bg-[#00B892] hover:-translate-y-0.5 hover:shadow-lg focus:ring-[#00D4AA] active:translate-y-0',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg focus:ring-red-500 active:translate-y-0',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-700 hover:text-slate-100 focus:ring-slate-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
