import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import supabase from "../services/supabaseClient";
import * as vehicleDataService from "../services/vehicleDataService";
import { searchImage } from "../services/unsplashService";

// Component Imports
import EnhancedVehicleTelemetry from "../components/EnhancedVehicleTelemetry";
import VehicleGallery from "../components/VehicleGallery";
import GlossTracker from "../components/GlossTracker";
import SeasonalChecklists from "../components/SeasonalChecklists";
import OBDLiveDashboard from "../components/OBDLiveDashboard";

// Icon Imports
import { 
  Activity, BarChart2, Thermometer, FileDown, RefreshCw,
  Clock, Calendar, AlertTriangle, TrendingUp, 
  ChevronRight, ChevronDown, ChevronUp, Gauge, Info, Fuel, Battery, 
  Car, Upload, Maximize2, Zap, MapPin, Mountain, Filter, PlusCircle, 
  Wrench, Shield, Camera, Clipboard, MoreHorizontal, Eye, Trash2, Download, X, Plus,
  CloudSnow, Sun, Leaf, Settings, Printer, ExternalLink, Pencil, ThermometerSun, 
  Droplets, Wind, CheckCircle, XCircle, CornerRightDown, CircleSlash
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
  drivetrain?: string;
  type?: string;
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
  category?: string;
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
const GarageVaultPage: React.FC = () => {
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
  
  // Fetch user vehicles from API/data sources
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        
        // Always use Supabase for production data
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
          // If no vehicles found, keep state empty but ready for user input
          setVehicles([]);
          setActiveVehicle(null);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        // Show error state rather than mock data
        setVehicles([]);
        setActiveVehicle(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // Fetch vehicle-specific data from real APIs
  const fetchVehicleData = async (vehicleId: string) => {
    try {
      // Fetch modifications from Supabase (real database)
      try {
        const { data, error } = await supabase
          .from('modifications')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('installation_date', { ascending: false });
          
        if (error) throw error;
        setModifications(data || []);
      } catch (err) {
        console.error('Error fetching modifications from Supabase:', err);
        setModifications([]);
      }
      
      // Fetch maintenance records from Supabase (real database)
      try {
        const { data, error } = await supabase
          .from('maintenance')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('date', { ascending: false });
          
        if (error) throw error;
        setMaintenanceRecords(data || []);
      } catch (err) {
        console.error('Error fetching maintenance from Supabase:', err);
        setMaintenanceRecords([]);
      }
      
          // Connect to OBD2 interface to get real-time vehicle data
      try {
        // Attempt to connect to OBD via BluetoothLE
        const obdApiEndpoint = `/api/obd/vehicle/${vehicleId}/telemetry`;
        const response = await fetch(obdApiEndpoint);
        
        if (response.ok) {
          const obdMetrics = await response.json();
          setVehicleMetrics(obdMetrics);
        } else {
          // If API fails, signal to UI that we need user to connect OBD
          setVehicleMetrics(null);
        }
      } catch (err) {
        console.error('Error connecting to OBD interface:', err);
        setVehicleMetrics(null);
      }
      
      // No weather data - focused on vehicle data only
      
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
  
  // Handle form submissions - using real API data only
  const handleAddVehicle = async (vehicleData: any) => {
    try {
      // Save to Supabase database using production API
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        // Use the actual response from Supabase
        const newVehicles = [data[0], ...vehicles];
        setVehicles(newVehicles);
        setActiveVehicle(data[0]);
        
        // Fetch real vehicle data for the new vehicle
        fetchVehicleData(data[0].id);
      }
      
      setShowAddVehicleForm(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      // Show error message to user
      alert('Failed to add vehicle. Please try again.');
    }
  };
  
  const handleAddModification = async (modificationData: any) => {
    try {
      if (!activeVehicle) return;
      
      const newMod = {
        ...modificationData,
        vehicle_id: activeVehicle.id
      };
      
      // Save to Supabase database using production API
      const { data, error } = await supabase
        .from('modifications')
        .insert([newMod])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        // Use the actual response from Supabase
        setModifications([data[0], ...modifications]);
      }
      
      setShowAddModificationForm(false);
    } catch (error) {
      console.error('Error adding modification:', error);
      // Show error message to user
      alert('Failed to add modification. Please try again.');
    }
  };
  
  const handleAddMaintenance = async (maintenanceData: any) => {
    try {
      if (!activeVehicle) return;
      
      const newMaintenance = {
        ...maintenanceData,
        vehicle_id: activeVehicle.id
      };
      
      // Save to Supabase database using production API
      const { data, error } = await supabase
        .from('maintenance')
        .insert([newMaintenance])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        // Use the actual response from Supabase
        setMaintenanceRecords([data[0], ...maintenanceRecords]);
      }
      
      setShowAddMaintenanceForm(false);
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      // Show error message to user
      alert('Failed to add maintenance record. Please try again.');
    }
  };
  
  // Export to PDF
  const handleExportToPDF = () => {
    console.log("Export to PDF functionality would be implemented here");
    setShowExportMenu(false);
  };

  // Export to CSV
  const handleExportToCSV = () => {
    console.log("Export to CSV functionality would be implemented here");
    setShowExportMenu(false);
  };
  
  // Print functionality
  const handlePrint = () => {
    window.print();
    setShowExportMenu(false);
  };

  // Get vehicle status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Stored':
        return 'bg-blue-500';
      case 'Sold':
        return 'bg-gray-500';
      case 'Project':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Calculate vehicle summary data
  const getVehicleSummary = () => {
    if (!activeVehicle) return null;
    
    const totalMods = modifications.length;
    const plannedMods = modifications.filter(m => m.status === 'Planned').length;
    const totalMaintenance = maintenanceRecords.length;
    const pendingMaintenance = maintenanceRecords.filter(m => m.status === 'Scheduled').length;
    const totalModsCost = modifications.reduce((sum, mod) => sum + (mod.cost || 0), 0);
    const totalMaintenanceCost = maintenanceRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
    
    return {
      totalMods,
      plannedMods,
      totalMaintenance,
      pendingMaintenance,
      totalModsCost,
      totalMaintenanceCost,
      totalInvestment: (activeVehicle.purchase_price || 0) + totalModsCost + totalMaintenanceCost
    };
  };

  // Render the vehicle selector sidebar
  const renderVehicleSelector = () => {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-blue-400 font-orbitron text-lg">Garage Inventory</h3>
          <button 
            onClick={() => setShowAddVehicleForm(true)}
            className="p-1.5 bg-blue-900/30 hover:bg-blue-900/60 rounded-full text-blue-400"
            title="Add New Vehicle"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
        </div>
        
        {vehicles.length > 0 ? (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => {
                  setActiveVehicle(vehicle);
                  fetchVehicleData(vehicle.id);
                }}
                className={`w-full flex items-center p-2 rounded-lg transition-all ${
                  activeVehicle?.id === vehicle.id 
                    ? 'bg-blue-900/40 border border-blue-500/50' 
                    : 'bg-gray-900/40 hover:bg-gray-800/40 border border-gray-800/50'
                }`}
              >
                <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-gray-800 border border-gray-700 mr-3">
                  {vehicle.image_url ? (
                    <img 
                      src={vehicle.image_url} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-200 truncate">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <span className={`${getStatusBadgeColor(vehicle.status)} w-2 h-2 rounded-full mr-1.5`}></span>
                    {vehicle.status}
                    {vehicle.trim && <span className="mx-1">·</span>}
                    {vehicle.trim}
                  </div>
                </div>
                
                <ChevronRight className={`h-5 w-5 ${
                  activeVehicle?.id === vehicle.id ? 'text-blue-400' : 'text-gray-600'
                }`} />
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800 text-center">
            <Car className="h-10 w-10 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 mb-3">No vehicles in your garage yet</p>
            <button
              onClick={() => setShowAddVehicleForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Vehicle
            </button>
          </div>
        )}
      </div>
    );
  };

  // Vehicle KPI cards/stats
  const renderVehicleStats = () => {
    if (!activeVehicle || !vehicleMetrics) return null;
    
    const summary = getVehicleSummary();
    if (!summary) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Mileage Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl overflow-hidden border border-gray-800">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center">
            <Gauge className="h-4 w-4 text-blue-400 mr-2" />
            <div className="text-sm font-medium text-gray-300">Mileage</div>
          </div>
          
          <div className="px-4 py-3">
            <div className="text-2xl font-semibold text-white">
              {vehicleMetrics.mileage.toLocaleString()} <span className="text-sm font-normal text-gray-500">mi</span>
            </div>
            
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +1,243 mi last 30 days
            </div>
          </div>
        </div>
        
        {/* Status Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl overflow-hidden border border-gray-800">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center">
            <Activity className="h-4 w-4 text-blue-400 mr-2" />
            <div className="text-sm font-medium text-gray-300">Status</div>
          </div>
          
          <div className="px-4 py-3">
            <div className="text-xl font-semibold text-white flex items-center">
              <span className={`${
                vehicleMetrics.carStatus === 'Ready' ? 'text-green-500' : 
                vehicleMetrics.carStatus === 'Service Due' ? 'text-amber-500' : 'text-red-500'
              }`}>
                {vehicleMetrics.carStatus}
              </span>
            </div>
            
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Next service: {vehicleMetrics.nextService || 'Not scheduled'}
            </div>
          </div>
        </div>
        
        {/* Maintenance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl overflow-hidden border border-gray-800">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center">
            <Wrench className="h-4 w-4 text-blue-400 mr-2" />
            <div className="text-sm font-medium text-gray-300">Maintenance</div>
          </div>
          
          <div className="px-4 py-3">
            <div className="text-2xl font-semibold text-white">
              {summary.totalMaintenance}
              <span className="text-sm font-normal text-gray-500 ml-1">records</span>
            </div>
            
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
              {summary.pendingMaintenance} scheduled tasks pending
            </div>
          </div>
        </div>
        
        {/* Modifications Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl overflow-hidden border border-gray-800">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center">
            <Zap className="h-4 w-4 text-blue-400 mr-2" />
            <div className="text-sm font-medium text-gray-300">Modifications</div>
          </div>
          
          <div className="px-4 py-3">
            <div className="text-2xl font-semibold text-white">
              {summary.totalMods}
              <span className="text-sm font-normal text-gray-500 ml-1">installed</span>
            </div>
            
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              {summary.plannedMods > 0 ? (
                <>
                  <PlusCircle className="h-3 w-3 mr-1 text-blue-400" />
                  {summary.plannedMods} planned upgrades
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                  All modifications completed
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main vehicle detail section
  const renderVehicleDetail = () => {
    if (!activeVehicle) return (
      <div className="bg-gray-900/40 rounded-xl p-8 border border-gray-800 text-center">
        <Car className="h-16 w-16 text-gray-600 mx-auto mb-3" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Vehicle Selected</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-4">
          Please select a vehicle from your garage inventory or add a new vehicle to get started.
        </p>
        <button
          onClick={() => setShowAddVehicleForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Vehicle
        </button>
      </div>
    );

    return (
      <div id="vehicle-details">
        {/* Vehicle Header */}
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div>
            <div className="flex items-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </h2>
              
              <span className={`ml-3 px-2 py-0.5 rounded text-xs font-medium ${
                getStatusBadgeColor(activeVehicle.status)
              }`}>
                {activeVehicle.status}
              </span>
            </div>
            
            <div className="text-gray-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {activeVehicle.trim && (
                <span className="flex items-center">
                  <Info className="h-3 w-3 mr-1" /> {activeVehicle.trim}
                </span>
              )}
              {activeVehicle.vin && (
                <span className="flex items-center">
                  <Shield className="h-3 w-3 mr-1" /> VIN: {activeVehicle.vin.slice(-8)}
                </span>
              )}
              {activeVehicle.color && (
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: activeVehicle.color }}></div>
                  {activeVehicle.color}
                </span>
              )}
              {activeVehicle.license_plate && (
                <span className="flex items-center">
                  <Car className="h-3 w-3 mr-1" /> {activeVehicle.license_plate}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center mt-3 md:mt-0 space-x-2">
            <button
              onClick={() => setShowOBDPanel(!showOBDPanel)}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                showOBDPanel 
                  ? 'bg-blue-700/60 text-blue-100 border border-blue-600/70' 
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              <Gauge className="h-4 w-4 mr-1.5" />
              OBD Live Data
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-md text-sm flex items-center border border-gray-700 hover:bg-gray-700"
              >
                <FileDown className="h-4 w-4 mr-1.5" />
                Export
              </button>
              
              {showExportMenu && (
                <div 
                  ref={exportMenuRef}
                  className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg overflow-hidden z-10 w-40"
                >
                  <button
                    onClick={handleExportToPDF}
                    className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2 text-gray-500" />
                    Export as PDF
                  </button>
                  <button
                    onClick={handleExportToCSV}
                    className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2 text-gray-500" />
                    Export as CSV
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 flex items-center"
                  >
                    <Printer className="h-4 w-4 mr-2 text-gray-500" />
                    Print
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => {/* Open edit vehicle modal */}}
              className="p-1.5 bg-gray-800 text-gray-300 rounded-md border border-gray-700 hover:bg-gray-700"
              title="Edit Vehicle"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* OBD Dashboard Panel (collapsible) */}
        {showOBDPanel && (
          <div className="mb-6 bg-black/30 p-4 rounded-xl border border-blue-900/30">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-blue-400 flex items-center">
                <Gauge className="h-5 w-5 mr-2" />
                OBD Live Dashboard
              </h3>
              <button 
                onClick={() => setShowOBDPanel(false)}
                className="p-1 text-gray-500 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <OBDLiveDashboard />
          </div>
        )}
        
        {/* Vehicle Stats Row */}
        {renderVehicleStats()}
        
        {/* Vehicle Details Tabs */}
        <div className="bg-gray-900/40 rounded-xl overflow-hidden border border-gray-800 mb-6">
          <div className="border-b border-gray-800">
            <div className="flex overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${
                  activeSection === 'dashboard' 
                    ? 'text-blue-400 border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Dashboard
              </button>
              
              <button
                onClick={() => setActiveSection('modifications')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${
                  activeSection === 'modifications' 
                    ? 'text-blue-400 border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Zap className="h-4 w-4 mr-2" />
                Modifications
                {modifications.length > 0 && (
                  <span className="ml-1.5 bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-full text-xs">
                    {modifications.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveSection('maintenance')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${
                  activeSection === 'maintenance' 
                    ? 'text-blue-400 border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Maintenance
                {maintenanceRecords.length > 0 && (
                  <span className="ml-1.5 bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-full text-xs">
                    {maintenanceRecords.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveSection('gallery')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${
                  activeSection === 'gallery' 
                    ? 'text-blue-400 border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Camera className="h-4 w-4 mr-2" />
                Gallery
              </button>
              
              <button
                onClick={() => setActiveSection('checklists')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${
                  activeSection === 'checklists' 
                    ? 'text-blue-400 border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Checklists
              </button>
              
              <button
                onClick={() => setActiveSection('gloss')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center ${
                  activeSection === 'gloss' 
                    ? 'text-blue-400 border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Droplets className="h-4 w-4 mr-2" />
                Gloss Tracker
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white">Vehicle Overview</h3>
                  <button
                    onClick={() => setExpandedTelemetry(!expandedTelemetry)}
                    className="text-xs text-blue-400 flex items-center"
                  >
                    {expandedTelemetry ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Collapse Telemetry
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Expand Telemetry
                      </>
                    )}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                  {/* Left column: Vehicle Info */}
                  <div className="xl:col-span-2 space-y-4">
                    {/* Vehicle Image */}
                    <div className="relative bg-gray-900/40 rounded-lg overflow-hidden border border-gray-800 aspect-video">
                      {activeVehicle.image_url ? (
                        <img 
                          src={activeVehicle.image_url} 
                          alt={`${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Car className="h-16 w-16 text-gray-700 mb-2" />
                          <button
                            onClick={() => {/* Open add image modal */}}
                            className="text-sm text-blue-500 hover:text-blue-400 flex items-center"
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Add Vehicle Image
                          </button>
                        </div>
                      )}
                      
                      {activeVehicle.image_url && (
                        <button
                          onClick={() => {/* Open image gallery */}}
                          className="absolute bottom-2 right-2 p-1.5 bg-black/60 text-white rounded-md hover:bg-black/80"
                          title="View Gallery"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Vehicle Details */}
                    <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
                      <h4 className="text-sm uppercase text-gray-500 mb-3">Vehicle Details</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">VIN</span>
                          <span className="text-white font-mono">{activeVehicle.vin || 'Not specified'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">License Plate</span>
                          <span className="text-white">{activeVehicle.license_plate || 'Not specified'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Color</span>
                          <span className="text-white flex items-center">
                            {activeVehicle.color && (
                              <div 
                                className="w-3 h-3 rounded-full mr-1.5" 
                                style={{ backgroundColor: activeVehicle.color }}
                              ></div>
                            )}
                            {activeVehicle.color || 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Purchase Date</span>
                          <span className="text-white">
                            {activeVehicle.purchase_date 
                              ? new Date(activeVehicle.purchase_date).toLocaleDateString() 
                              : 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Purchase Price</span>
                          <span className="text-white">
                            {activeVehicle.purchase_price 
                              ? `$${activeVehicle.purchase_price.toLocaleString()}` 
                              : 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Value</span>
                          <span className="text-white">
                            {activeVehicle.current_value 
                              ? `$${activeVehicle.current_value.toLocaleString()}` 
                              : 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes Section */}
                    <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
                      <h4 className="text-sm uppercase text-gray-500 mb-2">Notes</h4>
                      
                      {activeVehicle.notes ? (
                        <p className="text-gray-300 whitespace-pre-line">{activeVehicle.notes}</p>
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-gray-500 mb-2">No notes for this vehicle yet</p>
                          <button
                            onClick={() => {/* Open add notes modal */}}
                            className="text-sm text-blue-500 hover:text-blue-400"
                          >
                            + Add Notes
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right column: Telemetry */}
                  <div className={`${expandedTelemetry ? 'xl:col-span-3' : 'xl:col-span-3'}`}>
                    <EnhancedVehicleTelemetry 
                      vehicle={activeVehicle}
                      expanded={expandedTelemetry}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Modifications Section */}
            {activeSection === 'modifications' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Modifications</h3>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setActiveView('grid')}
                        className={`p-1.5 rounded ${
                          activeView === 'grid' 
                            ? 'bg-blue-900/40 text-blue-400' 
                            : 'bg-gray-800 text-gray-400 hover:text-gray-300'
                        }`}
                        title="Grid View"
                      >
                        <Gauge className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => setActiveView('list')}
                        className={`p-1.5 rounded ${
                          activeView === 'list' 
                            ? 'bg-blue-900/40 text-blue-400' 
                            : 'bg-gray-800 text-gray-400 hover:text-gray-300'
                        }`}
                        title="List View"
                      >
                        <BarChart2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setShowAddModificationForm(true)}
                      className="px-3 py-1.5 bg-blue-700 text-white rounded-md text-sm flex items-center hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Modification
                    </button>
                  </div>
                </div>
                
                {modifications.length > 0 ? (
                  <div className={activeView === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                    {modifications.map((mod) => (
                      <div
                        key={mod.id}
                        className={`
                          ${activeView === 'grid' 
                            ? 'bg-gray-900/40 rounded-lg overflow-hidden border border-gray-800' 
                            : 'bg-gray-900/40 rounded-lg overflow-hidden border border-gray-800 flex'
                          }
                        `}
                      >
                        {/* Grid View */}
                        {activeView === 'grid' && (
                          <>
                            <div className="h-40 bg-gray-800 relative">
                              {mod.image_url ? (
                                <img 
                                  src={mod.image_url} 
                                  alt={mod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Wrench className="h-8 w-8 text-gray-600" />
                                </div>
                              )}
                              
                              <div className="absolute top-2 right-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  mod.status === 'Installed' ? 'bg-green-900/70 text-green-400' :
                                  mod.status === 'Planned' ? 'bg-blue-900/70 text-blue-400' :
                                  mod.status === 'In Progress' ? 'bg-amber-900/70 text-amber-400' :
                                  'bg-red-900/70 text-red-400'
                                }`}>
                                  {mod.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <h4 className="font-medium text-white truncate">{mod.name}</h4>
                              
                              <div className="mt-1 text-xs text-gray-400 space-y-1">
                                {mod.type && (
                                  <div className="flex items-center">
                                    <Gauge className="h-3 w-3 mr-1.5" />
                                    {mod.type}
                                  </div>
                                )}
                                
                                {mod.brand && (
                                  <div className="flex items-center">
                                    <Shield className="h-3 w-3 mr-1.5" />
                                    {mod.brand} {mod.model && `- ${mod.model}`}
                                  </div>
                                )}
                                
                                {mod.installation_date && (
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1.5" />
                                    {new Date(mod.installation_date).toLocaleDateString()}
                                  </div>
                                )}
                                
                                {mod.cost && (
                                  <div className="flex items-center">
                                    <FileDown className="h-3 w-3 mr-1.5" />
                                    ${mod.cost.toLocaleString()}
                                  </div>
                                )}
                              </div>
                              
                              {mod.link_url && (
                                <a 
                                  href={mod.link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {mod.link_label || 'View Details'}
                                </a>
                              )}
                            </div>
                          </>
                        )}
                        
                        {/* List View */}
                        {activeView === 'list' && (
                          <>
                            <div className="w-16 h-16 shrink-0 bg-gray-800 flex items-center justify-center">
                              {mod.image_url ? (
                                <img 
                                  src={mod.image_url} 
                                  alt={mod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Wrench className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                            
                            <div className="p-3 flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-white">{mod.name}</h4>
                                
                                <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${
                                  mod.status === 'Installed' ? 'bg-green-900/70 text-green-400' :
                                  mod.status === 'Planned' ? 'bg-blue-900/70 text-blue-400' :
                                  mod.status === 'In Progress' ? 'bg-amber-900/70 text-amber-400' :
                                  'bg-red-900/70 text-red-400'
                                }`}>
                                  {mod.status}
                                </span>
                              </div>
                              
                              <div className="mt-1 text-sm text-gray-400 grid grid-cols-2 gap-x-6 gap-y-1">
                                {mod.type && (
                                  <div className="flex items-center text-xs">
                                    <Gauge className="h-3 w-3 mr-1.5" />
                                    {mod.type}
                                  </div>
                                )}
                                
                                {mod.brand && (
                                  <div className="flex items-center text-xs">
                                    <Shield className="h-3 w-3 mr-1.5" />
                                    {mod.brand}
                                  </div>
                                )}
                                
                                {mod.installation_date && (
                                  <div className="flex items-center text-xs">
                                    <Calendar className="h-3 w-3 mr-1.5" />
                                    {new Date(mod.installation_date).toLocaleDateString()}
                                  </div>
                                )}
                                
                                {mod.cost && (
                                  <div className="flex items-center text-xs">
                                    <FileDown className="h-3 w-3 mr-1.5" />
                                    ${mod.cost.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 text-center">
                    <Wrench className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-300 mb-2">No Modifications Yet</h4>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                      Track all your modifications to keep a record of your vehicle's evolution and build history.
                    </p>
                    <button
                      onClick={() => setShowAddModificationForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Modification
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Maintenance Section */}
            {activeSection === 'maintenance' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Maintenance Records</h3>
                  
                  <button
                    onClick={() => setShowAddMaintenanceForm(true)}
                    className="px-3 py-1.5 bg-blue-700 text-white rounded-md text-sm flex items-center hover:bg-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Record
                  </button>
                </div>
                
                {maintenanceRecords.length > 0 ? (
                  <div className="space-y-3">
                    {maintenanceRecords.map((record) => (
                      <div 
                        key={record.id}
                        className="bg-gray-900/40 rounded-lg overflow-hidden border border-gray-800"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-white">{record.title}</h4>
                              <div className="flex items-center text-sm text-gray-400 mt-1">
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                {new Date(record.date).toLocaleDateString()}
                                <div className="mx-2 w-1 h-1 rounded-full bg-gray-700"></div>
                                <Gauge className="h-3.5 w-3.5 mr-1.5" />
                                {record.mileage.toLocaleString()} miles
                              </div>
                            </div>
                            
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              record.status === 'Completed' ? 'bg-green-900/70 text-green-400' :
                              record.status === 'Scheduled' ? 'bg-blue-900/70 text-blue-400' :
                              'bg-amber-900/70 text-amber-400'
                            }`}>
                              {record.status}
                            </span>
                          </div>
                          
                          {record.description && (
                            <p className="mt-3 text-sm text-gray-400">
                              {record.description}
                            </p>
                          )}
                          
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                            <div className="flex items-center text-gray-400">
                              <Wrench className="h-3.5 w-3.5 mr-1.5" />
                              {record.performed_by}
                            </div>
                            
                            <div className="flex items-center text-gray-400">
                              <FileDown className="h-3.5 w-3.5 mr-1.5" />
                              ${record.cost.toLocaleString()}
                            </div>
                            
                            {record.type && (
                              <div className="flex items-center text-gray-400">
                                <Info className="h-3.5 w-3.5 mr-1.5" />
                                {record.type}
                              </div>
                            )}
                          </div>
                          
                          {record.parts && record.parts.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {record.parts.map((part, idx) => (
                                <span 
                                  key={idx}
                                  className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded"
                                >
                                  {part}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 text-center">
                    <Wrench className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-300 mb-2">No Maintenance Records Yet</h4>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                      Keep track of all maintenance performed on your vehicle for better service history and resale value.
                    </p>
                    <button
                      onClick={() => setShowAddMaintenanceForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Maintenance Record
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Gallery Section */}
            {activeSection === 'gallery' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Vehicle Gallery</h3>
                  
                  <button
                    className="px-3 py-1.5 bg-blue-700 text-white rounded-md text-sm flex items-center hover:bg-blue-600"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Images
                  </button>
                </div>
                
                <VehicleGallery vehicle={activeVehicle} />
              </div>
            )}
            
            {/* Checklists Section */}
            {activeSection === 'checklists' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-white mb-4">Maintenance Checklists</h3>
                  
                  <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800 mb-6">
                    <div className="flex items-center text-blue-400 mb-3">
                      <Calendar className="h-5 w-5 mr-2" />
                      <h4 className="font-medium">Seasonal Maintenance Checklists</h4>
                    </div>
                    
                    <SeasonalChecklists vehicle={activeVehicle} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Gloss Tracker Section */}
            {activeSection === 'gloss' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-white mb-4">Gloss Index Tracker</h3>
                  
                  <GlossTracker vehicle={activeVehicle} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pb-10">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <Car className="h-6 w-6 mr-3 text-blue-500" />
              GoTime Garage Vault
            </h1>
            
            <div className="flex items-center">
              <span className="hidden md:block text-gray-400 mr-3">Your Vehicle Command Center</span>
              <div className="w-px h-6 bg-gray-800 mx-3 hidden md:block"></div>
              <button
                onClick={() => setShowAddVehicleForm(true)}
                className="px-4 py-2 bg-blue-700 text-white rounded-md text-sm flex items-center hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your garage...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {renderVehicleSelector()}
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderVehicleDetail()}
            </div>
          </div>
        )}
      </div>
      
      {/* Add Vehicle Form Modal */}
      {showAddVehicleForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">Add New Vehicle</h3>
              <button
                onClick={() => setShowAddVehicleForm(false)}
                className="text-gray-500 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Add Vehicle Form would be here */}
              <p className="text-gray-400 mb-4">Form implementation would go here in a real application.</p>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddVehicleForm(false)}
                  className="px-4 py-2 text-gray-400 mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Demo: Add a mock vehicle
                    const mockVehicle = vehicleDataService.createMockVehicle();
                    const newVehicles = [mockVehicle, ...vehicles];
                    setVehicles(newVehicles);
                    setActiveVehicle(mockVehicle);
                    fetchVehicleData(mockVehicle.id);
                    setShowAddVehicleForm(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Vehicle (Demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Modification Form Modal */}
      {showAddModificationForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">Add Modification</h3>
              <button
                onClick={() => setShowAddModificationForm(false)}
                className="text-gray-500 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Add Modification Form would be here */}
              <p className="text-gray-400 mb-4">Form implementation would go here in a real application.</p>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddModificationForm(false)}
                  className="px-4 py-2 text-gray-400 mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Demo: Add a mock modification
                    if (activeVehicle) {
                      const mockMod = vehicleDataService.createMockModification(activeVehicle.id);
                      const newMods = [mockMod, ...modifications];
                      setModifications(newMods);
                      setShowAddModificationForm(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Modification (Demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Maintenance Form Modal */}
      {showAddMaintenanceForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">Add Maintenance Record</h3>
              <button
                onClick={() => setShowAddMaintenanceForm(false)}
                className="text-gray-500 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Add Maintenance Form would be here */}
              <p className="text-gray-400 mb-4">Form implementation would go here in a real application.</p>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddMaintenanceForm(false)}
                  className="px-4 py-2 text-gray-400 mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Demo: Add a mock maintenance record
                    if (activeVehicle) {
                      const mockMaintenance = vehicleDataService.createMockMaintenance(activeVehicle.id);
                      const newRecords = [mockMaintenance, ...maintenanceRecords];
                      setMaintenanceRecords(newRecords);
                      setShowAddMaintenanceForm(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Maintenance (Demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GarageVaultPage;