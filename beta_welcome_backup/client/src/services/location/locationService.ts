/**
 * Location Service
 * 
 * This service integrates IPinfo for geolocation and serves as a centralized
 * location detection service for the application.
 * 
 * It provides:
 * - IP-based geolocation with fallback mechanisms
 * - Location data formatting and transformation
 * - Error handling and fallback strategies
 */

import { v4 as uuidv4 } from 'uuid';
import { ipInfoService, IPInfoResponse } from './ipInfoService';
import { openCageService } from './openCageService';
import { LocationData } from '@/contexts/LocationServicesContext';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// Default fallback coordinates if geolocation fails (Atlanta)
const DEFAULT_COORDINATES = {
  lat: 33.7490,
  lon: -84.3880
};

/**
 * Get current location using browser geolocation API
 * @returns Promise resolving to coordinates { lat, lon }
 */
export async function getCurrentPosition(): Promise<{ lat: number, lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Get location using IPinfo as fallback if browser geolocation fails
 * @returns LocationData object with coordinates and metadata
 */
export async function getLocationWithFallback(): Promise<LocationData> {
  try {
    // Try browser geolocation first
    const position = await getCurrentPosition();
    
    // Use IPinfo to get location metadata
    try {
      const locationDetails = await getLocationMetadata(position);
      return locationDetails;
    } catch (error) {
      // If IPinfo metadata fails, return basic location data
      console.warn('Failed to get location metadata:', error);
      return createDefaultLocationData(position, 'Current Location');
    }
  } catch (geolocationError) {
    console.warn('Browser geolocation failed, using IPinfo fallback:', geolocationError);
    
    try {
      // Try IPinfo as fallback for coordinates
      const ipInfoData = await ipInfoService.getLocationByIP();
      
      if (ipInfoData && (ipInfoData.latitude || ipInfoData.loc)) {
        const coordinates = {
          lat: ipInfoData.latitude || parseFloat(ipInfoData.loc?.split(',')[0] || '0'),
          lon: ipInfoData.longitude || parseFloat(ipInfoData.loc?.split(',')[1] || '0')
        };
        
        // Use this data to construct a LocationData object
        return createLocationDataFromIPInfo(ipInfoData);
      }
      
      // If IPinfo doesn't provide coordinates, use default as last resort
      throw new Error('IPinfo did not provide valid coordinates');
    } catch (ipInfoError) {
      console.error('Both geolocation and IPinfo fallback failed:', ipInfoError);
      // Last resort fallback to default coordinates
      return createDefaultLocationData(DEFAULT_COORDINATES, 'Default Location');
    }
  }
}

/**
 * Transform IPinfo response to LocationData format
 */
function createLocationDataFromIPInfo(ipInfo: IPInfoResponse): LocationData {
  // Extract coordinates
  const lat = ipInfo.latitude || (ipInfo.loc ? parseFloat(ipInfo.loc.split(',')[0]) : DEFAULT_COORDINATES.lat);
  const lon = ipInfo.longitude || (ipInfo.loc ? parseFloat(ipInfo.loc.split(',')[1]) : DEFAULT_COORDINATES.lon);
  
  // Build location name
  let locationName = 'Current Location';
  if (ipInfo.city) {
    locationName = ipInfo.city;
    if (ipInfo.region) {
      locationName += `, ${ipInfo.region}`;
    }
  } else if (ipInfo.country) {
    locationName = ipInfo.country;
  }
  
  // Create standardized LocationData object
  return {
    id: uuidv4(),
    name: locationName,
    lat,
    lon,
    type: 'current',
    lastUsed: Date.now(),
    icon: 'map-pin',
    address: getFormattedAddress(ipInfo)
  };
}

/**
 * Create a formatted address string from IPinfo data
 */
function getFormattedAddress(ipInfo: IPInfoResponse): string {
  const addressParts = [];
  
  if (ipInfo.city) addressParts.push(ipInfo.city);
  if (ipInfo.region) addressParts.push(ipInfo.region);
  if (ipInfo.country) addressParts.push(ipInfo.country);
  
  return addressParts.join(', ');
}

/**
 * Get additional metadata for a location using IPinfo
 * Enhances basic coordinates with meaningful location data
 */
async function getLocationMetadata(coordinates: { lat: number, lon: number }): Promise<LocationData> {
  try {
    // First try to get data from IPinfo
    const ipInfoData = await ipInfoService.getLocationByIP();
    
    // Create a rich location object using both sets of data
    return {
      id: uuidv4(),
      name: createLocationName(ipInfoData, 'Current Location'),
      lat: coordinates.lat, // Use precise browser coordinates
      lon: coordinates.lon,
      type: 'current',
      lastUsed: Date.now(),
      icon: 'map-pin',
      address: getFormattedAddress(ipInfoData)
    };
  } catch (error) {
    console.warn('Failed to get location metadata from IPinfo:', error);
    // Fallback to basic data
    return createDefaultLocationData(coordinates, 'Current Location');
  }
}

/**
 * Create a default LocationData object with minimal information
 */
function createDefaultLocationData(
  coordinates: { lat: number, lon: number },
  fallbackName: string
): LocationData {
  return {
    id: uuidv4(),
    name: fallbackName,
    lat: coordinates.lat,
    lon: coordinates.lon,
    type: 'current',
    lastUsed: Date.now()
  };
}

/**
 * Create a user-friendly location name from IPinfo data
 */
function createLocationName(ipInfo: IPInfoResponse, fallback: string): string {
  if (ipInfo.city) {
    return ipInfo.region 
      ? `${ipInfo.city}, ${ipInfo.region}` 
      : ipInfo.city;
  }
  
  if (ipInfo.country) {
    return ipInfo.country;
  }
  
  return fallback;
}

/**
 * Calculate distance between two coordinates in kilometers
 * Uses the Haversine formula for great-circle distance
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}