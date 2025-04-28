import React, { useState, useEffect } from "react";

interface RallyData {
  rallyName: string;
  startLocation: string;
  endLocation: string;
  waypoints: string[];
  eventDate: string;
  host: string;
  isPaddock20Event: boolean;
  eventId: string;
  eventType: string;
  eventDescription: string;
  participantCount: number;
  startTime: string;
  endTime: string;
  difficultyLevel: string;
  recommendedVehicles: string[];
  checkpoints: any[];
  officialRoute: any[];
}

interface Location {
  lat: number;
  lon: number;
  placeId?: string;
}

interface VehicleSpecs {
  optimumTireTemp: number;
  torqueSetting: number;
  optimalTirePressureFront: number;
  optimalTirePressureRear: number;
  powerOutput: number;
  weightDistribution: string;
  aerodynamicProfile: string;
  engineType?: string;
  drivetrainType?: string;
  suspensionType?: string;
  transmissionType?: string;
  fuelType?: string;
  brakingDistance?: number; // feet from 60-0 mph
  corneringGForce?: number; // in G's
}

interface TireSetup {
  compound: string;
  treadPattern: string;
  heatingCycle: number; // minutes to reach optimal temp
  pressureVariance: number; // PSI change per 10°F
  optimalTemp: number; // °F
}

interface RouteCondition {
  location: string;
  surfaceType: string; // asphalt, concrete, paved, gravel
  surfaceTemp: number;
  elevation: number;
  corneringLoad: number; // 1-10 scale
  straightaway: boolean;
  gradientPercent: number;
}

interface DrivingProfile {
  name: string;
  style: 'Casual' | 'Spirited' | 'Performance' | 'Track' | 'Economy';
  corneringAggressiveness: number; // 1-10
  brakingIntensity: number; // 1-10
  accelerationProfile: number; // 1-10
  shiftPattern: 'Early' | 'Optimal' | 'Late';
  fuelConsumptionFactor: number; // adjustment factor
}

interface StrutEvent {
  id: string;
  name: string;
  date: string;
  location: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  type: string;
  description: string;
}

interface CarCultureSpot {
  id: string;
  name: string;
  location: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  type: string;
  description: string;
}

const RoutePlannerPage = () => {
  // Basic Route Properties
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [newWaypoint, setNewWaypoint] = useState("");
  const [routeWaypoints, setRouteWaypoints] = useState<{lat: number, lng: number}[]>([]);
  
  // Vehicle & Weather Data
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoaded, setWeatherLoaded] = useState(false);
  
  // Advanced Automotive Settings
  const [tirePressureAdjustment, setTirePressureAdjustment] = useState(0);
  const [torqueAdjustment, setTorqueAdjustment] = useState(0);
  const [drivingMode, setDrivingMode] = useState("sport");
  const [selectedTireSetup, setSelectedTireSetup] = useState("");
  const [selectedDrivingProfile, setSelectedDrivingProfile] = useState("");
  const [performanceRecommendations, setPerformanceRecommendations] = useState<string[]>([]);
  
  // Route Customization Options
  const [passengerInfo, setPassengerInfo] = useState("");
  const [preferredNavApp, setPreferredNavApp] = useState("google");
  const [routeCustomizations, setRouteCustomizations] = useState({
    avoidHighways: false,
    avoidTolls: false,
    scenicRoute: false,
    fastestRoute: true,
    avoidTraffic: true
  });
  
  // Navigation Features
  const [navigationFeatures, setNavigationFeatures] = useState({
    liveTraffic: true,
    voiceNavigation: true,
    speedLimits: true,
    laneGuidance: true,
    alternateRoutes: false,
    offlineMode: false,
    curvyRoads: false,
    curveIntensity: 3
  });
  
  // Points of Interest
  const [selectedEvents, setSelectedEvents] = useState<StrutEvent[]>([]);
  const [selectedSpots, setSelectedSpots] = useState<CarCultureSpot[]>([]);
  
  // Summit Verification
  const [verified, setVerified] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  // Rally Data Integration
  const [rallyData, setRallyData] = useState<RallyData | null>(null);
  const [isRallyEvent, setIsRallyEvent] = useState(false);
  
  // Vehicle Specs Database - Expanded with F1-grade specs
  const vehicleSpecs: { [key: string]: VehicleSpecs } = {
    "Ferrari F8 Tributo": {
      optimumTireTemp: 175,
      torqueSetting: 96,
      optimalTirePressureFront: 32,
      optimalTirePressureRear: 30,
      powerOutput: 710,
      weightDistribution: "42/58",
      aerodynamicProfile: "Performance",
      engineType: "Twin-Turbo V8",
      drivetrainType: "RWD",
      suspensionType: "Active Electronic",
      transmissionType: "7-speed Dual-Clutch",
      fuelType: "Premium 98",
      brakingDistance: 105,
      corneringGForce: 1.05
    },
    "Porsche 911 Carrera S": {
      optimumTireTemp: 165,
      torqueSetting: 82,
      optimalTirePressureFront: 36,
      optimalTirePressureRear: 35,
      powerOutput: 450,
      weightDistribution: "37/63",
      aerodynamicProfile: "Balanced",
      engineType: "Twin-Turbo Flat-6",
      drivetrainType: "RWD",
      suspensionType: "Adaptive PASM",
      transmissionType: "8-speed PDK",
      fuelType: "Premium 95",
      brakingDistance: 110,
      corneringGForce: 1.02
    },
    "BMW M4 G82": {
      optimumTireTemp: 160,
      torqueSetting: 78,
      optimalTirePressureFront: 35,
      optimalTirePressureRear: 34,
      powerOutput: 510,
      weightDistribution: "52/48",
      aerodynamicProfile: "Sport",
      engineType: "Twin-Turbo Inline-6",
      drivetrainType: "RWD",
      suspensionType: "Adaptive M",
      transmissionType: "8-speed Automatic",
      fuelType: "Premium 95",
      brakingDistance: 115,
      corneringGForce: 0.98
    }
  };
  
  // Tire Setups Database
  const tireSetups: { [key: string]: TireSetup } = {
    "Sport Summer": {
      compound: "Summer Performance",
      treadPattern: "Asymmetric",
      heatingCycle: 5,
      pressureVariance: 1.2,
      optimalTemp: 160
    },
    "Ultra High Performance": {
      compound: "UHP",
      treadPattern: "Directional",
      heatingCycle: 3,
      pressureVariance: 1.5,
      optimalTemp: 175
    },
    "Track Focused": {
      compound: "R-Compound",
      treadPattern: "Semi-Slick",
      heatingCycle: 2,
      pressureVariance: 1.8,
      optimalTemp: 190
    }
  };

  // Driving Profiles Database
  const drivingProfiles: DrivingProfile[] = [
    {
      name: "Casual",
      style: "Casual",
      corneringAggressiveness: 3,
      brakingIntensity: 4,
      accelerationProfile: 3,
      shiftPattern: "Early",
      fuelConsumptionFactor: 0.9
    },
    {
      name: "Spirited",
      style: "Spirited",
      corneringAggressiveness: 6,
      brakingIntensity: 7,
      accelerationProfile: 7,
      shiftPattern: "Optimal",
      fuelConsumptionFactor: 1.2
    },
    {
      name: "Track Day",
      style: "Performance",
      corneringAggressiveness: 9,
      brakingIntensity: 9,
      accelerationProfile: 8,
      shiftPattern: "Late",
      fuelConsumptionFactor: 1.5
    }
  ];

  // Route Curvature Descriptors (TRN = Turns per km)
  const curvatureDescriptors: { [key: string]: string } = {
    "1": "Minimal (0-2 TRN/km)",
    "2": "Light (2-4 TRN/km)",
    "3": "Moderate (4-6 TRN/km)",
    "4": "Spirited (6-8 TRN/km)",
    "5": "Technical (8-12+ TRN/km)"
  };

  // Handle importing a rally from Paddock20
  const handleImportRally = () => {
    // Mock Rally Import Example with comprehensive data
    const rallyExample: RallyData = {
      rallyName: "Paddock20 Spring Rally",
      startLocation: "Charlotte, NC",
      endLocation: "Asheville, NC",
      waypoints: ["Lake Lure", "Chimney Rock", "Blue Ridge Parkway"],
      eventDate: "2025-05-12",
      host: "Paddock20™",
      isPaddock20Event: true,
      eventId: "P20-2025-05-SR-001",
      eventType: "Scenic Rally",
      eventDescription: "The ultimate scenic drive through the Blue Ridge Mountains with exclusive stops at premier automotive venues.",
      participantCount: 85,
      startTime: "09:00 AM",
      endTime: "05:00 PM",
      difficultyLevel: "Intermediate",
      recommendedVehicles: ["Sports Cars", "GTs", "Luxury Performance"],
      checkpoints: [
        { name: "Lake Lure Lookout", coordinates: { lat: 35.4279, lng: -82.2232 } },
        { name: "Chimney Rock Park", coordinates: { lat: 35.4329, lng: -82.2504 } },
        { name: "Blue Ridge Parkway Mile 396", coordinates: { lat: 35.9689, lng: -82.3696 } }
      ],
      officialRoute: [
        { lat: 35.2271, lng: -80.8431 }, // Charlotte
        { lat: 35.4279, lng: -82.2232 }, // Lake Lure
        { lat: 35.4329, lng: -82.2504 }, // Chimney Rock
        { lat: 35.9689, lng: -82.3696 }, // Blue Ridge Parkway
        { lat: 35.5951, lng: -82.5515 }  // Asheville
      ]
    };

    // Set all the rally data in our state
    setRallyData(rallyExample);
    setIsRallyEvent(true);
    setStartLocation(rallyExample.startLocation);
    setWaypoints(rallyExample.waypoints);
    setEndLocation(rallyExample.endLocation);
    setRouteWaypoints(rallyExample.officialRoute);
    
    // Set driving profile to match the rally
    setSelectedDrivingProfile("Spirited");
    setNavigationFeatures(prev => ({...prev, curvyRoads: true, curveIntensity: 4}));
    
    // Show confirmation
    alert(`Successfully imported "${rallyExample.rallyName}" from Paddock20. Route and waypoints have been configured.`);
  };

  const addWaypoint = () => {
    if (newWaypoint.trim() !== "") {
      setWaypoints([...waypoints, newWaypoint]);
      setNewWaypoint("");
    }
  };

  const getRoadConditions = async (start: string, end: string) => {
    try {
      // Mock API call to weather service for road conditions
      // In a real app, we would call the OpenWeather API with coordinates
      
      // For demo, we're creating a simulated weather response
      const mockWeatherResponse = {
        startWeather: {
          main: {
            temp: 72,
            humidity: 65,
            pressure: 1012
          },
          weather: [
            {
              main: "Clear",
              description: "clear sky"
            }
          ],
          wind: {
            speed: 5.2,
            deg: 180
          },
          visibility: 10000
        },
        endWeather: {
          main: {
            temp: 68,
            humidity: 75,
            pressure: 1010
          },
          weather: [
            {
              main: "Clouds",
              description: "scattered clouds"
            }
          ],
          wind: {
            speed: 6.5,
            deg: 220
          },
          visibility: 9000
        },
        // Calculate surface temperature (typically higher than air temp during daytime)
        surfaceTemp: 79,
        // Road surface condition
        surfaceCondition: "Dry", 
        // Grip level assessment
        gripLevel: "Good",
        // Additional specialized data
        airDensity: 1.218, // kg/m³
        dewPoint: 60, // °F
        uvIndex: 6,
        altitude: 750, // feet above sea level
        // Performance impact estimates
        performanceImpact: {
          powerAdjustment: 0.2, // % change
          torqueAdjustment: 0.1, // % change
          brakingDistanceAdjustment: -0.5, // % change
          tireGripAdjustment: 0.3 // % change
        }
      };
      
      setWeatherData(mockWeatherResponse);
      setWeatherLoaded(true);
      return true;
    } catch (error) {
      console.error("Error getting road conditions:", error);
      setWeatherLoaded(false);
      return false;
    }
  };
  
  // Assess road condition based on weather data
  const getRoadConditionAssessment = () => {
    if (!weatherData) return 'Unknown';
    
    const weatherCondition = weatherData.startWeather.weather[0].main;
    const temp = weatherData.startWeather.main.temp;
    
    if (weatherCondition.includes('Rain')) {
      return 'Wet Roads';
    } else if (weatherCondition.includes('Snow')) {
      return 'Snow Covered';
    } else if (weatherCondition.includes('Fog')) {
      return 'Reduced Visibility';
    } else if (temp < 32) {
      return 'Potential Black Ice';
    } else if (temp > 90) {
      return 'Hot Surface - Monitor Tire Pressure';
    }
    
    return 'Optimal Driving Conditions';
  };

  // Get vehicle-specific settings based on weather and road conditions
  const getVehicleSpecificAdvice = (vehicle: string, surfaceTemp: number, roadCondition: string) => {
    // Ferrari F8 specific settings - this would be expanded for other vehicles
    if (vehicle.includes('Ferrari F8')) {
      return {
        tirePressure: roadCondition.includes('Hot') ? 'Front: 34 PSI / Rear: 32 PSI' : 'Front: 32 PSI / Rear: 30 PSI',
        torqueSettings: roadCondition.includes('Wet') ? '80 ft-lb' : '96 ft-lb',
        drivingMode: roadCondition.includes('Wet') || roadCondition.includes('Snow') ? 'Wet Mode' : 'Sport Mode',
        tireWarmupTime: Math.max(3, Math.round(10 - surfaceTemp / 10)) + ' minutes'
      };
    }
    
    // Default advice for other vehicles
    return {
      tirePressure: 'Check manufacturer recommendations',
      torqueSettings: 'Standard settings recommended',
      drivingMode: roadCondition.includes('Wet') ? 'Comfort/Eco Mode' : 'Normal Mode',
      tireWarmupTime: Math.max(5, Math.round(15 - surfaceTemp / 10)) + ' minutes'
    };
  };

  const submitRoute = async () => {
    if (!startLocation || !endLocation) {
      alert("Please enter both start and end locations.");
      return;
    }
    
    // Get weather and road conditions
    const weatherLoaded = await getRoadConditions(startLocation, endLocation);
    
    console.log("Start:", startLocation);
    console.log("Waypoints:", waypoints);
    console.log("End:", endLocation);
    console.log("Vehicle:", selectedVehicle);
    console.log("Rally Event:", isRallyEvent ? rallyData : "None");
    
    // Calculate simulated metrics for demo purposes
    const simulatedDistance = Math.floor(Math.random() * 50) + 30; // 30-80 miles
    const simulatedDuration = Math.floor(Math.random() * 90) + 30; // 30-120 minutes
    const simulatedCurvature = parseFloat((Math.random() * 12).toFixed(1)); // 0-12 TRN/km
    
    // Create a comprehensive route data object to save for Drive Journal
    const routeData = {
      start: startLocation,
      end: endLocation,
      waypoints: waypoints,
      vehicle: selectedVehicle,
      customizations: routeCustomizations,
      preferredNavApp: preferredNavApp,
      // Add telemetry data
      curvatureTRN: simulatedCurvature,
      distance: simulatedDistance,
      duration: simulatedDuration,
      // Add weather and surface data if available
      surfaceTemp: weatherData?.surfaceTemp ? weatherData.surfaceTemp.toString() : "",
      weatherImpact: weatherData?.startWeather?.weather?.[0]?.main || "",
      // Add vehicle performance data if selectedVehicle exists in vehicleSpecs
      tirePressure: selectedVehicle && vehicleSpecs[selectedVehicle] ? 
        `${vehicleSpecs[selectedVehicle].optimalTirePressureFront}/${vehicleSpecs[selectedVehicle].optimalTirePressureRear}` : "",
      torqueSetting: selectedVehicle && vehicleSpecs[selectedVehicle] ? 
        vehicleSpecs[selectedVehicle].torqueSetting.toString() : "",
      // Add rally/event data if applicable
      isRallyEvent: isRallyEvent,
      rallyEventData: isRallyEvent ? rallyData : null
    };
    
    // Save route data to localStorage for Drive Journal to access
    localStorage.setItem("plannedDrive", JSON.stringify(routeData));
    
    if (weatherLoaded) {
      // Display a more detailed confirmation with drive journal option
      const navigateNow = window.confirm("Route planned with current weather conditions! Ready to navigate.\n\nWould you like to record this route in your Drive Journal?");
      
      if (navigateNow) {
        // Navigate to drive journal
        window.location.href = "/drive-journal";
      } else {
        alert("Route saved. You can access it later from your Drive Journal.");
      }
    } else {
      const navigateAnyway = window.confirm("Route planned! Weather data could not be loaded.\n\nWould you like to record this route in your Drive Journal?");
      
      if (navigateAnyway) {
        // Navigate to drive journal
        window.location.href = "/drive-journal";
      } else {
        alert("Route saved. You can access it later from your Drive Journal.");
      }
    }
  };
  
  // Handle event selection to add to route
  const handleEventSelect = (event: StrutEvent) => {
    if (!selectedEvents.some(e => e.id === event.id)) {
      setSelectedEvents(prev => [...prev, event]);
      
      // Also add the event location as a waypoint
      setRouteWaypoints(prev => [...prev, event.location.coordinates]);
      
      alert(`Added ${event.name} to your route!`);
    } else {
      alert("This event is already added to your route.");
    }
  };
  
  // Handle car culture spot selection to add to route
  const handleCultureSpotSelect = (spot: CarCultureSpot) => {
    if (!selectedSpots.some(s => s.id === spot.id)) {
      setSelectedSpots(prev => [...prev, spot]);
      
      // Also add the spot location as a waypoint
      setRouteWaypoints(prev => [...prev, spot.location.coordinates]);
      
      alert(`Added ${spot.name} to your route!`);
    } else {
      alert("This spot is already added to your route.");
    }
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">🛣️ Route Planner</h1>

      {rallyData && (
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-green-500 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-green-400 font-orbitron text-2xl flex items-center">
              <span className="mr-2">🏁</span>
              {rallyData.rallyName}
            </h2>
            
            <div className="bg-green-900 text-xs text-green-200 px-3 py-1 rounded-full">
              Paddock20 Official
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-300 text-sm mb-1">Event Type</p>
              <p className="text-white">{rallyData.eventType}</p>
            </div>
            
            <div className="text-right">
              <p className="text-gray-300 text-sm mb-1">Date</p>
              <p className="text-white">{rallyData.eventDate} ({rallyData.startTime} - {rallyData.endTime})</p>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4">{rallyData.eventDescription}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Difficulty</p>
              <p className="text-white">{rallyData.difficultyLevel}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Participants</p>
              <p className="text-white">{rallyData.participantCount}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Host</p>
              <p className="text-white">{rallyData.host}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Event ID</p>
              <p className="text-white font-mono">{rallyData.eventId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rally Import Button */}
      <div className="mb-6">
        <button
          onClick={handleImportRally}
          className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded"
        >
          📋 Import Rally Drive
        </button>
      </div>

      {/* Start Location */}
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">Start Location</label>
        <input
          type="text"
          placeholder="Start Location"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        />
      </div>

      {/* Waypoints */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">Add Waypoints</label>
        <div className="flex mb-2">
          <input
            type="text"
            placeholder="Add Waypoint"
            value={newWaypoint}
            onChange={(e) => setNewWaypoint(e.target.value)}
            className="flex-grow p-3 bg-gray-800 text-white rounded-l-lg border border-gray-700"
          />
          <button
            onClick={addWaypoint}
            className="bg-blue-500 hover:bg-blue-400 text-black font-montserrat px-6 py-3 rounded-r-lg"
          >
            + Add
          </button>
        </div>

        {waypoints.length > 0 && (
          <ul className="space-y-2 mb-4">
            {waypoints.map((wp, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                <span className="text-white">{wp}</span>
                <button 
                  onClick={() => setWaypoints(waypoints.filter((_, i) => i !== index))}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* End Location */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">End Location</label>
        <input
          type="text"
          placeholder="End Location"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        />
      </div>

      {/* Vehicle Selection */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">Vehicle</label>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        >
          <option value="">Select Vehicle</option>
          <option value="Ferrari F8 Tributo">Ferrari F8 Tributo</option>
          <option value="Porsche 911 Carrera S">Porsche 911 Carrera S</option>
          <option value="BMW M4 G82">BMW M4 G82</option>
        </select>
      </div>

      {/* Curve Intensity (only shown if curvyRoads is selected) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-gray-400 text-sm">Curve Intensity</label>
          <span className="text-gray-400 text-xs">{curvatureDescriptors[navigationFeatures.curveIntensity.toString()]}</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={navigationFeatures.curveIntensity}
          onChange={(e) => setNavigationFeatures({...navigationFeatures, curveIntensity: parseInt(e.target.value)})}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Minimal</span>
          <span>Light</span>
          <span>Moderate</span>
          <span>Spirited</span>
          <span>Technical</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={submitRoute}
        className="bg-blue-500 hover:bg-blue-400 text-black font-montserrat px-8 py-4 rounded w-full"
      >
        🚀 Plan Route
      </button>
    </div>
  );
};

export default RoutePlannerPage;