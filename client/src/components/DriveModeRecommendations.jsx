import React from 'react';

/**
 * DriveModeRecommendations - Suggests vehicle drive modes based on weather conditions
 * Provides recommendations for vehicle settings (comfort, sport, eco) based on current surface conditions
 */
function DriveModeRecommendations({ weatherData, selectedVehicle }) {
  if (!weatherData) return null;

  // Extract relevant weather data
  const { 
    current,
    roadConditions = {},
    alerts = []
  } = weatherData;

  // Determine if severe weather is present
  const hasSevereWeather = alerts.some(alert => 
    ['extreme', 'severe'].includes(alert.severity?.toLowerCase() || '')
  );

  // Extract road surface data
  const { 
    surface_grip = 'Good',
    surface_temperature = current?.temp || 0,
    surface_dampness = 'Dry'
  } = roadConditions;

  // Default recommended driving mode
  let recommendedMode = 'Normal';
  let recommendation = 'Standard driving mode suitable for current conditions';
  let safetyAlert = null;
  
  // Helper function to determine grip icon
  const getGripIcon = (gripLevel) => {
    switch (gripLevel.toLowerCase()) {
      case 'excellent': return '🟢';
      case 'good': return '🟢';
      case 'fair': return '🟡';
      case 'reduced': return '🟠';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  // Build recommendation based on conditions
  if (hasSevereWeather) {
    recommendedMode = 'Safety';
    recommendation = 'Prioritize safety in severe weather conditions';
    safetyAlert = 'Extreme caution advised. Consider postponing non-essential travel.';
  } else if (surface_dampness.toLowerCase().includes('wet') || 
             surface_dampness.toLowerCase().includes('damp')) {
    
    if (surface_grip.toLowerCase() === 'poor') {
      recommendedMode = 'Rain';
      recommendation = 'Use wet weather driving mode with traction control fully engaged';
    } else {
      recommendedMode = 'Comfort';
      recommendation = 'Softer suspension settings for better control on wet surfaces';
    }
  } else if (surface_temperature > 90) {
    recommendedMode = 'Eco';
    recommendation = 'Reduce power to prevent overheating and conserve fuel';
  } else if (surface_temperature < 40 && 
             (surface_dampness.toLowerCase().includes('frost') || 
              surface_dampness.toLowerCase().includes('ice'))) {
    recommendedMode = 'Snow/Ice';
    recommendation = 'Maximum traction control for frozen or near-freezing conditions';
    safetyAlert = 'Icy conditions detected. Extreme caution required.';
  } else if (surface_grip.toLowerCase() === 'excellent' && 
             surface_dampness.toLowerCase() === 'dry' && 
             surface_temperature > 50 && 
             surface_temperature < 90) {
    recommendedMode = 'Sport';
    recommendation = 'Optimal conditions for enhanced performance mode';
  }

  // Vehicle-specific adjustments
  if (selectedVehicle) {
    // Special recommendations for specific vehicle types
    if (selectedVehicle.type === 'SUV' && surface_dampness.toLowerCase() !== 'dry') {
      recommendedMode = 'All-Weather';
      recommendation = 'Utilize all-wheel drive capabilities for wet conditions';
    } else if (selectedVehicle.type === 'EV' && surface_temperature < 40) {
      recommendedMode = 'Range';
      recommendation = 'Cold weather affects battery - use range preservation mode';
    } else if (selectedVehicle.type === 'Sports' && 
               surface_dampness.toLowerCase() === 'dry' && 
               recommendedMode === 'Sport') {
      recommendedMode = 'Track';
      recommendation = 'Excellent conditions for maximum performance settings';
    }
  }

  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
        <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
        DRIVE MODE RECOMMENDATIONS
      </h3>
      
      <div className="mb-4">
        <div className="bg-gray-900/60 rounded-md p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Current Surface Conditions:</span>
            <span className="flex items-center text-sm">
              {getGripIcon(surface_grip)} {surface_grip} Grip
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Surface:</span>
            <span className="text-sm">{surface_dampness}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Temperature:</span>
            <span className="text-sm">{surface_temperature}°F</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 rounded-md p-4 mb-3">
          <h4 className="font-semibold mb-1 text-center">Recommended Drive Mode</h4>
          <div className="text-xl font-bold text-center mb-2">{recommendedMode}</div>
          <p className="text-sm text-center text-gray-300">{recommendation}</p>
        </div>
        
        {safetyAlert && (
          <div className="bg-red-900/30 text-red-300 border border-red-700 rounded-md p-3 text-sm">
            <div className="flex items-center mb-1">
              <span className="mr-2">⚠️</span>
              <span className="font-semibold">Safety Alert</span>
            </div>
            <p>{safetyAlert}</p>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-sm font-medium mb-2">Vehicle-Specific Settings</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-gray-400 mb-1">Traction Control</div>
            <div className="font-medium">
              {surface_dampness.toLowerCase() !== 'dry' || surface_grip.toLowerCase() !== 'excellent' 
                ? 'Enabled (Full)' 
                : 'Standard'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Suspension</div>
            <div className="font-medium">
              {recommendedMode === 'Comfort' 
                ? 'Soft' 
                : recommendedMode === 'Sport' || recommendedMode === 'Track' 
                  ? 'Firm' 
                  : 'Standard'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Throttle Response</div>
            <div className="font-medium">
              {recommendedMode === 'Eco' || recommendedMode === 'Safety' || recommendedMode === 'Rain' 
                ? 'Reduced' 
                : recommendedMode === 'Sport' || recommendedMode === 'Track' 
                  ? 'Aggressive' 
                  : 'Normal'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Climate Control</div>
            <div className="font-medium">
              {surface_temperature > 85 
                ? 'Max A/C' 
                : surface_temperature < 40 
                  ? 'Heat + Defrost' 
                  : 'Comfort'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriveModeRecommendations;