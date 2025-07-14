'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  Mail,
  Eye,
  UserCheck,
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Car,
  Star,
  Navigation,
  Plane
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DataTable from '../../../components/ui/DataTable';
import Modal from '../../../components/ui/Modal';
import { realTimeReservationService, realTimeDriverService } from '../../../lib/services/realTimeService';
import { Reservation, Driver } from '../../../lib/types';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservationsData, driversData] = await Promise.all([
        realTimeReservationService.getAll(),
        realTimeDriverService.getActiveDrivers()
      ]);
      setReservations(reservationsData);
      setDrivers(driversData);
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    if (!selectedReservation) return;
    
    try {
      await realTimeReservationService.assignDriver(selectedReservation.id, driverId);
      await loadData();
      setShowAssignModal(false);
      setSelectedReservation(null);
      toast.success('🎉 Şoför başarıyla atandı!');
    } catch (error) {
      toast.error('❌ Şoför atanırken hata oluştu.');
    }
  };

  const handleStatusUpdate = async (reservationId: string, status: Reservation['status']) => {
    try {
      await realTimeReservationService.update(reservationId, { status });
      await loadData();
      toast.success('✅ Durum güncellendi!');
    } catch (error) {
      toast.error('❌ Durum güncellenirken hata oluştu.');
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) return;
    
    try {
      await realTimeReservationService.delete(reservationId);
      await loadData();
      toast.success('🗑️ Rezervasyon silindi!');
    } catch (error) {
      toast.error('❌ Rezervasyon silinirken hata oluştu.');
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
      case 'started': return <Car className="h-4 w-4" />;
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

  const columns = [
    {
      key: 'id',
      title: 'Rezervasyon',
      render: (value: string, item: Reservation) => (
        <div>
          <div className="text-sm font-medium text-white">#{value}</div>
          <div className="text-sm text-white/60">
            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      title: 'Müşteri',
      render: (value: any, item: Reservation) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">
              {item.customer?.name || 'N/A'}
            </div>
            <div className="text-sm text-white/60">
              {item.passengers} kişi
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'route',
      title: 'Güzergah',
      render: (value: any, item: Reservation) => (
        <div className="text-sm text-white">
          <div className="flex items-center space-x-1 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="truncate max-w-32">{item.from}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="truncate max-w-32">{item.to}</span>
          </div>
        </div>
      )
    },
    {
      key: 'datetime',
      title: 'Tarih/Saat',
      render: (value: any, item: Reservation) => (
        <div className="text-sm text-white">
          <div className="flex items-center space-x-1 mb-1">
            <Calendar className="h-4 w-4 text-white/60" />
            <span>{new Date(item.date).toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-white/60" />
            <span>{item.time}</span>
          </div>
        </div>
      )
    },
    {
      key: 'flightNumber',
      title: 'Uçuş No',
      render: (value: string, item: Reservation) => (
        <div className="text-sm text-white">
          {item.flightNumber ? (
            <div className="flex items-center space-x-1">
              <Plane className="h-4 w-4 text-blue-400" />
              <span className="font-medium">{item.flightNumber}</span>
            </div>
          ) : (
            <span className="text-white/50">-</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Durum',
      render: (value: string) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${getStatusColor(value)}`}>
          {getStatusIcon(value)}
          <span className="ml-1">{getStatusText(value)}</span>
        </span>
      )
    },
    {
      key: 'totalPrice',
      title: 'Tutar',
      render: (value: number) => (
        <div className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          ₺{value.toLocaleString()}
        </div>
      )
    }
  ];

  const actions = (item: Reservation) => (
    <>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedReservation(item);
          setShowDetailsModal(true);
        }}
        className="bg-white/10 backdrop-blur-md border border-white/30 text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-300"
      >
        <Eye className="h-4 w-4" />
      </button>
      {item.status === 'pending' && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReservation(item);
            setShowAssignModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
        >
          <UserCheck className="h-4 w-4" />
        </button>
      )}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteReservation(item.id);
        }}
        className="bg-red-500/20 border border-red-500/50 text-red-400 p-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Rezervasyon Yönetimi
                </h1>
                <p className="text-xs text-blue-200">Tüm rezervasyonlar</p>
              </div>
            </Link>
            <Link href="/admin" className="text-white/60 hover:text-white/80 transition-colors">
              ← Admin Panel
            </Link>
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
            <h1 className="text-3xl font-bold text-white mb-2">Rezervasyon Yönetimi</h1>
            <p className="text-white/70 text-lg">Tüm rezervasyonları görüntüle ve yönet</p>
          </motion.div>
          
          <div className="flex space-x-3">
            <Link 
              href="/reservation"
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Rezervasyon</span>
            </Link>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={reservations}
          columns={columns}
          actions={actions}
          loading={loading}
          onRowClick={(item) => {
            setSelectedReservation(item);
            setShowDetailsModal(true);
          }}
        />

        {/* Driver Assignment Modal */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedReservation(null);
          }}
          title={`Şoför Ata - #${selectedReservation?.id}`}
        >
          <div className="space-y-4">
            {drivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => handleAssignDriver(driver.id)}
                className="w-full text-left p-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white/20 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{driver.name}</div>
                    <div className="text-sm text-white/70">{driver.phone}</div>
                    <div className="text-xs text-white/60">{driver.vehicleType} • {driver.vehiclePlate}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm">{driver.rating}</span>
                    </div>
                    <div className="text-xs text-white/60">{driver.totalTrips} yolculuk</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Modal>

        {/* Reservation Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedReservation(null);
          }}
          title={`Rezervasyon Detayları - #${selectedReservation?.id}`}
          size="lg"
        >
          {selectedReservation && (
            <div className="space-y-6">
              {/* Status Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedReservation.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReservation.id, 'assigned')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Onayla
                  </button>
                )}
                {selectedReservation.status === 'assigned' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReservation.id, 'started')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Başlat
                  </button>
                )}
                {selectedReservation.status === 'started' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReservation.id, 'completed')}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Tamamla
                  </button>
                )}
                <button
                  onClick={() => handleStatusUpdate(selectedReservation.id, 'cancelled')}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  İptal Et
                </button>
              </div>

              {/* Reservation Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Yolculuk Bilgileri</h3>
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
                        <p className="text-white/70">
                          {new Date(selectedReservation.date).toLocaleDateString('tr-TR')} - {selectedReservation.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Yolcu & Bagaj</p>
                        <p className="text-white/70">
                          {selectedReservation.passengers} yolcu, {selectedReservation.baggage} bagaj
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Müşteri Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Ad Soyad</p>
                        <p className="text-white/70">{selectedReservation.customer?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Telefon</p>
                        <p className="text-white/70">{selectedReservation.customer?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">E-posta</p>
                        <p className="text-white/70">{selectedReservation.customer?.email || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedReservation.flightNumber && (
                      <div className="flex items-center space-x-3">
                        <Plane className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Uçuş Numarası</p>
                          <p className="text-white/70">{selectedReservation.flightNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Fiyat Detayı</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-white/80">
                    <span>Araç kirası ({selectedReservation.distance} km)</span>
                    <span>₺{selectedReservation.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Ek hizmetler</span>
                    <span>₺{selectedReservation.servicesPrice}</span>
                  </div>
                  <div className="border-t border-white/20 pt-2 flex justify-between font-bold text-lg">
                    <span className="text-white">Toplam</span>
                    <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                      ₺{selectedReservation.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}