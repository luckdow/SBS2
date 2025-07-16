// Konum: lib/services/googleMapsService.ts

/**
 * GoogleMapsService - STABİL SÜRÜM
 *
 * Bu sürüm, "importLibrary" hatasını kesin olarak çözmek için kütüphaneleri
 * doğrudan script URL'si üzerinden, en kararlı ve klasik yöntemle yükler.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Scriptin ve kütüphanelerin zaten yüklenip yüklenmediğini kontrol et
      if (typeof window.google?.maps?.places !== 'undefined') {
        return resolve(window.google);
      }

      if (!this.apiKey) {
        return reject(new Error('API anahtarı bulunamadı. NEXT_PUBLIC_Maps_API_KEY ayarını kontrol edin.'));
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry,routes&language=tr&region=TR`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve(window.google);
      
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
  
  // Bu fonksiyon hem Provider hem de safeStepTransitionCleanup tarafından kullanılabilir.
  static forceCleanupAllGoogleMapsElements() {
    document.querySelectorAll('.pac-container, .gmnoprint').forEach(el => el.remove());
  }

  static async safeStepTransitionCleanup(delay = 100): Promise<void> {
    this.forceCleanupAllGoogleMapsElements();
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
