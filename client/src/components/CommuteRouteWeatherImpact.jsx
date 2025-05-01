import React, { useState, useEffect } from 'react';

const CommuteRouteWeatherImpact = ({ origin, destination, weatherData }) => {
  const [routeSegments, setRouteSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalImpact, setTotalImpact] = useState({
    severity: 0,
    timeImpact: 0
  });
  
  // Simulate fetching route data
  useEffect(() => {
    if (!origin || !destination) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // In a real app, we would call a routing API like Mapbox or Google
    // For this prototype, we'll simulate route segments
    setTimeout(() => {
      // This would normally come from the API
      const simulatedRouteSegments = [
        {
          id: 1,
          name: "Neighborhood streets",
          distance: 1.2,
          duration: 3, // minutes
          coordinates: {
            start: { lat: origin.coordinates.lat, lon: origin.coordinates.lon },
            end: { lat: origin.coordinates.lat + 0.01, lon: origin.coordinates.lon + 0.01 }
          }
        },
        {
          id: 2,
          name: "Main boulevard",
          distance: 3.5,
          duration: 7, // minutes
          coordinates: {
            start: { lat: origin.coordinates.lat + 0.01, lon: origin.coordinates.lon + 0.01 },
            end: { lat: origin.coordinates.lat + 0.02, lon: origin.coordinates.lon + 0.03 }
          }
        },
        {
          id: 3,
          name: "Highway section",
          distance: 8.7,
          duration: 9, // minutes
          coordinates: {
            start: { lat: origin.coordinates.lat + 0.02, lon: origin.coordinates.lon + 0.03 },
            end: { lat: destination.coordinates.lat - 0.01, lon: destination.coordinates.lon - 0.01 }
          }
        },
        {
          id: 4,
          name: "Downtown area",
          distance: 1.5,
          duration: 5, // minutes
          coordinates: {
            start: { lat: destination.coordinates.lat - 0.01, lon: destination.coordinates.lon - 0.01 },
            end: { lat: destination.coordinates.lat, lon: destination.coordinates.lon }
          }
        }
      ];
      
      // Calculate weather impact for each segment
      const segmentsWithWeather = simulatedRouteSegments.map(segment => {
        // In a real app, we would get weather for each segment's coordinates
        // For now, using the base weather data and generating random variations
        const segmentImpact = calculateSegmentWeatherImpact(segment, weatherData);
        return {
          ...segment,
          weatherImpact: segmentImpact
        };
      });
      
      // Set route data
      setRouteSegments(segmentsWithWeather);
      
      // Calculate total impact
      const overallImpact = calculateTotalImpact(segmentsWithWeather);
      setTotalImpact(overallImpact);
      
      setLoading(false);
    }, 500); // Fake loading time
  }, [origin, destination, weatherData]);
  
  // Calculate weather impact for one segment
  const calculateSegmentWeatherImpact = (segment, weatherData) => {
    if (!weatherData) {
      return { severity: 0, description: "No data available", timeAddition: 0 };
    }
    
    // This is where we would analyze actual weather data along the route
    // For this prototype, we'll use the base data with some random variation
    
    // Get base weather conditions
    const weatherCondition = weatherData.currentConditions?.weather[0]?.main?.toLowerCase() || '';
    const isRaining = weatherCondition.includes('rain') || weatherCondition.includes('drizzle');
    const isSnowing = weatherCondition.includes('snow');
    const isFoggy = weatherCondition.includes('fog') || weatherCondition.includes('mist');
    const isThunderstorm = weatherCondition.includes('thunder');
    const temperature = weatherData.currentConditions?.temp || 70;
    const windSpeed = weatherData.currentConditions?.wind_speed || 0;
    const visibility = weatherData.currentConditions?.visibility || 10000;
    
    // Calculate severity (0-100)
    let severity = 0;
    let description = "Good driving conditions";
    let timeAddition = 0; // percentage increase in driving time
    
    // Apply random variation by segment (±15%)
    const variationFactor = 0.85 + (Math.random() * 0.3);
    
    // Weather condition impacts
    if (isRaining) {
      // Different road types are affected differently by rain
      if (segment.name.includes("Highway")) {
        severity += 20 * variationFactor;
        timeAddition += 15 * variationFactor;
        description = "Wet roads, reduced visibility";
      } else {
        severity += 30 * variationFactor;
        timeAddition += 25 * variationFactor;
        description = "Standing water possible";
      }
    }
    
    if (isSnowing) {
      // Snow has higher impact on all roads
      severity += 60 * variationFactor;
      timeAddition += 70 * variationFactor;
      description = "Hazardous snow conditions";
    }
    
    if (isFoggy) {
      // Fog impacts highways more
      if (segment.name.includes("Highway")) {
        severity += 40 * variationFactor;
        timeAddition += 35 * variationFactor;
        description = "Dense fog, reduced visibility";
      } else {
        severity += 25 * variationFactor;
        timeAddition += 20 * variationFactor;
        description = "Foggy conditions";
      }
    }
    
    if (isThunderstorm) {
      severity += 50 * variationFactor;
      timeAddition += 45 * variationFactor;
      description = "Severe weather, use caution";
    }
    
    // Temperature impacts (extreme temps affect roads)
    if (temperature > 95) {
      severity += 10 * variationFactor;
      timeAddition += 5 * variationFactor;
      description = "Hot conditions, watch for tire pressure";
    } else if (temperature < 32) {
      severity += 40 * variationFactor;
      description = "Possible ice on roads";
      timeAddition += 35 * variationFactor;
    }
    
    // Wind impacts (primarily affects highways)
    if (windSpeed > 20) {
      if (segment.name.includes("Highway")) {
        severity += 15 * variationFactor;
        timeAddition += 10 * variationFactor;
        description = "High winds, crosswind risk";
      }
    }
    
    // Visibility impacts
    if (visibility < 5000) {
      severity += 25 * variationFactor;
      timeAddition += 20 * variationFactor;
      description = "Poor visibility conditions";
    }
    
    // Cap severity at 100
    severity = Math.min(100, Math.round(severity));
    timeAddition = Math.round(timeAddition);
    
    // If no severe conditions, provide basic assessment
    if (severity < 10) {
      description = "Ideal driving conditions";
    } else if (severity < 30) {
      description = "Good driving conditions";
    }
    
    return { severity, description, timeAddition };
  };
  
  // Calculate the overall route impact
  const calculateTotalImpact = (segments) => {
    if (!segments.length) return { severity: 0, timeImpact: 0 };
    
    let totalDuration = 0;
    let weightedSeverity = 0;
    let weightedTimeImpact = 0;
    
    segments.forEach(segment => {
      totalDuration += segment.duration;
      weightedSeverity += segment.weatherImpact.severity * segment.duration;
      weightedTimeImpact += segment.weatherImpact.timeAddition * segment.duration;
    });
    
    // Calculate weighted averages
    const overallSeverity = Math.round(weightedSeverity / totalDuration);
    const overallTimeImpact = Math.round(weightedTimeImpact / totalDuration);
    
    return { severity: overallSeverity, timeImpact: overallTimeImpact };
  };
  
  // Determine severity color
  const getSeverityColor = (severity) => {
    if (severity >= 75) return 'bg-red-500';
    if (severity >= 50) return 'bg-orange-500';
    if (severity >= 25) return 'bg-yellow-500';
    if (severity >= 10) return 'bg-blue-500';
    return 'bg-green-500';
  };
  
  // Render segment impact
  const renderSegmentImpact = (segment) => {
    const impact = segment.weatherImpact;
    
    return (
      <div key={segment.id} className="border-b border-gray-700 py-2 last:border-0">
        <div className="flex justify-between items-start mb-1">
          <div className="font-medium text-sm">{segment.name}</div>
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-1 ${getSeverityColor(impact.severity)}`}></div>
            <span className="text-xs">{impact.severity}%</span>
          </div>
        </div>
        
        <div className="flex justify-between text-xs">
          <div className="text-gray-400">
            {segment.distance.toFixed(1)} mi • {segment.duration} min
            {impact.timeAddition > 0 && (
              <span className="text-amber-400 ml-1">+{impact.timeAddition}%</span>
            )}
          </div>
          <div className={
            impact.severity >= 75 ? 'text-red-400' :
            impact.severity >= 50 ? 'text-orange-400' :
            impact.severity >= 25 ? 'text-yellow-400' :
            'text-green-400'
          }>
            {impact.description}
          </div>
        </div>
      </div>
    );
  };
  
  // Calculate total time with weather impacts
  const calculateTotalTime = () => {
    let baseTime = 0;
    let impactedTime = 0;
    
    routeSegments.forEach(segment => {
      baseTime += segment.duration;
      impactedTime += segment.duration * (1 + segment.weatherImpact.timeAddition / 100);
    });
    
    return {
      base: Math.round(baseTime),
      impacted: Math.round(impactedTime),
      difference: Math.round(impactedTime - baseTime)
    };
  };
  
  // Get route times
  const routeTimes = !loading && routeSegments.length > 0 ? calculateTotalTime() : { base: 0, impacted: 0, difference: 0 };
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
        <span className="h-2 w-2 bg-amber-500 rounded-full mr-2"></span>
        ROUTE WEATHER IMPACT
      </h3>
      
      {!origin || !destination ? (
        <div className="text-center text-gray-400 py-4">
          <p>Select origin and destination locations to see weather impacts along your route.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Route overview */}
          <div className="bg-gray-900/60 rounded-lg p-3 mb-3">
            <div className="flex items-center mb-2">
              <div className="text-base mr-2">🚘</div>
              <div>
                <div className="font-medium text-sm">{origin.name} → {destination.name}</div>
                <div className="text-xs text-gray-400">
                  {routeSegments.reduce((total, segment) => total + segment.distance, 0).toFixed(1)} miles • {routeTimes.base} min
                  {totalImpact.timeImpact > 0 && (
                    <span className="text-amber-400 ml-1">+{totalImpact.timeImpact}% ({routeTimes.difference} min)</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Overall weather impact */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">Overall Weather Impact:</div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 rounded-full h-1.5 mr-2">
                  <div 
                    className={`h-full rounded-full ${getSeverityColor(totalImpact.severity)}`}
                    style={{ width: `${totalImpact.severity}%` }}
                  ></div>
                </div>
                <div className={`text-xs ${
                  totalImpact.severity >= 75 ? 'text-red-400' :
                  totalImpact.severity >= 50 ? 'text-orange-400' :
                  totalImpact.severity >= 25 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {totalImpact.severity}%
                </div>
              </div>
            </div>
            
            {/* Time impact */}
            <div className="mt-2 p-2 bg-blue-900/20 border border-blue-800/30 rounded-md text-xs">
              <div className="flex justify-between mb-1">
                <span>Expected travel time:</span>
                <span className="font-medium">{routeTimes.impacted} minutes</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Normal conditions:</span>
                <span>{routeTimes.base} minutes</span>
              </div>
              {routeTimes.difference > 0 && (
                <div className="flex justify-between text-amber-400 mt-1">
                  <span>Weather delay:</span>
                  <span>+{routeTimes.difference} minutes</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Segment breakdown */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Route Segment Analysis:</div>
            <div className="space-y-1">
              {routeSegments.map(segment => renderSegmentImpact(segment))}
            </div>
          </div>
          
          {/* Weather alerts */}
          {totalImpact.severity >= 50 && (
            <div className="mt-3 p-2 bg-red-900/30 border border-red-800/30 rounded-md text-xs text-red-300">
              <span className="font-semibold">Weather Alert: </span>
              Severe weather conditions affecting your route. Consider adjusting departure time or taking an alternate route.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommuteRouteWeatherImpact;