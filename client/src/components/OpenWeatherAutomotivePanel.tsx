import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { getAutomotiveWeatherData } from '@/services/openWeatherService';
import { CarFront, Droplets, Sun, Wind, Thermometer, AlertTriangle, Gauge } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Interfaces matching OpenWeather automotive data structure
interface SurfaceCondition {
  temperature?: number;
  condition?: string;
}

interface SurfaceConditions {
  asphalt?: SurfaceCondition;
  concrete?: SurfaceCondition;
  gravel?: SurfaceCondition;
}

interface DrivingRisk {
  overall?: string;
  visibility?: string;
  traction?: string;
  score?: number;
  description?: string;
}

interface WashConditions {
  recommended?: boolean;
  uv?: string;
  pollen?: string;
  drying?: string;
  rainProbabilityNext24h?: number;
}

interface DetailingConditions {
  recommended?: boolean;
  humidity?: string;
  temperature?: string;
  wind?: string;
  lighting?: string;
}

interface TireWarmupTime {
  sport?: number;
  summer?: number;
  allSeason?: number;
  winter?: number;
}

interface PerformanceData {
  tireWarmupTime?: TireWarmupTime;
  roadSurfaceTemp?: number;
  tirePressure?: {
    front?: {
      min?: number;
      max?: number;
      optimal?: number;
      unit?: string;
    };
    rear?: {
      min?: number;
      max?: number;
      optimal?: number;
      unit?: string;
    };
  };
  torqueEffect?: {
    description?: string;
    percentageAdjustment?: number;
    cornerExitRecommendation?: string;
    tractionControlSuggestion?: number;
  };
  aerodynamics?: {
    dragCoefficient?: number;
    downforceEfficiency?: number;
    wingSettings?: {
      front?: string;
      rear?: string;
    };
    airDensityImpact?: string;
    crosswindSensitivity?: number;
  };
  enginePerformance?: {
    airDensityFactor?: number;
    coolingEfficiency?: string;
    estimatedPowerChange?: string;
    airIntakeTemperature?: number;
    turboEfficiency?: number;
    optimalShiftPoints?: {
      increase?: number;
      decrease?: number;
    };
  };
  brakingPerformance?: {
    optimalTemperatureRange?: {
      min?: number;
      max?: number;
      unit?: string;
    };
    coolingRate?: string;
    wetPerformanceReduction?: number;
    coolingEfficiency?: string;
    estimatedOptimalTemperature?: number;
    paddleDegradation?: number;
    brakingPointAdjustment?: number;
  };
}

interface AutomotiveWeatherData {
  timestamp?: number;
  surfaceConditions?: SurfaceConditions;
  drivingRisk?: DrivingRisk;
  washConditions?: WashConditions;
  detailingConditions?: DetailingConditions;
  performance?: PerformanceData;
}

const OpenWeatherAutomotivePanel: React.FC = () => {
  const { weatherData, oneCallData, unit } = useWeather();
  const [automotiveData, setAutomotiveData] = useState<AutomotiveWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch automotive weather data when coordinates change
  useEffect(() => {
    const fetchData = async () => {
      if (!weatherData || !weatherData.coord) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch OpenWeather's enhanced automotive data
        const data = await getAutomotiveWeatherData(
          weatherData.coord.lat, 
          weatherData.coord.lon
        );
        
        setAutomotiveData(data);
      } catch (err) {
        console.error('Error fetching automotive weather data:', err);
        setError(err as Error);
        toast({
          title: 'Unable to load automotive weather data',
          description: 'OpenWeather API services currently unavailable',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weatherData]);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 animate-pulse">
        <h2 className="font-orbitron text-blue-400 text-xl mb-4">Loading Automotive Weather Data...</h2>
        <div className="h-8 bg-gray-800 rounded mb-4"></div>
        <div className="h-8 bg-gray-800 rounded mb-4"></div>
        <div className="h-8 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (error || !automotiveData) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="font-orbitron text-blue-400 text-xl mb-4">Automotive Weather Data</h2>
        <div className="p-4 bg-gray-950 rounded-lg text-center">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-300">Unable to load automotive weather data</p>
          <p className="text-sm text-gray-500 mt-2">
            {error ? error.message : 'Data unavailable for this location'}
          </p>
        </div>
      </div>
    );
  }

  // Format temperature based on the selected unit
  const formatTemp = (temp?: number) => {
    if (!temp) return '—';
    
    if (unit === 'imperial') {
      // Convert from Celsius to Fahrenheit if needed
      return Math.round(temp * 9/5 + 32);
    }
    return Math.round(temp);
  };

  // Get appropriate styling for surface condition
  const getConditionStyle = (condition?: string) => {
    if (!condition) return 'text-white';
    
    switch (condition.toLowerCase()) {
      case 'dry':
        return 'text-green-400';
      case 'damp':
        return 'text-yellow-400';
      case 'wet':
      case 'rain':
      case 'drizzle':
        return 'text-blue-400';
      case 'snow':
      case 'ice':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  // Get appropriate styling for risk level
  const getRiskStyle = (risk?: string) => {
    if (!risk) return 'text-white';
    
    switch (risk.toLowerCase()) {
      case 'low':
      case 'good':
        return 'text-green-400';
      case 'moderate':
      case 'fair':
        return 'text-yellow-400';
      case 'high':
      case 'poor':
        return 'text-orange-400';
      case 'severe':
      case 'dangerous':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  // Get appropriate styling for recommended/not recommended
  const getRecommendedStyle = (recommended?: boolean) => {
    return recommended ? 'text-green-400' : 'text-red-400';
  };

  // Get appropriate styling for UV level
  const getUVStyle = (uv?: string) => {
    if (!uv) return 'text-white';
    
    switch (uv.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'high':
      case 'very high':
      case 'extreme':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const { surfaceConditions, drivingRisk, washConditions, detailingConditions, performance } = automotiveData;
  const tempUnit = unit === 'metric' ? '°C' : '°F';

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="font-orbitron text-blue-400 text-xl mb-4 flex items-center">
        <CarFront className="mr-2 h-5 w-5" />
        Automotive Weather Conditions
      </h2>

      {/* Surface Temperatures Panel */}
      <div className="mb-6">
        <h3 className="text-gray-300 font-medium mb-3 flex items-center">
          <Thermometer className="mr-2 h-4 w-4" />
          Surface Temperatures
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Asphalt</h4>
            <p className="text-xl font-semibold">
              {formatTemp(surfaceConditions?.asphalt?.temperature)}{tempUnit}
            </p>
            <p className={`text-sm ${getConditionStyle(surfaceConditions?.asphalt?.condition)}`}>
              {surfaceConditions?.asphalt?.condition || 'Unknown'}
            </p>
          </div>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Concrete</h4>
            <p className="text-xl font-semibold">
              {formatTemp(surfaceConditions?.concrete?.temperature)}{tempUnit}
            </p>
            <p className={`text-sm ${getConditionStyle(surfaceConditions?.concrete?.condition)}`}>
              {surfaceConditions?.concrete?.condition || 'Unknown'}
            </p>
          </div>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Gravel</h4>
            <p className="text-xl font-semibold">
              {formatTemp(surfaceConditions?.gravel?.temperature)}{tempUnit}
            </p>
            <p className={`text-sm ${getConditionStyle(surfaceConditions?.gravel?.condition)}`}>
              {surfaceConditions?.gravel?.condition || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Driving Conditions Panel */}
      <div className="mb-6">
        <h3 className="text-gray-300 font-medium mb-3 flex items-center">
          <Gauge className="mr-2 h-4 w-4" />
          Driving Conditions
        </h3>
        <div className="bg-black bg-opacity-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Overall Risk:</span>
            <span className={`font-medium ${getRiskStyle(drivingRisk?.overall)}`}>
              {drivingRisk?.overall || 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Visibility:</span>
            <span className="font-medium">{drivingRisk?.visibility || 'Unknown'}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Traction:</span>
            <span className="font-medium">{drivingRisk?.traction || 'Unknown'}</span>
          </div>
          {drivingRisk?.description && (
            <p className="text-sm text-gray-300 mt-2 italic">{drivingRisk.description}</p>
          )}
        </div>
      </div>

      {/* Car Care Panel */}
      <div className="grid grid-cols-2 gap-4">
        {/* Car Wash Panel */}
        <div>
          <h3 className="text-gray-300 font-medium mb-3 flex items-center">
            <Droplets className="mr-2 h-4 w-4" />
            Wash Conditions
          </h3>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg h-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Recommended:</span>
              <span className={`font-medium ${getRecommendedStyle(washConditions?.recommended)}`}>
                {washConditions?.recommended ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">UV Impact:</span>
              <span className={`font-medium ${getUVStyle(washConditions?.uv)}`}>
                {washConditions?.uv || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Drying:</span>
              <span className="font-medium">{washConditions?.drying || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Rain Risk (24h):</span>
              <span className="font-medium">{washConditions?.rainProbabilityNext24h || '—'}%</span>
            </div>
          </div>
        </div>

        {/* Detailing Panel */}
        <div>
          <h3 className="text-gray-300 font-medium mb-3 flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            Detailing Conditions
          </h3>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg h-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Recommended:</span>
              <span className={`font-medium ${getRecommendedStyle(detailingConditions?.recommended)}`}>
                {detailingConditions?.recommended ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Humidity:</span>
              <span className="font-medium">{detailingConditions?.humidity || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Wind:</span>
              <span className="font-medium">{detailingConditions?.wind || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Lighting:</span>
              <span className="font-medium text-sm">{detailingConditions?.lighting || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* F1-Level Performance Panel */}
      {performance && (
        <div className="mt-6">
          <h3 className="text-gray-300 font-medium mb-3 flex items-center">
            <CarFront className="mr-2 h-4 w-4" />
            F1-Level Performance Metrics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tire Performance Panel */}
            {performance.tireWarmupTime && (
              <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                <h4 className="text-sm text-blue-400 mb-2">Tire Performance</h4>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Sport Warmup:</span>
                  <span className="font-medium">
                    {performance.tireWarmupTime.sport || '—'} mins
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Summer Warmup:</span>
                  <span className="font-medium">
                    {performance.tireWarmupTime.summer || '—'} mins
                  </span>
                </div>
                
                {performance.tirePressure && (
                  <>
                    <h5 className="text-xs text-gray-500 mt-3 mb-1">Recommended Pressure</h5>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-sm">Front:</span>
                      <span className="font-medium text-sm">
                        {performance.tirePressure.front?.optimal || '—'} {performance.tirePressure.front?.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Rear:</span>
                      <span className="font-medium text-sm">
                        {performance.tirePressure.rear?.optimal || '—'} {performance.tirePressure.rear?.unit}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Engine Performance Panel */}
            {performance.enginePerformance && (
              <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                <h4 className="text-sm text-blue-400 mb-2">Engine Performance</h4>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Power:</span>
                  <span className="font-medium">
                    {performance.enginePerformance.estimatedPowerChange || '—'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Cooling:</span>
                  <span className="font-medium">
                    {performance.enginePerformance.coolingEfficiency || '—'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Air Density Factor:</span>
                  <span className="font-medium">
                    {performance.enginePerformance.airDensityFactor || '—'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Aerodynamics Panel */}
            {performance.aerodynamics && (
              <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                <h4 className="text-sm text-blue-400 mb-2">Aerodynamics</h4>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Drag Coefficient:</span>
                  <span className="font-medium">
                    {performance.aerodynamics.dragCoefficient || '—'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Downforce:</span>
                  <span className="font-medium">
                    {performance.aerodynamics.downforceEfficiency || '—'}%
                  </span>
                </div>
                
                {performance.aerodynamics.wingSettings && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Wing Setting:</span>
                    <span className="font-medium">
                      F: {performance.aerodynamics.wingSettings.front || '—'} | 
                      R: {performance.aerodynamics.wingSettings.rear || '—'}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Torque Effects Panel */}
            {performance.torqueEffect && (
              <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                <h4 className="text-sm text-blue-400 mb-2">Torque Management</h4>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Adjustment:</span>
                  <span className="font-medium">
                    {performance.torqueEffect.percentageAdjustment || '—'}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Corner Exit:</span>
                  <span className="font-medium">
                    {performance.torqueEffect.cornerExitRecommendation || '—'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">TC Setting:</span>
                  <span className="font-medium">
                    {performance.torqueEffect.tractionControlSuggestion || '—'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenWeatherAutomotivePanel;