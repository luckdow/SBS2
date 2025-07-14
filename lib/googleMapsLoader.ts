// Centralized Google Maps API loader to avoid script conflicts
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let loadPromise: Promise<void> | null = null;
let diagnosticInfo: any = {};

// Get API key from environment with proper fallback
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    // Browser environment - check both window and process
    return window.process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
           process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDa66vbuMgm_L4wdOgPutliu_PLzI3xqEw";
  }
  // Server environment
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDa66vbuMgm_L4wdOgPutliu_PLzI3xqEw";
};

// Enhanced API diagnostic capabilities
export const getGoogleMapsApiDiagnostics = () => {
  const apiKey = getApiKey();
  
  return {
    apiKeyConfigured: !!(apiKey && apiKey !== 'your_google_maps_api_key_here' && apiKey !== 'AIzaSyDa66vbuMgm_L4wdOgPutliu_PLzI3xqEw'),
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'Not configured',
    isLoaded: isGoogleMapsLoaded,
    isLoading: isGoogleMapsLoading,
    lastError: diagnosticInfo.lastError,
    lastAttempt: diagnosticInfo.lastAttempt,
    environment: typeof window !== 'undefined' ? 'browser' : 'server',
    possibleIssues: [
      'API key might not be configured in Netlify environment variables',
      'API key might have domain restrictions that block your domain',
      'Maps JavaScript API might not be enabled in Google Cloud Console',
      'Places API might not be enabled in Google Cloud Console', 
      'Directions API might not be enabled in Google Cloud Console',
      'Distance Matrix API might not be enabled in Google Cloud Console',
      'API key might be invalid or suspended',
      'Billing might not be enabled for this Google Cloud project',
      'Browser might be blocking the script due to ad blockers or privacy settings'
    ],
    requiredApis: [
      'Maps JavaScript API',
      'Places API', 
      'Directions API',
      'Distance Matrix API'
    ],
    setupInstructions: [
      '1. Go to Google Cloud Console (console.cloud.google.com)',
      '2. Create or select a project',
      '3. Enable billing for the project',
      '4. Navigate to APIs & Services > Library',
      '5. Enable: Maps JavaScript API, Places API, Directions API, Distance Matrix API',
      '6. Navigate to APIs & Services > Credentials',
      '7. Create API Key or edit existing one',
      '8. In Netlify Dashboard: Site Settings → Environment Variables',
      '9. Add: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY with your API key',
      '10. For production: Add your domain to HTTP referrers restrictions in Google Cloud Console'
    ]
  };
};

// Test API key validity using browser-based services only (safer than HTTP requests)
export const validateGoogleMapsApiKey = async (): Promise<{
  isValid: boolean;
  error?: string;
  details?: any;
}> => {
  const apiKey = getApiKey();
  
  if (!apiKey || apiKey === 'your_google_maps_api_key_here' || apiKey === 'AIzaSyDa66vbuMgm_L4wdOgPutliu_PLzI3xqEw') {
    return {
      isValid: false,
      error: 'API key not configured or using example key'
    };
  }

  // In browser environment, we can only validate after the API is loaded
  if (typeof window === 'undefined') {
    return {
      isValid: true, // Assume valid on server side
      error: 'Cannot validate on server side'
    };
  }

  // Check if API is loaded and working
  if (!window.google || !window.google.maps) {
    return {
      isValid: false,
      error: 'Google Maps API not loaded yet'
    };
  }

  // Basic validation - if we can access the API objects, the key is likely valid
  try {
    if (window.google.maps.places && window.google.maps.DirectionsService) {
      return { isValid: true };
    } else {
      return {
        isValid: false,
        error: 'Some Google Maps services are missing - check API enables in Google Cloud Console'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Error accessing Google Maps services',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const loadGoogleMapsAPI = (): Promise<void> => {
  // If already loaded, return resolved promise
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (isGoogleMapsLoading && loadPromise) {
    return loadPromise;
  }

  // Check if Google Maps is already available
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    isGoogleMapsLoaded = true;
    return Promise.resolve();
  }

  const apiKey = getApiKey();
  
  if (!apiKey || apiKey === 'your_google_maps_api_key_here' || apiKey === 'AIzaSyDa66vbuMgm_L4wdOgPutliu_PLzI3xqEw') {
    const error = 'Google Maps API key not configured or using example key. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.';
    console.error('🗺️', error);
    diagnosticInfo.lastError = error;
    diagnosticInfo.lastAttempt = new Date().toISOString();
    return Promise.reject(new Error(error));
  }

  console.log('🗺️ Loading Google Maps API with key:', apiKey.substring(0, 8) + '...');
  diagnosticInfo.lastAttempt = new Date().toISOString();

  // Check if script is already in the DOM
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    // Script exists, wait for it to load
    loadPromise = new Promise((resolve, reject) => {
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          isGoogleMapsLoaded = true;
          isGoogleMapsLoading = false;
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      
      // Timeout after 15 seconds (increased from 10)
      setTimeout(() => {
        if (!isGoogleMapsLoaded) {
          isGoogleMapsLoading = false;
          const timeoutError = 'Google Maps API loading timeout - existing script found but API not loaded';
          diagnosticInfo.lastError = timeoutError;
          reject(new Error(timeoutError));
        }
      }, 15000);
    });
    return loadPromise;
  }

  isGoogleMapsLoading = true;
  
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackName = 'initGoogleMapsGlobal';
    
    // Create global callback
    (window as any)[callbackName] = () => {
      isGoogleMapsLoaded = true;
      isGoogleMapsLoading = false;
      delete (window as any)[callbackName];
      
      // Mark the service as initialized
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        // Import and initialize the service
        import('./services/googleMaps').then(({ GoogleMapsService }) => {
          GoogleMapsService.markAsInitialized();
        });
      }
      
      console.log('🗺️ Google Maps API loaded successfully for autocomplete and mapping');
      resolve();
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = (error) => {
      isGoogleMapsLoading = false;
      delete (window as any)[callbackName];
      
      const errorDetails = {
        error: 'Google Maps API script failed to load',
        url: script.src,
        keyPrefix: apiKey.substring(0, 8) + '...',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        possibleCauses: [
          'Network connectivity issues to googleapis.com',
          'API key restrictions: Domain not authorized in Google Cloud Console',
          'API key invalid, suspended, or deleted',
          'Required APIs not enabled: Maps JavaScript API, Places API, Directions API, Distance Matrix API',
          'Billing not enabled for the Google Cloud project',
          'Browser/extension blocking Google APIs (ad blockers, privacy tools)',
          'Firewall or proxy blocking external requests',
          'CORS issues with the current domain'
        ],
        nextSteps: [
          'Check Google Cloud Console > APIs & Services > Credentials',
          'Verify API key is valid and active',
          'Enable all required APIs in Google Cloud Console',
          'Check domain restrictions in API key settings',
          'Ensure billing is enabled for the project',
          'Test with unrestricted API key first',
          'Check browser console and network tab for details',
          'Try in incognito mode to rule out browser extensions'
        ]
      };
      
      console.error('🗺️ Google Maps API script failed to load. Detailed diagnostic information:', errorDetails);
      diagnosticInfo.lastError = errorDetails;
      reject(new Error('Google Maps API failed to load'));
    };

    document.head.appendChild(script);
    
    // Timeout after 15 seconds (increased from 10)
    setTimeout(() => {
      if (!isGoogleMapsLoaded) {
        isGoogleMapsLoading = false;
        delete (window as any)[callbackName];
        
        const timeoutError = {
          error: 'Google Maps API loading timeout after 15 seconds',
          timestamp: new Date().toISOString(), 
          possibleCauses: [
            'Slow network connection to Google APIs',
            'API key restrictions blocking the request',
            'Google APIs experiencing downtime or issues',
            'Browser or network blocking Google Maps domains',
            'Too many concurrent requests to Google APIs',
            'DNS resolution issues for googleapis.com'
          ],
          troubleshooting: [
            'Check network connectivity to googleapis.com',
            'Verify API key configuration in Google Cloud Console',
            'Test with a fresh browser session (clear cache)',
            'Check if other Google services work',
            'Try again in a few minutes in case of temporary issues',
            'Test from a different network/device to isolate issues'
          ]
        };
        
        console.error('🗺️ Google Maps API loading timeout:', timeoutError);
        diagnosticInfo.lastError = timeoutError;
        reject(new Error('Google Maps API loading timeout'));
      }
    }, 15000);
  });

  return loadPromise;
};

export const isGoogleMapsAPILoaded = (): boolean => {
  return isGoogleMapsLoaded || (typeof window !== 'undefined' && window.google && window.google.maps);
};