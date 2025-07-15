// components/ui/HybridRouteDisplay.tsx

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Clock, Route, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

interface HybridRouteDisplayProps {
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

export default function HybridRouteDisplay({
  origin,
  destination,
  originPlace,
  destinationPlace,
  onRouteCalculated,
}: HybridRouteDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const isMountedRef = useRef(true);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const calculateAndDisplayRoute = useCallback(async () => {
    // Componentin var olup olmadığını ve gerekli referansların atanıp atanmadığını kontrol et
    if (!isMountedRef.current || !mapRef.current) {
      return;
    }
    
    setStatus('loading');
    setErrorMessage('');

    try {
      const google = await GoogleMapsService.loadGoogleMaps();

      // Async işlemden sonra kontrolleri tekrar yap
      if (!isMountedRef.current || !mapRef.current) return;

      // Haritayı sadece bir kere oluştur
      if (!mapInstanceRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          zoom: 10,
          center: { lat: 36.8969, lng: 30.7133 }, // Antalya
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapInstanceRef.current = map;
      }
      
      // Rota çiziciyi sadece bir kere oluştur
      if (!directionsRendererRef.current) {
        const directionsRenderer = new google.maps.DirectionsRenderer({
          polylineOptions: { strokeColor: '#3B82F6', strokeWeight: 5, strokeOpacity: 0.9 }
        });
        directionsRenderer.setMap(mapInstanceRef.current);
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
      if (!leg?.distance || !leg?.duration) {
        throw new Error("Rota bilgileri Google'dan eksik geldi.");
      }

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
      console.error('HybridRouteDisplay Error:', msg);
    }
  }, [origin, destination, originPlace, destinationPlace, onRouteCalculated]);

  useEffect(() => {
    isMountedRef.current = true;
    calculateAndDisplayRoute();

    // Component kaldırıldığında temizlik yap
    return () => {
      isMountedRef.current = false;
    };
  }, [calculateAndDisplayRoute]); // Bu effect, sadece props değiştiğinde tetiklenir.

  if (!origin || !destination) {
    return null; // Eğer başlangıç/bitiş yoksa hiçbir şey gösterme
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4">
      <div className="relative h-64 bg-slate-800/50 rounded-xl flex items-center justify-center" ref={mapRef}>
        {status === 'loading' && (
          <div className="text-center text-white/80">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Rota hesaplanıyor...</p>
          </div>
        )}
        {status === 'error' && (
           <div className="text-center text-red-300 p-4">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Harita gösterilemedi.</p>
            <p className="text-xs mt-1">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
