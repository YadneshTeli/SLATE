import { useState } from 'react';
import { useApp } from '@/hooks/useApp';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageTransition, FadeIn, StaggeredList } from '@/components/animations/PageTransitions';
import { 
  Plus, 
  Calendar, 
  Users, 
  CheckSquare, 
  ArrowLeft,
  Camera,
  Video,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '@/utils';
import type { Project, Checklist, ShotItem } from '@/types';

export function AdminProjectsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
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

  const [shotForm, setShotForm] = useState({
    title: '',
    type: 'photo' as 'photo' | 'video',
    description: '',
    priority: 'nice-to-have' as 'must-have' | 'nice-to-have'
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

  const handleCreateShot = (checklistId: string) => {
    if (!shotForm.title.trim() || !state.user) return;

    const existingShots = state.shotItems.filter(s => s.checklistId === checklistId);
    const newOrder = existingShots.length;

    const newShot: ShotItem = {
      id: `shot-${Date.now()}`,
      title: shotForm.title,
      type: shotForm.type,
      description: shotForm.description,
      priority: shotForm.priority,
      checklistId,
      isCompleted: false,
      isUserAdded: false,
      createdBy: state.user.id,
      order: newOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    dispatch({ type: 'ADD_SHOT_ITEM', payload: newShot });
    setShotForm({ title: '', type: 'photo', description: '', priority: 'nice-to-have' });
    setShowCreateShot(null);
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
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0 min-h-[64px] sm:h-16 py-2 xs:py-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 touch-manipulation min-h-[36px]"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
              <h1 className="text-base sm:text-xl font-bold text-slate-900">Project Management</h1>
            </div>
            <Button
              onClick={() => setShowCreateProject(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full xs:w-auto touch-manipulation min-h-[44px] text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Create Project Form */}
        {showCreateProject && (
          <FadeIn className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Create New Project</CardTitle>
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
                    Create Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Projects List */}
        <div className="space-y-4 sm:space-y-6">
          <FadeIn>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">All Projects</h2>
            <p className="text-sm sm:text-base text-slate-600">Manage your projects, checklists, and shot lists</p>
          </FadeIn>

          {state.projects.length === 0 ? (
            <FadeIn delay={0.1}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <CheckSquare className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">No Projects Yet</h3>
                  <p className="text-sm sm:text-base text-slate-600 mb-4 text-center max-w-md px-4">
                    Create your first project to start organizing shot lists for your team
                  </p>
                  <Button
                    onClick={() => setShowCreateProject(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white touch-manipulation min-h-[44px]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ) : (
            <StaggeredList className="space-y-4 sm:space-y-6">
              {state.projects.map((project) => {
                const stats = getProjectStats(project.id);
                const checklists = getProjectChecklists(project.id);
                const isExpanded = selectedProject === project.id;

                return (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                        <div className="flex-1 w-full">
                          <CardTitle className="flex flex-col xs:flex-row items-start xs:items-center gap-2 text-base sm:text-lg">
                            <span className="break-words">{project.name}</span>
                            <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                              {stats.completedShots}/{stats.totalShots} shots
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm">
                            {project.description || 'No description provided'}
                          </CardDescription>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="truncate">{project.date ? formatDate(project.date) : 'No date set'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              {project.assignments.length} shooters
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProject(isExpanded ? null : project.id)}
                            className="w-full sm:w-auto touch-manipulation min-h-[36px]"
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 space-y-6">
                        {/* Create Checklist Button */}
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-slate-900">Checklists</h4>
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
                          <Card>
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
                                  >
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
                              <Card key={checklist.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="pt-6">
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h5 className="font-medium text-slate-900">{checklist.name}</h5>
                                      <p className="text-sm text-slate-600">{checklist.description}</p>
                                      <Badge variant="outline" className="mt-1">
                                        {completedShots}/{shots.length} completed
                                      </Badge>
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
                                    <Card className="mb-4">
                                      <CardContent className="pt-6">
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <Label htmlFor="shot-title">Shot Title *</Label>
                                              <Input
                                                id="shot-title"
                                                value={shotForm.title}
                                                onChange={(e) => setShotForm({ ...shotForm, title: e.target.value })}
                                                placeholder="e.g., Wide shot of headline artist entrance"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="shot-type">Type *</Label>
                                              <Select
                                                value={shotForm.type}
                                                onValueChange={(value: 'photo' | 'video') => 
                                                  setShotForm({ ...shotForm, type: value })
                                                }
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="photo">📷 Photo</SelectItem>
                                                  <SelectItem value="video">🎥 Video</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                          <div>
                                            <Label htmlFor="shot-priority">Priority</Label>
                                            <Select
                                              value={shotForm.priority}
                                              onValueChange={(value: 'must-have' | 'nice-to-have') => 
                                                setShotForm({ ...shotForm, priority: value })
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="must-have">🔴 Must-Have</SelectItem>
                                                <SelectItem value="nice-to-have">⚪ Nice-to-Have</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <Label htmlFor="shot-description">Description</Label>
                                            <Textarea
                                              id="shot-description"
                                              value={shotForm.description}
                                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setShotForm({ ...shotForm, description: e.target.value })}
                                              placeholder="e.g., Use the 24-70mm lens. Hold for 15 seconds, capture the full stage lighting rig."
                                              rows={3}
                                            />
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="outline"
                                              onClick={() => setShowCreateShot(null)}
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={() => handleCreateShot(checklist.id)}
                                              disabled={!shotForm.title.trim()}
                                            >
                                              Create Shot
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Shots List */}
                                  <div className="space-y-2">
                                    {shots.map((shot) => (
                                      <div
                                        key={shot.id}
                                        className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50"
                                      >
                                        <div className="flex items-center gap-2">
                                          {shot.priority === 'must-have' && (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
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
                                            {shot.isCompleted ? "Completed" : "Pending"}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                    {shots.length === 0 && (
                                      <p className="text-center text-slate-500 py-4">
                                        No shots added yet. Click "Add Shot" to get started.
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                          {checklists.length === 0 && (
                            <p className="text-center text-slate-500 py-4">
                              No checklists created yet. Click "Add Checklist" to get started.
                            </p>
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
      </main>
    </PageTransition>
  );
}
