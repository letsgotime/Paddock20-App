import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useWeather } from '../contexts/WeatherContext';
import { useLocations } from '../contexts/LocationContext';
import { useVehicles } from '../contexts/VehicleContext';

/**
 * NavigationBridge Component
 * 
 * This component provides a seamless integration with external navigation apps.
 * It creates a "bridge" that makes the transition between our app and external
 * navigation apps feel more like a white-labeled experience.
 */
const NavigationBridge = ({ 
  origin, 
  destination, 
  waypoints = [], 
  onBack,
  showRouteDetails = true,
  showAppSelector = true,
  autoLaunch = false,
  launchDelay = 2000 // ms delay before auto-launching
}) => {
  const navigation = useNavigation();
  const weather = useWeather();
  const locations = useLocations();
  const vehicles = useVehicles();
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedApp, setSelectedApp] = useState(navigation.preferredApp);
  const [routeDetails, setRouteDetails] = useState(null);
  const [recommendedWindows, setRecommendedWindows] = useState([]);
  const [weatherDelay, setWeatherDelay] = useState(0);
  const [countdown, setCountdown] = useState(launchDelay / 1000);
  
  const countdownRef = useRef(null);
  const timerRef = useRef(null);
  
  // Create route on component mount
  useEffect(() => {
    if (origin && destination) {
      const route = navigation.planRoute(origin, destination, waypoints);
      
      if (route) {
        // Get route details
        setRouteDetails(route);
        
        // Get weather-related data
        setWeatherDelay(navigation.getWeatherDelayEstimate(route));
        setRecommendedWindows(navigation.getRecommendedDepartureWindows(route, 12));
      }
    }
    
    // Start auto-launch countdown if needed
    if (autoLaunch) {
      setIsLaunching(true);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Set timer for actual launch
      timerRef.current = setTimeout(() => {
        launchNavigation();
      }, launchDelay);
    }
    
    return () => {
      // Clean up timers
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [origin, destination, waypoints, autoLaunch]);
  
  // Launch navigation in selected app
  const launchNavigation = () => {
    if (routeDetails) {
      navigation.openExternalNavigation(routeDetails, selectedApp);
      
      // Return to app after a delay (simulate app returning)
      if (onBack) {
        setTimeout(() => {
          onBack();
        }, 500);
      }
    }
  };
  
  // Cancel auto-launch
  const cancelAutoLaunch = () => {
    setIsLaunching(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
  
  // Get available apps
  const apps = navigation.getAvailableNavigationApps();
  
  // Select an app and save preference
  const selectApp = (appId) => {
    setSelectedApp(appId);
    navigation.setPreferredApp(appId);
  };
  
  // Get app name
  const getAppName = (appId) => {
    const app = apps.find(a => a.id === appId);
    return app ? app.name : 'Navigation';
  };
  
  // Get app icon
  const getAppIcon = (appId) => {
    const app = apps.find(a => a.id === appId);
    return app ? app.icon : '🗺️';
  };
  
  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 p-4 border-b border-gray-800 flex justify-between items-center">
        <button 
          className="text-gray-400 hover:text-white px-3 py-1 rounded-md"
          onClick={onBack}
        >
          ← Back
        </button>
        <h2 className="text-lg font-bold text-white">
          {isLaunching 
            ? `Launching ${getAppName(selectedApp)} in ${countdown}...` 
            : 'Navigation Handoff'}
        </h2>
        <div className="w-12"></div>
      </div>
      
      {/* Body */}
      <div className="flex-1 overflow-auto p-4">
        {/* Route summary */}
        {routeDetails && showRouteDetails && (
          <div className="bg-gray-800/70 rounded-lg p-4 mb-4 border border-gray-700">
            <div className="flex items-center mb-2">
              <div className="text-2xl mr-3">🚗</div>
              <div>
                <h3 className="font-bold text-xl">{routeDetails.originName} → {routeDetails.destName}</h3>
                {weatherDelay > 0 && (
                  <p className="text-amber-400 text-sm">+{weatherDelay} min delay due to weather</p>
                )}
              </div>
            </div>
            
            {/* Weather info */}
            {weather.weatherData && (
              <div className="mt-3 p-3 bg-gray-900/80 rounded-lg">
                <h4 className="text-sm text-gray-400 mb-1">Weather Conditions</h4>
                <div className="flex items-center">
                  <div className="text-2xl mr-2">
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
                    <p className="font-medium">{weather.weatherData.currentConditions.weather[0].main}</p>
                    <p className="text-sm text-gray-400">
                      {Math.round(weather.weatherData.currentConditions.temp)}°F, 
                      Wind: {Math.round(weather.weatherData.currentConditions.wind_speed)} mph
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recommended departure windows */}
            {recommendedWindows.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm text-gray-400 mb-1">Recommended Departure Times</h4>
                <div className="space-y-2">
                  {recommendedWindows.slice(0, 3).map((window, index) => (
                    <div key={index} className="p-2 bg-gray-900/70 rounded flex justify-between items-center">
                      <div className="text-sm">
                        {window.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {' - '}
                        {window.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* App selector */}
        {showAppSelector && (
          <div className="bg-gray-800/70 rounded-lg p-4 mb-4 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-3">Choose Navigation App</h4>
            <div className="grid grid-cols-3 gap-3">
              {apps.map(app => (
                <button
                  key={app.id}
                  className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                    selectedApp === app.id 
                      ? 'border-blue-500 bg-blue-900/30' 
                      : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800/50'
                  }`}
                  onClick={() => selectApp(app.id)}
                >
                  <div className="text-3xl mb-2">{app.icon}</div>
                  <div className="text-sm">{app.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Explainer text */}
        <div className="text-center text-gray-400 text-sm px-4 my-4">
          <p>
            Continuing will open your selected navigation app with your route details.
            All your preferences and route history will be saved in Paddock20.
          </p>
        </div>
      </div>
      
      {/* Footer with launch buttons */}
      <div className="p-4 border-t border-gray-800 bg-black/60">
        {isLaunching ? (
          <div className="flex space-x-4">
            <button
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 text-center"
              onClick={cancelAutoLaunch}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-center"
              onClick={launchNavigation}
            >
              Launch Now
            </button>
          </div>
        ) : (
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-center flex items-center justify-center"
            onClick={launchNavigation}
          >
            <span className="text-xl mr-2">{getAppIcon(selectedApp)}</span>
            <span>Open in {getAppName(selectedApp)}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationBridge;