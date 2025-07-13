'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Database, UserCheck, Lock, Eye } from 'lucide-react';
import Link from 'next/link';

export default function KVKKPage() {
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
                <p className="text-xs text-blue-200">KVKK Aydınlatma Metni</p>
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
              <span className="text-white/90 text-sm">KVKK Uyumlu</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">KVKK Aydınlatma Metni</h1>
            <p className="text-white/70 text-lg">Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme</p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-white/80">
            {/* Data Controller */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Veri Sorumlusu</h2>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                <p className="mb-4">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, 
                  kişisel verilerinizin veri sorumlusu SBS TRAVEL'dir.
                </p>
                <div className="space-y-2">
                  <p><strong>Şirket Unvanı:</strong> SBS TRAVEL</p>
                  <p><strong>Adres:</strong> Antalya, Türkiye</p>
                  <p><strong>E-posta:</strong> kvkk@sbstravel.com</p>
                  <p><strong>Telefon:</strong> +90 532 123 4567</p>
                </div>
              </div>
            </section>

            {/* Data Processing */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <UserCheck className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Kişisel Verilerin İşlenme Amaçları</h2>
              </div>
              <div className="space-y-4">
                <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Hizmet Sunumu</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Transfer hizmetlerinin sağlanması</li>
                      <li>• Rezervasyon yönetimi</li>
                      <li>• Müşteri iletişimi</li>
                      <li>• Ödeme işlemleri</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Yasal Yükümlülükler</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Vergi mevzuatı gereği</li>
                      <li>• Ticaret kanunu gereği</li>
                      <li>• Tüketici hakları gereği</li>
                      <li>• Diğer yasal düzenlemeler</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Categories */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">İşlenen Kişisel Veri Kategorileri</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Kimlik Verileri</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Ad, soyad</li>
                      <li>• T.C. kimlik numarası</li>
                      <li>• Doğum tarihi</li>
                    </ul>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">İletişim Verileri</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• E-posta adresi</li>
                      <li>• Telefon numarası</li>
                      <li>• Adres bilgileri</li>
                    </ul>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">İşlem Verileri</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Rezervasyon bilgileri</li>
                      <li>• Ödeme bilgileri</li>
                      <li>• Hizmet geçmişi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Legal Basis */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">İşlemenin Hukuki Sebepleri</h2>
              </div>
              <div className="space-y-3">
                <p>Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm">Sözleşmenin kurulması veya ifası</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Hukuki yükümlülüğün yerine getirilmesi</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm">Meşru menfaatler</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm">Açık rıza</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">KVKK Kapsamındaki Haklarınız</h2>
              <div className="space-y-4">
                <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-3">
                      <span className="text-blue-200 text-sm font-medium">Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
                    </div>
                    <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3">
                      <span className="text-green-200 text-sm font-medium">İşlenen kişisel verileriniz hakkında bilgi talep etme</span>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-3">
                      <span className="text-purple-200 text-sm font-medium">İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</span>
                    </div>
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3">
                      <span className="text-yellow-200 text-sm font-medium">Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                      <span className="text-red-200 text-sm font-medium">Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</span>
                    </div>
                    <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-xl p-3">
                      <span className="text-indigo-200 text-sm font-medium">Kişisel verilerin silinmesini veya yok edilmesini isteme</span>
                    </div>
                    <div className="bg-pink-500/20 border border-pink-500/50 rounded-xl p-3">
                      <span className="text-pink-200 text-sm font-medium">Kişisel verilerin işlenmesine itiraz etme</span>
                    </div>
                    <div className="bg-teal-500/20 border border-teal-500/50 rounded-xl p-3">
                      <span className="text-teal-200 text-sm font-medium">İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin aleyhine bir sonucun ortaya çıkmasına itiraz etme</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/50">
              <h2 className="text-2xl font-bold text-white mb-4">Başvuru Yöntemleri</h2>
              <p className="mb-4">
                KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
              </p>
              <div className="space-y-2">
                <p><strong>E-posta:</strong> kvkk@sbstravel.com</p>
                <p><strong>Posta:</strong> SBS TRAVEL, Antalya, Türkiye</p>
                <p><strong>Başvuru Formu:</strong> www.sbstravel.com/kvkk-basvuru</p>
              </div>
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  <strong>Not:</strong> Başvurularınız en geç 30 gün içinde değerlendirilecek ve sonuçlandırılacaktır.
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}