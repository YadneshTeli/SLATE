import { useApp } from '@/hooks/useApp';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function DashboardPage() {
  const { state, restoreLastViewedProject } = useApp();
  const [isRestoringProject, setIsRestoringProject] = useState(false);

  useEffect(() => {
    // For shooters, try to restore last-viewed project
    if (state.user?.role === 'shooter' && state.projects.length > 0 && !state.currentProject) {
      setIsRestoringProject(true);
      // Give context a moment to restore the project
      const timer = setTimeout(() => {
        restoreLastViewedProject();
        setIsRestoringProject(false);
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (state.user?.role === 'shooter' && state.projects.length > 0) {
      setIsRestoringProject(false);
    }
  }, [state.user, state.projects.length, state.currentProject, restoreLastViewedProject]);

  if (!state.user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while restoring project for shooters
  if (state.user.role === 'shooter' && isRestoringProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Restoring your last project...</p>
        </div>
      </div>
    );
  }

  // Redirect based on user role
  if (state.user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/shooter/project" replace />;
  }
}
