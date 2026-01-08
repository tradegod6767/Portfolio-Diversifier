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

  const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow duration-200' : '';

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 shadow-sm ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-semibold text-slate-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
