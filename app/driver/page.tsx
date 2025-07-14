'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car,
  LogOut,
  Loader2,
  Star,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DriverPanel() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Başarıyla çıkış yapıldı');
      router.push('/');
    } catch (error) {
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }
  
  // Driver info from authenticated user
  const driverInfo = {
    name: user.displayName || 'Şoför',
    vehicle: 'Mercedes E-Class', // This would come from user profile
    plate: '34 ABC 123', // This would come from user profile
    rating: 4.8
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Driver Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    SBS TRAVEL
                  </h1>
                  <p className="text-xs text-blue-200">Şoför Paneli</p>
                </div>
              </Link>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm">Aktif</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{driverInfo.name}</p>
                <p className="text-xs text-white/70">{driverInfo.plate} • {driverInfo.vehicle}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-white text-sm font-medium">{driverInfo.rating}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-white/60 hover:text-white/80 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Çıkış</span>
              </button>
              <Link href="/" className="text-white/60 hover:text-white/80 transition-colors">
                ← Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Hoş geldiniz, {driverInfo.name.split(' ')[0]}!
              </span>
            </h1>
            <p className="text-white/70 text-lg">Şoför paneline hoş geldiniz</p>
          </motion.div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            <Car className="h-16 w-16 text-white/60 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Şoför Paneli</h2>
            <p className="text-white/70 mb-6">
              Bu panel geliştirilme aşamasındadır. Rezervasyon geçmişiniz ve istatistikleriniz burada görüntülenecek.
            </p>
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
              <p className="text-green-200 text-sm">
                ✅ Hesabınız başarıyla doğrulandı ve şoför olarak giriş yaptınız
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}