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
 * Decodes a VIN using the NHTSA API
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
    
    // Make API call to NHTSA VIN decoder
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
      data.Results.forEach((item: any) => {
        if (item.Value && item.Value !== "Not Applicable") {
          switch (item.Variable) {
            case "Make":
              vehicleInfo.make = item.Value;
              break;
            case "Model":
              vehicleInfo.model = item.Value;
              break;
            case "Model Year":
              vehicleInfo.year = item.Value;
              break;
            case "Trim":
              vehicleInfo.trim = item.Value;
              break;
            case "Engine Model":
              vehicleInfo.engine = item.Value;
              break;
            case "Transmission Style":
              vehicleInfo.transmission = item.Value;
              break;
            case "Vehicle Type":
              vehicleInfo.vehicleType = item.Value;
              break;
            case "Manufacturer Name":
              vehicleInfo.manufacturer = item.Value;
              break;
            case "Plant Country":
              vehicleInfo.plantCountry = item.Value;
              break;
            case "Plant State":
              vehicleInfo.plantState = item.Value;
              break;
            case "Plant City":
              vehicleInfo.plantCity = item.Value;
              break;
            case "Drive Type":
              vehicleInfo.driveLine = item.Value;
              break;
            case "Body Class":
              vehicleInfo.bodyStyle = item.Value;
              break;
            case "Fuel Type - Primary":
              vehicleInfo.fuelType = item.Value;
              break;
            case "Displacement (L)":
              vehicleInfo.displacement = item.Value;
              break;
            case "Engine Number of Cylinders":
              vehicleInfo.cylinders = item.Value;
              break;
          }
        }
      });
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