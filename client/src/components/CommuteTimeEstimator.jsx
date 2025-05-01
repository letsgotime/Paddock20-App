import React, { useState, useEffect } from 'react';

function CommuteTimeEstimator({ weatherData, origin, destination }) {
  const [baseCommuteTime, setBaseCommuteTime] = useState(20);  // Base commute time in minutes
  const [commuteDistance, setCommuteDistance] = useState(12);  // Distance in miles
  const [showSettings, setShowSettings] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [destinationWeather, setDestinationWeather] = useState(null);
  const [isLoadingDestinationData, setIsLoadingDestinationData] = useState(false);
  
  // Fetch destination-specific weather when user selects a destination
  useEffect(() => {
    if (destination?.coords) {
      setIsLoadingDestinationData(true);
      
      // Real API call to fetch weather data for the destination
      fetch(`/api/automotive-weather?lat=${destination.coords.lat}&lon=${destination.coords.lon}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("Destination weather data received");
          setDestinationWeather(data);
        })
        .catch(err => {
          console.error("Error fetching destination weather:", err);
        })
        .finally(() => {
          setIsLoadingDestinationData(false);
        });
    } else {
      setDestinationWeather(null);
    }
  }, [destination]);
  
  // Update base commute time based on origin and destination
  useEffect(() => {
    if (origin && destination) {
      // Using Haversine formula for accurate distance calculation between coordinates
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
      
      // Calculate precise distance between locations
      const distance = calculateDistance(
        origin.coords.lat, 
        origin.coords.lon, 
        destination.coords.lat, 
        destination.coords.lon
      );
      
      setCommuteDistance(Math.round(distance * 10) / 10); // Round to 1 decimal place
      
      // Base travel time calculation using weighted average speed
      // Uses multiple base speeds based on distance to better model real-world driving
      // Short trips (< 5 miles): 25 mph average (urban, traffic lights)
      // Medium trips (5-20 miles): 35 mph average (mix of urban/highway)
      // Long trips (> 20 miles): 55 mph average (mostly highway)
      let avgSpeed;
      if (distance < 5) {
        avgSpeed = 25; // Urban driving
      } else if (distance < 20) {
        avgSpeed = 35; // Mixed driving
      } else {
        avgSpeed = 55; // Highway driving
      }
      
      const timeInHours = distance / avgSpeed;
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
                <div className="mt-2 text-xs text-gray-400">
                  Distance: {commuteDistance} miles
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

      {destination && (
        <div className="mt-4">
          <button 
            className="w-full bg-gray-700/40 hover:bg-gray-700/60 text-gray-300 py-2 px-3 rounded-md text-xs flex items-center justify-center transition-all duration-200"
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
          >
            <span className="mr-1">{showDetailedAnalysis ? "Hide" : "Show"}</span>
            Detailed Destination Analysis
            <span className="ml-1">{showDetailedAnalysis ? "▲" : "▼"}</span>
          </button>
          
          {showDetailedAnalysis && (
            <div className="mt-3 bg-gray-900/70 rounded-md p-3 text-xs border border-gray-700">
              <h4 className="font-semibold text-blue-400 mb-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {destination.name} Conditions Analysis
              </h4>
              
              {isLoadingDestinationData ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  <span className="ml-2 text-gray-400">Loading destination data...</span>
                </div>
              ) : destinationWeather ? (
                <div className="space-y-3">
                  {/* Weather Overview */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-800/80 p-2 rounded">
                      <div className="text-gray-400">Current Conditions</div>
                      <div className="font-medium">
                        {destinationWeather.currentConditions.weather[0].description}
                      </div>
                    </div>
                    <div className="bg-gray-800/80 p-2 rounded">
                      <div className="text-gray-400">Temperature</div>
                      <div className="font-medium">
                        {Math.round(destinationWeather.currentConditions.temp)}°F
                      </div>
                    </div>
                  </div>
                  
                  {/* Driving Metrics */}
                  <div>
                    <div className="text-gray-400 mb-1 border-b border-gray-700 pb-1">F1 Driving Metrics</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center">
                        <div className="mr-2 w-1 h-6 bg-gradient-to-b from-green-500 to-yellow-500 rounded-full"></div>
                        <div>
                          <div className="text-[10px] text-gray-400">Grip Index</div>
                          <div className="font-semibold">
                            {destinationWeather.drivingConditions?.grip_index || "N/A"}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 w-1 h-6 bg-gradient-to-b from-green-500 to-red-500 rounded-full"></div>
                        <div>
                          <div className="text-[10px] text-gray-400">Surface Condition</div>
                          <div className="font-semibold">
                            {destinationWeather.drivingConditions?.surface_state || "Dry"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                        <div>
                          <div className="text-[10px] text-gray-400">Visibility</div>
                          <div className="font-semibold">
                            {Math.round(destinationWeather.currentConditions.visibility / 1000)} km
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-800 rounded-full"></div>
                        <div>
                          <div className="text-[10px] text-gray-400">Wind</div>
                          <div className="font-semibold">
                            {Math.round(destinationWeather.currentConditions.wind_speed)} mph
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conditions Comparison */}
                  {weatherData && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="text-gray-400 mb-2">Route Conditions Comparison</div>
                      
                      <div className="space-y-2">
                        {/* Temperature Diff */}
                        <div className="flex justify-between items-center">
                          <div>Temperature Difference</div>
                          <div className={`font-medium ${
                            Math.abs(destinationWeather.currentConditions.temp - weatherData.currentConditions.temp) > 15
                              ? 'text-amber-500'
                              : 'text-gray-300'
                          }`}>
                            {Math.round(Math.abs(destinationWeather.currentConditions.temp - weatherData.currentConditions.temp))}°F
                          </div>
                        </div>
                        
                        {/* Weather Change */}
                        <div className="flex justify-between items-center">
                          <div>Weather Change</div>
                          <div className={`font-medium ${
                            destinationWeather.currentConditions.weather[0].main !== weatherData.currentConditions.weather[0].main
                              ? 'text-amber-500'
                              : 'text-green-500'
                          }`}>
                            {destinationWeather.currentConditions.weather[0].main !== weatherData.currentConditions.weather[0].main
                              ? `${weatherData.currentConditions.weather[0].main} → ${destinationWeather.currentConditions.weather[0].main}`
                              : 'No Change'
                            }
                          </div>
                        </div>
                        
                        {/* Grip Comparison */}
                        <div className="flex justify-between items-center">
                          <div>Grip Difference</div>
                          <div className={`font-medium ${
                            Math.abs((destinationWeather.drivingConditions?.grip_index || 100) - 
                                    (weatherData.drivingConditions?.grip_index || 100)) > 20
                              ? 'text-amber-500'
                              : 'text-green-500'
                          }`}>
                            {Math.abs((destinationWeather.drivingConditions?.grip_index || 100) - 
                                     (weatherData.drivingConditions?.grip_index || 100))}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Driver Recommendations */}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-blue-400 font-semibold mb-2">F1 Pit Wall Recommendations</div>
                    <div className="bg-blue-900/20 border border-blue-900/40 rounded p-2">
                      {destinationWeather.drivingConditions?.grip_index < 70 ? (
                        <div className="mb-1">• Adjust driving line for reduced grip at destination</div>
                      ) : (
                        <div className="mb-1">• Optimal grip conditions expected at destination</div>
                      )}
                      
                      {destinationWeather.currentConditions.visibility < 5000 ? (
                        <div className="mb-1">• Reduce speed for limited visibility conditions</div>
                      ) : null}
                      
                      {destinationWeather.currentConditions.weather[0].main.toLowerCase().includes('rain') ? (
                        <div className="mb-1">• Wet conditions at destination - prepare for reduced traction</div>
                      ) : null}
                      
                      {Math.abs(destinationWeather.currentConditions.temp - weatherData.currentConditions.temp) > 15 ? (
                        <div>• Significant temperature change on route - expect grip variations</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 py-2">
                  No destination weather data available. Try selecting a different destination.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CommuteTimeEstimator;