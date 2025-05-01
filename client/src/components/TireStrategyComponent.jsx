import React, { useState, useEffect } from 'react';
import { Gauge, ThermometerSnowflake, Droplets, Wind, Sunset, Locate, Settings } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { useLocation } from '../hooks/useLocation';
import { useUnits } from '../hooks/useUnits';

/**
 * TireStrategyComponent - Provides F1-inspired tire recommendations based on weather conditions
 * This component goes under Drive Time Analysis (CommuteTimeEstimator)
 */
const TireStrategyComponent = () => {
  const { currentWeather, isLoading } = useWeather();
  const { activeLocationData } = useLocation();
  const { units } = useUnits();
  const [expanded, setExpanded] = useState(false);
  
  // Tire compound recommendations based on weather conditions
  const [tireCompound, setTireCompound] = useState({
    recommended: 'all-season',
    alternatives: ['winter']
  });
  
  // Determine PSI adjustments based on conditions
  const [psiAdjustments, setPsiAdjustments] = useState({
    front: 0,
    rear: 0,
    description: ''
  });
  
  // Road grip estimate (0-100%)
  const [roadGrip, setRoadGrip] = useState(85);
  
  useEffect(() => {
    if (!currentWeather) return;
    
    // Extract weather conditions from data
    const weatherId = currentWeather.weather?.[0]?.id || 800;
    const temp = currentWeather.main?.temp || 70;
    const humidity = currentWeather.main?.humidity || 50;
    const windSpeed = currentWeather.wind?.speed || 0;
    
    // Set road grip and determine recommended tire compound
    determineRoadGrip(weatherId, temp, humidity);
    determineTireCompound(weatherId, temp);
    calculatePsiAdjustments(temp, weatherId);
    
  }, [currentWeather]);
  
  // Calculate estimated road grip percentage
  const determineRoadGrip = (weatherId, temp, humidity) => {
    // Start with base grip level
    let gripLevel = 85; // Default good grip
    
    // Weather condition impacts
    // Rain conditions (500-599)
    if (weatherId >= 500 && weatherId < 600) {
      if (weatherId < 510) {
        // Light rain
        gripLevel -= 15;
      } else if (weatherId < 520) {
        // Moderate rain
        gripLevel -= 30;
      } else {
        // Heavy rain
        gripLevel -= 45;
      }
    }
    
    // Snow conditions (600-699)
    if (weatherId >= 600 && weatherId < 700) {
      if (weatherId < 610) {
        // Light snow
        gripLevel -= 30;
      } else {
        // Heavy snow
        gripLevel -= 60;
      }
    }
    
    // Fog/mist conditions (700-799)
    if (weatherId >= 700 && weatherId < 800) {
      // Fog usually means damp roads
      gripLevel -= 10;
    }
    
    // Temperature impacts
    if (temp < 32) {
      // Freezing
      gripLevel -= 25;
    } else if (temp < 45) {
      // Cold but not freezing
      gripLevel -= 15;
    } else if (temp < 65) {
      // Cool
      gripLevel -= 5;
    } else if (temp > 90) {
      // Very hot (can cause greasy roads)
      gripLevel -= 5;
    }
    
    // Humidity impacts (high humidity can make roads slippery)
    if (humidity > 90) {
      gripLevel -= 10;
    } else if (humidity > 75) {
      gripLevel -= 5;
    }
    
    // Ensure grip stays within 0-100 range
    gripLevel = Math.max(0, Math.min(100, gripLevel));
    
    setRoadGrip(gripLevel);
  };
  
  // Determine recommended tire compounds
  const determineTireCompound = (weatherId, temp) => {
    // Rain/snow conditions
    const isRaining = weatherId >= 500 && weatherId < 600;
    const isSnowing = weatherId >= 600 && weatherId < 700;
    const isFreezing = temp <= 32;
    const isCold = temp <= 45;
    const isWarm = temp >= 70;
    const isHot = temp >= 85;
    
    // Main compound determination logic
    let recommended = 'all-season';
    let alternatives = [];
    
    if (isSnowing || (isRaining && isFreezing)) {
      // Snowy or icy conditions
      recommended = 'winter';
      alternatives = ['studded', 'all-season'];
    } else if (isFreezing || (isCold && (isRaining || weatherId >= 700 && weatherId < 800))) {
      // Cold and wet or misty
      recommended = 'winter';
      alternatives = ['all-season', 'all-terrain'];
    } else if (isRaining) {
      // Rainy but not freezing
      if (weatherId >= 520) {
        // Heavy rain
        recommended = 'all-season';
        alternatives = ['touring', 'winter'];
      } else {
        // Light/moderate rain
        recommended = 'touring';
        alternatives = ['all-season', 'grand-touring'];
      }
    } else if (isCold) {
      // Cold but not wet
      recommended = 'all-season';
      alternatives = ['touring', 'winter'];
    } else if (isHot) {
      // Hot conditions
      recommended = 'summer';
      alternatives = ['grand-touring', 'performance'];
    } else if (isWarm) {
      // Warm, nice conditions
      recommended = 'grand-touring';
      alternatives = ['touring', 'performance'];
    } else {
      // Moderate/Default conditions
      recommended = 'all-season';
      alternatives = ['touring', 'grand-touring'];
    }
    
    setTireCompound({
      recommended,
      alternatives
    });
  };
  
  // Calculate PSI adjustments based on conditions
  const calculatePsiAdjustments = (temp, weatherId) => {
    let frontAdjustment = 0;
    let rearAdjustment = 0;
    let description = '';
    
    // Cold temperature adjustments
    if (temp < 32) {
      // Very cold
      frontAdjustment = 2;
      rearAdjustment = 2;
      description = 'Cold temperatures decrease tire pressure';
    } else if (temp < 45) {
      // Cold
      frontAdjustment = 1;
      rearAdjustment = 1;
      description = 'Cold temperatures slightly decrease tire pressure';
    } else if (temp > 85) {
      // Hot (increases tire pressure)
      frontAdjustment = -1;
      rearAdjustment = -1;
      description = 'Hot temperatures increase tire pressure';
    } else if (temp > 95) {
      // Very hot
      frontAdjustment = -2;
      rearAdjustment = -2;
      description = 'High temperatures significantly increase tire pressure';
    }
    
    // Wet condition adjustments
    if (weatherId >= 500 && weatherId < 600) {
      // Rain - lower pressure for more contact patch
      frontAdjustment -= 1;
      rearAdjustment -= 1;
      
      if (description) {
        description += ' and wet conditions suggest slightly lower pressure for grip';
      } else {
        description = 'Wet conditions suggest slightly lower pressure for grip';
      }
    }
    
    setPsiAdjustments({
      front: frontAdjustment,
      rear: rearAdjustment,
      description: description || 'Current conditions require no pressure adjustment'
    });
  };
  
  // Format the tire compound name for display
  const formatCompoundName = (compound) => {
    switch (compound) {
      case 'winter':
        return 'Winter';
      case 'all-season':
        return 'All-Season';
      case 'touring':
        return 'Touring';
      case 'grand-touring':
        return 'Grand Touring';
      case 'summer':
        return 'Summer';
      case 'performance':
        return 'Performance';
      case 'all-terrain':
        return 'All-Terrain';
      case 'studded':
        return 'Studded Winter';
      default:
        return compound;
    }
  };
  
  // Get the grip status text and color
  const getGripStatus = () => {
    if (roadGrip >= 80) {
      return { text: 'Excellent', color: 'text-green-400' };
    } else if (roadGrip >= 60) {
      return { text: 'Good', color: 'text-green-400' };
    } else if (roadGrip >= 40) {
      return { text: 'Moderate', color: 'text-amber-400' };
    } else if (roadGrip >= 20) {
      return { text: 'Poor', color: 'text-orange-400' };
    } else {
      return { text: 'Critical', color: 'text-red-400' };
    }
  };
  
  // Generate F1-style tires graphic with color coding
  const TireIcon = ({ compound }) => {
    let color;
    
    switch (compound) {
      case 'winter':
        color = 'bg-blue-500';
        break;
      case 'all-season':
        color = 'bg-green-500';
        break;
      case 'touring':
        color = 'bg-teal-500';
        break;
      case 'grand-touring':
        color = 'bg-purple-500';
        break;
      case 'summer':
        color = 'bg-yellow-500';
        break;
      case 'performance':
        color = 'bg-red-500';
        break;
      case 'all-terrain':
        color = 'bg-amber-600';
        break;
      case 'studded':
        color = 'bg-indigo-600';
        break;
      default:
        color = 'bg-gray-500';
    }
    
    return (
      <div className="relative">
        <div className={`w-6 h-10 ${color} rounded-full flex items-center justify-center`}>
          <div className="w-4 h-8 bg-gray-900 rounded-full"></div>
        </div>
      </div>
    );
  };
  
  if (isLoading || !currentWeather) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-6 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  const gripStatus = getGripStatus();
  
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="flex items-center text-blue-400 font-medium mb-3">
          <Settings className="mr-2 h-5 w-5" />
          Tire Strategy
        </h3>
        
        <div className="space-y-4">
          {/* Primary tire recommendation */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Recommended Compound</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TireIcon compound={tireCompound.recommended} />
                <div>
                  <div className="text-lg font-bold text-white">
                    {formatCompoundName(tireCompound.recommended)}
                  </div>
                  <div className="text-xs text-gray-400">
                    for {activeLocationData?.name || 'current'} conditions
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm mb-1">Road Grip</div>
                <div className={`font-medium ${gripStatus.color}`}>
                  {gripStatus.text} ({roadGrip}%)
                </div>
              </div>
            </div>
          </div>
          
          {/* Pressure adjustments */}
          <div className="pt-3 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Pressure Adjustments</div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Gauge size={16} className="text-gray-400" />
                <div className="text-sm text-white">Front Tires</div>
              </div>
              <div className={`text-sm font-medium ${psiAdjustments.front > 0 ? 'text-blue-400' : psiAdjustments.front < 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                {psiAdjustments.front > 0 ? `+${psiAdjustments.front}` : psiAdjustments.front} PSI
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Gauge size={16} className="text-gray-400" />
                <div className="text-sm text-white">Rear Tires</div>
              </div>
              <div className={`text-sm font-medium ${psiAdjustments.rear > 0 ? 'text-blue-400' : psiAdjustments.rear < 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                {psiAdjustments.rear > 0 ? `+${psiAdjustments.rear}` : psiAdjustments.rear} PSI
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-400 italic">
              {psiAdjustments.description}
            </div>
          </div>
          
          {/* Condition factors */}
          <div className="pt-3 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Weather Factors</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2 bg-gray-700 rounded-md">
                <ThermometerSnowflake size={14} className="text-blue-400 mb-1" />
                <div className="text-xs text-center text-white">
                  {currentWeather && currentWeather.main ? 
                    `${Math.round(currentWeather.main.temp)}°${units === 'imperial' ? 'F' : 'C'}` : 
                    'N/A'}
                </div>
              </div>
              
              <div className="flex flex-col items-center p-2 bg-gray-700 rounded-md">
                <Droplets size={14} className="text-blue-400 mb-1" />
                <div className="text-xs text-center text-white">
                  {currentWeather && currentWeather.main ? 
                    `${currentWeather.main.humidity}% Humidity` : 
                    'N/A'}
                </div>
              </div>
              
              <div className="flex flex-col items-center p-2 bg-gray-700 rounded-md">
                <Wind size={14} className="text-blue-400 mb-1" />
                <div className="text-xs text-center text-white">
                  {currentWeather && currentWeather.wind ? 
                    `${Math.round(currentWeather.wind.speed)} ${units === 'imperial' ? 'mph' : 'km/h'}` : 
                    'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded section with alternative compounds */}
      <div className="bg-gray-750 border-t border-gray-700">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-3 flex items-center justify-center text-xs text-blue-400 hover:text-blue-300"
        >
          {expanded ? 'Show Less' : 'Show Alternative Compounds'}
        </button>
      </div>
      
      {expanded && (
        <div className="p-4 bg-gray-750 border-t border-gray-700">
          <div className="text-sm text-gray-300 mb-2">Alternative Compounds</div>
          <div className="grid grid-cols-2 gap-2">
            {tireCompound.alternatives.map((compound, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-700 rounded-md">
                <TireIcon compound={compound} />
                <div className="ml-3">
                  <div className="text-sm text-white">{formatCompoundName(compound)}</div>
                  <div className="text-xs text-gray-400">
                    {index === 0 ? 'Primary alternative' : 'Secondary choice'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-400">
            <p>
              Recommendations based on weather conditions, temperature, precipitation, and road conditions.
              Consult your tire manufacturer for specific guidelines.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TireStrategyComponent;