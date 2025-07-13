// Global Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'driver' | 'customer';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver extends User {
  role: 'driver';
  licenseNumber: string;
  vehicleType: string;
  vehiclePlate: string;
  isActive: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalTrips: number;
  monthlyEarnings: number;
}

export interface Customer extends User {
  role: 'customer';
  totalReservations: number;
  preferredVehicle?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'sedan' | 'suv' | 'van' | 'luxury';
  capacity: number;
  baggage: number;
  pricePerKm: number;
  image: string;
  features: string[];
  rating: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'child_seat' | 'extra_baggage' | 'meet_greet' | 'other';
  isActive: boolean;
}

export interface Reservation {
  id: string;
  customerId: string;
  customer: Customer;
  
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
  vehicleId: string;
  vehicle: Vehicle;
  selectedServices: Service[];
  distance: number;
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  
  // Driver Assignment
  driverId?: string;
  driver?: Driver;
  
  // Status & Tracking
  status: 'pending' | 'assigned' | 'started' | 'completed' | 'cancelled';
  qrCode: string;
  specialRequests?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Transaction {
  id: string;
  reservationId: string;
  reservation: Reservation;
  amount: number;
  driverShare: number;
  companyShare: number;
  status: 'pending' | 'completed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'online';
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'reservation' | 'assignment' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}