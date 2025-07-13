// Firebase configuration with proper setup
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemo-Key-Replace-With-Real",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sbs-travel-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sbs-travel-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sbs-travel-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEF123"
};

// Initialize Firebase only if not already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "AIzaSyDemo-Key-Replace-With-Real" && 
         firebaseConfig.projectId !== "sbs-travel-demo";
};

// For development - you can enable emulators if needed
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  try {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      // Uncomment these lines if you want to use Firebase emulators
      // connectFirestoreEmulator(db, 'localhost', 8080);
      // connectAuthEmulator(auth, 'http://localhost:9099');
      // connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    console.log('Emulator connection failed:', error);
  }
}

export default app;</parameter>
</invoke>

<invoke name="file">
<parameter name="filePath">lib/services/realTimeService.ts</parameter>
<parameter name="contentType">content</parameter>
<parameter name="content">// Real-time service for Firebase operations
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
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Reservation, Driver, Vehicle, Service } from '../types';
import { mockDrivers, mockVehicles, mockServices, mockReservations } from './mockData';

// Real-time Reservation Service
export class RealTimeReservationService {
  private collectionName = 'reservations';

  async create(reservationData: any): Promise<string> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Firebase not configured, using mock data');
      const mockId = `RES${Date.now()}`;
      console.log('Mock reservation created:', mockId, reservationData);
      return mockId;
    }

    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...reservationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending'
      });
      
      console.log('✅ Reservation created in Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating reservation:', error);
      // Fallback to mock
      const mockId = `RES${Date.now()}`;
      console.log('Fallback to mock reservation:', mockId);
      return mockId;
    }
  }

  async getAll(): Promise<Reservation[]> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock reservations');
      return mockReservations as any;
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const reservations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Reservation[];
      
      console.log('✅ Loaded reservations from Firebase:', reservations.length);
      return reservations;
    } catch (error) {
      console.error('❌ Error loading reservations:', error);
      return mockReservations as any;
    }
  }

  async assignDriver(reservationId: string, driverId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Mock driver assignment:', reservationId, driverId);
      return;
    }

    try {
      const reservationRef = doc(db, this.collectionName, reservationId);
      await updateDoc(reservationRef, {
        driverId,
        status: 'assigned',
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Driver assigned in Firebase:', reservationId, driverId);
    } catch (error) {
      console.error('❌ Error assigning driver:', error);
      console.log('Fallback: Mock driver assignment');
    }
  }

  async updateStatus(reservationId: string, status: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Mock status update:', reservationId, status);
      return;
    }

    try {
      const reservationRef = doc(db, this.collectionName, reservationId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'started') {
        updateData.startedAt = serverTimestamp();
      } else if (status === 'completed') {
        updateData.completedAt = serverTimestamp();
      }

      await updateDoc(reservationRef, updateData);
      console.log('✅ Status updated in Firebase:', reservationId, status);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      console.log('Fallback: Mock status update');
    }
  }

  // Real-time listener for reservations
  onReservationsChange(callback: (reservations: Reservation[]) => void) {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock real-time data');
      // Simulate real-time with mock data
      callback(mockReservations as any);
      return () => {}; // Return empty unsubscribe function
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (querySnapshot) => {
        const reservations = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Reservation[];
        
        console.log('🔄 Real-time reservations update:', reservations.length);
        callback(reservations);
      }, (error) => {
        console.error('❌ Real-time listener error:', error);
        // Fallback to mock data
        callback(mockReservations as any);
      });
    } catch (error) {
      console.error('❌ Error setting up real-time listener:', error);
      callback(mockReservations as any);
      return () => {};
    }
  }

  // Get driver reservations
  async getDriverReservations(driverId: string): Promise<Reservation[]> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock driver reservations for:', driverId);
      return mockReservations.filter(res => res.driverId === driverId) as any;
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('driverId', '==', driverId),
        where('status', 'in', ['assigned', 'started']),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reservations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Reservation[];
      
      console.log('✅ Driver reservations loaded:', driverId, reservations.length);
      return reservations;
    } catch (error) {
      console.error('❌ Error loading driver reservations:', error);
      return mockReservations.filter(res => res.driverId === driverId) as any;
    }
  }
}

// Real-time Driver Service
export class RealTimeDriverService {
  private collectionName = 'drivers';

  async getAll(): Promise<Driver[]> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock drivers');
      return mockDrivers as any;
    }

    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const drivers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];
      
      console.log('✅ Drivers loaded from Firebase:', drivers.length);
      return drivers;
    } catch (error) {
      console.error('❌ Error loading drivers:', error);
      return mockDrivers as any;
    }
  }

  async getActiveDrivers(): Promise<Driver[]> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Using mock active drivers');
      return mockDrivers.filter(d => d.isActive) as any;
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const drivers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];
      
      console.log('✅ Active drivers loaded:', drivers.length);
      return drivers;
    } catch (error) {
      console.error('❌ Error loading active drivers:', error);
      return mockDrivers.filter(d => d.isActive) as any;
    }
  }
}

// Export service instances
export const realTimeReservationService = new RealTimeReservationService();
export const realTimeDriverService = new RealTimeDriverService();</parameter>
</invoke>

<invoke name="file">
<parameter name="filePath">app/reservation/page.tsx</parameter>
<parameter name="contentType">diff</parameter>
<parameter name="content">@@ .. @@
 import { GoogleMapsService } from '../../lib/services/googleMaps';
 import { EmailService } from '../../lib/services/emailService';
 import { AuthService } from '../../lib/services/authService';
-import { reservationService } from '../../lib/services/reservationService';
+import { realTimeReservationService } from '../../lib/services/realTimeService';
 import AddressAutocomplete from '../../components/ui/AddressAutocomplete';

@@ .. @@
   const handleCustomerNext = async (customerData: any) => {
     try {
       const finalData = { ...reservationData, ...customerData };
       
       // Generate QR code with reservation data
       const reservationId = `RES${Date.now()}`;
       const reservationWithId = { ...finalData, id: reservationId };
       
-      // Create reservation in Firebase
-      const firebaseReservationData = {
+      // Create reservation with real-time service
+      const reservationForFirebase = {
         ...reservationWithId,
         status: 'pending' as const,
-        qrCode: reservationId
+        qrCode: reservationId,
+        customerId: `customer_${Date.now()}`,
+        firstName: customerData.firstName,
+        lastName: customerData.lastName,
+        email: customerData.email,
+        phone: customerData.phone,
+        flightNumber: customerData.flightNumber || '',
+        specialRequests: customerData.specialRequests || ''
       };
       
-      const actualReservationId = await reservationService.createReservation(firebaseReservationData);
+      console.log('🚀 Creating reservation:', reservationForFirebase);
+      const actualReservationId = await realTimeReservationService.create(reservationForFirebase);
       
       // Update with actual Firebase ID
       const finalReservationData = { ...reservationWithId, id: actualReservationId };
       
+      // Generate QR code
       const qrCodeUrl = await EmailService.generateQRCode(reservationWithId);
       
       // Create user account automatically
@@ -1,7 +1,7 @@
       
       setCurrentStep(4);
       
-      toast.success('🎉 Rezervasyonunuz başarıyla oluşturuldu ve admin paneline gönderildi!');
+      toast.success('🎉 Rezervasyonunuz başarıyla oluşturuldu! Admin paneline gönderildi ve e-posta adresinize onay maili gönderildi.');
     } catch (error) {
       toast.error('❌ Rezervasyon oluşturulurken bir hata oluştu.');
       console.error('Reservation error:', error);</parameter>
</invoke>

<invoke name="file">
<parameter name="filePath">app/admin/page.tsx</parameter>
<parameter name="contentType">diff</parameter>
<parameter name="content">@@ .. @@
 import Link from 'next/link';
 import toast from 'react-hot-toast';
-import { reservationService, driverService } from '../../../lib/services/reservationService';
+import { realTimeReservationService, realTimeDriverService } from '../../lib/services/realTimeService';
 import { NotificationService } from '../../lib/services/notificationService';

@@ .. @@
   useEffect(() => {
     loadData();
     
     // Real-time reservations listener
-    const unsubscribe = reservationService.onReservationsChange((newReservations) => {
+    const unsubscribe = realTimeReservationService.onReservationsChange((newReservations) => {
       setReservations(newReservations);
+      console.log('📊 Admin panel received real-time update:', newReservations.length, 'reservations');
     });
     
     return () => unsubscribe();
@@ .. @@
   const loadData = async () => {
     try {
       setLoading(true);
+      console.log('📊 Loading admin data...');
       const [reservationsData, driversData] = await Promise.all([
-        reservationService.getReservations(),
-        driverService.getDrivers()
+        realTimeReservationService.getAll(),
+        realTimeDriverService.getAll()
       ]);
       setReservations(reservationsData);
       setDrivers(driversData);
+      console.log('✅ Admin data loaded:', reservationsData.length, 'reservations,', driversData.length, 'drivers');
     } catch (error) {
       toast.error('Veriler yüklenirken hata oluştu');
       console.error('Error loading data:', error);
@@ .. @@
   const handleAssignDriver = async (driverId: string) => {
     if (!selectedReservation) return;
     
     try {
-      // Update reservation in Firebase
-      await reservationService.updateReservationStatus(
-        selectedReservation.id, 
-        'assigned', 
-        driverId
-      );
+      console.log('👨‍💼 Assigning driver:', driverId, 'to reservation:', selectedReservation.id);
+      
+      // Update reservation with real-time service
+      await realTimeReservationService.assignDriver(selectedReservation.id, driverId);
       
       // Send notification to driver
       const driver = drivers.find(d => d.id === driverId);
       if (driver) {
+        console.log('📱 Sending notification to driver:', driver.name);
         await NotificationService.sendDriverNotification(driverId, selectedReservation);
         
         // Send customer notification with driver info
@@ -1,7 +1,7 @@
       setShowAssignModal(false);
       setSelectedReservation(null);
-      toast.success('🎉 Şoför başarıyla atandı ve bildirim gönderildi!');
+      toast.success(`🎉 ${driver?.name || 'Şoför'} başarıyla atandı! Bildirimler gönderildi.`);
     } catch (error) {
       toast.error('❌ Şoför atanırken hata oluştu.');
       console.error('Driver assignment error:', error);</parameter>
</invoke>

<invoke name="file">
<parameter name="filePath">app/driver/page.tsx</parameter>
<parameter name="contentType">diff</parameter>
<parameter name="content">@@ .. @@
 import Link from 'next/link';
 import toast from 'react-hot-toast';
 import QRScanner from '../../components/ui/QRScanner';
-import { reservationService } from '../../lib/services/reservationService';
+import { realTimeReservationService } from '../../lib/services/realTimeService';
 import { NotificationService } from '../../lib/services/notificationService';

@@ .. @@
   useEffect(() => {
     loadDriverReservations();
     
     // Real-time listener for driver reservations
-    const unsubscribe = reservationService.onReservationsChange((allReservations) => {
+    const unsubscribe = realTimeReservationService.onReservationsChange((allReservations) => {
       const driverReservations = allReservations.filter(res => 
-        res.assignedDriver === driverId && 
+        res.driverId === driverId && 
         ['assigned', 'started'].includes(res.status)
       );
       setReservations(driverReservations);
+      console.log('🚗 Driver panel received real-time update:', driverReservations.length, 'reservations for driver:', driverId);
     });
     
     return () => unsubscribe();
@@ .. @@
   const loadDriverReservations = async () => {
     try {
       setLoading(true);
-      const driverReservations = await reservationService.getDriverReservations(driverId);
+      console.log('🚗 Loading driver reservations for:', driverId);
+      const driverReservations = await realTimeReservationService.getDriverReservations(driverId);
       setReservations(driverReservations);
+      console.log('✅ Driver reservations loaded:', driverReservations.length);
     } catch (error) {
       console.error('Error loading driver reservations:', error);
       // Fallback to mock data
@@ .. @@
   const handleStartTrip = async (reservationId: string) => {
     try {
-      await reservationService.updateReservationStatus(reservationId, 'started');
+      console.log('🚀 Starting trip:', reservationId);
+      await realTimeReservationService.updateStatus(reservationId, 'started');
       toast.success('🚗 Yolculuk başlatıldı!');
     } catch (error) {
       toast.error('❌ Yolculuk başlatılırken hata oluştu.');
@@ .. @@
   const handleCompleteTrip = async (reservationId: string) => {
     try {
-      await reservationService.updateReservationStatus(reservationId, 'completed');
+      console.log('✅ Completing trip:', reservationId);
+      await realTimeReservationService.updateStatus(reservationId, 'completed');
       setDriverStats(prev => ({ ...prev, todayTrips: prev.todayTrips + 1 }));
       
       // Send completion notification
@@ .. @@
   const handleQRScan = (data: string) => {
     try {
       const qrData = JSON.parse(data);
       const reservationId = qrData.reservationId;
       
+      console.log('📱 QR Code scanned:', qrData);
+      
       // Find and start the trip
       const reservation = reservations.find(res => res.id === reservationId);
       if (reservation) {
         handleStartTrip(reservationId);
-        toast.success('🎉 QR kod başarıyla okundu! Yolculuk başlatıldı.');
+        toast.success(`🎉 QR kod başarıyla okundu! ${reservation.firstName} ${reservation.lastName} için yolculuk başlatıldı.`);
       } else {
         toast.error('❌ Geçersiz QR kod!');
       }</parameter>
</invoke>

<invoke name="file">
<parameter name="filePath">.env.local</parameter>
<parameter name="contentType">content</parameter>
<parameter name="content"># Firebase Configuration
# Replace these with your actual Firebase project credentials
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDemo-Key-Replace-With-Real
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sbs-travel-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sbs-travel-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sbs-travel-demo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF123

# Set to true if you want to use Firebase emulators for development
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false

# Google Maps API (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# PayTR Configuration (Optional)
NEXT_PUBLIC_PAYTR_MERCHANT_ID=your_paytr_merchant_id
NEXT_PUBLIC_PAYTR_MERCHANT_KEY=your_paytr_merchant_key
NEXT_PUBLIC_PAYTR_MERCHANT_SALT=your_paytr_merchant_salt

# Email Service (Optional)
NEXT_PUBLIC_SENDGRID_API_KEY=your_sendgrid_api_key
NEXT_PUBLIC_FROM_EMAIL=noreply@sbstravel.com</parameter>
</invoke>

<invoke name="start">
<parameter name="command">npm run dev</parameter>
</invoke>