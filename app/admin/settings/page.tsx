'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Bell, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign,
  Percent,
  Clock,
  Shield,
  Database,
  Palette,
  Globe,
  Key,
  Users,
  Car,
  CreditCard,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Banknote,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { settingsService, AppSettings } from '../../../lib/services/api';

export default function AdminSettingsPage() {
  const [showPayTRKeys, setShowPayTRKeys] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    // Default values will be loaded from service
    companyName: 'SBS TRAVEL',
    companyEmail: 'info@sbstravel.com',
    companyPhone: '+90 532 123 4567',
    companyAddress: 'Antalya, Türkiye',
    paytrMerchantId: '',
    paytrMerchantKey: '',
    paytrMerchantSalt: '',
    paytrTestMode: true,
    paytrActive: false,
    paytrSuccessUrl: '/payment/success',
    paytrFailUrl: '/payment/fail',
    bankName: 'Türkiye İş Bankası',
    bankBranch: 'Antalya Şubesi',
    accountNumber: '1234567890',
    iban: 'TR12 0006 4000 0011 2345 6789 01',
    accountHolder: 'SBS Travel Turizm Ltd. Şti.',
    swiftCode: 'ISBKTRIS',
    creditCardPaymentActive: true,
    bankTransferPaymentActive: true,
    cashPaymentActive: true,
    driverCommissionRate: 75,
    companyCommissionRate: 25,
    basePricePerKm: 8,
    emailTemplateReservationConfirm: 'Rezervasyonunuz onaylandı. QR kodunuz ektedir.',
    emailTemplateDriverAssigned: 'Şoförünüz atandı: {{driverName}} - {{driverPhone}}',
    emailTemplateReminder: 'Rezervasyonunuz 24 saat içinde başlayacak.',
    emailTemplateCancellation: 'Rezervasyonunuz iptal edildi.',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    autoAssignDrivers: true,
    requireDriverApproval: false,
    allowCancellation: true,
    cancellationTimeLimit: 30,
    requireTwoFactor: false,
    sessionTimeout: 60,
    passwordMinLength: 8,
    darkMode: true,
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6'
  });

  // Load settings on mount
  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const loadedSettings = await settingsService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Ayarlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await settingsService.updateSettings(settings);
      toast.success('✅ Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('❌ Ayarlar kaydedilirken hata oluştu.');
    }
  };

  const handleReset = async () => {
    if (confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      try {
        await settingsService.resetToDefaults();
        await loadSettings(); // Reload settings
        toast.success('🔄 Ayarlar sıfırlandı!');
      } catch (error) {
        console.error('Error resetting settings:', error);
        toast.error('❌ Ayarlar sıfırlanırken hata oluştu.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Sistem Ayarları
                </h1>
                <p className="text-xs text-blue-200">Genel ayarlar</p>
              </div>
            </Link>
            <Link href="/admin" className="text-white/60 hover:text-white/80 transition-colors">
              ← Admin Panel
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <span className="ml-4 text-white text-lg">Ayarlar yükleniyor...</span>
          </div>
        ) : (
          <>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Sistem Ayarları</h1>
            <p className="text-white/70 text-lg">Platform konfigürasyonu ve ayarları</p>
          </motion.div>
          
          <div className="flex space-x-3">
            <button 
              onClick={handleReset}
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Sıfırla
            </button>
            <button 
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>Kaydet</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-blue-400" />
              <span>Şirket Bilgileri</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Şirket Adı</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">E-posta</label>
                <input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Telefon</label>
                <input
                  type="tel"
                  value={settings.companyPhone}
                  onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Adres</label>
                <textarea
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* PayTR API Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-yellow-400" />
              <span>PayTR API Ayarları</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${settings.paytrActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-white">PayTR Entegrasyonu</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paytrActive}
                    onChange={(e) => setSettings({...settings, paytrActive: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-sm">Test Modu</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paytrTestMode}
                    onChange={(e) => setSettings({...settings, paytrTestMode: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Merchant ID</label>
                <input
                  type={showPayTRKeys ? "text" : "password"}
                  value={settings.paytrMerchantId}
                  onChange={(e) => setSettings({...settings, paytrMerchantId: e.target.value})}
                  placeholder="PayTR Merchant ID"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Merchant Key</label>
                <input
                  type={showPayTRKeys ? "text" : "password"}
                  value={settings.paytrMerchantKey}
                  onChange={(e) => setSettings({...settings, paytrMerchantKey: e.target.value})}
                  placeholder="PayTR Merchant Key"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Merchant Salt</label>
                <input
                  type={showPayTRKeys ? "text" : "password"}
                  value={settings.paytrMerchantSalt}
                  onChange={(e) => setSettings({...settings, paytrMerchantSalt: e.target.value})}
                  placeholder="PayTR Merchant Salt"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              
              <button
                onClick={() => setShowPayTRKeys(!showPayTRKeys)}
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                {showPayTRKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showPayTRKeys ? 'API anahtarlarını gizle' : 'API anahtarlarını göster'}</span>
              </button>
            </div>
          </motion.div>

          {/* Bank Transfer Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-blue-400" />
              <span>Banka Havalesi Ayarları</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${settings.bankTransferPaymentActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-white">Banka Havalesi</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.bankTransferPaymentActive}
                    onChange={(e) => setSettings({...settings, bankTransferPaymentActive: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Banka Adı</label>
                  <input
                    type="text"
                    value={settings.bankName}
                    onChange={(e) => setSettings({...settings, bankName: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Şube</label>
                  <input
                    type="text"
                    value={settings.bankBranch}
                    onChange={(e) => setSettings({...settings, bankBranch: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Hesap Sahibi</label>
                <input
                  type="text"
                  value={settings.accountHolder}
                  onChange={(e) => setSettings({...settings, accountHolder: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">IBAN</label>
                  <input
                    type="text"
                    value={settings.iban}
                    onChange={(e) => setSettings({...settings, iban: e.target.value})}
                    placeholder="TR12 3456 7890 1234 5678 9012 34"
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Hesap Numarası</label>
                  <input
                    type="text"
                    value={settings.accountNumber}
                    onChange={(e) => setSettings({...settings, accountNumber: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">SWIFT Kodu</label>
                <input
                  type="text"
                  value={settings.swiftCode}
                  onChange={(e) => setSettings({...settings, swiftCode: e.target.value})}
                  placeholder="ISBKTRIS"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Payment Methods Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-green-400" />
              <span>Ödeme Yöntemleri</span>
            </h3>
            <div className="space-y-6">
              {/* Credit Card Payment */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Kredi Kartı</h4>
                    <p className="text-sm text-white/70">PayTR entegrasyonu ile güvenli ödeme</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.creditCardPaymentActive}
                    onChange={(e) => setSettings({...settings, creditCardPaymentActive: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Bank Transfer Payment */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Banka Havalesi</h4>
                    <p className="text-sm text-white/70">Müşteriye banka bilgileri gösterilir</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.bankTransferPaymentActive}
                    onChange={(e) => setSettings({...settings, bankTransferPaymentActive: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Cash Payment */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-xl">
                    <Banknote className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Nakit Ödeme</h4>
                    <p className="text-sm text-white/70">Şoföre nakit ödeme seçeneği</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cashPaymentActive}
                    onChange={(e) => setSettings({...settings, cashPaymentActive: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-400" />
              <span>Fiyatlandırma</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Şoför Komisyonu (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.driverCommissionRate}
                  onChange={(e) => setSettings({...settings, driverCommissionRate: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Şirket Komisyonu (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.companyCommissionRate}
                  onChange={(e) => setSettings({...settings, companyCommissionRate: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Temel Fiyat (₺/km)</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={settings.basePricePerKm}
                  onChange={(e) => setSettings({...settings, basePricePerKm: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Email Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FileText className="h-6 w-6 text-orange-400" />
              <span>Email Şablonları</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Rezervasyon Onay</label>
                <textarea
                  value={settings.emailTemplateReservationConfirm}
                  onChange={(e) => setSettings({...settings, emailTemplateReservationConfirm: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Şoför Atama</label>
                <textarea
                  value={settings.emailTemplateDriverAssigned}
                  onChange={(e) => setSettings({...settings, emailTemplateDriverAssigned: e.target.value})}
                  rows={3}
                  placeholder="{{driverName}} ve {{driverPhone}} değişkenlerini kullanabilirsiniz"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Hatırlatma</label>
                <textarea
                  value={settings.emailTemplateReminder}
                  onChange={(e) => setSettings({...settings, emailTemplateReminder: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">İptal Bildirimi</label>
                <textarea
                  value={settings.emailTemplateCancellation}
                  onChange={(e) => setSettings({...settings, emailTemplateCancellation: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Bell className="h-6 w-6 text-yellow-400" />
              <span>Bildirimler</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-white">E-posta Bildirimleri</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span className="text-white">SMS Bildirimleri</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-purple-400" />
                  <span className="text-white">Push Bildirimleri</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* System Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Database className="h-6 w-6 text-purple-400" />
              <span>Sistem Ayarları</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Car className="h-5 w-5 text-blue-400" />
                  <span className="text-white">Otomatik Şoför Atama</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoAssignDrivers}
                    onChange={(e) => setSettings({...settings, autoAssignDrivers: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-400" />
                  <span className="text-white">Şoför Onayı Gerekli</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireDriverApproval}
                    onChange={(e) => setSettings({...settings, requireDriverApproval: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">İptal Süresi (dakika)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.cancellationTimeLimit}
                  onChange={(e) => setSettings({...settings, cancellationTimeLimit: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button 
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-4 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 mx-auto"
          >
            <Save className="h-6 w-6" />
            <span className="text-lg font-semibold">Tüm Ayarları Kaydet</span>
          </button>
        </motion.div>
        </>
        )}
      </div>
    </div>
  );
}