import type { OfflineStore, ShotItem } from '@/types';

const STORAGE_KEY = 'slate-offline-data';

// Get data from localStorage
export function getOfflineData(): OfflineStore | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as OfflineStore;
    }
    return null;
  } catch (error) {
    console.error('Error reading offline data:', error);
    return null;
  }
}

// Save data to localStorage
export function saveOfflineData(data: OfflineStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving offline data:', error);
  }
}

// Clear offline data
export function clearOfflineData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing offline data:', error);
  }
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format timestamps for display
export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// Check if we have internet connectivity
export function isOnline(): boolean {
  return navigator.onLine;
}

// Debounce function for performance optimization
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Sort functions
export function sortShotItemsByOrder(items: ShotItem[]): ShotItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function sortShotItemsByPriority(items: ShotItem[]): ShotItem[] {
  return [...items].sort((a, b) => {
    // Must-have items first
    if (a.priority === 'must-have' && b.priority === 'nice-to-have') return -1;
    if (a.priority === 'nice-to-have' && b.priority === 'must-have') return 1;
    // Then by order
    return a.order - b.order;
  });
}

// Validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateShotItem(item: Partial<ShotItem>): string[] {
  const errors: string[] = [];
  
  if (!item.title || item.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!item.type || !['photo', 'video'].includes(item.type)) {
    errors.push('Type must be photo or video');
  }
  
  if (!item.priority || !['must-have', 'nice-to-have'].includes(item.priority)) {
    errors.push('Priority must be must-have or nice-to-have');
  }
  
  return errors;
}
