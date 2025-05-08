/**
 * useLocation hook
 * 
 * This custom hook provides easy access to the LocationServicesContext with
 * commonly used functions and properties for working with location data.
 */

import { useLocationServices, LocationData } from '@/contexts/LocationServicesContext';

export function useLocation() {
  const {
    currentLocation,
    favoriteLocations,
    searchHistory,
    setCurrentLocation,
    addFavoriteLocation,
    removeFavoriteLocation,
    updateLocation,
    refreshLocation,
    loading,
    errors,
    lastUpdated,
    formatLastUpdated,
    isStale
  } = useLocationServices();

  // Check if a location exists in favorites
  const isLocationFavorite = (locationId: string): boolean => {
    return favoriteLocations.some(loc => loc.id === locationId);
  };

  // Get a location by ID from any source (current, favorites, or history)
  const getLocationById = (locationId: string): LocationData | null => {
    if (currentLocation && currentLocation.id === locationId) {
      return currentLocation;
    }

    const favorite = favoriteLocations.find(loc => loc.id === locationId);
    if (favorite) {
      return favorite;
    }

    const history = searchHistory.find(loc => loc.id === locationId);
    if (history) {
      return history;
    }

    return null;
  };

  // Toggle favorite status for a location
  const toggleFavorite = (location: LocationData): void => {
    if (isLocationFavorite(location.id)) {
      removeFavoriteLocation(location.id);
    } else {
      addFavoriteLocation(location);
    }
  };

  // Get recently used locations (combination of current, favorites, and history)
  const getRecentLocations = (limit = 5): LocationData[] => {
    // Combine all locations
    let allLocations: LocationData[] = [];
    
    if (currentLocation) {
      allLocations.push(currentLocation);
    }
    
    allLocations = [
      ...allLocations,
      ...favoriteLocations,
      ...searchHistory
    ];
    
    // Remove duplicates by ID
    const uniqueLocations = allLocations.filter((loc, index, self) =>
      index === self.findIndex(l => l.id === loc.id)
    );
    
    // Sort by last used (most recent first) and take the first 'limit' items
    return uniqueLocations
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, limit);
  };

  // Format coordinates as a string
  const formatCoordinates = (location: LocationData | null): string => {
    if (!location) return '';
    
    return `${Math.abs(location.lat).toFixed(4)}° ${location.lat >= 0 ? 'N' : 'S'}, ${Math.abs(location.lon).toFixed(4)}° ${location.lon >= 0 ? 'E' : 'W'}`;
  };

  return {
    // Pass through original properties
    currentLocation,
    favoriteLocations,
    searchHistory,
    setCurrentLocation,
    addFavoriteLocation,
    removeFavoriteLocation,
    updateLocation,
    refreshLocation,
    loading: loading.location,
    error: errors.location,
    lastUpdated: lastUpdated.location,
    
    // Enhanced functionality
    isLocationFavorite,
    getLocationById,
    toggleFavorite,
    getRecentLocations,
    formatCoordinates,
    formatLastUpdated: () => formatLastUpdated('location'),
    isStale: () => isStale('location')
  };
}