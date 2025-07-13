'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign,
  Users,
  Luggage,
  Plane,
  Baby,
  ToggleLeft,
  ToggleRight,
  Tag,
  Info
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DataTable from '../../../components/ui/DataTable';
import Modal from '../../../components/ui/Modal';
import { serviceService } from '../../../lib/services/api';
import { Service } from '../../../lib/types';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'other' as Service['category'],
    isActive: true
  });

  const serviceCategories = [
    { value: 'child_seat', label: 'Çocuk Koltuğu', icon: Baby },
    { value: 'extra_baggage', label: 'Ek Bagaj', icon: Luggage },
    { value: 'meet_greet', label: 'Karşılama', icon: Plane },
    { value: 'other', label: 'Diğer', icon: Gift }
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
    } catch (error) {
      toast.error('Hizmetler yüklenirken hata oluştu');
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await serviceService.create(formData);
      await loadServices();
      setShowAddModal(false);
      resetForm();
      toast.success('✅ Hizmet başarıyla eklendi!');
    } catch (error) {
      toast.error('❌ Hizmet eklenirken hata oluştu.');
    }
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    
    try {
      await serviceService.update(selectedService.id, formData);
      await loadServices();
      setShowEditModal(false);
      resetForm();
      toast.success('✅ Hizmet bilgileri güncellendi!');
    } catch (error) {
      toast.error('❌ Hizmet güncellenirken hata oluştu.');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return;
    
    try {
      await serviceService.delete(serviceId);
      await loadServices();
      toast.success('🗑️ Hizmet silindi!');
    } catch (error) {
      toast.error('❌ Hizmet silinirken hata oluştu.');
    }
  };

  const handleToggleActive = async (serviceId: string, isActive: boolean) => {
    try {
      await serviceService.update(serviceId, { isActive: !isActive });
      await loadServices();
      toast.success(`✅ Hizmet ${!isActive ? 'aktif' : 'pasif'} edildi!`);
    } catch (error) {
      toast.error('❌ Durum güncellenirken hata oluştu.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      description: '',
      category: 'other',
      isActive: true
    });
    setSelectedService(null);
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      price: service.price,
      description: service.description,
      category: service.category,
      isActive: service.isActive
    });
    setShowEditModal(true);
  };

  const getCategoryIcon = (category: Service['category']) => {
    const categoryData = serviceCategories.find(c => c.value === category);
    return categoryData?.icon || Gift;
  };

  const getCategoryLabel = (category: Service['category']) => {
    const categoryData = serviceCategories.find(c => c.value === category);
    return categoryData?.label || 'Diğer';
  };

  const columns = [
    {
      key: 'service',
      title: 'Hizmet',
      render: (value: any, item: Service) => {
        const IconComponent = getCategoryIcon(item.category);
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 mr-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-white">{item.name}</div>
              <div className="text-sm text-white/60">{getCategoryLabel(item.category)}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'description',
      title: 'Açıklama',
      render: (value: string) => (
        <div className="text-sm text-white/80 max-w-xs truncate">
          {value}
        </div>
      )
    },
    {
      key: 'price',
      title: 'Fiyat',
      render: (value: number) => (
        <div className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          ₺{value}
        </div>
      )
    },
    {
      key: 'category',
      title: 'Kategori',
      render: (value: Service['category']) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          {getCategoryLabel(value)}
        </span>
      )
    },
    {
      key: 'isActive',
      title: 'Durum',
      render: (value: boolean, item: Service) => (
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

  const actions = (item: Service) => (
    <>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedService(item);
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
          handleDeleteService(item.id);
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
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Hizmet Yönetimi
                </h1>
                <p className="text-xs text-blue-200">Ek hizmetler</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Hizmet Yönetimi</h1>
            <p className="text-white/70 text-lg">Ek hizmetler ve fiyatlandırma</p>
          </motion.div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Hizmet</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={services}
          columns={columns}
          actions={actions}
          loading={loading}
          onRowClick={(item) => {
            setSelectedService(item);
            setShowDetailsModal(true);
          }}
        />

        {/* Add/Edit Service Modal */}
        <Modal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          title={showAddModal ? "Yeni Hizmet Ekle" : `Hizmet Düzenle - ${selectedService?.name}`}
        >
          <form onSubmit={showAddModal ? handleAddService : handleEditService} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Hizmet Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Fiyat (₺)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as Service['category']})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                >
                  {serviceCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="serviceActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="serviceActive" className="text-sm text-white">Aktif hizmet</label>
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
                {showAddModal ? 'Hizmet Ekle' : 'Güncelle'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Service Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedService(null);
          }}
          title={`Hizmet Detayları - ${selectedService?.name}`}
        >
          {selectedService && (
            <div className="space-y-6">
              {/* Service Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Hizmet Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Tag className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Hizmet Adı</p>
                        <p className="text-white/70">{selectedService.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Fiyat</p>
                        <p className="text-white/70">₺{selectedService.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {React.createElement(getCategoryIcon(selectedService.category), { className: "h-5 w-5 text-purple-400" })}
                      <div>
                        <p className="text-white font-medium">Kategori</p>
                        <p className="text-white/70">{getCategoryLabel(selectedService.category)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Durum</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full ${selectedService.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-white font-medium">Aktif Durum</p>
                        <p className="text-white/70">{selectedService.isActive ? 'Aktif' : 'Pasif'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Açıklama</span>
                </h3>
                <p className="text-white/80 leading-relaxed">{selectedService.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => openEditModal(selectedService)}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Düzenle</span>
                </button>
                <button
                  onClick={() => handleToggleActive(selectedService.id, selectedService.isActive)}
                  className={`flex-1 px-4 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 ${
                    selectedService.isActive 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {selectedService.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                  <span>{selectedService.isActive ? 'Pasif Et' : 'Aktif Et'}</span>
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}