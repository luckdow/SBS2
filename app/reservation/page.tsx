// Konum: app/reservation/page.tsx

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Users, Luggage, Plane, MapPin, Star, Check, CheckCircle,
  Mail, Phone, ArrowRight, ArrowLeft, Sparkles, Car,
  CreditCard, AlertCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
// Servislerinizi ve bileşenlerinizi import ettiğinizden emin olun
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
// ### 1. ADIM: ROTA SEÇİMİ BİLEŞENİ                                  ###
// #####################################################################
function RouteStep({ onNext, disabled = false, initialData }: { onNext: (data: any) => void; disabled?: boolean; initialData?: any }) {
  const [formData, setFormData] = useState({
    direction: initialData?.direction || 'airport-to-hotel',
    hotelLocation: initialData?.hotelLocation || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    passengers: initialData?.passengers || 1,
    baggage: initialData?.baggage || 0,
  });

  // Modern `Place` nesnesi kullanılıyor
  const [hotelPlace, setHotelPlace] = useState<google.maps.places.Place | undefined>(initialData?.hotelPlace);
  const [routeInfo, setRouteInfo] = useState<any>(initialData?.routeInfo);

  const getFromLocation = () => formData.direction === 'airport-to-hotel' ? 'Antalya Havalimanı (AYT)' : formData.hotelLocation;
  const getToLocation = () => formData.direction === 'airport-to-hotel' ? formData.hotelLocation : 'Antalya Havalimanı (AYT)';
  
  const handleHotelLocationChange = (value: string, place?: google.maps.places.Place) => {
    setFormData(prev => ({ ...prev, hotelLocation: value }));
    if (place?.id) {
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
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  const validateDateTime = () => {
    if (!formData.date || !formData.time) {
      toast.error("Lütfen geçerli bir tarih ve saat seçin.");
      return false;
    }
    const reservationDateTime = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    if (reservationDateTime < fourHoursFromNow) {
      toast.error("Rezervasyon, en az 4 saat sonrası için yapılmalıdır.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelPlace?.id || !routeInfo) {
      toast.error("Lütfen listeden geçerli bir konum seçin ve rotanın hesaplanmasını bekleyin.");
      return;
    }
    if (!validateDateTime()) return;
    
    const submitData = { 
      ...formData, 
      from: getFromLocation(), 
      to: getToLocation(), 
      distance: Math.round(routeInfo.distance / 1000),
      estimatedDuration: routeInfo.durationText,
      hotelPlace: hotelPlace,
      routeInfo: routeInfo,
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
            <label className="relative group cursor-pointer"><input type="radio" name="direction" value="airport-to-hotel" checked={formData.direction === 'airport-to-hotel'} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} className="sr-only" /><div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${formData.direction === 'airport-to-hotel' ? 'border-blue-500 bg-blue-500/20' : 'border-white/30 bg-white/10 hover:border-white/50'}`}><div className="flex items-center space-x-4"><div className={`p-3 rounded-xl ${formData.direction === 'airport-to-hotel' ? 'bg-blue-500' : 'bg-white/20'}`}><Plane className="h-6 w-6 text-white" /></div><div><span className="font-semibold text-white text-lg">Havalimanı → Otel</span><p className="text-white/70 text-sm">Karşılama hizmeti ile</p></div></div></div></label>
            <label className="relative group cursor-pointer"><input type="radio" name="direction" value="hotel-to-airport" checked={formData.direction === 'hotel-to-airport'} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} className="sr-only" /><div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${formData.direction === 'hotel-to-airport' ? 'border-purple-500 bg-purple-500/20' : 'border-white/30 bg-white/10 hover:border-white/50'}`}><div className="flex items-center space-x-4"><div className={`p-3 rounded-xl ${formData.direction === 'hotel-to-airport' ? 'bg-purple-500' : 'bg-white/20'}`}><Plane className="h-6 w-6 text-white transform rotate-180" /></div><div><span className="font-semibold text-white text-lg">Otel → Havalimanı</span><p className="text-white/70 text-sm">Zamanında ulaşım</p></div></div></div></label>
          </div>
        </div>
        <div className="space-y-4"><label className="block text-lg font-semibold text-white">{formData.direction === 'airport-to-hotel' ? 'Otel Adı / Konumu' : 'Kalkış Yeri (Otel)'}</label><GoogleMapsErrorBoundary><HybridAddressInput value={formData.hotelLocation} onChange={handleHotelLocationChange} placeholder={formData.direction === 'airport-to-hotel' ? 'Otel adını yazın...' : 'Kalkış yerini yazın...'} /></GoogleMapsErrorBoundary></div>
        <AnimatePresence>{hotelPlace && (<motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '2rem' }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden"><div className="space-y-4"><GoogleMapsErrorBoundary><HybridRouteDisplay origin={getFromLocation()} destination={getToLocation()} originPlace={formData.direction === 'hotel-to-airport' ? hotelPlace : undefined} destinationPlace={formData.direction === 'airport-to-hotel' ? hotelPlace : undefined} onRouteCalculated={handleRouteCalculated} /></GoogleMapsErrorBoundary>{routeInfo && (<div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 text-center"><p className="text-green-200 text-sm">✅ Rota hesaplandı: Yaklaşık {routeInfo.distanceText} / {routeInfo.durationText}</p></div>)}</div></motion.div>)}</AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><label className="block text-lg font-semibold text-white">Tarih</label><div className="relative"><Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" /><input type="date" value={formData.date} min={getMinDate()} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" required /></div></div><div className="space-y-2"><label className="block text-lg font-semibold text-white">Saat</label><div className="relative"><Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" /><input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50" required /></div></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><label className="block text-lg font-semibold text-white">Yolcu Sayısı</label><div className="relative"><Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" /><input type="number" min="1" max="16" value={formData.passengers} onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) || 1 })} className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/50" required /></div></div><div className="space-y-2"><label className="block text-lg font-semibold text-white">Bagaj Sayısı</label><div className="relative"><Luggage className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" /><input type="number" min="0" max="20" value={formData.baggage} onChange={(e) => setFormData({ ...formData, baggage: parseInt(e.target.value) || 0 })} className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50" required /></div></div></div>
        <div className="flex justify-end pt-4"><button type="submit" disabled={!hotelPlace || !routeInfo || disabled} className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"><span>Devam Et</span><ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></button></div>
      </form>
    </motion.div>
  );
}

// #####################################################################
// ### 2. ADIM: ARAÇ & FİYAT SEÇİMİ BİLEŞENİ                           ###
// #####################################################################
function VehicleStep({ vehicles, services, reservationData, loadingVehicles, loadingServices, onNext, onBack, disabled = false }: any) {
    const [selectedVehicleId, setSelectedVehicleId] = useState(reservationData?.vehicle?.id);
    const [selectedServices, setSelectedServices] = useState<string[]>(reservationData?.selectedServices || []);
    const distance = reservationData?.distance || 0;
  
    const filteredVehicles = vehicles.filter((v: any) => v.capacity >= (reservationData?.passengers || 1) && v.baggage >= (reservationData?.baggage || 0));

    const getPrice = (vehicle: any) => {
      if (!vehicle || !distance) return 0;
      return vehicle.pricePerKm * distance;
    };
  
    const getTotalPrice = () => {
      const vehicle = vehicles.find((v: any) => v.id === selectedVehicleId);
      if (!vehicle) return 0;
      const basePrice = getPrice(vehicle);
      const servicesPrice = selectedServices.reduce((total, serviceId) => {
        const service = services.find((s: any) => s.id === serviceId);
        return total + (service ? service.price : 0);
      }, 0);
      return basePrice + servicesPrice;
    };
  
    const handleServiceToggle = (serviceId: string) => { setSelectedServices(prev => prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]); };
  
    const handleNext = () => {
      const vehicle = vehicles.find((v: any) => v.id === selectedVehicleId);
      if (!vehicle) { toast.error("Lütfen bir araç seçin."); return; }
      onNext({ vehicle: vehicle, selectedServices: selectedServices, totalPrice: getTotalPrice() });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
            <div className="text-center"><h2 className="text-3xl font-bold text-white mb-3">Araç & Fiyat Seçimi</h2><p className="text-white/70 text-lg">Size uygun lüks aracı seçin (Mesafe: {distance > 0 ? `${distance} km` : 'Hesaplanıyor...'}{reservationData?.estimatedDuration ? `, ~${reservationData.estimatedDuration}` : ''})</p></div>
            <div className="space-y-6"><h3 className="text-xl font-semibold text-white flex items-center space-x-2"><Car className="h-6 w-6" /><span>Premium Araç Seçimi</span></h3>
                {loadingVehicles ? (<div className="flex justify-center items-center py-12"><Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" /><span className="ml-3 text-white">Araçlar yükleniyor...</span></div>) : filteredVehicles.length === 0 ? (<div className="text-center py-12"><p className="text-white/70 mb-2">{reservationData?.passengers} yolcu ve {reservationData?.baggage} bagaj için uygun araç bulunmamaktadır.</p></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredVehicles.map((vehicle: any) => (<motion.div key={`vehicle-${vehicle.id}`} whileHover={{ y: -5 }} onClick={() => setSelectedVehicleId(vehicle.id)} className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl p-5 backdrop-blur-md ${selectedVehicleId === vehicle.id ? 'border-blue-500 bg-blue-500/20 shadow-2xl' : 'border-white/30 bg-white/10 hover:border-white/50'}`}><img src={vehicle.image} alt={vehicle.name} className="w-full h-40 object-cover rounded-xl mb-4" /><h4 className="font-bold text-white text-lg">{vehicle.name}</h4><div className="flex items-center justify-between text-sm text-white/70 mt-2"><div className="flex items-center space-x-1.5"><Users className="h-4 w-4" /><span>{vehicle.capacity} kişi</span></div><div className="flex items-center space-x-1.5"><Luggage className="h-4 w-4" /><span>{vehicle.baggage} bavul</span></div></div><div className="text-center mt-4 pt-4 border-t border-white/20"><span className="text-xl font-bold text-white">₺{getPrice(vehicle).toFixed(2)}</span></div></motion.div>))}</div>)}
            </div>
            {selectedVehicleId && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6"><h3 className="text-xl font-semibold text-white flex items-center space-x-2"><Sparkles className="h-6 w-6" /><span>Ek Premium Hizmetler</span></h3>{loadingServices ? (<div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-white" /></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{services.map((service: any) => (<div key={`service-${service.id}`} onClick={() => handleServiceToggle(service.id)} className={`cursor-pointer transition-all duration-300 border-2 rounded-xl p-4 flex items-center justify-between ${selectedServices.includes(service.id) ? 'border-green-500 bg-green-500/20' : 'border-white/30 bg-white/10 hover:border-white/50'}`}><div><h4 className="font-semibold text-white">{service.name}</h4><p className="text-sm text-white/70">{service.description}</p></div><div className="text-right"><span className="font-bold text-green-400">₺{service.price}</span>{selectedServices.includes(service.id) && (<CheckCircle className="h-5 w-5 text-green-400 ml-2 inline" />)}</div></div>))}</div>)}</motion.div>)}
            {selectedVehicleId && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/50 rounded-2xl p-6 mt-8"><h3 className="text-xl font-semibold text-white mb-4">Fiyat Özeti</h3><div className="space-y-2"><div className="flex justify-between text-white"><span>Araç kirası</span><span>₺{getPrice(vehicles.find((v:any) => v.id === selectedVehicleId)).toFixed(2)}</span></div>{selectedServices.map(serviceId => {const service = services.find((s:any) => s.id === serviceId); return service ? <div key={serviceId} className="flex justify-between text-white/80"><span>{service.name}</span><span>₺{service.price}</span></div> : null;})}<div className="border-t border-white/30 pt-3 mt-2 flex justify-between font-bold text-xl text-white"><span>Toplam</span><span>₺{getTotalPrice().toFixed(2)}</span></div></div></motion.div>)}
            <div className="flex justify-between pt-4"><button onClick={onBack} disabled={disabled} className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all font-medium flex items-center space-x-2 disabled:opacity-50"><ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /><span>Geri Dön</span></button><button onClick={handleNext} disabled={!selectedVehicleId || disabled} className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 flex items-center space-x-2"><span>Devam Et</span><ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></button></div>
        </motion.div>
    );
}

// #####################################################################
// ### 3. ADIM: MÜŞTERİ BİLGİLERİ BİLEŞENİ                            ###
// #####################################################################
function CustomerInfoStep({ onNext, onBack, disabled = false, initialData }: any) {
    const [formData, setFormData] = useState({ firstName: initialData?.firstName || '', lastName: initialData?.lastName || '', email: initialData?.email || '', phone: initialData?.phone || '', flightNumber: initialData?.flightNumber || '', specialRequests: initialData?.specialRequests || '' });
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
  
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (validateForm()) onNext(formData); };

    return (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
            <div className="text-center"><h2 className="text-3xl font-bold text-white mb-3">Kişisel Bilgiler</h2><p className="text-white/70 text-lg">Rezervasyon için gerekli bilgilerinizi girin</p></div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-lg font-semibold text-white mb-2">Ad</label><input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 ${errors.firstName ? 'border-red-500' : 'border-white/30 focus:border-blue-500'}`} required />{errors.firstName && <p className="text-sm text-red-400 mt-1">{errors.firstName}</p>}</div>
                    <div><label className="block text-lg font-semibold text-white mb-2">Soyad</label><input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 ${errors.lastName ? 'border-red-500' : 'border-white/30 focus:border-purple-500'}`} required />{errors.lastName && <p className="text-sm text-red-400 mt-1">{errors.lastName}</p>}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-lg font-semibold text-white mb-2">E-posta</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 ${errors.email ? 'border-red-500' : 'border-white/30 focus:border-green-500'}`} required />{errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}</div>
                    <div><label className="block text-lg font-semibold text-white mb-2">Telefon</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 ${errors.phone ? 'border-red-500' : 'border-white/30 focus:border-yellow-500'}`} required />{errors.phone && <p className="text-sm text-red-400 mt-1">{errors.phone}</p>}</div>
                </div>
                <div className="space-y-2"><label className="block text-lg font-semibold text-white">Uçuş Numarası (Opsiyonel)</label><input type="text" value={formData.flightNumber} onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })} placeholder="Örn: TK1234" className="w-full px-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white" /></div>
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={onBack} disabled={disabled} className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-medium flex items-center space-x-2 disabled:opacity-50"><ArrowLeft className="h-5 w-5" /><span>Geri Dön</span></button>
                    <button type="submit" disabled={disabled} className="group relative px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 disabled:opacity-50"><CheckCircle className="h-5 w-5" /><span>Devam Et</span></button>
                </div>
            </form>
        </motion.div>
    );
}

// #####################################################################
// ### 4. ADIM: ÖDEME BİLEŞENİ                                        ###
// #####################################################################
function PaymentStep({ reservationData, onNext, onBack, disabled = false }: any) {
    const handleCompleteReservation = () => { if (!disabled) onNext({ paymentMethod: 'cash_on_delivery' }); };
    return (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
            <div className="text-center"><h2 className="text-3xl font-bold text-white mb-3">Ödeme ve Onay</h2><p className="text-white/70 text-lg">Toplam Tutar: <span className="font-bold text-yellow-400 ml-2">₺{reservationData?.totalPrice?.toFixed(2) || 0}</span></p></div>
            <div className="p-6 border-2 rounded-2xl border-green-500 bg-green-500/20"><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><div className="bg-green-500 p-3 rounded-xl"><CreditCard className="h-6 w-6 text-white" /></div><div><h4 className="font-bold text-white text-lg">Araçta Ödeme</h4><p className="text-white/70">Nakit veya kredi kartı ile şoföre ödeyin.</p></div></div><CheckCircle className="h-6 w-6 text-green-400" /></div></div>
            <div className="flex justify-between pt-4">
                <button type="button" onClick={onBack} disabled={disabled} className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-medium flex items-center space-x-2 disabled:opacity-50"><ArrowLeft className="h-5 w-5" /><span>Geri Dön</span></button>
                <button onClick={handleCompleteReservation} disabled={disabled} className="group relative px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50"><CheckCircle className="h-5 w-5" /><span>Rezervasyonu Onayla</span></button>
            </div>
        </motion.div>
    );
}

// #####################################################################
// ### 5. ADIM: ONAY BİLEŞENİ                                         ###
// #####################################################################
function ConfirmationStep({ reservationData }: any) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="inline-block"><CheckCircle className="h-20 w-20 text-green-400 mx-auto" /></motion.div>
            <h2 className="text-4xl font-bold text-white">Rezervasyonunuz Tamamlandı!</h2>
            <p className="text-white/70 text-lg max-w-md mx-auto">Rezervasyon özetiniz aşağıdadır ve detaylı bilgi e-posta adresinize gönderilmiştir.</p>
            <div className="text-left bg-white/5 rounded-xl p-6 max-w-lg mx-auto border border-white/20 space-y-3">
                <h3 className="font-bold text-xl mb-2 text-white border-b border-white/20 pb-2">Özet</h3>
                <div className="flex justify-between"><span className="text-white/70">Nereden:</span> <span className="font-medium text-white text-right">{reservationData.from}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Nereye:</span> <span className="font-medium text-white text-right">{reservationData.to}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Tarih & Saat:</span> <span className="font-medium text-white text-right">{new Date(reservationData.date + 'T' + reservationData.time).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Araç:</span> <span className="font-medium text-white text-right">{reservationData.vehicle.name}</span></div>
                <div className="flex justify-between text-lg mt-4 pt-3 border-t border-white/20"><span className="text-white/70">Toplam Tutar:</span> <span className="font-bold text-yellow-400">₺{reservationData.totalPrice.toFixed(2)}</span></div>
            </div>
            <Link href="/" className="inline-block mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all">Ana Sayfaya Dön</Link>
        </motion.div>
    );
}


// #####################################################################
// ### ANA REZERVASYON SAYFASI (TÜM ADIMLARI YÖNETİR)                 ###
// #####################################################################
export default function ReservationPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [reservationData, setReservationData] = useState<any>({});
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState({ vehicles: true, services: true, transition: false });
  
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(prev => ({ ...prev, vehicles: true, services: true }));
            try {
                const [vehiclesData, servicesData] = await Promise.all([ vehicleService.getAll(), serviceService.getProcessedServices() ]);
                setVehicles(vehiclesData.filter((v: any) => v.isActive !== false));
                setServices(servicesData);
            } catch (error) { toast.error("Gerekli veriler yüklenirken bir hata oluştu."); } 
            finally { setLoading(prev => ({ ...prev, vehicles: false, services: false })); }
        };
        loadInitialData();
    }, []);
    
    const handleStepChange = async (newStep: number, data?: any) => {
        if (loading.transition) return;
        setLoading(prev => ({ ...prev, transition: true }));
        
        // Adım geçişlerinde harita elemanlarının temizlenmesi için güvenlik önlemi
        if (newStep !== currentStep) { await GoogleMapsService.safeStepTransitionCleanup(50); }
        
        if (data) { setReservationData(prev => ({ ...prev, ...data })); }

        setCurrentStep(newStep);
        setTimeout(() => setLoading(prev => ({ ...prev, transition: false })), 400);
    };

    const handleFinalSubmit = async (paymentData: any) => {
        setLoading(prev => ({ ...prev, transition: true }));
        const finalData = { ...reservationData, ...paymentData, status: 'pending', createdAt: new Date().toISOString() };
      
        try {
            const reservationId = await realTimeReservationService.create(finalData);
            finalData.id = reservationId;
            await EmailService.sendConfirmationEmail(finalData);
            toast.success('🎉 Rezervasyonunuz başarıyla oluşturuldu!');
            setReservationData(finalData);
            setCurrentStep(5);
        } catch (error) {
            console.error('Rezervasyon tamamlama hatası:', error);
            toast.error('❌ Rezervasyon oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(prev => ({ ...prev, transition: false }));
        }
    };

    const stepNames = ['Rota', 'Araç', 'Bilgiler', 'Onay'];

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <RouteStep key="route" onNext={(data) => handleStepChange(2, data)} disabled={loading.transition} initialData={reservationData} />;
            case 2: return <VehicleStep key="vehicle" vehicles={vehicles} services={services} reservationData={reservationData} loadingVehicles={loading.vehicles} loadingServices={loading.services} onNext={(data) => handleStepChange(3, data)} onBack={() => handleStepChange(1)} disabled={loading.transition} />;
            case 3: return <CustomerInfoStep key="customer" onNext={(data) => handleStepChange(4, data)} onBack={() => handleStepChange(2)} disabled={loading.transition} initialData={reservationData}/>;
            case 4: return <PaymentStep key="payment" reservationData={reservationData} onNext={handleFinalSubmit} onBack={() => handleStepChange(3)} disabled={loading.transition} />;
            case 5: return <ConfirmationStep key="confirmation" reservationData={reservationData} />;
            default: return null;
        }
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-slate-900 text-white"><div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 -z-10"></div>
                <header className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between"><Link href="/" className="flex items-center space-x-2"><MapPin className="h-7 w-7 text-blue-400" /><h1 className="text-xl font-bold">SBS TRAVEL</h1></Link><Link href="/" className="text-sm text-white/80 hover:text-white">Ana Sayfa</Link></div></header>
                <main className="relative z-10 py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        {currentStep < 5 && (
                             <div className="flex items-start justify-between mb-12 px-2 md:px-0">
                                {stepNames.map((name, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex flex-col items-center text-center w-16">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all text-lg ${currentStep > index ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/60'}`}>{currentStep > index + 1 ? <Check/> : index + 1}</div>
                                            <span className={`mt-2 text-xs md:text-sm ${currentStep >= index + 1 ? 'text-white' : 'text-white/60'}`}>{name}</span>
                                        </div>
                                        {index < stepNames.length - 1 && <div className={`flex-1 h-0.5 mt-5 transition-all duration-500 rounded-full ${currentStep > index + 1 ? 'bg-blue-500' : 'bg-white/20'}`} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 md:p-10 relative min-h-[400px]">
                            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
                            {loading.transition && currentStep < 5 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl"><div className="flex items-center space-x-3"><Loader2 className="h-8 w-8 animate-spin text-white" /><span className="text-lg">Yükleniyor...</span></div></motion.div>)}
                        </div>
                    </div>
                </main>
            </div>
        </ErrorBoundary>
    );
}
