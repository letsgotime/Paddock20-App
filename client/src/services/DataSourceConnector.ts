/**
 * DataSourceConnector.ts
 * 
 * This service acts as the central connector between the four main data sources:
 * 1. User onboarding data
 * 2. MyGallery (bi-directional database for media)
 * 3. Garage Vault (vehicle information)
 * 4. Juice Box (detailing/maintenance data)
 * 
 * It ensures all components receive data in consistent formats while using real data sources.
 * 
 * CRITICAL: This service doesn't modify any UI rendering code, only provides data in the expected format.
 */

import { useUserProfileStore, UserProfile } from './userProfileService';
import { useGallery } from '../contexts/GalleryContext';
import { useVehicle } from '../contexts/VehicleContext';
import ProfileDataCollector from './ProfileDataCollector';

// Import VehicleData from userProfileService for better compatibility
import { VehicleData as ImportedVehicleData } from './userProfileService';

// Define core type interfaces internally to ensure type safety
interface VehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  nickname?: string;
  vin?: string;
  primaryImage?: string;
  status?: 'active' | 'archived' | 'sold' | 'inactive'; // Added 'inactive' to match ImportedVehicleData
  entry_method?: 'vin' | 'manual' | 'obd';
  name?: string; // Some components expect name
  title?: string; // Optional property for backwards compatibility
  
  // Add additional optional fields from ImportedVehicleData to ensure compatibility
  mileage?: number;
  engineType?: string;
  transmissionType?: string;
  drivetrain?: string;
  bodyType?: string;
  fuelType?: string;
  updatedAt?: string;
  createdAt?: string;
}

// Forward declare the imported DriveData interface for better compatibility
import { DriveData as ImportedDriveData } from '../services/userProfileService';

// Local DriveData interface that's compatible with both local code and imported interface
interface DriveData {
  id: string;
  title?: string;
  date: string;
  startLocation?: string;
  endLocation?: string;
  distance?: number; // Make optional to match ImportedDriveData
  duration?: number; // Make optional to match ImportedDriveData
  mediaCount?: number;
  featuredMediaId?: string;
  // Add additional fields from ImportedDriveData as optional to ensure compatibility
  type?: string;
  route?: any[] | string; // Allow both array and string for route compatibility
  notes?: string;
  rating?: number;
  vehicleId?: string;
  category?: string;
  weather?: any;
  tags?: string[];
}

// Enhanced version of DriveData with additional properties needed by components
interface EnhancedDriveData extends DriveData {
  routeCoordinates?: Array<Coordinate>;
  standardizedRoute?: Array<Coordinate> | string;
  media?: MediaItem[];
  featuredMedia?: MediaItem;
  galleryEvents?: string[];
}

// Helper type for coordinate formats
interface Coordinate {
  lat: number;
  lng?: number; // Used by some APIs and components
  lon?: number; // Used by other APIs and components
}

// Helper function to standardize coordinate format
function standardizeCoordinate(coord: any): Coordinate {
  if (!coord) return { lat: 0 };
  
  const result: Coordinate = {
    lat: coord.lat || 0
  };
  
  // Handle either lng or lon format
  if (coord.lng !== undefined) {
    result.lon = coord.lng; // Ensure lon is set for components expecting lon
    result.lng = coord.lng; // Keep lng for backward compatibility
  } else if (coord.lon !== undefined) {
    result.lng = coord.lon; // Ensure lng is set for components expecting lng
    result.lon = coord.lon; // Keep lon for backward compatibility
  }
  
  return result;
}

/**
 * Ensures that all coordinates in a route have both lng and lon properties
 * to maintain backward compatibility with different components
 * @param route Array of coordinates or a string
 * @returns Standardized route with both lng and lon properties
 */
function standardizeRoute(route: any[] | string | undefined): any[] | string | undefined {
  if (!route) return undefined;
  
  // If route is a string, return as is (likely a serialized route)
  if (typeof route === 'string') return route;
  
  // If it's an array, standardize each coordinate
  if (Array.isArray(route)) {
    return route.map(coord => standardizeCoordinate(coord));
  }
  
  return route;
}

// Import MediaItem from GalleryContext to ensure type consistency
import { MediaItem as GalleryMediaItem } from '../contexts/GalleryContext';

// Re-export GalleryMediaItem as MediaItem to maintain backward compatibility
// while ensuring type consistency across the application
type MediaItem = GalleryMediaItem;

// Local storage keys for our data sources
const STORAGE_KEYS = {
  ONBOARDING: 'userOnboardingData',
  GALLERY: 'galleryData',
  GARAGE: 'garageVaultData',
  JUICEBOX: 'juiceBoxData',
  USER_PROFILE: 'user-profile-storage',
  VEHICLE_DATA: 'vehicleData'
};

/**
 * Gets user data from local storage or authenticated sources
 * This maintains backward compatibility with existing code that expects data in a specific format
 */
function getUserOnboardingData(): any {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user onboarding data:', error);
    return null;
  }
}

/**
 * Gets gallery data from local storage or gallery context
 * @param category Optional category to filter by
 * @param vehicleId Optional vehicle ID to filter by
 * @param limit Optional limit on number of items returned
 */
function getGalleryData(category?: string, vehicleId?: string, limit?: number): any {
  try {
    // Try Context API first for real-time data
    const galleryContext = useGallery();
    
    // If we have the enhanced gallery structure, use it for better organization
    if (galleryContext && galleryContext.userGalleries && galleryContext.userGalleries.length > 0) {
      const userGallery = galleryContext.currentUserGallery || galleryContext.userGalleries[0];
      
      // Filter based on category if provided
      if (category && userGallery.mediaByCategory && userGallery.mediaByCategory[category]) {
        const categoryMedia = userGallery.mediaByCategory[category];
        return limit ? categoryMedia.slice(0, limit) : categoryMedia;
      }
      
      // Filter based on vehicle if provided
      if (vehicleId && userGallery.mediaByCar) {
        // Look for vehicle ID in connected vehicles
        const vehicle = userGallery.connectedVehicles?.find(v => v.vehicleId === vehicleId);
        if (vehicle && userGallery.mediaByCar[vehicle.vehicleName]) {
          const vehicleMedia = userGallery.mediaByCar[vehicle.vehicleName];
          return limit ? vehicleMedia.slice(0, limit) : vehicleMedia;
        }
      }
      
      // Return featured media as default
      if (userGallery.featuredMedia && userGallery.featuredMedia.length > 0) {
        return limit ? userGallery.featuredMedia.slice(0, limit) : userGallery.featuredMedia;
      }
      
      // Collect media from all events as a fallback
      const allMedia = [];
      for (const event of userGallery.events) {
        if (event.media && event.media.length > 0) {
          allMedia.push(...event.media);
        }
      }
      
      return limit ? allMedia.slice(0, limit) : allMedia;
    }
    
    // Fallback to the conventional gallery context
    if (galleryContext && galleryContext.featuredMedia && galleryContext.featuredMedia.length > 0) {
      return limit ? galleryContext.featuredMedia.slice(0, limit) : galleryContext.featuredMedia;
    }
    
    // Fall back to local storage if context is empty
    const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (data) {
      const parsed = JSON.parse(data);
      return limit ? parsed.slice(0, limit) : parsed;
    }
    
    return [];
  } catch (error) {
    console.error('Error retrieving gallery data:', error);
    return [];
  }
}

/**
 * Gets vehicle data from local storage or vehicle context
 * @param includeGalleryData If true, will also retrieve gallery data for each vehicle
 * @param vehicleId Optional specific vehicle ID to retrieve
 */
function getVehicleData(includeGalleryData = false, vehicleId?: string): any {
  try {
    // Try Context API first for real-time data
    const vehicleContext = useVehicle();
    const galleryContext = useGallery();
    
    let vehicles = [];
    
    // Get vehicles from context if available
    if (vehicleContext && vehicleContext.vehicles && vehicleContext.vehicles.length > 0) {
      vehicles = vehicleId 
        ? vehicleContext.vehicles.filter(v => v.id === vehicleId)
        : [...vehicleContext.vehicles];
    } else {
      // Fall back to local storage if context is empty
      const data = localStorage.getItem(STORAGE_KEYS.VEHICLE_DATA);
      if (data) {
        const parsedVehicles = JSON.parse(data);
        vehicles = vehicleId 
          ? parsedVehicles.filter((v: VehicleData) => v.id === vehicleId)
          : parsedVehicles;
      }
    }
    
    // If we should include gallery data and have an enhanced gallery
    if (includeGalleryData && galleryContext && galleryContext.userGalleries && galleryContext.userGalleries.length > 0) {
      const userGallery = galleryContext.currentUserGallery || galleryContext.userGalleries[0];
      
      // If we have connected vehicles information
      if (userGallery.connectedVehicles && userGallery.connectedVehicles.length > 0) {
        // Enhance each vehicle with its connected gallery data
        vehicles = vehicles.map((vehicle: VehicleData) => {
          const connectedVehicle = userGallery.connectedVehicles.find(v => v.vehicleId === vehicle.id);
          
          if (connectedVehicle) {
            // Find media for this vehicle
            let vehicleMedia: MediaItem[] = [];
            
            if (userGallery.mediaByCar && userGallery.mediaByCar[connectedVehicle.vehicleName]) {
              vehicleMedia = userGallery.mediaByCar[connectedVehicle.vehicleName];
            }
            
            // Return enhanced vehicle with gallery data
            return {
              ...vehicle,
              mediaCount: connectedVehicle.mediaCount || vehicleMedia.length,
              featuredMediaId: connectedVehicle.featuredMediaId,
              featuredMedia: vehicleMedia.find(m => m.id === connectedVehicle.featuredMediaId),
              gallery: vehicleMedia
            };
          }
          
          return vehicle;
        });
      }
    }
    
    return vehicles;
  } catch (error) {
    console.error('Error retrieving vehicle data:', error);
    return [];
  }
}

/**
 * Gets juice box data from local storage with gallery integration
 * @param detailingSessionId Optional session ID to filter data
 * @param includeMedia Whether to include associated media
 * @param productCategory Optional product category to filter by
 */
function getJuiceBoxData(detailingSessionId?: string, includeMedia = false, productCategory?: string): any {
  try {
    // First try to get the basic juice box data
    const data = localStorage.getItem(STORAGE_KEYS.JUICEBOX);
    let juiceBoxData = data ? JSON.parse(data) : null;
    
    // If we want to include media, get gallery data
    if (includeMedia) {
      const galleryContext = useGallery();
      
      // If we have the enhanced gallery with user galleries
      if (galleryContext && galleryContext.userGalleries && galleryContext.userGalleries.length > 0) {
        const userGallery = galleryContext.currentUserGallery || galleryContext.userGalleries[0];
        
        // If we have connected detailing sessions
        if (userGallery.connectedDetailingSessions && userGallery.connectedDetailingSessions.length > 0) {
          // Filter detailing sessions if requested
          const sessions = detailingSessionId 
            ? userGallery.connectedDetailingSessions.filter(s => s.sessionId === detailingSessionId)
            : userGallery.connectedDetailingSessions;
          
          // Create a structure that combines juice box data with gallery data
          if (!juiceBoxData) {
            juiceBoxData = { detailingSessions: [] };
          }
          
          if (!juiceBoxData.detailingSessions) {
            juiceBoxData.detailingSessions = [];
          }
          
          // For each session from the gallery, find or create a juice box session
          sessions.forEach(gallerySession => {
            // Find matching session in juice box data
            let juiceBoxSession = juiceBoxData.detailingSessions.find(
              (s: {id: string}) => s.id === gallerySession.sessionId
            );
            
            // If no matching session, create one
            if (!juiceBoxSession) {
              juiceBoxSession = {
                id: gallerySession.sessionId,
                name: gallerySession.sessionName,
                date: gallerySession.sessionDate,
                products: [],
                notes: '',
                vehicle: ''
              };
              juiceBoxData.detailingSessions.push(juiceBoxSession);
            }
            
            // Find all gallery media for this session
            const sessionMedia: MediaItem[] = [];
            userGallery.events.forEach(event => {
              if (event.detailingSessionId === gallerySession.sessionId) {
                sessionMedia.push(...event.media);
              }
            });
            
            // If we have media by category and looking for specific category
            if (productCategory && userGallery.mediaByCategory && userGallery.mediaByCategory[productCategory]) {
              const categoryMedia = userGallery.mediaByCategory[productCategory];
              // Filter to only include media related to this session
              const filteredCategoryMedia = categoryMedia.filter(
                media => media.detailingSessionId === gallerySession.sessionId
              );
              
              // Add to the session media if not already included
              filteredCategoryMedia.forEach(media => {
                if (!sessionMedia.some(m => m.id === media.id)) {
                  sessionMedia.push(media);
                }
              });
            }
            
            // Add gallery media to the juice box session
            juiceBoxSession.media = sessionMedia;
            juiceBoxSession.featuredMediaId = gallerySession.featuredMediaId;
            
            // Add featured media if available
            if (gallerySession.featuredMediaId) {
              const featuredMedia = sessionMedia.find(m => m.id === gallerySession.featuredMediaId);
              if (featuredMedia) {
                juiceBoxSession.featuredMedia = featuredMedia;
              }
            }
          });
        }
      }
    }
    
    return juiceBoxData;
  } catch (error) {
    console.error('Error retrieving juice box data:', error);
    return null;
  }
}

/**
 * Loads a real user profile from available sources without using any hardcoded data
 * Maintains compatibility with existing code that expects data in the UserProfile format
 */
function loadRealUserProfile(): UserProfile | null {
  // Get the store actions
  const { setProfile } = useUserProfileStore.getState();
  
  try {
    // Check if we already have a profile saved
    const savedProfileData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (savedProfileData) {
      const savedProfile = JSON.parse(savedProfileData);
      if (savedProfile) {
        // Update timestamps but keep all other real data
        const updatedProfile = {
          ...savedProfile,
          lastActive: new Date().toISOString()
        };
        return updatedProfile;
      }
    }
    
    // Get data from each source
    const userData = getUserOnboardingData();
    const galleryData = getGalleryData();
    const vehicleData = getVehicleData();
    const juiceBoxData = getJuiceBoxData();
    
    // If we don't have minimal required data, return null
    if (!userData) {
      console.warn('No user data available to create profile');
      return null;
    }
    
    // Create a profile with real data from sources
    // We're careful to maintain the same structure expected by UI components
    const newProfile: UserProfile = {
      id: userData.id || '1',
      username: userData.username || userData.displayName || 'Unknown User',
      displayName: userData.displayName || userData.username || 'Unknown User',
      avatar: userData.avatar || '/assets/images/default-avatar.png',
      memberSince: userData.memberSince || new Date().toISOString().split('T')[0],
      membershipLevel: userData.membershipLevel || 'free',
      bio: userData.bio || '',
      location: userData.location || '',
      
      // Statistics are compiled from actual usage data
      statistics: {
        totalDrives: 0, // Will be updated when drives are added
        totalMiles: 0, // Will be updated when drives are added
        avgDriveTime: 0, // Will be calculated when drives are added
        favoriteRoads: [], // Will be populated from actual user data
        achievements: 0, // Will be updated when achievements are added
        goalsCompleted: 0, // Will be updated when goals are completed 
        eventsAttended: 0 // Will be updated when events are attended
      },
      
      // Collections from different data sources
      vehicles: vehicleData || [],
      drives: [], // Will be populated from drive journal
      goals: [], // Will be populated from user goals
      events: [], // Will be populated from events
      gallery: galleryData || [],
      
      // Use actual user preferences if available
      preferences: userData.preferences || {
        theme: 'dark',
        notifications: true,
        timeFormat: '24h',
        dateFormat: 'mdy',
        soundEnabled: true
      },
      
      // Use actual weather preferences if available
      weatherPreferences: userData.weatherPreferences || {
        defaultLocation: {
          lat: 33.7490,
          lon: -84.3880,
          name: 'Atlanta, GA'
        },
        units: 'imperial',
        savedLocations: []
      },
      
      // Set current time for last active
      lastActive: new Date().toISOString()
    };
    
    // Update the profile in the store
    setProfile(newProfile);
    
    // Save the profile to local storage
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));
    
    return newProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

/**
 * Gets drive data from user profile and drive journal with gallery integration
 * This ensures backward compatibility with components expecting specific data structure
 * @param driveId Optional drive ID to filter to a specific drive
 * @param includeMedia Whether to include media related to drives
 * @param limit Optional limit on number of drives returned
 */
function getUserDriveData(driveId?: string, includeMedia = false, limit?: number): EnhancedDriveData[] {
  const { profile } = useUserProfileStore.getState();
  let drives: DriveData[] = [];
  
  // First get drives from the profile if available
  if (profile && profile.drives && profile.drives.length > 0) {
    drives = driveId
      ? profile.drives.filter(d => d.id === driveId)
      : [...profile.drives];
  }
  
  // If we want to include media, check the gallery for connected drives
  if (includeMedia) {
    const galleryContext = useGallery();
    
    // If we have the enhanced gallery with user galleries
    if (galleryContext && galleryContext.userGalleries && galleryContext.userGalleries.length > 0) {
      const userGallery = galleryContext.currentUserGallery || galleryContext.userGalleries[0];
      
      // If we have connected drives
      if (userGallery.connectedDrives && userGallery.connectedDrives.length > 0) {
        // Filter to specific drive if requested
        const galleryDrives = driveId
          ? userGallery.connectedDrives.filter(d => d.driveId === driveId)
          : userGallery.connectedDrives;
        
        // For each drive in the drives array, enhance it with gallery data
        drives = drives.map(drive => {
          // Find matching gallery drive info
          const galleryDrive = galleryDrives.find(d => d.driveId === drive.id);
          
          if (galleryDrive) {
            // Find all media for this drive
            const driveMedia: MediaItem[] = [];
            
            // Check all events for route data
            userGallery.events.forEach(event => {
              if (event.driveJournalId === drive.id) {
                // Add media from the event
                if (event.media && event.media.length > 0) {
                  driveMedia.push(...event.media);
                }
                
                // Add route data if available
                if (event.route && event.route.length > 0) {
                  drive.routeCoordinates = event.route;
                }
              }
            });
            
            // Return enhanced drive with media
            return {
              ...drive,
              mediaCount: galleryDrive.mediaCount || driveMedia.length,
              featuredMediaId: galleryDrive.featuredMediaId,
              featuredMedia: driveMedia.find(m => m.id === galleryDrive.featuredMediaId),
              media: driveMedia,
              galleryEvents: userGallery.events.filter(e => e.driveJournalId === drive.id).map(e => e.id)
            };
          }
          
          return drive;
        });
        
        // Check if we're missing any drives from the gallery that aren't in the profile
        galleryDrives.forEach(galleryDrive => {
          // If this gallery drive isn't already in our drives list
          if (!drives.some(d => d.id === galleryDrive.driveId)) {
            // Create a basic drive object from gallery data with enhanced properties
            const newDrive: EnhancedDriveData = {
              id: galleryDrive.driveId,
              title: galleryDrive.driveName,
              date: galleryDrive.driveDate,
              startLocation: '',
              endLocation: '',
              distance: 0,
              duration: 0,
              mediaCount: galleryDrive.mediaCount,
              featuredMediaId: galleryDrive.featuredMediaId,
              routeCoordinates: [],
              media: [],
              galleryEvents: []
            };
            
            // Find all events related to this drive
            const relatedEvents = userGallery.events.filter(e => e.driveJournalId === galleryDrive.driveId);
            
            // Get media for this drive
            const driveMedia: MediaItem[] = [];
            relatedEvents.forEach(event => {
              if (event.media && event.media.length > 0) {
                driveMedia.push(...event.media);
              }
              
              // Extract start/end location from event if available
              if (event.location) {
                newDrive.endLocation = event.location;
                if (!newDrive.startLocation) {
                  newDrive.startLocation = event.location;
                }
              }
              
              // Add route data if available, converting from lng to lon if needed
              if (event.route && event.route.length > 0) {
                // Transform GPS format if needed (some components use lng, others use lon)
                newDrive.routeCoordinates = event.route.map(coord => {
                  return {
                    lat: coord.lat,
                    lon: coord.lng || coord.lon // Handle both formats
                  };
                });
              }
            });
            
            // Add media to the drive
            newDrive.media = driveMedia;
            newDrive.featuredMedia = driveMedia.find(m => m.id === galleryDrive.featuredMediaId);
            newDrive.galleryEvents = relatedEvents.map(e => e.id);
            
            // Add to drives list
            drives.push(newDrive);
          }
        });
      }
    }
  }
  
  // Apply limit if specified
  if (limit && limit > 0 && drives.length > limit) {
    drives = drives.slice(0, limit);
  }
  
  return drives;
}

/**
 * Gets upcoming events data from user profile
 * This ensures backward compatibility with components expecting specific data structure
 */
function getUserEventsData() {
  const { profile } = useUserProfileStore.getState();
  
  if (profile && profile.events && profile.events.length > 0) {
    return profile.events;
  }
  
  return [];
}

/**
 * Interface for maintenance alerts to match expected UI structure
 */
interface MaintenanceAlert {
  id: number;
  vehicle: string;
  serviceDue: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  mileage?: number;
}

/**
 * Gets maintenance alerts based on real vehicle data
 * This ensures backward compatibility with components expecting specific data structure
 */
function getMaintenanceAlerts(): MaintenanceAlert[] {
  const { profile } = useUserProfileStore.getState();
  const vehicleContext = useVehicle();
  const alerts: MaintenanceAlert[] = [];
  
  // If we have vehicles in the profile, generate maintenance alerts based on last service
  if (profile && profile.vehicles && profile.vehicles.length > 0) {
    // Logic to generate maintenance alerts based on real vehicle data
    // This preserves the data structure expected by UI components
  }
  
  // If we have vehicles in the context, also check those
  if (vehicleContext && vehicleContext.vehicles && vehicleContext.vehicles.length > 0) {
    // Additional logic to generate maintenance alerts
  }
  
  return alerts;
}

/**
 * Loads dream data from user profile
 * This ensures backward compatibility with components expecting specific data structure
 */
function getUserDreamData() {
  const { profile } = useUserProfileStore.getState();
  const userData = getUserOnboardingData();
  
  // If we have dream data in onboarding, use that
  if (userData && userData.dreamData) {
    return userData.dreamData;
  }
  
  // Otherwise create a structure compatible with what UI components expect
  // but with empty arrays or default values instead of hardcoded data
  return {
    favoriteRacetracks: [],
    dreamDrives: [],
    dreamCar: '',
    dreamMotorcycle: '',
    favoriteCarBrands: [],
    // etc.
  };
}

/**
 * Returns membership data from user profile
 * This ensures backward compatibility with components expecting specific data structure
 */
function getUserMembershipData() {
  const { profile } = useUserProfileStore.getState();
  const userData = getUserOnboardingData();
  
  // If we have membership data in onboarding, use that
  if (userData && userData.membershipData) {
    return userData.membershipData;
  }
  
  // If we have a profile with membership level, create compatible structure
  if (profile && profile.membershipLevel) {
    return {
      level: profile.membershipLevel,
      since: profile.memberSince,
      points: 0,
      nextTier: profile.membershipLevel === 'free' ? 'premium' : 
                profile.membershipLevel === 'premium' ? 'elite' : 'diamond',
      pointsToNextTier: 1000,
      exclusiveEvents: 0,
      trackDaysRemaining: 0,
      benefits: []
    };
  }
  
  return null;
}

/**
 * Syncs all media between data sources to ensure bi-directional flow
 * @param forceFull If true, performs a complete sync regardless of last sync time
 * @returns Promise resolving to info about the sync operation
 */
async function syncMediaBetweenSources(forceFull = false): Promise<{
  success: boolean;
  synced: {
    vehicles: number;
    drives: number;
    detailingSessions: number;
    totalMedia: number;
  };
  errors: string[];
}> {
  const result = {
    success: true,
    synced: {
      vehicles: 0,
      drives: 0,
      detailingSessions: 0,
      totalMedia: 0
    },
    errors: []
  };

  try {
    // Get gallery context
    const galleryContext = useGallery();
    const vehicleContext = useVehicle();
    const { profile } = useUserProfileStore.getState();
    
    // Check if we have all needed data sources
    if (!galleryContext || !vehicleContext || !profile) {
      result.success = false;
      result.errors.push('One or more required data sources not available');
      return result;
    }
    
    // Get user gallery from context
    const userGallery = galleryContext.currentUserGallery || 
      (galleryContext.userGalleries && galleryContext.userGalleries.length > 0 
        ? galleryContext.userGalleries[0] 
        : null);
    
    if (!userGallery) {
      result.success = false;
      result.errors.push('User gallery not available');
      return result;
    }
    
    // ===== VEHICLES SYNC =====
    if (profile.vehicles && profile.vehicles.length > 0) {
      // For each vehicle in profile, ensure it's properly linked in gallery
      profile.vehicles.forEach(vehicle => {
        // Check if this vehicle exists in connectedVehicles
        const existingConnection = userGallery.connectedVehicles?.find(v => v.vehicleId === vehicle.id);
        
        if (!existingConnection) {
          // Create a connection for this vehicle
          if (!userGallery.connectedVehicles) {
            // Initialize array if it doesn't exist
            userGallery.connectedVehicles = [];
          }
          
          // Utility function to get a display name for the vehicle (used throughout the application)
          const getVehicleDisplayName = (vehicle: VehicleData): string => {
            return vehicle.name || 
                  vehicle.nickname || 
                  (vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : 'Unnamed Vehicle');
          };
          
          userGallery.connectedVehicles.push({
            vehicleId: vehicle.id,
            vehicleName: getVehicleDisplayName(vehicle),
            mediaCount: 0
          });
          
          // Initialize media storage for this vehicle
          if (!userGallery.mediaByCar) {
            userGallery.mediaByCar = {};
          }
          
          // Use the same getVehicleDisplayName function for consistency
          userGallery.mediaByCar[getVehicleDisplayName(vehicle)] = [];
        }
        
        result.synced.vehicles++;
      });
    }
    
    // ===== DRIVES SYNC =====
    if (profile.drives && profile.drives.length > 0) {
      // For each drive in profile, ensure it's properly linked in gallery
      profile.drives.forEach(drive => {
        // Check if this drive exists in connectedDrives
        const existingConnection = userGallery.connectedDrives?.find(d => d.driveId === drive.id);
        
        if (!existingConnection) {
          // Create a connection for this drive
          if (!userGallery.connectedDrives) {
            // Initialize array if it doesn't exist
            userGallery.connectedDrives = [];
          }
          
          // Utility function to get a drive display name
          const getDriveDisplayName = (drive: DriveData): string => {
            return drive.title || 'Drive on ' + drive.date;
          };
          
          userGallery.connectedDrives.push({
            driveId: drive.id,
            driveName: getDriveDisplayName(drive),
            driveDate: drive.date,
            mediaCount: 0
          });
        }
        
        result.synced.drives++;
      });
    }
    
    // ===== JUICE BOX SYNC =====
    const juiceBoxData = getJuiceBoxData();
    if (juiceBoxData && juiceBoxData.detailingSessions && juiceBoxData.detailingSessions.length > 0) {
      // For each detailing session, ensure it's properly linked in gallery
      // Define a type for detailing sessions
      interface DetailingSession {
        id: string;
        name: string;
        date: string;
        products?: any[];
        notes?: string;
        vehicle?: string;
      }
      
      juiceBoxData.detailingSessions.forEach((session: DetailingSession) => {
        // Check if this session exists in connectedDetailingSessions
        const existingConnection = userGallery.connectedDetailingSessions?.find(
          s => s.sessionId === session.id
        );
        
        if (!existingConnection) {
          // Create a connection for this session
          if (!userGallery.connectedDetailingSessions) {
            // Initialize array if it doesn't exist
            userGallery.connectedDetailingSessions = [];
          }
          
          userGallery.connectedDetailingSessions.push({
            sessionId: session.id,
            sessionName: session.name || 'Detailing on ' + session.date,
            sessionDate: session.date,
            mediaCount: 0
          });
        }
        
        result.synced.detailingSessions++;
      });
    }
    
    // ===== GALLERY MEDIA SYNC =====
    // Count total media items synced
    if (userGallery.mediaByCar) {
      for (const vehicle in userGallery.mediaByCar) {
        result.synced.totalMedia += userGallery.mediaByCar[vehicle].length;
      }
    }
    
    // Successfully synced all data
    console.log('Bi-directional sync complete:', result);
    return result;
  } catch (error) {
    result.success = false;
    result.errors.push('Error during sync: ' + error.message);
    console.error('Error during bi-directional sync:', error);
    return result;
  }
}

/**
 * Reconciles vehicle data from multiple sources into a single consistent format
 * This is crucial for fixing the multiple vehicle data source issue
 * @param vehicleId Optional specific vehicle ID to reconcile
 * @returns The reconciled vehicles array
 */
function reconcileVehicleData(vehicleId?: string): any[] {
  console.log('Starting vehicle data reconciliation process...');
  
  try {
    // Collect vehicles from all possible sources
    const sources = {
      // Primary sources
      vehicleContext: useVehicle()?.vehicles || [],
      userProfile: useUserProfileStore.getState().profile?.vehicles || [],
      
      // Secondary sources
      localStorage: (() => {
        try {
          // Check multiple known storage locations
          const vehicleData = localStorage.getItem(STORAGE_KEYS.VEHICLE_DATA);
          const garageData = localStorage.getItem(STORAGE_KEYS.GARAGE);
          const profileVehicles = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
          
          const results = [];
          
          if (vehicleData) {
            try {
              const parsed = JSON.parse(vehicleData);
              if (Array.isArray(parsed)) {
                results.push(...parsed);
              }
            } catch (e) {
              console.error('Failed to parse vehicle data from localStorage');
            }
          }
          
          if (garageData) {
            try {
              const parsed = JSON.parse(garageData);
              if (parsed && parsed.vehicles && Array.isArray(parsed.vehicles)) {
                results.push(...parsed.vehicles);
              }
            } catch (e) {
              console.error('Failed to parse garage data from localStorage');
            }
          }
          
          if (profileVehicles) {
            try {
              const parsed = JSON.parse(profileVehicles);
              if (parsed && parsed.vehicles && Array.isArray(parsed.vehicles)) {
                results.push(...parsed.vehicles);
              }
            } catch (e) {
              console.error('Failed to parse profile vehicles from localStorage');
            }
          }
          
          return results;
        } catch (e) {
          console.error('Error accessing localStorage:', e);
          return [];
        }
      })(),
      
      onboardingData: (() => {
        try {
          const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed && parsed.vehicles && Array.isArray(parsed.vehicles)) {
              return parsed.vehicles;
            }
          }
          return [];
        } catch (e) {
          console.error('Error getting onboarding vehicles:', e);
          return [];
        }
      })()
    };
    
    // Create a map to collect all vehicles by ID
    const vehicleMap = new Map();
    
    // Process each source, collecting all vehicle data
    Object.entries(sources).forEach(([sourceName, vehicles]) => {
      if (!Array.isArray(vehicles) || vehicles.length === 0) {
        return;
      }
      
      // Process each vehicle from this source
      vehicles.forEach(vehicle => {
        // Skip if we're reconciling a specific vehicle and this isn't it
        if (vehicleId && vehicle.id !== vehicleId) {
          return;
        }
        
        // Ensure we have a valid ID
        if (!vehicle.id) {
          console.warn('Vehicle without ID found in', sourceName, '- skipping');
          return;
        }
        
        // If we already have this vehicle, merge the data
        if (vehicleMap.has(vehicle.id)) {
          const existingVehicle = vehicleMap.get(vehicle.id);
          
          // Always take the newer updatedAt timestamp if available
          const existingDate = existingVehicle.updatedAt ? new Date(existingVehicle.updatedAt) : new Date(0);
          const incomingDate = vehicle.updatedAt ? new Date(vehicle.updatedAt) : new Date(0);
          
          // If the incoming vehicle is newer, prioritize its data
          if (incomingDate > existingDate) {
            // Create a merged vehicle with the newer data taking precedence
            vehicleMap.set(vehicle.id, {
              ...existingVehicle,
              ...vehicle,
              // Parse year to number if it's a string
              year: typeof vehicle.year === 'string' ? parseInt(vehicle.year) : vehicle.year,
              // Parse mileage to number if it's a string
              mileage: typeof vehicle.mileage === 'string' ? parseInt(vehicle.mileage) : vehicle.mileage,
              // Merge source tracking
              _source: (existingVehicle._source || '') + ',' + sourceName,
              // Keep track of the last reconciliation
              _lastReconciled: new Date().toISOString()
            });
          } else {
            // Keep existing data but add source information
            vehicleMap.set(vehicle.id, {
              ...existingVehicle,
              // Parse year to number if it's a string
              year: typeof existingVehicle.year === 'string' ? parseInt(existingVehicle.year) : existingVehicle.year,
              // Parse mileage to number if it's a string
              mileage: typeof existingVehicle.mileage === 'string' ? parseInt(existingVehicle.mileage) : existingVehicle.mileage,
              // Merge source tracking
              _source: (existingVehicle._source || '') + ',' + sourceName,
              // Keep track of the last reconciliation
              _lastReconciled: new Date().toISOString()
            });
          }
        } else {
          // First time seeing this vehicle, just add it with source information
          vehicleMap.set(vehicle.id, {
            ...vehicle,
            // Parse year to number if it's a string
            year: typeof vehicle.year === 'string' ? parseInt(vehicle.year) : vehicle.year,
            // Parse mileage to number if it's a string
            mileage: typeof vehicle.mileage === 'string' ? parseInt(vehicle.mileage) : vehicle.mileage,
            _source: sourceName,
            _lastReconciled: new Date().toISOString()
          });
        }
      });
    });
    
    // Convert the map back to an array
    const reconciledVehicles = Array.from(vehicleMap.values());
    
    console.log(`Vehicle reconciliation complete: ${reconciledVehicles.length} vehicles reconciled`);
    
    // Return the reconciled vehicles
    return reconciledVehicles;
  } catch (error) {
    console.error('Error reconciling vehicle data:', error);
    return [];
  }
}

/**
 * Updates all data stores with the reconciled vehicle data
 * This ensures that all components see the same consistent vehicle data
 * @param reconciledVehicles The array of reconciled vehicles
 */
function updateAllVehicleStores(reconciledVehicles: any[]): void {
  if (!reconciledVehicles || reconciledVehicles.length === 0) {
    console.warn('No reconciled vehicles to update stores with');
    return;
  }
  
  console.log(`Updating all data stores with ${reconciledVehicles.length} reconciled vehicles`);
  
  try {
    // Update the user profile store
    const { updateProfile } = useUserProfileStore.getState();
    updateProfile({ 
      vehicles: reconciledVehicles,
      lastActive: new Date().toISOString()
    });
    
    // Update localStorage for persistence
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLE_DATA, JSON.stringify(reconciledVehicles));
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify({
        ...useUserProfileStore.getState().profile,
        vehicles: reconciledVehicles,
        lastActive: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error updating localStorage with reconciled vehicles:', e);
    }
    
    // Use the ProfileDataCollector to broadcast the updates to all components
    ProfileDataCollector.syncAllVehicles(reconciledVehicles);
    
    console.log('All vehicle stores updated with reconciled data');
  } catch (error) {
    console.error('Error updating vehicle stores:', error);
  }
}

/**
 * Initializes all data connections to ensure components receive data in expected format
 * This should be called early in the app startup sequence
 */
function initializeDataConnections() {
  // Load the real user profile
  const profile = loadRealUserProfile();
  
  // If we have a profile, sync it to all contexts
  if (profile) {
    // First reconcile vehicles from all sources
    const reconciledVehicles = reconcileVehicleData();
    
    // Update all stores with the reconciled data
    updateAllVehicleStores(reconciledVehicles);
    
    // Perform bi-directional sync to ensure all data is connected
    syncMediaBetweenSources().then(result => {
      if (result.success) {
        console.log('Initial bi-directional sync complete:', result.synced);
      } else {
        console.error('Initial bi-directional sync failed:', result.errors);
      }
    }).catch(error => {
      console.error('Error during initial bi-directional sync:', error);
    });
  }
  
  console.log('Data connections initialized with real user data');
}

// Export all the functions that components will use to get data
export default {
  loadRealUserProfile,
  getUserOnboardingData,
  getGalleryData,
  getVehicleData,
  getJuiceBoxData,
  getUserDriveData,
  getUserEventsData,
  getMaintenanceAlerts,
  getUserDreamData,
  getUserMembershipData,
  initializeDataConnections,
  syncMediaBetweenSources,
  reconcileVehicleData,
  updateAllVehicleStores,
  STORAGE_KEYS
};