import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Reservation, Vehicle, Service } from '../../types';
import QRCode from 'qrcode';

export class ReservationService {
  private static instance: ReservationService;

  public static getInstance(): ReservationService {
    if (!ReservationService.instance) {
      ReservationService.instance = new ReservationService();
    }
    return ReservationService.instance;
  }

  public async createReservation(reservationData: Omit<Reservation, 'id' | 'qrCode' | 'createdAt'>): Promise<string> {
    try {
      // Generate QR code
      const qrCodeData = JSON.stringify({
        reservationId: Date.now().toString(),
        timestamp: Date.now(),
      });
      
      const qrCode = await QRCode.toDataURL(qrCodeData);

      const reservation: Omit<Reservation, 'id'> = {
        ...reservationData,
        qrCode,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'reservations'), reservation);
      return docRef.id;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  public async getReservation(id: string): Promise<Reservation | null> {
    try {
      const docRef = doc(db, 'reservations', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Reservation;
      }
      return null;
    } catch (error) {
      console.error('Error getting reservation:', error);
      throw error;
    }
  }

  public async updateReservationStatus(id: string, status: Reservation['status'], additionalData?: Partial<Reservation>): Promise<void> {
    try {
      const docRef = doc(db, 'reservations', id);
      const updateData: any = { status, ...additionalData };

      if (status === 'started') {
        updateData.startedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  public async assignDriverToReservation(reservationId: string, driverId: string): Promise<void> {
    try {
      const docRef = doc(db, 'reservations', reservationId);
      await updateDoc(docRef, {
        driverId,
        status: 'assigned',
        assignedAt: new Date(),
      });
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  }

  public async getDriverReservations(driverId: string): Promise<Reservation[]> {
    try {
      const q = query(
        collection(db, 'reservations'),
        where('driverId', '==', driverId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
    } catch (error) {
      console.error('Error getting driver reservations:', error);
      throw error;
    }
  }

  public async getAllReservations(): Promise<Reservation[]> {
    try {
      const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
    } catch (error) {
      console.error('Error getting all reservations:', error);
      throw error;
    }
  }

  public calculateFinancialSplit(totalAmount: number): { driverShare: number; companyShare: number } {
    const driverShare = Math.round(totalAmount * 0.75);
    const companyShare = totalAmount - driverShare;
    
    return { driverShare, companyShare };
  }
}