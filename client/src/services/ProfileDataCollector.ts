/**
 * ProfileDataCollector.ts
 * 
 * This service acts as a central hub for collecting and syncing data from various parts of the app
 * into the User Profile. It provides standardized methods for different components to feed their
 * data into the profile system.
 * 
 * Design by: Replit AI & GoTime Motorsports Engineering Team
 * Last updated: May 2025
 */

import { useUserProfileStore, DriveData, GoalData, VehicleData, GalleryImage, EventData } from './userProfileService';

// Singleton class to collect and aggregate user profile data from across the app
class ProfileDataCollector {
  // Static reference to allow static methods to access the store
  private static store = useUserProfileStore.getState();
  
  // Set up subscription to keep the store reference updated when state changes
  static {
    useUserProfileStore.subscribe(state => {
      ProfileDataCollector.store = state;
    });
  }
  
  /**
   * Updates the user's last active timestamp
   */
  static updateLastActive() {
    const { profile, updateProfile } = this.store;
    if (profile) {
      updateProfile({ lastActive: new Date().toISOString() });
    }
  }
  
  /**
   * Logs a page view to track user activity patterns
   * @param page The page name or path being viewed
   */
  static logPageView(page: string) {
    console.log(`User visited: ${page} at ${new Date().toLocaleString()}`);
    this.updateLastActive();
    
    // In a production environment, this would likely:
    // 1. Send analytics to a backend service
    // 2. Update user profile statistics based on page category
    // 3. Potentially trigger achievements based on exploration
  }
  
  /**
   * Collects weather data from the weather system and associates it with the user profile
   * This allows for weather-based recommendations and insights
   * @param weatherData Weather data object from any weather API in the system
   */
  static collectWeatherData(weatherData: any) {
    // In a full implementation, this would store relevant weather stats
    // and associate them with the user's location and preferred driving conditions
    
    // We could also track weather patterns over time to:
    // - Suggest optimal driving times
    // - Alert about adverse conditions for favorite routes
    // - Associate weather with drive logs for context
    console.log('Weather data collected for user profile:', 
      weatherData?.currentLocation?.name || 'Unknown location');
  }
  
  /**
   * Records a drive in the user's history and updates relevant statistics
   * @param driveData Drive session data
   */
  static collectDriveData(driveData: DriveData) {
    const { profile, addDrive, updateProfile } = this.store;
    
    if (!profile) return;
    
    // Add the drive to the user's collection
    addDrive(driveData);
    
    // Update the user's statistics
    if (profile) {
      const distance = driveData.distance || 0;
      const updatedStats = {
        ...profile.statistics,
        totalDrives: profile.statistics.totalDrives + 1,
        totalMiles: profile.statistics.totalMiles + distance
      };
      
      // If this drive has a route and it's not already in favorite roads, consider adding it
      if (driveData.route && !profile.statistics.favoriteRoads.includes(driveData.route)) {
        // In a real implementation, we'd have some logic to determine if this should be a favorite
        // For now, we'll just add it if the user rates it highly (which would be stored in notes)
        if (driveData.notes?.toLowerCase().includes('favorite')) {
          updatedStats.favoriteRoads = [...profile.statistics.favoriteRoads, driveData.route];
        }
      }
      
      updateProfile({ 
        statistics: updatedStats,
        lastActive: new Date().toISOString()
      });
    }
  }
  
  /**
   * Records a user goal and adds it to their profile
   * @param goalData Goal data (without ID and auto-generated fields)
   */
  static collectGoalData(goalData: Omit<GoalData, 'id' | 'createdAt' | 'status'>) {
    const { addGoal } = this.store;
    
    // Create a full goal object with generated fields
    const fullGoalData: GoalData = {
      ...goalData as any,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    addGoal(fullGoalData);
    this.updateLastActive();
  }
  
  /**
   * Adds a gallery image to the user's collection
   * @param imageData Image data (without ID)
   */
  static collectGalleryImage(imageData: Omit<GalleryImage, 'id'>) {
    const { addGalleryImage } = this.store;
    
    // Create a full image object with generated ID
    const fullImageData: GalleryImage = {
      ...imageData as any,
      id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    addGalleryImage(fullImageData);
    this.updateLastActive();
  }
  
  /**
   * Adds or updates a vehicle in the user's garage
   * Also broadcasts the vehicle data to all site components
   * @param vehicleData Vehicle data (without ID)
   */
  static collectVehicleData(vehicleData: any) {
    // Check if we should skip broadcasting to prevent circular updates
    const skipBroadcast = vehicleData?._skipBroadcast || false;
    const source = vehicleData?._source;
    
    if (source === 'ProfileDataCollector') {
      console.log('Skipping vehicle collection from ProfileDataCollector to avoid loop');
      return vehicleData;
    }
    
    const { addVehicle } = this.store;
    
    // Create a clean copy without internal flags
    const cleanData = { ...vehicleData };
    delete cleanData._skipBroadcast;
    delete cleanData._source;
    
    // Create a full vehicle object with generated ID
    const fullVehicleData = {
      ...cleanData,
      id: `vehicle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    // Add to the profile system
    addVehicle(fullVehicleData);
    this.updateLastActive();
    
    // Broadcast to all dashboard components (if not skipped)
    if (!skipBroadcast) {
      // Add source to prevent loops
      const broadcastData = {
        ...fullVehicleData,
        _source: 'ProfileDataCollector'
      };
      this.broadcastVehicleDataToAllComponents(broadcastData);
    }
    
    return fullVehicleData;
  }
  
  /**
   * Broadcasts vehicle data to all site components
   * This ensures complete two-way integration across the entire application
   * @param vehicleData The vehicle data to broadcast
   */
  static broadcastVehicleDataToAllComponents(vehicleData: any) {
    console.log('Broadcasting vehicle data to all site components:', vehicleData.make, vehicleData.model);
    
    // Create a custom event to broadcast vehicle data site-wide
    const event = new CustomEvent('vehicle-data-update', {
      detail: {
        vehicle: vehicleData,
        source: 'ProfileDataCollector',
        timestamp: new Date().toISOString()
      }
    });
    
    // Dispatch the event to all listening components
    window.dispatchEvent(event);
    
    // Target specific components with specialized events
    
    // Garage Vault
    window.dispatchEvent(new CustomEvent('garage-vault-vehicle-update', {
      detail: { vehicle: vehicleData }
    }));
    
    // JuiceBox component
    window.dispatchEvent(new CustomEvent('juice-box-vehicle-update', {
      detail: { vehicle: vehicleData }
    }));
    
    // Gallery component
    window.dispatchEvent(new CustomEvent('gallery-vehicle-update', {
      detail: { vehicle: vehicleData }
    }));
    
    // Homepage dashboard
    window.dispatchEvent(new CustomEvent('homepage-vehicle-update', {
      detail: { vehicle: vehicleData }
    }));
    
    // Weather dashboard (to show vehicle-specific weather)
    window.dispatchEvent(new CustomEvent('weather-vehicle-update', {
      detail: { vehicle: vehicleData }
    }));
    
    // User settings
    window.dispatchEvent(new CustomEvent('settings-vehicle-update', {
      detail: { vehicle: vehicleData }
    }));
    
    // Also notify the VehicleContext for direct integration
    window.dispatchEvent(new CustomEvent('vehicle-updated', {
      detail: {
        vehicle: vehicleData,
        source: 'ProfileDataCollector'
      }
    }));
  }
  
  /**
   * Records that a user has attended an event
   * This updates both the event record and the user's statistics
   * @param eventId ID of the event attended
   */
  static recordEventAttendance(eventId: string) {
    const { profile, updateEvent, updateProfile } = this.store;
    
    if (!profile) return;
    
    // Update the event to mark it as attended
    updateEvent(eventId, { registered: true });
    
    // Update the user's statistics
    if (profile) {
      updateProfile({ 
        statistics: {
          ...profile.statistics,
          eventsAttended: profile.statistics.eventsAttended + 1
        },
        lastActive: new Date().toISOString()
      });
    }
  }
  
  /**
   * Syncs a user's vehicle data from the VehicleContext into the profile system
   * This ensures consistency between the main vehicle system and the profile
   * Also broadcasts vehicle data to all site components for two-way integration
   * @param vehicleContextData Vehicle data from the VehicleContext
   */
  static syncVehicleFromContext(vehicleContextData: any) {
    // Skip processing if the vehicle data is incomplete
    if (!vehicleContextData || !vehicleContextData.make || !vehicleContextData.model) {
      console.log('Vehicle data is incomplete, skipping sync:', vehicleContextData);
      return;
    }
    
    // FIX: Store store operations in a local variable first to prevent state updates
    // This helps to break the circular dependency causing the infinite update loop
    const storeRef = this.store;
    
    // Prevent execution if profile is not available
    if (!storeRef.profile) {
      console.log('Profile not available, skipping vehicle sync');
      return;
    }
    
    // IMPROVED CRITICAL FIX: Check if THIS SPECIFIC VEHICLE sync is already in progress
    // This is much more precise than a global flag and prevents legitimate syncs from being blocked
    if (this.isVehicleSyncInProgress(vehicleContextData)) {
      console.log('[Loop Prevention] Vehicle sync already in progress for:', 
        vehicleContextData.make, vehicleContextData.model);
      return;
    }
    
    try {
      // Prevent infinite loops by checking the source
      const eventSource = vehicleContextData?.source;
      if (eventSource === 'ProfileDataCollector') {
        console.log('Skipping sync from ProfileDataCollector to avoid infinite loop');
        return;
      }
      
      // Log the syncing process
      console.log('Syncing vehicle with profile system:', vehicleContextData.make, vehicleContextData.model);
      
      // Properly parse the year value once for consistent comparison
      const yearToCompare = typeof vehicleContextData.year === 'string'
        ? parseInt(vehicleContextData.year) || new Date().getFullYear()
        : vehicleContextData.year || new Date().getFullYear();
      
      // Check if this vehicle already exists in the profile by comparing attributes with consistent types
      const existingVehicle = storeRef.profile.vehicles.find((v: VehicleData) => 
        v.make === vehicleContextData.make && 
        v.model === vehicleContextData.model &&
        (v.year === yearToCompare || parseInt(v.year.toString()) === yearToCompare)
      );
      
      let updatedVehicle;
      
      if (existingVehicle) {
        console.log('Updating existing profile vehicle:', existingVehicle.id);
        // Create update data
        const updateData = {
          color: vehicleContextData.color,
          nickname: vehicleContextData.nickname || vehicleContextData.car_name,
          image: vehicleContextData.vehicle_image || vehicleContextData.vehicleImage,
          mileage: parseInt(vehicleContextData.mileage) || 0,
          // Include additional fields for comprehensive sync
          lastServiced: vehicleContextData.last_service,
          engineType: vehicleContextData.engine_type || vehicleContextData.engineType,
          transmissionType: vehicleContextData.transmission || vehicleContextData.transmissionType,
          purchaseDate: vehicleContextData.purchase_date || vehicleContextData.purchaseDate
        };
        
        // Create an updated copy of the vehicle
        updatedVehicle = {
          ...existingVehicle,
          ...updateData
        };
        
        // CRITICAL FIX: Defer the state update to break the update chain
        // Instead of immediately updating through the store
        setTimeout(() => {
          // Check if we're still in a good application state before updating
          if (storeRef.profile && storeRef.profile.vehicles) {
            // Now use the store method with a metadata flag to skip broadcast
            // This is a special internal flag that we'll include in the update data
            storeRef.updateVehicle(existingVehicle.id, { 
              ...updateData, 
              _skipBroadcast: true 
            });
          }
        }, 0);
      } else {
        console.log('Adding new vehicle to profile system');
        // Prepare vehicle data for adding
        // Create a variable to hold the parsed year value to ensure consistency
        const parsedYear = typeof vehicleContextData.year === 'string' 
          ? parseInt(vehicleContextData.year) || new Date().getFullYear()
          : vehicleContextData.year || new Date().getFullYear();
          
        const newVehicleData = {
          make: vehicleContextData.make,
          model: vehicleContextData.model,
          year: parsedYear, // Use the consistently parsed year
          color: vehicleContextData.color,
          nickname: vehicleContextData.nickname || vehicleContextData.car_name,
          image: vehicleContextData.vehicle_image || vehicleContextData.vehicleImage,
          mileage: parseInt(vehicleContextData.mileage) || 0,
          // Include additional fields for comprehensive addition
          lastServiced: vehicleContextData.last_service,
          engineType: vehicleContextData.engine_type || vehicleContextData.engineType,
          transmissionType: vehicleContextData.transmission || vehicleContextData.transmissionType,
          purchaseDate: vehicleContextData.purchase_date || vehicleContextData.purchaseDate,
          mods: [],
          maintenanceRecords: [],
          id: `profile-vehicle-${Date.now()}-${Math.floor(Math.random() * 10000)}`
        };
        
        // CRITICAL FIX: Instead of immediately calling collectVehicleData (which causes state updates)
        // We'll defer that operation
        updatedVehicle = newVehicleData;
        
        setTimeout(() => {
          // Make sure we're still in a good application state
          if (storeRef.profile) {
            this.collectVehicleData({
              ...newVehicleData,
              _skipBroadcast: true
            });
          }
        }, 0);
      }
      
      // Mark this vehicle's sync as complete
      setTimeout(() => {
        this.completeVehicleSync(vehicleContextData);
      }, 500);
      
      return updatedVehicle;
    } catch (error) {
      console.error('Error syncing vehicle from context:', error);
      // Make sure to mark sync as complete even on error
      this.completeVehicleSync(vehicleContextData);
      return null;
    }
  }
  
  // Track vehicles that are currently being synchronized to prevent loops
  // Uses a Map with vehicle IDs (or make+model+year if ID not available) as keys
  // and timestamps as values to automatically expire entries after some time
  private static _syncInProgressVehicles = new Map<string, number>();
  
  /**
   * Check if a specific vehicle is currently being synced
   * @param vehicleData The vehicle data to check
   * @returns Boolean indicating if this specific vehicle is already being synced
   */
  private static isVehicleSyncInProgress(vehicleData: any): boolean {
    // Create a unique key for the vehicle based on available data
    const vehicleKey = vehicleData.id || 
      `${vehicleData.make}-${vehicleData.model}-${vehicleData.year}`;
    
    // Check if this vehicle is currently being synced
    const syncTimestamp = this._syncInProgressVehicles.get(vehicleKey);
    
    // If no sync is in progress or the sync has expired (more than 5 seconds old)
    if (!syncTimestamp || (Date.now() - syncTimestamp > 5000)) {
      // Set or update the sync timestamp
      this._syncInProgressVehicles.set(vehicleKey, Date.now());
      return false;
    }
    
    return true;
  }
  
  /**
   * Mark a vehicle sync as complete
   * @param vehicleData The vehicle data to mark as complete
   */
  private static completeVehicleSync(vehicleData: any): void {
    const vehicleKey = vehicleData.id || 
      `${vehicleData.make}-${vehicleData.model}-${vehicleData.year}`;
    
    // Remove the vehicle from the in-progress map
    this._syncInProgressVehicles.delete(vehicleKey);
  }
  
  /**
   * Syncs all vehicles from the array to the profile system
   * Useful for batch operations like importing or initial setup
   * @param vehiclesArray Array of vehicle data objects
   */
  static syncAllVehicles(vehiclesArray: any[]) {
    console.log(`Syncing ${vehiclesArray.length} vehicles to profile system`);
    
    // Process each vehicle in the array
    vehiclesArray.forEach(vehicle => {
      this.syncVehicleFromContext(vehicle);
    });
    
    this.updateLastActive();
  }
  
  /**
   * Archives a vehicle when it's been sold or no longer active
   * Moves the vehicle to archived status and triggers appropriate events
   * @param vehicleId ID of the vehicle to archive
   * @param saleData Optional sale data if the vehicle was sold
   * @returns The archived vehicle data or null if failed
   */
  static archiveVehicle(vehicleId: string, saleInfo?: {
    saleDate: string;
    salePrice: number;
    buyer?: string;
    notes?: string;
  }): any {
    console.log(`Archiving vehicle with ID: ${vehicleId}`, saleInfo ? 'with sale data' : '');
    const { profile, updateVehicle } = this.store;
    
    if (!profile) {
      console.warn('Cannot archive vehicle: No profile found');
      return null;
    }
    
    // Find the vehicle to archive
    const vehicleToArchive = profile.vehicles.find((v: VehicleData) => v.id === vehicleId);
    if (!vehicleToArchive) {
      console.warn(`Cannot archive vehicle: Vehicle with ID ${vehicleId} not found`);
      return null;
    }
    
    // Convert the sale info to the expected saleData format
    const formattedSaleData = saleInfo ? {
      price: saleInfo.salePrice,
      date: saleInfo.saleDate,
      buyer: saleInfo.buyer
    } : undefined;
    
    // Update the vehicle with archived status
    const archivedVehicle = {
      ...vehicleToArchive,
      status: 'archived',
      archivedAt: new Date().toISOString(),
      saleData: formattedSaleData
    };
    
    // Update in profile store
    updateVehicle(vehicleId, {
      archivedAt: new Date().toISOString(),
      saleData: formattedSaleData,
      _skipBroadcast: true
    });
    
    // Broadcast the archival to all components
    console.log(`Broadcasting vehicle archival: ${vehicleToArchive.make} ${vehicleToArchive.model}`);
    
    // Create a custom event for the archival
    const event = new CustomEvent('vehicle-data-update', {
      detail: {
        action: 'archive',
        vehicleId: vehicleId,
        vehicle: archivedVehicle,
        formattedSaleData: formattedSaleData,
        source: 'ProfileDataCollector',
        timestamp: new Date().toISOString()
      }
    });
    
    // Dispatch to all listening components
    window.dispatchEvent(event);
    
    // Target specific components with specialized events
    
    // Garage Vault
    window.dispatchEvent(new CustomEvent('garage-vault-vehicle-update', {
      detail: { 
        action: 'archive',
        vehicleId: vehicleId,
        vehicle: archivedVehicle,
        formattedSaleData: formattedSaleData
      }
    }));
    
    // JuiceBox component
    window.dispatchEvent(new CustomEvent('juice-box-vehicle-update', {
      detail: { 
        action: 'archive',
        vehicleId: vehicleId,
        formattedSaleData: formattedSaleData
      }
    }));
    
    // User Profile Hub
    window.dispatchEvent(new CustomEvent('profile-vehicle-update', {
      detail: { 
        action: 'archive',
        vehicleId: vehicleId,
        saleInfo: saleInfo
      }
    }));
    
    return archivedVehicle;
  }
  
  /**
   * Restores a previously archived vehicle
   * @param vehicleId ID of the vehicle to restore
   * @returns The restored vehicle data or null if failed
   */
  static restoreArchivedVehicle(vehicleId: string): any {
    console.log(`Restoring archived vehicle with ID: ${vehicleId}`);
    const { profile, updateVehicle } = this.store;
    
    if (!profile) {
      console.warn('Cannot restore vehicle: No profile found');
      return null;
    }
    
    // Find the vehicle to restore
    const vehicleToRestore = profile.vehicles.find((v: VehicleData) => v.id === vehicleId);
    if (!vehicleToRestore) {
      console.warn(`Cannot restore vehicle: Vehicle with ID ${vehicleId} not found`);
      return null;
    }
    
    if (vehicleToRestore.status !== 'archived') {
      console.warn(`Vehicle with ID ${vehicleId} is not archived`);
      return vehicleToRestore;
    }
    
    // Update the vehicle with active status
    const restoredVehicle = {
      ...vehicleToRestore,
      status: 'active',
      archivedAt: undefined,
      saleData: undefined
    };
    
    // Update in profile store
    updateVehicle(vehicleId, {
      archivedAt: undefined,
      saleData: undefined,
      _skipBroadcast: true
    });
    
    // Broadcast the restoration to all components
    console.log(`Broadcasting vehicle restoration: ${vehicleToRestore.make} ${vehicleToRestore.model}`);
    
    // Create a custom event for the restoration
    const event = new CustomEvent('vehicle-data-update', {
      detail: {
        action: 'restore',
        vehicleId: vehicleId,
        vehicle: restoredVehicle,
        source: 'ProfileDataCollector',
        timestamp: new Date().toISOString()
      }
    });
    
    // Dispatch to all listening components
    window.dispatchEvent(event);
    
    // Target specific components with specialized events
    window.dispatchEvent(new CustomEvent('garage-vault-vehicle-update', {
      detail: { 
        action: 'restore',
        vehicleId: vehicleId,
        vehicle: restoredVehicle
      }
    }));
    
    return restoredVehicle;
  }

  /**
   * Deletes a vehicle from the user's profile
   * Also broadcasts the deletion to all components for two-way integration
   * @param vehicleId ID of the vehicle to delete
   * @returns Boolean indicating success or failure
   */
  static deleteVehicle(vehicleId: string): boolean {
    console.log(`Deleting vehicle with ID: ${vehicleId}`);
    const { profile, updateProfile } = this.store;
    
    if (!profile) {
      console.warn('Cannot delete vehicle: No profile found');
      return false;
    }
    
    // Find the vehicle to delete
    const vehicleToDelete = profile.vehicles.find((v: VehicleData) => v.id === vehicleId);
    if (!vehicleToDelete) {
      console.warn(`Cannot delete vehicle: Vehicle with ID ${vehicleId} not found`);
      return false;
    }
    
    // Remove the vehicle from the profile
    const updatedVehicles = profile.vehicles.filter((v: VehicleData) => v.id !== vehicleId);
    
    // Update the profile
    updateProfile({
      vehicles: updatedVehicles,
      lastActive: new Date().toISOString()
    });
    
    // Broadcast the deletion to all components
    console.log(`Broadcasting vehicle deletion: ${vehicleToDelete.make} ${vehicleToDelete.model}`);
    
    // Create a custom event for the deletion
    const event = new CustomEvent('vehicle-data-update', {
      detail: {
        action: 'delete',
        vehicleId: vehicleId,
        source: 'ProfileDataCollector',
        timestamp: new Date().toISOString()
      }
    });
    
    // Dispatch to all listening components
    window.dispatchEvent(event);
    
    // Target specific components with specialized events
    
    // Garage Vault
    window.dispatchEvent(new CustomEvent('garage-vault-vehicle-update', {
      detail: { 
        action: 'delete',
        vehicleId: vehicleId
      }
    }));
    
    // JuiceBox component
    window.dispatchEvent(new CustomEvent('juice-box-vehicle-update', {
      detail: { 
        action: 'delete',
        vehicleId: vehicleId
      }
    }));
    
    // Gallery component
    window.dispatchEvent(new CustomEvent('gallery-vehicle-update', {
      detail: { 
        action: 'delete',
        vehicleId: vehicleId
      }
    }));
    
    // Homepage dashboard
    window.dispatchEvent(new CustomEvent('homepage-vehicle-update', {
      detail: { 
        action: 'delete',
        vehicleId: vehicleId
      }
    }));
    
    // Weather dashboard
    window.dispatchEvent(new CustomEvent('weather-vehicle-update', {
      detail: { 
        action: 'delete',
        vehicleId: vehicleId
      }
    }));
    
    // User settings
    window.dispatchEvent(new CustomEvent('settings-vehicle-update', {
      detail: { 
        action: 'delete',
        vehicleId: vehicleId
      }
    }));
    
    // Also notify the VehicleContext
    window.dispatchEvent(new CustomEvent('vehicle-deleted', {
      detail: {
        vehicleId: vehicleId,
        source: 'ProfileDataCollector'
      }
    }));
    
    return true;
  }

  /**
   * Imports data from another component or system into the profile
   * This is a generic method for any data source that doesn't have a specific collector
   * @param source Name of the source component or system
   * @param data The data to import (must include a type field)
   */
  static importDataFromComponent(source: string, data: any) {
    console.log(`Importing data from ${source}:`, data);
    
    // Based on the data type, route it to the appropriate collector
    switch (data.type) {
      case 'drive':
        this.collectDriveData(data as DriveData);
        break;
      case 'goal':
        this.collectGoalData(data);
        break;
      case 'vehicle':
        this.collectVehicleData(data);
        break;
      case 'image':
        this.collectGalleryImage(data);
        break;
      case 'event':
        if (data.id && data.attended) {
          this.recordEventAttendance(data.id);
        }
        break;
      default:
        console.warn(`Unknown data type received from ${source}:`, data);
    }
  }
}

export default ProfileDataCollector;