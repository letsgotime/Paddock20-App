import React, { useState } from 'react';
import { useVehicle } from '../contexts/VehicleContext';
import { ChevronRight, Check, Car } from 'lucide-react';
import { playMotorsportSound } from '../services/soundService';

const VehicleSelector = () => {
  const { vehicles, activeVehicle, setActiveVehicle } = useVehicle();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVehicleSelect = (vehicle: any) => {
    setActiveVehicle(vehicle);
    setIsExpanded(false);
    // Play selection sound
    playMotorsportSound('menu_select');
  };

  return (
    <div className="relative">
      {/* Current Vehicle Display */}
      <div 
        className="bg-black/50 border border-blue-900/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-black/70 transition-colors"
        onClick={() => {
          setIsExpanded(!isExpanded);
          playMotorsportSound('toggle_switch');
        }}
      >
        <div className="flex items-center">
          <div className="h-12 w-12 bg-gray-800 rounded flex items-center justify-center mr-3 overflow-hidden">
            {activeVehicle?.vehicle_image ? (
              <img 
                src={activeVehicle.vehicle_image} 
                alt={activeVehicle.make + ' ' + activeVehicle.model} 
                className="h-full w-full object-cover"
              />
            ) : (
              <Car className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium">
              {activeVehicle ? 
                (activeVehicle.nickname || `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`) 
                : 'Select a vehicle'}
            </h3>
            {activeVehicle && !activeVehicle.nickname && (
              <p className="text-xs text-gray-400">{activeVehicle.color || 'No color specified'}</p>
            )}
            {activeVehicle && activeVehicle.nickname && (
              <p className="text-xs text-gray-400">{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</p>
            )}
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
      </div>

      {/* Vehicle Selection Dropdown */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-blue-900/40 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {vehicles.length > 0 ? (
            <div className="py-1">
              {vehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className={`px-3 py-2 flex items-center cursor-pointer ${
                    activeVehicle?.id === vehicle.id 
                      ? 'bg-blue-900/40 text-white' 
                      : 'hover:bg-blue-900/20 text-gray-200'
                  }`}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="h-10 w-10 bg-gray-800 rounded flex items-center justify-center mr-3 overflow-hidden">
                    {vehicle.vehicle_image ? (
                      <img 
                        src={vehicle.vehicle_image} 
                        alt={vehicle.make + ' ' + vehicle.model} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Car className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    </p>
                    {vehicle.nickname && (
                      <p className="text-xs text-gray-400">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                    )}
                  </div>
                  {activeVehicle?.id === vehicle.id && (
                    <Check className="h-4 w-4 text-blue-400" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              <p>No vehicles found</p>
              <p className="text-xs mt-1">Add a vehicle to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleSelector;