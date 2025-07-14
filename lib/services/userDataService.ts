import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  role: 'customer' | 'driver' | 'admin';
  phone?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
}

export interface Reservation {
  id: string;
  customerId: string;
  driverId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  baggage: number;
  totalPrice: number;
  status: 'pending' | 'assigned' | 'started' | 'completed' | 'cancelled';
  vehicle?: any;
  flightNumber?: string;
  specialRequests?: string;
  qrCode?: string;
  createdAt: Date;
  rating?: number;
}

export class UserDataService {
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid,
          email: data.email,
          name: data.name || data.displayName,
          avatar: data.avatar || data.photoURL,
          role: data.role || 'customer',
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async getCustomerReservations(customerId: string): Promise<Reservation[]> {
    try {
      const reservationsRef = collection(db, 'reservations');
      const q = query(
        reservationsRef, 
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reservations: Reservation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reservations.push({
          id: doc.id,
          customerId: data.customerId,
          driverId: data.driverId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          from: data.from,
          to: data.to,
          date: data.date,
          time: data.time,
          passengers: data.passengers,
          baggage: data.baggage,
          totalPrice: data.totalPrice,
          status: data.status,
          vehicle: data.vehicle,
          flightNumber: data.flightNumber,
          specialRequests: data.specialRequests,
          qrCode: data.qrCode,
          createdAt: data.createdAt?.toDate() || new Date(),
          rating: data.rating,
        });
      });
      
      return reservations;
    } catch (error) {
      console.error('Error fetching customer reservations:', error);
      return [];
    }
  }

  static async getDriverReservations(driverId: string): Promise<Reservation[]> {
    try {
      const reservationsRef = collection(db, 'reservations');
      const q = query(
        reservationsRef, 
        where('driverId', '==', driverId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reservations: Reservation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reservations.push({
          id: doc.id,
          customerId: data.customerId,
          driverId: data.driverId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          from: data.from,
          to: data.to,
          date: data.date,
          time: data.time,
          passengers: data.passengers,
          baggage: data.baggage,
          totalPrice: data.totalPrice,
          status: data.status,
          vehicle: data.vehicle,
          flightNumber: data.flightNumber,
          specialRequests: data.specialRequests,
          qrCode: data.qrCode,
          createdAt: data.createdAt?.toDate() || new Date(),
          rating: data.rating,
        });
      });
      
      return reservations;
    } catch (error) {
      console.error('Error fetching driver reservations:', error);
      return [];
    }
  }

  static calculateCustomerStats(reservations: Reservation[]) {
    const completedReservations = reservations.filter(r => r.status === 'completed');
    const totalTrips = completedReservations.length;
    const totalSpent = completedReservations.reduce((total, r) => total + r.totalPrice, 0);
    
    // Calculate average rating
    const ratedReservations = completedReservations.filter(r => r.rating);
    const avgRating = ratedReservations.length > 0 
      ? ratedReservations.reduce((total, r) => total + (r.rating || 0), 0) / ratedReservations.length
      : 0;

    // Simple loyalty points calculation (1 point per 10 TL spent)
    const loyaltyPoints = Math.floor(totalSpent / 10);
    
    // Membership level based on total trips
    let membershipLevel = 'Bronze';
    if (totalTrips >= 50) membershipLevel = 'Platinum';
    else if (totalTrips >= 25) membershipLevel = 'Gold';
    else if (totalTrips >= 10) membershipLevel = 'Silver';

    // Calculate saved amount (mock calculation - 5% of total spent)
    const savedAmount = Math.floor(totalSpent * 0.05);

    return {
      totalTrips,
      totalSpent,
      loyaltyPoints,
      membershipLevel,
      avgRating: Number(avgRating.toFixed(1)),
      savedAmount,
    };
  }

  static calculateDriverStats(reservations: Reservation[]) {
    const completedReservations = reservations.filter(r => r.status === 'completed');
    const todayReservations = reservations.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.date === today;
    });
    
    const thisWeekReservations = reservations.filter(r => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return r.createdAt >= oneWeekAgo;
    });

    const thisMonthReservations = reservations.filter(r => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return r.createdAt >= oneMonthAgo;
    });

    const todayTrips = todayReservations.filter(r => r.status === 'completed').length;
    const weeklyTrips = thisWeekReservations.filter(r => r.status === 'completed').length;
    const monthlyEarnings = thisMonthReservations
      .filter(r => r.status === 'completed')
      .reduce((total, r) => total + r.totalPrice, 0);

    // Calculate rating from completed reservations
    const ratedReservations = completedReservations.filter(r => r.rating);
    const rating = ratedReservations.length > 0 
      ? ratedReservations.reduce((total, r) => total + (r.rating || 0), 0) / ratedReservations.length
      : 0;

    // Calculate completion rate
    const totalAssigned = reservations.filter(r => r.status !== 'pending').length;
    const completionRate = totalAssigned > 0 
      ? (completedReservations.length / totalAssigned) * 100 
      : 100;

    // Estimate total distance (mock calculation - 25km average per trip)
    const totalDistance = completedReservations.length * 25;

    return {
      todayTrips,
      weeklyTrips,
      monthlyEarnings,
      rating: Number(rating.toFixed(1)),
      completionRate: Number(completionRate.toFixed(1)),
      totalDistance,
    };
  }
}