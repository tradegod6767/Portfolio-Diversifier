import { Button } from './ui';
import FinancialDisclaimer from './FinancialDisclaimer';

/**
 * Professional Landing Page Hero
 * SaaS-style design with clear value proposition
 */
export default function ProfessionalHero({ onNavigate, onLoadExample }) {
  return (
    <div className="min-h-[85vh] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center space-y-8 mb-16 animate-fade-in">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-950 border border-indigo-800 rounded-full">
              <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-indigo-300">Tax-Smart Portfolio Rebalancing</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight px-2" style={{ color: 'var(--text-primary)' }}>
              Rebalance Your Portfolio
              <br />
              <span className="text-indigo-400">Without the Tax Bill</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto px-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Calculate exact buy and sell orders in seconds. Minimize taxes with add-only mode.
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}> Save thousands annually.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={onLoadExample}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-10 bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Try Calculator Free
              </Button>
              <Button
                onClick={() => onNavigate('about')}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-10 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                See How It Works
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Your data stays private</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Free forever plan</span>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto stagger-fade-in">
            {/* Feature 1 */}
            <div className="rounded-xl p-8 border shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="w-12 h-12 bg-emerald-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Add-Only Mode</h3>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                Avoid capital gains taxes by only buying positions. Perfect for contributing new money while staying balanced.
              </p>
              <p className="text-sm font-semibold text-emerald-400">
                Save 15-20% in taxes annually
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl p-8 border shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Portfolio Health Score</h3>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                Instant analysis of concentration risk, drift from targets, and overall portfolio health on a 0-100 scale.
              </p>
              <p className="text-sm font-semibold text-blue-400">
                Professional-grade analysis
              </p>
            </div>

            {/* Feature 3 - Cloud Sync */}
            <div className="bg-gradient-to-br from-indigo-950 to-blue-950 rounded-xl p-8 border-2 border-indigo-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full">
                  PRO
                </span>
              </div>
              <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Cloud Portfolio Sync</h3>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                Save unlimited portfolios with automatic cloud sync. Access your configurations from any device, anytime.
              </p>
              <p className="text-sm font-semibold text-indigo-400">
                Pro feature - $9/month
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl p-8 border shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>PDF Reports</h3>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                Export professional reports with charts, analysis, and trade recommendations. Perfect for record-keeping.
              </p>
              <p className="text-sm font-semibold text-purple-400">
                Pro feature - $9/month
              </p>
            </div>
          </div>

          {/* Financial Disclaimer */}
          <div className="mt-16 max-w-4xl mx-auto">
            <FinancialDisclaimer variant="banner" />
          </div>

          {/* Social Proof */}
          <div className="text-center mt-16 pt-12 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>TRUSTED BY INVESTORS</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--text-secondary)' }}>
              "Perfect for Boglehead investors who want to stay balanced without constant monitoring"
            </p>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>— Portfolio management made simple</p>
          </div>
        </div>
      </div>
    </div>
  );
}
