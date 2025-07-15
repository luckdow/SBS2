'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Car, 
  Calendar, 
  TrendingUp, 
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserCheck,
  Eye,
  Plus,
  Filter,
  Search,
  Settings,
  Bell,
  DollarSign,
  Activity,
  Zap,
  Shield,
  Star,
  Navigation,
  QrCode,
  Sparkles,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Database
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { realTimeReservationService, realTimeDriverService } from '../../lib/services/realTimeService';
import { NotificationService } from '../../lib/services/notificationService';
import ErrorBoundary from '../../components/common/ErrorBoundary';

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    totalReservations: 24,
    pendingReservations: 8,
    activeTrips: 5,
    completedToday: 12,
    totalRevenue: 45680,
    todayRevenue: 3240,
    avgRating: 4.8,
    activeDrivers: 15
  });

  // Add isMounted ref to prevent state updates on unmounted components
  const isMountedRef = useRef(true);

  // Mock data
  const mockReservations = [
    {
      id: 'RES001',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      from: 'Antalya Havalimanı',
      to: 'Lara Beach Hotel',
      date: '2024-01-15',
      time: '14:30',
      passengers: 2,
      baggage: 3,
      phone: '+90 532 123 4567',
      email: 'ahmet@email.com',
      totalPrice: 280,
      status: 'pending',
      vehicle: 'Konfor SUV',
      createdAt: new Date()
    },
    {
      id: 'RES002',
      firstName: 'Elif',
      lastName: 'Demir',
      from: 'Kemer Marina',
      to: 'Antalya Havalimanı',
      date: '2024-01-15',
      time: '16:00',
      passengers: 4,
      baggage: 2,
      phone: '+90 532 987 6543',
      email: 'elif@email.com',
      totalPrice: 320,
      status: 'assigned',
      vehicle: 'Premium Van',
      assignedDriver: 'Mehmet Şoför',
      createdAt: new Date()
    },
    {
      id: 'RES003',
      firstName: 'Can',
      lastName: 'Özkan',
      from: 'Side Antik Tiyatro',
      to: 'Belek Golf Resort',
      date: '2024-01-15',
      time: '18:15',
      passengers: 1,
      baggage: 1,
      phone: '+90 532 555 7788',
      email: 'can@email.com',
      totalPrice: 180,
      status: 'started',
      vehicle: 'Ekonomi Sedan',
      assignedDriver: 'Ali Şoför',
      createdAt: new Date()
    }
  ];

  const mockDrivers = [
    { id: '1', name: 'Mehmet Şoför', phone: '+90 532 111 2233', vehicleType: 'SUV', isActive: true, rating: 4.9 },
    { id: '2', name: 'Ali Şoför', phone: '+90 532 444 5566', vehicleType: 'Sedan', isActive: true, rating: 4.7 },
    { id: '3', name: 'Hasan Şoför', phone: '+90 532 777 8899', vehicleType: 'Van', isActive: true, rating: 4.8 }
  ];

  useEffect(() => {
    isMountedRef.current = true;
    loadData();
    
    // Real-time reservations listener with error handling
    const unsubscribe = realTimeReservationService.onReservationsChange((newReservations) => {
      if (isMountedRef.current) {
        setReservations(newReservations);
        console.log('📊 Admin panel received real-time update:', newReservations.length, 'reservations');
      }
    });
    
    return () => {
      isMountedRef.current = false;
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing from reservations (non-critical):', error);
      }
    };
  }, []);

  const loadData = async () => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      console.log('📊 Loading admin data...');
      const [reservationsData, driversData] = await Promise.all([
        realTimeReservationService.getAll(),
        realTimeDriverService.getAll()
      ]);
      
      if (isMountedRef.current) {
        setReservations(reservationsData);
        setDrivers(driversData);
        console.log('✅ Admin data loaded:', reservationsData.length, 'reservations,', driversData.length, 'drivers');
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Veriler yüklenirken hata oluştu');
      }
      console.error('Error loading data:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    if (!selectedReservation || !isMountedRef.current) return;
    
    try {
      console.log('👨‍💼 Assigning driver:', driverId, 'to reservation:', selectedReservation.id);
      
      // Update reservation with real-time service
      await realTimeReservationService.assignDriver(selectedReservation.id, driverId);
      
      // Send notification to driver
      const driver = drivers.find(d => d.id === driverId);
      if (driver && isMountedRef.current) {
        console.log('📱 Sending notification to driver:', driver.name);
        await NotificationService.sendDriverNotification(driverId, selectedReservation);
        
        // Send customer notification with driver info
        await NotificationService.sendCustomerNotification(
          selectedReservation.customerId || 'customer1',
          `Şoförünüz atandı: ${driver.name} - ${driver.phone}`
        );
      }
      
      if (isMountedRef.current) {
        setShowAssignModal(false);
        setSelectedReservation(null);
        toast.success('🎉 Şoför başarıyla atandı ve bildirim gönderildi!');
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('❌ Şoför atanırken hata oluştu.');
      }
      console.error('Driver assignment error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'started': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <UserCheck className="h-4 w-4" />;
      case 'started': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'assigned': return 'Atandı';
      case 'started': return 'Başladı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <ErrorBoundary 
      onError={(error, errorInfo) => {
        console.error('Admin Dashboard Error:', error, errorInfo);
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Admin Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
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
                  <p className="text-xs text-blue-200">Admin Panel</p>
                </div>
              </Link>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm">Canlı Veri</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/admin" className="text-white font-medium">Dashboard</Link>
              <Link href="/admin/reservations" className="text-white/70 hover:text-white font-medium transition-colors">Rezervasyonlar</Link>
              <Link href="/admin/vehicles" className="text-white/70 hover:text-white font-medium transition-colors">Araçlar</Link>
              <Link href="/admin/drivers" className="text-white/70 hover:text-white font-medium transition-colors">Şoförler</Link>
              <Link href="/admin/financial" className="text-white/70 hover:text-white font-medium transition-colors">Finansal</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-white/80 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <button className="text-white/80 hover:text-white font-medium transition-colors">
                Admin User
              </button>
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
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-white/70 text-lg">SBS Travel operasyon merkezi</p>
          </motion.div>
          <div className="flex space-x-3">
            <Link href="/admin/seed" className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Veritabanını Sıfırla</span>
            </Link>
            <Link href="/reservation" className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Yeni Rezervasyon</span>
            </Link>
            <Link href="/admin/settings" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Ayarlar</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Toplam Rezervasyon',
              value: stats.totalReservations,
              icon: Calendar,
              gradient: 'from-blue-500 to-blue-600',
              change: '+12%',
              changeType: 'up'
            },
            {
              title: 'Bekleyen',
              value: stats.pendingReservations,
              icon: Clock,
              gradient: 'from-yellow-500 to-orange-600',
              change: '+5%',
              changeType: 'up'
            },
            {
              title: 'Aktif Yolculuk',
              value: stats.activeTrips,
              icon: Activity,
              gradient: 'from-green-500 to-green-600',
              change: '+8%',
              changeType: 'up'
            },
            {
              title: 'Bugün Tamamlanan',
              value: stats.completedToday,
              icon: CheckCircle,
              gradient: 'from-purple-500 to-purple-600',
              change: '+15%',
              changeType: 'up'
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
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.changeType === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.changeType === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Toplam Gelir',
              value: `₺${stats.totalRevenue.toLocaleString()}`,
              icon: DollarSign,
              gradient: 'from-green-500 to-teal-600',
              change: '+18%',
              changeType: 'up'
            },
            {
              title: 'Bugün Gelir',
              value: `₺${stats.todayRevenue.toLocaleString()}`,
              icon: TrendingUp,
              gradient: 'from-blue-500 to-indigo-600',
              change: '+22%',
              changeType: 'up'
            },
            {
              title: 'Ortalama Puan',
              value: stats.avgRating,
              icon: Star,
              gradient: 'from-yellow-500 to-orange-600',
              change: '+0.2',
              changeType: 'up'
            },
            {
              title: 'Aktif Şoförler',
              value: stats.activeDrivers,
              icon: Users,
              gradient: 'from-purple-500 to-pink-600',
              change: '+3',
              changeType: 'up'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.changeType === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.changeType === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
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
              title: 'Rezervasyon Yönetimi',
              description: 'Tüm rezervasyonları görüntüle ve yönet',
              icon: Calendar,
              gradient: 'from-blue-500 to-blue-600',
              href: '/admin/reservations'
            },
            {
              title: 'Araç Yönetimi',
              description: 'Araç fiyat ve özelliklerini düzenle',
              icon: Car,
              gradient: 'from-green-500 to-green-600',
              href: '/admin/vehicles'
            },
            {
              title: 'Şoför Yönetimi',
              description: 'Şoför profilleri ve atamaları',
              icon: UserCheck,
              gradient: 'from-purple-500 to-purple-600',
              href: '/admin/drivers'
            },
            {
              title: 'Finansal Rapor',
              description: 'Gelir ve komisyon takibi',
              icon: TrendingUp,
              gradient: 'from-orange-500 to-red-600',
              href: '/admin/financial'
            }
          ].map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer group">
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
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <Sparkles className="h-7 w-7 text-yellow-400" />
                <span>Son Rezervasyonlar</span>
              </h2>
              <div className="flex space-x-3">
                <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtrele</span>
                </button>
                <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Ara</span>
                </button>
                <Link href="/admin/reservations" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                  Tümünü Gör
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Rezervasyon
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Güzergah
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Tarih/Saat
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {reservations.map((reservation, index) => (
                    <motion.tr
                      key={reservation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          #{reservation.id}
                        </div>
                        <div className="text-sm text-white/60">
                          {new Date(reservation.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {reservation.firstName} {reservation.lastName}
                            </div>
                            <div className="text-sm text-white/60">
                              {reservation.passengers} kişi
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          <div className="flex items-center space-x-1 mb-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="truncate max-w-32">{reservation.from}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="truncate max-w-32">{reservation.to}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          <div className="flex items-center space-x-1 mb-1">
                            <Calendar className="h-4 w-4 text-white/60" />
                            <span>{new Date(reservation.date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-white/60" />
                            <span>{reservation.time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{getStatusText(reservation.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                          ₺{reservation.totalPrice.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowDetailsModal(true);
                          }}
                          className="bg-white/10 backdrop-blur-md border border-white/30 text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {reservation.status === 'pending' && (
                          <button 
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowAssignModal(true);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reservations.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-white/40" />
                <h3 className="mt-2 text-sm font-medium text-white">Henüz rezervasyon yok</h3>
                <p className="mt-1 text-sm text-white/60">
                  Yeni rezervasyonlar burada görünecek.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Driver Assignment Modal */}
        <AnimatePresence>
          {showAssignModal && selectedReservation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6 max-w-md w-full mx-4"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <UserCheck className="h-6 w-6" />
                  <span>Şoför Ata - #{selectedReservation.id}</span>
                </h3>
                
                <div className="space-y-3 mb-6">
                  {drivers.filter(d => d.isActive).map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleAssignDriver(driver.id)}
                      className="w-full text-left p-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white/20 hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{driver.name}</div>
                          <div className="text-sm text-white/70">{driver.phone}</div>
                          <div className="text-xs text-white/60">{driver.vehicleType}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm">{driver.rating}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedReservation(null);
                    }}
                    className="flex-1 bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-300"
                  >
                    İptal
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reservation Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedReservation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Eye className="h-6 w-6" />
                    <span>Rezervasyon Detayları - #{selectedReservation.id}</span>
                  </h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedReservation(null);
                    }}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Müşteri Bilgileri</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">Ad Soyad</p>
                            <p className="text-white/70">{selectedReservation.firstName} {selectedReservation.lastName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-green-400" />
                          <div>
                            <p className="text-white font-medium">Telefon</p>
                            <p className="text-white/70">{selectedReservation.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-yellow-400" />
                          <div>
                            <p className="text-white font-medium">E-posta</p>
                            <p className="text-white/70">{selectedReservation.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Yolculuk Bilgileri</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-green-400" />
                          <div>
                            <p className="text-white font-medium">Nereden</p>
                            <p className="text-white/70">{selectedReservation.from}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-red-400" />
                          <div>
                            <p className="text-white font-medium">Nereye</p>
                            <p className="text-white/70">{selectedReservation.to}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">Tarih & Saat</p>
                            <p className="text-white/70">{selectedReservation.date} - {selectedReservation.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-purple-400" />
                          <div>
                            <p className="text-white font-medium">Yolcu & Bagaj</p>
                            <p className="text-white/70">{selectedReservation.passengers} yolcu, {selectedReservation.baggage} bagaj</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle and Price Information */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Araç ve Fiyat Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-white font-medium">Seçilen Araç</p>
                        <p className="text-white/70">{selectedReservation.vehicle}</p>
                      </div>
                      <div>
                        <p className="text-white font-medium">Toplam Tutar</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                          ₺{selectedReservation.totalPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Driver */}
                  {selectedReservation.assignedDriver && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Atanan Şoför</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{selectedReservation.assignedDriver}</p>
                          <p className="text-white/70">Atanmış Şoför</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </ErrorBoundary>
  );
}