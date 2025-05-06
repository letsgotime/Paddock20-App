/**
 * LocationServicesContext - TEMPORARY STUB
 * 
 * This is a simplified version of the LocationServicesContext that doesn't
 * have any circular dependencies. We'll use this temporarily while we work
 * on a proper solution with the EnhancedLocationContext.
 */

import React, { createContext, useContext, ReactNode, useState } from 'react';

// Types

export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'current' | 'favorite' | 'search';
  icon?: string;
  address?: string;
  components?: Record<string, string>;
  lastUsed: number;
}

interface WeatherData {
  // Simplified weather data
  temp: number;
  conditions: string;
}

interface TimeData {
  // Simplified time data
  timezone: string;
  timestamp: number;
}

interface LocationServicesContextType {
  // Current location info
  currentLocation: LocationData | null;
  favoriteLocations: LocationData[];
  searchHistory: LocationData[];
  
  // Weather data
  weatherData: WeatherData | null;
  
  // Time data
  timeData: TimeData | null;
  
  // Loading states
  loading: {
    location: boolean;
    weather: boolean;
    time: boolean;
  };
  
  // Actions
  setCurrentLocation: (location: LocationData) => void;
  refreshLocation: () => void;
  refreshWeather: () => void;
  refreshTime: () => void;
}

// Default location for testing
const DEFAULT_LOCATION: LocationData = {
  id: 'default',
  name: 'San Francisco',
  lat: 37.7749,
  lon: -122.4194,
  type: 'current',
  lastUsed: Date.now()
};

// Create context
const LocationServicesContext = createContext<LocationServicesContextType | undefined>(undefined);

// Provider component
export const LocationServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // States
  const [currentLocation, setCurrentLocationState] = useState<LocationData | null>(DEFAULT_LOCATION);
  const [favoriteLocations, setFavoriteLocations] = useState<LocationData[]>([]);
  const [searchHistory, setSearchHistory] = useState<LocationData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingTime, setLoadingTime] = useState(false);
  
  // Actions
  const setCurrentLocation = (location: LocationData) => {
    console.log('Setting current location:', location);
    setCurrentLocationState(location);
  };
  
  const refreshLocation = () => {
    console.log('Location refresh requested (stub implementation)');
    // Stub implementation
    setLoadingLocation(true);
    setTimeout(() => {
      setLoadingLocation(false);
    }, 500);
  };
  
  const refreshWeather = () => {
    console.log('Weather refresh requested (stub implementation)');
    // Stub implementation
    setLoadingWeather(true);
    setTimeout(() => {
      setLoadingWeather(false);
    }, 500);
  };
  
  const refreshTime = () => {
    console.log('Time refresh requested (stub implementation)');
    // Stub implementation
    setLoadingTime(true);
    setTimeout(() => {
      setLoadingTime(false);
    }, 500);
  };
  
  // Context value
  const contextValue: LocationServicesContextType = {
    currentLocation,
    favoriteLocations,
    searchHistory,
    weatherData,
    timeData,
    loading: {
      location: loadingLocation,
      weather: loadingWeather,
      time: loadingTime
    },
    setCurrentLocation,
    refreshLocation,
    refreshWeather,
    refreshTime
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