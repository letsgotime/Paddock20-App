import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Activity, 
  Sunrise, 
  Sunset, 
  Clock, 
  CloudRain, 
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import LocationSelector from './LocationSelector';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AccessibilityAnnouncement } from '@/components/ui/accessibility';

const F1MotorsportWeatherStation = () => {
  const { 
    weatherData, 
    oneCallData, 
    selectedLocation, 
    unit, 
    setUnit, 
    isLoading, 
    error 
  } = useWeather();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusMessage, setStatusMessage] = useState('');
  const [surfaceTemp, setSurfaceTemp] = useState(0);
  const [showTirePanel, setShowTirePanel] = useState(true); // By default, show tire panel
  
  // Update the current time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle loading and error states
  useEffect(() => {
    if (isLoading) {
      setStatusMessage('Loading weather data...');
    } else if (error) {
      setStatusMessage(`Error: ${error.message}`);
    } else if (!weatherData || !oneCallData) {
      setStatusMessage('Weather data not available.');
    } else {
      setStatusMessage('');
      
      // Calculate approximate surface temperature (asphalt)
      const airTemp = weatherData.main.temp;
      const isDaytime = currentTime.getHours() > 6 && currentTime.getHours() < 20;
      const cloudCover = weatherData.clouds?.all || 0;
      
      // Calculate surface temperature based on air temperature, time of day, and cloud cover
      const cloudEffect = 1 - (cloudCover / 100);
      const timeEffect = isDaytime ? 1 : 0.2;
      const asphaltFactor = 25; // Asphalt can be 20-30°F warmer than air at peak sun
      
      const calculatedSurfaceTemp = Math.round(airTemp + (asphaltFactor * cloudEffect * timeEffect));
      setSurfaceTemp(calculatedSurfaceTemp);
    }
  }, [isLoading, error, weatherData, oneCallData]);
  
  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg border border-gray-800 shadow-xl animate-pulse">
        <div className="h-8 bg-gray-800 rounded mb-4 w-2/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-800 rounded"></div>
          <div className="h-32 bg-gray-800 rounded"></div>
          <div className="h-32 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error || !weatherData || !oneCallData || !oneCallData.current) {
    return (
      <div className="p-6 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg border border-gray-800 shadow-xl">
        <h2 className="text-2xl font-orbitron text-blue-400 mb-4">F1 Weather Station</h2>
        <div className="bg-black/40 p-6 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white mb-2">Unable to load weather data</p>
          <p className="text-gray-400 text-sm">{error?.message || 'Please try again later'}</p>
        </div>
        <LocationSelector />
      </div>
    );
  }
  
  // Format data for display
  const displayUnit = unit === 'imperial' ? 'F' : 'C';
  const speedUnit = unit === 'imperial' ? 'mph' : 'km/h';
  const tempValue = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const humidity = weatherData.main.humidity;
  const windSpeed = Math.round(unit === 'imperial' ? weatherData.wind.speed : weatherData.wind.speed * 1.60934);
  const windDirection = weatherData.wind.deg;
  const pressure = Math.round(weatherData.main.pressure);
  const visibility = Math.round((weatherData.visibility / 1000) * (unit === 'imperial' ? 0.621371 : 1));
  const uvIndex = oneCallData.current.uvi;
  const sunrise = new Date(oneCallData.current.sunrise * 1000);
  const sunset = new Date(oneCallData.current.sunset * 1000);
  const weatherIcon = weatherData.weather[0]?.icon;
  const weatherDesc = weatherData.weather[0]?.description;
  const rainChance = Math.round((oneCallData.hourly?.[0]?.pop || 0) * 100);
  
  // Get automotive data
  const automotiveData = oneCallData?.automotiveData;
  
  // Extract F1-specific performance metrics
  const tireWarmupTimes = automotiveData?.performance?.tireWarmupTime || {
    sport: 3,
    summer: 4,
    allSeason: 5,
    winter: 8
  };
  
  const tirePressure = automotiveData?.performance?.recommendedTirePressure || {
    front: { min: 29, optimal: 32, max: 35, unit: 'PSI' },
    rear: { min: 27, optimal: 30, max: 33, unit: 'PSI' }
  };
  
  const torqueEffect = automotiveData?.performance?.torqueEffect || {
    description: "Normal torque application recommended",
    percentageAdjustment: 0
  };
  
  const aerodynamics = automotiveData?.performance?.aerodynamics || {
    dragCoefficient: 0.32,
    downforceEfficiency: 100
  };
  
  const enginePerformance = automotiveData?.performance?.enginePerformance || {
    airDensityFactor: 1.0,
    coolingEfficiency: "Optimal",
    estimatedPowerChange: "No change in power"
  };
  
  return (
    <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg border border-gray-800 shadow-xl">
      {/* Weather Station Header with Controls */}
      <div className="p-4 border-b border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h2 className="text-2xl font-orbitron text-blue-400">F1 Motorsport Weather Station</h2>
          <p className="text-gray-400 text-sm mt-1">
            {selectedLocation?.name} • {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex mt-4 lg:mt-0 space-x-4 items-center">
          <div className="flex bg-black rounded-lg overflow-hidden">
            <button 
              className={cn(
                "px-3 py-1.5 text-sm",
                unit === 'metric' ? "bg-blue-600 text-white" : "text-gray-300"
              )}
              onClick={() => setUnit('metric')}
            >
              °C
            </button>
            <button 
              className={cn(
                "px-3 py-1.5 text-sm",
                unit === 'imperial' ? "bg-blue-600 text-white" : "text-gray-300"
              )}
              onClick={() => setUnit('imperial')}
            >
              °F
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className={cn(
                "px-3 py-1.5 text-sm rounded bg-black border",
                showTirePanel ? "border-green-500 text-green-500" : "border-gray-700 text-gray-400"
              )}
              onClick={() => setShowTirePanel(true)}
            >
              Performance
            </button>
            <button 
              className={cn(
                "px-3 py-1.5 text-sm rounded bg-black border",
                !showTirePanel ? "border-green-500 text-green-500" : "border-gray-700 text-gray-400"
              )}
              onClick={() => setShowTirePanel(false)}
            >
              Conditions
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Weather Data */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Conditions Card */}
        <div className="bg-black/30 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between mb-4">
            <h3 className="text-blue-400 font-orbitron text-sm uppercase">Current Conditions</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex items-center mb-6">
            <div className="relative h-16 w-16">
              <img 
                src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`} 
                alt={weatherDesc} 
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="ml-2">
              <div className="text-4xl font-bold text-white">{tempValue}°{displayUnit}</div>
              <div className="text-gray-400 text-sm capitalize">{weatherDesc}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center">
              <Thermometer className="h-4 w-4 text-blue-400 mr-2" />
              <div className="text-gray-300 text-sm">Feels: {feelsLike}°{displayUnit}</div>
            </div>
            <div className="flex items-center">
              <CloudRain className="h-4 w-4 text-blue-400 mr-2" />
              <div className="text-gray-300 text-sm">Rain: {rainChance}%</div>
            </div>
            <div className="flex items-center">
              <Wind className="h-4 w-4 text-blue-400 mr-2" />
              <div className="text-gray-300 text-sm">{windSpeed} {speedUnit}</div>
            </div>
            <div className="flex items-center">
              <Droplets className="h-4 w-4 text-blue-400 mr-2" />
              <div className="text-gray-300 text-sm">Humidity: {humidity}%</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-sm">
            <div className="flex flex-col items-center">
              <Sunrise className="h-4 w-4 text-amber-400 mb-1" />
              <span className="text-gray-300">{format(sunrise, 'h:mm a')}</span>
            </div>
            <div className="flex flex-col items-center">
              <Sunset className="h-4 w-4 text-orange-500 mb-1" />
              <span className="text-gray-300">{format(sunset, 'h:mm a')}</span>
            </div>
          </div>
        </div>
        
        {/* Surface Conditions Card */}
        <div className="bg-black/30 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between mb-4">
            <h3 className="text-blue-400 font-orbitron text-sm uppercase">Track Conditions</h3>
            <Gauge className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-gray-400 text-xs mb-1">Asphalt Surface Temp</div>
              <div className="text-3xl font-bold text-white">
                {surfaceTemp}°{displayUnit}
              </div>
            </div>
            <Badge
              className={cn(
                "text-xs font-semibold py-1",
                automotiveData?.surfaceConditions?.asphalt?.condition === "Dry" 
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : automotiveData?.surfaceConditions?.asphalt?.condition === "Damp"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              )}
            >
              {automotiveData?.surfaceConditions?.asphalt?.condition || "Dry"}
            </Badge>
          </div>
          
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Track Visibility</span>
                <span className={cn(
                  automotiveData?.drivingRisk?.visibility === "Good" 
                    ? "text-green-400" 
                    : automotiveData?.drivingRisk?.visibility === "Moderate"
                    ? "text-yellow-400"
                    : "text-red-400"
                )}>
                  {automotiveData?.drivingRisk?.visibility || "Good"}
                </span>
              </div>
              <Progress 
                value={visibility >= 10 ? 100 : visibility * 10} 
                className={cn(
                  "h-1.5 bg-gray-700",
                  visibility >= 7 ? "text-green-500" : 
                  visibility >= 3 ? "text-yellow-500" : 
                  "text-red-500"
                )}
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Traction</span>
                <span className={cn(
                  automotiveData?.drivingRisk?.traction === "Good" 
                    ? "text-green-400" 
                    : automotiveData?.drivingRisk?.traction === "Reduced"
                    ? "text-yellow-400"
                    : "text-red-400"
                )}>
                  {automotiveData?.drivingRisk?.traction || "Good"}
                </span>
              </div>
              <Progress 
                value={
                  automotiveData?.drivingRisk?.traction === "Good" ? 90 :
                  automotiveData?.drivingRisk?.traction === "Reduced" ? 50 : 20
                } 
                className={cn(
                  "h-1.5 bg-gray-700",
                  automotiveData?.drivingRisk?.traction === "Good" ? "text-green-500" : 
                  automotiveData?.drivingRisk?.traction === "Reduced" ? "text-yellow-500" : 
                  "text-red-500"
                )}
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">UV Index</span>
                <span className={cn(
                  uvIndex <= 2 ? "text-green-400" : 
                  uvIndex <= 5 ? "text-yellow-400" : 
                  uvIndex <= 7 ? "text-orange-400" : 
                  "text-red-400"
                )}>
                  {uvIndex <= 2 ? "Low" : 
                   uvIndex <= 5 ? "Moderate" : 
                   uvIndex <= 7 ? "High" : 
                   uvIndex <= 10 ? "Very High" : "Extreme"}
                </span>
              </div>
              <Progress 
                value={uvIndex * 10} 
                max={100}
                className={cn(
                  "h-1.5 bg-gray-700",
                  uvIndex <= 2 ? "text-green-500" : 
                  uvIndex <= 5 ? "text-yellow-500" : 
                  uvIndex <= 7 ? "text-orange-500" : 
                  "text-red-500"
                )}
              />
            </div>
          </div>
          
          <div className="mt-auto pt-3 border-t border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Overall Driving Risk</div>
            <div className="flex items-center">
              <Badge
                className={cn(
                  "text-xs font-semibold mr-2",
                  automotiveData?.drivingRisk?.overall === "Low" 
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : automotiveData?.drivingRisk?.overall === "Moderate"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                )}
              >
                {automotiveData?.drivingRisk?.overall || "Low"}
              </Badge>
              <span className="text-gray-300 text-sm">
                {automotiveData?.drivingRisk?.score 
                  ? `Risk Score: ${automotiveData.drivingRisk.score}/10`
                  : ''}
              </span>
            </div>
          </div>
        </div>
        
        {/* Conditional Panel - either Performance or Forecast */}
        {showTirePanel ? (
          <div className="bg-black/30 rounded-lg p-4 flex flex-col">
            <div className="flex justify-between mb-4">
              <h3 className="text-blue-400 font-orbitron text-sm uppercase">Performance Metrics</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* Tire Warm-up Time */}
            <div className="mb-4">
              <h4 className="text-white text-sm mb-2">Tire Warm-up Estimates</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Sport Tires</span>
                  <span className="text-white text-xs">{tireWarmupTimes.sport} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Summer Tires</span>
                  <span className="text-white text-xs">{tireWarmupTimes.summer} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">All-Season Tires</span>
                  <span className="text-white text-xs">{tireWarmupTimes.allSeason} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Winter Tires</span>
                  <span className="text-white text-xs">{tireWarmupTimes.winter} min</span>
                </div>
              </div>
            </div>
            
            {/* Tire Pressure Recommendations */}
            <div className="mb-4">
              <h4 className="text-white text-sm mb-2">Recommended Tire Pressure</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-2 rounded">
                  <div className="text-gray-400 text-xs mb-1">Front</div>
                  <div className="text-white text-lg font-medium">{tirePressure.front.optimal} {tirePressure.front.unit}</div>
                  <div className="text-gray-500 text-xs">Range: {tirePressure.front.min}-{tirePressure.front.max}</div>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <div className="text-gray-400 text-xs mb-1">Rear</div>
                  <div className="text-white text-lg font-medium">{tirePressure.rear.optimal} {tirePressure.rear.unit}</div>
                  <div className="text-gray-500 text-xs">Range: {tirePressure.rear.min}-{tirePressure.rear.max}</div>
                </div>
              </div>
            </div>
            
            {/* Torque Application */}
            <div className="mt-auto pt-3 border-t border-gray-800">
              <div className="text-white text-sm mb-1">Torque Setting</div>
              <div className="flex justify-between items-center">
                <div className="text-gray-300 text-xs">{torqueEffect.description}</div>
                <Badge
                  className={cn(
                    "text-xs font-semibold",
                    torqueEffect.percentageAdjustment > 0 
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : torqueEffect.percentageAdjustment === 0
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  )}
                >
                  {torqueEffect.percentageAdjustment > 0 
                    ? `+${torqueEffect.percentageAdjustment}%` 
                    : `${torqueEffect.percentageAdjustment}%`}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-black/30 rounded-lg p-4 flex flex-col">
            <div className="flex justify-between mb-4">
              <h3 className="text-blue-400 font-orbitron text-sm uppercase">Advanced Metrics</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* Engine Performance */}
            <div className="mb-4">
              <h4 className="text-white text-sm mb-2">Engine Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Air Density Factor</span>
                  <span className="text-white text-xs">{enginePerformance.airDensityFactor.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Power Adjustment</span>
                  <span className="text-white text-xs">{enginePerformance.estimatedPowerChange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Cooling Efficiency</span>
                  <span className="text-white text-xs">{enginePerformance.coolingEfficiency}</span>
                </div>
              </div>
            </div>
            
            {/* Aerodynamics */}
            <div className="mb-4">
              <h4 className="text-white text-sm mb-2">Aerodynamics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Drag Coefficient</span>
                  <span className="text-white text-xs">{aerodynamics.dragCoefficient.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Downforce Efficiency</span>
                  <span className="text-white text-xs">{aerodynamics.downforceEfficiency}%</span>
                </div>
              </div>
            </div>
            
            {/* Atmospheric Conditions */}
            <div className="mb-4">
              <h4 className="text-white text-sm mb-2">Atmospheric Conditions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Pressure</span>
                  <span className="text-white text-xs">{pressure} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Visibility</span>
                  <span className="text-white text-xs">{visibility} {unit === 'imperial' ? 'mi' : 'km'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Location Selector */}
      <div className="px-6 pb-6">
        <LocationSelector />
      </div>
      
      {/* Accessibility Live Region - Screen Reader Announcements */}
      <AccessibilityAnnouncement>
        {statusMessage || `Current weather in ${selectedLocation?.name}: ${tempValue}°${displayUnit}, ${weatherDesc}. Surface temperature: ${surfaceTemp}°${displayUnit}.`}
      </AccessibilityAnnouncement>
    </div>
  );
};

export default F1MotorsportWeatherStation;