/**
 * Card — Minimal Fintech design system
 * NO box-shadow. Borders only for elevation.
 */

export default function Card({
  children,
  title,
  subtitle,
  className = '',
  padding = 'normal',
  ...props
}) {
  const paddings = {
    none:   'p-0',
    sm:     'p-4',
    normal: 'p-6',
    lg:     'p-8',
  };

  return (
    <div
      className={`bg-card border border-border rounded-lg ${paddings[padding] ?? paddings.normal} ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
