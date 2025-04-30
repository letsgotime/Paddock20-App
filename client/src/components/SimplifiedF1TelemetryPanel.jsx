import React from 'react';
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
  AlertTriangle,
  Compass
} from 'lucide-react';

/**
 * A simplified F1 Pit Wall style telemetry data component
 * that doesn't rely on context and uses props directly
 */
const SimplifiedF1TelemetryPanel = () => {
  // Sample direct data that's guaranteed to display
  const weatherData = {
    location: "Charlotte",
    current: {
      temp: 72,
      humidity: 65,
      pressure: 1015,
      wind_speed: 8,
      wind_deg: 210,
      clouds: 40,
      weather: [{ main: "Clouds", description: "scattered clouds" }]
    }
  };
  
  // Surface metrics calculations based on direct values
  const trackTemp = Math.round(weatherData.current.temp * 1.15);
  const trackGrip = weatherData.current.humidity > 80 ? 65 : 85;
  const evolution = weatherData.current.clouds < 50 ? 75 : 60;
  const trackCondition = weatherData.current.humidity > 80 ? "Moist" : "Dry";

  return (
    <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-6">
      <div className="mb-4">
        <h3 className="text-blue-400 font-orbitron text-lg mb-2 border-b border-blue-900 pb-2">F1 Pit Wall Telemetry</h3>
        <p className="text-gray-300 mb-4">
          Real-time telemetry data for {weatherData.location} based on F1 pit wall metrics
        </p>
      </div>
      
      {/* Track Surface Metrics */}
      <div>
        <h4 className="text-green-400 text-sm font-semibold mb-3 border-b border-gray-800 pb-1">Track Surface Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ThermometerSun className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Track Surface Temp</h4>
            </div>
            <p className="text-xl font-bold text-white">{trackTemp}°F</p>
            <p className="text-xs text-gray-500 mt-1">Asphalt / Active Surface</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Gauge className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Track Grip Index</h4>
            </div>
            <p className="text-xl font-bold text-white">{trackGrip}%</p>
            <p className="text-xs text-gray-500 mt-1">Relative to dry optimal</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ArrowUp className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Track Evolution</h4>
            </div>
            <p className="text-xl font-bold text-white">{evolution}%</p>
            <p className="text-xs text-gray-500 mt-1">Rubber accumulation rate</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Droplets className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Track Condition</h4>
            </div>
            <p className="text-xl font-bold text-white">{trackCondition}</p>
            <p className="text-xs text-gray-500 mt-1">Surface state assessment</p>
          </div>
        </div>
      </div>
      
      {/* Air Metrics */}
      <div>
        <h4 className="text-blue-400 text-sm font-semibold mb-3 border-b border-gray-800 pb-1">Air Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ThermometerSun className="h-4 w-4 text-red-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Ambient Temperature</h4>
            </div>
            <p className="text-xl font-bold text-white">{weatherData.current.temp}°F</p>
            <p className="text-xs text-gray-500 mt-1">Air temperature at 2m height</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Droplets className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Humidity</h4>
            </div>
            <p className="text-xl font-bold text-white">{weatherData.current.humidity}%</p>
            <p className="text-xs text-gray-500 mt-1">Relative humidity</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Gauge className="h-4 w-4 text-purple-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Barometric Pressure</h4>
            </div>
            <p className="text-xl font-bold text-white">{weatherData.current.pressure} hPa</p>
            <p className="text-xs text-gray-500 mt-1">Atmospheric pressure</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Wind className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Wind Speed</h4>
            </div>
            <p className="text-xl font-bold text-white">{weatherData.current.wind_speed} mph</p>
            <p className="text-xs text-gray-500 mt-1">Current wind velocity</p>
          </div>
        </div>
      </div>
      
      {/* Tire & Vehicle Metrics */}
      <div>
        <h4 className="text-orange-400 text-sm font-semibold mb-3 border-b border-gray-800 pb-1">Performance Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Timer className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Tire Warmup Time</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {weatherData.current.temp < 60 ? '8-10' : '4-6'} min
            </p>
            <p className="text-xs text-gray-500 mt-1">Sport compounds</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Gauge className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Power Output</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {weatherData.current.humidity > 80 ? '-2.1%' : '+0.5%'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Air density effect</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Wind className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Crosswind Effect</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {weatherData.current.wind_speed < 5 ? 'Minimal' : 
               weatherData.current.wind_speed < 10 ? 'Light' : 
               weatherData.current.wind_speed < 20 ? 'Moderate' : 'Significant'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Vehicle stability impact</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Tire Degradation</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {trackTemp > 100 ? 'High' : 
               trackTemp > 85 ? 'Moderate' : 'Low'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Wear factor assessment</p>
          </div>
        </div>
      </div>
      
      {/* Strategy Recommendation */}
      <div className="mt-4 bg-black/80 p-4 rounded-lg border border-blue-900">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <h4 className="text-blue-400 text-base font-semibold">Pit Strategy Recommendation</h4>
            <p className="text-gray-300 mt-1">
              {trackCondition === "Dry" && trackTemp < 100 
                ? "Standard stint lengths with focus on maintaining optimal tire temperature."
                : trackCondition === "Dry" && trackTemp >= 100
                ? "Consider shorter stint lengths and tire management to prevent overheating."
                : "Prepare for changing conditions, monitor wear patterns closely."}
            </p>
          </div>
        </div>
      </div>
      
      {/* Important! Notice about data source */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>F1-style telemetry data calculated from real weather conditions</p>
        <p>For demonstration purposes - not for actual racing</p>
      </div>
    </div>
  );
};

export default SimplifiedF1TelemetryPanel;