import { useState } from 'react';

function Tooltip({ text, children, position = 'top', className = '' }) {
  const [show, setShow] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'bottom-end':
        return 'top-full right-0 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-[-1px]';
      case 'bottom-end':
        return 'bottom-full right-2 mb-[-1px]';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-[-1px]';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-[-1px]';
      case 'top':
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-[-1px]';
    }
  };

  const getArrowBorder = () => {
    switch (position) {
      case 'bottom':
      case 'bottom-end':
        return 'border-4 border-transparent border-b-slate-900';
      case 'left':
        return 'border-4 border-transparent border-l-slate-900';
      case 'right':
        return 'border-4 border-transparent border-r-slate-900';
      case 'top':
      default:
        return 'border-4 border-transparent border-t-slate-900';
    }
  };

  return (
    <span className="relative inline-block">
      <span
        role="button"
        tabIndex={0}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow(!show);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow(!show);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setShow(!show);
          }
        }}
        className={`ml-1 transition-colors inline-flex items-center focus:outline-none cursor-pointer ${className || 'text-slate-500 hover:text-slate-700'}`}
        aria-label="More information"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </span>
      {show && (
        <div className={`absolute z-50 min-w-[200px] max-w-[250px] bg-slate-900 text-white text-xs leading-relaxed rounded-lg px-4 py-3 shadow-xl pointer-events-none whitespace-normal break-words ${getPositionClasses()}`}>
          {text}
          <div className={`absolute ${getArrowClasses()}`}>
            <div className={getArrowBorder()}></div>
          </div>
        </div>
      )}
    </span>
  );
}

export default Tooltip;
