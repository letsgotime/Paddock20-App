import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { fetchAutomotiveWeather, AutomotiveWeatherData } from '@/services/openWeatherService';
import { useQuery } from '@tanstack/react-query';

// Define interfaces for location data
export interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
}

export interface OpenWeatherContextType {
  unit: 'metric' | 'imperial';
  setUnit: (unit: 'metric' | 'imperial') => void;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
  savedLocations: Location[];
  addSavedLocation: (location: Location) => void;
  removeSavedLocation: (locationId: string) => void;
  isLoading: boolean;
  error: Error | null;
  automotiveWeatherData: AutomotiveWeatherData | null;
  refreshWeather: () => void;
}

const OpenWeatherContext = createContext<OpenWeatherContextType | undefined>(undefined);

export function OpenWeatherProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');
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

  // Get automotive weather data
  const { 
    data: automotiveWeatherData, 
    isLoading: isAutomotiveWeatherLoading, 
    error: automotiveWeatherError,
    refetch: refetchAutomotiveWeather
  } = useQuery<AutomotiveWeatherData | null>({
    queryKey: ['automotive-weather', selectedLocation?.lat, selectedLocation?.lon, unit],
    enabled: !!selectedLocation,
    queryFn: async () => {
      if (!selectedLocation) return null;
      try {
        const data = await fetchAutomotiveWeather(selectedLocation.lat, selectedLocation.lon, unit);
        return data;
      } catch (error) {
        console.error("Error fetching automotive weather data:", error);
        throw error;
      }
    },
  });

  // Handle errors
  useEffect(() => {
    if (automotiveWeatherError) {
      console.error("Automotive Weather API error:", automotiveWeatherError);
      toast({
        title: "Error fetching automotive weather data",
        description: "Unable to load F1-style driving metrics. Please try again.",
        variant: "destructive",
      });
    }
  }, [automotiveWeatherError]);

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
    refetchAutomotiveWeather();
  };

  const value: OpenWeatherContextType = {
    unit,
    setUnit,
    selectedLocation,
    setSelectedLocation,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    isLoading: isAutomotiveWeatherLoading,
    error: automotiveWeatherError || null,
    automotiveWeatherData: automotiveWeatherData || null,
    refreshWeather
  };

  return (
    <OpenWeatherContext.Provider value={value}>
      {children}
    </OpenWeatherContext.Provider>
  );
}

export function useOpenWeather() {
  const context = useContext(OpenWeatherContext);
  if (context === undefined) {
    throw new Error('useOpenWeather must be used within an OpenWeatherProvider');
  }
  return context;
}