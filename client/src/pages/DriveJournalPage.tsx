import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import MoodEnergyTracker from '../components/MoodEnergyTracker';
import RouteAnalytics from '../components/RouteAnalytics';

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
    // Check for any pending drive from the Route Planner
    const pendingDrive = localStorage.getItem('pendingDriveJournal');
    
    if (pendingDrive) {
      // In a real app, we would process this data and save it to the database
      console.log("Found pending drive from Route Planner:", JSON.parse(pendingDrive));
      // Clear the pending drive after processing
      localStorage.removeItem('pendingDriveJournal');
    }
    
    // Load mock data
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
  
  // Initialize new drive form
  const initializeNewDriveForm = () => {
    setEditForm({
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
      },
      weatherConditions: null,
      isFromRoutePlanner: false,
      date: new Date().toISOString(),
      moodEnergy: {
        mood: 8,
        energy: 8,
        focus: 8,
        confidence: 8,
        comfort: 8,
        trackFamiliarity: 5,
        excitementFactor: 8,
        stressLevel: 3,
        timestamps: {
          "0": { mood: 8, energy: 8, note: "Starting the drive" }
        }
      },
      altitudeData: {
        maxAltitude: 0,
        minAltitude: 0,
        totalAscent: 0,
        totalDescent: 0,
        altitudePoints: []
      },
      routeCharacteristics: {
        totalTurns: 0,
        sharpTurns: 0,
        straightSections: 0,
        hillClimbs: 0,
        descents: 0
      }
    });
    setIsAddingNew(true);
    setIsEditMode(true);
  };
  
  // Save drive entry (edit or new)
  const saveDriveEntry = () => {
    if (isAddingNew) {
      // Generate a new ID and add to entries
      const newDrive = {
        ...editForm,
        id: `${driveEntries.length + 1}`
      } as DriveEntry;
      
      setDriveEntries([newDrive, ...driveEntries]);
      setSelectedDriveId(newDrive.id);
    } else {
      // Update existing entry
      setDriveEntries(driveEntries.map(drive => 
        drive.id === selectedDriveId ? { ...drive, ...editForm } as DriveEntry : drive
      ));
    }
    
    setIsEditMode(false);
    setIsAddingNew(false);
  };
  
  // Cancel edit
  const cancelEdit = () => {
    setIsEditMode(false);
    setIsAddingNew(false);
  };
  
  // Delete drive entry
  const deleteDriveEntry = () => {
    if (selectedDriveId && confirm("Are you sure you want to delete this drive?")) {
      const updatedEntries = driveEntries.filter(drive => drive.id !== selectedDriveId);
      setDriveEntries(updatedEntries);
      
      if (updatedEntries.length > 0) {
        setSelectedDriveId(updatedEntries[0].id);
      } else {
        setSelectedDriveId(null);
      }
    }
  };
  
  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setEditForm(prev => ({
      ...prev,
      rating
    }));
  };
  
  // Get TRN description based on intensity
  const getTrnDescription = (intensity: number) => {
    switch(intensity) {
      case 1: return "0-2 TRN/km (Minimal)";
      case 2: return "2-4 TRN/km (Gentle)";
      case 3: return "4-6 TRN/km (Moderate)"; 
      case 4: return "6-8 TRN/km (Spirited)";
      case 5: return "8-12+ TRN/km (Technical)";
      default: return "4-6 TRN/km (Moderate)";
    }
  };
  
  // Handle curvature intensity change
  const handleCurvatureIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intensity = parseInt(e.target.value);
    setEditForm(prev => ({
      ...prev,
      performanceSettings: {
        ...prev.performanceSettings!,
        curvatureMetrics: {
          intensity,
          trnRange: getTrnDescription(intensity)
        }
      }
    }));
  };
  
  // Handle mood and energy data changes
  const handleMoodEnergyChange = (data: MoodEnergy) => {
    setEditForm(prev => ({
      ...prev,
      moodEnergy: data
    }));
  };
  
  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">📔 Drive Journal</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Drive Entries List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-orbitron text-xl">Drive Log</h2>
            <button
              onClick={initializeNewDriveForm}
              className="bg-green-500 hover:bg-green-400 text-black font-medium px-4 py-2 rounded flex items-center gap-1"
            >
              <span>New Entry</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Filter Options - Collapsed by default */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <button
              className="flex justify-between items-center w-full text-white font-medium mb-2"
              onClick={() => document.getElementById('filterOptions')?.classList.toggle('hidden')}
            >
              <span>Filter Drives</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div id="filterOptions" className="hidden space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Date From</label>
                  <input
                    type="date"
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                    value={filterOptions.dateFrom}
                    onChange={(e) => setFilterOptions({...filterOptions, dateFrom: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Date To</label>
                  <input
                    type="date"
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                    value={filterOptions.dateTo}
                    onChange={(e) => setFilterOptions({...filterOptions, dateTo: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Vehicle</label>
                <select
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                  value={filterOptions.vehicle}
                  onChange={(e) => setFilterOptions({...filterOptions, vehicle: e.target.value})}
                >
                  <option value="">All Vehicles</option>
                  <option value="Ferrari F8 Tributo">Ferrari F8 Tributo</option>
                  <option value="Porsche 911 Carrera S">Porsche 911 Carrera S</option>
                  <option value="BMW M4 G82">BMW M4 G82</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Route Type</label>
                  <select
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                    value={filterOptions.routeType}
                    onChange={(e) => setFilterOptions({...filterOptions, routeType: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="Scenic">Scenic</option>
                    <option value="Track">Track Day</option>
                    <option value="Highway">Highway</option>
                    <option value="Urban">Urban</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Min Rating</label>
                  <select
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                    value={filterOptions.minRating}
                    onChange={(e) => setFilterOptions({...filterOptions, minRating: Number(e.target.value)})}
                  >
                    <option value="0">All Ratings</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end">
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Drive Entries List */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {driveEntries.length > 0 ? (
              driveEntries.map(drive => (
                <div
                  key={drive.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedDriveId === drive.id
                      ? 'bg-blue-900 border border-blue-700'
                      : 'bg-gray-900 border border-gray-800 hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedDriveId(drive.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{drive.title}</h3>
                      <p className="text-gray-400 text-sm">{formatDate(drive.date)}</p>
                    </div>
                    {drive.isFromRoutePlanner && (
                      <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full">
                        Route Planner
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <p className="text-gray-300 truncate">{drive.startLocation} to {drive.endLocation}</p>
                    <p className="text-gray-400">{drive.vehicle} • {drive.distanceMiles} miles</p>
                    <div className="mt-1 flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ${
                            star <= (drive.rating || 0) ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-center">
                <p className="text-gray-400">No drive entries yet</p>
                <button
                  onClick={initializeNewDriveForm}
                  className="mt-2 text-blue-400 hover:text-blue-300"
                >
                  Create your first entry
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Section - Selected Drive Details or Edit Form */}
        <div className="lg:col-span-2">
          {isEditMode ? (
            // Edit Form
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-blue-400 font-orbitron text-2xl">
                  {isAddingNew ? "New Drive Entry" : "Edit Drive Entry"}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={saveDriveEntry}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Drive Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title || ""}
                      onChange={handleFormChange}
                      className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                      placeholder="e.g., Mountain Drive Weekend"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Date</label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={editForm.date ? new Date(editForm.date).toISOString().slice(0, 16) : ""}
                      onChange={handleFormChange}
                      className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Starting Point</label>
                    <input
                      type="text"
                      name="startLocation"
                      value={editForm.startLocation || ""}
                      onChange={handleFormChange}
                      className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                      placeholder="e.g., Charlotte, NC"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Destination</label>
                    <input
                      type="text"
                      name="endLocation"
                      value={editForm.endLocation || ""}
                      onChange={handleFormChange}
                      className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                      placeholder="e.g., Asheville, NC"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-gray-300">Waypoints</label>
                      <button
                        onClick={addWaypoint}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                      >
                        + Add Waypoint
                      </button>
                    </div>
                    {(editForm.waypoints || []).length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No waypoints added</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(editForm.waypoints || []).map((waypoint, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={waypoint}
                              onChange={(e) => handleWaypointChange(index, e.target.value)}
                              className="flex-1 p-2 bg-gray-800 text-white rounded border border-gray-700"
                              placeholder="e.g., Hickory, NC"
                            />
                            <button
                              onClick={() => removeWaypoint(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Vehicle and Trip Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Vehicle</label>
                    <select
                      name="vehicle"
                      value={editForm.vehicle || ""}
                      onChange={handleFormChange}
                      className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                    >
                      <option value="">Select Vehicle</option>
                      <option value="Ferrari F8 Tributo">Ferrari F8 Tributo</option>
                      <option value="Porsche 911 Carrera S">Porsche 911 Carrera S</option>
                      <option value="BMW M4 G82">BMW M4 G82</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-1">Distance (miles)</label>
                      <input
                        type="number"
                        name="distanceMiles"
                        value={editForm.distanceMiles || ""}
                        onChange={handleFormChange}
                        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                        placeholder="0.0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        name="durationMinutes"
                        value={editForm.durationMinutes || ""}
                        onChange={handleFormChange}
                        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Your Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className="focus:outline-none"
                        >
                          <svg
                            className={`w-8 h-8 ${
                              (editForm.rating || 0) >= star
                                ? "text-yellow-400"
                                : "text-gray-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={editForm.notes || ""}
                      onChange={handleFormChange}
                      className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 h-32"
                      placeholder="Your thoughts, experiences, or notes about this drive..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Driver Mood & Energy Tracking */}
              <div className="mb-6">
                <h3 className="text-blue-400 font-semibold mb-4">Driver Mood & Energy Tracking</h3>
                <MoodEnergyTracker
                  moodEnergyData={editForm.moodEnergy || {
                    mood: 8,
                    energy: 8,
                    focus: 8,
                    confidence: 8,
                    comfort: 8,
                    trackFamiliarity: 5,
                    excitementFactor: 8,
                    stressLevel: 3,
                    timestamps: {
                      "0": { mood: 8, energy: 8, note: "Starting the drive" }
                    }
                  }}
                  onChange={handleMoodEnergyChange}
                  isEditing={true}
                  distanceMiles={editForm.distanceMiles || 0}
                />
              </div>
              
              {/* Telemetry and Performance Metrics */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowTelemetryOptions(!showTelemetryOptions)}
                  className="flex items-center justify-between w-full p-3 bg-blue-900 bg-opacity-30 text-white rounded-lg border border-blue-800"
                >
                  <span className="font-semibold">Enthusiast Performance Metrics</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${showTelemetryOptions ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTelemetryOptions && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    {/* Driving Dynamics */}
                    <div className="space-y-4">
                      <h3 className="text-green-500 font-semibold">Driving Dynamics</h3>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Driving Mode</label>
                        <select
                          name="performanceSettings.drivingMode"
                          value={editForm.performanceSettings?.drivingMode || "Normal"}
                          onChange={handleFormChange}
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        >
                          <option value="Eco">Eco</option>
                          <option value="Normal">Normal</option>
                          <option value="Sport">Sport</option>
                          <option value="Sport+">Sport+</option>
                          <option value="Track">Track</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">
                          Curvature Intensity (TRN/km)
                        </label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={(editForm.performanceSettings?.curvatureMetrics?.intensity) || 3}
                            onChange={handleCurvatureIntensityChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Minimal</span>
                            <span>Gentle</span>
                            <span>Moderate</span>
                            <span>Spirited</span>
                            <span>Technical</span>
                          </div>
                          <div className="text-right text-xs text-blue-400">
                            {getTrnDescription((editForm.performanceSettings?.curvatureMetrics?.intensity) || 3)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">
                            Tire Pressure Adj. (PSI)
                          </label>
                          <input
                            type="number"
                            name="performanceSettings.tirePressureAdjustment"
                            value={editForm.performanceSettings?.tirePressureAdjustment || 0}
                            onChange={handleFormChange}
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                            min="-5"
                            max="5"
                            step="0.5"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">
                            Torque Adj. (ft-lb)
                          </label>
                          <input
                            type="number"
                            name="performanceSettings.torqueAdjustment"
                            value={editForm.performanceSettings?.torqueAdjustment || 0}
                            onChange={handleFormChange}
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                            min="-20"
                            max="20"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Weather and Environment */}
                    <div className="space-y-4">
                      <h3 className="text-green-500 font-semibold">Weather Conditions</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">
                            Temperature (°F)
                          </label>
                          <input
                            type="number"
                            name="weatherConditions.temperature"
                            value={editForm.weatherConditions?.temperature || ""}
                            onChange={handleFormChange}
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">
                            Weather Condition
                          </label>
                          <select
                            name="weatherConditions.condition"
                            value={editForm.weatherConditions?.condition || ""}
                            onChange={handleFormChange}
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                          >
                            <option value="">Select Condition</option>
                            <option value="Sunny">Sunny</option>
                            <option value="Partly Cloudy">Partly Cloudy</option>
                            <option value="Cloudy">Cloudy</option>
                            <option value="Light Rain">Light Rain</option>
                            <option value="Heavy Rain">Heavy Rain</option>
                            <option value="Fog">Fog</option>
                            <option value="Snow">Snow</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">
                            Humidity (%)
                          </label>
                          <input
                            type="number"
                            name="weatherConditions.humidity"
                            value={editForm.weatherConditions?.humidity || ""}
                            onChange={handleFormChange}
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">
                            Wind Speed (mph)
                          </label>
                          <input
                            type="number"
                            name="weatherConditions.windSpeed"
                            value={editForm.weatherConditions?.windSpeed || ""}
                            onChange={handleFormChange}
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">
                          Road Surface Type
                        </label>
                        <select
                          name="weatherConditions.roadSurface"
                          value={editForm.weatherConditions?.roadSurface || ""}
                          onChange={handleFormChange}
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        >
                          <option value="">Select Surface</option>
                          <option value="Asphalt">Asphalt</option>
                          <option value="Concrete">Concrete</option>
                          <option value="Composite">Composite</option>
                          <option value="Gravel">Gravel</option>
                          <option value="Dirt">Dirt</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Photos Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Drive Photos</h3>
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Add Photos
                  </button>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 border border-dashed border-gray-600 text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Drag and drop photos here, or click to select files</p>
                  <p className="text-xs mt-1">Maximum 10 photos, 5MB each</p>
                </div>
              </div>
            </div>
          ) : selectedDrive ? (
            // Drive Details View
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-blue-400 font-orbitron text-2xl">{selectedDrive.title}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={initializeEditForm}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={deleteDriveEntry}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Basic Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                  <h3 className="text-green-500 font-semibold mb-3">Route Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-white">
                      <span className="text-gray-400">Date:</span>
                      <span>{formatDate(selectedDrive.date)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white">
                      <span className="text-gray-400">From:</span>
                      <span>{selectedDrive.startLocation}</span>
                    </div>
                    <div className="flex justify-between items-center text-white">
                      <span className="text-gray-400">To:</span>
                      <span>{selectedDrive.endLocation}</span>
                    </div>
                    
                    {selectedDrive.waypoints && selectedDrive.waypoints.length > 0 && (
                      <div className="pt-1">
                        <p className="text-gray-400 mb-1">Waypoints:</p>
                        <ul className="list-disc pl-5 text-white text-sm">
                          {selectedDrive.waypoints.map((waypoint, index) => (
                            <li key={index}>{waypoint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-white pt-2">
                      <span className="text-gray-400">Distance:</span>
                      <span>{selectedDrive.distanceMiles} miles</span>
                    </div>
                    <div className="flex justify-between items-center text-white">
                      <span className="text-gray-400">Duration:</span>
                      <span>{Math.floor(selectedDrive.durationMinutes / 60)}h {selectedDrive.durationMinutes % 60}m</span>
                    </div>
                    
                    {selectedDrive.isFromRoutePlanner && (
                      <div className="mt-3 p-2 bg-green-900 bg-opacity-30 rounded border border-green-800">
                        <p className="text-green-400 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Route generated by Route Planner
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                  <h3 className="text-green-500 font-semibold mb-3">Vehicle & Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-white">
                      <span className="text-gray-400">Vehicle:</span>
                      <span>{selectedDrive.vehicle}</span>
                    </div>
                    
                    {selectedDrive.performanceSettings && (
                      <>
                        <div className="flex justify-between items-center text-white">
                          <span className="text-gray-400">Driving Mode:</span>
                          <span>{selectedDrive.performanceSettings.drivingMode}</span>
                        </div>
                        
                        {selectedDrive.performanceSettings.curvatureMetrics && (
                          <div className="flex justify-between items-center text-white">
                            <span className="text-gray-400">Route Curvature:</span>
                            <span>{selectedDrive.performanceSettings.curvatureMetrics.trnRange}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-white">
                          <span className="text-gray-400">Tire Pressure Adj:</span>
                          <span>{selectedDrive.performanceSettings.tirePressureAdjustment > 0 ? "+" : ""}{selectedDrive.performanceSettings.tirePressureAdjustment} PSI</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-white">
                          <span className="text-gray-400">Torque Adj:</span>
                          <span>{selectedDrive.performanceSettings.torqueAdjustment > 0 ? "+" : ""}{selectedDrive.performanceSettings.torqueAdjustment} ft-lb</span>
                        </div>
                      </>
                    )}
                    
                    <div className="pt-2">
                      <div className="text-gray-400 mb-1">Your Rating:</div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${
                              star <= (selectedDrive.rating || 0) ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enthusiast Metrics */}
              {selectedDrive.performanceSettings && selectedDrive.performanceSettings.curvatureMetrics && (
                <div className="bg-blue-900 bg-opacity-20 p-5 rounded-lg border border-blue-800">
                  <h3 className="text-blue-400 font-semibold mb-3">Enthusiast Edge Metrics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="text-gray-300 text-sm font-medium">Curvature Analysis</div>
                      <div className="bg-black bg-opacity-50 p-3 rounded">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">TRN Rating:</span>
                          <span className="text-white">{selectedDrive.performanceSettings.curvatureMetrics.trnRange}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-400">Est. Turns:</span>
                          <span className="text-white">
                            {selectedDrive.performanceSettings.curvatureMetrics.intensity === 1 ? "0-20 turns" :
                             selectedDrive.performanceSettings.curvatureMetrics.intensity === 2 ? "20-45 turns" :
                             selectedDrive.performanceSettings.curvatureMetrics.intensity === 3 ? "45-70 turns" :
                             selectedDrive.performanceSettings.curvatureMetrics.intensity === 4 ? "70-100 turns" :
                             "100+ turns"}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ width: `${(selectedDrive.performanceSettings.curvatureMetrics.intensity / 5) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Straight</span>
                            <span>Technical</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-gray-300 text-sm font-medium">Weather Impact</div>
                      <div className="bg-black bg-opacity-50 p-3 rounded">
                        {selectedDrive.weatherConditions ? (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Condition:</span>
                              <span className="text-white">{selectedDrive.weatherConditions.condition}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-400">Temperature:</span>
                              <span className="text-white">{selectedDrive.weatherConditions.temperature}°F</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-400">Grip Level:</span>
                              <span className="text-white">
                                {selectedDrive.weatherConditions.condition === 'Rain' || selectedDrive.weatherConditions.condition === 'Light Rain' 
                                  ? 'Reduced (Wet)' 
                                  : selectedDrive.weatherConditions.condition === 'Snow' 
                                  ? 'Poor (Snow/Ice)' 
                                  : selectedDrive.weatherConditions.humidity > 80 
                                  ? 'Moderate (High Humidity)' 
                                  : 'Optimal (Dry)'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">Weather data not available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-gray-300 text-sm font-medium">Performance Insights</div>
                      <div className="bg-black bg-opacity-50 p-3 rounded">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Optimal Temp Range:</span>
                          <span className="text-white">68°F - 85°F</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-400">Surface Condition:</span>
                          <span className="text-white">
                            {selectedDrive.weatherConditions && selectedDrive.weatherConditions.condition === 'Rain' 
                              ? 'Wet Asphalt' 
                              : 'Dry Asphalt'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-400">Ideal Tire Pressure:</span>
                          <span className="text-white">Front: 32 PSI / Rear: 30 PSI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notes Section */}
              {selectedDrive.notes && (
                <div className="bg-black bg-opacity-40 p-5 rounded-lg">
                  <h3 className="text-green-500 font-semibold mb-3">Your Notes</h3>
                  <p className="text-white">{selectedDrive.notes}</p>
                </div>
              )}
              
              {/* Photos Section */}
              {selectedDrive.photos && selectedDrive.photos.length > 0 && (
                <div>
                  <h3 className="text-green-500 font-semibold mb-3">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedDrive.photos.map((photo, index) => (
                      <div key={index} className="relative h-40 overflow-hidden rounded-lg">
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <p className="text-gray-500">[Photo Preview]</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Driver Mood & Energy Tracking */}
              {selectedDrive.moodEnergy && (
                <div className="mb-8">
                  <MoodEnergyTracker
                    moodEnergyData={selectedDrive.moodEnergy}
                    onChange={handleMoodEnergyChange}
                    isEditing={false}
                    distanceMiles={selectedDrive.distanceMiles}
                  />
                </div>
              )}
              
              {/* Route Analytics & Telemetry */}
              {(selectedDrive.altitudeData || selectedDrive.routeCharacteristics) && (
                <div className="mb-8">
                  <RouteAnalytics
                    altitudeData={selectedDrive.altitudeData}
                    routeCharacteristics={selectedDrive.routeCharacteristics}
                    distance={selectedDrive.distanceMiles}
                  />
                </div>
              )}
              
              {/* Points of Interest */}
              {selectedDrive.pointsOfInterest && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedDrive.pointsOfInterest.events && selectedDrive.pointsOfInterest.events.length > 0 && (
                    <div className="bg-black bg-opacity-40 p-4 rounded-lg">
                      <h3 className="text-green-500 font-semibold mb-3">Events Along Route</h3>
                      <ul className="list-disc pl-5 text-gray-300 space-y-1">
                        {selectedDrive.pointsOfInterest.events.map((event: any, index: number) => (
                          <li key={index}>{event.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedDrive.pointsOfInterest.culturalSpots && selectedDrive.pointsOfInterest.culturalSpots.length > 0 && (
                    <div className="bg-black bg-opacity-40 p-4 rounded-lg">
                      <h3 className="text-green-500 font-semibold mb-3">Car Culture Spots</h3>
                      <ul className="list-disc pl-5 text-gray-300 space-y-1">
                        {selectedDrive.pointsOfInterest.culturalSpots.map((spot: any, index: number) => (
                          <li key={index}>{spot.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // No drive selected view
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center h-64 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="text-white text-xl mb-2">No Drive Selected</h3>
              <p className="text-gray-400">Select a drive from the list or create a new entry</p>
              <button
                onClick={initializeNewDriveForm}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
              >
                Create New Drive Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveJournalPage;