/**
 * ProfessionalSidebar — Minimal Fintech design system
 */

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'calculator', label: 'Calculator', icon: 'calculator' },
  { key: 'about', label: 'About', icon: 'info' },
];

const Icons = {
  home: () => (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  calculator: () => (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  info: () => (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chevronLeft: () => (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: () => (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

function NavItem({ item, active, onClick, collapsed }) {
  const Icon = Icons[item.icon] || Icons.info;

  return (
    <button
      onClick={() => onClick(item.key)}
      title={collapsed ? item.label : undefined}
      className={`flex items-center w-full rounded-md text-sm font-medium transition-colors
        ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'}
        ${active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
    >
      <Icon />
      {!collapsed && <span className="truncate">{item.label}</span>}
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
  const ChevronIcon = collapsed ? Icons.chevronRight : Icons.chevronLeft;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          flex flex-col bg-card border-r border-border
          h-screen md:h-auto md:min-h-screen
          transition-[width] duration-300 ease-in-out
          shadow-lg md:shadow-none overflow-hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Header — height matches topbar min-h-[60px] so borders align */}
        <div className={`flex items-center border-b border-border flex-shrink-0 h-[60px]
          ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'}`}
        >
          {collapsed ? (
            /* Collapsed: just the badge, centered */
            <div className="w-8 h-8 rounded-md bg-[#10B981] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">RK</span>
            </div>
          ) : (
            /* Expanded: badge + text + collapse button + mobile close */
            <>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-md bg-[#10B981] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">RK</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">RebalanceKit</div>
                  <div className="text-xs text-muted-foreground">Portfolio Tools</div>
                </div>
              </div>

              {/* Mobile Close */}
              <button
                onClick={onMobileClose}
                className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <Icons.close />
              </button>

              {/* Desktop collapse button */}
              <button
                onClick={onToggle}
                className="hidden md:flex p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronIcon />
              </button>
            </>
          )}
        </div>

        {collapsed ? (
          /* ── Collapsed layout: nav icons + expand button, no flex-grow ── */
          <div className="py-4 px-2 space-y-1">
            {NAV_ITEMS.map(item => (
              <NavItem
                key={item.key}
                item={item}
                active={item.key === activeKey}
                collapsed={true}
                onClick={(key) => {
                  onNavigate(key);
                  onMobileClose();
                }}
              />
            ))}
            {/* Expand button — immediately after nav items */}
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-full py-3 mt-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Expand sidebar"
            >
              <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          /* ── Expanded layout: scrollable nav + footer ── */
          <>
            <nav
              aria-label="Main navigation"
              className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden"
            >
              {NAV_ITEMS.map(item => (
                <NavItem
                  key={item.key}
                  item={item}
                  active={item.key === activeKey}
                  collapsed={false}
                  onClick={(key) => {
                    onNavigate(key);
                    onMobileClose();
                  }}
                />
              ))}
            </nav>

            <div className="p-4 border-t border-border flex-shrink-0">
              <div className="px-3 py-2 bg-muted rounded-md">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Upgrade to Pro
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Unlock AI analysis, PDF reports, and more
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
