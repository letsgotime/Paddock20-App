import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useLocation, Link } from 'wouter';
import supabase from '../services/supabaseClient';
import { exportToPdf, exportToCsv, printElement } from '../utils/exportUtils';
import TireTracker from '../components/TireTracker';
import VehicleTelemetry from '../components/VehicleTelemetry';
import EnhancedVehicleTelemetry from '../components/EnhancedVehicleTelemetry';
import VehicleGallery from '../components/VehicleGallery';
import VaultStorageServices from '../components/VaultStorageServices';
import GlossTracker from '../components/GlossTracker';
import F1TelemetryDashboard from '../components/F1TelemetryDashboard';
import JuiceBoxChecklists from '../components/JuiceBoxChecklists';
import SeasonalChecklists from '../components/SeasonalChecklists';
import AddVehicleForm from '../components/AddVehicleForm';
import AddModificationForm from '../components/AddModificationForm';
import AddMaintenanceForm from '../components/AddMaintenanceForm';
import EnhancedVehicleDetail from '../components/EnhancedVehicleDetail';
import VehicleOnboardingWizard from '../components/VehicleOnboardingWizard';
import VehicleActivitySummary from '../components/VehicleActivitySummary';
import VehicleMediaLibrary from '../components/VehicleMediaLibrary';
import { useVehicle } from '../hooks/useVehicle';

// Enhanced telemetry and data services
import vehicleDataService from '../services/vehicleDataService';
import { searchImage } from '../services/unsplashService';
import { 
  Activity, BarChart2, Wind, Thermometer, FileDown, RefreshCw,
  Clock, Calendar, PieChart as PieChartIcon, AlertTriangle, TrendingUp, 
  ChevronRight, ChevronDown, ChevronUp, Gauge, Info, Fuel, Droplets, Battery, 
  Car, Upload, Maximize2, Zap, MapPin, Mountain, Filter, PlusCircle, 
  Wrench, Shield, Camera, Clipboard, MoreHorizontal, Eye, Trash2, Download, X, Plus,
  CloudSnow, Sun, Leaf, Settings, Printer, ExternalLink, Pencil
} from 'lucide-react';

function GarageVaultPage() {
  const [routePath, setRoutePath] = useLocation();
  
  // Get vehicle data from context
  const { vehicles, activeVehicle, setActiveVehicle, loading } = useVehicle();
  
  // Parse URL query parameters
  const parseQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      section: searchParams.get('section'),
      action: searchParams.get('action')
    };
  };
  
  // State management
  const [location, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeView, setActiveView] = useState('grid');
  const [activeMod, setActiveMod] = useState(null);
  const [expandedTelemetry, setExpandedTelemetry] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOBDPanel, setShowOBDPanel] = useState(false);
  const [obdScanActive, setObdScanActive] = useState(false);
  const [showVehicleOnboarding, setShowVehicleOnboarding] = useState(false);
  const [filters, setFilters] = useState({
    make: 'all',
    type: 'all',
    status: 'all'
  });
  
  // Form display states
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showAddModForm, setShowAddModForm] = useState(false);
  const [showAddMaintenanceForm, setShowAddMaintenanceForm] = useState(false);
  
  // Data states
  const [modifications, setModifications] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  
  // Default metrics that will be updated with actual vehicle data
  const [carMetrics, setCarMetrics] = useState({
    lastService: '2023-10-15',
    nextServiceDue: '2024-04-15',
    daysSinceLastDrive: 5,
    mileage: 0, // Will be updated with actual vehicle mileage
    fuelLevel: 76,
    batteryHealth: 92,
    tirePressure: {
      frontLeft: 35,
      frontRight: 34.5,
      rearLeft: 35.5,
      rearRight: 35
    },
    engineStatus: 'Excellent',
    glossIndex: 89,
    lastWash: '2023-12-01',
    oilLifeRemaining: 68,
    carStatus: 'Ready'
  });
  
  // Simulated OBD2 data
  const [obdData, setObdData] = useState({
    engineTemp: 0,
    rpm: 0,
    speed: 0,
    throttlePosition: 0,
    fuelPressure: 0,
    intakeTemp: 0,
    maf: 0,
    timingAdvance: 0,
    o2Sensor: 0,
    dtcCodes: []
  });
  
  // UI refs
  const exportMenuRef = useRef(null);
  const telemetryRef = useRef(null);
  const garageGridRef = useRef(null);
  
  // Handle URL parameters for section and action
  useEffect(() => {
    const { section, action } = parseQueryParams();
    
    // Set the active section based on the URL param
    if (section) {
      const validSections = ['dashboard', 'maintenance', 'modifications', 'gloss', 'tires', 'gallery'];
      if (validSections.includes(section)) {
        setActiveSection(section);
      }
    }
    
    // Handle actions based on URL param
    if (action) {
      switch (action) {
        case 'add-mod':
          setShowAddModForm(true);
          break;
        case 'add-maintenance':
          setShowAddMaintenanceForm(true);
          break;
        case 'log-wash':
          setActiveSection('gloss');
          break;
      }
    }
  }, [location.search]);
  
  // Update car metrics when active vehicle changes
  useEffect(() => {
    if (activeVehicle) {
      updateCarMetrics();
    }
    
    // Update car metrics at regular intervals when a vehicle is selected
    const metricsInterval = setInterval(() => {
      if (activeVehicle) {
        updateCarMetrics();
      }
    }, 5000);
    
    return () => clearInterval(metricsInterval);
  }, [activeVehicle]);
  
  // Auto-close dropdowns when clicking outside
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
  
  // Simulate OBD2 scanning
  useEffect(() => {
    if (obdScanActive) {
      const scanInterval = setInterval(() => {
        setObdData({
          engineTemp: Math.floor(180 + Math.random() * 20),
          rpm: Math.floor(800 + Math.random() * 200),
          speed: 0,
          throttlePosition: Math.floor(Math.random() * 5),
          fuelPressure: Math.floor(40 + Math.random() * 5),
          intakeTemp: Math.floor(70 + Math.random() * 10),
          maf: Math.floor(8 + Math.random() * 2),
          timingAdvance: Math.floor(10 + Math.random() * 5),
          o2Sensor: 0.85 + (Math.random() * 0.2),
          dtcCodes: Math.random() > 0.9 ? ['P0456'] : []
        });
      }, 1000);
      
      // Stop scanning after 10 seconds
      setTimeout(() => {
        setObdScanActive(false);
        clearInterval(scanInterval);
      }, 10000);
      
      return () => clearInterval(scanInterval);
    }
  }, [obdScanActive]);
  
  // Update car metrics for current vehicle (simulated real-time data)
  const updateCarMetrics = () => {
    // First, update carMetrics with the actual vehicle mileage from activeVehicle
    if (activeVehicle && activeVehicle.mileage) {
      setCarMetrics(prev => ({
        ...prev,
        mileage: activeVehicle.mileage,
        lastService: activeVehicle.last_service || prev.lastService
      }));
    }
    
    // Then make small fluctuations to simulate live data
    setCarMetrics(prev => ({
      ...prev,
      batteryHealth: Math.max(80, Math.min(100, prev.batteryHealth + (Math.random() > 0.7 ? Math.random() * 0.2 - 0.1 : 0))),
      tirePressure: {
        frontLeft: Math.max(30, Math.min(38, prev.tirePressure.frontLeft + (Math.random() > 0.8 ? Math.random() * 0.2 - 0.1 : 0))),
        frontRight: Math.max(30, Math.min(38, prev.tirePressure.frontRight + (Math.random() > 0.8 ? Math.random() * 0.2 - 0.1 : 0))),
        rearLeft: Math.max(30, Math.min(38, prev.tirePressure.rearLeft + (Math.random() > 0.8 ? Math.random() * 0.2 - 0.1 : 0))),
        rearRight: Math.max(30, Math.min(38, prev.tirePressure.rearRight + (Math.random() > 0.8 ? Math.random() * 0.2 - 0.1 : 0)))
      }
    }));
  };
  
  // Start OBD2 scan simulation
  const startOBDScan = () => {
    setObdScanActive(true);
    // Reset data to show connection starting
    setObdData({
      engineTemp: 0,
      rpm: 0,
      speed: 0,
      throttlePosition: 0,
      fuelPressure: 0,
      intakeTemp: 0,
      maf: 0,
      timingAdvance: 0,
      o2Sensor: 0,
      dtcCodes: []
    });
  };
  
  // Export functions
  const handleExportToPDF = async () => {
    setShowExportMenu(false);
    const element = document.getElementById('garageVaultSection');
    if (element) {
      await exportToPdf(element, 'GoTime Motorsports - GarageVault.pdf');
    }
  };
  
  const handleExportToCSV = async () => {
    setShowExportMenu(false);
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
  
  const handlePrint = async () => {
    setShowExportMenu(false);
    const element = document.getElementById('garageVaultSection');
    if (element) {
      await printElement(element, 'GoTime Motorsports - GarageVault');
    }
  };
  
  // Function to change active vehicle
  const handleVehicleChange = (vehicle) => {
    setActiveVehicle(vehicle);
    
    // Immediately update metrics for the selected vehicle
    if (vehicle && vehicle.mileage) {
      setCarMetrics(prev => ({
        ...prev,
        mileage: vehicle.mileage,
        lastService: vehicle.last_service || prev.lastService
      }));
    }
    
    setActiveSection('dashboard');
  };
  
  // Filter vehicles based on criteria
  const filteredVehicles = vehicles.filter(vehicle => {
    if (filters.make !== 'all' && vehicle.make !== filters.make) return false;
    if (filters.type !== 'all' && vehicle.vehicle_type !== filters.type) return false;
    if (filters.status !== 'all' && vehicle.status !== filters.status) return false;
    return true;
  });
  
  // Get vehicle image (with a more refined search based on vehicle attributes)
  const getVehicleImageQuery = (vehicle) => {
    if (!vehicle) return 'luxury car';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''} professional photography`;
  };
  
  // Form handlers
  const handleAddVehicle = (newVehicle) => {
    try {
      // Convert to VehicleProfile format
      const vehicleProfile = {
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year,
        nickname: newVehicle.nickname || `${newVehicle.year} ${newVehicle.make} ${newVehicle.model}`,
        mileage: newVehicle.mileage.toString(),
        engineType: newVehicle.engine_type || 'Gasoline',
        transmissionType: newVehicle.transmission || 'Automatic',
        color: newVehicle.color || 'Black',
        purchaseDate: newVehicle.purchase_date || new Date().toISOString().split('T')[0],
        vehicleImage: newVehicle.vehicle_image || '',
        vin: newVehicle.vin || ''
      };
      
      // Add the vehicle using the context method
      // Using the useVehicle hook to get the addVehicle method
      useVehicle().addVehicle(vehicleProfile);
      setShowAddVehicleForm(false);
      // Call the refresh vehicles method from the context
      useVehicle().refreshVehicles();
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };
  
  const handleAddModification = (newMod) => {
    // In a real app, this would send data to the database
    const modWithId = {
      ...newMod,
      id: modifications.length + 1,
      vehicleId: activeVehicle.id,
      created_at: new Date().toISOString()
    };
    
    setModifications([...modifications, modWithId]);
    setShowAddModForm(false);
  };
  
  const handleAddMaintenance = (newRecord) => {
    // In a real app, this would send data to the database
    const recordWithId = {
      ...newRecord,
      id: maintenanceRecords.length + 1,
      vehicleId: activeVehicle.id,
      created_at: new Date().toISOString()
    };
    
    setMaintenanceRecords([...maintenanceRecords, recordWithId]);
    setShowAddMaintenanceForm(false);
  };
  
  // Handle hyperlink processing - automatically fetch latest data
  const handleHyperlinkClick = async (url, type) => {
    // This would connect to an API to fetch the latest information
    // For demo purposes, we'll simulate a fetch and update
    
    console.log(`Fetching latest data from ${url} for ${type}`);
    
    // Simulate API delay
    setLoading(true);
    
    setTimeout(() => {
      if (type === 'vehicle') {
        // Example of updating vehicle data
        if (activeVehicle) {
          const updatedVehicle = {
            ...activeVehicle,
            mileage: activeVehicle.mileage + Math.floor(Math.random() * 500),
            last_updated: new Date().toISOString(),
            status: Math.random() > 0.8 ? 'Service Due' : 'Ready'
          };
          
          // Update the vehicles array with the new data
          setVehicles(vehicles.map(v => 
            v.id === activeVehicle.id ? updatedVehicle : v
          ));
          
          // Update active vehicle
          setActiveVehicle(updatedVehicle);
        }
      } else if (type === 'modification') {
        // Example of updating modification data
        if (activeMod) {
          const updatedMod = {
            ...activeMod,
            status: Math.random() > 0.7 ? 'Updated' : activeMod.status,
            warranty_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          // Update the modifications array
          setModifications(modifications.map(m => 
            m.id === activeMod.id ? updatedMod : m
          ));
          
          // Update active modification
          setActiveMod(updatedMod);
        }
      }
      
      setLoading(false);
    }, 1500);
  };
  
  // Handler for opening the vehicle onboarding wizard
  const handleOpenVehicleOnboarding = () => {
    setShowVehicleOnboarding(true);
  };

  // Handler for completing vehicle onboarding
  const handleVehicleOnboardingComplete = () => {
    // Vehicle data is saved directly to localStorage by the VehicleOnboardingWizard
    // Refresh the page to get the updated vehicle data
    window.location.reload();
  };

  // Conditional rendering - if no vehicles and onboarding wizard is not shown
  if (vehicles.length === 0 && !loading && !showVehicleOnboarding) {
    return (
      <div className="min-h-screen pb-20 bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <Car size={64} className="mx-auto text-blue-400 mb-4" />
            <h1 className="text-3xl font-bold text-blue-400">Welcome to Garage Vault</h1>
            <p className="text-gray-400 mt-4">
              It looks like you haven't added any vehicles yet. Let's get started by setting up your first vehicle.
            </p>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Why Add Your Vehicle?</h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <Gauge className="h-5 w-5 text-blue-400 mr-2 mt-1" />
                <span>Track performance metrics and maintenance history</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-5 w-5 text-blue-400 mr-2 mt-1" />
                <span>Get personalized maintenance recommendations</span>
              </li>
              <li className="flex items-start">
                <RefreshCw className="h-5 w-5 text-blue-400 mr-2 mt-1" />
                <span>Monitor vehicle health in real-time</span>
              </li>
              <li className="flex items-start">
                <Wrench className="h-5 w-5 text-blue-400 mr-2 mt-1" />
                <span>Log modifications and upgrades</span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={handleOpenVehicleOnboarding}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Add Your First Vehicle
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show vehicle onboarding wizard when triggered
  if (showVehicleOnboarding) {
    return (
      <div className="min-h-screen pb-20 bg-black text-white p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-400 mb-6 flex items-center">
            <Car size={28} className="mr-2" />
            Add Vehicle to Garage Vault
          </h1>
          <VehicleOnboardingWizard />
        </div>
      </div>
    );
  }

  return (
    <div id="garageVaultSection" className="bg-black min-h-screen" aria-labelledby="garageVaultHeading">
      {/* Form Modals */}
      {showAddVehicleForm && (
        <AddVehicleForm 
          onSubmit={handleAddVehicle} 
          onCancel={() => setShowAddVehicleForm(false)} 
        />
      )}
      
      {showAddModForm && activeVehicle && (
        <AddModificationForm 
          onSubmit={handleAddModification} 
          onCancel={() => setShowAddModForm(false)} 
          vehicleId={activeVehicle.id} 
        />
      )}
      
      {showAddMaintenanceForm && activeVehicle && (
        <AddMaintenanceForm 
          onSubmit={handleAddMaintenance} 
          onCancel={() => setShowAddMaintenanceForm(false)} 
          vehicleId={activeVehicle.id} 
        />
      )}
      
      {/* Modernized Header & Dashboard Controls */}
      <div className="p-4 md:p-6 border-b border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center">
            <h2 
              id="garageVaultHeading" 
              className="text-blue-400 font-orbitron text-2xl md:text-3xl"
            >
              Garage Vault<span className="text-white"> | Paddock20</span>
            </h2>
            
            {/* F1-style Navigation Ribbon */}
            <div className="hidden md:flex items-center ml-6 overflow-x-auto">
              <div className="flex gap-1 bg-gray-900/60 backdrop-blur-sm rounded-md p-1 border border-blue-900/30">
                <button 
                  onClick={() => setActiveSection('dashboard')}
                  className={`px-3 py-1.5 text-sm rounded transition-all duration-200 ${
                    activeSection === 'dashboard' 
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20' 
                      : 'text-white hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveSection('garage')}
                  className={`px-3 py-1.5 text-sm rounded transition-all duration-200 ${
                    activeSection === 'garage' 
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20' 
                      : 'text-white hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  Garage
                </button>
                <button 
                  onClick={() => setActiveSection('telemetry')}
                  className={`px-3 py-1.5 text-sm rounded transition-all duration-200 ${
                    activeSection === 'telemetry' 
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20' 
                      : 'text-white hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  Telemetry
                </button>
                <button 
                  onClick={() => setActiveSection('maintenance')}
                  className={`px-3 py-1.5 text-sm rounded transition-all duration-200 ${
                    activeSection === 'maintenance' 
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20' 
                      : 'text-white hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  Maintenance
                </button>
                <button 
                  onClick={() => setActiveSection('modifications')}
                  className={`px-3 py-1.5 text-sm rounded transition-all duration-200 ${
                    activeSection === 'modifications' 
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20' 
                      : 'text-white hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  Modifications
                </button>
                <button 
                  onClick={() => setActiveSection('juicebox')}
                  className={`px-3 py-1.5 text-sm rounded transition-all duration-200 ${
                    activeSection === 'juicebox' 
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20' 
                      : 'text-white hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  JuiceBox™
                </button>
                <button 
                  onClick={() => setActiveSection('seasonal')}
                  className={`px-3 py-1.5 text-sm rounded transition-all duration-200 ${
                    activeSection === 'seasonal' 
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20' 
                      : 'text-white hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  Seasonal
                </button>
                <button 
                  onClick={() => setActiveSection('gloss')}
                  className={`px-3 py-1.5 text-sm rounded transition-all duration-200 ${
                    activeSection === 'gloss' 
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20' 
                      : 'text-white hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  Gloss
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0 gap-3">
            <button 
              onClick={() => setShowOBDPanel(!showOBDPanel)}
              className="apex-button-sm flex items-center"
            >
              <Gauge size={16} className="mr-2" />
              OBD2 Connect
            </button>
            
            <div ref={exportMenuRef} className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="apex-button-sm flex items-center"
                aria-expanded={showExportMenu}
              >
                <FileDown size={16} className="mr-2" />
                Export
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-gray-900 border border-green-500 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={handleExportToPDF}
                      className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 w-full text-left"
                    >
                      <Download size={16} className="mr-2" /> Export to PDF
                    </button>
                    <button
                      onClick={handleExportToCSV}
                      className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 w-full text-left"
                    >
                      <Download size={16} className="mr-2" /> Export to CSV
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 w-full text-left"
                    >
                      <Download size={16} className="mr-2" /> Print
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleOpenVehicleOnboarding}
              className="apex-button-sm flex items-center bg-green-600 hover:bg-green-700"
            >
              <Plus size={16} className="mr-2" />
              Add Vehicle
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex md:hidden overflow-x-auto py-3 mt-4">
          <div className="flex gap-1.5 bg-gray-900/60 backdrop-blur-sm rounded-md p-1.5 border border-blue-900/30">
            <button 
              onClick={() => setActiveSection('dashboard')}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded transition-all duration-200 ${
                activeSection === 'dashboard' 
                  ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20' 
                  : 'text-white bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveSection('garage')}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded transition-all duration-200 ${
                activeSection === 'garage' 
                  ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20' 
                  : 'text-white bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              Garage
            </button>
            <button 
              onClick={() => setActiveSection('telemetry')}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded transition-all duration-200 ${
                activeSection === 'telemetry' 
                  ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20' 
                  : 'text-white bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              Telemetry
            </button>
            <button 
              onClick={() => setActiveSection('maintenance')}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded transition-all duration-200 ${
                activeSection === 'maintenance' 
                  ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20' 
                  : 'text-white bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              Maintain
            </button>
            <button 
              onClick={() => setActiveSection('modifications')}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded transition-all duration-200 ${
                activeSection === 'modifications' 
                  ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20' 
                  : 'text-white bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              Mods
            </button>
            <button 
              onClick={() => setActiveSection('juicebox')}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded transition-all duration-200 ${
                activeSection === 'juicebox' 
                  ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20' 
                  : 'text-white bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              Juice™
            </button>
            <button 
              onClick={() => setActiveSection('seasonal')}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded transition-all duration-200 ${
                activeSection === 'seasonal' 
                  ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20' 
                  : 'text-white bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              Season
            </button>
            <button 
              onClick={() => setActiveSection('gloss')}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded transition-all duration-200 ${
                activeSection === 'gloss' 
                  ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20' 
                  : 'text-white bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              Gloss
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Seasonal Checklist Section */}
            {activeSection === 'seasonal' && (
              <div className="seasonal-checklists-section">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                  <div>
                    <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Seasonal Maintenance</h2>
                    <p className="text-gray-400">
                      Season-specific maintenance checklists customized to your climate and vehicle needs
                    </p>
                  </div>
                  
                  <div className="flex items-center mt-4 lg:mt-0 gap-3">
                    <button 
                      onClick={() => {
                        const checklistElement = document.getElementById('seasonalChecklists');
                        if (checklistElement) {
                          exportToPdf(checklistElement, 'GoTime Motorsports - Seasonal Checklists.pdf');
                        }
                      }}
                      className="apex-button-sm flex items-center"
                    >
                      <FileDown size={16} className="mr-2" />
                      Export PDF
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">Current Season:</span>
                      <div className="flex border border-gray-700 rounded overflow-hidden">
                        <button className="p-1.5 bg-green-600 text-white">
                          <Leaf size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-white">
                          <Sun size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-white">
                          <Wind size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-white">
                          <CloudSnow size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div id="seasonalChecklists" className="bg-black rounded-xl p-6 border border-green-500/20">
                  <SeasonalChecklists 
                    vehicle={activeVehicle} 
                    onExport={(data) => {
                      if (data.format === 'pdf') {
                        const checklistElement = document.getElementById('seasonalChecklists');
                        if (checklistElement) {
                          exportToPdf(checklistElement, `GoTime Motorsports - ${data.checklist.name}.pdf`);
                        }
                      }
                    }}
                    onSave={(data) => {
                      console.log('Saving checklist data:', data);
                      // In a real implementation, this would save to Supabase
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* JuiceBox Section */}
            {activeSection === 'juicebox' && (
              <div className="juice-box-section">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                  <div>
                    <h2 className="text-blue-400 font-orbitron text-2xl mb-2">JuiceBox™ Checklists</h2>
                    <p className="text-gray-400">
                      The curated, real-world tested, gloss-backed, expert-approved detailing and maintenance checklists
                    </p>
                  </div>
                  
                  <div className="flex items-center mt-4 lg:mt-0 gap-3">
                    <button 
                      onClick={() => {
                        const checklistElement = document.getElementById('juiceBoxChecklists');
                        if (checklistElement) {
                          exportToPdf(checklistElement, 'GoTime Motorsports - JuiceBox Checklists.pdf');
                        }
                      }}
                      className="apex-button-sm flex items-center"
                    >
                      <FileDown size={16} className="mr-2" />
                      Export PDF
                    </button>
                    <button 
                      onClick={() => {
                        // Open customization modal
                        // This would be implemented with a state variable and modal component
                        alert("Customize checklists feature coming soon!");
                      }}
                      className="apex-button-sm flex items-center"
                    >
                      <Wrench size={16} className="mr-2" />
                      Customize
                    </button>
                  </div>
                </div>
                
                <div id="juiceBoxChecklists" className="bg-black rounded-xl p-6 border border-green-500/20">
                  <JuiceBoxChecklists vehicle={activeVehicle} />
                </div>
              </div>
            )}
            {/* Dashboard View */}
            {activeSection === 'dashboard' && (
              <div className="dashboard-view">
                {/* Current Vehicle Spotlight */}
                {activeVehicle && (
                  <div className="vehicle-spotlight mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gray-900 rounded-xl overflow-hidden border border-blue-500/20 relative">
                      <div className="h-64 md:h-80 relative">
                        <img 
                          src={activeVehicle.image_url || getVehicleImageQuery(activeVehicle)}
                          alt={`${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6">
                          <div className="flex items-center mb-2">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                              carMetrics.carStatus === 'Ready' ? 'bg-green-500' : 
                              carMetrics.carStatus === 'Service Due' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></span>
                            <span className="text-sm text-gray-300">{carMetrics.carStatus}</span>
                          </div>
                          <h2 className="text-white font-orbitron text-2xl md:text-3xl">
                            {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                          </h2>
                          <p className="text-gray-300">{activeVehicle.trim} • {carMetrics.mileage} miles</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full flex items-center">
                          <Clock className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-white text-sm">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-black rounded-lg p-3">
                          <div className="text-sm text-gray-400 mb-1">Last Service</div>
                          <div className="text-white font-medium">{carMetrics.lastService}</div>
                        </div>
                        <div className="bg-black rounded-lg p-3">
                          <div className="text-sm text-gray-400 mb-1">Next Service Due</div>
                          <div className="text-white font-medium">{carMetrics.nextServiceDue}</div>
                        </div>
                        <div className="bg-black rounded-lg p-3">
                          <div className="text-sm text-gray-400 mb-1">Oil Life</div>
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div className="text-white font-medium">{carMetrics.oilLifeRemaining}%</div>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
                              <div 
                                style={{ width: `${carMetrics.oilLifeRemaining}%` }}
                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                  carMetrics.oilLifeRemaining > 60 ? 'bg-green-500' : 
                                  carMetrics.oilLifeRemaining > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-black rounded-lg p-3">
                          <div className="text-sm text-gray-400 mb-1">Gloss Index</div>
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div className="text-white font-medium">{carMetrics.glossIndex}%</div>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
                              <div 
                                style={{ width: `${carMetrics.glossIndex}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500">
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {/* Vehicle Vitals */}
                      <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                        <h3 className="text-blue-400 font-orbitron text-lg mb-4">Vehicle Vitals</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Fuel className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-gray-300">Fuel Level</span>
                            </div>
                            <div className="relative w-32 h-2 bg-gray-700 rounded">
                              <div 
                                className="absolute top-0 left-0 h-2 bg-green-500 rounded"
                                style={{ width: `${carMetrics.fuelLevel}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-medium">{carMetrics.fuelLevel}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Battery className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-gray-300">Battery</span>
                            </div>
                            <div className="relative w-32 h-2 bg-gray-700 rounded">
                              <div 
                                className={`absolute top-0 left-0 h-2 rounded ${
                                  carMetrics.batteryHealth > 70 ? 'bg-green-500' : 
                                  carMetrics.batteryHealth > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${carMetrics.batteryHealth}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-medium">{carMetrics.batteryHealth}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tire Pressure */}
                      <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20 flex-grow">
                        <h3 className="text-blue-400 font-orbitron text-lg mb-4">Tire Pressure (PSI)</h3>
                        <div className="h-40 relative flex items-center justify-center">
                          <div className="w-48 h-32 border-2 border-gray-600 rounded-lg relative">
                            {/* Tire pressure indicators */}
                            <div className="absolute top-2 left-2 text-center">
                              <div className={`font-bold ${
                                carMetrics.tirePressure.frontLeft > 33 && carMetrics.tirePressure.frontLeft < 37 
                                  ? 'text-green-500' : 'text-yellow-500'
                              }`}>
                                {carMetrics.tirePressure.frontLeft}
                              </div>
                              <div className="text-xs text-gray-400">FL</div>
                            </div>
                            <div className="absolute top-2 right-2 text-center">
                              <div className={`font-bold ${
                                carMetrics.tirePressure.frontRight > 33 && carMetrics.tirePressure.frontRight < 37 
                                  ? 'text-green-500' : 'text-yellow-500'
                              }`}>
                                {carMetrics.tirePressure.frontRight}
                              </div>
                              <div className="text-xs text-gray-400">FR</div>
                            </div>
                            <div className="absolute bottom-2 left-2 text-center">
                              <div className={`font-bold ${
                                carMetrics.tirePressure.rearLeft > 33 && carMetrics.tirePressure.rearLeft < 37 
                                  ? 'text-green-500' : 'text-yellow-500'
                              }`}>
                                {carMetrics.tirePressure.rearLeft}
                              </div>
                              <div className="text-xs text-gray-400">RL</div>
                            </div>
                            <div className="absolute bottom-2 right-2 text-center">
                              <div className={`font-bold ${
                                carMetrics.tirePressure.rearRight > 33 && carMetrics.tirePressure.rearRight < 37 
                                  ? 'text-green-500' : 'text-yellow-500'
                              }`}>
                                {carMetrics.tirePressure.rearRight}
                              </div>
                              <div className="text-xs text-gray-400">RR</div>
                            </div>
                            
                            {/* Car outline */}
                            <div className="absolute inset-0 m-auto w-32 h-24 bg-blue-500/10 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Vehicle Collection Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Vehicle Collection</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Vehicles</span>
                        <span className="text-white font-medium">{vehicles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ready</span>
                        <span className="text-white font-medium">{vehicles.filter(v => v.status === 'Ready').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Service Due</span>
                        <span className="text-white font-medium">{vehicles.filter(v => v.status === 'Service Due').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">In Storage</span>
                        <span className="text-white font-medium">{vehicles.filter(v => v.status === 'In Storage').length}</span>
                      </div>
                      <div className="mt-4">
                        <button 
                          onClick={() => setActiveSection('garage')}
                          className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center"
                        >
                          View All Vehicles
                          <ChevronRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-green-500 mr-2"></div>
                        <div>
                          <p className="text-white text-sm">Oil change completed</p>
                          <p className="text-xs text-gray-500">3 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500 mr-2"></div>
                        <div>
                          <p className="text-white text-sm">Ceramic coating applied</p>
                          <p className="text-xs text-gray-500">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-yellow-500 mr-2"></div>
                        <div>
                          <p className="text-white text-sm">Tire rotation scheduled</p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-green-500 mr-2"></div>
                        <div>
                          <p className="text-white text-sm">Detailing completed</p>
                          <p className="text-xs text-gray-500">Yesterday</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Upcoming Services</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-800 flex items-center justify-center rounded-md mr-3">
                          <Wrench className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-white text-sm">Brake fluid flush</p>
                          <p className="text-xs text-gray-500">Due in 3 weeks</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-800 flex items-center justify-center rounded-md mr-3">
                          <Filter className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-white text-sm">Air filter replacement</p>
                          <p className="text-xs text-gray-500">Due in 1 month</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-800 flex items-center justify-center rounded-md mr-3">
                          <Droplets className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-white text-sm">Ceramic coating maintenance</p>
                          <p className="text-xs text-gray-500">Due in 6 weeks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* F1-style Telemetry Preview */}
                <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-blue-400 font-orbitron text-lg">Quick Telemetry</h3>
                    <button 
                      onClick={() => setActiveSection('telemetry')}
                      className="text-sm text-gray-300 hover:text-blue-400 flex items-center"
                    >
                      View Full Telemetry <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                  
                  <div className="h-64">
                    {activeVehicle && (
                      <Suspense fallback={<div className="h-full flex items-center justify-center"><RefreshCw className="animate-spin h-10 w-10 text-blue-500" /></div>}>
                        <F1TelemetryDashboard vehicle={activeVehicle} vehicleData={vehicleData} />
                      </Suspense>
                    )}
                  </div>
                </div>
                
                {/* OBD2 Panel (shows when connected) */}
                {showOBDPanel && (
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20 mb-8 relative">
                    <button 
                      onClick={() => setShowOBDPanel(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                    
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">OBD2 Diagnostics</h3>
                    
                    {!obdScanActive && obdData.engineTemp === 0 ? (
                      <div className="p-8 text-center">
                        <div className="mb-4 inline-flex p-3 bg-blue-500/10 rounded-full">
                          <Gauge size={32} className="text-blue-400" />
                        </div>
                        <h4 className="text-white text-lg mb-2">Connect to OBD2 Scanner</h4>
                        <p className="text-gray-400 mb-6">Connect your OBD2 scanner to monitor real-time engine data and diagnose issues.</p>
                        <button 
                          onClick={startOBDScan}
                          className="apex-button bg-blue-600 hover:bg-blue-700"
                        >
                          Start Scan
                        </button>
                      </div>
                    ) : (
                      <div>
                        {obdScanActive && (
                          <div className="flex items-center justify-center mb-4">
                            <RefreshCw className="animate-spin h-5 w-5 text-blue-500 mr-2" />
                            <span className="text-blue-400">Scanning vehicle systems...</span>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Engine Temp</div>
                            <div className="text-xl font-medium text-white">{obdData.engineTemp}°F</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">RPM</div>
                            <div className="text-xl font-medium text-white">{obdData.rpm}</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Throttle Position</div>
                            <div className="text-xl font-medium text-white">{obdData.throttlePosition}%</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Fuel Pressure</div>
                            <div className="text-xl font-medium text-white">{obdData.fuelPressure} kPa</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Intake Temp</div>
                            <div className="text-xl font-medium text-white">{obdData.intakeTemp}°F</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">MAF</div>
                            <div className="text-xl font-medium text-white">{obdData.maf} g/s</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Timing Advance</div>
                            <div className="text-xl font-medium text-white">{obdData.timingAdvance}°</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">O2 Sensor</div>
                            <div className="text-xl font-medium text-white">{obdData.o2Sensor.toFixed(2)} V</div>
                          </div>
                        </div>
                        
                        {obdData.dtcCodes.length > 0 && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center text-red-400 mb-2">
                              <AlertTriangle size={16} className="mr-2" />
                              <span className="font-medium">Diagnostic Trouble Codes Detected</span>
                            </div>
                            <div className="space-y-2">
                              {obdData.dtcCodes.map((code, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-white">{code}</span>
                                  <span className="text-sm text-gray-400">Evaporative Emission System Leak Detected</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Garage View - Vehicle Grid & List with Filters */}
            {activeSection === 'garage' && (
              <div className="garage-view">
                {/* Filtering and View Options */}
                <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-2 sm:mb-0">Vehicle Collection</h3>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setActiveView('grid')}
                        className={`px-3 py-1 text-sm rounded-md ${
                          activeView === 'grid' ? 'bg-green-500 text-black' : 'text-white bg-gray-800'
                        }`}
                      >
                        Grid View
                      </button>
                      <button 
                        onClick={() => setActiveView('list')}
                        className={`px-3 py-1 text-sm rounded-md ${
                          activeView === 'list' ? 'bg-green-500 text-black' : 'text-white bg-gray-800'
                        }`}
                      >
                        List View
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Make</label>
                      <select 
                        value={filters.make}
                        onChange={(e) => setFilters({...filters, make: e.target.value})}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                      >
                        <option value="all">All Makes</option>
                        {Array.from(new Set(vehicles.map(v => v.make))).map((make, idx) => (
                          <option key={idx} value={make}>{make}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Type</label>
                      <select 
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                      >
                        <option value="all">All Types</option>
                        <option value="Sports">Sports</option>
                        <option value="Luxury">Luxury</option>
                        <option value="SUV">SUV</option>
                        <option value="Classic">Classic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Status</label>
                      <select 
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Ready">Ready</option>
                        <option value="Service Due">Service Due</option>
                        <option value="In Storage">In Storage</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Vehicle Grid View */}
                {activeView === 'grid' && (
                  <div ref={garageGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle, idx) => (
                      <div 
                        key={idx}
                        className={`bg-gray-900 rounded-xl overflow-hidden border transition-all hover:scale-[1.02] ${
                          activeVehicle?.id === vehicle.id 
                            ? 'border-green-500 ring-1 ring-green-500'
                            : 'border-blue-500/20 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="h-48 relative">
                          <img 
                            src={vehicle.image_url || getVehicleImageQuery(vehicle)}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                          <div className="absolute bottom-0 left-0 p-4">
                            <div className="flex items-center mb-1">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                vehicle.status === 'Ready' ? 'bg-green-500' : 
                                vehicle.status === 'Service Due' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></span>
                              <span className="text-xs text-gray-300">{vehicle.status || 'Ready'}</span>
                            </div>
                            <h3 className="text-white font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                            <p className="text-sm text-gray-300">{vehicle.trim}</p>
                          </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div>
                            <div className="text-xs text-gray-400">Mileage</div>
                            <div className="text-white">{vehicle.mileage} miles</div>
                          </div>
                          <button
                            onClick={() => handleVehicleChange(vehicle)}
                            className="px-3 py-1 bg-gray-800 hover:bg-blue-600 text-white text-sm rounded-md transition"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add new vehicle card */}
                    <div 
                      onClick={() => setShowAddForm(true)}
                      className="bg-gray-900 rounded-xl border border-dashed border-gray-700 hover:border-green-500 flex flex-col items-center justify-center h-64 cursor-pointer transition-all hover:bg-gray-800"
                    >
                      <PlusCircle size={32} className="text-green-500 mb-3" />
                      <p className="text-white font-medium">Add New Vehicle</p>
                      <p className="text-sm text-gray-400">Click to add to your collection</p>
                    </div>
                  </div>
                )}
                
                {/* Vehicle List View */}
                {activeView === 'list' && (
                  <div className="bg-gray-900 rounded-xl border border-blue-500/20 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="px-4 py-3 bg-gray-950 text-gray-400 font-medium text-sm">Make & Model</th>
                          <th className="px-4 py-3 bg-gray-950 text-gray-400 font-medium text-sm">Year</th>
                          <th className="px-4 py-3 bg-gray-950 text-gray-400 font-medium text-sm">Mileage</th>
                          <th className="px-4 py-3 bg-gray-950 text-gray-400 font-medium text-sm">Status</th>
                          <th className="px-4 py-3 bg-gray-950 text-gray-400 font-medium text-sm">VIN</th>
                          <th className="px-4 py-3 bg-gray-950 text-gray-400 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVehicles.map((vehicle, idx) => (
                          <tr 
                            key={idx}
                            className={`border-b border-gray-800 hover:bg-gray-800 ${
                              activeVehicle?.id === vehicle.id ? 'bg-green-500/10' : ''
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden mr-3">
                                  <img 
                                    src={vehicle.image_url || getVehicleImageQuery(vehicle)}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="text-white font-medium">{vehicle.make} {vehicle.model}</div>
                                  <div className="text-gray-400 text-sm">{vehicle.trim}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white">{vehicle.year}</td>
                            <td className="px-4 py-3 text-white">{vehicle.mileage} miles</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                vehicle.status === 'Ready' ? 'bg-green-500/10 text-green-400' : 
                                vehicle.status === 'Service Due' ? 'bg-yellow-500/10 text-yellow-400' : 
                                'bg-blue-500/10 text-blue-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                  vehicle.status === 'Ready' ? 'bg-green-500' : 
                                  vehicle.status === 'Service Due' ? 'bg-yellow-500' : 
                                  'bg-blue-500'
                                }`}></span>
                                {vehicle.status || 'Ready'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">{vehicle.vin || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleVehicleChange(vehicle)}
                                  className="p-1 text-gray-400 hover:text-white"
                                  title="View"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  className="p-1 text-gray-400 hover:text-white"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Telemetry View */}
            {activeSection === 'telemetry' && activeVehicle && (
              <div ref={telemetryRef} className="telemetry-view">
                {/* Enhanced Telemetry Dashboard */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Enhanced Vehicle Telemetry</h2>
                      <p className="text-gray-400">
                        Advanced F1-inspired real-time vehicle monitoring and performance analytics
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setExpandedTelemetry(!expandedTelemetry)}
                        className="apex-button-sm flex items-center"
                      >
                        <Maximize2 size={16} className="mr-2" />
                        {expandedTelemetry ? 'Compact View' : 'Expanded View'}
                      </button>
                      <button 
                        onClick={startOBDScan}
                        className={`apex-button-sm flex items-center ${obdScanActive ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                        disabled={obdScanActive}
                      >
                        <Activity size={16} className="mr-2" />
                        {obdScanActive ? 'Scanning...' : 'Scan OBD'}
                      </button>
                    </div>
                  </div>
                  
                  <EnhancedVehicleTelemetry 
                    vehicle={activeVehicle}
                    telemetryData={{
                      ...obdData,
                      fuelLevel: carMetrics.fuelLevel,
                      batteryVoltage: carMetrics.batteryHealth / 10 + 10, // Convert percentage to voltage
                      engineTemp: obdData.engineTemp || 195,
                      coolantTemp: obdData.engineTemp || 190,
                      oilPressure: 45,
                      oilTemp: 215,
                    }}
                    isExpanded={expandedTelemetry}
                    onToggleExpand={() => setExpandedTelemetry(!expandedTelemetry)}
                  />
                </div>
                
                {/* OBD Information Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-orbitron text-blue-400 mb-4 flex items-center">
                      <Activity size={18} className="mr-2" />
                      OBD Connection Status
                    </h3>
                    
                    {obdScanActive ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Scan Status</span>
                          <span className="text-green-500 flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            Active
                          </span>
                        </div>
                        
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">ENGINE TEMP</div>
                            <div className="text-lg font-medium text-white">{obdData.engineTemp}°F</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">RPM</div>
                            <div className="text-lg font-medium text-white">{obdData.rpm}</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">MAF</div>
                            <div className="text-lg font-medium text-white">{obdData.maf} g/s</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">INTAKE TEMP</div>
                            <div className="text-lg font-medium text-white">{obdData.intakeTemp}°F</div>
                          </div>
                        </div>
                        
                        {obdData.dtcCodes.length > 0 && (
                          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                            <h4 className="text-red-500 font-medium flex items-center">
                              <AlertTriangle size={16} className="mr-2" />
                              DTC Codes Detected
                            </h4>
                            <ul className="mt-2 space-y-1">
                              {obdData.dtcCodes.map((code, index) => (
                                <li key={index} className="text-red-400 text-sm flex items-center">
                                  <span className="inline-block w-16 font-mono">{code}</span>
                                  <span>- Evaporative System Leak Detected (Very Small Leak)</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Scan Status</span>
                          <span className="text-gray-500">Inactive</span>
                        </div>
                        
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-700 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        
                        <p className="text-gray-400 text-center mt-6">
                          Click "Scan OBD" to connect to your vehicle's onboard diagnostic system.
                        </p>
                        
                        <button 
                          onClick={startOBDScan}
                          className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center"
                        >
                          <Activity size={16} className="mr-2" />
                          Start OBD Scan
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-orbitron text-blue-400 mb-4 flex items-center">
                      <Shield size={18} className="mr-2" />
                      Diagnostic Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${carMetrics.carStatus === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'} mr-3`}></div>
                          <span className="text-gray-300">Overall Status</span>
                        </div>
                        <span className="text-white font-medium">{carMetrics.carStatus}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col p-3 bg-gray-800 rounded-lg">
                          <span className="text-xs text-gray-400 mb-1">LAST SERVICE</span>
                          <span className="text-white">{carMetrics.lastService}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-gray-800 rounded-lg">
                          <span className="text-xs text-gray-400 mb-1">NEXT SERVICE</span>
                          <span className="text-white">{carMetrics.nextServiceDue}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-gray-800 rounded-lg">
                          <span className="text-xs text-gray-400 mb-1">OIL LIFE</span>
                          <div className="flex items-center">
                            <span className="text-white mr-2">{carMetrics.oilLifeRemaining}%</span>
                            <div className="flex-grow h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  carMetrics.oilLifeRemaining > 60 ? 'bg-green-500' : 
                                  carMetrics.oilLifeRemaining > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${carMetrics.oilLifeRemaining}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col p-3 bg-gray-800 rounded-lg">
                          <span className="text-xs text-gray-400 mb-1">ENGINE STATUS</span>
                          <span className="text-white">{carMetrics.engineStatus}</span>
                        </div>
                      </div>
                      
                      <button 
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center mt-2"
                      >
                        <FileDown size={16} className="mr-2" />
                        Download Diagnostic Report
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Legacy Telemetry (original implementation) */}
                <div className="mt-8 bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-blue-400 font-orbitron text-lg">
                      <span className="mr-2">⚡</span> F1-Style Performance Telemetry
                    </h3>
                  </div>
                  
                  <div className={expandedTelemetry ? "min-h-[600px]" : "min-h-[400px]"}>
                    <Suspense fallback={<div className="h-full flex items-center justify-center"><RefreshCw className="animate-spin h-10 w-10 text-blue-500" /></div>}>
                      <F1TelemetryDashboard vehicle={activeVehicle} vehicleData={vehicleData} />
                    </Suspense>
                  </div>
                </div>
              </div>
            )}
            
            {/* Maintenance View */}
            {activeSection === 'maintenance' && activeVehicle && (
              <div className="maintenance-view">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-1 bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Maintenance Schedule</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-white font-medium">Oil Change</div>
                          <div className="text-sm text-gray-400">Every 5,000 miles</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                          <span className="text-white ml-3">68%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Next: In 1,600 miles</div>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-white font-medium">Tire Rotation</div>
                          <div className="text-sm text-gray-400">Every 6,000 miles</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                          </div>
                          <span className="text-white ml-3">42%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Next: In 3,480 miles</div>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-white font-medium">Brake Inspection</div>
                          <div className="text-sm text-gray-400">Every 10,000 miles</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                          <span className="text-white ml-3">15%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Next: In 8,500 miles</div>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-white font-medium">Air Filter</div>
                          <div className="text-sm text-gray-400">Every 15,000 miles</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                          </div>
                          <span className="text-white ml-3">95%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Next: Due now</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Maintenance Records</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="px-4 py-2 bg-gray-950 text-gray-400 font-medium text-sm">Date</th>
                            <th className="px-4 py-2 bg-gray-950 text-gray-400 font-medium text-sm">Service</th>
                            <th className="px-4 py-2 bg-gray-950 text-gray-400 font-medium text-sm">Mileage</th>
                            <th className="px-4 py-2 bg-gray-950 text-gray-400 font-medium text-sm">Technician</th>
                            <th className="px-4 py-2 bg-gray-950 text-gray-400 font-medium text-sm">Parts</th>
                            <th className="px-4 py-2 bg-gray-950 text-gray-400 font-medium text-sm">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-800 hover:bg-gray-800">
                            <td className="px-4 py-3 text-white">2023-10-15</td>
                            <td className="px-4 py-3 text-white">Oil Change</td>
                            <td className="px-4 py-3 text-white">12,245</td>
                            <td className="px-4 py-3 text-white">Mike J.</td>
                            <td className="px-4 py-3 text-white">Motul 8100 5W-40</td>
                            <td className="px-4 py-3 text-gray-400">Replaced oil filter</td>
                          </tr>
                          <tr className="border-b border-gray-800 hover:bg-gray-800">
                            <td className="px-4 py-3 text-white">2023-07-22</td>
                            <td className="px-4 py-3 text-white">Brake Service</td>
                            <td className="px-4 py-3 text-white">10,870</td>
                            <td className="px-4 py-3 text-white">Chris T.</td>
                            <td className="px-4 py-3 text-white">Brembo Pads, Rotors</td>
                            <td className="px-4 py-3 text-gray-400">Front brake service</td>
                          </tr>
                          <tr className="border-b border-gray-800 hover:bg-gray-800">
                            <td className="px-4 py-3 text-white">2023-05-14</td>
                            <td className="px-4 py-3 text-white">Tire Rotation</td>
                            <td className="px-4 py-3 text-white">9,450</td>
                            <td className="px-4 py-3 text-white">Sarah L.</td>
                            <td className="px-4 py-3 text-white">N/A</td>
                            <td className="px-4 py-3 text-gray-400">Balanced all wheels</td>
                          </tr>
                          <tr className="hover:bg-gray-800">
                            <td className="px-4 py-3 text-white">2023-03-02</td>
                            <td className="px-4 py-3 text-white">Oil Change</td>
                            <td className="px-4 py-3 text-white">7,120</td>
                            <td className="px-4 py-3 text-white">Mike J.</td>
                            <td className="px-4 py-3 text-white">Motul 8100 5W-40</td>
                            <td className="px-4 py-3 text-gray-400">Replaced air filter</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button 
                        className="apex-button-sm mr-2"
                        onClick={() => setShowAddMaintenanceForm(true)}
                      >
                        <PlusCircle size={16} className="mr-1" />
                        Add Record
                      </button>
                      <button className="apex-button-sm">
                        <Download size={16} className="mr-1" />
                        Export History
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Component Health</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-32 text-gray-300">Engine</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                        </div>
                        <div className="ml-4 text-white">92%</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-32 text-gray-300">Transmission</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '88%' }}></div>
                          </div>
                        </div>
                        <div className="ml-4 text-white">88%</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-32 text-gray-300">Brake Pads</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                        <div className="ml-4 text-white">65%</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-32 text-gray-300">Tires</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '72%' }}></div>
                          </div>
                        </div>
                        <div className="ml-4 text-white">72%</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-32 text-gray-300">Battery</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                          </div>
                        </div>
                        <div className="ml-4 text-white">90%</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-32 text-gray-300">Suspension</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div className="ml-4 text-white">85%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Service Providers</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-800 p-3 rounded-lg flex items-start">
                        <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center rounded-lg">
                          <Wrench className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-white font-medium">Premium Auto Service</h4>
                          <p className="text-gray-400 text-sm">123 Motorsport Ave, Nashville, TN</p>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500">★★★★★</span>
                            <span className="text-xs text-gray-400 ml-1">Trusted Partner</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg flex items-start">
                        <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center rounded-lg">
                          <Droplets className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-white font-medium">Elite Detail Studio</h4>
                          <p className="text-gray-400 text-sm">456 Shine Blvd, Nashville, TN</p>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500">★★★★☆</span>
                            <span className="text-xs text-gray-400 ml-1">Ceramic Coating Specialist</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg flex items-start">
                        <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center rounded-lg">
                          <PieChartIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-white font-medium">Performance Tuning Inc.</h4>
                          <p className="text-gray-400 text-sm">789 Horsepower Lane, Nashville, TN</p>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500">★★★★★</span>
                            <span className="text-xs text-gray-400 ml-1">ECU Tuning Experts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Modifications View */}
            {activeSection === 'modifications' && activeVehicle && (
              <div className="modifications-view">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-1 bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Vehicle Modifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white text-sm">Type Filter:</span>
                        <select 
                          className="bg-gray-800 text-white text-sm border border-gray-700 rounded-md px-2 py-1"
                          onChange={(e) => {
                            // Add filter functionality here
                          }}
                          defaultValue="all"
                        >
                          <option value="all">All Types</option>
                          <option value="Performance">Performance</option>
                          <option value="Aesthetic">Aesthetic</option>
                          <option value="Wheels & Suspension">Wheels & Suspension</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Lighting">Lighting</option>
                          <option value="Interior">Interior</option>
                          <option value="Exhaust">Exhaust</option>
                          <option value="Intake">Intake</option>
                          <option value="Engine">Engine</option>
                          <option value="Brakes">Brakes</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setActiveVehicle(activeVehicle);
                          setShowAddModForm(true);
                        }}
                        className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center"
                      >
                        <PlusCircle size={16} className="mr-2" />
                        Add New Modification
                      </button>
                      
                      <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700 mt-4">
                        <h4 className="text-gray-300 font-medium flex items-center mb-2">
                          <Wrench size={16} className="mr-2 text-blue-400" />
                          Modification Stats
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-800 p-2 rounded-lg">
                            <div className="text-xs text-gray-400">Total</div>
                            <div className="text-white">{modifications.filter(m => m.vehicleId === activeVehicle.id).length}</div>
                          </div>
                          <div className="bg-gray-800 p-2 rounded-lg">
                            <div className="text-xs text-gray-400">Installed</div>
                            <div className="text-white">{modifications.filter(m => m.vehicleId === activeVehicle.id && m.status === 'Installed').length}</div>
                          </div>
                          <div className="bg-gray-800 p-2 rounded-lg">
                            <div className="text-xs text-gray-400">Planned</div>
                            <div className="text-white">{modifications.filter(m => m.vehicleId === activeVehicle.id && m.status === 'Planned').length}</div>
                          </div>
                          <div className="bg-gray-800 p-2 rounded-lg">
                            <div className="text-xs text-gray-400">In Progress</div>
                            <div className="text-white">{modifications.filter(m => m.vehicleId === activeVehicle.id && m.status === 'In Progress').length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20 h-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-blue-400 font-orbitron text-lg">Modification List</h3>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              // Export modifications to CSV
                              const vehicleMods = modifications.filter(m => m.vehicleId === activeVehicle.id);
                              if (vehicleMods.length > 0) {
                                exportToCsv(vehicleMods, `${activeVehicle.make}_${activeVehicle.model}_modifications`);
                              }
                            }}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md flex items-center"
                            title="Export to CSV"
                          >
                            <FileDown size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              // Print modifications list
                              const printSection = document.getElementById('modifications-list');
                              if (printSection) {
                                printElement(printSection);
                              }
                            }}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md flex items-center"
                            title="Print"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div id="modifications-list" className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                        {modifications.filter(m => m.vehicleId === activeVehicle.id).length > 0 ? (
                          modifications
                            .filter(m => m.vehicleId === activeVehicle.id)
                            .map((mod, index) => (
                              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500/30 transition-colors">
                                <div className="flex justify-between mb-3">
                                  <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                      mod.status === 'Installed' ? 'bg-green-500' : 
                                      mod.status === 'Planned' ? 'bg-yellow-500' : 
                                      mod.status === 'In Progress' ? 'bg-blue-500' : 'bg-red-500'
                                    }`}></div>
                                    <h4 className="font-medium text-white">{mod.name}</h4>
                                  </div>
                                  <div className="flex space-x-1">
                                    <button 
                                      className="p-1 text-gray-400 hover:text-white"
                                      onClick={() => {
                                        // Implement edit modification functionality
                                        setActiveMod(mod);
                                      }}
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button 
                                      className="p-1 text-gray-400 hover:text-red-500"
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this modification?')) {
                                          // Implement delete modification functionality
                                          setModifications(modifications.filter(m => m.id !== mod.id));
                                        }
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm mb-3">
                                  <div>
                                    <span className="text-gray-400">Type:</span>
                                    <span className="text-white ml-2">{mod.type}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Brand:</span>
                                    <span className="text-white ml-2">{mod.brand || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Status:</span>
                                    <span className="text-white ml-2">{mod.status}</span>
                                  </div>
                                  {mod.installation_date && (
                                    <div>
                                      <span className="text-gray-400">Installed:</span>
                                      <span className="text-white ml-2">{new Date(mod.installation_date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {mod.cost && (
                                    <div>
                                      <span className="text-gray-400">Cost:</span>
                                      <span className="text-white ml-2">${parseFloat(mod.cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>
                                  )}
                                  {mod.installer && (
                                    <div>
                                      <span className="text-gray-400">Installer:</span>
                                      <span className="text-white ml-2">{mod.installer}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {mod.description && (
                                  <div className="text-sm text-gray-300 mt-2 bg-gray-800/50 p-2 rounded">
                                    {mod.description}
                                  </div>
                                )}
                                
                                {mod.affected_systems && mod.affected_systems.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs text-gray-400">Affected Systems:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {mod.affected_systems.map((system, idx) => (
                                        <span key={idx} className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded">
                                          {system}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {mod.image_url && (
                                  <div className="mt-3">
                                    <img 
                                      src={mod.image_url} 
                                      alt={mod.name} 
                                      className="w-full h-48 object-cover rounded-md"
                                      onError={(e) => {
                                        e.target.src = '/assets/placeholder.jpg';
                                        e.target.onerror = null;
                                      }}
                                    />
                                  </div>
                                )}
                                
                                {mod.link_url && mod.link_label && (
                                  <div className="mt-2">
                                    <a 
                                      href={mod.link_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center"
                                    >
                                      <ExternalLink size={14} className="mr-1" />
                                      {mod.link_label}
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-gray-800 rounded-full p-3 mb-4">
                              <Wrench size={24} className="text-gray-400" />
                            </div>
                            <h4 className="text-lg text-white mb-2">No Modifications Added</h4>
                            <p className="text-gray-400 max-w-md">
                              Track all your vehicle modifications by clicking the "Add New Modification" button.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Gloss Metrics View */}
            {activeSection === 'gloss' && activeVehicle && (
              <div className="gloss-view">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-blue-400 font-orbitron text-lg">Gloss Index History</h3>
                      <div className="flex items-center">
                        <span className="text-gray-400 text-sm mr-3">Current: {carMetrics.glossIndex}%</span>
                        <div className={`px-2 py-1 rounded text-xs ${
                          carMetrics.glossIndex > 80 ? 'bg-green-500/10 text-green-400' : 
                          carMetrics.glossIndex > 50 ? 'bg-yellow-500/10 text-yellow-400' : 
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {carMetrics.glossIndex > 80 ? 'Excellent' : 
                           carMetrics.glossIndex > 50 ? 'Good' : 'Needs Attention'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-64">
                      <Suspense fallback={<div className="h-full flex items-center justify-center"><RefreshCw className="animate-spin h-10 w-10 text-blue-500" /></div>}>
                        <GlossTracker vehicle={activeVehicle} />
                      </Suspense>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Treatment History</h3>
                    <div className="space-y-4">
                      <div className="border-l-2 border-green-500 pl-4 pb-5 relative">
                        <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-0"></div>
                        <div className="text-white font-semibold">Ceramic Coating</div>
                        <div className="text-sm text-gray-400">Applied 3 months ago</div>
                        <div className="text-sm text-gray-300 mt-1">5-year Ceramic Pro Gold Package</div>
                      </div>
                      
                      <div className="border-l-2 border-blue-500 pl-4 pb-5 relative">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0"></div>
                        <div className="text-white font-semibold">Paint Correction</div>
                        <div className="text-sm text-gray-400">Performed 3 months ago</div>
                        <div className="text-sm text-gray-300 mt-1">Full paint correction before ceramic coating</div>
                      </div>
                      
                      <div className="border-l-2 border-purple-500 pl-4 pb-5 relative">
                        <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[7px] top-0"></div>
                        <div className="text-white font-semibold">Full Detail</div>
                        <div className="text-sm text-gray-400">Performed 2 weeks ago</div>
                        <div className="text-sm text-gray-300 mt-1">Maintenance wash and detailing</div>
                      </div>
                      
                      <div className="border-l-2 border-gray-500 pl-4 relative">
                        <div className="absolute w-3 h-3 bg-gray-500 rounded-full -left-[7px] top-0"></div>
                        <div className="text-white font-semibold">Wash Protocol</div>
                        <div className="text-sm text-gray-400">Last performed yesterday</div>
                        <div className="text-sm text-gray-300 mt-1">2-bucket method with Frothe™</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Paint Condition</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Swirl Marks</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                          </div>
                          <div className="ml-3 text-white">Minimal</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Scratches</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '8%' }}></div>
                          </div>
                          <div className="ml-3 text-white">Minimal</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Water Spots</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '2%' }}></div>
                          </div>
                          <div className="ml-3 text-white">None</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Paint Chips</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                          <div className="ml-3 text-white">Few</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Protection Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Ceramic Coating Integrity</span>
                        <span className="text-green-400 font-medium">Excellent</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Hydrophobic Effect</span>
                        <span className="text-green-400 font-medium">Excellent</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">UV Protection</span>
                        <span className="text-green-400 font-medium">Excellent</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-white mb-2">Next Recommended Treatment:</div>
                        <div className="bg-blue-500/10 p-3 rounded-lg text-blue-300">
                          Maintenance wash with Frothe™ in 1 week
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Screen reader announcer */}
      <div id="announcer" className="sr-only" aria-live="polite"></div>
      
      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-blue-500/20 p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-blue-400 font-orbitron text-xl">Add New Vehicle</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Make</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                  placeholder="e.g. Ferrari"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Model</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                  placeholder="e.g. 458 Italia"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Year</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                  placeholder="e.g. 2023"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mileage</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                  placeholder="e.g. 10500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">VIN (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                  placeholder="Vehicle Identification Number"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2">
                  <option value="Ready">Ready</option>
                  <option value="Service Due">Service Due</option>
                  <option value="In Storage">In Storage</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-1">Image URL (Optional)</label>
              <input 
                type="text" 
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                placeholder="https://example.com/car-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to use AI-generated images based on make/model</p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-600 text-white rounded-md hover:bg-gray-800"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GarageVaultPage;