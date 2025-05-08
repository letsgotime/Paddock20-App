/**
 * Storage Migration Utility
 * 
 * Handles migration of legacy localStorage data to the new centralized warehouse system.
 * This utility ensures we don't lose any data during the transition to the new system.
 */

import { STORAGE_KEYS } from './constants';
import { safeSetItem } from './storageManager';
import { storeVehicle as saveVehicleToWarehouse, getAllVehicles } from '../services/VehicleDataWarehouse';

/**
 * Migrates all legacy data to the new storage system
 * @returns Object containing statistics about the migration
 */
export async function migrateAllLegacyStorage(): Promise<{
  vehiclesMigrated: number;
  galleryItemsMigrated: number;
  profileDataMigrated: boolean;
  legacyKeysRemoved: string[];
}> {
  const stats = {
    vehiclesMigrated: 0,
    galleryItemsMigrated: 0,
    profileDataMigrated: false,
    legacyKeysRemoved: [] as string[]
  };

  try {
    console.log('Starting migration of legacy localStorage data...');

    // Step 1: Migrate legacy vehicle data
    stats.vehiclesMigrated = await migrateVehicleData();

    // Step 2: Migrate legacy gallery data
    stats.galleryItemsMigrated = await migrateGalleryData();

    // Step 3: Migrate user profile data
    stats.profileDataMigrated = await migrateUserProfileData();

    // Step 4: Cleanup legacy keys if migration was successful
    if (stats.vehiclesMigrated > 0 || stats.galleryItemsMigrated > 0 || stats.profileDataMigrated) {
      stats.legacyKeysRemoved = cleanupLegacyKeys();
    }

    console.log('Migration complete:', stats);
    return stats;
  } catch (error) {
    console.error('Migration failed:', error);
    return stats;
  }
}

/**
 * Migrates legacy vehicle data to the new warehouse
 * @returns Number of vehicles migrated
 */
async function migrateVehicleData(): Promise<number> {
  let migratedCount = 0;
  let errorCount = 0;

  try {
    // Get existing vehicles in warehouse to avoid duplicates
    const existingVehicles = getAllVehicles(true);
    const existingVins = new Set(existingVehicles.map(v => v.vin).filter(Boolean));
    const existingIds = new Set(existingVehicles.map(v => v.id));

    // Check all possible legacy vehicle storage locations
    const legacyKeys = [
      STORAGE_KEYS.LEGACY_USER_VEHICLES,
      STORAGE_KEYS.LEGACY_CAR_DATA,
      STORAGE_KEYS.LEGACY_VEHICLE_DATA,
      STORAGE_KEYS.LEGACY_VEHICLE_CONTEXT
    ];

    for (const key of legacyKeys) {
      const data = localStorage.getItem(key);
      if (!data) continue;

      try {
        // Parse the legacy data
        const parsed = JSON.parse(data);
        let vehicles = Array.isArray(parsed) ? parsed : [parsed];

        // Filter out vehicles with no make/model/year (likely invalid data)
        vehicles = vehicles.filter(v => v && (v.make || v.model || v.year));

        // Process each vehicle
        for (const vehicle of vehicles) {
          try {
            // Skip if we already have this vehicle by VIN or ID
            if (vehicle.vin && existingVins.has(vehicle.vin)) continue;
            if (vehicle.id && existingIds.has(vehicle.id)) continue;

            // Format year and mileage as numbers
            const year = typeof vehicle.year === 'number' ? vehicle.year : 
                         (vehicle.year ? parseInt(vehicle.year.toString()) : new Date().getFullYear());
            
            const mileage = typeof vehicle.mileage === 'number' ? vehicle.mileage : 
                           (vehicle.mileage ? parseInt(vehicle.mileage.toString()) : 0);

            // Create a well-structured vehicle object
            const completeVehicle = {
              id: vehicle.id || `vehicle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              make: vehicle.make || '',
              model: vehicle.model || '',
              year: year,
              mileage: mileage,
              nickname: vehicle.nickname || vehicle.car_name || '',
              color: vehicle.color || '',
              engineType: vehicle.engineType || vehicle.engine_type || '',
              transmissionType: vehicle.transmissionType || vehicle.transmission || '',
              primaryImage: vehicle.primaryImage || vehicle.vehicleImage || vehicle.vehicle_image || '',
              vin: vehicle.vin || '',
              entry_method: vehicle.entry_method || 'manual',
              status: 'active',
              _migrated: true,
              _migrationSource: key
            };

            // Save to the warehouse
            const saved = await saveVehicleToWarehouse(completeVehicle);
            if (saved) {
              migratedCount++;
              existingVins.add(completeVehicle.vin);
              existingIds.add(completeVehicle.id);
            }
          } catch (vehicleError) {
            console.error(`Failed to migrate vehicle from ${key}:`, vehicleError);
            errorCount++;
          }
        }
      } catch (parseError) {
        console.error(`Failed to parse data from ${key}:`, parseError);
      }
    }

    console.log(`Vehicle migration complete: ${migratedCount} migrated, ${errorCount} errors`);
    return migratedCount;
  } catch (error) {
    console.error('Vehicle migration failed:', error);
    return migratedCount;
  }
}

/**
 * Migrates legacy gallery data to the new storage system
 * @returns Number of gallery items migrated
 */
async function migrateGalleryData(): Promise<number> {
  let migratedCount = 0;

  try {
    // Check for legacy gallery data
    const legacyGalleryKeys = [
      'gallery-items',
      'my-gallery',
      'user-gallery',
      'photo-gallery',
      'vehicle-gallery',
      'media-gallery'
    ];

    const consolidatedMedia: any[] = [];

    // Process each possible legacy key
    for (const key of legacyGalleryKeys) {
      const data = localStorage.getItem(key);
      if (!data) continue;

      try {
        // Parse the legacy data
        const parsed = JSON.parse(data);
        const mediaItems = Array.isArray(parsed) ? parsed : [parsed];

        // Process each media item
        for (const item of mediaItems) {
          // Skip invalid items
          if (!item || (!item.url && !item.src && !item.image)) continue;

          // Standardize media object
          const standardizedItem = {
            id: item.id || `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            url: item.url || item.src || item.image || '',
            type: item.type || item.mediaType || 'image',
            title: item.title || item.caption || item.alt || '',
            description: item.description || '',
            tags: item.tags || [],
            vehicleId: item.vehicleId || item.vehicle_id || '',
            vin: item.vin || '',
            timestamp: item.timestamp || item.date || new Date().toISOString(),
            isFeatured: !!item.isFeatured,
            category: item.category || 'general',
            _migrated: true,
            _migrationSource: key
          };

          // Only add non-duplicates
          if (!consolidatedMedia.some(m => m.url === standardizedItem.url)) {
            consolidatedMedia.push(standardizedItem);
            migratedCount++;
          }
        }
      } catch (parseError) {
        console.error(`Failed to parse gallery data from ${key}:`, parseError);
      }
    }

    // Save consolidated media to the new storage
    if (consolidatedMedia.length > 0) {
      safeSetItem(STORAGE_KEYS.GALLERY_DATA, JSON.stringify(consolidatedMedia));
      console.log(`Gallery migration complete: ${migratedCount} items migrated`);
    }

    return migratedCount;
  } catch (error) {
    console.error('Gallery migration failed:', error);
    return migratedCount;
  }
}

/**
 * Migrates legacy user profile data to the new storage system
 * @returns Whether the migration was successful
 */
async function migrateUserProfileData(): Promise<boolean> {
  try {
    // Check for legacy user profile data
    const legacyProfileKey = STORAGE_KEYS.LEGACY_USER_PROFILE;
    const data = localStorage.getItem(legacyProfileKey);
    
    if (!data) return false;

    try {
      // Parse the legacy data
      const parsedProfile = JSON.parse(data);
      
      // Skip if invalid
      if (!parsedProfile || typeof parsedProfile !== 'object') return false;

      // Create a standardized profile object
      const standardizedProfile = {
        ...parsedProfile,
        _migrated: true,
        _migrationSource: legacyProfileKey,
        _lastUpdated: new Date().toISOString()
      };

      // Save to the new storage
      safeSetItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(standardizedProfile));
      console.log('User profile migration complete');
      return true;
    } catch (parseError) {
      console.error(`Failed to parse profile data from ${legacyProfileKey}:`, parseError);
      return false;
    }
  } catch (error) {
    console.error('Profile migration failed:', error);
    return false;
  }
}

/**
 * Cleans up legacy storage keys after successful migration
 * @returns Array of removed keys
 */
function cleanupLegacyKeys(): string[] {
  const removedKeys: string[] = [];
  
  // List of all legacy keys to clean up
  const legacyKeys = [
    STORAGE_KEYS.LEGACY_USER_VEHICLES,
    STORAGE_KEYS.LEGACY_USER_PROFILE,
    STORAGE_KEYS.LEGACY_CAR_DATA,
    STORAGE_KEYS.LEGACY_VEHICLE_DATA,
    STORAGE_KEYS.LEGACY_VEHICLE_CONTEXT,
    'gallery-items',
    'my-gallery',
    'user-gallery',
    'photo-gallery',
    'vehicle-gallery',
    'media-gallery'
  ];

  // Create backups before removal
  const backups: Record<string, string> = {};
  
  for (const key of legacyKeys) {
    const value = localStorage.getItem(key);
    if (value) {
      backups[key] = value;
    }
  }

  // Save backups
  safeSetItem('paddock20:legacy-data-backup', JSON.stringify(backups));
  
  // Now remove the legacy keys
  for (const key of legacyKeys) {
    try {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        removedKeys.push(key);
      }
    } catch (error) {
      console.error(`Failed to remove legacy key ${key}:`, error);
    }
  }
  
  console.log(`Cleaned up ${removedKeys.length} legacy storage keys`);
  return removedKeys;
}

/**
 * Runs the migration when the module is imported
 * This ensures the migration happens early in the app lifecycle
 */
export function initializeMigration(): void {
  // Check if migration is needed
  const migrationCompleted = localStorage.getItem('paddock20:migration-completed');
  
  if (!migrationCompleted) {
    // Set a timeout to run migration after the app has loaded
    setTimeout(() => {
      migrateAllLegacyStorage()
        .then(() => {
          // Mark migration as completed
          localStorage.setItem('paddock20:migration-completed', new Date().toISOString());
        })
        .catch(error => {
          console.error('Migration failed to initialize:', error);
        });
    }, 2000);
  }
}

// Auto-initialize
initializeMigration();