import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { fetchAutomotiveWeather } from '@/services/openWeatherService';
import { Sun, Cloud, Wind, Droplets, Thermometer, Gauge, Sunrise, Sunset, CalendarClock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Interface for our automotive weather data
interface AutomotiveWeatherData {
  location: {
    lat: number;
    lon: number;
    timezone: string;
  };
  current_time: string;
  sunrise_time: string;
  sunset_time: string;
  conditions: {
    summary: string;
    icon: string;
    air_temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    cloud_cover: number;
    precipitation: number;
    uv_index: number;
    solar_radiation: number | null;
  };
  automotive_metrics: {
    track_surface: {
      temperature: number;
      condition: string;
      grip_level: string;
    };
    tire_temperature_estimates: {
      soft_compound: number;
      medium_compound: number;
      hard_compound: number;
      street_performance: number;
      all_season: number;
    };
    drive_recommendations: {
      tire_warmup_minutes: {
        performance: number;
        street: number;
        all_season: number;
      };
      torque_management: {
        recommended_percentage: number;
        traction_control: string;
      };
      tire_pressure_adjustment: number;
      braking_points: string;
    };
    visibility_assessment: string;
    sunglare_risk: string;
  };
  hourly_forecast: Array<{
    time: string;
    temperature: number;
    conditions: string;
    precipitation_chance: number;
  }>;
  alerts: Array<any>;
  data_sources: {
    weather: string;
    solar: string;
  };
}

const Paddock20WeatherStation: React.FC = () => {
  const [weatherData, setWeatherData] = useState<AutomotiveWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const { selectedLocation } = useWeather();
  
  // Format the temperature based on the selected unit
  const formatTemp = (temp: number) => {
    if (unit === 'imperial') {
      return `${Math.round((temp * 9/5) + 32)}°F`;
    }
    return `${Math.round(temp)}°C`;
  };
  
  // Format wind speed based on the selected unit
  const formatWindSpeed = (speed: number) => {
    if (unit === 'imperial') {
      return `${Math.round(speed * 2.237)} mph`;
    }
    return `${Math.round(speed * 10) / 10} m/s`;
  };
  
  // Format time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  // Format pressure based on the selected unit
  const formatPressure = (hPa: number) => {
    if (unit === 'imperial') {
      return `${(hPa * 0.02953).toFixed(2)} inHg`;
    }
    return `${hPa} hPa`;
  };
  
  // Toggle between metric and imperial units
  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };
  
  // Fetch weather data when location changes
  useEffect(() => {
    const getWeatherData = async () => {
      if (!selectedLocation) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAutomotiveWeather(
          selectedLocation.lat, 
          selectedLocation.lon,
          unit
        );
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching automotive weather data:', err);
        setError('Failed to fetch weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    getWeatherData();
  }, [selectedLocation, unit]);
  
  if (loading) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg shadow-lg animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-800 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error || !weatherData) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg shadow-lg border border-red-800">
        <div className="flex items-center text-red-500 mb-2">
          <AlertCircle className="h-6 w-6 mr-2" />
          <h3 className="text-xl font-bold">Error</h3>
        </div>
        <p className="text-gray-300">{error || 'Unable to load weather data'}</p>
      </div>
    );
  }
  
  // Extract the current weather data
  const { 
    current_time,
    sunrise_time,
    sunset_time,
    conditions,
    automotive_metrics
  } = weatherData;
  
  // Get the weather icon URL from OpenWeather
  const weatherIconUrl = `https://openweathermap.org/img/wn/${conditions.icon}@2x.png`;
  
  // Get time since last update
  const lastUpdated = formatDistanceToNow(new Date(current_time), { addSuffix: true });
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-lg border border-gray-800 overflow-hidden">
      {/* Header with location and unit toggle */}
      <div className="p-4 bg-black bg-opacity-50 flex justify-between items-center">
        <h2 className="text-blue-400 font-orbitron text-xl">
          PADDOCK20™ WEATHER STATION
        </h2>
        <button 
          onClick={toggleUnit} 
          className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white text-sm rounded"
        >
          Switch to °{unit === 'metric' ? 'F' : 'C'}
        </button>
      </div>
      
      {/* Main weather display */}
      <div className="p-6">
        {/* Current conditions section */}
        <div className="flex items-center mb-6">
          <img src={weatherIconUrl} alt={conditions.summary} className="w-16 h-16" />
          <div className="ml-4">
            <div className="text-3xl text-white font-bold">{formatTemp(conditions.air_temperature)}</div>
            <div className="text-gray-400 capitalize">{conditions.summary}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-green-500 text-sm">{selectedLocation?.name || 'Current Location'}</div>
            <div className="text-gray-500 text-xs">Updated {lastUpdated}</div>
          </div>
        </div>
        
        {/* Essential weather metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Time */}
          <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <CalendarClock className="w-20 h-20 text-gray-400" />
            </div>
            <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Time</h3>
            <p className="text-xl text-white">{formatTime(current_time)}</p>
          </div>
          
          {/* Sunrise */}
          <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Sunrise className="w-20 h-20 text-yellow-500" />
            </div>
            <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Sunrise</h3>
            <p className="text-xl text-white">{formatTime(sunrise_time)}</p>
          </div>
          
          {/* Sunset */}
          <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Sunset className="w-20 h-20 text-orange-500" />
            </div>
            <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Sunset</h3>
            <p className="text-xl text-white">{formatTime(sunset_time)}</p>
          </div>
          
          {/* Air Temperature */}
          <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Thermometer className="w-20 h-20 text-red-500" />
            </div>
            <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Air Temp</h3>
            <p className="text-xl text-white">{formatTemp(conditions.air_temperature)}</p>
          </div>
          
          {/* Surface Temperature */}
          <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Sun className="w-20 h-20 text-orange-500" />
            </div>
            <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Surface Temp</h3>
            <p className="text-xl text-white">{formatTemp(automotive_metrics.track_surface.temperature)}</p>
          </div>
          
          {/* Wind */}
          <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Wind className="w-20 h-20 text-cyan-500" />
            </div>
            <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Wind</h3>
            <p className="text-xl text-white">{formatWindSpeed(conditions.wind_speed)}</p>
          </div>
          
          {/* Humidity */}
          <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Droplets className="w-20 h-20 text-blue-500" />
            </div>
            <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Humidity</h3>
            <p className="text-xl text-white">{conditions.humidity}%</p>
          </div>
          
          {/* Barometric Pressure */}
          <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Gauge className="w-20 h-20 text-purple-500" />
            </div>
            <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Pressure</h3>
            <p className="text-xl text-white">{formatPressure(conditions.pressure)}</p>
          </div>
          
          {/* Weather Index (UV) */}
          <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Cloud className="w-20 h-20 text-yellow-300" />
            </div>
            <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">UV Index</h3>
            <p className="text-xl text-white">{conditions.uv_index}</p>
          </div>
        </div>
        
        {/* Fun Drive Checklist */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-green-500 font-orbitron text-xl mb-4">FUN DRIVE CHECKLIST</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Torque Settings */}
            <div className="bg-black bg-opacity-40 p-4 rounded">
              <h4 className="text-blue-400 font-orbitron text-sm mb-2">TORQUE MANAGEMENT</h4>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400">Recommended:</span>
                <span className="text-white font-bold">{automotive_metrics.drive_recommendations.torque_management.recommended_percentage}%</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400">Traction Control:</span>
                <span className="text-white">{automotive_metrics.drive_recommendations.torque_management.traction_control}</span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${automotive_metrics.drive_recommendations.torque_management.recommended_percentage}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Reduced</span>
                  <span>Full Power</span>
                </div>
              </div>
            </div>
            
            {/* Tire Pressure */}
            <div className="bg-black bg-opacity-40 p-4 rounded">
              <h4 className="text-blue-400 font-orbitron text-sm mb-2">TIRE PRESSURE ADJUSTMENTS</h4>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Recommended:</span>
                <span className="text-white font-bold">{automotive_metrics.drive_recommendations.tire_pressure_adjustment > 0 ? '+' : ''}{automotive_metrics.drive_recommendations.tire_pressure_adjustment} PSI</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-4 border-blue-500 flex items-center justify-center bg-gray-900 relative">
                  <div className="text-2xl text-white font-mono">{automotive_metrics.drive_recommendations.tire_pressure_adjustment > 0 ? '+' : ''}{automotive_metrics.drive_recommendations.tire_pressure_adjustment}</div>
                  <div className="text-blue-400 text-sm absolute -bottom-1">PSI</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Driving Info */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-black bg-opacity-30 rounded p-3">
              <h4 className="text-blue-400 font-orbitron text-xs mb-1">TIRE WARMUP TIME</h4>
              <div className="text-white text-lg">
                {automotive_metrics.drive_recommendations.tire_warmup_minutes.performance} min <span className="text-xs text-gray-500">(Performance)</span>
              </div>
            </div>
            <div className="bg-black bg-opacity-30 rounded p-3">
              <h4 className="text-blue-400 font-orbitron text-xs mb-1">TRACK CONDITION</h4>
              <div className="text-white text-lg">
                {automotive_metrics.track_surface.condition} / {automotive_metrics.track_surface.grip_level}
              </div>
            </div>
          </div>
        </div>
        
        {/* Weather data sources */}
        <div className="text-gray-500 text-xs mt-4">
          Data sources: {weatherData.data_sources.weather}, {weatherData.data_sources.solar}
        </div>
      </div>
    </div>
  );
};

export default Paddock20WeatherStation;