'use client'

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Route, Car, Users, Footprints, Bus, AlertCircle, CheckCircle } from 'lucide-react';
import GoogleMapsRouteDisplay from './GoogleMapsRouteDisplay';

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

const TRAVEL_MODES = [
  {
    mode: 'DRIVING',
    icon: Car,
    name: 'Araç',
    color: 'blue'
  },
  {
    mode: 'TRANSIT',
    icon: Bus,
    name: 'Toplu Taşıma',
    color: 'green'
  },
  {
    mode: 'WALKING',
    icon: Footprints,
    name: 'Yürüyüş',
    color: 'orange'
  }
];

export default function HybridRouteDisplay({ 
  origin, 
  destination, 
  originPlace, 
  destinationPlace,
  onRouteCalculated
}: HybridRouteDisplayProps) {
  const [showGoogleMaps, setShowGoogleMaps] = useState(true);
  const [googleMapsError, setGoogleMapsError] = useState<string>('');
  const [showFallback, setShowFallback] = useState(false);
  const [selectedTravelMode, setSelectedTravelMode] = useState('DRIVING');
  const [fallbackRouteData, setFallbackRouteData] = useState<{
    distance: number;
    duration: number;
    distanceText: string;
    durationText: string;
  } | null>(null);

  const calculateFallbackRoute = () => {
    const lowerOrigin = origin.toLowerCase();
    const lowerDestination = destination.toLowerCase();
    
    let distance = 25; // Default distance in km
    let duration = 30; // Default duration in minutes
    
    // Airport to city center area
    if ((lowerOrigin.includes('havalimanı') || lowerOrigin.includes('airport')) && 
        (lowerDestination.includes('lara') || lowerDestination.includes('konyaaltı'))) {
      distance = 20;
      duration = 25;
    }
    // Airport to Kemer
    else if ((lowerOrigin.includes('havalimanı') || lowerOrigin.includes('airport')) && 
             lowerDestination.includes('kemer')) {
      distance = 45;
      duration = 55;
    }
    // Airport to Side
    else if ((lowerOrigin.includes('havalimanı') || lowerOrigin.includes('airport')) && 
             lowerDestination.includes('side')) {
      distance = 65;
      duration = 75;
    }
    // Airport to Belek
    else if ((lowerOrigin.includes('havalimanı') || lowerOrigin.includes('airport')) && 
             lowerDestination.includes('belek')) {
      distance = 35;
      duration = 40;
    }
    // Reverse routes
    else if ((lowerDestination.includes('havalimanı') || lowerDestination.includes('airport')) && 
             (lowerOrigin.includes('lara') || lowerOrigin.includes('konyaaltı'))) {
      distance = 20;
      duration = 25;
    }
    else if ((lowerDestination.includes('havalimanı') || lowerDestination.includes('airport')) && 
             lowerOrigin.includes('kemer')) {
      distance = 45;
      duration = 55;
    }
    else if ((lowerDestination.includes('havalimanı') || lowerDestination.includes('airport')) && 
             lowerOrigin.includes('side')) {
      distance = 65;
      duration = 75;
    }
    else if ((lowerDestination.includes('havalimanı') || lowerDestination.includes('airport')) && 
             lowerOrigin.includes('belek')) {
      distance = 35;
      duration = 40;
    }

    // Adjust for different travel modes
    if (selectedTravelMode === 'WALKING') {
      duration = Math.round(distance * 12); // ~12 minutes per km walking
    } else if (selectedTravelMode === 'TRANSIT') {
      duration = Math.round(duration * 1.5); // Public transport takes longer
    }

    const routeData = {
      distance,
      duration: duration * 60, // Convert to seconds
      distanceText: `${distance} km`,
      durationText: duration > 60 
        ? `${Math.floor(duration / 60)} saat ${duration % 60} dakika`
        : `${duration} dakika`
    };

    setFallbackRouteData(routeData);
    onRouteCalculated?.({
      distance,
      duration: duration * 60,
      distanceText: routeData.distanceText,
      durationText: routeData.durationText
    });
  };

  const handleGoogleMapsError = (error: string) => {
    setGoogleMapsError(error);
    setShowFallback(true);
    setShowGoogleMaps(false);
    calculateFallbackRoute();
  };

  const retryGoogleMaps = () => {
    setGoogleMapsError('');
    setShowFallback(false);
    setShowGoogleMaps(true);
  };

  const handleTravelModeChange = (mode: string) => {
    setSelectedTravelMode(mode);
    if (showFallback) {
      calculateFallbackRoute();
    }
  };

  // Auto-switch to fallback after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showGoogleMaps && !googleMapsError && origin && destination) {
        setShowFallback(true);
        setShowGoogleMaps(false);
        calculateFallbackRoute();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [showGoogleMaps, googleMapsError, origin, destination]);

  useEffect(() => {
    if (showFallback && origin && destination) {
      calculateFallbackRoute();
    }
  }, [selectedTravelMode, origin, destination, showFallback]);

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

  if (showGoogleMaps && !showFallback) {
    return (
      <GoogleMapsRouteDisplay
        origin={origin}
        destination={destination}
        originPlace={originPlace}
        destinationPlace={destinationPlace}
        onRouteCalculated={onRouteCalculated}
        onError={handleGoogleMapsError}
      />
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
        <Route className="h-6 w-6" />
        <span>Rota Bilgileri</span>
        {showFallback && (
          <div className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded">
            Yerel Hesaplama
          </div>
        )}
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
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-1 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/30 bg-white/10 hover:border-white/50'
                }`}
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
      {googleMapsError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200 text-sm">{googleMapsError}</p>
              <button
                onClick={retryGoogleMaps}
                className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
              >
                Google Maps'i tekrar dene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Information */}
      {fallbackRouteData && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Navigation className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Mesafe</p>
              <p className="text-white font-bold text-lg">{fallbackRouteData.distanceText}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Tahmini Süre</p>
              <p className="text-white font-bold text-lg">{fallbackRouteData.durationText}</p>
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

      {/* Fallback Map Placeholder */}
      <div className="relative">
        <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center">
          <div className="text-center px-4">
            <Route className="h-12 w-12 text-white/60 mx-auto mb-3" />
            <p className="text-white font-medium text-base mb-2">Rota Hesaplandı</p>
            <p className="text-white/70 text-sm mb-3">
              Mesafe ve süre bilgileri yerel algoritma ile hesaplanmıştır.
            </p>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-left">
              <p className="text-blue-200 text-xs">
                <strong>Bilgi:</strong> Google Maps kullanılamadığı için yerel hesaplama kullanılıyor. 
                Gerçek mesafe ve süre farklılık gösterebilir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      {showFallback && (
        <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-yellow-400" />
            <div className="flex-1">
              <p className="text-yellow-200 text-sm">
                <strong>Yerel hesaplama aktif:</strong> Antalya bölgesi için optimize edilmiş mesafe tahmini
              </p>
              <button
                onClick={retryGoogleMaps}
                className="mt-1 text-xs text-yellow-300 hover:text-yellow-100 underline"
              >
                Google Maps'i tekrar dene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Summary */}
      <div className="mt-4 bg-white/5 rounded-xl p-4">
        <h4 className="text-white font-medium mb-2">Rota Özeti</h4>
        <div className="text-sm text-white/70 space-y-1">
          <p>✅ Yerel rota hesaplandı ({selectedTravelMode.toLowerCase()})</p>
          <p>✅ Mesafe ve süre tahmini yapıldı</p>
          <p>✅ Rezervasyon için hazır</p>
        </div>
      </div>
    </div>
  );
}