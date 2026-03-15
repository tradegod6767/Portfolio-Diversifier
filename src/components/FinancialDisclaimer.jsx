import React from 'react';

/**
 * Financial Disclaimer Component
 *
 * LEGAL REQUIREMENT: Displays required disclaimer for financial tools
 * This component should appear:
 * 1. On the landing page
 * 2. In the footer
 * 3. Before rebalancing results
 *
 * @param {Object} props
 * @param {string} props.variant - 'banner' (prominent), 'inline' (subtle), or 'footer' (minimal)
 * @param {string} props.className - Additional CSS classes
 */
export default function FinancialDisclaimer({ variant = 'inline', className = '' }) {
  const disclaimerText = "RebalanceKit is for informational and educational purposes only and does not constitute financial, investment, tax, or legal advice. We do not recommend or endorse any specific securities, investment strategies, or financial products. Consult a licensed financial advisor, tax professional, or attorney before making investment decisions. Past performance does not guarantee future results. All investments carry risk, including potential loss of principal.";

  // Banner variant - prominent display on landing page
  if (variant === 'banner') {
    return (
      <div className={`bg-muted border border-border rounded-lg p-4 md:p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-muted-foreground mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Important Disclaimer
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {disclaimerText}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Footer variant - minimal display in footer
  if (variant === 'footer') {
    return (
      <div className={`text-xs text-muted-foreground leading-relaxed ${className}`}>
        <p className="mb-2">
          <strong className="font-semibold">Disclaimer:</strong> {disclaimerText}
        </p>
      </div>
    );
  }

  // Inline variant - subtle display before results (default)
  return (
    <div className={`bg-muted border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="font-semibold text-foreground">Disclaimer:</strong> {disclaimerText}
        </p>
      </div>
    </div>
  );
}
