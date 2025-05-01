import React, { useState, useEffect } from 'react';

function LocationManager({ onSelectLocation }) {
  const [savedLocations, setSavedLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', type: 'other', coords: null });
  const [isAdding, setIsAdding] = useState(false);
  const [locationTypes, setLocationTypes] = useState([
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'school', label: 'School', icon: '🎓' },
    { id: 'favorite', label: 'Favorite', icon: '⭐' },
    { id: 'other', label: 'Other', icon: '📍' }
  ]);

  // Load saved locations from localStorage on component mount
  useEffect(() => {
    const loadSavedLocations = () => {
      const saved = localStorage.getItem('savedLocations');
      if (saved) {
        try {
          setSavedLocations(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved locations:', e);
          setSavedLocations([]);
        }
      }
    };
    
    loadSavedLocations();
  }, []);
  
  // Save locations to localStorage whenever they change
  useEffect(() => {
    if (savedLocations.length > 0) {
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    }
  }, [savedLocations]);
  
  const handleAddLocation = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newLocation.name || !newLocation.address) {
      alert('Please enter a name and address for the location');
      return;
    }
    
    // Create a new location object
    const locationToAdd = {
      ...newLocation,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString()
    };
    
    // If we don't have coordinates, we'll need to geocode the address
    // For now, we'll use placeholder coordinates
    if (!locationToAdd.coords) {
      // In a real app, we would use a geocoding service here
      // For now, we'll just use Charlotte's coordinates as a placeholder
      locationToAdd.coords = { lat: 35.2271, lon: -80.8431 };
    }
    
    // Add the new location to our savedLocations state
    setSavedLocations([...savedLocations, locationToAdd]);
    
    // Reset the form
    setNewLocation({ name: '', address: '', type: 'other', coords: null });
    setIsAdding(false);
  };
  
  const handleRemoveLocation = (id) => {
    setSavedLocations(savedLocations.filter(location => location.id !== id));
  };
  
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewLocation({
            ...newLocation,
            coords: {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            }
          });
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Unable to get your current location. Please enter an address manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  
  const getLocationIcon = (typeId) => {
    const locationType = locationTypes.find(type => type.id === typeId);
    return locationType ? locationType.icon : '📍';
  };
  
  const handleSelectLocation = (location) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
  };
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center">
          <span className="h-2 w-2 bg-indigo-500 rounded-full mr-2"></span>
          MY LOCATIONS
        </h3>
        <button 
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? 'Cancel' : '+ Add Location'}
        </button>
      </div>
      
      {isAdding && (
        <div className="mb-4 p-3 bg-gray-900/60 rounded-md">
          <form onSubmit={handleAddLocation}>
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Location Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="e.g. My Office"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Address</label>
              <input 
                type="text" 
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                value={newLocation.address}
                onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                placeholder="Full address"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Location Type</label>
              <div className="flex space-x-2">
                {locationTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    className={`p-2 rounded ${newLocation.type === type.id ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => setNewLocation({ ...newLocation, type: type.id })}
                  >
                    <div className="text-lg">{type.icon}</div>
                    <div className="text-xs">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center"
                onClick={getCurrentLocation}
              >
                <span className="mr-1">📍</span> Use Current
              </button>
              <button
                type="submit"
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
              >
                Save Location
              </button>
            </div>
          </form>
        </div>
      )}
      
      {savedLocations.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-sm">
          <p>No saved locations yet.</p>
          <p>Add your favorite places to see detailed weather information.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {savedLocations.map(location => (
            <div 
              key={location.id}
              className="bg-gray-700/40 rounded p-3 flex justify-between items-center hover:bg-gray-700/60 cursor-pointer"
              onClick={() => handleSelectLocation(location)}
            >
              <div className="flex items-center">
                <div className="text-xl mr-2">{getLocationIcon(location.type)}</div>
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-gray-400 line-clamp-1">{location.address}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open in Google Maps
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
                    window.open(url, '_blank');
                  }}
                >
                  🗺️
                </button>
                <button 
                  className="text-gray-400 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLocation(location.id);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationManager;