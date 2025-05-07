/**
 * API Data Warehouse Types
 * 
 * This file defines the core types used by the API Data Warehouse system.
 * It provides a standardized way to interact with different API providers.
 */

/**
 * API categories supported by the data warehouse
 */
export enum APICategory {
  WEATHER = 'weather',
  WEATHER_FORECAST = 'weather_forecast',
  GEOCODING = 'geocoding',
  REVERSE_GEOCODING = 'reverse_geocoding',
  TIME = 'time',
  TIMEZONE = 'timezone',
  AUTOMOTIVE = 'automotive',
  AVIATION = 'aviation',
  MUSIC = 'music',
  OBD = 'obd',
  MAINTENANCE = 'maintenance',
  TIRE = 'tire',
}

/**
 * Standardized API request
 */
export interface APIRequest {
  // Core request properties
  endpoint: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  
  // Optional configuration
  timeout?: number;       // Request timeout in ms
  cacheTTL?: number;      // Cache time-to-live in ms
  cacheable?: boolean;    // Whether result should be cached
  priority?: 'high' | 'normal' | 'low';
}

/**
 * Standardized API response
 */
export interface APIResponse<T> {
  // Core response data
  data: T;
  
  // Metadata
  fromCache?: boolean;
  timestamp?: number;
  providers?: string[];
  latency?: number;
  
  // Error info (if present but request succeeded via fallback)
  warnings?: string[];
}

/**
 * API Provider interface
 * This abstraction allows for easily swapping or cascading between different API providers
 */
export interface APIProvider {
  // Provider metadata
  name: string;
  category: APICategory;
  priority: number;
  defaultCacheTTL?: number;
  
  // Configuration
  timeout?: number;
  rateLimitPerMinute?: number;
  
  // Core provider methods
  execute<T>(request: APIRequest): Promise<APIResponse<T>>;
  isAvailable(): Promise<boolean>;
  
  // Status and health
  getQuotaRemaining?(): Promise<number>;
  getHealthStatus?(): Promise<'healthy' | 'degraded' | 'unavailable'>;
}

/**
 * Weather data specific types
 */
export interface WeatherData {
  location: {
    name: string;
    lat: number;
    lon: number;
    country: string;
    timezone: string;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    weather_description: string;
    weather_icon: string;
    cloud_cover: number;
    visibility: number;
    uv_index: number;
    precipitation: number;
    timestamp: number;
  };
  daily?: Array<{
    date: string;
    temp_min: number;
    temp_max: number;
    weather_description: string;
    weather_icon: string;
    precipitation_chance: number;
    sunrise: number;
    sunset: number;
  }>;
  alerts?: Array<{
    title: string;
    description: string;
    severity: string;
    start: number;
    end: number;
  }>;
  source: string;
}

/**
 * Automotive-specific weather metrics
 */
export interface AutomotiveWeatherMetrics {
  trackSurface: {
    temperature: number;
    condition: string;
    gripLevel: string;
  };
  tireRecommendations: {
    compound: string;
    pressure: {
      frontPsi: number;
      rearPsi: number;
    };
    warmupTimeMinutes: number;
  };
  drivingConditions: {
    visibilityLevel: string;
    windImpact: string;
    sunglareRisk: string;
    hydroplaningRisk: string;
    brakingDistance: {
      percent: number;
      description: string;
    };
    powerDelivery: {
      recommendation: string;
      tractionControlSetting: string;
    };
  };
}

/**
 * Geocoding result
 */
export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  address: {
    country?: string;
    country_code?: string;
    state?: string;
    county?: string;
    city?: string;
    district?: string;
    street?: string;
    postcode?: string;
  };
  boundingbox?: [string, string, string, string];
  type?: string;
  importance?: number;
  source: string;
}

/**
 * Time data
 */
export interface TimeData {
  timestamp: number;
  iso8601: string;
  timezone: {
    id: string;
    name: string;
    abbr: string;
    offset: number;
    isDST: boolean;
  };
  calendar: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
  sun: {
    rise: number;
    set: number;
    noon: number;
    dayLength: number;
  };
  source: string;
}

/**
 * OBD-II Data Interface
 */
export interface OBDData {
  vin?: string;
  timestamp: number;
  speed?: number;
  rpm?: number;
  engineTemp?: number;
  throttlePosition?: number;
  fuelLevel?: number;
  outsideTemp?: number;
  batteryVoltage?: number;
  diagnosticCodes?: Array<{
    code: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  oxygenSensors?: Record<string, number>;
  coolantTemp?: number;
  intakeTemp?: number;
  mafRate?: number;
  timingAdvance?: number;
  source: string;
}

/**
 * Tire Data Interface
 */
export interface TireData {
  timestamp: number;
  position: 'front_left' | 'front_right' | 'rear_left' | 'rear_right';
  pressure: number;
  temperature: number;
  treadDepth?: number;
  wearPattern?: string;
  age?: {
    manufactureDate: string;
    installDate: string;
    mileage: number;
  };
  recommendations?: {
    rotationDue: boolean;
    replacementDue: boolean;
    idealPressure: number;
    notes: string;
  };
  source: string;
}

/**
 * Spotify Music Recommendation Interface
 */
export interface MusicRecommendation {
  timestamp: number;
  context: {
    weatherCondition: string;
    timeOfDay: string;
    drivingMode?: string;
    mood?: string;
  };
  recommendations: Array<{
    trackId: string;
    trackName: string;
    artists: string[];
    albumName: string;
    imageUrl?: string;
    previewUrl?: string;
    durationMs: number;
    popularity: number;
    uri: string;
  }>;
  source: string;
}

/**
 * Aviation Weather Data Interface
 */
export interface AviationWeatherData {
  timestamp: number;
  airport?: {
    icao: string;
    name: string;
    elevation: number;
  };
  metar?: {
    raw: string;
    time: number;
    wind: {
      direction: number;
      speed: number;
      gust?: number;
      variable?: boolean;
    };
    visibility: {
      distance: number;
      unit: string;
    };
    clouds: Array<{
      type: string;
      base: number;
    }>;
    temperature: number;
    dewpoint: number;
    altimeter: number;
    remarks?: string;
    flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  };
  taf?: {
    raw: string;
    forecasts: Array<{
      timeFrom: number;
      timeTo: number;
      wind: {
        direction: number;
        speed: number;
        gust?: number;
      };
      visibility: {
        distance: number;
        unit: string;
      };
      clouds: Array<{
        type: string;
        base: number;
      }>;
      conditions?: string[];
    }>;
  };
  source: string;
}