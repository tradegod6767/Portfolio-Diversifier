// Executive Summary section for PDF report
import { PDF_CONFIG, getContentWidth } from '../config.js';
import { renderSectionTitle, checkPageBreak, drawBox } from '../helpers/layoutUtils.js';
import { formatCurrency } from '../../calculations.js';
import { calculatePortfolioHealth, calculateDrift } from '../../portfolioHealth.js';

/**
 * Draw a health score gauge
 * @param {jsPDF} pdf - The PDF document
 * @param {number} score - Health score 0-100
 * @param {number} x - Center X position
 * @param {number} y - Center Y position
 * @param {number} radius - Gauge radius
 */
const drawHealthGauge = (pdf, score, x, y, radius = 18) => {
  const { colors } = PDF_CONFIG;

  // Determine color based on score
  let gaugeColor;
  if (score >= 90) gaugeColor = colors.green;
  else if (score >= 70) gaugeColor = colors.blue;
  else if (score >= 50) gaugeColor = colors.amber;
  else gaugeColor = colors.red;

  // Background circle (light gray)
  pdf.setFillColor(240, 240, 240);
  pdf.circle(x, y, radius, 'F');

  // Score arc (simplified - just show as filled percentage)
  pdf.setFillColor(...gaugeColor);
  pdf.circle(x, y, radius - 3, 'F');

  // Inner white circle
  pdf.setFillColor(255, 255, 255);
  pdf.circle(x, y, radius - 6, 'F');

  // Score text
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...gaugeColor);
  pdf.text(score.toString(), x, y + 2, { align: 'center' });

  // Label below
  pdf.setFontSize(7);
  pdf.setTextColor(...colors.grayText);
  pdf.text('Health Score', x, y + radius + 6, { align: 'center' });
};

/**
 * Render the Executive Summary section
 * @param {jsPDF} pdf - The PDF document
 * @param {object} data - Report data
 * @param {number} startY - Starting Y position
 * @param {object} options - Options including isPro
 * @returns {number} - Y position after section
 */
export const renderExecutiveSummary = (pdf, data, startY, options = {}) => {
  const { margins, colors, spacing } = PDF_CONFIG;
  const { positions, totalValue } = data;
  const { isPro } = options;
  const contentWidth = getContentWidth();

  let y = renderSectionTitle(pdf, 'Executive Summary', startY);

  // Calculate metrics
  const health = calculatePortfolioHealth(positions);
  const drift = calculateDrift(positions);
  const actionsNeeded = positions.filter(p => p.action !== 'HOLD').length;
  const totalBuys = positions.filter(p => p.action === 'BUY').length;
  const totalSells = positions.filter(p => p.action === 'SELL').length;

  // Main summary box
  const boxHeight = 55;
  drawBox(pdf, margins.left, y, contentWidth, boxHeight, colors.lightGray);

  // Left column - Health Score Gauge
  const gaugeX = margins.left + 30;
  const gaugeY = y + 28;
  drawHealthGauge(pdf, health.score, gaugeX, gaugeY);

  // Health rating text
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');

  let ratingColor;
  if (health.color === 'green') ratingColor = colors.green;
  else if (health.color === 'blue') ratingColor = colors.blue;
  else if (health.color === 'yellow') ratingColor = colors.amber;
  else ratingColor = colors.red;

  pdf.setTextColor(...ratingColor);
  pdf.text(health.rating, gaugeX, gaugeY + 28, { align: 'center' });

  // Right side - Key Metrics (3 columns)
  const metricsStartX = margins.left + 70;
  const colWidth = (contentWidth - 60) / 3;
  let metricsY = y + 10;

  // Metric 1: Portfolio Value
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.grayText);
  pdf.text('Total Portfolio Value', metricsStartX, metricsY);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.darkText);
  pdf.text(formatCurrency(totalValue), metricsStartX, metricsY + 7);

  // Metric 2: Portfolio Drift
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.grayText);
  pdf.text('Portfolio Drift', metricsStartX + colWidth, metricsY);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');

  let driftColor;
  if (drift.color === 'green') driftColor = colors.green;
  else if (drift.color === 'yellow') driftColor = colors.amber;
  else driftColor = colors.red;

  pdf.setTextColor(...driftColor);
  pdf.text(`${drift.percentage.toFixed(1)}%`, metricsStartX + colWidth, metricsY + 7);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(drift.status, metricsStartX + colWidth, metricsY + 13);

  // Metric 3: Actions Required
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.grayText);
  pdf.text('Actions Required', metricsStartX + colWidth * 2, metricsY);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.darkText);
  pdf.text(actionsNeeded.toString(), metricsStartX + colWidth * 2, metricsY + 7);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.grayText);
  pdf.text(`${totalBuys} buy, ${totalSells} sell`, metricsStartX + colWidth * 2, metricsY + 13);

  // Second row of metrics
  metricsY = y + 35;

  // Largest position (concentration)
  const maxPosition = positions.reduce((max, p) =>
    p.currentPercent > max.currentPercent ? p : max
  , positions[0]);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.grayText);
  pdf.text('Largest Position', metricsStartX, metricsY);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.darkText);
  pdf.text(`${maxPosition.ticker} (${maxPosition.currentPercent.toFixed(1)}%)`, metricsStartX, metricsY + 6);

  // Number of positions
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.grayText);
  pdf.text('Positions', metricsStartX + colWidth, metricsY);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.darkText);
  pdf.text(positions.length.toString(), metricsStartX + colWidth, metricsY + 6);

  // Tax impact (Pro only) or upgrade prompt
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.grayText);
  pdf.text('Est. Tax Impact', metricsStartX + colWidth * 2, metricsY);

  if (isPro) {
    // Calculate estimated tax impact from sells
    const sellPositions = positions.filter(p => p.action === 'SELL');
    const estimatedGains = sellPositions.reduce((sum, p) => {
      // Assume 80% cost basis (20% gain)
      return sum + Math.abs(p.difference) * 0.2;
    }, 0);
    const estimatedTax = estimatedGains * 0.15; // 15% long-term rate

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.darkText);
    pdf.text(formatCurrency(estimatedTax), metricsStartX + colWidth * 2, metricsY + 6);
  } else {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(...colors.grayText);
    pdf.text('Pro feature', metricsStartX + colWidth * 2, metricsY + 6);
  }

  y += boxHeight + 8;

  // Key Recommendations
  y = checkPageBreak(pdf, y, 30);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.darkText);
  pdf.text('Key Recommendations', margins.left, y);
  y += 6;

  const recommendations = generateRecommendations(positions, drift, health);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');

  recommendations.forEach(rec => {
    y = checkPageBreak(pdf, y, 6);
    pdf.setTextColor(...colors.darkText);
    pdf.text(`•  ${rec}`, margins.left + 3, y);
    y += 5;
  });

  return y + spacing.sectionGap;
};

/**
 * Generate key recommendations based on portfolio state
 */
const generateRecommendations = (positions, drift, health) => {
  const recommendations = [];

  // Drift recommendation
  if (drift.percentage > 10) {
    recommendations.push('Rebalancing is strongly recommended to reduce portfolio drift.');
  } else if (drift.percentage > 5) {
    recommendations.push('Consider rebalancing to maintain target allocations.');
  } else {
    recommendations.push('Portfolio is well-aligned with targets. Minor adjustments only.');
  }

  // Concentration warning
  const maxPosition = positions.reduce((max, p) =>
    p.currentPercent > max.currentPercent ? p : max
  , positions[0]);

  if (maxPosition.currentPercent > 40) {
    recommendations.push(`Consider reducing ${maxPosition.ticker} concentration (currently ${maxPosition.currentPercent.toFixed(0)}%).`);
  }

  // Diversification
  if (positions.length < 4) {
    recommendations.push('Consider adding positions to improve diversification.');
  }

  // Health-based recommendation
  if (health.score < 70) {
    recommendations.push('Review portfolio structure to improve overall health score.');
  }

  return recommendations.slice(0, 3); // Max 3 recommendations
};
