/**
 * Professional Card Component
 * Follows RebalanceKit design system
 */

export default function Card({
  children,
  title,
  subtitle,
  className = '',
  hoverable = false,
  padding = 'normal',
  ...props
}) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hoverable ? 'hover:shadow-lg hover:-translate-y-1 hover:border-slate-600 transition-all duration-200 ease-out cursor-pointer' : '';

  return (
    <div
      className={`rounded-lg border shadow-sm ${paddingClasses[padding]} ${hoverClass} ${className}`}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
