import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - using real credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the Vehicle and other related interfaces
interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  license_plate: string;
  color: string;
  image_url?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  status: 'Active' | 'Stored' | 'Sold' | 'Project';
  notes?: string;
  created_at: string;
  updated_at: string;
  drivetrain?: string;
  type?: string;
  engine_type?: string;
  transmission?: string;
  mileage?: number;
  tire_specs?: string;
  gallery?: string[];
  docs?: string[];
  delivery_photo_url?: string;
  delivery_date?: string;
  sold_photo_url?: string;
  sold_date?: string;
  voice_notes?: {
    id: string;
    url: string;
    date: string;
    title?: string;
  }[];
  videos?: {
    id: string;
    url: string;
    date: string;
    title?: string;
    thumbnail_url?: string;
  }[];
  monthly_photos?: {
    date: string;
    url: string;
    notes?: string;
  }[];
  detailed_specs?: {
    exterior_color_code?: string;
    interior_color_code?: string;
    factory_options?: string[];
    production_date?: string;
    special_edition?: string;
    engine_number?: string;
    original_msrp?: number;
  };
  purchase_documents?: any[];
  service_history?: {
    date: string;
    mileage: number;
    description: string;
    performed_by?: string;
    documents?: any[];
    photos?: string[];
    voice_notes?: string[];
    videos?: string[];
  }[];
}

// Context type definition
interface VehicleContextType {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  setActiveVehicle: (vehicle: Vehicle | null) => void;
  loading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
  addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => Promise<Vehicle | null>;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => Promise<Vehicle | null>;
  deleteVehicle: (id: string) => Promise<boolean>;
}

// Create the context
export const VehicleContext = createContext<VehicleContextType | null>(null);

// Create the provider component
export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicles on component mount
  useEffect(() => {
    refreshVehicles();
  }, []);

  // Function to refresh vehicles
  const refreshVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real vehicle data from Supabase
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Update state with fetched vehicles
      setVehicles(data || []);
      
      // If no active vehicle is set but vehicles exist, set the first one as active
      if (!activeVehicle && data && data.length > 0) {
        setActiveVehicle(data[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles. Please try again later.');
      setLoading(false);
    }
  };

  // Function to add a new vehicle
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle | null> => {
    try {
      // Save to Supabase database
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select();
        
      if (error) throw error;
      
      // Update local state with the new vehicle
      if (data && data.length > 0) {
        setVehicles(prev => [data[0], ...prev]);
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Error adding vehicle:', err);
      setError('Failed to add vehicle. Please try again.');
      return null;
    }
  };

  // Function to update an existing vehicle
  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle | null> => {
    try {
      // Update in Supabase database
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      // Update local state
      if (data && data.length > 0) {
        setVehicles(prev => 
          prev.map(vehicle => vehicle.id === id ? data[0] : vehicle)
        );
        
        // Update active vehicle if it's the one being updated
        if (activeVehicle && activeVehicle.id === id) {
          setActiveVehicle(data[0]);
        }
        
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError('Failed to update vehicle. Please try again.');
      return null;
    }
  };

  // Function to delete a vehicle
  const deleteVehicle = async (id: string): Promise<boolean> => {
    try {
      // Delete from Supabase database
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      
      // If the active vehicle is the one being deleted, set another one as active or null
      if (activeVehicle && activeVehicle.id === id) {
        const remainingVehicles = vehicles.filter(v => v.id !== id);
        setActiveVehicle(remainingVehicles.length > 0 ? remainingVehicles[0] : null);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError('Failed to delete vehicle. Please try again.');
      return false;
    }
  };

  // Provide the context value
  const contextValue: VehicleContextType = {
    vehicles,
    activeVehicle,
    setActiveVehicle,
    loading,
    error,
    refreshVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  };

  return (
    <VehicleContext.Provider value={contextValue}>
      {children}
    </VehicleContext.Provider>
  );
};

// Custom hook to use the vehicle context
export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};