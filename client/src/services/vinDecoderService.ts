/**
 * Vehicle Identification Number (VIN) Decoder Service
 * 
 * This service provides functions to decode VIN numbers and extract vehicle information.
 * It uses the NHTSA Vehicle API as the primary source, with fallback mechanisms.
 */

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

/**
 * Validates a VIN number based on standard 17-character format
 * @param vin Vehicle Identification Number to validate
 * @returns Boolean indicating if VIN is valid and error message if invalid
 */
export function validateVIN(vin: string): { isValid: boolean; message?: string } {
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
 * Decodes a VIN using the NHTSA API with improved caching and fallback options
 * @param vin Vehicle Identification Number to decode
 * @returns Promise resolving to decoded vehicle information
 */
export async function decodeVIN(vin: string): Promise<DecodedVehicleInfo> {
  try {
    // First validate the VIN
    const validation = validateVIN(vin);
    if (!validation.isValid) {
      return { 
        make: '', 
        model: '', 
        year: '', 
        error: validation.message 
      };
    }
    
    // Check in-memory cache first
    const cachedData = getFromCache(vin);
    if (cachedData) {
      console.log('Retrieved vehicle info from cache for VIN:', vin);
      return cachedData;
    }
    
    // Try to get vehicle data from server-side endpoint first (if implemented)
    try {
      const serverResponse = await fetch(`/api/vehicles/decode-vin/${vin}`);
      if (serverResponse.ok) {
        const data = await serverResponse.json();
        if (data && !data.error) {
          // Add to cache
          addToCache(vin, data);
          return data;
        }
      }
    } catch (serverError) {
      console.warn('Server-side VIN decoding failed, falling back to direct API:', serverError);
      // Proceed to direct API call if server endpoint fails
    }
    
    // Make direct API call to NHTSA VIN decoder as fallback
    console.log('Making direct API call to NHTSA for VIN:', vin);
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
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
      const gvwr = dataMap["GVWR"] || '';
      
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
    
    // Add to cache before returning
    addToCache(vin, vehicleInfo);
    
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

/**
 * Simple in-memory cache for VIN decoder results
 */
const vinCache = new Map<string, { data: DecodedVehicleInfo, timestamp: number }>();

/**
 * Cache TTL (24 hours in milliseconds)
 */
const CACHE_TTL = 24 * 60 * 60 * 1000;

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
 * Formats a VIN with spaces for better readability
 * @param vin Vehicle Identification Number to format
 * @returns Formatted VIN
 */
export function formatVIN(vin: string): string {
  if (!vin) return '';
  
  // Format as: XXX XXXXXX XXXXXXX (3-6-8 format) for better readability
  const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanVin.length === 17) {
    return `${cleanVin.substring(0, 3)} ${cleanVin.substring(3, 9)} ${cleanVin.substring(9)}`;
  }
  return cleanVin;
}

/**
 * Utility to get vin info using a fake decoder for testing
 * @param vin Vehicle Identification Number
 * @returns Mock decoded vehicle info for testing
 */
export function getMockVehicleInfo(vin: string): DecodedVehicleInfo {
  // Check if it's a test VIN with pattern TEST followed by brand
  if (vin.startsWith('TEST')) {
    const brand = vin.substring(4, 9).toLowerCase();
    
    if (brand.includes('bmw')) {
      return {
        make: 'BMW',
        model: 'M3',
        year: '2023',
        trim: 'Competition',
        engine: '3.0L Twin-Turbo Inline-6',
        transmission: 'Automatic',
        vehicleType: 'Passenger Car',
        driveLine: 'RWD'
      };
    } else if (brand.includes('porsc')) {
      return {
        make: 'Porsche',
        model: '911',
        year: '2023',
        trim: 'Carrera S',
        engine: '3.0L Twin-Turbo Flat-6',
        transmission: 'Manual',
        vehicleType: 'Passenger Car',
        driveLine: 'RWD'
      };
    } else if (brand.includes('ferr')) {
      return {
        make: 'Ferrari',
        model: '296',
        year: '2023',
        trim: 'GTB',
        engine: '3.0L Twin-Turbo V6 Hybrid',
        transmission: 'Dual-Clutch Automatic',
        vehicleType: 'Passenger Car',
        driveLine: 'RWD'
      };
    }
  }
  
  // Return error for non-test VINs
  return {
    make: '',
    model: '',
    year: '',
    error: 'For testing purposes, use VINs starting with TEST (e.g., TESTBMW...)'
  };
}