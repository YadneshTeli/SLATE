import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthForm } from '@/components/AuthForm';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ChecklistPage } from '@/pages/ChecklistPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminProjectsPage } from '@/pages/AdminProjectsPage';
import { ShooterProjectPage } from '@/pages/ShooterProjectPage';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <AuthForm />
      </div>
    ),
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
      <ProtectedRoute requireRole="admin">
        <ProjectsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:projectId',
    element: (
      <ProtectedRoute requireRole="admin">
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
      <ProtectedRoute requireRole="admin">
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/projects',
    element: (
      <ProtectedRoute requireRole="admin">
        <AdminProjectsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/shooter/project',
    element: (
      <ProtectedRoute requireRole="shooter">
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
