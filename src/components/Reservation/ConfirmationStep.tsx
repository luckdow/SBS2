import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, Phone, Calendar, MapPin, Car } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ConfirmationStepProps {
  reservationData: any;
  qrCode: string;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ reservationData, qrCode }) => {
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
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Kodunuz</h3>
          <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
            <img src={qrCode} alt="QR Code" className="w-32 h-32" />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Bu QR kodu şoförünüze gösterin
          </p>
        </div>
      </Card>

      {/* Reservation Details */}
      <Card>
        <div className="p-6">
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
                <Car className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Araç</p>
                  <p className="text-sm text-gray-600">{reservationData.vehicle?.name}</p>
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
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          PDF İndir
        </Button>
        <Button className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          E-posta Gönder
        </Button>
      </div>

      {/* Next Steps */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sonraki Adımlar</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• Şoförünüz size WhatsApp üzerinden iletişim kuracak</p>
            <p>• Yolculuk zamanından 30 dakika önce arayacağız</p>
            <p>• QR kodunuzu şoföre gösterdikten sonra yolculuk başlayacak</p>
            <p>• Acil durumlar için: +90 532 123 4567</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};