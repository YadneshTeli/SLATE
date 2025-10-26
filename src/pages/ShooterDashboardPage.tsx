import { useNavigate } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { ShooterDashboard } from '@/components/ShooterDashboard';
import { Button } from '@/components/ui/button';
import { FolderOpen, LogOut } from 'lucide-react';

export function ShooterDashboardPage() {
  const { state } = useApp();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Removed auto-redirect to project - user can manually navigate via button

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewProject = () => {
    if (state.currentProject) {
      navigate('/shooter/project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-0">
            <div className="flex items-center gap-2 sm:gap-4 w-full xs:w-auto">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">SLATE</h1>
              {state.currentProject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewProject}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm touch-manipulation min-h-[36px] flex-1 xs:flex-none"
                >
                  <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">View Current Project</span>
                  <span className="xs:hidden">View Project</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full xs:w-auto">
              <span className="text-xs sm:text-sm text-slate-600 truncate flex-1 xs:flex-none">
                {state.user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm touch-manipulation min-h-[36px] flex-shrink-0"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <ShooterDashboard />
    </div>
  );
}
