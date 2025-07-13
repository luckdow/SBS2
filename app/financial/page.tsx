'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  Car,
  PieChart,
  BarChart3,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Wallet,
  Target,
  Award,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function FinancialPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const financialData = {
    totalRevenue: 125680,
    monthlyRevenue: 45680,
    weeklyRevenue: 12340,
    dailyRevenue: 3240,
    driverCommission: 94260, // %75
    companyCommission: 31420, // %25
    totalTrips: 342,
    avgTripValue: 367,
    topDriverEarnings: 8450,
    growth: 18.5
  };

  const recentTransactions = [
    {
      id: 'TXN001',
      type: 'trip_completed',
      customer: 'Ahmet Yılmaz',
      driver: 'Mehmet Şoför',
      amount: 280,
      driverShare: 210,
      companyShare: 70,
      date: '2024-01-15 14:30',
      route: 'Havalimanı → Lara Hotel'
    },
    {
      id: 'TXN002',
      type: 'trip_completed',
      customer: 'Elif Demir',
      driver: 'Ali Şoför',
      amount: 320,
      driverShare: 240,
      companyShare: 80,
      date: '2024-01-15 16:00',
      route: 'Kemer → Havalimanı'
    },
    {
      id: 'TXN003',
      type: 'trip_completed',
      customer: 'Can Özkan',
      driver: 'Hasan Şoför',
      amount: 180,
      driverShare: 135,
      companyShare: 45,
      date: '2024-01-15 18:15',
      route: 'Side → Belek'
    }
  ];

  const topDrivers = [
    { name: 'Mehmet Şoför', earnings: 8450, trips: 45, rating: 4.9, growth: 12 },
    { name: 'Ali Şoför', earnings: 7890, trips: 42, rating: 4.8, growth: 8 },
    { name: 'Hasan Şoför', earnings: 7320, trips: 38, rating: 4.7, growth: 15 },
    { name: 'Mustafa Şoför', earnings: 6980, trips: 35, rating: 4.6, growth: 5 },
    { name: 'Osman Şoför', earnings: 6540, trips: 33, rating: 4.8, growth: 10 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    SBS TRAVEL
                  </h1>
                  <p className="text-xs text-blue-200">Finansal Panel</p>
                </div>
              </Link>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm">Canlı Veri</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/admin" className="text-white/70 hover:text-white font-medium transition-colors">Dashboard</Link>
              <Link href="/admin/reservations" className="text-white/70 hover:text-white font-medium transition-colors">Rezervasyonlar</Link>
              <Link href="/financial" className="text-white font-medium">Finansal</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-white/60 hover:text-white/80 transition-colors">
                ← Admin Panel
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
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Finansal Rapor</h1>
            </div>
            <p className="text-white/70 text-lg">Gelir analizi ve komisyon takibi</p>
          </motion.div>
          
          <div className="flex space-x-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              <option value="day">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="year">Bu Yıl</option>
            </select>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Rapor İndir</span>
            </button>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Toplam Gelir',
              value: `₺${financialData.totalRevenue.toLocaleString()}`,
              icon: DollarSign,
              gradient: 'from-green-500 to-green-600',
              change: `+${financialData.growth}%`,
              changeType: 'up'
            },
            {
              title: 'Aylık Gelir',
              value: `₺${financialData.monthlyRevenue.toLocaleString()}`,
              icon: TrendingUp,
              gradient: 'from-blue-500 to-blue-600',
              change: '+22%',
              changeType: 'up'
            },
            {
              title: 'Ortalama Yolculuk',
              value: `₺${financialData.avgTripValue}`,
              icon: Target,
              gradient: 'from-purple-500 to-purple-600',
              change: '+8%',
              changeType: 'up'
            },
            {
              title: 'Toplam Yolculuk',
              value: financialData.totalTrips,
              icon: Car,
              gradient: 'from-orange-500 to-red-600',
              change: '+15%',
              changeType: 'up'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.changeType === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.changeType === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Commission Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Driver Commission */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-400" />
              <span>Şoför Komisyonu (%75)</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Bu Ay Toplam</span>
                <span className="text-2xl font-bold text-blue-400">₺{financialData.driverCommission.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Ortalama/Şoför</p>
                  <p className="text-lg font-bold text-white">₺{Math.round(financialData.driverCommission / 15).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm">En Yüksek</p>
                  <p className="text-lg font-bold text-white">₺{financialData.topDriverEarnings.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Commission */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-green-400" />
              <span>Şirket Komisyonu (%25)</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Bu Ay Toplam</span>
                <span className="text-2xl font-bold text-green-400">₺{financialData.companyCommission.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Günlük Ortalama</p>
                  <p className="text-lg font-bold text-white">₺{Math.round(financialData.companyCommission / 30).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm">Büyüme</p>
                  <p className="text-lg font-bold text-white">+{financialData.growth}%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Drivers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 mb-8"
        >
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Award className="h-7 w-7 text-yellow-400" />
              <span>En Çok Kazanan Şoförler</span>
            </h3>
            <div className="space-y-4">
              {topDrivers.map((driver, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                      'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{driver.name}</p>
                      <p className="text-sm text-white/60">{driver.trips} yolculuk • ⭐ {driver.rating}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">₺{driver.earnings.toLocaleString()}</p>
                    <p className="text-sm text-green-300">+{driver.growth}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                <CreditCard className="h-7 w-7 text-blue-400" />
                <span>Son İşlemler</span>
              </h3>
              <div className="flex space-x-3">
                <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtrele</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      İşlem
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Güzergah
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Şoför
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Toplam
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Şoför Payı
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Şirket Payı
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          #{transaction.id}
                        </div>
                        <div className="text-sm text-white/60">
                          {transaction.customer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-white/60" />
                          <span>{transaction.route}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {transaction.driver}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-white">
                          ₺{transaction.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-blue-400">
                          ₺{transaction.driverShare}
                        </div>
                        <div className="text-xs text-blue-300">75%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-green-400">
                          ₺{transaction.companyShare}
                        </div>
                        <div className="text-xs text-green-300">25%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-white/60" />
                          <span>{transaction.date}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}