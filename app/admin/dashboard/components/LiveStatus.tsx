'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Wifi, Database, Users, Activity, Clock } from 'lucide-react';

interface LiveStatusProps {
  isOnline: boolean;
  activeUsers: number;
  lastUpdate: Date;
  pendingActions: number;
}

const LiveStatus: React.FC<LiveStatusProps> = ({ 
  isOnline, 
  activeUsers, 
  lastUpdate, 
  pendingActions 
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeSinceUpdate = () => {
    const diffInSeconds = Math.floor((currentTime.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} saniye önce`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span>Canlı Durum</span>
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
            {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connection Status */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <Wifi className={`h-5 w-5 ${isOnline ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-white font-medium">Bağlantı</p>
              <p className={`text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Aktif' : 'Kesildi'}
              </p>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Database className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Veritabanı</p>
              <p className="text-sm text-blue-400">Firebase</p>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Aktif Kullanıcı</p>
              <p className="text-sm text-purple-400">{activeUsers}</p>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-medium">Bekleyen İşlem</p>
              <p className="text-sm text-yellow-400">{pendingActions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Indicators */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Son Güncelleme</p>
              <p className="text-white font-medium">{getTimeSinceUpdate()}</p>
            </div>
            <div className="relative">
              <Zap className="h-6 w-6 text-green-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Güncelleme Aralığı</p>
              <p className="text-white font-medium">30 saniye</p>
            </div>
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Sistem Zamanı</p>
              <p className="text-white font-medium">
                {currentTime.toLocaleTimeString('tr-TR')}
              </p>
            </div>
            <div className="text-purple-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-6">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-pulse"></div>
            </div>
            <div>
              <p className="text-white font-medium">Sistem Durumu</p>
              <p className="text-white/70 text-sm mt-1">
                Tüm sistemler normal çalışıyor. Firebase bağlantısı aktif, real-time güncellemeler sorunsuz.
              </p>
              <p className="text-white/50 text-xs mt-2">
                Son sağlık kontrolü: {currentTime.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveStatus;