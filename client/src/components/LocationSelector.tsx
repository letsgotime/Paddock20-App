import React, { useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Search, MapPin, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { searchLocation } from '@/lib/weather';
import { Location } from 'shared/schema';

const LocationSelector: React.FC = () => {
  const { 
    selectedLocation, 
    setSelectedLocation, 
    savedLocations, 
    addSavedLocation 
  } = useWeather();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a location to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const locationData = await searchLocation(searchQuery);
      if (locationData) {
        addSavedLocation(locationData);
        setSearchQuery('');
      }
    } catch (error) {
      toast({
        title: "Location Search Failed",
        description: (error as Error).message || "Could not find the specified location",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-grow">
          <label htmlFor="location-search" className="block text-sm font-medium mb-2">Location</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="location-search"
              placeholder="Search for a city..."
              className="w-full pl-10 pr-4 py-3 bg-black text-white rounded-lg border border-gray-700 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full md:w-auto px-6 py-6 bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded-lg font-medium flex items-center justify-center h-11"
          >
            {isSearching ? (
              <div className="flex items-center">
                <span className="animate-spin mr-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Searching...
              </div>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Add Location
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Saved Locations */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Saved Locations</h3>
        <div className="flex flex-wrap gap-2">
          {savedLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className={`location-item ${
                selectedLocation?.id === location.id ? 'bg-blue-500 bg-opacity-20' : 'bg-black'
              } px-4 py-2 rounded-full text-sm flex items-center hover:bg-blue-500 hover:bg-opacity-20 transition-colors`}
            >
              <MapPin className="h-4 w-4 text-blue-400 mr-1" />
              {location.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
