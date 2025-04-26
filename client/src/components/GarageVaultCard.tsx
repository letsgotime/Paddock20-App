import React from 'react';
import { vehicleProfile } from '../data/vehicles';

function GarageVaultCard() {
  const carProfile = vehicleProfile;
  
  return (
    <div className="apex-card mb-8">
      <h2 className="apex-header mb-6">Vehicle Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Vehicle Image and Basic Info */}
        <div>
          <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
            <img 
              src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3" 
              alt={`${carProfile.make} ${carProfile.model}`}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold text-blue-400 font-orbitron">
                {carProfile.year} {carProfile.make} {carProfile.model}
              </h3>
              <p className="text-gray-300">VIN: {carProfile.vin}</p>
              <p className="text-gray-300">Color: {carProfile.color}</p>
              <p className="text-gray-300">Mileage: {carProfile.mileage.toLocaleString()} miles</p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-md text-green-400 font-orbitron uppercase mb-3">Maintenance Status</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Last Service:</span>
              <span className="text-white">{carProfile.lastService}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Next Service:</span>
              <span className="text-white">{carProfile.nextService}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-sm text-gray-300 mb-2">Recent Services:</h4>
              {carProfile.maintenance.records && carProfile.maintenance.records.map((service, index) => (
                <div key={index} className="mb-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-400">{service.date}</span>
                    <span className="text-green-400">{service.type}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{service.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Technical Specifications */}
        <div>
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-md text-green-400 font-orbitron uppercase mb-3">Specifications</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 text-gray-400">Engine</td>
                  <td className="py-2 text-right text-white">{carProfile.engineType}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 text-gray-400">Transmission</td>
                  <td className="py-2 text-right text-white">{carProfile.transmission}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 text-gray-400">Horsepower</td>
                  <td className="py-2 text-right text-white">{carProfile.horsepower} hp</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 text-gray-400">Torque</td>
                  <td className="py-2 text-right text-white">{carProfile.torque}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 text-gray-400">Drive Type</td>
                  <td className="py-2 text-right text-white">{carProfile.driveType}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-400">Fuel</td>
                  <td className="py-2 text-right text-white">{carProfile.fuel}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-md text-green-400 font-orbitron uppercase mb-3">Tire & Wheel Config</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Tire Brand:</span>
              <span className="text-white">{carProfile.tire.brand}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Tire Model:</span>
              <span className="text-white">{carProfile.tire.model}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Current Mileage:</span>
              <span className="text-white">{carProfile.tire.currentMileage.toLocaleString()} miles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Tread Check:</span>
              <span className="text-white">{carProfile.tire.lastTreadDepthCheck}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button className="apex-button">
          Edit Vehicle Details
        </button>
      </div>
    </div>
  );
}

export default GarageVaultCard;