import { useState } from 'react';
import { useApp } from '@/hooks/useApp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FadeIn, StaggeredList } from '@/components/animations/PageTransitions';
import { AddShotForm } from '@/components/AddShotForm';
import { 
  Plus, 
  Calendar, 
  Users, 
  CheckSquare, 
  Camera,
  Video,
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { formatDate } from '@/utils';
import type { Project, Checklist } from '@/types';

export function ProjectCreationDashboard() {
  const { state, dispatch } = useApp();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateChecklist, setShowCreateChecklist] = useState<string | null>(null);
  const [showCreateShot, setShowCreateShot] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Form states
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    date: ''
  });

  const [checklistForm, setChecklistForm] = useState({
    name: '',
    description: ''
  });

  const handleCreateProject = () => {
    if (!projectForm.name.trim() || !state.user) return;

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: projectForm.name,
      description: projectForm.description,
      date: projectForm.date ? new Date(projectForm.date) : new Date(),
      status: 'active',
      createdBy: state.user.id,
      assignments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    setProjectForm({ name: '', description: '', date: '' });
    setShowCreateProject(false);
  };

  const handleCreateChecklist = (projectId: string) => {
    if (!checklistForm.name.trim()) return;

    const existingChecklists = state.checklists.filter(c => c.projectId === projectId);
    const newOrder = existingChecklists.length;

    const newChecklist: Checklist = {
      id: `checklist-${Date.now()}`,
      name: checklistForm.name,
      description: checklistForm.description,
      projectId,
      order: newOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    dispatch({ type: 'ADD_CHECKLIST', payload: newChecklist });
    setChecklistForm({ name: '', description: '' });
    setShowCreateChecklist(null);
  };

  const getProjectChecklists = (projectId: string) => {
    return state.checklists.filter(checklist => checklist.projectId === projectId);
  };

  const getChecklistShots = (checklistId: string) => {
    return state.shotItems.filter(shot => shot.checklistId === checklistId);
  };

  const getProjectStats = (projectId: string) => {
    const checklists = getProjectChecklists(projectId);
    const totalShots = checklists.reduce((total, checklist) => {
      return total + getChecklistShots(checklist.id).length;
    }, 0);
    const completedShots = checklists.reduce((total, checklist) => {
      return total + getChecklistShots(checklist.id).filter(shot => shot.isCompleted).length;
    }, 0);

    return { totalShots, completedShots, checklists: checklists.length };
  };

  return (
    <div className="space-y-6">
      {/* Create Project Button */}
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Project Creation & Management</h3>
            <p className="text-sm text-slate-600">Create projects, add checklists, and manage shot lists</p>
          </div>
          {!showCreateProject && (
            <Button
              onClick={() => setShowCreateProject(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      </FadeIn>

      {/* Create Project Form */}
      {showCreateProject && (
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Create New Project
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateProject(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Set up a new project for your team to work on
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="e.g., Sunburn Music Festival"
                  />
                </div>
                <div>
                  <Label htmlFor="project-date">Event Date</Label>
                  <Input
                    id="project-date"
                    type="date"
                    value={projectForm.date}
                    onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={projectForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Brief description of the project"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateProject(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={!projectForm.name.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {state.projects.length === 0 ? (
          <FadeIn>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckSquare className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Projects Yet</h3>
                <p className="text-slate-600 mb-4 text-center max-w-md">
                  Create your first project to start organizing shot lists for your team
                </p>
                <Button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <StaggeredList className="space-y-4">
            {state.projects.map((project) => {
              const stats = getProjectStats(project.id);
              const checklists = getProjectChecklists(project.id);
              const isExpanded = selectedProject === project.id;

              return (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {project.name}
                          <Badge variant="outline" className="text-xs">
                            {stats.completedShots}/{stats.totalShots} shots
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {project.description || 'No description provided'}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(project.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {project.assignments.length} shooters
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckSquare className="w-4 h-4" />
                            {stats.checklists} checklists
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProject(isExpanded ? null : project.id)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          {isExpanded ? 'Collapse' : 'Manage'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 space-y-6">
                      {/* Create Checklist Button */}
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-slate-900">Checklists & Shot Lists</h4>
                        <Button
                          size="sm"
                          onClick={() => setShowCreateChecklist(project.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Checklist
                        </Button>
                      </div>

                      {/* Create Checklist Form */}
                      {showCreateChecklist === project.id && (
                        <Card className="border-green-200 bg-green-50">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="checklist-name">Checklist Name *</Label>
                                <Input
                                  id="checklist-name"
                                  value={checklistForm.name}
                                  onChange={(e) => setChecklistForm({ ...checklistForm, name: e.target.value })}
                                  placeholder="e.g., Main Stage Video"
                                />
                              </div>
                              <div>
                                <Label htmlFor="checklist-description">Description</Label>
                                <Input
                                  id="checklist-description"
                                  value={checklistForm.description}
                                  onChange={(e) => setChecklistForm({ ...checklistForm, description: e.target.value })}
                                  placeholder="Brief description of this checklist"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowCreateChecklist(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleCreateChecklist(project.id)}
                                  disabled={!checklistForm.name.trim()}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Create Checklist
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Checklists */}
                      <div className="space-y-4">
                        {checklists.map((checklist) => {
                          const shots = getChecklistShots(checklist.id);
                          const completedShots = shots.filter(shot => shot.isCompleted).length;

                          return (
                            <Card key={checklist.id} className="border-l-4 border-l-blue-500 bg-blue-50/50">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h5 className="font-medium text-slate-900 flex items-center gap-2">
                                      📋 {checklist.name}
                                      <Badge variant="outline" className="text-xs">
                                        {completedShots}/{shots.length} completed
                                      </Badge>
                                    </h5>
                                    <p className="text-sm text-slate-600">{checklist.description}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => setShowCreateShot(checklist.id)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Shot
                                  </Button>
                                </div>

                                {/* Create Shot Form */}
                                {showCreateShot === checklist.id && (
                                  <div className="mb-4">
                                    <AddShotForm
                                      checklistId={checklist.id}
                                      onClose={() => setShowCreateShot(null)}
                                    />
                                  </div>
                                )}

                                {/* Shots List */}
                                <div className="space-y-2">
                                  {shots.map((shot) => (
                                    <div
                                      key={shot.id}
                                      className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        {shot.priority === 'must-have' && (
                                          <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                                        )}
                                        {shot.type === 'video' ? (
                                          <Video className="h-4 w-4 text-blue-500" />
                                        ) : (
                                          <Camera className="h-4 w-4 text-green-500" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-900">{shot.title}</p>
                                        {shot.description && (
                                          <p className="text-sm text-slate-600">{shot.description}</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          variant={shot.isCompleted ? "default" : "secondary"}
                                          className={shot.isCompleted ? "bg-green-500" : ""}
                                        >
                                          {shot.isCompleted ? "✓ Completed" : "○ Pending"}
                                        </Badge>
                                        {shot.priority === 'must-have' && (
                                          <Badge variant="destructive" className="text-xs">
                                            Must-Have
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {shots.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                                      <Camera className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                      <p className="text-slate-500 text-sm">
                                        No shots added yet. Click "Add Shot" to get started.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                        {checklists.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                            <CheckSquare className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">
                              No checklists created yet. Click "Add Checklist" to get started.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </StaggeredList>
        )}
      </div>
    </div>
  );
}
