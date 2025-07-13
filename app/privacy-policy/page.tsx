'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Eye, Lock, Database, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  SBS TRAVEL
                </h1>
                <p className="text-xs text-blue-200">Gizlilik Politikası</p>
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
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-white/90 text-sm">Güvenli & Şeffaf</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Gizlilik Politikası</h1>
            <p className="text-white/70 text-lg">Son güncelleme: 15 Ocak 2024</p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-white/80">
            {/* Introduction */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Giriş</h2>
              </div>
              <p className="leading-relaxed">
                SBS TRAVEL olarak, kişisel verilerinizin güvenliği bizim için son derece önemlidir. 
                Bu gizlilik politikası, hizmetlerimizi kullanırken kişisel verilerinizin nasıl toplandığını, 
                kullanıldığını ve korunduğunu açıklamaktadır.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Toplanan Bilgiler</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-2">Kişisel Bilgiler</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Ad, soyad</li>
                    <li>• E-posta adresi</li>
                    <li>• Telefon numarası</li>
                    <li>• Rezervasyon bilgileri</li>
                  </ul>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-2">Teknik Bilgiler</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• IP adresi</li>
                    <li>• Tarayıcı bilgileri</li>
                    <li>• Cihaz bilgileri</li>
                    <li>• Konum bilgileri (izin vermeniz halinde)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <UserCheck className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Verilerin Kullanımı</h2>
              </div>
              <div className="space-y-3">
                <p>Topladığımız kişisel veriler aşağıdaki amaçlarla kullanılmaktadır:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span>Transfer hizmetlerinin sağlanması ve yönetimi</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span>Müşteri desteği ve iletişim</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <span>Hizmet kalitesinin iyileştirilmesi</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <span>Yasal yükümlülüklerin yerine getirilmesi</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Veri Güvenliği</h2>
              </div>
              <div className="space-y-4">
                <p>Kişisel verilerinizin güvenliği için aşağıdaki önlemleri almaktayız:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">Teknik Güvenlik</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• SSL şifreleme</li>
                      <li>• Güvenli veri tabanları</li>
                      <li>• Düzenli güvenlik güncellemeleri</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">İdari Güvenlik</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Erişim kontrolü</li>
                      <li>• Personel eğitimi</li>
                      <li>• Düzenli denetimler</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Haklarınız</h2>
              <div className="space-y-3">
                <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-3">
                    <span className="text-blue-200 text-sm">Bilgi talep etme hakkı</span>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3">
                    <span className="text-green-200 text-sm">Düzeltme talep etme hakkı</span>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-3">
                    <span className="text-purple-200 text-sm">Silme talep etme hakkı</span>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3">
                    <span className="text-yellow-200 text-sm">İtiraz etme hakkı</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/50">
              <h2 className="text-2xl font-bold text-white mb-4">İletişim</h2>
              <p className="mb-4">
                Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="space-y-2">
                <p><strong>E-posta:</strong> privacy@sbstravel.com</p>
                <p><strong>Telefon:</strong> +90 532 123 4567</p>
                <p><strong>Adres:</strong> Antalya, Türkiye</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}