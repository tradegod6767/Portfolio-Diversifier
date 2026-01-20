import { useState, useRef, useEffect } from 'react';
import { getAllSamplePortfolios } from '../utils/samplePortfolios';

export default function SamplePortfolioSelector({ onSelectSample }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const samples = getAllSamplePortfolios();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Conservative':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Aggressive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-gradient-to-r from-[#0A2540] to-[#134576] hover:from-[#0D2F52] hover:to-[#165088] text-white font-semibold text-base rounded-lg transition duration-200 shadow-lg mb-4 flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Try a Sample Portfolio
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full rounded-xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--border-color-strong)' }}
        >
          {samples.map((sample) => (
            <SamplePortfolioCard
              key={sample.key}
              sample={sample}
              formatCurrency={formatCurrency}
              getRiskLevelColor={getRiskLevelColor}
              onSelect={() => {
                onSelectSample(sample);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SamplePortfolioCard({ sample, formatCurrency, getRiskLevelColor, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full p-5 text-left transition-all last:border-b-0 group hover:bg-slate-100"
      style={{ borderBottom: '1px solid var(--border-color)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors mb-1" style={{ color: 'var(--text-primary)' }}>
            {sample.name}
          </h3>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            {sample.description}
          </p>
        </div>
        <span
          className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold border ${getRiskLevelColor(
            sample.riskLevel
          )}`}
        >
          {sample.riskLevel}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {sample.positions.map((pos, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
          >
            {pos.ticker} {pos.targetPercent}%
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Total Value: <span className="text-blue-500">{formatCurrency(sample.totalValue)}</span>
        </span>
        <svg
          className="w-5 h-5 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
          style={{ color: 'var(--text-muted)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
