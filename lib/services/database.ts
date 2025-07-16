// Database initialization and collection setup
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Database collections configuration
export const COLLECTIONS = {
  SETTINGS: 'settings',
  VEHICLES: 'vehicles',
  DRIVERS: 'drivers',
  SERVICES: 'services',
  CUSTOMERS: 'customers',
  RESERVATIONS: 'reservations',
  TRANSACTIONS: 'transactions'
} as const;

// Default system settings
const DEFAULT_SETTINGS = {
  app: {
    name: 'SBS Travel Platform',
    version: '1.0.0',
    supportEmail: 'support@sbstravel.com',
    companyName: 'SBS Travel',
    maintenance: false,
    enableRegistration: true,
    enableBooking: true
  },
  booking: {
    advanceBookingDays: 30,
    cancellationHours: 24,
    maxPassengers: 8,
    requireApproval: false
  },
  payment: {
    enablePayTR: false,
    enableCash: true,
    enableCredit: false,
    currency: 'TRY'
  },
  notification: {
    enableEmail: false,
    enableSMS: false,
    enablePush: false
  },
  maps: {
    defaultLat: 39.9208,
    defaultLng: 32.8541,
    defaultZoom: 10,
    enableRouteOptimization: true
  }
};

// Initialize system settings
export const initializeSettings = async () => {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'system');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      });
      console.log('System settings initialized');
    } else {
      console.log('System settings already exist');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize settings:', error);
    throw error;
  }
};

// Check if collection exists and has documents
export const checkCollectionExists = async (collectionName: string) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    return !snapshot.empty;
  } catch (error) {
    console.error(`Failed to check collection ${collectionName}:`, error);
    return false;
  }
};

// Initialize empty collections with metadata
export const initializeEmptyCollections = async () => {
  const collections = [
    COLLECTIONS.VEHICLES,
    COLLECTIONS.DRIVERS,
    COLLECTIONS.SERVICES,
    COLLECTIONS.CUSTOMERS,
    COLLECTIONS.RESERVATIONS,
    COLLECTIONS.TRANSACTIONS
  ];
  
  const initializationResults = [];
  
  for (const collectionName of collections) {
    try {
      // Create a metadata document to initialize the collection
      const metadataRef = doc(db, collectionName, '_metadata');
      const metadataDoc = await getDoc(metadataRef);
      
      if (!metadataDoc.exists()) {
        await setDoc(metadataRef, {
          collectionName,
          createdAt: new Date(),
          description: `${collectionName} collection for SBS Travel Platform`,
          version: '1.0.0',
          isEmpty: true,
          lastUpdated: new Date()
        });
        console.log(`Collection ${collectionName} initialized`);
      } else {
        console.log(`Collection ${collectionName} already exists`);
      }
      
      initializationResults.push({ collection: collectionName, success: true });
    } catch (error) {
      console.error(`Failed to initialize collection ${collectionName}:`, error);
      initializationResults.push({ collection: collectionName, success: false, error });
    }
  }
  
  return initializationResults;
};

// Initialize all database collections and settings
export const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Initialize system settings
    await initializeSettings();
    
    // Initialize empty collections
    const collectionResults = await initializeEmptyCollections();
    
    // Check results
    const failedCollections = collectionResults.filter(result => !result.success);
    
    if (failedCollections.length > 0) {
      console.warn('Some collections failed to initialize:', failedCollections);
    }
    
    console.log('Database initialization completed');
    return {
      success: true,
      settings: true,
      collections: collectionResults
    };
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Get database status
export const getDatabaseStatus = async () => {
  try {
    const status = {
      settings: false,
      collections: {} as Record<string, boolean>
    };
    
    // Check settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'system');
    const settingsDoc = await getDoc(settingsRef);
    status.settings = settingsDoc.exists();
    
    // Check collections
    for (const collectionName of Object.values(COLLECTIONS)) {
      status.collections[collectionName] = await checkCollectionExists(collectionName);
    }
    
    return status;
  } catch (error) {
    console.error('Failed to get database status:', error);
    throw error;
  }
};

// Validate database structure
export const validateDatabaseStructure = async () => {
  try {
    const status = await getDatabaseStatus();
    const requiredCollections = Object.values(COLLECTIONS);
    
    const missingCollections = requiredCollections.filter(
      collection => !status.collections[collection]
    );
    
    return {
      isValid: status.settings && missingCollections.length === 0,
      settings: status.settings,
      missingCollections,
      allCollections: status.collections
    };
  } catch (error) {
    console.error('Database validation failed:', error);
    throw error;
  }
};