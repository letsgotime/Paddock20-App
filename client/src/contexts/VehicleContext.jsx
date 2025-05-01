import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the vehicle context
export const VehicleContext = createContext();

// Custom hook to use the vehicle context
export const useVehicles = () => useContext(VehicleContext);

// Vehicle types
export const vehicleTypes = [
  { id: 'sedan', label: 'Sedan', icon: '🚗' },
  { id: 'suv', label: 'SUV', icon: '🚙' },
  { id: 'sports', label: 'Sports Car', icon: '🏎️' },
  { id: 'truck', label: 'Truck', icon: '🚚' },
  { id: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { id: 'ev', label: 'Electric Vehicle', icon: '⚡' },
  { id: 'convertible', label: 'Convertible', icon: '🚙' },
  { id: 'luxury', label: 'Luxury', icon: '✨' },
  { id: 'classic', label: 'Classic', icon: '🏆' },
  { id: 'other', label: 'Other', icon: '🚘' }
];

// Vehicle Provider component
export const VehicleProvider = ({ children }) => {
  // State for saved vehicles
  const [vehicles, setVehicles] = useState(() => {
    const savedVehicles = localStorage.getItem('savedVehicles');
    return savedVehicles ? JSON.parse(savedVehicles) : [
      // Default vehicles
      {
        id: 1,
        name: "Ferrari 488 GTB",
        year: 2020,
        type: "sports",
        image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
        engine: {
          type: "V8 Twin-Turbo",
          displacement: "3.9L",
          power: "661 hp",
          torque: "561 lb-ft",
          aspiration: "Twin-Turbocharged",
          redline: "8,000 RPM",
          temperature_range: "180-220°F"
        },
        tireData: {
          optimum_pressure_front: 35.0,
          optimum_pressure_rear: 32.5,
          wear_factor: 1.25,
          preferred_compound: "Soft"
        },
        favorite: true
      },
      {
        id: 2,
        name: "Porsche 911 GT3",
        year: 2021,
        type: "sports",
        image: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
        engine: {
          type: "Flat-6",
          displacement: "4.0L",
          power: "502 hp",
          torque: "346 lb-ft",
          aspiration: "Naturally Aspirated",
          redline: "9,000 RPM",
          temperature_range: "185-225°F"
        },
        tireData: {
          optimum_pressure_front: 36.0,
          optimum_pressure_rear: 33.0,
          wear_factor: 1.1,
          preferred_compound: "Medium"
        },
        favorite: true
      },
      {
        id: 3,
        name: "Daily Driver Sedan",
        year: 2019,
        type: "sedan",
        image: "",
        engine: {
          type: "Inline-4",
          displacement: "2.0L",
          power: "220 hp",
          torque: "258 lb-ft",
          aspiration: "Turbocharged",
          redline: "6,500 RPM",
          temperature_range: "180-210°F"
        },
        tireData: {
          optimum_pressure_front: 33.0,
          optimum_pressure_rear: 33.0,
          wear_factor: 1.0,
          preferred_compound: "All-Season"
        },
        favorite: true
      }
    ];
  });
  
  // Currently selected vehicle
  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    const lastSelectedId = localStorage.getItem('lastSelectedVehicleId');
    if (lastSelectedId) {
      // Find the vehicle with the saved ID
      const vehicles = JSON.parse(localStorage.getItem('savedVehicles') || '[]');
      return vehicles.find(v => v.id === parseInt(lastSelectedId)) || null;
    }
    return null;
  });
  
  // Save vehicles to localStorage when they change
  useEffect(() => {
    localStorage.setItem('savedVehicles', JSON.stringify(vehicles));
  }, [vehicles]);
  
  // Save selected vehicle ID when it changes
  useEffect(() => {
    if (selectedVehicle) {
      localStorage.setItem('lastSelectedVehicleId', selectedVehicle.id);
    }
  }, [selectedVehicle]);
  
  // Set default vehicle on first load if none is selected
  useEffect(() => {
    if (!selectedVehicle && vehicles.length > 0) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [selectedVehicle, vehicles]);
  
  // Add a new vehicle
  const addVehicle = (newVehicle) => {
    const id = Date.now();
    setVehicles(prev => [...prev, { ...newVehicle, id }]);
    return id;
  };
  
  // Update an existing vehicle
  const updateVehicle = (id, updatedData) => {
    setVehicles(prev => {
      const updated = prev.map(vehicle => 
        vehicle.id === id ? { ...vehicle, ...updatedData } : vehicle
      );
      
      // If the updated vehicle is the selected one, update the selected vehicle
      if (selectedVehicle && selectedVehicle.id === id) {
        const updatedVehicle = updated.find(v => v.id === id);
        setSelectedVehicle(updatedVehicle);
      }
      
      return updated;
    });
  };
  
  // Remove a vehicle
  const removeVehicle = (id) => {
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    
    // If removing the selected vehicle, select another one
    if (selectedVehicle && selectedVehicle.id === id) {
      setSelectedVehicle(vehicles.find(v => v.id !== id) || null);
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = (id) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === id ? { ...vehicle, favorite: !vehicle.favorite } : vehicle
    ));
  };
  
  // Get favorite vehicles
  const getFavoriteVehicles = () => {
    return vehicles.filter(vehicle => vehicle.favorite);
  };
  
  // Get vehicle icon
  const getVehicleIcon = (type) => {
    const vehicleType = vehicleTypes.find(t => t.id === type);
    return vehicleType ? vehicleType.icon : '🚗';
  };
  
  // Calculate weather-adjusted tire data
  const getWeatherAdjustedTireData = (vehicleId, weatherData) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !weatherData) return null;
    
    const { tireData } = vehicle;
    const { drivingConditions } = weatherData;
    
    // Calculate adjusted tire pressures based on temperature
    const tempAdjustmentFactor = (drivingConditions.track_temp - 70) * 0.01; // 1% adjustment per 10°F difference from 70°F
    const rainAdjustmentFactor = weatherData.currentConditions.weather[0].main.toLowerCase().includes('rain') ? -0.05 : 0;
    
    return {
      front_pressure: Math.round((tireData.optimum_pressure_front * (1 + tempAdjustmentFactor + rainAdjustmentFactor)) * 10) / 10,
      rear_pressure: Math.round((tireData.optimum_pressure_rear * (1 + tempAdjustmentFactor + rainAdjustmentFactor)) * 10) / 10,
      compound_recommendation: getCompoundRecommendation(tireData.preferred_compound, weatherData),
      grip_level: calculateGripLevel(tireData, weatherData),
      wear_rate: calculateWearRate(tireData.wear_factor, weatherData)
    };
  };
  
  // Helper function to recommend tire compound based on weather
  const getCompoundRecommendation = (preferred, weatherData) => {
    const { currentConditions, drivingConditions } = weatherData;
    const isRaining = currentConditions.weather[0].main.toLowerCase().includes('rain');
    const isSnowing = currentConditions.weather[0].main.toLowerCase().includes('snow');
    const isCold = drivingConditions.track_temp < 50;
    const isHot = drivingConditions.track_temp > 90;
    
    if (isSnowing) return "Winter/Snow";
    if (isRaining) return "Wet";
    if (isCold) return preferred === "Soft" ? "Medium" : preferred;
    if (isHot) return preferred === "Soft" ? "Medium" : preferred;
    return preferred;
  };
  
  // Helper function to calculate grip level
  const calculateGripLevel = (tireData, weatherData) => {
    const { drivingConditions } = weatherData;
    const baseGrip = drivingConditions.grip_index;
    
    // Adjust based on tire wear factor
    const wearAdjustment = (tireData.wear_factor - 1) * 10;
    
    return Math.min(100, Math.max(0, baseGrip - wearAdjustment));
  };
  
  // Helper function to calculate wear rate
  const calculateWearRate = (wearFactor, weatherData) => {
    const { drivingConditions } = weatherData;
    
    // Base value from weather
    let wearRate = 1.0;
    
    // Adjust for surface temperature
    if (drivingConditions.track_temp > 100) wearRate *= 1.3;
    else if (drivingConditions.track_temp > 85) wearRate *= 1.1;
    else if (drivingConditions.track_temp < 40) wearRate *= 0.9;
    
    // Adjust for grip level
    if (drivingConditions.grip_index < 60) wearRate *= 1.2;
    
    // Apply vehicle-specific wear factor
    wearRate *= wearFactor;
    
    return Math.round(wearRate * 100) / 100;
  };
  
  // Context value
  const contextValue = {
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
    addVehicle,
    updateVehicle,
    removeVehicle,
    toggleFavorite,
    getFavoriteVehicles,
    getVehicleIcon,
    vehicleTypes,
    getWeatherAdjustedTireData
  };
  
  return (
    <VehicleContext.Provider value={contextValue}>
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;