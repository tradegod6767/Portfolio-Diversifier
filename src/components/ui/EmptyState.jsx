/**
 * EmptyState - A reusable component for displaying helpful empty states
 *
 * Used when there's no data to display, providing context and next actions
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
      {/* Icon */}
      {icon && (
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-base mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-6 py-3 bg-[#0A2540] hover:bg-[#0D2F52] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 min-w-[160px]"
            >
              {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md min-w-[160px]"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid var(--border-color)',
                color: 'var(--text-secondary)'
              }}
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
