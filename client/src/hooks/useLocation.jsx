import { useContext } from 'react';
import { LocationContext } from '../contexts/LocationContext';

/**
 * Custom hook for accessing location context
 * @returns {Object} Location context with active location and saved locations
 */
export function useLocation() {
  const context = useContext(LocationContext);
  
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  
  return context;
}