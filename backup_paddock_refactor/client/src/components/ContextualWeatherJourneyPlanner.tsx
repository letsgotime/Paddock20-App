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
  
  // Generate route forecast points
  const generateRouteWeatherPoints = (startTime: Date, endTime: Date) => {
    if (!forecastData || !forecastData.list) return [];
    
    const routePoints = [];
    const totalDuration = endTime.getTime() - startTime.getTime();
    const numPoints = Math.min(5, Math.max(2, Math.floor(routeDuration / 30) + 1));
    
    // Get the closest forecast time to the departure time
    let closestForecastIndex = 0;
    let minTimeDiff = Infinity;
    
    for (let i = 0; i < forecastData.list.length; i++) {
      const forecastTime = new Date(forecastData.list[i].dt * 1000);
      const timeDiff = Math.abs(forecastTime.getTime() - startTime.getTime());
      
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestForecastIndex = i;
      }
    }
    
    // Use the closest forecast as the start point
    const startForecast = forecastData.list[closestForecastIndex];
    
    routePoints.push({
      time: formatDate(new Date(startForecast.dt * 1000), 'h:mm a'),
      weatherIcon: startForecast.weather[0].icon,
      weatherDesc: startForecast.weather[0].description,
      temp: Math.round(startForecast.main.temp),
      windSpeed: Math.round(startForecast.wind.speed),
      humidity: startForecast.main.humidity,
      pop: Math.round(startForecast.pop * 100),
      routeProgress: 0,
      location: 'Departure',
      warning: determineWeatherWarning(startForecast)
    });
    
    // Add intermediate points
    if (numPoints > 2) {
      for (let i = 1; i < numPoints - 1; i++) {
        const progressPercent = (i / (numPoints - 1)) * 100;
        const pointTime = new Date(startTime.getTime() + (totalDuration * (i / (numPoints - 1))));
        
        // Find the closest forecast to this time
        let closestIndex = 0;
        let minDiff = Infinity;
        
        for (let j = 0; j < forecastData.list.length; j++) {
          const forecastTime = new Date(forecastData.list[j].dt * 1000);
          const diff = Math.abs(forecastTime.getTime() - pointTime.getTime());
          
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = j;
          }
        }
        
        const forecast = forecastData.list[closestIndex];
        
        routePoints.push({
          time: formatDate(pointTime, 'h:mm a'),
          weatherIcon: forecast.weather[0].icon,
          weatherDesc: forecast.weather[0].description,
          temp: Math.round(forecast.main.temp),
          windSpeed: Math.round(forecast.wind.speed),
          humidity: forecast.main.humidity,
          pop: Math.round(forecast.pop * 100),
          routeProgress: progressPercent,
          location: `En route (${Math.round(progressPercent)}%)`,
          warning: determineWeatherWarning(forecast)
        });
      }
    }
    
    // Add arrival point
    const endTimeIndex = forecastData.list.findIndex(f => 
      new Date(f.dt * 1000).getTime() >= endTime.getTime()
    );
    
    const endForecast = forecastData.list[endTimeIndex !== -1 ? endTimeIndex : forecastData.list.length - 1];
    
    routePoints.push({
      time: formatDate(endTime, 'h:mm a'),
      weatherIcon: endForecast.weather[0].icon,
      weatherDesc: endForecast.weather[0].description,
      temp: Math.round(endForecast.main.temp),
      windSpeed: Math.round(endForecast.wind.speed),
      humidity: endForecast.main.humidity,
      pop: Math.round(endForecast.pop * 100),
      routeProgress: 100,
      location: 'Arrival',
      warning: determineWeatherWarning(endForecast)
    });
    
    return routePoints;
  };
  
  // Determine weather warnings
  const determineWeatherWarning = (forecast: any) => {
    if (!forecast) return null;
    
    const weather = forecast.weather[0];
    const weatherId = weather.id;
    const temp = forecast.main.temp;
    const windSpeed = forecast.wind.speed;
    const pop = forecast.pop;
    
    // Severe weather warnings
    if (weatherId >= 200 && weatherId < 300) {
      return {
        type: 'severe',
        message: 'Thunderstorm conditions, reduced visibility, and lightning danger'
      };
    }
    
    if (weatherId >= 600 && weatherId < 700) {
      return {
        type: 'high',
        message: 'Snow conditions requiring reduced speed and increased following distance'
      };
    }
    
    if (weatherId >= 500 && weatherId < 600 && pop > 0.5) {
      return {
        type: 'moderate',
        message: 'Heavy rain expected, reduced traction and visibility'
      };
    }
    
    if (weatherId >= 700 && weatherId < 800) {
      return {
        type: 'moderate',
        message: 'Fog or mist with limited visibility'
      };
    }
    
    // Weather conditions requiring attention
    if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) {
      return {
        type: 'low',
        message: 'Light precipitation, drive with caution'
      };
    }
    
    // Temperature or wind warnings
    if (unit === 'imperial' && temp < 32) {
      return {
        type: 'moderate',
        message: 'Near freezing temperatures, possible icy conditions'
      };
    }
    
    if (unit === 'imperial' && windSpeed > 20) {
      return {
        type: 'low',
        message: 'High winds, maintain grip on steering wheel'
      };
    }
    
    return null;
  };
  
  // Determine overall risk level for the journey
  const calculateJourneyRiskLevel = (journeyPoints: any[]): 'low' | 'moderate' | 'high' | 'severe' => {
    if (!journeyPoints.length) return 'low';
    
    let severeWarnings = 0;
    let highWarnings = 0;
    let moderateWarnings = 0;
    
    journeyPoints.forEach(point => {
      if (point.warning) {
        if (point.warning.type === 'severe') severeWarnings++;
        else if (point.warning.type === 'high') highWarnings++;
        else if (point.warning.type === 'moderate') moderateWarnings++;
      }
    });
    
    if (severeWarnings > 0) return 'severe';
    if (highWarnings > 0) return 'high';
    if (moderateWarnings > 1) return 'high';
    if (moderateWarnings > 0) return 'moderate';
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
    setJourneyWeatherConditions([]);
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
              
              {/* Journey Time */}
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
                      value={journeyDuration}
                      min={5}
                      max={180}
                      onChange={(e) => setJourneyDuration(parseInt(e.target.value))}
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
            <div className={`p-3 rounded-lg mb-4 border ${getRiskLevelStyle(journeyRiskLevel)}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Route Risk Level: {journeyRiskLevel.charAt(0).toUpperCase() + journeyRiskLevel.slice(1)}</span>
                {journeyRiskLevel === 'low' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                {journeyRiskLevel === 'moderate' && <AlertTriangle className="h-5 w-5 text-yellow-400" />}
                {journeyRiskLevel === 'high' && <AlertTriangle className="h-5 w-5 text-orange-400" />}
                {journeyRiskLevel === 'severe' && <XCircle className="h-5 w-5 text-red-400" />}
              </div>
              <p className="text-sm mt-1">
                {journeyRiskLevel === 'low' && 'Good driving conditions expected for your route.'}
                {journeyRiskLevel === 'moderate' && 'Some weather challenges expected - proceed with caution.'}
                {journeyRiskLevel === 'high' && 'Difficult weather conditions predicted - consider adjusting your travel time.'}
                {journeyRiskLevel === 'severe' && 'Severe weather conditions - consider postponing non-essential travel.'}
              </p>
            </div>
            
            {/* Route Timeline */}
            <div className="space-y-1">
              {journeyWeatherConditions.map((point, index) => (
                <div key={index} className="relative flex">
                  {/* Timeline connector */}
                  {index < journeyWeatherConditions.length - 1 && (
                    <div className="absolute left-3 top-6 w-0.5 h-full bg-blue-900/30"></div>
                  )}
                  
                  {/* Timeline point */}
                  <div className="w-6 h-6 mt-1 rounded-full bg-blue-900/40 border border-blue-600 flex-shrink-0 z-10 flex items-center justify-center">
                    {index === 0 && <MapPin className="h-3 w-3 text-blue-400" />}
                    {index > 0 && index < journeyWeatherConditions.length - 1 && <Car className="h-3 w-3 text-blue-400" />}
                    {index === journeyWeatherConditions.length - 1 && <MapPin className="h-3 w-3 text-blue-400" />}
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
                  {journeyRiskLevel === 'low' && 'Maintain regular driving habits while staying alert to weather changes.'}
                  {journeyRiskLevel === 'moderate' && 'Reduce speed slightly and increase following distance during weather events.'}
                  {journeyRiskLevel === 'high' && 'Significantly reduce speed, use headlights, and avoid sudden maneuvers.'}
                  {journeyRiskLevel === 'severe' && 'Consider rescheduling travel if possible, or exercise extreme caution.'}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Check your tires before departure - proper inflation is crucial for {journeyRiskLevel === 'low' ? 'optimal efficiency' : 'safety in adverse conditions'}.
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {journeyWeatherConditions.some(point => point.pop > 30) 
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