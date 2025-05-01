import React, { useState } from 'react';
import { Gauge, Droplets, ThermometerSun, Wind, Snowflake, CloudRain } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { useUnits } from '../hooks/useUnits';

/**
 * DriveModeRecommendations - Recommends vehicle drive modes based on weather conditions
 */
const DriveModeRecommendations = () => {
  const { currentWeather, isLoading } = useWeather();
  const { units } = useUnits();
  const [expanded, setExpanded] = useState(false);
  
  if (isLoading || !currentWeather) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-24 bg-gray-700 rounded w-full"></div>
      </div>
    );
  }
  
  // Get weather condition details
  const temp = currentWeather.main?.temp || 0;
  const humidity = currentWeather.main?.humidity || 0;
  const weatherId = currentWeather.weather?.[0]?.id || 800;
  const windSpeed = currentWeather.wind?.speed || 0;
  
  // Determine road condition based on weather
  const hasRain = weatherId >= 500 && weatherId < 600;
  const hasSnow = weatherId >= 600 && weatherId < 700;
  const hasFog = weatherId >= 700 && weatherId < 750;
  
  // Determine recommendation factors
  const isWet = hasRain || hasSnow;
  const isSlippery = hasSnow || (hasRain && temp < 40);
  const isCold = temp < 40;
  const isHot = temp > 85;
  const isWindy = windSpeed > 15;
  
  // Determine recommended drive mode
  let recommendedMode;
  let modeDescription;
  let priorityFeatures = [];
  
  if (isSlippery) {
    recommendedMode = "Snow/Winter";
    modeDescription = "Maximum traction control and stability for slippery conditions.";
    priorityFeatures = ["Traction Control", "Stability Control", "Reduced Throttle Response"];
  } else if (isWet && !isSlippery) {
    recommendedMode = "Wet/Rain";
    modeDescription = "Enhanced grip and safety for wet road conditions.";
    priorityFeatures = ["Traction Control", "Anti-lock Braking", "Moderate Throttle"];
  } else if (isWindy) {
    recommendedMode = "Comfort";
    modeDescription = "Reduced sensitivity for better control in windy conditions.";
    priorityFeatures = ["Stability Control", "Smooth Steering", "Wind Compensation"];
  } else if (isCold) {
    recommendedMode = "Eco/Winter";
    modeDescription = "Gentle power delivery while the vehicle warms up.";
    priorityFeatures = ["Fuel Efficiency", "Reduced Power", "Smooth Acceleration"];
  } else if (isHot) {
    recommendedMode = "Eco/Comfort";
    modeDescription = "Reduced strain on engine and drivetrain in hot conditions.";
    priorityFeatures = ["Cooling Priority", "Reduced Power", "Efficiency"];
  } else {
    recommendedMode = "Normal/Sport";
    modeDescription = "Standard driving dynamics for optimal performance.";
    priorityFeatures = ["Balanced Power", "Standard Responsiveness", "Efficiency"];
  }
  
  // Weather condition indicators
  const getConditionSeverity = (condition) => {
    if (condition === 'temp') {
      if (temp < 32) return 'severe';
      if (temp < 40 || temp > 90) return 'moderate';
      return 'good';
    }
    
    if (condition === 'rain') {
      if (!hasRain) return 'good';
      if (weatherId >= 500 && weatherId < 510) return 'moderate';
      if (weatherId >= 510) return 'severe';
    }
    
    if (condition === 'snow') {
      if (!hasSnow) return 'good';
      if (weatherId >= 600 && weatherId < 610) return 'moderate';
      if (weatherId >= 610) return 'severe';
    }
    
    if (condition === 'wind') {
      if (windSpeed < 10) return 'good';
      if (windSpeed < 20) return 'moderate';
      return 'severe';
    }
    
    if (condition === 'visibility') {
      if (!hasFog) return 'good';
      return 'moderate';
    }
    
    return 'good';
  };
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'severe': return 'text-red-400';
      case 'moderate': return 'text-amber-400';
      case 'good': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };
  
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-blue-400 font-medium mb-4 flex items-center">
          <Gauge className="mr-2 h-5 w-5" />
          Recommended Drive Mode
        </h3>
        
        <div className="mb-6">
          <div className="text-xl font-bold text-white mb-1">{recommendedMode}</div>
          <p className="text-sm text-gray-300">{modeDescription}</p>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-300 mb-2">Priority Features</div>
          <div className="flex flex-wrap gap-2">
            {priorityFeatures.map((feature, index) => (
              <div key={index} className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded-md">
                {feature}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-300 mb-2">Weather Conditions</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-center">
              <ThermometerSun className={`mr-2 h-4 w-4 ${getSeverityColor(getConditionSeverity('temp'))}`} />
              <span className="text-xs text-gray-300">{Math.round(temp)}°{units === 'imperial' ? 'F' : 'C'}</span>
            </div>
            <div className="flex items-center">
              <CloudRain className={`mr-2 h-4 w-4 ${getSeverityColor(getConditionSeverity('rain'))}`} />
              <span className="text-xs text-gray-300">{hasRain ? 'Rain' : 'No Rain'}</span>
            </div>
            <div className="flex items-center">
              <Snowflake className={`mr-2 h-4 w-4 ${getSeverityColor(getConditionSeverity('snow'))}`} />
              <span className="text-xs text-gray-300">{hasSnow ? 'Snow/Ice' : 'No Snow'}</span>
            </div>
            <div className="flex items-center">
              <Wind className={`mr-2 h-4 w-4 ${getSeverityColor(getConditionSeverity('wind'))}`} />
              <span className="text-xs text-gray-300">{Math.round(windSpeed)} {units === 'imperial' ? 'mph' : 'km/h'}</span>
            </div>
            <div className="flex items-center">
              <Droplets className={`mr-2 h-4 w-4 ${humidity > 80 ? 'text-amber-400' : 'text-green-400'}`} />
              <span className="text-xs text-gray-300">{humidity}% Humidity</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-750 border-t border-gray-700">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs flex items-center justify-center w-full text-blue-400 hover:text-blue-300"
        >
          {expanded ? 'Show Less' : 'See Compatible Vehicle Modes'}
        </button>
      </div>
      
      {expanded && (
        <div className="p-4 bg-gray-750 border-t border-gray-700">
          <div className="text-sm font-medium text-gray-300 mb-2">Common Vehicle Mode Names</div>
          <div className="space-y-2">
            <div className="p-2 bg-gray-700 rounded-md">
              <div className="font-medium text-white text-sm">Toyota/Lexus</div>
              <div className="text-gray-300 text-xs mt-1">
                {isSlippery ? 'Snow Mode' : isWet ? 'Eco Mode' : 'Normal/Sport Mode'}
              </div>
            </div>
            <div className="p-2 bg-gray-700 rounded-md">
              <div className="font-medium text-white text-sm">BMW</div>
              <div className="text-gray-300 text-xs mt-1">
                {isSlippery ? 'xDrive Snow' : isWet ? 'Adaptive/Comfort' : 'Comfort/Sport'}
              </div>
            </div>
            <div className="p-2 bg-gray-700 rounded-md">
              <div className="font-medium text-white text-sm">Tesla</div>
              <div className="text-gray-300 text-xs mt-1">
                {isSlippery ? 'Chill Mode + Slip Start' : isWet ? 'Chill Mode' : 'Standard Mode'}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400 italic">
            Note: Consult your vehicle's manual for exact mode names and features.
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveModeRecommendations;