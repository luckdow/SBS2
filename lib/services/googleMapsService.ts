import { Loader } from '@googlemaps/js-api-loader';

export class GoogleMapsService {
  private static loader: Loader | null = null;
  private static isLoaded = false;
  private static loadPromise: Promise<typeof google> | null = null;

  private static getLoader(): Loader {
    if (!this.loader) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.');
      }

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
    
    const defaultOptions: google.maps.places.AutocompleteOptions = {
      componentRestrictions: { country: ['tr'] },
      fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'],
      types: ['establishment', 'geocode'],
      ...options
    };

    return new google.maps.places.Autocomplete(input, defaultOptions);
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
            reject(new Error(`Directions request failed: ${status}`));
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