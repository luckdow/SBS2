// Konum: components/ui/GoogleMapsAutocomplete.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

// --- TypeScript için Google'ın Web Bileşenlerinin Tip Tanımları ---
// Bu tanımlar, TypeScript'in <gmp-place-autocomplete> gibi özel HTML etiketlerini
// ve bu etiketlerin 'place' gibi özelliklerini anlamasını sağlar.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'country-codes'?: string;
          'place-fields'?: string;
          'placeholder'?: string;
          'value'?: string;
          // Gerekirse diğer özellikleri buraya ekleyebilirsiniz.
        },
        HTMLElement
      > & {
        // 'place' özelliğini ve metodlarını tanımlıyoruz.
        place?: google.maps.places.Place;
      };
    }
  }
}

// --- Bileşen Prop Tipleri ---
interface GoogleMapsAutocompleteProps {
  defaultValue?: string;
  onChange: (value: string, place?: google.maps.places.Place) => void;
  placeholder: string;
  className?: string;
  onStatusChange: (status: 'loading' | 'error' | 'success', message?: string) => void;
}

/**
 * Google'ın modern Place Autocomplete Web Bileşenini kullanan sarmalayıcı (wrapper).
 * Bu yaklaşım, DOM çakışmalarını ve 'removeChild' hatasını tamamen ortadan kaldırır.
 * Bileşen, kendi yaşam döngüsünü ve DOM etkileşimlerini React ile uyumlu bir şekilde yönetir.
 */
export default function GoogleMapsAutocomplete({
  defaultValue,
  onChange,
  placeholder,
  className,
  onStatusChange,
}: GoogleMapsAutocompleteProps) {
  // Eski inputRef yerine, doğrudan <gmp-place-autocomplete> web bileşenine bir referans oluşturuyoruz.
  const autocompleteRef = useRef<HTMLElement & { place?: google.maps.places.Place }>(null);

  useEffect(() => {
    let isMounted = true; // Komponentin "unmount" durumunu takip etmek için
    const currentAutocompleteElement = autocompleteRef.current;
    
    onStatusChange('loading');

    // Geliştirilmiş GoogleMapsService'i kullanarak API'yi yüklüyoruz.
    GoogleMapsService.loadGoogleMaps()
      .then(() => {
        if (!isMounted || !currentAutocompleteElement) return;
        
        console.log('✅ Autocomplete için Google Maps hazır.');
        onStatusChange('success');
      })
      .catch(error => {
        if (!isMounted) return;
        console.error('❌ Autocomplete başlatılamadı:', error);
        onStatusChange('error', error.message);
      });

    // --- Modern Event Listener Yaklaşımı ---
    // 'place_changed' yerine, web bileşeninin standart 'gmp-placechange' olayını dinliyoruz.
    const handlePlaceChange = (event: Event) => {
        // 'event.target' üzerinden 'place' özelliğine güvenli bir şekilde erişiyoruz.
        const target = event.target as HTMLElement & { place?: google.maps.places.Place };
        const place = target?.place;

        if (place?.id) { // place.id, seçimin geçerli bir yer olduğunu doğrular.
            console.log('📍 Yer seçildi:', place.displayName, place.formattedAddress);
            // place nesnesini ve formatlanmış adresini yukarıya iletiyoruz.
            onChange(place.formattedAddress ?? '', place);
        }
    };
    
    // Web bileşenine olay dinleyicisini ekliyoruz.
    currentAutocompleteElement?.addEventListener('gmp-placechange', handlePlaceChange);

    // --- Temizlik Fonksiyonu (ÇOK ÖNEMLİ) ---
    // Bu fonksiyon, bileşen DOM'dan kaldırıldığında çalışır (örn. adım değiştirildiğinde).
    // Olay dinleyicisini kaldırarak hafıza sızıntılarını ve hataları önler.
    return () => {
      isMounted = false;
      currentAutocompleteElement?.removeEventListener('gmp-placechange', handlePlaceChange);
    };
  }, [onStatusChange, onChange]); // Bağımlılıklar güncellendi.

  return (
    <gmp-place-autocomplete
      ref={autocompleteRef}
      // Google'ın web bileşenine doğrudan stil ve diğer özellikleri aktarıyoruz.
      class={`w-full pl-12 pr-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all ${className}`}
      placeholder={placeholder}
      // Arama yapılacak ülkeyi ve döndürülecek veri alanlarını belirtiyoruz.
      country-codes="TR"
      place-fields="id,displayName,formattedAddress,location"
      // defaultValue'yu `value` olarak ayarlıyoruz.
      value={defaultValue}
    >
        {/* Web bileşeninin içine özel bir input koymuyoruz, kendisi zaten bir input render ediyor. */}
    </gmp-place-autocomplete>
  );
};
