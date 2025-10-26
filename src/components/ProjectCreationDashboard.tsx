import { useState, useEffect } from 'react';
import { useApp } from '@/hooks/useApp';
import { projectService, checklistService, shotItemService, userService } from '@/lib/realtimeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  X,
  UserPlus,
  Trash2
} from 'lucide-react';
import { formatDate } from '@/utils';
import type { Project, Checklist, ProjectAssignment, ShotItem, User } from '@/types';

export function ProjectCreationDashboard() {
  const { state, dispatch } = useApp();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [availableShooters, setAvailableShooters] = useState<User[]>([]);
  const [showCreateChecklist, setShowCreateChecklist] = useState<string | null>(null);
  const [showCreateShot, setShowCreateShot] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit states
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<string | null>(null);
  const [editingShot, setEditingShot] = useState<string | null>(null);
  const [editProjectForm, setEditProjectForm] = useState<{ name: string; description: string; date: string }>({ name: '', description: '', date: '' });
  const [editChecklistForm, setEditChecklistForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [editShotForm, setEditShotForm] = useState<{ title: string; description: string; type: 'photo' | 'video'; priority: 'must-have' | 'nice-to-have' }>({ title: '', description: '', type: 'photo', priority: 'nice-to-have' });
  
  // Shooter management states
  const [managingShooters, setManagingShooters] = useState<string | null>(null);
  const [projectShooters, setProjectShooters] = useState<string[]>([]);
  const [projectZones, setProjectZones] = useState<Record<string, string>>({});
  
  // For new project creation - track checklists being added
  const [showAddChecklistToNew, setShowAddChecklistToNew] = useState(false);
  const [showAddShotToChecklist, setShowAddShotToChecklist] = useState<string | null>(null);

  // Form states
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    date: '',
    selectedShooters: [] as string[] // Array of shooter IDs
  });

  const [shooterZones, setShooterZones] = useState<Record<string, string>>({});
  
  // Checklists and shots for the new project
  const [projectChecklists, setProjectChecklists] = useState<Array<{
    id: string;
    name: string;
    description: string;
    shots: Array<{
      id: string;
      title: string;
      description: string;
      type: 'photo' | 'video';
      priority: 'must-have' | 'nice-to-have';
    }>;
  }>>([]);

  const [checklistForm, setChecklistForm] = useState({
    name: '',
    description: ''
  });

  // Load projects and shooters from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('📥 Loading data from Firebase...');
        
        // Load all users and filter shooters
        try {
          const users = await userService.getAll();
          const shooters = users.filter((user: User) => user.role === 'shooter');
          setAvailableShooters(shooters);
          console.log(`✅ Loaded ${shooters.length} shooter(s) from Firebase`);
        } catch (userError) {
          console.warn('⚠️ Could not load users from Firebase:', userError);
          setAvailableShooters([]);
        }
        
        // Note: Projects, checklists, and shot items are now loaded in AppContext
        // This component only needs to load users for assignment purposes
        console.log('✅ ProjectCreationDashboard data loaded');
      } catch (error) {
        console.error('❌ Error loading data from Firebase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleShooter = (shooterId: string) => {
    setProjectForm(prev => ({
      ...prev,
      selectedShooters: prev.selectedShooters.includes(shooterId)
        ? prev.selectedShooters.filter(id => id !== shooterId)
        : [...prev.selectedShooters, shooterId]
    }));
  };
  
  const addChecklistToProject = () => {
    if (!checklistForm.name.trim()) return;
    
    const newChecklist = {
      id: `temp-checklist-${Date.now()}`,
      name: checklistForm.name,
      description: checklistForm.description,
      shots: []
    };
    
    setProjectChecklists([...projectChecklists, newChecklist]);
    setChecklistForm({ name: '', description: '' });
    setShowAddChecklistToNew(false);
  };
  
  const removeChecklistFromProject = (checklistId: string) => {
    setProjectChecklists(projectChecklists.filter(c => c.id !== checklistId));
  };
  
  const handleAddShotToChecklist = (checklistId: string, shotData: {
    title: string;
    description: string;
    type: 'photo' | 'video';
    priority: 'must-have' | 'nice-to-have';
  }) => {
    const newShot = {
      id: `temp-shot-${Date.now()}`,
      ...shotData
    };
    
    setProjectChecklists(projectChecklists.map(checklist =>
      checklist.id === checklistId
        ? { ...checklist, shots: [...checklist.shots, newShot] }
        : checklist
    ));
  };
  
  const removeShotFromChecklist = (checklistId: string, shotId: string) => {
    setProjectChecklists(projectChecklists.map(checklist =>
      checklist.id === checklistId
        ? { ...checklist, shots: checklist.shots.filter(s => s.id !== shotId) }
        : checklist
    ));
  };

  const handleCreateProject = async () => {
    if (!projectForm.name.trim() || !state.user) return;

    try {
      // Create assignments from selected shooters
      const assignments: ProjectAssignment[] = projectForm.selectedShooters.map(shooterId => ({
        userId: shooterId,
        zone: shooterZones[shooterId] || undefined,
        assignedAt: new Date()
      }));

      const newProject: Omit<Project, 'id'> = {
        name: projectForm.name,
        description: projectForm.description,
        date: projectForm.date ? new Date(projectForm.date) : new Date(),
        status: 'active',
        createdBy: state.user.id,
        assignments,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save project to Firebase
      const projectId = await projectService.create(newProject);
      console.log('✅ Project created in Firebase:', projectId);

      // Add to local state
      dispatch({ type: 'ADD_PROJECT', payload: { ...newProject, id: projectId } });
      
      // Create checklists and shots in Firebase
      for (let index = 0; index < projectChecklists.length; index++) {
        const checklist = projectChecklists[index];
        
        const newChecklist: Omit<Checklist, 'id'> = {
          name: checklist.name,
          description: checklist.description,
          projectId: projectId,
          order: index,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Save checklist to Firebase
        const checklistId = await checklistService.create(newChecklist);
        console.log('✅ Checklist created in Firebase:', checklistId);
        
        // Add to local state
        dispatch({ type: 'ADD_CHECKLIST', payload: { ...newChecklist, id: checklistId } });
        
        // Add shots to this checklist
        for (let shotIndex = 0; shotIndex < checklist.shots.length; shotIndex++) {
          const shot = checklist.shots[shotIndex];
          
          const newShot: Omit<ShotItem, 'id'> = {
            checklistId: checklistId,
            title: shot.title,
            description: shot.description,
            type: shot.type,
            priority: shot.priority,
            isCompleted: false,
            createdBy: state.user!.id,
            isUserAdded: false,
            order: shotIndex,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Save shot to Firebase
          const shotId = await shotItemService.create(newShot);
          console.log('✅ Shot item created in Firebase:', shotId);
          
          // Add to local state
          dispatch({ type: 'ADD_SHOT_ITEM', payload: { ...newShot, id: shotId } });
        }
      }
      
      console.log('🎉 Project creation completed successfully!');
      
      setProjectForm({ name: '', description: '', date: '', selectedShooters: [] });
      setShooterZones({});
      setProjectChecklists([]);
      setShowCreateProject(false);
    } catch (error) {
      console.error('❌ Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleCreateChecklist = async (projectId: string) => {
    if (!checklistForm.name.trim()) return;

    try {
      const existingChecklists = state.checklists.filter(c => c.projectId === projectId);
      const newOrder = existingChecklists.length;

      const newChecklist: Omit<Checklist, 'id'> = {
        name: checklistForm.name,
        description: checklistForm.description,
        projectId,
        order: newOrder,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firebase
      const checklistId = await checklistService.create(newChecklist);
      console.log('✅ Checklist created in Firebase:', checklistId);

      // Add to local state
      dispatch({ type: 'ADD_CHECKLIST', payload: { ...newChecklist, id: checklistId } });
      
      setChecklistForm({ name: '', description: '' });
      setShowCreateChecklist(null);
    } catch (error) {
      console.error('❌ Error creating checklist:', error);
      alert('Failed to create checklist. Please try again.');
    }
  };

  const getProjectChecklists = (projectId: string) => {
    return state.checklists.filter(checklist => checklist.projectId === projectId);
  };

  const getChecklistShots = (checklistId: string) => {
    return state.shotItems.filter(shot => shot.checklistId === checklistId);
  };

  const getShooterName = (userId: string) => {
    const shooter = availableShooters.find(shooter => shooter.id === userId);
    return shooter?.name || shooter?.email || userId;
  };

  // Delete handlers
  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated checklists and shots.')) {
      return;
    }

    try {
      // Delete all checklists and shots first
      const projectChecklists = state.checklists.filter(c => c.projectId === projectId);
      for (const checklist of projectChecklists) {
        const checklistShots = state.shotItems.filter(s => s.checklistId === checklist.id);
        for (const shot of checklistShots) {
          await shotItemService.delete(shot.id);
          dispatch({ type: 'REMOVE_SHOT_ITEM', payload: shot.id });
        }
        await checklistService.delete(checklist.id);
        dispatch({ type: 'REMOVE_CHECKLIST', payload: checklist.id });
      }

      // Delete the project
      await projectService.delete(projectId);
      dispatch({ type: 'REMOVE_PROJECT', payload: projectId });
      
      console.log('✅ Project and all associated data deleted');
      setSelectedProject(null);
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    if (!window.confirm('Are you sure you want to delete this checklist? This will also delete all associated shots.')) {
      return;
    }

    try {
      // Delete all shots in this checklist
      const checklistShots = state.shotItems.filter(s => s.checklistId === checklistId);
      for (const shot of checklistShots) {
        await shotItemService.delete(shot.id);
        dispatch({ type: 'REMOVE_SHOT_ITEM', payload: shot.id });
      }

      // Delete the checklist
      await checklistService.delete(checklistId);
      dispatch({ type: 'REMOVE_CHECKLIST', payload: checklistId });
      
      console.log('✅ Checklist and all shots deleted');
    } catch (error) {
      console.error('❌ Error deleting checklist:', error);
      alert('Failed to delete checklist. Please try again.');
    }
  };

  const handleDeleteShot = async (shotId: string) => {
    if (!window.confirm('Are you sure you want to delete this shot?')) {
      return;
    }

    try {
      await shotItemService.delete(shotId);
      dispatch({ type: 'REMOVE_SHOT_ITEM', payload: shotId });
      console.log('✅ Shot deleted');
    } catch (error) {
      console.error('❌ Error deleting shot:', error);
      alert('Failed to delete shot. Please try again.');
    }
  };

  // Edit handlers
  const handleStartEditProject = (project: Project) => {
    setEditingProject(project.id);
    setEditProjectForm({
      name: project.name,
      description: project.description || '',
      date: project.date ? new Date(project.date).toISOString().split('T')[0] : ''
    });
  };

  const handleSaveProjectEdit = async (projectId: string) => {
    if (!editProjectForm.name.trim()) return;

    try {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return;

      // Ensure date is either a Date object or undefined (not null)
      let projectDate: Date | undefined = undefined;
      if (editProjectForm.date && editProjectForm.date.trim()) {
        projectDate = new Date(editProjectForm.date);
      } else if (project.date) {
        projectDate = project.date;
      }

      const updatedProject = {
        ...project,
        name: editProjectForm.name,
        description: editProjectForm.description,
        date: projectDate,
        updatedAt: new Date()
      };

      await projectService.update(projectId, updatedProject);
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      
      setEditingProject(null);
      console.log('✅ Project updated');
    } catch (error) {
      console.error('❌ Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const handleStartEditChecklist = (checklist: Checklist) => {
    setEditingChecklist(checklist.id);
    setEditChecklistForm({
      name: checklist.name,
      description: checklist.description || ''
    });
  };

  const handleSaveChecklistEdit = async (checklistId: string) => {
    if (!editChecklistForm.name.trim()) return;

    try {
      const checklist = state.checklists.find(c => c.id === checklistId);
      if (!checklist) return;

      const updatedChecklist = {
        ...checklist,
        name: editChecklistForm.name,
        description: editChecklistForm.description,
        updatedAt: new Date()
      };

      await checklistService.update(checklistId, updatedChecklist);
      dispatch({ type: 'UPDATE_CHECKLIST', payload: updatedChecklist });
      
      setEditingChecklist(null);
      console.log('✅ Checklist updated');
    } catch (error) {
      console.error('❌ Error updating checklist:', error);
      alert('Failed to update checklist. Please try again.');
    }
  };

  const handleStartEditShot = (shot: ShotItem) => {
    setEditingShot(shot.id);
    setEditShotForm({
      title: shot.title,
      description: shot.description || '',
      type: shot.type,
      priority: shot.priority
    });
  };

  const handleSaveShotEdit = async (shotId: string) => {
    if (!editShotForm.title.trim()) return;

    try {
      const shot = state.shotItems.find(s => s.id === shotId);
      if (!shot) return;

      const updatedShot = {
        ...shot,
        title: editShotForm.title,
        description: editShotForm.description,
        type: editShotForm.type,
        priority: editShotForm.priority,
        updatedAt: new Date()
      };

      await shotItemService.update(shotId, updatedShot);
      dispatch({ type: 'UPDATE_SHOT_ITEM', payload: updatedShot });
      
      setEditingShot(null);
      console.log('✅ Shot updated');
    } catch (error) {
      console.error('❌ Error updating shot:', error);
      alert('Failed to update shot. Please try again.');
    }
  };

  // Shooter management
  const handleStartManageShooters = (project: Project) => {
    setManagingShooters(project.id);
    setProjectShooters(project.assignments.map(a => a.userId));
    const zones: Record<string, string> = {};
    project.assignments.forEach(a => {
      if (a.zone) zones[a.userId] = a.zone;
    });
    setProjectZones(zones);
  };

  const toggleProjectShooter = (shooterId: string) => {
    setProjectShooters(prev =>
      prev.includes(shooterId)
        ? prev.filter(id => id !== shooterId)
        : [...prev, shooterId]
    );
  };

  const handleSaveShooterAssignments = async (projectId: string) => {
    try {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return;

      const assignments: ProjectAssignment[] = projectShooters.map(shooterId => ({
        userId: shooterId,
        zone: projectZones[shooterId] || undefined,
        assignedAt: new Date()
      }));

      const updatedProject = {
        ...project,
        assignments,
        updatedAt: new Date()
      };

      await projectService.update(projectId, updatedProject);
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      
      setManagingShooters(null);
      console.log('✅ Shooter assignments updated');
    } catch (error) {
      console.error('❌ Error updating shooter assignments:', error);
      alert('Failed to update assignments. Please try again.');
    }
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
    <div className="space-y-4 sm:space-y-6">
      {/* Loading State */}
      {isLoading && (
        <FadeIn>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-1 sm:mb-2">Loading Projects...</h3>
              <p className="text-xs sm:text-sm text-slate-600 text-center max-w-md px-4">
                Fetching your projects and data from the database
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Create Project Button */}
      {!isLoading && (
        <FadeIn>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Project Creation & Management</h3>
              <p className="text-xs sm:text-sm text-slate-600">Create projects, add checklists, and manage shot lists</p>
            </div>
            {!showCreateProject && (
              <Button
                onClick={() => setShowCreateProject(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto touch-manipulation min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        </FadeIn>
      )}

      {/* Create Project Form */}
      {!isLoading && showCreateProject && (
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <span className="text-base sm:text-lg">Create New Project</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateProject(false)}
                  className="touch-manipulation min-h-[36px]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Set up a new project for your team to work on
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="project-name" className="text-xs sm:text-sm">Project Name *</Label>
                  <Input
                    id="project-name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="e.g., Sunburn Music Festival"
                    className="mt-1 min-h-[44px]"
                  />
                </div>
                <div>
                  <Label htmlFor="project-date" className="text-xs sm:text-sm">Event Date</Label>
                  <Input
                    id="project-date"
                    type="date"
                    value={projectForm.date}
                    onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })}
                    className="mt-1 min-h-[44px]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="project-description" className="text-xs sm:text-sm">Description</Label>
                <Textarea
                  id="project-description"
                  value={projectForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Brief description of the project"
                  rows={3}
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
              
              {/* Shooter Assignment Section */}
              <div className="border-t pt-3 sm:pt-4">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <Label className="text-sm sm:text-base font-semibold">Assign Shooters (Optional)</Label>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                  Select shooters to assign to this project and optionally specify their zones
                </p>
                
                {availableShooters.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 sm:p-6 text-center">
                    <Users className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400 mx-auto mb-2 sm:mb-3" />
                    <h4 className="text-xs sm:text-sm font-medium text-slate-900 mb-1">No Shooters Available</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">
                      No shooter accounts have been created yet. Create shooter accounts in Firebase Authentication to assign them to projects.
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      Users with role 'shooter' will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {availableShooters.map((shooter) => {
                    const isSelected = projectForm.selectedShooters.includes(shooter.id);
                    
                    return (
                      <div
                        key={shooter.id}
                        className={`border rounded-lg p-2 sm:p-3 transition-all ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Checkbox
                            id={`shooter-${shooter.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleShooter(shooter.id)}
                            className="mt-1 min-h-[20px] min-w-[20px] touch-manipulation"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`shooter-${shooter.id}`}
                              className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2 cursor-pointer"
                            >
                              <span className="font-medium text-slate-900 text-sm sm:text-base">{shooter.name}</span>
                              <span className="text-xs sm:text-sm text-slate-500">{shooter.email}</span>
                            </label>
                            
                            {isSelected && (
                              <div className="mt-2">
                                <Label htmlFor={`zone-${shooter.id}`} className="text-[10px] sm:text-xs text-slate-600">
                                  Zone Assignment (Optional)
                                </Label>
                                <Input
                                  id={`zone-${shooter.id}`}
                                  value={shooterZones[shooter.id] || ''}
                                  onChange={(e) => setShooterZones({ ...shooterZones, [shooter.id]: e.target.value })}
                                  placeholder="e.g., Main Stage, Pit, VIP Area"
                                  className="mt-1 text-xs sm:text-sm min-h-[36px]"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
                
                {projectForm.selectedShooters.length > 0 && (
                  <div className="mt-2 sm:mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-900">
                      <strong>{projectForm.selectedShooters.length}</strong> shooter(s) selected
                    </p>
                  </div>
                )}
              </div>
              
              {/* Checklists & Shots Section */}
              <div className="border-t pt-3 sm:pt-4">
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-green-600" />
                    <Label className="text-sm sm:text-base font-semibold">Checklists & Shots (Optional)</Label>
                  </div>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">
                    {projectChecklists.length} checklist(s)
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                  Add checklists and shot lists to this project during creation
                </p>
                
                {/* Add Checklist Form */}
                {showAddChecklistToNew && (
                  <Card className="border-green-200 bg-green-50 mb-4">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="new-checklist-name" className="text-sm">Checklist Name *</Label>
                            <Input
                              id="new-checklist-name"
                              value={checklistForm.name}
                              onChange={(e) => setChecklistForm({ ...checklistForm, name: e.target.value })}
                              placeholder="e.g., Main Stage Video"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-checklist-desc" className="text-sm">Description</Label>
                            <Input
                              id="new-checklist-desc"
                              value={checklistForm.description}
                              onChange={(e) => setChecklistForm({ ...checklistForm, description: e.target.value })}
                              placeholder="Brief description"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={addChecklistToProject}
                            disabled={!checklistForm.name.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Checklist
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddChecklistToNew(false);
                              setChecklistForm({ name: '', description: '' });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {!showAddChecklistToNew && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowAddChecklistToNew(true)}
                    className="bg-green-600 hover:bg-green-700 mb-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Checklist
                  </Button>
                )}
                
                {/* Created Checklists */}
                <div className="space-y-3">
                  {projectChecklists.map((checklist) => (
                    <Card key={checklist.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-slate-900 flex items-center gap-2">
                                📋 {checklist.name}
                                <Badge variant="outline" className="text-xs">
                                  {checklist.shots.length} shot(s)
                                </Badge>
                              </h5>
                              <p className="text-sm text-slate-600">{checklist.description}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChecklistFromProject(checklist.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Add Shot to this checklist */}
                          {showAddShotToChecklist === checklist.id ? (
                            <div className="mt-2">
                              <AddShotForm
                                checklistId={checklist.id}
                                onClose={() => setShowAddShotToChecklist(null)}
                                onAdd={(shotData) => handleAddShotToChecklist(checklist.id, shotData)}
                              />
                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setShowAddShotToChecklist(checklist.id)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Shot
                            </Button>
                          )}
                          
                          {/* Shots List */}
                          {checklist.shots.length > 0 && (
                            <div className="space-y-2">
                              {checklist.shots.map((shot) => (
                                <div
                                  key={shot.id}
                                  className="flex items-center gap-2 p-2 border rounded-lg bg-white text-sm"
                                >
                                  {shot.type === 'video' ? (
                                    <Video className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  ) : (
                                    <Camera className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 truncate">{shot.title}</p>
                                    {shot.description && (
                                      <p className="text-xs text-slate-600 truncate">{shot.description}</p>
                                    )}
                                  </div>
                                  {shot.priority === 'must-have' && (
                                    <Badge variant="destructive" className="text-xs flex-shrink-0">
                                      Must-Have
                                    </Badge>
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeShotFromChecklist(checklist.id, shot.id)}
                                    className="flex-shrink-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {projectChecklists.length === 0 && !showAddChecklistToNew && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                      <CheckSquare className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">
                        No checklists added yet. Click "Add Checklist" to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col xs:flex-row justify-end gap-2 border-t pt-3 sm:pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateProject(false)}
                  className="w-full xs:w-auto touch-manipulation min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={!projectForm.name.trim()}
                  className="w-full xs:w-auto touch-manipulation min-h-[44px]"
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
      {!isLoading && (
        <div className="space-y-3 sm:space-y-4">
          {state.projects.length === 0 ? (
          <FadeIn>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <CheckSquare className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-1 sm:mb-2">No Projects Yet</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 text-center max-w-md px-4">
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
          <StaggeredList className="space-y-3 sm:space-y-4">
              {state.projects.map((project) => {
                const stats = getProjectStats(project.id);
                const checklists = getProjectChecklists(project.id);
                const isExpanded = selectedProject === project.id;
                const isEditingThisProject = editingProject === project.id;

                return (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          {isEditingThisProject ? (
                            <div className="space-y-2 sm:space-y-3">
                              <div>
                                <Label htmlFor="edit-project-name" className="text-xs sm:text-sm">Project Name *</Label>
                                <Input
                                  id="edit-project-name"
                                  value={editProjectForm.name}
                                  onChange={(e) => setEditProjectForm({ ...editProjectForm, name: e.target.value })}
                                  className="mt-1 min-h-[44px] text-sm sm:text-base"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-project-description" className="text-xs sm:text-sm">Description</Label>
                                <Textarea
                                  id="edit-project-description"
                                  value={editProjectForm.description}
                                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
                                  className="mt-1 text-sm sm:text-base"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-project-date" className="text-xs sm:text-sm">Event Date</Label>
                                <Input
                                  id="edit-project-date"
                                  type="date"
                                  value={editProjectForm.date}
                                  onChange={(e) => setEditProjectForm({ ...editProjectForm, date: e.target.value })}
                                  className="mt-1 min-h-[44px]"
                                />
                              </div>
                              <div className="flex flex-col xs:flex-row gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveProjectEdit(project.id)}
                                  disabled={!editProjectForm.name.trim()}
                                  className="touch-manipulation min-h-[44px] w-full xs:w-auto"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingProject(null)}
                                  className="touch-manipulation min-h-[44px] w-full xs:w-auto"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <CardTitle className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2 text-base sm:text-lg">
                                <span className="truncate">{project.name}</span>
                                <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                                  {stats.completedShots}/{stats.totalShots} shots
                                </Badge>
                              </CardTitle>
                              <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-2">
                                {project.description || 'No description provided'}
                              </CardDescription>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                  {project.date ? formatDate(project.date) : 'No date set'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                                  {stats.checklists} checklists
                                </div>
                              </div>
                              {project.assignments && project.assignments.length > 0 && (
                                <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
                                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                  {project.assignments.map((assignment) => (
                                    <Badge key={assignment.userId} variant="secondary" className="text-[10px] sm:text-xs">
                                      {getShooterName(assignment.userId)}
                                      {assignment.zone && ` • ${assignment.zone}`}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {!isEditingThisProject && (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEditProject(project)}
                              className="touch-manipulation min-h-[44px] px-2 sm:px-3"
                              title="Edit Project"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation min-h-[44px] px-2 sm:px-3"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProject(isExpanded ? null : project.id)}
                              className="touch-manipulation min-h-[44px] px-3 sm:px-4 whitespace-nowrap"
                            >
                              <Edit className="w-4 h-4 mr-1 sm:mr-2" />
                              {isExpanded ? 'Hide' : 'Manage'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="pt-0 space-y-4 sm:space-y-6 px-3 sm:px-6 pb-3 sm:pb-6">
                        {/* Manage Shooters Section */}
                        <div className="border-t pt-3 sm:pt-4">
                          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-2 sm:mb-3">
                            <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                              <Users className="w-4 h-4 text-blue-600" />
                              Team Assignments
                            </h4>
                            <Button
                              size="sm"
                              onClick={() => handleStartManageShooters(project)}
                              className="bg-blue-600 hover:bg-blue-700 text-white touch-manipulation min-h-[44px] w-full xs:w-auto"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Manage Shooters
                            </Button>
                          </div>

                          {managingShooters === project.id && (
                            <Card className="border-blue-200 bg-blue-50 mb-3 sm:mb-4">
                              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                                <h5 className="font-medium text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Assign Shooters to Project</h5>
                                {availableShooters.length === 0 ? (
                                  <p className="text-xs sm:text-sm text-slate-600">No shooters available</p>
                                ) : (
                                  <div className="space-y-2 sm:space-y-3">
                                    {availableShooters.map((shooter) => {
                                      const isSelected = projectShooters.includes(shooter.id);
                                      return (
                                        <div
                                          key={shooter.id}
                                          className={`border rounded-lg p-2 sm:p-3 transition-all ${
                                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                                          }`}
                                        >
                                          <div className="flex items-start gap-2 sm:gap-3">
                                            <Checkbox
                                              id={`manage-shooter-${shooter.id}`}
                                              checked={isSelected}
                                              onCheckedChange={() => toggleProjectShooter(shooter.id)}
                                              className="mt-1 min-h-[20px] min-w-[20px] touch-manipulation"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <label
                                                htmlFor={`manage-shooter-${shooter.id}`}
                                                className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2 cursor-pointer"
                                              >
                                                <span className="font-medium text-slate-900 text-sm sm:text-base truncate">{shooter.name}</span>
                                                <span className="text-xs sm:text-sm text-slate-500 truncate">{shooter.email}</span>
                                              </label>
                                              {isSelected && (
                                                <div className="mt-2">
                                                  <Label htmlFor={`manage-zone-${shooter.id}`} className="text-[10px] sm:text-xs text-slate-600">
                                                    Zone Assignment (Optional)
                                                  </Label>
                                                  <Input
                                                    id={`manage-zone-${shooter.id}`}
                                                    value={projectZones[shooter.id] || ''}
                                                    onChange={(e) => setProjectZones({ ...projectZones, [shooter.id]: e.target.value })}
                                                    placeholder="e.g., Main Stage, Pit, VIP Area"
                                                    className="mt-1 text-xs sm:text-sm min-h-[36px]"
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                <div className="flex flex-col xs:flex-row gap-2 mt-3 sm:mt-4">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveShooterAssignments(project.id)}
                                    className="bg-blue-600 hover:bg-blue-700 touch-manipulation min-h-[44px] w-full xs:w-auto"
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Assignments
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setManagingShooters(null)}
                                    className="touch-manipulation min-h-[44px] w-full xs:w-auto"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>

                        {/* Create Checklist Button */}
                        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
                          <h4 className="font-medium text-slate-900 text-sm sm:text-base">Checklists & Shot Lists</h4>
                          <Button
                            size="sm"
                            onClick={() => setShowCreateChecklist(project.id)}
                            className="bg-green-600 hover:bg-green-700 text-white touch-manipulation min-h-[44px] w-full xs:w-auto"
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
                            const isEditingThisChecklist = editingChecklist === checklist.id;

                            return (
                              <Card key={checklist.id} className="border-l-4 border-l-blue-500 bg-blue-50/50">
                                <CardContent className="pt-6">
                                  {isEditingThisChecklist ? (
                                    <div className="space-y-3 mb-4">
                                      <div>
                                        <Label htmlFor="edit-checklist-name">Checklist Name *</Label>
                                        <Input
                                          id="edit-checklist-name"
                                          value={editChecklistForm.name}
                                          onChange={(e) => setEditChecklistForm({ ...editChecklistForm, name: e.target.value })}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-checklist-description">Description</Label>
                                        <Input
                                          id="edit-checklist-description"
                                          value={editChecklistForm.description}
                                          onChange={(e) => setEditChecklistForm({ ...editChecklistForm, description: e.target.value })}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleSaveChecklistEdit(checklist.id)}
                                          disabled={!editChecklistForm.name.trim()}
                                          className="touch-manipulation"
                                        >
                                          <Save className="w-4 h-4 mr-2" />
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingChecklist(null)}
                                          className="touch-manipulation"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
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
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleStartEditChecklist(checklist)}
                                          className="touch-manipulation"
                                          title="Edit Checklist"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteChecklist(checklist.id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                                          title="Delete Checklist"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => setShowCreateShot(checklist.id)}
                                          className="bg-purple-600 hover:bg-purple-700 text-white touch-manipulation"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add Shot
                                        </Button>
                                      </div>
                                    </div>
                                  )}                                {/* Create Shot Form */}
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
                                    {shots.map((shot) => {
                                      const isEditingThisShot = editingShot === shot.id;
                                      
                                      return (
                                        <div key={shot.id}>
                                          {isEditingThisShot ? (
                                            <Card className="p-4 bg-purple-50 border-purple-200">
                                              <div className="space-y-3">
                                                <div>
                                                  <Label htmlFor="edit-shot-title">Shot Title *</Label>
                                                  <Input
                                                    id="edit-shot-title"
                                                    value={editShotForm.title}
                                                    onChange={(e) => setEditShotForm({ ...editShotForm, title: e.target.value })}
                                                    className="mt-1"
                                                  />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                    <Label htmlFor="edit-shot-type">Type</Label>
                                                    <select
                                                      id="edit-shot-type"
                                                      value={editShotForm.type}
                                                      onChange={(e) => setEditShotForm({ ...editShotForm, type: e.target.value as 'photo' | 'video' })}
                                                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    >
                                                      <option value="photo">📷 Photo</option>
                                                      <option value="video">🎥 Video</option>
                                                    </select>
                                                  </div>
                                                  <div>
                                                    <Label htmlFor="edit-shot-priority">Priority</Label>
                                                    <select
                                                      id="edit-shot-priority"
                                                      value={editShotForm.priority}
                                                      onChange={(e) => setEditShotForm({ ...editShotForm, priority: e.target.value as 'must-have' | 'nice-to-have' })}
                                                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    >
                                                      <option value="must-have">🔴 Must-Have</option>
                                                      <option value="nice-to-have">⚪ Nice-to-Have</option>
                                                    </select>
                                                  </div>
                                                </div>
                                                <div>
                                                  <Label htmlFor="edit-shot-description">Description</Label>
                                                  <Textarea
                                                    id="edit-shot-description"
                                                    value={editShotForm.description}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditShotForm({ ...editShotForm, description: e.target.value })}
                                                    className="mt-1"
                                                    rows={2}
                                                  />
                                                </div>
                                                <div className="flex gap-2">
                                                  <Button
                                                    size="sm"
                                                    onClick={() => handleSaveShotEdit(shot.id)}
                                                    disabled={!editShotForm.title.trim()}
                                                    className="touch-manipulation"
                                                  >
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingShot(null)}
                                                    className="touch-manipulation"
                                                  >
                                                    Cancel
                                                  </Button>
                                                </div>
                                              </div>
                                            </Card>
                                          ) : (
                                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm">
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
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleStartEditShot(shot)}
                                                  className="touch-manipulation"
                                                  title="Edit Shot"
                                                >
                                                  <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleDeleteShot(shot.id)}
                                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                                                  title="Delete Shot"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
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
      )}
    </div>
  );
}
