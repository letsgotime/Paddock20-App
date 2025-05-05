import React, { createContext, useState, useEffect, ReactNode } from 'react';
// Define Vehicle interface here to avoid circular dependency
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number; // Changed from string to number for consistency
  color: string;
  vin?: string;
  licensePlate?: string;
  nickname?: string;
  description?: string;
  modifications?: string;
  primaryImage?: string;
  images?: string[];
  maintenanceItems?: MaintenanceItem[];
  mileage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceItem {
  id: string;
  name: string;
  description?: string;
  date: string;
  mileage?: number;
  completed: boolean;
  vehicleId: string;
}
import { useAuth } from '@/hooks/useAuth';

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  loading: boolean;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  addVehicle: (vehicle: Vehicle) => Promise<Vehicle>;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
  getVehicles: () => Vehicle[];
  getVehicleById: (id: string) => Vehicle | null;
}

export const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

// Create a hook for direct use in components
export function useVehicle() {
  // Using the imported React.useContext to avoid dependency issues
  const context = React.useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
}

interface VehicleProviderProps {
  children: ReactNode;
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Initialize vehicles from storage on component mount
  useEffect(() => {
    const loadVehicles = () => {
      try {
        setLoading(true);
        
        // First try loading from the profile system's vehicle storage
        const profileStore = localStorage.getItem('user-profile-storage');
        if (profileStore) {
          try {
            const profileData = JSON.parse(profileStore);
            if (profileData?.state?.profile?.vehicles?.length > 0) {
              console.log('Loading vehicles from user profile storage');
              
              // Convert from user profile VehicleData format to Vehicle format
              const profileVehicles = profileData.state.profile.vehicles.map((v: any) => ({
                id: v.id,
                make: v.make,
                model: v.model,
                year: typeof v.year === 'string' ? parseInt(v.year) : v.year,
                color: v.color || '',
                vin: v.vin || '',
                licensePlate: '',
                nickname: v.nickname || '',
                description: '',
                modifications: '',
                primaryImage: v.image || '',
                images: [],
                mileage: typeof v.mileage === 'string' ? parseInt(v.mileage) : v.mileage,
                maintenanceItems: v.maintenanceRecords?.map((mr: any) => ({
                  id: mr.id,
                  name: mr.type,
                  description: mr.notes || '',
                  date: mr.date,
                  mileage: mr.mileage,
                  completed: true,
                  vehicleId: v.id
                })) || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }));
              
              setVehicles(profileVehicles);
              if (profileVehicles.length > 0) {
                setSelectedVehicle(profileVehicles[0]);
              }
              return;
            }
          } catch (e) {
            console.error('Error parsing profile store data:', e);
          }
        }
        
        // If that fails, fall back to direct localStorage
        const savedVehicles = localStorage.getItem('paddock20_vehicles');
        
        if (savedVehicles) {
          const parsedVehicles = JSON.parse(savedVehicles) as Vehicle[];
          setVehicles(parsedVehicles);
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
    
    // Listen for vehicle updates from the ProfileDataCollector
    const handleVehicleUpdate = (event: CustomEvent) => {
      const vehicleData = event.detail?.vehicle;
      if (vehicleData && event.detail?.source === 'ProfileDataCollector') {
        console.log('Received vehicle update from ProfileDataCollector:', vehicleData);
        
        // Convert to Vehicle format
        const newVehicle: Vehicle = {
          id: vehicleData.id,
          make: vehicleData.make,
          model: vehicleData.model,
          year: typeof vehicleData.year === 'string' ? parseInt(vehicleData.year) : vehicleData.year,
          color: vehicleData.color || '',
          vin: vehicleData.vin || '',
          licensePlate: '',
          nickname: vehicleData.nickname || '',
          description: '',
          modifications: '',
          primaryImage: vehicleData.image || '',
          images: [],
          mileage: typeof vehicleData.mileage === 'string' ? parseInt(vehicleData.mileage) : vehicleData.mileage,
          maintenanceItems: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Update our vehicle state
        setVehicles(prev => {
          // Check if this vehicle already exists
          const exists = prev.some(v => v.id === newVehicle.id);
          if (exists) {
            return prev.map(v => v.id === newVehicle.id ? newVehicle : v);
          } else {
            return [...prev, newVehicle];
          }
        });
      }
    };
    
    window.addEventListener('vehicle-data-update', handleVehicleUpdate as EventListener);
    window.addEventListener('vehicle-updated', handleVehicleUpdate as EventListener);
    
    return () => {
      window.removeEventListener('vehicle-data-update', handleVehicleUpdate as EventListener);
      window.removeEventListener('vehicle-updated', handleVehicleUpdate as EventListener);
    };
  }, [user?.id]);

  // Save vehicles to storage whenever they change
  useEffect(() => {
    if (vehicles.length > 0) {
      localStorage.setItem('paddock20_vehicles', JSON.stringify(vehicles));
    }
  }, [vehicles]);

  const addVehicle = async (vehicle: Vehicle): Promise<Vehicle> => {
    return new Promise((resolve, reject) => {
      try {
        // Simulate API call delay
        setTimeout(() => {
          setVehicles(prev => [...prev, vehicle]);
          resolve(vehicle);
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    return new Promise((resolve, reject) => {
      try {
        // Simulate API call delay
        setTimeout(() => {
          setVehicles(prev => {
            const updatedVehicles = prev.map(v => {
              if (v.id === id) {
                const updatedVehicle = { ...v, ...vehicleData, updatedAt: new Date().toISOString() };
                resolve(updatedVehicle);
                return updatedVehicle;
              }
              return v;
            });
            return updatedVehicles;
          });
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  };

  const deleteVehicle = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Simulate API call delay
        setTimeout(() => {
          setVehicles(prev => prev.filter(v => v.id !== id));
          
          // If the deleted vehicle was selected, clear the selection
          if (selectedVehicle && selectedVehicle.id === id) {
            setSelectedVehicle(null);
          }
          
          resolve();
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  };

  const getVehicles = (): Vehicle[] => {
    return vehicles;
  };

  const getVehicleById = (id: string): Vehicle | null => {
    return vehicles.find(v => v.id === id) || null;
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        selectedVehicle,
        loading,
        setSelectedVehicle,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicles,
        getVehicleById,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};