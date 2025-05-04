import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Thermometer, Droplets, Wind, ArrowUp, ArrowDown, CloudLightning } from 'lucide-react';

// Mock weather data for the widget
interface WeatherData {
  weatherData: {
    coord: { lon: number; lat: number };
    weather: { id: number; main: string; description: string; icon: string }[];
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    wind: { speed: number; deg: number };
    dt: number;
    name: string;
  };
}

const mockWeatherData: WeatherData = {
  weatherData: {
    coord: { lon: -84.29, lat: 33.99 },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    main: {
      temp: 78.6,
      feels_like: 78.4,
      temp_min: 76.1,
      temp_max: 82.8,
      pressure: 1015,
      humidity: 55
    },
    wind: { speed: 8.5, deg: 270 },
    dt: Math.floor(Date.now() / 1000),
    name: 'Roswell'
  }
};

// Mock active vehicle
const mockVehicle = {
  id: 'car1',
  displayName: 'My F1 Car',
  make: 'McLaren',
  model: 'MCL38',
  year: 2024
};

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData>(mockWeatherData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const activeVehicle = mockVehicle;
  
  // Get a weather icon based on weather condition
  const getWeatherIcon = (condition?: string, isNight?: boolean) => {
    if (!condition) return <Cloud className="h-12 w-12 text-gray-400" />;
    
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('thunder') || conditionLower.includes('lightning')) {
      return <CloudLightning className="h-12 w-12 text-yellow-400" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain className="h-12 w-12 text-blue-300" />;
    } else if (conditionLower.includes('snow')) {
      return <CloudSnow className="h-12 w-12 text-white" />;
    } else if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <Sun className="h-12 w-12 text-yellow-400" />;
    } else {
      return <Cloud className="h-12 w-12 text-gray-300" />;
    }
  };
  
  // Simulate fetching weather data
  const fetchWeather = () => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      // Simulate API call with timeout
      setTimeout(() => {
        // Update with slightly different values to simulate new data
        setWeatherData({
          weatherData: {
            ...mockWeatherData.weatherData,
            main: {
              ...mockWeatherData.weatherData.main,
              temp: mockWeatherData.weatherData.main.temp + (Math.random() * 4 - 2), // +/- 2 degrees
              humidity: Math.min(100, Math.max(30, mockWeatherData.weatherData.main.humidity + (Math.random() * 10 - 5))),
            },
            wind: {
              speed: Math.max(0, mockWeatherData.weatherData.wind.speed + (Math.random() * 3 - 1.5)),
              deg: (mockWeatherData.weatherData.wind.deg + Math.floor(Math.random() * 30)) % 360
            },
            dt: Math.floor(Date.now() / 1000)
          }
        });
        setIsLoading(false);
        resolve();
      }, 800);
    });
  };
  
  // Refresh weather data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeather().finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };
  
  // Timestamp formatting
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Calculate drive advisability score (0-100)
  const calculateDriveScore = () => {
    if (!weatherData?.weatherData) return null;
    
    const weather = weatherData.weatherData;
    let score = 100;
    
    // Reduce score for extreme temperatures (too hot/cold)
    const temp = weather.main?.temp || 0;
    if (temp > 95) score -= 20;
    else if (temp > 85) score -= 10;
    else if (temp < 32) score -= 30;
    else if (temp < 45) score -= 15;
    
    // Reduce score for precipitation
    const weatherDesc = weather.weather?.[0]?.description || '';
    if (weatherDesc.includes('heavy rain') || weatherDesc.includes('thunderstorm')) {
      score -= 50;
    } else if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle')) {
      score -= 25;
    } else if (weatherDesc.includes('snow')) {
      score -= 40;
    }
    
    // Reduce score for high winds
    const windSpeed = weather.wind?.speed || 0;
    if (windSpeed > 30) score -= 40;
    else if (windSpeed > 20) score -= 25;
    else if (windSpeed > 15) score -= 15;
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  };
  
  // Get color based on drive score
  const getDriveScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const driveScore = calculateDriveScore();
  
  // Loading state
  if (isLoading && !weatherData) {
    return (
      <div className="h-full flex items-center justify-center min-h-[140px]">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Error state
  if (error && !weatherData) {
    return (
      <div className="h-full flex flex-col items-center justify-center min-h-[140px] text-center p-4">
        <div className="text-red-500 mb-2">
          <CloudRain className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-red-400 text-sm">Unable to load weather data</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 px-3 py-1 text-xs bg-blue-900/50 hover:bg-blue-800/60 text-blue-300 rounded"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Main weather display
  return (
    <div className="h-full">
      {weatherData?.weatherData ? (
        <div className="flex flex-col h-full">
          {/* Current Conditions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {getWeatherIcon(weatherData.weatherData.weather?.[0]?.description)}
              <div className="ml-3">
                <h3 className="text-xl font-semibold text-blue-300">
                  {Math.round(weatherData.weatherData.main?.temp || 0)}°F
                </h3>
                <p className="text-gray-400 text-sm capitalize">
                  {weatherData.weatherData.weather?.[0]?.description || 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-blue-300 font-medium">
                {weatherData.weatherData.name || 'Unknown Location'}
              </p>
              <p className="text-gray-400 text-xs">
                Updated {formatTime(weatherData.weatherData.dt)}
              </p>
            </div>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            <div className="bg-blue-950/30 rounded p-2 flex items-center">
              <Thermometer className="h-4 w-4 text-blue-400 mr-2" />
              <div>
                <p className="text-gray-400 text-xs">Feels Like</p>
                <p className="text-blue-300">{Math.round(weatherData.weatherData.main?.feels_like || 0)}°F</p>
              </div>
            </div>
            
            <div className="bg-blue-950/30 rounded p-2 flex items-center">
              <Droplets className="h-4 w-4 text-blue-400 mr-2" />
              <div>
                <p className="text-gray-400 text-xs">Humidity</p>
                <p className="text-blue-300">{weatherData.weatherData.main?.humidity || 0}%</p>
              </div>
            </div>
            
            <div className="bg-blue-950/30 rounded p-2 flex items-center">
              <Wind className="h-4 w-4 text-blue-400 mr-2" />
              <div>
                <p className="text-gray-400 text-xs">Wind</p>
                <p className="text-blue-300">{Math.round(weatherData.weatherData.wind?.speed || 0)} mph</p>
              </div>
            </div>
            
            <div className="bg-blue-950/30 rounded p-2 flex items-center">
              <ArrowUp className="h-4 w-4 text-red-400 mr-2" />
              <div>
                <p className="text-gray-400 text-xs">High</p>
                <p className="text-blue-300">{Math.round(weatherData.weatherData.main?.temp_max || 0)}°F</p>
              </div>
            </div>
            
            <div className="bg-blue-950/30 rounded p-2 flex items-center">
              <ArrowDown className="h-4 w-4 text-blue-500 mr-2" />
              <div>
                <p className="text-gray-400 text-xs">Low</p>
                <p className="text-blue-300">{Math.round(weatherData.weatherData.main?.temp_min || 0)}°F</p>
              </div>
            </div>
            
            <div className="bg-blue-950/30 rounded p-2 flex items-center">
              <Thermometer className="h-4 w-4 text-yellow-500 mr-2" />
              <div>
                <p className="text-gray-400 text-xs">Surface Temp</p>
                <p className="text-blue-300">{Math.round((weatherData.weatherData.main?.temp || 0) - 5)}°F</p>
              </div>
            </div>
          </div>
          
          {/* Drive Conditions Score */}
          {driveScore !== null && (
            <div className="mt-4 bg-blue-950/30 rounded p-3 border-l-4 border-blue-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Drive Conditions</p>
                  <p className={`text-lg font-bold ${getDriveScoreColor(driveScore)}`}>{driveScore}/100</p>
                </div>
                
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Vehicle</p>
                  <p className="text-blue-300 text-sm font-medium">
                    {activeVehicle?.displayName || 'No vehicle selected'}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 mt-1">
                {driveScore >= 80 ? 'Excellent driving conditions' :
                 driveScore >= 60 ? 'Good driving conditions' :
                 driveScore >= 40 ? 'Use caution while driving' :
                 'Poor driving conditions'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center min-h-[140px] text-center">
          <p className="text-gray-400 text-sm">No weather data available</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-3 py-1 text-xs bg-blue-900/50 hover:bg-blue-800/60 text-blue-300 rounded"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;