import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { offlineDataManager } from '../utils/offlineDataManager';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const updatePendingCount = async () => {
      try {
        const pending = await offlineDataManager.getPendingSyncItems();
        setPendingSync(pending.length);
      } catch (error) {
        console.error('Failed to get pending sync items:', error);
      }
    };

    const handleSync = async () => {
      if (!isOnline) return;
      
      setIsSyncing(true);
      try {
        await offlineDataManager.syncWithServer();
        await updatePendingCount();
      } catch (error) {
        console.error('Sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    updatePendingCount();

    // Periodic check for pending items
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const handleManualSync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    try {
      await offlineDataManager.syncWithServer();
      const pending = await offlineDataManager.getPendingSyncItems();
      setPendingSync(pending.length);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingSync === 0) {
    return null; // Don't show when online and no pending sync
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg cursor-pointer transition-all
          ${isOnline 
            ? 'bg-green-100 border border-green-300 text-green-800' 
            : 'bg-red-100 border border-red-300 text-red-800'
          }
          hover:shadow-xl
        `}
        onClick={() => setShowDetails(!showDetails)}
      >
        {isOnline ? (
          <>
            <Wifi size={16} />
            <span className="text-sm font-medium">
              {isSyncing ? 'Syncing...' : `${pendingSync} pending`}
            </span>
            {isSyncing && <div className="animate-spin">⟳</div>}
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span className="text-sm font-medium">Offline</span>
            {pendingSync > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {pendingSync}
              </span>
            )}
          </>
        )}
      </div>

      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border rounded-lg shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">
              Connection Status
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-green-800">Connected to internet</span>
                </>
              ) : (
                <>
                  <AlertCircle size={20} className="text-red-600" />
                  <span className="text-red-800">No internet connection</span>
                </>
              )}
            </div>

            {pendingSync > 0 && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Upload size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {pendingSync} items waiting to sync
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Your changes are saved locally and will sync automatically when online.
                </p>
              </div>
            )}

            {isOnline && pendingSync > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}

            {!isOnline && (
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Offline Mode Active
                </h4>
                <p className="text-xs text-blue-600">
                  You can continue working. All changes will be saved locally and synced when you're back online.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
