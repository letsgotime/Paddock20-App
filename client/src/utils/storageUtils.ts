/**
 * Storage utilities for persistent caching
 * 
 * Provides:
 * - Local storage with expiry
 */

/**
 * Create a local storage wrapper with expiry functionality
 */
export const createLocalStorageWithExpiry = () => {
  return {
    /**
     * Set item in local storage with optional expiry
     * @param key - Storage key
     * @param value - Value to store (will be JSON stringified)
     * @param ttl - Optional time to live in milliseconds
     */
    setItem: (key: string, value: any, ttl?: number): void => {
      const item = {
        value,
        expiry: ttl ? Date.now() + ttl : null,
      };
      
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    },
    
    /**
     * Get item from local storage, respecting expiry
     * @param key - Storage key
     * @returns The stored value or null if expired or not found
     */
    getItem: (key: string): any => {
      try {
        const itemStr = localStorage.getItem(key);
        
        // Return null if no item found
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        
        // Check for expiry
        if (item.expiry && Date.now() > item.expiry) {
          // Item has expired, remove it
          localStorage.removeItem(key);
          return null;
        }
        
        return item.value;
      } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
      }
    },
    
    /**
     * Remove item from local storage
     * @param key - Storage key
     */
    removeItem: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing from localStorage:', e);
      }
    },
    
    /**
     * Get the expiry timestamp for an item if it exists
     * @param key - Storage key
     * @returns Expiry timestamp in milliseconds since epoch, or null if no expiry
     */
    getExpiry: (key: string): number | null => {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        return item.expiry;
      } catch (e) {
        console.error('Error getting expiry:', e);
        return null;
      }
    },
    
    /**
     * Check if an item exists and is not expired
     * @param key - Storage key
     * @returns boolean indicating if item exists and is valid
     */
    hasValidItem: (key: string): boolean => {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return false;
        
        const item = JSON.parse(itemStr);
        if (item.expiry && Date.now() > item.expiry) {
          return false;
        }
        
        return true;
      } catch (e) {
        console.error('Error checking item validity:', e);
        return false;
      }
    }
  };
};

/**
 * Get the size of localStorage in bytes
 * @returns Size in bytes
 */
export const getLocalStorageSize = (): number => {
  let totalSize = 0;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += (key.length + value.length) * 2; // UTF-16 characters are 2 bytes each
        }
      }
    }
  } catch (e) {
    console.error('Error calculating localStorage size:', e);
  }
  
  return totalSize;
};

/**
 * Get all items in localStorage with their expiry status
 * @returns Map of key to {value, isExpired, expiry}
 */
export const getAllLocalStorageItems = (): Map<string, { value: any; isExpired: boolean; expiry: number | null }> => {
  const items = new Map();
  const now = Date.now();
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          try {
            const parsedItem = JSON.parse(itemStr);
            const expiry = parsedItem.expiry;
            const isExpired = expiry && now > expiry;
            
            items.set(key, {
              value: parsedItem.value,
              isExpired,
              expiry
            });
          } catch (e) {
            // Handle non-JSON items
            items.set(key, {
              value: itemStr,
              isExpired: false,
              expiry: null
            });
          }
        }
      }
    }
  } catch (e) {
    console.error('Error getting all localStorage items:', e);
  }
  
  return items;
};