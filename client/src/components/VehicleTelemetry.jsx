import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Thermometer, Gauge, Droplets, Activity, Battery, Clock, RefreshCw, Zap, Calendar } from 'lucide-react';

// F1-style telemetry colors
const TELEMETRY_COLORS = {
  cold: '#3b82f6', // blue
  optimal: '#22c55e', // green
  hot: '#ef4444',   // red
  warning: '#f59e0b', // amber
  neutral: '#94a3b8', // slate
};

function VehicleTelemetry({ vehicle }) {
  const [activeSensor, setActiveSensor] = useState('engine');
  const [timeRange, setTimeRange] = useState('1d');

  // Mock data for vehicle sensors - in a real app, this would come from databases or IoT devices
  const engineData = [
    { time: '09:00', temperature: 180, pressure: 28, rpm: 1200 },
    { time: '10:00', temperature: 190, pressure: 30, rpm: 3500 },
    { time: '11:00', temperature: 210, pressure: 32, rpm: 4200 },
    { time: '12:00', temperature: 205, pressure: 31, rpm: 2800 },
    { time: '13:00', temperature: 195, pressure: 29, rpm: 1500 },
    { time: '14:00', temperature: 188, pressure: 28, rpm: 1200 },
    { time: '15:00', temperature: 192, pressure: 30, rpm: 2500 },
  ];

  const drivingData = [
    { name: 'Cruising', value: 65 },
    { name: 'Spirited', value: 25 },
    { name: 'Track', value: 10 },
  ];
  
  const performanceData = [
    { name: 'Acceleration', current: 8.5, baseline: 9.2 },
    { name: 'Braking', current: 9.2, baseline: 8.8 },
    { name: 'Handling', current: 8.9, baseline: 8.5 },
    { name: 'Power', current: 8.7, baseline: 8.2 },
    { name: 'Efficiency', current: 7.8, baseline: 8.1 },
  ];

  const fuelEconomyData = [
    { period: 'Jan', mpg: 26.4 },
    { period: 'Feb', mpg: 25.8 },
    { period: 'Mar', mpg: 27.1 },
    { period: 'Apr', mpg: 28.3 },
    { period: 'May', mpg: 26.9 },
    { period: 'Jun', mpg: 25.4 },
    { period: 'Jul', mpg: 24.8 },
  ];

  const maintenanceScores = [
    { name: 'Engine', score: 92 },
    { name: 'Transmission', score: 88 },
    { name: 'Suspension', score: 95 },
    { name: 'Brakes', score: 85 },
    { name: 'Electrical', score: 97 },
  ];

  // Colors for the driving style pie chart
  const DRIVING_STYLE_COLORS = ['#22c55e', '#3b82f6', '#ef4444'];

  // Determine gauge value colors based on the value
  const getGaugeColor = (value, thresholds = { low: 33, high: 66 }) => {
    if (value < thresholds.low) return TELEMETRY_COLORS.cold;
    if (value > thresholds.high) return TELEMETRY_COLORS.hot;
    return TELEMETRY_COLORS.optimal;
  };

  // Calculate percentage from current value, min and max
  const calculatePercentage = (current, min, max) => {
    return ((current - min) / (max - min)) * 100;
  };

  // Render different content based on active sensor
  const renderSensorContent = () => {
    switch (activeSensor) {
      case 'engine':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
              <h4 className="text-blue-400 font-orbitron mb-4">ENGINE TELEMETRY</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={engineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis yAxisId="left" stroke="#f44336" />
                  <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} 
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#aaa' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f44336" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="rpm" stroke="#8884d8" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">OIL TEMPERATURE</h5>
                <div className="flex items-center">
                  <Thermometer className="text-red-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">195°F</p>
                    <p className="text-xs text-green-500">Optimal range</p>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">OIL PRESSURE</h5>
                <div className="flex items-center">
                  <Gauge className="text-blue-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">29 PSI</p>
                    <p className="text-xs text-green-500">Optimal range</p>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '70%' }}></div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">COOLANT TEMP</h5>
                <div className="flex items-center">
                  <Droplets className="text-blue-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">188°F</p>
                    <p className="text-xs text-green-500">Optimal range</p>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '55%' }}></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
              <h4 className="text-blue-400 font-orbitron mb-4">PERFORMANCE ANALYSIS</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis type="number" domain={[0, 10]} stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#aaa' }}
                  />
                  <Bar dataKey="baseline" fill="#8884d8" name="Before Mods" />
                  <Bar dataKey="current" fill="#22c55e" name="Current" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">Performance metrics on scale of 1-10 before and after modifications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">0-60 MPH TIME</h5>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="text-green-500 mr-3" size={24} />
                    <div>
                      <p className="text-2xl font-mono font-bold text-white">4.8s</p>
                      <p className="text-xs text-green-500">-0.7s from stock</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p>Stock: 5.5s</p>
                    <p>Best: 4.7s</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">QUARTER MILE</h5>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="text-blue-500 mr-3" size={24} />
                    <div>
                      <p className="text-2xl font-mono font-bold text-white">13.1s</p>
                      <p className="text-xs text-green-500">-0.9s from stock</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p>Stock: 14.0s</p>
                    <p>Best: 13.0s</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">BRAKING 60-0 MPH</h5>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="text-red-500 mr-3" size={24} />
                    <div>
                      <p className="text-2xl font-mono font-bold text-white">112 ft</p>
                      <p className="text-xs text-green-500">-15 ft from stock</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p>Stock: 127 ft</p>
                    <p>Best: 110 ft</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">MAX LATERAL G'S</h5>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="text-yellow-500 mr-3" size={24} />
                    <div>
                      <p className="text-2xl font-mono font-bold text-white">0.94 G</p>
                      <p className="text-xs text-green-500">+0.11 G from stock</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p>Stock: 0.83 G</p>
                    <p>Best: 0.96 G</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'driving':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h4 className="text-blue-400 font-orbitron mb-4">DRIVING STYLE ANALYSIS</h4>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={drivingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {drivingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DRIVING_STYLE_COLORS[index % DRIVING_STYLE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => [`${value}%`, 'Usage']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-2">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {drivingData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: DRIVING_STYLE_COLORS[index] }}></div>
                        <span className="text-xs text-gray-400">{item.name}</span>
                        <span className="text-sm text-white">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h4 className="text-blue-400 font-orbitron mb-4">FUEL ECONOMY HISTORY</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={fuelEconomyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="period" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#aaa' }}
                    />
                    <Line type="monotone" dataKey="mpg" stroke="#22c55e" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-between items-center text-center">
                  <div>
                    <h5 className="text-xs text-gray-400">AVERAGE MPG</h5>
                    <p className="text-xl font-mono font-bold text-white">26.4</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-400">BEST MPG</h5>
                    <p className="text-xl font-mono font-bold text-white">28.3</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-400">WORST MPG</h5>
                    <p className="text-xl font-mono font-bold text-white">24.8</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">AVERAGE TRIP LENGTH</h5>
                <div className="flex items-center">
                  <Clock className="text-blue-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">18.7 mi</p>
                    <p className="text-xs text-gray-400">Across 142 recorded trips</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">HARD ACCELERATION EVENTS</h5>
                <div className="flex items-center">
                  <Zap className="text-yellow-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">47</p>
                    <p className="text-xs text-gray-400">Last 30 days (12% decrease)</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">HARD BRAKING EVENTS</h5>
                <div className="flex items-center">
                  <Zap className="text-red-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">23</p>
                    <p className="text-xs text-gray-400">Last 30 days (8% increase)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
              <h4 className="text-blue-400 font-orbitron mb-4">VEHICLE HEALTH SCORES</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={maintenanceScores} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis domain={[0, 100]} stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#aaa' }}
                    formatter={(value) => [`${value}/100`, 'Health Score']}
                  />
                  <Bar dataKey="score">
                    {maintenanceScores.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.score > 90 ? '#22c55e' : 
                          entry.score > 75 ? '#3b82f6' : 
                          entry.score > 60 ? '#f59e0b' : '#ef4444'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">UPCOMING MAINTENANCE</h5>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <div className="flex items-center">
                      <RefreshCw className="text-yellow-500 mr-3" size={16} />
                      <span className="text-white">Oil Change</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-yellow-500">Due in 1,240 miles</span>
                    </div>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <div className="flex items-center">
                      <RefreshCw className="text-green-500 mr-3" size={16} />
                      <span className="text-white">Tire Rotation</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-green-500">Due in 3,580 miles</span>
                    </div>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <div className="flex items-center">
                      <RefreshCw className="text-green-500 mr-3" size={16} />
                      <span className="text-white">Brake Fluid</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-green-500">Due in 5,120 miles</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">COMPONENT LIFESPANS</h5>
                <ul className="space-y-3">
                  <li className="p-2 bg-gray-800/50 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white">Brake Pads (Front)</span>
                      <span className="text-sm text-gray-400">65% remaining</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '65%' }}></div>
                    </div>
                  </li>
                  <li className="p-2 bg-gray-800/50 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white">Air Filter</span>
                      <span className="text-sm text-gray-400">42% remaining</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: '42%' }}></div>
                    </div>
                  </li>
                  <li className="p-2 bg-gray-800/50 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white">Battery</span>
                      <span className="text-sm text-gray-400">88% health</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '88%' }}></div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">BATTERY HEALTH</h5>
                <div className="flex items-center">
                  <Battery className="text-green-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">88%</p>
                    <p className="text-xs text-gray-400">Est. replacement: 22 months</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">LAST SERVICE</h5>
                <div className="flex items-center">
                  <Calendar className="text-blue-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">43 days ago</p>
                    <p className="text-xs text-gray-400">Oil change & inspection</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                <h5 className="text-sm text-gray-400 mb-2">SERVICE COUNT</h5>
                <div className="flex items-center">
                  <RefreshCw className="text-blue-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">8</p>
                    <p className="text-xs text-gray-400">Recorded services in system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-400 p-4">Select a telemetry category</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sensor selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSensor('engine')}
          className={`px-4 py-2 rounded-lg flex items-center text-sm ${
            activeSensor === 'engine' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Thermometer size={16} className="mr-2" /> Engine
        </button>
        <button
          onClick={() => setActiveSensor('performance')}
          className={`px-4 py-2 rounded-lg flex items-center text-sm ${
            activeSensor === 'performance' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Activity size={16} className="mr-2" /> Performance
        </button>
        <button
          onClick={() => setActiveSensor('driving')}
          className={`px-4 py-2 rounded-lg flex items-center text-sm ${
            activeSensor === 'driving' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Gauge size={16} className="mr-2" /> Driving Style
        </button>
        <button
          onClick={() => setActiveSensor('maintenance')}
          className={`px-4 py-2 rounded-lg flex items-center text-sm ${
            activeSensor === 'maintenance' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <RefreshCw size={16} className="mr-2" /> Maintenance
        </button>
      </div>

      {/* Time range selector - disabled for now but can be used for historical data */}
      <div className="flex justify-end">
        <div className="flex rounded-lg overflow-hidden text-sm border border-gray-800">
          <button 
            className={`px-3 py-1 ${timeRange === '1d' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
            onClick={() => setTimeRange('1d')}
          >
            1D
          </button>
          <button 
            className={`px-3 py-1 ${timeRange === '1w' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
            onClick={() => setTimeRange('1w')}
          >
            1W
          </button>
          <button 
            className={`px-3 py-1 ${timeRange === '1m' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
            onClick={() => setTimeRange('1m')}
          >
            1M
          </button>
          <button 
            className={`px-3 py-1 ${timeRange === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
            onClick={() => setTimeRange('all')}
          >
            ALL
          </button>
        </div>
      </div>

      {/* Sensor content display */}
      {renderSensorContent()}
    </div>
  );
}

export default VehicleTelemetry;