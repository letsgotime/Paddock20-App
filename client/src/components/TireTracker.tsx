import React, { useState } from 'react';

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
    brand: "Michelin",
    model: "Pilot Sport 4S",
    mileageLifeTarget: 20000,
    currentMileage: 4500,
    purchaseDate: "2024-04-15",
    lastTreadDepthCheck: "2024-04-25"
  };

  const [tireData, setTireData] = useState<TireInfo>(tireInfo || defaultTireInfo);
  const [treadDepth, setTreadDepth] = useState({
    frontLeft: 6.8,
    frontRight: 6.9,
    rearLeft: 7.1,
    rearRight: 7.0,
  });
  const [pressureReadings, setPressureReadings] = useState({
    frontLeft: 29,
    frontRight: 29,
    rearLeft: 34,
    rearRight: 34,
  });

  // Calculate tire life percentage
  const percentageRemaining = 100 - (tireData.currentMileage / tireData.mileageLifeTarget) * 100;
  const milesRemaining = tireData.mileageLifeTarget - tireData.currentMileage;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handlePressureChange = (position: keyof typeof pressureReadings, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setPressureReadings({
        ...pressureReadings,
        [position]: numValue
      });
    }
  };

  const handleTreadDepthChange = (position: keyof typeof treadDepth, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setTreadDepth({
        ...treadDepth,
        [position]: numValue
      });
    }
  };

  const getHealthStatus = (depth: number) => {
    if (depth >= 6.0) return "Excellent";
    if (depth >= 4.0) return "Good";
    if (depth >= 2.0) return "Fair";
    return "Replace Soon";
  };

  const getHealthColor = (depth: number) => {
    if (depth >= 6.0) return "text-green-500";
    if (depth >= 4.0) return "text-green-300";
    if (depth >= 2.0) return "text-yellow-400";
    return "text-red-500";
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl text-green-400 font-orbitron uppercase mb-6">Tire Performance Tracking</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md text-green-400 font-orbitron uppercase mb-3">Tire Specifications</h3>
          <p className="mb-2"><span className="text-gray-400">Brand:</span> {tireData.brand}</p>
          <p className="mb-2"><span className="text-gray-400">Model:</span> {tireData.model}</p>
          <p className="mb-2"><span className="text-gray-400">Purchase Date:</span> {formatDate(tireData.purchaseDate)}</p>
          <p className="mb-2"><span className="text-gray-400">Last Inspection:</span> {formatDate(tireData.lastTreadDepthCheck)}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md text-green-400 font-orbitron uppercase mb-3">Tire Life Remaining</h3>
          <div className="w-full bg-gray-700 rounded-full h-4 mb-3">
            <div 
              className="bg-green-500 h-4 rounded-full" 
              style={{ width: `${Math.max(0, Math.min(100, percentageRemaining))}%` }}
            ></div>
          </div>
          <p className="mb-2">
            <span className="text-gray-400">Current Mileage:</span> {tireData.currentMileage} miles
          </p>
          <p className="mb-2">
            <span className="text-gray-400">Target Life:</span> {tireData.mileageLifeTarget} miles
          </p>
          <p className="mb-2">
            <span className="text-gray-400">Remaining:</span> {milesRemaining} miles ({Math.round(percentageRemaining)}%)
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md text-green-400 font-orbitron uppercase mb-3">Tire Tread Depth (mm)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-center mb-1">Front Left</p>
              <input 
                type="number" 
                step="0.1" 
                value={treadDepth.frontLeft} 
                onChange={(e) => handleTreadDepthChange('frontLeft', e.target.value)}
                className="w-full bg-gray-600 text-white text-center rounded py-1"
              />
              <p className={`text-sm text-center mt-1 ${getHealthColor(treadDepth.frontLeft)}`}>
                {getHealthStatus(treadDepth.frontLeft)}
              </p>
            </div>
            
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-center mb-1">Front Right</p>
              <input 
                type="number" 
                step="0.1" 
                value={treadDepth.frontRight} 
                onChange={(e) => handleTreadDepthChange('frontRight', e.target.value)}
                className="w-full bg-gray-600 text-white text-center rounded py-1"
              />
              <p className={`text-sm text-center mt-1 ${getHealthColor(treadDepth.frontRight)}`}>
                {getHealthStatus(treadDepth.frontRight)}
              </p>
            </div>
            
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-center mb-1">Rear Left</p>
              <input 
                type="number" 
                step="0.1" 
                value={treadDepth.rearLeft} 
                onChange={(e) => handleTreadDepthChange('rearLeft', e.target.value)}
                className="w-full bg-gray-600 text-white text-center rounded py-1"
              />
              <p className={`text-sm text-center mt-1 ${getHealthColor(treadDepth.rearLeft)}`}>
                {getHealthStatus(treadDepth.rearLeft)}
              </p>
            </div>
            
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-center mb-1">Rear Right</p>
              <input 
                type="number" 
                step="0.1" 
                value={treadDepth.rearRight} 
                onChange={(e) => handleTreadDepthChange('rearRight', e.target.value)}
                className="w-full bg-gray-600 text-white text-center rounded py-1"
              />
              <p className={`text-sm text-center mt-1 ${getHealthColor(treadDepth.rearRight)}`}>
                {getHealthStatus(treadDepth.rearRight)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md text-green-400 font-orbitron uppercase mb-3">Tire Pressure (PSI)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-center mb-1">Front Left</p>
              <input 
                type="number" 
                value={pressureReadings.frontLeft} 
                onChange={(e) => handlePressureChange('frontLeft', e.target.value)}
                className="w-full bg-gray-600 text-white text-center rounded py-1"
              />
              <p className="text-sm text-center mt-1 text-gray-400">Target: 29 PSI</p>
            </div>
            
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-center mb-1">Front Right</p>
              <input 
                type="number" 
                value={pressureReadings.frontRight} 
                onChange={(e) => handlePressureChange('frontRight', e.target.value)}
                className="w-full bg-gray-600 text-white text-center rounded py-1"
              />
              <p className="text-sm text-center mt-1 text-gray-400">Target: 29 PSI</p>
            </div>
            
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-center mb-1">Rear Left</p>
              <input 
                type="number" 
                value={pressureReadings.rearLeft} 
                onChange={(e) => handlePressureChange('rearLeft', e.target.value)}
                className="w-full bg-gray-600 text-white text-center rounded py-1"
              />
              <p className="text-sm text-center mt-1 text-gray-400">Target: 34 PSI</p>
            </div>
            
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-center mb-1">Rear Right</p>
              <input 
                type="number" 
                value={pressureReadings.rearRight} 
                onChange={(e) => handlePressureChange('rearRight', e.target.value)}
                className="w-full bg-gray-600 text-white text-center rounded py-1"
              />
              <p className="text-sm text-center mt-1 text-gray-400">Target: 34 PSI</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg mr-2">
          Save Changes
        </button>
        <button className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg">
          Log Rotation
        </button>
      </div>
    </div>
  );
};

export default TireTracker;