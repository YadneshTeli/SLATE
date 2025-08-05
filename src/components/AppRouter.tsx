import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ChecklistPage } from '@/pages/ChecklistPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminProjectsPage } from '@/pages/AdminProjectsPage';
import { ShooterProjectPage } from '@/pages/ShooterProjectPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'shooter';
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { state } = useApp();
  
  // Check if user is authenticated
  if (!state.user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Check role requirement
  if (requiredRole && state.user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects',
    element: (
      <ProtectedRoute requiredRole="admin">
        <ProjectsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:projectId',
    element: (
      <ProtectedRoute requiredRole="admin">
        <ProjectDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:projectId/checklist/:checklistId',
    element: (
      <ProtectedRoute>
        <ChecklistPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/projects',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminProjectsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/shooter/project',
    element: (
      <ProtectedRoute requiredRole="shooter">
        <ShooterProjectPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
