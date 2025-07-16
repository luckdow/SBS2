'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Users, 
  Luggage, 
  Star, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  MapPin,
  Clock,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { vehicleService } from '../../../lib/services/vehicleService';
import { serviceService } from '../../../lib/services/serviceService';
import type { StepProps, Vehicle, Service } from '../types/reservation';

/**
 * Adım 2: Araç ve Fiyat Seçimi
 * Rota gösterimi, araç filtreleme, ek hizmetler ve dinamik fiyat hesaplama
 */
export default function Step2VehicleSelection({ data, onNext, onBack }: StepProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(data.vehicle || null);
  const [selectedServices, setSelectedServices] = useState<string[]>(data.selectedServices || []);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fiyat hesaplama
  const calculatePrice = () => {
    if (!selectedVehicle || !data.distance) return { basePrice: 0, servicesPrice: 0, totalPrice: 0 };

    const basePrice = data.distance * selectedVehicle.pricePerKm;
    const servicesPrice = selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
    
    return {
      basePrice: Math.round(basePrice),
      servicesPrice,
      totalPrice: Math.round(basePrice + servicesPrice)
    };
  };

  const { basePrice, servicesPrice, totalPrice } = calculatePrice();

  // Veri yükleme
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingVehicles(true);
        setLoadingServices(true);

        const [vehiclesData, servicesData] = await Promise.all([
          vehicleService.getAll(),
          serviceService.getProcessedServices()
        ]);

        // Aktif araçları filtrele ve yolcu/bagaj kapasitesine göre sırala
        const activeVehicles = vehiclesData
          .filter((v: Vehicle) => v.isActive && v.capacity >= (data.passengers || 1) && v.baggage >= (data.baggage || 0))
          .sort((a: Vehicle, b: Vehicle) => a.capacity - b.capacity);

        setVehicles(activeVehicles);
        setServices(servicesData.filter(s => s.isActive));

      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        toast.error('Araçlar yüklenemedi');
      } finally {
        setLoadingVehicles(false);
        setLoadingServices(false);
      }
    };

    loadData();
  }, [data.passengers, data.baggage]);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleNext = () => {
    if (!selectedVehicle) {
      toast.error('Lütfen bir araç seçin');
      return;
    }

    const stepData = {
      vehicle: selectedVehicle,
      selectedServices,
      basePrice,
      servicesPrice,
      totalPrice,
    };

    onNext(stepData);
  };

  if (loadingVehicles || loadingServices) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Araçlar yükleniyor...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Başlık */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Araç Seçimi</h2>
        <p className="text-white/70">Size uygun aracı seçin ve ek hizmetlerinizi belirleyin</p>
      </div>

      {/* Rota Özeti */}
      <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-blue-400 font-medium mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Seçilen Rota
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
          <div>
            <p className="text-white/70">Güzergah</p>
            <p className="font-semibold">{data.from} → {data.to}</p>
          </div>
          <div>
            <p className="text-white/70">Mesafe</p>
            <p className="font-semibold">{data.routeInfo?.distanceText || `${data.distance} km`}</p>
          </div>
          <div>
            <p className="text-white/70">Tahmini Süre</p>
            <p className="font-semibold">{data.estimatedDuration || data.routeInfo?.durationText}</p>
          </div>
        </div>
      </div>

      {/* Araç Listesi */}
      <div className="space-y-4">
        <h3 className="text-white font-medium text-lg">Müsait Araçlar</h3>
        
        {vehicles.length === 0 ? (
          <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-6 border border-red-500/20 text-center">
            <p className="text-red-400">Seçtiğiniz yolcu ve bagaj sayısına uygun araç bulunamadı.</p>
            <p className="text-white/70 text-sm mt-2">Lütfen önceki adımda farklı seçimler yapın.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVehicleSelect(vehicle)}
                className={`bg-white/5 backdrop-blur-md rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
                  selectedVehicle?.id === vehicle.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/10 hover:border-blue-400'
                }`}
              >
                <div className="relative mb-4">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  {selectedVehicle?.id === vehicle.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <h4 className="text-white font-semibold text-lg mb-2">{vehicle.name}</h4>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 text-white/70">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{vehicle.capacity}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Luggage className="h-4 w-4" />
                      <span className="text-sm">{vehicle.baggage}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm">{vehicle.rating}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {vehicle.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-white/70 text-sm">
                      <Check className="h-3 w-3 text-green-400 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="text-center pt-3 border-t border-white/10">
                  <p className="text-white/70 text-sm">Km başı</p>
                  <p className="text-white font-bold text-lg">₺{vehicle.pricePerKm}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Ek Hizmetler */}
      {selectedVehicle && services.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-white font-medium text-lg">Ek Hizmetler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleServiceToggle(service.id)}
                className={`bg-white/5 backdrop-blur-md rounded-xl p-4 border cursor-pointer transition-all duration-300 ${
                  selectedServices.includes(service.id)
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-white/10 hover:border-green-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{service.name}</h4>
                    <p className="text-white/70 text-sm">{service.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-semibold">₺{service.price}</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedServices.includes(service.id)
                        ? 'border-green-500 bg-green-500'
                        : 'border-white/30'
                    }`}>
                      {selectedServices.includes(service.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Fiyat Özeti */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-green-500/20"
        >
          <h3 className="text-green-400 font-medium mb-4 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Fiyat Hesaplama
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Araç ücreti ({data.distance} km × ₺{selectedVehicle.pricePerKm})</span>
              <span>₺{basePrice}</span>
            </div>
            {servicesPrice > 0 && (
              <div className="flex justify-between text-white">
                <span>Ek hizmetler</span>
                <span>₺{servicesPrice}</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Toplam</span>
                <span>₺{totalPrice}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Butonlar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Önceki Adım</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={!selectedVehicle}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            selectedVehicle
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          <span>Bilgileri Gir</span>
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}