import React, { useState, useEffect } from 'react';
import { vehicleProfile } from '../data/vehicles';

interface TireInfo {
  brand: string;
  model: string;
  mileageLifeTarget: number;
  currentMileage: number;
  purchaseDate: string;
  lastTreadDepthCheck: string;
}

interface TireTrackerProps {
  tireInfo?: TireInfo;
}

const TireTracker: React.FC<TireTrackerProps> = ({ tireInfo }) => {
  const defaultTireInfo: TireInfo = {
    brand: "Unknown",
    model: "Unknown",
    mileageLifeTarget: 0,
    currentMileage: 0,
    purchaseDate: "Unknown",
    lastTreadDepthCheck: "Unknown"
  };

  const [tireData, setTireData] = useState<TireInfo>(tireInfo || vehicleProfile.tire || defaultTireInfo);
  
  // Update tire data when vehicleProfile.tire changes
  useEffect(() => {
    setTireData(vehicleProfile.tire || defaultTireInfo);
  }, [vehicleProfile.tire]);

  // Calculate percentage wear
  const wearPercentage = Math.min(
    Math.round((tireData.currentMileage / tireData.mileageLifeTarget) * 100),
    100
  );
  
  // Determine status color based on wear percentage
  const getStatusColor = () => {
    if (wearPercentage < 50) return 'text-green-500';
    if (wearPercentage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="apex-card mb-6">
      <h2 className="apex-header-green mb-4">Tire Tracker</h2>
      
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="bg-gray-800 p-3 rounded-lg">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-blue-400"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M7 12h1M16 12h1M12 7v1M12 16v1M8.5 8.5l.7.7M14.8 14.8l.7.7M8.5 15.5l.7-.7M14.8 9.2l.7-.7"></path>
            </svg>
          </div>
          <div>
            <div className="font-bold text-xl">{tireData.brand} {tireData.model}</div>
            <div className="text-gray-400">Installed: {tireData.purchaseDate}</div>
          </div>
        </div>
        
        <div className={`text-xl font-bold ${getStatusColor()}`}>
          {wearPercentage}% Worn
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Current Mileage:</span>
          <span className="font-bold">{tireData.currentMileage.toLocaleString()} miles</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Target Life:</span>
          <span className="font-bold">{tireData.mileageLifeTarget.toLocaleString()} miles</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Last Tread Check:</span>
          <span className="font-bold">{tireData.lastTreadDepthCheck}</span>
        </div>
      </div>
      
      <div className="mt-4 relative pt-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              Tire Wear
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {wearPercentage}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mt-2 mb-4 text-xs flex rounded bg-gray-700">
          <div 
            style={{ width: `${wearPercentage}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
              wearPercentage < 50 ? 'bg-green-500' : 
              wearPercentage < 80 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <button className="apex-button">
          Schedule Replacement
        </button>
      </div>
    </div>
  );
};

export default TireTracker;