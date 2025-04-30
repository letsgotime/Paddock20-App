import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import supabase from '../services/supabaseClient';
import { exportToPdf, exportToCsv, printElement } from '../utils/exportUtils';

// Components
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
import OBDLiveDashboard from '../components/OBDLiveDashboard';

// Data services
import vehicleDataService from '../services/vehicleDataService';
import { searchImage } from '../services/unsplashService';

// Icons
import { 
  Activity, BarChart2, Wind, Thermometer, FileDown, RefreshCw,
  Clock, Calendar, PieChart as PieChartIcon, AlertTriangle, TrendingUp, 
  ChevronRight, ChevronDown, ChevronUp, Gauge, Info, Fuel, Droplets, Battery, 
  Car, Upload, Maximize2, Zap, MapPin, Mountain, Filter, PlusCircle, 
  Wrench, Shield, Camera, Clipboard, MoreHorizontal, Eye, Trash2, Download, X, Plus,
  CloudSnow, Sun, Leaf, Settings, Printer, ExternalLink, Pencil
} from 'lucide-react';

// Types
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  license_plate: string;
  color: string;
  image_url: string;
  purchase_date: string;
  notes: string;
  status: string;
  type: string;
}

interface TirePressure {
  frontLeft: number;
  frontRight: number;
  rearLeft: number;
  rearRight: number;
}

interface CarMetrics {
  mileage: number;
  lastService: string;
  nextService: string;
  fuelLevel: number;
  carStatus: 'Ready' | 'Service Due' | 'Maintenance Required';
  oilLevel: number;
  oilHealth: number;
  oilTemp: number;
  coolantTemp: number;
  batteryHealth: number;
  engineHealth: number;
  brakeHealth: number;
  transmissionHealth: number;
  tirePressure: TirePressure;
  glossIndex: number;
}

interface OBDData {
  connected: boolean;
  engineTemp: number;
  rpm: number;
  speed: number;
  throttlePosition: number;
  fuelPressure: number;
  intakeTemp: number;
  maf: number;
  timingAdvance: number;
  o2Sensor: number;
  dtcCodes: string[];
}

/**
 * GoTime Garage Vault - The brain of the application
 * Core Features:
 * 1. Vehicle Management & Telemetry
 * 2. Maintenance & Modification Tracking
 * 3. OBD2 Integration
 * 4. JuiceBox™ & Detailing Tools
 * 5. Document & Media Management
 */
const GoTimeGarageVault: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeView, setActiveView] = useState('grid');
  const [expandedTelemetry, setExpandedTelemetry] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showAddMaintenanceForm, setShowAddMaintenanceForm] = useState(false);
  const [showAddModificationForm, setShowAddModificationForm] = useState(false);
  
  // OBD2 connection state
  const [obdConnected, setObdConnected] = useState(false);
  const [obdData, setObdData] = useState<OBDData>({
    connected: false,
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

  // Placeholder empty state for CarMetrics
  const [carMetrics, setCarMetrics] = useState<CarMetrics>({
    mileage: 0,
    lastService: '',
    nextService: '',
    fuelLevel: 0,
    carStatus: 'Ready',
    oilLevel: 0,
    oilHealth: 0,
    oilTemp: 0,
    coolantTemp: 0,
    batteryHealth: 0,
    engineHealth: 0,
    brakeHealth: 0,
    transmissionHealth: 0,
    tirePressure: {
      frontLeft: 0,
      frontRight: 0,
      rearLeft: 0,
      rearRight: 0
    },
    glossIndex: 0
  });

  // Refs
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Load vehicles from Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setVehicles(data);
          setActiveVehicle(data[0]);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle adding a new vehicle
  const handleAddVehicle = async (vehicleData: any) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select();
      
      if (error) throw error;
      
      if (data) {
        setVehicles([...vehicles, data[0]]);
        setActiveVehicle(data[0]);
        setShowAddVehicleForm(false);
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  // Handle adding a new maintenance record
  const handleAddMaintenance = async (maintenanceData: any) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .insert([{
          ...maintenanceData,
          vehicle_id: activeVehicle?.id
        }])
        .select();
      
      if (error) throw error;
      
      setShowAddMaintenanceForm(false);
      // Reload vehicle data to reflect new maintenance record
      // This would be better implemented with a proper state management solution
    } catch (error) {
      console.error('Error adding maintenance record:', error);
    }
  };

  // Handle adding a new modification
  const handleAddModification = async (modificationData: any) => {
    try {
      const { data, error } = await supabase
        .from('modifications')
        .insert([{
          ...modificationData,
          vehicle_id: activeVehicle?.id
        }])
        .select();
      
      if (error) throw error;
      
      setShowAddModificationForm(false);
      // Reload vehicle data to reflect new modification
    } catch (error) {
      console.error('Error adding modification:', error);
    }
  };

  // Export functions
  const handleExportToPDF = () => {
    if (!activeVehicle) return;
    
    const element = document.getElementById('vehicleData');
    if (element) {
      exportToPdf(element, `${activeVehicle.year}_${activeVehicle.make}_${activeVehicle.model}_Report.pdf`);
    }
    setShowExportMenu(false);
  };

  const handleExportToCSV = () => {
    if (!activeVehicle) return;
    
    // Convert vehicle data to CSV
    const csvData = [
      ['Property', 'Value'],
      ['Make', activeVehicle.make],
      ['Model', activeVehicle.model],
      ['Year', activeVehicle.year.toString()],
      ['VIN', activeVehicle.vin],
      ['Mileage', carMetrics.mileage.toString()],
      ['Last Service', carMetrics.lastService],
      ['Next Service', carMetrics.nextService]
    ];
    
    exportToCsv(csvData, `${activeVehicle.year}_${activeVehicle.make}_${activeVehicle.model}_Report.csv`);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    const element = document.getElementById('vehicleData');
    if (element) {
      printElement(element);
    }
    setShowExportMenu(false);
  };

  // Get vehicle image
  const getVehicleImageQuery = (vehicle: Vehicle) => {
    if (vehicle.image_url) return vehicle.image_url;
    return `https://source.unsplash.com/featured/?${vehicle.make},${vehicle.model},car`;
  };

  // Empty state content - display when no data is available
  const EmptyVehicleState = () => (
    <div className="flex flex-col items-center justify-center h-64 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
      <Car className="h-16 w-16 text-gray-600 mb-4" />
      <h3 className="text-xl text-gray-300 mb-2">No Vehicles Added Yet</h3>
      <p className="text-gray-400 text-center mb-4">Add your first vehicle to start tracking maintenance, modifications, and telemetry.</p>
      <button 
        onClick={() => setShowAddVehicleForm(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Vehicle
      </button>
    </div>
  );

  const EmptyMaintenanceState = () => (
    <div className="flex flex-col items-center justify-center h-64 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
      <Wrench className="h-16 w-16 text-gray-600 mb-4" />
      <h3 className="text-xl text-gray-300 mb-2">No Maintenance Records</h3>
      <p className="text-gray-400 text-center mb-4">Keep track of all service, repairs, and maintenance for this vehicle.</p>
      <button 
        onClick={() => setShowAddMaintenanceForm(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Maintenance Record
      </button>
    </div>
  );

  const EmptyModificationState = () => (
    <div className="flex flex-col items-center justify-center h-64 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
      <Settings className="h-16 w-16 text-gray-600 mb-4" />
      <h3 className="text-xl text-gray-300 mb-2">No Modifications Added</h3>
      <p className="text-gray-400 text-center mb-4">Document upgrades, aftermarket parts, and customizations for your vehicle.</p>
      <button 
        onClick={() => setShowAddModificationForm(true)}
        className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-4 py-2 rounded-md flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Modification
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header & Navigation */}
      <div className="p-4 md:p-6 border-b border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center">
            <h2 
              id="garageVaultHeading" 
              className="text-blue-400 font-orbitron text-2xl md:text-3xl"
            >
              GoTime Garage Vault<span className="text-white"> | Digital Pit Wall</span>
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
              onClick={() => window.open('/obd-connection', '_blank')}
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
                      <Printer size={16} className="mr-2" /> Print
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowAddVehicleForm(true)}
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
          <div id="vehicleData">
            {/* Dashboard View */}
            {activeSection === 'dashboard' && (
              <div className="dashboard-view">
                {vehicles.length === 0 ? (
                  <EmptyVehicleState />
                ) : (
                  <>
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
                              <p className="text-gray-300">{activeVehicle.trim} • {carMetrics.mileage > 0 ? `${carMetrics.mileage} miles` : 'Mileage not recorded'}</p>
                            </div>
                            <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full flex items-center">
                              <Clock className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-white text-sm">{new Date().toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-black rounded-lg p-3">
                              <div className="text-sm text-gray-400 mb-1">Last Service</div>
                              <div className="text-white font-medium">{carMetrics.lastService || 'Not recorded'}</div>
                            </div>
                            <div className="bg-black rounded-lg p-3">
                              <div className="text-sm text-gray-400 mb-1">Next Service Due</div>
                              <div className="text-white font-medium">{carMetrics.nextService || 'Not scheduled'}</div>
                            </div>
                            <div className="bg-black rounded-lg p-3">
                              <div className="text-sm text-gray-400 mb-1">Engine Health</div>
                              <div className={`text-white font-medium ${
                                carMetrics.engineHealth >= 80 ? 'text-green-500' : 
                                carMetrics.engineHealth >= 60 ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {carMetrics.engineHealth > 0 ? `${carMetrics.engineHealth}%` : 'Not recorded'}
                              </div>
                            </div>
                            <div className="bg-black rounded-lg p-3">
                              <div className="text-sm text-gray-400 mb-1">Gloss Index</div>
                              <div className={`text-white font-medium ${
                                carMetrics.glossIndex >= 80 ? 'text-green-500' : 
                                carMetrics.glossIndex >= 60 ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {carMetrics.glossIndex > 0 ? `${carMetrics.glossIndex}%` : 'Not measured'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                          {/* Vehicle Vitals - F1-style Layout */}
                          <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-blue-400 font-orbitron text-lg">Vehicle Vitals</h3>
                              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Real-time telemetry</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Left Column - Fuel & Battery */}
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center">
                                      <Fuel className="h-4 w-4 text-green-500 mr-2" />
                                      <span className="text-gray-300 text-sm">Fuel Level</span>
                                    </div>
                                    <span className="text-white font-medium text-sm">
                                      {carMetrics.fuelLevel > 0 ? `${carMetrics.fuelLevel}%` : '--'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
                                    <div 
                                      className={`h-full rounded-full ${
                                        carMetrics.fuelLevel > 60 ? 'bg-green-500' : 
                                        carMetrics.fuelLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${carMetrics.fuelLevel || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center">
                                      <Battery className="h-4 w-4 text-green-500 mr-2" />
                                      <span className="text-gray-300 text-sm">Battery Health</span>
                                    </div>
                                    <span className="text-white font-medium text-sm">
                                      {carMetrics.batteryHealth > 0 ? `${carMetrics.batteryHealth}%` : '--'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
                                    <div 
                                      className={`h-full rounded-full ${
                                        carMetrics.batteryHealth > 80 ? 'bg-green-500' : 
                                        carMetrics.batteryHealth > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${carMetrics.batteryHealth || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right Column - Temperatures */}
                              <div className="space-y-3">
                                <div className="rounded-lg bg-black/60 p-2.5 flex justify-between items-center">
                                  <div className="flex items-center">
                                    <Thermometer className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-gray-300 text-sm">Oil Temp</span>
                                  </div>
                                  <span className={`text-sm font-mono font-medium ${
                                    carMetrics.oilTemp < 220 ? 'text-green-400' : 
                                    carMetrics.oilTemp < 250 ? 'text-yellow-400' : 'text-red-400'
                                  }`}>
                                    {carMetrics.oilTemp > 0 ? `${carMetrics.oilTemp}°F` : '--'}
                                  </span>
                                </div>
                                
                                <div className="rounded-lg bg-black/60 p-2.5 flex justify-between items-center">
                                  <div className="flex items-center">
                                    <Thermometer className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-gray-300 text-sm">Coolant Temp</span>
                                  </div>
                                  <span className={`text-sm font-mono font-medium ${
                                    carMetrics.coolantTemp < 200 ? 'text-green-400' : 
                                    carMetrics.coolantTemp < 230 ? 'text-yellow-400' : 'text-red-400'
                                  }`}>
                                    {carMetrics.coolantTemp > 0 ? `${carMetrics.coolantTemp}°F` : '--'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tire Pressure - F1-style Layout */}
                          <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-blue-400 font-orbitron text-lg">Tire Pressure (PSI)</h3>
                              <div className="flex items-center gap-2">
                                <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                                <span className="text-xs text-gray-400">Optimal</span>
                                <span className="h-3 w-3 bg-yellow-500 rounded-full ml-2"></span>
                                <span className="text-xs text-gray-400">Attention</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Tire Diagram */}
                              <div className="flex items-center justify-center">
                                <div className="relative w-48 h-32">
                                  <div className="absolute inset-0 border-2 border-gray-700 rounded-lg"></div>
                                  
                                  {/* Car outline */}
                                  <div className="absolute inset-x-10 inset-y-6 bg-gray-800/70 rounded"></div>
                                  
                                  {/* Tire indicators with larger, more visible styling */}
                                  <div className="absolute top-1 left-1 bg-gray-800 p-1.5 rounded-lg text-center shadow-md">
                                    <div className={`font-bold text-lg ${
                                      carMetrics.tirePressure.frontLeft > 33 && carMetrics.tirePressure.frontLeft < 37 
                                        ? 'text-green-500' : carMetrics.tirePressure.frontLeft > 0 ? 'text-yellow-500' : 'text-gray-500'
                                    }`}>
                                      {carMetrics.tirePressure.frontLeft > 0 ? carMetrics.tirePressure.frontLeft : '--'}
                                    </div>
                                    <div className="text-xs text-gray-400 font-semibold">FL</div>
                                  </div>
                                  
                                  <div className="absolute top-1 right-1 bg-gray-800 p-1.5 rounded-lg text-center shadow-md">
                                    <div className={`font-bold text-lg ${
                                      carMetrics.tirePressure.frontRight > 33 && carMetrics.tirePressure.frontRight < 37 
                                        ? 'text-green-500' : carMetrics.tirePressure.frontRight > 0 ? 'text-yellow-500' : 'text-gray-500'
                                    }`}>
                                      {carMetrics.tirePressure.frontRight > 0 ? carMetrics.tirePressure.frontRight : '--'}
                                    </div>
                                    <div className="text-xs text-gray-400 font-semibold">FR</div>
                                  </div>
                                  
                                  <div className="absolute bottom-1 left-1 bg-gray-800 p-1.5 rounded-lg text-center shadow-md">
                                    <div className={`font-bold text-lg ${
                                      carMetrics.tirePressure.rearLeft > 33 && carMetrics.tirePressure.rearLeft < 37 
                                        ? 'text-green-500' : carMetrics.tirePressure.rearLeft > 0 ? 'text-yellow-500' : 'text-gray-500'
                                    }`}>
                                      {carMetrics.tirePressure.rearLeft > 0 ? carMetrics.tirePressure.rearLeft : '--'}
                                    </div>
                                    <div className="text-xs text-gray-400 font-semibold">RL</div>
                                  </div>
                                  
                                  <div className="absolute bottom-1 right-1 bg-gray-800 p-1.5 rounded-lg text-center shadow-md">
                                    <div className={`font-bold text-lg ${
                                      carMetrics.tirePressure.rearRight > 33 && carMetrics.tirePressure.rearRight < 37 
                                        ? 'text-green-500' : carMetrics.tirePressure.rearRight > 0 ? 'text-yellow-500' : 'text-gray-500'
                                    }`}>
                                      {carMetrics.tirePressure.rearRight > 0 ? carMetrics.tirePressure.rearRight : '--'}
                                    </div>
                                    <div className="text-xs text-gray-400 font-semibold">RR</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Tire Data */}
                              <div className="space-y-2">
                                {carMetrics.tirePressure.frontLeft > 0 ? (
                                  <>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="bg-black/50 rounded p-2">
                                        <div className="text-xs text-gray-400">Avg Pressure</div>
                                        <div className="text-white text-lg font-medium">
                                          {Math.round((
                                            carMetrics.tirePressure.frontLeft + 
                                            carMetrics.tirePressure.frontRight + 
                                            carMetrics.tirePressure.rearLeft + 
                                            carMetrics.tirePressure.rearRight
                                          ) / 4)} PSI
                                        </div>
                                      </div>
                                      <div className="bg-black/50 rounded p-2">
                                        <div className="text-xs text-gray-400">Rec. Pressure</div>
                                        <div className="text-green-400 text-lg font-medium">35 PSI</div>
                                      </div>
                                    </div>
                                    <div className="bg-black/50 rounded p-2">
                                      <div className="text-xs text-gray-400">Last Checked</div>
                                      <div className="text-white">2 days ago</div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full">
                                    <p className="text-gray-400 text-sm">Connect to OBD2 or manually enter tire pressure data</p>
                                    <button className="mt-2 text-blue-400 text-sm underline">
                                      Enter Manually
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-400 text-sm">Maintenance Records</h3>
                          <Activity className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="text-white text-2xl font-bold">0</div>
                        <div className="text-gray-400 text-sm mt-2">No records added yet</div>
                      </div>
                      
                      <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-400 text-sm">Modifications</h3>
                          <Settings className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="text-white text-2xl font-bold">0</div>
                        <div className="text-gray-400 text-sm mt-2">No modifications recorded</div>
                      </div>
                      
                      <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-400 text-sm">Scheduled Services</h3>
                          <Calendar className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="text-white text-2xl font-bold">0</div>
                        <div className="text-gray-400 text-sm mt-2">No upcoming services</div>
                      </div>
                      
                      <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-400 text-sm">OBD2 Status</h3>
                          <Gauge className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="text-white text-2xl font-bold">Not Connected</div>
                        <button className="text-blue-400 text-sm mt-2 flex items-center">
                          <Plus className="h-3 w-3 mr-1" /> Connect Device
                        </button>
                      </div>
                    </div>
                    
                    {/* OBD Live Dashboard */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-blue-400 font-orbitron text-xl">OBD2 Telemetry</h2>
                        <button className="text-sm bg-blue-900/30 text-blue-400 py-1 px-3 rounded">
                          Connect Device
                        </button>
                      </div>
                      <OBDLiveDashboard />
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Telemetry View */}
            {activeSection === 'telemetry' && (
              <div className="telemetry-view">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                  <div>
                    <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Vehicle Telemetry</h2>
                    <p className="text-gray-400">
                      View real-time and historical performance data for {activeVehicle ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}` : 'your vehicle'}
                    </p>
                  </div>
                  
                  <div className="flex items-center mt-4 lg:mt-0 gap-3">
                    <button 
                      onClick={() => setExpandedTelemetry(!expandedTelemetry)}
                      className="apex-button-sm flex items-center"
                    >
                      {expandedTelemetry ? (
                        <>
                          <Maximize2 size={16} className="mr-2" />
                          Compact View
                        </>
                      ) : (
                        <>
                          <Maximize2 size={16} className="mr-2" />
                          Expanded View
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => window.open('/obd-connection', '_blank')}
                      className="apex-button-sm flex items-center"
                    >
                      <Gauge size={16} className="mr-2" />
                      OBD2 Connect
                    </button>
                  </div>
                </div>
                
                {/* Telemetry Dashboard */}
                <div className="grid grid-cols-1 gap-6">
                  {expandedTelemetry ? (
                    <EnhancedVehicleTelemetry vehicle={activeVehicle} />
                  ) : (
                    <VehicleTelemetry vehicle={activeVehicle} />
                  )}
                </div>
              </div>
            )}
            
            {/* Maintenance Records */}
            {activeSection === 'maintenance' && (
              <div className="maintenance-records-view">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                  <div>
                    <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Maintenance Records</h2>
                    <p className="text-gray-400">
                      Track service history, repairs, and preventative maintenance for your vehicle
                    </p>
                  </div>
                  
                  <div className="flex items-center mt-4 lg:mt-0 gap-3">
                    <button 
                      onClick={() => setShowAddMaintenanceForm(true)}
                      className="apex-button-sm flex items-center bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Record
                    </button>
                  </div>
                </div>
                
                <EmptyMaintenanceState />
              </div>
            )}
            
            {/* Modifications */}
            {activeSection === 'modifications' && (
              <div className="modifications-view">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                  <div>
                    <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Vehicle Modifications</h2>
                    <p className="text-gray-400">
                      Track all upgrades, performance parts, and customizations for your vehicle
                    </p>
                  </div>
                  
                  <div className="flex items-center mt-4 lg:mt-0 gap-3">
                    <button 
                      onClick={() => setShowAddModificationForm(true)}
                      className="apex-button-sm flex items-center bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Modification
                    </button>
                  </div>
                </div>
                
                <EmptyModificationState />
              </div>
            )}
            
            {/* JuiceBox Section */}
            {activeSection === 'juicebox' && activeVehicle && (
              <div className="juice-box-section">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                  <div>
                    <h2 className="text-blue-400 font-orbitron text-2xl mb-2">JuiceBox™ Checklists</h2>
                    <p className="text-gray-400">
                      The curated, real-world tested, gloss-backed, Gavin-approved detailing and maintenance checklists
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
            
            {/* Seasonal Checklist Section */}
            {activeSection === 'seasonal' && activeVehicle && (
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
                    onExport={(data: any) => {
                      if (data.format === 'pdf') {
                        const checklistElement = document.getElementById('seasonalChecklists');
                        if (checklistElement) {
                          exportToPdf(checklistElement, `GoTime Motorsports - ${data.checklist.name}.pdf`);
                        }
                      }
                    }}
                    onSave={(data: any) => {
                      console.log('Saving checklist data:', data);
                      // In a real implementation, this would save to Supabase
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Gloss Section */}
            {activeSection === 'gloss' && activeVehicle && (
              <div className="gloss-view">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-900 rounded-xl p-5 border border-blue-500/20 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-blue-400 font-orbitron text-lg">Gloss Index History</h3>
                      <div className="flex items-center">
                        <span className="text-gray-400 text-sm mr-3">Current: {carMetrics.glossIndex || 0}%</span>
                        <div className={`px-2 py-1 rounded text-xs ${
                          carMetrics.glossIndex > 80 ? 'bg-green-500/10 text-green-400' : 
                          carMetrics.glossIndex > 50 ? 'bg-yellow-500/10 text-yellow-400' : 
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {carMetrics.glossIndex > 80 ? 'Excellent' : 
                           carMetrics.glossIndex > 50 ? 'Good' : 
                           carMetrics.glossIndex > 0 ? 'Needs Attention' : 'Not Recorded'}
                        </div>
                      </div>
                    </div>
                    
                    {carMetrics.glossIndex > 0 ? (
                      <div className="h-64 bg-black/50 rounded-lg p-3 flex items-center justify-center">
                        <div className="text-gray-400 text-lg">Gloss History Graph (Data-Driven)</div>
                      </div>
                    ) : (
                      <div className="h-64 bg-black/50 rounded-lg p-3 flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-lg mb-2">No Gloss Measurements Recorded</div>
                        <p className="text-gray-500 text-sm text-center mb-4">Track your vehicle's gloss levels over time to maintain that showroom shine</p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                          Record First Measurement
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-5 border border-blue-500/20">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-4">Gloss Index Scanner</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Front Hood</span>
                          <span className="text-white font-medium">{carMetrics.glossIndex ? Math.round(carMetrics.glossIndex * 0.95) + '%' : '--'}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: carMetrics.glossIndex ? `${Math.round(carMetrics.glossIndex * 0.95)}%` : '0%' }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Driver Door</span>
                          <span className="text-white font-medium">{carMetrics.glossIndex ? Math.round(carMetrics.glossIndex * 1.05) + '%' : '--'}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: carMetrics.glossIndex ? `${Math.round(carMetrics.glossIndex * 1.05)}%` : '0%' }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Trunk</span>
                          <span className="text-white font-medium">{carMetrics.glossIndex ? Math.round(carMetrics.glossIndex * 0.9) + '%' : '--'}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: carMetrics.glossIndex ? `${Math.round(carMetrics.glossIndex * 0.9)}%` : '0%' }}></div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-md flex items-center justify-center">
                          <Camera className="h-4 w-4 mr-2" />
                          Scan Gloss Index
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-5 border border-blue-500/20">
                  <GlossTracker vehicle={activeVehicle} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add Vehicle Form Modal */}
      {showAddVehicleForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-blue-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl text-blue-400 font-orbitron">Add New Vehicle</h2>
              <button 
                onClick={() => setShowAddVehicleForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <AddVehicleForm onSubmit={handleAddVehicle} onCancel={() => setShowAddVehicleForm(false)} />
            </div>
          </div>
        </div>
      )}
      
      {/* Add Maintenance Form Modal */}
      {showAddMaintenanceForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-blue-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl text-blue-400 font-orbitron">Add Maintenance Record</h2>
              <button 
                onClick={() => setShowAddMaintenanceForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <AddMaintenanceForm 
                onSubmit={handleAddMaintenance} 
                onCancel={() => setShowAddMaintenanceForm(false)} 
                vehicleId={activeVehicle?.id || ''} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Add Modification Form Modal */}
      {showAddModificationForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-blue-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl text-blue-400 font-orbitron">Add Modification</h2>
              <button 
                onClick={() => setShowAddModificationForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <AddModificationForm 
                onSubmit={handleAddModification} 
                onCancel={() => setShowAddModificationForm(false)} 
                vehicleId={activeVehicle?.id || ''} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoTimeGarageVault;