import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, Camera, Video, FolderOpen, BarChart3, Clock } from 'lucide-react';
import { gsap } from 'gsap';
import { PageTransition, FadeIn, ScaleIn, StaggeredList } from '@/components/animations/PageTransitions';
import { useApp } from '@/hooks/useApp';
import { formatDate } from '@/utils';
import type { ShotItem, Project, Checklist } from '@/types';

interface DashboardStatsProps {
  projects: Project[];
  shotItems: ShotItem[];
  checklists: Checklist[];
}

function DashboardStats({ projects, shotItems, checklists }: DashboardStatsProps) {
  const totalShots = shotItems.length;
  const completedShots = shotItems.filter(item => item.isCompleted).length;
  const completionRate = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;
  
  const totalShooters = [...new Set(projects.flatMap(p => (p.assignments || []).map(a => a.userId)))].length;

  const stats = [
    {
      title: 'Total Projects',
      value: projects.length,
      icon: FolderOpen,
      color: 'bg-blue-500',
      subtitle: `${checklists.length} checklists`
    },
    {
      title: 'Total Shots',
      value: totalShots,
      icon: Camera,
      color: 'bg-purple-500',
      subtitle: `${completedShots} completed`
    },
    {
      title: 'Overall Progress',
      value: `${completionRate}%`,
      icon: BarChart3,
      color: 'bg-green-500',
      subtitle: `${completedShots}/${totalShots} shots`
    },
    {
      title: 'Active Shooters',
      value: totalShooters,
      icon: Users,
      color: 'bg-orange-500',
      subtitle: `Across all projects`
    }
  ];

  return (
    <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${stat.color} text-white flex-shrink-0`}>
                <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </StaggeredList>
  );
}

interface RecentActivityProps {
  shotItems: ShotItem[];
}

function RecentActivity({ shotItems }: RecentActivityProps) {
  const recentItems = shotItems
    .filter(item => item.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5);

  return (
    <FadeIn delay={0.4}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm sm:text-base">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Latest completed shots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {recentItems.map((item, index) => (
              <FadeIn key={`${item.id}-${item.completedAt}-${index}`} delay={0.1 * index}>
                <div className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors touch-manipulation">
                  <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                    item.type === 'photo' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {item.type === 'photo' ? <Camera className="w-3 h-3 sm:w-4 sm:h-4" /> : <Video className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-slate-900 truncate">{item.title}</p>
                    <p className="text-xs sm:text-sm text-slate-600 truncate">
                      Completed {item.completedAt ? new Date(item.completedAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                  <Badge 
                    variant={item.priority === 'must-have' ? 'destructive' : 'secondary'}
                    className="flex-shrink-0 text-[10px] sm:text-xs"
                  >
                    {item.priority}
                  </Badge>
                </div>
              </FadeIn>
            ))}
            {recentItems.length === 0 && (
              <p className="text-center text-xs sm:text-sm text-slate-500 py-6 sm:py-8">No completed shots yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

interface ProgressOverviewProps {
  project: Project;
  shotItems: ShotItem[];
}

function ProgressOverview({ project, shotItems }: ProgressOverviewProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const totalShots = shotItems.length;
  const completedShots = shotItems.filter(item => item.isCompleted).length;
  const completionRate = totalShots > 0 ? (completedShots / totalShots) * 100 : 0;

  useEffect(() => {
    if (progressRef.current) {
      // Animate progress bar
      gsap.fromTo(
        progressRef.current.querySelector('.progress-fill'),
        { width: '0%' },
        { width: `${completionRate}%`, duration: 1.5, ease: 'power2.out', delay: 0.5 }
      );
    }
  }, [completionRate]);

  return (
    <FadeIn delay={0.2}>
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>{project.name} - Overall completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={progressRef} className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Overall Progress</span>
              <span className="text-sm font-bold text-slate-900">{Math.round(completionRate)}%</span>
            </div>
            <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className="progress-fill absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
                style={{ width: '0%' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedShots}</p>
                <p className="text-sm text-slate-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-600">{totalShots - completedShots}</p>
                <p className="text-sm text-slate-600">Remaining</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

export function EnhancedAdminDashboard() {
  const { state } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  
  if (state.projects.length === 0) {
    return (
      <PageTransition className="text-center py-12">
        <ScaleIn>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">No Projects</h3>
            <p className="text-sm sm:text-base text-slate-600">Create your first project to get started!</p>
          </div>
        </ScaleIn>
      </PageTransition>
    );
  }

  // Get filtered projects based on selection
  const filteredProjects = selectedProjectId === 'all' 
    ? state.projects 
    : state.projects.filter(p => p.id === selectedProjectId);

  // Get checklists for filtered projects
  const filteredChecklists = state.checklists.filter(
    checklist => filteredProjects.some(p => p.id === checklist.projectId)
  );

  // Get shot items for filtered projects
  const filteredShotItems = state.shotItems.filter(
    item => filteredChecklists.some(checklist => checklist.id === item.checklistId)
  );

  return (
    <PageTransition className="space-y-4 sm:space-y-6">
      {/* Project Filter */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 truncate">Dashboard Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 truncate">
              {selectedProjectId === 'all' 
                ? `Showing all ${state.projects.length} projects` 
                : `Viewing: ${filteredProjects[0]?.name || 'Unknown'}`}
            </p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full sm:w-[220px] min-h-[44px] touch-manipulation">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <span>All Projects</span>
                    <Badge variant="secondary" className="ml-auto">{state.projects.length}</Badge>
                  </div>
                </SelectItem>
                {state.projects.map(project => (
                  <SelectItem key={project.id} value={project.id} className="min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[160px]">{project.name}</span>
                      <Badge 
                        variant={project.status === 'active' ? 'default' : 'secondary'}
                        className="ml-auto text-[10px]"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FadeIn>

      {/* Dashboard Stats */}
      <DashboardStats 
        projects={filteredProjects} 
        shotItems={filteredShotItems}
        checklists={filteredChecklists}
      />

      {/* Project Cards for "All Projects" view */}
      {selectedProjectId === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredProjects.map((project, index) => {
            const projectChecklists = state.checklists.filter(c => c.projectId === project.id);
            const projectShots = state.shotItems.filter(
              item => projectChecklists.some(checklist => checklist.id === item.checklistId)
            );
            const completedShots = projectShots.filter(item => item.isCompleted).length;
            const completionRate = projectShots.length > 0 
              ? Math.round((completedShots / projectShots.length) * 100) 
              : 0;

            return (
              <FadeIn key={project.id} delay={0.1 * index}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer touch-manipulation" onClick={() => setSelectedProjectId(project.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{project.name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">
                          {project.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="flex-shrink-0">
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <div className="text-center">
                        <p className="text-xs text-slate-600">Shots</p>
                        <p className="text-sm sm:text-base font-semibold">{projectShots.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600">Completed</p>
                        <p className="text-sm sm:text-base font-semibold text-green-600">{completedShots}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600">Shooters</p>
                        <p className="text-sm sm:text-base font-semibold">{project.assignments?.length || 0}</p>
                      </div>
                    </div>
                    {project.date && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 pt-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(project.date)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      )}

      {/* Single Project View */}
      {selectedProjectId !== 'all' && filteredProjects[0] && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ProgressOverview project={filteredProjects[0]} shotItems={filteredShotItems} />
          <RecentActivity shotItems={filteredShotItems} />
        </div>
      )}
    </PageTransition>
  );
}
