// /client/src/pages/RoutePlannerPage.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { getWeatherData, getOneCallData } from '@/services/openWeatherService';
import CarEventsExplorer from '@/components/CarEventsExplorer';
import CarCultureSpotsExplorer from '@/components/CarCultureSpotsExplorer';
// Removed heatmap import
import { StrutEvent } from '@/services/strutAPI';
import { CarCultureSpot } from '@/services/speedhuntersAPI';
import { Users, MapPin, Wind, Thermometer, Droplets, Sun, CloudRain, BarChart3, Compass, Mountain, Clock, RotateCw, Activity } from 'lucide-react';

// Types for vehicle data
interface VehiclePerformanceData {
  id: number;
  make: string;
  model: string;
  year: number;
  imageUrl: string;
  specs: {
    engine: string;
    power: string;
    torque: string;
    weight: string;
    transmission: string;
  };
  performanceData: {
    zeroToSixty: number;
    quarterMile: number;
    topSpeed: number;
    braking60to0: number;
    lateralGrip: number;
  };
  telemetryPresets: {
    optimumTireTemp: number;
    optimumOilTemp: number;
    optimumCoolantTemp: number;
    redline: number;
    optimalShiftRpm: number;
    fuelMixture: number;
    aeroBalance: number;
  };
}

// Weather data interface
interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
  sys: {
    country: string;
  };
  visibility: number;
  clouds: {
    all: number;
  };
  dt: number;
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
}

// One Call API response interface
interface OneCallData {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    rain?: {
      '1h'?: number;
    };
    snow?: {
      '1h'?: number;
    };
  };
  hourly: Array<{
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number;
    rain?: {
      '1h'?: number;
    };
    snow?: {
      '1h'?: number;
    };
  }>;
  daily: Array<{
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    temp: {
      day: number;
      min: number;
      max: number;
      night: number;
      eve: number;
      morn: number;
    };
    feels_like: {
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: number;
    pop: number;
    rain?: number;
    snow?: number;
    uvi: number;
  }>;
}

// Main component
const RoutePlannerPage: React.FC = () => {
  // References and states
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePerformanceData | null>(null);
  const [waypoints, setWaypoints] = useState<google.maps.LatLngLiteral[]>([]);
  const [routeStats, setRouteStats] = useState<{
    distance: number;
    duration: number;
    elevationGain: number;
    elevationLoss: number;
    turns: number;
    straightaways: number;
    technicalSections: number;
  }>({
    distance: 0,
    duration: 0,
    elevationGain: 0,
    elevationLoss: 0,
    turns: 0,
    straightaways: 0,
    technicalSections: 0,
  });
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [oneCallData, setOneCallData] = useState<OneCallData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    locationName: string;
  }>({
    lat: 36.1627,
    lng: -86.7816,
    locationName: "Nashville, TN"
  });
  
  const [isPreDriveMode, setIsPreDriveMode] = useState<boolean>(false);
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState<boolean>(false);
  const [routeSaved, setRouteSaved] = useState<boolean>(false);
  const [performanceRecommendations, setPerformanceRecommendations] = useState<string[]>([]);
  const [showPerformanceDetails, setShowPerformanceDetails] = useState<boolean>(false);
  const [tireCompound, setTireCompound] = useState<"soft" | "medium" | "hard">("medium");
  const [tirePressureAdjustment, setTirePressureAdjustment] = useState<number>(0);
  const [trackConditionWarnings, setTrackConditionWarnings] = useState<string[]>([]);
  const [trackDrivability, setTrackDrivability] = useState<number>(85);
  const [roadSurfaceCondition, setRoadSurfaceCondition] = useState<string>("Dry");
  const [nearbyEvents, setNearbyEvents] = useState<StrutEvent[]>([]);
  const [nearbyCultureSpots, setNearbyCultureSpots] = useState<CarCultureSpot[]>([]);
  const [showEventsExplorer, setShowEventsExplorer] = useState<boolean>(false);
  const [showCultureSpotsExplorer, setShowCultureSpotsExplorer] = useState<boolean>(false);
  const [telemetryHistory, setTelemetryHistory] = useState<Array<{
    timestamp: number;
    lat: number;
    lng: number;
    speed: number;
    acceleration: number;
    lateralG: number;
    elevation: number;
    gradient: number;
    temp: number;
  }>>([]);
  
  const [trackHistory, setTrackHistory] = useState<Array<{
    lat: number;
    lng: number;
    timestamp: number;
  }>>([]);
  
  const [telemetryStats, setTelemetryStats] = useState<{
    currentSpeed: number;
    maxSpeed: number;
    avgSpeed: number;
    maxAcceleration: number;
    maxDeceleration: number;
    maxLateralG: number;
    currentElevation: number;
    maxElevation: number;
    minElevation: number;
    currentGradient: number;
    maxGradient: number;
    minGradient: number;
    distanceTraveled: number;
    elapsedTime: number;
    speedVariance: number;
    avgCorneringG: number;
  }>({
    currentSpeed: 0,
    maxSpeed: 0,
    avgSpeed: 0,
    maxAcceleration: 0,
    maxDeceleration: 0,
    maxLateralG: 0,
    currentElevation: 0,
    maxElevation: 0,
    minElevation: 0,
    currentGradient: 0,
    maxGradient: 0,
    minGradient: 0,
    distanceTraveled: 0,
    elapsedTime: 0,
    speedVariance: 0,
    avgCorneringG: 0,
  });
  
  const [showTelemetryDetails, setShowTelemetryDetails] = useState<boolean>(false);
  
  // Demo vehicles data
  const vehicles: VehiclePerformanceData[] = [
    {
      id: 1,
      make: "Porsche",
      model: "911 GT3",
      year: 2022,
      imageUrl: "https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png",
      specs: {
        engine: "4.0L Flat-6",
        power: "502 hp @ 8,400 rpm",
        torque: "346 lb-ft @ 6,100 rpm",
        weight: "3,126 lbs",
        transmission: "7-spd PDK"
      },
      performanceData: {
        zeroToSixty: 3.2,
        quarterMile: 11.3,
        topSpeed: 197,
        braking60to0: 97,
        lateralGrip: 1.15
      },
      telemetryPresets: {
        optimumTireTemp: 185,
        optimumOilTemp: 230,
        optimumCoolantTemp: 190,
        redline: 9000,
        optimalShiftRpm: 8400,
        fuelMixture: 14.7,
        aeroBalance: 45
      }
    },
    {
      id: 2,
      make: "BMW",
      model: "M3 Competition",
      year: 2022,
      imageUrl: "https://www.bmwusa.com/content/dam/bmwusa/M-Model-2021/M3-Sedan/Overview/BMW-MY22-M3CompSedan-Overview-Hero-Desktop.jpg",
      specs: {
        engine: "3.0L Twin-Turbo I6",
        power: "503 hp @ 6,250 rpm",
        torque: "479 lb-ft @ 2,750 rpm",
        weight: "3,840 lbs",
        transmission: "8-spd Auto"
      },
      performanceData: {
        zeroToSixty: 3.8,
        quarterMile: 11.6,
        topSpeed: 180,
        braking60to0: 104,
        lateralGrip: 1.02
      },
      telemetryPresets: {
        optimumTireTemp: 180,
        optimumOilTemp: 235,
        optimumCoolantTemp: 195,
        redline: 7200,
        optimalShiftRpm: 6250,
        fuelMixture: 12.5,
        aeroBalance: 40
      }
    },
    {
      id: 3,
      make: "Chevrolet",
      model: "Corvette Z06",
      year: 2023,
      imageUrl: "https://www.corvetteblogger.com/images/content/2022/012122_2.jpg",
      specs: {
        engine: "5.5L Flat-Plane V8",
        power: "670 hp @ 8,400 rpm",
        torque: "460 lb-ft @ 6,300 rpm",
        weight: "3,434 lbs",
        transmission: "8-spd DCT"
      },
      performanceData: {
        zeroToSixty: 2.6,
        quarterMile: 10.5,
        topSpeed: 195,
        braking60to0: 94,
        lateralGrip: 1.22
      },
      telemetryPresets: {
        optimumTireTemp: 190,
        optimumOilTemp: 240,
        optimumCoolantTemp: 200,
        redline: 8600,
        optimalShiftRpm: 8400,
        fuelMixture: 13.2,
        aeroBalance: 50
      }
    },
    {
      id: 4,
      make: "Ferrari",
      model: "296 GTB",
      year: 2022,
      imageUrl: "https://www.motortrend.com/uploads/sites/5/2021/06/2022-Ferrari-296-GTB-7.jpg",
      specs: {
        engine: "3.0L Twin-Turbo V6 Hybrid",
        power: "819 hp combined",
        torque: "546 lb-ft combined",
        weight: "3,241 lbs",
        transmission: "8-spd DCT"
      },
      performanceData: {
        zeroToSixty: 2.9,
        quarterMile: 10.2,
        topSpeed: 205,
        braking60to0: 93,
        lateralGrip: 1.17
      },
      telemetryPresets: {
        optimumTireTemp: 195,
        optimumOilTemp: 245,
        optimumCoolantTemp: 205,
        redline: 8500,
        optimalShiftRpm: 7500,
        fuelMixture: 14.2,
        aeroBalance: 55
      }
    }
  ];
  
  // Helper functions
  const calculateAirDensity = (tempC: number, pressureHpa: number, humidityPercent: number): number => {
    // Formula for air density calculation
    const Rd = 287.05; // Specific gas constant for dry air (J/(kg·K))
    const tempK = tempC + 273.15; // Convert to Kelvin
    const pressurePa = pressureHpa * 100; // Convert hPa to Pa
    
    // Saturation vapor pressure (Magnus formula)
    const es = 6.1078 * Math.pow(10, (7.5 * tempC) / (tempC + 237.3));
    
    // Actual vapor pressure
    const e = es * (humidityPercent / 100);
    
    // Density calculation (simplified)
    const density = (pressurePa / (Rd * tempK)) * (1 - (0.378 * e / pressurePa));
    
    return density;
  };
  
  const calculateAFR = (temp: number, humidity: number, elevation: number): number => {
    // Base AFR (Air-Fuel Ratio) is around 14.7:1 for stoichiometric combustion
    let baseAFR = 14.7;
    
    // Adjust for temperature (hotter air is less dense)
    const tempAdjustment = (70 - temp) * 0.01;
    
    // Adjust for humidity (more humid air has less oxygen)
    const humidityAdjustment = (50 - humidity) * 0.005;
    
    // Adjust for elevation (higher elevation has less dense air)
    const elevationAdjustment = -elevation * 0.0001;
    
    // Calculate adjusted AFR
    const adjustedAFR = baseAFR + tempAdjustment + humidityAdjustment + elevationAdjustment;
    
    return adjustedAFR;
  };
  
  const getRoadConditionFromWeather = (weatherId: number, temp: number): string => {
    // Weather condition codes from OpenWeather API
    if (weatherId >= 200 && weatherId < 600) {
      return 'Wet - Reduced Traction';
    } else if (weatherId >= 600 && weatherId < 700) {
      return 'Hazardous - Snow Covered';
    } else if (weatherId >= 700 && weatherId < 800) {
      return 'Reduced Visibility';
    } else if (temp < 36 && weatherId >= 800) {
      return 'Potential Black Ice';
    } else if (temp > 90) {
      return 'Hot Surface - Monitor Tire Pressure';
    }
    
    return 'Optimal Driving Conditions';
  };
  
  const getOptimalTireTempRange = (compound: string, vehicleData?: VehiclePerformanceData): string => {
    const baseTemp = compound === "soft" ? 195 : compound === "medium" ? 185 : 175;
    
    if (vehicleData?.telemetryPresets) {
      return `${baseTemp - 10}-${baseTemp + 10}`;
    } else if (vehicleData?.telemetryPresets?.optimumTireTemp) {
      return `${vehicleData.telemetryPresets.optimumTireTemp - 10}-${vehicleData.telemetryPresets.optimumTireTemp + 10}`;
    }
    
    return "175-195"; // Default range
  };
  
  const calculateDrivabilityScore = (): number => {
    if (!weatherData) return 50; // Default midpoint
    
    // Extract weather variables
    const { temp } = weatherData.main;
    const windSpeed = weatherData.wind.speed;
    const { humidity } = weatherData.main;
    const weatherId = weatherData.weather[0].id;
    const visibility = weatherData.visibility / 1000; // Convert to km
    
    // Base score
    let score = 100;
    
    // Weather penalties
    if (weatherId < 800) score -= 30; // Rain, snow, etc.
    if (temp < 45) score -= 10; // Cold
    if (temp > 90) score -= 15; // Very hot
    if (windSpeed > 20) score -= 20; // High winds
    if (humidity > 85) score -= 10; // Very humid
    if (visibility < 5) score -= 25; // Poor visibility
    
    // Final score with bounds
    const finalScore = Math.max(0, Math.min(100, score));
    
    if (finalScore >= 85) return 85; // Near optimal
    if (finalScore >= 65) return 70; // Good
    if (finalScore >= 40) return 50; // Moderate
    if (finalScore >= 20) return 30; // Poor
    return 15; // Hazardous
  };
  
  const getDrivabilityColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 65) return "bg-green-400";
    if (percentage >= 50) return "bg-yellow-400";
    if (percentage >= 35) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Function to generate performance recommendations based on conditions
  const generatePerformanceRecommendations = (weather: WeatherData, vehicle: VehiclePerformanceData): string[] => {
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    
    return [
      `Optimal tire pressure: ${(vehicle.performanceData.lateralGrip * 32 + tirePressureAdjustment).toFixed(1)} PSI (front) / ${(vehicle.performanceData.lateralGrip * 30 + tirePressureAdjustment).toFixed(1)} PSI (rear)`,
      `Target tire temperature: ${getOptimalTireTempRange(tireCompound, vehicle)}°F`,
      `Recommended fuel mixture: ${calculateAFR(temp, humidity, 500).toFixed(1)}:1`,
      `Estimated engine power: ${(vehicle.telemetryPresets.optimumOilTemp > temp + 30 ? 97 : 100)}% of maximum`,
      `Brake cooling: ${temp > 80 ? "Critical" : "Normal"}`,
      `Cooling system: ${temp > 85 ? "Increased airflow recommended" : "Standard configuration"}`,
      `Road surface temperature: ~${(temp + 10).toFixed(1)}°F`,
      `Optimal shift points: ${vehicle.telemetryPresets.optimalShiftRpm - 200} RPM (wet) / ${vehicle.telemetryPresets.optimalShiftRpm} RPM (dry)`
    ];
  };
  
  // Calculate route statistics
  const calculateRouteStats = (): {
    distance: number;
    duration: number;
    elevationGain: number;
    elevationLoss: number;
    turns: number;
    straightaways: number;
    technicalSections: number;
  } => {
    if (!selectedVehicle || !weatherData) return routeStats;
    
    // Sample data for demo purposes
    const distance = 78.4; // miles
    const duration = 97; // minutes
    const elevationGain = 1230; // feet
    const elevationLoss = 980; // feet
    const turns = 47; // count
    const straightaways = 12; // count
    const technicalSections = 4; // count
    
    return {
      distance,
      duration,
      elevationGain,
      elevationLoss,
      turns,
      straightaways,
      technicalSections
    };
  };
  
  // Performance calculations for air intake
  const calculateAirIntakePerformance = (): { 
    airDensity: number;
    afr: number;
    powerAdjustment: number;
  } => {
    if (!weatherData) {
      return { airDensity: 1.225, afr: 14.7, powerAdjustment: 0 };
    }
    
    const tempC = (weatherData.main.temp - 32) * 5/9; // Convert F to C
    const pressureHpa = weatherData.main.pressure;
    const humidityPercent = weatherData.main.humidity;
    
    // Calculate air density
    const airDensity = calculateAirDensity(tempC, pressureHpa, humidityPercent);
    
    // Calculate AFR (Air-Fuel Ratio)
    const afr = calculateAFR(weatherData.main.temp, humidityPercent, 500); // Assuming 500ft elevation
    
    // Estimate power adjustment percentage
    const normalDensity = 1.225; // kg/m³ at sea level, 15°C
    const densityRatio = airDensity / normalDensity;
    
    // Power adjustment is roughly proportional to air density
    // Less dense air = less oxygen = less power
    const powerAdjustment = (densityRatio - 1) * 100;
    
    return { airDensity, afr, powerAdjustment };
  };
  
  // Tire compound performance estimates
  const calculateTireCompoundPerformance = (): {
    gripLevel: number;
    heatUpTime: number;
    durability: number;
    temperatureWindow: string;
  } => {
    if (!selectedVehicle) {
      return {
        gripLevel: 0.85,
        heatUpTime: 3,
        durability: 70,
        temperatureWindow: "160-180"
      };
    }
    
    const baseGrip = selectedVehicle.performanceData.lateralGrip;
    
    let gripLevel, heatUpTime, durability, temperatureWindow;
    
    if (tireCompound === "soft") {
      gripLevel = baseGrip * 1.05;
      heatUpTime = 1.5;
      durability = 50;
      temperatureWindow = "185-205";
    } else if (tireCompound === "medium") {
      gripLevel = baseGrip;
      heatUpTime = 3;
      durability = 75;
      temperatureWindow = "175-195";
    } else { // hard
      gripLevel = baseGrip * 0.95;
      heatUpTime = 4.5;
      durability = 90;
      temperatureWindow = "165-185";
    }
    
    // Adjust for weather conditions
    if (weatherData) {
      const tempF = weatherData.main.temp;
      
      // Temperature adjustments
      if (tempF > 85) {
        gripLevel -= 0.05; // Hot weather reduces grip
        heatUpTime *= 0.8; // Faster heat up
        durability -= 10; // Reduced durability
      } else if (tempF < 50) {
        gripLevel -= 0.1; // Cold weather significantly reduces grip
        heatUpTime *= 2; // Much slower heat up
        durability += 5; // Slightly improved durability
      }
      
      // Rain adjustments (if applicable)
      if (weatherData.weather[0].main === "Rain") {
        gripLevel *= 0.7; // Significant grip reduction in rain
        heatUpTime *= 1.5; // Slower heat up
        durability -= 5; // Slightly reduced durability
      }
    }
    
    return {
      gripLevel: Math.round(gripLevel * 100) / 100,
      heatUpTime,
      durability,
      temperatureWindow
    };
  };
  
  // Calculate route technical rating
  const calculateTechnicalRating = (): number => {
    if (!routeStats) return 3; // Default medium difficulty
    
    // Based on turns per km
    const turnsPerKm = routeStats.turns / (routeStats.distance * 1.60934);
    
    // Technical rating scale 1-5
    if (turnsPerKm < 0.2) return 1;
    if (turnsPerKm < 0.4) return 2;
    if (turnsPerKm < 0.6) return 3; 
    if (turnsPerKm < 0.8) return 4;
    
    return 5; // Very technical
  };
  
  // Get textual description of technical rating
  const getTechnicalRatingText = (rating: number): string => {
    switch(rating) {
      case 1: return "0-2 TRN/km (Minimal)";
      case 2: return "2-4 TRN/km (Gentle)";
      case 3: return "4-6 TRN/km (Moderate)"; 
      case 4: return "6-8 TRN/km (Spirited)";
      case 5:
      default: return "8-12+ TRN/km (Technical)";
    }
  };
  
  // Check air intake performance
  const getAirIntakeNote = (): string => {
    const airTemp = weatherData?.main.temp || 70;
    const windSpeed = weatherData?.wind.speed || 5;
    const humidity = weatherData?.main.humidity || 50;
    
    if (airTemp > 90) return 'Reduced - High Heat';
    if (airTemp < 40) return 'Excellent - Cold Air';
    if (windSpeed > 10) return 'Enhanced - Good Airflow';
    if (humidity > 85) return 'Reduced - High Humidity';
    return 'Normal';
  };
  
  // Location and weather handlers
  const updateWeather = useCallback(async (position: { lat: number; lng: number }) => {
    try {
      setWeatherLoading(true);
      const [weatherResponse, oneCallResponse] = await Promise.all([
        getWeatherData(position.lat, position.lng),
        getOneCallData(position.lat, position.lng)
      ]);
      
      if (weatherResponse) {
        setWeatherData(weatherResponse);
        
        // Update road condition based on weather
        if (weatherResponse.weather && weatherResponse.weather.length > 0) {
          setRoadSurfaceCondition(
            getRoadConditionFromWeather(weatherResponse.weather[0].id, weatherResponse.main.temp)
          );
        }
        
        // Update drivability score
        setTrackDrivability(calculateDrivabilityScore());
      }
      
      if (oneCallResponse) {
        setOneCallData(oneCallResponse);
      }
      
      // Generate warnings based on conditions
      const warnings: string[] = [];
      
      if (weatherResponse?.main.temp < 40) {
        warnings.push("Cold temperatures - tires may not reach optimal temperature");
      }
      
      if (weatherResponse?.main.temp > 90) {
        warnings.push("High heat - monitor engine and brake temperatures closely");
      }
      
      if (weatherResponse?.wind.speed > 15) {
        warnings.push("High winds - vehicle stability may be affected");
      }
      
      if (weatherResponse?.weather[0].main === "Rain") {
        warnings.push("Wet conditions - reduced traction expected");
      }
      
      if (weatherResponse?.weather[0].main === "Snow") {
        warnings.push("Snow/ice present - extreme caution advised");
      }
      
      setTrackConditionWarnings(warnings);
      
      if (weatherResponse && selectedVehicle) {
        // Generate performance recommendations
        setPerformanceRecommendations(generatePerformanceRecommendations(weatherResponse, selectedVehicle));
        
        // Update route stats with current conditions
        setRouteStats(calculateRouteStats());
      }
      
    } catch (error) {
      console.error("Error updating weather:", error);
    } finally {
      setWeatherLoading(false);
    }
  }, [selectedVehicle]);
  
  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            locationName: "Current Location" // This would be updated with reverse geocoding
          });
          
          // Update weather with new location
          updateWeather({ lat: latitude, lng: longitude });
        },
        error => {
          console.error("Error getting location:", error);
          // Fallback to default location
          updateWeather({ lat: currentLocation.lat, lng: currentLocation.lng });
        }
      );
    } else {
      console.log("Geolocation not supported by this browser");
      // Fallback to default location
      updateWeather({ lat: currentLocation.lat, lng: currentLocation.lng });
    }
  };
  
  // Calculate distance between GPS points
  const calculateDistanceBetweenPoints = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  // Calculate total distance traveled
  const calculateTotalDistance = (): number => {
    if (trackHistory.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < trackHistory.length; i++) {
      const prev = trackHistory[i - 1];
      const current = trackHistory[i];
      
      totalDistance += calculateDistanceBetweenPoints(
        prev.lat, prev.lng, 
        current.lat, current.lng
      );
    }
    
    return totalDistance;
  };
  
  // Convert kilometers to miles
  const kmToMiles = (distance: number): number => {
    return distance * 0.621371;
  };
  
  // Update telemetry stats based on tracking data
  const updateTelemetryStats = () => {
    if (telemetryHistory.length === 0) return;
    
    // Calculate various stats
    const currentEntry = telemetryHistory[telemetryHistory.length - 1];
    
    // Extract values from all entries for min/max calculations
    const speeds = telemetryHistory.map(entry => entry.speed);
    const accelerations = telemetryHistory.map(entry => entry.acceleration);
    const lateralGs = telemetryHistory.map(entry => entry.lateralG);
    const elevations = telemetryHistory.map(entry => entry.elevation);
    const gradients = telemetryHistory.map(entry => entry.gradient);
    
    // Calculate total distance
    const distanceTraveled = calculateTotalDistance();
    
    // Calculate elapsed time (ms to minutes)
    const startTime = telemetryHistory[0].timestamp;
    const currentTime = telemetryHistory[telemetryHistory.length - 1].timestamp;
    const elapsedTime = (currentTime - startTime) / (1000 * 60); // Convert to minutes
    
    // Calculate average speed in mph
    const avgSpeed = elapsedTime > 0 ? (kmToMiles(distanceTraveled) / elapsedTime) * 60 : 0;
    
    // Calculate speed variance (for driving consistency analysis)
    const calculateVariance = (values: number[]): number => {
      if (values.length < 2) return 0;
      
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const squareDiffs = values.map(value => Math.pow(value - avg, 2));
      const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
      
      return Math.sqrt(variance);
    };
    
    const speedVariance = calculateVariance(speeds);
    
    // Update stats
    const newStats = {
      currentSpeed: currentEntry.speed,
      maxSpeed: Math.max(...speeds),
      avgSpeed,
      maxAcceleration: Math.max(...accelerations),
      maxDeceleration: Math.min(...accelerations), // Should be negative
      maxLateralG: Math.max(...lateralGs),
      currentElevation: currentEntry.elevation,
      maxElevation: Math.max(...elevations),
      minElevation: Math.min(...elevations),
      currentGradient: currentEntry.gradient,
      maxGradient: Math.max(...gradients),
      minGradient: Math.min(...gradients),
      distanceTraveled: distanceTraveled, // In km
      elapsedTime, // In minutes
      speedVariance,
      avgCorneringG: lateralGs.reduce((sum, g) => sum + g, 0) / lateralGs.length
    };
    
    setTelemetryStats(newStats);
  };
  
  // Simulate telemetry data
  const simulateTelemetryData = () => {
    if (!gpsTrackingEnabled) return;
    
    // For demo, we'll simulate realistic data
    const lastEntry = telemetryHistory.length > 0 
      ? telemetryHistory[telemetryHistory.length - 1] 
      : null;
    
    // Base values (or continued from last entry)
    let lat = lastEntry ? lastEntry.lat : currentLocation.lat;
    let lng = lastEntry ? lastEntry.lng : currentLocation.lng;
    let speed = lastEntry ? lastEntry.speed : 45; // mph
    let acceleration = lastEntry ? lastEntry.acceleration : 0; // g-force
    let lateralG = lastEntry ? lastEntry.lateralG : 0; // g-force
    let elevation = lastEntry ? lastEntry.elevation : 500; // feet
    let gradient = lastEntry ? lastEntry.gradient : 0; // percent
    let temp = lastEntry ? lastEntry.temp : (weatherData?.main.temp || 70); // °F
    
    // Add some realistic variation
    // Small random movement in location
    lat += (Math.random() - 0.5) * 0.0005;
    lng += (Math.random() - 0.5) * 0.0005;
    
    // Speed changes
    const speedChange = (Math.random() - 0.5) * 5; // -2.5 to 2.5 mph
    speed = Math.max(0, Math.min(150, speed + speedChange)); // Bounded between 0-150 mph
    
    // Calculate acceleration from speed change
    acceleration = speedChange / 5; // Simplified conversion
    
    // Lateral G varies for cornering simulation
    lateralG = Math.random() * 0.8; // 0-0.8 G
    
    // Small elevation changes
    elevation += (Math.random() - 0.4) * 10; // Slightly biased upward
    
    // Gradient calculation (simplified)
    gradient = (Math.random() - 0.5) * 6; // -3% to 3%
    
    // Temperature stays close to ambient with slight variation
    const baseTemp = weatherData?.main.temp || 70;
    temp = baseTemp + (Math.random() - 0.5) * 5;
    
    // Add to history
    const newEntry = {
      timestamp: Date.now(),
      lat,
      lng,
      speed,
      acceleration,
      lateralG,
      elevation,
      gradient,
      temp
    };
    
    setTelemetryHistory(prev => [...prev, newEntry]);
    
    // Also track basic position history for route visualization
    setTrackHistory(prev => [...prev, {
      lat,
      lng,
      timestamp: Date.now()
    }]);
    
    // Update overall telemetry stats
    updateTelemetryStats();
  };
  
  // Effects and event handlers
  
  // Initialize with default location and weather
  useEffect(() => {
    // Initial weather fetch with default location
    updateWeather({ lat: currentLocation.lat, lng: currentLocation.lng });
    
    // Get actual location if available
    getCurrentLocation();
  }, []);
  
  // Update performance data when vehicle changes
  useEffect(() => {
    if (selectedVehicle && weatherData) {
      setPerformanceRecommendations(generatePerformanceRecommendations(weatherData, selectedVehicle));
      setRouteStats(calculateRouteStats());
    }
  }, [selectedVehicle, weatherData, tireCompound, tirePressureAdjustment]);
  
  // Simulated GPS tracking effect
  useEffect(() => {
    let trackingInterval: NodeJS.Timeout;
    
    if (gpsTrackingEnabled) {
      // Start tracking with simulated data for demo
      trackingInterval = setInterval(simulateTelemetryData, 1000);
    }
    
    return () => {
      if (trackingInterval) clearInterval(trackingInterval);
    };
  }, [gpsTrackingEnabled, telemetryHistory]);
  
  // Handle starting/stopping GPS tracking
  const handleToggleGpsTracking = () => {
    if (!gpsTrackingEnabled) {
      // Starting tracking
      setTelemetryHistory([]);
      setTrackHistory([]);
      setTelemetryStats({
        currentSpeed: 0,
        maxSpeed: 0,
        avgSpeed: 0,
        maxAcceleration: 0,
        maxDeceleration: 0,
        maxLateralG: 0,
        currentElevation: 0,
        maxElevation: 0,
        minElevation: 0,
        currentGradient: 0,
        maxGradient: 0,
        minGradient: 0,
        distanceTraveled: 0,
        elapsedTime: 0,
        speedVariance: 0,
        avgCorneringG: 0
      });
      
      setGpsTrackingEnabled(true);
    } else {
      // Stopping tracking
      setGpsTrackingEnabled(false);
      
      // Offer to save route
      setTimeout(() => {
        if (window.confirm("Save this route to your Drive Journal?")) {
          setRouteSaved(true);
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
          
          {/* Status indicator */}
          {gpsTrackingEnabled && (
            <div className="bg-black/40 rounded-lg border border-blue-500/30 p-2">
              <span className="text-green-400">TRACKING ACTIVE</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-400">
          Plan high-performance drives with real-time weather and surface condition analysis
        </p>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - vehicle selection and performance data */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-6">
            <h2 className="text-blue-400 font-orbitron text-xl mb-4">Select Vehicle</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {vehicles.map(vehicle => (
                <div 
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVehicle?.id === vehicle.id 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-700 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center">
                    {/* Vehicle image */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-black overflow-hidden mr-4 border border-gray-700">
                      <img 
                        src={vehicle.imageUrl} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Vehicle details */}
                    <div>
                      <h3 className="text-white font-medium">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-gray-400 text-sm">{vehicle.year} • {vehicle.specs.engine}</p>
                      <div className="flex text-blue-300 text-xs mt-1">
                        <span>{vehicle.specs.power}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Surface conditions */}
          {weatherData && (
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-6">
              <h2 className="text-blue-400 font-orbitron text-xl mb-3">Surface Conditions</h2>
              
              <div className="rounded-lg bg-gray-950 p-3 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300">Track Drivability</span>
                  <span className="text-white font-mono">{trackDrivability}%</span>
                </div>
                
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getDrivabilityColor(trackDrivability)} transition-all duration-500`}
                    style={{ width: `${trackDrivability}%` }}
                  ></div>
                </div>
                
                <div className="mt-2 text-sm text-gray-400">
                  Road Surface: <span className="text-white">{roadSurfaceCondition}</span>
                </div>
              </div>
              
              {trackConditionWarnings.length > 0 && (
                <div className="rounded-lg bg-amber-900/20 border border-amber-800 p-2">
                  <h3 className="text-amber-400 text-sm font-semibold mb-1">Warnings</h3>
                  <ul className="text-amber-200 text-xs space-y-1">
                    {trackConditionWarnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-950 rounded p-2">
                  <div className="flex flex-col items-center">
                    <Thermometer className="h-4 w-4 text-blue-400 mb-1" />
                    <div className="text-gray-300 text-xs">Road Temp</div>
                    <div className="text-white text-sm">~{(weatherData.main.temp + 10).toFixed(0)}°F</div>
                  </div>
                </div>
                
                <div className="bg-gray-950 rounded p-2">
                  <div className="flex flex-col items-center">
                    <Droplets className="h-4 w-4 text-blue-400 mb-1" />
                    <div className="text-gray-300 text-xs">Grip Level</div>
                    <div className="text-white text-sm">
                      {roadSurfaceCondition.includes('Wet') ? '60%' : roadSurfaceCondition.includes('Snow') ? '30%' : '100%'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-950 rounded p-2">
                  <div className="flex flex-col items-center">
                    <Wind className="h-4 w-4 text-blue-400 mb-1" />
                    <div className="text-gray-300 text-xs">Wind Effect</div>
                    <div className="text-white text-sm">
                      {weatherData.wind.speed > 15 ? 'High' : weatherData.wind.speed > 8 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Vehicle setup */}
          {selectedVehicle && (
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center">
                <h2 className="text-blue-400 font-orbitron text-xl">Vehicle Setup</h2>
                <button 
                  onClick={() => setShowPerformanceDetails(!showPerformanceDetails)}
                  className="text-xs text-blue-300 hover:text-blue-100"
                >
                  {showPerformanceDetails ? 'Show Less' : 'Show More'}
                </button>
              </div>
              
              <div className="space-y-4 mt-3">
                <div>
                  <label className="block text-gray-300 mb-1">Tire Compound</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className={`py-2 rounded font-medium text-sm ${
                        tireCompound === "soft" 
                          ? "bg-red-900 text-white border border-red-500" 
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => setTireCompound("soft")}
                    >
                      Soft
                    </button>
                    <button
                      className={`py-2 rounded font-medium text-sm ${
                        tireCompound === "medium" 
                          ? "bg-orange-900 text-white border border-orange-500" 
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => setTireCompound("medium")}
                    >
                      Medium
                    </button>
                    <button
                      className={`py-2 rounded font-medium text-sm ${
                        tireCompound === "hard" 
                          ? "bg-blue-900 text-white border border-blue-500" 
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => setTireCompound("hard")}
                    >
                      Hard
                    </button>
                  </div>
                  
                  {showPerformanceDetails && (
                    <div className="mt-2 text-xs text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
                      <div>Grip Level: <span className="text-white">{calculateTireCompoundPerformance().gripLevel.toFixed(2)} G</span></div>
                      <div>Heat-up Time: <span className="text-white">{calculateTireCompoundPerformance().heatUpTime} laps</span></div>
                      <div>Durability: <span className="text-white">{calculateTireCompoundPerformance().durability}%</span></div>
                      <div>Temp Window: <span className="text-white">{calculateTireCompoundPerformance().temperatureWindow}°F</span></div>
                    </div>
                  )}
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
        
        {/* Center column - map and vehicle telemetry */}
        <div className="lg:col-span-2">
          {/* Route visualization (placeholder for map) */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-blue-400 font-orbitron text-xl">Route Details</h2>
              
              <button 
                onClick={() => setIsPreDriveMode(!isPreDriveMode)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isPreDriveMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {isPreDriveMode ? 'Pre-Drive Mode Active' : 'Pre-Drive Mode'}
              </button>
            </div>
            
            {/* Map container */}
            <div 
              ref={mapRef} 
              className="h-[400px] w-full rounded-lg bg-gray-950 border border-gray-800 overflow-hidden relative"
            >
              {/* Placeholder for map - this would be a Google Map or similar */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <p className="text-gray-300 text-center">
                  Interactive map loading...
                  <br />
                  <span className="text-xs text-gray-400 mt-1">
                    Search for routes or click to create waypoints
                  </span>
                </p>
              </div>
              
              {/* Placeholder for live tracking */}
              {gpsTrackingEnabled && (
                <div className="absolute top-3 right-3 bg-black/70 rounded p-2 border border-green-500">
                  <div className="text-green-400 text-xs flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                    GPS Active
                  </div>
                </div>
              )}
            </div>
            
            {/* Route stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-950 p-3 rounded">
                <div className="text-xs text-gray-400">Distance</div>
                <div className="text-white font-mono text-lg font-medium">
                  {routeStats.distance.toFixed(1)} <span className="text-xs text-gray-400">mi</span>
                </div>
              </div>
              
              <div className="bg-gray-950 p-3 rounded">
                <div className="text-xs text-gray-400">Est. Duration</div>
                <div className="text-white font-mono text-lg font-medium">
                  {routeStats.duration} <span className="text-xs text-gray-400">min</span>
                </div>
              </div>
              
              <div className="bg-gray-950 p-3 rounded">
                <div className="text-xs text-gray-400">Elevation Gain</div>
                <div className="text-white font-mono text-lg font-medium">
                  {routeStats.elevationGain} <span className="text-xs text-gray-400">ft</span>
                </div>
              </div>
              
              <div className="bg-gray-950 p-3 rounded">
                <div className="text-xs text-gray-400">Tech Rating</div>
                <div className="text-white font-mono text-lg font-medium">
                  {calculateTechnicalRating()}/5
                </div>
              </div>
            </div>
          </div>
          
          {/* Vehicle telemetry display */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-blue-400 font-orbitron text-xl">F1-Grade Telemetry</h2>
              
              <button 
                onClick={() => setShowTelemetryDetails(!showTelemetryDetails)}
                className="text-xs text-blue-300 hover:text-blue-100"
              >
                {showTelemetryDetails ? 'Basic View' : 'Advanced View'}
              </button>
            </div>
            
            {/* GPS tracking start button */}
            <div className="mb-4 flex justify-center">
              <button
                onClick={handleToggleGpsTracking}
                className={`flex items-center px-6 py-3 rounded-full text-white font-medium shadow-lg ${
                  gpsTrackingEnabled 
                    ? 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700' 
                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
                }`}
              >
                <span className="mr-2">{gpsTrackingEnabled ? 'STOP GPS' : 'START GPS'}</span>
                {!gpsTrackingEnabled && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                )}
              </button>
            </div>
            
            {/* Telemetry gauges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {/* Speed gauge */}
              <div className="bg-gray-950 p-3 rounded border border-gray-700 text-xs text-gray-300">
                <div className="flex justify-between items-center">
                  <span>Speed</span>
                  <span className="text-white font-mono">{telemetryStats.currentSpeed.toFixed(1)} mph</span>
                </div>
                <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${(telemetryStats.currentSpeed / 150) * 100}%` }}
                  ></div>
                </div>
                {showTelemetryDetails && (
                  <div className="mt-1 flex justify-between text-[10px]">
                    <span>Max: {telemetryStats.maxSpeed.toFixed(1)}</span>
                    <span>Avg: {telemetryStats.avgSpeed.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              {/* Acceleration gauge */}
              <div className="bg-gray-950 p-3 rounded border border-gray-700 text-xs text-gray-300">
                <div className="flex justify-between items-center">
                  <span>G-Force</span>
                  <span className="text-white font-mono">{telemetryStats.maxLateralG.toFixed(2)} G</span>
                </div>
                <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${(telemetryStats.maxLateralG / 1.5) * 100}%` }}
                  ></div>
                </div>
                {showTelemetryDetails && (
                  <div className="mt-1 flex justify-between text-[10px]">
                    <span>Lat: {telemetryStats.maxLateralG.toFixed(2)}</span>
                    <span>Long: {telemetryStats.maxAcceleration.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              {/* Elevation gauge */}
              <div className="bg-gray-950 p-3 rounded border border-gray-700 text-xs text-gray-300">
                <div className="flex justify-between items-center">
                  <span>Elevation</span>
                  <span className="text-white font-mono">{telemetryStats.currentElevation.toFixed(0)} ft</span>
                </div>
                <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500"
                    style={{ width: `${Math.min(100, (telemetryStats.currentElevation / 2000) * 100)}%` }}
                  ></div>
                </div>
                {showTelemetryDetails && (
                  <div className="mt-1 flex justify-between text-[10px]">
                    <span>Max: {telemetryStats.maxElevation.toFixed(0)}</span>
                    <span>∆: {(telemetryStats.maxElevation - telemetryStats.minElevation).toFixed(0)}</span>
                  </div>
                )}
              </div>
              
              {/* Distance gauge */}
              <div className="bg-gray-950 p-3 rounded border border-gray-700 text-xs text-gray-300">
                <div className="flex justify-between items-center">
                  <span>Distance</span>
                  <span className="text-white font-mono">{kmToMiles(telemetryStats.distanceTraveled).toFixed(2)} mi</span>
                </div>
                <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500"
                    style={{ width: `${Math.min(100, (kmToMiles(telemetryStats.distanceTraveled) / routeStats.distance) * 100)}%` }}
                  ></div>
                </div>
                {showTelemetryDetails && (
                  <div className="mt-1 flex justify-between text-[10px]">
                    <span>Time: {telemetryStats.elapsedTime.toFixed(1)} min</span>
                    <span>Total: {routeStats.distance.toFixed(1)} mi</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Advanced telemetry (when expanded) */}
            {showTelemetryDetails && (
              <div className="rounded-lg bg-gray-950 p-3 mt-4 border border-gray-800">
                <h3 className="text-blue-400 text-sm font-semibold mb-2">Advanced Telemetry Metrics</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cornering G's:</span>
                    <span className="text-white font-mono">{telemetryStats.avgCorneringG.toFixed(2)} G</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Accel:</span>
                    <span className="text-white font-mono">{telemetryStats.maxAcceleration.toFixed(2)} G</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Decel:</span>
                    <span className="text-white font-mono">{telemetryStats.maxDeceleration.toFixed(2)} G</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Gradient:</span>
                    <span className="text-white font-mono">{telemetryStats.maxGradient.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Gradient:</span>
                    <span className="text-white font-mono">{telemetryStats.minGradient.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Speed Variance:</span>
                    <span className="text-white font-mono">{telemetryStats.speedVariance.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Weather conditions */}
          {weatherData && (
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <h2 className="text-blue-400 font-orbitron text-xl mb-3">Weather Conditions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current conditions */}
                <div className="bg-gray-950 p-3 rounded-lg col-span-1">
                  <div className="flex items-center mb-2">
                    <img 
                      src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                      alt={weatherData.weather[0].description}
                      className="w-10 h-10 mr-2" 
                    />
                    <div>
                      <div className="text-white">{weatherData.weather[0].main}</div>
                      <div className="text-gray-400 text-xs capitalize">{weatherData.weather[0].description}</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-white font-medium mb-2">
                    {weatherData.main.temp.toFixed(1)}°F
                  </div>
                  
                  <div className="text-xs text-gray-300 flex justify-between">
                    <span>Feels like: {weatherData.main.feels_like.toFixed(1)}°F</span>
                    <span>{weatherData.name}</span>
                  </div>
                </div>
                
                {/* Weather details */}
                <div className="bg-gray-950 p-3 rounded-lg col-span-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <Wind className="h-4 w-4 text-blue-400 mb-1" />
                        <div className="text-gray-300 text-xs">Wind</div>
                        <div className="text-white">{weatherData.wind.speed} mph</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <Droplets className="h-4 w-4 text-blue-400 mb-1" />
                        <div className="text-gray-300 text-xs">Humidity</div>
                        <div className="text-white">{weatherData.main.humidity}%</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <CloudRain className="h-4 w-4 text-blue-400 mb-1" />
                        <div className="text-gray-300 text-xs">Precip</div>
                        <div className="text-white">{weatherData.rain ? `${weatherData.rain["1h"]} mm` : "0 mm"}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-black/30 p-2 rounded text-xs">
                    <div className="text-gray-300 mb-1">Air Intake Performance:</div>
                    <div className="flex justify-between text-white">
                      <span>Density: {calculateAirDensity((weatherData.main.temp - 32) * 5/9, weatherData.main.pressure, weatherData.main.humidity).toFixed(3)} kg/m³</span>
                      <span>Performance: {getAirIntakeNote()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* hourly forecast preview (if OneCall data is available) */}
              {oneCallData && (
                <div className="mt-3 overflow-x-auto">
                  <div className="flex space-x-3 py-2 px-1 min-w-max">
                    {oneCallData.hourly.slice(0, 8).map((hour, index) => (
                      <div key={index} className="flex flex-col items-center bg-black/30 p-2 rounded w-[70px]">
                        <div className="text-gray-400 text-xs">
                          {new Date(hour.dt * 1000).getHours()}:00
                        </div>
                        <img 
                          src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                          alt={hour.weather[0].description}
                          className="w-8 h-8 my-1" 
                        />
                        <div className="text-white text-sm">{hour.temp.toFixed(0)}°</div>
                        <div className="text-blue-300 text-xs mt-1">{hour.pop > 0 ? `${(hour.pop * 100).toFixed(0)}%` : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom section - Performance recommendations */}
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
      
      {/* Pre-drive checklist for track days */}
      {isPreDriveMode && (
        <div className="mt-6 mb-6 bg-gray-900 p-4 rounded-lg border border-gray-800">
          <h2 className="text-blue-400 font-orbitron text-xl mb-3">Pre-Drive Checklist</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white mb-2">Vehicle Systems</h3>
              <ul className="space-y-1">
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Tire pressure checked ({selectedVehicle ? `${(selectedVehicle.performanceData.lateralGrip * 32 + tirePressureAdjustment).toFixed(1)} F / ${(selectedVehicle.performanceData.lateralGrip * 30 + tirePressureAdjustment).toFixed(1)} R` : '32F/30R PSI'})</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Brake fluid level checked</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Oil level checked</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Coolant level checked</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Wheel lug nuts torqued</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Brake pad thickness verified</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white mb-2">Driver Preparation</h3>
              <ul className="space-y-1">
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Route familiarization complete</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Weather conditions assessed</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Phone mount secured</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Emergency contact informed</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Fuel level sufficient ({routeStats ? `${Math.ceil(routeStats.distance / 15)} gallons min.` : ''})</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <span>Performance driving mode active</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Completing this checklist helps ensure the safest and most enjoyable driving experience
            </div>
            <button className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded">
              Mark Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlannerPage;