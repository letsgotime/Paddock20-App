/**
 * ServiceDataService
 * 
 * A comprehensive centralized service for managing vehicle maintenance and service data across the entire application
 * Provides a unified API for accessing and manipulating service records, maintenance schedules, and upcoming service notifications
 * Enables real-time updates when services are performed
 * Ensures data synchronization across components
 */

import { create } from 'zustand';
import { vehicles as initialVehicles } from '../data/vehicles';

// Helper function to find vehicle by ID
const findVehicleById = (vehicles, id) => {
  return vehicles.find(vehicle => 
    vehicle.id === id || 
    vehicle.id === parseInt(id) || 
    (typeof vehicle.id === 'number' && vehicle.id.toString() === id)
  );
};

// Initial service records (in production this would come from a database)
const initialServiceRecords = [
  {
    id: "srv-bmw-g80-1",
    vehicleId: "bmw-g80-m3",
    date: "2023-09-20",
    type: "Major Service",
    mileage: 15000,
    serviceProvider: "BMW Dealership",
    cost: 1250.00,
    description: "Annual maintenance service with fluid flush and brake system check",
    partsReplaced: [
      { name: "Engine oil", partNumber: "BM-7345-21" },
      { name: "Oil filter", partNumber: "BM-1123-65" },
      { name: "Brake fluid", partNumber: "BM-8811-34" }
    ],
    notes: "Vehicle in excellent condition, no issues found",
    invoiceImage: "/assets/service-invoice-g80-1.jpg",
    nextServiceDue: "2024-03-20",
    nextServiceMileage: 20000
  },
  {
    id: "srv-bmw-g80-2",
    vehicleId: "bmw-g80-m3",
    date: "2024-03-05",
    type: "Oil & Filter Service",
    mileage: 18500,
    serviceProvider: "BMW Dealership",
    cost: 285.00,
    description: "Oil change with filter, inspection, and software updates",
    partsReplaced: [
      { name: "Engine oil", partNumber: "BM-7345-21" },
      { name: "Oil filter", partNumber: "BM-1123-65" }
    ],
    notes: "Software updates applied to improve fuel efficiency",
    invoiceImage: "/assets/service-invoice-g80-2.jpg",
    nextServiceDue: "2024-09-05",
    nextServiceMileage: 23500
  },
  {
    id: "srv-bmw-e93-1",
    vehicleId: "bmw-e93-m3",
    date: "2023-06-10",
    type: "Major Service",
    mileage: 60000,
    serviceProvider: "Performance BMW Specialist",
    cost: 1875.00,
    description: "Comprehensive service including cooling system, transmission, and brake system",
    partsReplaced: [
      { name: "Coolant", partNumber: "BM-9934-10" },
      { name: "Thermostat", partNumber: "BM-8753-31" },
      { name: "Transmission fluid", partNumber: "BM-6621-19" },
      { name: "Brake pads (front)", partNumber: "BM-4371-88" },
      { name: "Brake fluid", partNumber: "BM-8811-34" }
    ],
    notes: "Cooling system thoroughly flushed, brake pads replaced proactively",
    invoiceImage: "/assets/service-invoice-e93-1.jpg",
    nextServiceDue: "2024-06-10",
    nextServiceMileage: 65000
  },
  {
    id: "srv-bmw-e93-2",
    vehicleId: "bmw-e93-m3",
    date: "2024-02-22",
    type: "Oil & Filter Service",
    mileage: 62500,
    serviceProvider: "Performance BMW Specialist",
    cost: 320.00,
    description: "Regular maintenance with filter replacement and inspection",
    partsReplaced: [
      { name: "Engine oil", partNumber: "BM-7345-21" },
      { name: "Oil filter", partNumber: "BM-1123-65" },
      { name: "Air filter", partNumber: "BM-2253-76" }
    ],
    notes: "Additional air filter replacement due to high dust conditions",
    invoiceImage: "/assets/service-invoice-e93-2.jpg",
    nextServiceDue: "2024-08-22",
    nextServiceMileage: 67500
  },
  {
    id: "srv-audi-r8-1",
    vehicleId: "audi-r8-v10",
    date: "2023-08-10",
    type: "Mid-Year Service",
    mileage: 29000,
    serviceProvider: "Audi Sport Center",
    cost: 975.00,
    description: "Air filters, brake fluid, and inspection",
    partsReplaced: [
      { name: "Air filter", partNumber: "AU-3456-22" },
      { name: "Cabin filter", partNumber: "AU-3456-23" },
      { name: "Brake fluid", partNumber: "AU-8756-11" }
    ],
    notes: "All systems operating normally",
    invoiceImage: "/assets/service-invoice-r8-1.jpg",
    nextServiceDue: "2024-02-10",
    nextServiceMileage: 34000
  },
  {
    id: "srv-audi-r8-2",
    vehicleId: "audi-r8-v10",
    date: "2024-01-15",
    type: "Oil Change",
    mileage: 31200,
    serviceProvider: "Audi Sport Center",
    cost: 395.00,
    description: "Regular oil service with OEM filter and multi-point inspection",
    partsReplaced: [
      { name: "Engine oil", partNumber: "AU-7821-45" },
      { name: "Oil filter", partNumber: "AU-7821-46" }
    ],
    notes: "Hoses and belts inspected, all in excellent condition",
    invoiceImage: "/assets/service-invoice-r8-2.jpg",
    nextServiceDue: "2024-07-15",
    nextServiceMileage: 36200
  },
  {
    id: "srv-ferrari-458-1",
    vehicleId: "ferrari-458",
    date: "2023-12-15",
    type: "Brake System Maintenance",
    mileage: 11800,
    serviceProvider: "Ferrari Approved Service Center",
    cost: 2250.00,
    description: "Brake fluid flush, pad inspection, and caliper cleaning",
    partsReplaced: [
      { name: "Brake fluid", partNumber: "FR-8867-32" }
    ],
    notes: "Brake pads at 65% remaining, calipers thoroughly cleaned and inspected",
    invoiceImage: "/assets/service-invoice-458-1.jpg",
    nextServiceDue: "2024-06-15",
    nextServiceMileage: 16800
  },
  {
    id: "srv-ferrari-458-2",
    vehicleId: "ferrari-458",
    date: "2024-01-10",
    type: "Oil Change",
    mileage: 12000,
    serviceProvider: "Ferrari Approved Service Center",
    cost: 875.00,
    description: "Full synthetic oil change with OEM filter",
    partsReplaced: [
      { name: "Engine oil", partNumber: "FR-7765-21" },
      { name: "Oil filter", partNumber: "FR-7765-22" }
    ],
    notes: "All fluid levels topped off, vehicle in excellent condition",
    invoiceImage: "/assets/service-invoice-458-2.jpg",
    nextServiceDue: "2024-07-10",
    nextServiceMileage: 17000
  }
];

// Maintenance schedule templates (manufacturer-recommended service intervals)
const maintenanceTemplates = {
  "bmw": {
    "g80-m3": [
      { serviceType: "Oil Change", intervalMonths: 6, intervalMiles: 5000 },
      { serviceType: "Brake Fluid Flush", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Air Filter", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Cabin Filter", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Spark Plugs", intervalMonths: 36, intervalMiles: 30000 },
      { serviceType: "Coolant Flush", intervalMonths: 48, intervalMiles: 40000 },
      { serviceType: "Transmission Service", intervalMonths: 48, intervalMiles: 50000 }
    ],
    "e93-m3": [
      { serviceType: "Oil Change", intervalMonths: 6, intervalMiles: 5000 },
      { serviceType: "Brake Fluid Flush", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Air Filter", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Cabin Filter", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Spark Plugs", intervalMonths: 36, intervalMiles: 30000 },
      { serviceType: "Coolant Flush", intervalMonths: 48, intervalMiles: 40000 },
      { serviceType: "Transmission Service", intervalMonths: 36, intervalMiles: 40000 }
    ]
  },
  "audi": {
    "r8-v10": [
      { serviceType: "Oil Change", intervalMonths: 6, intervalMiles: 5000 },
      { serviceType: "Brake Fluid Flush", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Air Filter", intervalMonths: 12, intervalMiles: 15000 },
      { serviceType: "Cabin Filter", intervalMonths: 12, intervalMiles: 15000 },
      { serviceType: "Spark Plugs", intervalMonths: 36, intervalMiles: 35000 },
      { serviceType: "Coolant Flush", intervalMonths: 48, intervalMiles: 40000 },
      { serviceType: "Transmission Service", intervalMonths: 36, intervalMiles: 35000 }
    ]
  },
  "ferrari": {
    "458": [
      { serviceType: "Oil Change", intervalMonths: 6, intervalMiles: 5000 },
      { serviceType: "Brake Fluid Flush", intervalMonths: 12, intervalMiles: 10000 },
      { serviceType: "Air Filter", intervalMonths: 12, intervalMiles: 10000 },
      { serviceType: "Cabin Filter", intervalMonths: 12, intervalMiles: 10000 },
      { serviceType: "Spark Plugs", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Coolant Flush", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Transmission Service", intervalMonths: 24, intervalMiles: 20000 },
      { serviceType: "Belt Service", intervalMonths: 60, intervalMiles: 30000 }
    ]
  }
};

// Create a store for service data using Zustand
const useServiceStore = create((set, get) => ({
  // State
  serviceRecords: initialServiceRecords,
  maintenanceSchedules: maintenanceTemplates,
  vehicleList: initialVehicles,
  isLoading: false,
  error: null,
  
  // Get all service records for a specific vehicle
  getVehicleServiceRecords: (vehicleId) => {
    const { serviceRecords } = get();
    return serviceRecords.filter(record => record.vehicleId === vehicleId);
  },
  
  // Get most recent service record for a vehicle
  getLatestServiceRecord: (vehicleId) => {
    const { serviceRecords } = get();
    const vehicleRecords = serviceRecords.filter(record => record.vehicleId === vehicleId);
    
    if (vehicleRecords.length === 0) return null;
    
    // Sort by date (most recent first)
    return vehicleRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  },
  
  // Get maintenance schedule for a vehicle
  getVehicleMaintenanceSchedule: (vehicleId) => {
    const { vehicleList, maintenanceSchedules } = get();
    const vehicle = findVehicleById(vehicleList, vehicleId);
    
    if (!vehicle) return [];
    
    // Try to find maintenance schedule by make and model
    const makeSchedules = maintenanceSchedules[vehicle.make.toLowerCase()];
    if (!makeSchedules) return [];
    
    // Look for exact model match or partial match
    const modelKey = Object.keys(makeSchedules).find(key => {
      const modelLower = vehicle.model.toLowerCase();
      return modelLower === key || modelLower.includes(key) || key.includes(modelLower);
    });
    
    if (!modelKey) return [];
    return makeSchedules[modelKey];
  },
  
  // Calculate upcoming service needs based on maintenance schedule and service history
  getUpcomingServiceNeeds: (vehicleId) => {
    const { getVehicleServiceRecords, getVehicleMaintenanceSchedule } = get();
    
    const serviceRecords = getVehicleServiceRecords(vehicleId);
    const maintenanceSchedule = getVehicleMaintenanceSchedule(vehicleId);
    const vehicle = findVehicleById(get().vehicleList, vehicleId);
    
    if (!vehicle || !maintenanceSchedule || maintenanceSchedule.length === 0) {
      return [];
    }
    
    const today = new Date();
    const currentMileage = vehicle.mileage || 0;
    
    // Create a map of service types to their latest service date and mileage
    const serviceHistory = {};
    serviceRecords.forEach(record => {
      // Determine service types from parts replaced and description
      const serviceTypes = determineServiceTypes(record);
      
      serviceTypes.forEach(type => {
        if (!serviceHistory[type] || new Date(record.date) > new Date(serviceHistory[type].date)) {
          serviceHistory[type] = {
            date: record.date,
            mileage: record.mileage
          };
        }
      });
    });
    
    // Calculate due dates and statuses for each maintenance item
    return maintenanceSchedule.map(item => {
      const lastService = serviceHistory[item.serviceType];
      
      let nextDueDate = null;
      let nextDueMileage = null;
      let status = "unknown";
      
      if (lastService) {
        // Calculate next due date based on last service date and interval
        const lastServiceDate = new Date(lastService.date);
        nextDueDate = new Date(lastServiceDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + item.intervalMonths);
        
        // Calculate next due mileage based on last service mileage and interval
        nextDueMileage = lastService.mileage + item.intervalMiles;
        
        // Determine status based on date and mileage
        const daysDiff = Math.floor((nextDueDate - today) / (1000 * 60 * 60 * 24));
        const mileageDiff = nextDueMileage - currentMileage;
        
        if (daysDiff < 0 || mileageDiff < 0) {
          status = "overdue";
        } else if (daysDiff < 30 || mileageDiff < 500) {
          status = "due soon";
        } else if (daysDiff < 90 || mileageDiff < 1500) {
          status = "upcoming";
        } else {
          status = "ok";
        }
      } else {
        // No service history, calculate based on vehicle purchase date or default
        const purchaseDate = vehicle.purchaseDate ? new Date(vehicle.purchaseDate) : new Date();
        nextDueDate = new Date(purchaseDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + item.intervalMonths);
        
        nextDueMileage = (vehicle.purchaseMileage || 0) + item.intervalMiles;
        
        // Determine status based on date and mileage
        const daysDiff = Math.floor((nextDueDate - today) / (1000 * 60 * 60 * 24));
        const mileageDiff = nextDueMileage - currentMileage;
        
        if (daysDiff < 0 || mileageDiff < 0) {
          status = "overdue";
        } else if (daysDiff < 30 || mileageDiff < 500) {
          status = "due soon";
        } else {
          status = "ok";
        }
      }
      
      return {
        ...item,
        lastServiceDate: lastService ? lastService.date : null,
        lastServiceMileage: lastService ? lastService.mileage : null,
        nextDueDate: nextDueDate ? nextDueDate.toISOString().split('T')[0] : null,
        nextDueMileage,
        status
      };
    });
  },
  
  // Add a new service record
  addServiceRecord: (serviceRecord) => {
    set(state => ({ 
      serviceRecords: [...state.serviceRecords, serviceRecord]
    }));
    
    // Also update the vehicle's last service date and mileage
    const { vehicleList } = get();
    const vehicle = findVehicleById(vehicleList, serviceRecord.vehicleId);
    
    if (vehicle) {
      // Update the vehicle with new service info
      vehicle.lastService = serviceRecord.date;
      vehicle.nextService = serviceRecord.nextServiceDue;
      vehicle.mileage = Math.max(vehicle.mileage || 0, serviceRecord.mileage);
      
      // TODO: In a real app, we would also persist this to the database
    }
  },
  
  // Update an existing service record
  updateServiceRecord: (recordId, updatedData) => {
    set(state => ({ 
      serviceRecords: state.serviceRecords.map(record => 
        record.id === recordId ? { ...record, ...updatedData } : record
      )
    }));
  },
  
  // Remove a service record
  removeServiceRecord: (recordId) => {
    set(state => ({ 
      serviceRecords: state.serviceRecords.filter(record => record.id !== recordId)
    }));
  },
  
  // Calculate health scores for different vehicle systems
  getVehicleSystemHealth: (vehicleId) => {
    const { getVehicleServiceRecords, getVehicleMaintenanceSchedule } = get();
    
    const serviceRecords = getVehicleServiceRecords(vehicleId);
    const maintenanceSchedule = getVehicleMaintenanceSchedule(vehicleId);
    const vehicle = findVehicleById(get().vehicleList, vehicleId);
    
    if (!vehicle || !maintenanceSchedule) {
      return {
        overall: 0,
        engine: 0,
        transmission: 0,
        brakes: 0,
        cooling: 0,
        electrical: 0
      };
    }
    
    // Calculate health scores for each system
    // This is a simplified calculation - in a real app this would be more sophisticated
    const systems = {
      engine: ["Oil Change", "Air Filter", "Spark Plugs"],
      transmission: ["Transmission Service"],
      brakes: ["Brake Fluid Flush", "Brake Pads"],
      cooling: ["Coolant Flush"],
      electrical: ["Battery"]
    };
    
    const upcomingServices = get().getUpcomingServiceNeeds(vehicleId);
    
    const healthScores = {};
    
    // Calculate health score for each system
    Object.keys(systems).forEach(system => {
      const systemServices = systems[system];
      const systemItems = upcomingServices.filter(item => 
        systemServices.includes(item.serviceType)
      );
      
      if (systemItems.length === 0) {
        healthScores[system] = 70; // Default if no data
        return;
      }
      
      // Calculate average health based on statuses
      let totalScore = 0;
      systemItems.forEach(item => {
        switch (item.status) {
          case "ok": totalScore += 100; break;
          case "upcoming": totalScore += 75; break;
          case "due soon": totalScore += 50; break;
          case "overdue": totalScore += 25; break;
          default: totalScore += 70; break;
        }
      });
      
      healthScores[system] = Math.round(totalScore / systemItems.length);
    });
    
    // Calculate overall health score (average of all systems)
    const systemScores = Object.values(healthScores);
    const overallScore = systemScores.length > 0 
      ? Math.round(systemScores.reduce((sum, score) => sum + score, 0) / systemScores.length)
      : 70;
    
    return {
      overall: overallScore,
      ...healthScores
    };
  },
  
  // Fetch all service data from backend/API
  fetchServiceData: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In the real implementation, you would fetch from your API
      // const response = await fetch('/api/service-records');
      // const data = await response.json();
      
      set({ 
        serviceRecords: initialServiceRecords,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));

// Helper function to determine service types from a service record
function determineServiceTypes(record) {
  const serviceTypes = [];
  
  // Check if type directly matches a common service type
  const commonServiceTypes = [
    "Oil Change", "Brake Fluid Flush", "Air Filter", "Cabin Filter", 
    "Spark Plugs", "Coolant Flush", "Transmission Service", "Brake Pads",
    "Battery", "Belt Service", "Major Service", "Inspection"
  ];
  
  // Look for exact match in service type
  commonServiceTypes.forEach(serviceType => {
    if (record.type.includes(serviceType)) {
      serviceTypes.push(serviceType);
    }
  });
  
  // Check parts replaced for additional clues
  if (record.partsReplaced) {
    record.partsReplaced.forEach(part => {
      const partName = part.name.toLowerCase();
      
      if (partName.includes("oil") && partName.includes("engine")) {
        if (!serviceTypes.includes("Oil Change")) serviceTypes.push("Oil Change");
      }
      
      if (partName.includes("oil filter")) {
        if (!serviceTypes.includes("Oil Change")) serviceTypes.push("Oil Change");
      }
      
      if (partName.includes("air filter") && !partName.includes("cabin")) {
        if (!serviceTypes.includes("Air Filter")) serviceTypes.push("Air Filter");
      }
      
      if (partName.includes("cabin filter") || partName.includes("pollen filter")) {
        if (!serviceTypes.includes("Cabin Filter")) serviceTypes.push("Cabin Filter");
      }
      
      if (partName.includes("spark plug")) {
        if (!serviceTypes.includes("Spark Plugs")) serviceTypes.push("Spark Plugs");
      }
      
      if (partName.includes("brake fluid")) {
        if (!serviceTypes.includes("Brake Fluid Flush")) serviceTypes.push("Brake Fluid Flush");
      }
      
      if (partName.includes("coolant") || partName.includes("antifreeze")) {
        if (!serviceTypes.includes("Coolant Flush")) serviceTypes.push("Coolant Flush");
      }
      
      if (partName.includes("transmission fluid")) {
        if (!serviceTypes.includes("Transmission Service")) serviceTypes.push("Transmission Service");
      }
      
      if (partName.includes("brake pad")) {
        if (!serviceTypes.includes("Brake Pads")) serviceTypes.push("Brake Pads");
      }
      
      if (partName.includes("battery")) {
        if (!serviceTypes.includes("Battery")) serviceTypes.push("Battery");
      }
      
      if (partName.includes("belt")) {
        if (!serviceTypes.includes("Belt Service")) serviceTypes.push("Belt Service");
      }
    });
  }
  
  // If still no service types identified, use the general type
  if (serviceTypes.length === 0) {
    if (record.type.includes("Major") || record.type.includes("Full")) {
      serviceTypes.push("Major Service");
    } else {
      serviceTypes.push("Inspection");
    }
  }
  
  return serviceTypes;
}

// Export a singleton instance of the service data service
const serviceDataService = {
  useServiceStore,
  
  // Additional utility methods
  formatServiceDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  
  // Calculate days since last service
  getDaysSinceLastService: (vehicle) => {
    if (!vehicle || !vehicle.lastService) {
      return null;
    }
    
    const lastServiceDate = new Date(vehicle.lastService);
    const today = new Date();
    const diffTime = Math.abs(today - lastServiceDate);
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
  },
  
  // Get service status description
  getServiceStatusDescription: (vehicle) => {
    if (!vehicle || !vehicle.nextService) {
      return "Unknown service status";
    }
    
    const daysUntilService = serviceDataService.getDaysUntilNextService(vehicle);
    
    if (daysUntilService < 0) {
      return `Service overdue by ${Math.abs(daysUntilService)} days`;
    } else if (daysUntilService === 0) {
      return "Service due today";
    } else if (daysUntilService <= 30) {
      return `Service due in ${daysUntilService} days`;
    } else {
      return `Next service in ${daysUntilService} days`;
    }
  },
  
  // Determine if service status is critical
  isServiceStatusCritical: (vehicle) => {
    if (!vehicle || !vehicle.nextService) {
      return false;
    }
    
    const daysUntilService = serviceDataService.getDaysUntilNextService(vehicle);
    return daysUntilService < 0;
  },
  
  // Determine color for service status
  getServiceStatusColor: (vehicle) => {
    if (!vehicle || !vehicle.nextService) {
      return "gray";
    }
    
    const daysUntilService = serviceDataService.getDaysUntilNextService(vehicle);
    
    if (daysUntilService < 0) {
      return "red";
    } else if (daysUntilService <= 7) {
      return "orange";
    } else if (daysUntilService <= 30) {
      return "yellow";
    } else {
      return "green";
    }
  }
};

export default serviceDataService;