// Enhanced Offline Data Persistence for SLATE PWA with Background Sync

// Type definitions for data structures
interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface Checklist {
  id: string;
  projectId: string;
  title: string;
  items: ChecklistItem[];
  updatedAt?: string;
  [key: string]: unknown;
}

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  mustHave: boolean;
  completedAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface Shot {
  id: string;
  projectId: string;
  type: string;
  priority: string;
  description: string;
  addedBy: string;
  completed?: boolean;
  completedAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface User {
  id: string;
  name: string;
  role: string;
  zone?: string;
  lastSeen?: string;
  [key: string]: unknown;
}

interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'project' | 'checklist' | 'shot' | 'user';
  data: Project | Checklist | Shot | User;
  timestamp: string;
  retryCount: number;
  userId?: string;
}

interface ExportData {
  projects: Project[];
  checklists: Checklist[];
  shots: Shot[];
  users: User[];
  timestamp: string;
}

// Extend ServiceWorkerRegistration to include sync
declare global {
  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
}

export class OfflineDataManager {
  private dbName = 'slate-offline-data';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB for offline data storage
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('userId', 'userId', { unique: false });
          projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('checklists')) {
          const checklistStore = db.createObjectStore('checklists', { keyPath: 'id' });
          checklistStore.createIndex('projectId', 'projectId', { unique: false });
        }

        if (!db.objectStoreNames.contains('shots')) {
          const shotStore = db.createObjectStore('shots', { keyPath: 'id' });
          shotStore.createIndex('projectId', 'projectId', { unique: false });
          shotStore.createIndex('addedBy', 'addedBy', { unique: false });
        }

        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('role', 'role', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync-queue')) {
          const syncStore = db.createObjectStore('sync-queue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  // Save data to IndexedDB
  async saveData(storeName: string, data: Project | Checklist | Shot | User | SyncItem): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get data from IndexedDB
  async getData(storeName: string, key?: string): Promise<Project[] | Checklist[] | Shot[] | User[] | SyncItem[] | Project | Checklist | Shot | User | SyncItem | undefined> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = key ? store.get(key) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get data by index
  async getDataByIndex(storeName: string, indexName: string, value: string): Promise<(Project | Checklist | Shot | User)[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete data from IndexedDB
  async deleteData(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Queue data for sync when online
  async queueForSync(
    data: Project | Checklist | Shot | User, 
    type: 'create' | 'update' | 'delete',
    entity: 'project' | 'checklist' | 'shot' | 'user'
  ): Promise<void> {
    const syncItem: SyncItem = {
      id: Date.now().toString(),
      type,
      entity,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    await this.saveData('sync-queue', syncItem);
    
    // Register background sync if service worker supports it
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.sync) {
          await registration.sync.register('slate-background-sync');
        }
      } catch (error) {
        console.log('Background sync registration failed:', error);
      }
    }
  }

  // Get pending sync items
  async getPendingSyncItems(): Promise<SyncItem[]> {
    const result = await this.getData('sync-queue');
    return Array.isArray(result) ? result as SyncItem[] : [];
  }

  // Clear sync queue after successful sync
  async clearSyncQueue(): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync-queue'], 'readwrite');
      const store = transaction.objectStore('sync-queue');
      
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync data with server when online
  async syncWithServer(): Promise<void> {
    const pendingItems = await this.getPendingSyncItems();
    
    for (const item of pendingItems) {
      try {
        let response;
        
        switch (item.type) {
          case 'create':
            response = await fetch('/api/sync/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data)
            });
            break;
            
          case 'update':
            response = await fetch(`/api/sync/update/${item.data.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data)
            });
            break;
            
          case 'delete':
            response = await fetch(`/api/sync/delete/${item.data.id}`, {
              method: 'DELETE'
            });
            break;
        }

        if (response?.ok) {
          await this.deleteData('sync-queue', item.id);
          console.log('Synced item:', item.id);
        }
      } catch (error) {
        console.log('Failed to sync item:', item.id, error);
        // Increment retry count
        item.retryCount = (item.retryCount || 0) + 1;
        if (item.retryCount < 3) {
          await this.saveData('sync-queue', item);
        } else {
          // Delete after 3 failed attempts
          await this.deleteData('sync-queue', item.id);
        }
      }
    }
  }

  // Check if app is offline
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // Export all data for backup
  async exportAllData(): Promise<ExportData> {
    const projectsData = await this.getData('projects');
    const checklistsData = await this.getData('checklists');
    const shotsData = await this.getData('shots');
    const usersData = await this.getData('users');
    
    const data: ExportData = {
      projects: Array.isArray(projectsData) ? projectsData as Project[] : [],
      checklists: Array.isArray(checklistsData) ? checklistsData as Checklist[] : [],
      shots: Array.isArray(shotsData) ? shotsData as Shot[] : [],
      users: Array.isArray(usersData) ? usersData as User[] : [],
      timestamp: new Date().toISOString()
    };
    
    return data;
  }

  // Import data from backup
  async importData(data: ExportData): Promise<void> {
    if (data.projects) {
      for (const project of data.projects) {
        await this.saveData('projects', project);
      }
    }
    
    if (data.checklists) {
      for (const checklist of data.checklists) {
        await this.saveData('checklists', checklist);
      }
    }
    
    if (data.shots) {
      for (const shot of data.shots) {
        await this.saveData('shots', shot);
      }
    }
    
    if (data.users) {
      for (const user of data.users) {
        await this.saveData('users', user);
      }
    }
  }

  // Register background sync for data changes
  async registerBackgroundSync(tag: string = 'data-sync'): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.sync) {
          await registration.sync.register(tag);
          console.log('[OfflineManager] Background sync registered:', tag);
        }
      } catch (error) {
        console.error('[OfflineManager] Failed to register background sync:', error);
      }
    } else {
      console.warn('[OfflineManager] Background sync not supported');
    }
  }

  // Queue shot completion for background sync
  async queueShotCompletion(shotId: string, userId: string, completed: boolean): Promise<void> {
    if (!this.db) await this.initialize();
    
    const completionData = {
      id: `${shotId}_${Date.now()}`,
      shotId,
      userId,
      completed,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    const transaction = this.db!.transaction(['shot-completions'], 'readwrite');
    const store = transaction.objectStore('shot-completions');
    await store.add(completionData);
    
    // Register background sync
    await this.registerBackgroundSync('shot-completion');
  }

  // Queue user action for background sync
  async queueUserAction(action: string, data: unknown, userId: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    const actionData = {
      id: `${action}_${Date.now()}`,
      action,
      data,
      userId,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    const transaction = this.db!.transaction(['user-actions'], 'readwrite');
    const store = transaction.objectStore('user-actions');
    await store.add(actionData);
    
    // Register background sync
    await this.registerBackgroundSync('user-actions');
  }

  // Get sync statistics
  async getSyncStats(): Promise<{
    pendingDataChanges: number;
    pendingShotCompletions: number;
    pendingUserActions: number;
    lastSyncAttempt?: Date;
  }> {
    if (!this.db) await this.initialize();
    
    try {
      const [dataChanges, shotCompletions, userActions] = await Promise.all([
        this.getAllFromStore('sync-queue'),
        this.getAllFromStore('shot-completions'),
        this.getAllFromStore('user-actions')
      ]);

      return {
        pendingDataChanges: Array.isArray(dataChanges) ? dataChanges.length : 0,
        pendingShotCompletions: Array.isArray(shotCompletions) ? shotCompletions.length : 0,
        pendingUserActions: Array.isArray(userActions) ? userActions.length : 0,
        lastSyncAttempt: this.getLastSyncAttempt()
      };
    } catch (error) {
      console.error('[OfflineManager] Failed to get sync stats:', error);
      return {
        pendingDataChanges: 0,
        pendingShotCompletions: 0,
        pendingUserActions: 0
      };
    }
  }

  // Helper method to get all items from a store
  private async getAllFromStore(storeName: string): Promise<unknown[]> {
    if (!this.db) return [];
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.warn(`[OfflineManager] Store ${storeName} not found, returning empty array`);
        resolve([]);
      };
    });
  }

  private getLastSyncAttempt(): Date | undefined {
    const lastSync = localStorage.getItem('slate-last-sync');
    return lastSync ? new Date(lastSync) : undefined;
  }

  // Clear all sync queues (for testing/debugging)
  async clearAllSyncQueues(): Promise<void> {
    if (!this.db) await this.initialize();
    
    const storeNames = ['sync-queue', 'shot-completions', 'user-actions'];
    for (const storeName of storeNames) {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
  }
}

// Create singleton instance
export const offlineDataManager = new OfflineDataManager();
