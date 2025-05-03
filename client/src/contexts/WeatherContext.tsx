import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getWeatherData, 
  getHourlyForecast, 
  getOneCallData, 
  OneCallData,
  WeatherData,
  ForecastData,
  Location
} from '@/lib/weather';
import { fetchAutomotiveWeather } from '@/services/openWeatherService';
import { fetchConsolidatedWeatherData, ConsolidatedWeatherData } from '@/services/consolidatedWeatherService';

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
  failureCount: number;
  isUsingFallbackData: boolean;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

// Load saved locations from localStorage
const getSavedLocationsFromStorage = (): Location[] => {
  try {
    const savedLocations = localStorage.getItem('weatherLocations');
    if (savedLocations) {
      return JSON.parse(savedLocations);
    }
  } catch (error) {
    console.error('Error loading saved locations from localStorage:', error);
  }
  
  // Default locations if none are saved
  return [
    { id: '1', name: 'Charlotte', lat: 35.2271, lon: -80.8431 },
    { id: '2', name: 'New York', lat: 40.7128, lon: -74.0060 },
    { id: '3', name: 'San Francisco', lat: 37.7749, lon: -122.4194 }
  ];
};

// Load preferred unit from localStorage
const getUnitFromStorage = (): 'metric' | 'imperial' => {
  try {
    const unit = localStorage.getItem('weatherUnit');
    if (unit === 'metric' || unit === 'imperial') {
      return unit;
    }
  } catch (error) {
    console.error('Error loading unit preference from localStorage:', error);
  }
  
  // Default to imperial if not saved
  return 'imperial';
};

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [unit, setUnitState] = useState<'metric' | 'imperial'>(getUnitFromStorage());
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocationsState] = useState<Location[]>(getSavedLocationsFromStorage());
  const [failureCount, setFailureCount] = useState<number>(0);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
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

  // Setup auto-refresh of weather data every 60 minutes instead of 15
  // to reduce API calls and avoid rate limiting
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (selectedLocation) {
        console.log('Auto-refreshing weather data (hourly)...');
        refreshWeather();
      }
    }, 60 * 60 * 1000); // 60 minutes (was 15 minutes)
    
    return () => clearInterval(refreshInterval);
  }, [selectedLocation]);

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
  
  // Extract individual data pieces from the consolidated response
  // Handle type conversions for component compatibility
  const weatherData = consolidatedData?.oneCallData?.current as unknown as WeatherData | null;
  const oneCallData = consolidatedData?.oneCallData || null;
  const forecastData = consolidatedData?.forecastData || null;
  const automotiveWeatherData = consolidatedData?.automotiveWeatherData || null;
  
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
      .then(() => {
        setFailureCount(0);
        setLastUpdated(new Date());
        setIsUsingFallbackData(false);
        console.log('Weather data refreshed successfully');
      })
      .catch(error => {
        console.error('Error refreshing consolidated weather data:', error);
        setFailureCount(prev => prev + 1);
      });
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
    failureCount,
    isUsingFallbackData
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
