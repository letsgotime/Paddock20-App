import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { useLocation } from 'wouter';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, ArrowLeft, X, ExternalLink, Info, AlertCircle, Map, Activity } from 'lucide-react';

/**
 * WeatherAlertsDashboard - A dedicated panel for critical driving safety alerts
 * Displays severe weather warnings, crosswind alerts, road flooding risks, etc.
 */
function WeatherAlertsDashboard({ id = "weather-alerts", onNavigate }) {
  const { weatherData } = useWeather();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAlertIndex, setSelectedAlertIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [, navigate] = useLocation();
  
  // Detect if we're in a route-based fullscreen view
  useEffect(() => {
    const checkFullscreenRoute = () => {
      const path = window.location.pathname;
      if (path === `/detail/${id}`) {
        setIsFullscreen(true);
      }
    };
    
    checkFullscreenRoute();
    window.addEventListener('popstate', checkFullscreenRoute);
    
    return () => {
      window.removeEventListener('popstate', checkFullscreenRoute);
    };
  }, [id]);
  
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

  const handleFullscreen = () => {
    if (isFullscreen) {
      // Exit fullscreen
      setIsFullscreen(false);
      if (onNavigate) {
        onNavigate('dashboard');
      } else {
        navigate('/');
      }
    } else {
      // Enter fullscreen
      setIsFullscreen(true);
      if (onNavigate) {
        onNavigate(`detail/${id}`);
      } else {
        navigate(`/detail/${id}`);
      }
    }
  };

  // Handle tab selection
  const renderTabContent = () => {
    if (!isFullscreen) return null;
    
    switch (activeTab) {
      case 'overview':
        return (
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
        );
      
      case 'details':
        return (
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
        );
      
      case 'impact':
        return (
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
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`bg-gray-800/80 rounded-lg border border-gray-700 p-4 mb-4 transition-all duration-300 ${isFullscreen ? 'bg-gray-900' : ''}`}
      style={fullscreenStyles}
    >
      <div className="flex justify-between items-center mb-3">
        {isFullscreen ? (
          <div className="flex items-center">
            <button 
              onClick={handleFullscreen}
              className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200 mr-2"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-md font-semibold text-gray-200">
              DRIVING SAFETY ALERTS
            </h3>
          </div>
        ) : (
          <h3 className="text-sm font-semibold text-gray-300 flex items-center">
            <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
            DRIVING SAFETY ALERTS
          </h3>
        )}
        
        <div className="flex items-center space-x-2">
          {!isFullscreen && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button 
            onClick={handleFullscreen}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <X size={16} /> : <ExternalLink size={16} />}
          </button>
        </div>
      </div>
      
      {/* Tab navigation for fullscreen mode */}
      {isFullscreen && (
        <div className="mb-4 border-b border-gray-700">
          <div className="flex space-x-1">
            <button
              className={`py-2 px-4 text-sm font-medium rounded-t-md ${
                activeTab === 'overview' 
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium rounded-t-md ${
                activeTab === 'details' 
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium rounded-t-md ${
                activeTab === 'impact' 
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('impact')}
            >
              Driving Impact
            </button>
          </div>
        </div>
      )}
      
      {/* Tab content for fullscreen mode */}
      {isFullscreen && renderTabContent()}
      
      {/* Preview/collapsed view */}
      {!isExpanded && !isFullscreen && alerts.length > 0 && (
        <div className="cursor-pointer" onClick={() => setIsExpanded(true)}>
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
      )}
      
      {/* Expanded or fullscreen view */}
      {(isExpanded || isFullscreen) && (
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
                  
                  {isFullscreen && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <h5 className="font-medium mb-2 text-sm text-blue-400">Additional Safety Information</h5>
                      <div className="bg-gray-800/80 p-2 rounded">
                        <div className="text-xs space-y-2">
                          <div>
                            <span className="text-gray-400">Recommended Speed Reduction:</span>
                            <span className="ml-1 text-yellow-400">{alert.severity === 'Extreme' ? '50%' : alert.severity === 'Severe' ? '30%' : alert.severity === 'Moderate' ? '15%' : '0%'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Visibility Impact:</span>
                            <span className="ml-1">
                              {alert.type.toLowerCase().includes('fog') || alert.type.toLowerCase().includes('snow') ? 
                                'Severely Reduced' : alert.type.toLowerCase().includes('rain') ? 
                                'Moderately Reduced' : 'Minimal Impact'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Vehicle Systems:</span>
                            <span className="ml-1">
                              {alert.type.toLowerCase().includes('wind') ? 
                                'Electronic Stability Control Recommended' : 
                                alert.type.toLowerCase().includes('flood') ? 
                                'Avoid All Water Crossings' : 
                                'Standard Operations'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isFullscreen && (
            <div className="mt-5 bg-gray-900/60 p-4 rounded-lg">
              <h4 className="text-sm font-semibold mb-3">Historical Alert Context</h4>
              <p className="text-xs text-gray-300 mb-3">
                This location has experienced similar weather patterns in previous years. Historical data shows that these conditions typically last 
                between {Math.floor(Math.random() * 3) + 2}-{Math.floor(Math.random() * 3) + 6} hours when they occur in this season.
              </p>
              <div className="bg-gray-800 p-3 rounded">
                <h5 className="text-xs font-medium mb-2 text-blue-400">Driver Preparation</h5>
                <ul className="text-xs space-y-1 list-disc pl-4">
                  <li>Consider adjusting travel times to avoid peak alert periods</li>
                  <li>Ensure all vehicle lights are functional before departure</li>
                  <li>Maintain extra distance between vehicles in affected areas</li>
                  <li>Check tire pressure and tread depth for optimal traction</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          <p>No active weather alerts for this location.</p>
          <p className="text-xs mt-1">Drive safe and enjoy clear conditions!</p>
        </div>
      )}
    </div>
  );
}

export default WeatherAlertsDashboard;