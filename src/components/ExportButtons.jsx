import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { formatCurrency } from '../utils/calculations';
import { groupByAssetClass } from '../utils/assetClasses';

function ExportButtons({ results }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const groupedPositions = groupByAssetClass(results.positions);

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
    console.log('PDF download started');
    setGenerating(true);

    try {
      console.log('Creating jsPDF instance...');
      const pdf = new jsPDF('p', 'mm', 'a4');
      console.log('jsPDF instance created successfully');
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

      // Capture pie charts
      console.log('Looking for charts element...');
      const chartsElement = document.querySelector('[data-charts]');
      console.log('Charts element found:', chartsElement);
      if (chartsElement) {
        try {
          console.log('Waiting for charts to render...');
          // Wait a moment for charts to fully render
          await new Promise(resolve => setTimeout(resolve, 500));

          console.log('Capturing charts with html2canvas...');
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
          console.log('Charts captured successfully');
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 30;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
          console.log('Charts added to PDF');
        } catch (chartError) {
          console.warn('Could not capture charts due to CSS compatibility issue:', chartError.message);
          console.log('Continuing PDF generation without charts...');
          // Add a note in the PDF that charts were skipped
          pdf.setFontSize(10);
          pdf.setTextColor(107, 114, 128);
          pdf.text('Note: Charts could not be included due to browser compatibility. View charts in the web interface.', 15, yPosition);
          yPosition += 15;
        }
      } else {
        console.warn('Charts element not found - PDF will not include charts');
      }

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

      // AI Analysis
      if (results.aiExplanation) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(30, 58, 138);
        pdf.text('Professional Analysis', 15, yPosition);
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

      console.log('Saving PDF...');
      pdf.save(`portfolio-rebalancing-${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF saved successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error.stack);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      console.log('Cleaning up...');
      setGenerating(false);
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

      <button
        onClick={downloadPDF}
        disabled={generating}
        className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-blue-400 text-white font-medium py-2 px-3 rounded-md transition duration-200 shadow-sm text-xs disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF</span>
          </>
        )}
      </button>
    </div>
  );
}

export default ExportButtons;
