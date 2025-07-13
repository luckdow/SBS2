// Google Maps API Integration
export class GoogleMapsService {
  private static apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  static async calculateDistance(origin: string, destination: string): Promise<{
    distance: number;
    duration: string;
    route: any;
  }> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distance: Math.round(element.distance.value / 1000), // Convert to KM
          duration: element.duration.text,
          route: data
        };
      }
      
      // Fallback for demo
      return {
        distance: 25,
        duration: '30 mins',
        route: null
      };
    } catch (error) {
      console.error('Google Maps API Error:', error);
      // Fallback for demo
      return {
        distance: 25,
        duration: '30 mins',
        route: null
      };
    }
  }

  static async getAddressSuggestions(input: string): Promise<string[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.predictions.map((prediction: any) => prediction.description);
      }
      
      return [];
    } catch (error) {
      console.error('Google Maps Autocomplete Error:', error);
      return [];
    }
  }
}