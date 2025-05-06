import { useEffect } from 'react';
import useVehicleStore from '../services/vehicleDataService';

// Hook to easily access vehicle data
export const useVehicleData = (vehicleId?: number) => {
  const {
    vehicles,
    mods,
    tires,
    maintenanceRecords,
    isLoading,
    error,
    loadVehicles,
    loadVehicleDetails,
    getTiresByVehicleId,
    getMaintenanceRecordsByVehicleId,
    getGlossTrackingByVehicleId
  } = useVehicleStore();

  // Load vehicles on component mount
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Load specific vehicle details if vehicleId is provided
  useEffect(() => {
    if (vehicleId) {
      loadVehicleDetails(vehicleId);
    }
  }, [vehicleId, loadVehicleDetails]);

  // Extract data for a specific vehicle if vehicleId is provided
  const vehicleData = vehicleId ? {
    vehicle: vehicles.find(v => v.id === vehicleId) || null,
    mods: mods.filter(m => m.vehicleId === vehicleId),
    tires: getTiresByVehicleId(vehicleId),
    maintenanceRecords: getMaintenanceRecordsByVehicleId(vehicleId),
    glossTracking: getGlossTrackingByVehicleId(vehicleId)
  } : null;

  return {
    vehicles,
    vehicleData,
    isLoading,
    error,
    store: useVehicleStore  // Return the entire store in case advanced operations are needed
  };
};

export default useVehicleData;