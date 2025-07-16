// Google Maps API integration and validation
import { Loader } from '@googlemaps/js-api-loader';
import type { Libraries } from '@googlemaps/js-api-loader';

// Google Maps configuration
const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places', 'geometry', 'directions'] as Libraries
};

// Validate Google Maps API key
export const validateGoogleMapsConfig = () => {
  const apiKey = GOOGLE_MAPS_CONFIG.apiKey;
  
  if (!apiKey || apiKey === '' || apiKey === 'your_google_maps_api_key_here') {
    console.error('Google Maps API key is missing or invalid');
    return false;
  }
  
  return true;
};

// Check if Google Maps is properly configured
export const isGoogleMapsConfigured = () => {
  return validateGoogleMapsConfig();
};

// Google Maps loader instance
let loaderInstance: Loader | null = null;

export const getGoogleMapsLoader = () => {
  if (!loaderInstance) {
    if (!validateGoogleMapsConfig()) {
      throw new Error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.');
    }
    
    loaderInstance = new Loader(GOOGLE_MAPS_CONFIG);
  }
  
  return loaderInstance;
};

// Load Google Maps API
export const loadGoogleMaps = async () => {
  try {
    const loader = getGoogleMapsLoader();
    await loader.load();
    console.log('Google Maps API loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load Google Maps API:', error);
    throw new Error(`Google Maps API loading failed: ${error}`);
  }
};

// Initialize Google Maps with Places service
export const initializeGoogleMapsWithPlaces = async () => {
  try {
    await loadGoogleMaps();
    
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API not available');
    }
    
    // Test Places service
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );
    
    console.log('Google Maps and Places API initialized successfully');
    return { maps: window.google.maps, placesService };
  } catch (error) {
    console.error('Failed to initialize Google Maps with Places:', error);
    throw error;
  }
};

// Test Google Maps API connection
export const testGoogleMapsConnection = async () => {
  try {
    if (!isGoogleMapsConfigured()) {
      throw new Error('Google Maps is not properly configured');
    }
    
    await loadGoogleMaps();
    console.log('Google Maps connection test successful');
    return true;
  } catch (error) {
    console.error('Google Maps connection test failed:', error);
    return false;
  }
};

// Get current location using browser geolocation
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    });
  });
};

// Google Maps error handling
export const handleGoogleMapsError = (error: any) => {
  console.error('Google Maps Error:', error);
  
  if (error.message?.includes('API key')) {
    return 'Google Maps API key error. Please check your configuration.';
  }
  
  if (error.message?.includes('quota')) {
    return 'Google Maps API quota exceeded. Please check your billing.';
  }
  
  if (error.message?.includes('network')) {
    return 'Network error while loading Google Maps. Please check your connection.';
  }
  
  return 'An error occurred while loading Google Maps. Please try again.';
};