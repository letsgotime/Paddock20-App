/**
 * User profile type definition
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  memberSince: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
  };
  preferences?: {
    darkMode: boolean;
    notifications: boolean;
    units: 'imperial' | 'metric';
    emailFrequency?: 'daily' | 'weekly' | 'monthly' | 'never';
    dashboardLayout?: string[];
  };
  membershipLevel?: string;
  mfaEnabled?: boolean;
}

/**
 * Driver level progression system
 */
export interface DriverLevel {
  title: string; // e.g., "Redline Racer", "Grid King", etc.
  level: number; // 1-5 with 5 being highest
  points: number; // Total accumulation of points
  pointsToNextLevel: number; // Points needed for next level
  nextLevel?: string; // Title of next level if applicable
  description: string; // Description of this level
  badgeUrl?: string; // URL to badge image
}

/**
 * User achievement
 */
export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  dateEarned: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category?: 'driving' | 'maintenance' | 'social' | 'goals' | 'collection' | 'charity';
  points?: number;
  imageUrl?: string;
}

/**
 * Telemetry data point for performance tracking
 */
export interface TelemetryData {
  id: string;
  timestamp: string;
  userId: string;
  vehicleId: string;
  driveLogId?: string;
  
  // Location data
  latitude?: number;
  longitude?: number;
  altitude?: number;
  
  // Performance metrics
  speed?: number; // mph or kph
  rpm?: number;
  acceleration?: number; // g-force
  braking?: number; // negative g-force
  lateralG?: number; // lateral g-force (cornering)
  throttlePosition?: number; // percentage
  brakePosition?: number; // percentage
  steeringAngle?: number; // degrees
  
  // Vehicle data
  engineTemp?: number;
  oilTemp?: number;
  oilPressure?: number;
  fuelLevel?: number;
  batteryVoltage?: number;
  
  // Environmental data
  outsideTemp?: number;
  roadCondition?: string;
  weatherCondition?: string;
  
  // Calculated metrics
  corneringScore?: number;
  brakingScore?: number;
  accelerationScore?: number;
  efficiencyScore?: number;
}

/**
 * User dashboard activity item 
 */
export interface DashboardActivity {
  id: string;
  type: 'drive' | 'maintenance' | 'goal' | 'achievement' | 'vehicle' | 'timepiece' | 'event' | 'charity';
  timestamp: string;
  title: string;
  description: string;
  relatedId?: string;
  relatedType?: string;
  imageUrl?: string;
}

/**
 * User privacy settings
 */
export interface PrivacySettings {
  shareProfile: boolean;
  shareVehicles: boolean;
  shareAchievements: boolean;
  shareRoutes: boolean;
  shareGoals: boolean;
  shareMedia: boolean;
  allowLocationTracking: boolean;
  allowTelemetryCollection: boolean;
  dataRetentionPolicy: 'forever' | '1year' | '30days';
}