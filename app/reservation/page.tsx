'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Luggage, Plane, MapPin, Star, Check, CheckCircle, Download, Mail, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

export default function ReservationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<any>({});
  const [qrCode, setQrCode] = useState('');

  const stepNames = ['Rota & Detay', 'Araç & Fiyat', 'Bilgiler', 'Onay'];

  // Mock vehicles data
  const vehicles = [
    {
      id: '1',
      name: 'Ekonomi Sedan',
      capacity: 4,
      baggage: 2,
      pricePerKm: 8,
      image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=300',
      features: ['Klima', 'Temiz Araç', 'Sigara İçilmez'],
      rating: 4.2
    },
    {
      id: '2',
      name: 'Konfor SUV',
      capacity: 6,
      baggage: 4,
      pricePerKm: 12,
      image: 'https://images.pexels.com/photos/463174/pexels-photo-463174.jpeg?auto=compress&cs=tinysrgb&w=300',
      features: ['Klima', 'Geniş İç Mekan', 'USB Şarj', 'Wi-Fi'],
      rating: 4.7
    },
    {
      id: '3',
      name: 'Premium Van',
      capacity: 8,
      baggage: 6,
      pricePerKm: 15,
      image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=300',
      features: ['Klima', 'Deri Koltuk', 'Mini Bar', 'Wi-Fi', 'TV'],
      rating: 4.9
    }
  ];

  const services = [
    { id: '1', name: 'Bebek Koltuğu', price: 50, description: '0-4 yaş arası çocuklar için' },
    { id: '2', name: 'Çocuk Koltuğu', price: 40, description: '4-12 yaş arası çocuklar için' },
    { id: '3', name: 'Ek Bagaj', price: 30, description: 'Standart üzeri bagaj için' },
    { id: '4', name: 'Havalimanı Karşılama', price: 75, description: 'Tabela ile karşılama hizmeti' }
  ];

  const handleRouteNext = (routeData: any) => {
    setReservationData(prev => ({ ...prev, ...routeData }));
    setCurrentStep(2);
  };

  const handleVehicleNext = (vehicleData: any) => {
    setReservationData(prev => ({ ...prev, ...vehicleData }));
    setCurrentStep(3);
  };

  const handleCustomerNext = async (customerData: any) => {
    try {
      const finalData = { ...reservationData, ...customerData };
      
      // Generate QR code
      const qrCodeData = JSON.stringify({
        reservationId: Date.now().toString(),
        timestamp: Date.now(),
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
      setQrCode(qrCodeUrl);
      setReservationData(finalData);
      setCurrentStep(4);
      
      toast.success('Rezervasyonunuz başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('Rezervasyon oluşturulurken bir hata oluştu.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SBS TRAVEL</h1>
                <p className="text-xs text-gray-500">Güvenli Transfer Hizmeti</p>
              </div>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </header>

      <div className="py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Rezervasyonu</h1>
          <p className="text-gray-600">4 kolay adımda rezervasyonunuzu tamamlayın</p>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {Array.from({ length: 4 }, (_, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: currentStep >= index + 1 ? 1 : 0.8 }}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                          ${currentStep >= index + 1 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-500'
                          }
                        `}
                      >
                        {index + 1}
                      </motion.div>
                      <span className={`mt-2 text-sm font-medium ${
                        currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {stepNames[index]}
                      </span>
                    </div>
                    {index < 3 && (
                      <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: currentStep > index + 1 ? '100%' : '0%' }}
                          className="h-full bg-blue-600"
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 1 && <RouteStep onNext={handleRouteNext} />}
            {currentStep === 2 && <VehicleStep vehicles={vehicles} services={services} onNext={handleVehicleNext} onBack={() => setCurrentStep(1)} />}
            {currentStep === 3 && <CustomerInfoStep onNext={handleCustomerNext} onBack={() => setCurrentStep(2)} />}
            {currentStep === 4 && <ConfirmationStep reservationData={reservationData} qrCode={qrCode} />}
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
    from: '',
    to: '',
    date: '',
    time: '',
    passengers: 1,
    baggage: 1,
    flightNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Detayları</h2>
        <p className="text-gray-600">Yolculuk bilgilerinizi girin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Direction Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Transfer Yönü</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="relative">
              <input
                type="radio"
                name="direction"
                value="airport-to-hotel"
                checked={formData.direction === 'airport-to-hotel'}
                onChange={(e) => setFormData({...formData, direction: e.target.value})}
                className="sr-only"
              />
              <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.direction === 'airport-to-hotel' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <Plane className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Havalimanı → Otel</span>
                </div>
              </div>
            </label>

            <label className="relative">
              <input
                type="radio"
                name="direction"
                value="hotel-to-airport"
                checked={formData.direction === 'hotel-to-airport'}
                onChange={(e) => setFormData({...formData, direction: e.target.value})}
                className="sr-only"
              />
              <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.direction === 'hotel-to-airport' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <Plane className="h-5 w-5 text-blue-600 transform rotate-180" />
                  <span className="font-medium">Otel → Havalimanı</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nereden</label>
            <input
              type="text"
              value={formData.from}
              onChange={(e) => setFormData({...formData, from: e.target.value})}
              placeholder="Başlangıç adresi"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nereye</label>
            <input
              type="text"
              value={formData.to}
              onChange={(e) => setFormData({...formData, to: e.target.value})}
              placeholder="Varış adresi"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Tarih</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Saat</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Passengers and Baggage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Yolcu Sayısı</label>
            <input
              type="number"
              min="1"
              max="8"
              value={formData.passengers}
              onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Bagaj Sayısı</label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.baggage}
              onChange={(e) => setFormData({...formData, baggage: parseInt(e.target.value)})}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Uçuş No (Opsiyonel)</label>
            <input
              type="text"
              value={formData.flightNumber}
              onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
              placeholder="TK1234"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Devam Et
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Vehicle Step Component
function VehicleStep({ vehicles, services, onNext, onBack }: any) {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const distance = 25; // Mock distance

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Araç & Fiyat Seçimi</h2>
        <p className="text-gray-600">Size uygun aracı seçin (Tahmini mesafe: {distance} km)</p>
      </div>

      {/* Vehicle Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Araç Seçimi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicles.map((vehicle: any) => (
            <div
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle.id)}
              className={`cursor-pointer transition-all border-2 rounded-xl p-6 ${
                selectedVehicle === vehicle.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={vehicle.image} 
                alt={vehicle.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{vehicle.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{vehicle.capacity} kişi</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Luggage className="h-4 w-4" />
                    <span>{vehicle.baggage} bavul</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {vehicle.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2 border-t">
                  <span className="text-2xl font-bold text-blue-600">₺{getPrice(vehicle)}</span>
                  <p className="text-xs text-gray-500">({vehicle.pricePerKm}₺/km)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Services */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Ek Hizmetler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service: any) => (
              <div
                key={service.id}
                onClick={() => handleServiceToggle(service.id)}
                className={`cursor-pointer transition-all border-2 rounded-xl p-4 ${
                  selectedServices.includes(service.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-green-600">₺{service.price}</span>
                    {selectedServices.includes(service.id) && (
                      <Check className="h-5 w-5 text-green-500 ml-2 inline" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Price Summary */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fiyat Özeti</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Araç kirası ({distance} km)</span>
              <span>₺{getPrice(vehicles.find((v: any) => v.id === selectedVehicle))}</span>
            </div>
            {selectedServices.map(serviceId => {
              const service = services.find((s: any) => s.id === serviceId);
              return service ? (
                <div key={serviceId} className="flex justify-between">
                  <span>{service.name}</span>
                  <span>₺{service.price}</span>
                </div>
              ) : null;
            })}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Toplam</span>
              <span className="text-blue-600">₺{getTotalPrice()}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Geri Dön
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedVehicle}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Devam Et
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">İletişim Bilgileri</h2>
        <p className="text-gray-600">Rezervasyon için gerekli bilgilerinizi girin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Ad</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.firstName ? 'border-red-300' : ''}`}
              required
            />
            {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Soyad</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.lastName ? 'border-red-300' : ''}`}
              required
            />
            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">E-posta</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-300' : ''}`}
              required
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+90 532 123 4567"
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.phone ? 'border-red-300' : ''}`}
              required
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Uçuş Numarası (Opsiyonel)</label>
          <input
            type="text"
            value={formData.flightNumber}
            onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
            placeholder="TK1234"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Özel İstekler (Opsiyonel)</label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
            rows={3}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Özel istekleriniz veya notlarınız..."
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Geri Dön
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Rezervasyonu Tamamla
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
        >
          <CheckCircle className="h-8 w-8 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rezervasyonunuz Tamamlandı!</h2>
        <p className="text-gray-600">Rezervasyon bilgileriniz e-posta adresinize gönderildi.</p>
      </div>

      {/* QR Code Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Kodunuz</h3>
        <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
          <img src={qrCode} alt="QR Code" className="w-32 h-32" />
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Bu QR kodu şoförünüze gösterin
        </p>
      </div>

      {/* Reservation Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rezervasyon Detayları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trip Info */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Güzergah</p>
                <p className="text-sm text-gray-600">{reservationData.from} → {reservationData.to}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Tarih & Saat</p>
                <p className="text-sm text-gray-600">{reservationData.date} - {reservationData.time}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Yolcu & Bagaj</p>
                <p className="text-sm text-gray-600">{reservationData.passengers} yolcu, {reservationData.baggage} bagaj</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">E-posta</p>
                <p className="text-sm text-gray-600">{reservationData.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Telefon</p>
                <p className="text-sm text-gray-600">{reservationData.phone}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-green-600">₺</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Toplam Tutar</p>
                <p className="text-sm text-gray-600">₺{reservationData.totalPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center">
          <Download className="h-4 w-4 mr-2" />
          PDF İndir
        </button>
        <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center">
          <Mail className="h-4 w-4 mr-2" />
          E-posta Gönder
        </button>
      </div>

      {/* Next Steps */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sonraki Adımlar</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Şoförünüz size WhatsApp üzerinden iletişim kuracak</p>
          <p>• Yolculuk zamanından 30 dakika önce arayacağız</p>
          <p>• QR kodunuzu şoföre gösterdikten sonra yolculuk başlayacak</p>
          <p>• Acil durumlar için: +90 532 123 4567</p>
        </div>
      </div>

      <div className="text-center">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
          <ArrowRight className="h-4 w-4 mr-2 transform rotate-180" />
          Ana Sayfaya Dön
        </Link>
      </div>
    </motion.div>
  );
}