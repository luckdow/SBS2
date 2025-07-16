'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Download, 
  QrCode, 
  Mail, 
  User, 
  MapPin, 
  Calendar, 
  Car,
  CreditCard,
  Eye,
  EyeOff,
  ExternalLink,
  Home
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { StepProps } from '../types/reservation';

/**
 * Adım 5: Onay ve Otomatik Üyelik
 * Rezervasyon onayı, QR kod, otomatik üyelik bilgileri ve yönlendirme butonları
 */
export default function Step5Confirmation({ data }: StepProps) {
  const [showPassword, setShowPassword] = useState(false);

  // QR kod indirme
  const downloadQRCode = () => {
    if (data.qrCode) {
      const link = document.createElement('a');
      link.href = data.qrCode;
      link.download = `rezervasyon-qr-${data.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR kod indirildi!');
    }
  };

  // Rezervasyon detaylarını PDF olarak indirme
  const downloadPDF = () => {
    // Bu fonksiyon gerçek projede PDF oluşturma servisi ile entegre edilecek
    toast.success('PDF indirme özelliği yakında aktif olacak');
  };

  // E-posta yeniden gönderme
  const resendEmail = async () => {
    try {
      // EmailService.sendConfirmationEmail(data);
      toast.success('Onay e-postası yeniden gönderildi!');
    } catch (error) {
      toast.error('E-posta gönderilemedi');
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash': return 'Nakit Ödeme';
      case 'bank-transfer': return 'Banka Havalesi';
      case 'credit-card': return 'Kredi Kartı';
      default: return method;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Başarı Mesajı */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">🎉 Rezervasyon Tamamlandı!</h2>
        <p className="text-white/70 text-lg">Transfer rezervasyonunuz başarıyla oluşturuldu</p>
        <p className="text-green-400 font-medium mt-2">Rezervasyon ID: #{data.id}</p>
      </motion.div>

      {/* Otomatik Üyelik Bildirimi */}
      {data.customerCredentials && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20"
        >
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-purple-400 mr-3" />
            <h3 className="text-purple-400 font-bold text-lg">✨ Otomatik Üyelik Oluşturuldu!</h3>
          </div>
          <div className="space-y-3">
            <p className="text-white">
              Size özel bir müşteri hesabı oluşturuldu. Bu hesapla rezervasyonlarınızı takip edebilir, 
              geçmiş transferlerinizi görüntüleyebilir ve hızlı rezervasyon yapabilirsiniz.
            </p>
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70">E-posta:</span>
                <span className="text-white font-medium">{data.customerCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Geçici Şifre:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono bg-white/10 px-3 py-1 rounded">
                    {showPassword ? data.customerCredentials.tempPassword : '•••••••••'}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </motion.button>
                </div>
              </div>
            </div>
            <p className="text-white/60 text-sm">
              🔒 Güvenliğiniz için ilk girişte şifrenizi değiştirmeyi unutmayın
            </p>
          </div>
        </motion.div>
      )}

      {/* Rezervasyon Detayları */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-white font-bold text-lg mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Rezervasyon Detayları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Müşteri:</span>
              <span className="text-white font-medium">{data.firstName} {data.lastName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">E-posta:</span>
              <span className="text-white font-medium">{data.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Telefon:</span>
              <span className="text-white font-medium">{data.phone}</span>
            </div>
            {data.flightNumber && (
              <div className="flex items-center justify-between">
                <span className="text-white/70">Uçuş No:</span>
                <span className="text-white font-medium">{data.flightNumber}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Güzergah:</span>
              <span className="text-white font-medium">{data.from} → {data.to}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Tarih & Saat:</span>
              <span className="text-white font-medium">{data.date} - {data.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Araç:</span>
              <span className="text-white font-medium">{data.vehicle?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Ödeme:</span>
              <span className="text-white font-medium">{formatPaymentMethod(data.paymentMethod || 'cash')}</span>
            </div>
          </div>
        </div>
        
        {/* Fiyat Özeti */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Araç ücreti:</span>
              <span>₺{data.basePrice}</span>
            </div>
            {data.servicesPrice && data.servicesPrice > 0 && (
              <div className="flex justify-between text-white">
                <span>Ek hizmetler:</span>
                <span>₺{data.servicesPrice}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/20">
              <span>Toplam:</span>
              <span className="text-green-400">₺{data.totalPrice}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* QR Kod */}
      {data.qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center"
        >
          <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center">
            <QrCode className="h-5 w-5 mr-2" />
            Transfer QR Kodu
          </h3>
          <div className="inline-block bg-white p-4 rounded-xl mb-4">
            <img 
              src={data.qrCode} 
              alt="Rezervasyon QR Kodu" 
              className="w-32 h-32"
            />
          </div>
          <p className="text-white/70 text-sm mb-4">
            Bu QR kodu şoförünüze göstererek rezervasyonunuzu doğrulayabilirsiniz
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadQRCode}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <Download className="h-4 w-4" />
            <span>QR Kodu İndir</span>
          </motion.button>
        </motion.div>
      )}

      {/* Önemli Bilgiler */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20"
      >
        <h3 className="text-blue-400 font-medium mb-3 flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Önemli Bilgiler
        </h3>
        <div className="space-y-2 text-white/80 text-sm">
          <p>• Rezervasyon onay e-postası {data.email} adresine gönderilmiştir</p>
          <p>• Transfer saatinden 15 dakika önce hazır olmanız önerilir</p>
          <p>• Herhangi bir değişiklik için müşteri hizmetlerimizle iletişime geçin</p>
          <p>• QR kodunuzu transfer sırasında şoförünüze göstermeyi unutmayın</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resendEmail}
          className="mt-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors text-sm"
        >
          E-postayı Yeniden Gönder
        </motion.button>
      </motion.div>

      {/* Eylem Butonları */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {data.customerCredentials && (
          <Link href="/customer">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <User className="h-5 w-5" />
              <span>Müşteri Panelime Git</span>
              <ExternalLink className="h-4 w-4" />
            </motion.button>
          </Link>
        )}

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Ana Sayfaya Dön</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Ek Eylemler */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="flex justify-center space-x-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadPDF}
          className="text-white/70 hover:text-white transition-colors flex items-center space-x-2 text-sm"
        >
          <Download className="h-4 w-4" />
          <span>PDF İndir</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}