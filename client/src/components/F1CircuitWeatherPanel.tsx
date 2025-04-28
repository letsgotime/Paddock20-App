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
  
  // States for user location and permissions
  const [userLocation, setUserLocation] = useState<{lat: number; lon: number; name?: string} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  // Check current permission status
  const checkLocationPermission = async () => {
    // Check if permission is stored in localStorage
    const storedPermission = localStorage.getItem('paddock20_location_permission');
    if (storedPermission) {
      setLocationPermission(storedPermission as "granted" | "denied" | "prompt");
      return storedPermission as "granted" | "denied" | "prompt";
    }
    
    // In browsers that support permissions API
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        const state = status.state as "granted" | "denied" | "prompt";
        setLocationPermission(state);
        localStorage.setItem('paddock20_location_permission', state);
        return state;
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    }
    
    // Default to prompt if we can't determine
    setLocationPermission("prompt");
    return "prompt";
  };
  
  // Request location permission
  const requestLocationPermission = () => {
    setShowPermissionModal(true);
  };
  
  // Handle permission choice - default is 'granted' (ON)
  const handlePermissionChoice = (choice: "granted" | "denied") => {
    setLocationPermission(choice);
    localStorage.setItem('paddock20_location_permission', choice);
    setShowPermissionModal(false);
    
    if (choice === "granted") {
      getCurrentLocation();
    } else {
      // Use default F1 circuits for denied
      const defaultCircuits = availableCircuits.slice(0, 5);
      setSelectedCircuits(defaultCircuits);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCircuits));
    }
  };
  
  // Initialize permission to granted by default when not set
  useEffect(() => {
    const storedPermission = localStorage.getItem('paddock20_location_permission');
    if (!storedPermission) {
      // Default to granted (location ON)
      localStorage.setItem('paddock20_location_permission', 'granted');
      setLocationPermission('granted');
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = async (): Promise<{ lat: number; lon: number; name?: string } | null> => {
    // Check permission first
    const permissionStatus = await checkLocationPermission();
    
    // If permission is denied, don't try to get location
    if (permissionStatus === "denied") {
      return null;
    }
    
    // If permission is prompt, show the modal
    if (permissionStatus === "prompt") {
      requestLocationPermission();
      return null;
    }
    
    setIsLoadingLocation(true);
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              
              // Permission was successful
              setLocationPermission("granted");
              localStorage.setItem('paddock20_location_permission', "granted");
              
              // Get location name using reverse geocoding
              try {
                const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
                if (response.ok) {
                  const data = await response.json();
                  if (data && data.length > 0) {
                    const location = data[0];
                    setIsLoadingLocation(false);
                    resolve({
                      lat: latitude,
                      lon: longitude,
                      name: location.name
                    });
                    return;
                  }
                }
              } catch (e) {
                console.error("Error in reverse geocoding:", e);
              }
              
              // Fallback without name
              setIsLoadingLocation(false);
              resolve({
                lat: latitude,
                lon: longitude,
              });
            } catch (err) {
              console.error("Error getting current location:", err);
              setIsLoadingLocation(false);
              resolve(null);
            }
          },
          (err) => {
            console.error("Geolocation error:", err);
            // If user denies permission in the browser prompt
            if (err.code === 1) { // PERMISSION_DENIED
              setLocationPermission("denied");
              localStorage.setItem('paddock20_location_permission', "denied");
            }
            setIsLoadingLocation(false);
            resolve(null);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        setIsLoadingLocation(false);
        resolve(null);
      }
    });
  };
  
  // Find nearest circuit to user's location
  const findNearestCircuit = (userLoc: { lat: number; lon: number }): Circuit => {
    // Simple Euclidean distance calculation - adequate for demonstration
    const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
    };
    
    let minDistance = Infinity;
    let nearestCircuit = availableCircuits[0];
    
    for (const circuit of availableCircuits) {
      const distance = calcDistance(userLoc.lat, userLoc.lon, circuit.lat, circuit.lon);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCircuit = circuit;
      }
    }
    
    return nearestCircuit;
  };
  
  // Create a home circuit based on user location
  const createHomeCircuit = (loc: {lat: number; lon: number; name?: string}): Circuit => {
    return {
      id: "home",
      name: "Local Circuit",
      emoji: "🏠",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lat: loc.lat,
      lon: loc.lon,
      city: loc.name || "Current Location",
      country: "Your Location"
    };
  };

  // Load saved circuits from localStorage on mount
  useEffect(() => {
    async function initializeCircuits() {
      try {
        // First check if we have saved circuits
        const savedCircuits = localStorage.getItem(STORAGE_KEY);
        if (savedCircuits) {
          // Parse and validate saved circuits
          const parsed = JSON.parse(savedCircuits);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedCircuits(parsed);
            
            // Still get user location for future use but don't modify selection
            const userLoc = await getCurrentLocation();
            if (userLoc) {
              setUserLocation(userLoc);
            }
            return;
          }
        }
        
        // If no saved circuits, use user's location
        const userLoc = await getCurrentLocation();
        if (userLoc) {
          setUserLocation(userLoc);
          
          // Find nearest F1 circuit to user
          const nearestCircuit = findNearestCircuit(userLoc);
          
          // Create custom "Home Circuit"
          const homeCircuit = createHomeCircuit(userLoc);
          
          // Set up initial circuit selection with home first, then nearby circuit and others
          const initialCircuits = [
            homeCircuit,
            nearestCircuit,
            ...availableCircuits
              .filter(c => c.id !== nearestCircuit.id)
              .slice(0, 3)
          ];
          
          setSelectedCircuits(initialCircuits);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCircuits));
        } else {
          // Fallback to default circuits if can't get user location
          const defaultCircuits = availableCircuits.slice(0, 5);
          setSelectedCircuits(defaultCircuits);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCircuits));
        }
      } catch (err) {
        console.error("Error initializing circuits:", err);
        // Fallback to default circuits
        const defaultCircuits = availableCircuits.slice(0, 5);
        setSelectedCircuits(defaultCircuits);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCircuits));
      }
    }
    
    initializeCircuits();
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
  
  // Limit displayed circuits based on maxCircuits prop
  const displayedCircuits = selectedCircuits.slice(0, maxCircuits);
  
  // Component UI helpers for different display modes
  const getContainerClasses = () => {
    const baseClasses = "border border-gray-800 relative overflow-hidden";
    switch (displayMode) {
      case "compact":
        return `${baseClasses} bg-black/50 p-3 rounded-lg mb-3 ${className}`;
      case "minimal":
        return `${baseClasses} bg-black/30 p-2 rounded-md mb-2 ${className}`;
      case "detailed":
        return `${baseClasses} bg-gradient-to-br from-gray-900 to-black p-5 rounded-lg mb-6 ${className}`;
      case "sidebar":
        return `${baseClasses} bg-black/50 p-4 rounded-lg mb-6 h-full ${className}`;
      default: // standard
        return `${baseClasses} bg-black/50 p-4 rounded-lg mb-6 ${className}`;
    }
  };

  const getGridLayout = () => {
    switch (displayMode) {
      case "compact":
        return "flex flex-wrap gap-2";
      case "minimal":
        return "flex overflow-x-auto gap-2 pb-1 hide-scrollbar";
      case "detailed":
        return "grid grid-cols-1 md:grid-cols-3 gap-4";
      case "sidebar":
        return "flex flex-col gap-3";
      default: // standard
        return "grid grid-cols-2 lg:grid-cols-5 gap-4";
    }
  };

  const getCircuitItemClasses = () => {
    const baseClasses = "bg-black/70 border border-gray-700 text-center relative overflow-hidden";
    switch (displayMode) {
      case "compact":
        return `${baseClasses} p-2 rounded flex items-center gap-1 min-w-[180px]`;
      case "minimal":
        return `${baseClasses} p-1 rounded flex items-center gap-1 shrink-0 min-w-[120px]`;
      case "detailed":
        return `${baseClasses} p-4 rounded-lg`;
      case "sidebar":
        return `${baseClasses} p-3 rounded-md`;
      default: // standard
        return `${baseClasses} p-3 rounded-lg`;
    }
  };

  // Render functions for specific parts of the component
  const renderHeader = () => {
    if (displayMode === "minimal") {
      return showControls ? (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-blue-400 font-orbitron text-sm">{title}</h3>
          <button 
            onClick={toggleEditMode}
            className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-0.5 rounded transition"
          >
            {editMode ? 'Done' : '✎'}
          </button>
        </div>
      ) : null;
    }
    
    return showControls ? (
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-blue-400 font-orbitron ${displayMode === "compact" ? "text-lg" : "text-xl"}`}>
          🏁 {title}
        </h2>
        <button 
          onClick={toggleEditMode}
          className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded transition"
        >
          {editMode ? 'Done' : 'Customize'}
        </button>
      </div>
    ) : null;
  };

  const renderCircuitHeader = (circuit: Circuit) => {
    switch (displayMode) {
      case "compact":
      case "minimal":
        return (
          <div className="flex items-center">
            <span className="text-gray-300 mr-1">{circuit.emoji}</span>
            <h3 className="text-blue-400 font-orbitron text-xs truncate max-w-[60px]">
              {circuit.city || circuit.name.split(' ')[0]}
            </h3>
          </div>
        );
      default:
        return (
          <div className="flex justify-center items-center mb-1">
            <span className="text-gray-300 mr-1">{circuit.emoji}</span>
            <h3 className="text-blue-400 font-orbitron text-sm truncate">
              {circuit.city || circuit.name}
            </h3>
          </div>
        );
    }
  };

  const renderCircuitTime = (circuit: Circuit) => {
    if (!showTime) return null;
    
    switch (displayMode) {
      case "compact":
      case "minimal":
        return (
          <p className="text-white text-sm font-mono ml-2">
            {circuitData[circuit.id]?.time?.split(":").slice(0, 2).join(":") || "--:--"}
          </p>
        );
      default:
        return (
          <p className="text-white text-xl font-bold font-mono tracking-wide bg-black/40 py-1 rounded-sm mb-2">
            {circuitData[circuit.id]?.time || "--:--:--"}
          </p>
        );
    }
  };

  const renderCircuitWeather = (circuit: Circuit) => {
    if (!showWeather) return null;
    
    if (!circuitData[circuit.id]?.weather) {
      if (displayMode === "compact" || displayMode === "minimal") {
        return <div className="ml-auto w-5 h-5 flex-shrink-0"></div>;
      }
      
      return (
        <div className="animate-pulse mt-2 h-16 bg-gray-700/30 rounded-lg flex items-center justify-center">
          {circuitData[circuit.id]?.error ? (
            <span className="text-red-400 text-xs">{circuitData[circuit.id].error}</span>
          ) : (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      );
    }
    
    const weather = circuitData[circuit.id].weather!;
    
    switch (displayMode) {
      case "compact":
        return (
          <div className="ml-auto flex items-center">
            <span className="text-base font-bold font-mono">
              {Math.round(weather.temp)}°F
            </span>
          </div>
        );
      case "minimal":
        return (
          <span className="ml-auto text-white text-xs font-bold">
            {Math.round(weather.temp)}°
          </span>
        );
      case "detailed":
        return (
          <div className="mt-3 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <img 
                src={getWeatherIconUrl(weather.icon)} 
                alt={weather.description}
                className="w-12 h-12" 
              />
              <span className="text-2xl font-bold ml-2 font-mono">
                {Math.round(weather.temp)}°F
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1 capitalize">
              {weather.description}
            </p>
            <div className="grid grid-cols-2 gap-4 w-full mt-3 border-t border-gray-800 pt-3">
              <div className="text-center">
                <p className="text-xs text-gray-400">Humidity</p>
                <p className="text-white font-mono">{weather.humidity}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Wind</p>
                <p className="text-white font-mono">{Math.round(weather.windSpeed)} mph</p>
              </div>
            </div>
          </div>
        );
      default: // standard + sidebar
        return (
          <div className="mt-1 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <img 
                src={getWeatherIconUrl(weather.icon)} 
                alt={weather.description}
                className="w-10 h-10" 
              />
              <span className="text-xl font-bold ml-1 font-mono">
                {Math.round(weather.temp)}°F
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 capitalize">
              {weather.description}
            </p>
            <div className="text-xs text-gray-400 flex items-center justify-between w-full mt-2 border-t border-gray-800 pt-2">
              <span>💧 {weather.humidity}%</span>
              <span>💨 {Math.round(weather.windSpeed)} mph</span>
            </div>
          </div>
        );
    }
  };

  // Add custom CSS for hiding scrollbars and F1 telemetry animations
  useEffect(() => {
    // Only add once
    if (!document.getElementById('circuit-panel-styles')) {
      const style = document.createElement('style');
      style.id = 'circuit-panel-styles';
      style.innerHTML = `
        .hide-scrollbar::-webkit-scrollbar {
          height: 0;
          width: 0;
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* F1 Telemetry Scanning Effect */
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(1000%);
          }
        }
        
        .animate-scan {
          animation: scan 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        /* F1 Telemetry Blinking Effect */
        @keyframes telemetry-blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        .animate-telemetry-blink {
          animation: telemetry-blink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Function to expand to see more circuits
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Function to reset to user's current location
  const resetToCurrentLocation = async () => {
    if (isLoadingLocation) return;
    
    try {
      const userLoc = await getCurrentLocation();
      if (!userLoc) {
        return;
      }
      
      // Create custom "Home Circuit"
      const homeCircuit = createHomeCircuit(userLoc);
      
      // Find nearest F1 circuit to user's location
      const nearestCircuit = findNearestCircuit(userLoc);
      
      // Replace the first circuit with home location and second with nearest
      const updatedCircuits = [...selectedCircuits];
      updatedCircuits[0] = homeCircuit;
      
      // If nearest is already in the list, don't duplicate
      const nearestExists = updatedCircuits.some(c => c.id === nearestCircuit.id);
      if (!nearestExists) {
        updatedCircuits[1] = nearestCircuit;
      }
      
      setSelectedCircuits(updatedCircuits);
      setUserLocation(userLoc);
    } catch (err) {
      console.error("Error resetting to current location:", err);
    }
  };

  // Toggle location permission
  const toggleLocationPermission = async () => {
    if (locationPermission === "granted") {
      handlePermissionChoice("denied");
    } else {
      handlePermissionChoice("granted");
    }
  };

  return (
    <div className={`${getContainerClasses()} transition-all duration-300`}>
      {/* F1 telemetry-style top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-10 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
      
      {/* Location Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative bg-gray-900 border border-blue-500 rounded-lg p-6 max-w-md w-full">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
            <div className="mb-6">
              <h3 className="text-xl font-orbitron text-blue-400 mb-2">
                🏁 F1 Circuit Weather Network
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Paddock20 uses your location to show you weather data from your current city alongside F1 circuits around the world.
              </p>
              <div className="bg-black/50 p-3 rounded border border-gray-800 mb-4">
                <h4 className="text-blue-400 font-bold mb-2">With Location Access:</h4>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>See weather and time from your current location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Compare your local conditions with F1 circuits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Get F1-inspired telemetry data for your city</span>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                You can change this setting anytime in the circuit panel settings.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => handlePermissionChoice("denied")}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white flex-1 transition"
              >
                No Thanks
              </button>
              <button 
                onClick={() => handlePermissionChoice("granted")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white flex-1 transition"
              >
                Enable Location
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced panel header with F1 telemetry styling */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className={`text-blue-400 font-orbitron ${displayMode === "compact" ? "text-lg" : "text-xl"}`}>
            🏁 {title}
          </h2>
          
          {/* Telemetry-style status indicator */}
          <div className="ml-3 flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${isLoadingLocation ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-xs text-gray-400 font-mono">LIVE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Only show in standard or detailed mode */}
          {(displayMode === "standard" || displayMode === "detailed") && (
            <button 
              onClick={resetToCurrentLocation}
              disabled={isLoadingLocation}
              className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded transition flex items-center gap-1"
            >
              {isLoadingLocation ? (
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>🏎️</span>
              )}
              <span>F1 Defaults</span>
            </button>
          )}
          
          {showControls && (
            <button 
              onClick={toggleEditMode}
              className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded transition"
            >
              {editMode ? 'Done' : 'Choose Cities'}
            </button>
          )}
          
          {(displayMode === "standard" || displayMode === "detailed") && selectedCircuits.length > maxCircuits && (
            <button 
              onClick={toggleExpand}
              className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded transition"
            >
              {isExpanded ? 'Show 5' : 'Show All'}
            </button>
          )}
        </div>
      </div>
      
      {/* Telemetry-style data metrics */}
      {displayMode === "detailed" && (
        <div className="grid grid-cols-3 gap-2 mb-4 font-mono text-sm">
          <div className="bg-black/40 border border-gray-800 rounded p-2 text-center">
            <div className="text-gray-500 text-xs">CIRCUITS</div>
            <div className="text-blue-400">{selectedCircuits.length}</div>
          </div>
          <div className="bg-black/40 border border-gray-800 rounded p-2 text-center">
            <div className="text-gray-500 text-xs">DATA SOURCE</div>
            <div className="text-blue-400">OpenWeather</div>
          </div>
          <div 
            onClick={toggleLocationPermission}
            className="relative bg-black/40 border border-gray-800 rounded p-2 text-center cursor-pointer hover:bg-black/60 transition group"
          >
            <div className="text-gray-500 text-xs">LOCATION</div>
            <div className={`flex justify-center items-center ${locationPermission === "granted" ? "text-green-400" : "text-red-400"}`}>
              <span className="mr-1">{locationPermission === "granted" ? "ON" : "OFF"}</span>
              <div className={`h-2 w-2 rounded-full ${locationPermission === "granted" ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-44 bg-black border border-blue-500 rounded p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <div className="text-center mb-1 text-blue-400 font-bold">
                {locationPermission === "granted" ? "Location Enabled" : "Location Disabled"}
              </div>
              <p className="text-gray-300 text-[10px]">
                {locationPermission === "granted" 
                  ? "Your local weather data will be shown alongside F1 circuits." 
                  : "Only F1 circuit data will be shown. Click to enable your location."}
              </p>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black border-r border-b border-blue-500"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Circuit grid with telemetry styling */}
      <div className={getGridLayout()}>
        {(isExpanded ? selectedCircuits : displayedCircuits).map((circuit, index) => (
          <div 
            key={circuit.id} 
            className={`${getCircuitItemClasses()} ${circuit.id === 'home' ? 'border-blue-500/50' : ''}`}
          >
            {/* Telemetry scanning effect - only in detailed view */}
            {displayMode === "detailed" && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="h-full w-1 bg-blue-500/10 animate-scan"></div>
              </div>
            )}
            
            {/* Edit controls */}
            {editMode && showControls && (
              <button 
                className={`absolute ${displayMode === "minimal" || displayMode === "compact" ? "top-1 right-1 p-0.5 text-[10px]" : "top-2 right-2 p-1"} bg-black/60 hover:bg-black/90 rounded-full text-blue-400 z-10`}
                onClick={() => editCircuit(index)}
              >
                ✏️
              </button>
            )}
            
            {/* Circuit selector with F1 telemetry styling */}
            {editMode === index && (
              <div className="absolute top-0 left-0 w-full bg-black/95 border border-blue-500 rounded-lg z-20 p-2 max-h-64 overflow-y-auto">
                <div className="text-blue-400 mb-2 text-xs font-bold flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Select Circuit:</span>
                </div>
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
                {userLocation && (
                  <div 
                    className="mt-2 p-2 hover:bg-blue-900/30 rounded cursor-pointer text-left flex items-center border-t border-gray-800"
                    onClick={() => {
                      const homeCircuit = createHomeCircuit(userLocation);
                      handleSelectCircuit(homeCircuit, index);
                    }}
                  >
                    <div className="flex items-center w-[90%]">
                      <span className="mr-2">🏠</span>
                      <span className="truncate">Your Location</span>
                    </div>
                    {circuit.id === 'home' && (
                      <span className="text-green-500 ml-auto">✓</span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {renderCircuitHeader(circuit)}
            {renderCircuitTime(circuit)}
            {renderCircuitWeather(circuit)}
            
            {/* F1 telemetry-style footer bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
          </div>
        ))}
      </div>
      
      {/* Link to weather details - only shown in standard or detailed */}
      {(displayMode === "standard" || displayMode === "detailed") && (
        <div className="mt-2 text-center">
          <a href="/weather" className="text-xs text-blue-400 hover:text-blue-300 font-mono">
            View Detailed Weather Telemetry →
          </a>
        </div>
      )}
    </div>
  );
};

export default F1CircuitWeatherPanel;