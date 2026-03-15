import { useState } from 'react';
import { createPortal } from 'react-dom';

function ImportPortfolioModal({ isOpen, onClose, onImport }) {
  const [activeTab, setActiveTab] = useState('csv');
  const [, setCsvFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const positions = [];
    let hasError = false;
    const errors = [];

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

      if (!ticker || ticker.length > 10) {
        errors.push(`Line ${i + 1}: Invalid ticker "${ticker}"`);
        hasError = true;
        continue;
      }

      const amountNum = parseFloat(amount.replace(/[$,]/g, ''));
      if (isNaN(amountNum) || amountNum < 0) {
        errors.push(`Line ${i + 1}: Invalid amount "${amount}"`);
        hasError = true;
        continue;
      }

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

      if (line.includes(',')) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length === 3) {
          [ticker, amount, target] = parts;
        }
      } else {
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

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-foreground mb-4">Import Portfolio</h3>

        {/* Tabs */}
        <div className="flex border-b border-border mb-4">
          <button
            onClick={() => { setActiveTab('csv'); setError(''); setPreview(null); }}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'csv'
                ? 'border-b-2 border-foreground text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            CSV File
          </button>
          <button
            onClick={() => { setActiveTab('text'); setError(''); setPreview(null); }}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'text'
                ? 'border-b-2 border-foreground text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Paste Text
          </button>
        </div>

        {/* CSV Import */}
        {activeTab === 'csv' && (
          <div className="mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload CSV File
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Format: Ticker,Amount,Target%
              </p>
              <div className="bg-muted border border-border p-2 rounded text-xs font-mono mb-3 text-foreground">
                VTI,30000,60<br />
                BND,15000,30<br />
                CASH,5000,10
              </div>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="block w-full text-sm text-foreground border border-input bg-background rounded-lg cursor-pointer focus:outline-none p-2"
              />
            </div>
          </div>
        )}

        {/* Text Import */}
        {activeTab === 'text' && (
          <div className="mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-2">
                Paste Portfolio Data
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Accepts formats: "VTI $30000 60%" or "VTI,30000,60"
              </p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="VTI $30000 60%&#10;BND $15000 30%&#10;CASH $5000 10%"
                rows={6}
                className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:outline-none font-mono text-sm text-foreground"
              />
            </div>
            <button
              onClick={handleTextPreview}
              disabled={!textInput.trim()}
              className="px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground font-medium rounded-lg text-sm transition-opacity"
            >
              Preview
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-loss-bg border border-loss/30 rounded-lg">
            <p className="text-sm text-loss font-medium mb-1">Import Error:</p>
            <pre className="text-xs text-loss/80 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mb-4 p-4 bg-gain-bg border border-gain/30 rounded-lg">
            <p className="text-sm font-semibold text-gain mb-2">
              Preview ({preview.length} position{preview.length !== 1 ? 's' : ''})
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-gain/30">
                    <th className="text-left py-1 px-2 text-foreground font-medium">Ticker</th>
                    <th className="text-left py-1 px-2 text-foreground font-medium">Amount</th>
                    <th className="text-left py-1 px-2 text-foreground font-medium">Target %</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((pos, idx) => (
                    <tr key={idx} className="border-b border-gain/20">
                      <td className="py-1 px-2 font-medium text-foreground">{pos.ticker}</td>
                      <td className="py-1 px-2 text-muted-foreground font-mono">${parseFloat(pos.amount).toLocaleString()}</td>
                      <td className="py-1 px-2 text-muted-foreground font-mono">{pos.targetPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gain mt-2 font-medium">
              Total target: {preview.reduce((sum, p) => sum + parseFloat(p.targetPercent), 0).toFixed(1)}%
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!preview}
            className="flex-1 px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-medium rounded-lg transition-opacity"
          >
            Import {preview ? `(${preview.length})` : ''}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ImportPortfolioModal;
