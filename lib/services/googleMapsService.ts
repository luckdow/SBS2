/**
 * GoogleMapsService - FİNAL SÜRÜM (Tüm Hatalar İçin Düzeltildi)
 *
 * Bu servis, modern özellikleri desteklemek için 'beta' kanalını kullanır
 * ve projedeki tüm bileşenlerle uyumlu olacak şekilde tasarlanmıştır.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  private static async loadLibraries(): Promise<void> {
    try {
      await Promise.all([
        google.maps.importLibrary("places"),
        google.maps.importLibrary("geometry"),
        google.maps.importLibrary("routes"),
      ]);
      console.log('✅ Google Maps "places", "geometry", "routes" kütüphaneleri yüklendi.');
    } catch (e) {
      console.error('❌ Google Maps kütüphaneleri yüklenemedi:', e);
      throw new Error('Gerekli Google Haritalar kütüphaneleri yüklenemedi.');
    }
  }

  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof window.google?.maps?.importLibrary === 'function') {
        this.loadLibraries().then(() => resolve(window.google)).catch(reject);
        return;
      }

      if (!this.apiKey) {
        const errorMsg = 'API anahtarı bulunamadı. NEXT_PUBLIC_Maps_API_KEY değişkenini kontrol edin.';
        return reject(new Error(errorMsg));
      }
      
      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        setTimeout(() => {
            if (typeof window.google?.maps?.importLibrary === 'function') {
                this.loadLibraries().then(() => resolve(window.google)).catch(reject);
            } else {
                reject(new Error('Mevcut Google Haritalar scripti yüklenemedi.'));
            }
        }, 1500);
        return;
      }
      
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&v=beta&loading=async&language=tr&region=TR`;
      script.async = true;
      
      script.onload = () => {
        this.loadLibraries().then(() => resolve(window.google)).catch(reject);
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
      directionsService.route({ 
        origin, 
        destination, 
        travelMode: google.maps.TravelMode.DRIVING 
      }, (result, status) => {
        if (status === 'OK' && result) {
            resolve(result);
        } else {
            reject(new Error(`Directions isteği başarısız: ${status}`));
        }
      });
    });
  }

  /**
   * ### YENİDEN EKLENDİ ###
   * GoogleMapsProvider tarafından kullanılan eski temizlik fonksiyonu.
   * Bu fonksiyon, 'forceCleanupAllGoogleMapsElements does not exist' hatasını çözer.
   */
  static forceCleanupAllGoogleMapsElements() {
    document.querySelectorAll('.pac-container, .gmnoprint').forEach(el => el.remove());
  }
  
  static async safeStepTransitionCleanup(delay = 100): Promise<void> {
    this.forceCleanupAllGoogleMapsElements(); // Artık bu fonksiyonu güvenle çağırabiliriz.
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
