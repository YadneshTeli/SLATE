// Core data types for SLATE application

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'shooter';
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  date: Date;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  assignments: ProjectAssignment[];
}

export interface ProjectAssignment {
  userId: string;
  zone?: string;
  zones?: string[];
  assignedAt: Date;
}

export interface Checklist {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShotItem {
  id: string;
  checklistId: string;
  title: string;
  type: 'photo' | 'video';
  priority: 'must-have' | 'nice-to-have';
  description?: string;
  referenceImageUrl?: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string; // User ID
  createdBy: string; // User ID (admin or shooter who added it)
  isUserAdded: boolean; // True if added by shooter, false if added by admin
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectProgress {
  projectId: string;
  userId: string;
  totalItems: number;
  completedItems: number;
  mustHaveItems: number;
  completedMustHaveItems: number;
  niceToHaveItems: number;
  completedNiceToHaveItems: number;
  lastUpdated: Date;
}

// UI State types
export interface AppState {
  user: User | null;
  currentProject: Project | null;
  projects: Project[];
  checklists: Checklist[];
  shotItems: ShotItem[];
  isOffline: boolean;
  lastSync: Date | null;
  pendingSyncItems: string[]; // IDs of items that need to be synced
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Sync related types
export interface SyncItem {
  id: string;
  type: 'shot-item' | 'checklist' | 'project';
  action: 'create' | 'update' | 'delete';
  data: ShotItem | Checklist | Project;
  timestamp: Date;
}

export interface OfflineStore {
  projects: Project[];
  checklists: Checklist[];
  shotItems: ShotItem[];
  pendingSync: SyncItem[];
  lastSync: Date | null;
}
