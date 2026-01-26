// Header section for PDF report
import { PDF_CONFIG } from '../config.js';

/**
 * Render the report header (first page only - full header)
 * Other pages get a simpler header via addPageHeader in layoutUtils
 * @param {jsPDF} pdf - The PDF document
 * @param {object} options - Header options
 * @returns {number} - Y position after header
 */
export const renderHeader = (pdf, options = {}) => {
  const { pageWidth, margins, colors, headerHeight } = PDF_CONFIG;
  const { reportId, userEmail, generatedDate } = options;

  // Navy header bar (taller on first page)
  const firstPageHeaderHeight = headerHeight + 8;
  pdf.setFillColor(...colors.navyHeader);
  pdf.rect(0, 0, pageWidth, firstPageHeaderHeight, 'F');

  // Brand name - larger on first page
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RebalanceKit', margins.left, 14);

  // Report title
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Portfolio Rebalancing Report', margins.left, 24);

  // Decorative line under brand
  pdf.setDrawColor(255, 255, 255, 0.3);
  pdf.setLineWidth(0.5);
  pdf.line(margins.left, 28, margins.left + 60, 28);

  // Right side metadata
  const rightX = pageWidth - margins.right;
  pdf.setFontSize(9);

  let metaY = 12;
  if (reportId) {
    pdf.text(`Report ID: ${reportId}`, rightX, metaY, { align: 'right' });
    metaY += 7;
  }

  if (generatedDate) {
    pdf.text(generatedDate, rightX, metaY, { align: 'right' });
    metaY += 7;
  }

  if (userEmail) {
    pdf.setFontSize(8);
    pdf.text(`Prepared for: ${userEmail}`, rightX, metaY, { align: 'right' });
  }

  return firstPageHeaderHeight + 10;
};
