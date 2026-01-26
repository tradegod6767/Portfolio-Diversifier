// Charts section for PDF report
import { PDF_CONFIG, getContentWidth } from '../config.js';
import { renderSectionTitle, checkPageBreak } from '../helpers/layoutUtils.js';

/**
 * Render the Charts section (captures existing charts from DOM)
 * @param {jsPDF} pdf - The PDF document
 * @param {HTMLElement} chartsElement - DOM element containing charts
 * @param {number} startY - Starting Y position
 * @param {function} html2canvas - html2canvas function
 * @returns {Promise<number>} - Y position after section
 */
export const renderCharts = async (pdf, chartsElement, startY, html2canvas) => {
  const { margins, colors, fonts, spacing, pageHeight } = PDF_CONFIG;
  const contentWidth = getContentWidth();

  let y = renderSectionTitle(pdf, 'Portfolio Allocation', startY);

  if (!chartsElement) {
    // No charts available
    pdf.setFontSize(fonts.body);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(...colors.grayText);
    pdf.text('Charts not available. View in the web interface.', margins.left, y);
    return y + 10;
  }

  try {
    // Wait for charts to fully render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Capture charts with html2canvas
    const canvas = await html2canvas(chartsElement, {
      scale: 2, // High resolution
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Convert oklch colors to rgb in the cloned document
        const clonedElement = clonedDoc.body.querySelector('[data-charts]');
        if (clonedElement) {
          convertColorsToRgb(chartsElement, clonedElement);
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions to fit content width
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Check if we need a page break
    const maxHeight = pageHeight - margins.bottom - y - 10;
    if (imgHeight > maxHeight) {
      // Image too tall, scale down or split
      const scaledHeight = Math.min(imgHeight, maxHeight);
      const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
      const xOffset = margins.left + (contentWidth - scaledWidth) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, y, scaledWidth, scaledHeight);
      y += scaledHeight + 5;
    } else {
      pdf.addImage(imgData, 'PNG', margins.left, y, imgWidth, imgHeight);
      y += imgHeight + 5;
    }

    // Add chart legend/note
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(...colors.grayText);
    pdf.text('Left: Current Allocation | Right: Target Allocation', margins.left, y);
    y += 4;

  } catch (error) {
    console.error('Failed to capture charts:', error);

    // Fallback message
    pdf.setFontSize(fonts.body);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(...colors.grayText);
    pdf.text('Charts could not be captured. View in the web interface.', margins.left, y);
    y += 10;
  }

  return y + spacing.sectionGap;
};

/**
 * Helper to convert oklch colors to rgb in cloned elements
 * This is necessary because html2canvas doesn't support oklch
 */
const convertColorsToRgb = (originalElement, clonedElement) => {
  const originalElements = originalElement.querySelectorAll('*');
  const clonedElements = clonedElement.querySelectorAll('*');

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
};

/**
 * Render a simple allocation bar chart (fallback if html2canvas fails)
 * @param {jsPDF} pdf - The PDF document
 * @param {Array} positions - Position data
 * @param {number} y - Y position
 * @returns {number} - New Y position
 */
export const renderAllocationBars = (pdf, positions, y) => {
  const { margins, colors, fonts } = PDF_CONFIG;
  const contentWidth = getContentWidth();

  pdf.setFontSize(fonts.small);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.darkText);
  pdf.text('Allocation Overview', margins.left, y);
  y += 8;

  const barHeight = 6;
  const barSpacing = 10;
  const labelWidth = 40;
  const barWidth = contentWidth - labelWidth - 40;

  positions.slice(0, 8).forEach(pos => { // Limit to 8 positions for space
    // Label
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.darkText);
    pdf.text(pos.ticker, margins.left, y + 4);

    // Background bar
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margins.left + labelWidth, y, barWidth, barHeight, 'F');

    // Current allocation bar
    const currentWidth = (pos.currentPercent / 100) * barWidth;
    pdf.setFillColor(...colors.blue);
    pdf.rect(margins.left + labelWidth, y, currentWidth, barHeight / 2, 'F');

    // Target allocation bar
    const targetWidth = (pos.targetPercent / 100) * barWidth;
    pdf.setFillColor(...colors.navyHeader);
    pdf.rect(margins.left + labelWidth, y + barHeight / 2, targetWidth, barHeight / 2, 'F');

    // Percentage labels
    pdf.setFontSize(7);
    pdf.text(`${pos.currentPercent.toFixed(0)}%`, margins.left + labelWidth + barWidth + 3, y + 3);
    pdf.text(`${pos.targetPercent.toFixed(0)}%`, margins.left + labelWidth + barWidth + 3, y + 6);

    y += barSpacing;
  });

  // Legend
  y += 3;
  pdf.setFontSize(7);
  pdf.setTextColor(...colors.grayText);
  pdf.setFillColor(...colors.blue);
  pdf.rect(margins.left, y, 8, 3, 'F');
  pdf.text('Current', margins.left + 10, y + 2.5);

  pdf.setFillColor(...colors.navyHeader);
  pdf.rect(margins.left + 35, y, 8, 3, 'F');
  pdf.text('Target', margins.left + 45, y + 2.5);

  return y + 10;
};
