import React, { useState, useEffect } from 'react';
import { 
  ThermometerSun, 
  Droplets, 
  Wind, 
  Gauge, 
  CloudRain, 
  Sun,
  Moon,
  Cloud,
  CloudSnow,
  CloudLightning,
  CloudFog
} from 'lucide-react';
import { getWeatherColorScheme, getContainerClasses, getHeadingClasses, getMoodMessage } from '../utils/weatherColorScheme';

/**
 * A weather panel component that adapts its color scheme based on weather conditions
 */
const AdaptiveWeatherPanel = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [colorScheme, setColorScheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsLoading(true);
        
        // Use Charlotte as default location for demo purposes
        const response = await fetch('/api/weather?lat=35.2271&lon=-80.8431');
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        setWeatherData(data);
        
        // Determine if it's day or night
        const now = new Date();
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        const isDay = now > sunrise && now < sunset;
        
        // Get the main weather condition
        const condition = data.weather[0]?.main || 'default';
        
        // Get the temperature
        const temperature = data.main?.temp || 70;
        
        // Get color scheme based on weather
        const scheme = getWeatherColorScheme(condition, temperature, isDay);
        setColorScheme(scheme);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err.message);
        setIsLoading(false);
        
        // Use default color scheme on error
        setColorScheme(getWeatherColorScheme('default', 70, true));
      }
    };
    
    fetchWeatherData();
    
    // Auto-refresh every 15 minutes
    const refreshInterval = setInterval(() => {
      fetchWeatherData();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Get the appropriate weather icon based on condition and time of day
  const getWeatherIcon = (condition, isDay) => {
    const iconProps = { size: 32, className: colorScheme?.textSecondary || 'text-blue-400' };
    
    switch (condition) {
      case 'Clear':
        return isDay ? <Sun {...iconProps} /> : <Moon {...iconProps} />;
      case 'Clouds':
        return <Cloud {...iconProps} />;
      case 'Rain':
      case 'Drizzle':
        return <CloudRain {...iconProps} />;
      case 'Snow':
        return <CloudSnow {...iconProps} />;
      case 'Thunderstorm':
        return <CloudLightning {...iconProps} />;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return <CloudFog {...iconProps} />;
      default:
        return isDay ? <Sun {...iconProps} /> : <Moon {...iconProps} />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-black/40 p-6 rounded-lg border border-gray-800 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 p-4 rounded-lg h-28"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-950/30 p-6 rounded-lg border border-red-900 text-center">
        <p className="text-red-400 font-medium mb-2">Error loading weather data</p>
        <p className="text-gray-300">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!weatherData || !colorScheme) {
    return (
      <div className="bg-black/40 p-6 rounded-lg border border-gray-800 text-center">
        <p className="text-gray-400">No weather data available</p>
      </div>
    );
  }
  
  // Determine if it's day or night
  const now = new Date();
  const sunrise = new Date(weatherData.sys.sunrise * 1000);
  const sunset = new Date(weatherData.sys.sunset * 1000);
  const isDay = now > sunrise && now < sunset;
  
  // Get the main weather condition and description
  const condition = weatherData.weather[0]?.main || 'default';
  const description = weatherData.weather[0]?.description || '';
  
  // Get the temperature
  const temp = Math.round(weatherData.main?.temp || 0);
  
  // Get container classes based on weather scheme
  const containerClasses = getContainerClasses(colorScheme);
  
  // Get heading classes based on weather scheme
  const headingClasses = getHeadingClasses(colorScheme);
  
  // Get mood message based on weather
  const moodMessage = getMoodMessage(colorScheme, condition, temp);
  
  return (
    <div className={`p-6 rounded-lg border ${containerClasses}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl ${headingClasses}`}>
          Adaptive Weather Dashboard
        </h2>
        <div className="flex items-center">
          {getWeatherIcon(condition, isDay)}
          <span className="ml-2 text-white font-medium">{condition}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`bg-black/30 p-4 rounded-lg border ${colorScheme.border}`}>
          <div className="flex items-center mb-2">
            <ThermometerSun className={`h-5 w-5 mr-2 ${colorScheme.textSecondary}`} />
            <h3 className={`${colorScheme.textPrimary} text-sm font-medium`}>Temperature</h3>
          </div>
          <p className="text-2xl font-bold text-white">{temp}°F</p>
          <p className="text-xs text-gray-400 mt-1">Feels like {Math.round(weatherData.main?.feels_like || 0)}°F</p>
        </div>
        
        <div className={`bg-black/30 p-4 rounded-lg border ${colorScheme.border}`}>
          <div className="flex items-center mb-2">
            <Droplets className={`h-5 w-5 mr-2 ${colorScheme.textSecondary}`} />
            <h3 className={`${colorScheme.textPrimary} text-sm font-medium`}>Humidity</h3>
          </div>
          <p className="text-2xl font-bold text-white">{weatherData.main?.humidity || 0}%</p>
          <p className="text-xs text-gray-400 mt-1">Relative humidity</p>
        </div>
        
        <div className={`bg-black/30 p-4 rounded-lg border ${colorScheme.border}`}>
          <div className="flex items-center mb-2">
            <Wind className={`h-5 w-5 mr-2 ${colorScheme.textSecondary}`} />
            <h3 className={`${colorScheme.textPrimary} text-sm font-medium`}>Wind</h3>
          </div>
          <p className="text-2xl font-bold text-white">{Math.round(weatherData.wind?.speed || 0)} mph</p>
          <p className="text-xs text-gray-400 mt-1">
            From {weatherData.wind?.deg ? getWindDirection(weatherData.wind.deg) : 'N/A'}
          </p>
        </div>
      </div>
      
      <div className={`p-4 rounded-lg bg-black/40 border ${colorScheme.border}`}>
        <div className="flex items-center mb-2">
          <Gauge className={`h-5 w-5 mr-2 ${colorScheme.textSecondary}`} />
          <h3 className={`${colorScheme.textPrimary} text-sm font-medium`}>Driving Conditions</h3>
        </div>
        <p className="text-white/90">{moodMessage}</p>
        
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className={`px-2 py-1 rounded text-center bg-opacity-20 bg-black ${colorScheme.textSecondary} text-xs`}>
            {calculateGripLevel(weatherData)} Grip
          </div>
          <div className={`px-2 py-1 rounded text-center bg-opacity-20 bg-black ${colorScheme.textSecondary} text-xs`}>
            {calculateVisibility(weatherData)} Visibility
          </div>
          <div className={`px-2 py-1 rounded text-center bg-opacity-20 bg-black ${colorScheme.textSecondary} text-xs`}>
            {calculateComfort(weatherData)} Comfort
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Data for {weatherData.name}, {weatherData.sys?.country} • Updated {formatUpdateTime(new Date())}</p>
      </div>
    </div>
  );
};

// Helper functions
function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function formatUpdateTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function calculateGripLevel(weatherData) {
  const condition = weatherData.weather[0]?.main;
  const temp = weatherData.main?.temp || 0;
  const humidity = weatherData.main?.humidity || 0;
  
  if (condition === 'Rain' || condition === 'Snow' || condition === 'Drizzle') {
    return 'Low';
  }
  
  if (humidity > 80 || temp < 40) {
    return 'Moderate';
  }
  
  return 'High';
}

function calculateVisibility(weatherData) {
  const condition = weatherData.weather[0]?.main;
  const visibility = weatherData.visibility || 0;
  
  if (condition === 'Fog' || condition === 'Mist' || visibility < 1000) {
    return 'Poor';
  }
  
  if (condition === 'Rain' || condition === 'Snow' || visibility < 5000) {
    return 'Moderate';
  }
  
  return 'Good';
}

function calculateComfort(weatherData) {
  const temp = weatherData.main?.temp || 0;
  const humidity = weatherData.main?.humidity || 0;
  const wind = weatherData.wind?.speed || 0;
  
  // Simple comfort calculation
  if (temp > 85 && humidity > 70) {
    return 'Low';
  }
  
  if (temp < 40 || temp > 90 || wind > 15) {
    return 'Moderate';
  }
  
  return 'High';
}

export default AdaptiveWeatherPanel;