import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the units context
export const UnitsContext = createContext();

// Units constants
export const UNIT_SYSTEMS = {
  METRIC: 'metric',
  IMPERIAL: 'imperial'
};

// Custom hook to use the units context
export const useUnits = () => useContext(UnitsContext);

// Units Provider component
export const UnitsProvider = ({ children }) => {
  // State for unit system preference (default to imperial for US audience)
  const [unitSystem, setUnitSystem] = useState(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem');
    return savedUnitSystem ? savedUnitSystem : UNIT_SYSTEMS.IMPERIAL;
  });
  
  // Save unit system preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('unitSystem', unitSystem);
  }, [unitSystem]);
  
  // Convert temperature functions
  const convertTemp = (temp, from = UNIT_SYSTEMS.METRIC, to = UNIT_SYSTEMS.IMPERIAL) => {
    if (from === to) return temp;
    
    if (from === UNIT_SYSTEMS.METRIC && to === UNIT_SYSTEMS.IMPERIAL) {
      // Celsius to Fahrenheit
      return (temp * 9/5) + 32;
    } else {
      // Fahrenheit to Celsius
      return (temp - 32) * 5/9;
    }
  };
  
  // Convert speed functions
  const convertSpeed = (speed, from = UNIT_SYSTEMS.METRIC, to = UNIT_SYSTEMS.IMPERIAL) => {
    if (from === to) return speed;
    
    if (from === UNIT_SYSTEMS.METRIC && to === UNIT_SYSTEMS.IMPERIAL) {
      // KPH to MPH
      return speed * 0.621371;
    } else {
      // MPH to KPH
      return speed * 1.60934;
    }
  };
  
  // Convert distance functions
  const convertDistance = (distance, from = UNIT_SYSTEMS.METRIC, to = UNIT_SYSTEMS.IMPERIAL) => {
    if (from === to) return distance;
    
    if (from === UNIT_SYSTEMS.METRIC && to === UNIT_SYSTEMS.IMPERIAL) {
      // Kilometers to Miles
      return distance * 0.621371;
    } else {
      // Miles to Kilometers
      return distance * 1.60934;
    }
  };
  
  // Convert pressure
  const convertPressure = (pressure, from = UNIT_SYSTEMS.METRIC, to = UNIT_SYSTEMS.IMPERIAL) => {
    if (from === to) return pressure;
    
    if (from === UNIT_SYSTEMS.METRIC && to === UNIT_SYSTEMS.IMPERIAL) {
      // hPa to inHg
      return pressure * 0.02953;
    } else {
      // inHg to hPa
      return pressure * 33.8639;
    }
  };
  
  // Format temperature with unit
  const formatTemp = (temp, includeUnit = true) => {
    const rounded = Math.round(temp);
    return includeUnit 
      ? `${rounded}°${unitSystem === UNIT_SYSTEMS.IMPERIAL ? 'F' : 'C'}`
      : `${rounded}°`;
  };
  
  // Format speed with unit
  const formatSpeed = (speed, includeUnit = true) => {
    const rounded = Math.round(speed);
    return includeUnit 
      ? `${rounded} ${unitSystem === UNIT_SYSTEMS.IMPERIAL ? 'mph' : 'km/h'}`
      : `${rounded}`;
  };
  
  // Format distance with unit
  const formatDistance = (distance, includeUnit = true) => {
    // If small distance, show in feet/meters instead
    if (unitSystem === UNIT_SYSTEMS.IMPERIAL && distance < 0.1) {
      const feet = Math.round(distance * 5280);
      return includeUnit ? `${feet} ft` : `${feet}`;
    } else if (unitSystem === UNIT_SYSTEMS.METRIC && distance < 0.1) {
      const meters = Math.round(distance * 1000);
      return includeUnit ? `${meters} m` : `${meters}`;
    }
    
    // Otherwise show in miles/km with one decimal place
    const rounded = Math.round(distance * 10) / 10;
    return includeUnit 
      ? `${rounded} ${unitSystem === UNIT_SYSTEMS.IMPERIAL ? 'mi' : 'km'}`
      : `${rounded}`;
  };
  
  // Format pressure with unit
  const formatPressure = (pressure, includeUnit = true) => {
    if (unitSystem === UNIT_SYSTEMS.IMPERIAL) {
      const inHg = (pressure * 0.02953).toFixed(2);
      return includeUnit ? `${inHg} inHg` : `${inHg}`;
    } else {
      const hPa = Math.round(pressure);
      return includeUnit ? `${hPa} hPa` : `${hPa}`;
    }
  };
  
  // Context value
  const contextValue = {
    unitSystem,
    setUnitSystem,
    UNIT_SYSTEMS,
    convertTemp,
    convertSpeed,
    convertDistance,
    convertPressure,
    formatTemp,
    formatSpeed,
    formatDistance,
    formatPressure
  };
  
  return (
    <UnitsContext.Provider value={contextValue}>
      {children}
    </UnitsContext.Provider>
  );
};

export default UnitsProvider;