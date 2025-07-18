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
  ArrowRight,
  User,
  Car,
  Settings,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AuthService } from '../../../lib/services/authService';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await AuthService.signInAndRedirect(formData.email, formData.password);
      
      if (result) {
        toast.success(`🎉 Giriş başarılı! ${result.role} paneline yönlendiriliyorsunuz...`);
        router.push(result.redirectUrl);
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      let errorMessage = '❌ Giriş hatası!';
      if (error.code === 'auth/user-not-found') {
        errorMessage = '❌ Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı!';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = '❌ Yanlış şifre!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '❌ Geçersiz e-posta adresi!';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = '❌ Çok fazla deneme! Lütfen daha sonra tekrar deneyin.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const result = await AuthService.signInWithGoogleAndRedirect();
      
      if (result) {
        toast.success(`🎉 Google ile giriş başarılı! ${result.role} paneline yönlendiriliyorsunuz...`);
        router.push(result.redirectUrl);
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = '❌ Google giriş hatası!';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = '❌ Google giriş penceresi kapatıldı!';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = '❌ Popup engellenmiş! Lütfen popup engelleyiciyi kapatın.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              <span className="text-white/90 text-sm">Güvenli Giriş</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Hoş Geldiniz
              </span>
            </h1>
            <p className="text-white/70">Hesabınıza giriş yapın ve otomatik olarak rolünüze uygun panele yönlendirileceksiniz</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  Şifremi unuttum
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Giriş yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <span>Giriş Yap</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">veya</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>Google ile Giriş Yap</span>
            </button>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
              <h4 className="font-semibold text-blue-200 mb-2">Demo Hesaplar (Otomatik Rol Algılama)</h4>
              <div className="space-y-1 text-blue-100 text-sm">
                <p>• <strong>Admin:</strong> admin@sbstravel.com / admin123</p>
                <p>• <strong>Şoför:</strong> sofor@sbstravel.com / sofor123</p>
                <p>• <strong>Müşteri:</strong> musteri@sbstravel.com / musteri123</p>
                <p className="text-blue-200 text-xs mt-2">Giriş yaptığınızda rolünüz otomatik algılanacak ve ilgili panele yönlendirileceksiniz.</p>
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-white/70">
                Hesabınız yok mu?{' '}
                <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Kayıt Olun
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}