import React from 'react';

interface DrivingDynamicsProps {
  corneringData: {
    maxLateralG: number;
    turnInRate: number;
    apexSpeed: number;
    exitStability: number;
  };
  accelerationData: {
    zeroToSixty: number;
    quarterMile: number;
    quarterMileSpeed: number;
    topSpeed: number;
  };
  brakingData: {
    sixtyToZero: number;
    maxBrakingG: number;
    brakingDistance: number;
    brakingTemperature: number;
  };
  drivingStyle: string;
}

const DrivingDynamicsAnalyzer: React.FC<DrivingDynamicsProps> = ({
  corneringData,
  accelerationData,
  brakingData,
  drivingStyle
}) => {
  // Helper for determining driving style class
  const getDrivingStyleClass = () => {
    switch(drivingStyle.toLowerCase()) {
      case 'aggressive':
        return 'bg-red-900 text-red-200';
      case 'dynamic':
        return 'bg-blue-900 text-blue-200';
      case 'balanced':
        return 'bg-green-900 text-green-200';
      case 'conservative':
        return 'bg-yellow-900 text-yellow-200';
      case 'eco':
        return 'bg-emerald-900 text-emerald-200';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };
  
  // Helper for determining cornering skill level
  const getCorneringSkillLevel = () => {
    const maxG = corneringData.maxLateralG;
    const stability = corneringData.exitStability;
    
    if (maxG > 1.0 && stability > 8) return 'Expert';
    if (maxG > 0.9 && stability > 7) return 'Advanced';
    if (maxG > 0.8 && stability > 6) return 'Intermediate';
    if (maxG > 0.7 && stability > 5) return 'Proficient';
    return 'Developing';
  };
  
  // Helper for determining acceleration skill level
  const getAccelerationSkillLevel = () => {
    const zeroToSixty = accelerationData.zeroToSixty;
    
    if (zeroToSixty < 4.0) return 'Expert';
    if (zeroToSixty < 5.0) return 'Advanced';
    if (zeroToSixty < 6.0) return 'Intermediate';
    if (zeroToSixty < 7.0) return 'Proficient';
    return 'Developing';
  };
  
  // Helper for determining braking skill level
  const getBrakingSkillLevel = () => {
    const maxG = brakingData.maxBrakingG;
    const distance = brakingData.brakingDistance;
    
    if (maxG > 1.0 && distance < 120) return 'Expert';
    if (maxG > 0.9 && distance < 130) return 'Advanced';
    if (maxG > 0.8 && distance < 140) return 'Intermediate';
    if (maxG > 0.7 && distance < 150) return 'Proficient';
    return 'Developing';
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-blue-400 font-medium text-lg">Driving Dynamics</h3>
        <div className={`px-3 py-1 rounded-full text-xs ${getDrivingStyleClass()}`}>
          {drivingStyle} Style
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Cornering Dynamics */}
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-400 text-xs">Cornering</p>
              <p className="text-white text-lg font-semibold">{getCorneringSkillLevel()}</p>
            </div>
            <div className="bg-blue-900 rounded-full w-8 h-8 flex items-center justify-center text-blue-200">
              <span className="text-sm">C</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Max Lateral G</span>
                <span className="text-white">{corneringData.maxLateralG.toFixed(2)} G</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${Math.min(100, corneringData.maxLateralG * 70)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Turn-in Rate</span>
                <span className="text-white">{corneringData.turnInRate}/10</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${corneringData.turnInRate * 10}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Exit Stability</span>
                <span className="text-white">{corneringData.exitStability}/10</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${corneringData.exitStability * 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Acceleration Dynamics */}
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-400 text-xs">Acceleration</p>
              <p className="text-white text-lg font-semibold">{getAccelerationSkillLevel()}</p>
            </div>
            <div className="bg-green-900 rounded-full w-8 h-8 flex items-center justify-center text-green-200">
              <span className="text-sm">A</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">0-60 mph</span>
                <span className="text-white">{accelerationData.zeroToSixty.toFixed(1)} sec</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${Math.min(100, 100 - (accelerationData.zeroToSixty * 10))}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">1/4 Mile</span>
                <span className="text-white">{accelerationData.quarterMile.toFixed(1)} sec</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${Math.min(100, 100 - (accelerationData.quarterMile * 5))}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Top Speed</span>
                <span className="text-white">{accelerationData.topSpeed} mph</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${Math.min(100, accelerationData.topSpeed / 2)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Braking Dynamics */}
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-400 text-xs">Braking</p>
              <p className="text-white text-lg font-semibold">{getBrakingSkillLevel()}</p>
            </div>
            <div className="bg-red-900 rounded-full w-8 h-8 flex items-center justify-center text-red-200">
              <span className="text-sm">B</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">60-0 Distance</span>
                <span className="text-white">{brakingData.sixtyToZero} ft</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${Math.min(100, 100 - (brakingData.sixtyToZero / 2))}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Max Braking G</span>
                <span className="text-white">{brakingData.maxBrakingG.toFixed(2)} G</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${Math.min(100, brakingData.maxBrakingG * 70)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Brake Temp</span>
                <span className="text-white">{brakingData.brakingTemperature}°F</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${Math.min(100, brakingData.brakingTemperature / 15)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-3 rounded-lg space-y-1">
        <h4 className="text-white text-sm mb-2">Performance Insights</h4>
        
        <div className="flex items-start space-x-2">
          <div className="min-w-6 h-6 flex items-center justify-center bg-blue-900 rounded-full">
            <span className="text-blue-200 text-xs">C</span>
          </div>
          <p className="text-gray-300 text-sm">
            {corneringData.maxLateralG > 0.9 
              ? "Excellent cornering G-forces, approaching professional driving levels."
              : corneringData.maxLateralG > 0.7
              ? "Good cornering dynamics with room for improved exit stability."
              : "Focus on threshold cornering and maintaining a smooth line through corners."}
          </p>
        </div>
        
        <div className="flex items-start space-x-2">
          <div className="min-w-6 h-6 flex items-center justify-center bg-green-900 rounded-full">
            <span className="text-green-200 text-xs">A</span>
          </div>
          <p className="text-gray-300 text-sm">
            {accelerationData.zeroToSixty < 4.5
              ? "Exceptional acceleration control, maximizing the vehicle's potential."
              : accelerationData.zeroToSixty < 6.0
              ? "Good acceleration skills, work on consistent launch techniques."
              : "Focus on improving launch control and traction management."}
          </p>
        </div>
        
        <div className="flex items-start space-x-2">
          <div className="min-w-6 h-6 flex items-center justify-center bg-red-900 rounded-full">
            <span className="text-red-200 text-xs">B</span>
          </div>
          <p className="text-gray-300 text-sm">
            {brakingData.maxBrakingG > 0.9
              ? "Excellent threshold braking technique, maximizing stopping power."
              : brakingData.maxBrakingG > 0.7
              ? "Good braking control with room for improved modulation."
              : "Focus on threshold braking and brake balance to reduce stopping distances."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DrivingDynamicsAnalyzer;