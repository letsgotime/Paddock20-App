import React, { useState, useEffect, useRef } from 'react';
import { 
  Gauge, Battery, Thermometer, Droplets, Fuel, Wind, Activity, 
  BarChart2, TrendingUp, Clock, Info, AlertTriangle, Map, 
  ChevronDown, ChevronUp, Maximize2, Zap, Settings, Wrench
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

/**
 * Enhanced Vehicle Telemetry Component
 * 
 * A comprehensive F1-inspired telemetry visualization with detailed vehicle metrics,
 * performance data, and customizable displays.
 */
const EnhancedVehicleTelemetry = ({ 
  vehicle, 
  telemetryData = {}, 
  isExpanded = false,
  onToggleExpand = () => {}
}) => {
  // Component state
  const [activeTab, setActiveTab] = useState('overview');
  const [historyRange, setHistoryRange] = useState('1m'); // 1d, 1w, 1m, 6m, 1y
  const [expandedSections, setExpandedSections] = useState({
    performance: true,
    engine: true,
    maintenance: true,
    historical: false
  });
  const [visibleMetrics, setVisibleMetrics] = useState({
    engineTemp: true,
    oilPressure: true,
    fuelLevel: true,
    batteryVoltage: true,
    engineLoad: true,
    coolantTemp: true,
    intakeTemp: true,
    airFuelRatio: true,
    throttlePosition: true,
    rpm: true,
    speed: true,
    maf: true
  });
  
  // Refs
  const telemetryRef = useRef(null);
  
  // Default telemetry data if none provided
  const defaultTelemetry = {
    engineTemp: telemetryData.engineTemp || 195,
    rpm: telemetryData.rpm || 1200,
    speed: telemetryData.speed || 0,
    throttlePosition: telemetryData.throttlePosition || 15,
    coolantTemp: telemetryData.coolantTemp || 185,
    oilPressure: telemetryData.oilPressure || 40,
    oilTemp: telemetryData.oilTemp || 210,
    fuelPressure: telemetryData.fuelPressure || 58,
    intakeTemp: telemetryData.intakeTemp || 75,
    maf: telemetryData.maf || 12.5,
    batteryVoltage: telemetryData.batteryVoltage || 12.8,
    engineLoad: telemetryData.engineLoad || 25,
    timing: telemetryData.timing || 14,
    airFuelRatio: telemetryData.airFuelRatio || 14.7,
    fuelLevel: telemetryData.fuelLevel || 85,
    ambientTemp: telemetryData.ambientTemp || 70,
    humidity: telemetryData.humidity || 45,
    barometricPressure: telemetryData.barometricPressure || 30.1,
    tpsMax: telemetryData.tpsMax || 100,
    o2Sensor: telemetryData.o2Sensor || 0.85,
    runTime: telemetryData.runTime || 35,
    diagnosticCodes: telemetryData.diagnosticCodes || [],
    injectorPulseWidth: telemetryData.injectorPulseWidth || 2.5,
    fuelTrimShortTerm: telemetryData.fuelTrimShortTerm || 1.5,
    fuelTrimLongTerm: telemetryData.fuelTrimLongTerm || 0.8,
    transmissionTemp: telemetryData.transmissionTemp || 175,
    torqueOutput: telemetryData.torqueOutput || 258,
    cylinders: telemetryData.cylinders || 6,
    catalystTemp: telemetryData.catalystTemp || 842,
    evapPurge: telemetryData.evapPurge || 45,
    altitude: telemetryData.altitude || 850,
    manifoldPressure: telemetryData.manifoldPressure || 10.5,
    iatShutdown: telemetryData.iatShutdown || false,
    tpmsStatus: telemetryData.tpmsStatus || 'OK',
    absStatus: telemetryData.absStatus || 'OK',
    steeringAngle: telemetryData.steeringAngle || 0,
    lateralG: telemetryData.lateralG || 0,
    longitudinalG: telemetryData.longitudinalG || 0,
    yawRate: telemetryData.yawRate || 0,
    wheelSpeed: {
      frontLeft: telemetryData.wheelSpeed?.frontLeft || 0,
      frontRight: telemetryData.wheelSpeed?.frontRight || 0,
      rearLeft: telemetryData.wheelSpeed?.rearLeft || 0,
      rearRight: telemetryData.wheelSpeed?.rearRight || 0,
    },
    brakePosition: telemetryData.brakePosition || 0,
    steeringWheelPosition: telemetryData.steeringWheelPosition || 0,
    clutchPosition: telemetryData.clutchPosition || 0,
    gearPosition: telemetryData.gearPosition || 'P',
    telemetryTime: telemetryData.telemetryTime || new Date().toISOString(),
  };
  
  // Historical data simulation
  const [historicalData, setHistoricalData] = useState([]);
  
  useEffect(() => {
    // Generate simulated historical data
    const generateHistoricalData = () => {
      let dataPoints;
      
      switch(historyRange) {
        case '1d': dataPoints = 24; break; // hourly for a day
        case '1w': dataPoints = 7; break;  // daily for a week
        case '1m': dataPoints = 30; break; // daily for a month
        case '6m': dataPoints = 26; break; // weekly for 6 months
        case '1y': dataPoints = 12; break; // monthly for a year
        default: dataPoints = 30;
      }
      
      // Create simulated data
      const baseValues = {
        engineTemp: 195,
        rpm: 1200,
        oilPressure: 40,
        fuelLevel: 100,
        batteryVoltage: 12.8,
        mileage: vehicle?.mileage ? vehicle.mileage - (dataPoints * 100) : 10000
      };
      
      // Generate data with realistic variations
      const data = Array(dataPoints).fill(0).map((_, i) => {
        const date = new Date();
        
        switch(historyRange) {
          case '1d': 
            date.setHours(date.getHours() - (dataPoints - i));
            break;
          case '1w':
          case '1m':
            date.setDate(date.getDate() - (dataPoints - i));
            break;
          case '6m':
            date.setDate(date.getDate() - ((dataPoints - i) * 7));
            break;
          case '1y':
            date.setMonth(date.getMonth() - (dataPoints - i));
            break;
        }
        
        // Generate slightly random values that trend in a reasonable direction
        const dayFactor = i / dataPoints; // 0 to 1 as time progresses
        
        return {
          date: date.toLocaleDateString(),
          engineTemp: baseValues.engineTemp + (Math.random() * 30 - 15),
          rpm: baseValues.rpm * (1 + (Math.random() * 0.1 - 0.05)),
          oilPressure: baseValues.oilPressure * (1 + (Math.random() * 0.2 - 0.1)),
          fuelLevel: baseValues.fuelLevel - (dayFactor * 80) + (Math.random() * 10 - 5),
          batteryVoltage: baseValues.batteryVoltage * (1 + (Math.random() * 0.08 - 0.04)),
          mileage: Math.round(baseValues.mileage + (i * 100) + (Math.random() * 50))
        };
      });
      
      setHistoricalData(data);
    };
    
    generateHistoricalData();
  }, [historyRange, vehicle]);
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Toggle metric visibility
  const toggleMetric = (metric) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };
  
  // Get status color based on value ranges
  const getStatusColor = (type, value) => {
    switch(type) {
      case 'engineTemp':
        if (value < 170) return 'text-blue-500'; // Too cold
        if (value > 230) return 'text-red-500';  // Too hot
        return 'text-green-500'; // Normal
        
      case 'oilPressure':
        if (value < 20) return 'text-red-500';  // Too low
        if (value > 80) return 'text-yellow-500'; // High
        return 'text-green-500'; // Normal
        
      case 'batteryVoltage':
        if (value < 12.2) return 'text-red-500'; // Too low
        if (value > 14.8) return 'text-yellow-500'; // Too high
        return 'text-green-500'; // Normal
        
      case 'fuelLevel':
        if (value < 15) return 'text-red-500'; // Very low
        if (value < 30) return 'text-yellow-500'; // Low
        return 'text-green-500'; // Normal
        
      case 'coolantTemp':
        if (value < 165) return 'text-blue-500'; // Too cold
        if (value > 220) return 'text-red-500';  // Too hot
        return 'text-green-500'; // Normal
        
      default:
        return 'text-blue-400'; // Default color
    }
  };
  
  // Format value with appropriate units
  const formatValue = (type, value) => {
    switch(type) {
      case 'engineTemp':
      case 'coolantTemp':
      case 'oilTemp':
      case 'intakeTemp':
      case 'catalystTemp':
      case 'transmissionTemp':
      case 'ambientTemp':
        return `${Math.round(value)}°F`;
        
      case 'rpm':
        return `${Math.round(value)} RPM`;
        
      case 'speed':
        return `${Math.round(value)} MPH`;
        
      case 'throttlePosition':
      case 'engineLoad':
      case 'fuelLevel':
      case 'humidity':
      case 'evapPurge':
        return `${Math.round(value)}%`;
        
      case 'oilPressure':
      case 'fuelPressure':
      case 'barometricPressure':
      case 'manifoldPressure':
        return `${value} PSI`;
        
      case 'batteryVoltage':
        return `${value}V`;
        
      case 'maf':
        return `${value} g/s`;
        
      case 'timing':
        return `${value}° BTDC`;
        
      case 'airFuelRatio':
        return `${value}:1`;
        
      case 'injectorPulseWidth':
        return `${value} ms`;
        
      case 'fuelTrimShortTerm':
      case 'fuelTrimLongTerm':
        return `${value}%`;
        
      case 'runTime':
        return `${value} min`;
        
      case 'torqueOutput':
        return `${value} lb-ft`;
        
      case 'altitude':
        return `${value} ft`;
        
      case 'lateralG':
      case 'longitudinalG':
        return `${value} G`;
        
      case 'yawRate':
        return `${value}°/s`;
        
      case 'steeringAngle':
        return `${value}°`;
        
      case 'brakePosition':
      case 'clutchPosition':
        return `${value}%`;
        
      default:
        return `${value}`;
    }
  };
  
  // Render the primary gauge display
  const renderGauge = (type, value, min, max, label, icon) => {
    // Calculate percentage for gauge
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    
    return (
      <div className="gauge-container">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            {icon}
            <span className="text-xs text-gray-400 ml-1">{label}</span>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(type, value)}`}>
            {formatValue(type, value)}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${getStatusColor(type, value).replace('text-', 'bg-')}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Tab content for the Overview tab
  const renderOverviewTab = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Telemetry Section */}
        <div className="col-span-1 sm:col-span-2 bg-gray-900 p-4 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-orbitron text-blue-400 flex items-center">
              <Activity size={18} className="mr-2" />
              Core Telemetry
            </h3>
            <button 
              onClick={() => toggleSection('performance')}
              className="text-gray-400 hover:text-white"
            >
              {expandedSections.performance ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {expandedSections.performance && (
            <div className="space-y-4">
              {/* Row 1: Primary Gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="gauge-wrapper">
                  {visibleMetrics.engineTemp && renderGauge(
                    'engineTemp',
                    defaultTelemetry.engineTemp,
                    160,
                    240,
                    'Engine Temp',
                    <Thermometer size={14} className="text-red-500" />
                  )}
                </div>
                <div className="gauge-wrapper">
                  {visibleMetrics.oilPressure && renderGauge(
                    'oilPressure',
                    defaultTelemetry.oilPressure,
                    0,
                    100,
                    'Oil Pressure',
                    <Droplets size={14} className="text-yellow-500" />
                  )}
                </div>
              </div>
              
              {/* Row 2: Secondary Gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="gauge-wrapper">
                  {visibleMetrics.fuelLevel && renderGauge(
                    'fuelLevel',
                    defaultTelemetry.fuelLevel,
                    0,
                    100,
                    'Fuel Level',
                    <Fuel size={14} className="text-green-500" />
                  )}
                </div>
                <div className="gauge-wrapper">
                  {visibleMetrics.batteryVoltage && renderGauge(
                    'batteryVoltage',
                    defaultTelemetry.batteryVoltage,
                    11,
                    15,
                    'Battery',
                    <Battery size={14} className="text-blue-500" />
                  )}
                </div>
              </div>
              
              {/* Digital Display Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {/* RPM */}
                {visibleMetrics.rpm && (
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">RPM</div>
                    <div className="text-xl font-medium text-blue-400">
                      {Math.round(defaultTelemetry.rpm)}
                    </div>
                  </div>
                )}
                
                {/* Speed */}
                {visibleMetrics.speed && (
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">SPEED</div>
                    <div className="text-xl font-medium text-green-500">
                      {Math.round(defaultTelemetry.speed)}
                      <span className="text-xs ml-1">mph</span>
                    </div>
                  </div>
                )}
                
                {/* Throttle Position */}
                {visibleMetrics.throttlePosition && (
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">THROTTLE</div>
                    <div className="text-xl font-medium text-yellow-500">
                      {Math.round(defaultTelemetry.throttlePosition)}
                      <span className="text-xs ml-1">%</span>
                    </div>
                  </div>
                )}
                
                {/* MAF */}
                {visibleMetrics.maf && (
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">MAF</div>
                    <div className="text-xl font-medium text-purple-500">
                      {defaultTelemetry.maf}
                      <span className="text-xs ml-1">g/s</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Engine Metrics Section */}
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-orbitron text-blue-400 flex items-center">
              <Zap size={18} className="mr-2" />
              Engine Metrics
            </h3>
            <button 
              onClick={() => toggleSection('engine')}
              className="text-gray-400 hover:text-white"
            >
              {expandedSections.engine ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {expandedSections.engine && (
            <div className="space-y-3">
              {/* Coolant Temp */}
              {visibleMetrics.coolantTemp && (
                <div className="metric-row">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Coolant Temp</span>
                    <span className={`text-sm font-medium ${getStatusColor('coolantTemp', defaultTelemetry.coolantTemp)}`}>
                      {Math.round(defaultTelemetry.coolantTemp)}°F
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getStatusColor('coolantTemp', defaultTelemetry.coolantTemp).replace('text-', 'bg-')}`}
                      style={{ width: `${Math.min(100, Math.max(0, ((defaultTelemetry.coolantTemp - 160) / 80) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Intake Temp */}
              {visibleMetrics.intakeTemp && (
                <div className="metric-row">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Intake Temp</span>
                    <span className="text-sm font-medium text-blue-400">
                      {Math.round(defaultTelemetry.intakeTemp)}°F
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-400"
                      style={{ width: `${Math.min(100, Math.max(0, ((defaultTelemetry.intakeTemp - 40) / 100) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Air/Fuel Ratio */}
              {visibleMetrics.airFuelRatio && (
                <div className="metric-row">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">A/F Ratio</span>
                    <span className="text-sm font-medium text-green-400">
                      {defaultTelemetry.airFuelRatio}:1
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-green-400"
                      style={{ width: `${Math.min(100, Math.max(0, ((defaultTelemetry.airFuelRatio - 10) / 8) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Engine Load */}
              {visibleMetrics.engineLoad && (
                <div className="metric-row">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Engine Load</span>
                    <span className="text-sm font-medium text-yellow-500">
                      {Math.round(defaultTelemetry.engineLoad)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-yellow-500"
                      style={{ width: `${defaultTelemetry.engineLoad}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Advanced Metrics */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Timing</div>
                    <div className="text-sm font-medium text-white">{defaultTelemetry.timing}° BTDC</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Oil Temp</div>
                    <div className="text-sm font-medium text-white">{defaultTelemetry.oilTemp}°F</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Run Time</div>
                    <div className="text-sm font-medium text-white">{defaultTelemetry.runTime} min</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">O₂ Sensor</div>
                    <div className="text-sm font-medium text-white">{defaultTelemetry.o2Sensor}V</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Maintenance Alerts */}
        <div className="sm:col-span-2 lg:col-span-3 bg-gray-900 p-4 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-orbitron text-blue-400 flex items-center">
              <Wrench size={18} className="mr-2" />
              Maintenance Status
            </h3>
            <button 
              onClick={() => toggleSection('maintenance')}
              className="text-gray-400 hover:text-white"
            >
              {expandedSections.maintenance ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {expandedSections.maintenance && (
            <div>
              {defaultTelemetry.diagnosticCodes && defaultTelemetry.diagnosticCodes.length > 0 ? (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-red-500 mb-2">
                    <AlertTriangle size={18} className="mr-2" />
                    <h4 className="font-medium">Diagnostic Trouble Codes Detected</h4>
                  </div>
                  <ul className="space-y-2">
                    {defaultTelemetry.diagnosticCodes.map((code, index) => (
                      <li key={index} className="flex items-center text-sm text-red-400">
                        <span className="inline-block w-16 font-mono">{code}</span>
                        <span>- Evaporative System Leak Detected (Very Small Leak)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-green-500">
                    <div className="mr-2">✓</div>
                    <h4 className="font-medium">No Diagnostic Trouble Codes Detected</h4>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Service Indicators */}
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h5 className="text-sm text-gray-400 mb-2">Next Oil Change</h5>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-medium text-white">
                      {Math.max(0, 5000 - ((vehicle?.mileage || 0) % 5000)).toLocaleString()} miles
                    </div>
                    <div className="text-sm text-gray-400">
                      {Math.round(100 - ((vehicle?.mileage || 0) % 5000) / 50)}% remaining
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.round(100 - ((vehicle?.mileage || 0) % 5000) / 50)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h5 className="text-sm text-gray-400 mb-2">Brake Pad Life</h5>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-medium text-white">
                      65% remaining
                    </div>
                    <div className="text-sm text-gray-400">
                      ~15,000 miles
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-green-500"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h5 className="text-sm text-gray-400 mb-2">Air Filter</h5>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-medium text-white">
                      40% remaining
                    </div>
                    <div className="text-sm text-gray-400">
                      Replace in ~8,000 miles
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-yellow-500"
                      style={{ width: '40%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Historical Data Section */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-gray-900 p-4 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-orbitron text-blue-400 flex items-center">
              <BarChart2 size={18} className="mr-2" />
              Historical Telemetry
            </h3>
            <div className="flex items-center">
              <div className="flex bg-gray-800 rounded-lg overflow-hidden mr-2 text-xs">
                <button 
                  onClick={() => setHistoryRange('1d')} 
                  className={`px-2 py-1 ${historyRange === '1d' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                >
                  1D
                </button>
                <button 
                  onClick={() => setHistoryRange('1w')} 
                  className={`px-2 py-1 ${historyRange === '1w' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                >
                  1W
                </button>
                <button 
                  onClick={() => setHistoryRange('1m')} 
                  className={`px-2 py-1 ${historyRange === '1m' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                >
                  1M
                </button>
                <button 
                  onClick={() => setHistoryRange('6m')} 
                  className={`px-2 py-1 ${historyRange === '6m' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                >
                  6M
                </button>
                <button 
                  onClick={() => setHistoryRange('1y')} 
                  className={`px-2 py-1 ${historyRange === '1y' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                >
                  1Y
                </button>
              </div>
              <button 
                onClick={() => toggleSection('historical')}
                className="text-gray-400 hover:text-white"
              >
                {expandedSections.historical ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>
          
          {expandedSections.historical && (
            <div>
              <div className="h-72 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historicalData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fill: '#999', fontSize: 10}}
                      axisLine={{ stroke: '#333' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      domain={['auto', 'auto']}
                      stroke="#3b82f6" 
                      tick={{fill: '#999', fontSize: 10}}
                      axisLine={{ stroke: '#333' }}
                      tickLine={{ stroke: '#333' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      stroke="#10b981" 
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
                        if (name === 'engineTemp') return [`${value}°F`, 'Engine Temp'];
                        if (name === 'oilPressure') return [`${value} PSI`, 'Oil Pressure'];
                        if (name === 'fuelLevel') return [`${value}%`, 'Fuel Level'];
                        if (name === 'batteryVoltage') return [`${value}V`, 'Battery Voltage'];
                        if (name === 'mileage') return [`${value.toLocaleString()}`, 'Mileage'];
                        return [value, name];
                      }}
                      labelFormatter={(date) => `Date: ${date}`}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="engineTemp" 
                      stroke="#3b82f6" 
                      dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="oilPressure" 
                      stroke="#8b5cf6" 
                      dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="fuelLevel" 
                      stroke="#10b981" 
                      dot={{ stroke: '#10b981', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={historicalData}
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
                      domain={['auto', 'auto']}
                      stroke="#f59e0b" 
                      tick={{fill: '#999', fontSize: 10}}
                      axisLine={{ stroke: '#333' }}
                      tickLine={{ stroke: '#333' }}
                      tickFormatter={(value) => value.toLocaleString()}
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
                        if (name === 'mileage') return [value.toLocaleString(), 'Mileage'];
                        return [value, name];
                      }}
                      labelFormatter={(date) => `Date: ${date}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mileage" 
                      stroke="#f59e0b" 
                      fill="url(#mileageGradient)" 
                      dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="mileageGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Tab content for the Performance tab
  const renderPerformanceTab = () => {
    return (
      <div>Performance data content</div>
    );
  };
  
  // Tab content for the Diagnostics tab
  const renderDiagnosticsTab = () => {
    return (
      <div>Diagnostics content</div>
    );
  };
  
  // Tab content for the Settings tab
  const renderSettingsTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-orbitron text-blue-400 mb-4">Telemetry Display Settings</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Visible Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(visibleMetrics).map(([metric, isVisible]) => (
                  <div key={metric} className="flex items-center">
                    <button
                      className={`w-4 h-4 mr-2 rounded ${isVisible ? 'bg-blue-500' : 'bg-gray-700'} relative`}
                      onClick={() => toggleMetric(metric)}
                    >
                      {isVisible && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className="text-sm text-gray-300 capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Display Units</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Temperature</span>
                  <div className="flex bg-gray-800 rounded overflow-hidden">
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white">°F</button>
                    <button className="px-3 py-1 text-xs text-gray-400">°C</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Speed</span>
                  <div className="flex bg-gray-800 rounded overflow-hidden">
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white">MPH</button>
                    <button className="px-3 py-1 text-xs text-gray-400">KM/H</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Pressure</span>
                  <div className="flex bg-gray-800 rounded overflow-hidden">
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white">PSI</button>
                    <button className="px-3 py-1 text-xs text-gray-400">BAR</button>
                    <button className="px-3 py-1 text-xs text-gray-400">KPA</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Telemetry Refresh Rate</h4>
              <div className="flex bg-gray-800 rounded overflow-hidden">
                <button className="px-3 py-1 text-xs text-gray-400">0.5s</button>
                <button className="px-3 py-1 text-xs bg-blue-600 text-white">1s</button>
                <button className="px-3 py-1 text-xs text-gray-400">2s</button>
                <button className="px-3 py-1 text-xs text-gray-400">5s</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-orbitron text-blue-400 mb-4">Alert Settings</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Temperature Alerts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Engine Temp Low (°F)</label>
                  <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" defaultValue={170} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Engine Temp High (°F)</label>
                  <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" defaultValue={230} />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Notification Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <button className="w-4 h-4 mr-2 rounded bg-blue-500 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-300">Show critical alerts</span>
                </div>
                <div className="flex items-center">
                  <button className="w-4 h-4 mr-2 rounded bg-blue-500 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-300">Show maintenance reminders</span>
                </div>
                <div className="flex items-center">
                  <button className="w-4 h-4 mr-2 rounded bg-gray-700 relative">
                  </button>
                  <span className="text-sm text-gray-300">Show fuel level alerts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the component
  return (
    <div 
      ref={telemetryRef}
      className={`enhanced-vehicle-telemetry bg-gray-900 border border-gray-800 rounded-lg transition-all ${
        isExpanded ? 'p-6' : 'p-4'
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
          <BarChart2 className="mr-2 h-5 w-5" />
          Enhanced Vehicle Telemetry
        </h2>
        
        <div className="flex items-center gap-2">
          <button 
            className="text-gray-400 hover:text-white p-1 transition-colors"
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Minimize telemetry" : "Expand telemetry"}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'performance' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'diagnostics' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('diagnostics')}
        >
          Diagnostics
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'diagnostics' && renderDiagnosticsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default EnhancedVehicleTelemetry;