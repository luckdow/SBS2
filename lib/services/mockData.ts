// Mock data for development when Firebase is not available
export const mockDrivers = [
  {
    id: '1',
    name: 'Mehmet Şoför',
    email: 'mehmet@sbstravel.com',
    phone: '+90 532 111 2233',
    licenseNumber: 'B123456789',
    vehicleType: 'SUV',
    vehiclePlate: '34 ABC 123',
    isActive: true,
    rating: 4.9,
    totalTrips: 245,
    monthlyEarnings: 8450,
    role: 'driver' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Ali Şoför',
    email: 'ali@sbstravel.com',
    phone: '+90 532 444 5566',
    licenseNumber: 'B987654321',
    vehicleType: 'Sedan',
    vehiclePlate: '34 DEF 456',
    isActive: true,
    rating: 4.7,
    totalTrips: 189,
    monthlyEarnings: 6890,
    role: 'driver' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Hasan Şoför',
    email: 'hasan@sbstravel.com',
    phone: '+90 532 777 8899',
    licenseNumber: 'B456789123',
    vehicleType: 'Van',
    vehiclePlate: '34 GHI 789',
    isActive: true,
    rating: 4.8,
    totalTrips: 167,
    monthlyEarnings: 7320,
    role: 'driver' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockVehicles = [
  {
    id: '1',
    name: 'Ekonomi Sedan',
    type: 'sedan' as const,
    capacity: 4,
    baggage: 2,
    pricePerKm: 8,
    image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Klima', 'Temiz Araç', 'Sigara İçilmez', 'Bluetooth'],
    rating: 4.2,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Konfor SUV',
    type: 'suv' as const,
    capacity: 6,
    baggage: 4,
    pricePerKm: 12,
    image: 'https://images.pexels.com/photos/463174/pexels-photo-463174.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Klima', 'Geniş İç Mekan', 'USB Şarj', 'Wi-Fi', 'Deri Koltuk'],
    rating: 4.7,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Premium Van',
    type: 'van' as const,
    capacity: 8,
    baggage: 6,
    pricePerKm: 15,
    image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Klima', 'Deri Koltuk', 'Mini Bar', 'Wi-Fi', 'TV', 'Masaj'],
    rating: 4.9,
    isActive: true,
    createdAt: new Date()
  }
];

export const mockServices = [
  {
    id: '1',
    name: 'Bebek Koltuğu',
    price: 50,
    description: '0-4 yaş arası çocuklar için',
    category: 'child_seat' as const,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Çocuk Koltuğu',
    price: 40,
    description: '4-12 yaş arası çocuklar için',
    category: 'child_seat' as const,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Ek Bagaj',
    price: 30,
    description: 'Standart üzeri bagaj için',
    category: 'extra_baggage' as const,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'Havalimanı Karşılama',
    price: 75,
    description: 'Tabela ile karşılama hizmeti',
    category: 'meet_greet' as const,
    isActive: true,
    createdAt: new Date()
  }
];

export const mockReservations = [
  {
    id: 'RES001',
    customerId: 'customer1',
    customer: {
      id: 'customer1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@email.com',
      phone: '+90 532 123 4567',
      role: 'customer' as const,
      totalReservations: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    direction: 'airport-to-hotel' as const,
    from: 'Antalya Havalimanı',
    to: 'Lara Beach Hotel',
    date: '2024-01-15',
    time: '14:30',
    passengers: 2,
    baggage: 3,
    flightNumber: 'TK1234',
    vehicleId: '2',
    vehicle: mockVehicles[1],
    selectedServices: [mockServices[0]],
    distance: 25,
    basePrice: 300,
    servicesPrice: 50,
    totalPrice: 350,
    status: 'pending' as const,
    qrCode: 'QR123456',
    specialRequests: 'Bebek koltuğu gerekli',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];