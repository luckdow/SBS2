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
          name: 'Ahmet Yılmaz',
          phone: '+90 532 111 2233',
          email: 'ahmet@sbstravel.com',
          licenseNumber: 'B123456789',
          vehicleType: 'Sedan',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Mehmet Demir',
          phone: '+90 532 444 5566',
          email: 'mehmet@sbstravel.com',
          licenseNumber: 'B987654321',
          vehicleType: 'SUV',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Ali Kaya',
          phone: '+90 532 777 8899',
          email: 'ali@sbstravel.com',
          licenseNumber: 'B456789123',
          vehicleType: 'Van',
          isActive: true,
          createdAt: new Date()
        }
      ];

      for (const driver of drivers) {
        await addDoc(collection(db, 'drivers'), driver);
      }
      
      console.log('Drivers seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding drivers:', error);
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
          capacity: 4,
          baggage: 2,
          pricePerKm: 8,
          image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=300',
          features: ['Klima', 'Temiz Araç', 'Sigara İçilmez'],
          rating: 4.2,
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Konfor SUV',
          capacity: 6,
          baggage: 4,
          pricePerKm: 12,
          image: 'https://images.pexels.com/photos/463174/pexels-photo-463174.jpeg?auto=compress&cs=tinysrgb&w=300',
          features: ['Klima', 'Geniş İç Mekan', 'USB Şarj', 'Wi-Fi'],
          rating: 4.7,
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Premium Van',
          capacity: 8,
          baggage: 6,
          pricePerKm: 15,
          image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=300',
          features: ['Klima', 'Deri Koltuk', 'Mini Bar', 'Wi-Fi', 'TV'],
          rating: 4.9,
          isActive: true,
          createdAt: new Date()
        }
      ];

      for (const vehicle of vehicles) {
        await addDoc(collection(db, 'vehicles'), vehicle);
      }
      
      console.log('Vehicles seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding vehicles:', error);
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
          description: '0-4 yaş arası çocuklar için',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Çocuk Koltuğu',
          price: 40,
          description: '4-12 yaş arası çocuklar için',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Ek Bagaj',
          price: 30,
          description: 'Standart üzeri bagaj için',
          isActive: true,
          createdAt: new Date()
        },
        {
          name: 'Havalimanı Karşılama',
          price: 75,
          description: 'Tabela ile karşılama hizmeti',
          isActive: true,
          createdAt: new Date()
        }
      ];

      for (const service of services) {
        await addDoc(collection(db, 'services'), service);
      }
      
      console.log('Services seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding services:', error);
  }
};

export const seedAllData = async () => {
  await seedDrivers();
  await seedVehicles();
  await seedServices();
};