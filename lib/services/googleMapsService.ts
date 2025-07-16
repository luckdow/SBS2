// Konum: lib/services/googleMapsService.ts

/**
 * GoogleMapsService - STABİL ve TAM SÜRÜM
 *
 * Bu sürüm, "importLibrary" veya "removeChild" gibi hataları kesin olarak çözmek için
 * kütüphaneleri doğrudan script URL'si üzerinden, en kararlı ve klasik yöntemle yükler.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  // NOT: Lütfen Vercel'deki ortam değişkeninizin adının bu olduğundan emin olun.
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY; 

  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Script zaten yüklenmiş ve kütüphaneler mevcut mu diye kontrol et
      if (typeof window.google?.maps?.places !== 'undefined') {
        console.log('✅ Google Maps ve kütüphaneleri zaten yüklü.');
        return resolve(window.google);
      }

      if (!this.apiKey) {
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini .env.local ve Vercel ayarlarınıza ekleyin.';
        console.error(errorMsg);
        return reject(new Error(errorMsg));
      }
      
      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        // Script zaten varsa ama yüklenmemişse, bir süre bekle
        setTimeout(() => {
          if (window.google?.maps?.places) {
            resolve(window.google);
          } else {
            reject(new Error('Mevcut Google Haritalar scripti yüklenemedi.'));
          }
        }, 1000);
        return;
      }
      
      const script = document.createElement('script');
      script.id = scriptId;
      // Kütüphaneler (places, geometry, routes) doğrudan URL'de istenir. Beta kanalı kullanılmaz.
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry,routes&language=tr&region=TR&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps ve kütüphaneleri başarıyla yüklendi.');
        resolve(window.google);
      };
      
      script.onerror = (e) => {
        this.loadPromise = null;
        reject(new Error('Google Haritalar scripti yüklenemedi.'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
  
  static async getDirections(origin: string | google.maps.LatLng, destination: string | google.maps.LatLng): Promise<google.maps.DirectionsResult> {
    await this.loadGoogleMaps();
    const directionsService = new google.maps.DirectionsService();
    return new Promise((resolve, reject) => {
      directionsService.route({ origin, destination, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
        if (status === 'OK' && result) resolve(result);
        else reject(new Error(`Directions isteği başarısız: ${status}`));
      });
    });
  }
  
  // Hem Provider hem de rezervasyon sayfası tarafından kullanılan ana temizlik fonksiyonu.
  static forceCleanupAllGoogleMapsElements() {
    document.querySelectorAll('.pac-container, .gmnoprint').forEach(el => el.remove());
  }

  // Rezervasyon adımları arası geçiş için kullanılan daha güvenli temizlik metodu.
  static async safeStepTransitionCleanup(delay = 100): Promise<void> {
    this.forceCleanupAllGoogleMapsElements();
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
