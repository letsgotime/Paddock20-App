import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import MoodEnergyTracker from '../components/MoodEnergyTracker';
import RouteAnalytics from '../components/RouteAnalytics';
import EnhancedDriveTelemetry from '../components/EnhancedDriveTelemetry';
import WeatherDriveImpactAnalyzer from '../components/WeatherDriveImpactAnalyzer';
import PageHeader from '../components/PageHeader';

// Define interfaces for type safety
interface MoodEnergy {
  mood: number; // 1-10 scale for driver mood
  energy: number; // 1-10 scale for energy level
  focus: number; // 1-10 scale for driver focus
  confidence: number; // 1-10 scale for driver confidence
  comfort: number; // 1-10 scale for comfort level
  trackFamiliarity: number; // 1-10 scale for driver familiarity with route
  excitementFactor: number; // 1-10 scale for driver excitement
  stressLevel: number; // 1-10 scale for driver stress
  timestamps?: { // Optional timestamps for mood/energy changes
    [key: string]: {
      mood?: number;
      energy?: number;
      note?: string;
    }
  };
  notes?: string; // Optional notes about mood/energy
}

interface AltitudeData {
  maxAltitude: number; // Maximum altitude in meters or feet
  minAltitude: number; // Minimum altitude
  totalAscent: number; // Total uphill in meters or feet
  totalDescent: number; // Total downhill
  altitudePoints?: number[][]; // [distance, altitude] pairs for visualization
}

interface RouteCharacteristics {
  totalTurns: number; // Total number of turns on route
  sharpTurns: number; // Number of sharp turns
  straightSections: number; // Number of straight sections
  hillClimbs: number; // Number of uphill sections
  descents: number; // Number of downhill sections
  averageCornerRadius?: number; // Average radius of corners
  technicalSections?: number; // Number of technical driving sections
  maxCornerG?: number; // Maximum G-force in corners
}

interface DriveEntry {
  id: string;
  date: string;
  title: string;
  startLocation: string;
  endLocation: string;
  waypoints: string[];
  vehicle: string;
  distanceMiles: number;
  durationMinutes: number;
  weatherConditions: any;
  routeCustomizations: any;
  performanceSettings: {
    tirePressureAdjustment: number;
    torqueAdjustment: number;
    drivingMode: string;
    vehicleSpecs?: any;
    tireSetup?: any;
    drivingProfile?: any;
    curvatureMetrics?: {
      intensity: number;
      trnRange: string;
    };
  };
  pointsOfInterest?: {
    events: any[];
    culturalSpots: any[];
  };
  notes?: string;
  photos?: string[];
  rating?: number;
  isFromRoutePlanner: boolean;
  moodEnergy?: MoodEnergy; // New field for mood and energy tracking
  altitudeData?: AltitudeData; // New field for altitude tracking
  routeCharacteristics?: RouteCharacteristics; // New field for route characteristics
}

// Mock data for the wireframe
const mockDriveEntries: DriveEntry[] = [
  {
    id: "1",
    date: "2025-04-28T10:30:00.000Z",
    title: "Blue Ridge Parkway Run",
    startLocation: "Asheville, NC",
    endLocation: "Blowing Rock, NC",
    waypoints: ["Craggy Gardens", "Linville Falls"],
    vehicle: "Ferrari F8 Tributo",
    distanceMiles: 82.5,
    durationMinutes: 124,
    weatherConditions: {
      temperature: 72,
      condition: "Sunny",
      humidity: 45,
      windSpeed: 5
    },
    routeCustomizations: {
      roundTrip: false,
      includeScenic: true,
      avoidTraffic: true
    },
    performanceSettings: {
      tirePressureAdjustment: 2,
      torqueAdjustment: 5,
      drivingMode: "Sport+",
      curvatureMetrics: {
        intensity: 4,
        trnRange: "6-8 TRN/km (Spirited)"
      }
    },
    pointsOfInterest: {
      events: [],
      culturalSpots: [
        { id: "cs1", name: "Mast General Store", category: "historic" }
      ]
    },
    notes: "Amazing drive with perfect weather. The F8 handled the curves beautifully.",
    photos: [
      "/assets/mockdrive1_photo1.jpg",
      "/assets/mockdrive1_photo2.jpg"
    ],
    rating: 5,
    isFromRoutePlanner: true,
    moodEnergy: {
      mood: 9,
      energy: 8,
      focus: 9,
      confidence: 8,
      comfort: 9,
      trackFamiliarity: 7,
      excitementFactor: 9,
      stressLevel: 3,
      timestamps: {
        "0": { mood: 8, energy: 7, note: "Starting the journey - excited but a bit anxious" },
        "25": { mood: 9, energy: 8, note: "Settling into the rhythm of the parkway" },
        "50": { mood: 10, energy: 9, note: "Perfect driving conditions near Craggy Gardens" },
        "75": { mood: 9, energy: 7, note: "Taking in the views, slightly tiring but still focused" }
      },
      notes: "Started slightly nervous but quickly got into the flow. The Ferrari was responsive and inspiring confidence throughout."
    },
    altitudeData: {
      maxAltitude: 5721, // in feet
      minAltitude: 3165,
      totalAscent: 3250,
      totalDescent: 2950,
      altitudePoints: [
        [0, 3520], [10, 3850], [20, 4200], [30, 4780], 
        [40, 5250], [50, 5721], [60, 5400], [70, 4850], 
        [80, 3750], [82.5, 3165]
      ]
    },
    routeCharacteristics: {
      totalTurns: 147,
      sharpTurns: 28,
      straightSections: 12,
      hillClimbs: 14,
      descents: 12,
      averageCornerRadius: 85, // feet
      technicalSections: 6,
      maxCornerG: 0.8
    }
  },
  {
    id: "2",
    date: "2025-04-25T14:15:00.000Z",
    title: "Mountain to Coast",
    startLocation: "Boone, NC",
    endLocation: "Wilmington, NC",
    waypoints: ["Winston-Salem", "Raleigh"],
    vehicle: "Porsche 911 Carrera S",
    distanceMiles: 330,
    durationMinutes: 315,
    weatherConditions: {
      temperature: 68,
      condition: "Partly Cloudy",
      humidity: 60,
      windSpeed: 8
    },
    routeCustomizations: {
      roundTrip: false,
      includeScenic: false,
      avoidTraffic: true
    },
    performanceSettings: {
      tirePressureAdjustment: 0,
      torqueAdjustment: 0,
      drivingMode: "Normal",
      curvatureMetrics: {
        intensity: 2,
        trnRange: "2-4 TRN/km (Gentle)"
      }
    },
    pointsOfInterest: {
      events: [],
      culturalSpots: []
    },
    notes: "Long drive but the Porsche was comfortable the entire way.",
    photos: [],
    rating: 4,
    isFromRoutePlanner: true,
    moodEnergy: {
      mood: 7,
      energy: 6, 
      focus: 8,
      confidence: 9,
      comfort: 9,
      trackFamiliarity: 6,
      excitementFactor: 5,
      stressLevel: 4,
      timestamps: {
        "0": { mood: 8, energy: 8, note: "Fresh and ready for a long drive" },
        "80": { mood: 7, energy: 7, note: "Smooth driving through Winston-Salem" },
        "160": { mood: 6, energy: 5, note: "Starting to feel the fatigue near Raleigh" },
        "240": { mood: 5, energy: 4, note: "Long stretches of highway getting monotonous" },
        "300": { mood: 7, energy: 6, note: "Energy picking up as we approach the coast" }
      },
      notes: "Highway driving was comfortable but monotonous at times. The Porsche's comfort features made the long journey bearable."
    },
    altitudeData: {
      maxAltitude: 3333, // in feet
      minAltitude: 35,
      totalAscent: 850,
      totalDescent: 4150,
      altitudePoints: [
        [0, 3333], [50, 2800], [100, 2100], [150, 1450], 
        [200, 900], [250, 400], [300, 150], [330, 35]
      ]
    },
    routeCharacteristics: {
      totalTurns: 92,
      sharpTurns: 8,
      straightSections: 37,
      hillClimbs: 5,
      descents: 15,
      averageCornerRadius: 120, // feet
      technicalSections: 2,
      maxCornerG: 0.4
    }
  }
];

const DriveJournalPage: React.FC = () => {
  // State for drive entries, selected entry, and edit mode
  const [driveEntries, setDriveEntries] = useState<DriveEntry[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // State for new/edited entry form
  const [editForm, setEditForm] = useState<Partial<DriveEntry>>({
    title: "",
    startLocation: "",
    endLocation: "",
    waypoints: [],
    vehicle: "",
    distanceMiles: 0,
    durationMinutes: 0,
    notes: "",
    rating: 0,
    performanceSettings: {
      tirePressureAdjustment: 0,
      torqueAdjustment: 0,
      drivingMode: "Normal",
    }
  });
  
  // State for vehicle selection
  const [selectedVehicle, setSelectedVehicle] = useState("");
  
  // State for telemetry options
  const [showTelemetryOptions, setShowTelemetryOptions] = useState(false);
  
  // State for weather data
  const [weatherData, setWeatherData] = useState<any>(null);
  
  // State for photos
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    dateFrom: "",
    dateTo: "",
    vehicle: "",
    routeType: "",
    minRating: 0
  });
  
  // Load data on component mount
  useEffect(() => {
    // Check if we're on the new entry route
    const currentPath = window.location.pathname;
    if (currentPath === '/drive-journal/new') {
      // If we're on the new entry page, start with a new drive entry form
      setIsAddingNew(true);
      initializeNewDriveForm(false);
      return;
    }
    
    // In the standalone app, we'll load entries from API/database
    // For now, using mock data
    setDriveEntries(mockDriveEntries);
    
    // If there are entries, select the first one by default
    if (mockDriveEntries.length > 0) {
      setSelectedDriveId(mockDriveEntries[0].id);
    }
  }, []);
  
  // Get the currently selected drive
  const selectedDrive = driveEntries.find(drive => drive.id === selectedDriveId) || null;
  
  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Partial<DriveEntry>],
          [child]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle waypoint changes
  const handleWaypointChange = (index: number, value: string) => {
    setEditForm(prev => {
      const updatedWaypoints = [...(prev.waypoints || [])];
      updatedWaypoints[index] = value;
      return {
        ...prev,
        waypoints: updatedWaypoints
      };
    });
  };
  
  // Add waypoint
  const addWaypoint = () => {
    setEditForm(prev => ({
      ...prev,
      waypoints: [...(prev.waypoints || []), ""]
    }));
  };
  
  // Remove waypoint
  const removeWaypoint = (index: number) => {
    setEditForm(prev => {
      const updatedWaypoints = [...(prev.waypoints || [])];
      updatedWaypoints.splice(index, 1);
      return {
        ...prev,
        waypoints: updatedWaypoints
      };
    });
  };
  
  // Initialize edit form with selected drive data
  const initializeEditForm = () => {
    if (selectedDrive) {
      setEditForm(selectedDrive);
      setSelectedVehicle(selectedDrive.vehicle);
    }
    setIsEditMode(true);
  };
  
  // State for tracking if we're adding a past experience
  const [isPastExperience, setIsPastExperience] = useState(false);
  
  // Initialize a new drive form
  const initializeNewDriveForm = (isPast: boolean) => {
    // Reset form to default values
    setEditForm({
      title: "",
      startLocation: "",
      endLocation: "",
      waypoints: [],
      vehicle: selectedVehicle || "",
      distanceMiles: 0,
      durationMinutes: 0,
      notes: "",
      rating: 0,
      performanceSettings: {
        tirePressureAdjustment: 0,
        torqueAdjustment: 0,
        drivingMode: "Normal",
      }
    });
    
    setIsPastExperience(isPast);
    setIsAddingNew(true);
    setIsEditMode(true);
  };
  
  // Handle save functionality
  const handleSave = () => {
    if (!editForm.title || !editForm.startLocation || !editForm.endLocation || !editForm.vehicle) {
      alert("Please fill out all required fields.");
      return;
    }
    
    if (isAddingNew) {
      // Create a new DriveEntry
      const newDrive: DriveEntry = {
        id: `drive_${Date.now()}`,
        date: new Date().toISOString(),
        title: editForm.title || "",
        startLocation: editForm.startLocation || "",
        endLocation: editForm.endLocation || "",
        waypoints: editForm.waypoints || [],
        vehicle: editForm.vehicle || "",
        distanceMiles: editForm.distanceMiles || 0,
        durationMinutes: editForm.durationMinutes || 0,
        weatherConditions: weatherData || {},
        routeCustomizations: {},
        performanceSettings: editForm.performanceSettings || {
          tirePressureAdjustment: 0,
          torqueAdjustment: 0,
          drivingMode: "Normal"
        },
        notes: editForm.notes || "",
        photos: photos,
        rating: editForm.rating || 0,
        isFromRoutePlanner: false,
        // Initialize with default mood and energy values for a new entry
        moodEnergy: {
          mood: 8,
          energy: 8,
          focus: 8,
          confidence: 8,
          comfort: 8,
          trackFamiliarity: 5,
          excitementFactor: 7,
          stressLevel: 3,
          timestamps: {
            "0": { mood: 8, energy: 8, note: "Starting a new drive entry" }
          }
        },
        // Initialize with empty altitude data
        altitudeData: {
          maxAltitude: 0,
          minAltitude: 0,
          totalAscent: 0,
          totalDescent: 0,
          altitudePoints: []
        },
        // Initialize with empty route characteristics
        routeCharacteristics: {
          totalTurns: 0,
          sharpTurns: 0,
          straightSections: 0,
          hillClimbs: 0,
          descents: 0
        }
      };
      
      // Add to driveEntries list
      setDriveEntries([newDrive, ...driveEntries]);
      
      // Select the new entry
      setSelectedDriveId(newDrive.id);
    } else {
      // Update existing entry
      const updatedEntries = driveEntries.map(drive =>
        drive.id === selectedDriveId ? { ...drive, ...editForm } : drive
      );
      
      setDriveEntries(updatedEntries);
    }
    
    // Exit edit mode
    setIsEditMode(false);
    setIsAddingNew(false);
  };
  
  // Handle cancel edit/add
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddingNew(false);
  };
  
  // Handle delete
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this drive journal entry?")) {
      const updatedEntries = driveEntries.filter(drive => drive.id !== selectedDriveId);
      setDriveEntries(updatedEntries);
      
      if (updatedEntries.length > 0) {
        setSelectedDriveId(updatedEntries[0].id);
      } else {
        setSelectedDriveId(null);
      }
    }
  };
  
  // Filter function
  const applyFilters = () => {
    // Implementation for filtering entries based on filterOptions
    console.log("Applying filters:", filterOptions);
    
    // This would filter the entries based on the criteria
    // For now, just reset to the mock data
    setDriveEntries(mockDriveEntries);
  };
  
  return (
    <div className="min-h-screen bg-black bg-carbon-fiber text-white">
      <PageHeader title="DRIVE JOURNAL" subtitle="RECORD AND ANALYZE YOUR DRIVING EXPERIENCES" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - Drive list and filters */}
          <div className="lg:w-1/4 bg-black bg-opacity-60 p-4 rounded-lg border border-blue-900">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-blue-400 text-xl font-orbitron">YOUR DRIVES</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => initializeNewDriveForm(false)}
                  className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  + Add New
                </button>
                <button
                  onClick={() => initializeNewDriveForm(true)}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  + Past Drive
                </button>
              </div>
            </div>
            
            {/* Filter section */}
            <div className="mb-6">
              <h3 className="text-gray-400 text-sm font-medium mb-3">FILTER DRIVES</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 text-xs block mb-1">DATE RANGE</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-full"
                      value={filterOptions.dateFrom}
                      onChange={(e) => setFilterOptions({...filterOptions, dateFrom: e.target.value})}
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-full"
                      value={filterOptions.dateTo}
                      onChange={(e) => setFilterOptions({...filterOptions, dateTo: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-300 text-xs block mb-1">VEHICLE</label>
                  <select
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-full"
                    value={filterOptions.vehicle}
                    onChange={(e) => setFilterOptions({...filterOptions, vehicle: e.target.value})}
                  >
                    <option value="">All Vehicles</option>
                    <option value="Ferrari F8 Tributo">Ferrari F8 Tributo</option>
                    <option value="Porsche 911 Carrera S">Porsche 911 Carrera S</option>
                    <option value="BMW M4 Competition">BMW M4 Competition</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-gray-300 text-xs block mb-1">ROUTE TYPE</label>
                  <select
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-full"
                    value={filterOptions.routeType}
                    onChange={(e) => setFilterOptions({...filterOptions, routeType: e.target.value})}
                  >
                    <option value="">All Routes</option>
                    <option value="mountain">Mountain Roads</option>
                    <option value="highway">Highway Cruises</option>
                    <option value="city">City Drives</option>
                    <option value="scenic">Scenic Routes</option>
                    <option value="track">Track Sessions</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-gray-300 text-xs block mb-1">MINIMUM RATING</label>
                  <select
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-full"
                    value={filterOptions.minRating}
                    onChange={(e) => setFilterOptions({...filterOptions, minRating: parseInt(e.target.value)})}
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                
                <button
                  onClick={applyFilters}
                  className="w-full bg-blue-800 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium mt-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>
            
            {/* Drive list */}
            <div className="space-y-3 mt-6">
              <h3 className="text-gray-400 text-sm font-medium mb-3">DRIVE ENTRIES</h3>
              {driveEntries.map(drive => (
                <div
                  key={drive.id}
                  className={`p-3 rounded border transition-all cursor-pointer ${
                    selectedDriveId === drive.id
                      ? 'bg-blue-900/40 border-blue-500'
                      : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedDriveId(drive.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-blue-300 font-medium">{drive.title}</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {formatDate(drive.date)}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {drive.vehicle} • {drive.distanceMiles} mi • {drive.durationMinutes} min
                      </p>
                    </div>
                    {drive.rating && (
                      <div className="flex items-center bg-gray-900 px-2 py-1 rounded text-yellow-400 text-xs">
                        {drive.rating}/5 ★
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:w-3/4">
            {isEditMode ? (
              /* Edit/Add form */
              <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-blue-900">
                <h2 className="text-blue-400 text-xl font-orbitron mb-6">
                  {isAddingNew ? (isPastExperience ? "ADD PAST DRIVE" : "ADD NEW DRIVE") : "EDIT DRIVE"}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">DRIVE TITLE*</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title || ""}
                      onChange={handleFormChange}
                      className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm w-full"
                      placeholder="Enter a title for this drive"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">VEHICLE*</label>
                    <select
                      name="vehicle"
                      value={editForm.vehicle || ""}
                      onChange={handleFormChange}
                      className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm w-full"
                    >
                      <option value="">Select a vehicle</option>
                      <option value="Ferrari F8 Tributo">Ferrari F8 Tributo</option>
                      <option value="Porsche 911 Carrera S">Porsche 911 Carrera S</option>
                      <option value="BMW M4 Competition">BMW M4 Competition</option>
                      <option value="Audi RS7">Audi RS7</option>
                      <option value="McLaren 720S">McLaren 720S</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">START LOCATION*</label>
                    <input
                      type="text"
                      name="startLocation"
                      value={editForm.startLocation || ""}
                      onChange={handleFormChange}
                      className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm w-full"
                      placeholder="Starting point"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">END LOCATION*</label>
                    <input
                      type="text"
                      name="endLocation"
                      value={editForm.endLocation || ""}
                      onChange={handleFormChange}
                      className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm w-full"
                      placeholder="Ending point"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">DISTANCE (MILES)</label>
                    <input
                      type="number"
                      name="distanceMiles"
                      value={editForm.distanceMiles || 0}
                      onChange={handleFormChange}
                      className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm w-full"
                      placeholder="Distance in miles"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">DURATION (MINUTES)</label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={editForm.durationMinutes || 0}
                      onChange={handleFormChange}
                      className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm w-full"
                      placeholder="Duration in minutes"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-gray-300 text-sm block mb-2">WAYPOINTS</label>
                    <div className="space-y-2">
                      {(editForm.waypoints || []).map((waypoint, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={waypoint}
                            onChange={(e) => handleWaypointChange(index, e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm flex-grow"
                            placeholder={`Waypoint ${index + 1}`}
                          />
                          <button
                            onClick={() => removeWaypoint(index)}
                            className="bg-red-900 hover:bg-red-800 text-white px-3 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addWaypoint}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded text-sm"
                      >
                        + Add Waypoint
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-gray-300 text-sm block mb-2">DRIVE NOTES</label>
                    <textarea
                      name="notes"
                      value={editForm.notes || ""}
                      onChange={handleFormChange}
                      className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm w-full h-32"
                      placeholder="Write your notes about this drive..."
                    ></textarea>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-gray-300 text-sm block mb-2">PERFORMANCE SETTINGS</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-lg">
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">TIRE PRESSURE ADJUSTMENT</label>
                        <input
                          type="range"
                          name="performanceSettings.tirePressureAdjustment"
                          min="-5"
                          max="5"
                          value={editForm.performanceSettings?.tirePressureAdjustment || 0}
                          onChange={handleFormChange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>-5 PSI</span>
                          <span>0</span>
                          <span>+5 PSI</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">TORQUE ADJUSTMENT</label>
                        <input
                          type="range"
                          name="performanceSettings.torqueAdjustment"
                          min="-10"
                          max="10"
                          value={editForm.performanceSettings?.torqueAdjustment || 0}
                          onChange={handleFormChange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Reduced</span>
                          <span>Stock</span>
                          <span>Enhanced</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">DRIVING MODE</label>
                        <select
                          name="performanceSettings.drivingMode"
                          value={editForm.performanceSettings?.drivingMode || "Normal"}
                          onChange={handleFormChange}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm w-full"
                        >
                          <option value="Comfort">Comfort</option>
                          <option value="Normal">Normal</option>
                          <option value="Sport">Sport</option>
                          <option value="Sport+">Sport+</option>
                          <option value="Track">Track</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-gray-300 text-sm block mb-2">DRIVE RATING</label>
                    <div className="flex space-x-4">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setEditForm({...editForm, rating})}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            (editForm.rating || 0) >= rating 
                              ? 'bg-yellow-500 text-gray-900' 
                              : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded"
                  >
                    Save Drive
                  </button>
                </div>
              </div>
            ) : selectedDrive ? (
              /* Selected drive details view */
              <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-blue-900">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-blue-400 text-2xl font-orbitron">{selectedDrive.title}</h2>
                    <p className="text-gray-400 mt-1">{formatDate(selectedDrive.date)}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={initializeEditForm}
                      className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-900/80 p-4 rounded-lg">
                    <h3 className="text-blue-300 font-medium mb-3">DRIVE DETAILS</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">Vehicle:</span>
                        <p className="text-white">{selectedDrive.vehicle}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Route:</span>
                        <p className="text-white">{selectedDrive.startLocation} to {selectedDrive.endLocation}</p>
                        {selectedDrive.waypoints && selectedDrive.waypoints.length > 0 && (
                          <div className="mt-1">
                            <span className="text-gray-400 text-xs">Waypoints:</span>
                            <p className="text-gray-300 text-sm">{selectedDrive.waypoints.join(' → ')}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <span className="text-gray-400 text-sm">Distance:</span>
                          <p className="text-white">{selectedDrive.distanceMiles} miles</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Duration:</span>
                          <p className="text-white">{selectedDrive.durationMinutes} minutes</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Rating:</span>
                        <p className="text-yellow-400">
                          {Array(selectedDrive.rating || 0).fill('★').join('')}
                          {Array(5 - (selectedDrive.rating || 0)).fill('☆').join('')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/80 p-4 rounded-lg">
                    <h3 className="text-blue-300 font-medium mb-3">WEATHER CONDITIONS</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="text-4xl mr-4">
                          {selectedDrive.weatherConditions?.condition === 'Sunny' && '☀️'}
                          {selectedDrive.weatherConditions?.condition === 'Partly Cloudy' && '⛅'}
                          {selectedDrive.weatherConditions?.condition === 'Cloudy' && '☁️'}
                          {selectedDrive.weatherConditions?.condition === 'Rainy' && '🌧️'}
                        </div>
                        <div>
                          <p className="text-white text-lg">{selectedDrive.weatherConditions?.temperature}°F</p>
                          <p className="text-gray-400 text-sm">{selectedDrive.weatherConditions?.condition}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <span className="text-gray-400 text-xs">Humidity:</span>
                          <p className="text-white">{selectedDrive.weatherConditions?.humidity}%</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">Wind:</span>
                          <p className="text-white">{selectedDrive.weatherConditions?.windSpeed} mph</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/80 p-4 rounded-lg">
                    <h3 className="text-blue-300 font-medium mb-3">PERFORMANCE SETTINGS</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">Driving Mode:</span>
                        <p className="text-white">{selectedDrive.performanceSettings.drivingMode}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Tire Pressure Adjustment:</span>
                        <p className="text-white">{selectedDrive.performanceSettings.tirePressureAdjustment > 0 ? '+' : ''}{selectedDrive.performanceSettings.tirePressureAdjustment} PSI</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Torque Adjustment:</span>
                        <p className="text-white">
                          {selectedDrive.performanceSettings.torqueAdjustment === 0 && 'Stock Setting'}
                          {selectedDrive.performanceSettings.torqueAdjustment > 0 && `Enhanced (+${selectedDrive.performanceSettings.torqueAdjustment})`}
                          {selectedDrive.performanceSettings.torqueAdjustment < 0 && `Reduced (${selectedDrive.performanceSettings.torqueAdjustment})`}
                        </p>
                      </div>
                      {selectedDrive.performanceSettings.curvatureMetrics && (
                        <div>
                          <span className="text-gray-400 text-sm">Route Intensity:</span>
                          <p className="text-white">{selectedDrive.performanceSettings.curvatureMetrics.trnRange}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Notes section */}
                {selectedDrive.notes && (
                  <div className="bg-gray-900/60 p-4 rounded-lg mb-8">
                    <h3 className="text-blue-300 font-medium mb-3">NOTES</h3>
                    <p className="text-gray-200 whitespace-pre-line">{selectedDrive.notes}</p>
                  </div>
                )}
                
                {/* Analytics components */}
                <div className="space-y-8">
                  {/* Mood and Energy Tracking */}
                  {selectedDrive.moodEnergy && (
                    <div className="bg-gray-900/60 p-4 rounded-lg">
                      <h3 className="text-blue-300 font-medium mb-4">DRIVER MOOD & ENERGY TRACKING</h3>
                      <MoodEnergyTracker moodEnergyData={selectedDrive.moodEnergy} />
                    </div>
                  )}
                  
                  {/* Route Analytics */}
                  {selectedDrive.altitudeData && selectedDrive.routeCharacteristics && (
                    <div className="bg-gray-900/60 p-4 rounded-lg">
                      <h3 className="text-blue-300 font-medium mb-4">ROUTE ANALYTICS</h3>
                      <RouteAnalytics 
                        altitudeData={selectedDrive.altitudeData} 
                        routeCharacteristics={selectedDrive.routeCharacteristics} 
                      />
                    </div>
                  )}
                  
                  {/* Enhanced Drive Telemetry */}
                  <div className="bg-gray-900/60 p-4 rounded-lg">
                    <h3 className="text-blue-300 font-medium mb-4">ENHANCED DRIVE TELEMETRY</h3>
                    <EnhancedDriveTelemetry driveEntry={selectedDrive} />
                  </div>
                  
                  {/* Weather Impact Analysis */}
                  <div className="bg-gray-900/60 p-4 rounded-lg">
                    <h3 className="text-blue-300 font-medium mb-4">WEATHER IMPACT ANALYSIS</h3>
                    <WeatherDriveImpactAnalyzer 
                      weatherConditions={selectedDrive.weatherConditions}
                      performanceSettings={selectedDrive.performanceSettings}
                    />
                  </div>
                </div>
                
                {/* Photos gallery */}
                {selectedDrive.photos && selectedDrive.photos.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-blue-300 font-medium mb-4">DRIVE PHOTOS</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedDrive.photos.map((photo, index) => (
                        <div key={index} className="bg-gray-900 rounded-lg overflow-hidden aspect-square">
                          <img 
                            src={photo} 
                            alt={`Drive photo ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* No drive selected state */
              <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-blue-900 flex flex-col items-center justify-center h-96">
                <p className="text-gray-400 mb-4">Select a drive from the list or create a new one</p>
                <button
                  onClick={() => initializeNewDriveForm(false)}
                  className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Create New Drive Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveJournalPage;