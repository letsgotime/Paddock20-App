import { useVehicle as useVehicleContext } from '@/contexts/VehicleContext';
import { useCallback } from 'react';
import { Vehicle } from '@/contexts/VehicleContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced bridge hook that provides consistent property naming
 * and backward compatibility for components using different terminology.
 * 
 * This resolves issues between components importing from different paths
 * and ensures consistent naming between activeVehicle and selectedVehicle.
 */
export const useVehicle = () => {
  const vehicleContext = useVehicleContext();
  const { toast } = useToast();
  
  /**
   * Add a new vehicle
   */
  const addVehicle = useCallback(async (vehicle: Vehicle): Promise<Vehicle> => {
    try {
      return await vehicleContext.addVehicle(vehicle);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to add vehicle. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [vehicleContext, toast]);

  /**
   * Update an existing vehicle
   */
  const updateVehicle = useCallback(async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      return await vehicleContext.updateVehicle(id, vehicleData);
    } catch (error) {
      console.error(`Error updating vehicle ${id}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to update vehicle. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [vehicleContext, toast]);

  /**
   * Delete a vehicle
   */
  const deleteVehicle = useCallback(async (id: string): Promise<void> => {
    try {
      await vehicleContext.deleteVehicle(id);
    } catch (error) {
      console.error(`Error deleting vehicle ${id}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [vehicleContext, toast]);

  /**
   * Get all vehicles
   */
  const getVehicles = useCallback(() => {
    try {
      return vehicleContext.getVehicles();
    } catch (error) {
      console.error('Error getting vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to retrieve vehicles. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
  }, [vehicleContext, toast]);

  /**
   * Get a single vehicle by ID
   */
  const getVehicleById = useCallback((id: string) => {
    if (!vehicleContext || !vehicleContext.getVehicleById) {
      return null;
    }
    
    try {
      return vehicleContext.getVehicleById(id);
    } catch (error) {
      console.error(`Error getting vehicle with ID ${id}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to retrieve vehicle details. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [vehicleContext, toast]);

  return {
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicles,
    getVehicleById,
    vehicles: vehicleContext?.vehicles || [],
    selectedVehicle: vehicleContext?.selectedVehicle,
    activeVehicle: vehicleContext?.selectedVehicle, // Add alias for backward compatibility
    setSelectedVehicle: vehicleContext?.setSelectedVehicle,
    setActiveVehicle: vehicleContext?.setSelectedVehicle, // Add alias for backward compatibility
    loading: vehicleContext?.loading || false,
  };
};

export default useVehicle;