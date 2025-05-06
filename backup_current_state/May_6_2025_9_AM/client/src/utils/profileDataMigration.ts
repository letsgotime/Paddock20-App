/**
 * profileDataMigration.ts
 * 
 * Utilities for migrating legacy user profile data to the new centralized format
 * This handles conversion between different data structures and formats
 */

import { v4 as uuidv4 } from 'uuid';
import { UserProfileData, UserIdentity, UserPreferences, 
         UserStatistics, DriveRecord, EventRecord, 
         GalleryItem, VehicleReference } from '../services/UserProfileWarehouse';
import { ensureNumber, ensureBoolean, ensureDate, ensureArray } from './dataValidation';

// List of all possible legacy storage keys that might contain user data
export const LEGACY_STORAGE_KEYS = [
  'userProfile',
  'userOnboardingData',
  'user-profile-storage',
  'dashboardPreferences',
  'locationSettings',
  'userAgreements',
  'user-data',
  'driverProfile',
  'userSettings',
  'profile',
  'accountData',
  'userPreferences',
  'weatherSettings',
  'userRoutes',
  'savedLocations',
  'favoriteRoads',
  'userEvents',
  'userDrives',
  'galleryData',
  'myJuiceBox',
  'detailingActivities',
  'podiumTargets',
  'manifestationGoals',
  'playlists',
  'maintenanceRecords',
  'savedMaintenanceSchedule'
];

/**
 * Primary migration function to gather data from legacy sources
 * and convert it to the new UserProfileData format
 */
export async function migrateFromLegacyData(): Promise<UserProfileData | null> {
  try {
    console.log('Starting migration from legacy data formats');
    
    // Create a new default profile structure to populate
    const profile: UserProfileData = createDefaultProfile();
    
    // Scan for any legacy data in localStorage
    let foundData = false;
    
    // Process each potential legacy storage key
    for (const key of LEGACY_STORAGE_KEYS) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsedData = JSON.parse(data);
          if (parsedData) {
            foundData = true;
            console.log(`Found legacy data in '${key}' storage key`);
            
            // Process data based on the storage key
            await processLegacyData(profile, parsedData, key);
          }
        }
      } catch (error) {
        console.warn(`Error processing legacy data from '${key}':`, error);
      }
    }
    
    // Return null if no data was found to migrate
    if (!foundData) {
      console.log('No legacy data found to migrate');
      return null;
    }
    
    console.log('Migration completed successfully');
    return profile;
  } catch (error) {
    console.error('Error during profile data migration:', error);
    return null;
  }
}

/**
 * Route legacy data processing based on the source
 */
async function processLegacyData(profile: UserProfileData, data: any, source: string): Promise<void> {
  // Skip processing if data is null/undefined or not an object
  if (!data || typeof data !== 'object') return;
  
  // Handle different data sources
  switch (source) {
    case 'userProfile':
      processUserProfile(profile, data);
      break;
      
    case 'userOnboardingData':
      processUserOnboardingData(profile, data);
      break;
      
    case 'user-profile-storage':
      processUserProfileStorage(profile, data);
      break;
      
    case 'dashboardPreferences':
      processDashboardPreferences(profile, data);
      break;
      
    case 'locationSettings':
      processLocationSettings(profile, data);
      break;
      
    case 'userAgreements':
      processUserAgreements(profile, data);
      break;
      
    case 'user-data':
      processUserData(profile, data);
      break;
      
    case 'driverProfile':
      processDriverProfile(profile, data);
      break;
      
    case 'userSettings':
      processUserSettings(profile, data);
      break;
      
    case 'userRoutes':
      processUserRoutes(profile, data);
      break;
      
    case 'userDrives':
      processUserDrives(profile, data);
      break;
      
    case 'galleryData':
      processGalleryData(profile, data);
      break;
      
    case 'myJuiceBox':
      processJuiceBoxData(profile, data);
      break;
      
    case 'podiumTargets':
      processPodiumTargets(profile, data);
      break;
      
    case 'manifestationGoals':
      processManifestationGoals(profile, data);
      break;
      
    case 'playlists':
      processPlaylists(profile, data);
      break;
      
    case 'maintenanceRecords':
      processMaintenanceRecords(profile, data);
      break;
      
    default:
      // Generic extraction for other keys
      processGenericData(profile, data, source);
      break;
  }
}

/**
 * Process basic user profile information
 */
function processUserProfile(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // Basic user identity
  if (data.username) profile.identity.username = data.username;
  if (data.displayName) profile.identity.displayName = data.displayName;
  if (data.email) profile.identity.email = data.email;
  if (data.avatar) profile.identity.avatar = data.avatar;
  if (data.bio) profile.identity.bio = data.bio;
  if (data.location) profile.identity.location = data.location;
  if (data.memberSince) profile.identity.memberSince = data.memberSince;
  if (data.membershipLevel) profile.identity.membershipLevel = data.membershipLevel;
  if (data.phoneNumber) profile.identity.phoneNumber = data.phoneNumber;
  
  // User preferences
  if (data.preferences) {
    if (data.preferences.theme) profile.preferences.theme = data.preferences.theme;
    if (data.preferences.notifications !== undefined) profile.preferences.notifications = ensureBoolean(data.preferences.notifications);
    if (data.preferences.timeFormat) profile.preferences.timeFormat = data.preferences.timeFormat;
    if (data.preferences.dateFormat) profile.preferences.dateFormat = data.preferences.dateFormat;
    if (data.preferences.soundEnabled !== undefined) profile.preferences.soundEnabled = ensureBoolean(data.preferences.soundEnabled);
  }
  
  // Social links
  if (data.socialLinks) {
    profile.identity.socialLinks = {
      ...(profile.identity.socialLinks || {}),
      ...data.socialLinks
    };
  }
}

/**
 * Process onboarding data
 */
function processUserOnboardingData(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // Onboarding status
  if (data.onboardingCompleted !== undefined) {
    profile.identity.onboardingCompleted = ensureBoolean(data.onboardingCompleted);
  }
  
  // Onboarding progress
  if (data.currentStep || data.maxStepReached) {
    profile.identity.onboardingProgress = {
      currentStep: ensureNumber(data.currentStep, 1),
      maxStepReached: ensureNumber(data.maxStepReached, 1),
      completedSections: ensureArray(data.completedSections, [])
    };
  }
  
  // User preferences
  if (data.preferences) {
    Object.assign(profile.preferences, data.preferences);
  }
  
  // Weather preferences
  if (data.weatherPreferences) {
    profile.preferences.weatherPreferences = {
      ...profile.preferences.weatherPreferences,
      ...data.weatherPreferences
    };
  }
  
  // Vehicles
  if (data.vehicles && Array.isArray(data.vehicles)) {
    processVehicles(profile, data.vehicles);
  }
  
  // Drives
  if (data.drives && Array.isArray(data.drives)) {
    processDrives(profile, data.drives);
  }
  
  // Goals
  if (data.goals && Array.isArray(data.goals)) {
    processGoals(profile, data.goals);
  }
  
  // Events
  if (data.events && Array.isArray(data.events)) {
    processEvents(profile, data.events);
  }
  
  // Gallery
  if (data.gallery && Array.isArray(data.gallery)) {
    processGalleryItems(profile, data.gallery);
  }
  
  // Statistics
  if (data.statistics) {
    Object.assign(profile.statistics, data.statistics);
  }
}

/**
 * Process Zustand persisted storage
 */
function processUserProfileStorage(profile: UserProfileData, data: any): void {
  // Zustand persists in a specific format
  if (data.state && data.state.profile) {
    const storedProfile = data.state.profile;
    
    // Process identity
    processUserProfile(profile, storedProfile);
    
    // Process collections
    if (storedProfile.vehicles && Array.isArray(storedProfile.vehicles)) {
      processVehicles(profile, storedProfile.vehicles);
    }
    
    if (storedProfile.drives && Array.isArray(storedProfile.drives)) {
      processDrives(profile, storedProfile.drives);
    }
    
    if (storedProfile.goals && Array.isArray(storedProfile.goals)) {
      processGoals(profile, storedProfile.goals);
    }
    
    if (storedProfile.events && Array.isArray(storedProfile.events)) {
      processEvents(profile, storedProfile.events);
    }
    
    if (storedProfile.gallery && Array.isArray(storedProfile.gallery)) {
      processGalleryItems(profile, storedProfile.gallery);
    }
    
    // Process preferences and statistics
    if (storedProfile.preferences) {
      Object.assign(profile.preferences, storedProfile.preferences);
    }
    
    if (storedProfile.weatherPreferences) {
      profile.preferences.weatherPreferences = {
        ...profile.preferences.weatherPreferences,
        ...storedProfile.weatherPreferences
      };
    }
    
    if (storedProfile.statistics) {
      Object.assign(profile.statistics, storedProfile.statistics);
    }
  }
}

/**
 * Process dashboard preferences
 */
function processDashboardPreferences(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // Theme preference
  if (data.theme) {
    const validThemes = ['dark', 'light', 'auto'];
    if (validThemes.includes(data.theme)) {
      profile.preferences.theme = data.theme;
    }
  }
  
  // Sound preference
  if (data.soundEnabled !== undefined) {
    profile.preferences.soundEnabled = ensureBoolean(data.soundEnabled);
  }
  
  // Format preferences
  if (data.timeFormat) {
    const validTimeFormats = ['12h', '24h'];
    if (validTimeFormats.includes(data.timeFormat)) {
      profile.preferences.timeFormat = data.timeFormat;
    }
  }
  
  if (data.dateFormat) {
    const validDateFormats = ['mdy', 'dmy', 'ymd'];
    if (validDateFormats.includes(data.dateFormat)) {
      profile.preferences.dateFormat = data.dateFormat;
    }
  }
  
  // Notifications
  if (data.notifications !== undefined) {
    profile.preferences.notifications = ensureBoolean(data.notifications);
  }
  
  // Dashboard layout
  if (data.layout) {
    profile.preferences.dashboardLayout = data.layout;
  }
  
  // Other preferences
  if (data.colorAccent) {
    profile.preferences.colorAccent = data.colorAccent;
  }
}

/**
 * Process location settings
 */
function processLocationSettings(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // Default location
  if (data.defaultLocation && 
      typeof data.defaultLocation === 'object' && 
      data.defaultLocation.lat && 
      data.defaultLocation.lon) {
    
    profile.preferences.weatherPreferences.defaultLocation = {
      lat: ensureNumber(data.defaultLocation.lat),
      lon: ensureNumber(data.defaultLocation.lon),
      name: data.defaultLocation.name || 'Default Location'
    };
  }
  
  // Units preference
  if (data.units) {
    const validUnits = ['imperial', 'metric'];
    if (validUnits.includes(data.units)) {
      profile.preferences.weatherPreferences.units = data.units;
      // Also set in main preferences
      profile.preferences.units = data.units;
    }
  }
  
  // Saved locations
  if (data.savedLocations && Array.isArray(data.savedLocations)) {
    const validLocations = data.savedLocations
      .filter((loc: any) => loc && typeof loc === 'object' && loc.lat && loc.lon)
      .map((loc: any) => ({
        lat: ensureNumber(loc.lat),
        lon: ensureNumber(loc.lon),
        name: loc.name || 'Saved Location'
      }));
    
    profile.preferences.weatherPreferences.savedLocations = validLocations;
  }
  
  // Weather display preferences
  if (data.showExtendedForecast !== undefined) {
    profile.preferences.weatherPreferences.showExtendedForecast = ensureBoolean(data.showExtendedForecast);
  }
  
  if (data.showPrecipitationChance !== undefined) {
    profile.preferences.weatherPreferences.showPrecipitationChance = ensureBoolean(data.showPrecipitationChance);
  }
  
  if (data.showWindInfo !== undefined) {
    profile.preferences.weatherPreferences.showWindInfo = ensureBoolean(data.showWindInfo);
  }
  
  if (data.weatherAlerts !== undefined) {
    profile.preferences.weatherPreferences.weatherAlerts = ensureBoolean(data.weatherAlerts);
  }
}

/**
 * Process user agreements
 */
function processUserAgreements(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // Terms acceptance
  if (data.accepted !== undefined) {
    profile.agreements.termsAccepted = ensureBoolean(data.accepted);
  }
  
  // Privacy acceptance - sometimes stored separately
  if (data.privacyAccepted !== undefined) {
    profile.agreements.privacyAccepted = ensureBoolean(data.privacyAccepted);
  } else if (data.accepted !== undefined) {
    // Fall back to terms acceptance if privacy not specified
    profile.agreements.privacyAccepted = ensureBoolean(data.accepted);
  }
  
  // Marketing opt-in
  if (data.marketingOptIn !== undefined) {
    profile.agreements.marketingOptIn = ensureBoolean(data.marketingOptIn);
  }
  
  // Agreement dates
  if (data.timestamp) {
    profile.agreements.termsAcceptedDate = data.timestamp;
    profile.agreements.privacyAcceptedDate = data.timestamp;
  }
  
  // Agreement versions
  if (data.version) {
    profile.agreements.termsVersion = data.version;
    profile.agreements.privacyVersion = data.version;
  }
}

/**
 * Process UserDataService format
 */
function processUserData(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // User data
  if (data.user) {
    const user = data.user;
    
    // Basic profile info
    if (user.id) profile.identity.id = user.id.toString();
    if (user.username) profile.identity.username = user.username;
    if (user.displayName || user.fullName) profile.identity.displayName = user.displayName || user.fullName;
    if (user.email) profile.identity.email = user.email;
    if (user.avatarUrl) profile.identity.avatar = user.avatarUrl;
    if (user.bio) profile.identity.bio = user.bio;
    if (user.memberSince) profile.identity.memberSince = user.memberSince;
    if (user.membershipLevel) profile.identity.membershipLevel = user.membershipLevel;
    if (user.phoneNumber) profile.identity.phoneNumber = user.phoneNumber;
    
    // Location format conversion
    if (user.city && user.state) {
      profile.identity.location = `${user.city}, ${user.state}`;
    }
    
    // Social links
    if (user.socialLinks) {
      profile.identity.socialLinks = {
        ...(profile.identity.socialLinks || {}),
        ...user.socialLinks
      };
    }
    
    // Preferences
    if (user.preferences) {
      if (user.preferences.darkMode !== undefined) {
        profile.preferences.theme = user.preferences.darkMode ? 'dark' : 'light';
      }
      
      if (user.preferences.notifications !== undefined) {
        profile.preferences.notifications = ensureBoolean(user.preferences.notifications);
      }
      
      if (user.preferences.units) {
        const validUnits = ['imperial', 'metric'];
        if (validUnits.includes(user.preferences.units)) {
          profile.preferences.units = user.preferences.units;
          profile.preferences.weatherPreferences.units = user.preferences.units;
        }
      }
    }
    
    // Security
    if (user.mfaEnabled !== undefined) {
      profile.security.mfaEnabled = ensureBoolean(user.mfaEnabled);
    }
  }
  
  // Process collections
  if (data.vehicles && Array.isArray(data.vehicles)) {
    processVehicles(profile, data.vehicles);
  }
  
  if (data.drives && Array.isArray(data.drives)) {
    processDrives(profile, data.drives);
  }
  
  if (data.goals && Array.isArray(data.goals)) {
    processGoals(profile, data.goals);
  }
  
  if (data.routes && Array.isArray(data.routes)) {
    processRoutes(profile, data.routes);
  }
  
  if (data.favoriteRoads && Array.isArray(data.favoriteRoads)) {
    processFavoriteRoads(profile, data.favoriteRoads);
  }
  
  // Update statistics based on collections
  updateStatisticsFromCollections(profile);
}

/**
 * Process DriverProfile format - an older format
 */
function processDriverProfile(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // Identity
  if (data.id) profile.identity.id = data.id.toString();
  if (data.name) profile.identity.displayName = data.name;
  if (data.username) profile.identity.username = data.username;
  if (data.email) profile.identity.email = data.email;
  if (data.avatar || data.profileImage) profile.identity.avatar = data.avatar || data.profileImage;
  if (data.bio || data.about) profile.identity.bio = data.bio || data.about;
  if (data.location) profile.identity.location = data.location;
  if (data.joinDate) profile.identity.memberSince = data.joinDate;
  if (data.membershipTier) profile.identity.membershipLevel = data.membershipTier;
  
  // Preferences
  if (data.settings) {
    if (data.settings.darkMode !== undefined) {
      profile.preferences.theme = data.settings.darkMode ? 'dark' : 'light';
    }
    
    if (data.settings.notifications !== undefined) {
      profile.preferences.notifications = ensureBoolean(data.settings.notifications);
    }
    
    if (data.settings.units) {
      profile.preferences.units = data.settings.units;
      profile.preferences.weatherPreferences.units = data.settings.units;
    }
  }
  
  // Statistics
  if (data.stats) {
    if (data.stats.totalDrives !== undefined) profile.statistics.totalDrives = ensureNumber(data.stats.totalDrives);
    if (data.stats.totalMiles !== undefined) profile.statistics.totalMiles = ensureNumber(data.stats.totalMiles);
    if (data.stats.avgDriveTime !== undefined) profile.statistics.avgDriveTime = ensureNumber(data.stats.avgDriveTime);
    if (data.stats.favoriteRoads) profile.statistics.favoriteRoads = ensureArray(data.stats.favoriteRoads);
    if (data.stats.achievements !== undefined) profile.statistics.achievements = ensureNumber(data.stats.achievements);
    if (data.stats.goalsCompleted !== undefined) profile.statistics.goalsCompleted = ensureNumber(data.stats.goalsCompleted);
    if (data.stats.eventsAttended !== undefined) profile.statistics.eventsAttended = ensureNumber(data.stats.eventsAttended);
  }
  
  // Collections
  if (data.vehicles && Array.isArray(data.vehicles)) {
    processVehicles(profile, data.vehicles);
  }
  
  if (data.drives && Array.isArray(data.drives)) {
    processDrives(profile, data.drives);
  }
  
  if (data.goals && Array.isArray(data.goals)) {
    processGoals(profile, data.goals);
  }
  
  if (data.events && Array.isArray(data.events)) {
    processEvents(profile, data.events);
  }
  
  if (data.gallery && Array.isArray(data.gallery)) {
    processGalleryItems(profile, data.gallery);
  }
}

/**
 * Process user settings
 */
function processUserSettings(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // UI Preferences
  if (data.theme) profile.preferences.theme = data.theme;
  if (data.notifications !== undefined) profile.preferences.notifications = ensureBoolean(data.notifications);
  if (data.timeFormat) profile.preferences.timeFormat = data.timeFormat;
  if (data.dateFormat) profile.preferences.dateFormat = data.dateFormat;
  if (data.soundEnabled !== undefined) profile.preferences.soundEnabled = ensureBoolean(data.soundEnabled);
  if (data.units) {
    profile.preferences.units = data.units;
    profile.preferences.weatherPreferences.units = data.units;
  }
  
  // Advanced preferences
  if (data.notificationTypes) {
    profile.preferences.notificationTypes = {
      events: ensureBoolean(data.notificationTypes.events, true),
      maintenance: ensureBoolean(data.notificationTypes.maintenance, true),
      social: ensureBoolean(data.notificationTypes.social, true),
      marketing: ensureBoolean(data.notificationTypes.marketing, false),
      system: ensureBoolean(data.notificationTypes.system, true)
    };
  }
  
  // Privacy settings
  if (data.privacy) {
    profile.preferences.privacySettings = {
      profileVisibility: data.privacy.profileVisibility || 'members',
      activityVisibility: data.privacy.activityVisibility || 'members',
      locationSharing: ensureBoolean(data.privacy.locationSharing, false),
      dataCollection: ensureBoolean(data.privacy.dataCollection, true)
    };
  }
  
  // Performance settings
  if (data.performance) {
    profile.preferences.performancePreferences = {
      dataSaving: ensureBoolean(data.performance.dataSaving, false),
      highPerformanceMode: ensureBoolean(data.performance.highPerformanceMode, false),
      backgroundSync: ensureBoolean(data.performance.backgroundSync, true),
      cacheStrategy: data.performance.cacheStrategy || 'balanced'
    };
  }
}

/**
 * Process user routes data
 */
function processUserRoutes(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // Process saved routes
  if (Array.isArray(data)) {
    processRoutes(profile, data);
  } else if (data.routes && Array.isArray(data.routes)) {
    processRoutes(profile, data.routes);
  }
  
  // Process favorite roads
  if (data.favoriteRoads && Array.isArray(data.favoriteRoads)) {
    processFavoriteRoads(profile, data.favoriteRoads);
  }
}

/**
 * Process user drives data
 */
function processUserDrives(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  if (Array.isArray(data)) {
    processDrives(profile, data);
  } else if (data.drives && Array.isArray(data.drives)) {
    processDrives(profile, data.drives);
  }
  
  // Update statistics based on drives
  updateStatisticsFromCollections(profile);
}

/**
 * Process gallery data
 */
function processGalleryData(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  if (Array.isArray(data)) {
    processGalleryItems(profile, data);
  } else if (data.items && Array.isArray(data.items)) {
    processGalleryItems(profile, data.items);
  }
}

/**
 * Process JuiceBox data
 */
function processJuiceBoxData(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // Handle JuiceBox product favorites
  if (Array.isArray(data)) {
    // Array of products
    const favoriteProducts = data.map((product: any) => ({
      id: product.id || uuidv4(),
      name: product.name || 'Unknown Product',
      brand: product.brand || 'Unknown Brand',
      category: product.category || 'Other',
      rating: ensureNumber(product.rating),
      notes: product.notes || '',
      dateAdded: product.dateAdded || new Date().toISOString()
    }));
    
    profile.juiceBox.favoriteProducts = favoriteProducts;
  } else if (typeof data === 'object') {
    // Process favorite products
    if (data.favoriteProducts && Array.isArray(data.favoriteProducts)) {
      profile.juiceBox.favoriteProducts = data.favoriteProducts.map((product: any) => ({
        id: product.id || uuidv4(),
        name: product.name || 'Unknown Product',
        brand: product.brand || 'Unknown Brand',
        category: product.category || 'Other',
        rating: ensureNumber(product.rating),
        notes: product.notes || '',
        dateAdded: product.dateAdded || new Date().toISOString()
      }));
    }
    
    // Process saved loadouts
    if (data.loadouts && Array.isArray(data.loadouts)) {
      profile.juiceBox.savedLoadouts = data.loadouts.map((loadout: any) => ({
        id: loadout.id || uuidv4(),
        name: loadout.name || 'Unnamed Loadout',
        description: loadout.description || '',
        products: Array.isArray(loadout.products) ? loadout.products.map((product: any) => ({
          id: product.id || uuidv4(),
          name: product.name || 'Unknown Product',
          brand: product.brand || 'Unknown Brand',
          category: product.category || 'Other'
        })) : [],
        vehicleTypes: loadout.vehicleTypes || [],
        seasons: loadout.seasons || [],
        difficulty: loadout.difficulty || 'intermediate',
        createdAt: loadout.createdAt || new Date().toISOString(),
        updatedAt: loadout.updatedAt
      }));
    }
  }
}

/**
 * Process Podium Pursuit targets
 */
function processPodiumTargets(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  // Handle active targets
  if (data.targets && Array.isArray(data.targets)) {
    profile.podiumPursuit.activeTargets = data.targets
      .filter((target: any) => target && !target.acquired)
      .map((target: any) => ({
        id: target.id || uuidv4(),
        name: target.name || 'Unnamed Target',
        type: target.type || 'accessory',
        targetPrice: ensureNumber(target.price || target.targetPrice),
        targetDate: target.targetDate || target.date,
        progress: ensureNumber(target.progress, 0),
        description: target.description || '',
        images: ensureArray(target.images || target.image ? [target.image] : []),
        links: ensureArray(target.links),
        notes: ensureArray(target.notes),
        priority: target.priority || 'medium',
        createdAt: target.createdAt || new Date().toISOString(),
        updatedAt: target.updatedAt
      }));
  }
  
  // Handle acquired targets
  if (data.acquired && Array.isArray(data.acquired)) {
    profile.podiumPursuit.acquiredTargets = data.acquired.map((target: any) => ({
      id: target.id || uuidv4(),
      name: target.name || 'Unnamed Target',
      type: target.type || 'accessory',
      acquiredDate: target.acquiredDate || target.date || new Date().toISOString(),
      actualPrice: ensureNumber(target.actualPrice || target.price),
      description: target.description || '',
      images: ensureArray(target.images || target.image ? [target.image] : []),
      notes: target.notes || '',
      reviewRating: ensureNumber(target.rating),
      relatedVehicleId: target.vehicleId
    }));
  } else if (data.targets && Array.isArray(data.targets)) {
    // If acquired is not a separate array, find acquired targets in the targets array
    const acquiredTargets = data.targets
      .filter((target: any) => target && target.acquired)
      .map((target: any) => ({
        id: target.id || uuidv4(),
        name: target.name || 'Unnamed Target',
        type: target.type || 'accessory',
        acquiredDate: target.acquiredDate || target.date || new Date().toISOString(),
        actualPrice: ensureNumber(target.actualPrice || target.price),
        description: target.description || '',
        images: ensureArray(target.images || target.image ? [target.image] : []),
        notes: target.notes || '',
        reviewRating: ensureNumber(target.rating),
        relatedVehicleId: target.vehicleId
      }));
    
    profile.podiumPursuit.acquiredTargets = acquiredTargets;
  }
}

/**
 * Process Manifestation Station goals
 */
function processManifestationGoals(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  if (Array.isArray(data)) {
    processGoals(profile, data);
  } else if (data.goals && Array.isArray(data.goals)) {
    processGoals(profile, data.goals);
  }
}

/**
 * Process playlist data
 */
function processPlaylists(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  if (Array.isArray(data)) {
    profile.audio.playlists = data.map((playlist: any) => ({
      id: playlist.id || uuidv4(),
      name: playlist.name || 'Unnamed Playlist',
      source: playlist.source || 'spotify',
      externalId: playlist.externalId || playlist.spotifyId,
      tracks: ensureNumber(playlist.tracks || playlist.trackCount),
      routeId: playlist.routeId,
      vehicleId: playlist.vehicleId,
      mood: ensureArray(playlist.mood),
      tags: ensureArray(playlist.tags)
    }));
  } else if (data.playlists && Array.isArray(data.playlists)) {
    profile.audio.playlists = data.playlists.map((playlist: any) => ({
      id: playlist.id || uuidv4(),
      name: playlist.name || 'Unnamed Playlist',
      source: playlist.source || 'spotify',
      externalId: playlist.externalId || playlist.spotifyId,
      tracks: ensureNumber(playlist.tracks || playlist.trackCount),
      routeId: playlist.routeId,
      vehicleId: playlist.vehicleId,
      mood: ensureArray(playlist.mood),
      tags: ensureArray(playlist.tags)
    }));
  }
  
  // Sound settings
  if (data.soundSettings) {
    profile.audio.soundSettings = {
      engineSoundEnhancement: ensureBoolean(data.soundSettings.engineSoundEnhancement, true),
      navigationVolume: ensureNumber(data.soundSettings.navigationVolume, 80),
      musicVolume: ensureNumber(data.soundSettings.musicVolume, 70),
      notificationSounds: ensureBoolean(data.soundSettings.notificationSounds, true),
      ambienceEffects: ensureBoolean(data.soundSettings.ambienceEffects)
    };
  }
}

/**
 * Process maintenance records
 */
function processMaintenanceRecords(profile: UserProfileData, data: any): void {
  if (!data) return;
  
  if (Array.isArray(data)) {
    // Array of maintenance records
    profile.maintenance.records = data.map((record: any) => ({
      id: record.id || uuidv4(),
      vehicleId: record.vehicleId || '',
      type: record.type || 'service',
      subtype: record.subtype,
      date: record.date || new Date().toISOString(),
      mileage: ensureNumber(record.mileage || record.odometer),
      service: record.service || record.description || 'Maintenance',
      location: record.location,
      cost: ensureNumber(record.cost || record.price),
      notes: record.notes || '',
      images: ensureArray(record.images),
      documents: ensureArray(record.documents),
      parts: ensureArray(record.parts, []).map((part: any) => ({
        id: part.id || uuidv4(),
        name: part.name || 'Unknown Part',
        partNumber: part.partNumber,
        brand: part.brand,
        cost: ensureNumber(part.cost || part.price)
      })),
      performed: record.performed || 'self',
      performedBy: record.performedBy || record.technician
    }));
  } else if (data.records && Array.isArray(data.records)) {
    profile.maintenance.records = data.records.map((record: any) => ({
      id: record.id || uuidv4(),
      vehicleId: record.vehicleId || '',
      type: record.type || 'service',
      subtype: record.subtype,
      date: record.date || new Date().toISOString(),
      mileage: ensureNumber(record.mileage || record.odometer),
      service: record.service || record.description || 'Maintenance',
      location: record.location,
      cost: ensureNumber(record.cost || record.price),
      notes: record.notes || '',
      images: ensureArray(record.images),
      documents: ensureArray(record.documents),
      parts: ensureArray(record.parts, []).map((part: any) => ({
        id: part.id || uuidv4(),
        name: part.name || 'Unknown Part',
        partNumber: part.partNumber,
        brand: part.brand,
        cost: ensureNumber(part.cost || part.price)
      })),
      performed: record.performed || 'self',
      performedBy: record.performedBy || record.technician
    }));
  }
  
  // Scheduled maintenance
  if (data.scheduled && Array.isArray(data.scheduled)) {
    profile.maintenance.scheduledMaintenance = data.scheduled.map((schedule: any) => ({
      id: schedule.id || uuidv4(),
      vehicleId: schedule.vehicleId || '',
      type: schedule.type || 'service',
      dueDate: schedule.dueDate,
      dueMileage: ensureNumber(schedule.dueMileage),
      interval: {
        time: ensureNumber(schedule.interval?.time),
        distance: ensureNumber(schedule.interval?.distance)
      },
      description: schedule.description || 'Scheduled Maintenance',
      priority: schedule.priority || 'medium',
      notifyBefore: schedule.notifyBefore,
      notes: schedule.notes,
      repeat: ensureBoolean(schedule.repeat)
    }));
  }
}

/**
 * Generic data processing function for unknown storage keys
 */
function processGenericData(profile: UserProfileData, data: any, source: string): void {
  if (!data) return;
  
  // Try to identify the data based on its structure
  if (typeof data === 'object') {
    // Check for user-like data
    if (data.username || data.displayName || data.email) {
      processUserProfile(profile, data);
    }
    
    // Check for vehicle data
    if (data.vehicles && Array.isArray(data.vehicles)) {
      processVehicles(profile, data.vehicles);
    } else if (data.make && data.model) {
      processVehicles(profile, [data]);
    }
    
    // Check for drive data
    if (data.drives && Array.isArray(data.drives)) {
      processDrives(profile, data.drives);
    } else if (data.route || data.distance) {
      processDrives(profile, [data]);
    }
    
    // Check for goal data
    if (data.goals && Array.isArray(data.goals)) {
      processGoals(profile, data.goals);
    } else if (data.targetDate || data.description) {
      processGoals(profile, [data]);
    }
    
    // Check for event data
    if (data.events && Array.isArray(data.events)) {
      processEvents(profile, data.events);
    } else if (data.eventDate || data.eventName) {
      processEvents(profile, [data]);
    }
    
    // Check for gallery data
    if (data.gallery && Array.isArray(data.gallery)) {
      processGalleryItems(profile, data.gallery);
    } else if (data.items && Array.isArray(data.items)) {
      processGalleryItems(profile, data.items);
    } else if (data.url || data.imageUrl) {
      processGalleryItems(profile, [data]);
    }
    
    // Check for preferences
    if (data.theme || data.notifications !== undefined || data.timeFormat) {
      processDashboardPreferences(profile, data);
    }
    
    // Check for weather/location preferences
    if (data.defaultLocation || data.units) {
      processLocationSettings(profile, data);
    }
    
    // Check for agreements
    if (data.termsAccepted || data.accepted || data.privacyAccepted) {
      processUserAgreements(profile, data);
    }
  }
}

/**
 * Process an array of vehicles
 */
function processVehicles(profile: UserProfileData, vehicles: any[]): void {
  if (!vehicles || !Array.isArray(vehicles)) return;
  
  const processedVehicles = vehicles.map((vehicle: any): VehicleReference => {
    // Convert year to number if it's a string
    let year = vehicle.year;
    if (typeof year !== 'number' || isNaN(year)) {
      const parsedYear = parseInt(vehicle.year);
      year = isNaN(parsedYear) ? new Date().getFullYear() : parsedYear;
    }
    
    // Get a status or default to 'active'
    const validStatuses = ['active', 'inactive', 'archived', 'sold'];
    const status = vehicle.status && validStatuses.includes(vehicle.status) 
      ? vehicle.status 
      : 'active';
    
    return {
      id: vehicle.id || uuidv4(),
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: year,
      nickname: vehicle.nickname,
      vin: vehicle.vin,
      status: status as 'active' | 'inactive' | 'archived' | 'sold',
      primaryImage: vehicle.primaryImage || vehicle.image
    };
  });
  
  // Filter out invalid vehicles (must have make and model)
  const validVehicles = processedVehicles.filter(
    (vehicle) => vehicle.make && vehicle.model
  );
  
  // Add to profile, ensuring no duplicates by id
  const existingIds = new Set(profile.vehicles.map((v) => v.id));
  const uniqueVehicles = validVehicles.filter((v) => !existingIds.has(v.id));
  
  profile.vehicles = [...profile.vehicles, ...uniqueVehicles];
}

/**
 * Process an array of drives
 */
function processDrives(profile: UserProfileData, drives: any[]): void {
  if (!drives || !Array.isArray(drives)) return;
  
  const processedDrives = drives.map((drive: any): DriveRecord => {
    return {
      id: drive.id || uuidv4(),
      date: drive.date || drive.driveDate || new Date().toISOString(),
      route: drive.route || drive.routeName,
      distance: ensureNumber(drive.distance || drive.miles),
      duration: ensureNumber(drive.duration || drive.time),
      avgSpeed: ensureNumber(drive.avgSpeed),
      maxSpeed: ensureNumber(drive.maxSpeed),
      weather: drive.weather || drive.weatherConditions,
      notes: drive.notes || drive.description,
      images: ensureArray(drive.images || (drive.image ? [drive.image] : [])),
      vehicleId: drive.vehicleId,
      rating: ensureNumber(drive.rating),
      tags: ensureArray(drive.tags)
    };
  });
  
  // Add to profile, ensuring no duplicates by id
  const existingIds = new Set(profile.drives.map((d) => d.id));
  const uniqueDrives = processedDrives.filter((d) => !existingIds.has(d.id));
  
  profile.drives = [...profile.drives, ...uniqueDrives];
}

/**
 * Process an array of goals
 */
function processGoals(profile: UserProfileData, goals: any[]): void {
  if (!goals || !Array.isArray(goals)) return;
  
  const processedGoals = goals.map((goal: any) => {
    const validTypes = ['vehicle', 'experience', 'achievement', 'maintenance', 'upgrade'];
    const type = goal.type && validTypes.includes(goal.type) 
      ? goal.type 
      : 'achievement';
    
    const validStatuses = ['pending', 'in-progress', 'completed', 'failed'];
    const status = goal.status && validStatuses.includes(goal.status) 
      ? goal.status 
      : 'pending';
    
    return {
      id: goal.id || uuidv4(),
      type: type as 'vehicle' | 'experience' | 'achievement' | 'maintenance' | 'upgrade',
      description: goal.description || goal.name || 'Unnamed Goal',
      targetDate: goal.targetDate || goal.dueDate || new Date().toISOString(),
      createdAt: goal.createdAt || new Date().toISOString(),
      completedAt: goal.completedAt,
      status: status as 'pending' | 'in-progress' | 'completed' | 'failed',
      priority: goal.priority || 'medium',
      category: goal.category,
      steps: Array.isArray(goal.steps) ? goal.steps.map((step: any) => ({
        id: step.id || uuidv4(),
        description: step.description || step.name,
        completed: ensureBoolean(step.completed)
      })) : undefined,
      budget: ensureNumber(goal.budget),
      vehicleId: goal.vehicleId,
      visibility: goal.visibility || 'private',
      collaborators: ensureArray(goal.collaborators)
    };
  });
  
  // Add to profile, ensuring no duplicates by id
  const existingIds = new Set(profile.goals.map((g) => g.id));
  const uniqueGoals = processedGoals.filter((g) => !existingIds.has(g.id));
  
  profile.goals = [...profile.goals, ...uniqueGoals];
}

/**
 * Process an array of events
 */
function processEvents(profile: UserProfileData, events: any[]): void {
  if (!events || !Array.isArray(events)) return;
  
  const processedEvents = events
    .filter((event) => event && (event.name || event.eventName) && (event.date || event.eventDate))
    .map((event: any): EventRecord => {
      return {
        id: event.id || uuidv4(),
        name: event.name || event.eventName || 'Unnamed Event',
        date: event.date || event.eventDate || new Date().toISOString(),
        location: event.location || event.venue || 'Unknown Location',
        type: event.type || event.category || 'other',
        registered: ensureBoolean(event.registered),
        attended: event.attended !== undefined ? ensureBoolean(event.attended) : undefined,
        images: ensureArray(event.images || (event.image ? [event.image] : [])),
        notes: event.notes || event.description,
        rating: ensureNumber(event.rating),
        vehicleId: event.vehicleId,
        reminders: event.reminders ? {
          enabled: ensureBoolean(event.reminders.enabled, true),
          timeBeforeEvent: ensureNumber(event.reminders.timeBeforeEvent, 60)
        } : undefined
      };
    });
  
  // Add to profile, ensuring no duplicates by id
  const existingIds = new Set(profile.events.map((e) => e.id));
  const uniqueEvents = processedEvents.filter((e) => !existingIds.has(e.id));
  
  profile.events = [...profile.events, ...uniqueEvents];
}

/**
 * Process an array of gallery items
 */
function processGalleryItems(profile: UserProfileData, items: any[]): void {
  if (!items || !Array.isArray(items)) return;
  
  const processedItems = items
    .filter((item) => item && (item.url || item.imageUrl))
    .map((item: any): GalleryItem => {
      const validTypes = ['image', 'video', 'document'];
      const type = item.type && validTypes.includes(item.type) 
        ? item.type 
        : 'image';
      
      return {
        id: item.id || uuidv4(),
        url: item.url || item.imageUrl || item.src,
        type: type as 'image' | 'video' | 'document',
        caption: item.caption || item.title || item.description,
        date: item.date || item.createdAt || new Date().toISOString(),
        tags: ensureArray(item.tags),
        vehicleId: item.vehicleId || item.vehicle,
        albumId: item.albumId || item.album,
        location: item.location ? {
          lat: ensureNumber(item.location.lat),
          lon: ensureNumber(item.location.lon),
          name: item.location.name
        } : undefined,
        metadata: item.metadata ? {
          size: ensureNumber(item.metadata.size),
          width: ensureNumber(item.metadata.width),
          height: ensureNumber(item.metadata.height),
          duration: ensureNumber(item.metadata.duration),
          fileType: item.metadata.fileType || item.metadata.type
        } : undefined
      };
    });
  
  // Add to profile, ensuring no duplicates by id
  const existingIds = new Set(profile.gallery.map((g) => g.id));
  const uniqueItems = processedItems.filter((i) => !existingIds.has(i.id));
  
  profile.gallery = [...profile.gallery, ...uniqueItems];
}

/**
 * Process an array of routes
 */
function processRoutes(profile: UserProfileData, routes: any[]): void {
  if (!routes || !Array.isArray(routes)) return;
  
  const processedRoutes = routes
    .filter((route) => route && route.name !== undefined)
    .map((route: any) => {
      // Get start and end points with validation
      let startPoint = route.startPoint || route.start || {};
      let endPoint = route.endPoint || route.end || {};
      
      // Ensure valid lat/lon
      startPoint = {
        lat: ensureNumber(startPoint.lat, 0),
        lon: ensureNumber(startPoint.lon, 0),
        name: startPoint.name || 'Start'
      };
      
      endPoint = {
        lat: ensureNumber(endPoint.lat, 0),
        lon: ensureNumber(endPoint.lon, 0),
        name: endPoint.name || 'End'
      };
      
      // Process waypoints
      let waypoints = [];
      if (Array.isArray(route.waypoints)) {
        waypoints = route.waypoints.map((wp: any) => ({
          lat: ensureNumber(wp.lat, 0),
          lon: ensureNumber(wp.lon, 0),
          name: wp.name
        }));
      }
      
      return {
        id: route.id || uuidv4(),
        name: route.name || 'Unnamed Route',
        description: route.description,
        distance: ensureNumber(route.distance),
        estimatedTime: ensureNumber(route.estimatedTime || route.duration),
        startPoint,
        endPoint,
        waypoints,
        type: route.type || 'scenic',
        tags: ensureArray(route.tags),
        rating: ensureNumber(route.rating),
        createdAt: route.createdAt || new Date().toISOString(),
        lastDriven: route.lastDriven,
        seasons: ensureArray(route.seasons),
        vehicleRecommendations: ensureArray(route.vehicleRecommendations),
        shared: ensureBoolean(route.shared)
      };
    });
  
  // Add to profile, ensuring no duplicates by id
  const existingIds = new Set(profile.routes.savedRoutes.map((r) => r.id));
  const uniqueRoutes = processedRoutes.filter((r) => !existingIds.has(r.id));
  
  profile.routes.savedRoutes = [...profile.routes.savedRoutes, ...uniqueRoutes];
}

/**
 * Process an array of favorite roads
 */
function processFavoriteRoads(profile: UserProfileData, roads: any[]): void {
  if (!roads || !Array.isArray(roads)) return;
  
  const processedRoads = roads
    .filter((road) => road && road.name !== undefined)
    .map((road: any) => ({
      id: road.id || uuidv4(),
      name: road.name || 'Unnamed Road',
      location: road.location,
      rating: ensureNumber(road.rating, 5),
      tags: ensureArray(road.tags),
      notes: road.notes
    }));
  
  // Add to profile, ensuring no duplicates by id
  const existingIds = new Set(profile.routes.favoriteRoads.map((r) => r.id));
  const uniqueRoads = processedRoads.filter((r) => !existingIds.has(r.id));
  
  profile.routes.favoriteRoads = [...profile.routes.favoriteRoads, ...uniqueRoads];
  
  // Also update statistics
  if (uniqueRoads.length > 0) {
    const favoriteRoadNames = uniqueRoads.map((r) => r.name);
    profile.statistics.favoriteRoads = [...profile.statistics.favoriteRoads, ...favoriteRoadNames];
  }
}

/**
 * Update statistics based on collections
 */
function updateStatisticsFromCollections(profile: UserProfileData): void {
  // Update drive statistics
  if (profile.drives.length > 0) {
    let totalMiles = 0;
    let totalMinutes = 0;
    
    for (const drive of profile.drives) {
      totalMiles += drive.distance || 0;
      totalMinutes += drive.duration || 0;
    }
    
    profile.statistics.totalDrives = profile.drives.length;
    profile.statistics.totalMiles = totalMiles;
    
    if (profile.drives.length > 0 && totalMinutes > 0) {
      profile.statistics.avgDriveTime = Math.round(totalMinutes / profile.drives.length);
    }
  }
  
  // Update goals statistics
  if (profile.goals.length > 0) {
    const completedGoals = profile.goals.filter((goal) => goal.status === 'completed').length;
    profile.statistics.goalsCompleted = completedGoals;
  }
  
  // Update events statistics
  if (profile.events.length > 0) {
    const attendedEvents = profile.events.filter((event) => event.attended).length;
    profile.statistics.eventsAttended = attendedEvents;
  }
  
  // Update favorite roads
  if (profile.routes.favoriteRoads.length > 0) {
    const favoriteRoadNames = profile.routes.favoriteRoads.map((road) => road.name);
    profile.statistics.favoriteRoads = favoriteRoadNames;
  }
}

/**
 * Create a default empty profile
 */
function createDefaultProfile(): UserProfileData {
  const displayName = 'Car Enthusiast';
  const username = 'MemberDriver';
  
  return {
    identity: {
      id: uuidv4(),
      username: username,
      displayName: displayName,
      memberSince: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      membershipLevel: 'free',
      onboardingCompleted: false,
      onboardingProgress: {
        currentStep: 1,
        maxStepReached: 1,
        completedSections: []
      }
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      timeFormat: '12h',
      dateFormat: 'mdy',
      soundEnabled: true,
      units: 'imperial',
      weatherPreferences: {
        defaultLocation: {
          lat: 33.7490,
          lon: -84.3880,
          name: 'Atlanta, GA'
        },
        units: 'imperial'
      }
    },
    agreements: {
      termsAccepted: false,
      privacyAccepted: false,
      marketingOptIn: false
    },
    statistics: {
      totalDrives: 0,
      totalMiles: 0,
      avgDriveTime: 0,
      favoriteRoads: [],
      achievements: 0,
      goalsCompleted: 0,
      eventsAttended: 0,
      streaks: {
        currentLoginStreak: 1,
        longestLoginStreak: 1,
        currentDriveStreak: 0,
        longestDriveStreak: 0
      }
    },
    vehicles: [],
    drives: [],
    goals: [],
    events: [],
    gallery: [],
    detailingActivities: [],
    juiceBox: {
      favoriteProducts: [],
      savedLoadouts: []
    },
    podiumPursuit: {
      activeTargets: [],
      acquiredTargets: []
    },
    routes: {
      savedRoutes: [],
      favoriteRoads: []
    },
    audio: {
      playlists: [],
      soundSettings: {
        engineSoundEnhancement: true,
        navigationVolume: 80,
        musicVolume: 70,
        notificationSounds: true
      }
    },
    maintenance: {
      records: [],
      scheduledMaintenance: []
    },
    security: {
      mfaEnabled: false
    },
    _metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  };
}