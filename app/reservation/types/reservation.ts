// Yeni rezervasyon sistemi tip tanımları
// Bu dosya modern 5 adımlı rezervasyon akışı için gerekli tüm tipleri içerir

export interface RouteInfo {
  distance: number; // km cinsinden
  duration: number; // dakika cinsinden  
  distanceText: string; // "15.2 km" format
  durationText: string; // "25 dakika" format
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
  gradient?: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  isActive: boolean;
  icon?: any;
  gradient?: string;
  category: string;
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
    swiftCode?: string;
  };
}

export interface ReservationData {
  // Step 1: Rota Seçimi
  direction: 'airport-to-hotel' | 'hotel-to-airport';
  hotelLocation: string;
  date: string;
  time: string;
  passengers: number;
  baggage: number;
  from: string;
  to: string;
  distance: number;
  estimatedDuration: string;
  hotelPlace?: google.maps.places.Place;
  routeInfo?: RouteInfo;
  
  // Step 2: Araç ve Fiyat Seçimi
  vehicle?: Vehicle;
  selectedServices: string[];
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  
  // Step 3: Kişisel Bilgiler
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flightNumber?: string;
  specialRequests?: string;
  
  // Step 4: Ödeme
  paymentMethod: 'cash' | 'bank-transfer' | 'credit-card';
  
  // Step 5 & Sistem Alanları
  id?: string;
  customerId?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt?: string;
  qrCode?: string;
  customerCredentials?: {
    email: string;
    tempPassword: string;
  };
}

export interface StepProps {
  data: Partial<ReservationData>;
  onNext: (stepData: Partial<ReservationData>) => void;
  onBack?: () => void;
}

export interface StepIndicatorProps {
  currentStep: number;
  stepNames: string[];
}

// Form validation için
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}