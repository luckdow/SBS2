/**
 * GoogleMapsService - FİNAL SÜRÜM
 *
 * Bu servis, modern özellikleri desteklemek ve versiyon uyumsuzluklarını
 * gidermek için Google Maps API'nin 'beta' kanalını kullanır.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  /**
   * Gerekli Google Maps kütüphanelerini asenkron olarak yükler.
   */
  private static async loadLibraries(): Promise<void> {
    try {
      // Gerekli tüm kütüphaneleri tek seferde yükle
      await Promise.all([
        google.maps.importLibrary("places"),
        google.maps.importLibrary("geometry"),
        google.maps.importLibrary("routes"),
      ]);
      console.log('✅ Google Maps "places", "geometry" ve "routes" kütüphaneleri başarıyla yüklendi.');
    } catch (e) {
      console.error('❌ Google Maps kütüphaneleri yüklenemedi:', e);
      throw new Error('Gerekli Google Haritalar kütüphaneleri yüklenemedi.');
    }
  }

  /**
   * Google Maps API script'ini, eğer daha önce yüklenmediyse, güvenli bir şekilde sayfaya ekler.
   */
  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Beta versiyonun getirdiği importLibrary fonksiyonu var mı diye kontrol et
      if (typeof window.google?.maps?.importLibrary === 'function') {
        console.log('✅ Google Maps (beta) zaten yüklü.');
        this.loadLibraries().then(() => resolve(window.google)).catch(reject);
        return;
      }

      if (!this.apiKey) {
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini Vercel proje ayarlarınıza ekleyin.';
        console.error(errorMsg);
        return reject(new Error(errorMsg));
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        // Script zaten varsa ama henüz yüklenmemişse bekle
        console.warn('Google Maps scripti zaten yükleniyor, tamamlanması bekleniyor...');
        setTimeout(() => {
            if (typeof window.google?.maps?.importLibrary === 'function') {
                this.loadLibraries().then(() => resolve(window.google)).catch(reject);
            } else {
                reject(new Error('Mevcut Google Haritalar scripti yüklenemedi veya beta sürüm değil.'));
            }
        }, 1500);
        return;
      }
      
      const script = document.createElement('script');
      script.id = scriptId;
      // Modern fonksiyonları kullanmak için API'nin BETA versiyonunu istiyoruz.
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&v=beta&loading=async&language=tr&region=TR`;
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Google Maps ana scripti (beta) başarıyla yüklendi.');
        this.loadLibraries().then(() => resolve(window.google)).catch(reject);
      };
      
      script.onerror = (e) => {
        console.error('❌ Google Haritalar scripti yüklenemedi.', e);
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
   * Component geçişlerinde "ghost" elementleri temizleyerek DOM hatalarını önler.
   */
  static async safeStepTransitionCleanup(delay = 100): Promise<void> {
    // Otomatik tamamlama listelerini ve diğer olası artıkları temizle
    document.querySelectorAll('.pac-container, .gmnoprint').forEach(el => el.remove());
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
