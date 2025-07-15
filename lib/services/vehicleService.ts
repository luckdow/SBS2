import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  getDoc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Vehicle } from '../types';
import toast from 'react-hot-toast';

// Check if Firebase is available and properly configured
const isFirebaseAvailable = () => {
  try {
    return isFirebaseConfigured();
  } catch (error) {
    console.warn('Firebase not available');
    return false;
  }
};

// Cache system for offline support
class VehicleCacheManager {
  private static cache = new Map();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static get(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  static clear() {
    this.cache.clear();
  }
}

// Enhanced Vehicle Service with improved reliability and error handling
export class VehicleService {
  private collectionName = 'vehicles';

  async create(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!isFirebaseAvailable()) {
      const errorMsg = 'Firebase yapılandırılmamış. Lütfen Firebase ayarlarını kontrol edin.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Clear cache to force refresh
      VehicleCacheManager.clear();
      console.log(`✅ Created vehicle ${docRef.id}`);
      toast.success('Araç başarıyla eklendi');
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error creating vehicle:`, error);
      const errorMsg = 'Araç oluşturulamadı. Lütfen tekrar deneyin.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async getAll(): Promise<Vehicle[]> {
    const cacheKey = 'vehicles-all';
    
    // Try cache first for offline support
    const cached = VehicleCacheManager.get(cacheKey);
    if (cached) {
      console.log(`📦 Using cached vehicle data`);
      return cached;
    }

    if (!isFirebaseAvailable()) {
      console.warn('Firebase not available, using mock vehicle data');
      toast('Bağlantı sorunu - test verileri kullanılıyor', {
        icon: '⚠️',
        duration: 4000
      });
      return this.getMockVehicles();
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vehicle));
      
      // Cache the result
      VehicleCacheManager.set(cacheKey, data);
      console.log(`✅ Loaded ${data.length} vehicles from Firebase`);
      
      // If no vehicles found, provide mock data as fallback
      if (data.length === 0) {
        console.log('No vehicles found in Firebase, using mock data');
        toast('Henüz araç eklenmemiş - örnek araçlar gösteriliyor', {
          icon: 'ℹ️',
          duration: 4000
        });
        const mockData = this.getMockVehicles();
        VehicleCacheManager.set(cacheKey, mockData);
        return mockData;
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Error getting vehicles:`, error);
      
      // Try to return cached data if available
      const fallbackCached = VehicleCacheManager.get(cacheKey);
      if (fallbackCached) {
        console.log(`📦 Using stale cached vehicle data due to error`);
        toast('Bağlantı sorunu - kayıtlı veriler kullanılıyor', {
          icon: '⚠️',
          duration: 4000
        });
        return fallbackCached;
      }
      
      // Final fallback to mock data
      console.log('Using mock vehicle data as final fallback');
      toast.error('Araç verileri yüklenemedi - örnek veriler gösteriliyor');
      return this.getMockVehicles();
    }
  }

  async getById(id: string): Promise<Vehicle | null> {
    if (!isFirebaseAvailable()) {
      toast.error('Firebase yapılandırılmamış');
      throw new Error('Firebase is not configured');
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Vehicle;
      }
      return null;
    } catch (error) {
      console.error(`Error getting vehicle by id:`, error);
      toast.error('Araç bilgileri alınamadı');
      throw new Error('Araç bilgileri alınamadı. Lütfen tekrar deneyin.');
    }
  }

  async update(id: string, data: Partial<Vehicle>): Promise<void> {
    if (!isFirebaseAvailable()) {
      toast.error('Firebase yapılandırılmamış');
      throw new Error('Firebase is not configured');
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      
      // Clear cache to force refresh
      VehicleCacheManager.clear();
      console.log(`✅ Updated vehicle ${id}`);
      toast.success('Araç güncellendi');
    } catch (error) {
      console.error(`❌ Error updating vehicle:`, error);
      toast.error('Araç güncellenemedi');
      throw new Error('Araç güncellenemedi. Lütfen tekrar deneyin.');
    }
  }

  async delete(id: string): Promise<void> {
    if (!isFirebaseAvailable()) {
      toast.error('Firebase yapılandırılmamış');
      throw new Error('Firebase is not configured');
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      // Clear cache to force refresh
      VehicleCacheManager.clear();
      console.log(`✅ Deleted vehicle ${id}`);
      toast.success('Araç silindi');
    } catch (error) {
      console.error(`❌ Error deleting vehicle:`, error);
      toast.error('Araç silinemedi');
      throw new Error('Araç silinemedi. Lütfen tekrar deneyin.');
    }
  }

  onSnapshot(callback: (items: Vehicle[]) => void) {
    if (!isFirebaseAvailable()) {
      toast.error('Gerçek zamanlı güncellemeler mevcut değil');
      throw new Error('Firebase is not configured. Real-time updates are not available.');
    }

    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vehicle));
      callback(items);
    }, (error) => {
      console.error(`❌ Real-time listener error for vehicles:`, error);
      toast.error('Gerçek zamanlı güncellemeler başarısız');
      throw new Error('Gerçek zamanlı güncellemeler başarısız. Lütfen sayfayı yenileyin.');
    });
  }

  // Get active vehicles only
  async getActiveVehicles(): Promise<Vehicle[]> {
    try {
      const allVehicles = await this.getAll();
      return allVehicles.filter(vehicle => vehicle.isActive !== false);
    } catch (error) {
      console.error('Error getting active vehicles:', error);
      toast.error('Aktif araçlar yüklenemedi');
      return this.getMockVehicles();
    }
  }

  // Get vehicles filtered by capacity
  async getVehiclesByCapacity(minCapacity: number, minBaggage?: number): Promise<Vehicle[]> {
    try {
      const vehicles = await this.getActiveVehicles();
      return vehicles.filter(vehicle => {
        const hasCapacity = vehicle.capacity >= minCapacity;
        const hasBaggage = minBaggage ? vehicle.baggage >= minBaggage : true;
        return hasCapacity && hasBaggage;
      });
    } catch (error) {
      console.error('Error filtering vehicles by capacity:', error);
      toast.error('Araç filtreleme başarısız');
      return [];
    }
  }

  // Mock vehicles data as reliable fallback
  private getMockVehicles(): Vehicle[] {
    return [
      {
        id: 'mock-1',
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
        id: 'mock-2',
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
        id: 'mock-3',
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
      }
    ];
  }

  // Clear all cached data
  clearCache(): void {
    VehicleCacheManager.clear();
    console.log('🗑️ Vehicle cache cleared');
  }
}

// Export singleton instance
export const vehicleService = new VehicleService();
export default vehicleService;