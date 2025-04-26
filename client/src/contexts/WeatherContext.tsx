import React, { createContext, useState, useContext, useEffect } from 'react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { getWeatherData, getHourlyForecast, getOneCallData, OneCallData } from '@/lib/weather';
import { WeatherData, ForecastData, Location } from 'shared/schema';

interface WeatherContextType {
  unit: 'metric' | 'imperial';
  setUnit: (unit: 'metric' | 'imperial') => void;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
  savedLocations: Location[];
  addSavedLocation: (location: Location) => void;
  removeSavedLocation: (locationId: string) => void;
  isLoading: boolean;
  error: Error | null;
  weatherData: WeatherData | null;
  forecastData: ForecastData | null;
  oneCallData: OneCallData | null;
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
  } = useQuery({
    queryKey: ['weather', selectedLocation?.name, unit],
    enabled: !!selectedLocation,
    queryFn: () => {
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
  } = useQuery({
    queryKey: ['forecast', selectedLocation?.name, unit],
    enabled: !!selectedLocation,
    queryFn: () => {
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
  } = useQuery({
    queryKey: ['onecall', selectedLocation?.name, unit],
    enabled: !!selectedLocation,
    queryFn: () => {
      if (!selectedLocation) return null;
      return getOneCallData(selectedLocation, unit);
    },
  });

  // Handle errors
  useEffect(() => {
    if (weatherError) {
      toast({
        title: "Error fetching weather data",
        description: (weatherError as Error).message,
        variant: "destructive",
      });
    }
    if (forecastError) {
      toast({
        title: "Error fetching forecast data",
        description: (forecastError as Error).message,
        variant: "destructive",
      });
    }
  }, [weatherError, forecastError]);

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

  // Refresh weather data
  const refreshWeather = () => {
    refetchWeather();
    refetchForecast();
    refetchOneCall();
  };

  const value = {
    unit,
    setUnit,
    selectedLocation,
    setSelectedLocation,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    isLoading: isWeatherLoading || isForecastLoading || isOneCallLoading,
    error: weatherError as Error || forecastError as Error || oneCallError as Error || null,
    weatherData,
    forecastData,
    oneCallData,
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
