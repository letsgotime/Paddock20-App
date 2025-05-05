/**
 * Data Validation Utility
 * 
 * Provides comprehensive validation for all data types in the application
 * with a focus on vehicle data integrity.
 */

import { VALIDATION } from './constants';
import { CompleteVehicleData } from '../services/VehicleDataWarehouse';

/**
 * Vehicle validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error type with field and message
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates a VIN number
 * @param vin VIN to validate
 * @returns Whether the VIN is valid
 */
export function isValidVin(vin: string): boolean {
  if (!vin) return false;
  
  // Basic format validation
  return VALIDATION.VIN_REGEX.test(vin);
}

/**
 * Validates an email address
 * @param email Email to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  return VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * Validates a year value
 * @param year Year to validate
 * @returns Whether the year is valid
 */
export function isValidYear(year: number | string): boolean {
  const numYear = typeof year === 'string' ? parseInt(year) : year;
  const currentYear = new Date().getFullYear();
  
  // Vehicle years should be within a reasonable range
  return !isNaN(numYear) && numYear > 1885 && numYear <= currentYear + 1;
}

/**
 * Validates a mileage value
 * @param mileage Mileage to validate
 * @returns Whether the mileage is valid
 */
export function isValidMileage(mileage: number | string): boolean {
  const numMileage = typeof mileage === 'string' ? parseInt(mileage) : mileage;
  
  // Mileage should be a non-negative number less than 10 million
  return !isNaN(numMileage) && numMileage >= 0 && numMileage < 10000000;
}

/**
 * Validates a URL or data URI
 * @param url URL to validate
 * @returns Whether the URL is valid
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a data URI
  if (url.startsWith('data:')) {
    return url.includes(';base64,');
  }
  
  // Check if it's a valid URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Performs comprehensive validation on a vehicle object
 * @param vehicle Vehicle data to validate
 * @returns Validation result with errors if any
 */
export function validateVehicle(vehicle: Partial<CompleteVehicleData>): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!vehicle.make) {
    errors.push({ field: 'make', message: 'Make is required' });
  }
  
  if (!vehicle.model) {
    errors.push({ field: 'model', message: 'Model is required' });
  }
  
  // VIN validation if provided
  if (vehicle.vin && !isValidVin(vehicle.vin)) {
    errors.push({ field: 'vin', message: 'Invalid VIN format (must be 17 characters: letters and numbers only, no I, O, or Q)' });
  }
  
  // Year validation
  if (vehicle.year !== undefined && !isValidYear(vehicle.year)) {
    errors.push({ field: 'year', message: 'Year must be between 1885 and the current year plus 1' });
  }
  
  // Mileage validation
  if (vehicle.mileage !== undefined && !isValidMileage(vehicle.mileage)) {
    errors.push({ field: 'mileage', message: 'Mileage must be a positive number less than 10 million' });
  }
  
  // Image URL validation if provided
  if (vehicle.primaryImage && !isValidUrl(vehicle.primaryImage)) {
    errors.push({ field: 'primaryImage', message: 'Invalid image URL' });
  }
  
  // Entry method validation
  if (vehicle.entry_method && !['vin', 'obd', 'manual'].includes(vehicle.entry_method)) {
    errors.push({ field: 'entry_method', message: 'Entry method must be one of: vin, obd, or manual' });
  }
  
  // Status validation
  if (vehicle.status && !['active', 'archived', 'sold'].includes(vehicle.status)) {
    errors.push({ field: 'status', message: 'Status must be one of: active, archived, or sold' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates essential drive data
 * @param driveData Drive data to validate
 * @returns Validation result with errors if any
 */
export function validateDriveData(driveData: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!driveData.title) {
    errors.push({ field: 'title', message: 'Title is required' });
  }
  
  if (!driveData.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else {
    // Check if date is valid
    const dateObj = new Date(driveData.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format' });
    }
  }
  
  if (!driveData.startLocation) {
    errors.push({ field: 'startLocation', message: 'Start location is required' });
  }
  
  if (!driveData.endLocation) {
    errors.push({ field: 'endLocation', message: 'End location is required' });
  }
  
  // Distance validation
  if (driveData.distance !== undefined) {
    const distance = parseFloat(driveData.distance);
    if (isNaN(distance) || distance < 0) {
      errors.push({ field: 'distance', message: 'Distance must be a positive number' });
    }
  }
  
  // Duration validation
  if (driveData.duration !== undefined) {
    const duration = parseFloat(driveData.duration);
    if (isNaN(duration) || duration < 0) {
      errors.push({ field: 'duration', message: 'Duration must be a positive number' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates media item data
 * @param mediaItem Media item to validate
 * @returns Validation result with errors if any
 */
export function validateMediaItem(mediaItem: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!mediaItem.url && !mediaItem.src && !mediaItem.image) {
    errors.push({ field: 'url', message: 'Media URL is required' });
  }
  
  // URL validation
  const mediaUrl = mediaItem.url || mediaItem.src || mediaItem.image;
  if (mediaUrl && !isValidUrl(mediaUrl)) {
    errors.push({ field: 'url', message: 'Invalid media URL' });
  }
  
  // Type validation
  if (mediaItem.type && !['image', 'video', 'document', 'audio'].includes(mediaItem.type)) {
    errors.push({ field: 'type', message: 'Media type must be one of: image, video, document, or audio' });
  }
  
  // Timestamp validation
  if (mediaItem.timestamp) {
    const dateObj = new Date(mediaItem.timestamp);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'timestamp', message: 'Invalid timestamp format' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a maintenance or modification record
 * @param record Maintenance or modification record
 * @returns Validation result with errors if any
 */
export function validateRecord(record: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!record.title && !record.name) {
    errors.push({ field: 'title', message: 'Title is required' });
  }
  
  if (!record.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else {
    // Check if date is valid
    const dateObj = new Date(record.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format' });
    }
  }
  
  // Cost validation if provided
  if (record.cost !== undefined) {
    const cost = parseFloat(record.cost);
    if (isNaN(cost) || cost < 0) {
      errors.push({ field: 'cost', message: 'Cost must be a positive number' });
    }
  }
  
  // Mileage validation if provided
  if (record.mileage !== undefined) {
    const mileage = parseInt(record.mileage);
    if (isNaN(mileage) || mileage < 0) {
      errors.push({ field: 'mileage', message: 'Mileage must be a positive number' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes a string, removing HTML and script tags
 * @param input Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Remove HTML tags
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Applies validation and sanitization to all vehicle data
 * @param vehicle Vehicle data
 * @returns Sanitized and validated vehicle data
 */
export function sanitizeAndValidateVehicle(vehicle: Partial<CompleteVehicleData>): {
  vehicle: Partial<CompleteVehicleData>;
  validationResult: ValidationResult;
} {
  // Clone to avoid modifying the original
  const sanitizedVehicle = { ...vehicle };
  
  // Sanitize text fields
  if (sanitizedVehicle.make) sanitizedVehicle.make = sanitizeString(sanitizedVehicle.make);
  if (sanitizedVehicle.model) sanitizedVehicle.model = sanitizeString(sanitizedVehicle.model);
  if (sanitizedVehicle.nickname) sanitizedVehicle.nickname = sanitizeString(sanitizedVehicle.nickname);
  if (sanitizedVehicle.color) sanitizedVehicle.color = sanitizeString(sanitizedVehicle.color);
  if (sanitizedVehicle.engineType) sanitizedVehicle.engineType = sanitizeString(sanitizedVehicle.engineType);
  if (sanitizedVehicle.transmissionType) sanitizedVehicle.transmissionType = sanitizeString(sanitizedVehicle.transmissionType);
  
  // Parse numeric fields
  if (sanitizedVehicle.year) {
    sanitizedVehicle.year = typeof sanitizedVehicle.year === 'string' 
      ? parseInt(sanitizedVehicle.year) 
      : sanitizedVehicle.year;
  }
  
  if (sanitizedVehicle.mileage) {
    sanitizedVehicle.mileage = typeof sanitizedVehicle.mileage === 'string' 
      ? parseInt(sanitizedVehicle.mileage) 
      : sanitizedVehicle.mileage;
  }
  
  // Validate the sanitized vehicle
  const validationResult = validateVehicle(sanitizedVehicle);
  
  return {
    vehicle: sanitizedVehicle,
    validationResult
  };
}

/**
 * Batch validates an array of data objects against a specified validator
 * @param items Array of data items
 * @param validator Validation function to use
 * @returns Map of validation results by item ID
 */
export function batchValidate<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): Map<string | number, ValidationResult> {
  const results = new Map<string | number, ValidationResult>();
  
  items.forEach((item: any) => {
    const id = item.id || `unknown_${Math.random().toString(36).substring(2, 9)}`;
    results.set(id, validator(item));
  });
  
  return results;
}