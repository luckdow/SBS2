export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
}

export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private directionsService: google.maps.DirectionsService | null = null;

  public static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  private async initializeService(): Promise<void> {
    if (!this.directionsService) {
      // Wait for Google Maps to load
      if (typeof google === 'undefined') {
        throw new Error('Google Maps API not loaded');
      }
      this.directionsService = new google.maps.DirectionsService();
    }
  }

  public async calculateRoute(from: string, to: string): Promise<RouteInfo> {
    await this.initializeService();
    
    return new Promise((resolve, reject) => {
      if (!this.directionsService) {
        reject(new Error('Directions service not initialized'));
        return;
      }

      this.directionsService.route(
        {
          origin: from,
          destination: to,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const route = result.routes[0];
            const leg = route.legs[0];
            
            resolve({
              distance: leg.distance?.value ? leg.distance.value / 1000 : 0, // Convert to km
              duration: leg.duration?.value ? leg.duration.value / 60 : 0, // Convert to minutes
            });
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }

  public async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined') {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }
}