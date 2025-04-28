import React, { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';

const WeatherLocationSelector = ({ onLocationChange, className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lat: null,
    lon: null,
    name: "Fetching location..."
  });
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Get current location using browser's geolocation API
  const getCurrentLocation = () => {
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get location name
          try {
            const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
            if (!response.ok) throw new Error('Failed to get location name');
            
            const data = await response.json();
            const locationName = data.length > 0 
              ? `${data[0].name}${data[0].state ? `, ${data[0].state}` : ''}`
              : 'Current Location';
            
            setCurrentLocation({
              lat: latitude,
              lon: longitude,
              name: locationName
            });
            
            // Notify parent component of location change
            onLocationChange({ lat: latitude, lon: longitude, name: locationName });
          } catch (error) {
            console.error('Error getting location name:', error);
            setCurrentLocation({
              lat: latitude,
              lon: longitude,
              name: 'Current Location'
            });
            
            // Still notify parent with coordinates
            onLocationChange({ lat: latitude, lon: longitude, name: 'Current Location' });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Please enable location services.');
          
          // Default to Charlotte, NC if location access is denied
          setCurrentLocation({
            lat: 35.2271,
            lon: -80.8431,
            name: 'Charlotte, NC (Default)'
          });
          
          onLocationChange({ lat: 35.2271, lon: -80.8431, name: 'Charlotte, NC (Default)' });
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      
      // Default to Charlotte, NC if geolocation is not supported
      setCurrentLocation({
        lat: 35.2271,
        lon: -80.8431,
        name: 'Charlotte, NC (Default)'
      });
      
      onLocationChange({ lat: 35.2271, lon: -80.8431, name: 'Charlotte, NC (Default)' });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      searchLocation(e.target.value);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Search for location using OpenWeather Geocoding API
  const searchLocation = async (query) => {
    if (!query || query.length < 3) return;
    
    setSearching(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Location search failed');
      
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching location:', error);
      setError('Location search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Handle location selection from search results
  const handleSelectLocation = (location) => {
    const locationName = `${location.name}${location.state ? `, ${location.state}` : ''}`;
    
    setCurrentLocation({
      lat: location.lat,
      lon: location.lon,
      name: locationName
    });
    
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    
    // Notify parent component of location change
    onLocationChange({ 
      lat: location.lat, 
      lon: location.lon, 
      name: locationName 
    });
  };

  // Clear search and reset to current location
  const handleResetToCurrentLocation = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    getCurrentLocation();
  };

  return (
    <div className={`weather-location-selector ${className}`}>
      <div className="flex items-center mb-2">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Enter city or zip code"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-2.5"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        <button 
          onClick={handleResetToCurrentLocation}
          className="ml-2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"
          title="Use current location"
        >
          <MapPin className="h-5 w-5" />
        </button>
      </div>
      
      {error && (
        <div className="text-red-400 text-sm mb-2">{error}</div>
      )}
      
      <div className="text-blue-400 text-sm font-medium flex items-center mb-3">
        <MapPin className="h-3 w-3 mr-1" />
        <span>{currentLocation.name || 'Unknown location'}</span>
      </div>
      
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <div 
              key={index}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
              onClick={() => handleSelectLocation(result)}
            >
              {result.name}{result.state ? `, ${result.state}` : ''}{result.country ? ` (${result.country})` : ''}
            </div>
          ))}
        </div>
      )}
      
      {showResults && searchResults.length === 0 && !searching && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 text-gray-300">
          No locations found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default WeatherLocationSelector;