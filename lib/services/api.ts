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
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Reservation, Driver, Vehicle, Service, Customer, Transaction } from '../types';
import { mockDrivers, mockVehicles, mockServices, mockReservations } from './mockData';
import { reservationService as firebaseReservationService } from './reservationService';

// Check if Firebase is available
const isFirebaseAvailable = () => {
  try {
    return !!db && typeof window !== 'undefined';
  } catch (error) {
    console.warn('Firebase not available, using mock data');
    return false;
  }
};

// Generic CRUD Service with fallback to mock data
class CRUDService<T> {
  constructor(private collectionName: string, private mockData: T[] = []) {}

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!isFirebaseAvailable()) {
      const newId = Date.now().toString();
      const newItem = {
        ...data,
        id: newId,
        createdAt: new Date(),
        updatedAt: new Date()
      } as T;
      this.mockData.push(newItem);
      return newId;
    }

    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    if (!isFirebaseAvailable()) {
      return [...this.mockData];
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error getting ${this.collectionName}:`, error);
      return [...this.mockData];
    }
  }

  async getById(id: string): Promise<T | null> {
    if (!isFirebaseAvailable()) {
      return this.mockData.find((item: any) => item.id === id) || null;
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
      return this.mockData.find((item: any) => item.id === id) || null;
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    if (!isFirebaseAvailable()) {
      const index = this.mockData.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        this.mockData[index] = { ...this.mockData[index], ...data, updatedAt: new Date() };
      }
      return;
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (!isFirebaseAvailable()) {
      const index = this.mockData.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        this.mockData.splice(index, 1);
      }
      return;
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  onSnapshot(callback: (items: T[]) => void) {
    if (!isFirebaseAvailable()) {
      // For mock data, just call the callback immediately
      callback([...this.mockData]);
      return () => {}; // Return empty unsubscribe function
    }

    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      callback(items);
    });
  }
}

// Specific Services with mock data fallbacks
export const reservationService = new CRUDService<Reservation>('reservations', mockReservations as any);
export const driverService = new CRUDService<Driver>('drivers', mockDrivers as any);
export const vehicleService = new CRUDService<Vehicle>('vehicles', mockVehicles as any);
export const serviceService = new CRUDService<Service>('services', mockServices as any);
export const customerService = new CRUDService<Customer>('customers', []);
export const transactionService = new CRUDService<Transaction>('transactions', []);

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
      return mockReservations.filter(res => (res as any).driverId === driverId || (res as any).assignedDriver === driverId) as any;
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
      return mockReservations.filter(res => (res as any).driverId === driverId || (res as any).assignedDriver === driverId) as any;
    }
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
      return mockDrivers.filter(driver => driver.isActive) as any;
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
      return mockDrivers.filter(driver => driver.isActive) as any;
    }
  }
};