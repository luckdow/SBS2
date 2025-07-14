// Centralized Google Maps API loader to avoid script conflicts
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let loadPromise: Promise<void> | null = null;
let diagnosticInfo: any = {};

// Enhanced API diagnostic capabilities
export const getGoogleMapsApiDiagnostics = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  return {
    apiKeyConfigured: !!(apiKey && apiKey !== 'your_google_maps_api_key_here'),
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'Not configured',
    isLoaded: isGoogleMapsLoaded,
    isLoading: isGoogleMapsLoading,
    lastError: diagnosticInfo.lastError,
    lastAttempt: diagnosticInfo.lastAttempt,
    possibleIssues: [
      'API key might have domain restrictions that block localhost',
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
      '8. For testing: Leave API key unrestricted OR add localhost:3000 to authorized domains',
      '9. For production: Add your domain to HTTP referrers restrictions'
    ]
  };
};

// Test API key validity by making a direct request
export const validateGoogleMapsApiKey = async (): Promise<{
  isValid: boolean;
  error?: string;
  details?: any;
}> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return {
      isValid: false,
      error: 'API key not configured'
    };
  }

  try {
    // Test with a simple geocoding request to validate the key
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Antalya,Turkey&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      return { isValid: true };
    } else if (data.status === 'REQUEST_DENIED') {
      return {
        isValid: false,
        error: 'API key is invalid or restricted',
        details: data.error_message
      };
    } else {
      return {
        isValid: false, 
        error: `API returned status: ${data.status}`,
        details: data.error_message
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Network error or API endpoint blocked',
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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    const error = 'Google Maps API key not configured';
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
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!isGoogleMapsLoaded) {
          isGoogleMapsLoading = false;
          reject(new Error('Google Maps API loading timeout'));
        }
      }, 10000);
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
        url: script.src,
        keyPrefix: apiKey.substring(0, 8) + '...',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        possibleCauses: [
          'Domain restrictions: API key might be restricted to specific domains and localhost is not allowed',
          'Missing API enables: Maps JavaScript API not enabled in Google Cloud Console',
          'Missing API enables: Places API not enabled in Google Cloud Console',
          'Missing API enables: Directions API not enabled in Google Cloud Console', 
          'Missing API enables: Distance Matrix API not enabled in Google Cloud Console',
          'Invalid API key: Key might be invalid, suspended, or deleted',
          'Billing not enabled: Google Cloud project might not have billing configured',
          'Browser blocking: Ad blockers or privacy settings might be blocking the script',
          'Network issues: Firewall or proxy might be blocking Google APIs'
        ],
        nextSteps: [
          'Check Google Cloud Console > APIs & Services > Credentials',
          'Verify API key is valid and not restricted',
          'Enable all required APIs in Google Cloud Console',
          'Ensure billing is enabled for the project',
          'Test with unrestricted API key first',
          'Check browser console for additional error details'
        ]
      };
      
      console.error('🗺️ Google Maps API script failed to load. Detailed diagnostic information:', errorDetails);
      diagnosticInfo.lastError = errorDetails;
      reject(new Error('Google Maps API failed to load'));
    };

    document.head.appendChild(script);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!isGoogleMapsLoaded) {
        isGoogleMapsLoading = false;
        delete (window as any)[callbackName];
        
        const timeoutError = {
          error: 'Google Maps API loading timeout after 10 seconds',
          timestamp: new Date().toISOString(), 
          possibleCauses: [
            'Slow network connection to Google APIs',
            'API key restrictions blocking the request',
            'Google APIs experiencing downtime or issues',
            'Browser or network blocking Google Maps domains',
            'Too many concurrent requests to Google APIs'
          ],
          troubleshooting: [
            'Check network connectivity to googleapis.com',
            'Verify API key configuration in Google Cloud Console',
            'Test with a fresh browser session (clear cache)',
            'Check if other Google services work',
            'Try again in a few minutes in case of temporary issues'
          ]
        };
        
        console.error('🗺️ Google Maps API loading timeout:', timeoutError);
        diagnosticInfo.lastError = timeoutError;
        reject(new Error('Google Maps API loading timeout'));
      }
    }, 10000);
  });

  return loadPromise;
};

export const isGoogleMapsAPILoaded = (): boolean => {
  return isGoogleMapsLoaded || (typeof window !== 'undefined' && window.google && window.google.maps);
};