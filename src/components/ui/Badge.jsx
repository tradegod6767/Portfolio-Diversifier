/**
 * Badge — Minimal Fintech design system
 */

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const base = 'inline-flex items-center font-medium rounded-md';

  const variants = {
    default: 'bg-muted text-muted-foreground',
    buy:     'bg-gain-bg text-gain',
    sell:    'bg-loss-bg text-loss',
    hold:    'bg-muted text-muted-foreground',
    pro:     'bg-primary text-primary-foreground',
    success: 'bg-gain-bg text-gain',
    warning: 'bg-muted text-muted-foreground',
    error:   'bg-loss-bg text-loss',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`${base} ${variants[variant] ?? variants.default} ${sizes[size] ?? sizes.md} ${className}`}>
      {children}
    </span>
  );
}
