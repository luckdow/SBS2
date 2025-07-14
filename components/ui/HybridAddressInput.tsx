// components/ui/HybridAddressInput.tsx

'use client'

import React from 'react';
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
  return (
    <GoogleMapsAutocomplete
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
