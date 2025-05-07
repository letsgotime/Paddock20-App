import React, { useState } from 'react';
import { useVehicle } from '@/hooks/useVehicle';
import { Car, Plus, Check, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const VehiclesWidget: React.FC = () => {
  const { vehicles, selectedVehicle, setSelectedVehicle } = useVehicle();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(selectedVehicle?.id || null);
  
  // Sets the selected vehicle and updates the selection state
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-blue-300 font-semibold">
          {vehicles.length > 0 ? 'Vehicle Fleet' : 'No Vehicles Added'}
        </h3>
        
        <Link 
          to="/garage/add-vehicle" 
          className="flex items-center text-xs bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 rounded px-2 py-1"
        >
          <Plus className="h-3 w-3 mr-1" />
          <span>Add</span>
        </Link>
      </div>
      
      {vehicles.length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {vehicles.map(vehicle => (
            <div 
              key={vehicle.id}
              onClick={() => handleVehicleSelect(vehicle.id)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all
                ${selectedVehicleId === vehicle.id 
                  ? 'bg-blue-900/40 border border-blue-700/60' 
                  : 'bg-blue-950/30 border border-blue-900/40 hover:bg-blue-900/30'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {vehicle.primaryImage ? (
                    <img 
                      src={vehicle.primaryImage} 
                      alt={vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
                      className="w-10 h-10 rounded-md object-cover bg-black/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-900/50 to-blue-700/30 flex items-center justify-center">
                      <Car className="h-5 w-5 text-blue-400" />
                    </div>
                  )}
                  
                  <div className="ml-3">
                    <p className="font-medium text-blue-200">
                      {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                      {selectedVehicleId === vehicle.id && (
                        <span className="ml-2 text-green-400 text-xs">
                          <Check className="h-3 w-3 inline" />
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                </div>
                
                {/* Last activity indicator */}
                <div className="text-right text-xs text-gray-500 flex flex-col items-end">
                  <div className="flex items-center mb-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{new Date(vehicle.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-blue-400">
                    {vehicle.color || 'Color not set'}
                  </span>
                </div>
              </div>
              
              {/* Quick status indicators */}
              <div className="mt-2 flex items-center space-x-2">
                <div className="bg-blue-900/30 rounded px-2 py-0.5 text-xs text-blue-300">
                  Maintenance: {vehicle.maintenanceItems?.length ? `${vehicle.maintenanceItems.length} items` : 'None'}
                </div>
                <div className="bg-blue-900/30 rounded px-2 py-0.5 text-xs text-blue-300">
                  Modifications: {vehicle.modifications ? 'Yes' : 'Stock'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-blue-900/30 rounded-full p-4 mb-3">
            <Car className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm mb-3">
            No vehicles in your collection yet
          </p>
          <Link 
            to="/garage/add-vehicle" 
            className="text-xs bg-blue-700 hover:bg-blue-600 text-white rounded-md px-3 py-1.5"
          >
            Add Your First Vehicle
          </Link>
        </div>
      )}
    </div>
  );
};

export default VehiclesWidget;