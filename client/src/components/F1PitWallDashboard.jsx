import React, { useState, useEffect } from 'react';
import CommuteTimeEstimator from './CommuteTimeEstimator';
import LocationManager from './LocationManager';
import WeatherImpactIndicator from './WeatherImpactIndicator';
import CitySearch from './CitySearch';
import LocationPermissionPrompt from './LocationPermissionPrompt';
import UnitToggle from './UnitToggle';
import { useWeather } from '../contexts/WeatherContext';
import { useUnits } from '../contexts/UnitsContext';
import { MapPin, Search, Settings } from 'lucide-react';

// Component for displaying a Formula 1 style gauge
const F1Gauge = ({ value, min, max, label, units, danger = false, warning = false, optimum = false }) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // Determine color based on state
  let color = "blue-500";
  if (danger) color = "red-500";
  else if (warning) color = "amber-500";
  else if (optimum) color = "green-500";
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-xl font-bold">{value}{units}</div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 mt-1 overflow-hidden">
        <div 
          className={`h-full bg-${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// World Clock component showing times at different global locations
const WorldClocks = () => {
  const [time, setTime] = useState(new Date());
  const [expandedTimezone, setExpandedTimezone] = useState(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationTimezone, setNewLocationTimezone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Default locations - stored in local storage to persist user's choices
  const defaultLocations = [
    { name: "Charlotte", timezone: "America/New_York", flag: "🇺🇸" },
    { name: "Monaco", timezone: "Europe/Monaco", flag: "🇲🇨" },
    { name: "Silverstone", timezone: "Europe/London", flag: "🇬🇧" },
    { name: "Suzuka", timezone: "Asia/Tokyo", flag: "🇯🇵" },
    { name: "Melbourne", timezone: "Australia/Melbourne", flag: "🇦🇺" },
    { name: "Sao Paulo", timezone: "America/Sao_Paulo", flag: "🇧🇷" }
  ];
  
  // Use local storage to persist user's timezone selections
  const [locations, setLocations] = useState(() => {
    const savedLocations = localStorage.getItem('worldClockLocations');
    return savedLocations ? JSON.parse(savedLocations) : defaultLocations;
  });
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Save locations to local storage when they change
  useEffect(() => {
    localStorage.setItem('worldClockLocations', JSON.stringify(locations));
  }, [locations]);
  
  // Format time for display
  const formatTimeForTimezone = (timezone) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: timezone
      }).format(time);
    } catch (error) {
      console.error("Invalid timezone:", timezone);
      return "Invalid";
    }
  };
  
  // Common timezones for easy selection
  const commonTimezones = [
    { name: "New York", timezone: "America/New_York", region: "North America" },
    { name: "Los Angeles", timezone: "America/Los_Angeles", region: "North America" },
    { name: "Chicago", timezone: "America/Chicago", region: "North America" },
    { name: "London", timezone: "Europe/London", region: "Europe" },
    { name: "Paris", timezone: "Europe/Paris", region: "Europe" },
    { name: "Berlin", timezone: "Europe/Berlin", region: "Europe" },
    { name: "Moscow", timezone: "Europe/Moscow", region: "Europe" },
    { name: "Dubai", timezone: "Asia/Dubai", region: "Asia" },
    { name: "Tokyo", timezone: "Asia/Tokyo", region: "Asia" },
    { name: "Shanghai", timezone: "Asia/Shanghai", region: "Asia" },
    { name: "Singapore", timezone: "Asia/Singapore", region: "Asia" },
    { name: "Sydney", timezone: "Australia/Sydney", region: "Australia/Pacific" },
    { name: "Auckland", timezone: "Pacific/Auckland", region: "Australia/Pacific" },
    { name: "Rio de Janeiro", timezone: "America/Sao_Paulo", region: "South America" },
    { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", region: "South America" },
    { name: "Johannesburg", timezone: "Africa/Johannesburg", region: "Africa" },
    { name: "Cairo", timezone: "Africa/Cairo", region: "Africa" }
  ];
  
  // Handle location search
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const filteredResults = commonTimezones.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(filteredResults);
  }, [searchTerm]);
  
  // Add a new location to the clock
  const addLocation = (name, timezone) => {
    // Get flag emoji based on timezone
    let flag = "🌍"; // Default flag
    
    if (timezone.startsWith("America")) flag = "🇺🇸";
    else if (timezone.startsWith("Europe")) flag = "🇪🇺";
    else if (timezone.startsWith("Asia")) flag = "🌏";
    else if (timezone.startsWith("Australia") || timezone.startsWith("Pacific")) flag = "🇦🇺";
    else if (timezone.startsWith("Africa")) flag = "🌍";
    
    // Add the new location
    setLocations(prev => {
      // Don't add duplicates
      if (prev.some(loc => loc.name === name)) {
        return prev;
      }
      return [...prev, { name, timezone, flag }];
    });
    
    // Reset form
    setNewLocationName('');
    setNewLocationTimezone('');
    setShowAddLocation(false);
    setSearchTerm('');
    setSearchResults([]);
  };
  
  // Remove a location from the clock
  const removeLocation = (index) => {
    setLocations(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
          WORLD TIME
        </h3>
        <button 
          className="text-xs text-gray-400 hover:text-white flex items-center"
          onClick={() => setShowAddLocation(!showAddLocation)}
        >
          {showAddLocation ? "Cancel" : "Add Location"}
        </button>
      </div>
      
      {showAddLocation && (
        <div className="mb-3 p-2 bg-gray-900/70 rounded-md">
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search for a city..."
              className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="max-h-32 overflow-y-auto mb-2 bg-gray-800 rounded border border-gray-700">
              {searchResults.map((result, index) => (
                <div 
                  key={index}
                  className="p-1 text-xs hover:bg-gray-700 cursor-pointer flex justify-between"
                  onClick={() => addLocation(result.name, result.timezone)}
                >
                  <span>{result.name}</span>
                  <span className="text-gray-400">{result.region}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Custom location name"
              className="flex-1 bg-gray-800 border border-gray-700 rounded p-1 text-xs"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
            />
            <select
              className="bg-gray-800 border border-gray-700 rounded p-1 text-xs"
              value={newLocationTimezone}
              onChange={(e) => setNewLocationTimezone(e.target.value)}
            >
              <option value="">Select timezone</option>
              {commonTimezones.map((tz, index) => (
                <option key={index} value={tz.timezone}>
                  {tz.name} ({tz.timezone})
                </option>
              ))}
            </select>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 text-xs"
              onClick={() => {
                if (newLocationName && newLocationTimezone) {
                  addLocation(newLocationName, newLocationTimezone);
                }
              }}
              disabled={!newLocationName || !newLocationTimezone}
            >
              Add
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        {locations.map((location, index) => (
          <div 
            key={`${location.name}-${index}`}
            className="bg-gray-900/60 rounded p-2 cursor-pointer hover:bg-gray-700/40 relative"
            onClick={() => setExpandedTimezone(expandedTimezone === location.timezone ? null : location.timezone)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-1">{location.flag}</span>
                <span>{location.name}</span>
              </div>
              <span className="font-mono">{formatTimeForTimezone(location.timezone)}</span>
            </div>
            {expandedTimezone === location.timezone && (
              <div className="mt-2 text-gray-400 text-xs">
                <div>
                  {new Intl.DateTimeFormat('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    timeZone: location.timezone
                  }).format(time)}
                </div>
                <button 
                  className="text-xs text-red-400 hover:text-red-300 mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLocation(index);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Tire Strategy component showing tire-specific information
const TireStrategy = ({ selectedVehicle, weatherData }) => {
  const getTireHealthColor = (value) => {
    if (value >= 85) return "text-green-500";
    if (value >= 70) return "text-green-400";
    if (value >= 50) return "text-yellow-400";
    if (value >= 30) return "text-orange-500";
    return "text-red-500";
  };
  
  // Default tire data (this would come from selected vehicle and be affected by weather)
  const tireData = weatherData?.tireStrategy || {
    optimal_compound: "Loading...",
    tire_temperature: {
      surface: 0,
      core: 0,
      optimal_window: "N/A",
      warmup_time: 0
    },
    pressure: {
      recommendation: "Loading...",
      front_pressure_delta: 0,
      rear_pressure_delta: 0,
      pressure_buildup_rate: "N/A"
    },
    wear: {
      expected_wear_rate: "N/A",
      wear_pattern: "N/A",
      graining_risk: "N/A",
      blistering_risk: "N/A",
      management_strategy: "Loading tire data..."
    }
  };
  
  const vehicleSpecificAdjustment = selectedVehicle ? {
    // This would be calculated based on the specific vehicle selected
    // Different vehicles have different tire characteristics
    optimum_pressure_front: selectedVehicle.tireData?.optimum_pressure_front || 32.5,
    optimum_pressure_rear: selectedVehicle.tireData?.optimum_pressure_rear || 30.0,
    tire_wear_factor: selectedVehicle.tireData?.wear_factor || 1.0,
  } : {
    optimum_pressure_front: 32.5,
    optimum_pressure_rear: 30.0,
    tire_wear_factor: 1.0,
  };
  
  // Calculate adjusted pressures based on weather and vehicle
  const calculatedPressures = {
    front: Math.round((vehicleSpecificAdjustment.optimum_pressure_front + tireData.pressure.front_pressure_delta) * 10) / 10,
    rear: Math.round((vehicleSpecificAdjustment.optimum_pressure_rear + tireData.pressure.rear_pressure_delta) * 10) / 10,
  };
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
        <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
        TIRE STRATEGY
      </h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">Recommended Compound</span>
          <span className="font-medium">{tireData.optimal_compound}</span>
        </div>
        <div className="text-xs text-gray-400 mb-3">
          Based on current track temperature and conditions
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-xs text-gray-400">Surface Temp</div>
            <div className="text-lg font-semibold">
              {tireData.tire_temperature.surface}°F
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Core Temp</div>
            <div className="text-lg font-semibold">
              {tireData.tire_temperature.core}°F
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">Optimal Window</div>
          <div className="text-sm">{tireData.tire_temperature.optimal_window}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 border-b border-gray-700 pb-1">Pressure Recommendations</h4>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <div className="text-xs text-gray-400">Front</div>
            <div className="text-lg font-semibold">{calculatedPressures.front} PSI</div>
            <div className="text-xs text-gray-500">
              {tireData.pressure.front_pressure_delta > 0 ? '+' : ''}
              {tireData.pressure.front_pressure_delta} PSI adjustment
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Rear</div>
            <div className="text-lg font-semibold">{calculatedPressures.rear} PSI</div>
            <div className="text-xs text-gray-500">
              {tireData.pressure.rear_pressure_delta > 0 ? '+' : ''}
              {tireData.pressure.rear_pressure_delta} PSI adjustment
            </div>
          </div>
        </div>
        <div className="text-xs">
          <span className="text-gray-400">Pressure Buildup Rate: </span>
          <span>{tireData.pressure.pressure_buildup_rate}</span>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2 border-b border-gray-700 pb-1">Wear Analysis</h4>
        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Wear Rate:</span>
            <span>{tireData.wear.expected_wear_rate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pattern:</span>
            <span>{tireData.wear.wear_pattern}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Graining Risk:</span>
            <span className={getTireHealthColor(
              tireData.wear.graining_risk === "Low" ? 90 : 
              tireData.wear.graining_risk === "Moderate" ? 60 : 30
            )}>
              {tireData.wear.graining_risk}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Blistering Risk:</span>
            <span className={getTireHealthColor(
              tireData.wear.blistering_risk === "Low" ? 90 : 
              tireData.wear.blistering_risk === "Moderate" ? 60 : 30
            )}>
              {tireData.wear.blistering_risk}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-2 mt-2">
          <div className="text-xs text-gray-400 mb-1">Management Strategy:</div>
          <div className="text-sm">{tireData.wear.management_strategy}</div>
        </div>
      </div>
    </div>
  );
};

// Engine Performance component showing engine-specific information
const EnginePerformance = ({ selectedVehicle, weatherData }) => {
  const engineData = weatherData?.vehiclePerformance || {
    power_adjustment: 0,
    torque_curve: { low_end: "0%", mid_range: "0%", top_end: "0%" },
    cooling_efficiency: "N/A",
    engine_temperature_delta: "N/A",
    optimal_engine_mapping: "N/A",
    fuel_consumption_delta: "N/A"
  };
  
  // Vehicle-specific engine parameters
  const vehicleEngine = selectedVehicle ? {
    type: selectedVehicle.engine?.type || "Gasoline",
    displacement: selectedVehicle.engine?.displacement || "3.0L",
    power: selectedVehicle.engine?.power || "300 hp",
    torque: selectedVehicle.engine?.torque || "260 lb-ft",
    aspiration: selectedVehicle.engine?.aspiration || "Naturally Aspirated",
    redline: selectedVehicle.engine?.redline || "7,000 RPM",
    temperatureRange: selectedVehicle.engine?.temperature_range || "180-220°F",
  } : {
    type: "Gasoline",
    displacement: "3.0L",
    power: "300 hp",
    torque: "260 lb-ft",
    aspiration: "Naturally Aspirated",
    redline: "7,000 RPM",
    temperatureRange: "180-220°F",
  };
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
        <span className="h-2 w-2 bg-amber-500 rounded-full mr-2"></span>
        ENGINE TELEMETRY
      </h3>
      
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-xs text-gray-400">Engine Type</div>
            <div className="text-sm font-semibold">
              {vehicleEngine.type} {vehicleEngine.displacement}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Aspiration</div>
            <div className="text-sm font-semibold">
              {vehicleEngine.aspiration}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-xs text-gray-400">Power</div>
            <div className="text-sm font-semibold">
              {vehicleEngine.power}
              <span className="text-xs ml-1 text-gray-400">
                {engineData.power_adjustment > 0 ? `+${engineData.power_adjustment}%` : engineData.power_adjustment < 0 ? `${engineData.power_adjustment}%` : ''}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Torque</div>
            <div className="text-sm font-semibold">
              {vehicleEngine.torque}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 border-b border-gray-700 pb-1">Weather Impact</h4>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Power Adjustment:</span>
            <span className={engineData.power_adjustment >= 0 ? "text-green-500" : "text-amber-500"}>
              {engineData.power_adjustment > 0 ? '+' : ''}{engineData.power_adjustment}%
            </span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Cooling Efficiency:</span>
            <span className={
              engineData.cooling_efficiency === "Excellent" ? "text-green-500" :
              engineData.cooling_efficiency === "Good" ? "text-green-400" :
              engineData.cooling_efficiency === "Adequate" ? "text-yellow-400" :
              engineData.cooling_efficiency === "Challenged" ? "text-orange-500" :
              "text-red-500"
            }>
              {engineData.cooling_efficiency}
            </span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Temperature Delta:</span>
            <span>{engineData.engine_temperature_delta}</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Fuel Consumption:</span>
            <span>{engineData.fuel_consumption_delta}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2 border-b border-gray-700 pb-1">Torque Curve Impact</h4>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Low End</div>
            <div className={`text-sm ${parseFloat(engineData.torque_curve.low_end) >= 0 ? "text-green-500" : "text-amber-500"}`}>
              {engineData.torque_curve.low_end}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Mid Range</div>
            <div className={`text-sm ${parseFloat(engineData.torque_curve.mid_range) >= 0 ? "text-green-500" : "text-amber-500"}`}>
              {engineData.torque_curve.mid_range}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Top End</div>
            <div className={`text-sm ${parseFloat(engineData.torque_curve.top_end) >= 0 ? "text-green-500" : "text-amber-500"}`}>
              {engineData.torque_curve.top_end}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-2 mt-2">
          <div className="text-xs text-gray-400 mb-1">Recommended Engine Map:</div>
          <div className="text-sm">{engineData.optimal_engine_mapping}</div>
        </div>
      </div>
    </div>
  );
};

// Main Component
function F1PitWallDashboard() {
  // Get weather data from context
  const { 
    weatherData, 
    loading, 
    error, 
    fetchWeatherData, 
    fetchCurrentLocationWeather,
    citySearchOpen,
    setCitySearchOpen,
    showLocationPrompt,
    setShowLocationPrompt
  } = useWeather();
  const { unitSystem, UNIT_SYSTEMS } = useUnits();
  
  // Default vehicle data - must be outside of hooks/effects
  const defaultVehicles = [
    {
      id: 1,
      name: "Ferrari 488 GTB",
      year: 2020,
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      engine: {
        type: "V8 Twin-Turbo",
        displacement: "3.9L",
        power: "661 hp",
        torque: "561 lb-ft",
        aspiration: "Twin-Turbocharged",
        redline: "8,000 RPM",
        temperature_range: "180-220°F"
      },
      tireData: {
        optimum_pressure_front: 35.0,
        optimum_pressure_rear: 32.5,
        wear_factor: 1.25
      }
    },
    {
      id: 2,
      name: "Porsche 911 GT3",
      year: 2021,
      image: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      engine: {
        type: "Flat-6",
        displacement: "4.0L",
        power: "502 hp",
        torque: "346 lb-ft",
        aspiration: "Naturally Aspirated",
        redline: "9,000 RPM",
        temperature_range: "185-225°F"
      },
      tireData: {
        optimum_pressure_front: 36.0,
        optimum_pressure_rear: 33.0,
        wear_factor: 1.1
      }
    },
    {
      id: 3,
      name: "McLaren 720S",
      year: 2019,
      image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      engine: {
        type: "V8 Twin-Turbo",
        displacement: "4.0L",
        power: "710 hp",
        torque: "568 lb-ft",
        aspiration: "Twin-Turbocharged",
        redline: "8,500 RPM",
        temperature_range: "175-215°F"
      },
      tireData: {
        optimum_pressure_front: 34.5,
        optimum_pressure_rear: 32.0,
        wear_factor: 1.3
      }
    }
  ];
  
  // State for vehicle data - initialize with default data
  const [vehicles, setVehicles] = useState(defaultVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState(defaultVehicles[0]);
  
  // State for route planning
  const [originLocation, setOriginLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  
  // Fetch weather data when component mounts
  useEffect(() => {
    // Initial fetch
    fetchWeatherData();
    
    // Refresh weather data every 15 minutes
    const refreshInterval = setInterval(() => {
      fetchWeatherData();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchWeatherData]);
  
  // Loading state
  if (loading && !weatherData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading telemetry data...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !weatherData) {
    const isRateLimit = error.status === 429 || error.isRateLimit;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="text-amber-500 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Weather Telemetry Unavailable</h1>
        <p className="text-gray-400 mb-6">
          {isRateLimit 
            ? "Weather API rate limit exceeded. Please select a different location or try again later."
            : error.message || "Could not fetch weather data. Please try again."}
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          {!isRateLimit && (
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
            >
              Retry
            </button>
          )}
          
          <button
            onClick={() => setCitySearchOpen(true)} 
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center justify-center"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Select Location
          </button>
          
          <button
            onClick={() => setShowLocationPrompt(true)} 
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg flex items-center justify-center"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Use My Location
          </button>
        </div>
        
        {/* Location Permission Dialog */}
        <LocationPermissionPrompt 
          open={showLocationPrompt} 
          onOpenChange={setShowLocationPrompt} 
        />
        
        {/* City Search Dialog */}
        <CitySearch 
          open={citySearchOpen} 
          onOpenChange={setCitySearchOpen} 
        />
      </div>
    );
  }
  
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Main dashboard UI
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-7xl">
        {/* Header with F1-style telemetry feel */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-black/60 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="text-2xl md:text-3xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>WEATHER PADDOCK | GOTIME GARAGE</div>
            <div className="text-lg md:text-xl font-semibold">F1-Inspired Weather & Navigation Telemetry</div>
          </div>
          <div className="mt-3 md:mt-0 flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCitySearchOpen(true)}
                className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 p-2 rounded-lg text-sm"
              >
                <MapPin className="h-4 w-4 text-green-400" />
                <span>{weatherData?.location?.name || 'Select Location'}</span>
              </button>
              
              <UnitToggle />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex flex-col text-sm">
                <div className="text-gray-400">Local Time</div>
                <div>{formatTime(Date.now())}</div>
              </div>
              <div className="px-3 py-1 bg-blue-900/60 rounded text-xs uppercase tracking-wider">
                Live
              </div>
            </div>
          </div>
        </div>
        
        {/* City Search Dialog */}
        <CitySearch open={citySearchOpen} onOpenChange={setCitySearchOpen} />
        
        {/* Location Permission Dialog */}
        <LocationPermissionPrompt open={showLocationPrompt} onOpenChange={setShowLocationPrompt} />
        
        {/* Vehicle selector */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">SELECT VEHICLE</h3>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {vehicles.map(vehicle => (
              <div 
                key={vehicle.id}
                className={`flex items-center p-2 rounded-lg cursor-pointer ${selectedVehicle?.id === vehicle.id ? 'bg-blue-900/60 border border-blue-400/50' : 'bg-gray-800/60 border border-gray-700 hover:bg-gray-700/40'}`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                  {vehicle.image && (
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="font-medium">{vehicle.name}</div>
                  <div className="text-xs text-gray-400">{vehicle.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <div className="bg-gray-800/80 rounded-lg shadow-lg border border-gray-700 p-5 h-full">
              {weatherData && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center">
                        <h2 className="text-2xl font-bold">{weatherData.location.name}</h2>
                        <div className="ml-2 text-3xl">
                          {weatherData.currentConditions.weather[0].main === "Clear" ? "☀️" :
                           weatherData.currentConditions.weather[0].main === "Clouds" ? "☁️" :
                           weatherData.currentConditions.weather[0].main === "Rain" ? "🌧️" :
                           weatherData.currentConditions.weather[0].main === "Snow" ? "❄️" :
                           weatherData.currentConditions.weather[0].main === "Thunderstorm" ? "⚡" :
                           weatherData.currentConditions.weather[0].main === "Drizzle" ? "🌦️" :
                           weatherData.currentConditions.weather[0].main === "Fog" || 
                           weatherData.currentConditions.weather[0].main === "Mist" ? "🌫️" : "🌤️"}
                        </div>
                      </div>
                      <p className="text-gray-400 capitalize">{weatherData.currentConditions.weather[0].description}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold">
                        {Math.round(weatherData.currentConditions.temp)}°
                      </div>
                      <div className="text-sm text-gray-400">
                        Feels like {Math.round(weatherData.currentConditions.feels_like)}°
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <F1Gauge 
                      label="Asphalt Temp" 
                      value={Math.round(weatherData.drivingConditions.track_temp)} 
                      units="°F" 
                      min={32}
                      max={120}
                      danger={weatherData.drivingConditions.track_temp > 95}
                      warning={weatherData.drivingConditions.track_temp > 85}
                      optimum={weatherData.drivingConditions.track_temp >= 60 && weatherData.drivingConditions.track_temp <= 85}
                    />
                    <F1Gauge 
                      label="Grip Index" 
                      value={weatherData.drivingConditions.grip_index} 
                      units="" 
                      min={0}
                      max={100}
                      danger={weatherData.drivingConditions.grip_index < 40}
                      warning={weatherData.drivingConditions.grip_index < 70}
                      optimum={weatherData.drivingConditions.grip_index >= 85}
                    />
                    <F1Gauge 
                      label="Braking" 
                      value={weatherData?.performanceData?.braking_efficiency || 85} 
                      units="%" 
                      min={30}
                      max={100}
                      danger={(weatherData?.performanceData?.braking_efficiency || 85) < 50}
                      warning={(weatherData?.performanceData?.braking_efficiency || 85) < 80}
                      optimum={(weatherData?.performanceData?.braking_efficiency || 85) >= 90}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-gray-700/60 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-400">RH%</div>
                      <div className="text-lg font-semibold">{weatherData.currentConditions.humidity}%</div>
                    </div>
                    <div className="bg-gray-700/60 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-400">Wind Vector</div>
                      <div className="text-lg font-semibold">
                        {Math.round(weatherData.currentConditions.wind_speed)}<span className="text-sm">mph</span>
                      </div>
                      <div className="text-xs text-gray-400">{weatherData.currentConditions.wind_direction}</div>
                    </div>
                    <div className="bg-gray-700/60 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-400">Baro</div>
                      <div className="text-lg font-semibold">
                        {Math.round(weatherData.currentConditions.pressure)}<span className="text-sm">hPa</span>
                      </div>
                    </div>
                    <div className="bg-gray-700/60 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-400">Dewpt</div>
                      <div className="text-lg font-semibold">{Math.round(weatherData.currentConditions.dew_point)}°</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-800/30 p-4 rounded-lg mb-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <span className="h-2 w-2 bg-blue-400 rounded-full mr-2"></span>
                      Track Assessment
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Surface</span>
                        <span className={`font-medium ${
                          weatherData.drivingConditions.grip_assessment === "Excellent" ? "text-green-500" :
                          weatherData.drivingConditions.grip_assessment === "Good" ? "text-green-400" :
                          weatherData.drivingConditions.grip_assessment === "Moderate" ? "text-yellow-400" :
                          weatherData.drivingConditions.grip_assessment === "Poor" ? "text-orange-500" :
                          "text-red-500"
                        }`}>
                          {weatherData.drivingConditions.grip_assessment}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Condition</span>
                        <span className="font-medium">
                          {weatherData.drivingConditions.track_condition}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Evolution</span>
                        <span className="font-medium">
                          {weatherData.drivingConditions.track_evolution}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Precipitation</span>
                        <span className="font-medium">
                          {weatherData.drivingConditions.precipitation_probability}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/40 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      Driver Recommendation
                    </h3>
                    <p className="text-sm">{weatherData.drivingRecommendation}</p>
                    
                    {weatherData.drivingConditions.alert_level !== "Low" && (
                      <div className="mt-3 p-2 bg-amber-900/30 border border-amber-800/50 rounded text-amber-300 text-xs">
                        <span className="font-semibold">Alert: </span>
                        {weatherData.drivingConditions.track_condition !== "Dry" 
                          ? "Reduced grip levels detected. Adjust driving style accordingly." 
                          : "High temperatures may affect vehicle performance."}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Right sidebar */}
          <div className="space-y-6">
            <WorldClocks />
            
            {/* Location Manager for saved locations */}
            <LocationManager 
              onSelectLocation={(location) => {
                // If no origin set, set as origin
                if (!originLocation) {
                  setOriginLocation(location);
                }
                // If origin set but no destination, set as destination
                else if (!destinationLocation) {
                  setDestinationLocation(location);
                }
                // If both set, replace destination
                else {
                  setDestinationLocation(location);
                }
              }} 
            />
            
            {/* Route Weather Impact */}
            {(originLocation || destinationLocation) && (
              <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-3">
                <h3 className="text-sm font-semibold mb-2 text-gray-300 flex items-center">
                  <span className="h-2 w-2 bg-indigo-500 rounded-full mr-2"></span>
                  SELECTED ROUTE
                </h3>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center">
                    <div className="text-sm mr-2">🏁</div>
                    <div className="text-sm">Origin: {originLocation ? originLocation.name : 'Not selected'}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm mr-2">🚩</div>
                    <div className="text-sm">Destination: {destinationLocation ? destinationLocation.name : 'Not selected'}</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 text-xs"
                    onClick={() => {
                      setOriginLocation(null);
                      setDestinationLocation(null);
                    }}
                  >
                    Reset Route
                  </button>
                  {originLocation && destinationLocation && (
                    <button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1 text-xs"
                      onClick={() => {
                        // Swap origin and destination
                        const temp = originLocation;
                        setOriginLocation(destinationLocation);
                        setDestinationLocation(temp);
                      }}
                    >
                      Swap Directions
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Route Weather Impact */}
            {originLocation && destinationLocation && (
              <CommuteRouteWeatherImpact
                origin={originLocation}
                destination={destinationLocation}
                weatherData={weatherData}
              />
            )}
            
            <TireStrategy 
              selectedVehicle={selectedVehicle} 
              weatherData={weatherData} 
            />
            
            <CommuteTimeEstimator
              weatherData={weatherData}
            />
            
            <EnginePerformance 
              selectedVehicle={selectedVehicle} 
              weatherData={weatherData} 
            />
          </div>
        </div>
        
        {/* Bottom status bar */}
        <div className="flex justify-between items-center text-xs text-gray-400 bg-black/40 rounded-lg p-2 border-t border-gray-800">
          <div>Data refreshes every 15 minutes | Last update: {formatTime(Date.now())}</div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span>Status: ONLINE</span>
          </div>
          <div>Powered by PADDOCK20</div>
        </div>
      </div>
    </div>
  );
}

export default F1PitWallDashboard;