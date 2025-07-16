'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { dataService } from '../../../lib/services/dataService';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const driversData = await dataService.getCollection('drivers');
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast.error('Şoförler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Şoför Yönetimi</h1>
              <p className="text-gray-300">Şoförleri yönet ve takip et</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Şoför</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="text-3xl font-bold text-white mb-2">{drivers.length}</div>
            <div className="text-gray-300">Toplam Şoför</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="text-3xl font-bold text-green-400 mb-2">
              {drivers.filter(d => d.status === 'active').length}
            </div>
            <div className="text-gray-300">Aktif Şoför</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {drivers.filter(d => d.currentVehicle).length}
            </div>
            <div className="text-gray-300">Atanmış Araç</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {Math.round((drivers.reduce((avg, d) => avg + (d.rating || 0), 0) / drivers.length || 0) * 10) / 10}
            </div>
            <div className="text-gray-300">Ortalama Puan</div>
          </motion.div>
        </div>

        {/* Drivers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Tüm Şoförler</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-gray-300 font-medium">Şoför</th>
                  <th className="text-left p-4 text-gray-300 font-medium">İletişim</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Ehliyet</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Durum</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Puan</th>
                  <th className="text-left p-4 text-gray-300 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver, index) => (
                  <motion.tr
                    key={driver.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="text-white font-medium">
                        {driver.firstName} {driver.lastName}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {driver.experience} yıl deneyim
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300">{driver.email}</div>
                      <div className="text-gray-400 text-sm">{driver.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300">{driver.licenseNumber}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        driver.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {driver.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-yellow-400 font-medium">
                        ⭐ {driver.rating?.toFixed(1) || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-white/20 rounded-lg text-blue-400 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-white/20 rounded-lg text-yellow-400 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-white/20 rounded-lg text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}