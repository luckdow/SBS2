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
import { Service } from '../types';
import toast from 'react-hot-toast';
import { Gift, Users, Luggage, Plane } from 'lucide-react';

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
class ServiceCacheManager {
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

// Enhanced Service Service with improved reliability and error handling
export class ServiceService {
  private collectionName = 'services';

  async create(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
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
      ServiceCacheManager.clear();
      console.log(`✅ Created service ${docRef.id}`);
      toast.success('Hizmet başarıyla eklendi');
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error creating service:`, error);
      const errorMsg = 'Hizmet oluşturulamadı. Lütfen tekrar deneyin.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async getAll(): Promise<Service[]> {
    const cacheKey = 'services-all';
    
    // Try cache first for offline support
    const cached = ServiceCacheManager.get(cacheKey);
    if (cached) {
      console.log(`📦 Using cached service data`);
      return cached;
    }

    if (!isFirebaseAvailable()) {
      console.warn('Firebase not available, using mock service data');
      toast('Bağlantı sorunu - test verileri kullanılıyor', {
        icon: '⚠️',
        duration: 4000
      });
      return this.getMockServices();
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
      
      // Cache the result
      ServiceCacheManager.set(cacheKey, data);
      console.log(`✅ Loaded ${data.length} services from Firebase`);
      
      // If no services found, provide mock data as fallback
      if (data.length === 0) {
        console.log('No services found in Firebase, using mock data');
        toast('Henüz hizmet eklenmemiş - örnek hizmetler gösteriliyor', {
          icon: 'ℹ️',
          duration: 4000
        });
        const mockData = this.getMockServices();
        ServiceCacheManager.set(cacheKey, mockData);
        return mockData;
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Error getting services:`, error);
      
      // Try to return cached data if available
      const fallbackCached = ServiceCacheManager.get(cacheKey);
      if (fallbackCached) {
        console.log(`📦 Using stale cached service data due to error`);
        toast('Bağlantı sorunu - kayıtlı veriler kullanılıyor', {
          icon: '⚠️',
          duration: 4000
        });
        return fallbackCached;
      }
      
      // Final fallback to mock data
      console.log('Using mock service data as final fallback');
      toast.error('Hizmet verileri yüklenemedi - örnek veriler gösteriliyor');
      return this.getMockServices();
    }
  }

  async getById(id: string): Promise<Service | null> {
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
        } as Service;
      }
      return null;
    } catch (error) {
      console.error(`Error getting service by id:`, error);
      toast.error('Hizmet bilgileri alınamadı');
      throw new Error('Hizmet bilgileri alınamadı. Lütfen tekrar deneyin.');
    }
  }

  async update(id: string, data: Partial<Service>): Promise<void> {
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
      ServiceCacheManager.clear();
      console.log(`✅ Updated service ${id}`);
      toast.success('Hizmet güncellendi');
    } catch (error) {
      console.error(`❌ Error updating service:`, error);
      toast.error('Hizmet güncellenemedi');
      throw new Error('Hizmet güncellenemedi. Lütfen tekrar deneyin.');
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
      ServiceCacheManager.clear();
      console.log(`✅ Deleted service ${id}`);
      toast.success('Hizmet silindi');
    } catch (error) {
      console.error(`❌ Error deleting service:`, error);
      toast.error('Hizmet silinemedi');
      throw new Error('Hizmet silinemedi. Lütfen tekrar deneyin.');
    }
  }

  onSnapshot(callback: (items: Service[]) => void) {
    if (!isFirebaseAvailable()) {
      toast.error('Gerçek zamanlı güncellemeler mevcut değil');
      throw new Error('Firebase is not configured. Real-time updates are not available.');
    }

    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
      callback(items);
    }, (error) => {
      console.error(`❌ Real-time listener error for services:`, error);
      toast.error('Gerçek zamanlı güncellemeler başarısız');
      throw new Error('Gerçek zamanlı güncellemeler başarısız. Lütfen sayfayı yenileyin.');
    });
  }

  // Get active services only
  async getActiveServices(): Promise<Service[]> {
    try {
      const allServices = await this.getAll();
      return allServices.filter(service => service.isActive !== false);
    } catch (error) {
      console.error('Error getting active services:', error);
      toast.error('Aktif hizmetler yüklenemedi');
      return this.getMockServices();
    }
  }

  // Get services by category
  async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      const services = await this.getActiveServices();
      return services.filter(service => service.category === category);
    } catch (error) {
      console.error('Error filtering services by category:', error);
      toast.error('Hizmet filtreleme başarısız');
      return [];
    }
  }

  // Get service icon based on category
  getServiceIcon(category: string) {
    switch (category) {
      case 'child_seat': return Gift;
      case 'extra_baggage': return Luggage;
      case 'meet_greet': return Plane;
      default: return Users;
    }
  }

  // Get service gradient based on category
  getServiceGradient(category: string): string {
    switch (category) {
      case 'child_seat': return 'from-pink-400 to-pink-600';
      case 'extra_baggage': return 'from-blue-400 to-blue-600';
      case 'meet_greet': return 'from-purple-400 to-purple-600';
      default: return 'from-green-400 to-green-600';
    }
  }

  // Process services with UI enhancements
  async getProcessedServices(): Promise<(Service & { icon: any; gradient: string })[]> {
    try {
      const services = await this.getActiveServices();
      return services.map(service => ({
        ...service,
        icon: this.getServiceIcon(service.category || 'extra'),
        gradient: this.getServiceGradient(service.category || 'extra')
      }));
    } catch (error) {
      console.error('Error processing services:', error);
      toast.error('Hizmet işleme başarısız');
      return this.getMockServices().map(service => ({
        ...service,
        icon: this.getServiceIcon(service.category || 'extra'),
        gradient: this.getServiceGradient(service.category || 'extra')
      }));
    }
  }

  // Mock services data as reliable fallback
  private getMockServices(): Service[] {
    return [
      { 
        id: 'mock-1', 
        name: 'Bebek Koltuğu', 
        price: 50, 
        description: '0-4 yaş arası çocuklar için',
        category: 'child_seat',
        isActive: true
      },
      { 
        id: 'mock-2', 
        name: 'Çocuk Koltuğu', 
        price: 40, 
        description: '4-12 yaş arası çocuklar için',
        category: 'child_seat',
        isActive: true
      },
      { 
        id: 'mock-3', 
        name: 'Ek Bagaj', 
        price: 30, 
        description: 'Standart üzeri bagaj için',
        category: 'extra_baggage',
        isActive: true
      },
      { 
        id: 'mock-4', 
        name: 'Havalimanı Karşılama', 
        price: 75, 
        description: 'Tabela ile karşılama hizmeti',
        category: 'meet_greet',
        isActive: true
      }
    ];
  }

  // Clear all cached data
  clearCache(): void {
    ServiceCacheManager.clear();
    console.log('🗑️ Service cache cleared');
  }
}

// Export singleton instance
export const serviceService = new ServiceService();
export default serviceService;