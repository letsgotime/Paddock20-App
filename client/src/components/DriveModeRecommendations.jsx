import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, BarChart2, Droplets, Gauge, Wind, Thermometer, Compass } from 'lucide-react';

/**
 * DriveModeRecommendations - Suggests vehicle drive modes based on weather conditions
 * Provides recommendations for vehicle settings (comfort, sport, eco) based on current surface conditions
 * Includes expandable/toggleable interface for maximum API flexing
 */
function DriveModeRecommendations({ weatherData, selectedVehicle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
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
  const pressure = weatherData?.current?.pressure || 0;
  const visibility = weatherData?.current?.visibility || 10000;
  const visibilityMiles = Math.round((visibility / 1609) * 10) / 10;
  const dew_point = weatherData?.current?.dew_point || 0;
  const uvi = weatherData?.current?.uvi || 0;
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
  
  // Full-screen styles to be applied conditionally
  const fullscreenStyles = isFullscreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 50,
    overflowY: 'auto',
    borderRadius: 0,
    padding: '1.5rem'
  } : {};
  
  return (
    <div 
      className={`bg-gray-800/80 rounded-lg border border-gray-700 p-4 transition-all duration-300 ${isFullscreen ? 'bg-gray-900' : ''}`}
      style={fullscreenStyles}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
          DRIVE MODE RECOMMENDATIONS
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      
      {/* Preview/collapsed view */}
      {!isExpanded && !isFullscreen && (
        <div className="cursor-pointer" onClick={() => setIsExpanded(true)}>
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
      )}
      
      {/* Expanded or fullscreen view */}
      {(isExpanded || isFullscreen) && (
        <>
          {/* Tab navigation */}
          <div className="flex border-b border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'telemetry' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Telemetry
            </button>
            <button
              onClick={() => setActiveTab('tires')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'tires' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Tire Strategy
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Settings
            </button>
          </div>
          
          {/* Tab content */}
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <>
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
                
                <div className="bg-gray-900/60 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Vehicle Performance Impact</h4>
                  <div className="grid grid-cols-2 gap-4">
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
                              className="bg-yellow-500 h-1.5 rounded-full" 
                              style={{ width: `${performanceIndex.efficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium mb-2 text-blue-400">Environmental Factors</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Visibility:</span>
                          <span>{visibilityMiles < 1 ? 'Poor' : visibilityMiles < 3 ? 'Moderate' : 'Good'} ({visibilityMiles} mi)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Humidity:</span>
                          <span>{humidity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pressure:</span>
                          <span>{pressure} hPa</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">UV Index:</span>
                          <span>{uvi < 3 ? 'Low' : uvi < 6 ? 'Moderate' : uvi < 8 ? 'High' : 'Very High'} ({uvi})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dew Point:</span>
                          <span>{Math.round(dew_point)}°F</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'telemetry' && (
              <div className="space-y-4">
                <div className="bg-gray-900/60 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Real-Time Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 rounded-md p-3">
                      <h5 className="text-xs text-center mb-2 text-blue-400">Longitudinal Forces</h5>
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 border-2 border-gray-700 rounded-full relative mb-2">
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            {surface_grip === 'Excellent' ? '1.02g' : 
                             surface_grip === 'Good' ? '0.92g' : 
                             surface_grip === 'Fair' ? '0.76g' : 
                             surface_grip === 'Reduced' ? '0.62g' : '0.45g'}
                          </div>
                          {/* Indicator dot */}
                          <div 
                            className="absolute w-3 h-3 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                            style={{ 
                              left: '50%', 
                              top: surface_grip === 'Excellent' ? '20%' : 
                                   surface_grip === 'Good' ? '25%' : 
                                   surface_grip === 'Fair' ? '35%' : 
                                   surface_grip === 'Reduced' ? '50%' : '70%' 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400">Peak Acceleration</div>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-md p-3">
                      <h5 className="text-xs text-center mb-2 text-blue-400">Lateral Forces</h5>
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 border-2 border-gray-700 rounded-full relative mb-2">
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            {surface_grip === 'Excellent' ? '0.95g' : 
                             surface_grip === 'Good' ? '0.86g' : 
                             surface_grip === 'Fair' ? '0.71g' : 
                             surface_grip === 'Reduced' ? '0.58g' : '0.42g'}
                          </div>
                          {/* Indicator dot */}
                          <div 
                            className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                            style={{ 
                              top: '50%', 
                              left: surface_grip === 'Excellent' ? '20%' : 
                                    surface_grip === 'Good' ? '25%' : 
                                    surface_grip === 'Fair' ? '35%' : 
                                    surface_grip === 'Reduced' ? '50%' : '70%' 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400">Peak Cornering</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="text-xs mb-2 text-blue-400">Vehicle Dynamics Impact</h5>
                    <div className="bg-black/40 p-3 rounded-md">
                      <p className="text-xs text-gray-300 mb-2">
                        Current weather conditions are {surface_grip === 'Excellent' || surface_grip === 'Good' ? 
                        'optimal' : surface_grip === 'Fair' ? 'acceptable' : 'challenging'} for vehicle dynamics.
                        {surface_dampness.toLowerCase() !== 'dry' ? 
                          ' Reduced friction due to surface moisture will limit peak performance.' : 
                          ' Dry surface provides maximum available grip.'}
                      </p>
                      
                      <div className="flex justify-between text-xs border-t border-gray-700 pt-2 mt-2">
                        <div>
                          <span className="text-gray-400">Stopping Distance:</span>
                          <span className="ml-1">
                            {surface_grip === 'Excellent' ? '+0%' : 
                             surface_grip === 'Good' ? '+10%' : 
                             surface_grip === 'Fair' ? '+25%' : 
                             surface_grip === 'Reduced' ? '+45%' : '+70%'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Stability Control:</span>
                          <span className="ml-1">
                            {surface_grip === 'Excellent' ? 'Minimal' : 
                             surface_grip === 'Good' ? 'Light' : 
                             surface_grip === 'Fair' ? 'Moderate' : 
                             'High'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Powertrain Optimization</h4>
                  <div className="space-y-3">
                    <div className="bg-black/40 p-3 rounded-md">
                      <h5 className="text-xs mb-2 text-blue-400">Power Delivery Curve</h5>
                      <div className="relative h-24 bg-gray-800 rounded overflow-hidden">
                        {/* Power curves */}
                        <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                          {/* Sport/Track mode - aggressive curve */}
                          {(recommendedMode === 'Sport' || recommendedMode === 'Track') && (
                            <svg className="w-full h-full absolute bottom-0 left-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path d="M0,100 C20,90 40,60 60,50 C80,40 90,40 100,40" 
                                    stroke="#F43F5E" strokeWidth="2" fill="none" />
                            </svg>
                          )}
                          
                          {/* Normal mode - balanced curve */}
                          {recommendedMode === 'Normal' && (
                            <svg className="w-full h-full absolute bottom-0 left-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path d="M0,100 C30,85 50,70 70,60 C85,50 95,50 100,50" 
                                    stroke="#3B82F6" strokeWidth="2" fill="none" />
                            </svg>
                          )}
                          
                          {/* Eco/Comfort/Safety mode - gentle curve */}
                          {(recommendedMode === 'Eco' || recommendedMode === 'Comfort' || recommendedMode === 'Safety' || recommendedMode === 'Rain') && (
                            <svg className="w-full h-full absolute bottom-0 left-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path d="M0,100 C40,90 60,80 80,70 C90,65 95,60 100,60" 
                                    stroke="#22C55E" strokeWidth="2" fill="none" />
                            </svg>
                          )}
                        </div>
                        
                        {/* X and Y axis labels */}
                        <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[8px] text-gray-500">
                          <span>0</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                        <div className="absolute top-0 left-0 h-full flex flex-col justify-between py-1 text-[8px] text-gray-500">
                          <span>100%</span>
                          <span>75%</span>
                          <span>50%</span>
                          <span>25%</span>
                          <span>0%</span>
                        </div>
                      </div>
                      <div className="text-center text-[10px] text-gray-400 mt-1">Throttle Position</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-black/40 p-2 rounded">
                        <div className="text-gray-400 mb-1">Torque Delivery</div>
                        <div>
                          {recommendedMode === 'Sport' || recommendedMode === 'Track' ? 'Aggressive' : 
                           recommendedMode === 'Normal' ? 'Linear' : 
                           'Progressive'}
                        </div>
                      </div>
                      <div className="bg-black/40 p-2 rounded">
                        <div className="text-gray-400 mb-1">Shift Points</div>
                        <div>
                          {recommendedMode === 'Sport' || recommendedMode === 'Track' ? 'Late (High RPM)' : 
                           recommendedMode === 'Eco' ? 'Early (Low RPM)' : 
                           'Optimized'}
                        </div>
                      </div>
                      <div className="bg-black/40 p-2 rounded">
                        <div className="text-gray-400 mb-1">Launch Control</div>
                        <div>
                          {surface_grip === 'Excellent' && surface_dampness === 'Dry' ? 'Available' : 'Limited'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'tires' && (
              <div className="space-y-4">
                <div className="bg-gray-900/60 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Tire Strategy Analysis</h4>
                  
                  <div className="mb-4">
                    <h5 className="text-xs mb-2 text-blue-400">Current Conditions Impact</h5>
                    <div className="bg-black/40 p-3 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-400">Surface Temperature:</span>
                        <span className="text-xs">
                          {surface_temperature < 40 ? 'Cold' : 
                           surface_temperature < 60 ? 'Cool' : 
                           surface_temperature < 85 ? 'Optimal' : 
                           surface_temperature < 100 ? 'Hot' : 'Extreme Heat'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-400">Surface Moisture:</span>
                        <span className="text-xs">{surface_dampness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Tire Wear Multiplier:</span>
                        <span className={`text-xs ${combinedWearFactor > 1.3 ? 'text-red-400' : combinedWearFactor < 0.9 ? 'text-green-400' : ''}`}>
                          {combinedWearFactor.toFixed(2)}x
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-xs mb-2 text-blue-400">Optimal Tire Selection</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`bg-black/40 p-3 rounded-md border-2 ${surface_dampness.toLowerCase().includes('wet') || surface_dampness.toLowerCase().includes('damp') ? 'border-blue-500' : 'border-transparent'}`}>
                        <h6 className="text-center font-medium text-xs mb-2">Wet Conditions</h6>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Recommended:</span>
                            <span>{surface_dampness.toLowerCase().includes('wet') ? 'Wet Weather' : 'All-Season'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pressure Adjustment:</span>
                            <span>{surface_dampness.toLowerCase().includes('wet') ? '-1 to -2 PSI' : 'Standard'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Suitability:</span>
                            <span className={`${surface_dampness.toLowerCase().includes('wet') ? 'text-green-400' : surface_dampness.toLowerCase().includes('damp') ? 'text-yellow-400' : 'text-red-400'}`}>
                              {surface_dampness.toLowerCase().includes('wet') ? 'Excellent' : 
                              surface_dampness.toLowerCase().includes('damp') ? 'Good' : 'Poor'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`bg-black/40 p-3 rounded-md border-2 ${surface_dampness.toLowerCase() === 'dry' ? 'border-blue-500' : 'border-transparent'}`}>
                        <h6 className="text-center font-medium text-xs mb-2">Dry Conditions</h6>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Recommended:</span>
                            <span>
                              {surface_temperature < 40 ? 'Winter/All-Season' :
                               surface_temperature > 85 && recommendedMode === 'Sport' ? 'Summer Performance' :
                               'All-Season'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pressure Adjustment:</span>
                            <span>
                              {surface_temperature > 85 ? '+1 to +2 PSI' : 
                               surface_temperature < 40 ? '-1 PSI' : 
                               'Standard'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Suitability:</span>
                            <span className={`${surface_dampness.toLowerCase() === 'dry' ? 'text-green-400' : 'text-red-400'}`}>
                              {surface_dampness.toLowerCase() === 'dry' ? 'Excellent' : 'Poor'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-xs mb-2 text-blue-400">Tire Wear Projection</h5>
                    <div className="bg-black/40 p-3 rounded-md">
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        <div className="flex flex-col items-center">
                          <div className="font-medium text-xs mb-1">Front Left</div>
                          <div className="w-16 h-16 rounded-full border-4 border-gray-700 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full" 
                                 style={{
                                   background: `conic-gradient(#22C55E 0%, 
                                               ${combinedWearFactor > 1.3 ? '#EF4444' : '#3B82F6'} ${120 - (combinedWearFactor * 20)}%, 
                                               transparent ${120 - (combinedWearFactor * 20)}%, 
                                               transparent 100%)`
                                 }}>
                            </div>
                            <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center z-10">
                              <span className="text-sm font-bold">
                                {Math.round(100 - (combinedWearFactor * 15))}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="font-medium text-xs mb-1">Front Right</div>
                          <div className="w-16 h-16 rounded-full border-4 border-gray-700 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full" 
                                 style={{
                                   background: `conic-gradient(#22C55E 0%, 
                                               ${combinedWearFactor > 1.3 ? '#EF4444' : '#3B82F6'} ${115 - (combinedWearFactor * 22)}%, 
                                               transparent ${115 - (combinedWearFactor * 22)}%, 
                                               transparent 100%)`
                                 }}>
                            </div>
                            <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center z-10">
                              <span className="text-sm font-bold">
                                {Math.round(100 - (combinedWearFactor * 18))}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="font-medium text-xs mb-1">Rear Left</div>
                          <div className="w-16 h-16 rounded-full border-4 border-gray-700 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full" 
                                 style={{
                                   background: `conic-gradient(#22C55E 0%, 
                                               ${combinedWearFactor > 1.3 ? '#EF4444' : '#3B82F6'} ${130 - (combinedWearFactor * 15)}%, 
                                               transparent ${130 - (combinedWearFactor * 15)}%, 
                                               transparent 100%)`
                                 }}>
                            </div>
                            <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center z-10">
                              <span className="text-sm font-bold">
                                {Math.round(100 - (combinedWearFactor * 12))}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="font-medium text-xs mb-1">Rear Right</div>
                          <div className="w-16 h-16 rounded-full border-4 border-gray-700 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full" 
                                 style={{
                                   background: `conic-gradient(#22C55E 0%, 
                                               ${combinedWearFactor > 1.3 ? '#EF4444' : '#3B82F6'} ${125 - (combinedWearFactor * 18)}%, 
                                               transparent ${125 - (combinedWearFactor * 18)}%, 
                                               transparent 100%)`
                                 }}>
                            </div>
                            <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center z-10">
                              <span className="text-sm font-bold">
                                {Math.round(100 - (combinedWearFactor * 14))}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs border-t border-gray-700 pt-2">
                        <p className="mb-2">
                          Current conditions suggest{' '}
                          <span className={combinedWearFactor > 1.3 ? 'text-red-400' : combinedWearFactor > 1.0 ? 'text-yellow-400' : 'text-green-400'}>
                            {combinedWearFactor > 1.3 ? 'accelerated' : combinedWearFactor > 1.0 ? 'normal' : 'reduced'} 
                          </span> tire wear. 
                          {combinedWearFactor > 1.3 ? ' Consider adjusting driving style to extend tire life.' : ''}
                        </p>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Estimated Range Impact:</span>
                          <span>
                            {combinedWearFactor > 1.3 ? '-10% to -15%' : 
                             combinedWearFactor > 1.0 ? '-3% to -5%' : 
                             'No Significant Impact'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="bg-gray-900/60 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-3 border-b border-gray-700 pb-2">Vehicle Settings Optimization</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="text-xs mb-3 text-blue-400">Driveline Configuration</h5>
                      <div className="space-y-3">
                        <div className="bg-black/40 p-3 rounded-md">
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-400">Traction Control:</span>
                            <span className="text-xs font-medium">
                              {surface_dampness.toLowerCase() !== 'dry' || surface_grip.toLowerCase() !== 'excellent' 
                                ? 'Full' 
                                : recommendedMode === 'Sport' || recommendedMode === 'Track'
                                  ? 'Sport (Partial)'
                                  : 'Standard'}
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-400">Stability Control:</span>
                            <span className="text-xs font-medium">
                              {surface_dampness.toLowerCase() !== 'dry' || surface_grip.toLowerCase() === 'poor' || surface_grip.toLowerCase() === 'reduced'
                                ? 'Full' 
                                : recommendedMode === 'Sport'
                                  ? 'Sport (Partial)'
                                  : recommendedMode === 'Track' && surface_grip.toLowerCase() === 'excellent'
                                    ? 'Minimal'
                                    : 'Standard'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-400">Torque Distribution:</span>
                            <span className="text-xs font-medium">
                              {surface_dampness.toLowerCase() !== 'dry'
                                ? 'Balanced (50:50)' 
                                : recommendedMode === 'Sport' || recommendedMode === 'Track'
                                  ? 'Rear-Biased (30:70)'
                                  : 'Standard (40:60)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs mb-3 text-blue-400">Chassis Configuration</h5>
                      <div className="space-y-3">
                        <div className="bg-black/40 p-3 rounded-md">
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-400">Suspension:</span>
                            <span className="text-xs font-medium">
                              {recommendedMode === 'Comfort' 
                                ? 'Soft' 
                                : recommendedMode === 'Sport' || recommendedMode === 'Track'
                                  ? 'Firm'
                                  : 'Standard'}
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-400">Ride Height:</span>
                            <span className="text-xs font-medium">
                              {surface_dampness.toLowerCase().includes('wet') && surface_dampness.toLowerCase().includes('pool')
                                ? 'Raised' 
                                : recommendedMode === 'Sport' || recommendedMode === 'Track'
                                  ? 'Lowered'
                                  : 'Standard'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-400">Damper Settings:</span>
                            <span className="text-xs font-medium">
                              {recommendedMode === 'Comfort' 
                                ? 'Soft' 
                                : recommendedMode === 'Sport'
                                  ? 'Medium-Firm'
                                  : recommendedMode === 'Track'
                                    ? 'Firm'
                                    : 'Balanced'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-xs mb-3 text-blue-400">Powertrain Configuration</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 p-3 rounded-md">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-gray-400">Throttle Response:</span>
                          <span className="text-xs font-medium">
                            {recommendedMode === 'Eco' || recommendedMode === 'Safety' || recommendedMode === 'Rain' 
                              ? 'Gradual' 
                              : recommendedMode === 'Sport' || recommendedMode === 'Track'
                                ? 'Immediate'
                                : 'Standard'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Engine Map:</span>
                          <span className="text-xs font-medium">
                            {recommendedMode === 'Eco'
                              ? 'Economy' 
                              : recommendedMode === 'Sport'
                                ? 'Sport'
                                : recommendedMode === 'Track'
                                  ? 'Performance'
                                  : 'Standard'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 p-3 rounded-md">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-gray-400">Transmission Mode:</span>
                          <span className="text-xs font-medium">
                            {recommendedMode === 'Eco'
                              ? 'Eco (Early Shifts)' 
                              : recommendedMode === 'Sport'
                                ? 'Sport (Quick Shifts)'
                                : recommendedMode === 'Track'
                                  ? 'Track (Aggressive)'
                                  : recommendedMode === 'Comfort'
                                    ? 'Comfort (Smooth)'
                                    : 'Standard'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Launch Control:</span>
                          <span className="text-xs font-medium">
                            {surface_grip === 'Excellent' && surface_dampness === 'Dry' 
                              ? 'Available' 
                              : 'Limited'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs mb-3 text-blue-400">Climate & Comfort</h5>
                    <div className="bg-black/40 p-3 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-400">Climate Mode:</span>
                        <span className="text-xs font-medium">
                          {surface_temperature > 85 
                            ? 'Maximum Cooling' 
                            : surface_temperature < 40 
                              ? 'Maximum Heating'
                              : 'Auto'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-400">Defrost/Defog:</span>
                        <span className="text-xs font-medium">
                          {surface_dampness.toLowerCase() !== 'dry' || humidity > 70
                            ? 'Active' 
                            : 'As Needed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Seat Heating/Cooling:</span>
                        <span className="text-xs font-medium">
                          {surface_temperature > 85 
                            ? 'Ventilation Active' 
                            : surface_temperature < 40 
                              ? 'Heating Active'
                              : 'Auto'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DriveModeRecommendations;