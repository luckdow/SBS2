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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: Date;
  experience: number;
  languages: string[];
  status: 'active' | 'inactive' | 'suspended';
  currentVehicle?: string;
  location?: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  rating: number;
  totalTrips: number;
  documents: {
    license: string;
    background: string;
    medical: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends User {
  role: 'customer';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    accessibility: {
      wheelchair: boolean;
      assistance: boolean;
      specialNeeds: string;
    };
  };
  loyaltyPoints: number;
  totalTrips: number;
  status: 'active' | 'suspended' | 'pending';
  documents?: {
    id: string;
    passport?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'bus' | 'minibus' | 'car';
  brand: string;
  model: string;
  year: number;
  capacity: number;
  features: string[];
  status: 'active' | 'maintenance' | 'retired';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  driver?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  type: 'regular' | 'charter' | 'airport' | 'intercity';
  route: {
    origin: {
      name: string;
      lat: number;
      lng: number;
      address: string;
    };
    destination: {
      name: string;
      lat: number;
      lng: number;
      address: string;
    };
    waypoints?: Array<{
      name: string;
      lat: number;
      lng: number;
      stopDuration: number;
    }>;
    distance: number;
    duration: number;
  };
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
    departureTimes: string[];
    operatingDays: number[];
  };
  pricing: {
    basePrice: number;
    currency: string;
    pricePerKm?: number;
    discounts?: Array<{
      type: string;
      percentage: number;
      conditions: string;
    }>;
  };
  vehicle: {
    type: string;
    minCapacity: number;
    features: string[];
  };
  status: 'active' | 'suspended' | 'maintenance';
  bookingSettings: {
    advanceBooking: number;
    cancellationPolicy: string;
    requireApproval: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
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