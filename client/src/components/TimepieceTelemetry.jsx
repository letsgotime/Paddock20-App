import React, { useState, useEffect } from 'react';
import { 
  Watch, Clock, Calendar, AlertTriangle, CheckCircle, 
  RefreshCw, FileText, ClipboardCheck, Settings, Tool, 
  DollarSign, Package, Shield, BarChart
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
      {/* Timepiece Header */}
      <div className="apex-card p-6 bg-gradient-to-br from-gray-900 to-gray-900/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="font-orbitron text-2xl text-blue-400 mb-1">{timepiece.brand} {timepiece.model}</h2>
            <p className="text-gray-400">
              Ref. {timepiece.reference} • {timepiece.year} • {timepiece.type}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded ${activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-3 py-1 rounded ${activeTab === 'maintenance' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400'}`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 py-1 rounded ${activeTab === 'market' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400'}`}
            >
              Market
            </button>
          </div>
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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
      
      {/* Market Tab */}
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