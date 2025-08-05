import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Wifi, 
  WifiOff, 
  Download, 
  Bell,
  Settings
} from 'lucide-react';
import { formatDate } from '@/utils';
import { usePWA } from '@/hooks/usePWA';
import type { Project, User } from '@/types';

interface PersistentHeaderProps {
  project: Project | null;
  user: User | null;
  isOffline?: boolean;
  pendingSyncCount?: number;
  onNotifications?: () => void;
  onSettings?: () => void;
}

export function PersistentHeader({ 
  project, 
  user, 
  isOffline = false, 
  pendingSyncCount = 0,
  onNotifications,
  onSettings 
}: PersistentHeaderProps) {
  const { isInstallable, installApp } = usePWA();
  
  if (!project || !user) return null;

  const userAssignment = project.assignments.find(a => a.userId === user.id);
  const userZone = userAssignment?.zones?.join(' + ') || userAssignment?.zone || 'Not assigned';

  return (
    <Card className="mb-4 border-l-4 border-l-primary bg-primary/5">
      <div className="p-3">
        {/* Main Project Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-primary">PROJECT:</span>
              <span className="text-sm font-bold truncate">{project.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                YOUR ZONE: {userZone}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Install App Button */}
            {isInstallable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={installApp}
                className="h-8 w-8 p-0"
                title="Install SLATE App"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {/* Notifications */}
            {onNotifications && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNotifications}
                className="h-8 w-8 p-0 relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {pendingSyncCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full text-[8px] text-white flex items-center justify-center">
                    {pendingSyncCount > 9 ? '9+' : pendingSyncCount}
                  </span>
                )}
              </Button>
            )}
            
            {/* Settings */}
            {onSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettings}
                className="h-8 w-8 p-0"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Status Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{formatDate(project.date)}</span>
            </div>
            
            {/* Team Size */}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.assignments.length} shooters</span>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {pendingSyncCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                {pendingSyncCount} pending
              </Badge>
            )}
            
            <div className="flex items-center gap-1">
              {isOffline ? (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span className="text-red-600 font-medium">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 font-medium">Connected</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Offline Notice */}
        {isOffline && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <strong>Offline Mode:</strong> Changes will sync automatically when connection is restored.
          </div>
        )}
      </div>
    </Card>
  );
}
