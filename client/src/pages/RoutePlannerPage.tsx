// /client/src/pages/RoutePlannerPage.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { getWeatherData, getOneCallData } from '@/services/openWeatherService';
import CarEventsExplorer from '@/components/CarEventsExplorer';
import CarCultureSpotsExplorer from '@/components/CarCultureSpotsExplorer';
// Removed heatmap import
import { StrutEvent } from '@/services/strutAPI';
import { CarCultureSpot } from '@/services/speedhuntersAPI';
import { Users, MapPin, Wind, Thermometer, Droplets, Sun, CloudRain, BarChart3, Compass, Mountain, Clock, RotateCw, Activity } from 'lucide-react';

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

interface TelemetrySnapshot {
  timestamp: number;
  position: { lat: number; lng: number };
  speed: number; // mph
  rpm?: number;
  acceleration?: number; // G-forces
  lateralG?: number; // G-forces
  throttlePosition?: number; // 0-100%
  brakePosition?: number; // 0-100%
  steeringAngle?: number; // degrees
  elevation?: number; // meters
  gradient?: number; // percent
  curvature?: number; // radius in meters
  roadSurfaceTemp?: number; // F
  tirePressureFront?: number; // PSI
  tirePressureRear?: number; // PSI
  tireTempFront?: number; // F
  tireTempRear?: number; // F
  wheelSlip?: number; // percent
  engineTemp?: number; // F
  oilTemp?: number; // F
  oilPressure?: number; // PSI
  fuelConsumption?: number; // mpg
  rangeToBoundary?: number; // miles to performance boundary
  gForceVector?: { x: number; y: number; z: number };
  weatherCondition?: string;
  // F1-grade telemetry additions
  powerAdjustment?: number; // percentage adjustment due to conditions
  torqueAdjustment?: number; // ft-lb adjustment
  tireGripLevel?: 'Optimal' | 'Good' | 'Moderate' | 'Poor';
  brakingEfficiency?: number; // percentage
  actualPower?: number; // calculated HP
  actualTorque?: number; // calculated ft-lb
  coolingEfficiency?: string; // textual description
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
  // Enhanced route inputs with multi-leg journey support
  interface RouteStop {
    location: string;
    arrivalDate: string;
    departureDate: string;
    stayDuration: number; // in days
    notes: string;
    isOvernight: boolean;
  }
  
  const [startLocation, setStartLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Multi-city style waypoints with dates
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [newStopLocation, setNewStopLocation] = useState("");
  const [newStopDate, setNewStopDate] = useState("");
  const [stayDuration, setStayDuration] = useState(0);
  const [stopNotes, setStopNotes] = useState("");
  const [isOvernight, setIsOvernight] = useState(false);
  
  // Legacy support for old waypoints data structure
  const [waypoints, setWaypoints] = useState<string[]>([]);
  
  // Vehicle and passenger info
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [hasPassengers, setHasPassengers] = useState(false);
  const [passengers, setPassengers] = useState<string[]>(["", "", ""]);
  
  // Helper function to update a passenger at a specific index
  const updatePassenger = (index: number, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index] = value;
    setPassengers(newPassengers);
  };
  
  // Photo gallery handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    // Limit to 5 photos total
    if (carPhotos.length + selectedFiles.length > 5) {
      alert("You can only upload up to 5 photos in total.");
      return;
    }
    
    // Add new photos
    const newPhotos = [...carPhotos, ...selectedFiles];
    setCarPhotos(newPhotos);
    
    // Generate preview URLs
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls]);
  };
  
  const removePhoto = (index: number) => {
    // Remove the photo and its preview URL
    const newPhotos = [...carPhotos];
    const newPreviewUrls = [...photoPreviewUrls];
    
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newPhotos.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setCarPhotos(newPhotos);
    setPhotoPreviewUrls(newPreviewUrls);
  };
  
  // Video gallery handlers
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files).filter(file => 
      file.type.startsWith('video/') // Ensure only video files are accepted
    );
    
    if (selectedFiles.length === 0) {
      alert("Please select valid video files (MP4, WebM, etc.)");
      return;
    }
    
    // Limit to 3 videos total
    if (carVideos.length + selectedFiles.length > 3) {
      alert("You can only upload up to 3 videos in total.");
      return;
    }
    
    // Check file sizes (limit to 100MB per video)
    const oversizedVideos = selectedFiles.filter(file => file.size > 100 * 1024 * 1024);
    if (oversizedVideos.length > 0) {
      alert("Some videos exceed the 100MB size limit and won't be uploaded.");
      return;
    }
    
    // Add new videos
    const newVideos = [...carVideos, ...selectedFiles];
    setCarVideos(newVideos);
    
    // Generate preview URLs
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setVideoPreviewUrls([...videoPreviewUrls, ...newPreviewUrls]);
  };
  
  const removeVideo = (index: number) => {
    // Remove the video and its preview URL
    const newVideos = [...carVideos];
    const newPreviewUrls = [...videoPreviewUrls];
    
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newVideos.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setCarVideos(newVideos);
    setVideoPreviewUrls(newPreviewUrls);
  };
  
  // Voice recording handlers
  const startRecording = async () => {
    try {
      // Reset previous recording
      setAudioChunks([]);
      setRecordingTime(0);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create a new media recorder
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      // Set up data handling
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => [...prev, e.data]);
        }
      };
      
      // Handle recording stop
      recorder.onstop = () => {
        // Combine chunks into a single blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Create a URL for the blob for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      recorder.start();
      setIsRecording(true);
      
      // Start the timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Store the timer ID to clear it later
      (window as any).recordingTimer = timer;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check your browser permissions.");
    }
  };
  
  const stopRecording = () => {
    if (!mediaRecorder) return;
    
    // Stop the recorder
    mediaRecorder.stop();
    setIsRecording(false);
    
    // Clear the timer
    if ((window as any).recordingTimer) {
      clearInterval((window as any).recordingTimer);
    }
  };
  
  const playRecording = () => {
    if (!audioUrl) return;
    
    // Play the audio
    const audio = new Audio(audioUrl);
    audio.play();
  };
  
  const deleteRecording = () => {
    // Clear the recording
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioChunks([]);
    setRecordingTime(0);
  };
  
  // F1-grade telemetry and advanced settings
  const [selectedTireSetup, setSelectedTireSetup] = useState("");
  const [drivePurpose, setDrivePurpose] = useState("leisure");
  const [customDrivePurpose, setCustomDrivePurpose] = useState("");
  const [showCustomDrivePurposeForm, setShowCustomDrivePurposeForm] = useState(false);
  const [engineModeProfile, setEngineModeProfile] = useState("standard");
  
  // Car club/group and event/rally information
  const [isGroupDrive, setIsGroupDrive] = useState(false);
  const [carClubName, setCarClubName] = useState("");
  const [carClubContactInfo, setCarClubContactInfo] = useState("");
  const [isEventRally, setIsEventRally] = useState(false);
  const [eventRallyName, setEventRallyName] = useState("");
  const [eventRallyOrganizer, setEventRallyOrganizer] = useState("");
  const [eventRallyUrl, setEventRallyUrl] = useState("");
  const [eventRallyDate, setEventRallyDate] = useState("");
  const [eventRallyTime, setEventRallyTime] = useState("");
  const [eventRallyDescription, setEventRallyDescription] = useState("");
  const [eventRallyLocation, setEventRallyLocation] = useState("");
  const [eventRallyUrlLoading, setEventRallyUrlLoading] = useState(false);
  const [eventMapFile, setEventMapFile] = useState<File | null>(null);
  const [eventMapUrl, setEventMapUrl] = useState<string | null>(null);
  
  // Drive companions state
  const [hasFriendsJoining, setHasFriendsJoining] = useState<boolean>(false);
  const [drivingCompanions, setDrivingCompanions] = useState<Array<{name: string, vehicle: string, vehicleDetails?: string}>>([]);
  const [newCompanionName, setNewCompanionName] = useState<string>('');
  const [newCompanionVehicle, setNewCompanionVehicle] = useState<string>('');
  const [newCompanionVehicleDetails, setNewCompanionVehicleDetails] = useState<string>('');
  const [companionsListView, setCompanionsListView] = useState<'grid' | 'list'>('grid');
  
  // Car photo gallery states
  const [carPhotos, setCarPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  
  // Video gallery states
  const [carVideos, setCarVideos] = useState<File[]>([]);
  const [videoPreviewUrls, setVideoPreviewUrls] = useState<string[]>([]);
  
  // Voice note states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  
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
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // Advanced navigation features
  const [navigationFeatures, setNavigationFeatures] = useState({
    realTimeTraffic: true,
    avoidHighways: false,
    avoidTolls: false,
    avoidUnpaved: true,
    avoidFerries: false,
    preferScenic: false,
    liveSpeedTraps: true,
    livePoliceReports: true,
    favoriteRoutes: true,
    trafficCamerasLayer: false,
    weatherAlerts: true,
    weatherForecastIntegration: true,  // Enhanced weather integration
    weatherPreferDry: false,           // Prefer routes with less precipitation
    weatherTempRange: [55, 85],        // Preferred temperature range for driving
    weatherOptimizeSunlight: false,    // Optimize for best sunlight conditions
    roadClosures: true,
    constructionZones: true,
    alternateRoutes: true,
    curvyRoads: false,                 // For enthusiasts who prefer twisty roads
    curveIntensity: 3,                 // 1-5 scale corresponding to TRN/km values
    curvatureMode: 'balanced',         // 'mild', 'balanced', 'aggressive', 'technical'
    curveDirection: 'both',            // 'left', 'right', 'both'
    elevationChanges: false,           // Preference for routes with elevation changes
    elevationIntensity: 2,             // 1-5 scale for elevation change intensity
    motorcycleMode: false,
    hov: false,
    optimizeForSportsCars: false, // Sports car specific optimizations
    trafficAvoidance: 'moderate', // 'none', 'light', 'moderate', 'aggressive', 'max'
    roadTypePreference: 'balanced', // 'highways', 'balanced', 'scenic', 'enthusiast'
    complexityLevel: 3, // 1-5 scale for route complexity
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
  
  // Weather and conditions data
  const [weatherData, setWeatherData] = useState<any>(null);
  

  
  // Telemetry and driving conditions data
  const [telemetryData, setTelemetryData] = useState<TelemetrySnapshot | null>(null);
  const [telemetryStats, setTelemetryStats] = useState<{
    maxSpeed: number;
    maxRpm: number;
    maxAcceleration: number;
    maxLateralG: number;
    avgSpeed: number;
    totalDistance: number;
    curvyRoadPercentage: number;
    straightRoadPercentage: number;
    roadTypeBreakdown: Record<string, number>;
    elevationChange: number;
    fuelEfficiency: number;
    drivingScore: number;
  }>({
    maxSpeed: 0,
    maxRpm: 0,
    maxAcceleration: 0,
    maxLateralG: 0,
    avgSpeed: 0,
    totalDistance: 0,
    curvyRoadPercentage: 0,
    straightRoadPercentage: 0,
    roadTypeBreakdown: {},
    elevationChange: 0,
    fuelEfficiency: 0,
    drivingScore: 0
  });
  
  // GPS and real-time tracking data
  const [currentGpsPosition, setCurrentGpsPosition] = useState<{lat: number, lng: number} | null>(null);
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(false);
  const [gpsTrackingInterval, setGpsTrackingInterval] = useState<number | null>(null);
  const [gpsTrackHistory, setGpsTrackHistory] = useState<Array<{lat: number, lng: number, timestamp: number}>>([]);
  const [trackingFrequency, setTrackingFrequency] = useState<number>(5); // seconds between position updates
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [driveJournalIntegration, setDriveJournalIntegration] = useState(true);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetrySnapshot[]>([]);
  
  // Vehicle performance settings
  const [tirePressureAdjustment, setTirePressureAdjustment] = useState(0); // in PSI
  const [torqueAdjustment, setTorqueAdjustment] = useState(0); // in ft-lb
  const [drivingMode, setDrivingMode] = useState("Sport");
  const [showCustomTireSetupForm, setShowCustomTireSetupForm] = useState(false);
  const [customTireSetup, setCustomTireSetup] = useState({
    name: "",
    compound: "Custom",
    treadPattern: "Custom",
    heatingCycle: 5,
    pressureVariance: 1.0,
    optimalTemp: 180
  });
  const [showCustomDrivingModeForm, setShowCustomDrivingModeForm] = useState(false);
  const [customDrivingMode, setCustomDrivingMode] = useState("");
  
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
    },
    {
      name: "Eco Cruiser",
      style: "Economy",
      corneringAggressiveness: 2,
      brakingIntensity: 3,
      accelerationProfile: 2,
      shiftPattern: "Early",
      fuelConsumptionFactor: 0.8
    },
    {
      name: "Sunset Cruise",
      style: "Casual",
      corneringAggressiveness: 4,
      brakingIntensity: 3,
      accelerationProfile: 4,
      shiftPattern: "Early",
      fuelConsumptionFactor: 1.1
    },
    {
      name: "Mountain Pass",
      style: "Spirited",
      corneringAggressiveness: 8,
      brakingIntensity: 9,
      accelerationProfile: 7,
      shiftPattern: "Optimal",
      fuelConsumptionFactor: 1.4
    },
    {
      name: "Highway Tour",
      style: "Casual",
      corneringAggressiveness: 3,
      brakingIntensity: 2,
      accelerationProfile: 4,
      shiftPattern: "Optimal",
      fuelConsumptionFactor: 0.9
    },
    {
      name: "Tail of the Dragon",
      style: "Performance",
      corneringAggressiveness: 9,
      brakingIntensity: 10,
      accelerationProfile: 9,
      shiftPattern: "Late",
      fuelConsumptionFactor: 1.7
    },
    {
      name: "Nürburgring",
      style: "Track",
      corneringAggressiveness: 10,
      brakingIntensity: 10,
      accelerationProfile: 10,
      shiftPattern: "Late",
      fuelConsumptionFactor: 2.0
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
  

  
  // Route analysis data
  const [routeAnalysisEnabled, setRouteAnalysisEnabled] = useState(false);
  const [routeSegments, setRouteSegments] = useState<RouteCondition[]>([]);
  
  // Removed Performance heatmap data section
  const [isCollectingData, setIsCollectingData] = useState(false);
  
  // Removed heatmap-related functions and effects
  
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
    { id: "roadside_assistance", name: "Roadside Assistance Coverage", selected: true },
    { id: "auto_repair_elite", name: "Elite Auto Repair Centers", selected: true },
    { id: "dealer_service", name: "Official Dealer Service Centers", selected: true },
    { id: "specialist_mechanics", name: "Specialist Mechanics", selected: true },
    { id: "exotic_service", name: "Exotic Car Service", selected: true },
    { id: "car_meets", name: "Car Meet Locations", selected: false },
    { id: "ev_chargers", name: "High-Speed EV Chargers", selected: false },
    { id: "scenic_overlooks", name: "Scenic Overlooks", selected: true },
    { id: "photo_spots", name: "Car Photography Spots", selected: true },
    { id: "motorsport_venues", name: "Motorsport Venues", selected: false },
    { id: "car_museums", name: "Automotive Museums", selected: false },
    { id: "car_detailing", name: "Detailing Services", selected: false },
    { id: "rv_services", name: "RV Services", selected: false },
    { id: "supercar_spotting", name: "Supercar Spotting Locations", selected: false },
    { id: "instagram_worthy", name: "Instagram-Worthy Photo Spots", selected: true },
    { id: "group_drives", name: "Popular Group Drive Meetups", selected: false },
    { id: "sunset_drives", name: "Sunset/Sunrise Driving Routes", selected: true },
    { id: "tunnels", name: "Echo Tunnels for Sound", selected: false },
    { id: "track_days", name: "Track Day Events", selected: false },
    { id: "car_shows", name: "Car Shows & Events", selected: false },
    { id: "exotic_dealers", name: "Exotic Car Dealerships", selected: false },
    { id: "mountain_roads", name: "Epic Mountain Roads", selected: true },
    { id: "canyon_roads", name: "Canyon Drives", selected: false },
    { id: "coastal_routes", name: "Scenic Coastal Routes", selected: true },
    { id: "enthusiast_cafes", name: "Car Enthusiast Cafes", selected: false },
    { id: "custom", name: "Custom Points of Interest", selected: false }
  ]);
  
  // Roadside assistance and telemetry support
  const [roadsideAssistanceOptions, setRoadsideAssistanceOptions] = useState({
    telemetryEnabled: true,
    realTimeMonitoring: true,
    diagnosticSharingWithService: true,
    priorityTowing: true,
    luxuryReplacementVehicle: true,
    customRoadsidePreferences: ""
  });
  
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
      aerodynamicProfile: "Medium Downforce",
      engineType: "Twin-Turbo I6",
      drivetrainType: "RWD",
      suspensionType: "Adaptive M",
      transmissionType: "8-Speed Auto",
      fuelType: "Premium",
      brakingDistance: 108,
      corneringGForce: 1.03
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
        aerodynamicProfile: newVehicle.aerodynamicProfile,
        engineType: newVehicle.engineType,
        drivetrainType: newVehicle.drivetrainType,
        suspensionType: newVehicle.suspensionType,
        transmissionType: newVehicle.transmissionType,
        fuelType: newVehicle.fuelType,
        brakingDistance: newVehicle.brakingDistance,
        corneringGForce: newVehicle.corneringGForce
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
      aerodynamicProfile: "Balanced",
      engineType: "V6",
      drivetrainType: "RWD",
      suspensionType: "Standard",
      transmissionType: "Automatic",
      fuelType: "Premium",
      brakingDistance: 110,
      corneringGForce: 0.95
    });
    setShowAddVehicleForm(false);
    
    // Select the newly added vehicle
    setTimeout(() => {
      setSelectedVehicle(newVehicle.name);
    }, 100);
  };

  // Multi-city route stop handling
  const handleStopLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStopLocation(e.target.value);
  };
  
  const handleStopDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStopDate(e.target.value);
  };
  
  const handleStayDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStayDuration(parseInt(e.target.value) || 0);
  };
  
  const handleStopNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStopNotes(e.target.value);
  };
  
  const handleOvernightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOvernight(e.target.checked);
  };
  
  const addRouteStop = () => {
    if (newStopLocation.trim() !== "") {
      const newStop: RouteStop = {
        location: newStopLocation,
        arrivalDate: newStopDate,
        departureDate: newStopDate, // Default to same day, user can edit
        stayDuration: stayDuration,
        notes: stopNotes,
        isOvernight: isOvernight
      };
      
      setRouteStops([...routeStops, newStop]);
      
      // Also update legacy waypoints for backward compatibility
      setWaypoints([...waypoints, newStopLocation]);
      
      // Reset input fields
      setNewStopLocation("");
      setStopNotes("");
      setStayDuration(0);
      setIsOvernight(false);
    }
  };
  
  const removeRouteStop = (index: number) => {
    setRouteStops(routeStops.filter((_, i) => i !== index));
    setWaypoints(waypoints.filter((_, i) => i !== index)); // Keep in sync
  };
  
  // Legacy support
  const handleWaypointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStopLocation(e.target.value);
  };

  const addWaypoint = () => {
    addRouteStop();
  };

  const removeWaypoint = (index: number) => {
    removeRouteStop(index);
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

  // Calculate optimal tire temperature range based on selected tire setup and vehicle
  const calculateOptimalTempRange = () => {
    const setup = tireSetups[selectedTireSetup];
    const vehicleData = vehicleSpecs[selectedVehicle];
    
    if (setup && vehicleData) {
      const baseTemp = setup.optimalTemp;
      return `${baseTemp - 10}-${baseTemp + 10}`;
    } else if (vehicleData) {
      return `${vehicleData.optimumTireTemp - 10}-${vehicleData.optimumTireTemp + 10}`;
    }
    
    return "175-195"; // Default range
  };
  
  // Calculate tire grip percentage for visualization
  const calculateTireGripPercentage = () => {
    if (!weatherData) return 50; // Default midpoint
    
    const currentTemp = weatherData.surfaceTemp;
    let optimumTemp = 185; // Default
    
    // Get optimal temp from tire setup or vehicle
    if (selectedTireSetup && tireSetups[selectedTireSetup]) {
      optimumTemp = tireSetups[selectedTireSetup].optimalTemp;
    } else if (selectedVehicle && vehicleSpecs[selectedVehicle]) {
      optimumTemp = vehicleSpecs[selectedVehicle].optimumTireTemp;
    }
    
    // Calculate how close we are to optimal temperature
    const tempDiff = Math.abs(currentTemp - optimumTemp);
    const maxDiff = 60; // Maximum difference to consider
    
    if (tempDiff < 10) {
      return 85; // Near optimal
    } else if (tempDiff < 20) {
      return 70; // Good
    } else if (tempDiff < 35) {
      return 50; // Moderate
    } else {
      return 30; // Poor
    }
  };
  
  // Get color class for tire grip visualization based on grip level
  const getTireGripColorClass = () => {
    const percentage = calculateTireGripPercentage();
    
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 65) return "bg-green-400";
    if (percentage >= 50) return "bg-yellow-400";
    if (percentage >= 35) return "bg-yellow-500";
    return "bg-red-500";
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
    console.log("Has Passengers:", hasPassengers);
    console.log("Passengers:", hasPassengers ? passengers.filter(p => p.trim()) : []);
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
    
    if (tempDiff < 10) {
      return {
        level: 'Optimal',
        percentage: 100
      };
    }
    if (tempDiff < 20) {
      return {
        level: 'Good',
        percentage: 75
      };
    }
    if (tempDiff < 40) {
      return {
        level: 'Moderate',
        percentage: 50
      };
    }
    return {
      level: 'Poor',
      percentage: 25
    };
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

  // Handle event URL pasting and information extraction
  const handleEventUrlFetch = async () => {
    if (!eventRallyUrl) return;
    
    setEventRallyUrlLoading(true);
    
    try {
      // In a real implementation, we would:
      // 1. Call a server-side function to fetch and parse the URL
      // 2. Extract event details (name, date, time, location, description)
      // 3. Automatically fill in the form fields
      
      // For demo purposes, we'll simulate success with a timeout
      setTimeout(() => {
        // Extract data from URL - would be done via API in production
        const urlObj = new URL(eventRallyUrl);
        const domain = urlObj.hostname;
        
        // Set event location to end location if it's empty
        if (!endLocation) {
          setEndLocation("Event Location (would be extracted from URL)");
        }
        
        // Sample data based on domain - in production this would come from API
        if (domain.includes("motorsport")) {
          setEventRallyName("Motorsport Event (extracted from URL)");
          setEventRallyOrganizer("Motorsport Organization");
          setEventRallyDate("2025-05-15");
          setEventRallyTime("09:00");
          setEventRallyDescription("Details extracted from the event page");
          setEventRallyLocation("Circuit Location");
        } else if (domain.includes("carsandcoffee")) {
          setEventRallyName("Cars & Coffee Event");
          setEventRallyOrganizer("Local Cars & Coffee Chapter");
          setEventRallyDate("2025-05-20");
          setEventRallyTime("08:00");
          setEventRallyDescription("Details extracted from the event page");
          setEventRallyLocation("Meet-up Location");
        } else {
          setEventRallyName("Event from " + domain);
          setEventRallyDate("2025-05-25");
          setEventRallyTime("10:00");
          setEventRallyDescription("Auto event details would be extracted from URL");
        }
        
        setEventRallyUrlLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error processing event URL:", error);
      setEventRallyUrlLoading(false);
      alert("Could not process the event URL. Please enter event details manually.");
    }
  };
  
  // Process the complete route plan submission
  const handleRoutePlanSubmit = () => {
    if (!startLocation || !endLocation) {
      alert("Please enter both start and end locations");
      return;
    }
    
    // Prepare route data summary for Drive Journal auto-logging
    const routeSummary = {
      date: new Date().toISOString(),
      startLocation,
      endLocation,
      waypoints,
      vehicle: selectedVehicle,
      routeCustomizations,
      navigationFeatures,
      weatherConditions: weatherData,
      performanceSettings: {
        tirePressureAdjustment,
        torqueAdjustment,
        drivingMode,
        vehicleSpecs: selectedVehicle ? vehicleSpecs[selectedVehicle] : null,
        tireSetup: selectedTireSetup ? tireSetups[selectedTireSetup] : null,
        drivingProfile: selectedDrivingProfile ? drivingProfiles.find(p => p.name === selectedDrivingProfile) : null,
        curvatureMetrics: navigationFeatures.curvyRoads ? {
          intensity: navigationFeatures.curveIntensity,
          trnRange: getIntensityTRNRange(navigationFeatures.curveIntensity)
        } : null
      },
      pointsOfInterest: {
        events: selectedEvents,
        culturalSpots: selectedSpots
      }
    };
    
    // Store the route data in local storage temporarily
    localStorage.setItem('pendingDriveJournal', JSON.stringify(routeSummary));
    
    // Launch appropriate navigation app with route data
    launchNavigationApp();
    
    // Show the route summary modal
    setShowSummaryModal(true);
  };
  
  // Helper function to get TRN range description
  const getIntensityTRNRange = (intensity: number): string => {
    switch(intensity) {
      case 1: return "0-2 TRN/km (Minimal)";
      case 2: return "2-4 TRN/km (Gentle)";
      case 3: return "4-6 TRN/km (Moderate)"; 
      case 4: return "6-8 TRN/km (Spirited)";
      case 5: 
      default: return "8-12+ TRN/km (Technical)";
    }
  };
  
  // Launch the selected navigation app
  const launchNavigationApp = () => {
    let navigationUrl = '';
    
    // Build the appropriate URL for the selected navigation app
    switch(preferredNavApp) {
      case "Google Maps":
        navigationUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(endLocation)}`;
        
        // Add waypoints if any
        if (waypoints.length > 0) {
          navigationUrl += `&waypoints=${encodeURIComponent(waypoints.join('|'))}`;
        }
        
        // Add avoid tolls parameter if selected
        if (navigationFeatures.avoidTolls) {
          navigationUrl += '&avoid=tolls';
        }
        
        // Add avoid highways parameter if selected
        if (navigationFeatures.avoidHighways) {
          navigationUrl += navigationUrl.includes('avoid=') 
            ? ',highways' 
            : '&avoid=highways';
        }
        break;
        
      case "Waze":
        navigationUrl = `https://waze.com/ul?navigate=yes&q=${encodeURIComponent(endLocation)}`;
        break;
        
      case "Apple Maps":
        // Apple Maps web links have limited functionality, typically used on iOS devices
        navigationUrl = `maps://?saddr=${encodeURIComponent(startLocation)}&daddr=${encodeURIComponent(endLocation)}`;
        alert("Apple Maps deep linking works best on iOS devices. Opening a compatible link format.");
        break;
    }
    
    // Open the navigation URL in a new tab
    if (navigationUrl) {
      window.open(navigationUrl, '_blank');
    }
  };
  
  // Enhanced multi-stop navigation app integration
  const launchNavigationAppWithMultiStops = () => {
    let navigationUrl = '';
    
    // Build the appropriate URL for the selected navigation app with all route stops
    switch(preferredNavApp) {
      case "Google Maps":
        // Google Maps supports multiple waypoints
        // Format: https://www.google.com/maps/dir/?api=1&origin=START&destination=END&waypoints=STOP1|STOP2|STOP3
        navigationUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(endLocation)}`;
        
        // Add all route stops as waypoints
        if (routeStops.length > 0) {
          const waypointList = routeStops.map(stop => encodeURIComponent(stop.location)).join('|');
          navigationUrl += `&waypoints=${waypointList}`;
        }
        
        // Add routing preferences
        const avoidParams = [];
        if (navigationFeatures.avoidTolls) avoidParams.push('tolls');
        if (navigationFeatures.avoidHighways) avoidParams.push('highways');
        if (navigationFeatures.avoidUnpaved) avoidParams.push('unpaved');
        
        if (avoidParams.length > 0) {
          navigationUrl += `&avoid=${avoidParams.join(',')}`;
        }
        
        // Add travel mode
        navigationUrl += `&travelmode=driving`;
        
        break;
        
      case "Waze":
        // Waze supports multiple stops using the "to" parameter
        // Format: https://waze.com/ul?navigate=yes&to=STOP1&to=STOP2&to=FINAL_DESTINATION
        
        // Start with the initial location
        navigationUrl = `https://waze.com/ul?navigate=yes`;
        
        // Add all stops in sequence
        if (routeStops.length > 0) {
          routeStops.forEach(stop => {
            navigationUrl += `&to=${encodeURIComponent(stop.location)}`;
          });
        }
        
        // Add final destination
        navigationUrl += `&to=${encodeURIComponent(endLocation)}`;
        
        // Add avoid tolls if selected
        if (navigationFeatures.avoidTolls) {
          navigationUrl += '&avoid=tolls';
        }
        
        break;
        
      case "Apple Maps":
        // Apple Maps supports multiple destinations with the daddr parameter, but it's limited
        // Format: maps://?saddr=START&daddr=STOP1&daddr=STOP2&daddr=FINAL
        navigationUrl = `maps://?saddr=${encodeURIComponent(startLocation)}`;
        
        // Add intermediate stops
        if (routeStops.length > 0) {
          routeStops.forEach(stop => {
            navigationUrl += `&daddr=${encodeURIComponent(stop.location)}`;
          });
        }
        
        // Add final destination
        navigationUrl += `&daddr=${encodeURIComponent(endLocation)}`;
        
        // Alert user about iOS compatibility
        alert("Apple Maps deep linking works best on iOS devices. Opening a compatible link format with all stops included.");
        break;
    }
    
    // Open the navigation URL in a new tab
    if (navigationUrl) {
      console.log("Launching navigation with URL:", navigationUrl);
      window.open(navigationUrl, '_blank');
    }
  };
  
  // State for summary modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  // Auto-log drive to Journal
  const handleAutoLogDrive = () => {
    // In a real app, we would:
    // 1. Send the data to the backend API to store in the database
    // 2. Associate the drive with the user's account
    // 3. Create a new entry in the Drive Journal
    
    // For this prototype, we'll simulate the success
    alert("Drive successfully logged to your Drive Journal! Access it from the Drive Journal section to add photos and notes from your experience.");
    
    // Hide the modal
    setShowSummaryModal(false);
  };
  
  // GPS Tracking Functions
  const startGpsTracking = () => {
    if (gpsTrackingEnabled) return;
    
    // Validate required inputs before starting
    if (!startLocation || !endLocation) {
      alert("Please enter both start and end locations before starting GPS tracking");
      return;
    }
    
    if (!selectedVehicle) {
      alert("Please select a vehicle before starting GPS tracking");
      return;
    }
    
    // Pre-package all route data to be sent to Drive Journal
    const routeSummary = {
      id: `route-${Date.now()}`,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      startLocation,
      endLocation,
      waypoints: routeStops.map(stop => stop.location),
      stops: routeStops,
      vehicle: selectedVehicle,
      routeCustomizations,
      navigationApp: preferredNavApp,
      navigationFeatures,
      weatherConditions: weatherData,
      carClub: isGroupDrive ? {
        name: carClubName,
        contactInfo: carClubContactInfo
      } : null,
      eventRally: isEventRally ? {
        name: eventRallyName,
        organizer: eventRallyOrganizer,
        url: eventRallyUrl,
        date: eventRallyDate,
        time: eventRallyTime,
        description: eventRallyDescription,
        location: eventRallyLocation || endLocation,
        hasMap: !!eventMapFile
      } : null,
      companions: hasFriendsJoining ? drivingCompanions : [],
      performanceSettings: {
        tirePressureAdjustment,
        torqueAdjustment,
        drivingMode,
        tireSetup: selectedTireSetup ? tireSetups[selectedTireSetup] : null,
        drivingProfile: selectedDrivingProfile ? drivingProfiles.find(p => p.name === selectedDrivingProfile) : null,
      },
      // Media collection
      media: {
        photos: photoPreviewUrls.map((url, index) => ({
          url,
          name: carPhotos[index]?.name || `Photo ${index + 1}`,
          type: carPhotos[index]?.type || 'image/jpeg',
          size: carPhotos[index]?.size || 0,
          lastModified: carPhotos[index]?.lastModified || Date.now(),
          isPreDrive: true // Flag to indicate this was added before the drive
        })),
        videos: videoPreviewUrls.map((url, index) => ({
          url,
          name: carVideos[index]?.name || `Video ${index + 1}`,
          type: carVideos[index]?.type || 'video/mp4',
          size: carVideos[index]?.size || 0,
          lastModified: carVideos[index]?.lastModified || Date.now(),
          isPreDrive: true // Flag to indicate this was added before the drive
        })),
        voiceNotes: audioUrl ? [{
          url: audioUrl,
          duration: recordingTime,
          recordedAt: Date.now(),
          isPreDrive: true // Flag to indicate this was added before the drive
        }] : []
      },
      telemetryHistory: [],
      trackHistory: [],
      status: 'active',
      estimatedDistance: 0, // To be calculated in a real implementation
      estimatedDuration: 0, // To be calculated in a real implementation
    };
    
    // Store the route data in localStorage as a pending drive journal entry
    localStorage.setItem('pendingDriveJournal', JSON.stringify(routeSummary));
    console.log("Route data saved as pending Drive Journal entry:", routeSummary);
    
    // CRITICAL - Launch the navigation app first with the full route
    launchNavigationAppWithMultiStops();
    
    // Alert the user that the route has been started and sent to navigation
    setTimeout(() => {
      alert(`Route started and sent to ${preferredNavApp}.\n\nDrive data will be automatically tracked and saved to your Drive Journal when complete.`);
    }, 500);
    
    // Start a new tracking session
    setGpsTrackHistory([]);
    setTelemetryHistory([]);
    setGpsTrackingEnabled(true);
    
    // Generate a unique ID for this route
    const newRouteId = routeSummary.id;
    setActiveRouteId(newRouteId);
    
    // Set up position tracking
    if (navigator.geolocation) {
      const intervalId = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const timestamp = Date.now();
            
            // Update current position
            setCurrentGpsPosition({ lat: latitude, lng: longitude });
            
            // Add to track history
            const newTrackPoint = { lat: latitude, lng: longitude, timestamp };
            setGpsTrackHistory(prev => [...prev, newTrackPoint]);
            
            // Generate telemetry data with enhanced fields for F1-grade telemetry
            const telemetryData: TelemetrySnapshot = {
              timestamp,
              position: { lat: latitude, lng: longitude },
              speed: position.coords.speed ? position.coords.speed * 2.237 : Math.random() * 60, // convert m/s to mph
              rpm: Math.round(Math.random() * 3000) + 1000,
              acceleration: Math.random() * 0.5,
              lateralG: Math.random() * 0.4,
              throttlePosition: Math.random() * 100,
              brakePosition: Math.random() * 20,
              steeringAngle: Math.random() * 45 - 22.5,
              elevation: Math.random() * 100 + 100,
              gradient: Math.random() * 5,
              curvature: Math.random() * 500 + 100,
              roadSurfaceTemp: Math.random() * 20 + 70,
              tirePressureFront: 32 + Math.random() * 4 - 2,
              tirePressureRear: 30 + Math.random() * 4 - 2,
              tireTempFront: 150 + Math.random() * 50,
              tireTempRear: 160 + Math.random() * 50,
              wheelSlip: Math.random() * 3,
              engineTemp: 190 + Math.random() * 10,
              oilTemp: 210 + Math.random() * 15,
              oilPressure: 40 + Math.random() * 10,
              fuelConsumption: 15 + Math.random() * 10,
              rangeToBoundary: Math.random() * 5,
              gForceVector: { 
                x: Math.random() * 0.5 - 0.25, 
                y: Math.random() * 0.5 - 0.25, 
                z: 1 
              },
              weatherCondition: weatherData?.current?.weather?.[0]?.main || "Clear",
              // Additional F1-grade telemetry fields
              powerAdjustment: Math.round(Math.random() * 10) - 5,
              torqueAdjustment: Math.round(Math.random() * 20) - 10,
              tireGripLevel: ["Optimal", "Good", "Moderate", "Poor"][Math.floor(Math.random() * 4)] as "Optimal" | "Good" | "Moderate" | "Poor",
              brakingEfficiency: Math.round(85 + Math.random() * 15),
              actualPower: vehicleSpecs[selectedVehicle]?.powerOutput || 400,
              actualTorque: vehicleSpecs[selectedVehicle]?.torqueSetting || 380,
              coolingEfficiency: ["Excellent", "Good", "Reduced", "Poor"][Math.floor(Math.random() * 4)]
            };
            
            // Add to telemetry history
            setTelemetryHistory(prev => [...prev, telemetryData]);
            setTelemetryData(telemetryData);
            
            // Update stats
            updateTelemetryStats(telemetryData);
            
            // Update the pending drive journal entry in localStorage with latest telemetry
            try {
              const pendingEntry = JSON.parse(localStorage.getItem('pendingDriveJournal') || '{}');
              
              // Only store selected telemetry snapshots to avoid localStorage limits (every 5th reading)
              if (telemetryHistory.length % 5 === 0) {
                const telHistory = [...(pendingEntry.telemetryHistory || []), telemetryData];
                pendingEntry.telemetryHistory = telHistory.slice(-50); // Keep only last 50 readings
              }
              
              // Store track history points (every 10th point to save space)
              if (gpsTrackHistory.length % 10 === 0) {
                const trackHistory = [...(pendingEntry.trackHistory || []), newTrackPoint];
                pendingEntry.trackHistory = trackHistory.slice(-100); // Keep only last 100 points
              }
              
              // Update distance and duration
              const trackHistory = [...gpsTrackHistory, newTrackPoint];
              pendingEntry.actualDistance = calculateTotalDistance(trackHistory);
              if (trackHistory.length > 1) {
                pendingEntry.actualDuration = (timestamp - trackHistory[0].timestamp) / 1000 / 60; // minutes
              }
              
              localStorage.setItem('pendingDriveJournal', JSON.stringify(pendingEntry));
            } catch (error) {
              console.error("Error updating pending drive journal:", error);
            }
            
            // In a real implementation, we would check if we've reached the destination
            // using navigation API integration (would require deeper integration with mapping APIs)
          },
          (error) => {
            console.error("Error getting position:", error);
          },
          { enableHighAccuracy: true }
        );
      }, trackingFrequency * 1000);
      
      setGpsTrackingInterval(intervalId);
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };
  
  // State for post-drive checklist
  const [showPostDriveChecklist, setShowPostDriveChecklist] = useState(false);
  const [postDriveNotes, setPostDriveNotes] = useState("");
  const [postDriveRating, setPostDriveRating] = useState(5);
  const [checkedPostDriveItems, setCheckedPostDriveItems] = useState({
    vehicleCondition: false,
    tireCondition: false,
    fluidsChecked: false,
    vehicleCleaned: false,
    fuelLevel: false
  });

  const stopGpsTracking = () => {
    if (!gpsTrackingEnabled) return;
    
    // Clear the tracking interval
    if (gpsTrackingInterval) {
      window.clearInterval(gpsTrackingInterval);
      setGpsTrackingInterval(null);
    }
    
    setGpsTrackingEnabled(false);
    
    // Update the pending drive journal entry with completion data
    try {
      const pendingEntry = JSON.parse(localStorage.getItem('pendingDriveJournal') || '{}');
      pendingEntry.status = 'completed';
      pendingEntry.endTime = new Date().toISOString();
      pendingEntry.actualDistance = calculateTotalDistance(gpsTrackHistory);
      pendingEntry.actualDuration = gpsTrackHistory.length > 1 ? 
        (gpsTrackHistory[gpsTrackHistory.length - 1].timestamp - gpsTrackHistory[0].timestamp) / 1000 / 60 : 0;
      pendingEntry.telemetryStats = telemetryStats;
      
      // Add navigation app-specific telemetry that would be imported in a real implementation
      // This simulates the data that would be pulled from Waze, Google Maps, or Apple Maps API
      const navigationAppData = {
        totalTurns: Math.round(Math.random() * 20) + 5,
        rightTurns: Math.round(Math.random() * 10) + 2,
        leftTurns: Math.round(Math.random() * 10) + 2,
        uTurns: Math.floor(Math.random() * 2),
        trafficConditions: ["Light", "Moderate", "Heavy"][Math.floor(Math.random() * 3)],
        roadTypes: {
          highway: Math.round(Math.random() * 70),
          arterial: Math.round(Math.random() * 20),
          residential: Math.round(Math.random() * 10)
        },
        averageSpeed: Math.round(Math.random() * 30) + 30,
        maxSpeed: Math.round(Math.random() * 40) + 60,
        stopsCount: Math.round(Math.random() * 10),
        trafficLightsCount: Math.round(Math.random() * 15),
        elevationGain: Math.round(Math.random() * 500),
        elevationLoss: Math.round(Math.random() * 500),
        fuelConsumption: Math.round(Math.random() * 5) + 2 // gallons
      };
      
      pendingEntry.navigationAppData = navigationAppData;
      localStorage.setItem('pendingDriveJournal', JSON.stringify(pendingEntry));
      
      // In a real implementation, we would send this data to the server to be stored in the database
      console.log("Route completed and ready for Drive Journal integration:", pendingEntry);
    } catch (error) {
      console.error("Error updating completed drive journal entry:", error);
    }
    
    // Show the post-drive checklist
    setShowPostDriveChecklist(true);
    
    // Show route summary
    setTimeout(() => {
      alert(`Route completed! Distance: ${calculateTotalDistance(gpsTrackHistory).toFixed(1)} miles.\n\nRoute telemetry has been saved to your Drive Journal.\n\nPlease complete the post-drive checklist for safety.`);
    }, 500);
  };
  
  // Function to handle post-drive checklist submission
  const handlePostDriveChecklistSubmit = () => {
    // Create the post-drive checklist data
    const postDriveChecklistData = {
      id: `post-drive-${Date.now()}`,
      date: new Date().toISOString(),
      route: {
        startLocation,
        endLocation,
        stops: routeStops,
        distance: calculateTotalDistance(gpsTrackHistory),
        duration: gpsTrackHistory.length > 1 ? 
          (gpsTrackHistory[gpsTrackHistory.length - 1].timestamp - gpsTrackHistory[0].timestamp) / 1000 / 60 : 0
      },
      vehicle: selectedVehicle,
      drivePurpose,
      checkedItems: Object.entries(checkedPostDriveItems)
        .filter(([_, isChecked]) => isChecked)
        .map(([item]) => item),
      rating: postDriveRating,
      notes: postDriveNotes,
      telemetryStats
    };
    
    console.log("Post-drive checklist saved:", postDriveChecklistData);
    
    // If drive journal integration is enabled, save the tracked data
    if (driveJournalIntegration && gpsTrackHistory.length > 0) {
      saveToJournal(postDriveChecklistData);
    }
    
    // Hide the post-drive checklist
    setShowPostDriveChecklist(false);
    
    // Reset the form for next use
    setPostDriveNotes("");
    setPostDriveRating(5);
    setCheckedPostDriveItems({
      vehicleCondition: false,
      tireCondition: false,
      fluidsChecked: false,
      vehicleCleaned: false,
      fuelLevel: false
    });
    
    alert("Post-drive checklist completed and saved to your Drive Journal!");
  };
  
  const calculateTotalDistance = (trackHistory: Array<{lat: number, lng: number, timestamp: number}>): number => {
    if (trackHistory.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < trackHistory.length; i++) {
      const prev = trackHistory[i-1];
      const current = trackHistory[i];
      totalDistance += haversineDistance(prev.lat, prev.lng, current.lat, current.lng);
    }
    
    return totalDistance;
  };
  
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Earth's radius in miles
    const R = 3958.8;
    
    // Convert degrees to radians
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    // Haversine formula
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };
  
  const updateTelemetryStats = (newData: TelemetrySnapshot) => {
    setTelemetryStats(prev => {
      // Create a shallow copy
      const newStats = { ...prev };
      
      // Update max values
      if (newData.speed > newStats.maxSpeed) newStats.maxSpeed = newData.speed;
      if (newData.rpm && newData.rpm > newStats.maxRpm) newStats.maxRpm = newData.rpm;
      if (newData.acceleration && newData.acceleration > newStats.maxAcceleration) newStats.maxAcceleration = newData.acceleration;
      if (newData.lateralG && newData.lateralG > newStats.maxLateralG) newStats.maxLateralG = newData.lateralG;
      
      // Update averages and totals based on history
      if (telemetryHistory.length > 0) {
        // Calculate average speed
        const totalSpeed = telemetryHistory.reduce((sum, data) => sum + data.speed, 0) + newData.speed;
        newStats.avgSpeed = totalSpeed / (telemetryHistory.length + 1);
        
        // Calculate total distance (this is simpler because we already have the function)
        newStats.totalDistance = calculateTotalDistance(gpsTrackHistory);
        
        // Estimate elevation change
        const maxElevation = Math.max(...telemetryHistory.map(data => data.elevation || 0), newData.elevation || 0);
        const minElevation = Math.min(...telemetryHistory.map(data => data.elevation || 0), newData.elevation || 0);
        newStats.elevationChange = maxElevation - minElevation;
        
        // Calculate curvy road percentage
        const curvySegments = telemetryHistory.filter(data => data.curvature && data.curvature < 300).length;
        newStats.curvyRoadPercentage = (curvySegments / telemetryHistory.length) * 100;
        newStats.straightRoadPercentage = 100 - newStats.curvyRoadPercentage;
        
        // Calculate average fuel efficiency
        const validEfficiencyData = telemetryHistory.filter(data => !!data.fuelConsumption);
        if (validEfficiencyData.length > 0) {
          const totalEfficiency = validEfficiencyData.reduce((sum, data) => sum + (data.fuelConsumption || 0), 0);
          newStats.fuelEfficiency = totalEfficiency / validEfficiencyData.length;
        }
        
        // Calculate driving score (1-100)
        // This is a synthetic metric based on multiple factors
        const smoothAcceleration = telemetryHistory.every(data => (data.acceleration || 0) < 0.7);
        const smoothBraking = telemetryHistory.every(data => (data.brakePosition || 0) < 80);
        const steadySpeed = calculateSpeedVariance() < 15;
        const consistentLine = telemetryHistory.every(data => (data.steeringAngle || 0) < 30);
        
        let score = 75; // Base score
        if (smoothAcceleration) score += 5;
        if (smoothBraking) score += 5;
        if (steadySpeed) score += 5;
        if (consistentLine) score += 5;
        if (newStats.fuelEfficiency > 20) score += 5;
        
        newStats.drivingScore = score;
      }
      
      return newStats;
    });
  };
  
  const calculateSpeedVariance = (): number => {
    if (telemetryHistory.length < 2) return 0;
    
    const speeds = telemetryHistory.map(data => data.speed);
    const avg = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    const squaredDifferences = speeds.map(speed => Math.pow(speed - avg, 2));
    const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / speeds.length;
    
    return Math.sqrt(variance);
  };
  
  // Event map file upload handler
  const handleEventMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setEventMapFile(file);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setEventMapUrl(objectUrl);
    }
  };
  
  // Drive companions handlers
  const addCompanion = () => {
    if (!newCompanionName || !newCompanionVehicle || drivingCompanions.length >= 50) return;
    
    setDrivingCompanions([
      ...drivingCompanions,
      {
        name: newCompanionName,
        vehicle: newCompanionVehicle,
        vehicleDetails: newCompanionVehicleDetails || undefined
      }
    ]);
    
    // Reset form fields
    setNewCompanionName('');
    setNewCompanionVehicle('');
    setNewCompanionVehicleDetails('');
  };
  
  const removeCompanion = (index: number) => {
    const updatedCompanions = [...drivingCompanions];
    updatedCompanions.splice(index, 1);
    setDrivingCompanions(updatedCompanions);
  };
  
  const clearAllCompanions = () => {
    if (window.confirm('Are you sure you want to remove all companions?')) {
      setDrivingCompanions([]);
    }
  };
  
  const saveToJournal = (postDriveData?: any) => {
    try {
      // Get the pending drive journal entry that contains all the data from the start of the route
      const pendingEntry = JSON.parse(localStorage.getItem('pendingDriveJournal') || '{}');
      
      // Add the post-drive checklist information to the entry
      if (postDriveData) {
        pendingEntry.postDriveChecklist = postDriveData;
        pendingEntry.finalNotes = postDriveNotes;
        pendingEntry.userRating = postDriveRating;
        pendingEntry.checkedMaintenanceItems = Object.entries(checkedPostDriveItems)
          .filter(([_, isChecked]) => isChecked)
          .map(([item]) => item);
      }
      
      // Mark the entry as fully completed with post-drive data
      pendingEntry.status = 'complete_with_checklist';
      pendingEntry.completionTime = new Date().toISOString();
      
      // In a real implementation, this data would be sent to the server
      console.log("Final Drive Journal Entry with Complete Data:", pendingEntry);
      
      // Store this back to localStorage (in a real app we'd send to a database)
      localStorage.setItem('completedDriveJournal', JSON.stringify(pendingEntry));
      localStorage.removeItem('pendingDriveJournal'); // Clear the pending entry
      
      // Prepare notification messages based on the data
      let notificationMessage = "";
      const distance = pendingEntry.actualDistance ? 
        `${pendingEntry.actualDistance.toFixed(1)} miles` : 
        calculateTotalDistance(gpsTrackHistory).toFixed(1) + " miles";
      
      const duration = pendingEntry.actualDuration ? 
        `${Math.round(pendingEntry.actualDuration)} minutes` :
        (gpsTrackHistory.length > 1 ? 
          Math.round((gpsTrackHistory[gpsTrackHistory.length - 1].timestamp - gpsTrackHistory[0].timestamp) / 1000 / 60) : 0) + " minutes";
      
      // Create enriched message based on available telemetry
      if (pendingEntry.navigationAppData) {
        const navData = pendingEntry.navigationAppData;
        
        notificationMessage = `Drive completed and saved to your Drive Journal!\n\n` +
          `• Distance: ${distance}\n` +
          `• Duration: ${duration}\n` +
          `• Avg Speed: ${navData.averageSpeed} mph\n` +
          `• Max Speed: ${navData.maxSpeed} mph\n` +
          `• Turns: ${navData.totalTurns} (${navData.rightTurns} right, ${navData.leftTurns} left)\n` +
          `• Traffic: ${navData.trafficConditions}\n` +
          `• Stops: ${navData.stopsCount}\n` +
          `• Elevation Change: ${navData.elevationGain + navData.elevationLoss} ft\n` +
          `\nAll telemetry data has been added to your Drive Journal.`;
      } else {
        notificationMessage = `Drive completed and saved to your Drive Journal!\n\n` +
          `• Distance: ${distance}\n` +
          `• Duration: ${duration}\n` +
          `• Max Speed: ${telemetryStats.maxSpeed.toFixed(1)} mph\n` +
          `• Driving Score: ${telemetryStats.drivingScore}/100\n\n` +
          `All telemetry data has been added to your Drive Journal.`;
      }
      
      // Show confirmation with more detailed information
      setTimeout(() => {
        alert(notificationMessage);
      }, 700);
      
    } catch (error) {
      console.error("Error saving to Drive Journal:", error);
      
      // Fallback if there's an error with the pending entry
      const journalEntryData = {
        id: activeRouteId || `route-${Date.now()}`,
        date: new Date().toISOString(),
        startLocation,
        endLocation,
        waypoints,
        vehicle: selectedVehicle,
        distance: calculateTotalDistance(gpsTrackHistory),
        duration: gpsTrackHistory.length > 1 ? 
          (gpsTrackHistory[gpsTrackHistory.length - 1].timestamp - gpsTrackHistory[0].timestamp) / 1000 / 60 : 0,
        telemetryStats,
        telemetryHistory: telemetryHistory.slice(-50), // Limit the size
        gpsTrackHistory: gpsTrackHistory.slice(-100), // Limit the size
        weatherConditions: weatherData,
        routePurpose: drivePurpose,
        drivingMode,
        postDriveChecklist: postDriveData || null,
        stops: routeStops,
        routeCompleted: !!postDriveData,
        customTelemetry: {
          curvaturePercentage: telemetryStats.curvyRoadPercentage.toFixed(1) + '%',
          maxSpeed: telemetryStats.maxSpeed + ' mph',
          drivingScore: telemetryStats.drivingScore + '/100'
        },
        carClub: isGroupDrive ? {
          name: carClubName,
          contactInfo: carClubContactInfo
        } : null,
        eventRally: isEventRally ? {
          name: eventRallyName,
          organizer: eventRallyOrganizer,
          url: eventRallyUrl,
          date: eventRallyDate,
          time: eventRallyTime,
          description: eventRallyDescription,
          location: eventRallyLocation || endLocation,
          hasMap: !!eventMapFile
        } : null,
        companions: hasFriendsJoining ? drivingCompanions : []
      };
      
      console.log("Saving route to Drive Journal (fallback method):", journalEntryData);
      
      // Show confirmation (simplified version due to error)
      setTimeout(() => {
        if (postDriveData) {
          alert("Drive completed and saved to your Drive Journal with post-drive checklist");
        } else {
          alert("Route saved to your Drive Journal");
        }
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-blue-400 font-orbitron text-4xl">🛣️ Route Planner</h1>
          
          {/* Only show active tracking stats in header when tracking is active */}
          {gpsTrackingEnabled && (
            <div className="flex items-center gap-4">
              <div className="bg-black/40 rounded-lg border border-blue-500/30 px-4 py-2 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-green-400 font-orbitron text-sm">TRACKING ACTIVE</span>
                </div>
                <div className="text-gray-300 text-sm">
                  {gpsTrackHistory.length > 0 && (
                    <span>{calculateTotalDistance(gpsTrackHistory).toFixed(1)} mi</span>
                  )}
                </div>
              </div>
              <button 
                onClick={stopGpsTracking}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
              >
                <RotateCw className="h-5 w-5" />
                <span className="font-orbitron">End & Save</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Navigation Integration */}
        <div className="bg-gray-900/60 rounded-lg p-4 border border-blue-900/30 mb-4">
          <h3 className="text-blue-400 font-orbitron text-lg mb-3">Navigation Integration</h3>
          
          <div className="mb-3">
            <label className="block text-gray-300 text-sm mb-2">Preferred Navigation App</label>
            <div className="flex items-center gap-3">
              <select
                value={preferredNavApp}
                onChange={(e) => setPreferredNavApp(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 w-full"
              >
                <option value="Google Maps">Google Maps</option>
                <option value="Waze">Waze</option>
                <option value="Apple Maps">Apple Maps</option>
              </select>
            </div>
          </div>
          
          {/* Removed duplicate Advanced Navigation Features button */}
          
          {showAdvancedSettings && (
            <div className="mt-3 pl-4 border-l-2 border-blue-500/30 animate-fadeIn space-y-5">
              {/* Universal Features */}
              <div>
                <h4 className="text-green-400 font-orbitron text-md mb-2">Universal Features</h4>
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
                  
                  <label className="flex items-center space-x-2 text-white text-sm">
                    <input
                      type="checkbox"
                      checked={navigationFeatures.avoidFerries || false}
                      onChange={(e) => setNavigationFeatures({...navigationFeatures, avoidFerries: e.target.checked})}
                      className="form-checkbox text-green-500"
                    />
                    <span>Avoid Ferries</span>
                  </label>
                </div>
              </div>

              {/* Route Optimization */}
              <div>
                <h4 className="text-green-400 font-orbitron text-md mb-2">Route Optimization</h4>
                <div className="mb-3">
                  <label className="block text-gray-300 text-sm mb-1">Traffic Avoidance Strategy</label>
                  <select 
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                    value={navigationFeatures.trafficAvoidance || 'moderate'}
                    onChange={(e) => setNavigationFeatures({...navigationFeatures, trafficAvoidance: e.target.value})}
                  >
                    <option value="none">None - Follow Main Route</option>
                    <option value="light">Light - Minor Detours Only</option>
                    <option value="moderate">Moderate - Avoid Major Delays</option>
                    <option value="aggressive">Aggressive - Best Time Priority</option>
                    <option value="max">Maximum - Avoid All Traffic</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-300 text-sm mb-1">Road Type Preference</label>
                  <select 
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                    value={navigationFeatures.roadTypePreference || 'balanced'}
                    onChange={(e) => setNavigationFeatures({...navigationFeatures, roadTypePreference: e.target.value})}
                  >
                    <option value="highways">Highway Priority</option>
                    <option value="balanced">Balanced</option>
                    <option value="scenic">Scenic Routes</option>
                    <option value="enthusiast">Enthusiast Roads</option>
                    <option value="trackday">Track Day Approach</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-300 text-sm mb-1">Route Complexity</label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 w-20">Simple</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={navigationFeatures.complexityLevel || 3}
                      onChange={(e) => setNavigationFeatures({...navigationFeatures, complexityLevel: parseInt(e.target.value)})}
                      className="flex-grow mx-2"
                    />
                    <span className="text-xs text-gray-400 w-20 text-right">Complex</span>
                  </div>
                </div>
                
                <label className="flex items-center space-x-2 text-white text-sm">
                  <input
                    type="checkbox"
                    checked={navigationFeatures.optimizeForSportsCars || false}
                    onChange={(e) => setNavigationFeatures({...navigationFeatures, optimizeForSportsCars: e.target.checked})}
                    className="form-checkbox text-green-500"
                  />
                  <span>Sports Car Optimization</span>
                </label>
              </div>

              {/* Google Maps Features */}
              {preferredNavApp === "Google Maps" && (
                <div>
                  <h4 className="text-green-400 font-orbitron text-md mb-2">Google Maps Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={googleMapsOptions.trafficLayer || false}
                        onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, trafficLayer: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Traffic Layer</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={googleMapsOptions.satelliteView || false}
                        onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, satelliteView: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Satellite View</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={googleMapsOptions.streetView || false}
                        onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, streetView: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Street View Access</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={googleMapsOptions.terrainView || false}
                        onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, terrainView: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Terrain View</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={googleMapsOptions.evChargingStations || false}
                        onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, evChargingStations: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>EV Charging Stations</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={googleMapsOptions.gasPriceLayer || false}
                        onChange={(e) => setGoogleMapsOptions({...googleMapsOptions, gasPriceLayer: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Gas Price Layer</span>
                    </label>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-400 mt-3">
                For app-specific features, Paddock20 uses custom launch parameters through deep linking. 
                Your preferences will be automatically configured when opening your preferred navigation app.
              </p>
              
              <button
                onClick={() => document.getElementById('navigation-advanced-settings')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-blue-400 hover:text-blue-300 text-sm underline mt-3"
              >
                See More Advanced Navigation Settings
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Route Planning Section */}
          <div className="bg-gray-900/60 rounded-lg p-4 border border-blue-900/30">
            <h3 className="text-blue-400 font-orbitron text-xl mb-4">🛣️ Route Planner</h3>
            
            {/* Start Location */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-1">Starting Point</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Start Location"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                />
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Departure Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                  />
                </div>
              </div>
            </div>
            
            {/* Multi-city Route Stops */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-1">Additional Stops (Multi-City)</label>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Stop Location</label>
                    <input
                      type="text"
                      placeholder="Add a stopover location"
                      value={newStopLocation}
                      onChange={handleStopLocationChange}
                      className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Arrival Date</label>
                    <input
                      type="date"
                      value={newStopDate}
                      onChange={handleStopDateChange}
                      className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Stay Duration (Days)</label>
                    <input
                      type="number"
                      min="0"
                      value={stayDuration}
                      onChange={handleStayDurationChange}
                      className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="overnight"
                      checked={isOvernight}
                      onChange={handleOvernightChange}
                      className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                    />
                    <label htmlFor="overnight" className="text-gray-300">Overnight Stay</label>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="text-gray-400 text-sm mb-1 block">Notes</label>
                  <textarea
                    placeholder="Any special notes for this stop (optional)"
                    value={stopNotes}
                    onChange={handleStopNotesChange}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 min-h-[60px]"
                  ></textarea>
                </div>
                
                <button
                  onClick={addRouteStop}
                  className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded whitespace-nowrap"
                >
                  ➕ Add Stop
                </button>
              </div>
              
              {routeStops.length > 0 && (
                <div className="my-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-300">Route Stops ({routeStops.length})</p>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs text-green-400">Includes weather forecasts</span>
                    </div>
                  </div>
                  <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {routeStops.map((stop, index) => (
                      <li key={index} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                        <div className="bg-gray-700 px-3 py-2 flex justify-between items-center">
                          <span className="text-white font-orbitron text-sm">{index + 1}. {stop.location}</span>
                          <button
                            onClick={() => removeRouteStop(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            ✖
                          </button>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400 block">Arrival:</span>
                            <span className="text-white">{stop.arrivalDate || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Stay:</span>
                            <span className="text-white">{stop.stayDuration} day{stop.stayDuration !== 1 ? 's' : ''}</span>
                          </div>
                          {stop.notes && (
                            <div className="col-span-2 mt-1 border-t border-gray-700 pt-2">
                              <span className="text-gray-400 block">Notes:</span>
                              <span className="text-white">{stop.notes}</span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* End Location */}
            <div>
              <label className="block text-gray-300 mb-1">Final Destination</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="End Location"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                />
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Arrival Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                  />
                </div>
              </div>
            </div>
            
            {/* Removed duplicate Route Customizations section - Using the more comprehensive section below */}
          </div>
          
          {/* Removed duplicate Vehicle Selection Section */}
          
          {/* Pre-Drive Performance Checklist - Now in its own section */}
          <div className="bg-gray-900/60 rounded-lg p-4 border border-green-900/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-blue-400 font-orbitron text-xl">🏁 Pre-Drive Checklist</span>
                <span className="ml-2 bg-green-600 text-xs text-black font-bold px-2 py-0.5 rounded">SAFETY REQUIRED</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    // Log the checklist completion
                    const checklistLog = {
                      id: `checklist-${Date.now()}`,
                      date: new Date().toISOString(),
                      vehicle: selectedVehicle,
                      routeInfo: {
                        start: startLocation,
                        end: endLocation,
                        stops: routeStops.map(stop => stop.location)
                      },
                      checkedItems: [
                        "Tire pressure verified",
                        "Torque settings applied",
                        "Fluid levels checked",
                        "Weather conditions verified",
                        `${drivingMode} mode activated`
                      ],
                      completed: true,
                      notes: `${drivePurpose === 'celebration' ? 'Celebration ride' : 'Standard drive'} with ${selectedVehicle || 'selected vehicle'}`
                    };
                    
                    console.log("Checklist logged:", checklistLog);
                    
                    // Show toast instead of plain alert
                    setCheckedItems({
                      tires: true,
                      fluids: true,
                      lights: true,
                      brakes: true,
                      weather: true
                    });
                    
                    // Update ready state
                    setIsReadyToDrive(true);
                    
                    // Display styled notification
                    setShowChecklistCompleteMessage(true);
                    setTimeout(() => {
                      setShowChecklistCompleteMessage(false);
                    }, 5000);
                  }}
                  className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg shadow-md transition-all flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Verify Complete</span>
                </button>
                <button 
                  onClick={() => alert("Checklist generated for your specific vehicle and conditions")}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-2 rounded-lg transition-all flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-b from-gray-900 to-black/80 p-5 rounded-lg border border-blue-900/50 mb-4 shadow-lg">
              <p className="text-gray-300 text-sm mb-4 italic border-l-2 border-blue-500 pl-3">
                Complete this mandatory safety checklist before starting your {drivePurpose === 'celebration' ? 'celebration ride' : 'performance drive'}.
                Items are tailored specifically for your {selectedVehicle || 'vehicle'} and current conditions.
              </p>
              
              {/* Vehicle Selection - First step of Pre-Drive Checklist */}
              <div className="mb-6 bg-gradient-to-r from-green-900/30 to-black p-4 rounded-lg border border-green-900/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-green-400 font-medium">Vehicle Selection</label>
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded">REQUIRED</span>
                </div>
                <div className="flex gap-3 items-center">
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="flex-grow p-2 bg-gray-800 text-white rounded border border-green-700"
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
                  <button
                    onClick={() => setShowAddVehicleForm(true)}
                    className="bg-green-800 hover:bg-green-700 text-white p-2 rounded-lg flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add</span>
                  </button>
                </div>
                {!selectedVehicle && 
                  <p className="text-amber-400 text-xs mt-1">Select a vehicle to automatically adjust checklist requirements</p>
                }
                {selectedVehicle && 
                  <p className="text-green-400 text-xs mt-1">
                    {selectedVehicle} selected - checklist updated with vehicle-specific requirements
                  </p>
                }
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-black/40 p-3 rounded-lg border border-green-900/30 shadow-inner transition-all hover:border-green-500/30 group relative">
                  <div className="absolute top-0 right-0 bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-bl">
                    Critical
                  </div>
                  <h4 className="text-green-400 font-orbitron text-base mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Vehicle Preparation
                  </h4>
                  <div className="space-y-3">
                    <label className="relative flex items-center text-gray-200 text-sm group cursor-pointer p-3 rounded-lg border border-transparent hover:border-green-500/30 hover:bg-green-900/10 transition-all duration-200 hover:shadow-md">
                      <div className="relative mr-4 min-w-10">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                        />
                        <div className="h-6 w-6 bg-black/60 rounded-md border border-green-500/50 shadow-inner peer-checked:bg-green-600 peer-checked:border-green-400 transition-all duration-200"></div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="absolute top-1 left-1 h-4 w-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <div className="absolute inset-0 rounded-md opacity-0 peer-checked:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-black opacity-0 peer-checked:opacity-100 transition-opacity delay-150 duration-200">
                            DONE
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="block font-medium text-base text-green-400">Tire Pressure</span>
                        <div className="mt-1 p-1.5 bg-black/20 border border-green-900/20 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">
                              {selectedTireSetup && tireSetups[selectedTireSetup] ? 
                              <span>✓ {tireSetups[selectedTireSetup]?.pressureVariance || '32'} PSI (front) / {Number(tireSetups[selectedTireSetup]?.pressureVariance || 32) - 1} PSI (rear)</span> : 
                              <span>Setting: 32 PSI (front) / 31 PSI (rear)</span>}
                            </span>
                            <span className="text-xs text-green-500 font-semibold">OPTIMAL</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-600 to-green-400 w-3/4 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="relative flex items-center text-gray-200 text-sm group cursor-pointer p-3 rounded-lg border border-transparent hover:border-green-500/30 hover:bg-green-900/10 transition-all duration-200 hover:shadow-md">
                      <div className="relative mr-4 min-w-10">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                        />
                        <div className="h-6 w-6 bg-black/60 rounded-md border border-green-500/50 shadow-inner peer-checked:bg-green-600 peer-checked:border-green-400 transition-all duration-200"></div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="absolute top-1 left-1 h-4 w-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <div className="absolute inset-0 rounded-md opacity-0 peer-checked:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-black opacity-0 peer-checked:opacity-100 transition-opacity delay-150 duration-200">
                            DONE
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="block font-medium text-base text-green-400">Torque Settings</span>
                        <div className="mt-1 p-1.5 bg-black/20 border border-green-900/20 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">
                              {selectedVehicle === 'Ferrari F8' ? 
                              <span>✓ 96 ft-lb (factory spec for Ferrari F8)</span> : 
                              <span>✓ {72 + torqueAdjustment}-{85 + torqueAdjustment} ft-lb (recommended range)</span>}
                            </span>
                            <span className="text-xs text-green-500 font-semibold">SET</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-600 to-green-400 w-full rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="relative flex items-center text-gray-200 text-sm group cursor-pointer p-3 rounded-lg border border-transparent hover:border-green-500/30 hover:bg-green-900/10 transition-all duration-200 hover:shadow-md">
                      <div className="relative mr-4 min-w-10">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                        />
                        <div className="h-6 w-6 bg-black/60 rounded-md border border-green-500/50 shadow-inner peer-checked:bg-green-600 peer-checked:border-green-400 transition-all duration-200"></div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="absolute top-1 left-1 h-4 w-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <div className="absolute inset-0 rounded-md opacity-0 peer-checked:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-black opacity-0 peer-checked:opacity-100 transition-opacity delay-150 duration-200">
                            DONE
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="block font-medium text-base text-green-400">Fluid Levels</span>
                        <div className="mt-1 grid grid-cols-4 gap-1">
                          <div className="p-1 bg-black/20 border border-green-900/20 rounded-md text-center">
                            <div className="w-full h-4 bg-gradient-to-t from-amber-600 to-amber-400 rounded-sm"></div>
                            <span className="text-xs text-gray-400">Oil</span>
                          </div>
                          <div className="p-1 bg-black/20 border border-green-900/20 rounded-md text-center">
                            <div className="w-full h-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm"></div>
                            <span className="text-xs text-gray-400">Coolant</span>
                          </div>
                          <div className="p-1 bg-black/20 border border-green-900/20 rounded-md text-center">
                            <div className="w-full h-4 bg-gradient-to-t from-red-600 to-red-400 rounded-sm"></div>
                            <span className="text-xs text-gray-400">Brake</span>
                          </div>
                          <div className="p-1 bg-black/20 border border-green-900/20 rounded-md text-center">
                            <div className="w-full h-4 bg-gradient-to-t from-sky-600 to-sky-400 rounded-sm"></div>
                            <span className="text-xs text-gray-400">Washer</span>
                          </div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="relative flex items-center text-gray-200 text-sm group cursor-pointer p-3 rounded-lg border border-transparent hover:border-green-500/30 hover:bg-green-900/10 transition-all duration-200 hover:shadow-md">
                      <div className="relative mr-4 min-w-10">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                        />
                        <div className="h-6 w-6 bg-black/60 rounded-md border border-green-500/50 shadow-inner peer-checked:bg-green-600 peer-checked:border-green-400 transition-all duration-200"></div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="absolute top-1 left-1 h-4 w-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <div className="absolute inset-0 rounded-md opacity-0 peer-checked:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-black opacity-0 peer-checked:opacity-100 transition-opacity delay-150 duration-200">
                            DONE
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="block font-medium text-base text-green-400">Battery & Electrics</span>
                        <div className="mt-1 flex items-center gap-3">
                          <div className="flex-1 p-1.5 bg-black/20 border border-green-900/20 rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400">Charge Level</span>
                              <span className="text-xs text-green-500 font-semibold">95%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-600 to-green-400 w-[95%] rounded-full"></div>
                            </div>
                          </div>
                          <div className="p-1.5 bg-black/20 border border-green-900/20 rounded-md flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-300">Secure</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-blue-900/30 shadow-inner transition-all hover:border-blue-500/30 group relative">
                  <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-bl">
                    Performance
                  </div>
                  <h4 className="text-blue-400 font-orbitron text-base mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Electronics & Settings
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center text-gray-200 text-sm group cursor-pointer p-2 hover:bg-blue-900/10 rounded transition-colors">
                      <input type="checkbox" className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5" />
                      <div>
                        <span className="block font-medium">Driving Mode</span>
                        <span className="text-xs text-gray-400">
                          {drivingMode.includes('custom:') ? 
                          <span>Custom: {drivingMode.replace('custom:', '')}</span> : 
                          <span>{drivingMode} mode ready</span>}
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center text-gray-200 text-sm group cursor-pointer p-2 hover:bg-blue-900/10 rounded transition-colors">
                      <input type="checkbox" className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5" />
                      <div>
                        <span className="block font-medium">Traction Systems</span>
                        <span className="text-xs text-gray-400">
                          {drivePurpose === 'celebration' ? 
                          'Optimized for celebration ride (more forgiving)' : 
                          'Configured for performance driving'}
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center text-gray-200 text-sm group cursor-pointer p-2 hover:bg-blue-900/10 rounded transition-colors">
                      <input type="checkbox" className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5" />
                      <div>
                        <span className="block font-medium">Navigation</span>
                        <span className="text-xs text-gray-400">
                          {preferredNavApp} {routeStops.length > 0 ? `with ${routeStops.length} stops` : 'direct route'}
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center text-gray-200 text-sm group cursor-pointer p-2 hover:bg-blue-900/10 rounded transition-colors">
                      <input type="checkbox" className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5" />
                      <div>
                        <span className="block font-medium">Data Recording</span>
                        <span className="text-xs text-gray-400">
                          Telemetry {driveJournalIntegration ? 'enabled with Drive Journal sync' : 'disabled'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-purple-900/30 shadow-inner transition-all hover:border-purple-500/30 group relative">
                  <div className="absolute top-0 right-0 bg-purple-600/20 text-purple-400 text-xs px-2 py-0.5 rounded-bl">
                    Environment
                  </div>
                  <h4 className="text-purple-400 font-orbitron text-base mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    Weather & Conditions
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center text-gray-200 text-sm group cursor-pointer p-2 hover:bg-purple-900/10 rounded transition-colors">
                      <input type="checkbox" className="form-checkbox text-purple-500 rounded mr-3 h-5 w-5" />
                      <div>
                        <span className="block font-medium">Current Weather</span>
                        <span className="text-xs text-gray-400">
                          {weatherData?.current?.weather?.[0]?.main || 'Weather'} | {Math.round(weatherData?.current?.temp || 70)}°F Air Temp
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center text-gray-200 text-sm group cursor-pointer p-2 hover:bg-purple-900/10 rounded transition-colors">
                      <input type="checkbox" className="form-checkbox text-purple-500 rounded mr-3 h-5 w-5" />
                      <div>
                        <span className="block font-medium">Surface Temperature</span>
                        <span className="text-xs text-gray-400">
                          ~{Math.round((weatherData?.current?.temp || 70) - 5)}°F | {
                            Math.round((weatherData?.current?.temp || 70) - 5) < 50 ? 'Cold: Limited grip' : 
                            Math.round((weatherData?.current?.temp || 70) - 5) > 90 ? 'Hot: Possible overheating' :
                            'Optimal driving conditions'
                          }
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center text-gray-200 text-sm group cursor-pointer p-2 hover:bg-purple-900/10 rounded transition-colors">
                      <input type="checkbox" className="form-checkbox text-purple-500 rounded mr-3 h-5 w-5" />
                      <div>
                        <span className="block font-medium">Visibility Conditions</span>
                        <span className="text-xs text-gray-400">
                          {weatherData?.current?.visibility ? Math.round(weatherData.current.visibility / 1609) + ' miles' : '10+ miles'} | {
                            (weatherData?.current?.visibility || 16090) < 5000 ? 'Reduced - Drive with caution' : 'Clear visibility'
                          }
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center text-gray-200 text-sm group cursor-pointer p-2 hover:bg-purple-900/10 rounded transition-colors">
                      <input type="checkbox" className="form-checkbox text-purple-500 rounded mr-3 h-5 w-5" />
                      <div>
                        <span className="block font-medium">Route Assessment</span>
                        <span className="text-xs text-gray-400">
                          {drivePurpose === 'celebration' ? 'Celebration route verified & secure' : 
                          navigationFeatures.curvyRoads ? 'Performance route with curves verified' : 'Standard route conditions verified'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-3 border-t border-gray-800 flex justify-between items-center">
                <div className="text-gray-400 text-xs italic">
                  {selectedVehicle ? `Vehicle profile: ${selectedVehicle}` : 'No vehicle selected'} | 
                  Checklist updated: {new Date().toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs text-green-500 font-semibold">VERIFIED BY PADDOCK20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Removed duplicate "Additional Stops (Multi-City)" and "Final Destination" sections */}

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

            {/* Advanced F1-Grade Driving Telemetry */}
            <div className="mt-4 bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-blue-700 shadow-lg">
              <h3 className="text-blue-400 font-orbitron text-lg mb-3 flex items-center">
                <span className="h-3 w-3 bg-blue-500 animate-pulse rounded-full mr-2"></span>
                F1-Grade Performance Telemetry
              </h3>
              
              {/* Vehicle Selection removed from here - now in Pre-Drive Checklist */}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">                
                {/* Driving Style */}
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Driving Style</label>
                  <select
                    value={selectedDrivingProfile}
                    onChange={(e) => setSelectedDrivingProfile(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                  >
                    <option value="">Select Driving Style</option>
                    {drivingProfiles.map((profile, idx) => (
                      <option key={idx} value={profile.name}>{profile.name} ({profile.style})</option>
                    ))}
                  </select>
                </div>
                
                {/* Drive Purpose */}
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Drive Purpose</label>
                  <select
                    value={drivePurpose}
                    onChange={(e) => {
                      setDrivePurpose(e.target.value);
                      if (e.target.value === "custom") {
                        setShowCustomDrivePurposeForm(true);
                      }
                    }}
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                  >
                    <option value="leisure">Leisure Drive</option>
                    <option value="spirited">Spirited Driving</option>
                    <option value="touring">Grand Touring</option>
                    <option value="track">Track Day Prep</option>
                    <option value="testing">Vehicle Testing</option>
                    <option value="commute">Daily Commute</option>
                    <option value="business">Business Travel</option>
                    <option value="roadtrip">Road Trip</option>
                    <option value="scenic">Scenic Route</option>
                    <option value="photography">Car Photography</option>
                    <option value="efficiency">Efficiency Run</option>
                    <option value="celebration">Celebration Ride</option>
                    <option value="milestone">Milestone Achievement</option>
                    <option value="firstdrive">First Drive</option>
                    <option value="custom">Custom Purpose...</option>
                  </select>
                  
                  {showCustomDrivePurposeForm && (
                    <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Enter custom drive purpose"
                          value={customDrivePurpose}
                          onChange={(e) => setCustomDrivePurpose(e.target.value)}
                          className="flex-grow p-2 bg-gray-800 text-white rounded-l border border-gray-700"
                        />
                        <button
                          onClick={() => {
                            if (customDrivePurpose.trim()) {
                              setDrivePurpose(`custom:${customDrivePurpose}`);
                              setShowCustomDrivePurposeForm(false);
                            }
                          }}
                          className="bg-blue-600 text-white px-3 rounded-r hover:bg-blue-500"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Car Club/Group Information */}
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="isGroupDrive"
                        checked={isGroupDrive}
                        onChange={(e) => setIsGroupDrive(e.target.checked)}
                        className="form-checkbox text-blue-500 mr-2"
                      />
                      <label htmlFor="isGroupDrive" className="text-gray-300 text-sm">
                        Group/Club Drive
                      </label>
                    </div>
                    
                    {isGroupDrive && (
                      <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 space-y-3">
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Club/Group Name</label>
                          <input
                            type="text"
                            value={carClubName}
                            onChange={(e) => setCarClubName(e.target.value)}
                            placeholder="Enter car club or group name"
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Contact Information</label>
                          <input
                            type="text"
                            value={carClubContactInfo}
                            onChange={(e) => setCarClubContactInfo(e.target.value)}
                            placeholder="Organizer contact (optional)"
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Who's Joining Section */}
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hasFriendsJoining"
                          checked={hasFriendsJoining}
                          onChange={(e) => setHasFriendsJoining(e.target.checked)}
                          className="form-checkbox text-blue-500 mr-2"
                        />
                        <label htmlFor="hasFriendsJoining" className="text-gray-300 text-sm font-medium">
                          Who's Joining the Drive?
                        </label>
                      </div>
                      {hasFriendsJoining && drivingCompanions.length > 0 && (
                        <span className="text-xs text-green-400 font-medium">
                          {drivingCompanions.length} {drivingCompanions.length === 1 ? 'companion' : 'companions'} added
                        </span>
                      )}
                    </div>
                    
                    {hasFriendsJoining && (
                      <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 space-y-3">
                        <p className="text-gray-300 text-xs italic mb-2">
                          Add friends and their vehicles who will be joining you on this drive (up to 50).
                        </p>
                        
                        {/* Add new companion form */}
                        <div className="bg-black/30 p-3 rounded border border-blue-900/30">
                          <h4 className="font-medium text-blue-400 text-sm mb-2">Add New Companion</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Friend's Name</label>
                              <input
                                type="text"
                                value={newCompanionName}
                                onChange={(e) => setNewCompanionName(e.target.value)}
                                placeholder="Enter name"
                                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Friend's Vehicle</label>
                              <input
                                type="text"
                                value={newCompanionVehicle}
                                onChange={(e) => setNewCompanionVehicle(e.target.value)}
                                placeholder="Enter vehicle make/model"
                                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Vehicle Details (optional)</label>
                              <input
                                type="text"
                                value={newCompanionVehicleDetails}
                                onChange={(e) => setNewCompanionVehicleDetails(e.target.value)}
                                placeholder="Year, color, modifications, etc."
                                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={addCompanion}
                                disabled={!newCompanionName || !newCompanionVehicle || drivingCompanions.length >= 50}
                                className={`w-full p-2 rounded flex items-center justify-center gap-1
                                  ${(!newCompanionName || !newCompanionVehicle || drivingCompanions.length >= 50) 
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add to Drive</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* List of companions */}
                        {drivingCompanions.length > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-blue-400 text-sm">Drive Companions</h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setCompanionsListView(companionsListView === 'grid' ? 'list' : 'grid')}
                                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 p-1 rounded"
                                >
                                  {companionsListView === 'grid' ? 'List View' : 'Grid View'}
                                </button>
                                <button
                                  onClick={clearAllCompanions}
                                  className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 p-1 rounded flex items-center gap-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Clear All
                                </button>
                              </div>
                            </div>
                            
                            <div className={`mt-2 max-h-60 overflow-y-auto scrollbar-thin pr-1 
                              ${companionsListView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : 'space-y-2'}`}>
                              {drivingCompanions.map((companion, index) => (
                                <div 
                                  key={index} 
                                  className={`relative bg-black/40 border border-gray-800 rounded-lg 
                                  ${companionsListView === 'grid' ? 'p-3' : 'p-2 flex items-center gap-3'}`}
                                >
                                  {companionsListView === 'grid' ? (
                                    // Grid View
                                    <>
                                      <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-medium text-white">{companion.name}</h5>
                                        <button
                                          onClick={() => removeCompanion(index)}
                                          className="text-red-400 hover:text-red-300 p-1"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                      <div className="border-l-2 border-blue-500 pl-2 py-0.5">
                                        <div className="text-sm text-blue-300">{companion.vehicle}</div>
                                        {companion.vehicleDetails && (
                                          <div className="text-xs text-gray-400">{companion.vehicleDetails}</div>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    // List View
                                    <>
                                      <div className="w-8 h-8 bg-blue-900/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
                                        {companion.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-grow">
                                        <div className="flex justify-between">
                                          <h5 className="font-medium text-white text-sm">{companion.name}</h5>
                                        </div>
                                        <div className="text-xs text-blue-300">{companion.vehicle}</div>
                                        {companion.vehicleDetails && (
                                          <div className="text-xs text-gray-400">{companion.vehicleDetails}</div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => removeCompanion(index)}
                                        className="text-red-400 hover:text-red-300 p-1"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {drivingCompanions.length >= 50 && (
                              <div className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Maximum limit of 50 companions reached</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Event/Rally Information */}
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="isEventRally"
                        checked={isEventRally}
                        onChange={(e) => setIsEventRally(e.target.checked)}
                        className="form-checkbox text-blue-500 mr-2"
                      />
                      <label htmlFor="isEventRally" className="text-gray-300 text-sm">
                        Event/Rally Drive
                      </label>
                    </div>
                    
                    {isEventRally && (
                      <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 space-y-3">
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Event/Rally Name</label>
                          <input
                            type="text"
                            value={eventRallyName}
                            onChange={(e) => setEventRallyName(e.target.value)}
                            placeholder="Enter event or rally name"
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Organizer</label>
                          <input
                            type="text"
                            value={eventRallyOrganizer}
                            onChange={(e) => setEventRallyOrganizer(e.target.value)}
                            placeholder="Event organizer (optional)"
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Upload Event Map</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              onChange={handleEventMapUpload}
                              className="hidden"
                              id="event-map-upload"
                              accept=".jpg,.jpeg,.png,.pdf"
                            />
                            <label 
                              htmlFor="event-map-upload"
                              className="flex-grow cursor-pointer bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors text-center"
                            >
                              {eventMapFile ? eventMapFile.name : "Choose Map File"}
                            </label>
                            {eventMapFile && (
                              <button
                                onClick={() => {
                                  setEventMapFile(null);
                                  setEventMapUrl(null);
                                }}
                                className="bg-red-600 text-white p-2 rounded hover:bg-red-500 text-xs"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          
                          {eventMapUrl && (
                            <div className="mt-2 p-2 bg-black rounded border border-gray-700">
                              <p className="text-green-400 text-xs mb-1">Map Uploaded</p>
                              <div className="aspect-video bg-gray-800 rounded overflow-hidden">
                                <img 
                                  src={eventMapUrl} 
                                  alt="Event Map" 
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Custom Tire Settings */}
              <div className="mb-4">
                <h4 className="text-green-400 font-semibold text-sm mb-2 uppercase tracking-wide">Tire Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Tire Setup</label>
                    <select
                      value={selectedTireSetup}
                      onChange={(e) => {
                        setSelectedTireSetup(e.target.value);
                        if (e.target.value === "custom") {
                          setShowCustomTireSetupForm(true);
                        }
                      }}
                      className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                    >
                      <option value="">Default Vehicle Setup</option>
                      {Object.keys(tireSetups).map((setup) => (
                        <option key={setup} value={setup}>{setup}</option>
                      ))}
                      <option value="custom">Custom Tire Setup...</option>
                    </select>
                    
                    {showCustomTireSetupForm && (
                      <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                        <div className="grid gap-2">
                          <input
                            type="text"
                            placeholder="Setup Name"
                            value={customTireSetup.name}
                            onChange={(e) => setCustomTireSetup({...customTireSetup, name: e.target.value})}
                            className="p-2 bg-gray-800 text-white rounded border border-gray-700"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Compound"
                              value={customTireSetup.compound}
                              onChange={(e) => setCustomTireSetup({...customTireSetup, compound: e.target.value})}
                              className="p-2 bg-gray-800 text-white rounded border border-gray-700"
                            />
                            <input
                              type="number"
                              placeholder="Optimal Temp (°F)"
                              value={customTireSetup.optimalTemp.toString()}
                              onChange={(e) => setCustomTireSetup({...customTireSetup, optimalTemp: Number(e.target.value)})}
                              className="p-2 bg-gray-800 text-white rounded border border-gray-700"
                            />
                          </div>
                          <div className="flex mt-1">
                            <button
                              onClick={() => {
                                if (customTireSetup.name.trim() && customTireSetup.compound.trim()) {
                                  setTireSetups({
                                    ...tireSetups,
                                    [customTireSetup.name]: customTireSetup
                                  });
                                  setSelectedTireSetup(customTireSetup.name);
                                  setShowCustomTireSetupForm(false);
                                }
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 mr-2"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowCustomTireSetupForm(false)}
                              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Tire Pressure Adjustment</label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.5"
                        value={tirePressureAdjustment}
                        onChange={(e) => setTirePressureAdjustment(parseFloat(e.target.value))}
                        className="flex-grow mr-2"
                      />
                      <span className="text-white text-sm w-16 text-right">
                        {tirePressureAdjustment > 0 ? '+' : ''}{tirePressureAdjustment} PSI
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Tire Surface Temperature Optimization */}
                <div className="mt-3 bg-gray-900 p-2 rounded border border-gray-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 text-xs">Est. Optimal Temp Range:</span>
                    <span className="text-yellow-400 text-xs font-mono">{calculateOptimalTempRange()} °F</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded overflow-hidden">
                    <div 
                      className={`h-full ${getTireGripColorClass()}`} 
                      style={{ width: `${calculateTireGripPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">Cold</span>
                    <span className="text-xs text-green-400">Optimal</span>
                    <span className="text-xs text-gray-400">Hot</span>
                  </div>
                </div>
              </div>
              
              {/* Power & Torque Settings */}
              <div className="mb-4">
                <h4 className="text-green-400 font-semibold text-sm mb-2 uppercase tracking-wide">Power Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Torque Adjustment</label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="1"
                        value={torqueAdjustment}
                        onChange={(e) => setTorqueAdjustment(parseInt(e.target.value))}
                        className="flex-grow mr-2"
                      />
                      <span className="text-white text-sm w-16 text-right">
                        {torqueAdjustment > 0 ? '+' : ''}{torqueAdjustment} ft-lb
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Driving Mode</label>
                    <select
                      value={drivingMode}
                      onChange={(e) => {
                        setDrivingMode(e.target.value);
                        if (e.target.value === "custom") {
                          setShowCustomDrivingModeForm(true);
                        }
                      }}
                      className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                    >
                      <option value="Comfort">Comfort</option>
                      <option value="Sport">Sport</option>
                      <option value="Sport+">Sport+</option>
                      <option value="Track">Track</option>
                      <option value="Drift">Drift</option>
                      <option value="Drag">Drag Strip</option>
                      <option value="Eco">Eco</option>
                      <option value="Wet">Wet Weather</option>
                      <option value="Snow">Snow/Ice</option>
                      <option value="Touring">Long-Distance Touring</option>
                      <option value="Dynamic">Dynamic</option>
                      <option value="custom">Custom Mode...</option>
                    </select>
                    
                    {showCustomDrivingModeForm && (
                      <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                        <div className="grid gap-2">
                          <input
                            type="text"
                            placeholder="Mode Name"
                            value={customDrivingMode}
                            onChange={(e) => setCustomDrivingMode(e.target.value)}
                            className="p-2 bg-gray-800 text-white rounded border border-gray-700"
                          />
                          <div className="flex mt-1">
                            <button
                              onClick={() => {
                                if (customDrivingMode.trim()) {
                                  setDrivingMode(`custom:${customDrivingMode}`);
                                  setShowCustomDrivingModeForm(false);
                                }
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 mr-2"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => setShowCustomDrivingModeForm(false)}
                              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Weather-Adaptive Performance */}
              <div>
                <h4 className="text-green-400 font-semibold text-sm mb-2 uppercase tracking-wide">Weather Impact Analysis</h4>
                <div className="p-2 bg-gray-900 rounded border border-gray-700 text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Estimated Surface Temp:</span>
                    <span className="text-white font-mono">
                      {weatherData ? `${weatherData.surfaceTemp}°F` : '––'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Road Condition:</span>
                    <span className="text-white font-mono">
                      {weatherData ? weatherData.roadCondition : '––'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Power Adjustment:</span>
                    <span className={`font-mono ${telemetryData?.powerAdjustment ? (telemetryData.powerAdjustment > 0 ? 'text-green-400' : telemetryData.powerAdjustment < 0 ? 'text-red-400' : 'text-white') : 'text-white'}`}>
                      {telemetryData?.powerAdjustment !== undefined ? `${telemetryData.powerAdjustment > 0 ? '+' : ''}${telemetryData.powerAdjustment}%` : '––'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Tire Grip Level:</span>
                    <span className={`font-mono ${telemetryData?.tireGripLevel === 'Optimal' ? 'text-green-400' : telemetryData?.tireGripLevel === 'Good' ? 'text-yellow-400' : 'text-orange-400'}`}>
                      {telemetryData ? telemetryData.tireGripLevel : '––'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Removed Performance Heatmap Visualization section */}
            </div>
            
            <div className="mt-4">
              {/* Passenger section removed to prevent duplication - now using the improved Driving Companions widget */}
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
          {/* Route Customization - Widened with overflow handling */}
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg border border-gray-800 p-4 shadow-xl overflow-x-auto">
            <h2 className="text-blue-400 font-orbitron text-xl mb-4 flex items-center">
              <span className="mr-2">⚙️</span> Route Customizations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trip Configuration */}
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                <h3 className="text-green-500 font-semibold mb-2 text-sm uppercase tracking-wide">Trip Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center p-2 hover:bg-gray-800 rounded transition-colors">
                    <input
                      type="checkbox"
                      name="roundTrip"
                      checked={routeCustomizations.roundTrip}
                      onChange={handleRouteCustomizationChange}
                      className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                    />
                    <div>
                      <span className="text-white font-medium">Round Trip</span>
                      <p className="text-gray-400 text-xs">Return to starting point</p>
                    </div>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-800 rounded transition-colors">
                    <input
                      type="checkbox"
                      name="scenic"
                      checked={routeCustomizations.scenic}
                      onChange={handleRouteCustomizationChange}
                      className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                    />
                    <div>
                      <span className="text-white font-medium">Scenic Route</span>
                      <p className="text-gray-400 text-xs">Prioritize roads with views</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Stops & Services */}
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                <h3 className="text-green-500 font-semibold mb-2 text-sm uppercase tracking-wide">Stops & Services</h3>
                <div className="space-y-2">
                  <label className="flex items-center p-2 hover:bg-gray-800 rounded transition-colors">
                    <input
                      type="checkbox"
                      name="foodStop"
                      checked={routeCustomizations.foodStop}
                      onChange={handleRouteCustomizationChange}
                      className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                    />
                    <div>
                      <span className="text-white font-medium">Food Stops</span>
                      <p className="text-gray-400 text-xs">Include recommended restaurants</p>
                    </div>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-800 rounded transition-colors">
                    <input
                      type="checkbox"
                      name="gasStop"
                      checked={routeCustomizations.gasStop}
                      onChange={handleRouteCustomizationChange}
                      className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                    />
                    <div>
                      <span className="text-white font-medium">Fuel Stations</span>
                      <p className="text-gray-400 text-xs">Include premium fuel stations</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Road Preferences */}
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                <h3 className="text-green-500 font-semibold mb-2 text-sm uppercase tracking-wide">Toll Preferences</h3>
                <div className="space-y-2">
                  <label className="flex items-center p-2 hover:bg-gray-800 rounded transition-colors">
                    <input
                      type="radio"
                      name="tollPreference"
                      checked={routeCustomizations.avoidTolls}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRouteCustomizations(prev => ({
                            ...prev,
                            avoidTolls: true,
                            allowTolls: false
                          }));
                        }
                      }}
                      className="form-radio text-blue-500 mr-3 h-5 w-5"
                    />
                    <div>
                      <span className="text-white font-medium">Avoid Toll Roads</span>
                      <p className="text-gray-400 text-xs">May increase travel time</p>
                    </div>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-800 rounded transition-colors">
                    <input
                      type="radio"
                      name="tollPreference"
                      checked={routeCustomizations.allowTolls}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRouteCustomizations(prev => ({
                            ...prev,
                            avoidTolls: false,
                            allowTolls: true
                          }));
                        }
                      }}
                      className="form-radio text-blue-500 mr-3 h-5 w-5"
                    />
                    <div>
                      <span className="text-white font-medium">Allow Toll Roads</span>
                      <p className="text-gray-400 text-xs">Optimize for fastest route</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Additional Options */}
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                <h3 className="text-green-500 font-semibold mb-2 text-sm uppercase tracking-wide">Advanced Features</h3>
                <div className="space-y-2">
                  <div className="bg-gray-800/80 p-3 rounded-lg border border-blue-900/30 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={navigationFeatures.curvyRoads}
                          onChange={(e) => setNavigationFeatures(prev => ({
                            ...prev,
                            curvyRoads: e.target.checked
                          }))}
                          className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                        />
                        <div>
                          <span className="text-white font-medium">Curvature Preference</span>
                          <p className="text-gray-400 text-xs">Routes with higher % of curves (TRN value)</p>
                        </div>
                      </div>
                      {navigationFeatures.curvyRoads && (
                        <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    
                    {navigationFeatures.curvyRoads && (
                      <div className="mt-4 bg-black/30 p-3 rounded-lg border border-blue-900/20 space-y-4">
                        <div>
                          <div className="mb-1 flex justify-between items-center">
                            <span className="text-sm text-blue-400 font-semibold">Curvature Intensity</span>
                            <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full">
                              {
                                navigationFeatures.curveIntensity === 1 ? "Minimal (0-2 TRN/km)" :
                                navigationFeatures.curveIntensity === 2 ? "Gentle (2-4 TRN/km)" :
                                navigationFeatures.curveIntensity === 3 ? "Moderate (4-6 TRN/km)" :
                                navigationFeatures.curveIntensity === 4 ? "Spirited (6-8 TRN/km)" :
                                "Technical (8-12+ TRN/km)"
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs mt-2">
                            <span className="text-gray-400 w-20">Gentle</span>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={navigationFeatures.curveIntensity || 3}
                              onChange={(e) => setNavigationFeatures(prev => ({
                                ...prev,
                                curveIntensity: parseInt(e.target.value)
                              }))}
                              className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-gray-400 w-20 text-right">Technical</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="mb-2">
                            <label className="text-sm text-blue-400 font-semibold">Curvature Mode</label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {['mild', 'balanced', 'aggressive', 'technical'].map((mode) => (
                              <div 
                                key={mode}
                                onClick={() => setNavigationFeatures(prev => ({
                                  ...prev,
                                  curvatureMode: mode
                                }))}
                                className={`
                                  cursor-pointer p-2 rounded-lg border transition-all text-center text-sm
                                  ${navigationFeatures.curvatureMode === mode 
                                    ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                                    : 'border-gray-700 bg-black/20 text-gray-400 hover:bg-gray-800/60'}
                                `}
                              >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="mb-2">
                            <label className="text-sm text-blue-400 font-semibold">Curve Direction Preference</label>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {['left', 'both', 'right'].map((direction) => (
                              <div 
                                key={direction}
                                onClick={() => setNavigationFeatures(prev => ({
                                  ...prev,
                                  curveDirection: direction
                                }))}
                                className={`
                                  cursor-pointer p-2 rounded-lg border transition-all text-center text-xs
                                  ${navigationFeatures.curveDirection === direction 
                                    ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                                    : 'border-gray-700 bg-black/20 text-gray-400 hover:bg-gray-800/60'}
                                `}
                              >
                                {direction === 'left' && '⟲ Left Turns'}
                                {direction === 'both' && '⟶ Balanced'}
                                {direction === 'right' && '⟳ Right Turns'}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={navigationFeatures.elevationChanges}
                              onChange={(e) => setNavigationFeatures(prev => ({
                                ...prev,
                                elevationChanges: e.target.checked
                              }))}
                              className="form-checkbox text-blue-500 rounded h-5 w-5"
                            />
                            <span className="text-white">Include Elevation Changes</span>
                          </div>
                          
                          {navigationFeatures.elevationChanges && (
                            <select
                              value={navigationFeatures.elevationIntensity}
                              onChange={(e) => setNavigationFeatures(prev => ({
                                ...prev,
                                elevationIntensity: parseInt(e.target.value)
                              }))}
                              className="bg-black/30 border border-gray-700 text-white rounded px-2 py-1 text-sm"
                            >
                              <option value={1}>Minimal Elevation</option>
                              <option value={2}>Light Hills</option>
                              <option value={3}>Moderate Mountains</option>
                              <option value={4}>Steep Ascents</option>
                              <option value={5}>Alpine Style</option>
                            </select>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-800/80 p-3 rounded-lg border border-blue-900/30 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={navigationFeatures.weatherAlerts}
                          onChange={(e) => setNavigationFeatures(prev => ({
                            ...prev,
                            weatherAlerts: e.target.checked
                          }))}
                          className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                        />
                        <div>
                          <span className="text-white font-medium">Weather Insights</span>
                          <p className="text-gray-400 text-xs">Include weather alerts and forecasts</p>
                        </div>
                      </div>
                      {navigationFeatures.weatherAlerts && (
                        <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    
                    {navigationFeatures.weatherAlerts && (
                      <div className="mt-4 bg-black/30 p-3 rounded-lg border border-blue-900/20 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-blue-400 font-semibold">Weather Optimizations</label>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="flex items-center justify-between p-2 hover:bg-black/20 rounded-lg">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={navigationFeatures.weatherForecastIntegration}
                                onChange={(e) => setNavigationFeatures(prev => ({
                                  ...prev,
                                  weatherForecastIntegration: e.target.checked
                                }))}
                                className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                              />
                              <span className="text-white text-sm">Include Hourly Forecasts</span>
                            </div>
                            <div className="text-xs text-blue-300">Full Route</div>
                          </label>
                          
                          <label className="flex items-center justify-between p-2 hover:bg-black/20 rounded-lg">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={navigationFeatures.weatherPreferDry}
                                onChange={(e) => setNavigationFeatures(prev => ({
                                  ...prev,
                                  weatherPreferDry: e.target.checked
                                }))}
                                className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                              />
                              <span className="text-white text-sm">Prefer Dry Conditions</span>
                            </div>
                            <div className="text-xs text-blue-300">Less Precipitation</div>
                          </label>
                          
                          <label className="flex items-center justify-between p-2 hover:bg-black/20 rounded-lg">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={navigationFeatures.weatherOptimizeSunlight}
                                onChange={(e) => setNavigationFeatures(prev => ({
                                  ...prev,
                                  weatherOptimizeSunlight: e.target.checked
                                }))}
                                className="form-checkbox text-blue-500 rounded mr-3 h-5 w-5"
                              />
                              <span className="text-white text-sm">Optimize for Sunlight</span>
                            </div>
                            <div className="text-xs text-blue-300">Best Visibility</div>
                          </label>
                        </div>
                        
                        <div>
                          <label className="text-sm text-blue-400 font-semibold block mb-3">Preferred Temperature Range</label>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="bg-black/20 p-2 rounded-lg border border-gray-700">
                              <label className="text-xs text-gray-400 block mb-1">Minimum Temp</label>
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="120"
                                  value={navigationFeatures.weatherTempRange[0]}
                                  onChange={(e) => setNavigationFeatures(prev => ({
                                    ...prev,
                                    weatherTempRange: [parseInt(e.target.value), prev.weatherTempRange[1]]
                                  }))}
                                  className="w-16 bg-black/30 border border-gray-700 text-white rounded p-1 text-center mr-2"
                                />
                                <span className="text-blue-300 font-medium">°F</span>
                              </div>
                            </div>
                            
                            <div className="bg-black/20 p-2 rounded-lg border border-gray-700">
                              <label className="text-xs text-gray-400 block mb-1">Maximum Temp</label>
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="120"
                                  value={navigationFeatures.weatherTempRange[1]}
                                  onChange={(e) => setNavigationFeatures(prev => ({
                                    ...prev,
                                    weatherTempRange: [prev.weatherTempRange[0], parseInt(e.target.value)]
                                  }))}
                                  className="w-16 bg-black/30 border border-gray-700 text-white rounded p-1 text-center mr-2"
                                />
                                <span className="text-blue-300 font-medium">°F</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-full bg-blue-900/10 p-2 rounded-lg border border-blue-900/20 text-center">
                            <span className="text-sm text-white">Optimal Range: </span>
                            <span className="text-blue-300 font-semibold">
                              {navigationFeatures.weatherTempRange[0]}°F - {navigationFeatures.weatherTempRange[1]}°F
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                              For best drivetrain and tire performance
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-900/10 rounded-lg p-2 border border-blue-900/20">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-300 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="text-xs text-blue-300">
                              Weather insights require location permissions. Data powered by OpenWeather API.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Integration section fixed */}
          <div className="space-y-4">
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
              <div id="navigation-advanced-settings" className="bg-gray-900 p-4 rounded-lg border border-gray-800 space-y-5">
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
                
                {/* Advanced Route Optimization */}
                <div>
                  <h3 className="text-green-400 font-orbitron text-md mb-2">Route Optimization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Traffic Avoidance Strategy</label>
                      <select 
                        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        value={navigationFeatures.trafficAvoidance || 'moderate'}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, trafficAvoidance: e.target.value})}
                      >
                        <option value="none">None - Follow Main Route</option>
                        <option value="light">Light - Minor Detours Only</option>
                        <option value="moderate">Moderate - Avoid Major Delays</option>
                        <option value="aggressive">Aggressive - Best Time Priority</option>
                        <option value="max">Maximum - Avoid All Traffic</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Road Type Preference</label>
                      <select 
                        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        value={navigationFeatures.roadTypePreference || 'balanced'}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, roadTypePreference: e.target.value})}
                      >
                        <option value="highways">Highway Priority</option>
                        <option value="balanced">Balanced</option>
                        <option value="scenic">Scenic Routes</option>
                        <option value="enthusiast">Enthusiast Roads</option>
                        <option value="trackday">Track Day Approach</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={navigationFeatures.avoidFerries || false}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, avoidFerries: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Avoid Ferries</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={navigationFeatures.optimizeForSportsCars || false}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, optimizeForSportsCars: e.target.checked})}
                        className="form-checkbox text-green-500"
                      />
                      <span>Sports Car Optimization</span>
                    </label>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-gray-300 text-sm mb-1">Route Complexity</label>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 w-20">Simple</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={navigationFeatures.complexityLevel || 3}
                        onChange={(e) => setNavigationFeatures({...navigationFeatures, complexityLevel: parseInt(e.target.value)})}
                        className="flex-grow mx-2"
                      />
                      <span className="text-xs text-gray-400 w-20 text-right">Complex</span>
                    </div>
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

      {/* Advanced Ferrari Telemetry Panel */}
      {selectedVehicle && (
        <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-red-500 font-orbitron text-2xl">Ferrari Performance Telemetry</h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">LIVE</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">TIRE PRESSURE ADJ</div>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{tirePressureAdjustment >= 0 ? '+' : ''}{tirePressureAdjustment} PSI</span>
                <button 
                  onClick={() => setTirePressureAdjustment(prev => Math.min(prev + 0.5, 3))}
                  className="text-green-500 hover:text-green-400 px-2 py-1 rounded"
                >+</button>
                <button 
                  onClick={() => setTirePressureAdjustment(prev => Math.max(prev - 0.5, -3))}
                  className="text-red-500 hover:text-red-400 px-2 py-1 rounded"
                >-</button>
              </div>
            </div>
            
            <div className="bg-black rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">TORQUE MAP</div>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{torqueAdjustment >= 0 ? '+' : ''}{torqueAdjustment} ft-lb</span>
                <button 
                  onClick={() => setTorqueAdjustment(prev => Math.min(prev + 1, 10))}
                  className="text-green-500 hover:text-green-400 px-2 py-1 rounded"
                >+</button>
                <button 
                  onClick={() => setTorqueAdjustment(prev => Math.max(prev - 1, -10))}
                  className="text-red-500 hover:text-red-400 px-2 py-1 rounded"
                >-</button>
              </div>
            </div>
            
            <div className="bg-black rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">MANETTINO MODE</div>
              <select
                value={drivingMode}
                onChange={(e) => setDrivingMode(e.target.value)}
                className="w-full bg-transparent text-white border-0 p-0 focus:ring-0"
              >
                <option value="Wet">WET</option>
                <option value="Comfort">COMFORT</option>
                <option value="Sport">SPORT</option>
                <option value="Sport+">SPORT+</option>
                <option value="Race">RACE</option>
                <option value="ESC Off">ESC OFF</option>
              </select>
            </div>
            
            <div className="bg-black rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">CURRENT GRIP LEVEL</div>
              <div className="text-white font-medium">
                {weatherData ? calculateTireGripLevel(weatherData.surfaceTemp, vehicleSpecs[selectedVehicle].optimumTireTemp).level : 'Unknown'}
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ 
                  width: weatherData ? `${calculateTireGripLevel(weatherData.surfaceTemp, vehicleSpecs[selectedVehicle].optimumTireTemp).percentage}%` : '0%' 
                }}></div>
              </div>
            </div>
          </div>
          
          {/* Pro Enthusiast Tuning Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-blue-400 font-orbitron text-lg flex items-center">
                <span className="text-yellow-500 mr-2">⚡</span> Pro Enthusiast Settings
              </h3>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-yellow-500">INFLUENCER GRADE</span>
                <div className="w-4 h-4 rounded-sm bg-yellow-500"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Suspension Tuning */}
              <div className="bg-black/70 rounded-lg p-3 border border-gray-800">
                <div className="text-gray-400 text-xs mb-2">FRONT SUSPENSION</div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Compression</span>
                    <div className="w-20 bg-gray-800 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{width: "65%"}}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Rebound</span>
                    <div className="w-20 bg-gray-800 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{width: "55%"}}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Anti-Roll</span>
                    <div className="w-20 bg-gray-800 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{width: "70%"}}></div>
                    </div>
                  </div>
                  <button className="mt-2 text-xs bg-gray-800 hover:bg-gray-700 text-white py-1 px-2 rounded">
                    Fine Tune
                  </button>
                </div>
              </div>
              
              {/* Rear Suspension */}
              <div className="bg-black/70 rounded-lg p-3 border border-gray-800">
                <div className="text-gray-400 text-xs mb-2">REAR SUSPENSION</div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Compression</span>
                    <div className="w-20 bg-gray-800 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{width: "75%"}}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Rebound</span>
                    <div className="w-20 bg-gray-800 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{width: "60%"}}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Anti-Roll</span>
                    <div className="w-20 bg-gray-800 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{width: "65%"}}></div>
                    </div>
                  </div>
                  <button className="mt-2 text-xs bg-gray-800 hover:bg-gray-700 text-white py-1 px-2 rounded">
                    Fine Tune
                  </button>
                </div>
              </div>
              
              {/* Tire Temperature Management */}
              <div className="bg-black/70 rounded-lg p-3 border border-gray-800">
                <div className="text-gray-400 text-xs mb-2">TIRE TEMP MANAGEMENT</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Optimal Window</span>
                    <span className="text-xs text-white">{vehicleSpecs[selectedVehicle].optimumTireTemp - 10}°F - {vehicleSpecs[selectedVehicle].optimumTireTemp + 10}°F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Surface Temp</span>
                    <span className="text-xs text-white">{weatherData?.surfaceTemp || '--'}°F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Warm-up Time</span>
                    <span className="text-xs text-white">{weatherData ? Math.max(3, Math.round(10 - weatherData.surfaceTemp / 20)) : '--'} min</span>
                  </div>
                  <button className="mt-1 text-xs bg-gray-800 hover:bg-gray-700 text-white py-1 px-2 rounded">
                    Heating Strategy
                  </button>
                </div>
              </div>
              
              {/* Aero Settings */}
              <div className="bg-black/70 rounded-lg p-3 border border-gray-800">
                <div className="text-gray-400 text-xs mb-2">AERO SETTINGS</div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Front Wing</span>
                    <div className="flex items-center gap-1">
                      <button className="text-red-500 hover:text-red-400 px-1">-</button>
                      <span className="text-white">7</span>
                      <button className="text-green-500 hover:text-green-400 px-1">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Rear Wing</span>
                    <div className="flex items-center gap-1">
                      <button className="text-red-500 hover:text-red-400 px-1">-</button>
                      <span className="text-white">5</span>
                      <button className="text-green-500 hover:text-green-400 px-1">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Ride Height</span>
                    <div className="flex items-center gap-1">
                      <button className="text-red-500 hover:text-red-400 px-1">-</button>
                      <span className="text-white">3</span>
                      <button className="text-green-500 hover:text-green-400 px-1">+</button>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-400 italic">
                    Wind: {weatherData?.startWeather.wind.speed || '--'} mph
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-4 border border-gray-800">
              <h3 className="text-blue-400 text-sm font-semibold mb-2">ROAD CONDITIONS</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <div className="text-gray-400 text-xs">Surface Type</div>
                  <div className="text-white">{weatherData?.roadCondition?.includes('Wet') ? 'Wet Asphalt' : 'Dry Asphalt'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Surface Temp</div>
                  <div className="text-white">{weatherData?.surfaceTemp}°F</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Air Temp</div>
                  <div className="text-white">{weatherData?.startWeather.main.temp}°F</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Wind</div>
                  <div className="text-white">{weatherData?.startWeather.wind.speed} mph</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-4 border border-gray-800">
              <h3 className="text-blue-400 text-sm font-semibold mb-2">PERFORMANCE IMPACT</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <div className="text-gray-400 text-xs">Power Delivery</div>
                  <div className="text-white">
                    {weatherData ? (
                      <>
                        {calculatePowerAdjustment(weatherData.startWeather.main.temp, weatherData.startWeather.main.humidity)}% 
                        {calculatePowerAdjustment(weatherData.startWeather.main.temp, weatherData.startWeather.main.humidity) > 0 ? '↑' : '↓'}
                      </>
                    ) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Torque Output</div>
                  <div className="text-white">
                    {weatherData ? (
                      <>
                        {calculateTorqueAdjustment(weatherData.surfaceTemp, weatherData.startWeather.main.humidity)}% 
                        {calculateTorqueAdjustment(weatherData.surfaceTemp, weatherData.startWeather.main.humidity) > 0 ? '↑' : '↓'}
                      </>
                    ) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Braking Distance</div>
                  <div className="text-white">{weatherData ? `${calculateBrakingEfficiency(weatherData.surfaceTemp, weatherData.startWeather.main.humidity)}%` : 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Cooling</div>
                  <div className="text-white">{weatherData ? calculateCoolingEfficiency(weatherData.startWeather.main.temp, weatherData.startWeather.wind.speed, weatherData.startWeather.main.humidity) : 'Unknown'}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CarWow Style Recommendations */}
          <div className="mt-6 bg-black/40 rounded-lg p-4 border border-blue-900/30">
            <h3 className="text-blue-400 text-sm font-semibold mb-2">CARWOW PRO RECOMMENDATIONS</h3>
            <ul className="space-y-2">
              {performanceRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-white text-sm">{rec}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-white text-sm">
                  Record your drive footage to share on social media with built-in route overlay
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">→</span>
                <span className="text-white text-sm">
                  {drivingMode === 'Sport+' || drivingMode === 'Race' ? 
                    'Race mode activated - telemetry data will be saved for lap time analysis' : 
                    'Switch to Race mode for full telemetry recording and lap time analysis'}
                </span>
              </li>
            </ul>
          </div>
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

      {/* Route Planning Button - Removed as requested */}
      
      {/* Drive Journal Integration & Navigation Launch Section */}
      {routeWaypoints.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-700 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-blue-400 font-orbitron text-2xl">Drive Journal Integration</h2>
            <div className="bg-gray-800 px-3 py-1 rounded-full text-sm text-green-400 border border-green-600">
              Route Ready
            </div>
          </div>
          
          <div className="bg-gray-900 p-5 rounded-lg shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-green-500 font-semibold mb-3">Telemetry Data to Record</h3>
                <div className="space-y-3">
                  <div className="bg-black bg-opacity-40 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Route Curvature Metrics:</span>
                      <span className="text-white font-medium">
                        {navigationFeatures.curvyRoads 
                          ? getIntensityTRNRange(navigationFeatures.curveIntensity || 3)
                          : "Standard (2-4 TRN/km)"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-40 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Weather Conditions:</span>
                      <span className="text-white font-medium">
                        {weatherData?.current?.weather[0]?.main || "Unknown"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-40 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Selected Vehicle:</span>
                      <span className="text-white font-medium">
                        {selectedVehicle || "None Selected"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-40 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Drive Profile:</span>
                      <span className="text-white font-medium">
                        {selectedDrivingProfile || drivingMode || "Standard"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-green-500 font-semibold mb-3">Journal Data & Navigation</h3>
                <div className="space-y-4">
                  <div className="bg-black bg-opacity-40 p-4 rounded-lg">
                    <p className="text-white mb-2">Your route with all performance settings will be automatically recorded in your Drive Journal.</p>
                    <p className="text-gray-300 text-sm">This includes curvature metrics, weather conditions, vehicle specs, tire data, and all route customizations.</p>
                  </div>
                  
                  <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-800">
                    <h4 className="text-blue-400 font-medium mb-2">Enthusiast Edge Data Collection:</h4>
                    <ul className="text-gray-300 text-sm space-y-1 list-disc pl-5">
                      <li>Route curvature percentage and TRN metrics</li>
                      <li>Road surface temperatures and conditions</li>
                      <li>Elevation changes and gradient percentages</li>
                      <li>Cornering load factors and g-forces</li>
                      <li>Weather impact on vehicle performance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Launch Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleRoutePlanSubmit}
                disabled={!startLocation || !endLocation}
                className={`flex items-center gap-2 text-lg px-10 py-4 rounded-lg font-orbitron shadow-lg transform transition-all duration-300 ${
                  !startLocation || !endLocation
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 text-white hover:scale-105 hover:shadow-xl"
                }`}
              >
                <span>Launch Navigation & Log to Journal</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Route Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-900 border border-blue-500 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-blue-400 font-orbitron text-2xl">Drive Journal Entry</h2>
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Route Information */}
                <div className="bg-black bg-opacity-50 rounded-lg p-4">
                  <h3 className="text-green-500 font-semibold text-lg mb-3">Route Information</h3>
                  <div className="space-y-2 text-gray-200">
                    <p><span className="text-gray-400">From:</span> {startLocation}</p>
                    <p><span className="text-gray-400">To:</span> {endLocation}</p>
                    {waypoints.length > 0 && (
                      <div>
                        <p className="text-gray-400">Via:</p>
                        <ul className="list-disc pl-5 text-sm">
                          {waypoints.map((waypoint, index) => (
                            <li key={index}>{waypoint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p><span className="text-gray-400">Navigation App:</span> {preferredNavApp}</p>
                    <p><span className="text-gray-400">Journey Type:</span> {routeCustomizations.roundTrip ? 'Round Trip' : 'One Way'}</p>
                  </div>
                </div>
                
                {/* Vehicle Information */}
                <div className="bg-black bg-opacity-50 rounded-lg p-4">
                  <h3 className="text-green-500 font-semibold text-lg mb-3">Vehicle Telemetry</h3>
                  {selectedVehicle ? (
                    <div className="space-y-2 text-gray-200">
                      <p><span className="text-gray-400">Vehicle:</span> {selectedVehicle}</p>
                      {vehicleSpecs[selectedVehicle] && (
                        <>
                          <p><span className="text-gray-400">Torque Setting:</span> {vehicleSpecs[selectedVehicle].torqueSetting} ft-lb</p>
                          <p><span className="text-gray-400">Optimal Tire Pressure:</span> Front {vehicleSpecs[selectedVehicle].optimalTirePressureFront} PSI / Rear {vehicleSpecs[selectedVehicle].optimalTirePressureRear} PSI</p>
                          <p><span className="text-gray-400">Drivetrain:</span> {vehicleSpecs[selectedVehicle].drivetrainType}</p>
                        </>
                      )}
                      <p><span className="text-gray-400">Driving Mode:</span> {drivingMode}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400">No vehicle selected</p>
                  )}
                </div>
              </div>
              
              {/* Enthusiast Metrics & Route Analytics */}
              <div className="bg-black bg-opacity-50 rounded-lg p-4">
                <h3 className="text-green-500 font-semibold text-lg mb-3">Enthusiast Metrics & Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Curvature Analysis */}
                  <div className="space-y-1">
                    <p className="text-blue-400 font-medium">Route Curvature Analysis</p>
                    <p className="text-gray-400">TRN Range:</p>
                    <p className="text-white">{getIntensityTRNRange(navigationFeatures.curveIntensity || 3)}</p>
                    <p className="text-gray-400 mt-2">Estimated Corner Count:</p>
                    <p className="text-white">
                      {navigationFeatures.curveIntensity === 1 ? "Low (0-20 turns)" :
                       navigationFeatures.curveIntensity === 2 ? "Moderate (20-45 turns)" :
                       navigationFeatures.curveIntensity === 3 ? "Medium (45-70 turns)" :
                       navigationFeatures.curveIntensity === 4 ? "High (70-100 turns)" :
                       "Very High (100+ turns)"}
                    </p>
                  </div>
                  
                  {/* Weather Impact */}
                  <div className="space-y-1">
                    <p className="text-blue-400 font-medium">Weather Conditions</p>
                    <p className="text-gray-400">Current Weather:</p>
                    <p className="text-white">{weatherData?.current?.weather[0]?.description || 'Unknown'} ({weatherData?.current?.temp || '?'}°F)</p>
                    <p className="text-gray-400 mt-2">Surface Condition:</p>
                    <p className="text-white">{weatherData?.current?.weather[0]?.main === 'Rain' ? 'Wet' : 'Dry'}</p>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="space-y-1">
                    <p className="text-blue-400 font-medium">Performance Metrics</p>
                    <p className="text-gray-400">Tire Performance:</p>
                    <p className="text-white">
                      {weatherData?.current?.temp < 50 ? 'Suboptimal - Cold' :
                       weatherData?.current?.temp > 100 ? 'Suboptimal - Hot' :
                       'Optimal Range'}
                    </p>
                    <p className="text-gray-400 mt-2">Grip Estimate:</p>
                    <p className="text-white">
                      {weatherData?.current?.weather[0]?.main === 'Rain' ? 'Reduced (Wet)' :
                       weatherData?.current?.weather[0]?.main === 'Snow' ? 'Poor (Snow/Ice)' :
                       weatherData?.current?.humidity > 80 ? 'Moderate (High Humidity)' :
                       'Optimal (Dry)'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Events & Cultural Spots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedEvents.length > 0 && (
                  <div className="bg-black bg-opacity-50 rounded-lg p-4">
                    <h3 className="text-green-500 font-semibold text-lg mb-3">Selected Events ({selectedEvents.length})</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                      {selectedEvents.map(event => (
                        <li key={event.id}>{event.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedSpots.length > 0 && (
                  <div className="bg-black bg-opacity-50 rounded-lg p-4">
                    <h3 className="text-green-500 font-semibold text-lg mb-3">Selected Spots ({selectedSpots.length})</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                      {selectedSpots.map(spot => (
                        <li key={spot.id}>{spot.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleAutoLogDrive}
                  className="bg-green-600 hover:bg-green-500 text-white font-montserrat px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Add to Drive Journal
                </button>
                
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-montserrat px-6 py-3 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Drive Media Collection - Photos, Videos, Voice Notes */}
      {!gpsTrackingEnabled && (
        <div className="mt-12 mb-8 max-w-6xl mx-auto">
          <div className="bg-gray-900/80 rounded-lg p-6 border border-blue-900/40">
            <h2 className="text-blue-400 font-orbitron text-xl mb-4 flex items-center">
              <span className="mr-2">📸</span> Drive Media Collection
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Photo Gallery */}
              <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                <h3 className="text-green-500 font-semibold mb-2 text-md uppercase tracking-wide flex items-center">
                  <span className="mr-2">🖼️</span> Photo Gallery
                  <span className="ml-2 text-xs text-gray-400">({carPhotos.length}/5)</span>
                </h3>
                
                <div className="mb-3">
                  <label className="relative flex justify-center items-center p-4 border-2 border-dashed border-blue-500/40 rounded-lg hover:border-blue-500/80 transition-colors cursor-pointer bg-gray-900/50">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-blue-400 font-medium">Click to add car photos</p>
                      <p className="text-xs text-gray-400">JPG, PNG, WEBP (max 5 photos)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                
                {photoPreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {photoPreviewUrls.map((url, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden aspect-video">
                        <img src={url} alt={`Car photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Video Gallery */}
              <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                <h3 className="text-green-500 font-semibold mb-2 text-md uppercase tracking-wide flex items-center">
                  <span className="mr-2">🎬</span> Video Gallery
                  <span className="ml-2 text-xs text-gray-400">({carVideos.length}/3)</span>
                </h3>
                
                <div className="mb-3">
                  <label className="relative flex justify-center items-center p-4 border-2 border-dashed border-purple-500/40 rounded-lg hover:border-purple-500/80 transition-colors cursor-pointer bg-gray-900/50">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-purple-400 font-medium">Click to add car videos</p>
                      <p className="text-xs text-gray-400">MP4, WebM (max 3 videos, 100MB each)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="video/*" 
                      multiple 
                      className="hidden" 
                      onChange={handleVideoUpload}
                    />
                  </label>
                </div>
                
                {videoPreviewUrls.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {videoPreviewUrls.map((url, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden">
                        <video 
                          src={url} 
                          controls 
                          className="w-full rounded-lg border border-gray-700" 
                          preload="metadata"
                        />
                        <button
                          onClick={() => removeVideo(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Voice Notes */}
              <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                <h3 className="text-green-500 font-semibold mb-2 text-md uppercase tracking-wide flex items-center">
                  <span className="mr-2">🎙️</span> Voice Notes
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700 flex flex-col items-center">
                    {!isRecording && !audioUrl && (
                      <button
                        onClick={startRecording}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center gap-2 w-full justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Start Recording
                      </button>
                    )}
                    
                    {isRecording && (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-red-500 font-mono text-sm animate-pulse flex items-center">
                            <span className="h-3 w-3 bg-red-500 rounded-full mr-2 animate-ping"></span>
                            REC
                          </div>
                          <div className="text-white font-mono">
                            {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                        
                        <button
                          onClick={stopRecording}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center gap-2 w-full justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                          Stop Recording
                        </button>
                      </div>
                    )}
                    
                    {audioUrl && !isRecording && (
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-blue-400 font-mono text-sm">Voice Note Recorded</div>
                          <div className="text-gray-400 font-mono text-xs">
                            {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={playRecording}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Play
                          </button>
                          
                          <button
                            onClick={deleteRecording}
                            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={startRecording}
                            className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center text-xs text-gray-400">
                    <p>All media will be automatically packaged and synchronized to your Drive Journal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        
      {/* Ferrari-inspired Start GPS Button at the bottom of the page */}
      {!gpsTrackingEnabled && (
        <div className="mt-6 mb-16 flex flex-col items-center">
          <div className="bg-black/30 rounded-2xl p-8 w-full max-w-2xl border border-red-600/30 shadow-xl">
            <div className="text-center mb-4">
              <h3 className="text-red-500 font-orbitron text-2xl uppercase tracking-widest">Ready to Drive</h3>
              <p className="text-gray-400 italic">Complete your route planning and activate GPS tracking</p>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={startGpsTracking}
                disabled={!startLocation || !endLocation || !selectedVehicle}
                className={`
                  relative group
                  ${!startLocation || !endLocation || !selectedVehicle ? 
                    'opacity-60 cursor-not-allowed' : 
                    'hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.5)]'
                  }
                  transition-all duration-300 ease-in-out
                  flex items-center justify-center 
                  w-60 h-60 rounded-full 
                  bg-gradient-to-br from-red-700 via-red-600 to-red-800
                  border-8 border-gray-800
                  shadow-[0_0_30px_rgba(220,38,38,0.3)]
                `}
              >
                {/* Outer ring with carbon fiber texture */}
                <div className="absolute inset-0 rounded-full bg-gray-900 bg-opacity-30 border-4 border-red-700 overflow-hidden">
                  {/* Carbon fiber pattern */}
                  <div className="absolute inset-0 opacity-10" style={{ 
                    backgroundImage: 'repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 1px, transparent 8px), repeating-linear-gradient(135deg, #222 0, #222 1px, transparent 1px, transparent 8px)',
                    backgroundSize: '8px 8px'
                  }}></div>
                </div>
                
                {/* Inner circle - resembling Ferrari start button */}
                <div className="absolute inset-8 rounded-full bg-black border-4 border-red-700 flex items-center justify-center z-10 shadow-inner">
                  {/* Button text */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-orbitron text-lg text-white tracking-wider">START</span>
                    <span className="font-orbitron text-3xl text-red-500 font-bold tracking-wider mb-1">GPS</span>
                    
                    {/* Ferrari-inspired Sports Car icon with glow effect */}
                    <div className="mt-1 relative">
                      <div className="absolute inset-0 blur-sm bg-red-500 opacity-30 rounded-full"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-16 h-12 text-red-500 group-hover:animate-pulse relative z-10">
                        <path d="M96 256c0-8.8 7.2-16 16-16h67.3c5.5 0 10.7 2.9 13.6 7.5l22.3 35.7c2.9 4.7 8.1 7.5 13.6 7.5h44.4c5.5 0 10.7-2.9 13.6-7.5l22.3-35.7c2.9-4.7 8.1-7.5 13.6-7.5H390.4c8.8 0 16 7.2 16 16v24c0 8.8-7.2 16-16 16h-9c-33.4 0-60.4 27-60.4 60.4v43c0 8.2-6 15-14 16.2c-9.1 1.3-17-6-17-15V384.4c0-16.5-13.5-30-30-30s-30 13.5-30 30v16.2c0 9-7.9 16.3-17 15c-8-1.1-14-8-14-16.2v-43c0-33.4-27-60.4-60.4-60.4H112c-8.8 0-16-7.2-16-16V256zm-32 0v24c0 26.5 21.5 48 48 48h9c15.1 0 27.3 12.2 27.3 27.3v43c0 37.2 29.3 67.6 66.4 67.6c33.4 0 61.3-24.4 66.1-56.6c4.9 32.1 32.9 56.6 66.1 56.6c37.1 0 66.4-30.4 66.4-67.6v-43c0-15.1 12.2-27.3 27.3-27.3h9c26.5 0 48-21.5 48-48V256c0-26.5-21.5-48-48-48H322.8l-11.2 17.8c-8.7 14-24.3 22.5-40.9 22.5H233.2c-16.6 0-32.3-8.6-40.9-22.5L181.2 208H112c-26.5 0-48 21.5-48 48zm368 32a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zm-320 0a16 16 0 1 0 -32 0 16 16 0 1 0 32 0z"/>
                      </svg>
                    </div>
                    
                    <span className="mt-2 text-xs text-gray-400 font-medium">Click to Begin Journey</span>
                  </div>
                </div>
                
                {/* Pulsing effect */}
                <div className="absolute inset-0 rounded-full bg-red-500 opacity-0 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700 ease-out"></div>
                
                {/* Ferrari-inspired metal ring */}
                <div className="absolute -inset-1 rounded-full border-2 border-gray-700 opacity-30"></div>
                
                {/* Speed indicator marks resembling Ferrari tachometer */}
                <div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-1 h-3 bg-gray-300 opacity-50" 
                      style={{ 
                        top: '50%', 
                        left: '50%', 
                        transformOrigin: '0 -116px',
                        transform: `rotate(${i * 30}deg) translateX(-50%)` 
                      }} 
                    />
                  ))}
                </div>
              </button>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-black/50 rounded-lg">
                <p className="text-gray-400 text-xs">Route Status</p>
                <p className="text-white font-medium">
                  {!startLocation || !endLocation 
                    ? "Incomplete" 
                    : "Ready"}
                </p>
              </div>
              
              <div className="p-3 bg-black/50 rounded-lg">
                <p className="text-gray-400 text-xs">Vehicle Status</p>
                <p className="text-white font-medium">
                  {!selectedVehicle 
                    ? "Not Selected" 
                    : "Ready"}
                </p>
              </div>
              
              <div className="p-3 bg-black/50 rounded-lg">
                <p className="text-gray-400 text-xs">Weather</p>
                <p className="text-white font-medium">
                  {weatherData?.current?.weather[0]?.main || "Checking..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlannerPage;