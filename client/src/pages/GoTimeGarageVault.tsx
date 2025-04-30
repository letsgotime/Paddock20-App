import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { exportToPdf, exportToCsv, printElement } from '../utils/exportUtils';

// Import component dependencies
import WeatherStation from '../components/WeatherStation';
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

// Import icons and services
import { Plus, Car, Download, Filter, LayoutGrid, List, Activity, Settings, Clock, Timer, Gauge, Target, 
         Sun, Shield, Smartphone, Calendar, BarChart3, Share2, Wrench, PaintBucket, User, Camera } from 'lucide-react';
import { getVehicles } from "../services/vehicleDataService";
import unsplashService from '../services/unsplashService';

// Define vehicle type
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  vin?: string;
  license_plate?: string;
  color?: string;
  purchase_date?: string;
  notes?: string;
  status: 'Active' | 'Storage' | 'Project' | 'Sold';
  type: 'Car' | 'Truck' | 'SUV' | 'Motorcycle' | 'Other';
  image_url?: string;
  last_update?: string;
  statistics?: {
    maintenance_count: number;
    modification_count: number;
    total_investments: number;
    drive_count: number;
    avg_drive_duration: number;
    mileage: number;
  }
}

// Define initial mock data
const initialVehicles: Vehicle[] = [
  {
    id: 'v1',
    make: 'BMW',
    model: 'M3',
    year: 2022,
    trim: 'Competition',
    color: 'Isle of Man Green',
    status: 'Active',
    type: 'Car',
    last_update: '2025-04-24',
    statistics: {
      maintenance_count: 6,
      modification_count: 4,
      total_investments: 14500,
      drive_count: 34,
      avg_drive_duration: 52,
      mileage: 12350
    }
  },
  {
    id: 'v2',
    make: 'Porsche',
    model: '911',
    year: 2021,
    trim: 'GT3',
    color: 'Guards Red',
    status: 'Active',
    type: 'Car',
    last_update: '2025-04-15',
    statistics: {
      maintenance_count: 3,
      modification_count: 2,
      total_investments: 9800,
      drive_count: 22,
      avg_drive_duration: 45,
      mileage: 8760
    }
  }
];

const GoTimeGarageVault: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAddVehicleForm, setShowAddVehicleForm] = useState<boolean>(false);
  const [showAddModForm, setShowAddModForm] = useState<boolean>(false);
  const [showAddMaintenanceForm, setShowAddMaintenanceForm] = useState<boolean>(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<string>('last_update');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [imageCache, setImageCache] = useState<{[key: string]: string}>({});

  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real implementation, we'd use the fetched data
        // For now, we'll use our initialVehicles and add a slight delay to simulate API call
        setTimeout(() => {
          setVehicles(initialVehicles);
          if (initialVehicles.length > 0) {
            setSelectedVehicle(initialVehicles[0]);
          }
          setLoading(false);
        }, 800);
        
        // Fetch vehicle images from Unsplash
        vehicles.forEach(async (vehicle) => {
          if (!vehicle.image_url) {
            try {
              const query = `${vehicle.make} ${vehicle.model} car`;
              // In a real implementation, we'd use the actual API
              // But for empty states it's better to use placeholders that encourage interaction
              // rather than displaying synthetic data
            } catch (error) {
              console.error('Error fetching vehicle image:', error);
            }
          }
        });
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort vehicles
  const filteredVehicles = vehicles
    .filter(vehicle => {
      // Apply status filter
      if (filterStatus !== 'all' && vehicle.status !== filterStatus) {
        return false;
      }
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          vehicle.make.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.year.toString().includes(query) ||
          (vehicle.vin && vehicle.vin.toLowerCase().includes(query)) ||
          (vehicle.color && vehicle.color.toLowerCase().includes(query))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;
      switch (sortField) {
        case 'make':
          comparison = a.make.localeCompare(b.make);
          break;
        case 'model':
          comparison = a.model.localeCompare(b.model);
          break;
        case 'year':
          comparison = a.year - b.year;
          break;
        case 'last_update':
          if (a.last_update && b.last_update) {
            comparison = new Date(a.last_update).getTime() - new Date(b.last_update).getTime();
          }
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
  // Handle adding a new vehicle
  const handleAddVehicle = (vehicleData: any) => {
    const newVehicle: Vehicle = {
      id: `v${vehicles.length + 1}`,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      trim: vehicleData.trim,
      vin: vehicleData.vin,
      license_plate: vehicleData.license_plate,
      color: vehicleData.color,
      purchase_date: vehicleData.purchase_date,
      notes: vehicleData.notes,
      status: vehicleData.status as Vehicle['status'],
      type: vehicleData.type as Vehicle['type'],
      image_url: vehicleData.image_url,
      last_update: new Date().toISOString().split('T')[0],
      statistics: {
        maintenance_count: 0,
        modification_count: 0,
        total_investments: 0,
        drive_count: 0,
        avg_drive_duration: 0,
        mileage: 0
      }
    };
    
    setVehicles([...vehicles, newVehicle]);
    setSelectedVehicle(newVehicle);
    setShowAddVehicleForm(false);
  };
  
  // Handle adding a modification
  const handleAddModification = (modData: any) => {
    // In a real implementation, this would add the modification to the database
    console.log('Adding modification:', modData);
    
    // Update the statistics for the selected vehicle
    if (selectedVehicle) {
      const updatedVehicle = {
        ...selectedVehicle,
        statistics: {
          ...selectedVehicle.statistics,
          modification_count: (selectedVehicle.statistics?.modification_count || 0) + 1,
          total_investments: (selectedVehicle.statistics?.total_investments || 0) + (modData.cost || 0)
        },
        last_update: new Date().toISOString().split('T')[0]
      };
      
      setSelectedVehicle(updatedVehicle);
      
      // Update the vehicle in the list
      setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    }
    
    setShowAddModForm(false);
  };
  
  // Handle adding maintenance
  const handleAddMaintenance = (maintenanceData: any) => {
    // In a real implementation, this would add the maintenance to the database
    console.log('Adding maintenance:', maintenanceData);
    
    // Update the statistics for the selected vehicle
    if (selectedVehicle) {
      const updatedVehicle = {
        ...selectedVehicle,
        statistics: {
          ...selectedVehicle.statistics,
          maintenance_count: (selectedVehicle.statistics?.maintenance_count || 0) + 1,
          total_investments: (selectedVehicle.statistics?.total_investments || 0) + (maintenanceData.cost || 0)
        },
        last_update: new Date().toISOString().split('T')[0]
      };
      
      setSelectedVehicle(updatedVehicle);
      
      // Update the vehicle in the list
      setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    }
    
    setShowAddMaintenanceForm(false);
  };
  
  // Handle exporting data
  const handleExport = (format: string) => {
    const exportElement = document.getElementById('vehicle-export');
    if (!exportElement) return;
    
    switch (format) {
      case 'pdf':
        exportToPdf(exportElement, `${selectedVehicle?.make}_${selectedVehicle?.model}_${selectedVehicle?.year}.pdf`);
        break;
      case 'csv':
        if (selectedVehicle) {
          const headers = ['Make', 'Model', 'Year', 'VIN', 'License Plate', 'Color', 'Status', 'Type'];
          const data = [
            headers,
            [
              selectedVehicle.make,
              selectedVehicle.model,
              selectedVehicle.year.toString(),
              selectedVehicle.vin || '',
              selectedVehicle.license_plate || '',
              selectedVehicle.color || '',
              selectedVehicle.status,
              selectedVehicle.type
            ]
          ];
          exportToCsv(data, `${selectedVehicle.make}_${selectedVehicle.model}_${selectedVehicle.year}.csv`);
        }
        break;
      case 'print':
        printElement(exportElement);
        break;
      default:
        break;
    }
  };
  
  // Render the main inventory grid/list view
  const renderVehicleInventory = () => {
    if (vehicles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <Car className="h-16 w-16 text-gray-700 mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No Vehicles Found</h3>
          <p className="text-gray-500 max-w-md mb-6">
            Your GoTime Garage Vault is empty. Add your first vehicle to start tracking maintenance, mods, and telemetry.
          </p>
          <button
            onClick={() => setShowAddVehicleForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Vehicle
          </button>
        </div>
      );
    }
    
    return (
      <div className="mb-6">
        {/* Filters and view controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">View:</span>
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded ${view === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <span className="text-gray-400 ml-4">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded-md text-sm p-1.5"
            >
              <option value="last_update">Last Updated</option>
              <option value="make">Make</option>
              <option value="model">Model</option>
              <option value="year">Year</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded-md text-sm p-2 w-full"
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded-md text-sm p-1.5"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Storage">In Storage</option>
              <option value="Project">Project</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>
        
        {/* Vehicle grid/list */}
        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`border rounded-lg overflow-hidden transition-colors cursor-pointer ${
                  selectedVehicle?.id === vehicle.id
                    ? 'border-blue-500 bg-blue-900/10'
                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                <div className="h-40 bg-gray-900 relative">
                  {vehicle.image_url ? (
                    <img 
                      src={vehicle.image_url} 
                      alt={`${vehicle.make} ${vehicle.model}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Car className="h-12 w-12 text-gray-700 mb-2" />
                      <span className="text-gray-500">Add photo</span>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 text-xs font-semibold">
                    {vehicle.status}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-100">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  {vehicle.trim && <p className="text-gray-400 text-sm">{vehicle.trim}</p>}
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">
                      <span className="block text-gray-500">Mileage</span>
                      {vehicle.statistics?.mileage?.toLocaleString() || 'Unknown'}
                    </div>
                    <div className="text-gray-400">
                      <span className="block text-gray-500">Last Update</span>
                      {vehicle.last_update || 'Never'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-900/30 text-blue-400">
                      <Activity className="h-3 w-3 mr-1" />
                      {vehicle.statistics?.drive_count || 0} Drives
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-900/30 text-green-400">
                      <Wrench className="h-3 w-3 mr-1" />
                      {vehicle.statistics?.maintenance_count || 0} Services
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-900/30 text-purple-400">
                      <PaintBucket className="h-3 w-3 mr-1" />
                      {vehicle.statistics?.modification_count || 0} Mods
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Vehicle Card */}
            <div
              onClick={() => setShowAddVehicleForm(true)}
              className="border border-dashed border-gray-700 rounded-lg bg-transparent hover:bg-gray-900/30 transition-colors cursor-pointer flex flex-col items-center justify-center h-full min-h-[250px] p-4"
            >
              <Plus className="h-12 w-12 text-gray-500 mb-2" />
              <p className="text-gray-400 font-medium">Add New Vehicle</p>
              <p className="text-gray-600 text-sm text-center mt-2">Track maintenance, mods, and performance</p>
            </div>
          </div>
        ) : (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Mileage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`cursor-pointer transition-colors ${
                      selectedVehicle?.id === vehicle.id
                        ? 'bg-blue-900/10'
                        : 'hover:bg-gray-800/70'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden">
                          {vehicle.image_url ? (
                            <img 
                              src={vehicle.image_url} 
                              alt={`${vehicle.make} ${vehicle.model}`} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Car className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-200">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.trim}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vehicle.status === 'Active' ? 'bg-green-900/30 text-green-400' :
                        vehicle.status === 'Storage' ? 'bg-yellow-900/30 text-yellow-400' :
                        vehicle.status === 'Project' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {vehicle.statistics?.mileage?.toLocaleString() || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {vehicle.last_update || 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-900/30 text-blue-400">
                          {vehicle.statistics?.drive_count || 0} Drives
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-900/30 text-green-400">
                          {vehicle.statistics?.maintenance_count || 0} Services
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => setShowAddVehicleForm(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add New Vehicle
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render vehicle detail tabs
  const renderVehicleDetailsTabs = () => {
    if (!selectedVehicle) return null;
    
    return (
      <div className="tabs overflow-x-auto whitespace-nowrap border-b border-gray-700 mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-500'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'telemetry'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-500'
            }`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab('enhanced-telemetry')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'enhanced-telemetry'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-500'
            }`}
          >
            Enhanced Telemetry
          </button>
          <button
            onClick={() => setActiveTab('gloss')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'gloss'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-500'
            }`}
          >
            Gloss Tracking
          </button>
          <button
            onClick={() => setActiveTab('juice-box')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'juice-box'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-500'
            }`}
          >
            JuiceBox™ Details
          </button>
          <button
            onClick={() => setActiveTab('seasonal')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'seasonal'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-500'
            }`}
          >
            Seasonal Checklists
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'gallery'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-500'
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'vault'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-500'
            }`}
          >
            Document Vault
          </button>
        </div>
      </div>
    );
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    if (!selectedVehicle) return null;
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6" id="vehicle-export">
            {/* Vehicle Header */}
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-100">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  {selectedVehicle.trim && ` ${selectedVehicle.trim}`}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedVehicle.status === 'Active' ? 'bg-green-900/30 text-green-400' :
                    selectedVehicle.status === 'Storage' ? 'bg-yellow-900/30 text-yellow-400' :
                    selectedVehicle.status === 'Project' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-gray-900/30 text-gray-400'
                  }`}>
                    {selectedVehicle.status}
                  </span>
                  {selectedVehicle.type && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      {selectedVehicle.type}
                    </span>
                  )}
                  {selectedVehicle.color && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      {selectedVehicle.color}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </button>
                </div>
                
                <button
                  onClick={() => {/* Would open settings/edit modal */}}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </button>
              </div>
            </div>
            
            {/* Vehicle Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left column: Vehicle Image & Details */}
              <div className="md:col-span-1">
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  {selectedVehicle.image_url ? (
                    <img 
                      src={selectedVehicle.image_url} 
                      alt={`${selectedVehicle.make} ${selectedVehicle.model}`} 
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-4 bg-gray-900">
                      <Car className="h-16 w-16 text-gray-700 mb-2" />
                      <span className="text-gray-500">No photo available</span>
                      <button className="mt-4 px-3 py-1.5 text-xs bg-gray-800 text-gray-300 rounded hover:bg-gray-700">
                        Add Photo
                      </button>
                    </div>
                  )}
                  
                  <div className="p-4 border-t border-gray-700">
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Vehicle Details</h3>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-400">VIN:</div>
                      <div className="text-gray-200">{selectedVehicle.vin || 'Not provided'}</div>
                      
                      <div className="text-gray-400">License:</div>
                      <div className="text-gray-200">{selectedVehicle.license_plate || 'Not provided'}</div>
                      
                      <div className="text-gray-400">Purchase Date:</div>
                      <div className="text-gray-200">{selectedVehicle.purchase_date || 'Not provided'}</div>
                      
                      <div className="text-gray-400">Last Updated:</div>
                      <div className="text-gray-200">{selectedVehicle.last_update || 'Never'}</div>
                    </div>
                    
                    {selectedVehicle.notes && (
                      <div className="mt-4 border-t border-gray-700 pt-4">
                        <div className="text-gray-400 text-sm mb-1">Notes:</div>
                        <p className="text-gray-300 text-sm">{selectedVehicle.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Weather Widget */}
                <div className="mt-4">
                  <WeatherStation />
                </div>
              </div>
              
              {/* Middle & Right columns: Stats & Actions */}
              <div className="md:col-span-2 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Total Drives</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-semibold text-blue-400">
                        {selectedVehicle.statistics?.drive_count || 0}
                      </div>
                      <Activity className="h-8 w-8 text-blue-500 opacity-70" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Mileage</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-semibold text-green-400">
                        {selectedVehicle.statistics?.mileage?.toLocaleString() || 0}
                      </div>
                      <Target className="h-8 w-8 text-green-500 opacity-70" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Avg. Drive Time</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-semibold text-purple-400">
                        {selectedVehicle.statistics?.avg_drive_duration || 0} min
                      </div>
                      <Timer className="h-8 w-8 text-purple-500 opacity-70" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Maintenance</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-semibold text-yellow-400">
                        {selectedVehicle.statistics?.maintenance_count || 0}
                      </div>
                      <Wrench className="h-8 w-8 text-yellow-500 opacity-70" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Modifications</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-semibold text-orange-400">
                        {selectedVehicle.statistics?.modification_count || 0}
                      </div>
                      <PaintBucket className="h-8 w-8 text-orange-500 opacity-70" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Investment</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-semibold text-red-400">
                        ${selectedVehicle.statistics?.total_investments?.toLocaleString() || 0}
                      </div>
                      <BarChart3 className="h-8 w-8 text-red-500 opacity-70" />
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-200 mb-3">Quick Actions</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => setShowAddMaintenanceForm(true)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <Wrench className="h-8 w-8 text-yellow-500 mb-2" />
                      <span className="text-sm text-gray-300">Add Maintenance</span>
                    </button>
                    
                    <button
                      onClick={() => setShowAddModForm(true)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <PaintBucket className="h-8 w-8 text-orange-500 mb-2" />
                      <span className="text-sm text-gray-300">Add Modification</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('telemetry')}
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <Gauge className="h-8 w-8 text-blue-500 mb-2" />
                      <span className="text-sm text-gray-300">View Telemetry</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <Camera className="h-8 w-8 text-purple-500 mb-2" />
                      <span className="text-sm text-gray-300">Add Photos</span>
                    </button>
                  </div>
                </div>
                
                {/* Drive Journal */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-200">Recent Drives</h3>
                    <Link to="/drive-journal" className="text-sm text-blue-400 hover:text-blue-300">
                      View All
                    </Link>
                  </div>
                  
                  <div className="border border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-700">
                    {selectedVehicle.statistics?.drive_count ? (
                      <div className="p-4 text-center">
                        <p className="text-gray-400">
                          Drive journal data will be displayed here. Visit the Drive Journal page to log your drives.
                        </p>
                        <Link 
                          to="/drive-journal" 
                          className="inline-block mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Open Drive Journal
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <Clock className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400">No drives recorded yet</p>
                        <Link 
                          to="/drive-journal" 
                          className="inline-block mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Log First Drive
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'telemetry':
        return (
          <div>
            <VehicleTelemetry vehicle={selectedVehicle} />
          </div>
        );
      
      case 'enhanced-telemetry':
        return (
          <div>
            <EnhancedVehicleTelemetry vehicle={selectedVehicle} />
          </div>
        );
      
      case 'gloss':
        return (
          <div>
            <GlossTracker vehicle={selectedVehicle} />
          </div>
        );
      
      case 'juice-box':
        return (
          <div>
            <JuiceBoxChecklists vehicle={selectedVehicle} />
          </div>
        );
      
      case 'seasonal':
        return (
          <div>
            <SeasonalChecklists 
              vehicle={selectedVehicle} 
              onExport={(data) => console.log('Export seasonal checklist:', data)} 
              onSave={(data) => console.log('Save seasonal checklist:', data)}
            />
          </div>
        );
      
      case 'gallery':
        return (
          <div className="text-center py-10">
            <Camera className="h-16 w-16 text-gray-700 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Vehicle Gallery Coming Soon</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              The gallery feature will allow you to upload, organize, and showcase photos of your vehicle, mods, and maintenance.
            </p>
          </div>
        );
      
      case 'vault':
        return (
          <div className="text-center py-10">
            <Shield className="h-16 w-16 text-gray-700 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Document Vault Coming Soon</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              The vault feature will allow you to securely store and organize important documents related to your vehicle.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Main render
  return (
    <div className="pb-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-100">GoTime Garage Vault</h1>
          <button
            onClick={() => setShowAddVehicleForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Vehicle
          </button>
        </div>
        <p className="text-gray-400 mt-1">
          Comprehensive vehicle management with F1-inspired telemetry, maintenance tracking, and detailed history
        </p>
      </div>
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Vehicle Inventory */}
          {renderVehicleInventory()}
          
          {/* Selected Vehicle Details */}
          {selectedVehicle && (
            <>
              {renderVehicleDetailsTabs()}
              {renderTabContent()}
            </>
          )}
        </>
      )}
      
      {/* Add Vehicle Modal */}
      {showAddVehicleForm && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={() => setShowAddVehicleForm(false)}></div>
          <div className="relative bg-gray-900 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto z-10">
            <div className="border-b border-gray-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-blue-400">Add New Vehicle</h2>
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
      
      {/* Add Modification Modal */}
      {showAddModForm && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={() => setShowAddModForm(false)}></div>
          <div className="relative bg-gray-900 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto z-10">
            <div className="border-b border-gray-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-blue-400">Add Modification</h2>
              <p className="text-gray-400 text-sm mt-1">Record a new modification for your {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}</p>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-400 py-4">Modification form will be loaded here</p>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowAddModForm(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddModification({ cost: 250 })}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-md flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Add Modification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Maintenance Modal */}
      {showAddMaintenanceForm && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={() => setShowAddMaintenanceForm(false)}></div>
          <div className="relative bg-gray-900 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto z-10">
            <div className="border-b border-gray-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-blue-400">Add Maintenance</h2>
              <p className="text-gray-400 text-sm mt-1">Record a new maintenance service for your {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}</p>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-400 py-4">Maintenance form will be loaded here</p>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowAddMaintenanceForm(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddMaintenance({ cost: 150 })}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-md flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Add Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoTimeGarageVault;