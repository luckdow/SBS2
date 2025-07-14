'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string, place?: google.maps.places.PlaceResult) => void;
  placeholder: string;
  className?: string;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'loading' | 'error' | 'success', message?: string) => void;
}

export default function GoogleMapsAutocomplete({ 
  value, 
  onChange, 
  placeholder, 
  className = '',
  onError,
  onStatusChange
}: GoogleMapsAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
    onStatusChange?.('error', errorMessage);
    console.error('Google Maps Autocomplete Error:', errorMessage);
  }, [onError, onStatusChange]);

  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || autocompleteRef.current || isInitialized) {
      return;
    }

    setIsLoading(true);
    setError('');
    onStatusChange?.('loading');

    try {
      const autocomplete = await GoogleMapsService.createAutocomplete(inputRef.current, {
        componentRestrictions: { country: ['tr'] },
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'],
        types: ['establishment', 'geocode']
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          handleError('Seçilen konum için detaylı bilgi bulunamadı.');
          return;
        }

        const address = place.formatted_address || place.name || '';
        onChange(address, place);
      });

      setIsInitialized(true);
      onStatusChange?.('success');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? `Google Maps yüklenemedi: ${error.message}` 
        : 'Google Maps servisi kullanılamıyor.';
      handleError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onChange, handleError, isInitialized, onStatusChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeAutocomplete();
    }, 100);

    return () => clearTimeout(timer);
  }, [initializeAutocomplete]);

  // Cleanup autocomplete on unmount
  useEffect(() => {
    return () => {
      try {
        if (autocompleteRef.current) {
          // Clear event listeners and references
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }
      } catch (error) {
        // Silently handle cleanup errors
        console.warn('Autocomplete cleanup warning:', error);
      }
    };
  }, []);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleRetry = () => {
    setError('');
    setIsInitialized(false);
    autocompleteRef.current = null;
    initializeAutocomplete();
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 animate-spin" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isLoading}
          className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/60 focus:ring-2 transition-all ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
              : 'border-white/30 focus:border-blue-500 focus:ring-blue-500/50'
          } ${isLoading ? 'cursor-wait' : ''} ${className}`}
        />
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
              >
                Tekrar dene
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-2 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
            <p className="text-blue-200 text-sm">Google Maps yükleniyor...</p>
          </div>
        </div>
      )}

      {isInitialized && !error && !isLoading && (
        <div className="mt-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
            <p className="text-green-200 text-sm">
              <strong>Google Maps aktif:</strong> Yazmaya başladığınızda otomatik öneriler gösterilecek
            </p>
          </div>
        </div>
      )}

      {!isInitialized && !isLoading && !error && (
        <div className="mt-2 p-3 bg-white/5 border border-white/20 rounded-lg">
          <p className="text-white/60 text-sm">
            💡 <strong>İpucu:</strong> Google Maps ile otomatik konum önerileri yükleniyor...
          </p>
        </div>
      )}
    </div>
  );
}
