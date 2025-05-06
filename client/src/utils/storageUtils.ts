/**
 * Enhanced local storage utilities with expiration support
 * 
 * Provides a wrapper around browser's localStorage with:
 * - Automatic expiration of stored items
 * - JSON serialization/deserialization
 * - Type safety
 * - Error handling for storage limits
 */

export interface LocalStorageWithExpiry {
  /**
   * Get an item from localStorage, respecting expiration
   * Returns null if item is expired or doesn't exist
   */
  getItem<T>(key: string): T | null;
  
  /**
   * Store an item in localStorage with optional expiration
   * @param expiry Optional expiration time in milliseconds
   */
  setItem<T>(key: string, value: T, expiry?: number): void;
  
  /**
   * Remove an item from localStorage
   */
  removeItem(key: string): void;
  
  /**
   * Clear all items in localStorage
   */
  clear(): void;
}

/**
 * Creates a localStorage wrapper with automatic expiration
 */
export function createLocalStorageWithExpiry(): LocalStorageWithExpiry {
  return {
    getItem<T>(key: string): T | null {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        
        // Check if item has expiration
        if (item.expiry && Date.now() > item.expiry) {
          // Item has expired, remove it
          localStorage.removeItem(key);
          return null;
        }
        
        return item.value;
      } catch (error) {
        console.error(`Error getting item ${key} from localStorage:`, error);
        return null;
      }
    },
    
    setItem<T>(key: string, value: T, expiry?: number): void {
      try {
        const item = {
          value,
          expiry: expiry ? Date.now() + expiry : null
        };
        
        localStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.error(`Error setting item ${key} in localStorage:`, error);
        // If storage is full, clear non-critical items (could implement priorities)
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, attempting to clear space');
          clearOldItems();
          
          // Try again after clearing space
          try {
            const item = {
              value,
              expiry: expiry ? Date.now() + expiry : null
            };
            localStorage.setItem(key, JSON.stringify(item));
          } catch (retryError) {
            console.error('Still unable to save to localStorage after cleanup:', retryError);
          }
        }
      }
    },
    
    removeItem(key: string): void {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing item ${key} from localStorage:`, error);
      }
    },
    
    clear(): void {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  };
}

/**
 * Clear old and potentially less important items when storage is full
 */
function clearOldItems(): void {
  try {
    // Strategy: clear all expired items first
    const keys = Object.keys(localStorage);
    let cleared = 0;
    
    for (const key of keys) {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) continue;
        
        const item = JSON.parse(itemStr);
        
        // Remove expired items
        if (item.expiry && Date.now() > item.expiry) {
          localStorage.removeItem(key);
          cleared++;
        }
      } catch (e) {
        // Skip if we can't parse this item
        continue;
      }
    }
    
    console.log(`Cleared ${cleared} expired items from localStorage`);
    
    // If still running out of space, could implement a priority or LRU system
  } catch (error) {
    console.error('Error while cleaning localStorage:', error);
  }
}