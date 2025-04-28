import React, { useEffect, useState } from "react";

// Circuit type definition with all required properties
type Circuit = {
  id: string;
  name: string;
  emoji: string;
  timezone: string;
  lat: number;
  lon: number;
  city?: string;
  country: string;
};

// Weather data type definition
type WeatherData = {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
};

// Strongly typed state for each circuit's data
type CircuitData = {
  time: string;
  weather?: WeatherData;
  isLoading: boolean;
  error?: string;
};

// Display mode options for the component
export type DisplayMode = 
  | "standard"    // Grid layout (default)
  | "compact"     // Compact horizontal bar
  | "minimal"     // Ultra compact for headers
  | "detailed"    // Full detailed view
  | "sidebar";    // Vertical sidebar layout

// Component props
interface F1CircuitWeatherPanelProps {
  displayMode?: DisplayMode;
  maxCircuits?: number;   // Maximum circuits to show
  showControls?: boolean; // Show customize controls
  showWeather?: boolean;  // Show weather data
  showTime?: boolean;     // Show time data
  title?: string;         // Custom title
  className?: string;     // Additional CSS classes
}

// All available F1 circuits with 2025 calendar
const availableCircuits: Circuit[] = [
  { 
    id: "monaco", 
    name: "Circuit de Monaco", 
    emoji: "🇲🇨", 
    timezone: "Europe/Monaco", 
    lat: 43.7384, 
    lon: 7.4246,
    city: "Monte Carlo",
    country: "Monaco"
  },
  { 
    id: "suzuka", 
    name: "Suzuka Circuit", 
    emoji: "🇯🇵", 
    timezone: "Asia/Tokyo", 
    lat: 34.8431, 
    lon: 136.5415,
    city: "Suzuka",
    country: "Japan"
  },
  { 
    id: "cota", 
    name: "Circuit of The Americas", 
    emoji: "🇺🇸", 
    timezone: "America/Chicago", 
    lat: 30.2672, 
    lon: -97.7431,
    city: "Austin",
    country: "USA"
  },
  { 
    id: "silverstone", 
    name: "Silverstone Circuit", 
    emoji: "🇬🇧", 
    timezone: "Europe/London", 
    lat: 52.0786, 
    lon: -1.0169,
    city: "Silverstone",
    country: "UK"
  },
  { 
    id: "singapore", 
    name: "Marina Bay Street Circuit", 
    emoji: "🇸🇬", 
    timezone: "Asia/Singapore", 
    lat: 1.2905, 
    lon: 103.8520,
    city: "Singapore",
    country: "Singapore"
  },
  { 
    id: "barcelona", 
    name: "Circuit de Barcelona-Catalunya", 
    emoji: "🇪🇸", 
    timezone: "Europe/Madrid", 
    lat: 41.3851, 
    lon: 2.1734,
    city: "Barcelona",
    country: "Spain"
  },
  { 
    id: "montreal", 
    name: "Circuit Gilles Villeneuve", 
    emoji: "🇨🇦", 
    timezone: "America/Toronto", 
    lat: 45.5017, 
    lon: -73.5673,
    city: "Montreal",
    country: "Canada"
  },
  { 
    id: "melbourne", 
    name: "Albert Park Circuit", 
    emoji: "🇦🇺", 
    timezone: "Australia/Melbourne", 
    lat: -37.8136, 
    lon: 144.9631,
    city: "Melbourne",
    country: "Australia"
  },
  { 
    id: "saopaulo", 
    name: "Interlagos Circuit", 
    emoji: "🇧🇷", 
    timezone: "America/Sao_Paulo", 
    lat: -23.5505, 
    lon: -46.6333,
    city: "São Paulo",
    country: "Brazil"
  },
  { 
    id: "abudhabi", 
    name: "Yas Marina Circuit", 
    emoji: "🇦🇪", 
    timezone: "Asia/Dubai", 
    lat: 24.4539, 
    lon: 54.3773,
    city: "Abu Dhabi",
    country: "UAE"
  },
  { 
    id: "monza", 
    name: "Autodromo Nazionale Monza", 
    emoji: "🇮🇹", 
    timezone: "Europe/Rome", 
    lat: 45.5722, 
    lon: 9.2777,
    city: "Monza",
    country: "Italy"
  },
  { 
    id: "spa", 
    name: "Circuit de Spa-Francorchamps", 
    emoji: "🇧🇪", 
    timezone: "Europe/Brussels", 
    lat: 50.4373, 
    lon: 5.9699,
    city: "Stavelot",
    country: "Belgium"
  },
  { 
    id: "baku", 
    name: "Baku City Circuit", 
    emoji: "🇦🇿", 
    timezone: "Asia/Baku", 
    lat: 40.3725, 
    lon: 49.8533,
    city: "Baku",
    country: "Azerbaijan"
  },
  { 
    id: "jeddah", 
    name: "Jeddah Corniche Circuit", 
    emoji: "🇸🇦", 
    timezone: "Asia/Riyadh", 
    lat: 21.6319, 
    lon: 39.1044,
    city: "Jeddah",
    country: "Saudi Arabia"
  },
  { 
    id: "bahrain", 
    name: "Bahrain International Circuit", 
    emoji: "🇧🇭", 
    timezone: "Asia/Bahrain", 
    lat: 26.0325, 
    lon: 50.5106,
    city: "Sakhir",
    country: "Bahrain"
  },
];

// Local storage keys
const STORAGE_KEY = "paddock20_selected_circuits";

/**
 * F1CircuitWeatherPanel - Enhanced weather and time panel for F1 circuits
 * Allows users to customize which circuits they want to track
 * Supports multiple display modes to fit different layouts
 */
const F1CircuitWeatherPanel: React.FC<F1CircuitWeatherPanelProps> = ({
  displayMode = "standard",
  maxCircuits = 5,
  showControls = true,
  showWeather = true,
  showTime = true,
  title = "Circuit Telemetry Network",
  className = "",
}) => {
  // States for the component
  const [selectedCircuits, setSelectedCircuits] = useState<Circuit[]>([]);
  const [circuitData, setCircuitData] = useState<Record<string, CircuitData>>({});
  const [editMode, setEditMode] = useState<boolean | number>(false);
  
  // Load saved circuits from localStorage on mount
  useEffect(() => {
    try {
      const savedCircuits = localStorage.getItem(STORAGE_KEY);
      if (savedCircuits) {
        // Parse and validate saved circuits
        const parsed = JSON.parse(savedCircuits);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedCircuits(parsed);
          return;
        }
      }
      
      // Default circuits if none are saved
      const defaultCircuits = availableCircuits.slice(0, 5);
      setSelectedCircuits(defaultCircuits);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCircuits));
    } catch (err) {
      console.error("Error loading saved circuits:", err);
      // Fallback to default circuits
      setSelectedCircuits(availableCircuits.slice(0, 5));
    }
  }, []);
  
  // Save circuits to localStorage when they change
  useEffect(() => {
    if (selectedCircuits.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCircuits));
    }
  }, [selectedCircuits]);
  
  // Fetch time data for selected circuits
  useEffect(() => {
    if (selectedCircuits.length === 0) return;
    
    // Create clean initial state for each circuit
    const initialData: Record<string, CircuitData> = {};
    selectedCircuits.forEach(circuit => {
      initialData[circuit.id] = { 
        time: "--:--:--", 
        isLoading: true 
      };
    });
    setCircuitData(initialData);
    
    // Function to fetch the current time for each circuit
    const fetchCircuitTimes = async () => {
      const updatedData = { ...circuitData };
      
      for (const circuit of selectedCircuits) {
        try {
          const response = await fetch(`https://worldtimeapi.org/api/timezone/${circuit.timezone}`);
          if (!response.ok) throw new Error(`Error fetching time for ${circuit.name}`);
          
          const data = await response.json();
          updatedData[circuit.id] = {
            ...updatedData[circuit.id],
            time: new Date(data.datetime).toLocaleTimeString(),
            isLoading: false
          };
        } catch (err) {
          console.error(`Error fetching time for ${circuit.name}:`, err);
          updatedData[circuit.id] = {
            ...updatedData[circuit.id],
            time: "--:--:--",
            isLoading: false,
            error: "Time data unavailable"
          };
        }
      }
      
      setCircuitData(updatedData);
    };
    
    fetchCircuitTimes();
    // Update time every minute
    const interval = setInterval(fetchCircuitTimes, 60000);
    
    return () => clearInterval(interval);
  }, [selectedCircuits]);
  
  // Fetch weather data for selected circuits
  useEffect(() => {
    if (selectedCircuits.length === 0) return;
    
    const fetchCircuitWeather = async () => {
      const updatedData = { ...circuitData };
      
      for (const circuit of selectedCircuits) {
        try {
          const response = await fetch(`/api/weather?lat=${circuit.lat}&lon=${circuit.lon}`);
          if (!response.ok) throw new Error(`Error fetching weather for ${circuit.name}`);
          
          const data = await response.json();
          updatedData[circuit.id] = {
            ...updatedData[circuit.id],
            weather: {
              temp: data.main.temp,
              humidity: data.main.humidity,
              windSpeed: data.wind.speed,
              description: data.weather[0].description,
              icon: data.weather[0].icon
            },
            isLoading: false
          };
        } catch (err) {
          console.error(`Error fetching weather for ${circuit.name}:`, err);
          updatedData[circuit.id] = {
            ...updatedData[circuit.id],
            isLoading: false,
            error: "Weather data unavailable"
          };
        }
      }
      
      setCircuitData(updatedData);
    };
    
    fetchCircuitWeather();
    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(fetchCircuitWeather, 30 * 60 * 1000);
    
    return () => clearInterval(weatherInterval);
  }, [selectedCircuits]);
  
  // Handler for selecting a circuit
  const handleSelectCircuit = (circuit: Circuit, index: number) => {
    const newSelected = [...selectedCircuits];
    newSelected[index] = circuit;
    setSelectedCircuits(newSelected);
    setEditMode(false);
  };
  
  // Function to get weather icon URL
  const getWeatherIconUrl = (iconCode: string): string => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(prevMode => prevMode ? false : true);
  };
  
  // Edit specific circuit
  const editCircuit = (index: number) => {
    setEditMode(index);
  };
  
  return (
    <div className="bg-black/50 p-4 rounded-lg border border-gray-800 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-blue-400 font-orbitron text-xl">
          🏁 Circuit Telemetry Network
        </h2>
        <button 
          onClick={toggleEditMode}
          className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded transition"
        >
          {editMode ? 'Done' : 'Customize'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {selectedCircuits.map((circuit, index) => (
          <div 
            key={circuit.id} 
            className="bg-black/70 p-3 rounded-lg border border-gray-700 text-center relative overflow-hidden"
          >
            {/* F1 telemetry-style header bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
            
            {/* Edit controls */}
            {editMode && (
              <button 
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/90 rounded-full p-1 text-blue-400 z-10"
                onClick={() => editCircuit(index)}
              >
                ✏️
              </button>
            )}
            
            {/* Circuit selector */}
            {editMode === index && (
              <div className="absolute top-0 left-0 w-full bg-black/95 border border-blue-500 rounded-lg z-20 p-2 max-h-64 overflow-y-auto">
                <div className="text-blue-400 mb-2 text-sm font-bold">Select Circuit:</div>
                {availableCircuits.map((availableCircuit) => (
                  <div 
                    key={availableCircuit.id}
                    className="p-2 hover:bg-blue-900/30 rounded cursor-pointer text-left flex items-center"
                    onClick={() => handleSelectCircuit(availableCircuit, index)}
                  >
                    <div className="flex items-center w-[90%]">
                      <span className="mr-2">{availableCircuit.emoji}</span>
                      <span className="truncate">{availableCircuit.name}</span>
                    </div>
                    {circuit.id === availableCircuit.id && (
                      <span className="text-green-500 ml-auto">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Circuit header */}
            <div className="flex justify-center items-center mb-1">
              <span className="text-gray-300 mr-1">{circuit.emoji}</span>
              <h3 className="text-blue-400 font-orbitron text-sm">
                {circuit.city || circuit.name}
              </h3>
            </div>
            
            {/* Time display */}
            <p className="text-white text-xl font-bold font-mono tracking-wide bg-black/40 py-1 rounded-sm mb-2">
              {circuitData[circuit.id]?.time || "--:--:--"}
            </p>
            
            {/* Weather display */}
            {circuitData[circuit.id]?.weather ? (
              <div className="mt-1 flex flex-col items-center">
                <div className="flex items-center justify-center">
                  <img 
                    src={getWeatherIconUrl(circuitData[circuit.id].weather!.icon)} 
                    alt={circuitData[circuit.id].weather!.description}
                    className="w-10 h-10" 
                  />
                  <span className="text-xl font-bold ml-1 font-mono">
                    {Math.round(circuitData[circuit.id].weather!.temp)}°F
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1 capitalize">
                  {circuitData[circuit.id].weather!.description}
                </p>
                <div className="text-xs text-gray-400 flex items-center justify-between w-full mt-2 border-t border-gray-800 pt-2">
                  <span>💧 {circuitData[circuit.id].weather!.humidity}%</span>
                  <span>💨 {Math.round(circuitData[circuit.id].weather!.windSpeed)} mph</span>
                </div>
              </div>
            ) : (
              <div className="animate-pulse mt-2 h-16 bg-gray-700/30 rounded-lg flex items-center justify-center">
                {circuitData[circuit.id]?.error ? (
                  <span className="text-red-400 text-xs">{circuitData[circuit.id].error}</span>
                ) : (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            )}
            
            {/* F1 telemetry-style footer bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default F1CircuitWeatherPanel;