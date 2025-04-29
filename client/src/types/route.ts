/**
 * Planned route 
 */
export interface Route {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  
  // Route coordinates and details
  startLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  endLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  waypoints: Waypoint[];
  
  // Route metadata
  distanceMiles: number;
  durationMinutes: number;
  elevationGain?: number;
  elevationLoss?: number;
  
  // Route type and characteristics
  routeType: 'scenic' | 'fastest' | 'curvy' | 'mountain' | 'coastal' | 'custom';
  roadTypes?: string[]; // e.g., "highway", "backroad", "urban"
  surfaceTypes?: string[]; // e.g., "paved", "gravel", "dirt"
  difficultyRating?: number; // 1-10 scale
  scenicRating?: number; // 1-10 scale
  trafficRating?: number; // 1-10 scale (1 being no traffic)
  curvatureRating?: number; // 1-10 scale (10 being very curvy)
  
  // Route visualization
  polyline?: string; // Encoded polyline
  overviewImageUrl?: string; // Image of route map
  thumbnailUrl?: string;
  
  // User customizations
  customizations?: RouteCustomization[];
  
  // Route analytics
  analytics?: {
    totalCorners: number;
    sharpCorners: number;
    elevationProfile: {
      min: number;
      max: number;
      data: [number, number][]; // [distance, elevation] pairs
    };
    segmentBreakdown: {
      type: string;
      distance: number;
      percentage: number;
    }[];
  };
  
  // Usage stats
  timesCompleted?: number;
  averageRating?: number;
  isFavorite?: boolean;
  isPublic?: boolean;
  
  // User recommendations
  recommendedTimeOfDay?: string;
  recommendedWeather?: string;
  recommendedSeason?: string;
  recommendedVehicleTypes?: string[];
  bestExperienceTips?: string[];
  
  // Points of interest
  pointsOfInterest?: PointOfInterest[];
}

/**
 * Waypoint in a planned route
 */
export interface Waypoint {
  id: string;
  name?: string;
  address?: string;
  latitude: number;
  longitude: number;
  stopover: boolean;
  durationMinutes?: number;
  notes?: string;
  type?: 'waypoint' | 'rest_stop' | 'fuel' | 'food' | 'attraction' | 'viewpoint';
  order: number;
}

/**
 * Route customization options
 */
export interface RouteCustomization {
  id: string;
  type: 'avoid' | 'prefer' | 'include' | 'exclude';
  value: string; // e.g., "highways", "tolls", "specific_road"
  specificLocation?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  notes?: string;
}

/**
 * Point of interest along a route
 */
export interface PointOfInterest {
  id: string;
  name: string;
  description?: string;
  category: 'food' | 'fuel' | 'accommodation' | 'attraction' | 'viewpoint' | 'service' | 'other';
  latitude: number;
  longitude: number;
  address?: string;
  distance?: number; // Distance from route in miles/km
  detourTime?: number; // Additional time required to visit in minutes
  rating?: number; // 1-5 scale
  tags?: string[];
  photos?: string[];
  website?: string;
  hours?: string;
  notes?: string;
  isUserAdded: boolean;
}