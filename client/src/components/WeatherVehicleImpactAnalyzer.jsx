import React, { useState, useEffect } from 'react';
import { 
  Droplets, Thermometer, Wind, Cloud, Sun, CloudRain, Snowflake,
  Gauge, BarChart2, TrendingUp, ArrowDown, ArrowUp, Activity,
  Zap, Battery, Fuel, AlertTriangle, Check, Info, Sliders,
  Clock, Calendar, Car, Wrench, Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

/**
 * Weather Vehicle Impact Analyzer Component
 * 
 * A specialized component that shows detailed analysis of how current weather 
 * conditions affect vehicle performance across multiple systems.
 * 
 * @param {Object} props
 * @param {Object} props.vehicle - Current vehicle data
 * @param {Array} props.modifications - Vehicle modifications
 * @param {Object} props.weatherData - Current weather data
 */
const WeatherVehicleImpactAnalyzer = ({ 
  vehicle, 
  modifications = [], 
  weatherData = {},
  tireHeatingTrends,
  engineWarmUpTime,
  engineCooldownTime
}) => {
  const [performanceImpact, setPerformanceImpact] = useState({
    overall: 0, // -10 to +10 scale, 0 is neutral
    engine: 0,
    handling: 0,
    braking: 0,
    visibility: 0,
    efficiency: 0
  });
  
  const [systemStatusReports, setSystemStatusReports] = useState([]);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [weatherAdjustments, setWeatherAdjustments] = useState({
    tirePressure: { 
      recommendation: 'Maintain factory settings',
      adjustmentNeeded: false,
      value: 0 // PSI adjustment
    },
    drivingStyle: { 
      recommendation: 'Normal driving recommended',
      adjustmentNeeded: false
    },
    maintenanceAlert: {
      active: false,
      message: ''
    }
  });
  
  // Weather trends over the next 12 hours (to show changes in vehicle performance)
  const [performanceForecast, setPerformanceForecast] = useState([]);
  
  // Generate performance impact metrics based on current weather and vehicle
  useEffect(() => {
    if (!weatherData || !vehicle) return;
    
    // Extract key weather data
    const temp = weatherData.main?.temp || 70; // F
    const humidity = weatherData.main?.humidity || 50; // %
    const windSpeed = weatherData.wind?.speed || 5; // mph
    const condition = weatherData.weather?.[0]?.main?.toLowerCase() || 'clear';
    const isRaining = condition.includes('rain');
    const isSnowing = condition.includes('snow');
    const isFoggy = condition.includes('fog') || condition.includes('mist');
    
    // Vehicle characteristics affecting performance in weather
    const vehicleType = vehicle.type || 'sedan'; // sedan, sports, SUV, truck
    const hasTurbo = modifications.some(m => m.name?.toLowerCase().includes('turbo'));
    const hasPerformanceTires = modifications.some(m => 
      m.name?.toLowerCase().includes('performance') && 
      m.name?.toLowerCase().includes('tire')
    );
    const hasAllWheelDrive = vehicle.drivetrain?.toLowerCase()?.includes('awd') || 
                            vehicle.drivetrain?.toLowerCase()?.includes('all wheel');
    
    // Calculate performance impacts
    let newPerformanceImpact = { ...performanceImpact };
    
    // ENGINE PERFORMANCE
    // Cold temps boost turbo performance, hot temps reduce it
    if (hasTurbo) {
      if (temp < 50) {
        newPerformanceImpact.engine += 2; // Better turbo performance in cold
      } else if (temp > 90) {
        newPerformanceImpact.engine -= 3; // Worse in hot weather (heat soak)
      }
    }
    
    // All engines generally lose some power in very hot weather
    if (temp > 95) {
      newPerformanceImpact.engine -= 2;
      newPerformanceImpact.efficiency -= 2;
    }
    
    // High humidity reduces engine power due to less dense air
    if (humidity > 85) {
      newPerformanceImpact.engine -= 1;
    } else if (humidity < 30) {
      newPerformanceImpact.engine += 1; // Dry air is better for combustion
    }
    
    // HANDLING PERFORMANCE
    // Tires performance varies significantly with weather
    if (hasPerformanceTires) {
      if (temp < 45) {
        newPerformanceImpact.handling -= 4; // Performance tires perform poorly in cold
        newPerformanceImpact.braking -= 3;
      } else if (temp > 50 && temp < 90) {
        newPerformanceImpact.handling += 3; // Performance tires excel in moderate temps
        newPerformanceImpact.braking += 2;
      }
      
      if (isRaining || isSnowing) {
        newPerformanceImpact.handling -= 5; // Very poor in wet/snow
        newPerformanceImpact.braking -= 4;
      }
    } else {
      // All-season tires
      if (isRaining) {
        newPerformanceImpact.handling -= 2;
        newPerformanceImpact.braking -= 2;
      } else if (isSnowing) {
        newPerformanceImpact.handling -= 3;
        newPerformanceImpact.braking -= 3;
      }
    }
    
    // AWD helps in adverse conditions
    if (hasAllWheelDrive && (isRaining || isSnowing)) {
      newPerformanceImpact.handling += 2;
    }
    
    // VISIBILITY
    if (isRaining) {
      newPerformanceImpact.visibility -= 3;
    } else if (isSnowing) {
      newPerformanceImpact.visibility -= 5;
    } else if (isFoggy) {
      newPerformanceImpact.visibility -= 6;
    }
    
    // EFFICIENCY
    // Cold temps decrease fuel economy
    if (temp < 40) {
      newPerformanceImpact.efficiency -= 3;
    }
    // Strong headwinds reduce efficiency
    if (windSpeed > 15) {
      newPerformanceImpact.efficiency -= 2;
    }
    
    // Calculate overall impact (weighted average)
    newPerformanceImpact.overall = (
      (newPerformanceImpact.engine * 0.3) +
      (newPerformanceImpact.handling * 0.3) +
      (newPerformanceImpact.braking * 0.2) +
      (newPerformanceImpact.visibility * 0.1) +
      (newPerformanceImpact.efficiency * 0.1)
    );
    
    setPerformanceImpact(newPerformanceImpact);
    
    // Generate system status reports based on calculated impacts
    generateSystemReports(newPerformanceImpact, {
      temp, humidity, windSpeed, condition, isRaining, isSnowing, isFoggy
    });
    
    // Calculate weather adjustments for the vehicle
    calculateWeatherAdjustments({
      temp, humidity, windSpeed, condition, isRaining, isSnowing, isFoggy
    }, vehicle, modifications);
    
    // Generate performance forecast for next 12 hours
    generatePerformanceForecast({
      temp, humidity, windSpeed, condition
    }, newPerformanceImpact.overall);
    
  }, [weatherData, vehicle, modifications]);
  
  // Generate detailed system reports based on performance impacts
  const generateSystemReports = (performance, weather) => {
    const reports = [];
    
    // Engine report
    if (performance.engine <= -3) {
      reports.push({
        system: 'Engine',
        icon: <Zap className="h-5 w-5 text-red-500" />,
        status: 'Warning',
        message: 'Significant power loss due to current weather conditions',
        recommendation: 'Avoid heavy acceleration and high-load situations'
      });
    } else if (performance.engine >= 2) {
      reports.push({
        system: 'Engine',
        icon: <Zap className="h-5 w-5 text-green-500" />,
        status: 'Optimal',
        message: 'Current conditions favorable for engine performance',
        recommendation: 'Ideal conditions for performance driving'
      });
    }
    
    // Handling/braking reports
    if (performance.handling <= -3 || performance.braking <= -3) {
      reports.push({
        system: 'Handling & Braking',
        icon: <Activity className="h-5 w-5 text-red-500" />,
        status: 'Caution',
        message: 'Reduced grip and extended stopping distances',
        recommendation: 'Increase following distance by 50% and reduce cornering speed'
      });
    }
    
    // Visibility report
    if (performance.visibility <= -4) {
      reports.push({
        system: 'Visibility',
        icon: <Eye className="h-5 w-5 text-amber-500" />,
        status: 'Reduced',
        message: 'Significantly compromised visibility in current conditions',
        recommendation: 'Use fog lights if equipped, reduce speed, increase following distance'
      });
    }
    
    // Efficiency report
    if (performance.efficiency <= -2) {
      reports.push({
        system: 'Efficiency',
        icon: <Fuel className="h-5 w-5 text-amber-500" />,
        status: 'Reduced',
        message: 'Weather conditions causing increased fuel consumption',
        recommendation: 'Expect 10-15% decrease in fuel economy and adjust trip planning accordingly'
      });
    }
    
    // Battery report in cold weather
    if (weather.temp < 32) {
      reports.push({
        system: 'Battery',
        icon: <Battery className="h-5 w-5 text-amber-500" />,
        status: 'Caution',
        message: 'Cold temperatures reduce battery capacity',
        recommendation: 'Ensure battery is in good condition; avoid short trips that don\'t fully charge the battery'
      });
    }
    
    // Add a default positive report if no warnings are present
    if (reports.length === 0) {
      reports.push({
        system: 'All Systems',
        icon: <Check className="h-5 w-5 text-green-500" />,
        status: 'Optimal',
        message: 'Current weather conditions are favorable for driving',
        recommendation: 'Enjoy optimal vehicle performance'
      });
    }
    
    setSystemStatusReports(reports);
  };
  
  // Calculate weather-specific adjustments
  const calculateWeatherAdjustments = (weather, vehicle, mods) => {
    let adjustments = {
      tirePressure: { 
        recommendation: 'Maintain factory settings',
        adjustmentNeeded: false,
        value: 0
      },
      drivingStyle: { 
        recommendation: 'Normal driving recommended',
        adjustmentNeeded: false
      },
      maintenanceAlert: {
        active: false,
        message: ''
      }
    };
    
    // Tire pressure adjustments based on temperature
    // For every 10°F change in temperature, tire pressure changes by about 1 PSI
    const baseTemp = 70; // F - baseline temperature for tire pressure recommendations
    const tempDiff = Math.floor((baseTemp - weather.temp) / 10);
    
    if (Math.abs(tempDiff) >= 2) {
      adjustments.tirePressure.adjustmentNeeded = true;
      adjustments.tirePressure.value = tempDiff;
      
      if (tempDiff > 0) {
        adjustments.tirePressure.recommendation = 
          `Increase tire pressure by ${tempDiff} PSI due to cold temperature`;
      } else {
        adjustments.tirePressure.recommendation = 
          `Decrease tire pressure by ${Math.abs(tempDiff)} PSI due to hot temperature`;
      }
    }
    
    // Driving style recommendations
    if (weather.isRaining || weather.isSnowing) {
      adjustments.drivingStyle.adjustmentNeeded = true;
      adjustments.drivingStyle.recommendation = weather.isSnowing 
        ? 'Reduce speed by 30-40%, increase following distance, gentle inputs'
        : 'Reduce speed by 15-20%, increase following distance';
    } else if (weather.temp < 32) {
      adjustments.drivingStyle.adjustmentNeeded = true;
      adjustments.drivingStyle.recommendation = 'Watch for black ice, reduce speed on bridges and overpasses';
    }
    
    // Maintenance alerts
    if (weather.temp < 20) {
      adjustments.maintenanceAlert.active = true;
      adjustments.maintenanceAlert.message = 'Extreme cold: Check antifreeze concentration and battery condition';
    } else if (weather.temp > 100) {
      adjustments.maintenanceAlert.active = true;
      adjustments.maintenanceAlert.message = 'Extreme heat: Monitor coolant temperature and A/C performance';
    }
    
    setWeatherAdjustments(adjustments);
  };
  
  // Generate performance forecast
  const generatePerformanceForecast = (currentWeather, currentPerformance) => {
    // This would normally use actual weather forecast data
    // For demo, we'll generate a simulated forecast
    
    const forecast = [];
    const hours = 12;
    let performance = currentPerformance;
    let temp = currentWeather.temp;
    
    for (let i = 0; i < hours; i++) {
      // Simulate temperature changes over time (typically cools at night, warms during day)
      const hour = new Date().getHours() + i;
      const isDaytime = hour > 6 && hour < 18;
      
      // Create some variation in the forecast
      const tempChange = isDaytime ? 
        Math.random() * 2 - 0.5 : // warming slightly during day
        Math.random() * -2 + 0.5; // cooling slightly at night
        
      temp += tempChange;
      
      // Adjust performance based on temperature change
      const performanceChange = tempChange * 0.2; // Small impact on overall performance
      performance += performanceChange;
      
      forecast.push({
        hour: hour % 24,
        temp: Math.round(temp),
        performance: parseFloat(performance.toFixed(1))
      });
    }
    
    setPerformanceForecast(forecast);
  };
  
  // Format performance score to text
  const formatPerformanceText = (score) => {
    if (score >= 5) return 'Excellent';
    if (score >= 2) return 'Good';
    if (score >= -2) return 'Normal';
    if (score >= -5) return 'Reduced';
    return 'Poor';
  };
  
  // Get color based on performance score
  const getPerformanceColor = (score) => {
    if (score >= 5) return 'text-green-500';
    if (score >= 2) return 'text-green-400';
    if (score >= -2) return 'text-blue-400';
    if (score >= -5) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Get icon based on performance score
  const getPerformanceIcon = (score) => {
    if (score >= 5) return <Check className="h-5 w-5 text-green-500" />;
    if (score >= 2) return <TrendingUp className="h-5 w-5 text-green-400" />;
    if (score >= -2) return <Activity className="h-5 w-5 text-blue-400" />;
    if (score >= -5) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };
  
  return (
    <div className="weather-vehicle-impact">
      {/* Overall Performance Score */}
      <div className="bg-black/40 rounded-lg p-4 border border-blue-900/30 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Gauge className="h-5 w-5 text-blue-400 mr-2" />
            Overall Weather Impact
          </h3>
          <div className={`text-2xl font-bold ${getPerformanceColor(performanceImpact.overall)}`}>
            {formatPerformanceText(performanceImpact.overall)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-gray-900/40 rounded p-2 text-center">
            <div className="text-sm text-gray-400 mb-1">Engine</div>
            <div className={`text-lg font-medium ${getPerformanceColor(performanceImpact.engine)}`}>
              {formatPerformanceText(performanceImpact.engine)}
            </div>
          </div>
          
          <div className="bg-gray-900/40 rounded p-2 text-center">
            <div className="text-sm text-gray-400 mb-1">Handling</div>
            <div className={`text-lg font-medium ${getPerformanceColor(performanceImpact.handling)}`}>
              {formatPerformanceText(performanceImpact.handling)}
            </div>
          </div>
          
          <div className="bg-gray-900/40 rounded p-2 text-center">
            <div className="text-sm text-gray-400 mb-1">Braking</div>
            <div className={`text-lg font-medium ${getPerformanceColor(performanceImpact.braking)}`}>
              {formatPerformanceText(performanceImpact.braking)}
            </div>
          </div>
          
          <div className="bg-gray-900/40 rounded p-2 text-center">
            <div className="text-sm text-gray-400 mb-1">Visibility</div>
            <div className={`text-lg font-medium ${getPerformanceColor(performanceImpact.visibility)}`}>
              {formatPerformanceText(performanceImpact.visibility)}
            </div>
          </div>
          
          <div className="bg-gray-900/40 rounded p-2 text-center">
            <div className="text-sm text-gray-400 mb-1">Efficiency</div>
            <div className={`text-lg font-medium ${getPerformanceColor(performanceImpact.efficiency)}`}>
              {formatPerformanceText(performanceImpact.efficiency)}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button 
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center justify-center"
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
          >
            {showDetailedAnalysis ? 'Hide Details' : 'Show Detailed Analysis'}
            {showDetailedAnalysis ? 
              <ArrowUp className="h-4 w-4 ml-2" /> : 
              <ArrowDown className="h-4 w-4 ml-2" />
            }
          </button>
        </div>
      </div>
      
      {/* System Status Reports */}
      {systemStatusReports.length > 0 && (
        <div className="bg-black/40 rounded-lg p-4 border border-blue-900/30 mb-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Info className="h-5 w-5 text-blue-400 mr-2" />
            Vehicle Systems Status
          </h3>
          
          <div className="space-y-4">
            {systemStatusReports.map((report, index) => (
              <div key={index} className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
                <div className="flex items-center mb-2">
                  {report.icon}
                  <span className="text-white font-medium ml-2">{report.system}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                    report.status === 'Optimal' ? 'bg-green-900/40 text-green-400' :
                    report.status === 'Caution' ? 'bg-amber-900/40 text-amber-400' :
                    report.status === 'Warning' ? 'bg-red-900/40 text-red-400' :
                    'bg-blue-900/40 text-blue-400'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-1">{report.message}</p>
                <p className="text-xs text-gray-400">{report.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Weather Adjustments */}
      <div className="bg-black/40 rounded-lg p-4 border border-blue-900/30 mb-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <Sliders className="h-5 w-5 text-blue-400 mr-2" />
          Weather-Based Adjustments
        </h3>
        
        <div className="space-y-3">
          {/* Tire Pressure */}
          <div className={`bg-gray-900/40 rounded-lg p-3 border ${
            weatherAdjustments.tirePressure.adjustmentNeeded ? 'border-amber-800' : 'border-gray-800'
          }`}>
            <div className="flex items-start">
              <div className="mt-0.5">
                <Gauge className={`h-5 w-5 ${
                  weatherAdjustments.tirePressure.adjustmentNeeded ? 'text-amber-500' : 'text-gray-400'
                }`} />
              </div>
              <div className="ml-3">
                <h4 className="text-white text-sm font-medium">Tire Pressure</h4>
                <p className="text-sm text-gray-400">{weatherAdjustments.tirePressure.recommendation}</p>
                {weatherAdjustments.tirePressure.adjustmentNeeded && (
                  <div className="mt-1 text-xs">
                    <span className="text-amber-400">Adjustment: {weatherAdjustments.tirePressure.value > 0 ? '+' : ''}{weatherAdjustments.tirePressure.value} PSI</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Driving Style */}
          <div className={`bg-gray-900/40 rounded-lg p-3 border ${
            weatherAdjustments.drivingStyle.adjustmentNeeded ? 'border-amber-800' : 'border-gray-800'
          }`}>
            <div className="flex items-start">
              <div className="mt-0.5">
                <Car className={`h-5 w-5 ${
                  weatherAdjustments.drivingStyle.adjustmentNeeded ? 'text-amber-500' : 'text-gray-400'
                }`} />
              </div>
              <div className="ml-3">
                <h4 className="text-white text-sm font-medium">Driving Style</h4>
                <p className="text-sm text-gray-400">{weatherAdjustments.drivingStyle.recommendation}</p>
              </div>
            </div>
          </div>
          
          {/* Maintenance Alert */}
          {weatherAdjustments.maintenanceAlert.active && (
            <div className="bg-gray-900/40 rounded-lg p-3 border border-red-800">
              <div className="flex items-start">
                <div className="mt-0.5">
                  <Wrench className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <h4 className="text-white text-sm font-medium">Maintenance Alert</h4>
                  <p className="text-sm text-red-400">{weatherAdjustments.maintenanceAlert.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Detailed Analysis (optional) */}
      {showDetailedAnalysis && (
        <div className="space-y-6">
          {/* Performance Forecast Chart */}
          <div className="bg-black/40 rounded-lg p-4 border border-blue-900/30">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <BarChart2 className="h-5 w-5 text-blue-400 mr-2" />
              12-Hour Performance Forecast
            </h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fill: '#A0AEC0' }}
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis yAxisId="left" orientation="left" tick={{ fill: '#A0AEC0' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#A0AEC0' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A202C', 
                      borderColor: '#2D3748',
                      color: '#CBD5E0'
                    }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#F56565" 
                    name="Temperature (°F)"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#4299E1" 
                    activeDot={{ r: 8 }}
                    name="Performance Score"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-sm text-gray-400 mt-3">
              This chart shows predicted vehicle performance over the next 12 hours based on 
              forecasted temperature changes and current vehicle configuration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherVehicleImpactAnalyzer;