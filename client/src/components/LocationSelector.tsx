import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { 
  LocationSearchResult, 
  searchLocationsByName, 
  getLocationNameByCoordinates 
} from '@/services/openWeatherService';
import { Command } from '@/components/ui/command';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LocationSelector = () => {
  const { 
    selectedLocation,
    setSelectedLocation,
    setCoordinates
  } = useWeather();
  
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Handle search input
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const results = await searchLocationsByName(query);
      // Format location names with city, state (if available), and country
      const formattedResults = results.map(loc => ({
        ...loc,
        formattedName: loc.state 
          ? `${loc.name}, ${loc.state}, ${loc.country}` 
          : `${loc.name}, ${loc.country}`
      }));
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching for locations:', error);
      setSearchError('Error searching for locations. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Use current location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates(latitude, longitude);
          
          try {
            const locationInfo = await getLocationNameByCoordinates(latitude, longitude);
            if (locationInfo) {
              setSelectedLocation(locationInfo);
            }
          } catch (error) {
            console.error('Error fetching location name:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };
  
  // Handle location selection
  const selectLocation = (location: LocationSearchResult) => {
    setSelectedLocation(location);
    setCoordinates(location.lat, location.lon);
    setOpen(false);
    setQuery('');
  };
  
  // Handle input keydown events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <div className="flex items-center justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full max-w-md border-gray-700 bg-black/50 hover:bg-black hover:border-blue-500 flex justify-between"
          >
            <span className="flex items-center text-gray-300">
              <MapPin className="mr-2 h-4 w-4 text-blue-400" />
              {selectedLocation?.name 
                ? selectedLocation.state 
                  ? `${selectedLocation.name}, ${selectedLocation.state}` 
                  : selectedLocation.name
                : "Select location"
              }
            </span>
            <Badge variant="outline" className="ml-2 text-xs">
              {selectedLocation?.country || ""}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px] border-gray-700 bg-gradient-to-br from-gray-900 to-black">
          <Command className="bg-transparent">
            <div className="flex items-center border-b border-gray-800 p-2">
              <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 text-white"
                placeholder="Search locations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-2 text-xs" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                ) : "Search"}
              </Button>
            </div>
            <div className="max-h-60 overflow-auto p-2">
              {searchError && (
                <p className="text-red-400 text-sm p-2">{searchError}</p>
              )}
              
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((location) => (
                    <div
                      key={`${location.lat}-${location.lon}`}
                      className="flex cursor-pointer items-center rounded-md px-2 py-2 hover:bg-gray-800 text-white"
                      onClick={() => selectLocation(location)}
                    >
                      <MapPin className="mr-2 h-4 w-4 text-blue-400" />
                      <span>{location.formattedName}</span>
                    </div>
                  ))}
                </div>
              ) : !isSearching && query.trim() !== "" && !searchError ? (
                <p className="text-sm text-gray-400 p-2">No locations found. Try another search term.</p>
              ) : null}
              
              <div className="mt-4 pt-4 border-t border-gray-800">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-start text-blue-400 hover:text-blue-500 hover:bg-gray-800"
                  onClick={handleUseCurrentLocation}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Use my current location
                </Button>
              </div>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationSelector;