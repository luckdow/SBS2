'use client'

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, AlertCircle } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMaps';
import { loadGoogleMapsAPI, getGoogleMapsApiDiagnostics } from '../../lib/googleMapsLoader';
import GoogleMapsDiagnostics from './GoogleMapsDiagnostics';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder, 
  className = '' 
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [suggestionsSource, setSuggestionsSource] = useState<'api' | 'fallback'>('fallback');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Load Google Maps API on component mount
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMapsAPI();
        setGoogleMapsLoaded(true);
        setApiError('');
        console.log('🗺️ Google Maps API loaded successfully for autocomplete');
      } catch (error) {
        console.log('🗺️ Google Maps API failed to load, enhanced fallback suggestions will be used:', error);
        setGoogleMapsLoaded(false);
        setApiError(error instanceof Error ? error.message : 'Google Maps API failed to load');
        // Don't show error immediately, let user try to use the fallback first
      }
    };

    initializeGoogleMaps();
  }, []);

  useEffect(() => {
    if (value.length > 2) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(async () => {
        setLoading(true);
        setShowPopular(false);
        try {
          const results = await GoogleMapsService.getAddressSuggestions(value, true);
          if (results.status === 'success') {
            setSuggestions(results.suggestions);
            setSuggestionsSource(results.source || 'fallback');
            if (results.popularDestinations) {
              setPopularDestinations(results.popularDestinations);
            }
            setShowSuggestions(true);
            // Clear any previous errors if suggestions are working
            if (results.suggestions.length > 0) {
              setApiError('');
            }
          } else {
            console.error('Address autocomplete error:', results.error);
            // Use enhanced fallback with better Turkish locations
            const fallbackSuggestions = [
              'Antalya Havalimanı Terminal 1',
              'Antalya Havalimanı Terminal 2', 
              'Lara Beach Hotel, Antalya',
              'Lara Beach, Antalya',
              'Kemer Marina, Antalya',
              'Side Antik Tiyatro, Manavgat',
              'Belek Golf Resort, Serik',
              'Kaleiçi, Antalya',
              'Düden Şelalesi, Antalya'
            ].filter(addr => addr.toLowerCase().includes(value.toLowerCase()));
            setSuggestions(fallbackSuggestions);
            setSuggestionsSource('fallback');
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Address autocomplete error:', error);
          // Enhanced fallback suggestions with better filtering
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
            'Aspendos Antik Tiyatrosu, Serik'
          ].filter(addr => addr.toLowerCase().includes(value.toLowerCase()));
          setSuggestions(fallbackSuggestions);
          setSuggestionsSource('fallback');
          setShowSuggestions(true);
        }
        setLoading(false);
      }, 300);
    } else if (value.length === 0) {
      // Show popular destinations when input is empty
      setSuggestions([]);
      setPopularDestinations(GoogleMapsService.getPopularDestinations());
      setShowPopular(true);
      setShowSuggestions(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setShowPopular(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, googleMapsLoaded]);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setShowPopular(false);
    setSuggestions([]);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click
    setTimeout(() => {
      setShowSuggestions(false);
      setShowPopular(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (value.length === 0 && popularDestinations.length > 0) {
      setShowPopular(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${className}`}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/60"></div>
          </div>
        )}
      </div>

      {(showSuggestions && suggestions.length > 0) || (showPopular && popularDestinations.length > 0) ? (
        <div className="absolute z-10 w-full mt-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {showSuggestions && suggestions.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-white/10">
                <span className="text-xs text-white/70 font-medium">Önerilen Adresler</span>
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
            </>
          )}
          
          {showPopular && popularDestinations.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-white/10">
                <span className="text-xs text-white/70 font-medium">Popüler Destinasyonlar</span>
              </div>
              {popularDestinations.slice(0, 8).map((destination, index) => (
                <button
                  key={`popular-${index}`}
                  onClick={() => handleSuggestionClick(destination)}
                  className="w-full text-left px-4 py-3 text-white hover:bg-white/20 transition-colors border-b border-white/10 last:border-b-0 flex items-center space-x-3"
                >
                  <MapPin className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                  <span className="truncate">{destination}</span>
                </button>
              ))}
            </>
          )}
          
          {/* Enhanced API Status Indicator */}
          <div className="px-4 py-2 border-t border-white/10">
            <div className="flex items-center space-x-2 text-xs text-white/60">
              {googleMapsLoaded ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span>Google Maps API aktif - {suggestionsSource === 'api' ? 'Canlı' : 'Gelişmiş yerel'} öneriler</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-yellow-400" />
                  <span>Google Maps API {apiError ? 'hatası' : 'yükleniyor'} - Gelişmiş yerel öneriler gösteriliyor</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDiagnostics(true);
                    }}
                    className="text-blue-300 hover:text-blue-200 underline"
                  >
                    Detay
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Enhanced Diagnostic Information */}
      {apiError && showDiagnostics && (
        <div className="absolute z-20 w-full mt-2">
          <GoogleMapsDiagnostics onClose={() => setShowDiagnostics(false)} />
        </div>
      )}
    </div>
  );
}