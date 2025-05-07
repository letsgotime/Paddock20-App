/**
 * UserProfileWarehouse.ts
 * 
 * Single source of truth for all user profile data across the Paddock20 platform.
 * This service centralizes, validates, and manages all user-specific information.
 * 
 * Design principles:
 * - Comprehensive: Stores ALL user data from every part of the app
 * - Bidirectional: All components both read from and write to this source
 * - Dynamic: Handles new data types as the app evolves
 * - Error-resistant: Full validation to prevent data corruption
 * - Secure: Protected storage with proper access controls
 * - Portable: Data follows the user throughout their journey
 * 
 * Created: May 2025
 * Last Updated: May 5, 2025 - Enhanced with secure storage and data protection
 */

import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getUserDisplayName } from '../utils/DataIntegrityVerifier';
import * as safeStorage from '../utils/storageManager';
import { validateUserProfileData } from '../utils/dataValidation';

// Main Profile Data Sections
// 1. Core user identity and metadata
export interface UserIdentity {
  id: string;                               // Unique user identifier
  username: string;                         // Username for login
  email?: string;                           // User email (if available)
  phone?: string;                           // User phone number (optional)
  displayName: string;                      // User's display name
  firstName?: string;                       // First name (optional)
  lastName?: string;                        // Last name (optional)
  avatar?: string;                          // Avatar image URL
  bio?: string;                             // User biography/about
  location?: string;                        // User location (e.g. "Atlanta, GA")
  memberSince: string;                      // ISO date when user joined
  lastActive: string;                       // ISO date of last activity
  membershipLevel: 'free' | 'premium' | 'elite'; // Membership tier
  socialLinks?: {                           // Social media profiles
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  onboardingCompleted: boolean;             // Whether onboarding is complete
  onboardingProgress?: {                    // Tracks onboarding progress
    currentStep: number;
    maxStepReached: number;
    completedSections: string[];
  };
}

// 2. User preferences and settings
export interface UserPreferences {
  // UI preferences
  theme: 'dark' | 'light' | 'auto';
  colorAccent?: string;                      // Preferred accent color
  dashboardLayout?: string;                  // Dashboard layout setting
  
  // Notification settings
  notifications: boolean;                    // Master toggle
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  notificationTypes?: {                      // Fine-grained control
    events: boolean;
    maintenance: boolean;
    social: boolean;
    marketing: boolean;
    system: boolean;
  };
  
  // Format preferences
  timeFormat: '12h' | '24h';
  dateFormat: 'mdy' | 'dmy' | 'ymd';
  units: 'imperial' | 'metric';
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD';
  
  // Feature settings
  soundEnabled: boolean;                     // Sound effects
  animationsEnabled?: boolean;               // UI animations
  feedContent?: string[];                    // Feed content preferences
  contentFilter?: 'strict' | 'moderate' | 'none';
  marketplaceFilters?: {                     // Marketplace preferences
    categories?: string[];
    priceRange?: [number, number];
    showSold?: boolean;
  };
  
  // Privacy settings
  privacySettings?: {
    profileVisibility: 'public' | 'members' | 'private';
    activityVisibility: 'public' | 'members' | 'private';
    locationSharing: boolean;
    dataCollection: boolean;
  };
  
  // Weather preferences
  weatherPreferences: {
    defaultLocation: {
      lat: number;
      lon: number;
      name: string;
    };
    units: 'imperial' | 'metric';
    savedLocations?: Array<{
      lat: number;
      lon: number;
      name: string;
    }>;
    showExtendedForecast?: boolean;
    showPrecipitationChance?: boolean;
    showWindInfo?: boolean;
    weatherAlerts?: boolean;
  };
  
  // Performance preferences
  performancePreferences?: {
    dataSaving: boolean;
    highPerformanceMode: boolean;
    backgroundSync: boolean;
    cacheStrategy: 'minimal' | 'balanced' | 'aggressive';
  };
}

// 3. User agreement records
export interface UserAgreements {
  termsAccepted: boolean;
  termsVersion?: string;
  termsAcceptedDate?: string;
  privacyAccepted: boolean;
  privacyVersion?: string;
  privacyAcceptedDate?: string;
  marketingOptIn: boolean;
  marketingOptInDate?: string;
  dataProcessingConsent?: boolean;
  dataProcessingConsentDate?: string;
  // Additional agreements can be added as needed
}

// 4. User statistics and activity metrics
export interface UserStatistics {
  totalDrives: number;
  totalMiles: number;
  avgDriveTime: number;
  favoriteRoads: string[];
  achievements: number;
  goalsCompleted: number;
  eventsAttended: number;
  drivingStyle?: {
    aggression: number;            // 1-10 scale
    smoothness: number;            // 1-10 scale  
    consistency: number;           // 1-10 scale
    efficiency: number;            // 1-10 scale
  };
  recentActivity?: {
    lastDriveDate?: string;
    lastMaintenanceDate?: string;
    lastEventDate?: string;
    lastLoginDate?: string;
  };
  streaks?: {
    currentLoginStreak: number;
    longestLoginStreak: number;
    currentDriveStreak: number;
    longestDriveStreak: number;
  };
  rankingPoints?: number;
  badges?: string[];
  milestones?: {
    id: string;
    name: string;
    achievedDate: string;
  }[];
}

// 5. Collections of user-linked data
// Vehicle data structure (simplified - linked to full vehicle records)
export interface VehicleReference {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname?: string;
  vin?: string;
  status: 'active' | 'inactive' | 'archived' | 'sold';
  primaryImage?: string;
}

// Drive activity records
export interface DriveRecord {
  id: string;
  date: string;
  route?: string;
  distance?: number;
  duration?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  weather?: string;
  notes?: string;
  images?: string[];
  vehicleId?: string;
  rating?: number; // 1-5 rating
  tags?: string[];
  waypoints?: {
    lat: number;
    lon: number;
    timestamp: string;
  }[];
}

// Goal/target data for Manifestation Station
export interface GoalRecord {
  id: string;
  type: 'vehicle' | 'experience' | 'achievement' | 'maintenance' | 'upgrade';
  description: string;
  targetDate: string;
  createdAt: string;
  completedAt?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  steps?: {
    id: string;
    description: string;
    completed: boolean;
  }[];
  budget?: number;
  vehicleId?: string;
  visibility?: 'private' | 'public';
  collaborators?: string[];
}

// Event participation records
export interface EventRecord {
  id: string;
  name: string;
  date: string;
  location: string;
  type: string;
  registered: boolean;
  attended?: boolean;
  images?: string[];
  notes?: string;
  rating?: number;
  vehicleId?: string;
  reminders?: {
    enabled: boolean;
    timeBeforeEvent: number; // in minutes
  };
}

// Media/gallery items
export interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  caption?: string;
  date: string;
  tags?: string[];
  vehicleId?: string;
  albumId?: string;
  location?: {
    lat: number;
    lon: number;
    name?: string;
  };
  metadata?: {
    size?: number;
    width?: number;
    height?: number;
    duration?: number;
    fileType?: string;
  };
}

// Detailing activities from Juice Box
export interface DetailingActivity {
  id: string;
  type: string;
  date: string;
  vehicleId: string;
  products?: {
    id: string;
    name: string;
    brand?: string;
    category?: string;
  }[];
  notes?: string;
  images?: string[];
  steps?: {
    id: string;
    description: string;
    duration?: number;
  }[];
  rating?: number;
  beforeImages?: string[];
  afterImages?: string[];
  weatherConditions?: {
    temperature?: number;
    humidity?: number;
    conditions?: string;
  };
}

// Saved products and loadouts from Juice Box
export interface JuiceBoxData {
  favoriteProducts: {
    id: string;
    name: string;
    brand: string;
    category: string;
    rating?: number;
    notes?: string;
    dateAdded: string;
  }[];
  savedLoadouts: {
    id: string;
    name: string;
    description?: string;
    products: {
      id: string;
      name: string;
      brand: string;
      category: string;
    }[];
    vehicleTypes?: string[];
    seasons?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    createdAt: string;
    updatedAt?: string;
  }[];
  recentlyViewed?: {
    id: string;
    name: string;
    type: 'product' | 'loadout' | 'guide';
    timestamp: string;
  }[];
}

// Podium Pursuit Targets
export interface PodiumPursuitData {
  activeTargets: {
    id: string;
    name: string;
    type: 'vehicle' | 'accessory' | 'experience';
    targetPrice?: number;
    targetDate?: string;
    progress: number; // 0-100
    description?: string;
    images?: string[];
    links?: string[];
    notes?: string[];
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt?: string;
  }[];
  acquiredTargets: {
    id: string;
    name: string;
    type: 'vehicle' | 'accessory' | 'experience';
    acquiredDate: string;
    actualPrice?: number;
    description?: string;
    images?: string[];
    notes?: string;
    reviewRating?: number;
    relatedVehicleId?: string;
  }[];
  abandonedTargets?: {
    id: string;
    name: string;
    reason?: string;
    dateAbandoned: string;
  }[];
}

// Saved routes and favorite driving roads
export interface RoutesData {
  savedRoutes: {
    id: string;
    name: string;
    description?: string;
    distance?: number;
    estimatedTime?: number;
    startPoint: {
      lat: number;
      lon: number;
      name?: string;
    };
    endPoint: {
      lat: number;
      lon: number;
      name?: string;
    };
    waypoints?: {
      lat: number;
      lon: number;
      name?: string;
    }[];
    type?: 'scenic' | 'fast' | 'technical' | 'offroad';
    tags?: string[];
    rating?: number;
    createdAt: string;
    lastDriven?: string;
    seasons?: string[];
    vehicleRecommendations?: string[];
    shared?: boolean;
  }[];
  favoriteRoads: {
    id: string;
    name: string;
    location?: string;
    rating: number;
    tags?: string[];
    notes?: string;
  }[];
}

// Playlist/audio configuration
export interface AudioPreferences {
  playlists: {
    id: string;
    name: string;
    source: 'spotify' | 'apple' | 'custom';
    externalId?: string;
    tracks?: number;
    routeId?: string;
    vehicleId?: string;
    mood?: string[];
    tags?: string[];
  }[];
  soundSettings?: {
    engineSoundEnhancement: boolean;
    navigationVolume: number;
    musicVolume: number;
    notificationSounds: boolean;
    ambienceEffects?: boolean;
  };
}

// Maintenance tracking history
export interface MaintenanceHistory {
  records: {
    id: string;
    vehicleId: string;
    type: string;
    subtype?: string;
    date: string;
    mileage: number;
    service: string;
    location?: string;
    cost?: number;
    notes?: string;
    images?: string[];
    documents?: string[];
    parts?: {
      id: string;
      name: string;
      partNumber?: string;
      brand?: string;
      cost?: number;
    }[];
    performed: 'self' | 'professional';
    performedBy?: string;
  }[];
  scheduledMaintenance?: {
    id: string;
    vehicleId: string;
    type: string;
    dueDate?: string;
    dueMileage?: number;
    interval?: {
      time?: number; // months
      distance?: number; // miles/km
    };
    description: string;
    priority: 'low' | 'medium' | 'high';
    notifyBefore?: {
      time?: number; // days
      distance?: number; // miles/km
    };
    notes?: string;
    repeat?: boolean;
  }[];
}

// Safety and security settings
export interface SecuritySettings {
  mfaEnabled?: boolean;
  trustedDevices?: {
    id: string;
    name: string;
    lastUsed: string;
    browser?: string;
    os?: string;
  }[];
  loginHistory?: {
    timestamp: string;
    ipAddress?: string;
    location?: string;
    device?: string;
    successful: boolean;
  }[];
  dataExports?: {
    requestDate: string;
    completionDate?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
  }[];
  accountRecovery?: {
    email?: string;
    phone?: string;
    recoveryCodesRemaining?: number;
  };
}

// The complete user profile data structure
export interface UserProfileData {
  // Core sections
  identity: UserIdentity;
  preferences: UserPreferences;
  agreements: UserAgreements;
  statistics: UserStatistics;
  
  // Collections of user data
  vehicles: VehicleReference[];
  drives: DriveRecord[];
  goals: GoalRecord[];
  events: EventRecord[];
  gallery: GalleryItem[];
  detailingActivities: DetailingActivity[];
  juiceBox: JuiceBoxData;
  podiumPursuit: PodiumPursuitData;
  routes: RoutesData;
  audio: AudioPreferences;
  maintenance: MaintenanceHistory;
  security: SecuritySettings;
  
  // Metadata for the warehouse itself
  _metadata: {
    version: string;
    lastUpdated: string;
    createdAt: string;
    lastBackup?: string;
    storageSize?: number;
    dataPoints?: number;
  };
}

// Store interface
interface UserProfileStore {
  profile: UserProfileData | null;
  isLoading: boolean;
  error: string | null;
  
  // Core actions
  setProfile: (profile: UserProfileData) => void;
  updateProfile: (updates: Partial<UserProfileData>) => void;
  resetProfile: () => void;
  
  // Identity actions
  updateIdentity: (updates: Partial<UserIdentity>) => void;
  
  // Preferences actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateWeatherPreferences: (updates: Partial<UserPreferences['weatherPreferences']>) => void;
  
  // Statistics actions
  updateStatistics: (updates: Partial<UserStatistics>) => void;
  
  // Collection actions
  // Vehicles
  addVehicleReference: (vehicle: VehicleReference) => void;
  updateVehicleReference: (id: string, updates: Partial<VehicleReference>) => void;
  removeVehicleReference: (id: string) => void;
  
  // Drives
  addDrive: (drive: DriveRecord) => void;
  updateDrive: (id: string, updates: Partial<DriveRecord>) => void;
  removeDrive: (id: string) => void;
  
  // Goals
  addGoal: (goal: GoalRecord) => void;
  updateGoal: (id: string, updates: Partial<GoalRecord>) => void;
  removeGoal: (id: string) => void;
  
  // Events
  addEvent: (event: EventRecord) => void;
  updateEvent: (id: string, updates: Partial<EventRecord>) => void;
  removeEvent: (id: string) => void;
  
  // Gallery
  addGalleryItem: (item: GalleryItem) => void;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>) => void;
  removeGalleryItem: (id: string) => void;
  
  // Detailing Activities
  addDetailingActivity: (activity: DetailingActivity) => void;
  updateDetailingActivity: (id: string, updates: Partial<DetailingActivity>) => void;
  removeDetailingActivity: (id: string) => void;
  
  // JuiceBox
  addFavoriteProduct: (product: JuiceBoxData['favoriteProducts'][0]) => void;
  removeFavoriteProduct: (id: string) => void;
  addSavedLoadout: (loadout: JuiceBoxData['savedLoadouts'][0]) => void;
  updateSavedLoadout: (id: string, updates: Partial<JuiceBoxData['savedLoadouts'][0]>) => void;
  removeSavedLoadout: (id: string) => void;
  
  // Podium Pursuit
  addPodiumTarget: (target: PodiumPursuitData['activeTargets'][0]) => void;
  updatePodiumTarget: (id: string, updates: Partial<PodiumPursuitData['activeTargets'][0]>) => void;
  removePodiumTarget: (id: string) => void;
  completePodiumTarget: (id: string, completionData: Partial<PodiumPursuitData['acquiredTargets'][0]>) => void;
  
  // Routes
  addSavedRoute: (route: RoutesData['savedRoutes'][0]) => void;
  updateSavedRoute: (id: string, updates: Partial<RoutesData['savedRoutes'][0]>) => void;
  removeSavedRoute: (id: string) => void;
  addFavoriteRoad: (road: RoutesData['favoriteRoads'][0]) => void;
  removeFavoriteRoad: (id: string) => void;
  
  // Audio
  addPlaylist: (playlist: AudioPreferences['playlists'][0]) => void;
  updatePlaylist: (id: string, updates: Partial<AudioPreferences['playlists'][0]>) => void;
  removePlaylist: (id: string) => void;
  updateSoundSettings: (settings: Partial<NonNullable<AudioPreferences['soundSettings']>>) => void;
  
  // Maintenance
  addMaintenanceRecord: (record: MaintenanceHistory['records'][0]) => void;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceHistory['records'][0]>) => void;
  removeMaintenanceRecord: (id: string) => void;
  addScheduledMaintenance: (maintenance: NonNullable<MaintenanceHistory['scheduledMaintenance']>[0]) => void;
  updateScheduledMaintenance: (id: string, updates: Partial<NonNullable<MaintenanceHistory['scheduledMaintenance']>[0]>) => void;
  removeScheduledMaintenance: (id: string) => void;
  completeScheduledMaintenance: (id: string, completionData: Partial<MaintenanceHistory['records'][0]>) => void;
  
  // Agreements
  updateAgreements: (updates: Partial<UserAgreements>) => void;
  
  // Security
  updateSecuritySettings: (updates: Partial<SecuritySettings>) => void;
}

/**
 * Main UserProfileWarehouse implementation
 * This is the core service that other components will interact with
 */
class UserProfileWarehouseService {
  private store: UserProfileStore;
  private initialized: boolean = false;
  private changeListeners: Array<(profile: UserProfileData) => void> = [];
  
  constructor() {
    // Initialize the store
    this.store = this.createStore();
  }
  
  /**
   * Creates the Zustand store with persistence
   */
  private createStore(): UserProfileStore {
    return create<UserProfileStore>()(
      persist(
        (set, get) => ({
          profile: null,
          isLoading: false,
          error: null,
          
          // Core actions
          setProfile: (profile: UserProfileData) => {
            // Validate the profile before setting
            try {
              const validatedProfile = validateUserProfileData(profile);
              set({ profile: validatedProfile, error: null });
              this.notifyListeners(validatedProfile);
            } catch (error) {
              console.error('Error setting profile:', error);
              set({ error: error instanceof Error ? error.message : 'Unknown error setting profile' });
            }
          },
          
          updateProfile: (updates: Partial<UserProfileData>) => {
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            try {
              // Merge and validate updates
              const updatedProfile = {
                ...currentProfile,
                ...updates,
                _metadata: {
                  ...currentProfile._metadata,
                  lastUpdated: new Date().toISOString(),
                }
              };
              
              const validatedProfile = validateUserProfileData(updatedProfile);
              set({ profile: validatedProfile, error: null });
              this.notifyListeners(validatedProfile);
            } catch (error) {
              console.error('Error updating profile:', error);
              set({ error: error instanceof Error ? error.message : 'Unknown error updating profile' });
            }
          },
          
          resetProfile: () => set({ profile: null, error: null }),
          
          // Identity actions
          updateIdentity: (updates: Partial<UserIdentity>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              identity: {
                ...currentProfile.identity,
                ...updates,
                lastActive: new Date().toISOString()
              }
            });
          },
          
          // Preferences actions
          updatePreferences: (updates: Partial<UserPreferences>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              preferences: {
                ...currentProfile.preferences,
                ...updates
              }
            });
          },
          
          updateWeatherPreferences: (updates: Partial<UserPreferences['weatherPreferences']>) => {
            const { updatePreferences } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updatePreferences({
              weatherPreferences: {
                ...currentProfile.preferences.weatherPreferences,
                ...updates
              }
            });
          },
          
          // Statistics actions
          updateStatistics: (updates: Partial<UserStatistics>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              statistics: {
                ...currentProfile.statistics,
                ...updates
              }
            });
          },
          
          // Vehicle actions
          addVehicleReference: (vehicle: VehicleReference) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure vehicle has an ID
            const vehicleWithId = vehicle.id ? vehicle : { ...vehicle, id: uuidv4() };
            
            updateProfile({
              vehicles: [...currentProfile.vehicles, vehicleWithId]
            });
          },
          
          updateVehicleReference: (id: string, updates: Partial<VehicleReference>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              vehicles: currentProfile.vehicles.map(v => 
                v.id === id ? { ...v, ...updates } : v
              )
            });
          },
          
          removeVehicleReference: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              vehicles: currentProfile.vehicles.filter(v => v.id !== id)
            });
          },
          
          // Drives actions
          addDrive: (drive: DriveRecord) => {
            const { updateProfile, updateStatistics } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure drive has an ID
            const driveWithId = drive.id ? drive : { ...drive, id: uuidv4() };
            
            // Update drives collection
            updateProfile({
              drives: [...currentProfile.drives, driveWithId]
            });
            
            // Update statistics
            updateStatistics({
              totalDrives: currentProfile.statistics.totalDrives + 1,
              totalMiles: currentProfile.statistics.totalMiles + (drive.distance || 0)
            });
          },
          
          updateDrive: (id: string, updates: Partial<DriveRecord>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Find the drive to update
            const driveToUpdate = currentProfile.drives.find(d => d.id === id);
            if (!driveToUpdate) return;
            
            // Calculate mile difference if distance changed
            let distanceDiff = 0;
            if (updates.distance !== undefined && driveToUpdate.distance !== undefined) {
              distanceDiff = updates.distance - driveToUpdate.distance;
            }
            
            // Update drive
            updateProfile({
              drives: currentProfile.drives.map(d => 
                d.id === id ? { ...d, ...updates } : d
              )
            });
            
            // Update statistics if distance changed
            if (distanceDiff !== 0) {
              const { updateStatistics } = get();
              updateStatistics({
                totalMiles: currentProfile.statistics.totalMiles + distanceDiff
              });
            }
          },
          
          removeDrive: (id: string) => {
            const { updateProfile, updateStatistics } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Find the drive to remove
            const driveToRemove = currentProfile.drives.find(d => d.id === id);
            if (!driveToRemove) return;
            
            // Update drives collection
            updateProfile({
              drives: currentProfile.drives.filter(d => d.id !== id)
            });
            
            // Update statistics
            updateStatistics({
              totalDrives: currentProfile.statistics.totalDrives - 1,
              totalMiles: currentProfile.statistics.totalMiles - (driveToRemove.distance || 0)
            });
          },
          
          // Goals actions
          addGoal: (goal: GoalRecord) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure goal has an ID
            const goalWithId = goal.id ? goal : { ...goal, id: uuidv4() };
            
            updateProfile({
              goals: [...currentProfile.goals, goalWithId]
            });
          },
          
          updateGoal: (id: string, updates: Partial<GoalRecord>) => {
            const { updateProfile, updateStatistics } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Find the goal to update
            const goalToUpdate = currentProfile.goals.find(g => g.id === id);
            if (!goalToUpdate) return;
            
            // Check if we're completing a goal
            let updateStats = false;
            if (updates.status === 'completed' && goalToUpdate.status !== 'completed') {
              updateStats = true;
            } else if (goalToUpdate.status === 'completed' && updates.status && updates.status !== 'completed') {
              updateStats = true;
            }
            
            // Update goal
            updateProfile({
              goals: currentProfile.goals.map(g => 
                g.id === id ? { ...g, ...updates } : g
              )
            });
            
            // Update statistics if needed
            if (updateStats) {
              const completedCount = updates.status === 'completed' 
                ? currentProfile.statistics.goalsCompleted + 1 
                : currentProfile.statistics.goalsCompleted - 1;
              
              updateStatistics({
                goalsCompleted: completedCount
              });
            }
          },
          
          removeGoal: (id: string) => {
            const { updateProfile, updateStatistics } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Find the goal to remove
            const goalToRemove = currentProfile.goals.find(g => g.id === id);
            if (!goalToRemove) return;
            
            // Update goals collection
            updateProfile({
              goals: currentProfile.goals.filter(g => g.id !== id)
            });
            
            // Update statistics if it was a completed goal
            if (goalToRemove.status === 'completed') {
              updateStatistics({
                goalsCompleted: currentProfile.statistics.goalsCompleted - 1
              });
            }
          },
          
          // Events actions
          addEvent: (event: EventRecord) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure event has an ID
            const eventWithId = event.id ? event : { ...event, id: uuidv4() };
            
            updateProfile({
              events: [...currentProfile.events, eventWithId]
            });
          },
          
          updateEvent: (id: string, updates: Partial<EventRecord>) => {
            const { updateProfile, updateStatistics } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Find the event to update
            const eventToUpdate = currentProfile.events.find(e => e.id === id);
            if (!eventToUpdate) return;
            
            // Check if we're marking an event as attended
            let updateStats = false;
            if (updates.attended === true && eventToUpdate.attended !== true) {
              updateStats = true;
            } else if (eventToUpdate.attended === true && updates.attended === false) {
              updateStats = true;
            }
            
            // Update event
            updateProfile({
              events: currentProfile.events.map(e => 
                e.id === id ? { ...e, ...updates } : e
              )
            });
            
            // Update statistics if needed
            if (updateStats) {
              const attendedCount = updates.attended === true 
                ? currentProfile.statistics.eventsAttended + 1 
                : currentProfile.statistics.eventsAttended - 1;
              
              updateStatistics({
                eventsAttended: attendedCount
              });
            }
          },
          
          removeEvent: (id: string) => {
            const { updateProfile, updateStatistics } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Find the event to remove
            const eventToRemove = currentProfile.events.find(e => e.id === id);
            if (!eventToRemove) return;
            
            // Update events collection
            updateProfile({
              events: currentProfile.events.filter(e => e.id !== id)
            });
            
            // Update statistics if it was an attended event
            if (eventToRemove.attended) {
              updateStatistics({
                eventsAttended: currentProfile.statistics.eventsAttended - 1
              });
            }
          },
          
          // Gallery actions
          addGalleryItem: (item: GalleryItem) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure item has an ID
            const itemWithId = item.id ? item : { ...item, id: uuidv4() };
            
            updateProfile({
              gallery: [...currentProfile.gallery, itemWithId]
            });
          },
          
          updateGalleryItem: (id: string, updates: Partial<GalleryItem>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              gallery: currentProfile.gallery.map(item => 
                item.id === id ? { ...item, ...updates } : item
              )
            });
          },
          
          removeGalleryItem: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              gallery: currentProfile.gallery.filter(item => item.id !== id)
            });
          },
          
          // Detailing activities actions
          addDetailingActivity: (activity: DetailingActivity) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure activity has an ID
            const activityWithId = activity.id ? activity : { ...activity, id: uuidv4() };
            
            updateProfile({
              detailingActivities: [...currentProfile.detailingActivities, activityWithId]
            });
          },
          
          updateDetailingActivity: (id: string, updates: Partial<DetailingActivity>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              detailingActivities: currentProfile.detailingActivities.map(activity => 
                activity.id === id ? { ...activity, ...updates } : activity
              )
            });
          },
          
          removeDetailingActivity: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              detailingActivities: currentProfile.detailingActivities.filter(activity => activity.id !== id)
            });
          },
          
          // JuiceBox actions
          addFavoriteProduct: (product: JuiceBoxData['favoriteProducts'][0]) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure product has an ID
            const productWithId = product.id ? product : { ...product, id: uuidv4() };
            
            updateProfile({
              juiceBox: {
                ...currentProfile.juiceBox,
                favoriteProducts: [...currentProfile.juiceBox.favoriteProducts, productWithId]
              }
            });
          },
          
          removeFavoriteProduct: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              juiceBox: {
                ...currentProfile.juiceBox,
                favoriteProducts: currentProfile.juiceBox.favoriteProducts.filter(product => product.id !== id)
              }
            });
          },
          
          addSavedLoadout: (loadout: JuiceBoxData['savedLoadouts'][0]) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure loadout has an ID
            const loadoutWithId = loadout.id ? loadout : { ...loadout, id: uuidv4() };
            
            updateProfile({
              juiceBox: {
                ...currentProfile.juiceBox,
                savedLoadouts: [...currentProfile.juiceBox.savedLoadouts, loadoutWithId]
              }
            });
          },
          
          updateSavedLoadout: (id: string, updates: Partial<JuiceBoxData['savedLoadouts'][0]>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              juiceBox: {
                ...currentProfile.juiceBox,
                savedLoadouts: currentProfile.juiceBox.savedLoadouts.map(loadout => 
                  loadout.id === id ? { ...loadout, ...updates } : loadout
                )
              }
            });
          },
          
          removeSavedLoadout: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              juiceBox: {
                ...currentProfile.juiceBox,
                savedLoadouts: currentProfile.juiceBox.savedLoadouts.filter(loadout => loadout.id !== id)
              }
            });
          },
          
          // Podium Pursuit actions
          addPodiumTarget: (target: PodiumPursuitData['activeTargets'][0]) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure target has an ID
            const targetWithId = target.id ? target : { ...target, id: uuidv4() };
            
            updateProfile({
              podiumPursuit: {
                ...currentProfile.podiumPursuit,
                activeTargets: [...currentProfile.podiumPursuit.activeTargets, targetWithId]
              }
            });
          },
          
          updatePodiumTarget: (id: string, updates: Partial<PodiumPursuitData['activeTargets'][0]>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              podiumPursuit: {
                ...currentProfile.podiumPursuit,
                activeTargets: currentProfile.podiumPursuit.activeTargets.map(target => 
                  target.id === id ? { ...target, ...updates } : target
                )
              }
            });
          },
          
          removePodiumTarget: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              podiumPursuit: {
                ...currentProfile.podiumPursuit,
                activeTargets: currentProfile.podiumPursuit.activeTargets.filter(target => target.id !== id)
              }
            });
          },
          
          completePodiumTarget: (id: string, completionData: Partial<PodiumPursuitData['acquiredTargets'][0]>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Find the target to complete
            const targetToComplete = currentProfile.podiumPursuit.activeTargets.find(target => target.id === id);
            if (!targetToComplete) return;
            
            // Create an acquired target from the active target
            const acquiredTarget = {
              id: targetToComplete.id,
              name: targetToComplete.name,
              type: targetToComplete.type,
              acquiredDate: new Date().toISOString(),
              description: targetToComplete.description,
              images: targetToComplete.images,
              notes: '',
              ...completionData
            };
            
            // Update Podium Pursuit data
            updateProfile({
              podiumPursuit: {
                ...currentProfile.podiumPursuit,
                activeTargets: currentProfile.podiumPursuit.activeTargets.filter(target => target.id !== id),
                acquiredTargets: [...currentProfile.podiumPursuit.acquiredTargets, acquiredTarget]
              }
            });
          },
          
          // Routes actions
          addSavedRoute: (route: RoutesData['savedRoutes'][0]) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure route has an ID
            const routeWithId = route.id ? route : { ...route, id: uuidv4() };
            
            updateProfile({
              routes: {
                ...currentProfile.routes,
                savedRoutes: [...currentProfile.routes.savedRoutes, routeWithId]
              }
            });
          },
          
          updateSavedRoute: (id: string, updates: Partial<RoutesData['savedRoutes'][0]>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              routes: {
                ...currentProfile.routes,
                savedRoutes: currentProfile.routes.savedRoutes.map(route => 
                  route.id === id ? { ...route, ...updates } : route
                )
              }
            });
          },
          
          removeSavedRoute: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              routes: {
                ...currentProfile.routes,
                savedRoutes: currentProfile.routes.savedRoutes.filter(route => route.id !== id)
              }
            });
          },
          
          addFavoriteRoad: (road: RoutesData['favoriteRoads'][0]) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure road has an ID
            const roadWithId = road.id ? road : { ...road, id: uuidv4() };
            
            updateProfile({
              routes: {
                ...currentProfile.routes,
                favoriteRoads: [...currentProfile.routes.favoriteRoads, roadWithId]
              }
            });
          },
          
          removeFavoriteRoad: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              routes: {
                ...currentProfile.routes,
                favoriteRoads: currentProfile.routes.favoriteRoads.filter(road => road.id !== id)
              }
            });
          },
          
          // Audio actions
          addPlaylist: (playlist: AudioPreferences['playlists'][0]) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure playlist has an ID
            const playlistWithId = playlist.id ? playlist : { ...playlist, id: uuidv4() };
            
            updateProfile({
              audio: {
                ...currentProfile.audio,
                playlists: [...currentProfile.audio.playlists, playlistWithId]
              }
            });
          },
          
          updatePlaylist: (id: string, updates: Partial<AudioPreferences['playlists'][0]>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              audio: {
                ...currentProfile.audio,
                playlists: currentProfile.audio.playlists.map(playlist => 
                  playlist.id === id ? { ...playlist, ...updates } : playlist
                )
              }
            });
          },
          
          removePlaylist: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              audio: {
                ...currentProfile.audio,
                playlists: currentProfile.audio.playlists.filter(playlist => playlist.id !== id)
              }
            });
          },
          
          updateSoundSettings: (settings: Partial<NonNullable<AudioPreferences['soundSettings']>>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              audio: {
                ...currentProfile.audio,
                soundSettings: {
                  ...currentProfile.audio.soundSettings,
                  ...settings
                }
              }
            });
          },
          
          // Maintenance actions
          addMaintenanceRecord: (record: MaintenanceHistory['records'][0]) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            // Ensure record has an ID
            const recordWithId = record.id ? record : { ...record, id: uuidv4() };
            
            updateProfile({
              maintenance: {
                ...currentProfile.maintenance,
                records: [...currentProfile.maintenance.records, recordWithId]
              }
            });
          },
          
          updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceHistory['records'][0]>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              maintenance: {
                ...currentProfile.maintenance,
                records: currentProfile.maintenance.records.map(record => 
                  record.id === id ? { ...record, ...updates } : record
                )
              }
            });
          },
          
          removeMaintenanceRecord: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              maintenance: {
                ...currentProfile.maintenance,
                records: currentProfile.maintenance.records.filter(record => record.id !== id)
              }
            });
          },
          
          addScheduledMaintenance: (maintenance: NonNullable<MaintenanceHistory['scheduledMaintenance']>[0]) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            const scheduledMaintenance = currentProfile.maintenance.scheduledMaintenance || [];
            
            // Ensure maintenance has an ID
            const maintenanceWithId = maintenance.id ? maintenance : { ...maintenance, id: uuidv4() };
            
            updateProfile({
              maintenance: {
                ...currentProfile.maintenance,
                scheduledMaintenance: [...scheduledMaintenance, maintenanceWithId]
              }
            });
          },
          
          updateScheduledMaintenance: (id: string, updates: Partial<NonNullable<MaintenanceHistory['scheduledMaintenance']>[0]>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            const scheduledMaintenance = currentProfile.maintenance.scheduledMaintenance || [];
            
            updateProfile({
              maintenance: {
                ...currentProfile.maintenance,
                scheduledMaintenance: scheduledMaintenance.map(maintenance => 
                  maintenance.id === id ? { ...maintenance, ...updates } : maintenance
                )
              }
            });
          },
          
          removeScheduledMaintenance: (id: string) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            const scheduledMaintenance = currentProfile.maintenance.scheduledMaintenance || [];
            
            updateProfile({
              maintenance: {
                ...currentProfile.maintenance,
                scheduledMaintenance: scheduledMaintenance.filter(maintenance => maintenance.id !== id)
              }
            });
          },
          
          completeScheduledMaintenance: (id: string, completionData: Partial<MaintenanceHistory['records'][0]>) => {
            const { updateProfile, addMaintenanceRecord } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            const scheduledMaintenance = currentProfile.maintenance.scheduledMaintenance || [];
            
            // Find the scheduled maintenance to complete
            const maintenanceToComplete = scheduledMaintenance.find(maintenance => maintenance.id === id);
            if (!maintenanceToComplete) return;
            
            // Create a maintenance record from the scheduled maintenance
            const maintenanceRecord = {
              id: uuidv4(),
              vehicleId: maintenanceToComplete.vehicleId,
              type: maintenanceToComplete.type,
              date: new Date().toISOString(),
              mileage: completionData.mileage || 0,
              service: maintenanceToComplete.description,
              notes: `Completed scheduled maintenance: ${maintenanceToComplete.description}`,
              ...completionData
            };
            
            // Add the maintenance record
            addMaintenanceRecord(maintenanceRecord);
            
            // Remove from scheduled maintenance if it's not repeating
            if (!maintenanceToComplete.repeat) {
              updateProfile({
                maintenance: {
                  ...currentProfile.maintenance,
                  scheduledMaintenance: scheduledMaintenance.filter(maintenance => maintenance.id !== id)
                }
              });
            } else {
              // Update the next due date/mileage if it's repeating
              const now = new Date();
              const interval = maintenanceToComplete.interval || {};
              
              let newDueDate: string | undefined;
              if (interval.time && maintenanceToComplete.dueDate) {
                const dueDate = new Date(maintenanceToComplete.dueDate);
                dueDate.setMonth(dueDate.getMonth() + interval.time);
                newDueDate = dueDate.toISOString();
              }
              
              let newDueMileage: number | undefined;
              if (interval.distance && maintenanceToComplete.dueMileage) {
                newDueMileage = maintenanceToComplete.dueMileage + interval.distance;
              }
              
              updateProfile({
                maintenance: {
                  ...currentProfile.maintenance,
                  scheduledMaintenance: scheduledMaintenance.map(maintenance => 
                    maintenance.id === id ? { 
                      ...maintenance, 
                      dueDate: newDueDate || maintenance.dueDate,
                      dueMileage: newDueMileage || maintenance.dueMileage
                    } : maintenance
                  )
                }
              });
            }
          },
          
          // Agreements
          updateAgreements: (updates: Partial<UserAgreements>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              agreements: {
                ...currentProfile.agreements,
                ...updates
              }
            });
          },
          
          // Security settings
          updateSecuritySettings: (updates: Partial<SecuritySettings>) => {
            const { updateProfile } = get();
            const currentProfile = get().profile;
            if (!currentProfile) return;
            
            updateProfile({
              security: {
                ...currentProfile.security,
                ...updates
              }
            });
          }
        }),
        {
          name: 'user-profile-warehouse',
          storage: createJSONStorage(() => safeStorage),
          partialize: (state) => ({ profile: state.profile })
        }
      )
    );
  }
  
  /**
   * Initializes the UserProfileWarehouse
   * - Loads user profile from storage
   * - Automatically migrates from legacy formats
   * - Creates empty profile if none exists
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('Initializing UserProfileWarehouse');
      
      // Get the profile from storage
      const profile = this.store.getState().profile;
      
      if (profile) {
        // Profile exists in storage
        console.log('Found existing user profile in storage');
        
        // Validate the stored profile
        try {
          validateUserProfileData(profile);
          console.log('Stored profile is valid');
        } catch (error) {
          console.error('Stored profile validation error:', error);
          
          // If we found errors, attempt migration from legacy data
          const migratedProfile = await this.migrateFromLegacyData();
          if (migratedProfile) {
            this.store.getState().setProfile(migratedProfile);
          }
        }
      } else {
        // No profile in storage, attempt migration from legacy data
        console.log('No user profile in storage, attempting migration from legacy data');
        const migratedProfile = await this.migrateFromLegacyData();
        
        if (migratedProfile) {
          this.store.getState().setProfile(migratedProfile);
        } else {
          // If no legacy data, create a default empty profile
          console.log('Creating new empty user profile');
          const defaultProfile = this.createDefaultProfile();
          this.store.getState().setProfile(defaultProfile);
        }
      }
      
      // Set initialization flag
      this.initialized = true;
      console.log('UserProfileWarehouse initialized successfully');
      
      // Broadcast initial state to any listeners
      if (this.store.getState().profile) {
        this.notifyListeners(this.store.getState().profile);
      }
      
    } catch (error) {
      console.error('Error initializing UserProfileWarehouse:', error);
      throw new Error(`Failed to initialize UserProfileWarehouse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Creates a default user profile structure with minimal data
   */
  private createDefaultProfile(): UserProfileData {
    const displayName = getUserDisplayName() || 'Car Enthusiast';
    const username = displayName.replace(/\s+/g, '') || 'MemberDriver';
    
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
  
  /**
   * Migrate from legacy data formats to the new UserProfileData structure
   * This scans through various localStorage items and merges data into a single profile
   */
  private async migrateFromLegacyData(): Promise<UserProfileData | null> {
    try {
      console.log('Starting migration from legacy data formats');
      
      // Create empty profile as a base
      const profile = this.createDefaultProfile();
      
      // Check for existing user profile data in different storage formats
      const sources = [
        'userProfile',
        'userOnboardingData',
        'user-profile-storage',
        'dashboardPreferences',
        'locationSettings',
        'userAgreements',
        'user-data'
      ];
      
      let foundData = false;
      
      // Attempt to load from each source
      for (const source of sources) {
        try {
          const data = localStorage.getItem(source);
          if (data) {
            foundData = true;
            const parsedData = JSON.parse(data);
            
            // Process data based on source
            this.mergeDataIntoProfile(profile, parsedData, source);
          }
        } catch (error) {
          console.warn(`Error migrating data from ${source}:`, error);
        }
      }
      
      // Return null if no data was found to migrate
      if (!foundData) {
        console.log('No legacy data found to migrate');
        return null;
      }
      
      // Update metadata for the migration
      profile._metadata = {
        ...profile._metadata,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Log successful migration
      console.log('Migration from legacy data completed successfully');
      
      return profile;
    } catch (error) {
      console.error('Error migrating from legacy data:', error);
      return null;
    }
  }
  
  /**
   * Merges data from a legacy source into the profile structure
   */
  private mergeDataIntoProfile(profile: UserProfileData, data: any, source: string): void {
    if (!data) return;
    
    // Each source has a different structure, handle accordingly
    switch (source) {
      case 'userProfile':
        // Handle user profile data
        if (data.username) profile.identity.username = data.username;
        if (data.displayName) profile.identity.displayName = data.displayName;
        if (data.email) profile.identity.email = data.email;
        if (data.avatar) profile.identity.avatar = data.avatar;
        if (data.bio) profile.identity.bio = data.bio;
        if (data.location) profile.identity.location = data.location;
        if (data.memberSince) profile.identity.memberSince = data.memberSince;
        if (data.membershipLevel) profile.identity.membershipLevel = data.membershipLevel;
        if (data.phoneNumber) profile.identity.phoneNumber = data.phoneNumber;
        break;
        
      case 'userOnboardingData':
        // Handle onboarding data
        if (data.onboardingCompleted) profile.identity.onboardingCompleted = data.onboardingCompleted;
        if (data.memberSince) profile.identity.memberSince = data.memberSince;
        
        // Merge preferences if available
        if (data.preferences) {
          profile.preferences = {
            ...profile.preferences,
            ...data.preferences
          };
        }
        
        // Merge weatherPreferences if available
        if (data.weatherPreferences) {
          profile.preferences.weatherPreferences = {
            ...profile.preferences.weatherPreferences,
            ...data.weatherPreferences
          };
        }
        
        // Merge statistics if available
        if (data.statistics) {
          profile.statistics = {
            ...profile.statistics,
            ...data.statistics
          };
        }
        
        // Add vehicles if available
        if (data.vehicles && Array.isArray(data.vehicles)) {
          profile.vehicles = [...profile.vehicles, ...data.vehicles.map((vehicle: any) => ({
            id: vehicle.id || uuidv4(),
            make: vehicle.make || '',
            model: vehicle.model || '',
            year: typeof vehicle.year === 'number' ? vehicle.year : parseInt(vehicle.year) || 0,
            nickname: vehicle.nickname,
            vin: vehicle.vin,
            status: vehicle.status || 'active'
          }))];
        }
        
        // Add drives if available
        if (data.drives && Array.isArray(data.drives)) {
          profile.drives = [...profile.drives, ...data.drives];
        }
        
        // Add goals if available
        if (data.goals && Array.isArray(data.goals)) {
          profile.goals = [...profile.goals, ...data.goals];
        }
        
        // Add events if available
        if (data.events && Array.isArray(data.events)) {
          profile.events = [...profile.events, ...data.events];
        }
        
        // Add gallery if available
        if (data.gallery && Array.isArray(data.gallery)) {
          profile.gallery = [...profile.gallery, ...data.gallery];
        }
        break;
        
      case 'user-profile-storage':
        // Handle Zustand persisted storage format
        if (data.state && data.state.profile) {
          const storedProfile = data.state.profile;
          
          // Identity
          if (storedProfile.id) profile.identity.id = storedProfile.id;
          if (storedProfile.username) profile.identity.username = storedProfile.username;
          if (storedProfile.displayName) profile.identity.displayName = storedProfile.displayName;
          if (storedProfile.email) profile.identity.email = storedProfile.email;
          if (storedProfile.avatar) profile.identity.avatar = storedProfile.avatar;
          if (storedProfile.bio) profile.identity.bio = storedProfile.bio;
          if (storedProfile.location) profile.identity.location = storedProfile.location;
          if (storedProfile.memberSince) profile.identity.memberSince = storedProfile.memberSince;
          if (storedProfile.membershipLevel) profile.identity.membershipLevel = storedProfile.membershipLevel;
          if (storedProfile.lastActive) profile.identity.lastActive = storedProfile.lastActive;
          
          // Statistics
          if (storedProfile.statistics) {
            profile.statistics = {
              ...profile.statistics,
              ...storedProfile.statistics
            };
          }
          
          // Preferences
          if (storedProfile.preferences) {
            profile.preferences = {
              ...profile.preferences,
              ...storedProfile.preferences
            };
          }
          
          // Weather preferences
          if (storedProfile.weatherPreferences) {
            profile.preferences.weatherPreferences = {
              ...profile.preferences.weatherPreferences,
              ...storedProfile.weatherPreferences
            };
          }
          
          // Collections
          if (storedProfile.vehicles && Array.isArray(storedProfile.vehicles)) {
            profile.vehicles = [...profile.vehicles, ...storedProfile.vehicles.map((vehicle: any) => ({
              id: vehicle.id || uuidv4(),
              make: vehicle.make || '',
              model: vehicle.model || '',
              year: typeof vehicle.year === 'number' ? vehicle.year : parseInt(vehicle.year) || 0,
              nickname: vehicle.nickname,
              vin: vehicle.vin,
              status: vehicle.status || 'active'
            }))];
          }
          
          if (storedProfile.drives && Array.isArray(storedProfile.drives)) {
            profile.drives = [...profile.drives, ...storedProfile.drives];
          }
          
          if (storedProfile.goals && Array.isArray(storedProfile.goals)) {
            profile.goals = [...profile.goals, ...storedProfile.goals];
          }
          
          if (storedProfile.events && Array.isArray(storedProfile.events)) {
            profile.events = [...profile.events, ...storedProfile.events];
          }
          
          if (storedProfile.gallery && Array.isArray(storedProfile.gallery)) {
            profile.gallery = [...profile.gallery, ...storedProfile.gallery];
          }
        }
        break;
        
      case 'dashboardPreferences':
        // Handle dashboard preferences
        if (typeof data === 'object') {
          // Preferences
          if (data.theme) profile.preferences.theme = data.theme;
          if (data.soundEnabled !== undefined) profile.preferences.soundEnabled = data.soundEnabled;
          if (data.timeFormat) profile.preferences.timeFormat = data.timeFormat;
          if (data.dateFormat) profile.preferences.dateFormat = data.dateFormat;
          
          // Notification settings
          if (data.notifications !== undefined) {
            profile.preferences.notifications = data.notifications;
          }
          
          // Dashboard layout
          if (data.layout) {
            profile.preferences.dashboardLayout = data.layout;
          }
        }
        break;
        
      case 'locationSettings':
        // Handle location settings
        if (typeof data === 'object') {
          // Default location
          if (data.defaultLocation) {
            profile.preferences.weatherPreferences.defaultLocation = data.defaultLocation;
          }
          
          // Units
          if (data.units) {
            profile.preferences.weatherPreferences.units = data.units;
            // Also set the main units preference
            profile.preferences.units = data.units === 'imperial' ? 'imperial' : 'metric';
          }
          
          // Saved locations
          if (data.savedLocations && Array.isArray(data.savedLocations)) {
            profile.preferences.weatherPreferences.savedLocations = data.savedLocations;
          }
        }
        break;
        
      case 'userAgreements':
        // Handle user agreements
        if (typeof data === 'object') {
          if (data.accepted) profile.agreements.termsAccepted = data.accepted;
          if (data.timestamp) {
            profile.agreements.termsAcceptedDate = data.timestamp;
            profile.agreements.privacyAcceptedDate = data.timestamp;
          }
          if (data.version) {
            profile.agreements.termsVersion = data.version;
            profile.agreements.privacyVersion = data.version;
          }
          if (data.privacyAccepted) profile.agreements.privacyAccepted = data.privacyAccepted;
          if (data.marketingOptIn !== undefined) profile.agreements.marketingOptIn = data.marketingOptIn;
        }
        break;
        
      case 'user-data':
        // Handle user data service format
        if (data.user) {
          // Identity
          if (data.user.id) profile.identity.id = data.user.id;
          if (data.user.username) profile.identity.username = data.user.username;
          if (data.user.displayName) profile.identity.displayName = data.user.displayName;
          if (data.user.email) profile.identity.email = data.user.email;
          if (data.user.avatarUrl) profile.identity.avatar = data.user.avatarUrl;
          if (data.user.bio) profile.identity.bio = data.user.bio;
          if (data.user.city && data.user.state) {
            profile.identity.location = `${data.user.city}, ${data.user.state}`;
          }
          if (data.user.memberSince) profile.identity.memberSince = data.user.memberSince;
          if (data.user.membershipLevel) profile.identity.membershipLevel = data.user.membershipLevel;
          if (data.user.phoneNumber) profile.identity.phoneNumber = data.user.phoneNumber;
          
          // Social links
          if (data.user.socialLinks) {
            profile.identity.socialLinks = data.user.socialLinks;
          }
          
          // Preferences
          if (data.user.preferences) {
            if (data.user.preferences.darkMode !== undefined) {
              profile.preferences.theme = data.user.preferences.darkMode ? 'dark' : 'light';
            }
            if (data.user.preferences.notifications !== undefined) {
              profile.preferences.notifications = data.user.preferences.notifications;
            }
            if (data.user.preferences.units) {
              profile.preferences.units = data.user.preferences.units;
              profile.preferences.weatherPreferences.units = data.user.preferences.units;
            }
          }
          
          // Security
          if (data.user.mfaEnabled !== undefined) {
            profile.security.mfaEnabled = data.user.mfaEnabled;
          }
        }
        
        // Handle collections
        if (data.vehicles && Array.isArray(data.vehicles)) {
          profile.vehicles = [...profile.vehicles, ...data.vehicles.map((vehicle: any) => ({
            id: vehicle.id || uuidv4(),
            make: vehicle.make || '',
            model: vehicle.model || '',
            year: typeof vehicle.year === 'number' ? vehicle.year : parseInt(vehicle.year) || 0,
            nickname: vehicle.nickname,
            vin: vehicle.vin,
            status: vehicle.status || 'active',
            primaryImage: vehicle.primaryImage
          }))];
        }
        
        if (data.drives && Array.isArray(data.drives)) {
          profile.drives = [...profile.drives, ...data.drives];
          
          // Update statistics
          if (profile.drives.length > 0) {
            let totalMiles = 0;
            for (const drive of profile.drives) {
              totalMiles += drive.distance || 0;
            }
            
            profile.statistics.totalDrives = profile.drives.length;
            profile.statistics.totalMiles = totalMiles;
          }
        }
        
        if (data.goals && Array.isArray(data.goals)) {
          profile.goals = [...profile.goals, ...data.goals];
          
          // Update statistics
          if (profile.goals.length > 0) {
            const completedGoals = profile.goals.filter(goal => goal.status === 'completed').length;
            profile.statistics.goalsCompleted = completedGoals;
          }
        }
        
        if (data.routes && Array.isArray(data.routes)) {
          const savedRoutes = data.routes.map((route: any) => ({
            id: route.id || uuidv4(),
            name: route.name || 'Unnamed Route',
            description: route.description,
            distance: route.distance,
            estimatedTime: route.estimatedTime,
            startPoint: route.startPoint || { lat: 0, lon: 0 },
            endPoint: route.endPoint || { lat: 0, lon: 0 },
            waypoints: route.waypoints,
            type: route.type,
            tags: route.tags,
            rating: route.rating,
            createdAt: route.createdAt || new Date().toISOString(),
            lastDriven: route.lastDriven
          }));
          
          profile.routes.savedRoutes = [...profile.routes.savedRoutes, ...savedRoutes];
        }
        
        if (data.favoriteRoads && Array.isArray(data.favoriteRoads)) {
          const favoriteRoads = data.favoriteRoads.map((road: any) => ({
            id: road.id || uuidv4(),
            name: road.name || 'Unnamed Road',
            location: road.location,
            rating: road.rating || 5,
            tags: road.tags,
            notes: road.notes
          }));
          
          profile.routes.favoriteRoads = [...profile.routes.favoriteRoads, ...favoriteRoads];
          
          // Update statistics
          if (favoriteRoads.length > 0) {
            profile.statistics.favoriteRoads = favoriteRoads.map(road => road.name);
          }
        }
        break;
    }
  }
  
  /**
   * Adds a listener for profile changes
   * @param listener Function to call when profile changes
   * @returns Unsubscribe function
   */
  onProfileChange(listener: (profile: UserProfileData) => void): () => void {
    this.changeListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.changeListeners = this.changeListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notifies all listeners of profile changes
   */
  private notifyListeners(profile: UserProfileData | null): void {
    if (!profile) return;
    
    for (const listener of this.changeListeners) {
      try {
        listener(profile);
      } catch (error) {
        console.error('Error in profile change listener:', error);
      }
    }
  }
  
  /**
   * Gets the current user profile
   */
  getProfile(): UserProfileData | null {
    return this.store.getState().profile;
  }
  
  /**
   * Updates the identity section of the profile
   */
  updateIdentity(updates: Partial<UserIdentity>): void {
    this.store.getState().updateIdentity(updates);
  }
  
  /**
   * Updates user preferences
   */
  updatePreferences(updates: Partial<UserPreferences>): void {
    this.store.getState().updatePreferences(updates);
  }
  
  /**
   * Updates weather preferences
   */
  updateWeatherPreferences(updates: Partial<UserPreferences['weatherPreferences']>): void {
    this.store.getState().updateWeatherPreferences(updates);
  }
  
  /**
   * Adds a vehicle reference
   */
  addVehicleReference(vehicle: VehicleReference): void {
    this.store.getState().addVehicleReference(vehicle);
  }
  
  /**
   * Resets the user profile
   * USE WITH CAUTION - this will clear all profile data
   */
  resetProfile(): void {
    this.store.getState().resetProfile();
  }
}

// Create singleton instance
const userProfileWarehouse = new UserProfileWarehouseService();

// Export the warehouse instance
export default userProfileWarehouse;

// Also export a hook for easy access in React components
export function useUserProfileWarehouse() {
  return userProfileWarehouse;
}

// Export a synchronous function to access current data without hooks
export function getUserProfile(): UserProfileData | null {
  return userProfileWarehouse.getProfile();
}