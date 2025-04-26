import React from 'react';

function TireTracker({ tireInfo }) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-blue-400 font-orbitron text-xl uppercase mb-6 text-center">
        Tire Tracker
      </h2>
      <div className="space-y-4">
        <p className="text-white">Brand/Model: {tireInfo.brand} {tireInfo.model}</p>
        <p className="text-white">Miles Driven: {tireInfo.currentMileage} / {tireInfo.mileageLifeTarget}</p>
        <p className="text-white">Purchase Date: {tireInfo.purchaseDate}</p>
        <p className="text-white">Last Tread Depth Check: {tireInfo.lastTreadDepthCheck}</p>
      </div>
    </div>
  );
}

export default TireTracker;