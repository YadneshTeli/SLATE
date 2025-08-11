import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import type { DocumentData, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { User, Project, Checklist, ShotItem } from '@/types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  CHECKLISTS: 'checklists',
  SHOT_ITEMS: 'shotItems',
  PROJECT_PROGRESS: 'projectProgress'
} as const;

// Error handling wrapper with enhanced offline support
const handleFirestoreError = (operation: string, error: unknown) => {
  console.error(`[Firestore] ${operation} failed:`, error);
  
  if (error instanceof Error) {
    // Check for specific Firebase errors
    const firebaseError = error as Error & { code?: string; message?: string };
    
    // Handle 400 Bad Request errors specifically
    if (firebaseError.message?.includes('400') || firebaseError.message?.includes('Bad Request')) {
      console.warn('[Firestore] Bad Request - possibly due to authentication or network issues');
      return new Error('Firestore connection issue - please check your network and try again');
    }
    
    if (firebaseError.code?.includes('offline') || firebaseError.code?.includes('network')) {
      console.log('[Firestore] Network issue detected, operation will retry when online');
      return new Error('Currently offline - operations will sync when connection is restored');
    } else if (firebaseError.code === 'permission-denied') {
      console.error('[Firestore] Permission denied - check security rules');
      return new Error('Access denied - please check your permissions');
    } else if (firebaseError.code === 'not-found') {
      console.warn('[Firestore] Document not found');
      return new Error('Requested data not found');
    } else if (firebaseError.code === 'invalid-argument') {
      console.error('[Firestore] Invalid argument - check query parameters');
      return new Error('Invalid request parameters');
    } else if (firebaseError.code === 'deadline-exceeded') {
      console.error('[Firestore] Request timeout - try again later');
      return new Error('Request timeout - please try again');
    } else if (firebaseError.code === 'unauthenticated') {
      console.error('[Firestore] User not authenticated');
      return new Error('Please sign in to continue');
    } else if (firebaseError.code === 'unavailable') {
      console.warn('[Firestore] Service temporarily unavailable');
      return new Error('Service temporarily unavailable - please try again');
    }
    
    // Log the full error for debugging
    console.error('[Firestore] Full error details:', {
      code: firebaseError.code,
      message: firebaseError.message,
      operation
    });
  }
  
  throw error;
};

// Utility function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: unknown): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp as string);
};

// Utility function to convert Firestore document to typed object
const convertFirestoreDoc = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
  const data = doc.data();
  
  // Convert all timestamp fields to Date objects
  Object.keys(data).forEach(key => {
    if (key.includes('At') || key.includes('Date')) {
      data[key] = convertTimestamp(data[key]);
    }
  });
  
  return {
    id: doc.id,
    ...data
  } as T;
};

// User operations
export const userService = {
  async create(user: Omit<User, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError('create user', error);
      throw error;
    }
  },

  async getById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertFirestoreDoc<User>(docSnap as QueryDocumentSnapshot<DocumentData>);
      }
      return null;
    } catch (error) {
      handleFirestoreError('get user by id', error);
      throw error;
    }
  },

  async getByEmail(email: string): Promise<User | null> {
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return convertFirestoreDoc<User>(querySnapshot.docs[0]);
      }
      return null;
    } catch (error) {
      handleFirestoreError('get user by email', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError('update user', error);
      throw error;
    }
  }
};

// Project operations
export const projectService = {
  async create(project: Omit<Project, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError('create project', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Project | null> {
    try {
      const docRef = doc(db, COLLECTIONS.PROJECTS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertFirestoreDoc<Project>(docSnap as QueryDocumentSnapshot<DocumentData>);
      }
      return null;
    } catch (error) {
      handleFirestoreError('get project by id', error);
      throw error;
    }
  },

  async getByUserId(userId: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PROJECTS),
        where('assignments', 'array-contains-any', [{ userId }]),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => convertFirestoreDoc<Project>(doc));
    } catch (error) {
      handleFirestoreError('get projects by user id', error);
      throw error;
    }
  },

  async getAll(): Promise<Project[]> {
    const q = query(collection(db, COLLECTIONS.PROJECTS), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => convertFirestoreDoc<Project>(doc));
  },

  async update(id: string, updates: Partial<Project>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    await deleteDoc(docRef);
  },

  // Real-time subscription
  subscribeToProjects(userId: string, callback: (projects: Project[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where('assignments', 'array-contains-any', [{ userId }]),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => convertFirestoreDoc<Project>(doc));
      callback(projects);
    });
  }
};

// Checklist operations
export const checklistService = {
  async create(checklist: Omit<Checklist, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CHECKLISTS), {
      ...checklist,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getByProjectId(projectId: string): Promise<Checklist[]> {
    const q = query(
      collection(db, COLLECTIONS.CHECKLISTS),
      where('projectId', '==', projectId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => convertFirestoreDoc<Checklist>(doc));
  },

  async update(id: string, updates: Partial<Checklist>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CHECKLISTS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CHECKLISTS, id);
    await deleteDoc(docRef);
  },

  // Real-time subscription
  subscribeToChecklists(projectId: string, callback: (checklists: Checklist[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTIONS.CHECKLISTS),
      where('projectId', '==', projectId),
      orderBy('order', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const checklists = snapshot.docs.map(doc => convertFirestoreDoc<Checklist>(doc));
      callback(checklists);
    });
  }
};

// Shot item operations
export const shotItemService = {
  async create(shotItem: Omit<ShotItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.SHOT_ITEMS), {
      ...shotItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getByChecklistId(checklistId: string): Promise<ShotItem[]> {
    const q = query(
      collection(db, COLLECTIONS.SHOT_ITEMS),
      where('checklistId', '==', checklistId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => convertFirestoreDoc<ShotItem>(doc));
  },

  async getByProjectId(projectId: string): Promise<ShotItem[]> {
    // First get all checklists for the project
    const checklists = await checklistService.getByProjectId(projectId);
    const checklistIds = checklists.map(c => c.id);
    
    if (checklistIds.length === 0) return [];
    
    const q = query(
      collection(db, COLLECTIONS.SHOT_ITEMS),
      where('checklistId', 'in', checklistIds),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => convertFirestoreDoc<ShotItem>(doc));
  },

  async update(id: string, updates: Partial<ShotItem>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SHOT_ITEMS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async toggleCompletion(id: string, userId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SHOT_ITEMS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const isCompleted = currentData.isCompleted;
      
      await updateDoc(docRef, {
        isCompleted: !isCompleted,
        completedAt: !isCompleted ? serverTimestamp() : null,
        completedBy: !isCompleted ? userId : null,
        updatedAt: serverTimestamp()
      });
    }
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SHOT_ITEMS, id);
    await deleteDoc(docRef);
  },

  // Real-time subscription for project shot items
  subscribeToProjectShotItems(projectId: string, callback: (shotItems: ShotItem[]) => void): Unsubscribe {
    // This is a simplified approach - in a real implementation, you might want to
    // use a cloud function to create a compound query or restructure the data
    
    // For now, we'll subscribe to all shot items and filter on the client
    const q = query(collection(db, COLLECTIONS.SHOT_ITEMS), orderBy('order', 'asc'));
    
    return onSnapshot(q, async (snapshot) => {
      const allShotItems = snapshot.docs.map(doc => convertFirestoreDoc<ShotItem>(doc));
      
      // Get checklists for this project to filter shot items
      const checklists = await checklistService.getByProjectId(projectId);
      const checklistIds = checklists.map(c => c.id);
      
      const projectShotItems = allShotItems.filter(item => 
        checklistIds.includes(item.checklistId)
      );
      
      callback(projectShotItems);
    });
  }
};

// Batch operations
export const batchService = {
  async syncMultipleItems(items: Array<{
    collection: string;
    id?: string;
    data: Record<string, unknown>;
    operation: 'create' | 'update' | 'delete';
  }>): Promise<void> {
    const batch = writeBatch(db);
    
    items.forEach(item => {
      if (item.operation === 'create') {
        const docRef = doc(collection(db, item.collection));
        batch.set(docRef, {
          ...item.data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else if (item.operation === 'update' && item.id) {
        const docRef = doc(db, item.collection, item.id);
        batch.update(docRef, {
          ...item.data,
          updatedAt: serverTimestamp()
        });
      } else if (item.operation === 'delete' && item.id) {
        const docRef = doc(db, item.collection, item.id);
        batch.delete(docRef);
      }
    });
    
    await batch.commit();
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
  }
};
