/**
 * Professional Input Component
 * Follows RebalanceKit design system
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
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-3
          border-2 rounded-md
          text-slate-900 placeholder-slate-400
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-200 focus:border-[#0A2540] focus:ring-[#0A2540]/10'
          }
          ${className}
        `}
        {...props}
      />
      {helpText && !error && (
        <p className="mt-2 text-sm text-slate-500">
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
