/**
 * UserProfileContext.tsx
 * 
 * This context provides access to the UserProfileWarehouse throughout the application
 * It serves as the central hub for all user profile data and operations
 */

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import userProfileWarehouse, { 
  UserProfileData, 
  UserIdentity,
  UserPreferences,
  VehicleReference,
  DriveRecord,
  GoalRecord,
  EventRecord,
  GalleryItem,
  DetailingActivity
} from '../services/UserProfileWarehouse';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Context interface
interface UserProfileContextType {
  // Core data
  profile: UserProfileData | null;
  isLoading: boolean;
  error: string | null;
  
  // Identity actions
  updateIdentity: (updates: Partial<UserIdentity>) => void;
  
  // Preferences actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateWeatherPreferences: (updates: Partial<UserPreferences['weatherPreferences']>) => void;
  
  // Vehicle actions
  addVehicle: (vehicle: VehicleReference) => void;
  updateVehicle: (id: string, updates: Partial<VehicleReference>) => void;
  removeVehicle: (id: string) => void;
  
  // Drive actions
  addDrive: (drive: DriveRecord) => void;
  updateDrive: (id: string, updates: Partial<DriveRecord>) => void;
  removeDrive: (id: string) => void;
  
  // Goal actions
  addGoal: (goal: GoalRecord) => void;
  updateGoal: (id: string, updates: Partial<GoalRecord>) => void;
  removeGoal: (id: string) => void;
  
  // Event actions
  addEvent: (event: EventRecord) => void;
  updateEvent: (id: string, updates: Partial<EventRecord>) => void;
  removeEvent: (id: string) => void;
  
  // Gallery actions
  addGalleryItem: (item: GalleryItem) => void;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>) => void;
  removeGalleryItem: (id: string) => void;
  
  // Detailing activities actions
  addDetailingActivity: (activity: DetailingActivity) => void;
  updateDetailingActivity: (id: string, updates: Partial<DetailingActivity>) => void;
  removeDetailingActivity: (id: string) => void;
  
  // Product and loadout actions
  addFavoriteProduct: (product: any) => void;
  removeFavoriteProduct: (id: string) => void;
  addSavedLoadout: (loadout: any) => void;
  updateSavedLoadout: (id: string, updates: any) => void;
  removeSavedLoadout: (id: string) => void;
  
  // Podium pursuit actions
  addPodiumTarget: (target: any) => void;
  updatePodiumTarget: (id: string, updates: any) => void;
  removePodiumTarget: (id: string) => void;
  completePodiumTarget: (id: string, completionData: any) => void;
  
  // Route actions
  addSavedRoute: (route: any) => void;
  updateSavedRoute: (id: string, updates: any) => void;
  removeSavedRoute: (id: string) => void;
  addFavoriteRoad: (road: any) => void;
  removeFavoriteRoad: (id: string) => void;
  
  // Playlist actions
  addPlaylist: (playlist: any) => void;
  updatePlaylist: (id: string, updates: any) => void;
  removePlaylist: (id: string) => void;
  updateSoundSettings: (settings: any) => void;
  
  // Maintenance actions
  addMaintenanceRecord: (record: any) => void;
  updateMaintenanceRecord: (id: string, updates: any) => void;
  removeMaintenanceRecord: (id: string) => void;
  addScheduledMaintenance: (maintenance: any) => void;
  updateScheduledMaintenance: (id: string, updates: any) => void;
  removeScheduledMaintenance: (id: string) => void;
  completeScheduledMaintenance: (id: string, completionData: any) => void;
  
  // Sync data from external contexts
  syncVehiclesFromContext: (vehicles: VehicleReference[]) => void;
  syncDrivesFromContext: (drives: DriveRecord[]) => void;
  syncGalleryFromContext: (gallery: GalleryItem[]) => void;
}

// Create the context with a default value
export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  isLoading: false,
  error: null,
  
  // Identity actions
  updateIdentity: () => {},
  
  // Preferences actions
  updatePreferences: () => {},
  updateWeatherPreferences: () => {},
  
  // Vehicle actions
  addVehicle: () => {},
  updateVehicle: () => {},
  removeVehicle: () => {},
  
  // Drive actions
  addDrive: () => {},
  updateDrive: () => {},
  removeDrive: () => {},
  
  // Goal actions
  addGoal: () => {},
  updateGoal: () => {},
  removeGoal: () => {},
  
  // Event actions
  addEvent: () => {},
  updateEvent: () => {},
  removeEvent: () => {},
  
  // Gallery actions
  addGalleryItem: () => {},
  updateGalleryItem: () => {},
  removeGalleryItem: () => {},
  
  // Detailing activities actions
  addDetailingActivity: () => {},
  updateDetailingActivity: () => {},
  removeDetailingActivity: () => {},
  
  // Product and loadout actions
  addFavoriteProduct: () => {},
  removeFavoriteProduct: () => {},
  addSavedLoadout: () => {},
  updateSavedLoadout: () => {},
  removeSavedLoadout: () => {},
  
  // Podium pursuit actions
  addPodiumTarget: () => {},
  updatePodiumTarget: () => {},
  removePodiumTarget: () => {},
  completePodiumTarget: () => {},
  
  // Route actions
  addSavedRoute: () => {},
  updateSavedRoute: () => {},
  removeSavedRoute: () => {},
  addFavoriteRoad: () => {},
  removeFavoriteRoad: () => {},
  
  // Playlist actions
  addPlaylist: () => {},
  updatePlaylist: () => {},
  removePlaylist: () => {},
  updateSoundSettings: () => {},
  
  // Maintenance actions
  addMaintenanceRecord: () => {},
  updateMaintenanceRecord: () => {},
  removeMaintenanceRecord: () => {},
  addScheduledMaintenance: () => {},
  updateScheduledMaintenance: () => {},
  removeScheduledMaintenance: () => {},
  completeScheduledMaintenance: () => {},
  
  // Sync methods
  syncVehiclesFromContext: () => {},
  syncDrivesFromContext: () => {},
  syncGalleryFromContext: () => {}
});

// Provider component
export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize the warehouse
  useEffect(() => {
    const initializeWarehouse = async () => {
      if (initialized) return;
      
      setIsLoading(true);
      
      try {
        // Initialize the warehouse
        await userProfileWarehouse.initialize();
        
        // Subscribe to profile changes
        userProfileWarehouse.onProfileChange((updatedProfile) => {
          console.log('User profile updated:', updatedProfile.identity.username);
          setProfile(updatedProfile);
        });
        
        // Get initial profile
        const initialProfile = userProfileWarehouse.getProfile();
        
        if (initialProfile) {
          console.log('Loaded user profile:', initialProfile.identity.username);
          setProfile(initialProfile);
        } else {
          console.log('No user profile found in storage');
        }
        
        setInitialized(true);
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error initializing profile warehouse';
        console.error('Error initializing user profile warehouse:', message);
        setError(message);
        setIsLoading(false);
        
        toast({
          title: 'Profile Error',
          description: 'There was an error loading your profile data. Some features may be limited.',
          variant: 'destructive',
        });
      }
    };
    
    initializeWarehouse();
    
    // Cleanup subscription on unmount
    return () => {
      // Cleanup handled by the warehouse
    };
  }, [initialized, toast]);
  
  // Update profile with authenticated user data when available
  useEffect(() => {
    if (user && profile && initialized) {
      try {
        // Check if we need to update the profile with auth data
        // Safely convert IDs to strings for comparison 
        const userId = user.id ? user.id.toString() : '';
        const profileId = profile.identity?.id ? profile.identity.id.toString() : '';
        
        if (userId !== profileId || 
            user.username !== profile.identity.username ||
            user.email !== profile.identity.email) {
          
          console.log('Syncing authenticated user data to profile');
          
          // Update identity data from authenticated user
          userProfileWarehouse.updateIdentity({
            id: userId,
            username: user.username || '',
            email: user.email,
            lastActive: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error syncing user data to profile:', error);
      }
    }
  }, [user, profile, initialized]);
  
  // Core context methods
  const updateIdentity = (updates: Partial<UserIdentity>) => {
    if (!profile) return;
    userProfileWarehouse.updateIdentity(updates);
  };
  
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    if (!profile) return;
    userProfileWarehouse.updatePreferences(updates);
  };
  
  const updateWeatherPreferences = (updates: Partial<UserPreferences['weatherPreferences']>) => {
    if (!profile) return;
    userProfileWarehouse.updateWeatherPreferences(updates);
  };
  
  // Vehicle methods
  const addVehicle = (vehicle: VehicleReference) => {
    if (!profile) return;
    userProfileWarehouse.addVehicleReference(vehicle);
  };
  
  const updateVehicle = (id: string, updates: Partial<VehicleReference>) => {
    if (!profile) return;
    try {
      userProfileWarehouse.updateVehicleReference(id, updates);
    } catch (error) {
      console.error('Error updating vehicle in profile:', error);
    }
  };
  
  const removeVehicle = (id: string) => {
    if (!profile) return;
    userProfileWarehouse.removeVehicle(id);
  };
  
  // Drive methods
  const addDrive = (drive: DriveRecord) => {
    if (!profile) return;
    userProfileWarehouse.addDrive(drive);
  };
  
  const updateDrive = (id: string, updates: Partial<DriveRecord>) => {
    if (!profile) return;
    userProfileWarehouse.updateDrive(id, updates);
  };
  
  const removeDrive = (id: string) => {
    if (!profile) return;
    userProfileWarehouse.removeDrive(id);
  };
  
  // Goal methods
  const addGoal = (goal: GoalRecord) => {
    if (!profile) return;
    userProfileWarehouse.addGoal(goal);
  };
  
  const updateGoal = (id: string, updates: Partial<GoalRecord>) => {
    if (!profile) return;
    userProfileWarehouse.updateGoal(id, updates);
  };
  
  const removeGoal = (id: string) => {
    if (!profile) return;
    userProfileWarehouse.removeGoal(id);
  };
  
  // Event methods
  const addEvent = (event: EventRecord) => {
    if (!profile) return;
    userProfileWarehouse.addEvent(event);
  };
  
  const updateEvent = (id: string, updates: Partial<EventRecord>) => {
    if (!profile) return;
    userProfileWarehouse.updateEvent(id, updates);
  };
  
  const removeEvent = (id: string) => {
    if (!profile) return;
    userProfileWarehouse.removeEvent(id);
  };
  
  // Gallery methods
  const addGalleryItem = (item: GalleryItem) => {
    if (!profile) return;
    userProfileWarehouse.addGalleryItem(item);
  };
  
  const updateGalleryItem = (id: string, updates: Partial<GalleryItem>) => {
    if (!profile) return;
    userProfileWarehouse.updateGalleryItem(id, updates);
  };
  
  const removeGalleryItem = (id: string) => {
    if (!profile) return;
    userProfileWarehouse.removeGalleryItem(id);
  };
  
  // Detailing activities methods
  const addDetailingActivity = (activity: DetailingActivity) => {
    if (!profile) return;
    userProfileWarehouse.addDetailingActivity(activity);
  };
  
  const updateDetailingActivity = (id: string, updates: Partial<DetailingActivity>) => {
    if (!profile) return;
    userProfileWarehouse.updateDetailingActivity(id, updates);
  };
  
  const removeDetailingActivity = (id: string) => {
    if (!profile) return;
    userProfileWarehouse.removeDetailingActivity(id);
  };
  
  // Product and loadout methods
  const addFavoriteProduct = (product: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().addFavoriteProduct) {
      store.getState().addFavoriteProduct(product);
    }
  };
  
  const removeFavoriteProduct = (id: string) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().removeFavoriteProduct) {
      store.getState().removeFavoriteProduct(id);
    }
  };
  
  const addSavedLoadout = (loadout: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().addSavedLoadout) {
      store.getState().addSavedLoadout(loadout);
    }
  };
  
  const updateSavedLoadout = (id: string, updates: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().updateSavedLoadout) {
      store.getState().updateSavedLoadout(id, updates);
    }
  };
  
  const removeSavedLoadout = (id: string) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().removeSavedLoadout) {
      store.getState().removeSavedLoadout(id);
    }
  };
  
  // Podium pursuit methods
  const addPodiumTarget = (target: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().addPodiumTarget) {
      store.getState().addPodiumTarget(target);
    }
  };
  
  const updatePodiumTarget = (id: string, updates: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().updatePodiumTarget) {
      store.getState().updatePodiumTarget(id, updates);
    }
  };
  
  const removePodiumTarget = (id: string) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().removePodiumTarget) {
      store.getState().removePodiumTarget(id);
    }
  };
  
  const completePodiumTarget = (id: string, completionData: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().completePodiumTarget) {
      store.getState().completePodiumTarget(id, completionData);
    }
  };
  
  // Route methods
  const addSavedRoute = (route: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().addSavedRoute) {
      store.getState().addSavedRoute(route);
    }
  };
  
  const updateSavedRoute = (id: string, updates: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().updateSavedRoute) {
      store.getState().updateSavedRoute(id, updates);
    }
  };
  
  const removeSavedRoute = (id: string) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().removeSavedRoute) {
      store.getState().removeSavedRoute(id);
    }
  };
  
  const addFavoriteRoad = (road: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().addFavoriteRoad) {
      store.getState().addFavoriteRoad(road);
    }
  };
  
  const removeFavoriteRoad = (id: string) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().removeFavoriteRoad) {
      store.getState().removeFavoriteRoad(id);
    }
  };
  
  // Playlist methods
  const addPlaylist = (playlist: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().addPlaylist) {
      store.getState().addPlaylist(playlist);
    }
  };
  
  const updatePlaylist = (id: string, updates: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().updatePlaylist) {
      store.getState().updatePlaylist(id, updates);
    }
  };
  
  const removePlaylist = (id: string) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().removePlaylist) {
      store.getState().removePlaylist(id);
    }
  };
  
  const updateSoundSettings = (settings: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().updateSoundSettings) {
      store.getState().updateSoundSettings(settings);
    }
  };
  
  // Maintenance methods
  const addMaintenanceRecord = (record: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().addMaintenanceRecord) {
      store.getState().addMaintenanceRecord(record);
    }
  };
  
  const updateMaintenanceRecord = (id: string, updates: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().updateMaintenanceRecord) {
      store.getState().updateMaintenanceRecord(id, updates);
    }
  };
  
  const removeMaintenanceRecord = (id: string) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().removeMaintenanceRecord) {
      store.getState().removeMaintenanceRecord(id);
    }
  };
  
  const addScheduledMaintenance = (maintenance: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().addScheduledMaintenance) {
      store.getState().addScheduledMaintenance(maintenance);
    }
  };
  
  const updateScheduledMaintenance = (id: string, updates: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().updateScheduledMaintenance) {
      store.getState().updateScheduledMaintenance(id, updates);
    }
  };
  
  const removeScheduledMaintenance = (id: string) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().removeScheduledMaintenance) {
      store.getState().removeScheduledMaintenance(id);
    }
  };
  
  const completeScheduledMaintenance = (id: string, completionData: any) => {
    if (!profile) return;
    const store = userProfileWarehouse as any;
    if (store.getState().completeScheduledMaintenance) {
      store.getState().completeScheduledMaintenance(id, completionData);
    }
  };
  
  // Sync methods for bidirectional integration
  const syncVehiclesFromContext = (vehicles: VehicleReference[]) => {
    if (!profile || !vehicles.length) return;
    
    // This allows vehicles created outside the warehouse to be synced back
    const existingIds = new Set(profile.vehicles.map(v => v.id));
    
    // Only add vehicles that don't already exist in the profile
    const newVehicles = vehicles.filter(v => !existingIds.has(v.id));
    
    if (newVehicles.length) {
      console.log(`Syncing ${newVehicles.length} new vehicles from context to profile warehouse`);
      
      // Add each vehicle to the warehouse
      for (const vehicle of newVehicles) {
        addVehicle({
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          nickname: vehicle.nickname,
          vin: vehicle.vin,
          status: vehicle.status,
          primaryImage: vehicle.primaryImage
        });
      }
    }
    
    // Also update existing vehicles if needed
    const existingVehicles = vehicles.filter(v => existingIds.has(v.id));
    for (const vehicle of existingVehicles) {
      const profileVehicle = profile.vehicles.find(v => v.id === vehicle.id);
      if (profileVehicle && 
          (profileVehicle.make !== vehicle.make || 
           profileVehicle.model !== vehicle.model || 
           profileVehicle.year !== vehicle.year || 
           profileVehicle.nickname !== vehicle.nickname || 
           profileVehicle.status !== vehicle.status)) {
        
        console.log(`Updating vehicle in profile warehouse: ${vehicle.make} ${vehicle.model}`);
        updateVehicle(vehicle.id, {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          nickname: vehicle.nickname,
          status: vehicle.status,
          primaryImage: vehicle.primaryImage
        });
      }
    }
  };
  
  const syncDrivesFromContext = (drives: DriveRecord[]) => {
    if (!profile || !drives.length) return;
    
    // This allows drives created outside the warehouse to be synced back
    const existingIds = new Set(profile.drives.map(d => d.id));
    
    // Only add drives that don't already exist in the profile
    const newDrives = drives.filter(d => !existingIds.has(d.id));
    
    if (newDrives.length) {
      console.log(`Syncing ${newDrives.length} new drives from context to profile warehouse`);
      
      // Add each drive to the warehouse
      for (const drive of newDrives) {
        addDrive(drive);
      }
    }
  };
  
  const syncGalleryFromContext = (gallery: GalleryItem[]) => {
    if (!profile || !gallery.length) return;
    
    // This allows gallery items created outside the warehouse to be synced back
    const existingIds = new Set(profile.gallery.map(g => g.id));
    
    // Only add gallery items that don't already exist in the profile
    const newItems = gallery.filter(g => !existingIds.has(g.id));
    
    if (newItems.length) {
      console.log(`Syncing ${newItems.length} new gallery items from context to profile warehouse`);
      
      // Add each gallery item to the warehouse
      for (const item of newItems) {
        addGalleryItem(item);
      }
    }
  };
  
  // Create context value
  const contextValue = {
    profile,
    isLoading,
    error,
    
    // Identity actions
    updateIdentity,
    
    // Preferences actions
    updatePreferences,
    updateWeatherPreferences,
    
    // Vehicle actions
    addVehicle,
    updateVehicle,
    removeVehicle,
    
    // Drive actions
    addDrive,
    updateDrive,
    removeDrive,
    
    // Goal actions
    addGoal,
    updateGoal,
    removeGoal,
    
    // Event actions
    addEvent,
    updateEvent,
    removeEvent,
    
    // Gallery actions
    addGalleryItem,
    updateGalleryItem,
    removeGalleryItem,
    
    // Detailing activities actions
    addDetailingActivity,
    updateDetailingActivity,
    removeDetailingActivity,
    
    // Product and loadout actions
    addFavoriteProduct,
    removeFavoriteProduct,
    addSavedLoadout,
    updateSavedLoadout,
    removeSavedLoadout,
    
    // Podium pursuit actions
    addPodiumTarget,
    updatePodiumTarget,
    removePodiumTarget,
    completePodiumTarget,
    
    // Route actions
    addSavedRoute,
    updateSavedRoute,
    removeSavedRoute,
    addFavoriteRoad,
    removeFavoriteRoad,
    
    // Playlist actions
    addPlaylist,
    updatePlaylist,
    removePlaylist,
    updateSoundSettings,
    
    // Maintenance actions
    addMaintenanceRecord,
    updateMaintenanceRecord,
    removeMaintenanceRecord,
    addScheduledMaintenance,
    updateScheduledMaintenance,
    removeScheduledMaintenance,
    completeScheduledMaintenance,
    
    // Sync methods
    syncVehiclesFromContext,
    syncDrivesFromContext,
    syncGalleryFromContext
  };
  
  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

// Custom hook for using the context
export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

// Export the hook and provider
export default useUserProfile;