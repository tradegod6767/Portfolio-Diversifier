// Professional PDF Generator for RebalanceKit
// Generates comprehensive financial advisory reports

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

import { PDF_CONFIG } from './config.js';
import {
  addPageHeader,
  addFooters,
  generateReportId,
  formatReportDate
} from './helpers/layoutUtils.js';

import { renderHeader } from './sections/header.js';
import { renderExecutiveSummary } from './sections/executiveSummary.js';
import { renderPositionAnalysis } from './sections/positionAnalysis.js';
import { renderCharts } from './sections/charts.js';
import { renderRiskAnalysis } from './sections/riskAnalysis.js';
import { renderAIAnalysis } from './sections/aiAnalysis.js';
import { renderAppendix } from './sections/appendix.js';

/**
 * Generate a professional PDF report
 * @param {object} data - Report data
 * @param {number} data.totalValue - Total portfolio value
 * @param {Array} data.positions - Array of position objects
 * @param {string} data.aiExplanation - AI-generated analysis (optional)
 * @param {object} options - Generation options
 * @param {boolean} options.isPro - Whether user is Pro subscriber
 * @param {string} options.userEmail - User's email (optional)
 * @param {function} options.onProgress - Progress callback (0-100)
 * @returns {Promise<void>} - Resolves when PDF is downloaded
 */
export const generatePDF = async (data, options = {}) => {
  const {
    isPro = false,
    userEmail = null,
    onProgress = () => {}
  } = options;

  try {
    onProgress(5, 'Initializing document...');

    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const { margins } = PDF_CONFIG;

    // Generate report metadata
    const reportId = generateReportId();
    const generatedDate = formatReportDate();

    // Get charts element for capture
    const chartsElement = document.querySelector('[data-charts]');

    onProgress(10, 'Rendering header...');

    // Render header (first page)
    let y = renderHeader(pdf, {
      reportId,
      generatedDate,
      userEmail
    });

    onProgress(20, 'Creating executive summary...');

    // Executive Summary
    y = renderExecutiveSummary(pdf, data, y, { isPro });

    onProgress(35, 'Capturing charts...');

    // Charts
    y = await renderCharts(pdf, chartsElement, y, html2canvas);

    onProgress(50, 'Building position tables...');

    // Position Analysis
    y = renderPositionAnalysis(pdf, data, y, autoTable);

    onProgress(65, 'Analyzing risk factors...');

    // Risk Analysis
    y = renderRiskAnalysis(pdf, data, y, { isPro });

    onProgress(75, 'Formatting AI analysis...');

    // AI Analysis (if available)
    if (data.aiExplanation) {
      renderAIAnalysis(pdf, data.aiExplanation, y);
    }

    onProgress(85, 'Adding appendix...');

    // Appendix
    renderAppendix(pdf, data, { isPro });

    onProgress(92, 'Adding headers and footers...');

    // Add headers to all pages (except first which has full header)
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      addPageHeader(pdf, i, {
        reportId,
        generatedDate,
        userEmail
      });
    }

    // Add footers to all pages
    addFooters(pdf);

    onProgress(98, 'Saving PDF...');

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `RebalanceKit-Report-${dateStr}.pdf`;

    // Save the PDF
    pdf.save(filename);

    onProgress(100, 'Complete!');

    return { success: true, filename };

  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

/**
 * Generate PDF and return as blob (for preview or upload)
 * @param {object} data - Report data
 * @param {object} options - Generation options
 * @returns {Promise<Blob>} - PDF as blob
 */
export const generatePDFBlob = async (data, options = {}) => {
  const {
    isPro = false,
    userEmail = null,
    onProgress = () => {}
  } = options;

  try {
    onProgress(5, 'Initializing document...');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const { margins } = PDF_CONFIG;

    const reportId = generateReportId();
    const generatedDate = formatReportDate();
    const chartsElement = document.querySelector('[data-charts]');

    onProgress(10, 'Rendering header...');
    let y = renderHeader(pdf, { reportId, generatedDate, userEmail });

    onProgress(20, 'Creating executive summary...');
    y = renderExecutiveSummary(pdf, data, y, { isPro });

    onProgress(35, 'Capturing charts...');
    y = await renderCharts(pdf, chartsElement, y, html2canvas);

    onProgress(50, 'Building position tables...');
    y = renderPositionAnalysis(pdf, data, y, autoTable);

    onProgress(65, 'Analyzing risk factors...');
    y = renderRiskAnalysis(pdf, data, y, { isPro });

    onProgress(75, 'Formatting AI analysis...');
    if (data.aiExplanation) {
      renderAIAnalysis(pdf, data.aiExplanation, y);
    }

    onProgress(85, 'Adding appendix...');
    renderAppendix(pdf, data, { isPro });

    onProgress(92, 'Adding headers and footers...');
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      addPageHeader(pdf, i, { reportId, generatedDate, userEmail });
    }
    addFooters(pdf);

    onProgress(100, 'Complete!');

    return pdf.output('blob');

  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

export default generatePDF;
