import React, { useState } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';

/**
 * CitySearch - Component for searching and adding locations
 */
const CitySearch = () => {
  const { addLocation, savedLocations } = useLocation();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search for locations');
      }
      
      const data = await response.json();
      
      // Filter out locations already saved
      const filteredResults = data.results.filter(
        result => !savedLocations.some(saved => 
          saved.lat === result.lat && saved.lon === result.lon
        )
      );
      
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Location search error:', err);
      setError('Unable to search for locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddLocation = (location) => {
    addLocation(location);
    
    // Remove this location from search results
    setSearchResults(prev => 
      prev.filter(result => 
        !(result.lat === location.lat && result.lon === location.lon)
      )
    );
  };
  
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 mb-6">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location..."
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="absolute inset-y-0 right-0 px-3 flex items-center bg-blue-600 text-white rounded-r-md disabled:bg-gray-600 disabled:text-gray-300"
        >
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
        </button>
      </form>
      
      {error && (
        <div className="mt-2 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-400 mb-1">Search Results:</div>
          {searchResults.map((result, index) => (
            <div 
              key={`${result.lat}-${result.lon}-${index}`}
              className="flex items-center justify-between p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MapPin size={14} className="text-gray-400" />
                <div className="text-sm text-white">{result.name}</div>
                {result.country && (
                  <div className="text-xs text-gray-400">{result.country}</div>
                )}
              </div>
              <button
                onClick={() => handleAddLocation(result)}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-md"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearch;