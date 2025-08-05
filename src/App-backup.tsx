import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Plus, X } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PersistentHeader } from '@/components/PersistentHeader';
import { AnimatedShotItem } from '@/components/AnimatedShotItem';
import { AuthComponent } from '@/components/AuthComponent';
import { AddShotForm } from '@/components/AddShotForm';
import type { User, Project, Checklist, ShotItem } from '@/types';

function App() {
  const { state, dispatch, currentProjectItems, currentProjectProgress, toggleShotCompletion } = useApp();
  const { registerServiceWorker } = usePWA();
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentView, setCurrentView] = useState<'shooter' | 'admin-dashboard' | 'admin-management'>('shooter');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = useCallback((user: User) => {
    setIsAuthenticated(true);
    dispatch({ type: 'SET_USER', payload: user });
    localStorage.setItem('slate-auth', JSON.stringify(user));
    
    // Set view based on user role
    setCurrentView(user.role === 'admin' ? 'admin-dashboard' : 'shooter');
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('slate-auth');
    localStorage.removeItem('slate-last-project');
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
  }, [dispatch]);

  const initializeDemoData = useCallback(() => {
    // Initialize demo data only if no data exists
    if (state.projects.length === 0) {
      // Demo projects
      const demoProjects: Project[] = [
        {
          id: 'project-sunburn',
          name: 'Sunburn Music Festival',
          description: 'Annual music festival coverage with multiple stages and zones',
          date: new Date(),
          status: 'active',
          createdBy: 'admin-siddhant',
          createdAt: new Date(),
          updatedAt: new Date(),
          assignments: [
            { userId: 'shooter-vittal', zone: 'Stage + Pit', assignedAt: new Date() },
            { userId: 'shooter-shravan', zone: 'GA + Sponsor Village', assignedAt: new Date() }
          ]
        }
      ];

      // Demo checklists
      const demoChecklists: Checklist[] = [
        {
          id: 'checklist-main-stage',
          projectId: 'project-sunburn',
          name: 'Main Stage Video',
          description: 'Essential video shots from the main stage area',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'checklist-crowd-photos',
          projectId: 'project-sunburn',
          name: 'Crowd & Atmosphere Photos',
          description: 'Capture the energy and atmosphere of the festival',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Demo shot items
      const demoShotItems: ShotItem[] = [
        {
          id: 'shot-1',
          checklistId: 'checklist-main-stage',
          title: 'Wide shot of headline artist entrance',
          type: 'video',
          priority: 'must-have',
          description: 'Use the 24-70mm lens. Hold for 15 seconds, capture the full stage lighting rig.',
          isCompleted: false,
          createdBy: 'admin-siddhant',
          isUserAdded: false,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'shot-2',
          checklistId: 'checklist-main-stage',
          title: 'Close-up of drummer during solo',
          type: 'video',
          priority: 'nice-to-have',
          description: 'Focus on hand movements and facial expressions',
          isCompleted: true,
          completedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          completedBy: 'shooter-vittal',
          createdBy: 'admin-siddhant',
          isUserAdded: false,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'shot-3',
          checklistId: 'checklist-crowd-photos',
          title: 'Crowd energy during main act',
          type: 'photo',
          priority: 'must-have',
          description: 'Capture hands in the air, dancing, excitement',
          isCompleted: true,
          completedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          completedBy: 'shooter-vittal',
          createdBy: 'admin-siddhant',
          isUserAdded: false,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'shot-4',
          checklistId: 'checklist-main-stage',
          title: 'Guitar/Bass duel closeup',
          type: 'video',
          priority: 'nice-to-have',
          description: 'Amazing unscripted moment - back-to-back guitar and bass solo',
          isCompleted: true,
          completedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          completedBy: 'shooter-vittal',
          createdBy: 'shooter-vittal',
          isUserAdded: true,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'shot-5',
          checklistId: 'checklist-main-stage',
          title: 'Stage lighting transition sequence',
          type: 'video',
          priority: 'must-have',
          description: 'Capture the full lighting rig transition between songs',
          isCompleted: false,
          createdBy: 'admin-siddhant',
          isUserAdded: false,
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'shot-6',
          checklistId: 'checklist-crowd-photos',
          title: 'VIP section atmosphere',
          type: 'photo',
          priority: 'nice-to-have',
          description: 'Capture the exclusive VIP area during peak performance',
          isCompleted: false,
          createdBy: 'admin-siddhant',
          isUserAdded: false,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      dispatch({ type: 'SET_PROJECTS', payload: demoProjects });
      dispatch({ type: 'SET_CHECKLISTS', payload: demoChecklists });
      dispatch({ type: 'SET_SHOT_ITEMS', payload: demoShotItems });
    }
  }, [state.projects.length, dispatch]);

  // Check for saved authentication on load
  useEffect(() => {
    const savedAuth = localStorage.getItem('slate-auth');
    if (savedAuth) {
      try {
        const user = JSON.parse(savedAuth);
        handleLogin(user);
      } catch {
        localStorage.removeItem('slate-auth');
      }
    }
    
    registerServiceWorker();
    initializeDemoData();
  }, [registerServiceWorker, handleLogin, initializeDemoData]);

  // Remember last project when user logs in
  useEffect(() => {
    if (!isAuthenticated || !state.user) return;

    const lastProjectId = localStorage.getItem('slate-last-project');
    if (lastProjectId && state.projects.length > 0) {
      const lastProject = state.projects.find(p => p.id === lastProjectId);
      if (lastProject) {
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: lastProject });
      }
    }
  }, [isAuthenticated, state.user, state.projects, dispatch]);

  // Show auth component if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AuthComponent onLogin={handleLogin} />
      </div>
    );
  }

  // Admin views
  if (state.user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <PersistentHeader 
          project={state.currentProject}
          user={state.user}
        />
        
        {/* Admin Navigation */}
        <div className="bg-white shadow-sm border-b pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'admin-dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('admin-management')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'admin-management'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Project Management
              </button>
              <button
                onClick={handleLogout}
                className="py-4 px-1 text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>

        <div className="pt-6">
          {currentView === 'admin-dashboard' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
              
              {/* Project Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{state.projects.length}</div>
                    <p className="text-xs text-gray-500">Active: {state.projects.filter(p => p.status === 'active').length}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Shots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{state.shotItems.length}</div>
                    <p className="text-xs text-gray-500">
                      Completed: {state.shotItems.filter(item => item.isCompleted).length}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Shooters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {state.projects.reduce((acc, p) => acc + p.assignments.length, 0)}
                    </div>
                    <p className="text-xs text-gray-500">Assigned to projects</p>
                  </CardContent>
                </Card>
              </div>

              {/* Current Project Details */}
              {state.currentProject && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Current Project: {state.currentProject.name}</CardTitle>
                    <CardDescription>{state.currentProject.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Progress Overview */}
                      <div>
                        <h4 className="font-semibold mb-3">Progress Overview</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Overall Progress</span>
                            <span>{Math.round(currentProjectProgress.percentage)}%</span>
                          </div>
                          <Progress value={currentProjectProgress.percentage} />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Total Shots:</span>
                              <span className="font-medium ml-2">{currentProjectProgress.total}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Completed:</span>
                              <span className="font-medium ml-2">{currentProjectProgress.completed}</span>
                            </div>
                            <div>
                              <span className="text-red-600">Must-Have:</span>
                              <span className="font-medium ml-2">{currentProjectProgress.completedMustHave}/{currentProjectProgress.mustHave}</span>
                            </div>
                            <div>
                              <span className="text-blue-600">Nice-to-Have:</span>
                              <span className="font-medium ml-2">{currentProjectProgress.completed - currentProjectProgress.completedMustHave}/{currentProjectProgress.total - currentProjectProgress.mustHave}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shooter Assignments */}
                      <div>
                        <h4 className="font-semibold mb-3">Shooter Assignments</h4>
                        <div className="space-y-2">
                          {state.currentProject.assignments.map((assignment, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{assignment.userId}</span>
                                <p className="text-sm text-gray-600">{assignment.zone}</p>
                              </div>
                              <Badge variant="outline">Active</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.shotItems
                      .filter(item => item.isCompleted && item.completedAt)
                      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div className="flex-1">
                            <span className="font-medium">{item.title}</span>
                            <p className="text-sm text-gray-600">
                              Completed by {item.completedBy} • {item.completedAt ? new Date(item.completedAt).toLocaleString() : ''}
                            </p>
                          </div>
                          {item.priority === 'must-have' && (
                            <Badge variant="destructive" className="text-xs">Must-Have</Badge>
                          )}
                        </div>
                      ))}
                    {state.shotItems.filter(item => item.isCompleted).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No completed shots yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {currentView === 'admin-management' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold mb-6">Project Management</h2>
              
              {/* Quick Create Project */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Project</CardTitle>
                  <CardDescription>Set up a new project with shooters and zones</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      const projectName = prompt('Enter project name:');
                      if (projectName) {
                        const newProject: Project = {
                          id: `project-${Date.now()}`,
                          name: projectName,
                          description: 'New project created by admin',
                          date: new Date(),
                          status: 'active',
                          createdBy: state.user!.id,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          assignments: []
                        };
                        dispatch({ type: 'ADD_PROJECT', payload: newProject });
                      }
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Project
                  </Button>
                </CardContent>
              </Card>
              
              {/* Existing Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>All Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-gray-600">{project.description}</p>
                          <p className="text-xs text-gray-500">
                            {project.assignments.length} shooters • Status: {project.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => dispatch({ type: 'SET_CURRENT_PROJECT', payload: project })}
                          >
                            View
                          </Button>
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Shooter view (main app functionality)
  return (
    <div className="min-h-screen bg-gray-50">
      <PersistentHeader 
        project={state.currentProject}
        user={state.user}
      />

      {/* Simple Logout Button for now */}
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-4 pt-20">
        {!state.currentProject ? (
          <div className="text-center py-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to SLATE
              </h1>
              <p className="text-xl text-gray-600">
                Professional Shot List And Tracking Environment
              </p>
            </div>

            {state.projects.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Select a Project</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {state.projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => {
                        dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
                        localStorage.setItem('slate-last-project', project.id);
                      }}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-gray-600">{project.description}</p>
                      <p className="text-sm text-gray-500">
                        Status: {project.status} | {project.assignments.length} shooters assigned
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8">
                <p className="text-gray-600">No projects available. Please contact your administrator.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{state.currentProject.name}</h1>
                  <p className="text-gray-600">{state.currentProject.description}</p>
                  <p className="text-sm text-gray-500">
                    Status: {state.currentProject.status} | {state.currentProject.assignments.length} shooters assigned
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'SET_CURRENT_PROJECT', payload: null })}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress Overview */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progress Overview</CardTitle>
                <CardDescription>
                  Overall completion: {currentProjectProgress.completed}/{currentProjectProgress.total} shots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(currentProjectProgress.percentage)}%</span>
                  </div>
                  <Progress value={currentProjectProgress.percentage} className="w-full" />
                </div>

                {currentProjectItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3">Recent Shots</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {currentProjectItems.slice(-3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className={`w-4 h-4 ${item.isCompleted ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={item.isCompleted ? 'line-through' : ''}>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Checklists and Shot Items */}
            <div className="space-y-6">
              {state.checklists
                .filter(checklist => checklist.projectId === state.currentProject?.id)
                .map((checklist) => {
                  const checklistItems = state.shotItems.filter(item => item.checklistId === checklist.id);
                  const pendingItems = checklistItems.filter(item => !item.isCompleted);
                  const completedItems = checklistItems.filter(item => item.isCompleted);
                  
                  return (
                    <Card key={checklist.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{checklist.name}</CardTitle>
                            <CardDescription className="mt-2">{checklist.description}</CardDescription>
                          </div>
                          <div className="text-sm text-gray-500">
                            {completedItems.length}/{checklistItems.length} completed
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Pending Shots */}
                        {pendingItems.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <h4 className="font-medium text-gray-900">Outstanding Shots</h4>
                            {pendingItems.map((item) => (
                              <AnimatedShotItem
                                key={item.id}
                                shot={item}
                                isCompleted={item.isCompleted}
                                onToggleComplete={() => toggleShotCompletion(item.id)}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Completed Shots - Collapsed Section */}
                        {completedItems.length > 0 && (
                          <div className="border-t pt-4">
                            <details className="group">
                              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
                                <span>✅ Completed Shots ({completedItems.length})</span>
                                <span className="transition-transform group-open:rotate-180">▼</span>
                              </summary>
                              <div className="mt-3 space-y-2">
                                {completedItems.map((item) => (
                                  <AnimatedShotItem
                                    key={item.id}
                                    shot={item}
                                    isCompleted={item.isCompleted}
                                    onToggleComplete={() => toggleShotCompletion(item.id)}
                                  />
                                ))}
                              </div>
                            </details>
                          </div>
                        )}
                        
                        {checklistItems.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p>No shots in this checklist yet.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

              {/* Add Shot Form */}
              {showAddForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Shot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddShotForm
                      checklistId={state.checklists.find(c => c.projectId === state.currentProject?.id)?.id || ''}
                      onClose={() => setShowAddForm(false)}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Add Shot Button */}
              <div className="flex justify-center">
                <Button onClick={() => setShowAddForm(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Shot
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
