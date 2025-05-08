/**
 * EnhancedLocationContext
 * 
 * A focused, simplified location context that provides geocoding capabilities 
 * without the circular dependencies and complexity of the full LocationServicesContext.
 * 
 * Features:
 * - Geocoding and reverse geocoding
 * - Aggressive caching to manage API limits
 * - Simple, focused API
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { openCageService } from '@/services/location/openCageService';
import { createLocalStorageWithExpiry, getLocalStorageSize } from '@/utils/storageUtils';

// Interface for location information
export interface LocationInfo {
  lat: number;
  lon: number;
  city?: string;
  region?: string;
  country?: string;
  formattedAddress: string;
  components?: Record<string, string>;
  lastUpdated: Date;
}

// Interface for cache statistics
interface CacheStats {
  entries: number;
  oldestEntryDays: number;
  newestEntryDays: number;
  sizeKB: number;
}

// Context interface
interface EnhancedLocationContextType {
  locationInfo: LocationInfo | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<LocationInfo | null>;
  searchLocation: (query: string) => Promise<LocationInfo | null>;
  cacheStats: CacheStats | null;
  clearCache: () => void;
}

// Create context
const EnhancedLocationContext = createContext<EnhancedLocationContextType | undefined>(undefined);

// Storage keys
const CURRENT_LOCATION_KEY = 'enhanced_location_current';

// Provider component
export const EnhancedLocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const localStorage = createLocalStorageWithExpiry();
  
  // State
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  
  // Load saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem(CURRENT_LOCATION_KEY);
    if (savedLocation) {
      // Convert lastUpdated back to Date object
      const locationWithDate = {
        ...savedLocation,
        lastUpdated: new Date(savedLocation.lastUpdated)
      };
      setLocationInfo(locationWithDate);
    } else {
      // Auto-detect location on first load
      refreshLocation();
    }
    
    // Update cache stats
    updateCacheStats();
  }, []);
  
  // Update cache statistics
  const updateCacheStats = useCallback(() => {
    const cacheData = localStorage.getItem('opencage_geocode_cache') || {};
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    let entries = 0;
    
    if (typeof cacheData === 'object') {
      Object.values(cacheData).forEach((entry: any) => {
        entries++;
        if (entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
        }
        if (entry.timestamp > newestTimestamp) {
          newestTimestamp = entry.timestamp;
        }
      });
    }
    
    const now = Date.now();
    const oldestDays = oldestTimestamp ? Math.floor((now - oldestTimestamp) / (1000 * 60 * 60 * 24)) : 0;
    const newestDays = newestTimestamp ? Math.floor((now - newestTimestamp) / (1000 * 60 * 60 * 24)) : 0;
    
    setCacheStats({
      entries,
      oldestEntryDays: oldestDays,
      newestEntryDays: newestDays,
      sizeKB: Math.round(getLocalStorageSize() / 1024)
    });
  }, []);
  
  // Function to refresh current location
  const refreshLocation = useCallback(async (): Promise<LocationInfo | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Try browser geolocation API
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60 * 60 * 1000 // 1 hour
          });
        } else {
          reject(new Error('Geolocation not supported'));
        }
      });
      
      // Got coordinates, now reverse geocode
      const { latitude, longitude } = position.coords;
      
      // Call OpenCage reverse geocoding
      const geocodeResult = await openCageService.reverseGeocode(latitude, longitude);
      
      if (geocodeResult) {
        // Transform to LocationInfo format
        const info: LocationInfo = {
          lat: geocodeResult.lat,
          lon: geocodeResult.lon,
          city: extractComponent(geocodeResult, ['city', 'town', 'village']),
          region: extractComponent(geocodeResult, ['state', 'county']),
          country: extractComponent(geocodeResult, ['country']),
          formattedAddress: geocodeResult.address || '',
          components: geocodeResult.components || {},
          lastUpdated: new Date()
        };
        
        // Update state
        setLocationInfo(info);
        
        // Save to localStorage
        localStorage.setItem(CURRENT_LOCATION_KEY, {
          ...info,
          lastUpdated: info.lastUpdated.toISOString()
        });
        
        updateCacheStats();
        return info;
      } else {
        throw new Error('Failed to reverse geocode location');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Location detection failed: ${message}`);
      
      toast({
        title: 'Location Detection Failed',
        description: message,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast, updateCacheStats]);
  
  // Function to search for a location
  const searchLocation = useCallback(async (query: string): Promise<LocationInfo | null> => {
    if (!query.trim()) return null;
    
    try {
      // Call OpenCage forward geocoding
      const geocodeResult = await openCageService.geocode(query);
      
      if (geocodeResult) {
        // Transform to LocationInfo format
        const info: LocationInfo = {
          lat: geocodeResult.lat,
          lon: geocodeResult.lon,
          city: extractComponent(geocodeResult, ['city', 'town', 'village']),
          region: extractComponent(geocodeResult, ['state', 'county']),
          country: extractComponent(geocodeResult, ['country']),
          formattedAddress: geocodeResult.address || '',
          components: geocodeResult.components || {},
          lastUpdated: new Date()
        };
        
        updateCacheStats();
        return info;
      } else {
        throw new Error('No results found for your search');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      
      toast({
        title: 'Search Failed',
        description: message,
        variant: 'destructive',
      });
      
      return null;
    }
  }, [toast, updateCacheStats]);
  
  // Function to clear the cache
  const clearCache = useCallback(() => {
    openCageService.clearCache();
    updateCacheStats();
    
    toast({
      title: 'Cache Cleared',
      description: 'The geocoding cache has been cleared.',
    });
  }, [toast, updateCacheStats]);
  
  // Helper function to extract component from geocode result
  const extractComponent = (geocodeResult: any, componentKeys: string[]): string | undefined => {
    if (!geocodeResult.components) return undefined;
    
    for (const key of componentKeys) {
      if (geocodeResult.components[key]) {
        return geocodeResult.components[key];
      }
    }
    
    return undefined;
  };
  
  // Context value
  const contextValue: EnhancedLocationContextType = {
    locationInfo,
    loading,
    error,
    refreshLocation,
    searchLocation,
    cacheStats,
    clearCache
  };
  
  return (
    <EnhancedLocationContext.Provider value={contextValue}>
      {children}
    </EnhancedLocationContext.Provider>
  );
};

// Hook for using the context
export const useEnhancedLocation = () => {
  const context = useContext(EnhancedLocationContext);
  
  if (context === undefined) {
    throw new Error('useEnhancedLocation must be used within an EnhancedLocationProvider');
  }
  
  return context;
};