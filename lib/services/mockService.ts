// Mock service for development when Firebase is not configured
import { 
  Vehicle, 
  Driver, 
  Service, 
  Customer, 
  Reservation, 
  Transaction
} from '../types';

// Generate sample data for development
export const mockData = {
  vehicles: [
    {
      id: 'vehicle-1',
      plateNumber: '34 ABC 123',
      type: 'minibus' as const,
      brand: 'Mercedes',
      model: 'Sprinter',
      year: 2022,
      capacity: 16,
      features: ['WiFi', 'AC', 'USB Charging'],
      status: 'active' as const,
      location: {
        lat: 41.0082,
        lng: 28.9784,
        address: 'İstanbul Havalimanı'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'vehicle-2',
      plateNumber: '06 DEF 456',
      type: 'bus' as const,
      brand: 'Iveco',
      model: 'Daily',
      year: 2021,
      capacity: 24,
      features: ['WiFi', 'AC', 'TV'],
      status: 'active' as const,
      location: {
        lat: 39.9334,
        lng: 32.8597,
        address: 'Ankara'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  drivers: [
    {
      id: 'driver-1',
      firstName: 'Mehmet',
      lastName: 'Kaya',
      email: 'mehmet.kaya@sbs.com',
      phone: '+90 532 123 4567',
      licenseNumber: 'E123456789',
      licenseExpiry: new Date('2025-12-31'),
      experience: 8,
      languages: ['Türkçe', 'English'],
      status: 'active' as const,
      currentVehicle: 'vehicle-1',
      location: {
        lat: 41.0082,
        lng: 28.9784,
        lastUpdated: new Date()
      },
      rating: 4.8,
      totalTrips: 245,
      documents: {
        license: '/docs/license-1.pdf',
        background: '/docs/background-1.pdf',
        medical: '/docs/medical-1.pdf'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'driver-2',
      firstName: 'Ali',
      lastName: 'Demir',
      email: 'ali.demir@sbs.com',
      phone: '+90 533 987 6543',
      licenseNumber: 'E987654321',
      licenseExpiry: new Date('2024-06-30'),
      experience: 12,
      languages: ['Türkçe', 'Deutsch'],
      status: 'active' as const,
      currentVehicle: 'vehicle-2',
      rating: 4.9,
      totalTrips: 387,
      documents: {
        license: '/docs/license-2.pdf',
        background: '/docs/background-2.pdf',
        medical: '/docs/medical-2.pdf'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  services: [
    {
      id: 'service-1',
      name: 'İstanbul Havalimanı Transfer',
      description: 'İstanbul Havalimanı\'ndan şehir merkezine güvenli transfer',
      type: 'airport' as const,
      route: {
        origin: {
          name: 'İstanbul Havalimanı',
          lat: 41.2753,
          lng: 28.7519,
          address: 'İstanbul Havalimanı, Tayakadın, 34283 Arnavutköy/İstanbul'
        },
        destination: {
          name: 'Taksim Meydanı',
          lat: 41.0370,
          lng: 28.9857,
          address: 'Taksim Meydanı, Beyoğlu/İstanbul'
        },
        distance: 42,
        duration: 45
      },
      schedule: {
        frequency: 'on-demand' as const,
        departureTimes: ['24/7'],
        operatingDays: [0, 1, 2, 3, 4, 5, 6]
      },
      pricing: {
        basePrice: 150,
        currency: 'TRY',
        pricePerKm: 3.5
      },
      vehicle: {
        type: 'minibus',
        minCapacity: 8,
        features: ['WiFi', 'AC']
      },
      status: 'active' as const,
      bookingSettings: {
        advanceBooking: 30,
        cancellationPolicy: '24 saat öncesine kadar iptal edilebilir',
        requireApproval: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  customers: [
    {
      id: 'customer-1',
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      email: 'ayse.yilmaz@email.com',
      phone: '+90 555 123 4567',
      preferences: {
        language: 'tr',
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        accessibility: {
          wheelchair: false,
          assistance: false,
          specialNeeds: ''
        }
      },
      loyaltyPoints: 150,
      totalTrips: 5,
      role: 'customer' as const,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  reservations: [],
  transactions: [],

  settings: {
    app: {
      name: 'SBS Transfer',
      version: '1.0.0',
      supportEmail: 'destek@sbstransfer.com',
      companyName: 'SBS Transfer Hizmetleri',
      maintenance: false,
      enableRegistration: true,
      enableBooking: true
    },
    booking: {
      advanceBookingDays: 30,
      cancellationHours: 24,
      maxPassengers: 8,
      requireApproval: false
    },
    payment: {
      enablePayTR: true,
      enableCash: true,
      enableCredit: true,
      currency: 'TRY'
    },
    notification: {
      enableEmail: true,
      enableSMS: false,
      enablePush: true
    },
    maps: {
      defaultLat: 41.0082,
      defaultLng: 28.9784,
      defaultZoom: 10,
      enableRouteOptimization: true
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0'
  }
};

// Mock service class to simulate Firebase operations
export class MockFirestoreService {
  private data = { ...mockData };

  // Get collection data
  async getCollection(collectionName: string): Promise<any[]> {
    return this.data[collectionName as keyof typeof this.data] as any[] || [];
  }

  // Get document by ID
  async getDocument(collectionName: string, id: string): Promise<any | null> {
    const collection = this.data[collectionName as keyof typeof this.data] as any[];
    return collection?.find(item => item.id === id) || null;
  }

  // Add document
  async addDocument(collectionName: string, data: any): Promise<string> {
    const collection = this.data[collectionName as keyof typeof this.data] as any[];
    const id = `${collectionName}-${Date.now()}`;
    const newDoc = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    collection.push(newDoc);
    return id;
  }

  // Update document
  async updateDocument(collectionName: string, id: string, data: any): Promise<void> {
    const collection = this.data[collectionName as keyof typeof this.data] as any[];
    const index = collection.findIndex(item => item.id === id);
    if (index >= 0) {
      collection[index] = { ...collection[index], ...data, updatedAt: new Date() };
    }
  }

  // Delete document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    const collection = this.data[collectionName as keyof typeof this.data] as any[];
    const index = collection.findIndex(item => item.id === id);
    if (index >= 0) {
      collection.splice(index, 1);
    }
  }

  // Initialize collections with seed data
  async initializeCollections(): Promise<void> {
    console.log('Mock collections initialized with sample data');
  }
}

export const mockService = new MockFirestoreService();