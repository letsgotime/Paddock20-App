import React, { useState, useEffect } from 'react';
import DynamicMoodEnergyTracker from './DynamicMoodEnergyTracker';
import { getTelemetryChartData, addMoodEnergyEntry } from '../services/moodEnergyService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, TrendingUp, Calendar, Zap } from 'lucide-react';

const DriveJournalMoodEnergyTracker = ({ driveData, onTelemetryUpdate, vehicleId }) => {
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [showHistoryChart, setShowHistoryChart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load telemetry history when component mounts or when vehicle changes
  useEffect(() => {
    const loadTelemetryData = async () => {
      setIsLoading(true);
      try {
        const data = await getTelemetryChartData(vehicleId);
        setTelemetryHistory(data);
      } catch (error) {
        console.error('Error loading telemetry data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTelemetryData();
  }, [vehicleId]);

  // Handle saving new telemetry data
  const handleSaveTelemetry = async (updatedData) => {
    try {
      // Add the new entry with the selected vehicle
      const newEntry = await addMoodEnergyEntry({
        mood: updatedData.mood,
        energy: updatedData.energy,
        focus: updatedData.focus,
        note: updatedData.moodNotes,
        vehicleId: vehicleId || 1 // Default to 1 if not specified
      });

      // Update the telemetry history
      const updatedHistory = await getTelemetryChartData(vehicleId);
      setTelemetryHistory(updatedHistory);

      // Notify parent component of the update
      if (onTelemetryUpdate) {
        onTelemetryUpdate(updatedData);
      }

      return newEntry;
    } catch (error) {
      console.error('Error saving telemetry:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Mood & Energy Tracker */}
      <DynamicMoodEnergyTracker 
        driveData={driveData} 
        onUpdate={handleSaveTelemetry} 
      />

      {/* History Chart Toggle Button */}
      {telemetryHistory.length > 0 && (
        <div className="flex justify-end">
          <button 
            onClick={() => setShowHistoryChart(!showHistoryChart)}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Activity size={16} />
            <span>{showHistoryChart ? 'Hide History' : 'Show Telemetry History'}</span>
          </button>
        </div>
      )}

      {/* Telemetry History Chart */}
      {showHistoryChart && telemetryHistory.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-blue-400 font-orbitron text-lg mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Driver Telemetry History
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={telemetryHistory.slice(-14)} // Last 14 entries
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  tick={{fill: '#999', fontSize: 10}}
                  axisLine={{ stroke: '#333' }}
                />
                <YAxis 
                  domain={[0, 10]} 
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
                    const labels = {
                      mood: 'Driver Mood',
                      energy: 'Energy Level',
                      focus: 'Focus Level'
                    };
                    return [value, labels[name] || name];
                  }}
                  labelFormatter={(date) => `Date: ${date}`}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => {
                    const labels = {
                      mood: 'Driver Mood',
                      energy: 'Energy Level',
                      focus: 'Focus Level'
                    };
                    return <span style={{ color: '#fff', margin: '0 10px' }}>{labels[value] || value}</span>;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#3b82f6" 
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#22c55e" 
                  dot={{ stroke: '#22c55e', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="focus" 
                  stroke="#a855f7" 
                  dot={{ stroke: '#a855f7', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Telemetry Insights */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-xs text-gray-400 font-medium mb-1">MOOD TRENDS</div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-white text-sm">
                  {telemetryHistory.length > 1 ? 
                    (telemetryHistory[telemetryHistory.length - 1].mood > telemetryHistory[telemetryHistory.length - 2].mood ? 
                      'Improving' : 
                      (telemetryHistory[telemetryHistory.length - 1].mood < telemetryHistory[telemetryHistory.length - 2].mood ? 
                        'Declining' : 'Stable')) : 
                    'Not enough data'}
                </span>
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-xs text-gray-400 font-medium mb-1">ENERGY TRENDS</div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-white text-sm">
                  {telemetryHistory.length > 1 ? 
                    (telemetryHistory[telemetryHistory.length - 1].energy > telemetryHistory[telemetryHistory.length - 2].energy ? 
                      'Increasing' : 
                      (telemetryHistory[telemetryHistory.length - 1].energy < telemetryHistory[telemetryHistory.length - 2].energy ? 
                        'Decreasing' : 'Consistent')) : 
                    'Not enough data'}
                </span>
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-xs text-gray-400 font-medium mb-1">FOCUS TRENDS</div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-white text-sm">
                  {telemetryHistory.length > 1 ? 
                    (telemetryHistory[telemetryHistory.length - 1].focus > telemetryHistory[telemetryHistory.length - 2].focus ? 
                      'Sharpening' : 
                      (telemetryHistory[telemetryHistory.length - 1].focus < telemetryHistory[telemetryHistory.length - 2].focus ? 
                        'Waning' : 'Steady')) : 
                    'Not enough data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveJournalMoodEnergyTracker;