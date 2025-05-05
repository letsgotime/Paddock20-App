/**
 * VehicleDataWarehouse.ts
 * 
 * A centralized data warehouse for storing and retrieving complete vehicle information
 * with a focus on VIN-decoded data. This service ensures all 17+ data points from
 * VIN decoding are available throughout the application.
 * 
 * Design Principles:
 * 1. Single Source of Truth - All vehicle data is stored here
 * 2. Complete Data - All 17+ points from VIN decoder are preserved
 * 3. Easy Access - Simple API for retrieving vehicle data
 * 4. Data Integrity - Only authenticated sources can modify data
 * 5. Persistence - All data is saved to localStorage with backup
 */

import { DecodedVehicleInfo } from './vinDecoderService';
import { STORAGE_KEYS } from '../utils/constants';
import { safeSetItem } from '../utils/storageManager';

// Comprehensive vehicle data type including all possible VIN-decoded fields
export interface CompleteVehicleData {
  // Core identification fields
  id: string;
  vin?: string;
  entry_method: 'vin' | 'obd' | 'manual';
  status: 'active' | 'archived' | 'sold';

  // Basic vehicle details (always present)
  make: string;
  model: string;
  year: number;
  nickname?: string;
  mileage: number;

  // Engine and transmission details (from VIN)
  engineType?: string;
  transmissionType?: string;
  fuelType?: string;
  displacement?: string;
  cylinders?: string;
  driveLine?: string;

  // Vehicle classification (from VIN)
  vehicleType?: string;
  bodyStyle?: string;
  trim?: string;

  // Manufacturing details (from VIN)
  manufacturer?: string;
  plantCountry?: string;
  plantState?: string;
  plantCity?: string;

  // User-added details
  color?: string;
  purchaseDate?: string;
  purchaseLocation?: string;
  purchasePrice?: number;
  saleData?: {
    dateSold?: string;
    price?: number;
    soldTo?: string;
  };
  
  // Media and UI
  primaryImage?: string;
  vehicleImage?: string;
  gallery?: string[];
  
  // Fields for compatibility with older components
  vehicle_image?: string;
  car_name?: string;
  engine_type?: string;
  transmission?: string;

  // Metadata
  _source?: string;
  _lastUpdated: string;
  _created: string;
  _reconciled: boolean;
}

// Use constants from utils/constants.ts
// (STORAGE_KEYS is already imported at the top of the file)

/**
 * Adds or updates a vehicle in the warehouse
 * @param vehicleData Complete vehicle data object
 * @returns The saved vehicle data with any auto-generated fields
 */
export function storeVehicle(vehicleData: Partial<CompleteVehicleData>): CompleteVehicleData {
  try {
    // Get existing warehouse data
    const existingData = localStorage.getItem(STORAGE_KEYS.VEHICLE_WAREHOUSE) || '[]';
    const vehicles: CompleteVehicleData[] = JSON.parse(existingData);
    
    // Generate ID if not provided
    const vehicleId = vehicleData.id || `vehicle_${Date.now()}`;
    
    // Create complete vehicle object with defaults for required fields
    const timestamp = new Date().toISOString();
    const completeVehicle: CompleteVehicleData = {
      // Populate required fields with defaults if not provided
      id: vehicleId,
      make: vehicleData.make || '',
      model: vehicleData.model || '',
      year: typeof vehicleData.year === 'number' ? vehicleData.year : 
            (vehicleData.year ? parseInt(vehicleData.year.toString()) : new Date().getFullYear()),
      mileage: typeof vehicleData.mileage === 'number' ? vehicleData.mileage : 
              (vehicleData.mileage ? parseInt(vehicleData.mileage.toString()) : 0),
      entry_method: vehicleData.entry_method || 'manual',
      status: vehicleData.status || 'active',
      
      // Required metadata fields
      _lastUpdated: timestamp,
      _created: vehicleData._created || timestamp,
      _reconciled: false,
      
      // Copy all provided fields, but not _lastUpdated since we already set it
      ...Object.entries(vehicleData).reduce((acc, [key, value]) => {
        if (key !== '_lastUpdated') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>)
    };
    
    // Check if vehicle already exists in warehouse
    const existingIndex = vehicles.findIndex(v => v.id === vehicleId);
    
    if (existingIndex >= 0) {
      // Update existing vehicle, preserving created date
      completeVehicle._created = vehicles[existingIndex]._created;
      vehicles[existingIndex] = {
        ...vehicles[existingIndex],
        ...completeVehicle,
        _lastUpdated: timestamp
      };
    } else {
      // Add new vehicle
      vehicles.push(completeVehicle);
    }
    
    // Save to warehouse
    localStorage.setItem(STORAGE_KEYS.VEHICLE_WAREHOUSE, JSON.stringify(vehicles));
    
    // Create backup after every change
    localStorage.setItem(STORAGE_KEYS.VEHICLE_BACKUP, JSON.stringify(vehicles));
    
    console.log(`Vehicle warehouse updated: ${completeVehicle.make} ${completeVehicle.model} ${completeVehicle.year}`);
    
    return completeVehicle;
  } catch (error) {
    console.error('Error saving to vehicle warehouse:', error);
    throw new Error('Failed to save vehicle data');
  }
}

/**
 * Stores the raw VIN decode information for future reference
 * This preserves all 17+ fields from the VIN decoder
 * @param vin The Vehicle Identification Number
 * @param decodedInfo The decoded vehicle information
 */
export function storeVinDecodeData(vin: string, decodedInfo: DecodedVehicleInfo): void {
  try {
    // Get existing VIN history
    const existingData = localStorage.getItem(STORAGE_KEYS.VIN_DECODE_HISTORY) || '[]';
    const history = JSON.parse(existingData);
    
    // Add new decode entry
    history.push({
      vin,
      timestamp: new Date().toISOString(),
      decodedInfo,
      status: decodedInfo.error ? 'error' : 'success'
    });
    
    // Save to history
    localStorage.setItem(STORAGE_KEYS.VIN_DECODE_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving VIN decode history:', error);
    // Non-critical error, continue operation
  }
}

/**
 * Gets a vehicle by ID
 * @param id The vehicle ID
 * @returns The complete vehicle data or null if not found
 */
export function getVehicleById(id: string): CompleteVehicleData | null {
  try {
    // Get warehouse data
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLE_WAREHOUSE) || '[]';
    const vehicles: CompleteVehicleData[] = JSON.parse(data);
    
    // Find vehicle by ID
    const vehicle = vehicles.find(v => v.id === id);
    
    return vehicle || null;
  } catch (error) {
    console.error('Error retrieving vehicle from warehouse:', error);
    return null;
  }
}

/**
 * Gets a vehicle by VIN
 * @param vin The Vehicle Identification Number
 * @returns The complete vehicle data or null if not found
 */
export function getVehicleByVin(vin: string): CompleteVehicleData | null {
  try {
    // Get warehouse data
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLE_WAREHOUSE) || '[]';
    const vehicles: CompleteVehicleData[] = JSON.parse(data);
    
    // Find vehicle by VIN
    const vehicle = vehicles.find(v => v.vin === vin);
    
    return vehicle || null;
  } catch (error) {
    console.error('Error retrieving vehicle from warehouse:', error);
    return null;
  }
}

/**
 * Gets all vehicles from the warehouse
 * @param includeArchived Whether to include archived/sold vehicles
 * @returns Array of complete vehicle data
 */
export function getAllVehicles(includeArchived = false): CompleteVehicleData[] {
  try {
    // Get warehouse data
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLE_WAREHOUSE) || '[]';
    const vehicles: CompleteVehicleData[] = JSON.parse(data);
    
    // Filter active vehicles if requested
    return includeArchived ? vehicles : vehicles.filter(v => v.status === 'active');
  } catch (error) {
    console.error('Error retrieving vehicles from warehouse:', error);
    return [];
  }
}

/**
 * Gets the VIN decode history
 * @param limit Maximum number of entries to return
 * @returns Array of VIN decode history entries
 */
export function getVinDecodeHistory(limit = 50): any[] {
  try {
    // Get VIN history
    const data = localStorage.getItem(STORAGE_KEYS.VIN_DECODE_HISTORY) || '[]';
    const history = JSON.parse(data);
    
    // Return latest entries first
    return history.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, limit);
  } catch (error) {
    console.error('Error retrieving VIN decode history:', error);
    return [];
  }
}

/**
 * Reconciles vehicle data from all sources into the warehouse
 * This ensures all vehicles from different sources are properly centralized
 * @returns Array of reconciled vehicles
 */
export async function reconcileAllVehicles(): Promise<CompleteVehicleData[]> {
  try {
    // Import DataSourceConnector to get vehicles from all sources
    const { default: DataSourceConnector } = await import('./DataSourceConnector');
    
    // Get all vehicles from the warehouse
    const warehouseVehicles = getAllVehicles(true);
    
    // Get vehicles from other sources
    const contextVehicles = DataSourceConnector.getVehicleData(false);
    const profileVehicles = DataSourceConnector.getUserOnboardingData()?.vehicles || [];
    
    // Create a map of all vehicles by ID and VIN for quick lookup
    const vehicleMap = new Map<string, CompleteVehicleData>();
    
    // First add warehouse vehicles to the map
    warehouseVehicles.forEach(v => {
      vehicleMap.set(v.id, v);
      if (v.vin) vehicleMap.set(`vin_${v.vin}`, v);
    });
    
    // Function to merge vehicles from different sources
    const mergeVehicle = (sourceVehicle: any) => {
      if (!sourceVehicle) return;
      
      // Generate consistent ID if missing
      const vehicleId = sourceVehicle.id || `vehicle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Check if we already have this vehicle by ID or VIN
      let existingVehicle = vehicleMap.get(vehicleId);
      
      if (!existingVehicle && sourceVehicle.vin) {
        existingVehicle = vehicleMap.get(`vin_${sourceVehicle.vin}`);
      }
      
      // Parse numeric fields
      const year = typeof sourceVehicle.year === 'number' ? sourceVehicle.year : 
                   (sourceVehicle.year ? parseInt(sourceVehicle.year.toString()) : new Date().getFullYear());
      
      const mileage = typeof sourceVehicle.mileage === 'number' ? sourceVehicle.mileage : 
                     (sourceVehicle.mileage ? parseInt(sourceVehicle.mileage.toString()) : 0);
      
      if (existingVehicle) {
        // Update existing vehicle
        const updated: CompleteVehicleData = {
          ...existingVehicle,
          // Only update fields if they exist in the source
          make: sourceVehicle.make || existingVehicle.make,
          model: sourceVehicle.model || existingVehicle.model,
          year: year,
          mileage: mileage,
          nickname: sourceVehicle.nickname || sourceVehicle.car_name || existingVehicle.nickname,
          color: sourceVehicle.color || existingVehicle.color,
          engineType: sourceVehicle.engineType || sourceVehicle.engine_type || existingVehicle.engineType,
          transmissionType: sourceVehicle.transmissionType || sourceVehicle.transmission || existingVehicle.transmissionType,
          primaryImage: sourceVehicle.primaryImage || sourceVehicle.vehicleImage || sourceVehicle.vehicle_image || existingVehicle.primaryImage,
          vin: sourceVehicle.vin || existingVehicle.vin,
          _lastUpdated: new Date().toISOString(),
          _reconciled: true
        };
        
        // Store the updated vehicle
        vehicleMap.set(updated.id, updated);
        if (updated.vin) vehicleMap.set(`vin_${updated.vin}`, updated);
      } else {
        // Create a new vehicle
        const newVehicle: CompleteVehicleData = {
          id: vehicleId,
          make: sourceVehicle.make || '',
          model: sourceVehicle.model || '',
          year: year,
          mileage: mileage,
          nickname: sourceVehicle.nickname || sourceVehicle.car_name || '',
          color: sourceVehicle.color || '',
          engineType: sourceVehicle.engineType || sourceVehicle.engine_type || '',
          transmissionType: sourceVehicle.transmissionType || sourceVehicle.transmission || '',
          primaryImage: sourceVehicle.primaryImage || sourceVehicle.vehicleImage || sourceVehicle.vehicle_image || '',
          vin: sourceVehicle.vin || '',
          entry_method: sourceVehicle.entry_method || 'manual',
          status: 'active',
          _lastUpdated: new Date().toISOString(),
          _created: new Date().toISOString(),
          _reconciled: true
        };
        
        // Store the new vehicle
        vehicleMap.set(newVehicle.id, newVehicle);
        if (newVehicle.vin) vehicleMap.set(`vin_${newVehicle.vin}`, newVehicle);
      }
    };
    
    // Merge vehicles from all sources
    // Start with context vehicles (highest priority as they're from the VehicleContext)
    if (Array.isArray(contextVehicles)) {
      contextVehicles.forEach(mergeVehicle);
    } else if (contextVehicles && typeof contextVehicles === 'object') {
      mergeVehicle(contextVehicles);
    }
    
    // Then profile vehicles
    if (Array.isArray(profileVehicles)) {
      profileVehicles.forEach(mergeVehicle);
    }
    
    // Get all unique vehicles from the map (ignoring VIN entries)
    const reconciledVehicles = Array.from(vehicleMap.values())
      .filter(v => !v.id.startsWith('vin_'));
    
    // Save all reconciled vehicles to the warehouse
    localStorage.setItem(STORAGE_KEYS.VEHICLE_WAREHOUSE, JSON.stringify(reconciledVehicles));
    
    // Create backup
    localStorage.setItem(STORAGE_KEYS.VEHICLE_BACKUP, JSON.stringify(reconciledVehicles));
    
    console.log(`Vehicle warehouse reconciled: ${reconciledVehicles.length} vehicles consolidated`);
    
    return reconciledVehicles;
  } catch (error) {
    console.error('Error reconciling vehicles:', error);
    return getAllVehicles(true);
  }
}

/**
 * Updates the DataSourceConnector and other systems with the warehouse data
 * This pushes the single source of truth to all other systems
 */
export async function syncWarehouseToAllSystems(): Promise<void> {
  try {
    // Get all vehicles from the warehouse
    const warehouseVehicles = getAllVehicles();
    
    // Import necessary services
    const { default: DataSourceConnector } = await import('./DataSourceConnector');
    const { ProfileDataCollector } = await import('./ProfileDataCollector');
    
    // Update DataSourceConnector
    if (DataSourceConnector.updateAllVehicleStores) {
      await DataSourceConnector.updateAllVehicleStores(warehouseVehicles);
    } else {
      console.warn('DataSourceConnector.updateAllVehicleStores not available');
    }
    
    // Update each vehicle in ProfileDataCollector for backward compatibility
    warehouseVehicles.forEach(vehicle => {
      // Map warehouse vehicle to ProfileDataCollector format
      const profileVehicleData = {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        nickname: vehicle.nickname,
        image: vehicle.primaryImage || vehicle.vehicleImage,
        lastServiced: new Date().toISOString().split('T')[0],
        engineType: vehicle.engineType,
        transmissionType: vehicle.transmissionType,
        purchaseDate: vehicle.purchaseDate,
        mileage: vehicle.mileage,
        status: vehicle.status
      };
      
      // Update the profile system
      ProfileDataCollector.collectVehicleData(profileVehicleData);
    });
    
    console.log(`Vehicle warehouse synced to all systems: ${warehouseVehicles.length} vehicles`);
  } catch (error) {
    console.error('Error syncing warehouse to all systems:', error);
  }
}

/**
 * Repairs any corrupt warehouse data and rebuilds the warehouse if needed
 */
export async function repairWarehouse(): Promise<void> {
  try {
    // Check if warehouse exists
    const warehouseData = localStorage.getItem(STORAGE_KEYS.VEHICLE_WAREHOUSE);
    
    // If warehouse is missing or corrupt, try to restore from backup
    if (!warehouseData || warehouseData === '[]' || warehouseData === 'null') {
      const backupData = localStorage.getItem(STORAGE_KEYS.VEHICLE_BACKUP);
      
      if (backupData && backupData !== '[]' && backupData !== 'null') {
        // Restore from backup
        localStorage.setItem(STORAGE_KEYS.VEHICLE_WAREHOUSE, backupData);
        console.log('Vehicle warehouse restored from backup');
      } else {
        // No backup - rebuild from reconciliation
        await reconcileAllVehicles();
        console.log('Vehicle warehouse rebuilt from reconciliation');
      }
    }
  } catch (error) {
    console.error('Error repairing warehouse:', error);
  }
}

export default {
  storeVehicle,
  storeVinDecodeData,
  getVehicleById,
  getVehicleByVin,
  getAllVehicles,
  getVinDecodeHistory,
  reconcileAllVehicles,
  syncWarehouseToAllSystems,
  repairWarehouse,
  STORAGE_KEYS
};