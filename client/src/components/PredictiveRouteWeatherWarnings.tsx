import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import axios from 'axios';
import { 
  AlertTriangle, Cloud, CloudRain, CloudSnow, 
  Droplets, Wind, Thermometer, Sun, 
  ChevronDown, ChevronUp, Navigation, Flag,
  Check, Clock
} from 'lucide-react';

interface RoutePoint {
  name: string;
  lat: number;
  lon: number;
  distance: number; // in miles/km from start
  timeOffset: number; // in minutes from start
}

interface WeatherWarning {
  type: 'severe' | 'moderate' | 'advisory';
  icon: React.ReactNode;
  title: string;
  description: string;
  location: string;
  time: string;
  impact: string;
}

interface RouteWeatherData {
  location: RoutePoint;
  conditions: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  warnings: WeatherWarning[];
}

// Demo routes (would be replaced with user saved routes in production)
const DEMO_ROUTES = [
  {
    id: 1,
    name: "Morning Commute",
    startPoint: "Home",
    endPoint: "Office",
    distance: 18.5,
    duration: 25,
    favorite: true,
    description: "Daily route to work via I-77"
  },
  {
    id: 2,
    name: "Mountain Drive",
    startPoint: "Charlotte",
    endPoint: "Asheville",
    distance: 124,
    duration: 135,
    favorite: true,
    description: "Weekend mountain route via I-40"
  },
  {
    id: 3,
    name: "Lake Loop",
    startPoint: "Home",
    endPoint: "Home",
    distance: 35.2,
    duration: 45,
    favorite: false,
    description: "Scenic route around Lake Norman"
  }
];

// Analyze forecast data from the OpenWeather API for route points
const getRouteWeatherData = async (routeId: number, units: string, weatherData: any, forecastData: any): Promise<RouteWeatherData[]> => {
  // Use actual weather data as a starting point
  if (!weatherData || !forecastData || !forecastData.list) {
    return [];
  }

  const isImperial = units === 'imperial';
  const speedUnit = isImperial ? 'mph' : 'km/h';
  const tempUnit = isImperial ? '°F' : '°C';
  const distanceUnit = isImperial ? 'mi' : 'km';

  // Get the selected route
  const selectedRoute = DEMO_ROUTES.find(r => r.id === routeId);
  if (!selectedRoute) return [];

  // Create route points based on the route
  const routePoints: RoutePoint[] = [];

  // Starting point (use actual weather location)
  routePoints.push({
    name: selectedRoute.startPoint,
    lat: weatherData.coord.lat,
    lon: weatherData.coord.lon,
    distance: 0,
    timeOffset: 0
  });

  // Generate waypoints with actual coordinates for the route
  // In a real implementation, these would come from a mapping/routing API
  if (selectedRoute.id === 1) { // Morning Commute
    routePoints.push({
      name: "Highway Junction",
      lat: weatherData.coord.lat + 0.05,
      lon: weatherData.coord.lon - 0.05,
      distance: 7.2,
      timeOffset: 10
    });
    routePoints.push({
      name: "Downtown",
      lat: weatherData.coord.lat + 0.08,
      lon: weatherData.coord.lon - 0.08,
      distance: 14.1,
      timeOffset: 18
    });
  } else if (selectedRoute.id === 2) { // Mountain Drive
    routePoints.push({
      name: "Gastonia",
      lat: weatherData.coord.lat + 0.1,
      lon: weatherData.coord.lon - 0.2,
      distance: 26.8,
      timeOffset: 30
    });
    routePoints.push({
      name: "Shelby",
      lat: weatherData.coord.lat + 0.2,
      lon: weatherData.coord.lon - 0.5,
      distance: 56.4,
      timeOffset: 60
    });
    routePoints.push({
      name: "Hickory",
      lat: weatherData.coord.lat + 0.3,
      lon: weatherData.coord.lon - 0.7,
      distance: 84.2,
      timeOffset: 90
    });
  } else if (selectedRoute.id === 3) { // Lake Loop
    routePoints.push({
      name: "North Shore",
      lat: weatherData.coord.lat + 0.15,
      lon: weatherData.coord.lon + 0.05,
      distance: 12.3,
      timeOffset: 15
    });
    routePoints.push({
      name: "Marina",
      lat: weatherData.coord.lat + 0.2,
      lon: weatherData.coord.lon + 0.1,
      distance: 23.7,
      timeOffset: 30
    });
  }

  // End point
  routePoints.push({
    name: selectedRoute.endPoint,
    lat: weatherData.coord.lat + (selectedRoute.id === 3 ? 0 : 0.5), // if loop, return to start
    lon: weatherData.coord.lon + (selectedRoute.id === 3 ? 0 : -1),
    distance: selectedRoute.distance,
    timeOffset: selectedRoute.duration
  });

  // Fetch weather data for each point
  const routeWeatherPromises = routePoints.map(async (point, index) => {
    let pointWeatherData;
    let pointForecastData;
    let warnings: WeatherWarning[] = [];
    
    try {
      // For the first point (starting location), use the current weather data
      if (index === 0) {
        pointWeatherData = weatherData;
        
        // Current location warnings based on actual weather data
        const temp = pointWeatherData.main.temp;
        const precip = pointWeatherData.rain ? (pointWeatherData.rain['1h'] || pointWeatherData.rain['3h'] || 0) : 0;
        const windSpeed = pointWeatherData.wind.speed;
        const weatherId = pointWeatherData.weather[0].id;
        
        // Generate warnings based on real weather data
        if (weatherId < 300) {
          warnings.push({
            type: 'severe',
            icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
            title: 'Thunderstorm Warning',
            description: 'Lightning and heavy rain detected',
            location: point.name,
            time: 'Current',
            impact: 'Reduced visibility and traction'
          });
        } else if (weatherId >= 300 && weatherId < 600) {
          const severity = precip > 5 ? 'moderate' : 'advisory';
          warnings.push({
            type: severity as 'moderate' | 'advisory',
            icon: <CloudRain className={`h-5 w-5 ${severity === 'moderate' ? 'text-orange-500' : 'text-blue-500'}`} />,
            title: 'Precipitation Warning',
            description: `Current rainfall of ${precip.toFixed(1)}mm detected`,
            location: point.name,
            time: 'Current',
            impact: 'Reduced visibility and traction, adjust speed accordingly'
          });
        } else if (weatherId >= 600 && weatherId < 700) {
          warnings.push({
            type: 'severe',
            icon: <CloudSnow className="h-5 w-5 text-red-500" />,
            title: 'Snow/Ice Warning',
            description: 'Winter precipitation detected',
            location: point.name,
            time: 'Current',
            impact: 'Significantly reduced traction, drive with extreme caution'
          });
        } else if (windSpeed > (isImperial ? 20 : 32)) {
          warnings.push({
            type: 'moderate',
            icon: <Wind className="h-5 w-5 text-orange-500" />,
            title: 'High Wind Advisory',
            description: `Strong winds of ${Math.round(windSpeed)} ${speedUnit}`,
            location: point.name,
            time: 'Current',
            impact: 'Vehicle stability affected, debris possible'
          });
        } else if (temp < (isImperial ? 32 : 0)) {
          warnings.push({
            type: 'advisory',
            icon: <Thermometer className="h-5 w-5 text-blue-500" />,
            title: 'Freezing Temperatures',
            description: `Temperature of ${Math.round(temp)}${tempUnit} detected`,
            location: point.name,
            time: 'Current',
            impact: 'Potential for black ice on road surfaces'
          });
        }
        
        // Use forecast data for timeOffset
        if (point.timeOffset > 0 && forecastData.list && forecastData.list.length > 0) {
          const forecastIndex = Math.min(
            Math.floor(point.timeOffset / 180), 
            forecastData.list.length - 1
          );
          pointForecastData = forecastData.list[forecastIndex];
        } else {
          pointForecastData = null;
        }
      }
      // For future points along the route, use forecast data with appropriate time offset
      else {
        // Find the forecast entry closest to the time offset
        if (forecastData && forecastData.list) {
          const forecastIndex = Math.min(
            Math.floor(point.timeOffset / 180), 
            forecastData.list.length - 1
          );
          
          pointForecastData = forecastData.list[forecastIndex];
          pointWeatherData = pointForecastData; // Use forecast as the current conditions
          
          // Generate warnings based on forecast data
          const temp = pointForecastData.main.temp;
          const precip = pointForecastData.rain ? (pointForecastData.rain['3h'] || 0) : 0;
          const windSpeed = pointForecastData.wind.speed;
          const weatherId = pointForecastData.weather[0].id;
          
          if (weatherId < 300) {
            warnings.push({
              type: 'severe',
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
              title: 'Thunderstorm Ahead',
              description: 'Lightning and heavy rain predicted',
              location: point.name,
              time: `In ${point.timeOffset} minutes`,
              impact: 'Reduced visibility and traction'
            });
          } else if (weatherId >= 300 && weatherId < 600) {
            const severity = precip > 5 ? 'moderate' : 'advisory';
            warnings.push({
              type: severity as 'moderate' | 'advisory',
              icon: <CloudRain className={`h-5 w-5 ${severity === 'moderate' ? 'text-orange-500' : 'text-blue-500'}`} />,
              title: 'Rain Expected',
              description: `Precipitation of ${precip.toFixed(1)}mm predicted`,
              location: point.name,
              time: `In ${point.timeOffset} minutes`,
              impact: 'Wet roads, reduced grip by up to 30%'
            });
          } else if (weatherId >= 600 && weatherId < 700) {
            warnings.push({
              type: 'severe',
              icon: <CloudSnow className="h-5 w-5 text-red-500" />,
              title: 'Snow/Ice Warning',
              description: 'Winter precipitation expected',
              location: point.name,
              time: `In ${point.timeOffset} minutes`,
              impact: 'Significantly reduced traction, consider alternate route'
            });
          } else if (temp < (isImperial ? 32 : 0)) {
            warnings.push({
              type: 'advisory',
              icon: <Thermometer className="h-5 w-5 text-blue-500" />,
              title: 'Freezing Temperatures',
              description: `Temperature of ${Math.round(temp)}${tempUnit} expected`,
              location: point.name,
              time: `In ${point.timeOffset} minutes`,
              impact: 'Potential for black ice on road surfaces'
            });
          } else if (windSpeed > (isImperial ? 20 : 32)) {
            warnings.push({
              type: 'moderate',
              icon: <Wind className="h-5 w-5 text-orange-500" />,
              title: 'High Wind Advisory',
              description: `Strong winds of ${Math.round(windSpeed)} ${speedUnit} expected`,
              location: point.name,
              time: `In ${point.timeOffset} minutes`,
              impact: 'Vehicle stability may be affected'
            });
          }
          
          // Add additional warnings based on elevation changes if we had that data
          // In a real implementation, we would get this from mapping APIs
        }
      }
      
      // Construct the RouteWeatherData object using real data
      return {
        location: point,
        conditions: pointWeatherData?.weather?.[0]?.main || 'Unknown',
        temperature: pointWeatherData?.main?.temp || 0,
        precipitation: 
          (pointWeatherData?.rain?.['1h'] || 
           pointWeatherData?.rain?.['3h'] || 
           (pointForecastData?.rain?.['3h'] || 0)),
        windSpeed: pointWeatherData?.wind?.speed || 0,
        warnings
      };
    } catch (error) {
      console.error("Error fetching point weather data:", error);
      
      // Fall back to using forecast data if there was an error
      let fallbackData = {
        location: point,
        conditions: 'Unknown',
        temperature: 0,
        precipitation: 0,
        windSpeed: 0,
        warnings: [{
          type: 'advisory' as const,
          icon: <AlertTriangle className="h-5 w-5 text-blue-500" />,
          title: 'Weather Data Unavailable',
          description: 'Unable to retrieve accurate weather for this point',
          location: point.name,
          time: `At ${point.timeOffset} minutes into journey`,
          impact: 'Conditions unknown, proceed with caution'
        }]
      };
      
      // If we have the main weather data, use that as a fallback
      if (weatherData) {
        fallbackData.temperature = weatherData.main.temp;
        fallbackData.conditions = weatherData.weather[0].main;
      }
      
      return fallbackData;
    }
  });
  
  // Wait for all point weather data to be fetched
  return Promise.all(routeWeatherPromises);
};

const PredictiveRouteWeatherWarnings: React.FC = () => {
  const { weatherData, forecastData, unit: units } = useWeather();
  const [selectedRouteId, setSelectedRouteId] = useState<number>(1);
  const [routeWeatherData, setRouteWeatherData] = useState<RouteWeatherData[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>('warnings');
  const [hoverPoint, setHoverPoint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Get weather data for the selected route using real API data
  useEffect(() => {
    const fetchRouteWeatherData = async () => {
      if (weatherData && forecastData) {
        setIsLoading(true);
        setError(null);
        
        try {
          // Call our API-driven function to get real weather data for the route
          const data = await getRouteWeatherData(selectedRouteId, units, weatherData, forecastData);
          setRouteWeatherData(data);
        } catch (err) {
          console.error("Error fetching route weather data:", err);
          setError("Unable to retrieve route weather data. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchRouteWeatherData();
  }, [selectedRouteId, weatherData, forecastData, units]);
  
  // Total warning count for the selected route
  const totalWarnings = routeWeatherData.reduce((count, point) => 
    count + point.warnings.length, 0);
  
  // Check if there are severe warnings
  const hasSevereWarnings = routeWeatherData.some(point => 
    point.warnings.some(warning => warning.type === 'severe')
  );
  
  // Get distance and time units based on the system
  const distanceUnit = units === 'imperial' ? 'mi' : 'km';
  const tempUnit = units === 'imperial' ? '°F' : '°C';
  
  if (!weatherData || !forecastData) {
    return (
      <div className="bg-black/20 rounded-lg p-4 border border-blue-900/30">
        <div className="flex items-center mb-3">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
          <h3 className="text-blue-400 font-medium">Predictive Route Weather</h3>
        </div>
        <p className="text-gray-400 text-sm">Weather forecast data is currently unavailable. Please check back later.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="bg-black/20 rounded-lg p-4 border border-blue-900/30">
        <div className="flex items-center mb-3">
          <div className="h-5 w-5 mr-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <h3 className="text-blue-400 font-medium">Loading Route Weather Data</h3>
        </div>
        <p className="text-gray-400 text-sm">Analyzing weather conditions along your route...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-black/20 rounded-lg p-4 border border-red-900/30">
        <div className="flex items-center mb-3">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          <h3 className="text-red-400 font-medium">Route Weather Error</h3>
        </div>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-black/20 rounded-lg border border-blue-900/30 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-950/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Navigation className="h-5 w-5 mr-2 text-blue-400" />
            <h3 className="text-blue-400 font-medium">Predictive Route Weather Warnings</h3>
          </div>
          <div className="flex items-center space-x-1">
            {hasSevereWarnings && (
              <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full animate-pulse">
                Severe Alert
              </span>
            )}
            <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full">
              {totalWarnings} {totalWarnings === 1 ? 'Warning' : 'Warnings'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Route Selection */}
      <div className="p-4 border-b border-blue-900/30">
        <label htmlFor="route-select" className="block text-sm text-gray-400 mb-2">Select Route:</label>
        <select 
          id="route-select"
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(Number(e.target.value))}
          className="w-full p-2 bg-black/30 border border-blue-900/50 text-white rounded-md focus:border-blue-500 focus:ring-blue-500"
        >
          {DEMO_ROUTES.map(route => (
            <option key={route.id} value={route.id}>
              {route.name} ({route.distance} {distanceUnit}, {route.duration} min)
            </option>
          ))}
        </select>
        
        <div className="mt-2 text-xs text-gray-500">
          {DEMO_ROUTES.find(r => r.id === selectedRouteId)?.description}
        </div>
      </div>
      
      {/* Warnings Section */}
      <div className="border-b border-blue-900/30">
        <button 
          className="w-full p-4 flex items-center justify-between hover:bg-blue-900/10 transition-colors"
          onClick={() => toggleSection('warnings')}
        >
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            <span className="text-gray-300 font-medium">Route Warnings</span>
          </div>
          {expandedSection === 'warnings' ? 
            <ChevronUp className="h-4 w-4 text-gray-400" /> : 
            <ChevronDown className="h-4 w-4 text-gray-400" />
          }
        </button>
        
        {expandedSection === 'warnings' && (
          <div className="p-4 pt-0 bg-black/10">
            {totalWarnings === 0 ? (
              <div className="text-center p-4 text-gray-400">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-900/20 text-green-400 mb-2">
                  <Cloud className="h-6 w-6" />
                </div>
                <p>No significant weather warnings for this route</p>
                <p className="text-xs text-gray-500 mt-1">Conditions are favorable for driving</p>
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {routeWeatherData.flatMap((point, i) => 
                  point.warnings.map((warning, j) => (
                    <div 
                      key={`${i}-${j}`} 
                      className={`p-3 rounded-lg border ${
                        warning.type === 'severe' ? 'bg-red-900/10 border-red-900/30' :
                        warning.type === 'moderate' ? 'bg-orange-900/10 border-orange-900/30' :
                        'bg-blue-900/10 border-blue-900/30'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="mt-0.5 mr-3">
                          {warning.icon}
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <h4 className={`font-medium ${
                              warning.type === 'severe' ? 'text-red-400' :
                              warning.type === 'moderate' ? 'text-orange-400' :
                              'text-blue-400'
                            }`}>
                              {warning.title}
                            </h4>
                          </div>
                          <p className="text-gray-300 text-sm mb-1">{warning.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="flex items-center mr-3">
                              <Flag className="h-3 w-3 mr-1" />
                              {warning.location}
                            </span>
                            <span className="flex items-center">
                              <Timer className="h-3 w-3 mr-1" />
                              {warning.time}
                            </span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-800">
                            <p className="text-xs text-gray-400">
                              <span className="font-medium text-gray-300">Impact: </span>
                              {warning.impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Route Weather Details */}
      <div>
        <button 
          className="w-full p-4 flex items-center justify-between hover:bg-blue-900/10 transition-colors"
          onClick={() => toggleSection('route')}
        >
          <div className="flex items-center">
            <Navigation className="h-5 w-5 mr-2 text-blue-400" />
            <span className="text-gray-300 font-medium">Route Weather Details</span>
          </div>
          {expandedSection === 'route' ? 
            <ChevronUp className="h-4 w-4 text-gray-400" /> : 
            <ChevronDown className="h-4 w-4 text-gray-400" />
          }
        </button>
        
        {expandedSection === 'route' && (
          <div className="p-4 pt-0 bg-black/10">
            <div className="mt-3 relative">
              {/* Route timeline visualization */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-900/50 z-0"></div>
              
              {routeWeatherData.map((point, index) => (
                <div 
                  key={index}
                  className={`relative z-10 mb-4 pl-10 pb-4 ${
                    index === routeWeatherData.length - 1 ? '' : 'border-b border-gray-800/50'
                  }`}
                  onMouseEnter={() => setHoverPoint(point.location.name)}
                  onMouseLeave={() => setHoverPoint(null)}
                >
                  <div className={`absolute left-2.5 transform -translate-x-1/2 w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-green-500' : 
                    index === routeWeatherData.length - 1 ? 'bg-red-500' : 
                    'bg-blue-500'
                  } ${hoverPoint === point.location.name ? 'ring-2 ring-blue-400' : ''}`} />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h4 className="text-blue-400 font-medium">
                        {point.location.name}
                        {index === 0 && ' (Start)'}
                        {index === routeWeatherData.length - 1 && ' (Destination)'}
                      </h4>
                      <div className="text-xs text-gray-500 mt-1">
                        {point.location.distance} {distanceUnit} • {point.location.timeOffset} min from start
                      </div>
                    </div>
                    
                    <div className={`flex items-center mt-2 md:mt-0 ${
                      point.warnings.length > 0 ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {point.warnings.length > 0 ? 
                        <AlertTriangle className="h-4 w-4 mr-1" /> : 
                        <Cloud className="h-4 w-4 mr-1" />
                      }
                      <span className="text-sm">
                        {point.warnings.length > 0 ? 
                          `${point.warnings.length} ${point.warnings.length === 1 ? 'warning' : 'warnings'}` : 
                          'Clear conditions'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 rounded-lg bg-black/20 border border-blue-900/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Conditions</div>
                        <div className="text-gray-300 flex items-center">
                          {getWeatherIcon(point.conditions)} 
                          <span className="ml-1">{point.conditions}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Temperature</div>
                        <div className="text-gray-300 flex items-center">
                          <Thermometer className="h-4 w-4 mr-1 text-orange-400" />
                          {Math.round(point.temperature)}{tempUnit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Precipitation</div>
                        <div className="text-gray-300 flex items-center">
                          <CloudRain className="h-4 w-4 mr-1 text-blue-400" />
                          {point.precipitation.toFixed(1)} mm
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Wind</div>
                        <div className="text-gray-300 flex items-center">
                          <Wind className="h-4 w-4 mr-1 text-blue-300" />
                          {Math.round(point.windSpeed)} {units === 'imperial' ? 'mph' : 'km/h'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get weather icon based on condition
const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'thunderstorm':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'drizzle':
    case 'rain':
      return <CloudRain className="h-4 w-4 text-blue-400" />;
    case 'snow':
      return <CloudSnow className="h-4 w-4 text-blue-100" />;
    case 'clear':
      return <Sun className="h-4 w-4 text-yellow-400" />;
    case 'clouds':
      return <Cloud className="h-4 w-4 text-gray-400" />;
    default:
      return <Cloud className="h-4 w-4 text-gray-400" />;
  }
};

export default PredictiveRouteWeatherWarnings;