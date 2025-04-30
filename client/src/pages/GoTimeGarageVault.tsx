import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import supabase from "../services/supabaseClient";
import { exportToPdf, exportToCsv, printElement } from "../utils/exportUtils";

// Component Imports
import VehicleTelemetry from "../components/VehicleTelemetry";
import EnhancedVehicleTelemetry from "../components/EnhancedVehicleTelemetry";
import VehicleGallery from "../components/VehicleGallery";
import GlossTracker from "../components/GlossTracker";
import JuiceBoxChecklists from "../components/JuiceBoxChecklists";
import SeasonalChecklists from "../components/SeasonalChecklists";
import AddVehicleForm from "../components/AddVehicleForm";
import AddModificationForm from "../components/AddModificationForm";
import AddMaintenanceForm from "../components/AddMaintenanceForm";
import EnhancedVehicleDetail from "../components/EnhancedVehicleDetail";
import OBDLiveDashboard from "../components/OBDLiveDashboard";

// Service Imports
import * as vehicleDataService from "../services/vehicleDataService";
import { searchImage } from "../services/unsplashService";

// Icon Imports
import { 
  Activity, BarChart2, Thermometer, FileDown, RefreshCw,
  Clock, Calendar, AlertTriangle, TrendingUp, 
  ChevronRight, ChevronDown, ChevronUp, Gauge, Info, Fuel, Battery, 
  Car, Upload, Maximize2, Zap, MapPin, Mountain, Filter, PlusCircle, 
  Wrench, Shield, Camera, Clipboard, MoreHorizontal, Eye, Trash2, Download, X, Plus,
  CloudSnow, Sun, Leaf, Settings, Printer, ExternalLink, Pencil, ThermometerSun
} from "lucide-react";

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
  image_url?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  status: 'Active' | 'Stored' | 'Sold' | 'Project';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Modification {
  id: string;
  vehicle_id: string;
  name: string;
  type: string;
  description?: string;
  brand?: string;
  model?: string;
  part_number?: string;
  installation_date?: string;
  installation_location?: string;
  cost?: number;
  installer?: string;
  warranty_expires?: string;
  status: 'Planned' | 'In Progress' | 'Installed' | 'Removed';
  affected_systems?: string[];
  image_url?: string;
  link_url?: string;
  link_label?: string;
  notes?: string;
  before_photos?: string[];
  after_photos?: string[];
  voice_notes?: string[];
  videos?: string[];
  documents?: any[];
  document_categories?: string[];
  receipt_included?: boolean;
  location?: {
    enabled: boolean;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  created_at: string;
  updated_at: string;
}

interface Maintenance {
  id: string;
  vehicle_id: string;
  type: string;
  title: string;
  description?: string;
  performed_by: string;
  date: string;
  mileage: number;
  cost: number;
  parts?: string[];
  status: 'Scheduled' | 'Completed' | 'Postponed';
  image_url?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface VehicleMetrics {
  mileage: number;
  fuelLevel: number;
  oilLevel: number;
  oilTemp: number;
  coolantTemp: number;
  batteryHealth: number;
  tirePressure: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  carStatus: 'Ready' | 'Service Due' | 'Requires Attention';
  lastService: string;
  nextService: string;
  nextOilChange: string;
  glossIndex: number;
  glossHistory: {
    date: string;
    value: number;
  }[];
  recentDrives: {
    date: string;
    distance: number;
    duration: string;
  }[];
}

// Main Component
const GoTimeGarageVault: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [activeView, setActiveView] = useState<string>('grid');
  const [expandedTelemetry, setExpandedTelemetry] = useState<boolean>(false);
  
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  
  const [vehicleMetrics, setVehicleMetrics] = useState<VehicleMetrics | null>(null);
  const [weatherData, setWeatherData] = useState(null);
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showAddModificationForm, setShowAddModificationForm] = useState(false);
  const [showAddMaintenanceForm, setShowAddMaintenanceForm] = useState(false);
  const [showOBDPanel, setShowOBDPanel] = useState(false);
  
  const [filters, setFilters] = useState({
    make: 'all',
    type: 'all',
    status: 'all'
  });
  
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Fetch user vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        
        // In a real app, fetch from API/Supabase
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setVehicles(data);
          setActiveVehicle(data[0]);
          
          // Fetch related data for the first vehicle
          fetchVehicleData(data[0].id);
        } else {
          // No vehicles added yet
          setVehicles([]);
          setActiveVehicle(null);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);
  
  // Fetch vehicle-specific data
  const fetchVehicleData = async (vehicleId: string) => {
    try {
      // Fetch modifications
      const { data: modsData, error: modsError } = await supabase
        .from('modifications')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('installation_date', { ascending: false });
        
      if (modsError) throw modsError;
      setModifications(modsData || []);
      
      // Fetch maintenance records
      const { data: maintData, error: maintError } = await supabase
        .from('maintenance')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });
        
      if (maintError) throw maintError;
      setMaintenanceRecords(maintData || []);
      
      // IMPORTANT: In a real app, fetch real vehicle metrics from OBD2 or user input
      // Leave fields blank if no data available to encourage user input
      // For demo, we'll create a placeholder structure to be filled with real data
      setVehicleMetrics({
        mileage: 0, // Will be filled from real data
        fuelLevel: 0,
        oilLevel: 0,
        oilTemp: 0,
        coolantTemp: 0,
        batteryHealth: 0,
        tirePressure: {
          frontLeft: 0,
          frontRight: 0,
          rearLeft: 0,
          rearRight: 0
        },
        carStatus: 'Ready',
        lastService: '',
        nextService: '',
        nextOilChange: '',
        glossIndex: 0,
        glossHistory: [],
        recentDrives: []
      });
      
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
  };
  
  // Handle click outside export menu
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
  }, [exportMenuRef]);
  
  // Export functions
  const handleExportToPDF = () => {
    if (!activeVehicle) return;
    
    const element = document.getElementById('vehicle-details');
    if (element) {
      exportToPdf(element, `GoTime_Garage_Vault_${activeVehicle.make}_${activeVehicle.model}.pdf`);
    }
    setShowExportMenu(false);
  };
  
  const handleExportToCSV = () => {
    if (!activeVehicle) return;
    
    // Transform vehicle data for CSV
    const csvData = [
      {
        VIN: activeVehicle.vin,
        Make: activeVehicle.make,
        Model: activeVehicle.model,
        Year: activeVehicle.year,
        Trim: activeVehicle.trim,
        Color: activeVehicle.color,
        Status: activeVehicle.status,
        'License Plate': activeVehicle.license_plate || 'N/A',
        'Purchase Date': activeVehicle.purchase_date || 'N/A',
        'Purchase Price': activeVehicle.purchase_price || 'N/A',
        'Current Value': activeVehicle.current_value || 'N/A',
        Notes: activeVehicle.notes || 'N/A'
      }
    ];
    
    exportToCsv(csvData, `GoTime_Garage_Vault_${activeVehicle.make}_${activeVehicle.model}.csv`);
    setShowExportMenu(false);
  };
  
  const handlePrint = () => {
    const element = document.getElementById('vehicle-details');
    if (element) {
      printElement(element);
    }
    setShowExportMenu(false);
  };
  
  // Handle form submissions
  const handleAddVehicle = async (vehicleData: any) => {
    try {
      // In real app, save to Supabase
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select();
        
      if (error) throw error;
      
      // Reload vehicles
      setVehicles([...(data || []), ...vehicles]);
      if (data && data.length > 0) {
        setActiveVehicle(data[0]);
      }
      
      setShowAddVehicleForm(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };
  
  const handleAddModification = async (modificationData: any) => {
    try {
      if (!activeVehicle) return;
      
      const newMod = {
        ...modificationData,
        vehicle_id: activeVehicle.id
      };
      
      // In real app, save to Supabase
      const { data, error } = await supabase
        .from('modifications')
        .insert([newMod])
        .select();
        
      if (error) throw error;
      
      // Update local state
      if (data) {
        setModifications([...(data || []), ...modifications]);
      }
      
      setShowAddModificationForm(false);
    } catch (error) {
      console.error('Error adding modification:', error);
    }
  };
  
  const handleAddMaintenance = async (maintenanceData: any) => {
    try {
      if (!activeVehicle) return;
      
      const newMaintenance = {
        ...maintenanceData,
        vehicle_id: activeVehicle.id
      };
      
      // In real app, save to Supabase
      const { data, error } = await supabase
        .from('maintenance')
        .insert([newMaintenance])
        .select();
        
      if (error) throw error;
      
      // Update local state
      if (data) {
        setMaintenanceRecords([...(data || []), ...maintenanceRecords]);
      }
      
      setShowAddMaintenanceForm(false);
    } catch (error) {
      console.error('Error adding maintenance record:', error);
    }
  };
  
  // Vehicle selector
  const renderVehicleSelector = () => {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
        <h3 className="text-blue-400 font-orbitron text-lg mb-4">Garage Inventory</h3>
        
        {vehicles.length > 0 ? (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => {
                  setActiveVehicle(vehicle);
                  fetchVehicleData(vehicle.id);
                }}
                className={`w-full flex items-center p-2 rounded-lg transition ${
                  activeVehicle?.id === vehicle.id 
                    ? 'bg-blue-900/30 border border-blue-500/40'
                    : 'hover:bg-gray-800 border border-gray-800'
                }`}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-md overflow-hidden flex-shrink-0 mr-3">
                  {vehicle.image_url ? (
                    <img 
                      src={vehicle.image_url} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="text-gray-600" size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                  <div className="text-gray-400 text-sm">{vehicle.trim}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 border border-dashed border-gray-700 rounded-lg">
            <Car className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-300 font-medium mb-2">No Vehicles Added</h3>
            <p className="text-gray-500 text-sm mb-4">Add your first vehicle to start tracking maintenance, modifications and more.</p>
            <button
              onClick={() => setShowAddVehicleForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vehicle
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Empty state components with attractive placeholders
  const EmptyVehicleState = () => (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="text-center max-w-md">
        <Car className="h-16 w-16 text-gray-600 mx-auto mb-6" />
        <h2 className="text-2xl font-orbitron text-blue-400 mb-4">Welcome to GoTime Garage Vault</h2>
        <p className="text-gray-400 mb-6">
          This is your command center for tracking your vehicle collection, maintenance history, modifications, and live telemetry.
        </p>
        <button
          onClick={() => setShowAddVehicleForm(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center mx-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Your First Vehicle
        </button>
      </div>
    </div>
  );
  
  const EmptyDashboardState = () => (
    <div className="h-full flex flex-col items-center justify-center bg-black/20 rounded-xl border border-dashed border-gray-800 p-8">
      <Gauge className="h-12 w-12 text-gray-600 mb-4" />
      <h3 className="text-xl text-gray-300 mb-2">Vehicle Data Unavailable</h3>
      <p className="text-gray-500 text-center max-w-md">
        Connect your vehicle with OBD2 or manually enter your vehicle's data to see real-time telemetry and stats.
      </p>
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setShowOBDPanel(true)}
          className="px-4 py-2 bg-blue-900/40 hover:bg-blue-900/60 text-white rounded-md border border-blue-800/40"
        >
          Connect OBD2
        </button>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md">
          Enter Data Manually
        </button>
      </div>
    </div>
  );
  
  const EmptyModificationsState = () => (
    <div className="h-full flex flex-col items-center justify-center bg-black/20 rounded-xl border border-dashed border-gray-800 p-8">
      <Wrench className="h-12 w-12 text-gray-600 mb-4" />
      <h3 className="text-xl text-gray-300 mb-2">No Modifications Recorded</h3>
      <p className="text-gray-500 text-center max-w-md">
        Track all your vehicle modifications, including performance parts, cosmetic upgrades, and accessories.
      </p>
      <button
        onClick={() => setShowAddModificationForm(true)}
        className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Modification
      </button>
    </div>
  );
  
  const EmptyMaintenanceState = () => (
    <div className="h-full flex flex-col items-center justify-center bg-black/20 rounded-xl border border-dashed border-gray-800 p-8">
      <Clipboard className="h-12 w-12 text-gray-600 mb-4" />
      <h3 className="text-xl text-gray-300 mb-2">No Maintenance Records</h3>
      <p className="text-gray-500 text-center max-w-md">
        Keep track of all maintenance performed on your vehicle, including oil changes, repairs, and service visits.
      </p>
      <button
        onClick={() => setShowAddMaintenanceForm(true)}
        className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Maintenance Record
      </button>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-black text-white">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto">
          {/* Header with F1-style Navigation Ribbon */}
          <div className="p-4 md:p-6 border-b border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-blue-400 font-orbitron text-2xl md:text-3xl">
                  GoTime Garage Vault
                </h2>
              </div>
              
              <div className="flex mt-4 md:mt-0 gap-3">
                <button 
                  onClick={() => setShowOBDPanel(!showOBDPanel)}
                  className="apex-button-sm flex items-center bg-blue-900/80 hover:bg-blue-800 border border-blue-700/50"
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
                    <div className="absolute right-0 mt-2 w-60 bg-gray-900 border border-green-500/40 rounded-md shadow-lg z-50">
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
            
            {/* F1-style Navigation Ribbon */}
            <div className="overflow-x-auto">
              <div className="inline-flex bg-gray-900/60 backdrop-blur-sm rounded-md p-1 border border-blue-900/30">
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
                <button 
                  onClick={() => setActiveSection('obd')}
                  className={`px-3 py-1.5 text-sm rounded transition-all duration-200 ${
                    activeSection === 'obd' 
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20' 
                      : 'text-white hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  OBD2 Live
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="p-4 md:p-6">
            {!vehicles.length ? (
              // Show empty state when no vehicles are added
              <EmptyVehicleState />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar - Vehicle Selector */}
                <div className="lg:col-span-1">
                  {renderVehicleSelector()}
                </div>
                
                {/* Main Content Area */}
                <div className="lg:col-span-3">
                  {/* Dashboard View */}
                  {activeSection === 'dashboard' && activeVehicle && (
                    <div className="dashboard-view">
                      {/* Current Vehicle Spotlight */}
                      <div className="vehicle-spotlight mb-8 bg-gray-900 rounded-xl overflow-hidden border border-blue-500/20 relative">
                        <div className="h-64 md:h-80 relative">
                          {activeVehicle.image_url ? (
                            <img 
                              src={activeVehicle.image_url}
                              alt={`${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <Car className="h-20 w-20 text-gray-700" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                          <div className="absolute bottom-0 left-0 p-6">
                            <div className="flex items-center mb-2">
                              <span className="inline-block w-3 h-3 rounded-full mr-2 bg-green-500"></span>
                              <span className="text-sm text-gray-300">Ready</span>
                            </div>
                            <h2 className="text-white font-orbitron text-2xl md:text-3xl">
                              {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                            </h2>
                            <p className="text-gray-300">{activeVehicle.trim} • {vehicleMetrics?.mileage || 'N/A'} miles</p>
                          </div>
                          <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full flex items-center">
                            <Clock className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-white text-sm">{new Date().toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Panels */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Vehicle Status */}
                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-blue-400 font-orbitron text-lg">Vehicle Status</h3>
                            <Clock className="h-5 w-5 text-gray-500" />
                          </div>
                          
                          {vehicleMetrics ? (
                            <div className="space-y-4">
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Last Service</div>
                                <div className="text-white font-medium">{vehicleMetrics.lastService || 'Not recorded'}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Next Service Due</div>
                                <div className="text-white font-medium">{vehicleMetrics.nextService || 'Not scheduled'}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Next Oil Change</div>
                                <div className="text-white font-medium">{vehicleMetrics.nextOilChange || 'Not scheduled'}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-500">No service data available</p>
                              <button className="mt-2 text-blue-400 text-sm">Add service record</button>
                            </div>
                          )}
                        </div>
                        
                        {/* F1-style Vehicle Vitals */}
                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-blue-400 font-orbitron text-lg">Vehicle Vitals</h3>
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Telemetry</span>
                          </div>
                          
                          {vehicleMetrics ? (
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center">
                                    <Fuel className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-gray-300 text-sm">Fuel Level</span>
                                  </div>
                                  <span className="text-white font-medium text-sm">{vehicleMetrics.fuelLevel || '0'}%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
                                  <div 
                                    className="h-full rounded-full bg-green-500"
                                    style={{ width: `${vehicleMetrics.fuelLevel || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center">
                                    <Battery className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-gray-300 text-sm">Battery Health</span>
                                  </div>
                                  <span className="text-white font-medium text-sm">{vehicleMetrics.batteryHealth || '0'}%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
                                  <div 
                                    className="h-full rounded-full bg-green-500"
                                    style={{ width: `${vehicleMetrics.batteryHealth || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-black/60 p-2.5 flex justify-between items-center">
                                  <div className="flex items-center">
                                    <ThermometerSun className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-gray-300 text-sm">Oil</span>
                                  </div>
                                  <span className="text-sm font-mono font-medium text-green-400">
                                    {vehicleMetrics.oilTemp || '0'}°F
                                  </span>
                                </div>
                                
                                <div className="rounded-lg bg-black/60 p-2.5 flex justify-between items-center">
                                  <div className="flex items-center">
                                    <ThermometerSun className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-gray-300 text-sm">Coolant</span>
                                  </div>
                                  <span className="text-sm font-mono font-medium text-green-400">
                                    {vehicleMetrics.coolantTemp || '0'}°F
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-500">No vital data recorded</p>
                              <button 
                                onClick={() => setShowOBDPanel(true)}
                                className="mt-2 text-blue-400 text-sm"
                              >
                                Connect OBD2
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Tire Pressure - F1-style Layout */}
                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-blue-400 font-orbitron text-lg">Tire Pressure</h3>
                          </div>
                          
                          {vehicleMetrics?.tirePressure ? (
                            <div className="relative w-full h-32 mb-2">
                              <div className="absolute inset-0 border border-gray-700 rounded-lg"></div>
                              
                              {/* Car outline */}
                              <div className="absolute inset-x-10 inset-y-6 bg-gray-800/70 rounded"></div>
                              
                              {/* Tire indicators */}
                              <div className="absolute top-1 left-1 bg-gray-800 p-1.5 rounded-lg text-center shadow-md">
                                <div className="font-bold text-lg text-green-500">
                                  {vehicleMetrics.tirePressure.frontLeft || '0'}
                                </div>
                                <div className="text-xs text-gray-400 font-semibold">FL</div>
                              </div>
                              
                              <div className="absolute top-1 right-1 bg-gray-800 p-1.5 rounded-lg text-center shadow-md">
                                <div className="font-bold text-lg text-green-500">
                                  {vehicleMetrics.tirePressure.frontRight || '0'}
                                </div>
                                <div className="text-xs text-gray-400 font-semibold">FR</div>
                              </div>
                              
                              <div className="absolute bottom-1 left-1 bg-gray-800 p-1.5 rounded-lg text-center shadow-md">
                                <div className="font-bold text-lg text-green-500">
                                  {vehicleMetrics.tirePressure.rearLeft || '0'}
                                </div>
                                <div className="text-xs text-gray-400 font-semibold">RL</div>
                              </div>
                              
                              <div className="absolute bottom-1 right-1 bg-gray-800 p-1.5 rounded-lg text-center shadow-md">
                                <div className="font-bold text-lg text-green-500">
                                  {vehicleMetrics.tirePressure.rearRight || '0'}
                                </div>
                                <div className="text-xs text-gray-400 font-semibold">RR</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-500">No tire pressure data</p>
                              <button className="mt-2 text-blue-400 text-sm">Enter tire pressure</button>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 text-center mt-2">PSI readings from your last check</div>
                        </div>
                      </div>
                      
                      {/* Recent Activity and Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Modifications */}
                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-blue-400 font-orbitron text-lg">Recent Modifications</h3>
                            <button 
                              onClick={() => setActiveSection('modifications')}
                              className="text-gray-400 hover:text-white text-sm flex items-center"
                            >
                              View All <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                          </div>
                          
                          {modifications.length > 0 ? (
                            <div className="space-y-3">
                              {modifications.slice(0, 3).map((mod) => (
                                <div key={mod.id} className="flex items-center p-2 bg-black/40 rounded-lg">
                                  <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center mr-3">
                                    <Wrench className="h-5 w-5 text-green-500" />
                                  </div>
                                  <div>
                                    <div className="text-white">{mod.name}</div>
                                    <div className="text-gray-400 text-sm">{mod.installation_date || 'Date not recorded'}</div>
                                  </div>
                                </div>
                              ))}
                              
                              <button
                                onClick={() => setShowAddModificationForm(true)}
                                className="w-full mt-2 py-2 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white flex items-center justify-center"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Modification
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <Wrench className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                              <p className="text-gray-500 mb-3">No modifications recorded</p>
                              <button
                                onClick={() => setShowAddModificationForm(true)}
                                className="px-4 py-2 bg-blue-900/40 hover:bg-blue-900/60 text-white rounded-md border border-blue-800/40"
                              >
                                Add Your First Mod
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Recent Maintenance */}
                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-blue-400 font-orbitron text-lg">Recent Maintenance</h3>
                            <button 
                              onClick={() => setActiveSection('maintenance')}
                              className="text-gray-400 hover:text-white text-sm flex items-center"
                            >
                              View All <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                          </div>
                          
                          {maintenanceRecords.length > 0 ? (
                            <div className="space-y-3">
                              {maintenanceRecords.slice(0, 3).map((maintenance) => (
                                <div key={maintenance.id} className="flex items-center p-2 bg-black/40 rounded-lg">
                                  <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center mr-3">
                                    <Clipboard className="h-5 w-5 text-green-500" />
                                  </div>
                                  <div>
                                    <div className="text-white">{maintenance.title}</div>
                                    <div className="text-gray-400 text-sm">{maintenance.date || 'Date not recorded'}</div>
                                  </div>
                                </div>
                              ))}
                              
                              <button
                                onClick={() => setShowAddMaintenanceForm(true)}
                                className="w-full mt-2 py-2 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white flex items-center justify-center"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Maintenance Record
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <Clipboard className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                              <p className="text-gray-500 mb-3">No maintenance records</p>
                              <button
                                onClick={() => setShowAddMaintenanceForm(true)}
                                className="px-4 py-2 bg-blue-900/40 hover:bg-blue-900/60 text-white rounded-md border border-blue-800/40"
                              >
                                Add Maintenance Record
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Modifications Section */}
                  {activeSection === 'modifications' && activeVehicle && (
                    <div className="modifications-section">
                      <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                        <div>
                          <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Vehicle Modifications</h2>
                          <p className="text-gray-400">
                            Track performance upgrades, cosmetic changes, and accessories for your {activeVehicle.make} {activeVehicle.model}
                          </p>
                        </div>
                        
                        <div className="flex items-center mt-4 lg:mt-0 gap-3">
                          <button 
                            onClick={() => setShowAddModificationForm(true)}
                            className="apex-button-sm flex items-center bg-green-600 hover:bg-green-700"
                          >
                            <Plus size={16} className="mr-2" />
                            Add Modification
                          </button>
                        </div>
                      </div>
                      
                      {modifications.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {modifications.map((mod) => (
                            <div key={mod.id} className="bg-gray-900 rounded-xl overflow-hidden border border-blue-500/20">
                              <div className="h-40 bg-gray-800 relative">
                                {mod.image_url ? (
                                  <img 
                                    src={mod.image_url} 
                                    alt={mod.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Wrench className="h-16 w-16 text-gray-700" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                  {mod.status}
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="text-lg font-bold text-white mb-1">{mod.name}</h3>
                                <p className="text-sm text-gray-400 mb-3">{mod.brand} {mod.model}</p>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-400">{mod.installation_date || 'No date'}</span>
                                  <span className="text-green-400">${mod.cost || '0'}</span>
                                </div>
                                <p className="mt-3 text-sm text-gray-300">{mod.description?.substring(0, 100) || 'No description provided'}...</p>
                                
                                <div className="mt-4 flex justify-between">
                                  <button className="text-blue-400 text-sm hover:text-blue-300">View Details</button>
                                  <div className="flex gap-2">
                                    <button className="p-1.5 bg-gray-800 rounded-full">
                                      <Pencil className="h-4 w-4 text-gray-400" />
                                    </button>
                                    <button className="p-1.5 bg-gray-800 rounded-full">
                                      <Trash2 className="h-4 w-4 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <button
                            onClick={() => setShowAddModificationForm(true)}
                            className="bg-black/20 rounded-xl border border-dashed border-gray-700 flex flex-col items-center justify-center p-6 h-full min-h-[300px]"
                          >
                            <div className="w-16 h-16 rounded-full bg-gray-900/60 flex items-center justify-center mb-4">
                              <Plus className="h-8 w-8 text-green-500" />
                            </div>
                            <p className="text-gray-300 font-medium mb-1">Add New Modification</p>
                            <p className="text-gray-500 text-sm text-center">
                              Track a new performance upgrade, cosmetic change, or accessory
                            </p>
                          </button>
                        </div>
                      ) : (
                        <EmptyModificationsState />
                      )}
                    </div>
                  )}
                  
                  {/* Maintenance Section */}
                  {activeSection === 'maintenance' && activeVehicle && (
                    <div className="maintenance-section">
                      <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                        <div>
                          <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Maintenance Records</h2>
                          <p className="text-gray-400">
                            Track service history, repairs, and regular maintenance for your {activeVehicle.make} {activeVehicle.model}
                          </p>
                        </div>
                        
                        <div className="flex items-center mt-4 lg:mt-0 gap-3">
                          <button 
                            onClick={() => setShowAddMaintenanceForm(true)}
                            className="apex-button-sm flex items-center bg-green-600 hover:bg-green-700"
                          >
                            <Plus size={16} className="mr-2" />
                            Add Maintenance
                          </button>
                        </div>
                      </div>
                      
                      {maintenanceRecords.length > 0 ? (
                        <div className="bg-black rounded-xl border border-blue-500/20 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-900 text-left">
                                  <th className="px-4 py-3 text-sm font-medium text-gray-300">Date</th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-300">Service</th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-300">Mileage</th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-300">Performed By</th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-300">Cost</th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-300">Status</th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-300">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                {maintenanceRecords.map((record) => (
                                  <tr key={record.id} className="hover:bg-gray-900/50">
                                    <td className="px-4 py-3 text-sm text-white">{record.date}</td>
                                    <td className="px-4 py-3">
                                      <div className="text-white">{record.title}</div>
                                      <div className="text-xs text-gray-400">{record.type}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white">{record.mileage} mi</td>
                                    <td className="px-4 py-3 text-sm text-white">{record.performed_by}</td>
                                    <td className="px-4 py-3 text-sm text-green-400">${record.cost}</td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        record.status === 'Completed' ? 'bg-green-900/30 text-green-400' :
                                        record.status === 'Scheduled' ? 'bg-blue-900/30 text-blue-400' :
                                        'bg-yellow-900/30 text-yellow-400'
                                      }`}>
                                        {record.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <button className="p-1.5 bg-gray-800 rounded-full">
                                          <Eye className="h-4 w-4 text-gray-400" />
                                        </button>
                                        <button className="p-1.5 bg-gray-800 rounded-full">
                                          <Pencil className="h-4 w-4 text-gray-400" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <EmptyMaintenanceState />
                      )}
                    </div>
                  )}
                  
                  {/* OBD2 Live Section */}
                  {activeSection === 'obd' && (
                    <div className="obd-live-section">
                      <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                        <div>
                          <h2 className="text-blue-400 font-orbitron text-2xl mb-2">OBD2 Live Connect</h2>
                          <p className="text-gray-400">
                            Monitor real-time vehicle data using your OBD2 adapter via Bluetooth
                          </p>
                        </div>
                      </div>
                      
                      <OBDLiveDashboard />
                    </div>
                  )}
                  
                  {/* Add placeholders for other sections */}
                  {activeSection === 'telemetry' && activeVehicle && (
                    <VehicleTelemetry vehicleId={activeVehicle.id} />
                  )}
                  
                  {activeSection === 'garage' && activeVehicle && (
                    <div className="garage-section">
                      <EnhancedVehicleDetail vehicle={activeVehicle} />
                    </div>
                  )}
                  
                  {activeSection === 'juicebox' && activeVehicle && (
                    <div className="juice-box-section">
                      <div className="mb-6">
                        <h2 className="text-blue-400 font-orbitron text-2xl mb-2">JuiceBox™ Checklists</h2>
                        <p className="text-gray-400">
                          The curated, real-world tested, gloss-backed, Gavin-approved detailing and maintenance checklists
                        </p>
                      </div>
                      <JuiceBoxChecklists vehicle={activeVehicle} />
                    </div>
                  )}
                  
                  {activeSection === 'seasonal' && activeVehicle && (
                    <div className="seasonal-checklists-section">
                      <div className="mb-6">
                        <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Seasonal Maintenance</h2>
                        <p className="text-gray-400">
                          Season-specific maintenance checklists customized to your climate and vehicle needs
                        </p>
                      </div>
                      <SeasonalChecklists vehicle={activeVehicle} onSave={() => {}} onExport={() => {}} />
                    </div>
                  )}
                  
                  {activeSection === 'gloss' && activeVehicle && (
                    <div className="gloss-section">
                      <div className="mb-6">
                        <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Gloss Tracker</h2>
                        <p className="text-gray-400">
                          Monitor and maintain your vehicle's finish quality over time
                        </p>
                      </div>
                      <GlossTracker vehicle={activeVehicle} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Add Vehicle Form Modal */}
          {showAddVehicleForm && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
              <div className="bg-gray-900 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-blue-500/30 shadow-lg">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-blue-400 font-orbitron text-xl">Add New Vehicle</h2>
                  <button onClick={() => setShowAddVehicleForm(false)} className="text-gray-500 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <AddVehicleForm 
                    onSubmit={handleAddVehicle} 
                    onCancel={() => setShowAddVehicleForm(false)} 
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Add Modification Form Modal */}
          {showAddModificationForm && activeVehicle && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
              <div className="bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-blue-500/30 shadow-lg">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-blue-400 font-orbitron text-xl">Add Modification</h2>
                  <button onClick={() => setShowAddModificationForm(false)} className="text-gray-500 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <AddModificationForm 
                    onSubmit={handleAddModification} 
                    onCancel={() => setShowAddModificationForm(false)}
                    vehicleId={activeVehicle.id}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Add Maintenance Form Modal */}
          {showAddMaintenanceForm && activeVehicle && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
              <div className="bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-blue-500/30 shadow-lg">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-blue-400 font-orbitron text-xl">Add Maintenance Record</h2>
                  <button onClick={() => setShowAddMaintenanceForm(false)} className="text-gray-500 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <AddMaintenanceForm 
                    onSubmit={handleAddMaintenance} 
                    onCancel={() => setShowAddMaintenanceForm(false)}
                    vehicleId={activeVehicle.id}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* OBD2 Panel */}
          {showOBDPanel && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
              <div className="bg-gray-900 w-full max-w-3xl rounded-xl border border-blue-500/30 shadow-lg">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-blue-400 font-orbitron text-xl">OBD2 Connection</h2>
                  <button onClick={() => setShowOBDPanel(false)} className="text-gray-500 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <OBDLiveDashboard />
                </div>
                
                <div className="p-4 border-t border-gray-800 flex justify-end">
                  <button 
                    onClick={() => setShowOBDPanel(false)} 
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoTimeGarageVault;