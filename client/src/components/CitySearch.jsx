import React, { useState, useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { useWeather } from '../contexts/WeatherContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';

const CitySearch = ({ open, onOpenChange }) => {
  const { saveLocation } = useLocation();
  const { fetchWeatherData } = useWeather();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);

  // Real search functionality using OpenWeather geocoding API
  const searchCities = async (query) => {
    if (!query.trim()) return;
    
    setSearching(true);
    setError(null);
    
    try {
      // Make real API call to OpenWeather geocoding API
      const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=2379a18ee0e478c88aa7d4aa1df44410`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match our expected format
      const formattedResults = data.map((item, index) => ({
        id: index,
        name: item.name,
        state: item.state || '',
        country: item.country,
        coordinates: {
          lat: item.lat,
          lon: item.lon
        }
      }));
      
      setSearchResults(formattedResults);
      
      if (formattedResults.length === 0) {
        setError("No locations found for your search. Try a different search term.");
      }
    } catch (err) {
      console.error("Error searching cities:", err);
      setError(`Failed to search locations: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = () => {
    searchCities(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    setGettingCurrentLocation(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setGettingCurrentLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get location name
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=2379a18ee0e478c88aa7d4aa1df44410`
          );
          
          if (!response.ok) {
            throw new Error(`Reverse geocoding failed: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          if (data && data.length > 0) {
            const locationData = {
              id: Date.now(),
              name: data[0].name,
              state: data[0].state || '',
              country: data[0].country,
              coordinates: {
                lat: latitude,
                lon: longitude
              }
            };
            
            handleSelectLocation(locationData);
          } else {
            throw new Error("No location found for these coordinates");
          }
        } catch (err) {
          console.error("Error getting current location:", err);
          setError(`Failed to get current location: ${err.message}`);
        } finally {
          setGettingCurrentLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError(`Geolocation error: ${error.message}`);
        setGettingCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSelectLocation = (location) => {
    // Save location to the saved locations list
    const locationToSave = {
      id: Date.now(),
      name: `${location.name}${location.state ? `, ${location.state}` : ''}`,
      coordinates: location.coordinates,
      country: location.country
    };
    
    saveLocation(locationToSave);
    
    // Fetch weather for this location
    fetchWeatherData(location.coordinates.lat, location.coordinates.lon);
    
    // Close the dialog
    onOpenChange(false);
  };

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open, setSearchQuery, setSearchResults]);

  // Search when query changes (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchCities(searchQuery);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search Location</DialogTitle>
          <DialogDescription className="text-gray-400">
            Find a location to view weather conditions
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter city name..."
            className="pr-10 bg-gray-700 border-gray-600"
          />
          <Button 
            size="sm" 
            variant="ghost" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
          onClick={getCurrentLocation}
          disabled={gettingCurrentLocation}
        >
          <Navigation className="h-4 w-4 mr-2" />
          {gettingCurrentLocation ? 'Getting Location...' : 'Use Current Location'}
        </Button>
        
        {error && (
          <div className="text-red-400 text-sm mt-2">{error}</div>
        )}
        
        {searching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
            {searchResults?.map((location) => (
              <div
                key={location.id}
                className="flex items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer"
                onClick={() => handleSelectLocation(location)}
              >
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-gray-400">{location.state}, {location.country}</div>
                </div>
              </div>
            ))}
            
            {searchQuery && (!searchResults || searchResults.length === 0) && !searching && (
              <div className="text-gray-400 text-sm py-2">No locations found</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CitySearch;