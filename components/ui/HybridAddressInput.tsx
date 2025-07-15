'use client'

import React, { useState } from 'react';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';
import { GoogleMapsErrorBoundary } from '../common/ErrorBoundary';

interface HybridAddressInputProps {
  value: string;
  onChange: (value: string, place?: google.maps.places.PlaceResult) => void;
  placeholder: string;
  className?: string;
}

export default function HybridAddressInput({
  value,
  onChange,
  placeholder,
  className = ''
}: HybridAddressInputProps) {
  const [googleMapsStatus, setGoogleMapsStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showFallback, setShowFallback] = useState(false);

  // Google Maps yüklenemezse kullanılacak yedek öneriler.
  const fallbackSuggestions = [
    'Antalya Havalimanı Terminal 1', 'Antalya Havalimanı Terminal 2', 'Lara Beach Hotel, Antalya',
    'Kemer Marina, Antalya', 'Side Antik Tiyatro, Manavgat', 'Belek Golf Resort, Serik', 'Kaleiçi, Antalya'
  ];

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // GoogleMapsAutocomplete bileşeninden gelen durum değişikliklerini yönetir.
  const handleStatusChange = (status: 'loading' | 'error' | 'success', message?: string) => {
    setGoogleMapsStatus(status);
    if (status === 'error') {
      setErrorMessage(message || 'Bilinmeyen bir hata oluştu.');
      setShowFallback(true); // Hata durumunda yedek input'u göster.
    } else {
      setShowFallback(false);
    }
  };

  // Yedek input'taki her tuş vuruşunu yönetir.
  const handleFallbackInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue); // Ana state'i güncelle.
    if (newValue) {
      const newSuggestions = fallbackSuggestions.filter(loc => loc.toLowerCase().includes(newValue.toLowerCase()));
      setSuggestions(newSuggestions.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Yedek önerilerden birine tıklandığında çalışır.
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  // Hata yoksa, Google Maps Autocomplete bileşenini render et.
  if (!showFallback) {
    return (
      <GoogleMapsErrorBoundary>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none z-10" />
          {googleMapsStatus === 'loading' && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 animate-spin z-10" />
          )}
          {/* HATA DÜZELTMESİ: 'value' prop'u 'defaultValue' olarak değiştirildi. */}
          <GoogleMapsAutocomplete
            defaultValue={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            onStatusChange={handleStatusChange}
          />
        </div>
      </GoogleMapsErrorBoundary>
    );
  }

  // Hata varsa, yedek manuel giriş arayüzünü render et.
  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
        <input
          type="text"
          value={value}
          onChange={handleFallbackInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Tıklama için gecikme
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-red-500/50 rounded-xl text-white placeholder-white/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all ${className}`}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-slate-800/90 backdrop-blur-md border border-white/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              onMouseDown={() => handleSuggestionClick(suggestion)} // onBlur'dan önce çalışması için onMouseDown
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
            <p className="text-red-200 text-sm">Google Haritalar yüklenemedi. Manuel adres girebilirsiniz.</p>
            <p className="text-red-300 text-xs mt-1">Hata: {errorMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
