import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Shield, Clock, Star, ArrowRight, Phone, Mail, Users, Luggage, Plane } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Güvenli ve Konforlu
              <span className="block text-yellow-400">Transfer Hizmeti</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            >
              Havalimanı transferleri için en güvenilir çözüm. Profesyonel şoförler, temiz araçlar, uygun fiyatlar.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-blue-600 hover:bg-gray-100 focus:ring-blue-500 px-6 py-3 text-lg">
                Hemen Rezervasyon Yap
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-white text-white hover:bg-white hover:text-blue-600 focus:ring-white px-6 py-3 text-lg">
                <Phone className="mr-2 h-5 w-5" />
                Bizi Arayın
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden SBS Travel?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Müşteri memnuniyeti odaklı hizmet anlayışımızla size en iyi transfer deneyimini sunuyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Güvenli Yolculuk',
                description: 'Lisanslı şoförler ve sigortalı araçlarla güvenli seyahat'
              },
              {
                icon: Clock,
                title: '7/24 Hizmet',
                description: 'Gece gündüz kesintisiz transfer hizmeti'
              },
              {
                icon: Star,
                title: 'Kaliteli Hizmet',
                description: 'Temiz araçlar ve profesyonel yaklaşım'
              },
              {
                icon: MapPin,
                title: 'Her Noktaya',
                description: 'Antalya geneli tüm destinasyonlara transfer'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center h-full hover:shadow-xl transition-shadow duration-200">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hizmetlerimiz
            </h2>
            <p className="text-xl text-gray-600">
              İhtiyacınıza uygun transfer çözümleri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Havalimanı Transfer',
                description: 'Havalimanından otelinize veya otelinizden havalimanına güvenli transfer',
                image: 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=500',
                price: 'Ekonomi araçlar 8₺/km\'den başlayan fiyatlar'
              },
              {
                title: 'Şehir İçi Transfer',
                description: 'Antalya şehir merkezi ve ilçeleri arası konforlu ulaşım',
                image: 'https://images.pexels.com/photos/1131458/pexels-photo-1131458.jpeg?auto=compress&cs=tinysrgb&w=500',
                price: 'Saatlik kiralama seçenekleri mevcut'
              },
              {
                title: 'Özel Turlar',
                description: 'Size özel hazırlanmış tur programları ve geziler',
                image: 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=500',
                price: 'Kişiye özel fiyat hesaplama'
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <p className="text-sm text-blue-600 font-medium">{service.price}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              4 Kolay Adımda Rezervasyon
            </h2>
            <p className="text-xl text-gray-600">
              Hızlı ve güvenli rezervasyon sistemi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: 'Rota & Detay',
                description: 'Nereden nereye, ne zaman',
                icon: MapPin
              },
              {
                step: 2,
                title: 'Araç & Fiyat',
                description: 'Size uygun aracı seçin',
                icon: Users
              },
              {
                step: 3,
                title: 'Bilgileriniz',
                description: 'İletişim bilgilerinizi girin',
                icon: Phone
              },
              {
                step: 4,
                title: 'Onay & QR Kod',
                description: 'Rezervasyon tamamlandı',
                icon: Star
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {step.step}
                  </div>
                  <step.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transfer Rezervasyonunuzu Hemen Yapın
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Online rezervasyon sistemi ile kolayca rezervasyon yapın, QR kod ile yolculuğunuzu başlatın
          </p>
          <button className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-white text-white hover:bg-white hover:text-blue-600 focus:ring-white px-8 py-4 text-lg">
            Rezervasyon Yap
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Phone className="h-8 w-8 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">Telefon</h3>
              <p className="text-gray-300">+90 532 123 4567</p>
            </div>
            <div>
              <Mail className="h-8 w-8 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">E-posta</h3>
              <p className="text-gray-300">info@sbstravel.com</p>
            </div>
            <div>
              <MapPin className="h-8 w-8 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">Adres</h3>
              <p className="text-gray-300">Antalya, Türkiye</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;