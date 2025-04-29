import React, { useState, useEffect } from 'react';
import { 
  Watch, Clock, Calendar, AlertTriangle, CheckCircle, 
  RefreshCw, FileText, ClipboardCheck, Settings, Wrench as Tool, 
  DollarSign, Package, Shield, BarChart, Battery, Droplet, Activity, Info,
  PlusCircle, Circle, Trending, MapPin, History, Eye, Save,
  RotateCcw, CircleCheck, SaveIcon, LocateFixed
} from 'lucide-react';
import EditableTelemetry from './EditableTelemetry';
import timepieceDataService from '../services/timepieceDataService';
import ProgressSparkline from './ProgressSparkline';

/**
 * TimepieceTelemetry Component
 * 
 * Specialized telemetry display for luxury timepieces with editable fields,
 * maintenance tracking, and value analytics.
 * 
 * @param {Object} props Component props
 * @param {String} props.timepieceId ID of the timepiece to display data for
 * @param {Boolean} props.editMode Whether the component starts in edit mode
 * @param {Function} props.onUpdate Callback when timepiece data is updated
 * @param {String} props.className Additional CSS classes
 * @param {Boolean} props.compact Whether to display in compact mode
 */
function TimepieceTelemetry({
  timepieceId,
  editMode = false,
  onUpdate = () => {},
  className = '',
  compact = false
}) {
  const useTimepieceStore = timepieceDataService.useTimepieceStore;
  
  // Get timepiece data from the store
  const timepiece = useTimepieceStore(state => 
    state.timepieces.find(t => t.id === timepieceId) || null
  );
  
  const updateTimepiece = useTimepieceStore(state => state.updateTimepiece);
  
  // Timepiece service status
  const serviceStatus = timepiece ? timepieceDataService.getServiceStatus(timepiece) : 'unknown';
  
  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [telemetryData, setTelemetryData] = useState({});
  const [valueHistory, setValueHistory] = useState([]);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  
  // Prepare data for the EditableTelemetry component
  useEffect(() => {
    if (!timepiece) {
      setTelemetryData({});
      return;
    }
    
    // Build the data structure for telemetry
    const data = {
      basicInfo: {
        brand: timepiece.brand,
        model: timepiece.model,
        reference: timepiece.reference,
        year: timepiece.year,
        type: timepiece.type
      },
      specifications: {
        caseMaterial: timepiece.caseMaterial,
        caseSize: timepiece.caseSize,
        dialColor: timepiece.dialColor,
        braceletMaterial: timepiece.braceletMaterial,
        movement: timepiece.movement,
        waterResistance: timepiece.waterResistance,
        powerReserve: timepiece.powerReserve
      },
      ownership: {
        isOwned: timepiece.isOwned,
        purchaseDate: timepiece.purchaseDate,
        purchasePrice: timepiece.purchasePrice || 0,
        currentMarketValue: timepiece.marketValue || 0,
        purchaseLocation: timepiece.purchaseLocation || '',
        serialNumber: timepiece.serialNumber || '',
        condition: timepiece.condition || 'Excellent'
      },
      documentation: {
        hasBox: timepiece.hasBox || false,
        hasPapers: timepiece.hasPapers || false,
        hasWarrantyCard: timepiece.hasWarrantyCard || false,
        hasCertificate: timepiece.hasCertificate || false
      },
      maintenance: {
        lastService: timepiece.lastService,
        nextService: timepiece.nextService,
        recommendedServiceInterval: timepiece.recommendedServiceInterval || "5-7 years",
        lastAccuracyCheck: timepiece.lastAccuracyCheck || null,
        dailyRateVariation: timepiece.dailyRateVariation || "+/- 2 seconds",
        powerReserveActual: timepiece.powerReserveActual || timepiece.powerReserve
      }
    };
    
    if (!timepiece.isOwned) {
      data.acquisition = {
        targetPrice: timepiece.targetPrice || 0,
        progressToGoal: timepiece.progressToGoal || 0,
        targetDate: timepiece.targetDate || '',
        retailPrice: timepiece.retailPrice || 0,
        greyMarketPrice: timepiece.greyMarketPrice || 0
      };
    }
    
    setTelemetryData(data);
    
    // Generate value history data with realistic patterns
    generateValueHistory(timepiece);
  }, [timepiece]);
  
  // Generate mock value history for the timepiece
  const generateValueHistory = (timepiece) => {
    if (!timepiece) return;
    
    const data = [];
    const now = new Date();
    let currentValue = timepiece.marketValue || 30000;
    const volatility = 0.02; // 2% volatility
    
    // Generate 24 months of data
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      
      // Add some randomness but with an overall trend based on the type of watch
      const trend = timepiece.brand === 'Patek Philippe' ? 1.003 : // Slight upward trend
                    timepiece.brand === 'Rolex' ? 1.005 : // Stronger upward trend
                    0.998; // Slight downward trend
      
      // Apply the trend and some randomness
      currentValue = currentValue * trend * (1 + (Math.random() * volatility * 2 - volatility));
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(currentValue)
      });
    }
    
    setValueHistory(data);
  };
  
  // Handle telemetry data updates
  const handleTelemetryUpdate = (updatedData, changes) => {
    // Extract the updates from the nested structure
    const timepieceUpdates = {};
    
    // Process each section of changes
    Object.keys(updatedData).forEach(section => {
      // Copy all fields directly to the timepiece updates
      Object.keys(updatedData[section]).forEach(field => {
        timepieceUpdates[field] = updatedData[section][field];
      });
    });
    
    // Update the timepiece in the store
    if (Object.keys(timepieceUpdates).length > 0) {
      updateTimepiece(timepieceId, timepieceUpdates);
      onUpdate(timepieceUpdates);
    }
  };
  
  // Calculate service status indicator color
  const getServiceStatusColor = () => {
    if (!timepiece || !timepiece.lastService) return 'gray';
    
    switch (serviceStatus) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'due soon': return 'yellow';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };
  
  // Get accuracy score based on daily rate variation
  const getAccuracyScore = () => {
    if (!timepiece || !timepiece.dailyRateVariation) return 80;
    
    // Parse the variation string like "+/- 2 seconds"
    const match = timepiece.dailyRateVariation.match(/\d+/);
    if (!match) return 80;
    
    const variation = parseInt(match[0], 10);
    
    // Scale: 1 sec = 95%, 2 sec = 90%, 5 sec = 70%, 10+ sec = 50% or less
    if (variation <= 1) return 95;
    if (variation <= 2) return 90;
    if (variation <= 3) return 85;
    if (variation <= 5) return 70;
    if (variation <= 10) return 50;
    return Math.max(30, 100 - variation * 5); // Minimum 30%
  };
  
  if (!timepiece) {
    return (
      <div className={`${className} apex-card p-6 text-center`}>
        <Watch className="mx-auto h-12 w-12 text-gray-600 mb-3" />
        <p className="text-gray-400">Timepiece not found</p>
      </div>
    );
  }
  
  // Compact view
  if (compact) {
    return (
      <div className={`${className} apex-card p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-orbitron text-blue-400 text-lg">Timepiece Telemetry</h3>
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" /> {timepieceDataService.getTimepieceFullName(timepiece)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <div className="text-gray-400 text-xs mb-1">Service Status</div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full bg-${getServiceStatusColor()}-500 mr-2`}></div>
              <div className="text-white capitalize">{serviceStatus}</div>
            </div>
            
            {timepiece.lastService && (
              <div className="text-gray-500 text-xs mt-1">
                Last service: {new Date(timepiece.lastService).toLocaleDateString()}
              </div>
            )}
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <div className="text-gray-400 text-xs mb-1">Accuracy</div>
            <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-green-500" 
                style={{ width: `${getAccuracyScore()}%` }}
              ></div>
            </div>
            <div className="text-white text-xs mt-1">
              {timepiece.dailyRateVariation || "+/- 2 seconds/day"}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <div className="text-gray-400 text-xs mb-1">Market Value</div>
            <div className="text-white font-medium">
              ${timepiece.marketValue?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-xs text-green-400 mt-1">
              +3.2% (Last 12 months)
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Full detailed view
  return (
    <div className={`${className} flex flex-col space-y-6`}>
      {/* Timepiece Header - Enhanced with Key Shopping Data */}
      <div className="apex-card p-6 bg-gradient-to-br from-gray-900 to-gray-900/40">
        {/* Timepiece Identity - Vital Data for Shoppers */}
        <div className="mb-4 bg-black/30 border border-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-blue-400 font-medium">Timepiece Identity</h3>
            <div className="bg-blue-900/30 px-2 py-0.5 rounded text-xs text-blue-300 border border-blue-800">
              Authenticated & Verified
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Brand</div>
              <div className="text-xl font-bold text-blue-400">{timepiece.brand}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Model</div>
              <div className="text-xl font-bold text-white">{timepiece.model}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Reference No.</div>
              <div className="text-xl font-bold text-blue-300">{timepiece.reference}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Year Manufactured</div>
              <div className="text-xl font-bold text-amber-300">{timepiece.year || "2021"}</div>
            </div>
          </div>
          
          {/* Serial Number and Authentication Details - Highlighted for Shoppers */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 md:col-span-1 flex flex-col bg-purple-900/10 p-3 border border-purple-800/40 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Serial Number (VIN)</div>
                  <div className="bg-purple-900/30 px-2 py-0.5 rounded-full text-xs text-purple-300 border border-purple-800/50">
                    Verified
                  </div>
                </div>
                <div className="text-xl font-bold text-purple-300 font-mono tracking-wide">{timepiece.serialNumber || "5711/1A-014-8742913"}</div>
                <div className="mt-1 text-xs text-gray-400 flex items-center">
                  <Shield className="h-3 w-3 mr-1 text-purple-400" />
                  <span className="text-purple-300">Blockchain Authenticated</span>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 bg-black/20 rounded-lg p-3 border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Production Details</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Production Batch</div>
                    <div className="text-sm text-white font-medium">{timepiece.productionBatch || "Series 4/B21"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Factory Location</div>
                    <div className="text-sm text-white font-medium">{timepiece.factoryLocation || "Geneva, CH"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Registration Date</div>
                    <div className="text-sm text-white font-medium">{timepiece.registrationDate || "10/15/2021"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Movement Number</div>
                    <div className="text-sm text-white font-medium font-mono">{timepiece.movementNumber || "324 SC-3846"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Case Hallmarks</div>
                    <div className="text-sm text-white font-medium">{timepiece.caseHallmarks || "750 / 18K"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Limited Edition</div>
                    <div className="text-sm text-white font-medium">{timepiece.limitedEdition ? `#${timepiece.limitedEditionNumber} of ${timepiece.limitedEditionTotal}` : "Standard Production"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-1">
              <h2 className="font-orbitron text-2xl text-blue-400">{timepiece.brand} {timepiece.model}</h2>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-sm border border-blue-700/50 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {timepiece.year}
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-sm border border-purple-700/50 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Certified Authentic
                </span>
              </div>
            </div>
            
            {/* Timepiece Identity Block - Similar to VIN for cars */}
            <div className="mt-2 mb-3 p-3 bg-black/40 border border-gray-800 rounded-md">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 uppercase">Serial Number</span>
                    <span className="text-xs text-purple-400">Verified ✓</span>
                  </div>
                  <div className="font-mono text-base text-white font-medium tracking-wide mt-1">
                    {timepiece.serialNumber || "P5711-N-31457892"}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 uppercase">Model Number</span>
                    <span className="text-xs text-purple-400">Factory Match ✓</span>
                  </div>
                  <div className="font-mono text-base text-white font-medium tracking-wide mt-1">
                    {timepiece.reference || "5711/1A-014"}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase">Manufacture Date</span>
                  <div className="font-mono text-base text-white font-medium mt-1">
                    {timepiece.manufactureDateFull || `${timepiece.year} (Week 37)`}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase">Movement Number</span>
                  <div className="font-mono text-base text-white font-medium mt-1">
                    {timepiece.movementNumber || "3255-0721-SG"}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-700/30">
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 uppercase">Production Numbers</span>
                    <span className="text-xs text-amber-400">Limited Edition</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-white text-sm">{timepiece.totalProduction || "3,600"} units produced</span>
                    <span className="text-xs bg-black/30 px-2 py-1 rounded border border-gray-700">
                      {timepiece.productionYears || "2017-2021"}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 uppercase">Rarity Rating</span>
                    <span className="text-xs text-amber-400">Trending ↑</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <svg key={i} className={`w-4 h-4 ${i <= (timepiece.rarityRating || 4.5) ? 'text-amber-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-white text-sm ml-2">{timepiece.rarityRating || "4.5"}/5.0</span>
                  </div>
                </div>
              </div>
              
              {/* Materials Block */}
              <div className="mt-3 pt-3 border-t border-gray-700/30">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-500 uppercase">Construction Details</span>
                  <span className="text-xs text-blue-400">Premium Materials</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-400">Case</span>
                    <div className="text-sm text-white">{timepiece.caseMaterialDetailed || "Stainless Steel 904L"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Bezel</span>
                    <div className="text-sm text-white">{timepiece.bezelMaterial || "Polished Stainless Steel"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Dial</span>
                    <div className="text-sm text-white">{timepiece.dialMaterial || "Olive Green, Brass"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Crystal</span>
                    <div className="text-sm text-white">{timepiece.crystalMaterial || "Sapphire, AR Coating"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Movement</span>
                    <div className="text-sm text-white">{timepiece.movementDetailed || "Caliber 26‑330 S C, Automatic"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Bracelet</span>
                    <div className="text-sm text-white">{timepiece.braceletMaterial || "Stainless Steel 904L"}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-700/30 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Authentication via <span className="text-blue-400">Manufacturer Database</span>
                </span>
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                  <Search className="h-3 w-3 mr-1" />
                  Verify Authenticity
                </button>
              </div>
            </div>
            
            <p className="text-gray-400 mb-2">
              <span className="font-semibold text-white">Type:</span> {timepiece.type} •
              <span className="font-semibold text-white ml-2">Market Value:</span> ${timepiece.marketValue?.toLocaleString() || 'N/A'} •
              <span className="font-semibold text-white ml-2">Origin:</span> {timepiece.countryOfOrigin || 'Switzerland'}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/40 text-purple-200 border border-purple-700">
                <Clock className="h-3 w-3 mr-1" />
                {timepiece.movement}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/40 text-green-200 border border-green-700">
                <Droplet className="h-3 w-3 mr-1" />
                {timepiece.waterResistance}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/40 text-amber-200 border border-amber-700">
                <Package className="h-3 w-3 mr-1" />
                {timepiece.caseMaterial}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/40 text-red-200 border border-red-700">
                <Battery className="h-3 w-3 mr-1" />
                {timepiece.powerReserve}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/40 text-blue-200 border border-blue-700">
                <Award className="h-3 w-3 mr-1" />
                {timepiece.certification || "COSC Certified"}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded-md ${activeTab === 'overview' 
                ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white border border-blue-500 shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <span className="flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Overview
              </span>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-3 py-1 rounded-md ${activeTab === 'maintenance' 
                ? 'bg-gradient-to-r from-green-700 to-green-900 text-white border border-green-500 shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <span className="flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                Maintenance
              </span>
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 py-1 rounded-md ${activeTab === 'market' 
                ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-white border border-amber-500 shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Market
              </span>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-3 py-1 rounded-md ${activeTab === 'performance' 
                ? 'bg-gradient-to-r from-purple-700 to-purple-900 text-white border border-purple-500 shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <span className="flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                Performance
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Provenance - Like a VIN report for a timepiece */}
          <div className="apex-card p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-orbitron text-lg text-purple-400 mb-1">Provenance History</h3>
                <p className="text-gray-400 text-sm">Complete ownership and service history</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-purple-900/30 px-3 py-1 rounded text-sm text-purple-300 border border-purple-800/50 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Blockchain Verified
                </div>
                <div className="bg-green-900/30 px-3 py-1 rounded text-sm text-green-300 border border-green-800/50 flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  2 Owners
                </div>
              </div>
            </div>
            
            <div className="relative mb-4">
              {/* Timeline track */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
              
              {/* History points */}
              <div className="space-y-6 ml-10 relative">
                {/* Current Owner */}
                <div className="relative">
                  <div className="absolute -left-10 mt-1">
                    <div className="w-6 h-6 bg-purple-500 border-4 border-gray-900 rounded-full"></div>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h5 className="text-purple-400 font-medium">Current Owner</h5>
                        <p className="text-gray-300 text-sm mt-1">
                          {timepiece.currentOwner || "Since April 15, 2022"}
                        </p>
                      </div>
                      <div className="bg-black/30 px-3 py-1 rounded border border-gray-700 text-gray-400 text-sm">
                        Ownership: {timepiece.ownershipDuration || "1 year, 2 months"}
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Purchase Location</div>
                        <div className="text-sm text-white">{timepiece.purchaseLocation || "Authorized Dealer - Phillips"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Documentation</div>
                        <div className="text-sm text-white">Full Set (Box & Papers)</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Authentication</div>
                        <div className="text-sm text-white">Manufacturer Certified</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Previous Owner */}
                <div className="relative">
                  <div className="absolute -left-10 mt-1">
                    <div className="w-6 h-6 bg-blue-500 border-4 border-gray-900 rounded-full"></div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h5 className="text-blue-400 font-medium">Previous Owner</h5>
                        <p className="text-gray-300 text-sm mt-1">August 2018 - March 2022</p>
                      </div>
                      <div className="bg-black/30 px-3 py-1 rounded border border-gray-700 text-gray-400 text-sm">
                        Ownership: 3 years, 7 months
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Purchase Type</div>
                        <div className="text-sm text-white">First Owner</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Service History</div>
                        <div className="text-sm text-white">2 Factory Services</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Condition at Sale</div>
                        <div className="text-sm text-white">Excellent (95%)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Manufacture Date */}
                <div className="relative">
                  <div className="absolute -left-10 mt-1">
                    <div className="w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full"></div>
                  </div>
                  <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h5 className="text-green-400 font-medium">Manufacturer Production</h5>
                        <p className="text-gray-300 text-sm mt-1">
                          {timepiece.manufactureDateFull || "July 2018"}
                        </p>
                      </div>
                      <div className="bg-black/30 px-3 py-1 rounded border border-gray-700 text-gray-400 text-sm">
                        Basel, Switzerland
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Original Retail</div>
                        <div className="text-sm text-white">${timepiece.originalRetailPrice?.toLocaleString() || "35,000"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Factory Testing</div>
                        <div className="text-sm text-white">COSC Chronometer Certified</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Quality Control</div>
                        <div className="text-sm text-white">Master Watchmaker #26</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableTelemetry
              data={{
                basicInfo: telemetryData.basicInfo,
                specifications: telemetryData.specifications
              }}
              title="Specifications"
              theme="blue"
              onSave={handleTelemetryUpdate}
            />
            
            <EditableTelemetry
              data={{
                ownership: telemetryData.ownership,
                documentation: telemetryData.documentation
              }}
              title="Ownership & Documentation"
              theme="green"
              onSave={handleTelemetryUpdate}
            />
          </div>
          
          {/* Core Metrics */}
          <div className="apex-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-orbitron text-lg text-blue-400">Core Metrics</h3>
              <button 
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                className="text-sm text-blue-400"
              >
                {showAdvancedMetrics ? 'Hide Advanced Metrics' : 'Show Advanced Metrics'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Service Status */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 flex items-center">
                    <Tool className="h-4 w-4 mr-1" /> Service Status
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full bg-${getServiceStatusColor()}-500`}></span>
                  </div>
                </div>
                
                <div className="flex items-center mb-1">
                  <div className="text-lg font-medium text-white capitalize">{serviceStatus}</div>
                </div>
                
                <div className="text-sm">
                  {timepiece.lastService ? (
                    <>
                      <div className="text-gray-400">
                        Last serviced {new Date(timepiece.lastService).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {timepiece.nextService 
                          ? `Next service due ${new Date(timepiece.nextService).toLocaleDateString()}`
                          : 'Recommended service interval: 5-7 years'}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">No service history recorded</div>
                  )}
                </div>
              </div>
              
              {/* Accuracy */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> Accuracy
                  </div>
                  <div className="text-sm text-gray-400">
                    {getAccuracyScore()}%
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full ${
                        getAccuracyScore() > 90 ? 'bg-green-500' :
                        getAccuracyScore() > 70 ? 'bg-blue-500' :
                        getAccuracyScore() > 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${getAccuracyScore()}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-white">
                  {timepiece.dailyRateVariation || "+/- 2 seconds/day"}
                </div>
                
                <div className="text-gray-500 text-xs mt-1">
                  {timepiece.lastAccuracyCheck 
                    ? `Last checked on ${new Date(timepiece.lastAccuracyCheck).toLocaleDateString()}`
                    : 'No accuracy check recorded'}
                </div>
              </div>
              
              {/* Power Reserve */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 flex items-center">
                    <Battery className="h-4 w-4 mr-1" /> Power Reserve
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-lg font-medium text-white">
                    {timepiece.powerReserve || '40 hours'}
                  </div>
                </div>
                
                <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-500"
                    style={{ width: '100%' }}
                  ></div>
                </div>
                
                <div className="text-gray-400 text-sm">
                  {timepiece.powerReserveActual === timepiece.powerReserve 
                    ? 'Matches manufacturer specifications'
                    : `Actual: ${timepiece.powerReserveActual || timepiece.powerReserve}`}
                </div>
              </div>
            </div>
            
            {showAdvancedMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Water Resistance */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-gray-400 flex items-center">
                      <Droplet className="h-4 w-4 mr-1" /> Water Resistance
                    </div>
                  </div>
                  
                  <div className="text-lg font-medium text-white mb-1">
                    {timepiece.waterResistance || '100m'}
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    {timepiece.waterResistanceTested ? 'Pressure tested' : 'Factory specifications'}
                  </div>
                  
                  <div className="text-gray-500 text-xs mt-2">
                    <div className="flex items-start">
                      <Info className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                      Water resistance should be tested every 2-3 years or before water exposure
                    </div>
                  </div>
                </div>
                
                {/* Magnetism */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-gray-400 flex items-center">
                      <Activity className="h-4 w-4 mr-1" /> Magnetic Resistance
                    </div>
                  </div>
                  
                  <div className="text-lg font-medium text-white mb-1">
                    {timepiece.magneticResistance || '4,800 A/m'}
                  </div>
                  
                  <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-500"
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                  
                  <div className="text-gray-500 text-xs mt-1">
                    <div className="flex items-start">
                      <Info className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                      Moderate resistance to everyday magnetic fields
                    </div>
                  </div>
                </div>
                
                {/* Movement Grade */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-gray-400 flex items-center">
                      <Settings className="h-4 w-4 mr-1" /> Movement Grade
                    </div>
                  </div>
                  
                  <div className="text-lg font-medium text-white mb-1">
                    {timepiece.movementGrade || 'COSC Certified'}
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    {timepiece.movement || 'Caliber 3135'}
                  </div>
                  
                  <div className="text-gray-500 text-xs mt-2">
                    Chronometer certification requirements: -4/+6 seconds per day
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Acquisition Info (for dream timepieces) */}
          {!timepiece.isOwned && telemetryData.acquisition && (
            <EditableTelemetry
              data={{ acquisition: telemetryData.acquisition }}
              title="Acquisition Tracking"
              theme="amber"
              onSave={handleTelemetryUpdate}
            />
          )}
        </div>
      )}
      
      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Maintenance Summary */}
          <div className="apex-card p-6">
            <h3 className="font-orbitron text-lg text-blue-400 mb-4">Maintenance Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  serviceStatus === 'excellent' ? 'bg-green-900/20 text-green-400' :
                  serviceStatus === 'good' ? 'bg-blue-900/20 text-blue-400' :
                  serviceStatus === 'due soon' ? 'bg-yellow-900/20 text-yellow-400' :
                  serviceStatus === 'overdue' ? 'bg-red-900/20 text-red-400' :
                  'bg-gray-900/20 text-gray-400'
                }`}>
                  {serviceStatus === 'excellent' || serviceStatus === 'good' ? 
                    <CheckCircle className="h-6 w-6" /> :
                    serviceStatus === 'due soon' || serviceStatus === 'overdue' ?
                    <AlertTriangle className="h-6 w-6" /> :
                    <Clock className="h-6 w-6" />
                  }
                </div>
                
                <div>
                  <div className="text-white font-medium capitalize">{serviceStatus}</div>
                  <div className="text-gray-400 text-sm">Service Status</div>
                  
                  {timepiece.lastService && (
                    <div className="text-gray-500 text-xs mt-1">
                      Last service: {new Date(timepiece.lastService).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="text-white font-medium mb-1">Next Service Due</div>
                
                {timepiece.nextService ? (
                  <>
                    <div className="text-lg font-medium">
                      {new Date(timepiece.nextService).toLocaleDateString()}
                    </div>
                    
                    <div className="text-gray-400 text-sm mt-1">
                      {(() => {
                        const now = new Date();
                        const nextService = new Date(timepiece.nextService);
                        const diffDays = Math.ceil((nextService - now) / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) {
                          return `Overdue by ${Math.abs(diffDays)} days`;
                        } else if (diffDays === 0) {
                          return 'Due today';
                        } else if (diffDays <= 30) {
                          return `Due in ${diffDays} days`;
                        } else if (diffDays <= 365) {
                          return `Due in ${Math.ceil(diffDays / 30)} months`;
                        } else {
                          return `Due in ${Math.ceil(diffDays / 365)} years`;
                        }
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400">
                    Not scheduled
                    <div className="text-gray-500 text-xs mt-1">
                      Recommended interval: {timepiece.recommendedServiceInterval || "5-7 years"}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="text-white font-medium mb-1">Service History</div>
                
                {timepiece.serviceHistory && timepiece.serviceHistory.length > 0 ? (
                  <div>
                    <div className="text-lg font-medium">
                      {timepiece.serviceHistory.length} records
                    </div>
                    <button className="text-blue-400 text-sm hover:text-blue-300 mt-2">
                      View Complete History
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    No service records
                    <button className="text-blue-400 text-sm block hover:text-blue-300 mt-2">
                      Add Service Record
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Maintenance Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <h4 className="text-white font-medium mb-3">Recommended Maintenance</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-black/30 p-2 rounded">
                    <div className="flex items-center">
                      <RefreshCw className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-gray-200">Complete Service</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {timepiece.lastService ? 'Due in 2 years' : 'Recommended'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-black/30 p-2 rounded">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-gray-200">Accuracy Check</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {timepiece.lastAccuracyCheck ? 'Due in 6 months' : 'Recommended'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-black/30 p-2 rounded">
                    <div className="flex items-center">
                      <Droplet className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-gray-200">Water Resistance Test</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {timepiece.waterResistanceTested ? 'Due in 1 year' : 'Recommended'}
                    </div>
                  </div>
                </div>
                
                <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white rounded p-2 text-sm">
                  Schedule Maintenance
                </button>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <h4 className="text-white font-medium mb-3">Maintenance Log</h4>
                
                <div className="max-h-60 overflow-y-auto pr-2">
                  {timepiece.serviceHistory && timepiece.serviceHistory.length > 0 ? (
                    <div className="space-y-3">
                      {timepiece.serviceHistory.map((service, index) => (
                        <div key={index} className="border-b border-gray-800 pb-2">
                          <div className="flex justify-between">
                            <div className="text-white">{service.type}</div>
                            <div className="text-gray-400 text-sm">
                              {new Date(service.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-gray-500 text-xs mt-1">{service.notes}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardCheck className="h-10 w-10 mx-auto mb-2 text-gray-700" />
                      <p>No maintenance records yet</p>
                      <p className="text-xs mt-1">Add records to track service history</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-green-900/20 hover:bg-green-900/30 text-green-400 border border-green-900/30 rounded p-2 text-sm">
                    Add Record
                  </button>
                  <button className="flex-1 bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 border border-blue-900/30 rounded p-2 text-sm">
                    Export History
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Editable Maintenance Data */}
          <EditableTelemetry
            data={{ maintenance: telemetryData.maintenance }}
            title="Maintenance Details"
            theme="blue"
            onSave={handleTelemetryUpdate}
          />
        </div>
      )}
      
      {/* Market Tab - Enhanced with Global Rarity Indicators */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {/* Market Value */}
          <div className="apex-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-orbitron text-lg text-green-400">Market Value Tracking</h3>
              <div className="text-green-400 text-sm">+3.2% (Last 12 months)</div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 mb-6">
              <div className="mb-4">
                <div className="text-gray-400 text-sm mb-1">Current Market Value</div>
                <div className="text-3xl font-medium text-white">
                  ${(timepiece.marketValue || 35000).toLocaleString()}
                </div>
                {timepiece.isOwned && timepiece.purchasePrice && (
                  <div className="text-green-400 text-sm mt-1">
                    {timepiece.marketValue > timepiece.purchasePrice 
                      ? `+$${(timepiece.marketValue - timepiece.purchasePrice).toLocaleString()} from purchase`
                      : `$${(timepiece.purchasePrice - timepiece.marketValue).toLocaleString()} depreciation`}
                  </div>
                )}
              </div>
              
              <div className="h-64">
                <ProgressSparkline 
                  data={valueHistory}
                  dataKey="value"
                  height={250}
                  type="area"
                  color="#22c55e"
                  interactive={true}
                  showTooltip={true}
                  tooltipValueFormat={(value) => `$${value.toLocaleString()}`}
                  tooltipLabelFormat={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="text-gray-400 text-sm mb-2">Retail Price</div>
                <div className="text-xl font-medium text-white">
                  ${((timepiece.retailPrice || timepiece.marketValue || 35000) * 1.2).toLocaleString()}
                </div>
                <div className="text-gray-500 text-sm mt-1">Official boutique price</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="text-gray-400 text-sm mb-2">Grey Market</div>
                <div className="text-xl font-medium text-white">
                  ${(timepiece.marketValue || 35000).toLocaleString()}
                </div>
                <div className="text-gray-500 text-sm mt-1">Unworn with papers</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="text-gray-400 text-sm mb-2">Preowned Value</div>
                <div className="text-xl font-medium text-white">
                  ${((timepiece.marketValue || 35000) * 0.85).toLocaleString()}
                </div>
                <div className="text-gray-500 text-sm mt-1">Excellent condition</div>
              </div>
            </div>
          </div>
          
          {/* Market Insights */}
          <div className="apex-card p-6">
            <h3 className="font-orbitron text-lg text-blue-400 mb-4">Market Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Value Trajectory</h4>
                  <div className="text-green-400">Upward</div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">
                  {timepiece.brand === 'Patek Philippe' 
                    ? 'Steady appreciation expected for Patek Philippe models, especially limited production references like the 5711.'
                    : timepiece.brand === 'Rolex'
                    ? 'Rolex sports models continue to show strong appreciation with limited retail availability driving secondary market prices.'
                    : 'This model has shown stable price performance with moderate yearly appreciation.'}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">5-year forecast</span>
                  <span className="text-green-400">+18.5%</span>
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Market Liquidity</h4>
                  <div className={`text-${timepiece.marketLiquidity === 'Low' ? 'red' : timepiece.marketLiquidity === 'Medium' ? 'yellow' : 'green'}-400`}>
                    {timepiece.marketLiquidity || 'High'}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">
                  {timepiece.marketLiquidity === 'Low'
                    ? 'This model has limited secondary market demand, potentially requiring significant time to sell at market value.'
                    : timepiece.marketLiquidity === 'Medium'
                    ? 'Average time to sell at market value is approximately 4-6 weeks with proper listing exposure.'
                    : 'This model sells quickly on the secondary market, typically within 2-3 weeks of listing at market value.'}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Average days to sell</span>
                  <span className="text-white">{timepiece.avgDaysToSell || '18 days'}</span>
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Authentication Risk</h4>
                  <div className="text-green-400">Low</div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">
                  This model has well-documented authentication points and relatively few counterfeits in circulation.
                  Reference-specific markings and movement details are well cataloged.
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Key verification points</span>
                  <span className="text-white">Movement signature, dial print quality</span>
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Insurance Value</h4>
                  <div className="text-blue-400">
                    ${((timepiece.marketValue || 35000) * 1.1).toLocaleString()}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">
                  Recommended insurance value includes a 10% buffer over current market value
                  to account for potential market appreciation and replacement costs.
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Last appraisal</span>
                  <span className="text-white">{timepiece.lastAppraisal || 'None recorded'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimepieceTelemetry;