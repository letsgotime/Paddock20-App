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
  
  // Fetch weather data based on coordinates
  useEffect(() => {
    const fetchWeatherData = async (lat, lon) => {
      try {
        setLoading(true);
        
        // Make actual API call to our backend OpenWeather proxy
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}&units=imperial`);
        
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        setWeather(data);
        
        // Get location name from coordinates using reverse geocoding
        const geoResponse = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData && geoData.length > 0) {
            setLocationName(geoData[0].name);
          } else {
            setLocationName(data.name || 'Current Location');
          }
        } else {
          setLocationName(data.name || 'Current Location');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Unable to fetch weather data. Please try again later.');
        setLoading(false);
      }
    };
    
    // Get the user's location when component mounts
    // Use premium racing destinations as default locations in case geolocation fails
    const premiumLocations = [
      { name: "Monaco", lat: 43.7384, lon: 7.4246 },
      { name: "Spa-Francorchamps", lat: 50.4373, lon: 5.9699 },
      { name: "Silverstone", lat: 52.0786, lon: -1.0169 },
      { name: "Circuit of the Americas", lat: 30.2672, lon: -97.7431 },
      { name: "Suzuka", lat: 34.8431, lon: 136.5415 },
      { name: "Nashville", lat: 36.1627, lon: -86.7816 }
    ];

    // Pick a random premium location
    const defaultLocation = premiumLocations[Math.floor(Math.random() * premiumLocations.length)];
    
    // Try to get user's location, but don't wait indefinitely
    try {
      if (navigator.geolocation) {
        // Set a timeout for geolocation request to prevent long waits
        const geoTimeout = setTimeout(() => {
          // Default to premium location after timeout
          fetchWeatherData(defaultLocation.lat, defaultLocation.lon);
          setLocationName(defaultLocation.name);
          console.log(`Using default location: ${defaultLocation.name}`);
        }, 5000); // 5 seconds timeout
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Clear timeout as we got location successfully
            clearTimeout(geoTimeout);
            const { latitude, longitude } = position.coords;
            setCoordinates({ lat: latitude, lon: longitude });
            fetchWeatherData(latitude, longitude);
          },
          (err) => {
            // Clear timeout as we got an error response
            clearTimeout(geoTimeout);
            console.error('Error getting current location:', err);
            // Default to premium location on error
            fetchWeatherData(defaultLocation.lat, defaultLocation.lon);
            setLocationName(defaultLocation.name);
          },
          { timeout: 10000, maximumAge: 60000 } // 10s timeout, 1min cache
        );
      } else {
        // Default to premium location if geolocation not supported
        fetchWeatherData(defaultLocation.lat, defaultLocation.lon);
        setLocationName(defaultLocation.name);
      }
    } catch (err) {
      console.error('Unexpected geolocation error:', err);
      fetchWeatherData(defaultLocation.lat, defaultLocation.lon);
      setLocationName(defaultLocation.name);
    }
  }, []);

  // Helper function to fetch weather by coordinates
  const fetchWeatherByCoordinates = async (lat, lon) => {
    try {
      setLoading(true);
      
      // Make actual API call to our backend OpenWeather proxy
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}&units=imperial`);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      setWeather(data);
      
      // Get location name from coordinates using reverse geocoding
      const geoResponse = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        if (geoData && geoData.length > 0) {
          setLocationName(geoData[0].name);
        } else {
          setLocationName(data.name || 'Current Location');
        }
      } else {
        setLocationName(data.name || 'Current Location');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Unable to fetch weather data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    // Use premium racing destinations as fallback locations
    const premiumLocations = [
      { name: "Monaco", lat: 43.7384, lon: 7.4246 },
      { name: "Spa-Francorchamps", lat: 50.4373, lon: 5.9699 },
      { name: "Silverstone", lat: 52.0786, lon: -1.0169 },
      { name: "Circuit of the Americas", lat: 30.2672, lon: -97.7431 },
      { name: "Suzuka", lat: 34.8431, lon: 136.5415 },
      { name: "Nashville", lat: 36.1627, lon: -86.7816 }
    ];
    
    // Pick a random premium location as fallback
    const fallbackLocation = premiumLocations[Math.floor(Math.random() * premiumLocations.length)];
    
    // Force loading state to end if it's been too long 
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      setError("Loading timed out. Please try again.");
    }, 15000); // 15 second maximum loading time
    
    try {
      if (navigator.geolocation) {
        // Set a timeout to handle slow geolocation responses
        const geoTimeout = setTimeout(() => {
          // Use fallback location after timeout
          setCoordinates({ lat: fallbackLocation.lat, lon: fallbackLocation.lon });
          fetchWeatherByCoordinates(fallbackLocation.lat, fallbackLocation.lon);
          console.log(`Using fallback location: ${fallbackLocation.name}`);
        }, 2000); // Reduced to 2 seconds to respond faster
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Success - clear timeout and use actual position
            clearTimeout(geoTimeout);
            clearTimeout(loadingTimeout);
            const { latitude, longitude } = position.coords;
            setCoordinates({ lat: latitude, lon: longitude });
            fetchWeatherByCoordinates(latitude, longitude);
          },
          (err) => {
            // Error - clear timeout and use fallback
            clearTimeout(geoTimeout);
            console.log('Geolocation error, using fallback location:', err);
            setCoordinates({ lat: fallbackLocation.lat, lon: fallbackLocation.lon });
            fetchWeatherByCoordinates(fallbackLocation.lat, fallbackLocation.lon);
          },
          { timeout: 5000, maximumAge: 60000 } // Reduced to 5s timeout, 1min cache
        );
      } else {
        // Geolocation not supported - use fallback
        clearTimeout(loadingTimeout);
        console.log('Geolocation not available, using fallback location');
        setCoordinates({ lat: fallbackLocation.lat, lon: fallbackLocation.lon });
        fetchWeatherByCoordinates(fallbackLocation.lat, fallbackLocation.lon);
      }
    } catch (error) {
      clearTimeout(loadingTimeout);
      console.error('Unexpected error getting location:', error);
      // Use fallback in case of unexpected errors
      setCoordinates({ lat: fallbackLocation.lat, lon: fallbackLocation.lon });
      fetchWeatherByCoordinates(fallbackLocation.lat, fallbackLocation.lon);
      
      // Ensure loading state ends
      setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError("An error occurred while loading weather data.");
        }
      }, 1000);
    }
  };

  // Handle search location using OpenWeather geocoding API via our server
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    
    setShowSearch(false);
    setLoading(true);
    
    try {
      // Use the OpenWeather geocoding API to convert city name to coordinates
      const geoResponse = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      
      if (!geoResponse.ok) {
        throw new Error('Failed to find location');
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData.length) {
        throw new Error('Location not found');
      }
      
      // Get the first result's coordinates
      const { lat, lon, name } = geoData[0];
      setCoordinates({ lat, lon });
      setLocationName(name);
      
      // Fetch weather data with the coordinates
      await fetchWeatherByCoordinates(lat, lon);
    } catch (err) {
      console.error('Error searching location:', err);
      setError('Unable to find that location. Please try another search.');
      setLoading(false);
    }
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
              {Math.round(weather.main.temp)}°F
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
                <div className="text-white">{Math.round(weather.main.feels_like)}°F</div>
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
                <div className="text-white">{weather.main.humidity}%</div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded p-2 flex items-center">
              <Umbrella className="h-4 w-4 text-purple-400 mr-2" />
              <div>
                <div className="text-gray-400">Pressure</div>
                <div className="text-white">{weather.main.pressure} hPa</div>
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