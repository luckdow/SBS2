'use client'

import React, { useEffect, useRef, useCallback } from 'react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

interface GoogleMapsAutocompleteProps {
  defaultValue?: string;
  onChange: (value: string, place?: google.maps.places.PlaceResult) => void;
  placeholder: string;
  className?: string;
  onStatusChange?: (status: 'loading' | 'error' | 'success', message?: string) => void;
}

export default function GoogleMapsAutocomplete({
  defaultValue = '',
  onChange,
  placeholder,
  className = '',
  onStatusChange
}: GoogleMapsAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const isMountedRef = useRef(true);

  const handleError = useCallback((errorMessage: string) => {
    if (!isMountedRef.current) return;
    console.error('Google Maps Autocomplete Error:', errorMessage);
    onStatusChange?.('error', errorMessage);
  }, [onStatusChange]);

  const handlePlaceSelect = useCallback(() => {
    if (!isMountedRef.current || !autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place.geometry || !place.geometry.location) {
      if (inputRef.current) {
        onChange(inputRef.current.value, undefined);
      }
      return;
    }
    
    const address = place.formatted_address || place.name || '';
    if (inputRef.current) {
      inputRef.current.value = address;
    }
    onChange(address, place);
  }, [onChange]); // handleError bağımlılığını kaldırdık çünkü handlePlaceSelect içinde doğrudan çağrılmıyor.

  useEffect(() => {
    isMountedRef.current = true;
    let isInitialized = false;

    const initialize = async () => {
      if (!inputRef.current || !isMountedRef.current || isInitialized) return;
      
      isInitialized = true;
      onStatusChange?.('loading');

      try {
        await GoogleMapsService.loadGoogleMaps();
        if (!isMountedRef.current || !inputRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: ['tr'] },
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'],
          types: ['establishment', 'geocode'],
        });

        autocompleteRef.current = autocomplete;
        autocomplete.addListener('place_changed', handlePlaceSelect);

        if (isMountedRef.current) {
          onStatusChange?.('success');
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        handleError(`Google Haritalar başlatılamadı: ${errorMessage}`);
      }
    };

    const timer = setTimeout(() => initialize(), 50);

    // *** DÜZELTME ***: Temizleme fonksiyonunu güvenli hale getirdik.
    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      
      // Hatanın ana kaynağı olan manuel DOM silme işlemini kaldırıyoruz.
      // Bu işi artık `page.tsx` içindeki merkezi temizlik fonksiyonu yapacak.
      /*
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach(container => {
        try {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        } catch (e) { }
      });
      */

      // Sadece event listener'ları temizlemek, hafıza sızıntılarını önlemek için yeterli ve güvenlidir.
      if (autocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        } catch (e) {
          console.warn("Autocomplete listener'ları temizlenirken hata oluştu (önemsiz):", e);
        }
      }
    };
  }, [handlePlaceSelect, handleError, onStatusChange]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value, undefined)}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/60 focus:ring-2 transition-all border-white/30 focus:border-blue-500 focus:ring-blue-500/50 ${className}`}
      />
    </div>
  );
}
