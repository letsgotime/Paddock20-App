import React, { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';

/**
 * Location Permission Prompt
 * Requests user permission to access their location for weather data
 */
const LocationPermissionPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Check if we already have permission or if the user has dismissed this prompt
    const hasLocationPermission = localStorage.getItem('location_permission') === 'granted';
    const hasPromptDismissed = localStorage.getItem('location_prompt_dismissed') === 'true';
    
    if (!hasLocationPermission && !hasPromptDismissed) {
      // Show the prompt after a short delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleAllowLocation = () => {
    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Permission granted
          localStorage.setItem('location_permission', 'granted');
          localStorage.setItem('user_lat', position.coords.latitude);
          localStorage.setItem('user_lon', position.coords.longitude);
          setShowPrompt(false);
          
          // Reload to refresh weather with new coordinates
          window.location.reload();
        },
        (error) => {
          // Permission denied or error
          console.error('Error obtaining location:', error);
          localStorage.setItem('location_permission', 'denied');
          setShowPrompt(false);
        }
      );
    }
  };
  
  const handleDismiss = () => {
    localStorage.setItem('location_prompt_dismissed', 'true');
    setShowPrompt(false);
  };
  
  if (!showPrompt) return null;
  
  return (
    <div className="mb-6 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5 bg-blue-500/20 p-2 rounded-full">
            <MapPin className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-white mb-1">Enable Location Services</h3>
            <p className="text-sm text-gray-300">
              Allow access to your location for accurate weather conditions, surface temperatures, and drive mode recommendations for your area.
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss} 
          className="text-gray-400 hover:text-white"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex justify-end mt-4 space-x-3">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md"
        >
          Not Now
        </button>
        <button
          onClick={handleAllowLocation}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md"
        >
          Enable Location
        </button>
      </div>
    </div>
  );
};

export default LocationPermissionPrompt;