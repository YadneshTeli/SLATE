import { useEffect, useCallback, useRef } from 'react';
import { 
  projectService, 
  checklistService, 
  shotItemService, 
  connectionService,
  batchService 
} from './realtimeService';
import { offlineDataManager } from '@/utils/offlineDataManager';
import type { User, Project, Checklist, ShotItem } from '@/types';

// Action types for the dispatch function
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_CHECKLISTS'; payload: Checklist[] }
  | { type: 'SET_SHOT_ITEMS'; payload: ShotItem[] }
  | { type: 'ADD_SHOT_ITEM'; payload: ShotItem }
  | { type: 'TOGGLE_SHOT_COMPLETION'; payload: { id: string; userId: string } }
  | { type: 'SET_OFFLINE_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'ADD_PENDING_SYNC'; payload: string }
  | { type: 'CLEAR_PENDING_SYNC' };

export interface SyncServiceProps {
  user: User | null;
  currentProject: Project | null;
  isOffline: boolean;
  pendingSyncItems: string[];
  dispatch: React.Dispatch<AppAction>;
}

export interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  pendingItems: number;
  isSyncing: boolean;
}

export class RealTimeSyncService {
  private unsubscribes: (() => void)[] = [];
  private syncStatus: SyncStatus = {
    isConnected: navigator.onLine,
    lastSync: null,
    pendingItems: 0,
    isSyncing: false
  };
  private onStatusChange?: (status: SyncStatus) => void;

  constructor(onStatusChange?: (status: SyncStatus) => void) {
    this.onStatusChange = onStatusChange;
    this.setupConnectionMonitoring();
  }

  private setupConnectionMonitoring() {
    const unsubscribe = connectionService.onConnectionChange((isOnline) => {
      this.syncStatus.isConnected = isOnline;
      this.notifyStatusChange();
      
      if (isOnline) {
        this.syncPendingItems();
      }
    });
    
    this.unsubscribes.push(unsubscribe);
  }

  private notifyStatusChange() {
    if (this.onStatusChange) {
      this.onStatusChange({ ...this.syncStatus });
    }
  }

  async subscribeToUserProjects(userId: string, onProjectsChange: (projects: Project[]) => void) {
    if (!this.syncStatus.isConnected) return;

    try {
      const unsubscribe = projectService.subscribeToProjects(userId, (projects) => {
        onProjectsChange(projects);
        this.syncStatus.lastSync = new Date();
        this.notifyStatusChange();
      });
      
      this.unsubscribes.push(unsubscribe);
    } catch (error) {
      console.error('Failed to subscribe to projects:', error);
    }
  }

  async subscribeToProjectData(
    projectId: string, 
    onChecklistsChange: (checklists: Checklist[]) => void,
    onShotItemsChange: (shotItems: ShotItem[]) => void
  ) {
    if (!this.syncStatus.isConnected) return;

    try {
      // Subscribe to checklists
      const checklistsUnsubscribe = checklistService.subscribeToChecklists(projectId, (checklists) => {
        onChecklistsChange(checklists);
        this.syncStatus.lastSync = new Date();
        this.notifyStatusChange();
      });

      // Subscribe to shot items
      const shotItemsUnsubscribe = shotItemService.subscribeToProjectShotItems(projectId, (shotItems) => {
        onShotItemsChange(shotItems);
        this.syncStatus.lastSync = new Date();
        this.notifyStatusChange();
      });

      this.unsubscribes.push(checklistsUnsubscribe, shotItemsUnsubscribe);
    } catch (error) {
      console.error('Failed to subscribe to project data:', error);
    }
  }

  async syncPendingItems() {
    if (!this.syncStatus.isConnected || this.syncStatus.isSyncing) return;

    this.syncStatus.isSyncing = true;
    this.notifyStatusChange();

    try {
      const pendingItems = await offlineDataManager.getPendingSyncItems();
      
      if (pendingItems.length === 0) {
        this.syncStatus.isSyncing = false;
        this.notifyStatusChange();
        return;
      }

      // Group items by operation for batch processing
      const batchItems = pendingItems.map(item => ({
        path: this.getPathName(item.id), // Using id to determine type for now
        id: item.type === 'create' ? undefined : item.data.id,
        data: this.prepareDataForSync(item.data),
        operation: item.type
      }));

      // Execute batch sync
      await batchService.syncMultipleItems(batchItems);

      // Clear synced items from offline storage
      await offlineDataManager.clearSyncQueue();

      this.syncStatus.pendingItems = 0;
      this.syncStatus.lastSync = new Date();
      this.syncStatus.isSyncing = false;
      this.notifyStatusChange();

      console.log(`Successfully synced ${pendingItems.length} items`);
    } catch (error) {
      console.error('Failed to sync pending items:', error);
      this.syncStatus.isSyncing = false;
      this.notifyStatusChange();
    }
  }

  private getPathName(itemId: string): string {
    // Simple heuristic based on ID pattern - in a real app, you'd store the type
    if (itemId.includes('shot') || itemId.includes('user-')) {
      return 'shotItems';
    }
    if (itemId.includes('checklist')) {
      return 'checklists';
    }
    if (itemId.includes('project')) {
      return 'projects';
    }
    return 'shotItems'; // Default to shotItems
  }

  private prepareDataForSync(data: Record<string, unknown>): Record<string, unknown> {
    // Remove any undefined values and prepare for Firestore
    const cleanData: Record<string, unknown> = {};
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        cleanData[key] = data[key];
      }
    });

    return cleanData;
  }

  async toggleShotCompletion(shotId: string, userId: string): Promise<void> {
    try {
      if (this.syncStatus.isConnected) {
        // Update directly in Firestore
        await shotItemService.toggleCompletion(shotId, userId);
      } else {
        // For offline mode, we'll handle this at the app level
        // The sync will happen when we come back online
        console.log('Offline mode - shot completion will sync when online');
      }
    } catch (error) {
      console.error('Failed to toggle shot completion:', error);
      throw error;
    }
  }

  async addShotItem(shotItem: Omit<ShotItem, 'id'>): Promise<string> {
    try {
      if (this.syncStatus.isConnected) {
        // Create directly in Firestore
        return await shotItemService.create(shotItem);
      } else {
        // Create locally with temp ID
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Convert to offline shot format
        const offlineShot = {
          id: tempId,
          projectId: '', // Will be set by the calling code
          type: shotItem.type,
          priority: shotItem.priority,
          description: shotItem.description || '',
          addedBy: shotItem.createdBy,
          title: shotItem.title,
          checklistId: shotItem.checklistId
        };

        await offlineDataManager.saveData('shots', offlineShot);
        await offlineDataManager.queueForSync(offlineShot, 'create');

        return tempId;
      }
    } catch (error) {
      console.error('Failed to add shot item:', error);
      throw error;
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  updatePendingItemsCount(count: number) {
    this.syncStatus.pendingItems = count;
    this.notifyStatusChange();
  }

  destroy() {
    // Unsubscribe from all listeners
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
    this.unsubscribes = [];
  }
}

// React hook for using the sync service
export function useSyncService(props: SyncServiceProps) {
  const syncServiceRef = useRef<RealTimeSyncService | null>(null);
  const { user, currentProject, isOffline, pendingSyncItems, dispatch } = props;

  // Initialize sync service
  useEffect(() => {
    const onStatusChange = (status: SyncStatus) => {
      dispatch({ type: 'SET_OFFLINE_STATUS', payload: !status.isConnected });
      if (status.lastSync) {
        dispatch({ type: 'SET_LAST_SYNC', payload: status.lastSync });
      }
    };

    syncServiceRef.current = new RealTimeSyncService(onStatusChange);

    return () => {
      if (syncServiceRef.current) {
        syncServiceRef.current.destroy();
      }
    };
  }, [dispatch]);

  // Subscribe to user projects when user changes
  useEffect(() => {
    if (user && syncServiceRef.current && !isOffline) {
      syncServiceRef.current.subscribeToUserProjects(user.id, (projects) => {
        dispatch({ type: 'SET_PROJECTS', payload: projects });
      });
    }
  }, [user, isOffline, dispatch]);

  // Subscribe to current project data when project changes
  useEffect(() => {
    if (currentProject && syncServiceRef.current && !isOffline) {
      syncServiceRef.current.subscribeToProjectData(
        currentProject.id,
        (checklists) => {
          dispatch({ type: 'SET_CHECKLISTS', payload: checklists });
        },
        (shotItems) => {
          dispatch({ type: 'SET_SHOT_ITEMS', payload: shotItems });
        }
      );
    }
  }, [currentProject, isOffline, dispatch]);

  // Update pending items count
  useEffect(() => {
    if (syncServiceRef.current) {
      syncServiceRef.current.updatePendingItemsCount(pendingSyncItems.length);
    }
  }, [pendingSyncItems.length]);

  // Sync pending items when coming back online
  useEffect(() => {
    if (!isOffline && syncServiceRef.current && pendingSyncItems.length > 0) {
      syncServiceRef.current.syncPendingItems().then(() => {
        dispatch({ type: 'CLEAR_PENDING_SYNC' });
      });
    }
  }, [isOffline, pendingSyncItems.length, dispatch]);

  // Enhanced toggle shot completion with real-time sync
  const toggleShotCompletion = useCallback(async (shotId: string) => {
    if (!user || !syncServiceRef.current) return;

    try {
      await syncServiceRef.current.toggleShotCompletion(shotId, user.id);
      
      // Update local state optimistically
      dispatch({
        type: 'TOGGLE_SHOT_COMPLETION',
        payload: { id: shotId, userId: user.id }
      });
    } catch (error) {
      console.error('Failed to toggle shot completion:', error);
    }
  }, [user, dispatch]);

  // Enhanced add shot item with real-time sync
  const addUserShotItem = useCallback(async (
    checklistId: string,
    title: string,
    type: 'photo' | 'video',
    priority: ShotItem['priority'] = 'nice-to-have',
    description?: string
  ): Promise<string | null> => {
    if (!user || !syncServiceRef.current) return null;

    try {
      const newItem: Omit<ShotItem, 'id'> = {
        checklistId,
        title,
        type,
        priority,
        description,
        isCompleted: false,
        createdBy: user.id,
        isUserAdded: true,
        order: 0, // Will be set properly in the service
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const id = await syncServiceRef.current.addShotItem(newItem);
      
      // Update local state
      dispatch({ 
        type: 'ADD_SHOT_ITEM', 
        payload: { ...newItem, id } 
      });

      if (isOffline) {
        dispatch({ type: 'ADD_PENDING_SYNC', payload: id });
      }

      return id;
    } catch (error) {
      console.error('Failed to add shot item:', error);
      return null;
    }
  }, [user, isOffline, dispatch]);

  const getSyncStatus = useCallback(() => {
    return syncServiceRef.current?.getSyncStatus() || {
      isConnected: navigator.onLine,
      lastSync: null,
      pendingItems: 0,
      isSyncing: false
    };
  }, []);

  return {
    toggleShotCompletion,
    addUserShotItem,
    getSyncStatus,
    syncService: syncServiceRef.current
  };
}
