import React, { useState, useEffect } from "react";
import { 
  ThermometerSun, 
  Droplets, 
  Wind, 
  CloudRain, 
  Gauge, 
  Timer, 
  ArrowUp, 
  ArrowDown,
  Sun,
  CloudFog,
  AlertTriangle,
  Info,
  Compass,
  BarChart3,
  Car,
  Clock,
  Sunset,
  Sunrise,
  Shield,
  Activity,
  Eye
} from "lucide-react";
import { MAIN_CONTENT_ID } from '../lib/accessibility';
import { useQuery } from '@tanstack/react-query';
import * as weatherUtils from "../utils/weatherUtils";
import { getWeatherColorScheme, getContainerClasses, getAlertLevelColor } from "../utils/weatherColorScheme";

const { getWindDirection } = weatherUtils;
import { analyzeWeatherRisk, type WeatherRiskReport } from "../lib/WeatherRiskAnalyzer";

// Default location (Charlotte)
const DEFAULT_LOCATION = { lat: 35.2271, lon: -80.8431 };

/**
 * F1-inspired comprehensive weather dashboard
 * Focused on providing critical weather data for driving enthusiasts
 */
const F1WeatherCenterPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('surface');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [colorScheme, setColorScheme] = useState(getWeatherColorScheme());
  
  // Fetch basic weather data
  const { 
    data: weatherData, 
    isLoading: weatherLoading,
    error: weatherError
  } = useQuery({
    queryKey: ['/api/automotive-weather', DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon],
    queryFn: async () => {
      const res = await fetch(`/api/automotive-weather?lat=${DEFAULT_LOCATION.lat}&lon=${DEFAULT_LOCATION.lon}&units=imperial`);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      return res.json();
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
  
  // Get list of user vehicles for the vehicle selector
  const { 
    data: vehicles, 
    isLoading: vehiclesLoading
  } = useQuery({
    queryKey: ['/api/vehicles'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/vehicles');
        if (!res.ok) return []; // Return empty array on error, don't block weather display
        return res.json();
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        return []; // Return empty array on error
      }
    }
  });
  
  // Fetch vehicle-specific weather data if a vehicle is selected
  const { 
    data: vehicleWeatherData,
    isLoading: vehicleWeatherLoading
  } = useQuery({
    queryKey: ['/api/vehicle-weather', selectedVehicleId, DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon],
    queryFn: async () => {
      if (!selectedVehicleId) return null;
      const res = await fetch(`/api/vehicle-weather/${selectedVehicleId}?lat=${DEFAULT_LOCATION.lat}&lon=${DEFAULT_LOCATION.lon}&units=imperial`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedVehicleId,
    staleTime: 5 * 60 * 1000,
  });
  
  // Use vehicle-specific data if available, otherwise use basic weather data
  const displayData = vehicleWeatherData || weatherData;
  
  // Update color scheme based on weather conditions
  useEffect(() => {
    if (displayData) {
      const condition = displayData.currentConditions.weather[0]?.main || 'default';
      const temperature = displayData.currentConditions.temp || 70;
      const isDay = displayData.currentConditions.is_day;
      
      setColorScheme(getWeatherColorScheme(condition, temperature, isDay));
    }
  }, [displayData]);
  
  if (weatherLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[60vh]" id={MAIN_CONTENT_ID}>
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="text-blue-400 text-xl mt-4 font-orbitron">Loading Telemetry Data...</p>
      </div>
    );
  }
  
  if (weatherError || !weatherData) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[60vh]" id={MAIN_CONTENT_ID}>
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Weather Telemetry Unavailable</h1>
        <p className="text-gray-400 mb-6">Unable to retrieve weather data. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Extract relevant data from display data
  const current = displayData.currentConditions;
  const drivingCond = displayData.drivingConditions;
  const performanceData = displayData.performanceData;
  const tireData = displayData.tireData;
  const sunData = displayData.sunData;
  const forecastTrend = displayData.forecastTrend;
  
  // Classes for the main container based on weather
  const containerClasses = getContainerClasses(colorScheme);
  
  return (
    <div className="py-8" id={MAIN_CONTENT_ID}>
      {/* Page header */}
      <header className="mb-8 text-center">
        <h1 className="apex-header font-orbitron text-3xl mb-2 text-blue-400">F1 Weather Telemetry</h1>
        <p className="text-gray-400">
          Professional-grade weather analytics for driving enthusiasts
        </p>
      </header>
      
      {/* Vehicle selector (if vehicles available) */}
      {vehicles && vehicles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between bg-black/50 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center">
              <Car className="text-blue-400 mr-2" size={20} />
              <span className="text-white font-medium">Selected Vehicle:</span>
            </div>
            <select
              className="bg-gray-900 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedVehicleId || ''}
              onChange={(e) => setSelectedVehicleId(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">No Vehicle Selected</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
          
          {/* Show vehicle-specific tire telemetry notice if available */}
          {vehicleWeatherData && vehicleWeatherData.vehicleSpecificData && (
            <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3 mt-2 text-sm text-blue-300">
              <div className="flex items-center">
                <Info size={16} className="mr-2 flex-shrink-0" />
                <span>
                  Vehicle-specific tire telemetry active for your {vehicleWeatherData.vehicle.year} {vehicleWeatherData.vehicle.make} {vehicleWeatherData.vehicle.model}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Current conditions overview */}
      <section className={`mb-6 rounded-lg border overflow-hidden ${containerClasses}`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{weatherData.location.name}</h2>
              <p className="text-gray-400 capitalize">{current.weather[0].description}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="text-4xl font-bold text-white mr-4">{Math.round(current.temp)}°F</div>
              <div className="flex flex-col items-start">
                <div className="text-gray-300 text-sm">Feels like: {Math.round(current.feels_like)}°F</div>
                <div className="text-gray-300 text-sm">Track: {Math.round(drivingCond.track_temp)}°F</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick stats bar */}
        <div className="grid grid-cols-3 md:grid-cols-6 bg-black/50 text-center py-3 px-1">
          <div className="flex flex-col items-center">
            <Wind className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{Math.round(current.wind_speed)} mph</div>
            <div className="text-gray-400 text-xs">Wind</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Droplets className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{current.humidity}%</div>
            <div className="text-gray-400 text-xs">Humidity</div>
          </div>
          
          <div className="flex flex-col items-center">
            <BarChart3 className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{current.pressure} hPa</div>
            <div className="text-gray-400 text-xs">Pressure</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Sun className="h-4 w-4 text-yellow-400 mb-1" />
            <div className="text-white font-medium">{current.uvi}</div>
            <div className="text-gray-400 text-xs">UV Index</div>
          </div>
          
          <div className="flex flex-col items-center">
            <CloudRain className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{Math.round(drivingCond.precipitation_probability)}%</div>
            <div className="text-gray-400 text-xs">Precip</div>
          </div>
          
          <div className="flex flex-col items-center">
            <CloudFog className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{current.visibility.toFixed(1)} km</div>
            <div className="text-gray-400 text-xs">Visibility</div>
          </div>
        </div>
      </section>

      {/* Sun position data - important for glare assessment */}
      <section className="mb-6 rounded-lg border border-gray-800 bg-black/30 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-x divide-gray-800">
          <div className="p-4 flex flex-col items-center">
            <Sunrise className="text-amber-400 mb-2" size={20} />
            <h3 className="font-medium text-gray-400 mb-1">Sunrise</h3>
            <p className="text-white text-lg">
              {new Date(sunData.sunrise).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          
          <div className="p-4 flex flex-col items-center">
            <Sun className="text-amber-500 mb-2" size={20} />
            <h3 className="font-medium text-gray-400 mb-1">Glare Risk</h3>
            <p className={`text-lg font-medium 
              ${sunData.glareRisk === 'Severe' ? 'text-red-400' : 
                sunData.glareRisk === 'Moderate' ? 'text-amber-400' : 'text-green-400'}`}>
              {sunData.glareRisk} {sunData.glareDirection !== 'None' ? `(${sunData.glareDirection})` : ''}
            </p>
          </div>
          
          <div className="p-4 flex flex-col items-center">
            <Sunset className="text-orange-400 mb-2" size={20} />
            <h3 className="font-medium text-gray-400 mb-1">Sunset</h3>
            <p className="text-white text-lg">
              {new Date(sunData.sunset).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
      </section>
      
      {/* F1 Pit Wall Telemetry Tabs */}
      <section className="mb-6 bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        <div className="border-b border-gray-800">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                selectedTab === 'surface' 
                  ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-blue-400'
              }`}
              onClick={() => setSelectedTab('surface')}
            >
              Track Surface
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                selectedTab === 'air' 
                  ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-blue-400'
              }`}
              onClick={() => setSelectedTab('air')}
            >
              Air Metrics
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                selectedTab === 'tire' 
                  ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-blue-400'
              }`}
              onClick={() => setSelectedTab('tire')}
            >
              Tire Telemetry
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                selectedTab === 'performance' 
                  ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-blue-400'
              }`}
              onClick={() => setSelectedTab('performance')}
            >
              Performance
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Track Surface Tab */}
          {selectedTab === 'surface' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <ThermometerSun className="h-4 w-4 text-yellow-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Track Surface Temp</h4>
                </div>
                <p className="text-xl font-bold text-white">{Math.round(drivingCond.track_temp)}°F</p>
                <p className="text-xs text-gray-500 mt-1">Asphalt / Active Surface</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Gauge className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Track Grip Index</h4>
                </div>
                <p className="text-xl font-bold text-white">{drivingCond.grip_index}%</p>
                <p className="text-xs text-gray-500 mt-1">Relative to dry optimal</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Track Evolution</h4>
                </div>
                <p className="text-xl font-bold text-white">{drivingCond.track_evolution}%</p>
                <p className="text-xs text-gray-500 mt-1">Rubber accumulation rate</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Track Condition</h4>
                </div>
                <p className="text-xl font-bold text-white">{drivingCond.track_condition}</p>
                <p className="text-xs text-gray-500 mt-1">Surface state assessment</p>
              </div>
            </div>
          )}
          
          {/* Air Metrics Tab */}
          {selectedTab === 'air' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <ThermometerSun className="h-4 w-4 text-red-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Ambient Temperature</h4>
                </div>
                <p className="text-xl font-bold text-white">{Math.round(current.temp)}°F</p>
                <p className="text-xs text-gray-500 mt-1">Air temperature at 2m height</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Humidity</h4>
                </div>
                <p className="text-xl font-bold text-white">{current.humidity}%</p>
                <p className="text-xs text-gray-500 mt-1">Relative humidity</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Barometric Pressure</h4>
                </div>
                <p className="text-xl font-bold text-white">{current.pressure} hPa</p>
                <p className="text-xs text-gray-500 mt-1">Atmospheric pressure</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <CloudRain className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Dew Point</h4>
                </div>
                <p className="text-xl font-bold text-white">{Math.round(current.dew_point)}°F</p>
                <p className="text-xs text-gray-500 mt-1">Condensation temperature</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Wind className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Wind Speed</h4>
                </div>
                <p className="text-xl font-bold text-white">{Math.round(current.wind_speed)} mph</p>
                <p className="text-xs text-gray-500 mt-1">{current.wind_direction} ({current.wind_deg}°)</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Sun className="h-4 w-4 text-yellow-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">UV Index</h4>
                </div>
                <p className="text-xl font-bold text-white">{current.uvi}</p>
                <p className="text-xs text-gray-500 mt-1">Ultraviolet intensity</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <CloudFog className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Visibility</h4>
                </div>
                <p className="text-xl font-bold text-white">{current.visibility.toFixed(1)} km</p>
                <p className="text-xs text-gray-500 mt-1">Horizontal visibility</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Compass className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Wind Direction</h4>
                </div>
                <p className="text-xl font-bold text-white">{current.wind_direction}</p>
                <p className="text-xs text-gray-500 mt-1">{getWindDirectionText(current.wind_deg)}</p>
              </div>
            </div>
          )}
          
          {/* Tire Telemetry Tab */}
          {selectedTab === 'tire' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center mb-2">
                    <Timer className="h-4 w-4 text-blue-500 mr-2" />
                    <h4 className="text-gray-400 text-sm">Tire Warmup Time</h4>
                  </div>
                  {vehicleWeatherData?.vehicleSpecificData?.tireData ? (
                    // Vehicle-specific tire warmup
                    <p className="text-xl font-bold text-white">
                      {vehicleWeatherData.vehicleSpecificData.tireData.warmupEstimate} min
                    </p>
                  ) : (
                    // Generic tire warmup range
                    <p className="text-xl font-bold text-white">
                      {displayData.tireData.warmup_times.sport}-{displayData.tireData.warmup_times.all_season} min
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {vehicleWeatherData?.vehicleSpecificData?.tireData?.brand 
                      ? `${vehicleWeatherData.vehicleSpecificData.tireData.brand} ${vehicleWeatherData.vehicleSpecificData.tireData.model || ''}` 
                      : "Estimated range based on compound"}
                  </p>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center mb-2">
                    <ThermometerSun className="h-4 w-4 text-red-500 mr-2" />
                    <h4 className="text-gray-400 text-sm">Tire Surface Temp</h4>
                  </div>
                  <p className="text-xl font-bold text-white">{tireData.tire_surface_temp}°F</p>
                  <p className="text-xs text-gray-500 mt-1">Working surface temperature</p>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center mb-2">
                    <ThermometerSun className="h-4 w-4 text-orange-500 mr-2" />
                    <h4 className="text-gray-400 text-sm">Tire Core Temp</h4>
                  </div>
                  <p className="text-xl font-bold text-white">{tireData.tire_core_temp}°F</p>
                  <p className="text-xs text-gray-500 mt-1">Internal temperature</p>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center mb-2">
                    <Info className="h-4 w-4 text-green-500 mr-2" />
                    <h4 className="text-gray-400 text-sm">Optimal Compound</h4>
                  </div>
                  <p className="text-xl font-bold text-white">{tireData.optimal_compound}</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended tire type</p>
                </div>
              </div>
              
              {/* Tire-specific data if a vehicle is selected */}
              {vehicleWeatherData?.vehicleSpecificData?.tireData && (
                <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mt-2">
                  <h3 className="text-blue-400 text-md font-medium mb-3">Vehicle-Specific Tire Data</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tire details */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Brand/Model:</span>
                        <span className="text-white font-medium">
                          {vehicleWeatherData.vehicleSpecificData.tireData.brand || 'Unknown'} {' '}
                          {vehicleWeatherData.vehicleSpecificData.tireData.model || ''}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white font-medium">
                          {vehicleWeatherData.vehicleSpecificData.tireData.type || 'Not specified'}
                        </span>
                      </div>
                      
                      {vehicleWeatherData.vehicleSpecificData.tireData.treadWear && (
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Treadwear:</span>
                          <span className="text-white font-medium">
                            {vehicleWeatherData.vehicleSpecificData.tireData.treadWear}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Tire pressure recommendations */}
                    {vehicleWeatherData.vehicleSpecificData.tireData.optimalTirePressure && (
                      <div className="bg-blue-900/20 rounded p-3">
                        <h4 className="text-blue-400 text-sm font-medium mb-2">Optimal Tire Pressure</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Cold:</span>
                            <span className="text-white font-medium ml-2">
                              {vehicleWeatherData.vehicleSpecificData.tireData.optimalTirePressure.cold} {vehicleWeatherData.vehicleSpecificData.tireData.optimalTirePressure.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Hot:</span>
                            <span className="text-white font-medium ml-2">
                              {vehicleWeatherData.vehicleSpecificData.tireData.optimalTirePressure.hot} {vehicleWeatherData.vehicleSpecificData.tireData.optimalTirePressure.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Generic tire recommendations if no vehicle is selected */}
              {!vehicleWeatherData?.vehicleSpecificData?.tireData && (
                <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mt-2">
                  <h3 className="text-blue-400 text-md font-medium mb-2">Tire Recommendations</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    For {displayData.drivingConditions.track_condition} conditions at {Math.round(displayData.drivingConditions.track_temp)}°F:
                  </p>
                  <div className="bg-blue-900/20 rounded p-3 text-sm">
                    <p className="text-white">{getTireRecommendation(displayData.drivingConditions.track_condition, displayData.drivingConditions.track_temp)}</p>
                    <p className="text-gray-400 mt-2 text-xs">Select a vehicle from your garage for personalized tire recommendations.</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Performance Tab */}
          {selectedTab === 'performance' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Gauge className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Power Output</h4>
                </div>
                <p className="text-xl font-bold text-white">
                  {performanceData.power_adjustment > 0 ? '+' : ''}{performanceData.power_adjustment.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Air density effect</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Braking Efficiency</h4>
                </div>
                <p className="text-xl font-bold text-white">{performanceData.braking_efficiency}%</p>
                <p className="text-xs text-gray-500 mt-1">Relative to optimal</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Wind className="h-4 w-4 text-yellow-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Crosswind Effect</h4>
                </div>
                <p className="text-xl font-bold text-white">{performanceData.crosswind_effect}</p>
                <p className="text-xs text-gray-500 mt-1">Vehicle stability impact</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <CloudFog className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Visibility</h4>
                </div>
                <p className="text-xl font-bold text-white">{performanceData.visibility}</p>
                <p className="text-xs text-gray-500 mt-1">{current.visibility.toFixed(1)} km range</p>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Risk Analysis Panel */}
      <section className="mb-6 bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center mb-2">
            <Shield className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-white">Driving Risk Analysis</h2>
          </div>
          
          {/* Risk Analysis */}
          {(() => {
            // Process weather data through risk analyzer
            const riskData: WeatherRiskReport = analyzeWeatherRisk({
              temp: current.temp,
              feels_like: current.feels_like,
              dew_point: current.dew_point,
              humidity: current.humidity,
              wind_speed: current.wind_speed,
              uvi: current.uvi,
              pressure: current.pressure,
              visibility: current.visibility,
              weather: current.weather
            });
            
            // Status color classes
            const overallStatusColor = 
              riskData.overall === 'Ideal' ? 'text-green-500' :
              riskData.overall === 'Watch Conditions' ? 'text-amber-500' : 'text-red-500';
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-3">
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-gray-400 text-sm">Overall Status</h3>
                    <div className={`text-sm font-medium ${overallStatusColor}`}>
                      {riskData.overall}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Activity className={`h-5 w-5 mr-2 ${overallStatusColor}`} />
                    <div className="text-white font-medium">
                      {riskData.overall === 'Ideal' ? 'Optimal driving conditions' :
                       riskData.overall === 'Watch Conditions' ? 'Moderate caution advised' :
                       'Significant risk factors present'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-gray-400 text-sm">Grip Risk</h3>
                    <div className={`text-sm font-medium ${getAlertLevelColor(riskData.gripRisk.toLowerCase())}`}>
                      {riskData.gripRisk}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Gauge className={`h-5 w-5 mr-2 ${getAlertLevelColor(riskData.gripRisk.toLowerCase())}`} />
                    <div className="text-white font-medium">
                      {riskData.gripRisk === 'Low' ? 'Consistent traction available' :
                       riskData.gripRisk === 'Moderate' ? 'Variable grip expected' :
                       'Reduced traction in all sectors'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-gray-400 text-sm">Detailing Risk</h3>
                    <div className={`text-sm font-medium ${
                      riskData.detailRisk === 'Good' ? 'text-green-500' :
                      riskData.detailRisk === 'Caution' ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {riskData.detailRisk}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Sun className={`h-5 w-5 mr-2 ${
                      riskData.detailRisk === 'Good' ? 'text-green-500' :
                      riskData.detailRisk === 'Caution' ? 'text-amber-500' : 'text-red-500'
                    }`} />
                    <div className="text-white font-medium">
                      {riskData.detailRisk === 'Good' ? 'Ideal for exterior work' :
                       riskData.detailRisk === 'Caution' ? 'Limited exterior recommended' :
                       'Interior work only advised'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-gray-400 text-sm">Visibility</h3>
                    <div className={`text-sm font-medium ${
                      riskData.visibility === 'Clear' ? 'text-green-500' : 'text-amber-500'
                    }`}>
                      {riskData.visibility}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Eye className={`h-5 w-5 mr-2 ${
                      riskData.visibility === 'Clear' ? 'text-green-500' : 'text-amber-500'
                    }`} />
                    <div className="text-white font-medium">
                      {riskData.visibility === 'Clear' 
                        ? 'Full visibility range' 
                        : 'Reduced sight distance'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Safety Notes */}
          <div className="mt-4 bg-blue-900/20 rounded-lg p-3 border border-blue-900/30">
            <h3 className="text-blue-400 text-sm font-medium mb-2">Safety Advisory Notes</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              {(() => {
                // Get risk notes
                const riskData = analyzeWeatherRisk({
                  temp: current.temp,
                  feels_like: current.feels_like,
                  dew_point: current.dew_point,
                  humidity: current.humidity,
                  wind_speed: current.wind_speed,
                  uvi: current.uvi,
                  pressure: current.pressure,
                  visibility: current.visibility,
                  weather: current.weather
                });
                
                return riskData.notes.length > 0 ? (
                  riskData.notes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-400 mr-2">→</span>
                      <span>{note}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    <span>Current conditions are optimal for driving with no significant weather hazards detected.</span>
                  </li>
                );
              })()}
            </ul>
          </div>
        </div>
      </section>
      
      {/* Strategy Recommendation */}
      <section className="mb-8 bg-black/30 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Driving Strategy Recommendation</h2>
        <p className="text-gray-300 mb-4">{displayData.drivingRecommendation}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-medium mb-2">Driving Adjustments</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>
                  {displayData.drivingConditions.track_condition === 'Wet' || displayData.drivingConditions.track_condition === 'Damp'
                    ? "Smooth inputs required. Progressive throttle application on exits."
                    : displayData.drivingConditions.track_condition === 'Optimal'
                    ? "Track conditions support aggressive turn-in and earlier throttle application."
                    : "Moderate approach recommended. Focus on clean exits."}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>
                  {performanceData.braking_efficiency < 80
                    ? "Extended braking zones needed. Earlier brake application required."
                    : performanceData.braking_efficiency > 95
                    ? "Optimal braking conditions. Late braking points viable."
                    : "Standard braking reference points. Adjust based on feedback."}
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-blue-500 font-medium mb-2">Weather Trend</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>
                  Temperature: <span className="font-medium">{forecastTrend.temperature_trend}</span> 
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>
                  Conditions: <span className="font-medium">{forecastTrend.condition_trend}</span>
                </span>
              </li>
              {forecastTrend.next_precipitation && (
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">→</span>
                  <span>
                    Next precipitation: <span className="font-medium">
                      {forecastTrend.next_precipitation.condition} expected in
                      {' '}{formatTimeDifference(forecastTrend.next_precipitation.time)}
                    </span>
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
      
      {/* Data update info */}
      <div className="text-center text-xs text-gray-500">
        <p>Weather data updated at {new Date().toLocaleTimeString()} • Refresh in {calculateRefreshTime(15)} minutes</p>
        <p className="mt-1">
          <Clock className="inline-block h-3 w-3 mr-1" />
          Data refreshes automatically every 15 minutes
        </p>
      </div>
    </div>
  );
};

// Helper functions
function getWindDirectionText(degrees: number): string {
  if (degrees >= 337.5 || degrees < 22.5) return "Northerly";
  if (degrees >= 22.5 && degrees < 67.5) return "Northeasterly";
  if (degrees >= 67.5 && degrees < 112.5) return "Easterly";
  if (degrees >= 112.5 && degrees < 157.5) return "Southeasterly";
  if (degrees >= 157.5 && degrees < 202.5) return "Southerly";
  if (degrees >= 202.5 && degrees < 247.5) return "Southwesterly";
  if (degrees >= 247.5 && degrees < 292.5) return "Westerly";
  if (degrees >= 292.5 && degrees < 337.5) return "Northwesterly";
  return "Variable";
}

function getTireRecommendation(trackCondition: string, trackTemp: number): string {
  if (trackCondition === 'Snow-covered' || trackCondition === 'Icy') {
    return "Winter tires or chains are essential for safe operation in these conditions.";
  }
  
  if (trackCondition === 'Wet') {
    return "Tires with good wet traction and adequate tread depth (>4/32\") are recommended. Consider reducing pressure by 1-2 psi from normal.";
  }
  
  if (trackCondition === 'Damp') {
    return "Performance all-season or summer tires with good tread depth will provide balanced grip. Standard pressures appropriate.";
  }
  
  if (trackTemp > 100) {
    return "Heat-resistant performance compounds will provide better consistency. Consider raising cold pressures by 1-2 psi to compensate for higher thermal expansion.";
  }
  
  if (trackTemp < 45) {
    return "Softer compounds with good cold-weather performance are recommended. Pressures may need to be 2-3 psi higher than normal cold settings for these conditions.";
  }
  
  return "Current conditions are suitable for most performance-oriented tire compounds. Standard manufacturer-recommended pressures will provide optimal performance.";
}

function formatTimeDifference(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;
  
  if (diff <= 0) return "now";
  
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes} minutes`;
}

function calculateRefreshTime(refreshInterval: number): number {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextRefresh = Math.ceil(minutes / refreshInterval) * refreshInterval;
  return nextRefresh - minutes;
}

export default F1WeatherCenterPage;