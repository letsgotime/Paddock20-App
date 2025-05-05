/**
 * dataValidation.ts
 * 
 * Comprehensive validation utilities for user profile data
 * This ensures data integrity across the entire platform
 */

import { UserProfileData, UserIdentity, UserPreferences, 
         VehicleReference, DriveRecord, GoalRecord, EventRecord, 
         GalleryItem, DetailingActivity, UserAgreements } from '../services/UserProfileWarehouse';

/**
 * Master validation function for the entire UserProfileData object
 * Validates all data sections and ensures data integrity
 */
export function validateUserProfileData(profile: UserProfileData): UserProfileData {
  if (!profile) {
    throw new Error('Profile data is null or undefined');
  }
  
  // Validate required sections
  if (!profile.identity) {
    throw new Error('Profile is missing required identity section');
  }
  
  if (!profile.preferences) {
    throw new Error('Profile is missing required preferences section');
  }
  
  if (!profile.statistics) {
    throw new Error('Profile is missing required statistics section');
  }
  
  if (!profile.agreements) {
    throw new Error('Profile is missing required agreements section');
  }
  
  // Validate each section with specific validation rules
  const validatedProfile = {
    ...profile,
    identity: validateIdentity(profile.identity),
    preferences: validatePreferences(profile.preferences),
    statistics: validateStatistics(profile.statistics),
    agreements: validateAgreements(profile.agreements),
    
    // Validate collections if they exist (could be empty arrays)
    vehicles: Array.isArray(profile.vehicles) ? profile.vehicles.map(validateVehicleReference) : [],
    drives: Array.isArray(profile.drives) ? profile.drives.map(validateDriveRecord) : [],
    goals: Array.isArray(profile.goals) ? profile.goals.map(validateGoalRecord) : [],
    events: Array.isArray(profile.events) ? profile.events.map(validateEventRecord) : [],
    gallery: Array.isArray(profile.gallery) ? profile.gallery.map(validateGalleryItem) : [],
    detailingActivities: Array.isArray(profile.detailingActivities) 
      ? profile.detailingActivities.map(validateDetailingActivity) 
      : [],
    
    // For complex nested objects, create default empty structures if missing
    juiceBox: profile.juiceBox || {
      favoriteProducts: [],
      savedLoadouts: []
    },
    podiumPursuit: profile.podiumPursuit || {
      activeTargets: [],
      acquiredTargets: []
    },
    routes: profile.routes || {
      savedRoutes: [],
      favoriteRoads: []
    },
    audio: profile.audio || {
      playlists: []
    },
    maintenance: profile.maintenance || {
      records: []
    },
    security: profile.security || {},
    
    // Ensure metadata is present
    _metadata: profile._metadata || {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  };
  
  return validatedProfile;
}

/**
 * Validates the identity section of a user profile
 */
function validateIdentity(identity: UserIdentity): UserIdentity {
  if (!identity) {
    throw new Error('Identity data is null or undefined');
  }
  
  // Ensure required fields exist
  if (!identity.id) {
    throw new Error('Identity is missing required id field');
  }
  
  if (!identity.username) {
    throw new Error('Identity is missing required username field');
  }
  
  // Apply field-specific validations
  let displayName = identity.displayName;
  if (!displayName || displayName.trim() === '') {
    displayName = identity.username; // Fallback to username if displayName is empty
  }
  
  // Validate and format dates
  let memberSince = identity.memberSince;
  if (!memberSince) {
    memberSince = new Date().toISOString().split('T')[0]; // Default to today
  }
  
  let lastActive = identity.lastActive;
  if (!lastActive) {
    lastActive = new Date().toISOString(); // Default to now
  }
  
  // Ensure valid membership level
  const validMembershipLevels = ['free', 'premium', 'elite'];
  const membershipLevel = validMembershipLevels.includes(identity.membershipLevel as any) 
    ? identity.membershipLevel 
    : 'free';
  
  // Return sanitized identity
  return {
    ...identity,
    displayName,
    memberSince,
    lastActive,
    membershipLevel: membershipLevel as 'free' | 'premium' | 'elite',
    onboardingCompleted: identity.onboardingCompleted || false
  };
}

/**
 * Validates the preferences section of a user profile
 */
function validatePreferences(preferences: UserPreferences): UserPreferences {
  if (!preferences) {
    throw new Error('Preferences data is null or undefined');
  }
  
  // Validate theme
  const validThemes = ['dark', 'light', 'auto'];
  const theme = validThemes.includes(preferences.theme as any) 
    ? preferences.theme 
    : 'dark';
  
  // Validate time format
  const validTimeFormats = ['12h', '24h'];
  const timeFormat = validTimeFormats.includes(preferences.timeFormat as any)
    ? preferences.timeFormat
    : '12h';
  
  // Validate date format
  const validDateFormats = ['mdy', 'dmy', 'ymd'];
  const dateFormat = validDateFormats.includes(preferences.dateFormat as any)
    ? preferences.dateFormat
    : 'mdy';
  
  // Validate units
  const validUnits = ['imperial', 'metric'];
  const units = validUnits.includes(preferences.units as any)
    ? preferences.units
    : 'imperial';
  
  // Default notification settings if undefined
  const notifications = preferences.notifications !== undefined
    ? preferences.notifications
    : true;
  
  // Default sound settings if undefined
  const soundEnabled = preferences.soundEnabled !== undefined
    ? preferences.soundEnabled
    : true;
  
  // Validate weather preferences
  const weatherPreferences = preferences.weatherPreferences || {
    defaultLocation: {
      lat: 33.7490,
      lon: -84.3880,
      name: 'Atlanta, GA'
    },
    units: 'imperial'
  };
  
  // Ensure required weather preferences fields
  if (!weatherPreferences.defaultLocation) {
    weatherPreferences.defaultLocation = {
      lat: 33.7490,
      lon: -84.3880,
      name: 'Atlanta, GA'
    };
  }
  
  // Validate weather units
  weatherPreferences.units = validUnits.includes(weatherPreferences.units as any)
    ? weatherPreferences.units
    : 'imperial';
  
  // Return sanitized preferences
  return {
    ...preferences,
    theme: theme as 'dark' | 'light' | 'auto',
    notifications,
    timeFormat: timeFormat as '12h' | '24h',
    dateFormat: dateFormat as 'mdy' | 'dmy' | 'ymd',
    soundEnabled,
    units: units as 'imperial' | 'metric',
    weatherPreferences
  };
}

/**
 * Validates the statistics section of a user profile
 */
function validateStatistics(statistics: any): any {
  if (!statistics) {
    throw new Error('Statistics data is null or undefined');
  }
  
  // Ensure numeric fields are numbers
  const totalDrives = isNaN(parseInt(statistics.totalDrives as any)) 
    ? 0 
    : parseInt(statistics.totalDrives as any);
    
  const totalMiles = isNaN(parseFloat(statistics.totalMiles as any)) 
    ? 0 
    : parseFloat(statistics.totalMiles as any);
    
  const avgDriveTime = isNaN(parseFloat(statistics.avgDriveTime as any)) 
    ? 0 
    : parseFloat(statistics.avgDriveTime as any);
    
  const achievements = isNaN(parseInt(statistics.achievements as any)) 
    ? 0 
    : parseInt(statistics.achievements as any);
    
  const goalsCompleted = isNaN(parseInt(statistics.goalsCompleted as any)) 
    ? 0 
    : parseInt(statistics.goalsCompleted as any);
    
  const eventsAttended = isNaN(parseInt(statistics.eventsAttended as any)) 
    ? 0 
    : parseInt(statistics.eventsAttended as any);
  
  // Ensure array fields are arrays
  const favoriteRoads = Array.isArray(statistics.favoriteRoads) 
    ? statistics.favoriteRoads 
    : [];
  
  // Return sanitized statistics
  return {
    ...statistics,
    totalDrives,
    totalMiles,
    avgDriveTime,
    favoriteRoads,
    achievements,
    goalsCompleted,
    eventsAttended
  };
}

/**
 * Validates the agreements section
 */
function validateAgreements(agreements: UserAgreements): UserAgreements {
  if (!agreements) {
    throw new Error('Agreements data is null or undefined');
  }
  
  // Ensure boolean fields are boolean values
  const termsAccepted = !!agreements.termsAccepted;
  const privacyAccepted = !!agreements.privacyAccepted;
  const marketingOptIn = !!agreements.marketingOptIn;
  
  // Return sanitized agreements
  return {
    ...agreements,
    termsAccepted,
    privacyAccepted,
    marketingOptIn
  };
}

/**
 * Validates a vehicle reference
 */
function validateVehicleReference(vehicle: VehicleReference): VehicleReference {
  if (!vehicle) {
    throw new Error('Vehicle data is null or undefined');
  }
  
  // Ensure required fields
  if (!vehicle.id) {
    throw new Error('Vehicle is missing required id field');
  }
  
  if (!vehicle.make) {
    throw new Error('Vehicle is missing required make field');
  }
  
  if (!vehicle.model) {
    throw new Error('Vehicle is missing required model field');
  }
  
  // Validate year
  let year = vehicle.year;
  if (typeof year !== 'number' || isNaN(year)) {
    // Try to convert to number
    const parsedYear = parseInt(vehicle.year as any);
    year = isNaN(parsedYear) ? new Date().getFullYear() : parsedYear;
  }
  
  // Validate status
  const validStatuses = ['active', 'inactive', 'archived', 'sold'];
  const status = validStatuses.includes(vehicle.status as any)
    ? vehicle.status
    : 'active';
  
  // Return sanitized vehicle
  return {
    ...vehicle,
    year,
    status: status as 'active' | 'inactive' | 'archived' | 'sold'
  };
}

/**
 * Validates a drive record
 */
function validateDriveRecord(drive: DriveRecord): DriveRecord {
  if (!drive) {
    throw new Error('Drive data is null or undefined');
  }
  
  // Ensure required fields
  if (!drive.id) {
    throw new Error('Drive is missing required id field');
  }
  
  if (!drive.date) {
    drive.date = new Date().toISOString();
  }
  
  // Validate numeric fields
  const distance = drive.distance !== undefined ? parseFloat(drive.distance as any) : undefined;
  const duration = drive.duration !== undefined ? parseFloat(drive.duration as any) : undefined;
  const avgSpeed = drive.avgSpeed !== undefined ? parseFloat(drive.avgSpeed as any) : undefined;
  const maxSpeed = drive.maxSpeed !== undefined ? parseFloat(drive.maxSpeed as any) : undefined;
  
  // Validate arrays
  const images = Array.isArray(drive.images) ? drive.images : [];
  const tags = Array.isArray(drive.tags) ? drive.tags : [];
  
  // Return sanitized drive
  return {
    ...drive,
    distance,
    duration,
    avgSpeed,
    maxSpeed,
    images,
    tags
  };
}

/**
 * Validates a goal record
 */
function validateGoalRecord(goal: GoalRecord): GoalRecord {
  if (!goal) {
    throw new Error('Goal data is null or undefined');
  }
  
  // Ensure required fields
  if (!goal.id) {
    throw new Error('Goal is missing required id field');
  }
  
  if (!goal.description) {
    throw new Error('Goal is missing required description field');
  }
  
  // Validate dates
  if (!goal.targetDate) {
    // Default to 30 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    goal.targetDate = targetDate.toISOString();
  }
  
  if (!goal.createdAt) {
    goal.createdAt = new Date().toISOString();
  }
  
  // Validate type
  const validTypes = ['vehicle', 'experience', 'achievement', 'maintenance', 'upgrade'];
  const type = validTypes.includes(goal.type as any)
    ? goal.type
    : 'achievement';
  
  // Validate status
  const validStatuses = ['pending', 'in-progress', 'completed', 'failed'];
  const status = validStatuses.includes(goal.status as any)
    ? goal.status
    : 'pending';
  
  // Return sanitized goal
  return {
    ...goal,
    type: type as 'vehicle' | 'experience' | 'achievement' | 'maintenance' | 'upgrade',
    status: status as 'pending' | 'in-progress' | 'completed' | 'failed'
  };
}

/**
 * Validates an event record
 */
function validateEventRecord(event: EventRecord): EventRecord {
  if (!event) {
    throw new Error('Event data is null or undefined');
  }
  
  // Ensure required fields
  if (!event.id) {
    throw new Error('Event is missing required id field');
  }
  
  if (!event.name) {
    throw new Error('Event is missing required name field');
  }
  
  if (!event.date) {
    event.date = new Date().toISOString();
  }
  
  if (!event.location) {
    throw new Error('Event is missing required location field');
  }
  
  if (!event.type) {
    event.type = 'other';
  }
  
  // Validate boolean fields
  const registered = !!event.registered;
  const attended = event.attended !== undefined ? !!event.attended : undefined;
  
  // Validate arrays
  const images = Array.isArray(event.images) ? event.images : [];
  
  // Return sanitized event
  return {
    ...event,
    registered,
    attended,
    images
  };
}

/**
 * Validates a gallery item
 */
function validateGalleryItem(item: GalleryItem): GalleryItem {
  if (!item) {
    throw new Error('Gallery item data is null or undefined');
  }
  
  // Ensure required fields
  if (!item.id) {
    throw new Error('Gallery item is missing required id field');
  }
  
  if (!item.url) {
    throw new Error('Gallery item is missing required url field');
  }
  
  if (!item.date) {
    item.date = new Date().toISOString();
  }
  
  // Validate type
  const validTypes = ['image', 'video', 'document'];
  const type = validTypes.includes(item.type as any)
    ? item.type
    : 'image';
  
  // Validate arrays
  const tags = Array.isArray(item.tags) ? item.tags : [];
  
  // Return sanitized gallery item
  return {
    ...item,
    type: type as 'image' | 'video' | 'document',
    tags
  };
}

/**
 * Validates a detailing activity
 */
function validateDetailingActivity(activity: DetailingActivity): DetailingActivity {
  if (!activity) {
    throw new Error('Detailing activity data is null or undefined');
  }
  
  // Ensure required fields
  if (!activity.id) {
    throw new Error('Detailing activity is missing required id field');
  }
  
  if (!activity.type) {
    throw new Error('Detailing activity is missing required type field');
  }
  
  if (!activity.date) {
    activity.date = new Date().toISOString();
  }
  
  if (!activity.vehicleId) {
    throw new Error('Detailing activity is missing required vehicleId field');
  }
  
  // Validate arrays
  const products = Array.isArray(activity.products) ? activity.products : [];
  const images = Array.isArray(activity.images) ? activity.images : [];
  const steps = Array.isArray(activity.steps) ? activity.steps : [];
  const beforeImages = Array.isArray(activity.beforeImages) ? activity.beforeImages : [];
  const afterImages = Array.isArray(activity.afterImages) ? activity.afterImages : [];
  
  // Return sanitized activity
  return {
    ...activity,
    products,
    images,
    steps,
    beforeImages,
    afterImages
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Allow different formats, but ensure it has enough digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
}

/**
 * Validates a URL
 */
export function validateUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates VIN format
 */
export function validateVIN(vin: string): boolean {
  if (!vin) return false;
  
  // Basic VIN validation - 17 characters, no 'I', 'O', or 'Q'
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
}

/**
 * Utility function to sanitize a string
 */
export function sanitizeString(str: string | null | undefined): string {
  if (!str) return '';
  
  // Remove potentially dangerous HTML/script content
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Utility function to ensure a value is a number
 */
export function ensureNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Utility function to ensure a value is a boolean
 */
export function ensureBoolean(value: any, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) return defaultValue;
  
  return !!value;
}

/**
 * Utility function to ensure a value is a Date or ISO string
 */
export function ensureDate(value: any, defaultToNow: boolean = true): string {
  if (!value) {
    return defaultToNow ? new Date().toISOString() : '';
  }
  
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch {
      // Invalid date string
    }
  }
  
  return defaultToNow ? new Date().toISOString() : '';
}

/**
 * Utility function to ensure a value is an array
 */
export function ensureArray<T>(value: any, defaultValue: T[] = []): T[] {
  if (!value) return defaultValue;
  
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Validates a color hex code
 */
export function validateColorHex(color: string): boolean {
  if (!color) return false;
  
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}