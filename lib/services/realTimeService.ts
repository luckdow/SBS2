// Real-time service for Firebase operations
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
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Reservation, Driver, Vehicle, Service } from '../types';
import { mockDrivers, mockVehicles, mockServices, mockReservations } from './mockData';

// Real-time Reservation Service
export class RealTimeReservationService {
  private collectionName = 'reservations';

  async create(reservationData: any): Promise<string> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Firebase not configured, using mock data');
      const mockId = `RES${Date.now()}`;
      console.log('Mock reservation created:', mockId, reservationData);
      return mockId;
    }

    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...reservationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending'
      });
      
      console.log('✅ Reservation created in Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating reservation:', error);
      // Fallback to mock
      const mockId = `RES${Date.now()}`;
      console.log('Fallback to mock reservation:', mockId);
      return mockId;
    }
  }

  async getAll(): Promise<Reservation[]> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock reservations');
      return mockReservations as any;
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const reservations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Reservation[];
      
      console.log('✅ Loaded reservations from Firebase:', reservations.length);
      return reservations;
    } catch (error) {
      console.error('❌ Error loading reservations:', error);
      return mockReservations as any;
    }
  }

  async assignDriver(reservationId: string, driverId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Mock driver assignment:', reservationId, driverId);
      return;
    }

    try {
      const reservationRef = doc(db, this.collectionName, reservationId);
      await updateDoc(reservationRef, {
        driverId,
        status: 'assigned',
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Driver assigned in Firebase:', reservationId, driverId);
    } catch (error) {
      console.error('❌ Error assigning driver:', error);
      console.log('Fallback: Mock driver assignment');
    }
  }

  async updateStatus(reservationId: string, status: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Mock status update:', reservationId, status);
      return;
    }

    try {
      const reservationRef = doc(db, this.collectionName, reservationId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'started') {
        updateData.startedAt = serverTimestamp();
      } else if (status === 'completed') {
        updateData.completedAt = serverTimestamp();
      }

      await updateDoc(reservationRef, updateData);
      console.log('✅ Status updated in Firebase:', reservationId, status);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      console.log('Fallback: Mock status update');
    }
  }

  // Real-time listener for reservations
  onReservationsChange(callback: (reservations: Reservation[]) => void) {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock real-time data');
      // Simulate real-time with mock data
      callback(mockReservations as any);
      return () => {}; // Return empty unsubscribe function
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (querySnapshot) => {
        const reservations = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Reservation[];
        
        console.log('🔄 Real-time reservations update:', reservations.length);
        callback(reservations);
      }, (error) => {
        console.error('❌ Real-time listener error:', error);
        // Fallback to mock data
        callback(mockReservations as any);
      });
    } catch (error) {
      console.error('❌ Error setting up real-time listener:', error);
      callback(mockReservations as any);
      return () => {};
    }
  }

  // Get driver reservations
  async getDriverReservations(driverId: string): Promise<Reservation[]> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock driver reservations for:', driverId);
      return mockReservations.filter(res => res.driverId === driverId) as any;
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('driverId', '==', driverId),
        where('status', 'in', ['assigned', 'started']),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reservations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Reservation[];
      
      console.log('✅ Driver reservations loaded:', driverId, reservations.length);
      return reservations;
    } catch (error) {
      console.error('❌ Error loading driver reservations:', error);
      return mockReservations.filter(res => res.driverId === driverId) as any;
    }
  }
}

// Real-time Driver Service
export class RealTimeDriverService {
  private collectionName = 'drivers';

  async getAll(): Promise<Driver[]> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock drivers');
      return mockDrivers as any;
    }

    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const drivers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];
      
      console.log('✅ Drivers loaded from Firebase:', drivers.length);
      return drivers;
    } catch (error) {
      console.error('❌ Error loading drivers:', error);
      return mockDrivers as any;
    }
  }

  async getActiveDrivers(): Promise<Driver[]> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock active drivers');
      return mockDrivers.filter(d => d.isActive) as any;
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const drivers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];
      
      console.log('✅ Active drivers loaded:', drivers.length);
      return drivers;
    } catch (error) {
      console.error('❌ Error loading active drivers:', error);
      return mockDrivers.filter(d => d.isActive) as any;
    }
  }
}

// Export service instances
export const realTimeReservationService = new RealTimeReservationService();
export const realTimeDriverService = new RealTimeDriverService();