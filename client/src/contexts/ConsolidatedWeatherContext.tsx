/**
 * ConsolidatedWeatherContext
 * 
 * This is a unified Weather Context that combines features from both
 * the original WeatherContext and FixedWeatherContext, optimized to
 * make a single API call for all weather data needs.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  fetchConsolidatedWeatherData, 
  getForecastSummary, 
  getDrivingConditions 
} from '@/services/consolidatedWeatherService';
import { 
  saveToWeatherCaches, 
  getFromWeatherCaches,
  formatCacheAge 
} from '@/services/weatherStateManager';
import { OneCallData, WeatherData, ForecastData, Location } from '@/lib/weather';
import { useToast } from '@/hooks/use-toast';

// Cache configuration constants
const PRIMARY_CACHE_TTL_MINUTES = 60; // 1 hour primary cache
const SECONDARY_CACHE_TTL_HOURS = 8;  // 8 hour secondary cache
const REFRESH_INTERVAL_MINUTES = 15;  // How often we auto-refresh (reduced from 60 to 15)
const MAX_FAILURE_COUNT = 3;          // After this many failures, we use fallback data

// Define shape of our automotive weather context
export interface AutomotiveWeatherData {
  conditions: {
    summary: string;
    icon: string;
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
  };
  forecast: {
    today: {
      description: string;
      high: number;
      low: number;
      precipitation: number;
    };
    tomorrow: {
      description: string;
      high: number;
      low: number;
      precipitation: number;
    };
  };
  alerts: Array<{
    event: string;
    description: string;
    start: number;
    end: number;
    severity: string;
  }>;
  driving: {
    quality: number; // 1-5 scale
    recommendation: string;
    risks: string[];
    idealTimes: string[];
  };
  astronomy: {
    sunrise: string;
    sunset: string;
    moonPhase: string;
    dayLength: string;
  };
}

// The Weather Context interface - what components can access
interface WeatherContextType {
  // Core weather data
  weatherData: WeatherData | null;
  oneCallData: OneCallData | null;
  forecastData: ForecastData | null;
  automotiveWeatherData: AutomotiveWeatherData | null;
  
  // Location & settings
  selectedLocation: Location;
  unit: 'metric' | 'imperial';
  setLocation: (location: Location) => void;
  setUnit: (unit: 'metric' | 'imperial') => void;
  
  // Status information
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  failureCount: number;
  isUsingFallbackData: boolean;
  
  // Actions
  refreshWeather: () => Promise<void>;
  
  // Utility/derived data
  formattedLastUpdated: string;
  cacheStatus: string;
}

// Create the context with default values
const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

// Provider component
export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Core weather data state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [oneCallData, setOneCallData] = useState<OneCallData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [automotiveWeatherData, setAutomotiveWeatherData] = useState<AutomotiveWeatherData | null>(null);
  
  // Status state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [failureCount, setFailureCount] = useState<number>(0);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState<boolean>(false);
  
  // Preferences state
  const defaultLocation = { name: 'Current Location', lat: 33.996, lon: -84.292 }; // Atlanta
  const [selectedLocation, setSelectedLocation] = useState<Location>(defaultLocation);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');
  
  // Refs for tracking refresh intervals
  const refreshTimerRef = useRef<number | null>(null);

  // Utility to format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';
    
  // Cache status description
  const cacheStatus = lastUpdated
    ? formatCacheAge(lastUpdated)
    : 'No cache';
  
  // Handle location setting with geolocation support
  const setLocation = useCallback((location: Location) => {
    console.log('Setting location:', location);
    
    // If this is the "Current Location" option, try to get actual coordinates
    if (location.name === 'Current Location' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoLocation = {
            name: 'Current Location',
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          console.log('Got geolocation:', geoLocation);
          setSelectedLocation(geoLocation);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Fall back to default location but still call it "Current Location"
          setSelectedLocation(location);
        },
        { timeout: 10000, maximumAge: 1800000 } // 30 minute cache for location
      );
    } else {
      // Use the provided location directly
      setSelectedLocation(location);
    }
  }, []);
  
  // State for cache display
  const [cacheAge, setCacheAge] = useState<string>("Not cached");
  
  // Fetch weather data with caching
  const fetchWeatherWithCaching = useCallback(async () => {
    setIsLoading(true);
    console.log('Starting weather fetch process...');
    
    try {
      // Try to get cached data first
      const cachedData = getFromWeatherCaches(
        selectedLocation, 
        unit, 
        false, // forceRefresh parameter
        setCacheAge // function to update cache age display
      );
      
      if (cachedData.data) {
        console.log('Using cached weather data from', cachedData.source);
        
        // Extract the data from the cached data object
        const weatherData = cachedData.data.weatherData || null;
        const oneCallData = cachedData.data.oneCallData || null;
        const forecastData = cachedData.data.forecastData || null;
        const automotiveWeatherData = cachedData.data.automotiveWeatherData || null;
        const timestamp = cachedData.data.cacheTimestamp || Date.now();
        
        // Update state with cached data
        setWeatherData(weatherData);
        setOneCallData(oneCallData);
        setForecastData(forecastData);
        setAutomotiveWeatherData(automotiveWeatherData);
        setLastUpdated(new Date(timestamp));
        setIsLoading(false);
        setError(null);
        
        // If we're using secondary cache, refresh in background
        if (cachedData.source === 'secondary') {
          console.log('Using secondary cache. Refreshing in background...');
          // Don't await - let it happen in background
          fetchFreshWeatherData();
        }
        
        return; // Exit early since we're using cached data
      }
      
      // No usable cache, fetch fresh data
      console.log('Fetching fresh weather data...');
      await fetchFreshWeatherData();
      
    } catch (err) {
      console.error('Error in fetchWeatherWithCaching:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, [selectedLocation, unit]);

  // Function to fetch fresh weather data
  const fetchFreshWeatherData = async () => {
    try {
      // Fetch all data in one call
      const data = await fetchConsolidatedWeatherData(selectedLocation, unit);
      
      // Cache the successful response
      saveToWeatherCaches(selectedLocation, unit, data);
      
      // Update state with new data
      setWeatherData(data.weatherData);
      setOneCallData(data.oneCallData);
      setForecastData(data.forecastData);
      setAutomotiveWeatherData(data.automotiveWeatherData);
      setLastUpdated(new Date());
      setFailureCount(0);
      setIsUsingFallbackData(false);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching weather:', err);
      
      // Check cache for fallback data regardless of age
      const fallbackData = getFromWeatherCaches(
        selectedLocation, 
        unit,
        10000, // Very high TTL to get any cached data
        1000   // Very high TTL to get any cached data
      );
      
      // Increment failure count
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);
      
      if (fallbackData) {
        // We have fallback data, use it but mark it as stale
        setWeatherData(fallbackData.weatherData);
        setOneCallData(fallbackData.oneCallData);
        setForecastData(fallbackData.forecastData);
        setAutomotiveWeatherData(fallbackData.automotiveWeatherData);
        setLastUpdated(new Date(fallbackData.cacheTimestamp));
        setIsUsingFallbackData(true);
        
        // Only show error toast if we've failed multiple times
        if (newFailureCount >= MAX_FAILURE_COUNT) {
          toast({
            title: "Weather Update Failed",
            description: "Using cached data. Please check your connection.",
            variant: "destructive",
          });
        }
      } else {
        // No fallback data available, show the error
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Weather Data Unavailable",
          description: "Could not retrieve weather information. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Public refresh method
  const refreshWeather = async () => {
    toast({
      title: "Refreshing Weather",
      description: "Fetching the latest weather data...",
    });
    
    await fetchFreshWeatherData();
  };
  
  // Fetch weather when location or unit changes
  useEffect(() => {
    console.log('Location or unit changed, fetching weather');
    fetchWeatherWithCaching();
    
    // Clear any existing refresh timer
    if (refreshTimerRef.current) {
      window.clearInterval(refreshTimerRef.current);
    }
    
    // Set a refresh timer
    refreshTimerRef.current = window.setInterval(() => {
      console.log('Auto-refreshing weather data');
      fetchWeatherWithCaching();
    }, REFRESH_INTERVAL_MINUTES * 60 * 1000); // Convert minutes to milliseconds
    
    // Clean up the interval on unmount
    return () => {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
      }
    };
  }, [selectedLocation, unit, fetchWeatherWithCaching]);
  
  // When the app starts, try to use geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            name: 'Current Location',
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          console.log('Got geolocation on init:', location);
          setSelectedLocation(location);
        },
        (error) => {
          console.warn('Geolocation error on init:', error.message);
          // Keep the default location
        },
        { timeout: 10000, maximumAge: 1800000 } // 30 minute cache
      );
    }
  }, []);
  
  // Context value
  const value: WeatherContextType = {
    // Core weather data
    weatherData,
    oneCallData,
    forecastData,
    automotiveWeatherData,
    
    // Location & settings
    selectedLocation,
    unit,
    setLocation,
    setUnit,
    
    // Status information
    isLoading,
    error,
    lastUpdated,
    failureCount,
    isUsingFallbackData,
    
    // Actions
    refreshWeather,
    
    // Utility/derived data
    formattedLastUpdated,
    cacheStatus
  };
  
  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

// Hook for consuming the context
export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

// Export a wrapper function to make migration easier
export const useFixedWeather = useWeather;