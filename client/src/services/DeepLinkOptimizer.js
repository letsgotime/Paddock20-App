/**
 * Deep Link Navigation Optimizer
 * 
 * This service analyzes weather conditions, expected traffic, and user preferences
 * to optimize navigation routes and parameters for external navigation apps.
 * 
 * Key features:
 * - Weather-adjusted route planning
 * - Traffic-aware departure time optimization
 * - Route customization based on vehicle type
 * - Waypoint optimization for best weather conditions
 */

import * as ExternalAppService from './ExternalAppService';

// Constants for route optimization algorithms
const WEATHER_SEVERITY_THRESHOLD = 70; // Percentage severity that triggers rerouting
const RUSH_HOUR_MORNING_START = 7; // 7:00 AM
const RUSH_HOUR_MORNING_END = 9; // 9:00 AM
const RUSH_HOUR_EVENING_START = 16; // 4:00 PM
const RUSH_HOUR_EVENING_END = 19; // 7:00 PM

/**
 * Optimize a route based on current weather conditions
 * 
 * @param {Object} routeParams - Original route parameters
 * @param {Object} weatherData - Current weather data
 * @param {Object} vehicleData - Selected vehicle data
 * @param {Object} options - Additional optimization options
 * @returns {Object} Optimized route parameters
 */
export function optimizeRouteForWeather(routeParams, weatherData, vehicleData, options = {}) {
  // Clone the original parameters to avoid modifying the input
  const optimizedParams = { ...routeParams };
  
  // Default options
  const {
    prioritizeSafety = true,
    avoidFloodRisks = true,
    avoidHighWindAreas = true,
    includeRestStops = false,
    accountForRushHour = true,
    addWeatherAlerts = true
  } = options;
  
  // If no weather data is available, return original route
  if (!weatherData || !weatherData.currentConditions) {
    console.warn('No weather data available for route optimization');
    return optimizedParams;
  }
  
  // Check for severe weather conditions
  const hasSevereWeather = checkForSevereWeather(weatherData);
  
  // Basic weather conditions
  const weatherCondition = weatherData.currentConditions.weather[0].main.toLowerCase();
  const isRaining = weatherCondition.includes('rain') || weatherCondition.includes('drizzle');
  const isSnowing = weatherCondition.includes('snow');
  const isFoggy = weatherCondition.includes('fog') || weatherCondition.includes('mist');
  const hasThunderstorm = weatherCondition.includes('thunder');
  const windSpeed = weatherData.currentConditions.wind_speed || 0;
  const visibility = weatherData.currentConditions.visibility || 10000;
  
  // Apply optimizations based on weather conditions
  
  // 1. Avoid highways in severe weather if safety is prioritized
  if (prioritizeSafety && (isSnowing || hasThunderstorm || (isRaining && windSpeed > 20))) {
    optimizedParams.avoidHighways = true;
  }
  
  // 2. Adjust travel mode based on conditions
  if (isSnowing && vehicleData && vehicleData.type !== 'suv' && vehicleData.type !== 'truck') {
    // Recommend SUV-friendly routes for non-SUV vehicles in snow
    optimizedParams.preferSuitable = true;
  }
  
  // 3. Add waypoints for rest stops on long journeys in poor conditions
  if (includeRestStops && hasSevereWeather) {
    optimizedParams.waypoints = addRestStopsToRoute(routeParams, weatherData);
  }
  
  // 4. Adjust departure time for rush hour avoidance if needed
  if (accountForRushHour) {
    optimizedParams.departureTime = optimizeDepartureTime(routeParams.departureTime, weatherData);
  }
  
  // 5. Incorporate weather alerts into the route
  if (addWeatherAlerts && weatherData.alerts && weatherData.alerts.length > 0) {
    optimizedParams.weatherAlerts = formatWeatherAlertsForNavigation(weatherData.alerts);
  }
  
  // 6. If there's an alternative route with better weather, suggest it
  const alternativeRoute = findAlternativeRouteWithBetterWeather(routeParams, weatherData);
  if (alternativeRoute) {
    optimizedParams.alternativeRoute = alternativeRoute;
  }
  
  return optimizedParams;
}

/**
 * Check if current weather conditions are severe enough to warrant route changes
 * 
 * @param {Object} weatherData - Weather data
 * @returns {Boolean} True if severe weather is present
 */
function checkForSevereWeather(weatherData) {
  // No data means we can't determine severity
  if (!weatherData || !weatherData.currentConditions) return false;
  
  const weatherCondition = weatherData.currentConditions.weather[0].main.toLowerCase();
  const windSpeed = weatherData.currentConditions.wind_speed || 0;
  const visibility = weatherData.currentConditions.visibility || 10000;
  
  // Check for various severe weather conditions
  const hasSevereRain = weatherCondition.includes('rain') && 
                        weatherData.currentConditions.rain && 
                        weatherData.currentConditions.rain['1h'] > 10; // Heavy rain
  
  const hasSnow = weatherCondition.includes('snow');
  const hasFog = weatherCondition.includes('fog') && visibility < 1000; // Low visibility fog
  const hasThunderstorm = weatherCondition.includes('thunder');
  const hasHighWinds = windSpeed > 30; // High wind threshold
  
  // Determine if any severe conditions are present
  return hasSevereRain || hasSnow || hasFog || hasThunderstorm || hasHighWinds;
}

/**
 * Add appropriate rest stops to a route based on weather conditions
 * 
 * @param {Object} routeParams - Original route parameters
 * @param {Object} weatherData - Weather data
 * @returns {Array} Waypoints to add to the route
 */
function addRestStopsToRoute(routeParams, weatherData) {
  // Start with any existing waypoints
  const waypoints = [...(routeParams.waypoints || [])];
  
  // Determine route distance (this would use a distance matrix API in production)
  // For this prototype, we'll estimate based on coordinates
  const distance = estimateDistance(
    routeParams.originLat, routeParams.originLon,
    routeParams.destLat, routeParams.destLon
  );
  
  // Add rest stops based on distance and weather severity
  const weatherSeverity = estimateWeatherSeverity(weatherData);
  
  // More severe weather = more frequent rest stops
  const restStopInterval = weatherSeverity > 70 ? 50 : // Every 50 miles in severe weather
                          weatherSeverity > 40 ? 100 : // Every 100 miles in moderate weather
                          150; // Every 150 miles in mild weather
  
  // Skip if route is too short
  if (distance < restStopInterval) return waypoints;
  
  // Calculate number of rest stops needed
  const numStops = Math.floor(distance / restStopInterval);
  
  // In a real implementation, we would use an API to find actual rest areas
  // For this prototype, we'll create estimated waypoints along the route
  for (let i = 1; i <= numStops; i++) {
    const ratio = i / (numStops + 1);
    const lat = routeParams.originLat + (routeParams.destLat - routeParams.originLat) * ratio;
    const lon = routeParams.originLon + (routeParams.destLon - routeParams.originLon) * ratio;
    
    waypoints.push({
      lat,
      lon,
      name: `Rest Stop ${i}`,
      type: 'rest'
    });
  }
  
  return waypoints;
}

/**
 * Optimize departure time based on weather and traffic conditions
 * 
 * @param {Date|null} originalDepartureTime - Original departure time or null for now
 * @param {Object} weatherData - Weather data
 * @returns {Date} Optimized departure time
 */
function optimizeDepartureTime(originalDepartureTime, weatherData) {
  // Use original time or current time if none provided
  const baseTime = originalDepartureTime || new Date();
  const optimizedTime = new Date(baseTime);
  
  // Get current hour
  const currentHour = optimizedTime.getHours();
  
  // Check if we're in or approaching rush hour
  const isRushHourMorning = currentHour >= RUSH_HOUR_MORNING_START - 1 && currentHour < RUSH_HOUR_MORNING_END;
  const isRushHourEvening = currentHour >= RUSH_HOUR_EVENING_START - 1 && currentHour < RUSH_HOUR_EVENING_END;
  
  // Check for precipitation forecast
  const hasPrecipitationNow = checkForPrecipitation(weatherData.currentConditions);
  const hasPrecipitationForecast = checkForecastForPrecipitation(weatherData);
  
  // Optimize based on conditions
  if (isRushHourMorning && hasPrecipitationNow) {
    // Delay departure to avoid worst of weather + rush hour combination
    optimizedTime.setMinutes(optimizedTime.getMinutes() + 45);
  } else if (isRushHourEvening && hasPrecipitationNow) {
    // Delay departure to avoid worst of weather + rush hour combination
    optimizedTime.setMinutes(optimizedTime.getMinutes() + 60);
  } else if (!hasPrecipitationNow && hasPrecipitationForecast) {
    // Leave earlier to beat upcoming precipitation
    optimizedTime.setMinutes(optimizedTime.getMinutes() - 30);
  }
  
  return optimizedTime;
}

/**
 * Find an alternative route with better weather conditions
 * 
 * @param {Object} routeParams - Original route parameters
 * @param {Object} weatherData - Weather data
 * @returns {Object|null} Alternative route parameters or null if none found
 */
function findAlternativeRouteWithBetterWeather(routeParams, weatherData) {
  // In a real implementation, this would call a routing API with alternatives
  // and check weather conditions along each route
  // For this prototype, we'll return a simulated alternative
  
  // Skip if weather isn't severe enough to warrant an alternative
  if (!checkForSevereWeather(weatherData)) {
    return null;
  }
  
  // Generate a simulated alternative by slightly adjusting the route
  // (In production, this would use real alternatives from a routing API)
  const altRoute = { ...routeParams };
  
  // Simulate a slight detour
  const latOffset = 0.02 * (Math.random() - 0.5);
  const lonOffset = 0.02 * (Math.random() - 0.5);
  
  if (altRoute.waypoints && altRoute.waypoints.length > 0) {
    // Add a slight variation to waypoints
    altRoute.waypoints = altRoute.waypoints.map(wp => ({
      ...wp,
      lat: wp.lat + latOffset * 0.5,
      lon: wp.lon + lonOffset * 0.5
    }));
  } else {
    // Add a new waypoint as a detour
    const midLat = (routeParams.originLat + routeParams.destLat) / 2 + latOffset;
    const midLon = (routeParams.originLon + routeParams.destLon) / 2 + lonOffset;
    
    altRoute.waypoints = [{
      lat: midLat,
      lon: midLon,
      name: "Weather detour",
      type: "detour"
    }];
  }
  
  // Add metadata about why this route is better
  altRoute.weatherAdvantage = {
    description: "This route avoids severe weather conditions",
    severity: estimateWeatherSeverity(weatherData) - 20, // Simulate better conditions
    timeImpact: -10 // 10% less weather impact on travel time
  };
  
  return altRoute;
}

/**
 * Format weather alerts for navigation systems
 * 
 * @param {Array} alerts - Weather alert data
 * @returns {Array} Formatted alerts
 */
function formatWeatherAlertsForNavigation(alerts) {
  if (!alerts || !Array.isArray(alerts)) return [];
  
  return alerts.map(alert => ({
    id: alert.id || `alert-${Date.now()}`,
    title: alert.event || "Weather Alert",
    description: alert.description || alert.message || "Check weather conditions",
    severity: alert.severity || "moderate",
    location: alert.regions || [],
    startTime: alert.start || Date.now(),
    endTime: alert.end || (Date.now() + 3600000), // 1 hour from now if no end time
    source: alert.sender_name || "Weather Service",
    impactOnRoute: estimateAlertImpactOnRoute(alert)
  }));
}

/**
 * Estimate the impact of a weather alert on the route
 * 
 * @param {Object} alert - Weather alert data
 * @returns {Object} Impact assessment
 */
function estimateAlertImpactOnRoute(alert) {
  // This would typically involve geographic analysis to determine
  // if and where the alert intersects the route
  
  // For prototype purposes, we'll use severity level to estimate impact
  let severityLevel = 1; // Default low impact
  
  if (alert.severity) {
    if (alert.severity.toLowerCase() === 'severe' || 
        alert.severity.toLowerCase() === 'extreme') {
      severityLevel = 3; // High impact
    } else if (alert.severity.toLowerCase() === 'moderate') {
      severityLevel = 2; // Medium impact
    }
  }
  
  // Check alert type to determine impact type
  let impactType = 'delay';
  let recommendedAction = 'proceed with caution';
  
  const eventType = (alert.event || '').toLowerCase();
  
  if (eventType.includes('flood') || eventType.includes('flash')) {
    impactType = 'road closure';
    recommendedAction = 'seek alternative route';
  } else if (eventType.includes('snow') || eventType.includes('ice')) {
    impactType = 'reduced speed';
    recommendedAction = 'drive slowly';
  } else if (eventType.includes('fog') || eventType.includes('visibility')) {
    impactType = 'reduced visibility';
    recommendedAction = 'use fog lights';
  } else if (eventType.includes('thunder') || eventType.includes('lightning')) {
    impactType = 'hazardous conditions';
    recommendedAction = 'seek shelter if needed';
  } else if (eventType.includes('wind')) {
    impactType = 'crosswind hazard';
    recommendedAction = 'grip steering wheel firmly';
  }
  
  return {
    severity: severityLevel,
    type: impactType,
    estimatedDelayMinutes: severityLevel * 10, // Rough estimate
    recommendedAction
  };
}

/**
 * Check if current conditions include precipitation
 * 
 * @param {Object} conditions - Current weather conditions
 * @returns {Boolean} True if precipitation is present
 */
function checkForPrecipitation(conditions) {
  if (!conditions) return false;
  
  const weatherMain = (conditions.weather && conditions.weather[0] && conditions.weather[0].main || '').toLowerCase();
  
  return weatherMain.includes('rain') || 
         weatherMain.includes('snow') || 
         weatherMain.includes('drizzle') || 
         weatherMain.includes('sleet');
}

/**
 * Check forecast for upcoming precipitation
 * 
 * @param {Object} weatherData - Complete weather data including forecast
 * @returns {Boolean} True if precipitation is forecasted in the next few hours
 */
function checkForecastForPrecipitation(weatherData) {
  if (!weatherData || !weatherData.hourlyForecast) return false;
  
  // Check the next 3 hours
  const nextHours = weatherData.hourlyForecast.slice(0, 3);
  
  return nextHours.some(hour => {
    if (!hour) return false;
    const weatherMain = (hour.weather && hour.weather[0] && hour.weather[0].main || '').toLowerCase();
    return weatherMain.includes('rain') || 
           weatherMain.includes('snow') || 
           weatherMain.includes('drizzle') || 
           weatherMain.includes('sleet');
  });
}

/**
 * Estimate the weather severity on a scale of 0-100
 * 
 * @param {Object} weatherData - Weather data
 * @returns {Number} Severity rating from 0-100
 */
function estimateWeatherSeverity(weatherData) {
  if (!weatherData || !weatherData.currentConditions) return 0;
  
  const conditions = weatherData.currentConditions;
  const weatherMain = (conditions.weather && conditions.weather[0] && conditions.weather[0].main || '').toLowerCase();
  
  let severity = 0;
  
  // Base severity on weather condition
  if (weatherMain.includes('thunder')) {
    severity += 70;
  } else if (weatherMain.includes('snow')) {
    severity += 60;
  } else if (weatherMain.includes('rain')) {
    const rainAmount = conditions.rain && conditions.rain['1h'] || 0;
    if (rainAmount > 10) severity += 65; // Heavy rain
    else if (rainAmount > 5) severity += 50; // Moderate rain
    else severity += 30; // Light rain
  } else if (weatherMain.includes('fog') || weatherMain.includes('mist')) {
    severity += 40;
  } else if (weatherMain.includes('cloud')) {
    severity += 10;
  }
  
  // Adjust for wind
  const windSpeed = conditions.wind_speed || 0;
  if (windSpeed > 40) severity += 30;
  else if (windSpeed > 30) severity += 20;
  else if (windSpeed > 20) severity += 10;
  
  // Adjust for visibility
  const visibility = conditions.visibility || 10000;
  if (visibility < 1000) severity += 30;
  else if (visibility < 3000) severity += 15;
  
  // Cap at 100
  return Math.min(100, severity);
}

/**
 * Estimate distance between two coordinates in miles
 * 
 * @param {Number} lat1 - Origin latitude
 * @param {Number} lon1 - Origin longitude
 * @param {Number} lat2 - Destination latitude
 * @param {Number} lon2 - Destination longitude
 * @returns {Number} Estimated distance in miles
 */
function estimateDistance(lat1, lon1, lat2, lon2) {
  // Implementation of the Haversine formula
  const R = 3958.8; // Earth's radius in miles
  
  // Convert to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 * 
 * @param {Number} degrees - Angle in degrees
 * @returns {Number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Create and open optimized external navigation with current weather
 * 
 * @param {Object} routeParams - Original route parameters
 * @param {Object} weatherData - Weather data
 * @param {Object} vehicleData - Vehicle data
 * @param {Object} options - Optimization options
 * @returns {Boolean} Success flag
 */
export function openOptimizedNavigation(routeParams, weatherData, vehicleData, options = {}) {
  try {
    // Optimize the route parameters
    const optimizedParams = optimizeRouteForWeather(routeParams, weatherData, vehicleData, options);
    
    // Choose app (use specified or user preference)
    const app = options.preferredApp || ExternalAppService.getPreferredNavigationApp();
    
    // Open the external navigation
    return ExternalAppService.openExternalNavigation(optimizedParams, app);
  } catch (error) {
    console.error('Failed to open optimized navigation:', error);
    
    // Fallback to standard navigation
    return ExternalAppService.openExternalNavigation(routeParams);
  }
}

/**
 * Generate a sharable deep link with optimized route
 * 
 * @param {Object} routeParams - Original route parameters
 * @param {Object} weatherData - Weather data
 * @param {Object} vehicleData - Vehicle data
 * @param {Object} options - Optimization options
 * @returns {Object} Share data with text and URL
 */
export function generateOptimizedShareableLink(routeParams, weatherData, vehicleData, options = {}) {
  // Optimize the route parameters
  const optimizedParams = optimizeRouteForWeather(routeParams, weatherData, vehicleData, options);
  
  // Generate share data
  const shareData = ExternalAppService.generateShareableMapLink(optimizedParams);
  
  // Enhance text with weather information
  if (weatherData && weatherData.currentConditions) {
    const weatherInfo = weatherData.currentConditions.weather[0].main;
    const severity = estimateWeatherSeverity(weatherData);
    
    if (severity > 60) {
      shareData.text = `${shareData.text} Watch out for ${weatherInfo.toLowerCase()} conditions!`;
    } else if (severity > 30) {
      shareData.text = `${shareData.text} Moderate ${weatherInfo.toLowerCase()} conditions on this route.`;
    }
  }
  
  return shareData;
}

/**
 * Get estimated delay time based on weather conditions
 * 
 * @param {Object} routeParams - Route parameters
 * @param {Object} weatherData - Weather data
 * @returns {Number} Estimated delay in minutes
 */
export function getWeatherDelayEstimate(routeParams, weatherData) {
  // If no data available, return zero delay
  if (!weatherData || !weatherData.currentConditions) return 0;
  
  // Calculate base travel time (very rough estimate)
  const distanceMiles = estimateDistance(
    routeParams.originLat, routeParams.originLon,
    routeParams.destLat, routeParams.destLon
  );
  
  // Assume average speed of 45 mph for rough estimate
  const baseTimeMinutes = (distanceMiles / 45) * 60;
  
  // Calculate weather impact percentage
  const severity = estimateWeatherSeverity(weatherData);
  
  // Convert severity to delay percentage (non-linear)
  let delayPercentage = 0;
  if (severity > 80) delayPercentage = 50; // Severe: 50% longer
  else if (severity > 60) delayPercentage = 35; // Major: 35% longer
  else if (severity > 40) delayPercentage = 20; // Moderate: 20% longer
  else if (severity > 20) delayPercentage = 10; // Minor: 10% longer
  
  // Calculate delay minutes
  const delayMinutes = Math.round((baseTimeMinutes * delayPercentage) / 100);
  
  return delayMinutes;
}

/**
 * Get recommended departure windows (best times to travel)
 * 
 * @param {Object} routeParams - Route parameters
 * @param {Object} weatherData - Weather data with hourly forecast
 * @param {Number} lookAheadHours - How many hours to look ahead
 * @returns {Array} Array of recommended departure windows
 */
export function getRecommendedDepartureWindows(routeParams, weatherData, lookAheadHours = 24) {
  // Need hourly forecast data to make recommendations
  if (!weatherData || !weatherData.hourlyForecast) return [];
  
  // Calculate estimated travel time
  const distanceMiles = estimateDistance(
    routeParams.originLat, routeParams.originLon,
    routeParams.destLat, routeParams.destLon
  );
  
  // Assume average speed of 45 mph for rough estimate
  const travelTimeHours = distanceMiles / 45;
  
  // Round up to nearest half hour
  const roundedTravelTime = Math.ceil(travelTimeHours * 2) / 2;
  
  // Only look at the forecast for the specified hours ahead
  const relevantForecast = weatherData.hourlyForecast.slice(0, lookAheadHours);
  
  // Calculate weather severity for each hour
  const hourlySeverity = relevantForecast.map((hour, index) => ({
    hour: index,
    time: new Date(hour.dt * 1000),
    severity: estimateHourSeverity(hour),
    conditions: hour.weather[0].main
  }));
  
  // Find windows of good weather that last long enough for the trip
  const goodWindows = [];
  
  for (let i = 0; i < hourlySeverity.length - roundedTravelTime; i++) {
    // Check if we have enough consecutive hours with low severity
    const windowSeverity = [];
    
    for (let j = 0; j < Math.ceil(roundedTravelTime); j++) {
      windowSeverity.push(hourlySeverity[i + j].severity);
    }
    
    // Calculate average severity for this window
    const avgSeverity = windowSeverity.reduce((sum, val) => sum + val, 0) / windowSeverity.length;
    
    // If average severity is low enough, this is a good window
    if (avgSeverity < 30) {
      goodWindows.push({
        startTime: hourlySeverity[i].time,
        endTime: new Date(hourlySeverity[i].time.getTime() + (roundedTravelTime * 60 * 60 * 1000)),
        averageSeverity: Math.round(avgSeverity),
        conditions: hourlySeverity[i].conditions,
        qualityScore: 100 - Math.round(avgSeverity)
      });
    }
  }
  
  // Sort by quality score (best first)
  return goodWindows.sort((a, b) => b.qualityScore - a.qualityScore);
}

/**
 * Estimate the severity of weather conditions for a specific forecast hour
 * 
 * @param {Object} hourData - Weather data for a specific hour
 * @returns {Number} Severity rating from 0-100
 */
function estimateHourSeverity(hourData) {
  if (!hourData) return 0;
  
  const weatherMain = (hourData.weather && hourData.weather[0] && hourData.weather[0].main || '').toLowerCase();
  let severity = 0;
  
  // Base severity on weather condition
  if (weatherMain.includes('thunder')) {
    severity += 70;
  } else if (weatherMain.includes('snow')) {
    severity += 60;
  } else if (weatherMain.includes('rain')) {
    const rainAmount = hourData.rain && hourData.rain['1h'] || 0;
    if (rainAmount > 10) severity += 65; // Heavy rain
    else if (rainAmount > 5) severity += 50; // Moderate rain
    else severity += 30; // Light rain
  } else if (weatherMain.includes('fog') || weatherMain.includes('mist')) {
    severity += 40;
  } else if (weatherMain.includes('cloud')) {
    severity += 10;
  }
  
  // Adjust for wind
  const windSpeed = hourData.wind_speed || 0;
  if (windSpeed > 40) severity += 30;
  else if (windSpeed > 30) severity += 20;
  else if (windSpeed > 20) severity += 10;
  
  // Adjust for visibility
  const visibility = hourData.visibility || 10000;
  if (visibility < 1000) severity += 30;
  else if (visibility < 3000) severity += 15;
  
  // Check hour of day for rush hour (add penalty)
  const hour = new Date(hourData.dt * 1000).getHours();
  if ((hour >= RUSH_HOUR_MORNING_START && hour < RUSH_HOUR_MORNING_END) ||
      (hour >= RUSH_HOUR_EVENING_START && hour < RUSH_HOUR_EVENING_END)) {
    severity += 15; // Rush hour penalty
  }
  
  // Nighttime driving (slight penalty for reduced visibility)
  if (hour < 6 || hour > 18) {
    severity += 10;
  }
  
  // Cap at 100
  return Math.min(100, severity);
}

// Export all functions
export default {
  optimizeRouteForWeather,
  openOptimizedNavigation,
  generateOptimizedShareableLink,
  getWeatherDelayEstimate,
  getRecommendedDepartureWindows
};