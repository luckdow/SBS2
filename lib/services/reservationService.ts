import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Reservation {
  id?: string;
  // Route & Details
  direction: 'airport-to-hotel' | 'hotel-to-airport';
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  baggage: number;
  flightNumber?: string;
  
  // Vehicle & Pricing
  vehicle: {
    id: string;
    name: string;
    capacity: number;
    pricePerKm: number;
  };
  selectedServices: string[];
  distance: number;
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  
  // Customer Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  
  // System Fields
  status: 'pending' | 'assigned' | 'started' | 'completed' | 'cancelled';
  qrCode: string;
  assignedDriver?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Driver {
  id?: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleType: string;
  isActive: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  createdAt: Timestamp;
}

export const reservationService = {
  // Create new reservation
  async createReservation(reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'reservations'), {
        ...reservationData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  // Get all reservations
  async getReservations(): Promise<Reservation[]> {
    try {
      const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reservation));
    } catch (error) {
      console.error('Error getting reservations:', error);
      throw error;
    }
  },

  // Listen to reservations in real-time
  onReservationsChange(callback: (reservations: Reservation[]) => void) {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const reservations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reservation));
      callback(reservations);
    });
  },

  // Update reservation status
  async updateReservationStatus(reservationId: string, status: Reservation['status'], driverId?: string): Promise<void> {
    try {
      const reservationRef = doc(db, 'reservations', reservationId);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      if (driverId) {
        updateData.assignedDriver = driverId;
      }
      
      await updateDoc(reservationRef, updateData);
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  },

  // Get driver reservations
  async getDriverReservations(driverId: string): Promise<Reservation[]> {
    try {
      const q = query(
        collection(db, 'reservations'),
        where('assignedDriver', '==', driverId),
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

export const driverService = {
  // Get all drivers
  async getDrivers(): Promise<Driver[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'drivers'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
    } catch (error) {
      console.error('Error getting drivers:', error);
      throw error;
    }
  },

  // Add new driver
  async addDriver(driverData: Omit<Driver, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'drivers'), {
        ...driverData,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding driver:', error);
      throw error;
    }
  }
};