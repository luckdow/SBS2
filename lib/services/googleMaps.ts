// Google Maps API Integration
export class GoogleMapsService {
  private static apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  private static cache = new Map();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Check if API key is configured
  static isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_google_maps_api_key_here';
  }

  // Enhanced API validation with specific service testing
  static async validateApiConfiguration(): Promise<{
    isValid: boolean;
    results: {
      geocoding: { status: string; error?: string };
      directions: { status: string; error?: string };
      places: { status: string; error?: string };
    };
    recommendations: string[];
  }> {
    if (!this.isConfigured()) {
      return {
        isValid: false,
        results: {
          geocoding: { status: 'NOT_CONFIGURED', error: 'API key not configured' },
          directions: { status: 'NOT_CONFIGURED', error: 'API key not configured' },
          places: { status: 'NOT_CONFIGURED', error: 'API key not configured' }
        },
        recommendations: [
          'Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local file',
          'Get API key from Google Cloud Console'
        ]
      };
    }

    const results = {
      geocoding: await this.testGeocodingApi(),
      directions: await this.testDirectionsApi(), 
      places: await this.testPlacesApi()
    };

    const isValid = Object.values(results).every(result => result.status === 'OK');
    const recommendations = this.generateRecommendations(results);

    return { isValid, results, recommendations };
  }

  // Test Geocoding API
  private static async testGeocodingApi(): Promise<{ status: string; error?: string }> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Antalya,Turkey&key=${this.apiKey}`
      );
      const data = await response.json();
      return { status: data.status, error: data.error_message };
    } catch (error) {
      return { status: 'NETWORK_ERROR', error: 'Failed to connect to Geocoding API' };
    }
  }

  // Test Directions API
  private static async testDirectionsApi(): Promise<{ status: string; error?: string }> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=Antalya+Airport&destination=Lara+Beach&key=${this.apiKey}`
      );
      const data = await response.json();
      return { status: data.status, error: data.error_message };
    } catch (error) {
      return { status: 'NETWORK_ERROR', error: 'Failed to connect to Directions API' };
    }
  }

  // Test Places API (Note: Web Service API, not JavaScript API)
  private static async testPlacesApi(): Promise<{ status: string; error?: string }> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Antalya+Airport&key=${this.apiKey}`
      );
      const data = await response.json();
      return { status: data.status, error: data.error_message };
    } catch (error) {
      return { status: 'NETWORK_ERROR', error: 'Failed to connect to Places API' };
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

  // Calculate distance between two points
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

      // Check if Google Maps JavaScript API is loaded
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        return new Promise((resolve) => {
          const service = new window.google.maps.DistanceMatrixService();
          
          service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
            language: 'tr',
            region: 'TR'
          }, (response: any, status: any) => {
            if (status === window.google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status === 'OK') {
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
              
              console.log('📍 Distance calculated:', result.distance, 'km');
              resolve(result);
            } else {
              console.warn('🗺️ Google Maps DistanceMatrix API error:', status);
              resolve(this.getFallbackDistance(origin, destination));
            }
          });
        });
      } else {
        console.warn('🗺️ Google Maps JavaScript API not loaded, using fallback');
        return this.getFallbackDistance(origin, destination);
      }
    } catch (error) {
      console.error('🗺️ Google Maps API Error:', error);
      return this.getFallbackDistance(origin, destination);
    }
  }

  // Get address suggestions with autocomplete
  static async getAddressSuggestions(input: string): Promise<{
    suggestions: string[];
    status: 'success' | 'error';
    error?: string;
  }> {
    if (!input || input.length < 3) {
      return { suggestions: [], status: 'success' };
    }

    // Check cache first
    const cacheKey = `autocomplete-${input}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      if (!this.isConfigured()) {
        console.warn('🗺️ Google Maps API key not configured, using fallback suggestions');
        return this.getFallbackSuggestions(input);
      }

      // Use browser-based Places AutocompleteService to avoid CORS issues
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
        return new Promise((resolve) => {
          const service = new window.google.maps.places.AutocompleteService();
          
          service.getPlacePredictions({
            input: input,
            componentRestrictions: { country: 'tr' },
            language: 'tr',
            types: ['establishment', 'geocode']
          }, (predictions: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              const result = {
                suggestions: predictions.map((prediction: any) => prediction.description),
                status: 'success' as const
              };
              
              // Cache the result
              this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
              });
              
              console.log('🗺️ Address suggestions fetched via Places AutocompleteService:', result.suggestions.length, 'results');
              resolve(result);
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              const result = { suggestions: [], status: 'success' as const };
              this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
              resolve(result);
            } else {
              console.warn('🗺️ Places AutocompleteService error:', status);
              resolve(this.getFallbackSuggestions(input));
            }
          });
        });
      } else {
        console.warn('🗺️ Google Maps Places API not loaded, using fallback suggestions');
        return this.getFallbackSuggestions(input);
      }
    } catch (error) {
      console.error('🗺️ Google Places Autocomplete Error:', error);
      return this.getFallbackSuggestions(input);
    }
  }

  // Get route visualization data
  static async getRouteVisualization(origin: string, destination: string): Promise<{
    polyline?: string;
    bounds?: any;
    steps?: any[];
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

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${this.apiKey}&language=tr`
      );
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('API anahtarı geçersiz veya domain kısıtlaması mevcut');
        } else if (response.status === 429) {
          throw new Error('API kullanım limitine ulaşıldı');
        } else {
          throw new Error(`HTTP hatası: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          polyline: route.overview_polyline.points,
          bounds: route.bounds,
          steps: route.legs[0].steps,
          status: 'success'
        };
      } else if (data.status === 'ZERO_RESULTS') {
        return { 
          status: 'error', 
          error: 'Bu lokasyonlar arasında rota bulunamadı' 
        };
      } else if (data.status === 'REQUEST_DENIED') {
        return { 
          status: 'error', 
          error: 'Google Maps API erişimi reddedildi. API anahtarını kontrol edin.' 
        };
      } else {
        return { 
          status: 'error', 
          error: `Rota hesaplanamadı: ${data.status}` 
        };
      }
    } catch (error) {
      console.error('🗺️ Google Directions API Error:', error);
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

  // Fallback address suggestions
  private static getFallbackSuggestions(input: string) {
    const turkishLocations = [
      'Antalya Havalimanı Terminal 1',
      'Antalya Havalimanı Terminal 2',
      'Lara Beach Hotel, Antalya',
      'Lara Beach, Antalya',
      'Lara Kundu Beach',
      'Konyaaltı Beach, Antalya',
      'Kemer Marina, Antalya',
      'Side Antik Tiyatro, Antalya',
      'Belek Golf Resort, Antalya',
      'Kaleiçi, Antalya',
      'Antalya Şehir Merkezi',
      'Aspendos Antik Tiyatrosu, Antalya',
      'Düden Şelalesi, Antalya',
      'Köprülü Kanyon, Antalya',
      'Olympos Antik Kenti, Antalya'
    ];
    
    const lowerInput = input.toLowerCase();
    const suggestions = turkishLocations.filter(location => 
      location.toLowerCase().includes(lowerInput) ||
      location.toLowerCase().replace(/[,\s]/g, '').includes(lowerInput.replace(/[,\s]/g, ''))
    );
    
    return {
      suggestions: suggestions.slice(0, 8),
      status: 'success' as const
    };
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