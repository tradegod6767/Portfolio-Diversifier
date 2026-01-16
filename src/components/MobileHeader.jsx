/**
 * MobileHeader - Mobile-optimized header with hamburger menu
 *
 * Features:
 * - Compact logo and title
 * - Hamburger menu for secondary items
 * - Primary action always visible (Sign In / User)
 * - Slide-out menu panel
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function MobileHeader({
  title,
  onOpenSettings,
  onShowShortcuts,
  onShowWhatsNew,
  onRestartTutorial,
  showUpdateDot
}) {
  const { user, isPro } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  // Close menu on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 md:hidden flex items-center justify-between px-4 py-3 min-h-[56px]"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0A2540] flex items-center justify-center text-white font-bold text-sm">
            RK
          </div>
          <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            {title || 'RebalanceKit'}
          </span>
        </div>

        {/* Right: User status + Menu */}
        <div className="flex items-center gap-2">
          {/* User badge */}
          {user && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isPro
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}>
              {isPro ? 'Pro' : 'Free'}
            </span>
          )}

          {/* Hamburger menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg active:bg-slate-100 transition-colors"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <svg
              className="w-6 h-6 transition-transform duration-200"
              style={{
                color: 'var(--text-primary)',
                transform: menuOpen ? 'rotate(90deg)' : 'none'
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            {/* Update dot */}
            {showUpdateDot && !menuOpen && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Slide-out menu panel */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-200"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu panel */}
          <div
            ref={menuRef}
            className="fixed top-0 right-0 z-50 w-72 h-full md:hidden animate-in slide-in-from-right duration-300"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Menu header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User section */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {user.email}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {isPro ? 'Pro Account' : 'Free Account'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="w-full py-3 px-4 bg-[#0A2540] hover:bg-[#0D2F52] text-white font-semibold rounded-lg transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Menu items */}
            <div className="p-2">
              <MenuItem
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="About"
                onClick={() => {
                  setMenuOpen(false);
                  // Navigate to about
                }}
              />

              <MenuItem
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                }
                label="What's New"
                badge={showUpdateDot}
                onClick={() => {
                  setMenuOpen(false);
                  onShowWhatsNew?.();
                }}
              />

              {onRestartTutorial && (
                <MenuItem
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                  label="Restart Tutorial"
                  onClick={() => {
                    setMenuOpen(false);
                    onRestartTutorial?.();
                  }}
                />
              )}

              <div className="my-2 border-t" style={{ borderColor: 'var(--border-color)' }} />

              <MenuItem
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                label="Terms of Service"
                href="/terms"
                onClick={() => setMenuOpen(false)}
              />

              <MenuItem
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                label="Privacy Policy"
                href="/privacy"
                onClick={() => setMenuOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Menu item component
function MenuItem({ icon, label, badge, onClick, href }) {
  const content = (
    <>
      <span style={{ color: 'var(--text-secondary)' }}>{icon}</span>
      <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{label}</span>
      {badge && (
        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
      )}
    </>
  );

  const className = "w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors text-sm font-medium";

  if (href) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}
