import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types for different data components that will feed into the user profile
export interface VehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  nickname?: string;
  image?: string;
  mods?: {
    id: string;
    name: string;
    category: string;
    installDate: string;
  }[];
  maintenanceRecords?: {
    id: string;
    type: string;
    date: string;
    mileage: number;
    notes?: string;
  }[];
}

export interface DriveData {
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
}

export interface GoalData {
  id: string;
  type: 'vehicle' | 'experience' | 'achievement';
  description: string;
  targetDate: string;
  createdAt: string;
  completedAt?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface EventData {
  id: string;
  name: string;
  date: string;
  location: string;
  type: string;
  registered: boolean;
  images?: string[];
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  date: string;
  tags?: string[];
  vehicle?: string;
}

export interface WeatherPreference {
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
}

export interface UserPreference {
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  timeFormat: '12h' | '24h';
  dateFormat: 'mdy' | 'dmy' | 'ymd';
  soundEnabled: boolean;
}

// Main user profile interface that aggregates all data
export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  displayName?: string;
  avatar?: string;
  memberSince: string;
  membershipLevel: 'free' | 'premium' | 'elite';
  bio?: string;
  location?: string;
  
  // Statistics and activity data
  statistics: {
    totalDrives: number;
    totalMiles: number;
    avgDriveTime: number;
    favoriteRoads: string[];
    achievements: number;
    goalsCompleted: number;
    eventsAttended: number;
  };
  
  // User collections from different parts of the app
  vehicles: VehicleData[];
  drives: DriveData[];
  goals: GoalData[];
  events: EventData[];
  gallery: GalleryImage[];
  
  // User settings
  preferences: UserPreference;
  weatherPreferences: WeatherPreference;
  
  // Last activity timestamp
  lastActive: string;
}

// Initial demo data for development
const demoUserProfile: UserProfile = {
  id: '1',
  username: 'GavinGotime',
  displayName: 'GavinGotime',
  avatar: '/assets/images/default-avatar.png',
  memberSince: '2023-04-15',
  membershipLevel: 'premium',
  bio: 'Passionate driver with a love for mountain roads and track days. Always looking for the perfect line.',
  location: 'Atlanta, GA',
  
  statistics: {
    totalDrives: 47,
    totalMiles: 2876,
    avgDriveTime: 68, // minutes
    favoriteRoads: ['Blue Ridge Parkway', 'Tail of the Dragon', 'PCH'],
    achievements: 12,
    goalsCompleted: 8,
    eventsAttended: 5
  },
  
  vehicles: [
    {
      id: 'v1',
      make: 'Porsche',
      model: '911 GT3',
      year: 2021,
      color: 'Racing Yellow',
      nickname: 'Sunshine',
      image: '/assets/gallery/porsche-911.png',
      mods: [
        { id: 'm1', name: 'Sport Exhaust System', category: 'Performance', installDate: '2023-05-12' },
        { id: 'm2', name: 'Carbon Fiber Spoiler', category: 'Exterior', installDate: '2023-06-28' }
      ],
      maintenanceRecords: [
        { id: 'mr1', type: 'Oil Change', date: '2023-07-15', mileage: 12500, notes: 'Used Mobil 1 0W-40' },
        { id: 'mr2', type: 'Brake Pads', date: '2023-08-22', mileage: 15000, notes: 'Replaced with racing compound' }
      ]
    }
  ],
  
  drives: [
    {
      id: 'd1',
      date: '2023-09-05',
      route: 'Mountain Pass',
      distance: 127,
      duration: 120,
      avgSpeed: 63,
      maxSpeed: 85,
      weather: 'Sunny',
      notes: 'Perfect day for driving, road was clear',
      images: ['/assets/gallery/mountain-drive.png']
    },
    {
      id: 'd2',
      date: '2023-08-28',
      route: 'Coastal Highway',
      distance: 98,
      duration: 95,
      avgSpeed: 62,
      maxSpeed: 78,
      weather: 'Partly Cloudy',
      notes: 'Beautiful sunset drive along the coast',
      images: ['/assets/gallery/coastal-drive.png']
    }
  ],
  
  goals: [
    {
      id: 'g1',
      type: 'achievement',
      description: 'Complete advanced driving course',
      targetDate: '2023-12-15',
      createdAt: '2023-07-20',
      status: 'in-progress'
    },
    {
      id: 'g2',
      type: 'vehicle',
      description: 'Install upgraded suspension package',
      targetDate: '2023-10-30',
      createdAt: '2023-06-15',
      completedAt: '2023-09-20',
      status: 'completed'
    }
  ],
  
  events: [
    {
      id: 'e1',
      name: 'Cars & Coffee',
      date: '2023-09-10',
      location: 'Atlanta Motorsports Park',
      type: 'meetup',
      registered: true,
      images: ['/assets/gallery/cars-coffee.png']
    }
  ],
  
  gallery: [
    {
      id: 'img1',
      url: '/assets/gallery/car-sunset.png',
      caption: 'Sunset drive through the mountains',
      date: '2023-08-15',
      tags: ['sunset', 'mountains'],
      vehicle: 'v1'
    },
    {
      id: 'img2',
      url: '/assets/gallery/car-track.png',
      caption: 'First track day with the new setup',
      date: '2023-07-25',
      tags: ['track', 'racing'],
      vehicle: 'v1'
    }
  ],
  
  preferences: {
    theme: 'dark',
    notifications: true,
    timeFormat: '24h',
    dateFormat: 'mdy',
    soundEnabled: true
  },
  
  weatherPreferences: {
    defaultLocation: {
      lat: 33.7490,
      lon: -84.3880,
      name: 'Atlanta, GA'
    },
    units: 'imperial',
    savedLocations: [
      {
        lat: 34.8970,
        lon: -85.4808,
        name: 'Tail of the Dragon'
      }
    ]
  },
  
  lastActive: new Date().toISOString()
};

// Define the type for our store
type UserProfileStore = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addVehicle: (vehicle: VehicleData) => void;
  updateVehicle: (id: string, updates: Partial<VehicleData>) => void;
  removeVehicle: (id: string) => void;
  addDrive: (drive: DriveData) => void;
  updateDrive: (id: string, updates: Partial<DriveData>) => void;
  removeDrive: (id: string) => void;
  addGoal: (goal: GoalData) => void;
  updateGoal: (id: string, updates: Partial<GoalData>) => void;
  removeGoal: (id: string) => void;
  addEvent: (event: EventData) => void;
  updateEvent: (id: string, updates: Partial<EventData>) => void;
  removeEvent: (id: string) => void;
  addGalleryImage: (image: GalleryImage) => void;
  updateGalleryImage: (id: string, updates: Partial<GalleryImage>) => void;
  removeGalleryImage: (id: string) => void;
  updateUserPreferences: (preferences: Partial<UserPreference>) => void;
  updateWeatherPreferences: (preferences: Partial<WeatherPreference>) => void;
  
  // For dev purposes - load demo data
  loadDemoProfile: () => void;
  resetProfile: () => void;
};

// Create a store with persistence
// Custom error handling storage
const safeStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      // Try to clean up space if needed by removing some cached items
      if (value.length > 2000000) { // If data is large, try to optimize it first
        console.warn('Large profile data detected, consider optimizing your data structure');
      }
      
      localStorage.setItem(name, value);
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && 
         (error.name === 'QuotaExceededError' || 
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        
        console.warn('Storage quota exceeded, trying to free up space...');
        
        // Try clearing other caches first
        try {
          // Clear non-essential caches
          localStorage.removeItem('weather-cache');
          localStorage.removeItem('telemetry-cache');
          localStorage.removeItem('temp-storage');
          
          // Try again with cleaned storage
          localStorage.setItem(name, value);
        } catch (secondError) {
          console.error('Still failed to save after clearing caches:', secondError);
        }
      } else {
        console.error('Failed to save to localStorage:', error);
      }
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  }
};

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,
      
      setProfile: (profile: UserProfile) => set({ profile }),
      
      updateProfile: (updates: Partial<UserProfile>) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null
      })),
      
      addVehicle: (vehicle: VehicleData) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          vehicles: [...state.profile.vehicles, vehicle]
        } : null
      })),
      
      updateVehicle: (id: string, updates: Partial<VehicleData> & { _skipBroadcast?: boolean }) => {
        // Extract skipBroadcast flag and remove it from updates to avoid storing it
        const skipBroadcast = updates._skipBroadcast || false;
        const cleanUpdates = { ...updates };
        delete cleanUpdates._skipBroadcast;
        
        // Update the profile state
        return set((state) => ({
          profile: state.profile ? {
            ...state.profile,
            vehicles: state.profile.vehicles.map(v => 
              v.id === id ? { ...v, ...cleanUpdates } : v
            )
          } : null
        }));
      },
      
      removeVehicle: (id: string) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          vehicles: state.profile.vehicles.filter(v => v.id !== id)
        } : null
      })),
      
      addDrive: (drive: DriveData) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          drives: [...state.profile.drives, drive],
          statistics: {
            ...state.profile.statistics,
            totalDrives: state.profile.statistics.totalDrives + 1,
            totalMiles: state.profile.statistics.totalMiles + (drive.distance || 0)
          }
        } : null
      })),
      
      updateDrive: (id: string, updates: Partial<DriveData>) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          drives: state.profile.drives.map(d => 
            d.id === id ? { ...d, ...updates } : d
          )
        } : null
      })),
      
      removeDrive: (id: string) => set((state) => {
        if (!state.profile) return { profile: null };
        
        const driveToRemove = state.profile.drives.find(d => d.id === id);
        const distanceToRemove = driveToRemove?.distance || 0;
        
        return {
          profile: {
            ...state.profile,
            drives: state.profile.drives.filter(d => d.id !== id),
            statistics: {
              ...state.profile.statistics,
              totalDrives: state.profile.statistics.totalDrives - 1,
              totalMiles: state.profile.statistics.totalMiles - distanceToRemove
            }
          }
        };
      }),
      
      addGoal: (goal: GoalData) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          goals: [...state.profile.goals, goal]
        } : null
      })),
      
      updateGoal: (id: string, updates: Partial<GoalData>) => set((state) => {
        if (!state.profile) return { profile: null };
        
        // Count completed goals if the status changed to completed
        let goalsCompleted = state.profile.statistics.goalsCompleted;
        const existingGoal = state.profile.goals.find(g => g.id === id);
        
        if (existingGoal && 
            existingGoal.status !== 'completed' && 
            updates.status === 'completed') {
          goalsCompleted += 1;
        } else if (existingGoal && 
                  existingGoal.status === 'completed' && 
                  updates.status && 
                  updates.status !== 'completed') {
          goalsCompleted -= 1;
        }
        
        return {
          profile: {
            ...state.profile,
            goals: state.profile.goals.map(g => 
              g.id === id ? { ...g, ...updates } : g
            ),
            statistics: {
              ...state.profile.statistics,
              goalsCompleted
            }
          }
        };
      }),
      
      removeGoal: (id: string) => set((state) => {
        if (!state.profile) return { profile: null };
        
        // Check if the goal to remove was completed
        const goalToRemove = state.profile.goals.find(g => g.id === id);
        const wasCompleted = goalToRemove?.status === 'completed';
        
        return {
          profile: {
            ...state.profile,
            goals: state.profile.goals.filter(g => g.id !== id),
            statistics: {
              ...state.profile.statistics,
              goalsCompleted: wasCompleted 
                ? state.profile.statistics.goalsCompleted - 1 
                : state.profile.statistics.goalsCompleted
            }
          }
        };
      }),
      
      addEvent: (event: EventData) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          events: [...state.profile.events, event]
        } : null
      })),
      
      updateEvent: (id: string, updates: Partial<EventData>) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          events: state.profile.events.map(e => 
            e.id === id ? { ...e, ...updates } : e
          )
        } : null
      })),
      
      removeEvent: (id: string) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          events: state.profile.events.filter(e => e.id !== id)
        } : null
      })),
      
      addGalleryImage: (image: GalleryImage) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          gallery: [...state.profile.gallery, image]
        } : null
      })),
      
      updateGalleryImage: (id: string, updates: Partial<GalleryImage>) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          gallery: state.profile.gallery.map(img => 
            img.id === id ? { ...img, ...updates } : img
          )
        } : null
      })),
      
      removeGalleryImage: (id: string) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          gallery: state.profile.gallery.filter(img => img.id !== id)
        } : null
      })),
      
      updateUserPreferences: (preferences: Partial<UserPreference>) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          preferences: {
            ...state.profile.preferences,
            ...preferences
          }
        } : null
      })),
      
      updateWeatherPreferences: (preferences: Partial<WeatherPreference>) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          weatherPreferences: {
            ...state.profile.weatherPreferences,
            ...preferences
          }
        } : null
      })),
      
      loadDemoProfile: () => set({ profile: demoUserProfile }),
      
      resetProfile: () => set({ profile: null, error: null })
    }),
    {
      name: 'user-profile-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);

// Profile data collector that will get called from different parts of the app
class UserProfileCollector {
  // Update last active timestamp
  static updateLastActive() {
    const { profile, updateProfile } = useUserProfileStore.getState();
    if (profile) {
      updateProfile({ lastActive: new Date().toISOString() });
    }
  }
  
  // Log a page view to track user activity
  static logPageView(page: string) {
    this.updateLastActive();
    // Here you would potentially send analytics data to a server
    console.log(`User viewed page: ${page}`);
  }
  
  // Register data from the Weather component
  static collectWeatherData(weatherData: any) {
    // In a real implementation, you might want to store or process this data
    // For now, we'll just update the last active timestamp
    this.updateLastActive();
  }
  
  // Register data from the DriveLogger component
  static collectDriveData(driveData: DriveData) {
    const { addDrive } = useUserProfileStore.getState();
    addDrive({
      ...driveData,
      id: driveData.id || `drive-${Date.now()}`,
      date: driveData.date || new Date().toISOString().split('T')[0]
    });
    this.updateLastActive();
  }
  
  // Register goal data from the GoalSetting component
  static collectGoalData(goalData: Omit<GoalData, 'id' | 'createdAt' | 'status'>) {
    const { addGoal } = useUserProfileStore.getState();
    addGoal({
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    this.updateLastActive();
  }
  
  // Register image data from the Gallery component
  static collectGalleryImage(imageData: Omit<GalleryImage, 'id'>) {
    const { addGalleryImage } = useUserProfileStore.getState();
    addGalleryImage({
      ...imageData,
      id: `img-${Date.now()}`
    });
    this.updateLastActive();
  }
  
  // Collect vehicle data from the Vehicle component
  static collectVehicleData(vehicleData: Omit<VehicleData, 'id'>) {
    const { addVehicle } = useUserProfileStore.getState();
    addVehicle({
      ...vehicleData,
      id: `vehicle-${Date.now()}`
    });
    this.updateLastActive();
  }
  
  // Update stats when a user attends an event
  static recordEventAttendance(eventId: string) {
    const { profile, updateEvent, updateProfile } = useUserProfileStore.getState();
    if (profile) {
      // Mark the event as attended
      updateEvent(eventId, { registered: true });
      
      // Update statistics
      updateProfile({
        statistics: {
          ...profile.statistics,
          eventsAttended: profile.statistics.eventsAttended + 1
        }
      });
      
      this.updateLastActive();
    }
  }
}

export default UserProfileCollector;