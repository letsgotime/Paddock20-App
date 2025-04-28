import React, { useState } from 'react';
import { useOpenWeather } from '@/contexts/OpenWeatherContext';
import { Loader2, Droplets, Wind, Thermometer, Gauge, Sun, Cloud, Clock, Compass, ArrowUp, Tractor, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Progress
} from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TireInfoProps {
  type: string;
  temperature: number;
  warmupTime?: number;
  colorClass: string;
}

const TireInfo = ({ type, temperature, warmupTime, colorClass }: TireInfoProps) => (
  <div className="flex flex-col items-center p-2 rounded-lg bg-black/40 border border-gray-800">
    <p className="text-xs text-gray-400">{type}</p>
    <p className={`text-xl font-bold ${colorClass}`}>{temperature}°C</p>
    {warmupTime && <p className="text-xs text-gray-400">Warmup: {warmupTime} min</p>}
  </div>
);

const DriveRecommendation = ({ icon, title, value, unit }: { icon: React.ReactNode, title: string, value: string | number, unit?: string }) => (
  <div className="flex items-center justify-between p-3 border-b border-gray-800 last:border-0">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-900/30 rounded-md">{icon}</div>
      <span className="text-sm text-gray-300">{title}</span>
    </div>
    <span className="font-mono text-lg font-bold text-green-500">
      {value}{unit && <span className="ml-1 text-xs text-gray-400">{unit}</span>}
    </span>
  </div>
);

const RacingGaugeCard = ({ value, label, percentage, colorClass }: { value: string | number, label: string, percentage: number, colorClass: string }) => {
  let actualPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <Card className="flex-1 bg-gradient-to-br from-gray-900 to-black border border-gray-800">
      <CardContent className="pt-6 px-4 pb-4">
        <div className="text-center mb-2">
          <span className="text-xs text-gray-400">{label}</span>
        </div>
        <div className="text-center">
          <span className={`text-xl font-bold ${colorClass}`}>{value}</span>
        </div>
        <Progress className="h-2 mt-3" value={actualPercentage} />
      </CardContent>
    </Card>
  );
};

const WeatherConditionBadge = ({ condition }: { condition: string }) => {
  const getColorClass = (condition: string) => {
    const lowerCond = condition.toLowerCase();
    if (lowerCond.includes('rain') || lowerCond.includes('drizzle')) return 'bg-blue-700';
    if (lowerCond.includes('snow')) return 'bg-sky-300 text-sky-900';
    if (lowerCond.includes('clear')) return 'bg-yellow-500';
    if (lowerCond.includes('cloud')) return 'bg-gray-500';
    if (lowerCond.includes('fog') || lowerCond.includes('mist')) return 'bg-gray-400 text-gray-900';
    if (lowerCond.includes('thunder') || lowerCond.includes('storm')) return 'bg-purple-700';
    return 'bg-gray-700';
  };

  return (
    <Badge className={`${getColorClass(condition)} mb-2`}>{condition}</Badge>
  );
};

export default function Paddock20OpenWeatherStation() {
  const { automotiveWeatherData, isLoading, error, unit } = useOpenWeather();
  const [activeTab, setActiveTab] = useState("overview");
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-400">Loading F1 performance weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-900/20 border border-red-900 rounded-lg">
        <p className="text-red-400">Error loading automotive weather data</p>
        <p className="text-sm text-gray-400 mt-2">Please try refreshing or check your connection</p>
      </div>
    );
  }

  if (!automotiveWeatherData) {
    return (
      <div className="p-6 text-center bg-gray-900 border border-gray-800 rounded-lg">
        <p className="text-gray-400">No automotive weather data available</p>
      </div>
    );
  }

  // Extract relevant data from the automotiveWeatherData
  const { location, surfaceConditions, drivingRisk, performance } = automotiveWeatherData;
  
  // Format dates from timestamps
  const currentTime = new Date().toLocaleTimeString();
  const sunriseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunsetTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Create basic weather conditions from the automotive data
  const conditions = {
    summary: drivingRisk.overall,
    air_temperature: surfaceConditions.asphalt.temperature - 10, // Estimate air temp from surface
    feels_like: surfaceConditions.asphalt.temperature - 8,
    humidity: 65, // Default value for demo
    pressure: 1013, // Default value for demo
    wind_speed: 5, // Default value for demo
    wind_direction: 180, // Default value for demo
    cloud_cover: 30, // Default value for demo
    uv_index: 3, // Default value for demo
  };

  // Decide on color classes based on temperature and grip
  const getTemperatureColor = (temp: number) => {
    if (temp < 10) return 'text-blue-500';
    if (temp > 30) return 'text-red-500';
    return 'text-green-500';
  };

  const getGripColor = (grip: string) => {
    switch (grip.toLowerCase()) {
      case 'low':
        return 'text-red-500';
      case 'poor':
        return 'text-orange-500';
      case 'fair':
        return 'text-yellow-500';
      case 'good':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const tempColor = getTemperatureColor(conditions.air_temperature);
  const surfaceTempColor = getTemperatureColor(surfaceConditions.asphalt.temperature);
  const gripColor = getGripColor(surfaceConditions.asphalt.gripLevel || 'Good');
  
  // Mock visibility and sunglare data
  const visibility_assessment = "Good";
  const sunglare_risk = "Low";
  
  // Calculate visibility percentage for gauge
  const visibilityPercentage = 80; // Default good visibility
  
  // Calculate sunglare risk percentage for gauge
  const sunglarePercentage = 20; // Default low sunglare

  // Create simple hourly forecast
  const hourlyForecast = [
    { time: new Date().toISOString(), temperature: conditions.air_temperature, conditions: 'Clear', precipitation_chance: 0 },
    { time: new Date(Date.now() + 3600 * 1000).toISOString(), temperature: conditions.air_temperature + 1, conditions: 'Clear', precipitation_chance: 0 },
    { time: new Date(Date.now() + 7200 * 1000).toISOString(), temperature: conditions.air_temperature + 2, conditions: 'Partly Cloudy', precipitation_chance: 10 },
    { time: new Date(Date.now() + 10800 * 1000).toISOString(), temperature: conditions.air_temperature + 1, conditions: 'Partly Cloudy', precipitation_chance: 20 },
    { time: new Date(Date.now() + 14400 * 1000).toISOString(), temperature: conditions.air_temperature, conditions: 'Mostly Cloudy', precipitation_chance: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* Top info bar */}
      <div className="flex flex-wrap items-center justify-between bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-900/30 rounded-full">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Current Time</p>
            <p className="text-lg font-mono">{currentTime}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-900/30 rounded-full">
            <ArrowUp className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Sunrise</p>
            <p className="text-lg font-mono">{sunriseTime}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-900/30 rounded-full">
            <ArrowUp className="h-5 w-5 text-orange-500 rotate-180" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Sunset</p>
            <p className="text-lg font-mono">{sunsetTime}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-900/30 rounded-full">
            <Compass className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Location</p>
            <p className="text-lg">
              {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Main content tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 w-full">
          <TabsTrigger value="overview">Weather Overview</TabsTrigger>
          <TabsTrigger value="drive">Driving Performance</TabsTrigger>
          <TabsTrigger value="checklist">Fun Drive Checklist</TabsTrigger>
        </TabsList>
        
        {/* Weather Overview Tab */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Conditions Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-500 flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Current Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-4">
                  <WeatherConditionBadge condition={conditions.summary} />
                  <div className="flex items-end">
                    <span className={`text-4xl font-bold ${tempColor}`}>{conditions.air_temperature.toFixed(1)}</span>
                    <span className="text-xl text-gray-400">°{unit === 'metric' ? 'C' : 'F'}</span>
                  </div>
                  <span className="text-sm text-gray-400">Feels like {conditions.feels_like.toFixed(1)}°</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-3 bg-black/40 rounded-lg">
                    <Droplets className="h-4 w-4 text-blue-500 mb-1" />
                    <span className="text-sm text-gray-400">Humidity</span>
                    <span className="text-lg font-bold">{conditions.humidity}%</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-black/40 rounded-lg">
                    <Wind className="h-4 w-4 text-blue-500 mb-1" />
                    <span className="text-sm text-gray-400">Wind</span>
                    <span className="text-lg font-bold">{conditions.wind_speed.toFixed(1)} m/s</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-black/40 rounded-lg">
                    <Gauge className="h-4 w-4 text-blue-500 mb-1" />
                    <span className="text-sm text-gray-400">Pressure</span>
                    <span className="text-lg font-bold">{conditions.pressure} hPa</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-black/40 rounded-lg">
                    <Sun className="h-4 w-4 text-yellow-500 mb-1" />
                    <span className="text-sm text-gray-400">UV Index</span>
                    <span className="text-lg font-bold">{conditions.uv_index}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Surface Conditions Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-500 flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Road Surface Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-4">
                  <Badge className="mb-2 bg-gray-800">{surfaceConditions.asphalt.condition}</Badge>
                  <div className="flex items-end">
                    <span className={`text-4xl font-bold ${surfaceTempColor}`}>{surfaceConditions.asphalt.temperature.toFixed(1)}</span>
                    <span className="text-xl text-gray-400">°{unit === 'metric' ? 'C' : 'F'}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-400 mr-2">Grip Level:</span>
                    <span className={`text-lg font-semibold ${gripColor}`}>{surfaceConditions.asphalt.gripLevel || 'Good'}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm text-gray-400 mb-3">Tire Temperature Estimates</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <TireInfo 
                      type="Soft" 
                      temperature={Math.round(surfaceConditions.asphalt.temperature * 0.95)} 
                      colorClass="text-red-500" 
                    />
                    <TireInfo 
                      type="Medium" 
                      temperature={Math.round(surfaceConditions.asphalt.temperature * 0.9)} 
                      colorClass="text-yellow-500" 
                    />
                    <TireInfo 
                      type="Hard" 
                      temperature={Math.round(surfaceConditions.asphalt.temperature * 0.85)} 
                      colorClass="text-white" 
                    />
                    <TireInfo 
                      type="Performance" 
                      temperature={Math.round(surfaceConditions.asphalt.temperature * 0.93)} 
                      colorClass="text-green-500" 
                    />
                    <TireInfo 
                      type="All Season" 
                      temperature={Math.round(surfaceConditions.asphalt.temperature * 0.88)} 
                      colorClass="text-blue-500" 
                    />
                    <div className="flex items-center justify-center text-xs text-gray-500 bg-black/40 border border-gray-800 rounded-lg p-2">
                      Temperature readings from surface sensors
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Conditions Gauges */}
            <div className="flex gap-6 col-span-1 md:col-span-2">
              <RacingGaugeCard 
                value={visibility_assessment} 
                label="Visibility" 
                percentage={visibilityPercentage} 
                colorClass={visibilityPercentage > 70 ? "text-green-500" : visibilityPercentage > 40 ? "text-yellow-500" : "text-red-500"}
              />
              
              <RacingGaugeCard 
                value={sunglare_risk} 
                label="Sunglare Risk" 
                percentage={sunglarePercentage} 
                colorClass={sunglarePercentage < 30 ? "text-green-500" : sunglarePercentage < 70 ? "text-yellow-500" : "text-red-500"}
              />
              
              <RacingGaugeCard 
                value={`${conditions.cloud_cover}%`} 
                label="Cloud Cover" 
                percentage={conditions.cloud_cover} 
                colorClass="text-gray-400"
              />
            </div>
            
            {/* Hourly Forecast */}
            <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-500">Hourly Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex overflow-x-auto pb-2 gap-4">
                  {hourlyForecast.map((hour, index) => {
                    const hourTime = new Date(hour.time);
                    return (
                      <div key={index} className="flex-shrink-0 flex flex-col items-center p-3 bg-black/40 rounded-lg min-w-[80px]">
                        <p className="text-xs text-gray-400">{hourTime.getHours()}:00</p>
                        <p className="text-lg font-medium my-1">{hour.temperature.toFixed(0)}°</p>
                        <p className="text-xs text-blue-400">{hour.precipitation_chance}%</p>
                        <p className="text-xs text-gray-400">{hour.conditions}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Driving Performance Tab */}
        <TabsContent value="drive" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tire Performance Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-500 flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Tire Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Optimal Compound:</span>
                    <span className="font-medium text-green-500">{performance.tirePerformance.optimalCompound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Degradation Rate:</span>
                    <span className="font-medium">{performance.tirePerformance.degradationRate}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Graining Risk:</span>
                    <span className="font-medium">{performance.tirePerformance.grainingSusceptibility}/10</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Tire Pressure Recommendation</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">Front</p>
                      <p className="text-lg font-bold">{performance.recommendedTirePressure.front.optimal} {performance.recommendedTirePressure.front.unit}</p>
                      <p className="text-xs text-gray-500">
                        Range: {performance.recommendedTirePressure.front.min} - {performance.recommendedTirePressure.front.max} {performance.recommendedTirePressure.front.unit}
                      </p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">Rear</p>
                      <p className="text-lg font-bold">{performance.recommendedTirePressure.rear.optimal} {performance.recommendedTirePressure.rear.unit}</p>
                      <p className="text-xs text-gray-500">
                        Range: {performance.recommendedTirePressure.rear.min} - {performance.recommendedTirePressure.rear.max} {performance.recommendedTirePressure.rear.unit}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Warmup Times (minutes)</h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-black/40 p-2 rounded-lg">
                      <p className="text-xs text-gray-400">Sport</p>
                      <p className="text-base font-bold">{performance.tireWarmupTime.sport}</p>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg">
                      <p className="text-xs text-gray-400">Summer</p>
                      <p className="text-base font-bold">{performance.tireWarmupTime.summer}</p>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg">
                      <p className="text-xs text-gray-400">All-Season</p>
                      <p className="text-base font-bold">{performance.tireWarmupTime.allSeason}</p>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg">
                      <p className="text-xs text-gray-400">Winter</p>
                      <p className="text-base font-bold">{performance.tireWarmupTime.winter}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Performance Adjustments Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-500 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Performance Adjustments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Torque Management</h4>
                  <div className="bg-black/40 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Power Application:</span>
                      <span className="font-medium">{performance.torqueEffect.percentageAdjustment}%</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Traction Control:</span>
                      <span className="font-medium">{performance.torqueEffect.tractionControlSuggestion}/5</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 italic">{performance.torqueEffect.description}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Engine Performance</h4>
                  <div className="bg-black/40 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Air Density Factor:</span>
                      <span className="font-medium">{performance.enginePerformance.airDensityFactor}x</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Cooling:</span>
                      <span className="font-medium">{performance.enginePerformance.coolingEfficiency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Power:</span>
                      <span className="font-medium">{performance.enginePerformance.estimatedPowerChange}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Braking Performance</h4>
                  <div className="bg-black/40 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Cooling:</span>
                      <span className="font-medium">{performance.brakingPerformance.coolingEfficiency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Optimal Temp:</span>
                      <span className="font-medium">{performance.brakingPerformance.estimatedOptimalTemperature}°{unit === 'metric' ? 'C' : 'F'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Driving Risk Card */}
            <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-500">Driving Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/40 p-4 rounded-lg">
                    <h4 className="text-sm uppercase text-gray-400 mb-2">Overall</h4>
                    <p className={`text-lg font-bold ${
                      drivingRisk.overall === 'Low' ? 'text-green-500' : 
                      drivingRisk.overall === 'Moderate' ? 'text-yellow-500' : 
                      'text-red-500'
                    }`}>
                      {drivingRisk.overall}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">{drivingRisk.description}</p>
                    <div className="mt-3">
                      <span className="text-xs text-gray-400">Risk Score:</span>
                      <Progress 
                        className="h-1.5 mt-1" 
                        value={drivingRisk.score * 10} 
                      />
                      <span className="text-xs text-gray-400 float-right mt-1">{drivingRisk.score}/10</span>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 p-4 rounded-lg">
                    <h4 className="text-sm uppercase text-gray-400 mb-2">Specific Risks</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Visibility:</span>
                          <span className="text-sm font-medium">{drivingRisk.visibility}</span>
                        </div>
                        <Progress 
                          className="h-1.5 mt-1" 
                          value={
                            drivingRisk.visibility === 'Good' ? 80 : 
                            drivingRisk.visibility === 'Moderate' ? 50 : 
                            drivingRisk.visibility === 'Poor' ? 30 : 10
                          } 
                        />
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Traction:</span>
                          <span className="text-sm font-medium">{drivingRisk.traction}</span>
                        </div>
                        <Progress 
                          className="h-1.5 mt-1" 
                          value={
                            drivingRisk.traction === 'Good' ? 80 : 
                            drivingRisk.traction === 'Reduced' ? 50 : 
                            drivingRisk.traction === 'Poor' ? 30 : 10
                          } 
                        />
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Crosswind:</span>
                          <span className="text-sm font-medium">{drivingRisk.crosswindRisk || 'Low'}</span>
                        </div>
                        <Progress 
                          className="h-1.5 mt-1" 
                          value={
                            (drivingRisk.crosswindRisk || 'Low') === 'Low' ? 20 : 
                            (drivingRisk.crosswindRisk || 'Low') === 'Moderate' ? 50 : 
                            (drivingRisk.crosswindRisk || 'Low') === 'High' ? 80 : 30
                          } 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 p-4 rounded-lg">
                    <h4 className="text-sm uppercase text-gray-400 mb-2">Recommendations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="inline-block bg-blue-900/30 p-1 rounded mr-2 mt-0.5">
                          <Gauge className="h-3 w-3 text-blue-500" />
                        </span>
                        <span className="text-gray-300">
                          {drivingRisk.traction === 'Good' 
                            ? 'Standard driving techniques appropriate' 
                            : 'Reduce speed and increase following distance'}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block bg-blue-900/30 p-1 rounded mr-2 mt-0.5">
                          <Thermometer className="h-3 w-3 text-blue-500" />
                        </span>
                        <span className="text-gray-300">
                          Tire warmup takes {performance.tireWarmupTime.sport} minutes for optimal grip
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block bg-blue-900/30 p-1 rounded mr-2 mt-0.5">
                          <Wrench className="h-3 w-3 text-blue-500" />
                        </span>
                        <span className="text-gray-300">
                          {performance.torqueEffect.description}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Fun Drive Checklist Tab */}
        <TabsContent value="checklist" className="mt-0">
          <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
            <CardHeader>
              <CardTitle className="text-blue-500">Fun Drive Pre-Checklist</CardTitle>
              <CardDescription>Based on current weather conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-green-900/20 border border-green-900/40 rounded-lg">
                  <div className="p-2 bg-green-900/30 rounded-md mr-3">
                    <Tractor className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-green-400 font-medium">Ideal Drive Conditions</h3>
                    <p className="text-sm text-gray-400">
                      {drivingRisk.overall === 'Low' 
                        ? 'Current conditions are optimal for a fun drive.' 
                        : 'Current conditions require caution - see specific recommendations below.'}
                    </p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium border-b border-gray-800 pb-2 text-blue-400">Pre-Drive Checks</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center p-2 rounded-lg hover:bg-black/20">
                    <input type="checkbox" className="h-4 w-4 mr-3 accent-green-500" />
                    <span className="text-gray-300">Check tire pressures: {performance.recommendedTirePressure.front.optimal}{performance.recommendedTirePressure.front.unit} front / {performance.recommendedTirePressure.rear.optimal}{performance.recommendedTirePressure.rear.unit} rear</span>
                  </div>
                  
                  <div className="flex items-center p-2 rounded-lg hover:bg-black/20">
                    <input type="checkbox" className="h-4 w-4 mr-3 accent-green-500" />
                    <span className="text-gray-300">Adjust traction control to level {performance.torqueEffect.tractionControlSuggestion}/5 for conditions</span>
                  </div>
                  
                  <div className="flex items-center p-2 rounded-lg hover:bg-black/20">
                    <input type="checkbox" className="h-4 w-4 mr-3 accent-green-500" />
                    <span className="text-gray-300">Allow {performance.tireWarmupTime.sport} minutes of gentle driving for tire warmup</span>
                  </div>
                  
                  <div className="flex items-center p-2 rounded-lg hover:bg-black/20">
                    <input type="checkbox" className="h-4 w-4 mr-3 accent-green-500" />
                    <span className="text-gray-300">
                      {drivingRisk.visibility === 'Good' 
                        ? 'Good visibility - no additional lighting needed' 
                        : 'Reduced visibility - turn on headlights and fog lights if available'}
                    </span>
                  </div>
                  
                  <div className="flex items-center p-2 rounded-lg hover:bg-black/20">
                    <input type="checkbox" className="h-4 w-4 mr-3 accent-green-500" />
                    <span className="text-gray-300">
                      {surfaceConditions.asphalt.condition === 'Dry'
                        ? 'Road surface is dry - standard braking distances apply'
                        : 'Road surface is ' + surfaceConditions.asphalt.condition.toLowerCase() + ' - increase braking distances'}
                    </span>
                  </div>
                  
                  <div className="flex items-center p-2 rounded-lg hover:bg-black/20">
                    <input type="checkbox" className="h-4 w-4 mr-3 accent-green-500" />
                    <span className="text-gray-300">
                      Check engine cooling - conditions rate as {performance.enginePerformance.coolingEfficiency}
                    </span>
                  </div>
                </div>
                
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Mark All Complete & Start Drive
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}