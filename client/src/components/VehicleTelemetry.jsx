import React, { useState, useEffect } from 'react';
import { 
  Activity, BarChart2, Thermometer, Zap, 
  DownloadCloud, RefreshCw, Gauge, TrendingUp, 
  Wind, Droplet, Battery, Clock, ThermometerSun 
} from 'lucide-react';
import OBDLiveDashboard from './OBDLiveDashboard';

// Import example graph images
import tempChartPath from '@assets/AdobeStock_1212056636.jpeg';

const VehicleTelemetry = ({ vehicleId }) => {
  const [telemetryData, setTelemetryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOBDConnect, setShowOBDConnect] = useState(false);
  const [connected, setConnected] = useState(false);

  // Time formatting
  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const [currentTime, setCurrentTime] = useState(formatTime());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // In a real implementation, fetch telemetry data from API or OBD2
    const fetchTelemetryData = async () => {
      setIsLoading(true);
      try {
        // Placeholder for real API call
        // const response = await fetch(`/api/vehicles/${vehicleId}/telemetry`);
        // const data = await response.json();
        
        // For now, we'll use empty data to encourage user interaction
        setTelemetryData({
          engine: {
            rpm: null,
            temperature: null,
            oilTemp: null,
            oilPressure: null,
            load: null,
          },
          performance: {
            speed: null,
            acceleration: null,
            throttlePosition: null,
            brakePosition: null,
          },
          fuel: {
            level: null,
            range: null,
            economy: null,
            instantConsumption: null,
          },
          electrical: {
            batteryVoltage: null,
            alternatorOutput: null,
            batteryHealth: null,
          },
          environment: {
            ambientTemp: null,
            humidity: null,
            altitude: null,
            pressure: null,
          },
          sensors: {
            absActive: false,
            tractionControl: false,
            checkEngine: false,
            oilWarning: false,
          }
        });
      } catch (error) {
        console.error("Error fetching telemetry data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTelemetryData();
  }, [vehicleId]);

  // Simulate connecting to OBD2
  const handleConnect = () => {
    setConnected(true);
  };

  const resetAllGauges = () => {
    // This would reset all gauges to zero or null values
    console.log("Resetting all gauges");
  };

  // Placeholder for manual data entry (to be implemented)
  const openManualDataEntry = () => {
    console.log("Open manual data entry form");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="vehicle-telemetry">
      {/* Header Section with Tabs */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-blue-400 font-orbitron text-2xl mb-2">Live Vehicle Telemetry</h2>
          <p className="text-gray-400">
            Real-time monitoring of your vehicle's vital systems and performance metrics
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button 
            onClick={() => setShowOBDConnect(true)}
            className="bg-blue-900/70 hover:bg-blue-800 text-white px-4 py-2 rounded-md flex items-center text-sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Connect OBD2
          </button>
          
          <button
            onClick={resetAllGauges}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="inline-flex bg-gray-900/60 backdrop-blur-sm rounded-md p-1 border border-blue-900/30">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-sm rounded transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'bg-green-500 text-black font-bold shadow-lg' 
                : 'text-white hover:bg-gray-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`px-4 py-2 text-sm rounded transition-all duration-200 ${
              activeTab === 'engine' 
                ? 'bg-green-500 text-black font-bold shadow-lg' 
                : 'text-white hover:bg-gray-800'
            }`}
          >
            Engine
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 text-sm rounded transition-all duration-200 ${
              activeTab === 'performance' 
                ? 'bg-green-500 text-black font-bold shadow-lg' 
                : 'text-white hover:bg-gray-800'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`px-4 py-2 text-sm rounded transition-all duration-200 ${
              activeTab === 'fuel' 
                ? 'bg-green-500 text-black font-bold shadow-lg' 
                : 'text-white hover:bg-gray-800'
            }`}
          >
            Fuel
          </button>
          <button
            onClick={() => setActiveTab('electrical')}
            className={`px-4 py-2 text-sm rounded transition-all duration-200 ${
              activeTab === 'electrical' 
                ? 'bg-green-500 text-black font-bold shadow-lg' 
                : 'text-white hover:bg-gray-800'
            }`}
          >
            Electrical
          </button>
          <button
            onClick={() => setActiveTab('environment')}
            className={`px-4 py-2 text-sm rounded transition-all duration-200 ${
              activeTab === 'environment' 
                ? 'bg-green-500 text-black font-bold shadow-lg' 
                : 'text-white hover:bg-gray-800'
            }`}
          >
            Environment
          </button>
          <button
            onClick={() => setActiveTab('obd')}
            className={`px-4 py-2 text-sm rounded transition-all duration-200 ${
              activeTab === 'obd' 
                ? 'bg-green-500 text-black font-bold shadow-lg' 
                : 'text-white hover:bg-gray-800'
            }`}
          >
            OBD2 Raw
          </button>
        </div>
      </div>
      
      {/* Main Dashboard */}
      {activeTab === 'dashboard' && (
        <div>
          {/* F1-style Telemetry Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* RPM Gauge */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-blue-500/20">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-blue-400 font-orbitron text-lg">Engine RPM</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{currentTime}</span>
                </div>
                
                {telemetryData.engine.rpm !== null ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Current</span>
                      <span className="text-green-400 font-bold text-3xl">{telemetryData.engine.rpm}</span>
                    </div>
                    
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                        style={{ width: `${(telemetryData.engine.rpm / 8000) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500 text-xs">0</span>
                      <span className="text-gray-500 text-xs">2000</span>
                      <span className="text-gray-500 text-xs">4000</span>
                      <span className="text-gray-500 text-xs">6000</span>
                      <span className="text-gray-500 text-xs">8000</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-gauge flex flex-col items-center justify-center h-32">
                    <Gauge className="h-12 w-12 text-gray-700 mb-2" />
                    <p className="text-gray-500 text-center">Connect OBD2 or enter data to see RPM values</p>
                    <button 
                      onClick={openManualDataEntry}
                      className="mt-3 text-blue-400 text-sm hover:underline"
                    >
                      Enter manually
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Speed Gauge */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-blue-500/20">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-blue-400 font-orbitron text-lg">Vehicle Speed</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{currentTime}</span>
                </div>
                
                {telemetryData.performance.speed !== null ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Current</span>
                      <div className="flex items-end">
                        <span className="text-green-400 font-bold text-3xl">{telemetryData.performance.speed}</span>
                        <span className="text-gray-400 text-lg ml-1">mph</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                        style={{ width: `${(telemetryData.performance.speed / 160) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500 text-xs">0</span>
                      <span className="text-gray-500 text-xs">40</span>
                      <span className="text-gray-500 text-xs">80</span>
                      <span className="text-gray-500 text-xs">120</span>
                      <span className="text-gray-500 text-xs">160</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-gauge flex flex-col items-center justify-center h-32">
                    <Activity className="h-12 w-12 text-gray-700 mb-2" />
                    <p className="text-gray-500 text-center">Connect OBD2 or enter data to see speed values</p>
                    <button 
                      onClick={openManualDataEntry}
                      className="mt-3 text-blue-400 text-sm hover:underline"
                    >
                      Enter manually
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Engine Temperature */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-blue-500/20">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-blue-400 font-orbitron text-lg">Engine Temp</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{currentTime}</span>
                </div>
                
                {telemetryData.engine.temperature !== null ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Current</span>
                      <div className="flex items-end">
                        <span className="text-green-400 font-bold text-3xl">{telemetryData.engine.temperature}</span>
                        <span className="text-gray-400 text-lg ml-1">°F</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
                        style={{ width: `${((telemetryData.engine.temperature - 100) / 150) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500 text-xs">100°</span>
                      <span className="text-gray-500 text-xs">150°</span>
                      <span className="text-gray-500 text-xs">200°</span>
                      <span className="text-gray-500 text-xs">250°</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-gauge flex flex-col items-center justify-center h-32">
                    <ThermometerSun className="h-12 w-12 text-gray-700 mb-2" />
                    <p className="text-gray-500 text-center">Connect OBD2 or enter data to see temperature</p>
                    <button 
                      onClick={openManualDataEntry}
                      className="mt-3 text-blue-400 text-sm hover:underline"
                    >
                      Enter manually
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Fuel Level */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-blue-500/20">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-blue-400 font-orbitron text-lg">Fuel Level</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{currentTime}</span>
                </div>
                
                {telemetryData.fuel.level !== null ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Current</span>
                      <div className="flex items-end">
                        <span className="text-green-400 font-bold text-3xl">{telemetryData.fuel.level}</span>
                        <span className="text-gray-400 text-lg ml-1">%</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{ width: `${telemetryData.fuel.level}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500 text-xs">0%</span>
                      <span className="text-gray-500 text-xs">25%</span>
                      <span className="text-gray-500 text-xs">50%</span>
                      <span className="text-gray-500 text-xs">75%</span>
                      <span className="text-gray-500 text-xs">100%</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-gauge flex flex-col items-center justify-center h-32">
                    <Droplet className="h-12 w-12 text-gray-700 mb-2" />
                    <p className="text-gray-500 text-center">Connect OBD2 or enter data to see fuel level</p>
                    <button 
                      onClick={openManualDataEntry}
                      className="mt-3 text-blue-400 text-sm hover:underline"
                    >
                      Enter manually
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Battery Voltage */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-blue-500/20">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-blue-400 font-orbitron text-lg">Battery Voltage</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{currentTime}</span>
                </div>
                
                {telemetryData.electrical.batteryVoltage !== null ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Current</span>
                      <div className="flex items-end">
                        <span className="text-green-400 font-bold text-3xl">{telemetryData.electrical.batteryVoltage}</span>
                        <span className="text-gray-400 text-lg ml-1">V</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{ width: `${((telemetryData.electrical.batteryVoltage - 10) / 5) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500 text-xs">10V</span>
                      <span className="text-gray-500 text-xs">11V</span>
                      <span className="text-gray-500 text-xs">12V</span>
                      <span className="text-gray-500 text-xs">13V</span>
                      <span className="text-gray-500 text-xs">15V</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-gauge flex flex-col items-center justify-center h-32">
                    <Battery className="h-12 w-12 text-gray-700 mb-2" />
                    <p className="text-gray-500 text-center">Connect OBD2 or enter data to see battery voltage</p>
                    <button 
                      onClick={openManualDataEntry}
                      className="mt-3 text-blue-400 text-sm hover:underline"
                    >
                      Enter manually
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Throttle Position */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-blue-500/20">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-blue-400 font-orbitron text-lg">Throttle Position</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{currentTime}</span>
                </div>
                
                {telemetryData.performance.throttlePosition !== null ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Current</span>
                      <div className="flex items-end">
                        <span className="text-green-400 font-bold text-3xl">{telemetryData.performance.throttlePosition}</span>
                        <span className="text-gray-400 text-lg ml-1">%</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-red-500"
                        style={{ width: `${telemetryData.performance.throttlePosition}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500 text-xs">0%</span>
                      <span className="text-gray-500 text-xs">25%</span>
                      <span className="text-gray-500 text-xs">50%</span>
                      <span className="text-gray-500 text-xs">75%</span>
                      <span className="text-gray-500 text-xs">100%</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-gauge flex flex-col items-center justify-center h-32">
                    <TrendingUp className="h-12 w-12 text-gray-700 mb-2" />
                    <p className="text-gray-500 text-center">Connect OBD2 or enter data to see throttle position</p>
                    <button 
                      onClick={openManualDataEntry}
                      className="mt-3 text-blue-400 text-sm hover:underline"
                    >
                      Enter manually
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Advanced Telemetry - Charts and Graphs */}
          <div className="mb-6">
            <h3 className="text-blue-400 font-orbitron text-lg mb-4">Temperature Trends</h3>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
              {telemetryData.engine.temperature !== null ? (
                <img 
                  src={tempChartPath} 
                  alt="Temperature Trend Chart" 
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <BarChart2 className="h-16 w-16 text-gray-700 mb-4" />
                  <p className="text-gray-400 mb-2">No temperature data recorded yet</p>
                  <p className="text-gray-500 text-sm mb-4">Connect your OBD2 adapter or enter data manually to see temperature trends over time.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sensor Status Panel */}
          <div>
            <h3 className="text-blue-400 font-orbitron text-lg mb-4">System Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`rounded-xl p-3 flex items-center ${
                telemetryData.sensors.checkEngine 
                  ? 'bg-red-900/30 border border-red-700/50' 
                  : 'bg-gray-900 border border-gray-800'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  telemetryData.sensors.checkEngine 
                    ? 'bg-red-900/50 text-red-400' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Check Engine</div>
                  <div className={`font-medium ${
                    telemetryData.sensors.checkEngine 
                      ? 'text-red-400' 
                      : 'text-green-400'
                  }`}>
                    {telemetryData.sensors.checkEngine ? 'Warning' : 'OK'}
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-3 flex items-center ${
                telemetryData.sensors.oilWarning 
                  ? 'bg-red-900/30 border border-red-700/50' 
                  : 'bg-gray-900 border border-gray-800'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  telemetryData.sensors.oilWarning 
                    ? 'bg-red-900/50 text-red-400' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  <Droplet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Oil System</div>
                  <div className={`font-medium ${
                    telemetryData.sensors.oilWarning 
                      ? 'text-red-400' 
                      : 'text-green-400'
                  }`}>
                    {telemetryData.sensors.oilWarning ? 'Warning' : 'OK'}
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-3 flex items-center ${
                telemetryData.sensors.absActive 
                  ? 'bg-yellow-900/30 border border-yellow-700/50' 
                  : 'bg-gray-900 border border-gray-800'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  telemetryData.sensors.absActive 
                    ? 'bg-yellow-900/50 text-yellow-400' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">ABS System</div>
                  <div className={`font-medium ${
                    telemetryData.sensors.absActive 
                      ? 'text-yellow-400' 
                      : 'text-green-400'
                  }`}>
                    {telemetryData.sensors.absActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-3 flex items-center ${
                telemetryData.sensors.tractionControl 
                  ? 'bg-yellow-900/30 border border-yellow-700/50' 
                  : 'bg-gray-900 border border-gray-800'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  telemetryData.sensors.tractionControl 
                    ? 'bg-yellow-900/50 text-yellow-400' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  <Wind className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Traction</div>
                  <div className={`font-medium ${
                    telemetryData.sensors.tractionControl 
                      ? 'text-yellow-400' 
                      : 'text-green-400'
                  }`}>
                    {telemetryData.sensors.tractionControl ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* OBD2 Raw Tab */}
      {activeTab === 'obd' && (
        <div>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-blue-500/20">
            <OBDLiveDashboard />
          </div>
        </div>
      )}
      
      {/* Engine Tab */}
      {activeTab === 'engine' && (
        <div className="space-y-6">
          <p className="text-gray-400">Detailed engine metrics and status will appear here once you connect with OBD2 or enter data manually.</p>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-blue-500/20 flex flex-col items-center justify-center h-64">
            <Gauge className="h-16 w-16 text-gray-700 mb-4" />
            <h3 className="text-xl text-gray-300 mb-2">Engine Data Unavailable</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              Connect your vehicle with OBD2 or manually enter your engine data to view detailed metrics.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowOBDConnect(true)}
                className="px-4 py-2 bg-blue-900/40 hover:bg-blue-900/60 text-white rounded-md border border-blue-800/40"
              >
                Connect OBD2
              </button>
              <button 
                onClick={openManualDataEntry}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
              >
                Enter Data Manually
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Other Tabs - Similar placeholders */}
      {(activeTab === 'performance' || activeTab === 'fuel' || activeTab === 'electrical' || activeTab === 'environment') && (
        <div className="space-y-6">
          <p className="text-gray-400">Detailed {activeTab} metrics will appear here once you connect with OBD2 or enter data manually.</p>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-blue-500/20 flex flex-col items-center justify-center h-64">
            <Activity className="h-16 w-16 text-gray-700 mb-4" />
            <h3 className="text-xl text-gray-300 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data Unavailable</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              Connect your vehicle with OBD2 or manually enter data to view detailed {activeTab} metrics.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowOBDConnect(true)}
                className="px-4 py-2 bg-blue-900/40 hover:bg-blue-900/60 text-white rounded-md border border-blue-800/40"
              >
                Connect OBD2
              </button>
              <button 
                onClick={openManualDataEntry}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
              >
                Enter Data Manually
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* OBD Connection Modal */}
      {showOBDConnect && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full">
            <div className="border-b border-gray-800 p-4 flex justify-between items-center">
              <h3 className="text-blue-400 font-orbitron text-xl">Connect OBD2 Device</h3>
              <button 
                onClick={() => setShowOBDConnect(false)}
                className="text-gray-500 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <OBDLiveDashboard />
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowOBDConnect(false);
                    setConnected(true);
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTelemetry;