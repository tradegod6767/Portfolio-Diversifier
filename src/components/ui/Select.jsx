/**
 * Select — Minimal Fintech design system
 * Custom dropdown with keyboard navigation
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

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const idx = options.findIndex(opt => opt.value === value);
      onChange(options[Math.min(idx + 1, options.length - 1)].value);
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const idx = options.findIndex(opt => opt.value === value);
      onChange(options[Math.max(idx - 1, 0)].value);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`w-full relative ${className}`} ref={selectRef} {...props}>
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`relative w-full h-9 px-3 pr-9 text-sm text-left border rounded-md bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed ${
          error ? 'border-loss' : isOpen ? 'border-ring' : 'border-input'
        }`}
      >
        <span className={`block truncate ${selectedOption ? 'text-foreground' : 'text-muted-foreground'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {selectedOption?.subtitle && (
          <span className="block text-xs text-muted-foreground truncate leading-none mt-0.5">
            {selectedOption.subtitle}
          </span>
        )}
        <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-card border border-border shadow-md"
          style={{ animation: 'fadeIn 150ms ease' }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2.5 text-sm text-left transition-colors hover:bg-muted/60 focus:outline-none focus:bg-muted/60 ${
                option.value === value ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className={`block font-medium truncate ${option.value === value ? 'text-foreground' : 'text-foreground'}`}>
                    {option.label}
                  </span>
                  {option.subtitle && (
                    <span className="block text-xs text-muted-foreground mt-0.5 truncate">
                      {option.subtitle}
                    </span>
                  )}
                </div>
                {option.value === value && (
                  <svg className="w-4 h-4 text-foreground flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {option.badge && (
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-md ${
                  option.badgeColor === 'green' ? 'bg-gain-bg text-gain' :
                  option.badgeColor === 'yellow' ? 'bg-muted text-muted-foreground' :
                  option.badgeColor === 'red' ? 'bg-loss-bg text-loss' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {option.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

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
