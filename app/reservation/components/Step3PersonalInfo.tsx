'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Plane, 
  MessageCircle, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { StepProps, ValidationError } from '../types/reservation';

/**
 * Adım 3: Kişisel Bilgiler
 * Ad, soyad, e-posta, telefon, uçuş numarası ve özel istekler
 */
export default function Step3PersonalInfo({ data, onNext, onBack }: StepProps) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    flightNumber: data.flightNumber || '',
    specialRequests: data.specialRequests || '',
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Form validation
  const validateForm = (): ValidationError[] => {
    const newErrors: ValidationError[] = [];

    // Ad kontrolü
    if (!formData.firstName.trim()) {
      newErrors.push({ field: 'firstName', message: 'Ad alanı zorunludur' });
    } else if (formData.firstName.trim().length < 2) {
      newErrors.push({ field: 'firstName', message: 'Ad en az 2 karakter olmalıdır' });
    }

    // Soyad kontrolü
    if (!formData.lastName.trim()) {
      newErrors.push({ field: 'lastName', message: 'Soyad alanı zorunludur' });
    } else if (formData.lastName.trim().length < 2) {
      newErrors.push({ field: 'lastName', message: 'Soyad en az 2 karakter olmalıdır' });
    }

    // E-posta kontrolü
    if (!formData.email.trim()) {
      newErrors.push({ field: 'email', message: 'E-posta adresi zorunludur' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.push({ field: 'email', message: 'Geçerli bir e-posta adresi girin' });
      }
    }

    // Telefon kontrolü
    if (!formData.phone.trim()) {
      newErrors.push({ field: 'phone', message: 'Telefon numarası zorunludur' });
    } else {
      const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.push({ field: 'phone', message: 'Geçerli bir telefon numarası girin' });
      }
    }

    // Uçuş numarası kontrolü (opsiyonel ama varsa formatını kontrol et)
    if (formData.flightNumber.trim() && formData.flightNumber.trim().length < 3) {
      newErrors.push({ field: 'flightNumber', message: 'Uçuş numarası geçerli formatta olmalıdır' });
    }

    return newErrors;
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation - hatayı temizle
    if (errors.some(error => error.field === field)) {
      setErrors(prev => prev.filter(error => error.field !== field));
    }
  };

  const handleNext = async () => {
    setIsValidating(true);
    
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      toast.error('Lütfen form hatalarını düzeltin');
      setIsValidating(false);
      return;
    }

    // Form geçerliyse bir sonraki adıma geç
    try {
      const stepData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        flightNumber: formData.flightNumber.trim() || undefined,
        specialRequests: formData.specialRequests.trim() || undefined,
      };

      onNext(stepData);
    } catch (error) {
      toast.error('Bilgiler kaydedilirken bir hata oluştu');
    } finally {
      setIsValidating(false);
    }
  };

  const isFormValid = () => {
    return validateForm().length === 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Başlık */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Kişisel Bilgiler</h2>
        <p className="text-white/70">Rezervasyon için gerekli bilgilerinizi girin</p>
      </div>

      {/* Rezervasyon Özeti */}
      <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-blue-400 font-medium mb-3">Rezervasyon Özeti</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white text-sm">
          <div>
            <p className="text-white/70">Güzergah</p>
            <p className="font-semibold">{data.from} → {data.to}</p>
          </div>
          <div>
            <p className="text-white/70">Tarih & Saat</p>
            <p className="font-semibold">{data.date} - {data.time}</p>
          </div>
          <div>
            <p className="text-white/70">Araç</p>
            <p className="font-semibold">{data.vehicle?.name}</p>
          </div>
          <div>
            <p className="text-white/70">Toplam Ücret</p>
            <p className="font-semibold text-green-400">₺{data.totalPrice}</p>
          </div>
        </div>
      </div>

      {/* Form Alanları */}
      <div className="space-y-4">
        {/* Ad ve Soyad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <label className="block text-white font-medium mb-4">
              <User className="inline h-4 w-4 mr-2" />
              Ad *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Adınızı girin"
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                getFieldError('firstName') 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-white/20 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
            {getFieldError('firstName') && (
              <p className="text-red-400 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {getFieldError('firstName')}
              </p>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <label className="block text-white font-medium mb-4">
              <User className="inline h-4 w-4 mr-2" />
              Soyad *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Soyadınızı girin"
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                getFieldError('lastName') 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-white/20 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
            {getFieldError('lastName') && (
              <p className="text-red-400 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {getFieldError('lastName')}
              </p>
            )}
          </div>
        </div>

        {/* E-posta */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-medium mb-4">
            <Mail className="inline h-4 w-4 mr-2" />
            E-posta Adresi *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="ornek@email.com"
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
              getFieldError('email') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-white/20 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
          {getFieldError('email') && (
            <p className="text-red-400 text-sm mt-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {getFieldError('email')}
            </p>
          )}
          <p className="text-white/70 text-sm mt-2">Rezervasyon onayı bu adrese gönderilecektir</p>
        </div>

        {/* Telefon */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-medium mb-4">
            <Phone className="inline h-4 w-4 mr-2" />
            Telefon Numarası *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+90 555 123 45 67"
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
              getFieldError('phone') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-white/20 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
          {getFieldError('phone') && (
            <p className="text-red-400 text-sm mt-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {getFieldError('phone')}
            </p>
          )}
        </div>

        {/* Uçuş Numarası (Opsiyonel) */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-medium mb-4">
            <Plane className="inline h-4 w-4 mr-2" />
            Uçuş Numarası (Opsiyonel)
          </label>
          <input
            type="text"
            value={formData.flightNumber}
            onChange={(e) => handleInputChange('flightNumber', e.target.value.toUpperCase())}
            placeholder="TK123, PC456 gibi"
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
              getFieldError('flightNumber') 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-white/20 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
          {getFieldError('flightNumber') && (
            <p className="text-red-400 text-sm mt-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {getFieldError('flightNumber')}
            </p>
          )}
          <p className="text-white/70 text-sm mt-2">Havalimanı karşılama için önemlidir</p>
        </div>

        {/* Özel İstekler */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <label className="block text-white font-medium mb-4">
            <MessageCircle className="inline h-4 w-4 mr-2" />
            Özel İstekler (Opsiyonel)
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="Çocuk koltuğu, özel diyet, erişilebilirlik ihtiyaçları vb..."
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-white/70 text-sm mt-2">Özel ihtiyaçlarınızı belirtebilirsiniz</p>
        </div>
      </div>

      {/* Form Durumu */}
      {isFormValid() && errors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 backdrop-blur-md rounded-2xl p-4 border border-green-500/20 flex items-center"
        >
          <Check className="h-5 w-5 text-green-400 mr-3" />
          <p className="text-green-400">Tüm bilgiler doğru girildi</p>
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
          disabled={!isFormValid() || isValidating}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            isFormValid() && !isValidating
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Kontrol Ediliyor...</span>
            </>
          ) : (
            <>
              <span>Ödeme Adımına Geç</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}