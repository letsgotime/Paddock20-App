import React, { useEffect, useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import LocationSelector from './LocationSelector';
import { 
  Loader2, 
  AlertCircle, 
  CloudRain, 
  Wind, 
  Thermometer, 
  DropletIcon, 
  RefreshCw,
  Clock,
  Sun,
  Compass,
  ArrowUp,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpenWeatherAutomotivePanel from './OpenWeatherAutomotivePanel';
import { format } from 'date-fns';

/**
 * OpenWeatherStation - A comprehensive weather station component
 * that uses OpenWeather API data exclusively
 */
const OpenWeatherStation: React.FC = () => {
  const { 
    unit, 
    setUnit, 
    isLoading, 
    error, 
    weatherData,
    oneCallData,
    forecastData,
    refreshWeather,
    selectedLocation
  } = useWeather();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update the current time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Format the current date
  const formattedDate = format(currentTime, 'EEEE, MMMM d, yyyy');
  
  // Format the last updated time
  const lastUpdated = format(new Date(), 'MMMM d, yyyy \'at\' h:mm a');
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl p-8 text-center" aria-live="polite">
          <div className="flex items-center justify-center mb-4" aria-hidden="true">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
          </div>
          <p className="text-xl">Loading Weather Data...</p>
          <p className="text-gray-400 mt-2">Please wait while we fetch the latest information</p>
        </div>
      </div>
    );
  }
  
  if (error || (!weatherData && !isLoading) || !oneCallData) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl p-8 text-center" aria-live="assertive" role="alert">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
          <p className="text-xl text-red-500">Unable to load weather data</p>
          <p className="text-gray-400 mt-2">{error ? (error.message || 'Please check your connection and try again') : 'Could not retrieve weather information. Please try again.'}</p>
          <button 
            onClick={refreshWeather} 
            className="mt-4 px-5 py-2 bg-blue-500 hover:bg-blue-600 transition-colors rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            aria-label="Retry loading weather data"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  // Extract data for display
  const temp = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';
  const windSpeed = Math.round(weatherData.wind.speed);
  const windDirection = weatherData.wind.deg;
  const humidity = weatherData.main.humidity;
  const pressure = weatherData.main.pressure;
  const visibility = Math.round(weatherData.visibility / 1000);
  const sunriseTime = new Date(weatherData.sys.sunrise * 1000);
  const sunsetTime = new Date(weatherData.sys.sunset * 1000);
  const weatherDesc = weatherData.weather[0]?.description || 'Unknown';
  const weatherIcon = weatherData.weather[0]?.icon || '01d';
  const uvIndex = oneCallData.current?.uvi || 0;
  
  // Get hourly forecast
  const hourlyForecast = oneCallData.hourly?.slice(0, 24) || [];
  
  // Get daily forecast
  const dailyForecast = oneCallData.daily?.slice(0, 7) || [];
  
  // Precipitation chance for the next hour
  const precipChance = hourlyForecast[0]?.pop ? Math.round(hourlyForecast[0].pop * 100) : 0;
  
  // Calculate surface temperature based on air temperature
  const cloudCover = weatherData.clouds?.all || 0;
  const isDaytime = currentTime.getHours() > 6 && currentTime.getHours() < 20;
  const cloudEffect = 1 - (cloudCover / 100);
  const timeEffect = isDaytime ? 1 : 0.2;
  const asphaltFactor = 25; // Asphalt can be 20-30°F/°C warmer than air at peak sun
  const surfaceTemp = Math.round(temp + (asphaltFactor * cloudEffect * timeEffect));
  
  // Function to get the wind direction as a compass point
  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };
  
  // Get UV index text
  const getUVIndexText = (uvi: number) => {
    if (uvi <= 2) return 'Low';
    if (uvi <= 5) return 'Moderate';
    if (uvi <= 7) return 'High';
    if (uvi <= 10) return 'Very High';
    return 'Extreme';
  };
  
  // Get UV index color
  const getUVIndexColor = (uvi: number) => {
    if (uvi <= 2) return 'text-green-400';
    if (uvi <= 5) return 'text-yellow-400';
    if (uvi <= 7) return 'text-orange-400';
    return 'text-red-400';
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-orbitron text-blue-400 tracking-wide mb-4 sm:mb-0">
            Paddock20 Weather Center
          </h1>
          
          {/* Unit Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-900 rounded-lg p-1">
              <button 
                onClick={() => setUnit('metric')} 
                className={`px-4 py-2 ${unit === 'metric' ? 'bg-blue-500 text-white' : 'text-gray-400'} rounded transition-colors`}
                aria-pressed={unit === 'metric'}
                aria-label="Switch to Celsius"
              >
                °C
              </button>
              <button 
                onClick={() => setUnit('imperial')} 
                className={`px-4 py-2 ${unit === 'imperial' ? 'bg-blue-500 text-white' : 'text-gray-400'} rounded transition-colors`}
                aria-pressed={unit === 'imperial'}
                aria-label="Switch to Fahrenheit"
              >
                °F
              </button>
            </div>
            
            <button 
              onClick={refreshWeather}
              className="p-2 bg-gray-900 hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Refresh weather data"
            >
              <RefreshCw className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
        <p className="text-gray-400 mt-2 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {formattedDate}
        </p>
      </header>
      
      {/* Location Selection Area */}
      <LocationSelector />
      
      {/* Weather Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Current Weather Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center mb-4">
            <img 
              src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`} 
              alt={weatherDesc}
              className="w-20 h-20 mr-2"
            />
            <div>
              <h2 className="text-4xl font-semibold text-white mb-1">
                {temp}{tempUnit}
              </h2>
              <p className="text-lg text-gray-300 capitalize">{weatherDesc}</p>
              <p className="text-gray-400 text-sm">
                {selectedLocation?.name}, {weatherData.sys.country}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <Thermometer className="h-4 w-4 mr-1" />
                <span>Feels Like</span>
              </div>
              <p className="text-white text-xl">{feelsLike}{tempUnit}</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <CloudRain className="h-4 w-4 mr-1" />
                <span>Chance of Rain</span>
              </div>
              <p className="text-white text-xl">{precipChance}%</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <Wind className="h-4 w-4 mr-1" />
                <span>Wind</span>
              </div>
              <div className="flex items-center">
                <p className="text-white text-xl">{windSpeed} {windUnit}</p>
                <span className="ml-2 text-gray-400 text-sm">{getWindDirection(windDirection)}</span>
                <div className="ml-2 text-gray-400" style={{ transform: `rotate(${windDirection}deg)` }}>
                  <ArrowUp className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <DropletIcon className="h-4 w-4 mr-1" />
                <span>Humidity</span>
              </div>
              <p className="text-white text-xl">{humidity}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span>Pressure</span>
              </div>
              <p className="text-white text-xl">{pressure} hPa</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <Compass className="h-4 w-4 mr-1" />
                <span>Visibility</span>
              </div>
              <p className="text-white text-xl">{visibility} km</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <Sun className="h-4 w-4 mr-1 text-amber-400" />
                <span>UV Index</span>
              </div>
              <p className={`text-xl ${getUVIndexColor(uvIndex)}`}>
                {Math.round(uvIndex)} ({getUVIndexText(uvIndex)})
              </p>
            </div>
            
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <Thermometer className="h-4 w-4 mr-1 text-red-400" />
                <span>Surface Temp</span>
              </div>
              <p className="text-white text-xl">{surfaceTemp}{tempUnit}</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between border-t border-gray-800 pt-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Sunrise</p>
              <div className="flex items-center justify-center">
                <p className="text-white">
                  {format(sunriseTime, 'h:mm a')}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Sunset</p>
              <div className="flex items-center justify-center">
                <p className="text-white">
                  {format(sunsetTime, 'h:mm a')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Forecast Charts */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl p-6 border border-gray-800">
          <Tabs defaultValue="hourly" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-400">Weather Forecast</h2>
              <TabsList className="bg-black/40">
                <TabsTrigger value="hourly" className="data-[state=active]:bg-blue-600">Hourly</TabsTrigger>
                <TabsTrigger value="daily" className="data-[state=active]:bg-blue-600">7-Day</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="hourly" className="space-y-4">
              <div className="overflow-x-auto pb-2">
                <div className="flex space-x-4 min-w-max">
                  {hourlyForecast.map((hour, index) => {
                    if (index > 23) return null;
                    const hourTime = new Date(hour.dt * 1000);
                    const hourTemp = Math.round(hour.temp);
                    const hourIcon = hour.weather[0]?.icon;
                    const hourDesc = hour.weather[0]?.description;
                    const hourPop = hour.pop ? Math.round(hour.pop * 100) : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center w-20 bg-black/30 p-2 rounded border border-gray-800">
                        <p className="text-gray-300 text-sm">
                          {index === 0 ? 'Now' : format(hourTime, 'h a')}
                        </p>
                        <img 
                          src={`https://openweathermap.org/img/wn/${hourIcon}.png`} 
                          alt={hourDesc || 'weather'} 
                          className="w-10 h-10 my-1"
                        />
                        <p className="text-white font-semibold">{hourTemp}{tempUnit}</p>
                        <div className="flex items-center mt-1 text-xs">
                          <CloudRain className="h-3 w-3 mr-1 text-blue-400" />
                          <span className="text-gray-300">{hourPop}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="daily" className="space-y-4">
              <div className="space-y-3">
                {dailyForecast.map((day, index) => {
                  const dayDate = new Date(day.dt * 1000);
                  const dayTemp = {
                    min: Math.round(day.temp.min),
                    max: Math.round(day.temp.max)
                  };
                  const dayIcon = day.weather[0]?.icon;
                  const dayDesc = day.weather[0]?.description;
                  const dayPop = day.pop ? Math.round(day.pop * 100) : 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between bg-black/30 p-3 rounded border border-gray-800">
                      <div className="flex items-center">
                        <div className="w-20">
                          <p className="text-white">
                            {index === 0 ? 'Today' : format(dayDate, 'EEE d')}
                          </p>
                        </div>
                        <img 
                          src={`https://openweathermap.org/img/wn/${dayIcon}.png`} 
                          alt={dayDesc || 'weather'} 
                          className="w-10 h-10 mx-2"
                        />
                        <div className="w-24">
                          <p className="text-gray-300 text-sm capitalize">{dayDesc}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex items-center mr-6">
                          <CloudRain className="h-4 w-4 mr-1 text-blue-400" />
                          <span className="text-gray-300">{dayPop}%</span>
                        </div>
                        <div className="w-28 flex justify-between">
                          <span className="text-gray-400">{dayTemp.min}{tempUnit}</span>
                          <div className="w-12 h-1 bg-gray-700 rounded-full self-center mx-2 relative overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                              style={{ 
                                width: `${((dayTemp.max - dayTemp.min) / 25) * 100}%`,
                                maxWidth: '100%'
                              }}
                            ></div>
                          </div>
                          <span className="text-white">{dayTemp.max}{tempUnit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Automotive Weather Panel */}
      <div className="mt-6">
        <OpenWeatherAutomotivePanel />
      </div>
      
      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 sm:mb-0">
            <p>Weather data provided by OpenWeatherMap</p>
            <p className="mt-1">Enhanced automotive data powered by OpenWeatherMap</p>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <p>Last updated: <span>{lastUpdated}</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OpenWeatherStation;