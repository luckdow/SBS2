import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Luggage, Plane } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface RouteStepProps {
  onNext: (data: any) => void;
}

export const RouteStep: React.FC<RouteStepProps> = ({ onNext }) => {
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
          <Input
            label="Nereden"
            value={formData.from}
            onChange={(e) => setFormData({...formData, from: e.target.value})}
            placeholder="Başlangıç adresi"
            required
          />
          <Input
            label="Nereye"
            value={formData.to}
            onChange={(e) => setFormData({...formData, to: e.target.value})}
            placeholder="Varış adresi"
            required
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Tarih"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            icon={<Calendar className="h-5 w-5 text-gray-400" />}
            required
          />
          <Input
            label="Saat"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            icon={<Clock className="h-5 w-5 text-gray-400" />}
            required
          />
        </div>

        {/* Passengers and Baggage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Yolcu Sayısı"
            type="number"
            min="1"
            max="8"
            value={formData.passengers.toString()}
            onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
            icon={<Users className="h-5 w-5 text-gray-400" />}
            required
          />
          <Input
            label="Bagaj Sayısı"
            type="number"
            min="0"
            max="10"
            value={formData.baggage.toString()}
            onChange={(e) => setFormData({...formData, baggage: parseInt(e.target.value)})}
            icon={<Luggage className="h-5 w-5 text-gray-400" />}
            required
          />
          <Input
            label="Uçuş Numarası (Opsiyonel)"
            value={formData.flightNumber}
            onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
            placeholder="TK1234"
            icon={<Plane className="h-5 w-5 text-gray-400" />}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Devam Et
          </Button>
        </div>
      </form>
    </motion.div>
  );
};