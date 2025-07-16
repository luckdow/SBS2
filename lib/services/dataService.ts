// Unified data service that handles both Firebase and mock data
import { db, isFirebaseConfigured, isMockMode } from '../firebase';
import { mockService, mockData } from './mockService';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

export class DataService {
  private useMock: boolean;

  constructor() {
    this.useMock = isMockMode() || !isFirebaseConfigured();
    if (this.useMock) {
      console.log('DataService initialized in mock mode');
    } else {
      console.log('DataService initialized with Firebase');
    }
  }

  // Get all documents from a collection
  async getCollection(collectionName: string): Promise<any[]> {
    if (this.useMock) {
      return await mockService.getCollection(collectionName);
    }

    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          ...data
        };
      });
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      return [];
    }
  }

  // Get a specific document by ID
  async getDocument(collectionName: string, id: string): Promise<any | null> {
    if (this.useMock) {
      return await mockService.getDocument(collectionName, id);
    }

    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as Record<string, any>;
        return {
          id: docSnap.id,
          ...data
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting document ${collectionName}/${id}:`, error);
      return null;
    }
  }

  // Add a new document
  async addDocument(collectionName: string, data: any): Promise<string> {
    if (this.useMock) {
      return await mockService.addDocument(collectionName, data);
    }

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  // Update an existing document
  async updateDocument(collectionName: string, id: string, data: any): Promise<void> {
    if (this.useMock) {
      return await mockService.updateDocument(collectionName, id, data);
    }

    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error updating document ${collectionName}/${id}:`, error);
      throw error;
    }
  }

  // Delete a document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    if (this.useMock) {
      return await mockService.deleteDocument(collectionName, id);
    }

    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${collectionName}/${id}:`, error);
      throw error;
    }
  }

  // Query documents with filters
  async queryDocuments(
    collectionName: string, 
    filters: any[] = [], 
    orderField?: string, 
    limitCount?: number
  ): Promise<any[]> {
    if (this.useMock) {
      // Simple filtering for mock data
      let data = await mockService.getCollection(collectionName);
      
      // Apply basic filtering (extend as needed)
      filters.forEach(filter => {
        const [field, operator, value] = filter;
        if (operator === '==') {
          data = data.filter(item => item[field] === value);
        }
      });

      // Apply ordering
      if (orderField) {
        data.sort((a, b) => {
          const aVal = a[orderField];
          const bVal = b[orderField];
          if (aVal < bVal) return -1;
          if (aVal > bVal) return 1;
          return 0;
        });
      }

      // Apply limit
      if (limitCount) {
        data = data.slice(0, limitCount);
      }

      return data;
    }

    try {
      let q: any = collection(db, collectionName);
      
      // Apply filters
      filters.forEach(filter => {
        const [field, operator, value] = filter;
        q = query(q, where(field, operator, value));
      });

      // Apply ordering
      if (orderField) {
        q = query(q, orderBy(orderField));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          ...data
        };
      });
    } catch (error) {
      console.error(`Error querying collection ${collectionName}:`, error);
      return [];
    }
  }

  // Initialize all collections with default data
  async initializeCollections(): Promise<void> {
    if (this.useMock) {
      await mockService.initializeCollections();
      return;
    }

    try {
      // Check if collections are empty and initialize if needed
      const collections = ['settings', 'vehicles', 'drivers', 'services', 'customers'];
      
      for (const collectionName of collections) {
        const docs = await this.getCollection(collectionName);
        if (docs.length === 0) {
          console.log(`Initializing collection: ${collectionName}`);
          
          // Initialize with basic data based on collection type
          switch (collectionName) {
            case 'settings':
              await this.addDocument('settings', mockData.settings);
              break;
            case 'vehicles':
              for (const vehicle of mockData.vehicles) {
                await this.addDocument('vehicles', vehicle);
              }
              break;
            case 'drivers':
              for (const driver of mockData.drivers) {
                await this.addDocument('drivers', driver);
              }
              break;
            case 'services':
              for (const service of mockData.services) {
                await this.addDocument('services', service);
              }
              break;
            case 'customers':
              for (const customer of mockData.customers) {
                await this.addDocument('customers', customer);
              }
              break;
          }
        }
      }
      
      console.log('Firebase collections initialized successfully');
    } catch (error) {
      console.error('Error initializing collections:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; mode: string; firebase: boolean }> {
    return {
      status: 'healthy',
      mode: this.useMock ? 'mock' : 'firebase',
      firebase: isFirebaseConfigured()
    };
  }
}

// Export singleton instance
export const dataService = new DataService();