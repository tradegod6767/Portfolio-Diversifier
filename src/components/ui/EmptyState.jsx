/**
 * EmptyState — Minimal Fintech design system
 */

function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = ''
}) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {icon && (
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}

      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md transition-opacity hover:opacity-90 min-w-[140px]"
            >
              {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="h-9 px-4 text-sm font-medium bg-muted text-foreground border border-border rounded-md transition-colors hover:bg-accent min-w-[140px]"
            >
              {secondaryAction.icon && <span className="mr-2">{secondaryAction.icon}</span>}
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
