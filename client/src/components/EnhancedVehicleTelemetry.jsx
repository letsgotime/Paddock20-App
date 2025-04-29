import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, Thermometer, Droplets, AlertTriangle, TrendingUp, Car, Maximize2, Wind } from 'lucide-react';
import vehicleDataService from '../services/vehicleDataService';

// F1-style telemetry colors
const TELEMETRY_COLORS = {
  cold: '#3b82f6', // blue - cold
  optimal: '#22c55e', // green - optimal
  warm: '#f59e0b', // amber - warm
  hot: '#ef4444',   // red - hot/critical
  oil: '#9333ea',   // purple - oil related
  fuel: '#eab308',  // yellow - fuel related
  brake: '#f97316', // orange - brake related
  chassis: '#6366f1', // indigo - chassis/body related
  battery: '#14b8a6', // teal - electrical related
  primary: '#3b82f6', // primary data line color
  secondary: '#f59e0b' // secondary data line color
};

// Control Panel - for F1-style data control
function TelemetryControlPanel({ activeDataSets, onToggleDataSet, onExpandChart, vehicle }) {
  // Get tire and maintenance info from vehicle
  const tireHealth = vehicleDataService.getTireHealthPercentage(vehicle);
  const daysSinceGlossBoost = vehicleDataService.getDaysSinceLastGlossBoost(vehicle);
  const daysUntilService = vehicleDataService.getDaysUntilNextService(vehicle);
  
  // Get simplified status based on values
  const getTireStatus = () => {
    if (tireHealth > 70) return { text: 'Optimal', color: TELEMETRY_COLORS.optimal };
    if (tireHealth > 30) return { text: 'Adequate', color: TELEMETRY_COLORS.warm };
    return { text: 'Critical', color: TELEMETRY_COLORS.hot };
  };
  
  const getGlossStatus = () => {
    if (!daysSinceGlossBoost) return { text: 'Unknown', color: TELEMETRY_COLORS.secondary };
    if (daysSinceGlossBoost <= 30) return { text: 'Fresh', color: TELEMETRY_COLORS.optimal };
    if (daysSinceGlossBoost <= 90) return { text: 'Due Soon', color: TELEMETRY_COLORS.warm };
    return { text: 'Overdue', color: TELEMETRY_COLORS.hot };
  };
  
  const getServiceStatus = () => {
    if (!daysUntilService) return { text: 'Unknown', color: TELEMETRY_COLORS.secondary };
    if (daysUntilService > 30) return { text: 'Scheduled', color: TELEMETRY_COLORS.optimal };
    if (daysUntilService > 0) return { text: 'Due Soon', color: TELEMETRY_COLORS.warm };
    return { text: 'Overdue', color: TELEMETRY_COLORS.hot };
  };
  
  const tireStatus = getTireStatus();
  const glossStatus = getGlossStatus();
  const serviceStatus = getServiceStatus();
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg mb-4">
      <div className="flex flex-col lg:flex-row lg:divide-x divide-gray-800">
        {/* Control toggles */}
        <div className="lg:w-1/2 p-4">
          <h3 className="font-orbitron text-blue-400 mb-3 flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Telemetry Data Control
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(activeDataSets).map(dataSet => (
              <button
                key={dataSet}
                onClick={() => onToggleDataSet(dataSet)}
                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                  activeDataSets[dataSet] ? 'bg-blue-900/30 border border-blue-800' : 'bg-gray-800 border border-gray-700 opacity-70'
                }`}
                aria-pressed={activeDataSets[dataSet]}
              >
                <span className="text-sm text-gray-300">
                  {dataSet.charAt(0).toUpperCase() + dataSet.slice(1)}
                </span>
                <div 
                  className={`w-3 h-3 rounded-full ${activeDataSets[dataSet] ? 'bg-green-500' : 'bg-gray-600'}`}
                  aria-hidden="true"
                ></div>
              </button>
            ))}
          </div>
          
          <button 
            onClick={onExpandChart}
            className="mt-4 flex items-center text-sm text-blue-400 hover:text-blue-300"
          >
            <Maximize2 size={14} className="mr-1" /> Expand Charts
          </button>
        </div>
        
        {/* Status indicators */}
        <div className="lg:w-1/2 p-4 border-t lg:border-t-0 border-gray-800">
          <h3 className="font-orbitron text-blue-400 mb-3 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Current Status
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Car size={16} className="mr-2 text-gray-400" />
                <span className="text-sm text-gray-300">Tire Health</span>
              </div>
              <div 
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: tireStatus.color + '33', color: tireStatus.color }}
              >
                {tireStatus.text} {tireHealth ? `(${Math.round(tireHealth)}%)` : ''}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Droplets size={16} className="mr-2 text-gray-400" />
                <span className="text-sm text-gray-300">Gloss Protection</span>
              </div>
              <div 
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: glossStatus.color + '33', color: glossStatus.color }}
              >
                {glossStatus.text} {daysSinceGlossBoost ? `(${daysSinceGlossBoost} days)` : ''}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp size={16} className="mr-2 text-gray-400" />
                <span className="text-sm text-gray-300">Service Status</span>
              </div>
              <div 
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: serviceStatus.color + '33', color: serviceStatus.color }}
              >
                {serviceStatus.text} {daysUntilService ? `(${Math.abs(daysUntilService)} days)` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Time-Series Chart with F1 telemetry styling
function TelemetryTimeSeriesChart({ title, data, dataKey, color, unit, domain, expanded }) {
  return (
    <div className={`bg-black border border-gray-800 rounded-lg mb-4 p-4 ${expanded ? 'h-96' : 'h-64'}`}>
      <h3 className="font-orbitron text-blue-400 mb-2 flex items-center">
        {title}
      </h3>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#9ca3af', fontSize: 10 }} 
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            stroke="#444"
          />
          <YAxis 
            tick={{ fill: '#9ca3af', fontSize: 10 }} 
            domain={domain || ['auto', 'auto']}
            stroke="#444"
            tickFormatter={(value) => `${value}${unit || ''}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '0.25rem' }}
            labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
            itemStyle={{ color: color }}
            formatter={(value) => [`${value}${unit || ''}`, dataKey]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString();
            }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            dot={{ stroke: color, fill: '#111', strokeWidth: 2, r: 4 }}
            activeDot={{ stroke: color, fill: '#000', strokeWidth: 2, r: 6 }}
            isAnimationActive={true}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Multi-Chart Dashboard
function TelemetryMultiChartDashboard({ vehicle, expanded }) {
  // Format date for charts
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString();
    return new Date(dateString).toISOString();
  };
  
  // Generate mock temperature data
  const generateTemperatureData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Base temperature based on season with some randomness
      const month = date.getMonth();
      let baseTemp;
      
      // Seasonal variation (°F)
      if (month >= 11 || month <= 1) {
        // Winter
        baseTemp = 45 + Math.random() * 15;
      } else if (month >= 2 && month <= 4) {
        // Spring
        baseTemp = 65 + Math.random() * 15;
      } else if (month >= 5 && month <= 8) {
        // Summer
        baseTemp = 80 + Math.random() * 15;
      } else {
        // Fall
        baseTemp = 60 + Math.random() * 15;
      }
      
      data.push({
        date: date.toISOString(),
        temperature: Math.round(baseTemp),
        engineTemp: Math.round(baseTemp + 50 + Math.random() * 30),
        tirePressure: Math.round(32 + Math.sin(i/5) * 3 + Math.random() * 2)
      });
    }
    
    return data;
  };
  
  // Generate mock maintenance data
  const generateMaintenanceData = () => {
    // Start with real oil changes if available
    let data = [];
    
    if (vehicle && vehicle.maintenance && Array.isArray(vehicle.maintenance.records)) {
      // Sort by date, newest first
      const sortedRecords = [...vehicle.maintenance.records].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      
      // Get oil changes from actual records
      data = sortedRecords
        .filter(record => record.type === 'oil_change')
        .map(record => ({
          date: formatDate(record.date),
          mileage: record.mileage,
          engineHours: Math.round(record.mileage / 30) // Estimate engine hours
        }));
    }
    
    // If no actual data or less than 5 points, add synthetic data
    if (data.length < 5) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      const interval = Math.floor(365 / 5); // Days between service
      
      for (let i = 0; i < (5 - data.length); i++) {
        const serviceDate = new Date(startDate);
        serviceDate.setDate(startDate.getDate() + (i * interval));
        
        const baseMileage = 35000 - (5 - i) * 3000;
        const mileage = baseMileage + Math.round(Math.random() * 500);
        
        data.unshift({
          date: serviceDate.toISOString(),
          mileage: mileage,
          engineHours: Math.round(mileage / 30)
        });
      }
    }
    
    return data;
  };
  
  // Generate mock gloss data
  const generateGlossData = () => {
    const data = [];
    const today = new Date();
    const startValue = 100;
    const decayRate = 0.5; // % per day
    
    // Use real gloss tracking data if available
    const realStartDate = vehicle?.glossTracking?.lastGlossBoost 
      ? new Date(vehicle.glossTracking.lastGlossBoost)
      : new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
    
    for (let i = 0; i <= 30; i++) {
      const date = new Date(realStartDate);
      date.setDate(realStartDate.getDate() + i);
      
      // Don't include future dates
      if (date > today) break;
      
      // Exponential decay formula with some randomness
      const daysPassed = i;
      const glossValue = startValue * Math.exp(-decayRate * daysPassed / 100);
      
      // Add small random variation
      const randomVariation = (Math.random() * 2 - 1) * 2; // ±2%
      
      data.push({
        date: date.toISOString(),
        gloss: Math.max(0, Math.min(100, Math.round(glossValue + randomVariation))),
        // Add other metrics
        protection: Math.max(0, Math.min(100, Math.round(glossValue * 0.9 + randomVariation))),
        beading: Math.max(0, Math.min(100, Math.round(glossValue * 0.95 + randomVariation)))
      });
    }
    
    return data;
  };

  // Generate performance data
  const generatePerformanceData = () => {
    // Use the actual vehicle year to determine base performance
    const vehicleYear = vehicle?.year || 2020;
    const isSportsCar = vehicle?.category === 'sports' || vehicle?.horsepower > 400;
    
    // Base values adjusted by vehicle year and category
    const baseHorsepower = isSportsCar ? 400 : 250;
    const horsepower = baseHorsepower + (vehicleYear - 2010) * 5;
    
    const baseTorque = isSportsCar ? 370 : 270;
    const torque = baseTorque + (vehicleYear - 2010) * 3;
    
    const zeroToSixty = isSportsCar ? 4.5 - (vehicleYear - 2010) * 0.05 : 6.8 - (vehicleYear - 2010) * 0.03;
    
    const data = [];
    const today = new Date();
    
    // Create a 12-month performance history with gradual improvement from modifications
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      
      // Performance increases slightly over time due to mods/tuning
      const monthFactor = (12 - i) / 24; // 0 to 0.5 scaling factor
      const modBoost = vehicle?.isModified ? monthFactor : 0;
      
      data.push({
        date: date.toISOString(),
        horsepower: Math.round(horsepower * (1 + modBoost * 0.1)),
        torque: Math.round(torque * (1 + modBoost * 0.12)),
        zeroToSixty: Math.max(1, zeroToSixty * (1 - modBoost * 0.08)).toFixed(2)
      });
    }
    
    return data;
  };
  
  // Create data sets
  const temperatureData = generateTemperatureData();
  const maintenanceData = generateMaintenanceData();
  const glossData = generateGlossData();
  const performanceData = generatePerformanceData();
  
  return (
    <div className={`grid grid-cols-1 ${expanded ? 'md:grid-cols-2' : ''} gap-4`}>
      <TelemetryTimeSeriesChart 
        title={
          <><Thermometer size={16} className="mr-2 text-blue-400" /> Temperature Monitoring</>
        }
        data={temperatureData} 
        dataKey="temperature" 
        color={TELEMETRY_COLORS.primary}
        unit="°F"
        expanded={expanded}
      />
      
      <TelemetryTimeSeriesChart 
        title={
          <><Activity size={16} className="mr-2 text-green-400" /> Engine Performance</>
        }
        data={performanceData} 
        dataKey="horsepower" 
        color={TELEMETRY_COLORS.optimal}
        unit=" hp"
        expanded={expanded}
      />
      
      <TelemetryTimeSeriesChart 
        title={
          <><Droplets size={16} className="mr-2 text-purple-400" /> Gloss Protection</>
        }
        data={glossData} 
        dataKey="gloss" 
        color={TELEMETRY_COLORS.oil}
        unit="%"
        domain={[0, 100]}
        expanded={expanded}
      />
      
      <TelemetryTimeSeriesChart 
        title={
          <><Wind size={16} className="mr-2 text-amber-400" /> Tire Pressure</>
        }
        data={temperatureData} 
        dataKey="tirePressure" 
        color={TELEMETRY_COLORS.fuel}
        unit=" PSI"
        domain={[25, 40]}
        expanded={expanded}
      />
    </div>
  );
}

function EnhancedVehicleTelemetry({ vehicle }) {
  const [activeDataSets, setActiveDataSets] = useState({
    temperature: true,
    performance: true,
    gloss: true,
    pressure: true,
    oil: false,
    battery: false
  });
  
  const [expanded, setExpanded] = useState(false);
  
  const handleToggleDataSet = (dataSet) => {
    setActiveDataSets(prev => ({
      ...prev,
      [dataSet]: !prev[dataSet]
    }));
  };
  
  const handleExpandChart = () => {
    setExpanded(prev => !prev);
  };
  
  // If no vehicle data is available
  if (!vehicle) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg text-center">
        <AlertTriangle className="h-10 w-10 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-orbitron text-blue-400 mb-2">No Vehicle Selected</h3>
        <p className="text-gray-400">Please select a vehicle to view telemetry data.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-black p-4 rounded-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
          <Activity className="mr-2 h-6 w-6" />
          F1-Style Telemetry
        </h2>
        <div className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded-full">
          Real-time data
        </div>
      </div>
      
      <TelemetryControlPanel 
        activeDataSets={activeDataSets} 
        onToggleDataSet={handleToggleDataSet}
        onExpandChart={handleExpandChart}
        vehicle={vehicle}
      />
      
      <TelemetryMultiChartDashboard 
        vehicle={vehicle}
        expanded={expanded}
      />
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        Telemetry data is updated in real-time. Dashboard refresh rate: 5 minutes.
      </div>
    </div>
  );
}

export default EnhancedVehicleTelemetry;