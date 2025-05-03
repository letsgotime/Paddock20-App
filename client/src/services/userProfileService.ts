interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  profileImage: string | null;
  role: 'user' | 'admin' | 'premium' | null;
}
import { Vehicle } from '../contexts/VehicleContext';
import { AutomotiveWeatherData } from '../contexts/FixedWeatherContext';

// Define the comprehensive user profile data structure
export interface UserProfileData {
  // User identity
  userInfo: {
    id: number;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    profileImage: string | null;
    role: 'user' | 'admin' | 'premium' | null;
    memberSince: string;
    lastLogin: string;
  };
  
  // Vehicle data
  vehicleData: {
    activeVehicle: Vehicle | null;
    totalVehicles: number;
    lastModified: string;
    vehicleHealth: {
      status: string;
      alerts: Array<{
        type: string;
        message: string;
        severity: 'low' | 'moderate' | 'high' | 'critical';
      }>;
    };
  };
  
  // Driving data (real-time and historical)
  drivingData: {
    totalMiles: number;
    yearToDateMiles: number;
    lastDrive: {
      date: string;
      distanceMiles: number;
      durationMinutes: number;
      avgSpeed: number;
    } | null;
    drivingStyle: string;
  };
  
  // Weather data (most recent)
  weatherData: {
    currentConditions: AutomotiveWeatherData | null;
    lastChecked: string;
    savedLocations: string[];
  };
  
  // Module usage stats
  moduleUsage: {
    mostUsed: string[];
    recentlyViewed: string[];
    recommendations: string[];
  };
  
  // Additional telemetry (OBD data if available)
  telemetry: {
    connected: boolean;
    lastReadingTime: string | null;
    engineHealth: number;
    fuelEfficiency: number;
    batteryHealth: number;
    diagnosticCodes: string[];
  };
  
  // User preferences
  preferences: {
    units: 'imperial' | 'metric';
    theme: 'dark' | 'light' | 'auto';
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    privacySettings: {
      shareLocation: boolean;
      shareDrivingData: boolean;
      shareVehicleData: boolean;
    };
  };

  // Activity timeline
  activityTimeline: Array<{
    id: string;
    timestamp: string;
    type: 'drive' | 'maintenance' | 'weather' | 'modification' | 'login' | 'other';
    description: string;
  }>;

  // Achievements and stats
  achievements: {
    badges: string[];
    points: number;
    level: number;
    nextMilestone: string;
    progress: number;
  };
}

/**
 * Aggregates user profile data from multiple context sources
 */
export const aggregateUserProfileData = (
  user: User | null,
  activeVehicle: Vehicle | null,
  vehicles: Vehicle[],
  weatherData: AutomotiveWeatherData | null,
  lastWeatherUpdate: Date | null
): UserProfileData => {
  // Get current date for calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Extract stored preferences
  const storedUnits = localStorage.getItem('paddock20_units') || 'imperial';
  const storedTheme = localStorage.getItem('paddock20_theme') || 'dark';
  const storedNotifications = localStorage.getItem('paddock20_notifications') === 'true';
  const storedSound = localStorage.getItem('paddock20_sound') === 'true';
  
  // Calculate year-to-date mileage from vehicle data
  const calculateYTDMileage = (): number => {
    if (!vehicles || vehicles.length === 0) return 0;
    
    // This is a placeholder calculation - in a real app this would come from actual drive records
    // Here we're simulating it based on the current mileage and assuming a portion is from this year
    return vehicles.reduce((total, vehicle) => {
      // Assume 30% of current mileage was driven this year (just for demo purposes)
      const estimatedYTDMiles = Math.round(vehicle.mileage * 0.3);
      return total + estimatedYTDMiles;
    }, 0);
  };
  
  // Generate the default user info structure
  const defaultUserInfo = {
    id: user?.id || 0,
    username: user?.username || 'Guest User',
    email: user?.email || '',
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    fullName: user?.fullName || user?.username || 'Guest User',
    profileImage: user?.profileImage || null,
    role: user?.role || null,
    memberSince: user ? new Date(Date.now() - 7776000000).toISOString() : '-', // Mock 90 days ago if no date
    lastLogin: new Date().toISOString(),
  };
  
  // Aggregate data from all sources
  return {
    userInfo: defaultUserInfo,
    
    vehicleData: {
      activeVehicle,
      totalVehicles: vehicles?.length || 0,
      lastModified: activeVehicle?.created_at || new Date().toISOString(),
      vehicleHealth: {
        status: activeVehicle?.status || 'Unknown',
        alerts: activeVehicle ? [
          // Example alerts based on vehicle data
          ...(parseInt(activeVehicle.year) < (currentYear - 10) ? [{
            type: 'maintenance',
            message: 'Vehicle age exceeds 10 years, consider comprehensive inspection',
            severity: 'moderate' as 'low' | 'moderate' | 'high' | 'critical'
          }] : []),
          ...(activeVehicle.mileage > 50000 ? [{
            type: 'service',
            message: 'Mileage exceeds 50,000, check transmission fluid',
            severity: 'low' as 'low' | 'moderate' | 'high' | 'critical'
          }] : []),
        ] : [],
      },
    },
    
    drivingData: {
      totalMiles: vehicles?.reduce((total, v) => total + v.mileage, 0) || 0,
      yearToDateMiles: calculateYTDMileage(),
      lastDrive: {
        date: new Date(Date.now() - 259200000).toISOString(), // Mock 3 days ago
        distanceMiles: 28.5,
        durationMinutes: 45,
        avgSpeed: 38,
      },
      drivingStyle: 'Balanced',
    },
    
    weatherData: {
      currentConditions: weatherData,
      lastChecked: lastWeatherUpdate ? lastWeatherUpdate.toISOString() : new Date().toISOString(),
      savedLocations: ['Charlotte, NC', 'Miami, FL'],
    },
    
    moduleUsage: {
      mostUsed: ['Weather Paddock', 'Garage Vault', 'Drive Journal'],
      recentlyViewed: ['Route Planner', 'Weather Paddock', 'Vehicle Mods'],
      recommendations: ['Seasonal Checklist', 'Tire Monitor', 'Maintenance Schedule'],
    },
    
    telemetry: {
      connected: false,
      lastReadingTime: null,
      engineHealth: 92,
      fuelEfficiency: 87,
      batteryHealth: 95,
      diagnosticCodes: [],
    },
    
    preferences: {
      units: storedUnits as 'imperial' | 'metric',
      theme: storedTheme as 'dark' | 'light' | 'auto',
      notificationsEnabled: storedNotifications,
      soundEnabled: storedSound,
      privacySettings: {
        shareLocation: true,
        shareDrivingData: false,
        shareVehicleData: false,
      },
    },
    
    activityTimeline: [
      {
        id: `activity-${Date.now()}-1`,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        type: 'drive',
        description: 'Completed drive to Blue Ridge Mountains',
      },
      {
        id: `activity-${Date.now()}-2`,
        timestamp: new Date(Date.now() - 432000000).toISOString(),
        type: 'maintenance',
        description: 'Changed oil and filter',
      },
      {
        id: `activity-${Date.now()}-3`,
        timestamp: new Date(Date.now() - 604800000).toISOString(),
        type: 'modification',
        description: 'Added new exhaust system',
      },
      {
        id: `activity-${Date.now()}-4`,
        timestamp: new Date(Date.now() - 1209600000).toISOString(),
        type: 'weather',
        description: 'Checked weather for mountain drive route',
      },
    ],
    
    achievements: {
      badges: ['Road Warrior', 'Weather Watcher', 'Maintenance Maven'],
      points: 1250,
      level: 4,
      nextMilestone: 'Curve Commander',
      progress: 65,
    },
  };
};

/**
 * Updates user preferences in local storage
 */
export const updateUserPreferences = (
  preferences: Partial<UserProfileData['preferences']>
): void => {
  if (preferences.units) {
    localStorage.setItem('paddock20_units', preferences.units);
  }
  
  if (preferences.theme) {
    localStorage.setItem('paddock20_theme', preferences.theme);
  }
  
  if (preferences.notificationsEnabled !== undefined) {
    localStorage.setItem('paddock20_notifications', preferences.notificationsEnabled.toString());
  }
  
  if (preferences.soundEnabled !== undefined) {
    localStorage.setItem('paddock20_sound', preferences.soundEnabled.toString());
  }
  
  if (preferences.privacySettings) {
    localStorage.setItem('paddock20_privacy', JSON.stringify(preferences.privacySettings));
  }
};