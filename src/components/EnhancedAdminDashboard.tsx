import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CheckCircle, AlertCircle, Clock, TrendingUp, Camera, Video } from 'lucide-react';
import { gsap } from 'gsap';
import { PageTransition, FadeIn, ScaleIn, StaggeredList } from '@/components/animations/PageTransitions';
import { useApp } from '@/hooks/useApp';
import { formatDate } from '@/utils';
import type { ShotItem, Project } from '@/types';

interface DashboardStatsProps {
  project: Project;
  shotItems: ShotItem[];
}

function DashboardStats({ project, shotItems }: DashboardStatsProps) {
  const totalShots = shotItems.length;
  const completedShots = shotItems.filter(item => item.isCompleted).length;
  const mustHaveShots = shotItems.filter(item => item.priority === 'must-have').length;
  const completedMustHaveShots = shotItems.filter(item => item.priority === 'must-have' && item.isCompleted).length;
  const completionRate = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;
  const mustHaveRate = mustHaveShots > 0 ? Math.round((completedMustHaveShots / mustHaveShots) * 100) : 0;

  const stats = [
    {
      title: 'Total Shots',
      value: totalShots,
      icon: Camera,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Completed',
      value: completedShots,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: `${completionRate}%`
    },
    {
      title: 'Must-Have Progress',
      value: `${completedMustHaveShots}/${mustHaveShots}`,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: `${mustHaveRate}%`
    },
    {
      title: 'Active Shooters',
      value: project.assignments.length,
      icon: Users,
      color: 'bg-purple-500',
      change: '+2'
    }
  ];

  return (
    <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                <stat.icon className="w-6 h-6" />
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
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest completed shots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentItems.map((item, index) => (
              <FadeIn key={item.id} delay={0.1 * index}>
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={`p-2 rounded-full ${
                    item.type === 'photo' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {item.type === 'photo' ? <Camera className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-600">
                      Completed {item.completedAt ? new Date(item.completedAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                  <Badge variant={item.priority === 'must-have' ? 'destructive' : 'secondary'}>
                    {item.priority}
                  </Badge>
                </div>
              </FadeIn>
            ))}
            {recentItems.length === 0 && (
              <p className="text-center text-slate-500 py-8">No completed shots yet</p>
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
  const currentProject = state.currentProject || state.projects[0];
  
  const projectShotItems = state.shotItems.filter(item => {
    const checklist = state.checklists.find(c => c.id === item.checklistId);
    return checklist && checklist.projectId === currentProject?.id;
  });

  if (!currentProject) {
    return (
      <PageTransition className="text-center py-12">
        <ScaleIn>
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Project Selected</h3>
            <p className="text-slate-600">Please select or create a project to view the dashboard</p>
          </div>
        </ScaleIn>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      {/* Project Header */}
      <FadeIn>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{currentProject.name}</h1>
            <p className="text-slate-600 mt-1">{currentProject.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={currentProject.status === 'active' ? 'default' : 'secondary'}>
                {currentProject.status}
              </Badge>
              <span className="text-sm text-slate-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {currentProject.date ? formatDate(new Date(currentProject.date)) : 'No date set'}
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Dashboard Stats */}
      <DashboardStats project={currentProject} shotItems={projectShotItems} />

      {/* Progress and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProgressOverview project={currentProject} shotItems={projectShotItems} />
        <RecentActivity shotItems={projectShotItems} />
      </div>
    </PageTransition>
  );
}
