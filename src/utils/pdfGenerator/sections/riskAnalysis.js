// Risk Analysis section for PDF report
import { PDF_CONFIG, getContentWidth } from '../config.js';
import { renderSectionTitle, renderSubsectionTitle, checkPageBreak, drawBox } from '../helpers/layoutUtils.js';
import { calculatePortfolioHealth } from '../../portfolioHealth.js';
import { groupByAssetClass, getAssetClassColor } from '../../assetClasses.js';

/**
 * Render the Risk Analysis section
 * @param {jsPDF} pdf - The PDF document
 * @param {object} data - Report data
 * @param {number} startY - Starting Y position
 * @param {object} options - Options including isPro
 * @returns {number} - Y position after section
 */
export const renderRiskAnalysis = (pdf, data, startY) => {
  const { spacing } = PDF_CONFIG;
  const { positions } = data;

  let y = renderSectionTitle(pdf, 'Risk Analysis', startY);

  const health = calculatePortfolioHealth(positions);
  const groupedPositions = groupByAssetClass(positions);

  // Concentration Risk
  y = renderConcentrationRisk(pdf, positions, y);

  // Asset Class Exposure
  y = renderAssetExposure(pdf, groupedPositions, y);

  // Health Score Factors
  y = renderHealthFactors(pdf, health, y);

  return y + spacing.sectionGap;
};

/**
 * Render Concentration Risk subsection
 */
const renderConcentrationRisk = (pdf, positions, startY) => {
  const { margins, colors } = PDF_CONFIG;
  const contentWidth = getContentWidth();

  let y = renderSubsectionTitle(pdf, 'Concentration Risk', startY);

  // Find largest positions
  const sortedPositions = [...positions].sort((a, b) => b.currentPercent - a.currentPercent);
  const top3 = sortedPositions.slice(0, 3);
  const maxPosition = top3[0];

  // Concentration indicator box
  const boxHeight = 25;
  let riskLevel, riskColor, riskMessage;

  if (maxPosition.currentPercent > 50) {
    riskLevel = 'HIGH';
    riskColor = colors.red;
    riskMessage = 'Single position exceeds 50% of portfolio';
  } else if (maxPosition.currentPercent > 30) {
    riskLevel = 'MODERATE';
    riskColor = colors.amber;
    riskMessage = 'Consider diversifying top holdings';
  } else {
    riskLevel = 'LOW';
    riskColor = colors.green;
    riskMessage = 'Portfolio is well-diversified';
  }

  drawBox(pdf, margins.left, y, contentWidth, boxHeight, colors.lightGray);

  // Risk level badge
  pdf.setFillColor(...riskColor);
  pdf.roundedRect(margins.left + 5, y + 5, 40, 15, 2, 2, 'F');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.white);
  pdf.text(riskLevel, margins.left + 25, y + 14, { align: 'center' });

  // Risk message
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.darkText);
  pdf.text(riskMessage, margins.left + 52, y + 10);

  // Top position details
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.grayText);
  pdf.text(`Largest: ${maxPosition.ticker} at ${maxPosition.currentPercent.toFixed(1)}%`, margins.left + 52, y + 18);

  y += boxHeight + 8;

  // Top 3 positions table
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.darkText);
  pdf.text('Top Holdings', margins.left, y);
  y += 5;

  top3.forEach((pos, index) => {
    const barWidth = (pos.currentPercent / 100) * (contentWidth - 80);

    // Position name
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.darkText);
    pdf.text(`${index + 1}. ${pos.ticker}`, margins.left, y + 3);

    // Bar
    pdf.setFillColor(...colors.navyHeader);
    pdf.rect(margins.left + 35, y, barWidth, 4, 'F');

    // Percentage
    pdf.text(`${pos.currentPercent.toFixed(1)}%`, margins.left + 40 + barWidth, y + 3);

    y += 6;
  });

  return y + 5;
};

/**
 * Render Asset Class Exposure subsection
 */
const renderAssetExposure = (pdf, groupedPositions, startY) => {
  const { margins, colors } = PDF_CONFIG;
  const contentWidth = getContentWidth();

  let y = checkPageBreak(pdf, startY, 50);
  y = renderSubsectionTitle(pdf, 'Asset Class Exposure', y);

  // Calculate total for percentages
  const total = groupedPositions.reduce((sum, g) => sum + g.currentPercent, 0);

  // Stacked bar chart
  const barHeight = 12;
  let barX = margins.left;

  groupedPositions.forEach(group => {
    const barWidth = (group.currentPercent / total) * contentWidth;
    const colorHex = getAssetClassColor(group.assetClass);
    const rgb = hexToRgb(colorHex);

    pdf.setFillColor(...rgb);
    pdf.rect(barX, y, barWidth, barHeight, 'F');

    barX += barWidth;
  });

  y += barHeight + 8;

  // Legend
  const legendCols = 3;
  const colWidth = contentWidth / legendCols;
  let legendX = margins.left;
  let legendY = y;
  let colIndex = 0;

  groupedPositions.forEach((group) => {
    if (colIndex >= legendCols) {
      colIndex = 0;
      legendX = margins.left;
      legendY += 8;
    }

    const colorHex = getAssetClassColor(group.assetClass);
    const rgb = hexToRgb(colorHex);

    // Color box
    pdf.setFillColor(...rgb);
    pdf.rect(legendX, legendY - 3, 4, 4, 'F');

    // Label
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.darkText);
    const label = `${group.assetClass} (${group.currentPercent.toFixed(0)}%)`;
    pdf.text(label, legendX + 6, legendY);

    legendX += colWidth;
    colIndex++;
  });

  return legendY + 10;
};

/**
 * Render Health Score Factors subsection
 */
const renderHealthFactors = (pdf, health, startY) => {
  const { margins, colors } = PDF_CONFIG;

  if (health.issues.length === 0) {
    return startY; // No issues to display
  }

  let y = checkPageBreak(pdf, startY, 30);
  y = renderSubsectionTitle(pdf, 'Portfolio Health Factors', y);

  health.issues.forEach(issue => {
    y = checkPageBreak(pdf, y, 6);

    // Warning icon (bullet)
    pdf.setFillColor(...colors.amber);
    pdf.circle(margins.left + 2, y - 1, 1.5, 'F');

    // Issue text
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.darkText);
    pdf.text(issue, margins.left + 7, y);

    y += 5;
  });

  return y + 5;
};

/**
 * Convert hex color to RGB array
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [100, 100, 100]; // Default gray
};
