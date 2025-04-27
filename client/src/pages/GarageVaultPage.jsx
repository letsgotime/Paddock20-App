import React, { useState } from 'react';
import TireLifecycleManager from '../components/TireLifecycleManager';
import WeatherStation from '../components/WeatherStation';

function GarageVaultPage() {
  const [activeTab, setActiveTab] = useState('vehicles');
  
  const vehicles = [
    {
      id: 1,
      make: 'Ferrari',
      model: '488 GTB',
      year: 2022,
      color: 'Rosso Corsa',
      vin: 'JTHFF2C29F135BX45',
      licensePlate: 'GTM-488',
      mileage: 32150,
      purchaseDate: '2022-05-15',
      insuranceExpiryDate: '2025-05-14',
      lastServiceDate: '2024-01-20',
      lastServiceMileage: 29750,
      notes: 'Paint correction done by Detail Masters in January 2024. Ceramic coating applied.'
    }
  ];
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-green-400 font-orbitron text-2xl">Garage Vault</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'vehicles' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => setActiveTab('tires')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'tires' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Tire Manager
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'maintenance' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Maintenance
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'weather' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Weather
          </button>
        </div>
      </div>
      
      {activeTab === 'vehicles' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-blue-400 font-orbitron text-xl">Vehicle Collection</h3>
            <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">
              Add Vehicle
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex justify-between">
                  <h4 className="text-xl font-bold text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                  <span className="text-green-400">{vehicle.mileage} mi</span>
                </div>
                
                <div className="grid grid-cols-2 mt-4 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Color</p>
                    <p className="text-white">{vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">License Plate</p>
                    <p className="text-white">{vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">VIN</p>
                    <p className="text-white">{vehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Purchase Date</p>
                    <p className="text-white">{vehicle.purchaseDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Last Service</p>
                    <p className="text-white">{vehicle.lastServiceDate} ({vehicle.lastServiceMileage} mi)</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Insurance Expiry</p>
                    <p className="text-white">{vehicle.insuranceExpiryDate}</p>
                  </div>
                </div>
                
                {vehicle.notes && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">Notes</p>
                    <p className="text-gray-300 mt-1">{vehicle.notes}</p>
                  </div>
                )}
                
                <div className="flex mt-6 space-x-3 justify-end">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Edit
                  </button>
                  <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                    Service Log
                  </button>
                  <button className="bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1 rounded text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'tires' && (
        <TireLifecycleManager />
      )}
      
      {activeTab === 'maintenance' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-blue-400 font-orbitron text-xl mb-4">Maintenance Records</h3>
          <p className="text-gray-400">Maintenance tracking functionality will be implemented soon.</p>
          
          <div className="mt-8 bg-black bg-opacity-30 rounded-lg p-4">
            <h4 className="text-lg text-green-400 mb-2">Upcoming Maintenance</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <div>
                  <p className="text-white">Oil Change</p>
                  <p className="text-gray-400 text-sm">Due in 450 miles (approx. May 15, 2025)</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <div>
                  <p className="text-white">Brake Pad Inspection</p>
                  <p className="text-gray-400 text-sm">Due in 1,200 miles (approx. June 20, 2025)</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <div>
                  <p className="text-white">Annual Inspection</p>
                  <p className="text-gray-400 text-sm">Due on July 10, 2025</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
      
      {activeTab === 'weather' && (
        <div className="bg-blue-900 bg-opacity-10 border border-blue-800 rounded-lg p-6">
          <h3 className="text-blue-400 font-orbitron text-xl mb-4">Weather Station</h3>
          <p className="text-gray-300 mb-4">
            Check current weather conditions and forecast to plan your drives and maintenance.
          </p>
          <WeatherStation />
        </div>
      )}
    </div>
  );
}

export default GarageVaultPage;