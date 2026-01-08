/**
 * Professional Sidebar Component
 * Modern navigation with clean design
 */

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'calculator', label: 'Calculator', icon: 'calculator' },
  { key: 'about', label: 'About', icon: 'info' },
];

// Professional icon components
const Icons = {
  home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  calculator: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function NavItem({ item, active, onClick }) {
  const Icon = Icons[item.icon] || Icons.info;

  return (
    <button
      onClick={() => onClick(item.key)}
      className={`
        group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
        font-medium text-sm transition-all duration-150
        ${active
          ? 'bg-[#0A2540] text-white shadow-md'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      <span className={`transition-transform duration-150 ${active ? '' : 'group-hover:scale-110'}`}>
        <Icon />
      </span>
      <span className="truncate">{item.label}</span>
    </button>
  );
}

export default function ProfessionalSidebar({
  activeKey,
  onNavigate,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onMobileClose}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          flex flex-col bg-[#0D2F52] text-white
          h-screen md:h-auto md:min-h-screen
          transition-all duration-300 ease-in-out
          shadow-xl md:shadow-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
          {!collapsed ? (
            <div className="flex items-center gap-3 flex-1">
              {/* Logo */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00B892] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">RK</span>
              </div>
              {/* Brand */}
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">RebalanceKit</div>
                <div className="text-xs text-slate-400">Portfolio Tools</div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00B892] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">R</span>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-md hover:bg-slate-700 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Desktop Toggle */}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="hidden md:inline p-1.5 rounded-md hover:bg-slate-700 transition-colors"
              aria-label="Toggle sidebar"
              title="Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.key}
              item={item}
              active={item.key === activeKey}
              onClick={(key) => {
                onNavigate(key);
                onMobileClose();
              }}
            />
          ))}
        </nav>

        {/* Footer - Expand Button (when collapsed) */}
        {collapsed && (
          <div className="p-3 border-t border-slate-700/50">
            <button
              onClick={onToggle}
              className="w-full p-2 rounded-md hover:bg-slate-700 transition-colors flex items-center justify-center"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Footer - Pro Badge */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-700/50">
            <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-xs font-semibold text-slate-400 mb-1">
                UPGRADE TO PRO
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                Unlock tax optimization, PDF reports, and more
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
