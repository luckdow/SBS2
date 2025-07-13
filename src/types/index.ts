export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'driver' | 'admin';
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  baggage: number;
  pricePerKm: number;
  image: string;
  features: string[];
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  active: boolean;
}

export interface Reservation {
  id: string;
  customerId: string;
  driverId?: string;
  vehicleId: string;
  
  // Trip details
  from: string;
  to: string;
  fromCoords: { lat: number; lng: number };
  toCoords: { lat: number; lng: number };
  distance: number;
  duration: number;
  
  // Timing
  date: Date;
  time: string;
  
  // Passengers
  passengers: number;
  baggage: number;
  flightNumber?: string;
  
  // Services
  selectedServices: string[];
  
  // Pricing
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  
  // Status
  status: 'pending' | 'assigned' | 'started' | 'completed' | 'cancelled';
  qrCode: string;
  
  // Financial
  driverShare?: number;
  companyShare?: number;
  
  // Timestamps
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleInfo: string;
  active: boolean;
  currentEarnings: number;
}

export interface FinancialRecord {
  id: string;
  reservationId: string;
  driverId: string;
  amount: number;
  type: 'earning' | 'commission';
  date: Date;
}