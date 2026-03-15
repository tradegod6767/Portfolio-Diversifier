/**
 * Button — Minimal Fintech design system
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
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98]';

  const variants = {
    primary:     'bg-primary text-primary-foreground hover:opacity-90',
    secondary:   'bg-muted text-foreground border border-border hover:bg-accent',
    ghost:       'bg-transparent text-foreground hover:bg-accent',
    destructive: 'text-loss hover:bg-loss-bg border border-transparent hover:border-loss/30',
    success:     'bg-gain text-white hover:opacity-90',
  };

  const sizes = {
    sm: 'h-7 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  };

  const stateClass = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${stateClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
