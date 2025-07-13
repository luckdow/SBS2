// Seed data for Firebase
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Seed drivers data
export const seedDrivers = async () => {
  try {
    // Check if drivers already exist
    const driversQuery = query(collection(db, 'drivers'));
    const existingDrivers = await getDocs(driversQuery);
    
    if (existingDrivers.empty) {
      const drivers = [
        {
          name: 'Mehmet Yılmaz',
          phone: '+90 532 111 2233',
          email: 'mehmet@sbstravel.com',
          licenseNumber: 'B123456789',
          vehicleType: 'SUV',
          vehiclePlate: '34 ABC 123',
          isActive: true,
          rating: 4.9,
          totalTrips: 245,
          monthlyEarnings: 8450,
          role: 'driver',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Ali Demir',
          phone: '+90 532 444 5566',
          email: 'ali@sbstravel.com',
          licenseNumber: 'B987654321',
          vehicleType: 'Sedan',
          vehiclePlate: '34 DEF 456',
          isActive: true,
          rating: 4.7,
          totalTrips: 189,
          monthlyEarnings: 6890,
          role: 'driver',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Hasan Kaya',
          phone: '+90 532 777 8899',
          email: 'hasan@sbstravel.com',
          licenseNumber: 'B456789123',
          vehicleType: 'Van',
          vehiclePlate: '34 GHI 789',
          isActive: true,
          rating: 4.8,
          totalTrips: 167,
          monthlyEarnings: 7320,
          role: 'driver',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Mustafa Özkan',
          phone: '+90 532 999 1122',
          email: 'mustafa@sbstravel.com',
          licenseNumber: 'B789123456',
          vehicleType: 'Luxury',
          vehiclePlate: '34 JKL 012',
          isActive: true,
          rating: 4.9,
          totalTrips: 298,
          monthlyEarnings: 9850,
          role: 'driver',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Osman Şahin',
          phone: '+90 532 333 4455',
          email: 'osman@sbstravel.com',
          licenseNumber: 'B321654987',
          vehicleType: 'SUV',
          vehiclePlate: '34 MNO 345',
          isActive: false,
          rating: 4.6,
          totalTrips: 156,
          monthlyEarnings: 5640,
          role: 'driver',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const driver of drivers) {
        await addDoc(collection(db, 'drivers'), driver);
      }
      
      console.log('✅ Drivers seeded successfully');
    } else {
      console.log('ℹ️ Drivers already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding drivers:', error);
  }
};

// Seed vehicles data
export const seedVehicles = async () => {
  try {
    const vehiclesQuery = query(collection(db, 'vehicles'));
    const existingVehicles = await getDocs(vehiclesQuery);
    
    if (existingVehicles.empty) {
      const vehicles = [
        {
          name: 'Ekonomi Sedan',
          type: 'sedan',
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
          name: 'Konfor SUV',
          type: 'suv',
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
          name: 'Premium Van',
          type: 'van',
          capacity: 8,
          baggage: 6,
          pricePerKm: 15,
          image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
          features: ['Klima', 'Deri Koltuk', 'Mini Bar', 'Wi-Fi', 'TV', 'Masaj'],
          rating: 4.9,
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Lüks Mercedes',
          type: 'luxury',
          capacity: 4,
          baggage: 3,
          pricePerKm: 20,
          image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400',
          features: ['Klima', 'Deri Koltuk', 'Masaj', 'Wi-Fi', 'Mini Bar', 'Şampanya Servisi'],
          rating: 5.0,
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Aile Minibüsü',
          type: 'van',
          capacity: 12,
          baggage: 8,
          pricePerKm: 18,
          image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
          features: ['Klima', 'Geniş Alan', 'USB Şarj', 'Wi-Fi', 'TV'],
          rating: 4.5,
          isActive: true,
          createdAt: new Date()
        }
      ];

      for (const vehicle of vehicles) {
        await addDoc(collection(db, 'vehicles'), vehicle);
      }
      
      console.log('✅ Vehicles seeded successfully');
    } else {
      console.log('ℹ️ Vehicles already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding vehicles:', error);
  }
};

// Seed services data
export const seedServices = async () => {
  try {
    const servicesQuery = query(collection(db, 'services'));
    const existingServices = await getDocs(servicesQuery);
    
    if (existingServices.empty) {
      const services = [
        {
          name: 'Bebek Koltuğu',
          price: 50,
          description: '0-4 yaş arası çocuklar için güvenli bebek koltuğu',
          category: 'child_seat',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Çocuk Koltuğu',
          price: 40,
          description: '4-12 yaş arası çocuklar için güvenli çocuk koltuğu',
          category: 'child_seat',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Ek Bagaj',
          price: 30,
          description: 'Standart bagaj kapasitesi üzeri için ek bagaj hizmeti',
          category: 'extra_baggage',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Havalimanı Karşılama',
          price: 75,
          description: 'İsim tabelası ile havalimanında karşılama hizmeti',
          category: 'meet_greet',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'VIP Karşılama',
          price: 150,
          description: 'VIP lounge erişimi ile özel karşılama hizmeti',
          category: 'meet_greet',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Şampanya Servisi',
          price: 200,
          description: 'Yolculuk sırasında premium şampanya servisi',
          category: 'other',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Wi-Fi Hotspot',
          price: 25,
          description: 'Yolculuk boyunca sınırsız internet erişimi',
          category: 'other',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Çiçek Buketi',
          price: 100,
          description: 'Özel günler için çiçek buketi servisi',
          category: 'other',
          isActive: true,
          createdAt: new Date()
        }
      ];

      for (const service of services) {
        await addDoc(collection(db, 'services'), service);
      }
      
      console.log('✅ Services seeded successfully');
    } else {
      console.log('ℹ️ Services already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding services:', error);
  }
};

// Seed sample reservations
export const seedReservations = async () => {
  try {
    const reservationsQuery = query(collection(db, 'reservations'));
    const existingReservations = await getDocs(reservationsQuery);
    
    if (existingReservations.empty) {
      const reservations = [
        {
          customerId: 'customer1',
          direction: 'airport-to-hotel',
          from: 'Antalya Havalimanı Terminal 1',
          to: 'Lara Beach Resort & Spa',
          date: '2024-01-20',
          time: '14:30',
          passengers: 2,
          baggage: 3,
          flightNumber: 'TK1234',
          vehicleId: 'vehicle2',
          selectedServices: ['service1', 'service4'],
          distance: 25,
          basePrice: 300,
          servicesPrice: 125,
          totalPrice: 425,
          status: 'pending',
          qrCode: 'QR123456789',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          email: 'ahmet@email.com',
          phone: '+90 532 123 4567',
          specialRequests: 'Bebek koltuğu gerekli, havalimanında karşılama',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          customerId: 'customer2',
          direction: 'hotel-to-airport',
          from: 'Kemer Marina Hotel',
          to: 'Antalya Havalimanı Terminal 2',
          date: '2024-01-21',
          time: '16:00',
          passengers: 4,
          baggage: 2,
          flightNumber: 'PC2156',
          vehicleId: 'vehicle3',
          selectedServices: ['service3'],
          distance: 45,
          basePrice: 675,
          servicesPrice: 30,
          totalPrice: 705,
          status: 'assigned',
          driverId: 'driver1',
          qrCode: 'QR987654321',
          firstName: 'Elif',
          lastName: 'Demir',
          email: 'elif@email.com',
          phone: '+90 532 987 6543',
          specialRequests: 'Erken check-out, 15:30 da hazır olacağız',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          customerId: 'customer3',
          direction: 'airport-to-hotel',
          from: 'Antalya Havalimanı Terminal 2',
          to: 'Side Antik Tiyatro Yakını Otel',
          date: '2024-01-22',
          time: '18:15',
          passengers: 1,
          baggage: 1,
          flightNumber: 'SU4567',
          vehicleId: 'vehicle1',
          selectedServices: [],
          distance: 65,
          basePrice: 520,
          servicesPrice: 0,
          totalPrice: 520,
          status: 'started',
          driverId: 'driver2',
          qrCode: 'QR456789123',
          firstName: 'Can',
          lastName: 'Özkan',
          email: 'can@email.com',
          phone: '+90 532 555 7788',
          specialRequests: '',
          startedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          customerId: 'customer4',
          direction: 'hotel-to-airport',
          from: 'Belek Golf Resort',
          to: 'Antalya Havalimanı Terminal 1',
          date: '2024-01-19',
          time: '10:00',
          passengers: 6,
          baggage: 4,
          flightNumber: 'TK5678',
          vehicleId: 'vehicle3',
          selectedServices: ['service2', 'service4', 'service7'],
          distance: 35,
          basePrice: 525,
          servicesPrice: 140,
          totalPrice: 665,
          status: 'completed',
          driverId: 'driver3',
          qrCode: 'QR789123456',
          firstName: 'Zeynep',
          lastName: 'Kaya',
          email: 'zeynep@email.com',
          phone: '+90 532 111 9988',
          specialRequests: 'Çocuk koltuğu, Wi-Fi gerekli',
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      ];

      for (const reservation of reservations) {
        await addDoc(collection(db, 'reservations'), reservation);
      }
      
      console.log('✅ Reservations seeded successfully');
    } else {
      console.log('ℹ️ Reservations already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding reservations:', error);
  }
};

// Seed sample customers
export const seedCustomers = async () => {
  try {
    const customersQuery = query(collection(db, 'customers'));
    const existingCustomers = await getDocs(customersQuery);
    
    if (existingCustomers.empty) {
      const customers = [
        {
          name: 'Ahmet Yılmaz',
          email: 'ahmet@email.com',
          phone: '+90 532 123 4567',
          role: 'customer',
          totalReservations: 5,
          membershipLevel: 'Gold',
          loyaltyPoints: 1250,
          totalSpent: 2150,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Elif Demir',
          email: 'elif@email.com',
          phone: '+90 532 987 6543',
          role: 'customer',
          totalReservations: 3,
          membershipLevel: 'Silver',
          loyaltyPoints: 750,
          totalSpent: 1420,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Can Özkan',
          email: 'can@email.com',
          phone: '+90 532 555 7788',
          role: 'customer',
          totalReservations: 1,
          membershipLevel: 'Bronze',
          loyaltyPoints: 250,
          totalSpent: 520,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Zeynep Kaya',
          email: 'zeynep@email.com',
          phone: '+90 532 111 9988',
          role: 'customer',
          totalReservations: 8,
          membershipLevel: 'Platinum',
          loyaltyPoints: 2100,
          totalSpent: 4250,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const customer of customers) {
        await addDoc(collection(db, 'customers'), customer);
      }
      
      console.log('✅ Customers seeded successfully');
    } else {
      console.log('ℹ️ Customers already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
  }
};

// Seed all data
export const seedAllData = async () => {
  console.log('🌱 Starting to seed Firebase with sample data...');
  
  try {
    await seedDrivers();
    await seedVehicles();
    await seedServices();
    await seedCustomers();
    await seedReservations();
    
    console.log('🎉 All data seeded successfully!');
    console.log('📊 Firebase now contains:');
    console.log('   - 5 Drivers (4 active, 1 inactive)');
    console.log('   - 5 Vehicles (different types)');
    console.log('   - 8 Services (various categories)');
    console.log('   - 4 Customers (different membership levels)');
    console.log('   - 4 Reservations (different statuses)');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Individual seed functions for testing
export const seedSingleCollection = async (collectionName: string) => {
  switch (collectionName) {
    case 'drivers':
      await seedDrivers();
      break;
    case 'vehicles':
      await seedVehicles();
      break;
    case 'services':
      await seedServices();
      break;
    case 'customers':
      await seedCustomers();
      break;
    case 'reservations':
      await seedReservations();
      break;
    default:
      console.log('❌ Unknown collection name');
  }
};