'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Users,
  Car,
  Gift,
  Calendar,
  User,
  Loader,
  Trash2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { seedAllData, seedSingleCollection } from '../../../lib/seedData';

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState<string>('');
  const [completed, setCompleted] = useState<string[]>([]);

  const collections = [
    {
      name: 'drivers',
      title: 'Şoförler',
      description: '5 şoför (4 aktif, 1 pasif)',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'vehicles',
      title: 'Araçlar',
      description: '5 farklı araç tipi',
      icon: Car,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'services',
      title: 'Hizmetler',
      description: '8 ek hizmet seçeneği',
      icon: Gift,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'customers',
      title: 'Müşteriler',
      description: '4 örnek müşteri',
      icon: User,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      name: 'reservations',
      title: 'Rezervasyonlar',
      description: '4 örnek rezervasyon',
      icon: Calendar,
      color: 'from-pink-500 to-red-600'
    }
  ];

  const handleSeedAll = async () => {
    setLoading(true);
    try {
      await seedAllData();
      setCompleted(['drivers', 'vehicles', 'services', 'customers', 'reservations']);
      toast.success('🎉 Tüm veriler başarıyla yüklendi!');
    } catch (error) {
      toast.error('❌ Veri yükleme hatası!');
      console.error('Seed error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSingle = async (collectionName: string) => {
    setSeeding(collectionName);
    try {
      await seedSingleCollection(collectionName);
      setCompleted(prev => [...prev.filter(c => c !== collectionName), collectionName]);
      toast.success(`✅ ${collectionName} verisi yüklendi!`);
    } catch (error) {
      toast.error(`❌ ${collectionName} yükleme hatası!`);
      console.error(`Seed error for ${collectionName}:`, error);
    } finally {
      setSeeding('');
    }
  };

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
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Veri Tohumu
                </h1>
                <p className="text-xs text-blue-200">Firebase Seed Data</p>
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
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Firebase Veri Tohumu
              </span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Firebase veritabanınıza örnek veriler yükleyin. Bu işlem test ve geliştirme için gereklidir.
            </p>
          </motion.div>
        </div>

        {/* Seed All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <button
            onClick={handleSeedAll}
            disabled={loading}
            className="group relative px-12 py-6 bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold text-xl rounded-2xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
          >
            {loading ? (
              <Loader className="h-8 w-8 animate-spin" />
            ) : (
              <Play className="h-8 w-8 group-hover:scale-110 transition-transform" />
            )}
            <span>{loading ? 'Yükleniyor...' : 'Tüm Verileri Yükle'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <p className="text-white/60 mt-4">
            Bu işlem tüm koleksiyonları otomatik olarak doldurur
          </p>
        </motion.div>

        {/* Individual Collections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-center">
                <div className={`bg-gradient-to-r ${collection.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <collection.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{collection.title}</h3>
                <p className="text-white/70 text-sm mb-6">{collection.description}</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleSeedSingle(collection.name)}
                    disabled={seeding === collection.name || loading}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                      completed.includes(collection.name)
                        ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {seeding === collection.name ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : completed.includes(collection.name) ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                    <span>
                      {seeding === collection.name 
                        ? 'Yükleniyor...' 
                        : completed.includes(collection.name)
                        ? 'Tamamlandı'
                        : 'Yükle'
                      }
                    </span>
                  </button>
                  
                  {completed.includes(collection.name) && (
                    <button
                      onClick={() => handleSeedSingle(collection.name)}
                      disabled={seeding === collection.name || loading}
                      className="w-full px-4 py-2 bg-white/10 border border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Yeniden Yükle</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Önemli Bilgiler</h3>
              <div className="space-y-2 text-white/80">
                <p>• Bu işlem Firebase Firestore veritabanınıza örnek veriler ekler</p>
                <p>• Mevcut veriler kontrol edilir, duplicate oluşturulmaz</p>
                <p>• Test ve geliştirme ortamı için güvenlidir</p>
                <p>• Production ortamında dikkatli kullanın</p>
                <p>• İşlem tamamlandıktan sonra admin panelinde verileri görebilirsiniz</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-white/80 hover:text-white font-medium text-lg transition-colors"
          >
            ← Admin Paneline Dön
          </Link>
        </div>
      </div>
    </div>
  );
}