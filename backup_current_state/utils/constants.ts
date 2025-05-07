/**
 * Global application constants
 */

/**
 * LocalStorage keys
 * All storage keys should be defined here for consistency
 */
export const STORAGE_KEYS = {
  // Vehicle data warehouse
  VEHICLE_WAREHOUSE: 'paddock20:vehicle-warehouse',
  VEHICLE_BACKUP: 'paddock20:vehicle-warehouse-backup',
  VIN_DECODE_HISTORY: 'paddock20:vin-decode-history',
  
  // User profile data
  USER_PROFILE: 'paddock20:user-profile',
  USER_PREFERENCES: 'paddock20:user-preferences',
  USER_SETTINGS: 'paddock20:user-settings',
  
  // Legacy keys (will be deprecated)
  LEGACY_USER_VEHICLES: 'user-vehicles',
  LEGACY_USER_PROFILE: 'user-profile',
  LEGACY_CAR_DATA: 'car-data',
  LEGACY_VEHICLE_DATA: 'vehicle-data',
  LEGACY_VEHICLE_CONTEXT: 'vehicle-context',
  
  // Media and content
  GALLERY_DATA: 'paddock20:gallery-data',
  DRIVE_JOURNAL: 'paddock20:drive-journal',
  MAINTENANCE_RECORDS: 'paddock20:maintenance-records',
  MODIFICATION_HISTORY: 'paddock20:mod-history',
  JUICE_BOX_DATA: 'paddock20:juice-box-data',
  SPOTIFY_PLAYLISTS: 'paddock20:spotify-playlists',
  
  // App state
  LAST_ACTIVE_PAGE: 'paddock20:last-active-page',
  WEATHER_CACHE: 'paddock20:weather-cache',
  SESSION_STATE: 'paddock20:session-state',
  THEME_SETTINGS: 'paddock20:theme-settings'
};

/**
 * API endpoints and urls
 */
export const API_ENDPOINTS = {
  VIN_DECODER: 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/',
  WEATHER_API: 'https://api.openweathermap.org/data/2.5/weather',
  ACCU_WEATHER_API: 'https://dataservice.accuweather.com/forecasts/v1/daily/5day/',
  SPOTIFY_API: 'https://api.spotify.com/v1',
  GEOCODING_API: 'https://api.openweathermap.org/geo/1.0/direct'
};

/**
 * Validation constants
 */
export const VALIDATION = {
  VIN_REGEX: /^[A-HJ-NPR-Z0-9]{17}$/i,
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  LICENSE_PLATE_REGEX: /^[A-Z0-9 -]{1,10}$/i,
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 32
};

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_OBD_INTEGRATION: false,
  ENABLE_SPOTIFY_INTEGRATION: true,
  ENABLE_WEATHER_STATION: true,
  ENABLE_VEHICLE_STATUS_TRACKING: true, // Active/Sold tracking
  ENABLE_RICH_MEDIA_DOCS: true, // Photos, videos, documents, voice notes
  ENABLE_F1_TELEMETRY: true
};

/**
 * UI Constants
 */
export const UI = {
  COLORS: {
    PRIMARY: '#08c519', // GoTime green
    SECONDARY: '#1f9ff6', // Carolina blue
    DARK_BG: '#111111', // Dark carbon fiber
    DARK_ACCENT: '#1e1e1e', // Darker shade
    LIGHT_ACCENT: '#e0e0e0', // Light accents
    SUCCESS: '#08c519',
    WARNING: '#f6ad1f',
    ERROR: '#f62d1f',
    INFO: '#1f9ff6'
  },
  ANIMATION: {
    STANDARD_DURATION: 300,
    SLOW_DURATION: 500,
    FAST_DURATION: 150
  }
};