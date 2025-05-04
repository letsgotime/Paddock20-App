import React from 'react';
import { 
  Car, Wrench, SparkleIcon, Map, Book, Calendar, 
  RefreshCw, Clock, Zap, Droplets, Gauge, BarChart2 
} from 'lucide-react';
import { Vehicle } from '../hooks/useVehicle';

// Define activity types
interface ActivityCount {
  funDrives: number;
  modifications: number;
  detailingActivities: number;
  maintenanceLogs: number;
  journalEntries: number;
  totalPoints: number;
  lastActivity?: string;
}

// Mock data service - in a real implementation, this would fetch from your database
const getVehicleActivityCounts = (vehicleId: string): ActivityCount => {
  // This would normally be an API call or database query
  // For now we're generating semi-random but consistent counts based on vehicle ID
  const hash = vehicleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    funDrives: Math.max(1, hash % 10), 
    modifications: Math.max(1, (hash % 7) + 1),
    detailingActivities: Math.max(2, (hash % 12) + 1),
    maintenanceLogs: Math.max(1, (hash % 6) + 2),
    journalEntries: Math.max(3, (hash % 15)),
    totalPoints: Math.max(50, hash * 10 % 500),
    lastActivity: new Date(Date.now() - (hash % 10) * 24 * 60 * 60 * 1000).toLocaleDateString()
  };
};

interface VehicleActivitySummaryProps {
  vehicle: Vehicle;
  compact?: boolean;
}

const VehicleActivitySummary: React.FC<VehicleActivitySummaryProps> = ({ 
  vehicle,
  compact = false
}) => {
  const activityCounts = getVehicleActivityCounts(vehicle.id);
  
  if (compact) {
    return (
      <div className="bg-gray-900/60 border border-blue-900/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-orbitron text-sm mb-3 flex items-center">
          <BarChart2 size={16} className="mr-2" />
          Activity Summary
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-800/70 rounded p-2">
            <div className="text-blue-300 text-xl font-semibold">{activityCounts.totalPoints}</div>
            <div className="text-gray-400 text-xs">Points</div>
          </div>
          <div className="bg-gray-800/70 rounded p-2">
            <div className="text-green-300 text-xl font-semibold">
              {activityCounts.detailingActivities + activityCounts.funDrives + activityCounts.maintenanceLogs}
            </div>
            <div className="text-gray-400 text-xs">Activities</div>
          </div>
          <div className="bg-gray-800/70 rounded p-2">
            <div className="text-amber-300 text-xl font-semibold">{activityCounts.modifications}</div>
            <div className="text-gray-400 text-xs">Mods</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/60 border border-blue-900/30 rounded-lg p-4">
      <h3 className="text-blue-400 font-orbitron text-lg mb-4 flex items-center">
        <BarChart2 size={18} className="mr-2" />
        Vehicle Activity Dashboard
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <div className="bg-gray-800/70 rounded p-3 text-center">
          <div className="flex justify-center mb-2">
            <Map size={24} className="text-blue-400" />
          </div>
          <div className="text-white text-xl font-semibold">{activityCounts.funDrives}</div>
          <div className="text-gray-400 text-xs">Fun Drives</div>
        </div>
        
        <div className="bg-gray-800/70 rounded p-3 text-center">
          <div className="flex justify-center mb-2">
            <Wrench size={24} className="text-amber-400" />
          </div>
          <div className="text-white text-xl font-semibold">{activityCounts.modifications}</div>
          <div className="text-gray-400 text-xs">Mods</div>
        </div>
        
        <div className="bg-gray-800/70 rounded p-3 text-center">
          <div className="flex justify-center mb-2">
            <SparkleIcon size={24} className="text-green-400" />
          </div>
          <div className="text-white text-xl font-semibold">{activityCounts.detailingActivities}</div>
          <div className="text-gray-400 text-xs">Detailing</div>
        </div>
        
        <div className="bg-gray-800/70 rounded p-3 text-center">
          <div className="flex justify-center mb-2">
            <Gauge size={24} className="text-red-400" />
          </div>
          <div className="text-white text-xl font-semibold">{activityCounts.maintenanceLogs}</div>
          <div className="text-gray-400 text-xs">Maintenance</div>
        </div>
        
        <div className="bg-gray-800/70 rounded p-3 text-center">
          <div className="flex justify-center mb-2">
            <Book size={24} className="text-purple-400" />
          </div>
          <div className="text-white text-xl font-semibold">{activityCounts.journalEntries}</div>
          <div className="text-gray-400 text-xs">Journal Entries</div>
        </div>
        
        <div className="bg-blue-900/30 rounded p-3 text-center">
          <div className="flex justify-center mb-2">
            <Zap size={24} className="text-amber-400" />
          </div>
          <div className="text-amber-300 text-xl font-semibold">{activityCounts.totalPoints}</div>
          <div className="text-gray-400 text-xs">Total Points</div>
        </div>
      </div>
      
      <div className="bg-black/40 rounded-lg p-3 border border-blue-900/20">
        <h4 className="text-blue-300 text-sm font-medium mb-2">Activity Timeline</h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar size={14} className="text-gray-400 mr-2" />
            <span className="text-gray-400">Last Activity:</span>
            <span className="text-white ml-2">{activityCounts.lastActivity}</span>
          </div>
          <div className="flex items-center text-sm">
            <RefreshCw size={14} className="text-gray-400 mr-2" />
            <span className="text-gray-400">Maintenance Due:</span>
            <span className="text-white ml-2">
              {vehicle.mileage ? `${vehicle.mileage + 5000} miles` : "Not set"}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Clock size={14} className="text-gray-400 mr-2" />
            <span className="text-gray-400">Vehicle Age:</span>
            <span className="text-white ml-2">
              {vehicle.year ? `${new Date().getFullYear() - parseInt(vehicle.year)} years` : "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleActivitySummary;