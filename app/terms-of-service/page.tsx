'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, CheckCircle, AlertTriangle, CreditCard, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  SBS TRAVEL
                </h1>
                <p className="text-xs text-blue-200">Hizmet Sözleşmesi</p>
              </div>
            </Link>
            <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-4">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-white/90 text-sm">Yasal Belgeler</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Hizmet Sözleşmesi</h1>
            <p className="text-white/70 text-lg">Son güncelleme: 15 Ocak 2024</p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-white/80">
            {/* Introduction */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Genel Hükümler</h2>
              </div>
              <p className="leading-relaxed">
                Bu sözleşme, SBS TRAVEL ("Şirket") ile hizmet alan müşteri ("Müşteri") arasında 
                transfer hizmetlerinin sunulması konusunda akdedilen sözleşmedir. 
                Rezervasyon yaparak bu şartları kabul etmiş sayılırsınız.
              </p>
            </section>

            {/* Service Definition */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Hizmet Tanımı</h2>
              </div>
              <div className="space-y-4">
                <p>SBS TRAVEL aşağıdaki hizmetleri sunmaktadır:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Transfer Hizmetleri</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Havalimanı transferi</li>
                      <li>• Otel transferi</li>
                      <li>• Şehir içi transfer</li>
                      <li>• VIP transfer hizmetleri</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Ek Hizmetler</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Bebek koltuğu</li>
                      <li>• Havalimanı karşılama</li>
                      <li>• Bagaj yardımı</li>
                      <li>• Özel istekler</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Reservation Terms */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Rezervasyon Şartları</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-2">Rezervasyon Süreci</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <span>Online rezervasyon sistemi üzerinden rezervasyon yapılır</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <span>Rezervasyon onayı e-posta ile gönderilir</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <span>QR kod ile hizmet başlatılır</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-2">Ödeme Şartları</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <span>Ödeme hizmet başlangıcında yapılır</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <span>Nakit veya kredi kartı ile ödeme kabul edilir</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <span>Fiyatlar KDV dahildir</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">İptal ve İade Politikası</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-2">İptal Şartları</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>24 saat öncesi iptal:</span>
                      <span className="text-green-400 font-semibold">%100 iade</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>12-24 saat arası iptal:</span>
                      <span className="text-yellow-400 font-semibold">%50 iade</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>12 saat içi iptal:</span>
                      <span className="text-red-400 font-semibold">İade yok</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Sorumluluklar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">Şirket Sorumlulukları</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Güvenli ve temiz araç sağlama</li>
                    <li>• Profesyonel şoför hizmeti</li>
                    <li>• Zamanında hizmet sunma</li>
                    <li>• Sigorta kapsamı sağlama</li>
                  </ul>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">Müşteri Sorumlulukları</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Doğru bilgi verme</li>
                    <li>• Zamanında hazır olma</li>
                    <li>• Ödeme yükümlülüğü</li>
                    <li>• Araç içi kurallara uyma</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/50">
              <h2 className="text-2xl font-bold text-white mb-4">İletişim ve Şikayetler</h2>
              <p className="mb-4">
                Hizmetlerimiz hakkında sorularınız veya şikayetleriniz için:
              </p>
              <div className="space-y-2">
                <p><strong>E-posta:</strong> info@sbstravel.com</p>
                <p><strong>Telefon:</strong> +90 532 123 4567</p>
                <p><strong>Adres:</strong> Antalya, Türkiye</p>
                <p><strong>Çalışma Saatleri:</strong> 7/24 Kesintisiz Hizmet</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}