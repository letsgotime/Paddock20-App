/**
 * secureStorage.ts
 * 
 * Secure storage utility for safely handling local storage operations with
 * improved error handling, rate limiting, and data validation.
 */

import { getItem, setItem, removeItem, hasStorageItem } from './storageManager';
import { safeParseJSON } from './DataIntegrityVerifier';

// Rate limiting configuration
const WRITE_THROTTLE_MS = 500;
const lastWriteTimestamps: Record<string, number> = {};

/**
 * Safely write data to storage with rate limiting
 * @param key Storage key
 * @param data Data to store
 * @returns Success status
 */
export function secureWrite<T>(key: string, data: T): boolean {
  try {
    // Rate limiting
    const now = Date.now();
    const lastWrite = lastWriteTimestamps[key] || 0;
    
    if (now - lastWrite < WRITE_THROTTLE_MS) {
      console.warn(`Rate limited: Attempted to write to ${key} too quickly`);
      return false;
    }
    
    // Sanitize and validate data
    if (data === null || data === undefined) {
      console.error(`Cannot store null/undefined data for key: ${key}`);
      return false;
    }
    
    // JSON stringify with serialization error handling
    let serializedData: string;
    try {
      serializedData = JSON.stringify(data);
    } catch (e) {
      console.error(`Failed to serialize data for key ${key}:`, e);
      return false;
    }
    
    // Check storage quota
    const estimatedSize = serializedData.length * 2; // UTF-16 encoding
    if (estimatedSize > 5 * 1024 * 1024) { // 5MB limit
      console.error(`Data for ${key} exceeds safe size limit (${estimatedSize} bytes)`);
      return false;
    }
    
    // Attempt to write data
    try {
      setItem(key, serializedData);
      lastWriteTimestamps[key] = now;
      return true;
    } catch (e) {
      console.error(`Storage write error for key ${key}:`, e);
      return false;
    }
  } catch (e) {
    console.error(`Unexpected error in secureWrite for key ${key}:`, e);
    return false;
  }
}

/**
 * Safely read data from storage with error handling
 * @param key Storage key
 * @param defaultValue Default to return if read fails
 * @returns Retrieved data or default
 */
export function secureRead<T>(key: string, defaultValue: T): T {
  try {
    // Check if key exists
    if (!hasStorageItem(key)) {
      return defaultValue;
    }
    
    // Get item with error handling
    const rawData = getItem(key);
    if (!rawData) {
      return defaultValue;
    }
    
    // Parse with error handling (imported from DataIntegrityVerifier)
    return safeParseJSON<T>(rawData, defaultValue);
  } catch (e) {
    console.error(`Unexpected error in secureRead for key ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Safely delete data from storage with error handling
 * @param key Storage key
 * @returns Success status
 */
export function secureDelete(key: string): boolean {
  try {
    // Check if key exists
    if (!hasStorageItem(key)) {
      return true; // Nothing to delete, consider successful
    }
    
    // Rate limiting
    const now = Date.now();
    const lastWrite = lastWriteTimestamps[key] || 0;
    
    if (now - lastWrite < WRITE_THROTTLE_MS) {
      console.warn(`Rate limited: Attempted to delete ${key} too quickly`);
      return false;
    }
    
    // Attempt to remove data
    try {
      removeItem(key);
      lastWriteTimestamps[key] = now;
      return true;
    } catch (e) {
      console.error(`Storage delete error for key ${key}:`, e);
      return false;
    }
  } catch (e) {
    console.error(`Unexpected error in secureDelete for key ${key}:`, e);
    return false;
  }
}

/**
 * Attempt to recover data from backup if primary source is corrupt
 * @param primaryKey Primary storage key
 * @param backupKey Backup storage key
 * @param defaultValue Default value if both sources fail
 * @returns Retrieved data from primary or backup
 */
export function recoverData<T>(primaryKey: string, backupKey: string, defaultValue: T): T {
  try {
    // Try primary source first
    const primaryData = secureRead<T>(primaryKey, defaultValue);
    
    // If primary source returns default value, try backup
    if (primaryData === defaultValue && hasStorageItem(backupKey)) {
      console.warn(`Attempting recovery for ${primaryKey} from backup ${backupKey}`);
      return secureRead<T>(backupKey, defaultValue);
    }
    
    return primaryData;
  } catch (e) {
    console.error(`Data recovery failed for ${primaryKey}:`, e);
    return defaultValue;
  }
}

/**
 * Create a backup of stored data
 * @param primaryKey Primary storage key
 * @param backupKey Backup storage key 
 * @returns Success status
 */
export function backupData<T>(primaryKey: string, backupKey: string): boolean {
  try {
    // Read primary data
    const data = secureRead<T>(primaryKey, null as unknown as T);
    
    // Skip backup if null
    if (data === null || data === undefined) {
      console.warn(`Cannot backup null/undefined data for ${primaryKey}`);
      return false;
    }
    
    // Write to backup location
    return secureWrite<T>(backupKey, data);
  } catch (e) {
    console.error(`Data backup failed for ${primaryKey}:`, e);
    return false;
  }
}

/**
 * Check data integrity against schema
 * @param data Data to validate
 * @param validator Validation function
 * @returns Validation result
 */
export function validateDataIntegrity<T>(data: T, validator: (data: T) => boolean): boolean {
  try {
    return validator(data);
  } catch (e) {
    console.error('Data validation error:', e);
    return false;
  }
}