import React, { useState, useEffect } from 'react';
import { 
  getWeatherData, 
  getOneCallData, 
  getAutomotiveWeatherData,
  defaultLocation, 
  formatTemperature,
  formatTime,
  getWeatherIconUrl
} from '@/services/openWeatherService';
import { MapPin, Locate, Search } from 'lucide-react';

/**
 * AutomotiveEnthusiastWeather - Specialized weather station with F1-level 
 * metrics for automotive enthusiasts
 */
const AutomotiveEnthusiastWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [oneCallData, setOneCallData] = useState(null);
  const [automotiveData, setAutomotiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('imperial');
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [activeTab, setActiveTab] = useState('surface');
  const [locationInput, setLocationInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    async function fetchAllWeatherData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Step 1: First try to get current weather data (most reliable endpoint)
        const current = await getWeatherData(selectedLocation, unit);
        setWeatherData(current);
        
        // Step 2: Try to get automotive data (also reliable)
        try {
          const automotive = await getAutomotiveWeatherData(selectedLocation, unit);
          setAutomotiveData(automotive);
        } catch (autoErr) {
          console.error('Error fetching automotive weather data:', autoErr);
        }
        
        // Step 3: Try to get OneCall data (often rate limited)
        try {
          const oneCall = await getOneCallData(selectedLocation, unit);
          setOneCallData(oneCall);
        } catch (oneCallErr) {
          console.error('Error fetching OneCall data:', oneCallErr);
          // OneCall errors are common due to rate limits, don't fail the entire component
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Unable to load weather data. Please check your connection and try again.');
        setIsLoading(false);
      }
    }
    
    fetchAllWeatherData();
    
    // Add a fallback timer to ensure component displays even if APIs are slow
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.log("Auto-cancelling weather data loading after timeout");
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(fallbackTimer);
  }, [selectedLocation, unit, isLoading]);

  // Toggle between metric and imperial units
  const toggleUnit = () => {
    setUnit(prevUnit => prevUnit === 'imperial' ? 'metric' : 'imperial');
  };
  
  // Search for locations by name
  const searchLocations = async (query) => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search for locations');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching locations:', err);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchLocations(locationInput);
  };
  
  // Select a location from search results
  const selectLocation = (location) => {
    setSelectedLocation({
      lat: location.lat,
      lon: location.lon,
      name: location.name + (location.state ? `, ${location.state}` : '') + (location.country ? `, ${location.country}` : '')
    });
    setSearchResults([]);
    setLocationInput('');
  };
  
  // Get user's current location using browser geolocation
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Get location name using reverse geocoding
            const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
            
            if (!response.ok) {
              throw new Error('Failed to get location name');
            }
            
            const data = await response.json();
            if (data && data.length > 0) {
              const location = data[0];
              setSelectedLocation({
                lat: latitude,
                lon: longitude,
                name: location.name + (location.state ? `, ${location.state}` : '') + (location.country ? `, ${location.country}` : '')
              });
            } else {
              setSelectedLocation({
                lat: latitude,
                lon: longitude,
                name: 'Current Location'
              });
            }
          } catch (err) {
            console.error('Error getting current location:', err);
            setError('Failed to get current location. Please try again.');
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to access your location. Please enable location services or enter a location manually.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please enter a location manually.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black">
        <p className="text-blue-400 text-xl font-orbitron mb-4">Loading Automotive Weather Data...</p>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black border border-red-900/30">
        <p className="text-blue-400 text-xl font-orbitron mb-2">Automotive Weather Hub</p>
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ⟳ Try again
        </button>
      </div>
    );
  }

  if (!weatherData || !oneCallData || !automotiveData) {
    return (
      <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black">
        <p className="text-blue-400 text-xl font-orbitron mb-2">Automotive Weather Hub</p>
        <p className="text-gray-400">No automotive weather data available</p>
      </div>
    );
  }

  const { name } = selectedLocation; 
  const { main, weather, wind, sys } = weatherData;
  const current = oneCallData.current;
  const daily = oneCallData.daily?.[0] || {};
  
  // Automotive-specific data
  const { surfaces, performance, drivingConditions } = automotiveData;

  return (
    <div className="rounded-lg bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-gray-800 p-6">
      {/* Location search and controls */}
      <div className="mb-4 bg-black/30 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-3 md:mb-0">
            <h2 className="text-blue-400 font-orbitron text-xl flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{name}</span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex">
              <div className="relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Search location..."
                  className="bg-black/80 text-white border border-gray-700 rounded-l px-3 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
                  aria-label="Enter a city or location"
                />
                {isSearching && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button 
                type="submit"
                className="bg-blue-900/60 text-blue-400 px-3 py-2 rounded-r border border-blue-800 hover:bg-blue-900/80"
                aria-label="Search for location"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
            
            <button
              onClick={getCurrentLocation}
              className="bg-green-900/60 text-green-400 px-3 py-2 rounded border border-green-800 hover:bg-green-900/80 flex items-center justify-center"
              aria-label="Use current location"
            >
              <Locate className="w-4 h-4 mr-1" />
              <span className="text-sm">Current Location</span>
            </button>
            
            <button 
              onClick={toggleUnit}
              className="px-3 py-2 bg-blue-900/30 text-blue-400 rounded border border-blue-800 hover:bg-blue-900/50 transition-colors text-sm"
              aria-label="Toggle temperature units"
            >
              {unit === 'imperial' ? '°F' : '°C'} → {unit === 'imperial' ? '°C' : '°F'}
            </button>
          </div>
        </div>
        
        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-black/80 border border-gray-800 rounded-md overflow-hidden">
            <ul className="max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <li 
                  key={index}
                  className="border-b border-gray-800 last:border-0 hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={() => selectLocation(result)}
                >
                  <div className="p-2 text-white flex items-center">
                    <MapPin className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                    <div>
                      <p>{result.name}{result.state ? `, ${result.state}` : ''}</p>
                      <p className="text-xs text-gray-400">{result.country}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-blue-400 font-orbitron text-2xl flex items-center">
            <span>Paddock20™ Weather // {name}</span>
            {weather[0].icon && (
              <img 
                src={getWeatherIconUrl(weather[0].icon)} 
                alt={weather[0].description}
                className="h-12 w-12 ml-2"
              />
            )}
          </h2>
          <p className="text-gray-300 capitalize">{weather[0].description}</p>
        </div>
        <button 
          onClick={toggleUnit}
          className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 transition-colors text-sm"
        >
          {unit === 'imperial' ? '°F' : '°C'} → {unit === 'imperial' ? '°C' : '°F'}
        </button>
      </div>
      
      {/* Add a small location search bar underneath, subtle but functional */}
      <div className="bg-black/20 p-2 rounded-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex items-center text-gray-400 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span>Location:</span>
        </div>
        <div className="flex flex-1">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-xs">
            <div className="relative flex-1">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Search location..."
                className="bg-black/80 w-full text-white border border-gray-800 rounded-l px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
              />
              {isSearching && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button 
              type="submit"
              className="bg-blue-900/40 text-blue-400 px-2 py-1 rounded-r border border-blue-900 text-sm"
              aria-label="Search for location"
            >
              <Search className="w-3 h-3" />
            </button>
          </form>
          <button
            onClick={getCurrentLocation}
            className="ml-2 bg-green-900/40 text-green-400 px-2 py-1 rounded border border-green-900 text-sm flex items-center"
            aria-label="Use current location"
          >
            <Locate className="w-3 h-3" />
            <span className="ml-1 hidden sm:inline">Current</span>
          </button>
        </div>
        
        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-16 ml-12 sm:ml-24 bg-black/90 border border-gray-800 rounded-md overflow-hidden shadow-lg">
            <ul className="max-h-60 overflow-y-auto w-64">
              {searchResults.map((result, index) => (
                <li 
                  key={index}
                  className="border-b border-gray-800 last:border-0 hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={() => selectLocation(result)}
                >
                  <div className="p-2 text-white flex items-center">
                    <MapPin className="w-3 h-3 text-blue-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm">{result.name}{result.state ? `, ${result.state}` : ''}</p>
                      <p className="text-xs text-gray-400">{result.country}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Current conditions summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-black/30 p-4 rounded-lg">
          <div className="mb-4">
            <div className="flex items-end">
              <span className="text-white text-4xl font-semibold">
                {formatTemperature(main.temp, unit)}
              </span>
              <span className="text-gray-400 ml-2 text-lg">
                feels like {formatTemperature(main.feels_like, unit)}
              </span>
            </div>
            <div className="text-gray-400 flex mt-1">
              <span className="mr-4">H: {formatTemperature(daily.temp?.max || main.temp_max, unit)}</span>
              <span>L: {formatTemperature(daily.temp?.min || main.temp_min, unit)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Humidity</p>
              <p className="text-white">{main.humidity}%</p>
            </div>
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Wind</p>
              <p className="text-white">{Math.round(wind.speed)} {unit === 'imperial' ? 'mph' : 'm/s'}</p>
            </div>
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Pressure</p>
              <p className="text-white">{main.pressure} hPa</p>
            </div>
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">UV Index</p>
              <p className="text-white">{current.uvi || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Driving conditions summary */}
        <div className="bg-black/30 p-4 rounded-lg">
          <h3 className="text-green-500 font-orbitron text-lg mb-3">Driving Conditions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Risk Level</p>
              <p className={getRiskLevelColor(drivingConditions.riskLevel)}>{drivingConditions.riskLevel}</p>
            </div>
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Road Temp</p>
              <p className="text-white">{formatTemperature(surfaces.asphalt.temperature, unit)}</p>
            </div>
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Traction</p>
              <p className="text-white">{drivingConditions.traction}</p>
            </div>
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Visibility</p>
              <p className="text-white">{drivingConditions.visibility}</p>
            </div>
          </div>
          
          <div className="mt-3 text-gray-300 text-sm italic">
            {drivingConditions.advisories && (
              <p>{drivingConditions.advisories[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for detailed information */}
      <div className="border-b border-gray-800 mb-4">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'surface' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('surface')}
          >
            Surface Conditions
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'performance' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance Metrics
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'forecast' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('forecast')}
          >
            Drive Forecast
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'surface' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 p-4 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-3">Asphalt Surface</h4>
              <p className="text-white mb-2">Temperature: {formatTemperature(surfaces.asphalt.temperature, unit)}</p>
              <p className="text-white mb-2">Condition: {surfaces.asphalt.condition}</p>
              <p className="text-white">Grip Level: {surfaces.asphalt.gripLevel}</p>
              <p className="text-gray-400 mt-3 text-sm italic">
                {getSurfaceAdvice(surfaces.asphalt.condition, surfaces.asphalt.gripLevel)}
              </p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-3">Concrete Surface</h4>
              <p className="text-white mb-2">Temperature: {formatTemperature(surfaces.concrete.temperature, unit)}</p>
              <p className="text-white mb-2">Condition: {surfaces.concrete.condition}</p>
              <p className="text-white">Grip Level: {surfaces.concrete.gripLevel}</p>
              <p className="text-gray-400 mt-3 text-sm italic">
                {getSurfaceAdvice(surfaces.concrete.condition, surfaces.concrete.gripLevel)}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-3">Tire Warmup Times</h4>
                <p className="text-white mb-1">Sport: {performance.tireWarmupTime.sport} minutes</p>
                <p className="text-white mb-1">Summer: {performance.tireWarmupTime.summer} minutes</p>
                <p className="text-white mb-1">All Season: {performance.tireWarmupTime.allSeason} minutes</p>
                <p className="text-white">Winter: {performance.tireWarmupTime.winter} minutes</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-3">Engine Performance</h4>
                <p className="text-white mb-1">Air Density Factor: {performance.enginePerformance.airDensityFactor.toFixed(2)}</p>
                <p className="text-white mb-1">Power Adjustment: {performance.enginePerformance.powerAdjustment}%</p>
                <p className="text-white">Torque Adjustment: {performance.enginePerformance.torqueAdjustment}%</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-3">Braking Performance</h4>
                <p className="text-white mb-1">Effective Coefficient: {performance.brakingPerformance.effectiveCoefficient.toFixed(2)}</p>
                <p className="text-white mb-1">Distance Adjustment: {performance.brakingPerformance.distanceAdjustment}%</p>
                <p className="text-white">Heat Dissipation: {performance.brakingPerformance.heatDissipation}</p>
              </div>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-3">Performance Recommendations</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• {getTireRecommendation(weatherData, surfaces)}</li>
                <li>• {getTorqueRecommendation(performance, drivingConditions)}</li>
                <li>• {getBrakingRecommendation(performance.brakingPerformance, surfaces)}</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'forecast' && (
          <div>
            <div className="bg-black/30 p-4 rounded-lg mb-4">
              <h4 className="text-blue-400 font-medium mb-3">Weather Trend</h4>
              <div className="flex overflow-x-auto pb-2">
                {oneCallData.hourly && oneCallData.hourly.slice(0, 8).map((hour, index) => (
                  <div key={index} className="flex-shrink-0 w-24 text-center mx-2">
                    <p className="text-gray-400 text-xs">{formatTime(hour.dt)}</p>
                    <img 
                      src={getWeatherIconUrl(hour.weather[0].icon)} 
                      alt={hour.weather[0].description}
                      className="h-10 w-10 mx-auto my-1"
                    />
                    <p className="text-white text-sm">{formatTemperature(hour.temp, unit)}</p>
                    <p className="text-gray-400 text-xs capitalize">{hour.weather[0].description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-3">Drive Planning</h4>
              <p className="text-white mb-2">Optimal Drive Time: {getOptimalDriveTime(oneCallData, drivingConditions)}</p>
              <p className="text-white mb-2">Expected Surface Changes: {getSurfaceChangeForecast(oneCallData, surfaces)}</p>
              <p className="text-white mb-4">Precipitation Risk: {getPrecipitationRisk(oneCallData)}</p>
              
              <h5 className="text-green-500 text-sm mb-2">Drive Recommendations:</h5>
              <p className="text-gray-300 text-sm italic">
                {getDrivingRecommendation(oneCallData, drivingConditions, performance)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Paddock20™ Automotive Weather Intelligence | Powered by OpenWeather API
        </p>
      </div>
    </div>
  );
};

// Helper functions for advanced automotive weather interpretation
function getRiskLevelColor(riskLevel) {
  switch (riskLevel?.toLowerCase()) {
    case 'high':
      return 'text-red-500 font-medium';
    case 'moderate':
      return 'text-yellow-500 font-medium';
    case 'low':
      return 'text-green-500 font-medium';
    default:
      return 'text-white';
  }
}

function getSurfaceAdvice(condition, gripLevel) {
  if (condition?.includes('wet') || condition?.includes('damp')) {
    return 'Reduce speed in corners and increase following distance. Consider softer tire compounds for better wet grip.';
  }
  
  if (condition?.includes('dry') && gripLevel?.includes('high')) {
    return 'Excellent conditions for performance driving. Tire temperatures will reach optimal range quickly.';
  }
  
  if (condition?.includes('cold')) {
    return 'Extended warm-up period required for tires. Expect reduced grip until tires and surface reach optimal temperature.';
  }
  
  return 'Standard driving conditions. Monitor tire pressures for optimal performance.';
}

function getTireRecommendation(weatherData, surfaces) {
  const temp = weatherData.main.temp;
  const weatherDesc = weatherData.weather[0].main.toLowerCase();
  const surfaceCondition = surfaces.asphalt.condition.toLowerCase();
  
  if (weatherDesc.includes('rain') || surfaceCondition.includes('wet')) {
    return 'Consider tires with deeper tread patterns for improved wet performance. Reduce tire pressures by 1-2 psi for enhanced wet grip.';
  }
  
  if (temp < 40 && unit === 'imperial') { // Cold temps (F)
    return 'Winter or all-season tires recommended. Increase warm-up time and exercise caution during initial laps.';
  }
  
  if (temp > 85 && unit === 'imperial') { // Hot temps (F)
    return 'Tire pressures will increase significantly during driving. Start with pressures 2-3 psi below your normal cold settings.';
  }
  
  return 'Standard tire setup is suitable. Monitor pressures throughout your drive sessions for consistency.';
}

function getTorqueRecommendation(performance, drivingConditions) {
  const powerAdjustment = performance.enginePerformance.powerAdjustment;
  const traction = drivingConditions.traction;
  
  if (traction === 'Poor' || traction === 'Very Poor') {
    return 'Significant power management needed. Consider using higher gears and gradual throttle inputs to maintain traction.';
  }
  
  if (powerAdjustment > 2) {
    return 'Current conditions support peak engine performance. Full power application is appropriate in straight sections.';
  }
  
  if (powerAdjustment < -2) {
    return 'Engine output may feel reduced due to air density. Focus on momentum and smooth inputs for optimal lap times.';
  }
  
  return 'Moderate throttle application recommended. Progressive inputs will maximize available traction.';
}

function getBrakingRecommendation(brakingPerformance, surfaces) {
  const coefficient = brakingPerformance.effectiveCoefficient;
  const heatDissipation = brakingPerformance.heatDissipation;
  const surfaceGrip = surfaces.asphalt.gripLevel?.toLowerCase() || '';
  
  if (coefficient < 0.8) {
    return 'Extend braking zones by 15-20%. Begin braking earlier and with progressive pressure to maximize grip.';
  }
  
  if (heatDissipation === 'Reduced' || heatDissipation === 'Poor') {
    return 'Brake fade may become an issue during extended sessions. Allow cool-down periods between heavy braking zones.';
  }
  
  if (surfaceGrip.includes('high') && coefficient > 0.9) {
    return 'Optimal braking conditions. Late braking points are viable but maintain progressive pedal application.';
  }
  
  return 'Standard braking techniques recommended. Focus on smooth, progressive brake application and release.';
}

function getOptimalDriveTime(oneCallData, drivingConditions) {
  const hourly = oneCallData.hourly;
  if (!hourly || hourly.length === 0) return 'Data not available';
  
  // Find the best 3-hour window for driving
  let bestStartHour = 0;
  let bestScore = -Infinity;
  
  for (let i = 0; i < 24; i++) {
    const threeHourWindow = hourly.slice(i, i + 3);
    if (threeHourWindow.length < 3) continue;
    
    let windowScore = 0;
    
    // Higher scores for better conditions
    threeHourWindow.forEach(hour => {
      // Good temperatures (not too hot, not too cold)
      if (hour.temp > 50 && hour.temp < 85) windowScore += 3;
      
      // No precipitation
      if (!hour.rain && !hour.snow) windowScore += 5;
      
      // Good visibility (no fog, etc)
      if (!hour.weather[0].main.toLowerCase().includes('fog')) windowScore += 2;
      
      // Daytime driving
      const hourDate = new Date(hour.dt * 1000);
      const hourOfDay = hourDate.getHours();
      if (hourOfDay >= 9 && hourOfDay <= 18) windowScore += 4;
    });
    
    if (windowScore > bestScore) {
      bestScore = windowScore;
      bestStartHour = i;
    }
  }
  
  const bestStartTime = formatTime(hourly[bestStartHour].dt);
  const bestEndTime = formatTime(hourly[Math.min(bestStartHour + 2, hourly.length - 1)].dt);
  
  return `${bestStartTime} to ${bestEndTime}`;
}

function getSurfaceChangeForecast(oneCallData, surfaces) {
  const hourly = oneCallData.hourly;
  if (!hourly || hourly.length === 0) return 'No significant changes expected';
  
  // Check for temperature changes over the next 12 hours
  const currentTemp = surfaces.asphalt.temperature;
  const tempIn12Hours = hourly[11]?.temp || currentTemp;
  const tempDiff = Math.abs(tempIn12Hours - currentTemp);
  
  // Check for precipitation
  const willRain = hourly.slice(0, 12).some(hour => hour.rain && hour.rain['1h'] > 0.1);
  const willSnow = hourly.slice(0, 12).some(hour => hour.snow && hour.snow['1h'] > 0.1);
  
  if (willRain) {
    return 'Surface will become wet - reduced grip expected';
  }
  
  if (willSnow) {
    return 'Surface may become snow-covered - extremely limited grip';
  }
  
  if (tempDiff > 15) {
    if (tempIn12Hours > currentTemp) {
      return 'Surface temperature will increase significantly - grip will improve';
    } else {
      return 'Surface temperature will decrease significantly - reduced grip expected';
    }
  }
  
  return 'No significant surface changes expected';
}

function getPrecipitationRisk(oneCallData) {
  const hourly = oneCallData.hourly;
  if (!hourly || hourly.length === 0) return 'Data not available';
  
  const next8Hours = hourly.slice(0, 8);
  
  // Calculate probability of precipitation
  let maxPop = 0;
  next8Hours.forEach(hour => {
    if (hour.pop && hour.pop > maxPop) maxPop = hour.pop;
  });
  
  // Convert to percentage and categorize
  const popPercent = Math.round(maxPop * 100);
  
  if (popPercent < 10) return 'Very Low (< 10%)';
  if (popPercent < 30) return 'Low (< 30%)';
  if (popPercent < 60) return 'Moderate (' + popPercent + '%)';
  if (popPercent < 80) return 'High (' + popPercent + '%)';
  return 'Very High (' + popPercent + '%)';
}

function getDrivingRecommendation(oneCallData, drivingConditions, performance) {
  const riskLevel = drivingConditions.riskLevel?.toLowerCase() || '';
  const traction = drivingConditions.traction?.toLowerCase() || '';
  const braking = performance.brakingPerformance;
  
  if (riskLevel.includes('high')) {
    return 'Exercise extreme caution. Consider postponing performance driving and limit to essential travel only. If driving is necessary, reduce speed significantly and maintain extended following distances.';
  }
  
  if (traction.includes('poor') || braking.effectiveCoefficient < 0.7) {
    return 'Challenging conditions for performance driving. Focus on smooth inputs, higher gears, and significantly extended braking zones. Consider a shortened session with frequent cool-down periods.';
  }
  
  if (riskLevel.includes('moderate')) {
    return 'Proceed with caution. Extend braking zones by 15-20% and be patient with throttle application, especially when exiting corners. Allow additional warm-up time for tires and brakes.';
  }
  
  return 'Good conditions for performance driving. Follow standard procedures for tire and brake management. Enjoy responsive handling and predictable vehicle dynamics throughout your session.';
}

export default AutomotiveEnthusiastWeather;