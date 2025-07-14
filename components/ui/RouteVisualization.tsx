'use client'

import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMaps';
import { loadGoogleMapsAPI } from '../../lib/googleMapsLoader';

// Declare Google Maps types for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

interface RouteVisualizationProps {
  origin: string;
  destination: string;
  distance?: number;
  duration?: string;
}

export default function RouteVisualization({ origin, destination, distance, duration }: RouteVisualizationProps) {
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsService = useRef<any>(null);
  const directionsRenderer = useRef<any>(null);

  // Load Google Maps JavaScript API using centralized loader
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMapsAPI();
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        setError('Google Maps API yüklenemedi');
      }
    };

    initializeGoogleMaps();
  }, []);

  // Initialize map when Google Maps is loaded and refs are ready
  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && origin && destination) {
      initializeMap();
    }
  }, [googleMapsLoaded, origin, destination]);

  const initializeMap = async () => {
    if (!window.google || !mapRef.current) return;

    setLoading(true);
    setError('');

    try {
      // Initialize the map
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 36.8969, lng: 30.7133 }, // Antalya center
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{ "color": "#242f3e" }]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#242f3e" }]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#746855" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#17263c" }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Initialize directions service and renderer
      directionsService.current = new window.google.maps.DirectionsService();
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4F46E5',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      directionsRenderer.current.setMap(map);

      // Calculate and display route
      const request = {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        region: 'TR'
      };

      directionsService.current.route(request, (result: any, status: any) => {
        if (status === 'OK') {
          directionsRenderer.current.setDirections(result);
          
          // Get route information
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setRouteData({
            distance: Math.round(leg.distance.value / 1000), // Convert to km
            duration: leg.duration.text,
            polyline: route.overview_polyline.points,
            bounds: route.bounds,
            steps: leg.steps
          });
        } else {
          console.error('Directions request failed:', status);
          setError(`Route bulunamadı: ${status}`);
        }
        setLoading(false);
      });

    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Harita yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  if (!origin || !destination) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
        <Route className="h-6 w-6" />
        <span>Rota Bilgileri</span>
      </h3>

      <div className="space-y-4">
        {/* Route Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-green-500 p-2 rounded-lg flex-shrink-0">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/70">Başlangıç</p>
                <p className="text-white font-medium">{origin}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-red-500 p-2 rounded-lg flex-shrink-0">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/70">Varış</p>
                <p className="text-white font-medium">{destination}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Navigation className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/70">Mesafe</p>
                <p className="text-white font-bold text-lg">
                  {routeData?.distance || distance || '-'} km
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/70">Tahmini Süre</p>
                <p className="text-white font-bold text-lg">
                  {routeData?.duration || duration || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps Widget */}
        <div className="relative">
          {loading ? (
            <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-white">Rota yükleniyor...</span>
              </div>
            </div>
          ) : error ? (
            <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Route className="h-8 w-8 text-white/60 mx-auto mb-2" />
                <p className="text-white/70 text-sm">{error}</p>
                <p className="text-white/50 text-xs mt-1">Harita görünümü şu anda kullanılamıyor</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div 
                ref={mapRef} 
                className="w-full h-64 rounded-xl overflow-hidden"
                style={{ minHeight: '256px' }}
              />
              {!googleMapsLoaded && (
                <div className="absolute inset-0 bg-white/5 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Route className="h-8 w-8 text-white/60 mx-auto mb-2" />
                    <p className="text-white/70">Google Maps yükleniyor...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Route Info */}
        {routeData && (
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-medium mb-2">Rota Özeti</h4>
            <div className="text-sm text-white/70 space-y-1">
              <p>✅ Optimum rota hesaplandı</p>
              <p>✅ Gerçek zamanlı trafik verileri</p>
              <p>✅ Google Maps entegrasyonu aktif</p>
              {routeData.steps && (
                <p>✅ {routeData.steps.length} adımda varış</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}