import React from 'react';

interface TireTelemetryWidgetProps {
  frontLeftTemp: number;
  frontRightTemp: number;
  rearLeftTemp: number;
  rearRightTemp: number;
  frontLeftPressure: number;
  frontRightPressure: number;
  rearLeftPressure: number;
  rearRightPressure: number;
  wear: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  compound: string;
  optimalTempRange: {
    min: number;
    max: number;
  };
}

const TireTelemetryWidget: React.FC<TireTelemetryWidgetProps> = ({
  frontLeftTemp,
  frontRightTemp,
  rearLeftTemp,
  rearRightTemp,
  frontLeftPressure,
  frontRightPressure,
  rearLeftPressure,
  rearRightPressure,
  wear,
  compound,
  optimalTempRange,
}) => {
  // Helper function to determine temperature status color
  const getTempColor = (temp: number) => {
    if (temp < optimalTempRange.min) return 'text-blue-400'; // Too cold
    if (temp > optimalTempRange.max) return 'text-red-500'; // Too hot
    return 'text-green-400'; // Optimal
  };
  
  // Helper function to determine pressure status color
  const getPressureColor = (pressure: number, isRear: boolean) => {
    const optimalPressure = isRear ? 30 : 32; // Basic references
    const diff = Math.abs(pressure - optimalPressure);
    
    if (diff <= 1) return 'text-green-400'; // Optimal
    if (diff <= 3) return 'text-yellow-400'; // Suboptimal
    return 'text-red-500'; // Problematic
  };
  
  // Helper function to determine wear status color
  const getWearColor = (wearPercentage: number) => {
    if (wearPercentage < 25) return 'bg-green-600';
    if (wearPercentage < 60) return 'bg-yellow-600';
    if (wearPercentage < 85) return 'bg-orange-600';
    return 'bg-red-600';
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-blue-400 font-medium text-lg">Tire Telemetry</h3>
        <div className="bg-blue-900 text-xs text-white px-3 py-1 rounded-full">
          {compound} Compound
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-2">
        {/* Front Tires */}
        <div className="relative">
          {/* Front Left */}
          <div className="absolute top-0 left-0 w-20 bg-gray-800 rounded p-2">
            <p className="text-xs text-gray-400 mb-1">Front Left</p>
            <p className={`text-xl font-semibold ${getTempColor(frontLeftTemp)}`}>{frontLeftTemp}°</p>
            <p className={`text-sm ${getPressureColor(frontLeftPressure, false)}`}>{frontLeftPressure} PSI</p>
            <div className="mt-1 h-1.5 bg-gray-700 rounded-full">
              <div 
                className={`h-full ${getWearColor(wear.frontLeft)} rounded-full`} 
                style={{ width: `${100 - wear.frontLeft}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{wear.frontLeft}% worn</p>
          </div>
          
          {/* Front Right */}
          <div className="absolute top-0 right-0 w-20 bg-gray-800 rounded p-2">
            <p className="text-xs text-gray-400 mb-1">Front Right</p>
            <p className={`text-xl font-semibold ${getTempColor(frontRightTemp)}`}>{frontRightTemp}°</p>
            <p className={`text-sm ${getPressureColor(frontRightPressure, false)}`}>{frontRightPressure} PSI</p>
            <div className="mt-1 h-1.5 bg-gray-700 rounded-full">
              <div 
                className={`h-full ${getWearColor(wear.frontRight)} rounded-full`} 
                style={{ width: `${100 - wear.frontRight}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{wear.frontRight}% worn</p>
          </div>
          
          {/* Car Front Illustration */}
          <div className="h-32 flex items-center justify-center">
            <div className="w-28 h-12 bg-gray-700 rounded-lg border border-gray-600"></div>
          </div>
        </div>
        
        {/* Rear Tires */}
        <div className="relative">
          {/* Rear Left */}
          <div className="absolute bottom-0 left-0 w-20 bg-gray-800 rounded p-2">
            <p className="text-xs text-gray-400 mb-1">Rear Left</p>
            <p className={`text-xl font-semibold ${getTempColor(rearLeftTemp)}`}>{rearLeftTemp}°</p>
            <p className={`text-sm ${getPressureColor(rearLeftPressure, true)}`}>{rearLeftPressure} PSI</p>
            <div className="mt-1 h-1.5 bg-gray-700 rounded-full">
              <div 
                className={`h-full ${getWearColor(wear.rearLeft)} rounded-full`} 
                style={{ width: `${100 - wear.rearLeft}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{wear.rearLeft}% worn</p>
          </div>
          
          {/* Rear Right */}
          <div className="absolute bottom-0 right-0 w-20 bg-gray-800 rounded p-2">
            <p className="text-xs text-gray-400 mb-1">Rear Right</p>
            <p className={`text-xl font-semibold ${getTempColor(rearRightTemp)}`}>{rearRightTemp}°</p>
            <p className={`text-sm ${getPressureColor(rearRightPressure, true)}`}>{rearRightPressure} PSI</p>
            <div className="mt-1 h-1.5 bg-gray-700 rounded-full">
              <div 
                className={`h-full ${getWearColor(wear.rearRight)} rounded-full`} 
                style={{ width: `${100 - wear.rearRight}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{wear.rearRight}% worn</p>
          </div>
          
          {/* Car Rear Illustration */}
          <div className="h-32 flex items-center justify-center">
            <div className="w-28 h-12 bg-gray-700 rounded-lg border border-gray-600"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-2 rounded-lg">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Cold</span>
          <span>Optimal Window</span>
          <span>Overheated</span>
        </div>
        <div className="flex h-2 rounded overflow-hidden mt-1">
          <div className="bg-blue-600 w-1/3"></div>
          <div className="bg-green-600 w-1/3"></div>
          <div className="bg-red-600 w-1/3"></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{optimalTempRange.min - 20}°F</span>
          <span>{optimalTempRange.min}°F</span>
          <span>{optimalTempRange.max}°F</span>
          <span>{optimalTempRange.max + 20}°F</span>
        </div>
      </div>
    </div>
  );
};

export default TireTelemetryWidget;