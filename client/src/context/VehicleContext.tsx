import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Import our mock Supabase client instead of directly creating one
import supabase from '../services/supabaseClient';

// Types
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  color?: string;
  vin?: string;
  license_plate?: string;
  mileage?: number;
  purchase_date?: string;
  purchase_price?: number;
  status: 'Active' | 'Stored' | 'Sold' | 'Maintenance';
  image_url?: string;
  engine_type?: string;
  transmission?: string;
  drivetrain?: string;
  fuel_type?: string;
  tire_specs?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
}

interface VehicleContextType {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  setActiveVehicle: (vehicle: Vehicle | null) => void;
  loading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'user_id'>) => Promise<Vehicle>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
}

// Create the context
const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

// Provider component
export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user ID from auth
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }
        
        if (!authData.user) {
          // If not authenticated, use demo data or return empty array
          setVehicles([]);
          setLoading(false);
          return;
        }
        
        // Fetch vehicles for the user
        const { data, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false });
        
        if (vehiclesError) {
          throw vehiclesError;
        }
        
        setVehicles(data || []);
        
        // Set the first vehicle as active if available
        if (data && data.length > 0) {
          setActiveVehicle(data[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles');
        setLoading(false);
        
        // For demo purposes: Use mock data if there's an error
        // In a production app, we would handle this differently
        useDemoVehicles();
      }
    };
    
    fetchVehicles();
  }, []);
  
  // Refresh vehicles data
  const refreshVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user ID from auth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        setVehicles([]);
        setLoading(false);
        return;
      }
      
      // Fetch vehicles for the user
      const { data, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false });
      
      if (vehiclesError) {
        throw vehiclesError;
      }
      
      setVehicles(data || []);
      
      // Update active vehicle if needed
      if (activeVehicle) {
        const updated = data?.find(v => v.id === activeVehicle.id);
        if (updated) {
          setActiveVehicle(updated);
        } else if (data && data.length > 0) {
          // If active vehicle not found, set first vehicle as active
          setActiveVehicle(data[0]);
        } else {
          setActiveVehicle(null);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing vehicles:', err);
      setError('Failed to refresh vehicles');
      setLoading(false);
    }
  };
  
  // Add a new vehicle
  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'user_id'>): Promise<Vehicle> => {
    try {
      // Get user ID from auth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('User not authenticated');
      }
      
      // Insert the new vehicle
      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert([{ ...vehicle, user_id: authData.user.id }])
        .select();
      
      if (insertError) {
        throw insertError;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Failed to add vehicle');
      }
      
      const newVehicle = data[0] as Vehicle;
      
      // Update vehicles list
      setVehicles(prev => [newVehicle, ...prev]);
      
      // Set as active vehicle
      setActiveVehicle(newVehicle);
      
      return newVehicle;
    } catch (err) {
      console.error('Error adding vehicle:', err);
      throw err;
    }
  };
  
  // Update an existing vehicle
  const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      // Update the vehicle
      const { data, error: updateError } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (updateError) {
        throw updateError;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Failed to update vehicle');
      }
      
      const updatedVehicle = data[0] as Vehicle;
      
      // Update vehicles list
      setVehicles(prev => prev.map(v => (v.id === id ? updatedVehicle : v)));
      
      // Update active vehicle if needed
      if (activeVehicle && activeVehicle.id === id) {
        setActiveVehicle(updatedVehicle);
      }
      
      return updatedVehicle;
    } catch (err) {
      console.error('Error updating vehicle:', err);
      throw err;
    }
  };
  
  // Delete a vehicle
  const deleteVehicle = async (id: string): Promise<void> => {
    try {
      // Delete the vehicle
      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Update vehicles list
      setVehicles(prev => prev.filter(v => v.id !== id));
      
      // Update active vehicle if needed
      if (activeVehicle && activeVehicle.id === id) {
        // Set a new active vehicle if available
        const nextVehicle = vehicles.find(v => v.id !== id);
        setActiveVehicle(nextVehicle || null);
      }
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      throw err;
    }
  };
  
  // Use demo vehicles if there's an error or for development purposes
  const useDemoVehicles = () => {
    const demoVehicles: Vehicle[] = [
      {
        id: '1',
        make: 'Porsche',
        model: '911',
        year: 2020,
        trim: 'Carrera S',
        color: 'Guards Red',
        vin: 'WP0AB2A92LS227599',
        license_plate: 'P911',
        mileage: 12500,
        purchase_date: '2020-06-15',
        purchase_price: 120000,
        status: 'Active',
        image_url: 'https://images.unsplash.com/photo-1611821064430-0d40291138a5?q=80&w=1000&auto=format&fit=crop',
        engine_type: '3.0L Twin-Turbo Flat-6',
        transmission: '8-Speed PDK',
        drivetrain: 'RWD',
        fuel_type: 'Premium Unleaded',
        tire_specs: '245/35ZR20 front, 305/30ZR20 rear',
        notes: 'Regular maintenance at dealer, clear ceramic coating applied',
        created_at: '2023-01-15T08:00:00Z',
        updated_at: '2023-06-20T14:30:00Z',
        user_id: 'demo-user'
      },
      {
        id: '2',
        make: 'Tesla',
        model: 'Model S',
        year: 2022,
        trim: 'Plaid',
        color: 'Midnight Silver Metallic',
        vin: '5YJSA1E40NF000123',
        license_plate: 'PLAID',
        mileage: 8700,
        purchase_date: '2022-03-10',
        purchase_price: 135000,
        status: 'Active',
        image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop',
        engine_type: 'Tri-Motor Electric',
        transmission: 'Single-Speed',
        drivetrain: 'AWD',
        fuel_type: 'Electric',
        tire_specs: '265/35R21',
        notes: 'FSD package, ceramic tint on all windows',
        created_at: '2023-03-15T10:20:00Z',
        updated_at: '2023-07-12T16:45:00Z',
        user_id: 'demo-user'
      },
      {
        id: '3',
        make: 'Lexus',
        model: 'LC 500',
        year: 2021,
        trim: 'Coupe',
        color: 'Nori Green Pearl',
        vin: 'JTHHP5BC0M5013628',
        license_plate: 'LC500',
        mileage: 15800,
        purchase_date: '2021-08-22',
        purchase_price: 93000,
        status: 'Stored',
        image_url: 'https://images.unsplash.com/photo-1625988361332-8cb424cfef26?q=80&w=1000&auto=format&fit=crop',
        engine_type: '5.0L V8',
        transmission: '10-Speed Automatic',
        drivetrain: 'RWD',
        fuel_type: 'Premium Unleaded',
        tire_specs: '245/40RF21 front, 275/35RF21 rear',
        notes: 'Mark Levinson audio system, limited slip differential',
        created_at: '2023-02-12T14:15:00Z',
        updated_at: '2023-05-22T09:10:00Z',
        user_id: 'demo-user'
      }
    ];
    
    setVehicles(demoVehicles);
    setActiveVehicle(demoVehicles[0]);
    console.log('Using demo vehicles for development');
  };
  
  // Context value
  const value: VehicleContextType = {
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
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

// Custom hook for accessing the context
export const useVehicles = () => {
  const context = useContext(VehicleContext);
  
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  
  return context;
};

export default VehicleContext;