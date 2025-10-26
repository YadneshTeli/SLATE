import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'admin' | 'shooter';
}

export function ProtectedRoute({ 
  children, 
  requireRole
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log('🟣 [ProtectedRoute] user:', user?.email || 'null', 'loading:', loading, 'requireRole:', requireRole);

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('🟣 [ProtectedRoute] Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!user) {
    console.log('🟣 [ProtectedRoute] No user found, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Check role requirement
  if (requireRole && user.role !== requireRole) {
    console.log('🟣 [ProtectedRoute] Role mismatch. Required:', requireRole, 'User has:', user.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">
            You need {requireRole} privileges to access this page.
            {user.role === 'shooter' && requireRole === 'admin' && (
              <span className="block mt-2">
                Contact your project manager to upgrade your account.
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            Current role: <span className="font-medium capitalize">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and has correct role
  console.log('🟣 [ProtectedRoute] User authorized, rendering protected content');
  return <>{children}</>;
}

interface RoleBasedProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'shooter')[];
  fallback?: ReactNode;
}

export function RoleBased({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleBasedProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
