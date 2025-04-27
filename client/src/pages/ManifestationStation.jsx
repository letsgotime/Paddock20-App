import React from "react";

const ManifestationStation = () => {
  return (
    <div className="p-8">
      <h2 className="text-green-400 font-orbitron text-3xl mb-6">🧭 Manifestation Station</h2>
      <p className="text-white text-lg mb-4">Track your future dream cars, watches, collectibles, and lifestyle assets here.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-green-400 font-orbitron text-xl mb-3">Dream Assets</h3>
          <p className="text-gray-300 mb-4">Visualization board for your future acquisitions</p>
          <div className="flex justify-end">
            <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-colors">
              Add Dream Asset
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-green-400 font-orbitron text-xl mb-3">Achievement Timeline</h3>
          <p className="text-gray-300 mb-4">Track progress toward your automotive goals</p>
          <div className="flex justify-end">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
              View Timeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManifestationStation;