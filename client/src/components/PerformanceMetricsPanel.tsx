import React from 'react';

interface PerformanceMetricsProps {
  powerOutput: number;
  torqueOutput: number;
  airTemp: number;
  humidity: number;
  atmosphericPressure: number;
  altitude: number;
  windSpeed: number;
  airDensity: number;
}

const PerformanceMetricsPanel: React.FC<PerformanceMetricsProps> = ({
  powerOutput,
  torqueOutput,
  airTemp,
  humidity,
  atmosphericPressure,
  altitude,
  windSpeed,
  airDensity
}) => {
  // Calculate performance adjustments based on environmental conditions
  const calculatePowerAdjustment = () => {
    // Base power adjustment formula
    let adjustment = 0;
    
    // Temperature effect (cold air increases power, hot air decreases)
    if (airTemp < 60) {
      adjustment += (60 - airTemp) * 0.05; // Cold air benefit
    } else if (airTemp > 80) {
      adjustment -= (airTemp - 80) * 0.1; // Hot air penalty
    }
    
    // Altitude effect (higher altitude = less air density = less power)
    adjustment -= (altitude / 1000) * 3;
    
    // Humidity effect (higher humidity = less oxygen = less power)
    if (humidity > 60) {
      adjustment -= (humidity - 60) * 0.03;
    }
    
    // Air density bonus/penalty
    const normalAirDensity = 1.225; // kg/m³ at sea level in standard conditions
    const airDensityDiff = ((airDensity - normalAirDensity) / normalAirDensity) * 100;
    adjustment += airDensityDiff;
    
    return Math.max(-15, Math.min(5, adjustment)); // Cap adjustment between -15% and +5%
  };
  
  const powerAdjustment = calculatePowerAdjustment();
  const adjustedPower = Math.round(powerOutput * (1 + powerAdjustment/100));
  const adjustedTorque = Math.round(torqueOutput * (1 + (powerAdjustment * 0.7)/100));
  
  // Helper for displaying the adjustment with a sign
  const formatAdjustment = (value: number) => {
    return value >= 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };
  
  // Helper for adjustment color
  const getAdjustmentColor = (value: number) => {
    if (value >= 2) return 'text-green-500';
    if (value >= 0) return 'text-green-400';
    if (value >= -5) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  // Helper for atmospheric condition assessment
  const getAtmosphericCondition = () => {
    if (airDensity > 1.25) return 'Excellent';
    if (airDensity > 1.2) return 'Good';
    if (airDensity > 1.15) return 'Fair';
    if (airDensity > 1.1) return 'Poor';
    return 'Very Poor';
  };
  
  // Helper for atmospheric condition color
  const getAtmosphericColor = () => {
    if (airDensity > 1.25) return 'text-green-400';
    if (airDensity > 1.2) return 'text-green-300';
    if (airDensity > 1.15) return 'text-yellow-400';
    if (airDensity > 1.1) return 'text-orange-400';
    return 'text-red-400';
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <h3 className="text-blue-400 font-medium text-lg mb-4">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Power Output</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-white text-2xl font-semibold">{adjustedPower}</p>
            <p className="text-gray-400 text-sm">hp</p>
          </div>
          <div className="flex items-center mt-1">
            <p className="text-xs text-gray-400">Base: {powerOutput} hp</p>
            <p className={`ml-2 text-xs font-semibold ${getAdjustmentColor(powerAdjustment)}`}>
              {formatAdjustment(powerAdjustment)}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Torque Output</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-white text-2xl font-semibold">{adjustedTorque}</p>
            <p className="text-gray-400 text-sm">ft-lb</p>
          </div>
          <div className="flex items-center mt-1">
            <p className="text-xs text-gray-400">Base: {torqueOutput} ft-lb</p>
            <p className={`ml-2 text-xs font-semibold ${getAdjustmentColor(powerAdjustment * 0.7)}`}>
              {formatAdjustment(powerAdjustment * 0.7)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Air Density</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-white text-xl font-semibold">{airDensity.toFixed(3)}</p>
            <p className="text-gray-400 text-sm">kg/m³</p>
          </div>
          <p className={`text-sm font-medium ${getAtmosphericColor()}`}>
            {getAtmosphericCondition()}
          </p>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Atmospheric Pressure</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-white text-xl font-semibold">{atmosphericPressure}</p>
            <p className="text-gray-400 text-sm">hPa</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {altitude.toFixed(0)} ft elevation
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
          <p className="text-gray-400 text-xs">Air Temp</p>
          <p className="text-white">{airTemp}°F</p>
        </div>
        
        <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
          <p className="text-gray-400 text-xs">Humidity</p>
          <p className="text-white">{humidity}%</p>
        </div>
        
        <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
          <p className="text-gray-400 text-xs">Wind Speed</p>
          <p className="text-white">{windSpeed} mph</p>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 bg-gray-800 rounded-lg p-2">
        <p>Note: Vehicle performance varies with atmospheric conditions. Cold, dry, dense air typically improves power output.</p>
      </div>
    </div>
  );
};

export default PerformanceMetricsPanel;