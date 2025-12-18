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
import { groupByAssetClass } from "./utils/assetClasses";

/* ---------- Sidebar nav items ---------- */
const NAV_ITEMS = [
  {key: 'dashboard', label: 'Dashboard'},
  {key: 'import', label: 'Import Portfolio'},
  {key: 'load', label: 'Load Portfolio'},
  {key: 'rebalance', label: 'Rebalance'},
  {key: 'health', label: 'Health Score'},
  {key: 'charts', label: 'Allocation Charts'},
  {key: 'comparison', label: 'Comparison'},
  {key: 'export', label: 'Export / Save'},
  {key: 'billing', label: 'Billing'},
];

/* ---------- Small utility components ---------- */
function IconCircle({children}){
  return (
    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-100 text-sm font-medium shadow-sm">
      {children}
    </div>
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
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold">PR</div>
            <div>
              <div className="text-sm font-semibold">Portfolio Rebalancer</div>
              <div className="text-xs text-slate-300">Investor workspace</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-md bg-slate-700 flex items-center justify-center text-white font-semibold">PR</div>
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

      <div className="px-3 py-4 border-t border-slate-800">
        <div className={`px-2 ${collapsed ? 'text-center' : ''}`}>
          <button className="w-full flex items-center gap-3 text-sm text-slate-200 hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" className="fill-slate-200"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zM6 20v-1c0-2.21 3.58-4 6-4s6 1.79 6 4v1H6z"/></svg>
            {!collapsed && <span>Account</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Topbar ---------- */
function Topbar({onToggleSidebar, title}){
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-transparent border-b border-slate-100/8">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="sm:hidden p-2 rounded-md bg-slate-100/6">
          <svg width="20" height="20" viewBox="0 0 24 24" className="fill-slate-100"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <div className="text-sm text-slate-500">Minimal • Investor</div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-sm text-slate-600">USD</div>
          <button className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm">Settings</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600">Signed in as <span className="font-medium text-slate-800">Investor</span></div>
          <button className="px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700">Sign out</button>
        </div>
      </div>
    </header>
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
function DashboardView({portfolio, rebalanceResults}){
  const hasHoldings = portfolio?.holdings && portfolio.holdings.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Portfolio" subtitle="Market value">
          <div className="text-2xl font-semibold text-slate-800">
            ${portfolio?.holdings?.reduce((sum, h) => sum + (h.currentValue || 0), 0).toLocaleString() || '0'}
          </div>
          <div className="text-sm text-slate-500 mt-2">
            {portfolio?.holdings?.length || 0} holdings
          </div>
        </Card>

        <Card title="Health Score" subtitle="Overall portfolio risk">
          {hasHoldings ? (
            <PortfolioHealthScore positions={portfolio.holdings} />
          ) : (
            <div className="text-sm text-slate-600 py-4">Add holdings to see health score</div>
          )}
        </Card>

        <Card title="Estimated Rebalance Cost" subtitle="Fees & taxes estimate">
          {rebalanceResults ? (
            <RebalancingCostEstimate results={rebalanceResults} />
          ) : (
            <div className="text-sm text-slate-600 py-4">Run rebalance to see cost estimate</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Allocation Chart" subtitle="Current vs target">
          {hasHoldings ? (
            <AllocationCharts positions={portfolio.holdings} />
          ) : (
            <div className="text-sm text-slate-600 py-4">Add holdings to see allocation chart</div>
          )}
        </Card>

        <Card title="Recent Rebalances" subtitle="Latest actions">
          {rebalanceResults ? (
            <RebalancingResults results={rebalanceResults} />
          ) : (
            <div className="text-sm text-slate-600 py-4">No rebalance results yet</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Portfolio Comparison">
          {hasHoldings ? (
            <PortfolioComparison groupedPositions={groupByAssetClass(portfolio.holdings)} />
          ) : (
            <div className="text-sm text-slate-600 py-4">Add holdings to compare portfolios</div>
          )}
        </Card>

        <Card title="Import / Export">
          <div className="text-sm text-slate-600 py-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Import Portfolio
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ImportView({onBack}){
  return (
    <div className="space-y-4">
      <Card title="Import Portfolio">
        <ImportPortfolioPage onBack={onBack} />
      </Card>
    </div>
  );
}

function LoadView({onBack}){
  return (
    <div className="space-y-4">
      <Card title="Load Saved Portfolios">
        <LoadPortfolioPage onBack={onBack} />
      </Card>
    </div>
  );
}

function RebalanceView({onCalculate, onImportClick, onLoadClick, loadedPositions}){
  return (
    <div className="space-y-4">
      <Card title="Rebalance" subtitle="Run suggested actions">
        <PortfolioForm
          onCalculate={onCalculate}
          onImportClick={onImportClick}
          onLoadClick={onLoadClick}
          loadedPositions={loadedPositions}
        />
      </Card>
    </div>
  );
}

function HealthView({portfolio}){
  return (
    <div className="space-y-4">
      <Card title="Portfolio Health Score">
        <PortfolioHealthScore positions={portfolio.holdings} />
      </Card>
    </div>
  );
}

function ChartsView({portfolio}){
  return (
    <div className="space-y-4">
      <Card title="Allocation Charts">
        <AllocationCharts positions={portfolio.holdings} />
      </Card>
    </div>
  );
}

function ComparisonView({portfolio}){
  return (
    <div className="space-y-4">
      <Card title="Portfolio Comparison">
        <PortfolioComparison groupedPositions={groupByAssetClass(portfolio.holdings || [])} />
      </Card>
    </div>
  );
}

function ExportView({portfolio, showSaveModal, setShowSaveModal}){
  return (
    <div className="space-y-4">
      <Card title="Export & Save">
        <ExportButtons portfolio={portfolio} />
        {showSaveModal && <SavePortfolioModal onClose={() => setShowSaveModal(false)} />}
      </Card>
    </div>
  );
}

function BillingView(){
  return (
    <div className="space-y-4">
      <Card title="Billing & Stripe">
        <StripePayment />
      </Card>
    </div>
  );
}

/* ---------- Main App ---------- */
export default function App(){
  const [active, setActive] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Portfolio state management
  const [portfolio, setPortfolio] = useState({ holdings: [], targetAllocations: {} });
  const [rebalanceResults, setRebalanceResults] = useState(null);
  const [loadedPositions, setLoadedPositions] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Handler functions
  function handleCalculate(results) {
    setRebalanceResults(results);
    setActive('dashboard');
  }

  function handleImportClick() {
    setActive('import');
  }

  function handleLoadClick() {
    setActive('load');
  }

  function handleBack() {
    setActive('dashboard');
  }

  function renderActive(){
    switch(active){
      case 'dashboard': return <DashboardView portfolio={portfolio} rebalanceResults={rebalanceResults} />;
      case 'import': return <ImportView onBack={handleBack} />;
      case 'load': return <LoadView onBack={handleBack} />;
      case 'rebalance': return <RebalanceView
        onCalculate={handleCalculate}
        onImportClick={handleImportClick}
        onLoadClick={handleLoadClick}
        loadedPositions={loadedPositions}
      />;
      case 'health': return <HealthView portfolio={portfolio} />;
      case 'charts': return <ChartsView portfolio={portfolio} />;
      case 'comparison': return <ComparisonView portfolio={portfolio} />;
      case 'export': return <ExportView
        portfolio={portfolio}
        showSaveModal={showSaveModal}
        setShowSaveModal={setShowSaveModal}
      />;
      case 'billing': return <BillingView />;
      default: return <DashboardView portfolio={portfolio} rebalanceResults={rebalanceResults} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex h-screen">
        <Sidebar activeKey={active} onNavigate={setActive} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(s => !s)} />

        <div className="flex-1 flex flex-col">
          <Topbar onToggleSidebar={() => setSidebarCollapsed(s => !s)} title={NAV_ITEMS.find(n => n.key === active)?.label || 'Dashboard'} />

          <main className="p-6 overflow-auto">
            {renderActive()}
          </main>
        </div>
      </div>
    </div>
  );
}
