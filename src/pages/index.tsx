import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Shield, Clock, Star, ArrowRight, Phone, Mail } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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
              <Button size="lg" className="text-lg px-8 py-4">
                Hemen Rezervasyon Yap
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600">
                <Phone className="mr-2 h-5 w-5" />
                Bizi Arayın
              </Button>
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
                <Card hover className="p-6 text-center h-full">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
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
                <Card hover className="overflow-hidden">
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
                </Card>
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
          <Button size="lg" variant="outline" className="text-blue-600 bg-white hover:bg-gray-100 text-lg px-8 py-4">
            Rezervasyon Yap
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
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
};

export default HomePage;