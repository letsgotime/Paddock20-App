import React, { useState } from 'react';
import { Car, Clock, X, ArrowRight, CalendarClock, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { useWeather } from '../hooks/useWeather';

/**
 * CommuteTimeEstimator - Provides drive time analysis based on weather impact
 * This is the parent component for the Tire Strategy component
 */
const CommuteTimeEstimator = () => {
  const { activeLocationData } = useLocation();
  const { currentWeather, isLoading } = useWeather();
  const [expanded, setExpanded] = useState(false);
  const [routes, setRoutes] = useState([
    { id: 1, name: 'Home to Work', distance: 15, baseTime: 25, weatherImpact: 0 },
    { id: 2, name: 'Work to Gym', distance: 5, baseTime: 12, weatherImpact: 0 }
  ]);
  
  // Calculate weather impact on travel time (simulated calculation)
  const calculateWeatherImpact = () => {
    if (!currentWeather) return 0;
    
    // Factors that increase travel time
    let impactFactor = 1.0; // Base factor (no impact)
    
    // Rain/snow impact
    const weatherId = currentWeather.weather?.[0]?.id || 0;
    
    // Rain (500-599)
    if (weatherId >= 500 && weatherId < 600) {
      // Light rain
      if (weatherId < 520) {
        impactFactor += 0.15; // 15% increase
      } 
      // Moderate/heavy rain
      else {
        impactFactor += 0.3; // 30% increase
      }
    }
    
    // Snow (600-699)
    if (weatherId >= 600 && weatherId < 700) {
      // Light snow
      if (weatherId < 620) {
        impactFactor += 0.25; // 25% increase
      } 
      // Moderate/heavy snow
      else {
        impactFactor += 0.7; // 70% increase
      }
    }
    
    // Fog/mist (700-799)
    if (weatherId >= 700 && weatherId < 800) {
      impactFactor += 0.2; // 20% increase
    }
    
    // Wind impact (if wind data available)
    if (currentWeather.wind?.speed) {
      const windSpeed = currentWeather.wind.speed;
      if (windSpeed > 10) { // Above 10 m/s is strong wind
        impactFactor += 0.1; // 10% increase
      }
    }
    
    // Temperature impact (extreme temps)
    if (currentWeather.main?.temp) {
      const temp = currentWeather.main.temp;
      // Freezing/near-freezing conditions
      if (temp < 35) { // Fahrenheit
        impactFactor += 0.15; // 15% increase
      }
    }
    
    return parseFloat((impactFactor - 1).toFixed(2)); // Return as percentage increase
  };
  
  const handleExpandCollapse = () => {
    setExpanded(!expanded);
  };
  
  // Update routes with weather impact
  React.useEffect(() => {
    if (currentWeather) {
      const impact = calculateWeatherImpact();
      
      setRoutes(prevRoutes => 
        prevRoutes.map(route => ({
          ...route,
          weatherImpact: impact
        }))
      );
    }
  }, [currentWeather]);
  
  // Function to calculate estimated travel time with weather impact
  const getAdjustedTime = (route) => {
    const adjustedTime = route.baseTime * (1 + route.weatherImpact);
    return Math.round(adjustedTime);
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-20 bg-gray-700 rounded w-full mb-2"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden">
      {/* Header section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center text-blue-400">
            <Car size={16} className="mr-2" />
            Drive Time Analysis
          </h3>
          <button 
            onClick={handleExpandCollapse}
            className="text-gray-400 hover:text-white"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        
        <div className="text-sm text-gray-300">
          Current conditions for{' '}
          <span className="text-white font-medium">
            {activeLocationData?.name || 'your location'}
          </span>
          {' '}may impact drive times.
        </div>
      </div>
      
      {/* Routes list */}
      <div className="divide-y divide-gray-700/50">
        {routes.map(route => {
          const adjustedTime = getAdjustedTime(route);
          const impact = route.weatherImpact * 100; // Convert to percentage
          const hasImpact = impact > 0;
          
          return (
            <div key={route.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-white">{route.name}</div>
                <div className="text-sm text-gray-400">
                  {route.distance} {route.distance === 1 ? 'mile' : 'miles'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-300">
                    <Clock size={16} className="mr-1 text-gray-400" />
                    <span>{route.baseTime} min</span>
                  </div>
                  
                  {hasImpact && (
                    <>
                      <ArrowRight size={12} className="text-gray-500" />
                      
                      <div className="flex items-center text-gray-300">
                        <Clock size={16} className="mr-1 text-amber-400" />
                        <span>{adjustedTime} min</span>
                      </div>
                    </>
                  )}
                </div>
                
                {hasImpact && (
                  <div className="text-amber-400 text-sm">
                    +{impact}% due to weather
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Action buttons */}
      {expanded && (
        <div className="p-4 bg-gray-750 border-t border-gray-700">
          <div className="flex flex-col space-y-2">
            <button 
              className="flex items-center justify-center w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm"
            >
              <CalendarClock size={16} className="mr-2" />
              Schedule Drive Time Alert
            </button>
            <button 
              className="flex items-center justify-center w-full py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm"
              onClick={() => {
                /* Open route editor dialog */
              }}
            >
              <Car size={16} className="mr-2" />
              Add Custom Route
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
            <p>
              Weather impact calculations based on current conditions including precipitation, 
              visibility, wind, and extreme temperatures.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommuteTimeEstimator;