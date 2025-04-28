import React, { useState, useEffect } from 'react';
import { 
  Car, Gauge, Droplets, Battery, Thermometer, ArrowRight, CheckCircle, 
  AlertTriangle, XCircle, Wrench, Calendar, Activity, Clock
} from 'lucide-react';
import vehicleDataService from '../services/vehicleDataService';
import serviceDataService from '../services/serviceDataService';
import ModificationGallery from './ModificationGallery';

// Utility function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

function VehicleTelemetry({ vehicleId, compact = false }) {
  // Get vehicle data from the vehicle store
  const useVehicleStore = vehicleDataService.useVehicleStore;
  const vehicle = useVehicleStore(state => 
    state.vehicles.find(v => v.id === vehicleId) || null
  );
  
  // Get service data from the service store
  const useServiceStore = serviceDataService.useServiceStore;
  const vehicleHealth = useServiceStore(state => 
    state.getVehicleSystemHealth(vehicleId)
  );
  
  const upcomingServices = useServiceStore(state => 
    state.getUpcomingServiceNeeds(vehicleId)
  );
  
  // State for the telemetry display
  const [selectedView, setSelectedView] = useState('overview');
  const [showModGallery, setShowModGallery] = useState(false);
  const [selectedMod, setSelectedMod] = useState(null);
  
  // Metrics that are calculated based on the vehicle data
  const metrics = {
    daysSinceLastService: vehicle?.lastService 
      ? serviceDataService.getDaysSinceLastService(vehicle)
      : null,
    daysUntilNextService: vehicle?.nextService 
      ? serviceDataService.getDaysUntilNextService(vehicle)
      : null,
    serviceStatus: vehicle?.nextService 
      ? serviceDataService.getServiceStatusDescription(vehicle)
      : 'No service scheduled',
    serviceStatusColor: vehicle?.nextService 
      ? serviceDataService.getServiceStatusColor(vehicle)
      : 'gray',
    tireHealth: vehicle?.tire 
      ? vehicleDataService.getTireHealthPercentage(vehicle)
      : null,
    daysSinceLastGlossBoost: vehicle?.glossTracking?.lastGlossBoost
      ? vehicleDataService.getDaysSinceLastGlossBoost(vehicle)
      : null
  };
  
  // Return placeholder if vehicle not found
  if (!vehicle) {
    return (
      <div className="apex-card p-4 text-center">
        <Car className="mx-auto h-12 w-12 mb-2 text-gray-500" />
        <h3 className="text-xl text-gray-400">Vehicle Not Found</h3>
        <p className="text-gray-500 mt-2">Unable to load telemetry data</p>
      </div>
    );
  }
  
  // Determine status icon for service
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="text-green-500 w-4 h-4" />;
      case 'upcoming':
        return <AlertTriangle className="text-yellow-500 w-4 h-4" />;
      case 'due soon':
        return <AlertTriangle className="text-orange-500 w-4 h-4" />;
      case 'overdue':
        return <XCircle className="text-red-500 w-4 h-4" />;
      default:
        return <CheckCircle className="text-gray-500 w-4 h-4" />;
    }
  };
  
  // Function to handle opening modification gallery
  const handleShowModGallery = (mod) => {
    setSelectedMod(mod);
    setShowModGallery(true);
  };
  
  // Render compact version if requested
  if (compact) {
    return (
      <div className="apex-card">
        <div className="bg-gradient-to-r from-gray-900 to-black p-3 border-b border-gray-800">
          <h3 className="font-orbitron text-blue-400 text-lg flex items-center">
            <Car className="mr-2" /> Vehicle Telemetry
          </h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Mileage</div>
              <div className="text-white text-lg font-bold">{vehicle.mileage?.toLocaleString() || 'N/A'} mi</div>
            </div>
            
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Service Status</div>
              <div className="text-white text-lg font-bold flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 bg-${metrics.serviceStatusColor}-500`}></span>
                {metrics.daysUntilNextService === null ? 'Unknown' : 
                  metrics.daysUntilNextService < 0 ? 'Overdue' : 
                  metrics.daysUntilNextService === 0 ? 'Due Today' : 
                  metrics.daysUntilNextService <= 30 ? 'Due Soon' : 'Good'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Tire Health</div>
              <div className="relative w-full h-2 bg-gray-800 rounded overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500" 
                  style={{ width: `${metrics.tireHealth || 0}%` }}
                ></div>
              </div>
              <div className="text-white text-xs mt-1">{metrics.tireHealth || 0}%</div>
            </div>
            
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Overall Health</div>
              <div className="relative w-full h-2 bg-gray-800 rounded overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500" 
                  style={{ width: `${vehicleHealth?.overall || 0}%` }}
                ></div>
              </div>
              <div className="text-white text-xs mt-1">{vehicleHealth?.overall || 0}%</div>
            </div>
          </div>
          
          <button 
            onClick={() => {/* Navigate to detailed telemetry */}}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 w-full text-center"
          >
            View Full Telemetry <ArrowRight className="inline-block w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    );
  }
  
  // Render full telemetry view
  return (
    <div className="apex-card">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-4 border-b border-gray-800">
        <h3 className="font-orbitron text-blue-400 text-xl flex items-center">
          <Car className="mr-2" /> {vehicle.year} {vehicle.make} {vehicle.model} Telemetry
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          VIN: {vehicle.vin || 'Not Available'} | Mileage: {vehicle.mileage?.toLocaleString() || 'N/A'} miles
        </p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800 bg-black">
        <button
          onClick={() => setSelectedView('overview')}
          className={`px-4 py-2 text-sm font-medium ${
            selectedView === 'overview' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedView('service')}
          className={`px-4 py-2 text-sm font-medium ${
            selectedView === 'service' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Service History
        </button>
        <button
          onClick={() => setSelectedView('mods')}
          className={`px-4 py-2 text-sm font-medium ${
            selectedView === 'mods' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Modifications
        </button>
        <button
          onClick={() => setSelectedView('tires')}
          className={`px-4 py-2 text-sm font-medium ${
            selectedView === 'tires' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tires
        </button>
      </div>
      
      {/* Content Area */}
      <div className="p-4">
        {/* Overview View */}
        {selectedView === 'overview' && (
          <div>
            {/* Health and Status Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Overall Health */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="text-gray-400 text-sm mb-2 flex items-center">
                  <Activity className="mr-2 w-4 h-4" /> Overall Vehicle Health
                </h4>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-blue-400">{vehicleHealth.overall}%</span>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-gray-500">Engine</div>
                        <div className="relative w-full h-2 bg-gray-800 rounded overflow-hidden mt-1">
                          <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${vehicleHealth.engine}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Transmission</div>
                        <div className="relative w-full h-2 bg-gray-800 rounded overflow-hidden mt-1">
                          <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${vehicleHealth.transmission}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Brakes</div>
                        <div className="relative w-full h-2 bg-gray-800 rounded overflow-hidden mt-1">
                          <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${vehicleHealth.brakes}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Cooling</div>
                        <div className="relative w-full h-2 bg-gray-800 rounded overflow-hidden mt-1">
                          <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${vehicleHealth.cooling}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Service Status */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="text-gray-400 text-sm mb-2 flex items-center">
                  <Calendar className="mr-2 w-4 h-4" /> Service Status
                </h4>
                <div className="flex items-center">
                  <div className={`w-16 h-16 rounded-full border-4 border-${metrics.serviceStatusColor}-500 flex items-center justify-center mr-4`}>
                    <span className={`text-xl font-bold text-${metrics.serviceStatusColor}-400`}>
                      {metrics.daysUntilNextService === null ? '?' : 
                       metrics.daysUntilNextService < 0 ? '!' : 
                       metrics.daysUntilNextService}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{metrics.serviceStatus}</p>
                    <div className="text-gray-400 text-sm mt-1">
                      Last service: {formatDate(vehicle.lastService)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Next service: {formatDate(vehicle.nextService)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vehicle Info and Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="text-gray-400 text-xs mb-1">Purchase Date</div>
                <div className="text-white font-medium">{formatDate(vehicle.purchaseDate)}</div>
              </div>
              
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="text-gray-400 text-xs mb-1">Ownership</div>
                <div className="text-white font-medium">
                  {vehicle.purchaseDate ? 
                    `${Math.floor((new Date() - new Date(vehicle.purchaseDate)) / (1000 * 60 * 60 * 24 * 30))} months` : 
                    'N/A'}
                </div>
              </div>
              
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="text-gray-400 text-xs mb-1">Horsepower</div>
                <div className="text-white font-medium">{vehicle.horsepower || 'N/A'} hp</div>
              </div>
              
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="text-gray-400 text-xs mb-1">Torque</div>
                <div className="text-white font-medium">{vehicle.torque || 'N/A'}</div>
              </div>
            </div>
            
            {/* Upcoming Maintenance */}
            <div className="mb-6">
              <h4 className="text-blue-400 font-orbitron text-lg mb-3">Upcoming Maintenance</h4>
              
              <div className="space-y-2">
                {upcomingServices.filter(service => 
                  service.status === 'overdue' || service.status === 'due soon'
                ).slice(0, 3).map((service, index) => (
                  <div key={index} className="bg-gray-900 p-3 rounded-lg flex items-center">
                    <div className="mr-3">
                      {getStatusIcon(service.status)}
                    </div>
                    <div className="flex-1">
                      <div className="text-white">{service.serviceType}</div>
                      <div className="text-gray-400 text-xs">
                        {service.status === 'overdue' ? 'Overdue since ' : 'Due on '} 
                        {formatDate(service.nextDueDate)}
                      </div>
                    </div>
                    <div>
                      <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded">
                        Schedule
                      </button>
                    </div>
                  </div>
                ))}
                
                {upcomingServices.filter(service => 
                  service.status === 'overdue' || service.status === 'due soon'
                ).length === 0 && (
                  <div className="text-center text-gray-400 py-4">
                    No immediate maintenance needed
                  </div>
                )}
              </div>
            </div>
            
            {/* Key Specifications */}
            <div className="mb-6">
              <h4 className="text-blue-400 font-orbitron text-lg mb-3">Key Specifications</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Engine</div>
                  <div className="text-white text-sm">{vehicle.engineType || 'N/A'}</div>
                </div>
                
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Transmission</div>
                  <div className="text-white text-sm">{vehicle.transmission || 'N/A'}</div>
                </div>
                
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Drive Type</div>
                  <div className="text-white text-sm">{vehicle.driveType || 'N/A'}</div>
                </div>
                
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Fuel Type</div>
                  <div className="text-white text-sm">{vehicle.fuel || 'N/A'}</div>
                </div>
                
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Color</div>
                  <div className="text-white text-sm">{vehicle.color || 'N/A'}</div>
                </div>
                
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Modified</div>
                  <div className="text-white text-sm">{vehicle.isModified ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Service History View */}
        {selectedView === 'service' && (
          <div>
            <h4 className="text-blue-400 font-orbitron text-lg mb-3">Service History</h4>
            
            {/* Service Records */}
            <div className="space-y-4">
              {useServiceStore.getState().getVehicleServiceRecords(vehicleId).length > 0 ? (
                useServiceStore.getState().getVehicleServiceRecords(vehicleId)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((record, index) => (
                  <div key={index} className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-white font-medium">{record.type}</h5>
                      <span className="text-sm text-gray-400">{formatDate(record.date)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-400">Mileage:</span>{' '}
                        <span className="text-white">{record.mileage?.toLocaleString() || 'N/A'}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Provider:</span>{' '}
                        <span className="text-white">{record.serviceProvider || 'N/A'}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Cost:</span>{' '}
                        <span className="text-white">${record.cost?.toLocaleString() || 'N/A'}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Next Due:</span>{' '}
                        <span className="text-white">{formatDate(record.nextServiceDue)}</span>
                      </div>
                    </div>
                    
                    {record.description && (
                      <div className="text-sm text-gray-300 mb-3">
                        {record.description}
                      </div>
                    )}
                    
                    {record.partsReplaced && record.partsReplaced.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-sm text-gray-400 mb-1">Parts Replaced:</h6>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {record.partsReplaced.map((part, i) => (
                            <div key={i} className="text-gray-300">
                              {part.name} {part.partNumber && <span className="text-gray-500">({part.partNumber})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {record.notes && (
                      <div className="text-xs text-gray-400 italic mt-2">
                        Notes: {record.notes}
                      </div>
                    )}
                    
                    {record.invoiceImage && (
                      <div className="mt-3">
                        <button className="text-xs text-blue-400">
                          View Invoice
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-10">
                  No service records available
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Modifications View */}
        {selectedView === 'mods' && (
          <div>
            <h4 className="text-blue-400 font-orbitron text-lg mb-3">Vehicle Modifications</h4>
            
            {/* Modifications List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicle.modifications && vehicle.modifications.length > 0 ? (
                vehicle.modifications.map((mod, index) => (
                  <div key={index} className="bg-gray-900 p-4 rounded-lg flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                        {/* Mod image would go here if available */}
                        <Tool className="w-8 h-8 text-gray-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{mod.name}</h5>
                      <p className="text-gray-400 text-sm">{mod.manufacturer}</p>
                      
                      <button 
                        onClick={() => handleShowModGallery(mod)}
                        className="text-xs text-blue-400 hover:text-blue-300 mt-3"
                      >
                        View Photos
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-400 py-10">
                  No modifications installed
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Tires View */}
        {selectedView === 'tires' && (
          <div>
            <h4 className="text-blue-400 font-orbitron text-lg mb-3">Tire Information</h4>
            
            {vehicle.tire ? (
              <div>
                <div className="bg-gray-900 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-white font-medium mb-2">{vehicle.tire.brand} {vehicle.tire.model}</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Purchased:</span>{' '}
                          <span className="text-white">{formatDate(vehicle.tire.purchaseDate)}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-400">Current Miles:</span>{' '}
                          <span className="text-white">{vehicle.tire.currentMileage?.toLocaleString() || 'N/A'}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-400">Target Life:</span>{' '}
                          <span className="text-white">{vehicle.tire.mileageLifeTarget?.toLocaleString() || 'N/A'} miles</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-400">Last Check:</span>{' '}
                          <span className="text-white">{formatDate(vehicle.tire.lastTreadDepthCheck)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <div className="text-gray-400 text-sm mb-1">Tire Health</div>
                      <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            metrics.tireHealth > 70 ? 'bg-green-500' : 
                            metrics.tireHealth > 30 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${metrics.tireHealth || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-400">{metrics.tireHealth || 0}% Remaining</span>
                        <span className="text-gray-400">
                          ~{Math.floor(((vehicle.tire.mileageLifeTarget - vehicle.tire.currentMileage) / 
                            (vehicle.mileage - vehicle.tire.currentMileage + vehicle.mileage)) * 12)} months left
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <h5 className="text-white font-medium mb-3">Rotation Schedule</h5>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-400 text-sm">Next Rotation Due</div>
                        <div className="text-white">
                          {vehicle.tire.currentMileage ? `${vehicle.tire.currentMileage + 5000} miles` : 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded">
                          Log Rotation
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <h5 className="text-white font-medium mb-3">Pressure Check</h5>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-400 text-sm">Last Check</div>
                        <div className="text-white">
                          {formatDate(vehicle.tire.lastTreadDepthCheck) || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded">
                          Log Pressure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-10">
                No tire information available
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modification Gallery Modal */}
      {showModGallery && selectedMod && (
        <ModificationGallery 
          modification={selectedMod}
          vehicleId={vehicleId}
          isFullscreen={true}
          onClose={() => setShowModGallery(false)}
        />
      )}
    </div>
  );
}

export default VehicleTelemetry;