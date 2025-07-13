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
  XCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReservationService } from '../../lib/services/reservationService';
import { Reservation } from '../../types';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    activeTrips: 0,
    completedToday: 0,
    totalRevenue: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const reservationService = ReservationService.getInstance();
      const allReservations = await reservationService.getAllReservations();
      setReservations(allReservations);
      calculateStats(allReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Rezervasyonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reservations: Reservation[]) => {
    const today = new Date().toDateString();
    
    const stats = {
      totalReservations: reservations.length,
      pendingReservations: reservations.filter(r => r.status === 'pending').length,
      activeTrips: reservations.filter(r => r.status === 'started').length,
      completedToday: reservations.filter(r => 
        r.status === 'completed' && 
        new Date(r.completedAt || '').toDateString() === today
      ).length,
      totalRevenue: reservations
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.totalPrice, 0),
      todayRevenue: reservations
        .filter(r => 
          r.status === 'completed' && 
          new Date(r.completedAt || '').toDateString() === today
        )
        .reduce((sum, r) => sum + r.totalPrice, 0)
    };
    
    setStats(stats);
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'started': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <Users className="h-4 w-4" />;
      case 'started': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'assigned': return 'Atandı';
      case 'started': return 'Başladı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      default: return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">SBS Travel operasyon merkezi</p>
          </div>
          <Button onClick={loadReservations}>
            Yenile
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Rezervasyon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReservations}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Yolculuk</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTrips}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bugün Tamamlanan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bugün Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{stats.todayRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Son Rezervasyonlar</h2>
              <Button variant="outline" size="sm">
                Tümünü Gör
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                  {reservations.slice(0, 10).map((reservation) => (
                    <motion.tr
                      key={reservation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Müşteri #{reservation.id.slice(-6)}
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
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{reservation.from}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{reservation.to}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(reservation.date).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{getStatusText(reservation.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{reservation.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="outline" size="sm">
                          Detay
                        </Button>
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
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;