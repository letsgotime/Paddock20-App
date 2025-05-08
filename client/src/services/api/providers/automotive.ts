import { BaseProvider, ProviderResponse } from '../core/provider';
import { ApiRequestConfig } from '../core/types';

/**
 * Vehicle information for basic VIN decoding
 */
export interface VehicleInfo {
  year: number;
  make: string;
  model: string;
  manufacturer: string;
  engine: string;
  trim: string;
  transmission: string;
}

/**
 * Detailed vehicle information with extended specifications
 */
export interface VehicleDetailedInfo extends VehicleInfo {
  body_style?: string;
  body_style_desc?: string;
  door_cnt?: string;
  drive_type?: string;
  drive_type_desc?: string;
  engine_has_supercharger?: string;
  engine_has_turbocharger?: string;
  engine_has_variable_valve_timing?: string;
  engine_cylinder_cnt?: string;
  engine_displacement_cubic_liters?: string;
  fuel_type?: string;
  tire_front_size?: string;
  tire_rear_size?: string;
  weight_base?: string;
  fuel_cpcty_gallons?: string;
  [key: string]: any; // Allow any additional properties
}

/**
 * OBD2 port location information
 */
export interface OBD2PortLocation {
  name: string;
  location: string;
  image_url?: string;
  description: string;
}

/**
 * Maintenance item details
 */
export interface MaintenanceItem {
  id: string;
  name: string;
  description: string;
  interval_miles: number;
  interval_months: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  estimated_time_hours?: number;
  part_numbers?: string[];
}

/**
 * Vehicle recall information
 */
export interface VehicleRecall {
  id: string;
  campaign_number: string;
  date: string;
  description: string;
  remedy: string;
  notes: string;
  safety_risk: string;
  affected_components: string[];
}

/**
 * TSB (Technical Service Bulletin) information
 */
export interface TechnicalServiceBulletin {
  id: string;
  number: string;
  date: string;
  title: string;
  description: string;
  affected_components: string[];
  pdf_url?: string;
}

/**
 * CarScan API Provider for automotive information
 */
export class CarScanProvider extends BaseProvider {
  private baseUrl = 'https://api.carscan.com/v3.0';
  private partnerToken: string;
  private authKey: string;
  
  /**
   * Create an instance of CarScanProvider
   */
  constructor() {
    super('carscan', 'automotive', 8);
    
    this.partnerToken = process.env.CARSCAN_PARTNER_TOKEN || '';
    this.authKey = process.env.CARSCAN_AUTH_KEY || '';
    
    if (!this.partnerToken || !this.authKey) {
      console.warn('CarScan API credentials not configured. Set CARSCAN_PARTNER_TOKEN and CARSCAN_AUTH_KEY environment variables.');
    }
  }
  
  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean {
    return !!this.partnerToken && !!this.authKey;
  }
  
  /**
   * Get authorization headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'content-type': 'application/json',
      'authorization': this.authKey,
      'partner-token': this.partnerToken
    };
  }
  
  /**
   * Make a request to the CarScan API
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<ProviderResponse<T>> {
    if (!this.isConfigured()) {
      return this.handleError(
        new Error('CarScan API not configured'),
        'Missing API credentials'
      );
    }
    
    try {
      // Build query string from params
      const queryParams = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `${this.baseUrl}/${endpoint}${queryParams ? '?' + queryParams : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message?.message || 'API request failed');
      }
      
      const data = await response.json();
      
      if (data.message?.message !== 'ok') {
        throw new Error(data.message?.message || 'API request failed');
      }
      
      return {
        success: true,
        data: data.data,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch automotive data');
    }
  }
  
  /**
   * Get basic vehicle information using a VIN
   */
  async getVehicleByVin(vin: string): Promise<ProviderResponse<VehicleInfo>> {
    return this.makeRequest<VehicleInfo>('decode', { vin });
  }
  
  /**
   * Get detailed vehicle information using a VIN
   */
  async getVehicleDetailedByVin(vin: string): Promise<ProviderResponse<VehicleDetailedInfo>> {
    return this.makeRequest<VehicleDetailedInfo>('decode_more', { vin });
  }
  
  /**
   * Get OBD2 port location for a vehicle
   */
  async getOBD2PortLocation(vin: string): Promise<ProviderResponse<OBD2PortLocation>> {
    return this.makeRequest<OBD2PortLocation>('port', { vin });
  }
  
  /**
   * Get maintenance schedule for a vehicle at specific mileage
   */
  async getMaintenanceSchedule(
    vin: string, 
    mileage: number, 
    unit: 'km' | 'mi' = 'mi'
  ): Promise<ProviderResponse<MaintenanceItem[]>> {
    return this.makeRequest<MaintenanceItem[]>('maintenance', { 
      vin, 
      mileage,
      unit
    });
  }
  
  /**
   * Get complete maintenance schedule for a vehicle
   */
  async getMaintenanceList(vin: string): Promise<ProviderResponse<MaintenanceItem[]>> {
    return this.makeRequest<MaintenanceItem[]>('maintenance_list', { vin });
  }
  
  /**
   * Get safety recalls for a vehicle
   */
  async getSafetyRecalls(vin: string): Promise<ProviderResponse<VehicleRecall[]>> {
    return this.makeRequest<VehicleRecall[]>('recall', { vin });
  }
  
  /**
   * Get technical service bulletins (TSBs) for a vehicle
   */
  async getTSBs(vin: string): Promise<ProviderResponse<TechnicalServiceBulletin[]>> {
    return this.makeRequest<TechnicalServiceBulletin[]>('tsb', { vin });
  }
  
  /**
   * Get warranty information for a vehicle
   */
  async getWarranty(vin: string): Promise<ProviderResponse<any>> {
    return this.makeRequest<any>('warranty', { vin });
  }
  
  /**
   * Get diagnostic trouble code definition
   */
  async getCodeDefinition(code: string): Promise<ProviderResponse<any>> {
    return this.makeRequest<any>('code', { code });
  }
  
  /**
   * Get repair information for a specific trouble code
   */
  async getRepairInfo(
    vin: string, 
    code: string, 
    mileage?: number, 
    unit: 'km' | 'mi' = 'mi'
  ): Promise<ProviderResponse<any>> {
    const params: Record<string, any> = { vin, code };
    if (mileage) {
      params.mileage = mileage;
      params.unit = unit;
    }
    return this.makeRequest<any>('repair', params);
  }
  
  /**
   * Check what data is available for a vehicle
   */
  async checkAvailableData(
    vin: string, 
    mileage?: number, 
    code?: string, 
    unit: 'km' | 'mi' = 'mi'
  ): Promise<ProviderResponse<Record<string, boolean>>> {
    const params: Record<string, any> = { vin };
    if (mileage) {
      params.mileage = mileage;
      params.unit = unit;
    }
    if (code) {
      params.dtc = code;
    }
    return this.makeRequest<Record<string, boolean>>('fields', params);
  }
}

/**
 * Factory function to create a CarScan provider
 */
export function createCarScanProvider(): CarScanProvider {
  return new CarScanProvider();
}

/**
 * NHTSA Vehicle API Provider for additional automotive information
 * This is a public API that doesn't require authentication
 */
export class NHTSAVehicleProvider extends BaseProvider {
  private baseUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles';
  
  constructor() {
    super('nhtsa', 'automotive', 5); // Lower priority than CarScan
  }
  
  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean {
    return true; // Always configured as no auth required
  }
  
  /**
   * Make a request to the NHTSA API
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<ProviderResponse<T>> {
    try {
      // Always request JSON format
      params.format = 'json';
      
      // Build query string from params
      const queryParams = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `${this.baseUrl}/${endpoint}?${queryParams}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NHTSA API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.Results || data,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch NHTSA vehicle data');
    }
  }
  
  /**
   * Decode a VIN to get vehicle information
   */
  async decodeVin(vin: string): Promise<ProviderResponse<any>> {
    return this.makeRequest<any>(`DecodeVin/${vin}`);
  }
  
  /**
   * Get makes for a specific model year
   */
  async getMakesByYear(year: number): Promise<ProviderResponse<any>> {
    return this.makeRequest<any>(`GetMakesForModelYear/${year}`);
  }
  
  /**
   * Get models for a specific make and year
   */
  async getModelsByMakeAndYear(make: string, year: number): Promise<ProviderResponse<any>> {
    return this.makeRequest<any>(`GetModelsForMakeYear/make/${make}/modelyear/${year}`);
  }
  
  /**
   * Get all makes (manufacturers)
   */
  async getAllMakes(): Promise<ProviderResponse<any>> {
    return this.makeRequest<any>('GetAllMakes');
  }
  
  /**
   * Get recalls for a vehicle
   */
  async getRecalls(make: string, model: string, year: number): Promise<ProviderResponse<any>> {
    return this.makeRequest<any>(
      'GetRecallsByVehicle',
      { make, model, modelYear: year }
    );
  }
  
  /**
   * Get complaints for a vehicle
   */
  async getComplaints(make: string, model: string, year: number): Promise<ProviderResponse<any>> {
    return this.makeRequest<any>(
      'GetComplaintsByVehicle',
      { make, model, modelYear: year }
    );
  }
}

/**
 * Mock implementation of automotive provider for development
 */
export class MockAutomotiveProvider extends BaseProvider {
  constructor() {
    super('mock-automotive', 'automotive', 10); // Highest priority during development
  }
  
  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean {
    return true; // Always configured
  }
  
  /**
   * Get basic vehicle information using a VIN
   */
  async getVehicleByVin(vin: string): Promise<ProviderResponse<VehicleInfo>> {
    // Extract year from VIN (10th character)
    const yearChar = vin.charAt(9);
    const yearMap: Record<string, number> = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
      'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024
    };
    
    // Default to current year if not found
    const year = yearMap[yearChar] || new Date().getFullYear();
    
    // Mock data based on first few characters of VIN
    const mockData: Record<string, Partial<VehicleInfo>> = {
      'WBA': { make: 'BMW', manufacturer: 'BMW GROUP' },
      'WBY': { make: 'BMW', manufacturer: 'BMW GROUP' },
      '5YJ': { make: 'TESLA', manufacturer: 'TESLA, INC.' },
      '1G1': { make: 'CHEVROLET', manufacturer: 'GENERAL MOTORS' },
      '1FA': { make: 'FORD', manufacturer: 'FORD MOTOR COMPANY' },
      'JN1': { make: 'NISSAN', manufacturer: 'NISSAN MOTOR CO., LTD.' },
      '4T1': { make: 'TOYOTA', manufacturer: 'TOYOTA MOTOR CORPORATION' },
      'JH4': { make: 'ACURA', manufacturer: 'HONDA MOTOR CO., LTD.' },
      'KM8': { make: 'HYUNDAI', manufacturer: 'HYUNDAI MOTOR COMPANY' },
    };
    
    // Find matching prefix
    const prefix = Object.keys(mockData).find(prefix => vin.startsWith(prefix)) || '';
    const matchedMake = mockData[prefix]?.make || 'UNKNOWN';
    const matchedManufacturer = mockData[prefix]?.manufacturer || 'UNKNOWN MANUFACTURER';
    
    // Model based on VIN segment
    const modelSegment = vin.substring(4, 8).toUpperCase();
    let model = '';
    let engine = '';
    let trim = '';
    let transmission = 'AUTOMATIC';
    
    switch (matchedMake) {
      case 'BMW':
        model = modelSegment.startsWith('3') ? '3 SERIES' : 
                modelSegment.startsWith('5') ? '5 SERIES' : 
                modelSegment.startsWith('7') ? '7 SERIES' : 
                modelSegment.startsWith('X') ? `X${modelSegment.charAt(1)}` : 
                'UNKNOWN MODEL';
        engine = modelSegment.includes('30') ? '3.0L INLINE 6' : 
                 modelSegment.includes('40') ? '4.0L V8' : 
                 modelSegment.includes('20') ? '2.0L INLINE 4' : 
                 '2.0L TURBOCHARGED';
        trim = modelSegment.includes('I') ? 'xDRIVE' : 'sDRIVE';
        break;
      case 'TESLA':
        model = modelSegment.includes('S') ? 'MODEL S' : 
                modelSegment.includes('3') ? 'MODEL 3' : 
                modelSegment.includes('X') ? 'MODEL X' : 
                modelSegment.includes('Y') ? 'MODEL Y' : 
                'UNKNOWN MODEL';
        engine = 'ELECTRIC';
        trim = modelSegment.includes('P') ? 'PERFORMANCE' : 'LONG RANGE';
        break;
      case 'FORD':
        model = modelSegment.includes('F') ? 'F-150' : 
                modelSegment.includes('MUS') ? 'MUSTANG' : 
                modelSegment.includes('EXP') ? 'EXPLORER' : 
                modelSegment.includes('BRO') ? 'BRONCO' : 
                'UNKNOWN MODEL';
        engine = modelSegment.includes('V8') ? '5.0L V8' : 
                 modelSegment.includes('V6') ? '3.5L V6' : 
                 modelSegment.includes('ECO') ? '2.3L ECOBOOST' : 
                 '2.0L INLINE 4';
        trim = modelSegment.includes('LT') ? 'LARIAT' : 
               modelSegment.includes('PL') ? 'PLATINUM' : 
               'XLT';
        break;
      default:
        model = 'STANDARD MODEL';
        engine = '2.0L INLINE 4';
        trim = 'BASE';
    }
    
    return {
      success: true,
      data: {
        year,
        make: matchedMake,
        model,
        manufacturer: matchedManufacturer,
        engine,
        trim,
        transmission
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get detailed vehicle information
   */
  async getVehicleDetailedByVin(vin: string): Promise<ProviderResponse<VehicleDetailedInfo>> {
    // Get basic info first
    const basicInfo = await this.getVehicleByVin(vin);
    
    if (!basicInfo.success) {
      return {
        ...basicInfo,
        data: {} as VehicleDetailedInfo
      };
    }
    
    // Add more detailed info
    const vehicleInfo = basicInfo.data;
    const detailedInfo: VehicleDetailedInfo = {
      ...vehicleInfo,
      body_style: vehicleInfo.model.includes('SERIES') ? 'SD' : 
                  vehicleInfo.model.includes('X') ? 'UT' : 
                  vehicleInfo.model.includes('F-150') ? 'PK' : 
                  'CP',
      body_style_desc: vehicleInfo.model.includes('SERIES') ? 'SEDAN' : 
                        vehicleInfo.model.includes('X') ? 'SPORT UTILITY VEHICLE' : 
                        vehicleInfo.model.includes('F-150') ? 'PICKUP' : 
                        'COUPE',
      door_cnt: vehicleInfo.model.includes('COUPE') ? '2' : '4',
      drive_type: vehicleInfo.trim.includes('xDRIVE') ? 'AWD' : 
                  vehicleInfo.make === 'TESLA' ? 'AWD' : 
                  vehicleInfo.model.includes('F-150') ? '4WD' : 
                  'FWD',
      drive_type_desc: vehicleInfo.trim.includes('xDRIVE') ? 'All Wheel Drive' : 
                       vehicleInfo.make === 'TESLA' ? 'All Wheel Drive' : 
                       vehicleInfo.model.includes('F-150') ? 'Four Wheel Drive' : 
                       'Front Wheel Drive',
      engine_has_supercharger: vehicleInfo.engine.includes('SUPERCHARGED') ? 'Yes' : 'No',
      engine_has_turbocharger: vehicleInfo.engine.includes('TURBO') || vehicleInfo.engine.includes('ECOBOOST') ? 'Yes' : 'No',
      engine_has_variable_valve_timing: 'Yes',
      engine_cylinder_cnt: vehicleInfo.engine.includes('V8') ? '8' : 
                           vehicleInfo.engine.includes('V6') ? '6' : 
                           vehicleInfo.engine.includes('INLINE 6') ? '6' : 
                           vehicleInfo.engine === 'ELECTRIC' ? '0' : 
                           '4',
      engine_displacement_cubic_liters: vehicleInfo.engine.includes('5.0') ? '5.0' : 
                                         vehicleInfo.engine.includes('4.0') ? '4.0' : 
                                         vehicleInfo.engine.includes('3.5') ? '3.5' : 
                                         vehicleInfo.engine.includes('3.0') ? '3.0' : 
                                         vehicleInfo.engine.includes('2.3') ? '2.3' : 
                                         vehicleInfo.engine === 'ELECTRIC' ? '0.0' : 
                                         '2.0',
      fuel_type: vehicleInfo.engine === 'ELECTRIC' ? 'ELECTRIC' : 'GASOLINE',
      tire_front_size: vehicleInfo.make === 'BMW' ? '245/45R19' : 
                       vehicleInfo.make === 'TESLA' ? '235/45R18' : 
                       vehicleInfo.model.includes('F-150') ? '275/65R18' : 
                       '225/55R17',
      tire_rear_size: vehicleInfo.make === 'BMW' ? '275/40R19' : 
                      vehicleInfo.make === 'TESLA' ? '235/45R18' : 
                      vehicleInfo.model.includes('F-150') ? '275/65R18' : 
                      '225/55R17',
      weight_base: vehicleInfo.make === 'BMW' ? '3800' : 
                   vehicleInfo.make === 'TESLA' ? '4600' : 
                   vehicleInfo.model.includes('F-150') ? '5000' : 
                   '3500',
      fuel_cpcty_gallons: vehicleInfo.engine === 'ELECTRIC' ? '0' : 
                          vehicleInfo.model.includes('F-150') ? '26' : 
                          vehicleInfo.make === 'BMW' ? '18' : 
                          '16'
    };
    
    return {
      success: true,
      data: detailedInfo,
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get OBD2 port location
   */
  async getOBD2PortLocation(vin: string): Promise<ProviderResponse<OBD2PortLocation>> {
    // Get basic vehicle info first to determine make/model
    const basicInfo = await this.getVehicleByVin(vin);
    
    if (!basicInfo.success) {
      return {
        ...basicInfo,
        data: {} as OBD2PortLocation
      };
    }
    
    // Mock OBD2 port locations based on make
    const locations: Record<string, OBD2PortLocation> = {
      'BMW': {
        name: 'BMW OBD2 Port',
        location: 'Driver side, under the dashboard near the footwell panel',
        image_url: 'https://example.com/bmw-obd2.jpg',
        description: 'Pull back the panel under the steering wheel for access. The port is recessed and may require a flashlight to locate.'
      },
      'TESLA': {
        name: 'Tesla OBD2 Port',
        location: 'Center console, under the cup holders',
        image_url: 'https://example.com/tesla-obd2.jpg',
        description: 'Remove the cup holder insert to access. May require special adapter for Tesla vehicles.'
      },
      'FORD': {
        name: 'Ford OBD2 Port',
        location: 'Driver side, below the steering column',
        image_url: 'https://example.com/ford-obd2.jpg',
        description: 'Visible directly under the dashboard. May be covered with a small cap.'
      },
      'CHEVROLET': {
        name: 'Chevrolet OBD2 Port',
        location: 'Driver side, below the steering column',
        image_url: 'https://example.com/chevrolet-obd2.jpg',
        description: 'Easily accessible without removing panels. Look for a 16-pin connector.'
      },
      'TOYOTA': {
        name: 'Toyota OBD2 Port',
        location: 'Driver side, under the dashboard',
        image_url: 'https://example.com/toyota-obd2.jpg',
        description: 'Located to the left of the steering column. May be covered by a small door labeled "OBD".'
      }
    };
    
    // Default location for makes not in our mock database
    const defaultLocation: OBD2PortLocation = {
      name: 'Standard OBD2 Port',
      location: 'Driver side, under the dashboard',
      image_url: 'https://example.com/default-obd2.jpg',
      description: 'Located near the steering column. Look for a 16-pin connector, often with a plastic cover.'
    };
    
    return {
      success: true,
      data: locations[basicInfo.data.make] || defaultLocation,
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get maintenance schedule for vehicle
   */
  async getMaintenanceSchedule(
    vin: string, 
    mileage: number, 
    unit: 'km' | 'mi' = 'mi'
  ): Promise<ProviderResponse<MaintenanceItem[]>> {
    const basicInfo = await this.getVehicleByVin(vin);
    
    if (!basicInfo.success) {
      return {
        ...basicInfo,
        data: [] as MaintenanceItem[]
      };
    }
    
    // Convert km to miles if needed
    const milesMileage = unit === 'km' ? Math.round(mileage * 0.621371) : mileage;
    
    // Create scheduled maintenance items based on mileage
    const maintenanceItems: MaintenanceItem[] = [];
    
    // Oil change (every 5,000 miles or so)
    if (basicInfo.data.engine !== 'ELECTRIC' && milesMileage % 5000 < 500) {
      maintenanceItems.push({
        id: `oil-change-${Date.now()}`,
        name: 'Oil Change',
        description: 'Replace engine oil and filter',
        interval_miles: 5000,
        interval_months: 6,
        severity: 'medium',
        estimated_cost_min: 50,
        estimated_cost_max: 100,
        estimated_time_hours: 0.75
      });
    }
    
    // Tire rotation (every 5,000-8,000 miles)
    if (milesMileage % 7500 < 500) {
      maintenanceItems.push({
        id: `tire-rotation-${Date.now()}`,
        name: 'Tire Rotation',
        description: 'Rotate tires to ensure even wear',
        interval_miles: 7500,
        interval_months: 6,
        severity: 'medium',
        estimated_cost_min: 25,
        estimated_cost_max: 75,
        estimated_time_hours: 0.5
      });
    }
    
    // Brake inspection (every 10,000 miles)
    if (milesMileage % 10000 < 500) {
      maintenanceItems.push({
        id: `brake-inspect-${Date.now()}`,
        name: 'Brake Inspection',
        description: 'Inspect brake pads, rotors, and brake fluid level',
        interval_miles: 10000,
        interval_months: 12,
        severity: 'medium',
        estimated_cost_min: 0,
        estimated_cost_max: 50,
        estimated_time_hours: 0.5
      });
    }
    
    // Air filter (every 15,000-30,000 miles)
    if (milesMileage % 15000 < 500) {
      maintenanceItems.push({
        id: `air-filter-${Date.now()}`,
        name: 'Air Filter Replacement',
        description: 'Replace engine air filter',
        interval_miles: 15000,
        interval_months: 12,
        severity: 'low',
        estimated_cost_min: 20,
        estimated_cost_max: 60,
        estimated_time_hours: 0.25
      });
    }
    
    // Cabin air filter (every 15,000-30,000 miles)
    if (milesMileage % 20000 < 500) {
      maintenanceItems.push({
        id: `cabin-filter-${Date.now()}`,
        name: 'Cabin Air Filter Replacement',
        description: 'Replace cabin air filter to improve air quality',
        interval_miles: 20000,
        interval_months: 24,
        severity: 'low',
        estimated_cost_min: 25,
        estimated_cost_max: 75,
        estimated_time_hours: 0.5
      });
    }
    
    // Transmission fluid (every 30,000-60,000 miles)
    if (basicInfo.data.engine !== 'ELECTRIC' && milesMileage % 30000 < 500) {
      maintenanceItems.push({
        id: `trans-fluid-${Date.now()}`,
        name: 'Transmission Fluid Service',
        description: 'Replace transmission fluid',
        interval_miles: 30000,
        interval_months: 36,
        severity: 'medium',
        estimated_cost_min: 100,
        estimated_cost_max: 300,
        estimated_time_hours: 1.5
      });
    }
    
    // Spark plugs (every 60,000-100,000 miles)
    if (basicInfo.data.engine !== 'ELECTRIC' && milesMileage % 60000 < 500) {
      maintenanceItems.push({
        id: `spark-plugs-${Date.now()}`,
        name: 'Spark Plug Replacement',
        description: 'Replace spark plugs',
        interval_miles: 60000,
        interval_months: 60,
        severity: 'medium',
        estimated_cost_min: 100,
        estimated_cost_max: 400,
        estimated_time_hours: 2,
        part_numbers: ['NGK12345', 'DENSO9876']
      });
    }
    
    // Timing belt (every 60,000-90,000 miles)
    if (basicInfo.data.engine !== 'ELECTRIC' && milesMileage % 90000 < 1000) {
      maintenanceItems.push({
        id: `timing-belt-${Date.now()}`,
        name: 'Timing Belt Replacement',
        description: 'Replace timing belt and inspect related components',
        interval_miles: 90000,
        interval_months: 84,
        severity: 'high',
        estimated_cost_min: 500,
        estimated_cost_max: 1000,
        estimated_time_hours: 4,
        part_numbers: ['TB1234', 'WP5678']
      });
    }
    
    // Tesla-specific maintenance
    if (basicInfo.data.make === 'TESLA') {
      // Battery coolant (every 50,000 miles)
      if (milesMileage % 50000 < 500) {
        maintenanceItems.push({
          id: `battery-coolant-${Date.now()}`,
          name: 'Battery Coolant Service',
          description: 'Replace battery thermal system coolant',
          interval_miles: 50000,
          interval_months: 48,
          severity: 'medium',
          estimated_cost_min: 200,
          estimated_cost_max: 500,
          estimated_time_hours: 2
        });
      }
      
      // Tesla brake fluid (every 25,000 miles)
      if (milesMileage % 25000 < 500) {
        maintenanceItems.push({
          id: `brake-fluid-${Date.now()}`,
          name: 'Brake Fluid Service',
          description: 'Replace brake fluid to maintain braking performance',
          interval_miles: 25000,
          interval_months: 24,
          severity: 'medium',
          estimated_cost_min: 100,
          estimated_cost_max: 200,
          estimated_time_hours: 1
        });
      }
    }
    
    return {
      success: true,
      data: maintenanceItems,
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get complete maintenance list for vehicle
   */
  async getMaintenanceList(vin: string): Promise<ProviderResponse<MaintenanceItem[]>> {
    const basicInfo = await this.getVehicleByVin(vin);
    
    if (!basicInfo.success) {
      return {
        ...basicInfo,
        data: [] as MaintenanceItem[]
      };
    }
    
    // Standard maintenance items for any vehicle
    const standardItems: MaintenanceItem[] = [
      {
        id: 'oil-change',
        name: 'Oil Change',
        description: 'Replace engine oil and filter',
        interval_miles: 5000,
        interval_months: 6,
        severity: 'medium',
        estimated_cost_min: 50,
        estimated_cost_max: 100,
        estimated_time_hours: 0.75
      },
      {
        id: 'tire-rotation',
        name: 'Tire Rotation',
        description: 'Rotate tires to ensure even wear',
        interval_miles: 7500,
        interval_months: 6,
        severity: 'medium',
        estimated_cost_min: 25,
        estimated_cost_max: 75,
        estimated_time_hours: 0.5
      },
      {
        id: 'brake-fluid',
        name: 'Brake Fluid Service',
        description: 'Replace brake fluid to maintain braking performance',
        interval_miles: 25000,
        interval_months: 24,
        severity: 'medium',
        estimated_cost_min: 100,
        estimated_cost_max: 200,
        estimated_time_hours: 1
      },
      {
        id: 'brake-inspect',
        name: 'Brake Inspection',
        description: 'Inspect brake pads, rotors, and brake fluid level',
        interval_miles: 10000,
        interval_months: 12,
        severity: 'medium',
        estimated_cost_min: 0,
        estimated_cost_max: 50,
        estimated_time_hours: 0.5
      },
      {
        id: 'air-filter',
        name: 'Air Filter Replacement',
        description: 'Replace engine air filter',
        interval_miles: 15000,
        interval_months: 12,
        severity: 'low',
        estimated_cost_min: 20,
        estimated_cost_max: 60,
        estimated_time_hours: 0.25
      },
      {
        id: 'cabin-filter',
        name: 'Cabin Air Filter Replacement',
        description: 'Replace cabin air filter to improve air quality',
        interval_miles: 20000,
        interval_months: 24,
        severity: 'low',
        estimated_cost_min: 25,
        estimated_cost_max: 75,
        estimated_time_hours: 0.5
      }
    ];
    
    // For non-electric vehicles only
    const combustionEngineItems: MaintenanceItem[] = [
      {
        id: 'trans-fluid',
        name: 'Transmission Fluid Service',
        description: 'Replace transmission fluid',
        interval_miles: 30000,
        interval_months: 36,
        severity: 'medium',
        estimated_cost_min: 100,
        estimated_cost_max: 300,
        estimated_time_hours: 1.5
      },
      {
        id: 'spark-plugs',
        name: 'Spark Plug Replacement',
        description: 'Replace spark plugs',
        interval_miles: 60000,
        interval_months: 60,
        severity: 'medium',
        estimated_cost_min: 100,
        estimated_cost_max: 400,
        estimated_time_hours: 2,
        part_numbers: ['NGK12345', 'DENSO9876']
      },
      {
        id: 'timing-belt',
        name: 'Timing Belt Replacement',
        description: 'Replace timing belt and inspect related components',
        interval_miles: 90000,
        interval_months: 84,
        severity: 'high',
        estimated_cost_min: 500,
        estimated_cost_max: 1000,
        estimated_time_hours: 4,
        part_numbers: ['TB1234', 'WP5678']
      },
      {
        id: 'coolant-flush',
        name: 'Coolant System Flush',
        description: 'Drain, flush, and refill engine cooling system',
        interval_miles: 50000,
        interval_months: 60,
        severity: 'medium',
        estimated_cost_min: 100,
        estimated_cost_max: 200,
        estimated_time_hours: 1.5
      },
      {
        id: 'fuel-filter',
        name: 'Fuel Filter Replacement',
        description: 'Replace fuel filter to maintain fuel system performance',
        interval_miles: 30000,
        interval_months: 36,
        severity: 'medium',
        estimated_cost_min: 75,
        estimated_cost_max: 150,
        estimated_time_hours: 1
      },
      {
        id: 'pcv-valve',
        name: 'PCV Valve Replacement',
        description: 'Replace Positive Crankcase Ventilation valve',
        interval_miles: 50000,
        interval_months: 48,
        severity: 'low',
        estimated_cost_min: 50,
        estimated_cost_max: 100,
        estimated_time_hours: 0.5
      }
    ];
    
    // Tesla-specific items
    const teslaItems: MaintenanceItem[] = [
      {
        id: 'battery-coolant',
        name: 'Battery Coolant Service',
        description: 'Replace battery thermal system coolant',
        interval_miles: 50000,
        interval_months: 48,
        severity: 'medium',
        estimated_cost_min: 200,
        estimated_cost_max: 500,
        estimated_time_hours: 2
      },
      {
        id: 'hvac-service',
        name: 'HVAC Service',
        description: 'Clean and service HVAC system',
        interval_miles: 25000,
        interval_months: 24,
        severity: 'low',
        estimated_cost_min: 75,
        estimated_cost_max: 150,
        estimated_time_hours: 1
      },
      {
        id: 'drive-unit-fluid',
        name: 'Drive Unit Fluid Replacement',
        description: 'Replace drive unit fluid',
        interval_miles: 100000,
        interval_months: 60,
        severity: 'medium',
        estimated_cost_min: 175,
        estimated_cost_max: 350,
        estimated_time_hours: 1.5
      }
    ];
    
    // Combine items based on vehicle type
    let maintenanceItems = [...standardItems];
    
    if (basicInfo.data.engine !== 'ELECTRIC') {
      maintenanceItems = [...maintenanceItems, ...combustionEngineItems];
    }
    
    if (basicInfo.data.make === 'TESLA') {
      maintenanceItems = [...maintenanceItems, ...teslaItems];
    }
    
    return {
      success: true,
      data: maintenanceItems,
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get safety recalls for vehicle
   */
  async getSafetyRecalls(vin: string): Promise<ProviderResponse<VehicleRecall[]>> {
    const basicInfo = await this.getVehicleByVin(vin);
    
    if (!basicInfo.success) {
      return {
        ...basicInfo,
        data: [] as VehicleRecall[]
      };
    }
    
    // Generate mock recalls based on vehicle make/model/year
    const mockRecalls: VehicleRecall[] = [];
    
    // Only add recalls for specific makes/years to be realistic
    if (basicInfo.data.make === 'BMW' && basicInfo.data.year <= 2019) {
      mockRecalls.push({
        id: 'bmw-elec-coolant-2019',
        campaign_number: '19V-851',
        date: '2019-11-15',
        description: 'Potential coolant leak in EGR cooler that could lead to fire risk',
        remedy: 'BMW will replace the EGR cooler free of charge',
        notes: 'If you notice white smoke from exhaust, park away from structures and contact dealer',
        safety_risk: 'Fire risk due to coolant leakage into exhaust system',
        affected_components: ['Engine', 'Cooling System', 'Exhaust']
      });
    }
    
    if (basicInfo.data.make === 'FORD' && basicInfo.data.model.includes('F-150') && basicInfo.data.year >= 2015 && basicInfo.data.year <= 2018) {
      mockRecalls.push({
        id: 'ford-f150-seat-belt-2018',
        campaign_number: '18V-568',
        date: '2018-09-05',
        description: 'Front seat belt pretensioners may generate excessive sparks during deployment',
        remedy: 'Ford will install heat resistant tape and remove insulation material',
        notes: 'This recall affects approximately 2 million vehicles',
        safety_risk: 'Potential fire risk if pretensioner deploys in crash',
        affected_components: ['Seat Belts', 'Restraint System']
      });
    }
    
    if (basicInfo.data.make === 'CHEVROLET' && basicInfo.data.year >= 2016 && basicInfo.data.year <= 2018) {
      mockRecalls.push({
        id: 'chevy-brake-vacuum-2019',
        campaign_number: '19V-761',
        date: '2019-10-10',
        description: 'Brake vacuum pump may decrease in performance over time',
        remedy: 'Dealer will reprogram the electronic brake control module',
        notes: 'Customers may experience increased brake pedal effort and increased stopping distance',
        safety_risk: 'Extended stopping distances increase risk of crash',
        affected_components: ['Brakes', 'Hydraulic System']
      });
    }
    
    if (basicInfo.data.make === 'TESLA' && basicInfo.data.year <= 2020) {
      mockRecalls.push({
        id: 'tesla-media-control-2022',
        campaign_number: '22V-052',
        date: '2022-01-25',
        description: 'Media Control Unit may fail due to memory wear, removing rearview camera display',
        remedy: 'Tesla will upgrade the memory storage device in the media control unit',
        notes: 'If the MCU fails, the rearview camera and other features will not be available',
        safety_risk: 'Loss of rearview camera and certain vehicle alerts increases crash risk',
        affected_components: ['Backup Camera', 'Software', 'Forward Collision Warning']
      });
    }
    
    return {
      success: true,
      data: mockRecalls,
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get technical service bulletins for vehicle
   */
  async getTSBs(vin: string): Promise<ProviderResponse<TechnicalServiceBulletin[]>> {
    const basicInfo = await this.getVehicleByVin(vin);
    
    if (!basicInfo.success) {
      return {
        ...basicInfo,
        data: [] as TechnicalServiceBulletin[]
      };
    }
    
    // Generate mock TSBs based on vehicle make/model/year
    const mockTSBs: TechnicalServiceBulletin[] = [];
    
    // Generic TSBs that could apply to any vehicle
    mockTSBs.push({
      id: `tsb-gen-climate-${basicInfo.data.year}`,
      number: 'GEN-2023-001',
      date: '2023-03-15',
      title: 'Climate Control System Calibration',
      description: 'Updated calibration to improve HVAC performance in extreme temperatures',
      affected_components: ['HVAC', 'Climate Control']
    });
    
    // Make-specific TSBs
    if (basicInfo.data.make === 'BMW') {
      mockTSBs.push({
        id: `tsb-bmw-timing-${basicInfo.data.year}`,
        number: 'B-012-23',
        date: '2023-02-10',
        title: 'Timing Chain Tensioner Update',
        description: 'Updated timing chain tensioner to address rattle noise during cold start',
        affected_components: ['Engine', 'Timing Components'],
        pdf_url: 'https://example.com/bmw-tsb-012-23.pdf'
      });
      
      mockTSBs.push({
        id: `tsb-bmw-idrive-${basicInfo.data.year}`,
        number: 'B-065-22',
        date: '2022-08-25',
        title: 'iDrive System Update',
        description: 'Software update to improve system stability and address screen freezing',
        affected_components: ['Infotainment', 'Software'],
        pdf_url: 'https://example.com/bmw-tsb-065-22.pdf'
      });
    }
    
    if (basicInfo.data.make === 'FORD') {
      mockTSBs.push({
        id: `tsb-ford-trans-${basicInfo.data.year}`,
        number: 'F-103-22',
        date: '2022-06-12',
        title: 'Transmission Shift Quality',
        description: 'PCM calibration update to improve shift quality and reduce harsh shifts',
        affected_components: ['Transmission', 'Powertrain Control Module'],
        pdf_url: 'https://example.com/ford-tsb-103-22.pdf'
      });
      
      if (basicInfo.data.model.includes('F-150')) {
        mockTSBs.push({
          id: `tsb-ford-f150-door-${basicInfo.data.year}`,
          number: 'F-222-21',
          date: '2021-11-30',
          title: 'Door Latch Operation in Cold Weather',
          description: 'Updated door latch components to improve operation in freezing conditions',
          affected_components: ['Door Latches', 'Exterior Hardware'],
          pdf_url: 'https://example.com/ford-tsb-222-21.pdf'
        });
      }
    }
    
    if (basicInfo.data.make === 'TESLA') {
      mockTSBs.push({
        id: `tsb-tesla-window-${basicInfo.data.year}`,
        number: 'T-051-23',
        date: '2023-01-22',
        title: 'Window Calibration Procedure',
        description: 'Updated procedure for window calibration to address automatic reversal issues',
        affected_components: ['Windows', 'Software'],
        pdf_url: 'https://example.com/tesla-tsb-051-23.pdf'
      });
      
      mockTSBs.push({
        id: `tsb-tesla-hvac-${basicInfo.data.year}`,
        number: 'T-088-22',
        date: '2022-05-18',
        title: 'HVAC Odor Reduction',
        description: 'Service procedure for cleaning evaporator and updating HVAC software to reduce musty odors',
        affected_components: ['HVAC', 'Climate Control'],
        pdf_url: 'https://example.com/tesla-tsb-088-22.pdf'
      });
    }
    
    return {
      success: true,
      data: mockTSBs,
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get warranty information for vehicle
   */
  async getWarranty(vin: string): Promise<ProviderResponse<any>> {
    const basicInfo = await this.getVehicleByVin(vin);
    
    if (!basicInfo.success) {
      return {
        ...basicInfo,
        data: {}
      };
    }
    
    // Calculate warranty end dates based on vehicle year
    const modelYear = basicInfo.data.year;
    const productionDate = new Date(modelYear - 1, 8, 1); // Assume Sept 1 of previous year
    
    // Basic warranty (typically 3yr/36k miles)
    const basicWarrantyEnd = new Date(productionDate);
    basicWarrantyEnd.setFullYear(basicWarrantyEnd.getFullYear() + 3);
    
    // Powertrain warranty (typically 5yr/60k miles)
    const powertrainWarrantyEnd = new Date(productionDate);
    powertrainWarrantyEnd.setFullYear(powertrainWarrantyEnd.getFullYear() + 5);
    
    // Corrosion warranty (typically 5-12yr)
    const corrosionWarrantyEnd = new Date(productionDate);
    corrosionWarrantyEnd.setFullYear(corrosionWarrantyEnd.getFullYear() + 7);
    
    // Emissions warranty (typically 2-8yr)
    const emissionsWarrantyEnd = new Date(productionDate);
    emissionsWarrantyEnd.setFullYear(emissionsWarrantyEnd.getFullYear() + 8);
    
    // Make-specific warranties
    let makeSpecificWarranty = null;
    
    if (basicInfo.data.make === 'BMW') {
      makeSpecificWarranty = {
        name: 'BMW Maintenance Program',
        description: 'Complimentary scheduled maintenance',
        duration_years: 3,
        duration_miles: 36000,
        end_date: new Date(productionDate.setFullYear(productionDate.getFullYear() + 3)).toISOString().split('T')[0]
      };
    } else if (basicInfo.data.make === 'TESLA') {
      makeSpecificWarranty = {
        name: 'Battery & Drive Unit',
        description: 'Tesla Battery and Drive Unit Warranty',
        duration_years: 8,
        duration_miles: 120000,
        end_date: new Date(productionDate.setFullYear(productionDate.getFullYear() + 8)).toISOString().split('T')[0]
      };
    }
    
    return {
      success: true,
      data: {
        vin: vin,
        production_date: productionDate.toISOString().split('T')[0],
        warranties: [
          {
            name: 'Basic',
            description: 'New Vehicle Limited Warranty',
            duration_years: 3,
            duration_miles: 36000,
            end_date: basicWarrantyEnd.toISOString().split('T')[0]
          },
          {
            name: 'Powertrain',
            description: 'Engine, Transmission and Drivetrain',
            duration_years: 5,
            duration_miles: 60000,
            end_date: powertrainWarrantyEnd.toISOString().split('T')[0]
          },
          {
            name: 'Corrosion',
            description: 'Perforation from corrosion',
            duration_years: 7,
            duration_miles: null,
            end_date: corrosionWarrantyEnd.toISOString().split('T')[0]
          },
          {
            name: 'Emissions',
            description: 'Federal Emissions Defect Warranty',
            duration_years: 8,
            duration_miles: 80000,
            end_date: emissionsWarrantyEnd.toISOString().split('T')[0]
          },
          ...(makeSpecificWarranty ? [makeSpecificWarranty] : [])
        ]
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get diagnostic trouble code definition
   */
  async getCodeDefinition(code: string): Promise<ProviderResponse<any>> {
    // A map of common DTCs and their definitions
    const dtcDefinitions: Record<string, any> = {
      'P0300': {
        code: 'P0300',
        description: 'Random/Multiple Cylinder Misfire Detected',
        severity: 'high',
        possible_causes: [
          'Faulty spark plugs or wires',
          'Faulty ignition coil(s)',
          'Fuel injector issues',
          'Vacuum leaks',
          'Low fuel pressure',
          'EGR valve issues',
          'Camshaft or crankshaft sensor issues'
        ],
        effects: 'Engine hesitation, rough idle, reduced power, increased emissions, potential catalytic converter damage',
        recommended_action: 'Scan vehicle for specific cylinder misfires. Check and replace spark plugs and coils as needed. Inspect fuel system and vacuum lines for leaks.'
      },
      'P0171': {
        code: 'P0171',
        description: 'System Too Lean (Bank 1)',
        severity: 'medium',
        possible_causes: [
          'Vacuum leaks',
          'Dirty or faulty mass airflow sensor',
          'Fuel pressure regulator issues',
          'Clogged fuel injectors',
          'Exhaust leaks before oxygen sensor',
          'EGR valve issues'
        ],
        effects: 'Poor fuel economy, hesitation during acceleration, rough idle',
        recommended_action: 'Check for vacuum leaks. Clean or replace MAF sensor. Check fuel pressure and inspect fuel injectors.'
      },
      'P0420': {
        code: 'P0420',
        description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
        severity: 'medium',
        possible_causes: [
          'Failing catalytic converter',
          'Exhaust leaks',
          'Faulty oxygen sensors',
          'Engine misfires',
          'Rich or lean running conditions'
        ],
        effects: 'No driveability issues typically, but increased emissions and failed emissions tests',
        recommended_action: 'Check for exhaust leaks. Inspect oxygen sensor operation. May require catalytic converter replacement.'
      },
      'P0455': {
        code: 'P0455',
        description: 'Evaporative Emission System Leak Detected (large leak)',
        severity: 'low',
        possible_causes: [
          'Loose or missing fuel cap',
          'Damaged EVAP hoses or connections',
          'Faulty purge or vent solenoid',
          'Faulty fuel tank pressure sensor',
          'Cracked charcoal canister'
        ],
        effects: 'No significant driveability issues, but can cause increased emissions and fuel odor',
        recommended_action: 'Check fuel cap first. Inspect EVAP system components and hoses for leaks or damage.'
      },
      'P0401': {
        code: 'P0401',
        description: 'Exhaust Gas Recirculation Flow Insufficient',
        severity: 'medium',
        possible_causes: [
          'Clogged EGR valve or passages',
          'Faulty EGR valve',
          'EGR solenoid issues',
          'Carbon buildup in EGR system'
        ],
        effects: 'Engine pinging or knocking, increased NOx emissions',
        recommended_action: 'Clean or replace EGR valve. Clear carbon deposits from EGR passages. Check EGR solenoid operation.'
      }
    };
    
    const codeUppercase = code.toUpperCase();
    
    if (dtcDefinitions[codeUppercase]) {
      return {
        success: true,
        data: dtcDefinitions[codeUppercase],
        provider: this.name,
        timestamp: Date.now()
      };
    }
    
    // If not found in our database, generate a generic response based on the code type
    const codeType = codeUppercase.charAt(0);
    const codeSystem = codeUppercase.charAt(1);
    
    let genericDescription = '';
    let genericSeverity = 'medium';
    let genericCauses = ['Electrical circuit issues', 'Sensor malfunction', 'Wiring problems'];
    
    // Generate description based on code type (P, B, C, U)
    switch (codeType) {
      case 'P': // Powertrain
        genericDescription = 'Powertrain Control Module Issue';
        if (codeSystem === '0') genericDescription = 'Generic Powertrain Issue - Engine/Transmission/Emissions';
        if (codeSystem === '1') genericDescription = 'Manufacturer-Specific Powertrain Issue';
        break;
      case 'B': // Body
        genericDescription = 'Body Control Module Issue';
        if (codeSystem === '0') genericDescription = 'Generic Body System Issue';
        if (codeSystem === '1') genericDescription = 'Manufacturer-Specific Body System Issue';
        genericCauses = ['Body control module fault', 'Door/window/accessory malfunction', 'Interior electronic issues'];
        break;
      case 'C': // Chassis
        genericDescription = 'Chassis Control Module Issue';
        if (codeSystem === '0') genericDescription = 'Generic Chassis Issue - ABS/Suspension/Steering';
        if (codeSystem === '1') genericDescription = 'Manufacturer-Specific Chassis Issue';
        genericCauses = ['ABS system fault', 'Stability control issue', 'Electronic suspension problem'];
        break;
      case 'U': // Network
        genericDescription = 'Network Communication Issue';
        if (codeSystem === '0') genericDescription = 'Generic Network Communication Issue';
        if (codeSystem === '1') genericDescription = 'Manufacturer-Specific Network Issue';
        genericCauses = ['CAN bus communication fault', 'Module communication error', 'Network gateway issue'];
        break;
      default:
        genericDescription = 'Unknown Code Type';
    }
    
    return {
      success: true,
      data: {
        code: codeUppercase,
        description: `${genericDescription} - ${codeUppercase}`,
        severity: genericSeverity,
        possible_causes: genericCauses,
        effects: 'May cause check engine light and affect vehicle performance',
        recommended_action: 'Perform full diagnostic scan to identify specific issue. Consult manufacturer service information for this code.'
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get repair information
   */
  async getRepairInfo(
    vin: string, 
    code: string, 
    mileage?: number, 
    unit: 'km' | 'mi' = 'mi'
  ): Promise<ProviderResponse<any>> {
    const basicInfo = await this.getVehicleByVin(vin);
    const codeInfo = await this.getCodeDefinition(code);
    
    if (!basicInfo.success || !codeInfo.success) {
      return {
        success: false,
        error: "Couldn't get vehicle or code information",
        provider: this.name,
        timestamp: Date.now(),
        data: {}
      };
    }
    
    // Mock repair data based on the code and vehicle
    const repairInfo = {
      code: code.toUpperCase(),
      vehicle: {
        year: basicInfo.data.year,
        make: basicInfo.data.make,
        model: basicInfo.data.model
      },
      description: codeInfo.data.description,
      repair_procedures: [
        {
          id: `rp-${code}-diag`,
          name: 'Diagnostic Inspection',
          description: 'Perform full diagnostic scan and inspect related components',
          estimated_time_hours: 1,
          estimated_cost_min: 90,
          estimated_cost_max: 150,
          tools_required: ['OBD-II Scanner', 'Basic Hand Tools']
        }
      ],
      parts: []
    };
    
    // Add specific repair procedures based on code
    switch (code.toUpperCase()) {
      case 'P0300':
        repairInfo.repair_procedures.push(
          {
            id: 'rp-p0300-plugs',
            name: 'Spark Plug Replacement',
            description: 'Replace all spark plugs with manufacturer recommended type',
            estimated_time_hours: 1.5,
            estimated_cost_min: 200,
            estimated_cost_max: 300,
            tools_required: ['Spark Plug Socket', 'Torque Wrench', 'Anti-seize Compound']
          },
          {
            id: 'rp-p0300-coils',
            name: 'Ignition Coil Replacement',
            description: 'Replace faulty ignition coils',
            estimated_time_hours: 1,
            estimated_cost_min: 250,
            estimated_cost_max: 450,
            tools_required: ['Basic Hand Tools']
          }
        );
        repairInfo.parts = [
          {
            id: 'part-spark-plugs',
            name: 'Spark Plugs',
            description: `OEM Spark Plugs for ${basicInfo.data.year} ${basicInfo.data.make} ${basicInfo.data.model}`,
            estimated_cost: 15,
            quantity: Number(basicInfo.data.engine_cylinder_cnt) || 4,
            part_numbers: ['SP100', 'NGK6354']
          },
          {
            id: 'part-ignition-coils',
            name: 'Ignition Coils',
            description: `OEM Ignition Coils for ${basicInfo.data.year} ${basicInfo.data.make} ${basicInfo.data.model}`,
            estimated_cost: 75,
            quantity: Number(basicInfo.data.engine_cylinder_cnt) || 4,
            part_numbers: ['IC200', 'DELPHI12345']
          }
        ];
        break;
      case 'P0171':
        repairInfo.repair_procedures.push(
          {
            id: 'rp-p0171-maf',
            name: 'MAF Sensor Service',
            description: 'Clean or replace mass airflow sensor',
            estimated_time_hours: 0.5,
            estimated_cost_min: 150,
            estimated_cost_max: 300,
            tools_required: ['MAF Sensor Cleaner', 'Basic Hand Tools']
          },
          {
            id: 'rp-p0171-vac',
            name: 'Vacuum Leak Inspection',
            description: 'Inspect for vacuum leaks using smoke machine',
            estimated_time_hours: 1.5,
            estimated_cost_min: 100,
            estimated_cost_max: 200,
            tools_required: ['Smoke Machine', 'Leak Detection Dye']
          }
        );
        repairInfo.parts = [
          {
            id: 'part-maf-sensor',
            name: 'Mass Airflow Sensor',
            description: `OEM MAF Sensor for ${basicInfo.data.year} ${basicInfo.data.make} ${basicInfo.data.model}`,
            estimated_cost: 150,
            quantity: 1,
            part_numbers: ['MAF123', 'BOSCH0891']
          },
          {
            id: 'part-gaskets',
            name: 'Intake Gaskets',
            description: 'Intake manifold and throttle body gaskets',
            estimated_cost: 25,
            quantity: 1,
            part_numbers: ['IG456', 'FELPRO789']
          }
        ];
        break;
      case 'P0420':
        repairInfo.repair_procedures.push(
          {
            id: 'rp-p0420-cat',
            name: 'Catalytic Converter Replacement',
            description: 'Replace failed catalytic converter',
            estimated_time_hours: 2,
            estimated_cost_min: 600,
            estimated_cost_max: 1200,
            tools_required: ['Exhaust Pipe Cutter', 'Oxygen Sensor Socket', 'Welding Equipment']
          },
          {
            id: 'rp-p0420-o2',
            name: 'Oxygen Sensor Replacement',
            description: 'Replace oxygen sensors before and after catalytic converter',
            estimated_time_hours: 1,
            estimated_cost_min: 200,
            estimated_cost_max: 350,
            tools_required: ['Oxygen Sensor Socket', 'Anti-seize Compound']
          }
        );
        repairInfo.parts = [
          {
            id: 'part-catalytic',
            name: 'Catalytic Converter',
            description: `Catalytic Converter for ${basicInfo.data.year} ${basicInfo.data.make} ${basicInfo.data.model}`,
            estimated_cost: 450,
            quantity: 1,
            part_numbers: ['CAT789', 'WALKER5432']
          },
          {
            id: 'part-o2-sensors',
            name: 'Oxygen Sensors',
            description: 'Upstream and Downstream O2 Sensors',
            estimated_cost: 95,
            quantity: 2,
            part_numbers: ['O2S123', 'DENSO6543']
          }
        ];
        break;
      default:
        // Generic parts and procedures for other codes
        repairInfo.repair_procedures.push({
          id: `rp-${code}-general`,
          name: 'General Repair',
          description: 'Inspect and repair affected components based on diagnostic results',
          estimated_time_hours: 2,
          estimated_cost_min: 200,
          estimated_cost_max: 500,
          tools_required: ['Diagnostic Scanner', 'Basic Hand Tools', 'Multimeter']
        });
        repairInfo.parts = [
          {
            id: 'part-generic',
            name: 'Replacement Parts',
            description: 'Various parts depending on diagnostic results',
            estimated_cost: 200,
            quantity: 1,
            part_numbers: ['GENERIC123']
          }
        ];
    }
    
    return {
      success: true,
      data: repairInfo,
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Check what data is available for a vehicle
   */
  async checkAvailableData(
    vin: string, 
    mileage?: number, 
    code?: string, 
    unit: 'km' | 'mi' = 'mi'
  ): Promise<ProviderResponse<Record<string, boolean>>> {
    // Mock provider always has all data available
    return {
      success: true,
      data: {
        decode: true,
        decode_more: true,
        port: true,
        maint: !!mileage, // Only available if mileage provided
        maintlist: true,
        repair: !!(mileage && code), // Only available if mileage and code provided
        diag: !!(mileage && code), // Only available if mileage and code provided
        upcoming: !!mileage, // Only available if mileage provided
        tsb: true,
        recall: true,
        warranty: true,
        vehicle_history_report: true
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
}

/**
 * Factory function to create a Mock Automotive provider
 */
export function createMockAutomotiveProvider(): MockAutomotiveProvider {
  return new MockAutomotiveProvider();
}

/**
 * Factory function to create a NHTSA provider
 */
export function createNHTSAProvider(): NHTSAVehicleProvider {
  return new NHTSAVehicleProvider();
}

/**
 * Factory function to create all automotive providers
 */
export function createAutomotiveProviders(): BaseProvider[] {
  return [
    createMockAutomotiveProvider(), // Higher priority for development
    createCarScanProvider(),
    createNHTSAProvider()
  ];
}