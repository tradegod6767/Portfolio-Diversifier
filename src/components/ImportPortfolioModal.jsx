import { useState } from 'react';

function ImportPortfolioModal({ isOpen, onClose, onImport }) {
  const [activeTab, setActiveTab] = useState('csv');
  const [csvFile, setCsvFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const positions = [];
    let hasError = false;
    const errors = [];

    // Skip header if it exists
    const startIndex = lines[0].toLowerCase().includes('ticker') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());

      if (parts.length !== 3) {
        errors.push(`Line ${i + 1}: Expected 3 columns (Ticker,Amount,Target%)`);
        hasError = true;
        continue;
      }

      const [ticker, amount, target] = parts;

      // Validate ticker (basic check)
      if (!ticker || ticker.length > 10) {
        errors.push(`Line ${i + 1}: Invalid ticker "${ticker}"`);
        hasError = true;
        continue;
      }

      // Validate amount
      const amountNum = parseFloat(amount.replace(/[$,]/g, ''));
      if (isNaN(amountNum) || amountNum < 0) {
        errors.push(`Line ${i + 1}: Invalid amount "${amount}"`);
        hasError = true;
        continue;
      }

      // Validate target percentage
      const targetNum = parseFloat(target.replace(/%/g, ''));
      if (isNaN(targetNum) || targetNum < 0 || targetNum > 100) {
        errors.push(`Line ${i + 1}: Invalid target "${target}"`);
        hasError = true;
        continue;
      }

      positions.push({
        ticker: ticker.toUpperCase(),
        amount: amountNum.toString(),
        targetPercent: targetNum.toString()
      });
    }

    if (positions.length === 0) {
      throw new Error('No valid positions found in file');
    }

    if (hasError) {
      throw new Error(errors.join('\n'));
    }

    return positions;
  };

  const parseText = (text) => {
    const lines = text.trim().split('\n');
    const positions = [];
    let hasError = false;
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Try multiple formats:
      // 1. "VTI $30000 60%"
      // 2. "VTI 30000 60"
      // 3. "VTI,30000,60"

      let ticker, amount, target;

      // Try comma-separated first
      if (line.includes(',')) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length === 3) {
          [ticker, amount, target] = parts;
        }
      } else {
        // Try space-separated
        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
          ticker = parts[0];
          amount = parts[1];
          target = parts[2];
        }
      }

      if (!ticker || !amount || !target) {
        errors.push(`Line ${i + 1}: Could not parse "${line}"`);
        hasError = true;
        continue;
      }

      // Clean and validate
      ticker = ticker.toUpperCase().replace(/[^A-Z]/g, '');
      const amountNum = parseFloat(amount.replace(/[$,]/g, ''));
      const targetNum = parseFloat(target.replace(/%/g, ''));

      if (!ticker || ticker.length > 10) {
        errors.push(`Line ${i + 1}: Invalid ticker "${ticker}"`);
        hasError = true;
        continue;
      }

      if (isNaN(amountNum) || amountNum < 0) {
        errors.push(`Line ${i + 1}: Invalid amount "${amount}"`);
        hasError = true;
        continue;
      }

      if (isNaN(targetNum) || targetNum < 0 || targetNum > 100) {
        errors.push(`Line ${i + 1}: Invalid target "${target}"`);
        hasError = true;
        continue;
      }

      positions.push({
        ticker,
        amount: amountNum.toString(),
        targetPercent: targetNum.toString()
      });
    }

    if (positions.length === 0) {
      throw new Error('No valid positions found');
    }

    if (hasError) {
      throw new Error(errors.join('\n'));
    }

    return positions;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    setError('');
    setPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const positions = parseCSV(text);
        setPreview(positions);
      } catch (err) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleTextPreview = () => {
    setError('');
    setPreview(null);

    try {
      const positions = parseText(textInput);
      setPreview(positions);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmImport = () => {
    if (!preview) return;

    const totalTarget = preview.reduce((sum, p) => sum + parseFloat(p.targetPercent), 0);
    if (Math.abs(totalTarget - 100) > 0.01) {
      setError(`Target allocations must sum to 100% (currently ${totalTarget.toFixed(2)}%)`);
      return;
    }

    onImport(preview);
    handleClose();
  };

  const handleClose = () => {
    setCsvFile(null);
    setTextInput('');
    setPreview(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Import Portfolio</h3>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => { setActiveTab('csv'); setError(''); setPreview(null); }}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'csv'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            CSV File
          </button>
          <button
            onClick={() => { setActiveTab('text'); setError(''); setPreview(null); }}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'text'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Paste Text
          </button>
        </div>

        {/* CSV Import */}
        {activeTab === 'csv' && (
          <div className="mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Format: Ticker,Amount,Target%
              </p>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono mb-3">
                VTI,30000,60<br />
                BND,15000,30<br />
                CASH,5000,10
              </div>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
              />
            </div>
          </div>
        )}

        {/* Text Import */}
        {activeTab === 'text' && (
          <div className="mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Portfolio Data
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Accepts formats: "VTI $30000 60%" or "VTI,30000,60"
              </p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="VTI $30000 60%&#10;BND $15000 30%&#10;CASH $5000 10%"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
            <button
              onClick={handleTextPreview}
              disabled={!textInput.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg text-sm"
            >
              Preview
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-1">Import Error:</p>
            <pre className="text-xs text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800 mb-2">
              Preview ({preview.length} position{preview.length !== 1 ? 's' : ''})
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-green-300">
                    <th className="text-left py-1 px-2">Ticker</th>
                    <th className="text-left py-1 px-2">Amount</th>
                    <th className="text-left py-1 px-2">Target %</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((pos, idx) => (
                    <tr key={idx} className="border-b border-green-200">
                      <td className="py-1 px-2 font-medium">{pos.ticker}</td>
                      <td className="py-1 px-2">${parseFloat(pos.amount).toLocaleString()}</td>
                      <td className="py-1 px-2">{pos.targetPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-green-700 mt-2">
              Total target: {preview.reduce((sum, p) => sum + parseFloat(p.targetPercent), 0).toFixed(1)}%
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!preview}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg"
          >
            Import {preview ? `(${preview.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportPortfolioModal;
