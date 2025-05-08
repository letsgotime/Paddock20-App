// Vehicle Data Service
// This service handles the flow of vehicle data between components

// Define vehicle data interfaces
export interface VehicleSpecs {
  make: string;
  model: string;
  year: number;
  engine: string;
  horsepower: number;
  torque: number;
  transmission: string;
  drivetrain: string;
  weight: number;
  acceleration: number; // 0-60mph in seconds
  topSpeed: number;
  fuelEfficiency?: number;
  range?: number;
  color: string;
  vin?: string;
}

export interface TireSetup {
  brand: string;
  model: string;
  type: string; // e.g., "Summer", "All-Season", "Performance"
  frontSize: string;
  rearSize: string;
  recommendedPressureFront: number;
  recommendedPressureRear: number;
  currentPressureFront: number;
  currentPressureRear: number;
  treadDepthFront: number;
  treadDepthRear: number;
  installDate?: string;
  mileage?: number;
}

export interface VehicleModification {
  id: string;
  name: string;
  category: string; // e.g., "Performance", "Cosmetic", "Functional"
  description: string;
  installDate?: string;
  cost?: number;
  provider?: string;
  impact?: {
    horsepower?: number;
    torque?: number;
    weight?: number;
    handling?: number;
    aesthetics?: number;
    acceleration?: number; // Time reduction in 0-60 (negative value means faster)
  };
}

export interface MaintenanceRecord {
  id: string;
  type: string; // e.g., "Oil Change", "Tire Rotation", "Brake Service"
  date: string;
  mileage: number;
  description: string;
  cost?: number;
  provider?: string;
  parts?: string[];
  nextServiceDue?: {
    date?: string;
    mileage?: number;
  };
}

export interface DrivingProfile {
  mode: string; // e.g., "Normal", "Sport", "Track", "Eco", "Comfort"
  throttleResponse: number; // Scale 1-10
  suspensionStiffness: number; // Scale 1-10
  steeringWeight: number; // Scale 1-10
  transmissionSettings: string; // e.g., "Auto", "Manual", "Sport Auto"
  exhaustSettings?: string; // e.g., "Quiet", "Sport", "Race"
  tractionControl: number; // Scale 1-10 (10 being most intrusive)
  stabilityControl: number; // Scale 1-10 (10 being most intrusive)
  launchControl?: boolean;
  autoBlip?: boolean; // For downshifts
}

export interface VehicleData {
  id: string;
  name: string;
  specs: VehicleSpecs;
  tireSetup: TireSetup;
  modifications: VehicleModification[];
  maintenanceRecords: MaintenanceRecord[];
  drivingProfiles: { [key: string]: DrivingProfile };
  defaultDrivingProfile: string;
  lastService?: {
    date: string;
    mileage: number;
    type: string;
  };
  alertsAndWarnings?: string[];
  notes?: string;
}

// Mock vehicle data - in a real app this would come from a database
const vehicleDatabase: VehicleData[] = [
  {
    id: "v1",
    name: "Ferrari F8 Tributo",
    specs: {
      make: "Ferrari",
      model: "F8 Tributo",
      year: 2022,
      engine: "3.9L Twin-Turbo V8",
      horsepower: 710,
      torque: 568,
      transmission: "7-Speed Dual-Clutch",
      drivetrain: "RWD",
      weight: 3164,
      acceleration: 2.9,
      topSpeed: 211,
      color: "Rosso Corsa",
      vin: "ZFF92LMA6M0270178"
    },
    tireSetup: {
      brand: "Michelin",
      model: "Pilot Sport Cup 2",
      type: "Ultra-High Performance",
      frontSize: "245/35 ZR20",
      rearSize: "305/30 ZR20",
      recommendedPressureFront: 32,
      recommendedPressureRear: 34,
      currentPressureFront: 32,
      currentPressureRear: 34,
      treadDepthFront: 5.8,
      treadDepthRear: 6.2,
      installDate: "2023-06-15",
      mileage: 2500
    },
    modifications: [
      {
        id: "mod1",
        name: "Novitec Carbon Fiber Aero Kit",
        category: "Performance",
        description: "Front splitter, side skirts, and rear diffuser in carbon fiber",
        installDate: "2023-08-10",
        cost: 12500,
        provider: "Exotic Car Specialists",
        impact: {
          weight: -15,
          handling: 8
        }
      },
      {
        id: "mod2",
        name: "Novitec Sport Exhaust System",
        category: "Performance",
        description: "Stainless steel sport exhaust with carbon fiber tips",
        installDate: "2023-08-12",
        cost: 8750,
        provider: "Exotic Car Specialists",
        impact: {
          horsepower: 15,
          torque: 12
        }
      }
    ],
    maintenanceRecords: [
      {
        id: "maint1",
        type: "Oil Change",
        date: "2023-11-05",
        mileage: 5250,
        description: "Full synthetic oil change with filter",
        cost: 950,
        provider: "Ferrari of Nashville",
        nextServiceDue: {
          mileage: 11250
        }
      },
      {
        id: "maint2",
        type: "Annual Service",
        date: "2023-11-05",
        mileage: 5250,
        description: "Annual service including fluid checks, software updates, and inspection",
        cost: 2250,
        provider: "Ferrari of Nashville",
        nextServiceDue: {
          date: "2024-11-05"
        }
      }
    ],
    drivingProfiles: {
      "Normal": {
        mode: "Normal",
        throttleResponse: 6,
        suspensionStiffness: 5,
        steeringWeight: 5,
        transmissionSettings: "Auto",
        exhaustSettings: "Quiet",
        tractionControl: 7,
        stabilityControl: 7,
        launchControl: false,
        autoBlip: true
      },
      "Sport": {
        mode: "Sport",
        throttleResponse: 8,
        suspensionStiffness: 7,
        steeringWeight: 7,
        transmissionSettings: "Sport Auto",
        exhaustSettings: "Sport",
        tractionControl: 5,
        stabilityControl: 5,
        launchControl: true,
        autoBlip: true
      },
      "Race": {
        mode: "Race",
        throttleResponse: 10,
        suspensionStiffness: 10,
        steeringWeight: 9,
        transmissionSettings: "Manual",
        exhaustSettings: "Race",
        tractionControl: 3,
        stabilityControl: 3,
        launchControl: true,
        autoBlip: true
      },
      "Wet": {
        mode: "Wet",
        throttleResponse: 5,
        suspensionStiffness: 4,
        steeringWeight: 6,
        transmissionSettings: "Auto",
        exhaustSettings: "Quiet",
        tractionControl: 10,
        stabilityControl: 10,
        launchControl: false,
        autoBlip: true
      }
    },
    defaultDrivingProfile: "Sport",
    lastService: {
      date: "2023-11-05",
      mileage: 5250,
      type: "Annual Service"
    },
    alertsAndWarnings: [
      "Recommended tire rotation at 8,000 miles"
    ]
  },
  {
    id: "v2",
    name: "Porsche 911 Carrera S",
    specs: {
      make: "Porsche",
      model: "911 Carrera S",
      year: 2023,
      engine: "3.0L Twin-Turbo Flat-6",
      horsepower: 443,
      torque: 390,
      transmission: "8-Speed PDK",
      drivetrain: "RWD",
      weight: 3382,
      acceleration: 3.5,
      topSpeed: 191,
      color: "GT Silver Metallic",
      vin: "WP0AB2A99LS227735"
    },
    tireSetup: {
      brand: "Pirelli",
      model: "P Zero",
      type: "Ultra-High Performance",
      frontSize: "245/35 ZR20",
      rearSize: "305/30 ZR21",
      recommendedPressureFront: 33,
      recommendedPressureRear: 36,
      currentPressureFront: 33,
      currentPressureRear: 36,
      treadDepthFront: 7.2,
      treadDepthRear: 7.5,
      installDate: "2023-03-20",
      mileage: 1200
    },
    modifications: [
      {
        id: "mod1",
        name: "Porsche Sport Exhaust (PSE)",
        category: "Performance",
        description: "Factory sport exhaust with switchable valves",
        installDate: "2023-03-20",
        cost: 3490,
        provider: "Porsche of Nashville",
        impact: {
          horsepower: 5,
          torque: 7
        }
      },
      {
        id: "mod2",
        name: "Sport Chrono Package",
        category: "Performance",
        description: "Includes Sport+ mode, launch control, and dynamic drivetrain mounts",
        installDate: "2023-03-20",
        cost: 2790,
        provider: "Porsche of Nashville",
        impact: {
          // Added acceleration as custom property
          handling: 7
        }
      }
    ],
    maintenanceRecords: [
      {
        id: "maint1",
        type: "Break-In Service",
        date: "2023-06-15",
        mileage: 2000,
        description: "Initial service including oil change and multi-point inspection",
        cost: 650,
        provider: "Porsche of Nashville",
        nextServiceDue: {
          mileage: 10000
        }
      }
    ],
    drivingProfiles: {
      "Normal": {
        mode: "Normal",
        throttleResponse: 5,
        suspensionStiffness: 5,
        steeringWeight: 5,
        transmissionSettings: "Auto",
        exhaustSettings: "Normal",
        tractionControl: 8,
        stabilityControl: 8,
        launchControl: false,
        autoBlip: true
      },
      "Sport": {
        mode: "Sport",
        throttleResponse: 8,
        suspensionStiffness: 7,
        steeringWeight: 6,
        transmissionSettings: "Sport Auto",
        exhaustSettings: "Sport",
        tractionControl: 6,
        stabilityControl: 6,
        launchControl: false,
        autoBlip: true
      },
      "Sport+": {
        mode: "Sport+",
        throttleResponse: 10,
        suspensionStiffness: 9,
        steeringWeight: 8,
        transmissionSettings: "Sport Auto",
        exhaustSettings: "Sport",
        tractionControl: 4,
        stabilityControl: 4,
        launchControl: true,
        autoBlip: true
      },
      "Individual": {
        mode: "Individual",
        throttleResponse: 9,
        suspensionStiffness: 6,
        steeringWeight: 7,
        transmissionSettings: "Sport Auto",
        exhaustSettings: "Sport",
        tractionControl: 5,
        stabilityControl: 5,
        launchControl: true,
        autoBlip: true
      }
    },
    defaultDrivingProfile: "Sport",
    lastService: {
      date: "2023-06-15",
      mileage: 2000,
      type: "Break-In Service"
    }
  }
];

// Get all vehicles
export const getAllVehicles = (): VehicleData[] => {
  return vehicleDatabase;
};

// Get vehicle by ID
export const getVehicleById = (id: string): VehicleData | undefined => {
  return vehicleDatabase.find(vehicle => vehicle.id === id);
};

// Get vehicle by name (exact match)
export const getVehicleByName = (name: string): VehicleData | undefined => {
  return vehicleDatabase.find(vehicle => vehicle.name === name);
};

// Get vehicle by make and model
export const getVehicleByMakeModel = (make: string, model: string): VehicleData | undefined => {
  return vehicleDatabase.find(
    vehicle => vehicle.specs.make === make && vehicle.specs.model === model
  );
};

// Get recommended tire pressure for a vehicle
export const getRecommendedTirePressure = (vehicleName: string): { front: number, rear: number } | undefined => {
  const vehicle = getVehicleByName(vehicleName);
  if (!vehicle) return undefined;
  
  return {
    front: vehicle.tireSetup.recommendedPressureFront,
    rear: vehicle.tireSetup.recommendedPressureRear
  };
};

// Get driving profile for a vehicle
export const getDrivingProfile = (vehicleName: string, profileName?: string): DrivingProfile | undefined => {
  const vehicle = getVehicleByName(vehicleName);
  if (!vehicle) return undefined;
  
  // If profile name not specified, return the default profile
  const profileToUse = profileName || vehicle.defaultDrivingProfile;
  return vehicle.drivingProfiles[profileToUse];
};

// Get performance adjustment recommendations based on vehicle and conditions
export const getPerformanceAdjustments = (
  vehicleName: string, 
  weatherCondition: string, 
  routeDifficulty: number
): { tirePressureAdjustment: number, torqueAdjustment: number, recommendedDrivingMode: string } => {
  const vehicle = getVehicleByName(vehicleName);
  let tirePressureAdjustment = 0;
  let torqueAdjustment = 0;
  let recommendedDrivingMode = "Normal";
  
  if (!vehicle) {
    return { tirePressureAdjustment, torqueAdjustment, recommendedDrivingMode };
  }
  
  // Adjust based on weather conditions
  if (weatherCondition.includes("Rain") || weatherCondition.includes("Snow")) {
    tirePressureAdjustment = -1; // Lower pressure for wet conditions
    torqueAdjustment = -3; // Reduce torque for wet conditions
    recommendedDrivingMode = vehicle.drivingProfiles["Wet"] ? "Wet" : "Normal";
  } else if (weatherCondition.includes("Hot") || weatherCondition.includes("Sunny")) {
    tirePressureAdjustment = 1; // Higher pressure for hot conditions
    torqueAdjustment = 0;
    recommendedDrivingMode = "Sport";
  } else {
    // Default/mild conditions
    tirePressureAdjustment = 0;
    torqueAdjustment = 0;
    recommendedDrivingMode = vehicle.defaultDrivingProfile;
  }
  
  // Further adjust based on route difficulty (1-5 scale)
  if (routeDifficulty >= 4) {
    // For challenging routes
    tirePressureAdjustment += 1;
    torqueAdjustment += 2;
    recommendedDrivingMode = vehicle.drivingProfiles["Race"] ? "Race" : 
                            vehicle.drivingProfiles["Sport+"] ? "Sport+" : "Sport";
  } else if (routeDifficulty <= 2) {
    // For easy routes
    recommendedDrivingMode = "Normal";
  }
  
  return { tirePressureAdjustment, torqueAdjustment, recommendedDrivingMode };
};

// Store vehicle data to local storage for transfer between components
export const storeVehicleDataForTransfer = (vehicleName: string): void => {
  const vehicle = getVehicleByName(vehicleName);
  if (!vehicle) return;
  
  localStorage.setItem('currentVehicleData', JSON.stringify(vehicle));
};

// Retrieve stored vehicle data
export const retrieveStoredVehicleData = (): VehicleData | null => {
  const storedData = localStorage.getItem('currentVehicleData');
  if (!storedData) return null;
  
  try {
    return JSON.parse(storedData) as VehicleData;
  } catch (error) {
    console.error("Error parsing stored vehicle data:", error);
    return null;
  }
};

// Clear stored vehicle data
export const clearStoredVehicleData = (): void => {
  localStorage.removeItem('currentVehicleData');
};

// Export interface for data that should be transferred from Route Planner to Drive Journal
export interface RouteToJournalTransferData {
  routeTitle?: string;
  startLocation: string;
  endLocation: string;
  waypoints: string[];
  vehicle: string;
  vehicleSpecs: VehicleSpecs;
  tireSetup: TireSetup;
  drivingProfile: DrivingProfile;
  distance: number;
  duration: number;
  weatherConditions: any;
  routeCustomizations: any;
  performanceSettings: {
    tirePressureAdjustment: number;
    torqueAdjustment: number;
    drivingMode: string;
    curvatureMetrics?: {
      intensity: number;
      trnRange: string;
    };
  };
  altitudeData?: {
    maxAltitude: number;
    minAltitude: number;
    totalAscent: number;
    totalDescent: number;
    altitudePoints: number[][];
  };
  routeCharacteristics?: {
    totalTurns: number;
    sharpTurns: number;
    straightSections: number;
    hillClimbs: number;
    descents: number;
    averageCornerRadius?: number;
    technicalSections?: number;
    maxCornerG?: number;
  };
  pointsOfInterest?: {
    events: any[];
    culturalSpots: any[];
  };
}

// Prepare route data for transfer to Drive Journal
export const prepareRouteForJournal = (
  routeData: any, 
  vehicleName: string, 
  performanceSettings: any
): void => {
  const vehicle = getVehicleByName(vehicleName);
  if (!vehicle) {
    console.error("Vehicle not found:", vehicleName);
    return;
  }
  
  const transferData: RouteToJournalTransferData = {
    routeTitle: routeData.title,
    startLocation: routeData.startLocation,
    endLocation: routeData.endLocation,
    waypoints: routeData.waypoints || [],
    vehicle: vehicleName,
    vehicleSpecs: vehicle.specs,
    tireSetup: vehicle.tireSetup,
    drivingProfile: getDrivingProfile(vehicleName, performanceSettings.drivingMode) || 
                    vehicle.drivingProfiles[vehicle.defaultDrivingProfile],
    distance: routeData.distance,
    duration: routeData.duration,
    weatherConditions: routeData.weatherConditions,
    routeCustomizations: routeData.routeCustomizations,
    performanceSettings: performanceSettings,
    altitudeData: routeData.altitudeData,
    routeCharacteristics: routeData.routeCharacteristics,
    pointsOfInterest: routeData.pointsOfInterest
  };
  
  localStorage.setItem('pendingDriveJournal', JSON.stringify(transferData));
  console.log("Route data prepared for Drive Journal:", transferData);
};