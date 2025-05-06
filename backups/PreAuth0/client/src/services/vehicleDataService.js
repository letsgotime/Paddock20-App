/**
 * VehicleDataService
 * 
 * A comprehensive centralized service for managing vehicle data across the entire application
 * Provides a unified API for accessing and manipulating vehicle data
 * Enables real-time updates when modifications are made
 * Ensures data synchronization across components
 */

import { vehicles as initialVehicles, garageVehicles as initialGarageVehicles } from '../data/vehicles';
import { create } from 'zustand';

// Helper function to find vehicle by ID
const findVehicleById = (vehicles, id) => {
  return vehicles.find(vehicle => 
    vehicle.id === id || 
    vehicle.id === parseInt(id) || 
    (typeof vehicle.id === 'number' && vehicle.id.toString() === id)
  );
};

// Create a store for vehicle data using Zustand
const useVehicleStore = create((set, get) => ({
  // State
  vehicles: initialVehicles,
  garageVehicles: initialGarageVehicles,
  activeVehicleId: initialVehicles.length > 0 ? initialVehicles[0].id : null,
  isLoading: false,
  error: null,
  
  // Image Collections for each vehicle
  vehicleImages: {}, // { vehicleId: { delivery: [], mods: [], beforeAfter: [], events: [], sale: [] } }
  
  // Actions
  setActiveVehicle: (vehicleId) => {
    set({ activeVehicleId: vehicleId });
  },
  
  // Get active vehicle data
  getActiveVehicle: () => {
    const { vehicles, activeVehicleId } = get();
    return findVehicleById(vehicles, activeVehicleId) || null;
  },
  
  // Get vehicle by ID
  getVehicleById: (id) => {
    const { vehicles } = get();
    return findVehicleById(vehicles, id) || null;
  },
  
  // Get all owned vehicles
  getOwnedVehicles: () => {
    const { vehicles } = get();
    return vehicles.filter(vehicle => vehicle.isOwned === true);
  },
  
  // Get dream vehicles (not owned yet)
  getDreamVehicles: () => {
    const { vehicles } = get();
    return vehicles.filter(vehicle => !vehicle.isOwned);
  },
  
  // Add a new vehicle
  addVehicle: (newVehicle) => {
    set(state => ({ 
      vehicles: [...state.vehicles, newVehicle],
      garageVehicles: [...state.garageVehicles, {
        id: newVehicle.id,
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year,
        image: newVehicle.image,
        status: newVehicle.isOwned ? 'owned' : 'dream'
      }]
    }));
  },
  
  // Update an existing vehicle
  updateVehicle: (id, updatedData) => {
    set(state => ({ 
      vehicles: state.vehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, ...updatedData } : vehicle
      ),
      // Update garage vehicles if make/model/year/image changed
      garageVehicles: state.garageVehicles.map(vehicle => 
        vehicle.id === id ? { 
          ...vehicle, 
          make: updatedData.make || vehicle.make,
          model: updatedData.model || vehicle.model,
          year: updatedData.year || vehicle.year,
          image: updatedData.image || vehicle.image,
          status: (updatedData.isOwned !== undefined) ? (updatedData.isOwned ? 'owned' : 'dream') : vehicle.status
        } : vehicle
      )
    }));
  },
  
  // Remove a vehicle
  removeVehicle: (id) => {
    set(state => ({ 
      vehicles: state.vehicles.filter(vehicle => vehicle.id !== id),
      garageVehicles: state.garageVehicles.filter(vehicle => vehicle.id !== id)
    }));
  },
  
  // Add a modification to a vehicle
  addModification: (vehicleId, modification) => {
    set(state => ({
      vehicles: state.vehicles.map(vehicle => {
        if (vehicle.id === vehicleId) {
          const updatedVehicle = { 
            ...vehicle, 
            isModified: true,
            modifications: [...(vehicle.modifications || []), modification]
          };
          return updatedVehicle;
        }
        return vehicle;
      })
    }));
  },
  
  // Remove a modification from a vehicle
  removeModification: (vehicleId, modificationIndex) => {
    set(state => ({
      vehicles: state.vehicles.map(vehicle => {
        if (vehicle.id === vehicleId && vehicle.modifications) {
          const updatedMods = [...vehicle.modifications];
          updatedMods.splice(modificationIndex, 1);
          
          return { 
            ...vehicle, 
            modifications: updatedMods,
            isModified: updatedMods.length > 0
          };
        }
        return vehicle;
      })
    }));
  },
  
  // Update tire information
  updateTireInfo: (vehicleId, tireInfo) => {
    set(state => ({
      vehicles: state.vehicles.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, tire: { ...(vehicle.tire || {}), ...tireInfo } } 
          : vehicle
      )
    }));
  },
  
  // Update gloss tracking information
  updateGlossInfo: (vehicleId, glossInfo) => {
    set(state => ({
      vehicles: state.vehicles.map(vehicle => {
        if (vehicle.id === vehicleId) {
          // Handle the case where we're adding a new entry to glossGrowthLog
          if (glossInfo.newLogEntry) {
            const updatedGlossTracking = {
              ...(vehicle.glossTracking || {}),
              glossGrowthLog: [
                glossInfo.newLogEntry,
                ...(vehicle.glossTracking?.glossGrowthLog || [])
              ]
            };
            
            delete glossInfo.newLogEntry;
            return { 
              ...vehicle, 
              glossTracking: {
                ...updatedGlossTracking,
                ...glossInfo
              }
            };
          }
          
          return { 
            ...vehicle, 
            glossTracking: { ...(vehicle.glossTracking || {}), ...glossInfo } 
          };
        }
        return vehicle;
      })
    }));
  },
  
  // Update maintenance information
  updateMaintenanceInfo: (vehicleId, maintenanceInfo) => {
    set(state => ({
      vehicles: state.vehicles.map(vehicle => {
        if (vehicle.id === vehicleId) {
          // Handle the case where we're adding a new maintenance record
          if (maintenanceInfo.newRecord) {
            const updatedMaintenance = {
              ...(vehicle.maintenance || {}),
              records: [
                maintenanceInfo.newRecord,
                ...(vehicle.maintenance?.records || [])
              ]
            };
            
            delete maintenanceInfo.newRecord;
            return { 
              ...vehicle, 
              maintenance: {
                ...updatedMaintenance,
                ...maintenanceInfo
              }
            };
          }
          
          return { 
            ...vehicle, 
            maintenance: { ...(vehicle.maintenance || {}), ...maintenanceInfo } 
          };
        }
        return vehicle;
      })
    }));
  },
  
  // Add a vehicle image to a specific collection (delivery, mods, beforeAfter, events, sale)
  addVehicleImage: (vehicleId, collection, imageData) => {
    set(state => {
      // Get existing images for this vehicle or initialize
      const vehicleImagesCollection = state.vehicleImages[vehicleId] || {
        delivery: [],
        mods: [],
        beforeAfter: [],
        events: [],
        sale: []
      };
      
      // Add the new image to the specified collection
      const updatedCollection = [...vehicleImagesCollection[collection], imageData];
      
      return {
        vehicleImages: {
          ...state.vehicleImages,
          [vehicleId]: {
            ...vehicleImagesCollection,
            [collection]: updatedCollection
          }
        }
      };
    });
  },
  
  // Remove a vehicle image from a collection
  removeVehicleImage: (vehicleId, collection, imageId) => {
    set(state => {
      // Get existing images for this vehicle
      const vehicleImagesCollection = state.vehicleImages[vehicleId];
      if (!vehicleImagesCollection) return state;
      
      // Filter out the image to remove
      const updatedCollection = vehicleImagesCollection[collection].filter(
        img => img.id !== imageId
      );
      
      return {
        vehicleImages: {
          ...state.vehicleImages,
          [vehicleId]: {
            ...vehicleImagesCollection,
            [collection]: updatedCollection
          }
        }
      };
    });
  },
  
  // Get all images for a specific vehicle
  getVehicleImages: (vehicleId) => {
    const { vehicleImages } = get();
    return vehicleImages[vehicleId] || {
      delivery: [],
      mods: [],
      beforeAfter: [],
      events: [],
      sale: []
    };
  },
  
  // Get images for a specific collection
  getVehicleImageCollection: (vehicleId, collection) => {
    const { vehicleImages } = get();
    const vehicleImagesCollection = vehicleImages[vehicleId];
    if (!vehicleImagesCollection) return [];
    return vehicleImagesCollection[collection] || [];
  },
  
  // Fetch all vehicle data from backend/API (would be implemented with actual API calls)
  fetchVehicles: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In the real implementation, you would fetch from your API
      // const response = await fetch('/api/vehicles');
      // const data = await response.json();
      
      set({ 
        vehicles: initialVehicles,
        garageVehicles: initialGarageVehicles,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));

// Export a singleton instance of the vehicle service
const vehicleDataService = {
  useVehicleStore,
  
  // Additional utility methods can be added here 
  getVehicleFullName: (vehicle) => {
    if (!vehicle) return '';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  },
  
  // Get tire health percentage
  getTireHealthPercentage: (vehicle) => {
    if (!vehicle || !vehicle.tire) return 0;
    
    const { mileageLifeTarget, currentMileage } = vehicle.tire;
    if (!mileageLifeTarget || !currentMileage) return 0;
    
    const usedPercentage = (currentMileage / mileageLifeTarget) * 100;
    return Math.max(0, Math.min(100, 100 - usedPercentage));
  },
  
  // Calculate days since last gloss boost
  getDaysSinceLastGlossBoost: (vehicle) => {
    if (!vehicle || !vehicle.glossTracking || !vehicle.glossTracking.lastGlossBoost) {
      return null;
    }
    
    const lastBoostDate = new Date(vehicle.glossTracking.lastGlossBoost);
    const today = new Date();
    const diffTime = Math.abs(today - lastBoostDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },
  
  // Calculate days until next service
  getDaysUntilNextService: (vehicle) => {
    if (!vehicle || !vehicle.nextService) {
      return null;
    }
    
    const nextServiceDate = new Date(vehicle.nextService);
    const today = new Date();
    const diffTime = nextServiceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
};

export default vehicleDataService;