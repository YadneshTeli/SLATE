import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { PersistentHeader } from '@/components/PersistentHeader';
import { AddShotForm } from '@/components/AddShotForm';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTransition, FadeIn, StaggeredList } from '@/components/animations/PageTransitions';
import { Plus, ChevronDown, ChevronUp, AlertCircle, Camera, Video, User, FolderOpen, LayoutDashboard, LogOut } from 'lucide-react';
import type { Project } from '@/types';

export function ShooterProjectPage() {
  const { state, setCurrentProject, getAssignedProjects, toggleShotCompletion } = useApp();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState<string | false>(false);
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Get current project from context
  const currentProject = state.currentProject;
  
  // Get all projects assigned to this user - memoized to prevent infinite loops
  const assignedProjects = useMemo(() => {
    return state.user ? getAssignedProjects(state.user.id) : [];
  }, [state.user, getAssignedProjects]);
  
  // Debug logging - removed assignedProjects from dependency to avoid loop
  useEffect(() => {
    console.log('🔍 [ShooterProjectPage] Debug Info:');
    console.log('  - User:', state.user);
    console.log('  - All Projects:', state.projects);
    console.log('  - Assigned Projects:', assignedProjects);
    console.log('  - Current Project:', currentProject);
    
    if (state.projects.length > 0) {
      console.log('  - Sample Project Structure:', state.projects[0]);
      console.log('  - Sample Project Assignments:', state.projects[0].assignments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user, state.projects, currentProject]);
  
  // Get checklists for current project
  const projectChecklists = state.checklists.filter(checklist => 
    checklist.projectId === currentProject?.id
  );

  // Initialize expandedChecklists with all checklist IDs (all expanded by default)
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());

  // Update expanded checklists when project changes - expand all by default
  useEffect(() => {
    if (projectChecklists.length > 0) {
      setExpandedChecklists(new Set(projectChecklists.map(c => c.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id]); // Only depend on project ID, not the entire array

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/shooter/dashboard');
  };

  const handleToggleCompletion = async (itemId: string) => {
    try {
      // Find the shot to determine toggle direction
      const shot = state.shotItems.find(item => item.id === itemId);
      const action = shot?.isCompleted ? 'unchecked' : 'checked';
      
      await toggleShotCompletion(itemId);
      console.log(`✅ Shot ${action}:`, itemId);
    } catch (error) {
      console.error('❌ Error toggling shot completion:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
  };

  // Get shot items organized by checklist
  const getChecklistShots = (checklistId: string) => {
    return state.shotItems.filter(item => item.checklistId === checklistId);
  };

  // Get total stats
  const allProjectShots = state.shotItems.filter(item => {
    const checklist = state.checklists.find(c => c.id === item.checklistId);
    return checklist && checklist.projectId === currentProject?.id;
  });
  const completedShots = allProjectShots.filter(item => item.isCompleted);

  const toggleChecklist = (checklistId: string) => {
    const newExpanded = new Set(expandedChecklists);
    if (newExpanded.has(checklistId)) {
      newExpanded.delete(checklistId);
    } else {
      newExpanded.add(checklistId);
    }
    setExpandedChecklists(newExpanded);
  };

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Persistent Header */}
      <PersistentHeader 
        project={currentProject}
      />

      {/* Main Content */}
      <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-24 sm:pb-28">
        {/* User Info & Project Selector */}
        <FadeIn>
          {/* Mobile-optimized header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Welcome, {state.user?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                <p className="text-sm sm:text-base text-slate-600 font-medium">
                  {completedShots.length} / {allProjectShots.length} Completed
                </p>
                {assignedProjects.length > 1 && (
                  <button
                    onClick={() => setCurrentProject(null)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline active:text-blue-900 touch-manipulation"
                  >
                    Switch Project ({assignedProjects.length})
                  </button>
                )}
              </div>
            </div>
            {/* Desktop-only buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {allProjectShots.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  {Math.round((completedShots.length / allProjectShots.length) * 100)}%
                </span>
              </div>
              <Progress 
                value={(completedShots.length / allProjectShots.length) * 100} 
                className="h-3 sm:h-4"
              />
            </div>
          )}
        </FadeIn>

        {!currentProject ? (
          <FadeIn delay={0.2}>
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                {assignedProjects.length > 0 ? (
                  // User has assigned projects but none selected
                  <div>
                    <div className="mb-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <FolderOpen className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Select a Project</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        You have been assigned to {assignedProjects.length} project{assignedProjects.length !== 1 ? 's' : ''}. 
                        Choose one to get started:
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {assignedProjects.map(project => {
                        const myAssignment = project.assignments.find(a => a.userId === state.user?.id);
                        return (
                          <button
                            key={project.id}
                            onClick={() => handleProjectSelect(project)}
                            className="w-full p-4 sm:p-5 border-2 border-gray-200 rounded-lg hover:border-blue-300 active:border-blue-400 hover:bg-blue-50 active:bg-blue-100 transition-colors text-left touch-manipulation min-h-[80px] sm:min-h-[auto]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{project.name}</h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                                {myAssignment && myAssignment.zones && myAssignment.zones.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    <span className="text-xs text-blue-600 font-medium">Your zones: </span>
                                    {myAssignment.zones.map(zone => (
                                      <Badge key={zone} variant="outline" className="text-xs">
                                        {zone}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-xl sm:text-2xl flex-shrink-0">→</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // User has no assigned projects
                  <div>
                    <div className="mb-6">
                      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Project Assigned</h3>
                      <p className="text-gray-600 mb-4">
                        You haven't been assigned to any projects yet. Please contact your admin to get assigned to a project.
                      </p>
                    </div>
                    
                    {/* Show available projects info for transparency */}
                    {state.projects.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>{state.projects.length}</strong> project{state.projects.length !== 1 ? 's' : ''} available. 
                          Your admin can assign you to:
                        </p>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          {state.projects.slice(0, 3).map(project => (
                            <li key={project.id} className="flex items-center">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                              {project.name}
                            </li>
                          ))}
                          {state.projects.length > 3 && (
                            <li className="text-blue-600">...and {state.projects.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        ) : (
          <div className="space-y-6">
            {/* Checklists organized view */}
            {projectChecklists.map((checklist) => {
              const checklistShots = getChecklistShots(checklist.id);
              const pendingShots = checklistShots.filter(shot => !shot.isCompleted);
              const completedChecklistShots = checklistShots.filter(shot => shot.isCompleted);
              const isExpanded = expandedChecklists.has(checklist.id);
              const showAddFormForChecklist = showAddForm === checklist.id;

              return (
                <FadeIn key={checklist.id} delay={0.1}>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    {/* Checklist Header - Mobile optimized */}
                    <div 
                      className="p-3 sm:p-4 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors touch-manipulation"
                      onClick={() => toggleChecklist(checklist.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="flex items-center space-x-1 flex-1 min-w-0">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 flex-shrink-0" />
                            )}
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                              📋 {checklist.name}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            {completedChecklistShots.length}/{checklistShots.length}
                          </Badge>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddForm(showAddFormForChecklist ? false : checklist.id);
                            }}
                            size="sm"
                            variant={showAddFormForChecklist ? "outline" : "default"}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white touch-manipulation min-h-[36px] sm:min-h-[auto]"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">Add Shot</span>
                          </Button>
                        </div>
                      </div>
                      {checklist.description && (
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 ml-6 sm:ml-7">{checklist.description}</p>
                      )}
                    </div>

                    {/* Add Shot Form */}
                    {showAddFormForChecklist && (
                      <div className="px-4 pb-4 border-t bg-slate-50">
                        <div className="pt-4">
                          <AddShotForm
                            checklistId={checklist.id}
                            onClose={() => setShowAddForm(false)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Shots List */}
                    {isExpanded && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
                        {/* Pending Shots */}
                        {pendingShots.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                              📋 Pending ({pendingShots.length})
                            </h4>
                            <StaggeredList className="space-y-2 sm:space-y-3">
                              {pendingShots.map((shot) => (
                                <div key={shot.id} className="relative">
                                  {/* Must-Have Priority Indicator */}
                                  {shot.priority === 'must-have' && (
                                    <div className="absolute -left-1 sm:-left-2 top-1/2 transform -translate-y-1/2 z-10">
                                      <AlertCircle className="h-6 w-6 sm:h-5 sm:w-5 text-red-500 animate-pulse" />
                                    </div>
                                  )}
                                  <div className={shot.priority === 'must-have' ? 'ml-5 sm:ml-4' : ''}>
                                    {/* Mobile-optimized shot item with larger touch targets */}
                                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 active:border-blue-400 transition-colors touch-manipulation min-h-[72px] sm:min-h-[auto]">
                                      {/* Larger checkbox for mobile (44x44px minimum) */}
                                      <button
                                        onClick={() => handleToggleCompletion(shot.id)}
                                        className="flex-shrink-0 w-8 h-8 sm:w-6 sm:h-6 border-2 border-slate-300 rounded hover:border-blue-500 active:border-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors touch-manipulation flex items-center justify-center"
                                        aria-label={`Mark ${shot.title} as complete`}
                                      />
                                      <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
                                        {shot.type === 'video' ? (
                                          <Video className="h-5 w-5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                                        ) : (
                                          <Camera className="h-5 w-5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm sm:text-base text-slate-900 break-words">{shot.title}</span>
                                            {shot.isUserAdded && (
                                              <div title="User-added shot" className="flex-shrink-0">
                                                <User className="h-4 w-4 text-blue-500" />
                                              </div>
                                            )}
                                          </div>
                                          {shot.description && (
                                            <p className="text-xs sm:text-sm text-slate-600 mt-1 break-words">{shot.description}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </StaggeredList>
                          </div>
                        )}

                        {/* Completed Shots - Collapsed by default */}
                        {completedChecklistShots.length > 0 && (
                          <div>
                            <button
                              onClick={() => setShowCompleted(!showCompleted)}
                              className="w-full text-left p-2 rounded hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
                            >
                              <h4 className="text-sm font-semibold text-slate-500 flex items-center justify-between hover:text-slate-700 transition-colors">
                                <span className="flex items-center gap-1">
                                  ✅ Completed ({completedChecklistShots.length})
                                </span>
                                {showCompleted ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </h4>
                            </button>
                            {showCompleted && (
                              <StaggeredList className="space-y-2 sm:space-y-3 opacity-75 mt-2">
                                {completedChecklistShots.map((shot) => (
                                  <div key={shot.id} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg touch-manipulation">
                                    <div className="flex-shrink-0 w-6 h-6 sm:w-5 sm:h-5 bg-green-500 rounded flex items-center justify-center">
                                      <svg className="h-4 w-4 sm:h-3 sm:w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
                                      {shot.type === 'video' ? (
                                        <Video className="h-5 w-5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                                      ) : (
                                        <Camera className="h-5 w-5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-medium text-sm sm:text-base text-slate-700 line-through break-words">{shot.title}</span>
                                          {shot.isUserAdded && (
                                            <div title="User-added shot" className="flex-shrink-0">
                                              <User className="h-4 w-4 text-blue-500" />
                                            </div>
                                          )}
                                        </div>
                                        {shot.description && (
                                          <p className="text-xs sm:text-sm text-slate-500 mt-1 break-words">{shot.description}</p>
                                        )}
                                        {shot.completedAt && (
                                          <p className="text-xs text-green-600 mt-1">
                                            Completed at {new Date(shot.completedAt).toLocaleTimeString()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </StaggeredList>
                            )}
                          </div>
                        )}

                        {checklistShots.length === 0 && (
                          <div className="text-center py-6 text-slate-500">
                            <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No shots in this checklist yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}

            {projectChecklists.length === 0 && (
              <FadeIn delay={0.2}>
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Checklists Available</h3>
                  <p className="text-slate-600">Your admin hasn't created any checklists yet</p>
                </div>
              </FadeIn>
          )}
        </div>
      )}
      </main>

      {/* Mobile-only bottom navigation bar for quick actions */}
      {currentProject && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40 safe-area-inset-bottom">
          <div className="flex items-center justify-around p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex flex-col items-center gap-1 h-auto py-2 px-3 touch-manipulation"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-xs">Dashboard</span>
            </Button>
            
            <div className="h-8 w-px bg-slate-200"></div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 h-auto py-2 px-3 touch-manipulation"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs">Logout</span>
            </Button>
          </div>
        </div>
      )}
    </PageTransition>
  );
}