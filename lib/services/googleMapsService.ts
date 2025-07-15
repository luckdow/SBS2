/**
 * GoogleMapsService
 *
 * Bu servis, Google Maps JavaScript API'sini yüklemek ve yönetmek için merkezi ve güvenilir bir yapı sunar.
 * Temel amacı, API'nin uygulama boyunca yalnızca bir kez yüklenmesini sağlamak ve React component'ları
 * arasında geçiş yaparken ortaya çıkan "removeChild" gibi DOM hatalarını kesin olarak önlemektir.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  
  // *** DÜZELTME: API Anahtarı değişken adı standart hale getirildi. ***
  // .env.local dosyanızdaki anahtarı doğru okuması için bu isim kullanılmalı.
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  /**
   * Google Maps API script'ini, eğer daha önce yüklenmediyse, güvenli bir şekilde sayfaya ekler.
   */
  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof window.google?.maps !== 'undefined') {
        console.log('✅ Google Maps zaten yüklü.');
        return resolve(window.google);
      }

      if (!this.apiKey) {
        // *** DÜZELTME: Hata mesajındaki değişken adı da düzeltildi. ***
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini .env.local dosyanıza ekleyin.';
        console.error(errorMsg);
        return reject(new Error(errorMsg));
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        console.warn('Google Maps script elementi zaten DOM\'da mevcut.');
        setTimeout(() => {
          if (window.google?.maps) resolve(window.google);
          else reject(new Error('Mevcut Google Haritalar scripti yüklenemedi.'));
        }, 500);
        return;
      }
      
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry&language=tr&region=TR`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps scripti başarıyla yüklendi.');
        resolve(window.google);
      };
      
      script.onerror = () => {
        console.error('❌ Google Haritalar scripti yüklenemedi.');
        this.loadPromise = null; 
        document.getElementById(scriptId)?.remove();
        reject(new Error('Google Haritalar scripti yüklenemedi.'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Bir elementi DOM'dan kaldırmadan önce varlığını ve geçerli bir parent'a sahip olduğunu kontrol eder.
   */
  static safeRemoveElement(element: HTMLElement | null) {
    if (element && element.parentNode) {
      try {
        element.parentNode.removeChild(element);
      } catch (e) {
        console.warn('Element temizlenirken beklenen bir hata oluştu (genellikle zararsız):', e);
      }
    }
  }

  /**
   * Google'ın otomatik olarak oluşturduğu adres öneri kutularını (.pac-container) güvenli bir şekilde temizler.
   */
  static forceCleanupAllGoogleMapsElements(): void {
    if (typeof window === 'undefined') return;
    const selectors = ['.pac-container'];
    console.log(`🧹 Google Maps temizliği başlatılıyor...`);
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach(element => this.safeRemoveElement(element as HTMLElement));
        }
    });
    console.log('✅ Google Maps temizliği tamamlandı.');
  }

  /**
   * Adımlar arası geçişler için özel temizlik fonksiyonu.
   */
  static safeStepTransitionCleanup(delay = 100): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.forceCleanupAllGoogleMapsElements();
        resolve();
      }, delay);
    });
  }

  /**
   * Rota hesaplama fonksiyonu.
   */
  static async getDirections(
    origin: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    destination: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<google.maps.DirectionsResult> {
    const google = await this.loadGoogleMaps();
    if (!origin || !destination) throw new Error('Başlangıç ve varış noktaları gereklidir');

    const directionsService = new google.maps.DirectionsService();
    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          travelMode,
          unitSystem: google.maps.UnitSystem.METRIC,
          region: 'TR'
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            let userFriendlyError = 'Rota hesaplanamadı.';
            if (status === 'ZERO_RESULTS') userFriendlyError = 'Belirtilen adresler arasında bir rota bulunamadı.';
            else if (status === 'NOT_FOUND') userFriendlyError = 'Adreslerden biri haritada bulunamadı.';
            reject(new Error(userFriendlyError));
          }
        }
      );
    });
  }
}

export default GoogleMapsService;
