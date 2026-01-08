import { Button } from './ui';

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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-emerald-700">Tax-Smart Portfolio Rebalancing</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight px-2">
              Rebalance Your Portfolio
              <br />
              <span className="text-[#0A2540]">Without the Tax Bill</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto px-2 leading-relaxed">
              Calculate exact buy and sell orders in seconds. Minimize taxes with add-only mode.
              <span className="font-semibold text-slate-700"> Save thousands annually.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={onLoadExample}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-10"
              >
                Try Calculator Free
              </Button>
              <Button
                onClick={() => onNavigate('about')}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-10"
              >
                See How It Works
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Your data stays private</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Free forever plan</span>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-fade-in">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Add-Only Mode</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Avoid capital gains taxes by only buying positions. Perfect for contributing new money while staying balanced.
              </p>
              <p className="text-sm font-semibold text-emerald-600">
                Save 15-20% in taxes annually
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Portfolio Health Score</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Instant analysis of concentration risk, drift from targets, and overall portfolio health on a 0-100 scale.
              </p>
              <p className="text-sm font-semibold text-blue-600">
                Professional-grade analysis
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">PDF Reports</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Export professional reports with charts, analysis, and trade recommendations. Perfect for record-keeping.
              </p>
              <p className="text-sm font-semibold text-purple-600">
                Pro feature - $9/month
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center mt-16 pt-12 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">TRUSTED BY INVESTORS</p>
            <p className="text-2xl font-semibold text-slate-700">
              "Perfect for Boglehead investors who want to stay balanced without constant monitoring"
            </p>
            <p className="text-slate-500 mt-3">— Portfolio management made simple</p>
          </div>
        </div>
      </div>
    </div>
  );
}
