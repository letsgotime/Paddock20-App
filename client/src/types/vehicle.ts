/**
 * Vehicle type definition
 */
export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  name?: string; // Nickname for vehicle
  vin?: string;
  licensePlate?: string;
  mileage?: number;
  lastServiceDate?: string;
  purchaseDate?: string;
  imageUrl?: string;
  gallery?: string[]; // Array of image URLs
  description?: string;
  status: 'active' | 'inactive' | 'sold' | 'in_maintenance';
  specs?: VehicleSpecs;
  healthScore?: number; // 0-100 score based on maintenance status
  insured?: boolean;
  insuranceExpiry?: string;
  color?: string;
  fuelType?: string;
  transmissionType?: string;
  modifications?: Modification[];
  history?: MaintenanceRecord[];
  forSale?: boolean;
  askingPrice?: number;
}

/**
 * Vehicle specifications
 */
export interface VehicleSpecs {
  engine?: string;
  engineSize?: number; // in liters
  engineConfiguration?: string; // e.g., "V8", "Inline-6"
  horsepower?: number;
  torque?: number;
  topSpeed?: number;
  zeroToSixty?: number; // time in seconds
  driveTrain?: string; // e.g., RWD, AWD, FWD
  transmission?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  wheelbase?: number;
  fuelTankCapacity?: number;
  fuelEfficiencyCity?: number;
  fuelEfficiencyHighway?: number;
  tireFront?: string;
  tireRear?: string;
}

/**
 * Vehicle modification
 */
export interface Modification {
  id: string;
  name: string;
  category: 'performance' | 'appearance' | 'utility' | 'wheels_tires' | 'electronics' | 'other';
  description?: string;
  installDate: string;
  cost?: number;
  provider?: string;
  imageUrls?: string[];
  partNumber?: string;
  warranty?: {
    provider: string;
    expirationDate: string;
    description?: string;
  };
}

/**
 * Maintenance record
 */
export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'scheduled' | 'repair' | 'modification' | 'inspection' | 'recall';
  description: string;
  provider?: string;
  cost?: number;
  mileage?: number;
  receipts?: string[]; // URLs to receipt images
  parts?: {
    name: string;
    partNumber?: string;
    cost?: number;
    quantity?: number;
  }[];
  notes?: string;
}