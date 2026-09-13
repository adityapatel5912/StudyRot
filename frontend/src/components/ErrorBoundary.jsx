/** Error boundary component preventing feed crashes by displaying a resilient swipeable fallback. */
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          id="post-error-fallback"
          className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-navy-900/50 rounded-2xl border border-red-200 dark:border-red-900/30"
          role="alert"
        >
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-navy-900 dark:text-white mb-1">
            This card couldn't render properly
          </h3>
          <p className="text-xs text-navy-500 dark:text-navy-300 max-w-xs mb-4">
            Swipe or scroll to continue learning without interruption.
          </p>
          <button
            id="retry-post-render-btn"
            onClick={this.handleReset}
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 text-navy-700 dark:text-navy-200 shadow-sm hover:bg-gray-50"
          >
            Retry rendering
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
