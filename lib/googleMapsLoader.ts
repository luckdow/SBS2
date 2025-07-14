// Centralized Google Maps API loader to avoid script conflicts
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let loadPromise: Promise<void> | null = null;

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
    console.error('🗺️ Google Maps API key not configured');
    return Promise.reject(new Error('Google Maps API key not configured'));
  }

  console.log('🗺️ Loading Google Maps API with key:', apiKey.substring(0, 8) + '...');

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

    script.onerror = () => {
      isGoogleMapsLoading = false;
      delete (window as any)[callbackName];
      console.error('🗺️ Google Maps API script failed to load. Possible causes:', {
        url: script.src,
        keyPrefix: apiKey.substring(0, 8) + '...',
        possibleIssues: [
          'API key might have domain restrictions',
          'JavaScript API might not be enabled for this key',
          'Places API might not be enabled for this key',
          'API key might be invalid or suspended',
          'Billing might not be enabled for this project'
        ]
      });
      reject(new Error('Google Maps API failed to load'));
    };

    document.head.appendChild(script);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!isGoogleMapsLoaded) {
        isGoogleMapsLoading = false;
        delete (window as any)[callbackName];
        reject(new Error('Google Maps API loading timeout'));
      }
    }, 10000);
  });

  return loadPromise;
};

export const isGoogleMapsAPILoaded = (): boolean => {
  return isGoogleMapsLoaded || (typeof window !== 'undefined' && window.google && window.google.maps);
};