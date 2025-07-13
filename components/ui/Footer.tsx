import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star,
  Shield,
  Award,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 border-t border-white/20">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  SBS TRAVEL
                </h3>
                <p className="text-xs text-blue-200">Premium Transfer</p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed">
              Antalya'nın en güvenilir premium transfer hizmeti. 
              7/24 profesyonel hizmet anlayışı ile yanınızdayız.
            </p>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-white font-semibold">4.9/5</span>
              <span className="text-white/60">• 10,000+ Mutlu Müşteri</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Hızlı Linkler</h4>
            <nav className="space-y-3">
              <Link href="/" className="block text-white/70 hover:text-white transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/reservation" className="block text-white/70 hover:text-white transition-colors">
                Rezervasyon
              </Link>
              <Link href="/about" className="block text-white/70 hover:text-white transition-colors">
                Hakkımızda
              </Link>
              <Link href="/services" className="block text-white/70 hover:text-white transition-colors">
                Hizmetlerimiz
              </Link>
              <Link href="/contact" className="block text-white/70 hover:text-white transition-colors">
                İletişim
              </Link>
              <Link href="/faq" className="block text-white/70 hover:text-white transition-colors">
                Sık Sorulan Sorular
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Yasal</h4>
            <nav className="space-y-3">
              <Link href="/privacy-policy" className="block text-white/70 hover:text-white transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/terms-of-service" className="block text-white/70 hover:text-white transition-colors">
                Hizmet Sözleşmesi
              </Link>
              <Link href="/kvkk" className="block text-white/70 hover:text-white transition-colors">
                KVKK Aydınlatma Metni
              </Link>
              <Link href="/cancellation-policy" className="block text-white/70 hover:text-white transition-colors">
                İptal ve İade Politikası
              </Link>
              <Link href="/cookie-policy" className="block text-white/70 hover:text-white transition-colors">
                Çerez Politikası
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">İletişim</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">7/24 Destek</p>
                  <a href="tel:+905321234567" className="text-white/70 hover:text-white transition-colors">
                    +90 532 123 4567
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">E-posta</p>
                  <a href="mailto:info@sbstravel.com" className="text-white/70 hover:text-white transition-colors">
                    info@sbstravel.com
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Çalışma Saatleri</p>
                  <p className="text-white/70">7/24 Kesintisiz Hizmet</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-white font-medium mb-3">Sosyal Medya</p>
              <div className="flex space-x-3">
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <Facebook className="h-5 w-5 text-white" />
                </a>
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <Instagram className="h-5 w-5 text-white" />
                </a>
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <Twitter className="h-5 w-5 text-white" />
                </a>
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <Youtube className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-white/60 text-sm">
                © 2024 SBS TRAVEL. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-white/60 text-sm">SSL Güvenli</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <span className="text-white/60 text-sm">Lisanslı</span>
                </div>
              </div>
            </div>
            <div className="text-white/60 text-sm">
              Made with ❤️ in Antalya
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}