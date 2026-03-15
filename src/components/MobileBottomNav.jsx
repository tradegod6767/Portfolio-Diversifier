/**
 * MobileBottomNav — Minimal Fintech design system
 */

import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Home',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: 'calculator',
    label: 'Rebalance',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'load',
    label: 'Saved',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function useKeyboardVisible() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const viewport = window.visualViewport;
      const initialHeight = viewport.height;
      const handleResize = () => {
        setKeyboardVisible(initialHeight - viewport.height > 150);
      };
      viewport.addEventListener('resize', handleResize);
      return () => viewport.removeEventListener('resize', handleResize);
    }

    const handleFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') setKeyboardVisible(true);
    };
    const handleFocusOut = () => {
      setTimeout(() => {
        const el = document.activeElement;
        if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') setKeyboardVisible(false);
      }, 100);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return isKeyboardVisible;
}

export default function MobileBottomNav({ activeKey, onNavigate, onOpenSettings }) {
  const isKeyboardVisible = useKeyboardVisible();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isMobile || isKeyboardVisible) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activeKey;

          const handleClick = () => {
            if (item.key === 'settings') {
              onOpenSettings?.();
            } else {
              onNavigate(item.key);
            }
          };

          return (
            <button
              key={item.key}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-[64px] transition-colors active:scale-95 ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {item.icon(isActive)}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-foreground" />
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { useKeyboardVisible };
