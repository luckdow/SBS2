// Konum: components/ui/HybridAddressInput.tsx

'use client';

import React, { useState } from 'react';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';
import { GoogleMapsErrorBoundary } from '../common/ErrorBoundary';

// --- Prop Tipleri Güncellendi ---
// Google'ın yeni Place Autocomplete Web Bileşeni, eski 'PlaceResult' yerine
// daha modern ve kapsamlı 'Place' nesnesini döndürür. Bu değişikliği yansıtıyoruz.
interface HybridAddressInputProps {
  value: string;
  onChange: (value: string, place?: google.maps.places.Place) => void;
  placeholder: string;
  className?: string;
}

/**
 * Hem Google Maps Otomatik Tamamlama'yı hem de API'nin başarısız olması durumunda
 * manuel giriş ve öneri listesi sunan bir "hibrit" input bileşeni.
 */
export default function HybridAddressInput({
  value,
  onChange,
  placeholder,
  className = ''
}: HybridAddressInputProps) {
  const [googleMapsStatus, setGoogleMapsStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showFallback, setShowFallback] = useState(false);

  // Google Maps API'si yüklenemediğinde gösterilecek statik öneri listesi.
  const fallbackSuggestions = [
    'Antalya Havalimanı (AYT)', 'Kaleiçi, Muratpaşa', 'Konyaaltı Sahili', 'Lara Plajı',
    'Side Antik Kenti, Manavgat', 'Kemer Marina', 'Belek, Serik', 'Kaş, Antalya'
  ];

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /**
   * GoogleMapsAutocomplete bileşeninden gelen durum güncellemelerini yönetir.
   * Hata durumunda, yedek (fallback) manuel giriş arayüzünü etkinleştirir.
   */
  const handleStatusChange = (status: 'loading' | 'error' | 'success', message?: string) => {
    setGoogleMapsStatus(status);
    if (status === 'error') {
      console.error("HybridInput, Google'dan hata durumu aldı:", message);
      setErrorMessage(message || 'Bilinmeyen bir hata oluştu.');
      setShowFallback(true);
    } else {
      setShowFallback(false);
    }
  };

  // --- Fallback (Yedek) Mekanizması Fonksiyonları ---

  const handleFallbackInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // onChange'i sadece metin değeriyle çağırır, 'place' nesnesi olmaz.
    onChange(newValue, undefined); 
    if (newValue) {
      const newSuggestions = fallbackSuggestions.filter(loc => loc.toLowerCase().includes(newValue.toLowerCase()));
      setSuggestions(newSuggestions.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion, undefined);
    setShowSuggestions(false);
  };

  // --- Render (Görselleştirme) Mantığı ---

  // Google Maps'te bir hata yoksa, modern Autocomplete bileşenini göster.
  if (!showFallback) {
    return (
      <GoogleMapsErrorBoundary>
        <div className="relative">
          {/* İkonlar ve yükleme göstergesi artık doğrudan Autocomplete bileşeninin stili içinde değil, burada yönetiliyor. Bu daha temiz bir ayrım sağlar. */}
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none z-10" />
          {googleMapsStatus === 'loading' && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 animate-spin z-10" />
          )}
          {/* Modernleştirilmiş GoogleMapsAutocomplete bileşeni çağrılıyor. */}
          <GoogleMapsAutocomplete
            defaultValue={value}
            onChange={onChange} // Prop'lar doğrudan geçiriliyor.
            placeholder={placeholder}
            className={className}
            onStatusChange={handleStatusChange}
          />
        </div>
      </GoogleMapsErrorBoundary>
    );
  }

  // Hata durumunda gösterilecek yedek manuel giriş alanı ve öneri listesi.
  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
        <input
          type="text"
          value={value}
          onChange={handleFallbackInputChange}
          onFocus={() => value && setShowSuggestions(true)}
          // onBlur, öneri listesine tıklamayı engellememek için küçük bir gecikme kullanır.
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-red-500/50 rounded-xl text-white placeholder-white/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all ${className}`}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-slate-800/90 backdrop-blur-md border border-white/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              // onMouseDown, onBlur'dan önce tetiklendiği için tıklamayı yakalar.
              onMouseDown={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 text-white hover:bg-blue-500/20 transition-colors flex items-center space-x-3"
            >
              <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-200 text-sm font-semibold">Google Haritalar yüklenemedi</p>
            <p className="text-red-300 text-xs mt-1">Lütfen adresinizi manuel olarak girin. Hata: {errorMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
