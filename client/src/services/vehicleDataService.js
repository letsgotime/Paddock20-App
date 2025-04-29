import supabase from './supabaseClient';

/**
 * Service for interacting with the vehicle data in the database
 */
 
/**
 * Get all vehicles for the current user
 * @returns {Promise<Array>} - Array of vehicles
 */
export const getVehicles = async () => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
};

/**
 * Get a specific vehicle by ID
 * @param {string} id - Vehicle ID
 * @returns {Promise<Object|null>} - Vehicle object or null
 */
export const getVehicleById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching vehicle ${id}:`, error);
    return null;
  }
};

/**
 * Add a new vehicle
 * @param {Object} vehicle - Vehicle data
 * @returns {Promise<Object|null>} - Created vehicle or null
 */
export const addVehicle = async (vehicle) => {
  try {
    // Generate a creation timestamp if not provided
    if (!vehicle.created_at) {
      vehicle.created_at = new Date().toISOString();
    }
    if (!vehicle.updated_at) {
      vehicle.updated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicle])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return null;
  }
};

/**
 * Update a vehicle
 * @param {string} id - Vehicle ID
 * @param {Object} updates - Vehicle data to update
 * @returns {Promise<Object|null>} - Updated vehicle or null
 */
export const updateVehicle = async (id, updates) => {
  try {
    // Add updated timestamp
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating vehicle ${id}:`, error);
    return null;
  }
};

/**
 * Delete a vehicle
 * @param {string} id - Vehicle ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteVehicle = async (id) => {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting vehicle ${id}:`, error);
    return false;
  }
};

/**
 * Get all modifications for a vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Array>} - Array of modifications
 */
export const getModifications = async (vehicleId) => {
  try {
    const { data, error } = await supabase
      .from('modifications')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('installation_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching modifications for vehicle ${vehicleId}:`, error);
    return [];
  }
};

/**
 * Add a new modification
 * @param {Object} modification - Modification data
 * @returns {Promise<Object|null>} - Created modification or null
 */
export const addModification = async (modification) => {
  try {
    // Generate timestamps if not provided
    if (!modification.created_at) {
      modification.created_at = new Date().toISOString();
    }
    if (!modification.updated_at) {
      modification.updated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('modifications')
      .insert([modification])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding modification:', error);
    return null;
  }
};

/**
 * Get all maintenance records for a vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Array>} - Array of maintenance records
 */
export const getMaintenanceRecords = async (vehicleId) => {
  try {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching maintenance records for vehicle ${vehicleId}:`, error);
    return [];
  }
};

/**
 * Add a new maintenance record
 * @param {Object} maintenance - Maintenance record data
 * @returns {Promise<Object|null>} - Created maintenance record or null
 */
export const addMaintenanceRecord = async (maintenance) => {
  try {
    // Generate timestamps if not provided
    if (!maintenance.created_at) {
      maintenance.created_at = new Date().toISOString();
    }
    if (!maintenance.updated_at) {
      maintenance.updated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('maintenance')
      .insert([maintenance])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    return null;
  }
};

/**
 * Get vehicle metrics
 * In a real app, this would connect to OBD2 or API
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Object|null>} - Vehicle metrics or null
 */
export const getVehicleMetrics = async (vehicleId) => {
  try {
    // For demo purposes, returning empty data to encourage real user input
    return {
      mileage: 0,
      fuelLevel: 0,
      oilLevel: 0,
      oilTemp: 0,
      coolantTemp: 0,
      batteryHealth: 0,
      tirePressure: {
        frontLeft: 0,
        frontRight: 0,
        rearLeft: 0,
        rearRight: 0
      },
      carStatus: 'Ready',
      lastService: '',
      nextService: '',
      nextOilChange: '',
      glossIndex: 0,
      glossHistory: [],
      recentDrives: []
    };
  } catch (error) {
    console.error(`Error fetching metrics for vehicle ${vehicleId}:`, error);
    return null;
  }
};

// Export individual functions and a default object with all functions
const vehicleDataService = {
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getModifications,
  addModification,
  getMaintenanceRecords,
  addMaintenanceRecord,
  getVehicleMetrics
};

export default vehicleDataService;