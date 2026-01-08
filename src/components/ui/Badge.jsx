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
    default: 'bg-slate-100 text-slate-700',
    pro: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    free: 'bg-slate-100 text-slate-600 border border-slate-200',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
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
