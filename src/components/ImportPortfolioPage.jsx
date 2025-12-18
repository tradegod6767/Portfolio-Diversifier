import { useState } from 'react';

function ImportPortfolioPage({ onBack }) {
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

    onBack(preview);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onBack()}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200 shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Portfolio Form
      </button>

      <h2 className="text-2xl font-bold text-gray-900">Import Portfolio</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('csv'); setError(''); setPreview(null); }}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'csv'
              ? 'border-b-2 border-slate-900 text-slate-900'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          CSV File
        </button>
        <button
          onClick={() => { setActiveTab('text'); setError(''); setPreview(null); }}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'text'
              ? 'border-b-2 border-slate-900 text-slate-900'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Paste Text
        </button>
      </div>

      {/* CSV Import */}
      {activeTab === 'csv' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <p className="text-sm text-gray-600 mb-2">
              Format: Ticker,Amount,Target%
            </p>
            <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono mb-4">
              VTI,30000,60<br />
              BND,15000,30<br />
              CASH,5000,10
            </div>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-3"
            />
          </div>
        </div>
      )}

      {/* Text Import */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Portfolio Data
            </label>
            <p className="text-sm text-gray-600 mb-2">
              Accepts formats: "VTI $30000 60%" or "VTI,30000,60"
            </p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="VTI $30000 60%&#10;BND $15000 30%&#10;CASH $5000 10%"
              rows={8}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-800 font-mono text-sm"
            />
          </div>
          <button
            onClick={handleTextPreview}
            disabled={!textInput.trim()}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white font-semibold rounded-lg text-sm"
          >
            Preview
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-sm text-red-800 font-semibold mb-1">Import Error:</p>
          <pre className="text-xs text-red-700 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="p-5 bg-green-50 border-2 border-green-300 rounded-lg">
          <p className="text-base font-bold text-green-800 mb-3">
            Preview ({preview.length} position{preview.length !== 1 ? 's' : ''})
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-green-400">
                  <th className="text-left py-2 px-3 font-bold">Ticker</th>
                  <th className="text-left py-2 px-3 font-bold">Amount</th>
                  <th className="text-left py-2 px-3 font-bold">Target %</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((pos, idx) => (
                  <tr key={idx} className="border-b border-green-200">
                    <td className="py-2 px-3 font-bold">{pos.ticker}</td>
                    <td className="py-2 px-3">${parseFloat(pos.amount).toLocaleString()}</td>
                    <td className="py-2 px-3">{pos.targetPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-green-700 mt-3 font-medium">
            Total target: {preview.reduce((sum, p) => sum + parseFloat(p.targetPercent), 0).toFixed(1)}%
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => onBack()}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmImport}
          disabled={!preview}
          className="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg"
        >
          Import {preview ? `(${preview.length})` : ''}
        </button>
      </div>
    </div>
  );
}

export default ImportPortfolioPage;
