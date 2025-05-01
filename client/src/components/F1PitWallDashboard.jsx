import React, { useState, useEffect } from 'react';
import CommuteTimeEstimator from './CommuteTimeEstimator';
import LocationManager from './LocationManager';
import WeatherImpactIndicator from './WeatherImpactIndicator';
import CitySearch from './CitySearch';
import LocationPermissionPrompt from './LocationPermissionPrompt';
import UnitToggle from './UnitToggle';
import WeatherAlertsDashboard from './WeatherAlertsDashboard';
import DriveModeRecommendations from './DriveModeRecommendations';
import MultiLocationComparison from './MultiLocationComparison';
import TimedSurfacePredictions from './TimedSurfacePredictions';
import DashboardHeader from './DashboardHeader';
import { useWeather } from '../contexts/WeatherContext';
import { useUnits } from '../contexts/UnitsContext';
import { MapPin, Search, Settings } from 'lucide-react';

// Component for displaying a Formula 1 style gauge
const F1Gauge = ({ value, min, max, label, units, danger = false, warning = false, optimum = false }) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // Determine color based on state
  let color = "blue-500";
  if (danger) color = "red-500";
  else if (warning) color = "amber-500";
  else if (optimum) color = "green-500";
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-xl font-bold">{value}{units}</div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 mt-1 overflow-hidden">
        <div 
          className={`bg-${color} h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Main F1 Pit Wall Dashboard component
function F1PitWallDashboard() {
  // Get weather data from context
  const { 
    weatherData, 
    loading, 
    error, 
    fetchWeatherData, 
    fetchCurrentLocationWeather,
    citySearchOpen,
    setCitySearchOpen,
    showLocationPrompt,
    setShowLocationPrompt
  } = useWeather();
  const { unitSystem, UNIT_SYSTEMS } = useUnits();
  
  // Default vehicle data
  const defaultVehicles = [
    {
      id: 1,
      name: "Ferrari 488 GTB",
      year: 2020,
      type: "Sports",
      image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      name: "Toyota 4Runner",
      year: 2022,
      type: "SUV",
      image: "https://images.unsplash.com/photo-1633659430580-c67048344c74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      name: "Tesla Model 3",
      year: 2023,
      type: "EV",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    }
  ];
  
  // State for vehicles
  const [vehicles, setVehicles] = useState(() => {
    const savedVehicles = localStorage.getItem('paddock20-vehicles');
    return savedVehicles ? JSON.parse(savedVehicles) : defaultVehicles;
  });
  
  // State for selected vehicle
  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    const savedVehicle = localStorage.getItem('paddock20-selected-vehicle');
    if (savedVehicle === 'null') return null;
    return savedVehicle ? JSON.parse(savedVehicle) : null;
  });
  
  // Default locations
  const defaultLocations = [
    {
      id: 1,
      name: "Atlanta",
      lat: 33.7490,
      lon: -84.3880,
      favorite: true
    },
    {
      id: 2,
      name: "Miami",
      lat: 25.7617,
      lon: -80.1918,
      favorite: false
    },
    {
      id: 3,
      name: "Los Angeles",
      lat: 34.0522,
      lon: -118.2437,
      favorite: false
    }
  ];
  
  // State for saved locations
  const [savedLocations, setSavedLocations] = useState(() => {
    const savedLocations = localStorage.getItem('paddock20-saved-locations');
    return savedLocations ? JSON.parse(savedLocations) : defaultLocations;
  });
  
  // Save selected vehicle to localStorage
  useEffect(() => {
    localStorage.setItem('paddock20-selected-vehicle', JSON.stringify(selectedVehicle));
  }, [selectedVehicle]);
  
  // Save vehicles to localStorage
  useEffect(() => {
    localStorage.setItem('paddock20-vehicles', JSON.stringify(vehicles));
  }, [vehicles]);
  
  // Save locations to localStorage
  useEffect(() => {
    localStorage.setItem('paddock20-saved-locations', JSON.stringify(savedLocations));
  }, [savedLocations]);
  
  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Main dashboard UI
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-7xl">
        {/* Use the new DashboardHeader component */}
        <DashboardHeader />
        
        {/* City Search Dialog */}
        <CitySearch open={citySearchOpen} onOpenChange={setCitySearchOpen} />
        
        {/* Location Permission Dialog */}
        <LocationPermissionPrompt open={showLocationPrompt} onOpenChange={setShowLocationPrompt} />
        
        {/* Vehicle selector */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-300">SELECT VEHICLE</h3>
            <div className="text-xs text-blue-400">New vehicles can be added in the Garage</div>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {/* No Vehicle Option */}
            <div 
              className={`flex items-center p-2 rounded-lg cursor-pointer ${selectedVehicle === null ? 'bg-blue-900/60 border border-blue-400/50' : 'bg-gray-800/60 border border-gray-700 hover:bg-gray-700/40'}`}
              onClick={() => setSelectedVehicle(null)}
            >
              <div className="w-12 h-12 rounded-md overflow-hidden mr-3 flex items-center justify-center bg-gray-700">
                <div className="text-2xl">❌</div>
              </div>
              <div>
                <div className="font-medium">No Vehicle</div>
                <div className="text-xs text-gray-400">Default settings</div>
              </div>
            </div>
            
            {/* Vehicle Options */}
            {vehicles.map(vehicle => (
              <div 
                key={vehicle.id}
                className={`flex items-center p-2 rounded-lg cursor-pointer ${selectedVehicle?.id === vehicle.id ? 'bg-blue-900/60 border border-blue-400/50' : 'bg-gray-800/60 border border-gray-700 hover:bg-gray-700/40'}`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                  {vehicle.image && (
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="font-medium">{vehicle.name}</div>
                  <div className="text-xs text-gray-400">{vehicle.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <div className="bg-gray-800/80 rounded-lg shadow-lg border border-gray-700 p-5 h-full">
              {weatherData && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center">
                        <h2 className="text-2xl font-bold">{weatherData.location.name}</h2>
                        <div className="ml-2 text-3xl">
                          {weatherData.currentConditions.weather && weatherData.currentConditions.weather[0] ? (
                           weatherData.currentConditions.weather[0].main === "Clear" ? "☀️" :
                           weatherData.currentConditions.weather[0].main === "Clouds" ? "☁️" :
                           weatherData.currentConditions.weather[0].main === "Rain" ? "🌧️" :
                           weatherData.currentConditions.weather[0].main === "Snow" ? "❄️" :
                           weatherData.currentConditions.weather[0].main === "Thunderstorm" ? "⚡" :
                           weatherData.currentConditions.weather[0].main === "Drizzle" ? "🌦️" :
                           weatherData.currentConditions.weather[0].main === "Fog" || 
                           weatherData.currentConditions.weather[0].main === "Mist" ? "🌫️" : "🌤️"
                          ) : "🌤️"}
                        </div>
                      </div>
                      <p className="text-gray-400 capitalize">
                        {weatherData.currentConditions.weather && weatherData.currentConditions.weather[0] ? 
                          weatherData.currentConditions.weather[0].description : "Weather data"}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold">
                        {Math.round(weatherData.currentConditions.temp)}°
                      </div>
                      <div className="text-sm text-gray-400">
                        Feels like {Math.round(weatherData.currentConditions.feels_like)}°
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <F1Gauge 
                      label="Asphalt Temp" 
                      value={Math.round(weatherData.drivingConditions.track_temp)} 
                      units="°F" 
                      min={32}
                      max={120}
                      danger={weatherData.drivingConditions.track_temp > 95}
                      warning={weatherData.drivingConditions.track_temp > 85}
                      optimum={weatherData.drivingConditions.track_temp >= 60 && weatherData.drivingConditions.track_temp <= 85}
                    />
                    <F1Gauge 
                      label="Humidity" 
                      value={weatherData.currentConditions.humidity} 
                      units="%" 
                      min={0}
                      max={100}
                      danger={weatherData.currentConditions.humidity > 90}
                      warning={weatherData.currentConditions.humidity > 75}
                      optimum={weatherData.currentConditions.humidity >= 30 && weatherData.currentConditions.humidity <= 50}
                    />
                    <F1Gauge 
                      label="Visibility" 
                      value={Math.round(weatherData.currentConditions.visibility / 1609)} 
                      units="mi" 
                      min={0}
                      max={10}
                      danger={weatherData.currentConditions.visibility < 1609}
                      warning={weatherData.currentConditions.visibility < 4828}
                      optimum={weatherData.currentConditions.visibility >= 8045}
                    />
                  </div>
                  
                  <div className="bg-gray-900/60 rounded-lg p-4 mb-6 border border-gray-800">
                    <h3 className="text-sm uppercase font-bold text-blue-400 mb-3 tracking-wider">Surface Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <div className="flex justify-between mb-2">
                          <div className="text-sm text-gray-400">Road Surface</div>
                          <div className="text-sm font-medium">{weatherData.drivingConditions.surface_condition}</div>
                        </div>
                        <div className="flex justify-between mb-2">
                          <div className="text-sm text-gray-400">Surface Temperature</div>
                          <div className="text-sm font-medium">{Math.round(weatherData.drivingConditions.track_temp)}°F</div>
                        </div>
                        <div className="flex justify-between mb-2">
                          <div className="text-sm text-gray-400">Ambient Temperature</div>
                          <div className="text-sm font-medium">{Math.round(weatherData.currentConditions.temp)}°F</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm text-gray-400">Wind</div>
                          <div className="text-sm font-medium">{Math.round(weatherData.currentConditions.wind_speed)} mph {weatherData.currentConditions.wind_gust > (weatherData.currentConditions.wind_speed * 1.3) ? `(Gusts: ${Math.round(weatherData.currentConditions.wind_gust)} mph)` : ''}</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <div className="text-sm text-gray-400">Grip Assessment</div>
                          <div className={`text-sm font-medium ${
                            weatherData.drivingConditions.grip_assessment === "Excellent" ? "text-green-400" :
                            weatherData.drivingConditions.grip_assessment === "Good" ? "text-green-400" :
                            weatherData.drivingConditions.grip_assessment === "Moderate" ? "text-yellow-400" :
                            weatherData.drivingConditions.grip_assessment === "Reduced" ? "text-orange-400" :
                            "text-red-400"
                          }`}>{weatherData.drivingConditions.grip_assessment}</div>
                        </div>
                        <div className="flex justify-between mb-2">
                          <div className="text-sm text-gray-400">Precipitation</div>
                          <div className="text-sm font-medium">
                            {weatherData.drivingConditions.surface_condition === "Dry" 
                              ? "None" 
                              : weatherData.currentConditions.rain 
                                ? `${weatherData.currentConditions.rain['1h'] || 0} mm` 
                                : (weatherData.currentConditions.snow ? `Snow: ${weatherData.currentConditions.snow['1h'] || 0} mm` : "Light")}
                          </div>
                        </div>
                        <div className="flex justify-between mb-2">
                          <div className="text-sm text-gray-400">Dew Point</div>
                          <div className="text-sm font-medium">{Math.round(weatherData.currentConditions.dew_point)}°F</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm text-gray-400">Crosswind Risk</div>
                          <div className={`text-sm font-medium ${
                            weatherData.currentConditions.wind_speed > 20 ? "text-red-400" :
                            weatherData.currentConditions.wind_speed > 10 ? "text-orange-400" :
                            "text-green-400"
                          }`}>
                            {weatherData.currentConditions.wind_speed > 20 ? "High" :
                             weatherData.currentConditions.wind_speed > 10 ? "Moderate" :
                             "Low"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div>
            <div className="bg-gray-800/80 rounded-lg shadow-lg border border-gray-700 p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm uppercase font-bold tracking-wider">My Locations</h3>
                <button 
                  onClick={() => setCitySearchOpen(true)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Add Location
                </button>
              </div>
              
              <div className="space-y-3">
                {savedLocations.slice(0, 5).map((location) => (
                  <div 
                    key={location.id}
                    className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all 
                      ${weatherData?.location?.name === location.name
                          ? 'bg-blue-900/50 border border-blue-500/50'
                          : 'bg-gray-900/50 border border-gray-800 hover:bg-gray-800'
                      }`}
                    onClick={() => fetchWeatherData(location.lat, location.lon)}
                  >
                    <div className="flex items-center">
                      <div className="text-xl mr-3">
                        {location.favorite ? '⭐' : '📍'}
                      </div>
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-xs text-gray-400">{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    {weatherData?.location?.name === location.name && (
                      <div className="text-blue-400 text-sm">Current</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Drive Mode Recommendations */}
            <DriveModeRecommendations 
              weatherData={{ ...weatherData, roadConditions: weatherData?.drivingConditions }} 
              selectedVehicle={selectedVehicle}
            />
          </div>
        </div>
        
        {/* Weather Alerts Dashboard */}
        {weatherData?.alerts && weatherData.alerts.length > 0 && (
          <WeatherAlertsDashboard id="weather-alerts" />
        )}
        
        {/* Timed Surface Predictions */}
        <TimedSurfacePredictions weatherData={weatherData} />
        
        {/* Multi-location comparison */}
        <MultiLocationComparison 
          locations={savedLocations}
          currentLocation={weatherData?.location}
          onSelectLocation={(lat, lon) => fetchWeatherData(lat, lon)}
        />
        
        {/* Commute time impact */}
        {weatherData && (
          <CommuteTimeEstimator 
            conditions={weatherData.drivingConditions.surface_condition}
            visibility={weatherData.currentConditions.visibility}
            precipitation={weatherData.currentConditions.pop || 0}
            gripLevel={weatherData.drivingConditions.grip_assessment}
          />
        )}
        
        {/* Weather impact indicator for your drive plans */}
        {weatherData && (
          <WeatherImpactIndicator
            precipitationChance={weatherData.hourly && weatherData.hourly[0] ? weatherData.hourly[0].pop : 0}
            temperature={weatherData.currentConditions.temp}
            windSpeed={weatherData.currentConditions.wind_speed}
            visibility={weatherData.currentConditions.visibility}
            roadCondition={weatherData.drivingConditions.surface_condition}
            alerts={weatherData.alerts || []}
          />
        )}
        
        {/* Location manager */}
        <LocationManager 
          locations={savedLocations}
          onUpdateLocations={setSavedLocations}
          currentLocation={weatherData?.location}
          onSelectLocation={(lat, lon) => fetchWeatherData(lat, lon)}
        />
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <div className="text-sm text-gray-500 mb-2">
            Powered by Advanced Weather Intelligence APIs
          </div>
          <div className="text-xs text-gray-600">
            PADDOCK20™ F1-Inspired Weather & Navigation Telemetry Platform
          </div>
        </div>
      </div>
    </div>
  );
}

export default F1PitWallDashboard;