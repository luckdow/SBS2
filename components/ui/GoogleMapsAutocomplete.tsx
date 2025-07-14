'use client'

import React, { useState, useCallback } from 'react';
import { MapPin, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || autocompleteRef.current) {
      return;
    }

    setStatus('loading');
    try {
      const autocomplete = await GoogleMapsService.createAutocomplete(inputRef.current, {
        componentRestrictions: { country: ['tr'] },
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'],
        types: ['establishment', 'geocode'],
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          setStatus('error');
          setErrorMessage('Seçilen konum için detaylı bilgi bulunamadı.');
          return;
        }
        const address = place.formatted_address || place.name || '';
        onChange(address, place);
      });

      setStatus('success');
    } catch (error) {
      const msg = error instanceof Error
        ? `Google Maps yüklenemedi: ${error.message}`
        : 'Google Maps servisi kullanılamıyor.';
      setErrorMessage(msg);
      setStatus('error');
      console.error('Google Maps Autocomplete Error:', msg);
    }
  }, [onChange]);

  useEffect(() => {
    // Bileşen yüklendiğinde başlat
    initializeAutocomplete();
  }, [initializeAutocomplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
        {status === 'loading' && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 animate-spin" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={status === 'loading'}
          className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/60 focus:ring-2 transition-all ${
            status === 'error'
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
              : 'border-white/30 focus:border-blue-500 focus:ring-blue-500/50'
          } ${status === 'loading' ? 'cursor-wait' : ''} ${className}`}
        />
      </div>

      {/* Durum Bildirimleri */}
      {status === 'error' && (
        <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200 text-sm">{errorMessage}</p>
              <button
                onClick={initializeAutocomplete}
                className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
              >
                Tekrar dene
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'loading' && (
        <div className="mt-2 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
            <p className="text-blue-200 text-sm">Google Maps yükleniyor...</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <p className="text-green-200 text-sm">
              <strong>Google Maps aktif:</strong> Otomatik tamamlama hazır.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
