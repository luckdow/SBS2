'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  Navigation,
  QrCode,
  CheckCircle,
  AlertCircle,
  Car,
  Calendar,
  User,
  Activity,
  Star,
  Route,
  Zap,
  Shield,
  Award,
  TrendingUp,
  DollarSign,
  Target,
  Camera,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import QRScanner from '../../components/ui/QRScanner';
import { realTimeReservationService } from '../../lib/services/realTimeService';
import { NotificationService } from '../../lib/services/notificationService';

export default function DriverPanel() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [driverStats, setDriverStats] = useState({
    todayTrips: 3,
    weeklyTrips: 18,
    monthlyEarnings: 12450,
    rating: 4.8,
    completionRate: 98.5,
    totalDistance: 1250
  });
  
  // Mock driver ID - In real app, this would come from authentication
  const driverId = 'driver-001';
  const driverInfo = {
    name: 'Ahmet Yılmaz',
    vehicle: 'Mercedes E-Class',
    plate: '34 ABC 123',
    phone: '+90 532 123 4567',
    rating: 4.8,
    totalTrips: 1247
  };

  // Mock reservations
  const mockReservations = [
    {
      id: 'RES001',
      firstName: 'Elif',
      lastName: 'Demir',
      from: 'Antalya Havalimanı Terminal 1',
      to: 'Lara Beach Resort & Spa',
      date: '2024-01-15',
      time: '14:30',
      passengers: 2,
      baggage: 3,
      phone: '+90 532 987 6543',
      email: 'elif@email.com',
      totalPrice: 280,
      status: 'assigned',
      vehicle: 'Konfor SUV',
      flightNumber: 'TK1234',
      specialRequests: 'Bebek koltuğu gerekli'
    },
    {
      id: 'RES002',
      firstName: 'Can',
      lastName: 'Özkan',
      from: 'Kemer Marina',
      to: 'Antalya Havalimanı Terminal 2',
      date: '2024-01-15',
      time: '16:00',
      passengers: 1,
      baggage: 1,
      phone: '+90 532 555 7788',
      email: 'can@email.com',
      totalPrice: 320,
      status: 'started',
      vehicle: 'Premium Van',
      flightNumber: 'PC2156'
    }
  ];

  useEffect(() => {
    loadDriverReservations();
    
    // Real-time listener for driver reservations
    const unsubscribe = realTimeReservationService.onReservationsChange((allReservations) => {
      const driverReservations = allReservations.filter(res => 
        res.driverId === driverId && 
        ['assigned', 'started'].includes(res.status)
      );
      setReservations(driverReservations);
      console.log('🚗 Driver panel received real-time update:', driverReservations.length, 'reservations for driver:', driverId);
    });
    
    return () => unsubscribe();
  }, []);

  const loadDriverReservations = async () => {
    try {
      setLoading(true);
      console.log('🚗 Loading driver reservations for:', driverId);
      const driverReservations = await realTimeReservationService.getDriverReservations(driverId);
      setReservations(driverReservations);
      console.log('✅ Driver reservations loaded:', driverReservations.length);
    } catch (error) {
      console.error('Error loading driver reservations:', error);
      // Fallback to mock data
      setReservations(mockReservations);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async (reservationId: string) => {
    try {
      console.log('🚀 Starting trip:', reservationId);
      await realTimeReservationService.updateStatus(reservationId, 'started');
      toast.success('🚗 Yolculuk başlatıldı!');
    } catch (error) {
      toast.error('❌ Yolculuk başlatılırken hata oluştu.');
      console.error('Start trip error:', error);
    }
  };

  const handleCompleteTrip = async (reservationId: string) => {
    try {
      console.log('✅ Completing trip:', reservationId);
      await realTimeReservationService.updateStatus(reservationId, 'completed');
      setDriverStats(prev => ({ ...prev, todayTrips: prev.todayTrips + 1 }));
      
      // Send completion notification
      await NotificationService.sendCustomerNotification(
        'customer1', 
        'Yolculuğunuz tamamlandı. Teşekkür ederiz!'
      );
      
      toast.success('✅ Yolculuk tamamlandı!');
    } catch (error) {
      toast.error('❌ Yolculuk tamamlanırken hata oluştu.');
      console.error('Complete trip error:', error);
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      const reservationId = qrData.reservationId;
      
      console.log('📱 QR Code scanned:', qrData);
      
      // Find and start the trip
      const reservation = reservations.find(res => res.id === reservationId);
      if (reservation) {
        handleStartTrip(reservationId);
        toast.success(`🎉 QR kod başarıyla okundu! ${reservation.firstName} ${reservation.lastName} için yolculuk başlatıldı.`);
      } else {
        toast.error('❌ Geçersiz QR kod!');
      }
    } catch (error) {
      toast.error('❌ QR kod okunamadı!');
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'started': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Atandı';
      case 'started': return 'Başladı';
      default: return 'Bilinmiyor';
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
              <Link href="/" className="text-white/60 hover:text-white/80 transition-colors">
                ← Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Görevlerim</h1>
            </div>
            <p className="text-white/70 text-lg">Size atanan transfer görevleri</p>
          </motion.div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowQRScanner(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <QrCode className="h-5 w-5" />
              <span>QR Kod Oku</span>
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
              <Navigation className="h-5 w-5" />
              <span>Navigasyon</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {[
            {
              title: 'Bugün Yolculuk',
              value: driverStats.todayTrips,
              icon: Car,
              gradient: 'from-blue-500 to-blue-600',
              change: '+2'
            },
            {
              title: 'Haftalık Yolculuk',
              value: driverStats.weeklyTrips,
              icon: Calendar,
              gradient: 'from-green-500 to-green-600',
              change: '+5'
            },
            {
              title: 'Aylık Kazanç',
              value: `₺${driverStats.monthlyEarnings}`,
              icon: DollarSign,
              gradient: 'from-yellow-500 to-orange-600',
              change: '+12%'
            },
            {
              title: 'Puan Ortalaması',
              value: driverStats.rating,
              icon: Star,
              gradient: 'from-purple-500 to-pink-600',
              change: '+0.1'
            },
            {
              title: 'Tamamlama Oranı',
              value: `${driverStats.completionRate}%`,
              icon: Target,
              gradient: 'from-indigo-500 to-purple-600',
              change: '+1.2%'
            },
            {
              title: 'Toplam Mesafe',
              value: `${driverStats.totalDistance} km`,
              icon: Route,
              gradient: 'from-teal-500 to-cyan-600',
              change: '+85 km'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-green-400 text-sm font-medium">
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

        {/* Reservations List */}
        <div className="space-y-6">
          {reservations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-12 text-center"
            >
              <Car className="mx-auto h-16 w-16 text-white/40 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Henüz görev yok</h3>
              <p className="text-white/70">
                Size atanan görevler burada görünecek.
              </p>
            </motion.div>
          ) : (
            reservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">#{reservation.id}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-md ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                      ₺{reservation.totalPrice}
                    </p>
                    <p className="text-sm text-white/60">Toplam Ücret</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                  {/* Route Info */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-white text-lg mb-4 flex items-center space-x-2">
                        <Route className="h-5 w-5" />
                        <span>Güzergah</span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-white font-medium">{reservation.from}</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="w-px h-8 bg-white/30"></div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-white font-medium">{reservation.to}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-white/60 mb-1">Tarih</p>
                        <p className="text-sm font-semibold text-white">{new Date(reservation.date).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-white/60 mb-1">Saat</p>
                        <p className="text-sm font-semibold text-white">{reservation.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-white text-lg mb-4 flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Müşteri Bilgileri</span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                          <User className="h-5 w-5 text-white/60" />
                          <span className="text-white font-medium">
                            {reservation.firstName} {reservation.lastName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                          <Phone className="h-5 w-5 text-white/60" />
                          <a href={`tel:${reservation.phone}`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            {reservation.phone}
                          </a>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                          <Users className="h-5 w-5 text-white/60" />
                          <span className="text-white">
                            {reservation.passengers} yolcu, {reservation.baggage} bagaj
                          </span>
                        </div>
                        {reservation.flightNumber && (
                          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                            <Calendar className="h-5 w-5 text-white/60" />
                            <span className="text-white">Uçuş: {reservation.flightNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {reservation.specialRequests && (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                        <h5 className="font-semibold text-yellow-200 mb-2">Özel İstekler</h5>
                        <p className="text-yellow-100 text-sm">{reservation.specialRequests}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium flex items-center justify-center space-x-2">
                    <Navigation className="h-5 w-5" />
                    <span>Navigasyon</span>
                  </button>
                  
                  <button className="flex-1 bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium flex items-center justify-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Müşteriyi Ara</span>
                  </button>
                  
                  {reservation.status === 'assigned' && (
                    <button 
                      onClick={() => handleStartTrip(reservation.id)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <Zap className="h-5 w-5" />
                      <span>Yolculuğu Başlat</span>
                    </button>
                  )}
                  
                  {reservation.status === 'started' && (
                    <button 
                      onClick={() => handleCompleteTrip(reservation.id)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Yolculuğu Tamamla</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />
    </div>
  );
}