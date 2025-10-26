import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PageTransition, FadeIn, StaggeredList } from '@/components/animations/PageTransitions';
import { 
  Camera, 
  Video, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Calendar,
  AlertCircle,
  Award,
  Target,
  FolderOpen
} from 'lucide-react';
import type { Project, ShotItem } from '@/types';

interface ProjectStats {
  project: Project;
  totalShots: number;
  completedShots: number;
  mustHaveShots: number;
  completedMustHaveShots: number;
  photoShots: number;
  videoShots: number;
  completedPhotoShots: number;
  completedVideoShots: number;
  completionRate: number;
  zone: string;
  recentActivity: ShotItem[];
}

export function ShooterDashboard() {
  const { state, setCurrentProject, getAssignedProjects } = useApp();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'all'>('all');

  if (!state.user) {
    return null;
  }

  // Get all projects assigned to this shooter
  const assignedProjects = getAssignedProjects(state.user.id);

  // Calculate stats for each project
  const projectStats: ProjectStats[] = assignedProjects.map(project => {
    const projectChecklists = state.checklists.filter(c => c.projectId === project.id);
    const projectShots = state.shotItems.filter(item => 
      projectChecklists.some(c => c.id === item.checklistId)
    );

    const completedShots = projectShots.filter(s => s.isCompleted);
    const mustHaveShots = projectShots.filter(s => s.priority === 'must-have');
    const completedMustHaveShots = projectShots.filter(s => s.priority === 'must-have' && s.isCompleted);
    const photoShots = projectShots.filter(s => s.type === 'photo');
    const videoShots = projectShots.filter(s => s.type === 'video');
    const completedPhotoShots = completedShots.filter(s => s.type === 'photo');
    const completedVideoShots = completedShots.filter(s => s.type === 'video');

    const myAssignment = project.assignments.find(a => a.userId === state.user!.id);
    const zone = myAssignment?.zones?.join(' + ') || myAssignment?.zone || 'Not assigned';

    // Get recent completed shots
    const recentActivity = projectShots
      .filter(item => item.isCompleted && item.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5);

    return {
      project,
      totalShots: projectShots.length,
      completedShots: completedShots.length,
      mustHaveShots: mustHaveShots.length,
      completedMustHaveShots: completedMustHaveShots.length,
      photoShots: photoShots.length,
      videoShots: videoShots.length,
      completedPhotoShots: completedPhotoShots.length,
      completedVideoShots: completedVideoShots.length,
      completionRate: projectShots.length > 0 ? (completedShots.length / projectShots.length) * 100 : 0,
      zone,
      recentActivity
    };
  });

  // Calculate overall stats across all projects
  const overallStats = {
    totalProjects: assignedProjects.length,
    totalShots: projectStats.reduce((acc, p) => acc + p.totalShots, 0),
    completedShots: projectStats.reduce((acc, p) => acc + p.completedShots, 0),
    mustHaveCompleted: projectStats.reduce((acc, p) => acc + p.completedMustHaveShots, 0),
    mustHaveTotal: projectStats.reduce((acc, p) => acc + p.mustHaveShots, 0),
    photoShots: projectStats.reduce((acc, p) => acc + p.completedPhotoShots, 0),
    videoShots: projectStats.reduce((acc, p) => acc + p.completedVideoShots, 0),
    avgCompletionRate: projectStats.length > 0 
      ? projectStats.reduce((acc, p) => acc + p.completionRate, 0) / projectStats.length 
      : 0
  };

  // Get all recent activity across projects
  const allRecentActivity = projectStats
    .flatMap(ps => ps.recentActivity.map(activity => ({ 
      ...activity, 
      projectName: ps.project.name 
    } as ShotItem & { projectName: string })))
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 10);

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project);
    navigate('/shooter/project');
  };

  if (assignedProjects.length === 0) {
    return (
      <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Projects Assigned</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
              You haven't been assigned to any projects yet. Please contact your admin to get started.
            </p>
            {state.projects.length > 0 && (
              <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>{state.projects.length}</strong> project{state.projects.length !== 1 ? 's' : ''} available. 
                  Your admin can assign you to any of them.
                </p>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">Welcome back, {state.user.name}!</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <Button
                variant={selectedTimeframe === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe('today')}
                className="flex-1 sm:flex-none text-xs sm:text-sm touch-manipulation min-h-[36px]"
              >
                Today
              </Button>
              <Button
                variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe('week')}
                className="flex-1 sm:flex-none text-xs sm:text-sm touch-manipulation min-h-[36px]"
              >
                Week
              </Button>
              <Button
                variant={selectedTimeframe === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe('all')}
                className="flex-1 sm:flex-none text-xs sm:text-sm touch-manipulation min-h-[36px]"
              >
                All
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Overall Stats Cards */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-700">Total Progress</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1 sm:mt-2">
                      {Math.round(overallStats.avgCompletionRate)}%
                    </p>
                    <p className="text-[10px] sm:text-xs text-blue-600 mt-0.5 sm:mt-1">
                      {overallStats.completedShots} / {overallStats.totalShots} shots
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:w-10 lg:w-12 lg:h-12 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-700">Must-Have</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1 sm:mt-2">
                      {overallStats.mustHaveCompleted}
                    </p>
                    <p className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">
                      of {overallStats.mustHaveTotal}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:w-10 lg:w-12 lg:h-12 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-purple-700">Photos</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1 sm:mt-2">
                      {overallStats.photoShots}
                    </p>
                    <p className="text-[10px] sm:text-xs text-purple-600 mt-0.5 sm:mt-1">completed</p>
                  </div>
                  <Camera className="w-8 h-8 sm:w-10 sm:w-10 lg:w-12 lg:h-12 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-orange-700">Videos</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-900 mt-1 sm:mt-2">
                      {overallStats.videoShots}
                    </p>
                    <p className="text-[10px] sm:text-xs text-orange-600 mt-0.5 sm:mt-1">completed</p>
                  </div>
                  <Video className="w-8 h-8 sm:w-10 sm:w-10 lg:w-12 lg:h-12 text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Projects Overview */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <FadeIn delay={0.2}>
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    Your Projects ({assignedProjects.length})
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Click on a project to view details and manage shots</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <StaggeredList className="space-y-2 sm:space-y-3">
                    {projectStats.map((stat) => (
                      <div
                        key={stat.project.id}
                        onClick={() => handleProjectClick(stat.project)}
                        className="p-3 sm:p-4 border-2 border-slate-200 rounded-lg hover:border-blue-400 active:border-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-all cursor-pointer group touch-manipulation"
                      >
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2 mb-1">
                              <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                                {stat.project.name}
                              </h3>
                              {stat.completionRate === 100 && (
                                <Badge className="bg-green-500 text-xs flex-shrink-0">
                                  <Award className="w-3 h-3 mr-1" />
                                  Complete
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2 line-clamp-2">{stat.project.description}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[100px] sm:max-w-none">{stat.zone}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {stat.project.date ? new Date(stat.project.date).toLocaleDateString() : 'No date set'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-semibold text-slate-900">
                              {stat.completedShots} / {stat.totalShots} ({Math.round(stat.completionRate)}%)
                            </span>
                          </div>
                          <Progress value={stat.completionRate} className="h-1.5 sm:h-2" />
                        </div>

                        {/* Shot Type Breakdown */}
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                          <div className="bg-white p-1.5 sm:p-2 rounded border border-slate-200">
                            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">
                              <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />
                              <span className="truncate">Must</span>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">
                              {stat.completedMustHaveShots} / {stat.mustHaveShots}
                            </p>
                          </div>
                          <div className="bg-white p-1.5 sm:p-2 rounded border border-slate-200">
                            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">
                              <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-500" />
                              <span className="truncate">Photo</span>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">
                              {stat.completedPhotoShots} / {stat.photoShots}
                            </p>
                          </div>
                          <div className="bg-white p-1.5 sm:p-2 rounded border border-slate-200">
                            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">
                              <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500" />
                              <span className="truncate">Video</span>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">
                              {stat.completedVideoShots} / {stat.videoShots}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </StaggeredList>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="space-y-4">
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest completed shots</CardDescription>
                </CardHeader>
                <CardContent>
                  {allRecentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {allRecentActivity.map((shot, index) => (
                        <div key={`${shot.id}-${index}`} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {shot.type === 'video' ? (
                                <Video className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Camera className="w-4 h-4 text-purple-600" />
                              )}
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {shot.title}
                              </p>
                            </div>
                            <p className="text-xs text-slate-600 truncate mb-1">
                              {(shot as ShotItem & { projectName: string }).projectName}
                            </p>
                            {shot.completedAt && (
                              <p className="text-xs text-green-600">
                                {new Date(shot.completedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No completed shots yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            {/* Performance Summary */}
            <FadeIn delay={0.4}>
              <Card className="bg-gradient-to-br from-slate-900 to-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">Completion Rate</span>
                        <span className="text-lg font-bold">
                          {Math.round(overallStats.avgCompletionRate)}%
                        </span>
                      </div>
                      <Progress 
                        value={overallStats.avgCompletionRate} 
                        className="h-2 bg-slate-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-600">
                      <div>
                        <p className="text-xs text-slate-400">Active Projects</p>
                        <p className="text-2xl font-bold">{overallStats.totalProjects}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Total Shots</p>
                        <p className="text-2xl font-bold">{overallStats.totalShots}</p>
                      </div>
                    </div>
                    {overallStats.avgCompletionRate >= 80 && (
                      <div className="mt-4 p-3 bg-yellow-400/20 border border-yellow-400/30 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-300">
                          <Award className="w-5 h-5" />
                          <span className="text-sm font-semibold">Great Work!</span>
                        </div>
                        <p className="text-xs text-yellow-200 mt-1">
                          You're doing excellent! Keep it up! 🎉
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
