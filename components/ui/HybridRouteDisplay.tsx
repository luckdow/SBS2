// components/ui/HybridRouteDisplay.tsx

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Clock, Route, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';
import ErrorBoundary from './ErrorBoundary';

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
  const isMountedRef = useRef(true); // Track component mount state
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);

  // Enhanced cleanup function to prevent DOM manipulation errors
  const cleanup = useCallback(async () => {
    try {
      // Enhanced safety checks with additional validation and delays
      if (directionsRendererRef.current) {
        try {
          // Check if map container is still valid before cleanup
          if (mapInstanceRef.current && mapRef.current) {
            const mapDiv = mapInstanceRef.current.getDiv();
            // Enhanced validation with async safety checks
            if (await GoogleMapsService.safeElementCheckAsync(mapDiv) && mapDiv === mapRef.current) {
              // Wait for any pending operations to complete
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Final safety check before cleanup
              if (await GoogleMapsService.safeElementCheckAsync(mapDiv) && 
                  mapDiv === mapRef.current && 
                  isMountedRef.current) {
                // Only attempt cleanup if all elements are still properly connected
                directionsRendererRef.current.setDirections({ routes: [] } as any);
                directionsRendererRef.current.setMap(null);
              } else {
                console.warn('Map container state changed during cleanup - skipping DirectionsRenderer cleanup');
              }
            } else {
              console.warn('Map container mismatch or disconnected during cleanup - skipping DirectionsRenderer cleanup');
            }
          } else {
            console.warn('Map instance or container unavailable during cleanup - skipping DirectionsRenderer cleanup');
          }
        } catch (rendererError) {
          console.warn('DirectionsRenderer cleanup warning (non-critical):', rendererError);
        }
        directionsRendererRef.current = null;
      }

      if (mapInstanceRef.current) {
        try {
          const mapDiv = mapInstanceRef.current.getDiv();
          // Only validate if the map container matches our reference and is still connected
          if (mapDiv && await GoogleMapsService.safeElementCheckAsync(mapDiv) && mapDiv === mapRef.current) {
            // Google Maps cleanup happens automatically when DOM element is removed
            // Just clear our reference to prevent memory leaks
          } else {
            console.warn('Map div unavailable or mismatched during cleanup');
          }
        } catch (mapError) {
          console.warn('Map cleanup warning (non-critical):', mapError);
        }
        mapInstanceRef.current = null;
      }
    } catch (error) {
      console.warn('Route cleanup warning (non-critical):', error);
    }
  }, []);

  // Enhanced cleanup on unmount with abort controller for pending operations
  useEffect(() => {
    const abortController = new AbortController();
    
    return () => {
      // Mark component as unmounted to prevent further DOM operations
      isMountedRef.current = false;
      // Signal any pending operations to abort
      abortController.abort();
      // Clean up Google Maps elements with async safety
      cleanup().catch(error => {
        console.warn('Cleanup failed during unmount:', error);
      });
    };
  }, [cleanup]);

  useEffect(() => {
    if (!origin || !destination) {
      return;
    }

    const calculateAndDisplayRoute = async () => {
      // Validate map container exists before proceeding
      if (!mapRef.current) {
        console.warn('Map container not found');
        setErrorMessage('Harita konteyneri bulunamadı');
        setStatus('error');
        return;
      }

      // Clean up previous instances with enhanced safety
      await cleanup();

      setStatus('loading');
      setRouteInfo(null);

      try {
        // Validate element before async operation with enhanced checks
        await GoogleMapsService.validateElementDuringAsync(mapRef.current, 'Map initialization');
        
        // Wait for DOM stability
        const isStable = await GoogleMapsService.waitForDOMStability(mapRef.current, 2000);
        if (!isStable) {
          throw new Error('Map container did not stabilize within timeout');
        }
        
        // Haritayı ve rota çiziciyi oluştur
        const google = await GoogleMapsService.loadGoogleMaps();
        
        // Double-check map container still exists after async operation
        if (!mapRef.current || !GoogleMapsService.safeElementCheck(mapRef.current)) {
          throw new Error('Map container became unavailable during initialization');
        }
        
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
        
        // Final safety check before setting directions - validate all elements still exist
        if (directionsRenderer && 
            mapRef.current && 
            GoogleMapsService.safeElementCheck(mapRef.current) &&
            mapInstanceRef.current &&
            directionsRendererRef.current === directionsRenderer &&
            isMountedRef.current) { // Check component is still mounted
          directionsRenderer.setDirections(result);
        } else {
          console.warn('Component unmounted or invalid during route calculation - skipping direction display');
          return;
        }

        // Bilgileri ayarla ve state'i güncelle
        const leg = result.routes[0].legs[0];
        const routeData = {
          distance: leg.distance?.value || 0,
          duration: leg.duration?.value || 0,
          distanceText: leg.distance?.text || '',
          durationText: leg.duration?.text || '',
        };

        // Final check before updating state - ensure component is still mounted
        if (mapRef.current && GoogleMapsService.safeElementCheck(mapRef.current) && isMountedRef.current) {
          setRouteInfo({ distanceText: routeData.distanceText, durationText: routeData.durationText });
          onRouteCalculated?.(routeData);
          setStatus('success');
        } else {
          console.warn('Component unmounted during route processing - skipping state update');
        }

      } catch (error) {
        // Only set error state if component is still mounted
        if (mapRef.current && GoogleMapsService.safeElementCheck(mapRef.current) && isMountedRef.current) {
          const msg = error instanceof Error
            ? `Rota hesaplanamadı: ${error.message}`
            : 'Bilinmeyen bir harita hatası oluştu.';
          setErrorMessage(msg);
          setStatus('error');
          console.error('Google Maps Route Error:', msg);
        } else {
          console.warn('Component unmounted during error handling - skipping error display');
        }
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
    <ErrorBoundary
      onError={(error) => {
        console.error('HybridRouteDisplay Error:', error);
        // Clean up on error
        cleanup().catch(console.warn);
      }}
      resetKeys={[origin, destination]}
      resetOnPropsChange={true}
    >
      <RouteDisplayContent 
        origin={origin}
        destination={destination}
        originPlace={originPlace}
        destinationPlace={destinationPlace}
        onRouteCalculated={onRouteCalculated}
      />
    </ErrorBoundary>
  );
}

// Separate the main content to isolate error boundary
function RouteDisplayContent({
  origin,
  destination,
  originPlace,
  destinationPlace,
  onRouteCalculated,
}: HybridRouteDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const isMountedRef = useRef(true); // Track component mount state
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);

  // Enhanced cleanup function to prevent DOM manipulation errors
  const cleanup = useCallback(async () => {
    try {
      // Enhanced safety checks with additional validation and delays
      if (directionsRendererRef.current) {
        try {
          // Check if map container is still valid before cleanup
          if (mapInstanceRef.current && mapRef.current) {
            const mapDiv = mapInstanceRef.current.getDiv();
            // Enhanced validation with async safety checks
            if (await GoogleMapsService.safeElementCheckAsync(mapDiv) && mapDiv === mapRef.current) {
              // Wait for any pending operations to complete
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Final safety check before cleanup
              if (await GoogleMapsService.safeElementCheckAsync(mapDiv) && 
                  mapDiv === mapRef.current && 
                  isMountedRef.current) {
                // Only attempt cleanup if all elements are still properly connected
                directionsRendererRef.current.setDirections({ routes: [] } as any);
                directionsRendererRef.current.setMap(null);
              } else {
                console.warn('Map container state changed during cleanup - skipping DirectionsRenderer cleanup');
              }
            } else {
              console.warn('Map container mismatch or disconnected during cleanup - skipping DirectionsRenderer cleanup');
            }
          } else {
            console.warn('Map instance or container unavailable during cleanup - skipping DirectionsRenderer cleanup');
          }
        } catch (rendererError) {
          console.warn('DirectionsRenderer cleanup warning (non-critical):', rendererError);
        }
        directionsRendererRef.current = null;
      }

      if (mapInstanceRef.current) {
        try {
          const mapDiv = mapInstanceRef.current.getDiv();
          // Only validate if the map container matches our reference and is still connected
          if (mapDiv && await GoogleMapsService.safeElementCheckAsync(mapDiv) && mapDiv === mapRef.current) {
            // Google Maps cleanup happens automatically when DOM element is removed
            // Just clear our reference to prevent memory leaks
          } else {
            console.warn('Map div unavailable or mismatched during cleanup');
          }
        } catch (mapError) {
          console.warn('Map cleanup warning (non-critical):', mapError);
        }
        mapInstanceRef.current = null;
      }
    } catch (error) {
      console.warn('Route cleanup warning (non-critical):', error);
    }
  }, []);

  // Enhanced cleanup on unmount with abort controller for pending operations
  useEffect(() => {
    const abortController = new AbortController();
    
    return () => {
      // Mark component as unmounted to prevent further DOM operations
      isMountedRef.current = false;
      // Signal any pending operations to abort
      abortController.abort();
      // Clean up Google Maps elements with async safety
      cleanup().catch(error => {
        console.warn('Cleanup failed during unmount:', error);
      });
    };
  }, [cleanup]);

  useEffect(() => {
    if (!origin || !destination) {
      return;
    }

    const calculateAndDisplayRoute = async () => {
      // Validate map container exists before proceeding
      if (!mapRef.current) {
        console.warn('Map container not found');
        setErrorMessage('Harita konteyneri bulunamadı');
        setStatus('error');
        return;
      }

      // Clean up previous instances with enhanced safety
      await cleanup();

      setStatus('loading');
      setRouteInfo(null);

      try {
        // Validate element before async operation with enhanced checks
        await GoogleMapsService.validateElementDuringAsync(mapRef.current, 'Map initialization');
        
        // Wait for DOM stability
        const isStable = await GoogleMapsService.waitForDOMStability(mapRef.current, 2000);
        if (!isStable) {
          throw new Error('Map container did not stabilize within timeout');
        }
        
        // Haritayı ve rota çiziciyi oluştur
        const google = await GoogleMapsService.loadGoogleMaps();
        
        // Double-check map container still exists after async operation
        if (!mapRef.current || !GoogleMapsService.safeElementCheck(mapRef.current)) {
          throw new Error('Map container became unavailable during initialization');
        }
        
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
        
        // Final safety check before setting directions - validate all elements still exist
        if (directionsRenderer && 
            mapRef.current && 
            GoogleMapsService.safeElementCheck(mapRef.current) &&
            mapInstanceRef.current &&
            directionsRendererRef.current === directionsRenderer &&
            isMountedRef.current) { // Check component is still mounted
          directionsRenderer.setDirections(result);
        } else {
          console.warn('Component unmounted or invalid during route calculation - skipping direction display');
          return;
        }

        // Bilgileri ayarla ve state'i güncelle
        const leg = result.routes[0].legs[0];
        const routeData = {
          distance: leg.distance?.value || 0,
          duration: leg.duration?.value || 0,
          distanceText: leg.distance?.text || '',
          durationText: leg.duration?.text || '',
        };

        // Final check before updating state - ensure component is still mounted
        if (mapRef.current && GoogleMapsService.safeElementCheck(mapRef.current) && isMountedRef.current) {
          setRouteInfo({ distanceText: routeData.distanceText, durationText: routeData.durationText });
          onRouteCalculated?.(routeData);
          setStatus('success');
        } else {
          console.warn('Component unmounted during route processing - skipping state update');
        }

      } catch (error) {
        // Only set error state if component is still mounted
        if (mapRef.current && GoogleMapsService.safeElementCheck(mapRef.current) && isMountedRef.current) {
          const msg = error instanceof Error
            ? `Rota hesaplanamadı: ${error.message}`
            : 'Bilinmeyen bir harita hatası oluştu.';
          setErrorMessage(msg);
          setStatus('error');
          console.error('Google Maps Route Error:', msg);
        } else {
          console.warn('Component unmounted during error handling - skipping error display');
        }
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
