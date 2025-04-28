import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, Locate, Search, Navigation, MapIcon, Cloud, CloudRain, 
  Thermometer, Wind, Clock, Car, CalendarClock, AlertTriangle, 
  CornerUpRight, Compass, BarChart, Infinity, Route as RouteIcon,
  Share2, ExternalLink, Share, Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";
import { getWeatherData, getOneCallData, formatTemperature } from '@/services/openWeatherService';

// Interface definitions
interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  placeId?: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  nickname?: string;
  color?: string;
  image?: string;
  currentMileage: number;
}

interface Passenger {
  id: number;
  name: string;
  relationship?: string;
  notes?: string;
}

interface RouteCustomizationOptions {
  isRoundTrip: boolean;
  avoidTolls: boolean;
  onlyTolls: boolean;
  scenicRoute: boolean;
  includeGasStops: boolean;
  includeFoodStops: boolean;
}

interface Route {
  id: number;
  name: string;
  startPoint: Location;
  endPoint: Location;
  waypoints?: Location[];
  distance: number;
  estimatedTime: string;
  notes: string;
  category: string;
  favorite: boolean;
  lastDriven?: string;
  weather?: any;
  roadConditions?: any[];
  vehicle?: Vehicle;  // Selected vehicle for this route
  vehicleId?: number; // Reference to the vehicle in the database
  passengers?: Passenger[]; // Optional passengers
  tripMileage?: number; // Actual recorded mileage, may differ from calculated distance
  startMileage?: number; // Vehicle odometer at trip start
  endMileage?: number;   // Vehicle odometer at trip end
  fuelConsumption?: number; // Fuel used in trip (gallons/liters)
  routeCustomizations?: RouteCustomizationOptions; // Route customization options
}

// Helper functions
const getRoadConditionForLocation = (weather: any, temp: number) => {
  const description = weather?.description?.toLowerCase() || '';
  let status = 'optimal';
  let detail = 'Excellent driving conditions';
  let icon = 'optimal';
  
  if (description.includes('rain') || description.includes('drizzle')) {
    status = 'caution';
    detail = 'Wet roads may affect traction';
    icon = 'wet';
  } else if (description.includes('snow') || description.includes('sleet')) {
    status = 'warning';
    detail = 'Hazardous conditions: Snow-covered roads';
    icon = 'snow';
  } else if (description.includes('fog') || description.includes('mist')) {
    status = 'caution';
    detail = 'Reduced visibility ahead';
    icon = 'fog';
  } else if (description.includes('thunder') || description.includes('storm')) {
    status = 'warning';
    detail = 'Severe weather: Thunderstorms';
    icon = 'storm';
  } else if (temp < 32) {
    status = 'warning';
    detail = 'Potential for black ice on road surfaces';
    icon = 'ice';
  } else if (temp > 95) {
    status = 'caution';
    detail = 'High temperatures may affect tire pressure';
    icon = 'hot';
  }
  
  return { status, detail, icon };
};

const calculateRoutePerformance = (weather: any, distance: number, startTemp: number, endTemp: number) => {
  // Calculate fuel efficiency impact based on temperature, weather, and distance
  const avgTemp = (startTemp + endTemp) / 2;
  let fuelEfficiencyImpact = 0;
  
  // Temperature impacts fuel efficiency
  if (avgTemp < 40) {
    fuelEfficiencyImpact -= 3; // Cold reduces efficiency by ~3%
  } else if (avgTemp > 90) {
    fuelEfficiencyImpact -= 1; // Heat reduces efficiency by ~1%
  }
  
  // Weather impacts on fuel efficiency
  const weatherDesc = weather?.description?.toLowerCase() || '';
  if (weatherDesc.includes('rain') || weatherDesc.includes('snow')) {
    fuelEfficiencyImpact -= 2; // Rain/snow reduces efficiency
  }
  
  // Calculate potential time savings with optimal driving
  const timeImpact = Math.round(distance * 0.05); // 5% time savings potential
  
  return {
    fuelEfficiencyImpact,
    optimalDepartureTime: getOptimalDepartureTime(weather),
    potentialTimeSavings: timeImpact,
    trafficLikelihood: getTrafficLikelihood(distance),
  };
};

const getOptimalDepartureTime = (weather: any) => {
  const currentHour = new Date().getHours();
  
  // Avoid rush hours (7-9 AM, 4-6 PM)
  if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 18)) {
    return 'Current time is during peak traffic. Consider delaying departure by 1-2 hours for better conditions.';
  }
  
  // Avoid driving in bad weather if possible
  const weatherDesc = weather?.description?.toLowerCase() || '';
  if (
    weatherDesc.includes('storm') || 
    weatherDesc.includes('heavy rain') || 
    weatherDesc.includes('snow')
  ) {
    return 'Current weather conditions are less than ideal. Consider waiting for weather to improve if possible.';
  }
  
  return 'Current time appears optimal for departure based on traffic patterns and weather conditions.';
};

const getTrafficLikelihood = (distance: number) => {
  // Simplified traffic model based on route distance
  // Longer routes typically have more variables and higher likelihood of traffic incidents
  if (distance < 10) {
    return 'Low';
  } else if (distance < 30) {
    return 'Moderate';
  } else {
    return 'High';
  }
};

// Format time from minutes to hours and minutes
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Route categories and sample data
const ROUTE_CATEGORIES = [
  { id: 'scenic', label: 'Scenic Drive', icon: '🌄' },
  { id: 'track', label: 'Track Day', icon: '🏁' },
  { id: 'weekend', label: 'Weekend Getaway', icon: '🏞️' },
  { id: 'commute', label: 'Daily Commute', icon: '🏙️' },
  { id: 'enthusiast', label: 'Enthusiast Run', icon: '🏎️' },
  { id: 'national_park', label: 'National Park', icon: '🌲' },
  { id: 'racetrack', label: 'Famous Racetrack', icon: '🏎️' },
  { id: 'legendary', label: 'Legendary Road', icon: '🗻' },
  { id: 'first_drive', label: 'First Time Drive', icon: '🔍' },
];

// Navigation services
const NAVIGATION_SERVICES = [
  { 
    id: 'google', 
    name: 'Google Maps', 
    logo: '🌎',
    getDirectionsUrl: (startLat: number, startLon: number, endLat: number, endLon: number, waypoints?: Location[]) => {
      let url = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLon}&destination=${endLat},${endLon}&travelmode=driving`;
      
      if (waypoints && waypoints.length > 0) {
        const waypointsStr = waypoints.map(wp => `${wp.lat},${wp.lon}`).join('|');
        url += `&waypoints=${waypointsStr}`;
      }
      
      return url;
    }
  },
  { 
    id: 'waze', 
    name: 'Waze', 
    logo: '🧭',
    getDirectionsUrl: (startLat: number, startLon: number, endLat: number, endLon: number) => {
      return `https://www.waze.com/ul?ll=${endLat}%2C${endLon}&navigate=yes&zoom=17`;
    }
  },
  { 
    id: 'apple', 
    name: 'Apple Maps', 
    logo: '🗺️',
    getDirectionsUrl: (startLat: number, startLon: number, endLat: number, endLon: number) => {
      return `http://maps.apple.com/?saddr=${startLat},${startLon}&daddr=${endLat},${endLon}&dirflg=d`;
    }
  }
];

// Sample vehicles for demonstration
const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 1,
    make: 'Ferrari',
    model: 'F8 Tributo',
    year: 2022,
    nickname: 'The Prancing Horse',
    color: 'Rosso Corsa',
    image: '/assets/ferrari-f8.jpg',
    currentMileage: 3421
  },
  {
    id: 2,
    make: 'Porsche',
    model: '911 GT3',
    year: 2021,
    nickname: 'Track Beast',
    color: 'Racing Yellow',
    image: '/assets/porsche-gt3.jpg',
    currentMileage: 8753
  },
  {
    id: 3,
    make: 'Aston Martin',
    model: 'DB11',
    year: 2020,
    nickname: 'British Elegance',
    color: 'Magnetic Silver',
    image: '/assets/aston-db11.jpg',
    currentMileage: 12405
  }
];

// Sample passengers for demonstration
const SAMPLE_PASSENGERS: Passenger[] = [
  { id: 1, name: 'Alex Johnson', relationship: 'Co-Driver', notes: 'Experienced navigator' },
  { id: 2, name: 'Morgan Smith', relationship: 'Spouse', notes: 'Prefers scenic routes' },
  { id: 3, name: 'Jamie Williams', relationship: 'Friend', notes: 'Motorsport enthusiast' },
  { id: 4, name: 'Taylor Reed', relationship: 'Car Club Member', notes: 'Professional photographer' }
];

// Sample routes for demonstration
const SAMPLE_ROUTES: Route[] = [
  {
    id: 1,
    name: "Mountain Sunrise Run",
    startPoint: { id: "asheville", name: "Asheville, NC", lat: 35.5951, lon: -82.5515 },
    endPoint: { id: "blueridge", name: "Blue Ridge Parkway MM 355", lat: 35.7168, lon: -82.2274 },
    distance: 28,
    estimatedTime: "45m",
    notes: "Beautiful morning drive with sunrise views. Best between 6-8 AM.",
    category: "scenic",
    favorite: true,
    lastDriven: "2023-11-15"
  },
  {
    id: 2,
    name: "Charlotte Motor Speedway Loop",
    startPoint: { id: "concord", name: "Concord, NC", lat: 35.4088, lon: -80.5795 },
    endPoint: { id: "harrisburg", name: "Harrisburg, NC", lat: 35.3224, lon: -80.6542 },
    distance: 42,
    estimatedTime: "55m",
    notes: "Great weekend drive with sweeping curves and good pavement. Stop at the speedway visitor center.",
    category: "enthusiast",
    favorite: true,
    lastDriven: "2023-10-22"
  },
  {
    id: 3,
    name: "Lake Norman Scenic Loop",
    startPoint: { id: "davidson", name: "Davidson, NC", lat: 35.4993, lon: -80.8487 },
    endPoint: { id: "mooresville", name: "Mooresville, NC", lat: 35.5848, lon: -80.8104 },
    distance: 28,
    estimatedTime: "45m",
    notes: "Relaxing drive with lake views. Several restaurants along the way with outdoor seating.",
    category: "weekend",
    favorite: false,
    lastDriven: "2023-08-05"
  }
];

const RoutePlannerPage = () => {
  // State for route management
  const [routes, setRoutes] = useState<Route[]>(SAMPLE_ROUTES);
  const [activeTab, setActiveTab] = useState('create');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [activeActionTab, setActiveActionTab] = useState('overview');
  
  // Navigation preferences
  const [preferredNavService, setPreferredNavService] = useState('google');
  const [showNavOptions, setShowNavOptions] = useState(false);
  
  // Vehicle and passenger selection
  const [vehicles, setVehicles] = useState<Vehicle[]>(SAMPLE_VEHICLES);
  const [passengers, setPassengers] = useState<Passenger[]>(SAMPLE_PASSENGERS);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<number[]>([]);
  const [isFirstDrive, setIsFirstDrive] = useState(false);
  
  // Mileage tracking
  const [mileageTracking, setMileageTracking] = useState({
    startMileage: 0,
    endMileage: 0,
    fuelConsumption: 0
  });
  
  // Waypoints for multi-stop routes
  const [waypoints, setWaypoints] = useState<Location[]>([]);
  const [waypointInput, setWaypointInput] = useState('');
  const [isSearchingWaypoint, setIsSearchingWaypoint] = useState(false);
  
  // Route customization options
  const [routeCustomizations, setRouteCustomizations] = useState<RouteCustomizationOptions>({
    isRoundTrip: false,
    avoidTolls: false,
    onlyTolls: false,
    scenicRoute: false,
    includeGasStops: false,
    includeFoodStops: false,
  });
  
  // New route state
  const [newRoute, setNewRoute] = useState<Partial<Route>>({
    id: Date.now(),
    name: "",
    category: "scenic",
    favorite: false,
    distance: 0,
    estimatedTime: "",
    notes: "",
    waypoints: [],
  });
  
  // Location search state
  const [startLocationInput, setStartLocationInput] = useState("");
  const [endLocationInput, setEndLocationInput] = useState("");
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingEnd, setIsSearchingEnd] = useState(false);
  const [startSearchResults, setStartSearchResults] = useState<any[]>([]);
  const [endSearchResults, setEndSearchResults] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  
  // Form focus refs
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  
  // Handle searching for starting location
  const handleStartLocationSearch = async () => {
    if (!startLocationInput.trim()) return;
    
    setIsSearchingStart(true);
    try {
      // Mock geocoding API response for demo
      setTimeout(() => {
        setStartSearchResults([
          { name: 'Charlotte', state: 'NC', lat: 35.2271, lon: -80.8431, place_id: 'charlotte_nc' },
          { name: 'Raleigh', state: 'NC', lat: 35.7796, lon: -78.6382, place_id: 'raleigh_nc' },
          { name: 'Asheville', state: 'NC', lat: 35.5951, lon: -82.5515, place_id: 'asheville_nc' }
        ]);
        setIsSearchingStart(false);
      }, 800);
    } catch (err) {
      console.error('Error searching for start location:', err);
      setIsSearchingStart(false);
    }
  };
  
  // Handle searching for end location
  const handleEndLocationSearch = async () => {
    if (!endLocationInput.trim()) return;
    
    setIsSearchingEnd(true);
    try {
      // Mock geocoding API response for demo
      setTimeout(() => {
        setEndSearchResults([
          { name: 'Blue Ridge Parkway', state: 'NC', lat: 35.7168, lon: -82.2274, place_id: 'brp_nc' },
          { name: 'Boone', state: 'NC', lat: 36.2168, lon: -81.6746, place_id: 'boone_nc' },
          { name: 'Wilmington', state: 'NC', lat: 34.2104, lon: -77.8868, place_id: 'wilmington_nc' }
        ]);
        setIsSearchingEnd(false);
      }, 800);
    } catch (err) {
      console.error('Error searching for end location:', err);
      setIsSearchingEnd(false);
    }
  };
  
  // Handle waypoint search
  const handleWaypointSearch = async () => {
    if (!waypointInput.trim()) return;
    
    setIsSearchingWaypoint(true);
    try {
      // Mock geocoding API response for demo
      setTimeout(() => {
        setSearchResults([
          { name: 'Winston-Salem', state: 'NC', lat: 36.0999, lon: -80.2442, place_id: 'ws_nc' },
          { name: 'Greensboro', state: 'NC', lat: 36.0726, lon: -79.7920, place_id: 'greensboro_nc' },
          { name: 'Durham', state: 'NC', lat: 35.9940, lon: -78.8986, place_id: 'durham_nc' }
        ]);
        setIsSearchingWaypoint(false);
      }, 800);
    } catch (err) {
      console.error('Error searching for waypoint:', err);
      setIsSearchingWaypoint(false);
    }
  };
  
  // Select start location from search results
  const selectStartLocation = (result: any) => {
    const location: Location = {
      id: `${result.lat},${result.lon}`,
      name: result.name + (result.state ? `, ${result.state}` : ''),
      lat: result.lat,
      lon: result.lon,
      placeId: result.place_id
    };
    
    setNewRoute(prev => ({ ...prev, startPoint: location }));
    setStartLocationInput(location.name);
    setStartSearchResults([]);
    
    // Focus next input after selection
    if (endInputRef.current && !newRoute.endPoint) {
      endInputRef.current.focus();
    }
  };
  
  // Select end location from search results
  const selectEndLocation = (result: any) => {
    const location: Location = {
      id: `${result.lat},${result.lon}`,
      name: result.name + (result.state ? `, ${result.state}` : ''),
      lat: result.lat,
      lon: result.lon,
      placeId: result.place_id
    };
    
    setNewRoute(prev => ({ ...prev, endPoint: location }));
    setEndLocationInput(location.name);
    setEndSearchResults([]);
    
    // Calculate route if we have start and end points
    if (newRoute.startPoint) {
      updateRouteCalculations(
        newRoute.startPoint as Location,
        location,
        waypoints
      );
    }
  };
  
  // Select waypoint from search results
  const selectWaypoint = (result: any) => {
    const waypoint: Location = {
      id: `waypoint-${result.lat},${result.lon}`,
      name: result.name + (result.state ? `, ${result.state}` : ''),
      lat: result.lat,
      lon: result.lon,
      placeId: result.place_id
    };
    
    // Add to waypoints list
    const updatedWaypoints = [...waypoints, waypoint];
    setWaypoints(updatedWaypoints);
    
    // Update route calculations if start and end points exist
    if (newRoute.startPoint && newRoute.endPoint) {
      updateRouteCalculations(
        newRoute.startPoint as Location,
        newRoute.endPoint as Location,
        updatedWaypoints
      );
    }
    
    // Clear waypoint input and search results
    setWaypointInput('');
    setSearchResults([]);
  };
  
  // Remove waypoint from list
  const removeWaypoint = (index: number) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints.splice(index, 1);
    setWaypoints(updatedWaypoints);
    
    // Recalculate route if needed
    if (newRoute.startPoint && newRoute.endPoint) {
      updateRouteCalculations(
        newRoute.startPoint as Location,
        newRoute.endPoint as Location,
        updatedWaypoints
      );
    }
  };
  
  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Calculate total distance with waypoints
  const calculateTotalDistanceWithWaypoints = (start: Location, end: Location, via: Location[] = []): number => {
    if (via.length === 0) {
      return calculateDistance(start.lat, start.lon, end.lat, end.lon);
    }
    
    let totalDistance = 0;
    
    // Start to first waypoint
    totalDistance += calculateDistance(start.lat, start.lon, via[0].lat, via[0].lon);
    
    // Between waypoints
    for (let i = 0; i < via.length - 1; i++) {
      totalDistance += calculateDistance(
        via[i].lat, via[i].lon,
        via[i+1].lat, via[i+1].lon
      );
    }
    
    // Last waypoint to end
    totalDistance += calculateDistance(
      via[via.length - 1].lat, via[via.length - 1].lon,
      end.lat, end.lon
    );
    
    return totalDistance;
  };
  
  // Get selected vehicle
  const getSelectedVehicle = () => {
    if (!selectedVehicleId) return null;
    return vehicles.find(v => v.id === selectedVehicleId) || null;
  };
  
  // Get selected passengers
  const getSelectedPassengers = () => {
    return passengers.filter(p => selectedPassengerIds.includes(p.id));
  };
  
  // Toggle passenger selection
  const togglePassenger = (passengerId: number) => {
    if (selectedPassengerIds.includes(passengerId)) {
      setSelectedPassengerIds(selectedPassengerIds.filter(id => id !== passengerId));
    } else {
      setSelectedPassengerIds([...selectedPassengerIds, passengerId]);
    }
  };
  
  // Update mileage data based on selected vehicle
  const updateMileageFromVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setMileageTracking(prev => ({
        ...prev,
        startMileage: vehicle.currentMileage
      }));
    }
  };
  
  // When vehicle selection changes
  const handleVehicleChange = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    updateMileageFromVehicle(vehicleId);
  };
  
  // Handle mileage tracking changes
  const handleMileageChange = (field: 'startMileage' | 'endMileage' | 'fuelConsumption', value: number) => {
    setMileageTracking(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Toggle route customization options
  const toggleRouteCustomization = (option: keyof RouteCustomizationOptions) => {
    // Handle mutually exclusive options
    if (option === 'avoidTolls' && routeCustomizations.onlyTolls) {
      setRouteCustomizations({
        ...routeCustomizations,
        [option]: !routeCustomizations[option],
        onlyTolls: false
      });
      return;
    }
    
    if (option === 'onlyTolls' && routeCustomizations.avoidTolls) {
      setRouteCustomizations({
        ...routeCustomizations,
        [option]: !routeCustomizations[option],
        avoidTolls: false
      });
      return;
    }
    
    // Regular toggle for other options
    setRouteCustomizations({
      ...routeCustomizations,
      [option]: !routeCustomizations[option]
    });
    
    // Recalculate route if start and end points exist
    if (newRoute.startPoint && newRoute.endPoint) {
      updateRouteCalculations(
        newRoute.startPoint as Location,
        newRoute.endPoint as Location,
        waypoints
      );
    }
  };
  
  // Update route calculations based on points
  const updateRouteCalculations = (start: Location, end: Location, via: Location[] = []) => {
    // Base distance calculation
    let totalDistance = calculateTotalDistanceWithWaypoints(start, end, via);
    
    // If round trip, double the distance
    if (routeCustomizations.isRoundTrip) {
      totalDistance *= 2;
    }
    
    // Calculate time with adjustments for route customizations
    let timeMultiplier = 1.2; // Base time multiplier
    
    // Add time for stops
    if (routeCustomizations.includeFoodStops) timeMultiplier += 0.2;
    if (routeCustomizations.includeGasStops) timeMultiplier += 0.1;
    
    // Adjust for scenic routes (slower) or toll roads (faster)
    if (routeCustomizations.scenicRoute) timeMultiplier += 0.3;
    if (routeCustomizations.onlyTolls) timeMultiplier -= 0.2;
    
    const timeInMinutes = Math.round(totalDistance * timeMultiplier);
    
    setNewRoute(prev => ({
      ...prev,
      distance: Math.round(totalDistance),
      estimatedTime: formatTime(timeInMinutes)
    }));
  };
  
  // Generate first drive intelligence
  const generateFirstDriveIntelligence = () => {
    if (!newRoute.startPoint || !newRoute.endPoint || !selectedVehicleId) return null;
    
    const vehicle = getSelectedVehicle();
    if (!vehicle) return null;
    
    return {
      vehicleRecommendations: [
        `${vehicle.make} ${vehicle.model} is best suited for ${newRoute.category === 'track' ? 'spirited driving' : 'this route type'}`,
        `Estimated fuel consumption: ${Math.round(newRoute.distance! / 22)} gallons`,
        `Brake check recommended before ${newRoute.category === 'track' ? 'track session' : 'departure'}`,
        `Tire pressure: Front 32 PSI / Rear 30 PSI for ${vehicle.make} ${vehicle.model}`
      ],
      routeInsights: [
        `First time on this route - consider lower speeds for familiarization`,
        `Save this route to your Favorites for performance tracking`,
        `Expect ${newRoute.distance! > 100 ? 'multiple rest stops' : 'light traffic'} on this ${newRoute.category} route`
      ]
    };
  };
  
  // Handle form submission to add new route
  const handleAddRoute = () => {
    // Validate required fields
    if (!newRoute.name || !newRoute.startPoint || !newRoute.endPoint) {
      alert("Please complete all required fields.");
      return;
    }
    
    const selectedVehicle = getSelectedVehicle();
    const selectedPassengers = getSelectedPassengers();
    
    // Calculate mileage data
    let tripMileage = 0;
    if (mileageTracking.startMileage > 0 && mileageTracking.endMileage > 0) {
      tripMileage = mileageTracking.endMileage - mileageTracking.startMileage;
    }
    
    // Create new route object
    const completeRoute: Route = {
      id: Date.now(),
      name: newRoute.name || "Unnamed Route",
      startPoint: newRoute.startPoint as Location,
      endPoint: newRoute.endPoint as Location,
      waypoints: waypoints.length > 0 ? waypoints : undefined,
      distance: newRoute.distance || 0,
      estimatedTime: newRoute.estimatedTime || "0m",
      notes: newRoute.notes || "",
      category: newRoute.category || "scenic",
      favorite: newRoute.favorite || false,
      lastDriven: new Date().toISOString().split('T')[0],
      vehicle: selectedVehicle || undefined,
      vehicleId: selectedVehicleId || undefined,
      passengers: selectedPassengers.length > 0 ? selectedPassengers : undefined,
      startMileage: mileageTracking.startMileage || undefined,
      endMileage: mileageTracking.endMileage || undefined,
      tripMileage: tripMileage || undefined,
      fuelConsumption: mileageTracking.fuelConsumption || undefined,
      // Save route customizations
      routeCustomizations: {
        isRoundTrip: routeCustomizations.isRoundTrip,
        avoidTolls: routeCustomizations.avoidTolls,
        onlyTolls: routeCustomizations.onlyTolls,
        scenicRoute: routeCustomizations.scenicRoute,
        includeGasStops: routeCustomizations.includeGasStops,
        includeFoodStops: routeCustomizations.includeFoodStops
      } as RouteCustomizationOptions
    };
    
    // Add to routes
    setRoutes([...routes, completeRoute]);
    
    // Update vehicle mileage in garage (in a real app, this would update the database)
    if (selectedVehicle && mileageTracking.endMileage > selectedVehicle.currentMileage) {
      const updatedVehicles = vehicles.map(v => {
        if (v.id === selectedVehicle.id) {
          return { ...v, currentMileage: mileageTracking.endMileage };
        }
        return v;
      });
      setVehicles(updatedVehicles);
    }
    
    // Reset form
    setNewRoute({
      id: Date.now(),
      name: "",
      category: "scenic",
      favorite: false,
      distance: 0,
      estimatedTime: "",
      notes: "",
      waypoints: [],
    });
    setStartLocationInput("");
    setEndLocationInput("");
    setWaypointInput("");
    setWaypoints([]);
    setSearchResults([]);
    setSelectedVehicleId(null);
    setSelectedPassengerIds([]);
    setIsFirstDrive(false);
    setMileageTracking({
      startMileage: 0,
      endMileage: 0,
      fuelConsumption: 0
    });
    // Reset route customizations
    setRouteCustomizations({
      isRoundTrip: false,
      avoidTolls: false,
      onlyTolls: false,
      scenicRoute: false,
      includeGasStops: false,
      includeFoodStops: false,
    });
  };
  
  // Handle selecting a route to view details
  const handleSelectRoute = async (route: Route) => {
    setSelectedRoute(route);
    setActiveTab('details');
    setActiveActionTab('overview');
    
    // Load weather data for this route
    setIsLoadingWeather(true);
    try {
      // Get weather at start and end points
      const startWeather = await getWeatherData({
        lat: route.startPoint.lat,
        lon: route.startPoint.lon
      }, 'imperial');
      
      const endWeather = await getWeatherData({
        lat: route.endPoint.lat,
        lon: route.endPoint.lon
      }, 'imperial');
      
      // Get additional weather details for start point
      const startOneCall = await getOneCallData({
        lat: route.startPoint.lat,
        lon: route.startPoint.lon
      }, 'imperial');
      
      // Create road condition evaluations
      const startCondition = getRoadConditionForLocation(
        startWeather.weather[0], 
        startWeather.main.temp
      );
      
      const endCondition = getRoadConditionForLocation(
        endWeather.weather[0], 
        endWeather.main.temp
      );
      
      // Create midpoints along the route for more detailed conditions
      const midLat = (route.startPoint.lat + route.endPoint.lat) / 2;
      const midLon = (route.startPoint.lon + route.endPoint.lon) / 2;
      
      const midWeather = await getWeatherData({
        lat: midLat,
        lon: midLon
      }, 'imperial');
      
      const midCondition = getRoadConditionForLocation(
        midWeather.weather[0], 
        midWeather.main.temp
      );
      
      // Calculate route performance metrics
      const performance = calculateRoutePerformance(
        startWeather.weather[0],
        route.distance,
        startWeather.main.temp,
        endWeather.main.temp
      );
      
      // Combine all data
      setWeatherData({
        startPoint: {
          weather: startWeather,
          oneCall: startOneCall,
          condition: startCondition
        },
        midPoint: {
          weather: midWeather,
          condition: midCondition
        },
        endPoint: {
          weather: endWeather,
          condition: endCondition
        },
        performance
      });
    } catch (err) {
      console.error('Error fetching weather data for route:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  };
  
  // Handle back button click
  const handleBackToList = () => {
    setActiveTab('create');
    setSelectedRoute(null);
    setWeatherData(null);
  };
  
  // Open navigation app with directions
  const openNavigation = (navServiceId?: string) => {
    if (!selectedRoute) return;
    
    const service = navServiceId 
      ? NAVIGATION_SERVICES.find(s => s.id === navServiceId) 
      : NAVIGATION_SERVICES.find(s => s.id === preferredNavService);
    
    if (!service) return;
    
    const url = service.getDirectionsUrl(
      selectedRoute.startPoint.lat,
      selectedRoute.startPoint.lon,
      selectedRoute.endPoint.lat,
      selectedRoute.endPoint.lon,
      selectedRoute.waypoints
    );
    
    // Save preference if different from current
    if (navServiceId && navServiceId !== preferredNavService) {
      setPreferredNavService(navServiceId);
      setShowNavOptions(false);
    }
    
    // Open in new tab
    window.open(url, '_blank');
  };
  
  // Get status color based on road condition
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-500';
      case 'caution':
        return 'text-amber-500';
      case 'warning':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };
  
  // Render road condition icon
  const renderConditionIcon = (icon: string) => {
    switch (icon) {
      case 'wet':
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      case 'snow':
        return <Cloud className="h-5 w-5 text-white" />;
      case 'fog':
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'storm':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'ice':
        return <Thermometer className="h-5 w-5 text-blue-300" />;
      case 'hot':
        return <Thermometer className="h-5 w-5 text-red-500" />;
      default:
        return <Compass className="h-5 w-5 text-green-500" />;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-blue-400 font-orbitron text-3xl mb-4 md:mb-0 flex items-center">
          <Navigation className="mr-3 h-8 w-8" />
          Paddock20™ Route Planner
        </h1>
        
        {/* Top navigation/control buttons */}
        {activeTab === 'details' && selectedRoute && (
          <button 
            onClick={handleBackToList}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center"
          >
            <CornerUpRight className="h-4 w-4 mr-2" />
            Back to Routes
          </button>
        )}
      </div>
      
      {/* Main content area */}
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg border border-gray-800 shadow-xl overflow-hidden">
        {/* Create new route form */}
        {activeTab === 'create' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column: New Route Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-gray-800">
                  <h2 className="text-xl text-blue-500 font-orbitron mb-4 flex items-center">
                    <RouteIcon className="mr-2 h-5 w-5" />
                    Create New Route
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Route name input */}
                    <div>
                      <label className="block text-gray-300 mb-1">Route Name</label>
                      <input
                        type="text"
                        value={newRoute.name || ''}
                        onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                        placeholder="Weekend Mountain Drive"
                      />
                    </div>
                    
                    {/* Start location */}
                    <div className="relative">
                      <label className="block text-gray-300 mb-1">Starting Location</label>
                      <div className="flex">
                        <input
                          ref={startInputRef}
                          type="text"
                          value={startLocationInput}
                          onChange={(e) => setStartLocationInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleStartLocationSearch()}
                          className="flex-grow px-4 py-2 bg-gray-900 border border-gray-700 rounded-l text-white"
                          placeholder="City or address"
                        />
                        <button
                          onClick={handleStartLocationSearch}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-r"
                        >
                          {isSearchingStart ? (
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                          ) : (
                            <Search className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      
                      {/* Search results dropdown for start location */}
                      {startSearchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg">
                          <ul className="py-1">
                            {startSearchResults.map((result, index) => (
                              <li 
                                key={index}
                                onClick={() => selectStartLocation(result)}
                                className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-center"
                              >
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-white">
                                  {result.name}{result.state && `, ${result.state}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* End location */}
                    <div className="relative">
                      <label className="block text-gray-300 mb-1">Destination</label>
                      <div className="flex">
                        <input
                          ref={endInputRef}
                          type="text"
                          value={endLocationInput}
                          onChange={(e) => setEndLocationInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleEndLocationSearch()}
                          className="flex-grow px-4 py-2 bg-gray-900 border border-gray-700 rounded-l text-white"
                          placeholder="City or address"
                        />
                        <button
                          onClick={handleEndLocationSearch}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-r"
                        >
                          {isSearchingEnd ? (
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                          ) : (
                            <Search className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      
                      {/* Search results dropdown for end location */}
                      {endSearchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg">
                          <ul className="py-1">
                            {endSearchResults.map((result, index) => (
                              <li 
                                key={index}
                                onClick={() => selectEndLocation(result)}
                                className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-center"
                              >
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-white">
                                  {result.name}{result.state && `, ${result.state}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Waypoints section - Only show if start and end are selected */}
                    {newRoute.startPoint && newRoute.endPoint && (
                      <div className="mt-6 border-t border-gray-800 pt-4">
                        <h3 className="text-lg text-blue-400 mb-3">Waypoints</h3>
                        
                        {/* Waypoint input */}
                        <div className="relative">
                          <div className="flex mb-2">
                            <input
                              type="text"
                              value={waypointInput}
                              onChange={(e) => setWaypointInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleWaypointSearch()}
                              className="flex-grow px-4 py-2 bg-gray-900 border border-gray-700 rounded-l text-white"
                              placeholder="Add a stop along the way"
                            />
                            <button
                              onClick={handleWaypointSearch}
                              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-r"
                            >
                              {isSearchingWaypoint ? (
                                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                              ) : (
                                <Search className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                          
                          {/* Search results dropdown for waypoints */}
                          {searchResults.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg">
                              <ul className="py-1">
                                {searchResults.map((result, index) => (
                                  <li 
                                    key={index}
                                    onClick={() => selectWaypoint(result)}
                                    className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-center"
                                  >
                                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-white">
                                      {result.name}{result.state && `, ${result.state}`}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {/* Waypoints list */}
                        {waypoints.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-green-400 mb-2">
                              {waypoints.length} {waypoints.length === 1 ? 'waypoint' : 'waypoints'} added
                            </p>
                            <ul className="space-y-2">
                              {waypoints.map((waypoint, index) => (
                                <li key={waypoint.id} className="flex items-center justify-between bg-gray-800 rounded-md p-2">
                                  <div className="flex items-center">
                                    <span className="w-6 h-6 flex items-center justify-center bg-blue-500 rounded-full text-white text-xs mr-2">
                                      {index + 1}
                                    </span>
                                    <span className="text-white">{waypoint.name}</span>
                                  </div>
                                  <button 
                                    onClick={() => removeWaypoint(index)}
                                    className="text-gray-400 hover:text-red-400"
                                  >
                                    &times;
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Route customization options */}
                    {newRoute.startPoint && newRoute.endPoint && (
                      <div className="mt-6 border-t border-gray-800 pt-4">
                        <h3 className="text-lg text-blue-400 mb-3">Route Customization</h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {/* Round Trip */}
                          <div 
                            className={`cursor-pointer p-3 rounded-md flex flex-col items-center border ${routeCustomizations.isRoundTrip ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-700'}`}
                            onClick={() => toggleRouteCustomization('isRoundTrip')}
                          >
                            <Infinity className="h-6 w-6 mb-1 text-gray-300" />
                            <span className="text-sm text-gray-300">Round Trip</span>
                          </div>
                          
                          {/* Avoid Tolls */}
                          <div 
                            className={`cursor-pointer p-3 rounded-md flex flex-col items-center border ${routeCustomizations.avoidTolls ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-700'}`}
                            onClick={() => toggleRouteCustomization('avoidTolls')}
                          >
                            <AlertTriangle className="h-6 w-6 mb-1 text-gray-300" />
                            <span className="text-sm text-gray-300">Avoid Tolls</span>
                          </div>
                          
                          {/* Only Tolls (Fastest) */}
                          <div 
                            className={`cursor-pointer p-3 rounded-md flex flex-col items-center border ${routeCustomizations.onlyTolls ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-700'}`}
                            onClick={() => toggleRouteCustomization('onlyTolls')}
                          >
                            <Clock className="h-6 w-6 mb-1 text-gray-300" />
                            <span className="text-sm text-gray-300">Prefer Tolls</span>
                          </div>
                          
                          {/* Scenic Route */}
                          <div 
                            className={`cursor-pointer p-3 rounded-md flex flex-col items-center border ${routeCustomizations.scenicRoute ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-700'}`}
                            onClick={() => toggleRouteCustomization('scenicRoute')}
                          >
                            <MapIcon className="h-6 w-6 mb-1 text-gray-300" />
                            <span className="text-sm text-gray-300">Scenic Route</span>
                          </div>
                          
                          {/* Include Gas Stops */}
                          <div 
                            className={`cursor-pointer p-3 rounded-md flex flex-col items-center border ${routeCustomizations.includeGasStops ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-700'}`}
                            onClick={() => toggleRouteCustomization('includeGasStops')}
                          >
                            <Locate className="h-6 w-6 mb-1 text-gray-300" />
                            <span className="text-sm text-gray-300">Gas Stops</span>
                          </div>
                          
                          {/* Include Food Stops */}
                          <div 
                            className={`cursor-pointer p-3 rounded-md flex flex-col items-center border ${routeCustomizations.includeFoodStops ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-700'}`}
                            onClick={() => toggleRouteCustomization('includeFoodStops')}
                          >
                            <MapPin className="h-6 w-6 mb-1 text-gray-300" />
                            <span className="text-sm text-gray-300">Food Stops</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Category selection */}
                    <div>
                      <label className="block text-gray-300 mb-1">Route Category</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ROUTE_CATEGORIES.map(category => (
                          <div
                            key={category.id}
                            onClick={() => setNewRoute(prev => ({ ...prev, category: category.id }))}
                            className={`cursor-pointer p-2 rounded border ${
                              newRoute.category === category.id 
                                ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                                : 'border-gray-700'
                            } flex items-center`}
                          >
                            <span className="mr-2">{category.icon}</span>
                            <span className="text-sm text-gray-300">{category.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Notes */}
                    <div>
                      <label className="block text-gray-300 mb-1">Notes</label>
                      <textarea
                        value={newRoute.notes || ''}
                        onChange={(e) => setNewRoute(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                        placeholder="Any special instructions or reminders about this route"
                        rows={3}
                      ></textarea>
                    </div>
                    
                    {/* Favorite toggle */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="favorite"
                        checked={newRoute.favorite || false}
                        onChange={(e) => setNewRoute(prev => ({ ...prev, favorite: e.target.checked }))}
                        className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-500 focus:ring-blue-500"
                      />
                      <label htmlFor="favorite" className="text-gray-300">Add to Favorites</label>
                    </div>
                    
                    {/* Vehicle selection */}
                    <div>
                      <label className="block text-gray-300 mb-1">Vehicle for this Route</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {vehicles.map(vehicle => (
                          <div
                            key={vehicle.id}
                            onClick={() => handleVehicleChange(vehicle.id)}
                            className={`cursor-pointer p-3 rounded-md border ${
                              selectedVehicleId === vehicle.id 
                                ? 'border-green-500 bg-green-900 bg-opacity-20' 
                                : 'border-gray-700'
                            }`}
                          >
                            <div className="flex items-center">
                              <Car className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <p className="text-white">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                {vehicle.nickname && (
                                  <p className="text-sm text-gray-400">"{vehicle.nickname}"</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Passengers */}
                    {selectedVehicleId && (
                      <div>
                        <label className="block text-gray-300 mb-1">Passengers</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {passengers.map(passenger => (
                            <div
                              key={passenger.id}
                              onClick={() => togglePassenger(passenger.id)}
                              className={`cursor-pointer p-2 rounded border ${
                                selectedPassengerIds.includes(passenger.id) 
                                  ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                                  : 'border-gray-700'
                              } flex items-center justify-between`}
                            >
                              <span className="text-gray-300">{passenger.name}</span>
                              {passenger.relationship && (
                                <span className="text-xs text-gray-500">{passenger.relationship}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* First Drive checkbox */}
                    {selectedVehicleId && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="firstDrive"
                          checked={isFirstDrive}
                          onChange={(e) => setIsFirstDrive(e.target.checked)}
                          className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor="firstDrive" className="text-gray-300">This is my first time on this route</label>
                      </div>
                    )}
                    
                    {/* First drive intelligence */}
                    {selectedVehicleId && isFirstDrive && newRoute.startPoint && newRoute.endPoint && (
                      <div className="mt-4 bg-gray-850 rounded-md p-4 border border-blue-900">
                        <h3 className="text-blue-400 font-medium mb-2 flex items-center">
                          <BarChart className="h-5 w-5 mr-2" />
                          First Drive Intelligence
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-green-400 text-sm mb-1">Vehicle Recommendations</h4>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                              {generateFirstDriveIntelligence()?.vehicleRecommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-blue-400 text-sm mb-1">Route Insights</h4>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                              {generateFirstDriveIntelligence()?.routeInsights.map((insight, idx) => (
                                <li key={idx}>{insight}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Mileage tracking - only show if vehicle is selected */}
                    {selectedVehicleId && (
                      <div className="mt-6 border-t border-gray-800 pt-4">
                        <h3 className="text-lg text-blue-400 mb-3">Mileage Tracking</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Start Mileage</label>
                            <input
                              type="number"
                              value={mileageTracking.startMileage || ''}
                              onChange={(e) => handleMileageChange('startMileage', parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                              placeholder="Starting odometer reading"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">End Mileage</label>
                            <input
                              type="number"
                              value={mileageTracking.endMileage || ''}
                              onChange={(e) => handleMileageChange('endMileage', parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                              placeholder="Ending odometer reading"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Fuel Used (gal)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={mileageTracking.fuelConsumption || ''}
                              onChange={(e) => handleMileageChange('fuelConsumption', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                              placeholder="Gallons of fuel used"
                            />
                          </div>
                        </div>
                        
                        {/* Display calculated trip mileage if both start and end are provided */}
                        {mileageTracking.startMileage > 0 && mileageTracking.endMileage > 0 && (
                          <div className="mt-2 p-2 bg-blue-900 bg-opacity-20 rounded-md text-center">
                            <span className="text-blue-400">Trip Mileage: </span>
                            <span className="text-white font-medium">
                              {mileageTracking.endMileage - mileageTracking.startMileage} miles
                            </span>
                            
                            {mileageTracking.fuelConsumption > 0 && (
                              <span className="ml-3 text-gray-300">
                                (
                                <span className="text-green-400">
                                  {((mileageTracking.endMileage - mileageTracking.startMileage) / mileageTracking.fuelConsumption).toFixed(1)}
                                </span> MPG)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Submit button */}
                    <div className="mt-6">
                      <button
                        onClick={handleAddRoute}
                        disabled={!newRoute.name || !newRoute.startPoint || !newRoute.endPoint}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium 
                          ${(!newRoute.name || !newRoute.startPoint || !newRoute.endPoint)
                            ? 'bg-gray-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600'
                          }`}
                      >
                        Add to My Routes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column: Route details preview */}
              <div>
                <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-gray-800 mb-6">
                  <h2 className="text-xl text-blue-500 font-orbitron mb-4">Route Information</h2>
                  
                  {/* Route preview info */}
                  {newRoute.startPoint && newRoute.endPoint ? (
                    <div className="space-y-4">
                      {/* Map placeholder */}
                      <div className="aspect-video bg-gray-800 rounded-md flex items-center justify-center">
                        <div className="text-center">
                          <MapIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Interactive map will be shown here</p>
                        </div>
                      </div>
                      
                      {/* Start to End summary */}
                      <div className="bg-gray-900 rounded-md p-3">
                        <div className="flex items-start mb-3">
                          <div className="mt-1">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <div className="w-0.5 h-full bg-gray-700 mx-auto my-1"></div>
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-white">{newRoute.startPoint.name}</p>
                            <div className="my-2 text-gray-500 text-sm">
                              {waypoints.length > 0 && (
                                <div className="flex items-center my-1">
                                  <span className="text-blue-400 text-xs mr-1">{waypoints.length} stops</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="ml-1 text-gray-400">
                                    {waypoints.map(wp => wp.name.split(',')[0]).join(' → ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-white">{newRoute.endPoint.name}</p>
                          </div>
                        </div>
                        
                        {/* Route metrics */}
                        <div className="grid grid-cols-2 gap-3 mt-3 border-t border-gray-800 pt-3">
                          <div>
                            <p className="text-gray-400 text-xs">Distance</p>
                            <p className="text-white text-lg">
                              {newRoute.distance} {newRoute.distance === 1 ? 'mile' : 'miles'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Est. Time</p>
                            <p className="text-white text-lg">{newRoute.estimatedTime}</p>
                          </div>
                          
                          {routeCustomizations.isRoundTrip && (
                            <div className="col-span-2 mt-1">
                              <p className="text-blue-400 text-sm">Round trip included in calculations</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <p>Select start and end points <br/>to preview route details</p>
                    </div>
                  )}
                </div>
                
                {/* Saved routes list */}
                <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-gray-800">
                  <h2 className="text-xl text-blue-500 font-orbitron mb-4">My Routes</h2>
                  
                  {routes.length > 0 ? (
                    <div className="space-y-3">
                      {routes.map(route => (
                        <div 
                          key={route.id}
                          onClick={() => handleSelectRoute(route)}
                          className="bg-gray-900 hover:bg-gray-800 rounded-md p-3 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-white text-lg font-medium">
                                {route.name}
                                {route.favorite && (
                                  <span className="ml-2 text-yellow-400 text-sm">★</span>
                                )}
                              </h3>
                              <p className="text-gray-400 text-sm mt-1">
                                {route.distance} miles • {route.estimatedTime}
                              </p>
                            </div>
                            <div className="text-right">
                              {ROUTE_CATEGORIES.find(c => c.id === route.category)?.icon}
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm">
                            <p className="text-gray-500 truncate">{route.startPoint.name} → {route.endPoint.name}</p>
                          </div>
                          
                          {route.lastDriven && (
                            <div className="mt-2 text-xs text-gray-500 flex items-center">
                              <CalendarClock className="h-3 w-3 mr-1" />
                              Last driven: {new Date(route.lastDriven).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <RouteIcon className="h-10 w-10 mx-auto mb-3 text-gray-600" />
                      <p>No saved routes yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Route details view */}
        {activeTab === 'details' && selectedRoute && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Route details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-gray-800">
                  {/* Header with name and actions */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center">
                        <h2 className="text-2xl text-blue-500 font-orbitron mr-2">
                          {selectedRoute.name}
                        </h2>
                        {selectedRoute.favorite && (
                          <span className="text-yellow-400 text-lg">★</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {selectedRoute.category && ROUTE_CATEGORIES.find(c => c.id === selectedRoute.category)?.label} • 
                        {selectedRoute.distance} miles • {selectedRoute.estimatedTime}
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      {/* Navigation button */}
                      <div className="relative">
                        <button
                          onClick={() => setShowNavOptions(!showNavOptions)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white mr-2 flex items-center"
                        >
                          <Navigation className="h-5 w-5 mr-1" />
                          Navigate
                        </button>
                        
                        {/* Navigation service options dropdown */}
                        {showNavOptions && (
                          <div className="absolute right-0 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                            <ul className="py-1">
                              {NAVIGATION_SERVICES.map(service => (
                                <li 
                                  key={service.id}
                                  onClick={() => openNavigation(service.id)}
                                  className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-center"
                                >
                                  <span className="mr-2">{service.logo}</span>
                                  <span className="text-white">{service.name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {/* Share button */}
                      <button
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white flex items-center"
                      >
                        <Share2 className="h-5 w-5 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                  
                  {/* Map placeholder */}
                  <div className="aspect-video bg-gray-800 rounded-md flex items-center justify-center mb-6">
                    <div className="text-center">
                      <MapIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Interactive map will be shown here</p>
                    </div>
                  </div>
                  
                  {/* Start to End summary */}
                  <div className="bg-gray-900 rounded-md p-4 mb-6">
                    <div className="flex items-start">
                      <div className="mt-1">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <div className="w-0.5 h-full bg-gray-700 mx-auto my-1"></div>
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-white">{selectedRoute.startPoint.name}</p>
                        <div className="my-2 text-gray-500 text-sm">
                          {selectedRoute.waypoints && selectedRoute.waypoints.length > 0 && (
                            <div className="flex items-center my-1">
                              <span className="text-blue-400 text-xs mr-1">{selectedRoute.waypoints.length} stops</span>
                              <span className="text-gray-400">•</span>
                              <span className="ml-1 text-gray-400">
                                {selectedRoute.waypoints.map(wp => wp.name.split(',')[0]).join(' → ')}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-white">{selectedRoute.endPoint.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Tabs */}
                  <div className="border-b border-gray-800 mb-4">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setActiveActionTab('overview')}
                        className={`pb-2 px-1 font-medium text-sm ${
                          activeActionTab === 'overview' 
                            ? 'text-blue-400 border-b-2 border-blue-400' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveActionTab('weather')}
                        className={`pb-2 px-1 font-medium text-sm ${
                          activeActionTab === 'weather' 
                            ? 'text-blue-400 border-b-2 border-blue-400' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        Weather & Road Conditions
                      </button>
                      <button
                        onClick={() => setActiveActionTab('vehicle')}
                        className={`pb-2 px-1 font-medium text-sm ${
                          activeActionTab === 'vehicle' 
                            ? 'text-blue-400 border-b-2 border-blue-400' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        Vehicle & Passengers
                      </button>
                    </div>
                  </div>
                  
                  {/* Tab content */}
                  <div>
                    {/* Overview tab */}
                    {activeActionTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Notes section */}
                        {selectedRoute.notes && (
                          <div>
                            <h3 className="text-gray-300 font-medium mb-2">Notes</h3>
                            <p className="text-gray-400">{selectedRoute.notes}</p>
                          </div>
                        )}
                        
                        {/* Route customization details */}
                        {selectedRoute.routeCustomizations && (
                          <div>
                            <h3 className="text-gray-300 font-medium mb-2">Route Customizations</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedRoute.routeCustomizations.isRoundTrip && (
                                <span className="px-2 py-1 bg-gray-800 rounded-md text-xs text-blue-400">Round Trip</span>
                              )}
                              {selectedRoute.routeCustomizations.avoidTolls && (
                                <span className="px-2 py-1 bg-gray-800 rounded-md text-xs text-blue-400">Avoiding Tolls</span>
                              )}
                              {selectedRoute.routeCustomizations.onlyTolls && (
                                <span className="px-2 py-1 bg-gray-800 rounded-md text-xs text-blue-400">Preferring Tolls</span>
                              )}
                              {selectedRoute.routeCustomizations.scenicRoute && (
                                <span className="px-2 py-1 bg-gray-800 rounded-md text-xs text-green-400">Scenic Route</span>
                              )}
                              {selectedRoute.routeCustomizations.includeGasStops && (
                                <span className="px-2 py-1 bg-gray-800 rounded-md text-xs text-green-400">Gas Stops Included</span>
                              )}
                              {selectedRoute.routeCustomizations.includeFoodStops && (
                                <span className="px-2 py-1 bg-gray-800 rounded-md text-xs text-green-400">Food Stops Included</span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Mileage Tracking */}
                        {selectedRoute.tripMileage || selectedRoute.startMileage || selectedRoute.endMileage ? (
                          <div>
                            <h3 className="text-gray-300 font-medium mb-2">Mileage Tracking</h3>
                            <div className="grid grid-cols-3 gap-4 bg-gray-900 p-3 rounded-md">
                              {selectedRoute.startMileage && (
                                <div>
                                  <p className="text-gray-400 text-xs">Start</p>
                                  <p className="text-white">{selectedRoute.startMileage.toLocaleString()} mi</p>
                                </div>
                              )}
                              {selectedRoute.endMileage && (
                                <div>
                                  <p className="text-gray-400 text-xs">End</p>
                                  <p className="text-white">{selectedRoute.endMileage.toLocaleString()} mi</p>
                                </div>
                              )}
                              {selectedRoute.tripMileage && (
                                <div>
                                  <p className="text-gray-400 text-xs">Trip</p>
                                  <p className="text-white">{selectedRoute.tripMileage.toLocaleString()} mi</p>
                                </div>
                              )}
                              {selectedRoute.fuelConsumption && (
                                <div>
                                  <p className="text-gray-400 text-xs">Fuel Used</p>
                                  <p className="text-white">{selectedRoute.fuelConsumption} gal</p>
                                </div>
                              )}
                              {selectedRoute.fuelConsumption && selectedRoute.tripMileage && (
                                <div>
                                  <p className="text-gray-400 text-xs">Fuel Economy</p>
                                  <p className="text-green-400">
                                    {(selectedRoute.tripMileage / selectedRoute.fuelConsumption).toFixed(1)} MPG
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                    
                    {/* Weather tab */}
                    {activeActionTab === 'weather' && (
                      <div>
                        {isLoadingWeather ? (
                          <div className="flex justify-center items-center py-10">
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                          </div>
                        ) : weatherData ? (
                          <div className="space-y-6">
                            {/* Weather summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Starting point weather */}
                              <div className="bg-gray-900 p-4 rounded-md">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-300">Starting Point</h3>
                                    <p className="text-xs text-gray-500">{selectedRoute.startPoint.name}</p>
                                  </div>
                                  <div className="flex items-center">
                                    {renderConditionIcon(weatherData.startPoint.condition.icon)}
                                    <span className={`ml-1 text-xs ${getStatusColor(weatherData.startPoint.condition.status)}`}>
                                      {weatherData.startPoint.condition.status}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="mt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg text-white">
                                      {formatTemperature(weatherData.startPoint.weather.main.temp)}
                                    </span>
                                    <img 
                                      src={`http://openweathermap.org/img/wn/${weatherData.startPoint.weather.weather[0].icon}@2x.png`} 
                                      alt={weatherData.startPoint.weather.weather[0].description}
                                      className="w-10 h-10"
                                    />
                                  </div>
                                  <p className="text-sm text-gray-400 capitalize">
                                    {weatherData.startPoint.weather.weather[0].description}
                                  </p>
                                </div>
                                
                                <div className="mt-2 text-xs text-gray-400 border-t border-gray-800 pt-2">
                                  {weatherData.startPoint.condition.detail}
                                </div>
                              </div>
                              
                              {/* Mid-route weather */}
                              <div className="bg-gray-900 p-4 rounded-md">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-300">Mid-Route</h3>
                                    <p className="text-xs text-gray-500">Halfway Point</p>
                                  </div>
                                  <div className="flex items-center">
                                    {renderConditionIcon(weatherData.midPoint.condition.icon)}
                                    <span className={`ml-1 text-xs ${getStatusColor(weatherData.midPoint.condition.status)}`}>
                                      {weatherData.midPoint.condition.status}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="mt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg text-white">
                                      {formatTemperature(weatherData.midPoint.weather.main.temp)}
                                    </span>
                                    <img 
                                      src={`http://openweathermap.org/img/wn/${weatherData.midPoint.weather.weather[0].icon}@2x.png`} 
                                      alt={weatherData.midPoint.weather.weather[0].description}
                                      className="w-10 h-10"
                                    />
                                  </div>
                                  <p className="text-sm text-gray-400 capitalize">
                                    {weatherData.midPoint.weather.weather[0].description}
                                  </p>
                                </div>
                                
                                <div className="mt-2 text-xs text-gray-400 border-t border-gray-800 pt-2">
                                  {weatherData.midPoint.condition.detail}
                                </div>
                              </div>
                              
                              {/* Destination weather */}
                              <div className="bg-gray-900 p-4 rounded-md">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-300">Destination</h3>
                                    <p className="text-xs text-gray-500">{selectedRoute.endPoint.name}</p>
                                  </div>
                                  <div className="flex items-center">
                                    {renderConditionIcon(weatherData.endPoint.condition.icon)}
                                    <span className={`ml-1 text-xs ${getStatusColor(weatherData.endPoint.condition.status)}`}>
                                      {weatherData.endPoint.condition.status}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="mt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg text-white">
                                      {formatTemperature(weatherData.endPoint.weather.main.temp)}
                                    </span>
                                    <img 
                                      src={`http://openweathermap.org/img/wn/${weatherData.endPoint.weather.weather[0].icon}@2x.png`} 
                                      alt={weatherData.endPoint.weather.weather[0].description}
                                      className="w-10 h-10"
                                    />
                                  </div>
                                  <p className="text-sm text-gray-400 capitalize">
                                    {weatherData.endPoint.weather.weather[0].description}
                                  </p>
                                </div>
                                
                                <div className="mt-2 text-xs text-gray-400 border-t border-gray-800 pt-2">
                                  {weatherData.endPoint.condition.detail}
                                </div>
                              </div>
                            </div>
                            
                            {/* Route performance metrics */}
                            <div className="mt-6">
                              <h3 className="text-gray-300 font-medium mb-3">Performance Metrics</h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-900 p-4 rounded-md">
                                  <h4 className="text-sm font-medium text-blue-400">Efficiency Impact</h4>
                                  <div className="flex items-center mt-2">
                                    <span className="text-xl text-white">
                                      {weatherData.performance.fuelEfficiencyImpact > 0 ? "+" : ""}
                                      {weatherData.performance.fuelEfficiencyImpact}%
                                    </span>
                                    <span className="ml-2 text-xs text-gray-400">
                                      Fuel efficiency impact based on conditions
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-900 p-4 rounded-md">
                                  <h4 className="text-sm font-medium text-blue-400">Traffic Likelihood</h4>
                                  <div className="flex items-center mt-2">
                                    <span className="text-xl text-white">
                                      {weatherData.performance.trafficLikelihood}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-400">
                                      Based on route type and distance
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-900 p-4 rounded-md md:col-span-2">
                                  <h4 className="text-sm font-medium text-blue-400">Departure Recommendation</h4>
                                  <p className="text-sm text-gray-300 mt-2">
                                    {weatherData.performance.optimalDepartureTime}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Additional weather data for start location */}
                            <div className="mt-6">
                              <h3 className="text-gray-300 font-medium mb-3">Detailed Weather at Starting Point</h3>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-900 p-3 rounded-md">
                                  <p className="text-xs text-gray-400">Feels Like</p>
                                  <p className="text-lg text-white">
                                    {formatTemperature(weatherData.startPoint.weather.main.feels_like)}
                                  </p>
                                </div>
                                
                                <div className="bg-gray-900 p-3 rounded-md">
                                  <p className="text-xs text-gray-400">Humidity</p>
                                  <p className="text-lg text-white">
                                    {weatherData.startPoint.weather.main.humidity}%
                                  </p>
                                </div>
                                
                                <div className="bg-gray-900 p-3 rounded-md">
                                  <p className="text-xs text-gray-400">Wind</p>
                                  <p className="text-lg text-white">
                                    {Math.round(weatherData.startPoint.weather.wind.speed)} mph
                                  </p>
                                </div>
                                
                                <div className="bg-gray-900 p-3 rounded-md">
                                  <p className="text-xs text-gray-400">Pressure</p>
                                  <p className="text-lg text-white">
                                    {weatherData.startPoint.weather.main.pressure} hPa
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-10 text-gray-400">
                            <Cloud className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                            <p>Weather data unavailable</p>
                            <button
                              onClick={() => handleSelectRoute(selectedRoute)}
                              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm"
                            >
                              Fetch Weather Data
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Vehicle tab */}
                    {activeActionTab === 'vehicle' && (
                      <div>
                        {selectedRoute.vehicle ? (
                          <div className="space-y-6">
                            {/* Vehicle info */}
                            <div className="bg-gray-900 p-4 rounded-md">
                              <h3 className="text-gray-300 font-medium mb-3">Vehicle</h3>
                              
                              <div className="flex items-start">
                                <div className="w-16 h-16 bg-gray-800 rounded-md flex items-center justify-center mr-4">
                                  <Car className="h-8 w-8 text-gray-500" />
                                </div>
                                
                                <div>
                                  <h4 className="text-white text-lg">
                                    {selectedRoute.vehicle.year} {selectedRoute.vehicle.make} {selectedRoute.vehicle.model}
                                  </h4>
                                  
                                  {selectedRoute.vehicle.nickname && (
                                    <p className="text-gray-400">"{selectedRoute.vehicle.nickname}"</p>
                                  )}
                                  
                                  {selectedRoute.vehicle.color && (
                                    <p className="text-gray-500 text-sm">{selectedRoute.vehicle.color}</p>
                                  )}
                                  
                                  <p className="text-gray-500 text-sm mt-1">
                                    Mileage: {selectedRoute.vehicle.currentMileage.toLocaleString()} mi
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Passengers */}
                            {selectedRoute.passengers && selectedRoute.passengers.length > 0 && (
                              <div className="bg-gray-900 p-4 rounded-md">
                                <h3 className="text-gray-300 font-medium mb-3">Passengers</h3>
                                
                                <ul className="space-y-2">
                                  {selectedRoute.passengers.map(passenger => (
                                    <li key={passenger.id} className="flex justify-between items-center">
                                      <span className="text-white">{passenger.name}</span>
                                      {passenger.relationship && (
                                        <span className="text-gray-500 text-sm">{passenger.relationship}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-10 text-gray-400">
                            <Car className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                            <p>No vehicle selected for this route</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right column - sidebar */}
              <div className="space-y-6">
                {/* Quick actions */}
                <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-gray-800">
                  <h2 className="text-xl text-blue-500 font-orbitron mb-4">Quick Actions</h2>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openNavigation()}
                      className="p-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white flex flex-col items-center"
                    >
                      <Navigation className="h-6 w-6 mb-1" />
                      <span className="text-sm">Navigate</span>
                    </button>
                    
                    <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-md text-white flex flex-col items-center">
                      <Share className="h-6 w-6 mb-1" />
                      <span className="text-sm">Share</span>
                    </button>
                    
                    <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-md text-white flex flex-col items-center">
                      <Smartphone className="h-6 w-6 mb-1" />
                      <span className="text-sm">Send to Phone</span>
                    </button>
                    
                    <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-md text-white flex flex-col items-center">
                      <ExternalLink className="h-6 w-6 mb-1" />
                      <span className="text-sm">Open in Maps</span>
                    </button>
                  </div>
                </div>
                
                {/* Similar routes */}
                <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-gray-800">
                  <h2 className="text-xl text-blue-500 font-orbitron mb-4">Similar Routes</h2>
                  
                  <div className="space-y-3">
                    {routes
                      .filter(r => r.id !== selectedRoute.id && r.category === selectedRoute.category)
                      .slice(0, 3)
                      .map(route => (
                        <div 
                          key={route.id}
                          onClick={() => handleSelectRoute(route)}
                          className="bg-gray-900 hover:bg-gray-800 rounded-md p-3 cursor-pointer transition-colors"
                        >
                          <h3 className="text-white">{route.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {route.distance} miles • {route.estimatedTime}
                          </p>
                        </div>
                      ))}
                      
                    {routes.filter(r => r.id !== selectedRoute.id && r.category === selectedRoute.category).length === 0 && (
                      <div className="text-center py-4 text-gray-400">
                        <p>No similar routes found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutePlannerPage;