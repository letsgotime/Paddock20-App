import React from 'react';
import { useVehicle } from '@/hooks/useVehicle';
import { AlertTriangle, Check, Clock, Wrench, ArrowRight } from 'lucide-react';

// Mock maintenance items for development
interface MaintenanceItem {
  id: string;
  vehicleId: string;
  title: string;
  description: string;
  dueDate: string;
  dueMileage: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'upcoming' | 'overdue' | 'completed';
}

const MaintenanceWidget: React.FC = () => {
  const { vehicles, activeVehicle } = useVehicle();
  
  // Get the currently displayed vehicle
  const displayVehicle = activeVehicle || (vehicles.length > 0 ? vehicles[0] : null);
  
  // Mock maintenance items - in a real implementation this would come from an API or context
  const maintenanceItems: MaintenanceItem[] = [
    {
      id: '1',
      vehicleId: displayVehicle?.id || '',
      title: 'Oil Change',
      description: 'Regular oil change with filter replacement',
      dueDate: '2025-05-15',
      dueMileage: displayVehicle?.mileage ? displayVehicle.mileage + 1200 : 0,
      urgency: 'medium',
      status: 'upcoming',
    },
    {
      id: '2',
      vehicleId: displayVehicle?.id || '',
      title: 'Brake Pads',
      description: 'Front brake pads replacement',
      dueDate: '2025-04-28',
      dueMileage: displayVehicle?.mileage ? displayVehicle.mileage - 200 : 0,
      urgency: 'high',
      status: 'overdue',
    },
    {
      id: '3',
      vehicleId: displayVehicle?.id || '',
      title: 'Tire Rotation',
      description: 'Rotate tires to ensure even wear',
      dueDate: '2025-06-10',
      dueMileage: displayVehicle?.mileage ? displayVehicle.mileage + 3500 : 0,
      urgency: 'low',
      status: 'upcoming',
    }
  ];
  
  // Filter maintenance items for the displayed vehicle
  const filteredItems = displayVehicle 
    ? maintenanceItems.filter(item => item.vehicleId === displayVehicle.id)
    : [];
  
  // Sort by urgency and status
  const sortedItems = [...filteredItems].sort((a, b) => {
    // First by status (overdue first)
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    
    // Then by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
  
  // Get status icon and color based on maintenance item
  const getStatusInfo = (item: MaintenanceItem) => {
    switch (item.status) {
      case 'overdue':
        return { 
          icon: <AlertTriangle className="h-4 w-4" />, 
          color: 'text-red-500', 
          bgColor: 'bg-red-950/20' 
        };
      case 'upcoming':
        return { 
          icon: <Clock className="h-4 w-4" />, 
          color: 'text-yellow-500', 
          bgColor: 'bg-yellow-950/20' 
        };
      case 'completed':
        return { 
          icon: <Check className="h-4 w-4" />, 
          color: 'text-green-500', 
          bgColor: 'bg-green-950/20' 
        };
      default:
        return { 
          icon: <Wrench className="h-4 w-4" />, 
          color: 'text-blue-500', 
          bgColor: 'bg-blue-950/20' 
        };
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-blue-300 font-semibold">
          {displayVehicle ? `${displayVehicle.displayName} Maintenance` : 'No Vehicle Selected'}
        </h3>
      </div>
      
      {displayVehicle ? (
        <>
          {sortedItems.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-2">
              {sortedItems.map(item => {
                const { icon, color, bgColor } = getStatusInfo(item);
                
                return (
                  <div 
                    key={item.id}
                    className="p-2 rounded-lg border border-blue-900/40 bg-blue-950/20 hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className={`p-1.5 rounded-md ${bgColor} ${color} mr-2 mt-0.5`}>
                        {icon}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-blue-200">{item.title}</h4>
                        <p className="text-xs text-gray-400 mb-1">{item.description}</p>
                        
                        <div className="flex items-center flex-wrap">
                          <span className={`text-xs ${color} px-1.5 py-0.5 rounded-full border border-opacity-30 mr-2 ${color === 'text-red-500' ? 'border-red-500' : color === 'text-yellow-500' ? 'border-yellow-500' : 'border-blue-500'}`}>
                            {item.status === 'overdue' ? 'Overdue' : 
                             item.status === 'upcoming' ? 'Upcoming' : 
                             item.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                          
                          <span className="text-xs text-gray-400">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-2">
                <button className="w-full text-center text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center">
                  View All Maintenance
                  <ArrowRight className="h-3 w-3 ml-1" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-900/30 rounded-full p-3 mb-2">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm">
                No maintenance tasks for this vehicle
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-blue-900/30 rounded-full p-3 mb-2">
            <Wrench className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm">
            Select a vehicle to view maintenance tasks
          </p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceWidget;