import React from 'react';
import { useLocation } from '../contexts/LocationContext';
import { useWeather } from '../contexts/WeatherContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X } from 'lucide-react';

const LocationPermissionPrompt = ({ open, onOpenChange }) => {
  const { saveLocation } = useLocation();
  const { fetchWeatherData } = useWeather();

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Format a readable location name
          const locationName = "Current Location";
          
          // Save to location context
          const locationData = {
            id: Date.now(),
            name: locationName,
            coordinates: { lat: latitude, lon: longitude },
            country: 'US' // Default
          };
          
          saveLocation(locationData);
          
          // Fetch weather for this location
          fetchWeatherData(latitude, longitude);
          
          // Close the dialog
          onOpenChange(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "You denied the request for geolocation.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get your location timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred.";
          }
          
          alert(errorMessage);
          // Keep dialog open so user can see the error and try again
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Error in geolocation API:", error);
      alert("Failed to access your location. Please try again or enter your location manually.");
    }
  };

  const handleOpenSettings = () => {
    // This would ideally open browser location settings
    // But that's not standardized across browsers, so just show instructions
    alert(
      "Please enable location access in your browser settings:\n\n" +
      "Chrome: Settings > Privacy and security > Site settings > Location\n" +
      "Firefox: Preferences > Privacy & Security > Permissions > Location\n" +
      "Safari: Preferences > Websites > Location\n\n" +
      "After enabling, refresh the page and try again."
    );
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <div className="flex items-center mb-2">
            <Navigation className="mr-2 h-6 w-6 text-blue-400" />
            <DialogTitle>Location Access</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            To provide accurate weather for your location, we need permission to access your device's location.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4">
          <div className="bg-gray-700/50 p-4 rounded-md text-sm space-y-3">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Enhances Your Experience</p>
                <p className="text-gray-400">Get precise local weather and road conditions</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Privacy Respected</p>
                <p className="text-gray-400">Your location is never stored on our servers</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>You can change this permission at any time in your browser settings.</p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
          <Button variant="outline" className="border-gray-600 hover:bg-gray-700" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          
          <div className="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
            <Button variant="outline" className="border-gray-600 hover:bg-gray-700" onClick={handleOpenSettings}>
              Settings
            </Button>
            <Button onClick={handleGetLocation} className="bg-blue-600 hover:bg-blue-700">
              <MapPin className="mr-2 h-4 w-4" />
              Allow Location Access
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPermissionPrompt;