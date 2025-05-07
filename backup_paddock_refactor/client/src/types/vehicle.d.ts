// Extended vehicle type definitions
import { Vehicle } from '../contexts/VehicleContext';

// Add the _skipBroadcast flag to VehicleData type to fix infinite loop issue
declare module '../contexts/VehicleContext' {
  export interface Vehicle {
    _skipBroadcast?: boolean;
  }
}

// Extend the Vehicle type to include internal system flags
export interface VehicleDataWithFlags extends Vehicle {
  _skipBroadcast?: boolean;
  _source?: string;
}