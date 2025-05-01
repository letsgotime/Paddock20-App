import React, { useState } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { AlertCircle, Map, Activity, Info } from 'lucide-react';
import ExpandableTile from './common/ExpandableTile';
import { RegisterTile } from '../utils/TileRegistry';

/**
 * WeatherAlertsDashboard - A dedicated panel for critical driving safety alerts
 * Displays severe weather warnings, crosswind alerts, road flooding risks, etc.
 */
function WeatherAlertsDashboard() {
  const { weatherData } = useWeather();
  const [selectedAlertIndex, setSelectedAlertIndex] = useState(null);
  
  // Define tile ID for navigation and state management
  const tileId = 'weather-alerts';
  
  // Early return if no weather data is available
  if (!weatherData || !weatherData.alerts) {
    return null;
  }
  
  const { alerts } = weatherData;
  
  // Skip rendering if no alerts are present
  if (!alerts.length) {
    return null;
  }
  
  // Get alert severity color
  const getAlertSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
        return 'bg-red-600';
      case 'severe':
        return 'bg-red-500';
      case 'moderate':
        return 'bg-orange-500';
      case 'minor':
        return 'bg-yellow-500';
      case 'advisory':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get alert icon based on type
  const getAlertIcon = (alertType) => {
    const type = alertType?.toLowerCase() || '';
    
    if (type.includes('wind') || type.includes('gust')) {
      return '💨';
    } else if (type.includes('flood') || type.includes('rain')) {
      return '🌊';
    } else if (type.includes('storm') || type.includes('thunder')) {
      return '⛈️';
    } else if (type.includes('snow') || type.includes('winter')) {
      return '❄️';
    } else if (type.includes('fog') || type.includes('visibility')) {
      return '🌫️';
    } else if (type.includes('heat')) {
      return '🔥';
    } else if (type.includes('tornado')) {
      return '🌪️';
    } else {
      return '⚠️';
    }
  };
  
  // Create tabs for fullscreen view
  const alertTabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="p-3 bg-gray-800/60 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">Alert Overview</h4>
          <p className="text-xs text-gray-300 mb-3">
            {alerts.length} active weather alert(s) in this area. These conditions may affect your driving experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-900/80 p-3 rounded border-l-2 border-red-500">
              <h5 className="text-xs font-semibold mb-1">Risk Level</h5>
              <div className="flex items-center">
                <AlertCircle size={14} className="text-red-500 mr-1" />
                <span className="text-sm font-medium">
                  {alerts.some(a => a.severity?.toLowerCase() === 'extreme' || a.severity?.toLowerCase() === 'severe') 
                    ? 'High' 
                    : alerts.some(a => a.severity?.toLowerCase() === 'moderate') 
                      ? 'Moderate' 
                      : 'Low'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900/80 p-3 rounded border-l-2 border-amber-500">
              <h5 className="text-xs font-semibold mb-1">Driving Difficulty</h5>
              <div className="flex items-center">
                <Activity size={14} className="text-amber-500 mr-1" />
                <span className="text-sm font-medium">
                  {alerts.some(a => a.type?.toLowerCase().includes('flood') || a.type?.toLowerCase().includes('tornado')) 
                    ? 'Extreme' 
                    : alerts.some(a => a.type?.toLowerCase().includes('wind') || a.type?.toLowerCase().includes('snow')) 
                      ? 'High' 
                      : 'Moderate'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900/80 p-3 rounded border-l-2 border-blue-500">
              <h5 className="text-xs font-semibold mb-1">Expected Duration</h5>
              <div className="flex items-center">
                <Map size={14} className="text-blue-500 mr-1" />
                <span className="text-sm font-medium">
                  {alerts[0]?.timeframe || 'Next 3-6 hours'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'details',
      label: 'Details',
      content: (
        <div className="p-3 bg-gray-800/60 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">Alert Details</h4>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="bg-gray-900/80 p-3 rounded">
                <div className="flex items-center mb-2">
                  <div className="text-xl mr-2">{getAlertIcon(alert.type)}</div>
                  <h5 className="text-sm font-medium">{alert.type}</h5>
                </div>
                <p className="text-xs text-gray-300 mb-2">{alert.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded ${getAlertSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  {alert.timeframe && (
                    <span className="px-2 py-0.5 rounded bg-gray-700">
                      {alert.timeframe}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'impact',
      label: 'Driving Impact',
      content: (
        <div className="p-3 bg-gray-800/60 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">Driving Impact Analysis</h4>
          <div className="mb-4">
            <h5 className="text-xs font-medium mb-2">Vehicle Systems Impact</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-900/80 p-2 rounded">
                <h6 className="text-xs font-medium mb-1 text-blue-400">Traction Control</h6>
                <p className="text-xs">
                  {alerts.some(a => a.type?.toLowerCase().includes('rain') || a.type?.toLowerCase().includes('flood')) 
                    ? 'High risk of hydroplaning. Keep traction control ON.' 
                    : alerts.some(a => a.type?.toLowerCase().includes('snow') || a.type?.toLowerCase().includes('ice')) 
                      ? 'Reduced grip on snow/ice. Consider snow mode if available.' 
                      : 'Standard operating conditions.'}
                </p>
              </div>
              
              <div className="bg-gray-900/80 p-2 rounded">
                <h6 className="text-xs font-medium mb-1 text-blue-400">Braking Systems</h6>
                <p className="text-xs">
                  {alerts.some(a => a.type?.toLowerCase().includes('rain') || a.type?.toLowerCase().includes('flood')) 
                    ? 'Increased stopping distances on wet surfaces. ABS may engage more frequently.' 
                    : alerts.some(a => a.type?.toLowerCase().includes('snow') || a.type?.toLowerCase().includes('ice')) 
                      ? 'Greatly increased stopping distances. Gentle brake application recommended.' 
                      : 'Normal braking performance expected.'}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-xs font-medium mb-2">Driving Recommendations</h5>
            <ul className="bg-gray-900/80 p-3 rounded text-xs space-y-2 list-disc pl-4">
              <li>Reduce speed by {alerts.some(a => a.severity?.toLowerCase() === 'extreme') ? '50%' : 
                alerts.some(a => a.severity?.toLowerCase() === 'severe') ? '30%' : '15%'} compared to normal conditions</li>
              <li>Increase following distance to at least {alerts.some(a => a.severity?.toLowerCase() === 'extreme') ? '4x' : 
                alerts.some(a => a.severity?.toLowerCase() === 'severe') ? '3x' : '2x'} normal</li>
              <li>Use headlights even during daylight hours for increased visibility to other drivers</li>
              <li>Avoid sudden steering, acceleration or braking inputs</li>
              {alerts.some(a => a.type?.toLowerCase().includes('flood')) && (
                <li className="text-red-400 font-medium">Never attempt to drive through standing water of unknown depth</li>
              )}
            </ul>
          </div>
        </div>
      )
    }
  ];
  
  // Create collapsed view content
  const collapsedContent = (
    <div className="cursor-pointer">
      <div className="bg-red-900/20 border border-red-700/30 rounded-md p-3 mb-3">
        <div className="flex items-center mb-2">
          <div className="text-xl mr-2">{getAlertIcon(alerts[0].type)}</div>
          <div>
            <span className={`text-xs px-2 py-0.5 rounded mr-2 ${getAlertSeverityColor(alerts[0].severity)}`}>
              {alerts[0].severity}
            </span>
            <span className="font-medium">{alerts.length > 1 ? `${alerts.length} active alerts` : alerts[0].type}</span>
          </div>
        </div>
        
        <p className="text-sm">
          {alerts.length > 1 
            ? 'Multiple weather alerts that may affect driving conditions' 
            : alerts[0].description.length > 100 
              ? `${alerts[0].description.substring(0, 100)}...` 
              : alerts[0].description}
        </p>
      </div>
      
      <div className="text-center text-xs text-blue-400 hover:text-blue-300">
        Click to view all weather alerts and driving recommendations
      </div>
    </div>
  );
  
  // Create expanded view content
  const expandedContent = (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div key={index} className="bg-gray-900/60 rounded-md p-3 border-l-2 border-red-500">
          <div className="flex items-start gap-3">
            <div className="text-xl mt-1">{getAlertIcon(alert.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded ${getAlertSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
                <h4 className="text-sm font-medium">{alert.type}</h4>
              </div>
              <p className="text-xs text-gray-300 mb-2">{alert.description}</p>
              
              <div className="bg-gray-800/80 p-2 rounded text-xs">
                <h5 className="font-medium mb-1 flex items-center">
                  <Info className="w-3 h-3 mr-1 text-blue-400" />
                  <span>Driving Impact:</span>
                </h5>
                <p className="text-gray-300">
                  {alert.type?.toLowerCase().includes('flood')
                    ? 'Avoid low-lying areas and never drive through standing water.'
                    : alert.type?.toLowerCase().includes('wind')
                      ? 'High-profile vehicles at risk. Strong crosswinds may affect steering.'
                      : alert.type?.toLowerCase().includes('snow') || alert.type?.toLowerCase().includes('ice')
                        ? 'Reduced traction and visibility. Consider postponing travel if possible.'
                        : 'Exercise caution and monitor conditions closely.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <>
      <RegisterTile 
        id={tileId}
        title="Driving Safety Alerts"
        order={4}
      />
      
      <ExpandableTile
        id={tileId}
        title="Driving Safety Alerts"
        color="red-500"
        tabs={alertTabs}
      >
        {collapsedContent}
        {expandedContent}
      </ExpandableTile>
    </>
  );
}

export default WeatherAlertsDashboard;