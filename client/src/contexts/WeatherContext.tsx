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
  }>({
    weatherData: null,
    forecastData: null,
    oneCallData: null,
    automotiveWeatherData: null
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

  // Setup auto-refresh of weather data every 15 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (selectedLocation) {
        console.log('Auto-refreshing weather data...');
        refreshWeather();
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(refreshInterval);
  }, [selectedLocation]);

  // Get weather data for selected location
  const { 
    data: weatherData, 
    isLoading: isWeatherLoading, 
    error: weatherError,
    refetch: refetchWeather
  } = useQuery<WeatherData | null>({
    queryKey: ['weather', selectedLocation?.lat, selectedLocation?.lon, unit],
    enabled: !!selectedLocation,
    staleTime: 10 * 60 * 1000, // 10 minutes
    queryFn: async () => {
      if (!selectedLocation) return null;
      try {
        const data = await getWeatherData(selectedLocation, unit);
        // Cache successful data
        weatherDataCache.current.weatherData = data;
        setIsUsingFallbackData(false);
        return data;
      } catch (error) {
        console.error("Weather API error:", error);
        setFailureCount(prev => prev + 1);
        
        // Return cached data as fallback if available
        if (weatherDataCache.current.weatherData) {
          setIsUsingFallbackData(true);
          return weatherDataCache.current.weatherData;
        }
        throw error;
      }
    },
  });

  // Get forecast data for selected location
  const { 
    data: forecastData, 
    isLoading: isForecastLoading, 
    error: forecastError,
    refetch: refetchForecast
  } = useQuery<ForecastData | null>({
    queryKey: ['forecast', selectedLocation?.lat, selectedLocation?.lon, unit],
    enabled: !!selectedLocation,
    staleTime: 30 * 60 * 1000, // 30 minutes
    queryFn: async () => {
      if (!selectedLocation) return null;
      try {
        const data = await getHourlyForecast(selectedLocation, unit);
        // Cache successful data
        weatherDataCache.current.forecastData = data;
        return data;
      } catch (error) {
        console.error("Forecast API error:", error);
        
        // Return cached data as fallback if available
        if (weatherDataCache.current.forecastData) {
          return weatherDataCache.current.forecastData;
        }
        throw error;
      }
    },
  });
  
  // Get comprehensive weather data via OneCall API
  const { 
    data: oneCallData, 
    isLoading: isOneCallLoading, 
    error: oneCallError,
    refetch: refetchOneCall
  } = useQuery<OneCallData | null>({
    queryKey: ['onecall', selectedLocation?.lat, selectedLocation?.lon, unit],
    enabled: !!selectedLocation,
    staleTime: 30 * 60 * 1000, // 30 minutes
    queryFn: async () => {
      if (!selectedLocation) return null;
      try {
        const data = await getOneCallData(selectedLocation, unit);
        // Cache successful data
        weatherDataCache.current.oneCallData = data;
        return data;
      } catch (error) {
        console.error("OneCall API error:", error);
        
        // Return cached data as fallback if available
        if (weatherDataCache.current.oneCallData) {
          return weatherDataCache.current.oneCallData;
        }
        throw error;
      }
    },
  });
  
  // Get F1-style automotive weather data
  const { 
    data: automotiveWeatherData, 
    isLoading: isAutomotiveWeatherLoading, 
    error: automotiveWeatherError,
    refetch: refetchAutomotiveWeather
  } = useQuery<AutomotiveWeatherData | null>({
    queryKey: ['automotive-weather', selectedLocation?.lat, selectedLocation?.lon, unit],
    enabled: !!selectedLocation,
    staleTime: 30 * 60 * 1000, // 30 minutes
    queryFn: async () => {
      if (!selectedLocation) return null;
      try {
        // Use direct fetch with string parameters to fix API call issues
        const response = await fetch(
          `/api/automotive-weather?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&units=${unit}`
        );
        
        if (!response.ok) {
          throw new Error(`Automotive weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache successful data
        weatherDataCache.current.automotiveWeatherData = data;
        return data;
      } catch (error) {
        console.error("Error fetching automotive weather data:", error);
        
        // Return cached data as fallback if available
        if (weatherDataCache.current.automotiveWeatherData) {
          return weatherDataCache.current.automotiveWeatherData;
        }
        return null; // This is non-critical data, so we can return null instead of throwing
      }
    },
  });

  // Handle errors with centralized messaging
  useEffect(() => {
    const anyError = weatherError || forecastError || oneCallError;
    if (anyError) {
      // Check if error is due to rate limiting
      const errorString = String(anyError);
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
  }, [weatherError, forecastError, oneCallError, isUsingFallbackData, toast]);

  // Update lastUpdated timestamp when data successfully loads
  useEffect(() => {
    if (weatherData && !isWeatherLoading && !weatherError) {
      setLastUpdated(new Date());
    }
  }, [weatherData, isWeatherLoading, weatherError]);

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

  // Refresh weather data manually
  const refreshWeather = useCallback(() => {
    refetchWeather();
    refetchForecast();
    refetchOneCall();
    refetchAutomotiveWeather();
  }, [refetchWeather, refetchForecast, refetchOneCall, refetchAutomotiveWeather]);

  const value: WeatherContextType = {
    unit,
    setUnit,
    selectedLocation,
    setSelectedLocation,
    setCoordinates,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    isLoading: isWeatherLoading || isForecastLoading || isOneCallLoading || isAutomotiveWeatherLoading,
    error: weatherError || forecastError || oneCallError || automotiveWeatherError || null,
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
