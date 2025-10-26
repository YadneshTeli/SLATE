import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar, UserProfile } from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Wifi, 
  WifiOff, 
  Download, 
  Bell,
  Settings,
  X
} from 'lucide-react';
import { formatDate } from '@/utils';
import { usePWA } from '@/hooks/usePWA';
import type { Project } from '@/types';

interface PersistentHeaderProps {
  project: Project | null;
  isOffline?: boolean;
  pendingSyncCount?: number;
  onNotifications?: () => void;
  onSettings?: () => void;
}

export function PersistentHeader({ 
  project, 
  isOffline = false, 
  pendingSyncCount = 0,
  onNotifications,
  onSettings 
}: PersistentHeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();
  const { isInstallable, installApp } = usePWA();
  
  if (!project || !user) return null;

  const userAssignment = project.assignments.find(a => a.userId === user.id);
  const userZone = userAssignment?.zones?.join(' + ') || userAssignment?.zone || 'Not assigned';

  return (
    <Card className="mb-3 sm:mb-4 border-l-4 border-l-primary bg-primary/5">
      <div className="p-2 sm:p-3">
        {/* Main Project Info */}
        <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs sm:text-sm font-medium text-primary">PROJECT:</span>
              <span className="text-xs sm:text-sm font-bold truncate">{project.name}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                ZONE: {userZone}
              </span>
            </div>
          </div>
          
          {/* Action Buttons - Simplified for mobile */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {/* User Profile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfile(!showProfile)}
              className="h-8 px-1 sm:px-2 gap-1 sm:gap-2 touch-manipulation"
              title="User Profile"
            >
              <UserAvatar user={user} size="sm" />
              <span className="hidden md:inline text-xs font-medium">{user.name}</span>
            </Button>
            
            {/* Install App Button - Hidden on mobile if notifications exist */}
            {isInstallable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={installApp}
                className="hidden sm:flex h-8 w-8 p-0 touch-manipulation"
                title="Install SLATE App"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {/* Notifications - Only show icon on mobile */}
            {onNotifications && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNotifications}
                className="h-8 w-8 p-0 relative touch-manipulation"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {pendingSyncCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 sm:h-3 sm:w-3 bg-orange-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                    {pendingSyncCount > 9 ? '9+' : pendingSyncCount}
                  </span>
                )}
              </Button>
            )}
            
            {/* Settings - Hidden on small mobile */}
            {onSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettings}
                className="hidden xs:flex h-8 w-8 p-0 touch-manipulation"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Status Row - Responsive layout */}
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 xs:gap-0 text-xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.date ? formatDate(project.date) : 'No date set'}</span>
            </div>
            
            {/* Team Size */}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.assignments.length} shooters</span>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {pendingSyncCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                {pendingSyncCount} pending
              </Badge>
            )}
            
            <div className="flex items-center gap-1">
              {isOffline ? (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span className="text-red-600 font-medium text-[10px] sm:text-xs">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 font-medium text-[10px] sm:text-xs">Connected</span>
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
        
        {/* User Profile Dropdown */}
        {showProfile && (
          <div className="mt-3 relative">
            <div className="absolute top-0 right-0 z-10 w-80 max-w-full">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfile(false)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white border border-gray-200 rounded-full hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                </Button>
                <UserProfile 
                  showHeader={false}
                  className="bg-white border shadow-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
