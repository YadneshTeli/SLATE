import { useState, useEffect } from 'react';
import { useApp } from '@/hooks/useApp';
import { PersistentHeader } from '@/components/PersistentHeader';
import { AddShotForm } from '@/components/AddShotForm';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTransition, FadeIn, StaggeredList } from '@/components/animations/PageTransitions';
import { Plus, ChevronDown, ChevronUp, AlertCircle, Camera, Video, User, FolderOpen } from 'lucide-react';
import type { Project } from '@/types';

export function ShooterProjectPage() {
  const { state, dispatch, setCurrentProject, getAssignedProjects } = useApp();
  const [showAddForm, setShowAddForm] = useState<string | false>(false);
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('slateUser');
    localStorage.clear(); // Clear all localStorage to reset demo data
    window.location.reload();
  };

  const handleToggleCompletion = (itemId: string) => {
    if (state.user) {
      dispatch({ 
        type: 'TOGGLE_SHOT_COMPLETION', 
        payload: { id: itemId, userId: state.user.id } 
      });
    }
  };

  // Get current project from context - this will be set by AppContext based on admin assignments
  const currentProject = state.currentProject;
  
  // Get all projects assigned to this user
  const assignedProjects = state.user ? getAssignedProjects(state.user.id) : [];

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
  };

  // Save current project as last-viewed when it changes (only if user is assigned by admin)
  useEffect(() => {
    if (currentProject && state.user?.role === 'shooter') {
      // Verify user is actually assigned to this project by admin
      const isAssigned = currentProject.assignments.some(a => a.userId === state.user!.id);
      if (isAssigned) {
        console.log('Accessing assigned project - saving as last-viewed:', currentProject.name);
        // The setCurrentProject function in AppContext already handles localStorage persistence
      } else {
        console.warn('User not assigned to current project - clearing selection');
        setCurrentProject(null);
      }
    }
  }, [currentProject, state.user, setCurrentProject]);

  // Get checklists for current project
  const projectChecklists = state.checklists.filter(checklist => 
    checklist.projectId === currentProject?.id
  );

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
      <main className="px-4 py-6 pb-24">
        {/* User Info & Project Selector */}
        <FadeIn>
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">
                Welcome, {state.user?.name}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-slate-600">
                  {completedShots.length} / {allProjectShots.length} Completed
                </p>
                {assignedProjects.length > 1 && (
                  <button
                    onClick={() => setCurrentProject(null)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Switch Project ({assignedProjects.length} assigned)
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Progress Bar */}
          {allProjectShots.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <span className="text-sm font-bold text-slate-900">
                  {Math.round((completedShots.length / allProjectShots.length) * 100)}%
                </span>
              </div>
              <Progress 
                value={(completedShots.length / allProjectShots.length) * 100} 
                className="h-3"
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
                      <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <FolderOpen className="h-12 w-12 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Project</h3>
                      <p className="text-gray-600 mb-4">
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
                            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                                {myAssignment && myAssignment.zones && myAssignment.zones.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs text-blue-600 font-medium">Your zones: </span>
                                    {myAssignment.zones.map(zone => (
                                      <Badge key={zone} variant="outline" className="ml-1 text-xs">
                                        {zone}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-2xl">→</div>
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
                    {/* Checklist Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleChecklist(checklist.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-slate-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-slate-500" />
                            )}
                            <h3 className="text-lg font-semibold text-slate-900">
                              📋 {checklist.name}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {completedChecklistShots.length}/{checklistShots.length} completed
                          </Badge>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddForm(showAddFormForChecklist ? false : checklist.id);
                            }}
                            size="sm"
                            variant={showAddFormForChecklist ? "outline" : "default"}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Shot
                          </Button>
                        </div>
                      </div>
                      {checklist.description && (
                        <p className="text-sm text-slate-600 mt-1">{checklist.description}</p>
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
                      <div className="px-4 pb-4 space-y-3">
                        {/* Pending Shots */}
                        {pendingShots.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                              📋 Pending ({pendingShots.length})
                            </h4>
                            <StaggeredList className="space-y-2">
                              {pendingShots.map((shot) => (
                                <div key={shot.id} className="relative">
                                  {/* Must-Have Priority Indicator */}
                                  {shot.priority === 'must-have' && (
                                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10">
                                      <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
                                    </div>
                                  )}
                                  <div className={shot.priority === 'must-have' ? 'ml-4' : ''}>
                                    <div className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                                      <button
                                        onClick={() => handleToggleCompletion(shot.id)}
                                        className="flex-shrink-0 w-5 h-5 border-2 border-slate-300 rounded hover:border-blue-500 transition-colors"
                                      />
                                      <div className="flex items-center space-x-2 flex-1">
                                        {shot.type === 'video' ? (
                                          <Video className="h-4 w-4 text-blue-500" />
                                        ) : (
                                          <Camera className="h-4 w-4 text-green-500" />
                                        )}
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <span className="font-medium text-slate-900">{shot.title}</span>
                                            {shot.isUserAdded && (
                                              <div title="User-added shot">
                                                <User className="h-4 w-4 text-blue-500" />
                                              </div>
                                            )}
                                          </div>
                                          {shot.description && (
                                            <p className="text-sm text-slate-600 mt-1">{shot.description}</p>
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
                              className="w-full text-left"
                            >
                              <h4 className="text-sm font-semibold text-slate-500 mb-3 flex items-center justify-between hover:text-slate-700 transition-colors">
                                <span className="flex items-center">
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
                              <StaggeredList className="space-y-2 opacity-75">
                                {completedChecklistShots.map((shot) => (
                                  <div key={shot.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-1">
                                      {shot.type === 'video' ? (
                                        <Video className="h-4 w-4 text-blue-500" />
                                      ) : (
                                        <Camera className="h-4 w-4 text-green-500" />
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-slate-700 line-through">{shot.title}</span>
                                          {shot.isUserAdded && (
                                            <div title="User-added shot">
                                              <User className="h-4 w-4 text-blue-500" />
                                            </div>
                                          )}
                                        </div>
                                        {shot.description && (
                                          <p className="text-sm text-slate-500 mt-1">{shot.description}</p>
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
    </PageTransition>
  );
}
