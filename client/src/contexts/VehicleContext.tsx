import React, { createContext, useState, useEffect, ReactNode } from 'react';
// Define Vehicle interface here to avoid circular dependency
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  color: string;
  vin?: string;
  licensePlate?: string;
  nickname?: string;
  description?: string;
  modifications?: string;
  primaryImage?: string;
  images?: string[];
  maintenanceItems?: MaintenanceItem[];
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
        
        // For now, we'll use localStorage as a data store
        // In a production app, this would fetch from an API
        const savedVehicles = localStorage.getItem('paddock20_vehicles');
        
        if (savedVehicles) {
          const parsedVehicles = JSON.parse(savedVehicles) as Vehicle[];
          setVehicles(parsedVehicles);
        } else if (user) {
          // Initialize with an example vehicle if none exist yet
          const defaultVehicle: Vehicle = {
            id: `vehicle-${Date.now()}`,
            make: 'BMW',
            model: '330i',
            year: '2020',
            color: 'Alpine White',
            vin: '',
            licensePlate: '',
            nickname: '330i xDrive',
            description: 'Daily driver',
            modifications: '',
            primaryImage: '',
            images: [],
            maintenanceItems: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setVehicles([defaultVehicle]);
          
          // Save to localStorage
          localStorage.setItem('paddock20_vehicles', JSON.stringify([defaultVehicle]));
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
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