// OpenWeather API service
const API_KEY = "2379a18ee0e478c88aa7d4aa1df44410";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Get current weather data for a location using local proxy
export const getWeatherData = async (location: { lat: number; lon: number }, units: 'metric' | 'imperial' = 'imperial') => {
  const response = await fetch(
    `/api/weather?lat=${location.lat}&lon=${location.lon}&units=${units}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  return await response.json();
};

// Get one call weather data (current, hourly, daily forecasts) using local proxy
export const getOneCallData = async (location: { lat: number; lon: number }, units: 'metric' | 'imperial' = 'imperial') => {
  const response = await fetch(
    `/api/onecall?lat=${location.lat}&lon=${location.lon}&units=${units}&exclude=minutely`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch one call data');
  }
  
  return await response.json();
};

// Format temperature with unit
export const formatTemperature = (temp: number, units: 'metric' | 'imperial' = 'imperial'): string => {
  const unit = units === 'imperial' ? '°F' : '°C';
  return `${Math.round(temp)}${unit}`;
};

// Utility functions for automotive weather analytics
export const calculateSurfaceTemperature = (airTemp: number, sunIntensity: number): number => {
  // Simple model: surface temp is air temp + adjustment based on sun intensity
  // Sun intensity should be 0-1 where 0 is night/cloudy and 1 is full sun
  const surfaceAdjustment = sunIntensity * 15; // Up to 15 degrees hotter in full sun
  return airTemp + surfaceAdjustment;
};

export const estimateTireWarmupTime = (
  airTemp: number, 
  surfaceTemp: number, 
  tireType: 'summer' | 'sport' | 'winter' | 'all-season' = 'summer'
): number => {
  // Base time in minutes
  let baseTime = 10;
  
  // Adjust for tire type
  if (tireType === 'summer') baseTime = 8;
  if (tireType === 'sport') baseTime = 6;
  if (tireType === 'winter') baseTime = 12;
  if (tireType === 'all-season') baseTime = 10;
  
  // Adjust for temperature
  if (airTemp < 50) {
    // Colder air increases warm-up time
    baseTime += Math.max(0, (50 - airTemp) / 5);
  } else if (airTemp > 80) {
    // Warmer air decreases warm-up time
    baseTime -= Math.min(baseTime / 2, (airTemp - 80) / 10);
  }
  
  // Surface temperature effect
  if (surfaceTemp > airTemp + 10) {
    // Hot surface helps tires warm up faster
    baseTime -= Math.min(baseTime / 3, (surfaceTemp - airTemp) / 15);
  }
  
  return Math.max(2, Math.round(baseTime));
};

export const estimateGripLevel = (
  airTemp: number,
  surfaceTemp: number,
  humidity: number,
  precipProbability: number,
  tireType: 'summer' | 'sport' | 'winter' | 'all-season' = 'summer'
): string => {
  // Base grip score (0-100)
  let gripScore = 80;
  
  // Temperature effects
  if (tireType === 'summer' || tireType === 'sport') {
    // Summer/sport tires perform best in warmer conditions
    if (airTemp < 45) gripScore -= 30;
    else if (airTemp < 60) gripScore -= 15;
    else if (airTemp > 80) gripScore += 5;
  } else if (tireType === 'winter') {
    // Winter tires perform best in colder conditions
    if (airTemp > 60) gripScore -= 25;
    else if (airTemp < 32) gripScore += 10;
  }
  
  // Surface temperature
  const idealSurfaceTemp = tireType === 'winter' ? 40 : 85;
  gripScore -= Math.min(20, Math.abs(surfaceTemp - idealSurfaceTemp) / 3);
  
  // Humidity effects (high humidity can reduce grip slightly)
  if (humidity > 80) {
    gripScore -= 5;
  }
  
  // Precipitation has major negative effect
  if (precipProbability > 0.3) {
    gripScore -= 30 * precipProbability;
  }
  
  // Convert numerical score to descriptive rating
  if (gripScore >= 85) return 'Excellent';
  if (gripScore >= 70) return 'Good';
  if (gripScore >= 50) return 'Moderate';
  if (gripScore >= 30) return 'Poor';
  return 'Dangerous';
};

// Estimate optimal torque settings for performance driving
export const getOptimalTorqueSetting = (
  carModel: string,
  surfaceTemp: number,
  surfaceCondition: string
): number => {
  // Default base torque (ft-lb)
  let baseTorque = 100;
  
  // Brand/model specific defaults
  if (carModel.toLowerCase().includes('ferrari')) {
    baseTorque = 96;
  } else if (carModel.toLowerCase().includes('porsche')) {
    baseTorque = 92;
  } else if (carModel.toLowerCase().includes('lamborghini')) {
    baseTorque = 98;
  }
  
  // Surface temperature adjustments
  if (surfaceTemp < 60) {
    // Reduce torque in colder conditions
    baseTorque = Math.round(baseTorque * 0.85);
  } else if (surfaceTemp > 100) {
    // Reduce torque in very hot conditions
    baseTorque = Math.round(baseTorque * 0.9);
  }
  
  // Surface condition adjustments
  if (surfaceCondition.toLowerCase().includes('wet')) {
    baseTorque = Math.round(baseTorque * 0.7);
  } else if (surfaceCondition.toLowerCase().includes('damp')) {
    baseTorque = Math.round(baseTorque * 0.8);
  }
  
  return baseTorque;
};