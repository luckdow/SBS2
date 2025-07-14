import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  getDoc,
  enableNetwork,
  disableNetwork 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Reservation, Driver, Vehicle, Service, Customer, Transaction } from '../types';
import { reservationService as firebaseReservationService } from './reservationService';

// Check if Firebase is available and properly configured
const isFirebaseAvailable = () => {
  try {
    return isFirebaseConfigured();
  } catch (error) {
    console.warn('Firebase not available');
    return false;
  }
};

// Cache system for offline support
class CacheManager {
  private static cache = new Map();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static get(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  static clear() {
    this.cache.clear();
  }

  static getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Generic CRUD Service without fallback to mock data
class CRUDService<T> {
  constructor(private collectionName: string) {}

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Clear cache to force refresh
      CacheManager.clear();
      console.log(`✅ Created ${this.collectionName} item ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error creating ${this.collectionName}:`, error);
      throw new Error(`Failed to create ${this.collectionName}. Please try again.`);
    }
  }

  async getAll(): Promise<T[]> {
    const cacheKey = `getAll-${this.collectionName}`;
    
    // Try cache first for offline support
    const cached = CacheManager.get(cacheKey);
    if (cached) {
      console.log(`📦 Using cached data for ${this.collectionName}`);
      return cached;
    }

    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      
      // Cache the result
      CacheManager.set(cacheKey, data);
      console.log(`✅ Loaded ${data.length} items from ${this.collectionName}`);
      return data;
    } catch (error) {
      console.error(`❌ Error getting ${this.collectionName}:`, error);
      
      // Try to return cached data if available
      const fallbackCached = CacheManager.get(cacheKey);
      if (fallbackCached) {
        console.log(`📦 Using stale cached data for ${this.collectionName} due to error`);
        return fallbackCached;
      }
      
      throw new Error(`Failed to load ${this.collectionName}. Please try again.`);
    }
  }

  async getById(id: string): Promise<T | null> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by id:`, error);
      throw new Error(`Failed to get ${this.collectionName}. Please try again.`);
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      
      // Clear cache to force refresh
      CacheManager.clear();
      console.log(`✅ Updated ${this.collectionName} item ${id}`);
    } catch (error) {
      console.error(`❌ Error updating ${this.collectionName}:`, error);
      throw new Error(`Failed to update ${this.collectionName}. Please try again.`);
    }
  }

  async delete(id: string): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      // Clear cache to force refresh
      CacheManager.clear();
      console.log(`✅ Deleted ${this.collectionName} item ${id}`);
    } catch (error) {
      console.error(`❌ Error deleting ${this.collectionName}:`, error);
      throw new Error(`Failed to delete ${this.collectionName}. Please try again.`);
    }
  }

  onSnapshot(callback: (items: T[]) => void) {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Real-time updates are not available.');
    }

    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      callback(items);
    }, (error) => {
      console.error(`❌ Real-time listener error for ${this.collectionName}:`, error);
      throw new Error('Real-time updates failed. Please refresh the page.');
    });
  }
}

// Specific Services without mock data fallbacks
export const reservationService = new CRUDService<Reservation>('reservations');
export const driverService = new CRUDService<Driver>('drivers');
export const vehicleService = new CRUDService<Vehicle>('vehicles');
export const serviceService = new CRUDService<Service>('services');
export const customerService = new CRUDService<Customer>('customers');
export const transactionService = new CRUDService<Transaction>('transactions');

// Settings Service for admin panel configuration
export interface AppSettings {
  id?: string;
  // Company Info
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  
  // PayTR API Settings
  paytrMerchantId: string;
  paytrMerchantKey: string;
  paytrMerchantSalt: string;
  paytrTestMode: boolean;
  paytrActive: boolean;
  paytrSuccessUrl: string;
  paytrFailUrl: string;
  
  // Bank Transfer Settings
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  iban: string;
  accountHolder: string;
  swiftCode: string;
  
  // Payment Method Settings
  creditCardPaymentActive: boolean;
  bankTransferPaymentActive: boolean;
  cashPaymentActive: boolean;
  
  // Pricing
  driverCommissionRate: number;
  companyCommissionRate: number;
  basePricePerKm: number;
  
  // Email Templates
  emailTemplateReservationConfirm: string;
  emailTemplateDriverAssigned: string;
  emailTemplateReminder: string;
  emailTemplateCancellation: string;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  
  // System
  autoAssignDrivers: boolean;
  requireDriverApproval: boolean;
  allowCancellation: boolean;
  cancellationTimeLimit: number;
  
  // Security
  requireTwoFactor: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  
  // Appearance
  darkMode: boolean;
  primaryColor: string;
  secondaryColor: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

const defaultSettings: AppSettings = {
  // Company Info
  companyName: 'SBS TRAVEL',
  companyEmail: 'info@sbstravel.com',
  companyPhone: '+90 532 123 4567',
  companyAddress: 'Antalya, Türkiye',
  
  // PayTR API Settings
  paytrMerchantId: '',
  paytrMerchantKey: '',
  paytrMerchantSalt: '',
  paytrTestMode: true,
  paytrActive: false,
  paytrSuccessUrl: '/payment/success',
  paytrFailUrl: '/payment/fail',
  
  // Bank Transfer Settings
  bankName: 'Türkiye İş Bankası',
  bankBranch: 'Antalya Şubesi',
  accountNumber: '1234567890',
  iban: 'TR12 0006 4000 0011 2345 6789 01',
  accountHolder: 'SBS Travel Turizm Ltd. Şti.',
  swiftCode: 'ISBKTRIS',
  
  // Payment Method Settings
  creditCardPaymentActive: true,
  bankTransferPaymentActive: true,
  cashPaymentActive: true,
  
  // Pricing
  driverCommissionRate: 75,
  companyCommissionRate: 25,
  basePricePerKm: 8,
  
  // Email Templates
  emailTemplateReservationConfirm: 'Rezervasyonunuz onaylandı. QR kodunuz ektedir.',
  emailTemplateDriverAssigned: 'Şoförünüz atandı: {{driverName}} - {{driverPhone}}',
  emailTemplateReminder: 'Rezervasyonunuz 24 saat içinde başlayacak.',
  emailTemplateCancellation: 'Rezervasyonunuz iptal edildi.',
  
  // Notifications
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: true,
  
  // System
  autoAssignDrivers: true,
  requireDriverApproval: false,
  allowCancellation: true,
  cancellationTimeLimit: 30,
  
  // Security
  requireTwoFactor: false,
  sessionTimeout: 60,
  passwordMinLength: 8,
  
  // Appearance
  darkMode: true,
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6'
};

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    const cacheKey = 'app-settings';
    
    // Try cache first
    const cached = CacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const q = query(collection(db, 'settings'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.docs.length > 0) {
        const settings = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        } as AppSettings;
        
        // Cache the result
        CacheManager.set(cacheKey, settings);
        return settings;
      } else {
        // Create default settings if none exist
        const docRef = await addDoc(collection(db, 'settings'), {
          ...defaultSettings,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        const newSettings = {
          id: docRef.id,
          ...defaultSettings
        };
        
        CacheManager.set(cacheKey, newSettings);
        return newSettings;
      }
    } catch (error) {
      console.error('Error getting settings:', error);
      throw new Error('Failed to load settings. Please try again.');
    }
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      // Get current settings first
      const currentSettings = await this.getSettings();
      
      if (currentSettings.id) {
        // Update existing
        const docRef = doc(db, 'settings', currentSettings.id);
        await updateDoc(docRef, {
          ...settings,
          updatedAt: Timestamp.now()
        });
      } else {
        // Create new
        await addDoc(collection(db, 'settings'), {
          ...defaultSettings,
          ...settings,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      
      // Clear cache to force refresh
      CacheManager.clear();
      console.log('✅ Settings updated successfully');
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      throw new Error('Failed to update settings. Please try again.');
    }
  },

  async resetToDefaults(): Promise<void> {
    return this.updateSettings(defaultSettings);
  },

  // Get specific payment settings for frontend
  async getPaymentSettings(): Promise<{
    creditCardActive: boolean;
    bankTransferActive: boolean;
    cashActive: boolean;
    bankDetails?: {
      bankName: string;
      accountHolder: string;
      iban: string;
      accountNumber: string;
      swiftCode: string;
    };
    paytrConfig?: {
      merchantId: string;
      testMode: boolean;
      successUrl: string;
      failUrl: string;
    };
  }> {
    const settings = await this.getSettings();
    
    const result = {
      creditCardActive: settings.creditCardPaymentActive && settings.paytrActive,
      bankTransferActive: settings.bankTransferPaymentActive,
      cashActive: settings.cashPaymentActive
    } as any;

    if (settings.bankTransferPaymentActive) {
      result.bankDetails = {
        bankName: settings.bankName,
        accountHolder: settings.accountHolder,
        iban: settings.iban,
        accountNumber: settings.accountNumber,
        swiftCode: settings.swiftCode
      };
    }

    if (settings.creditCardPaymentActive && settings.paytrActive) {
      result.paytrConfig = {
        merchantId: settings.paytrMerchantId,
        testMode: settings.paytrTestMode,
        successUrl: settings.paytrSuccessUrl,
        failUrl: settings.paytrFailUrl
      };
    }

    return result;
  }
};

// Extended Reservation Service
export const extendedReservationService = {
  // Use Firebase service if available, fallback to CRUD
  async getAll() {
    if (isFirebaseAvailable()) {
      try {
        return await firebaseReservationService.getReservations();
      } catch (error) {
        console.error('Firebase error, using fallback:', error);
      }
    }
    return reservationService.getAll();
  },

  async assignDriver(reservationId: string, driverId: string): Promise<void> {
    try {
      if (isFirebaseAvailable()) {
        await firebaseReservationService.updateReservationStatus(reservationId, 'assigned', driverId);
      } else {
        await reservationService.update(reservationId, {
          driverId,
          status: 'assigned' as const,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  },

  async startTrip(reservationId: string): Promise<void> {
    try {
      await reservationService.update(reservationId, {
        status: 'started' as const,
        startedAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error starting trip:', error);
      throw error;
    }
  },

  async completeTrip(reservationId: string): Promise<void> {
    try {
      await reservationService.update(reservationId, {
        status: 'completed' as const,
        completedAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error completing trip:', error);
      throw error;
    }
  },

  async getDriverReservations(driverId: string): Promise<Reservation[]> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const q = query(
        collection(db, 'reservations'),
        where('driverId', '==', driverId),
        where('status', 'in', ['assigned', 'started']),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reservation));
    } catch (error) {
      console.error('Error getting driver reservations:', error);
      throw new Error('Failed to load driver reservations. Please try again.');
    }
  }
};

// Network status management
export const networkService = {
  async enableOfflineMode() {
    if (isFirebaseAvailable()) {
      try {
        await disableNetwork(db);
        console.log('📱 Firebase offline mode enabled');
      } catch (error) {
        console.error('❌ Error enabling offline mode:', error);
      }
    }
  },

  async enableOnlineMode() {
    if (isFirebaseAvailable()) {
      try {
        await enableNetwork(db);
        console.log('🌐 Firebase online mode enabled');
      } catch (error) {
        console.error('❌ Error enabling online mode:', error);
      }
    }
  },

  getCacheStats() {
    return CacheManager.getStats();
  },

  clearCache() {
    CacheManager.clear();
    console.log('🗑️ All cache cleared');
  }
};

// Extended Driver Service
export const extendedDriverService = {
  ...driverService,

  async toggleActiveStatus(driverId: string, isActive: boolean): Promise<void> {
    try {
      await driverService.update(driverId, {
        isActive,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error toggling driver status:', error);
      throw error;
    }
  },

  async updateLocation(driverId: string, location: { lat: number; lng: number }): Promise<void> {
    try {
      await driverService.update(driverId, {
        currentLocation: location,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  },

  async getActiveDrivers(): Promise<Driver[]> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const q = query(
        collection(db, 'drivers'),
        where('isActive', '==', true),
        orderBy('rating', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
    } catch (error) {
      console.error('Error getting active drivers:', error);
      throw new Error('Failed to load active drivers. Please try again.');
    }
  }
};
