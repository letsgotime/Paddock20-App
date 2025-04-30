import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WeatherMoodEmoji from './WeatherMoodEmoji';
import DrivingConditionEmoji from './DrivingConditionEmoji';
import WeatherVoiceOver from './WeatherVoiceOver';
import WeatherLocationSelector from './WeatherLocationSelector';
import { 
  Droplets, Wind, Sun, CloudRain, Thermometer, 
  ArrowUp, Compass, Clock, Map, MapPin, Calendar,
  RefreshCw, Locate, Sunrise, Sunset 
} from 'lucide-react';

function WeatherStation({ expanded = false }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempUnit, setTempUnit] = useState('F'); // Default to Fahrenheit
  const [oneCallData, setOneCallData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [location, setLocation] = useState({
    lat: 35.2271, // Default to Charlotte, NC
    lon: -80.8431,
    name: 'Loading location...'
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  
  // Helper to determine if it's night time
  const isNightTime = () => {
    if (!weatherData || !weatherData.sys) return false;
    const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
    return now < weatherData.sys.sunrise || now > weatherData.sys.sunset;
  };

  // Get browser location if user allows
  useEffect(() => {
    const getBrowserLocation = () => {
      if (navigator.geolocation && useCurrentLocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              name: 'Current Location'
            });
          },
          (err) => {
            console.error('Error getting location:', err);
            // Fall back to default location
          },
          { timeout: 7000, enableHighAccuracy: true }
        );
      }
    };
    
    getBrowserLocation();
  }, [useCurrentLocation]);

  // Handle location change from the selector
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };
  
  // Fetch location name using reverse geocoding
  useEffect(() => {
    const getLocationName = async () => {
      if (!location.lat || !location.lon) return;
      
      try {
        const response = await fetch(`/api/reverse-geocode?lat=${location.lat}&lon=${location.lon}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setLocationName(data[0].name);
        }
      } catch (error) {
        console.error('Error getting location name:', error);
      }
    };
    
    getLocationName();
  }, [location.lat, location.lon]);
  
  // Fetch weather data
  useEffect(() => {
    if (!location.lat || !location.lon) return; // Skip if location is not available
    
    async function fetchWeatherData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch basic weather data
        const weatherResponse = await fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}&units=imperial`);
        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const weatherResult = await weatherResponse.json();
        setWeatherData(weatherResult);
        
        // Fetch OneCall data with hourly and daily forecasts
        const oneCallResponse = await fetch(`/api/onecall?lat=${location.lat}&lon=${location.lon}&units=imperial`);
        if (!oneCallResponse.ok) {
          throw new Error('Failed to fetch one call data');
        }
        const oneCallResult = await oneCallResponse.json();
        setOneCallData(oneCallResult);
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(`/api/forecast?lat=${location.lat}&lon=${location.lon}&units=imperial`);
        if (!forecastResponse.ok) {
          throw new Error('Failed to fetch forecast data');
        }
        const forecastResult = await forecastResponse.json();
        setForecastData(forecastResult);
        
        // Update last updated timestamp
        setLastUpdated(new Date());
        
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchWeatherData();
    
    // Set up auto refresh every 30 minutes
    const refreshInterval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [location.lat, location.lon]);

  const toggleUnit = () => {
    setTempUnit(tempUnit === 'F' ? 'C' : 'F');
  };

  const convertTemp = (temp) => {
    if (temp === undefined || temp === null) return 'N/A';
    return tempUnit === 'F' ? Math.round(temp) : Math.round((temp - 32) * 5/9);
  };
  
  const refreshWeather = () => {
    // Trigger a refresh of the weather data
    if (location.lat && location.lon) {
      setLoading(true);
      // This will trigger the useEffect
    }
  };
  
  const toggleCurrentLocation = () => {
    setUseCurrentLocation(!useCurrentLocation);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-white">Loading weather data...</p>
      </div>
    );
  }

  if (error || !weatherData || !weatherData.main || !weatherData.wind) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 rounded-xl border border-red-900/30">
        <div className="text-red-500 text-xl mb-3">Unable to load weather data</div>
        <p className="text-gray-400 mb-4">Please check your connection and try again.</p>
        <button 
          onClick={refreshWeather}
          className="px-4 py-2 bg-blue-900/40 hover:bg-blue-900/60 text-white rounded-md border border-blue-800/40 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  // Calculate derived weather values
  const surfaceTempApprox = weatherData.main.temp + 3;
  const weatherCondition = weatherData.weather && weatherData.weather.length > 0 
    ? weatherData.weather[0].main 
    : '';
  const weatherDescription = weatherData.weather && weatherData.weather.length > 0 
    ? weatherData.weather[0].description
    : '';
  const weatherIcon = weatherData.weather && weatherData.weather.length > 0
    ? weatherData.weather[0].icon
    : '';

  // Get precipitation amount - approximate from conditions if necessary
  const precipitation = 
    weatherDescription.includes('rain') || weatherDescription.includes('shower') 
      ? (weatherDescription.includes('light') ? 0.05 : 
         weatherDescription.includes('heavy') ? 0.4 : 0.2)
      : 0;
  
  // Format and prepare display values
  const displayLocation = locationName || location.name || 'Current Location';
  const formattedTime = lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = lastUpdated.toLocaleDateString([], { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
  
  // Format sunrise and sunset times
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const sunrise = weatherData.sys ? formatTime(weatherData.sys.sunrise) : 'N/A';
  const sunset = weatherData.sys ? formatTime(weatherData.sys.sunset) : 'N/A';

  return (
    <div className={`weather-station-container ${expanded ? 'max-w-full' : 'max-w-2xl mx-auto'}`}>
      {/* Header with location and time */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-t-xl border-b border-blue-900/30 flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-white font-orbitron text-lg">{displayLocation}</h2>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={toggleCurrentLocation}
            className={`p-2 rounded-full ${useCurrentLocation ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'}`}
            aria-label={useCurrentLocation ? 'Using current location' : 'Use current location'}
            title={useCurrentLocation ? 'Using current location' : 'Use current location'}
          >
            <Locate className="h-4 w-4" />
          </button>
          
          <button 
            onClick={refreshWeather}
            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
            aria-label="Refresh weather data"
            title="Refresh weather data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button 
            onClick={toggleUnit}
            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
            aria-label={`Switch to ${tempUnit === 'F' ? 'Celsius' : 'Fahrenheit'}`}
            title={`Switch to ${tempUnit === 'F' ? 'Celsius' : 'Fahrenheit'}`}
          >
            °{tempUnit === 'F' ? 'C' : 'F'}
          </button>
        </div>
      </div>
      
      <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-b-xl border border-blue-500/20 border-t-0">
        {/* Current Weather Overview */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            {weatherIcon && (
              <img 
                src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`} 
                alt={weatherDescription}
                className="w-20 h-20 mr-4"
              />
            )}
            <div className="text-center md:text-left">
              <div className="text-4xl text-white font-bold mb-1">{convertTemp(weatherData.main.temp)}°{tempUnit}</div>
              <div className="text-blue-400 font-medium capitalize">{weatherDescription}</div>
              <div className="text-gray-400 text-sm flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {formattedTime} • {formattedDate}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center bg-black/30 p-2 rounded">
              <Sunrise className="h-4 w-4 text-yellow-500 mb-1" />
              <div className="text-xs text-gray-400">Sunrise</div>
              <div className="text-sm text-white">{sunrise}</div>
            </div>
            <div className="flex flex-col items-center bg-black/30 p-2 rounded">
              <Sunset className="h-4 w-4 text-orange-500 mb-1" />
              <div className="text-xs text-gray-400">Sunset</div>
              <div className="text-sm text-white">{sunset}</div>
            </div>
          </div>
        </div>
      
        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-800/50 p-3 rounded-lg flex flex-col items-center">
            <Thermometer className="h-5 w-5 text-blue-400 mb-1" />
            <span className="text-xs text-gray-400">Feels Like</span>
            <span className="text-lg text-white">
              {convertTemp(weatherData.main.feels_like)}°{tempUnit}
            </span>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-lg flex flex-col items-center">
            <Droplets className="h-5 w-5 text-blue-400 mb-1" />
            <span className="text-xs text-gray-400">Humidity</span>
            <span className="text-lg text-white">{weatherData.main.humidity}%</span>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-lg flex flex-col items-center">
            <Wind className="h-5 w-5 text-blue-400 mb-1" />
            <span className="text-xs text-gray-400">Wind</span>
            <span className="text-lg text-white">{Math.round(weatherData.wind.speed)} mph</span>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-lg flex flex-col items-center">
            <Compass className="h-5 w-5 text-blue-400 mb-1" />
            <span className="text-xs text-gray-400">Pressure</span>
            <span className="text-lg text-white">{weatherData.main.pressure} hPa</span>
          </div>
        </div>
        
        {/* Weather Mood and Activities (when expanded) */}
        {expanded && (
          <div className="weather-mood-container mt-8 mb-6">
            <WeatherMoodEmoji 
              weatherCondition={weatherCondition || weatherDescription} 
              isNight={isNightTime()}
            />
          </div>
        )}
        
        {/* Driving Conditions */}
        <div className="driving-conditions-container mt-6">
          <DrivingConditionEmoji 
            weatherData={weatherData}
          />
        </div>
        
        {/* Weather Voice Over (accessibility feature) */}
        <div className="mt-6">
          <WeatherVoiceOver 
            weatherData={weatherData}
            forecastData={forecastData}
            drivingCondition={{
              text: weatherCondition ? 'Moderate driving conditions' : 'Good driving conditions',
              drivingTip: precipitation > 0 
                ? 'Drive carefully on wet roads and allow for extra stopping distance.' 
                : 'Road conditions are generally good. Maintain safe driving practices.'
            }}
          />
        </div>
        
        {/* Navigation and Checklist - only show in expanded view */}
        {expanded && (
          <div className="mt-8">
            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <a 
                href={`https://waze.com/ul?ll=${location.lat},${location.lon}&navigate=yes`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-white rounded-md flex items-center"
              >
                <Map className="h-4 w-4 mr-2" />
                Waze Navigation
              </a>
              <a 
                href={`http://maps.apple.com/?daddr=${location.lat},${location.lon}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-white rounded-md flex items-center"
              >
                <Map className="h-4 w-4 mr-2" />
                Apple Maps
              </a>
              <Link 
                to="/seasonal-checklist" 
                className="px-4 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-white rounded-md flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Seasonal Checklist
              </Link>
            </div>
          </div>
        )}
        
        {!expanded && (
          <div className="mt-6 text-center">
            <Link 
              to="/weather" 
              className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center"
            >
              View Full Weather Dashboard
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Fix missing imports
const ChevronRight = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default WeatherStation;
