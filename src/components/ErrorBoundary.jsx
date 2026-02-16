import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--error-bg)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h1>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#0A2540] text-white font-semibold rounded-lg hover:bg-[#0D2F52] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
