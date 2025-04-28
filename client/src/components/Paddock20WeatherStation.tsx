import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
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

export default function Paddock20WeatherStation() {
  const { automotiveWeatherData, isLoading, error, unit } = useWeather();
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

  const formattedTime = new Date(automotiveWeatherData.current_time).toLocaleTimeString();
  const formattedSunrise = new Date(automotiveWeatherData.sunrise_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedSunset = new Date(automotiveWeatherData.sunset_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const { 
    conditions, 
    automotive_metrics: {
      track_surface,
      tire_temperature_estimates,
      drive_recommendations,
      visibility_assessment,
      sunglare_risk
    }
  } = automotiveWeatherData;

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
      case 'moderate':
        return 'text-yellow-500';
      case 'optimal':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const tempColor = getTemperatureColor(conditions.air_temperature);
  const surfaceTempColor = getTemperatureColor(track_surface.temperature);
  const gripColor = getGripColor(track_surface.grip_level);
  
  // Calculate visibility percentage for gauge
  const visibilityPercentage = (() => {
    switch (visibility_assessment.toLowerCase()) {
      case 'excellent':
        return 100;
      case 'good':
        return 80;
      case 'moderate':
        return 60;
      case 'poor':
        return 40;
      case 'very poor':
        return 20;
      default:
        return 50;
    }
  })();

  // Calculate sunglare risk percentage for gauge
  const sunglarePercentage = (() => {
    switch (sunglare_risk.toLowerCase()) {
      case 'none':
      case 'low':
        return 20;
      case 'moderate':
        return 60;
      case 'high':
        return 85;
      case 'extreme':
        return 100;
      default:
        return 0;
    }
  })();

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
            <p className="text-lg font-mono">{formattedTime}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-900/30 rounded-full">
            <ArrowUp className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Sunrise</p>
            <p className="text-lg font-mono">{formattedSunrise}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-900/30 rounded-full">
            <ArrowUp className="h-5 w-5 text-orange-500 rotate-180" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Sunset</p>
            <p className="text-lg font-mono">{formattedSunset}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-900/30 rounded-full">
            <Compass className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Location</p>
            <p className="text-lg">
              {automotiveWeatherData.location.lat.toFixed(2)}, {automotiveWeatherData.location.lon.toFixed(2)}
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
                  <Badge className="mb-2 bg-gray-800">{track_surface.condition}</Badge>
                  <div className="flex items-end">
                    <span className={`text-4xl font-bold ${surfaceTempColor}`}>{track_surface.temperature.toFixed(1)}</span>
                    <span className="text-xl text-gray-400">°{unit === 'metric' ? 'C' : 'F'}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-400 mr-2">Grip Level:</span>
                    <span className={`text-lg font-semibold ${gripColor}`}>{track_surface.grip_level}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm text-gray-400 mb-3">Tire Temperature Estimates</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <TireInfo 
                      type="Soft" 
                      temperature={tire_temperature_estimates.soft_compound} 
                      colorClass="text-red-500" 
                    />
                    <TireInfo 
                      type="Medium" 
                      temperature={tire_temperature_estimates.medium_compound} 
                      colorClass="text-yellow-500" 
                    />
                    <TireInfo 
                      type="Hard" 
                      temperature={tire_temperature_estimates.hard_compound} 
                      colorClass="text-white" 
                    />
                    <TireInfo 
                      type="Performance" 
                      temperature={tire_temperature_estimates.street_performance} 
                      colorClass="text-green-500" 
                    />
                    <TireInfo 
                      type="All Season" 
                      temperature={tire_temperature_estimates.all_season} 
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
                  {automotiveWeatherData.hourly_forecast.map((hour, index) => {
                    const hourTime = new Date(hour.time);
                    return (
                      <div key={index} className="flex-shrink-0 flex flex-col items-center p-3 bg-black/40 rounded-lg min-w-[90px]">
                        <span className="text-xs text-gray-400">
                          {hourTime.getHours()}:00
                        </span>
                        <span className="text-sm my-1">
                          {hour.conditions}
                        </span>
                        <span className="text-lg font-bold">
                          {hour.temperature.toFixed(1)}°
                        </span>
                        <span className="text-xs text-blue-400 mt-1">
                          {hour.precipitation_chance > 0 ? `${(hour.precipitation_chance * 100).toFixed(0)}%` : '—'}
                        </span>
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
              <CardHeader>
                <CardTitle className="text-blue-500">Tire Performance</CardTitle>
                <CardDescription>Estimated warmup times for optimal performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <TireInfo 
                    type="Performance" 
                    temperature={tire_temperature_estimates.street_performance} 
                    warmupTime={drive_recommendations.tire_warmup_minutes.performance}
                    colorClass="text-red-500" 
                  />
                  <TireInfo 
                    type="Street" 
                    temperature={tire_temperature_estimates.soft_compound} 
                    warmupTime={drive_recommendations.tire_warmup_minutes.street}
                    colorClass="text-yellow-500" 
                  />
                  <TireInfo 
                    type="All Season" 
                    temperature={tire_temperature_estimates.all_season} 
                    warmupTime={drive_recommendations.tire_warmup_minutes.all_season}
                    colorClass="text-blue-500" 
                  />
                </div>
                
                <div className="mt-6 bg-black/40 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-500 mb-2">Surface Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Surface Type:</span>
                      <span className="text-sm font-semibold">{track_surface.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Surface Temperature:</span>
                      <span className={`text-sm font-semibold ${surfaceTempColor}`}>{track_surface.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Grip Level:</span>
                      <span className={`text-sm font-semibold ${gripColor}`}>{track_surface.grip_level}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Performance Adjustments Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <CardHeader>
                <CardTitle className="text-blue-500">Performance Adjustments</CardTitle>
                <CardDescription>Recommendations based on current conditions</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <DriveRecommendation 
                  icon={<Gauge className="h-4 w-4 text-blue-500" />}
                  title="Torque Management"
                  value={`${drive_recommendations.torque_management.recommended_percentage}`}
                  unit="%"
                />
                <DriveRecommendation 
                  icon={<Tractor className="h-4 w-4 text-blue-500" />}
                  title="Traction Control"
                  value={drive_recommendations.torque_management.traction_control}
                />
                <DriveRecommendation 
                  icon={<Wrench className="h-4 w-4 text-blue-500" />}
                  title="Tire Pressure Adjustment"
                  value={drive_recommendations.tire_pressure_adjustment > 0 
                    ? `+${drive_recommendations.tire_pressure_adjustment.toFixed(1)}` 
                    : drive_recommendations.tire_pressure_adjustment.toFixed(1)}
                  unit="PSI"
                />
                <DriveRecommendation 
                  icon={<Thermometer className="h-4 w-4 text-blue-500" />}
                  title="Braking Points"
                  value={drive_recommendations.braking_points}
                />
              </CardContent>
              <CardFooter className="text-xs text-gray-500 italic">
                *Recommendations based on current surface conditions and weather
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Fun Drive Checklist Tab */}
        <TabsContent value="checklist" className="mt-0">
          <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
            <CardHeader>
              <CardTitle className="text-green-500">Paddock20™ Fun Drive Checklist</CardTitle>
              <CardDescription>Optimize your driving experience based on current conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Vehicle Setup Section */}
                <div>
                  <h3 className="text-md font-semibold text-blue-500 mb-3">Vehicle Setup</h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 rounded-lg bg-black/40 border border-gray-800">
                      <div className="mr-3 p-2 bg-green-900/30 rounded-full">
                        <Gauge className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">Torque Management</p>
                        <p className="text-sm text-gray-400">Set to {drive_recommendations.torque_management.recommended_percentage}% for optimal traction in current conditions</p>
                      </div>
                      <div className="ml-4">
                        <Button variant="outline" size="sm" className="border-green-800 text-green-500 hover:bg-green-900/30">
                          Adjust
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-black/40 border border-gray-800">
                      <div className="mr-3 p-2 bg-green-900/30 rounded-full">
                        <Wrench className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">Tire Pressure</p>
                        <p className="text-sm text-gray-400">
                          {drive_recommendations.tire_pressure_adjustment > 0 
                            ? `Increase by ${drive_recommendations.tire_pressure_adjustment.toFixed(1)} PSI for current surface temp` 
                            : drive_recommendations.tire_pressure_adjustment < 0
                              ? `Decrease by ${Math.abs(drive_recommendations.tire_pressure_adjustment).toFixed(1)} PSI for current surface temp`
                              : `Maintain standard tire pressure for optimal grip`}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Button variant="outline" size="sm" className="border-green-800 text-green-500 hover:bg-green-900/30">
                          Adjust
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-black/40 border border-gray-800">
                      <div className="mr-3 p-2 bg-green-900/30 rounded-full">
                        <Thermometer className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">Warm-up Time</p>
                        <p className="text-sm text-gray-400">
                          Allow {drive_recommendations.tire_warmup_minutes.performance} minutes for performance tires to reach optimal temperature
                        </p>
                      </div>
                      <div className="ml-4">
                        <Button variant="outline" size="sm" className="border-green-800 text-green-500 hover:bg-green-900/30">
                          Set Timer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Driving Notes Section */}
                <div>
                  <h3 className="text-md font-semibold text-blue-500 mb-3">Driving Notes</h3>
                  <div className="p-4 rounded-lg bg-black/40 border border-gray-800">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="p-1 bg-blue-900/30 rounded-full mr-2 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        </div>
                        <span className="text-sm">
                          Surface temperature is <span className={surfaceTempColor}>{track_surface.temperature.toFixed(1)}°C</span> with <span className={gripColor}>{track_surface.grip_level}</span> grip
                        </span>
                      </li>
                      
                      <li className="flex items-start">
                        <div className="p-1 bg-blue-900/30 rounded-full mr-2 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        </div>
                        <span className="text-sm">
                          Braking points should be {drive_recommendations.braking_points.toLowerCase()} due to current grip conditions
                        </span>
                      </li>
                      
                      <li className="flex items-start">
                        <div className="p-1 bg-blue-900/30 rounded-full mr-2 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        </div>
                        <span className="text-sm">
                          Visibility assessment: <span className={visibilityPercentage > 70 ? "text-green-500" : visibilityPercentage > 40 ? "text-yellow-500" : "text-red-500"}>
                            {visibility_assessment}
                          </span>
                        </span>
                      </li>
                      
                      <li className="flex items-start">
                        <div className="p-1 bg-blue-900/30 rounded-full mr-2 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        </div>
                        <span className="text-sm">
                          Sunglare risk: <span className={sunglarePercentage < 30 ? "text-green-500" : sunglarePercentage < 70 ? "text-yellow-500" : "text-red-500"}>
                            {sunglare_risk}
                          </span>
                        </span>
                      </li>
                      
                      {track_surface.condition !== "Dry" && (
                        <li className="flex items-start">
                          <div className="p-1 bg-red-900/30 rounded-full mr-2 mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          </div>
                          <span className="text-sm text-red-400">
                            {track_surface.condition} surface detected - adjust driving style accordingly
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="pt-4 flex justify-center">
                  <Button className="bg-green-700 hover:bg-green-600 text-white">
                    Save to Drive Journal
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between text-xs text-gray-500">
              <span>Updated: {formattedTime}</span>
              <span>Paddock20™ Advanced Motorsport Analytics</span>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}