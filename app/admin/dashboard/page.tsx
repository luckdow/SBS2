'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  MapPin, 
  Bell, 
  Settings, 
  Plus, 
  Database,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useDashboardData } from './hooks/useDashboardData';
import MetricsCards from './components/MetricsCards';
import ReservationChart from './components/ReservationChart';
import RevenueChart from './components/RevenueChart';
import LiveStatus from './components/LiveStatus';
import PerformanceMetrics from './components/PerformanceMetrics';
import ErrorBoundary from '../../../components/common/ErrorBoundary';

export default function AdminDashboard() {
  const { dashboardData, loading, error, lastUpdated, refetch } = useDashboardData();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
          <div className="text-red-400 mb-4">
            <Database className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Veri Yükleme Hatası</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Tekrar Dene</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary 
      onError={(error, errorInfo) => {
        console.error('Dashboard Error:', error, errorInfo);
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Admin Header */}
        <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      SBS TRAVEL
                    </h1>
                    <p className="text-xs text-blue-200">Admin Dashboard</p>
                  </div>
                </Link>
                <div className="h-6 w-px bg-white/30"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white/90 text-sm">Canlı Veri</span>
                </div>
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/admin/dashboard" className="text-white font-medium">Dashboard</Link>
                <Link href="/admin/reservations" className="text-white/70 hover:text-white font-medium transition-colors">Rezervasyonlar</Link>
                <Link href="/admin/vehicles" className="text-white/70 hover:text-white font-medium transition-colors">Araçlar</Link>
                <Link href="/admin/drivers" className="text-white/70 hover:text-white font-medium transition-colors">Şoförler</Link>
                <Link href="/admin/financial" className="text-white/70 hover:text-white font-medium transition-colors">Finansal</Link>
              </nav>

              <div className="flex items-center space-x-4">
                <button
                  onClick={refetch}
                  className="relative p-2 text-white/80 hover:text-white transition-colors"
                  title="Verileri Yenile"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button className="relative p-2 text-white/80 hover:text-white transition-colors">
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
                <button className="text-white/80 hover:text-white font-medium transition-colors">
                  Admin User
                </button>
                <Link href="/" className="text-white/60 hover:text-white/80 transition-colors">
                  ← Ana Sayfa
                </Link>
              </div>
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
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <p className="text-white/70 text-lg">
                SBS Travel operasyon merkezi - Son güncelleme: {lastUpdated.toLocaleString('tr-TR')}
              </p>
            </motion.div>
            <div className="flex space-x-3">
              <Link href="/admin/seed" className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Veritabanını Sıfırla</span>
              </Link>
              <Link href="/reservation" className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Yeni Rezervasyon</span>
              </Link>
              <Link href="/admin/settings" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Ayarlar</span>
              </Link>
            </div>
          </div>

          {/* Real-time Metrics Cards */}
          {dashboardData?.metrics && (
            <MetricsCards metrics={dashboardData.metrics} loading={loading} />
          )}

          {/* Live Status */}
          <div className="mb-8">
            <LiveStatus
              isOnline={true}
              activeUsers={18}
              lastUpdate={lastUpdated}
              pendingActions={dashboardData?.metrics?.pendingReservations || 0}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            {/* Reservation Chart */}
            {dashboardData?.reservationTrend && (
              <ReservationChart 
                data={dashboardData.reservationTrend} 
                loading={loading} 
              />
            )}

            {/* Revenue Chart */}
            {dashboardData?.revenueTrend && (
              <RevenueChart 
                data={dashboardData.revenueTrend} 
                loading={loading} 
              />
            )}
          </div>

          {/* Performance Metrics */}
          {dashboardData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Sparkles className="h-7 w-7 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Performans Analizi</h2>
              </div>
              <PerformanceMetrics
                vehiclePerformance={dashboardData.vehiclePerformance}
                driverPerformance={dashboardData.driverPerformance}
                popularHours={dashboardData.popularHours}
                loading={loading}
              />
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-center"
          >
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <p className="text-white/60 text-sm">
                © 2024 SBS Travel - Profesyonel transfer hizmetleri | 
                Dashboard otomatik olarak 30 saniyede bir güncellenir
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
}