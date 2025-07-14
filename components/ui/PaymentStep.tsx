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
  Copy,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { PayTRService } from '../../lib/services/paytrService';
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
  const [bankInfoCopied, setBankInfoCopied] = useState(false);

  // Load payment settings from admin panel
  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      // In a real app, this would fetch from your API
      // For now, we'll use mock settings that would come from admin panel
      const mockSettings = {
        creditCardEnabled: true,
        bankTransferEnabled: true,
        cashPaymentEnabled: true,
        bankTransferDiscount: 5,
        paytrActive: true,
        bankName: 'Ziraat Bankası',
        bankAccountHolder: 'SBS TRAVEL TURİZM LTD. ŞTİ.',
        bankIBAN: 'TR12 0001 0000 0000 0000 000000',
        bankBranch: 'Antalya Merkez Şubesi'
      };
      
      setPaymentSettings(mockSettings);
      
      // Initialize PayTR if enabled
      if (mockSettings.paytrActive) {
        PayTRService.initialize({
          merchantId: 'demo_merchant_id',
          merchantKey: 'demo_key',
          merchantSalt: 'demo_salt',
          testMode: true,
          successUrl: '/payment/success',
          failUrl: '/payment/fail'
        });
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
    }
  };

  const getAvailablePaymentMethods = () => {
    if (!paymentSettings) return [];
    
    const methods = [];
    
    if (paymentSettings.creditCardEnabled) {
      methods.push({
        id: 'credit-card',
        name: 'Kredi Kartı',
        description: 'Visa, Mastercard, American Express',
        icon: CreditCard,
        discount: 0,
        popular: true,
        gradient: 'from-blue-500 to-purple-600',
        enabled: paymentSettings.paytrActive
      });
    }
    
    if (paymentSettings.bankTransferEnabled) {
      methods.push({
        id: 'bank-transfer',
        name: 'Banka Havalesi',
        description: `Havale ile ödeme - %${paymentSettings.bankTransferDiscount} indirim`,
        icon: Banknote,
        discount: paymentSettings.bankTransferDiscount,
        popular: false,
        gradient: 'from-green-500 to-teal-600',
        enabled: true
      });
    }
    
    if (paymentSettings.cashPaymentEnabled) {
      methods.push({
        id: 'cash',
        name: 'Nakit Ödeme',
        description: 'Şoföre nakit ödeme',
        icon: Users,
        discount: 0,
        popular: false,
        gradient: 'from-orange-500 to-red-600',
        enabled: true
      });
    }
    
    return methods;
  };

  const calculateFinalPrice = (method: string) => {
    const basePrice = reservationData.totalPrice || 0;
    const availableMethods = getAvailablePaymentMethods();
    const paymentMethod = availableMethods.find(pm => pm.id === method);
    const discount = paymentMethod?.discount || 0;
    return basePrice - (basePrice * discount / 100);
  };

  const handlePaymentSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const copyBankInfo = async () => {
    if (!paymentSettings) return;
    
    const bankInfo = `
Banka: ${paymentSettings.bankName}
Hesap Sahibi: ${paymentSettings.bankAccountHolder}
IBAN: ${paymentSettings.bankIBAN}
Şube: ${paymentSettings.bankBranch}
Açıklama: Rezervasyon #${reservationData.id || 'RES' + Date.now()}
    `.trim();
    
    try {
      await navigator.clipboard.writeText(bankInfo);
      setBankInfoCopied(true);
      toast.success('Banka bilgileri kopyalandı!');
      setTimeout(() => setBankInfoCopied(false), 3000);
    } catch (error) {
      toast.error('Kopyalama başarısız');
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedPaymentMethod) return;

    setLoading(true);
    
    try {
      const availableMethods = getAvailablePaymentMethods();
      const selectedMethod = availableMethods.find(m => m.id === selectedPaymentMethod);
      
      if (selectedPaymentMethod === 'credit-card' && paymentSettings?.paytrActive) {
        // Handle PayTR payment
        const paymentRequest = {
          amount: calculateFinalPrice(selectedPaymentMethod),
          orderId: reservationData.id || 'RES' + Date.now(),
          customerEmail: reservationData.email,
          customerName: `${reservationData.firstName} ${reservationData.lastName}`,
          customerPhone: reservationData.phone,
          description: `Transfer: ${reservationData.from} → ${reservationData.to}`
        };

        const paytrResult = await PayTRService.createPaymentToken(paymentRequest);
        
        if (paytrResult.success && paytrResult.redirectUrl) {
          // Redirect to PayTR payment page
          window.location.href = paytrResult.redirectUrl;
          return;
        } else {
          toast.error(paytrResult.error || 'PayTR ödeme başlatılamadı');
          setLoading(false);
          return;
        }
      }
      
      const paymentData = {
        paymentMethod: selectedPaymentMethod,
        originalPrice: reservationData.totalPrice,
        finalPrice: calculateFinalPrice(selectedPaymentMethod),
        discount: selectedMethod?.discount || 0,
        bankInfo: selectedPaymentMethod === 'bank-transfer' ? paymentSettings : null
      };

      // Simulate processing delay for other payment methods
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onNext(paymentData);
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Ödeme işleminde hata oluştu');
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
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Ödeme Yöntemi Seçin</h3>
        
        {!paymentSettings ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white">Ödeme yöntemleri yükleniyor...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {getAvailablePaymentMethods().map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: method.enabled ? 1.02 : 1 }}
                whileTap={{ scale: method.enabled ? 0.98 : 1 }}
                onClick={() => method.enabled && handlePaymentSelect(method.id)}
                className={`transition-all duration-300 border-2 rounded-2xl p-6 backdrop-blur-md relative ${
                  !method.enabled 
                    ? 'border-gray-500 bg-gray-500/10 opacity-50 cursor-not-allowed'
                    : selectedPaymentMethod === method.id 
                      ? 'border-blue-500 bg-blue-500/20 shadow-2xl cursor-pointer' 
                      : 'border-white/30 bg-white/10 hover:border-white/50 cursor-pointer'
                }`}
              >
                {!method.enabled && (
                  <div className="absolute top-3 right-3 bg-gray-500 text-white px-2 py-1 rounded-full text-xs">
                    Devre dışı
                  </div>
                )}
                
                {method.popular && method.enabled && (
                  <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                    Popüler
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${method.gradient} ${!method.enabled ? 'opacity-50' : ''}`}>
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${method.enabled ? 'text-white' : 'text-gray-400'}`}>
                        {method.name}
                      </h4>
                      <p className={method.enabled ? 'text-white/70' : 'text-gray-500'}>
                        {method.description}
                      </p>
                      {method.discount > 0 && method.enabled && (
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
                        <p className={`line-through ${method.enabled ? 'text-white/50' : 'text-gray-500'}`}>
                          ₺{reservationData.totalPrice}
                        </p>
                        <p className={`font-bold text-lg ${method.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                          ₺{calculateFinalPrice(method.id)}
                        </p>
                      </div>
                    ) : (
                      <p className={`font-bold text-lg ${method.enabled ? 'text-white' : 'text-gray-400'}`}>
                        ₺{calculateFinalPrice(method.id)}
                      </p>
                    )}
                    
                    {selectedPaymentMethod === method.id && method.enabled && (
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

      {/* Bank Transfer Information */}
      {selectedPaymentMethod === 'bank-transfer' && paymentSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-green-500/20 to-teal-600/20 backdrop-blur-md border-2 border-green-500/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white flex items-center space-x-2">
              <Banknote className="h-6 w-6 text-green-400" />
              <span>Banka Havalesi Bilgileri</span>
            </h4>
            <button
              onClick={copyBankInfo}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {bankInfoCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{bankInfoCopied ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-200 text-sm font-medium">Banka</p>
                <p className="text-white font-semibold">{paymentSettings.bankName}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-200 text-sm font-medium">Hesap Sahibi</p>
                <p className="text-white font-semibold">{paymentSettings.bankAccountHolder}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-200 text-sm font-medium">IBAN</p>
                <p className="text-white font-semibold font-mono text-sm">{paymentSettings.bankIBAN}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-200 text-sm font-medium">Şube</p>
                <p className="text-white font-semibold">{paymentSettings.bankBranch}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-medium">Önemli Bilgiler:</p>
                <ul className="text-yellow-100 text-sm mt-2 space-y-1">
                  <li>• Havale açıklamasına rezervasyon numaranızı ({reservationData.id || 'RES' + Date.now()}) yazınız</li>
                  <li>• Havale dekontunu WhatsApp ile +90 532 123 4567 numarasına gönderin</li>
                  <li>• Havale onaylandıktan sonra rezervasyonunuz aktif hale gelecektir</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* PayTR Information */}
      {selectedPaymentMethod === 'credit-card' && paymentSettings?.paytrActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md border-2 border-blue-500/50 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="h-6 w-6 text-blue-400" />
            <h4 className="text-lg font-bold text-white">PayTR Güvenli Ödeme</h4>
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
            <Users className="h-6 w-6 text-orange-400" />
            <h4 className="text-lg font-bold text-white">Nakit Ödeme</h4>
          </div>
          <div className="space-y-3 text-white/80">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5" />
              <div>
                <p className="font-medium">Ödeme şoföre yapılacaktır:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Şoför yolculuk başlamadan önce ödemeyi alacaktır</li>
                  <li>• Tam para hazırlamanız önerilir</li>
                  <li>• Ödeme makbuzu verilecektir</li>
                  <li>• Toplam tutar: ₺{calculateFinalPrice('cash')}</li>
                </ul>
              </div>
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