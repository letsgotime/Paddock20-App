import React, { useEffect, useState } from "react";

// Define city type for better type safety
type City = {
  name: string;
  timezone: string;
  lat: number;
  lon: number;
};

// Available cities to choose from
const availableCities: City[] = [
  { name: "Monaco 🇲🇨", timezone: "Europe/Monaco", lat: 43.7384, lon: 7.4246 },
  { name: "Suzuka 🇯🇵", timezone: "Asia/Tokyo", lat: 34.8431, lon: 136.5415 },
  { name: "Austin 🇺🇸", timezone: "America/Chicago", lat: 30.2672, lon: -97.7431 },
  { name: "Silverstone 🇬🇧", timezone: "Europe/London", lat: 52.0786, lon: -1.0169 },
  { name: "Singapore 🇸🇬", timezone: "Asia/Singapore", lat: 1.2905, lon: 103.8520 },
  { name: "Barcelona 🇪🇸", timezone: "Europe/Madrid", lat: 41.3851, lon: 2.1734 },
  { name: "Montreal 🇨🇦", timezone: "America/Toronto", lat: 45.5017, lon: -73.5673 },
  { name: "Melbourne 🇦🇺", timezone: "Australia/Melbourne", lat: -37.8136, lon: 144.9631 },
  { name: "Sao Paulo 🇧🇷", timezone: "America/Sao_Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Abu Dhabi 🇦🇪", timezone: "Asia/Dubai", lat: 24.4539, lon: 54.3773 },
  { name: "Monza 🇮🇹", timezone: "Europe/Rome", lat: 45.5722, lon: 9.2777 },
  { name: "Spa 🇧🇪", timezone: "Europe/Brussels", lat: 50.4373, lon: 5.9699 },
];

// Type for weather data
type WeatherData = {
  weather: Array<{
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
};

// Type for edit mode
type EditMode = boolean | number | "all";

const WorldClockPanel: React.FC = () => {
  const [timeData, setTimeData] = useState<Record<string, string>>({});
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({});
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [editMode, setEditMode] = useState<EditMode>(false);

  // Load saved cities from localStorage on component mount
  useEffect(() => {
    try {
      const savedCities = localStorage.getItem('paddock20_selected_cities');
      if (savedCities) {
        setSelectedCities(JSON.parse(savedCities));
      } else {
        // Default cities if none are saved
        const defaultCities = [
          availableCities[0], // Monaco
          availableCities[1], // Suzuka
          availableCities[2], // Austin
          availableCities[3], // Silverstone
          availableCities[4], // Singapore
        ];
        setSelectedCities(defaultCities);
        localStorage.setItem('paddock20_selected_cities', JSON.stringify(defaultCities));
      }
    } catch (err) {
      console.error("Error loading saved cities:", err);
      // Fallback to default cities
      setSelectedCities(availableCities.slice(0, 5));
    }
  }, []);

  // Save selected cities to localStorage whenever they change
  useEffect(() => {
    if (selectedCities.length > 0) {
      localStorage.setItem('paddock20_selected_cities', JSON.stringify(selectedCities));
    }
  }, [selectedCities]);

  // Fetch time data for selected cities using local calculation
  useEffect(() => {
    if (selectedCities.length === 0) return;

    const calculateTimes = () => {
      const updatedTimes: Record<string, string> = {};

      // Define timezone offsets (hours from UTC)
      const timezoneOffsets: Record<string, number> = {
        "Europe/Monaco": 2,       // UTC+2
        "Asia/Tokyo": 9,          // UTC+9
        "America/Chicago": -5,    // UTC-5
        "Europe/London": 1,       // UTC+1
        "Asia/Singapore": 8,      // UTC+8
        "Europe/Madrid": 2,       // UTC+2
        "America/Toronto": -4,    // UTC-4
        "Australia/Melbourne": 10, // UTC+10
        "America/Sao_Paulo": -3,  // UTC-3
        "Asia/Dubai": 4,          // UTC+4
        "Europe/Rome": 2,         // UTC+2
        "Europe/Brussels": 2      // UTC+2
      };

      for (const city of selectedCities) {
        try {
          // Get current UTC time
          const now = new Date();
          const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
          
          // Apply timezone offset for the city
          const offset = timezoneOffsets[city.timezone] || 0;
          const localDateTime = new Date(utcTime.getTime() + offset * 3600000);
          
          // Format time for display
          const localTime = localDateTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
          
          updatedTimes[city.name] = localTime;
        } catch (err) {
          console.error(`Error calculating time for ${city.name}:`, err);
          // Use current device time as fallback
          updatedTimes[city.name] = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        }
      }

      setTimeData(updatedTimes);
    };

    // Initial calculation
    calculateTimes();
    
    // Update times every minute
    const interval = setInterval(calculateTimes, 60000);

    return () => clearInterval(interval);
  }, [selectedCities]);

  // Fetch weather data for selected cities
  useEffect(() => {
    if (selectedCities.length === 0) return;
    
    const fetchWeather = async () => {
      const weatherResults: Record<string, WeatherData> = {};

      for (const city of selectedCities) {
        try {
          const response = await fetch(`/api/weather?lat=${city.lat}&lon=${city.lon}`);
          if (response.ok) {
            const data = await response.json();
            weatherResults[city.name] = data;
          }
        } catch (error) {
          console.error(`Error fetching weather for ${city.name}:`, error);
        }
      }

      setWeatherData(weatherResults);
    };

    fetchWeather();
    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, [selectedCities]);

  // Function to get weather icon
  const getWeatherIcon = (iconCode: string): string => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Handle city selection
  const handleSelectCity = (city: City, index: number): void => {
    const newSelectedCities = [...selectedCities];
    newSelectedCities[index] = city;
    setSelectedCities(newSelectedCities);
    setEditMode(false);
  };

  // Handle city edit click
  const handleEditClick = (index: number): void => {
    setEditMode(index);
  };

  // Toggle edit mode
  const toggleEditMode = (): void => {
    setEditMode(editMode ? false : "all");
  };

  return (
    <div className="bg-black/50 p-4 rounded-lg border border-gray-800 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-blue-400 font-orbitron text-xl">
          🏁 Global Circuit Times & Conditions
        </h2>
        <button 
          onClick={toggleEditMode}
          className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded transition"
        >
          {editMode ? 'Done' : 'Customize'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {selectedCities.map((city, index) => (
          <div key={index} className="bg-black/70 p-3 rounded-lg border border-gray-700 text-center relative">
            {/* Edit button - appears when in edit mode */}
            {editMode && (
              <button 
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/90 rounded-full p-1 text-blue-400"
                onClick={() => handleEditClick(index)}
              >
                ✏️
              </button>
            )}
            
            {/* City selector dropdown */}
            {editMode === index && (
              <div className="absolute top-0 left-0 w-full bg-black/95 border border-blue-500 rounded-lg z-10 p-2 max-h-64 overflow-y-auto">
                <div className="text-blue-400 mb-2 text-sm font-bold">Select Circuit:</div>
                {availableCities.map((availableCity) => (
                  <div 
                    key={availableCity.name}
                    className="p-2 hover:bg-blue-900/30 rounded cursor-pointer text-left flex items-center"
                    onClick={() => handleSelectCity(availableCity, index)}
                  >
                    <div className="w-[90%] truncate">{availableCity.name}</div>
                    {city.name === availableCity.name && (
                      <span className="text-green-500 ml-auto">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* City display */}
            <h3 className="text-blue-400 font-orbitron text-lg mb-1">{city.name}</h3>
            <p className="text-white text-xl font-bold tracking-wide">
              {timeData[city.name] || "--:--"}
            </p>
            
            {weatherData[city.name] ? (
              <div className="mt-2 flex flex-col items-center">
                <div className="flex items-center justify-center">
                  <img 
                    src={getWeatherIcon(weatherData[city.name].weather[0].icon)} 
                    alt={weatherData[city.name].weather[0].description}
                    className="w-10 h-10" 
                  />
                  <span className="text-xl font-bold ml-1">
                    {Math.round(weatherData[city.name].main.temp)}°F
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  {weatherData[city.name].weather[0].description}
                </p>
                <div className="text-xs text-gray-400 flex items-center justify-between w-full mt-2">
                  <span>💧 {weatherData[city.name].main.humidity}%</span>
                  <span>💨 {Math.round(weatherData[city.name].wind.speed)} mph</span>
                </div>
              </div>
            ) : (
              <div className="animate-pulse mt-2 h-16 bg-gray-700/30 rounded-lg"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldClockPanel;