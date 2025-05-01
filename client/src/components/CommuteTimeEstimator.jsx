import React, { useState, useEffect } from 'react';

function CommuteTimeEstimator({ weatherData, origin, destination }) {
  const [baseCommuteTime, setBaseCommuteTime] = useState(20);  // Base commute time in minutes
  const [commuteDistance, setCommuteDistance] = useState(12);  // Distance in miles
  const [showSettings, setShowSettings] = useState(false);
  
  // Update base commute time based on origin and destination
  useEffect(() => {
    if (origin && destination) {
      // In a real implementation, we would calculate the distance and time
      // using a service like Google Maps Distance Matrix API
      
      // For now, let's simulate with a simple calculation
      // We'll use a mock speed of 35 mph for the calculation
      // Normally we'd calculate this based on actual route data
      
      // Rough approximation of distance between locations using Haversine formula
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 3958.8; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
      
      const distance = calculateDistance(
        origin.coords.lat, 
        origin.coords.lon, 
        destination.coords.lat, 
        destination.coords.lon
      );
      
      setCommuteDistance(Math.round(distance));
      
      // Estimate time at 35 mph average
      const timeInHours = distance / 35;
      setBaseCommuteTime(Math.round(timeInHours * 60));
    }
  }, [origin, destination]);

  // Calculate adjusted commute time based on weather conditions
  const calculateAdjustedCommuteTime = () => {
    if (!weatherData) return { time: 0, factor: 1, factors: [] };

    const factors = [];
    let totalFactor = 1;  // Default multiplier

    // Weather condition impact
    const weatherCondition = weatherData.currentConditions.weather[0].main.toLowerCase();
    let weatherFactor = 1;
    
    if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
      weatherFactor = 1.25;  // 25% longer in rain
      factors.push({ name: 'Rain', impact: '+25%' });
    } else if (weatherCondition.includes('snow')) {
      weatherFactor = 1.75;  // 75% longer in snow
      factors.push({ name: 'Snow', impact: '+75%' });
    } else if (weatherCondition.includes('fog') || weatherCondition.includes('mist')) {
      weatherFactor = 1.3;  // 30% longer in fog
      factors.push({ name: 'Fog/Mist', impact: '+30%' });
    } else if (weatherCondition.includes('thunder')) {
      weatherFactor = 1.4;  // 40% longer in thunderstorms
      factors.push({ name: 'Thunderstorm', impact: '+40%' });
    }
    
    totalFactor *= weatherFactor;
    
    // Grip impact
    const gripIndex = weatherData.drivingConditions?.grip_index || 100;
    let gripFactor = 1;
    
    if (gripIndex < 40) {
      gripFactor = 1.4;  // 40% longer with very poor grip
      factors.push({ name: 'Poor Surface Grip', impact: '+40%' });
    } else if (gripIndex < 60) {
      gripFactor = 1.25;  // 25% longer with poor grip
      factors.push({ name: 'Reduced Surface Grip', impact: '+25%' });
    } else if (gripIndex < 80) {
      gripFactor = 1.1;  // 10% longer with moderate grip
      factors.push({ name: 'Moderate Surface Grip', impact: '+10%' });
    }
    
    totalFactor *= gripFactor;
    
    // Traffic impact based on weather
    // In bad weather, we assume more traffic congestion
    let trafficFactor = 1;
    if (weatherFactor > 1.2) {
      trafficFactor = 1.15;  // Additional 15% for traffic in bad weather
      factors.push({ name: 'Increased Traffic', impact: '+15%' });
    }
    
    totalFactor *= trafficFactor;
    
    // Visibility impact
    const visibility = weatherData.currentConditions?.visibility || 10000;
    let visibilityFactor = 1;
    
    if (visibility < 1000) {
      visibilityFactor = 1.35;  // 35% longer with very poor visibility
      factors.push({ name: 'Poor Visibility', impact: '+35%' });
    } else if (visibility < 3000) {
      visibilityFactor = 1.2;  // 20% longer with reduced visibility
      factors.push({ name: 'Reduced Visibility', impact: '+20%' });
    } else if (visibility < 5000) {
      visibilityFactor = 1.1;  // 10% longer with moderate visibility
      factors.push({ name: 'Moderate Visibility', impact: '+10%' });
    }
    
    totalFactor *= visibilityFactor;
    
    // Wind impact
    const windSpeed = weatherData.currentConditions?.wind_speed || 0;
    let windFactor = 1;
    
    if (windSpeed > 25) {
      windFactor = 1.15;  // 15% longer in high winds
      factors.push({ name: 'High Winds', impact: '+15%' });
    } else if (windSpeed > 15) {
      windFactor = 1.05;  // 5% longer in moderate winds
      factors.push({ name: 'Moderate Winds', impact: '+5%' });
    }
    
    totalFactor *= windFactor;
    
    // Time of day adjustment
    const time = new Date();
    const hour = time.getHours();
    let timeOfDayFactor = 1;
    
    // Rush hours: 7-9 AM and 4-6 PM
    if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
      timeOfDayFactor = 1.3;  // 30% longer during rush hour
      factors.push({ name: 'Rush Hour', impact: '+30%' });
    }
    
    totalFactor *= timeOfDayFactor;
    
    // Calculate adjusted time
    const adjustedTime = Math.round(baseCommuteTime * totalFactor);
    
    return {
      time: adjustedTime,
      factor: totalFactor,
      factors: factors
    };
  };

  const commuteEstimate = calculateAdjustedCommuteTime();
  const timeImpact = commuteEstimate.time - baseCommuteTime;
  const formattedImpact = timeImpact >= 0 ? `+${timeImpact}` : timeImpact;
  
  // Calculate ETA
  const now = new Date();
  const eta = new Date(now.getTime() + (commuteEstimate.time * 60 * 1000));
  const formattedETA = eta.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  // Calculate average speed with weather conditions
  const averageSpeed = Math.round(commuteDistance / (commuteEstimate.time / 60));

  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center">
          <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
          DRIVE TIME ANALYSIS
        </h3>
        <button 
          className="text-xs text-gray-400 hover:text-white"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? "Close" : "Configure"}
        </button>
      </div>
      
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-900/60 rounded-md">
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Baseline Drive Time (min)</label>
            <input 
              type="number" 
              className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-sm"
              value={baseCommuteTime}
              onChange={(e) => setBaseCommuteTime(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Distance (miles)</label>
            <input 
              type="number" 
              className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-sm"
              value={commuteDistance}
              onChange={(e) => setCommuteDistance(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Current Route</div>
            
            {origin && destination ? (
              <div className="bg-gray-800 p-2 rounded text-sm">
                <div className="flex items-center mb-1">
                  <span className="text-indigo-400 mr-2">🏁</span>
                  <span>From: <span className="font-medium">{origin.name}</span></span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-400 mr-2">🏁</span>
                  <span>To: <span className="font-medium">{destination.name}</span></span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                Select an origin and destination from the Location Manager to calculate route details.
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-400">Estimated Travel Time</div>
          <div className="flex items-baseline">
            <div className="text-2xl font-bold">{commuteEstimate.time}</div>
            <div className="text-sm ml-1">min</div>
            <div className={`ml-2 text-sm ${timeImpact > 0 ? 'text-amber-500' : 'text-green-500'}`}>
              {formattedImpact} min
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">ETA</div>
          <div className="text-xl font-bold">{formattedETA}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700/40 rounded p-2">
          <div className="text-xs text-gray-400">Average Speed</div>
          <div className="text-lg font-semibold">{averageSpeed} mph</div>
        </div>
        <div className="bg-gray-700/40 rounded p-2">
          <div className="text-xs text-gray-400">Weather Impact</div>
          <div className={`text-lg font-semibold ${
            commuteEstimate.factor > 1.3 ? 'text-amber-500' : 
            commuteEstimate.factor > 1.1 ? 'text-yellow-500' : 
            'text-green-500'
          }`}>
            {Math.round((commuteEstimate.factor - 1) * 100)}%
          </div>
        </div>
      </div>
      
      {commuteEstimate.factors.length > 0 && (
        <div className="text-xs">
          <div className="text-gray-400 mb-1">Factors affecting commute:</div>
          <div className="space-y-1">
            {commuteEstimate.factors.map((factor, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{factor.name}</span>
                <span className="text-amber-500">{factor.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CommuteTimeEstimator;