'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AuthService } from '../../../lib/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await AuthService.sendPasswordReset(email);
      setEmailSent(true);
      toast.success('🎉 Şifre sıfırlama e-postası gönderildi!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = '❌ Şifre sıfırlama hatası!';
      if (error.code === 'auth/user-not-found') {
        errorMessage = '❌ Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı!';
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

  const handleTryAgain = () => {
    setEmailSent(false);
    setEmail('');
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
          {!emailSent ? (
            <>
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-4">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-white/90 text-sm">Şifre Sıfırlama</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Şifremi Unuttum
                  </span>
                </h1>
                <p className="text-white/70 text-center max-w-sm mx-auto">
                  E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
                </p>
              </motion.div>

              {/* Reset Form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8"
              >
                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">E-posta Adresi</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="ornek@email.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group relative px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Sıfırlama Bağlantısı Gönder</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link 
                    href="/auth/signin" 
                    className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Giriş sayfasına dön</span>
                  </Link>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 backdrop-blur-md rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent">
                    E-posta Gönderildi
                  </span>
                </h1>
                <p className="text-white/70 text-center max-w-sm mx-auto">
                  <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi. E-postanızı kontrol edin.
                </p>
              </motion.div>

              {/* Success Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8"
              >
                <div className="space-y-6">
                  <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                    <h3 className="font-semibold text-green-200 mb-2">Ne yapmalıyım?</h3>
                    <ul className="space-y-2 text-green-100 text-sm">
                      <li>• E-posta kutunuzu kontrol edin</li>
                      <li>• Spam klasörünü de kontrol etmeyi unutmayın</li>
                      <li>• E-postadaki bağlantıya tıklayın</li>
                      <li>• Yeni şifrenizi belirleyin</li>
                    </ul>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleTryAgain}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
                    >
                      Farklı E-posta ile Dene
                    </button>
                    
                    <Link 
                      href="/auth/signin"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium text-center inline-block"
                    >
                      Giriş Sayfasına Dön
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}