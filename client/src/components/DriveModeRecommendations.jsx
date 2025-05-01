import React from 'react';
import { BarChart2, Droplets, Gauge, Wind, Thermometer } from 'lucide-react';
import ExpandableTile from './common/ExpandableTile';
import { RegisterTile } from '../utils/TileRegistry';
import { useTileSystem } from '../contexts/TileContext';

/**
 * DriveModeRecommendations - Suggests vehicle drive modes based on weather conditions
 * Provides recommendations for vehicle settings (comfort, sport, eco) based on current surface conditions
 * Includes expandable/toggleable interface for maximum API flexing
 */
function DriveModeRecommendations({ weatherData, selectedVehicle }) {
  // Define the tile ID for registration and navigation
  const tileId = 'drive-mode-recommendations';
  
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

  // Get additional data for expanded view
  const wind = weatherData?.current?.wind_speed || 0;
  const gust = weatherData?.current?.wind_gust || 0;
  const humidity = weatherData?.current?.humidity || 0;
  const precipitation = weatherData?.hourly?.[0]?.pop || 0;
  
  // Generate performance index based on conditions
  const performanceIndex = {
    acceleration: surface_grip.toLowerCase() === 'excellent' ? 100 : 
                  surface_grip.toLowerCase() === 'good' ? 90 :
                  surface_grip.toLowerCase() === 'fair' ? 75 :
                  surface_grip.toLowerCase() === 'reduced' ? 60 : 40,
    braking: surface_grip.toLowerCase() === 'excellent' ? 100 : 
             surface_grip.toLowerCase() === 'good' ? 90 :
             surface_grip.toLowerCase() === 'fair' ? 75 :
             surface_grip.toLowerCase() === 'reduced' ? 55 : 30,
    cornering: surface_grip.toLowerCase() === 'excellent' ? 100 : 
               surface_grip.toLowerCase() === 'good' ? 85 :
               surface_grip.toLowerCase() === 'fair' ? 70 :
               surface_grip.toLowerCase() === 'reduced' ? 50 : 25,
    efficiency: recommendedMode === 'Eco' ? 95 :
                recommendedMode === 'Normal' ? 80 :
                recommendedMode === 'Sport' ? 65 :
                recommendedMode === 'Track' ? 40 : 75
  };
  
  // Data for tire wear model
  const tireWearFactors = {
    temperature: surface_temperature > 100 ? 1.5 : 
                 surface_temperature > 85 ? 1.3 : 
                 surface_temperature > 70 ? 1.0 : 
                 surface_temperature > 40 ? 0.9 : 1.2,
    surface: surface_dampness.toLowerCase().includes('wet') ? 0.8 :
             surface_dampness.toLowerCase().includes('damp') ? 0.9 : 1.0,
    drivingStyle: recommendedMode === 'Sport' || recommendedMode === 'Track' ? 1.5 :
                  recommendedMode === 'Normal' ? 1.0 : 0.8
  };
  
  // Create combined wear factor
  const combinedWearFactor = tireWearFactors.temperature * tireWearFactors.surface * tireWearFactors.drivingStyle;
  
  // Create tile tabs for fullscreen view
  const driveTabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 rounded-md p-4">
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
            
            <div className="bg-gray-900/60 rounded-md p-3">
              <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Surface Analysis</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center text-sm">
                    <Gauge className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-gray-400">Grip Status:</span>
                  </span>
                  <span className="flex items-center text-sm">
                    {getGripIcon(surface_grip)} <span className="ml-1">{surface_grip}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center text-sm">
                    <Droplets className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-gray-400">Surface Condition:</span>
                  </span>
                  <span className="text-sm">{surface_dampness}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center text-sm">
                    <Thermometer className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-gray-400">Surface Temp:</span>
                  </span>
                  <span className="text-sm">{surface_temperature}°F</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center text-sm">
                    <Wind className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-gray-400">Wind Effect:</span>
                  </span>
                  <span className="text-sm">
                    {wind < 5 ? 'Minimal' : wind < 15 ? 'Moderate' : 'Significant'} 
                    {gust > wind*1.5 ? ' (Gusting)' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm">
                    <BarChart2 className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-gray-400">Precipitation:</span>
                  </span>
                  <span className="text-sm">{Math.round(precipitation * 100)}% chance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'telemetry',
      label: 'Telemetry',
      content: (
        <div className="bg-gray-900/60 rounded-md p-4">
          <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Vehicle Performance Impact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-medium mb-2 text-blue-400">Key Performance Indicators</h5>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Acceleration</span>
                    <span>{performanceIndex.acceleration}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${performanceIndex.acceleration}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Braking</span>
                    <span>{performanceIndex.braking}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-red-500 h-1.5 rounded-full" 
                      style={{ width: `${performanceIndex.braking}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Cornering</span>
                    <span>{performanceIndex.cornering}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${performanceIndex.cornering}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Efficiency</span>
                    <span>{performanceIndex.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-teal-500 h-1.5 rounded-full" 
                      style={{ width: `${performanceIndex.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tires',
      label: 'Tire Strategy',
      content: (
        <div className="bg-gray-900/60 rounded-md p-4">
          <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Tire Wear Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-medium mb-2 text-blue-400">Current Wear Factors</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Temperature Impact:</span>
                  <span className={tireWearFactors.temperature > 1 ? 'text-orange-400' : 'text-green-400'}>
                    {tireWearFactors.temperature > 1 ? '+' : ''}{Math.round((tireWearFactors.temperature - 1) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Surface Impact:</span>
                  <span className={tireWearFactors.surface < 1 ? 'text-green-400' : 'text-orange-400'}>
                    {tireWearFactors.surface < 1 ? '' : '+'}{Math.round((tireWearFactors.surface - 1) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Driving Style Impact:</span>
                  <span className={tireWearFactors.drivingStyle > 1 ? 'text-orange-400' : 'text-green-400'}>
                    {tireWearFactors.drivingStyle > 1 ? '+' : ''}{Math.round((tireWearFactors.drivingStyle - 1) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium pt-1 border-t border-gray-700">
                  <span>Combined Wear Factor:</span>
                  <span className={combinedWearFactor > 1 ? 'text-orange-400' : 'text-green-400'}>
                    {combinedWearFactor > 1 ? '+' : ''}{Math.round((combinedWearFactor - 1) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <div className="bg-gray-900/60 rounded-md p-4">
          <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Vehicle Settings Recommendations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-medium mb-2 text-blue-400">Recommended Settings</h5>
              <div className="space-y-3">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Traction Control</span>
                    <span className="text-blue-400">
                      {surface_grip.toLowerCase() === 'poor' || surface_grip.toLowerCase() === 'reduced' ? 'ON (High)' : 
                       surface_grip.toLowerCase() === 'fair' ? 'ON (Medium)' : 'ON (Low)'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {surface_grip.toLowerCase() === 'poor' ? 'Maximum intervention recommended for safety' :
                     surface_dampness.toLowerCase().includes('wet') ? 'Enhanced traction control for wet conditions' : 
                     'Standard setting appropriate for current conditions'}
                  </p>
                </div>
                
                <div className="bg-gray-800 p-2 rounded">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Suspension</span>
                    <span className="text-blue-400">
                      {surface_dampness.toLowerCase().includes('wet') ? 'Comfort' : 
                       recommendedMode === 'Sport' || recommendedMode === 'Track' ? 'Sport' : 'Normal'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {surface_dampness.toLowerCase().includes('wet') ? 'Softer setting for better traction on wet surfaces' :
                     recommendedMode === 'Sport' ? 'Firmer setting for improved handling in dry conditions' : 
                     'Balanced setting for current conditions'}
                  </p>
                </div>
                
                <div className="bg-gray-800 p-2 rounded">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Throttle Response</span>
                    <span className="text-blue-400">
                      {surface_grip.toLowerCase() === 'poor' || surface_dampness.toLowerCase().includes('wet') ? 'Gradual' : 
                       recommendedMode === 'Sport' || recommendedMode === 'Track' ? 'Sharp' : 'Standard'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {surface_grip.toLowerCase() === 'poor' ? 'Smoother power delivery for reduced wheel slip' :
                     recommendedMode === 'Sport' ? 'Responsive throttle for performance driving' : 
                     'Standard mapping for balanced control'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];
  
  // Prepare the collapsed preview content
  const collapsedContent = (
    <div className="cursor-pointer">
      <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 rounded-md p-4 mb-3">
        <h4 className="font-semibold mb-1 text-center">Recommended Drive Mode</h4>
        <div className="text-xl font-bold text-center mb-2">{recommendedMode}</div>
        <p className="text-sm text-center text-gray-300">{recommendation}</p>
      </div>
      
      <div className="flex items-center justify-between bg-gray-900/60 rounded-md p-3 mb-3">
        <div className="flex items-center">
          <span className="text-sm mr-2">{getGripIcon(surface_grip)}</span>
          <span className="text-sm">{surface_grip} Grip</span>
        </div>
        <div className="text-sm">{surface_dampness}, {surface_temperature}°F</div>
      </div>
      
      {safetyAlert && (
        <div className="bg-red-900/30 text-red-300 border border-red-700 rounded-md p-3 text-sm mb-3">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span className="font-semibold">{safetyAlert}</span>
          </div>
        </div>
      )}
      
      <div className="text-center text-xs text-blue-400 hover:text-blue-300">
        Click to view detailed vehicle performance analytics
      </div>
    </div>
  );
  
  // Basic expanded content (more details but not full screen)
  const expandedContent = (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 rounded-md p-4">
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
        
        <div className="bg-gray-900/60 rounded-md p-3">
          <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Performance Conditions</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center text-sm">
                <Gauge className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-gray-400">Grip Status:</span>
              </span>
              <span className="flex items-center text-sm">
                {getGripIcon(surface_grip)} <span className="ml-1">{surface_grip}</span>
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center text-sm">
                <Droplets className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-gray-400">Surface Condition:</span>
              </span>
              <span className="text-sm">{surface_dampness}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center text-sm">
                <Thermometer className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-gray-400">Surface Temp:</span>
              </span>
              <span className="text-sm">{surface_temperature}°F</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-blue-400 hover:text-blue-300">
        Enter fullscreen mode for complete F1-style telemetry
      </div>
    </div>
  );
  
  // Register this tile for navigation
  return (
    <>
      <RegisterTile 
        id={tileId}
        title="Drive Mode Recommendations"
        order={2}
      />
      
      <ExpandableTile
        id={tileId}
        title="Drive Mode Recommendations"
        color="green-500"
        tabs={driveTabs}
      >
        {collapsedContent}
        {expandedContent}
      </ExpandableTile>
    </>
  );
}

export default DriveModeRecommendations;