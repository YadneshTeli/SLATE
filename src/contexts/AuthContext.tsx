import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/lib/authService';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'admin' | 'shooter', phoneNumber?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  completeGoogleSignup: (role: 'admin' | 'shooter') => Promise<void>;
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

  // Listen to authentication state changes and handle redirects
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
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
      setLoading(true);
      setError(null);
      const user = await authService.signInWithEmail(email, password);
      setUser(user);
    } catch (err) {
      console.error('Sign in error:', err);
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
      setLoading(true);
      setError(null);
      const user = await authService.signInWithGoogle();
      setUser(user);
    } catch (err) {
      console.error('Google sign in error:', err);
      if (err instanceof Error) {
        if (err.message === 'ROLE_SELECTION_REQUIRED') {
          // Don't set this as an error - it's expected for new users
          console.log('Role selection required for new Google user');
          setError('Please select your role to complete registration.');
          // The AuthForm component should handle showing role selection UI
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
    } catch (err) {
      console.error('Complete Google signup error:', err);
      setError('Failed to complete Google signup.');
    } finally {
      setLoading(false);
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
        console.log('Role selection required after redirect');
        setError('Please select your role to complete registration.');
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
    signIn,
    signUp,
    signInWithGoogle,
    completeGoogleSignup,
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
