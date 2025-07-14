// Google Maps API Integration - Singleton Service
export class GoogleMapsService {
  private static instance: GoogleMapsService | null = null;
  
  // API key is now read from environment variables with proper fallback
  private static get apiKey(): string {
    if (typeof window !== 'undefined') {
      // Browser environment - check both window and process
      return window.process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
             process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDa66vbuMgm_L4wdOgPutliu_PLzI3xqEw";
    }
    // Server environment
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDa66vbuMgm_L4wdOgPutliu_PLzI3xqEw";
  }
  
  private static cache = new Map();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private static isInitialized = false;

  // Singleton pattern implementation
  private constructor() {}

  static getInstance(): GoogleMapsService {
    if (!this.instance) {
      this.instance = new GoogleMapsService();
    }
    return this.instance;
  }

  // Check if API key is configured
  static isConfigured(): boolean {
    const key = this.apiKey;
    return !!(key && key !== 'your_google_maps_api_key_here' && key !== 'AIzaSyDa66vbuMgm_L4wdOgPutliu_PLzI3xqEw');
  }

  // Check if Google Maps JavaScript API is loaded and ready
  static isApiReady(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.google &&
      window.google.maps &&
      window.google.maps.places &&
      this.isInitialized
    );
  }

  // Initialize services when API is loaded
  static markAsInitialized(): void {
    this.isInitialized = true;
  }

  // Enhanced API validation using browser-based services only
  static async validateApiConfiguration(): Promise<{
    isValid: boolean;
    results: {
      javascriptApi: { status: string; error?: string };
      placesApi: { status: string; error?: string };
      mapsApi: { status: string; error?: string };
    };
    recommendations: string[];
  }> {
    if (!this.isConfigured()) {
      return {
        isValid: false,
        results: {
          javascriptApi: { status: 'NOT_CONFIGURED', error: 'API key not configured' },
          placesApi: { status: 'NOT_CONFIGURED', error: 'API key not configured' },
          mapsApi: { status: 'NOT_CONFIGURED', error: 'API key not configured' }
        },
        recommendations: [
          'Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local file',
          'Get API key from Google Cloud Console'
        ]
      };
    }

    const results = {
      javascriptApi: await this.testJavaScriptApi(),
      placesApi: await this.testPlacesJavaScriptApi(),
      mapsApi: await this.testMapsJavaScriptApi()
    };

    const isValid = Object.values(results).every(result => result.status === 'OK');
    const recommendations = this.generateRecommendations(results);

    return { isValid, results, recommendations };
  }

  // Test JavaScript API availability
  private static async testJavaScriptApi(): Promise<{ status: string; error?: string }> {
    try {
      if (!this.isApiReady()) {
        return { status: 'NOT_LOADED', error: 'Google Maps JavaScript API not loaded' };
      }
      return { status: 'OK' };
    } catch (error) {
      return { status: 'ERROR', error: 'JavaScript API test failed' };
    }
  }

  // Test Places JavaScript API
  private static async testPlacesJavaScriptApi(): Promise<{ status: string; error?: string }> {
    try {
      if (!this.isApiReady()) {
        return { status: 'NOT_LOADED', error: 'Places API not loaded' };
      }
      if (!window.google.maps.places.AutocompleteService) {
        return { status: 'MISSING_SERVICE', error: 'AutocompleteService not available' };
      }
      return { status: 'OK' };
    } catch (error) {
      return { status: 'ERROR', error: 'Places API test failed' };
    }
  }

  // Test Maps JavaScript API
  private static async testMapsJavaScriptApi(): Promise<{ status: string; error?: string }> {
    try {
      if (!this.isApiReady()) {
        return { status: 'NOT_LOADED', error: 'Maps API not loaded' };
      }
      if (!window.google.maps.DirectionsService) {
        return { status: 'MISSING_SERVICE', error: 'DirectionsService not available' };
      }
      return { status: 'OK' };
    } catch (error) {
      return { status: 'ERROR', error: 'Maps API test failed' };
    }
  }

  // Generate specific recommendations based on test results
  private static generateRecommendations(results: any): string[] {
    const recommendations: string[] = [];

    Object.entries(results).forEach(([api, result]: [string, any]) => {
      if (result.status === 'REQUEST_DENIED') {
        recommendations.push(`${api.toUpperCase()} API: Enable ${api} API in Google Cloud Console`);
      } else if (result.status === 'OVER_QUERY_LIMIT') {
        recommendations.push(`${api.toUpperCase()} API: Check usage limits and billing configuration`);
      } else if (result.status === 'NETWORK_ERROR') {
        recommendations.push(`${api.toUpperCase()} API: Check network connectivity and firewall settings`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All APIs are working correctly!');
    } else {
      recommendations.unshift('Go to Google Cloud Console → APIs & Services → Library to enable missing APIs');
      recommendations.push('Ensure billing is enabled for your Google Cloud project');
    }

    return recommendations;
  }

  // Calculate distance between two points using browser-based APIs only
  static async calculateDistance(origin: string, destination: string): Promise<{
    distance: number;
    duration: string;
    route: any;
    status: 'success' | 'error';
    error?: string;
  }> {
    // Check cache first
    const cacheKey = `${origin}-${destination}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📍 Using cached distance result');
      return cached.data;
    }

    try {
      if (!this.isConfigured()) {
        console.warn('🗺️ Google Maps API key not configured, using fallback');
        return this.getFallbackDistance(origin, destination);
      }

      // Use browser-based Distance Matrix Service
      if (this.isApiReady() && window.google.maps.DistanceMatrixService) {
        return new Promise((resolve) => {
          const service = new window.google.maps.DistanceMatrixService();
          
          service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
            language: 'tr',
            region: 'TR',
            avoidHighways: false,
            avoidTolls: false
          }, (response: any, status: any) => {
            if (status === window.google.maps.DistanceMatrixStatus.OK && 
                response.rows[0].elements[0].status === 'OK') {
              const element = response.rows[0].elements[0];
              const result = {
                distance: Math.round(element.distance.value / 1000), // Convert to KM
                duration: element.duration.text,
                route: response,
                status: 'success' as const
              };
              
              // Cache the result
              this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
              });
              
              console.log('📍 Distance calculated via DistanceMatrix API:', result.distance, 'km');
              resolve(result);
            } else {
              console.warn('🗺️ DistanceMatrix API error:', status);
              resolve(this.getFallbackDistance(origin, destination));
            }
          });
        });
      } else {
        console.warn('🗺️ Google Maps DistanceMatrix API not available, using fallback');
        return this.getFallbackDistance(origin, destination);
      }
    } catch (error) {
      console.error('🗺️ Distance calculation error:', error);
      return this.getFallbackDistance(origin, destination);
    }
  }

  // Get address suggestions with autocomplete using browser-based APIs only
  static async getAddressSuggestions(input: string, includePopular: boolean = true): Promise<{
    suggestions: string[];
    popularDestinations?: string[];
    status: 'success' | 'error';
    error?: string;
    source?: 'api' | 'fallback';
  }> {
    if (!input || input.length < 2) {
      return {
        suggestions: [],
        popularDestinations: includePopular ? this.getPopularDestinations() : undefined,
        status: 'success',
        source: 'fallback'
      };
    }

    // Check cache first
    const cacheKey = `autocomplete-${input}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('🗺️ Using cached autocomplete result for:', input);
      return {
        ...cached.data,
        popularDestinations: includePopular ? this.getPopularDestinations() : undefined
      };
    }

    try {
      if (!this.isConfigured()) {
        console.log('🗺️ Google Maps API key not configured, using enhanced fallback suggestions');
        const fallback = this.getFallbackSuggestions(input);
        return {
          ...fallback,
          popularDestinations: includePopular ? this.getPopularDestinations() : undefined,
          source: 'fallback'
        };
      }

      // Use browser-based Places AutocompleteService only
      if (this.isApiReady() && window.google.maps.places.AutocompleteService) {
        return new Promise((resolve) => {
          const service = new window.google.maps.places.AutocompleteService();
          
          service.getPlacePredictions({
            input: input,
            componentRestrictions: { country: 'tr' },
            language: 'tr',
            types: ['establishment', 'geocode'],
            // Focus on Antalya region for better Turkish results
            locationBias: {
              center: { lat: 36.8969, lng: 30.7133 },
              radius: 100000 // 100km radius around Antalya
            }
          }, (predictions: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              const result = {
                suggestions: predictions.map((prediction: any) => prediction.description),
                status: 'success' as const,
                source: 'api' as const
              };
              
              // Cache the result
              this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
              });
              
              console.log('🗺️ Address suggestions fetched via Places AutocompleteService:', result.suggestions.length, 'results');
              resolve({
                ...result,
                popularDestinations: includePopular ? this.getPopularDestinations() : undefined
              });
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              const result = { 
                suggestions: [], 
                status: 'success' as const, 
                source: 'api' as const 
              };
              this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
              console.log('🗺️ No suggestions found via Places API, zero results');
              resolve({
                ...result,
                popularDestinations: includePopular ? this.getPopularDestinations() : undefined
              });
            } else {
              console.warn('🗺️ Places AutocompleteService error status:', status, 'falling back to enhanced local suggestions');
              const fallback = this.getFallbackSuggestions(input);
              resolve({
                ...fallback,
                popularDestinations: includePopular ? this.getPopularDestinations() : undefined,
                source: 'fallback'
              });
            }
          });
        });
      } else {
        console.log('🗺️ Google Maps Places AutocompleteService not available, using enhanced fallback');
        const fallback = this.getFallbackSuggestions(input);
        return {
          ...fallback,
          popularDestinations: includePopular ? this.getPopularDestinations() : undefined,
          source: 'fallback'
        };
      }
    } catch (error) {
      console.error('🗺️ Places Autocomplete Error:', error);
      const fallback = this.getFallbackSuggestions(input);
      return {
        ...fallback,
        popularDestinations: includePopular ? this.getPopularDestinations() : undefined,
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get popular Turkish destinations
  static getPopularDestinations(): string[] {
    return [
      'Antalya Havalimanı Terminal 1',
      'Antalya Havalimanı Terminal 2',
      'Lara Beach, Antalya',
      'Konyaaltı Beach, Antalya',
      'Kaleiçi, Antalya',
      'Kemer Marina, Antalya',
      'Side Antik Tiyatro, Manavgat',
      'Belek Golf Resort, Serik',
      'Aspendos Antik Tiyatrosu, Serik',
      'Düden Şelalesi, Antalya',
      'Köprülü Kanyon Milli Parkı',
      'Olympos Antik Kenti, Kumluca'
    ];
  }

  // Get route visualization data using browser-based APIs only
  static async getRouteVisualization(origin: string, destination: string): Promise<{
    polyline?: string;
    bounds?: any;
    steps?: any[];
    distance?: number;
    duration?: string;
    status: 'success' | 'error';
    error?: string;
  }> {
    try {
      if (!this.isConfigured()) {
        return { 
          status: 'error', 
          error: 'Google Maps API anahtarı yapılandırılmamış. Lütfen .env.local dosyasında NEXT_PUBLIC_GOOGLE_MAPS_API_KEY değişkenini ayarlayın.' 
        };
      }

      // Use browser-based DirectionsService only
      if (this.isApiReady() && window.google.maps.DirectionsService) {
        return new Promise((resolve) => {
          const directionsService = new window.google.maps.DirectionsService();
          
          directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
            region: 'TR',
            language: 'tr',
            optimizeWaypoints: false,
            avoidHighways: false,
            avoidTolls: false
          }, (result: any, status: any) => {
            if (status === 'OK' && result.routes.length > 0) {
              const route = result.routes[0];
              const leg = route.legs[0];
              
              const routeData = {
                polyline: route.overview_polyline.points,
                bounds: route.bounds,
                steps: leg.steps,
                distance: Math.round(leg.distance.value / 1000), // Convert to km
                duration: leg.duration.text,
                status: 'success' as const
              };
              
              console.log('🗺️ Route calculated via DirectionsService:', routeData.distance, 'km');
              resolve(routeData);
            } else {
              let userFriendlyError = 'Rota hesaplanamadı';
              
              if (status === 'ZERO_RESULTS') {
                userFriendlyError = 'Bu lokasyonlar arasında rota bulunamadı';
              } else if (status === 'REQUEST_DENIED') {
                userFriendlyError = 'Google Maps API erişimi reddedildi. API anahtarını kontrol edin.';
              } else if (status === 'INVALID_REQUEST') {
                userFriendlyError = 'Geçersiz rota talebi';
              } else if (status === 'OVER_QUERY_LIMIT') {
                userFriendlyError = 'Google Maps kullanım limitine ulaşıldı';
              } else {
                userFriendlyError = `Rota servisi hatası: ${status}`;
              }
              
              console.warn('🗺️ DirectionsService error:', status);
              resolve({ 
                status: 'error', 
                error: userFriendlyError 
              });
            }
          });
        });
      } else {
        return { 
          status: 'error', 
          error: 'Google Maps DirectionsService henüz yüklenmedi. Lütfen birkaç saniye bekleyin.' 
        };
      }
    } catch (error) {
      console.error('🗺️ Route visualization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
      return { 
        status: 'error', 
        error: `Harita servisi hatası: ${errorMessage}` 
      };
    }
  }

  // Fallback distance calculation (basic estimation)
  private static getFallbackDistance(origin: string, destination: string) {
    console.log('📍 Using fallback distance calculation');
    
    // Simple heuristic based on common Antalya routes
    const lowerOrigin = origin.toLowerCase();
    const lowerDest = destination.toLowerCase();
    
    let distance = 25; // Default distance
    
    // Airport to city center area
    if ((lowerOrigin.includes('havalimanı') || lowerOrigin.includes('airport')) && 
        (lowerDest.includes('lara') || lowerDest.includes('konyaaltı'))) {
      distance = 20;
    }
    // Airport to Kemer
    else if ((lowerOrigin.includes('havalimanı') || lowerOrigin.includes('airport')) && 
             lowerDest.includes('kemer')) {
      distance = 45;
    }
    // Airport to Side
    else if ((lowerOrigin.includes('havalimanı') || lowerOrigin.includes('airport')) && 
             lowerDest.includes('side')) {
      distance = 65;
    }
    // Airport to Belek
    else if ((lowerOrigin.includes('havalimanı') || lowerOrigin.includes('airport')) && 
             lowerDest.includes('belek')) {
      distance = 35;
    }
    
    return {
      distance,
      duration: `${Math.round(distance * 1.2)} dakika`, // Rough calculation
      route: null,
      status: 'success' as const
    };
  }

  // Enhanced fallback address suggestions
  private static getFallbackSuggestions(input: string) {
    const turkishLocations = [
      // Airports
      'Antalya Havalimanı Terminal 1',
      'Antalya Havalimanı Terminal 2',
      'Antalya Havalimanı Dış Hatlar',
      'Antalya Havalimanı İç Hatlar',
      
      // Beaches and Coastal Areas
      'Lara Beach, Antalya',
      'Lara Kundu Beach',
      'Konyaaltı Beach, Antalya',
      'Kleopatra Beach, Alanya',
      'Patara Beach, Kaş',
      'Olympos Beach, Kumluca',
      'Çıralı Beach, Kemer',
      
      // Tourist Areas
      'Kaleiçi, Antalya',
      'Antalya Şehir Merkezi',
      'Kemer Marina, Antalya',
      'Side Antik Tiyatro, Manavgat',
      'Belek Golf Resort, Serik',
      'Alanya Kalesi',
      'Manavgat Şelalesi',
      'Köprülü Kanyon Milli Parkı',
      
      // Historical Sites
      'Aspendos Antik Tiyatrosu, Serik',
      'Perge Antik Kenti, Aksu',
      'Termessos Antik Kenti',
      'Olympos Antik Kenti, Kumluca',
      'Phaselis Antik Kenti, Kemer',
      'Myra Antik Kenti, Demre',
      
      // Natural Attractions
      'Düden Şelalesi, Antalya',
      'Kurşunlu Şelalesi',
      'Saklıkent Milli Parkı',
      'Kaputaş Beach, Kaş',
      'Damlataş Mağarası, Alanya',
      
      // Hotels and Resorts (Popular Areas)
      'Lara Resort Hotels',
      'Belek Resort Hotels',
      'Kemer Resort Hotels',
      'Side Resort Hotels',
      'Alanya Resort Hotels',
      'Kaş Boutique Hotels',
      
      // Districts
      'Muratpaşa, Antalya',
      'Kepez, Antalya',
      'Döşemealtı, Antalya',
      'Akdeniz Üniversitesi, Antalya',
      'Antalya AVM',
      'MarkAntalya AVM',
      'TerraCity AVM'
    ];
    
    const lowerInput = input.toLowerCase();
    const suggestions = turkishLocations.filter(location => 
      location.toLowerCase().includes(lowerInput) ||
      location.toLowerCase().replace(/[,\s]/g, '').includes(lowerInput.replace(/[,\s]/g, '')) ||
      this.turkishCharacterMatch(location.toLowerCase(), lowerInput)
    );
    
    return {
      suggestions: suggestions.slice(0, 10),
      status: 'success' as const
    };
  }

  // Helper method for Turkish character matching
  private static turkishCharacterMatch(text: string, search: string): boolean {
    const turkishMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'c': 'ç', 'g': 'ğ', 'i': 'ı', 'o': 'ö', 's': 'ş', 'u': 'ü'
    };
    
    const normalizeText = (str: string) => {
      return str.split('').map(char => turkishMap[char] || char).join('');
    };
    
    return normalizeText(text).includes(normalizeText(search));
  }

  // Clear cache (useful for development)
  static clearCache() {
    this.cache.clear();
    console.log('🗺️ Google Maps cache cleared');
  }

  // Get cache stats
  static getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
