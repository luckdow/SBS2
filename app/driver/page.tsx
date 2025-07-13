'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  User
} from 'lucide-react';
import Link from 'next/link';
import { reservationService, type Reservation } from '../../lib/services/reservationService';
import toast from 'react-hot-toast';

export default function DriverPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // Mock driver ID - In real app, this would come from authentication
  const driverId = 'driver-001';

  useEffect(() => {
    loadDriverReservations();
  }, []);

  const loadDriverReservations = async () => {
    try {
      setLoading(true);
      const driverReservations = await reservationService.getDriverReservations(driverId);
      setReservations(driverReservations);
    } catch (error) {
      console.error('Error loading driver reservations:', error);
      toast.error('Rezervasyonlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async (reservationId: string) => {
    try {
      await reservationService.updateReservationStatus(reservationId, 'started');
      toast.success('Yolculuk başlatıldı!');
      loadDriverReservations();
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error('Yolculuk başlatılırken hata oluştu.');
    }
  };

  const handleCompleteTrip = async (reservationId: string) => {
    try {
      await reservationService.updateReservationStatus(reservationId, 'completed');
      toast.success('Yolculuk tamamlandı!');
      loadDriverReservations();
    } catch (error) {
      console.error('Error completing trip:', error);
      toast.error('Yolculuk tamamlanırken hata oluştu.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Driver Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SBS TRAVEL</h1>
                  <p className="text-xs text-gray-500">Şoför Paneli</p>
                </div>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Aktif</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Ahmet Şoför</p>
                <p className="text-xs text-gray-500">34 ABC 123</p>
              </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Görevlerim</h1>
            <p className="text-gray-600">Size atanan transfer görevleri</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowQRScanner(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Kod Oku
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bekleyen Görevler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(r => r.status === 'assigned').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(r => r.status === 'started').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-6">
          {reservations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <Car className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz görev yok</h3>
              <p className="mt-1 text-sm text-gray-500">
                Size atanan görevler burada görünecek.
              </p>
            </div>
          ) : (
            reservations.map((reservation) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">#{reservation.id}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">₺{reservation.totalPrice}</p>
                    <p className="text-xs text-gray-500">Toplam Ücret</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Route Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Güzergah</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{reservation.from}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{reservation.to}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Tarih</p>
                        <p className="text-sm font-medium">{new Date(reservation.date).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Saat</p>
                        <p className="text-sm font-medium">{reservation.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Müşteri Bilgileri</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {reservation.firstName} {reservation.lastName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${reservation.phone}`} className="text-sm text-blue-600 hover:underline">
                            {reservation.phone}
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {reservation.passengers} yolcu, {reservation.baggage} bagaj
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigasyon
                  </button>
                  
                  {reservation.status === 'assigned' && (
                    <button 
                      onClick={() => handleStartTrip(reservation.id!)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Yolculuğu Başlat
                    </button>
                  )}
                  
                  {reservation.status === 'started' && (
                    <button 
                      onClick={() => handleCompleteTrip(reservation.id!)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Yolculuğu Tamamla
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              QR Kod Okuyucu
            </h3>
            
            <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
              <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">QR kod okuyucu burada olacak</p>
              <p className="text-sm text-gray-500 mt-2">
                Müşterinin QR kodunu kameraya tutun
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowQRScanner(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Kodu Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}