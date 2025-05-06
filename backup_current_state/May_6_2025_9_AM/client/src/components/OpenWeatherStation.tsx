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
  BarChart3,
  CarFront,
  Gauge
} from 'lucide-react';
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
          <p className="text-xl text-red-500">Unable to load weather information</p>
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
  const temp = weatherData ? Math.round(weatherData.main.temp) : 0;
  const feelsLike = weatherData ? Math.round(weatherData.main.feels_like) : 0;
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';
  const windSpeed = weatherData ? Math.round(weatherData.wind.speed) : 0;
  const windDirection = weatherData ? weatherData.wind.deg : 0;
  const humidity = weatherData ? weatherData.main.humidity : 0;
  const pressure = weatherData ? weatherData.main.pressure : 0;
  const visibility = weatherData ? Math.round(weatherData.visibility / 1000) : 0;
  const sunriseTime = weatherData ? new Date(weatherData.sys.sunrise * 1000) : new Date();
  const sunsetTime = weatherData ? new Date(weatherData.sys.sunset * 1000) : new Date();
  const weatherDesc = weatherData?.weather[0]?.description || 'Unknown';
  const weatherIcon = weatherData?.weather[0]?.icon || '01d';
  const uvIndex = oneCallData?.current?.uvi || 0;
  
  // Calculate surface temperature based on air temperature
  const cloudCover = weatherData?.clouds?.all || 0;
  const isDaytime = currentTime.getHours() > 6 && currentTime.getHours() < 20;
  const cloudEffect = 1 - (cloudCover / 100);
  const timeEffect = isDaytime ? 1 : 0.2;
  const asphaltFactor = 25; // Asphalt can be 20-30°F/°C warmer than air at peak sun
  const surfaceTemp = Math.round(temp + (asphaltFactor * cloudEffect * timeEffect));
  
  // Calculate racing-specific metrics
  const hasRain = oneCallData?.hourly?.[0]?.rain?.['1h'] > 0 || weatherData?.rain?.['1h'] > 0;
  const hasSnow = oneCallData?.hourly?.[0]?.snow?.['1h'] > 0 || weatherData?.snow?.['1h'] > 0;
  
  // Calculate tire warm-up times (simplified)
  const sportTireWarmup = Math.round(
    (hasRain ? 3 : 0) + 
    (hasSnow ? 7 : 0) + 
    (surfaceTemp < 60 ? 8 : surfaceTemp < 80 ? 5 : 3)
  );
  
  // Calculate ideal tire pressure adjustments based on temperature
  const standardPressure = unit === 'metric' ? 2.1 : 30.5; // Bar or PSI
  const pressureAdjustment = Math.round((surfaceTemp - 70) * 0.1 * 10) / 10;
  const idealTirePressure = Math.max(standardPressure - pressureAdjustment, standardPressure * 0.85).toFixed(1);
  const pressureUnit = unit === 'metric' ? ' bar' : ' psi';
  
  // Calculate torque settings adjustment
  let torquePercentage = 100;
  if (hasRain) torquePercentage = 75;
  if (hasSnow) torquePercentage = 50;
  if (!hasRain && !hasSnow && surfaceTemp < 60) torquePercentage = 85;
  
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
          <div>
            <h1 className="text-3xl sm:text-4xl font-orbitron text-blue-400 tracking-wide mb-1">
              Paddock20&trade; Weather
            </h1>
            <p className="text-green-500 font-medium text-sm tracking-widest mb-2">DRIVE LIFE. DOCUMENT LEGACY.</p>
          </div>
          
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
      <div className="mb-6">
        <LocationSelector />
      </div>
      
      <div className="mb-6 bg-gradient-to-br from-[#121212] to-[#202020] rounded-xl border border-blue-900/30">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-blue-400">Today's Drive Conditions</h2>
        </div>
        
        {/* Dashboard Widget */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-0 divide-x divide-y divide-gray-800/50">
          {/* Time */}
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 mb-1">LOCAL TIME</p>
            <p className="text-xl font-medium text-white">
              {format(currentTime, 'h:mm a')}
            </p>
          </div>
          
          {/* Sunrise Time */}
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 mb-1">SUNRISE</p>
            <p className="text-xl font-medium text-amber-400">
              {format(sunriseTime, 'h:mm a')}
            </p>
          </div>
          
          {/* Sunset Time */}
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 mb-1">SUNSET</p>
            <p className="text-xl font-medium text-orange-400">
              {format(sunsetTime, 'h:mm a')}
            </p>
          </div>
          
          {/* Temperature */}
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 mb-1">TEMPERATURE</p>
            <p className="text-xl font-medium text-white">
              {temp}{tempUnit}
            </p>
          </div>
          
          {/* Surface Temperature */}
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 mb-1">SURFACE TEMP</p>
            <p className="text-xl font-medium text-red-400">
              {surfaceTemp}{tempUnit}
            </p>
          </div>
          
          {/* Wind */}
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 mb-1">WIND</p>
            <div className="flex items-center">
              <p className="text-xl font-medium text-white">
                {windSpeed} {windUnit}
              </p>
              <span className="ml-2 text-xs text-gray-400">
                {getWindDirection(windDirection)}
              </span>
            </div>
          </div>
          
          {/* Humidity */}
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 mb-1">HUMIDITY</p>
            <p className="text-xl font-medium text-blue-400">
              {humidity}%
            </p>
          </div>
          
          {/* Pressure */}
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 mb-1">PRESSURE</p>
            <p className="text-xl font-medium text-white">
              {pressure} hPa
            </p>
          </div>
        </div>
        
        {/* Additional Driving Info */}
        <div className="px-6 py-4 border-t border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* UV Index */}
            <div className="bg-black/30 p-4 rounded flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">UV Index</p>
                <p className={`text-lg font-medium ${getUVIndexColor(uvIndex)}`}>
                  {Math.round(uvIndex)} ({getUVIndexText(uvIndex)})
                </p>
              </div>
              <Sun className="h-8 w-8 text-yellow-500 opacity-70" />
            </div>
            
            {/* Torque Settings */}
            <div className="bg-black/30 p-4 rounded flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Torque Settings</p>
                <p className="text-lg font-medium text-white">
                  {torquePercentage}% Output
                </p>
              </div>
              <Gauge className="h-8 w-8 text-blue-500 opacity-70" />
            </div>
            
            {/* Tire Pressure */}
            <div className="bg-black/30 p-4 rounded flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ideal Tire Pressure</p>
                <p className="text-lg font-medium text-white">
                  {idealTirePressure}{pressureUnit}
                </p>
              </div>
              <CarFront className="h-8 w-8 text-green-500 opacity-70" />
            </div>
          </div>
        </div>
        
        {/* Current Conditions */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              <img 
                src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`} 
                alt={weatherDesc}
                className="w-16 h-16"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Current Weather</p>
              <p className="text-xl text-white capitalize">{weatherDesc}</p>
              <p className="text-sm text-gray-400">
                Feels like {feelsLike}{tempUnit} • Visibility {visibility} km
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fun Drive Checklist */}
      <div className="mb-6 bg-gradient-to-br from-[#121212] to-[#202020] rounded-xl border border-green-900/30">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-green-400">Fun Drive Checklist</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tire Setup */}
            <div>
              <h3 className="text-blue-400 font-medium mb-3 flex items-center">
                <CarFront className="h-5 w-5 mr-2 text-blue-400" />
                Tire Setup
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-gray-700 mr-3">
                    <span className="text-green-400 font-medium">1</span>
                  </div>
                  <div>
                    <p className="text-white">Set tire pressure to {idealTirePressure}{pressureUnit}</p>
                    <p className="text-xs text-gray-400">
                      {surfaceTemp < 60 ? 
                        "Cold surface temperature - increase pressure slightly for better initial grip" : 
                        surfaceTemp > 90 ? 
                        "Hot surface temperature - decrease pressure to prevent overheating" : 
                        "Optimal surface temperature - standard pressure recommended"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-gray-700 mr-3">
                    <span className="text-green-400 font-medium">2</span>
                  </div>
                  <div>
                    <p className="text-white">Allow {sportTireWarmup} minutes for proper tire warm-up</p>
                    <p className="text-xs text-gray-400">
                      {sportTireWarmup > 7 ? 
                        "Extended warm-up period required for current conditions" : 
                        sportTireWarmup < 4 ? 
                        "Minimal warm-up needed in current conditions" : 
                        "Standard warm-up recommended"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-gray-700 mr-3">
                    <span className="text-green-400 font-medium">3</span>
                  </div>
                  <div>
                    <p className="text-white">Check for proper tire temperature distribution</p>
                    <p className="text-xs text-gray-400">
                      Ideal temperature spread across the tire surface ensures optimal grip
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Settings */}
            <div>
              <h3 className="text-blue-400 font-medium mb-3 flex items-center">
                <Gauge className="h-5 w-5 mr-2 text-blue-400" />
                Performance Settings
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-gray-700 mr-3">
                    <span className="text-green-400 font-medium">1</span>
                  </div>
                  <div>
                    <p className="text-white">Adjust torque management to {torquePercentage}%</p>
                    <p className="text-xs text-gray-400">
                      {torquePercentage < 80 ? 
                        "Reduced output recommended for compromised traction conditions" : 
                        "Full power delivery suitable for current conditions"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-gray-700 mr-3">
                    <span className="text-green-400 font-medium">2</span>
                  </div>
                  <div>
                    <p className="text-white">
                      {hasRain || hasSnow ? 
                        "Increase traction control intervention" : 
                        "Standard traction control settings"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {hasRain || hasSnow ? 
                        "Precipitation detected - safety systems should be engaged" : 
                        "Dry conditions allow for reduced electronic intervention"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-gray-700 mr-3">
                    <span className="text-green-400 font-medium">3</span>
                  </div>
                  <div>
                    <p className="text-white">
                      {windSpeed > 15 ? 
                        `Compensate for ${getWindDirection(windDirection)} crosswinds` : 
                        "Standard aerodynamic setup"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {windSpeed > 15 ? 
                        `Wind speed of ${windSpeed} ${windUnit} may affect vehicle stability` : 
                        "Current wind conditions have minimal impact on performance"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            Built for the serious. Designed for the seamless.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpenWeatherStation;