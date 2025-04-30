import React, { useState, useEffect } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { Link } from 'wouter';
import {
  Car, Wrench, Gauge, Upload, PlusCircle, Layout, LayoutGrid,
  ClipboardList, Map, Calendar, Settings, ChevronRight, Users,
  Award, Shield, AlertTriangle, Check, Clock, FileText, ExternalLink,
  BookOpen, Download, Droplets, History, Tag, User, ListChecks
} from 'lucide-react';

// Import components
import GarageWeatherDisplay from '../components/GarageWeatherDisplay';
import VehicleHealthCheck from '../components/VehicleHealthCheck';
import GarageProjectLauncher from '../components/GarageProjectLauncher';

// Import from EnhancedGarageVault.tsx component
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const EnhancedGarageVault: React.FC = () => {
  const { vehicles, activeVehicle, setActiveVehicle, loading: vehiclesLoading } = useVehicles();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isPaddock20Member, setIsPaddock20Member] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Temperature settings for the vehicle
  const [vehicleTempSettings, setVehicleTempSettings] = useState({
    idealAmbientTemp: {
      min: 15,
      max: 25,
      unit: 'C' as const
    },
    idealTirePressure: {
      cold: {
        frontLeft: 32,
        frontRight: 32,
        rearLeft: 32,
        rearRight: 32
      },
      hot: {
        frontLeft: 35,
        frontRight: 35,
        rearLeft: 35,
        rearRight: 35
      },
      unit: 'PSI' as const
    },
    weatherRecommendations: {
      rain: 'Avoid washing & waxing. Consider postponing detailing work.',
      snow: 'Wait for warmer conditions for any detailing work.',
      hot: 'Work in shade, use quick detailer to avoid water spots.',
      cold: 'Use products designed for low temperatures, warm water when possible.',
      highWind: 'Be cautious of dust and debris contamination during detailing.'
    }
  });
  
  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch the user profile from Supabase or API
        const { data, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (data && data.user) {
          // Determine if user is a Paddock20 member
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) throw profileError;
          
          setUserProfile(profileData);
          setIsPaddock20Member(profileData?.membership_tier === 'paddock20' || false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setLoading(false);
        
        // If there's an error, we'll assume user is logged in but not a Paddock20 member
        setIsPaddock20Member(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  // Fetch vehicle documents when active vehicle changes
  useEffect(() => {
    if (activeVehicle) {
      fetchVehicleDocuments(activeVehicle.id);
    }
  }, [activeVehicle]);
  
  // Fetch vehicle documents from Supabase
  const fetchVehicleDocuments = async (vehicleId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching vehicle documents:', err);
      setError('Failed to load vehicle documents');
    }
  };
  
  // Handle section toggle
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };
  
  // Render loading state
  if (vehiclesLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Garage Vault</h2>
          <p className="text-gray-400">Retrieving your vehicle data...</p>
        </div>
      </div>
    );
  }
  
  // Render no vehicles state
  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen p-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Garage Vault</h1>
          </div>
          
          <div className="bg-gray-900/40 rounded-xl p-8 border border-gray-800 text-center">
            <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-3">No Vehicles in Your Garage</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Your garage is empty. Add your first vehicle to start tracking maintenance, modifications, and more.
            </p>
            <Link href="/add-vehicle">
              <a className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Your First Vehicle
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen p-4 md:p-8 ${
      isPaddock20Member 
        ? 'bg-gradient-to-b from-black to-gray-950 bg-[url("/assets/paddock20-pattern.svg")] bg-fixed bg-no-repeat bg-cover'
        : 'bg-black'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${
              isPaddock20Member ? 'text-amber-400' : 'text-white'
            } mb-1`}>
              Garage Vault
            </h1>
            <p className="text-gray-400">
              Your vehicle command center for maintenance, modifications & documentation
            </p>
          </div>
          
          {isPaddock20Member && (
            <div className="mt-4 md:mt-0 px-4 py-2 bg-amber-900/30 border border-amber-500/30 rounded-full flex items-center">
              <Award className="h-5 w-5 text-amber-400 mr-2" />
              <span className="text-sm font-medium text-amber-400">PADDOCK20 MEMBER</span>
            </div>
          )}
        </div>
        
        {/* Vehicle selector */}
        <div className="mb-8 bg-gray-900/40 rounded-xl overflow-hidden border border-gray-800">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Car className="h-5 w-5 text-blue-400 mr-2" />
              My Vehicles
            </h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-md ${
                  view === 'grid' ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md ${
                  view === 'list' ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <Layout className="h-5 w-5" />
              </button>
              
              <Link href="/add-vehicle">
                <a className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Add Vehicle
                </a>
              </Link>
            </div>
          </div>
          
          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  onClick={() => setActiveVehicle(vehicle)}
                  className={`rounded-lg overflow-hidden bg-gray-900/60 border cursor-pointer transform transition-all hover:scale-105 ${
                    activeVehicle?.id === vehicle.id 
                      ? 'border-blue-500 shadow-lg shadow-blue-900/20 ring-2 ring-blue-500/20 scale-105' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="h-40 bg-gray-800 relative">
                    {vehicle.image_url ? (
                      <img 
                        src={vehicle.image_url} 
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-12 w-12 text-gray-700" />
                      </div>
                    )}
                    
                    <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full ${
                      vehicle.status === 'Active' ? 'bg-green-900/70 text-green-400' :
                      vehicle.status === 'Stored' ? 'bg-blue-900/70 text-blue-400' :
                      vehicle.status === 'Sold' ? 'bg-gray-900/70 text-gray-400' :
                      'bg-amber-900/70 text-amber-400'
                    }`}>
                      {vehicle.status}
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium text-gray-200">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    {vehicle.trim && (
                      <p className="text-sm text-gray-400">{vehicle.trim}</p>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-500">
                      VIN: {vehicle.vin ? vehicle.vin.substring(vehicle.vin.length - 7) : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  onClick={() => setActiveVehicle(vehicle)}
                  className={`p-4 flex items-center cursor-pointer hover:bg-gray-900/40 ${
                    activeVehicle?.id === vehicle.id ? 'bg-blue-900/10' : ''
                  }`}
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-800 mr-4">
                    {vehicle.image_url ? (
                      <img 
                        src={vehicle.image_url} 
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-6 w-6 text-gray-700" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-200">
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                    </h3>
                    
                    <div className="flex mt-1 text-sm">
                      <div className={`px-1.5 py-0.5 text-xs rounded-full mr-3 ${
                        vehicle.status === 'Active' ? 'bg-green-900/50 text-green-400' :
                        vehicle.status === 'Stored' ? 'bg-blue-900/50 text-blue-400' :
                        vehicle.status === 'Sold' ? 'bg-gray-800 text-gray-400' :
                        'bg-amber-900/50 text-amber-400'
                      }`}>
                        {vehicle.status}
                      </div>
                      
                      {vehicle.vin && (
                        <div className="text-gray-500">
                          VIN: {vehicle.vin.substring(vehicle.vin.length - 7)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {activeVehicle?.id === vehicle.id && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {activeVehicle && (
          <>
            {/* Vehicle Overview Header */}
            <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-900/40 rounded-xl p-6 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} {activeVehicle.trim}
                </h2>
                
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <div className={`px-2 py-0.5 text-xs rounded-full ${
                    activeVehicle.status === 'Active' ? 'bg-green-900/50 text-green-400' :
                    activeVehicle.status === 'Stored' ? 'bg-blue-900/50 text-blue-400' :
                    activeVehicle.status === 'Sold' ? 'bg-gray-800 text-gray-400' :
                    'bg-amber-900/50 text-amber-400'
                  }`}>
                    {activeVehicle.status}
                  </div>
                  
                  {activeVehicle.vin && (
                    <div className="text-sm text-gray-400">
                      VIN: {activeVehicle.vin}
                    </div>
                  )}
                  
                  {activeVehicle.mileage !== undefined && (
                    <div className="text-sm text-gray-400 flex items-center">
                      <Gauge className="h-3.5 w-3.5 mr-1" />
                      {activeVehicle.mileage.toLocaleString()} miles
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <Link href={`/maintenance?vehicle=${activeVehicle.id}`}>
                  <a className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 border border-blue-800/30 flex items-center">
                    <Wrench className="h-4 w-4 mr-1.5" />
                    Maintenance
                  </a>
                </Link>
                
                <Link href={`/modifications?vehicle=${activeVehicle.id}`}>
                  <a className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 border border-blue-800/30 flex items-center">
                    <Zap className="h-4 w-4 mr-1.5" />
                    Modifications
                  </a>
                </Link>
                
                <Link href={`/documents?vehicle=${activeVehicle.id}`}>
                  <a className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 border border-blue-800/30 flex items-center">
                    <FileText className="h-4 w-4 mr-1.5" />
                    Documents
                  </a>
                </Link>
              </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Vehicle Health */}
                <VehicleHealthCheck 
                  vehicleId={activeVehicle.id}
                  isPaddock20Member={isPaddock20Member}
                  hasOBD2={true}
                />
                
                {/* Project Launcher */}
                <GarageProjectLauncher
                  vehicleId={activeVehicle.id}
                  isPaddock20Member={isPaddock20Member}
                />
                
                {/* Documents Section */}
                <div className={`bg-gray-900/40 rounded-xl p-5 border ${
                  isPaddock20Member 
                    ? 'border-amber-500/30 bg-gradient-to-br from-gray-900 to-gray-900/80'
                    : 'border-gray-800'
                }`}>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <FileText className={`h-6 w-6 mr-2 ${
                        isPaddock20Member ? 'text-amber-400' : 'text-blue-400'
                      }`} />
                      Vehicle Documents
                    </h2>
                    
                    <button
                      onClick={() => {/* Open upload dialog */}}
                      className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 border border-blue-800/30 flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-1.5" />
                      Upload
                    </button>
                  </div>
                  
                  {documents.length > 0 ? (
                    <div className="space-y-4">
                      {/* Document categories */}
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            className="p-4 bg-gray-900/60 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors cursor-pointer"
                            onClick={() => toggleSection('maintenance-docs')}
                          >
                            <div className="flex items-center mb-2">
                              <div className="p-2 bg-blue-900/30 rounded-md mr-3">
                                <Wrench className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-md font-medium text-gray-200">Maintenance Records</h3>
                                <p className="text-xs text-gray-500">
                                  {documents.filter(d => d.category === 'maintenance').length} documents
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div
                            className="p-4 bg-gray-900/60 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors cursor-pointer"
                            onClick={() => toggleSection('modification-docs')}
                          >
                            <div className="flex items-center mb-2">
                              <div className="p-2 bg-blue-900/30 rounded-md mr-3">
                                <Zap className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-md font-medium text-gray-200">Modification Files</h3>
                                <p className="text-xs text-gray-500">
                                  {documents.filter(d => d.category === 'modification').length} documents
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div
                            className="p-4 bg-gray-900/60 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors cursor-pointer"
                            onClick={() => toggleSection('warranty-docs')}
                          >
                            <div className="flex items-center mb-2">
                              <div className="p-2 bg-blue-900/30 rounded-md mr-3">
                                <Shield className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-md font-medium text-gray-200">Warranty Information</h3>
                                <p className="text-xs text-gray-500">
                                  {documents.filter(d => d.category === 'warranty').length} documents
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div
                            className="p-4 bg-gray-900/60 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors cursor-pointer"
                            onClick={() => toggleSection('detailing-docs')}
                          >
                            <div className="flex items-center mb-2">
                              <div className="p-2 bg-blue-900/30 rounded-md mr-3">
                                <Droplets className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-md font-medium text-gray-200">Detailing Records</h3>
                                <p className="text-xs text-gray-500">
                                  {documents.filter(d => d.category === 'detailing').length} documents
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {activeSection === 'maintenance-docs' && (
                          <div className="mt-4 p-4 bg-gray-900/60 rounded-lg border border-gray-800">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Maintenance Documents</h4>
                            
                            <div className="space-y-2">
                              {documents.filter(d => d.category === 'maintenance').length > 0 ? (
                                documents
                                  .filter(d => d.category === 'maintenance')
                                  .map(doc => (
                                    <a
                                      key={doc.id}
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800/80 transition-colors"
                                    >
                                      <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-blue-400 mr-3" />
                                        <div>
                                          <div className="text-sm font-medium text-gray-300">{doc.name}</div>
                                          <div className="text-xs text-gray-500">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                          </div>
                                        </div>
                                      </div>
                                      <Download className="h-4 w-4 text-gray-500" />
                                    </a>
                                  ))
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-gray-400">No maintenance documents found</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Other document sections would follow the same pattern */}
                      </div>
                      
                      <div className="text-right">
                        <Link href={`/documents?vehicle=${activeVehicle.id}`}>
                          <a className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center">
                            View All Documents
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </a>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-400 mb-3">No documents found for this vehicle</p>
                      <button
                        onClick={() => {/* Open upload dialog */}}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Upload Your First Document
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-8">
                {/* Weather Display */}
                <GarageWeatherDisplay
                  vehicleId={activeVehicle.id}
                  location={{ lat: 35.9676, lon: -86.8232 }} // This would be dynamic based on user location
                  tempSettings={vehicleTempSettings}
                  timeZones={['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'UTC']}
                />
                
                {/* Quick Links */}
                <div className="bg-gray-900/40 rounded-xl p-5 border border-gray-800">
                  <h3 className="text-lg font-medium text-gray-200 mb-4">Quick Links</h3>
                  
                  <div className="space-y-2">
                    <Link href={`/route-planner?vehicle=${activeVehicle.id}`}>
                      <a className="flex items-center justify-between p-3 bg-gray-900/60 rounded-lg hover:bg-gray-800/80 transition-colors">
                        <div className="flex items-center">
                          <Map className="h-5 w-5 text-blue-400 mr-3" />
                          <span className="text-gray-300">Route Planner</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </a>
                    </Link>
                    
                    <Link href={`/drive-journal?vehicle=${activeVehicle.id}`}>
                      <a className="flex items-center justify-between p-3 bg-gray-900/60 rounded-lg hover:bg-gray-800/80 transition-colors">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 text-blue-400 mr-3" />
                          <span className="text-gray-300">Drive Journal</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </a>
                    </Link>
                    
                    <Link href={`/marketplace?vehicle=${activeVehicle.id}`}>
                      <a className="flex items-center justify-between p-3 bg-gray-900/60 rounded-lg hover:bg-gray-800/80 transition-colors">
                        <div className="flex items-center">
                          <Tag className="h-5 w-5 text-blue-400 mr-3" />
                          <span className="text-gray-300">Marketplace</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </a>
                    </Link>
                    
                    <Link href="/manifestation-station">
                      <a className="flex items-center justify-between p-3 bg-gray-900/60 rounded-lg hover:bg-gray-800/80 transition-colors">
                        <div className="flex items-center">
                          <Compass className="h-5 w-5 text-blue-400 mr-3" />
                          <span className="text-gray-300">Manifestation Station</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </a>
                    </Link>
                    
                    {isPaddock20Member && (
                      <Link href="/broker">
                        <a className="flex items-center justify-between p-3 bg-amber-900/30 rounded-lg hover:bg-amber-900/40 transition-colors border border-amber-800/30">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-amber-400 mr-3" />
                            <span className="text-amber-300">Broker Portal</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-amber-700" />
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
                
                {/* Vehicle History */}
                <div className="bg-gray-900/40 rounded-xl p-5 border border-gray-800">
                  <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
                    <History className="h-5 w-5 text-blue-400 mr-2" />
                    Vehicle Timeline
                  </h3>
                  
                  <div className="space-y-4">
                    {activeVehicle.purchase_date && (
                      <div className="relative pl-6 pb-4 border-l border-gray-800">
                        <div className="absolute top-0 left-0 w-3 h-3 -ml-1.5 rounded-full bg-blue-500"></div>
                        <div className="text-sm font-medium text-gray-300">Purchase Date</div>
                        <div className="text-xs text-gray-500">{new Date(activeVehicle.purchase_date).toLocaleDateString()}</div>
                        {activeVehicle.purchase_price && (
                          <div className="mt-1 text-xs text-gray-400">
                            Purchase Price: ${activeVehicle.purchase_price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Add more timeline items here */}
                    <div className="relative pl-6 pb-4 border-l border-gray-800">
                      <div className="absolute top-0 left-0 w-3 h-3 -ml-1.5 rounded-full bg-green-500"></div>
                      <div className="text-sm font-medium text-gray-300">Added to Garage Vault</div>
                      <div className="text-xs text-gray-500">{new Date(activeVehicle.created_at).toLocaleDateString()}</div>
                    </div>
                    
                    <Link href={`/history?vehicle=${activeVehicle.id}`}>
                      <a className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center mt-2">
                        View Complete History
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </Link>
                  </div>
                </div>
                
                {/* Vehicle Specs */}
                <div className="bg-gray-900/40 rounded-xl p-5 border border-gray-800">
                  <h3 className="text-lg font-medium text-gray-200 mb-4">Vehicle Specifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between pb-2 border-b border-gray-800">
                      <div className="text-sm text-gray-400">Engine</div>
                      <div className="text-sm text-gray-200">{activeVehicle.engine_type || 'N/A'}</div>
                    </div>
                    
                    <div className="flex justify-between pb-2 border-b border-gray-800">
                      <div className="text-sm text-gray-400">Transmission</div>
                      <div className="text-sm text-gray-200">{activeVehicle.transmission || 'N/A'}</div>
                    </div>
                    
                    <div className="flex justify-between pb-2 border-b border-gray-800">
                      <div className="text-sm text-gray-400">Drivetrain</div>
                      <div className="text-sm text-gray-200">{activeVehicle.drivetrain || 'N/A'}</div>
                    </div>
                    
                    <div className="flex justify-between pb-2 border-b border-gray-800">
                      <div className="text-sm text-gray-400">Color</div>
                      <div className="text-sm text-gray-200">{activeVehicle.color || 'N/A'}</div>
                    </div>
                    
                    <div className="flex justify-between pb-2 border-b border-gray-800">
                      <div className="text-sm text-gray-400">Tire Specs</div>
                      <div className="text-sm text-gray-200">{activeVehicle.tire_specs || 'N/A'}</div>
                    </div>
                    
                    <Link href={`/specs?vehicle=${activeVehicle.id}`}>
                      <a className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center mt-2">
                        View All Specifications
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedGarageVault;