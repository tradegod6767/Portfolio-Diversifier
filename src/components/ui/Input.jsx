/**
 * Input — Minimal Fintech design system
 */

export default function Input({
  label,
  error,
  helpText,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full h-9 border rounded-md px-3 text-sm text-foreground bg-background placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed ${
          error ? 'border-loss focus:ring-loss/50' : 'border-input'
        } ${className}`}
        {...props}
      />
      {helpText && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground">{helpText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-loss flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
