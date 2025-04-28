import supabase from './supabaseClient';
import { create } from 'zustand';

// Define vehicle data types
export interface Vehicle {
  id: number;
  userId: number;
  make: string;
  model: string;
  year: number;
  trim?: string;
  color?: string;
  vinLast6?: string;
  nickname?: string;
  imageUrl?: string;
  mileage?: number;
  notes?: string;
  // Add any additional fields used in the app
}

export interface VehicleMod {
  id: number;
  vehicleId: number;
  name: string;
  type: string;
  installDate?: string;
  installedBy?: string;
  cost?: number;
  description?: string;
  images?: string[];
  status: 'planned' | 'in_progress' | 'completed';
}

export interface VehicleTire {
  id: number;
  vehicleId: number;
  brand?: string;
  model?: string;
  type?: string;
  frontSize?: string;
  rearSize?: string;
  speedRating?: string;
  loadRating?: string;
  dateInstalled?: string;
  mileage?: number;
  notes?: string;
  images?: string[];
  currentTreadDepthFL?: number;
  currentTreadDepthFR?: number;
  currentTreadDepthRL?: number;
  currentTreadDepthRR?: number;
  pressureFL?: number;
  pressureFR?: number;
  pressureRL?: number;
  pressureRR?: number;
}

export interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  serviceType: string;
  serviceDate: string;
  mileage?: number;
  serviceProvider?: string;
  cost?: number;
  description?: string;
  receipts?: string[];
  notes?: string;
}

export interface GlossTracking {
  id: number;
  vehicleId: number;
  lastDetailDate?: string;
  nextDetailDate?: string;
  detailFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  currentProtection?: string;
  notes?: string;
}

// Define the store interface
interface VehicleStore {
  vehicles: Vehicle[];
  mods: VehicleMod[];
  tires: VehicleTire[];
  maintenanceRecords: MaintenanceRecord[];
  glossTracking: GlossTracking[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadVehicles: () => Promise<void>;
  loadVehicleDetails: (vehicleId: number) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle | null>;
  updateVehicle: (id: number, vehicle: Partial<Vehicle>) => Promise<Vehicle | null>;
  deleteVehicle: (id: number) => Promise<boolean>;
  
  // Mods management
  addMod: (mod: Omit<VehicleMod, 'id'>) => Promise<VehicleMod | null>;
  updateMod: (id: number, mod: Partial<VehicleMod>) => Promise<VehicleMod | null>;
  deleteMod: (id: number) => Promise<boolean>;
  
  // Tire management
  getTiresByVehicleId: (vehicleId: number) => VehicleTire[];
  addTire: (tire: Omit<VehicleTire, 'id'>) => Promise<VehicleTire | null>;
  updateTire: (id: number, tire: Partial<VehicleTire>) => Promise<VehicleTire | null>;
  deleteTire: (id: number) => Promise<boolean>;
  
  // Maintenance management
  getMaintenanceRecordsByVehicleId: (vehicleId: number) => MaintenanceRecord[];
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => Promise<MaintenanceRecord | null>;
  updateMaintenanceRecord: (id: number, record: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord | null>;
  deleteMaintenanceRecord: (id: number) => Promise<boolean>;
  
  // Gloss tracking
  getGlossTrackingByVehicleId: (vehicleId: number) => GlossTracking | null;
  updateGlossTracking: (id: number, tracking: Partial<GlossTracking>) => Promise<GlossTracking | null>;
}

// Create the store
const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],
  mods: [],
  tires: [],
  maintenanceRecords: [],
  glossTracking: [],
  isLoading: false,
  error: null,
  
  // Load all vehicles for the current user
  loadVehicles: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('make', { ascending: true });
      
      if (error) throw new Error(error.message);
      set({ vehicles: data || [], isLoading: false });
    } catch (error) {
      console.error('Error loading vehicles:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Load all details for a specific vehicle
  loadVehicleDetails: async (vehicleId: number) => {
    set({ isLoading: true, error: null });
    try {
      // Load mods
      const { data: modsData, error: modsError } = await supabase
        .from('vehicle_mods')
        .select('*')
        .eq('vehicleId', vehicleId);
      
      if (modsError) throw new Error(modsError.message);
      
      // Load tires
      const { data: tiresData, error: tiresError } = await supabase
        .from('vehicle_tires')
        .select('*')
        .eq('vehicleId', vehicleId);
      
      if (tiresError) throw new Error(tiresError.message);
      
      // Load maintenance records
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('vehicleId', vehicleId)
        .order('serviceDate', { ascending: false });
      
      if (maintenanceError) throw new Error(maintenanceError.message);
      
      // Load gloss tracking
      const { data: glossData, error: glossError } = await supabase
        .from('gloss_tracking')
        .select('*')
        .eq('vehicleId', vehicleId);
      
      if (glossError) throw new Error(glossError.message);
      
      set({ 
        mods: modsData || [], 
        tires: tiresData || [], 
        maintenanceRecords: maintenanceData || [],
        glossTracking: glossData || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading vehicle details:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Add a new vehicle
  addVehicle: async (vehicle) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicle])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      set(state => ({ 
        vehicles: [...state.vehicles, data],
        isLoading: false 
      }));
      
      return data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Update an existing vehicle
  updateVehicle: async (id, vehicle) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      set(state => ({
        vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...data } : v),
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Delete a vehicle
  deleteVehicle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      set(state => ({
        vehicles: state.vehicles.filter(v => v.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  // Add a new modification
  addMod: async (mod) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vehicle_mods')
        .insert([mod])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      set(state => ({ 
        mods: [...state.mods, data],
        isLoading: false 
      }));
      
      return data;
    } catch (error) {
      console.error('Error adding modification:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Update an existing modification
  updateMod: async (id, mod) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vehicle_mods')
        .update(mod)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      set(state => ({
        mods: state.mods.map(m => m.id === id ? { ...m, ...data } : m),
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating modification:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Delete a modification
  deleteMod: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('vehicle_mods')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      set(state => ({
        mods: state.mods.filter(m => m.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting modification:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  // Get tires by vehicle ID
  getTiresByVehicleId: (vehicleId) => {
    return get().tires.filter(tire => tire.vehicleId === vehicleId);
  },
  
  // Add a new tire
  addTire: async (tire) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vehicle_tires')
        .insert([tire])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      set(state => ({ 
        tires: [...state.tires, data],
        isLoading: false 
      }));
      
      return data;
    } catch (error) {
      console.error('Error adding tire:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Update an existing tire
  updateTire: async (id, tire) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vehicle_tires')
        .update(tire)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      set(state => ({
        tires: state.tires.map(t => t.id === id ? { ...t, ...data } : t),
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating tire:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Delete a tire
  deleteTire: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('vehicle_tires')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      set(state => ({
        tires: state.tires.filter(t => t.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting tire:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  // Get maintenance records by vehicle ID
  getMaintenanceRecordsByVehicleId: (vehicleId) => {
    return get().maintenanceRecords.filter(record => record.vehicleId === vehicleId);
  },
  
  // Add a new maintenance record
  addMaintenanceRecord: async (record) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .insert([record])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      set(state => ({ 
        maintenanceRecords: [...state.maintenanceRecords, data],
        isLoading: false 
      }));
      
      return data;
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Update an existing maintenance record
  updateMaintenanceRecord: async (id, record) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .update(record)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      set(state => ({
        maintenanceRecords: state.maintenanceRecords.map(r => r.id === id ? { ...r, ...data } : r),
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Delete a maintenance record
  deleteMaintenanceRecord: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      set(state => ({
        maintenanceRecords: state.maintenanceRecords.filter(r => r.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  // Get gloss tracking by vehicle ID
  getGlossTrackingByVehicleId: (vehicleId) => {
    const tracking = get().glossTracking.find(gt => gt.vehicleId === vehicleId);
    return tracking || null;
  },
  
  // Update gloss tracking
  updateGlossTracking: async (id, tracking) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('gloss_tracking')
        .update(tracking)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      set(state => ({
        glossTracking: state.glossTracking.map(gt => gt.id === id ? { ...gt, ...data } : gt),
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating gloss tracking:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
}));

export default useVehicleStore;