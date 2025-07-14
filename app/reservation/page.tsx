'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  Luggage, 
  Plane, 
  MapPin, 
  Star, 
  Check, 
  CheckCircle, 
  Download, 
  Mail, 
  Phone, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Car,
  Navigation,
  QrCode,
  CreditCard,
  Gift,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { GoogleMapsService } from '../../lib/services/googleMaps';
import { EmailService } from '../../lib/services/emailService';
import { AuthService } from '../../lib/services/authService';
import { realTimeReservationService } from '../../lib/services/realTimeService';
import { vehicleService, serviceService } from '../../lib/services/api';
import AddressAutocomplete from '../../components/ui/AddressAutocomplete';
import RouteVisualization from '../../components/ui/RouteVisualization';
import PaymentStep from '../../components/ui/PaymentStep';

export default function ReservationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<any>({});
  const [qrCode, setQrCode] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  const stepNames = ['Rota Seçimi', 'Araç & Fiyat', 'Kişisel Bilgiler', 'Ödeme & Onay', 'Tamamlandı'];

  // Load vehicles and services when component mounts
  React.useEffect(() => {
    loadVehiclesAndServices();
  }, []);

  const loadVehiclesAndServices = async () => {
    setLoadingVehicles(true);
    setLoadingServices(true);
    
    try {
      // Load vehicles from admin panel
      const vehiclesData = await vehicleService.getAll();
      const activeVehicles = vehiclesData.filter(vehicle => vehicle.isActive !== false);
      setVehicles(activeVehicles.map(vehicle => ({
        ...vehicle,
        gradient: getVehicleGradient(vehicle.type || 'sedan')
      })));
    } catch (error) {
      console.error('Error loading vehicles:', error);
      // Fallback to mock data
      setVehicles(mockVehicles);
    } finally {
      setLoadingVehicles(false);
    }

    try {
      // Load services from admin panel
      const servicesData = await serviceService.getAll();
      const activeServices = servicesData.filter(service => service.isActive !== false);
      setServices(activeServices.map(service => ({
        ...service,
        icon: getServiceIcon(service.category || 'extra'),
        gradient: getServiceGradient(service.category || 'extra')
      })));
    } catch (error) {
      console.error('Error loading services:', error);
      // Fallback to mock data
      setServices(mockServices);
    } finally {
      setLoadingServices(false);
    }
  };

  const getVehicleGradient = (type: string) => {
    switch (type) {
      case 'sedan': return 'from-blue-400 to-blue-600';
      case 'suv': return 'from-purple-400 to-purple-600';
      case 'van': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'child_seat': return Gift;
      case 'extra_baggage': return Luggage;
      case 'meet_greet': return Plane;
      default: return Users;
    }
  };

  const getServiceGradient = (category: string) => {
    switch (category) {
      case 'child_seat': return 'from-pink-400 to-pink-600';
      case 'extra_baggage': return 'from-blue-400 to-blue-600';
      case 'meet_greet': return 'from-purple-400 to-purple-600';
      default: return 'from-green-400 to-green-600';
    }
  };

  // Mock vehicles data (fallback)
  const mockVehicles = [
    {
      id: '1',
      name: 'Ekonomi Sedan',
      capacity: 4,
      baggage: 2,
      pricePerKm: 8,
      image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Klima', 'Temiz Araç', 'Sigara İçilmez', 'Bluetooth'],
      rating: 4.2,
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: '2',
      name: 'Konfor SUV',
      capacity: 6,
      baggage: 4,
      pricePerKm: 12,
      image: 'https://images.pexels.com/photos/463174/pexels-photo-463174.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Klima', 'Geniş İç Mekan', 'USB Şarj', 'Wi-Fi', 'Deri Koltuk'],
      rating: 4.7,
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      id: '3',
      name: 'Premium Van',
      capacity: 8,
      baggage: 6,
      pricePerKm: 15,
      image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Klima', 'Deri Koltuk', 'Mini Bar', 'Wi-Fi', 'TV', 'Masaj'],
      rating: 4.9,
      gradient: 'from-yellow-400 to-orange-500'
    }
  ];

  // Mock services data (fallback)
  const mockServices = [
    { 
      id: '1', 
      name: 'Bebek Koltuğu', 
      price: 50, 
      description: '0-4 yaş arası çocuklar için',
      icon: Gift,
      gradient: 'from-pink-400 to-pink-600'
    },
    { 
      id: '2', 
      name: 'Çocuk Koltuğu', 
      price: 40, 
      description: '4-12 yaş arası çocuklar için',
      icon: Users,
      gradient: 'from-green-400 to-green-600'
    },
    { 
      id: '3', 
      name: 'Ek Bagaj', 
      price: 30, 
      description: 'Standart üzeri bagaj için',
      icon: Luggage,
      gradient: 'from-blue-400 to-blue-600'
    },
    { 
      id: '4', 
      name: 'Havalimanı Karşılama', 
      price: 75, 
      description: 'Tabela ile karşılama hizmeti',
      icon: Plane,
      gradient: 'from-purple-400 to-purple-600'
    }
  ];

  const handleRouteNext = (routeData: any) => {
    // Calculate distance using Google Maps
    GoogleMapsService.calculateDistance(routeData.from, routeData.to)
      .then(result => {
        if (result.status === 'success') {
          setReservationData(prev => ({ 
            ...prev, 
            ...routeData, 
            distance: result.distance,
            estimatedDuration: result.duration
          }));
        } else {
          console.error('Distance calculation error:', result.error);
          // Fallback with default distance
          setReservationData(prev => ({ ...prev, ...routeData, distance: 25, estimatedDuration: '30 dakika' }));
        }
        setCurrentStep(2);
      })
      .catch(error => {
        console.error('Distance calculation error:', error);
        // Fallback with default distance
        setReservationData(prev => ({ ...prev, ...routeData, distance: 25, estimatedDuration: '30 dakika' }));
        setCurrentStep(2);
      });
  };

  const handleVehicleNext = (vehicleData: any) => {
    setReservationData(prev => ({ 
      ...prev, 
      ...vehicleData 
    }));
    setCurrentStep(3);
  };

  const handleCustomerNext = (customerData: any) => {
    // Store customer data and move to payment step
    setReservationData(prev => ({ 
      ...prev, 
      ...customerData 
    }));
    setCurrentStep(4); // Go to payment step
  };

  const handlePaymentNext = async (paymentData: any) => {
    try {
      const finalData = { ...reservationData, ...paymentData };
      
      // Generate QR code with reservation data
      const reservationId = `RES${Date.now()}`;
      const reservationWithId = { ...finalData, id: reservationId };
      
      // Create reservation with real-time service
      const reservationForFirebase = {
        ...reservationWithId,
        status: 'pending' as const,
        qrCode: reservationId,
        customerId: `customer_${Date.now()}`,
        firstName: finalData.firstName,
        lastName: finalData.lastName,
        email: finalData.email,
        phone: finalData.phone,
        flightNumber: finalData.flightNumber || '',
        specialRequests: finalData.specialRequests || ''
      };
      
      console.log('🚀 Creating reservation with payment:', reservationForFirebase);
      const actualReservationId = await realTimeReservationService.create(reservationForFirebase);
      
      // Update with actual Firebase ID
      const finalReservationData = { ...reservationWithId, id: actualReservationId };
      
      const qrCodeUrl = await EmailService.generateQRCode(reservationWithId);
      
      // **IMPORTANT CHANGE: Create user account automatically AFTER payment completion**
      try {
        console.log('Creating customer account automatically after payment...');
        const fullName = `${finalData.firstName} ${finalData.lastName}`;
        
        const accountResult = await AuthService.createAutoAccount(
          finalData.email,
          fullName,
          finalData.phone
        );
        
        if (accountResult) {
          console.log('✅ User account created automatically after payment');
          // Store account info for display in confirmation step
          finalReservationData.autoAccount = {
            email: finalData.email,
            password: accountResult.password,
            created: true
          };
        } else {
          console.log('ℹ️ User account already exists or creation skipped');
          finalReservationData.autoAccount = {
            email: finalData.email,
            created: false,
            message: 'Hesap zaten mevcut'
          };
        }
      } catch (error) {
        console.log('⚠️ Customer account creation failed after payment, continuing:', error);
        finalReservationData.autoAccount = {
          email: finalData.email,
          created: false,
          error: 'Hesap oluşturulamadı'
        };
      }
      
      // Send confirmation email
      await EmailService.sendConfirmationEmail(finalReservationData, qrCodeUrl);
      
      setQrCode(qrCodeUrl);
      setReservationData(finalReservationData);
      
      setCurrentStep(5); // Go to final confirmation
      
      toast.success('🎉 Ödeme tamamlandı! Rezervasyonunuz oluşturuldu!');
    } catch (error) {
      toast.error('❌ Ödeme işlemi sırasında hata oluştu.');
      console.error('Payment/Reservation error:', error);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  SBS TRAVEL
                </h1>
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-white/90 text-sm">Premium Rezervasyon</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Transfer Rezervasyonu
              </span>
            </h1>
            <p className="text-white/70 text-lg">4 kolay adımda lüks yolculuğunuzu planlayın</p>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {Array.from({ length: 5 }, (_, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: currentStep >= index + 1 ? 1 : 0.8 }}
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm relative
                          ${currentStep >= index + 1 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                            : 'bg-white/20 text-white/60'
                          }
                        `}
                      >
                        {currentStep > index + 1 ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          index + 1
                        )}
                        {currentStep >= index + 1 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 animate-pulse"></div>
                        )}
                      </motion.div>
                      <span className={`mt-3 text-sm font-medium ${
                        currentStep >= index + 1 ? 'text-white' : 'text-white/60'
                      }`}>
                        {stepNames[index]}
                      </span>
                    </div>
                    {index < 4 && (
                      <div className="flex-1 h-1 mx-4 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: currentStep > index + 1 ? '100%' : '0%' }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && <RouteStep key="route" onNext={handleRouteNext} />}
              {currentStep === 2 && <VehicleStep key="vehicle" vehicles={vehicles} services={services} reservationData={reservationData} loadingVehicles={loadingVehicles} loadingServices={loadingServices} onNext={handleVehicleNext} onBack={() => setCurrentStep(1)} />}
              {currentStep === 3 && <CustomerInfoStep key="customer" onNext={handleCustomerNext} onBack={() => setCurrentStep(2)} />}
              {currentStep === 4 && <PaymentStep key="payment" reservationData={reservationData} onNext={handlePaymentNext} onBack={() => setCurrentStep(3)} />}
              {currentStep === 5 && <ConfirmationStep key="confirmation" reservationData={reservationData} qrCode={qrCode} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Route Step Component
function RouteStep({ onNext }: { onNext: (data: any) => void }) {
  const [formData, setFormData] = useState({
    direction: 'airport-to-hotel',
    hotelLocation: '',
    date: '',
    time: '',
    passengers: 1,
    baggage: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set from/to based on direction and hotel location
    const routeData = {
      ...formData,
      from: formData.direction === 'airport-to-hotel' ? 'Antalya Havalimanı' : formData.hotelLocation,
      to: formData.direction === 'airport-to-hotel' ? formData.hotelLocation : 'Antalya Havalimanı'
    };
    
    onNext(routeData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
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
                onChange={(e) => setFormData({...formData, direction: e.target.value})}
                className="sr-only"
              />
              <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${
                formData.direction === 'airport-to-hotel' 
                  ? 'border-blue-500 bg-blue-500/20 backdrop-blur-md' 
                  : 'border-white/30 bg-white/10 backdrop-blur-md hover:border-white/50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    formData.direction === 'airport-to-hotel' 
                      ? 'bg-blue-500' 
                      : 'bg-white/20'
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
                onChange={(e) => setFormData({...formData, direction: e.target.value})}
                className="sr-only"
              />
              <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${
                formData.direction === 'hotel-to-airport' 
                  ? 'border-purple-500 bg-purple-500/20 backdrop-blur-md' 
                  : 'border-white/30 bg-white/10 backdrop-blur-md hover:border-white/50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    formData.direction === 'hotel-to-airport' 
                      ? 'bg-purple-500' 
                      : 'bg-white/20'
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
          <AddressAutocomplete
            value={formData.hotelLocation}
            onChange={(value) => setFormData({...formData, hotelLocation: value})}
            placeholder={formData.direction === 'airport-to-hotel' ? 'Otel adını yazın...' : 'Kalkış yerini yazın...'}
          />
          <div className="text-sm text-white/60 bg-white/5 rounded-lg p-3">
            <p>💡 <strong>İpucu:</strong> Otel adını yazmaya başladığınızda öneriler görünecektir.</p>
            {!GoogleMapsService.isConfigured() && (
              <p className="text-amber-300 text-xs mt-2 flex items-center space-x-1">
                <span>⚡</span>
                <span>Google Maps API aktif olsaydı daha detaylı adres önerileri gösterilirdi.</span>
              </p>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Tarih</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
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
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Passengers and Baggage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Yolcu Sayısı</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="number"
                min="1"
                max="8"
                value={formData.passengers}
                onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all"
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
                max="10"
                value={formData.baggage}
                onChange={(e) => setFormData({...formData, baggage: parseInt(e.target.value)})}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!formData.hotelLocation}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

// Vehicle Step Component
function VehicleStep({ vehicles, services, reservationData, loadingVehicles, loadingServices, onNext, onBack }: any) {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const distance = reservationData?.distance || 25; // Use real distance from Google Maps, fallback to 25km

  // Filter vehicles based on passenger and baggage capacity
  const getFilteredVehicles = () => {
    const passengers = reservationData?.passengers || 1;
    const baggage = reservationData?.baggage || 1;
    
    return vehicles.filter((vehicle: any) => {
      const hasCapacity = vehicle.capacity >= passengers;
      const hasBaggageSpace = vehicle.baggage >= baggage;
      return hasCapacity && hasBaggageSpace;
    });
  };

  const filteredVehicles = getFilteredVehicles();

  const getPrice = (vehicle: any) => vehicle.pricePerKm * distance;

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
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleNext = () => {
    const vehicle = vehicles.find((v: any) => v.id === selectedVehicle);
    if (!vehicle) return;

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
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Araç & Fiyat Seçimi</h2>
        <p className="text-white/70 text-lg">Size uygun lüks aracı seçin (Mesafe: {distance} km{reservationData?.estimatedDuration ? `, ~${reservationData.estimatedDuration}` : ''})</p>
      </div>

      {/* Route Visualization */}
      {reservationData?.from && reservationData?.to && (
        <RouteVisualization 
          origin={reservationData.from}
          destination={reservationData.to}
          distance={distance}
          duration={reservationData.estimatedDuration}
        />
      )}

      {/* Vehicle Selection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <span>Premium Araç Seçimi</span>
          </h3>
          <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/50 rounded-xl px-4 py-2">
            <span className="text-blue-200 text-sm">
              {reservationData?.passengers} yolcu, {reservationData?.baggage} bagaj için uygun araçlar
            </span>
          </div>
        </div>
        
        {loadingVehicles ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white">Araçlar yükleniyor...</span>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-white/60 mx-auto mb-4" />
            <p className="text-white/70 mb-2">
              {reservationData?.passengers} yolcu ve {reservationData?.baggage} bagaj için uygun araç bulunmamaktadır.
            </p>
            <p className="text-white/60 text-sm">
              Farklı yolcu/bagaj sayısı için önceki adıma dönerek tekrar deneyin.
            </p>
          </div>
        ) : (
          <>
            {vehicles.length > filteredVehicles.length && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-200 text-sm">
                    {vehicles.length - filteredVehicles.length} araç kapasitesi nedeniyle filtrelendi. 
                    Toplam {filteredVehicles.length} uygun araç gösteriliyor.
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle: any) => (
            <motion.div
              key={vehicle.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedVehicle(vehicle.id)}
              className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl p-6 backdrop-blur-md ${
                selectedVehicle === vehicle.id 
                  ? 'border-blue-500 bg-blue-500/20 shadow-2xl' 
                  : 'border-white/30 bg-white/10 hover:border-white/50'
              }`}
            >
              <div className="relative mb-4 overflow-hidden rounded-xl">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-40 object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">{vehicle.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-white text-lg">{vehicle.name}</h4>
                  <div className="flex items-center justify-between text-sm text-white/70 mt-2">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{vehicle.capacity} kişi</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Luggage className="h-4 w-4" />
                      <span>{vehicle.baggage} bavul</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {vehicle.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-white/80">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-4 border-t border-white/20">
                  <div className={`bg-gradient-to-r ${vehicle.gradient} text-white px-4 py-2 rounded-xl`}>
                    <span className="text-lg font-bold">Premium Paket</span>
                    <p className="text-xs opacity-90">Konfor & Güvenlik</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
          </>
        )}
      </div>

      {/* Additional Services */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Sparkles className="h-6 w-6" />
            <span>Ek Premium Hizmetler</span>
          </h3>
          
          {loadingServices ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Hizmetler yükleniyor...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 text-white/60 mx-auto mb-3" />
              <p className="text-white/70">Şu anda ek hizmet bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service: any) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleServiceToggle(service.id)}
                className={`cursor-pointer transition-all duration-300 border-2 rounded-xl p-4 backdrop-blur-md ${
                  selectedServices.includes(service.id) 
                    ? 'border-green-500 bg-green-500/20' 
                    : 'border-white/30 bg-white/10 hover:border-white/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${service.gradient}`}>
                      <service.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{service.name}</h4>
                      <p className="text-sm text-white/70">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-400 text-lg">₺{service.price}</span>
                    {selectedServices.includes(service.id) && (
                      <CheckCircle className="h-5 w-5 text-green-400 ml-2 inline" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Price Summary */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md border-2 border-blue-500/50 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <CreditCard className="h-6 w-6" />
            <span>Fiyat Özeti</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Araç kirası ({distance} km)</span>
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
            <div className="border-t border-white/30 pt-3 flex justify-between font-bold text-xl">
              <span className="text-white">Toplam</span>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                ₺{getTotalPrice()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-medium flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Geri Dön</span>
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedVehicle}
          className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>Devam Et</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>
    </motion.div>
  );
}

// Customer Info Step Component
function CustomerInfoStep({ onNext, onBack }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    flightNumber: '',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gerekli';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gerekli';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gerekli';
    }

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
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Kişisel Bilgiler ve Uçuş Detayları</h2>
        <p className="text-white/70 text-lg">Rezervasyon için gerekli bilgilerinizi girin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Ad</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className={`w-full px-4 py-4 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/60 focus:ring-2 transition-all ${
                errors.firstName 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                  : 'border-white/30 focus:border-blue-500 focus:ring-blue-500/50'
              }`}
              required
            />
            {errors.firstName && <p className="text-sm text-red-400">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Soyad</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className={`w-full px-4 py-4 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/60 focus:ring-2 transition-all ${
                errors.lastName 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                  : 'border-white/30 focus:border-purple-500 focus:ring-purple-500/50'
              }`}
              required
            />
            {errors.lastName && <p className="text-sm text-red-400">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">E-posta</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/60 focus:ring-2 transition-all ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                    : 'border-white/30 focus:border-green-500 focus:ring-green-500/50'
                }`}
                required
              />
            </div>
            {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white">Telefon</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+90 532 123 4567"
                className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/60 focus:ring-2 transition-all ${
                  errors.phone 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                    : 'border-white/30 focus:border-yellow-500 focus:ring-yellow-500/50'
                }`}
                required
              />
            </div>
            {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-lg font-semibold text-white">Uçuş Numarası</label>
          <div className="relative">
            <Plane className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              type="text"
              value={formData.flightNumber}
              onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
              placeholder="Örn: TK1234, PC2152"
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-all"
            />
          </div>
          <div className="text-sm text-white/60 bg-white/5 rounded-lg p-3">
            <p>💡 <strong>İpucu:</strong> Uçuş numaranızı yazarsanız şoförünüz uçuş durumunuzu takip edebilir.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-lg font-semibold text-white">Özel İstekler (Opsiyonel)</label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
            rows={4}
            className="w-full px-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
            placeholder="Özel istekleriniz, çocuk koltuğu ihtiyacı, bagaj detayları vb..."
          />
        </div>

        {/* Auto membership info */}
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md border-2 border-green-500/50 rounded-2xl p-6">
          <div className="flex items-center space-x-4 mb-3">
            <div className="bg-green-500 p-3 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Otomatik Üyelik</h3>
              <p className="text-green-200">Girdiğiniz bilgilerle otomatik olarak üye olacaksınız</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-green-200">
              <Check className="h-4 w-4" />
              <span>Gelecek rezervasyonlarınızda daha hızlı işlem</span>
            </div>
            <div className="flex items-center space-x-2 text-green-200">
              <Check className="h-4 w-4" />
              <span>Özel indirimlere erişim</span>
            </div>
            <div className="flex items-center space-x-2 text-green-200">
              <Check className="h-4 w-4" />
              <span>Rezervasyon geçmişi takibi</span>
            </div>
            <div className="flex items-center space-x-2 text-green-200">
              <Check className="h-4 w-4" />
              <span>Sadakat puanları kazanma</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-medium flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Geri Dön</span>
          </button>
          <button
            type="submit"
            className="group relative px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <span>Rezervasyonu Tamamla</span>
            <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Confirmation Step Component
function ConfirmationStep({ reservationData, qrCode }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      {/* Success Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6 shadow-2xl"
        >
          <CheckCircle className="h-10 w-10 text-white" />
        </motion.div>
        <h2 className="text-4xl font-bold text-white mb-3">
          <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Rezervasyonunuz Tamamlandı!
          </span>
        </h2>
        <p className="text-white/70 text-lg">Rezervasyon bilgileriniz e-posta adresinize gönderildi.</p>
      </div>

      {/* Account Creation Success */}
      {reservationData.autoAccount && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`backdrop-blur-md border-2 rounded-3xl p-8 text-center ${
            reservationData.autoAccount.created
              ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/50'
              : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
          }`}
        >
          <div className="flex items-center space-x-4 mb-6 justify-center">
            <div className={`p-3 rounded-xl ${
              reservationData.autoAccount.created ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white">
                {reservationData.autoAccount.created ? 'Hesabınız Oluşturuldu!' : 'Hesap Bilgisi'}
              </h3>
              <p className={`${
                reservationData.autoAccount.created ? 'text-green-200' : 'text-yellow-200'
              }`}>
                {reservationData.autoAccount.created 
                  ? 'Otomatik olarak size özel hesap oluşturduk'
                  : reservationData.autoAccount.message || 'Hesap durumu'
                }
              </p>
            </div>
          </div>
          
          {reservationData.autoAccount.created && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">E-posta</p>
                <p className="text-white font-bold">{reservationData.autoAccount.email}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Geçici Şifre</p>
                <p className="text-white font-bold font-mono text-sm bg-black/30 rounded px-2 py-1">
                  {reservationData.autoAccount.password}
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-green-200">
              <Check className="h-4 w-4" />
              <span>Gelecek rezervasyonlarınızda hızlı giriş</span>
            </div>
            <div className="flex items-center space-x-2 text-green-200">
              <Check className="h-4 w-4" />
              <span>Özel müşteri indirimleri</span>
            </div>
            <div className="flex items-center space-x-2 text-green-200">
              <Check className="h-4 w-4" />
              <span>Rezervasyon geçmişi takibi</span>
            </div>
            <div className="flex items-center space-x-2 text-green-200">
              <Check className="h-4 w-4" />
              <span>Sadakat puanları</span>
            </div>
          </div>
          
          {reservationData.autoAccount.created && (
            <div className="mt-4 bg-blue-500/20 border border-blue-500/50 rounded-xl p-3">
              <p className="text-blue-200 text-sm">
                💡 <strong>Önemli:</strong> Bu şifreyi not alın ve ilk girişinizde değiştirin
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* QR Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md border-2 border-blue-500/50 rounded-3xl p-8 text-center"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center space-x-2">
          <QrCode className="h-8 w-8" />
          <span>QR Kodunuz</span>
        </h3>
        <div className="bg-white p-6 rounded-2xl inline-block shadow-2xl">
          <img src={qrCode} alt="QR Code" className="w-40 h-40" />
        </div>
        <p className="text-white/80 mt-4 text-lg">
          Bu QR kodu şoförünüze gösterin
        </p>
        <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3">
          <p className="text-yellow-200 text-sm">
            ⚡ QR kod ile anında yolculuk başlatma
          </p>
        </div>
      </motion.div>

      {/* Reservation Details */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6"
      >
        <h3 className="text-2xl font-bold text-white mb-6">Rezervasyon Detayları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trip Info */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">Güzergah</p>
                <p className="text-white/80">{reservationData.from}</p>
                <p className="text-white/60">↓</p>
                <p className="text-white/80">{reservationData.to}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">Tarih & Saat</p>
                <p className="text-white/80">{reservationData.date}</p>
                <p className="text-white/80">{reservationData.time}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">Yolcu & Bagaj</p>
                <p className="text-white/80">{reservationData.passengers} yolcu</p>
                <p className="text-white/80">{reservationData.baggage} bagaj</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">E-posta</p>
                <p className="text-white/80">{reservationData.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-pink-500 to-red-600 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">Telefon</p>
                <p className="text-white/80">{reservationData.phone}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">Toplam Tutar</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  ₺{reservationData.totalPrice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button className="flex-1 group relative px-6 py-4 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-medium flex items-center justify-center space-x-2">
          <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span>PDF İndir</span>
        </button>
        <button className="flex-1 group relative px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium flex items-center justify-center space-x-2">
          <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span>E-posta Gönder</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          <span>Sonraki Adımlar</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/90">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Şoförünüz size WhatsApp üzerinden iletişim kuracak</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Yolculuk zamanından 30 dakika önce arayacağız</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>QR kodunuzu şoföre gösterdikten sonra yolculuk başlayacak</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>Acil durumlar için: +90 532 123 4567</span>
          </div>
        </div>
      </motion.div>

      <div className="text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="group inline-flex items-center justify-center px-6 py-3 text-white/80 hover:text-white font-medium text-lg transition-colors border-2 border-white/30 rounded-xl hover:bg-white/10">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Ana Sayfaya Dön
          </Link>
          {reservationData.autoAccount?.created ? (
            <Link href="/login" className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium text-lg rounded-xl hover:from-green-600 hover:to-blue-700 transition-all shadow-lg">
              <Users className="h-5 w-5 mr-2" />
              Hesabıma Giriş Yap
              <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
            </Link>
          ) : (
            <Link href="/customer" className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-lg rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all">
              <Users className="h-5 w-5 mr-2" />
              Müşteri Paneli
            </Link>
          )}
        </div>
        
        {reservationData.autoAccount?.created && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-center"
          >
            <p className="text-white/60 text-sm">
              Hesabınıza giriş yapmak için e-posta adresinizi ve yukarıdaki geçici şifreyi kullanın
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}