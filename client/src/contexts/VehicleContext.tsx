import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the vehicle type
export interface Vehicle {
  id: string;
  car_id: string;
  make: string;
  model: string;
  year: string;
  nickname?: string;
  car_name: string;
  vehicle_image?: string;
  mileage: number;
  status?: string;
  last_service?: string;
  created_at: string;
  engine_type?: string;
  transmission?: string;
  color?: string;
  purchase_date?: string;
  vehicle_type?: string;
  trim?: string;
  [key: string]: any; // Allow for additional properties
}

// Define the vehicle profile from onboarding
export interface VehicleProfile {
  make: string;
  model: string;
  year: string;
  nickname?: string;
  mileage: string;
  engineType?: string;
  transmissionType?: string;
  color?: string;
  purchaseDate?: string;
  vehicleImage?: string;
  vin?: string;
}

interface VehicleContextType {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  setActiveVehicle: (vehicle: Vehicle | null) => void;
  addVehicle: (vehicleProfile: VehicleProfile) => void;
  updateVehicle: (id: string, updatedData: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  refreshVehicles: () => void;
  loading: boolean;
}

const VehicleContext = createContext<VehicleContextType | null>(null);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Subscribe to events from other components
  useEffect(() => {
    // Set up event listener for vehicle updates from other components
    const handleExternalVehicleUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.source === 'ProfileDataCollector') {
        console.log("VehicleContext received update from ProfileDataCollector:", event.detail);
        refreshVehicles();
      }
    };
    
    // Add global event listener for vehicle updates
    window.addEventListener('vehicle-updated' as any, handleExternalVehicleUpdate);
    
    return () => {
      window.removeEventListener('vehicle-updated' as any, handleExternalVehicleUpdate);
    };
  }, []);

  // Load vehicles from localStorage on initial mount
  useEffect(() => {
    refreshVehicles();
  }, []);

  // Function to refresh vehicles from localStorage
  const refreshVehicles = () => {
    setLoading(true);
    try {
      // Check for onboarded vehicle from localStorage
      const savedVehicleProfileString = localStorage.getItem('vehicleProfile');
      let vehicleList: Vehicle[] = [];
      
      if (savedVehicleProfileString) {
        try {
          const savedVehicleProfile = JSON.parse(savedVehicleProfileString);
          if (savedVehicleProfile) {
            // Create a formatted vehicle object from the saved profile
            const onboardedVehicle: Vehicle = {
              id: 'onboarded-1', // Special ID for onboarded vehicle
              car_id: 'OB-1',
              make: savedVehicleProfile.make || '',
              model: savedVehicleProfile.model || '',
              year: savedVehicleProfile.year || new Date().getFullYear().toString(),
              nickname: savedVehicleProfile.nickname || '',
              car_name: savedVehicleProfile.nickname || `${savedVehicleProfile.year} ${savedVehicleProfile.make} ${savedVehicleProfile.model}`,
              vehicle_image: savedVehicleProfile.vehicleImage || '/favicon.png',
              mileage: parseInt(savedVehicleProfile.mileage) || 0,
              status: 'Ready',
              last_service: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString(),
              engine_type: savedVehicleProfile.engineType || 'Gasoline',
              transmission: savedVehicleProfile.transmissionType || 'Automatic',
              color: savedVehicleProfile.color || 'Black',
              purchase_date: savedVehicleProfile.purchaseDate || new Date().toISOString().split('T')[0],
              vehicle_type: 'Car'
            };
            vehicleList.push(onboardedVehicle);
            console.log("VehicleContext loaded onboarded vehicle:", onboardedVehicle);
            
            // Broadcast this vehicle data to all dashboard components
            window.dispatchEvent(new CustomEvent('vehicle-data-available', { 
              detail: {
                vehicle: onboardedVehicle,
                source: 'VehicleContext'
              }
            }));
          }
        } catch (error) {
          console.error('Error parsing saved vehicle profile:', error);
        }
      }
      
      // Check if we have any other saved vehicles
      const savedVehiclesString = localStorage.getItem('vehicles');
      if (savedVehiclesString) {
        try {
          const savedVehicles = JSON.parse(savedVehiclesString);
          if (Array.isArray(savedVehicles) && savedVehicles.length > 0) {
            // Exclude any vehicle that has the same ID as our onboarded vehicle
            const otherVehicles = savedVehicles.filter(v => v.id !== 'onboarded-1');
            vehicleList = [...vehicleList, ...otherVehicles];
          }
        } catch (error) {
          console.error('Error parsing saved vehicles:', error);
        }
      }
      
      setVehicles(vehicleList);
      
      // Set active vehicle if we have at least one
      if (vehicleList.length > 0 && !activeVehicle) {
        setActiveVehicle(vehicleList[0]);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new vehicle
  const addVehicle = (vehicleProfile: VehicleProfile) => {
    try {
      const newVehicle: Vehicle = {
        id: `vehicle-${Date.now()}`,
        car_id: `V${vehicles.length + 1}`,
        make: vehicleProfile.make,
        model: vehicleProfile.model,
        year: vehicleProfile.year,
        nickname: vehicleProfile.nickname || '',
        car_name: vehicleProfile.nickname || `${vehicleProfile.year} ${vehicleProfile.make} ${vehicleProfile.model}`,
        vehicle_image: vehicleProfile.vehicleImage || '/favicon.png',
        mileage: parseInt(vehicleProfile.mileage) || 0,
        status: 'Ready',
        last_service: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        engine_type: vehicleProfile.engineType || 'Gasoline',
        transmission: vehicleProfile.transmissionType || 'Automatic',
        color: vehicleProfile.color || 'Black',
        purchase_date: vehicleProfile.purchaseDate || new Date().toISOString().split('T')[0],
        vehicle_type: 'Car'
      };
      
      const updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
      setActiveVehicle(newVehicle);
      
      // Save to localStorage
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      
      return newVehicle;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };

  // Function to update a vehicle
  const updateVehicle = (id: string, updatedData: Partial<Vehicle>) => {
    try {
      const updatedVehicles = vehicles.map(vehicle => {
        if (vehicle.id === id) {
          const updatedVehicle = { ...vehicle, ...updatedData };
          
          // If this is the active vehicle, update it as well
          if (activeVehicle && activeVehicle.id === id) {
            setActiveVehicle(updatedVehicle);
          }
          
          return updatedVehicle;
        }
        return vehicle;
      });
      
      setVehicles(updatedVehicles);
      
      // Save to localStorage
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      
      // If this is the onboarded vehicle, update the vehicleProfile as well
      if (id === 'onboarded-1') {
        const vehicleProfile = localStorage.getItem('vehicleProfile');
        if (vehicleProfile) {
          try {
            const profile = JSON.parse(vehicleProfile);
            const updatedProfile = {
              ...profile,
              make: updatedData.make || profile.make,
              model: updatedData.model || profile.model,
              year: updatedData.year || profile.year,
              nickname: updatedData.nickname || profile.nickname,
              mileage: updatedData.mileage !== undefined ? updatedData.mileage.toString() : profile.mileage,
              engineType: updatedData.engine_type || profile.engineType,
              transmissionType: updatedData.transmission || profile.transmissionType,
              color: updatedData.color || profile.color,
              purchaseDate: updatedData.purchase_date || profile.purchaseDate,
              vehicleImage: updatedData.vehicle_image || profile.vehicleImage
            };
            localStorage.setItem('vehicleProfile', JSON.stringify(updatedProfile));
          } catch (error) {
            console.error('Error updating vehicleProfile:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };

  // Function to delete a vehicle
  const deleteVehicle = (id: string) => {
    try {
      // Remove the vehicle from the list
      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
      setVehicles(updatedVehicles);
      
      // If the active vehicle is the one being deleted, set a new active vehicle
      if (activeVehicle && activeVehicle.id === id) {
        setActiveVehicle(updatedVehicles.length > 0 ? updatedVehicles[0] : null);
      }
      
      // Save to localStorage
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      
      // If this is the onboarded vehicle, remove the vehicleProfile as well
      if (id === 'onboarded-1') {
        localStorage.removeItem('vehicleProfile');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        activeVehicle,
        setActiveVehicle,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        refreshVehicles,
        loading
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
}