import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Luggage, Star, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  baggage: number;
  pricePerKm: number;
  image: string;
  features: string[];
  rating: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface VehicleStepProps {
  routeData: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const VehicleStep: React.FC<VehicleStepProps> = ({ routeData, onNext, onBack }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [distance] = useState(25); // Mock distance
  
  // Mock data - would come from Firebase
  const vehicles: Vehicle[] = [
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

  const services: Service[] = [
    { id: '1', name: 'Bebek Koltuğu', price: 50, description: '0-4 yaş arası çocuklar için' },
    { id: '2', name: 'Çocuk Koltuğu', price: 40, description: '4-12 yaş arası çocuklar için' },
    { id: '3', name: 'Ek Bagaj', price: 30, description: 'Standart üzeri bagaj için' },
    { id: '4', name: 'Havalimanı Karşılama', price: 75, description: 'Tabela ile karşılama hizmeti' }
  ];

  const getPrice = (vehicle: Vehicle) => {
    return vehicle.pricePerKm * distance;
  };

  const getTotalPrice = () => {
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    if (!vehicle) return 0;
    
    const basePrice = getPrice(vehicle);
    const servicesPrice = selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
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
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    if (!vehicle) return;

    onNext({
      vehicle,
      selectedServices,
      basePrice: getPrice(vehicle),
      servicesPrice: selectedServices.reduce((total, serviceId) => {
        const service = services.find(s => s.id === serviceId);
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
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className={`cursor-pointer transition-all ${
              selectedVehicle === vehicle.id ? 'ring-2 ring-blue-500 border-blue-200' : ''
            }`}>
              <div onClick={() => setSelectedVehicle(vehicle.id)} className="p-6">
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
                    {vehicle.features.map((feature, index) => (
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
            </Card>
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
            {services.map((service) => (
              <Card key={service.id} className={`cursor-pointer transition-all ${
                selectedServices.includes(service.id) ? 'ring-2 ring-green-500 border-green-200' : ''
              }`}>
                <div onClick={() => handleServiceToggle(service.id)} className="p-4">
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
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Price Summary */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fiyat Özeti</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Araç kirası ({distance} km)</span>
                  <span>₺{getPrice(vehicles.find(v => v.id === selectedVehicle)!)}</span>
                </div>
                {selectedServices.map(serviceId => {
                  const service = services.find(s => s.id === serviceId);
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
            </div>
          </Card>
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Geri Dön
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!selectedVehicle}
        >
          Devam Et
        </Button>
      </div>
    </motion.div>
  );
};