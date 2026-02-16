/*
Minimal Investor Dashboard (single-file React preview)
Drop-in ready App.jsx replacement for a Vite + React + Tailwind project.

How to use:
- Replace your existing src/App.jsx with this file (or extract components into their own files).
- Tailwind is used for styling. This file uses default Tailwind colors (slate/blue) to match "Navy + Slate".
- Swap the placeholder components (ImportPortfolio, Rebalance, etc.) with your actual components. I left small adapters where you can drop them in.

Notes:
- If you have a custom tailwind.config.js with a brand color, replace the utility classes that use 'bg-slate-900' / 'text-slate-50' etc. with your custom token classes.
- The layout is responsive: collapsible sidebar on small screens.
*/

import React, {useState, useCallback, Suspense} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ImportPortfolioPage from "./components/ImportPortfolioPage";
import LoadPortfolioPage from "./components/LoadPortfolioPage";
import PortfolioForm from "./components/PortfolioForm";
import PortfolioHealthScore from "./components/PortfolioHealthScore";
import AllocationCharts from "./components/AllocationCharts";
import PortfolioComparison from "./components/PortfolioComparison";
import ExportButtons from "./components/ExportButtons";
import SavePortfolioModal from "./components/SavePortfolioModal";
import RebalancingResults from "./components/RebalancingResults";
import RebalancingCostEstimate from "./components/RebalancingCostEstimate";
import Toast from "./components/Toast";
import { ToastProvider, useToast } from "./context/ToastContext";
import AuthModal from "./components/AuthModal";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
import { useAuth } from "./hooks/useAuth";
import { calculateRebalancing } from "./utils/calculations";
import ProfessionalTopbar from "./components/ProfessionalTopbar";
import ProfessionalSidebar from "./components/ProfessionalSidebar";
import ProfessionalHero from "./components/ProfessionalHero";
import FinancialDisclaimer from "./components/FinancialDisclaimer";
import KeyboardShortcutsModal from "./components/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import WhatsNewModal from "./components/WhatsNewModal";
import { hasUnseenUpdates } from "./data/changelog";
import AppLoadingSkeleton, { ResultsSkeleton } from "./components/AppLoadingSkeleton";
import MobileBottomNav from "./components/MobileBottomNav";
import MobileHeader from "./components/MobileHeader";
import WelcomeBanner from "./components/WelcomeBanner";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy-loaded pages (not needed on initial render)
const SuccessPage = React.lazy(() => import("./pages/SuccessPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const AuthCallbackPage = React.lazy(() => import("./pages/AuthCallbackPage"));
const TermsOfServicePage = React.lazy(() => import("./pages/TermsOfServicePage"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));

/* ---------- Sidebar nav items ---------- */
const NAV_ITEMS = [
  {key: 'home', label: 'Home'},
  {key: 'calculator', label: 'Calculator'},
  {key: 'about', label: 'About'},
];

/* ---------- Small utility components ---------- */
function IconCircle({children}){
  return (
    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-100 text-sm font-medium shadow-sm">
      {children}
    </div>
  );
}

/* ---------- Footer component ---------- */
function Footer({ onShowShortcuts, onShowWhatsNew, showUpdateDot }){
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800 w-full">
      <div className="max-w-7xl mx-auto px-4">
        {/* Financial Disclaimer */}
        <div className="mb-6">
          <FinancialDisclaimer variant="footer" />
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
          <a href="/terms" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Terms of Service
          </a>
          <span className="hidden sm:inline text-slate-600">|</span>
          <a href="/privacy" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Privacy Policy
          </a>
          <span className="hidden sm:inline text-slate-600">|</span>
          <button
            onClick={onShowShortcuts}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Keyboard Shortcuts
            <kbd className="ml-1 px-1 py-0.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded">?</kbd>
          </button>
          <span className="hidden sm:inline text-slate-600">|</span>
          <button
            onClick={onShowWhatsNew}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 relative"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            What's New
            {showUpdateDot && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Copyright */}
        <div className="flex justify-center items-center">
          <p className="text-sm font-medium">#1 Portfolio Rebalancer for Beginners</p>
        </div>
      </div>
    </footer>
  );
}

function NavItem({item, active, onClick}){
  return (
    <button
      onClick={() => onClick(item.key)}
      className={`flex gap-3 items-center w-full text-left px-4 py-2 rounded-md transition-colors 
        ${active ? 'bg-slate-800 text-slate-50' : 'text-slate-200 hover:bg-slate-800/60 hover:text-slate-50'}`}
    >
      <IconCircle>{item.label.charAt(0)}</IconCircle>
      <span className="text-sm font-medium">{item.label}</span>
    </button>
  );
}

/* ---------- Sidebar component ---------- */
function Sidebar({activeKey, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose}){
  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        flex flex-col bg-slate-900 text-slate-50 h-screen md:h-auto md:min-h-screen transition-all duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex items-center gap-3 px-4 py-4">
          {!collapsed ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold">RK</div>
              <div>
                <div className="text-sm font-semibold">RebalanceKit</div>
                <div className="text-xs text-slate-300">Investor workspace</div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 rounded-md bg-slate-700 flex items-center justify-center text-white font-semibold">RK</div>
            </div>
          )}

          {/* Close button for mobile */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 rounded hover:bg-slate-800"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Desktop toggle */}
          <button
            onClick={onToggle}
            className="hidden md:inline ml-auto p-1 rounded hover:bg-slate-800/50"
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="fill-slate-200"><path d="M4 6h16M4 12h10M4 18h16" strokeWidth="0"/></svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-auto">
          {NAV_ITEMS.map(item => (
            <NavItem key={item.key} item={item} active={item.key === activeKey} onClick={(key) => {
              onNavigate(key);
              onMobileClose(); // Close sidebar on mobile after navigation
            }} />
          ))}
        </nav>
      </aside>
    </>
  );
}

/* ---------- Topbar ---------- */
function Topbar({onToggleSidebar, title}){
  const { user, isPro } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSignOut = () => {
    // Clear storage and reload - this removes the Supabase session
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white border-b border-slate-200 min-h-[60px]">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          {/* Hamburger menu for mobile */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-2 rounded-md hover:bg-slate-100 flex-shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Title - responsive sizing */}
          <h1 className="text-base md:text-lg font-semibold text-slate-900 truncate">{title}</h1>
          <div className="hidden lg:block text-sm text-slate-500">Minimal • Investor</div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {!user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-2 md:px-4 md:py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-sm text-sm md:text-base min-h-[44px]"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              {isPro ? (
                <span className="px-2 py-1 md:px-3 md:py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs md:text-sm font-bold border border-emerald-200">
                  Pro ⭐
                </span>
              ) : (
                <span className="px-2 py-1 md:px-3 md:py-1 bg-slate-100 text-slate-700 rounded-full text-xs md:text-sm font-semibold border border-slate-300">
                  Free
                </span>
              )}
              <div className="text-sm text-slate-600 hidden lg:block max-w-[150px] truncate">
                {user.email}
              </div>
              <button
                onClick={handleSignOut}
                className="px-2 py-2 md:px-3 md:py-2 bg-white hover:bg-red-50 border border-slate-200 rounded-md text-slate-700 hover:text-red-600 hover:border-red-200 transition-colors text-xs md:text-sm font-medium min-h-[44px]"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          )}
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
    </>
  );
}

/* ---------- Generic Card ---------- */
function Card({title, subtitle, children}){
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
        <div className="text-xs text-slate-400">•••</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ---------- Placeholder page components (wrap your real ones here) ---------- */

/* ---------- Page views ---------- */
/* Hero Landing Page */
function HeroView({onNavigate, onLoadExample}){
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 px-2">
            RebalanceKit
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto px-2 leading-relaxed">
            Calculate exact portfolio rebalancing trades in seconds. Tax-efficient add-only mode. No signup required.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center w-full max-w-md mx-auto sm:max-w-none px-2">
          <button
            onClick={onLoadExample}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-base sm:text-lg rounded-xl transition duration-200 shadow-lg min-h-[56px]"
          >
            Try Calculator
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-300 text-slate-700 font-bold text-base sm:text-lg rounded-xl transition duration-200 shadow-sm min-h-[56px]"
          >
            See Example
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-slate-200">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-slate-900 mb-2">Add-Only Mode</h3>
            <p className="text-sm text-slate-600">Avoid triggering capital gains taxes</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-3">💯</div>
            <h3 className="font-bold text-slate-900 mb-2">Health Score</h3>
            <p className="text-sm text-slate-600">Know your portfolio's risk level</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-3">📑</div>
            <h3 className="font-bold text-slate-900 mb-2">PDF Reports</h3>
            <p className="text-sm text-slate-600">Export professional summaries</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Calculator View - Main Portfolio Calculator */
function CalculatorView({onCalculate, onCalculateStart, rebalanceResults, loadedPositions, onLoadClick, onImportClick, user, isPro, loading, calculating, onLoadExample}){
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner user={user} onLoadExample={onLoadExample} />

      {/* Portfolio Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 w-full max-w-full">
        <PortfolioForm
          onCalculate={onCalculate}
          onCalculateStart={onCalculateStart}
          onImportClick={onImportClick}
          onLoadClick={onLoadClick}
          loadedPositions={loadedPositions}
          user={user}
          isPro={isPro}
        />
      </div>

      {/* Results Section */}
      {calculating ? (
        /* Loading skeleton while calculating */
        <ResultsSkeleton />
      ) : rebalanceResults ? (
        <div className="space-y-6">
          <RebalancingResults
            results={rebalanceResults}
            user={user}
            isPro={isPro}
            loading={loading}
          />
        </div>
      ) : (
        /* Pre-calculation empty state */
        <div className="rounded-xl shadow-sm border p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="text-center py-6">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <svg className="w-10 h-10" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Ready to rebalance
            </h3>
            <p className="text-base mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Enter your holdings above and click "Calculate Rebalancing" to see your recommended trades.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Add your ticker symbols</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Enter current values</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Set target allocations</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Collapsible Section Component */
function CollapsibleSection({ title, icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-5 py-4 flex items-center justify-between transition-colors"
        style={{ backgroundColor: isOpen ? 'var(--bg-secondary)' : 'var(--bg-card)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 py-4" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* About Page */
function AboutView(){
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="rounded-xl shadow-sm border p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>About RebalanceKit</h2>

        <div className="space-y-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p>
            RebalanceKit helps investors calculate exact rebalancing trades to maintain their target portfolio allocations.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>Key Features</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Add-Only Mode:</strong> Only buy positions, never sell. Useful for avoiding capital gains taxes.</li>
            <li><strong>Health Score:</strong> Measures portfolio concentration and drift risk (0-100).</li>
            <li><strong>Model Portfolios:</strong> Compare to popular strategies like 3-fund or 60/40.</li>
            <li><strong>PDF Reports:</strong> Export professional summaries with charts and analysis.</li>
            <li><strong>AI Analysis:</strong> Get intelligent insights powered by Claude AI.</li>
            <li><strong>Multiple Modes:</strong> Standard rebalancing, contributions, withdrawals, add-only, or sell-only.</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>Example Portfolio</h3>
          <p>
            Try the calculator with our example portfolio to see how it works:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>VTI (US Stocks) - $38,000 / 60% target</li>
            <li>BND (Bonds) - $8,500 / 30% target</li>
            <li>CASH - $3,500 / 10% target</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>Privacy & Security</h3>
          <p>
            Your portfolio data is stored locally in your browser. We don't collect or store your financial information on our servers.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="rounded-xl shadow-sm border p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>How It Works</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Learn about the methodology behind RebalanceKit's calculations and features.
        </p>

        <div className="space-y-4">
          {/* How We Calculate Rebalancing */}
          <CollapsibleSection title="How We Calculate Rebalancing" icon="🧮" defaultOpen={true}>
            <div className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <p>
                Our rebalancing algorithm follows a straightforward process to help you reach your target allocation:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li><strong>Compare allocations:</strong> We calculate your current percentage in each holding and compare it to your targets.</li>
                <li><strong>Identify drift:</strong> Holdings that are over-weight (above target) or under-weight (below target) are flagged.</li>
                <li><strong>Calculate trades:</strong> We determine the minimum dollar amounts to buy or sell for each position to reach your targets.</li>
                <li><strong>Apply your mode:</strong> Depending on your choice (standard, add-only, contribution, or withdrawal), we adjust recommendations accordingly.</li>
              </ol>
              <p className="text-sm pt-2" style={{ color: 'var(--text-muted)' }}>
                Add-only mode only suggests purchases, helping you avoid selling and triggering capital gains taxes.
              </p>
            </div>
          </CollapsibleSection>

          {/* Understanding Your Health Score */}
          <CollapsibleSection title="Understanding Your Health Score" icon="💯">
            <div className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <p>
                Your portfolio health score (0-100) measures how well-balanced and diversified your portfolio is:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
                  <div className="font-semibold" style={{ color: 'var(--success)' }}>80-100: Excellent</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Well-diversified, close to targets</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
                  <div className="font-semibold" style={{ color: 'var(--info)' }}>60-79: Good</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Minor drift, consider rebalancing</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}>
                  <div className="font-semibold" style={{ color: 'var(--warning)' }}>40-59: Fair</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Noticeable drift, rebalancing recommended</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
                  <div className="font-semibold" style={{ color: 'var(--error)' }}>0-39: Needs Attention</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Significant drift or concentration risk</div>
                </div>
              </div>
              <p><strong>Factors that affect your score:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Allocation drift:</strong> How far each holding is from its target percentage</li>
                <li><strong>Concentration risk:</strong> Penalty if any single holding exceeds 40% of portfolio</li>
                <li><strong>Diversification:</strong> More holdings generally improve your score</li>
              </ul>
              <p className="text-sm pt-2" style={{ color: 'var(--text-muted)' }}>
                Improve your score by rebalancing to reduce drift and avoiding over-concentration in any single position.
              </p>
            </div>
          </CollapsibleSection>

          {/* AI Analysis */}
          <CollapsibleSection title="AI Analysis" icon="🤖">
            <div className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <p>
                RebalanceKit uses Claude, Anthropic's AI assistant, to provide personalized insights about your portfolio:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Portfolio assessment:</strong> Overall evaluation of your current allocation and diversification</li>
                <li><strong>Risk analysis:</strong> Identification of concentration risks or imbalances</li>
                <li><strong>Actionable suggestions:</strong> Clear recommendations based on your specific situation</li>
                <li><strong>Educational context:</strong> Explanations to help you understand the reasoning</li>
              </ul>
              <div className="mt-4 p-3 rounded-lg flex items-start gap-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Privacy Note</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Your portfolio data is only used for this analysis and is not stored. Each analysis is independent and your financial information is never retained.
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main App Content ---------- */
function MainApp(){
  const [active, setActive] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth state
  const { user, isPro, loading } = useAuth();

  // Toast notifications
  const { addToast } = useToast();

  // Portfolio state management
  const [rebalanceResults, setRebalanceResults] = useState(null);
  const [loadedPositions, setLoadedPositions] = useState([]);
  const [calculating, setCalculating] = useState(false);

  // Keyboard shortcuts modal state
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // What's New modal state
  const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(() => hasUnseenUpdates());

  // Keyboard shortcut handlers
  const shortcutHandlers = {
    onAddHolding: useCallback(() => {
      if (active !== 'calculator') {
        setActive('calculator');
        addToast('Navigated to calculator', 'info', 2000);
      }
      // Focus the first empty ticker input after a short delay
      setTimeout(() => {
        const tickerInputs = document.querySelectorAll('input[placeholder="AAPL"]');
        const emptyInput = Array.from(tickerInputs).find(input => !input.value);
        if (emptyInput) {
          emptyInput.focus();
        } else if (tickerInputs.length > 0) {
          // If all inputs have values, focus the last one
          tickerInputs[tickerInputs.length - 1].focus();
        }
      }, 100);
    }, [active, addToast]),

    onRunRebalance: useCallback(() => {
      if (active !== 'calculator') {
        addToast('Navigate to calculator first (press N)', 'info', 2000);
        return;
      }
      // Find and click the submit button
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.click();
      }
    }, [active, addToast]),

    onSavePortfolio: useCallback(() => {
      if (active !== 'calculator') {
        addToast('Navigate to calculator first (press N)', 'info', 2000);
        return;
      }
      // Find and click the save button
      const saveBtn = document.querySelector('.portfolio-save-btn');
      if (saveBtn) {
        saveBtn.click();
      }
    }, [active, addToast]),

    onShowShortcuts: useCallback(() => {
      setShowShortcutsModal(true);
    }, []),

    onEscape: useCallback(() => {
      // Close any open modal
      if (showShortcutsModal) {
        setShowShortcutsModal(false);
      }
    }, [showShortcutsModal]),
  };

  // Enable keyboard shortcuts
  useKeyboardShortcuts(shortcutHandlers, true);

  // Handler functions
  function handleCalculate(results) {
    setRebalanceResults(results);
    setCalculating(false);
  }

  function handleCalculateStart() {
    setCalculating(true);
  }

  function handleLoadExample() {
    // Load example portfolio
    const examplePositions = [
      { id: 1, ticker: 'VTI', amount: '38000', targetPercent: '60' },
      { id: 2, ticker: 'BND', amount: '8500', targetPercent: '30' },
      { id: 3, ticker: 'CASH', amount: '3500', targetPercent: '10' }
    ];
    setLoadedPositions(examplePositions);

    // Auto-calculate the example
    const results = calculateRebalancing(examplePositions, 'standard', 0);
    setRebalanceResults(results);

    // Navigate to calculator
    setActive('calculator');
  }

  function handleLoadClick() {
    // Navigate to Load Portfolio page
    setActive('load');
  }

  function handleImportClick() {
    // Navigate to Import Portfolio page
    setActive('import');
  }

  function handleBack(loadedPositions) {
    if (loadedPositions && loadedPositions.length > 0) {
      // Automatically calculate rebalancing when portfolio is loaded
      const results = calculateRebalancing(loadedPositions, 'standard', 0);
      setRebalanceResults(results);
      setLoadedPositions(loadedPositions);
    }
    setActive('calculator');
  }

  function renderActive(){
    switch(active){
      case 'home': return <ProfessionalHero onNavigate={setActive} onLoadExample={handleLoadExample} />;
      case 'calculator': return <CalculatorView
        onCalculate={handleCalculate}
        onCalculateStart={handleCalculateStart}
        rebalanceResults={rebalanceResults}
        loadedPositions={loadedPositions}
        onLoadClick={handleLoadClick}
        onImportClick={handleImportClick}
        user={user}
        isPro={isPro}
        loading={loading}
        calculating={calculating}
        onLoadExample={handleLoadExample}
      />;
      case 'load': return <LoadPortfolioPage onBack={handleBack} user={user} isPro={isPro} />;
      case 'import': return <ImportPortfolioPage onBack={handleBack} />;
      case 'about': return <AboutView />;
      default: return <ProfessionalHero onNavigate={setActive} onLoadExample={handleLoadExample} />;
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* What's New Modal */}
      <WhatsNewModal
        isOpen={showWhatsNewModal}
        onClose={() => {
          setShowWhatsNewModal(false);
          setHasUpdates(false); // Clear the notification dot
        }}
      />

      {/* Desktop Sidebar - hidden on mobile */}
      <ProfessionalSidebar
        activeKey={active}
        onNavigate={setActive}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(s => !s)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header - only visible on mobile */}
        <MobileHeader
          title={NAV_ITEMS.find(n => n.key === active)?.label || 'RebalanceKit'}
          onShowWhatsNew={() => setShowWhatsNewModal(true)}
          showUpdateDot={hasUpdates}
        />

        {/* Desktop Topbar - hidden on mobile */}
        <div className="hidden md:block">
          <ProfessionalTopbar
            onToggleSidebar={() => setMobileMenuOpen(true)}
            title={NAV_ITEMS.find(n => n.key === active)?.label || 'Home'}
          />
        </div>

        {/* Main content area - add padding bottom for mobile nav + sticky button */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-8 max-w-full">
          <div key={active} className="animate-fade-in">
            {renderActive()}
          </div>
        </main>

        {/* Desktop Footer - hidden on mobile */}
        <div className="hidden md:block">
          <Footer
            onShowShortcuts={() => setShowShortcutsModal(true)}
            onShowWhatsNew={() => setShowWhatsNewModal(true)}
            showUpdateDot={hasUpdates}
          />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeKey={active}
        onNavigate={setActive}
        onOpenSettings={() => setShowShortcutsModal(true)}
      />

    </div>
  );
}
/* ---------- App with Router ---------- */
export default function App(){
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <Suspense fallback={<AppLoadingSkeleton />}>
            <Routes>
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/" element={<MainApp />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Toast />
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  );
}
