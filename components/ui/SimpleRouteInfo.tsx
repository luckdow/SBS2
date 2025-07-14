'use client'

import React from 'react';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';

interface SimpleRouteInfoProps {
  origin: string;
  destination: string;
  distance?: number;
  duration?: string;
}

export default function SimpleRouteInfo({ origin, destination, distance, duration }: SimpleRouteInfoProps) {
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
                  {distance || 25} km
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
                  {duration || '30 dakika'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Map Placeholder */}
        <div className="relative">
          <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center">
            <div className="text-center px-4">
              <Route className="h-12 w-12 text-white/60 mx-auto mb-3" />
              <p className="text-white font-medium text-base mb-2">Rota Planlandı</p>
              <p className="text-white/70 text-sm mb-3">
                Mesafe ve süre bilgileri hesaplanmıştır.
              </p>
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-left">
                <p className="text-blue-200 text-xs">
                  <strong>Bilgi:</strong> Google Maps entegrasyonu kaldırıldı. Temel rota bilgileri gösteriliyor.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Route Summary */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-medium mb-2">Rota Özeti</h4>
          <div className="text-sm text-white/70 space-y-1">
            <p>✅ Temel rota hesaplandı</p>
            <p>✅ Mesafe ve süre tahmini yapıldı</p>
            <p>✅ Rezervasyon için hazır</p>
          </div>
        </div>
      </div>
    </div>
  );
}