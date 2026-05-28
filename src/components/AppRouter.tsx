import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthForm } from '@/components/AuthForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LandingPage } from '@/pages/LandingPage';
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
    <div className="min-h-screen bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_48%,#fff7ed_100%)] px-4 py-6 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_52%,#042f2e_100%)] sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col items-center justify-center gap-6 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden max-w-lg lg:block">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md bg-teal-700 text-white shadow-sm">
            <span className="text-lg font-bold">S</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white">Sign in and get the shoot back in sync.</h1>
          <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-300">
            Access project dashboards, shooter checklists, offline updates, and team progress from one responsive workspace.
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}

export function AppRouter() {
  console.log('🔶 [AppRouter] Rendering...');
  
  return (
    <BrowserRouter>
      <RouteLogger />
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}
