import React, { createContext, useState, useContext, useEffect } from 'react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
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
  automotiveWeatherData: AutomotiveWeatherData | null; // New automotive weather data
  refreshWeather: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocations] = useState<Location[]>([
    { id: '1', name: 'Charlotte', lat: 35.2271, lon: -80.8431 },
    { id: '2', name: 'New York', lat: 40.7128, lon: -74.0060 },
    { id: '3', name: 'San Francisco', lat: 37.7749, lon: -122.4194 }
  ]);

  // Set default location on first load
  useEffect(() => {
    if (!selectedLocation && savedLocations.length > 0) {
      setSelectedLocation(savedLocations[0]);
    }
  }, [selectedLocation, savedLocations]);

  // Get weather data for selected location
  const { 
    data: weatherData, 
    isLoading: isWeatherLoading, 
    error: weatherError,
    refetch: refetchWeather
  } = useQuery<WeatherData | null>({
    queryKey: ['weather', selectedLocation?.name, unit],
    enabled: !!selectedLocation,
    queryFn: async () => {
      if (!selectedLocation) return null;
      return getWeatherData(selectedLocation, unit);
    },
  });

  // Get forecast data for selected location
  const { 
    data: forecastData, 
    isLoading: isForecastLoading, 
    error: forecastError,
    refetch: refetchForecast
  } = useQuery<ForecastData | null>({
    queryKey: ['forecast', selectedLocation?.name, unit],
    enabled: !!selectedLocation,
    queryFn: async () => {
      if (!selectedLocation) return null;
      return getHourlyForecast(selectedLocation, unit);
    },
  });
  
  // Get comprehensive weather data via OneCall API
  const { 
    data: oneCallData, 
    isLoading: isOneCallLoading, 
    error: oneCallError,
    refetch: refetchOneCall
  } = useQuery<OneCallData | null>({
    queryKey: ['onecall', selectedLocation?.name, unit],
    enabled: !!selectedLocation,
    queryFn: async () => {
      if (!selectedLocation) return null;
      return getOneCallData(selectedLocation, unit);
    },
  });
  
  // Get F1-style automotive weather data
  const { 
    data: automotiveWeatherData, 
    isLoading: isAutomotiveWeatherLoading, 
    error: automotiveWeatherError,
    refetch: refetchAutomotiveWeather
  } = useQuery<AutomotiveWeatherData | null>({
    queryKey: ['automotive-weather', selectedLocation?.name, unit],
    enabled: !!selectedLocation,
    queryFn: async () => {
      if (!selectedLocation) return null;
      try {
        const data = await fetchAutomotiveWeather(selectedLocation.lat, selectedLocation.lon, unit);
        return data;
      } catch (error) {
        console.error("Error fetching automotive weather data:", error);
        return null;
      }
    },
  });

  // Handle errors
  useEffect(() => {
    if (weatherError) {
      console.error("Weather API error:", weatherError);
      toast({
        title: "Error fetching weather data",
        description: "Unable to load current weather. Please try again.",
        variant: "destructive",
      });
    }
    if (forecastError) {
      console.error("Forecast API error:", forecastError);
      toast({
        title: "Error fetching forecast data",
        description: "Unable to load forecast data. Please try again.",
        variant: "destructive",
      });
    }
    if (oneCallError) {
      console.error("OneCall API error:", oneCallError);
      toast({
        title: "Error fetching extended weather data",
        description: "Unable to load extended weather details. Please try again.",
        variant: "destructive",
      });
    }
    if (automotiveWeatherError) {
      console.error("Automotive Weather API error:", automotiveWeatherError);
      toast({
        title: "Error fetching automotive weather data",
        description: "Unable to load F1-style driving metrics. Please try again.",
        variant: "destructive",
      });
    }
  }, [weatherError, forecastError, oneCallError, automotiveWeatherError]);

  // Add a location to saved locations
  const addSavedLocation = (location: Location) => {
    if (!savedLocations.some(loc => loc.name === location.name)) {
      setSavedLocations([...savedLocations, location]);
      // Auto-select the new location
      setSelectedLocation(location);
    }
  };

  // Remove a location from saved locations
  const removeSavedLocation = (locationId: string) => {
    setSavedLocations(savedLocations.filter(loc => loc.id !== locationId));
  };
  
  // Update location by coordinates
  const setCoordinates = (lat: number, lon: number) => {
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
  };

  // Refresh weather data
  const refreshWeather = () => {
    refetchWeather();
    refetchForecast();
    refetchOneCall();
    refetchAutomotiveWeather();
  };

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
    refreshWeather
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
