import React, { createContext, useState, useContext, useEffect } from 'react';

// Sample weather data format
const sampleWeatherData = {
  location: { name: 'Charlotte', country: 'US', lat: 35.2271, lon: -80.8431 },
  currentConditions: {
    temp: 72,
    feels_like: 74,
    pressure: 1015,
    humidity: 65,
    wind_speed: 5.8,
    wind_direction: 180,
    weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
    clouds: 40,
    uvi: 6.7,
    visibility: 10000,
    dew_point: 60
  },
  drivingConditions: {
    asphalt_temperature: 85,
    grip_index: 78,
    surface_moisture: 5,
    track_temp: 85,
    track_condition: "Dry",
    alert_level: "Low"
  },
  performanceData: {
    braking_efficiency: 92,
    acceleration_factor: 98,
    cornering_grip: 95,
    tire_performance: 90
  },
  hourly: [
    { dt: Date.now() / 1000, temp: 72, weather: [{ icon: '01d' }], pop: 0.1 },
    { dt: Date.now() / 1000 + 3600, temp: 74, weather: [{ icon: '02d' }], pop: 0.2 },
    { dt: Date.now() / 1000 + 7200, temp: 76, weather: [{ icon: '03d' }], pop: 0.3 },
    { dt: Date.now() / 1000 + 10800, temp: 78, weather: [{ icon: '04d' }], pop: 0.4 },
    { dt: Date.now() / 1000 + 14400, temp: 77, weather: [{ icon: '10d' }], pop: 0.5 },
    { dt: Date.now() / 1000 + 18000, temp: 75, weather: [{ icon: '11d' }], pop: 0.6 },
    { dt: Date.now() / 1000 + 21600, temp: 73, weather: [{ icon: '13d' }], pop: 0.2 },
    { dt: Date.now() / 1000 + 25200, temp: 70, weather: [{ icon: '01n' }], pop: 0.1 }
  ],
  tireStrategy: {
    optimal_compound: "Medium",
    tire_temperature: {
      surface: 85,
      core: 80,
      optimal_window: "80-90°C",
      warmup_time: 3
    },
    pressure: {
      recommendation: "Standard pressure recommended",
      front_pressure_delta: 0.2,
      rear_pressure_delta: 0.1,
      pressure_buildup_rate: "Normal"
    },
    wear: {
      expected_wear_rate: "Medium",
      wear_pattern: "Even",
      graining_risk: "Low",
      blistering_risk: "Low",
      management_strategy: "Standard rotation schedule recommended"
    }
  },
  alerts: []
};

const WeatherContext = createContext();

export function SimpleWeatherProvider({ children }) {
  const [weatherData, setWeatherData] = useState(sampleWeatherData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchWeatherData = async (lat = 35.2271, lon = -80.8431) => {
    setLoading(true);
    try {
      // Get weather data with default location (Charlotte)
      console.log(`Fetching weather data for ${lat},${lon}`);
      const response = await fetch(`/api/automotive-weather?lat=${lat}&lon=${lon}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching weather data: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Weather data received:', data);
      setWeatherData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err);
      // Fall back to sample data on error
      setWeatherData(sampleWeatherData);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch weather data on mount
  useEffect(() => {
    fetchWeatherData();
  }, []);
  
  // Expose the context value
  const value = {
    weatherData,
    loading,
    error,
    fetchWeatherData
  };
  
  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a SimpleWeatherProvider');
  }
  return context;
}