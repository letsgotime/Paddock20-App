/**
 * DataIntegrityVerifier.ts
 * 
 * Utility functions for verifying data integrity across the application.
 * These functions help maintain data consistency and provide fallbacks when necessary.
 */

/**
 * Get the display name for the current user - with fallback
 * @returns The user's display name or a default name
 */
export function getUserDisplayName(): string {
  try {
    // Check local storage for user information
    const userProfileData = localStorage.getItem('userProfile');
    if (userProfileData) {
      const userProfile = JSON.parse(userProfileData);
      if (userProfile.displayName) {
        return userProfile.displayName;
      }
      if (userProfile.username) {
        return userProfile.username;
      }
    }
    
    // Check auth context data (from session)
    const userData = localStorage.getItem('user-data');
    if (userData) {
      const userDataObj = JSON.parse(userData);
      if (userDataObj.user && userDataObj.user.displayName) {
        return userDataObj.user.displayName;
      }
      if (userDataObj.user && userDataObj.user.username) {
        return userDataObj.user.username;
      }
    }
    
    // Fallback to environment variable or config setting if available
    if (import.meta.env.VITE_DEFAULT_USERNAME) {
      return import.meta.env.VITE_DEFAULT_USERNAME as string;
    }
    
    // Final fallback
    return 'GoTime Member';
  } catch (error) {
    console.error('Error retrieving user display name:', error);
    return 'GoTime Member';
  }
}

/**
 * Verify if a value is a valid string
 * @param value The value to check
 * @param fallback Optional fallback value
 * @returns The validated string or fallback
 */
export function verifyString(value: any, fallback: string = ''): string {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return fallback;
}

/**
 * Verify if a value is a valid number
 * @param value The value to check
 * @param fallback Optional fallback value
 * @returns The validated number or fallback
 */
export function verifyNumber(value: any, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return fallback;
}

/**
 * Verify if a value is a valid boolean
 * @param value The value to check
 * @param fallback Optional fallback value
 * @returns The validated boolean or fallback
 */
export function verifyBoolean(value: any, fallback: boolean = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  return fallback;
}

/**
 * Verify if a value is a valid array
 * @param value The value to check
 * @param fallback Optional fallback array
 * @returns The validated array or fallback
 */
export function verifyArray<T>(value: any, fallback: T[] = []): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return fallback;
}

/**
 * Verify if a value is a valid object
 * @param value The value to check
 * @param fallback Optional fallback object
 * @returns The validated object or fallback
 */
export function verifyObject<T extends object>(value: any, fallback: T): T {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }
  return fallback;
}

/**
 * Verify if a value is a valid date (string)
 * @param value The value to check
 * @param fallback Optional fallback date
 * @returns The validated date string or fallback
 */
export function verifyDate(value: any, fallback: string = new Date().toISOString()): string {
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return value;
      }
    } catch (e) {
      // Invalid date string
    }
  }
  
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString();
  }
  
  return fallback;
}

/**
 * Verify if a value is one of the allowed enum values
 * @param value The value to check
 * @param allowedValues Array of allowed values
 * @param fallback Optional fallback value
 * @returns The validated enum value or fallback
 */
export function verifyEnum<T extends string>(value: any, allowedValues: T[], fallback: T): T {
  if (typeof value === 'string' && allowedValues.includes(value as T)) {
    return value as T;
  }
  return fallback;
}

/**
 * Safely parse JSON with a fallback
 * @param jsonString The JSON string to parse
 * @param fallback Optional fallback value
 * @returns The parsed object or fallback
 */
export function safeParseJSON<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

/**
 * Get the current user ID with fallback
 * @returns The user's ID or a default
 */
export function getUserId(): string {
  try {
    // Check local storage for user information
    const userProfileData = localStorage.getItem('userProfile');
    if (userProfileData) {
      const userProfile = JSON.parse(userProfileData);
      if (userProfile.id) {
        return userProfile.id.toString();
      }
    }
    
    // Check auth context data (from session)
    const userData = localStorage.getItem('user-data');
    if (userData) {
      const userDataObj = JSON.parse(userData);
      if (userDataObj.user && userDataObj.user.id) {
        return userDataObj.user.id.toString();
      }
    }
    
    // Generate a temporary ID if none found
    return `temp-${Math.floor(Math.random() * 1000000)}`;
  } catch (error) {
    console.error('Error retrieving user ID:', error);
    return `temp-${Math.floor(Math.random() * 1000000)}`;
  }
}