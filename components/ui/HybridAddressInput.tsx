'use client'

import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';

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
  const [showGoogleMaps, setShowGoogleMaps] = useState(true);
  const [googleMapsError, setGoogleMapsError] = useState<string>('');
  const [showFallback, setShowFallback] = useState(false);

  // Fallback suggestions for when Google Maps is not available
  const fallbackSuggestions = [
    'Antalya Havalimanı Terminal 1',
    'Antalya Havalimanı Terminal 2',
    'Lara Beach Hotel, Antalya',
    'Lara Beach, Antalya',
    'Kemer Marina, Antalya',
    'Side Antik Tiyatro, Manavgat',
    'Belek Golf Resort, Serik',
    'Kaleiçi, Antalya',
    'Düden Şelalesi, Antalya',
    'Konyaaltı Beach, Antalya',
    'Aspendos Antik Tiyatrosu, Serik',
    'Alanya Kalesi',
    'Manavgat Şelalesi',
    'Club Hotel Sera, Lara',
    'Rixos Premium Belek',
    'Titanic Beach Lara Hotel',
    'Delphin Imperial Hotel, Lara',
    'Sueno Hotels Beach Side',
    'Crystal Sunrise Queen Luxury Resort, Side'
  ];

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGoogleMapsError = (error: string) => {
    setGoogleMapsError(error);
    setShowFallback(true);
    setShowGoogleMaps(false);
  };

  const getFallbackSuggestions = (inputValue: string) => {
    if (!inputValue || inputValue.length < 2) {
      return fallbackSuggestions.slice(0, 6);
    }
    
    const filtered = fallbackSuggestions.filter(location => 
      location.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    return filtered.length > 0 ? filtered.slice(0, 8) : fallbackSuggestions.slice(0, 6);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (showFallback) {
      const newSuggestions = getFallbackSuggestions(newValue);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (showFallback) {
      const newSuggestions = getFallbackSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const retryGoogleMaps = () => {
    setGoogleMapsError('');
    setShowFallback(false);
    setShowGoogleMaps(true);
  };

  // Auto-switch to fallback after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showGoogleMaps && !googleMapsError) {
        setShowFallback(true);
        setShowGoogleMaps(false);
      }
    }, 3000); // Reduced from 5000ms to 3000ms

    return () => clearTimeout(timer);
  }, [showGoogleMaps, googleMapsError]);

  if (showGoogleMaps && !showFallback) {
    return (
      <GoogleMapsAutocomplete
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        onError={handleGoogleMapsError}
      />
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${className}`}
        />
      </div>

      {/* Fallback Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <div className="px-4 py-2 border-b border-white/10">
            <span className="text-xs text-white/70 font-medium">
              {value.length < 2 ? 'Popüler Destinasyonlar' : 'Önerilen Adresler'}
            </span>
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 text-white hover:bg-white/20 transition-colors border-b border-white/10 last:border-b-0 flex items-center space-x-3"
            >
              <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
          
          <div className="px-4 py-2 border-t border-white/10">
            <div className="flex items-center space-x-2 text-xs text-white/60">
              <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
              <span>Yerel öneriler aktif - Google Maps yüklenemedi</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {googleMapsError && (
        <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200 text-sm">{googleMapsError}</p>
              <button
                onClick={retryGoogleMaps}
                className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
              >
                Google Maps'i tekrar dene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Active State */}
      {showFallback && !googleMapsError && (
        <div className="mt-2 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-yellow-400" />
            <div className="flex-1">
              <p className="text-yellow-200 text-sm">
                <strong>Yerel arama aktif:</strong> Google Maps yüklenemediği için yerel öneriler kullanılıyor
              </p>
              <button
                onClick={retryGoogleMaps}
                className="mt-1 text-xs text-yellow-300 hover:text-yellow-100 underline"
              >
                Google Maps'i tekrar dene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {!showFallback && !googleMapsError && (
        <div className="mt-2 p-3 bg-white/5 border border-white/20 rounded-lg">
          <p className="text-white/60 text-sm">
            💡 <strong>İpucu:</strong> Google Maps yükleniyor, lütfen bekleyin...
          </p>
        </div>
      )}
    </div>
  );
}