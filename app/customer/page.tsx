'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Award, 
  TrendingUp,
  Gift,
  Bell,
  Settings,
  CreditCard,
  History,
  Phone,
  Mail,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Sparkles,
  Crown,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerDashboard() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState({
    totalTrips: 24,
    totalSpent: 8450,
    loyaltyPoints: 1250,
    membershipLevel: 'Gold',
    avgRating: 4.8,
    savedAmount: 340
  });

  // Mock customer data
  const customerInfo = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet@email.com',
    phone: '+90 532 123 4567',
    memberSince: '2023-01-15',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
  };

  // Mock reservations
  const mockReservations = [
    {
      id: 'RES001',
      from: 'Antalya Havalimanı',
      to: 'Lara Beach Hotel',
      date: '2024-01-15',
      time: '14:30',
      status: 'completed',
      driver: 'Mehmet Şoför',
      vehicle: 'Mercedes E-Class',
      price: 280,
      rating: 5,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'RES002',
      from: 'Kemer Marina',
      to: 'Antalya Havalimanı',
      date: '2024-01-20',
      time: '16:00',
      status: 'started',
      driver: 'Ali Şoför',
      vehicle: 'BMW X5',
      price: 320,
      createdAt: new Date('2024-01-20')
    },
    {
      id: 'RES003',
      from: 'Side Antik Tiyatro',
      to: 'Belek Golf Resort',
      date: '2024-01-25',
      time: '18:15',
      status: 'pending',
      vehicle: 'Audi A6',
      price: 180,
      createdAt: new Date('2024-01-25')
    }
  ];

  useEffect(() => {
    setReservations(mockReservations);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'started': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'started': return <Car className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'started': return 'Başladı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      default: return 'Bilinmiyor';
    }
  };

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'Gold': return 'from-yellow-400 to-orange-500';
      case 'Silver': return 'from-gray-400 to-gray-600';
      case 'Bronze': return 'from-orange-600 to-red-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const getMembershipIcon = (level: string) => {
    switch (level) {
      case 'Gold': return Crown;
      case 'Silver': return Award;
      case 'Bronze': return Star;
      default: return User;
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
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm">Hoş geldiniz</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/customer" className="text-white font-medium">Dashboard</Link>
              <Link href="/customer/profile" className="text-white/70 hover:text-white font-medium transition-colors">Profil</Link>
              <Link href="/reservation" className="text-white/70 hover:text-white font-medium transition-colors">Yeni Rezervasyon</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={customerInfo.avatar} 
                  alt={customerInfo.name}
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                />
                <span className="text-white font-medium">{customerInfo.name}</span>
              </div>
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
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-white/90 text-sm">Premium Üye</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Hoş geldiniz, {customerInfo.name.split(' ')[0]}!
              </span>
            </h1>
            <p className="text-white/70 text-lg">Transfer geçmişiniz ve hesap bilgileriniz</p>
          </motion.div>
        </div>

        {/* Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className={`bg-gradient-to-r ${getMembershipColor(customerStats.membershipLevel)} rounded-3xl p-8 text-white shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                  {React.createElement(getMembershipIcon(customerStats.membershipLevel), { className: "h-8 w-8" })}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{customerStats.membershipLevel} Üyelik</h3>
                  <p className="opacity-90">Üye olma tarihi: {new Date(customerInfo.memberSince).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{customerStats.loyaltyPoints}</p>
                <p className="opacity-90">Sadakat Puanı</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {[
            {
              title: 'Toplam Yolculuk',
              value: customerStats.totalTrips,
              icon: Car,
              gradient: 'from-blue-500 to-blue-600',
              change: '+3 bu ay'
            },
            {
              title: 'Toplam Harcama',
              value: `₺${customerStats.totalSpent}`,
              icon: CreditCard,
              gradient: 'from-green-500 to-green-600',
              change: '+₺450 bu ay'
            },
            {
              title: 'Sadakat Puanı',
              value: customerStats.loyaltyPoints,
              icon: Gift,
              gradient: 'from-yellow-500 to-orange-600',
              change: '+125 puan'
            },
            {
              title: 'Ortalama Puan',
              value: customerStats.avgRating,
              icon: Star,
              gradient: 'from-purple-500 to-pink-600',
              change: 'Mükemmel'
            },
            {
              title: 'Tasarruf',
              value: `₺${customerStats.savedAmount}`,
              icon: Target,
              gradient: 'from-indigo-500 to-purple-600',
              change: 'Bu yıl'
            },
            {
              title: 'Üyelik Seviyesi',
              value: customerStats.membershipLevel,
              icon: Crown,
              gradient: 'from-teal-500 to-cyan-600',
              change: 'Premium'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-green-400 text-xs font-medium">
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: 'Yeni Rezervasyon',
              description: 'Hemen transfer rezervasyonu yapın',
              icon: Plus,
              gradient: 'from-blue-500 to-blue-600',
              href: '/reservation'
            },
            {
              title: 'Profil Ayarları',
              description: 'Hesap bilgilerinizi güncelleyin',
              icon: Settings,
              gradient: 'from-green-500 to-green-600',
              href: '/customer/profile'
            },
            {
              title: 'Geçmiş Yolculuklar',
              description: 'Tüm transfer geçmişinizi görün',
              icon: History,
              gradient: 'from-purple-500 to-purple-600',
              href: '#history'
            },
            {
              title: 'Destek',
              description: '7/24 müşteri desteği',
              icon: Phone,
              gradient: 'from-orange-500 to-red-600',
              href: 'tel:+905321234567'
            }
          ].map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer group h-full">
                <div className="text-center">
                  <div className={`bg-gradient-to-r ${action.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{action.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Recent Reservations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20"
          id="history"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <History className="h-7 w-7 text-blue-400" />
                <span>Son Rezervasyonlar</span>
              </h2>
              <Link 
                href="/reservation" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Rezervasyon</span>
              </Link>
            </div>

            <div className="space-y-4">
              {reservations.map((reservation, index) => (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">#{reservation.id}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{getStatusText(reservation.status)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        ₺{reservation.price}
                      </p>
                      {reservation.rating && (
                        <div className="flex items-center space-x-1 justify-end">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < reservation.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Güzergah</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-white/80 text-sm">{reservation.from}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-white/80 text-sm">{reservation.to}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">Tarih & Saat</h4>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-white/60" />
                          <span className="text-white/80 text-sm">{new Date(reservation.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-white/60" />
                          <span className="text-white/80 text-sm">{reservation.time}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">Araç & Şoför</h4>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 text-white/60" />
                          <span className="text-white/80 text-sm">{reservation.vehicle}</span>
                        </div>
                        {reservation.driver && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-white/60" />
                            <span className="text-white/80 text-sm">{reservation.driver}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Detay</span>
                    </button>
                    <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Fatura</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {reservations.length === 0 && (
              <div className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-white/40" />
                <h3 className="mt-2 text-sm font-medium text-white">Henüz rezervasyon yok</h3>
                <p className="mt-1 text-sm text-white/60">
                  İlk rezervasyonunuzu yapmak için butona tıklayın.
                </p>
                <div className="mt-6">
                  <Link 
                    href="/reservation"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Rezervasyon Yap</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}