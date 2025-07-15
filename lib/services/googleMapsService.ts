/**
 * GoogleMapsService - Kararlı Sürüm
 *
 * Bu sürüm, "importLibrary" hatasını kesin olarak çözmek için kütüphaneleri
 * doğrudan script URL'si üzerinden, eski ve daha stabil yöntemle yükler.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  /**
   * Google Maps API script'ini, eğer daha önce yüklenmediyse, güvenli bir şekilde sayfaya ekler.
   * Kütüphaneler (places, geometry, routes) doğrudan URL içinde istenir.
   */
  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof window.google?.maps?.places !== 'undefined') {
        console.log('✅ Google Maps ve kütüphaneleri zaten yüklü.');
        return resolve(window.google);
      }

      if (!this.apiKey) {
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini Vercel ayarlarına ekleyin.';
        console.error(errorMsg);
        return reject(new Error(errorMsg));
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        // Script zaten varsa ama google objesi henüz yoksa, yüklenmesini bekle
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
      // *** KESİN ÇÖZÜM: Kütüphaneler doğrudan URL'den istenir, v=beta kaldırılır ***
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry,routes&language=tr&region=TR`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps ana scripti ve kütüphaneleri başarıyla yüklendi.');
        resolve(window.google);
      };
      
      script.onerror = (e) => {
        console.error('❌ Google Haritalar scripti yüklenemedi.', e);
        this.loadPromise = null; // Başarısız olursa tekrar denenebilmesi için sıfırla
        document.getElementById(scriptId)?.remove();
        reject(new Error('Google Haritalar scripti yüklenemedi.'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  // --- Diğer Fonksiyonlar (Hiçbir Değişiklik Gerekmez) ---

  static async getDirections(origin: string | google.maps.LatLng, destination: string | google.maps.LatLng): Promise<google.maps.DirectionsResult> {
    await this.loadGoogleMaps();
    const directionsService = new google.maps.DirectionsService();
    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: origin,
          destination: destination,
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

  static safeRemoveElement(element: HTMLElement | null) {
    if (element && element.parentNode) {
      try {
        element.parentNode.removeChild(element);
      } catch (e) { /* Hata olursa görmezden gel */ }
    }
  }

  static forceCleanupAllGoogleMapsElements() {
    const selectors = '.pac-container, .gmnoprint';
    const elements = document.querySelectorAll(selectors);
    elements.forEach(el => this.safeRemoveElement(el as HTMLElement));
  }

  static async safeStepTransitionCleanup(delay = 200): Promise<void> {
    this.forceCleanupAllGoogleMapsElements();
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
