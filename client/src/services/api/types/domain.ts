/**
 * API Data Warehouse Domain Types
 * 
 * This file defines domain-specific data types used across the API Data Warehouse system.
 * Each type represents a standardized data model for a specific domain.
 */

/**
 * Weather data model
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
  hourly?: Array<{
    timestamp: number;
    temp: number;
    feels_like: number;
    weather_description: string;
    weather_icon: string;
    precipitation_chance: number;
    humidity: number;
    wind_speed: number;
  }>;
  alerts?: Array<{
    title: string;
    description: string;
    severity: string;
    start: number;
    end: number;
    source?: string;
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
 * Geocoding result model
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
 * Time data model
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
 * Vehicle data model
 */
export interface VehicleData {
  vin?: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: {
    type: string;
    displacement: number;
    cylinders: number;
    horsepower?: number;
    torque?: number;
    fuelType: string;
    transmission: string;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    wheelbase: number;
    weight: number;
    cargoVolume?: number;
  };
  performance?: {
    zeroToSixty?: number;
    topSpeed?: number;
    fuelEconomy?: {
      city: number;
      highway: number;
      combined: number;
    };
  };
  source: string;
}

/**
 * OBD-II Data model
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
 * Tire Data model
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
 * Maintenance Record model
 */
export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  date: number;
  mileage: number;
  cost?: number;
  location?: string;
  performedBy?: string;
  parts?: Array<{
    name: string;
    partNumber?: string;
    cost?: number;
    quantity?: number;
  }>;
  notes?: string;
  nextDueDate?: number;
  nextDueMileage?: number;
  attachments?: string[];
  source: string;
}

/**
 * Music Track model
 */
export interface MusicTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration_ms: number;
  explicit: boolean;
  popularity?: number;
  preview_url?: string;
  external_urls?: Record<string, string>;
  album_art?: string;
  source: string;
}

/**
 * Music Playlist model
 */
export interface MusicPlaylist {
  id: string;
  name: string;
  description?: string;
  owner: string;
  public: boolean;
  tracks: MusicTrack[];
  track_count: number;
  duration_ms: number;
  cover_image?: string;
  external_urls?: Record<string, string>;
  source: string;
}

/**
 * Auth User model
 */
export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  roles?: string[];
  permissions?: string[];
  lastLogin?: number;
  metadata?: Record<string, any>;
  provider: string;
  source: string;
}

/**
 * Media Asset model
 */
export interface MediaAsset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  created: number;
  modified: number;
  tags?: string[];
  metadata?: Record<string, any>;
  source: string;
}

/**
 * Aviation Weather model (METAR/TAF)
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

/**
 * Payment data model
 */
export interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  created: number;
  paymentMethod: string;
  description?: string;
  customerId?: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
  source: string;
}

/**
 * Subscription data model
 */
export interface SubscriptionData {
  id: string;
  customerId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  created: number;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  canceledAt?: number;
  endedAt?: number;
  metadata?: Record<string, any>;
  source: string;
}

/**
 * Analytics event model
 */
export interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  deviceInfo?: {
    type: string;
    os: string;
    browser?: string;
    model?: string;
  };
  locationInfo?: {
    country?: string;
    region?: string;
    city?: string;
  };
  properties?: Record<string, any>;
  source: string;
}