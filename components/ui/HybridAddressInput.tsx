'use client'

import React, { useState } from 'react';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete'; // Bu bileşeni bir sonraki adımda düzelteceğiz
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
  // Sadece 3 durum yöneteceğiz: Yükleniyor, Başarılı, Hata
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Google Haritalar servisi yüklenemezse bu basit hata mesajını göster
  if (status === 'error') {
    return (
      <div className="flex items-center space-x-2 rounded-lg bg-red-500/20 p-3 text-sm text-red-300">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span>
          Adres servisi yüklenemedi. Lütfen sayfayı yenileyin. ({errorMessage})
        </span>
      </div>
    );
  }

  // Google Haritalar yüklendiğinde veya yüklenirken bu bileşeni göster
  return (
    <GoogleMapsErrorBoundary>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-white/60" />
        
        {/* Yüklenirken dönen ikon */}
        {status === 'loading' && (
          <Loader2 className="pointer-events-none absolute right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 animate-spin text-blue-400" />
        )}

        {/* Asıl işi yapacak olan Autocomplete bileşeni */}
        <GoogleMapsAutocomplete
          defaultValue={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          onStatusChange={(newStatus, msg) => {
            setStatus(newStatus);
            if (msg) setErrorMessage(msg);
          }}
        />
      </div>
    </GoogleMapsErrorBoundary>
  );
}
