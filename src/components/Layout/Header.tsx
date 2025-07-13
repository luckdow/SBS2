import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm text-gray-600 border-b border-gray-100">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>+90 532 123 4567</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>7/24 Hizmet</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>Antalya, Türkiye</span>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SBS TRAVEL</h1>
                <p className="text-xs text-gray-500">Güvenli Transfer Hizmeti</p>
              </div>
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Ana Sayfa</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Hizmetler</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Hakkımızda</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">İletişim</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Giriş Yap
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Rezervasyon
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};