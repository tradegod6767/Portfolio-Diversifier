/**
 * MobileHeader — Minimal Fintech design system
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import DeleteAccountModal from './DeleteAccountModal';
import { Badge } from './ui';

export default function MobileHeader({ title, onShowWhatsNew, showUpdateDot }) {
  const { user, isPro } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
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
      <header className="sticky top-0 z-40 md:hidden flex items-center justify-between px-4 py-3 min-h-[56px] bg-card border-b border-border">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-xs">
            RK
          </div>
          <span className="font-semibold text-sm text-foreground">
            {title || 'RebalanceKit'}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user && (
            <Badge variant={isPro ? 'pro' : 'default'} size="sm">
              {isPro ? 'Pro' : 'Free'}
            </Badge>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            {showUpdateDot && !menuOpen && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-gain rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Slide-out menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={menuRef}
            className="fixed top-0 right-0 z-50 w-72 h-full md:hidden bg-card border-l border-border shadow-lg"
            style={{ animation: 'slideDown 200ms ease' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User section */}
            <div className="p-4 border-b border-border">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{isPro ? 'Pro Account' : 'Free Account'}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2 px-3 text-sm font-medium text-loss bg-loss-bg hover:opacity-80 rounded-md transition-opacity"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setShowDeleteAccount(true); }}
                    className="w-full py-2 px-3 text-sm font-medium text-muted-foreground hover:text-loss hover:bg-loss-bg rounded-md transition-colors text-left"
                  >
                    Delete Account
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); setShowAuthModal(true); }}
                  className="w-full h-9 bg-primary text-primary-foreground text-sm font-medium rounded-md transition-opacity hover:opacity-90"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Menu items */}
            <div className="p-2">
              <MenuLink
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="About"
                onClick={() => setMenuOpen(false)}
              />
              <MenuLink
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
                label="What's New"
                badge={showUpdateDot}
                onClick={() => { setMenuOpen(false); onShowWhatsNew?.(); }}
              />
              <div className="my-2 h-px bg-border" />
              <MenuLink
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                label="Terms of Service"
                href="/terms"
                onClick={() => setMenuOpen(false)}
              />
              <MenuLink
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                label="Privacy Policy"
                href="/privacy"
                onClick={() => setMenuOpen(false)}
              />
            </div>
          </div>
        </>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onForgotPassword={() => { setShowAuthModal(false); setShowForgotPassword(true); }}
      />
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </>
  );
}

function MenuLink({ icon, label, badge, onClick, href }) {
  const cls = "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors";

  const content = (
    <>
      {icon}
      <span className="flex-1">{label}</span>
      {badge && <span className="w-2 h-2 bg-gain rounded-full" />}
    </>
  );

  if (href) {
    return <a href={href} className={cls} onClick={onClick}>{content}</a>;
  }
  return <button onClick={onClick} className={cls}>{content}</button>;
}
