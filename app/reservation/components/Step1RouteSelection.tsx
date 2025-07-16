'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Luggage, 
  Plane, 
  ArrowRight,
  ArrowLeftRight,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleMapsService } from '../../../lib/services/googleMapsService';
import GoogleMapsAutocomplete from '../../../components/ui/GoogleMapsAutocomplete';
import type { StepProps, RouteInfo } from '../types/reservation';

/**
 * Adım 1: Rota Seçimi
 * Kullanıcı transfer yönünü seçer, otel/adres girer, tarih/saat/yolcu bilgilerini belirler
 */
export default function Step1RouteSelection({ data, onNext }: StepProps) {
  const [formData, setFormData] = useState({
    direction: data.direction || 'airport-to-hotel' as const,
    hotelLocation: data.hotelLocation || '',
    date: data.date || '',
    time: data.time || '',
    passengers: data.passengers || 1,
    baggage: data.baggage || 1,
  });

  const [hotelPlace, setHotelPlace] = useState<google.maps.places.Place | undefined>(data.hotelPlace);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [autocompleteStatus, setAutocompleteStatus] = useState<'loading' | 'error' | 'success'>('success');

  // Form validation
  const isFormValid = () => {
    return (
      formData.hotelLocation.trim() !== '' &&
      formData.date !== '' &&
      formData.time !== '' &&
      formData.passengers > 0 &&
      formData.baggage >= 0 &&
      hotelPlace
    );
  };

  // Rota hesaplama
  const calculateRoute = async () => {
    if (!hotelPlace || !formData.hotelLocation) return;

    setIsCalculating(true);
    try {
      const airport = { lat: 41.2609, lng: 28.7414 }; // İstanbul Havalimanı koordinatları
      const hotelCoords = hotelPlace.location;

      if (!hotelCoords) {
        throw new Error('Otel koordinatları alınamadı');
      }

      const origin = formData.direction === 'airport-to-hotel' 
        ? airport 
        : { lat: hotelCoords.lat(), lng: hotelCoords.lng() };
      
      const destination = formData.direction === 'airport-to-hotel' 
        ? { lat: hotelCoords.lat(), lng: hotelCoords.lng() } 
        : airport;

      const routeData = await GoogleMapsService.calculateRoute(origin, destination);
      
      if (routeData) {
        setRouteInfo(routeData);
        toast.success('Rota başarıyla hesaplandı!');
      }
    } catch (error) {
      console.error('Rota hesaplama hatası:', error);
      toast.error('Rota hesaplanırken bir hata oluştu');
    } finally {
      setIsCalculating(false);
    }
  };

  // Otel seçimi değiştiğinde rota hesapla
  useEffect(() => {
    if (hotelPlace && formData.hotelLocation) {
      calculateRoute();
    }
  }, [hotelPlace, formData.direction]);

  const handleAddressChange = (value: string, place?: google.maps.places.Place) => {
    setFormData(prev => ({ ...prev, hotelLocation: value }));
    setHotelPlace(place);
  };

  const handleDirectionSwitch = () => {
    setFormData(prev => ({
      ...prev,
      direction: prev.direction === 'airport-to-hotel' ? 'hotel-to-airport' : 'airport-to-hotel'
    }));
  };

  const handleNext = () => {
    if (!isFormValid()) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const from = formData.direction === 'airport-to-hotel' ? 'İstanbul Havalimanı' : formData.hotelLocation;
    const to = formData.direction === 'airport-to-hotel' ? formData.hotelLocation : 'İstanbul Havalimanı';

    const stepData = {
      ...formData,
      from,
      to,
      hotelPlace,
      distance: routeInfo?.distance || 0,
      estimatedDuration: routeInfo?.durationText || '',
      routeInfo,
    };

    onNext(stepData);
  };

  // Minimum tarih (bugün)
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Başlık */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Rota Seçimi</h2>
        <p className="text-white/70">Transfer yönünüzü seçin ve detayları belirleyin</p>
      </div>

      {/* Transfer Yönü */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
        <label className="block text-white font-medium mb-4">Transfer Yönü</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFormData(prev => ({ ...prev, direction: 'airport-to-hotel' }))}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              formData.direction === 'airport-to-hotel'
                ? 'border-blue-500 bg-blue-500/20 text-white'
                : 'border-white/20 bg-white/5 text-white/70 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <Plane className="h-5 w-5" />
              <ArrowRight className="h-4 w-4" />
              <Building2 className="h-5 w-5" />
            </div>
            <p className="mt-2 font-medium">Havalimanı → Otel</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFormData(prev => ({ ...prev, direction: 'hotel-to-airport' }))}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              formData.direction === 'hotel-to-airport'
                ? 'border-blue-500 bg-blue-500/20 text-white'
                : 'border-white/20 bg-white/5 text-white/70 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <Building2 className="h-5 w-5" />
              <ArrowRight className="h-4 w-4" />
              <Plane className="h-5 w-5" />
            </div>
            <p className="mt-2 font-medium">Otel → Havalimanı</p>
          </motion.button>
        </div>
      </div>

      {/* Otel/Adres Girişi */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
        <label className="block text-white font-medium mb-4">
          <MapPin className="inline h-4 w-4 mr-2" />
          Otel/Adres
        </label>
        <GoogleMapsAutocomplete
          placeholder="Otel adı veya tam adres girin..."
          defaultValue={formData.hotelLocation}
          onChange={handleAddressChange}
          onStatusChange={setAutocompleteStatus}
          className="w-full"
        />
        {autocompleteStatus === 'loading' && (
          <p className="text-blue-400 text-sm mt-2">Google Maps yükleniyor...</p>
        )}
        {autocompleteStatus === 'error' && (
          <p className="text-red-400 text-sm mt-2">Adres arama hizmeti kullanılamıyor</p>
        )}
      </div>

      {/* Tarih ve Saat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-medium mb-4">
            <Calendar className="inline h-4 w-4 mr-2" />
            Tarih
          </label>
          <input
            type="date"
            value={formData.date}
            min={today}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-medium mb-4">
            <Clock className="inline h-4 w-4 mr-2" />
            Saat
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Yolcu ve Bagaj */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-medium mb-4">
            <Users className="inline h-4 w-4 mr-2" />
            Yolcu Sayısı
          </label>
          <select
            value={formData.passengers}
            onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={i + 1} className="bg-gray-800">
                {i + 1} Kişi
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-medium mb-4">
            <Luggage className="inline h-4 w-4 mr-2" />
            Bagaj Sayısı
          </label>
          <select
            value={formData.baggage}
            onChange={(e) => setFormData(prev => ({ ...prev, baggage: parseInt(e.target.value) }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i} value={i} className="bg-gray-800">
                {i} Bagaj
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rota Bilgisi */}
      {routeInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 backdrop-blur-md rounded-2xl p-6 border border-green-500/20"
        >
          <h3 className="text-green-400 font-medium mb-3">Rota Bilgileri</h3>
          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <p className="text-white/70">Mesafe</p>
              <p className="font-semibold">{routeInfo.distanceText}</p>
            </div>
            <div>
              <p className="text-white/70">Tahmini Süre</p>
              <p className="font-semibold">{routeInfo.durationText}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* İleri Butonu */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        disabled={!isFormValid() || isCalculating}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
          isFormValid() && !isCalculating
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
        }`}
      >
        {isCalculating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Rota Hesaplanıyor...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>Araç Seçimine Geç</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}