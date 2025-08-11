import { Wifi, WifiOff, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SyncStatusProps {
  isConnected: boolean;
  lastSync: Date | null;
  pendingItems: number;
  isSyncing: boolean;
  className?: string;
}

export function SyncStatus({ 
  isConnected, 
  lastSync, 
  pendingItems, 
  isSyncing,
  className = '' 
}: SyncStatusProps) {
  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    if (isSyncing) return 'bg-blue-500';
    if (!isConnected) return 'bg-red-500';
    if (pendingItems > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (!isConnected) return 'Offline';
    if (pendingItems > 0) return `${pendingItems} pending`;
    return 'Synced';
  };

  const getStatusIcon = () => {
    if (isSyncing) return <RefreshCw className="h-3 w-3 animate-spin" />;
    if (!isConnected) return <WifiOff className="h-3 w-3" />;
    if (pendingItems > 0) return <Clock className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Connection indicator */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <span className="text-xs font-medium">
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Sync status badge */}
      <Badge 
        variant="secondary"
        className={`${getStatusColor()} text-white text-xs px-2 py-1 flex items-center gap-1`}
      >
        {getStatusIcon()}
        {getStatusText()}
      </Badge>

      {/* Last sync time */}
      {lastSync && (
        <span className="text-xs text-gray-500">
          Last sync: {formatLastSync(lastSync)}
        </span>
      )}
    </div>
  );
}

interface OfflineIndicatorProps {
  isOffline: boolean;
  pendingItems: number;
  className?: string;
}

export function OfflineIndicator({ 
  isOffline, 
  pendingItems, 
  className = '' 
}: OfflineIndicatorProps) {
  if (!isOffline && pendingItems === 0) return null;

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-amber-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">
            {isOffline ? 'Working offline' : 'Sync pending'}
          </p>
          <p className="text-xs text-amber-600">
            {isOffline 
              ? `You have ${pendingItems} changes that will sync when you're back online.`
              : `${pendingItems} changes are waiting to sync.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}

interface SyncProgressProps {
  isSyncing: boolean;
  pendingItems: number;
  className?: string;
}

export function SyncProgress({ 
  isSyncing, 
  pendingItems, 
  className = '' 
}: SyncProgressProps) {
  if (!isSyncing && pendingItems === 0) return null;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <RefreshCw className={`h-4 w-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800">
            {isSyncing ? 'Syncing changes...' : 'Ready to sync'}
          </p>
          <p className="text-xs text-blue-600">
            {pendingItems} {pendingItems === 1 ? 'item' : 'items'} to sync
          </p>
        </div>
      </div>
    </div>
  );
}
