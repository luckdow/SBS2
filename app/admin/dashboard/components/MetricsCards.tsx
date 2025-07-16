'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Users, 
  Calendar, 
  Clock, 
  Activity, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { DashboardMetrics } from '../types/dashboard.types';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  loading: boolean;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, loading }) => {
  const metricsData = [
    {
      title: 'Toplam Araçlar',
      value: metrics.totalVehicles,
      subtitle: `${metrics.activeVehicles} aktif, ${metrics.availableVehicles} müsait`,
      icon: Car,
      gradient: 'from-blue-500 to-blue-600',
      change: '+5%',
      changeType: 'up' as const
    },
    {
      title: 'Aktif Şoförler',
      value: `${metrics.activeDrivers}/${metrics.totalDrivers}`,
      subtitle: `${metrics.offlineDrivers} çevrimdışı`,
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      change: '+12%',
      changeType: 'up' as const
    },
    {
      title: 'Günlük Rezervasyon',
      value: metrics.dailyReservations,
      subtitle: `Haftalık: ${metrics.weeklyReservations}`,
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
      change: '+8%',
      changeType: 'up' as const
    },
    {
      title: 'Bekleyen Rezervasyon',
      value: metrics.pendingReservations,
      subtitle: `${metrics.assignedReservations} atandı`,
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-600',
      change: '+3%',
      changeType: 'up' as const
    },
    {
      title: 'Aktif Yolculuk',
      value: metrics.startedReservations,
      subtitle: `${metrics.completedReservations} tamamlandı`,
      icon: Activity,
      gradient: 'from-emerald-500 to-emerald-600',
      change: '+15%',
      changeType: 'up' as const
    },
    {
      title: 'Günlük Gelir',
      value: `₺${metrics.dailyRevenue.toLocaleString()}`,
      subtitle: `Haftalık: ₺${metrics.weeklyRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-green-500 to-teal-600',
      change: '+22%',
      changeType: 'up' as const
    },
    {
      title: 'Aylık Gelir',
      value: `₺${metrics.monthlyRevenue.toLocaleString()}`,
      subtitle: `Toplam: ₺${metrics.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      gradient: 'from-blue-500 to-indigo-600',
      change: '+18%',
      changeType: 'up' as const
    },
    {
      title: 'Ortalama Kullanım',
      value: `%${Math.round(metrics.averageVehicleUsage * 100)}`,
      subtitle: `Memnuniyet: %${Math.round(metrics.customerSatisfaction * 100)}`,
      icon: Star,
      gradient: 'from-yellow-500 to-orange-600',
      change: '+5%',
      changeType: 'up' as const
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
              <div className="w-16 h-4 bg-white/20 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-white/20 rounded"></div>
              <div className="w-16 h-8 bg-white/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricsData.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`bg-gradient-to-r ${metric.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <metric.icon className="h-6 w-6 text-white" />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              metric.changeType === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              {metric.changeType === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span>{metric.change}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-white/70 mb-1">{metric.title}</p>
            <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
            <p className="text-xs text-white/60">{metric.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MetricsCards;