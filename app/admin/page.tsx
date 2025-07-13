'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Search
} from 'lucide-react';
import Link from 'next/link';
import { reservationService, driverService, type Reservation, type Driver } from '../../lib/services/reservationService';
import toast from 'react-hot-toast';
import { seedAllData } from '../../lib/seedData';

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    activeTrips: 0,
    completedToday: 0,
    totalRevenue: 0,
    todayRevenue: 0
  });


  useEffect(() => {
    // Load initial data
    seedAllData(); // Seed initial data
    loadDrivers();
    
    // Set up real-time listener for reservations
    const unsubscribe = reservationService.onReservationsChange((newReservations) => {
      setReservations(newReservations);
      updateStats(newReservations);
    });

    return () => unsubscribe();
  }, []);

  const loadDrivers = async () => {
    try {
      const driversData = await driverService.getDrivers();
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const updateStats = (reservations: Reservation[]) => {
    const today = new Date().toDateString();
    
    const stats = {
      totalReservations: reservations.length,
      pendingReservations: reservations.filter(r => r.status === 'pending').length,
      activeTrips: reservations.filter(r => r.status === 'started').length,
      completedToday: reservations.filter(r => 
        r.status === 'completed' && 
        new Date(r.createdAt.toDate()).toDateString() === today
      ).length,
      totalRevenue: reservations
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.totalPrice, 0),
      todayRevenue: reservations
        .filter(r => 
          r.status === 'completed' && 
          new Date(r.createdAt.toDate()).toDateString() === today
        )
        .reduce((sum, r) => sum + r.totalPrice, 0)
    };
    
    setStats(stats);
  };

  const handleAssignDriver = async (driverId: string) => {
    if (!selectedReservation) return;
    
    try {
      await reservationService.updateReservationStatus(
        selectedReservation.id!,
        'assigned',
        driverId
      );
      
      setShowAssignModal(false);
      setSelectedReservation(null);
      toast.success('Şoför başarıyla atandı!');
    } catch (error) {
      toast.error('Şoför atanırken hata oluştu.');
      console.error('Error assigning driver:', error);
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
      case 'started': return <CheckCircle className="h-4 w-4" />;
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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SBS TRAVEL</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Canlı Veri</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/admin" className="text-blue-600 font-medium">Dashboard</Link>
              <Link href="/admin/reservations" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Rezervasyonlar</Link>
              <Link href="/admin/vehicles" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Araçlar</Link>
              <Link href="/admin/drivers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Şoförler</Link>
              <Link href="/admin/financial" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Finansal</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Admin User
              </button>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">SBS Travel operasyon merkezi</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Rezervasyon
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Rezervasyon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Yolculuk</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bugün Tamamlanan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bugün Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{stats.todayRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/reservations" className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Rezervasyon Yönetimi</h3>
              <p className="text-sm text-gray-600 mt-1">Tüm rezervasyonları görüntüle</p>
            </div>
          </Link>

          <Link href="/admin/vehicles" className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <Car className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Araç Yönetimi</h3>
              <p className="text-sm text-gray-600 mt-1">Araç fiyat ve özelliklerini düzenle</p>
            </div>
          </Link>

          <Link href="/admin/drivers" className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <UserCheck className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Şoför Yönetimi</h3>
              <p className="text-sm text-gray-600 mt-1">Şoför profilleri ve atamaları</p>
            </div>
          </Link>

          <Link href="/admin/financial" className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Finansal Rapor</h3>
              <p className="text-sm text-gray-600 mt-1">Gelir ve komisyon takibi</p>
            </div>
          </Link>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Son Rezervasyonlar</h2>
              <div className="flex space-x-3">
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </button>
                <Link href="/admin/reservations" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Tümünü Gör
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rezervasyon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Güzergah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih/Saat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <motion.tr
                      key={reservation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{reservation.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(reservation.createdAt.toDate()).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.firstName} {reservation.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.passengers} kişi
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span className="truncate max-w-32">{reservation.from}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="truncate max-w-32">{reservation.to}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(reservation.date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{reservation.time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{getStatusText(reservation.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₺{reservation.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        {reservation.status === 'pending' && (
                          <button 
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowAssignModal(true);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reservations.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz rezervasyon yok</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Yeni rezervasyonlar burada görünecek.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Driver Assignment Modal */}
        {showAssignModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Şoför Ata - #{selectedReservation.id}
              </h3>
              
              <div className="space-y-3 mb-6">
                {drivers.filter(d => d.isActive).map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleAssignDriver(driver.id!)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{driver.name}</div>
                    <div className="text-sm text-gray-600">{driver.phone}</div>
                    <div className="text-xs text-gray-500">{driver.vehicleType}</div>
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedReservation(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}