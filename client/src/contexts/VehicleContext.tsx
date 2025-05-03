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
            let otherVehicles = savedVehicles.filter(v => v.id !== 'onboarded-1');
            
            // Fix problematic vehicle IDs that cause 404 errors (like "Vehicle 1746298350426 6wg9vtg")
            otherVehicles = otherVehicles.map(vehicle => {
              // Check if the vehicle ID has a problematic format (containing spaces or starts with "Vehicle")
              if (vehicle.id.includes(' ') || vehicle.id.startsWith('Vehicle')) {
                // Create a new ID based on make and model
                const make = vehicle.make || '';
                const model = vehicle.model || '';
                const newId = `${make.toLowerCase()}-${model.toLowerCase()}-${Date.now()}`.replace(/\s+/g, '-');
                
                console.log(`Fixed problematic vehicle ID: ${vehicle.id} → ${newId}`);
                return {...vehicle, id: newId};
              }
              return vehicle;
            });
            
            vehicleList = [...vehicleList, ...otherVehicles];
            
            // Save the updated vehicles back to localStorage
            localStorage.setItem('vehicles', JSON.stringify(vehicleList));
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
      // Create a user-friendly ID that includes vehicle make and model
      const vehicleMake = vehicleProfile.make || '';
      const vehicleModel = vehicleProfile.model || '';
      const formattedVehicleId = `${vehicleMake.toLowerCase()}-${vehicleModel.toLowerCase()}-${Date.now()}`.replace(/\s+/g, '-');
      
      const newVehicle: Vehicle = {
        id: formattedVehicleId,
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
      
      // Broadcast this vehicle data to all components
      console.log('Broadcasting new vehicle to all components:', newVehicle.make, newVehicle.model);
      
      // General broadcast
      window.dispatchEvent(new CustomEvent('vehicle-data-update', { 
        detail: {
          vehicle: newVehicle,
          action: 'add',
          source: 'VehicleContext'
        }
      }));
      
      // Component-specific broadcasts for two-way integration
      window.dispatchEvent(new CustomEvent('juice-box-vehicle-update', { 
        detail: {
          vehicle: newVehicle,
          action: 'add',
          source: 'VehicleContext'
        }
      }));
      
      window.dispatchEvent(new CustomEvent('garage-vault-vehicle-update', { 
        detail: {
          vehicle: newVehicle,
          action: 'add',
          source: 'VehicleContext'
        }
      }));
      
      window.dispatchEvent(new CustomEvent('gallery-vehicle-update', { 
        detail: {
          vehicle: newVehicle,
          action: 'add',
          source: 'VehicleContext'
        }
      }));
      
      // Sync with the ProfileDataCollector for comprehensive integration
      try {
        // Use import to access ProfileDataCollector directly
        import('../services/ProfileDataCollector').then(module => {
          const ProfileDataCollector = module.default;
          ProfileDataCollector.syncVehicleFromContext(newVehicle);
        }).catch(err => {
          console.error('Error importing ProfileDataCollector:', err);
        });
      } catch (error) {
        console.error('Error syncing with ProfileDataCollector:', error);
      }
      
      return newVehicle;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };

  // Function to update a vehicle
  const updateVehicle = (id: string, updatedData: Partial<Vehicle>) => {
    try {
      let updatedVehicle: Vehicle | null = null;
      
      const updatedVehicles = vehicles.map(vehicle => {
        if (vehicle.id === id) {
          updatedVehicle = { ...vehicle, ...updatedData };
          
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
      
      // Broadcast the update to all components if we have an updated vehicle
      if (updatedVehicle) {
        console.log('Broadcasting vehicle update to all components:', updatedVehicle.make, updatedVehicle.model);
        
        // General broadcast
        window.dispatchEvent(new CustomEvent('vehicle-data-update', { 
          detail: {
            vehicle: updatedVehicle,
            action: 'update',
            source: 'VehicleContext'
          }
        }));
        
        // Component-specific broadcasts for two-way integration
        window.dispatchEvent(new CustomEvent('juice-box-vehicle-update', { 
          detail: {
            vehicle: updatedVehicle,
            action: 'update',
            source: 'VehicleContext'
          }
        }));
        
        window.dispatchEvent(new CustomEvent('garage-vault-vehicle-update', { 
          detail: {
            vehicle: updatedVehicle,
            action: 'update',
            source: 'VehicleContext'
          }
        }));
        
        window.dispatchEvent(new CustomEvent('gallery-vehicle-update', { 
          detail: {
            vehicle: updatedVehicle,
            action: 'update',
            source: 'VehicleContext'
          }
        }));
        
        window.dispatchEvent(new CustomEvent('drive-journal-vehicle-update', { 
          detail: {
            vehicle: updatedVehicle,
            action: 'update',
            source: 'VehicleContext'
          }
        }));
        
        // Sync with the ProfileDataCollector for comprehensive integration
        try {
          // Use import to access ProfileDataCollector directly
          import('../services/ProfileDataCollector').then(module => {
            const ProfileDataCollector = module.default;
            ProfileDataCollector.syncVehicleFromContext(updatedVehicle);
          }).catch(err => {
            console.error('Error importing ProfileDataCollector:', err);
          });
        } catch (error) {
          console.error('Error syncing with ProfileDataCollector:', error);
        }
      }
      
      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };

  // Function to delete a vehicle
  const deleteVehicle = (id: string) => {
    try {
      // Get the vehicle being deleted before removing it
      const vehicleToDelete = vehicles.find(vehicle => vehicle.id === id);
      
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
      
      // Broadcast the deletion to all components if we have the deleted vehicle
      if (vehicleToDelete) {
        console.log('Broadcasting vehicle deletion to all components:', vehicleToDelete.make, vehicleToDelete.model);
        
        // General broadcast
        window.dispatchEvent(new CustomEvent('vehicle-data-update', { 
          detail: {
            vehicle: vehicleToDelete,
            action: 'delete',
            vehicleId: id,
            source: 'VehicleContext'
          }
        }));
        
        // Component-specific broadcasts for two-way integration
        window.dispatchEvent(new CustomEvent('juice-box-vehicle-update', { 
          detail: {
            vehicle: vehicleToDelete,
            action: 'delete',
            vehicleId: id,
            source: 'VehicleContext'
          }
        }));
        
        window.dispatchEvent(new CustomEvent('garage-vault-vehicle-update', { 
          detail: {
            vehicle: vehicleToDelete,
            action: 'delete',
            vehicleId: id,
            source: 'VehicleContext'
          }
        }));
        
        window.dispatchEvent(new CustomEvent('gallery-vehicle-update', { 
          detail: {
            vehicle: vehicleToDelete,
            action: 'delete',
            vehicleId: id,
            source: 'VehicleContext'
          }
        }));
        
        window.dispatchEvent(new CustomEvent('drive-journal-vehicle-update', { 
          detail: {
            vehicle: vehicleToDelete,
            action: 'delete',
            vehicleId: id,
            source: 'VehicleContext'
          }
        }));
        
        // Notify ProfileDataCollector of the deletion
        try {
          // Send a custom event for ProfileDataCollector to listen to
          window.dispatchEvent(new CustomEvent('profile-vehicle-delete', { 
            detail: {
              vehicleId: id
            }
          }));
          
          // Dynamic import of ProfileDataCollector as a backup method
          import('../services/ProfileDataCollector').then(module => {
            // If the module has a deleteVehicle method, use it
            const ProfileDataCollector = module.default;
            if (typeof ProfileDataCollector.deleteVehicle === 'function') {
              ProfileDataCollector.deleteVehicle(id);
            }
          }).catch(err => {
            console.error('Error importing ProfileDataCollector:', err);
          });
        } catch (error) {
          console.error('Error notifying ProfileDataCollector of vehicle deletion:', error);
        }
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