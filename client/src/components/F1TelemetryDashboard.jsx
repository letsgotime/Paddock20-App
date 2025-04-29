import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, 
         PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ComposedChart,
         Scatter } from 'recharts';
import { 
  Activity, BarChart2, Wind, Thermometer, CornerUpRight, Zap,
  Clock, Calendar, PieChartIcon, AlertTriangle, TrendingUp, 
  Droplets, Car, Upload, Maximize2, ArrowDownCircle, ArrowUpCircle,
  Sliders, Check, X, ChevronDown, ChevronUp, Power, GitBranch, Gauge
} from 'lucide-react';
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
  secondary: '#f59e0b', // secondary data line color
  tertiary: '#22c55e', // tertiary data line color
  contrast: '#ffffff' // white - for high contrast elements
};

// Configurable dashboard section
function DashboardSection({ title, children, expanded, onToggleExpand, icon: IconComponent }) {
  return (
    <div className="bg-black border border-gray-800 rounded-lg mb-4 overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-900 transition-colors border-b border-gray-800"
        onClick={onToggleExpand}
      >
        <h3 className="text-blue-400 font-orbitron flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-5 w-5" />}
          {title}
        </h3>
        {expanded ? 
          <ChevronUp className="h-4 w-4 text-gray-400" /> : 
          <ChevronDown className="h-4 w-4 text-gray-400" />
        }
      </div>
      
      {expanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Data Card for quick metrics
function TelemetryDataCard({ title, value, unit, status, icon: IconComponent, description }) {
  // Determine status color
  const getStatusColor = () => {
    switch(status) {
      case 'optimal': return TELEMETRY_COLORS.optimal;
      case 'warning': return TELEMETRY_COLORS.warm;
      case 'critical': return TELEMETRY_COLORS.hot;
      case 'inactive': return '#4b5563'; // gray-600
      default: return TELEMETRY_COLORS.primary;
    }
  };
  
  const statusColor = getStatusColor();
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-blue-800 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" style={{ color: statusColor }} />}
          <h4 className="text-xs text-gray-400">{title}</h4>
        </div>
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: statusColor }}
        ></div>
      </div>
      
      <div className="flex items-end">
        <span className="text-lg font-medium text-white">{value}</span>
        {unit && <span className="text-sm text-gray-400 ml-1">{unit}</span>}
      </div>
      
      {description && (
        <div className="text-xs text-gray-500 mt-1">{description}</div>
      )}
    </div>
  );
}

// Performance Radar Chart
function PerformanceRadarSection({ vehicle, expanded, onToggleExpand }) {
  // Generate radar data based on vehicle specs and condition
  const generatePerformanceData = () => {
    const isSportsCar = vehicle?.category === 'sports' || vehicle?.horsepower > 350;
    const isLuxury = vehicle?.category === 'luxury';
    
    // Base values adjusted by vehicle type and condition
    const maxPower = isSportsCar ? 600 : isLuxury ? 450 : 350;
    const vehiclePower = vehicle?.horsepower || 300;
    const powerRatio = Math.min(100, (vehiclePower / maxPower) * 100);
    
    // Calculate performance metrics as percentages of theoretical maximums
    return [
      {
        subject: 'Power',
        A: powerRatio,
        B: isSportsCar ? 90 : isLuxury ? 75 : 65,
        fullMark: 100,
      },
      {
        subject: 'Handling',
        A: isSportsCar ? 85 : isLuxury ? 70 : 65,
        B: isSportsCar ? 95 : isLuxury ? 75 : 70,
        fullMark: 100,
      },
      {
        subject: 'Comfort',
        A: isSportsCar ? 65 : isLuxury ? 90 : 75,
        B: isSportsCar ? 60 : isLuxury ? 95 : 75,
        fullMark: 100,
      },
      {
        subject: 'Efficiency',
        A: isSportsCar ? 55 : isLuxury ? 65 : 80,
        B: isSportsCar ? 60 : isLuxury ? 70 : 85,
        fullMark: 100,
      },
      {
        subject: 'Tech',
        A: isLuxury ? 88 : isSportsCar ? 82 : 70,
        B: isLuxury ? 90 : isSportsCar ? 85 : 75,
        fullMark: 100,
      },
      {
        subject: 'Value',
        A: 75,
        B: 80,
        fullMark: 100,
      }
    ];
  };
  
  const radarData = generatePerformanceData();
  
  return (
    <DashboardSection 
      title="Performance Profile" 
      expanded={expanded} 
      onToggleExpand={onToggleExpand}
      icon={Activity}
    >
      <div className="h-72 bg-black">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#9ca3af', fontSize: 11 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              stroke="#444"
            />
            <Radar
              name="Current"
              dataKey="A"
              stroke={TELEMETRY_COLORS.primary}
              fill={TELEMETRY_COLORS.primary}
              fillOpacity={0.3}
            />
            <Radar
              name="Optimized"
              dataKey="B"
              stroke={TELEMETRY_COLORS.tertiary}
              fill={TELEMETRY_COLORS.tertiary}
              fillOpacity={0.15}
            />
            <Legend 
              iconSize={10}
              wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '0.25rem' }}
              labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-900/50 rounded p-2">
          <div className="text-xs text-gray-400">Power-to-Weight</div>
          <div className="text-sm font-medium text-white">
            {(((vehicle?.horsepower || 300) / (vehicle?.weight || 3500)) * 1000).toFixed(1)} hp/ton
          </div>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <div className="text-xs text-gray-400">0-60 mph</div>
          <div className="text-sm font-medium text-white">
            {vehicle?.zeroToSixty || '4.5'} sec
          </div>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <div className="text-xs text-gray-400">Top Speed</div>
          <div className="text-sm font-medium text-white">
            {vehicle?.topSpeed || '155'} mph
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}

// Engine Telemetry Section with multiple charts
function EngineTelemetrySection({ vehicle, expanded, onToggleExpand }) {
  // Generate random engine telemetry data
  const generateEngineTelemetryData = () => {
    const data = [];
    const totalPoints = 24; // 24 hours
    
    for (let i = 0; i < totalPoints; i++) {
      const time = i;
      
      // Base engine temp with daily cycle variation
      const baseTempCycle = Math.sin((i / totalPoints) * Math.PI * 2) * 15;
      const engineTemp = 180 + baseTempCycle + (Math.random() * 10 - 5);
      
      // Oil pressure varies with temperature and engine load
      const oilPressure = 40 + (Math.random() * 10) - (baseTempCycle / 10);
      
      // Engine load varies throughout the day
      const engineLoad = 35 + (Math.sin((i / totalPoints) * Math.PI * 4) * 25) + (Math.random() * 10);
      
      data.push({
        time,
        engineTemp: Math.round(engineTemp),
        oilPressure: oilPressure.toFixed(1),
        engineLoad: Math.round(engineLoad),
        coolantTemp: Math.round(engineTemp - 15 - (Math.random() * 5)),
        rpm: Math.round(700 + (engineLoad * 40) + (Math.random() * 100))
      });
    }
    
    return data;
  };
  
  const engineData = generateEngineTelemetryData();
  
  return (
    <DashboardSection 
      title="Engine Telemetry" 
      expanded={expanded} 
      onToggleExpand={onToggleExpand}
      icon={Gauge}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900/30 p-3 rounded-lg">
          <h4 className="text-blue-400 text-sm mb-2">Engine Temperature</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={engineData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#9ca3af', fontSize: 10 }} 
                  tickFormatter={(value) => `${value}:00`}
                  stroke="#444"
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 10 }} 
                  domain={[140, 220]}
                  stroke="#444"
                  tickFormatter={(value) => `${value}°F`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '0.25rem' }}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                  labelFormatter={(value) => `Time: ${value}:00`}
                />
                <defs>
                  <linearGradient id="engineTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TELEMETRY_COLORS.hot} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={TELEMETRY_COLORS.hot} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="engineTemp" 
                  stroke={TELEMETRY_COLORS.hot} 
                  fillOpacity={1}
                  fill="url(#engineTempGrad)"
                />
                <Area 
                  type="monotone" 
                  dataKey="coolantTemp" 
                  stroke={TELEMETRY_COLORS.cold} 
                  strokeDasharray="5 5"
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-900/30 p-3 rounded-lg">
          <h4 className="text-green-400 text-sm mb-2">Oil Pressure</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={engineData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#9ca3af', fontSize: 10 }} 
                  tickFormatter={(value) => `${value}:00`}
                  stroke="#444"
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 10 }} 
                  domain={[30, 50]}
                  stroke="#444"
                  tickFormatter={(value) => `${value} psi`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '0.25rem' }}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                  labelFormatter={(value) => `Time: ${value}:00`}
                />
                <Line 
                  type="monotone" 
                  dataKey="oilPressure" 
                  stroke={TELEMETRY_COLORS.oil} 
                  strokeWidth={2}
                  dot={{ stroke: TELEMETRY_COLORS.oil, fill: '#111', strokeWidth: 2, r: 3 }}
                  activeDot={{ stroke: TELEMETRY_COLORS.oil, fill: '#000', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900/30 p-3 rounded-lg">
        <h4 className="text-amber-400 text-sm mb-2">Engine Load & RPM Correlation</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={engineData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#9ca3af', fontSize: 10 }} 
                tickFormatter={(value) => `${value}:00`}
                stroke="#444"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: '#9ca3af', fontSize: 10 }} 
                domain={[0, 100]}
                stroke="#444"
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#9ca3af', fontSize: 10 }} 
                domain={[500, 3000]}
                stroke="#444"
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '0.25rem' }}
                labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                labelFormatter={(value) => `Time: ${value}:00`}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="engineLoad" 
                fill={TELEMETRY_COLORS.fuel}
                stroke={TELEMETRY_COLORS.fuel}
                fillOpacity={0.3}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="rpm" 
                stroke={TELEMETRY_COLORS.hot}
                strokeWidth={2}
                dot={false}
              />
              <Legend 
                iconSize={10} 
                wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardSection>
  );
}

// Tire Telemetry Section
function TireTelemetrySection({ vehicle, expanded, onToggleExpand }) {
  // Generate tire data based on vehicle information
  const generateTireData = () => {
    // Start with base tire pressures that would be optimal for the vehicle
    const baseTirePressure = vehicle?.tirePressureRecommended || 32;
    
    // Get tire health from vehicle data service or use default
    const tireHealthPercent = vehicleDataService.getTireHealthPercentage(vehicle) || 85;
    
    // Calculate tire wear based on health percentage
    const tireWearMM = 8 - ((tireHealthPercent / 100) * 8);
    
    // Generate individual tire data with slight variations
    return {
      frontLeft: {
        pressure: (baseTirePressure - 0.5 + (Math.random() * 0.7)).toFixed(1),
        temp: Math.round(95 + (Math.random() * 10)),
        wear: (tireWearMM + (Math.random() * 0.5)).toFixed(1)
      },
      frontRight: {
        pressure: (baseTirePressure - 0.3 + (Math.random() * 0.6)).toFixed(1),
        temp: Math.round(96 + (Math.random() * 11)),
        wear: (tireWearMM + 0.2 + (Math.random() * 0.5)).toFixed(1)
      },
      rearLeft: {
        pressure: (baseTirePressure + 0.2 + (Math.random() * 0.5)).toFixed(1),
        temp: Math.round(90 + (Math.random() * 12)),
        wear: (tireWearMM - 0.3 + (Math.random() * 0.6)).toFixed(1)
      },
      rearRight: {
        pressure: (baseTirePressure + 0.4 + (Math.random() * 0.4)).toFixed(1),
        temp: Math.round(92 + (Math.random() * 10)),
        wear: (tireWearMM - 0.1 + (Math.random() * 0.5)).toFixed(1)
      }
    };
  };
  
  const tireData = generateTireData();
  
  // Generate tire wear history data
  const generateTireWearHistory = () => {
    const data = [];
    const months = 9; // Show 9 months of data
    
    let initialWear = 0.5; // Starting wear in mm
    
    for (let i = 0; i < months; i++) {
      // Calculate date
      const date = new Date();
      date.setMonth(date.getMonth() - (months - i - 1));
      
      // Wear increases more rapidly during summer months
      const month = date.getMonth();
      let wearIncrease;
      
      if (month >= 5 && month <= 8) {
        // Summer - more rapid wear
        wearIncrease = 0.4 + (Math.random() * 0.3);
      } else if (month >= 11 || month <= 1) {
        // Winter - less wear
        wearIncrease = 0.2 + (Math.random() * 0.2);
      } else {
        // Spring/Fall - moderate wear
        wearIncrease = 0.3 + (Math.random() * 0.2);
      }
      
      initialWear += wearIncrease;
      
      data.push({
        date: date.toISOString(),
        wear: initialWear.toFixed(1)
      });
    }
    
    return data;
  };
  
  const wearHistoryData = generateTireWearHistory();
  
  return (
    <DashboardSection 
      title="Tire Telemetry" 
      expanded={expanded} 
      onToggleExpand={onToggleExpand}
      icon={Wind}
    >
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-900/30 rounded-lg p-3 flex flex-col items-center">
            <div className="text-xs text-center text-gray-400 mb-2">Front Left</div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="text-center">
                <div className="text-xs text-gray-500">Pressure</div>
                <div className="text-sm text-white">{tireData.frontLeft.pressure} <span className="text-xs text-gray-500">psi</span></div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Temp</div>
                <div className="text-sm text-white">{tireData.frontLeft.temp}°<span className="text-xs text-gray-500">F</span></div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Wear</div>
                <div className="text-sm text-white">{tireData.frontLeft.wear}<span className="text-xs text-gray-500">mm</span></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/30 rounded-lg p-3 flex flex-col items-center">
            <div className="text-xs text-center text-gray-400 mb-2">Front Right</div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="text-center">
                <div className="text-xs text-gray-500">Pressure</div>
                <div className="text-sm text-white">{tireData.frontRight.pressure} <span className="text-xs text-gray-500">psi</span></div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Temp</div>
                <div className="text-sm text-white">{tireData.frontRight.temp}°<span className="text-xs text-gray-500">F</span></div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Wear</div>
                <div className="text-sm text-white">{tireData.frontRight.wear}<span className="text-xs text-gray-500">mm</span></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/30 rounded-lg p-3 flex flex-col items-center">
            <div className="text-xs text-center text-gray-400 mb-2">Rear Left</div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="text-center">
                <div className="text-xs text-gray-500">Pressure</div>
                <div className="text-sm text-white">{tireData.rearLeft.pressure} <span className="text-xs text-gray-500">psi</span></div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Temp</div>
                <div className="text-sm text-white">{tireData.rearLeft.temp}°<span className="text-xs text-gray-500">F</span></div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Wear</div>
                <div className="text-sm text-white">{tireData.rearLeft.wear}<span className="text-xs text-gray-500">mm</span></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/30 rounded-lg p-3 flex flex-col items-center">
            <div className="text-xs text-center text-gray-400 mb-2">Rear Right</div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="text-center">
                <div className="text-xs text-gray-500">Pressure</div>
                <div className="text-sm text-white">{tireData.rearRight.pressure} <span className="text-xs text-gray-500">psi</span></div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Temp</div>
                <div className="text-sm text-white">{tireData.rearRight.temp}°<span className="text-xs text-gray-500">F</span></div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Wear</div>
                <div className="text-sm text-white">{tireData.rearRight.wear}<span className="text-xs text-gray-500">mm</span></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/30 rounded-lg p-3">
          <h4 className="text-blue-400 text-sm mb-2">Tread Wear History</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={wearHistoryData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#9ca3af', fontSize: 10 }} 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`;
                  }}
                  stroke="#444"
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 10 }} 
                  domain={[0, 8]}
                  stroke="#444"
                  tickFormatter={(value) => `${value}mm`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '0.25rem' }}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.toLocaleDateString()}`;
                  }}
                  formatter={(value) => [`${value}mm`, 'Tread Wear']}
                />
                <defs>
                  <linearGradient id="tireWearGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TELEMETRY_COLORS.warm} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={TELEMETRY_COLORS.warm} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="wear" 
                  stroke={TELEMETRY_COLORS.warm} 
                  fillOpacity={1}
                  fill="url(#tireWearGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900/50 rounded-lg p-3">
        <h4 className="text-gray-300 text-sm mb-2 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-400" />
          Tire Status
        </h4>
        <p className="text-xs text-gray-400 mb-3">
          Front tires showing slightly more wear than rear. Consider rotation in the next 1,000 miles for optimal wear pattern.
        </p>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Replacement Due</span>
          <span className="text-xs text-blue-400">~{Math.round(10000 * (vehicleDataService.getTireHealthPercentage(vehicle) / 100))} miles</span>
        </div>
      </div>
    </DashboardSection>
  );
}

// Gloss and Maintenance Tracking Section
function GlossMaintenanceSection({ vehicle, expanded, onToggleExpand }) {
  // Get days since last gloss boost
  const daysSinceGlossBoost = vehicleDataService.getDaysSinceLastGlossBoost(vehicle) || 30;
  
  // Get days until next service
  const daysUntilService = vehicleDataService.getDaysUntilNextService(vehicle) || 45;
  
  // Generate gloss performance data over time
  const generateGlossData = () => {
    const data = [];
    const days = 90; // Last 90 days
    
    // Start with current gloss level and work backwards
    let currentGloss = 100 - Math.min(100, daysSinceGlossBoost * 0.75);
    
    // Assume gloss was reset to 100% at lastGlossBoost
    const resetDate = vehicle?.glossTracking?.lastGlossBoost
      ? new Date(vehicle.glossTracking.lastGlossBoost)
      : new Date(new Date().setDate(new Date().getDate() - daysSinceGlossBoost));
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Check if this date is before the lastGlossBoost
      if (date < resetDate) {
        // Before the last gloss boost
        const daysBefore = Math.floor((resetDate - date) / (24 * 60 * 60 * 1000));
        // Decay rate increases the further back we go
        currentGloss = 100 - Math.min(100, daysBefore * 0.75);
      } else if (date.getTime() === resetDate.getTime()) {
        // Day of gloss boost
        currentGloss = 100;
      } else {
        // After gloss boost (i.e., recent days)
        const daysAfter = Math.floor((date - resetDate) / (24 * 60 * 60 * 1000));
        currentGloss = 100 - Math.min(100, daysAfter * 0.75);
      }
      
      // Add random minor fluctuations
      const glossWithNoise = Math.max(0, Math.min(100, currentGloss + (Math.random() * 4 - 2)));
      
      data.unshift({
        date: date.toISOString(),
        gloss: Math.round(glossWithNoise),
        protection: Math.round(glossWithNoise * 0.9 + (Math.random() * 2))
      });
    }
    
    return data;
  };
  
  const glossData = generateGlossData();
  
  return (
    <DashboardSection 
      title="Gloss & Maintenance" 
      expanded={expanded} 
      onToggleExpand={onToggleExpand}
      icon={Droplets}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900/30 p-3 rounded-lg">
          <h4 className="text-blue-400 text-sm mb-2">Gloss Performance</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={glossData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
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
                  domain={[0, 100]}
                  stroke="#444"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '0.25rem' }}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString();
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gloss" 
                  stroke={TELEMETRY_COLORS.primary} 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ stroke: TELEMETRY_COLORS.primary, fill: '#000', strokeWidth: 2, r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="protection" 
                  stroke={TELEMETRY_COLORS.oil} 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={{ stroke: TELEMETRY_COLORS.oil, fill: '#000', strokeWidth: 2, r: 5 }}
                />
                <Legend 
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-900/30 p-3 rounded-lg">
          <h4 className="text-green-400 text-sm mb-2">Maintenance Status</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Gloss Protection</span>
                <span className="text-xs text-white">{Math.max(0, 100 - daysSinceGlossBoost * 0.75).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500" 
                  style={{ width: `${Math.max(0, 100 - daysSinceGlossBoost * 0.75)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Last Boost: {daysSinceGlossBoost} days ago</span>
                <span className="text-xs text-blue-400">
                  {daysSinceGlossBoost > 90 ? 'Overdue' : daysSinceGlossBoost > 60 ? 'Due Soon' : 'Good'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Oil Life</span>
                <span className="text-xs text-white">{Math.max(0, 100 - (100 - (daysUntilService / 90) * 100)).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600" 
                  style={{ width: `${Math.max(0, 100 - (100 - (daysUntilService / 90) * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Next Service: {daysUntilService} days</span>
                <span className="text-xs text-green-400">
                  {daysUntilService < 0 ? 'Overdue' : daysUntilService < 14 ? 'Due Soon' : 'Scheduled'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Battery Health</span>
                <span className="text-xs text-white">92%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600" 
                  style={{ width: '92%' }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Voltage: 12.7V</span>
                <span className="text-xs text-yellow-400">
                  Good
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900/50 rounded-lg p-3">
        <h4 className="text-white text-sm mb-2">Upcoming Maintenance</h4>
        <ul className="space-y-2">
          <li className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-300">Oil Change</span>
            </div>
            <span className="text-gray-400">{daysUntilService} days</span>
          </li>
          <li className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-gray-300">Tire Rotation</span>
            </div>
            <span className="text-gray-400">1,021 miles</span>
          </li>
          <li className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-300">Brake Inspection</span>
            </div>
            <span className="text-gray-400">3,500 miles</span>
          </li>
          <li className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-300">Gloss Reset & Protection</span>
            </div>
            <span className="text-gray-400">{Math.max(0, 90 - daysSinceGlossBoost)} days</span>
          </li>
        </ul>
      </div>
    </DashboardSection>
  );
}

// Main component
function F1TelemetryDashboard({ vehicle }) {
  const [expandedSections, setExpandedSections] = useState({
    performance: true,
    engine: false,
    tires: false,
    gloss: false
  });
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
          F1-Style Telemetry Dashboard
        </h2>
        <div className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded-full flex items-center">
          <Zap className="h-4 w-4 mr-1 text-blue-400" /> 
          Live Data
        </div>
      </div>
      
      {/* Quick stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <TelemetryDataCard 
          title="Engine Temperature" 
          value="192" 
          unit="°F" 
          status="optimal" 
          icon={Thermometer}
          description="Operating in optimal range"
        />
        
        <TelemetryDataCard 
          title="Oil Pressure" 
          value="42.3" 
          unit="psi" 
          status="optimal" 
          icon={Droplets}
          description="Stable under all conditions"
        />
        
        <TelemetryDataCard 
          title="Battery Health" 
          value="92" 
          unit="%" 
          status="optimal" 
          icon={Power}
          description="12.7V at rest, 14.2V charging"
        />
        
        <TelemetryDataCard 
          title="Tire Pressure Avg" 
          value="32.6" 
          unit="psi" 
          status={vehicle?.tireStatus === "needs_attention" ? "warning" : "optimal"} 
          icon={Wind}
          description={vehicle?.tireStatus === "needs_attention" ? "Check rear right tire" : "All tires within spec"}
        />
      </div>
      
      {/* Dashboard sections */}
      <PerformanceRadarSection 
        vehicle={vehicle} 
        expanded={expandedSections.performance}
        onToggleExpand={() => toggleSection('performance')}
      />
      
      <EngineTelemetrySection 
        vehicle={vehicle} 
        expanded={expandedSections.engine}
        onToggleExpand={() => toggleSection('engine')}
      />
      
      <TireTelemetrySection 
        vehicle={vehicle} 
        expanded={expandedSections.tires}
        onToggleExpand={() => toggleSection('tires')}
      />
      
      <GlossMaintenanceSection 
        vehicle={vehicle} 
        expanded={expandedSections.gloss}
        onToggleExpand={() => toggleSection('gloss')}
      />
      
      <div className="text-xs text-center text-gray-500 mt-4">
        Telemetry data is refreshed every 5 minutes. Last update: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

export default F1TelemetryDashboard;