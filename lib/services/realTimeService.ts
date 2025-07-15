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

// Real-time Reservation Service
export class RealTimeReservationService {
  private collectionName = 'reservations';

  async create(reservationData: any): Promise<string> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
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
      throw new Error('Failed to create reservation. Please try again.');
    }
  }

  async getAll(): Promise<Reservation[]> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
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
      throw new Error('Failed to load reservations. Please try again.');
    }
  }

  async assignDriver(reservationId: string, driverId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
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
      throw new Error('Failed to assign driver. Please try again.');
    }
  }

  async updateStatus(reservationId: string, status: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
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
      throw new Error('Failed to update status. Please try again.');
    }
  }

  async update(reservationId: string, updateData: any): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const reservationRef = doc(db, this.collectionName, reservationId);
      await updateDoc(reservationRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Reservation updated in Firebase:', reservationId);
    } catch (error) {
      console.error('❌ Error updating reservation:', error);
      throw new Error('Failed to update reservation. Please try again.');
    }
  }

  async delete(reservationId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const reservationRef = doc(db, this.collectionName, reservationId);
      await deleteDoc(reservationRef);
      
      console.log('✅ Reservation deleted from Firebase:', reservationId);
    } catch (error) {
      console.error('❌ Error deleting reservation:', error);
      throw new Error('Failed to delete reservation. Please try again.');
    }
  }

  // Real-time listener for reservations
  onReservationsChange(callback: (reservations: Reservation[]) => void) {
    if (!isFirebaseConfigured()) {
      console.error('Firebase is not configured. Real-time updates are not available.');
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
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
        throw new Error('Real-time updates failed. Please refresh the page.');
      });
    } catch (error) {
      console.error('❌ Error setting up real-time listener:', error);
      throw new Error('Failed to set up real-time updates. Please try again.');
    }
  }

  // Get driver reservations
  async getDriverReservations(driverId: string): Promise<Reservation[]> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
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
      throw new Error('Failed to load driver reservations. Please try again.');
    }
  }
}

// Real-time Driver Service
export class RealTimeDriverService {
  private collectionName = 'drivers';

  async getAll(): Promise<Driver[]> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
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
      throw new Error('Failed to load drivers. Please try again.');
    }
  }

  async create(driverData: any): Promise<string> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...driverData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });
      
      console.log('✅ Driver created in Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating driver:', error);
      throw new Error('Failed to create driver. Please try again.');
    }
  }

  async update(driverId: string, updateData: any): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const driverRef = doc(db, this.collectionName, driverId);
      await updateDoc(driverRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Driver updated in Firebase:', driverId);
    } catch (error) {
      console.error('❌ Error updating driver:', error);
      throw new Error('Failed to update driver. Please try again.');
    }
  }

  async delete(driverId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const driverRef = doc(db, this.collectionName, driverId);
      await deleteDoc(driverRef);
      
      console.log('✅ Driver deleted from Firebase:', driverId);
    } catch (error) {
      console.error('❌ Error deleting driver:', error);
      throw new Error('Failed to delete driver. Please try again.');
    }
  }

  async toggleActiveStatus(driverId: string, isActive: boolean): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const driverRef = doc(db, this.collectionName, driverId);
      await updateDoc(driverRef, {
        isActive,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Driver status toggled in Firebase:', driverId, isActive);
    } catch (error) {
      console.error('❌ Error toggling driver status:', error);
      throw new Error('Failed to toggle driver status. Please try again.');
    }
  }

  async getActiveDrivers(): Promise<Driver[]> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
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
      throw new Error('Failed to load active drivers. Please try again.');
    }
  }
}

// Real-time Vehicle Service  
export class RealTimeVehicleService {
  private collectionName = 'vehicles';

  async getAll(): Promise<Vehicle[]> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const vehicles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Vehicle[];
      
      console.log('✅ Vehicles loaded from Firebase:', vehicles.length);
      return vehicles;
    } catch (error) {
      console.error('❌ Error loading vehicles:', error);
      throw new Error('Failed to load vehicles. Please try again.');
    }
  }

  async create(vehicleData: any): Promise<string> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...vehicleData,
        createdAt: serverTimestamp(),
        isActive: vehicleData.isActive !== undefined ? vehicleData.isActive : true
      });
      
      console.log('✅ Vehicle created in Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating vehicle:', error);
      throw new Error('Failed to create vehicle. Please try again.');
    }
  }

  async update(vehicleId: string, updateData: any): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const vehicleRef = doc(db, this.collectionName, vehicleId);
      await updateDoc(vehicleRef, updateData);
      
      console.log('✅ Vehicle updated in Firebase:', vehicleId);
    } catch (error) {
      console.error('❌ Error updating vehicle:', error);
      throw new Error('Failed to update vehicle. Please try again.');
    }
  }

  async delete(vehicleId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const vehicleRef = doc(db, this.collectionName, vehicleId);
      await deleteDoc(vehicleRef);
      
      console.log('✅ Vehicle deleted from Firebase:', vehicleId);
    } catch (error) {
      console.error('❌ Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle. Please try again.');
    }
  }

  async getActiveVehicles(): Promise<Vehicle[]> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please check your Firebase configuration.');
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const vehicles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Vehicle[];
      
      console.log('✅ Active vehicles loaded:', vehicles.length);
      return vehicles;
    } catch (error) {
      console.error('❌ Error loading active vehicles:', error);
      throw new Error('Failed to load active vehicles. Please try again.');
    }
  }
}

// Export service instances
export const realTimeReservationService = new RealTimeReservationService();
export const realTimeDriverService = new RealTimeDriverService();
export const realTimeVehicleService = new RealTimeVehicleService();