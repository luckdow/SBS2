'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  LogOut,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
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

  // Customer info from authenticated user
  const customerInfo = {
    name: user.displayName || 'Müşteri',
    email: user.email || '',
    avatar: user.photoURL || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    SBS TRAVEL
                  </h1>
                  <p className="text-xs text-blue-200">Müşteri Paneli</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={customerInfo.avatar} 
                  alt={customerInfo.name}
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                />
                <span className="text-white font-medium">{customerInfo.name}</span>
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
                Hoş geldiniz, {customerInfo.name.split(' ')[0]}!
              </span>
            </h1>
            <p className="text-white/70 text-lg">Transfer geçmişiniz ve hesap bilgileriniz</p>
          </motion.div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            <User className="h-16 w-16 text-white/60 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Müşteri Paneli</h2>
            <p className="text-white/70 mb-6">
              Bu panel geliştirilme aşamasındadır. Rezervasyon geçmişiniz ve hesap bilgileriniz burada görüntülenecek.
            </p>
            <Link 
              href="/reservation"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Yeni Rezervasyon Yap</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}