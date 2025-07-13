'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowLeft, 
  Award, 
  Shield, 
  Clock, 
  Star,
  MapPin,
  Car,
  Heart,
  Target,
  Zap,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  SBS TRAVEL
                </h1>
                <p className="text-xs text-blue-200">Hakkımızda</p>
              </div>
            </Link>
            <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6">
            <Heart className="h-4 w-4 text-red-400" />
            <span className="text-white/90 text-sm">Müşteri Odaklı Hizmet</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              SBS TRAVEL
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Antalya'nın en güvenilir premium transfer hizmeti. 
            2020'den beri binlerce müşteriye güvenli ve konforlu yolculuk deneyimi sunuyoruz.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { number: '10K+', label: 'Mutlu Müşteri', icon: Users },
            { number: '4.9★', label: 'Müşteri Puanı', icon: Star },
            { number: '99.9%', label: 'Güvenlik Oranı', icon: Shield },
            { number: '24/7', label: 'Kesintisiz Hizmet', icon: Clock }
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

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Target className="h-8 w-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Misyonumuz</h2>
            </div>
            <p className="text-white/80 leading-relaxed">
              Antalya'da yaşayan ve ziyaret eden herkese, güvenli, konforlu ve 
              premium kalitede transfer hizmeti sunarak, yolculuk deneyimlerini 
              unutulmaz kılmak. Teknoloji ile geleneksel hizmet anlayışını 
              birleştirerek, sektörde yeni standartlar oluşturmak.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="h-8 w-8 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Vizyonumuz</h2>
            </div>
            <p className="text-white/80 leading-relaxed">
              Türkiye'nin en büyük ve en güvenilir premium transfer platformu 
              olmak. Dijital teknolojiler ile desteklenen hizmet modelimizle, 
              müşteri memnuniyetinde sektör lideri konumunu koruyarak, 
              uluslararası arenada tanınan bir marka haline gelmek.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Değerlerimiz</h2>
            <p className="text-white/70 text-lg">Hizmet anlayışımızın temelini oluşturan değerler</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Güvenlik',
                description: 'Müşterilerimizin güvenliği her şeyden önce gelir. Sigortalı araçlar, lisanslı şoförler ve sürekli denetim.',
                gradient: 'from-green-400 to-blue-500'
              },
              {
                icon: Award,
                title: 'Kalite',
                description: 'Premium hizmet standartları ile sektörde fark yaratıyoruz. Her detayda mükemmellik arayışı.',
                gradient: 'from-purple-400 to-pink-500'
              },
              {
                icon: Heart,
                title: 'Müşteri Odaklılık',
                description: 'Müşteri memnuniyeti bizim en büyük başarımızdır. Her ihtiyaca özel çözümler sunuyoruz.',
                gradient: 'from-yellow-400 to-orange-500'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 hover:bg-white/20 transition-all duration-300 text-center"
              >
                <div className={`bg-gradient-to-r ${value.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-white/70 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Hizmet Alanlarımız</h2>
            <p className="text-white/70 text-lg">Antalya genelinde sunduğumuz premium transfer hizmetleri</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: 'Havalimanı Transferi',
                description: 'Terminal karşılama ile güvenli ulaşım'
              },
              {
                icon: Car,
                title: 'Otel Transferi',
                description: 'Tüm otellere kapıdan kapıya hizmet'
              },
              {
                icon: Globe,
                title: 'Şehir Turu',
                description: 'Antalya\'nın güzelliklerini keşfedin'
              },
              {
                icon: Star,
                title: 'VIP Hizmet',
                description: 'Özel araç ve şoför hizmeti'
              }
            ].map((service, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6 text-center">
                <service.icon className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-white/70 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-8 border border-blue-500/50">
            <h2 className="text-3xl font-bold text-white mb-4">
              Bizimle Yolculuğa Çıkın
            </h2>
            <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
              Premium transfer deneyimi için hemen rezervasyon yapın. 
              Güvenli, konforlu ve unutulmaz bir yolculuk sizi bekliyor.
            </p>
            <Link 
              href="/reservation" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Hemen Rezervasyon Yap
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}