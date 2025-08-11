import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  serverTimestamp,
  query,
  orderByChild,
  equalTo,
  DataSnapshot
} from 'firebase/database';
import { database } from './firebase';
import type { User, Project, Checklist, ShotItem } from '@/types';

// Database paths
const PATHS = {
  USERS: 'users',
  PROJECTS: 'projects',
  CHECKLISTS: 'checklists',
  SHOT_ITEMS: 'shotItems',
  PROJECT_PROGRESS: 'projectProgress'
} as const;

// Error handling wrapper with enhanced offline support
const handleRealtimeError = (operation: string, error: unknown) => {
  console.error(`[Realtime Database] ${operation} failed:`, error);
  
  if (error instanceof Error) {
    // Check for specific Firebase errors
    const firebaseError = error as Error & { code?: string; message?: string };
    
    if (firebaseError.code?.includes('PERMISSION_DENIED')) {
      console.error('[Realtime Database] Permission denied - check security rules');
      return new Error('Access denied - please check your permissions');
    } else if (firebaseError.code?.includes('NETWORK_ERROR')) {
      console.log('[Realtime Database] Network issue detected, operation will retry when online');
      return new Error('Currently offline - operations will sync when connection is restored');
    } else if (firebaseError.code?.includes('UNAVAILABLE')) {
      console.warn('[Realtime Database] Service temporarily unavailable');
      return new Error('Service temporarily unavailable - please try again');
    }
    
    // Log the full error for debugging
    console.error('[Realtime Database] Full error details:', {
      code: firebaseError.code,
      message: firebaseError.message,
      operation
    });
  }
  
  throw error;
};

// Utility function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Utility function to convert snapshot to typed object
const convertSnapshot = <T>(snapshot: DataSnapshot): T | null => {
  if (!snapshot.exists()) return null;
  
  const data = snapshot.val();
  return {
    id: snapshot.key,
    ...data
  } as T;
};

// Utility function to convert multiple snapshots to typed objects
const convertSnapshotList = <T>(snapshot: DataSnapshot): T[] => {
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.keys(data).map(key => ({
    id: key,
    ...data[key]
  })) as T[];
};

// User operations
export const userService = {
  async create(user: Omit<User, 'id'>): Promise<string> {
    try {
      const id = generateId();
      const userRef = ref(database, `${PATHS.USERS}/${id}`);
      await set(userRef, {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return id;
    } catch (error) {
      handleRealtimeError('create user', error);
      throw error;
    }
  },

  async getById(id: string): Promise<User | null> {
    try {
      const userRef = ref(database, `${PATHS.USERS}/${id}`);
      const snapshot = await get(userRef);
      return convertSnapshot<User>(snapshot);
    } catch (error) {
      handleRealtimeError('get user by id', error);
      throw error;
    }
  },

  async getByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = ref(database, PATHS.USERS);
      const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
      const snapshot = await get(emailQuery);
      
      if (snapshot.exists()) {
        const users = convertSnapshotList<User>(snapshot);
        return users[0] || null;
      }
      return null;
    } catch (error) {
      handleRealtimeError('get user by email', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = ref(database, `${PATHS.USERS}/${id}`);
      await update(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleRealtimeError('update user', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const userRef = ref(database, `${PATHS.USERS}/${id}`);
      await remove(userRef);
    } catch (error) {
      handleRealtimeError('delete user', error);
      throw error;
    }
  }
};

// Project operations
export const projectService = {
  async create(project: Omit<Project, 'id'>): Promise<string> {
    try {
      const id = generateId();
      const projectRef = ref(database, `${PATHS.PROJECTS}/${id}`);
      await set(projectRef, {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return id;
    } catch (error) {
      handleRealtimeError('create project', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Project | null> {
    try {
      const projectRef = ref(database, `${PATHS.PROJECTS}/${id}`);
      const snapshot = await get(projectRef);
      return convertSnapshot<Project>(snapshot);
    } catch (error) {
      handleRealtimeError('get project by id', error);
      throw error;
    }
  },

  async getByUserId(userId: string): Promise<Project[]> {
    try {
      const projectsRef = ref(database, PATHS.PROJECTS);
      const snapshot = await get(projectsRef);
      
      if (snapshot.exists()) {
        const allProjects = convertSnapshotList<Project>(snapshot);
        // Filter projects where user is assigned
        return allProjects.filter(project => 
          project.assignments?.some(assignment => assignment.userId === userId)
        );
      }
      return [];
    } catch (error) {
      handleRealtimeError('get projects by user id', error);
      throw error;
    }
  },

  async getAll(): Promise<Project[]> {
    try {
      const projectsRef = ref(database, PATHS.PROJECTS);
      const projectsQuery = query(projectsRef, orderByChild('date'));
      const snapshot = await get(projectsQuery);
      return convertSnapshotList<Project>(snapshot);
    } catch (error) {
      handleRealtimeError('get all projects', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Project>): Promise<void> {
    try {
      const projectRef = ref(database, `${PATHS.PROJECTS}/${id}`);
      await update(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleRealtimeError('update project', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const projectRef = ref(database, `${PATHS.PROJECTS}/${id}`);
      await remove(projectRef);
    } catch (error) {
      handleRealtimeError('delete project', error);
      throw error;
    }
  },

  // Real-time subscription
  subscribeToProjects(userId: string, callback: (projects: Project[]) => void): () => void {
    const projectsRef = ref(database, PATHS.PROJECTS);
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allProjects = convertSnapshotList<Project>(snapshot);
        const userProjects = allProjects.filter(project => 
          project.assignments?.some(assignment => assignment.userId === userId)
        );
        callback(userProjects);
      } else {
        callback([]);
      }
    });

    return () => off(projectsRef, 'value', unsubscribe);
  }
};

// Checklist operations
export const checklistService = {
  async create(checklist: Omit<Checklist, 'id'>): Promise<string> {
    try {
      const id = generateId();
      const checklistRef = ref(database, `${PATHS.CHECKLISTS}/${id}`);
      await set(checklistRef, {
        ...checklist,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return id;
    } catch (error) {
      handleRealtimeError('create checklist', error);
      throw error;
    }
  },

  async getByProjectId(projectId: string): Promise<Checklist[]> {
    try {
      const checklistsRef = ref(database, PATHS.CHECKLISTS);
      const projectQuery = query(checklistsRef, orderByChild('projectId'), equalTo(projectId));
      const snapshot = await get(projectQuery);
      return convertSnapshotList<Checklist>(snapshot);
    } catch (error) {
      handleRealtimeError('get checklists by project id', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Checklist>): Promise<void> {
    try {
      const checklistRef = ref(database, `${PATHS.CHECKLISTS}/${id}`);
      await update(checklistRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleRealtimeError('update checklist', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const checklistRef = ref(database, `${PATHS.CHECKLISTS}/${id}`);
      await remove(checklistRef);
    } catch (error) {
      handleRealtimeError('delete checklist', error);
      throw error;
    }
  },

  // Real-time subscription
  subscribeToChecklists(projectId: string, callback: (checklists: Checklist[]) => void): () => void {
    const checklistsRef = ref(database, PATHS.CHECKLISTS);
    const projectQuery = query(checklistsRef, orderByChild('projectId'), equalTo(projectId));
    
    const unsubscribe = onValue(projectQuery, (snapshot) => {
      const checklists = convertSnapshotList<Checklist>(snapshot);
      callback(checklists);
    });

    return () => off(checklistsRef, 'value', unsubscribe);
  }
};

// Shot item operations
export const shotItemService = {
  async create(shotItem: Omit<ShotItem, 'id'>): Promise<string> {
    try {
      const id = generateId();
      const shotItemRef = ref(database, `${PATHS.SHOT_ITEMS}/${id}`);
      await set(shotItemRef, {
        ...shotItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return id;
    } catch (error) {
      handleRealtimeError('create shot item', error);
      throw error;
    }
  },

  async getByChecklistId(checklistId: string): Promise<ShotItem[]> {
    try {
      const shotItemsRef = ref(database, PATHS.SHOT_ITEMS);
      const checklistQuery = query(shotItemsRef, orderByChild('checklistId'), equalTo(checklistId));
      const snapshot = await get(checklistQuery);
      return convertSnapshotList<ShotItem>(snapshot);
    } catch (error) {
      handleRealtimeError('get shot items by checklist id', error);
      throw error;
    }
  },

  async getByProjectId(projectId: string): Promise<ShotItem[]> {
    try {
      // First get all checklists for the project
      const checklists = await checklistService.getByProjectId(projectId);
      const checklistIds = checklists.map(c => c.id);
      
      if (checklistIds.length === 0) return [];
      
      // Get all shot items and filter by checklist IDs
      const shotItemsRef = ref(database, PATHS.SHOT_ITEMS);
      const snapshot = await get(shotItemsRef);
      
      if (snapshot.exists()) {
        const allShotItems = convertSnapshotList<ShotItem>(snapshot);
        return allShotItems.filter(item => checklistIds.includes(item.checklistId));
      }
      return [];
    } catch (error) {
      handleRealtimeError('get shot items by project id', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<ShotItem>): Promise<void> {
    try {
      const shotItemRef = ref(database, `${PATHS.SHOT_ITEMS}/${id}`);
      await update(shotItemRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleRealtimeError('update shot item', error);
      throw error;
    }
  },

  async toggleCompletion(id: string, userId: string): Promise<void> {
    try {
      const shotItemRef = ref(database, `${PATHS.SHOT_ITEMS}/${id}`);
      const snapshot = await get(shotItemRef);
      
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const isCompleted = currentData.isCompleted;
        
        await update(shotItemRef, {
          isCompleted: !isCompleted,
          completedAt: !isCompleted ? serverTimestamp() : null,
          completedBy: !isCompleted ? userId : null,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleRealtimeError('toggle shot item completion', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const shotItemRef = ref(database, `${PATHS.SHOT_ITEMS}/${id}`);
      await remove(shotItemRef);
    } catch (error) {
      handleRealtimeError('delete shot item', error);
      throw error;
    }
  },

  // Real-time subscription for project shot items
  subscribeToProjectShotItems(projectId: string, callback: (shotItems: ShotItem[]) => void): () => void {
    const shotItemsRef = ref(database, PATHS.SHOT_ITEMS);
    
    const unsubscribe = onValue(shotItemsRef, async (snapshot) => {
      try {
        if (snapshot.exists()) {
          const allShotItems = convertSnapshotList<ShotItem>(snapshot);
          
          // Get checklists for this project to filter shot items
          const checklists = await checklistService.getByProjectId(projectId);
          const checklistIds = checklists.map(c => c.id);
          
          const projectShotItems = allShotItems.filter(item => 
            checklistIds.includes(item.checklistId)
          );
          
          callback(projectShotItems);
        } else {
          callback([]);
        }
      } catch (error) {
        console.error('Error in shot items subscription:', error);
        callback([]);
      }
    });

    return () => off(shotItemsRef, 'value', unsubscribe);
  }
};

// Batch operations (simplified for Realtime Database)
export const batchService = {
  async syncMultipleItems(items: Array<{
    path: string;
    id?: string;
    data: Record<string, unknown>;
    operation: 'create' | 'update' | 'delete';
  }>): Promise<void> {
    try {
      const updates: Record<string, unknown> = {};
      
      items.forEach(item => {
        if (item.operation === 'create') {
          const id = item.id || generateId();
          updates[`${item.path}/${id}`] = {
            ...item.data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
        } else if (item.operation === 'update' && item.id) {
          updates[`${item.path}/${item.id}`] = {
            ...item.data,
            updatedAt: serverTimestamp()
          };
        } else if (item.operation === 'delete' && item.id) {
          updates[`${item.path}/${item.id}`] = null;
        }
      });
      
      await update(ref(database), updates);
    } catch (error) {
      handleRealtimeError('batch sync', error);
      throw error;
    }
  }
};

// Connection status
export const connectionService = {
  isOnline(): boolean {
    return navigator.onLine;
  },

  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },

  // Firebase Realtime Database connection monitoring
  monitorConnection(callback: (connected: boolean) => void): () => void {
    const connectedRef = ref(database, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      callback(snapshot.val() === true);
    });

    return () => off(connectedRef, 'value', unsubscribe);
  }
};
