/**
 * GoogleMapsService
 *
 * Bu servis, Google Maps JavaScript API'sini yüklemek ve yönetmek için merkezi ve güvenilir bir yapı sunar.
 * Temel amacı, API'nin uygulama boyunca yalnızca bir kez yüklenmesini sağlamak ve React component'ları
 * arasında geçiş yaparken ortaya çıkan "removeChild" gibi DOM hatalarını kesin olarak önlemektir.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  private static librariesPromise: Promise<void> | null = null;
  
  // *** DOĞRU DEĞİŞKEN ADI: NEXT_PUBLIC_Maps_API_KEY ***
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  /**
   * Gerekli Google Maps kütüphanelerini (places, geometry) asenkron olarak yükler.
   * Bu fonksiyon, ana script yüklendikten sonra çağrılır.
   */
  private static async loadLibraries(): Promise<void> {
    if (this.librariesPromise) {
      return this.librariesPromise;
    }

    this.librariesPromise = (async () => {
      try {
        // 'places' ve 'geometry' kütüphanelerini yükle
        await google.maps.importLibrary("places");
        await google.maps.importLibrary("geometry");
        console.log('✅ Google Maps "places" ve "geometry" kütüphaneleri başarıyla yüklendi.');
      } catch (e) {
        console.error('❌ Google Maps kütüphaneleri yüklenemedi:', e);
        // Hata durumunda promise'i sıfırla ki tekrar denenebilsin
        this.librariesPromise = null; 
        throw new Error('Gerekli Google Haritalar kütüphaneleri (places, geometry) yüklenemedi.');
      }
    })();
    
    return this.librariesPromise;
  }

  /**
   * Google Maps API script'ini, eğer daha önce yüklenmediyse, güvenli bir şekilde sayfaya ekler.
   * Yeni PlaceAutocompleteElement web component'i desteği ile güncellenmiştir.
   */
  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      // Eğer ana promise zaten varsa, kütüphanelerin de yüklendiğinden emin ol
      return this.loadPromise.then(google => {
        return this.loadLibraries().then(() => google);
      });
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof window.google?.maps !== 'undefined') {
        console.log('✅ Google Maps zaten yüklü.');
        this.loadLibraries().then(() => resolve(window.google)).catch(reject);
        return;
      }

      if (!this.apiKey) {
        // *** DOĞRU HATA MESAJI ***
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini .env.local dosyanıza ve Vercel ayarlarına ekleyin.';
        console.error(errorMsg);
        return reject(new Error(errorMsg));
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        console.warn('Google Maps script elementi zaten DOM\'da mevcut.');
        setTimeout(() => {
          if (window.google?.maps) {
             this.loadLibraries().then(() => resolve(window.google)).catch(reject);
          } else {
            reject(new Error('Mevcut Google Haritalar scripti yüklenemedi.'));
          }
        }, 500);
        return;
      }
      
      const script = document.createElement('script');
      script.id = scriptId;
      // 'libraries' parametresi kaldırıldı, çünkü artık dinamik olarak yüklüyoruz.
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&loading=async&language=tr&region=TR`;
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Google Maps ana scripti başarıyla yüklendi.');
        // Ana script yüklendikten sonra gerekli kütüphaneleri yükle
        this.loadLibraries().then(() => resolve(window.google)).catch(reject);
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
        // Hata durumunda konsola sadece bir uyarı yazdır, uygulamanın çökmesini engelle.
        console.warn('safeRemoveElement: Element kaldırılamadı.', e);
      }
    }
  }

  /**
   * Sayfadaki tüm Google Maps ile ilgili elementleri (örneğin, otomatik tamamlama dropdown'ları)
   * güvenli bir şekilde temizler. Bu, özellikle component'lar arası geçişlerde "ghost" elementlerin
   * kalmasını ve "removeChild" hatalarını önler.
   */
  static forceCleanupAllGoogleMapsElements() {
    console.log('🧹 Google Maps temizliği başlatılıyor...');
    const pacContainers = document.querySelectorAll('.pac-container');
    pacContainers.forEach((container, index) => {
      console.log(`[${index + 1}/${pacContainers.length}] pac-container bulundu, kaldırılıyor...`);
      this.safeRemoveElement(container as HTMLElement);
    });
    if (pacContainers.length > 0) {
      console.log('✅ Tüm .pac-container elementleri başarıyla temizlendi.');
    } else {
      console.log('ℹ️ Temizlenecek .pac-container elementi bulunamadı.');
    }
  }
}
