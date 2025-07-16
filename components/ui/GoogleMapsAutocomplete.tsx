// Konum: components/ui/GoogleMapsAutocomplete.tsx

'use client'

import React, { useEffect, useRef } from 'react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

interface GoogleMapsAutocompleteProps {
  defaultValue?: string;
  onChange: (value: string, place?: google.maps.places.PlaceResult) => void;
  placeholder: string;
  className?: string;
  onStatusChange: (status: 'loading' | 'error' | 'success', message?: string) => void;
}

export default function GoogleMapsAutocomplete({
  defaultValue,
  onChange,
  placeholder,
  className,
  onStatusChange,
}: GoogleMapsAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    onStatusChange('loading');

    GoogleMapsService.loadGoogleMaps()
      .then(() => {
        if (!inputRef.current) return;
        
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'TR' },
          fields: ['name', 'formatted_address', 'geometry'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.geometry) {
            onChange(place.formatted_address || '', place);
          }
        });

        onStatusChange('success');
      })
      .catch(error => {
        onStatusChange('error', error.message);
      });
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full pl-12 pr-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${className}`}
    />
  );
};
