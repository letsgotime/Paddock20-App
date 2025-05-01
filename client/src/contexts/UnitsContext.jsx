import React, { createContext, useState, useEffect } from 'react';

// Create Units Context
export const UnitsContext = createContext();

/**
 * Units Provider - manages temperature, speed, and distance units
 */
export const UnitsProvider = ({ children }) => {
  // State for units (imperial or metric)
  const [units, setUnits] = useState('imperial'); // Default to imperial (°F, mph, etc.)
  
  // Load units preference from localStorage on mount
  useEffect(() => {
    const savedUnits = localStorage.getItem('units_preference');
    if (savedUnits) {
      setUnits(savedUnits);
    }
  }, []);
  
  // Save units preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem('units_preference', units);
  }, [units]);
  
  // Function to switch units
  const toggleUnits = (newUnits) => {
    if (newUnits && (newUnits === 'imperial' || newUnits === 'metric')) {
      setUnits(newUnits);
    } else {
      // Toggle between imperial and metric
      setUnits(prevUnits => prevUnits === 'imperial' ? 'metric' : 'imperial');
    }
  };
  
  // Get temperature suffix based on current units
  const getTemperatureSuffix = () => {
    return units === 'imperial' ? '°F' : '°C';
  };
  
  // Get speed suffix based on current units
  const getSpeedSuffix = () => {
    return units === 'imperial' ? 'mph' : 'km/h';
  };
  
  // Get distance suffix based on current units
  const getDistanceSuffix = (distance) => {
    if (units === 'imperial') {
      return distance === 1 ? 'mile' : 'miles';
    } else {
      return distance === 1 ? 'km' : 'km';
    }
  };
  
  // Convert temperature between units
  const convertTemperature = (value, targetUnit) => {
    // If target unit is the same as current units, return the value
    if (!targetUnit || targetUnit === units) {
      return value;
    }
    
    // Convert from imperial to metric (F to C)
    if (units === 'imperial' && targetUnit === 'metric') {
      return (value - 32) * 5 / 9;
    }
    
    // Convert from metric to imperial (C to F)
    if (units === 'metric' && targetUnit === 'imperial') {
      return (value * 9 / 5) + 32;
    }
    
    return value;
  };
  
  // Convert speed between units
  const convertSpeed = (value, targetUnit) => {
    // If target unit is the same as current units, return the value
    if (!targetUnit || targetUnit === units) {
      return value;
    }
    
    // Convert from imperial to metric (mph to km/h)
    if (units === 'imperial' && targetUnit === 'metric') {
      return value * 1.60934;
    }
    
    // Convert from metric to imperial (km/h to mph)
    if (units === 'metric' && targetUnit === 'imperial') {
      return value * 0.621371;
    }
    
    return value;
  };
  
  // Convert distance between units
  const convertDistance = (value, targetUnit) => {
    // If target unit is the same as current units, return the value
    if (!targetUnit || targetUnit === units) {
      return value;
    }
    
    // Convert from imperial to metric (miles to km)
    if (units === 'imperial' && targetUnit === 'metric') {
      return value * 1.60934;
    }
    
    // Convert from metric to imperial (km to miles)
    if (units === 'metric' && targetUnit === 'imperial') {
      return value * 0.621371;
    }
    
    return value;
  };
  
  // Format temperature with appropriate units
  const formatTemperature = (value, options = {}) => {
    const { decimals = 0, includeUnits = true } = options;
    const rounded = Number(value).toFixed(decimals);
    
    if (includeUnits) {
      return `${rounded}${getTemperatureSuffix()}`;
    }
    
    return rounded;
  };
  
  // Format speed with appropriate units
  const formatSpeed = (value, options = {}) => {
    const { decimals = 0, includeUnits = true } = options;
    const rounded = Number(value).toFixed(decimals);
    
    if (includeUnits) {
      return `${rounded} ${getSpeedSuffix()}`;
    }
    
    return rounded;
  };
  
  // Format distance with appropriate units
  const formatDistance = (value, options = {}) => {
    const { decimals = 1, includeUnits = true } = options;
    const rounded = Number(value).toFixed(decimals);
    
    if (includeUnits) {
      return `${rounded} ${getDistanceSuffix(value)}`;
    }
    
    return rounded;
  };
  
  // Context value
  const value = {
    units,
    toggleUnits,
    getTemperatureSuffix,
    getSpeedSuffix,
    getDistanceSuffix,
    convertTemperature,
    convertSpeed,
    convertDistance,
    formatTemperature,
    formatSpeed,
    formatDistance
  };
  
  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  );
};