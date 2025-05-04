/**
 * StorageManager.ts
 * 
 * A utility to manage localStorage more effectively, handling quota limits
 * and implementing data compression/cleanup strategies when needed.
 */

// Size constants (in bytes)
const MAX_ITEM_SIZE = 1024 * 1024; // 1MB max per item
const STORAGE_WARNING_THRESHOLD = 0.8; // 80% of quota

// Track storage usage
let storageUsageCache: number | null = null;
let storageQuotaCache: number | null = null;

/**
 * Estimates current storage usage and available quota
 * @returns Object containing usage info
 */
export const getStorageInfo = (): { 
  used: number;
  quota: number | undefined;
  percentage: number;
  isNearLimit: boolean;
} => {
  try {
    // Use cached values if available to avoid expensive calculations
    if (storageUsageCache !== null && storageQuotaCache !== null) {
      return {
        used: storageUsageCache,
        quota: storageQuotaCache,
        percentage: storageQuotaCache ? storageUsageCache / storageQuotaCache : 0,
        isNearLimit: storageQuotaCache ? 
          (storageUsageCache / storageQuotaCache) > STORAGE_WARNING_THRESHOLD : false
      };
    }
    
    // Calculate size of all items
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length * 2; // UTF-16 chars are 2 bytes each
      }
    }
    
    // Estimate quota (5MB is common default)
    const estimatedQuota = 5 * 1024 * 1024;
    
    // Cache results
    storageUsageCache = totalSize;
    storageQuotaCache = estimatedQuota;
    
    return {
      used: totalSize,
      quota: estimatedQuota, 
      percentage: totalSize / estimatedQuota,
      isNearLimit: (totalSize / estimatedQuota) > STORAGE_WARNING_THRESHOLD
    };
  } catch (e) {
    console.error('Error calculating storage usage:', e);
    return { used: 0, quota: undefined, percentage: 0, isNearLimit: false };
  }
};

/**
 * Compresses a string to reduce storage size
 * Uses a simple approach that works well for JSON data
 */
export const compressData = (data: string): string => {
  try {
    // Simple compression: remove whitespace from JSON
    const parsed = JSON.parse(data);
    return JSON.stringify(parsed);
  } catch (e) {
    // Not valid JSON, return as is
    return data;
  }
};

/**
 * Saves an item to localStorage with automatic quota management
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    // Check if we're near storage limit
    const storageInfo = getStorageInfo();
    
    // If item is too large, compress it
    let processedValue = value;
    if (value.length > MAX_ITEM_SIZE) {
      processedValue = compressData(value);
      console.log(`Large item detected (${key}), compression applied: ${Math.round((1 - processedValue.length / value.length) * 100)}% reduction`);
    }
    
    // If we're near the storage limit, try to free up space
    if (storageInfo.isNearLimit) {
      if (!freeUpStorage()) {
        console.warn('Storage is near limit and cleanup failed, save might fail');
      }
    }
    
    // Try to save the item
    localStorage.setItem(key, processedValue);
    
    // Reset cache as we've modified storage
    storageUsageCache = null;
    return true;
  } catch (e) {
    // Last-resort emergency cleanup if saving failed
    console.error('Storage error when saving, attempting emergency cleanup:', e);
    
    if (emergencyStorageCleanup()) {
      try {
        // Try once more after cleanup
        localStorage.setItem(key, compressData(value));
        return true;
      } catch (retryError) {
        console.error('Still failed to save after emergency cleanup:', retryError);
      }
    }
    
    return false;
  }
};

/**
 * Attempts to free up storage by cleaning up old or less important data
 */
export const freeUpStorage = (): boolean => {
  try {
    // Strategy 1: Remove expired items
    const expiredItems = findExpiredItems();
    if (expiredItems.length > 0) {
      expiredItems.forEach(key => localStorage.removeItem(key));
      console.log(`Freed up space by removing ${expiredItems.length} expired items`);
      return true;
    }
    
    // Strategy 2: Compress large items
    const largeItems = findLargeItems();
    if (largeItems.length > 0) {
      largeItems.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          const compressed = compressData(value);
          localStorage.setItem(key, compressed);
        }
      });
      console.log(`Compressed ${largeItems.length} large items`);
      return true;
    }
    
    // Strategy 3: Clean non-essential caches
    const cacheKeys = findCacheItems();
    if (cacheKeys.length > 0) {
      cacheKeys.forEach(key => localStorage.removeItem(key));
      console.log(`Removed ${cacheKeys.length} cache items`);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Error during storage cleanup:', e);
    return false;
  }
};

/**
 * Last resort emergency cleanup - removes non-critical data to free space
 */
export const emergencyStorageCleanup = (): boolean => {
  try {
    // Get a list of all items sorted by size (largest first)
    const allItems: {key: string, size: number}[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        allItems.push({
          key,
          size: key.length + value.length * 2
        });
      }
    }
    
    // Sort by size, largest first
    allItems.sort((a, b) => b.size - a.size);
    
    // Start removing largest non-essential items
    let removedCount = 0;
    
    for (const item of allItems) {
      // Skip user profile data which is essential
      if (item.key.includes('user-profile') || 
          item.key === 'auth-token' || 
          item.key === 'current-user') {
        continue;
      }
      
      // Always safe to remove caches
      if (item.key.includes('cache') || 
          item.key.includes('temp') ||
          item.key.includes('logs') ||
          item.key.includes('history')) {
        localStorage.removeItem(item.key);
        removedCount++;
        
        // Stop after removing a few items to avoid excessive data loss
        if (removedCount >= 3) break;
      }
    }
    
    // If we still need space, start being more aggressive
    if (removedCount === 0) {
      // Remove the largest item that's not the user's core profile
      for (const item of allItems) {
        if (!item.key.includes('user-profile')) {
          localStorage.removeItem(item.key);
          removedCount++;
          break;
        }
      }
    }
    
    console.warn(`Emergency cleanup removed ${removedCount} items`);
    return removedCount > 0;
  } catch (e) {
    console.error('Error during emergency cleanup:', e);
    return false;
  }
};

/**
 * Find items that might be expired based on naming conventions
 */
const findExpiredItems = (): string[] => {
  const expiredItems: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Check for keys that might have expiration info
    if (key.includes('timestamp') || key.includes('expires')) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;
        
        // Check if it contains a timestamp
        const timestamp = parseInt(value);
        if (!isNaN(timestamp) && timestamp < Date.now()) {
          // Parent key is usually the key without 'timestamp' or 'expires'
          const parentKey = key.replace('-timestamp', '').replace('-expires', '');
          
          if (localStorage.getItem(parentKey)) {
            expiredItems.push(parentKey);
            expiredItems.push(key); // Also remove the timestamp key
          }
        }
      } catch (e) {
        // Skip this item if we can't parse it
      }
    }
    
    // Look for temporary tokens
    if (key.includes('temp-token') || key.includes('session-token')) {
      expiredItems.push(key);
    }
  }
  
  return expiredItems;
};

/**
 * Find items larger than a threshold
 */
const findLargeItems = (): string[] => {
  const largeItems: string[] = [];
  const SIZE_THRESHOLD = 100 * 1024; // 100KB
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    const value = localStorage.getItem(key);
    if (!value) continue;
    
    if (value.length > SIZE_THRESHOLD) {
      largeItems.push(key);
    }
  }
  
  return largeItems;
};

/**
 * Find items that look like caches or temporary data
 */
const findCacheItems = (): string[] => {
  const cacheItems: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    if (key.includes('cache') || 
        key.includes('temp') || 
        key.includes('log') ||
        key.includes('history') ||
        key.includes('recent-') ||
        key.includes('-state')) {
      cacheItems.push(key);
    }
  }
  
  return cacheItems;
};

/**
 * Replace localStorage.setItem with our safer version
 */
export const enhanceLocalStorage = (): void => {
  const originalSetItem = localStorage.setItem;
  
  localStorage.setItem = function(key: string, value: string) {
    try {
      originalSetItem.call(localStorage, key, value);
    } catch (e) {
      console.warn('Storage quota exceeded, attempting cleanup');
      
      if (freeUpStorage()) {
        try {
          originalSetItem.call(localStorage, key, value);
          console.log('Successfully saved item after cleanup');
        } catch (retryError) {
          console.error('Still failed to save after cleanup, trying compression');
          
          try {
            const compressed = compressData(value);
            originalSetItem.call(localStorage, key, compressed);
            console.log('Successfully saved compressed item');
          } catch (compressionError) {
            console.error('Failed to save even with compression, attempting emergency cleanup');
            
            if (emergencyStorageCleanup()) {
              try {
                originalSetItem.call(localStorage, key, compressData(value));
                console.log('Successfully saved after emergency cleanup');
              } catch (emergencyError) {
                console.error('All storage strategies failed:', emergencyError);
                throw emergencyError; // Re-throw if all strategies failed
              }
            } else {
              throw compressionError;
            }
          }
        }
      } else {
        throw e; // Re-throw if cleanup didn't help
      }
    }
  };
};

// Initialize enhanced localStorage
if (typeof window !== 'undefined') {
  enhanceLocalStorage();
}