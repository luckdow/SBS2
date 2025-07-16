// Firebase configuration with enhanced setup and validation
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Validate Firebase configuration
export const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 
    'messagingSenderId', 'appId'
  ];
  
  const missingFields = requiredFields.filter(field => 
    !firebaseConfig[field as keyof typeof firebaseConfig] || 
    firebaseConfig[field as keyof typeof firebaseConfig] === ""
  );
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    return false;
  }
  
  return true;
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return validateFirebaseConfig() && 
         firebaseConfig.apiKey.startsWith("AIza") &&
         firebaseConfig.projectId !== "" &&
         firebaseConfig.authDomain !== "";
};

// Initialize Firebase only if not already initialized
let app;
try {
  if (getApps().length === 0) {
    if (!validateFirebaseConfig()) {
      throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
    }
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw error;
}

// Initialize Firebase services with error handling
export let db: any;
export let auth: any;
export let storage: any;

try {
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Firebase services initialization failed:', error);
  throw error;
}

// Development emulator configuration
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
  
  if (useEmulators && window.location.hostname === 'localhost') {
    try {
      // Connect to Firebase emulators if enabled
      console.log('Connecting to Firebase emulators...');
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('Firebase emulators connected successfully');
    } catch (error) {
      console.warn('Emulator connection failed (may already be connected):', error);
    }
  }
}

// Firebase connection test
export const testFirebaseConnection = async () => {
  try {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not properly configured');
    }
    
    // Test Firestore connection by attempting a simple operation
    const { doc, getDoc } = await import('firebase/firestore');
    const testDocRef = doc(db, 'test', 'connection');
    await getDoc(testDocRef);
    
    console.log('Firebase connection test successful');
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

export default app;