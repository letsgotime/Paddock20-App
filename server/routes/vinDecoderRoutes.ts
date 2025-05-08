/**
 * VIN Decoder Routes
 * 
 * Server-side routes for decoding Vehicle Identification Numbers (VINs)
 * with caching and rate limiting to avoid NHTSA API limitations.
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';

const router = Router();

// Define the structure of a decoded vehicle
export interface DecodedVehicleInfo {
  make: string;
  model: string;
  year: string;
  trim?: string;
  engine?: string;
  transmission?: string;
  vehicleType?: string;
  manufacturer?: string;
  plantCountry?: string;
  plantState?: string;
  plantCity?: string;
  driveLine?: string;
  bodyStyle?: string;
  fuelType?: string;
  displacement?: string;
  cylinders?: string;
  error?: string;
}

// In-memory cache for VIN decoding results
interface CachedVehicleData {
  data: DecodedVehicleInfo;
  timestamp: number;
}

// Cache for VIN data to reduce API calls
const vinCache = new Map<string, CachedVehicleData>();

// Cache TTL (24 hours in milliseconds)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 requests per minute to NHTSA

// Track API calls for rate limiting
let apiCallsTimestamps: number[] = [];

/**
 * Check if we're within rate limits for NHTSA API
 * @returns Boolean indicating if we can make another API call
 */
function canMakeApiCall(): boolean {
  const now = Date.now();
  // Remove timestamps older than the window
  apiCallsTimestamps = apiCallsTimestamps.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  // Check if we're under the limit
  return apiCallsTimestamps.length < RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Record an API call for rate limiting purposes
 */
function recordApiCall(): void {
  apiCallsTimestamps.push(Date.now());
}

/**
 * Validate a VIN number based on standard 17-character format
 * @param vin Vehicle Identification Number to validate
 * @returns Object containing validation result and optional error message
 */
function validateVIN(vin: string): { isValid: boolean; message?: string } {
  // Basic VIN validation rules
  if (!vin || vin.trim() === '') {
    return { isValid: false, message: 'VIN is required' };
  }
  
  // Standard VIN is 17 characters
  if (vin.length !== 17) {
    return { isValid: false, message: 'VIN must be exactly 17 characters' };
  }
  
  // VINs should not contain I, O, or Q to avoid confusion with 1 and 0
  if (/[IOQ]/.test(vin.toUpperCase())) {
    return { isValid: false, message: 'VIN should not contain letters I, O, or Q' };
  }
  
  // Check for valid characters (alphanumeric only)
  if (!/^[A-HJ-NPR-Z0-9]+$/.test(vin.toUpperCase())) {
    return { isValid: false, message: 'VIN contains invalid characters' };
  }
  
  return { isValid: true };
}

/**
 * Format make name to be more user-friendly
 */
function formatMakeName(make: string): string {
  if (!make) return '';
  
  // Make names are often all caps from the API
  make = make.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  
  // Common abbreviations and formatting fixes
  const makeReplacements: Record<string, string> = {
    'Bmw': 'BMW',
    'Gmc': 'GMC',
    'Vw': 'Volkswagen',
    'Mercedes Benz': 'Mercedes-Benz',
    'Land Rover': 'Land Rover',
    'Hyundai Motor Company': 'Hyundai',
    'Kia Motors Corporation': 'Kia'
  };
  
  return makeReplacements[make] || make;
}

/**
 * Format model name to be more user-friendly
 */
function formatModelName(model: string): string {
  if (!model) return '';
  
  // Model names are often all caps or strangely formatted from the API
  model = model.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  
  return model;
}

/**
 * Get vehicle info from cache if available and not expired
 */
function getFromCache(vin: string): DecodedVehicleInfo | null {
  const cached = vinCache.get(vin);
  if (!cached) return null;
  
  // Check if cache has expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    vinCache.delete(vin);
    return null;
  }
  
  return cached.data;
}

/**
 * Add vehicle info to cache
 */
function addToCache(vin: string, data: DecodedVehicleInfo): void {
  vinCache.set(vin, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Decode a VIN using the NHTSA API
 * @param vin Vehicle Identification Number to decode
 * @returns Promise resolving to decoded vehicle information
 */
async function decodeVIN(vin: string): Promise<DecodedVehicleInfo> {
  try {
    // Make API call to NHTSA VIN decoder
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );
    
    if (response.status !== 200) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = response.data;
    
    // Initialize vehicle data object
    const vehicleInfo: DecodedVehicleInfo = {
      make: '',
      model: '',
      year: ''
    };
    
    // Extract relevant information from the API response
    if (data && data.Results && Array.isArray(data.Results)) {
      // Enhanced data extraction with more fields
      const dataMap: Record<string, string> = {};
      
      // First pass: collect all data into a map for easier access
      data.Results.forEach((item: any) => {
        if (item.Value && item.Value !== "Not Applicable") {
          dataMap[item.Variable] = item.Value;
        }
      });
      
      // Second pass: extract data in a structured way
      vehicleInfo.make = dataMap["Make"] || '';
      vehicleInfo.model = dataMap["Model"] || '';
      vehicleInfo.year = dataMap["Model Year"] || '';
      vehicleInfo.trim = dataMap["Trim"] || '';
      vehicleInfo.engine = dataMap["Engine Model"] || '';
      vehicleInfo.transmission = dataMap["Transmission Style"] || '';
      vehicleInfo.vehicleType = dataMap["Vehicle Type"] || '';
      vehicleInfo.manufacturer = dataMap["Manufacturer Name"] || '';
      vehicleInfo.plantCountry = dataMap["Plant Country"] || '';
      vehicleInfo.plantState = dataMap["Plant State"] || '';
      vehicleInfo.plantCity = dataMap["Plant City"] || '';
      vehicleInfo.driveLine = dataMap["Drive Type"] || '';
      vehicleInfo.bodyStyle = dataMap["Body Class"] || '';
      vehicleInfo.fuelType = dataMap["Fuel Type - Primary"] || '';
      vehicleInfo.displacement = dataMap["Displacement (L)"] || '';
      vehicleInfo.cylinders = dataMap["Engine Number of Cylinders"] || '';
      
      // Additional useful fields
      const series = dataMap["Series"] || '';
      
      if (series && !vehicleInfo.trim) {
        vehicleInfo.trim = series;
      }
    }
    
    // Validate essential data was obtained
    if (!vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.year) {
      console.warn('VIN decoder returned incomplete data:', data);
      
      // If we couldn't get all required data, return error
      if (!vehicleInfo.make && !vehicleInfo.model && !vehicleInfo.year) {
        return {
          make: '',
          model: '',
          year: '',
          error: 'Could not decode VIN. Please enter vehicle details manually.'
        };
      }
    }
    
    // Format data for better user experience
    vehicleInfo.make = formatMakeName(vehicleInfo.make);
    vehicleInfo.model = formatModelName(vehicleInfo.model);
    
    // Parse transmission into a more consumer-friendly format
    if (vehicleInfo.transmission) {
      if (vehicleInfo.transmission.toLowerCase().includes('manual')) {
        vehicleInfo.transmission = 'Manual';
      } else if (vehicleInfo.transmission.toLowerCase().includes('automatic')) {
        vehicleInfo.transmission = 'Automatic';
      } else if (vehicleInfo.transmission.toLowerCase().includes('cvt')) {
        vehicleInfo.transmission = 'CVT';
      } else if (vehicleInfo.transmission.toLowerCase().includes('dual clutch')) {
        vehicleInfo.transmission = 'Dual-Clutch Automatic';
      }
    }
    
    // Format engine information in a more consumer-friendly way
    if (vehicleInfo.displacement && vehicleInfo.cylinders) {
      vehicleInfo.engine = `${vehicleInfo.displacement}L ${vehicleInfo.cylinders}-Cylinder`;
      
      // Add fuel type if available
      if (vehicleInfo.fuelType) {
        vehicleInfo.engine += ` ${vehicleInfo.fuelType}`;
      }
    }
    
    return vehicleInfo;
  } catch (error) {
    console.error('Error decoding VIN:', error);
    return {
      make: '',
      model: '',
      year: '',
      error: 'An error occurred while decoding the VIN. Please try again or enter vehicle details manually.'
    };
  }
}

// Define VIN parameter schema for validation
const vinParamSchema = z.object({
  vin: z.string().length(17).regex(/^[A-HJ-NPR-Z0-9]+$/)
});

/**
 * Endpoint to decode a VIN
 * GET /api/vehicles/decode-vin/:vin
 */
router.get('/decode-vin/:vin', async (req: Request, res: Response) => {
  try {
    const { vin } = req.params;
    
    // Validate VIN
    const validation = validateVIN(vin);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.message
      });
    }
    
    // Check cache first
    const cachedData = getFromCache(vin);
    if (cachedData) {
      console.log('Retrieved vehicle info from cache for VIN:', vin);
      return res.json(cachedData);
    }
    
    // Check rate limits
    if (!canMakeApiCall()) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    // Record this API call
    recordApiCall();
    
    // Decode VIN
    const vehicleInfo = await decodeVIN(vin);
    
    // Add to cache
    if (!vehicleInfo.error) {
      addToCache(vin, vehicleInfo);
    }
    
    return res.json(vehicleInfo);
  } catch (error) {
    console.error('Error processing VIN decode request:', error);
    return res.status(500).json({
      error: 'An error occurred while processing your request.'
    });
  }
});

/**
 * Endpoint to check if a VIN is valid
 * GET /api/vehicles/validate-vin/:vin
 */
router.get('/validate-vin/:vin', (req: Request, res: Response) => {
  try {
    const { vin } = req.params;
    const validation = validateVIN(vin);
    
    return res.json(validation);
  } catch (error) {
    console.error('Error validating VIN:', error);
    return res.status(500).json({
      error: 'An error occurred while validating the VIN.'
    });
  }
});

export default router;