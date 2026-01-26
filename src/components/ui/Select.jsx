/**
 * Professional Select/Dropdown Component
 * Follows RebalanceKit design system
 */

import { useState, useRef, useEffect } from 'react';

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helpText,
  className = '',
  disabled = false,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Find current selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const nextIndex = Math.min(currentIndex + 1, options.length - 1);
      onChange(options[nextIndex].value);
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const prevIndex = Math.max(currentIndex - 1, 0);
      onChange(options[prevIndex].value);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`w-full ${className}`} ref={selectRef} {...props}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full px-4 py-3
          border-2 rounded-lg
          text-left
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60
          ${isOpen
            ? 'border-[#0A2540] ring-2 ring-[#0A2540]/10'
            : error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-200 hover:border-slate-300 focus:border-[#0A2540] focus:ring-[#0A2540]/10'
          }
          bg-white
        `}
      >
        <span className={`block truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Subtitle if present */}
        {selectedOption?.subtitle && (
          <span className="block text-xs text-slate-500 mt-0.5 truncate">
            {selectedOption.subtitle}
          </span>
        )}

        {/* Chevron Icon */}
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-white border border-slate-200 shadow-lg animate-fade-in">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                relative w-full px-4 py-3 text-left
                transition-colors duration-150
                hover:bg-slate-50
                focus:outline-none focus:bg-slate-50
                ${option.value === value ? 'bg-slate-50' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`block font-medium ${option.value === value ? 'text-[#0A2540]' : 'text-slate-900'}`}>
                    {option.label}
                  </span>
                  {option.subtitle && (
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {option.subtitle}
                    </span>
                  )}
                </div>

                {/* Checkmark for selected item */}
                {option.value === value && (
                  <svg className="w-5 h-5 text-[#0A2540]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Risk level badge if present */}
              {option.badge && (
                <span className={`
                  inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full
                  ${option.badgeColor === 'green' ? 'bg-green-100 text-green-700' :
                    option.badgeColor === 'yellow' ? 'bg-amber-100 text-amber-700' :
                    option.badgeColor === 'red' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'}
                `}>
                  {option.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {helpText && !error && (
        <p className="mt-2 text-sm text-slate-500">
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
