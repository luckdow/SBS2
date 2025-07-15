// Reactive Error Handler Service for SBS2
// Helps prevent state updates on unmounted components and manages async operations safely

import React, { useRef, useEffect, useCallback } from 'react';

export interface SafeAsyncOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  fallbackValue?: any;
  onError?: (error: Error) => void;
}

export class ReactiveErrorHandler {
  // Create a safe async operation wrapper that respects component lifecycle
  static useSafeAsync() {
    const isMountedRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        // Abort any pending requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    const safeAsyncCall = useCallback(async <T>(
      asyncFn: (signal?: AbortSignal) => Promise<T>,
      options: SafeAsyncOptions = {}
    ): Promise<T | undefined> => {
      const {
        timeout = 10000,
        retries = 0,
        retryDelay = 1000,
        fallbackValue,
        onError
      } = options;

      // Create new abort controller for this operation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          // Check if component is still mounted
          if (!isMountedRef.current) {
            return fallbackValue;
          }

          // Set timeout
          const timeoutId = setTimeout(() => {
            abortController.abort();
          }, timeout);

          try {
            const result = await asyncFn(abortController.signal);
            clearTimeout(timeoutId);
            
            // Final check before returning
            if (!isMountedRef.current) {
              return fallbackValue;
            }
            
            return result;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        } catch (error) {
          lastError = error as Error;
          
          // Don't retry if component is unmounted or operation was aborted
          if (!isMountedRef.current || abortController.signal.aborted) {
            return fallbackValue;
          }
          
          // Don't retry on the last attempt
          if (attempt === retries) {
            break;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      // Handle final error
      if (lastError && onError) {
        onError(lastError);
      }
      
      console.warn('Safe async operation failed after retries:', lastError);
      return fallbackValue;
    }, []);

    const isMounted = useCallback(() => isMountedRef.current, []);

    return { safeAsyncCall, isMounted };
  }

  // Create a safe state setter that prevents updates on unmounted components
  static useSafeState<T>(initialState: T) {
    const isMountedRef = useRef(true);
    const [state, setState] = React.useState<T>(initialState);

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    const safeSetState = useCallback((newState: T | ((prev: T) => T)) => {
      if (isMountedRef.current) {
        setState(newState);
      } else {
        console.warn('Attempted to set state on unmounted component (prevented)');
      }
    }, []);

    return [state, safeSetState] as const;
  }

  // Error boundary helpers
  static handleComponentError(error: Error, errorInfo: React.ErrorInfo, componentName: string) {
    const errorReport = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    };

    console.error(`Component Error in ${componentName}:`, errorReport);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // ErrorTracker.captureException(error, { extra: errorReport });
    }

    return errorReport;
  }

  // DOM operation safety helpers
  static safeDOMOperation<T>(
    operation: () => T,
    operationName: string,
    fallbackValue?: T
  ): T | undefined {
    try {
      if (typeof window === 'undefined') {
        console.warn(`DOM operation "${operationName}" attempted on server side`);
        return fallbackValue;
      }
      
      return operation();
    } catch (error) {
      console.warn(`Safe DOM operation "${operationName}" failed:`, error);
      return fallbackValue;
    }
  }

  // Firebase operation safety helpers
  static async safeFirebaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: SafeAsyncOptions = {}
  ): Promise<T | undefined> {
    const { retries = 2, retryDelay = 1000, onError } = options;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry certain errors
        if (
          error.code === 'permission-denied' ||
          error.code === 'not-found' ||
          error.code === 'already-exists' ||
          error.message.includes('No document to update')
        ) {
          break;
        }
        
        // Wait before retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    if (lastError) {
      const userFriendlyMessage = this.getFirebaseErrorMessage(lastError);
      const enhancedError = new Error(userFriendlyMessage);
      enhancedError.cause = lastError;
      
      if (onError) {
        onError(enhancedError);
      }
      
      throw enhancedError;
    }
  }

  // Convert Firebase errors to user-friendly messages
  static getFirebaseErrorMessage(error: any): string {
    const code = error.code || '';
    const message = error.message || '';

    if (code.includes('auth/')) {
      switch (code) {
        case 'auth/popup-closed-by-user':
          return 'Giriş penceresi kapatıldı. Lütfen tekrar deneyin.';
        case 'auth/popup-blocked':
          return 'Popup engellendi. Lütfen tarayıcı ayarlarınızı kontrol edin.';
        case 'auth/user-not-found':
          return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
        case 'auth/wrong-password':
          return 'Hatalı şifre girdiniz.';
        case 'auth/email-already-in-use':
          return 'Bu e-posta adresi zaten kullanımda.';
        case 'auth/weak-password':
          return 'Şifre çok zayıf. Lütfen daha güçlü bir şifre seçin.';
        case 'auth/invalid-email':
          return 'Geçersiz e-posta adresi.';
        case 'auth/network-request-failed':
          return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
        default:
          return 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      }
    }

    if (code.includes('firestore/') || message.includes('No document')) {
      if (message.includes('No document to update')) {
        return 'Güncellenecek kayıt bulunamadı. Kayıt silinmiş olabilir.';
      }
      switch (code) {
        case 'permission-denied':
          return 'Bu işlem için yetkiniz bulunmamaktadır.';
        case 'not-found':
          return 'İstenen kayıt bulunamadı.';
        case 'already-exists':
          return 'Bu kayıt zaten mevcut.';
        case 'unavailable':
          return 'Veritabanı geçici olarak kullanılamıyor. Lütfen tekrar deneyin.';
        default:
          return 'Veritabanı işlemi sırasında hata oluştu.';
      }
    }

    // Default fallback
    return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
  }

  // React error helpers
  static getReactErrorMessage(error: Error): string {
    const message = error.message;

    if (message.includes('Minified React error #31')) {
      return 'Veri görüntülenirken bir hata oluştu. Lütfen tekrar deneyin.';
    }

    if (message.includes('Minified React error #310')) {
      return 'Sayfa geçişi sırasında bir hata oluştu. Lütfen tekrar deneyin.';
    }

    if (message.includes('removeChild')) {
      return 'Sayfa yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.';
    }

    if (message.includes('Cannot update a component')) {
      return 'Komponent güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
    }

    return 'Beklenmeyen bir React hatası oluştu. Lütfen sayfayı yenileyin.';
  }
}

export default ReactiveErrorHandler;