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
  }, [onChange]);

  useEffect(() => {
    isMountedRef.current = true;
    let isInitialized = false;

    const initialize = async () => {
      if (!inputRef.current || !isMountedRef.current || isInitialized) return;
      
      isInitialized = true;
      onStatusChange?.('loading');

      try {
        // `window.google` objesini merkezi servisimizden güvenli bir şekilde alıyoruz.
        const google = await GoogleMapsService.loadGoogleMaps();
        if (!isMountedRef.current || !inputRef.current) return;

        // Autocomplete'i `google.maps.places.Autocomplete` olarak çağırıyoruz.
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
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

    // *** ANA DÜZELTME: GÜVENLİ TEMİZLİK ***
    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      
      // Hatanın ana kaynağı olan manuel DOM silme işlemini TAMAMEN KALDIRIYORUZ.
      // Bu işi artık `app/reservation/page.tsx` içindeki merkezi temizlik fonksiyonu yapıyor.
      
      // Burada sadece Google'a ait event listener'ları temizliyoruz.
      // Bu işlem hafıza sızıntılarını önler ve %100 güvenlidir.
      if (autocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        } catch (e) {
          // Bu hata genellikle önemli değildir ve güvenle göz ardı edilebilir.
          console.warn("Autocomplete listener'ları temizlenirken hata oluştu (genellikle önemsiz):", e);
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
