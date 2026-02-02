// Appendix section for PDF report
import { PDF_CONFIG, getContentWidth } from '../config.js';
import { renderSectionTitle, renderSubsectionTitle, checkPageBreak, wrapText } from '../helpers/layoutUtils.js';
import { calculateDrift } from '../../portfolioHealth.js';

/**
 * Render the Appendix section
 * @param {jsPDF} pdf - The PDF document
 * @param {object} data - Report data
 * @param {object} options - Options including isPro
 * @returns {number} - Y position after section
 */
export const renderAppendix = (pdf, data, options = {}) => {
  const { margins } = PDF_CONFIG;
  const { positions } = data;
  const { isPro } = options;

  // Start on a new page
  pdf.addPage();
  let y = margins.top + 40; // Account for header

  y = renderSectionTitle(pdf, 'Appendix', y);

  // Tax Lot Optimization (Pro only)
  if (isPro) {
    y = renderTaxOptimization(pdf, positions, y);
  }

  // Rebalancing Recommendations
  y = renderRebalancingRecommendations(pdf, positions, y);

  // Methodology
  y = renderMethodology(pdf, y);

  // Disclaimer
  y = renderDisclaimer(pdf, y);

  return y;
};

/**
 * Render Tax Lot Optimization subsection (Pro only)
 */
const renderTaxOptimization = (pdf, positions, startY) => {
  const { margins, colors, fonts, spacing } = PDF_CONFIG;

  let y = renderSubsectionTitle(pdf, 'Tax-Efficient Selling Order', startY);

  // Find positions being sold
  const sellPositions = positions.filter(p => p.action === 'SELL');

  if (sellPositions.length === 0) {
    pdf.setFontSize(fonts.body);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(...colors.grayText);
    pdf.text('No positions require selling in this rebalancing.', margins.left, y);
    return y + 15;
  }

  pdf.setFontSize(fonts.small);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.darkText);

  const tips = [
    'Consider selling lots with highest cost basis first to minimize capital gains.',
    'Look for tax-loss harvesting opportunities in positions trading below cost.',
    'If holding period is approaching 1 year, consider waiting for long-term rates.',
    'Prioritize selling in tax-advantaged accounts (IRA, 401k) when possible.',
  ];

  tips.forEach(tip => {
    y = checkPageBreak(pdf, y, 6);
    pdf.text(`•  ${tip}`, margins.left, y);
    y += 5;
  });

  y += 5;

  // Sell order summary
  pdf.setFontSize(fonts.small);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.darkText);
  pdf.text('Positions to Sell:', margins.left, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  sellPositions.forEach(pos => {
    y = checkPageBreak(pdf, y, 5);
    const amount = Math.abs(pos.difference);
    pdf.text(`${pos.ticker}: $${amount.toFixed(2)}`, margins.left + 5, y);
    y += 4;
  });

  return y + spacing.sectionGap;
};

/**
 * Render Rebalancing Recommendations subsection
 */
const renderRebalancingRecommendations = (pdf, positions, startY) => {
  const { margins, colors, fonts, spacing } = PDF_CONFIG;

  let y = checkPageBreak(pdf, startY, 40);
  y = renderSubsectionTitle(pdf, 'Rebalancing Frequency Recommendations', y);

  const drift = calculateDrift(positions);

  pdf.setFontSize(fonts.body);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.darkText);

  // Recommendation based on current drift
  let recommendation, frequency;

  if (drift.percentage > 15) {
    recommendation = 'Your portfolio has significant drift. Rebalancing is strongly recommended.';
    frequency = 'Immediate action recommended, then quarterly review.';
  } else if (drift.percentage > 10) {
    recommendation = 'Your portfolio shows moderate drift. Consider rebalancing soon.';
    frequency = 'Quarterly rebalancing with 5% threshold triggers.';
  } else if (drift.percentage > 5) {
    recommendation = 'Your portfolio has minor drift. Monitor and rebalance as needed.';
    frequency = 'Semi-annual review with 10% threshold triggers.';
  } else {
    recommendation = 'Your portfolio is well-aligned. Maintain current allocations.';
    frequency = 'Annual review should be sufficient.';
  }

  const lines1 = wrapText(pdf, recommendation);
  lines1.forEach(line => {
    pdf.text(line, margins.left, y);
    y += 4.5;
  });

  y += 3;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Suggested Frequency: ', margins.left, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(frequency, margins.left + 40, y);

  y += 10;

  // General guidelines
  pdf.setFontSize(fonts.small);
  pdf.setFont('helvetica', 'bold');
  pdf.text('General Rebalancing Guidelines:', margins.left, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  const guidelines = [
    'Calendar-based: Review portfolio at regular intervals (quarterly/annually)',
    'Threshold-based: Rebalance when any asset drifts >5% from target',
    'Hybrid approach: Quarterly reviews with 5% threshold triggers',
    'Tax-aware: Consider tax implications before selling positions',
  ];

  guidelines.forEach(guideline => {
    y = checkPageBreak(pdf, y, 5);
    pdf.text(`•  ${guideline}`, margins.left, y);
    y += 4.5;
  });

  return y + spacing.sectionGap;
};

/**
 * Render Methodology subsection
 */
const renderMethodology = (pdf, startY) => {
  const { margins, colors, fonts, spacing } = PDF_CONFIG;

  let y = checkPageBreak(pdf, startY, 40);
  y = renderSubsectionTitle(pdf, 'Calculation Methodology', y);

  pdf.setFontSize(fonts.small);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.darkText);

  const methodology = [
    {
      title: 'Portfolio Drift',
      desc: 'Calculated as the sum of absolute differences between current and target allocations, divided by 2 to avoid double-counting.'
    },
    {
      title: 'Health Score',
      desc: 'Based on concentration risk (max position %), portfolio drift, and diversification (number of positions). Scale: 0-100.'
    },
    {
      title: 'Tax Estimates',
      desc: 'Assumes 80% cost basis and 15% long-term capital gains rate. Actual results may vary based on your specific tax situation.'
    },
    {
      title: 'Rebalancing Actions',
      desc: 'Calculated to bring each position to its target allocation while minimizing total trades.'
    }
  ];

  methodology.forEach(item => {
    y = checkPageBreak(pdf, y, 12);

    pdf.setFont('helvetica', 'bold');
    pdf.text(item.title + ':', margins.left, y);
    y += 4;

    pdf.setFont('helvetica', 'normal');
    const lines = wrapText(pdf, item.desc);
    lines.forEach(line => {
      pdf.text(line, margins.left + 3, y);
      y += 4;
    });

    y += 2;
  });

  return y + spacing.sectionGap;
};

/**
 * Render Disclaimer subsection
 */
const renderDisclaimer = (pdf, startY) => {
  const { margins, pageHeight } = PDF_CONFIG;
  const contentWidth = getContentWidth();

  let y = checkPageBreak(pdf, startY, 50);
  y = renderSubsectionTitle(pdf, 'Important Disclaimer', y);

  // Disclaimer box
  pdf.setFillColor(254, 243, 199); // Light amber
  pdf.setDrawColor(245, 158, 11); // Amber border
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margins.left, y, contentWidth, 45, 2, 2, 'FD');

  y += 5;
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 53, 15); // Dark amber text

  const disclaimer = `This report is provided for informational and educational purposes only and does not constitute investment,
tax, legal, or financial advice. The information contained herein is based on data you provided and uses simplified
assumptions that may not reflect your actual financial situation.

RebalanceKit is not a registered investment advisor, broker-dealer, or tax advisor. Past performance is not indicative
of future results. Investment decisions should be made in consultation with qualified financial professionals who
understand your complete financial picture.

Tax estimates are approximations based on standard assumptions (80% cost basis, 15% long-term capital gains rate) and
should not be used for tax planning purposes without consulting a qualified tax professional. Actual tax liability
may differ significantly based on your specific circumstances, cost basis, holding periods, and tax situation.

By using this report, you acknowledge that RebalanceKit bears no responsibility for investment decisions made based
on this information.`;

  const lines = wrapText(pdf, disclaimer.replace(/\n/g, ' '));
  lines.forEach(line => {
    if (y < pageHeight - margins.bottom - 10) {
      pdf.text(line, margins.left + 3, y);
      y += 3.5;
    }
  });

  return y + 10;
};
