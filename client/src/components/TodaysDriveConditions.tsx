import React from 'react';
import { useOpenWeather } from '@/contexts/OpenWeatherContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Check, Droplets, Thermometer, Wind, CloudRain, Gauge, Wrench, Trophy, Clock } from 'lucide-react';

/**
 * TodaysDriveConditions Component
 * Displays automotive-focused weather data for optimal driving experience
 * Uses F1-style metrics to provide surface temperatures, grip levels, and performance recommendations
 */
export function TodaysDriveConditions() {
  const { 
    automotiveWeatherData, 
    isLoading, 
    error, 
    selectedLocation,
    unit
  } = useOpenWeather();

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="w-full bg-black/90 border border-zinc-800 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-orbitron text-blue-500">Today's Drive Conditions</CardTitle>
          <CardDescription>Loading drive condition data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-28 bg-zinc-800" />
            <Skeleton className="h-28 bg-zinc-800" />
            <Skeleton className="h-28 bg-zinc-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error || !automotiveWeatherData) {
    return (
      <Card className="w-full bg-black/90 border border-zinc-800 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-orbitron text-blue-500">Today's Drive Conditions</CardTitle>
          <CardDescription className="text-red-400">
            <AlertTriangle className="inline-block mr-2 h-4 w-4" />
            Failed to load automotive weather data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">
            Unable to retrieve F1-style driving conditions. Please try again later or select a different location.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Extract relevant data from automotiveWeatherData
  const { 
    surfaceConditions, 
    drivingRisk, 
    performance
  } = automotiveWeatherData;

  // Format temperature based on unit system
  const formatTemperature = (temp: number) => {
    if (unit === 'imperial') {
      // Convert to Fahrenheit
      const fahrenheit = Math.round((temp * 9/5) + 32);
      return `${fahrenheit}°F`;
    }
    return `${Math.round(temp)}°C`;
  };

  // Get background color class based on risk level
  const getRiskColorClass = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'bg-green-500/20 text-green-400';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'extreme':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  // Get status badge color class based on value
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good':
      case 'optimal':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'fair':
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'poor':
      case 'reduced':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'low':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  // Get compound recommendation colors
  const getCompoundColor = (compound: string) => {
    switch (compound.toLowerCase()) {
      case 'summer':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'all season':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'winter':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'wet':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50';
    }
  };

  return (
    <Card className="w-full bg-black/90 border border-zinc-800 shadow-xl text-white">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-orbitron text-blue-500">Today's Drive Conditions</CardTitle>
            <CardDescription>
              {selectedLocation?.name} - F1-Style Automotive Weather Analytics
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`font-semibold ${getRiskColorClass(drivingRisk.overall)}`}
          >
            {drivingRisk.overall} Risk
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="surface" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 bg-zinc-900">
            <TabsTrigger value="surface" className="font-orbitron">Surface</TabsTrigger>
            <TabsTrigger value="performance" className="font-orbitron">Performance</TabsTrigger>
            <TabsTrigger value="settings" className="font-orbitron">Settings</TabsTrigger>
          </TabsList>
          
          {/* Surface Conditions Tab */}
          <TabsContent value="surface" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Asphalt Conditions */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-400">Asphalt</h3>
                  <Badge 
                    variant="outline"
                    className={getStatusColor(surfaceConditions.asphalt.gripLevel || 'Fair')}
                  >
                    {surfaceConditions.asphalt.gripLevel} Grip
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="h-5 w-5 text-red-400" />
                  <span className="text-xl font-orbitron">
                    {formatTemperature(surfaceConditions.asphalt.temperature)}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">Condition: {surfaceConditions.asphalt.condition}</p>
              </div>
              
              {/* Concrete Conditions */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-400">Concrete</h3>
                  <Badge 
                    variant="outline"
                    className={getStatusColor(surfaceConditions.concrete.gripLevel || 'Fair')}
                  >
                    {surfaceConditions.concrete.gripLevel} Grip
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="h-5 w-5 text-red-400" />
                  <span className="text-xl font-orbitron">
                    {formatTemperature(surfaceConditions.concrete.temperature)}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">Condition: {surfaceConditions.concrete.condition}</p>
              </div>
              
              {/* Track Conditions */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-400">Driver Risk</h3>
                  <Badge variant="outline" className={getRiskColorClass(drivingRisk.overall)}>
                    Score: {drivingRisk.score}/10
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Visibility:</span>
                  <Badge variant="outline" className={getStatusColor(drivingRisk.visibility)}>
                    {drivingRisk.visibility}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Traction:</span>
                  <Badge variant="outline" className={getStatusColor(drivingRisk.traction)}>
                    {drivingRisk.traction}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Risk Description */}
            <div className="mb-4 bg-zinc-900/80 rounded-lg border border-zinc-800 p-3">
              <div className="flex gap-2 items-start">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                  drivingRisk.overall === 'Low' ? 'text-green-400' : 
                  drivingRisk.overall === 'Moderate' ? 'text-yellow-400' : 'text-red-400'
                }`} />
                <p className="text-sm text-zinc-300">
                  {drivingRisk.description}
                </p>
              </div>
            </div>
            
            {/* Additional Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <h3 className="font-semibold text-blue-400 mb-3">Specialized Risk Factors</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">Crosswind Risk:</span>
                    </div>
                    <Badge variant="outline" className={getRiskColorClass(drivingRisk.crosswindRisk || 'Low')}>
                      {drivingRisk.crosswindRisk}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">Aquaplaning Risk:</span>
                    </div>
                    <Badge variant="outline" className={getRiskColorClass(drivingRisk.aquaplaningRisk || 'Low')}>
                      {drivingRisk.aquaplaningRisk}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <h3 className="font-semibold text-blue-400 mb-2">Recommended Precautions</h3>
                <ul className="text-sm space-y-1 text-zinc-300">
                  {drivingRisk.overall !== 'Low' && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Reduce speed by {drivingRisk.overall === 'Moderate' ? '10-15%' : '25-30%'}
                    </li>
                  )}
                  {drivingRisk.traction !== 'Good' && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Apply throttle progressively to maintain traction
                    </li>
                  )}
                  {drivingRisk.crosswindRisk !== 'Low' && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Maintain firm grip on steering wheel
                    </li>
                  )}
                  {drivingRisk.aquaplaningRisk !== 'Minimal' && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Avoid standing water and sudden steering inputs
                    </li>
                  )}
                  {surfaceConditions.asphalt.condition === 'Wet' && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      Increase following distance by 2-3x
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tire Compound Recommendation */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <h3 className="font-semibold text-blue-400 mb-3">Tire Recommendations</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm">Optimal Compound:</span>
                  <Badge 
                    variant="outline" 
                    className={getCompoundColor(performance.tirePerformance.optimalCompound)}
                  >
                    {performance.tirePerformance.optimalCompound}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Degradation Rate:</span>
                    <span className="text-zinc-400">{performance.tirePerformance.degradationRate}/10</span>
                  </div>
                  <Progress 
                    value={performance.tirePerformance.degradationRate * 10} 
                    className={`h-2 bg-zinc-700 ${
                      performance.tirePerformance.degradationRate > 7 
                        ? 'bg-red-500'
                        : performance.tirePerformance.degradationRate > 4
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                  />
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Graining Risk:</span>
                    <span className="text-zinc-400">{performance.tirePerformance.grainingSusceptibility}/10</span>
                  </div>
                  <Progress 
                    value={performance.tirePerformance.grainingSusceptibility * 10} 
                    className={`h-2 bg-zinc-700 ${
                      performance.tirePerformance.grainingSusceptibility > 7 
                        ? 'bg-red-500'
                        : performance.tirePerformance.grainingSusceptibility > 4
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                  />
                </div>
                
                {/* Temperature Window */}
                <div className="mt-4 pt-3 border-t border-zinc-700">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>Min: {performance.tirePerformance.temperatureWindow.min}°</span>
                    <span className="text-cyan-400 font-orbitron">
                      {Math.round(performance.tirePerformance.temperatureWindow.current)}°
                    </span>
                    <span>Max: {performance.tirePerformance.temperatureWindow.max}°</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full relative">
                    <div className="absolute inset-0 flex items-center justify-between px-1">
                      <div className="w-0.5 h-4 bg-zinc-600"></div>
                      <div className="w-0.5 h-4 bg-zinc-600"></div>
                    </div>
                    
                    {/* Current temperature indicator */}
                    <div 
                      className="absolute top-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-y-1/2"
                      style={{
                        left: `${Math.min(100, Math.max(0, 
                          (performance.tirePerformance.temperatureWindow.current - performance.tirePerformance.temperatureWindow.min) / 
                          (performance.tirePerformance.temperatureWindow.max - performance.tirePerformance.temperatureWindow.min) * 100
                        ))}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Warmup Times */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-blue-400">Warmup Times (min)</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Sport/Performance</span>
                      <span className="font-orbitron">{performance.tireWarmupTime.sport} min</span>
                    </div>
                    <Progress
                      value={(performance.tireWarmupTime.sport / 10) * 100} 
                      className="h-2 bg-zinc-700 bg-red-500"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Summer</span>
                      <span className="font-orbitron">{performance.tireWarmupTime.summer} min</span>
                    </div>
                    <Progress
                      value={(performance.tireWarmupTime.summer / 10) * 100} 
                      className="h-2 bg-zinc-700 bg-amber-500"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>All Season</span>
                      <span className="font-orbitron">{performance.tireWarmupTime.allSeason} min</span>
                    </div>
                    <Progress
                      value={(performance.tireWarmupTime.allSeason / 10) * 100} 
                      className="h-2 bg-zinc-700 bg-green-500"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Winter</span>
                      <span className="font-orbitron">{performance.tireWarmupTime.winter} min</span>
                    </div>
                    <Progress
                      value={(performance.tireWarmupTime.winter / 10) * 100} 
                      className="h-2 bg-zinc-700 bg-blue-500"
                    />
                  </div>
                  
                  {/* F1 compounds if available */}
                  {performance.tireWarmupTime.soft && (
                    <div className="pt-2 border-t border-zinc-700 mt-3">
                      <h4 className="text-sm text-zinc-400 mb-2">F1 Compounds</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
                          Soft: {performance.tireWarmupTime.soft}m
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                          Medium: {performance.tireWarmupTime.medium}m
                        </Badge>
                        <Badge variant="outline" className="bg-zinc-300/20 text-zinc-300 border-zinc-300/50">
                          Hard: {performance.tireWarmupTime.hard}m
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Torque Effect */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-blue-400">Power Delivery</h3>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Power Application:</span>
                  <Badge variant="outline" className={`
                    ${performance.torqueEffect.percentageAdjustment < 70 
                      ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                      : performance.torqueEffect.percentageAdjustment < 90
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        : 'bg-green-500/20 text-green-400 border-green-500/50'
                    }`}
                  >
                    {performance.torqueEffect.percentageAdjustment}%
                  </Badge>
                </div>
                
                <p className="text-sm text-zinc-300 mb-3">
                  {performance.torqueEffect.description}
                </p>
                
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Corner Exit:</span>
                    <span className="text-blue-400">{performance.torqueEffect.cornerExitRecommendation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Traction Control:</span>
                    <span className="text-blue-400">Level {performance.torqueEffect.tractionControlSuggestion}/5</span>
                  </div>
                </div>
              </div>
              
              {/* Engine Performance */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-blue-400">Engine Performance</h3>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Air Density Factor:</span>
                    <span className="font-orbitron">{performance.enginePerformance.airDensityFactor.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cooling Efficiency:</span>
                    <Badge variant="outline" className={getStatusColor(performance.enginePerformance.coolingEfficiency)}>
                      {performance.enginePerformance.coolingEfficiency}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Power Change:</span>
                    <span className={`font-mono ${
                      performance.enginePerformance.estimatedPowerChange.includes('+') 
                        ? 'text-green-400' 
                        : performance.enginePerformance.estimatedPowerChange.includes('-')
                          ? 'text-red-400'
                          : 'text-blue-400'
                    }`}>
                      {performance.enginePerformance.estimatedPowerChange}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-zinc-400 mt-2 pt-2 border-t border-zinc-700">
                  <p>
                    {performance.enginePerformance.airDensityFactor > 1.05 
                      ? 'Denser air providing better power and cooling efficiency.'
                      : performance.enginePerformance.airDensityFactor < 0.95
                        ? 'Thinner air reducing power output. Monitor temperatures.'
                        : 'Air density near standard conditions for optimal performance.'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tire Pressure */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <h3 className="font-semibold text-blue-400 mb-3">Recommended Tire Pressure</h3>
                
                <div className="space-y-4">
                  {/* Front tires */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Front Tires:</span>
                      <span className="font-orbitron text-blue-400">
                        {performance.recommendedTirePressure.front.optimal.toFixed(1)} {performance.recommendedTirePressure.front.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full relative">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                        style={{
                          width: '100%',
                          clipPath: `inset(0 ${100 - ((performance.recommendedTirePressure.front.optimal - 1.5) / 1.5) * 100}% 0 0)`
                        }}
                      ></div>
                      
                      {/* Min/Max/Optimal markers */}
                      <div className="absolute inset-0 flex items-center px-0 justify-between">
                        <div className="ml-3 text-[0.6rem] text-zinc-400 whitespace-nowrap absolute -bottom-5">
                          Min: {performance.recommendedTirePressure.front.min.toFixed(1)}
                        </div>
                        <div className="mr-3 text-[0.6rem] text-zinc-400 whitespace-nowrap absolute -bottom-5 right-0">
                          Max: {performance.recommendedTirePressure.front.max.toFixed(1)}
                        </div>
                      </div>
                      
                      {/* Optimal indicator */}
                      <div 
                        className="absolute top-1/2 w-2 h-4 bg-blue-500 rounded-full transform -translate-y-1/2 border border-white"
                        style={{
                          left: `${((performance.recommendedTirePressure.front.optimal - 1.5) / 1.5) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Rear tires */}
                  <div className="mt-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Rear Tires:</span>
                      <span className="font-orbitron text-blue-400">
                        {performance.recommendedTirePressure.rear.optimal.toFixed(1)} {performance.recommendedTirePressure.rear.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full relative">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                        style={{
                          width: '100%',
                          clipPath: `inset(0 ${100 - ((performance.recommendedTirePressure.rear.optimal - 1.5) / 1.5) * 100}% 0 0)`
                        }}
                      ></div>
                      
                      {/* Min/Max/Optimal markers */}
                      <div className="absolute inset-0 flex items-center px-0 justify-between">
                        <div className="ml-3 text-[0.6rem] text-zinc-400 whitespace-nowrap absolute -bottom-5">
                          Min: {performance.recommendedTirePressure.rear.min.toFixed(1)}
                        </div>
                        <div className="mr-3 text-[0.6rem] text-zinc-400 whitespace-nowrap absolute -bottom-5 right-0">
                          Max: {performance.recommendedTirePressure.rear.max.toFixed(1)}
                        </div>
                      </div>
                      
                      {/* Optimal indicator */}
                      <div 
                        className="absolute top-1/2 w-2 h-4 bg-blue-500 rounded-full transform -translate-y-1/2 border border-white"
                        style={{
                          left: `${((performance.recommendedTirePressure.rear.optimal - 1.5) / 1.5) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-zinc-400 mt-4 pt-2 border-t border-zinc-700">
                    <p>
                      Pressure recommendations adjusted for current surface and air temperatures. 
                      Check cold pressures before driving and adjust to reach optimal hot pressure.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Aerodynamics */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-blue-400">Advanced Performance</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Downforce Efficiency:</span>
                    <span className="font-orbitron">{performance.aerodynamics.downforceEfficiency}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Drag Coefficient Multiplier:</span>
                    <span className="font-orbitron">{performance.aerodynamics.dragCoefficient.toFixed(2)}x</span>
                  </div>
                  
                  {performance.aerodynamics.wingSettings && (
                    <div className="flex justify-between">
                      <span className="text-sm">Wing Settings:</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-zinc-800">
                          F: {performance.aerodynamics.wingSettings.front}
                        </Badge>
                        <Badge variant="outline" className="bg-zinc-800">
                          R: {performance.aerodynamics.wingSettings.rear}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator className="my-3" />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Brake Cooling:</span>
                    <Badge variant="outline" className={getStatusColor(performance.brakingPerformance.coolingEfficiency)}>
                      {performance.brakingPerformance.coolingEfficiency}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Optimal Brake Temp:</span>
                    <span className="font-orbitron">{performance.brakingPerformance.estimatedOptimalTemperature}°</span>
                  </div>
                </div>
                
                <div className="text-xs text-zinc-400 mt-4 pt-2 border-t border-zinc-700">
                  <p>{performance.aerodynamics.airDensityImpact}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TodaysDriveConditions;