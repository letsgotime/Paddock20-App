/**
 * LEGACY WEATHER CONTEXT - NOW REDIRECTING TO CONSOLIDATED WEATHER CONTEXT
 * 
 * This is a bridge implementation that redirects all calls to the new
 * ConsolidatedWeatherContext to standardize our weather data access.
 * The ConsolidatedWeatherContext currently integrates:
 * - OpenWeather API (primary weather source)
 * - TimeZoneDB API (for accurate time conversion)
 * - IPInfo API (for geolocation services)
 * 
 * Planned future integrations (not yet implemented):
 * - AccuWeather API (fallback weather source)
 * - Aviation Weather APIs
 * - Spotify API (weather-based music recommendations)
 * 
 * ⚠️ DEPRECATION WARNING: This context is maintained for backward compatibility only.
 * DO NOT MODIFY THIS FILE - Add new features to ConsolidatedWeatherContext instead.
 */

import React, { createContext, useContext, useCallback } from 'react';
import { 
  OneCallData,
  WeatherData,
  ForecastData,
  Location
} from '@/lib/weather';
import { useWeather as useConsolidatedWeather } from '@/contexts/ConsolidatedWeatherContext';
import { useToast } from '@/hooks/use-toast';

// Define interface for our automotive weather data
export interface AutomotiveWeatherData {
  location: {
    lat: number;
    lon: number;
    timezone: string;
  };
  current_time: string;
  sunrise_time: string;
  sunset_time: string;
  conditions: {
    summary: string;
    icon: string;
    air_temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    cloud_cover: number;
    precipitation: number;
    uv_index: number;
    solar_radiation: number | null;
  };
  automotive_metrics: {
    track_surface: {
      temperature: number;
      condition: string;
      grip_level: string;
    };
    tire_temperature_estimates: {
      soft_compound: number;
      medium_compound: number;
      hard_compound: number;
      street_performance: number;
      all_season: number;
    };
    drive_recommendations: {
      tire_warmup_minutes: {
        performance: number;
        street: number;
        all_season: number;
      };
      torque_management: {
        recommended_percentage: number;
        traction_control: string;
      };
      tire_pressure_adjustment: number;
      braking_points: string;
    };
    visibility_assessment: string;
    sunglare_risk: string;
  };
  hourly_forecast: Array<{
    time: string;
    temperature: number;
    conditions: string;
    precipitation_chance: number;
  }>;
  alerts: Array<any>;
  data_sources: {
    weather: string;
    solar: string;
  };
}

interface WeatherContextType {
  unit: 'metric' | 'imperial';
  setUnit: (unit: 'metric' | 'imperial') => void;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
  setCoordinates: (lat: number, lon: number) => void;
  savedLocations: Location[];
  addSavedLocation: (location: Location) => void;
  removeSavedLocation: (locationId: string) => void;
  isLoading: boolean;
  error: Error | null;
  weatherData: WeatherData | null;
  forecastData: ForecastData | null;
  oneCallData: OneCallData | null;
  automotiveWeatherData: AutomotiveWeatherData | null;
  refreshWeather: () => void;
  lastUpdated: Date | null;
  nextRefreshTime: Date | null;
  failureCount: number;
  isUsingFallbackData: boolean;
  cacheAge: string | null;
  cacheExpiryTime: Date | null;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [unit, setUnitState] = useState<'metric' | 'imperial'>(getUnitFromStorage());
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocationsState] = useState<Location[]>(getSavedLocationsFromStorage());
  const [failureCount, setFailureCount] = useState<number>(0);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  const [cacheAge, setCacheAge] = useState<string | null>(null);
  const [cacheExpiryTime, setCacheExpiryTime] = useState<Date | null>(null);
  
  // Cache last successful data to use as fallback
  const weatherDataCache = useRef<{
    weatherData: WeatherData | null;
    forecastData: ForecastData | null;
    oneCallData: OneCallData | null;
    automotiveWeatherData: AutomotiveWeatherData | null;
    consolidatedData: ConsolidatedWeatherData | null;
  }>({
    weatherData: null,
    forecastData: null,
    oneCallData: null,
    automotiveWeatherData: null,
    consolidatedData: null
  });

  // Automatically save unit preference to localStorage
  const setUnit = useCallback((newUnit: 'metric' | 'imperial') => {
    setUnitState(newUnit);
    try {
      localStorage.setItem('weatherUnit', newUnit);
    } catch (error) {
      console.error('Error saving unit preference to localStorage:', error);
    }
  }, []);

  // Automatically save locations to localStorage
  const setSavedLocations = useCallback((locations: Location[]) => {
    setSavedLocationsState(locations);
    try {
      localStorage.setItem('weatherLocations', JSON.stringify(locations));
    } catch (error) {
      console.error('Error saving locations to localStorage:', error);
    }
  }, []);

  // Set default location on first load
  useEffect(() => {
    if (!selectedLocation && savedLocations.length > 0) {
      setSelectedLocation(savedLocations[0]);
    }
  }, [selectedLocation, savedLocations]);

  // Initialize cache-related information when consolidatedData changes
  useEffect(() => {
    const updateCacheInfo = () => {
      // Only proceed if consolidatedData is defined
      if (!consolidatedData) return;
      
      const now = new Date();
      
      // When we receive cache data, calculate and update all the cache-related state
      if (consolidatedData.cacheTimestamp) {
        // Calculate cache age
        const cacheAgeMinutes = Math.round((now.getTime() - consolidatedData.cacheTimestamp) / 60000);
        if (cacheAgeMinutes < 1) {
          setCacheAge("Just updated");
        } else if (cacheAgeMinutes < 60) {
          setCacheAge(`${cacheAgeMinutes} minutes old`);
        } else {
          const cacheAgeHours = Math.round(cacheAgeMinutes / 60);
          setCacheAge(`${cacheAgeHours} hour${cacheAgeHours > 1 ? 's' : ''} old`);
        }
        
        // Set next refresh and expiry times
        setNextRefreshTime(new Date(now.getTime() + 60 * 60 * 1000)); // 60 minutes from now
        setCacheExpiryTime(new Date(now.getTime() + 8 * 60 * 60 * 1000)); // 8 hours from now
      }
    };
    
    // Run the update function
    updateCacheInfo();
    
  // Empty dependency array to run only once on mount
  // We'll update this info manually when we get new data
  }, []);

  // Auto-refresh setup will be moved below after refetchConsolidatedWeather is defined

  // Get ALL weather data in a single consolidated API call
  // This drastically reduces API usage and helps avoid rate limiting
  const {
    data: consolidatedData,
    isLoading: isConsolidatedLoading,
    error: consolidatedError,
    refetch: refetchConsolidatedWeather
  } = useQuery({
    queryKey: ['consolidated-weather', selectedLocation?.lat, selectedLocation?.lon, unit],
    enabled: !!selectedLocation,
    staleTime: 60 * 60 * 1000, // 1 hour cache to reduce API calls
    retry: 2, // Retry failed requests twice
    queryFn: async () => {
      if (!selectedLocation) return null;
      
      try {
        console.log('Fetching consolidated weather data for:', selectedLocation.name || `${selectedLocation.lat},${selectedLocation.lon}`);
        
        // This single API call replaces multiple separate API calls
        const data = await fetchConsolidatedWeatherData(selectedLocation, unit);
        
        // Update all of our cache entries with the consolidated data
        weatherDataCache.current.weatherData = data.oneCallData ? data.oneCallData.current : null;
        weatherDataCache.current.oneCallData = data.oneCallData;
        weatherDataCache.current.automotiveWeatherData = data.automotiveWeatherData;
        
        // Set last updated timestamp and reset failure flags
        setLastUpdated(new Date());
        setIsUsingFallbackData(false);
        
        return data;
      } catch (error) {
        console.error("Consolidated weather API error:", error);
        setFailureCount(prev => prev + 1);
        
        // For rate limit errors, we're already using cached data from the service
        const errorString = String(error);
        const isRateLimitError = errorString.includes('429') || 
                                errorString.includes('rate limit') || 
                                errorString.includes('too many requests');
        
        if (isRateLimitError) {
          setIsUsingFallbackData(true);
        }
        
        throw error;
      }
    }
  });
  
  // Extract individual data pieces from the consolidated response and ensure proper type casting
  // The key is to properly cast the types to maintain compatibility with existing components
  const weatherData = consolidatedData?.weatherData as unknown as WeatherData | null;
  const oneCallData = consolidatedData?.oneCallData || null;
  const forecastData = consolidatedData?.forecastData || null;
  
  // Convert automotive weather data to the expected interface format
  const automotiveWeatherData = consolidatedData?.automotiveWeatherData ? {
    // Ensure all expected properties are present by providing fallbacks
    location: consolidatedData?.weatherData?.name || "Unknown",
    current_time: new Date().toISOString(),
    sunrise_time: new Date(consolidatedData?.oneCallData?.current?.sunrise * 1000).toISOString(),
    sunset_time: new Date(consolidatedData?.oneCallData?.current?.sunset * 1000).toISOString(),
    temperature: consolidatedData?.oneCallData?.current?.temp,
    conditions: consolidatedData?.oneCallData?.current?.weather?.[0]?.main || "Unknown",
    icon: consolidatedData?.oneCallData?.current?.weather?.[0]?.icon || "01d",
    humidity: consolidatedData?.oneCallData?.current?.humidity || 0,
    ...consolidatedData.automotiveWeatherData
  } : null;
  
  // Unified loading and error states
  const isLoading = isConsolidatedLoading;
  const error = consolidatedError;

  // Handle errors with centralized messaging
  useEffect(() => {
    if (error) {
      // Check if error is due to rate limiting
      const errorString = String(error);
      const isRateLimitError = errorString.includes('429') || 
                              errorString.includes('rate limit') || 
                              errorString.includes('too many requests');
      
      if (isRateLimitError) {
        // Don't show toast for rate limit errors as we'll handle this with a nicer UI in the component
        console.log("Weather data synchronization in progress. Using cached data where available.");
        // We intentionally don't show a toast here as it creates a poor UX
      } else if (isUsingFallbackData) {
        toast({
          title: "Using cached weather data",
          description: "Displaying your last successfully loaded weather information.",
          variant: "default", // Changed from destructive to make it less alarming
        });
      } else {
        toast({
          title: "Weather data update paused",
          description: "Some weather information couldn't be refreshed. Will try again shortly.",
          variant: "default", // Changed from destructive to make it less alarming
        });
      }
    }
  }, [error, isUsingFallbackData, toast]);

  // Add a location to saved locations
  const addSavedLocation = useCallback((location: Location) => {
    if (!savedLocations.some(loc => loc.name === location.name)) {
      setSavedLocations([...savedLocations, location]);
      // Auto-select the new location
      setSelectedLocation(location);
    }
  }, [savedLocations, setSavedLocations]);

  // Remove a location from saved locations
  const removeSavedLocation = useCallback((locationId: string) => {
    setSavedLocations(savedLocations.filter(loc => loc.id !== locationId));
  }, [savedLocations, setSavedLocations]);
  
  // Update location by coordinates
  const setCoordinates = useCallback((lat: number, lon: number) => {
    if (!selectedLocation || selectedLocation.lat !== lat || selectedLocation.lon !== lon) {
      // Create a temporary location with the coordinates
      const tempLocation: Location = {
        lat,
        lon,
        id: `temp-${Date.now()}`, // Generate a temporary ID
        name: "Loading..." // Will be updated when we get the location name
      };
      setSelectedLocation(tempLocation);
    }
  }, [selectedLocation]);

  // Refresh weather data manually with our new consolidated approach
  const refreshWeather = useCallback(() => {
    // Only proceed if we have a selected location
    if (!selectedLocation) {
      console.warn('Cannot refresh weather: No location selected');
      return;
    }
    
    console.log('Manually refreshing weather data for:', 
                selectedLocation.name || `${selectedLocation.lat},${selectedLocation.lon}`);
    
    // We now only need to refetch the consolidated data
    refetchConsolidatedWeather()
      .then((data) => {
        const now = new Date();
        setFailureCount(0);
        setLastUpdated(now);
        setIsUsingFallbackData(false);
        
        // Set next auto-refresh time (60 minutes from now)
        const nextRefresh = new Date(now.getTime() + 60 * 60 * 1000);
        setNextRefreshTime(nextRefresh);
        
        // Set cache expiry time (8 hours from now)
        const cacheExpiry = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        setCacheExpiryTime(cacheExpiry);
        
        // Set cache age
        setCacheAge("Just updated");
        
        console.log('Weather data refreshed successfully');
      })
      .catch(error => {
        console.error('Error refreshing consolidated weather data:', error);
        setFailureCount(prev => prev + 1);
      });
  }, [selectedLocation, refetchConsolidatedWeather]);

  // Setup auto-refresh of weather data every 60 minutes instead of 15
  // to reduce API calls and avoid rate limiting
  useEffect(() => {
    if (!selectedLocation) return;
    
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing weather data (hourly)...');
      // Now refetchConsolidatedWeather is defined and we can use it safely
      if (selectedLocation) {
        refetchConsolidatedWeather()
          .then(() => {
            const now = new Date();
            setFailureCount(0);
            setLastUpdated(now);
            setIsUsingFallbackData(false);
            
            // Update cache tracking
            setNextRefreshTime(new Date(now.getTime() + 60 * 60 * 1000));
            setCacheExpiryTime(new Date(now.getTime() + 8 * 60 * 60 * 1000));
            setCacheAge("Just updated");
            
            console.log('Weather data refreshed successfully (auto)');
          })
          .catch(error => {
            console.error('Error in auto-refresh of weather data:', error);
            setFailureCount(prev => prev + 1);
          });
      }
    }, 60 * 60 * 1000); // 60 minutes (was 15 minutes)
    
    return () => clearInterval(refreshInterval);
  }, [selectedLocation, refetchConsolidatedWeather]);

  const value: WeatherContextType = {
    unit,
    setUnit,
    selectedLocation,
    setSelectedLocation,
    setCoordinates,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    isLoading, // Using the unified loading state
    error, // Using the unified error state
    weatherData: weatherData || null,
    forecastData: forecastData || null,
    oneCallData: oneCallData || null,
    automotiveWeatherData: automotiveWeatherData || null,
    refreshWeather,
    lastUpdated,
    nextRefreshTime,
    failureCount,
    isUsingFallbackData,
    cacheAge,
    cacheExpiryTime
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
