import { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { formatCurrency } from '../utils/calculations';
import { groupByAssetClass } from '../utils/assetClasses';
import { exportHoldingsCSV, exportTradesCSV } from '../utils/csvExport';
import { LoadingSpinner, ProgressBar, SuccessCheckmark } from './ui';

function ExportButtons({ results }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingMessage, setGeneratingMessage] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);
  const groupedPositions = groupByAssetClass(results.positions);

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

  const handleDownloadPDF = () => {
    downloadPDF();
    setExportMenuOpen(false);
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

  const downloadPDF = async () => {
    setGenerating(true);
    setGeneratingProgress(0);
    setGeneratingMessage('Initializing...');
    setExportSuccess(false);

    try {
      setGeneratingProgress(10);
      setGeneratingMessage('Creating document...');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(30, 58, 138); // Blue-900
      pdf.text('Portfolio Rebalancing Report', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 116, 139); // Gray-500
      pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 15;

      // Total Value Box
      pdf.setFillColor(239, 246, 255); // Blue-50
      pdf.roundedRect(15, yPosition, pageWidth - 30, 15, 3, 3, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(30, 58, 138);
      pdf.text(`Total Portfolio Value: ${formatCurrency(results.totalValue)}`, pageWidth / 2, yPosition + 10, { align: 'center' });

      yPosition += 25;

      setGeneratingProgress(25);
      setGeneratingMessage('Capturing charts...');

      // Capture pie charts
      const chartsElement = document.querySelector('[data-charts]');
      if (chartsElement) {
        try {
          // Wait a moment for charts to fully render
          await new Promise(resolve => setTimeout(resolve, 500));
          const canvas = await html2canvas(chartsElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            onclone: (clonedDoc) => {
              // Convert oklch colors to rgb in the cloned document
              const originalElements = chartsElement.querySelectorAll('*');
              const clonedElements = clonedDoc.body.querySelectorAll('*');

              originalElements.forEach((origEl, index) => {
                if (clonedElements[index]) {
                  const styles = window.getComputedStyle(origEl);
                  const clonedEl = clonedElements[index];

                  // Force computed colors (which are in rgb) to be applied as inline styles
                  if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
                    clonedEl.style.color = styles.color;
                  }
                  if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    clonedEl.style.backgroundColor = styles.backgroundColor;
                  }
                  if (styles.borderColor) {
                    clonedEl.style.borderColor = styles.borderColor;
                  }
                  if (styles.fill && styles.fill !== 'none') {
                    clonedEl.style.fill = styles.fill;
                  }
                  if (styles.stroke && styles.stroke !== 'none') {
                    clonedEl.style.stroke = styles.stroke;
                  }
                }
              });
            }
          });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 30;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch {
          // Add a note in the PDF that charts were skipped
          pdf.setFontSize(10);
          pdf.setTextColor(107, 114, 128);
          pdf.text('Note: Charts could not be included due to browser compatibility. View charts in the web interface.', 15, yPosition);
          yPosition += 15;
        }
      }

      setGeneratingProgress(50);
      setGeneratingMessage('Building tables...');

      // Rebalancing Actions Table
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(30, 58, 138);
      pdf.text('Rebalancing Actions', 15, yPosition);
      yPosition += 8;

      // Table Header
      pdf.setFillColor(249, 250, 251); // Gray-50
      pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Position', 20, yPosition + 5.5);
      pdf.text('Current', 70, yPosition + 5.5);
      pdf.text('Target', 110, yPosition + 5.5);
      pdf.text('Action', 145, yPosition + 5.5);
      pdf.text('Amount', 170, yPosition + 5.5);
      yPosition += 10;

      // Table Rows
      results.positions.forEach((pos, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(15, yPosition - 2, pageWidth - 30, 8, 'F');
        }

        pdf.setFontSize(9);
        pdf.setTextColor(31, 41, 55);
        pdf.text(pos.ticker, 20, yPosition + 3.5);
        pdf.text(`${pos.currentPercent.toFixed(1)}%`, 70, yPosition + 3.5);
        pdf.text(`${pos.targetPercent.toFixed(1)}%`, 110, yPosition + 3.5);

        // Action badge
        if (pos.action === 'BUY') {
          pdf.setTextColor(22, 163, 74);
        } else if (pos.action === 'SELL') {
          pdf.setTextColor(239, 68, 68);
        } else {
          pdf.setTextColor(107, 114, 128);
        }
        pdf.text(pos.action, 145, yPosition + 3.5);

        pdf.setTextColor(31, 41, 55);
        pdf.text(formatCurrency(Math.abs(pos.difference)), 170, yPosition + 3.5);

        yPosition += 8;
      });

      yPosition += 10;

      // Asset Class View Table
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(30, 58, 138);
      pdf.text('Asset Class View', 15, yPosition);
      yPosition += 8;

      // Table Header
      pdf.setFillColor(249, 250, 251);
      pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Asset Class', 20, yPosition + 5.5);
      pdf.text('Current', 70, yPosition + 5.5);
      pdf.text('Target', 110, yPosition + 5.5);
      pdf.text('Action', 145, yPosition + 5.5);
      pdf.text('Amount', 170, yPosition + 5.5);
      yPosition += 10;

      // Table Rows
      groupedPositions.forEach((pos, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(15, yPosition - 2, pageWidth - 30, 8, 'F');
        }

        pdf.setFontSize(9);
        pdf.setTextColor(31, 41, 55);

        // Asset class name with tickers below
        pdf.text(pos.assetClass, 20, yPosition + 3.5);

        pdf.text(`${pos.currentPercent.toFixed(1)}%`, 70, yPosition + 3.5);
        pdf.text(`${pos.targetPercent.toFixed(1)}%`, 110, yPosition + 3.5);

        // Action badge
        if (pos.action === 'BUY') {
          pdf.setTextColor(22, 163, 74);
        } else if (pos.action === 'SELL') {
          pdf.setTextColor(239, 68, 68);
        } else {
          pdf.setTextColor(107, 114, 128);
        }
        pdf.text(pos.action, 145, yPosition + 3.5);

        pdf.setTextColor(31, 41, 55);
        pdf.text(formatCurrency(Math.abs(pos.difference)), 170, yPosition + 3.5);

        yPosition += 8;

        // Add ticker list if there are tickers
        if (pos.tickers && pos.tickers.length > 0) {
          pdf.setFontSize(7);
          pdf.setTextColor(107, 114, 128);
          const tickersText = pos.tickers.join(', ');
          const truncated = tickersText.length > 50 ? tickersText.substring(0, 47) + '...' : tickersText;
          pdf.text(truncated, 25, yPosition - 4);
        }
      });

      yPosition += 5;

      setGeneratingProgress(75);
      setGeneratingMessage('Adding analysis...');

      // AI Analysis
      if (results.aiExplanation) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(30, 58, 138);
        pdf.text('AI Analysis', 15, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const splitText = pdf.splitTextToSize(results.aiExplanation, pageWidth - 35);

        splitText.forEach(line => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 15, yPosition);
          yPosition += 5;
        });
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`Generated by Portfolio Rebalancer - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      setGeneratingProgress(90);
      setGeneratingMessage('Saving PDF...');

      pdf.save(`portfolio-rebalancing-${new Date().toISOString().split('T')[0]}.pdf`);

      setGeneratingProgress(100);
      setGeneratingMessage('Complete!');
      setExportSuccess(true);

      // Show success briefly before resetting
      setTimeout(() => {
        setExportSuccess(false);
        setGenerating(false);
        setGeneratingProgress(0);
        setGeneratingMessage('');
      }, 1500);
    } catch (error) {
      alert(`Failed to generate PDF: ${error.message}`);
      setGenerating(false);
      setGeneratingProgress(0);
      setGeneratingMessage('');
    }
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

        {/* Dropdown Menu - Opens upward, constrained to viewport */}
        {exportMenuOpen && (
          <div className="absolute right-0 sm:right-0 -right-2 bottom-full mb-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-fade-in max-w-[calc(100vw-2rem)]">
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
                <div className="text-xs text-gray-500">Full report with charts</div>
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
