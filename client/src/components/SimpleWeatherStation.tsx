import React, { useEffect, useRef } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import LocationSelector from './LocationSelector';
import { Loader2, AlertCircle, CloudRain, Wind, Thermometer, DropletIcon } from 'lucide-react';
import { LiveRegion, generateWeatherDescription } from '../lib/accessibility';
import AutomotiveWeatherPanel from './AutomotiveWeatherPanel';

/**
 * SimpleWeatherStation - A more streamlined version of the weather station
 * that follows the original UI layout while still using our enhanced data
 */
const SimpleWeatherStation: React.FC = () => {
  const { 
    unit, 
    setUnit, 
    isLoading, 
    error, 
    weatherData,
    refreshWeather 
  } = useWeather();
  
  // Reference to a live region for screen reader announcements
  const liveRegionRef = useRef<LiveRegion | null>(null);

  // Create live region on component mount
  useEffect(() => {
    liveRegionRef.current = new LiveRegion('polite');
    
    return () => {
      if (liveRegionRef.current) {
        liveRegionRef.current.remove();
      }
    };
  }, []);

  // Announce weather data changes to screen readers
  useEffect(() => {
    if (weatherData && !isLoading && !error && liveRegionRef.current) {
      // Delay the announcement slightly to ensure the UI has updated
      const timer = setTimeout(() => {
        const weatherDescription = generateWeatherDescription(weatherData, unit);
        liveRegionRef.current?.announce("Weather data updated. " + weatherDescription);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [weatherData, isLoading, error, unit]);

  // Format the current date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format the last updated time
  const lastUpdated = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-orbitron text-blue-400 tracking-wide mb-4 sm:mb-0">
            Paddock20 Weather Center
          </h1>
          
          {/* Unit Toggle */}
          <div className="flex items-center bg-gray-900 rounded-lg p-2">
            <span className="font-medium mr-3">Units:</span>
            <div className="flex rounded overflow-hidden">
              <button 
                onClick={() => setUnit('metric')} 
                className={`px-4 py-2 ${unit === 'metric' ? 'bg-blue-500' : 'bg-gray-900'} text-white font-medium transition-colors`}
                aria-pressed={unit === 'metric'}
                aria-label="Switch to Celsius"
              >
                °C
              </button>
              <button 
                onClick={() => setUnit('imperial')} 
                className={`px-4 py-2 ${unit === 'imperial' ? 'bg-blue-500' : 'bg-gray-900'} text-white font-medium transition-colors`}
                aria-pressed={unit === 'imperial'}
                aria-label="Switch to Fahrenheit"
              >
                °F
              </button>
            </div>
          </div>
        </div>
        <p className="text-gray-400 mt-2">{formattedDate}</p>
      </header>

      {/* Location Selection Area */}
      <LocationSelector />

      {/* Weather Loading State */}
      {isLoading && (
        <div className="bg-gray-900 rounded-xl p-8 text-center" aria-live="polite">
          <div className="flex items-center justify-center mb-4" aria-hidden="true">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
          </div>
          <p className="text-xl">Loading Weather Data...</p>
          <p className="text-gray-400 mt-2">Please wait while we fetch the latest information</p>
        </div>
      )}

      {/* Weather Error State */}
      {(error || (!weatherData && !isLoading)) && (
        <div className="bg-gray-900 rounded-xl p-8 text-center" aria-live="assertive" role="alert">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
          <p className="text-xl text-red-500">Unable to load weather data</p>
          <p className="text-gray-400 mt-2">{error ? (error.message || 'Please check your connection and try again') : 'Could not retrieve weather information. Please try again.'}</p>
          <button 
            onClick={refreshWeather} 
            className="mt-4 px-5 py-2 bg-blue-500 hover:bg-blue-600 transition-colors rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            aria-label="Retry loading weather data"
          >
            Retry
          </button>
        </div>
      )}

      {/* Weather Data Display */}
      {!isLoading && !error && weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Current Weather Panel */}
          <div className="lg:col-span-5 bg-gray-900 rounded-xl p-6">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="mb-2">
                <img 
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
                  alt={weatherData.weather[0].description}
                  className="w-20 h-20"
                />
              </div>
              <h2 className="text-4xl font-semibold mb-2">
                {Math.round(weatherData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
              </h2>
              <p className="text-lg text-gray-300 capitalize">{weatherData.weather[0].description}</p>
              <p className="text-gray-400 mt-1">{weatherData.name}, {weatherData.sys.country}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-black bg-opacity-50 p-4 rounded-lg flex items-center">
                <Thermometer className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Feels Like</p>
                  <p className="text-xl font-semibold">{Math.round(weatherData.main.feels_like)}°{unit === 'metric' ? 'C' : 'F'}</p>
                </div>
              </div>
              
              <div className="bg-black bg-opacity-50 p-4 rounded-lg flex items-center">
                <DropletIcon className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Humidity</p>
                  <p className="text-xl font-semibold">{weatherData.main.humidity}%</p>
                </div>
              </div>
              
              <div className="bg-black bg-opacity-50 p-4 rounded-lg flex items-center">
                <Wind className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Wind</p>
                  <p className="text-xl font-semibold">
                    {Math.round(weatherData.wind.speed)} {unit === 'metric' ? 'm/s' : 'mph'}
                  </p>
                </div>
              </div>
              
              <div className="bg-black bg-opacity-50 p-4 rounded-lg flex items-center">
                <CloudRain className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Pressure</p>
                  <p className="text-xl font-semibold">{weatherData.main.pressure} hPa</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Automotive Weather Panel */}
          <div className="lg:col-span-7">
            <AutomotiveWeatherPanel />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 sm:mb-0">
            <p>Weather data provided by OpenWeatherMap</p>
            <p className="mt-1">Enhanced automotive data powered by AccuWeather</p>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>Last updated: <span>{lastUpdated}</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleWeatherStation;