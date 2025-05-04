/**
 * DataIntegrityVerifier.ts
 * 
 * Critical utility that enforces the project's strict data integrity policy:
 * - NO hardcoded user data anywhere in the application
 * - ALL data must come from authorized data sources:
 *   1. User onboarding data
 *   2. MyGallery (bi-directional database)
 *   3. Garage Vault (vehicle information)
 *   4. Juice Box (detailing data)
 * 
 * This utility verifies and ensures that components are only using data
 * from authorized sources and provides methods to replace hardcoded data.
 */

import { useUserProfileStore } from '../services/userProfileService';
import { useGallery } from '../contexts/GalleryContext';
import { useVehicle } from '../contexts/VehicleContext';
import { STORAGE_KEYS } from '../services/DataSourceConnector';

/**
 * Checks if a component is using authorized data sources
 * Returns an audit report with any integrity violations
 */
export function verifyDataIntegrity(componentName: string, dataObject: any): DataIntegrityReport {
  const report: DataIntegrityReport = {
    componentName,
    isCompliant: true,
    hardcodedFields: [],
    suggestedFixes: []
  };

  // Skip verification for whitelisted utility components
  const whitelistedComponents = [
    'Header', 
    'Footer', 
    'NavigationControls',
    'PageTitle',
    'FixedSoundBar'
  ];

  if (whitelistedComponents.includes(componentName)) {
    return report;
  }

  // Check for common hardcoded data patterns
  const verifyObject = (obj: any, path: string) => {
    if (!obj || typeof obj !== 'object') return;

    // Look for suspicious fields that might contain hardcoded user data
    const suspiciousFields = [
      'name', 'username', 'displayName', 'fullName', 'firstName', 'lastName',
      'email', 'avatar', 'userImage', 'profileImage', 'photographer', 'author',
      'creator', 'owner', 'user'
    ];

    Object.keys(obj).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      
      // If this is a suspicious field with a string value, check if it might be hardcoded
      if (suspiciousFields.includes(key) && typeof obj[key] === 'string' && !obj[key].includes('{{')) {
        // Check if the value appears to be a hardcoded name rather than a placeholder or system value
        const value = obj[key];
        
        // Skip system values and placeholders
        const systemValues = ['Unknown User', 'System', 'GoTime', 'Paddock20', 'Admin', 'default', 'none'];
        if (!systemValues.some(sv => value.toLowerCase().includes(sv.toLowerCase()))) {
          report.isCompliant = false;
          report.hardcodedFields.push({
            path: currentPath,
            value: value,
            suggestedSource: getSuggestedDataSource(key)
          });
          
          report.suggestedFixes.push(
            `Replace hardcoded "${value}" with dynamic data from ${getSuggestedDataSource(key)}`
          );
        }
      }
      
      // Recursively check nested objects and arrays
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any, index: number) => {
            verifyObject(item, `${currentPath}[${index}]`);
          });
        } else {
          verifyObject(obj[key], currentPath);
        }
      }
    });
  };
  
  verifyObject(dataObject, '');
  return report;
}

/**
 * Logs a data integrity violation to the console
 * This is used for development to flag issues
 */
export function logDataIntegrityViolation(report: DataIntegrityReport): void {
  if (!report.isCompliant) {
    console.warn(`😡 DATA INTEGRITY VIOLATION in ${report.componentName}`);
    console.warn('Hardcoded data detected:');
    report.hardcodedFields.forEach(field => {
      console.warn(`  - ${field.path}: "${field.value}" (Use ${field.suggestedSource} instead)`);
    });
    console.warn('Suggested fixes:');
    report.suggestedFixes.forEach((fix, index) => {
      console.warn(`  ${index + 1}. ${fix}`);
    });
    console.warn('CRITICAL: All data MUST come from authorized sources. NO hardcoding allowed!');
  }
}

/**
 * Gets the user display name from onboarding data
 * This replaces hardcoded user names throughout the app
 */
export function getUserDisplayName(): string {
  // First check the profile store
  const { profile } = useUserProfileStore.getState();
  if (profile && profile.displayName) {
    return profile.displayName;
  }
  
  // Then try onboarding data from localStorage
  try {
    const onboardingData = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    if (onboardingData) {
      const userData = JSON.parse(onboardingData);
      if (userData && userData.displayName) {
        return userData.displayName;
      }
      if (userData && userData.username) {
        return userData.username;
      }
    }
  } catch (error) {
    console.error('Error getting user display name:', error);
  }
  
  // Finally fall back to the authenticated user
  try {
    const authData = localStorage.getItem('auth_user');
    if (authData) {
      const user = JSON.parse(authData);
      if (user && user.username) {
        return user.username;
      }
    }
  } catch (error) {
    console.error('Error getting auth user data:', error);
  }
  
  // If all else fails, return a system name - NOT a hardcoded user name
  return 'Paddock20 User';
}

/**
 * Gets suggested data source for a field
 */
function getSuggestedDataSource(fieldName: string): string {
  const fieldToSourceMap: Record<string, string> = {
    // User profile fields
    'name': 'User Onboarding',
    'username': 'User Onboarding',
    'displayName': 'User Onboarding',
    'fullName': 'User Onboarding',
    'firstName': 'User Onboarding',
    'lastName': 'User Onboarding',
    'email': 'User Onboarding',
    'avatar': 'User Onboarding',
    'userImage': 'User Onboarding',
    'profileImage': 'User Onboarding',
    
    // Gallery related fields
    'photographer': 'MyGallery',
    'author': 'MyGallery',
    'creator': 'MyGallery',
    
    // Vehicle related fields
    'owner': 'Garage Vault',
    
    // Generic user field
    'user': 'User Onboarding'
  };
  
  return fieldToSourceMap[fieldName] || 'an authorized data source';
}

/**
 * Interface for data integrity audit report
 */
export interface DataIntegrityReport {
  componentName: string;
  isCompliant: boolean;
  hardcodedFields: Array<{
    path: string;
    value: string;
    suggestedSource: string;
  }>;
  suggestedFixes: string[];
}

/**
 * Gets a vehicle name from the vehicle context instead of hardcoding
 */
export function getVehicleDisplayName(vehicleId?: string): string {
  const vehicleContext = useVehicle();
  
  if (vehicleContext) {
    // If a specific vehicle ID is provided
    if (vehicleId && vehicleContext.vehicles) {
      const vehicle = vehicleContext.vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        return vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
      }
    }
    
    // Otherwise return the currently selected vehicle
    if (vehicleContext.vehicle) {
      return vehicleContext.vehicle.nickname || `${vehicleContext.vehicle.year} ${vehicleContext.vehicle.make} ${vehicleContext.vehicle.model}`;
    }
  }
  
  return 'Your Vehicle';
}

export default {
  verifyDataIntegrity,
  logDataIntegrityViolation,
  getUserDisplayName,
  getVehicleDisplayName
};