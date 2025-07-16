'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail,
  Car,
  Star,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Award,
  TrendingUp,
  Navigation
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DataTable from '../../../components/ui/DataTable';
import Modal from '../../../components/ui/Modal';
import { realTimeDriverService } from '../../../lib/services/realTimeService';
import { Driver } from '../../../lib/types';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    experience: 0,
    languages: [] as string[],
    status: 'active' as const
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const driversData = await realTimeDriverService.getAll();
      setDrivers(driversData);
    } catch (error) {
      toast.error('Şoförler yüklenirken hata oluştu');
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await realTimeDriverService.create({
        ...formData,
        role: 'driver' as const,
        rating: 5.0,
        totalTrips: 0,
        monthlyEarnings: 0
      });
      await loadDrivers();
      setShowAddModal(false);
      resetForm();
      toast.success('✅ Şoför başarıyla eklendi!');
    } catch (error) {
      toast.error('❌ Şoför eklenirken hata oluştu.');
    }
  };

  const handleEditDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    
    try {
      await realTimeDriverService.update(selectedDriver.id, formData);
      await loadDrivers();
      setShowEditModal(false);
      resetForm();
      toast.success('✅ Şoför bilgileri güncellendi!');
    } catch (error) {
      toast.error('❌ Şoför güncellenirken hata oluştu.');
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm('Bu şoförü silmek istediğinizden emin misiniz?')) return;
    
    try {
      await realTimeDriverService.delete(driverId);
      await loadDrivers();
      toast.success('🗑️ Şoför silindi!');
    } catch (error) {
      toast.error('❌ Şoför silinirken hata oluştu.');
    }
  };

  const handleToggleActive = async (driverId: string, isActive: boolean) => {
    try {
      await realTimeDriverService.toggleActiveStatus(driverId, !isActive);
      await loadDrivers();
      toast.success(`✅ Şoför ${!isActive ? 'aktif' : 'pasif'} edildi!`);
    } catch (error) {
      toast.error('❌ Durum güncellenirken hata oluştu.');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      experience: 0,
      languages: [],
      status: 'active'
    });
    setSelectedDriver(null);
  };

  const openEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      email: driver.email,
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
      experience: driver.experience || 0,
      languages: driver.languages || [],
      status: driver.status || 'active'
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'name',
      title: 'Şoför',
      render: (value: string, item: Driver) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">{value}</div>
            <div className="text-sm text-white/60">{item.vehiclePlate}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'İletişim',
      render: (value: any, item: Driver) => (
        <div className="text-sm text-white">
          <div className="flex items-center space-x-1 mb-1">
            <Phone className="h-4 w-4 text-white/60" />
            <span>{item.phone}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Mail className="h-4 w-4 text-white/60" />
            <span className="truncate max-w-32">{item.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'vehicle',
      title: 'Araç',
      render: (value: any, item: Driver) => (
        <div className="text-sm text-white">
          <div className="flex items-center space-x-1 mb-1">
            <Car className="h-4 w-4 text-white/60" />
            <span>{item.vehicleType}</span>
          </div>
          <div className="text-white/60">{item.licenseNumber}</div>
        </div>
      )
    },
    {
      key: 'stats',
      title: 'İstatistikler',
      render: (value: any, item: Driver) => (
        <div className="text-sm text-white">
          <div className="flex items-center space-x-1 mb-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span>{item.rating}</span>
          </div>
          <div className="text-white/60">{item.totalTrips} yolculuk</div>
        </div>
      )
    },
    {
      key: 'earnings',
      title: 'Kazanç',
      render: (value: any, item: Driver) => (
        <div className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          ₺{item.monthlyEarnings.toLocaleString()}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Durum',
      render: (value: boolean, item: Driver) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(item.id, value);
          }}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
            value 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {value ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
          {value ? 'Aktif' : 'Pasif'}
        </button>
      )
    }
  ];

  const actions = (item: Driver) => (
    <>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedDriver(item);
          setShowDetailsModal(true);
        }}
        className="bg-white/10 backdrop-blur-md border border-white/30 text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-300"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          openEditModal(item);
        }}
        className="bg-blue-500/20 border border-blue-500/50 text-blue-400 p-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteDriver(item.id);
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
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Şoför Yönetimi
                </h1>
                <p className="text-xs text-blue-200">Şoför profilleri</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Şoför Yönetimi</h1>
            <p className="text-white/70 text-lg">Şoför profilleri ve performans takibi</p>
          </motion.div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Şoför</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={drivers}
          columns={columns}
          actions={actions}
          loading={loading}
          onRowClick={(item) => {
            setSelectedDriver(item);
            setShowDetailsModal(true);
          }}
        />

        {/* Add Driver Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          title="Yeni Şoför Ekle"
        >
          <form onSubmit={handleAddDriver} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Ehliyet No</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Araç Tipi</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Plaka</label>
                <input
                  type="text"
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-white">Aktif şoför</label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300"
              >
                Şoför Ekle
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Driver Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          title={`Şoför Düzenle - ${selectedDriver?.name}`}
        >
          <form onSubmit={handleEditDriver} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Ehliyet No</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Araç Tipi</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Plaka</label>
                <input
                  type="text"
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="editIsActive" className="text-sm text-white">Aktif şoför</label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Güncelle
              </button>
            </div>
          </form>
        </Modal>

        {/* Driver Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDriver(null);
          }}
          title={`Şoför Detayları - ${selectedDriver?.name}`}
          size="lg"
        >
          {selectedDriver && (
            <div className="space-y-6">
              {/* Driver Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Kişisel Bilgiler</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Ad Soyad</p>
                        <p className="text-white/70">{selectedDriver.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Telefon</p>
                        <p className="text-white/70">{selectedDriver.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">E-posta</p>
                        <p className="text-white/70">{selectedDriver.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Araç Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Araç Tipi</p>
                        <p className="text-white/70">{selectedDriver.vehicleType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Navigation className="h-5 w-5 text-red-400" />
                      <div>
                        <p className="text-white font-medium">Plaka</p>
                        <p className="text-white/70">{selectedDriver.vehiclePlate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Ehliyet No</p>
                        <p className="text-white/70">{selectedDriver.licenseNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Performans İstatistikleri</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedDriver.rating}</p>
                    <p className="text-sm text-white/60">Puan</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Car className="h-6 w-6 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedDriver.totalTrips}</p>
                    <p className="text-sm text-white/60">Yolculuk</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">₺{selectedDriver.monthlyEarnings.toLocaleString()}</p>
                    <p className="text-sm text-white/60">Aylık Kazanç</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className={`w-6 h-6 rounded-full ${selectedDriver.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedDriver.isActive ? 'Aktif' : 'Pasif'}</p>
                    <p className="text-sm text-white/60">Durum</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => openEditModal(selectedDriver)}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Düzenle</span>
                </button>
                <button
                  onClick={() => handleToggleActive(selectedDriver.id, selectedDriver.isActive)}
                  className={`flex-1 px-4 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 ${
                    selectedDriver.isActive 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {selectedDriver.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                  <span>{selectedDriver.isActive ? 'Pasif Et' : 'Aktif Et'}</span>
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}