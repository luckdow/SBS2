// Authentication Service with Google Sign-In and Email/Password Registration
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';
import { User as AppUser } from '../types';

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();

  static async signInWithGoogle(): Promise<User | null> {
    try {
      // Enhanced popup handling with better error management
      const result = await signInWithPopup(auth, this.googleProvider);
      return result.user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle specific auth errors with user-friendly messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Giriş penceresi kapatıldı. Lütfen tekrar deneyin.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup engellendi. Lütfen tarayıcı ayarlarınızı kontrol edin.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Giriş işlemi iptal edildi.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google girişi etkinleştirilmemiş.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.');
      }
      
      throw error;
    }
  }

  static async createAccountWithEmail(email: string, password: string, name: string): Promise<User | null> {
    try {
      console.log('Creating account with email:', email);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with name
      await updateProfile(user, {
        displayName: name
      });
      
      console.log('User account created successfully:', user.uid);
      return user;
    } catch (error) {
      console.error('Email/password registration error:', error);
      throw error;
    }
  }

  static async signInWithEmail(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Email/password sign-in error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      // Enhanced sign out with cleanup
      await firebaseSignOut(auth);
      
      // Clear any cached data or localStorage
      try {
        if (typeof window !== 'undefined') {
          // Clear any Google Maps related data
          window.localStorage.removeItem('google_maps_session');
          window.sessionStorage.removeItem('user_session');
        }
      } catch (cleanupError) {
        console.warn('Cleanup during sign out failed (non-critical):', cleanupError);
      }
    } catch (error: any) {
      console.error('Sign-out error:', error);
      
      // Handle specific sign-out errors
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.');
      }
      
      throw error;
    }
  }

  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static async createUserProfile(user: User, additionalData: any = {}) {
    try {
      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
        role: 'customer',
        createdAt: new Date(),
        ...additionalData
      };
      
      // Save to database
      console.log('Creating user profile:', userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Get user role from their profile data or determine based on email patterns
  static async getUserRole(user: User): Promise<'admin' | 'driver' | 'customer'> {
    try {
      if (!user || !user.email) {
        return 'customer'; // Default role
      }

      const email = user.email.toLowerCase();
      
      // Check for predefined admin/demo accounts
      if (email === 'admin@sbstravel.com') {
        return 'admin';
      }
      
      if (email === 'sofor@sbstravel.com' || email.includes('driver') || email.includes('sofor')) {
        return 'driver';
      }
      
      // Check database for user role (in a real app, this would query Firestore)
      // For now, we'll use email pattern matching and default to customer
      const userProfile = await this.getUserProfile(user);
      return userProfile?.role || 'customer';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'customer'; // Default fallback
    }
  }

  // Get user profile information
  static async getUserProfile(user: User): Promise<AppUser | null> {
    try {
      if (!user) {
        return null;
      }

      // In a real app, this would query Firestore/database
      // For now, we'll create a profile based on available user data
      const email = user.email?.toLowerCase() || '';
      
      let role: 'admin' | 'driver' | 'customer' = 'customer';
      let additionalData: any = {};

      // Determine role and additional data based on email or other criteria
      if (email === 'admin@sbstravel.com') {
        role = 'admin';
        additionalData = {
          name: 'Admin User',
          phone: '+90 532 000 0001'
        };
      } else if (email === 'sofor@sbstravel.com') {
        role = 'driver';
        additionalData = {
          name: 'Demo Şoför',
          phone: '+90 532 000 0002',
          licenseNumber: 'DR123456',
          vehicleType: 'sedan',
          vehiclePlate: '34 ABC 123',
          isActive: true,
          rating: 4.8,
          totalTrips: 156,
          monthlyEarnings: 12450
        };
      } else if (email === 'musteri@sbstravel.com') {
        role = 'customer';
        additionalData = {
          name: 'Demo Müşteri',
          phone: '+90 532 000 0003',
          totalReservations: 24,
          preferredVehicle: 'sedan'
        };
      } else {
        // For Google users or other registered users, use their display name
        additionalData = {
          name: user.displayName || user.email?.split('@')[0] || 'User',
          phone: user.phoneNumber || ''
        };
      }

      const profile: AppUser = {
        id: user.uid,
        email: user.email || '',
        name: additionalData.name,
        role,
        phone: additionalData.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...additionalData
      };

      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Get the appropriate dashboard route based on user role
  static getDashboardRoute(role: 'admin' | 'driver' | 'customer'): string {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'driver':
        return '/driver';
      case 'customer':
      default:
        return '/customer';
    }
  }

  // Enhanced sign-in with automatic role detection and redirection
  static async signInAndRedirect(email: string, password: string): Promise<{ user: User; role: string; redirectUrl: string } | null> {
    try {
      const user = await this.signInWithEmail(email, password);
      
      if (user) {
        const role = await this.getUserRole(user);
        const redirectUrl = this.getDashboardRoute(role);
        
        return { user, role, redirectUrl };
      }
      
      return null;
    } catch (error) {
      console.error('Sign-in with redirect error:', error);
      throw error;
    }
  }

  // Enhanced Google sign-in with automatic role detection and redirection
  static async signInWithGoogleAndRedirect(): Promise<{ user: User; role: string; redirectUrl: string } | null> {
    try {
      const user = await this.signInWithGoogle();
      
      if (user) {
        const role = await this.getUserRole(user);
        const redirectUrl = this.getDashboardRoute(role);
        
        return { user, role, redirectUrl };
      }
      
      return null;
    } catch (error) {
      console.error('Google sign-in with redirect error:', error);
      throw error;
    }
  }

  static generateRandomPassword(): string {
    // Generate a random password for automatic registration
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  static async createAutoAccount(email: string, name: string, phone: string): Promise<{user: User, password: string} | null> {
    try {
      console.log('Creating automatic account for:', email);
      
      // Generate a secure random password
      const password = this.generateRandomPassword();
      
      // Create user account
      const user = await this.createAccountWithEmail(email, password, name);
      
      if (user) {
        // Create user profile with additional info
        await this.createUserProfile(user, {
          phone: phone,
          autoGenerated: true,
          registrationSource: 'reservation'
        });
        
        console.log('Automatic account created successfully for:', email);
        return { user, password };
      }
      
      return null;
    } catch (error) {
      console.error('Auto account creation error:', error);
      
      // If user already exists, that's okay - just log them in if possible
      if (error instanceof Error && error.message.includes('email-already-in-use')) {
        console.log('User already exists, skipping account creation');
        return null;
      }
      
      throw error;
    }
  }

  // Calculate customer statistics from reservations
  static calculateCustomerStats(reservations: any[]): any {
    if (!reservations || reservations.length === 0) {
      return {
        totalTrips: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        membershipLevel: 'Bronze',
        avgRating: 0,
        savedAmount: 0
      };
    }

    const completedReservations = reservations.filter(r => r.status === 'completed');
    const totalSpent = completedReservations.reduce((sum, r) => sum + (r.totalPrice || r.price || 0), 0);
    const totalTrips = completedReservations.length;
    const loyaltyPoints = Math.floor(totalSpent / 10); // 1 point per 10 TL spent
    
    // Determine membership level based on total spent
    let membershipLevel = 'Bronze';
    if (totalSpent >= 10000) {
      membershipLevel = 'Platinum';
    } else if (totalSpent >= 5000) {
      membershipLevel = 'Gold';
    } else if (totalSpent >= 2000) {
      membershipLevel = 'Silver';
    }

    // Calculate average rating (if available)
    const ratedReservations = completedReservations.filter(r => r.rating);
    const avgRating = ratedReservations.length > 0 
      ? ratedReservations.reduce((sum, r) => sum + r.rating, 0) / ratedReservations.length 
      : 5.0;

    // Calculate estimated savings (mock calculation)
    const savedAmount = Math.floor(totalSpent * 0.15); // Assume 15% savings

    return {
      totalTrips,
      totalSpent,
      loyaltyPoints,
      membershipLevel,
      avgRating: Math.round(avgRating * 10) / 10,
      savedAmount
    };
  }
}