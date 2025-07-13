'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Palette,
  Save,
  Edit,
  Camera,
  Key,
  Smartphone,
  Languages,
  DollarSign,
  Car,
  Star,
  Award,
  Crown,
  Gift,
  Target,
  Zap,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet@email.com',
    phone: '+90 532 123 4567',
    dateOfBirth: '1985-05-15',
    address: 'Antalya, Türkiye',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
  });

  const [preferences, setPreferences] = useState({
    language: 'tr',
    currency: 'TRY',
    timezone: 'Europe/Istanbul',
    theme: 'dark',
    preferredVehicle: 'suv',
    notifications: {
      email: true,
      sms: true,
      push: true,
      marketing: false
    }
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const membershipStats = {
    level: 'Gold',
    points: 1250,
    totalTrips: 24,
    totalSpent: 8450,
    memberSince: '2023-01-15',
    nextLevel: 'Platinum',
    pointsToNext: 750
  };

  const handleSaveProfile = () => {
    toast.success('✅ Profil bilgileri güncellendi!');
  };

  const handleSavePreferences = () => {
    toast.success('✅ Tercihler kaydedildi!');
  };

  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast.error('❌ Şifreler eşleşmiyor!');
      return;
    }
    toast.success('✅ Şifre başarıyla değiştirildi!');
    setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const tabs = [
    { id: 'profile', name: 'Profil Bilgileri', icon: User },
    { id: 'preferences', name: 'Tercihler', icon: Settings },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'membership', name: 'Üyelik', icon: Crown }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/customer" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Profil Ayarları
                </h1>
                <p className="text-xs text-blue-200">Hesap yönetimi</p>
              </div>
            </Link>
            <Link href="/customer" className="text-white/60 hover:text-white/80 transition-colors">
              ← Müşteri Paneli
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 mb-8"
        >
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img 
                src={profileData.avatar} 
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white/30"
              />
              <button className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <div className="flex items-center space-x-4 text-white/70">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{profileData.phone}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full flex items-center space-x-1">
                  <Crown className="h-4 w-4 text-white" />
                  <span className="text-white font-medium text-sm">{membershipStats.level} Üye</span>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white text-sm">{membershipStats.points} Puan</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Profil Bilgileri</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Ad</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Soyad</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">E-posta</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Doğum Tarihi</label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Adres</label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>Kaydet</span>
                  </button>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Tercihler</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Dil</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="ru">Русский</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Para Birimi</label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      >
                        <option value="TRY">₺ Türk Lirası</option>
                        <option value="USD">$ US Dollar</option>
                        <option value="EUR">€ Euro</option>
                        <option value="GBP">£ British Pound</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Tercih Edilen Araç</label>
                      <select
                        value={preferences.preferredVehicle}
                        onChange={(e) => setPreferences({...preferences, preferredVehicle: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      >
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="van">Van</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Tema</label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      >
                        <option value="dark">Koyu Tema</option>
                        <option value="light">Açık Tema</option>
                        <option value="auto">Otomatik</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Bildirim Tercihleri</h4>
                    {Object.entries(preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="text-white capitalize">
                          {key === 'email' && 'E-posta Bildirimleri'}
                          {key === 'sms' && 'SMS Bildirimleri'}
                          {key === 'push' && 'Push Bildirimleri'}
                          {key === 'marketing' && 'Pazarlama Bildirimleri'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, [key]: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSavePreferences}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>Kaydet</span>
                  </button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Güvenlik Ayarları</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Şifre Değiştir</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Mevcut Şifre</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={security.currentPassword}
                              onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Yeni Şifre</label>
                          <input
                            type="password"
                            value={security.newPassword}
                            onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Yeni Şifre (Tekrar)</label>
                          <input
                            type="password"
                            value={security.confirmPassword}
                            onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                        <button
                          onClick={handleChangePassword}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
                        >
                          <Key className="h-5 w-5" />
                          <span>Şifreyi Değiştir</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-6">
                      <h4 className="text-lg font-semibold text-white mb-4">İki Faktörlü Doğrulama</h4>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-medium">2FA Güvenlik</p>
                          <p className="text-white/70 text-sm">Hesabınız için ek güvenlik katmanı</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={security.twoFactorEnabled}
                            onChange={(e) => setSecurity({...security, twoFactorEnabled: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Membership Tab */}
              {activeTab === 'membership' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Üyelik Bilgileri</h3>
                  
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Crown className="h-8 w-8" />
                        <div>
                          <h4 className="text-2xl font-bold">{membershipStats.level} Üyelik</h4>
                          <p className="opacity-90">Üye olma tarihi: {new Date(membershipStats.memberSince).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{membershipStats.points}</p>
                        <p className="opacity-90">Sadakat Puanı</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/20 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span>Sonraki seviye: {membershipStats.nextLevel}</span>
                        <span>{membershipStats.pointsToNext} puan kaldı</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(membershipStats.points / (membershipStats.points + membershipStats.pointsToNext)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 rounded-xl p-6 text-center">
                      <Car className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-white">{membershipStats.totalTrips}</p>
                      <p className="text-white/70">Toplam Yolculuk</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 text-center">
                      <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-white">₺{membershipStats.totalSpent}</p>
                      <p className="text-white/70">Toplam Harcama</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 text-center">
                      <Gift className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-white">{membershipStats.points}</p>
                      <p className="text-white/70">Sadakat Puanı</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Üyelik Avantajları</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Özel indirimler',
                        'Öncelikli rezervasyon',
                        'Ücretsiz iptal',
                        'Premium araç seçenekleri',
                        'Sadakat puanı kazanma',
                        '7/24 VIP destek'
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="text-white/80">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}