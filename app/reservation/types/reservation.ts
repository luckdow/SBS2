// Reservation Types for 4-Step Reservation System

export interface ReservationForm {
  // Step 1: Route and Basic Information
  direction: 'airport-to-hotel' | 'hotel-to-airport';
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  baggage: number;
  hotelLocation: string;
  hotelPlace?: google.maps.places.Place | google.maps.places.PlaceResult;
  
  // Step 2: Vehicle Selection and Pricing
  distance: number;
  estimatedDuration: string;
  vehicleId: string;
  vehicle?: Vehicle;
  selectedServices: string[];
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  
  // Step 3: Personal and Flight Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flightNumber: string;
  specialRequests?: string;
  
  // Step 4: Payment and Completion
  paymentMethod: 'credit-card' | 'bank-transfer' | 'cash';
  
  // Internal fields
  id?: string;
  customerId?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  customerCredentials?: {
    email: string;
    tempPassword: string;
  };
}

export interface Vehicle {
  id: string;
  name: string;
  image: string;
  capacity: number;
  baggage: number;
  pricePerKm: number;
  features: string[];
  rating: number;
  gradient: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
  gradient: string;
  isActive: boolean;
}

export interface PaymentSettings {
  creditCardActive: boolean;
  bankTransferActive: boolean;
  cashActive: boolean;
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    iban: string;
    accountNumber: string;
    swiftCode: string;
    bankBranch?: string;
  };
  paytrConfig?: {
    merchantId: string;
    testMode: boolean;
    successUrl: string;
    failUrl: string;
  };
}

export interface RouteInfo {
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
}

export interface StepProps {
  onNext: (data: any) => void;
  onBack?: () => void;
  disabled?: boolean;
  reservationData?: Partial<ReservationForm>;
}

export interface VehicleStepProps extends StepProps {
  vehicles: Vehicle[];
  services: Service[];
  loadingVehicles: boolean;
  loadingServices: boolean;
}

export interface PaymentStepProps extends StepProps {
  reservationData: Partial<ReservationForm>;
}

export interface ConfirmationStepProps {
  reservationData: ReservationForm;
  qrCode: string;
}

// Step indicator configuration
export interface StepConfig {
  id: number;
  name: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export type ReservationStep = 1 | 2 | 3 | 4 | 5;