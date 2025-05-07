/**
 * Storage Utils
 * 
 * Advanced storage utilities for the application:
 * - Local storage with expiration
 * - Function caching with TTL
 * - Storage size calculations
 * - Storage cleanup functions
 */

/**
 * Local Storage with Expiry
 * Returns modified localStorage functions with automatic expiry support
 */
export function createLocalStorageWithExpiry() {
  return {
    /**
     * Set an item with an optional expiry time
     * @param key Storage key
     * @param value Value to store
     * @param ttl Optional time-to-live in milliseconds
     */
    setItem<T>(key: string, value: T, ttl?: number): void {
      try {
        const item = {
          value,
          expiry: ttl ? Date.now() + ttl : null,
        };
        localStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.error(`Error setting localStorage item ${key}:`, error);
        // If localStorage is full, try to clear some space
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          this.cleanupExpiredItems();
          try {
            const item = {
              value,
              expiry: ttl ? Date.now() + ttl : null,
            };
            localStorage.setItem(key, JSON.stringify(item));
          } catch (retryError) {
            console.error(`Failed to set item ${key} even after cleanup:`, retryError);
          }
        }
      }
    },

    /**
     * Get an item, respecting its expiry time if set
     * @param key Storage key
     * @returns Stored value or undefined if expired or not found
     */
    getItem<T>(key: string): T | undefined {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return undefined;

        const item = JSON.parse(itemStr);
        
        // Check if the item has expired
        if (item.expiry && item.expiry < Date.now()) {
          localStorage.removeItem(key);
          return undefined;
        }
        
        return item.value as T;
      } catch (error) {
        console.error(`Error getting localStorage item ${key}:`, error);
        return undefined;
      }
    },

    /**
     * Remove an item
     * @param key Storage key
     */
    removeItem(key: string): void {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing localStorage item ${key}:`, error);
      }
    },

    /**
     * Clear all storage
     */
    clear(): void {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    },

    /**
     * Clean up expired items to free up space
     */
    cleanupExpiredItems(): void {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const itemStr = localStorage.getItem(key);
            if (itemStr) {
              try {
                const item = JSON.parse(itemStr);
                if (item.expiry && item.expiry < Date.now()) {
                  localStorage.removeItem(key);
                }
              } catch (e) {
                // Skip items that aren't valid JSON or don't have our format
              }
            }
          }
        }
      } catch (error) {
        console.error('Error cleaning up expired localStorage items:', error);
      }
    }
  };
}

/**
 * Creates a cached version of a function
 * @param fn The function to cache
 * @param keyFn Function to generate a cache key from the arguments
 * @param ttl Time-to-live in milliseconds
 */
export function createCachedFunction<Args extends any[], Result>(
  fn: (...args: Args) => Promise<Result>,
  keyFn: (...args: Args) => string,
  ttl: number
): (...args: Args) => Promise<Result> {
  const cache = new Map<string, { value: Result; expiry: number }>();

  return async (...args: Args): Promise<Result> => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    const result = await fn(...args);
    cache.set(key, { value: result, expiry: Date.now() + ttl });
    return result;
  };
}

/**
 * Get the size of localStorage in bytes
 */
export function getLocalStorageSize(): { size: number; used: number; max: number; percent: number } {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      total += key.length + value.length;
    }
  }
  
  // Convert from UTF-16 string length to bytes
  total = total * 2;
  
  // Estimate max storage size (5MB is common, but varies by browser)
  const maxStorageSize = 5 * 1024 * 1024;
  
  return {
    size: total,
    used: total,
    max: maxStorageSize,
    percent: (total / maxStorageSize) * 100
  };
}

/**
 * Function to store binary data in localStorage
 * (Will be a no-op if the binary data is too large)
 */
export function storeBinaryData(key: string, blob: Blob): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function() {
      try {
        if (typeof reader.result === 'string') {
          localStorage.setItem(key, reader.result);
          resolve(true);
        } else {
          reject(new Error('Failed to convert blob to string'));
        }
      } catch (e) {
        console.error('Error storing binary data:', e);
        resolve(false);
      }
    };
    reader.onerror = function() {
      reject(reader.error);
    };
    
    reader.readAsDataURL(blob);
  });
}

/**
 * Function to retrieve binary data from localStorage
 */
export function retrieveBinaryData(key: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const dataUrl = localStorage.getItem(key);
      if (!dataUrl) {
        resolve(null);
        return;
      }
      
      // Convert data URL back to blob
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      resolve(new Blob([u8arr], { type: mime }));
    } catch (e) {
      console.error('Error retrieving binary data:', e);
      resolve(null);
    }
  });
}