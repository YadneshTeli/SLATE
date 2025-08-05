import { useApp } from '@/hooks/useApp';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

export function DashboardPage() {
  const { state } = useApp();

  useEffect(() => {
    // This page will redirect to appropriate role-based interface
  }, []);

  if (!state.user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  if (state.user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/shooter/project" replace />;
  }
}
