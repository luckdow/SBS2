'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Luggage, Plane, ArrowRight } from 'lucide-react';
import { GoogleMapsErrorBoundary } from '../../../components/common/ErrorBoundary';
import HybridAddressInput from '../../../components/ui/HybridAddressInput';
import HybridRouteDisplay from '../../../components/ui/HybridRouteDisplay';
import toast from 'react-hot-toast';
import { StepProps, RouteInfo } from '../types/reservation';

interface RouteStepData {
  direction: 'airport-to-hotel' | 'hotel-to-airport';
  hotelLocation: string;
  date: string;
  time: string;
  passengers: number;
  baggage: number;
  from: string;
  to: string;
  distance: number;
  estimatedDuration: string;
  hotelPlace: google.maps.places.Place | google.maps.places.PlaceResult;
}

export default function Step1RouteSelection({ onNext, disabled = false }: StepProps) {
  const [formData, setFormData] = useState({
    direction: 'airport-to-hotel' as const,
    hotelLocation: '',
    date: '',
    time: '',
    passengers: 1,
    baggage: 1,
  });

  const [hotelPlace, setHotelPlace] = useState<google.maps.places.Place | undefined>();
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const getFromLocation = () => 
    formData.direction === 'airport-to-hotel' ? 'Antalya Havalimanı' : formData.hotelLocation;
  
  const getToLocation = () => 
    formData.direction === 'airport-to-hotel' ? formData.hotelLocation : 'Antalya Havalimanı';

  const handleHotelLocationChange = (value: string, place?: google.maps.places.Place) => {
    setFormData(prev => ({ ...prev, hotelLocation: value }));
    if (place && place.location) {
      setHotelPlace(place);
      setRouteInfo(null);
    } else {
      setHotelPlace(undefined);
      setRouteInfo(null);
    }
  };

  const handleRouteCalculated = (result: RouteInfo) => {
    setRouteInfo(result);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateDateTime = () => {
    if (!formData.date || !formData.time) {
      toast.error("Lütfen tarih ve saat seçin.");
      return false;
    }

    const reservationDateTime = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    if (reservationDateTime < now) {
      toast.error("Geçmiş bir tarih veya saat seçilemez.");
      return false;
    }
    
    if (reservationDateTime < fourHoursFromNow) {
      toast.error("Rezervasyon, en az 4 saat sonrası için yapılmalıdır.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelPlace || !routeInfo) {
      toast.error("Lütfen listeden geçerli bir konum seçin ve rotanın hesaplanmasını bekleyin.");
      return;
    }
    if (!validateDateTime()) {
      return;
    }
    
    const submitData: RouteStepData = { 
      ...formData, 
      from: getFromLocation(), 
      to: getToLocation(), 
      distance: Math.round(routeInfo.distance / 1000),
      estimatedDuration: routeInfo.durationText,
      hotelPlace: hotelPlace
    };
    onNext(submitData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -50 }} 
      transition={{ duration: 0.3, ease: "easeInOut" }} 
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Rota Seçimi</h2>
        <p className="text-white/70 text-lg">Transfer yönünüzü seçin ve otel bilgilerinizi girin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Direction Selection */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-white">Transfer Yönü</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="relative group cursor-pointer">
              <input 
                type="radio" 
                name="direction" 
                value="airport-to-hotel" 
                checked={formData.direction === 'airport-to-hotel'} 
                onChange={(e) => setFormData({ ...formData, direction: e.target.value as any })} 
                className="sr-only" 
              />
              <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${
                formData.direction === 'airport-to-hotel' 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-white/30 bg-white/10 hover:border-white/50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    formData.direction === 'airport-to-hotel' ? 'bg-blue-500' : 'bg-white/20'
                  }`}>
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-lg">Havalimanı → Otel</span>
                    <p className="text-white/70 text-sm">Karşılama hizmeti ile</p>
                  </div>
                </div>
              </div>
            </label>

            <label className="relative group cursor-pointer">
              <input 
                type="radio" 
                name="direction" 
                value="hotel-to-airport" 
                checked={formData.direction === 'hotel-to-airport'} 
                onChange={(e) => setFormData({ ...formData, direction: e.target.value as any })} 
                className="sr-only" 
              />
              <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${
                formData.direction === 'hotel-to-airport' 
                  ? 'border-purple-500 bg-purple-500/20' 
                  : 'border-white/30 bg-white/10 hover:border-white/50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    formData.direction === 'hotel-to-airport' ? 'bg-purple-500' : 'bg-white/20'
                  }`}>
                    <Plane className="h-6 w-6 text-white transform rotate-180" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-lg">Otel → Havalimanı</span>
                    <p className="text-white/70 text-sm">Zamanında ulaşım</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Hotel Location Input */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-white">
            {formData.direction === 'airport-to-hotel' ? 'Otel Adı / Konumu' : 'Kalkış Yeri (Otel)'}
          </label>
          <GoogleMapsErrorBoundary>
            <HybridAddressInput 
              value={formData.hotelLocation} 
              onChange={handleHotelLocationChange} 
              placeholder={formData.direction === 'airport-to-hotel' ? 'Otel adını yazın...' : 'Kalkış yerini yazın...'} 
            />
          </GoogleMapsErrorBoundary>
        </div>
        
        {/* Route Display */}
        <AnimatePresence>
          {hotelPlace && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '2rem' }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                <GoogleMapsErrorBoundary>
                  <HybridRouteDisplay 
                    origin={getFromLocation()}
                    destination={getToLocation()}
                    originPlace={formData.direction === 'hotel-to-airport' ? hotelPlace : undefined}
                    destinationPlace={formData.direction === 'airport-to-hotel' ? hotelPlace : undefined}
                    onRouteCalculated={handleRouteCalculated}
                  />
                </GoogleMapsErrorBoundary>
                {routeInfo && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 text-center">
                    <p className="text-green-200 text-sm">
                      ✅ Rota hesaplandı: Yaklaşık {routeInfo.distanceText} / {routeInfo.durationText}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Tarih</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input 
                type="date" 
                value={formData.date} 
                min={getMinDate()} 
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" 
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Saat</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input 
                type="time" 
                value={formData.time} 
                onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Passenger and Baggage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Yolcu Sayısı</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input 
                type="number" 
                min="1" 
                max="16" 
                value={formData.passengers} 
                onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })} 
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/50" 
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Bagaj Sayısı</label>
            <div className="relative">
              <Luggage className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input 
                type="number" 
                min="0" 
                max="20" 
                value={formData.baggage} 
                onChange={(e) => setFormData({ ...formData, baggage: parseInt(e.target.value) })} 
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={!hotelPlace || !routeInfo || disabled} 
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
          >
            <span>Devam Et</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </form>
    </motion.div>
  );
}