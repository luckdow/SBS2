// luckdow/sbs2/SBS2-093e6f6df387c76e0b5effe7975991d315ee6e55/lib/services/googleMapsService.ts

/**
 * GoogleMapsService - SIFIRDAN YAZILMIŞ KARARLI SÜRÜM
 *
 * Bu servis, "importLibrary" veya "getDirections" gibi fonksiyonların eksik olma
 * hatalarını tamamen gidermek için tasarlanmıştır. Kütüphaneleri en stabil yöntemle yükler.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  /**
   * Google Maps API script'ini, kütüphanelerle birlikte güvenli bir şekilde yükler.
   * Bu fonksiyon, tüm Google Maps işlemlerinden önce çağrılmalıdır.
   */
  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Script zaten yüklenmiş mi diye kontrol et
      if (typeof window.google?.maps?.places !== 'undefined') {
        console.log('✅ Google Maps ve kütüphaneleri zaten yüklü.');
        return resolve(window.google);
      }

      // API anahtarının varlığını kontrol et
      if (!this.apiKey) {
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini Vercel proje ayarlarınıza ekleyin.';
        console.error(errorMsg);
        return reject(new Error(errorMsg));
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        console.warn('Google Maps scripti DOM\'da mevcut ama henüz tam yüklenmemiş. Bekleniyor...');
        setTimeout(() => {
          if (window.google?.maps?.places) {
            resolve(window.google);
          } else {
            reject(new Error('Mevcut Google Haritalar scripti yüklenemedi.'));
          }
        }, 1000); // 1 saniye bekle ve tekrar kontrol et
        return;
      }
      
      const script = document.createElement('script');
      script.id = scriptId;
      // Kütüphaneler (places, geometry, routes) doğrudan URL'den istenir. Bu en kararlı yöntemdir.
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry,routes&language=tr&region=TR`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps ana scripti ve kütüphaneleri başarıyla yüklendi.');
        resolve(window.google);
      };
      
      script.onerror = (e) => {
        console.error('❌ Google Haritalar scripti yüklenemedi. API anahtarınızı ve Google Cloud ayarlarınızı kontrol edin.', e);
        this.loadPromise = null;
        document.getElementById(scriptId)?.remove();
        reject(new Error('Google Haritalar scripti yüklenemedi.'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * İki nokta arasında yol tarifi, mesafe ve süre bilgilerini hesaplar.
   */
  static async getDirections(origin: string | google.maps.LatLng, destination: string | google.maps.LatLng): Promise<google.maps.DirectionsResult> {
    await this.loadGoogleMaps(); // API'nin yüklendiğinden emin ol
    const directionsService = new google.maps.DirectionsService();
    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions isteği başarısız oldu: ${status}`));
          }
        }
      );
    });
  }

  /**
   * Component geçişlerinde "ghost" elementleri temizleyerek DOM hatalarını önler.
   */
  static async safeStepTransitionCleanup(delay = 200): Promise<void> {
    const selectors = '.pac-container, .gmnoprint';
    const elements = document.querySelectorAll(selectors);
    
    elements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    // DOM'un güncellenmesi için kısa bir gecikme
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
