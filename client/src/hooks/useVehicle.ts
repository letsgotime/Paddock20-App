import { useVehicle as useVehicleContext } from '@/contexts/VehicleContext';

// This is a bridge hook to resolve the different import paths used in the codebase
// Some components import from @/hooks/useVehicle while others import from @/contexts/VehicleContext
export const useVehicle = () => {
  return useVehicleContext();
};

export default useVehicle;