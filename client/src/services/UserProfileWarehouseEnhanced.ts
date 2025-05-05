/**
 * UserProfileWarehouseEnhanced.ts
 * 
 * Enhanced version of the UserProfileWarehouse with improved security,
 * persistence, and data protection features.
 * 
 * Added features:
 * - Rate-limited storage operations
 * - Automatic data backups
 * - Data recovery from corrupted storage
 * - Storage quota management
 * - Input sanitization for all data
 * - Enhanced error logging
 */

import userProfileWarehouse, { UserProfileData } from './UserProfileWarehouse';
import { secureWrite, secureRead, secureDelete, backupData, recoverData } from '../utils/secureStorage';
import { sanitizeObject, sanitizeText, sanitizeDate } from '../utils/dataSanitizer';
import { validateUserProfileData } from '../utils/dataValidation';

// Backup configuration
const STORAGE_KEY = 'user-profile-warehouse';
const BACKUP_STORAGE_KEY = 'user-profile-warehouse-backup';
const AUTO_BACKUP_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// Here's a simplified interface representing the methods we need from userProfileWarehouse
interface UserProfileWarehouseInterface {
  getProfile(): UserProfileData | null;
  updateProfile(updates: Partial<UserProfileData>): void;
  initialize(): Promise<void>;
  updateIdentity(updates: Partial<UserProfileData['identity']>): void;
  updatePreferences(updates: Partial<UserProfileData['preferences']>): void;
  resetProfile(): void;
}

/**
 * Enhanced UserProfileWarehouse with secure storage and data protection
 */
export class SecureUserProfileWarehouse implements UserProfileWarehouseInterface {
  private baseWarehouse: typeof userProfileWarehouse;
  private lastBackupTime: number = 0;
  private backupIntervalId: number | null = null;
  private errorCount: number = 0;
  private readonly MAX_ERRORS = 5;
  private changeListeners: ((profile: UserProfileData) => void)[] = [];
  
  constructor(baseWarehouse = userProfileWarehouse) {
    this.baseWarehouse = baseWarehouse;
    this.setupBackupSchedule();
  }
  
  /**
   * Set up scheduled auto-backups
   */
  private setupBackupSchedule(): void {
    // Clear any existing backup schedule
    if (this.backupIntervalId !== null) {
      window.clearInterval(this.backupIntervalId);
    }
    
    // Set up a new backup schedule
    this.backupIntervalId = window.setInterval(() => {
      this.backupProfile();
    }, AUTO_BACKUP_INTERVAL_MS);
    
    // Also backup on page unload
    window.addEventListener('beforeunload', () => {
      this.backupProfile();
    });
  }
  
  /**
   * Create a backup of the current profile
   */
  public backupProfile(): void {
    try {
      const profile = this.baseWarehouse.getProfile();
      if (!profile) return;
      
      const now = Date.now();
      if (now - this.lastBackupTime < 60000) {
        // Don't backup more than once per minute
        return;
      }
      
      // Create backup with timestamp
      const backupProfile = {
        ...profile,
        _metadata: {
          ...profile._metadata,
          backupTime: new Date().toISOString()
        }
      };
      
      // Store backup
      const success = backupData<UserProfileData>(STORAGE_KEY, BACKUP_STORAGE_KEY);
      
      if (success) {
        this.lastBackupTime = now;
        console.log('UserProfile backup created successfully');
      }
    } catch (e) {
      console.error('Error creating profile backup:', e);
    }
  }
  
  /**
   * Create a default empty profile
   */
  public createDefaultProfile(): UserProfileData {
    // Create a minimal valid profile structure
    return {
      identity: {
        id: 'default-' + Date.now(),
        username: 'default',
        displayName: 'Default User',
        memberSince: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        membershipLevel: 'free',
        onboardingCompleted: false
      },
      preferences: {
        theme: 'dark',
        timeFormat: '12h',
        dateFormat: 'mdy', 
        units: 'imperial',
        soundEnabled: true,
        notifications: true,
        weatherPreferences: {
          defaultLocation: {
            lat: 33.996,
            lon: -84.292,
            name: 'Default Location'
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
        eventsAttended: 0
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
          navigationVolume: 70,
          musicVolume: 80,
          notificationSounds: true
        }
      },
      maintenance: {
        records: [],
        scheduledMaintenance: []
      },
      security: {
        verified: false,
        verificationAttempts: 0,
        lastVerificationAttempt: new Date().toISOString()
      },
      _metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    };
  }

  /**
   * Attempt to recover profile from backup if main storage is corrupted
   */
  public async recoverFromBackup(): Promise<boolean> {
    try {
      // Create a default empty profile
      const defaultProfile = this.createDefaultProfile();
      
      // Try to recover from backup
      const recoveredProfile = recoverData<UserProfileData>(
        STORAGE_KEY,
        BACKUP_STORAGE_KEY,
        defaultProfile
      );
      
      // Check if recovered profile is not the default
      if (recoveredProfile !== defaultProfile) {
        // Validate recovered profile
        try {
          validateUserProfileData(recoveredProfile);
          
          // Set the recovered profile
          this.baseWarehouse.setProfile(recoveredProfile);
          console.log('Successfully recovered profile from backup');
          return true;
        } catch (e) {
          console.error('Recovered profile failed validation:', e);
        }
      }
      
      return false;
    } catch (e) {
      console.error('Error recovering profile from backup:', e);
      return false;
    }
  }
  
  /**
   * Sanitize profile data before storage
   */
  public sanitizeProfileData(profile: UserProfileData): UserProfileData {
    try {
      // Deep clone to avoid modifying the original
      const sanitizedProfile = JSON.parse(JSON.stringify(profile)) as UserProfileData;
      
      // Sanitize identity fields
      if (sanitizedProfile.identity) {
        sanitizedProfile.identity.displayName = sanitizeText(sanitizedProfile.identity.displayName);
        sanitizedProfile.identity.username = sanitizeText(sanitizedProfile.identity.username);
        sanitizedProfile.identity.bio = sanitizeText(sanitizedProfile.identity.bio);
        sanitizedProfile.identity.location = sanitizeText(sanitizedProfile.identity.location);
        sanitizedProfile.identity.memberSince = sanitizeDate(sanitizedProfile.identity.memberSince);
        sanitizedProfile.identity.lastActive = sanitizeDate(sanitizedProfile.identity.lastActive);
        
        // Handle nested social links if they exist
        if (sanitizedProfile.identity.socialLinks) {
          sanitizedProfile.identity.socialLinks = sanitizeObject(sanitizedProfile.identity.socialLinks);
        }
      }
      
      // Always update metadata
      sanitizedProfile._metadata = {
        ...sanitizedProfile._metadata,
        lastUpdated: new Date().toISOString()
      };
      
      return sanitizedProfile;
    } catch (e) {
      console.error('Error sanitizing profile data:', e);
      return profile; // Return original if sanitization fails
    }
  }
  
  /**
   * Get the user profile with error tracking
   */
  public getProfile(): UserProfileData | null {
    try {
      const profile = this.baseWarehouse.getProfile();
      this.errorCount = 0; // Reset error count on successful retrieval
      return profile;
    } catch (e) {
      this.errorCount++;
      console.error(`Error getting profile (attempt ${this.errorCount}/${this.MAX_ERRORS}):`, e);
      
      // If we've had too many errors, try to recover
      if (this.errorCount >= this.MAX_ERRORS) {
        this.recoverFromBackup();
        this.errorCount = 0;
      }
      
      return null;
    }
  }
  
  /**
   * Set the user profile with sanitization and backup
   */
  public async setProfile(profile: UserProfileData): Promise<void> {
    try {
      // Sanitize the profile before setting
      const sanitizedProfile = this.sanitizeProfileData(profile);
      
      // Use safeWrite to directly update the stored profile
      const success = secureWrite(STORAGE_KEY, sanitizedProfile);
      
      if (!success) {
        throw new Error('Failed to write profile to storage');
      }
      
      // Create a backup after successful update
      this.backupProfile();
      
      // Notify listeners
      this.notifyListeners(sanitizedProfile);
      
      this.errorCount = 0; // Reset error count on successful save
    } catch (e) {
      this.errorCount++;
      console.error(`Error setting profile (attempt ${this.errorCount}/${this.MAX_ERRORS}):`, e);
      
      // If we've had too many errors, try to recover
      if (this.errorCount >= this.MAX_ERRORS) {
        await this.recoverFromBackup();
        this.errorCount = 0;
      }
      
      throw e; // Re-throw the error after recovery attempt
    }
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
   * Update specific profile fields with sanitization
   */
  public async updateProfile(updates: Partial<UserProfileData>): Promise<void> {
    try {
      // Get the current profile
      const currentProfile = this.getProfile();
      if (!currentProfile) {
        throw new Error('Cannot update profile - no profile found');
      }
      
      // Sanitize the updates
      const sanitizedUpdates = sanitizeObject(updates);
      
      // Apply the updates and sanitize the result
      const updatedProfile = this.sanitizeProfileData({
        ...currentProfile,
        ...sanitizedUpdates,
        _metadata: {
          ...currentProfile._metadata,
          lastUpdated: new Date().toISOString()
        }
      });
      
      // Set the updated profile using direct secureWrite
      const success = secureWrite(STORAGE_KEY, updatedProfile);
      
      if (!success) {
        throw new Error('Failed to write updated profile to storage');
      }
      
      // Create a backup after significant changes
      this.backupProfile();
      
      // Notify listeners of the change
      this.notifyListeners(updatedProfile);
      
      this.errorCount = 0; // Reset error count on successful update
    } catch (e) {
      this.errorCount++;
      console.error(`Error updating profile (attempt ${this.errorCount}/${this.MAX_ERRORS}):`, e);
      
      // If we've had too many errors, try to recover
      if (this.errorCount >= this.MAX_ERRORS) {
        await this.recoverFromBackup();
        this.errorCount = 0;
      }
      
      throw e; // Re-throw the error after recovery attempt
    }
  }
  
  /**
   * Subscribe to profile changes
   */
  public subscribeToChanges(listener: (profile: UserProfileData) => void): () => void {
    this.changeListeners.push(listener);
    
    // Initial call with current profile
    const currentProfile = this.getProfile();
    if (currentProfile) {
      try {
        listener(currentProfile);
      } catch (e) {
        console.error('Error in profile change listener (initial call):', e);
      }
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index !== -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Initialize the warehouse safely
   */
  public async initialize(): Promise<void> {
    try {
      // First let the base warehouse initialize
      await this.baseWarehouse.initialize();
      
      // Check if we have a profile
      const profile = this.getProfile();
      
      if (!profile) {
        // If no profile exists, create a default one
        console.log('No profile found, creating default profile');
        const defaultProfile = this.createDefaultProfile();
        await this.setProfile(defaultProfile);
      } else {
        // If we do have a profile, create a backup
        this.backupProfile();
      }
      
      console.log('Secure UserProfileWarehouse initialized successfully');
    } catch (e) {
      console.error('Error initializing secure profile warehouse:', e);
      
      // Try to recover from backup if initialization fails
      const recovered = await this.recoverFromBackup();
      
      if (!recovered) {
        console.error('Could not recover profile from backup, creating default profile');
        // Initialize with default profile
        const defaultProfile = this.createDefaultProfile();
        const success = secureWrite(STORAGE_KEY, defaultProfile);
        
        if (!success) {
          throw new Error('Failed to create default profile');
        }
      }
    }
  }
  
  /**
   * Delete the profile with confirmation
   */
  public async deleteProfile(): Promise<boolean> {
    try {
      // Remove from both main storage and backup
      const mainDeleted = secureDelete(STORAGE_KEY);
      const backupDeleted = secureDelete(BACKUP_STORAGE_KEY);
      
      return mainDeleted && backupDeleted;
    } catch (e) {
      console.error('Error deleting profile:', e);
      return false;
    }
  }
  
  /**
   * Check storage health and size limits
   */
  public checkStorageHealth(): { healthy: boolean, size: number, quota: number } {
    try {
      // Get profile size
      const profile = this.baseWarehouse.getProfile();
      const profileStr = profile ? JSON.stringify(profile) : '';
      const size = profileStr.length * 2; // Approximate UTF-16 size
      
      // Estimate available space 
      const quota = 5 * 1024 * 1024; // 5MB limit for localStorage
      const healthy = size < (quota * 0.9); // 90% of quota
      
      if (!healthy) {
        console.warn(`Storage health warning: profile size (${size} bytes) approaching quota (${quota} bytes)`);
      }
      
      return { healthy, size, quota };
    } catch (e) {
      console.error('Error checking storage health:', e);
      return { healthy: false, size: 0, quota: 0 };
    }
  }
  
  /**
   * Execute safe operation with error handling and recovery
   */
  public async safeExecute<T>(operation: () => Promise<T>, defaultValue: T): Promise<T> {
    try {
      return await operation();
    } catch (e) {
      this.errorCount++;
      console.error(`Error in operation (attempt ${this.errorCount}/${this.MAX_ERRORS}):`, e);
      
      // If we've had too many errors, try to recover
      if (this.errorCount >= this.MAX_ERRORS) {
        await this.recoverFromBackup();
        this.errorCount = 0;
      }
      
      return defaultValue;
    }
  }
  
  /**
   * Update identity section of the profile with sanitization
   */
  public updateIdentity(updates: Partial<UserProfileData['identity']>): void {
    try {
      // Get the current profile
      const currentProfile = this.getProfile();
      if (!currentProfile) {
        throw new Error('Cannot update identity - no profile found');
      }

      // Sanitize the updates
      const sanitizedIdentity = { ...currentProfile.identity };
      
      if (updates.displayName) sanitizedIdentity.displayName = sanitizeText(updates.displayName);
      if (updates.username) sanitizedIdentity.username = sanitizeText(updates.username);
      if (updates.bio) sanitizedIdentity.bio = sanitizeText(updates.bio);
      if (updates.location) sanitizedIdentity.location = sanitizeText(updates.location);
      if (updates.memberSince) sanitizedIdentity.memberSince = sanitizeDate(updates.memberSince);
      if (updates.lastActive) sanitizedIdentity.lastActive = sanitizeDate(updates.lastActive);
      if (updates.avatar) sanitizedIdentity.avatar = sanitizeText(updates.avatar);
      if (updates.socialLinks) sanitizedIdentity.socialLinks = sanitizeObject(updates.socialLinks);
      
      // Update lastActive to now if not explicitly provided
      if (!updates.lastActive) {
        sanitizedIdentity.lastActive = new Date().toISOString();
      }

      // Create and update the profile
      const updatedProfile = {
        ...currentProfile,
        identity: sanitizedIdentity,
        _metadata: {
          ...currentProfile._metadata,
          lastUpdated: new Date().toISOString()
        }
      };

      // Write directly to storage
      const success = secureWrite(STORAGE_KEY, updatedProfile);
      
      if (!success) {
        throw new Error('Failed to write updated identity to storage');
      }
      
      // Create a backup
      this.backupProfile();
      
      // Notify listeners of the change
      this.notifyListeners(updatedProfile);
      
    } catch (e) {
      console.error('Error updating identity:', e);
      throw e;
    }
  }
  
  /**
   * Update preferences section of the profile
   */
  public updatePreferences(updates: Partial<UserProfileData['preferences']>): void {
    try {
      // Get the current profile
      const currentProfile = this.getProfile();
      if (!currentProfile) {
        throw new Error('Cannot update preferences - no profile found');
      }
      
      // Apply and sanitize updates
      const sanitizedPreferences = {
        ...currentProfile.preferences,
        ...sanitizeObject(updates)
      };
      
      // Create the updated profile
      const updatedProfile = {
        ...currentProfile,
        preferences: sanitizedPreferences,
        _metadata: {
          ...currentProfile._metadata,
          lastUpdated: new Date().toISOString()
        }
      };
      
      // Write directly to storage
      const success = secureWrite(STORAGE_KEY, updatedProfile);
      
      if (!success) {
        throw new Error('Failed to write updated preferences to storage');
      }
      
      // Create a backup
      this.backupProfile();
      
      // Notify listeners of the change
      this.notifyListeners(updatedProfile);
      
    } catch (e) {
      console.error('Error updating preferences:', e);
      throw e;
    }
  }
  
  /**
   * Reset the profile to default state
   */
  public resetProfile(): void {
    try {
      // Create a default profile
      const defaultProfile = this.createDefaultProfile();
      
      // Write directly to storage
      const success = secureWrite(STORAGE_KEY, defaultProfile);
      
      if (!success) {
        throw new Error('Failed to reset profile in storage');
      }
      
      // Create a backup
      this.backupProfile();
      
      // Notify listeners of the change
      this.notifyListeners(defaultProfile);
      
      console.log('Profile has been reset to default state');
    } catch (e) {
      console.error('Error resetting profile:', e);
      throw e;
    }
  }
}