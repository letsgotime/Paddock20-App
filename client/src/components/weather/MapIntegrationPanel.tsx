import React, { useState } from 'react';
import { Navigation, MapPin, Share, Car, ArrowRight } from 'lucide-react';

interface Coordinates {
  lat: number;
  lon: number;
}

interface MapIntegrationPanelProps {
  location: Coordinates;
  locationName?: string;
  className?: string;
}

const MapIntegrationPanel: React.FC<MapIntegrationPanelProps> = ({ 
  location, 
  locationName = 'Selected Location',
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);

  // Format coordinates for display
  const formatCoords = (coords: Coordinates) => {
    return `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`;
  };

  // Handle opening directions in Google Maps
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lon}`;
    window.open(url, '_blank');
  };

  // Handle opening directions in Waze
  const openWaze = () => {
    const url = `https://waze.com/ul?ll=${location.lat},${location.lon}&navigate=yes`;
    window.open(url, '_blank');
  };

  // Handle opening directions in Apple Maps
  const openAppleMaps = () => {
    // Note: Apple Maps uses a different format that will open the maps:// protocol on Apple devices
    // For web, we'll use a fallback that will work on macOS/iOS
    const url = `https://maps.apple.com/?daddr=${location.lat},${location.lon}&dirflg=d`;
    window.open(url, '_blank');
  };

  // Save the location to the user's session for later
  const saveLocationToSession = () => {
    try {
      // Get existing saved locations or initialize empty array
      const existingSavedLocations = JSON.parse(localStorage.getItem('paddock20_saved_map_locations') || '[]');
      
      // Add current location if it doesn't already exist
      const locationExists = existingSavedLocations.some(
        (loc: any) => loc.lat === location.lat && loc.lon === location.lon
      );
      
      if (!locationExists) {
        existingSavedLocations.push({
          lat: location.lat,
          lon: location.lon,
          name: locationName,
          savedAt: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('paddock20_saved_map_locations', JSON.stringify(existingSavedLocations));
        
        // Simulate toast notification
        console.log('Location saved successfully');
      }
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  // Handle sharing the location
  const shareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: `Location: ${locationName}`,
        text: `Check out this location: ${locationName} (${formatCoords(location)})`,
        url: `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareText = `Location: ${locationName} (${formatCoords(location)})
https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareText)
        .then(() => {
          // Simulate toast notification
          console.log('Location copied to clipboard');
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
        });
    }
  };

  return (
    <div className={`map-integration-panel bg-black bg-opacity-80 rounded-lg border border-gray-800 ${className}`}>
      <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center">
          <Navigation className="text-[#1982FC] mr-2" size={20} />
          <div>
            <h3 className="text-white font-medium">{locationName}</h3>
            <p className="text-gray-400 text-xs">{formatCoords(location)}</p>
          </div>
        </div>
        <ArrowRight className={`text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} size={18} />
      </div>
      
      {expanded && (
        <div className="p-3 pt-0 border-t border-gray-800 mt-2">
          <p className="text-sm text-gray-300 mb-3">Get directions using your preferred navigation app:</p>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button 
              onClick={openGoogleMaps}
              className="flex flex-col items-center bg-gray-900 hover:bg-gray-800 p-2 rounded transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mb-1">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-white text-xs">Google Maps</span>
            </button>
            
            <button 
              onClick={openWaze}
              className="flex flex-col items-center bg-gray-900 hover:bg-gray-800 p-2 rounded transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center mb-1">
                <Car className="text-white" size={16} />
              </div>
              <span className="text-white text-xs">Waze</span>
            </button>
            
            <button 
              onClick={openAppleMaps}
              className="flex flex-col items-center bg-gray-900 hover:bg-gray-800 p-2 rounded transition"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                <MapPin className="text-gray-800" size={16} />
              </div>
              <span className="text-white text-xs">Apple Maps</span>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={saveLocationToSession}
              className="flex-1 flex items-center justify-center bg-[#08c519] text-white py-1.5 px-3 rounded text-sm"
            >
              <MapPin size={14} className="mr-1.5" />
              Save Location
            </button>
            
            <button 
              onClick={shareLocation}
              className="flex items-center justify-center bg-gray-700 text-white py-1.5 px-3 rounded text-sm"
            >
              <Share size={14} className="mr-1.5" />
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapIntegrationPanel;