'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/ui/Footer';
import { 
  MapPin, 
  Shield, 
  Clock, 
  Star, 
  ArrowRight, 
  Phone, 
  Mail, 
  Users, 
  Plane,
  Car,
  CheckCircle,
  Sparkles,
  Globe,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  SBS TRAVEL
                </h1>
                <p className="text-xs text-blue-200">Premium Transfer Service</p>
              </div>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white/90 hover:text-white font-medium transition-all duration-300 hover:scale-105">
                Ana Sayfa
              </Link>
              <Link href="/reservation" className="text-white/90 hover:text-white font-medium transition-all duration-300 hover:scale-105">
                Rezervasyon
              </Link>
              <Link href="/admin" className="text-white/90 hover:text-white font-medium transition-all duration-300 hover:scale-105">
                Admin
              </Link>
              <Link href="/driver" className="text-white/90 hover:text-white font-medium transition-all duration-300 hover:scale-105">
                Şoför
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link 
                href="/reservation" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Rezervasyon
              </Link>
              <Link 
                href="/login" 
                className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-2 rounded-full hover:bg-white/20 transition-all duration-300"
              >
                Giriş
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-white/90 text-sm">Premium Transfer Hizmeti</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Lüks Transfer
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Deneyimi
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-white/80 leading-relaxed"
            >
              Antalya'nın en prestijli transfer hizmeti. Premium araçlar, profesyonel şoförler, 
              <span className="text-yellow-400"> 7/24 güvenilir hizmet</span>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link 
                href="/reservation" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <span className="relative z-10">Hemen Rezervasyon Yap</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <button className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-full hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105">
                <Phone className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                +90 532 123 4567
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            >
              {[
                { number: '10K+', label: 'Mutlu Müşteri', icon: Users },
                { number: '99.9%', label: 'Güvenlik Oranı', icon: Shield },
                { number: '24/7', label: 'Kesintisiz Hizmet', icon: Clock },
                { number: '5★', label: 'Müşteri Puanı', icon: Star }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-white/70 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Neden SBS Travel?
                </span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Premium hizmet standartlarımızla fark yaratıyoruz
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Güvenli Yolculuk',
                description: 'Sigortalı araçlar ve lisanslı şoförlerle %100 güvenlik',
                gradient: 'from-green-400 to-blue-500'
              },
              {
                icon: Clock,
                title: '7/24 Hizmet',
                description: 'Gece gündüz kesintisiz premium transfer hizmeti',
                gradient: 'from-purple-400 to-pink-500'
              },
              {
                icon: Car,
                title: 'Lüks Araç Filosu',
                description: 'Mercedes, BMW ve Audi premium araç seçenekleri',
                gradient: 'from-yellow-400 to-orange-500'
              },
              {
                icon: Globe,
                title: 'Geniş Kapsama',
                description: 'Antalya geneli tüm destinasyonlara transfer',
                gradient: 'from-blue-400 to-purple-500'
              },
              {
                icon: Award,
                title: 'Ödüllü Hizmet',
                description: 'Müşteri memnuniyetinde sektör lideri',
                gradient: 'from-pink-400 to-red-500'
              },
              {
                icon: Sparkles,
                title: 'VIP Deneyim',
                description: 'Kişiselleştirilmiş premium hizmet anlayışı',
                gradient: 'from-indigo-400 to-purple-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 h-full">
                  <div className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 text-center">{feature.title}</h3>
                  <p className="text-white/70 text-center leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  4 Kolay Adım
                </span>
              </h2>
              <p className="text-xl text-white/70">
                Rezervasyondan yolculuğa kadar sorunsuz deneyim
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: 'Rota Seçimi',
                description: 'Nereden nereye gideceğinizi belirtin',
                icon: MapPin,
                color: 'from-blue-400 to-blue-600'
              },
              {
                step: 2,
                title: 'Araç & Tarih',
                description: 'Premium araç seçin, tarih belirleyin',
                icon: Car,
                color: 'from-purple-400 to-purple-600'
              },
              {
                step: 3,
                title: 'Bilgileriniz',
                description: 'İletişim bilgilerinizi girin',
                icon: Users,
                color: 'from-pink-400 to-pink-600'
              },
              {
                step: 4,
                title: 'QR Kod & Yolculuk',
                description: 'QR kodunuzla yolculuğa başlayın',
                icon: CheckCircle,
                color: 'from-green-400 to-green-600'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 h-full">
                  <div className={`bg-gradient-to-r ${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300`}>
                    {step.step}
                  </div>
                  <step.icon className="h-8 w-8 text-white mx-auto mb-4 opacity-80" />
                  <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-12 border border-white/20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Rezervasyonunuzu
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                Hemen Yapın
              </span>
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Premium transfer deneyimi için sadece birkaç tık uzaktasınız. 
              QR kod ile kolay başlangıç, güvenli yolculuk garantisi.
            </p>
            <Link 
              href="/reservation" 
              className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <span className="relative z-10">Rezervasyon Yap</span>
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            
            <div className="flex items-center space-x-4 mt-4">
              <Link 
                href="/login" 
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                Giriş Yap
              </Link>
              <span className="text-white/40">•</span>
              <Link 
                href="/register" 
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Phone,
                title: '7/24 Destek Hattı',
                content: '+90 532 123 4567',
                gradient: 'from-green-400 to-blue-500'
              },
              {
                icon: Mail,
                title: 'E-posta İletişim',
                content: 'info@sbstravel.com',
                gradient: 'from-purple-400 to-pink-500'
              },
              {
                icon: MapPin,
                title: 'Hizmet Bölgesi',
                content: 'Antalya Geneli',
                gradient: 'from-yellow-400 to-orange-500'
              }
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                  <div className={`bg-gradient-to-r ${contact.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <contact.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{contact.title}</h3>
                  <p className="text-white/80 text-lg">{contact.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}