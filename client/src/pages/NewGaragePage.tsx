import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, ChevronRight, Gauge, Activity, Wrench, Zap, FileText, PlusCircle,
  Calendar, AlertTriangle, TrendingUp, MoreHorizontal, FileDown, Download,
  Printer, Search, Filter, X, RotateCcw
} from 'lucide-react';

// Import mock Supabase client
import supabase from '../services/supabaseClient';

// Type definitions for our data structures
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

interface OBDMetrics {
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

const NewGaragePage: React.FC = () => {
  // State management for vehicles and related data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [vehicleMetrics, setVehicleMetrics] = useState<OBDMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for UI controls
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showAddModificationForm, setShowAddModificationForm] = useState(false);
  const [showAddMaintenanceForm, setShowAddMaintenanceForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Refs for UI elements
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Fetch vehicles from Supabase on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        
        // Fetch real vehicle data from Supabase
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setVehicles(data);
          setActiveVehicle(data[0]);
          
          // Fetch associated data for the first vehicle
          fetchVehicleData(data[0].id);
        } else {
          setVehicles([]);
          setActiveVehicle(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);
  
  // Fetch vehicle data (modifications, maintenance records, OBD metrics)
  const fetchVehicleData = async (vehicleId: string) => {
    try {
      setLoading(true);
      
      // Fetch modifications from Supabase
      const { data: modData, error: modError } = await supabase
        .from('modifications')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('installation_date', { ascending: false });
        
      if (modError) throw modError;
      setModifications(modData || []);
      
      // Fetch maintenance records from Supabase
      const { data: maintData, error: maintError } = await supabase
        .from('maintenance')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });
        
      if (maintError) throw maintError;
      setMaintenanceRecords(maintData || []);
      
      // Connect to OBD2 interface to get real-time vehicle data
      try {
        // Attempt to connect to OBD via Bluetooth or API
        const obdApiEndpoint = `/api/obd/vehicle/${vehicleId}/telemetry`;
        const response = await fetch(obdApiEndpoint);
        
        if (response.ok) {
          const obdMetrics = await response.json();
          setVehicleMetrics(obdMetrics);
        } else {
          // If API fails, attempt direct WebBluetooth connection
          await connectToOBDDirectly(vehicleId);
        }
      } catch (err) {
        console.error('Error connecting to OBD interface:', err);
        setVehicleMetrics(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      setLoading(false);
    }
  };
  
  // Connect to OBD directly using WebBluetooth API
  const connectToOBDDirectly = async (vehicleId: string) => {
    if (!navigator.bluetooth) {
      console.error('WebBluetooth API is not available on this device/browser');
      setError('Bluetooth connectivity is not available on this device/browser. Please use a Bluetooth-enabled device with Chrome or Edge.');
      return;
    }
    
    try {
      // Request device with OBD2 service UUID
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['1234'] }, // OBD service UUID - replace with actual OBD2 service UUID
          { namePrefix: 'OBD' }
        ],
        optionalServices: ['battery_service']
      });
      
      console.log('Got device:', device.name);
      
      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }
      
      // Get OBD service
      const service = await server.getPrimaryService('1234'); // Replace with actual OBD2 service UUID
      
      // Get characteristics for different OBD parameters
      const mileageChar = await service.getCharacteristic('mileage');
      const fuelLevelChar = await service.getCharacteristic('fuel_level');
      
      // Read values
      const mileageData = await mileageChar.readValue();
      const fuelLevelData = await fuelLevelChar.readValue();
      
      // Parse values
      const mileage = mileageData.getUint32(0, true);
      const fuelLevel = fuelLevelData.getUint8(0);
      
      // Create metrics object from real OBD data
      setVehicleMetrics({
        mileage,
        fuelLevel,
        oilLevel: 0, // Will be populated with real data when available
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
      
    } catch (err) {
      console.error('Error connecting to OBD device via Bluetooth:', err);
      setVehicleMetrics(null);
    }
  };
  
  // Handle adding a new vehicle with user input data
  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Save to Supabase database
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        const newVehicles = [data[0], ...vehicles];
        setVehicles(newVehicles);
        setActiveVehicle(data[0]);
        
        // Fetch real vehicle data for the new vehicle
        fetchVehicleData(data[0].id);
      }
      
      setShowAddVehicleForm(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      setError('Failed to add vehicle. Please try again.');
    }
  };
  
  // Handle adding a new modification with user input data
  const handleAddModification = async (modificationData: Omit<Modification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!activeVehicle) return;
      
      const newMod = {
        ...modificationData,
        vehicle_id: activeVehicle.id
      };
      
      // Save to Supabase database
      const { data, error } = await supabase
        .from('modifications')
        .insert([newMod])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        setModifications([data[0], ...modifications]);
      }
      
      setShowAddModificationForm(false);
    } catch (error) {
      console.error('Error adding modification:', error);
      setError('Failed to add modification. Please try again.');
    }
  };
  
  // Handle adding a new maintenance record with user input data
  const handleAddMaintenance = async (maintenanceData: Omit<Maintenance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!activeVehicle) return;
      
      const newMaintenance = {
        ...maintenanceData,
        vehicle_id: activeVehicle.id
      };
      
      // Save to Supabase database
      const { data, error } = await supabase
        .from('maintenance')
        .insert([newMaintenance])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        setMaintenanceRecords([data[0], ...maintenanceRecords]);
      }
      
      setShowAddMaintenanceForm(false);
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      setError('Failed to add maintenance record. Please try again.');
    }
  };
  
  // Handle form submissions from user input
  const handleAddVehicleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Extract user input data from form
    const vehicleData = {
      make: form.make.value,
      model: form.model.value,
      year: parseInt(form.year.value),
      trim: form.trim.value || '',
      vin: form.vin.value,
      license_plate: form.license_plate.value,
      color: form.color.value,
      purchase_date: form.purchase_date?.value || '',
      purchase_price: parseFloat(form.purchase_price?.value || '0'),
      current_value: parseFloat(form.current_value?.value || '0'),
      status: form.status.value as 'Active' | 'Stored' | 'Sold' | 'Project',
      notes: form.notes?.value || '',
      drivetrain: form.drivetrain?.value || '',
      type: form.type?.value || ''
    };
    
    handleAddVehicle(vehicleData);
  };
  
  const handleAddModificationFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Extract user input data from form
    const modificationData = {
      name: form.name.value,
      type: form.type.value,
      description: form.description?.value || '',
      brand: form.brand?.value || '',
      model: form.model?.value || '',
      part_number: form.part_number?.value || '',
      installation_date: form.installation_date?.value || '',
      installation_location: form.installation_location?.value || '',
      cost: parseFloat(form.cost?.value || '0'),
      installer: form.installer?.value || '',
      warranty_expires: form.warranty_expires?.value || '',
      status: form.status.value as 'Planned' | 'In Progress' | 'Installed' | 'Removed',
      category: form.category?.value || '',
      vehicle_id: activeVehicle?.id || '',
      affected_systems: form.affected_systems?.value ? form.affected_systems.value.split(',') : [],
      notes: form.notes?.value || ''
    };
    
    handleAddModification(modificationData);
  };
  
  const handleAddMaintenanceFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Extract user input data from form
    const maintenanceData = {
      type: form.type.value,
      title: form.title.value,
      description: form.description?.value || '',
      performed_by: form.performed_by.value,
      date: form.date.value,
      mileage: parseInt(form.mileage.value),
      cost: parseFloat(form.cost.value),
      parts: form.parts?.value ? form.parts.value.split(',') : [],
      status: form.status.value as 'Scheduled' | 'Completed' | 'Postponed',
      vehicle_id: activeVehicle?.id || '',
      notes: form.notes?.value || ''
    };
    
    handleAddMaintenance(maintenanceData);
  };
  
  // Calculate real vehicle summary data without mocks
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
  
  // Get vehicle status badge color based on actual status
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
  
  // Render the OBD data panel - only using real data
  const renderOBDPanel = () => {
    if (!vehicleMetrics) {
      return (
        <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-900/30 mr-3">
              <Gauge className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-200">Vehicle Telemetry</h3>
          </div>
          
          <div className="text-center py-8">
            <div className="mb-4">
              <RotateCcw className="h-12 w-12 text-gray-600 mx-auto animate-pulse" />
            </div>
            <p className="text-gray-400 mb-2">No OBD connection detected</p>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Connect your OBD2 device to your vehicle and pair with this application to see real-time telemetry data
            </p>
            <button className="px-4 py-2 bg-blue-900/50 text-blue-400 rounded-md hover:bg-blue-900/70 transition-colors border border-blue-800/50">
              Connect OBD Device
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-900/30 mr-3">
              <Gauge className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-200">Live Telemetry</h3>
          </div>
          <div className="flex items-center">
            <span className="inline-flex h-3 w-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            <span className="text-gray-400 text-sm">Connected</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Fuel Level</div>
            <div className="text-xl font-semibold text-gray-100">
              {vehicleMetrics.fuelLevel}%
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${vehicleMetrics.fuelLevel}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Oil Temperature</div>
            <div className="text-xl font-semibold text-gray-100">
              {vehicleMetrics.oilTemp}°F
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
              <div 
                className={`h-full rounded-full ${
                  vehicleMetrics.oilTemp > 230 ? 'bg-red-500' :
                  vehicleMetrics.oilTemp > 200 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (vehicleMetrics.oilTemp / 300) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Coolant Temp</div>
            <div className="text-xl font-semibold text-gray-100">
              {vehicleMetrics.coolantTemp}°F
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
              <div 
                className={`h-full rounded-full ${
                  vehicleMetrics.coolantTemp > 220 ? 'bg-red-500' :
                  vehicleMetrics.coolantTemp > 200 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (vehicleMetrics.coolantTemp / 250) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Battery Health</div>
            <div className="text-xl font-semibold text-gray-100">
              {vehicleMetrics.batteryHealth}%
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
              <div 
                className={`h-full rounded-full ${
                  vehicleMetrics.batteryHealth < 30 ? 'bg-red-500' :
                  vehicleMetrics.batteryHealth < 60 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${vehicleMetrics.batteryHealth}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-gray-300 font-medium mb-3">Tire Pressure (PSI)</h4>
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">Front Left</div>
                <div className={`text-lg font-semibold ${
                  vehicleMetrics.tirePressure.frontLeft < 28 || vehicleMetrics.tirePressure.frontLeft > 36 
                    ? 'text-red-400' : 'text-gray-100'
                }`}>
                  {vehicleMetrics.tirePressure.frontLeft}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-400">Front Right</div>
                <div className={`text-lg font-semibold ${
                  vehicleMetrics.tirePressure.frontRight < 28 || vehicleMetrics.tirePressure.frontRight > 36 
                    ? 'text-red-400' : 'text-gray-100'
                }`}>
                  {vehicleMetrics.tirePressure.frontRight}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-400">Rear Left</div>
                <div className={`text-lg font-semibold ${
                  vehicleMetrics.tirePressure.rearLeft < 28 || vehicleMetrics.tirePressure.rearLeft > 36 
                    ? 'text-red-400' : 'text-gray-100'
                }`}>
                  {vehicleMetrics.tirePressure.rearLeft}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-400">Rear Right</div>
                <div className={`text-lg font-semibold ${
                  vehicleMetrics.tirePressure.rearRight < 28 || vehicleMetrics.tirePressure.rearRight > 36 
                    ? 'text-red-400' : 'text-gray-100'
                }`}>
                  {vehicleMetrics.tirePressure.rearRight}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Main render method with vehicle data
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Garage Vault</h1>
          <p className="text-gray-400">
            Manage your vehicles, modifications, and maintenance with real-time data
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6 text-red-300">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="text-red-400 underline text-sm mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {loading && !activeVehicle ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Vehicle List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-blue-400 font-medium text-lg">Garage Inventory</h3>
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
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {activeVehicle ? (
                <div>
                  {/* Vehicle Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-6 border border-gray-800 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} {activeVehicle.trim}
                        </h2>
                        <div className="flex items-center mt-2">
                          <span className={`${getStatusBadgeColor(activeVehicle.status)} px-2 py-1 text-xs rounded-full text-white`}>
                            {activeVehicle.status}
                          </span>
                          {activeVehicle.vin && (
                            <span className="ml-3 text-gray-400 text-sm">
                              VIN: {activeVehicle.vin}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex space-x-3">
                        <button 
                          onClick={() => setShowAddModificationForm(true)}
                          className="px-3 py-2 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 transition-colors text-sm border border-blue-800/30"
                        >
                          Add Modification
                        </button>
                        <button 
                          onClick={() => setShowAddMaintenanceForm(true)}
                          className="px-3 py-2 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 transition-colors text-sm border border-blue-800/30"
                        >
                          Log Maintenance
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vehicle Stats */}
                  {vehicleMetrics && (
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
                            {maintenanceRecords.length}
                            <span className="text-sm font-normal text-gray-500 ml-1">records</span>
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
                            {modifications.length}
                            <span className="text-sm font-normal text-gray-500 ml-1">installed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* OBD Panel */}
                  {renderOBDPanel()}
                  
                  {/* Tabs for Modifications, Maintenance, etc. */}
                  <div className="mt-6">
                    <div className="border-b border-gray-800">
                      <nav className="flex space-x-6">
                        <button className="py-3 border-b-2 border-blue-500 text-blue-400 font-medium">
                          Modifications ({modifications.length})
                        </button>
                        <button className="py-3 text-gray-400 hover:text-gray-300">
                          Maintenance ({maintenanceRecords.length})
                        </button>
                        <button className="py-3 text-gray-400 hover:text-gray-300">
                          Documents
                        </button>
                      </nav>
                    </div>
                    
                    {/* Modifications List */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">Modifications</h3>
                        <button 
                          onClick={() => setShowAddModificationForm(true)}
                          className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 transition-colors text-sm border border-blue-800/30"
                        >
                          Add New
                        </button>
                      </div>
                      
                      {modifications.length > 0 ? (
                        <div className="space-y-4">
                          {modifications.map((mod) => (
                            <div key={mod.id} className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="text-lg font-medium text-white">{mod.name}</h4>
                                  <div className="flex items-center mt-1">
                                    <span className="text-gray-400 text-sm">{mod.type}</span>
                                    {mod.brand && (
                                      <>
                                        <span className="mx-2 text-gray-600">•</span>
                                        <span className="text-gray-400 text-sm">{mod.brand}</span>
                                      </>
                                    )}
                                    {mod.model && (
                                      <>
                                        <span className="mx-2 text-gray-600">•</span>
                                        <span className="text-gray-400 text-sm">{mod.model}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                    mod.status === 'Installed' ? 'bg-green-900/50 text-green-400' :
                                    mod.status === 'Planned' ? 'bg-blue-900/50 text-blue-400' :
                                    mod.status === 'In Progress' ? 'bg-amber-900/50 text-amber-400' :
                                    'bg-gray-800 text-gray-400'
                                  }`}>
                                    {mod.status}
                                  </span>
                                </div>
                              </div>
                              
                              {mod.description && (
                                <p className="text-gray-400 mt-2 text-sm">{mod.description}</p>
                              )}
                              
                              <div className="flex flex-wrap items-center mt-3 text-sm">
                                {mod.installation_date && (
                                  <div className="mr-4 mb-2 flex items-center text-gray-500">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    {mod.installation_date}
                                  </div>
                                )}
                                
                                {mod.cost && (
                                  <div className="mr-4 mb-2 flex items-center text-gray-500">
                                    <span className="mr-1">$</span>
                                    {mod.cost.toLocaleString()}
                                  </div>
                                )}
                                
                                {mod.installer && (
                                  <div className="mr-4 mb-2 flex items-center text-gray-500">
                                    <span className="mr-1">By:</span>
                                    {mod.installer}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 text-center">
                          <Zap className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 mb-3">No modifications logged yet</p>
                          <button
                            onClick={() => setShowAddModificationForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Add Your First Modification
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/40 rounded-xl p-8 border border-gray-800 text-center">
                  <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Vehicle Selected</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Select a vehicle from your garage or add a new vehicle to get started
                  </p>
                  <button
                    onClick={() => setShowAddVehicleForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add New Vehicle
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Add Vehicle Form Modal */}
      {showAddVehicleForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Add New Vehicle</h3>
              <button 
                onClick={() => setShowAddVehicleForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddVehicleFormSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Make*
                  </label>
                  <input
                    type="text"
                    name="make"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Model*
                  </label>
                  <input
                    type="text"
                    name="model"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Year*
                  </label>
                  <input
                    type="number"
                    name="year"
                    required
                    min="1900"
                    max="2030"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Trim
                  </label>
                  <input
                    type="text"
                    name="trim"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    VIN*
                  </label>
                  <input
                    type="text"
                    name="vin"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    name="license_plate"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    name="purchase_price"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status*
                  </label>
                  <select
                    name="status"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Stored">Stored</option>
                    <option value="Sold">Sold</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleForm(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Modification Form Modal */}
      {showAddModificationForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Add Modification</h3>
              <button 
                onClick={() => setShowAddModificationForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddModificationFormSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Modification Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Type*
                  </label>
                  <input
                    type="text"
                    name="type"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Cost
                  </label>
                  <input
                    type="number"
                    name="cost"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status*
                  </label>
                  <select
                    name="status"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Installed">Installed</option>
                    <option value="Removed">Removed</option>
                  </select>
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Installation Date
                  </label>
                  <input
                    type="date"
                    name="installation_date"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Installer
                  </label>
                  <input
                    type="text"
                    name="installer"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModificationForm(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Modification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Maintenance Form Modal */}
      {showAddMaintenanceForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Log Maintenance</h3>
              <button 
                onClick={() => setShowAddMaintenanceForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMaintenanceFormSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Type*
                  </label>
                  <input
                    type="text"
                    name="type"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status*
                  </label>
                  <select
                    name="status"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                  </select>
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Mileage*
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    required
                    min="0"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Cost*
                  </label>
                  <input
                    type="number"
                    name="cost"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Performed By*
                  </label>
                  <input
                    type="text"
                    name="performed_by"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Parts (comma separated)
                  </label>
                  <input
                    type="text"
                    name="parts"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddMaintenanceForm(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewGaragePage;