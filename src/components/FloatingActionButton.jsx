/**
 * FloatingActionButton (FAB) - Quick action button for mobile
 *
 * Features:
 * - Fixed position bottom-right
 * - Only shows on relevant screens (calculator)
 * - Hidden when keyboard is open
 * - Haptic-style press feedback
 * - Safe area inset support
 */

import { useState, useEffect } from 'react';
import { useKeyboardVisible } from './MobileBottomNav';

export default function FloatingActionButton({
  onClick,
  icon,
  label = 'Add',
  show = true,
  bottomOffset = 80 // Default offset for bottom nav
}) {
  const isKeyboardVisible = useKeyboardVisible();
  const [isPressed, setIsPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on desktop or when keyboard is visible
  if (!isMobile || isKeyboardVisible || !show) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`fixed z-40 md:hidden flex items-center justify-center transition-all duration-200 ${
        isPressed ? 'scale-90' : 'scale-100 hover:scale-105'
      }`}
      style={{
        right: '16px',
        bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0))`,
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        backgroundColor: '#0A2540',
        boxShadow: isPressed
          ? '0 2px 8px rgba(10, 37, 64, 0.3)'
          : '0 4px 16px rgba(10, 37, 64, 0.4)',
        color: 'white'
      }}
      aria-label={label}
    >
      {icon || (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )}
    </button>
  );
}

/**
 * ExpandableFAB - FAB with expandable menu options
 */
export function ExpandableFAB({
  actions = [],
  show = true,
  bottomOffset = 80
}) {
  const isKeyboardVisible = useKeyboardVisible();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isExpanded) return;

    const handleClick = (e) => {
      if (!e.target.closest('.fab-container')) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isExpanded]);

  if (!isMobile || isKeyboardVisible || !show) {
    return null;
  }

  return (
    <div
      className="fab-container fixed z-40 md:hidden"
      style={{
        right: '16px',
        bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0))`
      }}
    >
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Action buttons */}
      <div className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ${
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick();
              setIsExpanded(false);
            }}
            className="flex items-center gap-3 transition-all duration-200 active:scale-95"
            style={{
              transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
            }}
          >
            <span
              className="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              {action.label}
            </span>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: action.color || '#0A2540',
                color: 'white'
              }}
            >
              {action.icon}
            </div>
          </button>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-center transition-all duration-300 ${
          isExpanded ? 'rotate-45' : ''
        }`}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: '#0A2540',
          boxShadow: '0 4px 16px rgba(10, 37, 64, 0.4)',
          color: 'white'
        }}
        aria-label={isExpanded ? 'Close menu' : 'Open menu'}
        aria-expanded={isExpanded}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
}
