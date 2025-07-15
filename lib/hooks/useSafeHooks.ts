// Safe React Hooks for SBS2
// Custom hooks that handle component lifecycle and prevent common React errors

import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

// Hook for safe async operations that respect component lifecycle
export function useSafeAsync() {
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
    options: {
      timeout?: number;
      retries?: number;
      retryDelay?: number;
      fallbackValue?: T;
      onError?: (error: Error) => void;
      showErrorToast?: boolean;
    } = {}
  ): Promise<T | undefined> => {
    const {
      timeout = 10000,
      retries = 1,
      retryDelay = 1000,
      fallbackValue,
      onError,
      showErrorToast = true
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
        
        // Wait before retry if not the last attempt
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    // Handle final error
    if (lastError && isMountedRef.current) {
      if (onError) {
        onError(lastError);
      }
      
      if (showErrorToast) {
        const userMessage = getUserFriendlyErrorMessage(lastError);
        toast.error(userMessage);
      }
    }
    
    return fallbackValue;
  }, []);

  const isMounted = useCallback(() => isMountedRef.current, []);

  return { safeAsyncCall, isMounted };
}

// Hook for safe state management that prevents updates on unmounted components
export function useSafeState<T>(initialState: T | (() => T)) {
  const isMountedRef = useRef(true);
  const [state, setState] = useState<T>(initialState);

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

// Hook for safe Firebase operations with automatic error handling
export function useSafeFirebase() {
  const { safeAsyncCall } = useSafeAsync();

  const safeFirebaseCall = useCallback(async <T>(
    firebaseOperation: () => Promise<T>,
    options: {
      operationName?: string;
      retries?: number;
      showErrorToast?: boolean;
      fallbackValue?: T;
    } = {}
  ): Promise<T | undefined> => {
    const { operationName = 'Firebase operation', retries = 2, showErrorToast = true, fallbackValue } = options;

    return safeAsyncCall(
      async () => {
        try {
          return await firebaseOperation();
        } catch (error: any) {
          // Enhanced error handling for specific Firebase errors
          if (error.code === 'permission-denied') {
            throw new Error('Bu işlem için yetkiniz bulunmamaktadır.');
          } else if (error.code === 'not-found' || error.message?.includes('No document to update')) {
            throw new Error('İstenen kayıt bulunamadı. Kayıt silinmiş olabilir.');
          } else if (error.code === 'unavailable') {
            throw new Error('Veritabanı geçici olarak kullanılamıyor. Lütfen tekrar deneyin.');
          } else if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Giriş penceresi kapatıldı. Lütfen tekrar deneyin.');
          } else if (error.code === 'auth/network-request-failed') {
            throw new Error('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.');
          }
          
          // Re-throw with original error for logging
          throw error;
        }
      },
      {
        retries,
        showErrorToast,
        fallbackValue,
        onError: (error) => {
          console.error(`${operationName} failed:`, error);
        }
      }
    );
  }, [safeAsyncCall]);

  return { safeFirebaseCall };
}

// Hook for managing loading states safely
export function useSafeLoading(initialLoading: boolean = false) {
  const [loading, setLoading] = useSafeState(initialLoading);
  const [error, setError] = useSafeState<string | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, [setLoading, setError]);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const setErrorState = useCallback((errorMessage: string | Error) => {
    setLoading(false);
    const message = errorMessage instanceof Error ? errorMessage.message : errorMessage;
    setError(message);
  }, [setLoading, setError]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setError: setErrorState,
    clearError
  };
}

// Utility function to convert technical errors to user-friendly messages
function getUserFriendlyErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  // React-specific errors
  if (message.includes('minified react error #31') || message.includes('objects are not valid as a react child')) {
    return 'Veri görüntülenirken bir hata oluştu. Lütfen tekrar deneyin.';
  }
  
  if (message.includes('minified react error #310') || message.includes('cannot update a component')) {
    return 'Sayfa geçişi sırasında bir hata oluştu. Lütfen tekrar deneyin.';
  }

  // DOM-specific errors
  if (message.includes('removechild') || message.includes('not a child')) {
    return 'Sayfa yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.';
  }

  // Google Maps errors
  if (message.includes('google maps') || message.includes('maps')) {
    return 'Harita yüklenirken bir sorun oluştu. Sayfa yeniden yüklenecek.';
  }

  // Firebase errors (already handled in specific hook)
  if (message.includes('firebase') || message.includes('auth/') || message.includes('firestore/')) {
    return error.message; // These should already be user-friendly from the Firebase hook
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.';
  }

  // Default fallback
  return 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya tekrar deneyin.';
}

// Hook for safe Google Maps operations
export function useSafeGoogleMaps() {
  const { safeAsyncCall } = useSafeAsync();

  const safeMapsCall = useCallback(async <T>(
    mapsOperation: () => Promise<T>,
    options: {
      operationName?: string;
      fallbackValue?: T;
      showErrorToast?: boolean;
    } = {}
  ): Promise<T | undefined> => {
    const { operationName = 'Google Maps operation', fallbackValue, showErrorToast = true } = options;

    return safeAsyncCall(
      async () => {
        try {
          return await mapsOperation();
        } catch (error: any) {
          // Enhanced error handling for Google Maps specific errors
          if (error.message?.includes('google maps') || error.message?.includes('maps')) {
            throw new Error('Harita servisi geçici olarak kullanılamıyor. Sayfa yeniden yüklenecek.');
          }
          
          if (error.message?.includes('network') || error.message?.includes('load')) {
            throw new Error('Harita yüklenirken ağ hatası oluştu. İnternet bağlantınızı kontrol edin.');
          }
          
          throw error;
        }
      },
      {
        retries: 1,
        showErrorToast,
        fallbackValue,
        onError: (error) => {
          console.error(`${operationName} failed:`, error);
          
          // Force page reload for critical Maps errors
          if (error.message.includes('yeniden yüklenecek')) {
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      }
    );
  }, [safeAsyncCall]);

  return { safeMapsCall };
}

export default {
  useSafeAsync,
  useSafeState,
  useSafeFirebase,
  useSafeLoading,
  useSafeGoogleMaps
};