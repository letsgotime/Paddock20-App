import React, { useState, useEffect } from 'react';
import { extractWeatherAlerts } from '../services/openWeatherService';

function WeatherAlertsDashboard({ weatherData, selectedLocation }) {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState(null);
  
  useEffect(() => {
    if (weatherData) {
      try {
        setLoading(true);
        const extractedAlerts = extractWeatherAlerts(weatherData);
        setAlerts(extractedAlerts);
      } catch (error) {
        console.error("Error extracting weather alerts:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [weatherData]);
  
  // Format date from timestamp
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme': return 'text-red-500';
      case 'severe': return 'text-orange-500';
      case 'moderate': return 'text-yellow-500';
      case 'minor': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };
  
  // Get severity background
  const getSeverityBg = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme': return 'bg-red-900/20 border-red-900/30';
      case 'severe': return 'bg-orange-900/20 border-orange-900/30';
      case 'moderate': return 'bg-yellow-900/20 border-yellow-900/30';
      case 'minor': return 'bg-blue-900/20 border-blue-900/30';
      default: return 'bg-gray-900/60 border-gray-700';
    }
  };
  
  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme': return '⚠️';
      case 'severe': return '⚠️';
      case 'moderate': return '⚠️';
      case 'minor': return 'ℹ️';
      default: return 'ℹ️';
    }
  };
  
  // Get driving impact recommendation based on weather alert
  const getDrivingImpact = (alert) => {
    const eventType = alert.event.toLowerCase();
    
    if (eventType.includes('flood') || eventType.includes('flash')) {
      return {
        impact: 'Severe',
        color: 'text-red-500',
        recommendation: 'Do not attempt to drive through flooded areas. Seek alternate routes or delay travel.'
      };
    }
    else if (eventType.includes('tornado') || eventType.includes('hurricane')) {
      return {
        impact: 'Extreme',
        color: 'text-red-500',
        recommendation: 'Avoid all non-emergency travel. Seek appropriate shelter immediately.'
      };
    }
    else if (eventType.includes('snow') || eventType.includes('blizzard') || eventType.includes('ice')) {
      return {
        impact: 'Major',
        color: 'text-orange-500',
        recommendation: 'Winter driving conditions. Reduce speed significantly, increase following distance, and prepare for limited visibility.'
      };
    }
    else if (eventType.includes('thunderstorm') || eventType.includes('storm')) {
      return {
        impact: 'Moderate',
        color: 'text-yellow-500',
        recommendation: 'Heavy rain and lightning possible. Use headlights, reduce speed, and be prepared for reduced visibility and ponding on roadways.'
      };
    }
    else if (eventType.includes('fog') || eventType.includes('visibility')) {
      return {
        impact: 'Moderate',
        color: 'text-yellow-500',
        recommendation: 'Use fog lights if available, reduce speed, and increase following distance substantially.'
      };
    }
    else if (eventType.includes('wind') || eventType.includes('gale')) {
      return {
        impact: 'Moderate',
        color: 'text-yellow-500',
        recommendation: 'High profile vehicles at risk. All vehicles should maintain strong grip on steering wheel and be aware of sudden gusts, especially on bridges.'
      };
    }
    else if (eventType.includes('heat')) {
      return {
        impact: 'Minor',
        color: 'text-blue-400',
        recommendation: 'Check cooling systems before driving. Be aware of potential pavement buckling on older roads. Never leave children or pets in parked vehicles.'
      };
    }
    else if (eventType.includes('freeze') || eventType.includes('frost') || eventType.includes('cold')) {
      return {
        impact: 'Moderate',
        color: 'text-yellow-500',
        recommendation: 'Watch for black ice on roadways, especially in shaded areas and on bridges. Allow extra stopping distance.'
      };
    }
    else {
      return {
        impact: 'Variable',
        color: 'text-gray-400',
        recommendation: 'Monitor conditions closely and use caution while driving. Check for updates before traveling.'
      };
    }
  };
  
  if (loading) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
          <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
          WEATHER ALERTS
        </h3>
        <div className="flex justify-center py-5">
          <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (!alerts || !alerts.has_alerts) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
          WEATHER ALERTS
        </h3>
        <div className="p-3 bg-gray-900/60 rounded-md text-center">
          <div className="text-green-500 font-medium mb-1">No Active Weather Alerts</div>
          <div className="text-xs text-gray-400">Clear conditions for driving at this location</div>
        </div>
        
        <div className="mt-3 text-xs text-gray-400 bg-gray-900/40 p-2 rounded-md">
          <span className="text-green-400 font-medium">PADDOCK20 Status:</span> All systems green. Optimal driving conditions confirmed.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
        <span className="h-2 w-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
        WEATHER ALERTS {selectedLocation && `• ${selectedLocation.name}`}
      </h3>
      
      {/* Alert Summary */}
      <div className={`p-3 mb-4 rounded-md border ${getSeverityBg(alerts.highest_severity)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className={`text-sm font-medium ${getSeverityColor(alerts.highest_severity)}`}>
            {alerts.alerts.length} Active Weather {alerts.alerts.length === 1 ? 'Alert' : 'Alerts'}
          </div>
          <div className="text-xs bg-gray-800/60 px-2 py-1 rounded">
            Highest Severity: <span className={getSeverityColor(alerts.highest_severity)}>{alerts.highest_severity}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-300">
          Weather alerts detected for your area. Review driving recommendations and adjust travel plans accordingly.
        </div>
      </div>
      
      {/* Alert List */}
      <div className="space-y-3 mb-4">
        {alerts.alerts.map((alert, index) => {
          const drivingImpact = getDrivingImpact(alert);
          
          return (
            <div key={index} className="bg-gray-900/60 rounded-md overflow-hidden">
              <div 
                className={`p-3 border-b ${getSeverityBg(alert.severity)} cursor-pointer`}
                onClick={() => setExpandedAlert(expandedAlert === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`text-lg mr-2 ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{alert.event}</div>
                      <div className="text-xs text-gray-400">
                        Until {formatDate(alert.end)}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {expandedAlert === index ? '▲' : '▼'}
                  </div>
                </div>
              </div>
              
              {expandedAlert === index && (
                <div className="p-3 text-xs">
                  <div className="text-gray-300 mb-3">
                    {alert.description}
                  </div>
                  
                  <div>
                    <div className="text-gray-400 mb-1">Driving Impact:</div>
                    <div className={`font-medium ${drivingImpact.color}`}>
                      {drivingImpact.impact}
                    </div>
                    <div className="mt-1 p-2 bg-gray-800/60 rounded">
                      {drivingImpact.recommendation}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between text-gray-400">
                    <div>Start: {formatDate(alert.start)}</div>
                    <div>Source: {alert.sender_name}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* F1-inspired emergency protocol */}
      <div className="bg-red-900/20 border border-red-900/30 rounded-md p-3 text-xs">
        <div className="text-red-400 font-semibold mb-1">PADDOCK20 EMERGENCY PROTOCOL:</div>
        <div className="text-gray-300">
          {alerts.highest_severity === 'Extreme' || alerts.highest_severity === 'Severe'
            ? "Red flag conditions detected. All non-essential drives should be postponed. Maintain awareness of changing conditions and have an evacuation plan ready."
            : "Yellow flag conditions in effect. Proceed with caution and continuously monitor conditions. Be prepared to adjust or abort driving plans as needed."}
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-gray-800/80 p-2 rounded flex items-center">
            <div className="text-red-500 mr-2">🔊</div>
            <div>Monitor NOAA radio for updates</div>
          </div>
          <div className="bg-gray-800/80 p-2 rounded flex items-center">
            <div className="text-amber-500 mr-2">⚡</div>
            <div>Confirm vehicle emergency kit</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherAlertsDashboard;