import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthForm } from '@/components/AuthForm';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ChecklistPage } from '@/pages/ChecklistPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminProjectsPage } from '@/pages/AdminProjectsPage';
import { ShooterProjectPage } from '@/pages/ShooterProjectPage';
import { ShooterDashboardPage } from '@/pages/ShooterDashboardPage';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

function RouteLogger() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('🔶 [AppRouter] Current route:', location.pathname);
  }, [location]);
  
  return null;
}

// Simple auth page that doesn't redirect
function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  console.log('🔷 [AuthPage] Rendering... user:', user?.email, 'loading:', loading);
  
  useEffect(() => {
    if (!loading && user) {
      console.log('🔷 [AuthPage] User authenticated, navigating to /dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    console.log('🔷 [AuthPage] Still loading');
    return null;
  }
  
  if (user) {
    console.log('🔷 [AuthPage] User exists, should navigate soon');
    return null; // Navigation will happen in useEffect
  }
  
  console.log('🔷 [AuthPage] Showing auth form');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <AuthForm />
    </div>
  );
}

export function AppRouter() {
  console.log('🔶 [AppRouter] Rendering...');
  
  return (
    <BrowserRouter>
      <RouteLogger />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute requireRole="admin">
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute requireRole="admin">
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/checklist/:checklistId"
          element={
            <ProtectedRoute>
              <ChecklistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shooter/dashboard"
          element={
            <ProtectedRoute requireRole="shooter">
              <ShooterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shooter/project"
          element={
            <ProtectedRoute requireRole="shooter">
              <ShooterProjectPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
