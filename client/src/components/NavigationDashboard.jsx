import React, { useState, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useLocations } from '../contexts/LocationContext';
import { useWeather } from '../contexts/WeatherContext';
import EmbeddedMapView from './EmbeddedMapView';
import NavigationBridge from './NavigationBridge';

/**
 * NavigationDashboard Component
 * 
 * This component combines our embedded map view with the navigation bridge
 * to provide a seamless navigation experience that feels like a white-labeled 
 * integration with external mapping services.
 */
const NavigationDashboard = ({
  initialOrigin = null,
  initialDestination = null,
  showWeatherData = true,
  showRecentRoutes = true,
  isEmbedded = false // When true, renders in a more compact form for embedding
}) => {
  const navigation = useNavigation();
  const locations = useLocations();
  const weather = useWeather();
  
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [waypoints, setWaypoints] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [showBridge, setShowBridge] = useState(false);
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [departureOptions, setDepartureOptions] = useState([]);
  
  // Initialize recent routes from navigation history
  useEffect(() => {
    if (navigation && navigation.navigationHistory) {
      setRecentRoutes(navigation.navigationHistory.slice(0, 5));
    }
  }, [navigation]);
  
  // Update departure windows when route changes
  useEffect(() => {
    if (origin && destination && navigation) {
      const route = {
        originLat: origin.coordinates?.lat,
        originLon: origin.coordinates?.lon,
        destLat: destination.coordinates?.lat,
        destLon: destination.coordinates?.lon
      };
      
      const windows = navigation.getRecommendedDepartureWindows(route, 12);
      setDepartureOptions(windows);
    } else {
      setDepartureOptions([]);
    }
  }, [origin, destination, navigation, weather.weatherData]);
  
  // Handle route selection from recent routes
  const selectRecentRoute = (route) => {
    try {
      // Try to find the origin and destination in saved locations
      let foundOrigin = null;
      let foundDestination = null;
      
      if (route.originId) {
        foundOrigin = locations.locations.find(loc => loc.id === route.originId);
      }
      
      if (route.destId) {
        foundDestination = locations.locations.find(loc => loc.id === route.destId);
      }
      
      // If not found in saved locations, create temporary ones from coordinates
      if (!foundOrigin && route.originLat && route.originLon) {
        foundOrigin = {
          id: `temp-origin-${Date.now()}`,
          name: route.originName || 'Origin',
          coordinates: {
            lat: route.originLat,
            lon: route.originLon
          },
          temporary: true
        };
      }
      
      if (!foundDestination && route.destLat && route.destLon) {
        foundDestination = {
          id: `temp-dest-${Date.now()}`,
          name: route.destName || 'Destination',
          coordinates: {
            lat: route.destLat,
            lon: route.destLon
          },
          temporary: true
        };
      }
      
      // Update state
      if (foundOrigin) setOrigin(foundOrigin);
      if (foundDestination) setDestination(foundDestination);
      
      // Set waypoints if any
      if (route.waypoints && Array.isArray(route.waypoints)) {
        const mappedWaypoints = route.waypoints.map(wp => ({
          id: wp.id || `temp-waypoint-${Date.now()}`,
          name: wp.name || 'Waypoint',
          coordinates: {
            lat: wp.lat,
            lon: wp.lon
          },
          temporary: true
        }));
        
        setWaypoints(mappedWaypoints);
      } else {
        setWaypoints([]);
      }
    } catch (error) {
      console.error('Error selecting recent route:', error);
    }
  };
  
  // Clear the current route
  const clearRoute = () => {
    setOrigin(null);
    setDestination(null);
    setWaypoints([]);
    setRouteData(null);
  };
  
  // Launch external navigation
  const launchNavigation = () => {
    if (origin && destination) {
      setShowBridge(true);
    }
  };
  
  // Swap origin and destination
  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };
  
  // Select a location from saved locations
  const selectLocation = (location, isOrigin = true) => {
    if (isOrigin) {
      setOrigin(location);
      
      // If no destination is set, try to set it from another recent location
      if (!destination && recentRoutes.length > 0) {
        const recentDest = locations.locations.find(
          loc => loc.id === recentRoutes[0].destId
        );
        if (recentDest && recentDest.id !== location.id) {
          setDestination(recentDest);
        }
      }
    } else {
      setDestination(location);
      
      // If no origin is set, try to set it from current location
      if (!origin) {
        locations.getCurrentLocation()
          .then(currentLoc => {
            setOrigin(currentLoc);
          })
          .catch(() => {
            // If getting current location fails, try a recent origin
            if (recentRoutes.length > 0) {
              const recentOrigin = locations.locations.find(
                loc => loc.id === recentRoutes[0].originId
              );
              if (recentOrigin && recentOrigin.id !== location.id) {
                setOrigin(recentOrigin);
              }
            }
          });
      }
    }
  };
  
  // Set a departure time option
  const selectDepartureTime = (window) => {
    navigation.setDepartureTime(window.startTime);
  };
  
  // Get current weather impact on driving
  const getWeatherImpact = () => {
    if (!weather.weatherData || !weather.weatherData.currentConditions) {
      return null;
    }
    
    const condition = weather.weatherData.currentConditions.weather[0].main;
    const temp = Math.round(weather.weatherData.currentConditions.temp);
    const windSpeed = Math.round(weather.weatherData.currentConditions.wind_speed);
    
    let impact = 'Good driving conditions';
    let severity = 'low';
    
    if (condition === 'Snow' || condition === 'Thunderstorm') {
      impact = 'Severe weather affecting routes';
      severity = 'high';
    } else if (condition === 'Rain' || condition === 'Drizzle') {
      impact = 'Rain may affect road conditions';
      severity = 'moderate';
    } else if (condition === 'Fog' || condition === 'Mist') {
      impact = 'Reduced visibility conditions';
      severity = 'moderate';
    }
    
    return {
      condition,
      temp,
      windSpeed,
      impact,
      severity
    };
  };
  
  // Get severity class for UI
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-400';
      case 'moderate':
        return 'text-amber-400';
      default:
        return 'text-green-400';
    }
  };
  
  // Render a compact version for embedding in other components
  if (isEmbedded) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center">
            <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
            NAVIGATION
          </h3>
          {origin && destination && (
            <button
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md"
              onClick={launchNavigation}
            >
              Launch GPS
            </button>
          )}
        </div>
        
        {/* Location selector (embedded version) */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center bg-gray-900/60 rounded-md p-2">
            <div className="text-sm mr-2">🏁</div>
            <div className="flex-1">
              {origin ? (
                <div className="text-sm">{origin.name}</div>
              ) : (
                <div className="text-sm text-gray-500">Select origin</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center bg-gray-900/60 rounded-md p-2">
            <div className="text-sm mr-2">🚩</div>
            <div className="flex-1">
              {destination ? (
                <div className="text-sm">{destination.name}</div>
              ) : (
                <div className="text-sm text-gray-500">Select destination</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Embedded map view */}
        {origin && destination && (
          <EmbeddedMapView
            origin={origin}
            destination={destination}
            waypoints={waypoints}
            height="200px"
            showControls={false}
          />
        )}
        
        {/* Navigation bridge (modal) */}
        {showBridge && (
          <NavigationBridge
            origin={origin}
            destination={destination}
            waypoints={waypoints}
            onBack={() => setShowBridge(false)}
          />
        )}
      </div>
    );
  }
  
  // Full dashboard view
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="mb-6 bg-black/60 p-4 rounded-lg border-l-4 border-blue-500">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-blue-400">PADDOCK20</div>
          <div className="ml-3 text-xl font-semibold">Navigation Center</div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left panel - Route planning and map */}
        <div className="md:w-2/3 space-y-6">
          {/* Location selection */}
          <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-4">
              <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
              ROUTE PLANNER
            </h3>
            
            <div className="space-y-3 mb-4">
              {/* Origin selector */}
              <div className="flex items-center">
                <div className="text-sm mr-2">🏁</div>
                <div className="flex-1">
                  <select
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                    value={origin?.id || ''}
                    onChange={(e) => {
                      const selectedLocation = locations.locations.find(
                        loc => loc.id === e.target.value
                      );
                      if (selectedLocation) {
                        selectLocation(selectedLocation, true);
                      }
                    }}
                  >
                    <option value="">Select origin</option>
                    {locations.locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="ml-2 p-2 bg-gray-900 hover:bg-gray-800 rounded-md"
                  onClick={() => {
                    locations.getCurrentLocation()
                      .then(location => {
                        selectLocation(location, true);
                      })
                      .catch(err => {
                        console.error('Error getting current location:', err);
                      });
                  }}
                >
                  📍
                </button>
              </div>
              
              {/* Destination selector */}
              <div className="flex items-center">
                <div className="text-sm mr-2">🚩</div>
                <div className="flex-1">
                  <select
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                    value={destination?.id || ''}
                    onChange={(e) => {
                      const selectedLocation = locations.locations.find(
                        loc => loc.id === e.target.value
                      );
                      if (selectedLocation) {
                        selectLocation(selectedLocation, false);
                      }
                    }}
                  >
                    <option value="">Select destination</option>
                    {locations.locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-md py-2 text-sm"
                onClick={swapLocations}
                disabled={!origin || !destination}
              >
                Swap
              </button>
              <button
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-md py-2 text-sm"
                onClick={clearRoute}
                disabled={!origin && !destination}
              >
                Clear
              </button>
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-sm"
                onClick={launchNavigation}
                disabled={!origin || !destination}
              >
                Launch GPS
              </button>
            </div>
          </div>
          
          {/* Map view */}
          {(origin || destination) && (
            <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
              <EmbeddedMapView
                origin={origin}
                destination={destination}
                waypoints={waypoints}
                height="500px"
                onRouteUpdate={setRouteData}
              />
            </div>
          )}
          
          {/* Recent routes */}
          {showRecentRoutes && recentRoutes.length > 0 && (
            <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
                <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
                RECENT ROUTES
              </h3>
              
              <div className="space-y-2">
                {recentRoutes.map((route, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-900/60 rounded-md p-3 cursor-pointer hover:bg-gray-800/60"
                    onClick={() => selectRecentRoute(route)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">
                          {route.originName} → {route.destName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(route.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <button
                        className="text-xs bg-blue-900/60 hover:bg-blue-800 text-white px-2 rounded-md flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigation.openExternalNavigation(route);
                        }}
                      >
                        Navigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right panel - Weather and departure times */}
        <div className="md:w-1/3 space-y-6">
          {/* Weather impact */}
          {showWeatherData && weather.weatherData && (
            <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                WEATHER CONDITIONS
              </h3>
              
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">
                  {weather.weatherData.currentConditions.weather[0].main === "Clear" ? "☀️" :
                   weather.weatherData.currentConditions.weather[0].main === "Clouds" ? "☁️" :
                   weather.weatherData.currentConditions.weather[0].main === "Rain" ? "🌧️" :
                   weather.weatherData.currentConditions.weather[0].main === "Snow" ? "❄️" :
                   weather.weatherData.currentConditions.weather[0].main === "Thunderstorm" ? "⚡" :
                   weather.weatherData.currentConditions.weather[0].main === "Drizzle" ? "🌦️" :
                   weather.weatherData.currentConditions.weather[0].main === "Fog" || 
                   weather.weatherData.currentConditions.weather[0].main === "Mist" ? "🌫️" : "🌤️"}
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {Math.round(weather.weatherData.currentConditions.temp)}°F
                  </div>
                  <div className="text-sm text-gray-300 capitalize">
                    {weather.weatherData.currentConditions.weather[0].description}
                  </div>
                </div>
              </div>
              
              {getWeatherImpact() && (
                <div className="bg-gray-900/60 rounded-md p-3">
                  <div className="mb-1 text-sm">Driving Conditions Impact:</div>
                  <div className={`font-medium ${getSeverityClass(getWeatherImpact().severity)}`}>
                    {getWeatherImpact().impact}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Wind: {getWeatherImpact().windSpeed} mph
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Departure time recommendations */}
          {departureOptions.length > 0 && (
            <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
                <span className="h-2 w-2 bg-amber-500 rounded-full mr-2"></span>
                RECOMMENDED DEPARTURE
              </h3>
              
              <div className="space-y-2">
                {departureOptions.slice(0, 5).map((window, index) => (
                  <div
                    key={index}
                    className="bg-gray-900/60 rounded-md p-3 cursor-pointer hover:bg-gray-700/40"
                    onClick={() => selectDepartureTime(window)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {window.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {' - '}
                          {window.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-xs text-gray-400">
                          {window.startTime.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-1 ${
                          window.qualityScore > 85 ? 'bg-green-500' :
                          window.qualityScore > 70 ? 'bg-green-400' :
                          window.qualityScore > 50 ? 'bg-yellow-400' : 'bg-amber-500'
                        }`}></div>
                        <span className="text-xs">{window.qualityScore}% optimal</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      {window.conditions}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Navigation settings */}
          <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
              <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
              NAVIGATION SETTINGS
            </h3>
            
            {/* Preferred app */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">Preferred App</label>
              <div className="grid grid-cols-3 gap-2">
                {navigation.getAvailableNavigationApps().map(app => (
                  <button
                    key={app.id}
                    className={`flex flex-col items-center p-2 rounded-md border ${
                      navigation.preferredApp === app.id 
                        ? 'border-blue-500 bg-blue-900/30' 
                        : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800/50'
                    }`}
                    onClick={() => navigation.setPreferredApp(app.id)}
                  >
                    <div className="text-2xl mb-1">{app.icon}</div>
                    <div className="text-xs">{app.name}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Travel mode */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">Travel Mode</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(navigation.NAVIGATION_MODES).map(([key, value]) => (
                  <button
                    key={key}
                    className={`p-2 rounded-md border text-center text-sm ${
                      navigation.navigationMode === value 
                        ? 'border-blue-500 bg-blue-900/30' 
                        : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800/50'
                    }`}
                    onClick={() => navigation.setNavigationMode(value)}
                  >
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Route optimization */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">Weather Optimization</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(navigation.OPTIMIZATION_LEVELS).map(([key, value]) => (
                  <button
                    key={key}
                    className={`p-2 rounded-md border text-center text-sm ${
                      navigation.optimizationLevel === value 
                        ? 'border-blue-500 bg-blue-900/30' 
                        : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800/50'
                    }`}
                    onClick={() => navigation.setOptimizationLevel(value)}
                  >
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Avoid options */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Avoid Options</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="avoid-tolls"
                    className="mr-2"
                    checked={navigation.avoidOptions.avoidTolls}
                    onChange={() => navigation.updateAvoidOptions({
                      avoidTolls: !navigation.avoidOptions.avoidTolls
                    })}
                  />
                  <label htmlFor="avoid-tolls" className="text-sm">Avoid tolls</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="avoid-highways"
                    className="mr-2"
                    checked={navigation.avoidOptions.avoidHighways}
                    onChange={() => navigation.updateAvoidOptions({
                      avoidHighways: !navigation.avoidOptions.avoidHighways
                    })}
                  />
                  <label htmlFor="avoid-highways" className="text-sm">Avoid highways</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="avoid-ferries"
                    className="mr-2"
                    checked={navigation.avoidOptions.avoidFerries}
                    onChange={() => navigation.updateAvoidOptions({
                      avoidFerries: !navigation.avoidOptions.avoidFerries
                    })}
                  />
                  <label htmlFor="avoid-ferries" className="text-sm">Avoid ferries</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation bridge (modal) */}
      {showBridge && (
        <NavigationBridge
          origin={origin}
          destination={destination}
          waypoints={waypoints}
          onBack={() => setShowBridge(false)}
        />
      )}
    </div>
  );
};

export default NavigationDashboard;