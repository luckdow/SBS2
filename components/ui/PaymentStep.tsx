'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Shield, 
  Check, 
  ArrowLeft, 
  Banknote,
  Users,
  Clock,
  MapPin,
  Lock,
  AlertCircle,
  Building2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { settingsService } from '../../lib/services/api';
import toast from 'react-hot-toast';

interface PaymentStepProps {
  reservationData: any;
  onNext: (paymentData: any) => void;
  onBack: () => void;
}

export default function PaymentStep({ reservationData, onNext, onBack }: PaymentStepProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Load payment settings on mount
  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      setLoadingSettings(true);
      const settings = await settingsService.getPaymentSettings();
      setPaymentSettings(settings);
    } catch (error) {
      console.error('Error loading payment settings:', error);
      toast.error('Ödeme ayarları yüklenirken hata oluştu.');
    } finally {
      setLoadingSettings(false);
    }
  };

  // Generate payment methods based on admin settings
  const getAvailablePaymentMethods = () => {
    if (!paymentSettings) return [];

    const methods = [];

    if (paymentSettings.creditCardActive) {
      methods.push({
        id: 'credit-card',
        name: 'Kredi Kartı',
        description: 'Visa, Mastercard, American Express',
        icon: CreditCard,
        discount: 0,
        popular: true,
        gradient: 'from-blue-500 to-purple-600'
      });
    }

    if (paymentSettings.bankTransferActive) {
      methods.push({
        id: 'bank-transfer',
        name: 'Banka Havalesi',
        description: 'Havale ile ödeme - %3 indirim',
        icon: Building2,
        discount: 3,
        popular: false,
        gradient: 'from-green-500 to-teal-600'
      });
    }

    if (paymentSettings.cashActive) {
      methods.push({
        id: 'cash',
        name: 'Nakit Ödeme',
        description: 'Şoföre nakit ödeme',
        icon: Banknote,
        discount: 0,
        popular: false,
        gradient: 'from-orange-500 to-red-600'
      });
    }

    return methods;
  };

  const calculateFinalPrice = (method: string) => {
    const basePrice = reservationData.totalPrice || 0;
    const availableMethods = getAvailablePaymentMethods();
    const paymentMethod = availableMethods.find(pm => pm.id === method);
    const discount = paymentMethod?.discount || 0;
    return Math.round(basePrice - (basePrice * discount / 100));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} kopyalandı!`);
    }).catch(() => {
      toast.error('Kopyalama başarısız.');
    });
  };

  const handlePaymentSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPaymentMethod) return;

    setLoading(true);
    
    try {
      const availableMethods = getAvailablePaymentMethods();
      const selectedMethod = availableMethods.find(pm => pm.id === selectedPaymentMethod);
      
      const paymentData = {
        paymentMethod: selectedPaymentMethod,
        originalPrice: reservationData.totalPrice,
        finalPrice: calculateFinalPrice(selectedPaymentMethod),
        discount: selectedMethod?.discount || 0,
        paymentSettings
      };

      // For credit card, we would redirect to PayTR here
      if (selectedPaymentMethod === 'credit-card') {
        // PayTR integration would happen here
        console.log('Redirecting to PayTR with config:', paymentSettings.paytrConfig);
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onNext(paymentData);
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Ödeme işlemi sırasında hata oluştu.');
    } finally {
      setLoading(false);
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
        <h2 className="text-3xl font-bold text-white mb-3">Ödeme Bilgileri</h2>
        <p className="text-white/70 text-lg">Güvenli ödeme yönteminizi seçin</p>
      </div>

      {/* Payment Security Notice */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md border-2 border-green-500/50 rounded-2xl p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-green-500 p-3 rounded-xl">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Güvenli Ödeme</h3>
            <p className="text-green-200">SSL şifreleme ile korumalı</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-green-200">
            <Check className="h-4 w-4" />
            <span>256-bit SSL şifreleme</span>
          </div>
          <div className="flex items-center space-x-2 text-green-200">
            <Check className="h-4 w-4" />
            <span>PCI DSS uyumlu</span>
          </div>
          <div className="flex items-center space-x-2 text-green-200">
            <Check className="h-4 w-4" />
            <span>3D Secure doğrulama</span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Rezervasyon Özeti</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-blue-400 mt-1" />
            <div>
              <p className="text-white font-medium">{reservationData.from}</p>
              <p className="text-white/60">↓</p>
              <p className="text-white font-medium">{reservationData.to}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-white/80">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{reservationData.date} - {reservationData.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{reservationData.passengers} yolcu</span>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <div className="flex justify-between text-white mb-2">
              <span>Araç: {reservationData.vehicle?.name}</span>
              <span>₺{reservationData.basePrice}</span>
            </div>
            {reservationData.servicesPrice > 0 && (
              <div className="flex justify-between text-white/80 mb-2">
                <span>Ek hizmetler</span>
                <span>₺{reservationData.servicesPrice}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl text-white">
              <span>Toplam</span>
              <span>₺{reservationData.totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {loadingSettings ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">Ödeme seçenekleri yükleniyor...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Ödeme Yöntemi Seçin</h3>
          
          {getAvailablePaymentMethods().length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-white/60 mx-auto mb-4" />
              <p className="text-white/70">Şu anda aktif ödeme yöntemi bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getAvailablePaymentMethods().map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePaymentSelect(method.id)}
                  className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl p-6 backdrop-blur-md relative ${
                    selectedPaymentMethod === method.id 
                      ? 'border-blue-500 bg-blue-500/20 shadow-2xl' 
                      : 'border-white/30 bg-white/10 hover:border-white/50'
                  }`}
                >
                  {method.popular && (
                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                      Popüler
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${method.gradient}`}>
                        <method.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{method.name}</h4>
                        <p className="text-white/70">{method.description}</p>
                        {method.discount > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            <AlertCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-400 font-medium">%{method.discount} indirim</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {method.discount > 0 ? (
                        <div>
                          <p className="text-white/50 line-through">₺{reservationData.totalPrice}</p>
                          <p className="text-green-400 font-bold text-lg">₺{calculateFinalPrice(method.id)}</p>
                        </div>
                      ) : (
                        <p className="text-white font-bold text-lg">₺{calculateFinalPrice(method.id)}</p>
                      )}
                      
                      {selectedPaymentMethod === method.id && (
                        <div className="flex items-center justify-end mt-2">
                          <div className="bg-blue-500 rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bank Transfer Details */}
      {selectedPaymentMethod === 'bank-transfer' && paymentSettings?.bankDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-green-500/20 to-blue-600/20 backdrop-blur-md border-2 border-green-500/50 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Building2 className="h-6 w-6 text-green-400" />
            <h4 className="text-lg font-bold text-white">Banka Havale Bilgileri</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Banka Adı</p>
                    <p className="text-white font-semibold">{paymentSettings.bankDetails.bankName}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentSettings.bankDetails.bankName, 'Banka adı')}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Hesap Sahibi</p>
                    <p className="text-white font-semibold">{paymentSettings.bankDetails.accountHolder}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentSettings.bankDetails.accountHolder, 'Hesap sahibi')}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">IBAN</p>
                    <p className="text-white font-semibold font-mono text-sm">{paymentSettings.bankDetails.iban}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentSettings.bankDetails.iban, 'IBAN')}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Hesap Numarası</p>
                    <p className="text-white font-semibold font-mono">{paymentSettings.bankDetails.accountNumber}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentSettings.bankDetails.accountNumber, 'Hesap numarası')}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Önemli Bilgiler</span>
            </div>
            <div className="text-sm text-white/90 space-y-1">
              <p>• Havale açıklamasına rezervasyon numaranızı yazınız</p>
              <p>• Havale onayı 1-2 iş günü içinde yapılacaktır</p>
              <p>• Havale makbuzu WhatsApp ile gönderebilirsiniz</p>
              <p>• Tutar: <span className="font-bold text-green-400">₺{calculateFinalPrice('bank-transfer')}</span></p>
            </div>
          </div>
        </motion.div>
      )}

      {/* PayTR Information */}
      {selectedPaymentMethod === 'credit-card' && paymentSettings?.paytrConfig && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md border-2 border-blue-500/50 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="h-6 w-6 text-blue-400" />
            <h4 className="text-lg font-bold text-white">PayTR Güvenli Ödeme</h4>
            {paymentSettings.paytrConfig.testMode && (
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">TEST MODU</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
            <div>
              <p>• Kredi kartı bilgileriniz PayTR güvencesinde</p>
              <p>• 3D Secure ile ekstra güvenlik</p>
              <p>• Anında ödeme onayı</p>
            </div>
            <div>
              <p>• Visa, Mastercard, American Express</p>
              <p>• Taksit imkanları mevcuttur</p>
              <p>• SSL 256-bit şifreleme</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cash Payment Information */}
      {selectedPaymentMethod === 'cash' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-orange-500/20 to-red-600/20 backdrop-blur-md border-2 border-orange-500/50 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Banknote className="h-6 w-6 text-orange-400" />
            <h4 className="text-lg font-bold text-white">Nakit Ödeme</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
            <div>
              <p>• Şoföre yolculuk sonunda ödeme yapılır</p>
              <p>• Ödeme tutarı: <span className="font-bold text-orange-400">₺{calculateFinalPrice('cash')}</span></p>
              <p>• Para üstü için hazırlık yapınız</p>
            </div>
            <div>
              <p>• Şoför makbuz verebilir</p>
              <p>• QR kod gösterilmesi gereklidir</p>
              <p>• İptal koşulları geçerlidir</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="group px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-medium flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Geri Dön</span>
        </button>
        
        <button
          onClick={handleProceedToPayment}
          disabled={!selectedPaymentMethod || loading}
          className="group relative px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>İşleniyor...</span>
            </>
          ) : (
            <>
              <span>
                {selectedPaymentMethod === 'credit-card' ? 'Ödemeye Devam Et' : 
                 selectedPaymentMethod === 'bank-transfer' ? 'Havale Bilgilerini Al' :
                 'Rezervasyonu Tamamla'}
              </span>
              <CreditCard className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>
    </motion.div>
  );
}