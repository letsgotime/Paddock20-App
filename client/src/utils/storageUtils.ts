/**
 * Storage utilities for Paddock20 application
 * 
 * Provides enhanced storage capabilities:
 * - Local storage with expiration
 * - Storage quota management
 * - Type-safe storage operations
 */

/**
 * Local storage with expiry interface
 */
export interface LocalStorageWithExpiry {
  /**
   * Set an item in storage with optional expiry
   * @param key Storage key
   * @param value Value to store (will be JSON stringified)
   * @param ttl Optional time-to-live in milliseconds
   */
  setItem: <T>(key: string, value: T, ttl?: number) => void;
  
  /**
   * Get an item from storage, returns undefined if expired or not found
   * @param key Storage key
   */
  getItem: <T>(key: string) => T | undefined;
  
  /**
   * Remove an item from storage
   * @param key Storage key
   */
  removeItem: (key: string) => void;
  
  /**
   * Clear all items from storage
   */
  clear: () => void;
  
  /**
   * Check if storage is available and working
   */
  isAvailable: () => boolean;
  
  /**
   * Get the approximate size of all stored data in KB
   */
  getStorageSize: () => number;
  
  /**
   * Get the number of keys in storage
   */
  getKeyCount: () => number;
  
  /**
   * Get all keys in storage
   */
  getAllKeys: () => string[];
  
  /**
   * Get all expired keys in storage
   */
  getExpiredKeys: () => string[];
  
  /**
   * Clean up expired items to free storage space
   */
  cleanupExpired: () => number;
}

/**
 * Create a local storage wrapper with expiry functionality
 * @returns LocalStorageWithExpiry interface
 */
export function createLocalStorageWithExpiry(): LocalStorageWithExpiry {
  // Check if localStorage is available
  const isStorageAvailable = (): boolean => {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Get all keys in storage
  const getAllKeys = (): string[] => {
    try {
      return Object.keys(localStorage).filter(key => !key.startsWith('__') && !key.startsWith('vite-'));
    } catch (e) {
      console.error('Error getting storage keys:', e);
      return [];
    }
  };
  
  // Get all expired items
  const getExpiredKeys = (): string[] => {
    const expiredKeys: string[] = [];
    const keys = getAllKeys();
    const now = Date.now();
    
    for (const key of keys) {
      try {
        const item = localStorage.getItem(key);
        if (!item) continue;
        
        const parsedItem = JSON.parse(item);
        if (parsedItem && parsedItem.__expires && parsedItem.__expires < now) {
          expiredKeys.push(key);
        }
      } catch {
        // Skip if we can't parse the item
      }
    }
    
    return expiredKeys;
  };
  
  // Clean up expired items
  const cleanupExpired = (): number => {
    const expiredKeys = getExpiredKeys();
    for (const key of expiredKeys) {
      localStorage.removeItem(key);
    }
    return expiredKeys.length;
  };
  
  // Calculate approximate storage size
  const getStorageSize = (): number => {
    try {
      let total = 0;
      const keys = getAllKeys();
      
      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) {
          // Key length + value length in bytes, divide by 1024 for KB
          total += (key.length + value.length) * 2; // UTF-16 encoding uses 2 bytes per character
        }
      }
      
      // Return size in KB
      return Math.round(total / 1024);
    } catch (e) {
      console.error('Error calculating storage size:', e);
      return 0;
    }
  };
  
  // Ensure we have space available
  const ensureStorageSpace = (): boolean => {
    try {
      const storageSize = getStorageSize();
      
      // If we're using more than 4.5MB (out of 5MB typical limit), clean up
      if (storageSize > 4500) {
        console.warn('Storage quota exceeded, trying to free up space...');
        
        // First, try to clean up expired items
        const cleaned = cleanupExpired();
        
        // If cleaning expired items didn't free enough space, 
        // start removing oldest items by key prefix (analytics first)
        if (cleaned === 0 || getStorageSize() > 4500) {
          // Target 25% of keys to remove, starting with analytics data
          const allKeys = getAllKeys().sort();
          const keysToRemove = allKeys
            .filter(k => k.startsWith('analytics_') || k.includes('temp_') || k.includes('cache_'))
            .slice(0, Math.max(5, Math.floor(allKeys.length * 0.25)));
          
          for (const key of keysToRemove) {
            localStorage.removeItem(key);
          }
          
          console.log(`Removed ${keysToRemove.length} keys to free up storage space`);
        }
        
        return getStorageSize() < 4500;
      }
      
      return true;
    } catch (e) {
      console.error('Error ensuring storage space:', e);
      return false;
    }
  };
  
  return {
    setItem: <T>(key: string, value: T, ttl?: number): void => {
      try {
        ensureStorageSpace();
        
        const item = {
          __value: value,
          __created: Date.now()
        };
        
        // Add expiry if ttl provided
        if (ttl) {
          (item as any).__expires = Date.now() + ttl;
        }
        
        localStorage.setItem(key, JSON.stringify(item));
      } catch (e) {
        console.error(`Error setting localStorage item "${key}":`, e);
        
        // Try to recover by clearing some space and retrying
        cleanupExpired();
        try {
          const item = { __value: value };
          localStorage.setItem(key, JSON.stringify(item));
        } catch (retryError) {
          console.error(`Failed to set item "${key}" even after cleanup:`, retryError);
        }
      }
    },
    
    getItem: <T>(key: string): T | undefined => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return undefined;
        
        const parsedItem = JSON.parse(item);
        
        // Check if item has expired
        if (parsedItem.__expires && parsedItem.__expires < Date.now()) {
          // Clean up expired item
          localStorage.removeItem(key);
          return undefined;
        }
        
        return parsedItem.__value as T;
      } catch (e) {
        console.error(`Error getting localStorage item "${key}":`, e);
        return undefined;
      }
    },
    
    removeItem: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Error removing localStorage item "${key}":`, e);
      }
    },
    
    clear: (): void => {
      try {
        // Only clear our app's keys, not all localStorage
        const keys = getAllKeys();
        for (const key of keys) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
    },
    
    isAvailable: isStorageAvailable,
    getStorageSize,
    getKeyCount: () => getAllKeys().length,
    getAllKeys,
    getExpiredKeys,
    cleanupExpired
  };
}

/**
 * Session storage with expiry interface - same as LocalStorageWithExpiry but uses sessionStorage
 */
export interface SessionStorageWithExpiry extends LocalStorageWithExpiry {}

/**
 * Create a session storage wrapper with expiry functionality
 * Similar to createLocalStorageWithExpiry but uses sessionStorage
 * @returns SessionStorageWithExpiry interface
 */
export function createSessionStorageWithExpiry(): SessionStorageWithExpiry {
  // Session storage implementation would go here - similar to localStorage but using sessionStorage
  // Not currently implemented as we don't need it for our current services
  throw new Error('Session storage with expiry not implemented');
}

/**
 * Format bytes to a human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Encode a string to base64
 * @param str String to encode
 */
export function encodeBase64(str: string): string {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, 
      (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  } catch (e) {
    console.error('Error encoding to base64:', e);
    return '';
  }
}

/**
 * Decode a base64 string
 * @param str Base64 string to decode
 */
export function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(str), 
      c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  } catch (e) {
    console.error('Error decoding from base64:', e);
    return '';
  }
}