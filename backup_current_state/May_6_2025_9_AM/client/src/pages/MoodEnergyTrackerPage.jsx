import React, { useState, useEffect } from 'react';
import MoodEnergyTracker from '../components/MoodEnergyTracker';
import { getTelemetryChartData, addMoodEnergyEntry, getMoodEnergyStats } from '../services/moodEnergyService';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Zap, BarChart3 } from 'lucide-react';

const MoodEnergyTrackerPage = () => {
  const [telemetryData, setTelemetryData] = useState([]);
  const [stats, setStats] = useState({
    avgMood: 0,
    avgEnergy: 0,
    moodTrend: 'neutral',
    energyTrend: 'neutral',
    entryCount: 0
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load telemetry data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get telemetry data for charts
        const data = await getTelemetryChartData(selectedVehicleId);
        setTelemetryData(data);

        // Get statistics
        const statsData = await getMoodEnergyStats(selectedVehicleId);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading telemetry data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedVehicleId]);

  // Handle saving a new telemetry entry
  const handleSaveTelemetry = async (entry) => {
    try {
      // Add the new entry with the selected vehicle
      const newEntry = await addMoodEnergyEntry({
        ...entry,
        vehicleId: selectedVehicleId
      });

      // Update the telemetry data with the new entry
      const updatedData = await getTelemetryChartData(selectedVehicleId);
      setTelemetryData(updatedData);

      // Update statistics
      const statsData = await getMoodEnergyStats(selectedVehicleId);
      setStats(statsData);

      return newEntry;
    } catch (error) {
      console.error('Error saving telemetry:', error);
      throw error;
    }
  };

  // Get trend icon for mood/energy
  const getTrendIcon = (trend, size = 16) => {
    if (trend === 'improving') return <TrendingUp size={size} className="text-green-500" />;
    if (trend === 'declining') return <TrendingDown size={size} className="text-red-500" />;
    return <Activity size={size} className="text-yellow-500" />;
  };

  // Sample vehicles (in a real app, these would come from an API)
  const vehicles = [
    { id: 1, name: 'Ferrari 458 Italia' },
    { id: 2, name: 'BMW E93 M3' },
    { id: 3, name: 'Audi R8 V10' },
    { id: 4, name: 'BMW G80 M3 Competition' }
  ];

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-6 flex items-center">
        <Zap className="mr-3 h-8 w-8" />
        Driver Telemetry Hub
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Statistics and Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Vehicle Selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h2 className="text-blue-400 font-orbitron text-lg mb-4">Select Vehicle</h2>
            <div className="space-y-2">
              <button
                className={`w-full text-left p-3 rounded flex justify-between items-center ${
                  selectedVehicleId === null ? 'bg-blue-900/30 border border-blue-800' : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                }`}
                onClick={() => setSelectedVehicleId(null)}
              >
                <span className="text-white">All Vehicles</span>
                {selectedVehicleId === null && <Activity className="h-4 w-4 text-blue-400" />}
              </button>
              
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  className={`w-full text-left p-3 rounded flex justify-between items-center ${
                    selectedVehicleId === vehicle.id ? 'bg-blue-900/30 border border-blue-800' : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                >
                  <span className="text-white">{vehicle.name}</span>
                  {selectedVehicleId === vehicle.id && <Activity className="h-4 w-4 text-blue-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Statistics */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h2 className="text-blue-400 font-orbitron text-lg mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Telemetry Statistics
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black border border-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm font-orbitron">DRIVER MOOD AVG</span>
                    <span className="text-blue-400 font-bold text-lg">{stats.avgMood.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(stats.avgMood / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="ml-3 flex items-center">
                      {getTrendIcon(stats.moodTrend)}
                      <span className="ml-1 text-xs text-gray-400">{stats.moodTrend}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black border border-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm font-orbitron">POWER UNIT AVG</span>
                    <span className="text-green-400 font-bold text-lg">{stats.avgEnergy.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${(stats.avgEnergy / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="ml-3 flex items-center">
                      {getTrendIcon(stats.energyTrend)}
                      <span className="ml-1 text-xs text-gray-400">{stats.energyTrend}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black border border-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-orbitron">TOTAL SESSIONS</span>
                    <span className="text-white font-bold text-lg">{stats.entryCount}</span>
                  </div>
                </div>
                
                {/* Mini Trend Chart */}
                {telemetryData.length > 1 && (
                  <div className="bg-black border border-gray-800 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="text-gray-400 text-sm font-orbitron">TREND OVERVIEW</span>
                    </div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={telemetryData.slice(-7)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                          <XAxis dataKey="date" tick={false} axisLine={{ stroke: '#333' }} />
                          <YAxis domain={[0, 10]} hide />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              border: '1px solid #333',
                              borderRadius: '4px',
                              color: '#fff'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="mood"
                            stroke="#3b82f6"
                            dot={{ r: 2 }}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="energy"
                            stroke="#22c55e"
                            dot={{ r: 2 }}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Mood Energy Tracker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Mood and Energy Tracker */}
          <MoodEnergyTracker 
            entries={telemetryData}
            onSave={handleSaveTelemetry}
            showHistory={true}
          />
        </div>
      </div>
    </div>
  );
};

export default MoodEnergyTrackerPage;