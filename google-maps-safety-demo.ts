// Demonstration script for Google Maps safety enhancements
// This shows how the enhanced safety checks work

import React from 'react';
import { GoogleMapsService } from './lib/services/googleMapsService';

// Example usage showing enhanced safety
async function demonstrateGoogleMapsSafety() {
  console.log('🧪 Testing Google Maps Safety Enhancements...');

  // Test 1: Safe Element Check with Retries
  console.log('\n1. Testing safeElementCheckAsync with retries...');
  
  const testDiv = document.createElement('div');
  document.body.appendChild(testDiv);
  
  const isValid1 = await GoogleMapsService.safeElementCheckAsync(testDiv);
  console.log('✅ Connected element check:', isValid1); // Should be true
  
  document.body.removeChild(testDiv);
  
  const isValid2 = await GoogleMapsService.safeElementCheckAsync(testDiv);
  console.log('❌ Disconnected element check:', isValid2); // Should be false

  // Test 2: DOM Stability Waiting
  console.log('\n2. Testing DOM stability waiting...');
  
  const unstableDiv = document.createElement('div');
  document.body.appendChild(unstableDiv);
  
  // Simulate instability by removing and re-adding
  setTimeout(() => {
    if (unstableDiv.parentNode) {
      document.body.removeChild(unstableDiv);
    }
  }, 100);
  
  setTimeout(() => {
    document.body.appendChild(unstableDiv);
  }, 200);
  
  const isStable = await GoogleMapsService.waitForDOMStability(unstableDiv, 500);
  console.log('⏳ DOM stability result:', isStable);
  
  // Cleanup
  if (unstableDiv.parentNode) {
    document.body.removeChild(unstableDiv);
  }

  // Test 3: Enhanced Element Validation During Async
  console.log('\n3. Testing async element validation...');
  
  const asyncDiv = document.createElement('div');
  document.body.appendChild(asyncDiv);
  
  try {
    await GoogleMapsService.validateElementDuringAsync(asyncDiv, 'Test operation');
    console.log('✅ Async validation passed');
  } catch (error) {
    console.log('❌ Async validation failed:', error.message);
  }
  
  // Remove element and test again
  document.body.removeChild(asyncDiv);
  
  try {
    await GoogleMapsService.validateElementDuringAsync(asyncDiv, 'Test operation on removed element');
    console.log('✅ Async validation passed (unexpected)');
  } catch (error) {
    console.log('❌ Async validation failed as expected:', error.message);
  }

  console.log('\n🎉 Google Maps safety demonstration complete!');
}

// Example of how to use in components (pseudo-code)
function ExampleComponentUsage() {
  /*
  This shows the pattern used in the enhanced components:
  
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const initializeMap = React.useCallback(async () => {
    if (!mapRef.current) return;
    
    setIsLoading(true);
    
    try {
      // 1. Validate element exists and is stable
      await GoogleMapsService.validateElementDuringAsync(mapRef.current, 'Map initialization');
      
      // 2. Wait for DOM stability
      const isStable = await GoogleMapsService.waitForDOMStability(mapRef.current, 2000);
      if (!isStable) {
        throw new Error('Map container did not stabilize');
      }
      
      // 3. Load Google Maps
      const google = await GoogleMapsService.loadGoogleMaps();
      
      // 4. Final safety check
      if (!GoogleMapsService.safeElementCheck(mapRef.current)) {
        throw new Error('Map container became unavailable');
      }
      
      // 5. Create map safely
      const map = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 36.8969, lng: 30.7133 }
      });
      
      console.log('✅ Map created safely');
      
    } catch (error) {
      console.error('❌ Map initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // JSX would be:
  // <div>
  //   <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
  //   {isLoading && <p>Loading map with enhanced safety...</p>}
  //   <button onClick={initializeMap}>Initialize Map Safely</button>
  // </div>
  */
  
  console.log('📝 This is a demonstration of the enhanced Google Maps safety pattern');
}

// Export for use
export { demonstrateGoogleMapsSafety, ExampleComponentUsage };