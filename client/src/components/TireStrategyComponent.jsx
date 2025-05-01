import React, { useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import { useLocation } from '../hooks/useLocation';
import { useUnits } from '../hooks/useUnits';
import { ChevronDown, ChevronUp, ThermometerSun, Droplets, Wind, Snowflake } from 'lucide-react';

/**
 * TireStrategyComponent - Displays tire recommendations based on current weather conditions
 * This component is designed to go under the Drive Time Analysis section
 */
const TireStrategyComponent = () => {
  const { currentWeather, isLoading } = useWeather();
  const { activeLocationData } = useLocation();
  const { units } = useUnits();
  const [expanded, setExpanded] = useState(false);
  
  // Default tire information for different conditions
  const tireTypes = {
    dry: {
      name: 'Performance/Summer Tires',
      description: 'Ideal for warm, dry conditions. Provides maximum grip on dry surfaces.',
      temperatureRange: 'Above 45°F (7°C)',
      characteristics: ['Excellent dry grip', 'Short braking distances', 'Lower rolling resistance', 'Poor performance in cold/wet']
    },
    allSeason: {
      name: 'All-Season Tires',
      description: 'Good for moderate weather conditions. Balances performance across various conditions.',
      temperatureRange: '25°F to 90°F (-4°C to 32°C)',
      characteristics: ['Good year-round performance', 'Moderate wet grip', 'Acceptable snow traction', 'Compromise in extreme conditions']
    },
    wet: {
      name: 'Wet/All-Season Tires',
      description: 'Engineered for improved performance in wet conditions with deeper tread patterns.',
      temperatureRange: '40°F to 85°F (4°C to 29°C)',
      characteristics: ['Excellent hydroplaning resistance', 'Good wet braking', 'Improved handling in rain', 'Reduced dry performance']
    },
    winter: {
      name: 'Winter/Snow Tires',
      description: 'Specially designed for cold temperatures and snow/ice conditions.',
      temperatureRange: 'Below 45°F (7°C)',
      characteristics: ['Superior snow and ice traction', 'Flexible in cold temperatures', 'Better cold weather braking', 'Poor warm weather performance']
    }
  };
  
  // Determine recommended tire type based on weather conditions
  const getTireRecommendation = () => {
    if (!currentWeather) return tireTypes.allSeason;
    
    const temp = units === 'imperial' 
      ? currentWeather.main.temp 
      : (currentWeather.main.temp * 9/5) + 32; // Convert to Fahrenheit for evaluation
    
    const hasSnow = currentWeather.weather?.[0]?.id >= 600 && currentWeather.weather?.[0]?.id < 700;
    const isRaining = currentWeather.weather?.[0]?.id >= 500 && currentWeather.weather?.[0]?.id < 600;
    const roadCondition = currentWeather.rain ? 'wet' : 'dry';
    
    // Decision tree for tire recommendation
    if (hasSnow || temp < 45) {
      return tireTypes.winter;
    } else if (isRaining || roadCondition === 'wet') {
      return tireTypes.wet;
    } else if (temp > 45 && roadCondition === 'dry') {
      return tireTypes.dry;
    } else {
      return tireTypes.allSeason;
    }
  };
  
  const recommendedTire = getTireRecommendation();
  
  // Weather factors that affect tire performance
  const getTirePerformanceFactors = () => {
    if (!currentWeather) return [];
    
    const temp = currentWeather.main.temp;
    const tempF = units === 'imperial' ? temp : (temp * 9/5) + 32;
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind?.speed || 0;
    
    const factors = [];
    
    // Temperature impact
    if (tempF < 32) {
      factors.push({
        factor: 'Temperature',
        icon: <Snowflake size={16} className="text-blue-400" />,
        value: `${Math.round(temp)}${units === 'imperial' ? '°F' : '°C'}`,
        impact: 'Cold temperatures reduce tire flexibility and grip'
      });
    } else if (tempF > 85) {
      factors.push({
        factor: 'Temperature',
        icon: <ThermometerSun size={16} className="text-red-400" />,
        value: `${Math.round(temp)}${units === 'imperial' ? '°F' : '°C'}`,
        impact: 'High temperatures may cause overheating and increased wear'
      });
    } else {
      factors.push({
        factor: 'Temperature',
        icon: <ThermometerSun size={16} className="text-green-400" />,
        value: `${Math.round(temp)}${units === 'imperial' ? '°F' : '°C'}`,
        impact: 'Optimal temperature range for most tires'
      });
    }
    
    // Humidity impact
    if (humidity > 80) {
      factors.push({
        factor: 'Humidity',
        icon: <Droplets size={16} className="text-blue-400" />,
        value: `${humidity}%`,
        impact: 'High humidity increases risk of hydroplaning'
      });
    } else {
      factors.push({
        factor: 'Humidity',
        icon: <Droplets size={16} className="text-green-400" />,
        value: `${humidity}%`,
        impact: 'Moderate humidity has minimal impact on tire performance'
      });
    }
    
    // Wind impact
    if (windSpeed > 15) {
      factors.push({
        factor: 'Wind',
        icon: <Wind size={16} className="text-yellow-400" />,
        value: `${Math.round(windSpeed)} ${units === 'imperial' ? 'mph' : 'km/h'}`,
        impact: 'Strong crosswinds may affect vehicle stability'
      });
    } else {
      factors.push({
        factor: 'Wind',
        icon: <Wind size={16} className="text-green-400" />,
        value: `${Math.round(windSpeed)} ${units === 'imperial' ? 'mph' : 'km/h'}`,
        impact: 'Light winds have minimal impact on vehicle stability'
      });
    }
    
    return factors;
  };
  
  const tireFactors = getTirePerformanceFactors();
  
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden">
      {/* Main overview section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-blue-400">Tire Strategy</h3>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Show less" : "Show more"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        
        <div className="text-lg font-medium mb-1 text-white">{recommendedTire.name}</div>
        <p className="text-sm text-gray-300 mb-3">{recommendedTire.description}</p>
        
        <div className="text-xs text-gray-400 mb-2">
          <span className="font-medium">Recommended Temperature Range:</span> {recommendedTire.temperatureRange}
        </div>
        
        <div className="h-1 w-full bg-gray-700 rounded-full mb-3">
          <div className="h-1 bg-blue-500 rounded-full w-3/4"></div>
        </div>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Tire Characteristics</h4>
          <ul className="mb-4 space-y-1">
            {recommendedTire.characteristics.map((item, index) => (
              <li key={index} className="text-xs text-gray-400 flex items-center">
                <span className="mr-2 text-blue-400">•</span>
                {item}
              </li>
            ))}
          </ul>
          
          <h4 className="text-sm font-medium text-gray-300 mb-2">Current Weather Impact</h4>
          <div className="space-y-2">
            {tireFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <span className="mr-2">{factor.icon}</span>
                  <span className="text-gray-300">{factor.factor}:</span>
                </div>
                <div className="text-gray-400">{factor.value}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              {tireFactors.map((factor, index) => (
                <div key={index} className="mb-1">
                  <span className="inline-block w-4 mr-1">{factor.icon}</span>
                  <span>{factor.impact}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-500 italic">
              Note: This recommendation is based on general weather conditions. Check your vehicle's manual for specific tire requirements.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TireStrategyComponent;