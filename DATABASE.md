# SBS Travel Platform - Database Structure

## Firebase Firestore Collections

### 1. Settings Collection (`settings`)
**Purpose**: System-wide configuration and settings

**Document**: `system`
```typescript
{
  app: {
    name: string;           // Application name
    version: string;        // Current version
    supportEmail: string;   // Support contact
    companyName: string;    // Company name
    maintenance: boolean;   // Maintenance mode
    enableRegistration: boolean;
    enableBooking: boolean;
  },
  booking: {
    advanceBookingDays: number;   // Max days in advance
    cancellationHours: number;    // Hours before cancellation
    maxPassengers: number;        // Max passengers per booking
    requireApproval: boolean;     // Admin approval required
  },
  payment: {
    enablePayTR: boolean;
    enableCash: boolean;
    enableCredit: boolean;
    currency: string;
  },
  notification: {
    enableEmail: boolean;
    enableSMS: boolean;
    enablePush: boolean;
  },
  maps: {
    defaultLat: number;
    defaultLng: number;
    defaultZoom: number;
    enableRouteOptimization: boolean;
  },
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: string;
}
```

### 2. Vehicles Collection (`vehicles`)
**Purpose**: Fleet management - buses, minibuses, cars

**Document Structure**:
```typescript
{
  id: string;                    // Unique vehicle ID
  plateNumber: string;           // License plate
  type: 'bus' | 'minibus' | 'car';
  brand: string;                 // Vehicle brand
  model: string;                 // Vehicle model
  year: number;                  // Manufacturing year
  capacity: number;              // Passenger capacity
  features: string[];            // WiFi, AC, etc.
  status: 'active' | 'maintenance' | 'retired';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  driver?: string;               // Current driver ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. Drivers Collection (`drivers`)
**Purpose**: Driver management and assignments

**Document Structure**:
```typescript
{
  id: string;                    // Unique driver ID
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;         // Driver's license
  licenseExpiry: Timestamp;
  experience: number;            // Years of experience
  languages: string[];           // Spoken languages
  status: 'active' | 'inactive' | 'suspended';
  currentVehicle?: string;       // Assigned vehicle ID
  location?: {
    lat: number;
    lng: number;
    lastUpdated: Timestamp;
  };
  rating: number;                // Average rating
  totalTrips: number;
  documents: {
    license: string;             // Document URLs
    background: string;
    medical: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4. Services Collection (`services`)
**Purpose**: Available travel services and routes

**Document Structure**:
```typescript
{
  id: string;                    // Unique service ID
  name: string;                  // Service name
  description: string;           // Service description
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
      stopDuration: number;      // Minutes
    }>;
    distance: number;            // Kilometers
    duration: number;            // Minutes
  };
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
    departureTimes: string[];    // HH:MM format
    operatingDays: number[];     // 0-6, Sunday=0
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
    advanceBooking: number;      // Days
    cancellationPolicy: string;
    requireApproval: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5. Customers Collection (`customers`)
**Purpose**: Customer profiles and preferences

**Document Structure**:
```typescript
{
  id: string;                    // User UID from Firebase Auth
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Timestamp;
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
  role: 'customer' | 'admin' | 'driver';
  status: 'active' | 'suspended' | 'pending';
  documents?: {
    id: string;                  // ID document URL
    passport?: string;           // Passport URL
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}
```

### 6. Reservations Collection (`reservations`)
**Purpose**: Booking and reservation management

**Document Structure**:
```typescript
{
  id: string;                    // Unique reservation ID
  customerId: string;            // Customer reference
  serviceId: string;             // Service reference
  vehicleId?: string;            // Assigned vehicle
  driverId?: string;             // Assigned driver
  
  journey: {
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
    departureDate: Timestamp;
    arrivalDate?: Timestamp;
    actualDeparture?: Timestamp;
    actualArrival?: Timestamp;
  };
  
  passengers: Array<{
    firstName: string;
    lastName: string;
    age?: number;
    seatNumber?: string;
    specialNeeds?: string;
  }>;
  
  pricing: {
    basePrice: number;
    taxes: number;
    discounts: number;
    totalPrice: number;
    currency: string;
  };
  
  payment: {
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    method: 'cash' | 'card' | 'online';
    transactionId?: string;
    paidAt?: Timestamp;
  };
  
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  qrCode?: string;               // For check-in
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
}
```

### 7. Transactions Collection (`transactions`)
**Purpose**: Financial transaction tracking

**Document Structure**:
```typescript
{
  id: string;                    // Unique transaction ID
  reservationId: string;         // Related reservation
  customerId: string;            // Customer reference
  
  type: 'payment' | 'refund' | 'fee' | 'commission';
  method: 'cash' | 'card' | 'paytr' | 'bank_transfer';
  
  amount: {
    gross: number;               // Total amount
    net: number;                 // After fees
    tax: number;                 // Tax amount
    fees: number;                // Processing fees
    currency: string;
  };
  
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  gateway?: {
    provider: string;            // PayTR, etc.
    transactionId: string;
    referenceNumber: string;
    response?: any;              // Gateway response
  };
  
  metadata: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}
```

## Indexes Required

### Composite Indexes
1. `reservations`: `customerId` ASC, `status` ASC, `createdAt` DESC
2. `reservations`: `serviceId` ASC, `departureDate` ASC
3. `transactions`: `customerId` ASC, `type` ASC, `createdAt` DESC
4. `drivers`: `status` ASC, `currentVehicle` ASC
5. `vehicles`: `status` ASC, `type` ASC

### Single Field Indexes
- All timestamp fields (`createdAt`, `updatedAt`)
- Status fields in all collections
- Email fields for lookups
- Foreign key references (customerId, serviceId, etc.)

## Security Rules Overview

- **Admin Only**: settings, full access to all collections
- **Authenticated Users**: Read access to services, vehicles, drivers
- **Owner Access**: Customers can access their own data
- **Public Access**: Service listings for booking interface

## Collection Relationships

```
Customer (1) ←→ (Many) Reservations
Service (1) ←→ (Many) Reservations  
Vehicle (1) ←→ (Many) Reservations
Driver (1) ←→ (Many) Reservations
Reservation (1) ←→ (Many) Transactions
```