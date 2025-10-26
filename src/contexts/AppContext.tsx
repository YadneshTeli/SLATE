import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import type { AppState, User, Project, Checklist, ShotItem } from '@/types';
import { offlineDataManager } from '@/utils/offlineDataManager';
import { shotItemService, projectService, checklistService } from '@/lib/realtimeService';
import { useAuthSafe } from '@/hooks/useAuth';

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'REMOVE_PROJECT'; payload: string }
  | { type: 'SET_CHECKLISTS'; payload: Checklist[] }
  | { type: 'ADD_CHECKLIST'; payload: Checklist }
  | { type: 'UPDATE_CHECKLIST'; payload: Checklist }
  | { type: 'REMOVE_CHECKLIST'; payload: string }
  | { type: 'SET_SHOT_ITEMS'; payload: ShotItem[] }
  | { type: 'ADD_SHOT_ITEM'; payload: ShotItem }
  | { type: 'UPDATE_SHOT_ITEM'; payload: ShotItem }
  | { type: 'REMOVE_SHOT_ITEM'; payload: string }
  | { type: 'TOGGLE_SHOT_COMPLETION'; payload: { id: string; userId: string } }
  | { type: 'SET_OFFLINE_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'ADD_PENDING_SYNC'; payload: string }
  | { type: 'REMOVE_PENDING_SYNC'; payload: string }
  | { type: 'CLEAR_PENDING_SYNC' };

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
    
    case 'REMOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject,
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
    
    case 'REMOVE_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.filter(c => c.id !== action.payload),
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
    
    case 'REMOVE_SHOT_ITEM':
      return {
        ...state,
        shotItems: state.shotItems.filter(item => item.id !== action.payload),
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
  // Project management
  setCurrentProject: (project: Project | null) => void;
  restoreLastViewedProject: () => void;
  assignUserToProject: (projectId: string, userId: string, zones: string[]) => void;
  removeUserFromProject: (projectId: string, userId: string) => void;
  getAssignedProjects: (userId: string) => Project[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Get auth user safely - won't throw if AuthContext not ready
  const auth = useAuthSafe();
  const authUser = auth?.user || null;

  // Sync user from AuthContext to AppContext
  useEffect(() => {
    console.log('🟠 [AppContext] Syncing user from AuthContext:', authUser?.email || 'null');
    dispatch({ type: 'SET_USER', payload: authUser });
  }, [authUser]);

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

  // Load all data from Firebase when user is authenticated
  useEffect(() => {
    if (!authUser) {
      console.log('🟠 [AppContext] No user authenticated, skipping data load');
      return;
    }

    const loadAllData = async () => {
      try {
        console.log('🟠 [AppContext] Loading all data from Firebase...');
        
        // Load all projects
        const projects = await projectService.getAll();
        console.log(`✅ Loaded ${projects.length} project(s) from Firebase`);
        
        // Load all checklists
        const allChecklists: Checklist[] = [];
        for (const project of projects) {
          const projectChecklists = await checklistService.getByProjectId(project.id!);
          allChecklists.push(...projectChecklists);
        }
        console.log(`✅ Loaded ${allChecklists.length} checklist(s) from Firebase`);
        
        // Load all shot items
        const allShotItems: ShotItem[] = [];
        for (const checklist of allChecklists) {
          const checklistShots = await shotItemService.getByChecklistId(checklist.id!);
          allShotItems.push(...checklistShots);
        }
        console.log(`✅ Loaded ${allShotItems.length} shot item(s) from Firebase`);
        
        // Update state
        dispatch({ type: 'SET_PROJECTS', payload: projects });
        dispatch({ type: 'SET_CHECKLISTS', payload: allChecklists });
        dispatch({ type: 'SET_SHOT_ITEMS', payload: allShotItems });
        
        console.log('🎉 [AppContext] All data loaded successfully!');
      } catch (error) {
        console.error('❌ [AppContext] Error loading data from Firebase:', error);
      }
    };

    loadAllData();
  }, [authUser]);

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
      try {
        // Get current state to log the toggle direction
        const shotItem = state.shotItems.find(item => item.id === shotId);
        const willBeCompleted = shotItem ? !shotItem.isCompleted : true;
        
        // Update in Firebase first
        await shotItemService.toggleCompletion(shotId, state.user.id);
        console.log(`✅ Shot ${willBeCompleted ? 'completed' : 'uncompleted'} in Firebase:`, shotId);
        
        // Then update local state
        dispatch({
          type: 'TOGGLE_SHOT_COMPLETION',
          payload: { id: shotId, userId: state.user.id },
        });

        // Save to offline storage as backup
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
              await offlineDataManager.queueForSync(shotData, 'update', 'shot');
            }
          }
        } catch (error) {
          console.error('Failed to save shot completion to offline storage:', error);
        }
      } catch (error) {
        console.error('❌ Failed to toggle shot completion in Firebase:', error);
        console.error('Error details:', error);
        // Still update local state so user sees immediate feedback
        // Changes will sync to Firebase when connection is restored
        dispatch({
          type: 'TOGGLE_SHOT_COMPLETION',
          payload: { id: shotId, userId: state.user.id },
        });
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
      try {
        const newItem: Omit<ShotItem, 'id'> = {
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
        
        // Save to Firebase
        const shotId = await shotItemService.create(newItem);
        console.log('✅ User shot item created in Firebase:', shotId);
        
        // Add to local state
        dispatch({ type: 'ADD_SHOT_ITEM', payload: { ...newItem, id: shotId } });
        
        // Save to offline storage for backup
        try {
          await offlineDataManager.saveData('shots', {
            id: shotId,
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
              id: shotId,
              projectId: state.currentProject?.id || '',
              type: newItem.type,
              priority: newItem.priority,
              description: newItem.description || '',
              addedBy: newItem.createdBy,
              title: newItem.title,
              checklistId: newItem.checklistId
            };
            await offlineDataManager.queueForSync(shotData, 'create', 'shot');
          }
        } catch (error) {
          console.error('Failed to save shot item to offline storage:', error);
        }
      } catch (error) {
        console.error('❌ Failed to create shot item in Firebase:', error);
        throw error;
      }
    }
  }, [state.user, state.currentProject?.id, state.isOffline, currentProjectItems.length]);

  // Last-viewed project persistence
  const setCurrentProject = useCallback((project: Project | null) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
    
    // Save last-viewed project to localStorage for shooters
    if (project && state.user?.role === 'shooter') {
      try {
        localStorage.setItem('slate-last-project-id', project.id);
        localStorage.setItem('slate-last-project-user', state.user.id);
      } catch (error) {
        console.warn('Failed to save last-viewed project:', error);
      }
    } else if (!project) {
      // Clear last-viewed project when no project is selected
      localStorage.removeItem('slate-last-project-id');
      localStorage.removeItem('slate-last-project-user');
    }
  }, [state.user]);

  // Restore last-viewed project on login/app start
  const restoreLastViewedProject = useCallback(() => {
    if (!state.user || state.user.role !== 'shooter' || state.projects.length === 0) {
      return;
    }

    try {
      const lastProjectId = localStorage.getItem('slate-last-project-id');
      const lastProjectUserId = localStorage.getItem('slate-last-project-user');

      // Only restore if it was this user's last-viewed project
      if (lastProjectId && lastProjectUserId === state.user.id) {
        const lastProject = state.projects.find(p => p.id === lastProjectId);
        
        // Verify the user is still assigned to this project by admin
        if (lastProject && lastProject.assignments.some(a => a.userId === state.user!.id)) {
          dispatch({ type: 'SET_CURRENT_PROJECT', payload: lastProject });
          console.log('Restored last-viewed project:', lastProject.name);
          return;
        } else if (lastProject) {
          // Clear invalid last-viewed project (user no longer assigned)
          localStorage.removeItem('slate-last-project-id');
          localStorage.removeItem('slate-last-project-user');
          console.log('Cleared last-viewed project - user no longer assigned');
        }
      }

      // Do NOT auto-select any project - wait for admin assignment
      // Shooter will see "no project assigned" message until admin assigns them
      console.log('No valid last-viewed project - waiting for admin assignment');
    } catch (error) {
      console.warn('Failed to restore last-viewed project:', error);
      // Do NOT auto-assign on error - let admin handle assignments
    }
  }, [state.user, state.projects, dispatch]);

  // Auto-restore project when user logs in or projects load
  useEffect(() => {
    if (state.user && state.projects.length > 0 && !state.currentProject) {
      restoreLastViewedProject();
    }
  }, [state.user, state.projects.length, state.currentProject, restoreLastViewedProject]);

  // Admin functions for project assignments
  const assignUserToProject = useCallback((projectId: string, userId: string, zones: string[]) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return;
    }

    // Check if user is already assigned
    const existingAssignment = project.assignments.find(a => a.userId === userId);
    
    if (existingAssignment) {
      // Update existing assignment
      const updatedProject = {
        ...project,
        assignments: project.assignments.map(a => 
          a.userId === userId 
            ? { ...a, zones, assignedAt: new Date() }
            : a
        ),
        updatedAt: new Date()
      };
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      console.log(`Updated assignment for ${userId} in project ${project.name}`);
    } else {
      // Add new assignment
      const updatedProject = {
        ...project,
        assignments: [
          ...project.assignments,
          {
            userId,
            zones,
            assignedAt: new Date()
          }
        ],
        updatedAt: new Date()
      };
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      console.log(`Assigned ${userId} to project ${project.name} with zones: ${zones.join(', ')}`);
    }
  }, [state.projects]);

  const removeUserFromProject = useCallback((projectId: string, userId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return;
    }

    const updatedProject = {
      ...project,
      assignments: project.assignments.filter(a => a.userId !== userId),
      updatedAt: new Date()
    };
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    
    // If the current user is being removed from their current project, clear it
    if (state.user?.id === userId && state.currentProject?.id === projectId) {
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
      // Clear last-viewed project as well
      localStorage.removeItem('slate-last-project-id');
      localStorage.removeItem('slate-last-project-user');
    }
    
    console.log(`Removed ${userId} from project ${project.name}`);
  }, [state.projects, state.user?.id, state.currentProject?.id]);

  const getAssignedProjects = useCallback((userId: string) => {
    console.log('🔍 [getAssignedProjects] Looking for projects assigned to:', userId);
    console.log('🔍 [getAssignedProjects] Total projects in state:', state.projects.length);
    
    const assignedProjects = state.projects.filter(project => {
      const hasAssignments = project.assignments && project.assignments.length > 0;
      const isAssigned = hasAssignments && project.assignments.some(assignment => assignment.userId === userId);
      
      console.log(`  - Project "${project.name}":`, {
        id: project.id,
        hasAssignments,
        assignments: project.assignments,
        isAssigned
      });
      
      return isAssigned;
    });
    
    console.log('🔍 [getAssignedProjects] Found assigned projects:', assignedProjects.length);
    return assignedProjects;
  }, [state.projects]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    currentProjectItems,
    currentProjectProgress,
    toggleShotCompletion,
    addUserShotItem,
    setCurrentProject,
    restoreLastViewedProject,
    assignUserToProject,
    removeUserFromProject,
    getAssignedProjects,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
