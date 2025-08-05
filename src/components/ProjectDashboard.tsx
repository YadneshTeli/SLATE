import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Camera, Video, Users, CheckCircle, AlertCircle, Clock, Settings } from 'lucide-react';
import { formatTimestamp, formatDate } from '@/utils';
import type { Project, User, ShotItem } from '@/types';

interface ProjectDashboardProps {
  project: Project;
  users: User[];
  shotItems: ShotItem[];
  onManageProject?: () => void;
}

export function ProjectDashboard({ project, users, shotItems, onManageProject }: ProjectDashboardProps) {
  // Calculate project statistics
  const totalShots = shotItems.length;
  const completedShots = shotItems.filter(item => item.isCompleted).length;
  const mustHaveShots = shotItems.filter(item => item.priority === 'must-have').length;
  const completedMustHave = shotItems.filter(item => item.priority === 'must-have' && item.isCompleted).length;
  const userAddedShots = shotItems.filter(item => item.isUserAdded).length;
  
  const overallProgress = totalShots > 0 ? (completedShots / totalShots) * 100 : 0;
  const mustHaveProgress = mustHaveShots > 0 ? (completedMustHave / mustHaveShots) * 100 : 0;

  // Get assigned shooters
  const assignedUsers = users.filter(user => 
    project.assignments.some(assignment => assignment.userId === user.id)
  );

  // Calculate per-user statistics
  const userStats = assignedUsers.map(user => {
    const userShots = shotItems.filter(item => 
      project.assignments.some(assignment => 
        assignment.userId === user.id
        // In a real app, we'd filter by checklist assignment to user zone
      ) || item.createdBy === user.id
    );
    const userCompleted = userShots.filter(item => item.completedBy === user.id);
    const userMustHave = userShots.filter(item => item.priority === 'must-have');
    const userCompletedMustHave = userCompleted.filter(item => item.priority === 'must-have');
    const userAdded = shotItems.filter(item => item.isUserAdded && item.createdBy === user.id);
    
    const zone = project.assignments.find(assignment => assignment.userId === user.id)?.zone;
    
    return {
      user,
      zone,
      totalShots: userShots.length,
      completedShots: userCompleted.length,
      mustHaveShots: userMustHave.length,
      completedMustHave: userCompletedMustHave.length,
      userAddedShots: userAdded.length,
      progress: userShots.length > 0 ? (userCompleted.length / userShots.length) * 100 : 0,
      lastActivity: userCompleted.length > 0 ? 
        Math.max(...userCompleted.map(shot => shot.completedAt?.getTime() || 0)) : null,
    };
  });

  // Recent activity
  const recentActivity = shotItems
    .filter(item => item.isCompleted && item.completedAt)
    .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <CardDescription>
                {project.description} • {formatDate(project.date)}
              </CardDescription>
            </div>
            {onManageProject && (
              <Button variant="outline" onClick={onManageProject}>
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalShots}</div>
              <div className="text-xs text-muted-foreground">Total Shots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedShots}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{mustHaveShots}</div>
              <div className="text-xs text-muted-foreground">Must-Have</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userAddedShots}</div>
              <div className="text-xs text-muted-foreground">User Added</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Progress</CardTitle>
            <CardDescription>{completedShots} of {totalShots} shots completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>All Shots</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Must-Have Shots</span>
                  <span>{Math.round(mustHaveProgress)}%</span>
                </div>
                <Progress value={mustHaveProgress} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Status</CardTitle>
            <CardDescription>{assignedUsers.length} shooters assigned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Assigned Shooters: {assignedUsers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Active Users: {assignedUsers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Status: {project.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shooter Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shooter Performance</CardTitle>
          <CardDescription>Individual progress and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userStats.map(stat => (
              <div key={stat.user.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{stat.user.name}</h4>
                    <p className="text-sm text-muted-foreground">Zone: {stat.zone || 'Not assigned'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{Math.round(stat.progress)}%</div>
                    <div className="text-xs text-muted-foreground">
                      {stat.completedShots}/{stat.totalShots} shots
                    </div>
                  </div>
                </div>
                
                <Progress value={stat.progress} className="mb-3" />
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <Badge variant={stat.completedMustHave === stat.mustHaveShots ? 'must-have' : 'outline'}>
                      Must-Have: {stat.completedMustHave}/{stat.mustHaveShots}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant="secondary">
                      User Added: {stat.userAddedShots}
                    </Badge>
                  </div>
                  <div className="text-right text-muted-foreground">
                    {stat.lastActivity ? (
                      <>Last: {formatTimestamp(new Date(stat.lastActivity))}</>
                    ) : (
                      <>No activity</>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest completed shots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map(shot => {
              const completedUser = users.find(user => user.id === shot.completedBy);
              return (
                <div key={shot.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {shot.type === 'video' ? 
                      <Video className="h-4 w-4 text-blue-500" /> : 
                      <Camera className="h-4 w-4 text-green-500" />
                    }
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{shot.title}</div>
                    <div className="text-sm text-muted-foreground">
                      by {completedUser?.name || 'Unknown'} • {shot.completedAt ? formatTimestamp(shot.completedAt) : ''}
                    </div>
                  </div>
                  
                  <Badge variant={shot.priority === 'must-have' ? 'must-have' : 'nice-to-have'}>
                    {shot.priority === 'must-have' ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Must-Have
                      </>
                    ) : (
                      'Nice-to-Have'
                    )}
                  </Badge>
                </div>
              );
            })}
            
            {recentActivity.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
