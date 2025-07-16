'use client'

import React, { useEffect, useRef } from 'react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

// Prop tiplerini tanımlıyoruz
interface GoogleMapsAutocompleteProps {
  defaultValue?: string;
  onChange: (value: string, place?: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  onStatusChange: (status: 'loading' | 'error' | 'success', message?: string) => void;
}

const GoogleMapsAutocomplete: React.FC<GoogleMapsAutocompleteProps> = ({
  defaultValue,
  onChange,
  placeholder,
  className,
  onStatusChange,
}) => {
  // Input elementine erişmek için bir ref oluşturuyoruz
  const inputRef = useRef<HTMLInputElement>(null);
  // Google'ın autocomplete nesnesini saklamak için bir ref
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    onStatusChange('loading');

    // Google Maps API'sini yükle
    GoogleMapsService.loadGoogleMaps()
      .then(() => {
        // Yükleme başarılı olursa ve input elementi mevcutsa devam et
        if (!inputRef.current) {
            onStatusChange('error', 'Input elementi bulunamadı.');
            return;
        }
        
        // Google'ın standart Autocomplete nesnesini oluştur
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment', 'geocode'], // Hem işletme hem adres bul
          componentRestrictions: { country: 'TR' }, // Sadece Türkiye içinde ara
          fields: ['name', 'formatted_address', 'geometry'], // İhtiyacımız olan bilgileri belirt
        });

        // Kullanıcı listeden bir yer seçtiğinde tetiklenecek olay
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          // Eğer seçilen yerin adresi ve konumu varsa, bilgileri yukarıya gönder
          if (place?.geometry) {
            onChange(place.formatted_address || '', place);
          }
        });

        // Her şey yolundaysa durumu 'success' yap
        onStatusChange('success');
      })
      .catch(error => {
        // Hata olursa durumu 'error' yap ve mesajı gönder
        onStatusChange('error', error.message);
      });

  }, [onStatusChange, onChange]); // Bu effect sadece bir kez çalışacak

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      // Kullanıcı manuel olarak bir şey yazdığında da ana durumu güncelle
      onChange={(e) => onChange(e.target.value)}
      // Tüm stilleri ana component'ten gelen className ile birleştir
      className={`w-full pl-12 pr-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${className}`}
    />
  );
};

export default GoogleMapsAutocomplete;
