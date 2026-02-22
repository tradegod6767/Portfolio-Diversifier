/**
 * Professional Badge Component
 * Follows RebalanceKit design system
 */

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const baseClasses = 'inline-flex items-center font-semibold rounded-full uppercase tracking-wider';

  const variantClasses = {
    default: 'bg-slate-700 text-slate-300',
    pro: 'bg-emerald-900/50 text-emerald-400 border border-emerald-700',
    free: 'bg-slate-700 text-slate-400 border border-slate-600',
    success: 'bg-green-900/50 text-green-400',
    warning: 'bg-amber-900/50 text-amber-400',
    error: 'bg-red-900/50 text-red-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
