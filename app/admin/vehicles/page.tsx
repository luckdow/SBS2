'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Users,
  Luggage,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Image,
  Award,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DataTable from '../../../components/ui/DataTable';
import Modal from '../../../components/ui/Modal';
import { realTimeVehicleService } from '../../../lib/services/realTimeService';
import { Vehicle } from '../../../lib/types';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'sedan' as Vehicle['type'],
    capacity: 4,
    baggage: 2,
    pricePerKm: 8,
    image: '',
    features: [] as string[],
    rating: 5.0,
    isActive: true
  });

  const vehicleTypes = [
    { value: 'sedan', label: 'Sedan', icon: Car },
    { value: 'suv', label: 'SUV', icon: Car },
    { value: 'van', label: 'Van', icon: Car },
    { value: 'luxury', label: 'Luxury', icon: Award }
  ];

  const commonFeatures = [
    'Klima', 'Wi-Fi', 'USB Şarj', 'Bluetooth', 'Deri Koltuk', 
    'Temiz Araç', 'Sigara İçilmez', 'Mini Bar', 'TV', 'Masaj'
  ];

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      console.log('🚗 Loading vehicles...');
      const vehiclesData = await realTimeVehicleService.getAll();
      console.log('✅ Vehicles loaded:', vehiclesData);
      setVehicles(vehiclesData);
    } catch (error) {
      toast.error('Araçlar yüklenirken hata oluştu');
      console.error('Error loading vehicles:', error);
      // Fallback to empty array if there's an error
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await realTimeVehicleService.create(formData);
      await loadVehicles();
      setShowAddModal(false);
      resetForm();
      toast.success('✅ Araç başarıyla eklendi!');
    } catch (error) {
      toast.error('❌ Araç eklenirken hata oluştu.');
    }
  };

  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    
    try {
      await realTimeVehicleService.update(selectedVehicle.id, formData);
      await loadVehicles();
      setShowEditModal(false);
      resetForm();
      toast.success('✅ Araç bilgileri güncellendi!');
    } catch (error) {
      toast.error('❌ Araç güncellenirken hata oluştu.');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Bu aracı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await realTimeVehicleService.delete(vehicleId);
      await loadVehicles();
      toast.success('🗑️ Araç silindi!');
    } catch (error) {
      toast.error('❌ Araç silinirken hata oluştu.');
    }
  };

  const handleToggleActive = async (vehicleId: string, isActive: boolean) => {
    try {
      await realTimeVehicleService.update(vehicleId, { isActive: !isActive });
      await loadVehicles();
      toast.success(`✅ Araç ${!isActive ? 'aktif' : 'pasif'} edildi!`);
    } catch (error) {
      toast.error('❌ Durum güncellenirken hata oluştu.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'sedan',
      capacity: 4,
      baggage: 2,
      pricePerKm: 8,
      image: '',
      features: [],
      rating: 5.0,
      isActive: true
    });
    setSelectedVehicle(null);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      capacity: vehicle.capacity,
      baggage: vehicle.baggage,
      pricePerKm: vehicle.pricePerKm,
      image: vehicle.image,
      features: vehicle.features,
      rating: vehicle.rating,
      isActive: vehicle.isActive
    });
    setShowEditModal(true);
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const columns = [
    {
      key: 'vehicle',
      title: 'Araç',
      render: (value: any, item: Vehicle) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-20 mr-4">
            <img 
              src={item.image || 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=300'} 
              alt={item.name}
              className="h-16 w-20 object-cover rounded-lg"
            />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{item.name}</div>
            <div className="text-sm text-white/60 capitalize">{item.type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'specs',
      title: 'Özellikler',
      render: (value: any, item: Vehicle) => (
        <div className="text-sm text-white">
          <div className="flex items-center space-x-1 mb-1">
            <Users className="h-4 w-4 text-white/60" />
            <span>{item.capacity} kişi</span>
          </div>
          <div className="flex items-center space-x-1">
            <Luggage className="h-4 w-4 text-white/60" />
            <span>{item.baggage} bagaj</span>
          </div>
        </div>
      )
    },
    {
      key: 'pricing',
      title: 'Fiyat',
      render: (value: any, item: Vehicle) => (
        <div className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          ₺{item.pricePerKm}/km
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Puan',
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-white font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'features',
      title: 'Özellikler',
      render: (value: string[]) => (
        <div className="text-sm text-white/80">
          {value.slice(0, 2).map((feature, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>{feature}</span>
            </div>
          ))}
          {value.length > 2 && (
            <div className="text-white/60 text-xs">+{value.length - 2} daha</div>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Durum',
      render: (value: boolean, item: Vehicle) => (
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

  const actions = (item: Vehicle) => (
    <>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedVehicle(item);
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
          handleDeleteVehicle(item.id);
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
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Araç Yönetimi
                </h1>
                <p className="text-xs text-blue-200">Filo yönetimi</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Araç Yönetimi</h1>
            <p className="text-white/70 text-lg">Filo yönetimi ve fiyatlandırma</p>
          </motion.div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Araç</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={vehicles}
          columns={columns}
          actions={actions}
          loading={loading}
          onRowClick={(item) => {
            setSelectedVehicle(item);
            setShowDetailsModal(true);
          }}
        />

        {/* Add/Edit Vehicle Modal */}
        <Modal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          title={showAddModal ? "Yeni Araç Ekle" : `Araç Düzenle - ${selectedVehicle?.name}`}
          size="lg"
        >
          <form onSubmit={showAddModal ? handleAddVehicle : handleEditVehicle} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Araç Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Araç Tipi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Vehicle['type']})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                >
                  {vehicleTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Kapasite</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Bagaj Kapasitesi</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.baggage}
                  onChange={(e) => setFormData({...formData, baggage: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Fiyat (₺/km)</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.pricePerKm}
                  onChange={(e) => setFormData({...formData, pricePerKm: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Puan</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Resim URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">Özellikler</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {commonFeatures.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-white">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="vehicleActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="vehicleActive" className="text-sm text-white">Aktif araç</label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
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
                {showAddModal ? 'Araç Ekle' : 'Güncelle'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Vehicle Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedVehicle(null);
          }}
          title={`Araç Detayları - ${selectedVehicle?.name}`}
          size="lg"
        >
          {selectedVehicle && (
            <div className="space-y-6">
              {/* Vehicle Image */}
              <div className="text-center">
                <img 
                  src={selectedVehicle.image || 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=600'} 
                  alt={selectedVehicle.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Araç Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Araç Tipi</p>
                        <p className="text-white/70 capitalize">{selectedVehicle.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Kapasite</p>
                        <p className="text-white/70">{selectedVehicle.capacity} kişi</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Luggage className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">Bagaj</p>
                        <p className="text-white/70">{selectedVehicle.baggage} adet</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Fiyat & Puan</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Fiyat</p>
                        <p className="text-white/70">₺{selectedVehicle.pricePerKm}/km</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <div>
                        <p className="text-white font-medium">Puan</p>
                        <p className="text-white/70">{selectedVehicle.rating}/5</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Durum</p>
                        <p className="text-white/70">{selectedVehicle.isActive ? 'Aktif' : 'Pasif'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Özellikler</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedVehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white/80 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => openEditModal(selectedVehicle)}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Düzenle</span>
                </button>
                <button
                  onClick={() => handleToggleActive(selectedVehicle.id, selectedVehicle.isActive)}
                  className={`flex-1 px-4 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 ${
                    selectedVehicle.isActive 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {selectedVehicle.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                  <span>{selectedVehicle.isActive ? 'Pasif Et' : 'Aktif Et'}</span>
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}