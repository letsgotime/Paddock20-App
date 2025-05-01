import { useContext } from 'react';
import { WeatherContext } from '../contexts/WeatherContext';

/**
 * Custom hook for accessing weather context
 * @returns {Object} Weather context with current weather and associated functionality
 */
export function useWeather() {
  const context = useContext(WeatherContext);
  
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  
  return context;
}