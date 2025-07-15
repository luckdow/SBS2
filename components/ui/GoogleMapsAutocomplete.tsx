'use client'

import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string, place?: google.maps.places.PlaceResult) => void;
  placeholder: string;
  className?: string;
  onStatusChange?: (status: 'loading' | 'error' | 'success', message?: string) => void;
}

export default function GoogleMapsAutocomplete({
  value,
  onChange,
  placeholder,
  className = '',
  onStatusChange
}: GoogleMapsAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const isMountedRef = useRef(true);

  // Hata durumunu merkezi olarak yönetmek için useCallback.
  const handleError = useCallback((errorMessage: string) => {
    if (!isMountedRef.current) return;
    console.error('Google Maps Autocomplete Error:', errorMessage);
    onStatusChange?.('error', errorMessage);
  }, [onStatusChange]);

  // Kullanıcı bir konum seçtiğinde çalışacak fonksiyon.
  const handlePlaceSelect = useCallback(() => {
    if (!isMountedRef.current || !autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place.geometry || !place.geometry.location) {
      console.warn('Seçilen konum için geometri bulunamadı:', place.name);
      onChange(place.name || '', undefined); // Sadece isimle güncelle
      return;
    }

    const address = place.formatted_address || place.name || '';
    onChange(address, place);
  }, [onChange, handleError]);

  // Bileşen yüklendiğinde Autocomplete'i başlatan ve kaldırıldığında temizleyen ana useEffect.
  useEffect(() => {
    isMountedRef.current = true;
    let isInitialized = false;

    const initialize = async () => {
      if (!inputRef.current || !isMountedRef.current || isInitialized) {
        return;
      }
      isInitialized = true;
      onStatusChange?.('loading');

      try {
        await GoogleMapsService.loadGoogleMaps(); // API'nin yüklenmesini bekle.
        if (!isMountedRef.current || !inputRef.current) return;

        // Kararlılığı en yüksek olan legacy Autocomplete API'sini kullan.
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

    // TEMİZLİK FONKSİYONU: Bu, bileşen DOM'dan kaldırıldığında çalışır.
    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      
      // KESİN ÇÖZÜM: Yarış durumunu önlemek için Google'ın öneri kutusunu manuel olarak kaldır.
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach(container => {
        try {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        } catch (e) {
            console.warn('.pac-container temizlenirken hata oluştu (önemsiz):', e);
        }
      });

      // Varsa, spesifik instance üzerindeki event listener'ları da temizle.
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [handlePlaceSelect, handleError, onStatusChange]);

  // Dışarıdan gelen 'value' değişikliğini input'a yansıt.
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/60 focus:ring-2 transition-all border-white/30 focus:border-blue-500 focus:ring-blue-500/50 ${className}`}
      />
    </div>
  );
}
