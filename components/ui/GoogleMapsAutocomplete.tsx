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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | google.maps.places.PlaceAutocompleteElement | null>(null);
  const autocompleteTypeRef = useRef<'modern' | 'legacy' | null>(null);
  const isMountedRef = useRef(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  const handleError = useCallback((errorMessage: string) => {
    if (!isMountedRef.current) return;
    
    setError(errorMessage);
    onError?.(errorMessage);
    onStatusChange?.('error', errorMessage);
    console.error('Google Maps Autocomplete Error:', errorMessage);
  }, [onError, onStatusChange]);

  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (!isMountedRef.current) return;
    
    if (!place.geometry || !place.geometry.location) {
      handleError('Seçilen konum için detaylı bilgi bulunamadı.');
      return;
    }

    const address = place.formatted_address || place.name || '';
    onChange(address, place);
  }, [onChange, handleError]);

  const initializeAutocomplete = useCallback(async () => {
    if (!isMountedRef.current || !containerRef.current || autocompleteRef.current || isInitialized) {
      return;
    }

    setIsLoading(true);
    setError('');
    onStatusChange?.('loading');

    try {
      // Validate container element
      await GoogleMapsService.validateElementDuringAsync(containerRef.current, 'Autocomplete initialization');

      const result = await GoogleMapsService.createBestAutocomplete(containerRef.current, {
        componentRestrictions: { country: ['tr'] },
        types: ['establishment', 'geocode'],
        placeholder: placeholder
      });

      // Double-check component is still mounted
      if (!isMountedRef.current) {
        await GoogleMapsService.safeAutocompleteCleanup(result.element);
        return;
      }

      autocompleteRef.current = result.element;
      autocompleteTypeRef.current = result.type;

      // Setup event listeners based on autocomplete type
      if (result.type === 'modern') {
        const modernElement = result.element as google.maps.places.PlaceAutocompleteElement;
        
        // Safely add to container if it's not already there
        if (containerRef.current && !containerRef.current.contains(modernElement)) {
          try {
            // Hide the fallback input when modern element is active
            if (inputRef.current) {
              inputRef.current.style.display = 'none';
            }
            
            // Clear existing content safely before adding new element
            while (containerRef.current.firstChild && containerRef.current.firstChild !== inputRef.current) {
              try {
                const child = containerRef.current.firstChild;
                // Use defensive DOM removal
                GoogleMapsService.safeRemoveElement(child as HTMLElement);
              } catch (removeError) {
                console.warn('Could not remove child element:', removeError);
                break;
              }
            }
            
            GoogleMapsService.safeDOMOperation(() => {
              containerRef.current?.appendChild(modernElement);
            }, 'Append modern autocomplete element');
          } catch (appendError) {
            console.warn('Could not append modern autocomplete element:', appendError);
            // Fallback to legacy if modern element can't be added
            await GoogleMapsService.safeAutocompleteCleanup(modernElement);
            throw new Error('Failed to add modern autocomplete element to container');
          }
        }
        
        modernElement.addEventListener('gmp-placeselect', (event: any) => {
          if (!isMountedRef.current) return;
          const place = event.place;
          handlePlaceSelect(place);
        });

        // Note: PlaceAutocompleteElement doesn't support setting initial value
        // The modern element manages its own input state internally
        
      } else {
        // Legacy autocomplete
        const legacyAutocomplete = result.element as google.maps.places.Autocomplete;
        
        // Show the fallback input for legacy mode
        if (inputRef.current) {
          inputRef.current.style.display = 'block';
        }
        
        legacyAutocomplete.addListener('place_changed', () => {
          if (!isMountedRef.current) return;
          const place = legacyAutocomplete.getPlace();
          handlePlaceSelect(place);
        });
      }

      if (isMountedRef.current) {
        setIsInitialized(true);
        onStatusChange?.('success');
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error instanceof Error 
        ? `Google Maps yüklenemedi: ${error.message}` 
        : 'Google Maps servisi kullanılamıyor.';
      handleError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [onChange, handleError, isInitialized, onStatusChange, placeholder, value, handlePlaceSelect]);

  useEffect(() => {
    isMountedRef.current = true;
    
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        initializeAutocomplete();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
    };
  }, [initializeAutocomplete]);

  // Enhanced cleanup autocomplete on unmount with defensive DOM operations
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (autocompleteRef.current) {
        GoogleMapsService.safeDOMOperation(async () => {
          await GoogleMapsService.safeAutocompleteCleanup(autocompleteRef.current);
          autocompleteRef.current = null;
          autocompleteTypeRef.current = null;
          // Additional cleanup of any autocomplete-related elements
          GoogleMapsService.forceCleanupAllGoogleMapsElements();
        }, 'Autocomplete component cleanup', undefined);
      }
    };
  }, []);

  // Sync input value for legacy autocomplete only
  useEffect(() => {
    if (autocompleteTypeRef.current === 'legacy' && inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
    // Note: Modern PlaceAutocompleteElement manages its own state internally
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleRetry = () => {
    setError('');
    setIsInitialized(false);
    if (autocompleteRef.current) {
      GoogleMapsService.safeDOMOperation(async () => {
        await GoogleMapsService.safeAutocompleteCleanup(autocompleteRef.current);
        autocompleteRef.current = null;
        autocompleteTypeRef.current = null;
        // Force cleanup before retry
        GoogleMapsService.forceCleanupAllGoogleMapsElements();
      }, 'Autocomplete retry cleanup', undefined);
    }
    initializeAutocomplete();
  };

  return (
    <div className="relative">
      <div className="relative" ref={containerRef}>
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 animate-spin z-10" />
        )}
        
        {/* Fallback input for legacy autocomplete or when modern element isn't ready */}
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
          style={{
            display: autocompleteTypeRef.current === 'modern' ? 'none' : 'block'
          }}
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
              <strong>Google Maps aktif:</strong> {autocompleteTypeRef.current === 'modern' ? 'Modern API' : 'Legacy API'} ile otomatik öneriler
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
