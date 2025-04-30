import React from 'react';
import { Activity, Thermometer, Wind, Zap, Droplets, Clock } from 'lucide-react';

/**
 * VehicleTelemetry Component
 * Displays real-time and historical vehicle performance data in an F1-inspired layout
 */
const VehicleTelemetry = ({ vehicle }) => {
  // Sample telemetry data for display purposes
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
    airFuelRatio: 0
  };

  return (
    <div className="bg-black rounded-xl p-6 border border-green-500/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-blue-400 font-orbitron text-xl">Vehicle Telemetry</h2>
        <div className="flex gap-3">
          <span className="text-xs bg-blue-900/40 text-blue-400 py-1 px-3 rounded flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" /> Live Data
          </span>
          <span className="text-xs bg-gray-800 text-gray-400 py-1 px-3 rounded">
            Not Connected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* RPM & Speed Section */}
        <div className="bg-gray-900/80 rounded-lg p-4 border border-blue-500/10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-sm">Engine RPM</h3>
            <Activity className="text-green-500 h-4 w-4" />
          </div>
          <div className="text-2xl font-mono text-white mb-2">
            {telemetryData.engineRPM > 0 ? telemetryData.engineRPM.toLocaleString() : '-- --'}
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full w-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${telemetryData.engineRPM > 0 ? (telemetryData.engineRPM / 9000) * 100 : 0}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>9000</span>
          </div>
        </div>

        {/* Speed */}
        <div className="bg-gray-900/80 rounded-lg p-4 border border-blue-500/10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-sm">Speed (MPH)</h3>
            <Wind className="text-blue-500 h-4 w-4" />
          </div>
          <div className="text-2xl font-mono text-white mb-2">
            {telemetryData.speed > 0 ? telemetryData.speed : '-- --'}
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full w-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${telemetryData.speed > 0 ? (telemetryData.speed / 180) * 100 : 0}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>180</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-gray-900/80 rounded-lg p-4 border border-blue-500/10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-sm">Engine Temp (°F)</h3>
            <Thermometer className="text-red-500 h-4 w-4" />
          </div>
          <div className="text-2xl font-mono text-white mb-2">
            {telemetryData.engineTemp > 0 ? telemetryData.engineTemp : '-- --'}
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full w-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                telemetryData.engineTemp > 220 ? 'bg-red-500' :
                telemetryData.engineTemp > 200 ? 'bg-yellow-500' : 'bg-green-500'
              }`} 
              style={{ width: `${telemetryData.engineTemp > 0 ? (telemetryData.engineTemp / 300) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>32</span>
            <span>300</span>
          </div>
        </div>

        {/* Oil Temperature */}
        <div className="bg-gray-900/80 rounded-lg p-4 border border-blue-500/10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-sm">Oil Temp (°F)</h3>
            <Droplets className="text-yellow-500 h-4 w-4" />
          </div>
          <div className="text-2xl font-mono text-white mb-2">
            {telemetryData.oilTemp > 0 ? telemetryData.oilTemp : '-- --'}
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full w-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                telemetryData.oilTemp > 240 ? 'bg-red-500' :
                telemetryData.oilTemp > 220 ? 'bg-yellow-500' : 'bg-green-500'
              }`} 
              style={{ width: `${telemetryData.oilTemp > 0 ? (telemetryData.oilTemp / 300) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>32</span>
            <span>300</span>
          </div>
        </div>

        {/* Battery Voltage */}
        <div className="bg-gray-900/80 rounded-lg p-4 border border-blue-500/10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-sm">Battery (V)</h3>
            <Zap className="text-purple-500 h-4 w-4" />
          </div>
          <div className="text-2xl font-mono text-white mb-2">
            {telemetryData.batteryVoltage > 0 ? telemetryData.batteryVoltage.toFixed(1) : '-- --'}
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full w-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                telemetryData.batteryVoltage < 11.5 ? 'bg-red-500' :
                telemetryData.batteryVoltage < 12.5 ? 'bg-yellow-500' : 'bg-green-500'
              }`} 
              style={{ width: `${telemetryData.batteryVoltage > 0 ? ((telemetryData.batteryVoltage - 9) / 6) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>9V</span>
            <span>15V</span>
          </div>
        </div>

        {/* Connect OBD Section */}
        <div className="bg-gray-900/80 rounded-lg p-4 border border-blue-500/10 flex flex-col justify-center items-center">
          <p className="text-gray-400 text-center mb-4">Connect to an OBD-II device to see real-time vehicle telemetry</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Connect OBD Device
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-4">
        Note: This telemetry data requires a compatible OBD-II device connected to your vehicle.
      </div>
    </div>
  );
};

export default VehicleTelemetry;