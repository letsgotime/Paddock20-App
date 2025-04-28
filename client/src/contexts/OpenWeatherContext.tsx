import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { AutomotiveWeatherData } from '@/services/openWeatherService';

// Define interfaces for location data
export interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    sunrise?: number;
    sunset?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
}

interface OpenWeatherContextType {
  weatherData: WeatherData | null;
  automotiveWeatherData: AutomotiveWeatherData | null;
  loading: boolean;
  error: Error | null;
  unit: 'metric' | 'imperial';
  setUnit: (unit: 'metric' | 'imperial') => void;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
  savedLocations: Location[];
  refreshWeather: () => void;
}

export const OpenWeatherContext = createContext<OpenWeatherContextType>({
  weatherData: null,
  automotiveWeatherData: null,
  loading: false,
  error: null,
  unit: 'imperial',
  setUnit: () => {},
  selectedLocation: null,
  setSelectedLocation: () => {},
  savedLocations: [],
  refreshWeather: () => {}
});

export function OpenWeatherProvider({ children }: { children: React.ReactNode }) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [automotiveWeatherData, setAutomotiveWeatherData] = useState<AutomotiveWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
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

  // Fetch weather data when location or unit changes
  useEffect(() => {
    if (!selectedLocation) return;
    
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Basic weather data
        const weatherResponse = await fetch(`/api/weather?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&units=${unit}`);
        
        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const weatherResult = await weatherResponse.json();
        setWeatherData(weatherResult);
        
        // Attempt to fetch automotive weather data
        try {
          const automotiveResponse = await fetch(`/api/automotive-weather?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&units=${unit}`);
          
          if (automotiveResponse.ok) {
            const automotiveResult = await automotiveResponse.json();
            setAutomotiveWeatherData(automotiveResult);
          }
        } catch (autoError) {
          console.error('Could not load advanced automotive data, using basic weather only');
        }
        
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching weather data'));
        toast({
          title: "Error fetching weather data",
          description: "Unable to load weather information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [selectedLocation, unit]);

  // Refresh weather data
  const refreshWeather = () => {
    if (selectedLocation) {
      // Force a re-fetch by setting loading state
      setLoading(true);
    }
  };

  const value = {
    weatherData,
    automotiveWeatherData,
    loading,
    error,
    unit,
    setUnit,
    selectedLocation,
    setSelectedLocation,
    savedLocations,
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
  if (!context) {
    throw new Error('useOpenWeather must be used within an OpenWeatherProvider');
  }
  return context;
}