import React from 'react';
import { useWeather } from '../contexts/WeatherContext';

/**
 * WeatherAlertsDashboard - A dedicated panel for critical driving safety alerts
 * Displays severe weather warnings, crosswind alerts, road flooding risks, etc.
 */
function WeatherAlertsDashboard() {
  const { weatherData } = useWeather();
  
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
    switch (severity.toLowerCase()) {
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
    const type = alertType.toLowerCase();
    
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

  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
        <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
        DRIVING SAFETY ALERTS
      </h3>
      
      {alerts.length > 0 ? (
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
                    <h5 className="font-medium mb-1 text-blue-400">Driving Impact:</h5>
                    <p>{alert.drivingImpact || 'Reduced visibility and traction. Drive with caution.'}</p>
                    
                    {alert.recommendation && (
                      <div className="mt-2">
                        <h5 className="font-medium mb-1 text-green-400">Recommendation:</h5>
                        <p>{alert.recommendation}</p>
                      </div>
                    )}
                  </div>
                  
                  {alert.timeframe && (
                    <div className="mt-2 text-xs text-gray-400">
                      {alert.timeframe}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400 text-sm">
          <p>No active weather alerts for this location.</p>
          <p className="text-xs mt-1">Drive safe and enjoy clear conditions!</p>
        </div>
      )}
    </div>
  );
}

export default WeatherAlertsDashboard;