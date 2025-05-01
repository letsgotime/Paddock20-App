import React from 'react';
import { useUnits } from '../hooks/useUnits';

/**
 * UnitToggle - Toggles between imperial and metric units
 */
const UnitToggle = () => {
  const { units, toggleUnits } = useUnits();
  
  return (
    <div className="flex items-center text-xs">
      <button
        className={`px-2 py-1 rounded-l-md transition-colors ${
          units === 'imperial' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-400 hover:text-white'
        }`}
        onClick={() => toggleUnits('imperial')}
        aria-label="Use Imperial units"
      >
        °F
      </button>
      <button
        className={`px-2 py-1 rounded-r-md transition-colors ${
          units === 'metric' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-400 hover:text-white'
        }`}
        onClick={() => toggleUnits('metric')}
        aria-label="Use Metric units"
      >
        °C
      </button>
    </div>
  );
};

export default UnitToggle;