import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle, Clock, Camera, Video, MapPin } from 'lucide-react';
import { PageTransition, FadeIn, StaggeredList } from '@/components/animations/PageTransitions';
import { useApp } from '@/hooks/useApp';
import type { Project, ShotItem } from '@/types';

interface TeamProgressDashboardProps {
  project: Project;
}

interface ShooterProgress {
  userId: string;
  userName: string;
  zone: string;
  totalShots: number;
  completedShots: number;
  mustHaveShots: number;
  completedMustHaveShots: number;
  recentActivity: ShotItem[];
  completionRate: number;
}

// Demo users mapping
const userNames: Record<string, string> = {
  vittal: 'Vittal',
  shravan: 'Shravan',
  rahul: 'Rahul',
  priya: 'Priya'
};

export function TeamProgressDashboard({ project }: TeamProgressDashboardProps) {
  const { state } = useApp();

  // Get all shot items for this project
  const projectShotItems = state.shotItems.filter(item => {
    const checklist = state.checklists.find(c => c.id === item.checklistId);
    return checklist && checklist.projectId === project.id;
  });

  // Calculate progress for each assigned shooter
  const shooterProgress: ShooterProgress[] = project.assignments.map(assignment => {
    // For demo, we'll show progress for all shots in the project
    // In a real app, you'd filter by shooter-specific assignments
    const totalShots = projectShotItems.length;
    const completedShots = projectShotItems.filter(item => item.isCompleted).length;
    const mustHaveShots = projectShotItems.filter(item => item.priority === 'must-have').length;
    const completedMustHaveShots = projectShotItems.filter(item => 
      item.priority === 'must-have' && item.isCompleted
    ).length;

    const recentActivity = projectShotItems
      .filter(item => item.isCompleted && item.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 3);

    return {
      userId: assignment.userId,
      userName: userNames[assignment.userId] || assignment.userId,
      zone: assignment.zones?.join(' + ') || assignment.zone || 'Unassigned',
      totalShots,
      completedShots,
      mustHaveShots,
      completedMustHaveShots,
      recentActivity,
      completionRate: totalShots > 0 ? (completedShots / totalShots) * 100 : 0
    };
  });

  const overallStats = {
    totalShooters: project.assignments.length,
    avgCompletionRate: shooterProgress.length > 0 
      ? shooterProgress.reduce((acc, shooter) => acc + shooter.completionRate, 0) / shooterProgress.length 
      : 0,
    totalCompletedShots: shooterProgress.reduce((acc, shooter) => acc + shooter.completedShots, 0),
    totalShots: shooterProgress.reduce((acc, shooter) => acc + shooter.totalShots, 0)
  };

  return (
    <PageTransition className="space-y-6">
      {/* Overall Team Stats */}
      <FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Shooters</p>
                  <p className="text-2xl font-bold text-slate-900">{overallStats.totalShooters}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.round(overallStats.avgCompletionRate)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Completed</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {overallStats.totalCompletedShots}
                  </p>
                </div>
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Overall Rate</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {overallStats.totalShots > 0 
                      ? Math.round((overallStats.totalCompletedShots / overallStats.totalShots) * 100)
                      : 0}%
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Individual Shooter Progress */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Shooter Progress
            </CardTitle>
            <CardDescription>Real-time progress tracking for each team member</CardDescription>
          </CardHeader>
          <CardContent>
            {shooterProgress.length > 0 ? (
              <StaggeredList className="space-y-6">
                {shooterProgress.map((shooter) => (
                  <div key={shooter.userId}>
                    <Card className="border-slate-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">{shooter.userName}</h3>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <MapPin className="w-3 h-3" />
                                <span>{shooter.zone}</span>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={shooter.completionRate >= 80 ? "default" : 
                                   shooter.completionRate >= 50 ? "secondary" : "destructive"}
                          >
                            {Math.round(shooter.completionRate)}% Complete
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              Progress ({shooter.completedShots}/{shooter.totalShots})
                            </span>
                            <span className="text-sm text-slate-600">
                              Must-have: {shooter.completedMustHaveShots}/{shooter.mustHaveShots}
                            </span>
                          </div>
                          <Progress value={shooter.completionRate} className="h-2" />
                        </div>

                        {/* Recent Activity */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Recent Activity</h4>
                          {shooter.recentActivity.length > 0 ? (
                            <div className="space-y-2">
                              {shooter.recentActivity.map((item) => (
                                <div key={item.id} className="flex items-center space-x-3 text-sm">
                                  <div className={`p-1 rounded-full ${
                                    item.type === 'photo' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                  }`}>
                                    {item.type === 'photo' ? 
                                      <Camera className="w-3 h-3" /> : 
                                      <Video className="w-3 h-3" />
                                    }
                                  </div>
                                  <span className="flex-1 text-slate-900">{item.title}</span>
                                  <span className="text-slate-500">
                                    {item.completedAt ? new Date(item.completedAt).toLocaleTimeString() : ''}
                                  </span>
                                  {item.priority === 'must-have' && (
                                    <Badge variant="destructive" className="text-xs">Must-have</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 italic">No recent activity</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </StaggeredList>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No shooters assigned to this project</p>
                <p className="text-sm text-slate-500">Add team members to start tracking progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </PageTransition>
  );
}
