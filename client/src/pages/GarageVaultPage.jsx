import React, { useState, useEffect, useRef } from 'react';
import supabase from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import { exportToPdf, exportToCsv, printElement } from '../utils/exportUtils';
import TireTracker from '../components/TireTracker';
import TireManagementDashboard from '../components/TireManagementDashboard';
import GlossTracker from '../components/GlossTracker';
import PreDriveChecklist from '../components/PreDriveChecklist';
import WeeklyChecklist from '../components/WeeklyChecklist';
import MonthlyChecklist from '../components/MonthlyChecklist';
import QuarterlyChecklist from '../components/QuarterlyChecklist';
import SeasonalAdaptationChecklist from '../components/SeasonalAdaptationChecklist';
import { vehicleProfile, garageVehicles } from '../data/vehicles';

function GarageVaultPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decodedData, setDecodedData] = useState({});
  const [decoding, setDecoding] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeTab, setActiveTab] = useState('specs');
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [seasonalMaintenanceItems, setSeasonalMaintenanceItems] = useState([]);
  const [vehicleData, setVehicleData] = useState(vehicleProfile);

  // Export menu state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // Fetch vehicles data
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const { data, error } = await supabase
          .from('Vehicles')
          .select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setVehicles(data);
          setActiveVehicle(data[0]);
        } else {
          // Use garageVehicles if no database data available
          console.log("Using mock vehicle data");
          setVehicles(garageVehicles);
          setActiveVehicle(garageVehicles[0]);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error.message);
        // Fallback to garageVehicles array on error
        setVehicles(garageVehicles);
        setActiveVehicle(garageVehicles[0]);
      }
      setLoading(false);
    }
    fetchVehicles();
    
    // Generate suggested activities
    generateSuggestedActivities();
    
    // Mock weather alerts (would come from weather API in production)
    setWeatherAlerts([
      { type: 'Heavy Rain', message: 'Check windshield wipers and tire tread', severity: 'moderate' },
      { type: 'Heat Wave', message: 'Check coolant levels and A/C function', severity: 'high' }
    ]);
    
    // Generate seasonal maintenance based on current month
    generateSeasonalMaintenance();
  }, []);
  
  // Generate suggested activities based on vehicle data, weather, and history
  const generateSuggestedActivities = () => {
    const currentMonth = new Date().getMonth();
    const currentSeason = 
      currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
      currentMonth >= 5 && currentMonth <= 7 ? 'summer' :
      currentMonth >= 8 && currentMonth <= 10 ? 'fall' : 'winter';
    
    // Example activities based on season
    const seasonalActivities = {
      spring: [
        { title: "Interior Detailing", description: "Focus on your interior while it's not too hot outside", priority: "high" },
        { title: "Photo Shoot", description: "Diffused lighting is perfect for car photography", priority: "medium" },
        { title: "Maintenance Check", description: "Good time to inspect systems without heat interference", priority: "high" },
        { title: "Paint Correction", description: "Ideal time to address paint imperfections", priority: "medium" }
      ],
      summer: [
        { title: "Heat Protection", description: "Apply UV protection to interior surfaces", priority: "high" },
        { title: "Cooling System Check", description: "Ensure coolant levels are optimal", priority: "high" },
        { title: "Dawn/Dusk Photo Shoot", description: "Perfect lighting conditions for showcasing your car", priority: "medium" },
        { title: "Mountain Drive", description: "Take advantage of clear roads for a scenic drive", priority: "medium" }
      ],
      fall: [
        { title: "Winter Prep", description: "Apply paint protection before winter", priority: "high" },
        { title: "Tire Inspection", description: "Check tread depth for winter readiness", priority: "high" },
        { title: "Fall Colors Drive", description: "Document your car against autumn landscapes", priority: "medium" },
        { title: "Paint Sealant", description: "Protect your finish before harsh weather arrives", priority: "high" }
      ],
      winter: [
        { title: "Battery Check", description: "Cold weather affects battery performance", priority: "high" },
        { title: "Undercarriage Protection", description: "Protect against salt and ice damage", priority: "medium" },
        { title: "Interior Detailing", description: "Perfect time for deep cleaning while car is used less", priority: "medium" },
        { title: "Snow Photography", description: "Capture unique winter shots of your vehicle", priority: "low" }
      ]
    };
    
    setSuggestedActivities(seasonalActivities[currentSeason] || []);
  };
  
  // Generate seasonal maintenance items
  const generateSeasonalMaintenance = () => {
    const currentMonth = new Date().getMonth();
    const upcomingSeason = 
      currentMonth >= 1 && currentMonth <= 3 ? 'spring' :
      currentMonth >= 4 && currentMonth <= 6 ? 'summer' :
      currentMonth >= 7 && currentMonth <= 9 ? 'fall' : 'winter';
    
    const seasonalItems = {
      spring: [
        'Check brake system after winter conditions',
        'Inspect suspension components',
        'Replace windshield wipers if needed'
      ],
      summer: [
        'Ensure A/C is functioning properly',
        'Check coolant levels and condition',
        'Inspect belts and hoses for heat damage'
      ],
      fall: [
        'Check tire tread depth for winter',
        'Test battery before cold weather',
        'Inspect heating system'
      ],
      winter: [
        'Apply undercarriage protection',
        'Check antifreeze levels',
        'Ensure all exterior lights function properly'
      ]
    };
    
    setSeasonalMaintenanceItems(seasonalItems[upcomingSeason] || []);
  };
  
  // Function to handle VIN decoding
  const handleVinDecode = async (vin) => {
    setDecoding(true);
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinExtended/${vin}?format=json`);
      const result = await response.json();
      const usefulData = result.Results.filter(item => item.Value && item.Variable !== "Error Code");
      
      setDecodedData(prev => ({
        ...prev,
        [vin]: usefulData
      }));
      
      // Announce to screen readers
      const announcer = document.getElementById('announcer');
      if (announcer) {
        const makeModel = usefulData.find(item => item.Variable === "Make")?.Value + ' ' + 
                         usefulData.find(item => item.Variable === "Model")?.Value;
        announcer.textContent = `VIN has been successfully decoded for ${makeModel || 'your vehicle'}`;
      }
    } catch (error) {
      console.error('Error decoding VIN:', error.message);
      // Announce error to screen readers
      const announcer = document.getElementById('announcer');
      if (announcer) {
        announcer.textContent = `Error decoding VIN. Please try again later.`;
      }
    } finally {
      setDecoding(false);
    }
  };
  
  // Function to handle clicking outside the dropdown menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Export functions using the utility library
  const handleExportToPDF = async () => {
    setShowExportMenu(false);
    const element = document.getElementById('garageVaultSection');
    if (element) {
      await exportToPdf(element, 'GoTime Motorsports - GarageVault.pdf');
    }
  };
  
  const handleExportToGoogleSheets = async () => {
    setShowExportMenu(false);
    // Get vehicle data in correct format for CSV
    if (!vehicles || vehicles.length === 0) {
      console.error("No vehicles to export");
      return;
    }
    
    const vehicleExportData = vehicles.map(v => ({
      name: v.car_name,
      make: v.make,
      model: v.model,
      year: v.year,
      vin: v.vin || 'N/A',
      mileage: v.mileage
    }));
    await exportToCsv(vehicleExportData, 'GoTime Motorsports - GarageVault.csv');
  };
  
  const handleExportToGoogleDocs = async () => {
    setShowExportMenu(false);
    const element = document.getElementById('garageVaultSection');
    if (element) {
      await printElement(element, 'GoTime Motorsports - GarageVault');
    }
  };
  
  // Function to change active vehicle
  const handleVehicleChange = (vehicle) => {
    setActiveVehicle(vehicle);
    setActiveSection('overview');
  };

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen" aria-labelledby="garageVaultHeading">
      {/* Header with Export Options */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 id="garageVaultHeading" className="text-blue-400 font-orbitron text-2xl md:text-3xl mb-4 md:mb-0">
          Garage Vault<span className="text-white"> | Central Hub</span>
        </h2>
        
        <div ref={exportMenuRef} className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="apex-button flex items-center"
            aria-label="Export Garage Vault"
            aria-expanded={showExportMenu}
            aria-haspopup="true"
          >
            <span className="mr-2">📥</span> Export Options
          </button>
          
          {showExportMenu && (
            <div 
              className="absolute right-0 mt-2 w-60 bg-gray-900 border border-green-500 rounded-md shadow-lg z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="export-menu"
            >
              <div className="py-1" role="none">
                <button
                  onClick={handleExportToPDF}
                  className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 w-full text-left"
                  role="menuitem"
                >
                  <span className="mr-2">📄</span> Export to PDF
                </button>
                <button
                  onClick={handleExportToGoogleSheets}
                  className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 w-full text-left"
                  role="menuitem"
                >
                  <span className="mr-2">📊</span> Export to Google Sheets
                </button>
                <button
                  onClick={handleExportToGoogleDocs}
                  className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 w-full text-left"
                  role="menuitem"
                >
                  <span className="mr-2">📝</span> Export to Google Docs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Screen reader announcer */}
      <div id="announcer" className="sr-only" aria-live="polite"></div>

      {loading ? (
        <p className="text-white text-center py-20" role="status" aria-live="polite">
          Loading your garage...
        </p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Vehicle Selection and Main Navigation */}
          <div className="lg:w-1/4">
            <div className="apex-card p-4 mb-6">
              <h3 className="text-blue-400 font-orbitron text-lg mb-4">Your Vehicles</h3>
              
              <div className="space-y-3">
                {vehicles && vehicles.length > 0 ? vehicles.map((vehicle, index) => (
                  <button
                    key={index}
                    onClick={() => handleVehicleChange(vehicle)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${activeVehicle?.id === vehicle.id 
                      ? 'bg-green-500 bg-opacity-20 border border-green-500' 
                      : 'bg-gray-800 hover:bg-gray-700'}`}
                    aria-current={activeVehicle?.id === vehicle.id ? 'true' : 'false'}
                  >
                    <div className="font-bold text-white">{vehicle.make} {vehicle.model}</div>
                    <div className="text-sm text-gray-400">
                      {vehicle.year} | {vehicleProfile.mileage || 0} miles
                    </div>
                  </button>
                )) : (
                  <div className="text-white p-3 bg-gray-800 rounded-lg">
                    No vehicles found. Add a new vehicle to get started.
                  </div>
                )}
                
                <button className="w-full mt-4 p-2 border border-dashed border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:bg-opacity-10 transition-all">
                  + Add New Vehicle
                </button>
              </div>
            </div>
            
            {/* Main Navigation Menu */}
            <div className="apex-card p-4 mb-6">
              <h3 className="text-blue-400 font-orbitron text-lg mb-4">Garage Sections</h3>
              
              <nav className="space-y-2" aria-label="Garage vault navigation">
                <button 
                  onClick={() => setActiveSection('overview')}
                  className={`w-full text-left p-2 rounded-lg flex items-center ${
                    activeSection === 'overview' ? 'bg-green-500 text-black font-bold' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">📋</span> Overview
                </button>
                <button 
                  onClick={() => setActiveSection('maintenance')}
                  className={`w-full text-left p-2 rounded-lg flex items-center ${
                    activeSection === 'maintenance' ? 'bg-green-500 text-black font-bold' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">🔧</span> Maintenance
                </button>
                <button 
                  onClick={() => setActiveSection('tires')}
                  className={`w-full text-left p-2 rounded-lg flex items-center ${
                    activeSection === 'tires' ? 'bg-green-500 text-black font-bold' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">🛞</span> Tires
                </button>
                <button 
                  onClick={() => setActiveSection('gloss')}
                  className={`w-full text-left p-2 rounded-lg flex items-center ${
                    activeSection === 'gloss' ? 'bg-green-500 text-black font-bold' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">✨</span> Gloss Tracking
                </button>
                <button 
                  onClick={() => setActiveSection('modifications')}
                  className={`w-full text-left p-2 rounded-lg flex items-center ${
                    activeSection === 'modifications' ? 'bg-green-500 text-black font-bold' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">🔩</span> Modifications
                </button>
                <button 
                  onClick={() => setActiveSection('documents')}
                  className={`w-full text-left p-2 rounded-lg flex items-center ${
                    activeSection === 'documents' ? 'bg-green-500 text-black font-bold' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">📄</span> Documents
                </button>
                <button 
                  onClick={() => setActiveSection('drivejournal')}
                  className={`w-full text-left p-2 rounded-lg flex items-center ${
                    activeSection === 'drivejournal' ? 'bg-green-500 text-black font-bold' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">📓</span> Drive Journal
                </button>
              </nav>
            </div>
            
            {/* Suggested Activities */}
            <div className="apex-card p-4 mb-6">
              <h3 className="text-blue-400 font-orbitron text-lg mb-4">Suggested Activities</h3>
              
              {suggestedActivities && suggestedActivities.length > 0 ? (
                <ul className="space-y-2">
                  {suggestedActivities.map((activity, index) => (
                    <li 
                      key={index} 
                      className={`p-2 rounded-lg ${
                        activity.priority === "high" ? 'border-l-4 border-green-500' : 
                        activity.priority === "medium" ? 'border-l-4 border-yellow-500' : 
                        'border-l-4 border-blue-500'
                      }`}
                    >
                      <div className="font-bold text-white">{activity.title}</div>
                      <div className="text-sm text-gray-400">{activity.description}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white">No suggested activities available.</p>
              )}
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:w-3/4" id="garageVaultSection">
            {activeVehicle ? (
              <div>
                {/* Vehicle Header */}
                <div className="apex-card p-6 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h3 className="text-blue-400 font-orbitron text-xl mb-2">
                        {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                      </h3>
                      <div className="text-white text-sm mb-4">Vehicle ID: {activeVehicle.id}</div>
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="inline-flex items-center px-3 py-1 bg-gray-800 text-green-400 rounded-full text-sm">
                          VIN: {vehicleProfile.vin || "N/A"}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-gray-800 text-green-400 rounded-full text-sm">
                          {vehicleProfile.mileage} miles
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-gray-800 text-green-400 rounded-full text-sm">
                          {vehicleProfile.color || "N/A"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <button className="apex-button">Edit</button>
                      <Link
                        to={`/vehicle-mods/${activeVehicle.id}`}
                        className="apex-button"
                      >
                        Modification Hub
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Section Content */}
                {activeSection === 'overview' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-4">Vehicle Overview</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Vehicle Specifications */}
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 font-orbitron text-md mb-3">Specifications</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span className="text-gray-400">Year:</span>
                            <span className="text-white">{activeVehicle.year}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Make:</span>
                            <span className="text-white">{activeVehicle.make}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Model:</span>
                            <span className="text-white">{activeVehicle.model}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Engine:</span>
                            <span className="text-white">{vehicleProfile.engineType || "N/A"}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Transmission:</span>
                            <span className="text-white">{vehicleProfile.transmission || "N/A"}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Drivetrain:</span>
                            <span className="text-white">{vehicleProfile.driveType || "N/A"}</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* Maintenance Summary */}
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 font-orbitron text-md mb-3">Maintenance Summary</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span className="text-gray-400">Last Oil Change:</span>
                            <span className="text-white">{vehicleProfile.maintenance.lastOilChange}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Last Service:</span>
                            <span className="text-white">{vehicleProfile.lastService}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Next Service:</span>
                            <span className="text-white">{vehicleProfile.nextService}</span>
                          </li>
                        </ul>
                        <button className="text-green-400 mt-3 text-sm hover:underline">
                          View Full Maintenance History →
                        </button>
                      </div>
                      
                      {/* Weather Alerts */}
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 font-orbitron text-md mb-3">Weather Alerts</h4>
                        {weatherAlerts && weatherAlerts.length > 0 ? (
                          <ul className="space-y-3">
                            {weatherAlerts.map((alert, index) => (
                              <li 
                                key={index} 
                                className={`p-2 rounded border-l-4 ${
                                  alert.severity === "high" ? 'border-red-500' : 
                                  alert.severity === "moderate" ? 'border-yellow-500' : 
                                  'border-blue-500'
                                }`}
                              >
                                <div className="font-bold text-white">{alert.type}</div>
                                <div className="text-sm text-gray-400">{alert.message}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-white">No alerts at this time.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSection === 'maintenance' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-4">Maintenance</h3>
                    
                    <div className="bg-gray-800 p-4 rounded-lg mb-6">
                      <h4 className="text-green-400 font-orbitron text-md mb-3">Upcoming Maintenance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-900 p-3 rounded-lg border border-green-500">
                          <div className="font-bold text-white">Oil Change</div>
                          <div className="text-sm text-gray-400">Due in 1,500 miles</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-yellow-500">
                          <div className="font-bold text-white">Tire Rotation</div>
                          <div className="text-sm text-gray-400">Due now</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-500">
                          <div className="font-bold text-white">Brake Inspection</div>
                          <div className="text-sm text-gray-400">Due in 5,000 miles</div>
                        </div>
                      </div>
                      
                      <button className="apex-button">Add Maintenance Record</button>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-green-400 font-orbitron text-md mb-3">Seasonal Maintenance</h4>
                      
                      <div className="mb-4">
                        <div className="font-bold text-white mb-2">Upcoming Season Preparation</div>
                        <ul className="space-y-2">
                          {seasonalMaintenanceItems && seasonalMaintenanceItems.length > 0 ? seasonalMaintenanceItems.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-400 mr-2">→</span>
                              <span className="text-white">{item}</span>
                            </li>
                          )) : (
                            <li className="text-white">No seasonal maintenance items available.</li>
                          )}
                        </ul>
                      </div>
                      
                      <Link to="/seasonal-checklist" className="apex-button inline-block">
                        View Full Seasonal Checklist
                      </Link>
                    </div>
                  </div>
                )}
                
                {activeSection === 'tires' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-4">Tire Management</h3>
                    <TireManagementDashboard />
                  </div>
                )}
                
                {activeSection === 'gloss' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-4">Gloss Tracking</h3>
                    <GlossTracker />
                    <div className="mt-6">
                      <Link to="/gloss-growth" className="apex-button">
                        Open Detailed Gloss Tracker
                      </Link>
                    </div>
                  </div>
                )}
                
                {activeSection === 'modifications' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-4">Modifications</h3>
                    
                    <div className="mb-6">
                      <p className="text-white mb-4">Track all modifications and upgrades to your vehicle. Keep a record of parts, labor, and performance changes.</p>
                      
                      <Link 
                        to={`/vehicle-mods/${activeVehicle?.id}`}
                        className="apex-button inline-block"
                      >
                        Go to Modification Hub
                      </Link>
                    </div>
                    
                    <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Product Arsenal</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 font-orbitron text-md mb-3">Recent Modifications</h4>
                        <ul className="space-y-2">
                          <li className="p-2 border-l-4 border-green-500">
                            <div className="font-bold text-white">Performance Intake</div>
                            <div className="text-sm text-gray-400">Installed March 2023</div>
                          </li>
                          <li className="p-2 border-l-4 border-green-500">
                            <div className="font-bold text-white">ECU Tune</div>
                            <div className="text-sm text-gray-400">Installed February 2023</div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 font-orbitron text-md mb-3">Planned Modifications</h4>
                        <ul className="space-y-2">
                          <li className="p-2 border-l-4 border-blue-500">
                            <div className="font-bold text-white">Performance Exhaust</div>
                            <div className="text-sm text-gray-400">Budget: $1,200</div>
                          </li>
                          <li className="p-2 border-l-4 border-blue-500">
                            <div className="font-bold text-white">Suspension Upgrade</div>
                            <div className="text-sm text-gray-400">Budget: $2,500</div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSection === 'documents' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-4">Documents & Records</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 font-orbitron text-md mb-3">Vehicle Documents</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                            <span className="text-white">Insurance Policy</span>
                            <button className="text-blue-400 hover:underline">View</button>
                          </li>
                          <li className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                            <span className="text-white">Registration</span>
                            <button className="text-blue-400 hover:underline">View</button>
                          </li>
                          <li className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                            <span className="text-white">Owner's Manual</span>
                            <button className="text-blue-400 hover:underline">View</button>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 font-orbitron text-md mb-3">Service Records</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                            <span className="text-white">Oil Change - March 2023</span>
                            <button className="text-blue-400 hover:underline">View</button>
                          </li>
                          <li className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                            <span className="text-white">Brake Service - January 2023</span>
                            <button className="text-blue-400 hover:underline">View</button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-green-400 font-orbitron text-md mb-3">Upload Documents</h4>
                      <div className="mb-4">
                        <label className="block text-white mb-2">Document Type</label>
                        <select className="w-full bg-gray-700 text-white p-2 rounded">
                          <option>Service Record</option>
                          <option>Insurance Document</option>
                          <option>Registration</option>
                          <option>Purchase Receipt</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block text-white mb-2">Document Description</label>
                        <input 
                          type="text" 
                          className="w-full bg-gray-700 text-white p-2 rounded"
                          placeholder="e.g., Oil Change April 2023"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-white mb-2">Upload File</label>
                        <div className="border-2 border-dashed border-gray-600 p-4 rounded text-center">
                          <p className="text-gray-400">Drag and drop files here or click to browse</p>
                        </div>
                      </div>
                      <button className="apex-button">Upload Document</button>
                    </div>
                  </div>
                )}
                
                {activeSection === 'drivejournal' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-4">Drive Journal</h3>
                    
                    <div className="mb-6">
                      <p className="text-white mb-4">Keep track of your drives, routes, and experiences. Document memories and driving conditions.</p>
                      
                      <Link to="/journal" className="apex-button inline-block">
                        Go to Full Drive Journal
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 font-orbitron text-md mb-3">Recent Drives</h4>
                        <ul className="space-y-3">
                          <li className="border-l-4 border-green-500 p-2">
                            <div className="font-bold text-white">Mountain Run</div>
                            <div className="text-sm text-gray-400">April 12, 2023 • 120 miles</div>
                            <div className="text-sm text-gray-400 mt-1">Perfect weather, car performed excellently on the mountain passes.</div>
                          </li>
                          <li className="border-l-4 border-blue-500 p-2">
                            <div className="font-bold text-white">Coastal Highway</div>
                            <div className="text-sm text-gray-400">March 20, 2023 • 85 miles</div>
                            <div className="text-sm text-gray-400 mt-1">Scenic drive along the coast. Great handling on the curves.</div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 font-orbitron text-md mb-3">Drive Statistics</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span className="text-gray-400">Total Drives:</span>
                            <span className="text-white">24</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Total Distance:</span>
                            <span className="text-white">1,850 miles</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Avg Drive Length:</span>
                            <span className="text-white">77 miles</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Favorite Route:</span>
                            <span className="text-white">Mountain Run</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="apex-card p-6 text-center">
                <p className="text-white mb-4">No vehicle selected or you haven't added any vehicles yet.</p>
                <button className="apex-button">Add Your First Vehicle</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GarageVaultPage;