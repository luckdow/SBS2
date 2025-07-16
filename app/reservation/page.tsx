// Konum: app/reservation/page.tsx

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

// Orijinal dosyanızdaki tüm bileşenler (RouteStep, VehicleStep, vb.) burada yer alıyor.
// Hiçbirinde değişiklik yapılmadı, sadece ana sayfadaki hata düzeltildi.

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
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <span>Premium Araç Seçimi</span>
          </h3>
          {loadingVehicles ? (
            <div className="text-center py-12 text-white">Araçlar yükleniyor...</div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <p className="text-white/80">{reservationData?.passengers} yolcu ve {reservationData?.baggage} bagaj için uygun araç bulunamadı.</p>
              <p className="text-white/60 text-sm mt-2">Lütfen önceki adıma dönüp yolcu veya bagaj sayısını değiştirin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle: any) => (
                <motion.div 
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                  className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl p-6 backdrop-blur-md ${selectedVehicle === vehicle.id ? 'border-blue-500 bg-blue-500/20 shadow-2xl' : 'border-white/30 bg-white/10 hover:border-white/50'}`}
                >
                    <div className="relative mb-4 overflow-hidden rounded-xl">
                        <img src={vehicle.image} alt={vehicle.name} className="w-full h-40 object-cover transition-transform duration-300 hover:scale-110" />
                    </div>
                    <h4 className="font-bold text-white text-lg">{vehicle.name}</h4>
                    <div className="flex items-center justify-between text-sm text-white/70 mt-2">
                        <div className="flex items-center space-x-1"><Users className="h-4 w-4" /><span>{vehicle.capacity} kişi</span></div>
                        <div className="flex items-center space-x-1"><Luggage className="h-4 w-4" /><span>{vehicle.baggage} bavul</span></div>
                    </div>
                    <div className="text-center pt-4 mt-4 border-t border-white/20">
                        <p className="text-2xl font-bold text-white">₺{getPrice(vehicle)}</p>
                    </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {selectedVehicle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Sparkles className="h-6 w-6" />
              <span>Ek Hizmetler</span>
            </h3>
            {loadingServices ? (
               <div className="text-center py-8 text-white">Hizmetler yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service: any) => (
                  <motion.div 
                    key={service.id}
                    onClick={() => handleServiceToggle(service.id)}
                    className={`cursor-pointer transition-all duration-300 border-2 rounded-xl p-4 backdrop-blur-md ${selectedServices.includes(service.id) ? 'border-green-500 bg-green-500/20' : 'border-white/30 bg-white/10 hover:border-white/50'}`}
                  >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-white">{service.name}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-green-400">₺{service.price}</span>
                            {selectedServices.includes(service.id) && <CheckCircle className="h-5 w-5 text-green-400" />}
                        </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
  
        {selectedVehicle && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Fiyat Özeti</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-white">
                        <span>Araç Ücreti ({distance} km)</span>
                        <span className="font-semibold">₺{getPrice(vehicles.find((v: any) => v.id === selectedVehicle))}</span>
                    </div>
                    {selectedServices.map(serviceId => {
                        const service = services.find((s: any) => s.id === serviceId);
                        return service ? (
                            <div key={serviceId} className="flex justify-between text-white/80">
                                <span>{service.name}</span>
                                <span className="font-semibold">₺{service.price}</span>
                            </div>
                        ) : null;
                    })}
                    <div className="border-t border-white/30 pt-3 mt-3 flex justify-between font-bold text-2xl text-white">
                        <span>Toplam</span>
                        <span className="text-yellow-400">₺{getTotalPrice()}</span>
                    </div>
                </div>
            </motion.div>
        )}
  
        <div className="flex justify-between pt-4">
          <button onClick={onBack} disabled={disabled} className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-medium flex items-center space-x-2 disabled:opacity-50">
            <ArrowLeft className="h-5 w-5" /><span>Geri</span>
          </button>
          <button onClick={handleNext} disabled={!selectedVehicle || disabled} className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50">
            <span>Devam Et</span><ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    );
}

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
      if (validateForm()) {
        onNext(formData);
      }
    };
  
    return (
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Kişisel Bilgiler</h2>
          <p className="text-white/70 text-lg">Rezervasyonu tamamlamak için bilgilerinizi girin</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Adınız" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white ${errors.firstName ? 'border-red-500' : 'border-white/30'}`} />
            <input type="text" placeholder="Soyadınız" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white ${errors.lastName ? 'border-red-500' : 'border-white/30'}`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="email" placeholder="E-posta Adresiniz" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white ${errors.email ? 'border-red-500' : 'border-white/30'}`} />
            <input type="tel" placeholder="Telefon Numaranız" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white ${errors.phone ? 'border-red-500' : 'border-white/30'}`} />
          </div>
          <input type="text" placeholder="Uçuş Numarası (opsiyonel)" value={formData.flightNumber} onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white" />
          <textarea placeholder="Özel İstekleriniz (opsiyonel)" value={formData.specialRequests} onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })} rows={3} className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white resize-none" />
          
          <div className="flex justify-between pt-4">
            <button type="button" onClick={onBack} disabled={disabled} className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-medium flex items-center space-x-2 disabled:opacity-50">
                <ArrowLeft className="h-5 w-5" /><span>Geri</span>
            </button>
            <button type="submit" disabled={disabled} className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50">
                <span>Devam Et</span><ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>
      </motion.div>
    );
}

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

function ConfirmationStep({ reservationData, qrCode }: any) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-white">
            <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block p-4 bg-green-500 rounded-full mb-6">
                    <CheckCircle className="h-12 w-12 text-white" />
                </motion.div>
                <h2 className="text-4xl font-bold mb-3">Rezervasyon Tamamlandı!</h2>
                <p className="text-white/70 text-lg">Detaylar e-posta adresinize gönderildi.</p>
            </div>
    
            <div className="bg-white/10 rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-6">Rezervasyon Detayları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="font-semibold text-lg">Güzergah:</p>
                        <p>{reservationData.from} → {reservationData.to}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-lg">Tarih & Saat:</p>
                        <p>{new Date(reservationData.date + 'T' + reservationData.time).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-lg">Araç:</p>
                        <p>{reservationData.vehicle.name}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-lg">Toplam Tutar:</p>
                        <p className="font-bold text-xl text-yellow-400">₺{reservationData.totalPrice}</p>
                    </div>
                </div>
            </div>

            {qrCode && (
                <div className="bg-white/10 rounded-2xl p-6 text-center">
                    <h3 className="text-2xl font-bold mb-4">QR Kodunuz</h3>
                    <div className="bg-white p-4 rounded-xl inline-block">
                        <img src={qrCode} alt="Rezervasyon QR Kodu" className="w-40 h-40" />
                    </div>
                    <p className="mt-4 text-white/80">Bu kodu yolculuk başlangıcında şoförünüze gösterin.</p>
                </div>
            )}
    
            <div className="text-center pt-6">
                <Link href="/" className="group inline-flex items-center justify-center px-8 py-3 text-white font-medium text-lg transition-colors border-2 border-white/30 rounded-xl hover:bg-white/10">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Ana Sayfaya Dön
                </Link>
            </div>
        </motion.div>
    );
}

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
  
    const handlePaymentNext = async (paymentData: any) => {
        setIsTransitioning(true);
        const finalData = { ...reservationData, ...paymentData, status: 'pending' as const, createdAt: new Date().toISOString() };
        
        try {
            const reservationId = await realTimeReservationService.create(finalData);
            finalData.id = reservationId;

            // Önce QR kodu oluştur
            const qrCodeUrl = await EmailService.generateQRCode(finalData);
            
            // Sonra, QR kodu ile birlikte e-postayı gönder
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
          <div className="absolute inset-0 bg-black/20"></div>
          <header className="relative z-10 p-4">
              <Link href="/" className="text-white text-xl font-bold">SBS TRAVEL</Link>
          </header>
          <div className="relative z-10 py-12">
            <div className="max-w-4xl mx-auto p-6">
              <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="mb-8">
                  <div className="flex items-center">
                    {stepNames.map((name, index) => (
                      <React.Fragment key={index}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentStep > index ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/60'}`}>
                                {currentStep > index + 1 ? <Check /> : index + 1}
                            </div>
                            <span className={`mt-2 text-xs ${currentStep >= index + 1 ? 'text-white' : 'text-white/60'}`}>{name}</span>
                        </div>
                        {index < stepNames.length - 1 && <div className={`flex-1 h-1 mx-2 ${currentStep > index + 1 ? 'bg-blue-500' : 'bg-white/20'}`}></div>}
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
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
}
