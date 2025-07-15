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

// Type for PlaceAutocompleteElement
interface PlaceAutocompleteElement extends HTMLElement {
  placeholder: string;
  value: string;
  componentRestrictions: { country: string[] };
  fields: string[];
  types: string[];
}

export default function GoogleMapsAutocomplete({
  defaultValue = '',
  onChange,
  placeholder,
  className = '',
  onStatusChange
}: GoogleMapsAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteElementRef = useRef<PlaceAutocompleteElement | null>(null);
  const isMountedRef = useRef(true);

  const handleError = useCallback((errorMessage: string) => {
    if (!isMountedRef.current) return;
    console.error('Google Maps Autocomplete Error:', errorMessage);
    onStatusChange?.('error', errorMessage);
  }, [onStatusChange]);

  const handlePlaceSelect = useCallback((event: any) => {
    if (!isMountedRef.current) return;

    const place = event.detail?.place;
    if (!place) {
      console.warn('Seçilen yer bilgisi bulunamadı');
      return;
    }

    if (!place.geometry || !place.geometry.location) {
      // Eğer geometrik bilgi yoksa, sadece metin değerini al
      const inputValue = place.name || place.formatted_address || defaultValue || '';
      onChange(inputValue, undefined);
      return;
    }
    
    const address = place.formatted_address || place.name || '';
    onChange(address, place);
  }, [onChange, defaultValue]);

  const handleInput = useCallback((event: any) => {
    if (!isMountedRef.current) return;
    const value = event.target.value || '';
    onChange(value, undefined);
  }, [onChange]);

  useEffect(() => {
    isMountedRef.current = true;
    let isInitialized = false;

    const initialize = async () => {
      if (!containerRef.current || !isMountedRef.current || isInitialized) return;
      
      isInitialized = true;
      onStatusChange?.('loading');

      try {
        // Google Maps API'sini yükle
        await GoogleMapsService.loadGoogleMaps();
        if (!isMountedRef.current || !containerRef.current) return;

        // PlaceAutocompleteElement web component'ini oluştur
        const autocompleteElement = document.createElement('gmp-place-autocomplete') as PlaceAutocompleteElement;
        
        // Placeholder ayarla
        autocompleteElement.placeholder = placeholder;
        
        // Varsayılan değer ayarla
        if (defaultValue) {
          autocompleteElement.value = defaultValue;
        }
        
        // TR ülke kısıtlaması - doğrudan property olarak ayarla
        autocompleteElement.componentRestrictions = { country: ['tr'] };
        
        // İstenen alanlar - doğrudan property olarak ayarla
        autocompleteElement.fields = ['place_id', 'geometry', 'name', 'formatted_address', 'types'];
        
        // Tip kısıtlamaları - doğrudan property olarak ayarla
        autocompleteElement.types = ['establishment', 'geocode'];

        // Temel stil ayarları
        autocompleteElement.style.cssText = `
          width: 100%;
          --gmp-place-autocomplete-font-family: inherit;
          --gmp-place-autocomplete-font-size: inherit;
        `;

        // CSS variables ile stil özelleştirme
        autocompleteElement.style.setProperty('--gmp-place-autocomplete-background-color', 'transparent');
        autocompleteElement.style.setProperty('--gmp-place-autocomplete-color', 'white');
        autocompleteElement.style.setProperty('--gmp-place-autocomplete-placeholder-color', 'rgba(255, 255, 255, 0.6)');
        autocompleteElement.style.setProperty('--gmp-place-autocomplete-border', 'none');
        autocompleteElement.style.setProperty('--gmp-place-autocomplete-outline', 'none');

        // Event listener'ları ekle
        autocompleteElement.addEventListener('gmp-placeselect', handlePlaceSelect);
        autocompleteElement.addEventListener('input', handleInput);

        // DOM'a ekle
        containerRef.current.appendChild(autocompleteElement);
        autocompleteElementRef.current = autocompleteElement;

        if (isMountedRef.current) {
          onStatusChange?.('success');
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        handleError(`Google Haritalar başlatılamadı: ${errorMessage}`);
      }
    };

    const timer = setTimeout(() => initialize(), 50);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      
      // PlaceAutocompleteElement temizliği
      if (autocompleteElementRef.current) {
        try {
          // Event listener'ları temizle
          autocompleteElementRef.current.removeEventListener('gmp-placeselect', handlePlaceSelect);
          autocompleteElementRef.current.removeEventListener('input', handleInput);
          
          // Element'i DOM'dan güvenli şekilde kaldır
          GoogleMapsService.safeRemoveElement(autocompleteElementRef.current);
        } catch (e) {
          console.warn("PlaceAutocompleteElement temizlenirken hata oluştu (genellikle önemsiz):", e);
        }
      }
    };
  }, [handlePlaceSelect, handleInput, handleError, onStatusChange, placeholder, defaultValue]);

  return (
    <div className="relative w-full">
      <div 
        ref={containerRef}
        className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/60 focus-within:ring-2 transition-all border-white/30 focus-within:border-blue-500 focus-within:ring-blue-500/50 ${className}`}
        style={{ minHeight: '56px' }}
      />
    </div>
  );
}
