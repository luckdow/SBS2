'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

interface GoogleMapsRouteDisplayProps {
  origin: string;
  destination: string;
  originPlace?: google.maps.places.PlaceResult;
  destinationPlace?: google.maps.places.PlaceResult;
  onRouteCalculated?: (result: {
    distance: number;
    duration: number;
    distanceText: string;
    durationText: string;
  }) => void;
}

export default function GoogleMapsRouteDisplay({
  origin,
  destination,
  originPlace,
  destinationPlace,
  onRouteCalculated,
}: GoogleMapsRouteDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const isMountedRef = useRef(true);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Rota hesaplama ve çizme mantığı tek bir fonksiyonda toplandı
  const calculateAndDisplayRoute = useCallback(async () => {
    // Componentin var olup olmadığını ve gerekli referansın atanıp atanmadığını kontrol et
    if (!isMountedRef.current || !mapRef.current) {
      console.warn("Harita konteyneri bulunamadığından işlem iptal edildi.");
      return;
    }
    
    setStatus('loading');
    setErrorMessage('');

    try {
      const google = await GoogleMapsService.loadGoogleMaps();

      // Async işlemden sonra kontrolleri tekrar yap
      if (!isMountedRef.current || !mapRef.current) return;

      // Haritayı ve rota çiziciyi SADECE bir kere, eğer oluşturulmamışsa oluştur
      if (!mapInstanceRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          zoom: 10,
          center: { lat: 36.8969, lng: 30.7133 }, // Antalya
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          disableDefaultUI: true, // Kontrolleri kapatarak daha temiz bir görünüm
        });
        mapInstanceRef.current = map;
      }
      
      if (!directionsRendererRef.current) {
        const directionsRenderer = new google.maps.DirectionsRenderer({
          polylineOptions: { strokeColor: '#3B82F6', strokeWeight: 5, strokeOpacity: 0.9 }
        });
        directionsRenderer.setMap(mapInstanceRef.current); // Oluşturulan haritaya bağla
        directionsRendererRef.current = directionsRenderer;
      }

      // Rotayı hesapla
      const result = await GoogleMapsService.getDirections(
        originPlace?.geometry?.location || origin,
        destinationPlace?.geometry?.location || destination
      );

      // Son güvenlik kontrolü
      if (!isMountedRef.current || !directionsRendererRef.current) return;

      directionsRendererRef.current.setDirections(result);

      const leg = result.routes[0]?.legs[0];
      if (!leg?.distance?.text || !leg?.duration?.text) {
        throw new Error("Google'dan rota bilgisi alınamadı.");
      }
      
      // Üst componente bilgileri gönder
      onRouteCalculated?.({
        distance: leg.distance.value,
        duration: leg.duration.value,
        distanceText: leg.distance.text,
        durationText: leg.duration.text,
      });
      
      setStatus('success');

    } catch (error) {
      const msg = error instanceof Error ? `Rota gösterilemedi: ${error.message}` : 'Bilinmeyen harita hatası.';
      setErrorMessage(msg);
      setStatus('error');
      console.error('HybridRouteDisplay Hatası:', msg);
    }
  }, [origin, destination, originPlace, destinationPlace, onRouteCalculated]);

  // Component yüklendiğinde ve rota bilgileri değiştiğinde çalışır
  useEffect(() => {
    isMountedRef.current = true;
    calculateAndDisplayRoute();

    // Component kaldırıldığında temizlik yapar
    return () => {
      isMountedRef.current = false;
    };
  }, [calculateAndDisplayRoute]); 

  // Eğer başlangıç veya bitiş noktası yoksa hiçbir şey gösterme
  if (!origin || !destination) {
    return null; 
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4">
      {/* Harita alanı */}
      <div className="relative h-64 bg-slate-800/50 rounded-xl flex items-center justify-center" ref={mapRef}>
        {status === 'loading' && (
          <div className="text-center text-white/80 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>Harita ve rota yükleniyor...</p>
          </div>
        )}
        {status === 'error' && (
           <div className="text-center text-red-300 p-4">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-semibold">Harita gösterilemedi.</p>
            <p className="text-xs mt-1">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
