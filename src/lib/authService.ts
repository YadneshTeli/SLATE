import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import { userService } from './realtimeService';
import type { User } from '@/types';

export class AuthService {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<User | null> {
    try {
      console.log('[AuthService] Attempting sign in for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from database with error handling
      let userData: User | null = null;
      try {
        userData = await userService.getByEmail(email);
      } catch (dbError) {
        console.error('[AuthService] Database query failed, using Firebase user data:', dbError);
        
        // If database query fails, create a minimal user object from Firebase data
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'User',
          role: 'shooter', // Default role - admin can change later
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Try to create the user in the database
        try {
          await userService.create(userData);
          console.log('[AuthService] Created user in database after sign-in');
        } catch (createError) {
          console.warn('[AuthService] Failed to create user in database:', createError);
        }
      }
      
      if (userData) {
        // Note: We skip updating lastLoginAt here to avoid permission issues
        // The security rules would need to be adjusted to allow users to update their own records
        // For now, we just return the existing user data
        
        return userData;
      }
      
      // If user doesn't exist in database, create them
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
    role: 'admin' | 'shooter' = 'shooter',
    phoneNumber?: string
  ): Promise<User | null> {
    try {
      console.log('[AuthService] Starting email signup for:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user document with enhanced data and error handling
      try {
        return await this.createUserDocument(firebaseUser, role, name, phoneNumber);
      } catch (dbError) {
        console.error('[AuthService] Failed to create user document:', dbError);
        
        // If database creation fails, still return user data so they can sign in
        // Admin can fix database issues later
        const fallbackUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: name || firebaseUser.displayName || 'User',
          role,
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        if (phoneNumber) {
          fallbackUser.phoneNumber = phoneNumber;
        }
        
        console.warn('[AuthService] Using fallback user data due to database error');
        return fallbackUser;
      }
    } catch (error) {
      console.error('[AuthService] Error signing up:', error);
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
        
        // If popup is blocked or COOP policy blocks it, use redirect instead
        const errorObj = popupError as Error & { code?: string };
        const errorMessage = errorObj?.message || '';
        
        if (errorObj?.code === 'auth/popup-blocked' || 
            errorMessage.includes('popup') ||
            errorMessage.includes('Cross-Origin-Opener-Policy') ||
            errorMessage.includes('window.closed') ||
            errorObj?.code === 'auth/cancelled-popup-request') {
          
          console.log('[AuthService] Switching to redirect method due to popup/COOP policy restrictions');
          
          // Store that we're expecting a Google redirect result
          localStorage.setItem('slate-pending-google-auth', 'true');
          
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
        
        // Note: We skip updating lastLoginAt here to avoid permission issues
        // The security rules would need to be adjusted to allow users to update their own records
        // For now, we just return the existing user data
        
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

  // Handle Google redirect result (for COOP policy fallback)
  async handleGoogleRedirectResult(): Promise<User | null> {
    try {
      // Check if we were expecting a redirect result
      const pendingAuth = localStorage.getItem('slate-pending-google-auth');
      if (!pendingAuth) {
        return null;
      }

      console.log('[AuthService] Checking for Google redirect result...');
      const result = await getRedirectResult(auth);
      
      // Clear the pending auth flag
      localStorage.removeItem('slate-pending-google-auth');
      
      if (!result || !result.user) {
        console.log('[AuthService] No redirect result found');
        return null;
      }

      const firebaseUser = result.user;
      console.log('[AuthService] Google redirect sign-in successful, checking user status...');
      
      // Check if user already exists
      const existingUser = await userService.getByEmail(firebaseUser.email!);
      if (existingUser) {
        console.log('[AuthService] Existing user found:', existingUser.email);
        
        // Note: We skip updating lastLoginAt here to avoid permission issues
        // The security rules would need to be adjusted to allow users to update their own records
        // For now, we just return the existing user data
        
        return existingUser;
      }
      
      console.log('[AuthService] New user from redirect, role selection required');
      
      // For new Google users, we need role selection
      throw new Error('ROLE_SELECTION_REQUIRED');
      
    } catch (error) {
      // Clear the pending auth flag on error
      localStorage.removeItem('slate-pending-google-auth');
      
      if (error instanceof Error && error.message === 'ROLE_SELECTION_REQUIRED') {
        throw error; // Pass through role selection error
      }
      
      console.error('[AuthService] Error handling Google redirect:', error);
      return null; // Don't throw other errors, just return null
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

  // Create user document in database
  private async createUserDocument(
    firebaseUser: FirebaseUser, 
    role: 'admin' | 'shooter',
    name?: string,
    phoneNumber?: string
  ): Promise<User> {
    const now = new Date();
    
    // Build user data object, excluding undefined values for Firebase compatibility
    const baseUserData: Omit<User, 'id'> = {
      email: firebaseUser.email!,
      name: name || firebaseUser.displayName || 'User',
      role,
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Only add optional fields if they have valid values
    if (phoneNumber || firebaseUser.phoneNumber) {
      baseUserData.phoneNumber = phoneNumber || firebaseUser.phoneNumber!;
    }
    
    if (firebaseUser.photoURL) {
      baseUserData.profilePicture = firebaseUser.photoURL;
    }

    console.log('[AuthService] Creating new user document:', {
      email: baseUserData.email,
      name: baseUserData.name,
      role: baseUserData.role,
      isActive: baseUserData.isActive,
      hasProfilePicture: !!baseUserData.profilePicture,
      hasPhoneNumber: !!baseUserData.phoneNumber
    });

    const userId = await userService.create(baseUserData);
    
    return {
      id: userId,
      ...baseUserData,
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
