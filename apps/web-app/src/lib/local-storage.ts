// Constants for localStorage keys
const STORAGE_KEYS = {
  USER_PREFERENCES: 'todoapp_user_preferences',
} as const;

// Type definitions for stored data
export interface UserPreferences {
  defaultView?: 'list' | 'grid';
  theme?: 'light' | 'dark' | 'system';
}

// Error handler for localStorage operations
function handleStorageError(operation: string, error: unknown): void {
  console.error(`localStorage ${operation} failed:`, error);
}

// Helper function to safely parse JSON
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    handleStorageError('parse', error);
    return fallback;
  }
}

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// User preferences management
export const userPreferencesStorage = {
  get(): UserPreferences {
    if (!isLocalStorageAvailable()) return {};
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return safeJsonParse<UserPreferences>(stored, {});
    } catch (error) {
      handleStorageError('get user preferences', error);
      return {};
    }
  },

  set(preferences: UserPreferences): void {
    if (!isLocalStorageAvailable()) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      handleStorageError('set user preferences', error);
    }
  },

  update(updates: Partial<UserPreferences>): void {
    const current = this.get();
    this.set({ ...current, ...updates });
  },

  clear(): void {
    if (!isLocalStorageAvailable()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    } catch (error) {
      handleStorageError('clear user preferences', error);
    }
  },
};

// Export storage availability check
export { isLocalStorageAvailable };