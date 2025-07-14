'use client'

import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMaps';

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

  useEffect(() => {
    if (origin && destination) {
      loadRouteVisualization();
    }
  }, [origin, destination]);

  const loadRouteVisualization = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await GoogleMapsService.getRouteVisualization(origin, destination);
      if (result.status === 'success') {
        setRouteData(result);
      } else {
        setError(result.error || 'Route bilgisi alınamadı');
      }
    } catch (err) {
      setError('Route görselleştirme hatası');
      console.error('Route visualization error:', err);
    } finally {
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
            {distance && (
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Mesafe</p>
                  <p className="text-white font-bold text-lg">{distance} km</p>
                </div>
              </div>
            )}
            
            {duration && (
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Tahmini Süre</p>
                  <p className="text-white font-bold text-lg">{duration}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Route Map Placeholder */}
        <div className="relative">
          {loading ? (
            <div className="h-40 bg-white/5 rounded-xl flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-white">Rota yükleniyor...</span>
              </div>
            </div>
          ) : error ? (
            <div className="h-40 bg-white/5 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Route className="h-8 w-8 text-white/60 mx-auto mb-2" />
                <p className="text-white/70 text-sm">{error}</p>
                <p className="text-white/50 text-xs mt-1">Harita görünümü şu anda kullanılamıyor</p>
              </div>
            </div>
          ) : routeData ? (
            <div className="h-40 bg-white/5 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Route className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">Rota Başarıyla Hesaplandı</p>
                <p className="text-white/70 text-sm">Google Maps entegrasyonu aktif</p>
              </div>
            </div>
          ) : (
            <div className="h-40 bg-white/5 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Route className="h-8 w-8 text-white/60 mx-auto mb-2" />
                <p className="text-white/70">Rota bilgisi bekleniyor...</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Route Info */}
        {routeData && routeData.steps && (
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-medium mb-2">Rota Özeti</h4>
            <div className="text-sm text-white/70">
              <p>✅ Optimum rota hesaplandı</p>
              <p>✅ Trafik durumu dahil</p>
              <p>✅ En kısa süre seçildi</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}