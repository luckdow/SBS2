'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Clock, Route, Car, Users, Footprints, Bus, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
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
  onError?: (error: string) => void;
}

interface RouteInfo {
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
  travelMode: google.maps.TravelMode;
}

const TRAVEL_MODES = [
  {
    mode: 'DRIVING' as google.maps.TravelMode,
    icon: Car,
    name: 'Araç',
    color: 'blue'
  },
  {
    mode: 'TRANSIT' as google.maps.TravelMode,
    icon: Bus,
    name: 'Toplu Taşıma',
    color: 'green'
  },
  {
    mode: 'WALKING' as google.maps.TravelMode,
    icon: Footprints,
    name: 'Yürüyüş',
    color: 'orange'
  }
];

export default function GoogleMapsRouteDisplay({ 
  origin, 
  destination, 
  originPlace, 
  destinationPlace,
  onRouteCalculated,
  onError 
}: GoogleMapsRouteDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const isMountedRef = useRef(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedTravelMode, setSelectedTravelMode] = useState<google.maps.TravelMode>('DRIVING' as google.maps.TravelMode);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const handleError = useCallback((errorMessage: string) => {
    if (!isMountedRef.current) return;
    
    setError(errorMessage);
    onError?.(errorMessage);
    console.error('Google Maps Route Error:', errorMessage);
  }, [onError]);
  
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !isMountedRef.current || isInitialized) return;
    
    setIsLoading(true);
    setError('');

    try {
      const google = await GoogleMapsService.loadGoogleMaps();
      if (!isMountedRef.current || !mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 36.8969, lng: 30.7133 }, // Antalya
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapInstanceRef.current = map;
      
      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 6,
          strokeOpacity: 0.8
        }
      });
      directionsRenderer.setMap(map);
      directionsRendererRef.current = directionsRenderer;
      
      setIsInitialized(true);

    } catch (error) {
      const errorMessage = error instanceof Error ? `Harita yüklenemedi: ${error.message}` : 'Harita servisi kullanılamıyor.';
      handleError(errorMessage);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [handleError, isInitialized]);

  const calculateRoute = useCallback(async (travelMode: google.maps.TravelMode) => {
    if (!isMountedRef.current || !isInitialized || !origin || !destination || !directionsRendererRef.current) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await GoogleMapsService.getDirections(
        originPlace?.geometry?.location || origin,
        destinationPlace?.geometry?.location || destination,
        travelMode
      );

      if (!isMountedRef.current) return;

      // *** DÜZELTME: Gereksiz ve hatalı 'safeElementCheck' kaldırıldı. ***
      // Sadece 'directionsRendererRef.current' var mı diye kontrol etmek yeterli.
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(result);
      }

      const route = result.routes[0];
      const leg = route.legs[0];

      if (!leg?.distance || !leg?.duration) {
        throw new Error("Rota bilgisi eksik geldi.");
      }

      const routeData: RouteInfo = {
        distance: leg.distance.value,
        duration: leg.duration.value,
        distanceText: leg.distance.text,
        durationText: leg.duration.text,
        travelMode
      };

      setRouteInfo(routeData);

      onRouteCalculated?.({
        distance: leg.distance.value,
        duration: leg.duration.value,
        distanceText: leg.distance.text,
        durationText: leg.duration.text
      });

    } catch (error) {
        const errorMessage = error instanceof Error ? `Rota hesaplanamadı: ${error.message}` : 'Rota hesaplama hatası.';
        handleError(errorMessage);
        
        // *** DÜZELTME: Gereksiz ve hatalı 'safeElementCheck' kaldırıldı. ***
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setDirections({ routes: [] } as any);
        }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [isInitialized, origin, destination, originPlace, destinationPlace, onRouteCalculated, handleError]);
  
  useEffect(() => {
    isMountedRef.current = true;
    initializeMap();

    return () => {
      isMountedRef.current = false;
      // Component kaldırıldığında referansları temizle
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [initializeMap]);

  useEffect(() => {
    if (isInitialized) {
      calculateRoute(selectedTravelMode);
    }
  }, [isInitialized, origin, destination, selectedTravelMode, calculateRoute]);

  const handleRetry = () => {
    setError('');
    if (!isInitialized) {
      initializeMap();
    } else {
      calculateRoute(selectedTravelMode);
    }
  };
  
  if (!origin || !destination) return null;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4 space-y-4">
       {error && (
        <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-200 text-sm">{error}</p>
            <button onClick={handleRetry} className="mt-1 text-xs text-red-300 hover:text-white underline">Tekrar dene</button>
          </div>
        </div>
      )}

      <div ref={mapRef} className="h-60 w-full rounded-lg overflow-hidden bg-slate-800 relative">
        {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
        )}
      </div>

      {routeInfo && !error && (
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-xs text-white/60">Mesafe</p>
                <p className="text-white font-bold">{routeInfo.distanceText}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-xs text-white/60">Süre</p>
                <p className="text-white font-bold">{routeInfo.durationText}</p>
            </div>
        </div>
      )}
    </div>
  );
}
