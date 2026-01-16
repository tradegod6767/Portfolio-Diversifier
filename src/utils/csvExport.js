/**
 * CSV Export Utilities for RebalanceKit
 */

/**
 * Escape a value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles any existing quotes
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Check if value needs to be quoted
  const needsQuotes = stringValue.includes(',') ||
                      stringValue.includes('"') ||
                      stringValue.includes('\n') ||
                      stringValue.includes('\r');

  if (needsQuotes) {
    // Double any existing quotes and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert an array of objects to CSV string
 */
function arrayToCSV(headers, rows) {
  const headerRow = headers.map(h => escapeCSVValue(h.label)).join(',');

  const dataRows = rows.map(row => {
    return headers.map(h => escapeCSVValue(row[h.key])).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Get formatted date string for filename
 */
function getDateString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Trigger browser download of CSV file
 */
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export Holdings CSV
 * Columns: Ticker, Shares, Current Price, Current Value, Current %, Target %, Difference %
 */
export function exportHoldingsCSV(results) {
  const headers = [
    { key: 'ticker', label: 'Ticker' },
    { key: 'shares', label: 'Shares' },
    { key: 'currentPrice', label: 'Current Price' },
    { key: 'currentValue', label: 'Current Value' },
    { key: 'currentPercent', label: 'Current %' },
    { key: 'targetPercent', label: 'Target %' },
    { key: 'differencePercent', label: 'Difference %' },
  ];

  const rows = results.positions.map(pos => {
    // Calculate shares and price if we have the data
    // Note: currentAmount is the dollar value, not shares
    const currentValue = pos.currentAmount || 0;
    const differencePercent = pos.targetPercent - pos.currentPercent;

    return {
      ticker: pos.ticker,
      shares: pos.shares || 'N/A', // May not have share data
      currentPrice: pos.price ? `$${pos.price.toFixed(2)}` : 'N/A',
      currentValue: `$${currentValue.toFixed(2)}`,
      currentPercent: `${pos.currentPercent.toFixed(2)}%`,
      targetPercent: `${pos.targetPercent.toFixed(2)}%`,
      differencePercent: `${differencePercent >= 0 ? '+' : ''}${differencePercent.toFixed(2)}%`,
    };
  });

  const csvContent = arrayToCSV(headers, rows);
  const filename = `rebalancekit-holdings-${getDateString()}.csv`;

  downloadCSV(csvContent, filename);
}

/**
 * Export Trade Recommendations CSV
 * Columns: Ticker, Action (Buy/Sell), Shares, Estimated Value, From %, To %
 */
export function exportTradesCSV(results) {
  const headers = [
    { key: 'ticker', label: 'Ticker' },
    { key: 'action', label: 'Action' },
    { key: 'shares', label: 'Shares' },
    { key: 'estimatedValue', label: 'Estimated Value' },
    { key: 'fromPercent', label: 'From %' },
    { key: 'toPercent', label: 'To %' },
  ];

  // Filter to only include positions that need action
  const tradesOnly = results.positions.filter(pos =>
    pos.action === 'BUY' || pos.action === 'SELL'
  );

  const rows = tradesOnly.map(pos => {
    const estimatedValue = Math.abs(pos.difference);

    return {
      ticker: pos.ticker,
      action: pos.action,
      shares: pos.sharesToTrade || 'N/A', // May not have share data
      estimatedValue: `$${estimatedValue.toFixed(2)}`,
      fromPercent: `${pos.currentPercent.toFixed(2)}%`,
      toPercent: `${pos.targetPercent.toFixed(2)}%`,
    };
  });

  // Add a summary row if there are trades
  if (rows.length > 0) {
    const totalBuys = tradesOnly
      .filter(p => p.action === 'BUY')
      .reduce((sum, p) => sum + Math.abs(p.difference), 0);
    const totalSells = tradesOnly
      .filter(p => p.action === 'SELL')
      .reduce((sum, p) => sum + Math.abs(p.difference), 0);

    // Add empty row then summary
    rows.push({
      ticker: '',
      action: '',
      shares: '',
      estimatedValue: '',
      fromPercent: '',
      toPercent: '',
    });
    rows.push({
      ticker: 'TOTAL BUYS',
      action: '',
      shares: '',
      estimatedValue: `$${totalBuys.toFixed(2)}`,
      fromPercent: '',
      toPercent: '',
    });
    rows.push({
      ticker: 'TOTAL SELLS',
      action: '',
      shares: '',
      estimatedValue: `$${totalSells.toFixed(2)}`,
      fromPercent: '',
      toPercent: '',
    });
  }

  const csvContent = arrayToCSV(headers, rows);
  const filename = `rebalancekit-trades-${getDateString()}.csv`;

  downloadCSV(csvContent, filename);
}
