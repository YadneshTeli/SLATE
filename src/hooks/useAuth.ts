import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Safe version that returns null if context not ready - for use during initialization
export function useAuthSafe() {
  const context = useContext(AuthContext);
  return context === undefined ? null : context;
}
