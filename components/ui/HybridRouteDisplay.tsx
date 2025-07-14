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
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);

  // Cleanup function to prevent DOM manipulation errors
  const cleanup = useCallback(() => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup; // Cleanup on unmount
  }, [cleanup]);

  useEffect(() => {
    if (!origin || !destination) {
      return;
    }

    const calculateAndDisplayRoute = async () => {
      if (!mapRef.current) return;

      // Clean up previous instances
      cleanup();

      setStatus('loading');
      setRouteInfo(null);

      try {
        // Haritayı ve rota çiziciyi oluştur
        const google = await GoogleMapsService.loadGoogleMaps();
        const map = new google.maps.Map(mapRef.current, {
          zoom: 10,
          center: { lat: 36.8969, lng: 30.7133 }, // Antalya
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        
        const directionsRenderer = new google.maps.DirectionsRenderer({
            polylineOptions: { strokeColor: '#3B82F6', strokeWeight: 4 }
        });
        
        // Store references for cleanup
        mapInstanceRef.current = map;
        directionsRendererRef.current = directionsRenderer;
        
        directionsRenderer.setMap(map);

        // Rotayı hesapla
        const result = await GoogleMapsService.getDirections(
          originPlace?.geometry?.location || origin,
          destinationPlace?.geometry?.location || destination
        );
        directionsRenderer.setDirections(result);

        // Bilgileri ayarla ve state'i güncelle
        const leg = result.routes[0].legs[0];
        const routeData = {
          distance: leg.distance?.value || 0,
          duration: leg.duration?.value || 0,
          distanceText: leg.distance?.text || '',
          durationText: leg.duration?.text || '',
        };

        setRouteInfo({ distanceText: routeData.distanceText, durationText: routeData.durationText });
        onRouteCalculated?.(routeData);
        setStatus('success');

      } catch (error) {
        const msg = error instanceof Error
          ? `Rota hesaplanamadı: ${error.message}`
          : 'Bilinmeyen bir harita hatası oluştu.';
        setErrorMessage(msg);
        setStatus('error');
        console.error('Google Maps Route Error:', msg);
      }
    };

    calculateAndDisplayRoute();

  }, [origin, destination, originPlace, destinationPlace, onRouteCalculated, cleanup]);

  if (!origin || !destination) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6">
        <div className="text-center py-8">
          <Route className="h-12 w-12 text-white/60 mx-auto mb-3" />
          <p className="text-white/70">Rota göstermek için başlangıç ve varış noktalarını seçin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
        <Route className="h-6 w-6" />
        <span>Rota Detayları</span>
      </h3>
      
      {/* Rota başlangıç ve bitiş bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-start space-x-3">
            <div className="bg-green-500 p-2 rounded-lg flex-shrink-0"><MapPin className="h-4 w-4 text-white" /></div>
            <div>
                <p className="text-sm text-white/70">Başlangıç</p>
                <p className="text-white font-medium text-sm">{origin}</p>
            </div>
        </div>
        <div className="flex items-start space-x-3">
            <div className="bg-red-500 p-2 rounded-lg flex-shrink-0"><MapPin className="h-4 w-4 text-white" /></div>
            <div>
                <p className="text-sm text-white/70">Varış</p>
                <p className="text-white font-medium text-sm">{destination}</p>
            </div>
        </div>
      </div>

      {/* Harita ve Bilgi Alanı */}
      <div className="relative h-64 bg-white/5 rounded-xl flex items-center justify-center" ref={mapRef}>
        {status === 'loading' && (
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Rota hesaplanıyor...</p>
          </div>
        )}
        {status === 'error' && (
           <div className="text-center text-red-300 p-4">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Rota gösterilemedi.</p>
            <p className="text-xs mt-1">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Mesafe ve Süre */}
      {status === 'success' && routeInfo && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg"><Navigation className="h-4 w-4 text-white" /></div>
                <div>
                    <p className="text-sm text-white/70">Mesafe</p>
                    <p className="text-white font-bold text-lg">{routeInfo.distanceText}</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className="bg-purple-500 p-2 rounded-lg"><Clock className="h-4 w-4 text-white" /></div>
                <div>
                    <p className="text-sm text-white/70">Tahmini Süre</p>
                    <p className="text-white font-bold text-lg">{routeInfo.durationText}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
