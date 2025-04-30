import React, { useState, useEffect } from 'react';
import { 
  Cloud, Thermometer, Wind, Droplets, Clock, MapPin, 
  SunMoon, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog,
  Search, ChevronDown, Calendar, ArrowRight, Info
} from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    region?: string;
    country?: string;
    lat: number;
    lon: number;
    timezone_id?: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
  forecast?: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
      hour: {
        time: string;
        temp_c: number;
        temp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        chance_of_rain: number;
        chance_of_snow: number;
      }[];
    }[];
  };
}

const WeatherPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [savedLocations, setSavedLocations] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  
  // Fetch weather data for the selected location
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!selectedLocation) {
        // If no location is selected, try to get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setSelectedLocation({
                lat: position.coords.latitude,
                lon: position.coords.longitude
              });
            },
            (err) => {
              console.error('Error getting location:', err);
              setError('Unable to get your location. Please search for a location.');
              setLoading(false);
            }
          );
        } else {
          setError('Geolocation is not supported by your browser. Please search for a location.');
          setLoading(false);
        }
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // First, get location name from coordinates using reverse geocoding
        const geocodeResponse = await fetch(`/api/reverse-geocode?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`);
        
        if (!geocodeResponse.ok) {
          throw new Error('Failed to get location information');
        }
        
        // Then fetch weather data
        const weatherResponse = await fetch(`/api/weather?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`);
        
        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await weatherResponse.json();
        setWeatherData(data);
        
        // Fetch forecast data
        const forecastResponse = await fetch(`/api/onecall?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`);
        
        if (forecastResponse.ok) {
          const forecastData = await forecastResponse.json();
          // Combine forecast data with current weather data
          setWeatherData(prev => {
            if (!prev) return data;
            return {
              ...prev,
              forecast: forecastData
            };
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [selectedLocation]);
  
  // Load saved locations from local storage
  useEffect(() => {
    const loadSavedLocations = () => {
      const saved = localStorage.getItem('savedWeatherLocations');
      if (saved) {
        try {
          const locations = JSON.parse(saved);
          setSavedLocations(locations);
          
          // If we have saved locations, use the first one as default
          if (locations.length > 0 && !selectedLocation) {
            setSelectedLocation({
              lat: locations[0].lat,
              lon: locations[0].lon
            });
          }
        } catch (err) {
          console.error('Error parsing saved locations:', err);
        }
      }
    };
    
    loadSavedLocations();
  }, []);
  
  // Save a location
  const saveLocation = () => {
    if (!weatherData) return;
    
    const newLocation = {
      name: weatherData.location.name,
      lat: weatherData.location.lat,
      lon: weatherData.location.lon
    };
    
    // Check if location already exists
    const exists = savedLocations.some(
      loc => loc.lat === newLocation.lat && loc.lon === newLocation.lon
    );
    
    if (!exists) {
      const updatedLocations = [...savedLocations, newLocation];
      setSavedLocations(updatedLocations);
      localStorage.setItem('savedWeatherLocations', JSON.stringify(updatedLocations));
    }
  };
  
  // Search for a location
  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Location search failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSelectedLocation({
          lat: data[0].lat,
          lon: data[0].lon
        });
        setSearchQuery('');
      } else {
        setError('Location not found. Please try a different search term.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error searching location:', err);
      setError('Failed to search location. Please try again.');
      setLoading(false);
    }
  };
  
  // Get weather icon based on condition code
  const getWeatherIcon = (code: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeMap = {
      sm: 'h-5 w-5',
      md: 'h-8 w-8',
      lg: 'h-14 w-14'
    };
    
    const iconClass = sizeMap[size];
    
    // Map the weather condition code to the appropriate Lucide icon
    if (code >= 200 && code < 300) return <CloudLightning className={`${iconClass} text-amber-400`} />;
    if (code >= 300 && code < 600) return <CloudRain className={`${iconClass} text-blue-400`} />;
    if (code >= 600 && code < 700) return <CloudSnow className={`${iconClass} text-blue-200`} />;
    if (code >= 700 && code < 800) return <CloudFog className={`${iconClass} text-gray-400`} />;
    if (code === 800) return <Sun className={`${iconClass} text-amber-400`} />;
    if (code > 800) return <Cloud className={`${iconClass} text-gray-400`} />;
    
    return <Cloud className={`${iconClass} text-gray-400`} />;
  };
  
  // Format a date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Format a time
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Weather Center</h1>
            <p className="text-gray-400 mt-1">
              Monitor conditions for your driving and detailing needs
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <form onSubmit={searchLocation} className="flex w-full md:w-80">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-l-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2.5 text-gray-400"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  className="bg-gray-800 border border-gray-700 rounded-r-lg py-2 px-3 text-white"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                
                {savedLocations.length > 0 && (
                  <div className="absolute top-full right-0 mt-1 w-60 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-10 hidden group-focus-within:block">
                    <div className="p-2 border-b border-gray-800">
                      <h3 className="text-sm font-medium text-gray-400">Saved Locations</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {savedLocations.map((location, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedLocation({ lat: location.lat, lon: location.lon })}
                          className="w-full text-left p-2 hover:bg-gray-800 text-white"
                        >
                          {location.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
        
        {loading ? (
          <div className="bg-gray-900/40 rounded-xl p-8 border border-gray-800 flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-gray-900/40 rounded-xl p-8 border border-gray-800 text-center">
            <div className="flex items-center justify-center mb-4">
              <Info className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{error}</h2>
            <p className="text-gray-400 mb-4">
              Please try searching for a location or check your internet connection.
            </p>
          </div>
        ) : weatherData ? (
          <div>
            {/* Current Weather */}
            <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800 mb-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="mr-4">
                    {getWeatherIcon(weatherData.current.condition.code, 'lg')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{weatherData.location.name}</h2>
                    <p className="text-gray-400">
                      {weatherData.location.region}, {weatherData.location.country}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date().toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="text-5xl font-bold text-white">
                    {weatherData.current.temp_c}°C
                  </div>
                  <p className="text-gray-400 mt-1">{weatherData.current.condition.text}</p>
                  <button
                    onClick={saveLocation}
                    className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                  >
                    Save Location
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Feels Like</div>
                  <div className="text-lg font-semibold text-white flex items-center">
                    <Thermometer className="h-4 w-4 mr-1 text-red-400" />
                    {weatherData.current.feelslike_c}°C
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Humidity</div>
                  <div className="text-lg font-semibold text-white flex items-center">
                    <Droplets className="h-4 w-4 mr-1 text-blue-400" />
                    {weatherData.current.humidity}%
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Wind</div>
                  <div className="text-lg font-semibold text-white flex items-center">
                    <Wind className="h-4 w-4 mr-1 text-blue-400" />
                    {weatherData.current.wind_kph} km/h
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">UV Index</div>
                  <div className="text-lg font-semibold text-white flex items-center">
                    <Sun className="h-4 w-4 mr-1 text-amber-400" />
                    {weatherData.current.uv}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-400">
                <h3 className="font-medium text-white mb-2">Detailing Conditions Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`p-2 rounded-lg ${
                    weatherData.current.temp_c > 5 && weatherData.current.temp_c < 30 
                      ? 'bg-green-900/20 text-green-400' 
                      : 'bg-amber-900/20 text-amber-400'
                  }`}>
                    <div className="font-medium mb-1">Washing</div>
                    <div>
                      {weatherData.current.temp_c > 5 && weatherData.current.temp_c < 30 && weatherData.current.precip_mm < 0.5
                        ? 'Ideal conditions for washing'
                        : 'Suboptimal conditions'}
                    </div>
                  </div>
                  
                  <div className={`p-2 rounded-lg ${
                    weatherData.current.temp_c > 10 && weatherData.current.temp_c < 30 && weatherData.current.humidity < 70 && weatherData.current.cloud > 30
                      ? 'bg-green-900/20 text-green-400' 
                      : 'bg-amber-900/20 text-amber-400'
                  }`}>
                    <div className="font-medium mb-1">Waxing</div>
                    <div>
                      {weatherData.current.temp_c > 10 && weatherData.current.temp_c < 30 && weatherData.current.humidity < 70 && weatherData.current.cloud > 30
                        ? 'Good conditions for waxing'
                        : 'Not ideal for waxing'}
                    </div>
                  </div>
                  
                  <div className={`p-2 rounded-lg ${
                    weatherData.current.temp_c > 15 && weatherData.current.temp_c < 25 && weatherData.current.humidity < 60 && weatherData.current.cloud > 50
                      ? 'bg-green-900/20 text-green-400' 
                      : 'bg-amber-900/20 text-amber-400'
                  }`}>
                    <div className="font-medium mb-1">Coating</div>
                    <div>
                      {weatherData.current.temp_c > 15 && weatherData.current.temp_c < 25 && weatherData.current.humidity < 60 && weatherData.current.cloud > 50
                        ? 'Acceptable for coating application'
                        : 'Not recommended for coating'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Forecast */}
            {weatherData.forecast && (
              <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  5-Day Forecast
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {weatherData.forecast.forecastday.map((day, index) => (
                    <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-white mb-2">
                        {index === 0 ? 'Today' : formatDate(day.date)}
                      </div>
                      <div className="flex items-center mb-3">
                        {getWeatherIcon(day.day.condition.code, 'md')}
                        <div className="ml-2">
                          <div className="text-lg font-semibold text-white">
                            {day.day.avgtemp_c}°C
                          </div>
                          <div className="text-xs text-gray-400">
                            {day.day.condition.text}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div>
                          <div className="text-xs text-gray-500">Min</div>
                          <div className="text-white">{day.day.mintemp_c}°C</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Max</div>
                          <div className="text-white">{day.day.maxtemp_c}°C</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Rain</div>
                          <div className="text-white">{day.day.daily_chance_of_rain}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Hourly Forecast */}
            {weatherData.forecast && (
              <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-400" />
                  Hourly Forecast
                </h2>
                
                <div className="overflow-x-auto">
                  <div className="inline-flex gap-4 pb-2">
                    {weatherData.forecast.forecastday[0].hour.map((hour, index) => (
                      <div key={index} className="bg-gray-800/50 p-3 rounded-lg min-w-[100px] text-center">
                        <div className="text-sm font-medium text-white mb-1">
                          {formatTime(hour.time)}
                        </div>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(hour.condition.code, 'sm')}
                        </div>
                        <div className="text-md font-semibold text-white">
                          {hour.temp_c}°C
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {hour.chance_of_rain > 0 ? `Rain: ${hour.chance_of_rain}%` : 'No Rain'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Weather Driving Recommendations */}
            <div className="mt-8 bg-blue-900/20 rounded-xl p-6 border border-blue-800/30">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-400" />
                Driving Recommendations
              </h2>
              
              <div className="text-white">
                {weatherData.current.precip_mm > 1 ? (
                  <div>
                    <p className="mb-2">• Rain detected. Drive with caution, reduce speed, and maintain safe following distance.</p>
                    <p className="mb-2">• Check that your windshield wipers are functioning properly.</p>
                    <p>• Avoid sudden acceleration or braking on wet surfaces.</p>
                  </div>
                ) : weatherData.current.vis_km < 5 ? (
                  <div>
                    <p className="mb-2">• Reduced visibility conditions. Use headlights and proceed with caution.</p>
                    <p className="mb-2">• Reduce speed and increase following distance.</p>
                    <p>• Stay alert for unexpected obstacles or traffic changes.</p>
                  </div>
                ) : weatherData.current.wind_kph > 40 ? (
                  <div>
                    <p className="mb-2">• High winds detected. Drive with extra caution, especially in high-profile vehicles.</p>
                    <p className="mb-2">• Be prepared for sudden gusts that may affect vehicle handling.</p>
                    <p>• Watch for debris on the road.</p>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">• Favorable driving conditions. Enjoy your drive!</p>
                    <p className="mb-2">• Remember to follow speed limits and practice defensive driving.</p>
                    <p>• Consider planning a scenic route to take advantage of good weather.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-right">
                <a href="/route-planner" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
                  Plan Your Drive
                  <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/40 rounded-xl p-8 border border-gray-800 text-center">
            <Cloud className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-3">No Weather Data</h2>
            <p className="text-gray-400 mb-4">
              Search for a location or enable location services to view weather information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherPage;