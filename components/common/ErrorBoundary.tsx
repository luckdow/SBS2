'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to logging service (if available)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Create error report
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      };

      // Log to console for debugging
      console.error('Error Report:', errorReport);

      // In a real application, you would send this to your error tracking service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      // Sentry.captureException(error, { extra: errorReport });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private getErrorMessage = (error: Error): string => {
    const message = error.message;
    
    // Handle specific error types with user-friendly messages
    if (message.includes('removeChild')) {
      return 'Sayfa yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.';
    }
    
    if (message.includes('Minified React error #31') || message.includes('Objects are not valid as a React child')) {
      return 'Veri görüntülenirken bir hata oluştu. Lütfen tekrar deneyin.';
    }
    
    if (message.includes('Minified React error #310') || message.includes('Cannot update a component while rendering a different component')) {
      return 'Sayfa geçişi sırasında bir hata oluştu. Lütfen tekrar deneyin.';
    }
    
    if (message.includes('Firebase') || message.includes('auth/')) {
      return 'Bağlantı sorunu yaşandı. İnternet bağlantınızı kontrol edip tekrar deneyin.';
    }
    
    if (message.includes('Google Maps') || message.includes('maps')) {
      return 'Harita yüklenirken bir sorun oluştu. Sayfa yeniden yüklenecek.';
    }
    
    // Default user-friendly message
    return 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya tekrar deneyin.';
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' => {
    const message = error.message;
    
    // High severity - app breaking errors
    if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
      return 'high';
    }
    
    // Medium severity - functional issues
    if (message.includes('Firebase') || message.includes('auth/') || message.includes('Minified React error #310')) {
      return 'medium';
    }
    
    // Low severity - display issues
    return 'low';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = this.state.error ? this.getErrorSeverity(this.state.error) : 'medium';
      const userMessage = this.state.error ? this.getErrorMessage(this.state.error) : 'Bir hata oluştu';

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
              {/* Error Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                severity === 'high' ? 'bg-red-500/20 text-red-400' :
                severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                <AlertTriangle className="h-8 w-8" />
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-white mb-3">
                Bir Sorun Oluştu
              </h2>
              <p className="text-white/80 mb-6 leading-relaxed">
                {userMessage}
              </p>

              {/* Error ID */}
              <div className="bg-white/5 rounded-lg p-3 mb-6">
                <p className="text-white/60 text-sm">
                  Hata Kodu: <span className="font-mono text-white/80">{this.state.errorId}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Tekrar Dene</span>
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-white/10 border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Sayfayı Yenile</span>
                </button>

                <Link
                  href="/"
                  className="w-full bg-white/10 border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                >
                  <Home className="h-5 w-5" />
                  <span>Ana Sayfaya Dön</span>
                </Link>
              </div>

              {/* Technical Details (only in development or when showDetails is true) */}
              {(this.props.showDetails || process.env.NODE_ENV === 'development') && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-white/70 text-sm mb-2 select-none">
                    Teknik Detaylar (Geliştiriciler için)
                  </summary>
                  <div className="bg-black/30 rounded-lg p-3 text-xs font-mono text-white/60 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized Error Boundaries for different contexts

export class RouteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `ROUTE_ERR_${Date.now()}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Sayfa Yüklenemedi</h1>
            <p className="text-white/80 mb-6">Bu sayfa yüklenirken bir hata oluştu.</p>
            <div className="space-x-4">
              <button
                onClick={() => window.history.back()}
                className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 inline mr-2" />
                Geri Dön
              </button>
              <Link
                href="/"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center"
              >
                <Home className="h-5 w-5 mr-2" />
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export class GoogleMapsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `MAPS_ERR_${Date.now()}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Google Maps Error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Force cleanup of Google Maps elements
    setTimeout(() => {
      try {
        const googleMapsElements = document.querySelectorAll('.gm-style, .pac-container, [class*="gm-"]');
        googleMapsElements.forEach(element => {
          try {
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
          } catch (cleanupError) {
            console.warn('Maps cleanup error (non-critical):', cleanupError);
          }
        });
      } catch (error) {
        console.warn('Maps cleanup failed (non-critical):', error);
      }
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white/5 border border-white/20 rounded-xl p-6 text-center">
          <div className="text-yellow-400 mb-3">
            <AlertTriangle className="h-8 w-8 mx-auto" />
          </div>
          <h3 className="text-white font-semibold mb-2">Harita Yüklenemedi</h3>
          <p className="text-white/70 text-sm mb-4">
            Harita servisi geçici olarak kullanılamıyor. Sayfa yeniden yüklenecek.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}