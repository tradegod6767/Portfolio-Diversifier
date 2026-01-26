import { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../utils/calculations';
import { exportHoldingsCSV, exportTradesCSV } from '../utils/csvExport';
import { generatePDF } from '../utils/pdfGenerator';
import { LoadingSpinner, ProgressBar, SuccessCheckmark } from './ui';

function ExportButtons({ results, isPro = false, userEmail = null }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingMessage, setGeneratingMessage] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };

    if (exportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportMenuOpen]);

  const handleExportHoldings = () => {
    exportHoldingsCSV(results);
    setExportMenuOpen(false);
  };

  const handleExportTrades = () => {
    exportTradesCSV(results);
    setExportMenuOpen(false);
  };

  const handleDownloadPDF = async () => {
    setExportMenuOpen(false);
    setGenerating(true);
    setGeneratingProgress(0);
    setGeneratingMessage('Initializing...');
    setExportSuccess(false);

    try {
      await generatePDF(
        {
          totalValue: results.totalValue,
          positions: results.positions,
          aiExplanation: results.aiExplanation
        },
        {
          isPro,
          userEmail,
          onProgress: (progress, message) => {
            setGeneratingProgress(progress);
            setGeneratingMessage(message);
          }
        }
      );

      setExportSuccess(true);

      // Show success briefly before resetting
      setTimeout(() => {
        setExportSuccess(false);
        setGenerating(false);
        setGeneratingProgress(0);
        setGeneratingMessage('');
      }, 1500);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(`Failed to generate PDF: ${error.message}`);
      setGenerating(false);
      setGeneratingProgress(0);
      setGeneratingMessage('');
    }
  };

  const copyToClipboard = () => {
    const { totalValue, positions } = results;

    let text = 'REBALANCING ACTIONS\n';
    text += '═══════════════════════════\n\n';

    positions.forEach(pos => {
      if (Math.abs(pos.difference) > 0.01) {
        const action = pos.action === 'BUY' ? 'BUY' : 'SELL';
        text += `• ${action} ${formatCurrency(Math.abs(pos.difference))} of ${pos.ticker}\n`;
      }
    });

    text += `\nTotal Portfolio Value: ${formatCurrency(totalValue)}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2 px-3 rounded-md transition duration-200 shadow-sm text-xs"
      >
        {copied ? (
          <span className="text-green-600">Copied!</span>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy to Clipboard</span>
          </>
        )}
      </button>

      {/* Export Dropdown */}
      <div className="relative" ref={exportMenuRef}>
        {/* Progress overlay when generating */}
        {generating && (
          <div className="absolute -top-16 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              {exportSuccess ? (
                <SuccessCheckmark size="sm" />
              ) : (
                <LoadingSpinner size="sm" color="primary" />
              )}
              <span className="text-sm font-medium text-slate-700">
                {generatingMessage}
              </span>
            </div>
            <ProgressBar progress={generatingProgress} />
          </div>
        )}

        <button
          onClick={() => !generating && setExportMenuOpen(!exportMenuOpen)}
          disabled={generating}
          className={`flex items-center gap-1.5 font-medium py-2 px-3 rounded-md transition duration-200 shadow-sm text-xs disabled:cursor-not-allowed ${
            exportSuccess
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : generating
              ? 'bg-slate-600 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {exportSuccess ? (
            <>
              <SuccessCheckmark size="xs" className="text-white" />
              <span>Exported!</span>
            </>
          ) : generating ? (
            <>
              <LoadingSpinner size="xs" color="white" />
              <span>{generatingMessage || 'Generating...'}</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export as...</span>
              <svg className={`w-3 h-3 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>

        {/* Dropdown Menu - Opens downward, aligned left to stay within container */}
        {exportMenuOpen && (
          <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-fade-in">
            {/* PDF Export */}
            <button
              onClick={handleDownloadPDF}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium">PDF Report</div>
                <div className="text-xs text-gray-500">Professional report with analysis</div>
              </div>
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            {/* CSV Holdings Export */}
            <button
              onClick={handleExportHoldings}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium">CSV (Holdings)</div>
                <div className="text-xs text-gray-500">Current portfolio data</div>
              </div>
            </button>

            {/* CSV Trades Export */}
            <button
              onClick={handleExportTrades}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium">CSV (Trades)</div>
                <div className="text-xs text-gray-500">Rebalancing recommendations</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExportButtons;
