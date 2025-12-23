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

import React, {useState} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ImportPortfolioPage from "./components/ImportPortfolioPage";
import LoadPortfolioPage from "./components/LoadPortfolioPage";
import PortfolioForm from "./components/PortfolioForm";
import PortfolioHealthScore from "./components/PortfolioHealthScore";
import AllocationCharts from "./components/AllocationCharts";
import PortfolioComparison from "./components/PortfolioComparison";
import ExportButtons from "./components/ExportButtons";
import SavePortfolioModal from "./components/SavePortfolioModal";
import StripePayment from "./components/StripePayment";
import RebalancingResults from "./components/RebalancingResults";
import RebalancingCostEstimate from "./components/RebalancingCostEstimate";
import SuccessPage from "./pages/SuccessPage";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./hooks/useAuth";
import { supabase } from './lib/supabase';
import { groupByAssetClass } from "./utils/assetClasses";
import { calculateRebalancing } from "./utils/calculations";

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

/* ---------- Tooltip component ---------- */
function Tooltip({children, text}){
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="ml-1 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>
      {show && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Footer component ---------- */
function Footer(){
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800 w-full">
      <div className="flex justify-center items-center">
        <p className="text-sm font-medium">#1 Portfolio Rebalancer for Beginners</p>
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
function Sidebar({activeKey, onNavigate, collapsed, onToggle}){
  return (
    <aside className={`flex flex-col ${collapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-50 h-full transition-width duration-200`}>
      <div className="flex items-center gap-3 px-4 py-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
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
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded hover:bg-slate-800/50 hidden sm:inline"
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="fill-slate-200"><path d="M4 6h16M4 12h10M4 18h16" strokeWidth="0"/></svg>
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-auto">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.key} item={item} active={item.key === activeKey} onClick={onNavigate} />
        ))}
      </nav>
    </aside>
  );
}

/* ---------- Topbar ---------- */
function Topbar({onToggleSidebar, title}){
  const { user, isPro } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    console.log('[App] Sign out clicked')

    try {
      // Use scope: 'local' to sign out locally without calling the server
      // This should be instant and never hang
      console.log('[App] Calling supabase.auth.signOut({ scope: "local" })...')
      const { error } = await supabase.auth.signOut({ scope: 'local' })

      if (error) {
        console.error('[App] Sign out error:', error)
      } else {
        console.log('[App] Sign out successful')
      }
    } catch (error) {
      console.error('[App] Sign out exception:', error)
    }

    // Clear all storage
    console.log('[App] Clearing all storage...')
    localStorage.clear()
    sessionStorage.clear()

    // Reload page immediately
    console.log('[App] Reloading page...')
    window.location.href = '/'
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 bg-transparent border-b border-slate-100/8">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="sm:hidden p-2 rounded-md bg-slate-100/6">
            <svg width="20" height="20" viewBox="0 0 24 24" className="fill-slate-100"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <div className="text-sm text-slate-500">Minimal • Investor</div>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {isPro ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold border border-emerald-200">
                  Pro ⭐
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold border border-slate-300">
                  Free
                </span>
              )}
              <div className="text-sm text-slate-600 hidden md:block">
                {user.email}
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 bg-white hover:bg-red-50 border border-slate-200 rounded-md text-slate-700 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
            RebalanceKit
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto">
            Calculate exact portfolio rebalancing trades in seconds. Tax-efficient add-only mode. No signup required.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onLoadExample}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-xl transition duration-200 shadow-lg"
          >
            Try Calculator
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="px-8 py-4 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-700 font-bold text-lg rounded-xl transition duration-200 shadow-sm"
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
function CalculatorView({onCalculate, rebalanceResults, loadedPositions, onLoadClick, user, isPro, loading}){
  return (
    <div className="space-y-6">
      {/* Portfolio Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <PortfolioForm
          onCalculate={onCalculate}
          onImportClick={() => {}} // Removed import functionality from nav
          onLoadClick={onLoadClick}
          loadedPositions={loadedPositions}
        />
      </div>

      {/* Results Section */}
      {rebalanceResults && (
        <div className="space-y-6">
          <RebalancingResults
            results={rebalanceResults}
            user={user}
            isPro={isPro}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

/* About Page */
function AboutView(){
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">About RebalanceKit</h2>

        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            RebalanceKit helps investors calculate exact rebalancing trades to maintain their target portfolio allocations.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Key Features</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Add-Only Mode:</strong> Only buy positions, never sell. Useful for avoiding capital gains taxes.</li>
            <li><strong>Health Score:</strong> Measures portfolio concentration and drift risk (0-100).</li>
            <li><strong>Model Portfolios:</strong> Compare to popular strategies like 3-fund or 60/40.</li>
            <li><strong>PDF Reports:</strong> Export professional summaries with charts and analysis.</li>
            <li><strong>AI Analysis:</strong> Get intelligent insights powered by Claude AI.</li>
            <li><strong>Multiple Modes:</strong> Standard rebalancing, contributions, withdrawals, add-only, or sell-only.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Example Portfolio</h3>
          <p>
            Try the calculator with our example portfolio to see how it works:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>VTI (US Stocks) - $30,000 / 60% target</li>
            <li>BND (Bonds) - $15,000 / 30% target</li>
            <li>CASH - $5,000 / 10% target</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Privacy & Security</h3>
          <p>
            Your portfolio data is stored locally in your browser. We don't collect or store your financial information on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main App Content ---------- */
function MainApp(){
  const [active, setActive] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auth state
  const { user, isPro, loading } = useAuth();

  // Portfolio state management
  const [portfolio, setPortfolio] = useState({ holdings: [], targetAllocations: {} });
  const [rebalanceResults, setRebalanceResults] = useState(null);
  const [loadedPositions, setLoadedPositions] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Handler functions
  function handleCalculate(results) {
    setRebalanceResults(results);
  }

  function handleLoadExample() {
    // Load example portfolio
    const examplePositions = [
      { id: 1, ticker: 'VTI', amount: '30000', targetPercent: '60' },
      { id: 2, ticker: 'BND', amount: '15000', targetPercent: '30' },
      { id: 3, ticker: 'CASH', amount: '5000', targetPercent: '10' }
    ];
    setLoadedPositions(examplePositions);

    // Auto-calculate the example
    const results = calculateRebalancing(examplePositions, 'standard', 0);
    setRebalanceResults(results);

    // Navigate to calculator
    setActive('calculator');
  }

  function handleLoadClick() {
    // Open load portfolio modal - for now, just navigate
    setActive('calculator');
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
      case 'home': return <HeroView onNavigate={setActive} onLoadExample={handleLoadExample} />;
      case 'calculator': return <CalculatorView
        onCalculate={handleCalculate}
        rebalanceResults={rebalanceResults}
        loadedPositions={loadedPositions}
        onLoadClick={handleLoadClick}
        user={user}
        isPro={isPro}
        loading={loading}
      />;
      case 'about': return <AboutView />;
      default: return <HeroView onNavigate={setActive} onLoadExample={handleLoadExample} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <div className="flex flex-1">
        <Sidebar activeKey={active} onNavigate={setActive} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(s => !s)} />

        <div className="flex-1 flex flex-col">
          <Topbar onToggleSidebar={() => setSidebarCollapsed(s => !s)} title={NAV_ITEMS.find(n => n.key === active)?.label || 'Home'} />

          <main className="flex-1 p-6 overflow-auto">
            {renderActive()}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ---------- App with Router ---------- */
export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}
