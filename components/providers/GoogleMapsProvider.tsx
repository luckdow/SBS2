'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if Google Maps is already loaded
        if (typeof window !== 'undefined' && window.google?.maps) {
          setGoogle(window.google);
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }
        
        // Load Google Maps using our service
        const googleMaps = await GoogleMapsService.loadGoogleMaps();
        setGoogle(googleMaps);
        setIsLoaded(true);
        
        console.log('✅ Google Maps loaded globally via GoogleMapsProvider');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Google Maps yüklenemedi';
        setError(errorMessage);
        console.warn('⚠️ Google Maps global loading failed:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
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