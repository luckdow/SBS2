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
  
  // Add isMounted ref to prevent state updates on unmounted components
  const isMountedRef = useRef(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    const loadGoogleMaps = async () => {
      try {
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;
        
        setIsLoading(true);
        setError(null);
        
        // Check if Google Maps is already loaded
        if (typeof window !== 'undefined' && window.google?.maps) {
          if (!isMountedRef.current) return;
          setGoogle(window.google);
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }
        
        // Load Google Maps using our service
        const googleMaps = await GoogleMapsService.loadGoogleMaps();
        
        // Check if component is still mounted before updating state
        if (!isMountedRef.current) return;
        
        setGoogle(googleMaps);
        setIsLoaded(true);
        
        console.log('✅ Google Maps loaded globally via GoogleMapsProvider');
      } catch (err) {
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Google Maps yüklenemedi';
        setError(errorMessage);
        console.warn('⚠️ Google Maps global loading failed:', errorMessage);
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadGoogleMaps();

    // Enhanced cleanup function with error handling
    const cleanup = () => {
      console.log('🧹 GoogleMapsProvider: Starting cleanup...');
      try {
        // Force cleanup all Google Maps elements when provider unmounts
        GoogleMapsService.safeDOMOperation(() => {
          GoogleMapsService.forceCleanupAllGoogleMapsElements();
        }, 'GoogleMapsProvider cleanup on unmount', undefined);
      } catch (cleanupError) {
        console.warn('GoogleMapsProvider cleanup error (non-critical):', cleanupError);
      }
    };
    
    cleanupRef.current = cleanup;
    
    return () => {
      console.log('🧹 GoogleMapsProvider: Component unmounting...');
      isMountedRef.current = false;
      
      // Execute cleanup with error handling
      try {
        if (cleanupRef.current) {
          cleanupRef.current();
        }
      } catch (error) {
        console.warn('GoogleMapsProvider unmount cleanup error (non-critical):', error);
      }
    };
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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