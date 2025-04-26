import React from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import LocationSelector from './LocationSelector';
import CurrentWeather from './CurrentWeather';
import WeatherCards from './WeatherCards';
import HourlyForecast from './HourlyForecast';
import FiveDayForecast from './FiveDayForecast';
import WeatherMap from './WeatherMap';
import WeatherAlerts from './WeatherAlerts';
import WeatherStats from './WeatherStats';
import { Loader2, AlertCircle } from 'lucide-react';

const WeatherStation: React.FC = () => {
  const { 
    unit, 
    setUnit, 
    isLoading, 
    error, 
    weatherData, 
    refreshWeather 
  } = useWeather();

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
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-orbitron text-blue-400 tracking-wide mb-4 sm:mb-0">
            Weather Station
          </h1>
          
          {/* Unit Toggle */}
          <div className="flex items-center bg-gray-900 rounded-lg p-2">
            <span className="font-medium mr-3">Units:</span>
            <div className="flex rounded overflow-hidden">
              <button 
                onClick={() => setUnit('metric')} 
                className={`px-4 py-2 ${unit === 'metric' ? 'bg-blue-500' : 'bg-gray-900'} text-white font-medium transition-colors`}
              >
                °C
              </button>
              <button 
                onClick={() => setUnit('imperial')} 
                className={`px-4 py-2 ${unit === 'imperial' ? 'bg-blue-500' : 'bg-gray-900'} text-white font-medium transition-colors`}
              >
                °F
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Location Selection Area */}
      <LocationSelector />

      {/* Main Weather Display */}
      {isLoading && (
        <div className="bg-gray-900 rounded-xl p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
          </div>
          <p className="text-xl">Loading Weather Data...</p>
          <p className="text-gray-400 mt-2">Please wait while we fetch the latest information</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-gray-900 rounded-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-500">Unable to load weather data</p>
          <p className="text-gray-400 mt-2">{error.message || 'Please check your connection and try again'}</p>
          <button 
            onClick={refreshWeather} 
            className="mt-4 px-5 py-2 bg-blue-500 hover:bg-blue-600 transition-colors rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {weatherData && !isLoading && !error && (
        <>
          <CurrentWeather />
          <WeatherAlerts />
          <WeatherCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <HourlyForecast />
            <FiveDayForecast />
          </div>
          <WeatherStats />
          <WeatherMap />
        </>
      )}

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 sm:mb-0">
            <p>Data provided by OpenWeatherMap</p>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>Last updated: <span id="last-updated">{lastUpdated}</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeatherStation;
