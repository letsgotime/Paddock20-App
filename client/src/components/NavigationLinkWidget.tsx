import React, { useState } from 'react';
import { Navigation, MapPin, ExternalLink, Car, Map } from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';

interface Location {
  name: string;
  lat: number;
  lon: number;
}

interface NavigationLinkWidgetProps {
  currentLocation?: Location;
  favoriteLocations?: Array<{
    id: string | number;
    name: string;
    latitude: number;
    longitude: number;
    type: string;
    icon?: React.ReactNode;
  }>;
}

const NavigationLinkWidget: React.FC<NavigationLinkWidgetProps> = ({ 
  currentLocation,
  favoriteLocations = [
    { 
      id: 1, 
      name: 'Work', 
      latitude: 35.227085, 
      longitude: -80.843124,
      type: 'work',
      icon: <MapPin className="h-4 w-4" />
    },
    { 
      id: 2, 
      name: 'Home', 
      latitude: 35.046680, 
      longitude: -80.824850,
      type: 'home',
      icon: <MapPin className="h-4 w-4" />
    }
  ] 
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{id: string | number, latitude: number, longitude: number, name: string} | null>(null);
  
  // Create deep links for various navigation apps
  const getNavigationLinks = (destination: {latitude: number, longitude: number, name: string}) => {
    // Encode the destination name for URLs
    const encodedName = encodeURIComponent(destination.name);
    
    // Google Maps deep link format
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&destination_place_id=${encodedName}`;
    
    // Apple Maps deep link format
    const appleMapsUrl = `maps://maps.apple.com/?daddr=${destination.latitude},${destination.longitude}&dirflg=d&t=m`;
    
    // Waze deep link format
    const wazeUrl = `https://waze.com/ul?ll=${destination.latitude},${destination.longitude}&navigate=yes&z=10`;
    
    return { googleMapsUrl, appleMapsUrl, wazeUrl };
  };
  
  // Detect device OS for default navigation app
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  const isIOS = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  };
  
  const handleOpenMaps = (type: 'google' | 'apple' | 'waze') => {
    if (!selectedLocation) return;
    
    const { googleMapsUrl, appleMapsUrl, wazeUrl } = getNavigationLinks(selectedLocation);
    
    // Open the appropriate URL based on selection
    let url = googleMapsUrl;
    if (type === 'apple') url = appleMapsUrl;
    if (type === 'waze') url = wazeUrl;
    
    // Open in a new tab/window
    window.open(url, '_blank');
  };
  
  const getPreferredNavigationApp = () => {
    if (isIOS()) {
      return { name: 'Apple Maps', type: 'apple', icon: <Map className="h-4 w-4 mr-2" /> };
    }
    return { name: 'Google Maps', type: 'google', icon: <Map className="h-4 w-4 mr-2" /> };
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
        <h3 className="text-blue-400 font-semibold flex items-center">
          <Navigation className="h-4 w-4 mr-2" />
          <span>Weather-Informed Navigation</span>
        </h3>
        <span className="text-xs text-gray-400">Drive smarter</span>
      </div>
      
      <div className="p-4">
        {!selectedLocation ? (
          <>
            <p className="text-gray-300 text-sm mb-4">
              Get directions with real-time weather conditions along your route:
            </p>
            
            <div className="space-y-3 mb-4">
              {favoriteLocations.map((location) => (
                <div 
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-blue-900/20 hover:border-blue-700/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-3">
                      {location.icon || <MapPin className="h-4 w-4" />}
                    </span>
                    <div>
                      <h4 className="text-white text-md">{location.name}</h4>
                      <p className="text-xs text-gray-400 capitalize">{location.type} destination</p>
                    </div>
                  </div>
                  <Car className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <button 
                className="w-full py-2 text-sm bg-black border border-blue-800 text-blue-400 rounded-md hover:bg-blue-900/20 transition-colors flex items-center justify-center"
                onClick={() => {
                  // In a real implementation, this would open a modal to add a new location
                  alert('This would open a form to add a new destination');
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Add New Destination
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-white font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                {selectedLocation.name}
              </h4>
              <button 
                onClick={() => setSelectedLocation(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                ← Back to list
              </button>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg border border-blue-900/30 mb-4">
              <h5 className="text-blue-400 text-sm font-bold mb-3">Navigation Options</h5>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleOpenMaps('google')}
                  className="p-3 bg-black/60 border border-blue-900/30 rounded-lg hover:bg-blue-900/20 transition-colors text-left flex items-center"
                >
                  <span className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-3">
                    <Map className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <h6 className="text-white text-sm">Open in Google Maps</h6>
                    <p className="text-xs text-gray-400">Get directions with traffic data</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </button>
                
                <button 
                  onClick={() => handleOpenMaps('apple')}
                  className="p-3 bg-black/60 border border-blue-900/30 rounded-lg hover:bg-blue-900/20 transition-colors text-left flex items-center"
                >
                  <span className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-3">
                    <Map className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <h6 className="text-white text-sm">Open in Apple Maps</h6>
                    <p className="text-xs text-gray-400">iOS native navigation</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </button>
                
                <button 
                  onClick={() => handleOpenMaps('waze')}
                  className="p-3 bg-black/60 border border-blue-900/30 rounded-lg hover:bg-blue-900/20 transition-colors text-left flex items-center"
                >
                  <span className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-3">
                    <Map className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <h6 className="text-white text-sm">Open in Waze</h6>
                    <p className="text-xs text-gray-400">Community-based traffic & navigation</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-900/30">
              <p className="text-sm text-gray-300">
                <span className="text-yellow-400">Weather Advisory:</span> Navigation apps will guide you, but remember to drive according to weather conditions. Your vehicle's response may change in {getCurrentWeatherConditionText()}.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
  
  // Helper function to get current weather description
  function getCurrentWeatherConditionText() {
    // This would normally access the weather context, but is simplified here
    return "current conditions";
  }
};

export default NavigationLinkWidget;