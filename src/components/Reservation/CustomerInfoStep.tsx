import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Plane } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CustomerInfoStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

export const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({ onNext, onBack }) => {
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
    } else if (!/^(\+90|0)?[5][0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası girin';
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
          <Input
            label="Ad"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            icon={<User className="h-5 w-5 text-gray-400" />}
            error={errors.firstName}
            required
          />
          <Input
            label="Soyad"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            icon={<User className="h-5 w-5 text-gray-400" />}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="E-posta"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            icon={<Mail className="h-5 w-5 text-gray-400" />}
            error={errors.email}
            required
          />
          <Input
            label="Telefon"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            icon={<Phone className="h-5 w-5 text-gray-400" />}
            placeholder="+90 532 123 4567"
            error={errors.phone}
            required
          />
        </div>

        <Input
          label="Uçuş Numarası (Opsiyonel)"
          value={formData.flightNumber}
          onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
          icon={<Plane className="h-5 w-5 text-gray-400" />}
          placeholder="TK1234"
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Özel İstekler (Opsiyonel)
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
            rows={3}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Özel istekleriniz veya notlarınız..."
          />
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Geri Dön
          </Button>
          <Button type="submit">
            Rezervasyonu Tamamla
          </Button>
        </div>
      </form>
    </motion.div>
  );
};