'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users, Percent } from 'lucide-react';
import { RevenueTrendData } from '../types/dashboard.types';

interface RevenueChartProps {
  data: RevenueTrendData[];
  loading: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString('tr-TR');
      return (
        <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-xl">
          <p className="text-white font-medium mb-2">{date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₺{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate commission distribution
  const totalRevenue = data.reduce((sum, day) => sum + day.revenue, 0);
  const totalDriverShare = data.reduce((sum, day) => sum + day.driverShare, 0);
  const totalCompanyShare = data.reduce((sum, day) => sum + day.companyShare, 0);

  const commissionData = [
    { name: 'Şoför Payı (%70)', value: totalDriverShare, color: '#10b981' },
    { name: 'Şirket Payı (%30)', value: totalCompanyShare, color: '#3b82f6' }
  ];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
            <div className="w-48 h-6 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white/5 rounded-xl animate-pulse"></div>
          <div className="h-80 bg-white/5 rounded-xl animate-pulse"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <span>Gelir Analizi (Son 30 Gün)</span>
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            <span className="text-white/70">Toplam Gelir</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white/70">Şoför Payı</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-white/70">Şirket Payı</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="driverGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={0.6}
                  fill="url(#revenueGradient)"
                  name="Toplam Gelir"
                />
                <Area
                  type="monotone"
                  dataKey="driverShare"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={0.4}
                  fill="url(#driverGradient)"
                  name="Şoför Payı"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commission Distribution */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Komisyon Dağılımı</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={commissionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `%${(percent * 100).toFixed(0)}`}
                  labelLine={false}
                >
                  {commissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`₺${value.toLocaleString()}`, '']}
                  labelStyle={{ color: '#ffffff' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {commissionData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-white/70">{item.name}</span>
                </div>
                <span className="text-white font-medium">₺{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Toplam Gelir</p>
              <p className="text-xl font-bold text-white">₺{totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Şoför Payı</p>
              <p className="text-xl font-bold text-green-400">₺{totalDriverShare.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Şirket Payı</p>
              <p className="text-xl font-bold text-blue-400">₺{totalCompanyShare.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Ortalama Günlük</p>
              <p className="text-xl font-bold text-purple-400">₺{Math.round(totalRevenue / data.length).toLocaleString()}</p>
            </div>
            <Percent className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueChart;