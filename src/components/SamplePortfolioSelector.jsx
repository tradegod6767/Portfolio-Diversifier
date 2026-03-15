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

  const getRiskLevelClass = (riskLevel) => {
    switch (riskLevel) {
      case 'Conservative': return 'bg-gain-bg text-gain border border-gain/30';
      case 'Moderate': return 'bg-muted text-muted-foreground border border-border';
      case 'Aggressive': return 'bg-loss-bg text-loss border border-loss/30';
      default: return 'bg-muted text-muted-foreground border border-border';
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
        className="w-full h-11 px-4 bg-primary text-primary-foreground hover:opacity-90 font-semibold text-sm rounded-md transition-opacity mb-4 flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Try a Sample Portfolio
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto">
          {samples.map((sample) => (
            <SamplePortfolioCard
              key={sample.key}
              sample={sample}
              formatCurrency={formatCurrency}
              getRiskLevelClass={getRiskLevelClass}
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

function SamplePortfolioCard({ sample, formatCurrency, getRiskLevelClass, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full p-5 text-left transition-colors border-b border-border last:border-b-0 hover:bg-muted group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-base font-bold text-foreground group-hover:text-foreground transition-colors mb-1">
            {sample.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {sample.description}
          </p>
        </div>
        <span className={`ml-3 px-2.5 py-1 rounded-md text-xs font-semibold flex-shrink-0 ${getRiskLevelClass(sample.riskLevel)}`}>
          {sample.riskLevel}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {sample.positions.map((pos, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border"
          >
            {pos.ticker} {pos.targetPercent}%
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Total Value: <span className="text-foreground font-semibold font-mono" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatCurrency(sample.totalValue)}</span>
        </span>
        <svg
          className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
