import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { PageTransition, FadeIn, StaggeredList } from '@/components/animations/PageTransitions';
import { useApp } from '@/hooks/useApp';
import type { Project, ProjectAssignment } from '@/types';

interface UserManagementProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
}

interface NewAssignmentForm {
  userId: string;
  zone: string;
}

// Demo users that can be assigned to projects
const availableUsers = [
  { id: 'vittal', name: 'Vittal', email: 'vittal@hmcstudios.com', role: 'shooter' as const },
  { id: 'shravan', name: 'Shravan', email: 'shravan@hmcstudios.com', role: 'shooter' as const },
  { id: 'rahul', name: 'Rahul', email: 'rahul@hmcstudios.com', role: 'shooter' as const },
  { id: 'priya', name: 'Priya', email: 'priya@hmcstudios.com', role: 'shooter' as const },
];

export function UserManagement({ project, onUpdateProject }: UserManagementProps) {
  const { dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState<NewAssignmentForm>({ userId: '', zone: '' });
  const [editingZone, setEditingZone] = useState('');

  const handleAddAssignment = () => {
    if (!newAssignment.userId || !newAssignment.zone) return;

    const assignment: ProjectAssignment = {
      userId: newAssignment.userId,
      zone: newAssignment.zone,
      assignedAt: new Date()
    };

    const updatedProject = {
      ...project,
      assignments: [...project.assignments, assignment],
      updatedAt: new Date()
    };

    onUpdateProject(updatedProject);
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    
    setNewAssignment({ userId: '', zone: '' });
    setShowAddForm(false);
  };

  const handleUpdateAssignment = (userId: string) => {
    if (!editingZone) return;

    const updatedAssignments = project.assignments.map(assignment =>
      assignment.userId === userId
        ? { ...assignment, zone: editingZone }
        : assignment
    );

    const updatedProject = {
      ...project,
      assignments: updatedAssignments,
      updatedAt: new Date()
    };

    onUpdateProject(updatedProject);
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    
    setEditingAssignment(null);
    setEditingZone('');
  };

  const handleRemoveAssignment = (userId: string) => {
    const updatedAssignments = project.assignments.filter(assignment => assignment.userId !== userId);

    const updatedProject = {
      ...project,
      assignments: updatedAssignments,
      updatedAt: new Date()
    };

    onUpdateProject(updatedProject);
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
  };

  const getUnassignedUsers = () => {
    return availableUsers.filter(user => 
      !project.assignments.some(assignment => assignment.userId === user.id)
    );
  };

  const getUserName = (userId: string) => {
    return availableUsers.find(user => user.id === userId)?.name || userId;
  };

  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Team Assignments
            </CardTitle>
            <CardDescription>
              Assign shooters to this project and set their zones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Assignments */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Current Team</h3>
                {!showAddForm && getUnassignedUsers().length > 0 && (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Shooter
                  </Button>
                )}
              </div>

              {project.assignments.length > 0 ? (
                <StaggeredList className="space-y-3">
                  {project.assignments.map((assignment) => (
                    <div key={assignment.userId}>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {getUserName(assignment.userId)}
                            </p>
                            {editingAssignment === assignment.userId ? (
                              <div className="flex items-center space-x-2 mt-1">
                                <Input
                                  value={editingZone}
                                  onChange={(e) => setEditingZone(e.target.value)}
                                  placeholder="Enter zone (e.g., Stage + Pit)"
                                  className="h-8 text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateAssignment(assignment.userId)}
                                  className="h-8 px-2"
                                >
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingAssignment(null);
                                    setEditingZone('');
                                  }}
                                  className="h-8 px-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 mt-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span className="text-sm text-slate-600">{assignment.zone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Shooter</Badge>
                          {editingAssignment !== assignment.userId && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingAssignment(assignment.userId);
                                  setEditingZone(assignment.zones?.join(' + ') || assignment.zone || '');
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveAssignment(assignment.userId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </StaggeredList>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No shooters assigned to this project yet</p>
                </div>
              )}
            </div>

            {/* Add New Assignment Form */}
            {showAddForm && (
              <FadeIn>
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Shooter</CardTitle>
                    <CardDescription>Select a shooter and assign their zone</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Select Shooter
                      </label>
                      <Select 
                        value={newAssignment.userId} 
                        onValueChange={(value: string) => 
                          setNewAssignment(prev => ({ ...prev, userId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a shooter..." />
                        </SelectTrigger>
                        <SelectContent>
                          {getUnassignedUsers().map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Zone Assignment
                      </label>
                      <Input
                        value={newAssignment.zone}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, zone: e.target.value }))}
                        placeholder="e.g., Stage + Pit, GA + Sponsor Village"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewAssignment({ userId: '', zone: '' });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddAssignment}
                        disabled={!newAssignment.userId || !newAssignment.zone}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add Shooter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {getUnassignedUsers().length === 0 && !showAddForm && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">All available shooters have been assigned</p>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </PageTransition>
  );
}
