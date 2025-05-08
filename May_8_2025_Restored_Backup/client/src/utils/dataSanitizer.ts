/**
 * dataSanitizer.ts
 * 
 * Utilities for sanitizing user data before storage to prevent
 * potential security issues and ensure data consistency.
 */

/**
 * Sanitize a text string to remove potentially harmful content
 * @param text The input text to sanitize
 * @returns Sanitized text string
 */
export function sanitizeText(text: string | null | undefined): string {
  if (text === null || text === undefined) {
    return '';
  }
  
  try {
    // Convert to string if not already
    const str = String(text);
    
    // Basic HTML tag removal (not a full sanitizer, just for storage)
    const withoutHtml = str.replace(/<[^>]*>/g, '');
    
    // Trim excessive whitespace
    const trimmed = withoutHtml.replace(/\s+/g, ' ').trim();
    
    // Limit length for storage efficiency
    const MAX_LENGTH = 1000;
    if (trimmed.length > MAX_LENGTH) {
      return trimmed.substring(0, MAX_LENGTH);
    }
    
    return trimmed;
  } catch (e) {
    console.error('Text sanitization error:', e);
    return '';
  }
}

/**
 * Sanitize a URL string
 * @param url The URL to sanitize
 * @returns Sanitized URL or empty string
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (url === null || url === undefined) {
    return '';
  }
  
  try {
    // Convert to string
    const str = String(url).trim();
    
    // Empty check
    if (!str) {
      return '';
    }
    
    // Check for valid URL format
    try {
      const urlObj = new URL(str);
      // Only allow http and https protocols
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return '';
      }
      return urlObj.toString();
    } catch (e) {
      // Not a valid URL
      return '';
    }
  } catch (e) {
    console.error('URL sanitization error:', e);
    return '';
  }
}

/**
 * Sanitize a numeric value
 * @param value The number to sanitize
 * @param min Optional minimum value
 * @param max Optional maximum value
 * @returns Sanitized number or 0
 */
export function sanitizeNumber(value: any, min?: number, max?: number): number {
  try {
    // Try to convert to number
    const num = Number(value);
    
    // Check if valid number
    if (isNaN(num) || !isFinite(num)) {
      return 0;
    }
    
    // Apply range limits if provided
    if (min !== undefined && num < min) {
      return min;
    }
    if (max !== undefined && num > max) {
      return max;
    }
    
    return num;
  } catch (e) {
    console.error('Number sanitization error:', e);
    return 0;
  }
}

/**
 * Sanitize a boolean value
 * @param value The boolean to sanitize
 * @returns Sanitized boolean
 */
export function sanitizeBoolean(value: any): boolean {
  try {
    // Convert various values to boolean
    if (typeof value === 'string') {
      const lowered = value.toLowerCase().trim();
      return lowered === 'true' || lowered === 'yes' || lowered === '1';
    }
    
    if (typeof value === 'number') {
      return value !== 0;
    }
    
    return Boolean(value);
  } catch (e) {
    console.error('Boolean sanitization error:', e);
    return false;
  }
}

/**
 * Sanitize a date string
 * @param date The date to sanitize
 * @returns ISO date string or current date
 */
export function sanitizeDate(date: string | Date | null | undefined): string {
  try {
    if (date === null || date === undefined) {
      return new Date().toISOString();
    }
    
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Try to parse date string
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return new Date().toISOString();
    }
    
    // Validate parsed date
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString();
    }
    
    return dateObj.toISOString();
  } catch (e) {
    console.error('Date sanitization error:', e);
    return new Date().toISOString();
  }
}

/**
 * Sanitize an array of strings
 * @param array The array to sanitize
 * @returns Sanitized array with duplicates removed
 */
export function sanitizeStringArray(array: any[] | null | undefined): string[] {
  try {
    if (!Array.isArray(array)) {
      return [];
    }
    
    // Filter invalid entries, sanitize and deduplicate
    const sanitized = array
      .filter(item => item !== null && item !== undefined)
      .map(item => sanitizeText(String(item)))
      .filter(item => item.length > 0);
    
    // Remove duplicates
    return [...new Set(sanitized)];
  } catch (e) {
    console.error('Array sanitization error:', e);
    return [];
  }
}

/**
 * Sanitize an object by removing null, undefined, and empty string values
 * @param obj The object to sanitize
 * @returns Cleaned object without empty values
 */
export function sanitizeObject<T extends object>(obj: T): Partial<T> {
  try {
    if (!obj || typeof obj !== 'object') {
      return {} as Partial<T>;
    }
    
    const result: Partial<T> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip null, undefined and empty strings
      if (value === null || value === undefined || value === '') {
        continue;
      }
      
      // Handle nested objects
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        const sanitizedNested = sanitizeObject(value);
        // Only add if the sanitized object is not empty
        if (Object.keys(sanitizedNested).length > 0) {
          result[key as keyof T] = sanitizedNested as any;
        }
        continue;
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length === 0) {
          continue; // Skip empty arrays
        }
        
        // If array of strings, sanitize each one
        if (value.every(item => typeof item === 'string')) {
          const sanitized = sanitizeStringArray(value);
          if (sanitized.length > 0) {
            result[key as keyof T] = sanitized as any;
          }
          continue;
        }
        
        // For non-string arrays, keep as is
        result[key as keyof T] = value;
        continue;
      }
      
      // Handle string values
      if (typeof value === 'string') {
        const sanitized = sanitizeText(value);
        if (sanitized) {
          result[key as keyof T] = sanitized as any;
        }
        continue;
      }
      
      // Keep all other types as is
      result[key as keyof T] = value;
    }
    
    return result;
  } catch (e) {
    console.error('Object sanitization error:', e);
    return {} as Partial<T>;
  }
}