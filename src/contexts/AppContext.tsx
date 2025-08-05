import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import type { AppState, User, Project, Checklist, ShotItem } from '@/types';
import { initializeDemoData } from '@/utils/demoData';
import { offlineDataManager } from '@/utils/offlineDataManager';

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'SET_CHECKLISTS'; payload: Checklist[] }
  | { type: 'ADD_CHECKLIST'; payload: Checklist }
  | { type: 'UPDATE_CHECKLIST'; payload: Checklist }
  | { type: 'SET_SHOT_ITEMS'; payload: ShotItem[] }
  | { type: 'ADD_SHOT_ITEM'; payload: ShotItem }
  | { type: 'UPDATE_SHOT_ITEM'; payload: ShotItem }
  | { type: 'TOGGLE_SHOT_COMPLETION'; payload: { id: string; userId: string } }
  | { type: 'SET_OFFLINE_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'ADD_PENDING_SYNC'; payload: string }
  | { type: 'REMOVE_PENDING_SYNC'; payload: string }
  | { type: 'CLEAR_PENDING_SYNC' }
  | { type: 'INITIALIZE_DEMO_DATA'; payload: { projects: Project[]; checklists: Checklist[]; shotItems: ShotItem[] } };

// Initial state
const initialState: AppState = {
  user: null,
  currentProject: null,
  projects: [],
  checklists: [],
  shotItems: [],
  isOffline: !navigator.onLine,
  lastSync: null,
  pendingSyncItems: [],
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
        currentProject: state.currentProject?.id === action.payload.id 
          ? action.payload 
          : state.currentProject,
      };
    
    case 'SET_CHECKLISTS':
      return { ...state, checklists: action.payload };
    
    case 'ADD_CHECKLIST':
      return { ...state, checklists: [...state.checklists, action.payload] };
    
    case 'UPDATE_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
      };
    
    case 'SET_SHOT_ITEMS':
      return { ...state, shotItems: action.payload };
    
    case 'ADD_SHOT_ITEM':
      return { ...state, shotItems: [...state.shotItems, action.payload] };
    
    case 'UPDATE_SHOT_ITEM':
      return {
        ...state,
        shotItems: state.shotItems.map(item => 
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'TOGGLE_SHOT_COMPLETION':
      return {
        ...state,
        shotItems: state.shotItems.map(item => 
          item.id === action.payload.id
            ? {
                ...item,
                isCompleted: !item.isCompleted,
                completedAt: !item.isCompleted ? new Date() : undefined,
                completedBy: !item.isCompleted ? action.payload.userId : undefined,
                updatedAt: new Date(),
              }
            : item
        ),
        pendingSyncItems: [...state.pendingSyncItems, action.payload.id],
      };
    
    case 'SET_OFFLINE_STATUS':
      return { ...state, isOffline: action.payload };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    
    case 'ADD_PENDING_SYNC':
      return {
        ...state,
        pendingSyncItems: state.pendingSyncItems.includes(action.payload)
          ? state.pendingSyncItems
          : [...state.pendingSyncItems, action.payload],
      };
    
    case 'REMOVE_PENDING_SYNC':
      return {
        ...state,
        pendingSyncItems: state.pendingSyncItems.filter(id => id !== action.payload),
      };
    
    case 'CLEAR_PENDING_SYNC':
      return { ...state, pendingSyncItems: [] };
    
    case 'INITIALIZE_DEMO_DATA':
      return {
        ...state,
        projects: action.payload.projects,
        checklists: action.payload.checklists,
        shotItems: action.payload.shotItems,
      };
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Computed values
  currentProjectItems: ShotItem[];
  currentProjectProgress: {
    total: number;
    completed: number;
    mustHave: number;
    completedMustHave: number;
    percentage: number;
  };
  // Actions
  toggleShotCompletion: (shotId: string) => void;
  addUserShotItem: (
    checklistId: string, 
    title: string, 
    type: 'photo' | 'video', 
    priority?: ShotItem['priority'],
    description?: string
  ) => void;
  initializeDemoDataForUser: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_OFFLINE_STATUS', payload: false });
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE_STATUS', payload: true });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Computed values
  const currentProjectItems = state.shotItems.filter(item =>
    state.checklists.some(checklist => 
      checklist.id === item.checklistId && 
      checklist.projectId === state.currentProject?.id
    )
  );

  const currentProjectProgress = {
    total: currentProjectItems.length,
    completed: currentProjectItems.filter(item => item.isCompleted).length,
    mustHave: currentProjectItems.filter(item => item.priority === 'must-have').length,
    completedMustHave: currentProjectItems.filter(item => 
      item.priority === 'must-have' && item.isCompleted
    ).length,
    percentage: currentProjectItems.length > 0 
      ? (currentProjectItems.filter(item => item.isCompleted).length / currentProjectItems.length) * 100 
      : 0,
  };

  // Actions
  const toggleShotCompletion = useCallback(async (shotId: string) => {
    if (state.user) {
      dispatch({
        type: 'TOGGLE_SHOT_COMPLETION',
        payload: { id: shotId, userId: state.user.id },
      });

      // Save to offline storage
      try {
        const shotItem = state.shotItems.find(item => item.id === shotId);
        if (shotItem) {
          const updatedShot = {
            ...shotItem,
            isCompleted: !shotItem.isCompleted,
            completedAt: !shotItem.isCompleted ? new Date() : undefined,
            completedBy: !shotItem.isCompleted ? state.user.id : undefined,
            updatedAt: new Date(),
          };

          await offlineDataManager.saveData('shots', {
            id: updatedShot.id,
            projectId: state.currentProject?.id || '',
            type: updatedShot.type,
            priority: updatedShot.priority,
            description: updatedShot.description || '',
            addedBy: updatedShot.createdBy,
            title: updatedShot.title,
            checklistId: updatedShot.checklistId
          });

          // Queue for sync if offline
          if (state.isOffline) {
            const shotData = {
              id: updatedShot.id,
              projectId: state.currentProject?.id || '',
              type: updatedShot.type,
              priority: updatedShot.priority,
              description: updatedShot.description || '',
              addedBy: updatedShot.createdBy,
              title: updatedShot.title,
              checklistId: updatedShot.checklistId
            };
            await offlineDataManager.queueForSync(shotData, 'update');
          }
        }
      } catch (error) {
        console.error('Failed to save shot completion offline:', error);
      }
    }
  }, [state.user, state.shotItems, state.currentProject?.id, state.isOffline]);

  const addUserShotItem = useCallback(async (
    checklistId: string, 
    title: string, 
    type: 'photo' | 'video',
    priority: ShotItem['priority'] = 'nice-to-have',
    description?: string
  ) => {
    if (state.user) {
      const newItem: ShotItem = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        checklistId,
        title,
        type,
        priority,
        description,
        isCompleted: false,
        createdBy: state.user.id,
        isUserAdded: true,
        order: currentProjectItems.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_SHOT_ITEM', payload: newItem });
      dispatch({ type: 'ADD_PENDING_SYNC', payload: newItem.id });

      // Save to offline storage
      try {
        await offlineDataManager.saveData('shots', {
          id: newItem.id,
          projectId: state.currentProject?.id || '',
          type: newItem.type,
          priority: newItem.priority,
          description: newItem.description || '',
          addedBy: newItem.createdBy,
          title: newItem.title,
          checklistId: newItem.checklistId
        });

        // Queue for sync if offline
        if (state.isOffline) {
          const shotData = {
            id: newItem.id,
            projectId: state.currentProject?.id || '',
            type: newItem.type,
            priority: newItem.priority,
            description: newItem.description || '',
            addedBy: newItem.createdBy,
            title: newItem.title,
            checklistId: newItem.checklistId
          };
          await offlineDataManager.queueForSync(shotData, 'create');
        }
      } catch (error) {
        console.error('Failed to save shot item offline:', error);
      }
    }
  }, [state.user, state.currentProject?.id, state.isOffline, currentProjectItems.length]);

  const initializeDemoDataForUser = useCallback((userId: string) => {
    // Initialize demo data if not already loaded
    if (state.projects.length === 0) {
      const demoData = initializeDemoData(userId);
      dispatch({ 
        type: 'INITIALIZE_DEMO_DATA', 
        payload: {
          projects: demoData.projects,
          checklists: demoData.checklists,
          shotItems: demoData.shotItems,
        }
      });
    }
  }, [state.projects.length]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    currentProjectItems,
    currentProjectProgress,
    toggleShotCompletion,
    addUserShotItem,
    initializeDemoDataForUser,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
