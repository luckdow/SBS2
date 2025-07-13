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

// Generic CRUD Service
class CRUDService<T> {
  constructor(private collectionName: string) {}

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
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
    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error getting ${this.collectionName}:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<T | null> {
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
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
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
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  onSnapshot(callback: (items: T[]) => void) {
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

// Specific Services
export const reservationService = new CRUDService<Reservation>('reservations');
export const driverService = new CRUDService<Driver>('drivers');
export const vehicleService = new CRUDService<Vehicle>('vehicles');
export const serviceService = new CRUDService<Service>('services');
export const customerService = new CRUDService<Customer>('customers');
export const transactionService = new CRUDService<Transaction>('transactions');

// Extended Reservation Service
export const extendedReservationService = {
  ...reservationService,

  async assignDriver(reservationId: string, driverId: string): Promise<void> {
    try {
      await reservationService.update(reservationId, {
        driverId,
        status: 'assigned' as const,
        updatedAt: new Date()
      });
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
      throw error;
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
      throw error;
    }
  }
};