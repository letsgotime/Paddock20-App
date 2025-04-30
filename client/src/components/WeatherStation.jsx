import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, ThermometerSun, Droplets, Umbrella, Navigation } from 'lucide-react';

/**
 * WeatherStation Component
 * Displays weather information for the current location or a user-defined location
 */
const WeatherStation = () => {
  // State for weather data
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('Current Location');
  const [coordinates, setCoordinates] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Fetch weather data 
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // In a real implementation, this would make an API call to OpenWeather
        // For now we'll just simulate with a placeholder state
        setLoading(true);
        
        // Always provide default data without trying to access API
        setTimeout(() => {
          setWeather({
            temp: 72,
            feels_like: 74,
            temp_min: 68,
            temp_max: 78,
            humidity: 65,
            pressure: 1012,
            weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
            wind: { speed: 5.2, deg: 200 },
            visibility: 10000,
            name: 'San Francisco',
            dt: Date.now() / 1000,
            sys: { sunrise: Date.now() / 1000 - 25200, sunset: Date.now() / 1000 + 25200 }
          });
          setLocationName('San Francisco, CA');
          setLoading(false);
        }, 700);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Unable to fetch weather data. Please try again later.');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to get your current location. Please allow location access or search for a location.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please search for a location.');
      setLoading(false);
    }
  };

  // Handle search location
  const handleSearchLocation = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // In a real implementation, this would use a geocoding API
    // For now, we'll just update the state directly
    setLocationName(searchQuery);
    setShowSearch(false);
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setWeather({
        temp: 68,
        feels_like: 70,
        temp_min: 64,
        temp_max: 72,
        humidity: 70,
        pressure: 1010,
        weather: [{ main: 'Clouds', description: 'few clouds', icon: '02d' }],
        wind: { speed: 6.8, deg: 225 },
        visibility: 9000,
        name: searchQuery,
        dt: Date.now() / 1000,
        sys: { sunrise: Date.now() / 1000 - 25200, sunset: Date.now() / 1000 + 25200 }
      });
      setLoading(false);
    }, 700);
  };

  // Get weather icon based on weather condition
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'Clouds':
        return <Cloud className="h-6 w-6 text-gray-400" />;
      case 'Rain':
      case 'Drizzle':
        return <CloudRain className="h-6 w-6 text-blue-400" />;
      case 'Snow':
        return <CloudSnow className="h-6 w-6 text-blue-200" />;
      case 'Thunderstorm':
        return <CloudRain className="h-6 w-6 text-purple-500" />;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return <Cloud className="h-6 w-6 text-gray-300" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  // Format time from timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 w-32 bg-gray-700 rounded"></div>
          <div className="h-5 w-8 bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="h-16 w-16 bg-gray-700 rounded-full"></div>
        </div>
        <div className="h-5 w-24 mx-auto bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-center py-6">
          <Cloud className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-400 mb-2">Weather Unavailable</h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button 
            onClick={getCurrentLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render weather data
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      {/* Header with location and controls */}
      <div className="bg-gray-900 py-2 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Navigation className="h-4 w-4 text-blue-400 mr-2" />
          <h3 className="text-gray-200 font-medium text-sm">{locationName}</h3>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="text-gray-400 hover:text-white text-xs"
          >
            {showSearch ? 'Cancel' : 'Search'}
          </button>
          <button 
            onClick={getCurrentLocation}
            className="text-blue-400 hover:text-blue-300 text-xs"
          >
            Current
          </button>
        </div>
      </div>
      
      {/* Search form */}
      {showSearch && (
        <div className="p-2 bg-gray-850 border-b border-gray-700">
          <form onSubmit={handleSearchLocation} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="City name..."
              className="flex-grow bg-gray-700 text-white text-sm rounded-l px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white text-sm py-1 px-3 rounded-r hover:bg-blue-700"
            >
              Go
            </button>
          </form>
        </div>
      )}
      
      {weather && (
        <div className="p-4">
          {/* Main weather display */}
          <div className="flex flex-col items-center mb-4">
            {getWeatherIcon(weather.weather[0].main)}
            <div className="text-3xl font-bold text-white mt-2">
              {Math.round(weather.temp)}°F
            </div>
            <div className="text-gray-400 text-sm">
              {weather.weather[0].description}
            </div>
          </div>
          
          {/* Weather details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-900 rounded p-2 flex items-center">
              <ThermometerSun className="h-4 w-4 text-yellow-500 mr-2" />
              <div>
                <div className="text-gray-400">Feels Like</div>
                <div className="text-white">{Math.round(weather.feels_like)}°F</div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded p-2 flex items-center">
              <Wind className="h-4 w-4 text-blue-400 mr-2" />
              <div>
                <div className="text-gray-400">Wind</div>
                <div className="text-white">{Math.round(weather.wind.speed)} mph</div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded p-2 flex items-center">
              <Droplets className="h-4 w-4 text-blue-500 mr-2" />
              <div>
                <div className="text-gray-400">Humidity</div>
                <div className="text-white">{weather.humidity}%</div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded p-2 flex items-center">
              <Umbrella className="h-4 w-4 text-purple-400 mr-2" />
              <div>
                <div className="text-gray-400">Pressure</div>
                <div className="text-white">{weather.pressure} hPa</div>
              </div>
            </div>
          </div>
          
          {/* Sunrise/Sunset */}
          <div className="flex justify-between mt-4 text-xs text-gray-400">
            <div>
              <span>Sunrise: </span>
              <span className="text-gray-300">{formatTime(weather.sys.sunrise)}</span>
            </div>
            <div>
              <span>Sunset: </span>
              <span className="text-gray-300">{formatTime(weather.sys.sunset)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherStation;