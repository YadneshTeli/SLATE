import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import { userService } from './firebaseService';
import type { User } from '@/types';

export class AuthService {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userData = await userService.getByEmail(email);
      if (userData) {
        return userData;
      }
      
      // If user doesn't exist in Firestore, create them
      return await this.createUserDocument(firebaseUser, 'shooter');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign up with email and password
  async signUpWithEmail(
    email: string, 
    password: string, 
    name: string,
    role: 'admin' | 'shooter' = 'shooter'
  ): Promise<User | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user document in Firestore
      return await this.createUserDocument(firebaseUser, role, name);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<User | null> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      // Enhanced popup configuration for CORS issues
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online',
        include_granted_scopes: 'true'
      });
      
      console.log('[AuthService] Attempting Google sign-in...');
      
      // Try popup first, fall back to redirect if blocked
      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, provider);
      } catch (popupError: unknown) {
        console.warn('[AuthService] Popup blocked or failed, trying redirect...', popupError);
        
        // If popup is blocked, use redirect instead
        const errorObj = popupError as Error & { code?: string };
        if (errorObj?.code === 'auth/popup-blocked' || 
            errorObj?.message?.includes('popup') ||
            errorObj?.message?.includes('Cross-Origin-Opener-Policy')) {
          
          console.log('[AuthService] Using redirect method due to popup issues');
          await signInWithRedirect(auth, provider);
          // This will reload the page, so we return null here
          return null;
        }
        throw popupError;
      }
      
      const firebaseUser = userCredential.user;
      
      console.log('[AuthService] Google sign-in successful, checking user status...');
      
      // Check if user already exists
      const existingUser = await userService.getByEmail(firebaseUser.email!);
      if (existingUser) {
        console.log('[AuthService] Existing user found:', existingUser.email);
        return existingUser;
      }
      
      console.log('[AuthService] New user detected, role selection required');
      
      // For new Google users, we need role selection
      // Return a special object indicating role selection is needed
      throw new Error('ROLE_SELECTION_REQUIRED');
    } catch (error: unknown) {
      console.error('[AuthService] Google sign-in error:', error);
      
      // Handle specific Firebase Auth errors
      if (error instanceof Error) {
        // Check for Firebase error codes
        const firebaseError = error as Error & { code?: string };
        
        if (firebaseError.code === 'auth/popup-closed-by-user') {
          throw new Error('Google sign-in was cancelled');
        } else if (firebaseError.code === 'auth/popup-blocked') {
          throw new Error('Popup was blocked. Please allow popups and try again');
        } else if (firebaseError.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your connection and try again');
        }
        
        if (error.message === 'ROLE_SELECTION_REQUIRED') {
          // Pass through our custom error
          throw error;
        }
        
        throw new Error(`Google sign-in failed: ${error.message}`);
      }
      
      throw new Error('Google sign-in failed with unknown error');
    }
  }

  // Complete Google signup after role selection
  async completeGoogleSignup(role: 'admin' | 'shooter'): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }

      // Create new user document with selected role
      return await this.createUserDocument(
        firebaseUser, 
        role, 
        firebaseUser.displayName || 'User'
      );
    } catch (error) {
      console.error('Error completing Google signup:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userData = await userService.getByEmail(firebaseUser.email!);
        callback(userData);
      } else {
        callback(null);
      }
    });
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Check if user is signed in
  isSignedIn(): boolean {
    return !!auth.currentUser;
  }

  // Create user document in Firestore
  private async createUserDocument(
    firebaseUser: FirebaseUser, 
    role: 'admin' | 'shooter',
    name?: string
  ): Promise<User> {
    const userData: Omit<User, 'id'> = {
      email: firebaseUser.email!,
      name: name || firebaseUser.displayName || 'User',
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userId = await userService.create(userData);
    
    return {
      id: userId,
      ...userData,
    };
  }

  // Update user profile
  async updateUserProfile(updates: {
    name?: string;
    role?: 'admin' | 'shooter';
  }): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No user signed in');

    try {
      // Update Firebase Auth profile if name is being changed
      if (updates.name) {
        await updateProfile(currentUser, { displayName: updates.name });
      }

      // Update Firestore document
      const userData = await userService.getByEmail(currentUser.email!);
      if (userData) {
        await userService.update(userData.id, updates);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Admin functions
  async promoteUserToAdmin(userId: string): Promise<void> {
    try {
      await userService.update(userId, { role: 'admin' });
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  }

  async demoteUserToShooter(userId: string): Promise<void> {
    try {
      await userService.update(userId, { role: 'shooter' });
    } catch (error) {
      console.error('Error demoting user to shooter:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const authService = new AuthService();
