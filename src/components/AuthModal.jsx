import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login, signup } from '../lib/auth';
import { useToast } from '../context/ToastContext';

function AuthModal({ isOpen, onClose, onSuccess, onForgotPassword }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup(email, password);
        addToast('Check your email to confirm your account!', 'success');
        onClose();
      } else {
        await login(email, password);
        onClose();
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', animation: 'fadeIn 200ms ease' }}
    >
      <div
        className="relative w-full max-w-[440px] bg-card border border-border rounded-xl shadow-lg"
        style={{ animation: 'slideUp 250ms ease' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin'
                ? 'Sign in to access your portfolio'
                : 'Start managing your portfolio today'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-loss-bg border border-loss/30 rounded-md">
              <p className="text-sm text-loss font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 border border-input bg-background rounded-md px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-9 w-full border border-input bg-background rounded-md px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-0 bg-transparent border-none z-10"
                  style={{ color: '#737373' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff size={18} strokeWidth={2} color="currentColor" />
                    : <Eye size={18} strokeWidth={2} color="currentColor" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              )}
              {mode === 'signin' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onForgotPassword?.();
                    }}
                    className="text-sm font-medium text-foreground hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full h-11 bg-primary text-primary-foreground rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'signin' ? (
                <>Don't have an account?{' '}<span className="text-foreground font-semibold">Sign up</span></>
              ) : (
                <>Already have an account?{' '}<span className="text-foreground font-semibold">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AuthModal;
