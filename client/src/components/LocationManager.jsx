import React, { useState } from 'react';
import { Plus, MapPin, X, ChevronRight, Trash2, Cloud } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { useWeather } from '../hooks/useWeather';
import { useUnits } from '../hooks/useUnits';

/**
 * LocationManager - Manages saved locations and displays current weather for each
 */
const LocationManager = () => {
  const { savedLocations, activeLocationData, setActiveLocation, removeLocation } = useLocation();
  const { units } = useUnits();
  const { fetchWeatherForLocation } = useWeather();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedLocation, setExpandedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setActiveLocation(location);
  };

  const handleRemoveLocation = (locationId) => {
    if (confirmDelete === locationId) {
      removeLocation(locationId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(locationId);
    }
  };

  const handleExpand = (locationId) => {
    if (expandedLocation === locationId) {
      setExpandedLocation(null);
    } else {
      setExpandedLocation(locationId);
    }
  };

  if (!savedLocations || savedLocations.length === 0) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-6">
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Saved Locations</h3>
          <p className="text-gray-400 mb-4">
            Add locations to track weather conditions and driving recommendations
          </p>
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Location
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="flex items-center text-blue-400 font-medium mb-4">
          <MapPin className="mr-2 h-5 w-5" />
          Saved Locations
        </h3>

        <div className="space-y-3">
          {savedLocations.map((location) => {
            const isActive = activeLocationData && activeLocationData.id === location.id;
            const isExpanded = expandedLocation === location.id;
            
            return (
              <div 
                key={location.id} 
                className={`rounded-md overflow-hidden border ${isActive ? 'border-blue-500 bg-gray-750' : 'border-gray-700 bg-gray-750/50'}`}
              >
                {/* Location Header */}
                <div 
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-750"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-400' : 'bg-gray-500'} mr-3`}></div>
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-gray-400">
                        {location.state && `${location.state}, `}{location.country}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {/* Weather display for the location if available */}
                    {location.weather && location.weather.main && (
                      <div className="mr-3 text-right hidden sm:block">
                        <div className="font-medium">
                          {Math.round(location.weather.main.temp)}°{units === 'imperial' ? 'F' : 'C'}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {location.weather.weather && location.weather.weather[0] ? 
                            location.weather.weather[0].description : 
                            'Weather data unavailable'}
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex items-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpand(location.id);
                        }}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                      >
                        <ChevronRight className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLocation(location.id);
                        }}
                        className="p-1 ml-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"
                      >
                        {confirmDelete === location.id ? (
                          <X className="h-5 w-5" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3 pt-0 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Location details */}
                      <div className="bg-gray-800 rounded-md p-3">
                        <div className="text-xs font-medium text-gray-400 mb-1">Coordinates</div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div>{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Weather details */}
                      <div className="bg-gray-800 rounded-md p-3">
                        <div className="text-xs font-medium text-gray-400 mb-1">Current Weather</div>
                        <div className="flex items-center">
                          {location.weather && location.weather.weather && location.weather.weather[0] ? (
                            <div className="mr-2 bg-gray-700 rounded-md p-1">
                              <img 
                                src={`https://openweathermap.org/img/wn/${location.weather.weather[0].icon}.png`}
                                alt={location.weather.weather[0].description}
                                className="w-6 h-6"
                              />
                            </div>
                          ) : (
                            <Cloud className="h-6 w-6 text-gray-500 mr-2" />
                          )}
                          
                          <div>
                            {location.weather && location.weather.main ? (
                              <div className="text-sm">
                                {Math.round(location.weather.main.temp)}°{units === 'imperial' ? 'F' : 'C'}
                                {location.weather.weather && location.weather.weather[0] && (
                                  <span className="text-xs text-gray-400 ml-1 capitalize">
                                    {location.weather.weather[0].description}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">Weather data unavailable</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional weather data if available */}
                      {location.weather && location.weather.main && (
                        <>
                          <div className="bg-gray-800 rounded-md p-3">
                            <div className="text-xs font-medium text-gray-400 mb-1">Details</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Humidity:</span> {location.weather.main.humidity}%
                              </div>
                              <div>
                                <span className="text-gray-400">Pressure:</span> {location.weather.main.pressure} hPa
                              </div>
                              {location.weather.visibility && (
                                <div>
                                  <span className="text-gray-400">Visibility:</span> {(location.weather.visibility / 1000).toFixed(1)} km
                                </div>
                              )}
                              {location.weather.wind && (
                                <div>
                                  <span className="text-gray-400">Wind:</span> {Math.round(location.weather.wind.speed)} {units === 'imperial' ? 'mph' : 'km/h'}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-gray-800 rounded-md p-3">
                            <div className="text-xs font-medium text-gray-400 mb-1">
                              {units === 'imperial' ? 'Feels Like & Temps' : 'Feels Like & Temps'}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Feels Like:</span> {Math.round(location.weather.main.feels_like)}°
                              </div>
                              <div>
                                <span className="text-gray-400">Max:</span> {Math.round(location.weather.main.temp_max)}°
                              </div>
                              <div>
                                <span className="text-gray-400">Min:</span> {Math.round(location.weather.main.temp_min)}°
                              </div>
                              {location.weather.main.sea_level && (
                                <div>
                                  <span className="text-gray-400">Sea Level:</span> {location.weather.main.sea_level} hPa
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Update Weather Button */}
                      <div className="col-span-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchWeatherForLocation(location);
                          }}
                          className="w-full py-2 px-4 text-sm flex items-center justify-center rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200"
                        >
                          <Cloud className="h-4 w-4 mr-2" />
                          Update Weather Data
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Add Location Button */}
      <div className="border-t border-gray-700 p-3">
        <button className="w-full py-2 px-4 text-sm flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Location
        </button>
      </div>
    </div>
  );
};

export default LocationManager;