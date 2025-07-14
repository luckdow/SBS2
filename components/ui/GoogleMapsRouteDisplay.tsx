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
  const abortControllerRef = useRef<AbortController | null>(null);
  
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

  const safeCleanup = useCallback(async () => {
    try {
      // Cancel any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Safe cleanup of Google Maps components with additional DOM checks
      if (directionsRendererRef.current) {
        try {
          // Only manipulate if map container still exists
          if (mapInstanceRef.current && mapRef.current && GoogleMapsService.safeElementCheck(mapRef.current)) {
            directionsRendererRef.current.setDirections({ routes: [] } as any);
            directionsRendererRef.current.setMap(null);
          }
        } catch (rendererError) {
          console.warn('DirectionsRenderer cleanup warning:', rendererError);
        }
        directionsRendererRef.current = null;
      }

      if (mapInstanceRef.current) {
        try {
          // Validate map container before cleanup
          const mapDiv = mapInstanceRef.current.getDiv();
          if (mapDiv && GoogleMapsService.safeElementCheck(mapDiv)) {
            // Google Maps cleanup happens automatically when DOM element is removed
            // We just need to clear our reference
          }
        } catch (mapError) {
          console.warn('Map cleanup warning:', mapError);
        }
        mapInstanceRef.current = null;
      }
    } catch (error) {
      // Silent cleanup - don't propagate errors
      console.warn('Route display cleanup warning:', error);
    }
  }, []);

  const initializeMap = useCallback(async () => {
    if (!isMountedRef.current || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    // Create new AbortController for this operation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError('');

    try {
      // Validate element before async operation
      await GoogleMapsService.validateElementDuringAsync(mapRef.current, 'Map initialization');
      
      if (signal.aborted || !isMountedRef.current) return;

      const map = await GoogleMapsService.createMap(mapRef.current, {
        zoom: 10,
        center: { lat: 36.8969, lng: 30.7133 }, // Antalya center
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });

      if (signal.aborted || !isMountedRef.current) {
        // Cleanup map if component unmounted during creation
        await GoogleMapsService.safeMapCleanup(map);
        return;
      }

      mapInstanceRef.current = map;

      // Load google maps first to get the constructor
      const google = await GoogleMapsService.loadGoogleMaps();
      
      if (signal.aborted || !isMountedRef.current) return;

      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      directionsRenderer.setMap(map);
      directionsRendererRef.current = directionsRenderer;

      if (isMountedRef.current) {
        setIsInitialized(true);
      }
    } catch (error) {
      if (!isMountedRef.current || signal.aborted) return;
      
      const errorMessage = error instanceof Error 
        ? `Google Maps yüklenemedi: ${error.message}` 
        : 'Google Maps servisi kullanılamıyor.';
      handleError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [handleError]);

  const calculateRoute = useCallback(async (travelMode: google.maps.TravelMode) => {
    if (!isMountedRef.current || !origin || !destination || !directionsRendererRef.current) {
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

      // Safely set directions
      if (directionsRendererRef.current && GoogleMapsService.safeElementCheck(mapRef.current!)) {
        directionsRendererRef.current.setDirections(result);
      }

      const route = result.routes[0];
      const leg = route.legs[0];

      const routeData: RouteInfo = {
        distance: leg.distance?.value || 0,
        duration: leg.duration?.value || 0,
        distanceText: leg.distance?.text || '',
        durationText: leg.duration?.text || '',
        travelMode
      };

      if (isMountedRef.current) {
        setRouteInfo(routeData);

        // Callback to parent component
        onRouteCalculated?.({
          distance: Math.round((leg.distance?.value || 0) / 1000), // Convert to km
          duration: leg.duration?.value || 0,
          distanceText: leg.distance?.text || '',
          durationText: leg.duration?.text || ''
        });
      }

    } catch (error) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error instanceof Error 
        ? `Rota hesaplanamadı: ${error.message}` 
        : 'Rota hesaplama hatası.';
      handleError(errorMessage);
      
      // Safely clear any existing route
      if (directionsRendererRef.current && GoogleMapsService.safeElementCheck(mapRef.current!)) {
        try {
          directionsRendererRef.current.setDirections({ routes: [] } as any);
        } catch (cleanupError) {
          console.warn('Route cleanup warning:', cleanupError);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [origin, destination, originPlace, destinationPlace, onRouteCalculated, handleError]);

  const handleTravelModeChange = (travelMode: google.maps.TravelMode) => {
    if (!isMountedRef.current) return;
    setSelectedTravelMode(travelMode);
    calculateRoute(travelMode);
  };

  const handleRetry = () => {
    if (!isMountedRef.current) return;
    
    setError('');
    if (isInitialized) {
      calculateRoute(selectedTravelMode);
    } else {
      safeCleanup().then(() => {
        if (isMountedRef.current) {
          setIsInitialized(false);
          initializeMap();
        }
      });
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    initializeMap();

    return () => {
      isMountedRef.current = false;
      safeCleanup();
    };
  }, [initializeMap, safeCleanup]);

  useEffect(() => {
    if (isMountedRef.current && isInitialized && origin && destination) {
      calculateRoute(selectedTravelMode);
    }
  }, [isInitialized, origin, destination, selectedTravelMode, calculateRoute]);

  if (!origin || !destination) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6">
        <div className="text-center py-8">
          <Route className="h-12 w-12 text-white/60 mx-auto mb-3" />
          <p className="text-white/70">Rota göstermek için başlangıç ve varış noktalarını seçin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
        <Route className="h-6 w-6" />
        <span>Google Maps Rota</span>
        {isLoading && <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
      </h3>

      {/* Travel Mode Selection */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-white font-medium text-sm">Ulaşım Türü:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TRAVEL_MODES.map((mode) => {
            const IconComponent = mode.icon;
            const isSelected = selectedTravelMode === mode.mode;
            return (
              <button
                key={mode.mode}
                onClick={() => handleTravelModeChange(mode.mode)}
                disabled={isLoading}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/30 bg-white/10 hover:border-white/50'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <IconComponent className={`h-5 w-5 ${
                  isSelected ? 'text-blue-400' : 'text-white/70'
                }`} />
                <span className={`text-xs font-medium ${
                  isSelected ? 'text-blue-200' : 'text-white/70'
                }`}>
                  {mode.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-xs text-red-300 hover:text-red-100 underline flex items-center space-x-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Tekrar dene</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Information */}
      {routeInfo && !error && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Navigation className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Mesafe</p>
              <p className="text-white font-bold text-lg">{routeInfo.distanceText}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Süre</p>
              <p className="text-white font-bold text-lg">{routeInfo.durationText}</p>
            </div>
          </div>
        </div>
      )}

      {/* Route Details Summary */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-green-500 p-2 rounded-lg flex-shrink-0">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Başlangıç</p>
              <p className="text-white font-medium text-sm">{origin}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 p-2 rounded-lg flex-shrink-0">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Varış</p>
              <p className="text-white font-medium text-sm">{destination}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="h-80 w-full rounded-xl overflow-hidden bg-gray-200"
        />
        
        {isLoading && !isInitialized && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
              <p className="text-white text-sm">Google Maps yükleniyor...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Status */}
      {isInitialized && !error && (
        <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-green-200 text-sm">
              <strong>Google Maps aktif:</strong> Gerçek zamanlı rota ve mesafe hesaplaması
            </p>
          </div>
        </div>
      )}
    </div>
  );
}