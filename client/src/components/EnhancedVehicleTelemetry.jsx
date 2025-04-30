import React from 'react';
import { 
  Gauge, Thermometer, Droplets, Battery, 
  Wind, Timer, RotateCw, Wrench, PaintBucket, Car, 
  Calendar, Fuel, Ruler, Activity, Map, Zap, SunMoon 
} from 'lucide-react';

/**
 * EnhancedVehicleTelemetry Component
 * Displays F1-inspired technical data for a vehicle with advanced visualizations
 */
const EnhancedVehicleTelemetry = ({ vehicle }) => {
  // This component is a wrapper around the regular VehicleTelemetry
  // with enhanced visualizations and additional F1-style metrics
  
  // Enhanced metrics specific to this component
  const enhancedMetrics = {
    drivingScore: 87,
    efficiencyScore: 92,
    maintenanceScore: 85,
    overallHealth: 88,
    lastChecked: '2025-04-28',
    topRecords: [
      { metric: 'Top Speed', value: '168 mph', date: '2025-03-17' },
      { metric: 'Best Quarter Mile', value: '11.8 sec', date: '2025-03-12' },
      { metric: 'Max Lateral G', value: '1.12 g', date: '2025-04-08' }
    ]
  };

  // Circular gauge component
  const CircularGauge = ({ value, label, color, size = 'md' }) => {
    const radius = size === 'lg' ? 50 : size === 'md' ? 40 : 30;
    const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
    const fontSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg';
    
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 100) * circumference;
    const strokeDashoffset = circumference - progress;
    
    let colorClass;
    if (value >= 80) colorClass = 'text-green-500';
    else if (value >= 60) colorClass = 'text-yellow-500';
    else colorClass = 'text-red-500';
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={(radius+strokeWidth)*2} height={(radius+strokeWidth)*2}>
            <circle
              className="text-gray-700"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={radius+strokeWidth}
              cy={radius+strokeWidth}
            />
            <circle
              className={colorClass}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={radius+strokeWidth}
              cy={radius+strokeWidth}
              style={{ 
                transform: 'rotate(-90deg)',
                transformOrigin: 'center'
              }}
            />
          </svg>
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: color }}
          >
            <span className={`${fontSize} font-bold`}>{value}</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-400">{label}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <h2 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
          <Gauge className="h-5 w-5 mr-2" />
          Enhanced F1 Telemetry
        </h2>
        
        {/* Vehicle Vitals Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-300 font-medium mb-4 border-b border-gray-700 pb-2">
              Vehicle Health Dashboard
            </h3>
            <div className="flex justify-around items-center">
              <CircularGauge 
                value={enhancedMetrics.drivingScore} 
                label="Driving" 
                color="#3b82f6" 
                size="md"
              />
              <CircularGauge 
                value={enhancedMetrics.efficiencyScore} 
                label="Efficiency" 
                color="#10b981" 
                size="md"
              />
              <CircularGauge 
                value={enhancedMetrics.maintenanceScore} 
                label="Maintenance" 
                color="#f59e0b" 
                size="md"
              />
            </div>
            <div className="mt-6 flex justify-center">
              <CircularGauge 
                value={enhancedMetrics.overallHealth} 
                label="Overall Score" 
                color="#3b82f6" 
                size="lg"
              />
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">
              Last diagnostic scan: {enhancedMetrics.lastChecked}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-300 font-medium mb-4 border-b border-gray-700 pb-2">
              Performance Records
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-700">
                  <th className="text-left pb-2">Metric</th>
                  <th className="text-right pb-2">Value</th>
                  <th className="text-right pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {enhancedMetrics.topRecords.map((record, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-3 text-gray-300">{record.metric}</td>
                    <td className="py-3 text-right text-blue-400 font-medium">{record.value}</td>
                    <td className="py-3 text-right text-gray-500">{record.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-4">
              <h4 className="text-gray-300 font-medium mb-2">Vehicle Specifications</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Engine:</span> 
                  <span className="text-gray-300 ml-2">3.0L Twin-Turbo</span>
                </div>
                <div>
                  <span className="text-gray-500">Power:</span> 
                  <span className="text-gray-300 ml-2">425 hp</span>
                </div>
                <div>
                  <span className="text-gray-500">Torque:</span> 
                  <span className="text-gray-300 ml-2">406 lb-ft</span>
                </div>
                <div>
                  <span className="text-gray-500">Weight:</span> 
                  <span className="text-gray-300 ml-2">3,415 lbs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Maintenance Alerts */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-gray-300 font-medium mb-4 border-b border-gray-700 pb-2 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-blue-400" />
            Vehicle Status
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center p-2 rounded bg-green-900/20 border border-green-900">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
              <div className="text-green-400">All systems nominal</div>
            </div>
            
            <div className="flex items-center p-2 rounded bg-yellow-900/20 border border-yellow-900">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3"></div>
              <div className="text-yellow-400">Oil change due in 1,240 miles</div>
            </div>
            
            <div className="flex items-center p-2 rounded bg-yellow-900/20 border border-yellow-900">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3"></div>
              <div className="text-yellow-400">Front brake pads at 28% remaining</div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-300 font-medium mb-4 border-b border-gray-700 pb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-400" />
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                <Gauge className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-300">Drive completed</div>
                <div className="text-xs text-gray-500">128 miles, 2h 14m, Avg speed: 57 mph</div>
                <div className="text-xs text-gray-500">April 28, 2025</div>
              </div>
            </div>
            
            <div className="flex">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                <Wrench className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-300">Maintenance performed</div>
                <div className="text-xs text-gray-500">Cooling system flush, Brake fluid change</div>
                <div className="text-xs text-gray-500">April 22, 2025</div>
              </div>
            </div>
            
            <div className="flex">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                <PaintBucket className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-300">Modification added</div>
                <div className="text-xs text-gray-500">Carbon fiber intake system</div>
                <div className="text-xs text-gray-500">April 15, 2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVehicleTelemetry;