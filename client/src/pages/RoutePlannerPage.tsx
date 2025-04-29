import React, { useState, useEffect } from 'react';

const RoutePlannerPage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [performanceRecommendations, setPerformanceRecommendations] = useState([]);
  const [drivingMode, setDrivingMode] = useState('Sport');
  const [torqueAdjustment, setTorqueAdjustment] = useState(0);
  const [tirePressureAdjustment, setTirePressureAdjustment] = useState(0);
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(false);

  // Mock vehicle data
  const vehicles = [
    { id: 1, make: 'Ferrari', model: '458 Italia', year: 2015, image: 'car1.jpg' },
    { id: 2, make: 'Porsche', model: '911 GT3', year: 2022, image: 'car2.jpg' },
    { id: 3, make: 'Lamborghini', model: 'Huracan', year: 2020, image: 'car3.jpg' }
  ];

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-blue-400 font-orbitron text-4xl">🛣️ Route Planner</h1>
          
          {/* Only show active tracking stats in header when tracking is active */}
          {gpsTrackingEnabled && (
            <div className="flex items-center gap-4">
              <div className="bg-black/40 rounded-lg border border-blue-500/30 px-4 py-2 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-green-400 font-orbitron text-sm">TRACKING ACTIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* F1-Grade Telemetry */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-blue-900 shadow-lg">
            <h2 className="text-blue-400 font-orbitron text-2xl mb-4">F1-Grade Telemetry</h2>
            
            {/* Vehicle Selection */}
            <div className="mb-6">
              <h3 className="text-blue-300 font-orbitron text-lg mb-2">Vehicle Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vehicles.map(vehicle => (
                  <div 
                    key={vehicle.id}
                    className={`border p-3 rounded-lg cursor-pointer transition-all ${
                      selectedVehicle?.id === vehicle.id 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-gray-700 hover:border-blue-400'
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="text-center">
                      <div className="font-orbitron text-lg text-blue-300">{vehicle.make}</div>
                      <div className="text-gray-300">{vehicle.model}</div>
                      <div className="text-gray-400 text-sm">{vehicle.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Telemetry information will go here */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 p-3 rounded border border-blue-900/50">
                <div className="text-gray-400 text-xs">SPEED</div>
                <div className="font-orbitron text-blue-400 text-xl">0</div>
                <div className="text-gray-500 text-xs">MPH</div>
              </div>
              
              <div className="bg-black/40 p-3 rounded border border-blue-900/50">
                <div className="text-gray-400 text-xs">TIRE PRESSURE</div>
                <div className="font-orbitron text-blue-400 text-xl">32.5</div>
                <div className="text-gray-500 text-xs">PSI</div>
              </div>
              
              <div className="bg-black/40 p-3 rounded border border-blue-900/50">
                <div className="text-gray-400 text-xs">G-FORCE</div>
                <div className="font-orbitron text-blue-400 text-xl">0.0</div>
                <div className="text-gray-500 text-xs">G</div>
              </div>
              
              <div className="bg-black/40 p-3 rounded border border-blue-900/50">
                <div className="text-gray-400 text-xs">TEMPERATURE</div>
                <div className="font-orbitron text-blue-400 text-xl">72°</div>
                <div className="text-gray-500 text-xs">F</div>
              </div>
            </div>
          </div>
          
          {/* GPS button using Ferrari styling */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setGpsTrackingEnabled(!gpsTrackingEnabled)}
              className={`
                px-8 py-3 rounded-full text-lg font-medium font-orbitron tracking-wider
                transition-all transform hover:scale-105 hover:shadow-lg
                ${gpsTrackingEnabled
                  ? 'bg-red-600 text-white border-2 border-red-700 shadow-md shadow-red-700/50'
                  : 'bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-800 shadow-md'
                }
              `}
            >
              {gpsTrackingEnabled ? 'STOP GPS TRACKING' : 'START GPS TRACKING'}
            </button>
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          {/* Vehicle Performance Settings (shown when vehicle selected) */}
          {selectedVehicle && (
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <h2 className="text-blue-400 font-orbitron text-xl mb-3">Performance Tuning</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">Driving Mode</label>
                  <select
                    value={drivingMode}
                    onChange={(e) => setDrivingMode(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                  >
                    <option>Comfort</option>
                    <option>Sport</option>
                    <option>Sport+</option>
                    <option>Track</option>
                    <option>Wet</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">
                    Torque Adjustment ({torqueAdjustment > 0 ? '+' : ''}{torqueAdjustment} ft-lb)
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={torqueAdjustment}
                    onChange={(e) => setTorqueAdjustment(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">
                    Tire Pressure Adjustment ({tirePressureAdjustment > 0 ? '+' : ''}{tirePressureAdjustment} PSI)
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={tirePressureAdjustment}
                    onChange={(e) => setTirePressureAdjustment(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Performance recommendations */}
          {selectedVehicle && performanceRecommendations.length > 0 && (
            <div className="mt-6 mb-6 bg-gray-900 p-4 rounded-lg border border-gray-800">
              <h2 className="text-blue-400 font-orbitron text-xl mb-3">F1-Grade Recommendations</h2>
              <ul className="space-y-1">
                {performanceRecommendations.map((rec, index) => (
                  <li key={index} className="text-green-400">
                    ✓ {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlannerPage;