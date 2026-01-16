export default function SamplePortfolioBanner({ sampleName, onClear }) {
  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 mb-1">
              Sample Portfolio Loaded: {sampleName}
            </h4>
            <p className="text-sm text-slate-700">
              This is a sample portfolio - edit any values or clear to enter your own
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg p-2 transition-colors flex-shrink-0"
          aria-label="Clear sample portfolio"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
