/**
 * DataIntegrityVerifier
 * 
 * This utility provides safe methods to access user-related data without creating
 * circular dependencies. It directly accesses storage to get user information
 * rather than using hooks that might cause dependency issues.
 */

// Storage keys for retrieving data
const STORAGE_KEYS = {
  USER_PROFILE: 'paddock20_user_profile',
  AUTH_USER: 'paddock20_auth_user',
  VEHICLE_DATA: 'paddock20_vehicle_data',
  GALLERY_DATA: 'paddock20_gallery',
  USER_SETTINGS: 'paddock20_settings'
};

// System constants to use as fallbacks (non-user-specific)
const SYSTEM_DEFAULTS = {
  DEFAULT_USER_NAME: 'Driver',
  DEFAULT_EMAIL_DOMAIN: 'paddock20.com',
  DEFAULT_VEHICLE_OWNER: 'Vehicle Owner',
  DEFAULT_APPROVAL_TEXT: 'expert-approved'
};

/**
 * Get the user's display name without using hooks
 * This is safe to call from any component without risking circular dependencies
 */
export function getUserDisplayName(): string {
  // Try to get data from local storage directly 
  try {
    // Check user profile storage
    const profileData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (profileData) {
      try {
        const data = JSON.parse(profileData);
        if (data?.state?.profile?.displayName) {
          return data.state.profile.displayName;
        }
        if (data?.profile?.displayName) {
          return data.profile.displayName;
        }
      } catch (e) {
        console.error('Error parsing profile data:', e);
      }
    }
    
    // Check auth user storage
    const authData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (authData) {
      try {
        const data = JSON.parse(authData);
        if (data?.username) {
          return data.username;
        }
        if (data?.fullName) {
          return data.fullName;
        }
        if (data?.firstName) {
          return data.firstName + (data.lastName ? ` ${data.lastName}` : '');
        }
      } catch (e) {
        console.error('Error parsing auth data:', e);
      }
    }
    
    // If we still don't have a name, check settings
    const settingsData = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (settingsData) {
      try {
        const data = JSON.parse(settingsData);
        if (data?.displayName) {
          return data.displayName;
        }
        if (data?.username) {
          return data.username;
        }
      } catch (e) {
        console.error('Error parsing settings data:', e);
      }
    }
  } catch (error) {
    console.error('Error getting user display name:', error);
  }
  
  // If all else fails, return a system name - NOT a hardcoded user name
  return SYSTEM_DEFAULTS.DEFAULT_USER_NAME;
}

/**
 * Get the user's email address without using hooks
 */
export function getUserEmail(): string {
  try {
    // Check auth user storage
    const authData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (authData) {
      try {
        const data = JSON.parse(authData);
        if (data?.email) {
          return data.email;
        }
      } catch (e) {
        console.error('Error parsing auth data:', e);
      }
    }
    
    // Check user profile storage
    const profileData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (profileData) {
      try {
        const data = JSON.parse(profileData);
        if (data?.state?.profile?.email) {
          return data.state.profile.email;
        }
        if (data?.profile?.email) {
          return data.profile.email;
        }
      } catch (e) {
        console.error('Error parsing profile data:', e);
      }
    }
    
    // If we have a username but no email, generate an email
    const username = getUserDisplayName().split(' ')[0].toLowerCase();
    if (username && username !== SYSTEM_DEFAULTS.DEFAULT_USER_NAME.toLowerCase()) {
      return `${username}@${SYSTEM_DEFAULTS.DEFAULT_EMAIL_DOMAIN}`;
    }
  } catch (error) {
    console.error('Error getting user email:', error);
  }
  
  // Return a generic system email, not a specific person's email
  return `driver@${SYSTEM_DEFAULTS.DEFAULT_EMAIL_DOMAIN}`;
}

/**
 * Get the vehicle owner name without using hooks
 */
export function getVehicleOwnerName(): string {
  try {
    // Check vehicle data storage
    const vehicleData = localStorage.getItem(STORAGE_KEYS.VEHICLE_DATA);
    if (vehicleData) {
      try {
        const data = JSON.parse(vehicleData);
        if (data?.primaryVehicle?.owner) {
          return data.primaryVehicle.owner;
        }
        if (data?.owner) {
          return data.owner;
        }
      } catch (e) {
        console.error('Error parsing vehicle data:', e);
      }
    }
    
    // If no specific owner, use the user's display name
    const displayName = getUserDisplayName();
    if (displayName !== SYSTEM_DEFAULTS.DEFAULT_USER_NAME) {
      return displayName;
    }
  } catch (error) {
    console.error('Error getting vehicle owner name:', error);
  }
  
  // Return a generic owner name, not a specific person's name
  return SYSTEM_DEFAULTS.DEFAULT_VEHICLE_OWNER;
}

/**
 * Get approval text without hardcoding specific names
 */
export function getApprovalText(): string {
  return SYSTEM_DEFAULTS.DEFAULT_APPROVAL_TEXT;
}

/**
 * Check if a string contains potentially hardcoded user data
 * @param value The string to check
 * @returns True if the string contains suspicious patterns, false otherwise
 */
export function containsHardcodedUserData(value: string): boolean {
  // Define patterns that might indicate hardcoded data
  const suspiciousPatterns = [
    'gavin',
    'brooks',
    'example.com',
    'test',
    'dummy',
    'placeholder',
    'sample',
    'demo',
    'john doe',
    'jane doe'
  ];
  
  // Check if any pattern is found in the value
  return suspiciousPatterns.some(pattern => 
    value.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Generate dynamic image alt text based on context
 * @param imageType The type of image (vehicle, gallery, product, etc.)
 * @param itemName The name of the item in the image
 * @returns Dynamically generated alt text
 */
export function generateDynamicAltText(imageType: string, itemName: string): string {
  const owner = getVehicleOwnerName();
  
  switch (imageType.toLowerCase()) {
    case 'vehicle':
      return `${itemName || 'Vehicle'} owned by ${owner}`;
    case 'gallery':
      return `Gallery image of ${itemName} from ${owner}'s collection`;
    case 'product':
      return `${itemName || 'Product'} - ${SYSTEM_DEFAULTS.DEFAULT_APPROVAL_TEXT}`;
    default:
      return itemName || 'Image from Paddock20';
  }
}