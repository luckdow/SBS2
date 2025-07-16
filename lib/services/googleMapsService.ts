// Konum: lib/services/googleMapsService.ts

/**
 * Google Haritalar API'si ile etkileşim kurmak için bir servis sınıfı.
 * API'nin yalnızca bir kez yüklenmesini sağlayan bir singleton deseni kullanır.
 * Rota hesaplama ve harita elemanlarını temizleme gibi yardımcı fonksiyonlar içerir.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  // NOT: Lütfen Vercel'deki ortam değişkeninizin adının bu olduğundan emin olun.
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  /**
   * Google Maps JavaScript API'sini yükler.
   * Script zaten yüklüyse, mevcut promise'i döndürür.
   * Bu fonksiyon, yeni Place Autocomplete bileşeni için gerekli olan `places`, `geometry` ve `routes` kütüphanelerini yükler.
   */
  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Script'in ve gerekli temel kütüphanelerin (örn. places) zaten yüklenip yüklenmediğini kontrol et.
      if (typeof window.google?.maps?.places?.AutocompleteService === 'function') {
        console.log('✅ Google Maps ve kütüphaneleri zaten yüklü.');
        return resolve(window.google);
      }

      if (!this.apiKey) {
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini .env.local ve Vercel ayarlarınıza ekleyin.';
        console.error(errorMsg);
        // Promise'i null'a sıfırlayarak gelecekteki denemelere izin ver
        this.loadPromise = null;
        return reject(new Error(errorMsg));
      }
      
      const scriptId = 'google-maps-script';
      // Eğer script etiketi zaten varsa, tekrar ekleme. Yüklenmesini bekle.
      if (document.getElementById(scriptId)) {
        // Yüklenmesi için bir süre bekle ve tekrar kontrol et.
        // Bu, birden fazla bileşenin aynı anda yüklemeye çalıştığı durumları yönetir.
        const checkInterval = setInterval(() => {
          if (typeof window.google?.maps?.places?.AutocompleteService === 'function') {
            clearInterval(checkInterval);
            resolve(window.google);
          }
        }, 100);
        
        // Timeout
        setTimeout(() => {
            clearInterval(checkInterval);
            if (typeof window.google?.maps?.places?.AutocompleteService !== 'function') {
                this.loadPromise = null;
                reject(new Error('Mevcut Google Haritalar scripti yüklenemedi.'));
            }
        }, 5000); // 5 saniye sonra zaman aşımı
        return;
      }
      
      const script = document.createElement('script');
      script.id = scriptId;
      // Kütüphaneler (places, geometry, routes) doğrudan URL'de istenir.
      // `loading=async` script'in doküman yüklenmesini bloklamadan asenkron olarak yüklenmesini sağlar.
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry,routes&language=tr&region=TR&loading=async`;
      script.async = true; // `loading=async` ile birlikte en iyi pratik
      
      // `window.gm_auth_failure` hatasını yakalamak için global bir fonksiyon tanımla
      window.gm_auth_failure = () => {
        console.error('❌ Google Maps Kimlik Doğrulama Hatası. API Anahtarınızı, faturalandırmayı ve kısıtlamaları kontrol edin.');
        this.loadPromise = null; // Yükleme başarısız oldu, promise'i sıfırla
        document.getElementById(scriptId)?.remove(); // Başarısız script'i kaldır
        reject(new Error('Google Maps kimlik doğrulaması başarısız.'));
      };

      script.onload = () => {
        // onload tetiklense bile `google` nesnesinin tam olarak hazır olmayabileceği durumlar için
        if (window.google?.maps?.places) {
          console.log('✅ Google Maps ve kütüphaneleri başarıyla yüklendi.');
          resolve(window.google);
        } else {
          // Bu durum nadir olmalı, ancak bir güvenlik ağı olarak
          this.loadPromise = null;
          reject(new Error('Google Haritalar scripti yüklendi ancak `window.google` nesnesi bulunamadı.'));
        }
      };
      
      script.onerror = (e) => {
        this.loadPromise = null;
        console.error("Google Haritalar scripti yüklenirken ağ hatası oluştu.", e);
        reject(new Error('Google Haritalar scripti yüklenemedi. Ağ bağlantınızı kontrol edin.'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
  
  static async getDirections(origin: { placeId?: string; location?: google.maps.LatLng | google.maps.LatLngLiteral; }, destination: { placeId?: string; location?: google.maps.LatLng | google.maps.LatLngLiteral; }): Promise<google.maps.DirectionsResult> {
    await this.loadGoogleMaps();
    const directionsService = new google.maps.DirectionsService();

    const request: google.maps.DirectionsRequest = {
        origin: origin.placeId ? { placeId: origin.placeId } : origin.location,
        destination: destination.placeId ? { placeId: destination.placeId } : destination.location,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
            resolve(result);
        } else {
            console.error(`Directions isteği başarısız oldu. Durum: ${status}`, {origin, destination});
            reject(new Error(`Rota hesaplanamadı: ${status}`));
        }
      });
    });
  }
  
  /**
   * Google Maps tarafından DOM'a eklenen ve React'in kontrolü dışında kalabilen
   * tüm artık elemanları (örn. eski otomatik tamamlama menüleri) zorla temizler.
   * Bu fonksiyon, React bileşenleri unmount olduğunda bir güvenlik ağı olarak kullanılır.
   */
  static forceCleanupAllGoogleMapsElements() {
    // `.pac-container` eski Autocomplete'e aittir. Yeni PlaceAutocompleteElement bunu oluşturmaz,
    // ancak eski kod kalıntılarına veya diğer kütüphanelere karşı bir önlem olarak tutulur.
    // `.gmnoprint` harita üzerindeki çeşitli kontrol elemanlarını içerir.
    document.querySelectorAll('.pac-container, .gmnoprint').forEach(el => el.remove());
  }

  /**
   * Özellikle rezervasyon adımları gibi hızlı React bileşen unmount/mount döngüleri arasında
   * Google Maps elemanlarının temizlenmesini garanti altına almak için tasarlanmış güvenli bir metot.
   * Önce temizliği zorlar, sonra bir sonraki adıma geçmeden önce kısa bir gecikme ekler.
   */
  static async safeStepTransitionCleanup(delay = 100): Promise<void> {
    this.forceCleanupAllGoogleMapsElements();
    // Gecikme, DOM'un güncellenmesi ve React'in state geçişlerini tamamlaması için zaman tanır.
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Global Google Maps kimlik doğrulama hatası yakalayıcısı için tip tanımı
declare global {
  interface Window {
    gm_auth_failure?: () => void;
  }
}
