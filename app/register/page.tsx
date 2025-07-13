'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin,
  Sparkles,
  User,
  Phone,
  ArrowRight,
  Car,
  Settings,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerType, setRegisterType] = useState<'customer' | 'driver'>('customer');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '', // Şoför için
    vehicleType: '', // Şoför için
    vehiclePlate: '', // Şoför için
    acceptTerms: false
  });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('❌ Şifreler eşleşmiyor!');
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('❌ Kullanım şartlarını kabul etmelisiniz!');
      return;
    }

    // Demo kayıt - gerçek uygulamada Firebase Auth kullanılacak
    toast.success('🎉 Kayıt başarılı! Giriş yapabilirsiniz.');
    router.push('/login');
  };

  const handleGoogleRegister = async () => {
    try {
      // Google Auth burada implement edilecek
      toast.success('🎉 Google ile kayıt başarılı!');
      router.push('/login');
    } catch (error) {
      toast.error('❌ Google kayıt hatası!');
    }
  };

  const registerTypes = [
    {
      id: 'customer',
      name: 'Müşteri',
      icon: User,
      description: 'Transfer rezervasyonu yapmak için',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'driver',
      name: 'Şoför',
      icon: Car,
      description: 'Şoför olarak çalışmak için',
      gradient: 'from-green-500 to-blue-600'
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  SBS TRAVEL
                </h1>
                <p className="text-xs text-blue-200">Premium Transfer</p>
              </div>
            </Link>
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              ← Ana Sayfa
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="max-w-md w-full mx-4">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-white/90 text-sm">Ücretsiz Kayıt</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Hesap Oluşturun
              </span>
            </h1>
            <p className="text-white/70">SBS Travel ailesine katılın</p>
          </motion.div>

          {/* Register Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 gap-3 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              {registerTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setRegisterType(type.id as any)}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    registerType === type.id
                      ? `bg-gradient-to-r ${type.gradient} text-white shadow-lg`
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <type.icon className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium block">{type.name}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-white/60 text-sm mt-3">
              {registerTypes.find(t => t.id === registerType)?.description}
            </p>
          </motion.div>

          {/* Register Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Ad</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Adınız"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Soyad</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Soyadınız"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="+90 532 123 4567"
                    required
                  />
                </div>
              </div>

              {/* Driver Specific Fields */}
              {registerType === 'driver' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Ehliyet Numarası</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="B123456789"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Araç Tipi</label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                        required
                      >
                        <option value="">Seçiniz</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Van">Van</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Plaka</label>
                      <input
                        type="text"
                        value={formData.vehiclePlate}
                        onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="34 ABC 123"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password Fields */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Şifre Tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                  className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-white">
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300">Kullanım şartlarını</Link> kabul ediyorum
                </label>
              </div>

              <button
                type="submit"
                className="w-full group relative px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Hesap Oluştur</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">veya</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Google Register */}
            <button
              onClick={handleGoogleRegister}
              className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium flex items-center justify-center space-x-3"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google ile Kayıt Ol</span>
            </button>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-white/70">
                Zaten hesabınız var mı?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}