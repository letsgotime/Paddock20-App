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
   * @param vehicleData Vehicle data (without ID)
   */
  static collectVehicleData(vehicleData: Omit<VehicleData, 'id'>) {
    const { addVehicle } = this.store;
    
    // Create a full vehicle object with generated ID
    const fullVehicleData: VehicleData = {
      ...vehicleData as any,
      id: `vehicle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    addVehicle(fullVehicleData);
    this.updateLastActive();
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
   * @param vehicleContextData Vehicle data from the VehicleContext
   */
  static syncVehicleFromContext(vehicleContextData: any) {
    const { profile, addVehicle, updateVehicle } = this.store;
    
    if (!profile) return;
    
    // Log the syncing process
    console.log('Syncing vehicle with profile system:', vehicleContextData.make, vehicleContextData.model);
    
    // Check if this vehicle already exists in the profile by comparing attributes
    const existingVehicle = profile.vehicles.find((v: VehicleData) => 
      v.make === vehicleContextData.make && 
      v.model === vehicleContextData.model &&
      (v.year === parseInt(vehicleContextData.year) || v.year.toString() === vehicleContextData.year)
    );
    
    if (existingVehicle) {
      console.log('Updating existing profile vehicle:', existingVehicle.id);
      // Update the existing vehicle with any new data
      updateVehicle(existingVehicle.id, {
        color: vehicleContextData.color,
        nickname: vehicleContextData.nickname || vehicleContextData.car_name,
        image: vehicleContextData.vehicle_image || vehicleContextData.vehicleImage,
        mileage: parseInt(vehicleContextData.mileage) || 0,
        // Include additional fields for comprehensive sync
        lastServiced: vehicleContextData.last_service,
        engineType: vehicleContextData.engine_type || vehicleContextData.engineType,
        transmissionType: vehicleContextData.transmission || vehicleContextData.transmissionType,
        purchaseDate: vehicleContextData.purchase_date || vehicleContextData.purchaseDate
      });
    } else {
      console.log('Adding new vehicle to profile system');
      // Add as a new vehicle to the profile
      this.collectVehicleData({
        make: vehicleContextData.make,
        model: vehicleContextData.model,
        year: parseInt(vehicleContextData.year) || vehicleContextData.year,
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
        maintenanceRecords: []
      });
    }
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