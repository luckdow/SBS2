'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Check,
  X,
  Copy,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { StepProps, PaymentSettings } from '../types/reservation';

/**
 * Adım 4: Ödeme
 * Ödeme yöntemi seçimi, banka havalesi detayları ve test modu
 */
export default function Step4Payment({ data, onNext, onBack }: StepProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'bank-transfer' | 'credit-card'>(
    data.paymentMethod || 'cash'
  );
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    creditCardActive: true,
    bankTransferActive: true,
    cashActive: true,
    bankDetails: {
      bankName: 'Türkiye İş Bankası',
      accountHolder: 'SBS TRAVEL LTD. ŞTİ.',
      iban: 'TR12 0006 4000 0013 4000 0123 45',
      accountNumber: '1340-0012345',
      swiftCode: 'ISBKTRIS'
    }
  });
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ödeme ayarlarını yükle (gerçek projede API'den gelecek)
  useEffect(() => {
    // Mock payment settings - gerçek projede API'den yüklenecek
    const loadPaymentSettings = async () => {
      try {
        // const settings = await paymentService.getSettings();
        // setPaymentSettings(settings);
      } catch (error) {
        console.error('Ödeme ayarları yüklenemedi:', error);
      }
    };

    loadPaymentSettings();
  }, []);

  const paymentMethods = [
    {
      id: 'cash' as const,
      name: 'Nakit Ödeme',
      description: 'Transfer sırasında nakit ödeme',
      icon: Wallet,
      active: paymentSettings.cashActive,
      details: 'Şoförünüze araçta nakit ödeme yapabilirsiniz'
    },
    {
      id: 'bank-transfer' as const,
      name: 'Banka Havalesi',
      description: 'Hesaba havale ile ödeme',
      icon: Building2,
      active: paymentSettings.bankTransferActive,
      details: 'Hesap bilgilerimize havale yaparak ödeyebilirsiniz'
    },
    {
      id: 'credit-card' as const,
      name: 'Kredi Kartı',
      description: 'Online kart ile ödeme (Test Modu)',
      icon: CreditCard,
      active: paymentSettings.creditCardActive,
      details: 'Test modunda - gerçek ödeme yapılmayacak'
    }
  ];

  const activePaymentMethods = paymentMethods.filter(method => method.active);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Kopyalandı!');
    }).catch(() => {
      toast.error('Kopyalanamadı');
    });
  };

  const handlePaymentMethodSelect = (method: 'cash' | 'bank-transfer' | 'credit-card') => {
    setSelectedPaymentMethod(method);
    if (method === 'bank-transfer') {
      setShowBankDetails(true);
    } else {
      setShowBankDetails(false);
    }
  };

  const handleNext = async () => {
    setIsProcessing(true);

    try {
      // Test modu için özel mesaj
      if (selectedPaymentMethod === 'credit-card') {
        toast.success('Test Modu: Rezervasyon ödeme olmadan onaylanacak');
      }

      const stepData = {
        paymentMethod: selectedPaymentMethod,
      };

      // Ödeme işlemi simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));

      onNext(stepData);
    } catch (error) {
      toast.error('Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
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
        <h2 className="text-2xl font-bold text-white mb-2">Ödeme Yöntemi</h2>
        <p className="text-white/70">Size uygun ödeme yöntemini seçin</p>
      </div>

      {/* Rezervasyon Özeti */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-blue-400 font-medium mb-4 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Rezervasyon Özeti
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span className="text-white/70">Müşteri:</span>
              <span>{data.firstName} {data.lastName}</span>
            </div>
            <div className="flex justify-between text-white">
              <span className="text-white/70">Güzergah:</span>
              <span>{data.from} → {data.to}</span>
            </div>
            <div className="flex justify-between text-white">
              <span className="text-white/70">Tarih & Saat:</span>
              <span>{data.date} - {data.time}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span className="text-white/70">Araç:</span>
              <span>{data.vehicle?.name}</span>
            </div>
            <div className="flex justify-between text-white">
              <span className="text-white/70">Mesafe:</span>
              <span>{data.routeInfo?.distanceText || `${data.distance} km`}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-white/20 pt-2">
              <span>Toplam Ücret:</span>
              <span className="text-green-400">₺{data.totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Modu Uyarısı */}
      <div className="bg-yellow-500/10 backdrop-blur-md rounded-2xl p-4 border border-yellow-500/20">
        <div className="flex items-center text-yellow-400">
          <Info className="h-5 w-5 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium">Test Modu Aktif</p>
            <p className="text-yellow-400/80 text-sm">
              Bu rezervasyon test amaçlıdır. Gerçek ödeme yapılmayacak ve rezervasyon otomatik onaylanacaktır.
            </p>
          </div>
        </div>
      </div>

      {/* Ödeme Yöntemleri */}
      <div className="space-y-4">
        <h3 className="text-white font-medium text-lg">Ödeme Yöntemi Seçin</h3>
        
        {activePaymentMethods.length === 0 ? (
          <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-6 border border-red-500/20 text-center">
            <p className="text-red-400">Şu anda aktif ödeme yöntemi bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activePaymentMethods.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handlePaymentMethodSelect(method.id)}
                className={`bg-white/5 backdrop-blur-md rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
                  selectedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/10 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      selectedPaymentMethod === method.id 
                        ? 'bg-blue-500/30' 
                        : 'bg-white/10'
                    }`}>
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{method.name}</h4>
                      <p className="text-white/70 text-sm">{method.description}</p>
                      <p className="text-white/50 text-xs mt-1">{method.details}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-white/30'
                  }`}>
                    {selectedPaymentMethod === method.id && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Banka Havalesi Detayları */}
      <AnimatePresence>
        {showBankDetails && selectedPaymentMethod === 'bank-transfer' && paymentSettings.bankDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-500/10 backdrop-blur-md rounded-2xl p-6 border border-green-500/20"
          >
            <h3 className="text-green-400 font-medium mb-4">Banka Hesap Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                <div>
                  <p className="text-white/70 text-sm">Banka Adı</p>
                  <p className="text-white font-medium">{paymentSettings.bankDetails.bankName}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                <div>
                  <p className="text-white/70 text-sm">Hesap Sahibi</p>
                  <p className="text-white font-medium">{paymentSettings.bankDetails.accountHolder}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                <div>
                  <p className="text-white/70 text-sm">IBAN</p>
                  <p className="text-white font-medium font-mono">{paymentSettings.bankDetails.iban}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(paymentSettings.bankDetails!.iban)}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4 text-blue-400" />
                </motion.button>
              </div>

              <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                <div>
                  <p className="text-white/70 text-sm">Hesap No</p>
                  <p className="text-white font-medium font-mono">{paymentSettings.bankDetails.accountNumber}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(paymentSettings.bankDetails!.accountNumber)}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4 text-blue-400" />
                </motion.button>
              </div>

              {paymentSettings.bankDetails.swiftCode && (
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                  <div>
                    <p className="text-white/70 text-sm">Swift Kodu</p>
                    <p className="text-white font-medium font-mono">{paymentSettings.bankDetails.swiftCode}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(paymentSettings.bankDetails!.swiftCode!)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                  >
                    <Copy className="h-4 w-4 text-blue-400" />
                  </motion.button>
                </div>
              )}

              <div className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20">
                <p className="text-yellow-400 text-sm">
                  <Info className="inline h-4 w-4 mr-1" />
                  Havale açıklaması: Rezervasyon ID'nizi belirtmeyi unutmayın
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Butonlar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Önceki Adım</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={isProcessing}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            !isProcessing
              ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>İşleniyor...</span>
            </>
          ) : (
            <>
              <span>Rezervasyonu Tamamla</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}