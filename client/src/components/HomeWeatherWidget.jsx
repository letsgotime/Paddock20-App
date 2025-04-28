import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getWeatherData, 
  getOneCallData, 
  defaultLocation, 
  formatTemperature,
  formatTime,
  getWeatherIconUrl
} from '@/services/openWeatherService';
import { MapPin, Locate, Search, AlertTriangle, ThermometerSun, Droplets, Wind, Sunrise, Sunset, Calendar } from 'lucide-react';

const HomeWeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [oneCallData, setOneCallData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('imperial');
  const [location, setLocation] = useState(defaultLocation);
  const [locationInput, setLocationInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Fetch weather data based on the selected location
  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch basic weather data
        const currentWeather = await getWeatherData(location, unit);
        setWeatherData(currentWeather);
        
        // Fetch one-call data for additional details
        const oneCallResult = await getOneCallData(location, unit);
        setOneCallData(oneCallResult);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching weather for home widget:', err);
        setError('Failed to load weather data');
        setIsLoading(false);
      }
    }
    
    fetchWeatherData();
    
    // Refresh weather data every 15 minutes
    const refreshInterval = setInterval(fetchWeatherData, 15 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [location, unit]);

  // Handle searching for locations
  const handleSearch = async () => {
    if (!locationInput.trim()) return;
    
    setIsSearching(true);
    try {
      // Call the geocoding API through our backend proxy
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(locationInput)}`);
      if (!response.ok) throw new Error('Location search failed');
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching for location:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a location from search results
  const selectLocation = (result) => {
    setLocation({
      id: `${result.lat},${result.lon}`,
      name: result.name || result.local_names?.en || 'Unknown',
      lat: result.lat,
      lon: result.lon
    });
    setSearchResults([]);
    setLocationInput('');
  };

  // Get current location from browser
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get location name
          fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              const locationName = data[0]?.name || 'Current Location';
              setLocation({
                id: `${latitude},${longitude}`,
                name: locationName,
                lat: latitude,
                lon: longitude
              });
            })
            .catch(err => {
              console.error('Error getting location name:', err);
              // Still set the location even if we can't get the name
              setLocation({
                id: `${latitude},${longitude}`,
                name: 'Current Location',
                lat: latitude,
                lon: longitude
              });
            });
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to get your current location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  // Calculate tire pressure recommendation based on temperature
  const getTirePressureRecommendation = (temp) => {
    if (!temp) return { front: '32-34', rear: '30-32' };
    
    // Adjust tire pressure based on temperature (simplified logic)
    if (temp < 40) {
      return { front: '33-35', rear: '31-33' }; // Cold weather
    } else if (temp > 85) {
      return { front: '30-32', rear: '28-30' }; // Hot weather
    } else {
      return { front: '32-34', rear: '30-32' }; // Moderate weather
    }
  };
  
  // Calculate ideal tire temperature for Ferrari F8 based on ambient temperature
  const getIdealTireTemperature = (ambientTemp, surfaceTemp) => {
    // Basic formula for street/sport tires (more complex models would consider surface temp, speed, etc.)
    // Formula approximation: For street driving, ideal tire temp is ~170-190°F for high-performance tires
    // Adjustments are made based on ambient and surface temps
    const baseTemp = 180; // Base temperature in Fahrenheit for high-performance tires
    
    // Adjust base temp based on ambient temperature (colder = higher target, hotter = lower target)
    let adjustedTemp = baseTemp;
    
    if (ambientTemp < 50) {
      adjustedTemp = baseTemp + 10; // Colder weather requires higher target temp
    } else if (ambientTemp > 85) {
      adjustedTemp = baseTemp - 10; // Hotter weather requires lower target temp
    }
    
    // Factor in surface temperature to refine the target
    if (surfaceTemp) {
      // Surface temperature has a lesser but still significant effect (20% of the adjustment)
      const surfaceFactor = (surfaceTemp - ambientTemp) * 0.2;
      adjustedTemp -= surfaceFactor;
    }
    
    // Return a temperature range rather than a single number
    const minTemp = Math.round(adjustedTemp - 5);
    const maxTemp = Math.round(adjustedTemp + 5);
    
    return {
      fahrenheit: `${minTemp}-${maxTemp}°F`,
      celsius: `${Math.round((minTemp - 32) * 5/9)}-${Math.round((maxTemp - 32) * 5/9)}°C`
    };
  };

  // Calculate torque setting recommendation for Ferrari F8 based on conditions
  const getTorqueSettingRecommendation = (weather, temp) => {
    if (!weather || !temp) return '96 ft-lb';
    
    const weatherType = weather.toLowerCase();
    
    if (weatherType.includes('rain') || weatherType.includes('drizzle')) {
      return '72-77 ft-lb'; // Wet conditions (75-80% of max)
    } else if (weatherType.includes('snow') || temp < 32) {
      return '48-58 ft-lb'; // Snow or freezing conditions (50-60% of max)
    } else if (temp > 90) {
      return '86-91 ft-lb'; // Very hot conditions (90-95% of max)
    } else {
      return '96 ft-lb'; // Ideal conditions (100%)
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gradient-to-r from-gray-900 to-black rounded-lg animate-pulse">
        <p className="text-blue-400 font-orbitron">Loading Weather Data...</p>
      </div>
    );
  }

  if (error || !weatherData || !oneCallData) {
    return (
      <div className="p-4 bg-gradient-to-r from-gray-900 to-black rounded-lg">
        <p className="text-blue-400 font-orbitron mb-1">Drive Weather</p>
        <p className="text-sm text-gray-400">Weather data temporarily unavailable</p>
        <Link to="/weather" className="text-green-500 text-xs hover:text-green-400">
          Visit Weather Hub &rarr;
        </Link>
      </div>
    );
  }

  const { name } = location;
  const { main, weather, wind, sys } = weatherData;
  const current = oneCallData.current;
  
  // Calculate surface temperature (simplified estimate)
  const surfaceTemp = (main.temp * 0.9) + (current.uvi * 0.5);
  const tirePressure = getTirePressureRecommendation(main.temp);
  const torqueSetting = getTorqueSettingRecommendation(weather[0].main, main.temp);
  const idealTireTemp = getIdealTireTemperature(main.temp, surfaceTemp);

  return (
    <div className="p-6 bg-gradient-to-r from-gray-900 to-black rounded-lg border border-gray-800 shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-blue-400 font-orbitron text-xl">Live Weather Station</h3>
          <p className="text-gray-400 text-xs">Enthusiast-grade automotive metrics</p>
        </div>
        <Link to="/weather" className="text-green-500 text-xs hover:text-green-400 bg-black/30 px-3 py-1 rounded-md">
          Full Weather Center &rarr;
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current conditions panel */}
        <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
          <div className="flex items-center mb-3">
            <div>
              <p className="text-white text-2xl font-semibold">{formatTemperature(main.temp, unit)}</p>
              <p className="text-gray-400 capitalize">{weather[0].description}</p>
            </div>
            {weather[0].icon && (
              <img 
                src={getWeatherIconUrl(weather[0].icon)} 
                alt={weather[0].description}
                className="h-14 w-14 ml-3"
              />
            )}
          </div>
          <div className="space-y-2 text-sm mt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Time:</span>
              <span className="text-white font-mono">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.586l3.707-3.707a1 1 0 111.414 1.414l-3.707 3.707H14a1 1 0 110 2h-4a1 1 0 01-1-1V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 text-xs">{formatTime(sys.sunrise)}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a1 1 0 01-1-1v-1.586l-3.707 3.707a1 1 0 11-1.414-1.414l3.707-3.707H6a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 text-xs">{formatTime(sys.sunset)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enthusiast metrics panel */}
        <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
          <h4 className="text-blue-400 font-medium mb-3">Surface Intelligence</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Surface Temp:</span>
              <span className="text-white">{formatTemperature(surfaceTemp, unit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Wind:</span>
              <span className="text-white">{Math.round(wind.speed)} {unit === 'imperial' ? 'mph' : 'm/s'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Humidity:</span>
              <span className="text-white">{main.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pressure:</span>
              <span className="text-white">{main.pressure} hPa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">UV Index:</span>
              <span className="text-white">{current.uvi || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {/* Drive checklist panel */}
        <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
          <h4 className="text-green-500 font-medium mb-3">Fun Drive Checklist</h4>
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-gray-900 to-black/50 p-3 rounded border border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Torque Settings:</span>
                <span className="text-green-400 font-medium">{torqueSetting}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 italic">
                {torqueSetting === '96 ft-lb' ? 'Ferrari F8 - Ideal conditions for full torque' : 'Ferrari F8 - Adjusted for current surface conditions'}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-900 to-black/50 p-3 rounded border border-gray-800">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-300 text-sm">Front Tires:</p>
                  <p className="text-green-400 font-medium">{tirePressure.front} psi</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Rear Tires:</p>
                  <p className="text-green-400 font-medium">{tirePressure.rear} psi</p>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 italic">
                Optimized for current surface temperature
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-900 to-black/50 p-3 rounded border border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Ideal Tire Temp:</span>
                <span className="text-green-400 font-medium">{idealTireTemp.fahrenheit}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 italic">
                Ferrari F8 - Performance tire optimal operating range
              </div>
              <div className="mt-2 bg-gradient-to-r from-blue-900/30 to-red-900/30 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-green-500 to-red-500 h-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Cold</span>
                <span>Optimal Zone</span>
                <span>Overheated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between">
        <span>Location: {name}</span>
        <span>Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
    </div>
  );
};

export default HomeWeatherWidget;