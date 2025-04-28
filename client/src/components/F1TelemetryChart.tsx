import React from 'react';

interface F1TelemetryChartProps {
  drivingStyle: string;
  corneringGForce: number;
  brakingData: {
    maxBrakingForce: number;
    brakingStability: number;
    brakingZones: number;
  };
  accelerationProfile: {
    maxAcceleration: number;
    throttleResponse: number;
    launchConsistency: number;
  };
  tireData: {
    frontLeftTemp: number;
    frontRightTemp: number;
    rearLeftTemp: number;
    rearRightTemp: number;
    wearRate: number;
  };
}

const F1TelemetryChart: React.FC<F1TelemetryChartProps> = ({
  drivingStyle,
  corneringGForce,
  brakingData,
  accelerationProfile,
  tireData,
}) => {
  // Calculate performance metrics
  const corneringScore = Math.min(10, Math.max(1, corneringGForce * 5));
  const brakingScore = Math.min(10, Math.max(1, ((brakingData.maxBrakingForce * 0.4) + (brakingData.brakingStability * 0.4) + (brakingData.brakingZones * 0.2))));
  const accelerationScore = Math.min(10, Math.max(1, ((accelerationProfile.maxAcceleration * 0.5) + (accelerationProfile.throttleResponse * 0.3) + (accelerationProfile.launchConsistency * 0.2))));
  
  // Calculate tire management score
  const tireTempVariance = Math.max(
    Math.abs(tireData.frontLeftTemp - tireData.frontRightTemp),
    Math.abs(tireData.rearLeftTemp - tireData.rearRightTemp),
    Math.abs(tireData.frontLeftTemp - tireData.rearLeftTemp),
    Math.abs(tireData.frontRightTemp - tireData.rearRightTemp)
  );
  
  const tireTempScore = Math.min(10, Math.max(1, 10 - (tireTempVariance / 10)));
  const tireWearScore = Math.min(10, Math.max(1, 10 - tireData.wearRate));
  const tireManagementScore = (tireTempScore * 0.6) + (tireWearScore * 0.4);
  
  // Overall driving score
  const overallScore = (
    corneringScore * 0.3 +
    brakingScore * 0.25 +
    accelerationScore * 0.25 +
    tireManagementScore * 0.2
  ).toFixed(1);
  
  // Get driver class based on overall score
  const getDriverClass = (score: number) => {
    if (score >= 9) return 'F1 Potential';
    if (score >= 8) return 'Pro Racing';
    if (score >= 7) return 'Expert';
    if (score >= 6) return 'Advanced';
    if (score >= 5) return 'Intermediate';
    return 'Enthusiast';
  };
  
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-purple-500';
    if (score >= 7) return 'text-blue-500';
    if (score >= 5.5) return 'text-green-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-5 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-blue-400 font-orbitron text-xl">F1-Grade Telemetry Analysis</h3>
        <div className="bg-gray-800 rounded-full px-3 py-1 text-xs text-gray-300">
          Driving Style: <span className="font-semibold text-blue-400">{drivingStyle}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs">Cornering</p>
          <div className="flex items-end justify-between">
            <p className="text-white text-xl">{corneringScore.toFixed(1)}</p>
            <p className="text-gray-400 text-xs">{corneringGForce.toFixed(2)} G</p>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full mt-2">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${corneringScore * 10}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs">Braking</p>
          <div className="flex items-end justify-between">
            <p className="text-white text-xl">{brakingScore.toFixed(1)}</p>
            <p className="text-gray-400 text-xs">{brakingData.maxBrakingForce.toFixed(2)} %</p>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full mt-2">
            <div 
              className="h-full bg-red-500 rounded-full" 
              style={{ width: `${brakingScore * 10}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs">Acceleration</p>
          <div className="flex items-end justify-between">
            <p className="text-white text-xl">{accelerationScore.toFixed(1)}</p>
            <p className="text-gray-400 text-xs">{accelerationProfile.maxAcceleration.toFixed(2)} G</p>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full mt-2">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${accelerationScore * 10}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs">Tire Management</p>
          <div className="flex items-end justify-between">
            <p className="text-white text-xl">{tireManagementScore.toFixed(1)}</p>
            <p className="text-gray-400 text-xs">{tireData.wearRate.toFixed(1)}% wear</p>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full mt-2">
            <div 
              className="h-full bg-yellow-500 rounded-full" 
              style={{ width: `${tireManagementScore * 10}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs">Tire Temperature (°F)</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-gray-900 p-2 rounded text-center">
              <p className="text-xs text-gray-500">FL</p>
              <p className={`${tireData.frontLeftTemp > 180 ? 'text-red-400' : 'text-white'}`}>
                {tireData.frontLeftTemp}°
              </p>
            </div>
            <div className="bg-gray-900 p-2 rounded text-center">
              <p className="text-xs text-gray-500">FR</p>
              <p className={`${tireData.frontRightTemp > 180 ? 'text-red-400' : 'text-white'}`}>
                {tireData.frontRightTemp}°
              </p>
            </div>
            <div className="bg-gray-900 p-2 rounded text-center">
              <p className="text-xs text-gray-500">RL</p>
              <p className={`${tireData.rearLeftTemp > 180 ? 'text-red-400' : 'text-white'}`}>
                {tireData.rearLeftTemp}°
              </p>
            </div>
            <div className="bg-gray-900 p-2 rounded text-center">
              <p className="text-xs text-gray-500">RR</p>
              <p className={`${tireData.rearRightTemp > 180 ? 'text-red-400' : 'text-white'}`}>
                {tireData.rearRightTemp}°
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs">Braking Profile</p>
          <div className="flex gap-2 mt-2">
            <div className="flex-1 bg-gray-900 p-2 rounded">
              <p className="text-xs text-gray-500">Max Force</p>
              <p className="text-white">{brakingData.maxBrakingForce.toFixed(1)}%</p>
            </div>
            <div className="flex-1 bg-gray-900 p-2 rounded">
              <p className="text-xs text-gray-500">Stability</p>
              <p className="text-white">{brakingData.brakingStability.toFixed(1)}/10</p>
            </div>
            <div className="flex-1 bg-gray-900 p-2 rounded">
              <p className="text-xs text-gray-500">Zones</p>
              <p className="text-white">{brakingData.brakingZones}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-xs mb-1">Overall Driver Rating</p>
          <p className={`text-3xl font-orbitron ${getScoreColor(parseFloat(overallScore))}`}>
            {overallScore}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-gray-400 text-xs mb-1">Driver Class</p>
          <p className="text-lg text-blue-400 font-semibold">
            {getDriverClass(parseFloat(overallScore))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default F1TelemetryChart;