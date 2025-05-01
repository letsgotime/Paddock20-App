import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Location Context for managing user locations
 */
export const LocationContext = createContext();

// Default location (Atlanta, GA)
const DEFAULT_LOCATION = {
  id: 'default-atlanta',
  name: 'Atlanta',
  state: 'Georgia',
  country: 'US',
  lat: 33.749,
  lon: -84.388
};

/**
 * Location Provider component
 */
const LocationProvider = ({ children }) => {
  // Saved locations list
  const [savedLocations, setSavedLocations] = useState([]);
  
  // ID of the currently active location
  const [activeLocationId, setActiveLocationId] = useState(null);
  
  // Current active location data
  const [activeLocationData, setActiveLocationData] = useState(null);
  
  // Load saved locations from localStorage on component mount
  useEffect(() => {
    try {
      // Load saved locations
      const savedLocationsStr = localStorage.getItem('saved_locations');
      const locations = savedLocationsStr ? JSON.parse(savedLocationsStr) : [DEFAULT_LOCATION];
      
      setSavedLocations(locations);
      
      // Load active location ID
      const activeId = localStorage.getItem('active_location_id') || locations[0]?.id;
      setActiveLocationId(activeId);
      
      // Set active location data
      const activeLocation = locations.find(loc => loc.id === activeId) || locations[0];
      setActiveLocationData(activeLocation);
    } catch (error) {
      console.error('Error loading saved locations:', error);
      // Fallback to default location
      setSavedLocations([DEFAULT_LOCATION]);
      setActiveLocationId(DEFAULT_LOCATION.id);
      setActiveLocationData(DEFAULT_LOCATION);
    }
  }, []);
  
  // Save locations to localStorage when they change
  useEffect(() => {
    if (savedLocations.length > 0) {
      localStorage.setItem('saved_locations', JSON.stringify(savedLocations));
    }
  }, [savedLocations]);
  
  // Save active location ID when it changes
  useEffect(() => {
    if (activeLocationId) {
      localStorage.setItem('active_location_id', activeLocationId);
    }
  }, [activeLocationId]);
  
  // Update active location data when active ID changes
  useEffect(() => {
    if (activeLocationId && savedLocations.length > 0) {
      const activeLocation = savedLocations.find(loc => loc.id === activeLocationId);
      if (activeLocation) {
        setActiveLocationData(activeLocation);
      } else {
        // If active location is not in saved locations, set first location as active
        setActiveLocationId(savedLocations[0].id);
        setActiveLocationData(savedLocations[0]);
      }
    }
  }, [activeLocationId, savedLocations]);
  
  // Add a new location to saved locations
  const addLocation = useCallback((location) => {
    // Ensure location has required fields
    if (!location || !location.lat || !location.lon) {
      console.error('Invalid location data:', location);
      return;
    }
    
    // Add ID if not present
    const newLocation = {
      ...location,
      id: location.id || `loc-${uuidv4()}`
    };
    
    // Add to saved locations (limit to 5 locations)
    setSavedLocations(prev => {
      const updated = [...prev, newLocation].slice(0, 5);
      return updated;
    });
    
    // Set as active if it's the first location
    if (savedLocations.length === 0) {
      setActiveLocationId(newLocation.id);
    }
  }, [savedLocations]);
  
  // Remove a location from saved locations
  const removeLocation = useCallback((locationId) => {
    setSavedLocations(prev => {
      const updated = prev.filter(loc => loc.id !== locationId);
      
      // If removed location was active, set first remaining location as active
      if (locationId === activeLocationId && updated.length > 0) {
        setActiveLocationId(updated[0].id);
      }
      
      // If all locations are removed, add default location
      if (updated.length === 0) {
        setActiveLocationId(DEFAULT_LOCATION.id);
        return [DEFAULT_LOCATION];
      }
      
      return updated;
    });
  }, [activeLocationId]);
  
  // Set a location as active
  const setActiveLocation = useCallback((locationId) => {
    setActiveLocationId(locationId);
  }, []);
  
  // Reorder locations in the list
  const reorderLocations = useCallback((locationId, direction) => {
    setSavedLocations(prev => {
      const index = prev.findIndex(loc => loc.id === locationId);
      if (index === -1) return prev;
      
      // Can't move first location up or last location down
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prev.length - 1)
      ) {
        return prev;
      }
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const updated = [...prev];
      
      // Swap locations
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      
      return updated;
    });
  }, []);
  
  // Get user's current geolocation
  const getUserGeolocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get location name from coordinates
            const response = await fetch(
              `/api/reverse-geocode?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            
            if (!response.ok) {
              throw new Error('Failed to get location name');
            }
            
            const data = await response.json();
            
            resolve({
              id: `current-${uuidv4()}`,
              name: data.name || 'Current Location',
              state: data.state,
              country: data.country,
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          } catch (error) {
            // If geocoding fails, return coords only
            resolve({
              id: `current-${uuidv4()}`,
              name: 'Current Location',
              state: '',
              country: '',
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }, []);
  
  // Context value
  const contextValue = {
    savedLocations,
    activeLocationId,
    activeLocationData,
    addLocation,
    removeLocation,
    setActiveLocation,
    reorderLocations,
    getUserGeolocation
  };
  
  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationProvider;