import { useState, useEffect, useCallback, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VehicleContext, Vehicle, MaintenanceItem } from '../contexts/VehicleContext';
// Temporarily removing useAuth to fix provider dependency issue
// import { useAuth } from '@/hooks/useAuth';

// Re-export these types for backward compatibility
export type { Vehicle, MaintenanceItem };

export function useVehicle() {
  const vehicleContext = useContext(VehicleContext);
  // Temporarily using a mock user for testing authentication issue
  const user = null; // Will be fixed when auth issue is resolved
  const { toast } = useToast();
  
  // This will synchronize with local storage on component mount
  useEffect(() => {
    // Any synchronization logic here if needed
  }, []);

  /**
   * Add a new vehicle to the user's garage
   */
  const addVehicle = useCallback(async (vehicleData: Partial<Vehicle>) => {
    if (!vehicleContext || !vehicleContext.addVehicle) {
      throw new Error('Vehicle context not available');
    }
    
    try {
      return await vehicleContext.addVehicle({
        ...vehicleData,
        id: `vehicle-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Vehicle);
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
  const updateVehicle = useCallback(async (id: string, vehicleData: Partial<Vehicle>) => {
    if (!vehicleContext || !vehicleContext.updateVehicle) {
      throw new Error('Vehicle context not available');
    }
    
    try {
      return await vehicleContext.updateVehicle(id, {
        ...vehicleData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
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
  const deleteVehicle = useCallback(async (id: string) => {
    if (!vehicleContext || !vehicleContext.deleteVehicle) {
      throw new Error('Vehicle context not available');
    }
    
    try {
      await vehicleContext.deleteVehicle(id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [vehicleContext, toast]);

  /**
   * Get all vehicles for the current user
   */
  const getVehicles = useCallback(() => {
    if (!vehicleContext || !vehicleContext.getVehicles) {
      return [];
    }
    
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
    loading: vehicleContext?.loading || false,
  };
}