import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AddShotForm } from '@/components/AddShotForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  MapPin, 
  Camera,
  Video,
  AlertCircle,
  CheckCircle,
  Save,
  X
} from 'lucide-react';
import { formatDate } from '@/utils';
import type { Project, User, Checklist, ShotItem } from '@/types';

interface ProjectManagementProps {
  project: Project;
  users: User[];
  checklists: Checklist[];
  shotItems: ShotItem[];
  onUpdateProject?: (project: Project) => void;
  onCreateChecklist?: (checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateChecklist?: (id: string, checklist: Partial<Checklist>) => void;
  onDeleteChecklist?: (id: string) => void;
  onCreateShotItem?: (item: Omit<ShotItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateShotItem?: (id: string, item: Partial<ShotItem>) => void;
  onDeleteShotItem?: (id: string) => void;
}

interface NewChecklistForm {
  name: string;
  description: string;
}

export function ProjectManagement({
  project,
  users,
  checklists,
  shotItems,
  onCreateChecklist,
  onDeleteShotItem
}: ProjectManagementProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklists' | 'shots'>('overview');
  const [showNewChecklistForm, setShowNewChecklistForm] = useState(false);
  const [showNewShotForm, setShowNewShotForm] = useState<string | false>(false);
  const [newChecklist, setNewChecklist] = useState<NewChecklistForm>({ name: '', description: '' });
  const [errors, setErrors] = useState<string[]>([]);

  const projectChecklists = checklists.filter(checklist => checklist.projectId === project.id);
  const assignedUsers = users.filter(user => 
    project.assignments.some(assignment => assignment.userId === user.id)
  );

  const handleCreateChecklist = () => {
    setErrors([]);
    
    if (!newChecklist.name.trim()) {
      setErrors(['Checklist name is required']);
      return;
    }

    if (onCreateChecklist) {
      onCreateChecklist({
        projectId: project.id,
        name: newChecklist.name.trim(),
        description: newChecklist.description.trim(),
        order: projectChecklists.length,
      });
    }

    setNewChecklist({ name: '', description: '' });
    setShowNewChecklistForm(false);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Details</CardTitle>
          <CardDescription>Basic information and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Project Name</label>
              <Input value={project.name} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(project.date)}</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input value={project.description || ''} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Assignments</CardTitle>
          <CardDescription>Shooters assigned to this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignedUsers.map(user => {
              const assignment = project.assignments.find(a => a.userId === user.id);
              const userShots = shotItems.filter(item => item.createdBy === user.id || item.completedBy === user.id);
              const completed = userShots.filter(item => item.isCompleted).length;
              
              return (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{assignment?.zone || 'No zone assigned'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {completed} shots completed
                    </div>
                  </div>
                </div>
              );
            })}
            
            {assignedUsers.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>No shooters assigned to this project</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderChecklists = () => (
    <div className="space-y-6">
      {/* Add New Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Checklists</CardTitle>
              <CardDescription>Organize shots into categories</CardDescription>
            </div>
            <Button onClick={() => setShowNewChecklistForm(!showNewChecklistForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Checklist
            </Button>
          </div>
        </CardHeader>
        
        {showNewChecklistForm && (
          <CardContent className="border-t">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Checklist Name *</label>
                <Input
                  value={newChecklist.name}
                  onChange={(e) => setNewChecklist(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Stage Video"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input
                  value={newChecklist.description}
                  onChange={(e) => setNewChecklist(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Key video shots for the main stage performance"
                />
              </div>
              
              {errors.length > 0 && (
                <div className="space-y-1 p-3 bg-red-50 border border-red-200 rounded-md">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">{error}</p>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleCreateChecklist}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Checklist
                </Button>
                <Button variant="outline" onClick={() => setShowNewChecklistForm(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Existing Checklists */}
      <div className="space-y-4">
        {projectChecklists.map(checklist => {
          const checklistShots = shotItems.filter(item => item.checklistId === checklist.id);
          const completed = checklistShots.filter(item => item.isCompleted).length;
          
          return (
            <Card key={checklist.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{checklist.name}</CardTitle>
                    <CardDescription>
                      {checklist.description} • {completed}/{checklistShots.length} shots completed
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checklistShots.map(shot => (
                    <div key={shot.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {shot.type === 'video' ? 
                          <Video className="h-4 w-4 text-blue-500" /> : 
                          <Camera className="h-4 w-4 text-green-500" />
                        }
                        <span className="text-sm">{shot.title}</span>
                        <Badge variant={shot.priority === 'must-have' ? 'must-have' : 'nice-to-have'}>
                          {shot.priority === 'must-have' ? 'Must-Have' : 'Nice-to-Have'}
                        </Badge>
                        {shot.isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDeleteShotItem?.(shot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {checklistShots.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No shots in this checklist yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderShots = () => (
    <div className="space-y-6">
      {/* Show checklists with option to add shots to each */}
      {projectChecklists.map(checklist => {
        const checklistShots = shotItems.filter(item => item.checklistId === checklist.id);
        const completed = checklistShots.filter(item => item.isCompleted).length;
        const showAddForm = showNewShotForm === checklist.id;
        
        return (
          <Card key={checklist.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{checklist.name}</CardTitle>
                  <CardDescription>
                    {checklist.description} • {completed}/{checklistShots.length} shots completed
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowNewShotForm(showAddForm ? false : checklist.id)}
                  variant={showAddForm ? "outline" : "default"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showAddForm ? 'Cancel' : 'Add Shot'}
                </Button>
              </div>
            </CardHeader>
            
            {showAddForm && (
              <CardContent className="border-t">
                <AddShotForm
                  checklistId={checklist.id}
                  onClose={() => setShowNewShotForm(false)}
                />
              </CardContent>
            )}
            
            <CardContent className={showAddForm ? "pt-0" : ""}>
              <div className="space-y-2">
                {checklistShots.map(shot => (
                  <div key={shot.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {shot.type === 'video' ? 
                        <Video className="h-4 w-4 text-blue-500" /> : 
                        <Camera className="h-4 w-4 text-green-500" />
                      }
                      <span className="text-sm">{shot.title}</span>
                      <Badge variant={shot.priority === 'must-have' ? 'must-have' : 'nice-to-have'}>
                        {shot.priority === 'must-have' ? 'Must-Have' : 'Nice-to-Have'}
                      </Badge>
                      {shot.isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDeleteShotItem?.(shot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {checklistShots.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No shots in this checklist yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {projectChecklists.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Create a checklist first before adding shots</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'checklists' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('checklists')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Checklists ({projectChecklists.length})
            </Button>
            <Button
              variant={activeTab === 'shots' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('shots')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Shots ({shotItems.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'checklists' && renderChecklists()}
      {activeTab === 'shots' && renderShots()}
    </div>
  );
}
