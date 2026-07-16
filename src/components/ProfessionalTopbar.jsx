import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import DeleteAccountModal from './DeleteAccountModal';
import UnsubscribeModal from './UnsubscribeModal';
import { Button, Badge } from './ui';

/**
 * ProfessionalTopbar — Minimal Fintech design system
 */
export default function ProfessionalTopbar({ onToggleSidebar, title }) {
  const { user, isPro } = useAuth();
  // DIAGNOSTIC — remove once useAuth call-site blast radius is confirmed
  useEffect(() => { console.log('[mount] ProfessionalTopbar'); }, []);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 min-h-[60px]">
          {/* Left */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!user ? (
              <Button onClick={() => setShowAuthModal(true)} variant="primary" size="sm">
                Sign In
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {isPro ? (
                  <Badge variant="pro" size="sm">Pro</Badge>
                ) : (
                  <Badge variant="default" size="sm">Free</Badge>
                )}
                <span className="hidden lg:block text-sm text-muted-foreground max-w-[180px] truncate">
                  {user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-loss"
                >
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </Button>
                {isPro && (
                  <Button
                    onClick={() => setShowUnsubscribe(true)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                  >
                    Unsubscribe
                  </Button>
                )}
                <Button
                  onClick={() => setShowDeleteAccount(true)}
                  variant="ghost"
                  size="sm"
                  className="text-loss hover:bg-loss-bg hidden sm:inline-flex"
                >
                  Delete Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

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
      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
      <UnsubscribeModal
        isOpen={showUnsubscribe}
        onClose={() => setShowUnsubscribe(false)}
      />
    </>
  );
}
