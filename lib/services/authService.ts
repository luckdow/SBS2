// Authentication Service with Google Sign-In
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebase';

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();

  static async signInWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
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
}