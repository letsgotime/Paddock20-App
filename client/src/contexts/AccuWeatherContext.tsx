import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  getLocationKey, 
  fetchCurrentConditions, 
  fetchDailyForecast, 
  fetchHourlyForecast, 
  fetchDrivingIndices, 
  fetchAutomotiveData,
  fetchAllAccuWeatherData,
  AutomotiveWeatherData
} from '@/services/accuWeatherService';

// Define interfaces for AccuWeather data structures
export interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface AccuWeatherContextType {
  unit: 'metric' | 'imperial';
  setUnit: (unit: 'metric' | 'imperial') => void;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
  savedLocations: Location[];
  addSavedLocation: (location: Location) => void;
  removeSavedLocation: (locationId: string) => void;
  isLoading: boolean;
  error: Error | null;
  locationKey: string | null;
  currentConditions: any | null;
  dailyForecast: any | null;
  hourlyForecast: any[] | null;
  drivingIndices: any[] | null;
  automotiveData: AutomotiveWeatherData | null;
  refreshWeather: () => void;
}

const AccuWeatherContext = createContext<AccuWeatherContextType | undefined>(undefined);

export function AccuWeatherProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocations] = useState<Location[]>([
    { id: '1', name: 'Charlotte', lat: 35.2271, lon: -80.8431 },
    { id: '2', name: 'New York', lat: 40.7128, lon: -74.0060 },
    { id: '3', name: 'San Francisco', lat: 37.7749, lon: -122.4194 }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [locationKey, setLocationKey] = useState<string | null>(null);
  const [currentConditions, setCurrentConditions] = useState<any | null>(null);
  const [dailyForecast, setDailyForecast] = useState<any | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[] | null>(null);
  const [drivingIndices, setDrivingIndices] = useState<any[] | null>(null);
  const [automotiveData, setAutomotiveData] = useState<AutomotiveWeatherData | null>(null);

  // Set default location on first load
  useEffect(() => {
    if (!selectedLocation && savedLocations.length > 0) {
      setSelectedLocation(savedLocations[0]);
    }
  }, [selectedLocation, savedLocations]);

  // Fetch all AccuWeather data when selected location changes
  useEffect(() => {
    fetchWeatherData();
  }, [selectedLocation, unit]);

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

  // Fetch all weather data
  const fetchWeatherData = async () => {
    if (!selectedLocation) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Get location key
      let keyToUse: string = '349818'; // Default fallback to Charlotte
      
      try {
        const locationData = await getLocationKey(
          selectedLocation.lat,
          selectedLocation.lon
        );
        
        keyToUse = locationData.Key;
        setLocationKey(keyToUse);
        
        console.log('Successfully retrieved AccuWeather location key:', keyToUse);
      } catch (locationError) {
        console.warn('Error getting AccuWeather location key:', locationError);
        
        // If we already have a location key in state, use that instead of the fallback
        if (locationKey) {
          keyToUse = locationKey;
        }
        
        console.log('Using cached/default location key:', keyToUse);
      }
      
      // Step 2: Fetch all other data
      try {
        // Fetch all data in parallel using the keyToUse variable
        const [current, daily, hourly, indices, automotive] = await Promise.all([
          fetchCurrentConditions(keyToUse),
          fetchDailyForecast(keyToUse),
          fetchHourlyForecast(keyToUse),
          fetchDrivingIndices(keyToUse),
          fetchAutomotiveData(keyToUse)
        ]);
        
        setCurrentConditions(current);
        setDailyForecast(daily);
        setHourlyForecast(hourly);
        setDrivingIndices(indices);
        setAutomotiveData(automotive);
      } catch (dataError) {
        console.error('Error fetching AccuWeather data:', dataError);
        throw dataError;
      }
    } catch (err) {
      console.error('Error in AccuWeather data fetching process:', err);
      setError(err as Error);
      
      toast({
        title: 'Weather data error',
        description: 'Unable to load AccuWeather data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh weather data
  const refreshWeather = () => {
    fetchWeatherData();
  };

  const value: AccuWeatherContextType = {
    unit,
    setUnit,
    selectedLocation,
    setSelectedLocation,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    isLoading,
    error,
    locationKey,
    currentConditions,
    dailyForecast,
    hourlyForecast,
    drivingIndices,
    automotiveData,
    refreshWeather
  };

  return (
    <AccuWeatherContext.Provider value={value}>
      {children}
    </AccuWeatherContext.Provider>
  );
}

export function useAccuWeather() {
  const context = useContext(AccuWeatherContext);
  if (context === undefined) {
    throw new Error('useAccuWeather must be used within an AccuWeatherProvider');
  }
  return context;
}