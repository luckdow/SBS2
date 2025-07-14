'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetKey: string;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      resetKey: this.getResetKey(props.resetKeys)
    };
  }

  private getResetKey(resetKeys?: Array<string | number>): string {
    return resetKeys ? resetKeys.join('|') : '';
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Enhanced error logging for DOM manipulation errors
    const isDOMError = error.message.includes('removeChild') || 
                      error.message.includes('appendChild') || 
                      error.message.includes('insertBefore') ||
                      error.message.includes('replaceChild');

    if (isDOMError) {
      console.group('🚨 DOM Manipulation Error Caught by ErrorBoundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props): void {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    const prevResetKey = this.getResetKey(prevProps.resetKeys);
    const newResetKey = this.getResetKey(resetKeys);

    // Reset error boundary if resetKeys change and we had an error
    if (hasError && 
        resetOnPropsChange && 
        prevResetKey !== newResetKey) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        resetKey: newResetKey
      });
    }
  }

  componentWillUnmount(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleAutoReset = (): void => {
    // Auto-reset after 3 seconds for DOM errors (they're often transient)
    this.resetTimeoutId = window.setTimeout(() => {
      if (this.state.hasError) {
        this.handleReset();
      }
    }, 3000);
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Trigger auto-reset for DOM manipulation errors
      const isDOMError = error?.message.includes('removeChild') || 
                        error?.message.includes('appendChild') || 
                        error?.message.includes('DOM');

      if (isDOMError && !this.resetTimeoutId) {
        this.handleAutoReset();
      }

      // Use custom fallback or default error UI
      if (fallback) {
        return fallback;
      }

      return (
        <div className="bg-red-500/20 backdrop-blur-md border-2 border-red-500/50 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-red-500 p-3 rounded-xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Geçici Hata</h3>
              <p className="text-red-200">
                {isDOMError ? 'Sayfa geçişi sırasında hata oluştu' : 'Bir hata oluştu'}
              </p>
            </div>
          </div>
          
          {isDOMError && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3 mb-4">
              <p className="text-yellow-200 text-sm">
                🔄 Bu hata genellikle geçicidir. 3 saniye içinde otomatik olarak düzelecek.
              </p>
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Tekrar Dene</span>
          </button>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-left">
              <summary className="text-red-300 cursor-pointer text-sm">
                Hata Detayları (Geliştirici)
              </summary>
              <pre className="mt-2 text-xs text-red-200 bg-black/20 p-3 rounded overflow-auto max-h-32">
                {error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

// Convenience wrapper for step-specific error boundaries
export function StepErrorBoundary({ 
  stepName, 
  children, 
  onError 
}: { 
  stepName: string; 
  children: ReactNode; 
  onError?: (error: Error) => void;
}) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log(`Error in ${stepName}:`, error);
        onError?.(error);
      }}
      resetOnPropsChange={true}
      resetKeys={[stepName]}
    >
      {children}
    </ErrorBoundary>
  );
}