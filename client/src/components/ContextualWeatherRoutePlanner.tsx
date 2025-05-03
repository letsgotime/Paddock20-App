import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { Route, CalendarCheck, Compass, Thermometer, Wind, CloudRain, MapPin, Clock, AlertTriangle, Car, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface RoutePlannerProps {
  favoriteLocations?: Array<{
    id: string | number;
    name: string;
    latitude: number;
    longitude: number;
    type?: string;
    icon?: React.ReactNode;
  }>;
}

const ContextualWeatherRoutePlanner: React.FC<RoutePlannerProps> = ({
  favoriteLocations = []
}) => {
  const { weatherData, forecastData, unit } = useWeather();
  const [startLocation, setStartLocation] = useState<{id: string | number, name: string, latitude: number, longitude: number} | null>(null);
  const [endLocation, setEndLocation] = useState<{id: string | number, name: string, latitude: number, longitude: number} | null>(null);
  const [departureTime, setDepartureTime] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<number>(30); // in minutes
  const [routeWeatherConditions, setRouteWeatherConditions] = useState<any[]>([]);
  const [showPlannerResults, setShowPlannerResults] = useState<boolean>(false);
  const [routeRiskLevel, setRouteRiskLevel] = useState<'low' | 'moderate' | 'high' | 'severe'>('low');
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  
  // Current location from weather data
  const currentLocation = weatherData ? {
    id: 'current',
    name: weatherData.name || 'Current Location',
    latitude: weatherData.coord.lat,
    longitude: weatherData.coord.lon
  } : null;
  
  // Generate available locations list
  const availableLocations = [
    ...(currentLocation ? [currentLocation] : []),
    ...favoriteLocations
  ];
  
  // Format for time input
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // Initialize departure time to current time
  useEffect(() => {
    setDepartureTime(getCurrentTimeFormatted());
  }, []);
  
  // Calculate route weather conditions based on selected parameters
  const calculateRouteWeather = () => {
    if (!startLocation || !endLocation || !departureTime || !forecastData) {
      return;
    }
    
    setLoadingPlan(true);
    
    setTimeout(() => {
      try {
        // Parse departure time
        const [hours, minutes] = departureTime.split(':').map(Number);
        const departureDate = new Date();
        departureDate.setHours(hours, minutes, 0, 0);
        
        // Calculate route end time
        const arrivalDate = new Date(departureDate.getTime() + routeDuration * 60 * 1000);
        
        // Get relevant forecast data for the route period
        const routeForecasts = generateRouteWeatherPoints(departureDate, arrivalDate);
        
        // Determine risk level based on weather conditions
        const riskLevel = calculateRouteRiskLevel(routeForecasts);
        
        // Update state
        setRouteWeatherConditions(routeForecasts);
        setRouteRiskLevel(riskLevel);
        setShowPlannerResults(true);
        setLoadingPlan(false);
      } catch (error) {
        console.error("Error calculating route weather:", error);
        setLoadingPlan(false);
      }
    }, 800);
  };
  
  // Enhanced route forecast points generator with improved reliability and error handling
  const generateRouteWeatherPoints = (startTime: Date, endTime: Date) => {
    // Validate forecast data is available and has the expected structure
    if (!forecastData || !forecastData.list || !Array.isArray(forecastData.list) || forecastData.list.length === 0) {
      console.warn("Weather forecast data is missing or has invalid format");
      return [];
    }
    
    try {
      const routePoints = [];
      const totalDuration = endTime.getTime() - startTime.getTime();
      
      // Adaptive number of points based on route duration with limits
      const numPoints = Math.min(5, Math.max(2, Math.floor(routeDuration / 30) + 1));
      
      // Validate times to ensure they're in the correct order
      if (endTime.getTime() <= startTime.getTime()) {
        console.warn("End time must be after start time");
        endTime = new Date(startTime.getTime() + (routeDuration * 60 * 1000));
      }
      
      // Find the closest forecast time to the departure time with error handling
      let closestForecastIndex = 0;
      let minTimeDiff = Infinity;
      let fallbackStartForecast = null;
      
      try {
        for (let i = 0; i < forecastData.list.length; i++) {
          // Skip entries with missing or invalid timestamp
          if (!forecastData.list[i].dt) continue;
          
          const forecastTime = new Date(forecastData.list[i].dt * 1000);
          const timeDiff = Math.abs(forecastTime.getTime() - startTime.getTime());
          
          if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestForecastIndex = i;
            // Store first valid forecast as fallback
            if (fallbackStartForecast === null) {
              fallbackStartForecast = forecastData.list[i];
            }
          }
        }
      } catch (error) {
        console.error("Error finding closest forecast:", error);
        // Continue with the fallback if available
        if (fallbackStartForecast === null && forecastData.list.length > 0) {
          fallbackStartForecast = forecastData.list[0];
        }
      }
      
      // Use the closest forecast or fallback for start point
      const startForecast = fallbackStartForecast || forecastData.list[closestForecastIndex];
      
      // Validate start forecast has required properties before proceeding
      if (!startForecast || !startForecast.weather || !startForecast.main) {
        console.error("Invalid forecast data for departure point");
        return [];
      }
      
      // Create departure point with safe access to properties
      routePoints.push({
        time: formatDate(new Date(startForecast.dt * 1000), 'h:mm a'),
        weatherIcon: startForecast.weather[0]?.icon || '01d', // Default to clear day if missing
        weatherDesc: startForecast.weather[0]?.description || 'Weather data unavailable',
        temp: Math.round(startForecast.main.temp) || 0,
        windSpeed: Math.round(startForecast.wind?.speed || 0),
        humidity: startForecast.main.humidity || 0,
        pop: Math.round((startForecast.pop || 0) * 100),
        routeProgress: 0,
        location: 'Departure',
        warning: determineWeatherWarning(startForecast),
        dataQuality: minTimeDiff > 3600000 ? 'low' : 'high' // Indicate if forecast is more than 1 hour away
      });
      
      // Add intermediate points with enhanced error handling
      if (numPoints > 2) {
        for (let i = 1; i < numPoints - 1; i++) {
          try {
            const progressPercent = (i / (numPoints - 1)) * 100;
            const pointTime = new Date(startTime.getTime() + (totalDuration * (i / (numPoints - 1))));
            
            // Find the closest forecast to this time
            let closestIndex = 0;
            let minDiff = Infinity;
            let failedLookup = false;
            
            for (let j = 0; j < forecastData.list.length; j++) {
              // Skip invalid entries
              if (!forecastData.list[j].dt) continue;
              
              try {
                const forecastTime = new Date(forecastData.list[j].dt * 1000);
                const diff = Math.abs(forecastTime.getTime() - pointTime.getTime());
                
                if (diff < minDiff) {
                  minDiff = diff;
                  closestIndex = j;
                }
              } catch (error) {
                console.warn(`Error processing forecast at index ${j}:`, error);
                failedLookup = true;
              }
            }
            
            // Use fallback if lookup failed
            const forecast = failedLookup && i > 0 ? 
              // Interpolate based on previous point if available
              routePoints[routePoints.length - 1]?.forecast || forecastData.list[0] : 
              forecastData.list[closestIndex];
            
            if (!forecast || !forecast.weather || !forecast.main) {
              console.warn("Invalid forecast data for route point");
              continue; // Skip this point
            }
            
            // Store the full forecast for potential interpolation needs
            const routePoint = {
              time: formatDate(pointTime, 'h:mm a'),
              weatherIcon: forecast.weather[0]?.icon || '01d',
              weatherDesc: forecast.weather[0]?.description || 'Weather data unavailable',
              temp: Math.round(forecast.main.temp) || 0,
              windSpeed: Math.round(forecast.wind?.speed || 0),
              humidity: forecast.main.humidity || 0,
              pop: Math.round((forecast.pop || 0) * 100),
              routeProgress: progressPercent,
              location: `En route (${Math.round(progressPercent)}%)`,
              warning: determineWeatherWarning(forecast),
              forecast: forecast, // Store the original forecast
              dataQuality: minDiff > 3600000 ? 'low' : 'high' // Indicate if forecast is more than 1 hour away
            };
            
            routePoints.push(routePoint);
          } catch (error) {
            console.error(`Error generating intermediate point ${i}:`, error);
            // Continue to next point
          }
        }
      }
      
      // Add arrival point with error handling
      try {
        // Find a forecast at or after the end time
        const endTimeIndex = forecastData.list.findIndex(f => 
          f.dt && new Date(f.dt * 1000).getTime() >= endTime.getTime()
        );
        
        // If no future forecast is found, use the last available forecast
        const endForecast = endTimeIndex !== -1 
          ? forecastData.list[endTimeIndex] 
          : forecastData.list[forecastData.list.length - 1];
        
        if (!endForecast || !endForecast.weather || !endForecast.main) {
          console.warn("Invalid forecast data for arrival point");
          // If we have at least one route point, we can still return the partial route
          if (routePoints.length > 0) {
            return routePoints;
          }
          return [];
        }
        
        const endTimeForecastDiff = Math.abs(
          new Date(endForecast.dt * 1000).getTime() - endTime.getTime()
        );
        
        routePoints.push({
          time: formatDate(endTime, 'h:mm a'),
          weatherIcon: endForecast.weather[0]?.icon || '01d',
          weatherDesc: endForecast.weather[0]?.description || 'Weather data unavailable',
          temp: Math.round(endForecast.main.temp) || 0,
          windSpeed: Math.round(endForecast.wind?.speed || 0),
          humidity: endForecast.main.humidity || 0,
          pop: Math.round((endForecast.pop || 0) * 100),
          routeProgress: 100,
          location: 'Arrival',
          warning: determineWeatherWarning(endForecast),
          dataQuality: endTimeForecastDiff > 3600000 ? 'low' : 'high' // Indicate if forecast is more than 1 hour away
        });
      } catch (error) {
        console.error("Error generating arrival point:", error);
        // If we have at least one route point, we can still return the partial route
        if (routePoints.length > 0) {
          return routePoints;
        }
        return [];
      }
      
      return routePoints;
    } catch (error) {
      console.error("Error generating route weather points:", error);
      return [];
    }
  };
  
  // Determine weather warnings with enhanced reliability and accuracy
  const determineWeatherWarning = (forecast: any) => {
    if (!forecast) return null;
    
    // Validate forecast data exists before proceeding
    if (!forecast.weather || !forecast.weather[0] || !forecast.main || !forecast.wind) {
      console.warn("Weather forecast data incomplete", forecast);
      return {
        type: 'low',
        message: 'Limited weather data available, exercise normal caution',
        confidence: 'low'
      };
    }
    
    const weather = forecast.weather[0];
    const weatherId = weather.id;
    const temp = forecast.main.temp;
    const windSpeed = forecast.wind.speed;
    const pop = forecast.pop || 0; // Default to 0 if precipitation probability is missing
    const humidity = forecast.main.humidity || 50; // Default to 50% if humidity is missing
    const visibility = forecast.visibility || 10000; // Default to 10km if visibility is missing
    
    // Calculate a weighted risk score (0-100) based on multiple factors
    let riskScore = 0;
    let riskFactors = [];
    let confidenceLevel = 'high';
    
    // Timestamp validation - check if forecast is current
    const forecastTime = new Date(forecast.dt * 1000);
    const currentTime = new Date();
    const hoursDifference = Math.abs(forecastTime.getTime() - currentTime.getTime()) / (60 * 60 * 1000);
    
    // If forecast is more than 6 hours old, decrease confidence
    if (hoursDifference > 6) {
      confidenceLevel = 'medium';
    }
    
    // If forecast is more than 12 hours old, further decrease confidence
    if (hoursDifference > 12) {
      confidenceLevel = 'low';
    }
    
    // Weather condition risk assessment
    // Thunderstorms (200-299)
    if (weatherId >= 200 && weatherId < 300) {
      riskScore += 90;
      riskFactors.push('thunderstorm');
      return {
        type: 'severe',
        message: 'Thunderstorm conditions, reduced visibility, and lightning danger',
        confidence: confidenceLevel,
        riskScore: Math.min(100, riskScore)
      };
    }
    
    // Snow (600-699)
    if (weatherId >= 600 && weatherId < 700) {
      riskScore += 70;
      riskFactors.push('snow');
      
      // Blizzard or heavy snow conditions
      if (weatherId === 602) {
        riskScore += 20;
        return {
          type: 'severe',
          message: 'Blizzard conditions, very limited visibility and traction',
          confidence: confidenceLevel,
          riskScore: Math.min(100, riskScore)
        };
      }
      
      return {
        type: 'high',
        message: 'Snow conditions requiring reduced speed and increased following distance',
        confidence: confidenceLevel,
        riskScore: Math.min(100, riskScore)
      };
    }
    
    // Heavy Rain (500-599 with high precipitation probability)
    if (weatherId >= 500 && weatherId < 600) {
      // Base risk for rain
      riskScore += 30;
      riskFactors.push('rain');
      
      // Extreme or heavy rain
      if (weatherId >= 502 || pop > 0.7) {
        riskScore += 40;
        return {
          type: 'high',
          message: 'Heavy rain expected, significantly reduced traction and visibility',
          confidence: confidenceLevel,
          riskScore: Math.min(100, riskScore)
        };
      }
      
      // Moderate rain
      if (weatherId >= 501 || pop > 0.5) {
        riskScore += 20;
        return {
          type: 'moderate',
          message: 'Moderate rain expected, reduced traction and visibility',
          confidence: confidenceLevel,
          riskScore: Math.min(100, riskScore)
        };
      }
      
      // Light rain
      return {
        type: 'low',
        message: 'Light rain possible, drive with caution',
        confidence: confidenceLevel,
        riskScore: Math.min(100, riskScore)
      };
    }
    
    // Fog, mist, or haze (700-799)
    if (weatherId >= 700 && weatherId < 800) {
      riskScore += 50;
      riskFactors.push('limited visibility');
      
      // Denser fog conditions
      if (weatherId === 741 || visibility < 1000) {
        riskScore += 20;
        return {
          type: 'high',
          message: 'Dense fog with severely limited visibility, use fog lights and reduce speed',
          confidence: confidenceLevel,
          riskScore: Math.min(100, riskScore)
        };
      }
      
      return {
        type: 'moderate',
        message: 'Fog or mist with limited visibility, use appropriate lights',
        confidence: confidenceLevel,
        riskScore: Math.min(100, riskScore)
      };
    }
    
    // Drizzle (300-399)
    if (weatherId >= 300 && weatherId < 400) {
      riskScore += 20;
      riskFactors.push('drizzle');
      return {
        type: 'low',
        message: 'Light precipitation, roads may be slippery',
        confidence: confidenceLevel,
        riskScore: Math.min(100, riskScore)
      };
    }
    
    // Temperature conditions
    if (unit === 'imperial') {
      // Freezing conditions (Imperial units)
      if (temp < 32) {
        riskScore += 60;
        riskFactors.push('freezing temperature');
        
        // Below 20°F is very dangerous for icy conditions
        if (temp < 20) {
          return {
            type: 'high',
            message: 'Very cold temperatures, high risk of black ice and frozen surfaces',
            confidence: confidenceLevel,
            riskScore: Math.min(100, riskScore)
          };
        }
        
        return {
          type: 'moderate',
          message: 'Near freezing temperatures, possible icy conditions especially on bridges',
          confidence: confidenceLevel,
          riskScore: Math.min(100, riskScore)
        };
      }
      
      // Hot conditions causing hydroplaning risk (when combined with precipitation)
      if (temp > 85 && pop > 0.3) {
        riskScore += 20;
        riskFactors.push('hot pavement with rain');
        return {
          type: 'moderate',
          message: 'Hot pavement with rain can increase hydroplaning risk',
          confidence: confidenceLevel,
          riskScore: Math.min(100, riskScore)
        };
      }
    } else {
      // Freezing conditions (Metric units)
      if (temp < 0) {
        riskScore += 60;
        riskFactors.push('freezing temperature');
        
        // Below -5°C is very dangerous for icy conditions
        if (temp < -5) {
          return {
            type: 'high',
            message: 'Very cold temperatures, high risk of black ice and frozen surfaces',
            confidence: confidenceLevel,
            riskScore: Math.min(100, riskScore)
          };
        }
        
        return {
          type: 'moderate',
          message: 'Near freezing temperatures, possible icy conditions especially on bridges',
          confidence: confidenceLevel,
          riskScore: Math.min(100, riskScore)
        };
      }
      
      // Hot conditions causing hydroplaning risk (when combined with precipitation)
      if (temp > 30 && pop > 0.3) {
        riskScore += 20;
        riskFactors.push('hot pavement with rain');
        return {
          type: 'moderate',
          message: 'Hot pavement with rain can increase hydroplaning risk',
          confidence: confidenceLevel,
          riskScore: Math.min(100, riskScore)
        };
      }
    }
    
    // Wind warnings
    if ((unit === 'imperial' && windSpeed > 20) || (unit === 'metric' && windSpeed > 9)) {
      riskScore += 30;
      riskFactors.push('high winds');
      
      // Very high winds
      if ((unit === 'imperial' && windSpeed > 35) || (unit === 'metric' && windSpeed > 15.5)) {
        return {
          type: 'high',
          message: 'Strong gusty winds may affect vehicle stability, use both hands on wheel',
          confidence: confidenceLevel,
          riskScore: Math.min(100, riskScore)
        };
      }
      
      return {
        type: 'moderate',
        message: 'Moderate to high winds, maintain firm grip on steering wheel',
        confidence: confidenceLevel,
        riskScore: Math.min(100, riskScore)
      };
    }
    
    // Low risk or clear conditions
    if (weatherId === 800) { // Clear sky
      return {
        type: 'low',
        message: 'Clear conditions, good visibility',
        confidence: confidenceLevel,
        riskScore: Math.min(100, riskScore)
      };
    }
    
    // Default low risk for other conditions
    return {
      type: 'low',
      message: 'Standard driving conditions',
      confidence: confidenceLevel,
      riskScore: Math.min(100, riskScore)
    };
  };
  
  // Enhanced route risk level calculation with weighted factors and confidence assessment
  const calculateRouteRiskLevel = (routePoints: any[]): 'low' | 'moderate' | 'high' | 'severe' => {
    if (!routePoints.length) return 'low';
    
    let severeWarnings = 0;
    let highWarnings = 0;
    let moderateWarnings = 0;
    let lowWarnings = 0;
    
    // For weighted risk calculation
    let totalRiskScore = 0;
    let maxRiskScore = 0;
    
    // Track confidence levels
    let lowConfidenceCount = 0;
    let mediumConfidenceCount = 0;
    let highConfidenceCount = 0;
    
    // Custom weight for departure and arrival points (more important than middle points)
    const departureWeight = 1.5;
    const arrivalWeight = 1.5;
    const midpointWeight = 1.0;
    
    // Process each route point and calculate weighted risk
    routePoints.forEach((point, index) => {
      if (!point.warning) return;
      
      // Determine point weight
      let pointWeight = midpointWeight;
      if (index === 0) pointWeight = departureWeight; // Departure
      if (index === routePoints.length - 1) pointWeight = arrivalWeight; // Arrival
      
      // Count warnings by severity
      if (point.warning.type === 'severe') severeWarnings++;
      else if (point.warning.type === 'high') highWarnings++;
      else if (point.warning.type === 'moderate') moderateWarnings++;
      else if (point.warning.type === 'low') lowWarnings++;
      
      // Track confidence levels for uncertainty adjustment
      if (point.warning.confidence === 'low') lowConfidenceCount++;
      else if (point.warning.confidence === 'medium') mediumConfidenceCount++;
      else if (point.warning.confidence === 'high') highConfidenceCount++;
      
      // Calculate weighted risk score if available
      if (point.warning.riskScore !== undefined) {
        // Apply weight based on position in route
        totalRiskScore += point.warning.riskScore * pointWeight;
        maxRiskScore += 100 * pointWeight; // Maximum possible score
      }
    });
    
    // If we have risk scores, use them for a more precise calculation
    if (maxRiskScore > 0) {
      const averageRiskScore = totalRiskScore / maxRiskScore * 100;
      
      // Adjust risk upward if low confidence data is prevalent
      let confidenceAdjustment = 0;
      if (lowConfidenceCount > highConfidenceCount) {
        confidenceAdjustment = 5; // Add 5% to risk if low confidence is dominant
      }
      
      const adjustedRiskScore = averageRiskScore + confidenceAdjustment;
      
      // Determine risk level based on weighted score
      if (adjustedRiskScore >= 75) return 'severe';
      if (adjustedRiskScore >= 50) return 'high';
      if (adjustedRiskScore >= 25) return 'moderate';
      return 'low';
    }
    
    // Fallback to simpler calculation if no risk scores available
    // But more nuanced than the original version
    
    // Any severe warning result in severe risk
    if (severeWarnings > 0) return 'severe';
    
    // Multiple high warnings or a high warning at departure/arrival is severe
    if (highWarnings > 1 || 
       (routePoints[0]?.warning?.type === 'high') || 
       (routePoints[routePoints.length-1]?.warning?.type === 'high')) {
      return 'high';
    }
    
    // Any high warning or multiple moderate warnings is high risk
    if (highWarnings > 0 || moderateWarnings > 1) return 'high';
    
    // Any moderate warning is moderate risk
    if (moderateWarnings > 0) return 'moderate';
    
    // Multiple low warnings might indicate moderate risk
    if (lowWarnings > 2) return 'moderate';
    
    // Default to low risk
    return 'low';
  };
  
  // Get risk level styling
  const getRiskLevelStyle = (level: 'low' | 'moderate' | 'high' | 'severe') => {
    switch (level) {
      case 'severe':
        return 'bg-red-900/30 text-red-400 border-red-900/50';
      case 'high':
        return 'bg-orange-900/30 text-orange-400 border-orange-900/50';
      case 'moderate':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50';
      case 'low':
      default:
        return 'bg-green-900/30 text-green-400 border-green-900/50';
    }
  };
  
  // Get warning level style
  const getWarningStyle = (type: string | null) => {
    if (!type) return '';
    
    switch (type) {
      case 'severe':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'low':
      default:
        return 'text-green-400';
    }
  };
  
  // Reset planner
  const resetPlanner = () => {
    setShowPlannerResults(false);
    setRouteWeatherConditions([]);
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
        <h3 className="text-blue-400 font-semibold flex items-center">
          <Route className="h-4 w-4 mr-2" />
          <span>Contextual Weather Route Planner</span>
        </h3>
        <span className="text-xs text-gray-400">Road conditions forecast</span>
      </div>
      
      <div className="p-4">
        {!showPlannerResults ? (
          <div className="animate-fadein">
            <p className="text-gray-300 text-sm mb-4">
              Plan your route with real-time weather insights to optimize driving conditions:
            </p>
            
            <div className="space-y-4 mb-6">
              {/* Start Location */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Location</label>
                <div className="relative">
                  <select 
                    className="w-full bg-black/40 border border-gray-800 rounded-md px-3 py-2 text-white appearance-none"
                    value={startLocation ? String(startLocation.id) : ''}
                    onChange={(e) => {
                      const selected = availableLocations.find(loc => String(loc.id) === e.target.value);
                      setStartLocation(selected || null);
                    }}
                  >
                    <option value="">Select a location</option>
                    {availableLocations.map(location => (
                      <option key={`start-${location.id}`} value={String(location.id)}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
              
              {/* End Location */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Destination</label>
                <div className="relative">
                  <select 
                    className="w-full bg-black/40 border border-gray-800 rounded-md px-3 py-2 text-white appearance-none"
                    value={endLocation ? String(endLocation.id) : ''}
                    onChange={(e) => {
                      const selected = availableLocations.find(loc => String(loc.id) === e.target.value);
                      setEndLocation(selected || null);
                    }}
                  >
                    <option value="">Select a location</option>
                    {availableLocations.map(location => (
                      <option key={`end-${location.id}`} value={String(location.id)}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
              
              {/* Route Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Departure Time</label>
                  <div className="relative">
                    <input 
                      type="time" 
                      className="w-full bg-black/40 border border-gray-800 rounded-md px-3 py-2 text-white"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Route Duration (min)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full bg-black/40 border border-gray-800 rounded-md px-3 py-2 text-white"
                      value={routeDuration}
                      min={5}
                      max={180}
                      onChange={(e) => setRouteDuration(parseInt(e.target.value))}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <CalendarCheck className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-md hover:from-blue-700 hover:to-blue-900 transition-all flex items-center justify-center"
              onClick={calculateRouteWeather}
              disabled={!startLocation || !endLocation || !departureTime || loadingPlan}
            >
              {loadingPlan ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Planning Route...
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4 mr-2" />
                  Plan Route
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="animate-fadein">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-semibold flex items-center">
                <Route className="h-4 w-4 mr-2 text-blue-400" />
                {startLocation?.name} to {endLocation?.name}
              </h4>
              <button 
                onClick={resetPlanner}
                className="text-xs text-gray-400 hover:text-white"
              >
                ← Back to planner
              </button>
            </div>
            
            {/* Route Overview */}
            <div className={`p-3 rounded-lg mb-4 border ${getRiskLevelStyle(routeRiskLevel)}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Route Risk Level: {routeRiskLevel.charAt(0).toUpperCase() + routeRiskLevel.slice(1)}</span>
                {routeRiskLevel === 'low' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                {routeRiskLevel === 'moderate' && <AlertTriangle className="h-5 w-5 text-yellow-400" />}
                {routeRiskLevel === 'high' && <AlertTriangle className="h-5 w-5 text-orange-400" />}
                {routeRiskLevel === 'severe' && <XCircle className="h-5 w-5 text-red-400" />}
              </div>
              <p className="text-sm mt-1">
                {routeRiskLevel === 'low' && 'Good driving conditions expected for your route.'}
                {routeRiskLevel === 'moderate' && 'Some weather challenges expected - proceed with caution.'}
                {routeRiskLevel === 'high' && 'Difficult weather conditions predicted - consider adjusting your travel time.'}
                {routeRiskLevel === 'severe' && 'Severe weather conditions - consider postponing non-essential travel.'}
              </p>
            </div>
            
            {/* Route Timeline */}
            <div className="space-y-1">
              {routeWeatherConditions.map((point, index) => (
                <div key={index} className="relative flex">
                  {/* Timeline connector */}
                  {index < routeWeatherConditions.length - 1 && (
                    <div className="absolute left-3 top-6 w-0.5 h-full bg-blue-900/30"></div>
                  )}
                  
                  {/* Timeline point */}
                  <div className="w-6 h-6 mt-1 rounded-full bg-blue-900/40 border border-blue-600 flex-shrink-0 z-10 flex items-center justify-center">
                    {index === 0 && <MapPin className="h-3 w-3 text-blue-400" />}
                    {index > 0 && index < routeWeatherConditions.length - 1 && <Car className="h-3 w-3 text-blue-400" />}
                    {index === routeWeatherConditions.length - 1 && <MapPin className="h-3 w-3 text-blue-400" />}
                  </div>
                  
                  {/* Timeline content */}
                  <div className="ml-4 pb-6 w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm font-semibold">{point.time} - {point.location}</span>
                      <span className="text-xs text-gray-400">{point.temp}°{unit === 'imperial' ? 'F' : 'C'}</span>
                    </div>
                    
                    <div className="bg-black/30 border border-blue-900/30 rounded-lg p-2">
                      <div className="flex items-center mb-1">
                        <img 
                          src={`https://openweathermap.org/img/wn/${point.weatherIcon}.png`} 
                          alt={point.weatherDesc}
                          className="w-8 h-8"
                        />
                        <span className="text-xs text-gray-300 capitalize">{point.weatherDesc}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                        <div className="flex items-center">
                          <Thermometer className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{point.temp}°{unit === 'imperial' ? 'F' : 'C'}</span>
                        </div>
                        <div className="flex items-center">
                          <Wind className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{point.windSpeed} {unit === 'imperial' ? 'mph' : 'km/h'}</span>
                        </div>
                        <div className="flex items-center">
                          <CloudRain className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{point.pop}%</span>
                        </div>
                      </div>
                      
                      {point.warning && (
                        <div className={`mt-1 text-xs border-t border-gray-800 pt-1 ${getWarningStyle(point.warning.type)}`}>
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          {point.warning.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Route Tips */}
            <div className="mt-2 p-3 rounded-lg bg-blue-900/10 border border-blue-900/30">
              <h5 className="text-blue-400 text-sm font-semibold mb-2">Route Tips:</h5>
              <ul className="space-y-1 text-xs text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {routeRiskLevel === 'low' && 'Maintain regular driving habits while staying alert to weather changes.'}
                  {routeRiskLevel === 'moderate' && 'Reduce speed slightly and increase following distance during weather events.'}
                  {routeRiskLevel === 'high' && 'Significantly reduce speed, use headlights, and avoid sudden maneuvers.'}
                  {routeRiskLevel === 'severe' && 'Consider rescheduling travel if possible, or exercise extreme caution.'}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Check your tires before departure - proper inflation is crucial for {routeRiskLevel === 'low' ? 'optimal efficiency' : 'safety in adverse conditions'}.
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {routeWeatherConditions.some(point => point.pop > 30) 
                    ? 'Ensure your wipers are in good condition and washer fluid is filled.' 
                    : 'Keep your fuel level above 1/4 tank for unexpected delays.'}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextualWeatherRoutePlanner;