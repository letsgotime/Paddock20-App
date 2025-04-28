import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, Locate, Search, Navigation, MapIcon, Cloud, CloudRain, 
  Thermometer, Wind, Clock, Car, CalendarClock, AlertTriangle, 
  CornerUpRight, Compass, BarChart, Infinity, Route as RouteIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { getWeatherData, getOneCallData, formatTemperature } from '@/services/openWeatherService';

interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  placeId?: string;
}

interface Route {
  id: number;
  name: string;
  startPoint: Location;
  endPoint: Location;
  waypoints?: Location[];
  distance: number;
  estimatedTime: string;
  notes: string;
  category: string;
  favorite: boolean;
  lastDriven?: string;
  weather?: any;
  roadConditions?: any[];
}

// Simulate road condition data based on weather and temperature
const getRoadConditionForLocation = (weather: any, temp: number) => {
  const description = weather?.description?.toLowerCase() || '';
  let status = 'optimal';
  let detail = 'Excellent driving conditions';
  let icon = 'optimal';
  
  if (description.includes('rain') || description.includes('drizzle')) {
    status = 'caution';
    detail = 'Wet roads may affect traction';
    icon = 'wet';
  } else if (description.includes('snow') || description.includes('sleet')) {
    status = 'warning';
    detail = 'Hazardous conditions: Snow-covered roads';
    icon = 'snow';
  } else if (description.includes('fog') || description.includes('mist')) {
    status = 'caution';
    detail = 'Reduced visibility ahead';
    icon = 'fog';
  } else if (description.includes('thunder') || description.includes('storm')) {
    status = 'warning';
    detail = 'Severe weather: Thunderstorms';
    icon = 'storm';
  } else if (temp < 32) {
    status = 'warning';
    detail = 'Potential for black ice on road surfaces';
    icon = 'ice';
  } else if (temp > 95) {
    status = 'caution';
    detail = 'High temperatures may affect tire pressure';
    icon = 'hot';
  }
  
  return { status, detail, icon };
};

const calculateRoutePerformance = (weather: any, distance: number, startTemp: number, endTemp: number) => {
  // Calculate fuel efficiency impact based on temperature, weather, and distance
  const avgTemp = (startTemp + endTemp) / 2;
  let fuelEfficiencyImpact = 0;
  
  // Temperature impacts fuel efficiency
  if (avgTemp < 40) {
    fuelEfficiencyImpact -= 3; // Cold reduces efficiency by ~3%
  } else if (avgTemp > 90) {
    fuelEfficiencyImpact -= 1; // Heat reduces efficiency by ~1%
  }
  
  // Weather impacts on fuel efficiency
  const weatherDesc = weather?.description?.toLowerCase() || '';
  if (weatherDesc.includes('rain') || weatherDesc.includes('snow')) {
    fuelEfficiencyImpact -= 2; // Rain/snow reduces efficiency
  }
  
  // Calculate potential time savings with optimal driving
  const timeImpact = Math.round(distance * 0.05); // 5% time savings potential
  
  return {
    fuelEfficiencyImpact,
    optimalDepartureTime: getOptimalDepartureTime(weather),
    potentialTimeSavings: timeImpact,
    trafficLikelihood: getTrafficLikelihood(distance),
  };
};

const getOptimalDepartureTime = (weather: any) => {
  const currentHour = new Date().getHours();
  
  // Avoid rush hours (7-9 AM, 4-6 PM)
  if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 18)) {
    return 'Current time is during peak traffic. Consider delaying departure by 1-2 hours for better conditions.';
  }
  
  // Avoid driving in bad weather if possible
  const weatherDesc = weather?.description?.toLowerCase() || '';
  if (
    weatherDesc.includes('storm') || 
    weatherDesc.includes('heavy rain') || 
    weatherDesc.includes('snow')
  ) {
    return 'Current weather conditions are less than ideal. Consider waiting for weather to improve if possible.';
  }
  
  return 'Current time appears optimal for departure based on traffic patterns and weather conditions.';
};

const getTrafficLikelihood = (distance: number) => {
  // Simplified traffic model based on route distance
  // Longer routes typically have more variables and higher likelihood of traffic incidents
  if (distance < 10) {
    return 'Low';
  } else if (distance < 30) {
    return 'Moderate';
  } else {
    return 'High';
  }
};

const ROUTE_CATEGORIES = [
  { id: 'scenic', label: 'Scenic Drive', icon: '🌄' },
  { id: 'track', label: 'Track Day', icon: '🏁' },
  { id: 'weekend', label: 'Weekend Getaway', icon: '🏞️' },
  { id: 'commute', label: 'Daily Commute', icon: '🏙️' },
  { id: 'enthusiast', label: 'Enthusiast Run', icon: '🏎️' },
];

// Sample data for demonstration purposes
const SAMPLE_ROUTES: Route[] = [
  {
    id: 1,
    name: "Mountain Drive - Blue Ridge Parkway",
    startPoint: { id: "asheville", name: "Asheville, NC", lat: 35.5951, lon: -82.5515 },
    endPoint: { id: "blowing_rock", name: "Blowing Rock, NC", lat: 36.1354, lon: -81.6764 },
    distance: 93,
    estimatedTime: "2h 15m",
    notes: "Beautiful mountain scenery with numerous overlooks. Watch for fog in early morning.",
    category: "scenic",
    favorite: true,
    lastDriven: "2023-09-15"
  },
  {
    id: 2,
    name: "Charlotte Motor Speedway Loop",
    startPoint: { id: "concord", name: "Concord, NC", lat: 35.4088, lon: -80.5795 },
    endPoint: { id: "concord", name: "Concord, NC", lat: 35.4088, lon: -80.5795 },
    distance: 42,
    estimatedTime: "55m",
    notes: "Great weekend drive with sweeping curves and good pavement. Stop at the speedway visitor center.",
    category: "enthusiast",
    favorite: true,
    lastDriven: "2023-10-22"
  },
  {
    id: 3,
    name: "Lake Norman Scenic Loop",
    startPoint: { id: "davidson", name: "Davidson, NC", lat: 35.4993, lon: -80.8487 },
    endPoint: { id: "mooresville", name: "Mooresville, NC", lat: 35.5848, lon: -80.8104 },
    distance: 28,
    estimatedTime: "45m",
    notes: "Relaxing drive with lake views. Several restaurants along the way with outdoor seating.",
    category: "weekend",
    favorite: false,
    lastDriven: "2023-08-05"
  }
];

const RoutePlannerPage = () => {
  const [routes, setRoutes] = useState<Route[]>(SAMPLE_ROUTES);
  const [activeTab, setActiveTab] = useState('create');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [activeActionTab, setActiveActionTab] = useState('overview');
  
  // New route state
  const [newRoute, setNewRoute] = useState<Partial<Route>>({
    id: Date.now(),
    name: "",
    category: "scenic",
    favorite: false,
    distance: 0,
    estimatedTime: "",
    notes: "",
  });
  
  // Location search state
  const [startLocationInput, setStartLocationInput] = useState("");
  const [endLocationInput, setEndLocationInput] = useState("");
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingEnd, setIsSearchingEnd] = useState(false);
  const [startSearchResults, setStartSearchResults] = useState<any[]>([]);
  const [endSearchResults, setEndSearchResults] = useState<any[]>([]);
  
  // Form focus refs
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  
  // Handle searching for starting location
  const handleStartLocationSearch = async () => {
    if (!startLocationInput.trim()) return;
    
    setIsSearchingStart(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(startLocationInput)}`);
      if (!response.ok) throw new Error('Location search failed');
      
      const data = await response.json();
      setStartSearchResults(data);
    } catch (err) {
      console.error('Error searching for start location:', err);
    } finally {
      setIsSearchingStart(false);
    }
  };
  
  // Handle searching for end location
  const handleEndLocationSearch = async () => {
    if (!endLocationInput.trim()) return;
    
    setIsSearchingEnd(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(endLocationInput)}`);
      if (!response.ok) throw new Error('Location search failed');
      
      const data = await response.json();
      setEndSearchResults(data);
    } catch (err) {
      console.error('Error searching for end location:', err);
    } finally {
      setIsSearchingEnd(false);
    }
  };
  
  // Select start location from search results
  const selectStartLocation = (result: any) => {
    const location: Location = {
      id: `${result.lat},${result.lon}`,
      name: result.name + (result.state ? `, ${result.state}` : ''),
      lat: result.lat,
      lon: result.lon,
      placeId: result.place_id
    };
    
    setNewRoute(prev => ({ ...prev, startPoint: location }));
    setStartLocationInput(location.name);
    setStartSearchResults([]);
    
    // Focus next input after selection
    if (endInputRef.current && !newRoute.endPoint) {
      endInputRef.current.focus();
    }
  };
  
  // Select end location from search results
  const selectEndLocation = (result: any) => {
    const location: Location = {
      id: `${result.lat},${result.lon}`,
      name: result.name + (result.state ? `, ${result.state}` : ''),
      lat: result.lat,
      lon: result.lon,
      placeId: result.place_id
    };
    
    setNewRoute(prev => ({ ...prev, endPoint: location }));
    setEndLocationInput(location.name);
    setEndSearchResults([]);
    
    // Calculate estimated distance and time (simplified)
    if (newRoute.startPoint) {
      const startLat = newRoute.startPoint.lat;
      const startLon = newRoute.startPoint.lon;
      const endLat = location.lat;
      const endLon = location.lon;
      
      // Simplified distance calculation using Haversine formula
      const distance = calculateDistance(startLat, startLon, endLat, endLon);
      const timeInMinutes = Math.round(distance * 1.2); // Simplified time calculation
      
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      const formattedTime = hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes}m`;
      
      setNewRoute(prev => ({ 
        ...prev, 
        distance: Math.round(distance), 
        estimatedTime: formattedTime
      }));
    }
  };
  
  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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
  
  // Handle form submission to add new route
  const handleAddRoute = () => {
    // Validate required fields
    if (!newRoute.name || !newRoute.startPoint || !newRoute.endPoint) {
      alert("Please complete all required fields.");
      return;
    }
    
    // Create new route object
    const completeRoute: Route = {
      id: Date.now(),
      name: newRoute.name || "Unnamed Route",
      startPoint: newRoute.startPoint as Location,
      endPoint: newRoute.endPoint as Location,
      distance: newRoute.distance || 0,
      estimatedTime: newRoute.estimatedTime || "0m",
      notes: newRoute.notes || "",
      category: newRoute.category || "scenic",
      favorite: newRoute.favorite || false,
      lastDriven: new Date().toISOString().split('T')[0]
    };
    
    // Add to routes
    setRoutes([...routes, completeRoute]);
    
    // Reset form
    setNewRoute({
      id: Date.now(),
      name: "",
      category: "scenic",
      favorite: false,
      distance: 0,
      estimatedTime: "",
      notes: "",
    });
    setStartLocationInput("");
    setEndLocationInput("");
  };
  
  // Handle selecting a route to view details
  const handleSelectRoute = async (route: Route) => {
    setSelectedRoute(route);
    setActiveTab('details');
    setActiveActionTab('overview');
    
    // Load weather data for this route
    setIsLoadingWeather(true);
    try {
      // Get weather at start and end points
      const startWeather = await getWeatherData({
        lat: route.startPoint.lat,
        lon: route.startPoint.lon
      }, 'imperial');
      
      const endWeather = await getWeatherData({
        lat: route.endPoint.lat,
        lon: route.endPoint.lon
      }, 'imperial');
      
      // Get additional weather details for start point
      const startOneCall = await getOneCallData({
        lat: route.startPoint.lat,
        lon: route.startPoint.lon
      }, 'imperial');
      
      // Create road condition evaluations
      const startCondition = getRoadConditionForLocation(
        startWeather.weather[0], 
        startWeather.main.temp
      );
      
      const endCondition = getRoadConditionForLocation(
        endWeather.weather[0], 
        endWeather.main.temp
      );
      
      // Create midpoints along the route for more detailed conditions
      const midLat = (route.startPoint.lat + route.endPoint.lat) / 2;
      const midLon = (route.startPoint.lon + route.endPoint.lon) / 2;
      
      const midWeather = await getWeatherData({
        lat: midLat,
        lon: midLon
      }, 'imperial');
      
      const midCondition = getRoadConditionForLocation(
        midWeather.weather[0], 
        midWeather.main.temp
      );
      
      // Calculate route performance metrics
      const performance = calculateRoutePerformance(
        startWeather.weather[0],
        route.distance,
        startWeather.main.temp,
        endWeather.main.temp
      );
      
      // Combine all data
      setWeatherData({
        startPoint: {
          weather: startWeather,
          oneCall: startOneCall,
          condition: startCondition
        },
        midPoint: {
          weather: midWeather,
          condition: midCondition
        },
        endPoint: {
          weather: endWeather,
          condition: endCondition
        },
        performance
      });
    } catch (err) {
      console.error('Error fetching weather data for route:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  };
  
  // Handle back button click
  const handleBackToList = () => {
    setActiveTab('create');
    setSelectedRoute(null);
    setWeatherData(null);
  };
  
  // Get status color based on road condition
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-500';
      case 'caution':
        return 'text-amber-500';
      case 'warning':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };
  
  // Render road condition icon
  const renderConditionIcon = (icon: string) => {
    switch (icon) {
      case 'wet':
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      case 'snow':
        return <Cloud className="h-5 w-5 text-white" />;
      case 'fog':
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'storm':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'ice':
        return <Thermometer className="h-5 w-5 text-blue-300" />;
      case 'hot':
        return <Thermometer className="h-5 w-5 text-red-500" />;
      default:
        return <Compass className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-blue-400 font-orbitron text-3xl mb-4 md:mb-0 flex items-center">
          <Navigation className="mr-3 h-8 w-8" />
          Paddock20™ Route Planner
        </h1>
        
        {/* Top navigation/control buttons */}
        {activeTab === 'details' && selectedRoute && (
          <button 
            onClick={handleBackToList}
            className="bg-blue-900/30 text-blue-400 px-4 py-2 rounded flex items-center text-sm"
          >
            <CornerUpRight className="h-4 w-4 mr-2" />
            Back to Routes
          </button>
        )}
      </div>
      
      {activeTab === 'create' && (
        <>
          {/* Route Creation Form */}
          <section className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg p-6 mb-8 border border-gray-800">
            <h2 className="text-blue-400 font-orbitron text-2xl mb-6 flex items-center">
              <RouteIcon className="mr-3 h-6 w-6" />
              Create New Route
            </h2>
            
            <div className="space-y-6">
              {/* Route Name and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Route Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Mountain View Run"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                    className="w-full bg-black text-white p-3 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Category</label>
                  <select
                    value={newRoute.category}
                    onChange={(e) => setNewRoute({ ...newRoute, category: e.target.value })}
                    className="w-full bg-black text-white p-3 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    {ROUTE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Start Location with search */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Starting Point</label>
                <div className="relative">
                  <div className="flex">
                    <div className="relative flex-1">
                      <input
                        ref={startInputRef}
                        type="text"
                        placeholder="Search for starting location..."
                        value={startLocationInput}
                        onChange={(e) => setStartLocationInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartLocationSearch()}
                        className="w-full bg-black text-white p-3 rounded-l border border-gray-700 focus:border-blue-500 focus:outline-none"
                      />
                      {isSearchingStart && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleStartLocationSearch}
                      className="bg-blue-900/40 text-blue-400 px-3 border border-blue-900 rounded-r hover:bg-blue-900/60"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Start location search results dropdown */}
                  {startSearchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-black border border-gray-700 rounded-md shadow-lg">
                      <ul className="py-1 max-h-60 overflow-auto">
                        {startSearchResults.map((result, idx) => (
                          <li
                            key={idx}
                            onClick={() => selectStartLocation(result)}
                            className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-start"
                          >
                            <MapPin className="h-4 w-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-white">{result.name}</p>
                              <p className="text-gray-400 text-xs">
                                {result.state && <span>{result.state}, </span>}
                                {result.country}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {newRoute.startPoint && (
                  <div className="mt-2 px-3 py-2 bg-green-900/20 border border-green-900/30 rounded-md flex items-center">
                    <MapPin className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-green-400 text-sm">{newRoute.startPoint.name}</span>
                  </div>
                )}
              </div>
              
              {/* End Location with search */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Destination</label>
                <div className="relative">
                  <div className="flex">
                    <div className="relative flex-1">
                      <input
                        ref={endInputRef}
                        type="text"
                        placeholder="Search for destination..."
                        value={endLocationInput}
                        onChange={(e) => setEndLocationInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEndLocationSearch()}
                        className="w-full bg-black text-white p-3 rounded-l border border-gray-700 focus:border-blue-500 focus:outline-none"
                      />
                      {isSearchingEnd && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleEndLocationSearch}
                      className="bg-blue-900/40 text-blue-400 px-3 border border-blue-900 rounded-r hover:bg-blue-900/60"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* End location search results dropdown */}
                  {endSearchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-black border border-gray-700 rounded-md shadow-lg">
                      <ul className="py-1 max-h-60 overflow-auto">
                        {endSearchResults.map((result, idx) => (
                          <li
                            key={idx}
                            onClick={() => selectEndLocation(result)}
                            className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-start"
                          >
                            <MapPin className="h-4 w-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-white">{result.name}</p>
                              <p className="text-gray-400 text-xs">
                                {result.state && <span>{result.state}, </span>}
                                {result.country}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {newRoute.endPoint && (
                  <div className="mt-2 px-3 py-2 bg-green-900/20 border border-green-900/30 rounded-md flex items-center">
                    <MapPin className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-green-400 text-sm">{newRoute.endPoint.name}</span>
                  </div>
                )}
              </div>
              
              {/* Route details section */}
              {newRoute.startPoint && newRoute.endPoint && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-blue-900/10 rounded-md border border-blue-900/20">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Estimated Distance:</p>
                    <p className="text-white text-lg">{newRoute.distance} miles</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Estimated Drive Time:</p>
                    <p className="text-white text-lg">{newRoute.estimatedTime}</p>
                  </div>
                </div>
              )}
              
              {/* Additional details */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Route Notes</label>
                <textarea
                  placeholder="Road conditions, scenic viewpoints, rest stops, etc."
                  value={newRoute.notes}
                  onChange={(e) => setNewRoute({ ...newRoute, notes: e.target.value })}
                  className="w-full bg-black text-white p-3 rounded border border-gray-700 focus:border-blue-500 focus:outline-none min-h-[100px]"
                ></textarea>
              </div>
              
              {/* Favorite toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="favorite"
                  checked={newRoute.favorite}
                  onChange={(e) => setNewRoute({ ...newRoute, favorite: e.target.checked })}
                  className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 rounded"
                />
                <label htmlFor="favorite" className="text-white">Add to favorites</label>
              </div>
              
              {/* Save button */}
              <div className="pt-4">
                <button
                  onClick={handleAddRoute}
                  disabled={!newRoute.name || !newRoute.startPoint || !newRoute.endPoint}
                  className={`w-full py-3 rounded-md font-medium ${
                    !newRoute.name || !newRoute.startPoint || !newRoute.endPoint
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-500 text-black'
                  }`}
                >
                  Save New Route
                </button>
              </div>
            </div>
          </section>
          
          {/* Saved Routes */}
          <section className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg p-6 border border-gray-800">
            <h2 className="text-blue-400 font-orbitron text-2xl mb-6 flex items-center">
              <MapIcon className="mr-3 h-6 w-6" />
              Your Routes
            </h2>
            
            {routes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No routes saved yet. Create your first route to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route) => {
                  const categoryObj = ROUTE_CATEGORIES.find(cat => cat.id === route.category) || ROUTE_CATEGORIES[0];
                  
                  return (
                    <div 
                      key={route.id} 
                      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 overflow-hidden transition-all hover:border-blue-500 cursor-pointer"
                      onClick={() => handleSelectRoute(route)}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-blue-400 font-orbitron text-lg">{route.name}</h3>
                          <div className="flex space-x-2">
                            <span className="text-xl">{categoryObj.icon}</span>
                            {route.favorite && <span className="text-yellow-400">⭐</span>}
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-green-500 mr-2" />
                            <p className="text-white">{route.startPoint.name}</p>
                          </div>
                          <div className="border-l-2 border-dotted border-blue-500 h-4 ml-2"></div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-red-500 mr-2" />
                            <p className="text-white">{route.endPoint.name}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Distance</p>
                            <p className="text-white font-medium">{route.distance} miles</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Est. Time</p>
                            <p className="text-white font-medium">{route.estimatedTime}</p>
                          </div>
                        </div>
                        
                        {route.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-gray-400 text-xs line-clamp-2">{route.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-900 px-5 py-2 text-xs flex justify-between items-center">
                        <span className="text-gray-400">
                          {route.lastDriven ? `Last driven: ${new Date(route.lastDriven).toLocaleDateString()}` : 'Never driven'}
                        </span>
                        <span className="text-blue-400 hover:text-blue-300">View Details →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
      
      {/* Route Details View */}
      {activeTab === 'details' && selectedRoute && (
        <div className="space-y-6">
          {/* Route Header */}
          <section className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg p-6 border border-gray-800">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-blue-400 font-orbitron text-2xl mr-3">{selectedRoute.name}</h2>
                  {selectedRoute.favorite && <span className="text-yellow-400 text-xl">⭐</span>}
                  <span className="ml-2 px-3 py-1 bg-gray-800 rounded-full text-gray-300 text-xs">
                    {ROUTE_CATEGORIES.find(cat => cat.id === selectedRoute.category)?.label || 'Route'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm">Starting Point</span>
                    <span className="text-white flex items-center">
                      <MapPin className="h-4 w-4 text-green-500 mr-1" />
                      {selectedRoute.startPoint.name}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm">Destination</span>
                    <span className="text-white flex items-center">
                      <MapPin className="h-4 w-4 text-red-500 mr-1" />
                      {selectedRoute.endPoint.name}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm">Last Driven</span>
                    <span className="text-white flex items-center">
                      <CalendarClock className="h-4 w-4 text-blue-400 mr-1" />
                      {selectedRoute.lastDriven ? new Date(selectedRoute.lastDriven).toLocaleDateString() : 'Never driven'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 flex flex-col items-end">
                <div className="flex space-x-4 items-center">
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Distance</p>
                    <p className="text-white text-xl font-medium">{selectedRoute.distance} miles</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Est. Time</p>
                    <p className="text-white text-xl font-medium">{selectedRoute.estimatedTime}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Link to="/journal" className="px-3 py-1 bg-gray-800 text-gray-300 rounded-md text-sm hover:bg-gray-700 transition-colors">
                    Log Drive
                  </Link>
                  <button className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-md text-sm hover:bg-blue-900/50 transition-colors">
                    Share Route
                  </button>
                </div>
              </div>
            </div>
            
            {/* Route notes */}
            {selectedRoute.notes && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">Notes</p>
                <p className="text-white mt-1">{selectedRoute.notes}</p>
              </div>
            )}
          </section>
          
          {/* Route Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              className={`px-4 py-2 font-medium ${
                activeActionTab === 'overview' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveActionTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeActionTab === 'conditions' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveActionTab('conditions')}
            >
              Road Conditions
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeActionTab === 'performance' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveActionTab('performance')}
            >
              Drive Performance
            </button>
          </div>
          
          {/* Tab content */}
          <div>
            {isLoadingWeather ? (
              <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg p-6 border border-gray-800 flex justify-center items-center py-16">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400">Loading route intelligence...</p>
                </div>
              </div>
            ) : weatherData ? (
              <>
                {/* Overview Tab */}
                {activeActionTab === 'overview' && (
                  <section className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg p-6 border border-gray-800">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-6">Route Intelligence</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Start Point Weather */}
                      <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                        <h4 className="text-green-500 font-medium mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Starting Point Weather
                        </h4>
                        
                        <div className="flex items-center mb-4">
                          <div>
                            <p className="text-white text-2xl font-medium">
                              {formatTemperature(weatherData.startPoint.weather.main.temp, 'imperial')}
                            </p>
                            <p className="text-gray-400 capitalize">{weatherData.startPoint.weather.weather[0].description}</p>
                          </div>
                          {weatherData.startPoint.weather.weather[0].icon && (
                            <img
                              src={`http://openweathermap.org/img/wn/${weatherData.startPoint.weather.weather[0].icon}@2x.png`}
                              alt={weatherData.startPoint.weather.weather[0].description}
                              className="h-16 w-16 ml-auto"
                            />
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Humidity:</span>
                            <span className="text-white">{weatherData.startPoint.weather.main.humidity}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Wind:</span>
                            <span className="text-white">{Math.round(weatherData.startPoint.weather.wind.speed)} mph</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Visibility:</span>
                            <span className="text-white">{(weatherData.startPoint.weather.visibility / 1609).toFixed(1)} mi</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* End Point Weather */}
                      <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                        <h4 className="text-red-500 font-medium mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Destination Weather
                        </h4>
                        
                        <div className="flex items-center mb-4">
                          <div>
                            <p className="text-white text-2xl font-medium">
                              {formatTemperature(weatherData.endPoint.weather.main.temp, 'imperial')}
                            </p>
                            <p className="text-gray-400 capitalize">{weatherData.endPoint.weather.weather[0].description}</p>
                          </div>
                          {weatherData.endPoint.weather.weather[0].icon && (
                            <img
                              src={`http://openweathermap.org/img/wn/${weatherData.endPoint.weather.weather[0].icon}@2x.png`}
                              alt={weatherData.endPoint.weather.weather[0].description}
                              className="h-16 w-16 ml-auto"
                            />
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Humidity:</span>
                            <span className="text-white">{weatherData.endPoint.weather.main.humidity}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Wind:</span>
                            <span className="text-white">{Math.round(weatherData.endPoint.weather.wind.speed)} mph</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Visibility:</span>
                            <span className="text-white">{(weatherData.endPoint.weather.visibility / 1609).toFixed(1)} mi</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Route Timing Intelligence */}
                      <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                        <h4 className="text-blue-400 font-medium mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Optimal Departure
                        </h4>
                        
                        <p className="text-gray-300 text-sm mb-4">
                          {weatherData.performance.optimalDepartureTime}
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-gray-400 text-xs">Expected Traffic</p>
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-1">
                              <div 
                                className={`h-full ${
                                  weatherData.performance.trafficLikelihood === 'Low' 
                                    ? 'w-1/4 bg-green-500' 
                                    : weatherData.performance.trafficLikelihood === 'Moderate'
                                      ? 'w-1/2 bg-yellow-500'
                                      : 'w-3/4 bg-red-500'
                                }`}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Low</span>
                              <span>Moderate</span>
                              <span>High</span>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-gray-800">
                            <p className="text-gray-400 text-xs mb-1">Time Impact</p>
                            <p className="text-white flex items-center">
                              <span className="text-green-500 mr-2">↓</span>
                              Save up to {weatherData.performance.potentialTimeSavings} min with optimal conditions
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Road condition summary */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-blue-900/10 to-black/10 rounded-lg border border-blue-900/30">
                      <h4 className="text-blue-400 font-medium mb-4">Road Condition Summary</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-3 rounded-lg flex items-center ${
                          weatherData.startPoint.condition.status === 'optimal' 
                            ? 'bg-green-900/20 border border-green-900/30' 
                            : weatherData.startPoint.condition.status === 'caution'
                              ? 'bg-amber-900/20 border border-amber-900/30'
                              : 'bg-red-900/20 border border-red-900/30'
                        }`}>
                          {renderConditionIcon(weatherData.startPoint.condition.icon)}
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${getStatusColor(weatherData.startPoint.condition.status)}`}>
                              Start: {weatherData.startPoint.condition.status === 'optimal' ? 'Optimal' : weatherData.startPoint.condition.status === 'caution' ? 'Use Caution' : 'Warning'}
                            </p>
                            <p className="text-xs text-gray-400">{weatherData.startPoint.condition.detail}</p>
                          </div>
                        </div>
                        
                        <div className={`p-3 rounded-lg flex items-center ${
                          weatherData.midPoint.condition.status === 'optimal' 
                            ? 'bg-green-900/20 border border-green-900/30' 
                            : weatherData.midPoint.condition.status === 'caution'
                              ? 'bg-amber-900/20 border border-amber-900/30'
                              : 'bg-red-900/20 border border-red-900/30'
                        }`}>
                          {renderConditionIcon(weatherData.midPoint.condition.icon)}
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${getStatusColor(weatherData.midPoint.condition.status)}`}>
                              Midpoint: {weatherData.midPoint.condition.status === 'optimal' ? 'Optimal' : weatherData.midPoint.condition.status === 'caution' ? 'Use Caution' : 'Warning'}
                            </p>
                            <p className="text-xs text-gray-400">{weatherData.midPoint.condition.detail}</p>
                          </div>
                        </div>
                        
                        <div className={`p-3 rounded-lg flex items-center ${
                          weatherData.endPoint.condition.status === 'optimal' 
                            ? 'bg-green-900/20 border border-green-900/30' 
                            : weatherData.endPoint.condition.status === 'caution'
                              ? 'bg-amber-900/20 border border-amber-900/30'
                              : 'bg-red-900/20 border border-red-900/30'
                        }`}>
                          {renderConditionIcon(weatherData.endPoint.condition.icon)}
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${getStatusColor(weatherData.endPoint.condition.status)}`}>
                              Destination: {weatherData.endPoint.condition.status === 'optimal' ? 'Optimal' : weatherData.endPoint.condition.status === 'caution' ? 'Use Caution' : 'Warning'}
                            </p>
                            <p className="text-xs text-gray-400">{weatherData.endPoint.condition.detail}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
                
                {/* Conditions Tab */}
                {activeActionTab === 'conditions' && (
                  <section className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg p-6 border border-gray-800">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-6">Detailed Road Conditions</h3>
                    
                    <div className="space-y-6">
                      {/* Route visualization */}
                      <div className="relative p-4 bg-black/30 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm text-white">{selectedRoute.startPoint.name}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {selectedRoute.distance} miles
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-white">{selectedRoute.endPoint.name}</span>
                            <div className="h-4 w-4 rounded-full bg-red-500 ml-2"></div>
                          </div>
                        </div>
                        
                        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                          {/* Start marker */}
                          <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-green-500 to-yellow-500"></div>
                          
                          {/* Mid marker */}
                          <div className="absolute left-1/3 top-0 bottom-0 w-1/3 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                          
                          {/* End marker */}
                          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-orange-500 to-red-500"></div>
                          
                          {/* Condition markers */}
                          <div className="absolute left-0 top-0 h-1 w-full flex">
                            <div className={`h-full w-1/3 ${
                              weatherData.startPoint.condition.status === 'optimal' ? 'bg-green-500/70' : 
                              weatherData.startPoint.condition.status === 'caution' ? 'bg-amber-500/70' : 'bg-red-500/70'
                            }`}></div>
                            <div className={`h-full w-1/3 ${
                              weatherData.midPoint.condition.status === 'optimal' ? 'bg-green-500/70' : 
                              weatherData.midPoint.condition.status === 'caution' ? 'bg-amber-500/70' : 'bg-red-500/70'
                            }`}></div>
                            <div className={`h-full w-1/3 ${
                              weatherData.endPoint.condition.status === 'optimal' ? 'bg-green-500/70' : 
                              weatherData.endPoint.condition.status === 'caution' ? 'bg-amber-500/70' : 'bg-red-500/70'
                            }`}></div>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                          <span>0 mi</span>
                          <span>{Math.round(selectedRoute.distance / 2)} mi</span>
                          <span>{selectedRoute.distance} mi</span>
                        </div>
                      </div>
                      
                      {/* Segment details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Start segment */}
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                          <h4 className="text-blue-400 font-medium mb-3 flex items-center">
                            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                            Start Segment
                          </h4>
                          
                          <div className={`mb-4 p-3 rounded-lg ${
                            weatherData.startPoint.condition.status === 'optimal' ? 'bg-green-900/20 border border-green-900/30' : 
                            weatherData.startPoint.condition.status === 'caution' ? 'bg-amber-900/20 border border-amber-900/30' : 
                            'bg-red-900/20 border border-red-900/30'
                          }`}>
                            <div className="flex items-center">
                              {renderConditionIcon(weatherData.startPoint.condition.icon)}
                              <div className="ml-3">
                                <p className={`text-sm font-medium ${getStatusColor(weatherData.startPoint.condition.status)}`}>
                                  {weatherData.startPoint.condition.status === 'optimal' ? 'Optimal Conditions' : 
                                   weatherData.startPoint.condition.status === 'caution' ? 'Use Caution' : 'Warning'}
                                </p>
                                <p className="text-xs text-gray-400">{weatherData.startPoint.condition.detail}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Temp:</span>
                              <span className="text-white">{formatTemperature(weatherData.startPoint.weather.main.temp, 'imperial')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Weather:</span>
                              <span className="text-white capitalize">{weatherData.startPoint.weather.weather[0].description}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Visibility:</span>
                              <span className="text-white">{(weatherData.startPoint.weather.visibility / 1609).toFixed(1)} mi</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Wind:</span>
                              <span className="text-white">{Math.round(weatherData.startPoint.weather.wind.speed)} mph</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mid segment */}
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                          <h4 className="text-blue-400 font-medium mb-3 flex items-center">
                            <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                            Mid Segment
                          </h4>
                          
                          <div className={`mb-4 p-3 rounded-lg ${
                            weatherData.midPoint.condition.status === 'optimal' ? 'bg-green-900/20 border border-green-900/30' : 
                            weatherData.midPoint.condition.status === 'caution' ? 'bg-amber-900/20 border border-amber-900/30' : 
                            'bg-red-900/20 border border-red-900/30'
                          }`}>
                            <div className="flex items-center">
                              {renderConditionIcon(weatherData.midPoint.condition.icon)}
                              <div className="ml-3">
                                <p className={`text-sm font-medium ${getStatusColor(weatherData.midPoint.condition.status)}`}>
                                  {weatherData.midPoint.condition.status === 'optimal' ? 'Optimal Conditions' : 
                                   weatherData.midPoint.condition.status === 'caution' ? 'Use Caution' : 'Warning'}
                                </p>
                                <p className="text-xs text-gray-400">{weatherData.midPoint.condition.detail}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Temp:</span>
                              <span className="text-white">{formatTemperature(weatherData.midPoint.weather.main.temp, 'imperial')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Weather:</span>
                              <span className="text-white capitalize">{weatherData.midPoint.weather.weather[0].description}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Visibility:</span>
                              <span className="text-white">{(weatherData.midPoint.weather.visibility / 1609).toFixed(1)} mi</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Wind:</span>
                              <span className="text-white">{Math.round(weatherData.midPoint.weather.wind.speed)} mph</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* End segment */}
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                          <h4 className="text-blue-400 font-medium mb-3 flex items-center">
                            <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                            End Segment
                          </h4>
                          
                          <div className={`mb-4 p-3 rounded-lg ${
                            weatherData.endPoint.condition.status === 'optimal' ? 'bg-green-900/20 border border-green-900/30' : 
                            weatherData.endPoint.condition.status === 'caution' ? 'bg-amber-900/20 border border-amber-900/30' : 
                            'bg-red-900/20 border border-red-900/30'
                          }`}>
                            <div className="flex items-center">
                              {renderConditionIcon(weatherData.endPoint.condition.icon)}
                              <div className="ml-3">
                                <p className={`text-sm font-medium ${getStatusColor(weatherData.endPoint.condition.status)}`}>
                                  {weatherData.endPoint.condition.status === 'optimal' ? 'Optimal Conditions' : 
                                   weatherData.endPoint.condition.status === 'caution' ? 'Use Caution' : 'Warning'}
                                </p>
                                <p className="text-xs text-gray-400">{weatherData.endPoint.condition.detail}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Temp:</span>
                              <span className="text-white">{formatTemperature(weatherData.endPoint.weather.main.temp, 'imperial')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Weather:</span>
                              <span className="text-white capitalize">{weatherData.endPoint.weather.weather[0].description}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Visibility:</span>
                              <span className="text-white">{(weatherData.endPoint.weather.visibility / 1609).toFixed(1)} mi</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Wind:</span>
                              <span className="text-white">{Math.round(weatherData.endPoint.weather.wind.speed)} mph</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Driving advisory */}
                      <div className="mt-6 p-4 bg-blue-900/10 border border-blue-900/30 rounded-lg">
                        <h4 className="text-blue-400 font-medium mb-3">Driving Advisory</h4>
                        
                        <ul className="space-y-3">
                          {weatherData.startPoint.condition.status !== 'optimal' && (
                            <li className="flex items-start">
                              <AlertTriangle className={`h-5 w-5 mr-2 ${getStatusColor(weatherData.startPoint.condition.status)}`} />
                              <p className="text-gray-300">
                                <span className="font-medium">Start Segment:</span> {weatherData.startPoint.condition.detail}. 
                                Adjust driving style accordingly.
                              </p>
                            </li>
                          )}
                          
                          {weatherData.midPoint.condition.status !== 'optimal' && (
                            <li className="flex items-start">
                              <AlertTriangle className={`h-5 w-5 mr-2 ${getStatusColor(weatherData.midPoint.condition.status)}`} />
                              <p className="text-gray-300">
                                <span className="font-medium">Mid Segment:</span> {weatherData.midPoint.condition.detail}. 
                                Consider route alternatives if conditions are severe.
                              </p>
                            </li>
                          )}
                          
                          {weatherData.endPoint.condition.status !== 'optimal' && (
                            <li className="flex items-start">
                              <AlertTriangle className={`h-5 w-5 mr-2 ${getStatusColor(weatherData.endPoint.condition.status)}`} />
                              <p className="text-gray-300">
                                <span className="font-medium">End Segment:</span> {weatherData.endPoint.condition.detail}. 
                                Prepare for these conditions as you approach your destination.
                              </p>
                            </li>
                          )}
                          
                          {weatherData.startPoint.condition.status === 'optimal' && 
                           weatherData.midPoint.condition.status === 'optimal' && 
                           weatherData.endPoint.condition.status === 'optimal' && (
                            <li className="flex items-start">
                              <div className="h-5 w-5 mr-2 text-green-500">✓</div>
                              <p className="text-gray-300">
                                All segments show optimal driving conditions. Enjoy your journey with standard safety precautions.
                              </p>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </section>
                )}
                
                {/* Performance Tab */}
                {activeActionTab === 'performance' && (
                  <section className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg p-6 border border-gray-800">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-6">Vehicle Performance Intelligence</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Fuel efficiency & emissions panel */}
                      <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                        <h4 className="text-green-500 font-medium mb-3 flex items-center">
                          <Car className="h-4 w-4 mr-2" />
                          Performance Impact
                        </h4>
                        
                        <div className="space-y-4">
                          {/* Fuel efficiency */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-sm text-gray-400">Fuel Efficiency Impact</p>
                              <p className="text-sm text-white font-medium">
                                {weatherData.performance.fuelEfficiencyImpact <= 0 
                                  ? `${weatherData.performance.fuelEfficiencyImpact}%` 
                                  : `+${weatherData.performance.fuelEfficiencyImpact}%`
                                }
                              </p>
                            </div>
                            
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full ${
                                weatherData.performance.fuelEfficiencyImpact >= 0
                                  ? 'bg-green-500'
                                  : 'bg-amber-500'
                              }`} style={{ 
                                width: `${Math.min(100, 50 + (weatherData.performance.fuelEfficiencyImpact * 5))}%` 
                              }}></div>
                            </div>
                            
                            <p className="mt-2 text-xs text-gray-500">
                              {weatherData.performance.fuelEfficiencyImpact <= -2
                                ? "Current conditions may reduce fuel efficiency."
                                : "Minimal impact on fuel efficiency expected."
                              }
                            </p>
                          </div>
                          
                          {/* Temperature difference */}
                          <div className="pt-3 border-t border-gray-800">
                            <p className="text-sm text-gray-400 mb-2">Temperature Change</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Start</p>
                                <p className="text-white font-medium">{formatTemperature(weatherData.startPoint.weather.main.temp, 'imperial')}</p>
                              </div>
                              
                              <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-blue-500 to-red-500 rounded"></div>
                              
                              <div className="text-center">
                                <p className="text-xs text-gray-500">End</p>
                                <p className="text-white font-medium">{formatTemperature(weatherData.endPoint.weather.main.temp, 'imperial')}</p>
                              </div>
                            </div>
                            
                            <p className="mt-2 text-xs text-gray-500">
                              {Math.abs(weatherData.endPoint.weather.main.temp - weatherData.startPoint.weather.main.temp) > 10
                                ? `Significant temperature variation of ${Math.abs(Math.round(weatherData.endPoint.weather.main.temp - weatherData.startPoint.weather.main.temp))}°F along route.`
                                : "Minimal temperature variation along route."
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Route & traffic intel panel */}
                      <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                        <h4 className="text-blue-400 font-medium mb-3 flex items-center">
                          <BarChart className="h-4 w-4 mr-2" />
                          Route Optimization
                        </h4>
                        
                        <div className="space-y-4">
                          {/* Travel time impact */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-sm text-gray-400">Potential Time Savings</p>
                              <p className="text-sm text-white font-medium">
                                Up to {weatherData.performance.potentialTimeSavings} min
                              </p>
                            </div>
                            
                            <div className="w-full h-10 bg-gray-800 rounded-lg overflow-hidden relative">
                              <div className="absolute inset-0 flex items-center px-3">
                                <p className="text-xs text-white z-10">Expected: {selectedRoute.estimatedTime}</p>
                              </div>
                              <div className="absolute right-0 h-full bg-green-500/30 flex items-center justify-end px-3"
                                style={{ width: `${Math.min(30, weatherData.performance.potentialTimeSavings)}%` }}>
                                <p className="text-xs text-green-300 z-10">
                                  Optimized: -{weatherData.performance.potentialTimeSavings} min
                                </p>
                              </div>
                            </div>
                            
                            <p className="mt-2 text-xs text-gray-500">
                              Optimization through traffic avoidance and ideal departure timing.
                            </p>
                          </div>
                          
                          {/* Traffic likelihood */}
                          <div className="pt-3 border-t border-gray-800">
                            <p className="text-sm text-gray-400 mb-2">Traffic Analysis</p>
                            
                            <div className="bg-gray-800 p-3 rounded flex items-center">
                              <div className={`h-3 w-3 rounded-full mr-2 ${
                                weatherData.performance.trafficLikelihood === 'Low' 
                                  ? 'bg-green-500' 
                                  : weatherData.performance.trafficLikelihood === 'Moderate'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}></div>
                              <div>
                                <p className="text-white text-sm">{weatherData.performance.trafficLikelihood} likelihood of congestion</p>
                                <p className="text-xs text-gray-500">Based on route length, time of day, and weather</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Advanced analytics */}
                    <div className="bg-black/30 p-4 rounded-lg border border-gray-800 mt-6">
                      <h4 className="text-blue-400 font-medium mb-4 flex items-center">
                        <Infinity className="h-4 w-4 mr-2" />
                        Performance Recommendations
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-700 rounded-lg p-3">
                          <h5 className="text-green-500 text-sm font-medium mb-2">Driving Mode</h5>
                          <p className="text-white">
                            {weatherData.startPoint.condition.status === 'optimal' && weatherData.endPoint.condition.status === 'optimal'
                              ? "Sport mode suitable for entire route"
                              : weatherData.startPoint.condition.status === 'warning' || weatherData.endPoint.condition.status === 'warning'
                                ? "Recommend comfort/eco mode for safety"
                                : "Mixed mode: adapt based on segment conditions"
                            }
                          </p>
                        </div>
                        
                        <div className="border border-gray-700 rounded-lg p-3">
                          <h5 className="text-green-500 text-sm font-medium mb-2">Tire Pressure</h5>
                          <p className="text-white">
                            {Math.abs(weatherData.endPoint.weather.main.temp - weatherData.startPoint.weather.main.temp) > 15
                              ? "Check tire pressure before return trip due to significant temperature change"
                              : "Standard tire pressure suitable for route conditions"
                            }
                          </p>
                        </div>
                        
                        <div className="border border-gray-700 rounded-lg p-3">
                          <h5 className="text-green-500 text-sm font-medium mb-2">Route Timing</h5>
                          <p className="text-white">{weatherData.performance.optimalDepartureTime}</p>
                        </div>
                        
                        <div className="border border-gray-700 rounded-lg p-3">
                          <h5 className="text-green-500 text-sm font-medium mb-2">Vehicle Settings</h5>
                          <p className="text-white">
                            {weatherData.startPoint.weather.weather[0].main.toLowerCase().includes('rain') || 
                             weatherData.endPoint.weather.weather[0].main.toLowerCase().includes('rain')
                              ? "Auto wipers recommended for intermittent precipitation"
                              : weatherData.startPoint.weather.main.temp > 85 || weatherData.endPoint.weather.main.temp > 85
                                ? "Pre-cool vehicle before departure"
                                : weatherData.startPoint.weather.main.temp < 40 || weatherData.endPoint.weather.main.temp < 40
                                  ? "Pre-heat vehicle before departure"
                                  : "Standard climate control settings recommended"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg p-6 border border-gray-800">
                <p className="text-gray-400 text-center py-8">
                  Route intelligence data is currently unavailable. Please try again later.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlannerPage;