import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface RallyEventData {
  rallyName: string;
  organizerId: string;
  eventId: string;
  officialRoute: any[];
  eventDate: string;
  isPaddock20Event: boolean;
  eventDescription: string;
  participantCount: number;
  startTime: string;
  endTime: string;
  difficultyLevel: string;
  recommendedVehicles: string[];
  checkpoints: any[];
  eventType: string;
  host?: string;
}

interface CustomVehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  frontTirePSI: number;
  rearTirePSI: number;
}

const DriveJournalPage = () => {
  // Base location data
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  
  // Vehicle data
  const [vehicleUsed, setVehicleUsed] = useState("");
  
  // Road conditions and assessment
  const [curvatureRating, setCurvatureRating] = useState("Moderate");
  const [curvatureTRN, setCurvatureTRN] = useState<number>(5.8);
  const [surfaceTemp, setSurfaceTemp] = useState("");
  const [gripLevel, setGripLevel] = useState("Dry");
  const [weatherImpact, setWeatherImpact] = useState("Clear");
  
  // Performance adjustments
  const [tirePressure, setTirePressure] = useState("");
  const [torqueSetting, setTorqueSetting] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(5);
  const [poiLog, setPoiLog] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  
  // Rally/Event Data
  const [isRallyEvent, setIsRallyEvent] = useState(false);
  const [rallyEventData, setRallyEventData] = useState<RallyEventData | null>(null);
  
  // Custom Vehicle Form State
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState("");
  const [newVehicleMake, setNewVehicleMake] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newVehicleYear, setNewVehicleYear] = useState<number>(2023);
  const [newVehicleFrontPSI, setNewVehicleFrontPSI] = useState<number>(32);
  const [newVehicleRearPSI, setNewVehicleRearPSI] = useState<number>(30);
  const [customVehicles, setCustomVehicles] = useState<CustomVehicle[]>([]);
  
  // Advanced Telemetry & F1 Data
  const [showAdvancedTelemetry, setShowAdvancedTelemetry] = useState(false);
  const [drivingMode, setDrivingMode] = useState("sport");
  const [drivingStyle, setDrivingStyle] = useState("Dynamic");
  
  // F1-level extended telemetry data
  const [corneringG, setCorneringG] = useState<number>(0.85);
  const [maxSpeed, setMaxSpeed] = useState<number>(110);
  const [avgSpeed, setAvgSpeed] = useState<number>(65);
  const [maxBraking, setMaxBraking] = useState<number>(0.8);
  const [peakTireTemp, setPeakTireTemp] = useState<number>(170);
  const [tirePressureVariance, setTirePressureVariance] = useState<number>(2);
  
  // Load any saved custom vehicles from localStorage
  useEffect(() => {
    const savedVehicles = localStorage.getItem("customVehicles");
    if (savedVehicles) {
      try {
        setCustomVehicles(JSON.parse(savedVehicles));
      } catch (error) {
        console.error("Error loading custom vehicles:", error);
      }
    }
  }, []);
  
  // Function to add a custom vehicle
  const addCustomVehicle = () => {
    if (!newVehicleName.trim()) {
      alert("Please enter a vehicle name");
      return;
    }
    
    const newVehicle: CustomVehicle = {
      id: `vehicle-${Date.now()}`,
      name: newVehicleName,
      make: newVehicleMake,
      model: newVehicleModel,
      year: newVehicleYear || 2023,
      frontTirePSI: newVehicleFrontPSI || 32,
      rearTirePSI: newVehicleRearPSI || 30,
    };
    
    const updatedVehicles = [...customVehicles, newVehicle];
    
    // Save to state and localStorage
    setCustomVehicles(updatedVehicles);
    localStorage.setItem("customVehicles", JSON.stringify(updatedVehicles));
    
    // Select the new vehicle
    setVehicleUsed(newVehicleName);
    
    // Update tire pressure field with the new vehicle's values
    setTirePressure(`${newVehicleFrontPSI}/${newVehicleRearPSI}`);
    
    // Reset form and hide it
    setNewVehicleName("");
    setNewVehicleMake("");
    setNewVehicleModel("");
    setNewVehicleYear(2023);
    setNewVehicleFrontPSI(32);
    setNewVehicleRearPSI(30);
    setShowAddVehicleForm(false);
  };

  useEffect(() => {
    // Auto-import route planner saved drives from localStorage
    const storedDrive = localStorage.getItem("plannedDrive");
    if (storedDrive) {
      try {
        const parsed = JSON.parse(storedDrive);
        setStartLocation(parsed.start || "");
        setEndLocation(parsed.end || "");
        setWaypoints(parsed.waypoints || []);
        setVehicleUsed(parsed.vehicle || "");
        
        // Import curvature metrics if available
        if (parsed.curvatureTRN) {
          setCurvatureTRN(parsed.curvatureTRN);
          
          // Set curvature rating based on TRN/km value
          if (parsed.curvatureTRN < 2) {
            setCurvatureRating("Minimal");
          } else if (parsed.curvatureTRN < 4) {
            setCurvatureRating("Light");
          } else if (parsed.curvatureTRN < 7) {
            setCurvatureRating("Moderate");
          } else if (parsed.curvatureTRN < 10) {
            setCurvatureRating("Technical");
          } else {
            setCurvatureRating("Extreme");
          }
        }
        
        // Import distance and duration if available
        if (parsed.distance) {
          setDistance(parsed.distance);
        }
        
        if (parsed.duration) {
          setEstimatedDuration(parsed.duration);
        }
        
        // Import weather/road conditions if available
        if (parsed.surfaceTemp) {
          setSurfaceTemp(parsed.surfaceTemp);
        }
        
        if (parsed.gripLevel) {
          setGripLevel(parsed.gripLevel);
        }
        
        if (parsed.weatherImpact) {
          setWeatherImpact(parsed.weatherImpact);
        }
        
        // Import vehicle performance settings if available
        if (parsed.tirePressure) {
          setTirePressure(parsed.tirePressure);
        }
        
        if (parsed.torqueSetting) {
          setTorqueSetting(parsed.torqueSetting);
        }
        
        // Import rally/event data if available
        if (parsed.isRallyEvent && parsed.rallyEventData) {
          setIsRallyEvent(true);
          setRallyEventData(parsed.rallyEventData);
        }
      } catch (error) {
        console.error("Error parsing saved drive:", error);
      }
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  // Generate F1-grade telemetry data based on input parameters
  const generateTelemetryData = () => {
    // Start with base telemetry values based on vehicle type
    let baseCorneringG = 0.7;
    let baseBrakingG = 0.7;
    let baseAcceleration = 6.5; // 0-60 time in seconds
    
    // Adjust based on vehicle selection
    if (vehicleUsed.includes('Ferrari')) {
      baseCorneringG = 0.95;
      baseBrakingG = 1.0;
      baseAcceleration = 3.0;
    } else if (vehicleUsed.includes('Porsche')) {
      baseCorneringG = 0.9;
      baseBrakingG = 0.95;
      baseAcceleration = 3.5;
    } else if (vehicleUsed.includes('BMW')) {
      baseCorneringG = 0.85;
      baseBrakingG = 0.9;
      baseAcceleration = 4.0;
    }
    
    // Adjust based on driving style
    const styleMultiplier = drivingStyle === 'Aggressive' ? 1.1 : 
                          drivingStyle === 'Dynamic' ? 1.05 : 
                          drivingStyle === 'Balanced' ? 1.0 : 0.9;
    
    // Adjust based on surface conditions
    const surfaceMultiplier = gripLevel === 'Dry' ? 1.0 : 
                            gripLevel === 'Damp' ? 0.85 : 
                            gripLevel === 'Wet' ? 0.7 : 0.9;
    
    // Calculate final telemetry values
    const finalCorneringG = baseCorneringG * styleMultiplier * surfaceMultiplier;
    const finalBrakingG = baseBrakingG * styleMultiplier * surfaceMultiplier;
    const finalAcceleration = baseAcceleration / (styleMultiplier * surfaceMultiplier);
    
    // Calculate tire temperatures based on driving style and surface temp
    const baseTireTemp = surfaceTemp ? parseInt(surfaceTemp) + 40 : 140;
    const frontLeftTemp = baseTireTemp + (drivingStyle === 'Aggressive' ? 15 : 5);
    const frontRightTemp = baseTireTemp + (drivingStyle === 'Aggressive' ? 20 : 8);
    const rearLeftTemp = baseTireTemp + (drivingStyle === 'Aggressive' ? 10 : 3);
    const rearRightTemp = baseTireTemp + (drivingStyle === 'Aggressive' ? 18 : 6);
    
    return {
      corneringData: {
        maxLateralG: finalCorneringG,
        turnInRate: drivingStyle === 'Aggressive' ? 8.5 : 
                  drivingStyle === 'Dynamic' ? 7.5 : 
                  drivingStyle === 'Balanced' ? 6.5 : 5.5,
        apexSpeed: 60 + (finalCorneringG * 20),
        exitStability: drivingStyle === 'Aggressive' ? 6.0 : 
                     drivingStyle === 'Dynamic' ? 7.0 : 
                     drivingStyle === 'Balanced' ? 8.0 : 9.0,
      },
      accelerationData: {
        zeroToSixty: finalAcceleration,
        quarterMile: finalAcceleration * 2.2,
        quarterMileSpeed: 80 + (finalAcceleration * 6),
        topSpeed: 130 + (120 / finalAcceleration),
      },
      brakingData: {
        sixtyToZero: 120 - (finalBrakingG * 20),
        maxBrakingG: finalBrakingG,
        brakingDistance: 120 - (finalBrakingG * 20),
        brakingTemperature: 600 + (finalBrakingG * 200) + (drivingStyle === 'Aggressive' ? 150 : 0),
      },
      tireData: {
        frontLeftTemp,
        frontRightTemp,
        rearLeftTemp,
        rearRightTemp,
        wear: {
          frontLeft: drivingStyle === 'Aggressive' ? 35 : 
                   drivingStyle === 'Dynamic' ? 25 : 15,
          frontRight: drivingStyle === 'Aggressive' ? 45 : 
                    drivingStyle === 'Dynamic' ? 30 : 20,
          rearLeft: drivingStyle === 'Aggressive' ? 30 : 
                  drivingStyle === 'Dynamic' ? 22 : 12,
          rearRight: drivingStyle === 'Aggressive' ? 40 : 
                   drivingStyle === 'Dynamic' ? 28 : 18,
        }
      },
      environmentalData: {
        airTemp: surfaceTemp ? parseInt(surfaceTemp) - 5 : 75,
        trackTemp: surfaceTemp ? parseInt(surfaceTemp) : 80,
        humidity: 50 + (Math.random() * 30),
        atmosphericPressure: 1013 - (Math.random() * 10),
        altitude: 500 + (Math.random() * 1000),
        windSpeed: 5 + (Math.random() * 10),
        airDensity: 1.225 - (Math.random() * 0.05),
      }
    };
  };
  
  // Generate driving conditions data
  const generateDrivingConditions = () => {
    let weatherCondition = 'Clear';
    if (weatherImpact === 'Rainy') weatherCondition = 'Light Rain';
    if (weatherImpact === 'Snow') weatherCondition = 'Light Snow';
    if (weatherImpact === 'Fog') weatherCondition = 'Foggy';
    if (weatherImpact === 'Windy') weatherCondition = 'Windy';
    
    const trackTemp = surfaceTemp ? parseInt(surfaceTemp) : 80;
    const airTemp = trackTemp - 5;
    
    return {
      weather: {
        condition: weatherCondition,
        temperature: airTemp,
        humidity: 50 + (Math.random() * 30),
        windSpeed: weatherImpact === 'Windy' ? 15 + (Math.random() * 15) : 5 + (Math.random() * 8),
        precipitation: weatherImpact === 'Rainy' ? 2 + (Math.random() * 3) : 
                     weatherImpact === 'Snow' ? 1 + (Math.random() * 2) : 0,
        visibility: weatherImpact === 'Fog' ? 40 + (Math.random() * 40) : 90 + (Math.random() * 10),
      },
      surface: {
        type: 'Asphalt',
        temperature: trackTemp,
        condition: gripLevel === 'Dry' ? 'Dry' : 
                 gripLevel === 'Damp' ? 'Damp' : 
                 gripLevel === 'Wet' ? 'Wet' : 'Variable',
        grip: gripLevel === 'Dry' ? 'Good' : 
             gripLevel === 'Damp' ? 'Fair' : 
             gripLevel === 'Wet' ? 'Poor' : 'Variable',
      },
      location: {
        elevation: 500 + (Math.random() * 1000),
        terrain: curvatureRating === 'Minimal' ? 'Flat' : 
               curvatureRating === 'Light' ? 'Rolling' : 
               curvatureRating === 'Moderate' ? 'Hilly' : 'Mountainous',
        curviness: curvatureTRN ? Math.min(10, curvatureTRN * 1.2) : 
                 curvatureRating === 'Minimal' ? 2 : 
                 curvatureRating === 'Light' ? 4 : 
                 curvatureRating === 'Moderate' ? 6 :
                 curvatureRating === 'Technical' ? 8 : 10,
        trafficDensity: 'Light',
      },
      time: {
        isDaytime: true,
        timeOfDay: 'Midday',
      }
    };
  };

  const submitDriveLog = () => {
    // Generate advanced telemetry data
    const telemetryData = generateTelemetryData();
    const drivingConditions = generateDrivingConditions();
    
    // Set the telemetry values for display
    setCorneringG(telemetryData.corneringData.maxLateralG);
    setMaxSpeed(telemetryData.accelerationData.topSpeed);
    setAvgSpeed(telemetryData.accelerationData.topSpeed * 0.6);
    setMaxBraking(telemetryData.brakingData.maxBrakingG);
    setPeakTireTemp(Math.max(
      telemetryData.tireData.frontLeftTemp,
      telemetryData.tireData.frontRightTemp,
      telemetryData.tireData.rearLeftTemp,
      telemetryData.tireData.rearRightTemp
    ));
    
    const driveEntry = {
      startLocation,
      waypoints,
      endLocation,
      vehicleUsed,
      curvatureRating,
      curvatureTRN,
      surfaceTemp,
      gripLevel,
      weatherImpact,
      tirePressure,
      torqueSetting,
      photos: photos.map(p => p.name), // Just store names for now
      notes,
      rating,
      poiLog,
      distance,
      estimatedDuration,
      isRallyEvent,
      rallyEventData,
      timestamp: new Date().toISOString(),
      id: `drive-${Date.now()}`,
      
      // Advanced F1-level telemetry data
      drivingStyle,
      drivingMode,
      advancedTelemetry: {
        corneringData: telemetryData.corneringData,
        accelerationData: telemetryData.accelerationData,
        brakingData: telemetryData.brakingData,
        tireData: telemetryData.tireData,
        environmentalData: telemetryData.environmentalData
      },
      drivingConditions
    };
    
    console.log(driveEntry);
    
    // Store in localStorage for demo purposes
    const existingEntries = JSON.parse(localStorage.getItem("driveJournalEntries") || "[]");
    localStorage.setItem("driveJournalEntries", JSON.stringify([driveEntry, ...existingEntries]));
    
    // Clear the planned drive data since it's now been logged
    localStorage.removeItem("plannedDrive");
    
    alert("Drive journal entry submitted with F1-grade telemetry data!");
    
    // Show the advanced telemetry view after submission
    setShowAdvancedTelemetry(true);
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">📓 Drive Journal</h1>
      
      {/* F1 Telemetry Toggle */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowAdvancedTelemetry(!showAdvancedTelemetry)}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            showAdvancedTelemetry ? 
            'bg-blue-600 text-white' : 
            'bg-gray-800 text-blue-400 hover:bg-gray-700'
          }`}
        >
          {showAdvancedTelemetry ? '🏎️ F1 Telemetry Active' : '🔍 Show F1-Grade Telemetry'}
        </button>
      </div>
      
      {/* Driving Style Selector */}
      <div className="mb-6 bg-gray-900 p-4 rounded-lg border border-gray-800">
        <label className="block text-gray-400 text-sm mb-2">Driving Style</label>
        <div className="grid grid-cols-4 gap-3">
          {['Conservative', 'Balanced', 'Dynamic', 'Aggressive'].map(style => (
            <button
              key={style}
              onClick={() => setDrivingStyle(style)}
              className={`p-3 rounded-lg text-center ${
                drivingStyle === style 
                  ? `bg-${style === 'Conservative' ? 'green' 
                      : style === 'Balanced' ? 'blue' 
                      : style === 'Dynamic' ? 'purple' 
                      : 'red'}-900 border border-blue-400` 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="text-lg mb-1">
                {style === 'Conservative' ? '🐢' 
                 : style === 'Balanced' ? '⚖️' 
                 : style === 'Dynamic' ? '💨' 
                 : '🔥'}
              </div>
              <div className="text-white text-sm">{style}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Driving Mode Selector - condensed version */}
      <div className="mb-6 bg-gray-900 p-4 rounded-lg border border-gray-800">
        <label className="block text-gray-400 text-sm mb-2">Driving Mode</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            {id: 'comfort', name: 'Comfort', icon: '🛋️', color: 'bg-emerald-900'},
            {id: 'sport', name: 'Sport', icon: '🏎️', color: 'bg-blue-900'},
            {id: 'sport-plus', name: 'Sport+', icon: '⚡', color: 'bg-purple-900'},
            {id: 'track', name: 'Track', icon: '🏁', color: 'bg-red-900'}
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setDrivingMode(mode.id)}
              className={`p-3 rounded-lg text-center ${
                drivingMode === mode.id ? `${mode.color} border border-blue-400` : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="text-lg mb-1">{mode.icon}</div>
              <div className="text-white text-sm">{mode.name}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Rally/Event Data Display */}
      {isRallyEvent && rallyEventData && (
        <div className="mb-8 bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-blue-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-blue-400 font-orbitron text-xl flex items-center">
              <span className="mr-2">🏁</span>
              {rallyEventData.isPaddock20Event ? "Official Paddock20 Event" : "Rally/Event Entry"}
            </h2>
            
            {rallyEventData.isPaddock20Event && (
              <div className="bg-blue-900 text-xs text-blue-200 px-3 py-1 rounded-full">
                Paddock20 Official
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg">{rallyEventData.rallyName}</h3>
              <p className="text-gray-400 text-sm">{rallyEventData.eventType}</p>
            </div>
            
            <div className="text-right">
              <p className="text-white">{rallyEventData.eventDate}</p>
              <p className="text-gray-400 text-sm">
                {rallyEventData.startTime} - {rallyEventData.endTime}
              </p>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4 text-sm">{rallyEventData.eventDescription}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Difficulty</p>
              <p className="text-white">{rallyEventData.difficultyLevel || "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Participants</p>
              <p className="text-white">{rallyEventData.participantCount || "Unknown"}</p>
            </div>
            
            <div className="col-span-2">
              <p className="text-gray-500">Event ID</p>
              <p className="text-white font-mono text-xs">{rallyEventData.eventId || `rally-${Date.now()}`}</p>
            </div>
          </div>
        </div>
      )}

      {/* Start / End Locations */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Start Location</label>
          <input
            type="text"
            placeholder="Start Location"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">End Location</label>
          <input
            type="text"
            placeholder="End Location"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          />
        </div>
      </div>

      {/* Route Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Distance</p>
          <p className="text-white text-xl">{distance ? `${distance.toFixed(1)} mi` : "Not calculated"}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Duration</p>
          <p className="text-white text-xl">
            {estimatedDuration ? `${Math.floor(estimatedDuration / 60)} hr ${estimatedDuration % 60} min` : "Not calculated"}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Curvature Rating</p>
          <div className="flex items-center justify-between">
            <p className="text-white text-xl">{curvatureRating}</p>
            {curvatureTRN && <p className="text-gray-400 text-xs">{curvatureTRN.toFixed(1)} TRN/km</p>}
          </div>
        </div>
      </div>

      {/* Vehicle Used */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-gray-400 text-sm">Vehicle Used</label>
          <button 
            onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}
            className="text-green-500 hover:text-green-400 text-xs"
          >
            {showAddVehicleForm ? 'Cancel' : '+ Add Custom Vehicle'}
          </button>
        </div>
        
        {showAddVehicleForm ? (
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-4 space-y-4">
            <h3 className="text-blue-400 font-medium text-base">Add Custom Vehicle</h3>
            
            <div>
              <label className="block text-gray-400 text-xs mb-1">Vehicle Name</label>
              <input
                type="text"
                value={newVehicleName}
                onChange={(e) => setNewVehicleName(e.target.value)}
                placeholder="e.g., My McLaren 720S"
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Make</label>
                <input
                  type="text"
                  value={newVehicleMake}
                  onChange={(e) => setNewVehicleMake(e.target.value)}
                  placeholder="e.g., McLaren"
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-xs mb-1">Model</label>
                <input
                  type="text"
                  value={newVehicleModel}
                  onChange={(e) => setNewVehicleModel(e.target.value)}
                  placeholder="e.g., 720S"
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-xs mb-1">Year</label>
                <input
                  type="number"
                  value={newVehicleYear}
                  onChange={(e) => setNewVehicleYear(parseInt(e.target.value) || 2023)}
                  placeholder="e.g., 2023"
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Front Tire Pressure (PSI)</label>
                <input
                  type="number"
                  value={newVehicleFrontPSI}
                  onChange={(e) => setNewVehicleFrontPSI(parseInt(e.target.value) || 32)}
                  placeholder="e.g., 32"
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-xs mb-1">Rear Tire Pressure (PSI)</label>
                <input
                  type="number"
                  value={newVehicleRearPSI}
                  onChange={(e) => setNewVehicleRearPSI(parseInt(e.target.value) || 30)}
                  placeholder="e.g., 30"
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>
            </div>
            
            <button
              onClick={addCustomVehicle}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Save Vehicle
            </button>
          </div>
        ) : (
          <select
            value={vehicleUsed}
            onChange={(e) => setVehicleUsed(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="">Select Vehicle Used</option>
            <option value="Ferrari F8 Tributo">Ferrari F8 Tributo</option>
            <option value="Porsche 911 Carrera S">Porsche 911 Carrera S</option>
            <option value="BMW M4 G82">BMW M4 G82</option>
            {customVehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.name}>
                {vehicle.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Road Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Surface Temperature (°F)</label>
          <input
            type="text"
            placeholder="e.g., 78"
            value={surfaceTemp}
            onChange={(e) => setSurfaceTemp(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Grip Level</label>
          <select
            value={gripLevel}
            onChange={(e) => setGripLevel(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
          >
            <option value="Dry">Dry</option>
            <option value="Damp">Damp</option>
            <option value="Wet">Wet</option>
            <option value="Variable">Variable</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Weather Impact</label>
          <select
            value={weatherImpact}
            onChange={(e) => setWeatherImpact(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
          >
            <option value="Clear">Clear</option>
            <option value="Cloudy">Cloudy</option>
            <option value="Light Rain">Light Rain</option>
            <option value="Heavy Rain">Heavy Rain</option>
            <option value="Fog">Fog</option>
            <option value="Windy">Windy</option>
            <option value="Snow">Snow</option>
          </select>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Tire Pressure (Front/Rear PSI)</label>
          <input
            type="text"
            placeholder="e.g., 32/30"
            value={tirePressure}
            onChange={(e) => setTirePressure(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Torque Setting (ft-lb)</label>
          <input
            type="text"
            placeholder="e.g., 96"
            value={torqueSetting}
            onChange={(e) => setTorqueSetting(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
          />
        </div>
      </div>

      {/* Advanced F1 Telemetry Data Panel */}
      {showAdvancedTelemetry && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 p-5 rounded-lg border border-blue-800">
            <h3 className="text-blue-300 font-orbitron text-lg mb-4 flex items-center">
              <span className="mr-2">🏎️</span> F1-Grade Telemetry Data
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg">
                <h4 className="text-blue-400 text-sm font-medium mb-2">Cornering Performance</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-900 p-2 rounded-lg">
                    <p className="text-gray-400">Max Lateral G</p>
                    <p className="text-white text-lg font-medium">{corneringG.toFixed(2)}g</p>
                  </div>
                  <div className="bg-gray-900 p-2 rounded-lg">
                    <p className="text-gray-400">Apex Speed</p>
                    <p className="text-white text-lg font-medium">{Math.round(60 + (corneringG * 20))} mph</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg">
                <h4 className="text-blue-400 text-sm font-medium mb-2">Acceleration Data</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-900 p-2 rounded-lg">
                    <p className="text-gray-400">Top Speed</p>
                    <p className="text-white text-lg font-medium">{Math.round(maxSpeed)} mph</p>
                  </div>
                  <div className="bg-gray-900 p-2 rounded-lg">
                    <p className="text-gray-400">Avg Speed</p>
                    <p className="text-white text-lg font-medium">{Math.round(avgSpeed)} mph</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg">
                <h4 className="text-blue-400 text-sm font-medium mb-2">Braking Performance</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-900 p-2 rounded-lg">
                    <p className="text-gray-400">Max Braking G</p>
                    <p className="text-white text-lg font-medium">{maxBraking.toFixed(2)}g</p>
                  </div>
                  <div className="bg-gray-900 p-2 rounded-lg">
                    <p className="text-gray-400">Braking Distance</p>
                    <p className="text-white text-lg font-medium">{Math.round(120 - (maxBraking * 20))}ft</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 bg-opacity-70 p-4 rounded-lg mb-4">
              <h4 className="text-blue-400 text-sm font-medium mb-3">Tire Temperature Map</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white
                    ${peakTireTemp > 190 ? 'bg-red-700' : 
                      peakTireTemp > 170 ? 'bg-orange-600' : 
                      peakTireTemp > 150 ? 'bg-green-600' : 'bg-blue-700'}`}>
                    <div className="text-center">
                      <p className="text-xs">Front Left</p>
                      <p className="text-lg font-bold">{Math.round(peakTireTemp - 5)}°F</p>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-center text-gray-400">
                    Wear: {drivingStyle === 'Aggressive' ? '35' : drivingStyle === 'Dynamic' ? '25' : '15'}%
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white
                    ${peakTireTemp > 190 ? 'bg-red-700' : 
                      peakTireTemp > 170 ? 'bg-orange-600' : 
                      peakTireTemp > 150 ? 'bg-green-600' : 'bg-blue-700'}`}>
                    <div className="text-center">
                      <p className="text-xs">Front Right</p>
                      <p className="text-lg font-bold">{Math.round(peakTireTemp)}°F</p>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-center text-gray-400">
                    Wear: {drivingStyle === 'Aggressive' ? '45' : drivingStyle === 'Dynamic' ? '30' : '20'}%
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white
                    ${peakTireTemp > 190 ? 'bg-red-700' : 
                      peakTireTemp > 170 ? 'bg-orange-600' : 
                      peakTireTemp > 150 ? 'bg-green-600' : 'bg-blue-700'}`}>
                    <div className="text-center">
                      <p className="text-xs">Rear Left</p>
                      <p className="text-lg font-bold">{Math.round(peakTireTemp - 15)}°F</p>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-center text-gray-400">
                    Wear: {drivingStyle === 'Aggressive' ? '30' : drivingStyle === 'Dynamic' ? '22' : '12'}%
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white
                    ${peakTireTemp > 190 ? 'bg-red-700' : 
                      peakTireTemp > 170 ? 'bg-orange-600' : 
                      peakTireTemp > 150 ? 'bg-green-600' : 'bg-blue-700'}`}>
                    <div className="text-center">
                      <p className="text-xs">Rear Right</p>
                      <p className="text-lg font-bold">{Math.round(peakTireTemp - 10)}°F</p>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-center text-gray-400">
                    Wear: {drivingStyle === 'Aggressive' ? '40' : drivingStyle === 'Dynamic' ? '28' : '18'}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-800 bg-opacity-70 p-3 rounded-lg">
                <h4 className="text-blue-400 text-sm font-medium mb-2">Environmental Data</h4>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-gray-400">Air Temp: <span className="text-white">{surfaceTemp ? (parseInt(surfaceTemp) - 5) : 70}°F</span></p>
                  <p className="text-gray-400">Track Temp: <span className="text-white">{surfaceTemp || 75}°F</span></p>
                  <p className="text-gray-400">Humidity: <span className="text-white">{Math.round(50 + (Math.random() * 30))}%</span></p>
                  <p className="text-gray-400">Air Density: <span className="text-white">1.{Math.round(18 + (Math.random() * 5))} kg/m³</span></p>
                </div>
              </div>
              
              <div className="bg-gray-800 bg-opacity-70 p-3 rounded-lg">
                <h4 className="text-blue-400 text-sm font-medium mb-2">Performance Adjustments</h4>
                <p className="text-gray-400">Driving Style: <span className="text-white">{drivingStyle}</span></p>
                <p className="text-gray-400">Driving Mode: <span className="text-white capitalize">{drivingMode.replace('-', ' ')}</span></p>
                <p className="text-gray-400">Surface Condition: <span className="text-white">{gripLevel}</span></p>
                <p className="text-gray-400">Tire PSI F/R: <span className="text-white">{tirePressure || '32/30'}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drive Photos */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">Drive Photos</label>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center justify-center">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            multiple
            className="hidden" 
            id="photo-upload" 
          />
          <label 
            htmlFor="photo-upload"
            className="cursor-pointer flex flex-col items-center justify-center py-6 px-4"
          >
            <div className="text-blue-400 mb-2 text-3xl">📷</div>
            <div className="text-gray-300 text-sm">Click to add photos</div>
            {photos.length > 0 && (
              <div className="text-gray-400 text-xs mt-2">{photos.length} photo(s) selected</div>
            )}
          </label>
        </div>
      </div>

      {/* Notes & Points of Interest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Drive Notes</label>
          <textarea
            placeholder="Add notes about your drive..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 h-32"
          ></textarea>
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Points of Interest</label>
          <textarea
            placeholder="Notable stops, attractions, or driving features..."
            value={poiLog}
            onChange={(e) => setPoiLog(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 h-32"
          ></textarea>
        </div>
      </div>

      {/* Drive Rating */}
      <div className="mb-8">
        <label className="block text-gray-400 text-sm mb-1">Drive Rating</label>
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="text-3xl"
            >
              {star <= rating ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={submitDriveLog}
        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg w-full font-medium text-lg"
      >
        Submit Drive Journal Entry
      </button>
      
      {/* ApexVault Pit Wall Branding */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Powered by ApexVault™ Pit Wall Sovereign Rally Drive Logging System
        </p>
      </div>
    </div>
  );
};

export default DriveJournalPage;