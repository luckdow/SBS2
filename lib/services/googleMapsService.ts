// luckdow/sbs2/SBS2-c56b2708ed10981288c68fa63f15e4b6dceffb9b/lib/services/googleMapsService.ts

/**
 * GoogleMapsService
 * * Bu servis, Google Maps JavaScript API'sini yüklemek ve yönetmek için merkezi ve basit bir yapı sunar.
 * Temel amacı, API'nin uygulama boyunca yalnızca bir kez yüklenmesini sağlamak ve 
 * React component'ları arasında geçiş yaparken ortaya çıkan "removeChild" gibi DOM hatalarını önlemektir.
 * * Önemli Değişiklikler:
 * 1.  **Basitleştirilmiş Yükleyici (Loader):** `@googlemaps/js-api-loader` yerine, Next.js için daha uygun ve kontrolü kolay olan
 * basit bir script yükleme mantığı kullanıldı. Bu, gereksiz karmaşıklığı ortadan kaldırır.
 * 2.  **Güvenli API Anahtarı:** API anahtarı artık kodun içine hard-coded olarak yazılmıyor. 
 * Bunun yerine, `next.config.js` ve `.env.local` dosyası üzerinden güvenli bir şekilde yönetilen 
 * `process.env.NEXT_PUBLIC_Maps_API_KEY` değişkeninden okunuyor.
 * 3.  **Etkili ve Basit Temizleme Fonksiyonu:** `forceCleanupAllGoogleMapsElements` adlı yeni bir fonksiyon, 
 * sayfada başıboş kalmış tüm Google Maps adres öneri kutularını (`.pac-container`) tek seferde ve güvenli bir şekilde temizler.
 * Bu fonksiyon, elementi silmeden önce DOM'da var olup olmadığını kontrol eder, böylece "removeChild" hatası alınmaz.
 * 4.  **Gereksiz Kodun Kaldırılması:** Aşırı karmaşık ve hataya açık olan onlarca satırlık `safeRemoveElement`, 
 * `cleanupOrphanedGoogleMapsElements`, `safeStepTransitionCleanup` gibi fonksiyonlar kaldırılarak yerlerine 
 * anlaşılır ve güvenilir bir yöntem getirildi.
 */
export class GoogleMapsService {
  private static loadPromise: Promise<typeof window.google> | null = null;
  private static apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  /**
   * Google Maps API script'ini, eğer daha önce yüklenmediyse, güvenli bir şekilde sayfaya ekler.
   * Bu fonksiyon, uygulamanın herhangi bir yerinden çağrıldığında API'nin sadece bir kez yüklenmesini garanti eder.
   */
  static loadGoogleMaps(): Promise<typeof window.google> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Script zaten manuel veya başka bir yolla yüklenmişse, onu kullan.
      if (typeof window.google?.maps !== 'undefined') {
        console.log('✅ Google Maps zaten yüklü.');
        return resolve(window.google);
      }

      // API anahtarının .env.local dosyasında tanımlı olduğundan emin ol.
      if (!this.apiKey) {
        const errorMsg = 'Google Haritalar API anahtarı bulunamadı. Lütfen NEXT_PUBLIC_Maps_API_KEY değişkenini .env.local dosyanıza ekleyin.';
        console.error(errorMsg);
        return reject(new Error(errorMsg));
      }

      const scriptId = 'google-maps-script';
      // Script'in tekrar tekrar eklenmesini önle.
      if (document.getElementById(scriptId)) {
        console.warn('Google Maps script elementi zaten DOM\'da mevcut.');
        // Zaten varsa ve yükleniyorsa, promise'in çözülmesini bekle.
        // Bu senaryo normalde loadPromise kontrolü ile yakalanır, ancak ekstra bir güvencedir.
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
        console.error('❌ Google Haritalar scripti yüklenemedi. API anahtarını, internet bağlantınızı ve script URL\'sini kontrol edin.');
        this.loadPromise = null; // Hata durumunda, tekrar denenebilmesi için promise'i sıfırla.
        document.getElementById(scriptId)?.remove(); // Hatalı script'i DOM'dan kaldır.
        reject(new Error('Google Haritalar scripti yüklenemedi.'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Adımlar arası geçişte yaşanan "removeChild" hatasının ana kaynağı olan,
   * Google'ın otomatik olarak oluşturduğu adres öneri kutularını (.pac-container)
   * ve diğer potansiyel artıkları güvenli bir şekilde DOM'dan temizler.
   * Bu fonksiyon, bir elementi kaldırmadan önce onun DOM'da var olduğunu doğrular.
   * Bu sayede "node to be removed is not a child of this node" hatası tamamen engellenir.
   */
  static forceCleanupAllGoogleMapsElements(): void {
    // Sadece client tarafında çalışacağından emin ol.
    if (typeof window === 'undefined') return;

    // Temizlenecek potansiyel Google Maps elementleri için kullanılan genel seçiciler.
    const selectors = ['.pac-container', '.gm-style-moc'];
    
    console.log(`🧹 Google Maps temizliği başlatılıyor... Hedef seçiciler: ${selectors.join(', ')}`);

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`🔍 ${elements.length} adet '${selector}' elementi bulundu. Temizleniyor...`);
            elements.forEach(element => {
                // Her element için, silmeden önce DOM'da olup olmadığını son bir kez kontrol et.
                // .parentNode kontrolü, elementin geçerli bir üst elemente sahip olduğunu garantiler.
                if (element && element.parentNode) {
                    try {
                        element.parentNode.removeChild(element);
                    } catch (error) {
                        // Bu hata genellikle element başka bir işlem tarafından zaten kaldırıldığında oluşur.
                        // Bu durum beklenen bir "yarış durumu" (race condition) olabilir, bu yüzden uyarı olarak loglamak yeterlidir.
                        console.warn(`'${selector}' elementi temizlenirken bir hata oluştu (genellikle zararsızdır):`, error);
                    }
                }
            });
        }
    });
    console.log('✅ Google Maps temizliği tamamlandı.');
  }

  // --- Diğer Yardımcı Fonksiyonlar (Mevcut haliyle bırakılabilir veya basitleştirilebilir) ---
  // Rota hesaplama, formatlama gibi diğer fonksiyonlarınızda bir sorun görünmüyor.
  // Bu nedenle, `getDirections`, `geocodeAddress`, `formatDistance` vb. metodlarınızı
  // bu class içinde tutmaya devam edebilirsiniz. Aşağıda `getDirections` örneği yer almaktadır.

  static async getDirections(
    origin: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    destination: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<google.maps.DirectionsResult> {
    const google = await this.loadGoogleMaps();
    
    if (!origin || !destination) {
      throw new Error('Başlangıç ve varış noktaları gereklidir');
    }

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
            console.error(`Rota hesaplama hatası: ${status}`);
            reject(new Error(`Rota hesaplanamadı. Durum: ${status}`));
          }
        }
      );
    });
  }
}

export default GoogleMapsService;
