/**
 * Local Storage Utilities
 * 
 * Helper functions for storing and retrieving data from localStorage
 * with proper type safety and error handling.
 */

import { Location } from '@/contexts/EnhancedWeatherContext';

const STORAGE_KEYS = {
  UNIT: 'paddock20_unit',
  SAVED_LOCATIONS: 'paddock20_saved_locations',
  ACTIVE_VEHICLE_ID: 'paddock20_active_vehicle_id',
};

/**
 * Store the unit preference in localStorage
 */
export function storeUnit(unit: 'metric' | 'imperial'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UNIT, unit);
  } catch (error) {
    console.error('Failed to store unit in localStorage:', error);
  }
}

/**
 * Get the unit preference from localStorage
 */
export function getUnitFromStorage(): 'metric' | 'imperial' | null {
  try {
    const unit = localStorage.getItem(STORAGE_KEYS.UNIT);
    if (unit === 'metric' || unit === 'imperial') {
      return unit;
    }
    return null;
  } catch (error) {
    console.error('Failed to get unit from localStorage:', error);
    return null;
  }
}

/**
 * Store the saved locations in localStorage
 */
export function storeSavedLocations(locations: Location[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(locations));
  } catch (error) {
    console.error('Failed to store saved locations in localStorage:', error);
  }
}

/**
 * Get the saved locations from localStorage
 */
export function getSavedLocationsFromStorage(): Location[] | null {
  try {
    const locationsJson = localStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
    if (locationsJson) {
      const locations = JSON.parse(locationsJson);
      
      // Validate that the parsed data is an array of Location objects
      if (Array.isArray(locations) && locations.every(isValidLocation)) {
        return locations;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get saved locations from localStorage:', error);
    return null;
  }
}

/**
 * Store the active vehicle ID in localStorage
 */
export function storeActiveVehicleId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE_ID, id);
  } catch (error) {
    console.error('Failed to store active vehicle ID in localStorage:', error);
  }
}

/**
 * Get the active vehicle ID from localStorage
 */
export function getActiveVehicleIdFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE_ID);
  } catch (error) {
    console.error('Failed to get active vehicle ID from localStorage:', error);
    return null;
  }
}

/**
 * Helper: Validate that an object is a valid Location
 */
function isValidLocation(loc: any): loc is Location {
  return (
    typeof loc === 'object' &&
    loc !== null &&
    typeof loc.name === 'string' &&
    typeof loc.lat === 'number' &&
    typeof loc.lon === 'number'
  );
}

/**
 * Clear all PADDOCK20 data from localStorage
 */
export function clearAllLocalStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}