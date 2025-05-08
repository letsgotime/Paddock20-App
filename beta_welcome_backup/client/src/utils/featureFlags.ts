/**
 * Feature Flag System
 * Provides centralized control over feature availability based on user roles and permissions
 */

import { User, AuthRole, AuthPermission, ROLE_PERMISSIONS } from '@/auth/types';

// Define all application feature flags
export enum FeatureFlag {
  // Core features
  WEATHER_PADDOCK = 'weatherPaddock',
  DRIVE_JOURNAL = 'driveJournal',
  GARAGE_VAULT = 'garageVault',
  MY_DASHBOARD = 'myDashboard',
  SETTINGS = 'settings',
  
  // Premium features
  PODIUM_PURSUIT = 'podiumPursuit',
  JUICE_BOX = 'juiceBox',
  WEATHER_ANALYTICS = 'weatherAnalytics',
  DRIVE_OPTIMIZATION = 'driveOptimization',
  MAINTENANCE_TRACKING = 'maintenanceTracking',
  
  // Admin features
  ADMIN_DASHBOARD = 'adminDashboard',
  USER_MANAGEMENT = 'userManagement',
  FEATURE_MANAGEMENT = 'featureManagement',
  
  // Beta features
  BETA_FEATURE_1 = 'betaFeature1',
  BETA_FEATURE_2 = 'betaFeature2'
}

// Map features to required permissions
const featurePermissionsMap: Record<FeatureFlag, AuthPermission | AuthPermission[]> = {
  // Core features (available to all authenticated users)
  [FeatureFlag.WEATHER_PADDOCK]: AuthPermission.ACCESS_WEATHER_PADDOCK,
  [FeatureFlag.DRIVE_JOURNAL]: AuthPermission.ACCESS_DRIVE_JOURNAL,
  [FeatureFlag.GARAGE_VAULT]: AuthPermission.ACCESS_GARAGE_VAULT,
  [FeatureFlag.MY_DASHBOARD]: AuthPermission.MANAGE_OWN_PROFILE,
  [FeatureFlag.SETTINGS]: AuthPermission.MANAGE_OWN_PROFILE,
  
  // Premium features
  [FeatureFlag.PODIUM_PURSUIT]: AuthPermission.ACCESS_PODIUM_PURSUIT,
  [FeatureFlag.JUICE_BOX]: AuthPermission.ACCESS_PREMIUM_FEATURES,
  [FeatureFlag.WEATHER_ANALYTICS]: AuthPermission.ACCESS_PREMIUM_FEATURES,
  [FeatureFlag.DRIVE_OPTIMIZATION]: AuthPermission.ACCESS_PREMIUM_FEATURES,
  [FeatureFlag.MAINTENANCE_TRACKING]: AuthPermission.ACCESS_PREMIUM_FEATURES,
  
  // Admin features
  [FeatureFlag.ADMIN_DASHBOARD]: AuthPermission.VIEW_ADMIN_DASHBOARD,
  [FeatureFlag.USER_MANAGEMENT]: AuthPermission.MANAGE_USERS,
  [FeatureFlag.FEATURE_MANAGEMENT]: [
    AuthPermission.MANAGE_CONTENT, 
    AuthPermission.VIEW_ADMIN_DASHBOARD
  ],
  
  // Beta features
  [FeatureFlag.BETA_FEATURE_1]: AuthPermission.ACCESS_BETA_FEATURES,
  [FeatureFlag.BETA_FEATURE_2]: AuthPermission.ACCESS_BETA_FEATURES
};

// Feature limits based on role (e.g., number of vehicles, journal entries, etc.)
export interface FeatureLimits {
  maxVehicles: number;
  maxJournalEntries: number;
  maxTracks: number;
  maxMaintenanceItems: number;
  weatherForecastDays: number;
  hasCustomizableDashboard: boolean;
  hasAdvancedAnalytics: boolean;
}

// Default limits by role
const defaultLimits: Record<AuthRole, FeatureLimits> = {
  [AuthRole.DRIVER]: {
    maxVehicles: 2,
    maxJournalEntries: 5,
    maxTracks: 3,
    maxMaintenanceItems: 10,
    weatherForecastDays: 3,
    hasCustomizableDashboard: false,
    hasAdvancedAnalytics: false
  },
  [AuthRole.TEAM_MANAGER]: {
    maxVehicles: 10,
    maxJournalEntries: -1, // Unlimited
    maxTracks: -1, // Unlimited
    maxMaintenanceItems: -1, // Unlimited
    weatherForecastDays: 7,
    hasCustomizableDashboard: true,
    hasAdvancedAnalytics: true
  },
  [AuthRole.RACE_ENGINEER]: {
    maxVehicles: -1, // Unlimited
    maxJournalEntries: -1, // Unlimited
    maxTracks: -1, // Unlimited
    maxMaintenanceItems: -1, // Unlimited
    weatherForecastDays: 14,
    hasCustomizableDashboard: true,
    hasAdvancedAnalytics: true
  },
  [AuthRole.TEAM_PRINCIPAL]: {
    maxVehicles: -1, // Unlimited
    maxJournalEntries: -1, // Unlimited
    maxTracks: -1, // Unlimited
    maxMaintenanceItems: -1, // Unlimited
    weatherForecastDays: 14,
    hasCustomizableDashboard: true,
    hasAdvancedAnalytics: true
  },
  [AuthRole.BETA_TESTER]: {
    maxVehicles: 3,
    maxJournalEntries: 10,
    maxTracks: 5,
    maxMaintenanceItems: 15,
    weatherForecastDays: 5,
    hasCustomizableDashboard: true,
    hasAdvancedAnalytics: false
  }
};

/**
 * Checks if a user has access to a specific feature
 */
export function hasFeatureAccess(user: User | null, feature: FeatureFlag): boolean {
  if (!user) return false;
  
  // Get the required permissions for the feature
  const requiredPermissions = featurePermissionsMap[feature];
  
  // Get the user's permissions based on their role
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  
  // Check if the user has the required permissions
  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  } else {
    return userPermissions.includes(requiredPermissions);
  }
}

/**
 * Gets the feature limits for a user based on their role
 */
export function getFeatureLimits(user: User | null): FeatureLimits {
  if (!user) {
    // Return most restrictive limits for unauthenticated users
    return defaultLimits[AuthRole.DRIVER];
  }
  
  return defaultLimits[user.role] || defaultLimits[AuthRole.DRIVER];
}

/**
 * Checks if a user has reached a specific limit
 */
export function hasReachedLimit(
  user: User | null, 
  limitKey: keyof FeatureLimits, 
  currentCount: number
): boolean {
  if (!user) return true;
  
  const limits = getFeatureLimits(user);
  const limit = limits[limitKey];
  
  // -1 indicates unlimited
  if (limit === -1) return false;
  
  // Handle boolean properties differently
  if (typeof limit === 'boolean') {
    return limit === false;
  }
  
  return currentCount >= limit;
}

/**
 * Gets all available features for a user
 */
export function getAvailableFeatures(user: User | null): FeatureFlag[] {
  if (!user) return [];
  
  return Object.values(FeatureFlag).filter(feature => 
    hasFeatureAccess(user, feature)
  );
}

/**
 * Premium feature checker
 */
export function isPremiumFeature(feature: FeatureFlag): boolean {
  const premiumFeatures = [
    FeatureFlag.PODIUM_PURSUIT,
    FeatureFlag.JUICE_BOX,
    FeatureFlag.WEATHER_ANALYTICS,
    FeatureFlag.DRIVE_OPTIMIZATION,
    FeatureFlag.MAINTENANCE_TRACKING
  ];
  
  return premiumFeatures.includes(feature);
}

/**
 * Creates a user-friendly description of feature limitations
 */
export function getFeatureLimitDescription(user: User | null, feature: FeatureFlag): string {
  if (!user) return '';
  
  const limits = getFeatureLimits(user);
  
  switch (feature) {
    case FeatureFlag.GARAGE_VAULT:
      return limits.maxVehicles === -1 
        ? 'Unlimited vehicles' 
        : `Up to ${limits.maxVehicles} vehicles`;
      
    case FeatureFlag.DRIVE_JOURNAL:
      return limits.maxJournalEntries === -1 
        ? 'Unlimited journal entries' 
        : `Up to ${limits.maxJournalEntries} journal entries`;
      
    case FeatureFlag.WEATHER_PADDOCK:
      return `${limits.weatherForecastDays}-day forecast`;
      
    default:
      return '';
  }
}