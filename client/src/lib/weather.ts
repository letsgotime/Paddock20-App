import { AutomotiveWeatherData } from '@/services/openWeatherService';

// Define interfaces for weather data
export interface Location {
  lat: number;
  lon: number;
  name?: string;
  formattedName?: string;
  country?: string;
  state?: string;
}

export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility: number;
    pop: number;
    rain?: {
      '3h': number;
    };
    snow?: {
      '3h': number;
    };
    sys: {
      pod: string;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// Define interface for OneCall API response
export interface OneCallData {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    rain?: {
      '1h'?: number;
    };
    snow?: {
      '1h'?: number;
    };
  };
  minutely?: Array<{
    dt: number;
    precipitation: number;
  }>;
  hourly?: Array<{
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number;
    rain?: {
      '1h'?: number;
    };
    snow?: {
      '1h'?: number;
    };
  }>;
  daily?: Array<{
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    temp: {
      day: number;
      min: number;
      max: number;
      night: number;
      eve: number;
      morn: number;
    };
    feels_like: {
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: number;
    pop: number;
    rain?: number;
    snow?: number;
    uvi: number;
  }>;
  alerts?: Array<{
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
  }>;
  
  // Automotive-specific data for F1 and high-performance driving
  automotiveData?: AutomotiveWeatherData;
}

/**
 * Get comprehensive weather data for a specific location using the OneCall API
 */
export const getOneCallData = async (location: Location, unit: 'metric' | 'imperial'): Promise<OneCallData> => {
  try {
    if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      throw new Error('Invalid location data');
    }
    
    // Use our server-side proxy endpoint
    const url = `/api/onecall?lat=${location.lat}&lon=${location.lon}&units=${unit}`;
    
    // Add retry logic for network errors
    let retries = 2;
    let response;
    
    while (retries >= 0) {
      try {
        response = await fetch(url);
        break; // Exit the loop if fetch is successful
      } catch (fetchError) {
        if (retries === 0) throw fetchError;
        retries--;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!response) {
      throw new Error('Network error occurred while fetching OneCall data');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OneCall API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.current) {
      throw new Error('Received invalid data format from OneCall API');
    }
    
    return data as OneCallData;
  } catch (error) {
    console.error('Error fetching OneCall data:', error);
    throw new Error(`Failed to fetch comprehensive weather data: ${(error as Error).message}`);
  }
};

/**
 * Get current weather data for a specific location
 */
export const getWeatherData = async (location: Location, unit: 'metric' | 'imperial'): Promise<WeatherData> => {
  try {
    if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      throw new Error('Invalid location data');
    }
    
    // Use our server-side proxy endpoint
    const url = `/api/weather?lat=${location.lat}&lon=${location.lon}&units=${unit}`;
    
    // Add retry logic for network errors
    let retries = 2;
    let response;
    
    while (retries >= 0) {
      try {
        response = await fetch(url);
        break; // Exit the loop if fetch is successful
      } catch (fetchError) {
        if (retries === 0) throw fetchError;
        retries--;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!response) {
      throw new Error('Network error occurred while fetching weather data');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Weather API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.weather || !data.main) {
      throw new Error('Received invalid data format from weather API');
    }
    
    return data as WeatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error(`Failed to fetch weather data: ${(error as Error).message}`);
  }
};

/**
 * Get hourly forecast for a specific location
 */
export const getHourlyForecast = async (location: Location, unit: 'metric' | 'imperial'): Promise<ForecastData> => {
  try {
    if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      throw new Error('Invalid location data');
    }
    
    // Use our server-side proxy endpoint
    const url = `/api/forecast?lat=${location.lat}&lon=${location.lon}&units=${unit}`;
    
    // Add retry logic for network errors
    let retries = 2;
    let response;
    
    while (retries >= 0) {
      try {
        response = await fetch(url);
        break; // Exit the loop if fetch is successful
      } catch (fetchError) {
        if (retries === 0) throw fetchError;
        retries--;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!response) {
      throw new Error('Network error occurred while fetching forecast data');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Forecast API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.list || !Array.isArray(data.list)) {
      throw new Error('Received invalid data format from forecast API');
    }
    
    return data as ForecastData;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw new Error(`Failed to fetch forecast data: ${(error as Error).message}`);
  }
};

/**
 * Search for a location by name and return coordinates
 */
export const searchLocation = async (query: string): Promise<Location> => {
  try {
    // Use our server-side proxy endpoint
    const url = `/api/location?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Geocoding API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error(`No location found for: ${query}`);
    }
    
    return data as Location;
  } catch (error) {
    console.error('Error searching location:', error);
    throw new Error(`Failed to search location: ${(error as Error).message}`);
  }
};
