'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Users, Luggage, Plane, MapPin, Star, Check, CheckCircle,
  Download, Mail, Phone, ArrowRight, ArrowLeft, Sparkles, Shield, Car,
  Navigation, QrCode, CreditCard, Gift, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { EmailService } from '../../lib/services/emailService';
import { AuthService } from '../../lib/services/authService';
import { realTimeReservationService } from '../../lib/services/realTimeService';
import { vehicleService } from '../../lib/services/vehicleService';
import { serviceService } from '../../lib/services/serviceService';
import HybridAddressInput from '../../components/ui/HybridAddressInput';
import HybridRouteDisplay from '../../components/ui/HybridRouteDisplay';
import { GoogleMapsService } from '../../lib/services/googleMapsService';
import ErrorBoundary, { GoogleMapsErrorBoundary } from '../../components/common/ErrorBoundary';

// #####################################################################
// ### 1. ADIM: ROTA SEÇİMİ BİLEŞENİ                              ###
// #####################################################################
function RouteStep({ onNext, disabled = false }: { onNext: (data: any) => void; disabled?: boolean }) {
  const [formData, setFormData] = useState({
    direction: 'airport-to-hotel',
    hotelLocation: '',
    date: '',
    time: '',
    passengers: 1,
    baggage: 1,
  });

  const [hotelPlace, setHotelPlace] = useState<google.maps.places.PlaceResult | undefined>();
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; distanceText: string; durationText: string; } | null>(null);

  const getFromLocation = () => formData.direction === 'airport-to-hotel' ? 'Antalya Havalimanı' : formData.hotelLocation;
  const getToLocation = () => formData.direction === 'airport-to-hotel' ? formData.hotelLocation : 'Antalya Havalimanı';

  const handleHotelLocationChange = (value: string, place?: google.maps.places.PlaceResult) => {
    setFormData(prev => ({ ...prev, hotelLocation: value }));
    if (place && place.geometry) {
      setHotelPlace(place);
      setRouteInfo(null);
    } else {
      setHotelPlace(undefined);
      setRouteInfo(null);
    }
  };

  const handleRouteCalculated = (result: { distance: number; duration: number; distanceText: string; durationText: string; }) => {
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
    const submitData = { 
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
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Rota Seçimi</h2>
        <p className="text-white/70 text-lg">Transfer yönünüzü seçin ve otel bilgilerinizi girin</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-white">Transfer Yönü</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="relative group cursor-pointer">
              <input type="radio" name="direction" value="airport-to-hotel" checked={formData.direction === 'airport-to-hotel'} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} className="sr-only" />
              <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${formData.direction === 'airport-to-hotel' ? 'border-blue-500 bg-blue-500/20' : 'border-white/30 bg-white/10 hover:border-white/50'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${formData.direction === 'airport-to-hotel' ? 'bg-blue-500' : 'bg-white/20'}`}><Plane className="h-6 w-6 text-white" /></div>
                  <div>
                    <span className="font-semibold text-white text-lg">Havalimanı → Otel</span>
                    <p className="text-white/70 text-sm">Karşılama hizmeti ile</p>
                  </div>
                </div>
              </div>
            </label>
            <label className="relative group cursor-pointer">
              <input type="radio" name="direction" value="hotel-to-airport" checked={formData.direction === 'hotel-to-airport'} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} className="sr-only" />
              <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${formData.direction === 'hotel-to-airport' ? 'border-purple-500 bg-purple-500/20' : 'border-white/30 bg-white/10 hover:border-white/50'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${formData.direction === 'hotel-to-airport' ? 'bg-purple-500' : 'bg-white/20'}`}><Plane className="h-6 w-6 text-white transform rotate-180" /></div>
                  <div>
                    <span className="font-semibold text-white text-lg">Otel → Havalimanı</span>
                    <p className="text-white/70 text-sm">Zamanında ulaşım</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-white">{formData.direction === 'airport-to-hotel' ? 'Otel Adı / Konumu' : 'Kalkış Yeri (Otel)'}</label>
          <GoogleMapsErrorBoundary>
            <HybridAddressInput 
              value={formData.hotelLocation} 
              onChange={handleHotelLocationChange} 
              placeholder={formData.direction === 'airport-to-hotel' ? 'Otel adını yazın...' : 'Kalkış yerini yazın...'} 
            />
          </GoogleMapsErrorBoundary>
        </div>
        
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Tarih</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input type="date" value={formData.date} min={getMinDate()} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Saat</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50" required />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Yolcu Sayısı</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input type="number" min="1" max="16" value={formData.passengers} onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })} className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/50" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Bagaj Sayısı</label>
            <div className="relative">
              <Luggage className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input type="number" min="0" max="20" value={formData.baggage} onChange={(e) => setFormData({ ...formData, baggage: parseInt(e.target.value) })} className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50" required />
            </div>
          </div>
        </div>

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

// #####################################################################
// ### 2. ADIM: ARAÇ & FİYAT SEÇİMİ BİLEŞENİ                        ###
// #####################################################################
function VehicleStep({ vehicles, services, reservationData, loadingVehicles, loadingServices, onNext, onBack, disabled = false }: any) {
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [distance, setDistance] = useState(reservationData?.distance || 0);
  
    const handleRouteCalculated = (result: { distance: number }) => {
      const distanceInKm = Math.round(result.distance / 1000);
      if (distanceInKm > 0) {
        setDistance(distanceInKm);
      }
    };
  
    const getFilteredVehicles = () => {
      const passengers = reservationData?.passengers || 1;
      const baggage = reservationData?.baggage || 1;
      return vehicles.filter((v: any) => v.capacity >= passengers && v.baggage >= baggage);
    };
  
    const filteredVehicles = getFilteredVehicles();
  
    const getPrice = (vehicle: any) => {
      if (!vehicle || !distance) return 0;
      return vehicle.pricePerKm * distance;
    };
  
    const getTotalPrice = () => {
      const vehicle = vehicles.find((v: any) => v.id === selectedVehicle);
      if (!vehicle) return 0;
      
      const basePrice = getPrice(vehicle);
      const servicesPrice = selectedServices.reduce((total, serviceId) => {
        const service = services.find((s: any) => s.id === serviceId);
        return total + (service ? service.price : 0);
      }, 0);
      
      return basePrice + servicesPrice;
    };
  
    const handleServiceToggle = (serviceId: string) => {
      setSelectedServices(prev => 
        prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
      );
    };
  
    const handleNext = () => {
      const vehicle = vehicles.find((v: any) => v.id === selectedVehicle);
      if (!vehicle) {
        toast.error("Lütfen bir araç seçin.");
        return;
      }
      onNext({ 
          vehicle, 
          selectedServices, 
          basePrice: getPrice(vehicle),
          servicesPrice: selectedServices.reduce((total, serviceId) => {
              const service = services.find((s: any) => s.id === serviceId);
              return total + (service ? service.price : 0);
          }, 0),
          totalPrice: getTotalPrice(), 
          distance 
      });
    };
  
    return (
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Araç & Fiyat Seçimi</h2>
          <p className="text-white/70 text-lg">
            Size uygun lüks aracı seçin (Mesafe: {distance > 0 ? `${distance} km` : 'Hesaplanıyor...'}{reservationData?.estimatedDuration ? `, ~${reservationData.estimatedDuration}` : ''})
          </p>
        </div>
        
        <GoogleMapsErrorBoundary>
          <HybridRouteDisplay 
            origin={reservationData.from} 
            destination={reservationData.to} 
            originPlace={reservationData.direction === 'hotel-to-airport' ? reservationData.hotelPlace : undefined}
            destinationPlace={reservationData.direction === 'airport-to-hotel' ? reservationData.hotelPlace : undefined}
            onRouteCalculated={handleRouteCalculated} 
          />
        </GoogleMapsErrorBoundary>
  
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2"><Car className="h-6 w-6" /><span>Premium Araç Seçimi</span></h3>
            <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/50 rounded-xl px-4 py-2"><span className="text-blue-200 text-sm">{reservationData?.passengers} yolcu, {reservationData?.baggage} bagaj için uygun araçlar</span></div>
          </div>
          {loadingVehicles ? (<div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div><span className="ml-3 text-white">Araçlar yükleniyor...</span></div>) : filteredVehicles.length === 0 ? (<div className="text-center py-12"><Car className="h-12 w-12 text-white/60 mx-auto mb-4" /><p className="text-white/70 mb-2">{reservationData?.passengers} yolcu ve {reservationData?.baggage} bagaj için uygun araç bulunmamaktadır.</p><p className="text-white/60 text-sm">Farklı yolcu/bagaj sayısı için önceki adıma dönerek tekrar deneyin.</p></div>) : (<>
            {vehicles.length > filteredVehicles.length && (<div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-4"><div className="flex items-center space-x-2"><AlertCircle className="h-5 w-5 text-yellow-400" /><span className="text-yellow-200 text-sm">{vehicles.length - filteredVehicles.length} araç kapasitesi nedeniyle filtrelendi. Toplam {filteredVehicles.length} uygun araç gösteriliyor.</span></div></div>)}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle: any) => (
                <motion.div key={`vehicle-${vehicle.id}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedVehicle(vehicle.id)} className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl p-6 backdrop-blur-md ${selectedVehicle === vehicle.id ? 'border-blue-500 bg-blue-500/20 shadow-2xl' : 'border-white/30 bg-white/10 hover:border-white/50'}`}>
                  <div className="relative mb-4 overflow-hidden rounded-xl"><img src={vehicle.image} alt={vehicle.name} className="w-full h-40 object-cover transition-transform duration-300 hover:scale-110" /><div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full px-3 py-1"><div className="flex items-center space-x-1"><Star className="h-4 w-4 text-yellow-400 fill-current" /><span className="text-white text-sm font-medium">{vehicle.rating}</span></div></div></div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">{vehicle.name}</h4>
                      <div className="flex items-center justify-between text-sm text-white/70 mt-2"><div className="flex items-center space-x-1"><Users className="h-4 w-4" /><span>{vehicle.capacity} kişi</span></div><div className="flex items-center space-x-1"><Luggage className="h-4 w-4" /><span>{vehicle.baggage} bavul</span></div></div>
                    </div>
                    <div className="space-y-2">{vehicle.features.map((feature: string, index: number) => (<div key={index} className="flex items-center space-x-2 text-sm text-white/80"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div><span>{feature}</span></div>))}</div>
                    <div className="text-center pt-4 border-t border-white/20"><div className={`bg-gradient-to-r ${vehicle.gradient} text-white px-4 py-2 rounded-xl`}><span className="text-lg font-bold">Premium Paket</span><p className="text-xs opacity-90">Konfor & Güvenlik</p></div></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>)}
        </div>
        
        {selectedVehicle && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2"><Sparkles className="h-6 w-6" /><span>Ek Premium Hizmetler</span></h3>
            {loadingServices ? (<div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div><span className="ml-3 text-white">Hizmetler yükleniyor...</span></div>) : services.length === 0 ? (<div className="text-center py-8"><Sparkles className="h-8 w-8 text-white/60 mx-auto mb-3" /><p className="text-white/70">Şu anda ek hizmet bulunmamaktadır.</p></div>) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service: any) => (
                  <motion.div key={`service-${service.id}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleServiceToggle(service.id)} className={`cursor-pointer transition-all duration-300 border-2 rounded-xl p-4 backdrop-blur-md ${selectedServices.includes(service.id) ? 'border-green-500 bg-green-500/20' : 'border-white/30 bg-white/10 hover:border-white/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3"><div className={`p-2 rounded-lg bg-gradient-to-r ${service.gradient}`}><service.icon className="h-5 w-5 text-white" /></div><div className="flex-1"><h4 className="font-semibold text-white">{service.name}</h4><p className="text-sm text-white/70">{service.description}</p></div></div>
                      <div className="text-right"><span className="font-bold text-green-400 text-lg">₺{service.price}</span>{selectedServices.includes(service.id) && (<CheckCircle className="h-5 w-5 text-green-400 ml-2 inline" />)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        {selectedVehicle && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md border-2 border-blue-500/50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2"><CreditCard className="h-6 w-6" /><span>Fiyat Özeti</span></h3>
            <div className="space-y-3">
              <div className="flex justify-between text-white"><span>Araç kirası ({distance} km)</span><span className="font-semibold">₺{getPrice(vehicles.find((v: any) => v.id === selectedVehicle))}</span></div>
              {selectedServices.map(serviceId => { const service = services.find((s: any) => s.id === serviceId); return service ? (<div key={serviceId} className="flex justify-between text-white/80"><span>{service.name}</span><span className="font-semibold">₺{service.price}</span></div>) : null; })}
              <div className="border-t border-white/30 pt-3 flex justify-between font-bold text-xl"><span className="text-white">Toplam</span><span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">₺{getTotalPrice()}</span></div>
            </div>
          </motion.div>
        )}
        <div className="flex justify-between pt-4">
          <button onClick={onBack} disabled={disabled} className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"><ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /><span>Geri Dön</span></button>
          <button onClick={handleNext} disabled={!selectedVehicle || disabled} className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2">
            <span>Devam Et</span><ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </motion.div>
    );
}

// #####################################################################
// ### 3. ADIM: MÜŞTERİ BİLGİLERİ BİLEŞENİ                        ###
// #####################################################################
function CustomerInfoStep({ onNext, onBack, disabled = false }: any) {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', flightNumber: '', specialRequests: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
  
    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      if (!formData.firstName.trim()) newErrors.firstName = 'Ad gerekli';
      if (!formData.lastName.trim()) newErrors.lastName = 'Soyad gerekli';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Geçerli bir e-posta adresi girin';
      if (!formData.phone.trim()) newErrors.phone = 'Telefon numarası gerekli';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) onNext(formData);
    };
  
    return (
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Kişisel Bilgiler ve Uçuş Detayları</h2>
          <p className="text-white/70 text-lg">Rezervasyon için gerekli bilgilerinizi girin</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-white">Ad</label>
              <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-white/30 focus:border-blue-500 focus:ring-blue-500/50'}`} required />
              {errors.firstName && <p className="text-sm text-red-400">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-white">Soyad</label>
              <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-white/30 focus:border-purple-500 focus:ring-purple-500/50'}`} required />
              {errors.lastName && <p className="text-sm text-red-400">{errors.lastName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-white">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-white/30 focus:border-green-500 focus:ring-green-500/50'}`} required />
              </div>
              {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-white">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+90 532 123 4567" className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-white/30 focus:border-yellow-500 focus:ring-yellow-500/50'}`} required />
              </div>
              {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Uçuş Numarası</label>
            <div className="relative">
              <Plane className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input type="text" value={formData.flightNumber} onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })} placeholder="Örn: TK1234, PC2152" className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50" />
            </div>
            <div className="text-sm text-white/60 bg-white/5 rounded-lg p-3"><p>💡 <strong>İpucu:</strong> Uçuş numaranızı yazarsanız şoförünüz uçuş durumunuzu takip edebilir.</p></div>
          </div>
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Özel İstekler (Opsiyonel)</label>
            <textarea value={formData.specialRequests} onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })} rows={4} className="w-full px-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 resize-none" placeholder="Özel istekleriniz..." />
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500/50 rounded-2xl p-6">
            <div className="flex items-center space-x-4 mb-3">
              <div className="bg-green-500 p-3 rounded-xl"><Users className="h-6 w-6 text-white" /></div>
              <div>
                <h3 className="text-xl font-bold text-white">Otomatik Üyelik</h3>
                <p className="text-green-200">Girdiğiniz bilgilerle otomatik olarak üye olacaksınız</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-200">
              <div className="flex items-center space-x-2"><Check className="h-4 w-4" /><span>Daha hızlı işlem</span></div>
              <div className="flex items-center space-x-2"><Check className="h-4 w-4" /><span>Özel indirimler</span></div>
              <div className="flex items-center space-x-2"><Check className="h-4 w-4" /><span>Rezervasyon geçmişi</span></div>
              <div className="flex items-center space-x-2"><Check className="h-4 w-4" /><span>Sadakat puanları</span></div>
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button type="button" onClick={onBack} disabled={disabled} className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-medium flex items-center space-x-2 disabled:opacity-50"><ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /><span>Geri Dön</span></button>
            <button type="submit" disabled={disabled} className="group relative px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 disabled:opacity-50"><CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform" /><span>Rezervasyonu Tamamla</span><div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div></button>
          </div>
        </form>
      </motion.div>
    );
}

// #####################################################################
// ### 4. ADIM: ÖDEME BİLEŞENİ                                     ###
// #####################################################################
function PaymentStep({ reservationData, onNext, onBack, disabled = false }: any) {
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  
    const handleCompleteReservation = () => {
      if (disabled) return;
      onNext({ paymentMethod });
    };
  
    return (
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ödeme ve Onay</h2>
          <p className="text-white/70 text-lg">
            Toplam Tutar: 
            <span className="font-bold text-yellow-400 ml-2">₺{reservationData?.totalPrice || 0}</span>
          </p>
        </div>
  
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-white">Ödeme Yöntemi</label>
          <div
            onClick={() => setPaymentMethod('cash_on_delivery')}
            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cash_on_delivery' ? 'border-green-500 bg-green-500/20' : 'border-white/30 bg-white/10 hover:border-white/50'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500 p-3 rounded-xl"><CreditCard className="h-6 w-6 text-white" /></div>
                <div>
                  <h4 className="font-bold text-white text-lg">Araçta Ödeme</h4>
                  <p className="text-white/70">Nakit veya kredi kartı ile şoföre ödeyin.</p>
                </div>
              </div>
              {paymentMethod === 'cash_on_delivery' && <CheckCircle className="h-6 w-6 text-green-400" />}
            </div>
          </div>
        </div>
  
        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} disabled={disabled} className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-medium flex items-center space-x-2 disabled:opacity-50">
            <ArrowLeft className="h-5 w-5" />
            <span>Geri</span>
          </button>
          <button onClick={handleCompleteReservation} disabled={disabled} className="group relative px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50">
            <CheckCircle className="h-5 w-5" />
            <span>Rezervasyonu Onayla</span>
          </button>
        </div>
      </motion.div>
    );
}

// #####################################################################
// ### 5. ADIM: ONAY BİLEŞENİ                                      ###
// #####################################################################
function ConfirmationStep({ reservationData, qrCode }: any) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6 shadow-2xl"><CheckCircle className="h-10 w-10 text-white" /></motion.div>
                <h2 className="text-4xl font-bold text-white mb-3"><span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Rezervasyonunuz Tamamlandı!</span></h2>
                <p className="text-white/70 text-lg">Rezervasyon bilgileriniz e-posta adresinize gönderildi.</p>
            </div>
            {/* Diğer onay detayları... */}
        </motion.div>
    );
}

// #####################################################################
// ### ANA REZERVASYON SAYFASI (TÜM ADIMLARI YÖNETİR)                ###
// #####################################################################
export default function ReservationPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [reservationData, setReservationData] = useState<any>({});
    const [qrCode, setQrCode] = useState('');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);
    const [loadingServices, setLoadingServices] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const isMountedRef = useRef(true);
  
    const stepNames = ['Rota', 'Araç', 'Bilgiler', 'Ödeme', 'Onay'];
  
    const safeSetCurrentStep = useCallback(async (newStep: number) => {
      if (isTransitioning || !isMountedRef.current) return;
      
      setIsTransitioning(true);
      await GoogleMapsService.safeStepTransitionCleanup();
      setCurrentStep(newStep);
      
      setTimeout(() => {
        if (isMountedRef.current) setIsTransitioning(false);
      }, 400); 
    }, [isTransitioning]);
  
    useEffect(() => {
      isMountedRef.current = true;
      loadInitialData();
      return () => { isMountedRef.current = false; };
    }, []);
  
    const loadInitialData = async () => {
      setLoadingVehicles(true);
      setLoadingServices(true);
      try {
        const [vehiclesData, servicesData] = await Promise.all([
          vehicleService.getAll(),
          serviceService.getProcessedServices()
        ]);

        if(isMountedRef.current) {
            setVehicles(vehiclesData.filter((v:any) => v.isActive !== false));
            setServices(servicesData);
        }
      } catch (error) {
        toast.error("Veriler yüklenemedi.");
      } finally {
        if(isMountedRef.current) {
            setLoadingVehicles(false);
            setLoadingServices(false);
        }
      }
    };
  
    const handleRouteNext = (data: any) => {
      setReservationData(prev => ({ ...prev, ...data }));
      safeSetCurrentStep(2);
    };
  
    const handleVehicleNext = (data: any) => {
      setReservationData(prev => ({ ...prev, ...data }));
      safeSetCurrentStep(3);
    };
  
    const handleCustomerNext = (data: any) => {
      setReservationData(prev => ({ ...prev, ...data }));
      safeSetCurrentStep(4);
    };
  
    // ### BURASI SON HATAYI DÜZELTMEK İÇİN GÜNCELLENDİ ###
    const handlePaymentNext = async (paymentData: any) => {
        setIsTransitioning(true);
        const finalData = { ...reservationData, ...paymentData, status: 'pending' as const, createdAt: new Date().toISOString() };
        
        try {
            // Önce veritabanına kaydet
            const reservationId = await realTimeReservationService.create(finalData);
            finalData.id = reservationId;

            // Sonra QR kodu oluştur
            const qrCodeUrl = await EmailService.generateQRCode(finalData);
            
            // En son, QR kodu ile birlikte e-postayı gönder (2 argümanlı doğru çağrı)
            await EmailService.sendConfirmationEmail(finalData, qrCodeUrl);
            
            setQrCode(qrCodeUrl);
            setReservationData(finalData);
            toast.success('🎉 Rezervasyonunuz başarıyla oluşturuldu!');
            safeSetCurrentStep(5);

        } catch (error) {
            console.error('Rezervasyon veya e-posta hatası:', error);
            toast.error('❌ Rezervasyon oluşturulurken bir hata oluştu.');
            setIsTransitioning(false);
        }
    };
  
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
            <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
          </div>
          <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">SBS TRAVEL</h1>
                    <p className="text-xs text-blue-200">Premium Transfer</p>
                  </div>
                </Link>
                <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Ana Sayfa</span>
                </Link>
              </div>
            </div>
          </header>
          <div className="relative z-10 py-12">
            <div className="text-center mb-8">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-4">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-white/90 text-sm">Premium Rezervasyon</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">Transfer Rezervasyonu</span>
                </h1>
                <p className="text-white/70 text-lg">4 kolay adımda lüks yolculuğunuzu planlayın</p>
              </motion.div>
            </div>
            <div className="max-w-5xl mx-auto p-6">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    {Array.from({ length: 5 }, (_, index) => (
                      <React.Fragment key={index}>
                        <div className="flex flex-col items-center">
                          <motion.div initial={{ scale: 0.8 }} animate={{ scale: currentStep >= index + 1 ? 1 : 0.8 }} className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm relative ${currentStep >= index + 1 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-white/20 text-white/60'}`}>
                            {currentStep > index + 1 ? (<CheckCircle className="h-6 w-6" />) : (index + 1)}
                            {currentStep >= index + 1 && (<div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 animate-pulse"></div>)}
                          </motion.div>
                          <span className={`mt-3 text-sm font-medium ${currentStep >= index + 1 ? 'text-white' : 'text-white/60'}`}>{stepNames[index]}</span>
                        </div>
                        {index < 4 && (
                          <div className="flex-1 h-1 mx-4 bg-white/20 rounded-full overflow-hidden">
                            <motion.div initial={{ width: '0%' }} animate={{ width: currentStep > index + 1 ? '100%' : '0%' }} className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" transition={{ duration: 0.5 }} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                
                <GoogleMapsErrorBoundary>
                  <AnimatePresence mode="wait" initial={false}>
                    {currentStep === 1 && <RouteStep key="route" onNext={handleRouteNext} disabled={isTransitioning} />}
                    {currentStep === 2 && <VehicleStep key="vehicle" vehicles={vehicles} services={services} reservationData={reservationData} loadingVehicles={loadingVehicles} loadingServices={loadingServices} onNext={handleVehicleNext} onBack={() => safeSetCurrentStep(1)} disabled={isTransitioning} />}
                    {currentStep === 3 && <CustomerInfoStep key="customer" onNext={handleCustomerNext} onBack={() => safeSetCurrentStep(2)} disabled={isTransitioning} />}
                    {currentStep === 4 && <PaymentStep key="payment" reservationData={reservationData} onNext={handlePaymentNext} onBack={() => safeSetCurrentStep(3)} disabled={isTransitioning} />}
                    {currentStep === 5 && <ConfirmationStep key="confirmation" reservationData={reservationData} qrCode={qrCode} />}
                  </AnimatePresence>
                </GoogleMapsErrorBoundary>
                
                {isTransitioning && currentStep !== 5 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span className="text-white font-medium">Adım geçişi...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
}
