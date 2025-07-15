'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 2;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if this is a DOM manipulation error (the specific error we're trying to fix)
    const isDOMError = error.message.includes('removeChild') || 
                      error.message.includes('appendChild') ||
                      error.message.includes('insertBefore') ||
                      error.name === 'DOMException';

    if (isDOMError) {
      console.warn('DOM manipulation error caught - this is likely related to Google Maps cleanup');
      
      // Force cleanup of any remaining Google Maps elements
      try {
        // Import GoogleMapsService dynamically to avoid SSR issues
        import('../../lib/services/googleMapsService').then(({ GoogleMapsService }) => {
          GoogleMapsService.forceCleanupAllGoogleMapsElements();
        });
      } catch (cleanupError) {
        console.warn('Could not perform emergency Google Maps cleanup:', cleanupError);
      }
    }

    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying... (attempt ${this.retryCount}/${this.maxRetries})`);
      
      // Force cleanup before retry
      try {
        import('../../lib/services/googleMapsService').then(({ GoogleMapsService }) => {
          GoogleMapsService.forceCleanupAllGoogleMapsElements();
          
          // Reset the error state after cleanup
          setTimeout(() => {
            this.setState({
              hasError: false,
              error: null,
              errorInfo: null,
            });
          }, 100);
        });
      } catch (error) {
        // Fallback retry without cleanup
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
        });
      }
    } else {
      console.warn('Maximum retry attempts reached');
    }
  };

  render() {
    if (this.state.hasError) {
      // Check if this is a DOM-related error
      const isDOMError = this.state.error?.message.includes('removeChild') || 
                        this.state.error?.message.includes('appendChild') ||
                        this.state.error?.message.includes('insertBefore') ||
                        this.state.error?.name === 'DOMException';

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isDOMError ? 'Sayfa Yenileniyor' : 'Bir Hata Oluştu'}
              </h2>
              <p className="text-white/70">
                {isDOMError 
                  ? 'Harita bileşenleri yeniden yükleniyor. Lütfen bekleyin.' 
                  : 'Beklenmedik bir hata oluştu. Sayfayı yenilemeyi deneyin.'
                }
              </p>
            </div>

            {isDOMError && (
              <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                <p className="text-blue-200 text-sm">
                  💡 Bu hata genellikle harita bileşenlerinin yüklenmesi sırasında oluşur ve otomatik olarak düzeltilir.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {this.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="w-full group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Yeniden Dene ({this.maxRetries - this.retryCount} kalan)</span>
                </button>
              )}
              
              <Link 
                href="/"
                className="w-full group inline-flex items-center justify-center px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-medium space-x-2"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span>Ana Sayfaya Dön</span>
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-white/60 text-sm cursor-pointer hover:text-white/80">
                  Geliştirici Detayları
                </summary>
                <div className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-red-300 font-mono overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}