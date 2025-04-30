import React from 'react';
import { 
  Activity, Thermometer, Wind, Zap, Droplets, Clock, 
  Gauge, Fuel, BarChart2, AlertTriangle, PieChart
} from 'lucide-react';

/**
 * EnhancedVehicleTelemetry Component
 * Provides a more comprehensive F1-style telemetry dashboard with expanded metrics
 */
const EnhancedVehicleTelemetry = ({ vehicle }) => {
  // Sample telemetry data for display purposes - empty placeholders
  const telemetryData = {
    engineRPM: 0,
    speed: 0,
    engineTemp: 0,
    oilTemp: 0,
    oilPressure: 0,
    batteryVoltage: 0,
    fuelRemaining: 0,
    throttlePosition: 0,
    brakePosition: 0,
    boost: 0,
    airFuelRatio: 0,
    intakeAirTemp: 0,
    ambientAirTemp: 0,
    coolantTemp: 0,
    transmissionTemp: 0,
    lateralG: 0,
    accelerationG: 0,
    brakingG: 0,
    timingAdvance: 0,
    fuelTrim: 0,
    engineLoad: 0,
    dtcCodes: []
  };

  // Generate dashboard sections
  const renderDashboardMetric = (title, value, icon, color, min, max, unit = '', redThreshold = 0, yellowThreshold = 0) => {
    const colorClass = value > redThreshold ? 'bg-red-500' : 
                       value > yellowThreshold ? 'bg-yellow-500' : 
                       'bg-green-500';
    
    const percentage = min === max ? 0 : ((value - min) / (max - min)) * 100;
    
    return (
      <div className="bg-gray-900/80 rounded-lg p-4 border border-blue-500/10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-400 text-sm">{title}</h3>
          {icon}
        </div>
        <div className="text-2xl font-mono text-white mb-2">
          {value > 0 ? `${value}${unit}` : '-- --'}
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full w-full overflow-hidden">
          <div className={`h-full ${colorClass} rounded-full`} 
               style={{ width: `${value > 0 ? percentage : 0}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black rounded-xl p-6 border border-blue-500/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-blue-400 font-orbitron text-xl">Enhanced Telemetry Dashboard</h2>
        <div className="flex gap-3">
          <span className="text-xs bg-blue-900/40 text-blue-400 py-1 px-3 rounded flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" /> Live Data
          </span>
          <span className="text-xs bg-gray-800 text-gray-400 py-1 px-3 rounded">
            Not Connected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {/* Engine Section */}
        {renderDashboardMetric(
          "RPM", 
          telemetryData.engineRPM, 
          <Activity className="text-green-500 h-4 w-4" />,
          "bg-green-500",
          0,
          8000
        )}
        
        {renderDashboardMetric(
          "Speed (MPH)", 
          telemetryData.speed, 
          <Wind className="text-blue-500 h-4 w-4" />,
          "bg-blue-500",
          0,
          180
        )}
        
        {renderDashboardMetric(
          "Engine Temp (°F)", 
          telemetryData.engineTemp, 
          <Thermometer className="text-red-500 h-4 w-4" />,
          "bg-red-500",
          32,
          300,
          "°",
          230,
          200
        )}
        
        {renderDashboardMetric(
          "Oil Temp (°F)", 
          telemetryData.oilTemp, 
          <Droplets className="text-yellow-500 h-4 w-4" />,
          "bg-yellow-500",
          32,
          300,
          "°",
          240,
          220
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {/* Additional Metrics */}
        {renderDashboardMetric(
          "Oil Pressure (PSI)", 
          telemetryData.oilPressure, 
          <Gauge className="text-blue-500 h-4 w-4" />,
          "bg-blue-500",
          0,
          100,
          "",
          20,
          40
        )}
        
        {renderDashboardMetric(
          "Battery (V)", 
          telemetryData.batteryVoltage, 
          <Zap className="text-purple-500 h-4 w-4" />,
          "bg-purple-500",
          9,
          15,
          "V",
          11,
          12.5
        )}
        
        {renderDashboardMetric(
          "Fuel Level (%)", 
          telemetryData.fuelRemaining, 
          <Fuel className="text-green-500 h-4 w-4" />,
          "bg-green-500",
          0,
          100,
          "%",
          10,
          20
        )}
        
        {renderDashboardMetric(
          "Engine Load (%)", 
          telemetryData.engineLoad, 
          <BarChart2 className="text-red-500 h-4 w-4" />,
          "bg-red-500",
          0,
          100,
          "%",
          90,
          80
        )}
      </div>
      
      {/* F1-style Real-Time Graph Section */}
      <div className="bg-gray-900/80 rounded-xl p-4 border border-blue-500/10 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-blue-400 font-semibold">Real-Time Performance Graph</h3>
          <div className="flex gap-2">
            <span className="text-xs bg-green-900/40 text-green-400 py-1 px-2 rounded">RPM</span>
            <span className="text-xs bg-blue-900/40 text-blue-400 py-1 px-2 rounded">Speed</span>
            <span className="text-xs bg-red-900/40 text-red-400 py-1 px-2 rounded">Engine Temp</span>
          </div>
        </div>
        
        {/* Graph Placeholder */}
        <div className="h-48 bg-black/50 rounded-lg border border-gray-800 p-2 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <PieChart className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p>Real-time telemetry graph will appear here when connected to an OBD-II device</p>
          </div>
        </div>
      </div>
      
      {/* Fault Codes Section */}
      <div className="bg-gray-900/80 rounded-xl p-4 border border-blue-500/10 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-blue-400 font-semibold">Diagnostic Trouble Codes</h3>
          <span className="text-xs bg-gray-800 text-gray-400 py-1 px-3 rounded flex items-center">
            <AlertTriangle className="h-3.5 w-3.5 mr-1 text-yellow-500" /> Status Check
          </span>
        </div>
        
        {telemetryData.dtcCodes && telemetryData.dtcCodes.length > 0 ? (
          <div className="space-y-2">
            {telemetryData.dtcCodes.map((code, index) => (
              <div key={index} className="bg-red-900/20 border border-red-900/30 rounded-md p-3 flex justify-between">
                <div>
                  <span className="text-red-400 font-mono">{code.code}</span>
                  <p className="text-sm text-gray-400">{code.description}</p>
                </div>
                <button className="text-blue-400 text-sm hover:underline">Info</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-md p-4 text-center">
            <p className="text-gray-400 mb-2">No fault codes detected</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
              Run Diagnostic Scan
            </button>
          </div>
        )}
      </div>
      
      {/* Connect OBD Section */}
      <div className="bg-gray-900/80 rounded-xl p-4 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-blue-400 font-semibold mb-2">Live Vehicle Diagnostics</h3>
          <p className="text-gray-400 text-sm">
            Connect an OBD-II device to your vehicle to access comprehensive real-time data, diagnostics, and performance analytics
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center whitespace-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path>
          </svg>
          Connect OBD Device
        </button>
      </div>
    </div>
  );
};

export default EnhancedVehicleTelemetry;