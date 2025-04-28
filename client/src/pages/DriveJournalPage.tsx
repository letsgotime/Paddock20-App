// /client/src/pages/DriveJournalPage.tsx

import React, { useState, useEffect } from "react";

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
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [vehicleUsed, setVehicleUsed] = useState("");
  const [curvatureRating, setCurvatureRating] = useState("Minimal");
  const [curvatureTRN, setCurvatureTRN] = useState<number | null>(null);
  const [surfaceTemp, setSurfaceTemp] = useState("");
  const [gripLevel, setGripLevel] = useState("");
  const [weatherImpact, setWeatherImpact] = useState("");
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

  const submitDriveLog = () => {
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
      id: `drive-${Date.now()}`
    };
    
    console.log(driveEntry);
    
    // Store in localStorage for demo purposes
    const existingEntries = JSON.parse(localStorage.getItem("driveJournalEntries") || "[]");
    localStorage.setItem("driveJournalEntries", JSON.stringify([driveEntry, ...existingEntries]));
    
    // Clear the planned drive data since it's now been logged
    localStorage.removeItem("plannedDrive");
    
    alert("Drive journal entry submitted!");
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">📓 Drive Journal</h1>
      
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

      {/* Surface Temperature, Grip, Weather Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Surface Temperature</label>
          <input
            type="text"
            placeholder="°F"
            value={surfaceTemp}
            onChange={(e) => setSurfaceTemp(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Grip Level</label>
          <select
            value={gripLevel}
            onChange={(e) => setGripLevel(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="">Select Grip Level</option>
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
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="">Select Weather Impact</option>
            <option value="None">None</option>
            <option value="Windy">Windy</option>
            <option value="Hot">Hot</option>
            <option value="Cold">Cold</option>
            <option value="Rainy">Rainy</option>
            <option value="Snow">Snow</option>
            <option value="Fog">Fog</option>
          </select>
        </div>
      </div>

      {/* Tire Pressure, Torque Setting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Tire Pressure</label>
          <input
            type="text"
            placeholder="PSI (front/rear)"
            value={tirePressure}
            onChange={(e) => setTirePressure(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Torque Setting</label>
          <input
            type="text"
            placeholder="e.g., 96 ft-lb for F8"
            value={torqueSetting}
            onChange={(e) => setTorqueSetting(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          />
        </div>
      </div>

      {/* Upload Photos */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">Upload Photos</label>
        <input
          type="file"
          multiple
          onChange={handlePhotoUpload}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {photos.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">{photos.length} photo(s) selected</p>
        )}
      </div>

      {/* Notes Field */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">Drive Notes</label>
        <textarea
          placeholder="Record your experience, conditions, performance notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        />
      </div>

      {/* Personal Rating */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">Personal Rating (1-10)</label>
        <input
          type="range"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
          <span>10</span>
        </div>
        <p className="text-center text-2xl text-white mt-2">{rating}</p>
      </div>

      {/* Points of Interest Log */}
      <div className="mb-8">
        <label className="block text-gray-400 text-sm mb-1">Points of Interest / Events</label>
        <textarea
          placeholder="Note any interesting stops, events, or highlights along the route..."
          value={poiLog}
          onChange={(e) => setPoiLog(e.target.value)}
          rows={2}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={submitDriveLog}
        className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-8 py-4 rounded w-full"
      >
        🏁 Save Drive Entry
      </button>
    </div>
  );
};

export default DriveJournalPage;