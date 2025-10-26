import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/lib/authService';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  needsOnboarding: boolean;
  onboardingEmail: string | null;
  onboardingName: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'admin' | 'shooter', phoneNumber?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  completeGoogleSignup: (role: 'admin' | 'shooter') => Promise<void>;
  completeOnboarding: (data: { role: 'admin' | 'shooter'; name: string; phoneNumber?: string }) => Promise<void>;
  handleGoogleRedirectResult: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (updates: { name?: string; role?: 'admin' | 'shooter' }) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingEmail, setOnboardingEmail] = useState<string | null>(null);
  const [onboardingName, setOnboardingName] = useState<string | null>(null);

  // Listen to authentication state changes and handle redirects
  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');
    const unsubscribe = authService.onAuthStateChanged((user) => {
      console.log('[AuthContext] Auth state changed, user:', user?.email || 'null');
      setUser(user);
      setLoading(false);
    });

    // Check for Google redirect result on app start
    handleGoogleRedirectResult();

    return unsubscribe;
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Starting email sign-in for:', email);
      setLoading(true);
      setError(null);
      const user = await authService.signInWithEmail(email, password);
      console.log('[AuthContext] Email sign-in succeeded, user:', user?.email || 'null');
      setUser(user);
    } catch (err) {
      console.error('[AuthContext] Sign in error:', err);
      if (err instanceof Error) {
        if (err.message.includes('user-not-found')) {
          setError('No account found with this email address.');
        } else if (err.message.includes('wrong-password')) {
          setError('Incorrect password.');
        } else if (err.message.includes('invalid-email')) {
          setError('Invalid email address.');
        } else if (err.message.includes('too-many-requests')) {
          setError('Too many failed attempts. Please try again later.');
        } else {
          setError('Failed to sign in. Please check your credentials.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'admin' | 'shooter' = 'shooter', phoneNumber?: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.signUpWithEmail(email, password, name, role, phoneNumber);
      setUser(user);
    } catch (err) {
      console.error('Sign up error:', err);
      if (err instanceof Error) {
        if (err.message.includes('email-already-in-use')) {
          setError('An account with this email already exists.');
        } else if (err.message.includes('weak-password')) {
          setError('Password should be at least 6 characters.');
        } else if (err.message.includes('invalid-email')) {
          setError('Invalid email address.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🟢 [AuthContext] ====== GOOGLE SIGN-IN STARTED ======');
      setLoading(true);
      setError(null);
      const user = await authService.signInWithGoogle();
      console.log('🟢 [AuthContext] Google sign-in succeeded, user:', user?.email || 'null');
      console.log('🟢 [AuthContext] Setting user state...');
      setUser(user);
      console.log('🟢 [AuthContext] User state set successfully');
    } catch (err) {
      console.error('🔴 [AuthContext] Google sign in error:', err);
      if (err instanceof Error) {
        if (err.message === 'ROLE_SELECTION_REQUIRED') {
          // Trigger onboarding flow for new Google users
          console.log('[AuthContext] ROLE_SELECTION_REQUIRED detected - triggering onboarding');
          const firebaseUser = authService.getCurrentUser();
          if (firebaseUser) {
            console.log('[AuthContext] Firebase user found:', firebaseUser.email);
            setOnboardingEmail(firebaseUser.email || null);
            setOnboardingName(firebaseUser.displayName || null);
            setNeedsOnboarding(true);
            console.log('[AuthContext] Onboarding state set to true');
          } else {
            console.error('[AuthContext] No Firebase user found for onboarding');
          }
          setError(null); // Clear any errors
        } else if (err.message.includes('popup-closed-by-user')) {
          setError('Sign in was cancelled.');
        } else if (err.message.includes('popup-blocked')) {
          setError('Popup was blocked. Please allow popups for this site.');
        } else if (err.message.includes('Cross-Origin-Opener-Policy')) {
          setError('Browser security settings are blocking the popup. The page will redirect for authentication.');
        } else {
          setError('Failed to sign in with Google. Please try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const completeGoogleSignup = async (role: 'admin' | 'shooter') => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.completeGoogleSignup(role);
      setUser(user);
      setNeedsOnboarding(false);
      setOnboardingEmail(null);
      setOnboardingName(null);
    } catch (err) {
      console.error('Complete Google signup error:', err);
      setError('Failed to complete Google signup.');
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (data: { role: 'admin' | 'shooter'; name: string; phoneNumber?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update user profile if name changed
      const firebaseUser = authService.getCurrentUser();
      if (firebaseUser && data.name !== firebaseUser.displayName) {
        await authService.updateUserProfile({ name: data.name });
      }
      
      // Complete signup with role and phone number
      const user = await authService.completeGoogleSignup(data.role);
      
      // Update phone number if provided
      if (user && data.phoneNumber) {
        await authService.updateUserProfile({ name: data.name });
      }
      
      // Clear any pending auth state to prevent re-triggering sign-in flow
      localStorage.removeItem('slate-pending-google-auth');
      
      // Set user state first
      setUser(user);
      
      // Then clear onboarding flags
      setNeedsOnboarding(false);
      setOnboardingEmail(null);
      setOnboardingName(null);
      
      // Clear loading state to allow navigation
      setLoading(false);
    } catch (err) {
      console.error('Complete onboarding error:', err);
      setError('Failed to complete onboarding.');
      setLoading(false);
      throw err;
    }
  };

  const handleGoogleRedirectResult = async () => {
    try {
      const user = await authService.handleGoogleRedirectResult();
      if (user) {
        setUser(user);
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'ROLE_SELECTION_REQUIRED') {
        console.log('Initiating onboarding after redirect');
        const firebaseUser = authService.getCurrentUser();
        if (firebaseUser) {
          setOnboardingEmail(firebaseUser.email || null);
          setOnboardingName(firebaseUser.displayName || null);
          setNeedsOnboarding(true);
        }
      } else {
        console.error('Error handling Google redirect result:', err);
        // Don't show error for redirect result failures - just ignore them
      }
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      setError(null);
      await authService.sendPasswordResetEmail(email);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err instanceof Error) {
        if (err.message.includes('user-not-found')) {
          setError('No account found with this email address.');
        } else if (err.message.includes('invalid-email')) {
          setError('Invalid email address.');
        } else {
          setError('Failed to send password reset email.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const updateProfile = async (updates: { name?: string; role?: 'admin' | 'shooter' }) => {
    try {
      setError(null);
      await authService.updateUserProfile(updates);
      // Update local user state
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile.');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    needsOnboarding,
    onboardingEmail,
    onboardingName,
    signIn,
    signUp,
    signInWithGoogle,
    completeGoogleSignup,
    completeOnboarding,
    handleGoogleRedirectResult,
    signOut,
    sendPasswordReset,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
