import React from "react";

const GarageVaultPage = () => {
  return (
    <div className="p-8">
      <h2 className="text-green-400 font-orbitron text-3xl mb-6">🚗 Garage Vault</h2>
      <p className="text-white text-lg mb-4">Manage your vehicles, modifications, tire life, and readiness checklists.</p>
      {/* Future: Vehicle cards + Mod history + Tire mileage tracking + Export buttons */}
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-green-400 font-orbitron text-xl mb-3">Garage Assets</h3>
          <p className="text-gray-300 mb-4">Your collection of automotive assets</p>
          <div className="flex justify-end">
            <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-colors">
              Add Vehicle
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-green-400 font-orbitron text-xl mb-3">Seasonal Maintenance</h3>
          <p className="text-gray-300 mb-4">Spring 2025 recommendations available</p>
          <div className="flex justify-end">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
              View Checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarageVaultPage;