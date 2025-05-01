import React from 'react';
import { AlertTriangle, Info, Wind, Thermometer, CloudRain, Snowflake, Eye } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { useLocation } from '../hooks/useLocation';

/**
 * WeatherAlertsDashboard - Displays weather alerts and safety notifications
 */
const WeatherAlertsDashboard = () => {
  const { currentWeather, weatherAlerts, isLoading } = useWeather();
  const { activeLocationData } = useLocation();
  
  if (isLoading || !currentWeather) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Determine if there are weather conditions warranting an alert
  const generateWeatherAlerts = () => {
    const alerts = [];
    
    if (!currentWeather) return alerts;
    
    const weatherId = currentWeather.weather?.[0]?.id || 0;
    const temp = currentWeather.main?.temp || 0;
    const visibility = currentWeather.visibility || 10000;
    const windSpeed = currentWeather.wind?.speed || 0;
    
    // Extreme temperature alerts
    if (temp < 32) {
      alerts.push({
        type: 'severe',
        title: 'Freezing Conditions',
        message: 'Roads may have ice. Reduce speed and increase following distance.',
        icon: <Thermometer size={18} />,
        id: 'freeze-alert'
      });
    } else if (temp > 100) {
      alerts.push({
        type: 'warning',
        title: 'Extreme Heat',
        message: 'Vehicle overheating risk. Monitor temperature gauge closely.',
        icon: <Thermometer size={18} />,
        id: 'heat-alert'
      });
    }
    
    // Wind alerts
    if (windSpeed > 20) {
      alerts.push({
        type: 'warning',
        title: 'High Winds',
        message: 'Strong crosswinds may affect vehicle stability. Maintain firm grip on steering wheel.',
        icon: <Wind size={18} />,
        id: 'wind-alert'
      });
    }
    
    // Rain alerts
    if (weatherId >= 500 && weatherId < 600) {
      // Heavy rain
      if (weatherId >= 502) {
        alerts.push({
          type: 'severe',
          title: 'Heavy Rain',
          message: 'Reduced visibility and hydroplaning risk. Slow down and use headlights.',
          icon: <CloudRain size={18} />,
          id: 'rain-alert'
        });
      } 
      // Light/moderate rain
      else {
        alerts.push({
          type: 'info',
          title: 'Rain Conditions',
          message: 'Roads may be slippery. Maintain safe following distance.',
          icon: <CloudRain size={18} />,
          id: 'light-rain-alert'
        });
      }
    }
    
    // Snow alerts
    if (weatherId >= 600 && weatherId < 700) {
      alerts.push({
        type: 'severe',
        title: 'Snow/Sleet',
        message: 'Slippery roads and reduced traction. Drive with caution and allow extra time.',
        icon: <Snowflake size={18} />,
        id: 'snow-alert'
      });
    }
    
    // Visibility alerts
    if (visibility < 3000) {
      alerts.push({
        type: 'warning',
        title: 'Low Visibility',
        message: 'Fog or haze reducing visibility. Use fog lights and reduce speed.',
        icon: <Eye size={18} />,
        id: 'visibility-alert'
      });
    }
    
    return alerts;
  };
  
  const alerts = generateWeatherAlerts();
  const hasAlerts = alerts.length > 0;
  
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-medium flex items-center mb-3">
          <AlertTriangle className="mr-2 text-blue-400" size={20} />
          <span className="text-white">Driving Safety Alerts</span>
        </h3>
        
        {hasAlerts ? (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3 rounded-md flex items-start ${
                  alert.type === 'severe' 
                    ? 'bg-red-900/30 border border-red-800' 
                    : alert.type === 'warning'
                    ? 'bg-amber-900/30 border border-amber-800'
                    : 'bg-blue-900/30 border border-blue-800'
                }`}
              >
                <div className={`p-1.5 rounded-full mr-3 flex-shrink-0 ${
                  alert.type === 'severe' 
                    ? 'bg-red-500/20 text-red-400' 
                    : alert.type === 'warning'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {alert.icon}
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium mb-0.5 ${
                    alert.type === 'severe' 
                      ? 'text-red-300' 
                      : alert.type === 'warning'
                      ? 'text-amber-300'
                      : 'text-blue-300'
                  }`}>
                    {alert.title}
                  </div>
                  <div className="text-sm text-gray-300">
                    {alert.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-green-800 bg-green-900/20 rounded-md">
            <div className="inline-flex bg-green-500/20 p-2 rounded-full mb-3">
              <Info className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-green-300 font-medium mb-1">Safe Driving Conditions</h3>
            <p className="text-gray-300 text-sm">
              No weather alerts for {activeLocationData?.name || 'your location'} at this time.
            </p>
          </div>
        )}
      </div>
      
      {hasAlerts && (
        <div className="px-4 py-3 bg-gray-750 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Weather alerts are generated based on real-time conditions and may change rapidly.
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherAlertsDashboard;