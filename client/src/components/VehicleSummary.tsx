import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CarFront, Gauge, Fuel, Settings2, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useVehicle } from '@/contexts/VehicleContext';

/**
 * VehicleSummary component
 * 
 * Displays a visual representation of the vehicle's current status with maintenance alerts
 * and key performance indicators. Follows F1-inspired design language.
 */
export default function VehicleSummary() {
  const vehicle = useVehicle();
  
  // Use actual vehicle data from the VehicleContext
  const activeVehicle = vehicle?.activeVehicle;
  
  return (
    <div className="space-y-4">
      {/* Vehicle Image Display */}
      <div className="relative bg-gradient-to-r from-black/60 to-gray-900/60 rounded-lg overflow-hidden">
        {activeVehicle?.image ? (
          <img 
            src={activeVehicle.image} 
            alt={`${activeVehicle.make} ${activeVehicle.model}`} 
            className="w-full h-48 object-cover object-center"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-black/30">
            <CarFront size={64} className="text-gray-700" />
          </div>
        )}
        
        {/* Vehicle Status Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-white font-medium">{activeVehicle?.nickname || `${activeVehicle?.year} ${activeVehicle?.make} ${activeVehicle?.model}`}</h3>
              <p className="text-gray-300 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            <Badge variant="outline" className="bg-blue-500/30 text-blue-300 border-blue-500/30">
              {activeVehicle?.status || 'Ready'}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Fuel size={14} className="text-blue-500 mr-2" />
              <span className="text-gray-300 text-xs font-medium">FUEL</span>
            </div>
            <span className="text-white text-xs">{activeVehicle?.fuelLevel || '75%'}</span>
          </div>
          <Progress value={parseInt(activeVehicle?.fuelLevel) || 75} className="h-2 bg-gray-800" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Gauge size={14} className="text-blue-500 mr-2" />
              <span className="text-gray-300 text-xs font-medium">TIRE WEAR</span>
            </div>
            <span className="text-white text-xs">{activeVehicle?.tireWear || '30%'}</span>
          </div>
          <Progress value={parseInt(activeVehicle?.tireWear) || 30} className="h-2 bg-gray-800" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Settings2 size={14} className="text-blue-500 mr-2" />
              <span className="text-gray-300 text-xs font-medium">OIL LIFE</span>
            </div>
            <span className="text-white text-xs">{activeVehicle?.oilLife || '85%'}</span>
          </div>
          <Progress value={parseInt(activeVehicle?.oilLife) || 85} className="h-2 bg-gray-800" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <AlertTriangle size={14} className="text-yellow-500 mr-2" />
              <span className="text-gray-300 text-xs font-medium">ISSUES</span>
            </div>
            <span className="text-white text-xs">{activeVehicle?.issues?.length || '0'}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            {(activeVehicle?.issues?.length || 0) > 0 ? (
              <div className="h-full bg-yellow-500 w-full pulse-animation"></div>
            ) : (
              <div className="h-full bg-green-500 w-full"></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Maintenance Alert */}
      {(activeVehicle?.issues?.length || 0) > 0 && (
        <Card className="bg-yellow-500/10 border border-yellow-500/30">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="text-yellow-500 h-5 w-5 mt-0.5" />
              <div>
                <p className="text-white text-sm font-medium">Maintenance Recommended</p>
                <p className="text-gray-400 text-xs">
                  {activeVehicle?.maintenanceNotes || 'Service recommended based on current vehicle status.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}