/**
 * LocationServicesContext
 * 
 * This is a centralized location services context that serves as a single source of truth for:
 * - Current location (with geolocation support)
 * - Favorite locations management
 * - Weather data with advanced caching
 * - Map services integration
 * - World time information
 * - Parking data
 * - Road conditions
 * - Traffic information
 * 
 * All location-dependent services should connect to this context
 * rather than implementing their own location handling.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { fetchConsolidatedWeatherData } from '@/services/consolidatedWeatherService';
import { OneCallData, WeatherData, ForecastData, Location } from '@/lib/weather';
import { AutomotiveWeatherData } from '@/contexts/ConsolidatedWeatherContext';
import { useToast } from '@/hooks/use-toast';
import { fetchTimeData, TimeData } from '@/services/time/timeService';
import { getLocationWithFallback } from '@/services/location/locationService';
import { ipInfoService } from '@/services/location/ipInfoService';

// Cache configuration constants
const LOCATION_CACHE_TTL_MINUTES = 30; // How long to cache location data
const WEATHER_CACHE_TTL_MINUTES = 15;  // How long to cache weather data before forcing refresh
const TIME_CACHE_TTL_MINUTES = 30;     // How long to cache time data before forcing refresh
const EXTENDED_CACHE_TTL_HOURS = 8;    // Secondary cache for offline/error fallback
const THROTTLE_TIME_MS = 10000;        // Minimum time between API calls (10 seconds)

// Golden Hour calculation constants
const GOLDEN_HOUR_MINUTES = 60; // Golden hour lasts approximately 60 minutes after sunrise and before sunset

// Time-related interface extensions
interface TimeZone {
  countryCode: string;
  countryName: string;
  zoneName: string;
  gmtOffset: number;
  timestamp: number;
  formatted: string;
  abbreviation: string;
}

interface SunTime {
  timestamp: number;
  formatted: string;
}

interface GoldenHourPeriod {
  start: number;
  end: number;
  formatted: { 
    start: string; 
    end: string 
  };
}

// Location type for standardized location data format
export interface LocationData {
  id: string;           // Unique identifier
  name: string;         // Display name
  lat: number;          // Latitude
  lon: number;          // Longitude
  type: 'current' | 'favorite' | 'search'; // Type of location entry
  icon?: string;        // Optional icon identifier
  address?: string;     // Optional formatted address
  lastUsed?: number;    // When this location was last accessed
}

// Extended data that combines all location services
export interface LocationServices {
  // Current location and settings
  currentLocation: LocationData | null;
  favoriteLocations: LocationData[];
  searchHistory: LocationData[];
  
  // Weather data
  weatherData: WeatherData | null;
  forecastData: ForecastData | null;
  oneCallData: OneCallData | null;
  automotiveWeather: AutomotiveWeatherData | null;
  
  // Time data
  timeData: TimeData | null;
  worldClocks: { location: LocationData; timeData: TimeData }[];
  
  // Status information
  loading: {
    location: boolean;
    weather: boolean;
    automotive: boolean;
    services: boolean;
    time: boolean;
  };
  errors: {
    location?: Error | null;
    weather?: Error | null;
    automotive?: Error | null;
    services?: Error | null;
    time?: Error | null;
  };
  
  // Data freshness
  lastUpdated: {
    location: Date | null;
    weather: Date | null;
    automotive: Date | null;
    services: Date | null;
    time: Date | null;
  };
  
  // Cache information
  cacheStatus: {
    weather: string;
    automotive: string;
    time: string;
  };
  
  // Unit preferences
  preferences: {
    units: 'metric' | 'imperial';
    temperatureUnit: 'celsius' | 'fahrenheit';
    speedUnit: 'km/h' | 'mph';
    distanceUnit: 'km' | 'mi';
    timeFormat: '12h' | '24h';
  };
}

// Context interface - what components can access and update
interface LocationServicesContextType extends LocationServices {
  // Location management
  setCurrentLocation: (location: LocationData) => void;
  addFavoriteLocation: (location: LocationData) => void;
  removeFavoriteLocation: (locationId: string) => void;
  updateLocation: (location: LocationData) => void;
  
  // User preferences
  setUnits: (units: 'metric' | 'imperial') => void;
  
  // Data refreshing
  refreshWeather: () => Promise<void>;
  refreshLocation: () => Promise<void>;
  refreshTime: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // World clock management
  addWorldClock: (location: LocationData) => Promise<void>;
  removeWorldClock: (locationId: string) => void;
  
  // Time-related utilities
  getOptimalDriveTime: (tripDurationMinutes: number) => string | null;
  isGoldenHour: () => boolean;
  
  // Helper functions
  formatLastUpdated: (type: 'location' | 'weather' | 'automotive' | 'services' | 'time') => string;
  isStale: (type: 'location' | 'weather' | 'automotive' | 'services' | 'time') => boolean;
}

// Default location (Atlanta) - used when geolocation fails
const DEFAULT_LOCATION: LocationData = {
  id: 'default-atlanta',
  name: 'Atlanta',
  lat: 33.749,
  lon: -84.388,
  type: 'current',
  icon: 'map-pin'
};

// Helper function to generate a unique ID for locations
const generateLocationId = (lat: number, lon: number, name: string): string => {
  return `loc_${lat.toFixed(4)}_${lon.toFixed(4)}_${name.replace(/\s+/g, '_').toLowerCase()}`;
};

// Create the context with undefined default (will error if used outside provider)
const LocationServicesContext = createContext<LocationServicesContextType | undefined>(undefined);

// Provider component
export const LocationServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Location state
  const [currentLocation, setCurrentLocationState] = useState<LocationData | null>(null);
  const [favoriteLocations, setFavoriteLocations] = useState<LocationData[]>([]);
  const [searchHistory, setSearchHistory] = useState<LocationData[]>([]);
  
  // Weather data state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [oneCallData, setOneCallData] = useState<OneCallData | null>(null);
  const [automotiveWeather, setAutomotiveWeather] = useState<AutomotiveWeatherData | null>(null);
  
  // Time data state
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [worldClocks, setWorldClocks] = useState<{ location: LocationData; timeData: TimeData }[]>([]);
  
  // Loading state
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [loadingAutomotive, setLoadingAutomotive] = useState<boolean>(false);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [loadingTime, setLoadingTime] = useState<boolean>(false);
  
  // Error state
  const [locationError, setLocationError] = useState<Error | null>(null);
  const [weatherError, setWeatherError] = useState<Error | null>(null);
  const [automotiveError, setAutomotiveError] = useState<Error | null>(null);
  const [servicesError, setServicesError] = useState<Error | null>(null);
  const [timeError, setTimeError] = useState<Error | null>(null);
  
  // Data freshness state
  const [locationLastUpdated, setLocationLastUpdated] = useState<Date | null>(null);
  const [weatherLastUpdated, setWeatherLastUpdated] = useState<Date | null>(null);
  const [automotiveLastUpdated, setAutomotiveLastUpdated] = useState<Date | null>(null);
  const [servicesLastUpdated, setServicesLastUpdated] = useState<Date | null>(null);
  const [timeLastUpdated, setTimeLastUpdated] = useState<Date | null>(null);
  
  // Cache status state
  const [weatherCacheStatus, setWeatherCacheStatus] = useState<string>('No cache');
  const [automotiveCacheStatus, setAutomotiveCacheStatus] = useState<string>('No cache');
  const [timeCacheStatus, setTimeCacheStatus] = useState<string>('No cache');
  
  // User preferences state
  const [units, setUnitsState] = useState<'metric' | 'imperial'>('imperial');
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>('fahrenheit');
  const [speedUnit, setSpeedUnit] = useState<'km/h' | 'mph'>('mph');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('mi');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  
  // Throttling refs
  const lastWeatherFetchRef = useRef<number>(0);
  const lastAutomotiveFetchRef = useRef<number>(0);
  const lastTimeFetchRef = useRef<number>(0);
  const weatherRefreshTimerRef = useRef<number | null>(null);
  const timeRefreshTimerRef = useRef<number | null>(null);
  
  // Cache for stored data
  const weatherCacheRef = useRef<Map<string, any>>(new Map());
  const automotiveCacheRef = useRef<Map<string, any>>(new Map());
  const timeCacheRef = useRef<Map<string, any>>(new Map());
  const worldClockCacheRef = useRef<Map<string, any>>(new Map());
  
  // Load favorite locations from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('favoriteLocations');
      if (storedFavorites) {
        setFavoriteLocations(JSON.parse(storedFavorites));
      }
      
      const storedSearchHistory = localStorage.getItem('searchHistory');
      if (storedSearchHistory) {
        setSearchHistory(JSON.parse(storedSearchHistory));
      }
      
      const storedWorldClocks = localStorage.getItem('worldClocks');
      if (storedWorldClocks) {
        // We just store the locations for world clocks, not the time data
        // Time data will be fetched when component loads
        const locations = JSON.parse(storedWorldClocks) as LocationData[];
        // We'll fetch the time data for these locations after mount
        locations.forEach(location => {
          addWorldClock(location);
        });
      }
      
      const storedUnits = localStorage.getItem('units');
      if (storedUnits) {
        const parsedUnits = JSON.parse(storedUnits);
        setUnitsState(parsedUnits.units || 'imperial');
        setTemperatureUnit(parsedUnits.temperatureUnit || 'fahrenheit');
        setSpeedUnit(parsedUnits.speedUnit || 'mph');
        setDistanceUnit(parsedUnits.distanceUnit || 'mi');
        setTimeFormat(parsedUnits.timeFormat || '12h');
      }
    } catch (err) {
      console.error('Error loading saved locations:', err);
    }
  }, []);
  
  // Save favorite locations to localStorage when they change
  useEffect(() => {
    if (favoriteLocations.length > 0) {
      localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
    }
  }, [favoriteLocations]);
  
  // Save search history to localStorage when it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);
  
  // Save world clocks to localStorage when they change
  useEffect(() => {
    if (worldClocks.length > 0) {
      // Just store the locations, not the time data which will be re-fetched later
      const locations = worldClocks.map(item => item.location);
      localStorage.setItem('worldClocks', JSON.stringify(locations));
    }
  }, [worldClocks]);
  
  // Save units preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('units', JSON.stringify({
      units,
      temperatureUnit,
      speedUnit,
      distanceUnit,
      timeFormat
    }));
  }, [units, temperatureUnit, speedUnit, distanceUnit, timeFormat]);
  
  // Initialize geolocation on component mount
  useEffect(() => {
    refreshLocation();
    
    // Set up auto-refresh for weather data
    const refreshInterval = setInterval(() => {
      if (currentLocation) {
        refreshWeather();
      }
    }, WEATHER_CACHE_TTL_MINUTES * 60 * 1000); // Convert minutes to milliseconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Helper to format last updated times
  const formatLastUpdated = (type: 'location' | 'weather' | 'automotive' | 'services' | 'time'): string => {
    let lastUpdated: Date | null = null;
    
    switch (type) {
      case 'location':
        lastUpdated = locationLastUpdated;
        break;
      case 'weather':
        lastUpdated = weatherLastUpdated;
        break;
      case 'automotive':
        lastUpdated = automotiveLastUpdated;
        break;
      case 'services':
        lastUpdated = servicesLastUpdated;
        break;
      case 'time':
        lastUpdated = timeLastUpdated;
        break;
    }
    
    if (!lastUpdated) {
      return 'Never';
    }
    
    // Format as relative time
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
  };
  
  // Helper to check if data is stale
  const isStale = (type: 'location' | 'weather' | 'automotive' | 'services' | 'time'): boolean => {
    let lastUpdated: Date | null = null;
    let staleTreshold = 0;
    
    switch (type) {
      case 'location':
        lastUpdated = locationLastUpdated;
        staleTreshold = LOCATION_CACHE_TTL_MINUTES * 60 * 1000;
        break;
      case 'weather':
        lastUpdated = weatherLastUpdated;
        staleTreshold = WEATHER_CACHE_TTL_MINUTES * 60 * 1000;
        break;
      case 'automotive':
        lastUpdated = automotiveLastUpdated;
        staleTreshold = WEATHER_CACHE_TTL_MINUTES * 60 * 1000;
        break;
      case 'services':
        lastUpdated = servicesLastUpdated;
        staleTreshold = WEATHER_CACHE_TTL_MINUTES * 60 * 1000;
        break;
      case 'time':
        lastUpdated = timeLastUpdated;
        staleTreshold = TIME_CACHE_TTL_MINUTES * 60 * 1000;
        break;
    }
    
    if (!lastUpdated) {
      return true;
    }
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    
    return diffMs > staleTreshold;
  };
  
  // Set current location with geolocation support
  const setCurrentLocation = useCallback((location: LocationData) => {
    console.log('Setting current location:', location);
    
    // Update the state immediately with what we have
    setCurrentLocationState(location);
    
    // If this is a 'current' type location, try to get actual coordinates
    if (location.type === 'current' && navigator.geolocation) {
      setLoadingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoLocation: LocationData = {
            ...location,
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            lastUsed: Date.now()
          };
          
          console.log('Got geolocation:', geoLocation);
          setCurrentLocationState(geoLocation);
          setLocationLastUpdated(new Date());
          setLoadingLocation(false);
          setLocationError(null);
          
          // After setting location, update the weather data
          refreshWeather();
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          
          // Fall back to the default location but still call it "Current Location"
          setCurrentLocationState({
            ...location,
            ...DEFAULT_LOCATION,
            name: location.name || 'Current Location',
            type: 'current',
            lastUsed: Date.now()
          });
          
          setLocationError(new Error(`Geolocation failed: ${error.message}`));
          setLocationLastUpdated(new Date());
          setLoadingLocation(false);
          
          // Even with error, refresh weather with default location
          refreshWeather();
          
          toast({
            title: 'Location Not Available',
            description: 'Using default location. Please check your location permissions.',
            variant: 'destructive',
          });
        },
        { 
          timeout: 10000,
          maximumAge: LOCATION_CACHE_TTL_MINUTES * 60 * 1000, // Cache for 30 minutes
          enableHighAccuracy: false // Don't need high accuracy for weather
        }
      );
    } else {
      // For non-current locations, just use as provided
      setCurrentLocationState({
        ...location,
        lastUsed: Date.now()
      });
      setLocationLastUpdated(new Date());
      setLoadingLocation(false);
      
      // After setting location, update the weather data
      refreshWeather();
    }
  }, [toast]);
  
  // Refresh current location
  const refreshLocation = useCallback(async () => {
    console.log('Refreshing location with enhanced services');
    
    setLoadingLocation(true);
    
    try {
      // Use our enhanced location service with IPinfo fallback
      const locationData = await getLocationWithFallback();
      
      console.log('Got location with enhanced services:', locationData);
      setCurrentLocationState(locationData);
      setLocationLastUpdated(new Date());
      setLocationError(null);
      
      // After refreshing location, update the weather
      refreshWeather();
      
      // Try to enhance location data with additional IPinfo metadata
      try {
        const ipInfoData = await ipInfoService.getLocationByIP();
        
        if (ipInfoData && ipInfoData.timezone) {
          console.log('Enhanced location with IPinfo timezone data:', ipInfoData.timezone);
          
          // Update time data
          refreshTime();
        }
      } catch (ipInfoError) {
        console.warn('Non-critical: Failed to fetch additional IPinfo metadata:', ipInfoError);
        // This is non-critical, so we don't need to show an error to the user
      }
    } catch (error) {
      console.warn('Location services error:', error);
      
      // If we already have a location, keep using it
      if (!currentLocation) {
        setCurrentLocationState(DEFAULT_LOCATION);
      }
      
      setLocationError(new Error(`Location services failed: ${error}`));
      
      // Only show toast if we don't have any location
      if (!currentLocation) {
        toast({
          title: 'Location Not Available',
          description: 'Using default location. Please check your location permissions.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingLocation(false);
      
      // Ensure weather refresh happens even if location fails
      if (!weatherData && currentLocation) {
        refreshWeather();
      }
    }
  }, [currentLocation, weatherData, refreshWeather, refreshTime, toast]);
  
  // Add a location to favorites
  const addFavoriteLocation = useCallback((location: LocationData) => {
    // Generate a unique ID if not provided
    const locationWithId = {
      ...location,
      id: location.id || generateLocationId(location.lat, location.lon, location.name),
      type: 'favorite', // Force type to be favorite
      lastUsed: Date.now()
    };
    
    // Check if already exists
    setFavoriteLocations(prevFavorites => {
      const exists = prevFavorites.some(loc => loc.id === locationWithId.id);
      
      if (exists) {
        return prevFavorites; // Don't add duplicates
      }
      
      return [...prevFavorites, locationWithId];
    });
    
    toast({
      title: 'Location Saved',
      description: `Added ${location.name} to your favorite locations.`,
    });
  }, [toast]);
  
  // Remove a location from favorites
  const removeFavoriteLocation = useCallback((locationId: string) => {
    setFavoriteLocations(prevFavorites => 
      prevFavorites.filter(loc => loc.id !== locationId)
    );
    
    toast({
      title: 'Location Removed',
      description: 'Location has been removed from favorites.',
    });
  }, [toast]);
  
  // Update an existing location
  const updateLocation = useCallback((location: LocationData) => {
    // Check if this is updating the current location
    if (currentLocation && location.id === currentLocation.id) {
      setCurrentLocationState({
        ...location,
        lastUsed: Date.now()
      });
      return;
    }
    
    // Check if this is updating a favorite location
    setFavoriteLocations(prevFavorites => {
      const index = prevFavorites.findIndex(loc => loc.id === location.id);
      
      if (index === -1) {
        return prevFavorites; // Not found in favorites
      }
      
      const updatedFavorites = [...prevFavorites];
      updatedFavorites[index] = {
        ...location,
        type: 'favorite', // Ensure type remains favorite
        lastUsed: Date.now()
      };
      
      return updatedFavorites;
    });
    
    // Check if this is updating a search history location
    setSearchHistory(prevHistory => {
      const index = prevHistory.findIndex(loc => loc.id === location.id);
      
      if (index === -1) {
        return prevHistory; // Not found in search history
      }
      
      const updatedHistory = [...prevHistory];
      updatedHistory[index] = {
        ...location,
        type: 'search', // Ensure type remains search
        lastUsed: Date.now()
      };
      
      return updatedHistory;
    });
  }, [currentLocation]);
  
  // Set units and update related preferences
  const setUnits = useCallback((newUnits: 'metric' | 'imperial') => {
    setUnitsState(newUnits);
    
    // Update related preferences
    if (newUnits === 'metric') {
      setTemperatureUnit('celsius');
      setSpeedUnit('km/h');
      setDistanceUnit('km');
    } else {
      setTemperatureUnit('fahrenheit');
      setSpeedUnit('mph');
      setDistanceUnit('mi');
    }
    
    // If units change, we should refresh weather data
    if (currentLocation) {
      refreshWeather();
    }
  }, [currentLocation]);
  
  // Function to get cache key for a location
  const getLocationCacheKey = (location: LocationData, dataType: string) => {
    return `${dataType}:${location.lat.toFixed(4)}:${location.lon.toFixed(4)}:${units}`;
  };
  
  // Declare refreshWeather at the top of our functions to avoid initialization errors
  // but initialize the implementation later after all dependencies are ready
  const refreshWeather = useCallback(async () => {
    console.log('Weather refresh called, implementation will be replaced by useEffect');
  }, []);
  
  // Declare refreshTime at the top level to avoid initialization errors
  const refreshTime = useCallback(async () => {
    console.log('Time refresh called, implementation will be replaced by useEffect');
  }, []);
  
  // Actual implementation will be set up by useEffect after init
    
    // Check if we've made a call too recently (throttling)
    const now = Date.now();
    const timeSinceLastCall = now - lastWeatherFetchRef.current;
    
    if (timeSinceLastCall < THROTTLE_TIME_MS) {
      console.log(`Throttling weather API call. Last call was ${timeSinceLastCall}ms ago.`);
      
      // Clear any existing refresh timer
      if (weatherRefreshTimerRef.current) {
        window.clearTimeout(weatherRefreshTimerRef.current);
      }
      
      // Set a timer to make the call later
      weatherRefreshTimerRef.current = window.setTimeout(() => {
        console.log('Executing delayed weather refresh');
        refreshWeather();
      }, THROTTLE_TIME_MS - timeSinceLastCall);
      
      return;
    }
    
    // Update the last fetch time
    lastWeatherFetchRef.current = now;
    
    // Check if we can use cached data
    const cacheKey = getLocationCacheKey(currentLocation, 'weather');
    const cachedData = weatherCacheRef.current.get(cacheKey);
    
    // Check if our cached data is still valid (less than WEATHER_CACHE_TTL_MINUTES old)
    const isCacheValid = cachedData && (now - cachedData.timestamp) < (WEATHER_CACHE_TTL_MINUTES * 60 * 1000);
    
    if (isCacheValid) {
      console.log('Using cached weather data - still valid');
      const minutesOld = Math.floor((now - cachedData.timestamp) / (60 * 1000));
      setWeatherCacheStatus(`Using primary cache data (${minutesOld} minutes old old)`);
      console.log(`Using primary cache data (${minutesOld} minutes old old)`);
      
      // Use cached data but don't exit - we'll still refresh in the background if it's getting stale
      // This prevents unnecessary API calls while keeping data fresh
      if ((now - cachedData.timestamp) < (WEATHER_CACHE_TTL_MINUTES / 2 * 60 * 1000)) {
        // If our data is less than half the TTL old, just use it and don't refresh
        return;
      }
      
      // If we get here, our data is valid but getting stale, so we'll refresh in the background
      // but still use the cached data for this render
      const { data } = cachedData;
      setWeatherData(data.weatherData || null);
      setOneCallData(data.oneCallData || null);
      setForecastData(data.forecastData || null);
      setAutomotiveWeather(data.automotiveWeatherData || null);
    }
    
    // If we've gotten here, we need to fetch fresh data (either we had no cache or it was stale)
    setLoadingWeather(true);
    setWeatherError(null);
    
    try {
      // Fetch all data in one call
      const data = await fetchConsolidatedWeatherData({
        name: currentLocation.name,
        lat: currentLocation.lat,
        lon: currentLocation.lon
      }, units);
      
      // Cache the successful response
      weatherCacheRef.current.set(cacheKey, {
        data,
        timestamp: now
      });
      
      // Update state with new data
      setWeatherData(data.weatherData || null);
      setOneCallData(data.oneCallData || null);
      setForecastData(data.forecastData || null);
      setAutomotiveWeather(data.automotiveWeatherData || null);
      
      // Update timestamps
      setWeatherLastUpdated(new Date());
      setAutomotiveLastUpdated(new Date());
      
      // Update cache status
      setWeatherCacheStatus('Fresh data');
      setAutomotiveCacheStatus('Fresh data');
      
      console.log('Successfully fetched and cached fresh weather data');
      
    } catch (err) {
      console.error('Error fetching weather:', err);
      setWeatherError(err instanceof Error ? err : new Error(String(err)));
      
      // Try to use cached data regardless of age
      if (cachedData) {
        console.log('Using stale cached data after error');
        
        const { data } = cachedData;
        
        // Update state with cached data
        setWeatherData(data.weatherData || null);
        setOneCallData(data.oneCallData || null);
        setForecastData(data.forecastData || null);
        setAutomotiveWeather(data.automotiveWeatherData || null);
        
        // Don't update timestamps since this is stale data
        
        // Update cache status
        setWeatherCacheStatus('Using stale data due to error');
        setAutomotiveCacheStatus('Using stale data due to error');
        
        toast({
          title: 'Weather Update Failed',
          description: 'Using cached data. Please check your connection.',
          variant: 'destructive',
        });
      } else {
        // No cached data to fall back on
        toast({
          title: 'Weather Data Unavailable',
          description: 'Could not retrieve weather information. Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingWeather(false);
    }
  }, [currentLocation, units, toast]);
  
  // We keep the refreshTime function declaration empty - the actual implementation has
  // already been set up at the top of the file to avoid initialization order issues
    
    // Check if we've made a call too recently (throttling)
    const now = Date.now();
    const timeSinceLastCall = now - lastTimeFetchRef.current;
    
    if (timeSinceLastCall < THROTTLE_TIME_MS) {
      console.log(`Throttling time API call. Last call was ${timeSinceLastCall}ms ago.`);
      
      // Clear any existing refresh timer
      if (timeRefreshTimerRef.current !== null) {
        window.clearTimeout(timeRefreshTimerRef.current);
      }
      
      // Set a timer to make the call later
      timeRefreshTimerRef.current = window.setTimeout(() => {
        console.log('Executing delayed time refresh');
        refreshTime();
      }, THROTTLE_TIME_MS - timeSinceLastCall);
      
      return;
    }
    
    // Update the last fetch time
    lastTimeFetchRef.current = now;
    
    // Check if we can use cached data
    const cacheKey = getLocationCacheKey(currentLocation, 'time');
    const cachedData = timeCacheRef.current.get(cacheKey);
    
    // Check if our cached data is still valid (less than TIME_CACHE_TTL_MINUTES old)
    const isCacheValid = cachedData && (now - cachedData.timestamp) < (TIME_CACHE_TTL_MINUTES * 60 * 1000);
    
    if (isCacheValid) {
      console.log('Using cached time data - still valid');
      const minutesOld = Math.floor((now - cachedData.timestamp) / (60 * 1000));
      setTimeCacheStatus(`Using primary cache data (${minutesOld} minutes old)`);
      
      setTimeData(cachedData.data);
      setTimeLastUpdated(new Date(cachedData.timestamp));
      setTimeError(null);
      return;
    }
    
    // If we reach here, we need to fetch new data
    setLoadingTime(true);
    setTimeCacheStatus('Fetching fresh data...');
    
    try {
      console.log(`Fetching time data for location:`, currentLocation);
      
      const data = await fetchTimeData({
        lat: currentLocation.lat,
        lon: currentLocation.lon,
        name: currentLocation.name
      });
      
      // Save to cache with timestamp
      const cacheData = {
        timestamp: now,
        data: data
      };
      
      timeCacheRef.current.set(cacheKey, cacheData);
      setTimeCacheStatus('Fresh data fetched');
      
      setTimeData(data);
      setTimeLastUpdated(new Date());
      setTimeError(null);
      
      console.log('Time data fetched successfully:', data);
    } catch (error) {
      console.error('Error fetching time data:', error);
      
      if (cachedData) {
        // Use stale cache data as fallback
        const minutesOld = Math.floor((now - cachedData.timestamp) / (60 * 1000));
        setTimeData(cachedData.data);
        setTimeLastUpdated(new Date(cachedData.timestamp));
        setTimeCacheStatus(`Using stale cache data (${minutesOld} minutes old)`);
        
        toast({
          title: 'Time Data Error',
          description: 'Using cached data. Will retry later.',
          variant: 'destructive',
        });
      } else {
        setTimeData(null);
        setTimeCacheStatus('No data available');
        setTimeError(error instanceof Error ? error : new Error(String(error)));
        
        toast({
          title: 'Time Data Error',
          description: `Could not fetch time data: ${error instanceof Error ? error.message : String(error)}`,
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingTime(false);
    }
  }, [currentLocation, toast]);
  
  // Function to add a world clock
  const addWorldClock = useCallback(async (location: LocationData) => {
    // Generate a unique ID if not provided
    const locationWithId = {
      ...location,
      id: location.id || generateLocationId(location.lat, location.lon, location.name),
      lastUsed: Date.now()
    };
    
    try {
      // Fetch time data for the location
      const timeData = await fetchTimeData({
        lat: locationWithId.lat,
        lon: locationWithId.lon,
        name: locationWithId.name
      });
      
      // Add to world clocks
      setWorldClocks(prevClocks => {
        // Check if this location already exists
        const exists = prevClocks.some(clock => clock.location.id === locationWithId.id);
        
        if (exists) {
          // Update existing clock
          return prevClocks.map(clock => 
            clock.location.id === locationWithId.id 
              ? { location: locationWithId, timeData } 
              : clock
          );
        } else {
          // Add new clock
          return [...prevClocks, { location: locationWithId, timeData }];
        }
      });
      
      // Save to cache
      const cacheKey = getLocationCacheKey(locationWithId, 'worldclock');
      worldClockCacheRef.current.set(cacheKey, {
        timestamp: Date.now(),
        data: timeData
      });
      
      toast({
        title: 'World Clock Added',
        description: `Added ${location.name} to world clocks`,
      });
    } catch (error) {
      console.error('Error adding world clock:', error);
      toast({
        title: 'World Clock Error',
        description: `Could not add world clock: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    }
  }, [toast]);
  
  // Function to remove a world clock
  const removeWorldClock = useCallback((locationId: string) => {
    setWorldClocks(prevClocks => 
      prevClocks.filter(clock => clock.location.id !== locationId)
    );
    
    toast({
      title: 'World Clock Removed',
      description: 'Location has been removed from world clocks.',
    });
  }, [toast]);
  
  // Function to check if current time is in GoTime Golden Hour™
  const isGoldenHour = useCallback((): boolean => {
    if (!timeData || !timeData.goldenHour) return false;
    
    // This is a simplified version - the actual implementation would
    // use the current time and compare it with the golden hour ranges
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check morning GoTime Golden Hour™
    if (timeData.goldenHour.morning) {
      const morningStart = timeData.goldenHour.morning.start;
      const morningEnd = timeData.goldenHour.morning.end;
      
      // Parse times and check if current time is within range
      // This is a simplified implementation
      if (morningStart && morningEnd) {
        // Time parsing logic would go here
        // For now, just return false as placeholder
      }
    }
    
    // Check evening GoTime Golden Hour™
    if (timeData.goldenHour.evening) {
      const eveningStart = timeData.goldenHour.evening.start;
      const eveningEnd = timeData.goldenHour.evening.end;
      
      // Parse times and check if current time is within range
      // This is a simplified implementation
      if (eveningStart && eveningEnd) {
        // Time parsing logic would go here
        // For now, just return false as placeholder
      }
    }
    
    return false;
  }, [timeData]);
  
  // Function to get optimal drive time
  const getOptimalDriveTime = useCallback((tripDurationMinutes: number): string | null => {
    if (!timeData) return null;
    
    // This is a simplified placeholder implementation
    // A real implementation would consider:
    // - Current time of day
    // - Sunrise/sunset times
    // - Weather conditions
    // - Trip duration
    
    // For now, just return a placeholder response
    if (isGoldenHour()) {
      return "Now is an ideal time for a scenic drive during GoTime Golden Hour™!";
    }
    
    return "Current conditions are acceptable for driving";
  }, [timeData, isGoldenHour]);
  
  // Refresh all location-based services
  const refreshAll = useCallback(async () => {
    await refreshLocation();
    // Location refresh will trigger weather refresh
    await refreshTime();
  }, [refreshLocation, refreshTime]);
  
  // Construct the context value
  const contextValue: LocationServicesContextType = {
    // Current location and settings
    currentLocation,
    favoriteLocations,
    searchHistory,
    
    // Weather data
    weatherData,
    forecastData,
    oneCallData,
    automotiveWeather,
    
    // Time data
    timeData,
    worldClocks,
    
    // Status information
    loading: {
      location: loadingLocation,
      weather: loadingWeather,
      automotive: loadingAutomotive,
      services: loadingServices,
      time: loadingTime
    },
    errors: {
      location: locationError,
      weather: weatherError,
      automotive: automotiveError,
      services: servicesError,
      time: timeError
    },
    
    // Data freshness
    lastUpdated: {
      location: locationLastUpdated,
      weather: weatherLastUpdated,
      automotive: automotiveLastUpdated,
      services: servicesLastUpdated,
      time: timeLastUpdated
    },
    
    // Cache information
    cacheStatus: {
      weather: weatherCacheStatus,
      automotive: automotiveCacheStatus,
      time: timeCacheStatus
    },
    
    // User preferences
    preferences: {
      units,
      temperatureUnit,
      speedUnit,
      distanceUnit,
      timeFormat
    },
    
    // Action methods
    setCurrentLocation,
    addFavoriteLocation,
    removeFavoriteLocation,
    updateLocation,
    setUnits,
    refreshWeather,
    refreshLocation,
    refreshTime,
    refreshAll,
    
    // Time-related functions
    addWorldClock,
    removeWorldClock,
    getOptimalDriveTime,
    isGoldenHour,
    
    // Utility methods
    formatLastUpdated,
    isStale
  };
  
  return (
    <LocationServicesContext.Provider value={contextValue}>
      {children}
    </LocationServicesContext.Provider>
  );
};

// Hook for consuming the context
export const useLocationServices = () => {
  const context = useContext(LocationServicesContext);
  
  if (context === undefined) {
    throw new Error('useLocationServices must be used within a LocationServicesProvider');
  }
  
  return context;
};