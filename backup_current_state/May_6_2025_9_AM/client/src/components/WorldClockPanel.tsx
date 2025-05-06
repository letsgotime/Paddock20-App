import React, { useEffect, useState } from "react";

// Define city type for better type safety
type City = {
  name: string;
  timezone: string;
  lat: number;
  lon: number;
  customLabel?: string; // For user-defined labels
};

// A comprehensive list of timezones with sample cities
const availableTimezones: City[] = [
  // Popular Cities/Locations
  { name: "Monaco 🇲🇨", timezone: "Europe/Monaco", lat: 43.7384, lon: 7.4246 },
  { name: "Tokyo 🇯🇵", timezone: "Asia/Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "New York 🇺🇸", timezone: "America/New_York", lat: 40.7128, lon: -74.0060 },
  { name: "London 🇬🇧", timezone: "Europe/London", lat: 51.5074, lon: -0.1278 },
  { name: "Singapore 🇸🇬", timezone: "Asia/Singapore", lat: 1.3521, lon: 103.8198 },
  
  // North America
  { name: "Los Angeles 🇺🇸", timezone: "America/Los_Angeles", lat: 34.0522, lon: -118.2437 },
  { name: "Chicago 🇺🇸", timezone: "America/Chicago", lat: 41.8781, lon: -87.6298 },
  { name: "Toronto 🇨🇦", timezone: "America/Toronto", lat: 43.6532, lon: -79.3832 },
  { name: "Mexico City 🇲🇽", timezone: "America/Mexico_City", lat: 19.4326, lon: -99.1332 },
  { name: "Vancouver 🇨🇦", timezone: "America/Vancouver", lat: 49.2827, lon: -123.1207 },
  
  // Europe
  { name: "Paris 🇫🇷", timezone: "Europe/Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Berlin 🇩🇪", timezone: "Europe/Berlin", lat: 52.5200, lon: 13.4050 },
  { name: "Rome 🇮🇹", timezone: "Europe/Rome", lat: 41.9028, lon: 12.4964 },
  { name: "Madrid 🇪🇸", timezone: "Europe/Madrid", lat: 40.4168, lon: -3.7038 },
  { name: "Amsterdam 🇳🇱", timezone: "Europe/Amsterdam", lat: 52.3676, lon: 4.9041 },
  { name: "Athens 🇬🇷", timezone: "Europe/Athens", lat: 37.9838, lon: 23.7275 },
  { name: "Moscow 🇷🇺", timezone: "Europe/Moscow", lat: 55.7558, lon: 37.6173 },
  
  // Asia
  { name: "Hong Kong 🇭🇰", timezone: "Asia/Hong_Kong", lat: 22.3193, lon: 114.1694 },
  { name: "Beijing 🇨🇳", timezone: "Asia/Shanghai", lat: 39.9042, lon: 116.4074 },
  { name: "Seoul 🇰🇷", timezone: "Asia/Seoul", lat: 37.5665, lon: 126.9780 },
  { name: "Bangkok 🇹🇭", timezone: "Asia/Bangkok", lat: 13.7563, lon: 100.5018 },
  { name: "Dubai 🇦🇪", timezone: "Asia/Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Mumbai 🇮🇳", timezone: "Asia/Kolkata", lat: 19.0760, lon: 72.8777 },
  
  // Oceania
  { name: "Sydney 🇦🇺", timezone: "Australia/Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Auckland 🇳🇿", timezone: "Pacific/Auckland", lat: -36.8509, lon: 174.7645 },
  { name: "Melbourne 🇦🇺", timezone: "Australia/Melbourne", lat: -37.8136, lon: 144.9631 },
  
  // South America
  { name: "São Paulo 🇧🇷", timezone: "America/Sao_Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Buenos Aires 🇦🇷", timezone: "America/Argentina/Buenos_Aires", lat: -34.6037, lon: -58.3816 },
  { name: "Lima 🇵🇪", timezone: "America/Lima", lat: -12.0464, lon: -77.0428 },
  
  // Africa
  { name: "Cairo 🇪🇬", timezone: "Africa/Cairo", lat: 30.0444, lon: 31.2357 },
  { name: "Johannesburg 🇿🇦", timezone: "Africa/Johannesburg", lat: -26.2041, lon: 28.0473 },
  { name: "Lagos 🇳🇬", timezone: "Africa/Lagos", lat: 6.5244, lon: 3.3792 },
  
  // F1 Circuits
  { name: "Suzuka 🏎️", timezone: "Asia/Tokyo", lat: 34.8431, lon: 136.5415 },
  { name: "Austin 🏎️", timezone: "America/Chicago", lat: 30.2672, lon: -97.7431 },
  { name: "Silverstone 🏎️", timezone: "Europe/London", lat: 52.0786, lon: -1.0169 },
  { name: "Barcelona 🏎️", timezone: "Europe/Madrid", lat: 41.3851, lon: 2.1734 },
  { name: "Montreal 🏎️", timezone: "America/Toronto", lat: 45.5017, lon: -73.5673 },
  { name: "Monza 🏎️", timezone: "Europe/Rome", lat: 45.5722, lon: 9.2777 },
  { name: "Spa 🏎️", timezone: "Europe/Brussels", lat: 50.4373, lon: 5.9699 },
];

// Default cities to show
const DEFAULT_CITIES = [
  availableTimezones[0], // Monaco
  availableTimezones[1], // Tokyo
  availableTimezones[2], // New York
  availableTimezones[3], // London
  availableTimezones[4], // Singapore
];

const WorldClockPanel: React.FC = () => {
  const [timeData, setTimeData] = useState<Record<string, string>>({});
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddingCustomCity, setIsAddingCustomCity] = useState<boolean>(false);
  const [customCityName, setCustomCityName] = useState<string>("");
  const [customCityTimezone, setCustomCityTimezone] = useState<string>("UTC");
  
  // Available IANA timezones for custom city creation
  const ianaTimezones = [
    "UTC",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow", "Europe/Athens",
    "Asia/Tokyo", "Asia/Singapore", "Asia/Shanghai", "Asia/Dubai", "Asia/Kolkata", "Asia/Seoul",
    "America/New_York", "America/Chicago", "America/Los_Angeles", "America/Toronto", "America/Vancouver",
    "America/Sao_Paulo", "America/Argentina/Buenos_Aires", "America/Mexico_City",
    "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland",
    "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos"
  ];

  // Load saved cities from localStorage on component mount
  useEffect(() => {
    try {
      const savedCities = localStorage.getItem('world_clock_cities');
      if (savedCities) {
        setSelectedCities(JSON.parse(savedCities));
      } else {
        // Default cities if none are saved
        setSelectedCities(DEFAULT_CITIES);
        localStorage.setItem('world_clock_cities', JSON.stringify(DEFAULT_CITIES));
      }
    } catch (err) {
      console.error("Error loading saved cities:", err);
      // Fallback to default cities
      setSelectedCities(DEFAULT_CITIES);
    }
  }, []);

  // Save selected cities to localStorage whenever they change
  useEffect(() => {
    if (selectedCities.length > 0) {
      localStorage.setItem('world_clock_cities', JSON.stringify(selectedCities));
    }
  }, [selectedCities]);

  // Calculate time data for selected cities using Intl.DateTimeFormat
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const times: Record<string, string> = {};
      
      selectedCities.forEach((city) => {
        try {
          // Use Intl.DateTimeFormat for accurate timezone calculations including DST
          const localTime = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: city.timezone,
          }).format(now);
          
          times[city.name] = localTime;
        } catch (err) {
          console.error(`Error calculating time for ${city.name}:`, err);
          times[city.name] = "--:--";
        }
      });
      
      setTimeData(times);
    };

    // Initial calculation
    updateTimes();
    
    // Update times every minute
    const interval = setInterval(updateTimes, 60000);
    return () => clearInterval(interval);
  }, [selectedCities]);

  // Handle when user clicks the edit button for a city
  const handleEditClick = (index: number) => {
    setSelectedCity(index);
    setSearchTerm(""); // Reset search when opening editor
    setIsAddingCustomCity(false);
  };

  // Handle when user selects a new city
  const handleCitySelect = (city: City) => {
    if (selectedCity !== null) {
      const newCities = [...selectedCities];
      newCities[selectedCity] = city;
      setSelectedCities(newCities);
      setSelectedCity(null);
    }
  };

  // Handle adding a custom city
  const handleAddCustomCity = () => {
    if (customCityName.trim() === "") return;
    
    // Create a new custom city
    const customCity: City = {
      name: customCityName.trim(),
      timezone: customCityTimezone,
      lat: 0, // Default coordinates
      lon: 0,
      customLabel: "Custom" // Mark as custom
    };
    
    if (selectedCity !== null) {
      // Replace existing city
      const newCities = [...selectedCities];
      newCities[selectedCity] = customCity;
      setSelectedCities(newCities);
    } else {
      // Add new city if we're not at max
      if (selectedCities.length < 10) {
        setSelectedCities([...selectedCities, customCity]);
      }
    }
    
    // Reset form
    setCustomCityName("");
    setCustomCityTimezone("UTC");
    setIsAddingCustomCity(false);
    setSelectedCity(null);
  };

  // Handle removing a city
  const handleRemoveCity = (index: number) => {
    const newCities = [...selectedCities];
    newCities.splice(index, 1);
    setSelectedCities(newCities);
  };

  // Handle adding a new city slot
  const handleAddCitySlot = () => {
    if (selectedCities.length < 10) { // Limit to 10 cities
      setSelectedCities([...selectedCities, availableTimezones[0]]);
      setSelectedCity(selectedCities.length);
    }
  };

  // Filter cities based on search term
  const filteredCities = searchTerm.trim() === "" 
    ? availableTimezones 
    : availableTimezones.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.timezone.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="bg-black/50 p-4 rounded-lg border border-gray-800 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-blue-400 font-orbitron text-xl">🌎 Global Clocks</h2>
          <p className="text-gray-400 text-xs">It's Your World</p>
        </div>
        <div className="flex space-x-2">
          {selectedCities.length < 10 && !editMode && (
            <button
              onClick={handleAddCitySlot}
              className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded transition"
            >
              Add City
            </button>
          )}
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded transition"
          >
            {editMode ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {selectedCities.map((city, index) => (
          <div
            key={index}
            className="bg-black/70 p-3 rounded-lg border border-gray-700 text-center relative"
          >
            {editMode && (
              <div className="absolute top-1 right-1 flex space-x-1">
                <button
                  className="bg-black/60 hover:bg-black/90 rounded-full p-1 text-red-400"
                  onClick={() => handleRemoveCity(index)}
                  title="Remove city"
                >
                  ❌
                </button>
                <button
                  className="bg-black/60 hover:bg-black/90 rounded-full p-1 text-blue-400"
                  onClick={() => handleEditClick(index)}
                  title="Edit city"
                >
                  ✏️
                </button>
              </div>
            )}

            {selectedCity === index && (
              <div className="absolute top-0 left-0 w-full bg-black/95 border border-blue-500 rounded-lg z-10 p-3 max-h-80 overflow-y-auto">
                {!isAddingCustomCity ? (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-blue-400 text-sm font-bold">Select City:</div>
                      <button 
                        className="text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 px-2 py-1 rounded"
                        onClick={() => setIsAddingCustomCity(true)}
                      >
                        Custom
                      </button>
                    </div>
                    
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Search cities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-2 py-1 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {filteredCities.map((availableCity) => (
                        <div
                          key={availableCity.name}
                          className="p-2 hover:bg-blue-900/30 rounded cursor-pointer text-left flex items-center"
                          onClick={() => handleCitySelect(availableCity)}
                        >
                          <div className="w-[90%] truncate">{availableCity.name}</div>
                          {city.name === availableCity.name && (
                            <span className="text-green-500 ml-auto">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-blue-400 text-sm font-bold">Custom City</div>
                      <button 
                        className="text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 px-2 py-1 rounded"
                        onClick={() => setIsAddingCustomCity(false)}
                      >
                        Back
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">City Name</label>
                        <input
                          type="text"
                          placeholder="My City"
                          value={customCityName}
                          onChange={(e) => setCustomCityName(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 text-white px-2 py-1 rounded focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Timezone</label>
                        <select
                          value={customCityTimezone}
                          onChange={(e) => setCustomCityTimezone(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 text-white px-2 py-1 rounded focus:border-blue-500 focus:outline-none"
                        >
                          {ianaTimezones.map(tz => (
                            <option key={tz} value={tz}>{tz}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAddCustomCity}
                      disabled={!customCityName.trim()}
                      className={`w-full py-2 rounded-md ${
                        customCityName.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add Custom City
                    </button>
                  </>
                )}
              </div>
            )}

            <h3 className="text-blue-400 font-orbitron text-lg mb-1">
              {city.customLabel ? `${city.name} 🔹` : city.name}
            </h3>
            <p className="text-white text-xl font-bold tracking-wide">
              {timeData[city.name] || "--:--"}
            </p>
            <p className="text-gray-400 text-xs mt-1">{city.timezone.replace(/_/g, ' ')}</p>
          </div>
        ))}
        
        {/* Add new city card */}
        {selectedCities.length < 10 && !editMode && (
          <div
            className="bg-black/50 p-3 rounded-lg border border-gray-700 border-dashed text-center flex items-center justify-center cursor-pointer hover:bg-black/70 transition"
            onClick={handleAddCitySlot}
          >
            <div className="text-gray-400">
              <span className="text-2xl block mb-1">+</span>
              <span className="text-sm">Add City</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldClockPanel;