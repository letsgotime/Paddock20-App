import React, { useState, useEffect, useRef } from 'react';
import supabase from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import { exportToPdf, exportToCsv, printElement } from '../utils/exportUtils';
import TireTracker from '../components/TireTracker';
import GlossTracker from '../components/GlossTracker';
import PreDriveChecklist from '../components/PreDriveChecklist';
import WeeklyChecklist from '../components/WeeklyChecklist';
import MonthlyChecklist from '../components/MonthlyChecklist';
import QuarterlyChecklist from '../components/QuarterlyChecklist';
import SeasonalAdaptationChecklist from '../components/SeasonalAdaptationChecklist';
import { vehicleProfile } from '../data/vehicles';

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
        setVehicles(data);
        
        // Set first vehicle as active if there is one
        if (data && data.length > 0) {
          setActiveVehicle(data[0]);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error.message);
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
    
    setSuggestedActivities(seasonalActivities[currentSeason]);
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
    
    setSeasonalMaintenanceItems(seasonalItems[upcomingSeason]);
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
        <h2 id="garageVaultHeading" className="apex-header-green text-2xl md:text-3xl mb-4 md:mb-0">
          Garage Vault<span className="text-gray-400"> | Central Hub</span>
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
        <p className="text-gray-400 text-center py-20" role="status" aria-live="polite">
          Loading your garage...
        </p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Vehicle Selection and Main Navigation */}
          <div className="lg:w-1/4">
            <div className="apex-card p-4 mb-6">
              <h3 className="text-blue-400 font-orbitron text-lg mb-4">Your Vehicles</h3>
              
              <div className="space-y-3">
                {vehicles.map((vehicle, index) => (
                  <button
                    key={index}
                    onClick={() => handleVehicleChange(vehicle)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${activeVehicle?.id === vehicle.id 
                      ? 'bg-green-500 bg-opacity-20 border border-green-500' 
                      : 'bg-gray-800 hover:bg-gray-700'}`}
                    aria-current={activeVehicle?.id === vehicle.id ? 'true' : 'false'}
                  >
                    <div className="font-bold text-white">{vehicle.car_name}</div>
                    <div className="text-sm text-gray-400">
                      {vehicle.mileage} miles | VIN: {vehicle.vin?.slice(-4) || "N/A"}
                    </div>
                  </button>
                ))}
                
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
                  <span className="mr-2">🛣️</span> Drive Journal
                </button>
                <button 
                  onClick={() => setActiveSection('seasonal')}
                  className={`w-full text-left p-2 rounded-lg flex items-center ${
                    activeSection === 'seasonal' ? 'bg-green-500 text-black font-bold' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">🍁</span> Seasonal
                </button>
              </nav>
            </div>
            
            {/* Suggested Activities */}
            <div className="apex-card p-4">
              <h3 className="text-blue-400 font-orbitron text-lg mb-4">Suggested Activities</h3>
              
              {suggestedActivities.length === 0 ? (
                <p className="text-gray-400 text-sm">No suggested activities right now.</p>
              ) : (
                <div className="space-y-4">
                  {suggestedActivities.map((activity, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        activity.priority === 'high' 
                          ? 'border-red-500 bg-red-500 bg-opacity-10' 
                          : activity.priority === 'medium'
                          ? 'border-yellow-500 bg-yellow-500 bg-opacity-10'
                          : 'border-green-500 bg-green-500 bg-opacity-10'
                      }`}
                    >
                      <h4 className="font-bold text-white">{activity.title}</h4>
                      <p className="text-sm text-gray-300">{activity.description}</p>
                      <div className="flex justify-end mt-2">
                        <button className="text-xs text-green-400 hover:text-green-300">
                          Schedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:w-3/4" id="garageVaultSection">
            {activeVehicle ? (
              <>
                {/* Overview Section */}
                {activeSection === 'overview' && (
                  <>
                    <div className="apex-card p-6 mb-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                        <h3 className="text-blue-400 font-orbitron text-xl mb-2 md:mb-0">
                          {activeVehicle.car_name}
                        </h3>
                        
                        <div className="flex space-x-3">
                          <button 
                            className="apex-button text-sm"
                            onClick={() => activeVehicle.vin && handleVinDecode(activeVehicle.vin)}
                            disabled={decoding || !activeVehicle.vin}
                          >
                            {decoding ? 'Decoding...' : 'Decode VIN'}
                          </button>
                          <Link 
                            to={`/vehicle-mods/${activeVehicle.id}`}
                            className="apex-button text-sm"
                          >
                            View Mods
                          </Link>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Car Image & Basic Info */}
                        <div>
                          <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                            <img 
                              src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3" 
                              alt={activeVehicle.car_name} 
                              className="w-full h-64 object-cover"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-4 rounded-lg">
                              <h4 className="text-green-400 text-sm uppercase mb-2">Basic Info</h4>
                              <p className="text-white mb-1">VIN: {activeVehicle.vin || "N/A"}</p>
                              <p className="text-white mb-1">Mileage: {activeVehicle.mileage} miles</p>
                            </div>
                            
                            <div className="bg-gray-800 p-4 rounded-lg">
                              <h4 className="text-green-400 text-sm uppercase mb-2">Tire Info</h4>
                              <p className="text-white mb-1">Front: {activeVehicle.tire_pressure_front} psi</p>
                              <p className="text-white mb-1">Rear: {activeVehicle.tire_pressure_rear} psi</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Column - Details Tabs */}
                        <div>
                          <div className="bg-gray-800 rounded-lg p-4">
                            {/* Tab Navigation */}
                            <div className="flex mb-4 overflow-x-auto pb-2">
                              <button 
                                onClick={() => setActiveTab('specs')}
                                className={`px-3 py-1 mr-2 rounded-md text-sm ${
                                  activeTab === 'specs' ? 'bg-green-500 text-black font-bold' : 'bg-gray-700 text-white'
                                }`}
                              >
                                Specs
                              </button>
                              <button 
                                onClick={() => setActiveTab('service')}
                                className={`px-3 py-1 mr-2 rounded-md text-sm ${
                                  activeTab === 'service' ? 'bg-green-500 text-black font-bold' : 'bg-gray-700 text-white'
                                }`}
                              >
                                Service
                              </button>
                              <button 
                                onClick={() => setActiveTab('documents')}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  activeTab === 'documents' ? 'bg-green-500 text-black font-bold' : 'bg-gray-700 text-white'
                                }`}
                              >
                                Documents
                              </button>
                            </div>
                            
                            {/* Tab Content */}
                            {activeTab === 'specs' && (
                              <div>
                                <table className="w-full">
                                  <tbody>
                                    <tr className="border-b border-gray-700">
                                      <td className="py-2 text-gray-400">Torque Spec</td>
                                      <td className="py-2 text-right text-white">{activeVehicle.torque_spec} lb-ft</td>
                                    </tr>
                                    
                                    {/* VIN Decoded Information */}
                                    {decodedData[activeVehicle.vin] && decodedData[activeVehicle.vin].slice(0, 6).map((field, index) => (
                                      <tr key={index} className="border-b border-gray-700">
                                        <td className="py-2 text-gray-400">{field.Variable}</td>
                                        <td className="py-2 text-right text-white">{field.Value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                
                                {decodedData[activeVehicle.vin] && decodedData[activeVehicle.vin].length > 6 && (
                                  <p className="text-blue-400 text-xs mt-2 text-right">
                                    +{decodedData[activeVehicle.vin].length - 6} more details available
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {activeTab === 'service' && (
                              <div>
                                <p className="text-white mb-3">
                                  Service History: {activeVehicle.service_history}
                                </p>
                                <p className="text-white">
                                  Next Service: Oil change due at {parseInt(activeVehicle.mileage) + 5000} miles
                                </p>
                                
                                <div className="mt-4 bg-gray-900 p-3 rounded-lg">
                                  <h5 className="text-green-400 text-sm mb-2">Recent Services</h5>
                                  {/* We would pull from service records, but using mock data for demo */}
                                  <div className="text-sm text-white">
                                    <div className="flex justify-between mb-1">
                                      <span>Oil Change</span>
                                      <span className="text-gray-400">2025-03-15</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Brake Service</span>
                                      <span className="text-gray-400">2025-02-01</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {activeTab === 'documents' && (
                              <div>
                                <p className="text-white mb-2">Insurance: {activeVehicle.insurance_docs}</p>
                                <p className="text-white mb-2">Ownership: {activeVehicle.ownership_docs}</p>
                                
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                  <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded">
                                    Upload Document
                                  </button>
                                  <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded">
                                    View All
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Weather Alerts & Maintenance Reminders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="apex-card p-4">
                        <h4 className="text-blue-400 font-orbitron text-lg mb-3">Weather Alerts</h4>
                        
                        {weatherAlerts.length === 0 ? (
                          <p className="text-gray-400">No weather alerts currently.</p>
                        ) : (
                          <div className="space-y-3">
                            {weatherAlerts.map((alert, index) => (
                              <div 
                                key={index} 
                                className={`p-3 rounded-lg ${
                                  alert.severity === 'high' ? 'bg-red-900 bg-opacity-40 border border-red-700' :
                                  alert.severity === 'moderate' ? 'bg-yellow-900 bg-opacity-30 border border-yellow-700' :
                                  'bg-blue-900 bg-opacity-30 border border-blue-700'
                                }`}
                              >
                                <div className="flex items-center mb-1">
                                  <span className="text-white font-bold mr-2">{alert.type}</span>
                                  {alert.severity === 'high' && <span className="text-xs bg-red-600 px-2 py-0.5 rounded">Important</span>}
                                </div>
                                <p className="text-sm text-gray-300">{alert.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="apex-card p-4">
                        <h4 className="text-blue-400 font-orbitron text-lg mb-3">Seasonal Maintenance</h4>
                        
                        {seasonalMaintenanceItems.length === 0 ? (
                          <p className="text-gray-400">No seasonal maintenance items.</p>
                        ) : (
                          <ul className="space-y-2">
                            {seasonalMaintenanceItems.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <input 
                                  type="checkbox" 
                                  id={`seasonal-item-${index}`} 
                                  className="mt-1 mr-3"
                                />
                                <label htmlFor={`seasonal-item-${index}`} className="text-white text-sm">
                                  {item}
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        <div className="mt-4">
                          <button 
                            onClick={() => setActiveSection('seasonal')}
                            className="text-green-400 hover:text-green-300 text-sm"
                          >
                            View all seasonal tasks →
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="apex-card p-4">
                      <h4 className="text-blue-400 font-orbitron text-lg mb-4">Quick Actions</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button 
                          onClick={() => setActiveSection('maintenance')}
                          className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center"
                        >
                          <div className="text-2xl mb-2">🔧</div>
                          <div className="text-white text-sm">Maintenance</div>
                        </button>
                        
                        <button 
                          onClick={() => setActiveSection('tires')}
                          className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center"
                        >
                          <div className="text-2xl mb-2">🛞</div>
                          <div className="text-white text-sm">Tire Tracker</div>
                        </button>
                        
                        <button 
                          onClick={() => setActiveSection('gloss')}
                          className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center"
                        >
                          <div className="text-2xl mb-2">✨</div>
                          <div className="text-white text-sm">Gloss Tracking</div>
                        </button>
                        
                        <button 
                          onClick={() => setActiveSection('drivejournal')}
                          className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center"
                        >
                          <div className="text-2xl mb-2">📓</div>
                          <div className="text-white text-sm">Drive Journal</div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Maintenance Section */}
                {activeSection === 'maintenance' && (
                  <div className="space-y-6">
                    <div className="apex-card p-6">
                      <h3 className="text-blue-400 font-orbitron text-xl mb-6">
                        Maintenance for {activeVehicle.car_name}
                      </h3>
                      
                      <div className="space-y-8">
                        <PreDriveChecklist />
                        <WeeklyChecklist />
                        <MonthlyChecklist />
                        <QuarterlyChecklist />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Tires Section */}
                {activeSection === 'tires' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-6">
                      Tire Tracking for {activeVehicle.car_name}
                    </h3>
                    
                    <TireTracker tireInfo={vehicleData.tire} />
                  </div>
                )}
                
                {/* Gloss Tracking Section */}
                {activeSection === 'gloss' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-6">
                      Gloss Tracking for {activeVehicle.car_name}
                    </h3>
                    
                    <GlossTracker />
                  </div>
                )}
                
                {/* Modifications Section */}
                {activeSection === 'modifications' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-6">
                      Modifications for {activeVehicle.car_name}
                    </h3>
                    
                    <p className="text-white mb-6">
                      View and manage all modifications for your vehicle.
                    </p>
                    
                    <Link
                      to={`/vehicle-mods/${activeVehicle.id}`}
                      className="apex-button"
                    >
                      View All Modifications
                    </Link>
                  </div>
                )}
                
                {/* Documents Section */}
                {activeSection === 'documents' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-6">
                      Documents for {activeVehicle.car_name}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 uppercase text-sm mb-3">Vehicle Documents</h4>
                        <p className="text-white mb-2">Insurance: {activeVehicle.insurance_docs}</p>
                        <p className="text-white mb-2">Ownership: {activeVehicle.ownership_docs}</p>
                        <p className="text-white mb-2">Registration: Valid until Aug 2025</p>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-green-400 uppercase text-sm mb-3">Service Records</h4>
                        <p className="text-white mb-2">Service History: {activeVehicle.service_history}</p>
                        <p className="text-white mb-2">Warranty Info: Extended coverage</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button className="apex-button">
                        Upload Document
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Drive Journal Section */}
                {activeSection === 'drivejournal' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-6">
                      Drive Journal for {activeVehicle.car_name}
                    </h3>
                    
                    <p className="text-white mb-6">
                      Log and track your drives, including routes, weather conditions, and notes.
                    </p>
                    
                    <Link
                      to="/journal"
                      className="apex-button"
                    >
                      Go to Drive Journal
                    </Link>
                  </div>
                )}
                
                {/* Seasonal Section */}
                {activeSection === 'seasonal' && (
                  <div className="apex-card p-6">
                    <h3 className="text-blue-400 font-orbitron text-xl mb-6">
                      Seasonal Maintenance for {activeVehicle.car_name}
                    </h3>
                    
                    <SeasonalAdaptationChecklist />
                  </div>
                )}
              </>
            ) : (
              <div className="apex-card p-8 text-center">
                <h3 className="text-blue-400 font-orbitron text-xl mb-4">Welcome to Garage Vault</h3>
                <p className="text-white mb-6">Select a vehicle from the sidebar or add a new one to get started.</p>
                <button className="apex-button">
                  + Add New Vehicle
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GarageVaultPage;