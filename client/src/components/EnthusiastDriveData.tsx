import React from 'react';
import F1TelemetryChart from './F1TelemetryChart';
import TireTelemetryWidget from './TireTelemetryWidget';
import PerformanceMetricsPanel from './PerformanceMetricsPanel'; 
import DrivingDynamicsAnalyzer from './DrivingDynamicsAnalyzer';

interface EnthusiastDriveDataProps {
  vehicleData: {
    name: string;
    engineType: string;
    drivetrainType: string;
    transmissionType: string;
    suspensionType: string;
    baseHorsepower: number;
    baseTorque: number;
    weight: number;
    weightDistribution: string;
  };
  environmentalData: {
    airTemp: number;
    trackTemp: number;
    humidity: number;
    atmosphericPressure: number;
    altitude: number;
    windSpeed: number;
    airDensity: number;
  };
  drivingStyle: string;
  showAdvancedTelemetry: boolean;
  onToggleAdvancedTelemetry: () => void;
}

const EnthusiastDriveData: React.FC<EnthusiastDriveDataProps> = ({
  vehicleData,
  environmentalData,
  drivingStyle,
  showAdvancedTelemetry,
  onToggleAdvancedTelemetry
}) => {
  // Generate mock telemetry data based on vehicle and environmental data
  // In a real app, this would come from actual sensors/telemetry
  const generateMockTelemetryData = () => {
    // Calculate cornering G-force based on vehicle characteristics
    const baseCorneringG = vehicleData.drivetrainType === 'AWD' ? 0.95 : 
                         vehicleData.drivetrainType === 'RWD' ? 0.9 : 0.85;
    
    // Adjust for environmental factors
    const weatherAdjustment = environmentalData.trackTemp > 90 ? -0.05 : 
                            environmentalData.trackTemp < 50 ? -0.1 : 0;
    
    // Adjust for driving style
    const styleAdjustment = drivingStyle === 'Aggressive' ? 0.15 : 
                          drivingStyle === 'Dynamic' ? 0.1 : 
                          drivingStyle === 'Balanced' ? 0.05 : 0;
    
    const corneringG = baseCorneringG + weatherAdjustment + styleAdjustment;
    
    // Calculate other metrics based on vehicle characteristics
    const powerToWeight = vehicleData.baseHorsepower / vehicleData.weight * 1000;
    const zeroToSixty = 6.5 - (powerToWeight * 0.8);
    
    return {
      corneringData: {
        maxLateralG: corneringG,
        turnInRate: drivingStyle === 'Aggressive' ? 8.5 : 
                  drivingStyle === 'Dynamic' ? 7.8 : 
                  drivingStyle === 'Balanced' ? 6.5 : 5.5,
        apexSpeed: 65 + (corneringG * 10),
        exitStability: drivingStyle === 'Aggressive' ? 6.5 : 
                     drivingStyle === 'Dynamic' ? 7.2 : 
                     drivingStyle === 'Balanced' ? 8.5 : 9.0
      },
      accelerationData: {
        zeroToSixty: Math.max(2.5, Math.min(9.5, zeroToSixty)),
        quarterMile: Math.max(10.5, Math.min(16.5, zeroToSixty * 2.2)),
        quarterMileSpeed: 100 + (vehicleData.baseHorsepower / 10),
        topSpeed: 120 + (vehicleData.baseHorsepower / 5)
      },
      brakingData: {
        sixtyToZero: drivingStyle === 'Aggressive' ? 105 : 
                    drivingStyle === 'Dynamic' ? 115 : 
                    drivingStyle === 'Balanced' ? 125 : 135,
        maxBrakingG: drivingStyle === 'Aggressive' ? 1.1 : 
                    drivingStyle === 'Dynamic' ? 0.95 : 
                    drivingStyle === 'Balanced' ? 0.85 : 0.75,
        brakingDistance: 120 + (vehicleData.weight / 100),
        brakingTemperature: drivingStyle === 'Aggressive' ? 950 : 
                          drivingStyle === 'Dynamic' ? 850 : 
                          drivingStyle === 'Balanced' ? 750 : 650
      },
      tireData: {
        frontLeftTemp: environmentalData.trackTemp + 
                    (drivingStyle === 'Aggressive' ? 35 : 
                     drivingStyle === 'Dynamic' ? 25 : 15),
        frontRightTemp: environmentalData.trackTemp + 
                      (drivingStyle === 'Aggressive' ? 40 : 
                       drivingStyle === 'Dynamic' ? 30 : 20),
        rearLeftTemp: environmentalData.trackTemp + 
                    (drivingStyle === 'Aggressive' ? 30 : 
                     drivingStyle === 'Dynamic' ? 20 : 10),
        rearRightTemp: environmentalData.trackTemp + 
                     (drivingStyle === 'Aggressive' ? 38 : 
                      drivingStyle === 'Dynamic' ? 28 : 18),
        wear: {
          frontLeft: drivingStyle === 'Aggressive' ? 35 : 
                   drivingStyle === 'Dynamic' ? 25 : 15,
          frontRight: drivingStyle === 'Aggressive' ? 45 : 
                    drivingStyle === 'Dynamic' ? 30 : 20,
          rearLeft: drivingStyle === 'Aggressive' ? 30 : 
                  drivingStyle === 'Dynamic' ? 22 : 12,
          rearRight: drivingStyle === 'Aggressive' ? 40 : 
                   drivingStyle === 'Dynamic' ? 28 : 18,
        }
      }
    };
  };
  
  const telemetryData = generateMockTelemetryData();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-blue-400 font-orbitron text-2xl">Drive Telemetry</h2>
        <button
          onClick={onToggleAdvancedTelemetry}
          className="bg-gray-800 hover:bg-gray-700 text-blue-400 px-4 py-2 rounded-lg text-sm transition"
        >
          {showAdvancedTelemetry ? 'Basic View' : 'Advanced Telemetry'}
        </button>
      </div>
      
      {/* Basic Telemetry Summary */}
      {!showAdvancedTelemetry && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Max Cornering</p>
              <p className="text-white text-2xl">{telemetryData.corneringData.maxLateralG.toFixed(2)} G</p>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">0-60 mph</p>
              <p className="text-white text-2xl">{telemetryData.accelerationData.zeroToSixty.toFixed(1)} sec</p>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">60-0 Distance</p>
              <p className="text-white text-2xl">{telemetryData.brakingData.sixtyToZero} ft</p>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Power Output</p>
              <p className="text-white text-2xl">
                {Math.round(vehicleData.baseHorsepower * (1 + (environmentalData.airTemp < 60 ? 0.03 : -0.01)))} hp
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">Driving Style Analysis</p>
            <p className="text-gray-300">
              Your {drivingStyle.toLowerCase()} driving style produced {telemetryData.corneringData.maxLateralG > 0.9 ? 'excellent' : 'good'} cornering forces 
              with {telemetryData.corneringData.exitStability > 8 ? 'stable' : 'moderate'} corner exits. 
              Tire temperatures peaked at {Math.max(
                telemetryData.tireData.frontLeftTemp,
                telemetryData.tireData.frontRightTemp,
                telemetryData.tireData.rearLeftTemp,
                telemetryData.tireData.rearRightTemp
              )}°F with {drivingStyle === 'Aggressive' ? 'significant' : drivingStyle === 'Dynamic' ? 'moderate' : 'minimal'} wear.
            </p>
          </div>
        </div>
      )}
      
      {/* Advanced Telemetry Panels */}
      {showAdvancedTelemetry && (
        <div className="space-y-6">
          <F1TelemetryChart 
            drivingStyle={drivingStyle}
            corneringGForce={telemetryData.corneringData.maxLateralG}
            brakingData={{
              maxBrakingForce: telemetryData.brakingData.maxBrakingG * 10,
              brakingStability: telemetryData.brakingData.sixtyToZero < 120 ? 8.5 : 7.0,
              brakingZones: 6
            }}
            accelerationProfile={{
              maxAcceleration: 10 - telemetryData.accelerationData.zeroToSixty,
              throttleResponse: drivingStyle === 'Aggressive' ? 9.0 : 
                              drivingStyle === 'Dynamic' ? 8.2 : 
                              drivingStyle === 'Balanced' ? 7.5 : 6.8,
              launchConsistency: drivingStyle === 'Aggressive' ? 7.0 : 
                               drivingStyle === 'Dynamic' ? 8.0 : 
                               drivingStyle === 'Balanced' ? 8.5 : 9.0,
            }}
            tireData={{
              frontLeftTemp: telemetryData.tireData.frontLeftTemp,
              frontRightTemp: telemetryData.tireData.frontRightTemp,
              rearLeftTemp: telemetryData.tireData.rearLeftTemp,
              rearRightTemp: telemetryData.tireData.rearRightTemp,
              wearRate: (telemetryData.tireData.wear.frontLeft + 
                        telemetryData.tireData.wear.frontRight + 
                        telemetryData.tireData.wear.rearLeft + 
                        telemetryData.tireData.wear.rearRight) / 4,
            }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TireTelemetryWidget 
              frontLeftTemp={telemetryData.tireData.frontLeftTemp}
              frontRightTemp={telemetryData.tireData.frontRightTemp}
              rearLeftTemp={telemetryData.tireData.rearLeftTemp}
              rearRightTemp={telemetryData.tireData.rearRightTemp}
              frontLeftPressure={32 + (drivingStyle === 'Aggressive' ? 2 : 0)}
              frontRightPressure={32 + (drivingStyle === 'Aggressive' ? 2 : 0)}
              rearLeftPressure={30 + (drivingStyle === 'Aggressive' ? 2 : 0)}
              rearRightPressure={30 + (drivingStyle === 'Aggressive' ? 2 : 0)}
              wear={telemetryData.tireData.wear}
              compound={'Sport+'}
              optimalTempRange={{
                min: 160,
                max: 200
              }}
            />
            
            <PerformanceMetricsPanel 
              powerOutput={vehicleData.baseHorsepower}
              torqueOutput={vehicleData.baseTorque}
              airTemp={environmentalData.airTemp}
              humidity={environmentalData.humidity}
              atmosphericPressure={environmentalData.atmosphericPressure}
              altitude={environmentalData.altitude}
              windSpeed={environmentalData.windSpeed}
              airDensity={environmentalData.airDensity}
            />
          </div>
          
          <DrivingDynamicsAnalyzer 
            corneringData={telemetryData.corneringData}
            accelerationData={telemetryData.accelerationData}
            brakingData={telemetryData.brakingData}
            drivingStyle={drivingStyle}
          />
        </div>
      )}
    </div>
  );
};

export default EnthusiastDriveData;