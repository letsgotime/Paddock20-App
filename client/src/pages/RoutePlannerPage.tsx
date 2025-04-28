// /client/src/pages/RoutePlannerPage.tsx

import React, { useState, useRef, useEffect } from "react";
import { getWeatherData, getOneCallData } from '@/services/openWeatherService';

// Define interfaces
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

const RoutePlannerPage = () => {
  // Basic route inputs
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [newWaypoint, setNewWaypoint] = useState("");
  
  // Vehicle and passenger info
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [passengerInfo, setPassengerInfo] = useState("");
  
  // Route customization options
  const [routeCustomizations, setRouteCustomizations] = useState({
    roundTrip: false,
    scenic: false,
    foodStop: false,
    gasStop: false,
    avoidTolls: false,
    allowTolls: false,
  });
  
  // Navigation app settings and integrations
  const [preferredNavApp, setPreferredNavApp] = useState("Google Maps");
  
  // Advanced navigation features
  const [navigationFeatures, setNavigationFeatures] = useState({
    realTimeTraffic: true,
    avoidHighways: false,
    avoidTolls: false,
    preferScenic: false,
    liveSpeedTraps: true,
    livePoliceReports: true,
    favoriteRoutes: true,
    trafficCamerasLayer: false,
    weatherAlerts: true,
    roadClosures: true,
    constructionZones: true,
    alternateRoutes: true,
    curvyRoads: false,  // For enthusiasts who prefer twisty roads
    motorcycleMode: false,
    avoidUnpaved: true,
    hov: false,
    voiceType: "standard" // standard, premium, celebrity
  });
  
  // Integration-specific features
  const [googleMapsOptions, setGoogleMapsOptions] = useState({
    trafficLayer: true,
    satelliteView: false,
    streetView: true,
    terrainView: false,
    evChargingStations: false,
    gasPriceLayer: true,
    placeDetailsEnabled: true
  });
  
  const [wazeOptions, setWazeOptions] = useState({
    showHazards: true,
    showPolice: true,
    showCameras: true,
    showTraffic: true,
    showClosures: true,
    carmaMode: true, // Specialized carpool mode
    personalMood: "Speedy",
    showGasStations: true,
    showFavoriteLocations: true,
    driveLaterTime: null
  });
  
  const [appleMapsOptions, setAppleMapsOptions] = useState({
    useIndoorMapping: false,
    useAirQualityIndex: true,
    useLookAroundView: true,
    useRealityView: false,
    showFlyoverTour: false,
    useCarPlayMode: true,
    showGuideInfo: true
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // Weather and conditions data
  const [weatherData, setWeatherData] = useState<any>(null);
  
  // Telemetry and driving conditions data
  const [telemetryData, setTelemetryData] = useState<any>(null);
  
  // Vehicle performance settings
  const [tirePressureAdjustment, setTirePressureAdjustment] = useState(0); // in PSI
  const [torqueAdjustment, setTorqueAdjustment] = useState(0); // in ft-lb
  const [drivingMode, setDrivingMode] = useState("Sport");
  
  // OpenWeather integration and advanced weather data
  const [weatherImpacts, setWeatherImpacts] = useState<any>(null);
  const [openWeatherSettings, setOpenWeatherSettings] = useState({
    showRoadSurfaceTemp: true,
    showAirDensity: true,
    showVehicleSpecificData: true,
    showWeatherAlerts: true,
    showHourlyForecast: true,
    showVisibilityConditions: true,
    showRadar: false,
    showRainIntensity: true,
    showSnowIntensity: true,
    trackBarometricPressure: true,
    showWindVector: true,
    showUVIndex: true,
    enablePerformanceImpactAlerts: true,
    routeWeatherVarianceWarnings: true,
    trackSunPositionGlare: true,
    showMicroclimateData: false
  });
  
  // Performance recommendations
  const [performanceRecommendations, setPerformanceRecommendations] = useState<string[]>([]);
  
  // Driving profiles
  const [drivingProfiles, setDrivingProfiles] = useState<DrivingProfile[]>([
    {
      name: "Daily Driver",
      style: "Casual",
      corneringAggressiveness: 3,
      brakingIntensity: 4,
      accelerationProfile: 3,
      shiftPattern: "Early",
      fuelConsumptionFactor: 1.0
    },
    {
      name: "Canyon Run",
      style: "Spirited",
      corneringAggressiveness: 7,
      brakingIntensity: 8,
      accelerationProfile: 8,
      shiftPattern: "Optimal",
      fuelConsumptionFactor: 1.3
    },
    {
      name: "Track Day",
      style: "Performance",
      corneringAggressiveness: 9,
      brakingIntensity: 9,
      accelerationProfile: 10,
      shiftPattern: "Late",
      fuelConsumptionFactor: 1.8
    }
  ]);
  
  const [selectedDrivingProfile, setSelectedDrivingProfile] = useState<string>("");
  
  // Tire data
  const [tireSetups, setTireSetups] = useState<Record<string, TireSetup>>({
    "Summer Performance": {
      compound: "Soft",
      treadPattern: "Asymmetric",
      heatingCycle: 5,
      pressureVariance: 1.2,
      optimalTemp: 190
    },
    "All Season": {
      compound: "Medium",
      treadPattern: "Symmetric",
      heatingCycle: 9,
      pressureVariance: 0.9,
      optimalTemp: 170
    },
    "Track Day": {
      compound: "Extra Soft",
      treadPattern: "Slick",
      heatingCycle: 3,
      pressureVariance: 1.8,
      optimalTemp: 210
    }
  });
  
  const [selectedTireSetup, setSelectedTireSetup] = useState<string>("");
  
  // Route analysis data
  const [routeAnalysisEnabled, setRouteAnalysisEnabled] = useState(false);
  const [routeSegments, setRouteSegments] = useState<RouteCondition[]>([]);
  
  // Auto enthusiast destination options
  const [destinationOptions, setDestinationOptions] = useState([
    { name: "Tail of the Dragon", description: "Famous 318 curves in 11 miles - US 129", coordinates: { lat: 35.4660, lon: -83.9210 }, type: "Driving Road" },
    { name: "Nürburgring", description: "The Green Hell - legendary racing circuit", coordinates: { lat: 50.3356, lon: 6.9475 }, type: "Race Track" },
    { name: "Pacific Coast Highway", description: "Scenic coastal route - California", coordinates: { lat: 36.3615, lon: -121.8563 }, type: "Scenic Route" },
    { name: "Stelvio Pass", description: "One of the highest paved roads in Europe", coordinates: { lat: 46.5294, lon: 10.4565 }, type: "Mountain Pass" },
    { name: "Circuit of the Americas", description: "F1 track in Austin", coordinates: { lat: 30.1345, lon: -97.6358 }, type: "Race Track" },
    { name: "Laguna Seca", description: "Famous for the Corkscrew - California", coordinates: { lat: 36.5841, lon: -121.7532 }, type: "Race Track" },
    { name: "Angeles Crest Highway", description: "Winding mountain road in Los Angeles", coordinates: { lat: 34.2573, lon: -118.1010 }, type: "Driving Road" }
  ]);
  
  // Enthusiast points of interest
  const [poiCategories, setPoiCategories] = useState([
    { id: "premium_fuel", name: "Premium Fuel Stations", selected: true },
    { id: "performance_shops", name: "Performance Shops", selected: true },
    { id: "car_meets", name: "Car Meet Locations", selected: false },
    { id: "ev_chargers", name: "High-Speed EV Chargers", selected: false },
    { id: "scenic_overlooks", name: "Scenic Overlooks", selected: true },
    { id: "photo_spots", name: "Car Photography Spots", selected: false },
    { id: "motorsport_venues", name: "Motorsport Venues", selected: false },
    { id: "car_museums", name: "Automotive Museums", selected: false },
    { id: "specialist_mechanics", name: "Specialist Mechanics", selected: false },
    { id: "car_detailing", name: "Detailing Services", selected: false },
    { id: "rv_services", name: "RV Services", selected: false }
  ]);
  
  // User custom vehicle state
  const [customVehicles, setCustomVehicles] = useState<Record<string, VehicleSpecs>>({});
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    optimumTireTemp: 180,
    torqueSetting: 85,
    optimalTirePressureFront: 32,
    optimalTirePressureRear: 32,
    powerOutput: 400,
    weightDistribution: "50/50",
    aerodynamicProfile: "Balanced",
    engineType: "V8 Naturally Aspirated",
    drivetrainType: "RWD",
    suspensionType: "Adaptive",
    transmissionType: "DCT",
    fuelType: "Premium",
    brakingDistance: 105,
    corneringGForce: 1.05
  });

  // Vehicle database - default vehicles plus custom user vehicles
  const defaultVehicleSpecs: Record<string, VehicleSpecs> = {
    "Ferrari F8 Tributo": {
      optimumTireTemp: 195, // F
      torqueSetting: 96, // ft-lb
      optimalTirePressureFront: 32, // PSI
      optimalTirePressureRear: 30, // PSI
      powerOutput: 710, // HP
      weightDistribution: "42/58",
      aerodynamicProfile: "High Downforce"
    },
    "Porsche 911 Carrera S": {
      optimumTireTemp: 185,
      torqueSetting: 92,
      optimalTirePressureFront: 35,
      optimalTirePressureRear: 34,
      powerOutput: 443,
      weightDistribution: "38/62",
      aerodynamicProfile: "Balanced"
    },
    "BMW M4 G82": {
      optimumTireTemp: 175,
      torqueSetting: 88,
      optimalTirePressureFront: 34,
      optimalTirePressureRear: 33,
      powerOutput: 503,
      weightDistribution: "48/52",
      aerodynamicProfile: "Medium Downforce"
    }
  };
  
  // Combine default and custom vehicles
  const vehicleSpecs = { ...defaultVehicleSpecs, ...customVehicles };
  
  // Handle changes to new vehicle form
  const handleNewVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value) || value
    }));
  };
  
  // Add custom vehicle
  const addCustomVehicle = () => {
    if (!newVehicle.name.trim()) {
      alert("Please enter a vehicle name");
      return;
    }
    
    // Add the new vehicle to custom vehicles
    setCustomVehicles(prev => ({
      ...prev,
      [newVehicle.name]: {
        optimumTireTemp: newVehicle.optimumTireTemp,
        torqueSetting: newVehicle.torqueSetting,
        optimalTirePressureFront: newVehicle.optimalTirePressureFront,
        optimalTirePressureRear: newVehicle.optimalTirePressureRear, 
        powerOutput: newVehicle.powerOutput,
        weightDistribution: newVehicle.weightDistribution,
        aerodynamicProfile: newVehicle.aerodynamicProfile
      }
    }));
    
    // Reset form and hide it
    setNewVehicle({
      name: "",
      optimumTireTemp: 180,
      torqueSetting: 85,
      optimalTirePressureFront: 32,
      optimalTirePressureRear: 32,
      powerOutput: 400,
      weightDistribution: "50/50",
      aerodynamicProfile: "Balanced"
    });
    setShowAddVehicleForm(false);
    
    // Select the newly added vehicle
    setTimeout(() => {
      setSelectedVehicle(newVehicle.name);
    }, 100);
  };

  const handleWaypointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewWaypoint(e.target.value);
  };

  const addWaypoint = () => {
    if (newWaypoint.trim() !== "") {
      setWaypoints([...waypoints, newWaypoint]);
      setNewWaypoint("");
    }
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handleRouteCustomizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setRouteCustomizations((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Calculate weather-related driving conditions for the route
  const getRoadConditions = async (startLoc: string, endLoc: string) => {
    try {
      // Mock coordinates for this example - in a real app we'd use geocoding
      const mockCoordinates = {
        startLat: 35.2271,
        startLng: -80.8431,
        endLat: 35.7796,
        endLng: -78.6382
      };
      
      // Get weather at start and end locations
      const startWeather = await getWeatherData({
        lat: mockCoordinates.startLat,
        lon: mockCoordinates.startLng
      }, 'imperial');
      
      const endWeather = await getWeatherData({
        lat: mockCoordinates.endLat,
        lon: mockCoordinates.endLng
      }, 'imperial');
      
      // Get one-call weather data for more detailed forecast
      const startForecast = await getOneCallData({
        lat: mockCoordinates.startLat,
        lon: mockCoordinates.startLng
      }, 'imperial');
      
      // Calculate surface temperatures and driving conditions
      const surfaceTemp = Math.round(startWeather.main.temp + (startWeather.clouds.all < 50 ? 8 : 3));
      const roadCondition = getRoadConditionFromWeather(startWeather.weather[0].description, startWeather.main.temp);
      
      // Get vehicle-specific advice
      const vehicleAdvice = getVehicleSpecificAdvice(selectedVehicle, surfaceTemp, roadCondition);
      
      setWeatherData({
        startWeather,
        endWeather,
        startForecast,
        surfaceTemp,
        roadCondition,
        vehicleAdvice
      });
      
      return true;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return false;
    }
  };

  // Helper functions for weather data processing
  const getRoadConditionFromWeather = (description: string, temp: number) => {
    const desc = description.toLowerCase();
    
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return 'Wet - Reduced Traction';
    } else if (desc.includes('snow') || desc.includes('sleet')) {
      return 'Hazardous - Snow Covered';
    } else if (desc.includes('fog')) {
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
    console.log("Passenger Info:", passengerInfo);
    console.log("Customizations:", routeCustomizations);
    console.log("Preferred Nav App:", preferredNavApp);
    console.log("Weather Data:", weatherData);

    if (weatherLoaded) {
      alert("Route planned with current weather conditions! Ready to navigate.");
    } else {
      alert("Route planned! Weather data could not be loaded.");
    }
    // Implement real app launch logic here
  };

  // Effect for generating performance recommendations when vehicle selection changes
  useEffect(() => {
    if (selectedVehicle) {
      const specs = vehicleSpecs[selectedVehicle];
      if (specs) {
        // Generate F1-grade performance recommendations specific to the selected vehicle
        const recommendations = [
          `Optimal torque setting for ${selectedVehicle}: ${specs.torqueSetting} ft-lb`,
          `Set tire pressures to Front: ${specs.optimalTirePressureFront} PSI / Rear: ${specs.optimalTirePressureRear} PSI`,
          `Target tire temperature: ${specs.optimumTireTemp}°F for maximum grip`,
          `Weight distribution: ${specs.weightDistribution} (front/rear) - adjust driving style accordingly`,
        ];
        
        setPerformanceRecommendations(recommendations);
        
        // Set default driving mode based on vehicle
        if (selectedVehicle.includes('Ferrari')) {
          setDrivingMode('Sport+');
        } else if (selectedVehicle.includes('Porsche')) {
          setDrivingMode('Sport');
        } else {
          setDrivingMode('Comfort');
        }
      }
    }
  }, [selectedVehicle]);

  // Generate telemetry data for the selected vehicle
  const generateTelemetryData = () => {
    if (!selectedVehicle || !weatherData) return null;
    
    const specs = vehicleSpecs[selectedVehicle];
    if (!specs) return null;
    
    const airTemp = weatherData.startWeather.main.temp;
    const surfaceTemp = weatherData.surfaceTemp;
    const humidity = weatherData.startWeather.main.humidity;
    const windSpeed = weatherData.startWeather.wind.speed;
    
    // Calculate telemetry data
    const powerAdjustment = calculatePowerAdjustment(airTemp, humidity);
    const torqueAdjustment = calculateTorqueAdjustment(surfaceTemp, humidity);
    const tireGripLevel = calculateTireGripLevel(surfaceTemp, specs.optimumTireTemp);
    const brakingEfficiency = calculateBrakingEfficiency(surfaceTemp, humidity);
    
    return {
      powerAdjustment,
      torqueAdjustment,
      tireGripLevel,
      brakingEfficiency,
      actualPower: Math.round(specs.powerOutput * (1 + powerAdjustment/100)),
      actualTorque: Math.round(specs.torqueSetting * (1 + torqueAdjustment/100)),
      coolingEfficiency: calculateCoolingEfficiency(airTemp, windSpeed, humidity)
    };
  };
  
  // Calculate power adjustment due to environmental conditions
  const calculatePowerAdjustment = (airTemp: number, humidity: number) => {
    // Temperature effect on power
    let adjustment = 0;
    
    // Cold air is more dense and increases power
    if (airTemp < 60) {
      adjustment += (60 - airTemp) * 0.05; // Up to 3% increase in cold weather
    } 
    // Hot air is less dense and decreases power
    else if (airTemp > 80) {
      adjustment -= (airTemp - 80) * 0.1; // Up to 3% decrease in hot weather
    }
    
    // Humidity effect (high humidity reduces power)
    if (humidity > 70) {
      adjustment -= (humidity - 70) * 0.03; // Up to 1% decrease in high humidity
    }
    
    return Math.round(adjustment * 10) / 10; // Return to 1 decimal place
  };
  
  // Calculate torque adjustment
  const calculateTorqueAdjustment = (surfaceTemp: number, humidity: number) => {
    let adjustment = 0;
    
    // Temperature effects on torque
    if (surfaceTemp < 70) {
      adjustment -= 2; // Cold surface reduces torque
    }
    
    // Humidity effects (minor)
    if (humidity > 80) {
      adjustment -= 1;
    }
    
    return adjustment;
  };
  
  // Calculate tire grip based on temperature
  const calculateTireGripLevel = (currentTemp: number, optimumTemp: number) => {
    const tempDiff = Math.abs(currentTemp - optimumTemp);
    
    if (tempDiff < 10) return 'Optimal';
    if (tempDiff < 20) return 'Good';
    if (tempDiff < 40) return 'Moderate';
    return 'Poor';
  };
  
  // Calculate braking efficiency
  const calculateBrakingEfficiency = (surfaceTemp: number, humidity: number) => {
    let efficiency = 100;
    
    // Temperature effects
    if (surfaceTemp > 120) {
      efficiency -= 5; // Very hot surfaces can reduce brake efficiency
    } else if (surfaceTemp < 40) {
      efficiency -= 10; // Cold brakes are less effective
    }
    
    // Humidity effects
    if (humidity > 85) {
      efficiency -= 3; // High humidity can affect braking
    }
    
    return Math.min(100, Math.max(0, efficiency));
  };
  
  // Calculate cooling efficiency
  const calculateCoolingEfficiency = (airTemp: number, windSpeed: number, humidity: number) => {
    if (airTemp > 90) return 'Reduced - High Heat';
    if (airTemp < 40) return 'Excellent - Cold Air';
    if (windSpeed > 10) return 'Enhanced - Good Airflow';
    if (humidity > 85) return 'Reduced - High Humidity';
    return 'Normal';
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">🛣️ Route Planner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Start Location */}
          <div>
            <label className="block text-gray-300 mb-1">Starting Point</label>
            <input
              type="text"
              placeholder="Start Location"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
            />
          </div>

          {/* End Location */}
          <div>
            <label className="block text-gray-300 mb-1">Destination</label>
            <input
              type="text"
              placeholder="End Location"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
            />
          </div>

          {/* Waypoints */}
          <div>
            <label className="block text-gray-300 mb-1">Add a Waypoint</label>
            <div className="flex gap-4 mb-3">
              <input
                type="text"
                placeholder="Stopover location"
                value={newWaypoint}
                onChange={handleWaypointChange}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
              />
              <button
                onClick={addWaypoint}
                className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded whitespace-nowrap"
              >
                ➕ Add
              </button>
            </div>
            
            {waypoints.length > 0 && (
              <div className="my-3">
                <p className="text-gray-300 mb-2">Waypoints ({waypoints.length})</p>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {waypoints.map((wp, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded-lg border border-gray-700">
                      <span className="text-white font-openSans">{wp}</span>
                      <button
                        onClick={() => removeWaypoint(index)}
                        className="text-red-400 hover:text-red-300 px-2"
                      >
                        ✖
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Vehicle and Passenger Info */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-gray-300">Vehicle Selection</label>
                {!showAddVehicleForm && (
                  <button 
                    onClick={() => setShowAddVehicleForm(true)}
                    className="text-xs text-green-400 hover:text-green-300 flex items-center"
                  >
                    + Add Custom Vehicle
                  </button>
                )}
              </div>
              
              {!showAddVehicleForm ? (
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                >
                  <option value="">Select your vehicle</option>
                  <option value="Ferrari F8 Tributo">Ferrari F8 Tributo</option>
                  <option value="Porsche 911 Carrera S">Porsche 911 Carrera S</option>
                  <option value="BMW M4 G82">BMW M4 G82</option>
                  
                  {/* Custom vehicles */}
                  {Object.keys(customVehicles).length > 0 && (
                    <optgroup label="Your Vehicles">
                      {Object.keys(customVehicles).map(vehicle => (
                        <option key={vehicle} value={vehicle}>{vehicle}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              ) : (
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-2 space-y-4">
                  <h3 className="text-blue-400 font-orbitron text-xl mb-2">Add Custom Vehicle</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Vehicle Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newVehicle.name}
                        onChange={handleNewVehicleChange}
                        placeholder="e.g., My Audi RS6"
                        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Power Output (HP)</label>
                        <input
                          type="number"
                          name="powerOutput"
                          value={newVehicle.powerOutput}
                          onChange={handleNewVehicleChange}
                          min="100"
                          max="1500"
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Torque Setting (ft-lb)</label>
                        <input
                          type="number"
                          name="torqueSetting"
                          value={newVehicle.torqueSetting}
                          onChange={handleNewVehicleChange}
                          min="50"
                          max="300"
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Front Tire PSI</label>
                        <input
                          type="number"
                          name="optimalTirePressureFront" 
                          value={newVehicle.optimalTirePressureFront}
                          onChange={handleNewVehicleChange}
                          min="20"
                          max="50"
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Rear Tire PSI</label>
                        <input
                          type="number"
                          name="optimalTirePressureRear"
                          value={newVehicle.optimalTirePressureRear}
                          onChange={handleNewVehicleChange}
                          min="20"
                          max="50"
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Optimum Tire Temp (°F)</label>
                        <input
                          type="number"
                          name="optimumTireTemp"
                          value={newVehicle.optimumTireTemp}
                          onChange={handleNewVehicleChange}
                          min="120"
                          max="250"
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Weight Distribution</label>
                        <select
                          name="weightDistribution"
                          value={newVehicle.weightDistribution}
                          onChange={handleNewVehicleChange}
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        >
                          <option value="50/50">50/50</option>
                          <option value="45/55">45/55</option>
                          <option value="40/60">40/60</option>
                          <option value="55/45">55/45</option>
                          <option value="60/40">60/40</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Aerodynamic Profile</label>
                      <select
                        name="aerodynamicProfile"
                        value={newVehicle.aerodynamicProfile}
                        onChange={handleNewVehicleChange}
                        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                      >
                        <option value="High Downforce">High Downforce</option>
                        <option value="Balanced">Balanced</option>
                        <option value="Low Drag">Low Drag</option>
                        <option value="Medium Downforce">Medium Downforce</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={addCustomVehicle}
                        className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded"
                      >
                        Save Vehicle
                      </button>
                      <button
                        onClick={() => setShowAddVehicleForm(false)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Passengers</label>
              <input
                type="text"
                placeholder="Passenger Names (Optional)"
                value={passengerInfo}
                onChange={(e) => setPassengerInfo(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
              />
            </div>
            
            {/* Link to Garage Vault */}
            <div className="text-center mt-1">
              <a href="/garage-vault" className="text-blue-400 hover:text-blue-300 text-sm">
                Manage all your vehicles in Garage Vault →
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Route Customization */}
          <div>
            <h2 className="text-blue-400 font-orbitron text-xl mb-3">Route Customizations</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(routeCustomizations).map((key) => (
                <label key={key} className="flex items-center space-x-2 text-white font-openSans">
                  <input
                    type="checkbox"
                    name={key}
                    checked={(routeCustomizations as any)[key]}
                    onChange={handleRouteCustomizationChange}
                    className="form-checkbox text-green-500"
                  />
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation Preference and Advanced Features */}
          <div className="space-y-4">
            <h2 className="text-blue-400 font-orbitron text-xl mb-3">Navigation Integration</h2>
            
            {/* Navigation App Selection */}
            <div>
              <label className="block text-gray-300 mb-1">Preferred Navigation App</label>
              <select
                value={preferredNavApp}
                onChange={(e) => setPreferredNavApp(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
              >
                <option value="Google Maps">Google Maps</option>
                <option value="Waze">Waze</option>
                <option value="Apple Maps">Apple Maps</option>
              </select>
            </div>
            
            {/* Toggle Advanced Settings */}
            <button 
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
            >
              {showAdvancedSettings ? "Hide" : "Show"} Advanced Navigation Features 
              {showAdvancedSettings ? 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg> :
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              }
            </button>
            
            {/* Advanced Navigation Settings */}
            {showAdvancedSettings && (
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 space-y-5">
                {/* Common Navigation Features - show for any app */}
                <div>
                  <h3 className="text-green-400 font-orbitron text-md mb-2">Universal Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={navigationFeatures.realTimeTraffic}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, realTimeTraffic: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Real-Time Traffic</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={navigationFeatures.avoidHighways}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, avoidHighways: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Avoid Highways</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={navigationFeatures.avoidTolls}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, avoidTolls: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Avoid Tolls</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={navigationFeatures.preferScenic}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, preferScenic: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Prefer Scenic Routes</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={navigationFeatures.curvyRoads}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, curvyRoads: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Prefer Curvy Roads</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={navigationFeatures.avoidUnpaved}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, avoidUnpaved: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Avoid Unpaved Roads</span>
                    </label>
                  </div>
                </div>
                
                {/* App-specific settings */}
                {preferredNavApp === "Google Maps" && (
                  <div>
                    <h3 className="text-green-400 font-orbitron text-md mb-2">Google Maps Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={googleMapsOptions.trafficLayer}
                          onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, trafficLayer: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Traffic Layer</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={googleMapsOptions.satelliteView}
                          onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, satelliteView: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Satellite View</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={googleMapsOptions.streetView}
                          onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, streetView: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Street View Access</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={googleMapsOptions.terrainView}
                          onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, terrainView: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Terrain View</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={googleMapsOptions.evChargingStations}
                          onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, evChargingStations: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>EV Charging Stations</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={googleMapsOptions.gasPriceLayer}
                          onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, gasPriceLayer: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Gas Price Layer</span>
                      </label>
                    </div>
                  </div>
                )}
                
                {preferredNavApp === "Waze" && (
                  <div>
                    <h3 className="text-green-400 font-orbitron text-md mb-2">Waze Community Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={wazeOptions.showHazards}
                          onChange={(e) => setWazeOptions({...wazeOptions, showHazards: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Road Hazards</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={wazeOptions.showPolice}
                          onChange={(e) => setWazeOptions({...wazeOptions, showPolice: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Police Reports</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={wazeOptions.showCameras}
                          onChange={(e) => setWazeOptions({...wazeOptions, showCameras: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Speed Cameras</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={wazeOptions.showTraffic}
                          onChange={(e) => setWazeOptions({...wazeOptions, showTraffic: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Live Traffic</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={wazeOptions.showClosures}
                          onChange={(e) => setWazeOptions({...wazeOptions, showClosures: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Road Closures</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={wazeOptions.carmaMode}
                          onChange={(e) => setWazeOptions({...wazeOptions, carmaMode: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Carma Carpool</span>
                      </label>
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-gray-300 text-sm mb-1">Driving Mood</label>
                      <select
                        value={wazeOptions.personalMood}
                        onChange={(e) => setWazeOptions({...wazeOptions, personalMood: e.target.value})}
                        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                      >
                        <option value="Speedy">Speedy</option>
                        <option value="Relaxed">Relaxed</option>
                        <option value="Eco">Eco-Friendly</option>
                        <option value="Moderate">Moderate</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {preferredNavApp === "Apple Maps" && (
                  <div>
                    <h3 className="text-green-400 font-orbitron text-md mb-2">Apple Maps Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={appleMapsOptions.useIndoorMapping}
                          onChange={(e) => setAppleMapsOptions({...appleMapsOptions, useIndoorMapping: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Indoor Mapping</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={appleMapsOptions.useAirQualityIndex}
                          onChange={(e) => setAppleMapsOptions({...appleMapsOptions, useAirQualityIndex: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Air Quality Data</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={appleMapsOptions.useLookAroundView}
                          onChange={(e) => setAppleMapsOptions({...appleMapsOptions, useLookAroundView: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Look Around View</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={appleMapsOptions.useRealityView}
                          onChange={(e) => setAppleMapsOptions({...appleMapsOptions, useRealityView: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>AR Reality View</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={appleMapsOptions.showFlyoverTour}
                          onChange={(e) => setAppleMapsOptions({...appleMapsOptions, showFlyoverTour: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>Flyover Tour</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={appleMapsOptions.useCarPlayMode}
                          onChange={(e) => setAppleMapsOptions({...appleMapsOptions, useCarPlayMode: e.target.checked})}
                          className="form-checkbox text-green-500"
                        />
                        <span>CarPlay Mode</span>
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Deep linking explanation */}
                <div className="bg-gray-950 p-3 rounded border border-gray-700 text-xs text-gray-300">
                  <p>For app-specific features, Paddock20 uses custom launch parameters through deep linking. Your preferences will be automatically configured when opening your preferred navigation app.</p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Performance Settings (shown when vehicle selected) */}
          {selectedVehicle && (
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <h2 className="text-blue-400 font-orbitron text-xl mb-3">Performance Tuning</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">Driving Mode</label>
                  <select
                    value={drivingMode}
                    onChange={(e) => setDrivingMode(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                  >
                    <option>Comfort</option>
                    <option>Sport</option>
                    <option>Sport+</option>
                    <option>Track</option>
                    <option>Wet</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">
                    Torque Adjustment ({torqueAdjustment > 0 ? '+' : ''}{torqueAdjustment} ft-lb)
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={torqueAdjustment}
                    onChange={(e) => setTorqueAdjustment(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">
                    Tire Pressure Adjustment ({tirePressureAdjustment > 0 ? '+' : ''}{tirePressureAdjustment} PSI)
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={tirePressureAdjustment}
                    onChange={(e) => setTirePressureAdjustment(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance recommendations */}
      {selectedVehicle && performanceRecommendations.length > 0 && (
        <div className="mt-6 mb-6 bg-gray-900 p-4 rounded-lg border border-gray-800">
          <h2 className="text-blue-400 font-orbitron text-xl mb-3">F1-Grade Recommendations</h2>
          <ul className="space-y-1">
            {performanceRecommendations.map((rec, index) => (
              <li key={index} className="text-green-400">
                ✓ {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weather/Road Conditions Preview */}
      {weatherData && (
        <div className="mb-8 bg-gray-900 p-4 rounded-lg border border-blue-900">
          <h2 className="text-blue-400 font-orbitron text-2xl mb-4">F1-Grade Driving Conditions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <h3 className="text-green-400 mb-2">Current Weather</h3>
              <p className="text-white">Air Temp: {weatherData.startWeather.main.temp}°F</p>
              <p className="text-white">Asphalt Temp: {weatherData.surfaceTemp}°F</p>
              <p className="text-white">Humidity: {weatherData.startWeather.main.humidity}%</p>
              <p className="text-white">Wind: {weatherData.startWeather.wind.speed} mph</p>
              <p className="text-white">Conditions: {weatherData.startWeather.weather[0].description}</p>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <h3 className="text-green-400 mb-2">Track Conditions</h3>
              <p className="text-white">Surface: {weatherData.roadCondition}</p>
              <p className="text-white">Grip Level: {weatherData.surfaceTemp > 70 ? 'Optimal' : weatherData.surfaceTemp > 50 ? 'Good' : 'Reduced'}</p>
              <p className="text-white">Visibility: {weatherData.startWeather.weather[0].description.includes('fog') ? 'Reduced' : 'Good'}</p>
              <p className="text-white">Tire Warm-up: {weatherData.vehicleAdvice?.tireWarmupTime || '5-10 minutes'}</p>
            </div>
            
            {selectedVehicle && (
              <div className="bg-gray-800 p-3 rounded-lg">
                <h3 className="text-green-400 mb-2">{selectedVehicle} Settings</h3>
                <p className="text-white">Tire Pressure: {weatherData.vehicleAdvice.tirePressure}</p>
                <p className="text-white">Torque Setting: {weatherData.vehicleAdvice.torqueSettings}</p>
                <p className="text-white">Driving Mode: {weatherData.vehicleAdvice.drivingMode}</p>
                <p className="text-white">Brake Performance: {weatherData.surfaceTemp < 40 ? 'Reduced' : 'Optimal'}</p>
              </div>
            )}
          </div>
          
          {/* Advanced Telemetry */}
          {weatherData && selectedVehicle && (
            <div className="mt-4 bg-black bg-opacity-50 p-3 rounded-lg">
              <h3 className="text-blue-400 mb-2">Advanced Telemetry</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Power Adjustment</p>
                  <p className="text-white">{calculatePowerAdjustment(weatherData.startWeather.main.temp, weatherData.startWeather.main.humidity)}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Actual Torque</p>
                  <p className="text-white">{Math.round(vehicleSpecs[selectedVehicle].torqueSetting + torqueAdjustment)} ft-lb</p>
                </div>
                <div>
                  <p className="text-gray-400">Brake Efficiency</p>
                  <p className="text-white">{calculateBrakingEfficiency(weatherData.surfaceTemp, weatherData.startWeather.main.humidity)}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Cooling</p>
                  <p className="text-white">{calculateCoolingEfficiency(weatherData.startWeather.main.temp, weatherData.startWeather.wind.speed, weatherData.startWeather.main.humidity)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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