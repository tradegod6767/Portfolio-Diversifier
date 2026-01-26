// PDF Generator Configuration
// Design constants for professional financial report

export const PDF_CONFIG = {
  // Page dimensions (A4 in mm)
  pageWidth: 210,
  pageHeight: 297,
  margins: {
    top: 20,
    right: 15,
    bottom: 25,
    left: 15
  },

  // Brand colors (RGB arrays for jsPDF)
  colors: {
    navyHeader: [30, 58, 95],       // #1e3a5f - Primary brand color
    navyDark: [20, 40, 70],         // Darker navy for accents
    darkText: [31, 41, 55],         // #1f2937 - Primary text
    grayText: [107, 114, 128],      // #6b7280 - Secondary text
    lightGray: [249, 250, 251],     // #f9fafb - Table backgrounds
    mediumGray: [229, 231, 235],    // #e5e7eb - Borders
    green: [22, 163, 74],           // #16a34a - BUY/positive
    red: [220, 38, 38],             // #dc2626 - SELL/negative
    blue: [59, 130, 246],           // #3b82f6 - Actions/links
    amber: [245, 158, 11],          // #f59e0b - Warnings
    white: [255, 255, 255],
  },

  // Font sizes
  fonts: {
    title: 22,
    sectionHeader: 14,
    subHeader: 12,
    body: 10,
    small: 9,
    tiny: 8,
    footer: 7,
  },

  // Spacing
  spacing: {
    sectionGap: 12,
    paragraphGap: 6,
    lineHeight: 5,
    tableRowHeight: 7,
  },

  // Header height
  headerHeight: 32,
};

// Helper to get content width
export const getContentWidth = () => {
  return PDF_CONFIG.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right;
};

// Helper to get usable page height (accounting for header and footer)
export const getUsableHeight = () => {
  return PDF_CONFIG.pageHeight - PDF_CONFIG.margins.top - PDF_CONFIG.margins.bottom - 10;
};
