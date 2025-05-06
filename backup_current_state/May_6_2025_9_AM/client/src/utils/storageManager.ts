/**
 * Storage Manager Utility
 * 
 * A wrapper around localStorage with error handling, typing, and persistence features.
 * Provides a standardized interface for working with localStorage across the application.
 */

// Implementing the StateStorage interface required by Zustand's persist middleware
export const getItem = (key: string): string | null => {
  try {
    const value = localStorage.getItem(key);
    return value;
  } catch (error) {
    console.error(`Error getting item from storage [${key}]:`, error);
    return null;
  }
};

export const setItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item in storage [${key}]:`, error);
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from storage [${key}]:`, error);
  }
};

/**
 * Get a typed item from localStorage
 * @param key The storage key
 * @param defaultValue Optional default value if key doesn't exist
 * @returns The parsed value or defaultValue if not found
 */
export function getStorageItem<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue;
    }
    
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Set a typed item in localStorage
 * @param key The storage key
 * @param value The value to store
 * @returns Boolean indicating success
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
}

/**
 * Remove an item from localStorage
 * @param key The storage key to remove
 * @returns Boolean indicating success
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
}

/**
 * Check if a key exists in localStorage
 * @param key The storage key to check
 * @returns Boolean indicating if the key exists
 */
export function hasStorageItem(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking for ${key} in localStorage:`, error);
    return false;
  }
}

/**
 * Get all keys in localStorage that match a specific prefix
 * @param prefix The prefix to match
 * @returns Array of matching keys
 */
export function getKeysWithPrefix(prefix: string): string[] {
  try {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    
    return keys;
  } catch (error) {
    console.error(`Error getting keys with prefix ${prefix}:`, error);
    return [];
  }
}

/**
 * Clear all items from localStorage matching a prefix
 * @param prefix The prefix to match
 * @returns Number of items cleared
 */
export function clearItemsWithPrefix(prefix: string): number {
  try {
    const keys = getKeysWithPrefix(prefix);
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    return keys.length;
  } catch (error) {
    console.error(`Error clearing items with prefix ${prefix}:`, error);
    return 0;
  }
}

/**
 * Get the total size of localStorage in use (in bytes)
 * @returns The size in bytes
 */
export function getStorageSize(): number {
  try {
    let size = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        size += key.length + value.length;
      }
    }
    
    return size;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
}

/**
 * Check if localStorage is available and working
 * @returns Boolean indicating if storage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get all data in localStorage as an object
 * @returns An object with all localStorage data
 */
export function getAllStorageData(): Record<string, any> {
  try {
    const data: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            data[key] = JSON.parse(value);
          }
        } catch (parseError) {
          // If we can't parse as JSON, store as string
          const value = localStorage.getItem(key);
          if (value) {
            data[key] = value;
          }
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error getting all storage data:', error);
    return {};
  }
}

// Export the storage interface for Zustand persist middleware
export default {
  getItem,
  setItem,
  removeItem
};