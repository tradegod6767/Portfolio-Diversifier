export default function SamplePortfolioBanner({ sampleName, onClear }) {
  return (
    <div className="mb-6 bg-muted border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-0.5">
              Sample Portfolio Loaded: {sampleName}
            </h4>
            <p className="text-sm text-muted-foreground">
              This is a sample portfolio — edit any values or clear to enter your own
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-2 transition-colors flex-shrink-0"
          aria-label="Clear sample portfolio"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
