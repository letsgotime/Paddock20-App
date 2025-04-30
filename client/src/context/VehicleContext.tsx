import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supabase from '../services/supabaseClient';

// Define Vehicle interface
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  license_plate: string;
  color: string;
  image_url: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  status: string;
  drivetrain: string;
  engine_type: string;
  transmission: string;
  fuel_type: string;
  mileage: number;
  notes: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  maintenance_count?: number;
  modifications_count?: number;
  documents_count?: number;
  last_service_date?: string;
  next_service_date?: string;
  next_service_miles?: number;
  insurance_renewal_date?: string;
  inspection_due_date?: string;
  last_detailed_date?: string;
}

// Create context interface
interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  isLoading: boolean;
  error: string | null;
  fetchVehicles: () => Promise<void>;
  getVehicle: (id: string) => Promise<Vehicle | null>;
  addVehicle: (vehicle: Partial<Vehicle>) => Promise<Vehicle | null>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<Vehicle | null>;
  deleteVehicle: (id: string) => Promise<boolean>;
}

// Create context with default values
const VehicleContext = createContext<VehicleContextType>({
  vehicles: [],
  selectedVehicle: null,
  setSelectedVehicle: () => {},
  isLoading: false,
  error: null,
  fetchVehicles: async () => {},
  getVehicle: async () => null,
  addVehicle: async () => null,
  updateVehicle: async () => null,
  deleteVehicle: async () => false,
});

// Context provider component
export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all vehicles
  const fetchVehicles = async () => {
    if (!supabase) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setVehicles(data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to fetch vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single vehicle by ID
  const getVehicle = async (id: string): Promise<Vehicle | null> => {
    if (!supabase) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (err) {
      console.error(`Error fetching vehicle ${id}:`, err);
      setError(`Failed to fetch vehicle ${id}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new vehicle
  const addVehicle = async (vehicle: Partial<Vehicle>): Promise<Vehicle | null> => {
    if (!supabase) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add timestamps and user_id
      const newVehicle = {
        ...vehicle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'current-user-id', // Replace with actual user ID from auth
      };
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert([newVehicle])
        .select();
      
      if (error) {
        throw error;
      }
      
      // Update vehicles state
      if (data && data.length > 0) {
        setVehicles(prevVehicles => [data[0], ...prevVehicles]);
        return data[0];
      }
      return null;
    } catch (err) {
      console.error('Error adding vehicle:', err);
      setError('Failed to add vehicle');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing vehicle
  const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> => {
    if (!supabase) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add updated timestamp
      const updatedVehicle = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('vehicles')
        .update(updatedVehicle)
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Update vehicles state
      if (data && data.length > 0) {
        setVehicles(prevVehicles => 
          prevVehicles.map(v => (v.id === id ? data[0] : v))
        );
        
        // Update selected vehicle if it's being edited
        if (selectedVehicle && selectedVehicle.id === id) {
          setSelectedVehicle(data[0]);
        }
        
        return data[0];
      }
      return null;
    } catch (err) {
      console.error(`Error updating vehicle ${id}:`, err);
      setError(`Failed to update vehicle ${id}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a vehicle
  const deleteVehicle = async (id: string): Promise<boolean> => {
    if (!supabase) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update vehicles state
      setVehicles(prevVehicles => 
        prevVehicles.filter(vehicle => vehicle.id !== id)
      );
      
      // Clear selected vehicle if it's being deleted
      if (selectedVehicle && selectedVehicle.id === id) {
        setSelectedVehicle(null);
      }
      
      return true;
    } catch (err) {
      console.error(`Error deleting vehicle ${id}:`, err);
      setError(`Failed to delete vehicle ${id}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load vehicles on initial render
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Context value
  const value: VehicleContextType = {
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
    isLoading,
    error,
    fetchVehicles,
    getVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

// Custom hook for using the context
export const useVehicles = () => useContext(VehicleContext);

export default VehicleContext;