import { Loader } from '@googlemaps/js-api-loader';

export class GoogleMapsService {
  private static loader: Loader | null = null;
  private static isLoaded = false;
  private static loadPromise: Promise<typeof google> | null = null;

  private static getLoader(): Loader {
    if (!this.loader) {
      const apiKey = 'AIzaSyDa66vbuMgm_L4wdOgPutliu_PLzI3xqEw';

      this.loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry'],
        language: 'tr',
        region: 'TR'
      });
    }
    return this.loader;
  }

  static async loadGoogleMaps(): Promise<typeof google> {
    if (this.isLoaded && window.google) {
      return window.google;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.getLoader().load().then((google) => {
      this.isLoaded = true;
      return google;
    });

    return this.loadPromise;
  }

  static async createAutocomplete(
    input: HTMLInputElement,
    options?: google.maps.places.AutocompleteOptions
  ): Promise<google.maps.places.Autocomplete> {
    const google = await this.loadGoogleMaps();
    
    // TODO: Migrate to PlaceAutocompleteElement for new projects after March 2025
    // This API will be deprecated for new customers but continues to work for existing ones
    
    const defaultOptions: google.maps.places.AutocompleteOptions = {
      componentRestrictions: { country: ['tr'] },
      fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'],
      types: ['establishment', 'geocode'],
      ...options
    };

    try {
      return new google.maps.places.Autocomplete(input, defaultOptions);
    } catch (error) {
      console.warn('Google Maps Autocomplete creation failed:', error);
      throw new Error('Otomatik tamamlama özelliği başlatılamadı');
    }
  }

  static async createMap(
    element: HTMLElement,
    options?: google.maps.MapOptions
  ): Promise<google.maps.Map> {
    const google = await this.loadGoogleMaps();
    
    const defaultOptions: google.maps.MapOptions = {
      zoom: 10,
      center: { lat: 36.8969, lng: 30.7133 }, // Antalya center
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      ...options
    };

    return new google.maps.Map(element, defaultOptions);
  }

  static async getDirections(
    origin: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    destination: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<google.maps.DirectionsResult> {
    const google = await this.loadGoogleMaps();
    
    // Validate input parameters
    if (!origin || !destination) {
      throw new Error('Başlangıç ve varış noktaları gereklidir');
    }

    // Check for obviously invalid destinations
    if (typeof destination === 'string' && destination.trim().length < 2) {
      throw new Error('Geçersiz varış noktası. Lütfen tam adres veya konum adı girin');
    }

    if (typeof origin === 'string' && origin.trim().length < 2) {
      throw new Error('Geçersiz başlangıç noktası. Lütfen tam adres veya konum adı girin');
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
            // Provide user-friendly error messages
            let errorMessage = 'Rota hesaplanamadı';
            switch (status) {
              case google.maps.DirectionsStatus.NOT_FOUND:
                errorMessage = 'Girilen konum bulunamadı. Lütfen geçerli bir adres veya konum adı girin';
                break;
              case google.maps.DirectionsStatus.ZERO_RESULTS:
                errorMessage = 'Bu iki nokta arasında rota bulunamadı';
                break;
              case google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED:
                errorMessage = 'Çok fazla ara nokta belirtildi';
                break;
              case google.maps.DirectionsStatus.INVALID_REQUEST:
                errorMessage = 'Geçersiz rota isteği. Lütfen konum bilgilerini kontrol edin';
                break;
              case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
                errorMessage = 'Harita servisi geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin';
                break;
              case google.maps.DirectionsStatus.REQUEST_DENIED:
                errorMessage = 'Harita servisi erişimi reddedildi';
                break;
              case google.maps.DirectionsStatus.UNKNOWN_ERROR:
                errorMessage = 'Bilinmeyen harita hatası. Lütfen tekrar deneyin';
                break;
              default:
                errorMessage = `Rota servisi hatası: ${status}`;
            }
            reject(new Error(errorMessage));
          }
        }
      );
    });
  }

  static async geocodeAddress(address: string): Promise<google.maps.GeocoderResult[]> {
    const google = await this.loadGoogleMaps();
    
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { 
          address,
          componentRestrictions: { country: 'TR' },
          region: 'TR'
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  static formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    } else {
      return `${Math.round(distanceInMeters / 1000)} km`;
    }
  }

  static formatDuration(durationInSeconds: number): string {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    } else {
      return `${minutes} dakika`;
    }
  }

  static getTravelModeIcon(travelMode: google.maps.TravelMode): string {
    switch (travelMode) {
      case google.maps.TravelMode.DRIVING:
        return '🚗';
      case google.maps.TravelMode.WALKING:
        return '🚶';
      case google.maps.TravelMode.TRANSIT:
        return '🚌';
      case google.maps.TravelMode.BICYCLING:
        return '🚴';
      default:
        return '🚗';
    }
  }

  static getTravelModeName(travelMode: google.maps.TravelMode): string {
    switch (travelMode) {
      case google.maps.TravelMode.DRIVING:
        return 'Araç';
      case google.maps.TravelMode.WALKING:
        return 'Yürüyerek';
      case google.maps.TravelMode.TRANSIT:
        return 'Toplu Taşıma';
      case google.maps.TravelMode.BICYCLING:
        return 'Bisiklet';
      default:
        return 'Araç';
    }
  }
}

export default GoogleMapsService;