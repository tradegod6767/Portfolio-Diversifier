// Position Analysis section for PDF report
import { PDF_CONFIG, getContentWidth } from '../config.js';
import { renderSectionTitle, checkPageBreak } from '../helpers/layoutUtils.js';
import { formatCurrency } from '../../calculations.js';
import { groupByAssetClass, getAssetClassColor } from '../../assetClasses.js';

/**
 * Render the Detailed Position Analysis section
 * @param {jsPDF} pdf - The PDF document
 * @param {object} data - Report data
 * @param {number} startY - Starting Y position
 * @param {function} autoTable - jspdf-autotable function
 * @returns {number} - Y position after section
 */
export const renderPositionAnalysis = (pdf, data, startY, autoTable) => {
  const { margins, colors, fonts, spacing } = PDF_CONFIG;
  const { positions } = data;
  const contentWidth = getContentWidth();

  let y = renderSectionTitle(pdf, 'Detailed Position Analysis', startY);

  // Prepare table data
  const tableData = positions.map(pos => {
    const driftPercent = pos.currentPercent - pos.targetPercent;
    const driftAmount = pos.currentAmount - (pos.targetAmount || pos.currentAmount * (pos.targetPercent / pos.currentPercent));

    return [
      pos.ticker,
      formatCurrency(pos.currentAmount),
      `${pos.currentPercent.toFixed(1)}%`,
      `${pos.targetPercent.toFixed(1)}%`,
      formatCurrency(Math.abs(pos.difference)),
      `${driftPercent >= 0 ? '+' : ''}${driftPercent.toFixed(1)}%`,
      pos.action,
      formatCurrency(Math.abs(pos.difference))
    ];
  });

  // Sort by action priority: SELL first, then BUY, then HOLD
  const actionOrder = { 'SELL': 0, 'BUY': 1, 'HOLD': 2 };
  tableData.sort((a, b) => actionOrder[a[6]] - actionOrder[b[6]]);

  // Render table using jspdf-autotable
  autoTable(pdf, {
    startY: y,
    head: [[
      'Position',
      'Current Value',
      'Current %',
      'Target %',
      'Drift $',
      'Drift %',
      'Action',
      'Amount'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: colors.navyHeader,
      textColor: colors.white,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3,
      halign: 'center'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      valign: 'middle',
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' }, // Position
      1: { halign: 'right' }, // Current Value
      2: { halign: 'center' }, // Current %
      3: { halign: 'center' }, // Target %
      4: { halign: 'right' }, // Drift $
      5: { halign: 'center' }, // Drift %
      6: { halign: 'center', fontStyle: 'bold' }, // Action
      7: { halign: 'right' }, // Amount
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    didParseCell: (data) => {
      // Color the Action column based on action type
      if (data.column.index === 6 && data.section === 'body') {
        const action = data.cell.raw;
        if (action === 'BUY') {
          data.cell.styles.textColor = colors.blue;
        } else if (action === 'SELL') {
          data.cell.styles.textColor = colors.red;
        } else {
          data.cell.styles.textColor = colors.grayText;
        }
      }

      // Color the Drift % column
      if (data.column.index === 5 && data.section === 'body') {
        const driftStr = data.cell.raw;
        if (driftStr.startsWith('+')) {
          data.cell.styles.textColor = colors.red; // Overweight
        } else if (driftStr.startsWith('-')) {
          data.cell.styles.textColor = colors.green; // Underweight
        }
      }
    },
    margin: { left: margins.left, right: margins.right }
  });

  y = pdf.lastAutoTable.finalY + spacing.sectionGap;

  // Asset Class Summary
  y = renderAssetClassSummary(pdf, positions, y, autoTable);

  return y;
};

/**
 * Render Asset Class Summary table
 */
const renderAssetClassSummary = (pdf, positions, startY, autoTable) => {
  const { margins, colors, spacing } = PDF_CONFIG;

  let y = checkPageBreak(pdf, startY, 40);

  // Section subtitle
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.darkText);
  pdf.text('Asset Class Summary', margins.left, y);
  y += 6;

  const groupedPositions = groupByAssetClass(positions);

  const tableData = groupedPositions.map(group => {
    const driftPercent = group.currentPercent - group.targetPercent;

    return [
      group.assetClass,
      group.tickers.join(', '),
      `${group.currentPercent.toFixed(1)}%`,
      `${group.targetPercent.toFixed(1)}%`,
      `${driftPercent >= 0 ? '+' : ''}${driftPercent.toFixed(1)}%`,
      group.action,
      formatCurrency(Math.abs(group.difference))
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [[
      'Asset Class',
      'Holdings',
      'Current %',
      'Target %',
      'Drift',
      'Action',
      'Amount'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: colors.navyHeader,
      textColor: colors.white,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: 45, fontSize: 7, textColor: colors.grayText },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center', fontStyle: 'bold' },
      6: { halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    didParseCell: (data) => {
      // Color the Action column
      if (data.column.index === 5 && data.section === 'body') {
        const action = data.cell.raw;
        if (action === 'BUY') {
          data.cell.styles.textColor = colors.blue;
        } else if (action === 'SELL') {
          data.cell.styles.textColor = colors.red;
        } else {
          data.cell.styles.textColor = colors.grayText;
        }
      }

      // Color the Drift column
      if (data.column.index === 4 && data.section === 'body') {
        const driftStr = data.cell.raw;
        if (driftStr.startsWith('+')) {
          data.cell.styles.textColor = colors.red;
        } else if (driftStr.startsWith('-')) {
          data.cell.styles.textColor = colors.green;
        }
      }
    },
    margin: { left: margins.left, right: margins.right }
  });

  return pdf.lastAutoTable.finalY + spacing.sectionGap;
};
