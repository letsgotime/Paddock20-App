// /client/src/pages/RoutePlannerPage.tsx

import React, { useState, useRef, useEffect } from "react";
import { getWeatherData, getOneCallData } from '@/services/openWeatherService';
import CarEventsExplorer from '@/components/CarEventsExplorer';
import CarCultureSpotsExplorer from '@/components/CarCultureSpotsExplorer';
import { StrutEvent } from '@/services/strutAPI';
import { CarCultureSpot } from '@/services/speedhuntersAPI';
import { Users } from 'lucide-react';

// Helper functions for weather metrics
const calculateAirDensity = (tempF: number, pressureHpa: number): string => {
  // Convert temperature to Kelvin
  const tempK = (tempF - 32) * 5/9 + 273.15;
  
  // Convert pressure from hPa to Pa
  const pressurePa = pressureHpa * 100;
  
  // Standard gas constant for dry air (J/(kg·K))
  const R = 287.058;
  
  // Calculate density (kg/m³)
  const density = pressurePa / (R * tempK);
  
  return density.toFixed(3);
};

const getAirFuelRatio = (tempF: number, humidity: number): string => {
  // Base AFR (Air-Fuel Ratio) for optimal combustion is ~14.7:1
  const baseAFR = 14.7;
  
  // Temperature factor: adjusts for air density changes
  const tempFactor = 1 - (tempF - 70) * 0.001;
  
  // Humidity factor: higher humidity decreases oxygen content
  const humidityFactor = 1 - (humidity / 100) * 0.03;
  
  // Calculate adjusted AFR
  const adjustedAFR = baseAFR * tempFactor * humidityFactor;
  
  return adjustedAFR.toFixed(1) + ':1';
};

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
  
  // Waypoints for Strut API and Speedhunters API
  const [routeWaypoints, setRouteWaypoints] = useState<Array<{lat: number, lng: number}>>([]);
  
  // Selected events and spots
  const [selectedEvents, setSelectedEvents] = useState<StrutEvent[]>([]);
  const [selectedSpots, setSelectedSpots] = useState<CarCultureSpot[]>([]);
  
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
      aerodynamicProfile: "High Downforce",
      engineType: "Twin-Turbo V8",
      drivetrainType: "RWD",
      suspensionType: "Adaptive",
      transmissionType: "DCT",
      fuelType: "Premium",
      brakingDistance: 97,
      corneringGForce: 1.1
    },
    "Porsche 911 Carrera S": {
      optimumTireTemp: 185,
      torqueSetting: 92,
      optimalTirePressureFront: 35,
      optimalTirePressureRear: 34,
      powerOutput: 443,
      weightDistribution: "38/62",
      aerodynamicProfile: "Balanced",
      engineType: "Twin-Turbo Flat-6",
      drivetrainType: "RWD",
      suspensionType: "Adaptive",
      transmissionType: "PDK",
      fuelType: "Premium",
      brakingDistance: 101,
      corneringGForce: 1.08
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

    // Set mock waypoints for the APIs (in a real app, we'd convert addresses to coordinates)
    const mockWaypoints = [
      { lat: 35.2271, lng: -80.8431 }, // Charlotte
      { lat: 35.5168, lng: -80.6307 }, // Concord
      { lat: 35.7796, lng: -78.6382 }  // Raleigh
    ];
    
    // Update route waypoints for the car events and culture spots components
    setRouteWaypoints(mockWaypoints);

    if (weatherLoaded) {
      alert("Route planned with current weather conditions! Ready to navigate.");
    } else {
      alert("Route planned! Weather data could not be loaded.");
    }
    // Implement real app launch logic here
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

      {/* OpenWeather F1-Grade Driving Conditions */}
      {weatherData && (
        <div className="mb-8 bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-blue-900 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-blue-400 font-orbitron text-2xl flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4L12 8L8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.5 10.5L12 16L15.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 20H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              F1-Grade Driving Intelligence
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded-full">OpenWeather API</span>
              <span className="text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded-full">Live</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Weather Details - 4 columns */}
            <div className="md:col-span-4 bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-green-400 font-orbitron mb-1 text-lg">Weather Metrics</h3>
                  <div className="flex items-center">
                    <span className="text-white font-bold text-3xl">{weatherData.startWeather.main.temp}°F</span>
                    <span className="ml-2 text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">Air</span>
                  </div>
                </div>
                <div className="text-5xl">
                  {weatherData.startWeather.weather[0].main === "Clear" ? "☀️" : 
                   weatherData.startWeather.weather[0].main === "Clouds" ? "☁️" :
                   weatherData.startWeather.weather[0].main === "Rain" ? "🌧️" :
                   weatherData.startWeather.weather[0].main === "Snow" ? "❄️" : "🌤️"}
                </div>
              </div>
              
              <div className="space-y-2 mt-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-1">
                  <span className="text-gray-300 text-sm">Asphalt Temperature</span>
                  <span className="text-white font-medium">{weatherData.surfaceTemp}°F</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-1">
                  <span className="text-gray-300 text-sm">Humidity</span>
                  <span className="text-white font-medium">{weatherData.startWeather.main.humidity}%</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-1">
                  <span className="text-gray-300 text-sm">Wind Speed</span>
                  <span className="text-white font-medium">{weatherData.startWeather.wind.speed} mph</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-1">
                  <span className="text-gray-300 text-sm">Wind Direction</span>
                  <span className="text-white font-medium">{weatherData.startWeather.wind.deg}°</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-1">
                  <span className="text-gray-300 text-sm">Barometric Pressure</span>
                  <span className="text-white font-medium">{weatherData.startWeather.main.pressure} hPa</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Visibility</span>
                  <span className="text-white font-medium">{Math.round(weatherData.startWeather.visibility / 1609)} mi</span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-400">
                <p>Conditions: {weatherData.startWeather.weather[0].description}</p>
              </div>
            </div>
            
            {/* Track Conditions - 4 columns */}
            <div className="md:col-span-4 bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-green-400 font-orbitron mb-3 text-lg">Racing Telemetry</h3>
              
              {/* Surface Condition Indicator */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300 text-sm">Surface Condition</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    weatherData.roadCondition.includes('Optimal') ? 'bg-green-900/30 text-green-300' :
                    weatherData.roadCondition.includes('Wet') ? 'bg-blue-900/30 text-blue-300' :
                    weatherData.roadCondition.includes('Hazardous') ? 'bg-red-900/30 text-red-300' :
                    'bg-yellow-900/30 text-yellow-300'
                  }`}>
                    {weatherData.roadCondition}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className={`rounded-full h-2 ${
                    weatherData.roadCondition.includes('Optimal') ? 'bg-green-500 w-full' :
                    weatherData.roadCondition.includes('Hot') ? 'bg-yellow-500 w-5/6' :
                    weatherData.roadCondition.includes('Wet') ? 'bg-blue-500 w-2/5' :
                    weatherData.roadCondition.includes('Reduced') ? 'bg-yellow-500 w-3/5' :
                    'bg-red-500 w-1/5'
                  }`}></div>
                </div>
              </div>
              
              {/* Grip Level Indicator */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300 text-sm">Grip Level</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    weatherData.surfaceTemp > 70 ? 'bg-green-900/30 text-green-300' :
                    weatherData.surfaceTemp > 50 ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {weatherData.surfaceTemp > 70 ? 'Optimal' : weatherData.surfaceTemp > 50 ? 'Good' : 'Reduced'}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className={`rounded-full h-2 ${
                    weatherData.surfaceTemp > 70 ? 'bg-green-500 w-full' :
                    weatherData.surfaceTemp > 50 ? 'bg-yellow-500 w-4/6' :
                    'bg-red-500 w-2/6'
                  }`}></div>
                </div>
              </div>
              
              {/* Visibility Indicator */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300 text-sm">Visibility</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    weatherData.startWeather.weather[0].description.includes('fog') ? 'bg-red-900/30 text-red-300' :
                    weatherData.startWeather.weather[0].description.includes('mist') ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-green-900/30 text-green-300'
                  }`}>
                    {weatherData.startWeather.weather[0].description.includes('fog') ? 'Reduced' : 
                     weatherData.startWeather.weather[0].description.includes('mist') ? 'Moderate' : 'Good'}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className={`rounded-full h-2 ${
                    weatherData.startWeather.weather[0].description.includes('fog') ? 'bg-red-500 w-1/4' :
                    weatherData.startWeather.weather[0].description.includes('mist') ? 'bg-yellow-500 w-3/4' :
                    'bg-green-500 w-full'
                  }`}></div>
                </div>
              </div>
              
              {/* Additional Performance Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-gray-900 p-2 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Tire Warmup</div>
                  <div className="text-white font-medium">
                    {weatherData.vehicleAdvice?.tireWarmupTime || '5-10 min'}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Air Density</div>
                  <div className="text-white font-medium">
                    {calculateAirDensity(weatherData.startWeather.main.temp, weatherData.startWeather.main.pressure)} kg/m³
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Air:Fuel Ratio</div>
                  <div className="text-white font-medium">
                    {getAirFuelRatio(weatherData.startWeather.main.temp, weatherData.startWeather.main.humidity)}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Power Adjustment</div>
                  <div className="text-white font-medium">
                    {weatherData.startWeather.main.temp < 60 ? '+3%' : 
                     weatherData.startWeather.main.temp > 85 ? '-2%' : '0%'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vehicle Settings - 4 columns */}
            {selectedVehicle && (
              <div className="md:col-span-4 bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner">
                <h3 className="text-green-400 font-orbitron mb-3 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {selectedVehicle} Settings
                </h3>
                
                {/* Recommendation Indicator */}
                <div className="flex items-center mb-3">
                  <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                  <span className="text-green-400 text-xs">AI-optimized settings for current conditions</span>
                </div>
                
                {/* Vehicle Settings Panels */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Tire Pressure</div>
                    <div className="text-white font-medium">{weatherData.vehicleAdvice.tirePressure}</div>
                    <div className="text-xs text-blue-400 mt-1">
                      {weatherData.roadCondition.includes('Hot') ? 'Increased for heat dissipation' : 
                       weatherData.roadCondition.includes('Wet') ? 'Reduced for better wet traction' : 
                       'Optimal for current conditions'}
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Torque Settings</div>
                    <div className="text-white font-medium">{weatherData.vehicleAdvice.torqueSettings}</div>
                    <div className="text-xs text-blue-400 mt-1">
                      {weatherData.roadCondition.includes('Wet') ? 'Reduced to prevent wheelspin' : 
                       weatherData.roadCondition.includes('Optimal') ? 'Maximum power delivery' : 
                       'Adjusted for safety'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Driving Mode</div>
                    <div className="text-white font-medium">{weatherData.vehicleAdvice.drivingMode}</div>
                    <div className="text-xs text-blue-400 mt-1">
                      {weatherData.vehicleAdvice.drivingMode === 'Sport Mode' ? 'Performance oriented' : 
                       weatherData.vehicleAdvice.drivingMode === 'Wet Mode' ? 'Enhanced traction control' : 
                       'Balanced settings'}
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Brake Performance</div>
                    <div className="text-white font-medium">{weatherData.surfaceTemp < 40 ? 'Reduced' : 'Optimal'}</div>
                    <div className="text-xs text-blue-400 mt-1">
                      {weatherData.surfaceTemp < 40 ? 'Gentle initial application recommended' : 
                       'Standard braking techniques appropriate'}
                    </div>
                  </div>
                </div>
                
                {/* Weather Impact on Performance */}
                {openWeatherSettings.enablePerformanceImpactAlerts && (
                  <div className="mt-4 p-2 bg-blue-900/20 rounded-lg border border-blue-900/30">
                    <h4 className="text-blue-400 text-xs uppercase font-semibold mb-1">Performance Impact</h4>
                    <p className="text-white text-xs">
                      {weatherData.roadCondition.includes('Optimal') ? 
                        'Current conditions are ideal for maximum performance. Power delivery and grip are at optimal levels.' :
                       weatherData.roadCondition.includes('Hot') ?
                        'Elevated surface temperatures may reduce tire longevity. Consider shorter driving sessions.' :
                       weatherData.roadCondition.includes('Wet') ?
                        'Reduced traction will impact acceleration and braking. Increase following distances.' :
                        'Exercise caution as conditions are not ideal for performance driving.'}
                    </p>
                  </div>
                )}
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

      {/* Car Events and Culture Spots Discovery */}
      {routeWaypoints.length > 0 && (
        <div className="mt-8 space-y-8">
          <h2 className="text-blue-400 font-orbitron text-2xl">Discover Along Your Route</h2>
          
          {/* Car Events Explorer */}
          <CarEventsExplorer 
            waypoints={routeWaypoints}
            radius={25}
            onSelectEvent={handleEventSelect}
          />
          
          {/* Car Culture Spots Explorer */}
          <CarCultureSpotsExplorer
            waypoints={routeWaypoints}
            radius={15}
            onSelectSpot={handleCultureSpotSelect}
          />
          
          {/* Selected Events and Spots */}
          {(selectedEvents.length > 0 || selectedSpots.length > 0) && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-blue-400 font-orbitron text-xl mb-3">Your Custom Route Stops</h3>
              
              {selectedEvents.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-green-400 font-semibold mb-2">Selected Events</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedEvents.map(event => (
                      <div key={event.id} className="bg-black/30 p-3 rounded-lg border border-gray-700 flex justify-between">
                        <div>
                          <div className="text-white font-medium">{event.name}</div>
                          <div className="text-gray-400 text-sm">{event.date} at {event.startTime}</div>
                        </div>
                        <button 
                          onClick={() => setSelectedEvents(prev => prev.filter(e => e.id !== event.id))}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedSpots.length > 0 && (
                <div>
                  <h4 className="text-green-400 font-semibold mb-2">Selected Culture Spots</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSpots.map(spot => (
                      <div key={spot.id} className="bg-black/30 p-3 rounded-lg border border-gray-700 flex justify-between">
                        <div>
                          <div className="text-white font-medium">{spot.name}</div>
                          <div className="text-gray-400 text-sm capitalize">{spot.category.replace('_', ' ')}</div>
                        </div>
                        <button 
                          onClick={() => setSelectedSpots(prev => prev.filter(s => s.id !== spot.id))}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={submitRoute}
        className="bg-blue-500 hover:bg-blue-400 text-black font-montserrat px-8 py-4 rounded w-full mt-8"
      >
        🚀 Plan Route
      </button>
    </div>
  );
};

export default RoutePlannerPage;