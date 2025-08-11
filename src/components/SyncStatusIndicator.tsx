import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Upload, CheckCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { offlineDataManager } from '@/utils/offlineDataManager';
import { connectionService } from '@/lib/realtimeService';

interface SyncStatus {
  isOnline: boolean;
  isConnected: boolean;
  pendingDataChanges: number;
  pendingShotCompletions: number;
  pendingUserActions: number;
  lastSyncAttempt?: Date;
  isSyncing: boolean;
}

interface SyncStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function SyncStatusIndicator({ className = '', showDetails = false }: SyncStatusIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isConnected: false,
    pendingDataChanges: 0,
    pendingShotCompletions: 0,
    pendingUserActions: 0,
    isSyncing: false
  });

  useEffect(() => {
    let connectionUnsubscribe: (() => void) | null = null;
    let firebaseUnsubscribe: (() => void) | null = null;

    const updateSyncStats = async () => {
      try {
        const stats = await offlineDataManager.getSyncStats();
        setSyncStatus(prev => ({
          ...prev,
          ...stats
        }));
      } catch (error) {
        console.error('[SyncStatus] Failed to update sync stats:', error);
      }
    };

    const handleConnectionChange = (isOnline: boolean) => {
      setSyncStatus(prev => ({ ...prev, isOnline }));
      if (isOnline) {
        updateSyncStats();
      }
    };

    const handleFirebaseConnection = (isConnected: boolean) => {
      setSyncStatus(prev => ({ ...prev, isConnected }));
    };

    // Set up connection monitoring
    connectionUnsubscribe = connectionService.onConnectionChange(handleConnectionChange);
    firebaseUnsubscribe = connectionService.monitorConnection(handleFirebaseConnection);

    // Initial stats update
    updateSyncStats();

    // Update stats periodically
    const statsInterval = setInterval(updateSyncStats, 5000);

    return () => {
      if (connectionUnsubscribe) connectionUnsubscribe();
      if (firebaseUnsubscribe) firebaseUnsubscribe();
      clearInterval(statsInterval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!syncStatus.isOnline) return;
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await offlineDataManager.registerBackgroundSync('data-sync');
      await offlineDataManager.registerBackgroundSync('shot-completion');
      await offlineDataManager.registerBackgroundSync('user-actions');
    } catch (error) {
      console.error('[SyncStatus] Manual sync failed:', error);
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  };

  const getConnectionStatus = () => {
    if (!syncStatus.isOnline) {
      return { icon: WifiOff, color: 'text-red-500', text: 'Offline' };
    } else if (!syncStatus.isConnected) {
      return { icon: AlertCircle, color: 'text-yellow-500', text: 'Connecting...' };
    } else {
      return { icon: Wifi, color: 'text-green-500', text: 'Connected' };
    }
  };

  const getTotalPendingItems = () => {
    return syncStatus.pendingDataChanges + 
           syncStatus.pendingShotCompletions + 
           syncStatus.pendingUserActions;
  };

  const connectionStatus = getConnectionStatus();
  const totalPending = getTotalPendingItems();

  if (!showDetails) {
    // Compact indicator
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <connectionStatus.icon className={`w-4 h-4 ${connectionStatus.color}`} />
        {totalPending > 0 && (
          <Badge variant="secondary" className="text-xs">
            <Upload className="w-3 h-3 mr-1" />
            {totalPending}
          </Badge>
        )}
        {syncStatus.isSyncing && (
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Sync Status</h3>
        <button
          onClick={handleManualSync}
          disabled={!syncStatus.isOnline || syncStatus.isSyncing}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <RefreshCw 
            className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-3">
        <connectionStatus.icon className={`w-5 h-5 ${connectionStatus.color}`} />
        <span className="text-sm font-medium">{connectionStatus.text}</span>
      </div>

      {/* Sync Statistics */}
      {totalPending > 0 ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Pending Sync:</div>
          <div className="space-y-1">
            {syncStatus.pendingDataChanges > 0 && (
              <div className="flex justify-between text-xs">
                <span>Data Changes</span>
                <Badge variant="secondary">{syncStatus.pendingDataChanges}</Badge>
              </div>
            )}
            {syncStatus.pendingShotCompletions > 0 && (
              <div className="flex justify-between text-xs">
                <span>Shot Completions</span>
                <Badge variant="secondary">{syncStatus.pendingShotCompletions}</Badge>
              </div>
            )}
            {syncStatus.pendingUserActions > 0 && (
              <div className="flex justify-between text-xs">
                <span>User Actions</span>
                <Badge variant="secondary">{syncStatus.pendingUserActions}</Badge>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          All synced
        </div>
      )}

      {/* Last Sync Time */}
      {syncStatus.lastSyncAttempt && (
        <div className="mt-3 pt-2 border-t flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          Last sync: {syncStatus.lastSyncAttempt.toLocaleTimeString()}
        </div>
      )}

      {/* Sync Actions */}
      {!syncStatus.isOnline && totalPending > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
          Changes will sync automatically when connection is restored
        </div>
      )}
    </div>
  );
}

// Legacy component for backward compatibility
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
