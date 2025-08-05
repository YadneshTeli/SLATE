import { useApp } from '@/hooks/useApp';
import { Link } from 'react-router-dom';
import { EnhancedAdminDashboard } from '@/components/EnhancedAdminDashboard';
import { TeamProgressDashboard } from '@/components/TeamProgressDashboard';
import { UserManagement } from '@/components/UserManagement';
import { ProjectCreationDashboard } from '@/components/ProjectCreationDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { initializeDemoData } from '@/utils/demoData';

export function AdminDashboardPage() {
  const { state, dispatch } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Initialize demo data if no projects exist
    if (state.projects.length === 0) {
      const userId = JSON.parse(localStorage.getItem('slateUser') || '{}').id || 'admin';
      const demoData = initializeDemoData(userId);
      
      // Load demo projects
      demoData.projects.forEach(project => {
        dispatch({ type: 'ADD_PROJECT', payload: project });
      });
      
      // Load demo checklists
      demoData.checklists.forEach(checklist => {
        dispatch({ type: 'ADD_CHECKLIST', payload: checklist });
      });
      
      // Load demo shot items
      demoData.shotItems.forEach(shotItem => {
        dispatch({ type: 'ADD_SHOT_ITEM', payload: shotItem });
      });
    }

    // GSAP animation for page load
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [state.projects.length, dispatch]);

  const handleLogout = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        localStorage.removeItem('slateUser');
        window.location.reload();
      }
    });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-slate-900">SLATE Admin</h1>
              <span className="text-sm text-slate-500">
                Welcome, {state.user?.name}
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                to="/admin/projects"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Project Management
              </Link>
              <button
                onClick={handleLogout}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
          <p className="text-slate-600">Monitor project progress and team performance</p>
        </div>

        {currentProject ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="team">Team Progress</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="projects">Project Management</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
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
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-slate-900 mb-2">Project Settings</h3>
                <p className="text-slate-600 mb-4">Configure project details and preferences</p>
                <Button asChild>
                  <Link to="/admin/projects">Advanced Project Management</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Welcome to SLATE Admin</h3>
              <p className="text-slate-600 mb-4">Create your first project to get started</p>
            </div>
            <ProjectCreationDashboard />
          </div>
        )}
      </main>
    </div>
  );
}
