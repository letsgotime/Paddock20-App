/**
 * Drive log entry recording a completed drive
 */
export interface DriveLog {
  id: string;
  userId: string;
  vehicleId: string;
  date: string;
  timestamp: string;
  title?: string;
  startLocation: string;
  endLocation: string;
  startTimestamp?: string;
  endTimestamp?: string;
  route?: string; // Route ID if this drive used a saved route
  distance?: number; // Distance in miles/km
  durationMinutes?: number;
  experienceType?: 'drive' | 'track_day' | 'road_trip' | 'car_show' | 'maintenance_drive' | 'custom';
  customExperienceType?: string; // For custom experience types
  venue?: string; // Venue or track name for track days
  
  // Additional metadata
  weatherConditions?: WeatherConditions;
  routeConditions?: RouteConditions;
  waypoints?: WaypointLocation[];
  vehicleSettings?: VehicleSettings;
  
  // User input
  notes?: string;
  rating?: number; // User rating 1-5
  photos?: string[];
  videos?: string[];

  // Metrics and performance data
  performance?: PerformanceData;
  fuelEconomy?: number; // MPG or L/100km
  fuelCost?: number;
  topSpeed?: number;
  averageSpeed?: number;
  maxRPM?: number;
  
  // Mood and energy tracking
  moodEnergy?: {
    mood: number; // 1-10
    energy: number; // 1-10
    focus: number; // 1-10
    enjoyment: number; // 1-10
    notes?: string;
  };
  
  // Route characteristics and analytics
  routeCharacteristics?: {
    terrainType: string;
    roadType: string;
    curvature: number; // 1-10 with 10 being very curvy
    elevation: number; // Total elevation change in feet/meters
    scenicRating?: number; // 1-10
    trafficLevel?: number; // 1-10
    surfaceQuality?: number; // 1-10
  };
  
  // Flags and metadata
  isFromRoutePlanner: boolean;
  isFavorite?: boolean;
  isPublic?: boolean;
  isCompetitive?: boolean; // For track days or timed runs
  isPastExperience?: boolean; // For experiences logged after they occurred
}

/**
 * Waypoint along a route
 */
export interface WaypointLocation {
  latitude: number;
  longitude: number;
  name?: string;
  timestamp?: string;
  elevation?: number;
  type?: 'start' | 'end' | 'stop' | 'waypoint' | 'pointOfInterest';
  duration?: number; // Time spent at this waypoint in minutes
  notes?: string;
  photos?: string[];
}

/**
 * Weather conditions during a drive
 */
export interface WeatherConditions {
  temperature?: number;
  conditions?: string; // e.g., "Sunny", "Rainy"
  windSpeed?: number;
  windDirection?: string;
  precipitation?: number;
  humidity?: number;
  visibility?: number;
  pressure?: number;
  sunrise?: string;
  sunset?: string;
  uvIndex?: number;
  icon?: string; // Weather icon code
}

/**
 * Route conditions during a drive
 */
export interface RouteConditions {
  roadType?: string[]; // e.g., ["highway", "mountain"]
  surfaceType?: string; // e.g., "asphalt", "gravel"
  surfaceCondition?: string; // e.g., "dry", "wet", "icy"
  trafficDensity?: number; // 1-10 scale
  visibility?: string; // e.g., "clear", "foggy"
  hazards?: string[];
  constructionZones?: boolean;
  tollRoads?: boolean;
}

/**
 * Vehicle settings during a drive
 */
export interface VehicleSettings {
  drivingMode?: string; // e.g., "Sport", "Comfort", "Eco"
  tirePressureAdjustment?: number;
  transmission?: string; // e.g., "Auto", "Manual", "Sport Mode"
  suspensionSetting?: string;
  engineMap?: string;
  tireCompound?: string;
  aerodynamicsConfiguration?: string;
  powerLimitations?: boolean;
  stabilityControl?: boolean;
  tractionControl?: boolean;
}

/**
 * Performance data collected during a drive
 */
export interface PerformanceData {
  topSpeed: number;
  averageSpeed: number;
  maxAcceleration?: number; // g-force
  maxBraking?: number; // g-force
  maxLateralG?: number; // g-force during cornering
  averageRPM?: number;
  maxRPM?: number;
  gearChanges?: number;
  brakeApplications?: number;
  throttleProfile?: number[]; // Throttle position samples (%)
  speedProfile?: number[]; // Speed samples over time
  gForceMap?: { x: number; y: number }[]; // Lateral and longitudinal g-force plot
  lapTimes?: number[]; // For track days
  sectors?: {
    name: string;
    time: number;
    distance: number;
  }[];
}

/**
 * Altitude data for a drive
 */
export interface AltitudeData {
  minElevation: number;
  maxElevation: number;
  totalAscent: number;
  totalDescent: number;
  elevationProfile: { distance: number; elevation: number }[];
}

/**
 * Route characteristics data 
 */
export interface RouteCharacteristics {
  corneringDensity: number; // Number of corners per mile/km
  averageCornerRadius: number;
  maxGrade: number; // Maximum incline/decline percentage
  surfaceTypes: { type: string; percentage: number }[]; // Breakdown of surface types
  technicality: number; // 1-10 rating of technical difficulty
  scenicValue: number; // 1-10 rating of scenic quality
  trafficDensity: number; // 1-10 rating of typical traffic
  popularity: number; // 1-10 rating among other drivers
}