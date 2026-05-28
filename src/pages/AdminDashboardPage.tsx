import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { EnhancedAdminDashboard } from '@/components/EnhancedAdminDashboard';
import { TeamProgressDashboard } from '@/components/TeamProgressDashboard';
import { UserManagement } from '@/components/UserManagement';
import { ProjectCreationDashboard } from '@/components/ProjectCreationDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

export function AdminDashboardPage() {
  const { state, dispatch } = useApp();
  const { signOut } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // GSAP animation for page load
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  const handleLogout = async () => {
    if (containerRef.current) {
      await gsap.to(containerRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in'
      });
    }
    
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get current project or first available project
  const currentProject = state.currentProject || state.projects[0];

  const handleUpdateProject = (updatedProject: typeof currentProject) => {
    if (updatedProject) {
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex min-h-[64px] flex-col justify-between gap-2 py-3 sm:h-16 sm:flex-row sm:items-center sm:gap-4 sm:py-0">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
              <h1 className="shrink-0 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">SLATE Admin</h1>
              <span className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Welcome, {state.user?.name}
              </span>
            </div>
            <nav className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 sm:flex sm:w-auto sm:gap-3">
              <Link
                to="/admin/projects"
                className="flex min-h-[40px] items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:text-sm"
              >
                <span className="hidden sm:inline">Project Management</span>
                <span className="sm:hidden">Projects</span>
              </Link>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="min-h-[40px] rounded-md bg-slate-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-white sm:px-4 sm:text-sm"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">Dashboard Overview</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Monitor project progress and team performance</p>
        </div>

        {currentProject ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TabsTrigger 
                value="overview"
                className="min-h-[40px] min-w-[112px] flex-1 text-xs sm:min-w-0 sm:text-sm py-2 sm:py-2.5"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className="min-h-[40px] min-w-[96px] flex-1 text-xs sm:min-w-0 sm:text-sm py-2 sm:py-2.5"
              >
                Team
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="min-h-[40px] min-w-[96px] flex-1 text-xs sm:min-w-0 sm:text-sm py-2 sm:py-2.5"
              >
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="projects"
                className="min-h-[40px] min-w-[104px] flex-1 text-xs sm:min-w-0 sm:text-sm py-2 sm:py-2.5"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="min-h-[40px] min-w-[104px] flex-1 text-xs sm:min-w-0 sm:text-sm py-2 sm:py-2.5"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <EnhancedAdminDashboard />
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <TeamProgressDashboard project={currentProject} />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagement 
                project={currentProject} 
                onUpdateProject={handleUpdateProject}
              />
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <ProjectCreationDashboard />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="text-center py-8 sm:py-12">
                <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-2">Project Settings</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4">Configure project details and preferences</p>
                <Button asChild className="touch-manipulation min-h-[44px]">
                  <Link to="/admin/projects">Advanced Project Management</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center py-6 sm:py-8">
              <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-2">Welcome to SLATE Admin</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4">Create your first project to get started</p>
            </div>
            <ProjectCreationDashboard />
          </div>
        )}
      </main>
    </div>
  );
}
