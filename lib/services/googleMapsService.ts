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

  // *** DÜZELTME: API anahtarı için standart değişken adı kullanıldı ***
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  /**
   * Gerekli Google Maps kütüphanelerini (places, geometry) asenkron olarak yükler.
   */
  private static async loadLibraries(): Promise<void> {
    if (this.librariesPromise) {
      return this.librariesPromise;
    }

    this.librariesPromise = (async () => {
      try {
        await google.maps.importLibrary("places");
        await google.maps.importLibrary("geometry");
        console.log('✅ Google Maps "places" ve "geometry" kütüphaneleri başarıyla yüklendi.');
      } catch (e) {
        console.error('❌ Google Maps kütüphaneleri yüklenemedi:', e);
        this.librariesPromise = null;
        throw new Error('Gerekli Google Haritalar kütüphaneleri (places, geometry) yüklenemedi.');
      }
    })();
    
    return this.librariesPromise;
  }

  /**
   * Google Maps API script'ini, eğer daha önce yüklenmediyse, güvenli bir şekilde sayfaya ekler.
   */
  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
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
        // *** DÜZELTME: Hata mesajı standart değişken adına göre güncellendi ***
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini .env.local dosyanıza ve Vercel ayarlarına ekleyin.';
        console.error(errorMsg);
        return reject(new Error(errorMsg));
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        console.warn('Google Maps script elementi zaten DOM\'da mevcut. Yüklenmesi bekleniyor...');
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&loading=async&language=tr&region=TR`;
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Google Maps ana scripti başarıyla yüklendi.');
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
   * Bir elementi DOM'dan kaldırmadan önce varlığını ve geçerli bir ebeveyne sahip olduğunu kontrol eder.
   */
  static safeRemoveElement(element: HTMLElement | null) {
    if (element && element.parentNode) {
      try {
        element.parentNode.removeChild(element);
      } catch (e) {
        console.warn('safeRemoveElement: Element kaldırılamadı.', e);
      }
    }
  }

  /**
   * Sayfadaki tüm Google Maps ile ilgili arayüz elemanlarını güvenli bir şekilde temizler.
   * Bu, özellikle component'lar arası geçişlerde "ghost" elementlerin kalmasını ve hataları önler.
   * *** İYİLEŞTİRME: Daha fazla olası element için seçici eklendi (.gmnoprint gibi) ***
   */
  static forceCleanupAllGoogleMapsElements() {
    console.log('🧹 Google Maps temizliği başlatılıyor...');
    const selectors = '.pac-container, .gmnoprint';
    const elements = document.querySelectorAll(selectors);

    if (elements.length === 0) {
      console.log(`ℹ️ Temizlenecek Google Maps elementi (${selectors}) bulunamadı.`);
      return;
    }

    elements.forEach((container, index) => {
      console.log(`[${index + 1}/${elements.length}] "${container.className}" bulundu, kaldırılıyor...`);
      this.safeRemoveElement(container as HTMLElement);
    });
    console.log(`✅ ${elements.length} adet Google Maps elementi başarıyla temizlendi.`);
  }

  /**
   * *** YENİ: ADIM GEÇİŞLERİ İÇİN GÜVENLİ TEMİZLİK FONKSİYONU ***
   * Bu fonksiyon, component adımları arasında geçiş yapmadan hemen önce çağrılmalıdır.
   * DOM'u stabilize etmek için Google Haritalar öğelerini temizler ve kısa bir gecikme ekler.
   * Bu, "removeChild" hatasının ana çözümüdür.
   * @param delay - Temizlik sonrası beklenecek milisaniye cinsinden süre.
   */
  static async safeStepTransitionCleanup(delay = 200): Promise<void> {
    console.log(`🧹 Güvenli adım geçişi temizliği başlatılıyor (${delay}ms gecikme ile)...`);
    this.forceCleanupAllGoogleMapsElements();
    
    // DOM'un ve React'in güncellenmesi için kısa bir bekleme süresi tanır.
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
