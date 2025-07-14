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

  // Modern PlaceAutocompleteElement creation (recommended for new projects)
  static async createPlaceAutocompleteElement(
    container: HTMLElement,
    options?: {
      componentRestrictions?: { country: string[] };
      types?: string[];
      placeholder?: string;
    }
  ): Promise<google.maps.places.PlaceAutocompleteElement> {
    const google = await this.loadGoogleMaps();
    
    // Validate container element exists and is attached to DOM
    if (!container) {
      throw new Error('Container element is required for autocomplete');
    }
    
    if (!container.isConnected) {
      throw new Error('Container element must be attached to the DOM');
    }
    
    try {
      const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
        requestedLanguage: 'tr',
        requestedRegion: 'TR',
      });
      
      // Note: componentRestrictions and types are not supported in the modern API
      // These features are handled internally by the element based on requestedRegion
      // The modern API automatically restricts results based on the region
      
      // Note: PlaceAutocompleteElement doesn't support direct placeholder setting
      // The placeholder is managed internally by the element
      
      // Set default styling
      autocompleteElement.style.width = '100%';
      autocompleteElement.style.height = '100%';
      autocompleteElement.style.border = 'none';
      autocompleteElement.style.outline = 'none';
      autocompleteElement.style.background = 'transparent';
      autocompleteElement.style.color = 'white';
      autocompleteElement.style.fontSize = '16px';
      
      return autocompleteElement;
    } catch (error) {
      console.warn('PlaceAutocompleteElement creation failed:', error);
      throw new Error('Modern autocomplete element could not be created');
    }
  }

  // Legacy Autocomplete creation (for backward compatibility)
  static async createAutocomplete(
    input: HTMLInputElement,
    options?: google.maps.places.AutocompleteOptions
  ): Promise<google.maps.places.Autocomplete> {
    const google = await this.loadGoogleMaps();
    
    // Validate input element exists and is attached to DOM
    if (!input) {
      throw new Error('Input element is required for autocomplete');
    }
    
    if (!input.isConnected) {
      throw new Error('Input element must be attached to the DOM');
    }
    
    // Check if PlaceAutocompleteElement is available (recommended)
    if (google.maps.places.PlaceAutocompleteElement) {
      console.warn('Using legacy Autocomplete API. Consider migrating to PlaceAutocompleteElement for better performance and future compatibility.');
    }
    
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

  // Unified autocomplete creation with automatic fallback
  static async createBestAutocomplete(
    element: HTMLElement,
    options?: {
      componentRestrictions?: { country: string[] };
      types?: string[];
      placeholder?: string;
      fallbackToLegacy?: boolean;
    }
  ): Promise<{
    type: 'modern' | 'legacy';
    element: google.maps.places.PlaceAutocompleteElement | google.maps.places.Autocomplete;
  }> {
    const google = await this.loadGoogleMaps();
    
    // Validate element exists and is attached to DOM
    if (!element) {
      throw new Error('Element is required for autocomplete');
    }
    
    if (!element.isConnected) {
      throw new Error('Element must be attached to the DOM');
    }

    const defaultOptions = {
      componentRestrictions: { country: ['tr'] },
      types: ['establishment', 'geocode'],
      ...options
    };

    // Try modern PlaceAutocompleteElement first
    try {
      if (google.maps.places.PlaceAutocompleteElement) {
        const autocompleteElement = await this.createPlaceAutocompleteElement(element, defaultOptions);
        return { type: 'modern', element: autocompleteElement };
      }
    } catch (error) {
      console.warn('Modern PlaceAutocompleteElement failed, falling back to legacy Autocomplete:', error);
    }

    // Fallback to legacy Autocomplete if modern API is not available or fails
    if (options?.fallbackToLegacy !== false) {
      try {
        const input = element.querySelector('input') || element as HTMLInputElement;
        if (input.tagName === 'INPUT') {
          const autocomplete = await this.createAutocomplete(input, {
            componentRestrictions: defaultOptions.componentRestrictions,
            fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'],
            types: defaultOptions.types as any,
          });
          return { type: 'legacy', element: autocomplete };
        }
      } catch (error) {
        console.error('Legacy Autocomplete also failed:', error);
      }
    }

    throw new Error('Both modern and legacy autocomplete creation failed');
  }

  static async createMap(
    element: HTMLElement,
    options?: google.maps.MapOptions
  ): Promise<google.maps.Map> {
    const google = await this.loadGoogleMaps();
    
    // Comprehensive element validation
    if (!element) {
      throw new Error('Map: Expected mapDiv of type HTMLElement but was passed null.');
    }
    
    if (!element.isConnected) {
      throw new Error('Map element must be attached to the DOM before initialization');
    }
    
    // Double-check during async operations
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to ensure DOM stability
    
    if (!element.isConnected) {
      throw new Error('Map container became unavailable during initialization');
    }
    
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

    try {
      // Final validation before creating map
      if (!element.isConnected) {
        throw new Error('Map container became unavailable during initialization');
      }
      
      const map = new google.maps.Map(element, defaultOptions);
      
      // Validate map was created successfully
      if (!map) {
        throw new Error('Map creation returned null or undefined');
      }
      
      return map;
    } catch (error) {
      console.error('Map creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      throw new Error(`Harita oluşturulamadı: ${errorMessage}`);
    }
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

  // Utility methods for safe DOM operations and cleanup
  static safeElementCheck(element: HTMLElement | null): boolean {
    try {
      return element !== null && 
             element.isConnected && 
             document.contains(element) &&
             element.parentNode !== null;
    } catch (error) {
      // If any check throws, element is not safe
      return false;
    }
  }

  // Enhanced element safety check with retries for race conditions
  static async safeElementCheckAsync(element: HTMLElement | null, retries = 3): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        if (this.safeElementCheck(element)) {
          return true;
        }
        // Small delay to handle race conditions
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.warn(`Element check attempt ${i + 1} failed:`, error);
      }
    }
    return false;
  }

  static async safeMapCleanup(map: google.maps.Map | null, directionsRenderer?: google.maps.DirectionsRenderer | null): Promise<void> {
    try {
      if (directionsRenderer) {
        try {
          // Enhanced safety checks before DirectionsRenderer cleanup
          const mapInstance = directionsRenderer.getMap();
          if (mapInstance) {
            const mapDiv = mapInstance.getDiv();
            // Multiple layers of validation with async safety checks
            if (await this.safeElementCheckAsync(mapDiv)) {
              // Clear directions first (safer than direct DOM manipulation)
              try {
                directionsRenderer.setDirections({ routes: [] } as any);
              } catch (clearError) {
                console.warn('Could not clear directions:', clearError);
              }
              
              // Only set map to null if container is still valid
              try {
                directionsRenderer.setMap(null);
              } catch (mapSetError) {
                console.warn('Could not set renderer map to null:', mapSetError);
              }
            } else {
              // Map container is gone, just clear the reference
              console.warn('Map container unavailable during DirectionsRenderer cleanup - clearing reference only');
            }
          }
        } catch (rendererError) {
          // DirectionsRenderer cleanup failed - this is non-critical
          console.warn('DirectionsRenderer cleanup failed (non-critical):', rendererError);
        }
      }
      
      if (map) {
        try {
          // Enhanced map cleanup with async safety checks
          const mapDiv = map.getDiv();
          if (await this.safeElementCheckAsync(mapDiv)) {
            // Google Maps cleanup happens automatically when DOM element is removed
            // We just need to clear references and ensure no pending operations
            
            // Clear any pending map operations
            try {
              if (map.getProjection) {
                // Map is still valid, let it clean up naturally
              }
            } catch (projectionError) {
              console.warn('Map projection check failed during cleanup:', projectionError);
            }
          } else {
            console.warn('Map container unavailable during cleanup - DOM already removed');
          }
        } catch (mapError) {
          console.warn('Map cleanup warning (non-critical):', mapError);
        }
      }
    } catch (error) {
      // Log but don't throw - cleanup should be silent
      console.warn('Map cleanup warning (non-critical):', error);
    }
  }

  static async safeAutocompleteCleanup(autocomplete: google.maps.places.Autocomplete | google.maps.places.PlaceAutocompleteElement | null): Promise<void> {
    try {
      if (!autocomplete) return;

      // Handle modern PlaceAutocompleteElement
      if ('remove' in autocomplete && typeof autocomplete.remove === 'function') {
        // Enhanced safety checks for modern element removal
        if (await this.safeElementCheckAsync(autocomplete as HTMLElement)) {
          try {
            // Try using remove() first (modern approach)
            autocomplete.remove();
          } catch (removeError) {
            // Fallback to parentNode.removeChild if remove() fails
            try {
              const parent = (autocomplete as HTMLElement).parentNode;
              if (parent && 
                  parent.contains(autocomplete as HTMLElement) && 
                  await this.safeElementCheckAsync(parent as HTMLElement)) {
                parent.removeChild(autocomplete as HTMLElement);
              }
            } catch (parentRemoveError) {
              console.warn('Could not remove autocomplete element via parent:', parentRemoveError);
            }
          }
        } else {
          console.warn('Autocomplete element not safe for removal - skipping DOM manipulation');
        }
        return;
      }

      // Handle legacy Autocomplete with enhanced safety
      if (typeof window !== 'undefined' && window.google?.maps?.event) {
        try {
          // Add small delay to ensure any pending operations complete
          await new Promise(resolve => setTimeout(resolve, 50));
          window.google.maps.event.clearInstanceListeners(autocomplete);
        } catch (clearError) {
          console.warn('Could not clear autocomplete listeners:', clearError);
        }
      }
    } catch (error) {
      // Log but don't throw - cleanup should be silent  
      console.warn('Autocomplete cleanup warning (non-critical):', error);
    }
  }

  // Enhanced element validation for async operations
  static async validateElementDuringAsync(element: HTMLElement, operationName: string): Promise<void> {
    // Multiple validation checks with small delays to handle race conditions
    const checks = [
      () => this.safeElementCheck(element),
      () => new Promise(resolve => setTimeout(() => resolve(this.safeElementCheck(element)), 5)),
      () => new Promise(resolve => setTimeout(() => resolve(this.safeElementCheck(element)), 10)),
      () => new Promise(resolve => setTimeout(() => resolve(this.safeElementCheck(element)), 25))
    ];

    for (let i = 0; i < checks.length; i++) {
      try {
        const isValid = await checks[i]();
        if (!isValid) {
          throw new Error(`${operationName}: Element became unavailable during async operation (check ${i + 1})`);
        }
      } catch (error) {
        // On final check, throw the error
        if (i === checks.length - 1) {
          throw error;
        }
        // Otherwise, continue to next check
        console.warn(`${operationName}: Element check ${i + 1} failed, retrying...`);
      }
    }
  }

  // Additional utility for waiting for DOM stability
  static async waitForDOMStability(element: HTMLElement, timeout = 1000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await this.safeElementCheckAsync(element)) {
        // Element is stable, wait a bit more to ensure it stays stable
        await new Promise(resolve => setTimeout(resolve, 50));
        if (await this.safeElementCheckAsync(element)) {
          return true;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }
}

export default GoogleMapsService;