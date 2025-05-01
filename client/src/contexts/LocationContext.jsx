import React, { createContext, useState, useContext, useEffect } from 'react';
import { hasDeepLinkParams, parseDeepLink, clearDeepLinkParams } from '../utils/deepLinkUtils';

// Create the location context
export const LocationContext = createContext();

// Custom hook to use the location context
export const useLocations = () => useContext(LocationContext);

// Location types with icons
export const locationTypes = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'school', label: 'School', icon: '🎓' },
  { id: 'favorite', label: 'Favorite', icon: '⭐' },
  { id: 'gym', label: 'Gym', icon: '💪' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'shopping', label: 'Shopping', icon: '🛒' },
  { id: 'track', label: 'Race Track', icon: '🏁' },
  { id: 'dealership', label: 'Dealership', icon: '🚗' },
  { id: 'service', label: 'Service Center', icon: '🔧' },
  { id: 'other', label: 'Other', icon: '📍' }
];

// Helper function to get icon for a location type
export const getLocationIcon = (type) => {
  const locationType = locationTypes.find(lt => lt.id === type);
  return locationType ? locationType.icon : '📍';
};

// Location Provider component
export const LocationProvider = ({ children }) => {
  // State for saved locations
  const [locations, setLocations] = useState(() => {
    const savedLocations = localStorage.getItem('savedLocations');
    return savedLocations ? JSON.parse(savedLocations) : [
      // Default location
      { 
        id: 1,
        name: 'Home', 
        type: 'home',
        address: '123 Main St, Charlotte, NC',
        coordinates: { lat: 35.2271, lon: -80.8431 },
        favorite: true
      }
    ];
  });
  
  // State for recently used locations
  const [recentLocations, setRecentLocations] = useState(() => {
    const savedRecent = localStorage.getItem('recentLocations');
    return savedRecent ? JSON.parse(savedRecent) : [];
  });
  
  // State for route planning
  const [activeRoute, setActiveRoute] = useState(() => {
    const savedRoute = localStorage.getItem('activeRoute');
    return savedRoute ? JSON.parse(savedRoute) : {
      origin: null,
      destination: null
    };
  });
  
  // Handle deep links on startup
  useEffect(() => {
    if (hasDeepLinkParams()) {
      const deepLinkData = parseDeepLink(window.location.href);
      
      if (deepLinkData) {
        // Handle location deep links
        if (deepLinkData.type === 'weather' && deepLinkData.lat && deepLinkData.lon) {
          const locationName = deepLinkData.locationName || 'Shared Location';
          
          // Create a temporary location
          const sharedLocation = {
            id: `shared-${Date.now()}`,
            name: locationName,
            type: 'other',
            coordinates: {
              lat: parseFloat(deepLinkData.lat),
              lon: parseFloat(deepLinkData.lon)
            },
            address: 'Shared via deep link',
            favorite: false,
            temporary: true
          };
          
          // Add to recent locations
          addToRecentLocations(sharedLocation);
        }
        
        // Handle route deep links
        if (deepLinkData.type === 'route') {
          let origin = null;
          let destination = null;
          
          // Try to find origin location
          if (deepLinkData.originId) {
            origin = locations.find(loc => loc.id.toString() === deepLinkData.originId);
          } else if (deepLinkData.originLat && deepLinkData.originLon) {
            const originName = deepLinkData.originName || 'Shared Origin';
            origin = {
              id: `shared-origin-${Date.now()}`,
              name: originName,
              type: 'other',
              coordinates: {
                lat: parseFloat(deepLinkData.originLat),
                lon: parseFloat(deepLinkData.originLon)
              },
              address: 'Shared via deep link',
              favorite: false,
              temporary: true
            };
            
            addToRecentLocations(origin);
          }
          
          // Try to find destination location
          if (deepLinkData.destId) {
            destination = locations.find(loc => loc.id.toString() === deepLinkData.destId);
          } else if (deepLinkData.destLat && deepLinkData.destLon) {
            const destName = deepLinkData.destName || 'Shared Destination';
            destination = {
              id: `shared-dest-${Date.now()}`,
              name: destName,
              type: 'other',
              coordinates: {
                lat: parseFloat(deepLinkData.destLat),
                lon: parseFloat(deepLinkData.destLon)
              },
              address: 'Shared via deep link',
              favorite: false,
              temporary: true
            };
            
            addToRecentLocations(destination);
          }
          
          // Set active route if we have both origin and destination
          if (origin && destination) {
            setActiveRoute({ origin, destination });
          }
        }
      }
      
      // Clear the deep link params from the URL
      clearDeepLinkParams();
    }
  }, []);
  
  // Save locations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('savedLocations', JSON.stringify(locations));
  }, [locations]);
  
  // Save recent locations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('recentLocations', JSON.stringify(recentLocations));
  }, [recentLocations]);
  
  // Save active route to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('activeRoute', JSON.stringify(activeRoute));
  }, [activeRoute]);
  
  // Add a new location
  const addLocation = (newLocation) => {
    // Generate a unique ID
    const id = Date.now();
    
    // Add the location to the saved locations
    setLocations(prev => {
      // Check for duplicates based on coordinates
      const isDuplicate = prev.some(loc => 
        Math.abs(loc.coordinates.lat - newLocation.coordinates.lat) < 0.0001 &&
        Math.abs(loc.coordinates.lon - newLocation.coordinates.lon) < 0.0001
      );
      
      if (isDuplicate) {
        return prev;
      }
      
      return [...prev, { ...newLocation, id, favorite: true }];
    });
    
    // Add to recent locations as well
    addToRecentLocations({ ...newLocation, id, favorite: true });
    
    return id;
  };
  
  // Update an existing location
  const updateLocation = (id, updatedData) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, ...updatedData } : loc
    ));
    
    // Update in recent locations as well
    setRecentLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, ...updatedData } : loc
    ));
  };
  
  // Remove a location
  const removeLocation = (id) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
    
    // Remove from recent locations as well
    setRecentLocations(prev => prev.filter(loc => loc.id !== id));
    
    // Clear from active route if it's being used
    if (activeRoute.origin?.id === id || activeRoute.destination?.id === id) {
      setActiveRoute({
        origin: activeRoute.origin?.id === id ? null : activeRoute.origin,
        destination: activeRoute.destination?.id === id ? null : activeRoute.destination
      });
    }
  };
  
  // Add a location to recent locations
  const addToRecentLocations = (location) => {
    setRecentLocations(prev => {
      // Remove if already in the list
      const filteredList = prev.filter(loc => loc.id !== location.id);
      
      // Add to the beginning (most recent)
      return [location, ...filteredList].slice(0, 10); // Keep only the 10 most recent
    });
  };
  
  // Set the active route
  const setRoute = (origin, destination) => {
    // Add both locations to recent locations
    if (origin) addToRecentLocations(origin);
    if (destination) addToRecentLocations(destination);
    
    setActiveRoute({ origin, destination });
  };
  
  // Clear the active route
  const clearRoute = () => {
    setActiveRoute({ origin: null, destination: null });
  };
  
  // Get favorite locations
  const getFavoriteLocations = () => {
    return locations.filter(loc => loc.favorite);
  };
  
  // Toggle favorite status for a location
  const toggleFavorite = (id) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, favorite: !loc.favorite } : loc
    ));
  };
  
  // Get current location using browser geolocation
  const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            id: 'current-location',
            name: 'Current Location',
            type: 'other',
            temporary: true,
            coordinates: {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            }
          };
          
          // Add to recent locations
          addToRecentLocations(currentLocation);
          
          resolve(currentLocation);
        },
        (error) => {
          reject(error);
        }
      );
    });
  };
  
  // Try to get address from coordinates using OpenStreetMap Nominatim API
  const getAddressFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en-US,en' } }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding API error');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };
  
  // Get a weather-based severity indicator for a location
  const getLocationWeatherSeverity = (locationId, weatherData) => {
    // This would be implemented to check weather data for the location
    // and return a severity rating
    
    // For now, return a placeholder
    return {
      severity: 25,
      description: 'Moderate weather impact'
    };
  };
  
  // Context value
  const contextValue = {
    locations,
    recentLocations,
    activeRoute,
    locationTypes,
    getLocationIcon,
    addLocation,
    updateLocation,
    removeLocation,
    addToRecentLocations,
    setRoute,
    clearRoute,
    getFavoriteLocations,
    toggleFavorite,
    getCurrentLocation,
    getAddressFromCoords,
    getLocationWeatherSeverity
  };
  
  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationProvider;