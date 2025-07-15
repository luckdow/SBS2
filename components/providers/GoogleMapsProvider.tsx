'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

interface GoogleMapsContextType {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  google: typeof window.google | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  isLoading: true,
  error: null,
  google: null,
});

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within GoogleMapsProvider');
  }
  return context;
};

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [google, setGoogle] = useState<typeof window.google | null>(null);
  
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const loadGoogleMaps = async () => {
      try {
        if (!isMountedRef.current) return;
        
        setIsLoading(true);
        setError(null);
        
        // Load Google Maps using our central service
        const googleMaps = await GoogleMapsService.loadGoogleMaps();
        
        if (!isMountedRef.current) return;
        
        setGoogle(googleMaps);
        setIsLoaded(true);
        
        console.log('✅ Google Maps loaded globally via GoogleMapsProvider');
      } catch (err) {
        if (!isMountedRef.current) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Google Maps yüklenemedi';
        setError(errorMessage);
        console.warn('⚠️ Google Maps global loading failed:', errorMessage);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadGoogleMaps();

    // Component unmount olduğunda (sayfadan kaldırıldığında) çalışacak temizlik fonksiyonu
    return () => {
      console.log('🧹 GoogleMapsProvider: Component unmounting, starting cleanup...');
      isMountedRef.current = false;
      
      // *** ANA DÜZELTME: Hatalı `safeDOMOperation` fonksiyonu kaldırıldı. ***
      // Artık doğrudan, daha önce oluşturduğumuz güvenli temizlik fonksiyonunu çağırıyoruz.
      // Bu, var olmayan bir fonksiyonu çağırma hatasını düzeltir.
      try {
        GoogleMapsService.forceCleanupAllGoogleMapsElements();
      } catch (cleanupError) {
        console.warn('GoogleMapsProvider cleanup error (non-critical):', cleanupError);
      }
    };
  }, []); // Bu effect sadece component ilk yüklendiğinde bir kez çalışır.

  const value: GoogleMapsContextType = {
    isLoaded,
    isLoading,
    error,
    google,
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
