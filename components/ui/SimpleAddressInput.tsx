'use client'

import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface SimpleAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export default function SimpleAddressInput({ 
  value, 
  onChange, 
  placeholder, 
  className = '' 
}: SimpleAddressInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Common Turkish destinations for suggestions
  const popularDestinations = [
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
    'Manavgat Şelalesi'
  ];

  const getSuggestions = () => {
    if (!value || value.length < 2) {
      return popularDestinations.slice(0, 6);
    }
    
    const filtered = popularDestinations.filter(location => 
      location.toLowerCase().includes(value.toLowerCase())
    );
    
    return filtered.length > 0 ? filtered.slice(0, 8) : popularDestinations.slice(0, 6);
  };

  const suggestions = getSuggestions();

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${className}`}
        />
      </div>

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
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              <span>Yerel öneriler - Google Maps entegrasyonu kaldırıldı</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}