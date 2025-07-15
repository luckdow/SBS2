// lib/services/googleMapsService.ts

/**
 * Google Haritalar API'sini yönetmek için basit ve güvenilir bir servis.
 * API'yi yalnızca bir kez yükler ve adımlar arası geçişler için güvenli bir temizlik yöntemi sunar.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<void> | null = null;
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  /**
   * Google Maps API script'ini, eğer daha önce yüklenmediyse, güvenli bir şekilde sayfaya ekler.
   * Bu fonksiyon, uygulamanın herhangi bir yerinden çağrıldığında API'nin sadece bir kez yüklenmesini garanti eder.
   */
  static loadGoogleMaps(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Eğer script zaten varsa, tekrar yükleme.
      if (typeof window.google?.maps !== 'undefined') {
        return resolve();
      }

      // API anahtarının .env.local dosyasında tanımlı olduğundan emin ol.
      if (!this.apiKey) {
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini .env.local dosyanıza ekleyin.';
        console.error(errorMsg);
        return reject(new Error(errorMsg));
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,routes&language=tr&region=TR`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.loadPromise = null; // Hata durumunda, tekrar denenebilmesi için promise'i sıfırla.
        reject(new Error('Google Haritalar scripti yüklenemedi. İnternet bağlantınızı ve API anahtarınızı kontrol edin.'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Adımlar arası geçişte yaşanan hataların ana kaynağı olan,
   * Google'ın otomatik olarak oluşturduğu adres öneri kutularını (.pac-container)
   * güvenli bir şekilde DOM'dan temizler.
   * Bu, "removeChild" hatasını kesin olarak çözer.
   */
  static async safeStepTransitionCleanup(): Promise<void> {
    // DOM'un stabil hale gelmesi için çok kısa bir bekleme yapıyoruz.
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Sayfadaki tüm '.pac-container' elementlerini bul.
    const pacContainers = document.querySelectorAll('.pac-container');

    // Her birini, ana gövdeden (body) güvenli bir şekilde kaldır.
    pacContainers.forEach(container => {
      if (container.parentNode) {
        try {
          container.parentNode.removeChild(container);
        } catch (error) {
          // Bu hata genellikle element zaten kaldırılmışsa oluşur ve güvenle görmezden gelinebilir.
          console.warn('Beklenen temizlik hatası (önemsiz):', error);
        }
      }
    });
  }
}
