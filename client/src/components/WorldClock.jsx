import React, { useState, useEffect } from 'react';
import { Clock, PlusCircle, X, Globe, Settings, Check } from 'lucide-react';

/**
 * WorldClock Component
 * Displays time across multiple user-selected locations worldwide
 */
const WorldClock = () => {
  // Default locations - popular car enthusiast/racing destinations
  const defaultLocations = [
    { name: 'Monaco', timezone: 'Europe/Monaco', notes: 'F1 Circuit' },
    { name: 'Silverstone', timezone: 'Europe/London', notes: 'F1 Circuit' },
    { name: 'Suzuka', timezone: 'Asia/Tokyo', notes: 'F1 Circuit' },
    { name: 'Austin', timezone: 'America/Chicago', notes: 'COTA' },
    { name: 'Spa', timezone: 'Europe/Brussels', notes: 'F1 Circuit' }
  ];

  const [locations, setLocations] = useState(() => {
    // Try to load saved locations from localStorage
    const saved = localStorage.getItem('worldClockLocations');
    return saved ? JSON.parse(saved) : defaultLocations.slice(0, 3); // Start with 3 default locations
  });
  
  const [times, setTimes] = useState({});
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', timezone: '', notes: '' });
  const [availableTimezones, setAvailableTimezones] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // Fetch available timezones on component mount
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const response = await fetch('/api/timezones');
        if (response.ok) {
          const data = await response.json();
          setAvailableTimezones(data);
        }
      } catch (error) {
        console.error('Error fetching timezones:', error);
        
        // Fallback to a subset of common timezones if API fails
        setAvailableTimezones([
          'America/New_York',
          'America/Chicago', 
          'America/Denver',
          'America/Los_Angeles',
          'Europe/London',
          'Europe/Paris',
          'Europe/Berlin',
          'Europe/Rome',
          'Europe/Moscow',
          'Europe/Monaco',
          'Europe/Brussels',
          'Asia/Tokyo',
          'Asia/Singapore',
          'Asia/Dubai',
          'Australia/Sydney',
          'Pacific/Auckland'
        ]);
      }
    };
    
    fetchTimezones();
  }, []);
  
  // Update times every second
  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      
      locations.forEach(location => {
        try {
          const time = new Date().toLocaleTimeString('en-US', {
            timeZone: location.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          const date = new Date().toLocaleDateString('en-US', {
            timeZone: location.timezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          
          newTimes[location.timezone] = { time, date };
        } catch (error) {
          console.error(`Error with timezone ${location.timezone}:`, error);
          newTimes[location.timezone] = { 
            time: 'Invalid', 
            date: 'Invalid timezone' 
          };
        }
      });
      
      setTimes(newTimes);
    };
    
    // Update immediately
    updateTimes();
    
    // Then update every second
    const interval = setInterval(updateTimes, 1000);
    
    return () => clearInterval(interval);
  }, [locations]);
  
  // Save locations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('worldClockLocations', JSON.stringify(locations));
  }, [locations]);
  
  // Add a new location
  const handleAddLocation = () => {
    if (locations.length >= 5) {
      alert('Maximum of 5 locations allowed. Please remove one first.');
      return;
    }
    
    if (!newLocation.name || !newLocation.timezone) {
      alert('Please provide both a name and timezone');
      return;
    }
    
    setLocations([...locations, newLocation]);
    setNewLocation({ name: '', timezone: '', notes: '' });
    setShowAddLocation(false);
  };
  
  // Remove a location
  const handleRemoveLocation = (index) => {
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
  };
  
  // Filter timezones based on search query
  const filteredTimezones = availableTimezones.filter(tz => 
    tz.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      {/* Header with title and controls */}
      <div className="bg-gray-900 py-2 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-blue-400 mr-2" />
          <h3 className="text-gray-200 font-medium text-sm">World Clock</h3>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setEditMode(!editMode)}
            className={`text-xs ${editMode ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-white'}`}
          >
            {editMode ? (
              <Check size={16} />
            ) : (
              <Settings size={14} />
            )}
          </button>
          {!editMode && locations.length < 5 && (
            <button 
              onClick={() => setShowAddLocation(!showAddLocation)}
              className="text-blue-400 hover:text-blue-300 text-xs"
            >
              {showAddLocation ? 'Cancel' : (
                <PlusCircle size={14} />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Add location form */}
      {showAddLocation && (
        <div className="p-3 bg-gray-850 border-b border-gray-700">
          <div className="mb-2">
            <input
              type="text"
              value={newLocation.name}
              onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
              placeholder="Location name (e.g. Monaco)"
              className="w-full bg-gray-700 text-white text-sm rounded px-3 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search timezone (e.g. Europe/Paris)"
                className="w-full bg-gray-700 text-white text-sm rounded px-3 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              
              {searchQuery && (
                <div className="absolute z-10 w-full mt-1 max-h-32 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md">
                  {filteredTimezones.slice(0, 5).map((tz, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-gray-200 text-sm"
                      onClick={() => {
                        setNewLocation({...newLocation, timezone: tz});
                        setSearchQuery('');
                      }}
                    >
                      {tz}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <input
              type="text"
              value={newLocation.timezone}
              onChange={(e) => setNewLocation({...newLocation, timezone: e.target.value})}
              placeholder="Timezone (e.g. Europe/Paris)"
              className="w-full bg-gray-700 text-white text-sm rounded px-3 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <input
              type="text"
              value={newLocation.notes}
              onChange={(e) => setNewLocation({...newLocation, notes: e.target.value})}
              placeholder="Notes (e.g. F1 Circuit)"
              className="w-full bg-gray-700 text-white text-sm rounded px-3 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleAddLocation}
              className="bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700"
            >
              Add Location
            </button>
          </div>
        </div>
      )}
      
      {/* Clock displays */}
      <div className="p-3">
        {locations.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <Globe className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p>No locations added. Click the plus icon to add locations.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map((location, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-2 flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-white font-medium">{location.name}</span>
                    {location.notes && (
                      <span className="ml-2 text-xs text-gray-400">({location.notes})</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{times[location.timezone]?.date || 'Loading...'}</div>
                </div>
                <div className="flex items-center">
                  <span className="text-xl font-semibold text-white">{times[location.timezone]?.time || 'Loading...'}</span>
                  {editMode && (
                    <button 
                      onClick={() => handleRemoveLocation(index)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add button for empty state or when there's room for more */}
        {locations.length === 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowAddLocation(true)}
              className="bg-blue-600 text-white text-sm py-1.5 px-4 rounded-full hover:bg-blue-500 flex items-center"
            >
              <PlusCircle size={14} className="mr-1.5" /> Add Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldClock;