'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Car, Users, Star, Trophy, TrendingUp, Award } from 'lucide-react';
import { VehiclePerformanceData, DriverPerformanceData, PopularHoursData } from '../types/dashboard.types';

interface PerformanceMetricsProps {
  vehiclePerformance: VehiclePerformanceData[];
  driverPerformance: DriverPerformanceData[];
  popularHours: PopularHoursData[];
  loading: boolean;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  vehiclePerformance, 
  driverPerformance, 
  popularHours, 
  loading 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-white/5 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const vehicleColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Used Vehicles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span>En Çok Kullanılan Araçlar</span>
          </h3>
        </div>

        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vehiclePerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="vehicleName" 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="totalReservations" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Rezervasyon Sayısı"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {vehiclePerformance.map((vehicle, index) => (
            <div key={vehicle.vehicleId} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vehicleColors[index] }}></div>
                <div>
                  <p className="text-white font-medium">{vehicle.vehicleName}</p>
                  <p className="text-white/60 text-sm">{vehicle.vehicleType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{vehicle.totalReservations}</p>
                <p className="text-white/60 text-sm">%{Math.round(vehicle.usageRate * 100)} kullanım</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Popular Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span>Popüler Saatler</span>
          </h3>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={popularHours} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="hour" 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="reservations" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
                name="Rezervasyon"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-orange-400 font-bold text-lg">
              {popularHours.reduce((max, hour) => hour.reservations > max ? hour.reservations : max, 0)}
            </p>
            <p className="text-white/70 text-sm">En Yoğun</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-blue-400 font-bold text-lg">
              {Math.round(popularHours.reduce((sum, hour) => sum + hour.reservations, 0) / popularHours.length)}
            </p>
            <p className="text-white/70 text-sm">Ortalama</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-green-400 font-bold text-lg">
              {popularHours.reduce((sum, hour) => sum + hour.reservations, 0)}
            </p>
            <p className="text-white/70 text-sm">Toplam</p>
          </div>
        </div>
      </motion.div>

      {/* Top Drivers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span>En Aktif Şoförler</span>
          </h3>
        </div>

        <div className="space-y-4">
          {driverPerformance.map((driver, index) => (
            <div key={driver.driverId} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{driver.driverName}</p>
                    <p className="text-white/60 text-sm">{driver.vehicleType}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 text-sm">{driver.rating}</span>
                      <div className={`w-2 h-2 rounded-full ${driver.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className={`text-xs ${driver.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                        {driver.isActive ? 'Aktif' : 'Çevrimdışı'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{driver.totalTrips}</p>
                  <p className="text-white/60 text-sm">Yolculuk</p>
                  <p className="text-green-400 text-sm font-medium">₺{driver.earnings.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Customer Satisfaction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-3">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-2 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <span>Müşteri Memnuniyeti</span>
          </h3>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">92%</p>
              <p className="text-white/80 text-sm">Memnuniyet</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-white font-bold text-lg">4.8</p>
            <p className="text-white/70 text-sm">Ortalama Puan</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-green-400 font-bold text-lg mb-1">98%</div>
            <p className="text-white/70 text-sm">Tavsiye Oranı</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-blue-400 font-bold text-lg mb-1">156</div>
            <p className="text-white/70 text-sm">Bu Hafta Puan</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-purple-400 font-bold text-lg mb-1">2.1%</div>
            <p className="text-white/70 text-sm">Şikayet Oranı</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceMetrics;