/**
 * High-Precision Error Boundary with Visual Recovery
 * Isolates component errors, provides recovery actions, and logs silently
 * Prevents white-screen crashes and maintains learning momentum
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error silently without disrupting user
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName || 'Unknown',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', errorData);
    }

    // Send to error tracking service (e.g., Sentry, LogRocket)
    // This is a placeholder - integrate with your error tracking service
    try {
      // Example: Sentry.captureException(error, { extra: errorData });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private handleRetry = () => {
    this.setState({ isRetrying: true });
    
    // Small delay to show loading state
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      });
    }, 500);
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent(`Error Report: ${this.props.componentName || 'Unknown Component'}`);
    const body = encodeURIComponent(
      `Error: ${error?.message}\n\n` +
      `Component: ${this.props.componentName || 'Unknown'}\n\n` +
      `Stack Trace:\n${error?.stack}\n\n` +
      `Component Stack:\n${errorInfo?.componentStack}\n\n` +
      `URL: ${window.location.href}\n` +
      `User Agent: ${navigator.userAgent}`
    );
    window.open(`mailto:support@funfinityacademy.com?subject=${subject}&body=${body}`);
  };

  render() {
    const { hasError, error, isRetrying } = this.state;
    const { children, fallback, componentName } = this.props;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    // Default error UI
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full animate-pulse">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600">
              {componentName ? `The ${componentName} encountered an error.` : 'This section encountered an unexpected error.'}
            </p>
            {import.meta.env.DEV && error && (
              <div className="p-3 bg-red-100 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 break-words">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              aria-label="Retry loading this section"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Again</span>
                </>
              )}
            </button>

            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors min-h-[48px]"
              aria-label="Go to home page"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </button>
          </div>

          {/* Report Bug */}
          <button
            onClick={this.handleReportBug}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Report this bug to support"
          >
            <Bug className="w-4 h-4" />
            <span>Report Bug</span>
          </button>
        </div>
      </div>
    );
  }
}

/**
 * HOC to wrap components with Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary componentName={componentName}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Async Error Boundary for handling async errors
 * Useful for data fetching and async operations
 */
export class AsyncErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName || 'Async Component',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    if (import.meta.env.DEV) {
      console.error('Async Error Boundary caught an error:', errorData);
    }

    try {
      // Send to error tracking service
    } catch (loggingError) {
      console.error('Failed to log async error:', loggingError);
    }
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    return fallback || (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-yellow-800">
          This content failed to load. Please refresh the page.
        </p>
      </div>
    );
  }
}
