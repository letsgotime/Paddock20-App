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
  ArrowUp,
  ArrowDown,
  Car,
  AlertCircle,
  RefreshCw,
  Map,
  Clock,
  CloudRain
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import LocationSelector from './LocationSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AutomotiveWeatherData } from '@/services/openWeatherService';

const AutoEnthusiastWeatherStation: React.FC = () => {
  const { 
    weatherData, 
    oneCallData, 
    forecastData,
    selectedLocation, 
    unit, 
    setUnit, 
    isLoading, 
    error,
    refreshWeather 
  } = useWeather();
  
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');
  const [focusCategory, setFocusCategory] = useState<'driving' | 'detailing' | 'performance'>('driving');
  
  // Update the current time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[500px] rounded-xl bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-gray-800 p-6 flex flex-col items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <h3 className="text-xl font-orbitron text-blue-400 mb-2">Loading Weather Data</h3>
        <p className="text-gray-400">Fetching the latest automotive weather information...</p>
      </div>
    );
  }
  
  if (error || !weatherData || !oneCallData) {
    return (
      <div className="min-h-[400px] rounded-xl bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-gray-800 p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-orbitron text-blue-400 mb-2">Weather Data Unavailable</h3>
          <p className="text-gray-400 mb-6">
            {error?.message || "Unable to load weather information. Please try again later."}
          </p>
          <button 
            onClick={refreshWeather}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
        <div className="mt-8">
          <LocationSelector />
        </div>
      </div>
    );
  }

  // Extract data from weather responses
  const temp = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const description = weatherData.weather[0]?.description || 'Unknown';
  const icon = weatherData.weather[0]?.icon || '01d';
  const windSpeed = Math.round(weatherData.wind.speed);
  const windDirection = weatherData.wind.deg;
  const humidity = weatherData.main.humidity;
  const pressure = weatherData.main.pressure;
  const visibility = Math.round(weatherData.visibility / 1000);
  
  // OneCall specific data
  const sunrise = new Date(oneCallData.current.sunrise * 1000);
  const sunset = new Date(oneCallData.current.sunset * 1000);
  const uvIndex = oneCallData.current.uvi;
  const daily = oneCallData.daily?.slice(0, 7) || [];
  const hourly = oneCallData.hourly?.slice(0, 24) || [];
  const precipChance = hourly[0]?.pop ? Math.round(hourly[0].pop * 100) : 0;
  
  // Get the automotive data
  const autoData = oneCallData.automotiveData as AutomotiveWeatherData;
  
  // Calculate surface temperature
  const airTemp = weatherData.main.temp;
  const isDaytime = currentTime.getHours() > 6 && currentTime.getHours() < 20;
  const cloudCover = weatherData.clouds?.all || 0;
  
  // Calculate surface temperature based on air temperature, time of day, and cloud cover
  const cloudEffect = 1 - (cloudCover / 100);
  const timeEffect = isDaytime ? 1 : 0.2;
  const asphaltFactor = 25; // Asphalt can be 20-30°F warmer than air at peak sun
  
  const surfaceTemp = Math.round(airTemp + (asphaltFactor * cloudEffect * timeEffect));
  const concreteTemp = Math.round(airTemp + (15 * cloudEffect * timeEffect));
  
  // Determine best drive time based on weather conditions
  const currentHour = currentTime.getHours();
  let bestDriveTime = { hour: currentHour, score: 5 };
  
  hourly.forEach((hour, index) => {
    const hourTimestamp = new Date(hour.dt * 1000);
    const hourNum = hourTimestamp.getHours();
    
    // Skip night hours (unless it's already night)
    if ((hourNum < 6 || hourNum > 20) && currentHour >= 6 && currentHour <= 20) {
      return;
    }
    
    let score = 10;
    
    // Penalize for precipitation
    score -= (hour.pop || 0) * 5;
    
    // Penalize for extreme temperatures
    const hourTemp = hour.temp;
    if (hourTemp < 40) score -= 2;
    if (hourTemp > 90) score -= 2;
    
    // Penalize for high winds
    if (hour.wind_speed > 15) score -= 2;
    
    // Find best time
    if (score > bestDriveTime.score) {
      bestDriveTime = { hour: hourNum, score };
    }
  });
  
  const formatHour = (hour: number) => {
    return `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'AM' : 'PM'}`;
  };

  const displayUnit = unit === 'imperial' ? 'F' : 'C';
  const speedUnit = unit === 'imperial' ? 'mph' : 'm/s';
  
  // Temperature color based on value
  const getTempColor = (temp: number) => {
    if (unit === 'imperial') {
      if (temp < 32) return 'text-blue-400';
      if (temp < 50) return 'text-cyan-400';
      if (temp < 70) return 'text-green-400';
      if (temp < 85) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (temp < 0) return 'text-blue-400';
      if (temp < 10) return 'text-cyan-400';
      if (temp < 21) return 'text-green-400';
      if (temp < 29) return 'text-yellow-400';
      return 'text-red-400';
    }
  };
  
  // Get wind direction as arrow
  const getWindDirectionArrow = (degrees: number) => {
    return `rotate-${Math.round(degrees / 45) * 45}`;
  };
  
  // Format day of week
  const getDayOfWeek = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Extract tire data
  const tireWarmupTimes = autoData?.performance?.tireWarmupTime || {
    sport: 3,
    summer: 4,
    allSeason: 5,
    winter: 8
  };
  
  const tirePressure = autoData?.performance?.recommendedTirePressure || {
    front: { min: 29, optimal: 32, max: 35, unit: 'PSI' },
    rear: { min: 27, optimal: 30, max: 33, unit: 'PSI' }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-orbitron text-blue-400 tracking-tight">
              🏁 Auto Enthusiast Weather Center
            </h1>
            <p className="text-gray-400">
              {format(currentTime, 'EEEE, MMMM d, yyyy')} • {selectedLocation?.name}
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-wrap gap-4">
            <div className="flex bg-gray-900 rounded-lg overflow-hidden">
              <button 
                className={cn(
                  "px-4 py-2",
                  unit === 'metric' ? "bg-blue-600 text-white" : "text-gray-300"
                )}
                onClick={() => setUnit('metric')}
              >
                °C
              </button>
              <button 
                className={cn(
                  "px-4 py-2",
                  unit === 'imperial' ? "bg-blue-600 text-white" : "text-gray-300"
                )}
                onClick={() => setUnit('imperial')}
              >
                °F
              </button>
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-900 rounded-lg px-3 py-2">
              <Label htmlFor="view-mode" className="text-sm text-gray-400">Advanced View</Label>
              <Switch 
                id="view-mode" 
                checked={viewMode === 'advanced'} 
                onCheckedChange={(checked) => setViewMode(checked ? 'advanced' : 'basic')}
              />
            </div>
            
            <button 
              onClick={refreshWeather}
              className="px-3 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <LocationSelector />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Current Conditions Panel */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl border border-gray-800 p-5">
            <div className="flex items-center mb-4">
              <img 
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`} 
                alt={description} 
                className="w-20 h-20 mr-2"
              />
              <div>
                <h2 className={cn("text-5xl font-semibold", getTempColor(temp))}>
                  {temp}°{displayUnit}
                </h2>
                <p className="text-gray-300 capitalize">{description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <div className="flex items-center text-gray-400 text-sm mb-1">
                  <Thermometer className="h-3 w-3 mr-1" />
                  <span>Feels Like</span>
                </div>
                <p className="text-white text-xl">{feelsLike}°{displayUnit}</p>
              </div>
              
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <div className="flex items-center text-gray-400 text-sm mb-1">
                  <CloudRain className="h-3 w-3 mr-1" />
                  <span>Chance of Rain</span>
                </div>
                <p className="text-white text-xl">{precipChance}%</p>
              </div>
              
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <div className="flex items-center text-gray-400 text-sm mb-1">
                  <Wind className="h-3 w-3 mr-1" />
                  <span>Wind</span>
                </div>
                <div className="flex items-center">
                  <p className="text-white text-xl">{windSpeed} {speedUnit}</p>
                  <div className={cn("ml-2 text-gray-400", `rotate-[${windDirection}deg]`)}>
                    <ArrowUp className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <div className="flex items-center text-gray-400 text-sm mb-1">
                  <Droplets className="h-3 w-3 mr-1" />
                  <span>Humidity</span>
                </div>
                <p className="text-white text-xl">{humidity}%</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-black/30 p-3 rounded border border-gray-800">
              <div className="text-center">
                <Sunrise className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                <p className="text-white">{format(sunrise, 'h:mm a')}</p>
              </div>
              
              <div className="text-center">
                <Sunset className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <p className="text-white">{format(sunset, 'h:mm a')}</p>
              </div>
            </div>
            
            {/* Best Drive Time Panel */}
            <div className="mt-5 bg-green-900/20 p-4 rounded-lg border border-green-900/30">
              <h3 className="text-green-400 font-medium flex items-center">
                <Car className="h-4 w-4 mr-2" />
                Best Driving Time Today
              </h3>
              <div className="flex justify-between items-center mt-2">
                <div className="text-3xl font-bold text-white">{formatHour(bestDriveTime.hour)}</div>
                <div className="bg-green-900/50 px-3 py-1 rounded text-sm text-green-300">
                  Optimal Conditions
                </div>
              </div>
            </div>
          </div>
          
          {/* Surface Conditions Panel */}
          <div className="lg:col-span-4 flex flex-col bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl border border-gray-800 p-5">
            <h2 className="text-xl font-orbitron text-blue-400 mb-4">Surface Conditions</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <p className="text-gray-400 text-sm">Asphalt</p>
                <p className="text-white text-2xl">{surfaceTemp}°{displayUnit}</p>
                <Badge 
                  className={cn(
                    "mt-1",
                    surfaceTemp > (unit === 'imperial' ? 100 : 38) ? "bg-red-900/20 text-red-400 border-red-900/30" :
                    surfaceTemp > (unit === 'imperial' ? 80 : 27) ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/30" :
                    "bg-green-900/20 text-green-400 border-green-900/30"
                  )}
                >
                  {surfaceTemp > (unit === 'imperial' ? 100 : 38) ? "Hot" :
                   surfaceTemp > (unit === 'imperial' ? 80 : 27) ? "Warm" : "Cool"}
                </Badge>
              </div>
              
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <p className="text-gray-400 text-sm">Concrete</p>
                <p className="text-white text-2xl">{concreteTemp}°{displayUnit}</p>
                <Badge 
                  className={cn(
                    "mt-1",
                    concreteTemp > (unit === 'imperial' ? 95 : 35) ? "bg-red-900/20 text-red-400 border-red-900/30" :
                    concreteTemp > (unit === 'imperial' ? 75 : 24) ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/30" :
                    "bg-green-900/20 text-green-400 border-green-900/30"
                  )}
                >
                  {concreteTemp > (unit === 'imperial' ? 95 : 35) ? "Hot" :
                   concreteTemp > (unit === 'imperial' ? 75 : 24) ? "Warm" : "Cool"}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4 flex-grow">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 text-sm">Track Grip</span>
                  <span className="text-gray-300 text-sm">
                    {autoData?.surfaceConditions?.racingSurface?.idealLine || "Good"}
                  </span>
                </div>
                <Progress 
                  value={autoData?.drivingRisk?.score ? 100 - (autoData.drivingRisk.score * 10) : 75} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 text-sm">UV Index</span>
                  <span className="text-gray-300 text-sm">
                    {uvIndex > 7 ? "High" : uvIndex > 3 ? "Moderate" : "Low"}
                  </span>
                </div>
                <Progress 
                  value={uvIndex * 10} 
                  max={120}
                  className={cn(
                    "h-2",
                    uvIndex > 7 ? "text-red-500" : 
                    uvIndex > 3 ? "text-yellow-500" : 
                    "text-green-500"
                  )}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 text-sm">Visibility</span>
                  <span className="text-gray-300 text-sm">
                    {visibility > 9 ? "Excellent" : visibility > 5 ? "Good" : visibility > 2 ? "Moderate" : "Poor"}
                  </span>
                </div>
                <Progress 
                  value={visibility * 10 > 100 ? 100 : visibility * 10} 
                  className={cn(
                    "h-2",
                    visibility > 9 ? "text-green-500" : 
                    visibility > 5 ? "text-green-500" : 
                    visibility > 2 ? "text-yellow-500" : 
                    "text-red-500"
                  )}
                />
              </div>
            </div>
            
            <div className="mt-5 bg-black/30 p-3 rounded-lg border border-gray-800">
              <h3 className="text-gray-300 text-sm mb-2">Driving Risk Assessment</h3>
              <div className="flex items-center">
                <Badge
                  className={cn(
                    "mr-3",
                    autoData?.drivingRisk?.overall === "Low" ? "bg-green-900/20 text-green-400 border-green-900/30" :
                    autoData?.drivingRisk?.overall === "Moderate" ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/30" :
                    "bg-red-900/20 text-red-400 border-red-900/30"
                  )}
                >
                  {autoData?.drivingRisk?.overall || "Low"}
                </Badge>
                {autoData?.drivingRisk?.description && (
                  <span className="text-gray-400 text-sm">{autoData.drivingRisk.description}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Performance Metrics Panel */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl border border-gray-800 p-5">
            <Tabs defaultValue="tires" className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-orbitron text-blue-400">Performance Metrics</h2>
                <TabsList className="bg-black/30">
                  <TabsTrigger value="tires" className="data-[state=active]:bg-blue-600">Tires</TabsTrigger>
                  <TabsTrigger value="driving" className="data-[state=active]:bg-blue-600">Driving</TabsTrigger>
                  {viewMode === 'advanced' && (
                    <TabsTrigger value="engine" className="data-[state=active]:bg-blue-600">Engine</TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              <TabsContent value="tires" className="flex-grow flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-black/30 p-3 rounded border border-gray-800">
                    <p className="text-gray-400 text-sm">Tire Warmup Time</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Sport</span>
                        <span className="text-white font-medium">{tireWarmupTimes.sport} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Summer</span>
                        <span className="text-white font-medium">{tireWarmupTimes.summer} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">All Season</span>
                        <span className="text-white font-medium">{tireWarmupTimes.allSeason} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Winter</span>
                        <span className="text-white font-medium">{tireWarmupTimes.winter} mins</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded border border-gray-800">
                    <p className="text-gray-400 text-sm">Optimal Tire Pressure</p>
                    <div className="mt-2 space-y-3">
                      <div>
                        <div className="flex justify-between">
                          <span className="text-gray-300 text-sm">Front</span>
                          <span className="text-white font-medium">{tirePressure.front.optimal} {tirePressure.front.unit}</span>
                        </div>
                        <div className="flex text-xs text-gray-500 mt-1 justify-between">
                          <span>{tirePressure.front.min} {tirePressure.front.unit}</span>
                          <span>{tirePressure.front.max} {tirePressure.front.unit}</span>
                        </div>
                        <Progress 
                          value={((tirePressure.front.optimal - tirePressure.front.min) / (tirePressure.front.max - tirePressure.front.min)) * 100} 
                          className="h-1 mt-1"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between">
                          <span className="text-gray-300 text-sm">Rear</span>
                          <span className="text-white font-medium">{tirePressure.rear.optimal} {tirePressure.rear.unit}</span>
                        </div>
                        <div className="flex text-xs text-gray-500 mt-1 justify-between">
                          <span>{tirePressure.rear.min} {tirePressure.rear.unit}</span>
                          <span>{tirePressure.rear.max} {tirePressure.rear.unit}</span>
                        </div>
                        <Progress 
                          value={((tirePressure.rear.optimal - tirePressure.rear.min) / (tirePressure.rear.max - tirePressure.rear.min)) * 100} 
                          className="h-1 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded border border-gray-800 mt-auto">
                  <p className="text-gray-400 text-sm mb-2">Tire Performance Analysis</p>
                  <p className="text-white text-sm">
                    {autoData?.performance?.tirePerformance?.optimalCompound 
                      ? `Recommended: ${autoData.performance.tirePerformance.optimalCompound}`
                      : 'Standard summer or all-season compounds recommended for these conditions.'
                    }
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="driving" className="flex-grow flex flex-col">
                <div className="bg-black/30 p-3 rounded border border-gray-800">
                  <p className="text-gray-400 text-sm">Torque Management</p>
                  <p className="text-xl text-white mt-1">
                    {autoData?.performance?.torqueEffect?.percentageAdjustment 
                      ? `${autoData.performance.torqueEffect.percentageAdjustment > 0 ? '+' : ''}${autoData.performance.torqueEffect.percentageAdjustment}%`
                      : "Standard"
                    }
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    {autoData?.performance?.torqueEffect?.description || "Standard torque application recommended."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="bg-black/30 p-3 rounded border border-gray-800">
                    <p className="text-gray-400 text-sm">Corner Exit</p>
                    <p className="text-white font-medium mt-1">
                      {autoData?.performance?.torqueEffect?.cornerExitRecommendation || "Progressive"}
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded border border-gray-800">
                    <p className="text-gray-400 text-sm">Traction Control</p>
                    <p className="text-white font-medium mt-1">
                      Level {autoData?.performance?.torqueEffect?.tractionControlSuggestion !== undefined 
                        ? autoData.performance.torqueEffect.tractionControlSuggestion 
                        : "2"}
                    </p>
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded border border-gray-800 mt-auto">
                  <p className="text-gray-400 text-sm mb-2">Track Guidance</p>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-gray-300">Racing Line:</p>
                      <p className="text-white font-medium">
                        {autoData?.performance?.trackSpecificGuidance?.raceLine?.traditional || "Traditional"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300">Apex Grip:</p>
                      <p className="text-white font-medium">
                        {autoData?.performance?.trackSpecificGuidance?.grip?.apexGrip || 7}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300">Exit Grip:</p>
                      <p className="text-white font-medium">
                        {autoData?.performance?.trackSpecificGuidance?.grip?.exitGrip || 6}/10
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {viewMode === 'advanced' && (
                <TabsContent value="engine" className="flex-grow flex flex-col">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/30 p-3 rounded border border-gray-800">
                      <p className="text-gray-400 text-sm">Air Density Factor</p>
                      <p className="text-xl text-white mt-1">
                        {autoData?.performance?.enginePerformance?.airDensityFactor?.toFixed(2) || "1.00"}x
                      </p>
                    </div>
                    
                    <div className="bg-black/30 p-3 rounded border border-gray-800">
                      <p className="text-gray-400 text-sm">Power Change</p>
                      <p className="text-xl text-white mt-1">
                        {autoData?.performance?.enginePerformance?.estimatedPowerChange || "Neutral"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded border border-gray-800">
                    <p className="text-gray-400 text-sm mb-2">Engine Parameters</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Intake Temp:</span>
                        <span className="text-white font-medium">
                          {autoData?.performance?.enginePerformance?.airIntakeTemperature || Math.round(temp * 0.85)}°{displayUnit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Turbo Efficiency:</span>
                        <span className="text-white font-medium">
                          {autoData?.performance?.enginePerformance?.turboEfficiency || "98"}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Cooling:</span>
                        <span className="text-white font-medium">
                          {autoData?.performance?.enginePerformance?.coolingEfficiency || "Optimal"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Shift Points:</span>
                        <span className="text-white font-medium">
                          {autoData?.performance?.enginePerformance?.optimalShiftPoints?.increase 
                            ? `+${autoData.performance.enginePerformance.optimalShiftPoints.increase}%`
                            : "Standard"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded border border-gray-800 mt-auto">
                    <p className="text-gray-400 text-sm mb-2">Braking Performance</p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-300">Cooling:</p>
                        <p className="text-white font-medium">
                          {autoData?.performance?.brakingPerformance?.coolingEfficiency || "Good"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Optimal Temp:</p>
                        <p className="text-white font-medium">
                          {autoData?.performance?.brakingPerformance?.estimatedOptimalTemperature || 450}°{displayUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Adjustment:</p>
                        <p className="text-white font-medium">
                          {autoData?.performance?.brakingPerformance?.brakingPointAdjustment 
                            ? `${autoData.performance.brakingPerformance.brakingPointAdjustment > 0 ? '+' : ''}${autoData.performance.brakingPerformance.brakingPointAdjustment}m`
                            : "Standard"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
          
          {/* Forecast Row */}
          <div className="lg:col-span-12 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl border border-gray-800 p-5">
            <h2 className="text-xl font-orbitron text-blue-400 mb-4">7-Day Forecast</h2>
            <div className="flex overflow-x-auto pb-2 space-x-4">
              {daily.map((day, i) => (
                <div key={i} className="min-w-[100px] text-center">
                  <p className="text-gray-300">{i === 0 ? 'Today' : getDayOfWeek(day.dt)}</p>
                  <img 
                    src={`https://openweathermap.org/img/wn/${day.weather[0]?.icon}.png`}
                    alt={day.weather[0]?.description || 'weather'} 
                    className="w-12 h-12 mx-auto"
                  />
                  <div className="flex justify-center space-x-2 text-sm">
                    <span className="text-white">{Math.round(day.temp.max)}°</span>
                    <span className="text-gray-400">{Math.round(day.temp.min)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-8 text-sm text-gray-500 border-t border-gray-800 pt-4 flex flex-col md:flex-row justify-between">
          <div>
            <p>Powered by OpenWeatherMap API</p>
            <p>Enhanced automotive performance metrics by Paddock20</p>
          </div>
          <div className="mt-2 md:mt-0">
            <p>Last updated: {format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AutoEnthusiastWeatherStation;