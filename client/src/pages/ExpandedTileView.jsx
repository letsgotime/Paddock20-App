import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useTile } from '../contexts/TileContext';
import TileNavigation from '../components/common/TileNavigation';
import { useWeather } from '../contexts/WeatherContext';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

/**
 * ExpandedTileView - Page component for rendering a full-page expanded view of a tile
 * Used for deep dives into specific data sections
 */
function ExpandedTileView() {
  const [_, params] = useRoute('/tile/:id');
  const tileId = params?.id;
  const { setTileFullscreen, exitFullscreen } = useTile();
  const [, navigate] = useLocation();
  const { weatherData } = useWeather();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tileData, setTileData] = useState(null);

  // Navigate back to home if exit is clicked
  const handleExit = () => {
    navigate('/');
  };

  // Define the tile components mapping - match tileId to the corresponding component data
  const tileComponents = {
    'weather-alerts': {
      title: 'Weather Alerts & Driving Safety Warnings',
      description: 'Critical weather alerts and safety recommendations for current driving conditions',
      getData: () => {
        if (!weatherData || !weatherData.alerts) {
          return { error: 'No weather alert data available' };
        }
        return { alerts: weatherData.alerts };
      },
      renderContent: (data) => {
        if (data.error) {
          return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
              <p className="text-gray-400">{data.error}</p>
              <p className="text-sm text-gray-500 mt-2">Try refreshing or check your location settings</p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Active Weather Alerts</h2>
              
              {data.alerts && data.alerts.length > 0 ? (
                <div className="space-y-4">
                  {data.alerts.map((alert, index) => (
                    <div key={index} className="bg-gray-900/60 p-4 rounded-lg border-l-4 border-red-500">
                      <div className="flex items-start">
                        <div className="text-2xl mr-3 mt-1">⚠️</div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="bg-red-600/80 text-white text-xs px-2 py-0.5 rounded mr-2">
                              {alert.severity || 'Alert'}
                            </span>
                            <h3 className="font-medium">{alert.type || 'Weather Warning'}</h3>
                          </div>
                          
                          <p className="text-sm mb-3">{alert.description}</p>
                          
                          <div className="bg-black/30 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-blue-400 mb-2">Driving Impact:</h4>
                            <p className="text-sm mb-3">{alert.drivingImpact || 'Reduced visibility and traction. Drive with caution.'}</p>
                            
                            {alert.recommendation && (
                              <>
                                <h4 className="text-sm font-medium text-green-400 mb-2">Recommendation:</h4>
                                <p className="text-sm">{alert.recommendation}</p>
                              </>
                            )}
                          </div>
                          
                          {alert.timeframe && (
                            <div className="mt-3 text-sm text-gray-400">{alert.timeframe}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-700/30 rounded-md p-4 text-center">
                  <p className="text-lg mb-2">No Active Alerts</p>
                  <p className="text-sm text-gray-400">Current weather conditions are favorable for driving</p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Safety Recommendations</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-900/60 p-3 rounded-md">
                  <h3 className="text-md font-medium mb-2 text-blue-400">Current Hazards</h3>
                  <ul className="space-y-2 text-sm">
                    {data.alerts && data.alerts.length > 0 ? (
                      data.alerts.map((alert, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>{alert.hazardType || alert.type}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-green-400">No significant hazards detected</li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-gray-900/60 p-3 rounded-md">
                  <h3 className="text-md font-medium mb-2 text-blue-400">Driver Actions</h3>
                  <ul className="space-y-2 text-sm">
                    {data.alerts && data.alerts.length > 0 ? (
                      <>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span>Reduce speed and increase following distance</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span>Be alert for changing road conditions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span>Check vehicle systems before departure</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span>Consider alternate routes if available</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>Normal driving practices suitable</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>Maintain standard following distances</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>Enjoy optimal driving conditions</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      }
    },
    'drive-mode': {
      title: 'Vehicle Performance & Drive Mode Analysis',
      description: 'Detailed vehicle performance metrics and drive mode recommendations based on current conditions',
      getData: () => {
        if (!weatherData || !weatherData.current) {
          return { error: 'No weather data available for drive mode analysis' };
        }
        
        const { current, roadConditions = {} } = weatherData;
        
        return { 
          current, 
          roadConditions,
          alerts: weatherData.alerts || []
        };
      },
      renderContent: (data) => {
        if (data.error) {
          return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
              <p className="text-gray-400">{data.error}</p>
              <p className="text-sm text-gray-500 mt-2">Try refreshing or check your location settings</p>
            </div>
          );
        }
        
        const { current, roadConditions, alerts } = data;
        
        // Extract road surface data
        const { 
          surface_grip = 'Good',
          surface_temperature = current?.temp || 0,
          surface_dampness = 'Dry'
        } = roadConditions;
        
        // Determine if severe weather is present
        const hasSevereWeather = alerts.some(alert => 
          ['extreme', 'severe'].includes(alert.severity?.toLowerCase() || '')
        );
        
        // Get recommended driving mode
        let recommendedMode = 'Normal';
        let recommendation = 'Standard driving mode suitable for current conditions';
        
        // Build recommendation based on conditions
        if (hasSevereWeather) {
          recommendedMode = 'Safety';
          recommendation = 'Prioritize safety in severe weather conditions';
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
        } else if (surface_grip.toLowerCase() === 'excellent' && 
                 surface_dampness.toLowerCase() === 'dry' && 
                 surface_temperature > 50 && 
                 surface_temperature < 90) {
          recommendedMode = 'Sport';
          recommendation = 'Optimal conditions for enhanced performance mode';
        }
        
        // Generate performance indices
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
        
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Drive Mode Recommendation</h2>
                
                <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 rounded-lg p-6 mb-4">
                  <h3 className="text-lg font-medium mb-2 text-center">Recommended Mode</h3>
                  <div className="text-3xl font-bold text-center mb-3">{recommendedMode}</div>
                  <p className="text-center text-gray-300">{recommendation}</p>
                </div>
                
                <div className="bg-gray-900/60 p-3 rounded-md mb-4">
                  <h3 className="text-md font-medium mb-3 text-blue-400">Current Conditions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Surface Grip:</span>
                      <span>{surface_grip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Surface Type:</span>
                      <span>{surface_dampness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temperature:</span>
                      <span>{surface_temperature}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weather:</span>
                      <span>{current?.weather?.[0]?.description || 'Clear'}</span>
                    </div>
                  </div>
                </div>
                
                {hasSevereWeather && (
                  <div className="bg-red-900/30 border border-red-700 rounded-md p-3 text-sm">
                    <div className="flex items-center mb-1">
                      <span className="mr-2">⚠️</span>
                      <span className="font-semibold">Safety Alert</span>
                    </div>
                    <p>Severe weather conditions detected. Extreme caution is advised.</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Performance Impact</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Acceleration</span>
                      <span>{performanceIndex.acceleration}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${performanceIndex.acceleration}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Braking</span>
                      <span>{performanceIndex.braking}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${performanceIndex.braking}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Cornering</span>
                      <span>{performanceIndex.cornering}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${performanceIndex.cornering}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Efficiency</span>
                      <span>{performanceIndex.efficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${performanceIndex.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-900/60 p-3 rounded-md">
                  <h3 className="text-md font-medium mb-3 text-blue-400">Performance Summary</h3>
                  <p className="text-sm">
                    Current conditions provide 
                    {performanceIndex.acceleration > 90 ? ' excellent acceleration' : 
                     performanceIndex.acceleration > 70 ? ' good acceleration' : 
                     ' limited acceleration'} and
                    {performanceIndex.braking > 90 ? ' excellent braking' : 
                     performanceIndex.braking > 70 ? ' good braking' : 
                     ' compromised braking'} performance.
                    Cornering ability is 
                    {performanceIndex.cornering > 90 ? ' optimal' : 
                     performanceIndex.cornering > 70 ? ' good' : 
                     performanceIndex.cornering > 50 ? ' acceptable' : 
                     ' significantly reduced'}.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Vehicle Settings</h2>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gray-900/60 p-3 rounded-md">
                  <h3 className="text-md font-medium mb-2 text-blue-400">Traction Control</h3>
                  <div className="text-center text-xl font-bold mb-1">
                    {surface_dampness.toLowerCase() !== 'dry' || surface_grip.toLowerCase() !== 'excellent' 
                      ? 'Full' 
                      : recommendedMode === 'Sport' ? 'Sport' : 'Standard'}
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    {surface_dampness.toLowerCase() !== 'dry' || surface_grip.toLowerCase() !== 'excellent' 
                      ? 'Maximum intervention for safety' 
                      : recommendedMode === 'Sport' ? 'Allows controlled wheel slip' : 'Normal operation'}
                  </p>
                </div>
                
                <div className="bg-gray-900/60 p-3 rounded-md">
                  <h3 className="text-md font-medium mb-2 text-blue-400">Suspension</h3>
                  <div className="text-center text-xl font-bold mb-1">
                    {recommendedMode === 'Comfort' 
                      ? 'Soft' 
                      : recommendedMode === 'Sport' 
                        ? 'Firm' 
                        : 'Standard'}
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    {recommendedMode === 'Comfort' 
                      ? 'Prioritizes ride comfort and stability' 
                      : recommendedMode === 'Sport' 
                        ? 'Reduced body roll for better handling' 
                        : 'Balanced ride and handling'}
                  </p>
                </div>
                
                <div className="bg-gray-900/60 p-3 rounded-md">
                  <h3 className="text-md font-medium mb-2 text-blue-400">Throttle Response</h3>
                  <div className="text-center text-xl font-bold mb-1">
                    {recommendedMode === 'Eco' || recommendedMode === 'Safety' 
                      ? 'Gradual' 
                      : recommendedMode === 'Sport' 
                        ? 'Sharp' 
                        : 'Normal'}
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    {recommendedMode === 'Eco' || recommendedMode === 'Safety' 
                      ? 'Smooths inputs for efficiency and stability' 
                      : recommendedMode === 'Sport' 
                        ? 'Immediate power delivery' 
                        : 'Standard responsiveness'}
                  </p>
                </div>
                
                <div className="bg-gray-900/60 p-3 rounded-md">
                  <h3 className="text-md font-medium mb-2 text-blue-400">Climate Control</h3>
                  <div className="text-center text-xl font-bold mb-1">
                    {surface_temperature > 85 
                      ? 'A/C Max' 
                      : surface_temperature < 40 
                        ? 'Heat' 
                        : 'Auto'}
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    {surface_temperature > 85 
                      ? 'Maximum cooling for comfort' 
                      : surface_temperature < 40 
                        ? 'Heating and defrost activated' 
                        : 'Balanced climate control'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
    },
    'surface-forecast': {
      title: 'Surface Conditions & Grip Forecast',
      description: 'Detailed forecast of road surface conditions and grip levels over time',
      getData: () => {
        if (!weatherData || !weatherData.hourly) {
          return { error: 'No forecast data available' };
        }
        
        const { hourly, roadConditions = {} } = weatherData;
        
        return { 
          hourly: hourly.slice(0, 12), // Get next 12 hours
          roadConditions
        };
      },
      renderContent: (data) => {
        if (data.error) {
          return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
              <p className="text-gray-400">{data.error}</p>
              <p className="text-sm text-gray-500 mt-2">Try refreshing or check your location settings</p>
            </div>
          );
        }
        
        const { hourly, roadConditions } = data;
        
        // Get the current grip level to use as a baseline
        const currentGripLevel = roadConditions.surface_grip || 'Good';
        
        // Generate grip forecast based on weather conditions for each hour
        const hourlyGripForecast = hourly.map((hour, index) => {
          const conditions = hour.weather?.[0];
          const pop = hour.pop || 0; // Probability of precipitation
          const temp = hour.temp || 0;
          
          // Start with the current grip level
          let gripLevel = currentGripLevel;
          let gripTrend = 'stable';
          
          // Determine grip change based on weather conditions
          if (conditions && conditions.id) {
            // Rain/Snow conditions (200-699) reduce grip
            if (conditions.id >= 200 && conditions.id < 700) {
              if (pop >= 0.7) {
                gripLevel = 'Poor';
                gripTrend = 'decreasing';
              } else if (pop >= 0.4) {
                gripLevel = 'Reduced';
                gripTrend = 'decreasing';
              } else if (pop >= 0.2) {
                gripLevel = 'Fair';
                gripTrend = 'decreasing';
              }
            }
            // Fog/mist (700-799) slightly reduces grip
            else if (conditions.id >= 700 && conditions.id < 800) {
              if (gripLevel === 'Excellent') {
                gripLevel = 'Good';
                gripTrend = 'decreasing';
              } else if (gripLevel === 'Good') {
                gripLevel = 'Fair';
                gripTrend = 'decreasing';
              }
            }
            // Clear sky (800) improves grip over time if temperature is moderate
            else if (conditions.id === 800) {
              if (temp > 40 && temp < 100) {
                // Improvement happens gradually over time
                if (index > 0 && index < 3 && gripLevel === 'Fair') {
                  gripLevel = 'Good';
                  gripTrend = 'increasing';
                } else if (index >= 3 && gripLevel === 'Good') {
                  gripLevel = 'Excellent';
                  gripTrend = 'increasing';
                }
              }
            }
          }
          
          // If temperature is extreme, it affects grip
          if (temp > 100) {
            gripLevel = 'Reduced';
            gripTrend = 'decreasing';
          } else if (temp < 32) {
            gripLevel = 'Poor';
            gripTrend = 'decreasing';
          }
          
          // Format the timestamp
          const timestamp = new Date(hour.dt * 1000);
          const timeString = timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          
          return {
            time: timeString,
            timestamp,
            temperature: temp,
            conditions: conditions?.main || 'Clear',
            precipitation: pop * 100,
            gripLevel,
            gripTrend,
            icon: conditions?.icon
          };
        });
        
        // Helper functions for display
        const getGripLevelClass = (level) => {
          switch (level.toLowerCase()) {
            case 'excellent': return 'text-green-500';
            case 'good': return 'text-green-400';
            case 'fair': return 'text-yellow-400';
            case 'reduced': return 'text-orange-400';
            case 'poor': return 'text-red-500';
            default: return 'text-gray-400';
          }
        };
        
        const getGripTrendIcon = (trend) => {
          switch (trend.toLowerCase()) {
            case 'increasing': return '↗️';
            case 'decreasing': return '↘️';
            case 'stable': return '➡️';
            default: return '•';
          }
        };
        
        return (
          <div className="space-y-4">
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Surface Condition Forecast</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full mb-3">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-400">Time</th>
                      <th className="py-2 px-3 text-center text-sm font-medium text-gray-400">Weather</th>
                      <th className="py-2 px-3 text-center text-sm font-medium text-gray-400">Temp</th>
                      <th className="py-2 px-3 text-center text-sm font-medium text-gray-400">Precip</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-400">Grip Level</th>
                      <th className="py-2 px-3 text-center text-sm font-medium text-gray-400">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hourlyGripForecast.map((forecast, index) => (
                      <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-3 px-3 text-sm">{forecast.time}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center">
                            <img 
                              src={`https://openweathermap.org/img/wn/${forecast.icon}.png`} 
                              alt={forecast.conditions}
                              className="w-8 h-8"
                            />
                            <span className="text-xs mt-1">{forecast.conditions}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-medium">
                          {Math.round(forecast.temperature)}°F
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-sm ${forecast.precipitation > 50 ? 'text-blue-400' : 'text-gray-400'}`}>
                            {Math.round(forecast.precipitation)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm font-medium">
                          <span className={getGripLevelClass(forecast.gripLevel)}>
                            {forecast.gripLevel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center">
                            <span className="text-sm mr-1">{getGripTrendIcon(forecast.gripTrend)}</span>
                            <span className="text-xs capitalize">{forecast.gripTrend}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Surface Analysis</h2>
                
                <div className="bg-gray-900/60 rounded-md p-3 mb-4">
                  <h3 className="text-md font-medium mb-2 text-blue-400">Grip Evolution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Start of Period:</span>
                      <span className={`text-sm font-medium ${getGripLevelClass(hourlyGripForecast[0].gripLevel)}`}>
                        {hourlyGripForecast[0].gripLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Middle of Period:</span>
                      <span className={`text-sm font-medium ${getGripLevelClass(hourlyGripForecast[Math.floor(hourlyGripForecast.length / 2)].gripLevel)}`}>
                        {hourlyGripForecast[Math.floor(hourlyGripForecast.length / 2)].gripLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">End of Period:</span>
                      <span className={`text-sm font-medium ${getGripLevelClass(hourlyGripForecast[hourlyGripForecast.length - 1].gripLevel)}`}>
                        {hourlyGripForecast[hourlyGripForecast.length - 1].gripLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Overall Trend:</span>
                      <span className="text-sm font-medium">
                        {hourlyGripForecast[hourlyGripForecast.length - 1].gripLevel === hourlyGripForecast[0].gripLevel
                          ? 'Stable conditions'
                          : hourlyGripForecast[hourlyGripForecast.length - 1].gripLevel === 'Excellent' || 
                            (hourlyGripForecast[hourlyGripForecast.length - 1].gripLevel === 'Good' && 
                            hourlyGripForecast[0].gripLevel !== 'Excellent')
                            ? 'Improving conditions'
                            : 'Deteriorating conditions'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 rounded-md p-3">
                  <h3 className="text-md font-medium mb-2 text-blue-400">Best Time to Drive</h3>
                  <p className="text-sm mb-3">
                    Based on grip level and weather conditions, the optimal time to drive within the forecast period is:
                  </p>
                  
                  {(() => {
                    // Find best grip period
                    const excellentGrip = hourlyGripForecast.filter(f => f.gripLevel === 'Excellent');
                    const goodGrip = hourlyGripForecast.filter(f => f.gripLevel === 'Good');
                    
                    if (excellentGrip.length > 0) {
                      return (
                        <div className="bg-green-900/20 border border-green-700 rounded-md p-3">
                          <div className="text-center font-medium mb-1">
                            {excellentGrip[0].time} - {excellentGrip[excellentGrip.length - 1 === 0 ? 0 : excellentGrip.length - 1].time}
                          </div>
                          <p className="text-xs text-center text-green-400">
                            Excellent grip conditions during this window
                          </p>
                        </div>
                      );
                    } else if (goodGrip.length > 0) {
                      return (
                        <div className="bg-blue-900/20 border border-blue-700 rounded-md p-3">
                          <div className="text-center font-medium mb-1">
                            {goodGrip[0].time} - {goodGrip[goodGrip.length - 1 === 0 ? 0 : goodGrip.length - 1].time}
                          </div>
                          <p className="text-xs text-center text-blue-400">
                            Good grip conditions during this window
                          </p>
                        </div>
                      );
                    } else {
                      // Find least bad conditions
                      const fairGrip = hourlyGripForecast.filter(f => f.gripLevel === 'Fair');
                      
                      if (fairGrip.length > 0) {
                        return (
                          <div className="bg-yellow-900/20 border border-yellow-700 rounded-md p-3">
                            <div className="text-center font-medium mb-1">
                              {fairGrip[0].time} - {fairGrip[fairGrip.length - 1 === 0 ? 0 : fairGrip.length - 1].time}
                            </div>
                            <p className="text-xs text-center text-yellow-400">
                              Fair grip conditions - use caution
                            </p>
                          </div>
                        );
                      } else {
                        return (
                          <div className="bg-red-900/20 border border-red-700 rounded-md p-3">
                            <div className="text-center font-medium mb-1">
                              Challenging Conditions
                            </div>
                            <p className="text-xs text-center text-red-400">
                              Consider postponing non-essential travel
                            </p>
                          </div>
                        );
                      }
                    }
                  })()}
                </div>
              </div>
              
              <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Temperature & Precipitation</h2>
                
                <div className="bg-gray-900/60 rounded-md p-3 mb-4">
                  <h3 className="text-md font-medium mb-3 text-blue-400">Temperature Range</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Min: {Math.min(...hourlyGripForecast.map(h => h.temperature)).toFixed(1)}°F</span>
                    <span className="text-sm">Max: {Math.max(...hourlyGripForecast.map(h => h.temperature)).toFixed(1)}°F</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
                      style={{ 
                        clipPath: `polygon(
                          ${Math.max(0, Math.min(100, ((Math.min(...hourlyGripForecast.map(h => h.temperature)) - 32) / 100) * 100))}% 0, 
                          ${Math.max(0, Math.min(100, ((Math.max(...hourlyGripForecast.map(h => h.temperature)) - 32) / 100) * 100))}% 0, 
                          ${Math.max(0, Math.min(100, ((Math.max(...hourlyGripForecast.map(h => h.temperature)) - 32) / 100) * 100))}% 100%, 
                          ${Math.max(0, Math.min(100, ((Math.min(...hourlyGripForecast.map(h => h.temperature)) - 32) / 100) * 100))}% 100%
                        )`
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 rounded-md p-3">
                  <h3 className="text-md font-medium mb-3 text-blue-400">Precipitation Forecast</h3>
                  <div className="space-y-2">
                    {hourlyGripForecast.filter((_, idx) => idx % 2 === 0).map((forecast, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-16 text-xs text-gray-400">{forecast.time}</div>
                        <div className="flex-1">
                          <div className="relative h-6">
                            <div 
                              className={`absolute top-0 left-0 h-full ${forecast.precipitation > 50 ? 'bg-blue-600' : 'bg-blue-500/60'} rounded-r`}
                              style={{ width: `${forecast.precipitation}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center">
                              <span className="ml-2 text-xs font-medium">
                                {forecast.precipitation > 0 ? `${Math.round(forecast.precipitation)}%` : 'No precipitation'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 border-t border-gray-700 pt-3">
                    <h4 className="text-sm font-medium mb-2">Precipitation Impact</h4>
                    <p className="text-xs">
                      {hourlyGripForecast.some(f => f.precipitation > 50) 
                        ? 'High likelihood of precipitation during forecast period. Road surface will be wet, reducing grip levels.'
                        : hourlyGripForecast.some(f => f.precipitation > 20)
                          ? 'Moderate chance of precipitation. Be prepared for changing surface conditions.'
                          : 'Low chance of precipitation. Surface conditions should remain stable.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  };
  
  // Get data for this tile
  useEffect(() => {
    if (!tileId || !weatherData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const selectedTile = tileComponents[tileId];
      
      if (!selectedTile) {
        setError(`Tile "${tileId}" not found`);
        setLoading(false);
        return;
      }
      
      const data = selectedTile.getData();
      setTileData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading tile data:', err);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  }, [tileId, weatherData]);
  
  // Get current tile info
  const currentTile = tileId ? tileComponents[tileId] : null;
  
  // Get navigation links
  const tileIds = Object.keys(tileComponents);
  const currentIndex = tileIds.indexOf(tileId);
  const prevTileId = currentIndex > 0 ? tileIds[currentIndex - 1] : null;
  const nextTileId = currentIndex < tileIds.length - 1 ? tileIds[currentIndex + 1] : null;
  
  // Set up navigation menu items
  const menuItems = tileIds.map(id => ({
    id,
    label: tileComponents[id].title,
    link: `/tile/${id}`
  }));
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <div className="mb-6">
          <TileNavigation
            prevLink={prevTileId ? `/tile/${prevTileId}` : null}
            nextLink={nextTileId ? `/tile/${nextTileId}` : null}
            homeLink="/"
            prevLabel={prevTileId ? tileComponents[prevTileId].title : null}
            nextLabel={nextTileId ? tileComponents[nextTileId].title : null}
            onClose={handleExit}
            showMenu={true}
            menuItems={menuItems}
            currentSection={tileId}
            variant="default"
            className="bg-gray-800/80 border border-gray-700 rounded-lg p-3 mb-6"
          />
        </div>
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <button 
              onClick={handleExit}
              className="mr-3 p-2 rounded-full hover:bg-gray-800"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h1 className="text-2xl font-bold">
              {currentTile ? currentTile.title : 'Weather Data'}
            </h1>
          </div>
          
          {currentTile && (
            <p className="text-gray-400 ml-10">
              {currentTile.description}
            </p>
          )}
        </div>
        
        {/* Content Area */}
        <div className="mb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-gray-400">{error}</p>
              <button
                onClick={handleExit}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Return to Dashboard
              </button>
            </div>
          ) : currentTile && tileData ? (
            currentTile.renderContent(tileData)
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-400">No data to display</p>
              <button
                onClick={handleExit}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpandedTileView;