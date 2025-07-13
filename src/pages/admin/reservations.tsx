import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  UserCheck, 
  MapPin,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ReservationService } from '../../lib/services/reservationService';
import { Reservation } from '../../types';
import toast from 'react-hot-toast';

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, statusFilter]);

  const loadReservations = async () => {
    try {
      const reservationService = ReservationService.getInstance();
      const allReservations = await reservationService.getAllReservations();
      setReservations(allReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Rezervasyonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = reservations;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReservations(filtered);
  };

  const assignDriver = async (reservationId: string) => {
    try {
      const reservationService = ReservationService.getInstance();
      // Mock driver assignment - in real app, you'd select from available drivers
      await reservationService.assignDriverToReservation(reservationId, 'mock-driver-id');
      toast.success('Şoför atandı!');
      loadReservations();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Şoför atanırken hata oluştu');
    }
  };

  const updateStatus = async (reservationId: string, newStatus: Reservation['status']) => {
    try {
      const reservationService = ReservationService.getInstance();
      await reservationService.updateReservationStatus(reservationId, newStatus);
      toast.success('Durum güncellendi!');
      loadReservations();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Durum güncellenirken hata oluştu');
    }
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
      case 'assigned': return <UserCheck className="h-4 w-4" />;
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
            <h1 className="text-2xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
            <p className="text-gray-600">Tüm rezervasyonları görüntüle ve yönet</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button onClick={loadReservations}>
              Yenile
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Rezervasyon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-5 w-5 text-gray-400" />}
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="assigned">Atandı</option>
              <option value="started">Başladı</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal</option>
            </select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Gelişmiş Filtre
            </Button>
          </div>
        </Card>

        {/* Reservations Table */}
        <Card>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rezervasyon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Güzergah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih/Saat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yolcu
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
                  {filteredReservations.map((reservation) => (
                    <motion.tr
                      key={reservation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{reservation.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(reservation.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1 mb-1">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span className="truncate max-w-32">{reservation.from}</span>
                          </div>
                          <div className="flex items-center space-x-1">
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
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{reservation.passengers} kişi</span>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {reservation.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => assignDriver(reservation.id)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReservations.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Rezervasyon bulunamadı</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Arama kriterlerinizi değiştirmeyi deneyin.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Reservation Detail Modal */}
        {showModal && selectedReservation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Rezervasyon Detayı #{selectedReservation.id.slice(-8)}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Yolculuk Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-green-500" />
                          <span>{selectedReservation.from}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span>{selectedReservation.to}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(selectedReservation.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{selectedReservation.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{selectedReservation.passengers} yolcu, {selectedReservation.baggage} bagaj</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Fiyat Detayı</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Araç kirası:</span>
                          <span>₺{selectedReservation.basePrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ek hizmetler:</span>
                          <span>₺{selectedReservation.servicesPrice}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Toplam:</span>
                          <span>₺{selectedReservation.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Durum</h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedReservation.status)}`}>
                        {getStatusIcon(selectedReservation.status)}
                        <span className="ml-2">{getStatusText(selectedReservation.status)}</span>
                      </span>
                    </div>

                    {selectedReservation.flightNumber && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Uçuş Bilgisi</h4>
                        <p className="text-sm text-gray-600">{selectedReservation.flightNumber}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">QR Kod</h4>
                      <div className="bg-white p-2 border rounded-lg inline-block">
                        <img src={selectedReservation.qrCode} alt="QR Code" className="w-24 h-24" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Kapat
                  </Button>
                  {selectedReservation.status === 'pending' && (
                    <Button onClick={() => assignDriver(selectedReservation.id)}>
                      Şoför Ata
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReservationsPage;