import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Thermometer, Clock, Calendar, PieChart, AlertTriangle, TrendingUp, 
  ChevronRight, ChevronDown, ChevronUp, Gauge, Info, Fuel, Droplets, Battery, 
  Car, Maximize2, Zap, MapPin, Mountain, Wrench, Shield, Camera, Clipboard,
  Tool, ExternalLink, FileText, DownloadCloud, Target, Eye, Award, Truck,
  Settings, Sliders, Tag, Disc, CornerUpRight, CornerDownRight, Activity, FileBarChart
} from 'lucide-react';
import VehicleGallery from './VehicleGallery';
import TireTracker from './TireTracker';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { searchImage } from '../services/unsplashService';

/**
 * EnhancedVehicleDetail Component
 * A comprehensive vehicle detail view with expanded data visualization,
 * multiple image galleries, and extensive vehicle specifications.
 */
const EnhancedVehicleDetail = ({ vehicle, carMetrics, onImageSearch }) => {
  const [expandedSections, setExpandedSections] = useState({
    specifications: true,
    performance: false,
    dimensions: false,
    maintenance: true,
    images: true,
    documents: false,
    history: false,
  });
  
  const [activeGallery, setActiveGallery] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState(null);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [vehicleSpecifications, setVehicleSpecifications] = useState({});
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('exterior');
  
  // Image categories for the vehicle
  const IMAGE_CATEGORIES = [
    { id: 'exterior', label: 'Exterior', icon: <Car size={16} /> },
    { id: 'interior', label: 'Interior', icon: <Settings size={16} /> },
    { id: 'engine', label: 'Engine Bay', icon: <Zap size={16} /> },
    { id: 'wheels', label: 'Wheels & Tires', icon: <Disc size={16} /> },
    { id: 'modifications', label: 'Modifications', icon: <Tool size={16} /> },
    { id: 'damage', label: 'Damage Reports', icon: <AlertTriangle size={16} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
  ];
  
  useEffect(() => {
    if (!vehicle) return;
    
    // Load vehicle specifications (this would be replaced with real data)
    setVehicleSpecifications({
      general: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        trim: vehicle.trim || 'Standard',
        bodyStyle: vehicle.body_type || 'Sedan',
        transmission: vehicle.transmission_type || 'Automatic',
        drivetrain: vehicle.drivetrain || 'RWD',
        engine: vehicle.engine || '3.0L Inline-6 Turbo',
        fuelType: vehicle.fuel_type || 'Premium Unleaded',
        exteriorColor: vehicle.exterior_color || 'Black',
        interiorColor: vehicle.interior_color || 'Black',
        vin: vehicle.vin || 'WBA7E4C09KGF82445',
        licensePlate: vehicle.license_plate || '',
        productionDate: vehicle.production_date || '2023-03-15',
      },
      performance: {
        horsepower: vehicle.horsepower || 382,
        torque: vehicle.torque || 369,
        zeroToSixty: vehicle.zero_to_sixty || 4.4,
        topSpeed: vehicle.top_speed || 155,
        weight: vehicle.weight || 3968,
        weightDistribution: vehicle.weight_distribution || '50/50',
        dragCoefficient: vehicle.drag_coefficient || 0.27,
        fuelEconomy: {
          city: vehicle.fuel_economy_city || 22,
          highway: vehicle.fuel_economy_highway || 30,
          combined: vehicle.fuel_economy_combined || 25,
        },
        emissions: {
          co2: vehicle.emissions_co2 || 182,
          standard: vehicle.emissions_standard || 'Euro 6d',
        },
      },
      dimensions: {
        length: vehicle.length || 185.7,
        width: vehicle.width || 74.9,
        height: vehicle.height || 56.8,
        wheelbase: vehicle.wheelbase || 112.2,
        frontTrack: vehicle.front_track || 63.0,
        rearTrack: vehicle.rear_track || 63.7,
        groundClearance: vehicle.ground_clearance || 5.7,
        seatingCapacity: vehicle.seating_capacity || 5,
        cargoVolume: vehicle.cargo_volume || 17.0,
        fuelTankCapacity: vehicle.fuel_tank_capacity || 15.6,
        curbWeight: vehicle.curb_weight || 3968,
        grossWeight: vehicle.gross_weight || 5071,
      },
      tires: {
        frontSize: vehicle.tire_front_size || '225/45 R18',
        rearSize: vehicle.tire_rear_size || '255/40 R18',
        wheelSize: vehicle.wheel_size || '18 inches',
        tireBrand: vehicle.tire_brand || 'Michelin',
        tireModel: vehicle.tire_model || 'Pilot Sport 4S',
        tpmsType: vehicle.tpms_type || 'Direct',
        lastRotation: vehicle.last_tire_rotation || '2023-09-15',
        treadDepth: {
          frontLeft: 7.2,
          frontRight: 7.1,
          rearLeft: 7.4,
          rearRight: 7.3,
        },
      },
      electrical: {
        batteryType: vehicle.battery_type || 'AGM',
        batteryCapacity: vehicle.battery_capacity || '90Ah',
        alternatorOutput: vehicle.alternator_output || '180A',
        startingSystem: vehicle.starting_system || 'Remote Start Capable',
        electricalSystem: vehicle.electrical_system || '12V',
        headlightType: vehicle.headlight_type || 'LED Adaptive',
        tailLightType: vehicle.taillight_type || 'LED',
      },
      safety: {
        airbags: vehicle.airbags || 'Front, Side, Curtain, Knee',
        abs: vehicle.abs || 'Standard',
        stabilitySystems: vehicle.stability_systems || 'ESC, DSC, Traction Control',
        assistanceSystems: vehicle.assistance_systems || 'Lane Departure Warning, Blind Spot, Active Cruise',
        crashTestRating: vehicle.crash_test_rating || '5 Stars NHTSA',
        brakeType: vehicle.brake_type || 'Disc (F/R)',
        brakeSize: {
          front: vehicle.brake_size_front || '348mm',
          rear: vehicle.brake_size_rear || '345mm',
        },
      },
    });
    
    // Load maintenance history
    setMaintenanceHistory([
      {
        date: '2023-12-15',
        mileage: 12500,
        service: 'Oil Change',
        performed_by: 'Dealership',
        notes: 'Full synthetic 0W-30, OEM filter',
        parts: ['Oil Filter', 'Drain Plug Washer'],
        cost: 189.99,
      },
      {
        date: '2023-10-05',
        mileage: 10200,
        service: 'Tire Rotation',
        performed_by: 'Dealership',
        notes: 'All 4 tires rotated and balanced',
        parts: [],
        cost: 120.00,
      },
      {
        date: '2023-07-22',
        mileage: 7500,
        service: 'Brake Fluid Flush',
        performed_by: 'Independent Shop',
        notes: 'Complete brake fluid flush with DOT 4',
        parts: ['Brake Fluid'],
        cost: 210.50,
      },
      {
        date: '2023-03-15',
        mileage: 5000,
        service: 'First Service',
        performed_by: 'Dealership',
        notes: 'Inspection, oil change, fluid checks',
        parts: ['Oil Filter', 'Air Filter', 'Cabin Filter'],
        cost: 349.99,
      },
    ]);
    
    // Load images for the current vehicle
    loadVehicleImages();
  }, [vehicle]);
  
  // Load images for the vehicle (this would be replaced with real data)
  const loadVehicleImages = async () => {
    if (!vehicle) return;
    
    setLoadingImages(true);
    
    try {
      // In a real implementation, these would come from a database
      // For now, let's simulate image categories
      let query = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${selectedCategory}`;
      let images = [];
      
      // If we have access to the Unsplash API, use it for demo purposes
      if (onImageSearch) {
        const searchResults = await onImageSearch(query);
        if (searchResults && searchResults.length > 0) {
          images = searchResults.map((img, index) => ({
            id: `${selectedCategory}-${index}`,
            url: img.urls.regular,
            caption: `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${selectedCategory}`,
            date: new Date().toISOString().split('T')[0],
            location: 'Gallery',
            type: selectedCategory,
            photographer: img.user?.name || 'Unknown',
          }));
        }
      }
      
      // If no images from API or no API access, use fallbacks
      if (images.length === 0) {
        // Use default placeholder images based on category
        const placeholders = {
          exterior: [
            'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1050',
            'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1050'
          ],
          interior: [
            'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?q=80&w=1050',
            'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1050'
          ],
          engine: [
            'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?q=80&w=1050',
            'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=1050'
          ],
          wheels: [
            'https://images.unsplash.com/photo-1616789916437-bbf822a13089?q=80&w=1050',
            'https://images.unsplash.com/photo-1575345403474-0e8710d1f449?q=80&w=1050'
          ],
          modifications: [
            'https://images.unsplash.com/photo-1623998021446-45a51a0ada5c?q=80&w=1050',
            'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=1050'
          ],
          damage: [],
          documents: []
        };
        
        const placeholderImgs = placeholders[selectedCategory] || [];
        images = placeholderImgs.map((url, index) => ({
          id: `${selectedCategory}-${index}`,
          url,
          caption: `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${selectedCategory}`,
          date: new Date().toISOString().split('T')[0],
          location: 'Gallery',
          type: selectedCategory,
          photographer: 'Gallery',
        }));
      }
      
      setVehicleImages(images);
    } catch (error) {
      console.error('Error loading vehicle images:', error);
    } finally {
      setLoadingImages(false);
    }
  };
  
  useEffect(() => {
    loadVehicleImages();
  }, [selectedCategory]);
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Open full image gallery
  const openGallery = (filter = null) => {
    setGalleryFilter(filter);
    setActiveGallery('main');
  };
  
  // Format maintenance history for visualization
  const formatMaintenanceData = () => {
    if (!maintenanceHistory || maintenanceHistory.length === 0) {
      return [];
    }
    
    return maintenanceHistory
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(record => ({
        date: new Date(record.date).toLocaleDateString(),
        mileage: record.mileage,
        service: record.service,
        cost: record.cost
      }));
  };
  
  if (!vehicle) {
    return (
      <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="enhanced-vehicle-detail bg-black text-white">
      {/* Vehicle Header */}
      <div className="mb-6 p-6 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-orbitron text-blue-400 mb-2">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <div className="flex items-center">
                <Gauge className="mr-1 h-4 w-4 text-green-500" />
                <span>{carMetrics.mileage.toLocaleString()} miles</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4 text-blue-400" />
                <span>Last driven: {carMetrics.daysSinceLastDrive} days ago</span>
              </div>
              <div className="flex items-center">
                <Tool className="mr-1 h-4 w-4 text-yellow-500" />
                <span>Service: {carMetrics.nextServiceDue}</span>
              </div>
              <div className="flex items-center">
                <Activity className="mr-1 h-4 w-4 text-purple-400" />
                <span>Status: {carMetrics.carStatus}</span>
              </div>
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0 gap-2">
            <button 
              onClick={() => openGallery(null)}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm transition-colors"
            >
              <Camera size={16} className="mr-2" />
              <span>View All Photos</span>
            </button>
            <button 
              className="flex items-center px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white text-sm transition-colors"
            >
              <FileBarChart size={16} className="mr-2" />
              <span>Full Report</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vehicle Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Specifications Section */}
          <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleSection('specifications')}
            >
              <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
                <Info size={20} className="mr-2" />
                Vehicle Specifications
              </h2>
              <div>
                {expandedSections.specifications ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedSections.specifications && (
              <div className="p-4 border-t border-gray-800">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-3">General Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(vehicleSpecifications.general || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div 
                    className="flex justify-between items-center py-2 cursor-pointer"
                    onClick={() => toggleSection('performance')}
                  >
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Zap size={18} className="mr-2 text-yellow-500" />
                      Performance Specifications
                    </h3>
                    <div>
                      {expandedSections.performance ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                  
                  {expandedSections.performance && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(vehicleSpecifications.performance || {}).map(([key, value]) => {
                        if (typeof value === 'object') {
                          return (
                            <div key={key} className="bg-gray-800/40 p-3 rounded-lg">
                              <h4 className="text-blue-400 capitalize mb-2">{key.replace(/([A-Z])/g, ' $1')}</h4>
                              {Object.entries(value).map(([subKey, subValue]) => (
                                <div key={`${key}-${subKey}`} className="flex justify-between py-1">
                                  <span className="text-gray-400 capitalize">{subKey.replace(/([A-Z])/g, ' $1')}</span>
                                  <span className="text-white">{subValue}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        
                        return (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-800">
                            <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-white font-medium">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <div 
                    className="flex justify-between items-center py-2 cursor-pointer"
                    onClick={() => toggleSection('dimensions')}
                  >
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Maximize2 size={18} className="mr-2 text-purple-400" />
                      Dimensions & Capacity
                    </h3>
                    <div>
                      {expandedSections.dimensions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                  
                  {expandedSections.dimensions && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(vehicleSpecifications.dimensions || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-800">
                          <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold text-white flex items-center mb-3">
                      <Disc size={18} className="mr-2 text-blue-400" />
                      Tire Specifications
                    </h3>
                    
                    {Object.entries(vehicleSpecifications.tires || {}).map(([key, value]) => {
                      if (key === 'treadDepth' && typeof value === 'object') {
                        return (
                          <div key={key} className="mt-3">
                            <h4 className="text-sm text-gray-400 mb-2">Tread Depth (mm)</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(value).map(([position, depth]) => (
                                <div key={position} className="bg-gray-800/50 rounded p-2 text-center">
                                  <div className="text-xs text-gray-500 mb-1 capitalize">
                                    {position.replace(/([A-Z])/g, ' $1')}
                                  </div>
                                  <div className="text-lg font-medium text-white">{depth}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-800">
                          <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-white">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold text-white flex items-center mb-3">
                      <Shield size={18} className="mr-2 text-green-500" />
                      Safety Features
                    </h3>
                    
                    {Object.entries(vehicleSpecifications.safety || {}).map(([key, value]) => {
                      if (typeof value === 'object') {
                        return (
                          <div key={key} className="mt-3">
                            <h4 className="text-sm text-gray-400 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(value).map(([subKey, subValue]) => (
                                <div key={`${key}-${subKey}`} className="flex justify-between py-1">
                                  <span className="text-gray-400 capitalize">{subKey}</span>
                                  <span className="text-white">{subValue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-800">
                          <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-white">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Maintenance History Section */}
          <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleSection('maintenance')}
            >
              <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
                <Wrench size={20} className="mr-2" />
                Maintenance History
              </h2>
              <div>
                {expandedSections.maintenance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedSections.maintenance && (
              <div className="p-4 border-t border-gray-800">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Service Timeline</h3>
                  
                  <div className="h-60 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={formatMaintenanceData()}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                        <XAxis 
                          dataKey="date" 
                          tick={{fill: '#999', fontSize: 10}}
                          axisLine={{ stroke: '#333' }}
                        />
                        <YAxis 
                          dataKey="mileage" 
                          stroke="#666" 
                          tick={{fill: '#999', fontSize: 10}}
                          axisLine={{ stroke: '#333' }}
                          tickLine={{ stroke: '#333' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(10, 10, 10, 0.9)',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            color: '#fff',
                            fontFamily: 'monospace'
                          }}
                          formatter={(value, name) => {
                            if (name === 'cost') return ['$' + value, 'Cost'];
                            if (name === 'mileage') return [value.toLocaleString(), 'Mileage'];
                            return [value, name];
                          }}
                          labelFormatter={(date) => `Date: ${date}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="mileage" 
                          stroke="#3b82f6" 
                          dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cost" 
                          stroke="#10b981" 
                          dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-transparent">
                      <thead>
                        <tr className="bg-gray-800/50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mileage</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Performed By</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cost</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {maintenanceHistory.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{record.date}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{record.mileage.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{record.service}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{record.performed_by}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-white">${record.cost.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-white">{record.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center">
                      <DownloadCloud size={16} className="mr-2" />
                      Export History
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Galleries & Quick Stats */}
        <div className="space-y-6">
          {/* Vehicle Images Section */}
          <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleSection('images')}
            >
              <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
                <Camera size={20} className="mr-2" />
                Vehicle Images
              </h2>
              <div>
                {expandedSections.images ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedSections.images && (
              <div className="p-4 border-t border-gray-800">
                <div className="flex flex-wrap gap-2 mb-4">
                  {IMAGE_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-1 text-xs rounded-full whitespace-nowrap flex items-center gap-1 ${
                        selectedCategory === category.id 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
                
                {loadingImages ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : vehicleImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {vehicleImages.slice(0, 4).map((image, index) => (
                      <div 
                        key={image.id} 
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                        onClick={() => openGallery(selectedCategory)}
                      >
                        <img 
                          src={image.url} 
                          alt={image.caption || `Vehicle image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                          <div className="text-white text-xs truncate">{image.caption}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-gray-700 rounded-lg">
                    <Camera size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">No images available for this category</p>
                    <button className="mt-4 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-md">
                      Upload Images
                    </button>
                  </div>
                )}
                
                {vehicleImages.length > 4 && (
                  <div className="mt-2 text-right">
                    <button 
                      onClick={() => openGallery(selectedCategory)}
                      className="text-blue-400 text-sm hover:text-blue-300 flex items-center ml-auto"
                    >
                      View all {vehicleImages.length} images
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Current Vehicle Health */}
          <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-xl font-orbitron text-blue-400 flex items-center mb-4">
                <Activity size={20} className="mr-2" />
                Vehicle Health
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Fuel Level</span>
                    <span className="text-sm text-white">{carMetrics.fuelLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${carMetrics.fuelLevel}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Battery Health</span>
                    <span className="text-sm text-white">{carMetrics.batteryHealth}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        carMetrics.batteryHealth > 80 ? 'bg-green-500' : 
                        carMetrics.batteryHealth > 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${carMetrics.batteryHealth}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Oil Life Remaining</span>
                    <span className="text-sm text-white">{carMetrics.oilLifeRemaining}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        carMetrics.oilLifeRemaining > 70 ? 'bg-green-500' : 
                        carMetrics.oilLifeRemaining > 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${carMetrics.oilLifeRemaining}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Gloss Index</span>
                    <span className="text-sm text-white">{carMetrics.glossIndex}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${carMetrics.glossIndex}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Tire Status</h3>
                <TireTracker 
                  tirePressure={carMetrics.tirePressure}
                  idealPressure={{
                    frontLeft: 35,
                    frontRight: 35,
                    rearLeft: 35,
                    rearRight: 35
                  }}
                  vehicle={vehicle}
                />
              </div>
            </div>
          </div>
          
          {/* Documents Section */}
          <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleSection('documents')}
            >
              <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
                <FileText size={20} className="mr-2" />
                Documents & Records
              </h2>
              <div>
                {expandedSections.documents ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedSections.documents && (
              <div className="p-4 border-t border-gray-800">
                <ul className="divide-y divide-gray-800">
                  <li className="py-3">
                    <a href="#" className="flex items-center hover:text-blue-400">
                      <FileText size={16} className="mr-3 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-white">Owner's Manual</p>
                        <p className="text-xs text-gray-500">PDF • 12.5 MB</p>
                      </div>
                      <DownloadCloud size={16} />
                    </a>
                  </li>
                  <li className="py-3">
                    <a href="#" className="flex items-center hover:text-blue-400">
                      <FileText size={16} className="mr-3 text-green-500" />
                      <div className="flex-1">
                        <p className="text-white">Service History</p>
                        <p className="text-xs text-gray-500">PDF • 2.3 MB</p>
                      </div>
                      <DownloadCloud size={16} />
                    </a>
                  </li>
                  <li className="py-3">
                    <a href="#" className="flex items-center hover:text-blue-400">
                      <FileText size={16} className="mr-3 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-white">Vehicle Registration</p>
                        <p className="text-xs text-gray-500">PDF • 1.1 MB</p>
                      </div>
                      <DownloadCloud size={16} />
                    </a>
                  </li>
                  <li className="py-3">
                    <a href="#" className="flex items-center hover:text-blue-400">
                      <FileText size={16} className="mr-3 text-purple-500" />
                      <div className="flex-1">
                        <p className="text-white">Insurance Documents</p>
                        <p className="text-xs text-gray-500">PDF • 3.7 MB</p>
                      </div>
                      <DownloadCloud size={16} />
                    </a>
                  </li>
                </ul>
                
                <div className="mt-4">
                  <button className="w-full py-2 text-center border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500">
                    + Upload Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Full image gallery modal */}
      {activeGallery === 'main' && (
        <div className="fixed inset-0 z-50">
          <VehicleGallery 
            vehicle={vehicle} 
            initialFilter={galleryFilter}
            onClose={() => setActiveGallery(null)}
            isFullscreen={true}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedVehicleDetail;