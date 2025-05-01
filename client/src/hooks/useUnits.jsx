import { useContext } from 'react';
import { UnitsContext } from '../contexts/UnitsContext';

/**
 * Custom hook for accessing units context
 * @returns {Object} Units context with unit preferences and conversion utilities 
 */
export function useUnits() {
  const context = useContext(UnitsContext);
  
  if (!context) {
    throw new Error('useUnits must be used within a UnitsProvider');
  }
  
  return context;
}