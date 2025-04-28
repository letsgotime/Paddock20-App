import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { getAutomotiveWeatherData } from '@/services/openWeatherService';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Car,
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const OpenWeatherAutomotivePanel = () => {
  const { 
    weatherData, 
    oneCallData, 
    selectedLocation, 
    unit, 
    isLoading, 
    error, 
    refreshWeather 
  } = useWeather();
  
  const [automotiveData, setAutomotiveData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [automotiveError, setAutomotiveError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchAutomotiveData() {
      if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lon) {
        return;
      }
      
      try {
        setLoading(true);
        setAutomotiveError(null);
        
        // Get comprehensive automotive data from OpenWeather using our enhanced service
        const data = await getAutomotiveWeatherData(selectedLocation.lat, selectedLocation.lon);
        setAutomotiveData(data);
      } catch (err) {
        console.error('Error fetching automotive weather data:', err);
        setAutomotiveError(err instanceof Error ? err : new Error('Failed to load automotive weather data'));
      } finally {
        setLoading(false);
      }
    }
    
    if (weatherData && oneCallData) {
      fetchAutomotiveData();
    }
  }, [weatherData, oneCallData, selectedLocation]);
  
  if (isLoading || loading) {
    return (
      <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-t-2 border-blue-500 animate-spin mb-3"></div>
              <p className="text-gray-400">Loading automotive weather data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (automotiveError || error || !automotiveData) {
    return (
      <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-red-500 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Automotive Weather Data
          </CardTitle>
          <CardDescription>
            Unable to load automotive weather data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <p className="text-gray-400 mb-4">
              {(automotiveError?.message || error?.message || 'OpenWeather services currently unavailable')}
            </p>
            <button 
              onClick={refreshWeather}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Extract key data for display
  const surfaceConditions = automotiveData.surfaceConditions;
  const drivingRisk = automotiveData.drivingRisk;
  const performanceData = automotiveData.performance;
  const washConditions = automotiveData.washConditions;
  const detailingConditions = automotiveData.detailingConditions;
  
  const airTemp = weatherData?.main?.temp || 0;
  const asphaltTemp = surfaceConditions?.asphalt?.temperature || Math.round(airTemp + 15);
  const concreteTemp = surfaceConditions?.concrete?.temperature || Math.round(airTemp + 10);
  
  // Helper function to get color class based on risk level
  const getRiskColorClass = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'high':
        return 'text-orange-400';
      case 'extreme':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };
  
  // Helper function to get badge class based on risk level
  const getRiskBadgeClass = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-green-900/20 text-green-400 border-green-900/30';
      case 'moderate':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30';
      case 'high':
        return 'bg-orange-900/20 text-orange-400 border-orange-900/30';
      case 'extreme':
        return 'bg-red-900/20 text-red-400 border-red-900/30';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-800';
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-blue-400 flex items-center">
          <Car className="h-5 w-5 mr-2" />
          Automotive Weather Data
        </CardTitle>
        <CardDescription>
          Enhanced performance metrics for driving and detailing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Surface Temperatures */}
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-3">Surface Temperatures</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <p className="text-gray-400 text-sm">Asphalt</p>
                <p className="text-white text-2xl">{asphaltTemp}°{unit === 'metric' ? 'C' : 'F'}</p>
                <Badge 
                  className={`mt-1 ${
                    asphaltTemp > (unit === 'metric' ? 40 : 104) ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                    asphaltTemp > (unit === 'metric' ? 30 : 86) ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30' :
                    'bg-green-900/20 text-green-400 border-green-900/30'
                  }`}
                >
                  {surfaceConditions?.asphalt?.condition || 
                    (asphaltTemp > (unit === 'metric' ? 40 : 104) ? 'Hot' :
                    asphaltTemp > (unit === 'metric' ? 30 : 86) ? 'Warm' : 'Cool')}
                </Badge>
              </div>
              
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <p className="text-gray-400 text-sm">Concrete</p>
                <p className="text-white text-2xl">{concreteTemp}°{unit === 'metric' ? 'C' : 'F'}</p>
                <Badge 
                  className={`mt-1 ${
                    concreteTemp > (unit === 'metric' ? 35 : 95) ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                    concreteTemp > (unit === 'metric' ? 25 : 77) ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30' :
                    'bg-green-900/20 text-green-400 border-green-900/30'
                  }`}
                >
                  {surfaceConditions?.concrete?.condition || 
                    (concreteTemp > (unit === 'metric' ? 35 : 95) ? 'Hot' :
                    concreteTemp > (unit === 'metric' ? 25 : 77) ? 'Warm' : 'Cool')}
                </Badge>
              </div>
            </div>
            
            {/* Track Conditions */}
            <h3 className="text-lg font-medium text-blue-400 mt-4 mb-3">Track Conditions</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <p className="text-gray-400 text-sm">Grip Level</p>
                <p className="text-white text-xl">{surfaceConditions?.asphalt?.gripLevel || 'Medium'}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {surfaceConditions?.racingSurface?.offLineGripLoss 
                    ? `Off-line grip: ${-surfaceConditions.racingSurface.offLineGripLoss}%` 
                    : ''}
                </p>
              </div>
              
              <div className="bg-black/30 p-3 rounded border border-gray-800">
                <p className="text-gray-400 text-sm">Racing Surface</p>
                <p className="text-white text-xl">{surfaceConditions?.racingSurface?.trackEvolution || 'Static'}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {surfaceConditions?.racingSurface?.idealLine 
                    ? `Ideal line: ${surfaceConditions.racingSurface.idealLine}` 
                    : ''}
                </p>
              </div>
            </div>
          </div>
          
          {/* Driving Metrics */}
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-3">Driving Assessment</h3>
            <div className="bg-black/30 p-4 rounded border border-gray-800 mb-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-300">Overall Risk</p>
                <Badge className={getRiskBadgeClass(drivingRisk?.overall || 'low')}>
                  {drivingRisk?.overall || 'Low'}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Visibility</span>
                    <span className={getRiskColorClass(drivingRisk?.visibility || 'good')}>
                      {drivingRisk?.visibility || 'Good'}
                    </span>
                  </div>
                  <Progress 
                    value={
                      drivingRisk?.visibility === 'Good' ? 90 :
                      drivingRisk?.visibility === 'Moderate' ? 60 :
                      drivingRisk?.visibility === 'Poor' ? 30 : 80
                    } 
                    className="h-1.5"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Traction</span>
                    <span className={getRiskColorClass(drivingRisk?.traction || 'good')}>
                      {drivingRisk?.traction || 'Good'}
                    </span>
                  </div>
                  <Progress 
                    value={
                      drivingRisk?.traction === 'Good' ? 90 :
                      drivingRisk?.traction === 'Reduced' ? 50 : 
                      drivingRisk?.traction === 'Poor' ? 20 : 70
                    } 
                    className="h-1.5"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Crosswind Risk</span>
                    <span className={getRiskColorClass(drivingRisk?.crosswindRisk || 'low')}>
                      {drivingRisk?.crosswindRisk || 'Low'}
                    </span>
                  </div>
                  <Progress 
                    value={
                      drivingRisk?.crosswindRisk === 'Low' ? 20 :
                      drivingRisk?.crosswindRisk === 'Moderate' ? 50 :
                      drivingRisk?.crosswindRisk === 'High' ? 75 : 
                      drivingRisk?.crosswindRisk === 'Extreme' ? 90 : 20
                    } 
                    className="h-1.5"
                  />
                </div>
              </div>
            </div>
            
            {/* Tire Performance */}
            <h3 className="text-lg font-medium text-blue-400 mt-4 mb-3">Tire Performance</h3>
            <div className="bg-black/30 p-4 rounded border border-gray-800">
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-300">Recommended</p>
                <Badge className="bg-blue-900/20 text-blue-400 border-blue-900/30">
                  {performanceData?.tirePerformance?.optimalCompound || 'All-Season'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Warmup Time (Sport)</span>
                  <span className="text-white">
                    {performanceData?.tireWarmupTime?.sport || 3} mins
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Front Pressure</span>
                  <span className="text-white">
                    {performanceData?.recommendedTirePressure?.front?.optimal || 32} PSI
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rear Pressure</span>
                  <span className="text-white">
                    {performanceData?.recommendedTirePressure?.rear?.optimal || 30} PSI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailing Conditions */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-black/30 p-4 rounded border border-gray-800">
            <h3 className="text-lg font-medium text-blue-400 mb-3">Car Wash Conditions</h3>
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-300">Recommendation</p>
              <Badge className={washConditions?.recommended ? 
                'bg-green-900/20 text-green-400 border-green-900/30' : 
                'bg-red-900/20 text-red-400 border-red-900/30'
              }>
                {washConditions?.recommended ? 'Recommended' : 'Not Ideal'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">UV Exposure</span>
                <span className="text-white">{washConditions?.uv || 'Low'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Drying Conditions</span>
                <span className="text-white">{washConditions?.drying || 'Good'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Spot-Free Washing</span>
                <span className="text-white">{washConditions?.spotFreeWashing ? 'Yes' : 'No'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rain Chance (24h)</span>
                <span className="text-white">{washConditions?.rainProbabilityNext24h || 10}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 p-4 rounded border border-gray-800">
            <h3 className="text-lg font-medium text-blue-400 mb-3">Detailing Conditions</h3>
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-300">Recommendation</p>
              <Badge className={detailingConditions?.recommended ? 
                'bg-green-900/20 text-green-400 border-green-900/30' : 
                'bg-red-900/20 text-red-400 border-red-900/30'
              }>
                {detailingConditions?.recommended ? 'Recommended' : 'Not Ideal'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Humidity</span>
                <span className="text-white">{detailingConditions?.humidity || 'Moderate'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Polishing Conditions</span>
                <span className="text-white">{detailingConditions?.polishingConditions || 'Good'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Coating Curing</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <span className="text-white">{detailingConditions?.coatingCuringFactor || 1}x</span>
                        <Info className="h-3 w-3 ml-1 text-gray-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Multiplier for recommended curing time</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Lighting</span>
                <span className="text-white">{detailingConditions?.lighting || 'Good'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenWeatherAutomotivePanel;