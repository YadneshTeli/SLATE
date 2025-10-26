import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { EnhancedAdminDashboard } from '@/components/EnhancedAdminDashboard';
import { TeamProgressDashboard } from '@/components/TeamProgressDashboard';
import { UserManagement } from '@/components/UserManagement';
import { ProjectCreationDashboard } from '@/components/ProjectCreationDashboard';
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
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0 min-h-[64px] sm:h-16 py-2 xs:py-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">SLATE Admin</h1>
              <span className="text-xs sm:text-sm text-slate-500 truncate max-w-[120px] sm:max-w-none">
                Welcome, {state.user?.name}
              </span>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4 w-full xs:w-auto">
              <Link
                to="/admin/projects"
                className="text-slate-600 hover:text-slate-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation min-h-[36px] flex items-center"
              >
                <span className="hidden sm:inline">Project Management</span>
                <span className="sm:hidden">Projects</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-slate-600 hover:bg-slate-700 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation min-h-[36px]"
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Dashboard Overview</h2>
          <p className="text-sm sm:text-base text-slate-600">Monitor project progress and team performance</p>
        </div>

        {currentProject ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1 h-auto p-1">
              <TabsTrigger 
                value="overview"
                className="text-xs sm:text-sm py-2 sm:py-2.5 touch-manipulation min-h-[36px] data-[state=active]:bg-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className="text-xs sm:text-sm py-2 sm:py-2.5 touch-manipulation min-h-[36px] data-[state=active]:bg-white"
              >
                Team
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="text-xs sm:text-sm py-2 sm:py-2.5 touch-manipulation min-h-[36px] data-[state=active]:bg-white"
              >
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="projects"
                className="text-xs sm:text-sm py-2 sm:py-2.5 touch-manipulation min-h-[36px] data-[state=active]:bg-white col-span-1 sm:col-span-1"
              >
                <span className="hidden xs:inline">Projects</span>
                <span className="xs:hidden">Proj</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="text-xs sm:text-sm py-2 sm:py-2.5 touch-manipulation min-h-[36px] data-[state=active]:bg-white col-span-2 sm:col-span-1"
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
                <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">Project Settings</h3>
                <p className="text-sm sm:text-base text-slate-600 mb-4">Configure project details and preferences</p>
                <Button asChild className="touch-manipulation min-h-[44px]">
                  <Link to="/admin/projects">Advanced Project Management</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center py-6 sm:py-8">
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">Welcome to SLATE Admin</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4">Create your first project to get started</p>
            </div>
            <ProjectCreationDashboard />
          </div>
        )}
      </main>
    </div>
  );
}
