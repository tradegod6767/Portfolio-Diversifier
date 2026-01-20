import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { Button, Badge } from './ui';

/**
 * Professional Topbar Component
 * Modern, clean design following RebalanceKit design system
 */
export default function ProfessionalTopbar({ onToggleSidebar, title, onRestartTutorial }) {
  const { user, isPro } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
      <header className="sticky top-0 z-30 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 min-h-[72px]">
          {/* Left Section */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 -ml-2 rounded-md transition-colors flex-shrink-0"
              style={{ color: 'var(--text-primary)' }}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg md:text-xl font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h1>
              {title === 'Calculator' && (
                <span className="hidden lg:inline-block px-2 py-0.5 text-xs font-medium rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  Core Product
                </span>
              )}
            </div>
          </div>

          {/* Right Section - Auth */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Restart Tutorial Button */}
            {onRestartTutorial && (
              <button
                onClick={onRestartTutorial}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                title="Restart onboarding tutorial"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Tutorial</span>
              </button>
            )}

            {!user ? (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="primary"
                size="md"
              >
                Sign In
              </Button>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                {/* Pro/Free Badge */}
                {isPro ? (
                  <Badge variant="pro" size="md">
                    Pro
                  </Badge>
                ) : (
                  <Badge variant="free" size="md">
                    Free
                  </Badge>
                )}

                {/* User Email */}
                <div className="hidden lg:block text-sm text-slate-600 max-w-[180px] truncate font-medium">
                  {user.email}
                </div>

                {/* Sign Out Button */}
                <Button
                  onClick={handleSignOut}
                  variant="secondary"
                  size="md"
                  className="hover:text-red-600 hover:border-red-300"
                >
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onForgotPassword={() => {
          setShowAuthModal(false);
          setShowForgotPassword(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
}
